import { Router } from 'express';
import analyticsRoutes from './analytics.routes.js';
import assignmentRoutes from './assignment.routes.js';
import authRoutes from './auth.routes.js';
import groupRoutes from './group.routes.js';
import studentRoutes from './student.routes.js';
import submissionRoutes from './submission.routes.js';

const router = Router();

router.get('/health', (_req, res) => res.json({ success: true, status: 'ok' }));
router.use('/auth', authRoutes);
router.use('/groups', groupRoutes);
router.use('/students', studentRoutes);
router.use('/assignments', assignmentRoutes);
router.use('/assignments', submissionRoutes);
router.use('/analytics', analyticsRoutes);

export default router;
