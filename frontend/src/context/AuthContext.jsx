import {
  createContext, useState, useEffect, useContext, useCallback, useMemo,
} from 'react';
import PropTypes from 'prop-types';
import authService from '../services/auth.service';

const AuthContext = createContext();

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  const checkAuth = useCallback(async () => {
    try {
      const response = await authService.getMe();
      setUser(response.data.user);
      setIsAuthenticated(true);
    } catch (error) {
      setUser(null);
      setIsAuthenticated(false);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    checkAuth();
  }, [checkAuth]);

  const login = useCallback(async (credentials) => {
    const response = await authService.login(credentials);
    setUser(response.data.user);
    setIsAuthenticated(true);
    return response;
  }, []);

  const signup = useCallback(async (userData) => {
    const response = await authService.signup(userData);
    setUser(response.data.user);
    setIsAuthenticated(true);
    return response;
  }, []);

  const logout = useCallback(async () => {
    await authService.logout();
    setUser(null);
    setIsAuthenticated(false);
  }, []);

  const value = useMemo(
    () => ({
      user,
      isAuthenticated,
      isLoading,
      login,
      signup,
      logout,
      checkAuth,
    }),
    [user, isAuthenticated, isLoading, login, signup, logout, checkAuth],
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

AuthProvider.propTypes = {
  children: PropTypes.node.isRequired,
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within AuthProvider');
  }
  return context;
};
