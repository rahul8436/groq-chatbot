'use client';

import React, { createContext, useContext, useEffect, useState } from 'react';

interface User {
  id: string;
  name: string;
}

interface UserContextType {
  user: User | null;
  login: (name: string) => void;
  logout: () => void;
}

const UserContext = createContext<UserContextType | undefined>(undefined);

export function UserProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
    // Check for saved user
    const savedUser = localStorage.getItem('user');
    if (savedUser) {
      setUser(JSON.parse(savedUser));
    }
  }, []);

  useEffect(() => {
    if (!mounted) return;
    if (user) {
      localStorage.setItem('user', JSON.stringify(user));
    } else {
      localStorage.removeItem('user');
    }
  }, [user, mounted]);

  const login = (name: string) => {
    const newUser: User = {
      id: Date.now().toString(),
      name,
    };
    setUser(newUser);
  };

  const logout = () => {
    setUser(null);
  };

  if (!mounted) {
    return null;
  }

  return (
    <UserContext.Provider value={{ user, login, logout }}>
      {children}
    </UserContext.Provider>
  );
}

export function useUser() {
  const context = useContext(UserContext);
  if (context === undefined) {
    throw new Error('useUser must be used within a UserProvider');
  }
  return context;
}
