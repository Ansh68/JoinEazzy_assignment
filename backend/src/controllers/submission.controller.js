import * as Assignment from '../models/assignment.model.js';
import * as Group from '../models/group.model.js';
import * as Submission from '../models/submission.model.js';
import * as User from '../models/user.model.js';
import { ApiError } from '../utils/ApiError.js';
import { asyncHandler } from '../utils/asyncHandler.js';
import { throwConflictOnDuplicate } from '../utils/duplicate.js';
import { getStatus, getTargetedGroupIds, isVisibleToGroup, toPercent } from '../utils/progress.js';

// A student confirms on behalf of their whole group. One confirmation per group per assignment.
export const confirmSubmission = asyncHandler(async (req, res) => {
  const { id: assignmentId } = req.params;

  const group = await Group.findByMemberId(req.user.id);
  if (!group) throw ApiError.badRequest('Create or join a group before confirming a submission');

  const assignment = await Assignment.findById(assignmentId);
  if (!assignment || !isVisibleToGroup(assignment, group.id)) {
    throw ApiError.notFound('Assignment not found');
  }

  const alreadyConfirmed = 'Your group has already confirmed this assignment';
  if (await Submission.findOne({ assignmentId, groupId: group.id })) throw ApiError.conflict(alreadyConfirmed);

  try {
    const submission = await Submission.create({ assignmentId, groupId: group.id, confirmedBy: req.user.id });
    res.status(201).json({ success: true, submission, status: 'submitted' });
  } catch (error) {
    // Two members confirming at the same moment: the database constraint lets only one through.
    throwConflictOnDuplicate(error, alreadyConfirmed);
  }
});

// Admin view of one assignment: every targeted group and every student in them.
export const getAssignmentSubmissions = asyncHandler(async (req, res) => {
  const assignment = await Assignment.findById(req.params.id);
  if (!assignment) throw ApiError.notFound('Assignment not found');

  const [groups, submissions, students] = await Promise.all([
    Group.findAll(),
    Submission.findByAssignmentId(assignment.id),
    User.findAllStudents(),
  ]);

  const submissionByGroup = new Map(submissions.map((s) => [s.groupId, s]));
  const targetedIds = new Set(getTargetedGroupIds(assignment, groups));

  const groupRows = groups
    .filter((group) => targetedIds.has(group.id))
    .map((group) => {
      const submission = submissionByGroup.get(group.id);
      return {
        id: group.id,
        name: group.name,
        memberCount: group.members.length,
        status: getStatus(assignment, submission),
        confirmedAt: submission?.confirmedAt ?? null,
        confirmedBy: submission?.confirmedBy ?? null,
        members: group.members,
      };
    });

  // Each student shows their group's status; confirmedByThisStudent marks who clicked confirm.
  const studentRows = groupRows.flatMap((group) =>
    group.members.map((member) => ({
      id: member.id,
      name: member.name,
      email: member.email,
      studentId: member.studentId,
      group: { id: group.id, name: group.name },
      status: group.status,
      confirmedByThisStudent: group.confirmedBy?.id === member.id,
    })),
  );

  // Assignments for everyone also reach students who haven't formed a group yet.
  if (assignment.targetType === 'all') {
    const groupedIds = new Set(groups.flatMap((group) => group.members.map((member) => member.id)));
    students
      .filter((student) => !groupedIds.has(student.id))
      .forEach((student) =>
        studentRows.push({
          id: student.id,
          name: student.name,
          email: student.email,
          studentId: student.studentId,
          group: null,
          status: 'no_group',
          confirmedByThisStudent: false,
        }),
      );
  }

  const submittedGroups = groupRows.filter((group) => group.status === 'submitted').length;

  res.json({
    success: true,
    assignment,
    summary: {
      targetedGroups: groupRows.length,
      submittedGroups,
      pendingGroups: groupRows.length - submittedGroups,
      completionRate: toPercent(submittedGroups, groupRows.length),
    },
    groups: groupRows,
    students: studentRows,
  });
});
