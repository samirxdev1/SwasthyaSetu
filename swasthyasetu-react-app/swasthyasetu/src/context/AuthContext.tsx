import React, { createContext, useContext, useEffect, useState, useCallback, ReactNode } from 'react';
import { authApi, patientApi, PatientProfile, User } from '@/services/endpoints';
import { setToken, getToken } from '@/services/api';

interface AuthState {
  token: string | null;
  user: User | null;
  profile: PatientProfile | null;
  isLoading: boolean;
  isAuthenticated: boolean;
  error: string | null;
}

interface AuthContextType extends AuthState {
  login: (identifier: string, password: string) => Promise<{ success: boolean; message: string }>;
  logout: () => Promise<void>;
  refreshProfile: () => Promise<void>;
  clearError: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [token, setTokenState] = useState<string | null>(null);
  const [user, setUser] = useState<User | null>(null);
  const [profile, setProfile] = useState<PatientProfile | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const clearError = useCallback(() => setError(null), []);

  const loadStoredToken = useCallback(async () => {
    setIsLoading(true);
    try {
      const storedToken = await getToken();
      if (storedToken) {
        setTokenState(storedToken);
        const meRes = await authApi.me();
        if (meRes.success && meRes.data) {
          if (meRes.data.user.role !== 'patient') {
            await setToken(null);
            setTokenState(null);
          } else {
            setUser(meRes.data.user);
            setProfile(meRes.data.profile as PatientProfile);
          }
        } else {
          await setToken(null);
          setTokenState(null);
        }
      }
    } catch (err: any) {
      if (err.response?.status === 401) {
        await setToken(null);
        setTokenState(null);
      }
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    loadStoredToken();
  }, [loadStoredToken]);

  const login = useCallback(async (identifier: string, password: string) => {
    setIsLoading(true);
    setError(null);
    try {
      const res = await authApi.login(identifier, password);
      if (res.success && res.data) {
        if (res.data.role !== 'patient') {
          setError('This account does not have patient access.');
          return { success: false, message: 'This account does not have patient access.' };
        }
        await setToken(res.data.token);
        setTokenState(res.data.token);
        setUser(res.data.user);
        setProfile(res.data.profile as PatientProfile);
        return { success: true, message: res.message };
      }
      setError(res.message || 'Login failed.');
      return { success: false, message: res.message || 'Login failed.' };
    } catch (err: any) {
      const msg = err.response?.data?.message || err.message || 'Login failed. Please check your credentials.';
      setError(msg);
      return { success: false, message: msg };
    } finally {
      setIsLoading(false);
    }
  }, []);

  const logout = useCallback(async () => {
    await setToken(null);
    setTokenState(null);
    setUser(null);
    setProfile(null);
    setError(null);
  }, []);

  const refreshProfile = useCallback(async () => {
    try {
      const res = await patientApi.getProfile();
      if (res.success && res.data) {
        setProfile(res.data);
      }
    } catch (_err) {
      // ignore
    }
  }, []);

  const value: AuthContextType = {
    token,
    user,
    profile,
    isLoading,
    isAuthenticated: !!token && !!user,
    error,
    login,
    logout,
    refreshProfile,
    clearError,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export const useAuth = () => {
  const ctx = useContext(AuthContext);
  if (!ctx) {
    throw new Error('useAuth must be used within AuthProvider');
  }
  return ctx;
};
