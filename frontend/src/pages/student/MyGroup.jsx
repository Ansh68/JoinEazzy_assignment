import { useState } from 'react';
import toast from 'react-hot-toast';
import { addMember, createGroup, getMyGroup, leaveGroup, removeMember } from '../../api/groups.api';
import { AddMemberPanel } from '../../components/shared/AddMemberPanel';
import { ConfirmDialog } from '../../components/shared/ConfirmDialog';
import { ErrorMessage } from '../../components/shared/ErrorMessage';
import { MemberList } from '../../components/shared/MemberList';
import { PageHeader } from '../../components/shared/PageHeader';
import { Button, Card, Input, PageLoader } from '../../components/ui';
import { useAuth } from '../../hooks/useAuth';
import { useFetch } from '../../hooks/useFetch';
import { useForm } from '../../hooks/useForm';
import { getErrorMessage, getFieldErrors } from '../../utils/errors';
import { validateGroupName } from '../../utils/validators';

function CreateGroupCard({ onCreated }) {
  const { values, setErrors, field } = useForm({ name: '' });
  const [submitting, setSubmitting] = useState(false);

  const handleSubmit = async (event) => {
    event.preventDefault();

    const errors = validateGroupName(values);
    if (Object.keys(errors).length > 0) return setErrors(errors);

    setSubmitting(true);
    try {
      await createGroup(values.name.trim());
      toast.success('Group created. Now add your teammates!');
      onCreated();
    } catch (error) {
      setErrors(getFieldErrors(error));
      toast.error(getErrorMessage(error));
      setSubmitting(false);
    }
  };

  return (
    <Card className="mx-auto max-w-lg">
      <h2 className="text-lg font-semibold text-slate-900">You are not in a group yet</h2>
      <p className="mt-1 text-sm text-slate-500">
        Create a group and you become its leader. You can then add classmates by name, email or student ID.
      </p>

      <form onSubmit={handleSubmit} noValidate className="mt-5 space-y-4">
        <Input label="Group name" placeholder="e.g. Team Rocket" {...field('name')} />
        <Button type="submit" loading={submitting}>
          Create group
        </Button>
      </form>
    </Card>
  );
}

export function MyGroup() {
  const { user } = useAuth();
  const { data: group, loading, error, reload } = useFetch(getMyGroup);

  const [addingId, setAddingId] = useState(null);
  const [removingId, setRemovingId] = useState(null);
  const [memberToRemove, setMemberToRemove] = useState(null);
  const [confirmingLeave, setConfirmingLeave] = useState(false);
  const [leaving, setLeaving] = useState(false);
  const [refreshKey, setRefreshKey] = useState(0);

  if (loading) return <PageLoader />;
  if (error && !group) return <ErrorMessage message={error} onRetry={reload} />;

  const isLeader = group?.members.some((member) => member.id === user.id && member.role === 'leader');

  const handleAdd = async (student) => {
    setAddingId(student.id);
    try {
      await addMember(group.id, student.email);
      toast.success(`${student.name} added to the group`);
      setRefreshKey((key) => key + 1);
      reload();
    } catch (err) {
      toast.error(getErrorMessage(err));
    } finally {
      setAddingId(null);
    }
  };

  const handleRemove = async () => {
    setRemovingId(memberToRemove.id);
    try {
      await removeMember(group.id, memberToRemove.id);
      toast.success(`${memberToRemove.name} removed from the group`);
      reload();
    } catch (err) {
      toast.error(getErrorMessage(err));
    } finally {
      setRemovingId(null);
      setMemberToRemove(null);
    }
  };

  const handleLeave = async () => {
    setLeaving(true);
    try {
      await leaveGroup(group.id);
      toast.success('You left the group');
      setConfirmingLeave(false);
      reload();
    } catch (err) {
      toast.error(getErrorMessage(err));
    } finally {
      setLeaving(false);
    }
  };

  if (!group) {
    return (
      <>
        <PageHeader title="My Group" description="Create a group and add your teammates." />
        <CreateGroupCard onCreated={reload} />
      </>
    );
  }

  return (
    <>
      <PageHeader
        title={group.name}
        description={`${group.members.length} ${group.members.length === 1 ? 'member' : 'members'}${isLeader ? ' · You are the leader' : ''}`}
        action={
          <Button variant="secondary" onClick={() => setConfirmingLeave(true)}>
            Leave group
          </Button>
        }
      />

      <div className="grid gap-6 lg:grid-cols-2">
        <Card className="min-w-0">
          <h2 className="mb-1 text-base font-semibold text-slate-900">Members</h2>
          <MemberList
            members={group.members}
            currentUserId={user.id}
            canRemove={isLeader}
            removingId={removingId}
            onRemove={setMemberToRemove}
          />
        </Card>

        {isLeader ? (
          <Card className="min-w-0">
            <AddMemberPanel onAdd={handleAdd} addingId={addingId} refreshKey={refreshKey} />
          </Card>
        ) : (
          <Card className="min-w-0">
            <h2 className="text-base font-semibold text-slate-900">Adding members</h2>
            <p className="mt-1 text-sm text-slate-500">Only the group leader can add or remove members.</p>
          </Card>
        )}
      </div>

      <ConfirmDialog
        open={Boolean(memberToRemove)}
        title="Remove member?"
        confirmLabel="Remove"
        loading={Boolean(removingId)}
        onConfirm={handleRemove}
        onClose={() => setMemberToRemove(null)}
      >
        {memberToRemove?.name} will be removed from <strong>{group.name}</strong> and can join another group.
      </ConfirmDialog>

      <ConfirmDialog
        open={confirmingLeave}
        title="Leave this group?"
        confirmLabel="Leave group"
        loading={leaving}
        onConfirm={handleLeave}
        onClose={() => setConfirmingLeave(false)}
      >
        {group.members.length === 1
          ? 'You are the only member, so the group will be deleted.'
          : isLeader
            ? 'Leadership will pass to the member who joined first.'
            : 'You can join or create another group afterwards.'}
      </ConfirmDialog>
    </>
  );
}
