import { supabase } from '../config/supabase.js';
import { unwrap } from '../utils/unwrap.js';

// An assignment plus the groups it is targeted at (empty when it targets everyone).
const ASSIGNMENT_WITH_TARGETS = `
  id, title, description, dueDate:due_date, onedriveLink:onedrive_link,
  targetType:target_type, createdAt:created_at, updatedAt:updated_at,
  targets:assignment_targets ( group:groups ( id, name ) )
`;

const toAssignment = ({ targets, ...assignment }) => ({
  ...assignment,
  targets: targets.map(({ group }) => group),
});

export const findAll = async () => {
  const rows = unwrap(
    await supabase.from('assignments').select(ASSIGNMENT_WITH_TARGETS).order('due_date'),
  );
  return rows.map(toAssignment);
};

export const findById = async (id) => {
  const row = unwrap(
    await supabase.from('assignments').select(ASSIGNMENT_WITH_TARGETS).eq('id', id).maybeSingle(),
  );
  return row && toAssignment(row);
};

const addTargets = async (assignmentId, groupIds) => {
  if (groupIds.length === 0) return;

  const rows = groupIds.map((groupId) => ({ assignment_id: assignmentId, group_id: groupId }));
  unwrap(await supabase.from('assignment_targets').insert(rows));
};

const toColumns = ({ title, description, dueDate, onedriveLink, targetType }) => ({
  title,
  description,
  due_date: dueDate,
  onedrive_link: onedriveLink,
  target_type: targetType,
});

export const remove = async (id) => unwrap(await supabase.from('assignments').delete().eq('id', id));

// supabase-js has no transactions: if saving the targets fails, delete the new assignment again.
export const create = async ({ groupIds, createdBy, ...fields }) => {
  const { id } = unwrap(
    await supabase
      .from('assignments')
      .insert({ ...toColumns(fields), created_by: createdBy })
      .select('id')
      .single(),
  );

  try {
    await addTargets(id, groupIds);
  } catch (error) {
    await remove(id);
    throw error;
  }

  return findById(id);
};

// Targets are replaced as a whole: clear the old ones, then insert the new ones.
export const update = async (id, { groupIds, ...fields }) => {
  unwrap(
    await supabase
      .from('assignments')
      .update({ ...toColumns(fields), updated_at: new Date().toISOString() })
      .eq('id', id),
  );

  unwrap(await supabase.from('assignment_targets').delete().eq('assignment_id', id));
  await addTargets(id, groupIds);

  return findById(id);
};
