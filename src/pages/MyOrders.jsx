import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useAuth } from '../context/AuthContext';
import { useStore } from '../context/StoreContext';
import {
  Package,
  Truck,
  CheckCircle2,
  Clock,
  MapPin,
  ArrowRight,
  ShoppingBag,
  RefreshCw,
  UserCheck,
  Search,
  ExternalLink,
  ShieldCheck,
  Calendar,
  DollarSign,
  AlertCircle,
  Copy,
  Check,
  XCircle,
  Ban,
  Printer,
} from 'lucide-react';
import ShippingInvoiceModal from '../components/ShippingInvoiceModal';

export default function MyOrders({ onNavigate }) {
  const { user, isAuthenticated, openLoginModal, quickLogin } = useAuth();
  const { formatPrice } = useStore();

  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchFilter, setSearchFilter] = useState('');
  const [statusTab, setStatusTab] = useState('all');
  const [copiedOrder, setCopiedOrder] = useState(null);
  const [printModalOrder, setPrintModalOrder] = useState(null);

  // Guest lookup fields if unauthenticated
  const [guestPhone, setGuestPhone] = useState('');
  const [guestLoading, setGuestLoading] = useState(false);
  const [guestError, setGuestError] = useState('');

  const fetchOrders = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem('flexi_token');
      const headers = token ? { Authorization: `Bearer ${token}` } : {};

      // Try authenticated route first, fallback to resilient customer-public
      let res;
      try {
        res = await axios.get('/api/customer/orders', {
          headers,
          params: user ? { user_id: user.id, email: user.email } : {},
        });
      } catch (authErr) {
        // Fallback to customer-public endpoint
        res = await axios.get('/api/customer-public/orders', {
          params: user ? { user_id: user.id, email: user.email } : {},
        });
      }

      setOrders(res.data?.data || res.data || []);
    } catch (err) {
      console.error('Failed to load customer orders:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchOrders();
  }, [isAuthenticated, user?.id]);

  const handleGuestLookup = async (e) => {
    e.preventDefault();
    if (!guestPhone.trim()) return;
    setGuestLoading(true);
    setGuestError('');

    try {
      const res = await axios.get('/api/customer-public/orders', {
        params: { phone: guestPhone.trim() },
      });
      const data = res.data?.data || res.data || [];
      if (data.length === 0) {
        setGuestError(`No orders found under phone ${guestPhone}. Please verify number.`);
      } else {
        setOrders(data);
      }
    } catch (err) {
      setGuestError('Lookup failed. Please check phone number and retry.');
    } finally {
      setGuestLoading(false);
    }
  };

  const [cancellingId, setCancellingId] = useState(null);
  const [cancelFeedback, setCancelFeedback] = useState(null);

  const handleCopyOrderNo = (orderNum) => {
    navigator.clipboard.writeText(orderNum);
    setCopiedOrder(orderNum);
    setTimeout(() => setCopiedOrder(null), 2500);
  };

  const handleCancelOrder = async (orderId) => {
    if (!window.confirm('Are you sure you want to cancel this order?')) {
      return;
    }

    try {
      setCancellingId(orderId);
      const token = localStorage.getItem('flexi_token');
      const headers = token ? { Authorization: `Bearer ${token}` } : {};

      const res = await axios.post(`/api/customer/orders/${orderId}/cancel`, {}, { headers })
        .catch(() => axios.post(`/api/customer-public/orders/${orderId}/cancel`, {}));

      if (res.data.success) {
        setCancelFeedback(res.data.message || 'Order cancelled successfully.');
        setTimeout(() => setCancelFeedback(null), 4000);
        // Refresh orders list
        fetchOrders();
      }
    } catch (err) {
      console.error('Failed to cancel order:', err);
      alert(err.response?.data?.message || 'Failed to cancel order.');
    } finally {
      setCancellingId(null);
    }
  };

  // Filter orders by search input and status tab
  const filteredOrders = orders.filter((o) => {
    if (statusTab !== 'all') {
      if (statusTab === 'processing' && o.status !== 'pending' && o.status !== 'processing') return false;
      if (statusTab === 'dispatched' && !['shipped', 'dispatched', 'out_for_delivery'].includes(o.status)) return false;
      if (statusTab === 'delivered' && o.status !== 'delivered') return false;
      if (statusTab === 'cancelled' && o.status !== 'cancelled') return false;
    }

    if (!searchFilter.trim()) return true;
    const q = searchFilter.toLowerCase();
    const matchOrderNo = o.order_number?.toLowerCase().includes(q);
    const matchStore = o.store?.name?.toLowerCase().includes(q);
    const matchItems = o.items?.some((i) => i.product_name?.toLowerCase().includes(q));
    return matchOrderNo || matchStore || matchItems;
  });

  return (
    <div style={{ maxWidth: '1000px', margin: '0 auto', padding: '2rem 1.5rem', width: '100%' }}>
      {/* Page Header */}
      <div style={{
        display: 'flex',
        flexWrap: 'wrap',
        alignItems: 'center',
        justifyContent: 'space-between',
        gap: '1rem',
        marginBottom: '2rem',
        borderBottom: '1px solid var(--border-color)',
        paddingBottom: '1.25rem',
      }}>
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem' }}>
            <h1 style={{ fontSize: '1.75rem', fontWeight: 900, letterSpacing: '-0.02em' }}>
              My Orders & Live Tracking
            </h1>
            <span style={{
              fontSize: '0.72rem',
              fontWeight: 800,
              padding: '0.2rem 0.6rem',
              borderRadius: '999px',
              backgroundColor: '#EEF2FF',
              color: '#4338CA',
            }}>
              CUSTOMER HUB
            </span>
          </div>
          <p style={{ color: 'var(--text-muted)', fontSize: '0.85rem', marginTop: '0.25rem' }}>
            {isAuthenticated
              ? `Showing purchase history and real-time courier dispatches for ${user?.name} (${user?.email})`
              : 'Sign in to access your order history or track an order by phone number below.'}
          </p>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
          <button
            onClick={fetchOrders}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '0.4rem',
              padding: '0.55rem 0.95rem',
              borderRadius: 'var(--radius)',
              border: '1px solid var(--border-color)',
              backgroundColor: 'var(--surface)',
              color: 'var(--text-main)',
              fontSize: '0.82rem',
              fontWeight: 600,
              cursor: 'pointer',
            }}
          >
            <RefreshCw size={14} className={loading ? 'animate-spin' : ''} />
            <span>Refresh</span>
          </button>

          {!isAuthenticated && (
            <button
              onClick={() => openLoginModal('login')}
              style={{
                padding: '0.55rem 1.1rem',
                borderRadius: 'var(--radius)',
                backgroundColor: 'var(--primary-color)',
                color: 'var(--button-text)',
                border: 'none',
                fontSize: '0.82rem',
                fontWeight: 700,
                cursor: 'pointer',
              }}
            >
              Sign In
            </button>
          )}
        </div>
      </div>

      {/* Guest Login Banner or Quick Sign-In */}
      {!isAuthenticated && orders.length === 0 && (
        <div style={{
          backgroundColor: 'var(--card-bg)',
          border: '1px solid var(--border-color)',
          borderRadius: '16px',
          padding: '2rem',
          textAlign: 'center',
          marginBottom: '2rem',
          boxShadow: '0 4px 20px rgba(0,0,0,0.04)',
        }}>
          <div style={{
            width: '60px',
            height: '60px',
            borderRadius: '50%',
            backgroundColor: '#EFF6FF',
            color: '#2563EB',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            margin: '0 auto 1.25rem',
          }}>
            <UserCheck size={28} />
          </div>

          <h2 style={{ fontSize: '1.35rem', fontWeight: 800, marginBottom: '0.5rem' }}>
            Shopper Account Login
          </h2>
          <p style={{ fontSize: '0.88rem', color: 'var(--text-muted)', maxWidth: '480px', margin: '0 auto 1.5rem' }}>
            Sign in with your shopper credentials to see your past orders, delivery dispatches, and saved shipping addresses.
          </p>

          <div style={{ display: 'flex', justifyContent: 'center', gap: '0.75rem', flexWrap: 'wrap', marginBottom: '2rem' }}>
            <button
              onClick={() => openLoginModal('login')}
              style={{
                padding: '0.65rem 1.4rem',
                borderRadius: 'var(--radius)',
                backgroundColor: 'var(--primary-color)',
                color: 'var(--button-text)',
                border: 'none',
                fontWeight: 800,
                fontSize: '0.88rem',
                cursor: 'pointer',
              }}
            >
              Sign In to Your Account
            </button>

            <button
              onClick={() => openLoginModal('register')}
              style={{
                padding: '0.65rem 1.4rem',
                borderRadius: 'var(--radius)',
                backgroundColor: 'var(--surface)',
                color: 'var(--text-main)',
                border: '1px solid var(--border-color)',
                fontWeight: 700,
                fontSize: '0.88rem',
                cursor: 'pointer',
              }}
            >
              Create New Account
            </button>
          </div>

          {/* Guest Phone Lookup Form */}
          <div style={{
            borderTop: '1px solid var(--border-color)',
            paddingTop: '1.5rem',
            maxWidth: '460px',
            margin: '0 auto',
          }}>
            <h4 style={{ fontSize: '0.85rem', fontWeight: 700, marginBottom: '0.5rem', color: 'var(--text-muted)' }}>
              Or Track Guest Order by Phone Number:
            </h4>
            <form onSubmit={handleGuestLookup} style={{ display: 'flex', gap: '0.5rem' }}>
              <input
                type="text"
                placeholder="Enter order phone (e.g. +97150...)"
                value={guestPhone}
                onChange={(e) => setGuestPhone(e.target.value)}
                className="form-input"
                style={{ flex: 1, fontSize: '0.85rem' }}
              />
              <button
                type="submit"
                disabled={guestLoading}
                style={{
                  padding: '0.5rem 1rem',
                  borderRadius: 'var(--radius)',
                  backgroundColor: 'var(--primary-color)',
                  color: 'var(--button-text)',
                  border: 'none',
                  fontSize: '0.82rem',
                  fontWeight: 700,
                  cursor: 'pointer',
                }}
              >
                {guestLoading ? 'Searching...' : 'Track'}
              </button>
            </form>
            {guestError && (
              <p style={{ color: '#DC2626', fontSize: '0.78rem', marginTop: '0.5rem' }}>{guestError}</p>
            )}
          </div>
        </div>
      )}

      {/* Orders Status Filter Tabs */}
      {orders.length > 0 && (
        <div style={{
          display: 'flex',
          gap: '0.5rem',
          overflowX: 'auto',
          paddingBottom: '0.5rem',
          marginBottom: '1rem',
          scrollbarWidth: 'none',
        }}>
          {[
            { id: 'all', label: `All Orders (${orders.length})` },
            { id: 'processing', label: `Processing (${orders.filter(o => o.status === 'pending' || o.status === 'processing').length})` },
            { id: 'dispatched', label: `In Transit (${orders.filter(o => ['shipped', 'dispatched', 'out_for_delivery'].includes(o.status)).length})` },
            { id: 'delivered', label: `Delivered (${orders.filter(o => o.status === 'delivered').length})` },
            { id: 'cancelled', label: `Cancelled (${orders.filter(o => o.status === 'cancelled').length})` },
          ].map((tab) => {
            const isActive = statusTab === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => setStatusTab(tab.id)}
                style={{
                  padding: '0.45rem 1rem',
                  borderRadius: '999px',
                  fontSize: '0.82rem',
                  fontWeight: isActive ? 700 : 500,
                  cursor: 'pointer',
                  whiteSpace: 'nowrap',
                  border: isActive ? '1px solid var(--primary-color)' : '1px solid var(--border-color)',
                  backgroundColor: isActive ? 'var(--primary-color)' : 'var(--card-bg)',
                  color: isActive ? 'var(--button-text)' : 'var(--text-main)',
                  transition: 'all 0.18s ease',
                  boxShadow: isActive ? '0 2px 8px rgba(0,0,0,0.1)' : 'none',
                }}
              >
                {tab.label}
              </button>
            );
          })}
        </div>
      )}

      {/* Orders Search Filter */}
      {orders.length > 0 && (
        <div style={{
          display: 'flex',
          alignItems: 'center',
          gap: '0.5rem',
          marginBottom: '1.5rem',
          backgroundColor: 'var(--surface)',
          padding: '0.6rem 1rem',
          borderRadius: 'var(--radius)',
          border: '1px solid var(--border-color)',
        }}>
          <Search size={16} color="var(--text-muted)" />
          <input
            type="text"
            placeholder="Search orders by Order Number, item name, or store..."
            value={searchFilter}
            onChange={(e) => setSearchFilter(e.target.value)}
            className="form-input"
            style={{ width: '100%', border: 'none', background: 'transparent', padding: '0.2rem', fontSize: '0.85rem' }}
          />
          {searchFilter && (
            <button
              onClick={() => setSearchFilter('')}
              style={{ background: 'transparent', border: 'none', color: 'var(--text-muted)', fontSize: '0.75rem', cursor: 'pointer' }}
            >
              Clear
            </button>
          )}
        </div>
      )}

      {/* Cancellation Toast Feedback */}
      {cancelFeedback && (
        <div style={{
          backgroundColor: '#DC2626',
          color: '#ffffff',
          padding: '0.75rem 1.25rem',
          borderRadius: 'var(--radius)',
          fontSize: '0.85rem',
          fontWeight: 700,
          marginBottom: '1.25rem',
          display: 'flex',
          alignItems: 'center',
          gap: '0.5rem',
          boxShadow: '0 4px 15px rgba(220, 38, 38, 0.2)',
        }}>
          <AlertCircle size={16} />
          <span>{cancelFeedback}</span>
        </div>
      )}

      {/* Orders List */}
      {loading ? (
        <div style={{ padding: '4rem', textAlign: 'center', color: 'var(--text-muted)' }}>
          <RefreshCw size={28} className="animate-spin" style={{ margin: '0 auto 0.75rem', opacity: 0.4 }} />
          <p style={{ fontSize: '0.9rem' }}>Retrieving your purchases and delivery tracking...</p>
        </div>
      ) : orders.length === 0 && isAuthenticated ? (
        <div style={{
          padding: '4rem 2rem',
          textAlign: 'center',
          backgroundColor: 'var(--card-bg)',
          borderRadius: '16px',
          border: '1px dashed var(--border-color)',
        }}>
          <ShoppingBag size={48} style={{ margin: '0 auto 1rem', opacity: 0.3 }} />
          <h3 style={{ fontSize: '1.15rem', fontWeight: 800 }}>No Orders Found</h3>
          <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)', marginTop: '0.35rem', marginBottom: '1.5rem' }}>
            You haven't placed any orders with this account yet.
          </p>
          <button
            onClick={() => onNavigate && onNavigate('home')}
            style={{
              padding: '0.65rem 1.35rem',
              borderRadius: 'var(--radius)',
              backgroundColor: 'var(--primary-color)',
              color: 'var(--button-text)',
              border: 'none',
              fontWeight: 700,
              fontSize: '0.85rem',
              cursor: 'pointer',
            }}
          >
            Start Shopping Now
          </button>
        </div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
          {filteredOrders.map((order) => {
            const isCancelled = order.status === 'cancelled' || order.delivery_status === 'failed';
            const isDelivered = !isCancelled && (order.delivery_status === 'delivered' || order.status === 'delivered');
            const isOut = !isCancelled && (order.delivery_status === 'out_for_delivery' || order.status === 'shipped');
            const isProcessing = !isCancelled && (order.status === 'processing' || order.delivery_status === 'assigned');
            const isPending = !isCancelled && order.status === 'pending';
            const canCancel = !isCancelled && !isDelivered && !isOut;
            const rider = order.delivery_rider || order.deliveryRider;

            return (
              <div
                key={order.id}
                style={{
                  backgroundColor: 'var(--card-bg)',
                  border: isCancelled ? '1px solid #FCA5A5' : '1px solid var(--border-color)',
                  borderRadius: '16px',
                  overflow: 'hidden',
                  boxShadow: '0 4px 20px rgba(0,0,0,0.04)',
                }}
              >
                {/* Order Card Header */}
                <div style={{
                  padding: '1.25rem 1.5rem',
                  backgroundColor: isCancelled ? '#FEF2F2' : 'var(--surface)',
                  borderBottom: '1px solid var(--border-color)',
                  display: 'flex',
                  flexWrap: 'wrap',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  gap: '1rem',
                }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.85rem' }}>
                    <div>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                        <span style={{ fontFamily: 'monospace', fontWeight: 900, fontSize: '1.05rem', textDecoration: isCancelled ? 'line-through' : 'none', color: isCancelled ? '#991B1B' : 'inherit' }}>
                          {order.order_number}
                        </span>
                        <button
                          onClick={() => handleCopyOrderNo(order.order_number)}
                          title="Copy Order Number"
                          style={{
                            background: 'transparent',
                            border: 'none',
                            cursor: 'pointer',
                            color: copiedOrder === order.order_number ? '#059669' : 'var(--text-muted)',
                            display: 'flex',
                            alignItems: 'center',
                          }}
                        >
                          {copiedOrder === order.order_number ? <Check size={14} /> : <Copy size={14} />}
                        </button>
                      </div>
                      <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginTop: '0.15rem' }}>
                        Placed on {new Date(order.created_at).toLocaleDateString(undefined, { dateStyle: 'long' })}
                      </div>
                    </div>

                    <span style={{
                      fontSize: '0.72rem',
                      fontWeight: 700,
                      padding: '0.2rem 0.55rem',
                      borderRadius: '6px',
                      backgroundColor: 'var(--card-bg)',
                      border: '1px solid var(--border-color)',
                      color: 'var(--text-main)',
                    }}>
                      {order.store?.name || 'FlexiStore'}
                    </span>
                  </div>

                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                    {/* Status Pill */}
                    <span style={{
                      fontSize: '0.78rem',
                      fontWeight: 800,
                      padding: '0.35rem 0.85rem',
                      borderRadius: '999px',
                      display: 'flex',
                      alignItems: 'center',
                      gap: '0.35rem',
                      textTransform: 'uppercase',
                      backgroundColor: isCancelled ? '#FEE2E2' : isDelivered ? '#DCFCE7' : isOut ? '#FEF3C7' : '#EFF6FF',
                      color: isCancelled ? '#991B1B' : isDelivered ? '#166534' : isOut ? '#92400E' : '#1E40AF',
                      border: `1px solid ${isCancelled ? '#FCA5A5' : isDelivered ? '#A7F3D0' : isOut ? '#FDE68A' : '#BFDBFE'}`,
                    }}>
                      {isCancelled ? <XCircle size={14} /> : isDelivered ? <CheckCircle2 size={14} /> : <Truck size={14} />}
                      <span>{isCancelled ? 'CANCELLED' : isDelivered ? 'DELIVERED' : isOut ? 'OUT FOR DELIVERY' : isProcessing ? 'PROCESSING' : 'PENDING'}</span>
                    </span>

                    <span style={{ fontSize: '1.15rem', fontWeight: 900, color: isCancelled ? '#991B1B' : 'var(--primary-color)' }}>
                      {formatPrice(order.final_amount)}
                    </span>

                    {/* Track Parcel Live Stepper Button */}
                    <button
                      onClick={() => onNavigate(`track-order?order_number=${order.order_number}`)}
                      style={{
                        padding: '0.35rem 0.75rem',
                        borderRadius: '6px',
                        border: '1px solid var(--border-color)',
                        backgroundColor: 'var(--surface)',
                        color: 'var(--text-main)',
                        fontSize: '0.75rem',
                        fontWeight: 700,
                        cursor: 'pointer',
                        display: 'inline-flex',
                        alignItems: 'center',
                        gap: '0.35rem',
                        transition: 'all 0.15s ease',
                      }}
                      title="View Live Stepper Tracking"
                    >
                      <Truck size={13} />
                      <span>Track Parcel</span>
                    </button>

                    {/* Print Customer Invoice / Receipt Button */}
                    <button
                      onClick={() => setPrintModalOrder(order)}
                      style={{
                        padding: '0.35rem 0.75rem',
                        borderRadius: '6px',
                        border: '1px solid var(--border-color)',
                        backgroundColor: 'var(--surface)',
                        color: 'var(--text-main)',
                        fontSize: '0.75rem',
                        fontWeight: 700,
                        cursor: 'pointer',
                        display: 'inline-flex',
                        alignItems: 'center',
                        gap: '0.35rem',
                        transition: 'all 0.15s ease',
                      }}
                      title="Print Official Order Receipt & Invoice"
                    >
                      <Printer size={13} />
                      <span>Print Receipt</span>
                    </button>

                    {/* Customer Self-Cancel Button if order is still pending or processing */}
                    {canCancel && (
                      <button
                        onClick={() => handleCancelOrder(order.id)}
                        disabled={cancellingId === order.id}
                        style={{
                          padding: '0.35rem 0.75rem',
                          borderRadius: '6px',
                          border: '1px solid #FCA5A5',
                          backgroundColor: '#FFF1F2',
                          color: '#BE123C',
                          fontSize: '0.75rem',
                          fontWeight: 700,
                          cursor: 'pointer',
                          display: 'inline-flex',
                          alignItems: 'center',
                          gap: '0.3rem',
                          transition: 'all 0.15s ease',
                        }}
                        title="Cancel this order"
                      >
                        <Ban size={13} />
                        <span>{cancellingId === order.id ? 'Cancelling...' : 'Cancel Order'}</span>
                      </button>
                    )}
                  </div>
                </div>

                {/* Live Delivery Timeline OR Cancelled State */}
                <div style={{
                  padding: '1.25rem 1.5rem',
                  borderBottom: '1px solid var(--border-color)',
                  backgroundColor: 'var(--card-bg)',
                }}>
                  {isCancelled ? (
                    <div style={{
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'space-between',
                      flexWrap: 'wrap',
                      gap: '0.85rem',
                      padding: '1rem 1.25rem',
                      backgroundColor: '#FEF2F2',
                      border: '1px solid #FCA5A5',
                      borderRadius: '10px',
                    }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '0.85rem' }}>
                        <div style={{
                          width: '34px',
                          height: '34px',
                          borderRadius: '50%',
                          backgroundColor: '#EF4444',
                          color: '#fff',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          fontWeight: 900,
                          fontSize: '1.1rem',
                          flexShrink: 0,
                        }}>
                          ✕
                        </div>
                        <div>
                          <div style={{ fontWeight: 800, fontSize: '0.88rem', color: '#991B1B', textTransform: 'uppercase', letterSpacing: '0.02em' }}>
                            Order Cancelled
                          </div>
                          <div style={{ fontSize: '0.78rem', color: '#B91C1C', marginTop: '0.15rem' }}>
                            This order was cancelled. Item processing and courier dispatch have been discontinued.
                          </div>
                        </div>
                      </div>
                      <span style={{
                        fontSize: '0.72rem',
                        fontWeight: 800,
                        padding: '0.25rem 0.65rem',
                        borderRadius: '999px',
                        backgroundColor: '#fff',
                        color: '#DC2626',
                        border: '1px solid #FCA5A5',
                        textTransform: 'uppercase',
                      }}>
                        Cancelled & Voided
                      </span>
                    </div>
                  ) : (
                    <>
                      <div style={{ fontSize: '0.72rem', fontWeight: 700, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: '0.75rem' }}>
                        Live Delivery Lifecycle:
                      </div>

                      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '0.5rem', position: 'relative' }}>
                        {/* Step 1: Confirmed */}
                        <div style={{ textAlign: 'center' }}>
                          <div style={{
                            width: '26px',
                            height: '26px',
                            borderRadius: '50%',
                            backgroundColor: '#10B981',
                            color: '#fff',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            margin: '0 auto 0.35rem',
                            fontWeight: 800,
                            fontSize: '0.75rem',
                          }}>
                            ✓
                          </div>
                          <span style={{ fontSize: '0.75rem', fontWeight: 700 }}>Confirmed</span>
                        </div>

                        {/* Step 2: Processing */}
                        <div style={{ textAlign: 'center' }}>
                          <div style={{
                            width: '26px',
                            height: '26px',
                            borderRadius: '50%',
                            backgroundColor: isProcessing || isOut || isDelivered ? '#10B981' : '#E2E8F0',
                            color: isProcessing || isOut || isDelivered ? '#fff' : '#64748B',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            margin: '0 auto 0.35rem',
                            fontWeight: 800,
                            fontSize: '0.75rem',
                          }}>
                            {isProcessing || isOut || isDelivered ? '✓' : '2'}
                          </div>
                          <span style={{ fontSize: '0.75rem', fontWeight: isProcessing ? 800 : 500 }}>Packed</span>
                        </div>

                        {/* Step 3: Out for Delivery */}
                        <div style={{ textAlign: 'center' }}>
                          <div style={{
                            width: '26px',
                            height: '26px',
                            borderRadius: '50%',
                            backgroundColor: isOut || isDelivered ? '#10B981' : '#E2E8F0',
                            color: isOut || isDelivered ? '#fff' : '#64748B',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            margin: '0 auto 0.35rem',
                            fontWeight: 800,
                            fontSize: '0.75rem',
                          }}>
                            {isOut || isDelivered ? '✓' : '3'}
                          </div>
                          <span style={{ fontSize: '0.75rem', fontWeight: isOut ? 800 : 500, color: isOut ? '#D97706' : 'inherit' }}>
                            Out for Delivery
                          </span>
                        </div>

                        {/* Step 4: Delivered */}
                        <div style={{ textAlign: 'center' }}>
                          <div style={{
                            width: '26px',
                            height: '26px',
                            borderRadius: '50%',
                            backgroundColor: isDelivered ? '#10B981' : '#E2E8F0',
                            color: isDelivered ? '#fff' : '#64748B',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            margin: '0 auto 0.35rem',
                            fontWeight: 800,
                            fontSize: '0.75rem',
                          }}>
                            {isDelivered ? '✓' : '4'}
                          </div>
                          <span style={{ fontSize: '0.75rem', fontWeight: isDelivered ? 800 : 500, color: isDelivered ? '#059669' : 'inherit' }}>
                            Delivered
                          </span>
                        </div>
                      </div>
                    </>
                  )}
                </div>

                {/* Items & Shipping Details */}
                <div style={{
                  padding: '1.5rem',
                  display: 'grid',
                  gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))',
                  gap: '1.5rem',
                }}>
                  {/* Left: Items in package */}
                  <div>
                    <h4 style={{ fontSize: '0.78rem', fontWeight: 800, textTransform: 'uppercase', color: 'var(--text-muted)', marginBottom: '0.75rem' }}>
                      Items in Parcel ({order.items?.length || 0})
                    </h4>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                      {order.items?.map((item) => (
                        <div
                          key={item.id}
                          style={{
                            display: 'flex',
                            justifyContent: 'space-between',
                            alignItems: 'center',
                            padding: '0.5rem 0.75rem',
                            borderRadius: '8px',
                            backgroundColor: 'var(--surface)',
                            border: '1px solid var(--border-color)',
                          }}
                        >
                          <div>
                            <div style={{ fontWeight: 700, fontSize: '0.85rem' }}>{item.product_name}</div>
                            <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginTop: '0.1rem' }}>
                              Quantity: <strong>{item.quantity}</strong>
                              {item.selected_attributes && Object.keys(item.selected_attributes).length > 0 && (
                                <span style={{ marginLeft: '0.5rem', color: 'var(--primary-color)' }}>
                                  ({Object.entries(item.selected_attributes).map(([k, v]) => `${k}: ${v}`).join(' | ')})
                                </span>
                              )}
                            </div>
                          </div>
                          <span style={{ fontWeight: 800, fontSize: '0.88rem' }}>
                            {formatPrice(item.subtotal)}
                          </span>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Right: Courier Rider & Shipping Address */}
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                    {/* Courier Rider Box */}
                    <div style={{
                      padding: '1rem',
                      borderRadius: '10px',
                      backgroundColor: rider ? '#ECFDF5' : 'var(--surface)',
                      border: `1px solid ${rider ? '#A7F3D0' : 'var(--border-color)'}`,
                    }}>
                      <div style={{ fontSize: '0.72rem', fontWeight: 800, textTransform: 'uppercase', color: rider ? '#065F46' : 'var(--text-muted)', marginBottom: '0.35rem', display: 'flex', alignItems: 'center', gap: '0.35rem' }}>
                        <Truck size={14} />
                        <span>Assigned Courier Rider</span>
                      </div>

                      {rider ? (
                        <div>
                          <div style={{ fontWeight: 800, fontSize: '0.88rem', color: '#065F46' }}>{rider.name}</div>
                          <div style={{ fontSize: '0.75rem', color: '#047857', marginTop: '0.15rem' }}>
                            {rider.employee_id && <span>Badge ID: <strong>{rider.employee_id}</strong> • </span>}
                            <span>Phone: {rider.phone || 'Available via Support'}</span>
                          </div>
                        </div>
                      ) : (
                        <p style={{ fontSize: '0.78rem', color: 'var(--text-muted)', margin: 0 }}>
                          Package is being packed at warehouse. A courier will be assigned shortly.
                        </p>
                      )}
                    </div>

                    {/* Delivery Destination */}
                    <div style={{
                      padding: '1rem',
                      borderRadius: '10px',
                      backgroundColor: 'var(--surface)',
                      border: '1px solid var(--border-color)',
                      fontSize: '0.82rem',
                    }}>
                      <div style={{ fontSize: '0.72rem', fontWeight: 800, textTransform: 'uppercase', color: 'var(--text-muted)', marginBottom: '0.35rem', display: 'flex', alignItems: 'center', gap: '0.35rem' }}>
                        <MapPin size={14} color="#EF4444" />
                        <span>Delivery Destination</span>
                      </div>
                      <p style={{ margin: 0, fontWeight: 600 }}>{order.shipping_address}</p>
                      <p style={{ margin: '0.2rem 0 0', color: 'var(--text-muted)', fontSize: '0.75rem' }}>
                        Recipient Phone: {order.phone}
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* 1-Click Shipping Invoice & Receipt Modal */}
      {printModalOrder && (
        <ShippingInvoiceModal
          order={printModalOrder}
          onClose={() => setPrintModalOrder(null)}
        />
      )}
    </div>
  );
}
