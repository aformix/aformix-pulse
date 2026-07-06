import { Request, Response } from 'express';
import mongoose from 'mongoose';
import CrawlResult from '../models/CrawlResult.js';
import Project from '../models/Project.js';

const isValidObjectId = (id: string) => mongoose.Types.ObjectId.isValid(id);

// ─── Get Crawl Results for a Project ─────────────────────────────────────────

export const getCrawlResults = async (req: any, res: Response): Promise<void> => {
  try {
    const { id: projectId } = req.params;
    const page = Math.max(1, parseInt(req.query.page as string) || 1);
    const limit = Math.min(50, parseInt(req.query.limit as string) || 20);
    const skip = (page - 1) * limit;

    if (!isValidObjectId(projectId)) {
      res.status(400).json({ message: 'Invalid project ID' });
      return;
    }

    // Ownership check via project lookup
    const project = await Project.findOne({ _id: projectId, userId: req.user.userId }).lean();
    if (!project) {
      res.status(404).json({ message: 'Project not found' });
      return;
    }

    const [results, total] = await Promise.all([
      CrawlResult.find({ projectId })
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limit)
        .select('-links') // Exclude the large links array from list view
        .lean(),
      CrawlResult.countDocuments({ projectId }),
    ]);

    res.status(200).json({
      results,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
      },
    });
  } catch (error) {
    console.error('Get Crawl Results Error:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
};

// ─── Get Single Crawl Result ──────────────────────────────────────────────────

export const getCrawlResult = async (req: any, res: Response): Promise<void> => {
  try {
    const { resultId } = req.params;

    if (!isValidObjectId(resultId)) {
      res.status(400).json({ message: 'Invalid result ID' });
      return;
    }

    const result = await CrawlResult.findOne({ _id: resultId, userId: req.user.userId }).lean();

    if (!result) {
      res.status(404).json({ message: 'Crawl result not found' });
      return;
    }

    res.status(200).json({ result });
  } catch (error) {
    console.error('Get Crawl Result Error:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
};
