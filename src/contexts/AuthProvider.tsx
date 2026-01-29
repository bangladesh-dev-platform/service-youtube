import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { AuthContext, CompleteLoginPayload, RawUserPayload } from './authContext';
import { User } from '../types';
import { API_BASE_URL, AUTH_UI_BASE_URL } from '../config/env';
import { POST_LOGIN_REDIRECT_KEY } from '../constants/auth';

const ACCESS_TOKEN_KEY = 'bdp_access_token';
const REFRESH_TOKEN_KEY = 'bdp_refresh_token';

const decodeJwtPayload = (token: string): { exp?: number } | null => {
  try {
    const [, payload] = token.split('.');
    if (!payload) return null;
    const normalized = payload.replace(/-/g, '+').replace(/_/g, '/');
    const padded = normalized.padEnd(Math.ceil(normalized.length / 4) * 4, '=');
    const decoded = atob(padded);
    return JSON.parse(decoded);
  } catch {
    return null;
  }
};

const buildAvatarFallback = (displayName: string) => {
  const name = encodeURIComponent(displayName);
  return `https://ui-avatars.com/api/?name=${name}&background=ef4444&color=fff`;
};

const normalizeUser = (payload?: RawUserPayload | null): User => {
  const displayName = payload?.full_name || payload?.first_name || payload?.email || 'User';
  return {
    id: payload?.id ?? '',
    name: displayName,
    email: payload?.email ?? '',
    avatar: payload?.avatar_url ?? buildAvatarFallback(displayName),
    watchHistory: payload?.watch_history ?? [],
    favorites: payload?.favorites ?? [],
    playlists: payload?.playlists ?? [],
    roles: payload?.roles ?? [],
    permissions: payload?.permissions ?? [],
    emailVerified: payload?.email_verified ?? false,
  };
};

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [accessToken, setAccessToken] = useState<string | null>(() => {
    if (typeof window === 'undefined') return null;
    return localStorage.getItem(ACCESS_TOKEN_KEY);
  });
  const [refreshToken, setRefreshToken] = useState<string | null>(() => {
    if (typeof window === 'undefined') return null;
    return localStorage.getItem(REFRESH_TOKEN_KEY);
  });
  const [isLoading, setIsLoading] = useState(true);

  const refreshTimeoutRef = useRef<number | undefined>(undefined);
  const refreshTokenRef = useRef<string | null>(refreshToken);

  useEffect(() => {
    refreshTokenRef.current = refreshToken;
  }, [refreshToken]);

  const persistTokens = useCallback((nextAccessToken: string, nextRefreshToken?: string | null) => {
    if (typeof window !== 'undefined') {
      localStorage.setItem(ACCESS_TOKEN_KEY, nextAccessToken);
      if (typeof nextRefreshToken !== 'undefined') {
        if (nextRefreshToken) {
          localStorage.setItem(REFRESH_TOKEN_KEY, nextRefreshToken);
        } else {
          localStorage.removeItem(REFRESH_TOKEN_KEY);
        }
      }
    }

    setAccessToken(nextAccessToken);

    if (typeof nextRefreshToken !== 'undefined') {
      setRefreshToken(nextRefreshToken ?? null);
    }
  }, []);

  const clearSession = useCallback(() => {
    if (typeof window !== 'undefined') {
      localStorage.removeItem(ACCESS_TOKEN_KEY);
      localStorage.removeItem(REFRESH_TOKEN_KEY);
      sessionStorage.removeItem(POST_LOGIN_REDIRECT_KEY);
    }

    if (refreshTimeoutRef.current) {
      window.clearTimeout(refreshTimeoutRef.current);
      refreshTimeoutRef.current = undefined;
    }

    setAccessToken(null);
    setRefreshToken(null);
    setUser(null);
  }, []);

  const loadUserProfile = useCallback(async (tokenOverride?: string) => {
    const token = tokenOverride ?? accessToken;
    if (!token) {
      throw new Error('Missing access token');
    }

    const response = await fetch(`${API_BASE_URL}/api/v1/users/me`, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
      credentials: 'include',
    });

    const payload = await response.json().catch(() => null);

    if (!response.ok || !payload?.data) {
      const errorMessage = payload?.error?.message ?? 'Unable to load profile';
      throw new Error(errorMessage);
    }

    const normalizedUser = normalizeUser(payload.data);
    setUser(normalizedUser);
    return normalizedUser;
  }, [accessToken]);

  const refreshSession = useCallback(async () => {
    const token = refreshTokenRef.current;
    if (!token) {
      throw new Error('Missing refresh token');
    }

    const response = await fetch(`${API_BASE_URL}/api/v1/auth/refresh`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ refresh_token: token }),
      credentials: 'include',
    });

    const payload = await response.json().catch(() => null);

    if (!response.ok || !payload?.data) {
      const errorMessage = payload?.error?.message ?? 'Unable to refresh session';
      throw new Error(errorMessage);
    }

    const data = payload.data;
    const newAccessToken: string = data.access_token;
    const newRefreshToken: string | null = data.refresh_token ?? null;

    persistTokens(newAccessToken, newRefreshToken);

    if (data.user) {
      setUser(normalizeUser(data.user));
    } else {
      await loadUserProfile(newAccessToken);
    }

    return { accessToken: newAccessToken, refreshToken: newRefreshToken };
  }, [loadUserProfile, persistTokens]);

  useEffect(() => {
    if (refreshTimeoutRef.current) {
      window.clearTimeout(refreshTimeoutRef.current);
      refreshTimeoutRef.current = undefined;
    }

    if (!accessToken || !refreshTokenRef.current) {
      return;
    }

    const payload = decodeJwtPayload(accessToken);
    if (!payload?.exp) {
      return;
    }

    const expiresAt = payload.exp * 1000;
    const refreshDelay = Math.max(expiresAt - Date.now() - 60_000, 5_000);

    refreshTimeoutRef.current = window.setTimeout(() => {
      refreshSession().catch(() => {
        clearSession();
      });
    }, refreshDelay);

    return () => {
      if (refreshTimeoutRef.current) {
        window.clearTimeout(refreshTimeoutRef.current);
        refreshTimeoutRef.current = undefined;
      }
    };
  }, [accessToken, refreshSession, clearSession]);

  useEffect(() => {
    let isMounted = true;

    const bootstrap = async () => {
      if (!accessToken) {
        if (isMounted) {
          setIsLoading(false);
        }
        return;
      }

      try {
        await loadUserProfile(accessToken);
      } catch (error) {
        console.error('Initial profile load failed', error);
        if (refreshTokenRef.current) {
          try {
            const tokens = await refreshSession();
            await loadUserProfile(tokens.accessToken);
          } catch (innerError) {
            console.error('Failed to refresh session', innerError);
            clearSession();
          }
        } else {
          clearSession();
        }
      } finally {
        if (isMounted) {
          setIsLoading(false);
        }
      }
    };

    bootstrap();

    return () => {
      isMounted = false;
    };
  }, [accessToken, loadUserProfile, refreshSession, clearSession]);

  const login = useCallback((redirectPath?: string) => {
    if (typeof window === 'undefined') return;

    const desiredPath = redirectPath || `${window.location.pathname}${window.location.search}` || '/';
    sessionStorage.setItem(POST_LOGIN_REDIRECT_KEY, desiredPath === '/login' ? '/' : desiredPath);

    const loginUrl = new URL(AUTH_UI_BASE_URL);
    loginUrl.searchParams.set('redirect_url', `${window.location.origin}/auth/callback`);

    window.location.href = loginUrl.toString();
  }, []);

  const completeLogin = useCallback(async ({ accessToken: token, refreshToken }: CompleteLoginPayload) => {
    persistTokens(token, typeof refreshToken === 'undefined' ? null : refreshToken);
    await loadUserProfile(token);
  }, [loadUserProfile, persistTokens]);

  const logout = useCallback(async () => {
    const token = refreshTokenRef.current;

    try {
      if (token) {
        await fetch(`${API_BASE_URL}/api/v1/auth/logout`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ refresh_token: token }),
          credentials: 'include',
        });
      }
    } catch (error) {
      console.warn('Failed to log out cleanly', error);
    } finally {
      clearSession();
    }
  }, [clearSession]);

  const value = useMemo(
    () => ({
      user,
      accessToken,
      isAuthenticated: !!user,
      isLoading,
      login,
      logout,
      refreshSession,
      completeLogin,
    }),
    [user, accessToken, isLoading, login, logout, refreshSession, completeLogin]
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};
