import React, { createContext, useState, useEffect } from 'react';
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
          // Token is invalid/expired, clear silently
          localStorage.removeItem('token');
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

  const logout = () => {
    localStorage.removeItem('token');
    setUser(null);
    setRole(null);
    setProfile(null);
    setToken(null);
    setIsAuthenticated(false);
    setIsLoading(false);
    
    // Redirect to login page
    window.location.href = '/';
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
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}
