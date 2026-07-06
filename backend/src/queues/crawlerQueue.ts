import { Queue } from 'bullmq';
import { redisConnection } from '../config/redis.js';

export interface CrawlerJobData {
  url: string;
  projectId: string;
  userId: string;
}

export const crawlerQueue = new Queue<CrawlerJobData>('CrawlerQueue', {
  connection: redisConnection,
  defaultJobOptions: {
    attempts: 3,
    backoff: {
      type: 'exponential',
      delay: 5000, // 5s → 10s → 20s
    },
    removeOnComplete: 100,
    removeOnFail: 500,
  },
});

export const queueCrawlJob = async (data: CrawlerJobData) => {
  return crawlerQueue.add('crawl', data);
};
