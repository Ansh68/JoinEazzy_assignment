import * as Assignment from '../models/assignment.model.js';
import * as Group from '../models/group.model.js';
import * as Submission from '../models/submission.model.js';
import * as User from '../models/user.model.js';
import { asyncHandler } from '../utils/asyncHandler.js';
import { buildProgress, getStatus, isVisibleToGroup, toPercent } from '../utils/progress.js';

const loadProgress = async () => {
  const [groups, assignments, submissions] = await Promise.all([
    Group.findAll(),
    Assignment.findAll(),
    Submission.findAll(),
  ]);
  return { groups, assignments, ...buildProgress({ groups, assignments, submissions }) };
};

const sum = (items, key) => items.reduce((total, item) => total + item[key], 0);

export const getOverview = asyncHandler(async (_req, res) => {
  const [{ groups, assignments, assignmentStats }, students] = await Promise.all([
    loadProgress(),
    User.findAllStudents(),
  ]);

  const expected = sum(assignmentStats, 'targetedGroups');
  const submitted = sum(assignmentStats, 'submittedGroups');
  const groupedStudents = groups.reduce((total, group) => total + group.members.length, 0);

  res.json({
    success: true,
    overview: {
      totalStudents: students.length,
      studentsInGroups: groupedStudents,
      studentsWithoutGroup: students.length - groupedStudents,
      totalGroups: groups.length,
      totalAssignments: assignments.length,
      expectedSubmissions: expected,
      confirmedSubmissions: submitted,
      pendingSubmissions: expected - submitted,
      completionRate: toPercent(submitted, expected),
    },
  });
});

export const getAssignmentAnalytics = asyncHandler(async (_req, res) => {
  const { assignmentStats } = await loadProgress();
  res.json({ success: true, assignments: assignmentStats });
});

// Groups ranked by completion rate, best first.
export const getGroupAnalytics = asyncHandler(async (_req, res) => {
  const { groupStats } = await loadProgress();
  const ranked = [...groupStats].sort(
    (a, b) => b.completionRate - a.completionRate || a.name.localeCompare(b.name),
  );
  res.json({ success: true, groups: ranked });
});

// A student's own group progress, for the student dashboard.
export const getMyProgress = asyncHandler(async (req, res) => {
  const group = await Group.findByMemberId(req.user.id);
  if (!group) {
    return res.json({
      success: true,
      progress: { group: null, total: 0, submitted: 0, pending: 0, overdue: 0, completionRate: 0 },
    });
  }

  const [assignments, submissions] = await Promise.all([
    Assignment.findAll(),
    Submission.findByGroupId(group.id),
  ]);
  const submissionByAssignment = new Map(submissions.map((s) => [s.assignmentId, s]));

  const statuses = assignments
    .filter((assignment) => isVisibleToGroup(assignment, group.id))
    .map((assignment) => getStatus(assignment, submissionByAssignment.get(assignment.id)));

  const count = (status) => statuses.filter((s) => s === status).length;

  res.json({
    success: true,
    progress: {
      group: { id: group.id, name: group.name },
      total: statuses.length,
      submitted: count('submitted'),
      pending: count('pending'),
      overdue: count('overdue'),
      completionRate: toPercent(count('submitted'), statuses.length),
    },
  });
});
