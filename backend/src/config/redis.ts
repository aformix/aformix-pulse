import dotenv from 'dotenv';

dotenv.config();

const REDIS_URI = process.env.REDIS_URI || 'redis://localhost:6379';

// Parse the Redis URI into a plain options object.
// BullMQ and ioredis both accept this format, avoiding dual-version type conflicts.
const parseRedisUrl = (uri: string) => {
  try {
    const url = new URL(uri);
    const isTls = url.protocol === 'rediss:';
    return {
      host: url.hostname || 'localhost',
      port: parseInt(url.port || '6379', 10),
      password: url.password || undefined,
      db: url.pathname ? parseInt(url.pathname.replace('/', '') || '0', 10) : 0,
      maxRetriesPerRequest: null as null, // Required by BullMQ
      ...(isTls && { tls: {} }), // Enable TLS for rediss://
    };
  } catch {
    return {
      host: 'localhost',
      port: 6379,
      maxRetriesPerRequest: null as null,
    };
  }
};

export const redisConnection = parseRedisUrl(REDIS_URI);

export const REDIS_URI_STRING = REDIS_URI;
