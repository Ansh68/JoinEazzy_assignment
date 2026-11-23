import { Router } from 'express';
import {
  createAssignment,
  deleteAssignment,
  getAssignment,
  listAssignments,
  updateAssignment,
} from '../controllers/assignment.controller.js';
import { authenticate } from '../middleware/authenticate.js';
import { authorize } from '../middleware/authorize.js';
import { validate } from '../middleware/validate.js';
import {
  assignmentParamsSchema,
  createAssignmentSchema,
  updateAssignmentSchema,
} from '../validators/assignment.validator.js';

const router = Router();

router.use(authenticate);

// Admins see every assignment; students only see the ones meant for their group.
router.get('/', listAssignments);
router.get('/:id', validate(assignmentParamsSchema, 'params'), getAssignment);

router.post('/', authorize('admin'), validate(createAssignmentSchema), createAssignment);
router.put(
  '/:id',
  authorize('admin'),
  validate(assignmentParamsSchema, 'params'),
  validate(updateAssignmentSchema),
  updateAssignment,
);
router.delete('/:id', authorize('admin'), validate(assignmentParamsSchema, 'params'), deleteAssignment);

export default router;
