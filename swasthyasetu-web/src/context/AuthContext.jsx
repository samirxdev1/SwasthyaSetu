import React, { createContext, useContext, useState, useEffect } from 'react';
import authService from '../services/authService';

export const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [role, setRole] = useState(null);
  const [profile, setProfile] = useState(null);
  const [token, setToken] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isAuthenticated, setIsAuthenticated] = useState(false);

  // Rehydrate session on mount
  useEffect(() => {
    const rehydrate = async () => {
      const storedToken = localStorage.getItem('token');
      if (storedToken) {
        try {
          const response = await authService.getCurrentUser();
          if (response && response.success && response.data) {
            const { user: userData, profile: profileData } = response.data;
            setUser(userData);
            setRole(userData.role);
            setProfile(profileData);
            setToken(storedToken);
            setIsAuthenticated(true);
          } else {
            // Invalid response shape, clear session
            localStorage.removeItem('token');
          }
        } catch (error) {
          // Only clear token if server explicitly rejected auth (401 / 403)
          if (error.response?.status === 401 || error.response?.status === 403) {
            localStorage.removeItem('token');
          } else {
            console.warn('Backend reachability issue during session rehydration:', error.message);
          }
        }
      }
      setIsLoading(false);
    };

    rehydrate();
  }, []);

  const login = async (identifier, password) => {
    setIsLoading(true);
    try {
      const response = await authService.loginUser(identifier, password);
      if (response && response.success && response.data) {
        const { user: userData, role: userRole, profile: profileData, token: userToken } = response.data;
        
        localStorage.setItem('token', userToken);
        
        setUser(userData);
        setRole(userRole || userData.role);
        setProfile(profileData);
        setToken(userToken);
        setIsAuthenticated(true);
        
        setIsLoading(false);
        return response.data;
      } else {
        throw new Error('Login failed. Invalid credentials or response.');
      }
    } catch (error) {
      setIsLoading(false);
      throw error;
    }
  };

  const logout = (redirect = true) => {
    localStorage.removeItem('token');
    setUser(null);
    setRole(null);
    setProfile(null);
    setToken(null);
    setIsAuthenticated(false);
    setIsLoading(false);
    
    if (redirect) {
      window.location.href = '/';
    }
  };

  const updateUserProfile = async (profileData) => {
    const response = await authService.updateProfile(profileData);
    if (response && response.success && response.data) {
      const { user: userData, profile: updatedProf } = response.data;
      if (userData) setUser(userData);
      if (updatedProf) setProfile(updatedProf);
      return response.data;
    }
    return response;
  };

  const value = {
    user,
    role,
    profile,
    token,
    isLoading,
    isAuthenticated,
    login,
    logout,
    updateUserProfile,
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
