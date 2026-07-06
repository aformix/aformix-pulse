import { Router } from 'express';
import { getCrawlResult } from '../controllers/crawlResult.controller.js';
import { requireAuth } from '../middlewares/auth.js';

const router = Router();

router.use(requireAuth);

// GET /api/crawl-results/:resultId
router.get('/:resultId', getCrawlResult);

export default router;
