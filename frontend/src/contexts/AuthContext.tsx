import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { AuthResponse, UserProfile, authAPI } from '../services/api';

interface AuthContextType {
  user: UserProfile | null;
  accessToken: string | null;
  refreshToken: string | null;
  login: (authData: AuthResponse) => void;
  logout: () => void;
  isAuthenticated: boolean;
  isLoading: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

interface AuthProviderProps {
  children: ReactNode;
}

export const AuthProvider: React.FC<AuthProviderProps> = ({ children }) => {
  const [user, setUser] = useState<UserProfile | null>(null);
  const [accessToken, setAccessToken] = useState<string | null>(null);
  const [refreshToken, setRefreshToken] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    console.log('AuthContext initializing...');
    const storedAccessToken = localStorage.getItem('accessToken');
    const storedRefreshToken = localStorage.getItem('refreshToken');
    const storedUser = localStorage.getItem('user');

    console.log('Stored tokens:', {
      accessToken: !!storedAccessToken,
      refreshToken: !!storedRefreshToken,
      user: !!storedUser
    });

    if (storedAccessToken && storedRefreshToken && storedUser) {
      setAccessToken(storedAccessToken);
      setRefreshToken(storedRefreshToken);
      setUser(JSON.parse(storedUser));
      console.log('User authenticated from localStorage');
    } else {
      console.log('No valid authentication found in localStorage');
    }
    setIsLoading(false);
  }, []);

  const login = (authData: AuthResponse) => {
    console.log('AuthContext.login called with:', { 
      accessToken: authData.accessToken ? '***' : null,
      refreshToken: authData.refreshToken ? '***' : null,
      user: authData.user 
    });
    
    setAccessToken(authData.accessToken);
    setRefreshToken(authData.refreshToken);
    setUser(authData.user);
    localStorage.setItem('accessToken', authData.accessToken);
    localStorage.setItem('refreshToken', authData.refreshToken);
    localStorage.setItem('user', JSON.stringify(authData.user));
    
    console.log('AuthContext.login completed, localStorage updated');
  };

  const logout = async () => {
    try {
      if (refreshToken) {
        await authAPI.logout(refreshToken);
      }
    } catch (error) {
      console.error('Logout error:', error);
    } finally {
      setAccessToken(null);
      setRefreshToken(null);
      setUser(null);
      localStorage.removeItem('accessToken');
      localStorage.removeItem('refreshToken');
      localStorage.removeItem('user');
    }
  };

  const value: AuthContextType = {
    user,
    accessToken,
    refreshToken,
    login,
    logout,
    isAuthenticated: !!accessToken && !!user,
    isLoading,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};