import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useCart } from '../context/CartContext';
import { ShoppingBag, Package, LogOut, Truck, LayoutDashboard, Sparkles, X, ChevronUp, ChevronDown } from 'lucide-react';

export default function DemoBanner() {
  const { user, isDemoMode, closeDemoMode, activateDemoMode, loginAsDemoRole } = useAuth();
  const { itemCount, setIsOpen: setIsCartOpen } = useCart();
  const navigate = useNavigate();
  const [switching, setSwitching] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);

  const currentRole = user?.role === 'admin' ? 'admin' : user?.role === 'delivery' ? 'courier' : 'customer';

  const handleQuickRoleSwitch = async (role) => {
    if (switching) return;
    setSwitching(true);
    try {
      const res = await loginAsDemoRole(role);
      if (res?.success) {
        if (role === 'admin') {
          navigate('/admin');
        } else if (role === 'courier') {
          navigate('/delivery');
        } else {
          navigate('/');
        }
      }
    } catch (e) {
      console.error('Role switch failed', e);
    } finally {
      setSwitching(false);
    }
  };

  // =========================================================================
  // STATE 1: REAL WEBSITE (Demo Mode is OFF / Closed)
  // Render an unobtrusive, professional floating trigger in the bottom-right corner
  // =========================================================================
  if (!isDemoMode) {
    return (
      <div
        style={{
          position: 'fixed',
          bottom: '24px',
          right: '24px',
          zIndex: 9999,
          fontFamily: "'Plus Jakarta Sans', sans-serif",
        }}
      >
        {menuOpen && (
          <div
            className="animate-fade-in"
            style={{
              position: 'absolute',
              bottom: '50px',
              right: 0,
              width: '280px',
              backgroundColor: '#09090B',
              border: '1px solid #27272A',
              borderRadius: '12px',
              padding: '1rem',
              boxShadow: '0 20px 40px rgba(0,0,0,0.45)',
              color: '#F4F4F5',
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '0.75rem' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.45rem' }}>
                <Sparkles size={14} color="#E35205" />
                <span style={{ fontSize: '0.75rem', fontWeight: 800, textTransform: 'uppercase', letterSpacing: '0.06em' }}>
                  Evaluator Demo Mode
                </span>
              </div>
              <button
                type="button"
                onClick={() => setMenuOpen(false)}
                style={{
                  background: 'none',
                  border: 'none',
                  color: '#A1A1AA',
                  cursor: 'pointer',
                  padding: '2px',
                }}
              >
                <X size={14} />
              </button>
            </div>

            <p style={{ fontSize: '0.72rem', color: '#A1A1AA', lineHeight: 1.4, marginBottom: '0.85rem' }}>
              Select a role to preview the end-to-end e-commerce workflows, courier dispatch, and admin console:
            </p>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.45rem' }}>
              <button
                type="button"
                onClick={() => {
                  setMenuOpen(false);
                  handleQuickRoleSwitch('customer');
                }}
                disabled={switching}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '0.6rem',
                  padding: '0.55rem 0.75rem',
                  borderRadius: '6px',
                  border: '1px solid #27272A',
                  backgroundColor: '#18181B',
                  color: '#FFFFFF',
                  cursor: 'pointer',
                  fontSize: '0.75rem',
                  fontWeight: 600,
                  textAlign: 'left',
                  transition: 'all 0.15s ease',
                }}
              >
                <ShoppingBag size={14} color="#FF7A33" />
                <div>
                  <div style={{ fontWeight: 700 }}>Demo as Customer</div>
                  <div style={{ fontSize: '0.64rem', color: '#71717A' }}>Preloaded bag & order history</div>
                </div>
              </button>

              <button
                type="button"
                onClick={() => {
                  setMenuOpen(false);
                  handleQuickRoleSwitch('admin');
                }}
                disabled={switching}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '0.6rem',
                  padding: '0.55rem 0.75rem',
                  borderRadius: '6px',
                  border: '1px solid #27272A',
                  backgroundColor: '#18181B',
                  color: '#FFFFFF',
                  cursor: 'pointer',
                  fontSize: '0.75rem',
                  fontWeight: 600,
                  textAlign: 'left',
                  transition: 'all 0.15s ease',
                }}
              >
                <LayoutDashboard size={14} color="#FBBF24" />
                <div>
                  <div style={{ fontWeight: 700 }}>Demo as Store Admin</div>
                  <div style={{ fontSize: '0.64rem', color: '#71717A' }}>Executive KPIs & live dispatch</div>
                </div>
              </button>

              <button
                type="button"
                onClick={() => {
                  setMenuOpen(false);
                  handleQuickRoleSwitch('courier');
                }}
                disabled={switching}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '0.6rem',
                  padding: '0.55rem 0.75rem',
                  borderRadius: '6px',
                  border: '1px solid #27272A',
                  backgroundColor: '#18181B',
                  color: '#FFFFFF',
                  cursor: 'pointer',
                  fontSize: '0.75rem',
                  fontWeight: 600,
                  textAlign: 'left',
                  transition: 'all 0.15s ease',
                }}
              >
                <Truck size={14} color="#34D399" />
                <div>
                  <div style={{ fontWeight: 700 }}>Demo as Courier Fleet</div>
                  <div style={{ fontSize: '0.64rem', color: '#71717A' }}>Active deliveries & parcel scan</div>
                </div>
              </button>
            </div>
          </div>
        )}

        {/* Floating Trigger Button */}
        <button
          type="button"
          onClick={() => setMenuOpen(!menuOpen)}
          style={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: '0.45rem',
            padding: '0.5rem 0.95rem',
            backgroundColor: '#09090B',
            color: '#FAFAFA',
            border: '1px solid #27272A',
            borderRadius: '9999px',
            fontSize: '0.76rem',
            fontWeight: 700,
            cursor: 'pointer',
            boxShadow: '0 8px 24px rgba(0, 0, 0, 0.35)',
            transition: 'all 0.2s ease',
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.borderColor = '#E35205';
            e.currentTarget.style.transform = 'translateY(-2px)';
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.borderColor = '#27272A';
            e.currentTarget.style.transform = 'translateY(0)';
          }}
          title="Open Portfolio Demo Options"
        >
          <Sparkles size={13} color="#E35205" />
          <span>Demo Options</span>
          {menuOpen ? <ChevronDown size={13} color="#A1A1AA" /> : <ChevronUp size={13} color="#A1A1AA" />}
        </button>
      </div>
    );
  }

  // =========================================================================
  // STATE 2: DEMO MODE IS ACTIVE
  // Render the top full-width session bar with switchers & Close Demo button
  // =========================================================================
  return (
    <aside
      aria-label="Portfolio Demo Session Bar"
      style={{
        position: 'sticky',
        top: 0,
        zIndex: 150,
        backgroundColor: '#09090B',
        borderBottom: '1px solid #27272A',
        color: '#F4F4F5',
        boxShadow: '0 4px 16px rgba(0, 0, 0, 0.4)',
        padding: '0.35rem 1rem',
        fontSize: '0.76rem',
        fontFamily: "'Plus Jakarta Sans', sans-serif",
      }}
    >
      <div
        style={{
          maxWidth: '1440px',
          margin: '0 auto',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          flexWrap: 'wrap',
          gap: '0.65rem',
        }}
      >
        {/* Left: Role Switcher Segmented Control */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.65rem', flexWrap: 'wrap' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
            <span
              style={{
                width: '6px',
                height: '6px',
                borderRadius: '50%',
                backgroundColor: currentRole === 'admin' ? '#F59E0B' : currentRole === 'courier' ? '#10B981' : '#E35205',
                display: 'inline-block',
                boxShadow: '0 0 8px currentColor',
              }}
            />
            <span style={{ fontSize: '0.68rem', fontWeight: 800, letterSpacing: '0.08em', textTransform: 'uppercase', color: '#A1A1AA' }}>
              Portfolio Demo:
            </span>
          </div>

          {/* Segmented Control */}
          <div
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              backgroundColor: '#18181B',
              padding: '0.15rem',
              borderRadius: '5px',
              border: '1px solid #27272A',
              gap: '0.15rem',
            }}
          >
            {/* Customer Pill */}
            <button
              type="button"
              disabled={switching}
              onClick={() => handleQuickRoleSwitch('customer')}
              style={{
                padding: '0.2rem 0.55rem',
                borderRadius: '4px',
                fontSize: '0.7rem',
                fontWeight: currentRole === 'customer' ? 800 : 500,
                cursor: switching ? 'wait' : 'pointer',
                border: 'none',
                backgroundColor: currentRole === 'customer' ? '#27272A' : 'transparent',
                color: currentRole === 'customer' ? '#FFFFFF' : '#A1A1AA',
                display: 'inline-flex',
                alignItems: 'center',
                gap: '0.3rem',
                transition: 'all 0.15s ease',
              }}
              title="Switch to Demo Customer (customer@demo.com)"
            >
              <ShoppingBag size={11} color={currentRole === 'customer' ? '#FF7A33' : '#71717A'} />
              <span>Customer</span>
            </button>

            {/* Courier Pill */}
            <button
              type="button"
              disabled={switching}
              onClick={() => handleQuickRoleSwitch('courier')}
              style={{
                padding: '0.2rem 0.55rem',
                borderRadius: '4px',
                fontSize: '0.7rem',
                fontWeight: currentRole === 'courier' ? 800 : 500,
                cursor: switching ? 'wait' : 'pointer',
                border: 'none',
                backgroundColor: currentRole === 'courier' ? '#27272A' : 'transparent',
                color: currentRole === 'courier' ? '#FFFFFF' : '#A1A1AA',
                display: 'inline-flex',
                alignItems: 'center',
                gap: '0.3rem',
                transition: 'all 0.15s ease',
              }}
              title="Switch to Demo Courier (courier@demo.com)"
            >
              <Truck size={11} color={currentRole === 'courier' ? '#34D399' : '#71717A'} />
              <span>Courier Fleet</span>
            </button>

            {/* Admin Pill */}
            <button
              type="button"
              disabled={switching}
              onClick={() => handleQuickRoleSwitch('admin')}
              style={{
                padding: '0.2rem 0.55rem',
                borderRadius: '4px',
                fontSize: '0.7rem',
                fontWeight: currentRole === 'admin' ? 800 : 500,
                cursor: switching ? 'wait' : 'pointer',
                border: 'none',
                backgroundColor: currentRole === 'admin' ? '#27272A' : 'transparent',
                color: currentRole === 'admin' ? '#FFFFFF' : '#A1A1AA',
                display: 'inline-flex',
                alignItems: 'center',
                gap: '0.3rem',
                transition: 'all 0.15s ease',
              }}
              title="Switch to Demo Admin (admin@demo.com)"
            >
              <LayoutDashboard size={11} color={currentRole === 'admin' ? '#FBBF24' : '#71717A'} />
              <span>Admin Console</span>
            </button>
          </div>

          <span style={{ color: '#71717A', fontSize: '0.72rem' }}>
            Active: <strong style={{ color: '#E4E4E7' }}>{user?.name}</strong> ({user?.email})
          </span>
        </div>

        {/* Right: Quick Context Actions & Close Demo (Real Website) */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.45rem' }}>
          {currentRole === 'customer' && (
            <>
              <button
                onClick={() => setIsCartOpen(true)}
                style={{
                  background: 'transparent',
                  border: '1px solid #27272A',
                  color: '#E4E4E7',
                  borderRadius: '3px',
                  padding: '0.2rem 0.5rem',
                  fontSize: '0.7rem',
                  fontWeight: 600,
                  cursor: 'pointer',
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '0.3rem',
                  transition: 'all 0.15s ease',
                }}
                title="Open Shopping Bag"
              >
                <ShoppingBag size={12} color="#A1A1AA" />
                <span>Bag ({itemCount})</span>
              </button>

              <button
                onClick={() => navigate('/my-orders')}
                style={{
                  background: 'transparent',
                  border: '1px solid #27272A',
                  color: '#E4E4E7',
                  borderRadius: '3px',
                  padding: '0.2rem 0.5rem',
                  fontSize: '0.7rem',
                  fontWeight: 600,
                  cursor: 'pointer',
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '0.3rem',
                  transition: 'all 0.15s ease',
                }}
                title="View Customer Order History"
              >
                <Package size={12} color="#A1A1AA" />
                <span>My Orders</span>
              </button>
            </>
          )}

          {currentRole === 'courier' && (
            <button
              onClick={() => navigate('/delivery')}
              style={{
                background: 'transparent',
                border: '1px solid #27272A',
                color: '#E4E4E7',
                borderRadius: '3px',
                padding: '0.2rem 0.5rem',
                fontSize: '0.7rem',
                fontWeight: 600,
                cursor: 'pointer',
                display: 'inline-flex',
                alignItems: 'center',
                gap: '0.3rem',
              }}
              title="Open Courier Deliveries Portal"
            >
              <Truck size={12} color="#10B981" />
              <span>Deliveries Dashboard</span>
            </button>
          )}

          {currentRole === 'admin' && (
            <button
              onClick={() => navigate('/admin')}
              style={{
                background: 'transparent',
                border: '1px solid #27272A',
                color: '#E4E4E7',
                borderRadius: '3px',
                padding: '0.2rem 0.5rem',
                fontSize: '0.7rem',
                fontWeight: 600,
                cursor: 'pointer',
                display: 'inline-flex',
                alignItems: 'center',
                gap: '0.3rem',
              }}
              title="Open Admin Management Dashboard"
            >
              <LayoutDashboard size={12} color="#F59E0B" />
              <span>Executive Dashboard</span>
            </button>
          )}

          {/* Close Demo -> Switch to 100% Original Real Website */}
          <button
            onClick={closeDemoMode}
            style={{
              backgroundColor: '#E11D48',
              border: '1px solid #F43F5E',
              color: '#FFFFFF',
              borderRadius: '4px',
              padding: '0.22rem 0.65rem',
              fontSize: '0.72rem',
              fontWeight: 700,
              cursor: 'pointer',
              display: 'inline-flex',
              alignItems: 'center',
              gap: '0.35rem',
              boxShadow: '0 2px 6px rgba(225, 29, 72, 0.35)',
              transition: 'all 0.15s ease',
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.backgroundColor = '#BE123C';
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.backgroundColor = '#E11D48';
            }}
            title="Close Demo Mode and view as 100% Original Real Website"
          >
            <X size={12} />
            <span>Close Demo (Real Website)</span>
          </button>
        </div>
      </div>
    </aside>
  );
}
