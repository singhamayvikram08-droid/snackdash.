import { useState, useEffect } from 'react';

export interface UserSession {
  name: string;
  email: string;
  role: string;
  avatar: string;
  token: string;
  tier?: 'free' | 'pro' | 'enterprise';
  isPro?: boolean;
  subscriptionStatus?: 'active' | 'trialing' | 'none';
  subscribedAt?: string;
  loginAt: string;
}

export const AUTH_STORAGE_KEY = 'nexgen_user_auth';

export const getStoredAuth = (): UserSession | null => {
  if (typeof window === 'undefined') return null;
  try {
    const raw = localStorage.getItem(AUTH_STORAGE_KEY);
    if (!raw) return null;
    return JSON.parse(raw);
  } catch {
    return null;
  }
};

export const setStoredAuth = (user: Partial<UserSession>): UserSession => {
  const current = getStoredAuth();
  const tier = user.tier || (user.isPro ? 'pro' : current?.tier || 'free');
  const isPro = tier === 'pro' || tier === 'enterprise' || Boolean(user.isPro);

  const session: UserSession = {
    name: user.name || current?.name || 'Amay Vikram Singh',
    email: user.email || current?.email || 'developer@nexgen.io',
    role: user.role || current?.role || (isPro ? 'Pro Subscriber' : 'Member'),
    avatar: (user.name ? user.name.split(' ').map(n => n[0]).join('') : (current?.avatar || 'AV')).slice(0, 2).toUpperCase(),
    token: user.token || current?.token || 'NXG_' + Math.random().toString(36).substring(2, 10).toUpperCase(),
    tier: tier,
    isPro: isPro,
    subscriptionStatus: isPro ? 'active' : 'none',
    subscribedAt: isPro ? (user.subscribedAt || current?.subscribedAt || new Date().toISOString()) : undefined,
    loginAt: current?.loginAt || new Date().toISOString(),
  };
  localStorage.setItem(AUTH_STORAGE_KEY, JSON.stringify(session));
  window.dispatchEvent(new Event('nexgen-auth-changed'));
  return session;
};

export const clearStoredAuth = () => {
  localStorage.removeItem(AUTH_STORAGE_KEY);
  window.dispatchEvent(new Event('nexgen-auth-changed'));
};

export const isAuthenticated = (): boolean => {
  return getStoredAuth() !== null;
};

export function useAuth() {
  const [user, setUser] = useState<UserSession | null>(getStoredAuth);

  useEffect(() => {
    const handler = () => {
      setUser(getStoredAuth());
    };
    window.addEventListener('nexgen-auth-changed', handler);
    window.addEventListener('storage', handler);
    return () => {
      window.removeEventListener('nexgen-auth-changed', handler);
      window.removeEventListener('storage', handler);
    };
  }, []);

  return {
    user,
    isAuthenticated: !!user,
    login: (u: Partial<UserSession>) => setStoredAuth(u),
    logout: () => clearStoredAuth(),
  };
}
