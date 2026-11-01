import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useStore } from '../context/StoreContext';
import {
  X,
  Lock,
  Mail,
  Phone,
  MapPin,
  ArrowRight,
  Eye,
  EyeOff,
  ShieldCheck,
  AlertCircle,
  LogIn,
  UserPlus,
  Building,
  Info,
  Sparkles,
  ShoppingBag,
  LayoutDashboard,
  Truck,
} from 'lucide-react';
import KhaamLogo from './KhaamLogo';

export default function AuthModal() {
  const navigate = useNavigate();
  const { authModalOpen, closeLoginModal, modalDefaultTab, login, register, loading, activateDemoMode, loginAsDemoRole, isDemoMode, enableDemoMode } = useAuth();
  const { store, storeType } = useStore();

  const [tab, setTab] = useState(modalDefaultTab || 'login');
  const [demoLoading, setDemoLoading] = useState(null); // 'customer' | 'admin' | 'delivery' | null

  // Login form state
  const [loginEmail, setLoginEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [rememberMe, setRememberMe] = useState(true);

  // Register form state
  const [regName, setRegName] = useState('');
  const [regUsername, setRegUsername] = useState('');
  const [regEmail, setRegEmail] = useState('');
  const [regPassword, setRegPassword] = useState('');
  const [showRegPassword, setShowRegPassword] = useState(false);
  const [regPhone, setRegPhone] = useState('');
  const [regAddress, setRegAddress] = useState('');
  const [regCity, setRegCity] = useState('Lahore');

  const [error, setError] = useState('');
  const [forgotNotice, setForgotNotice] = useState(false);

  // Keep tab synchronized when modalDefaultTab updates
  useEffect(() => {
    if (modalDefaultTab) {
      setTab(modalDefaultTab);
    }
    setError('');
    setForgotNotice(false);
  }, [modalDefaultTab, authModalOpen]);

  if (!authModalOpen) return null;

  const handleLoginSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setForgotNotice(false);

    if (!loginEmail.trim()) {
      setError('Please enter your email address.');
      return;
    }
    if (!password) {
      setError('Please enter your account password.');
      return;
    }

    const res = await login(loginEmail.trim(), password);
    if (!res.success) {
      setError(res.message || 'Invalid email address or password. Please try again.');
    }
  };

  const handleRegisterSubmit = async (e) => {
    e.preventDefault();
    setError('');

    if (!regName.trim()) {
      setError('Please enter your full name.');
      return;
    }
    if (!regEmail.trim()) {
      setError('Please enter a valid email address.');
      return;
    }
    if (!regPassword || regPassword.length < 6) {
      setError('Password must contain at least 6 characters.');
      return;
    }

    const res = await register({
      name: regName.trim(),
      username: regUsername.trim() || undefined,
      email: regEmail.trim(),
      password: regPassword,
      phone: regPhone.trim() || undefined,
      address: regAddress.trim() || undefined,
      city: regCity.trim() || undefined,
      role: 'customer',
    });

    if (!res.success) {
      setError(res.message || 'Registration failed. Please check your information.');
    }
  };

  const handleRoleDemoLogin = async (roleType) => {
    setDemoLoading(roleType);
    setError('');
    try {
      const res = await loginAsDemoRole(roleType);
      if (res.success) {
        closeLoginModal();
        if (roleType === 'admin') {
          navigate('/admin');
        } else if (roleType === 'delivery' || roleType === 'courier') {
          navigate('/delivery');
        } else {
          navigate('/');
        }
      } else {
        setError(res.message || `Failed to authenticate ${roleType} demo session.`);
      }
    } catch (err) {
      setError('Unable to launch demo mode. Please verify the backend service is running.');
    } finally {
      setDemoLoading(null);
    }
  };

  // Aesthetic per-theme variables
  const isJewelry = storeType === 'jewelry';
  const isClothing = storeType === 'clothing';
  const isGeneral = storeType === 'general';

  const modalBg = isJewelry ? '#131315' : 'var(--card-bg, #ffffff)';
  const modalBorder = isJewelry ? '1px solid #27272a' : '1px solid var(--border-color, #e2e8f0)';
  const inputBg = isJewelry ? '#1c1c21' : 'var(--surface, #f8fafc)';
  const inputBorder = isJewelry ? '#333338' : 'var(--border-color, #e2e8f0)';
  const inputColor = isJewelry ? '#f8fafc' : 'var(--text-main, #0f172a)';

  return (
    <div
      style={{
        position: 'fixed',
        inset: 0,
        zIndex: 2000,
        backgroundColor: 'rgba(0, 0, 0, 0.72)',
        backdropFilter: 'blur(10px)',
        WebkitBackdropFilter: 'blur(10px)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '1rem',
      }}
      onClick={(e) => {
        if (e.target === e.currentTarget) closeLoginModal();
      }}
    >
      <div
        className="animate-fade-in"
        style={{
          width: '100%',
          maxWidth: '500px',
          backgroundColor: modalBg,
          border: modalBorder,
          borderRadius: isJewelry ? '20px' : 'var(--radius, 16px)',
          boxShadow: isJewelry
            ? '0 25px 60px -15px rgba(0, 0, 0, 0.95), 0 0 35px rgba(212, 175, 55, 0.15)'
            : '0 25px 50px -12px rgba(0, 0, 0, 0.25)',
          overflow: 'hidden',
          color: inputColor,
          transition: 'all 0.25s ease',
        }}
      >
        {/* Header Section */}
        <div
          style={{
            padding: '1.5rem 1.75rem 1.25rem',
            borderBottom: isJewelry ? '1px solid #27272a' : '1px solid var(--border-color, #e2e8f0)',
            display: 'flex',
            alignItems: 'flex-start',
            justifyContent: 'space-between',
            backgroundColor: isJewelry ? '#18181c' : 'var(--surface, #f8fafc)',
          }}
        >
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.35rem' }}>
              {isClothing ? (
                <KhaamLogo variant="navbar" size="compact" />
              ) : (
                <span
                  style={{
                    fontSize: '1.25rem',
                    fontWeight: 900,
                    letterSpacing: '-0.02em',
                    fontFamily: 'var(--font-heading)',
                    color: isJewelry ? '#ffd700' : 'var(--text-main, #0f172a)',
                  }}
                >
                  {store?.name || 'FlexiStore Pro'}
                </span>
              )}
            </div>

            <p style={{ fontSize: '0.82rem', color: isJewelry ? '#94a3b8' : 'var(--text-muted, #64748b)', margin: 0 }}>
              {tab === 'login'
                ? 'Welcome back! Sign in to access your orders & checkout.'
                : 'Join us today for fast order tracking & exclusive perks.'}
            </p>
          </div>

          <button
            onClick={closeLoginModal}
            aria-label="Close dialog"
            style={{
              background: 'transparent',
              border: 'none',
              cursor: 'pointer',
              color: isJewelry ? '#94a3b8' : 'var(--text-muted, #64748b)',
              padding: '0.35rem',
              borderRadius: '999px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              transition: 'all 0.15s ease',
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.color = isJewelry ? '#ffffff' : '#0f172a';
              e.currentTarget.style.backgroundColor = isJewelry ? 'rgba(255,255,255,0.08)' : 'rgba(0,0,0,0.06)';
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.color = isJewelry ? '#94a3b8' : 'var(--text-muted, #64748b)';
              e.currentTarget.style.backgroundColor = 'transparent';
            }}
          >
            <X size={19} />
          </button>
        </div>

        {/* Tab Switcher: Sign In vs Create Account */}
        <div
          style={{
            display: 'flex',
            borderBottom: isJewelry ? '1px solid #27272a' : '1px solid var(--border-color, #e2e8f0)',
            backgroundColor: isJewelry ? '#131315' : 'var(--card-bg, #ffffff)',
          }}
        >
          <button
            type="button"
            onClick={() => {
              setTab('login');
              setError('');
              setForgotNotice(false);
            }}
            style={{
              flex: 1,
              padding: '0.9rem',
              fontSize: '0.88rem',
              fontWeight: 700,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '0.45rem',
              background: 'transparent',
              border: 'none',
              borderBottom: tab === 'login'
                ? isJewelry
                  ? '2px solid #ffd700'
                  : '2px solid var(--primary-color, #0f172a)'
                : '2px solid transparent',
              color: tab === 'login'
                ? isJewelry
                  ? '#ffd700'
                  : 'var(--primary-color, #0f172a)'
                : isJewelry
                  ? '#64748b'
                  : 'var(--text-muted, #64748b)',
              cursor: 'pointer',
              transition: 'all 0.15s ease',
            }}
          >
            <LogIn size={15} />
            <span>Sign In</span>
          </button>

          <button
            type="button"
            onClick={() => {
              setTab('register');
              setError('');
              setForgotNotice(false);
            }}
            style={{
              flex: 1,
              padding: '0.9rem',
              fontSize: '0.88rem',
              fontWeight: 700,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '0.45rem',
              background: 'transparent',
              border: 'none',
              borderBottom: tab === 'register'
                ? isJewelry
                  ? '2px solid #ffd700'
                  : '2px solid var(--primary-color, #0f172a)'
                : '2px solid transparent',
              color: tab === 'register'
                ? isJewelry
                  ? '#ffd700'
                  : 'var(--primary-color, #0f172a)'
                : isJewelry
                  ? '#64748b'
                  : 'var(--text-muted, #64748b)',
              cursor: 'pointer',
              transition: 'all 0.15s ease',
            }}
          >
            <UserPlus size={15} />
            <span>Create Account</span>
          </button>
        </div>

        {/* Modal Form Body */}
        <div style={{ padding: '1.4rem 1.6rem', maxHeight: '72vh', overflowY: 'auto' }}>
          {/* =========================================================================
              TOP 3 DEMO BUTTONS: VISIBLE ONLY IN PORTFOLIO DEMO MODE
              ========================================================================= */}
          {isDemoMode && (
            <>
              <div
                style={{
                  marginBottom: '1.25rem',
                  padding: '0.85rem 1rem',
                  borderRadius: '8px',
                  backgroundColor: '#111113',
                  border: '1px solid #27272A',
                  display: 'flex',
                  flexDirection: 'column',
                  gap: '0.65rem',
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.45rem' }}>
                    <Sparkles size={13} color="#E35205" />
                    <span
                      style={{
                        fontSize: '0.72rem',
                        fontWeight: 800,
                        letterSpacing: '0.08em',
                        textTransform: 'uppercase',
                        color: '#E4E4E7',
                      }}
                    >
                      Portfolio Role Preview
                    </span>
                  </div>
                  <span
                    style={{
                      fontSize: '0.62rem',
                      fontWeight: 600,
                      color: '#71717A',
                      letterSpacing: '0.04em',
                      textTransform: 'uppercase',
                    }}
                  >
                    1-Click Role Login
                  </span>
                </div>

                {/* The 3 Top Buttons Grid */}
                <div
                  style={{
                    display: 'grid',
                    gridTemplateColumns: 'repeat(3, 1fr)',
                    gap: '0.5rem',
                  }}
                >
                  {/* Button 1: Demo as a Customer */}
                  <button
                    type="button"
                    disabled={!!demoLoading}
                    onClick={() => handleRoleDemoLogin('customer')}
                    style={{
                      padding: '0.65rem 0.5rem',
                      borderRadius: '6px',
                      backgroundColor: '#18181B',
                      border: '1px solid #27272A',
                      color: '#FAFAFA',
                      cursor: demoLoading ? 'wait' : 'pointer',
                      display: 'flex',
                      flexDirection: 'column',
                      alignItems: 'center',
                      justifyContent: 'center',
                      gap: '0.3rem',
                      textAlign: 'center',
                      transition: 'all 0.18s ease',
                    }}
                    onMouseEnter={(e) => {
                      e.currentTarget.style.borderColor = '#E35205';
                      e.currentTarget.style.backgroundColor = '#222226';
                      e.currentTarget.style.transform = 'translateY(-1px)';
                    }}
                    onMouseLeave={(e) => {
                      e.currentTarget.style.borderColor = '#27272A';
                      e.currentTarget.style.backgroundColor = '#18181B';
                      e.currentTarget.style.transform = 'translateY(0)';
                    }}
                    title="Instant Login as Demo Customer (Preloaded Cart & Orders)"
                  >
                    <div style={{
                      width: '26px',
                      height: '26px',
                      borderRadius: '50%',
                      backgroundColor: 'rgba(227, 82, 5, 0.12)',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                    }}>
                      <ShoppingBag size={13} color="#FF7A33" />
                    </div>
                    <span style={{ fontSize: '0.74rem', fontWeight: 700, lineHeight: 1.2 }}>
                      {demoLoading === 'customer' ? 'Connecting...' : 'Customer'}
                    </span>
                    <span style={{ fontSize: '0.62rem', color: '#71717A', lineHeight: 1 }}>
                      Sara Shopper
                    </span>
                  </button>

                  {/* Button 2: Demo as an Admin */}
                  <button
                    type="button"
                    disabled={!!demoLoading}
                    onClick={() => handleRoleDemoLogin('admin')}
                    style={{
                      padding: '0.65rem 0.5rem',
                      borderRadius: '6px',
                      backgroundColor: '#18181B',
                      border: '1px solid #27272A',
                      color: '#FAFAFA',
                      cursor: demoLoading ? 'wait' : 'pointer',
                      display: 'flex',
                      flexDirection: 'column',
                      alignItems: 'center',
                      justifyContent: 'center',
                      gap: '0.3rem',
                      textAlign: 'center',
                      transition: 'all 0.18s ease',
                    }}
                    onMouseEnter={(e) => {
                      e.currentTarget.style.borderColor = '#F59E0B';
                      e.currentTarget.style.backgroundColor = '#222226';
                      e.currentTarget.style.transform = 'translateY(-1px)';
                    }}
                    onMouseLeave={(e) => {
                      e.currentTarget.style.borderColor = '#27272A';
                      e.currentTarget.style.backgroundColor = '#18181B';
                      e.currentTarget.style.transform = 'translateY(0)';
                    }}
                    title="Instant Login as Store Administrator (Executive Dashboard & Dispatch)"
                  >
                    <div style={{
                      width: '26px',
                      height: '26px',
                      borderRadius: '50%',
                      backgroundColor: 'rgba(245, 158, 11, 0.12)',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                    }}>
                      <LayoutDashboard size={13} color="#FBBF24" />
                    </div>
                    <span style={{ fontSize: '0.74rem', fontWeight: 700, lineHeight: 1.2 }}>
                      {demoLoading === 'admin' ? 'Connecting...' : 'Store Admin'}
                    </span>
                    <span style={{ fontSize: '0.62rem', color: '#71717A', lineHeight: 1 }}>
                      Executive Console
                    </span>
                  </button>

                  {/* Button 3: Demo as a Courier */}
                  <button
                    type="button"
                    disabled={!!demoLoading}
                    onClick={() => handleRoleDemoLogin('delivery')}
                    style={{
                      padding: '0.65rem 0.5rem',
                      borderRadius: '6px',
                      backgroundColor: '#18181B',
                      border: '1px solid #27272A',
                      color: '#FAFAFA',
                      cursor: demoLoading ? 'wait' : 'pointer',
                      display: 'flex',
                      flexDirection: 'column',
                      alignItems: 'center',
                      justifyContent: 'center',
                      gap: '0.3rem',
                      textAlign: 'center',
                      transition: 'all 0.18s ease',
                    }}
                    onMouseEnter={(e) => {
                      e.currentTarget.style.borderColor = '#10B981';
                      e.currentTarget.style.backgroundColor = '#222226';
                      e.currentTarget.style.transform = 'translateY(-1px)';
                    }}
                    onMouseLeave={(e) => {
                      e.currentTarget.style.borderColor = '#27272A';
                      e.currentTarget.style.backgroundColor = '#18181B';
                      e.currentTarget.style.transform = 'translateY(0)';
                    }}
                    title="Instant Login as Courier Fleet Rider (Active Deliveries & Statuses)"
                  >
                    <div style={{
                      width: '26px',
                      height: '26px',
                      borderRadius: '50%',
                      backgroundColor: 'rgba(16, 185, 129, 0.12)',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                    }}>
                      <Truck size={13} color="#34D399" />
                    </div>
                    <span style={{ fontSize: '0.74rem', fontWeight: 700, lineHeight: 1.2 }}>
                      {demoLoading === 'delivery' ? 'Connecting...' : 'Courier Fleet'}
                    </span>
                    <span style={{ fontSize: '0.62rem', color: '#71717A', lineHeight: 1 }}>
                      Tariq Rider
                    </span>
                  </button>
                </div>
              </div>

              {/* Divider */}
              <div
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '0.75rem',
                  marginBottom: '1rem',
                  color: '#94a3b8',
                  fontSize: '0.72rem',
                  fontWeight: 700,
                  textTransform: 'uppercase',
                  letterSpacing: '0.08em',
                }}
              >
                <div style={{ flex: 1, height: '1px', backgroundColor: '#e2e8f0' }} />
                <span>Or Sign In with Email</span>
                <div style={{ flex: 1, height: '1px', backgroundColor: '#e2e8f0' }} />
              </div>

              {/* Quick-Fill Demo Credentials Selector */}
              <div
                style={{
                  marginBottom: '1.15rem',
                  padding: '0.65rem 0.85rem',
                  borderRadius: '6px',
                  backgroundColor: isJewelry ? '#18181b' : '#F9FAFB',
                  border: isJewelry ? '1px solid #27272a' : '1px solid #E5E7EB',
                  display: 'flex',
                  flexDirection: 'column',
                  gap: '0.5rem',
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                  <span style={{ fontSize: '0.68rem', fontWeight: 700, color: 'var(--text-muted, #6B7280)', textTransform: 'uppercase', letterSpacing: '0.08em' }}>
                    Quick-Fill Demo Credentials
                  </span>
                  <span style={{ fontSize: '0.66rem', color: '#9CA3AF', letterSpacing: '0.02em' }}>PW: demo123</span>
                </div>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '0.45rem' }}>
                  <button
                    type="button"
                    onClick={() => {
                      setLoginEmail('customer@demo.com');
                      setPassword('demo123');
                    }}
                    style={{
                      padding: '0.45rem 0.55rem',
                      borderRadius: '5px',
                      border: loginEmail === 'customer@demo.com' 
                        ? (isJewelry ? '1.25px solid #FFFFFF' : '1.25px solid #111111') 
                        : (isJewelry ? '1px solid #27272A' : '1px solid #E5E7EB'),
                      backgroundColor: loginEmail === 'customer@demo.com' 
                        ? (isJewelry ? '#27272A' : '#FFFFFF') 
                        : 'transparent',
                      color: 'var(--text-main, #111827)',
                      fontSize: '0.72rem',
                      cursor: 'pointer',
                      textAlign: 'left',
                      transition: 'all 0.15s ease',
                      boxShadow: loginEmail === 'customer@demo.com' ? '0 1px 3px rgba(0,0,0,0.06)' : 'none',
                    }}
                  >
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.35rem', marginBottom: '0.15rem' }}>
                      <span style={{ width: '5px', height: '5px', borderRadius: '50%', backgroundColor: '#3B82F6', display: 'inline-block' }} />
                      <span style={{ fontWeight: 700, color: isJewelry ? '#FAFAFA' : '#111827', letterSpacing: '0.02em' }}>Customer</span>
                    </div>
                    <div style={{ fontSize: '0.62rem', color: '#9CA3AF', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>customer@demo.com</div>
                  </button>

                  <button
                    type="button"
                    onClick={() => {
                      setLoginEmail('admin@demo.com');
                      setPassword('demo123');
                    }}
                    style={{
                      padding: '0.45rem 0.55rem',
                      borderRadius: '5px',
                      border: loginEmail === 'admin@demo.com' 
                        ? (isJewelry ? '1.25px solid #FFFFFF' : '1.25px solid #111111') 
                        : (isJewelry ? '1px solid #27272A' : '1px solid #E5E7EB'),
                      backgroundColor: loginEmail === 'admin@demo.com' 
                        ? (isJewelry ? '#27272A' : '#FFFFFF') 
                        : 'transparent',
                      color: 'var(--text-main, #111827)',
                      fontSize: '0.72rem',
                      cursor: 'pointer',
                      textAlign: 'left',
                      transition: 'all 0.15s ease',
                      boxShadow: loginEmail === 'admin@demo.com' ? '0 1px 3px rgba(0,0,0,0.06)' : 'none',
                    }}
                  >
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.35rem', marginBottom: '0.15rem' }}>
                      <span style={{ width: '5px', height: '5px', borderRadius: '50%', backgroundColor: '#F59E0B', display: 'inline-block' }} />
                      <span style={{ fontWeight: 700, color: isJewelry ? '#FAFAFA' : '#111827', letterSpacing: '0.02em' }}>Admin</span>
                    </div>
                    <div style={{ fontSize: '0.62rem', color: '#9CA3AF', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>admin@demo.com</div>
                  </button>

                  <button
                    type="button"
                    onClick={() => {
                      setLoginEmail('courier@demo.com');
                      setPassword('demo123');
                    }}
                    style={{
                      padding: '0.45rem 0.55rem',
                      borderRadius: '5px',
                      border: loginEmail === 'courier@demo.com' 
                        ? (isJewelry ? '1.25px solid #FFFFFF' : '1.25px solid #111111') 
                        : (isJewelry ? '1px solid #27272A' : '1px solid #E5E7EB'),
                      backgroundColor: loginEmail === 'courier@demo.com' 
                        ? (isJewelry ? '#27272A' : '#FFFFFF') 
                        : 'transparent',
                      color: 'var(--text-main, #111827)',
                      fontSize: '0.72rem',
                      cursor: 'pointer',
                      textAlign: 'left',
                      transition: 'all 0.15s ease',
                      boxShadow: loginEmail === 'courier@demo.com' ? '0 1px 3px rgba(0,0,0,0.06)' : 'none',
                    }}
                  >
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.35rem', marginBottom: '0.15rem' }}>
                      <span style={{ width: '5px', height: '5px', borderRadius: '50%', backgroundColor: '#10B981', display: 'inline-block' }} />
                      <span style={{ fontWeight: 700, color: isJewelry ? '#FAFAFA' : '#111827', letterSpacing: '0.02em' }}>Courier</span>
                    </div>
                    <div style={{ fontSize: '0.62rem', color: '#9CA3AF', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>courier@demo.com</div>
                  </button>
                </div>
              </div>
            </>
          )}

          {/* Error Banner */}
          {error && (
            <div
              className="animate-fade-in"
              style={{
                padding: '0.75rem 1rem',
                borderRadius: '8px',
                backgroundColor: isJewelry ? 'rgba(239, 68, 68, 0.12)' : '#FEE2E2',
                border: isJewelry ? '1px solid rgba(239, 68, 68, 0.35)' : '1px solid #FECACA',
                color: isJewelry ? '#fca5a5' : '#991B1B',
                fontSize: '0.82rem',
                marginBottom: '1.25rem',
                fontWeight: 600,
                display: 'flex',
                alignItems: 'center',
                gap: '0.5rem',
              }}
            >
              <AlertCircle size={16} style={{ flexShrink: 0 }} />
              <span>{error}</span>
            </div>
          )}

          {/* Forgot Password Helper Notice */}
          {forgotNotice && (
            <div
              className="animate-fade-in"
              style={{
                padding: '0.75rem 1rem',
                borderRadius: '8px',
                backgroundColor: isJewelry ? 'rgba(59, 130, 246, 0.12)' : '#EFF6FF',
                border: isJewelry ? '1px solid rgba(59, 130, 246, 0.35)' : '1px solid #BFDBFE',
                color: isJewelry ? '#93c5fd' : '#1E40AF',
                fontSize: '0.8rem',
                marginBottom: '1.25rem',
                fontWeight: 500,
                display: 'flex',
                alignItems: 'flex-start',
                gap: '0.5rem',
              }}
            >
              <Info size={16} style={{ flexShrink: 0, marginTop: '2px' }} />
              <span>
                To reset your credentials, please contact support at support@flexistore.pk or consult your store manager.
              </span>
            </div>
          )}

          {tab === 'login' ? (
            /* =========================================================================
               AUTHENTIC PROFESSIONAL SIGN IN FORM
               ========================================================================= */
            <form onSubmit={handleLoginSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1.15rem' }}>
              <div>
                <label
                  style={{
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                    fontSize: '0.8rem',
                    fontWeight: 700,
                    marginBottom: '0.4rem',
                    color: isJewelry ? '#cbd5e1' : 'var(--text-main, #0f172a)',
                  }}
                >
                  <span>Email Address</span>
                </label>

                <div style={{ position: 'relative' }}>
                  <Mail
                    size={16}
                    style={{
                      position: 'absolute',
                      left: '14px',
                      top: '13px',
                      color: isJewelry ? '#64748b' : 'var(--text-muted, #64748b)',
                    }}
                  />
                  <input
                    type="email"
                    required
                    value={loginEmail}
                    onChange={(e) => setLoginEmail(e.target.value)}
                    placeholder="name@example.com"
                    autoComplete="email"
                    style={{
                      width: '100%',
                      padding: '0.7rem 1rem 0.7rem 40px',
                      fontSize: '0.9rem',
                      borderRadius: '10px',
                      backgroundColor: inputBg,
                      border: `1px solid ${inputBorder}`,
                      color: inputColor,
                      outline: 'none',
                      transition: 'border-color 0.2s ease, box-shadow 0.2s ease',
                    }}
                    onFocus={(e) => {
                      e.target.style.borderColor = isJewelry ? '#ffd700' : 'var(--primary-color, #0f172a)';
                      e.target.style.boxShadow = isJewelry
                        ? '0 0 0 3px rgba(212, 175, 55, 0.2)'
                        : '0 0 0 3px rgba(15, 23, 42, 0.08)';
                    }}
                    onBlur={(e) => {
                      e.target.style.borderColor = inputBorder;
                      e.target.style.boxShadow = 'none';
                    }}
                  />
                </div>
              </div>

              <div>
                <div
                  style={{
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                    marginBottom: '0.4rem',
                  }}
                >
                  <label
                    style={{
                      fontSize: '0.8rem',
                      fontWeight: 700,
                      color: isJewelry ? '#cbd5e1' : 'var(--text-main, #0f172a)',
                    }}
                  >
                    Password
                  </label>

                  <button
                    type="button"
                    onClick={() => setForgotNotice(true)}
                    style={{
                      fontSize: '0.74rem',
                      fontWeight: 600,
                      color: isJewelry ? '#ffd700' : 'var(--primary-color, #0f172a)',
                      background: 'transparent',
                      border: 'none',
                      cursor: 'pointer',
                      padding: 0,
                    }}
                  >
                    Forgot password?
                  </button>
                </div>

                <div style={{ position: 'relative' }}>
                  <Lock
                    size={16}
                    style={{
                      position: 'absolute',
                      left: '14px',
                      top: '13px',
                      color: isJewelry ? '#64748b' : 'var(--text-muted, #64748b)',
                    }}
                  />
                  <input
                    type={showPassword ? 'text' : 'password'}
                    required
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="Enter your password"
                    autoComplete="current-password"
                    style={{
                      width: '100%',
                      padding: '0.7rem 42px 0.7rem 40px',
                      fontSize: '0.9rem',
                      borderRadius: '10px',
                      backgroundColor: inputBg,
                      border: `1px solid ${inputBorder}`,
                      color: inputColor,
                      outline: 'none',
                      transition: 'border-color 0.2s ease, box-shadow 0.2s ease',
                    }}
                    onFocus={(e) => {
                      e.target.style.borderColor = isJewelry ? '#ffd700' : 'var(--primary-color, #0f172a)';
                      e.target.style.boxShadow = isJewelry
                        ? '0 0 0 3px rgba(212, 175, 55, 0.2)'
                        : '0 0 0 3px rgba(15, 23, 42, 0.08)';
                    }}
                    onBlur={(e) => {
                      e.target.style.borderColor = inputBorder;
                      e.target.style.boxShadow = 'none';
                    }}
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    aria-label={showPassword ? 'Hide password' : 'Show password'}
                    style={{
                      position: 'absolute',
                      right: '12px',
                      top: '12px',
                      background: 'transparent',
                      border: 'none',
                      cursor: 'pointer',
                      color: isJewelry ? '#94a3b8' : 'var(--text-muted, #64748b)',
                      display: 'flex',
                      alignItems: 'center',
                    }}
                  >
                    {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                  </button>
                </div>
              </div>

              {/* Remember Me Checkbox */}
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                <input
                  type="checkbox"
                  id="rememberMe"
                  checked={rememberMe}
                  onChange={(e) => setRememberMe(e.target.checked)}
                  style={{
                    width: '15px',
                    height: '15px',
                    accentColor: isJewelry ? '#ffd700' : 'var(--primary-color, #0f172a)',
                    cursor: 'pointer',
                  }}
                />
                <label
                  htmlFor="rememberMe"
                  style={{
                    fontSize: '0.8rem',
                    color: isJewelry ? '#94a3b8' : 'var(--text-muted, #64748b)',
                    cursor: 'pointer',
                  }}
                >
                  Remember me on this browser
                </label>
              </div>

              {/* Submit Button */}
              <button
                type="submit"
                disabled={loading}
                className="btn-primary"
                style={{
                  width: '100%',
                  height: '46px',
                  borderRadius: isJewelry ? '12px' : 'var(--radius, 12px)',
                  fontSize: '0.92rem',
                  fontWeight: 800,
                  cursor: loading ? 'not-allowed' : 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: '0.5rem',
                  marginTop: '0.35rem',
                  boxShadow: isJewelry
                    ? '0 4px 20px rgba(212, 175, 55, 0.35)'
                    : '0 4px 14px rgba(0,0,0,0.12)',
                  opacity: loading ? 0.75 : 1,
                }}
              >
                <span>{loading ? 'Authenticating...' : 'Sign In'}</span>
                {!loading && <ArrowRight size={17} />}
              </button>

              {/* Quick Tab Switcher */}
              <div
                style={{
                  textAlign: 'center',
                  fontSize: '0.82rem',
                  color: isJewelry ? '#94a3b8' : 'var(--text-muted, #64748b)',
                  marginTop: '0.35rem',
                }}
              >
                <span>Don't have an account yet? </span>
                <button
                  type="button"
                  onClick={() => {
                    setTab('register');
                    setError('');
                  }}
                  style={{
                    background: 'transparent',
                    border: 'none',
                    color: isJewelry ? '#ffd700' : 'var(--primary-color, #0f172a)',
                    fontWeight: 700,
                    cursor: 'pointer',
                    textDecoration: 'underline',
                    padding: 0,
                  }}
                >
                  Create one now
                </button>
              </div>
            </form>
          ) : (
            /* =========================================================================
               AUTHENTIC PROFESSIONAL REGISTRATION FORM
               ========================================================================= */
            <form onSubmit={handleRegisterSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.75rem' }}>
                <div>
                  <label
                    style={{
                      display: 'block',
                      fontSize: '0.8rem',
                      fontWeight: 700,
                      marginBottom: '0.35rem',
                      color: isJewelry ? '#cbd5e1' : 'var(--text-main, #0f172a)',
                    }}
                  >
                    Full Name *
                  </label>
                  <input
                    type="text"
                    required
                    value={regName}
                    onChange={(e) => setRegName(e.target.value)}
                    placeholder="Fatima Noor"
                    style={{
                      width: '100%',
                      padding: '0.65rem 0.85rem',
                      fontSize: '0.85rem',
                      borderRadius: '8px',
                      backgroundColor: inputBg,
                      border: `1px solid ${inputBorder}`,
                      color: inputColor,
                      outline: 'none',
                    }}
                  />
                </div>

                <div>
                  <label
                    style={{
                      display: 'block',
                      fontSize: '0.8rem',
                      fontWeight: 700,
                      marginBottom: '0.35rem',
                      color: isJewelry ? '#cbd5e1' : 'var(--text-main, #0f172a)',
                    }}
                  >
                    Username (@handle)
                  </label>
                  <input
                    type="text"
                    value={regUsername}
                    onChange={(e) => setRegUsername(e.target.value.toLowerCase().replace(/\s+/g, '_'))}
                    placeholder="fatima_noor"
                    style={{
                      width: '100%',
                      padding: '0.65rem 0.85rem',
                      fontSize: '0.85rem',
                      borderRadius: '8px',
                      backgroundColor: inputBg,
                      border: `1px solid ${inputBorder}`,
                      color: inputColor,
                      outline: 'none',
                    }}
                  />
                </div>
              </div>

              <div>
                <label
                  style={{
                    display: 'block',
                    fontSize: '0.8rem',
                    fontWeight: 700,
                    marginBottom: '0.35rem',
                    color: isJewelry ? '#cbd5e1' : 'var(--text-main, #0f172a)',
                  }}
                >
                  Email Address *
                </label>
                <div style={{ position: 'relative' }}>
                  <Mail
                    size={16}
                    style={{
                      position: 'absolute',
                      left: '12px',
                      top: '12px',
                      color: isJewelry ? '#64748b' : 'var(--text-muted, #64748b)',
                    }}
                  />
                  <input
                    type="email"
                    required
                    value={regEmail}
                    onChange={(e) => setRegEmail(e.target.value)}
                    placeholder="fatima@example.com"
                    autoComplete="email"
                    style={{
                      width: '100%',
                      padding: '0.65rem 0.85rem 0.65rem 38px',
                      fontSize: '0.85rem',
                      borderRadius: '8px',
                      backgroundColor: inputBg,
                      border: `1px solid ${inputBorder}`,
                      color: inputColor,
                      outline: 'none',
                    }}
                  />
                </div>
              </div>

              <div>
                <label
                  style={{
                    display: 'block',
                    fontSize: '0.8rem',
                    fontWeight: 700,
                    marginBottom: '0.35rem',
                    color: isJewelry ? '#cbd5e1' : 'var(--text-main, #0f172a)',
                  }}
                >
                  Password * (minimum 6 characters)
                </label>
                <div style={{ position: 'relative' }}>
                  <Lock
                    size={16}
                    style={{
                      position: 'absolute',
                      left: '12px',
                      top: '12px',
                      color: isJewelry ? '#64748b' : 'var(--text-muted, #64748b)',
                    }}
                  />
                  <input
                    type={showRegPassword ? 'text' : 'password'}
                    required
                    minLength={6}
                    value={regPassword}
                    onChange={(e) => setRegPassword(e.target.value)}
                    placeholder="••••••••"
                    autoComplete="new-password"
                    style={{
                      width: '100%',
                      padding: '0.65rem 38px 0.65rem 38px',
                      fontSize: '0.85rem',
                      borderRadius: '8px',
                      backgroundColor: inputBg,
                      border: `1px solid ${inputBorder}`,
                      color: inputColor,
                      outline: 'none',
                    }}
                  />
                  <button
                    type="button"
                    onClick={() => setShowRegPassword(!showRegPassword)}
                    style={{
                      position: 'absolute',
                      right: '12px',
                      top: '12px',
                      background: 'transparent',
                      border: 'none',
                      cursor: 'pointer',
                      color: isJewelry ? '#94a3b8' : 'var(--text-muted, #64748b)',
                      display: 'flex',
                      alignItems: 'center',
                    }}
                  >
                    {showRegPassword ? <EyeOff size={15} /> : <Eye size={15} />}
                  </button>
                </div>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.75rem' }}>
                <div>
                  <label
                    style={{
                      display: 'block',
                      fontSize: '0.8rem',
                      fontWeight: 700,
                      marginBottom: '0.35rem',
                      color: isJewelry ? '#cbd5e1' : 'var(--text-main, #0f172a)',
                    }}
                  >
                    Phone Number
                  </label>
                  <div style={{ position: 'relative' }}>
                    <Phone
                      size={15}
                      style={{
                        position: 'absolute',
                        left: '12px',
                        top: '12px',
                        color: isJewelry ? '#64748b' : 'var(--text-muted, #64748b)',
                      }}
                    />
                    <input
                      type="text"
                      value={regPhone}
                      onChange={(e) => setRegPhone(e.target.value)}
                      placeholder="+92 300 1234567"
                      style={{
                        width: '100%',
                        padding: '0.65rem 0.85rem 0.65rem 36px',
                        fontSize: '0.85rem',
                        borderRadius: '8px',
                        backgroundColor: inputBg,
                        border: `1px solid ${inputBorder}`,
                        color: inputColor,
                        outline: 'none',
                      }}
                    />
                  </div>
                </div>

                <div>
                  <label
                    style={{
                      display: 'block',
                      fontSize: '0.8rem',
                      fontWeight: 700,
                      marginBottom: '0.35rem',
                      color: isJewelry ? '#cbd5e1' : 'var(--text-main, #0f172a)',
                    }}
                  >
                    City
                  </label>
                  <div style={{ position: 'relative' }}>
                    <Building
                      size={15}
                      style={{
                        position: 'absolute',
                        left: '12px',
                        top: '12px',
                        color: isJewelry ? '#64748b' : 'var(--text-muted, #64748b)',
                      }}
                    />
                    <input
                      type="text"
                      value={regCity}
                      onChange={(e) => setRegCity(e.target.value)}
                      placeholder="e.g. Lahore, Karachi"
                      style={{
                        width: '100%',
                        padding: '0.65rem 0.85rem 0.65rem 36px',
                        fontSize: '0.85rem',
                        borderRadius: '8px',
                        backgroundColor: inputBg,
                        border: `1px solid ${inputBorder}`,
                        color: inputColor,
                        outline: 'none',
                      }}
                    />
                  </div>
                </div>
              </div>

              <div>
                <label
                  style={{
                    display: 'block',
                    fontSize: '0.8rem',
                    fontWeight: 700,
                    marginBottom: '0.35rem',
                    color: isJewelry ? '#cbd5e1' : 'var(--text-main, #0f172a)',
                  }}
                >
                  Delivery Address
                </label>
                <div style={{ position: 'relative' }}>
                  <MapPin
                    size={15}
                    style={{
                      position: 'absolute',
                      left: '12px',
                      top: '12px',
                      color: isJewelry ? '#64748b' : 'var(--text-muted, #64748b)',
                    }}
                  />
                  <input
                    type="text"
                    value={regAddress}
                    onChange={(e) => setRegAddress(e.target.value)}
                    placeholder="House/Apartment #, Street, Sector"
                    style={{
                      width: '100%',
                      padding: '0.65rem 0.85rem 0.65rem 36px',
                      fontSize: '0.85rem',
                      borderRadius: '8px',
                      backgroundColor: inputBg,
                      border: `1px solid ${inputBorder}`,
                      color: inputColor,
                      outline: 'none',
                    }}
                  />
                </div>
              </div>

              {/* Submit Button */}
              <button
                type="submit"
                disabled={loading}
                className="btn-primary"
                style={{
                  width: '100%',
                  height: '46px',
                  borderRadius: isJewelry ? '12px' : 'var(--radius, 12px)',
                  fontSize: '0.92rem',
                  fontWeight: 800,
                  cursor: loading ? 'not-allowed' : 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: '0.5rem',
                  marginTop: '0.5rem',
                  boxShadow: isJewelry
                    ? '0 4px 20px rgba(212, 175, 55, 0.35)'
                    : '0 4px 14px rgba(0,0,0,0.12)',
                  opacity: loading ? 0.75 : 1,
                }}
              >
                <span>{loading ? 'Creating Account...' : 'Create Account'}</span>
                {!loading && <ArrowRight size={17} />}
              </button>

              {/* Quick Tab Switcher */}
              <div
                style={{
                  textAlign: 'center',
                  fontSize: '0.82rem',
                  color: isJewelry ? '#94a3b8' : 'var(--text-muted, #64748b)',
                  marginTop: '0.35rem',
                }}
              >
                <span>Already have an account? </span>
                <button
                  type="button"
                  onClick={() => {
                    setTab('login');
                    setError('');
                  }}
                  style={{
                    background: 'transparent',
                    border: 'none',
                    color: isJewelry ? '#ffd700' : 'var(--primary-color, #0f172a)',
                    fontWeight: 700,
                    cursor: 'pointer',
                    textDecoration: 'underline',
                    padding: 0,
                  }}
                >
                  Sign in here
                </button>
              </div>
            </form>
          )}
        </div>

        {/* Security / SSL Footer */}
        <div
          style={{
            padding: '0.85rem 1.5rem',
            borderTop: isJewelry ? '1px solid #27272a' : '1px solid var(--border-color, #e2e8f0)',
            backgroundColor: isJewelry ? '#151518' : 'var(--surface, #f8fafc)',
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
            gap: '0.35rem',
            fontSize: '0.72rem',
            color: isJewelry ? '#94a3b8' : 'var(--text-muted, #64748b)',
            fontWeight: 500,
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.45rem' }}>
            <ShieldCheck size={14} color={isJewelry ? '#ffd700' : '#10b981'} />
            <span>256-Bit SSL Encrypted • Safe & Secure Checkout</span>
          </div>
          {!isDemoMode && (
            <div style={{ fontSize: '0.67rem', color: '#94A3B8' }}>
              Evaluating for portfolio review?{' '}
              <button
                type="button"
                onClick={() => enableDemoMode()}
                style={{
                  background: 'none',
                  border: 'none',
                  color: isJewelry ? '#ffd700' : 'var(--primary-color, #0f172a)',
                  cursor: 'pointer',
                  textDecoration: 'underline',
                  fontWeight: 600,
                  padding: 0,
                }}
              >
                Activate Demo Options
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
