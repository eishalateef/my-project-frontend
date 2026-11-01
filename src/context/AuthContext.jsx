import React, { createContext, useContext, useState, useEffect } from 'react';
import axios from 'axios';

const AuthContext = createContext(null);

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(() => {
    try {
      const savedUser = localStorage.getItem('flexi_user');
      return savedUser ? JSON.parse(savedUser) : null;
    } catch (e) {
      return null;
    }
  });

  const [token, setToken] = useState(() => localStorage.getItem('flexi_token') || '');
  const [loading, setLoading] = useState(false);
  const [authModalOpen, setAuthModalOpen] = useState(false);
  const [modalDefaultTab, setModalDefaultTab] = useState('login'); // 'login' | 'register'
  const [isDemoMode, setIsDemoMode] = useState(() => {
    try {
      const stored = localStorage.getItem('portfolio_demo_mode');
      return stored !== 'false'; // Enabled by default for portfolio showcase
    } catch {
      return true;
    }
  });

  // Update Axios Authorization header and register security 401 interceptor
  useEffect(() => {
    if (token) {
      axios.defaults.headers.common['Authorization'] = `Bearer ${token}`;
    } else {
      delete axios.defaults.headers.common['Authorization'];
    }

    // Security Interceptor: Cleanly revoke session if token is invalid or expired
    const interceptor = axios.interceptors.response.use(
      (response) => response,
      (error) => {
        if (error.response?.status === 401) {
          setUser(null);
          setToken('');
          try {
            localStorage.removeItem('flexi_user');
            localStorage.removeItem('flexi_token');
          } catch (e) {}
          delete axios.defaults.headers.common['Authorization'];
        }
        return Promise.reject(error);
      }
    );

    return () => axios.interceptors.response.eject(interceptor);
  }, [token]);

  const login = async (email, password) => {
    setLoading(true);
    try {
      const res = await axios.post('/api/auth/login', {
        email: (email || '').trim().toLowerCase(),
        password,
      });
      if (res.data.success) {
        setUser(res.data.user);
        setToken(res.data.token);
        localStorage.setItem('flexi_user', JSON.stringify(res.data.user));
        localStorage.setItem('flexi_token', res.data.token);
        setAuthModalOpen(false);
        return { success: true, user: res.data.user };
      }
      return { success: false, message: 'Login failed' };
    } catch (err) {
      const msg =
        err.response?.data?.message ||
        err.response?.data?.errors?.email?.[0] ||
        err.response?.data?.errors?.password?.[0] ||
        'Invalid email address or password.';
      return { success: false, message: msg };
    } finally {
      setLoading(false);
    }
  };

  const register = async (formData) => {
    setLoading(true);
    try {
      const res = await axios.post('/api/auth/register', formData);
      if (res.data.success) {
        setUser(res.data.user);
        setToken(res.data.token);
        localStorage.setItem('flexi_user', JSON.stringify(res.data.user));
        localStorage.setItem('flexi_token', res.data.token);
        setAuthModalOpen(false);
        return { success: true, user: res.data.user };
      }
      return { success: false, message: 'Registration failed' };
    } catch (err) {
      const msg = err.response?.data?.message || 'Registration failed. Check inputs.';
      return { success: false, message: msg };
    } finally {
      setLoading(false);
    }
  };

  // Instant 1-Click login helper for evaluation & testing
  const quickLogin = async (roleType) => {
    let email = 'admin@flexistore.com';
    let password = 'admin12345';

    if (roleType === 'shopper' || roleType === 'customer') {
      email = 'shopper@flexistore.com';
      password = 'shopper123';
    } else if (roleType === 'delivery' || roleType === 'rider') {
      email = 'rider@flexistore.com';
      password = 'rider123';
    }

    return await login(email, password);
  };

  // Dedicated Portfolio Demo Mode Activator for Distinct Roles (Customer, Courier, Admin)
  const loginAsDemoRole = async (role = 'customer') => {
    let email = 'customer@demo.com';
    let password = 'demo123';

    if (role === 'admin') {
      email = 'admin@demo.com';
    } else if (role === 'courier' || role === 'delivery') {
      email = 'courier@demo.com';
    } else {
      email = 'customer@demo.com';
    }

    const res = await login(email, password);
    if (res.success) {
      setIsDemoMode(true);
      try {
        localStorage.setItem('portfolio_demo_mode', 'true');
        if (role === 'customer') {
          // Dispatch custom event to notify listeners (e.g. CartContext) to populate demo bag
          window.dispatchEvent(new CustomEvent('portfolio_demo_activated'));
        }
      } catch (e) {
        console.warn('Demo mode localStorage set failed:', e);
      }
      setAuthModalOpen(false);
      return { success: true, user: res.user, role: res.user.role };
    }
    return res;
  };

  const enableDemoMode = () => {
    setIsDemoMode(true);
    try {
      localStorage.setItem('portfolio_demo_mode', 'true');
    } catch (e) {}
  };

  const closeDemoMode = async () => {
    setIsDemoMode(false);
    try {
      localStorage.removeItem('portfolio_demo_mode');
    } catch (e) {}
    // If logged in under a demo account, cleanly log out so the site returns to 100% real state
    if (user?.email?.includes('@demo.com') || user?.email?.includes('@flexistore.com')) {
      await logout();
    }
  };

  const toggleDemoMode = () => {
    if (isDemoMode) {
      closeDemoMode();
    } else {
      enableDemoMode();
    }
  };

  const activateDemoMode = async () => {
    enableDemoMode();
    return await loginAsDemoRole('customer');
  };

  const exitDemoMode = async () => {
    await closeDemoMode();
  };

  const logout = async () => {
    try {
      if (token) {
        await axios.post('/api/auth/logout');
      }
    } catch (e) {
      // ignore network errors on logout
    } finally {
      setUser(null);
      setToken('');
      localStorage.removeItem('flexi_user');
      localStorage.removeItem('flexi_token');
      delete axios.defaults.headers.common['Authorization'];
    }
  };

  const updateProfile = async (data) => {
    try {
      const res = await axios.put('/api/customer/profile', data);
      if (res.data.success) {
        setUser(res.data.user);
        localStorage.setItem('flexi_user', JSON.stringify(res.data.user));
        return { success: true };
      }
    } catch (err) {
      return { success: false, message: err.response?.data?.message || 'Failed to update profile' };
    }
  };

  const openLoginModal = (tab = 'login') => {
    setModalDefaultTab(tab);
    setAuthModalOpen(true);
  };

  const closeLoginModal = () => {
    setAuthModalOpen(false);
  };

  const value = {
    user,
    token,
    loading,
    isAuthenticated: !!user,
    isAdmin: user?.role === 'admin',
    isDelivery: user?.role === 'delivery',
    isCustomer: user?.role === 'customer' || !user?.role,
    isDemoMode: Boolean(isDemoMode),
    enableDemoMode,
    closeDemoMode,
    toggleDemoMode,
    loginAsDemoRole,
    activateDemoMode,
    exitDemoMode,
    login,
    register,
    quickLogin,
    logout,
    updateProfile,
    authModalOpen,
    modalDefaultTab,
    openLoginModal,
    closeLoginModal,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};
