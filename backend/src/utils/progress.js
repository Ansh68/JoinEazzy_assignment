// Shared helpers for deciding who an assignment is for and how far each group has got.

export const toPercent = (done, total) => (total === 0 ? 0 : Math.round((done / total) * 100));

// Ids of the groups an assignment is meant for.
export const getTargetedGroupIds = (assignment, groups) =>
  assignment.targetType === 'all'
    ? groups.map((group) => group.id)
    : assignment.targets.map((group) => group.id).filter((id) => groups.some((g) => g.id === id));

// A student's group sees an assignment if it is for everyone or lists their group.
export const isVisibleToGroup = (assignment, groupId) =>
  assignment.targetType === 'all' || assignment.targets.some((group) => group.id === groupId);

// submitted → the group has confirmed; overdue → past the due date and not confirmed.
export const getStatus = (assignment, submission) => {
  if (submission) return 'submitted';
  return new Date(assignment.dueDate) < new Date() ? 'overdue' : 'pending';
};

// Per-assignment and per-group completion numbers, built from three plain lists.
export const buildProgress = ({ groups, assignments, submissions }) => {
  const submittedKeys = new Set(submissions.map((s) => `${s.assignmentId}:${s.groupId}`));
  const now = new Date();

  const groupTotals = new Map(
    groups.map((group) => [
      group.id,
      { id: group.id, name: group.name, memberCount: group.members.length, assigned: 0, submitted: 0, overdue: 0 },
    ]),
  );

  const assignmentStats = assignments.map((assignment) => {
    const targetedIds = getTargetedGroupIds(assignment, groups);
    let submittedGroups = 0;

    for (const groupId of targetedIds) {
      const totals = groupTotals.get(groupId);
      totals.assigned += 1;

      if (submittedKeys.has(`${assignment.id}:${groupId}`)) {
        totals.submitted += 1;
        submittedGroups += 1;
      } else if (new Date(assignment.dueDate) < now) {
        totals.overdue += 1;
      }
    }

    return {
      id: assignment.id,
      title: assignment.title,
      dueDate: assignment.dueDate,
      targetedGroups: targetedIds.length,
      submittedGroups,
      pendingGroups: targetedIds.length - submittedGroups,
      completionRate: toPercent(submittedGroups, targetedIds.length),
    };
  });

  const groupStats = [...groupTotals.values()].map((totals) => ({
    ...totals,
    pending: totals.assigned - totals.submitted,
    completionRate: toPercent(totals.submitted, totals.assigned),
  }));

  return { assignmentStats, groupStats };
};
