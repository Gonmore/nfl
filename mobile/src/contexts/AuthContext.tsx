import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { loginUser, registerUser, updateProfile } from '../services/api';
import { User } from '../types/api.types';

interface AuthContextType {
  user: User | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  login: (email: string, password: string) => Promise<void>;
  register: (username: string, email: string, password: string) => Promise<void>;
  logout: () => Promise<void>;
  updateUserProfile: (data: any) => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    loadUser();
  }, []);

  const loadUser = async () => {
    try {
      const token = await AsyncStorage.getItem('jwt');
      const userJson = await AsyncStorage.getItem('user');
      
      if (token && userJson) {
        setUser(JSON.parse(userJson));
        setIsAuthenticated(true);
      }
    } catch (error) {
      console.error('Error loading user:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const login = async (email: string, password: string) => {
    const response = await loginUser(email, password);
    await AsyncStorage.setItem('jwt', response.token);
    await AsyncStorage.setItem('user', JSON.stringify(response.user));
    setUser(response.user);
    setIsAuthenticated(true);
  };

  const register = async (username: string, email: string, password: string) => {
    const response = await registerUser(username, email, password);
    await AsyncStorage.setItem('jwt', response.token);
    await AsyncStorage.setItem('user', JSON.stringify(response.user));
    setUser(response.user);
    setIsAuthenticated(true);
  };

  const logout = async () => {
    await AsyncStorage.removeItem('jwt');
    await AsyncStorage.removeItem('user');
    setUser(null);
    setIsAuthenticated(false);
  };

  const updateUserProfile = async (data: any) => {
    const response = await updateProfile(data);
    await AsyncStorage.setItem('user', JSON.stringify(response.user));
    setUser(response.user);
  };

  return (
    <AuthContext.Provider
      value={{ user, isAuthenticated, isLoading, login, register, logout, updateUserProfile }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within AuthProvider');
  }
  return context;
};
