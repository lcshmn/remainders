'use client';

import { createContext, useContext, useEffect, useState, ReactNode } from 'react';

type SelfHostedUser = {
  uid: string;
  email: string;
  displayName: string;
  photoURL?: string | null;
};

type SelfHostedProfile = SelfHostedUser & {
  username: string;
  role: 'admin';
  plan: 'pro';
  planExpiresAt: any | null;
};

interface AuthContextType {
  user: SelfHostedUser | null;
  loading: boolean;
  userProfile: SelfHostedProfile | null;
  isAdmin: boolean;
  isPro: boolean;
  signIn: () => Promise<void>;
  signOut: () => Promise<void>;
  refreshProfile: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType>({
  user: null,
  loading: true,
  userProfile: null,
  isAdmin: false,
  isPro: false,
  signIn: async () => {},
  signOut: async () => {},
  refreshProfile: async () => {},
});

export function useAuth() {
  return useContext(AuthContext);
}

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<SelfHostedUser | null>(null);
  const [userProfile, setUserProfile] = useState<SelfHostedProfile | null>(null);
  const [loading, setLoading] = useState(true);

  const loadSession = async () => {
    setLoading(true);
    try {
      const res = await fetch('/api/auth/session', { cache: 'no-store' });
      const session = await res.json();
      setUser(session.user);
      setUserProfile(session.userProfile);
    } catch {
      setUser(null);
      setUserProfile(null);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadSession();
  }, []);

  const handleSignIn = async () => {
    const password = window.prompt('Admin password');
    if (!password) return;

    const res = await fetch('/api/auth/login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ password }),
    });

    if (!res.ok) {
      const data = await res.json().catch(() => ({}));
      alert(data.error || 'Failed to sign in');
      return;
    }

    await loadSession();
  };

  const handleSignOut = async () => {
    await fetch('/api/auth/logout', { method: 'POST' });
    setUser(null);
    setUserProfile(null);
  };

  const value = {
    user,
    loading,
    userProfile,
    isAdmin: !!userProfile,
    isPro: !!userProfile,
    signIn: handleSignIn,
    signOut: handleSignOut,
    refreshProfile: loadSession,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}
