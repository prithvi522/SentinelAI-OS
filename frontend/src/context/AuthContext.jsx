import { createContext, useContext, useEffect, useMemo, useState } from 'react';
import { me } from '../lib/api';

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const token = localStorage.getItem('sentinel_token');
    if (!token) {
      setLoading(false);
      return;
    }

    me()
      .then((data) => setUser(data))
      .catch(() => {
        localStorage.removeItem('sentinel_token');
        setUser(null);
      })
      .finally(() => setLoading(false));
  }, []);

  const value = useMemo(
    () => ({
      user,
      loading,
      loginUser: (token, profile) => {
        localStorage.setItem('sentinel_token', token);
        setUser(profile || null);
      },
      logout: () => {
        localStorage.removeItem('sentinel_token');
        setUser(null);
      },
      setUser,
    }),
    [user, loading]
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used inside AuthProvider');
  return ctx;
}
