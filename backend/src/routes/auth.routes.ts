import { Router } from 'express';
import { register, login, googleAuth, refresh, getMe } from '../controllers/auth.controller.js';
import { requireAuth } from '../middlewares/auth.js';

const router = Router();

router.post('/register', register);
router.post('/login', login);
router.post('/google', googleAuth);
router.post('/refresh', refresh);
router.get('/me', requireAuth, getMe);

export default router;
