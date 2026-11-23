import { useState } from 'react';
import toast from 'react-hot-toast';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { AuthLayout } from '../../components/layout/AuthLayout';
import { Button, Input } from '../../components/ui';
import { useAuth } from '../../hooks/useAuth';
import { useForm } from '../../hooks/useForm';
import { HOME_PATHS } from '../../utils/constants';
import { getErrorMessage, getFieldErrors } from '../../utils/errors';
import { validateLogin } from '../../utils/validators';

// Demo accounts created by the backend seed script, so reviewers can try both roles quickly.
const DEMO_ACCOUNTS = [
  { label: 'Student demo', email: 'aarav@student.com', password: 'Student@123' },
  { label: 'Professor demo', email: 'admin@joineazy.com', password: 'Admin@123' },
];

export function Login() {
  const { login } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const { values, setValues, setErrors, field } = useForm({ email: '', password: '' });
  const [submitting, setSubmitting] = useState(false);

  const fillDemoAccount = ({ email, password }) => {
    setValues({ email, password });
    setErrors({});
  };

  const handleSubmit = async (event) => {
    event.preventDefault();

    const errors = validateLogin(values);
    if (Object.keys(errors).length > 0) return setErrors(errors);

    setSubmitting(true);
    try {
      const user = await login({ email: values.email.trim(), password: values.password });
      toast.success(`Welcome back, ${user.name}!`);
      // Return to the page they were trying to open, if it belongs to their role.
      const target = location.state?.from?.pathname;
      navigate(target?.startsWith(HOME_PATHS[user.role]) ? target : HOME_PATHS[user.role], { replace: true });
    } catch (error) {
      setErrors(getFieldErrors(error));
      toast.error(getErrorMessage(error));
      setSubmitting(false);
    }
  };

  return (
    <AuthLayout
      title="Welcome back"
      subtitle="Log in to manage your groups and assignments."
      footer={
        <>
          New student?{' '}
          <Link to="/register" className="font-medium text-brand-600 hover:text-brand-700">
            Create an account
          </Link>
        </>
      }
    >
      <form onSubmit={handleSubmit} noValidate className="space-y-4">
        <Input label="Email" type="email" autoComplete="email" placeholder="you@college.edu" {...field('email')} />
        <Input label="Password" type="password" autoComplete="current-password" placeholder="Your password" {...field('password')} />
        <Button type="submit" loading={submitting} className="w-full">
          Log in
        </Button>
      </form>

      <div className="mt-6 border-t border-slate-200 pt-4">
        <p className="mb-2 text-xs font-medium uppercase tracking-wide text-slate-400">Try a demo account</p>
        <div className="flex flex-col gap-2 sm:flex-row">
          {DEMO_ACCOUNTS.map((account) => (
            <Button key={account.email} variant="secondary" size="sm" className="flex-1" onClick={() => fillDemoAccount(account)}>
              {account.label}
            </Button>
          ))}
        </div>
      </div>
    </AuthLayout>
  );
}
