import * as Group from '../models/group.model.js';
import * as User from '../models/user.model.js';
import { ApiError } from '../utils/ApiError.js';
import { asyncHandler } from '../utils/asyncHandler.js';

// Loads a group and makes sure the logged-in student is its leader.
const getGroupAsLeader = async (groupId, userId) => {
  const group = await Group.findById(groupId);
  if (!group) throw ApiError.notFound('Group not found');

  const me = group.members.find((member) => member.id === userId);
  if (me?.role !== 'leader') throw ApiError.forbidden('Only the group leader can do this');

  return group;
};

export const createGroup = asyncHandler(async (req, res) => {
  const { name } = req.body;

  if (await Group.findByMemberId(req.user.id)) {
    throw ApiError.conflict('You are already in a group');
  }
  if (await Group.findByName(name)) {
    throw ApiError.conflict('A group with this name already exists');
  }

  const group = await Group.create({ name, createdBy: req.user.id });
  res.status(201).json({ success: true, group });
});

// Returns { group: null } when the student hasn't joined a group yet.
export const getMyGroup = asyncHandler(async (req, res) => {
  const group = await Group.findByMemberId(req.user.id);
  res.json({ success: true, group });
});

export const listGroups = asyncHandler(async (_req, res) => {
  const groups = await Group.findAll();
  res.json({ success: true, groups });
});

export const addMember = asyncHandler(async (req, res) => {
  const group = await getGroupAsLeader(req.params.id, req.user.id);

  const student = await User.findStudentByIdentifier(req.body.identifier);
  if (!student) throw ApiError.notFound('No student found with that email or student ID');

  if (await Group.findByMemberId(student.id)) {
    throw ApiError.conflict(`${student.name} is already in a group`);
  }

  await Group.addMember({ groupId: group.id, userId: student.id });
  res.status(201).json({ success: true, group: await Group.findById(group.id) });
});

export const removeMember = asyncHandler(async (req, res) => {
  const { id: groupId, userId } = req.params;
  const group = await getGroupAsLeader(groupId, req.user.id);

  if (userId === req.user.id) throw ApiError.badRequest('Use "leave group" to remove yourself');
  if (!group.members.some((member) => member.id === userId)) {
    throw ApiError.notFound('That student is not in this group');
  }

  await Group.removeMember({ groupId, userId });
  res.json({ success: true, group: await Group.findById(groupId) });
});

// A leader who leaves hands leadership to the longest-standing member.
// If they were the last member, the group is deleted.
export const leaveGroup = asyncHandler(async (req, res) => {
  const group = await Group.findById(req.params.id);
  const me = group?.members.find((member) => member.id === req.user.id);
  if (!me) throw ApiError.notFound('You are not a member of this group');

  const others = group.members.filter((member) => member.id !== req.user.id);

  if (others.length === 0) {
    await Group.remove(group.id);
    return res.json({ success: true, message: 'You left and the empty group was deleted' });
  }

  if (me.role === 'leader') {
    await Group.setMemberRole({ groupId: group.id, userId: others[0].id, role: 'leader' });
  }
  await Group.removeMember({ groupId: group.id, userId: req.user.id });

  res.json({ success: true, message: 'You left the group' });
});
