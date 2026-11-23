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

const isHttpUrl = (value) => {
  try {
    return ['http:', 'https:'].includes(new URL(value).protocol);
  } catch {
    return false;
  }
};

// New assignments can't be due in the past; editing may keep an old due date.
export const validateAssignment = ({ title, description, dueDate, onedriveLink, targetType, groupIds }, { isEdit = false } = {}) => {
  const errors = {};

  if (title.trim().length < 3) errors.title = 'Title must be at least 3 characters';
  else if (title.trim().length > 120) errors.title = 'Title is too long (max 120 characters)';

  if (description.trim().length > 2000) errors.description = 'Description is too long (max 2000 characters)';

  if (!dueDate || Number.isNaN(new Date(dueDate).getTime())) errors.dueDate = 'Choose a due date and time';
  else if (!isEdit && new Date(dueDate) <= new Date()) errors.dueDate = 'Due date must be in the future';

  if (!isHttpUrl(onedriveLink.trim())) errors.onedriveLink = 'Enter a valid OneDrive link (https://...)';

  if (targetType === 'groups' && groupIds.length === 0) errors.groupIds = 'Select at least one group';

  return errors;
};

const GROUP_NAME_PATTERN = /^[\p{L}\p{N} _.&'-]+$/u;

export const validateGroupName = ({ name }) => {
  const trimmed = name.trim();

  if (trimmed.length < 3) return { name: 'Group name must be at least 3 characters' };
  if (trimmed.length > 40) return { name: 'Group name is too long (max 40 characters)' };
  if (!GROUP_NAME_PATTERN.test(trimmed)) {
    return { name: "Use only letters, numbers, spaces and . _ - & '" };
  }

  return {};
};

export const validateRegister =({ name, email, studentId, password, confirmPassword }) => {
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
