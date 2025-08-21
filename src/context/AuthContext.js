import React, { createContext, useState, useEffect, useContext } from 'react';

export const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const bootstrap = async () => {
      try {
        const res = await fetch('http://localhost:8000/auth/me', {
          method: 'GET',
          credentials: 'include',
        });
        if (res.ok) {
          const data = await res.json();
          setUser(data.user);
          setIsLoggedIn(true);
        } else {
          setIsLoggedIn(false);
          setUser(null);
        }
      } catch (e) {
        setIsLoggedIn(false);
        setUser(null);
      } finally {
        setLoading(false);
      }
    };
    bootstrap();
  }, []);

  const login = async (email, password) => {
    const response = await fetch('http://localhost:8000/auth/login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, password }),
      credentials: 'include',
    });
    if (!response.ok) {
      const err = await response.json();
      throw new Error(err.message || 'Login failed');
    }
    const data = await response.json();
    setUser(data.user);
    setIsLoggedIn(true);
    return data.user;
  };

  const register = async (payload) => {
    const response = await fetch('http://localhost:8000/auth/register', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
      credentials: 'include',
    });
    if (!response.ok) {
      const err = await response.json();
      throw new Error(err.message || 'Registration failed');
    }
    return response.json();
  };

  const logout = async () => {
    try {
      const response = await fetch('http://localhost:8000/auth/logout', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
      });
      setIsLoggedIn(false);
      setUser(null);
      return response.ok;
    } catch (error) {
      setIsLoggedIn(false);
      setUser(null);
      return false;
    }
  };

  return (
    <AuthContext.Provider value={{ isLoggedIn, user, login, register, logout, loading }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);

