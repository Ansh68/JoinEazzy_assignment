export const TOKEN_KEY = 'joineazy_token';

// Fired by the API client when the server rejects the saved token.
export const UNAUTHORIZED_EVENT = 'auth:unauthorized';

export const ROLES = {
  STUDENT: 'student',
  ADMIN: 'admin',
};

// Where each role lands after logging in.
export const HOME_PATHS = {
  [ROLES.STUDENT]: '/student',
  [ROLES.ADMIN]: '/admin',
};

export const NAV_ITEMS = {
  [ROLES.STUDENT]: [
    { to: '/student', label: 'Dashboard', icon: 'home', end: true },
    { to: '/student/assignments', label: 'Assignments', icon: 'clipboard' },
    { to: '/student/group', label: 'My Group', icon: 'users' },
  ],
  [ROLES.ADMIN]: [
    { to: '/admin', label: 'Dashboard', icon: 'home', end: true },
    { to: '/admin/assignments', label: 'Assignments', icon: 'clipboard' },
    { to: '/admin/groups', label: 'Groups', icon: 'users' },
    { to: '/admin/analytics', label: 'Analytics', icon: 'chart' },
  ],
};
