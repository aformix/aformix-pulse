import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import dotenv from 'dotenv';
import mongoose from 'mongoose';
import authRoutes from './routes/auth.routes.js';
import projectRoutes from './routes/project.routes.js';
import crawlResultRoutes from './routes/crawlResult.routes.js';
import userRoutes from './routes/user.routes.js';
import { initCrawlerWorker } from './workers/crawlerWorker.js';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 5000;
const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/aformix_pulse';

const normalizeOrigin = (value: string) => value.replace(/\/+$/, '');
const parseAllowedOrigins = (value?: string) => {
  const defaults = [
    'http://localhost:5173',
    'http://localhost:5174',
    'http://127.0.0.1:5173',
    'http://127.0.0.1:5174',
  ];

  if (!value) {
    return defaults;
  }

  return [...new Set([...value.split(',').map((item) => item.trim()).filter(Boolean), ...defaults].map(normalizeOrigin))];
};

const allowedOrigins = new Set(parseAllowedOrigins(process.env.FRONTEND_URL));

// Security Middlewares
// `helmet`'s types may be non-callable with certain TS/module settings.
// Cast to `any` to keep the middleware call-compatible across environments.
app.use((helmet as any)());
app.use(cors({
  origin: (origin, callback) => {
    if (!origin) {
      callback(null, true);
      return;
    }

    const normalizedOrigin = normalizeOrigin(origin);
    callback(null, allowedOrigins.has(normalizedOrigin));
  },
  credentials: true,
}));
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true }));

// ─── Routes ────────────────────────────────────────────────────────────────

app.get('/api/health', (_req, res) => {
  res.status(200).json({ status: 'ok', message: 'Aformix Pulse API is running' });
});

app.use('/api/auth', authRoutes);
app.use('/api/projects', projectRoutes);
app.use('/api/crawl-results', crawlResultRoutes);
app.use('/api/user', userRoutes);

// 404 Handler
app.use((_req, res) => {
  res.status(404).json({ message: 'Route not found' });
});

// ─── Bootstrap ─────────────────────────────────────────────────────────────

const start = async () => {
  try {
    await mongoose.connect(MONGODB_URI);
    console.log('✅ Connected to MongoDB');
  } catch (error) {
    console.warn('⚠️ MongoDB is unavailable; continuing without database connection:', error);
  }

  try {
    // Start BullMQ Crawler Worker
    initCrawlerWorker();
    console.log('✅ Crawler Worker initialized');
  } catch (error) {
    console.warn('⚠️ Crawler worker could not be started:', error);
  }

  app.listen(PORT, () => {
    console.log(`🚀 Server is running on http://localhost:${PORT}`);
  });
};

start();
