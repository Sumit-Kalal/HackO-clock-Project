import React, { createContext, useContext, useState, useEffect } from 'react';
import { api } from './api';

interface User {
  id: number;
  email: string;
  role: string;
}

interface AuthContextType {
  user: User | null;
  loading: boolean;
  login: (email: string, password: string) => Promise<void>;
  register: (email: string, password: string, role?: string) => Promise<void>;
  logout: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api.getMe()
      .then(u => setUser(u))
      .catch(() => setUser(null))
      .finally(() => setLoading(false));
  }, []);

  const login = async (email: string, password: string) => {
    const u = await api.login(email, password);
    setUser(u);
  };

  const register = async (email: string, password: string, role?: string) => {
    const u = await api.register(email, password, role);
    setUser(u);
  };

  const logout = async () => {
    try {
      await api.logout();
    } finally {
      setUser(null);
    }
  };

  // Global unauthorized handler
  useEffect(() => {
    const handleUnauthorized = (event: PromiseRejectionEvent) => {
      const reason = event.reason;
      if (reason === 'Unauthorized' || (reason instanceof Error && reason.message === 'Unauthorized')) {
        setUser(null);
      }
    };
    window.addEventListener('unhandledrejection', handleUnauthorized);
    return () => window.removeEventListener('unhandledrejection', handleUnauthorized);
  }, []);

  return (
    <AuthContext.Provider value={{ user, loading, login, register, logout }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
