import { supabase } from '../config/supabase.js';
import { unwrap } from '../utils/unwrap.js';

// A confirmation, with the name of the student who made it.
const SUBMISSION_COLUMNS = `
  assignmentId:assignment_id, groupId:group_id, confirmedAt:confirmed_at,
  confirmedBy:users ( id, name )
`;

export const findAll = async () => unwrap(await supabase.from('submissions').select(SUBMISSION_COLUMNS));

export const findByGroupId = async (groupId) =>
  unwrap(await supabase.from('submissions').select(SUBMISSION_COLUMNS).eq('group_id', groupId));

export const findByAssignmentId = async (assignmentId) =>
  unwrap(await supabase.from('submissions').select(SUBMISSION_COLUMNS).eq('assignment_id', assignmentId));

export const findOne = async ({ assignmentId, groupId }) =>
  unwrap(
    await supabase
      .from('submissions')
      .select('id')
      .eq('assignment_id', assignmentId)
      .eq('group_id', groupId)
      .maybeSingle(),
  );

export const create = async ({ assignmentId, groupId, confirmedBy }) =>
  unwrap(
    await supabase
      .from('submissions')
      .insert({ assignment_id: assignmentId, group_id: groupId, confirmed_by: confirmedBy })
      .select(SUBMISSION_COLUMNS)
      .single(),
  );
