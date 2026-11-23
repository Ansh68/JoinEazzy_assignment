import { Router } from 'express';
import { confirmSubmission, getAssignmentSubmissions } from '../controllers/submission.controller.js';
import { authenticate } from '../middleware/authenticate.js';
import { authorize } from '../middleware/authorize.js';
import { validate } from '../middleware/validate.js';
import { assignmentParamsSchema } from '../validators/assignment.validator.js';
import { confirmSubmissionSchema } from '../validators/submission.validator.js';

// Mounted at /api/assignments, next to the assignment routes.
const router = Router();

router.use(authenticate);

router.post(
  '/:id/confirm',
  authorize('student'),
  validate(assignmentParamsSchema, 'params'),
  validate(confirmSubmissionSchema),
  confirmSubmission,
);
router.get(
  '/:id/submissions',
  authorize('admin'),
  validate(assignmentParamsSchema, 'params'),
  getAssignmentSubmissions,
);

export default router;
