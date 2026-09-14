import React, { createContext, useState, useEffect, useContext, ReactNode } from 'react';
import { User, AuthContextType } from '../types';
import api from '../services/api';

const AuthContext = createContext<AuthContextType>({} as AuthContextType);

interface AuthProviderProps {
  children: ReactNode;
}

export const AuthProvider: React.FC<AuthProviderProps> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState<boolean>(true);

  // Check storage on startup to restore session
  useEffect(() => {
    const loadSession = async () => {
      try {
        const currentUser = await api.getCurrentUser();
        if (currentUser) {
          setUser(currentUser);
        }
      } catch (e) {
        console.error('Error loading session from AsyncStorage:', e);
      } finally {
        setLoading(false);
      }
    };
    loadSession();
  }, []);

  const login = async (emailOrNik: string, password: string): Promise<User> => {
    setLoading(true);
    try {
      const loggedUser = await api.login(emailOrNik, password);
      setUser(loggedUser);
      return loggedUser;
    } catch (error) {
      throw error;
    } finally {
      setLoading(false);
    }
  };

  const register = async (userData: User): Promise<User> => {
    setLoading(true);
    try {
      const registeredUser = await api.register(userData);
      return registeredUser;
    } catch (error) {
      throw error;
    } finally {
      setLoading(false);
    }
  };

  const logout = async (): Promise<void> => {
    setLoading(true);
    try {
      await api.logout();
      setUser(null);
    } catch (e) {
      console.error('Logout error:', e);
    } finally {
      setLoading(false);
    }
  };

  return (
    <AuthContext.Provider
      value={{
        isAuthenticated: !!user,
        user,
        loading,
        login,
        register,
        logout,
        setUser
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);
export default AuthContext;
