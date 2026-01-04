// src/context/AuthContext.jsx
import React, { createContext, useContext, useEffect, useState } from 'react';

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [isInitialising, setIsInitialising] = useState(true);

  // Load user from localStorage on mount
  useEffect(() => {
    try {
      const storedUser = window.localStorage.getItem('authUser');
      if (storedUser) {
        const parsedUser = JSON.parse(storedUser);
        // Basic safety check
        if (parsedUser && typeof parsedUser === 'object') {
          setUser(parsedUser);
        }
      }
    } catch {
      // ignore storage / parse errors and start with null user
    } finally {
      setIsInitialising(false);
    }
  }, []);

  // Persist user whenever it changes
  useEffect(() => {
    try {
      if (user) {
        window.localStorage.setItem('authUser', JSON.stringify(user));
      } else {
        window.localStorage.removeItem('authUser');
      }
    } catch {
      // ignore storage errors
    }
  }, [user]);

  function login({ name, role }) {
    const trimmedName = (name || '').trim() || 'Guest';

    const safeRole =
      role === 'admin' || role === 'manager' || role === 'viewer'
        ? role
        : 'viewer';

    setUser({
      name: trimmedName,
      role: safeRole,
    });
  }

  function logout() {
    setUser(null);
  }

  const value = {
    user,
    isInitialising,
    login,
    logout,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
