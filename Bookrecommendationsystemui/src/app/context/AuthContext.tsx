import React, { createContext, useCallback, useContext, useEffect, useMemo, useState } from "react";
import {
  clearStoredAccessToken,
  fetchCurrentUser,
  getStoredAccessToken,
  loginWithCredentials,
  logoutRequest,
  setStoredAccessToken,
  type AuthenticatedUser,
} from "../lib/auth";

interface AuthContextValue {
  user: AuthenticatedUser | null;
  token: string | null;
  isAuthenticated: boolean;
  isInitializing: boolean;
  login: (email: string, password: string) => Promise<void>;
  logout: () => Promise<void>;
}

const AuthContext = createContext<AuthContextValue | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [token, setToken] = useState<string | null>(() => getStoredAccessToken());
  const [user, setUser] = useState<AuthenticatedUser | null>(null);
  const [isInitializing, setIsInitializing] = useState(true);

  const logout = useCallback(async () => {
    await logoutRequest();
    clearStoredAccessToken();
    setToken(null);
    setUser(null);
  }, []);

  useEffect(() => {
    let isMounted = true;

    async function bootstrapAuth() {
      if (!token) {
        if (isMounted) {
          setUser(null);
          setIsInitializing(false);
        }
        return;
      }

      try {
        const currentUser = await fetchCurrentUser(token);
        if (isMounted) {
          setUser(currentUser);
        }
      } catch {
        clearStoredAccessToken();
        if (isMounted) {
          setToken(null);
          setUser(null);
        }
      } finally {
        if (isMounted) {
          setIsInitializing(false);
        }
      }
    }

    void bootstrapAuth();
    return () => {
      isMounted = false;
    };
  }, [token]);

  const login = useCallback(async (email: string, password: string) => {
    const accessToken = await loginWithCredentials(email, password);
    const currentUser = await fetchCurrentUser(accessToken);
    setStoredAccessToken(accessToken);
    setToken(accessToken);
    setUser(currentUser);
    setIsInitializing(false);
  }, []);

  const value = useMemo<AuthContextValue>(
    () => ({
      user,
      token,
      isAuthenticated: Boolean(token),
      isInitializing,
      login,
      logout,
    }),
    [user, token, isInitializing, login, logout]
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth(): AuthContextValue {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used within an AuthProvider.");
  }
  return context;
}
