import { Router } from 'express';
import {
  getAssignmentAnalytics,
  getGroupAnalytics,
  getMyProgress,
  getOverview,
} from '../controllers/analytics.controller.js';
import { authenticate } from '../middleware/authenticate.js';
import { authorize } from '../middleware/authorize.js';

const router = Router();

router.use(authenticate);

router.get('/overview', authorize('admin'), getOverview);
router.get('/assignments', authorize('admin'), getAssignmentAnalytics);
router.get('/groups', authorize('admin'), getGroupAnalytics);
router.get('/me', authorize('student'), getMyProgress);

export default router;
