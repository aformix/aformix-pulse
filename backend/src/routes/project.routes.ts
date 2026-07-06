import { Router } from 'express';
import {
  createProject,
  getProjects,
  getProject,
  updateProject,
  deleteProject,
  triggerCrawl,
} from '../controllers/project.controller.js';
import { getCrawlResults, getCrawlResult } from '../controllers/crawlResult.controller.js';
import { requireAuth } from '../middlewares/auth.js';

const router = Router();

// All project routes require authentication
router.use(requireAuth);

router.post('/', createProject);
router.get('/', getProjects);
router.post('/:id/crawl', triggerCrawl);
router.get('/:id/crawl-results', getCrawlResults);
router.get('/:id', getProject);
router.put('/:id', updateProject);
router.delete('/:id', deleteProject);

export default router;
