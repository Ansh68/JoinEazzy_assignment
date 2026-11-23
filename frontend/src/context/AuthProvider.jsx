import { useCallback, useEffect, useMemo, useState } from 'react';
import toast from 'react-hot-toast';
import { getCurrentUser, loginRequest, registerRequest } from '../api/auth.api';
import { clearFetchCache } from '../hooks/useFetch';
import { TOKEN_KEY, UNAUTHORIZED_EVENT } from '../utils/constants';
import { getErrorMessage } from '../utils/errors';
import { AuthContext } from './AuthContext';

const readToken = () => {
  try {
    return localStorage.getItem(TOKEN_KEY);
  } catch {
    return null;
  }
};

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  // True until we know whether a saved token is still valid, so protected pages don't flash the login screen.
  const [loading, setLoading] = useState(() => Boolean(readToken()));
  // Set when the server could not be reached while restoring the session (offline, or waking up).
  const [restoreError, setRestoreError] = useState('');

  const clearSession = useCallback(() => {
    localStorage.removeItem(TOKEN_KEY);
    clearFetchCache();
    setUser(null);
  }, []);

  const restoreSession = useCallback(
    () =>
      getCurrentUser()
        .then(setUser)
        .catch((error) => {
          // A rejected token means log out. Anything else (network, server down) keeps the token
          // so a temporary outage doesn't sign the user out.
          if (error.response?.status === 401) clearSession();
          else setRestoreError(getErrorMessage(error));
        })
        .finally(() => setLoading(false)),
    [clearSession],
  );

  // Restore the session after a page refresh.
  useEffect(() => {
    if (readToken()) restoreSession();
  }, [restoreSession]);

  const retryRestore = useCallback(() => {
    setRestoreError('');
    setLoading(true);
    restoreSession();
  }, [restoreSession]);

  // The API client fires this when the server rejects our token.
  useEffect(() => {
    const handleUnauthorized = () => {
      if (!readToken()) return;
      clearSession();
      toast.error('Your session has expired. Please log in again.');
    };

    window.addEventListener(UNAUTHORIZED_EVENT, handleUnauthorized);
    return () => window.removeEventListener(UNAUTHORIZED_EVENT, handleUnauthorized);
  }, [clearSession]);

  const startSession = useCallback(({ token, user: loggedInUser }) => {
    localStorage.setItem(TOKEN_KEY, token);
    clearFetchCache();
    setUser(loggedInUser);
    setRestoreError('');
    return loggedInUser;
  }, []);

  const login = useCallback(async (credentials) => startSession(await loginRequest(credentials)), [startSession]);

  const register = useCallback(async (details) => startSession(await registerRequest(details)), [startSession]);

  const logout = useCallback(() => {
    clearSession();
    setRestoreError('');
  }, [clearSession]);

  const value = useMemo(
    () => ({ user, loading, restoreError, retryRestore, login, register, logout }),
    [user, loading, restoreError, retryRestore, login, register, logout],
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}
