import { useCallback, useEffect, useMemo, useState } from 'react';
import toast from 'react-hot-toast';
import { getCurrentUser, loginRequest, registerRequest } from '../api/auth.api';
import { TOKEN_KEY, UNAUTHORIZED_EVENT } from '../utils/constants';



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

  const clearSession = useCallback(() => {
    localStorage.removeItem(TOKEN_KEY);
    setUser(null);
  }, []);

  // Restore the session after a page refresh.
  useEffect(() => {
    if (!readToken()) return;

    getCurrentUser()
      .then(setUser)
      .catch(clearSession)
      .finally(() => setLoading(false));
  }, [clearSession]);

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
    setUser(loggedInUser);
    return loggedInUser;
  }, []);

  const login = useCallback(async (credentials) => startSession(await loginRequest(credentials)), [startSession]);

  const register = useCallback(async (details) => startSession(await registerRequest(details)), [startSession]);

  const value = useMemo(
    () => ({ user, loading, login, register, logout: clearSession }),
    [user, loading, login, register, clearSession],
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}
