// Client-side checks that mirror the backend rules, so mistakes are caught before a request is sent.
// Each function returns an object of { fieldName: message }; an empty object means the form is valid.

const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const STUDENT_ID_PATTERN = /^[A-Za-z0-9_-]{3,20}$/;

export const validateLogin = ({ email, password }) => {
  const errors = {};

  if (!EMAIL_PATTERN.test(email.trim())) errors.email = 'Enter a valid email';
  if (!password) errors.password = 'Password is required';

  return errors;
};

export const validateRegister = ({ name, email, studentId, password, confirmPassword }) => {
  const errors = {};

  if (name.trim().length < 2) errors.name = 'Name must be at least 2 characters';
  if (!EMAIL_PATTERN.test(email.trim())) errors.email = 'Enter a valid email';
  if (!STUDENT_ID_PATTERN.test(studentId.trim())) {
    errors.studentId = 'Student ID must be 3-20 letters, numbers, "-" or "_"';
  }

  if (password.length < 8) errors.password = 'Password must be at least 8 characters';
  else if (password.length > 72) errors.password = 'Password must be at most 72 characters';
  else if (!/[A-Za-z]/.test(password) || !/[0-9]/.test(password)) {
    errors.password = 'Password must contain a letter and a number';
  }

  if (confirmPassword !== password) errors.confirmPassword = 'Passwords do not match';

  return errors;
};
