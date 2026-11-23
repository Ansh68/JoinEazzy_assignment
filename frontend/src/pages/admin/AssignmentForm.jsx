import { useCallback, useState } from 'react';
import toast from 'react-hot-toast';
import { Link, useNavigate, useParams } from 'react-router-dom';
import { createAssignment, getAssignment, updateAssignment } from '../../api/assignments.api';
import { getAllGroups } from '../../api/groups.api';
import { ErrorMessage } from '../../components/shared/ErrorMessage';
import { PageHeader } from '../../components/shared/PageHeader';
import { Button, Card, Input, PageLoader, Textarea } from '../../components/ui';
import { useFetch } from '../../hooks/useFetch';
import { useForm } from '../../hooks/useForm';
import { cn } from '../../utils/cn';
import { getErrorMessage, getFieldErrors } from '../../utils/errors';
import { validateAssignment } from '../../utils/validators';

// <input type="datetime-local"> wants "2026-11-24T10:30" in the user's own time zone.
const toDateTimeLocal = (isoString) => {
  const date = new Date(isoString);
  return new Date(date.getTime() - date.getTimezoneOffset() * 60_000).toISOString().slice(0, 16);
};

const EMPTY_VALUES = { title: '', description: '', dueDate: '', onedriveLink: '', targetType: 'all', groupIds: [] };

const toFormValues = (assignment) => ({
  title: assignment.title,
  description: assignment.description,
  dueDate: toDateTimeLocal(assignment.dueDate),
  onedriveLink: assignment.onedriveLink,
  targetType: assignment.targetType,
  groupIds: assignment.targets.map((group) => group.id),
});

const TARGET_OPTIONS = [
  { value: 'all', label: 'All students', hint: 'Every student sees it, in a group or not.' },
  { value: 'groups', label: 'Specific groups', hint: 'Only the groups you pick see it.' },
];

function AssignmentFormFields({ groups, initialValues, assignmentId }) {
  const navigate = useNavigate();
  const isEdit = Boolean(assignmentId);
  const { values, setValues, errors, setErrors, field } = useForm(initialValues);
  const [submitting, setSubmitting] = useState(false);

  const toggleGroup = (groupId) => {
    setValues((current) => ({
      ...current,
      groupIds: current.groupIds.includes(groupId) ? current.groupIds.filter((id) => id !== groupId) : [...current.groupIds, groupId],
    }));
    setErrors((current) => ({ ...current, groupIds: undefined }));
  };

  const handleSubmit = async (event) => {
    event.preventDefault();

    const validationErrors = validateAssignment(values, { isEdit });
    if (Object.keys(validationErrors).length > 0) return setErrors(validationErrors);

    const payload = {
      title: values.title.trim(),
      description: values.description.trim(),
      dueDate: new Date(values.dueDate).toISOString(),
      onedriveLink: values.onedriveLink.trim(),
      targetType: values.targetType,
      groupIds: values.targetType === 'groups' ? values.groupIds : [],
    };

    setSubmitting(true);
    try {
      if (isEdit) await updateAssignment(assignmentId, payload);
      else await createAssignment(payload);

      toast.success(isEdit ? 'Assignment updated' : 'Assignment created');
      navigate('/admin/assignments');
    } catch (error) {
      setErrors(getFieldErrors(error));
      toast.error(getErrorMessage(error));
      setSubmitting(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} noValidate className="space-y-5">
      <Card className="space-y-4">
        <Input label="Title" placeholder="e.g. Database Design Report" {...field('title')} />
        <Textarea label="Description" placeholder="What should students submit?" {...field('description')} />
        <div className="grid gap-4 sm:grid-cols-2">
          <Input label="Due date and time" type="datetime-local" {...field('dueDate')} />
          <Input label="OneDrive submission link" type="url" placeholder="https://1drv.ms/..." {...field('onedriveLink')} />
        </div>
      </Card>

      <Card>
        <h2 className="text-base font-semibold text-slate-900">Who is this for?</h2>

        <div className="mt-3 grid gap-3 sm:grid-cols-2" role="radiogroup" aria-label="Audience">
          {TARGET_OPTIONS.map(({ value, label, hint }) => (
            <label
              key={value}
              className={cn(
                'flex cursor-pointer items-start gap-3 rounded-lg border p-3 transition-colors',
                values.targetType === value ? 'border-brand-500 bg-brand-50' : 'border-slate-200 hover:bg-slate-50',
              )}
            >
              <input
                type="radio"
                name="targetType"
                value={value}
                checked={values.targetType === value}
                onChange={() => setValues((current) => ({ ...current, targetType: value }))}
                className="mt-1 accent-brand-600"
              />
              <span>
                <span className="block text-sm font-medium text-slate-900">{label}</span>
                <span className="block text-xs text-slate-500">{hint}</span>
              </span>
            </label>
          ))}
        </div>

        {values.targetType === 'groups' && (
          <div className="mt-4">
            {groups.length === 0 ? (
              <p className="text-sm text-slate-500">No groups exist yet. Students need to create groups first.</p>
            ) : (
              <>
                <div className="mb-2 flex items-center justify-between text-sm">
                  <span className="font-medium text-slate-700">
                    {values.groupIds.length} of {groups.length} selected
                  </span>
                  <button
                    type="button"
                    className="font-medium text-brand-600 hover:text-brand-700"
                    onClick={() => setValues((current) => ({ ...current, groupIds: current.groupIds.length === groups.length ? [] : groups.map((g) => g.id) }))}
                  >
                    {values.groupIds.length === groups.length ? 'Clear all' : 'Select all'}
                  </button>
                </div>

                <ul className="grid max-h-64 gap-2 overflow-y-auto sm:grid-cols-2">
                  {groups.map((group) => (
                    <li key={group.id}>
                      <label className="flex cursor-pointer items-center gap-3 rounded-lg border border-slate-200 px-3 py-2 hover:bg-slate-50">
                        <input type="checkbox" checked={values.groupIds.includes(group.id)} onChange={() => toggleGroup(group.id)} className="accent-brand-600" />
                        <span className="min-w-0">
                          <span className="block truncate text-sm font-medium text-slate-900">{group.name}</span>
                          <span className="block text-xs text-slate-500">{group.members.length} members</span>
                        </span>
                      </label>
                    </li>
                  ))}
                </ul>
              </>
            )}
            {errors.groupIds && <p className="mt-2 text-xs text-red-600">{errors.groupIds}</p>}
          </div>
        )}
      </Card>

      <div className="flex flex-col-reverse gap-2 sm:flex-row sm:justify-end">
        <Link to="/admin/assignments" className="inline-flex items-center justify-center rounded-lg px-4 py-2 text-sm font-medium text-slate-600 ring-1 ring-inset ring-slate-300 hover:bg-slate-50">
          Cancel
        </Link>
        <Button type="submit" loading={submitting}>
          {isEdit ? 'Save changes' : 'Create assignment'}
        </Button>
      </div>
    </form>
  );
}

export function AssignmentForm() {
  const { id } = useParams();
  const isEdit = Boolean(id);

  // New assignments only need the group list; edits also load the assignment itself.
  const loadFormData = useCallback(async () => {
    const [groups, assignment] = await Promise.all([getAllGroups(), isEdit ? getAssignment(id) : null]);
    return { groups, initialValues: assignment ? toFormValues(assignment) : EMPTY_VALUES };
  }, [id, isEdit]);

  const { data, loading, error, reload } = useFetch(loadFormData);

  const header = (
    <PageHeader title={isEdit ? 'Edit assignment' : 'New assignment'} description="Students get the OneDrive link and confirm once their group has submitted." />
  );

  if (loading) return <PageLoader />;
  if (error && !data) {
    return (
      <>
        {header}
        <ErrorMessage message={error} onRetry={reload} />
      </>
    );
  }

  return (
    <>
      {header}
      <div className="max-w-3xl">
        <AssignmentFormFields key={id ?? 'new'} groups={data.groups} initialValues={data.initialValues} assignmentId={id} />
      </div>
    </>
  );
}
