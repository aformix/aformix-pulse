import { Request, Response } from 'express';
import mongoose from 'mongoose';
import Project from '../models/Project.js';
import CrawlResult from '../models/CrawlResult.js';
import { queueCrawlJob } from '../queues/crawlerQueue.js';

// ─── Helper ─────────────────────────────────────────────────────────────────

const isValidObjectId = (id: string) => mongoose.Types.ObjectId.isValid(id);

// ─── Create Project ──────────────────────────────────────────────────────────

export const createProject = async (req: any, res: Response): Promise<void> => {
  try {
    const { name, domain, crawlFrequency } = req.body;

    if (!name || !domain) {
      res.status(400).json({ message: 'Name and domain are required' });
      return;
    }

    // Normalize domain — ensure it has a protocol
    let normalizedDomain = domain.trim();
    if (!/^https?:\/\//i.test(normalizedDomain)) {
      normalizedDomain = `https://${normalizedDomain}`;
    }

    const project = await Project.create({
      userId: req.user.userId,
      name: name.trim(),
      domain: normalizedDomain,
      crawlFrequency: crawlFrequency || 'manual',
      status: 'active',
    });

    res.status(201).json({ message: 'Project created successfully', project });
  } catch (error) {
    console.error('Create Project Error:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
};

// ─── Get All Projects ────────────────────────────────────────────────────────

export const getProjects = async (req: any, res: Response): Promise<void> => {
  try {
    const projects = await Project.find({ userId: req.user.userId })
      .sort({ createdAt: -1 })
      .lean();

    res.status(200).json({ projects });
  } catch (error) {
    console.error('Get Projects Error:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
};

// ─── Get Single Project ──────────────────────────────────────────────────────

export const getProject = async (req: any, res: Response): Promise<void> => {
  try {
    const { id } = req.params;

    if (!isValidObjectId(id)) {
      res.status(400).json({ message: 'Invalid project ID' });
      return;
    }

    const project = await Project.findOne({ _id: id, userId: req.user.userId }).lean();

    if (!project) {
      res.status(404).json({ message: 'Project not found' });
      return;
    }

    res.status(200).json({ project });
  } catch (error) {
    console.error('Get Project Error:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
};

// ─── Update Project ──────────────────────────────────────────────────────────

export const updateProject = async (req: any, res: Response): Promise<void> => {
  try {
    const { id } = req.params;

    if (!isValidObjectId(id)) {
      res.status(400).json({ message: 'Invalid project ID' });
      return;
    }

    const { name, domain, status, crawlFrequency } = req.body;
    const allowedStatuses = ['active', 'paused', 'archived'];
    const allowedFrequencies = ['daily', 'weekly', 'manual'];

    if (status && !allowedStatuses.includes(status)) {
      res.status(400).json({ message: `Status must be one of: ${allowedStatuses.join(', ')}` });
      return;
    }
    if (crawlFrequency && !allowedFrequencies.includes(crawlFrequency)) {
      res.status(400).json({ message: `crawlFrequency must be one of: ${allowedFrequencies.join(', ')}` });
      return;
    }

    const updatePayload: Record<string, any> = {};
    if (name) updatePayload.name = name.trim();
    if (domain) {
      let normalizedDomain = domain.trim();
      if (!/^https?:\/\//i.test(normalizedDomain)) normalizedDomain = `https://${normalizedDomain}`;
      updatePayload.domain = normalizedDomain;
    }
    if (status) updatePayload.status = status;
    if (crawlFrequency) updatePayload.crawlFrequency = crawlFrequency;

    const project = await Project.findOneAndUpdate(
      { _id: id, userId: req.user.userId },
      { $set: updatePayload },
      { new: true, runValidators: true }
    );

    if (!project) {
      res.status(404).json({ message: 'Project not found' });
      return;
    }

    res.status(200).json({ message: 'Project updated successfully', project });
  } catch (error) {
    console.error('Update Project Error:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
};

// ─── Delete Project ──────────────────────────────────────────────────────────

export const deleteProject = async (req: any, res: Response): Promise<void> => {
  try {
    const { id } = req.params;

    if (!isValidObjectId(id)) {
      res.status(400).json({ message: 'Invalid project ID' });
      return;
    }

    const project = await Project.findOneAndDelete({ _id: id, userId: req.user.userId });

    if (!project) {
      res.status(404).json({ message: 'Project not found' });
      return;
    }

    // Cascade delete all associated crawl results
    await CrawlResult.deleteMany({ projectId: id });

    res.status(200).json({ message: 'Project and all associated data deleted successfully' });
  } catch (error) {
    console.error('Delete Project Error:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
};

// ─── Trigger Crawl ───────────────────────────────────────────────────────────

export const triggerCrawl = async (req: any, res: Response): Promise<void> => {
  try {
    const { id } = req.params;

    if (!isValidObjectId(id)) {
      res.status(400).json({ message: 'Invalid project ID' });
      return;
    }

    const project = await Project.findOne({ _id: id, userId: req.user.userId });

    if (!project) {
      res.status(404).json({ message: 'Project not found' });
      return;
    }

    if (project.status === 'archived') {
      res.status(400).json({ message: 'Cannot crawl an archived project. Restore it first.' });
      return;
    }

    const job = await queueCrawlJob({
      url: project.domain,
      projectId: project.id,
      userId: req.user.userId,
    });

    // Update last crawled timestamp immediately when the crawl is queued
    project.lastCrawledAt = new Date();
    await project.save();

    res.status(202).json({
      message: 'Crawl job queued successfully',
      jobId: job.id,
      projectId: project.id,
    });
  } catch (error) {
    console.error('Trigger Crawl Error:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
};
