import { Router } from 'express';
import { searchStudents } from '../controllers/student.controller.js';
import { authenticate } from '../middleware/authenticate.js';
import { authorize } from '../middleware/authorize.js';
import { validate } from '../middleware/validate.js';
import { searchStudentsSchema } from '../validators/student.validator.js';

const router = Router();

router.get(
  '/search',
  authenticate,
  authorize('student'),
  validate(searchStudentsSchema, 'query'),
  searchStudents,
);

export default router;
