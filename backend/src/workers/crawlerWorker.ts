import { Worker, Job } from 'bullmq';
import mongoose from 'mongoose';
import { redisConnection } from '../config/redis.js';
import { crawlPage } from '../services/crawler.service.js';
import { type CrawlerJobData } from '../queues/crawlerQueue.js';
import CrawlResult from '../models/CrawlResult.js';

export const initCrawlerWorker = () => {
  const worker = new Worker<CrawlerJobData>(
    'CrawlerQueue',
    async (job: Job<CrawlerJobData>) => {
      console.log(`🚀 [Job ${job.id}] Starting crawl → ${job.data.url}`);

      const result = await crawlPage(job.data.url);

      if (result.error) {
        console.warn(`⚠️  [Job ${job.id}] Crawl completed with error: ${result.error}`);
      } else {
        console.log(
          `✅ [Job ${job.id}] Crawl complete → ${job.data.url} | Status: ${result.statusCode} | Time: ${result.loadTimeMs}ms | Title: "${result.title}"`
        );
      }

      // Persist the crawl result to MongoDB
      try {
        await CrawlResult.create({
          projectId: new mongoose.Types.ObjectId(job.data.projectId),
          userId: new mongoose.Types.ObjectId(job.data.userId),
          url: result.url,
          statusCode: result.statusCode,
          title: result.title,
          metaDescription: result.metaDescription,
          h1Count: result.h1Count,
          wordCount: result.wordCount,
          links: result.links,
          loadTimeMs: result.loadTimeMs,
          error: result.error,
        });
        console.log(`💾 [Job ${job.id}] CrawlResult persisted to MongoDB for project ${job.data.projectId}`);
      } catch (dbError: any) {
        console.error(`❌ [Job ${job.id}] Failed to persist CrawlResult: ${dbError.message}`);
      }

      return result;
    },
    {
      connection: redisConnection,
      concurrency: 5,
    }
  );

  worker.on('completed', (job) => {
    console.log(`📦 Job ${job.id} completed successfully.`);
  });

  worker.on('failed', (job, err) => {
    console.error(`❌ Job ${job?.id} failed: ${err.message}`);
  });

  console.log('🔧 Crawler Worker is listening on "CrawlerQueue"');

  return worker;
};
