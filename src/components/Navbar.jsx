import React, { useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useStore } from '../context/StoreContext';
import { useCart } from '../context/CartContext';
import {
  ShoppingBag,
  Search,
  ChevronDown,
  LayoutDashboard,
  User,
  Truck,
  LogOut,
  Package,
  Heart,
  Menu,
  X,
  Sparkles,
  ArrowRight,
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useWishlist } from '../context/WishlistContext';
import KhaamLogo from './KhaamLogo';

export default function Navbar({
  currentView = 'home',
  catalogParams = {},
  onOpenAdmin,
  onViewCatalog,
  onGoHome,
  onOpenMyOrders,
  onOpenDelivery,
  onOpenTrackOrder,
}) {
  const navigate = useNavigate();
  const location = useLocation();
  const { store } = useStore();
  const { itemCount, setIsOpen: setIsCartOpen } = useCart();
  const { wishlistCount, setIsWishlistOpen } = useWishlist();
  const { user, isAuthenticated, isAdmin, isDelivery, isDemoMode, activateDemoMode, loginAsDemoRole, exitDemoMode, logout, openLoginModal } = useAuth();

  const handleOpenAdmin = async () => {
    setIsMobileMenuOpen(false);
    if (isAdmin) {
      if (onOpenAdmin) onOpenAdmin();
      else navigate('/admin');
    } else {
      const res = await loginAsDemoRole('admin');
      if (res.success) {
        if (onOpenAdmin) onOpenAdmin();
        else navigate('/admin');
      }
    }
  };

  const handleOpenDelivery = async () => {
    setIsMobileMenuOpen(false);
    if (isDelivery) {
      if (onOpenDelivery) onOpenDelivery();
      else navigate('/delivery');
    } else {
      const res = await loginAsDemoRole('courier');
      if (res.success) {
        if (onOpenDelivery) onOpenDelivery();
        else navigate('/delivery');
      }
    }
  };

  const [userDropdownOpen, setUserDropdownOpen] = useState(false);
  const [navSearchQuery, setNavSearchQuery] = useState('');
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [activeDropdown, setActiveDropdown] = useState(null);
  const [mobileExpandedCat, setMobileExpandedCat] = useState(null);

  const searchParams = new URLSearchParams(location.search);
  const activeSection = searchParams.get('section') || 'all';
  const currentCategorySlug = catalogParams?.categorySlug || '';

  // Main navigation structure: Authentic Handcrafted Collections
  const navigationItems = [
    {
      id: 'crochet-bags',
      label: 'Crochet Bags',
      slug: 'crochet-bag-gyEi',
      isActive: currentCategorySlug === 'crochet-bag-gyEi',
      subcategories: [
        { label: 'All Crochet Bags', slug: 'crochet-bag-gyEi' },
        { label: 'Crochet Shoulder & Handbags', search: 'Crochet Bag' },
        { label: 'Mini Crochet Purses', search: 'Crochet Purse' },
      ],
    },
    {
      id: 'fabric-bags',
      label: 'Fabric Bags',
      slug: 'fabric-bag-2Upe',
      isActive: currentCategorySlug === 'fabric-bag-2Upe',
      subcategories: [
        { label: 'All Fabric Bags', slug: 'fabric-bag-2Upe' },
        { label: 'Hand-Embroidered Tote Bags', search: 'Fabric Bag' },
        { label: 'Potli & Clutches', search: 'Potli Bag' },
      ],
    },
    {
      id: 'caps-mufflers',
      label: 'Caps & Mufflers',
      slug: 'crochet-caps-liOX',
      isActive: currentCategorySlug === 'crochet-caps-liOX' || currentCategorySlug === 'handmade-mufflers-scarves',
      subcategories: [
        { label: 'Crochet Caps & Beanies', slug: 'crochet-caps-liOX' },
        { label: 'Handmade Mufflers & Scarves', slug: 'handmade-mufflers-scarves' },
      ],
    },
    {
      id: 'thread-jewellery',
      label: 'Thread Jewellery',
      slug: 'jewellery-6odb',
      isActive: currentCategorySlug === 'jewellery-6odb',
      subcategories: [
        { label: 'All Thread Jewellery', slug: 'jewellery-6odb' },
        { label: 'Handmade Thread Bangles', search: 'Thread Bangles' },
        { label: 'Handcrafted Thread Earrings', search: 'Thread Earrings' },
        { label: 'Thread Chokers & Sets', search: 'Thread Jewellery' },
      ],
    },
    {
      id: 'stitched-shawls',
      label: 'Dresses & Shawls',
      slug: 'traditional-festive-luxury-pret-wear-0e24',
      isActive: currentCategorySlug === 'traditional-festive-luxury-pret-wear-0e24' || currentCategorySlug === 'luxury-embroidery-shawl-lBku',
      subcategories: [
        { label: 'Festive Luxury Pret / Pishwas', slug: 'traditional-festive-luxury-pret-wear-0e24' },
        { label: 'Luxury Embroidery Shawls', slug: 'luxury-embroidery-shawl-lBku' },
      ],
    },
    {
      id: 'kids-crochet',
      label: 'Kids Crochet',
      slug: 'kids-crochet-tops-frocks-9ftX',
      isActive: currentCategorySlug === 'kids-crochet-tops-frocks-9ftX',
      subcategories: [
        { label: 'Kids Crochet Tops & Frocks', slug: 'kids-crochet-tops-frocks-9ftX' },
        { label: 'Baby Crochet Caps & Warmers', search: 'Kids Crochet' },
      ],
    },
  ];

  const handleNavSearchSubmit = (e) => {
    e.preventDefault();
    if (navSearchQuery.trim()) {
      onViewCatalog({ search: navSearchQuery.trim() });
      setIsSearchOpen(false);
    }
  };

  return (
    <>
      {/* 1. Announcement Strip */}
      <div style={{
        backgroundColor: '#111111',
        color: '#FFFFFF',
        fontSize: '0.72rem',
        fontWeight: 600,
        letterSpacing: '0.12em',
        padding: '0.45rem 1rem',
        textAlign: 'center',
        borderBottom: '1px solid #222222',
      }}>
        <div style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          gap: '0.75rem',
          flexWrap: 'wrap',
          textTransform: 'uppercase',
          letterSpacing: '0.13em',
        }}>
          <span style={{ color: '#E35205', fontWeight: 800 }}>✨ 100% HANDMADE DESIGNS & HEIRLOOM CRAFT</span>
          <span style={{ opacity: 0.4 }}>|</span>
          <span>FREE EXPRESS DELIVERY ACROSS PAKISTAN (ORDERS OVER RS. 3,500)</span>
          <span style={{ opacity: 0.4 }}>|</span>
          <span>CASH ON DELIVERY & LIVE PARCEL TRACKING</span>
        </div>
      </div>

      {/* 2. Main Navigation Bar */}
      <header className="site-header" style={{
        backgroundColor: 'rgba(255, 255, 255, 0.95)',
        backdropFilter: 'blur(16px)',
        WebkitBackdropFilter: 'blur(16px)',
        borderBottom: '1px solid #ECEAE7',
        position: 'sticky',
        top: 0,
        zIndex: 50,
        boxShadow: '0 2px 10px rgba(0, 0, 0, 0.03)',
        width: '100%',
      }}>
        <div style={{
          maxWidth: '1440px',
          margin: '0 auto',
          padding: '0.85rem 2.2rem',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          gap: '1.25rem',
          position: 'relative',
        }}>
          {/* Mobile Menu Toggle Button */}
          <div className="mobile-menu-btn" style={{ display: 'none' }}>
            <button
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
              style={{
                background: 'transparent',
                border: 'none',
                cursor: 'pointer',
                padding: '0.4rem',
                color: '#111111',
                display: 'flex',
                alignItems: 'center',
              }}
              aria-label="Toggle Navigation"
            >
              {isMobileMenuOpen ? <X size={24} /> : <Menu size={24} />}
            </button>
          </div>

          {/* Brand Logo (Khaadi style emblem) */}
          <div
            onClick={onGoHome}
            style={{
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              flexShrink: 0,
            }}
          >
            <KhaamLogo variant="khaadi" size="default" />
          </div>

          {/* Center Space */}

          {/* Right Action Icons (Search, Heart, User, ShoppingBag) */}
          <div style={{
            display: 'flex',
            alignItems: 'center',
            gap: '1.15rem',
            flexShrink: 0,
          }}>
            {/* Unified Role & Tracking Segmented Control */}
            <div
              className="desktop-utility-bar"
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                backgroundColor: '#FAF9F6',
                border: '1px solid #E5E2DC',
                borderRadius: '999px',
                padding: '3px',
                gap: '2px',
              }}
            >
              {/* 1. Track Order */}
              <button
                type="button"
                onClick={() => {
                  if (onOpenTrackOrder) onOpenTrackOrder();
                  else navigate('/track-order');
                }}
                style={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '0.4rem',
                  backgroundColor: currentView === 'track-order' ? '#111111' : 'transparent',
                  color: currentView === 'track-order' ? '#FFFFFF' : '#111111',
                  border: 'none',
                  padding: '0.36rem 0.8rem',
                  borderRadius: '999px',
                  fontSize: '0.72rem',
                  fontWeight: currentView === 'track-order' ? 800 : 600,
                  letterSpacing: '0.06em',
                  textTransform: 'uppercase',
                  cursor: 'pointer',
                  transition: 'all 0.18s cubic-bezier(0.16, 1, 0.3, 1)',
                  boxShadow: currentView === 'track-order' ? '0 1px 4px rgba(0,0,0,0.18)' : 'none',
                }}
                onMouseEnter={(e) => {
                  if (currentView !== 'track-order') e.currentTarget.style.backgroundColor = '#EFECE6';
                }}
                onMouseLeave={(e) => {
                  if (currentView !== 'track-order') e.currentTarget.style.backgroundColor = 'transparent';
                }}
                title="Track Live Parcel Delivery & Status"
              >
                <Truck size={12} strokeWidth={2} style={{ color: currentView === 'track-order' ? '#FFFFFF' : '#111111' }} />
                <span>Track Order</span>
              </button>

              {/* Courier & Admin Role Controls: Only displayed in Demo/Evaluator Mode or for Authenticated Staff */}
              {(isDemoMode || isDelivery || isAdmin) && (
                <>
                  <span style={{ width: '1px', height: '14px', backgroundColor: '#E2DFDA', margin: '0 1px' }} />

                  {/* 2. Courier Fleet */}
                  <button
                    type="button"
                    onClick={handleOpenDelivery}
                    style={{
                      display: 'inline-flex',
                      alignItems: 'center',
                      gap: '0.4rem',
                      backgroundColor: currentView === 'delivery' || isDelivery ? '#111111' : 'transparent',
                      color: currentView === 'delivery' || isDelivery ? '#FFFFFF' : '#27272A',
                      border: 'none',
                      padding: '0.36rem 0.8rem',
                      borderRadius: '999px',
                      fontSize: '0.72rem',
                      fontWeight: (currentView === 'delivery' || isDelivery) ? 800 : 600,
                      letterSpacing: '0.06em',
                      textTransform: 'uppercase',
                      cursor: 'pointer',
                      transition: 'all 0.18s cubic-bezier(0.16, 1, 0.3, 1)',
                      boxShadow: (currentView === 'delivery' || isDelivery) ? '0 1px 4px rgba(0,0,0,0.18)' : 'none',
                    }}
                    onMouseEnter={(e) => {
                      if (currentView !== 'delivery' && !isDelivery) e.currentTarget.style.backgroundColor = '#EFECE6';
                    }}
                    onMouseLeave={(e) => {
                      if (currentView !== 'delivery' && !isDelivery) e.currentTarget.style.backgroundColor = 'transparent';
                    }}
                    title="Switch to Courier Fleet Portal (Tariq Rider)"
                  >
                    <span style={{ width: '6px', height: '6px', borderRadius: '50%', backgroundColor: '#10B981', display: 'inline-block' }} />
                    <span>Courier</span>
                  </button>

                  <span style={{ width: '1px', height: '14px', backgroundColor: '#E2DFDA', margin: '0 1px' }} />

                  {/* 3. Admin Console */}
                  <button
                    type="button"
                    onClick={handleOpenAdmin}
                    style={{
                      display: 'inline-flex',
                      alignItems: 'center',
                      gap: '0.4rem',
                      backgroundColor: currentView === 'admin' || isAdmin ? '#111111' : 'transparent',
                      color: currentView === 'admin' || isAdmin ? '#FFFFFF' : '#27272A',
                      border: 'none',
                      padding: '0.36rem 0.8rem',
                      borderRadius: '999px',
                      fontSize: '0.72rem',
                      fontWeight: (currentView === 'admin' || isAdmin) ? 800 : 600,
                      letterSpacing: '0.06em',
                      textTransform: 'uppercase',
                      cursor: 'pointer',
                      transition: 'all 0.18s cubic-bezier(0.16, 1, 0.3, 1)',
                      boxShadow: (currentView === 'admin' || isAdmin) ? '0 1px 4px rgba(0,0,0,0.18)' : 'none',
                    }}
                    onMouseEnter={(e) => {
                      if (currentView !== 'admin' && !isAdmin) e.currentTarget.style.backgroundColor = '#EFECE6';
                    }}
                    onMouseLeave={(e) => {
                      if (currentView !== 'admin' && !isAdmin) e.currentTarget.style.backgroundColor = 'transparent';
                    }}
                    title="Switch to Store Administrator Console"
                  >
                    <span style={{ width: '6px', height: '6px', borderRadius: '50%', backgroundColor: '#F59E0B', display: 'inline-block' }} />
                    <span>Admin</span>
                  </button>
                </>
              )}
            </div>

            {/* 1. Search Icon */}
            <button
              onClick={() => setIsSearchOpen(!isSearchOpen)}
              style={{
                background: 'transparent',
                border: 'none',
                cursor: 'pointer',
                padding: '0.3rem',
                color: isSearchOpen ? '#E35205' : '#111111',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                transition: 'color 0.15s ease',
              }}
              aria-label="Search"
              title="Search"
            >
              <Search size={21} strokeWidth={1.5} />
            </button>

            {/* 2. Wishlist Icon with Round Red Badge */}
            <button
              onClick={() => setIsWishlistOpen(true)}
              style={{
                background: 'transparent',
                border: 'none',
                cursor: 'pointer',
                padding: '0.3rem',
                color: '#111111',
                position: 'relative',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                transition: 'color 0.15s ease',
              }}
              aria-label="Wishlist"
              title="Wishlist"
            >
              <Heart
                size={21}
                strokeWidth={1.5}
                fill={wishlistCount > 0 ? '#FF4D4D' : 'none'}
                color={wishlistCount > 0 ? '#FF4D4D' : 'currentColor'}
              />
              {wishlistCount > 0 && (
                <span style={{
                  position: 'absolute',
                  top: '-4px',
                  right: '-6px',
                  backgroundColor: '#FF4D4D',
                  color: '#FFFFFF',
                  fontSize: '0.62rem',
                  fontWeight: 800,
                  minWidth: '16px',
                  height: '16px',
                  padding: '0 3px',
                  borderRadius: '50%',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  lineHeight: 1,
                }}>
                  {wishlistCount}
                </span>
              )}
            </button>

            {/* 3. User Account Icon */}
            <div style={{ position: 'relative' }}>
              <button
                onClick={() => {
                  if (isAuthenticated) {
                    setUserDropdownOpen(!userDropdownOpen);
                  } else {
                    openLoginModal('login');
                  }
                }}
                style={{
                  background: 'transparent',
                  border: 'none',
                  cursor: 'pointer',
                  padding: '0.3rem',
                  color: userDropdownOpen ? '#E35205' : '#111111',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  transition: 'color 0.15s ease',
                }}
                aria-label="User Account"
                title={isAuthenticated ? user?.name : 'Sign In'}
              >
                <User size={21} strokeWidth={1.5} />
              </button>

              {/* User Dropdown Menu */}
              {userDropdownOpen && isAuthenticated && (
                <div
                  style={{
                    position: 'absolute',
                    top: 'calc(100% + 14px)',
                    right: 0,
                    width: '230px',
                    backgroundColor: '#FFFFFF',
                    border: '1px solid #ECEAE7',
                    borderRadius: '8px',
                    boxShadow: '0 12px 30px rgba(0,0,0,0.12)',
                    padding: '0.6rem',
                    zIndex: 100,
                    display: 'flex',
                    flexDirection: 'column',
                    gap: '0.25rem',
                  }}
                  className="animate-fade-in"
                >
                  <div style={{ padding: '0.45rem 0.65rem', borderBottom: '1px solid #ECEAE7', marginBottom: '0.3rem' }}>
                    <div style={{ fontWeight: 700, fontSize: '0.84rem', color: '#111111' }}>{user?.name}</div>
                    <div style={{ fontSize: '0.72rem', color: '#666666' }}>{user?.email}</div>
                    <div style={{
                      marginTop: '0.35rem',
                      display: 'inline-flex',
                      alignItems: 'center',
                      gap: '0.35rem',
                      fontSize: '0.62rem',
                      padding: '0.15rem 0.45rem',
                      borderRadius: '3px',
                      fontWeight: 700,
                      letterSpacing: '0.04em',
                      textTransform: 'uppercase',
                      backgroundColor: '#18181B',
                      color: '#FAFAFA',
                      border: '1px solid #27272A',
                    }}>
                      <span style={{
                        width: '5px',
                        height: '5px',
                        borderRadius: '50%',
                        backgroundColor: isAdmin ? '#F59E0B' : isDelivery ? '#10B981' : '#3B82F6',
                        display: 'inline-block',
                      }} />
                      {user?.role === 'admin' ? 'Store Administrator' : user?.role === 'delivery' ? 'Fleet Courier' : 'Verified Customer'}
                    </div>
                  </div>

                  {isDemoMode && (
                    <div style={{
                      backgroundColor: '#F9FAFB',
                      color: '#111827',
                      border: '1px solid #E5E7EB',
                      padding: '0.35rem 0.65rem',
                      borderRadius: '4px',
                      fontSize: '0.68rem',
                      fontWeight: 700,
                      letterSpacing: '0.04em',
                      textTransform: 'uppercase',
                      display: 'flex',
                      alignItems: 'center',
                      gap: '0.4rem',
                      marginBottom: '0.35rem',
                    }}>
                      <Sparkles size={11} color="#111111" />
                      <span>Portfolio Demo Session</span>
                    </div>
                  )}

                  {isAdmin && (
                    <button
                      onClick={() => { setUserDropdownOpen(false); onOpenAdmin(); }}
                      style={{ padding: '0.5rem 0.65rem', textAlign: 'left', background: 'transparent', border: 'none', cursor: 'pointer', fontSize: '0.8rem', display: 'flex', alignItems: 'center', gap: '0.55rem', color: '#111111', borderRadius: '4px', fontWeight: 600 }}
                      onMouseEnter={(e) => (e.currentTarget.style.backgroundColor = '#F7F5F2')}
                      onMouseLeave={(e) => (e.currentTarget.style.backgroundColor = 'transparent')}
                    >
                      <LayoutDashboard size={14} strokeWidth={1.75} />
                      <span>Admin Console</span>
                    </button>
                  )}

                  {isDelivery && (
                    <button
                      onClick={() => { setUserDropdownOpen(false); onOpenDelivery(); }}
                      style={{ padding: '0.5rem 0.65rem', textAlign: 'left', background: 'transparent', border: 'none', cursor: 'pointer', fontSize: '0.8rem', display: 'flex', alignItems: 'center', gap: '0.55rem', color: '#111111', fontWeight: 600, borderRadius: '4px' }}
                      onMouseEnter={(e) => (e.currentTarget.style.backgroundColor = '#F7F5F2')}
                      onMouseLeave={(e) => (e.currentTarget.style.backgroundColor = 'transparent')}
                    >
                      <Truck size={14} strokeWidth={1.75} />
                      <span>Courier Deliveries</span>
                    </button>
                  )}

                  <button
                    onClick={() => { setUserDropdownOpen(false); onOpenMyOrders(); }}
                    style={{ padding: '0.5rem 0.65rem', textAlign: 'left', background: 'transparent', border: 'none', cursor: 'pointer', fontSize: '0.8rem', display: 'flex', alignItems: 'center', gap: '0.55rem', color: '#111111', borderRadius: '4px', fontWeight: 500 }}
                    onMouseEnter={(e) => (e.currentTarget.style.backgroundColor = '#F7F5F2')}
                    onMouseLeave={(e) => (e.currentTarget.style.backgroundColor = 'transparent')}
                  >
                    <Package size={14} strokeWidth={1.75} />
                    <span>Order History</span>
                  </button>

                  <button
                    onClick={() => { setUserDropdownOpen(false); onOpenTrackOrder(); }}
                    style={{ padding: '0.5rem 0.65rem', textAlign: 'left', background: 'transparent', border: 'none', cursor: 'pointer', fontSize: '0.8rem', display: 'flex', alignItems: 'center', gap: '0.55rem', color: '#111111', borderRadius: '4px', fontWeight: 500 }}
                    onMouseEnter={(e) => (e.currentTarget.style.backgroundColor = '#F7F5F2')}
                    onMouseLeave={(e) => (e.currentTarget.style.backgroundColor = 'transparent')}
                  >
                    <Truck size={14} strokeWidth={1.75} />
                    <span>Track Shipment</span>
                  </button>

                  <div style={{ borderTop: '1px solid #ECEAE7', margin: '0.25rem 0' }} />

                  <button
                    onClick={() => {
                      setUserDropdownOpen(false);
                      if (isDemoMode) {
                        exitDemoMode();
                      } else {
                        logout();
                      }
                    }}
                    style={{
                      padding: '0.5rem 0.65rem',
                      textAlign: 'left',
                      background: 'transparent',
                      border: 'none',
                      cursor: 'pointer',
                      fontSize: '0.8rem',
                      color: isDemoMode ? '#E35205' : '#DC2626',
                      fontWeight: 700,
                      display: 'flex',
                      alignItems: 'center',
                      gap: '0.5rem',
                      borderRadius: '4px',
                    }}
                    onMouseEnter={(e) => (e.currentTarget.style.backgroundColor = '#FEF2F2')}
                    onMouseLeave={(e) => (e.currentTarget.style.backgroundColor = 'transparent')}
                  >
                    <LogOut size={14} /> {isDemoMode ? 'Exit Demo Session' : 'Sign Out'}
                  </button>
                </div>
              )}
            </div>

            {/* 4. Shopping Bag Icon */}
            <button
              onClick={() => setIsCartOpen(true)}
              style={{
                background: 'transparent',
                border: 'none',
                cursor: 'pointer',
                padding: '0.3rem',
                color: '#111111',
                position: 'relative',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                transition: 'color 0.15s ease',
              }}
              aria-label="Shopping Bag"
              title="Shopping Bag"
            >
              <ShoppingBag size={21} strokeWidth={1.5} />
              {itemCount > 0 && (
                <span style={{
                  position: 'absolute',
                  top: '-4px',
                  right: '-6px',
                  backgroundColor: '#111111',
                  color: '#FFFFFF',
                  fontSize: '0.62rem',
                  fontWeight: 800,
                  minWidth: '16px',
                  height: '16px',
                  padding: '0 3px',
                  borderRadius: '50%',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  lineHeight: 1,
                }}>
                  {itemCount}
                </span>
              )}
            </button>
          </div>
        </div>

        {/* Slide-Down Minimalist Search Bar */}
        {isSearchOpen && (
          <div
            style={{
              borderTop: '1px solid #ECEAE7',
              backgroundColor: '#FFFFFF',
              padding: '0.85rem 2.2rem',
              boxShadow: '0 8px 24px rgba(0,0,0,0.06)',
            }}
            className="animate-fade-in"
          >
            <form
              onSubmit={handleNavSearchSubmit}
              style={{
                maxWidth: '720px',
                margin: '0 auto',
                display: 'flex',
                alignItems: 'center',
                gap: '0.75rem',
                backgroundColor: '#FAF9F7',
                border: '1px solid #E5E0D8',
                borderRadius: '6px',
                padding: '0.4rem 0.85rem',
              }}
            >
              <Search size={18} color="#777777" />
              <input
                type="text"
                autoFocus
                placeholder="Search handmade crochet bags, fabric bags, caps, jewellery, dresses..."
                value={navSearchQuery}
                onChange={(e) => setNavSearchQuery(e.target.value)}
                style={{
                  flexGrow: 1,
                  border: 'none',
                  outline: 'none',
                  fontSize: '0.88rem',
                  backgroundColor: 'transparent',
                  color: '#111111',
                  fontFamily: "'Plus Jakarta Sans', sans-serif",
                }}
              />
              {navSearchQuery && (
                <button
                  type="button"
                  onClick={() => setNavSearchQuery('')}
                  style={{
                    background: 'transparent',
                    border: 'none',
                    color: '#888888',
                    cursor: 'pointer',
                    padding: '0.2rem',
                  }}
                >
                  <X size={16} />
                </button>
              )}
              <button
                type="submit"
                style={{
                  background: '#111111',
                  color: '#FFFFFF',
                  border: 'none',
                  borderRadius: '4px',
                  padding: '0.45rem 1rem',
                  fontSize: '0.78rem',
                  fontWeight: 700,
                  letterSpacing: '0.06em',
                  cursor: 'pointer',
                  textTransform: 'uppercase',
                }}
              >
                Search
              </button>
              <button
                type="button"
                onClick={() => setIsSearchOpen(false)}
                style={{
                  background: 'transparent',
                  border: 'none',
                  color: '#666666',
                  cursor: 'pointer',
                  padding: '0.2rem',
                  marginLeft: '0.25rem',
                }}
                title="Close Search"
              >
                <X size={20} />
              </button>
            </form>

            {/* Quick Trending Searches */}
            <div
              style={{
                maxWidth: '720px',
                margin: '0.65rem auto 0',
                display: 'flex',
                alignItems: 'center',
                gap: '0.45rem',
                flexWrap: 'wrap',
              }}
            >
              <span
                style={{
                  fontSize: '0.7rem',
                  fontWeight: 800,
                  color: '#888888',
                  textTransform: 'uppercase',
                  letterSpacing: '0.06em',
                }}
              >
                Trending:
              </span>
              {['Crochet Bag', 'Fabric Bag', 'Crochet Cap', 'Muffler', 'Thread Bangles', 'Thread Earrings', 'Pishwas', 'Shawl', 'Kids Frock'].map((term) => (
                <button
                  key={term}
                  type="button"
                  onClick={() => {
                    setNavSearchQuery(term);
                    onViewCatalog({ search: term });
                    setIsSearchOpen(false);
                  }}
                  style={{
                    background: '#FAF9F6',
                    border: '1px solid #E5E0D8',
                    borderRadius: '999px',
                    padding: '0.22rem 0.7rem',
                    fontSize: '0.74rem',
                    fontWeight: 600,
                    color: '#333333',
                    cursor: 'pointer',
                    transition: 'all 0.15s ease',
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.borderColor = '#111111';
                    e.currentTarget.style.backgroundColor = '#111111';
                    e.currentTarget.style.color = '#FFFFFF';
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.borderColor = '#E5E0D8';
                    e.currentTarget.style.backgroundColor = '#FAF9F6';
                    e.currentTarget.style.color = '#333333';
                  }}
                >
                  {term}
                </button>
              ))}
            </div>
          </div>
        )}

        {/* Mobile Menu Drawer */}
        {isMobileMenuOpen && (
          <div
            style={{
              position: 'fixed',
              top: '90px',
              left: 0,
              right: 0,
              bottom: 0,
              backgroundColor: 'rgba(0,0,0,0.5)',
              zIndex: 90,
            }}
            onClick={() => setIsMobileMenuOpen(false)}
          >
            <div
              style={{
                width: '320px',
                height: '100%',
                backgroundColor: '#FFFFFF',
                padding: '1.5rem',
                display: 'flex',
                flexDirection: 'column',
                gap: '0.85rem',
                boxShadow: '6px 0 24px rgba(0,0,0,0.12)',
                overflowY: 'auto',
              }}
              onClick={(e) => e.stopPropagation()}
            >
              {/* Mobile Drawer Header */}
              <div style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                paddingBottom: '1rem',
                borderBottom: '1px solid #ECEAE7',
                marginBottom: '0.5rem',
              }}>
                <div
                  onClick={() => {
                    onGoHome();
                    setIsMobileMenuOpen(false);
                  }}
                  style={{ cursor: 'pointer' }}
                >
                  <KhaamLogo variant="navbar" size="compact" />
                </div>
                <button
                  onClick={() => setIsMobileMenuOpen(false)}
                  style={{
                    background: 'transparent',
                    border: 'none',
                    cursor: 'pointer',
                    padding: '0.3rem',
                    color: '#111111',
                  }}
                  aria-label="Close menu"
                >
                  <X size={20} />
                </button>
              </div>

              {/* Mobile Quick Role & Tracking Switcher */}
              <div style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(3, 1fr)',
                gap: '0.4rem',
                marginBottom: '1rem',
                padding: '0.35rem',
                backgroundColor: '#FAF9F6',
                borderRadius: '8px',
                border: '1px solid #ECEAE7',
              }}>
                <button
                  type="button"
                  onClick={() => {
                    setIsMobileMenuOpen(false);
                    if (onOpenTrackOrder) onOpenTrackOrder();
                    else navigate('/track-order');
                  }}
                  style={{
                    padding: '0.55rem 0.35rem',
                    borderRadius: '6px',
                    border: 'none',
                    backgroundColor: currentView === 'track-order' ? '#111111' : '#FFFFFF',
                    color: currentView === 'track-order' ? '#FFFFFF' : '#111111',
                    fontSize: '0.72rem',
                    fontWeight: 700,
                    letterSpacing: '0.04em',
                    textTransform: 'uppercase',
                    cursor: 'pointer',
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'center',
                    gap: '0.25rem',
                    boxShadow: '0 1px 2px rgba(0,0,0,0.05)',
                  }}
                >
                  <Truck size={14} />
                  <span>Track</span>
                </button>

                {(isDemoMode || isDelivery || isAdmin) && (
                  <>
                    <button
                      type="button"
                      onClick={handleOpenDelivery}
                      style={{
                        padding: '0.55rem 0.35rem',
                        borderRadius: '6px',
                        border: 'none',
                        backgroundColor: currentView === 'delivery' || isDelivery ? '#111111' : '#FFFFFF',
                        color: currentView === 'delivery' || isDelivery ? '#FFFFFF' : '#111111',
                        fontSize: '0.72rem',
                        fontWeight: 700,
                        letterSpacing: '0.04em',
                        textTransform: 'uppercase',
                        cursor: 'pointer',
                        display: 'flex',
                        flexDirection: 'column',
                        alignItems: 'center',
                        gap: '0.25rem',
                        boxShadow: '0 1px 2px rgba(0,0,0,0.05)',
                      }}
                    >
                      <div style={{ display: 'flex', alignItems: 'center', gap: '0.25rem' }}>
                        <span style={{ width: '5px', height: '5px', borderRadius: '50%', backgroundColor: '#10B981', display: 'inline-block' }} />
                        <Truck size={14} />
                      </div>
                      <span>Courier</span>
                    </button>

                    <button
                      type="button"
                      onClick={handleOpenAdmin}
                      style={{
                        padding: '0.55rem 0.35rem',
                        borderRadius: '6px',
                        border: 'none',
                        backgroundColor: currentView === 'admin' || isAdmin ? '#111111' : '#FFFFFF',
                        color: currentView === 'admin' || isAdmin ? '#FFFFFF' : '#111111',
                        fontSize: '0.72rem',
                        fontWeight: 700,
                        letterSpacing: '0.04em',
                        textTransform: 'uppercase',
                        cursor: 'pointer',
                        display: 'flex',
                        flexDirection: 'column',
                        alignItems: 'center',
                        gap: '0.25rem',
                        boxShadow: '0 1px 2px rgba(0,0,0,0.05)',
                      }}
                    >
                      <div style={{ display: 'flex', alignItems: 'center', gap: '0.25rem' }}>
                        <span style={{ width: '5px', height: '5px', borderRadius: '50%', backgroundColor: '#F59E0B', display: 'inline-block' }} />
                        <LayoutDashboard size={14} />
                      </div>
                      <span>Admin</span>
                    </button>
                  </>
                )}
              </div>

              {/* Mobile Dedicated 'Shop All Handmade' Hero Card */}
              <div style={{ marginBottom: '0.85rem' }}>
                <button
                  type="button"
                  onClick={() => {
                    setIsMobileMenuOpen(false);
                    onViewCatalog({ categorySlug: 'all-handmade' });
                  }}
                  style={{
                    width: '100%',
                    padding: '0.75rem 0.85rem',
                    backgroundColor: '#111111',
                    color: '#FFFFFF',
                    border: '1px solid #222222',
                    borderRadius: '6px',
                    cursor: 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    boxShadow: '0 2px 8px rgba(0,0,0,0.15)',
                  }}
                >
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                    <Sparkles size={15} color="#E35205" />
                    <span style={{ fontSize: '0.78rem', fontWeight: 800, letterSpacing: '0.08em', textTransform: 'uppercase' }}>
                      Shop All Handmade
                    </span>
                  </div>
                  <ArrowRight size={14} color="#E35205" />
                </button>
              </div>

              {/* Department & Subcategory Accordion */}
              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.25rem' }}>
                {navigationItems.map((item) => {
                  const isExpanded = mobileExpandedCat === item.id;

                  return (
                    <div key={item.id} style={{ borderBottom: '1px solid #F0EDE8' }}>
                      <div style={{
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'space-between',
                        padding: '0.75rem 0',
                      }}>
                        <button
                          onClick={() => {
                            onViewCatalog({ categorySlug: item.slug });
                            setIsMobileMenuOpen(false);
                          }}
                          style={{
                            textAlign: 'left',
                            background: 'transparent',
                            border: 'none',
                            fontSize: '0.92rem',
                            fontWeight: item.isActive ? 800 : 700,
                            color: item.isActive ? '#E35205' : '#111111',
                            letterSpacing: '0.08em',
                            textTransform: 'uppercase',
                            cursor: 'pointer',
                            flexGrow: 1,
                          }}
                        >
                          {item.label}
                        </button>

                        {item.subcategories && item.subcategories.length > 0 && (
                          <button
                            onClick={() => setMobileExpandedCat(isExpanded ? null : item.id)}
                            style={{
                              background: 'transparent',
                              border: 'none',
                              padding: '0.25rem 0.5rem',
                              cursor: 'pointer',
                              color: '#666666',
                            }}
                            aria-label={`Toggle ${item.label} submenu`}
                          >
                            <ChevronDown
                              size={16}
                              style={{
                                transform: isExpanded ? 'rotate(180deg)' : 'rotate(0deg)',
                                transition: 'transform 0.2s ease',
                              }}
                            />
                          </button>
                        )}
                      </div>

                      {isExpanded && item.subcategories && (
                        <div style={{
                          backgroundColor: '#FAF9F6',
                          borderRadius: '6px',
                          padding: '0.75rem',
                          marginBottom: '0.75rem',
                          display: 'flex',
                          flexDirection: 'column',
                          gap: '0.4rem',
                        }}>
                          {item.subcategories.map((subcat) => (
                            <button
                              key={subcat.label}
                              onClick={() => {
                                if (subcat.slug) {
                                  onViewCatalog({ categorySlug: subcat.slug });
                                } else if (subcat.search) {
                                  onViewCatalog({ search: subcat.search });
                                }
                                setIsMobileMenuOpen(false);
                              }}
                              style={{
                                textAlign: 'left',
                                background: 'transparent',
                                border: 'none',
                                fontSize: '0.8rem',
                                color: (subcat.slug && currentCategorySlug === subcat.slug) ? '#E35205' : '#333333',
                                fontWeight: (subcat.slug && currentCategorySlug === subcat.slug) ? 800 : 500,
                                padding: '0.35rem 0.25rem',
                                cursor: 'pointer',
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'space-between',
                              }}
                            >
                              <span>{subcat.label}</span>
                              <ArrowRight size={12} style={{ opacity: 0.4 }} />
                            </button>
                          ))}
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>

              {/* Secondary Utility Links */}
              <div style={{
                marginTop: 'auto',
                paddingTop: '1.5rem',
                borderTop: '1px solid #ECEAE7',
                display: 'flex',
                flexDirection: 'column',
                gap: '0.75rem',
              }}>
                <button
                  onClick={() => {
                    onViewCatalog();
                    setIsMobileMenuOpen(false);
                  }}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '0.65rem',
                    background: 'transparent',
                    border: 'none',
                    color: '#111111',
                    fontSize: '0.82rem',
                    fontWeight: 700,
                    cursor: 'pointer',
                    padding: '0.3rem 0',
                    textTransform: 'uppercase',
                    letterSpacing: '0.06em',
                  }}
                >
                  <ShoppingBag size={16} color="#E35205" />
                  <span>View Full Catalog</span>
                </button>

                <button
                  onClick={() => {
                    onOpenTrackOrder();
                    setIsMobileMenuOpen(false);
                  }}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '0.65rem',
                    background: 'transparent',
                    border: 'none',
                    color: '#111111',
                    fontSize: '0.82rem',
                    fontWeight: 700,
                    cursor: 'pointer',
                    padding: '0.3rem 0',
                    textTransform: 'uppercase',
                    letterSpacing: '0.06em',
                  }}
                >
                  <Truck size={16} color="#E35205" />
                  <span>Track Parcel</span>
                </button>

                <button
                  onClick={() => {
                    setIsWishlistOpen(true);
                    setIsMobileMenuOpen(false);
                  }}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '0.65rem',
                    background: 'transparent',
                    border: 'none',
                    color: '#111111',
                    fontSize: '0.82rem',
                    fontWeight: 700,
                    cursor: 'pointer',
                    padding: '0.3rem 0',
                    textTransform: 'uppercase',
                    letterSpacing: '0.06em',
                  }}
                >
                  <Heart size={16} color="#E35205" fill={wishlistCount > 0 ? '#E35205' : 'none'} />
                  <span>My Favorites {wishlistCount > 0 ? `(${wishlistCount})` : ''}</span>
                </button>

                {isAuthenticated ? (
                  <button
                    onClick={() => {
                      onOpenMyOrders();
                      setIsMobileMenuOpen(false);
                    }}
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: '0.65rem',
                      background: 'transparent',
                      border: 'none',
                      color: '#111111',
                      fontSize: '0.82rem',
                      fontWeight: 700,
                      cursor: 'pointer',
                      padding: '0.3rem 0',
                      textTransform: 'uppercase',
                      letterSpacing: '0.06em',
                    }}
                  >
                    <User size={16} color="#E35205" />
                    <span>My Account ({user?.name})</span>
                  </button>
                ) : (
                  <button
                    onClick={() => {
                      openLoginModal('login');
                      setIsMobileMenuOpen(false);
                    }}
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: '0.65rem',
                      background: 'transparent',
                      border: 'none',
                      color: '#111111',
                      fontSize: '0.82rem',
                      fontWeight: 700,
                      cursor: 'pointer',
                      padding: '0.3rem 0',
                      textTransform: 'uppercase',
                      letterSpacing: '0.06em',
                    }}
                  >
                    <User size={16} color="#E35205" />
                    <span>Sign In / Register</span>
                  </button>
                )}
              </div>
            </div>
          </div>
        )}
      </header>
    </>
  );
}
