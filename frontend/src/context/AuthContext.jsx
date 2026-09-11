import { createContext, useContext, useState, useEffect } from 'react';
import { authAPI } from '../services/api';

const AuthContext = createContext(null);

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  // Check for existing session on mount
  useEffect(() => {
    const checkAuth = async () => {
      const token = localStorage.getItem('ridesmart_token');
      const savedUser = localStorage.getItem('ridesmart_user');

      if (token && savedUser) {
        try {
          const { data } = await authAPI.getMe();
          setUser(data.user);
        } catch {
          // Token is invalid/expired — clear everything
          localStorage.removeItem('ridesmart_token');
          localStorage.removeItem('ridesmart_user');
          setUser(null);
        }
      }
      setLoading(false);
    };

    checkAuth();
  }, []);

  const login = async (email, password) => {
    const { data } = await authAPI.login({ email, password });
    localStorage.setItem('ridesmart_token', data.token);
    localStorage.setItem('ridesmart_user', JSON.stringify(data.user));
    setUser(data.user);
    return data;
  };

  const register = async (firstName, lastName, email, password) => {
    const { data } = await authAPI.register({ firstName, lastName, email, password });
    localStorage.setItem('ridesmart_token', data.token);
    localStorage.setItem('ridesmart_user', JSON.stringify(data.user));
    setUser(data.user);
    return data;
  };

  const logout = () => {
    localStorage.removeItem('ridesmart_token');
    localStorage.removeItem('ridesmart_user');
    setUser(null);
  };

  const updateProfile = async (profileData) => {
    const { data } = await authAPI.updateProfile(profileData);
    localStorage.setItem('ridesmart_user', JSON.stringify(data.user));
    setUser(data.user);
    return data;
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        loading,
        login,
        register,
        logout,
        updateProfile,
        isAuthenticated: !!user,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};
