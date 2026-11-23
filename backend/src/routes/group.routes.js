import { Router } from 'express';
import {
  addMember,
  createGroup,
  getMyGroup,
  leaveGroup,
  listGroups,
  removeMember,
} from '../controllers/group.controller.js';
import { authenticate } from '../middleware/authenticate.js';
import { authorize } from '../middleware/authorize.js';
import { validate } from '../middleware/validate.js';
import {
  addMemberSchema,
  createGroupSchema,
  groupParamsSchema,
  memberParamsSchema,
} from '../validators/group.validator.js';

const router = Router();

router.use(authenticate);

router.get('/', authorize('admin'), listGroups);
router.get('/me', authorize('student'), getMyGroup);
router.post('/', authorize('student'), validate(createGroupSchema), createGroup);

router.post(
  '/:id/members',
  authorize('student'),
  validate(groupParamsSchema, 'params'),
  validate(addMemberSchema),
  addMember,
);
router.delete(
  '/:id/members/:userId',
  authorize('student'),
  validate(memberParamsSchema, 'params'),
  removeMember,
);
router.post('/:id/leave', authorize('student'), validate(groupParamsSchema, 'params'), leaveGroup);

export default router;
