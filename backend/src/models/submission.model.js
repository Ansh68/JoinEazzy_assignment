import { supabase } from '../config/supabase.js';
import { unwrap } from '../utils/unwrap.js';

// All confirmations a group has made, with the name of the student who confirmed.
export const findByGroupId = async (groupId) =>
  unwrap(
    await supabase
      .from('submissions')
      .select('assignmentId:assignment_id, confirmedAt:confirmed_at, confirmedBy:users ( id, name )')
      .eq('group_id', groupId),
  );
