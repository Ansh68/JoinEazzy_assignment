import * as Assignment from '../models/assignment.model.js';
import * as Group from '../models/group.model.js';
import * as Submission from '../models/submission.model.js';
import { ApiError } from '../utils/ApiError.js';
import { asyncHandler } from '../utils/asyncHandler.js';
import { getStatus, isVisibleToGroup } from '../utils/progress.js';

// Students only need their own group's progress, not who else the assignment targets.
const toStudentView = ({ targets, ...assignment }, submission) => ({
  ...assignment,
  status: getStatus(assignment, submission),
  submission: submission
    ? { confirmedAt: submission.confirmedAt, confirmedBy: submission.confirmedBy }
    : null,
});

// Throws unless every selected group exists.
const assertGroupsExist = async (groupIds) => {
  if (groupIds.length === 0) return;

  const found = await Group.findByIds(groupIds);
  if (found.length !== groupIds.length) throw ApiError.badRequest('One or more selected groups do not exist');
};

// Loads the logged-in student's group and its submissions.
const getStudentContext = async (userId) => {
  const group = await Group.findByMemberId(userId);
  const submissions = group ? await Submission.findByGroupId(group.id) : [];
  return { group, submissions };
};

export const listAssignments = asyncHandler(async (req, res) => {
  if (req.user.role === 'admin') {
    return res.json({ success: true, assignments: await Assignment.findAll() });
  }

  // The assignment list and the student's group don't depend on each other, so fetch them together.
  const [assignments, { group, submissions }] = await Promise.all([
    Assignment.findAll(),
    getStudentContext(req.user.id),
  ]);
  const submissionByAssignment = new Map(submissions.map((s) => [s.assignmentId, s]));

  const visible = assignments
    .filter((assignment) => isVisibleToGroup(assignment, group?.id))
    .map((assignment) => toStudentView(assignment, submissionByAssignment.get(assignment.id)));

  res.json({ success: true, assignments: visible });
});

export const getAssignment = asyncHandler(async (req, res) => {
  const isAdmin = req.user.role === 'admin';

  const [assignment, studentContext] = await Promise.all([
    Assignment.findById(req.params.id),
    isAdmin ? null : getStudentContext(req.user.id),
  ]);
  if (!assignment) throw ApiError.notFound('Assignment not found');

  if (isAdmin) {
    return res.json({ success: true, assignment });
  }

  const { group, submissions } = studentContext;
  // Same response as a missing assignment, so students can't discover ones meant for other groups.
  if (!isVisibleToGroup(assignment, group?.id)) throw ApiError.notFound('Assignment not found');

  const submission = submissions.find((s) => s.assignmentId === assignment.id);
  res.json({ success: true, assignment: toStudentView(assignment, submission) });
});

export const createAssignment = asyncHandler(async (req, res) => {
  await assertGroupsExist(req.body.groupIds);

  const assignment = await Assignment.create({ ...req.body, createdBy: req.user.id });
  res.status(201).json({ success: true, assignment });
});

export const updateAssignment = asyncHandler(async (req, res) => {
  if (!(await Assignment.findById(req.params.id))) throw ApiError.notFound('Assignment not found');
  await assertGroupsExist(req.body.groupIds);

  const assignment = await Assignment.update(req.params.id, req.body);
  res.json({ success: true, assignment });
});

export const deleteAssignment = asyncHandler(async (req, res) => {
  if (!(await Assignment.findById(req.params.id))) throw ApiError.notFound('Assignment not found');

  await Assignment.remove(req.params.id);
  res.json({ success: true, message: 'Assignment deleted' });
});
