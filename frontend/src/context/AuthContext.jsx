import React, { createContext, useContext, useState, useCallback } from 'react';
import { loginUser, registerUser } from '../api/auth';

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(() => {
    const raw = localStorage.getItem('geovault_user');
    return raw ? JSON.parse(raw) : null;
  });

  const persist = (data) => {
    localStorage.setItem('geovault_token', data.token);
    localStorage.setItem('geovault_user', JSON.stringify(data.user));
    setUser(data.user);
  };

  const login = useCallback(async (email, password) => {
    const data = await loginUser({ email, password });
    persist(data);
    return data;
  }, []);

  const register = useCallback(async (name, email, password) => {
    const data = await registerUser({ name, email, password });
    persist(data);
    return data;
  }, []);

  const logout = useCallback(() => {
    localStorage.removeItem('geovault_token');
    localStorage.removeItem('geovault_user');
    setUser(null);
  }, []);

  return (
    <AuthContext.Provider value={{ user, login, register, logout, isAuthenticated: !!user }}>
      {children}
    </AuthContext.Provider>
  );
}

export const useAuth = () => useContext(AuthContext);
