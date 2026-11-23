import * as User from '../models/user.model.js';
import { asyncHandler } from '../utils/asyncHandler.js';

// Students without a group, used by the "add member" search box.
export const searchStudents = asyncHandler(async (req, res) => {
  const students = await User.searchStudentsWithoutGroup(req.query.q);
  res.json({ success: true, students });
});
