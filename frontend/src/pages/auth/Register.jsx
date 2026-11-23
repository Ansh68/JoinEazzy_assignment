import { useState } from 'react';
import toast from 'react-hot-toast';
import { Link, useNavigate } from 'react-router-dom';
import { AuthLayout } from '../../components/layout/AuthLayout';
import { Button, Input } from '../../components/ui';
import { useAuth } from '../../hooks/useAuth';
import { useForm } from '../../hooks/useForm';
import { HOME_PATHS } from '../../utils/constants';
import { getErrorMessage, getFieldErrors } from '../../utils/errors';
import { validateRegister } from '../../utils/validators';

export function Register() {
  const { register } = useAuth();
  const navigate = useNavigate();
  const { values, setErrors, field } = useForm({
    name: '',
    email: '',
    studentId: '',
    password: '',
    confirmPassword: '',
  });
  const [submitting, setSubmitting] = useState(false);

  const handleSubmit = async (event) => {
    event.preventDefault();

    const errors = validateRegister(values);
    if (Object.keys(errors).length > 0) return setErrors(errors);

    setSubmitting(true);
    try {
      const { name, email, studentId, password } = values;
      const user = await register({ name: name.trim(), email: email.trim(), studentId: studentId.trim(), password });
      toast.success('Account created. Welcome to Joineazy!');
      navigate(HOME_PATHS[user.role], { replace: true });
    } catch (error) {
      setErrors(getFieldErrors(error));
      toast.error(getErrorMessage(error));
      setSubmitting(false);
    }
  };

  return (
    <AuthLayout
      title="Create your account"
      subtitle="Student sign-up. Professor accounts are created by the admin."
      footer={
        <>
          Already registered?{' '}
          <Link to="/login" className="font-medium text-brand-600 hover:text-brand-700">
            Log in
          </Link>
        </>
      }
    >
      <form onSubmit={handleSubmit} noValidate className="space-y-4">
        <Input label="Full name" autoComplete="name" placeholder="Aarav Sharma" {...field('name')} />
        <Input label="Email" type="email" autoComplete="email" placeholder="you@college.edu" {...field('email')} />
        <Input label="Student ID" placeholder="STU001" hint="Teammates use this or your email to add you to a group." {...field('studentId')} />
        <Input label="Password" type="password" autoComplete="new-password" hint="At least 8 characters, with a letter and a number." {...field('password')} />
        <Input label="Confirm password" type="password" autoComplete="new-password" {...field('confirmPassword')} />
        <Button type="submit" loading={submitting} className="w-full">
          Create account
        </Button>
      </form>
    </AuthLayout>
  );
}
