import { createContext, useContext, useState, useEffect } from 'react';
import { api } from '../utils/api';

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [token, setToken] = useState(() => localStorage.getItem('auth_token'));
  const [loading, setLoading] = useState(true);

  // On mount, check if we have a stored token and validate it
  useEffect(() => {
    const storedToken = localStorage.getItem('auth_token');
    const storedUser = localStorage.getItem('auth_user');
    
    if (storedToken && storedUser) {
      try {
        setUser(JSON.parse(storedUser));
        setToken(storedToken);
      } catch {
        localStorage.removeItem('auth_token');
        localStorage.removeItem('auth_user');
      }
    }
    setLoading(false);
  }, []);

  const login = async (email, password) => {
    const data = await api.auth.login(email, password);
    const { user: userData, access_token } = data;
    
    setUser(userData);
    setToken(access_token);
    localStorage.setItem('auth_token', access_token);
    localStorage.setItem('auth_user', JSON.stringify(userData));
    
    return data;
  };

  const signup = async (email, password) => {
    const data = await api.auth.signup(email, password);
    const { user: userData, access_token } = data;
    
    if (access_token) {
      setUser(userData);
      setToken(access_token);
      localStorage.setItem('auth_token', access_token);
      localStorage.setItem('auth_user', JSON.stringify(userData));
    }
    
    return data;
  };

  const logout = () => {
    setUser(null);
    setToken(null);
    localStorage.removeItem('auth_token');
    localStorage.removeItem('auth_user');
  };

  return (
    <AuthContext.Provider value={{ user, token, loading, login, signup, logout, isAuthenticated: !!token }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
