import React, { useState, useEffect, useCallback } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import api from '../api/axios';
import { useStore } from '../context/StoreContext';
import { useAuth } from '../context/AuthContext';
import {
  Search,
  Package,
  PackageCheck,
  Truck,
  CheckCircle2,
  Clock,
  MapPin,
  Phone,
  User,
  Calendar,
  AlertCircle,
  XCircle,
  ArrowRight,
  RefreshCw,
  Copy,
  Check,
  ExternalLink,
  ShieldCheck,
  FileText,
  ShoppingBag,
  Sparkles,
  ArrowLeft,
  LayoutDashboard,
} from 'lucide-react';
import KhaamLogo from '../components/KhaamLogo';
import FlexiPayTracker from '../components/FlexiPayTracker';

export default function TrackOrder() {
  const [searchParams, setSearchParams] = useSearchParams();
  const navigate = useNavigate();
  const { storeType, formatPrice, store } = useStore();
  const { loginAsDemoRole, isAdmin, isDelivery, isDemoMode } = useAuth();

  const [orderNumber, setOrderNumber] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [order, setOrder] = useState(null);
  const [copied, setCopied] = useState(false);
  const [lastRefreshed, setLastRefreshed] = useState(null);
  const [isAutoRefreshing, setIsAutoRefreshing] = useState(false);

  // Read URL query parameters on initial load
  const initialOrderNumber = searchParams.get('order_number') || searchParams.get('order') || searchParams.get('orderId') || '';

  const handleTrack = useCallback(async (numToTrack = orderNumber) => {
    const cleanNum = (numToTrack || '').trim();

    if (!cleanNum) {
      setError('Please enter your Order Number (e.g. FLX-ABCD-1234).');
      return;
    }

    setLoading(true);
    setError('');

    try {
      const res = await api.get('/api/orders/track', {
        params: {
          order_number: cleanNum,
        },
      });

      if (res.data?.success && res.data?.order) {
        setOrder(res.data.order);
        setLastRefreshed(new Date());

        // Update URL query parameters silently
        const params = {};
        if (res.data.order.order_number) params.order_number = res.data.order.order_number;
        setSearchParams(params, { replace: true });
      } else {
        setError(res.data?.message || 'No parcel found matching this Order Number. Please check and try again.');
        setOrder(null);
      }
    } catch (err) {
      const msg = err.response?.data?.message || 'We could not locate an order with the provided Order #. Please verify and try again.';
      setError(msg);
      setOrder(null);
    } finally {
      setLoading(false);
    }
  }, [orderNumber, setSearchParams]);

  // Auto-search on mount if URL parameters are present
  useEffect(() => {
    if (initialOrderNumber) {
      setOrderNumber(initialOrderNumber);
      handleTrack(initialOrderNumber);
    }
  }, [initialOrderNumber, handleTrack]);

  // Periodic auto-refresh every 15 seconds if an active non-delivered order is being viewed
  useEffect(() => {
    if (!order || order.status === 'delivered' || order.status === 'cancelled') return;

    const interval = setInterval(() => {
      setIsAutoRefreshing(true);
      api.get('/api/orders/track', {
        params: {
          order_number: order.order_number,
        },
      })
      .then((res) => {
        if (res.data?.success && res.data?.order) {
          setOrder(res.data.order);
          setLastRefreshed(new Date());
        }
      })
      .catch(() => {})
      .finally(() => setIsAutoRefreshing(false));
    }, 15000);

    return () => clearInterval(interval);
  }, [order]);

  const handleCopy = (text) => {
    if (!text) return;
    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  // Determine current timeline progress step (1 to 4)
  const getTimelineStep = (ord) => {
    if (!ord) return 1;
    if (ord.status === 'cancelled' || ord.delivery_status === 'failed') return -1;
    if (ord.status === 'delivered' || ord.delivery_status === 'delivered') return 4;
    if (ord.status === 'shipped' || ord.delivery_status === 'out_for_delivery' || ord.delivery_status === 'in_transit') return 3;
    if (ord.status === 'processing' || ord.status === 'packed' || ord.delivery_status === 'assigned') return 2;
    return 1;
  };

  const currentStep = getTimelineStep(order);
  const isCancelled = currentStep === -1;

  // Custom step titles based on store type
  const packingStepTitle = storeType === 'clothing'
    ? 'Atelier Packing & QC'
    : storeType === 'jewelry'
    ? 'Gemologist Vault Prep'
    : 'Warehouse Assembly';

  const steps = [
    {
      step: 1,
      title: 'Order Confirmed',
      desc: 'Placed & phone OTP verified',
      icon: PackageCheck,
      time: order?.created_at ? new Date(order.created_at).toLocaleDateString(undefined, { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' }) : null,
    },
    {
      step: 2,
      title: packingStepTitle,
      desc: 'Inspected, boxed & sealed',
      icon: Package,
      time: order?.updated_at && currentStep >= 2 ? 'Completed' : null,
    },
    {
      step: 3,
      title: 'Dispatched with Courier',
      desc: order?.delivery_rider?.name ? `Courier: ${order.delivery_rider.name}` : 'Handed to express logistics fleet',
      icon: Truck,
      time: currentStep >= 3 ? (order?.delivery_status === 'out_for_delivery' ? 'Out for Delivery' : 'In Transit') : null,
    },
    {
      step: 4,
      title: 'Delivered',
      desc: 'Safely handed over to customer',
      icon: CheckCircle2,
      time: order?.delivered_at ? new Date(order.delivered_at).toLocaleDateString(undefined, { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' }) : (currentStep === 4 ? 'Delivered' : null),
    },
  ];

  return (
    <div style={{
      maxWidth: '1000px',
      margin: '0 auto',
      padding: '2rem 1.25rem 4rem',
      minHeight: '80vh',
    }}>
      {/* Top Editorial Breadcrumbs & Quick Role Switcher */}
      <div style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        marginBottom: '2rem',
        paddingBottom: '1rem',
        borderBottom: '1px solid var(--border-color)',
        flexWrap: 'wrap',
        gap: '0.75rem',
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '1.25rem' }}>
          <button
            type="button"
            onClick={() => navigate('/')}
            style={{
              background: 'transparent',
              border: '1.25px solid #111111',
              borderRadius: '3px',
              padding: '0.42rem 0.95rem',
              fontSize: '0.74rem',
              fontWeight: 700,
              color: '#111111',
              cursor: 'pointer',
              display: 'inline-flex',
              alignItems: 'center',
              gap: '0.45rem',
              textTransform: 'uppercase',
              letterSpacing: '0.08em',
              transition: 'all 0.18s ease',
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.backgroundColor = '#111111';
              e.currentTarget.style.color = '#FFFFFF';
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.backgroundColor = 'transparent';
              e.currentTarget.style.color = '#111111';
            }}
            title="Return to clothing storefront"
          >
            <ArrowLeft size={13} strokeWidth={2} />
            <span>Return to Storefront</span>
          </button>

          <div
            onClick={() => navigate('/')}
            style={{ cursor: 'pointer', display: 'flex', alignItems: 'center' }}
            title="KHAAM POSHAK Storefront"
          >
            <KhaamLogo variant="navbar" size="compact" />
          </div>
        </div>

        <div
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
          {/* Direct One-Click Courier Fleet Access */}
          <button
            type="button"
            onClick={async () => {
              if (!isDelivery) await loginAsDemoRole('courier');
              navigate('/delivery');
            }}
            style={{
              padding: '0.36rem 0.8rem',
              borderRadius: '999px',
              backgroundColor: isDelivery ? '#111111' : 'transparent',
              color: isDelivery ? '#FFFFFF' : '#27272A',
              border: 'none',
              fontSize: '0.72rem',
              fontWeight: isDelivery ? 800 : 600,
              letterSpacing: '0.06em',
              textTransform: 'uppercase',
              cursor: 'pointer',
              display: 'inline-flex',
              alignItems: 'center',
              gap: '0.4rem',
              transition: 'all 0.18s cubic-bezier(0.16, 1, 0.3, 1)',
            }}
            onMouseEnter={(e) => {
              if (!isDelivery) e.currentTarget.style.backgroundColor = '#EFECE6';
            }}
            onMouseLeave={(e) => {
              if (!isDelivery) e.currentTarget.style.backgroundColor = 'transparent';
            }}
            title="Open Courier Fleet Delivery Portal"
          >
            <span style={{ width: '6px', height: '6px', borderRadius: '50%', backgroundColor: '#10B981', display: 'inline-block' }} />
            <Truck size={12} strokeWidth={2} />
            <span>Courier Fleet</span>
          </button>

          <span style={{ width: '1px', height: '14px', backgroundColor: '#E2DFDA', margin: '0 1px' }} />

          {/* Direct One-Click Admin Console Access */}
          <button
            type="button"
            onClick={async () => {
              if (!isAdmin) await loginAsDemoRole('admin');
              navigate('/admin');
            }}
            style={{
              padding: '0.36rem 0.8rem',
              borderRadius: '999px',
              backgroundColor: isAdmin ? '#111111' : 'transparent',
              color: isAdmin ? '#FFFFFF' : '#27272A',
              border: 'none',
              fontSize: '0.72rem',
              fontWeight: isAdmin ? 800 : 600,
              letterSpacing: '0.06em',
              textTransform: 'uppercase',
              cursor: 'pointer',
              display: 'inline-flex',
              alignItems: 'center',
              gap: '0.4rem',
              transition: 'all 0.18s cubic-bezier(0.16, 1, 0.3, 1)',
            }}
            onMouseEnter={(e) => {
              if (!isAdmin) e.currentTarget.style.backgroundColor = '#EFECE6';
            }}
            onMouseLeave={(e) => {
              if (!isAdmin) e.currentTarget.style.backgroundColor = 'transparent';
            }}
            title="Open Store Administrator Management Console"
          >
            <span style={{ width: '6px', height: '6px', borderRadius: '50%', backgroundColor: '#F59E0B', display: 'inline-block' }} />
            <LayoutDashboard size={12} strokeWidth={2} />
            <span>Admin Console</span>
          </button>
        </div>
      </div>

      {/* Header Banner */}
      <div style={{ textAlign: 'center', marginBottom: '2.5rem' }}>
        <div style={{
          display: 'inline-flex',
          alignItems: 'center',
          gap: '0.5rem',
          padding: '0.4rem 1rem',
          borderRadius: '9999px',
          backgroundColor: 'var(--badge-bg)',
          color: 'var(--badge-text)',
          fontSize: '0.8rem',
          fontWeight: 700,
          textTransform: 'uppercase',
          letterSpacing: '0.08em',
          marginBottom: '0.85rem',
          border: '1px solid var(--border-color)',
        }}>
          <Truck size={15} style={{ color: 'var(--primary-color)' }} />
          <span>Live Express Parcel Tracking</span>
        </div>

        <h1 style={{
          fontSize: '2.4rem',
          fontWeight: 900,
          fontFamily: 'var(--font-heading)',
          color: 'var(--text-main)',
          marginBottom: '0.65rem',
          letterSpacing: '-0.02em',
        }}>
          Where is My Parcel?
        </h1>

        <p style={{
          fontSize: '1rem',
          color: 'var(--text-muted)',
          maxWidth: '580px',
          margin: '0 auto',
          lineHeight: 1.5,
        }}>
          Enter your Order Number to view live courier dispatch updates, atelier packing verification, and delivery timelines.
        </p>
      </div>

      {/* Search Input Box */}
      <div style={{
        backgroundColor: 'var(--card-bg)',
        border: '1px solid var(--border-color)',
        borderRadius: 'var(--radius)',
        padding: '1.75rem',
        boxShadow: '0 10px 30px rgba(0, 0, 0, 0.05)',
        marginBottom: '2.5rem',
      }}>
        <form
          onSubmit={(e) => {
            e.preventDefault();
            handleTrack();
          }}
          style={{
            display: 'grid',
            gridTemplateColumns: '1fr auto',
            gap: '1rem',
            alignItems: 'flex-end',
          }}
        >
          <div>
            <label style={{
              display: 'block',
              fontSize: '0.82rem',
              fontWeight: 700,
              color: 'var(--text-main)',
              marginBottom: '0.4rem',
            }}>
              Order Tracking Number (e.g. KP-DEMO-1002 or KP-ORD-1001)
            </label>
            <div style={{ position: 'relative' }}>
              <input
                type="text"
                placeholder="e.g. KP-DEMO-1002"
                value={orderNumber}
                onChange={(e) => setOrderNumber(e.target.value.toUpperCase())}
                style={{
                  width: '100%',
                  padding: '0.75rem 0.9rem',
                  fontSize: '0.92rem',
                  fontWeight: 600,
                  letterSpacing: '0.05em',
                  borderRadius: 'var(--radius)',
                  border: '1px solid var(--border-color)',
                  backgroundColor: 'var(--surface)',
                  color: 'var(--text-main)',
                  outline: 'none',
                }}
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            style={{
              padding: '0.75rem 1.75rem',
              height: '46px',
              backgroundColor: 'var(--primary-color)',
              color: 'var(--button-text)',
              border: 'none',
              borderRadius: 'var(--radius)',
              fontWeight: 800,
              fontSize: '0.95rem',
              cursor: loading ? 'not-allowed' : 'pointer',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '0.5rem',
              transition: 'opacity 0.2s',
              opacity: loading ? 0.7 : 1,
              whiteSpace: 'nowrap',
            }}
          >
            {loading ? (
              <>
                <RefreshCw size={17} className="animate-spin" />
                <span>Searching...</span>
              </>
            ) : (
              <>
                <Search size={17} />
                <span>Track Parcel</span>
              </>
            )}
          </button>
        </form>

        {/* Quick Sample Lookup Pills (Visible in Demo Mode) */}
        {isDemoMode && (
          <div style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            flexWrap: 'wrap',
            gap: '0.5rem',
            marginTop: '1rem',
            paddingTop: '0.85rem',
            borderTop: '1px solid var(--border-color)',
            fontSize: '0.78rem',
            color: 'var(--text-muted)',
          }}>
            <span style={{ fontSize: '0.74rem', color: 'var(--text-muted)' }}>
              Quick Sample Order Lookups:
            </span>
            <div style={{ display: 'flex', gap: '0.45rem', flexWrap: 'wrap' }}>
              <button
                type="button"
                onClick={() => {
                  setOrderNumber('KP-DEMO-1002');
                  handleTrack('KP-DEMO-1002');
                }}
                style={{
                  background: 'var(--surface)',
                  border: '1px solid var(--border-color)',
                  color: 'var(--text-main)',
                  fontWeight: 600,
                  cursor: 'pointer',
                  borderRadius: '4px',
                  padding: '0.25rem 0.6rem',
                  fontSize: '0.74rem',
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '0.4rem',
                  transition: 'all 0.15s ease',
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.borderColor = '#111111';
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.borderColor = 'var(--border-color)';
                }}
                title="Inspect live courier delivery route"
              >
                <span style={{ width: '6px', height: '6px', borderRadius: '50%', backgroundColor: '#2563EB', display: 'inline-block' }} />
                <strong>KP-DEMO-1002</strong>
                <span style={{ color: 'var(--text-muted)', fontSize: '0.68rem' }}>· In Transit</span>
              </button>

              <button
                type="button"
                onClick={() => {
                  setOrderNumber('KP-DEMO-1001');
                  handleTrack('KP-DEMO-1001');
                }}
                style={{
                  background: 'var(--surface)',
                  border: '1px solid var(--border-color)',
                  color: 'var(--text-main)',
                  fontWeight: 600,
                  cursor: 'pointer',
                  borderRadius: '4px',
                  padding: '0.25rem 0.6rem',
                  fontSize: '0.74rem',
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '0.4rem',
                  transition: 'all 0.15s ease',
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.borderColor = '#111111';
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.borderColor = 'var(--border-color)';
                }}
                title="Inspect order currently in processing atelier"
              >
                <span style={{ width: '6px', height: '6px', borderRadius: '50%', backgroundColor: '#D97706', display: 'inline-block' }} />
                <strong>KP-DEMO-1001</strong>
                <span style={{ color: 'var(--text-muted)', fontSize: '0.68rem' }}>· Processing</span>
              </button>

              <button
                type="button"
                onClick={() => {
                  setOrderNumber('KP-DEMO-1003');
                  handleTrack('KP-DEMO-1003');
                }}
                style={{
                  background: 'var(--surface)',
                  border: '1px solid var(--border-color)',
                  color: 'var(--text-main)',
                  fontWeight: 600,
                  cursor: 'pointer',
                  borderRadius: '4px',
                  padding: '0.25rem 0.6rem',
                  fontSize: '0.74rem',
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '0.4rem',
                  transition: 'all 0.15s ease',
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.borderColor = '#111111';
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.borderColor = 'var(--border-color)';
                }}
                title="Inspect delivered parcel"
              >
                <span style={{ width: '6px', height: '6px', borderRadius: '50%', backgroundColor: '#059669', display: 'inline-block' }} />
                <strong>KP-DEMO-1003</strong>
                <span style={{ color: 'var(--text-muted)', fontSize: '0.68rem' }}>· Delivered</span>
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Error Message Alert */}
      {error && (
        <div style={{
          backgroundColor: '#FEF2F2',
          border: '1px solid #FCA5A5',
          borderRadius: 'var(--radius)',
          padding: '1.25rem',
          color: '#991B1B',
          display: 'flex',
          alignItems: 'flex-start',
          gap: '0.75rem',
          marginBottom: '2rem',
        }} className="animate-fade-in">
          <AlertCircle size={20} style={{ flexShrink: 0, marginTop: '2px' }} />
          <div>
            <div style={{ fontWeight: 800, fontSize: '0.95rem', marginBottom: '0.2rem' }}>Parcel Not Found</div>
            <div style={{ fontSize: '0.86rem', lineHeight: 1.4 }}>{error}</div>
          </div>
        </div>
      )}

      {/* Order Tracking Dashboard Results */}
      {order && (
        <div className="animate-fade-in" style={{ display: 'flex', flexDirection: 'column', gap: '2rem' }}>
          
          {/* Main Parcel Status Summary Card */}
          <div style={{
            backgroundColor: 'var(--card-bg)',
            border: isCancelled ? '2px solid #EF4444' : '1px solid var(--border-color)',
            borderRadius: 'var(--radius)',
            padding: '2rem',
            boxShadow: '0 10px 30px rgba(0, 0, 0, 0.05)',
          }}>
            {/* Top Bar: Order ID, Copy Button, Auto-Refresh Status */}
            <div style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              flexWrap: 'wrap',
              gap: '1rem',
              paddingBottom: '1.5rem',
              borderBottom: '1px solid var(--border-color)',
              marginBottom: '2rem',
            }}>
              <div>
                <span style={{
                  fontSize: '0.75rem',
                  fontWeight: 800,
                  color: 'var(--text-muted)',
                  textTransform: 'uppercase',
                  letterSpacing: '0.08em',
                }}>
                  Tracking Order
                </span>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem', marginTop: '0.2rem' }}>
                  <h2 style={{
                    fontSize: '1.6rem',
                    fontWeight: 900,
                    fontFamily: 'monospace',
                    color: 'var(--text-main)',
                    letterSpacing: '0.05em',
                  }}>
                    {order.order_number}
                  </h2>
                  <button
                    onClick={() => handleCopy(order.order_number)}
                    style={{
                      background: 'var(--surface)',
                      border: '1px solid var(--border-color)',
                      borderRadius: '6px',
                      padding: '0.35rem 0.6rem',
                      display: 'flex',
                      alignItems: 'center',
                      gap: '0.35rem',
                      fontSize: '0.75rem',
                      fontWeight: 700,
                      color: 'var(--text-main)',
                      cursor: 'pointer',
                    }}
                    title="Copy Order Number"
                  >
                    {copied ? <Check size={13} color="#16A34A" /> : <Copy size={13} />}
                    <span>{copied ? 'Copied' : 'Copy'}</span>
                  </button>
                </div>
              </div>

              {/* Status Pill & Action Buttons */}
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', flexWrap: 'wrap' }}>
                {isAutoRefreshing && (
                  <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)', display: 'flex', alignItems: 'center', gap: '0.3rem' }}>
                    <RefreshCw size={12} className="animate-spin" /> Live syncing
                  </span>
                )}

                <button
                  onClick={() => handleTrack(order.order_number)}
                  style={{
                    background: 'var(--surface)',
                    border: '1px solid var(--border-color)',
                    borderRadius: 'var(--radius)',
                    padding: '0.55rem 0.9rem',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '0.45rem',
                    fontSize: '0.82rem',
                    fontWeight: 700,
                    color: 'var(--text-main)',
                    cursor: 'pointer',
                  }}
                  title="Refresh Live Status"
                >
                  <RefreshCw size={14} className={loading ? 'animate-spin' : ''} />
                  <span>Refresh</span>
                </button>

              </div>
            </div>

            {/* Cancelled Alert Banner */}
            {isCancelled ? (
              <div style={{
                backgroundColor: '#FEF2F2',
                border: '1px solid #F87171',
                borderRadius: 'var(--radius)',
                padding: '1.5rem',
                color: '#991B1B',
                display: 'flex',
                alignItems: 'center',
                gap: '1rem',
                marginBottom: '1rem',
              }}>
                <XCircle size={32} style={{ flexShrink: 0, color: '#DC2626' }} />
                <div>
                  <h3 style={{ fontSize: '1.15rem', fontWeight: 900, marginBottom: '0.2rem' }}>
                    This Order Was Cancelled
                  </h3>
                  <p style={{ fontSize: '0.88rem', color: '#B91C1C', lineHeight: 1.4 }}>
                    This parcel has been voided by the store manager or upon customer cancellation request. No dispatch or courier delivery will occur. If you have questions, please contact customer support.
                  </p>
                </div>
              </div>
            ) : (
              /* 4-Step Interactive Visual Stepper */
              <div style={{ margin: '1rem 0 2rem' }}>
                <div style={{
                  display: 'grid',
                  gridTemplateColumns: 'repeat(4, 1fr)',
                  position: 'relative',
                  gap: '0.5rem',
                }}>
                  {steps.map((st, idx) => {
                    const isDone = currentStep >= st.step;
                    const isCurrent = currentStep === st.step;
                    const StepIcon = st.icon;

                    return (
                      <div
                        key={st.step}
                        style={{
                          display: 'flex',
                          flexDirection: 'column',
                          alignItems: 'center',
                          textAlign: 'center',
                          position: 'relative',
                          zIndex: 2,
                        }}
                      >
                        {/* Connecting Line (except after last step) */}
                        {idx < steps.length - 1 && (
                          <div
                            style={{
                              position: 'absolute',
                              top: '22px',
                              left: '50%',
                              width: '100%',
                              height: '4px',
                              backgroundColor: currentStep > st.step ? 'var(--primary-color)' : 'var(--border-color)',
                              zIndex: -1,
                              transition: 'background-color 0.4s ease',
                            }}
                          />
                        )}

                        {/* Step Circle Badge */}
                        <div style={{
                          width: '46px',
                          height: '46px',
                          borderRadius: '50%',
                          backgroundColor: isDone
                            ? 'var(--primary-color)'
                            : 'var(--surface)',
                          color: isDone
                            ? 'var(--button-text)'
                            : 'var(--text-muted)',
                          border: isCurrent
                            ? '3px solid var(--primary-color)'
                            : `2px solid ${isDone ? 'var(--primary-color)' : 'var(--border-color)'}`,
                          boxShadow: isCurrent
                            ? '0 0 0 4px rgba(var(--primary-color-rgb, 15, 23, 42), 0.18)'
                            : 'none',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          marginBottom: '0.75rem',
                          transition: 'all 0.3s ease',
                        }}>
                          <StepIcon size={20} />
                        </div>

                        {/* Step Title & Details */}
                        <div style={{
                          fontSize: '0.88rem',
                          fontWeight: isCurrent ? 900 : (isDone ? 700 : 500),
                          color: isDone ? 'var(--text-main)' : 'var(--text-muted)',
                          marginBottom: '0.2rem',
                        }}>
                          {st.title}
                        </div>

                        <div style={{
                          fontSize: '0.74rem',
                          color: 'var(--text-muted)',
                          lineHeight: 1.3,
                          maxWidth: '140px',
                        }}>
                          {st.desc}
                        </div>

                        {st.time && (
                          <span style={{
                            display: 'inline-block',
                            marginTop: '0.45rem',
                            fontSize: '0.68rem',
                            fontWeight: 700,
                            color: isCurrent ? 'var(--primary-color)' : '#16A34A',
                            backgroundColor: 'var(--badge-bg)',
                            padding: '0.15rem 0.5rem',
                            borderRadius: '4px',
                          }}>
                            {st.time}
                          </span>
                        )}
                      </div>
                    );
                  })}
                </div>
              </div>
            )}
          </div>

          {/* FlexiPay 4-Installment Engine & Ledger */}
          {order.is_installment && (
            <FlexiPayTracker
              order={order}
              installments={order.installments || []}
              onPaymentSuccess={(updated) => setOrder(updated)}
              formatPrice={formatPrice}
            />
          )}

          {/* Grid Layout: Delivery Rider / Shipping Destination & Order Item Breakdown */}
          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))',
            gap: '1.5rem',
          }}>
            {/* Courier & Shipping Details Card */}
            <div style={{
              backgroundColor: 'var(--card-bg)',
              border: '1px solid var(--border-color)',
              borderRadius: 'var(--radius)',
              padding: '1.75rem',
              display: 'flex',
              flexDirection: 'column',
              gap: '1.25rem',
            }}>
              <h3 style={{
                fontSize: '1.05rem',
                fontWeight: 800,
                color: 'var(--text-main)',
                display: 'flex',
                alignItems: 'center',
                gap: '0.5rem',
                margin: 0,
              }}>
                <Truck size={18} style={{ color: 'var(--primary-color)' }} />
                <span>Courier & Logistics Details</span>
              </h3>

              {/* Courier Rider Card */}
              {order.delivery_type === 'third_party' ? (
                <div style={{
                  backgroundColor: 'var(--surface)',
                  border: '1px solid var(--border-color)',
                  borderRadius: 'var(--radius)',
                  padding: '1rem',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '0.85rem',
                }}>
                  <div style={{
                    width: '42px',
                    height: '42px',
                    borderRadius: '50%',
                    backgroundColor: 'rgba(37, 99, 235, 0.1)',
                    color: '#2563EB',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    flexShrink: 0,
                  }}>
                    <Truck size={20} />
                  </div>
                  <div style={{ flexGrow: 1 }}>
                    <div style={{ fontSize: '0.72rem', fontWeight: 700, color: 'var(--text-muted)', textTransform: 'uppercase' }}>
                      Third-Party Courier Partner
                    </div>
                    <div style={{ fontSize: '0.98rem', fontWeight: 800, color: '#1E40AF' }}>
                      {order.assigned_to === 'TCS' ? 'TCS Express Logistics' : order.assigned_to === 'Leopards' ? 'Leopards Courier Service' : order.assigned_to === 'Trax' ? 'Trax Logistics' : order.assigned_to}
                    </div>
                    <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                      Assigned Carrier: <strong>{order.assigned_to}</strong> · Priority Nationwide Transit
                    </div>
                  </div>
                  <span
                    style={{
                      padding: '0.35rem 0.65rem',
                      borderRadius: '999px',
                      backgroundColor: '#EFF6FF',
                      color: '#1D4ED8',
                      border: '1px solid #BFDBFE',
                      fontSize: '0.72rem',
                      fontWeight: 800,
                      textTransform: 'uppercase',
                    }}
                  >
                    3rd-Party Express
                  </span>
                </div>
              ) : order.delivery_rider ? (
                <div style={{
                  backgroundColor: 'var(--surface)',
                  border: '1px solid var(--border-color)',
                  borderRadius: 'var(--radius)',
                  padding: '1rem',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '0.85rem',
                }}>
                  <div style={{
                    width: '42px',
                    height: '42px',
                    borderRadius: '50%',
                    backgroundColor: 'rgba(22, 163, 74, 0.1)',
                    color: '#16A34A',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    flexShrink: 0,
                  }}>
                    <User size={20} />
                  </div>
                  <div style={{ flexGrow: 1 }}>
                    <div style={{ fontSize: '0.72rem', fontWeight: 700, color: 'var(--text-muted)', textTransform: 'uppercase' }}>
                      Assigned Courier Rider
                    </div>
                    <div style={{ fontSize: '0.95rem', fontWeight: 800, color: 'var(--text-main)' }}>
                      {order.delivery_rider.name}
                    </div>
                    {order.delivery_rider.employee_id && (
                      <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                        Badge ID: {order.delivery_rider.employee_id}
                      </div>
                    )}
                  </div>
                  {order.delivery_rider.phone && (
                    <a
                      href={`tel:${order.delivery_rider.phone}`}
                      style={{
                        padding: '0.45rem 0.75rem',
                        backgroundColor: 'var(--badge-bg)',
                        color: 'var(--badge-text)',
                        border: '1px solid var(--border-color)',
                        borderRadius: '6px',
                        fontSize: '0.78rem',
                        fontWeight: 700,
                        textDecoration: 'none',
                        display: 'flex',
                        alignItems: 'center',
                        gap: '0.35rem',
                      }}
                    >
                      <Phone size={13} />
                      <span>Call Rider</span>
                    </a>
                  )}
                </div>
              ) : (
                <div style={{
                  padding: '0.85rem 1rem',
                  backgroundColor: 'var(--surface)',
                  border: '1px solid var(--border-color)',
                  borderRadius: 'var(--radius)',
                  fontSize: '0.85rem',
                  color: 'var(--text-muted)',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '0.5rem',
                }}>
                  <Clock size={16} />
                  <span>Logistics fleet dispatcher will assign courier rider once atelier packing completes.</span>
                </div>
              )}

              {/* Destination Address Card */}
              <div>
                <div style={{ fontSize: '0.75rem', fontWeight: 700, color: 'var(--text-muted)', textTransform: 'uppercase', marginBottom: '0.5rem' }}>
                  Delivery Destination
                </div>
                <div style={{
                  display: 'flex',
                  alignItems: 'flex-start',
                  gap: '0.65rem',
                  backgroundColor: 'var(--surface)',
                  padding: '0.9rem',
                  borderRadius: 'var(--radius)',
                  border: '1px solid var(--border-color)',
                }}>
                  <MapPin size={18} style={{ color: 'var(--primary-color)', flexShrink: 0, marginTop: '2px' }} />
                  <div style={{ fontSize: '0.88rem', lineHeight: 1.4 }}>
                    <div style={{ fontWeight: 800, color: 'var(--text-main)' }}>
                      {order.customer?.name || 'Customer'}
                    </div>
                    <div style={{ color: 'var(--text-main)', marginTop: '0.2rem' }}>
                      {order.shipping_address || order.customer?.address || 'Standard Address'}
                    </div>
                    {order.customer?.city && (
                      <div style={{ color: 'var(--text-muted)', fontSize: '0.82rem', marginTop: '0.1rem' }}>
                        {order.customer.city}
                      </div>
                    )}
                    <div style={{ color: 'var(--text-muted)', fontSize: '0.82rem', marginTop: '0.3rem' }}>
                      Contact: <strong>{order.phone || order.customer?.phone || 'Verified on file'}</strong>
                    </div>
                  </div>
                </div>
              </div>

              {/* Payment Summary */}
              <div>
                <div style={{ fontSize: '0.75rem', fontWeight: 700, color: 'var(--text-muted)', textTransform: 'uppercase', marginBottom: '0.5rem' }}>
                  Payment Method
                </div>
                <div style={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  padding: '0.8rem 1rem',
                  backgroundColor: 'var(--surface)',
                  borderRadius: 'var(--radius)',
                  border: '1px solid var(--border-color)',
                  fontSize: '0.88rem',
                }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.45rem', flexWrap: 'wrap' }}>
                    <span style={{ fontWeight: 700, textTransform: 'capitalize' }}>
                      {order.payment_method === 'cod' ? 'Cash on Delivery (COD)' : order.payment_method === 'jazzcash' ? 'JazzCash' : order.payment_method === 'easypaisa' ? 'Easypaisa' : order.payment_method === 'payfast' ? 'PayFast (1Link)' : order.payment_method === 'safepay' ? 'Safepay' : order.payment_method}
                    </span>
                    {order.payment_status === 'paid' ? (
                      <span style={{ fontSize: '0.68rem', backgroundColor: '#DCFCE7', color: '#166534', padding: '0.1rem 0.45rem', borderRadius: '4px', fontWeight: 800 }}>
                        PAID ✓
                      </span>
                    ) : (
                      <span style={{ fontSize: '0.68rem', backgroundColor: '#FEF3C7', color: '#92400E', padding: '0.1rem 0.45rem', borderRadius: '4px', fontWeight: 800 }}>
                        UNPAID
                      </span>
                    )}
                  </div>
                  <span style={{ fontWeight: 900, color: 'var(--primary-color)' }}>
                    {formatPrice(order.final_amount || order.total_amount)}
                  </span>
                </div>
              </div>
            </div>

            {/* Itemized Order Package Contents */}
            <div style={{
              backgroundColor: 'var(--card-bg)',
              border: '1px solid var(--border-color)',
              borderRadius: 'var(--radius)',
              padding: '1.75rem',
              display: 'flex',
              flexDirection: 'column',
              gap: '1.25rem',
            }}>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                <h3 style={{
                  fontSize: '1.05rem',
                  fontWeight: 800,
                  color: 'var(--text-main)',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '0.5rem',
                  margin: 0,
                }}>
                  <Package size={18} style={{ color: 'var(--primary-color)' }} />
                  <span>Parcel Contents ({order.items?.length || 0})</span>
                </h3>
                <span style={{ fontSize: '0.78rem', color: 'var(--text-muted)' }}>
                  Total: {order.items?.reduce((sum, it) => sum + (it.quantity || 1), 0) || 1} units
                </span>
              </div>

              {/* Items List */}
              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.85rem' }}>
                {order.items?.map((item, idx) => (
                  <div
                    key={item.id || idx}
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'space-between',
                      gap: '0.75rem',
                      padding: '0.75rem',
                      backgroundColor: 'var(--surface)',
                      borderRadius: 'var(--radius)',
                      border: '1px solid var(--border-color)',
                    }}
                  >
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', flexGrow: 1 }}>
                      <div style={{
                        width: '38px',
                        height: '38px',
                        borderRadius: '6px',
                        backgroundColor: 'var(--card-bg)',
                        border: '1px solid var(--border-color)',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        color: 'var(--text-muted)',
                        flexShrink: 0,
                      }}>
                        <ShoppingBag size={18} />
                      </div>
                      <div>
                        <div style={{ fontWeight: 700, fontSize: '0.88rem', color: 'var(--text-main)' }}>
                          {item.product_name}
                        </div>
                        <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', display: 'flex', alignItems: 'center', gap: '0.4rem', flexWrap: 'wrap' }}>
                          <span>Qty: <strong>{item.quantity}</strong></span>
                          {item.selected_attributes && Object.keys(item.selected_attributes).length > 0 && (
                            <span>
                              • {Object.entries(item.selected_attributes).map(([k, v]) => `${k}: ${v}`).join(', ')}
                            </span>
                          )}
                        </div>
                      </div>
                    </div>

                    <div style={{ fontWeight: 800, fontSize: '0.9rem', color: 'var(--text-main)', whiteSpace: 'nowrap' }}>
                      {formatPrice(item.subtotal || item.price * item.quantity)}
                    </div>
                  </div>
                ))}
              </div>

              {/* Financial Totals Breakdown */}
              <div style={{
                borderTop: '1px solid var(--border-color)',
                paddingTop: '1rem',
                display: 'flex',
                flexDirection: 'column',
                gap: '0.4rem',
                fontSize: '0.85rem',
              }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', color: 'var(--text-muted)' }}>
                  <span>Subtotal</span>
                  <span>{formatPrice(order.total_amount)}</span>
                </div>
                {Number(order.discount_amount) > 0 && (
                  <div style={{ display: 'flex', justifyContent: 'space-between', color: '#16A34A' }}>
                    <span>Promo Discount</span>
                    <span>-{formatPrice(order.discount_amount)}</span>
                  </div>
                )}
                <div style={{ display: 'flex', justifyContent: 'space-between', color: 'var(--text-muted)' }}>
                  <span>Shipping Cost</span>
                  <span>{Number(order.shipping_cost) > 0 ? formatPrice(order.shipping_cost) : 'FREE'}</span>
                </div>
                <div style={{
                  display: 'flex',
                  justifyContent: 'space-between',
                  fontWeight: 900,
                  fontSize: '1rem',
                  color: 'var(--text-main)',
                  borderTop: '1px dashed var(--border-color)',
                  paddingTop: '0.5rem',
                  marginTop: '0.2rem',
                }}>
                  <span>Final Total</span>
                  <span style={{ color: 'var(--primary-color)' }}>{formatPrice(order.final_amount || order.total_amount)}</span>
                </div>
              </div>
            </div>
          </div>

          {/* Bottom Actions Bar */}
          <div style={{
            display: 'flex',
            justifyContent: 'center',
            alignItems: 'center',
            gap: '1rem',
            flexWrap: 'wrap',
            paddingTop: '1rem',
          }}>
            <button
              onClick={() => navigate('/')}
              style={{
                padding: '0.75rem 2.5rem',
                backgroundColor: 'var(--primary-color)',
                color: 'var(--button-text)',
                border: 'none',
                borderRadius: 'var(--radius)',
                fontWeight: 800,
                fontSize: '0.95rem',
                cursor: 'pointer',
                display: 'inline-flex',
                alignItems: 'center',
                gap: '0.5rem',
              }}
            >
              <span>Continue Shopping</span>
              <ArrowRight size={16} />
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
