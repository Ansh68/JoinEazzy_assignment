import { supabase } from '../config/supabase.js';
import { unwrap } from '../utils/unwrap.js';

// A group with its members and each member's user profile in one request.
const GROUP_WITH_MEMBERS = `
  id, name, createdBy:created_by, createdAt:created_at,
  members:group_members (
    role, joinedAt:joined_at,
    user:users ( id, name, email, studentId:student_id )
  )
`;

// Flattens members to { id, name, email, studentId, role, joinedAt }, earliest joiner first.
const toGroup = ({ members, ...group }) => ({
  ...group,
  members: members
    .map(({ user, ...membership }) => ({ ...user, ...membership }))
    .sort((a, b) => a.joinedAt.localeCompare(b.joinedAt)),
});

export const findById = async (id) => {
  const group = unwrap(
    await supabase.from('groups').select(GROUP_WITH_MEMBERS).eq('id', id).maybeSingle(),
  );
  return group && toGroup(group);
};

export const findAll = async () => {
  const groups = unwrap(
    await supabase.from('groups').select(GROUP_WITH_MEMBERS).order('created_at', { ascending: false }),
  );
  return groups.map(toGroup);
};

export const findByName = async (name) =>
  unwrap(await supabase.from('groups').select('id').ilike('name', name).maybeSingle());

// Returns the group the user belongs to (with members), or null.
export const findByMemberId = async (userId) => {
  const membership = unwrap(
    await supabase.from('group_members').select('groupId:group_id').eq('user_id', userId).maybeSingle(),
  );
  return membership ? findById(membership.groupId) : null;
};

export const addMember = async ({ groupId, userId, role = 'member' }) =>
  unwrap(await supabase.from('group_members').insert({ group_id: groupId, user_id: userId, role }));

export const removeMember = async ({ groupId, userId }) =>
  unwrap(await supabase.from('group_members').delete().eq('group_id', groupId).eq('user_id', userId));

export const setMemberRole = async ({ groupId, userId, role }) =>
  unwrap(
    await supabase.from('group_members').update({ role }).eq('group_id', groupId).eq('user_id', userId),
  );

export const remove = async (id) => unwrap(await supabase.from('groups').delete().eq('id', id));

// supabase-js has no transactions: if adding the leader fails, delete the empty group again.
export const create = async ({ name, createdBy }) => {
  const { id } = unwrap(
    await supabase.from('groups').insert({ name, created_by: createdBy }).select('id').single(),
  );

  try {
    await addMember({ groupId: id, userId: createdBy, role: 'leader' });
  } catch (error) {
    await remove(id);
    throw error;
  }

  return findById(id);
};
