import React, { useState } from 'react';
import { Routes, Route, useNavigate, useLocation, Navigate, useParams } from 'react-router-dom';
import { StoreProvider, useStore } from './context/StoreContext';
import { CartProvider } from './context/CartContext';
import { AuthProvider } from './context/AuthContext';
import { WishlistProvider } from './context/WishlistContext';
import Navbar from './components/Navbar';
import DemoBanner from './components/DemoBanner';
import Footer from './components/Footer';
import CartDrawer from './components/CartDrawer';
import WishlistDrawer from './components/WishlistDrawer';
import AuthModal from './components/AuthModal';
import ErrorBoundary from './components/ErrorBoundary';
import Home from './pages/Home';
import ProductListing from './pages/ProductListing';
import ProductDetail from './pages/ProductDetail';
import Checkout from './pages/Checkout';
import OrderSuccess from './pages/OrderSuccess';
import MyOrders from './pages/MyOrders';
import TrackOrder from './pages/TrackOrder';
import DeliveryPortal from './pages/delivery/DeliveryPortal';
import AdminDashboard from './pages/admin/AdminDashboard';
import { Sparkles, ArrowLeft, Truck, LayoutDashboard } from 'lucide-react';
import './theme.css';

function ProductDetailRouteWrapper({ onSelectProduct }) {
  const { slug } = useParams();
  const navigate = useNavigate();

  return (
    <ProductDetail
      key={slug}
      productId={slug}
      onBack={() => {
        if (window.history.length > 1) {
          navigate(-1);
        } else {
          navigate('/catalog');
        }
      }}
      onSelectProduct={onSelectProduct}
      onInstantCheckout={() => navigate('/checkout')}
    />
  );
}

function MainApp() {
  const { switchFeedback, storeType } = useStore();
  const navigate = useNavigate();
  const location = useLocation();

  const [completedOrder, setCompletedOrder] = useState(null);
  const [catalogParams, setCatalogParams] = useState({});

  // Dynamically derive currentView from active browser URL
  const pathname = location.pathname;
  let currentView = 'home';
  if (pathname.startsWith('/catalog') || pathname.startsWith('/collection')) {
    currentView = 'catalog';
  } else if (pathname.startsWith('/product')) {
    currentView = 'product-detail';
  } else if (pathname.startsWith('/checkout')) {
    currentView = 'checkout';
  } else if (pathname.startsWith('/order-success')) {
    currentView = 'order-success';
  } else if (pathname.startsWith('/my-orders')) {
    currentView = 'my-orders';
  } else if (pathname.startsWith('/track-order')) {
    currentView = 'track-order';
  } else if (pathname.startsWith('/delivery')) {
    currentView = 'delivery';
  } else if (pathname.startsWith('/admin')) {
    currentView = 'admin';
  }

  const handleSelectProduct = (product) => {
    const target = product.slug || product.id;
    navigate(`/products/${target}`);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleViewCatalog = (params = {}) => {
    setCatalogParams(params);
    const query = new URLSearchParams();
    if (params.categorySlug) query.set('category', params.categorySlug);
    if (params.search) query.set('search', params.search);
    if (params.sort) query.set('sort', params.sort);
    const qs = query.toString();
    navigate(`/catalog${qs ? `?${qs}` : ''}`);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleGoHome = (scrollToSection = null) => {
    navigate('/');
    if (scrollToSection) {
      setTimeout(() => {
        const el = document.getElementById(scrollToSection);
        if (el) el.scrollIntoView({ behavior: 'smooth' });
      }, 120);
    } else {
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  };

  const handleOrderSuccess = (order) => {
    setCompletedOrder(order);
    const target = order?.order_number || order?.id;
    navigate(target ? `/order-success/${target}` : '/order-success');
  };

  return (
    <div style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column' }}>
      {/* Real-time Switcher Toast Feedback */}
      {switchFeedback && (
        <div style={{
          position: 'fixed',
          top: '20px',
          right: '20px',
          zIndex: 200,
          backgroundColor: 'var(--primary-color)',
          color: 'var(--button-text)',
          padding: '0.85rem 1.4rem',
          borderRadius: 'var(--radius)',
          boxShadow: '0 10px 30px rgba(0,0,0,0.3)',
          display: 'flex',
          alignItems: 'center',
          gap: '0.6rem',
          fontWeight: 700,
          fontSize: '0.9rem',
        }} className="animate-fade-in">
          <Sparkles size={18} />
          <span>{switchFeedback}</span>
        </div>
      )}

      {/* Floating Recruiter Demo Banner */}
      <DemoBanner />

      {/* Navigation Bar (hidden in full admin and dedicated courier views) */}
      {currentView !== 'admin' && currentView !== 'delivery' ? (
        <Navbar
          currentView={currentView}
          catalogParams={catalogParams}
          onGoHome={handleGoHome}
          onViewCatalog={handleViewCatalog}
          onOpenAdmin={() => navigate('/admin')}
          onOpenMyOrders={() => navigate('/my-orders')}
          onOpenTrackOrder={() => navigate('/track-order')}
          onOpenDelivery={() => navigate('/delivery')}
        />
      ) : null}

      {/* Return to Storefront bar if inside delivery view */}
      {currentView === 'delivery' && (
        <nav
          aria-label="Courier Quick Navigation"
          style={{
            backgroundColor: '#18181B',
            color: '#D4D4D8',
            fontSize: '0.74rem',
            padding: '0.45rem 1.25rem',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            borderBottom: '1px solid #27272A',
            fontFamily: "'Plus Jakarta Sans', -apple-system, sans-serif",
            flexWrap: 'wrap',
            gap: '0.65rem',
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.65rem', flexWrap: 'wrap' }}>
            <button
              onClick={() => handleGoHome()}
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: '0.45rem',
                backgroundColor: 'transparent',
                border: 'none',
                color: '#E4E4E7',
                fontSize: '0.76rem',
                fontWeight: 600,
                cursor: 'pointer',
                padding: '0.3rem 0.6rem',
                borderRadius: '4px',
                transition: 'all 0.15s ease',
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.backgroundColor = '#27272A';
                e.currentTarget.style.color = '#FFFFFF';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.backgroundColor = 'transparent';
                e.currentTarget.style.color = '#E4E4E7';
              }}
            >
              <ArrowLeft size={14} />
              <span>Return to Customer Storefront</span>
            </button>

            <span style={{ color: '#3F3F46' }}>|</span>

            <button
              onClick={() => navigate('/track-order')}
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: '0.45rem',
                backgroundColor: 'transparent',
                border: 'none',
                color: '#A1A1AA',
                fontSize: '0.76rem',
                fontWeight: 600,
                cursor: 'pointer',
                padding: '0.3rem 0.6rem',
                borderRadius: '4px',
                transition: 'all 0.15s ease',
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.backgroundColor = '#27272A';
                e.currentTarget.style.color = '#FFFFFF';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.backgroundColor = 'transparent';
                e.currentTarget.style.color = '#A1A1AA';
              }}
            >
              <Truck size={14} />
              <span>Track Orders</span>
            </button>

            <span style={{ color: '#3F3F46' }}>|</span>

            <button
              onClick={() => navigate('/admin')}
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: '0.45rem',
                backgroundColor: 'transparent',
                border: 'none',
                color: '#A1A1AA',
                fontSize: '0.76rem',
                fontWeight: 600,
                cursor: 'pointer',
                padding: '0.3rem 0.6rem',
                borderRadius: '4px',
                transition: 'all 0.15s ease',
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.backgroundColor = '#27272A';
                e.currentTarget.style.color = '#FFFFFF';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.backgroundColor = 'transparent';
                e.currentTarget.style.color = '#A1A1AA';
              }}
            >
              <LayoutDashboard size={14} />
              <span>Admin Console</span>
            </button>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <span style={{
              fontSize: '0.7rem',
              fontWeight: 800,
              letterSpacing: '0.06em',
              textTransform: 'uppercase',
              color: '#A1A1AA',
              display: 'inline-flex',
              alignItems: 'center',
              gap: '0.4rem',
            }}>
              <span style={{ width: '6px', height: '6px', borderRadius: '50%', backgroundColor: '#10B981' }} />
              Delivery Fleet Console
            </span>
          </div>
        </nav>
      )}

      {/* Declarative Page Routing with Clean Browser URLs */}
      <main style={{ flexGrow: 1 }}>
        <ErrorBoundary>
          <Routes>
            <Route
              path="/"
              element={<Home onSelectProduct={handleSelectProduct} onViewCatalog={handleViewCatalog} />}
            />
            <Route
              path="/catalog"
              element={<ProductListing initialParams={catalogParams} onSelectProduct={handleSelectProduct} />}
            />
            <Route
              path="/collection"
              element={<ProductListing initialParams={catalogParams} onSelectProduct={handleSelectProduct} />}
            />
            <Route
              path="/products/:slug"
              element={<ProductDetailRouteWrapper onSelectProduct={handleSelectProduct} />}
            />
            <Route
              path="/product/:slug"
              element={<ProductDetailRouteWrapper onSelectProduct={handleSelectProduct} />}
            />
            <Route
              path="/checkout"
              element={
                <Checkout
                  onBackToShopping={() => navigate('/catalog')}
                  onOrderSuccess={handleOrderSuccess}
                />
              }
            />
            <Route
              path="/order-success"
              element={
                <OrderSuccess
                  order={completedOrder}
                  onContinueShopping={() => navigate('/')}
                />
              }
            />
            <Route
              path="/order-success/:orderId"
              element={
                <OrderSuccess
                  order={completedOrder}
                  onContinueShopping={() => navigate('/')}
                />
              }
            />
            <Route
              path="/my-orders"
              element={<MyOrders onNavigate={(p) => navigate(p === 'home' ? '/' : `/${p}`)} />}
            />
            <Route path="/track-order" element={<TrackOrder />} />
            <Route path="/delivery" element={<DeliveryPortal />} />
            <Route path="/admin" element={<AdminDashboard onBackToStorefront={() => navigate('/')} />} />
            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
        </ErrorBoundary>
      </main>

      {/* Slide-over Cart Drawer */}
      <CartDrawer onProceedToCheckout={() => navigate('/checkout')} />

      {/* Slide-over Favorites / Wishlist Drawer */}
      <WishlistDrawer onSelectProduct={handleSelectProduct} />

      {/* Global Auth Modal for Login / Registration / Quick Demo */}
      <AuthModal />

      {/* Dynamic Footer (only on storefront pages) */}
      {currentView !== 'admin' && currentView !== 'delivery' && <Footer />}
    </div>
  );
}

export default function App() {
  return (
    <StoreProvider>
      <AuthProvider>
        <CartProvider>
          <WishlistProvider>
            <MainApp />
          </WishlistProvider>
        </CartProvider>
      </AuthProvider>
    </StoreProvider>
  );
}
