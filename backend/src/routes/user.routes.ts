import express from 'express';
import { updateProfile, updatePassword, deleteAccount } from '../controllers/user.controller.js';
import { requireAuth } from '../middlewares/auth.js';

const router = express.Router();

router.use(requireAuth);

router.put('/profile', updateProfile);
router.put('/password', updatePassword);
router.delete('/account', deleteAccount);

export default router;
