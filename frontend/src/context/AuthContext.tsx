'use client';

import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { UserInfo, UserProfileResponse } from '@/types/game';

interface AuthContextType {
  user: UserInfo | null;
  profile: UserProfileResponse | null;
  token: string | null;
  isLoading: boolean;
  isAuthenticated: boolean;
  error: string | null;
  login: (email: string, password: string) => Promise<void>;
  signup: (email: string, password: string, username: string, displayName?: string) => Promise<void>;
  logout: () => Promise<void>;
  updateProfile: (updates: Partial<UserProfileResponse>) => Promise<void>;
  forgotPassword: (email: string) => Promise<{ message: string }>;
  resetPassword: (email: string, newPassword: string, token?: string) => Promise<{ message: string }>;
  clearError: () => void;
}

const TOKEN_KEY = 'game_finder_jwt_token';
const USER_KEY = 'game_finder_user_data';
const BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000/api/v1';

function parseApiError(data: any, status: number, defaultMsg: string): string {
  if (data?.detail) {
    if (typeof data.detail === 'string') {
      return data.detail;
    }
    if (Array.isArray(data.detail)) {
      return data.detail
        .map((d: any) => d.msg || d.message || (typeof d === 'string' ? d : JSON.stringify(d)))
        .join('. ');
    }
    if (typeof data.detail === 'object') {
      return data.detail.msg || data.detail.message || JSON.stringify(data.detail);
    }
  }
  if (data?.message && typeof data.message === 'string') {
    return data.message;
  }
  if (status === 404) {
    return 'Authentication service endpoint not found.';
  }
  if (status >= 500) {
    return 'Authentication server is currently unavailable. Please try again later.';
  }
  return defaultMsg;
}

function parseFetchError(err: unknown, defaultMsg: string): string {
  if (err instanceof Error) {
    const msg = err.message.toLowerCase();
    if (
      err.name === 'TypeError' ||
      msg.includes('failed to fetch') ||
      msg.includes('network') ||
      msg.includes('connection') ||
      msg.includes('refused')
    ) {
      return 'Unable to connect to the authentication server. Please ensure the backend server is running and try again.';
    }
    return err.message;
  }
  return defaultMsg;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [token, setToken] = useState<string | null>(null);
  const [user, setUser] = useState<UserInfo | null>(null);
  const [profile, setProfile] = useState<UserProfileResponse | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const clearError = useCallback(() => setError(null), []);

  const fetchProfile = useCallback(async (jwt: string): Promise<UserProfileResponse | null> => {
    try {
      const res = await fetch(`${BASE_URL}/auth/me`, {
        headers: {
          'Authorization': `Bearer ${jwt}`,
          'Content-Type': 'application/json',
        },
      });
      if (res.ok) {
        const data = await res.json();
        setProfile(data);
        return data;
      }
    } catch {
      // Network failure
    }
    return null;
  }, []);

  // Initialize from localStorage
  useEffect(() => {
    try {
      if (typeof window !== 'undefined') {
        const storedToken = localStorage.getItem(TOKEN_KEY);
        const storedUser = localStorage.getItem(USER_KEY);
        if (storedToken && storedUser) {
          const parsedUser = JSON.parse(storedUser);
          setToken(storedToken);
          setUser(parsedUser);
          fetchProfile(storedToken).finally(() => {
            setIsLoading(false);
          });
          return;
        }
      }
    } catch {
      // Local storage read error
    }
    setIsLoading(false);
  }, [fetchProfile]);

  const login = useCallback(async (email: string, password: string) => {
    setIsLoading(true);
    setError(null);
    try {
      const res = await fetch(`${BASE_URL}/auth/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password }),
      });

      let data: any = null;
      try {
        data = await res.json();
      } catch {
        // Response was not JSON
      }

      if (!res.ok) {
        throw new Error(parseApiError(data, res.status, 'Failed to sign in. Please check your credentials.'));
      }

      const jwt = data.access_token;
      const userInfo: UserInfo = data.user || {
        id: data.user_id || 'user-default',
        email,
        username: email.split('@')[0],
      };

      setToken(jwt);
      setUser(userInfo);

      if (typeof window !== 'undefined') {
        localStorage.setItem(TOKEN_KEY, jwt);
        localStorage.setItem(USER_KEY, JSON.stringify(userInfo));
      }

      await fetchProfile(jwt);
    } catch (err: unknown) {
      const msg = parseFetchError(err, 'An error occurred during sign in.');
      setError(msg);
      throw new Error(msg);
    } finally {
      setIsLoading(false);
    }
  }, [fetchProfile]);

  const signup = useCallback(async (email: string, password: string, username: string, displayName?: string) => {
    setIsLoading(true);
    setError(null);
    try {
      const res = await fetch(`${BASE_URL}/auth/register`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          email,
          password,
          username,
          display_name: displayName || username,
        }),
      });

      let data: any = null;
      try {
        data = await res.json();
      } catch {
        // Response was not JSON
      }

      if (!res.ok) {
        throw new Error(parseApiError(data, res.status, 'Registration failed. Please check your information.'));
      }

      const jwt = data.access_token;
      const userInfo: UserInfo = data.user || {
        id: data.user_id || 'user-default',
        email,
        username,
      };

      setToken(jwt);
      setUser(userInfo);

      if (typeof window !== 'undefined') {
        localStorage.setItem(TOKEN_KEY, jwt);
        localStorage.setItem(USER_KEY, JSON.stringify(userInfo));
      }

      await fetchProfile(jwt);
    } catch (err: unknown) {
      const msg = parseFetchError(err, 'An error occurred during sign up.');
      setError(msg);
      throw new Error(msg);
    } finally {
      setIsLoading(false);
    }
  }, [fetchProfile]);

  const logout = useCallback(async () => {
    if (token) {
      try {
        await fetch(`${BASE_URL}/auth/logout`, {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json',
          },
        });
      } catch {
        // Ignore network errors on logout
      }
    }

    setToken(null);
    setUser(null);
    setProfile(null);

    if (typeof window !== 'undefined') {
      localStorage.removeItem(TOKEN_KEY);
      localStorage.removeItem(USER_KEY);
    }
  }, [token]);

  const updateProfile = useCallback(async (updates: Partial<UserProfileResponse>) => {
    if (!token) {
      throw new Error('You must be signed in to update your profile.');
    }
    setError(null);
    try {
      const res = await fetch(`${BASE_URL}/auth/profile`, {
        method: 'PATCH',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(updates),
      });

      let data: any = null;
      try {
        data = await res.json();
      } catch {
        // Not JSON
      }

      if (!res.ok) {
        throw new Error(parseApiError(data, res.status, 'Failed to update profile.'));
      }

      setProfile(data);
    } catch (err: unknown) {
      const msg = parseFetchError(err, 'Failed to update profile.');
      setError(msg);
      throw new Error(msg);
    }
  }, [token]);

  const forgotPassword = useCallback(async (email: string) => {
    setError(null);
    try {
      const res = await fetch(`${BASE_URL}/auth/forgot-password`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email }),
      });

      let data: any = null;
      try {
        data = await res.json();
      } catch {
        // Not JSON
      }

      if (!res.ok) {
        throw new Error(parseApiError(data, res.status, 'Failed to request password reset.'));
      }
      return data;
    } catch (err: unknown) {
      const msg = parseFetchError(err, 'Failed to request password reset.');
      setError(msg);
      throw new Error(msg);
    }
  }, []);

  const resetPassword = useCallback(async (email: string, newPassword: string, resetToken?: string) => {
    setError(null);
    try {
      const res = await fetch(`${BASE_URL}/auth/reset-password`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          email,
          new_password: newPassword,
          reset_token: resetToken,
        }),
      });

      let data: any = null;
      try {
        data = await res.json();
      } catch {
        // Not JSON
      }

      if (!res.ok) {
        throw new Error(parseApiError(data, res.status, 'Failed to reset password.'));
      }
      return data;
    } catch (err: unknown) {
      const msg = parseFetchError(err, 'Failed to reset password.');
      setError(msg);
      throw new Error(msg);
    }
  }, []);

  return (
    <AuthContext.Provider
      value={{
        user,
        profile,
        token,
        isLoading,
        isAuthenticated: !!token && !!user,
        error,
        login,
        signup,
        logout,
        updateProfile,
        forgotPassword,
        resetPassword,
        clearError,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

const defaultAuthContextValue: AuthContextType = {
  user: null,
  profile: null,
  token: null,
  isLoading: false,
  isAuthenticated: false,
  error: null,
  login: async () => {},
  signup: async () => {},
  logout: async () => {},
  updateProfile: async () => {},
  forgotPassword: async () => ({ message: '' }),
  resetPassword: async () => ({ message: '' }),
  clearError: () => {},
};

export function useAuth() {
  const context = useContext(AuthContext);
  return context || defaultAuthContextValue;
}
