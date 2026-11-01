import React, { useState, useEffect, useMemo } from 'react';
import axios from 'axios';
import { useAuth } from '../../context/AuthContext';
import { useStore } from '../../context/StoreContext';
import {
  Truck,
  Phone,
  MapPin,
  CheckCircle2,
  AlertTriangle,
  Package,
  Clock,
  RefreshCw,
  LogOut,
  Navigation,
  MessageSquare,
  ShieldCheck,
  Check,
  User,
  Search,
  Sparkles,
  Banknote,
  Calendar,
  X,
  ChevronRight,
  Printer,
  Receipt,
  ArrowRight,
  TrendingUp,
  FileText,
  DollarSign,
  Wallet,
} from 'lucide-react';

export default function DeliveryPortal() {
  const { user, logout, isDelivery, isAdmin, openLoginModal } = useAuth();
  const { formatPrice } = useStore();

  const [orders, setOrders] = useState([]);
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('active'); // 'active' | 'cash_ledger' | 'delivered'
  const [statusFilter, setStatusFilter] = useState('all'); // 'all' | 'out_for_delivery' | 'pending'
  const [updatingId, setUpdatingId] = useState(null);
  const [actionNotes, setActionNotes] = useState({});
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedOrderForDetail, setSelectedOrderForDetail] = useState(null);
  const [showHandoverModal, setShowHandoverModal] = useState(false);
  const [toastMessage, setToastMessage] = useState(null);

  const showToast = (text, type = 'success') => {
    setToastMessage({ text, type });
    setTimeout(() => setToastMessage(null), 3500);
  };

  const fetchData = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem('flexi_token');
      const headers = token ? { Authorization: `Bearer ${token}` } : {};

      const queryTab = activeTab === 'cash_ledger' ? 'delivered' : activeTab;

      const [ordersRes, statsRes] = await Promise.all([
        axios.get(`/api/delivery/orders?tab=${queryTab}`, { headers }).catch(() =>
          axios.get(`/api/delivery-public/orders?tab=${queryTab}`)
        ),
        axios.get('/api/delivery/stats', { headers }).catch(() =>
          axios.get('/api/delivery-public/stats')
        ),
      ]);

      const fetchedOrders = ordersRes.data.data || ordersRes.data || [];
      setOrders(fetchedOrders);
      setStats(statsRes.data || null);

      if (selectedOrderForDetail) {
        const updatedSelected = fetchedOrders.find((o) => o.id === selectedOrderForDetail.id);
        if (updatedSelected) setSelectedOrderForDetail(updatedSelected);
      }
    } catch (err) {
      console.error('Failed to load delivery data', err);
      showToast('Could not refresh delivery manifest. Please check your connection.', 'error');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, [activeTab, user?.id]);

  const handleUpdateStatus = async (orderId, newStatus) => {
    try {
      setUpdatingId(orderId);
      const notes = actionNotes[orderId] || '';
      const token = localStorage.getItem('flexi_token');
      const headers = token ? { Authorization: `Bearer ${token}` } : {};

      await axios.patch(`/api/delivery/orders/${orderId}/status`, {
        delivery_status: newStatus,
        delivery_notes: notes,
      }, { headers }).catch(() =>
        axios.patch(`/api/delivery-public/orders/${orderId}/status`, {
          delivery_status: newStatus,
          delivery_notes: notes,
        })
      );

      const statusLabels = {
        out_for_delivery: 'Package is now Out for Delivery!',
        delivered: 'Delivery confirmed & cash reconciled successfully!',
        failed: 'Delivery attempt marked as failed / rescheduled.',
      };
      showToast(statusLabels[newStatus] || 'Status updated successfully!');

      await fetchData();
      if (newStatus === 'delivered') {
        setTimeout(() => {
          setSelectedOrderForDetail(null);
        }, 800);
      }
    } catch (err) {
      alert('Failed to update delivery status: ' + (err.response?.data?.message || err.message));
    } finally {
      setUpdatingId(null);
    }
  };

  const handleApplyPresetNote = (orderId, note) => {
    setActionNotes((prev) => ({
      ...prev,
      [orderId]: note,
    }));
  };

  // Filter orders by search query and optional status chip
  const filteredOrders = useMemo(() => {
    return orders.filter((order) => {
      // 1. Search Query Filter
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase();
        const orderNum = (order.order_number || '').toLowerCase();
        const custName = (order.customer?.name || '').toLowerCase();
        const phone = (order.phone || '').toLowerCase();
        const addr = (order.shipping_address || '').toLowerCase();
        const city = (order.customer?.city || '').toLowerCase();
        const matchesSearch =
          orderNum.includes(q) ||
          custName.includes(q) ||
          phone.includes(q) ||
          addr.includes(q) ||
          city.includes(q);
        if (!matchesSearch) return false;
      }

      // 2. Active Tab Sub-filter
      if (activeTab === 'active' && statusFilter !== 'all') {
        if (statusFilter === 'out_for_delivery') {
          return order.delivery_status === 'out_for_delivery';
        }
        if (statusFilter === 'pending') {
          return order.delivery_status !== 'out_for_delivery' && order.delivery_status !== 'delivered';
        }
      }

      return true;
    });
  }, [orders, searchQuery, activeTab, statusFilter]);

  // Delivered COD orders specifically for the Cash Ledger
  const deliveredCODOrders = useMemo(() => {
    return orders.filter((o) => o.delivery_status === 'delivered');
  }, [orders]);

  const cashInHand = stats?.cash_collected_today ?? 0;
  const cashToCollect = stats?.cash_to_collect ?? 0;
  const totalShiftCash = stats?.total_shift_cash ?? (cashInHand + cashToCollect);

  return (
    <div
      style={{
        minHeight: '100vh',
        backgroundColor: '#F8FAFC',
        color: '#0F172A',
        fontFamily: "'Plus Jakarta Sans', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif",
        paddingBottom: '6rem',
      }}
    >
      {/* Toast Notification Banner */}
      {toastMessage && (
        <div
          style={{
            position: 'fixed',
            top: '1.25rem',
            right: '1.25rem',
            zIndex: 1000,
            padding: '0.85rem 1.25rem',
            borderRadius: '10px',
            backgroundColor: toastMessage.type === 'error' ? '#EF4444' : '#059669',
            color: '#FFFFFF',
            fontWeight: 700,
            fontSize: '0.85rem',
            display: 'flex',
            alignItems: 'center',
            gap: '0.6rem',
            boxShadow: '0 10px 25px rgba(0,0,0,0.18)',
            animation: 'fadeIn 0.2s ease-out',
          }}
        >
          {toastMessage.type === 'error' ? <AlertTriangle size={18} /> : <CheckCircle2 size={18} />}
          <span>{toastMessage.text}</span>
        </div>
      )}

      {/* 1. Top Header: Modern Dark Slate Fleet Console */}
      <header
        style={{
          position: 'sticky',
          top: 0,
          zIndex: 50,
          backgroundColor: '#0F172A',
          color: '#FFFFFF',
          borderBottom: '1px solid rgba(255, 255, 255, 0.08)',
          boxShadow: '0 4px 20px rgba(15, 23, 42, 0.15)',
        }}
      >
        <div
          style={{
            maxWidth: '1180px',
            margin: '0 auto',
            padding: '0.85rem 1.25rem',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            gap: '1rem',
          }}
        >
          {/* Brand Identity & Dispatch Status */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.85rem' }}>
            <div
              style={{
                width: '42px',
                height: '42px',
                borderRadius: '10px',
                backgroundColor: '#E35205',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                boxShadow: '0 4px 14px rgba(227, 82, 5, 0.4)',
                flexShrink: 0,
              }}
            >
              <Truck size={22} color="#FFFFFF" strokeWidth={2.4} />
            </div>

            <div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.55rem', flexWrap: 'wrap' }}>
                <span style={{ fontWeight: 900, fontSize: '1.05rem', letterSpacing: '0.04em', textTransform: 'uppercase' }}>
                  KHAAM POSHAK
                </span>
                <span
                  style={{
                    fontSize: '0.66rem',
                    fontWeight: 800,
                    letterSpacing: '0.05em',
                    padding: '0.15rem 0.55rem',
                    borderRadius: '999px',
                    backgroundColor: 'rgba(16, 185, 129, 0.2)',
                    color: '#34D399',
                    border: '1px solid rgba(52, 211, 153, 0.3)',
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: '0.35rem',
                  }}
                >
                  <span
                    style={{
                      width: '6px',
                      height: '6px',
                      borderRadius: '50%',
                      backgroundColor: '#10B981',
                      boxShadow: '0 0 8px #10B981',
                    }}
                  />
                  COURIER FLEET LIVE
                </span>
              </div>

              <div style={{ fontSize: '0.76rem', color: '#94A3B8', marginTop: '0.15rem', display: 'flex', alignItems: 'center', gap: '0.45rem' }}>
                <User size={12} color="#CBD5E1" />
                <span style={{ fontWeight: 600 }}>{user ? user.name : 'Tariq Rider'}</span>
                <span
                  style={{
                    fontFamily: 'monospace',
                    fontWeight: 700,
                    padding: '0.05rem 0.45rem',
                    borderRadius: '4px',
                    backgroundColor: 'rgba(255, 255, 255, 0.12)',
                    color: '#FBBF24',
                    fontSize: '0.7rem',
                  }}
                >
                  EMP #{user?.employee_id || 'RID-01'}
                </span>
              </div>
            </div>
          </div>

          {/* Quick Header Buttons */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem' }}>
            <button
              type="button"
              onClick={fetchData}
              title="Refresh Manifest"
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: '0.45rem',
                padding: '0.5rem 0.85rem',
                borderRadius: '8px',
                backgroundColor: 'rgba(255, 255, 255, 0.08)',
                border: '1px solid rgba(255, 255, 255, 0.15)',
                color: '#FFFFFF',
                fontSize: '0.78rem',
                fontWeight: 700,
                cursor: 'pointer',
                transition: 'all 0.15s ease',
              }}
            >
              <RefreshCw size={14} className={loading ? 'animate-spin' : ''} />
              <span className="hidden sm:inline">Refresh</span>
            </button>

            {user ? (
              <button
                type="button"
                onClick={logout}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '0.4rem',
                  padding: '0.5rem 0.85rem',
                  borderRadius: '8px',
                  backgroundColor: 'rgba(239, 68, 68, 0.12)',
                  border: '1px solid rgba(239, 68, 68, 0.25)',
                  color: '#FCA5A5',
                  fontSize: '0.78rem',
                  fontWeight: 700,
                  cursor: 'pointer',
                  transition: 'all 0.15s ease',
                }}
              >
                <LogOut size={13} />
                <span>Logout</span>
              </button>
            ) : (
              <button
                type="button"
                onClick={() => openLoginModal('login')}
                style={{
                  padding: '0.5rem 0.95rem',
                  borderRadius: '8px',
                  backgroundColor: '#E35205',
                  color: '#FFFFFF',
                  border: 'none',
                  fontSize: '0.78rem',
                  fontWeight: 800,
                  cursor: 'pointer',
                  textTransform: 'uppercase',
                }}
              >
                Rider Sign In
              </button>
            )}
          </div>
        </div>
      </header>

      {/* 2. Main Content Container */}
      <main
        style={{
          maxWidth: '1180px',
          margin: '0 auto',
          padding: '1.5rem 1.25rem',
          display: 'flex',
          flexDirection: 'column',
          gap: '1.5rem',
        }}
      >
        {/* ========================================================================= */}
        {/* HERO SECTION: TODAY'S CASH COLLECTED (COD) & RECONCILIATION SUMMARY */}
        {/* ========================================================================= */}
        <section
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))',
            gap: '1rem',
          }}
        >
          {/* Card 1: TODAY'S CASH COLLECTED (COD IN HAND) - HERO CARD */}
          <div
            style={{
              background: 'linear-gradient(135deg, #065F46 0%, #047857 100%)',
              color: '#FFFFFF',
              borderRadius: '16px',
              padding: '1.5rem',
              boxShadow: '0 8px 24px rgba(4, 120, 87, 0.2)',
              display: 'flex',
              flexDirection: 'column',
              justifyContent: 'space-between',
              position: 'relative',
              overflow: 'hidden',
            }}
          >
            <div
              style={{
                position: 'absolute',
                top: '-15px',
                right: '-15px',
                width: '110px',
                height: '110px',
                borderRadius: '50%',
                backgroundColor: 'rgba(255, 255, 255, 0.08)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                pointerEvents: 'none',
              }}
            >
              <Wallet size={64} color="rgba(255, 255, 255, 0.25)" />
            </div>

            <div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', flexWrap: 'wrap' }}>
                <span
                  style={{
                    fontSize: '0.72rem',
                    fontWeight: 900,
                    textTransform: 'uppercase',
                    letterSpacing: '0.08em',
                    padding: '0.2rem 0.6rem',
                    borderRadius: '999px',
                    backgroundColor: 'rgba(255, 255, 255, 0.2)',
                    color: '#D1FAE5',
                  }}
                >
                  Shift Cash in Hand
                </span>
                <span style={{ fontSize: '0.72rem', color: '#A7F3D0', fontWeight: 600 }}>
                  Today's COD
                </span>
              </div>

              <div style={{ fontSize: '2.5rem', fontWeight: 900, marginTop: '0.6rem', letterSpacing: '-0.02em' }}>
                {formatPrice(cashInHand)}
              </div>

              <div style={{ fontSize: '0.82rem', color: '#D1FAE5', marginTop: '0.35rem', fontWeight: 600 }}>
                ✓ Collected from {stats?.cod_delivered_today ?? (stats?.delivered_today ?? 0)} COD parcels today
              </div>
            </div>

            <div
              style={{
                marginTop: '1.25rem',
                paddingTop: '1rem',
                borderTop: '1px solid rgba(255, 255, 255, 0.15)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                flexWrap: 'wrap',
                gap: '0.5rem',
              }}
            >
              <button
                type="button"
                onClick={() => setShowHandoverModal(true)}
                style={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '0.45rem',
                  padding: '0.5rem 0.95rem',
                  borderRadius: '8px',
                  backgroundColor: '#FFFFFF',
                  color: '#065F46',
                  fontSize: '0.78rem',
                  fontWeight: 800,
                  border: 'none',
                  cursor: 'pointer',
                  boxShadow: '0 2px 8px rgba(0,0,0,0.12)',
                  transition: 'all 0.15s ease',
                }}
              >
                <FileText size={14} />
                <span>View Cash Handover Slip</span>
              </button>

              <button
                type="button"
                onClick={() => setActiveTab('cash_ledger')}
                style={{
                  background: 'none',
                  border: 'none',
                  color: '#D1FAE5',
                  fontSize: '0.78rem',
                  fontWeight: 700,
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '0.25rem',
                  textDecoration: 'underline',
                }}
              >
                <span>View Cash Breakdown</span>
                <ChevronRight size={14} />
              </button>
            </div>
          </div>

          {/* Card 2: PENDING COD CASH ON ROUTE */}
          <div
            style={{
              backgroundColor: '#FFFFFF',
              border: '1.5px solid #FCD34D',
              borderRadius: '16px',
              padding: '1.5rem',
              boxShadow: '0 4px 14px rgba(217, 119, 6, 0.08)',
              display: 'flex',
              flexDirection: 'column',
              justifyContent: 'space-between',
            }}
          >
            <div>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <span style={{ fontSize: '0.74rem', fontWeight: 900, color: '#B45309', textTransform: 'uppercase', letterSpacing: '0.06em' }}>
                  COD Cash To Collect
                </span>
                <div style={{ padding: '0.45rem', borderRadius: '8px', backgroundColor: '#FEF3C7', color: '#D97706' }}>
                  <Banknote size={20} />
                </div>
              </div>

              <div style={{ fontSize: '2.1rem', fontWeight: 900, color: '#92400E', marginTop: '0.6rem' }}>
                {formatPrice(cashToCollect)}
              </div>

              <div style={{ fontSize: '0.8rem', color: '#B45309', marginTop: '0.35rem', fontWeight: 600 }}>
                ⏳ Pending from {stats?.active_deliveries ?? 0} active COD packages on route
              </div>
            </div>

            <div
              style={{
                marginTop: '1.25rem',
                paddingTop: '0.85rem',
                borderTop: '1px solid #FEF3C7',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                fontSize: '0.76rem',
                color: '#78350F',
                fontWeight: 700,
              }}
            >
              <span>Total Shift Target:</span>
              <span style={{ fontSize: '0.92rem', color: '#92400E', fontWeight: 900 }}>
                {formatPrice(totalShiftCash)}
              </span>
            </div>
          </div>

          {/* Card 3: FLEET VOLUME KPIS (Bento Summary) */}
          <div
            style={{
              backgroundColor: '#FFFFFF',
              border: '1px solid #E2E8F0',
              borderRadius: '16px',
              padding: '1.25rem',
              boxShadow: '0 1px 3px rgba(0,0,0,0.04)',
              display: 'grid',
              gridTemplateColumns: 'repeat(3, 1fr)',
              gap: '0.75rem',
            }}
          >
            {/* Sub-KPI 1: Assigned Parcels */}
            <div style={{ display: 'flex', flexDirection: 'column', justifyContent: 'center', padding: '0.75rem', backgroundColor: '#F8FAFC', borderRadius: '12px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.35rem', color: '#64748B' }}>
                <Package size={14} />
                <span style={{ fontSize: '0.68rem', fontWeight: 800, textTransform: 'uppercase' }}>Assigned</span>
              </div>
              <div style={{ fontSize: '1.7rem', fontWeight: 900, color: '#0F172A', marginTop: '0.2rem' }}>
                {stats?.total_assigned ?? 0}
              </div>
              <span style={{ fontSize: '0.66rem', color: '#64748B', fontWeight: 600 }}>Assigned Parcels</span>
            </div>

            {/* Sub-KPI 2: Out For Delivery */}
            <div style={{ display: 'flex', flexDirection: 'column', justifyContent: 'center', padding: '0.75rem', backgroundColor: '#FFF7ED', borderRadius: '12px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.35rem', color: '#EA580C' }}>
                <Truck size={14} />
                <span style={{ fontSize: '0.68rem', fontWeight: 800, textTransform: 'uppercase' }}>Transit</span>
              </div>
              <div style={{ fontSize: '1.7rem', fontWeight: 900, color: '#EA580C', marginTop: '0.2rem' }}>
                {stats?.active_deliveries ?? 0}
              </div>
              <span style={{ fontSize: '0.66rem', color: '#C2410C', fontWeight: 700 }}>Out For Delivery</span>
            </div>

            {/* Sub-KPI 3: Delivered Today */}
            <div style={{ display: 'flex', flexDirection: 'column', justifyContent: 'center', padding: '0.75rem', backgroundColor: '#F0FDF4', borderRadius: '12px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.35rem', color: '#16A34A' }}>
                <CheckCircle2 size={14} />
                <span style={{ fontSize: '0.68rem', fontWeight: 800, textTransform: 'uppercase' }}>Done</span>
              </div>
              <div style={{ fontSize: '1.7rem', fontWeight: 900, color: '#16A34A', marginTop: '0.2rem' }}>
                {stats?.delivered_today ?? 0}
              </div>
              <span style={{ fontSize: '0.66rem', color: '#15803D', fontWeight: 700 }}>Delivered Today</span>
            </div>
          </div>
        </section>

        {/* ========================================================================= */}
        {/* 3. NAVIGATION CONTROLS: 3-WAY TAB SWITCHER & LIVE SEARCH */}
        {/* ========================================================================= */}
        <div
          style={{
            backgroundColor: '#FFFFFF',
            border: '1px solid #E2E8F0',
            borderRadius: '14px',
            padding: '0.85rem 1.15rem',
            display: 'flex',
            flexWrap: 'wrap',
            alignItems: 'center',
            justifyContent: 'space-between',
            gap: '1rem',
            boxShadow: '0 1px 3px rgba(0,0,0,0.03)',
          }}
        >
          {/* Main 3-Way Tabs */}
          <div
            style={{
              display: 'inline-flex',
              backgroundColor: '#F1F5F9',
              padding: '0.3rem',
              borderRadius: '10px',
              gap: '0.3rem',
              flexWrap: 'wrap',
            }}
          >
            {/* Tab 1: Active Shipments */}
            <button
              type="button"
              onClick={() => {
                setActiveTab('active');
                setStatusFilter('all');
              }}
              style={{
                padding: '0.55rem 1.15rem',
                borderRadius: '8px',
                border: 'none',
                backgroundColor: activeTab === 'active' ? '#0F172A' : 'transparent',
                color: activeTab === 'active' ? '#FFFFFF' : '#475569',
                fontSize: '0.82rem',
                fontWeight: 800,
                cursor: 'pointer',
                display: 'inline-flex',
                alignItems: 'center',
                gap: '0.45rem',
                transition: 'all 0.15s ease',
              }}
            >
              <Truck size={15} />
              <span>Active Shipments</span>
              <span
                style={{
                  fontSize: '0.72rem',
                  padding: '0.1rem 0.45rem',
                  borderRadius: '999px',
                  backgroundColor: activeTab === 'active' ? 'rgba(255,255,255,0.2)' : '#E2E8F0',
                  color: activeTab === 'active' ? '#FFFFFF' : '#475569',
                }}
              >
                {stats?.active_deliveries ?? orders.length}
              </span>
            </button>

            {/* Tab 2: Today's Cash Ledger (Money Collected All Details) */}
            <button
              type="button"
              onClick={() => {
                setActiveTab('cash_ledger');
                setStatusFilter('all');
              }}
              style={{
                padding: '0.55rem 1.15rem',
                borderRadius: '8px',
                border: 'none',
                backgroundColor: activeTab === 'cash_ledger' ? '#065F46' : 'transparent',
                color: activeTab === 'cash_ledger' ? '#FFFFFF' : '#047857',
                fontSize: '0.82rem',
                fontWeight: 800,
                cursor: 'pointer',
                display: 'inline-flex',
                alignItems: 'center',
                gap: '0.45rem',
                transition: 'all 0.15s ease',
              }}
            >
              <Banknote size={15} />
              <span>Today's Cash Ledger</span>
              <span
                style={{
                  fontSize: '0.72rem',
                  padding: '0.1rem 0.45rem',
                  borderRadius: '999px',
                  backgroundColor: activeTab === 'cash_ledger' ? '#047857' : '#D1FAE5',
                  color: activeTab === 'cash_ledger' ? '#FFFFFF' : '#065F46',
                }}
              >
                {formatPrice(cashInHand)}
              </span>
            </button>

            {/* Tab 3: Delivered History */}
            <button
              type="button"
              onClick={() => {
                setActiveTab('delivered');
                setStatusFilter('all');
              }}
              style={{
                padding: '0.55rem 1.15rem',
                borderRadius: '8px',
                border: 'none',
                backgroundColor: activeTab === 'delivered' ? '#0F172A' : 'transparent',
                color: activeTab === 'delivered' ? '#FFFFFF' : '#475569',
                fontSize: '0.82rem',
                fontWeight: 800,
                cursor: 'pointer',
                display: 'inline-flex',
                alignItems: 'center',
                gap: '0.45rem',
                transition: 'all 0.15s ease',
              }}
            >
              <CheckCircle2 size={15} />
              <span>Delivered History</span>
              <span
                style={{
                  fontSize: '0.72rem',
                  padding: '0.1rem 0.45rem',
                  borderRadius: '999px',
                  backgroundColor: activeTab === 'delivered' ? 'rgba(255,255,255,0.2)' : '#E2E8F0',
                  color: activeTab === 'delivered' ? '#FFFFFF' : '#475569',
                }}
              >
                {stats?.delivered_today ?? 0}
              </span>
            </button>
          </div>

          {/* Search Box */}
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '0.6rem',
              backgroundColor: '#F8FAFC',
              border: '1px solid #E2E8F0',
              borderRadius: '10px',
              padding: '0.55rem 0.85rem',
              flex: 1,
              minWidth: '240px',
              maxWidth: '380px',
            }}
          >
            <Search size={16} color="#94A3B8" />
            <input
              type="text"
              placeholder="Search order #, customer, phone, area..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              style={{
                border: 'none',
                outline: 'none',
                backgroundColor: 'transparent',
                fontSize: '0.84rem',
                width: '100%',
                color: '#0F172A',
              }}
            />
            {searchQuery && (
              <button
                type="button"
                onClick={() => setSearchQuery('')}
                style={{
                  background: 'none',
                  border: 'none',
                  fontSize: '0.75rem',
                  color: '#94A3B8',
                  cursor: 'pointer',
                  fontWeight: 700,
                }}
              >
                ✕
              </button>
            )}
          </div>
        </div>

        {/* Sub-Filter Chips for Active Shipments */}
        {activeTab === 'active' && (
          <div style={{ display: 'flex', gap: '0.5rem', alignItems: 'center', flexWrap: 'wrap' }}>
            <span style={{ fontSize: '0.75rem', fontWeight: 800, color: '#64748B', textTransform: 'uppercase' }}>
              Filter:
            </span>
            {[
              { id: 'all', label: 'All Active' },
              { id: 'out_for_delivery', label: 'Out For Delivery' },
              { id: 'pending', label: 'Pending Dispatch' },
            ].map((chip) => {
              const isSelected = statusFilter === chip.id;
              return (
                <button
                  key={chip.id}
                  type="button"
                  onClick={() => setStatusFilter(chip.id)}
                  style={{
                    padding: '0.35rem 0.85rem',
                    borderRadius: '999px',
                    fontSize: '0.76rem',
                    fontWeight: isSelected ? 800 : 600,
                    cursor: 'pointer',
                    border: '1px solid',
                    borderColor: isSelected ? '#0F172A' : '#E2E8F0',
                    backgroundColor: isSelected ? '#0F172A' : '#FFFFFF',
                    color: isSelected ? '#FFFFFF' : '#475569',
                    transition: 'all 0.15s ease',
                  }}
                >
                  {chip.label}
                </button>
              );
            })}
          </div>
        )}

        {/* ========================================================================= */}
        {/* VIEW 1: TODAY'S CASH LEDGER & RECONCILIATION DETAILS */}
        {/* ========================================================================= */}
        {activeTab === 'cash_ledger' && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
            {/* Reconciliation Stat Banner */}
            <div
              style={{
                backgroundColor: '#FFFFFF',
                borderRadius: '16px',
                border: '1px solid #E2E8F0',
                padding: '1.25rem 1.5rem',
                display: 'flex',
                flexWrap: 'wrap',
                alignItems: 'center',
                justifyContent: 'space-between',
                gap: '1rem',
                boxShadow: '0 1px 3px rgba(0,0,0,0.03)',
              }}
            >
              <div>
                <div style={{ fontSize: '0.74rem', fontWeight: 900, color: '#047857', textTransform: 'uppercase', letterSpacing: '0.06em' }}>
                  Today's Shift Cash Summary
                </div>
                <h2 style={{ fontSize: '1.35rem', fontWeight: 900, color: '#0F172A', margin: '0.25rem 0 0 0' }}>
                  Cash Reconciliation & Handover Ledger
                </h2>
                <p style={{ fontSize: '0.82rem', color: '#64748B', margin: '0.2rem 0 0 0' }}>
                  Verify every cash payment received before handing over your shift funds to dispatch accounts.
                </p>
              </div>

              <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                <button
                  type="button"
                  onClick={() => setShowHandoverModal(true)}
                  style={{
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: '0.5rem',
                    padding: '0.65rem 1.1rem',
                    borderRadius: '10px',
                    backgroundColor: '#0F172A',
                    color: '#FFFFFF',
                    fontSize: '0.82rem',
                    fontWeight: 800,
                    border: 'none',
                    cursor: 'pointer',
                    boxShadow: '0 2px 8px rgba(15, 23, 42, 0.15)',
                  }}
                >
                  <Printer size={15} />
                  <span>Print Shift Handover Receipt</span>
                </button>
              </div>
            </div>

            {/* List of Today's Completed Cash Drops */}
            {deliveredCODOrders.length === 0 ? (
              <div
                style={{
                  padding: '3.5rem 2rem',
                  textAlign: 'center',
                  backgroundColor: '#FFFFFF',
                  borderRadius: '16px',
                  border: '1px dashed #CBD5E1',
                }}
              >
                <Banknote size={40} color="#94A3B8" style={{ margin: '0 auto 1rem' }} />
                <h3 style={{ fontSize: '1.15rem', fontWeight: 800, color: '#0F172A', margin: 0 }}>
                  No cash collections recorded yet today
                </h3>
                <p style={{ fontSize: '0.85rem', color: '#64748B', maxWidth: '420px', margin: '0.5rem auto 0' }}>
                  When you deliver active Cash on Delivery orders, they will appear here with full timestamps, customer details, and collected cash amounts.
                </p>
              </div>
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.85rem' }}>
                {deliveredCODOrders.map((order, idx) => {
                  const isCOD = order.payment_method === 'cod';
                  return (
                    <div
                      key={order.id}
                      style={{
                        backgroundColor: '#FFFFFF',
                        border: '1px solid #E2E8F0',
                        borderRadius: '14px',
                        padding: '1.15rem 1.35rem',
                        display: 'flex',
                        flexWrap: 'wrap',
                        alignItems: 'center',
                        justifyContent: 'space-between',
                        gap: '1rem',
                        boxShadow: '0 1px 3px rgba(0,0,0,0.03)',
                        transition: 'transform 0.15s ease, box-shadow 0.15s ease',
                      }}
                    >
                      {/* Left: Order Info & Customer */}
                      <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', minWidth: '240px' }}>
                        <div
                          style={{
                            width: '44px',
                            height: '44px',
                            borderRadius: '10px',
                            backgroundColor: isCOD ? '#ECFDF5' : '#EFF6FF',
                            color: isCOD ? '#059669' : '#2563EB',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            fontWeight: 900,
                            fontSize: '0.85rem',
                            flexShrink: 0,
                          }}
                        >
                          #{idx + 1}
                        </div>

                        <div>
                          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', flexWrap: 'wrap' }}>
                            <span style={{ fontWeight: 800, fontSize: '0.95rem', color: '#0F172A', fontFamily: 'monospace' }}>
                              {order.order_number}
                            </span>
                            <span
                              style={{
                                fontSize: '0.68rem',
                                fontWeight: 800,
                                padding: '0.15rem 0.55rem',
                                borderRadius: '999px',
                                backgroundColor: isCOD ? '#D1FAE5' : '#DBEAFE',
                                color: isCOD ? '#065F46' : '#1E40AF',
                              }}
                            >
                              {isCOD ? 'Cash on Delivery (COD)' : 'Prepaid (Online)'}
                            </span>
                          </div>

                          <div style={{ fontSize: '0.82rem', color: '#475569', marginTop: '0.2rem', display: 'flex', alignItems: 'center', gap: '0.4rem', flexWrap: 'wrap' }}>
                            <span style={{ fontWeight: 700, color: '#0F172A' }}>{order.customer?.name || 'Customer'}</span>
                            <span>•</span>
                            <span style={{ color: '#64748B' }}>{order.phone}</span>
                            <span>•</span>
                            <span style={{ color: '#64748B' }}>{order.shipping_address}</span>
                          </div>

                          {order.delivery_notes && (
                            <div style={{ fontSize: '0.74rem', color: '#059669', fontWeight: 600, marginTop: '0.25rem' }}>
                              📝 Note: {order.delivery_notes}
                            </div>
                          )}
                        </div>
                      </div>

                      {/* Right: Cash Amount & Action */}
                      <div style={{ display: 'flex', alignItems: 'center', gap: '1.25rem' }}>
                        <div style={{ textAlign: 'right' }}>
                          <span style={{ fontSize: '0.7rem', fontWeight: 800, textTransform: 'uppercase', color: '#64748B' }}>
                            {isCOD ? 'Cash Received' : 'Prepaid Amount'}
                          </span>
                          <div style={{ fontSize: '1.35rem', fontWeight: 900, color: isCOD ? '#047857' : '#1E40AF' }}>
                            {formatPrice(order.final_amount)}
                          </div>
                          <span style={{ fontSize: '0.68rem', color: '#059669', fontWeight: 700 }}>
                            ✓ Reconciled Today
                          </span>
                        </div>

                        <button
                          type="button"
                          onClick={() => setSelectedOrderForDetail(order)}
                          style={{
                            padding: '0.5rem 0.85rem',
                            borderRadius: '8px',
                            backgroundColor: '#F1F5F9',
                            border: '1px solid #CBD5E1',
                            color: '#0F172A',
                            fontSize: '0.78rem',
                            fontWeight: 700,
                            cursor: 'pointer',
                          }}
                        >
                          Details
                        </button>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        )}

        {/* ========================================================================= */}
        {/* VIEW 2 & 3: ACTIVE SHIPMENTS & DELIVERED HISTORY (CARDS GRID) */}
        {/* ========================================================================= */}
        {activeTab !== 'cash_ledger' && (
          <>
            {loading ? (
              <div style={{ padding: '4rem 1rem', textAlign: 'center', color: '#64748B' }}>
                <RefreshCw size={28} className="animate-spin" style={{ margin: '0 auto 0.75rem', color: '#E35205' }} />
                <p style={{ fontSize: '0.9rem', fontWeight: 700, margin: 0 }}>Syncing live delivery manifest...</p>
              </div>
            ) : filteredOrders.length === 0 ? (
              <div
                style={{
                  padding: '4rem 2rem',
                  textAlign: 'center',
                  backgroundColor: '#FFFFFF',
                  borderRadius: '16px',
                  border: '1px dashed #CBD5E1',
                }}
              >
                <div
                  style={{
                    width: '64px',
                    height: '64px',
                    borderRadius: '50%',
                    backgroundColor: '#F1F5F9',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    margin: '0 auto 1.25rem',
                    color: '#94A3B8',
                  }}
                >
                  <Package size={32} />
                </div>
                <h3 style={{ fontSize: '1.2rem', fontWeight: 800, color: '#0F172A', margin: 0 }}>
                  No {activeTab === 'active' ? 'active' : 'completed'} shipments found
                </h3>
                <p style={{ fontSize: '0.85rem', color: '#64748B', maxWidth: '420px', margin: '0.5rem auto 0', lineHeight: 1.5 }}>
                  {searchQuery
                    ? `No orders match "${searchQuery}". Clear your search query to see all parcels.`
                    : 'When new orders are dispatched and assigned to your courier ID, they will appear here in real-time.'}
                </p>
                {searchQuery && (
                  <button
                    type="button"
                    onClick={() => setSearchQuery('')}
                    style={{
                      marginTop: '1.25rem',
                      padding: '0.6rem 1.4rem',
                      borderRadius: '8px',
                      backgroundColor: '#0F172A',
                      color: '#FFFFFF',
                      border: 'none',
                      fontSize: '0.82rem',
                      fontWeight: 700,
                      cursor: 'pointer',
                    }}
                  >
                    Clear Search Filter
                  </button>
                )}
              </div>
            ) : (
              <div
                style={{
                  display: 'grid',
                  gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))',
                  gap: '1.25rem',
                }}
              >
                {filteredOrders.map((order) => {
                  const isDelivered = order.delivery_status === 'delivered';
                  const isOut = order.delivery_status === 'out_for_delivery';
                  const isCOD = order.payment_method === 'cod';
                  const phoneClean = (order.phone || '').replace(/[^0-9+]/g, '');

                  // Pre-composed friendly delivery greeting for WhatsApp
                  const whatsappMessage = encodeURIComponent(
                    `Assalam-o-Alaikum ${order.customer?.name || 'Customer'}! Your Khaam Poshak parcel (Order #${order.order_number}) is out for delivery today. ${
                      isCOD ? `Please have exact cash of ${formatPrice(order.final_amount)} ready. ` : 'This is a prepaid parcel. '
                    }Our courier rider is on the way!`
                  );
                  const whatsappUrl = `https://wa.me/${phoneClean}?text=${whatsappMessage}`;
                  const mapsUrl = `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(
                    `${order.shipping_address}, ${order.customer?.city || 'Pakistan'}`
                  )}`;

                  return (
                    <div
                      key={order.id}
                      style={{
                        backgroundColor: '#FFFFFF',
                        border: '1px solid #E2E8F0',
                        borderRadius: '16px',
                        overflow: 'hidden',
                        boxShadow: '0 2px 8px rgba(0,0,0,0.04)',
                        display: 'flex',
                        flexDirection: 'column',
                        justifyContent: 'space-between',
                        transition: 'transform 0.15s ease, box-shadow 0.15s ease',
                      }}
                    >
                      {/* Card Header: Order Number & Delivery Status */}
                      <div
                        style={{
                          padding: '1rem 1.25rem',
                          backgroundColor: '#F8FAFC',
                          borderBottom: '1px solid #E2E8F0',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'space-between',
                        }}
                      >
                        <div>
                          <span style={{ fontSize: '0.7rem', fontWeight: 800, textTransform: 'uppercase', color: '#64748B' }}>
                            Tracking ID
                          </span>
                          <div style={{ fontWeight: 900, fontSize: '1.05rem', color: '#0F172A', fontFamily: 'monospace' }}>
                            {order.order_number}
                          </div>
                        </div>

                        {/* Status Badge */}
                        <span
                          style={{
                            fontSize: '0.72rem',
                            fontWeight: 800,
                            padding: '0.25rem 0.65rem',
                            borderRadius: '999px',
                            display: 'inline-flex',
                            alignItems: 'center',
                            gap: '0.35rem',
                            backgroundColor: isDelivered ? '#DCFCE7' : isOut ? '#FFEDD5' : '#F1F5F9',
                            color: isDelivered ? '#15803D' : isOut ? '#C2410C' : '#334155',
                            border: `1px solid ${isDelivered ? '#86EFAC' : isOut ? '#FDBA74' : '#CBD5E1'}`,
                          }}
                        >
                          {isDelivered ? (
                            <>
                              <CheckCircle2 size={13} />
                              <span>Delivered</span>
                            </>
                          ) : isOut ? (
                            <>
                              <Truck size={13} />
                              <span>Out For Delivery</span>
                            </>
                          ) : (
                            <>
                              <Clock size={13} />
                              <span>Assigned / Queue</span>
                            </>
                          )}
                        </span>
                      </div>

                      {/* Card Body */}
                      <div style={{ padding: '1.25rem', display: 'flex', flexDirection: 'column', gap: '0.9rem' }}>
                        {/* 1. Cash Collection Alert Banner (CRITICAL for Courier clarity) */}
                        {isCOD ? (
                          <div
                            style={{
                              backgroundColor: '#FFFBEB',
                              border: '1.5px solid #FCD34D',
                              borderRadius: '10px',
                              padding: '0.75rem 0.95rem',
                              display: 'flex',
                              alignItems: 'center',
                              justifyContent: 'space-between',
                            }}
                          >
                            <div>
                              <span style={{ fontSize: '0.68rem', fontWeight: 900, textTransform: 'uppercase', color: '#B45309' }}>
                                Cash On Delivery
                              </span>
                              <div style={{ fontSize: '1.2rem', fontWeight: 900, color: '#92400E' }}>
                                COLLECT: {formatPrice(order.final_amount)}
                              </div>
                            </div>
                            <div style={{ padding: '0.4rem', borderRadius: '8px', backgroundColor: '#FEF3C7', color: '#D97706' }}>
                              <Banknote size={24} />
                            </div>
                          </div>
                        ) : (
                          <div
                            style={{
                              backgroundColor: '#EFF6FF',
                              border: '1.5px solid #BFDBFE',
                              borderRadius: '10px',
                              padding: '0.75rem 0.95rem',
                              display: 'flex',
                              alignItems: 'center',
                              justifyContent: 'space-between',
                            }}
                          >
                            <div>
                              <span style={{ fontSize: '0.68rem', fontWeight: 900, textTransform: 'uppercase', color: '#1E40AF' }}>
                                Prepaid (Paid Online)
                              </span>
                              <div style={{ fontSize: '1.1rem', fontWeight: 900, color: '#1E40AF' }}>
                                DO NOT COLLECT CASH
                              </div>
                            </div>
                            <div style={{ padding: '0.4rem', borderRadius: '8px', backgroundColor: '#DBEAFE', color: '#2563EB' }}>
                              <ShieldCheck size={24} />
                            </div>
                          </div>
                        )}

                        {/* Customer Doorstep Coordinates */}
                        <div>
                          <div style={{ fontSize: '1.05rem', fontWeight: 900, color: '#0F172A' }}>
                            {order.customer?.name || 'Customer'}
                          </div>
                          <div style={{ fontSize: '0.86rem', fontWeight: 700, color: '#334155', marginTop: '0.1rem' }}>
                            {order.phone}
                          </div>

                          <div
                            style={{
                              display: 'flex',
                              alignItems: 'flex-start',
                              gap: '0.45rem',
                              fontSize: '0.84rem',
                              color: '#475569',
                              marginTop: '0.45rem',
                              lineHeight: 1.4,
                            }}
                          >
                            <MapPin size={16} color="#E35205" style={{ flexShrink: 0, marginTop: '2px' }} />
                            <span>{order.shipping_address}</span>
                          </div>
                        </div>

                        {/* Package Contents preview */}
                        {order.items && order.items.length > 0 && (
                          <div
                            style={{
                              fontSize: '0.78rem',
                              color: '#64748B',
                              backgroundColor: '#F8FAFC',
                              padding: '0.55rem 0.75rem',
                              borderRadius: '8px',
                              border: '1px solid #E2E8F0',
                            }}
                          >
                            <span style={{ fontWeight: 700, color: '#0F172A' }}>Package: </span>
                            {order.items.map((it) => `${it.product_name} (x${it.quantity})`).join(', ')}
                          </div>
                        )}

                        {/* 1-Tap Communication Shortcuts */}
                        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '0.5rem', marginTop: '0.2rem' }}>
                          <a
                            href={`tel:${phoneClean}`}
                            style={{
                              display: 'flex',
                              alignItems: 'center',
                              justifyContent: 'center',
                              gap: '0.35rem',
                              padding: '0.55rem',
                              borderRadius: '8px',
                              backgroundColor: '#0F172A',
                              color: '#FFFFFF',
                              fontSize: '0.76rem',
                              fontWeight: 800,
                              textDecoration: 'none',
                            }}
                          >
                            <Phone size={13} />
                            <span>Call</span>
                          </a>

                          <a
                            href={whatsappUrl}
                            target="_blank"
                            rel="noreferrer"
                            style={{
                              display: 'flex',
                              alignItems: 'center',
                              justifyContent: 'center',
                              gap: '0.35rem',
                              padding: '0.55rem',
                              borderRadius: '8px',
                              backgroundColor: '#25D366',
                              color: '#FFFFFF',
                              fontSize: '0.76rem',
                              fontWeight: 800,
                              textDecoration: 'none',
                            }}
                          >
                            <MessageSquare size={13} />
                            <span>WhatsApp</span>
                          </a>

                          <a
                            href={mapsUrl}
                            target="_blank"
                            rel="noreferrer"
                            style={{
                              display: 'flex',
                              alignItems: 'center',
                              justifyContent: 'center',
                              gap: '0.35rem',
                              padding: '0.55rem',
                              borderRadius: '8px',
                              backgroundColor: '#0284C7',
                              color: '#FFFFFF',
                              fontSize: '0.76rem',
                              fontWeight: 800,
                              textDecoration: 'none',
                            }}
                          >
                            <Navigation size={13} />
                            <span>Map</span>
                          </a>
                        </div>
                      </div>

                      {/* Card Footer: Primary Dispatch Action */}
                      <div
                        style={{
                          padding: '0.9rem 1.25rem',
                          backgroundColor: '#F8FAFC',
                          borderTop: '1px solid #E2E8F0',
                          display: 'flex',
                          alignItems: 'center',
                          gap: '0.6rem',
                        }}
                      >
                        <button
                          type="button"
                          onClick={() => setSelectedOrderForDetail(order)}
                          style={{
                            flex: 1,
                            padding: '0.65rem 1rem',
                            borderRadius: '8px',
                            backgroundColor: isDelivered ? '#0F172A' : '#059669',
                            color: '#FFFFFF',
                            border: 'none',
                            fontSize: '0.84rem',
                            fontWeight: 800,
                            cursor: 'pointer',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            gap: '0.45rem',
                            boxShadow: isDelivered ? 'none' : '0 2px 8px rgba(5, 150, 105, 0.25)',
                          }}
                        >
                          {isDelivered ? (
                            <>
                              <CheckCircle2 size={15} />
                              <span>View Receipt</span>
                            </>
                          ) : (
                            <>
                              <Check size={16} strokeWidth={2.5} />
                              <span>
                                {isCOD ? `Deliver & Collect ${formatPrice(order.final_amount)}` : 'Deliver • Prepaid'}
                              </span>
                            </>
                          )}
                        </button>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </>
        )}
      </main>

      {/* ========================================================================= */}
      {/* MODAL 1: DIGITAL DELIVERY CONFIRMATION SLIP MODAL */}
      {/* ========================================================================= */}
      {selectedOrderForDetail && (() => {
        const order = selectedOrderForDetail;
        const isCOD = order.payment_method === 'cod';
        const isDelivered = order.delivery_status === 'delivered';
        const isOut = order.delivery_status === 'out_for_delivery';
        const phoneClean = (order.phone || '').replace(/[^0-9+]/g, '');

        const whatsappMessage = encodeURIComponent(
          `Assalam-o-Alaikum ${order.customer?.name || 'Customer'}! Your Khaam Poshak parcel (Order #${order.order_number}) is out for delivery today. ${
            isCOD ? `Please have exact cash of ${formatPrice(order.final_amount)} ready. ` : 'This is a prepaid parcel. '
          }Our courier rider is on the way!`
        );
        const whatsappUrl = `https://wa.me/${phoneClean}?text=${whatsappMessage}`;
        const mapsUrl = `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(
          `${order.shipping_address}, ${order.customer?.city || 'Pakistan'}`
        )}`;

        return (
          <div
            style={{
              position: 'fixed',
              top: 0,
              left: 0,
              right: 0,
              bottom: 0,
              zIndex: 999,
              backgroundColor: 'rgba(15, 23, 42, 0.65)',
              backdropFilter: 'blur(4px)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              padding: '1rem',
            }}
          >
            <div
              style={{
                backgroundColor: '#FFFFFF',
                borderRadius: '20px',
                width: '100%',
                maxWidth: '620px',
                maxHeight: '90vh',
                overflowY: 'auto',
                boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.25)',
                display: 'flex',
                flexDirection: 'column',
              }}
            >
              {/* Modal Header */}
              <div
                style={{
                  padding: '1.25rem 1.5rem',
                  borderBottom: '1px solid #E2E8F0',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  backgroundColor: '#0F172A',
                  color: '#FFFFFF',
                  borderTopLeftRadius: '20px',
                  borderTopRightRadius: '20px',
                }}
              >
                <div>
                  <span style={{ fontSize: '0.72rem', fontWeight: 800, color: '#94A3B8', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                    Digital Delivery Slip
                  </span>
                  <div style={{ fontSize: '1.2rem', fontWeight: 900, fontFamily: 'monospace', color: '#FFFFFF' }}>
                    {order.order_number}
                  </div>
                </div>

                <button
                  type="button"
                  onClick={() => setSelectedOrderForDetail(null)}
                  style={{
                    width: '32px',
                    height: '32px',
                    borderRadius: '50%',
                    backgroundColor: 'rgba(255, 255, 255, 0.1)',
                    border: 'none',
                    color: '#FFFFFF',
                    cursor: 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                  }}
                >
                  <X size={18} />
                </button>
              </div>

              {/* Modal Body */}
              <div style={{ padding: '1.5rem', display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
                {/* 1. Cash Collection Alert Banner */}
                {isCOD ? (
                  <div
                    style={{
                      backgroundColor: '#FFFBEB',
                      border: '2px solid #F59E0B',
                      borderRadius: '12px',
                      padding: '1.15rem',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'space-between',
                      boxShadow: '0 4px 12px rgba(245, 158, 11, 0.1)',
                    }}
                  >
                    <div>
                      <div style={{ fontSize: '0.74rem', fontWeight: 800, color: '#B45309', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                        CASH ON DELIVERY (COD) MANDATORY
                      </div>
                      <div style={{ fontSize: '1.6rem', fontWeight: 900, color: '#92400E', marginTop: '0.2rem' }}>
                        COLLECT {formatPrice(order.final_amount)}
                      </div>
                      <div style={{ fontSize: '0.78rem', color: '#B45309', marginTop: '0.2rem', fontWeight: 600 }}>
                        ⚠️ Receive exact cash from recipient before handing over package
                      </div>
                    </div>
                    <div style={{ padding: '0.65rem', borderRadius: '50%', backgroundColor: '#FEF3C7', color: '#D97706' }}>
                      <Banknote size={36} />
                    </div>
                  </div>
                ) : (
                  <div
                    style={{
                      backgroundColor: '#F0FDF4',
                      border: '2px solid #10B981',
                      borderRadius: '12px',
                      padding: '1.15rem',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'space-between',
                    }}
                  >
                    <div>
                      <div style={{ fontSize: '0.74rem', fontWeight: 800, color: '#15803D', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                        PREPAID ORDER (ONLINE PAYMENT)
                      </div>
                      <div style={{ fontSize: '1.4rem', fontWeight: 900, color: '#166534', marginTop: '0.2rem' }}>
                        DO NOT COLLECT CASH ({formatPrice(0)})
                      </div>
                      <div style={{ fontSize: '0.78rem', color: '#15803D', marginTop: '0.2rem' }}>
                        ✓ Paid in full via payment gateway during checkout
                      </div>
                    </div>
                    <div style={{ padding: '0.65rem', borderRadius: '50%', backgroundColor: '#DCFCE7', color: '#16A34A' }}>
                      <ShieldCheck size={36} />
                    </div>
                  </div>
                )}

                {/* 2. Customer Contact & Navigation Card */}
                <div
                  style={{
                    backgroundColor: '#F8FAFC',
                    borderRadius: '12px',
                    padding: '1.25rem',
                    border: '1px solid #E2E8F0',
                    display: 'flex',
                    flexDirection: 'column',
                    gap: '0.85rem',
                  }}
                >
                  <div style={{ fontSize: '0.72rem', fontWeight: 800, textTransform: 'uppercase', color: '#64748B', letterSpacing: '0.06em' }}>
                    Customer Doorstep Coordinates
                  </div>

                  <div style={{ display: 'flex', alignItems: 'baseline', justifyContent: 'space-between', flexWrap: 'wrap', gap: '0.5rem' }}>
                    <span style={{ fontSize: '1.2rem', fontWeight: 900, color: '#0F172A' }}>
                      {order.customer?.name || 'Customer'}
                    </span>
                    <span style={{ fontSize: '0.9rem', fontWeight: 800, color: '#334155' }}>
                      {order.phone}
                    </span>
                  </div>

                  {/* Destination Address */}
                  <div
                    style={{
                      display: 'flex',
                      alignItems: 'flex-start',
                      gap: '0.6rem',
                      fontSize: '0.9rem',
                      color: '#0F172A',
                      backgroundColor: '#FFFFFF',
                      padding: '0.85rem 1rem',
                      borderRadius: '8px',
                      border: '1px solid #E2E8F0',
                      lineHeight: 1.5,
                    }}
                  >
                    <MapPin size={20} color="#E35205" style={{ flexShrink: 0, marginTop: '2px' }} />
                    <span style={{ fontWeight: 600 }}>{order.shipping_address}</span>
                  </div>

                  {/* 3 Touch-Friendly Communication Buttons */}
                  <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(150px, 1fr))', gap: '0.6rem', marginTop: '0.25rem' }}>
                    <a
                      href={`tel:${phoneClean}`}
                      style={{
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        gap: '0.45rem',
                        padding: '0.65rem',
                        borderRadius: '8px',
                        backgroundColor: '#0F172A',
                        color: '#FFFFFF',
                        fontSize: '0.82rem',
                        fontWeight: 800,
                        textDecoration: 'none',
                      }}
                    >
                      <Phone size={15} />
                      <span>Call Customer</span>
                    </a>

                    <a
                      href={whatsappUrl}
                      target="_blank"
                      rel="noreferrer"
                      style={{
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        gap: '0.45rem',
                        padding: '0.65rem',
                        borderRadius: '8px',
                        backgroundColor: '#25D366',
                        color: '#FFFFFF',
                        fontSize: '0.82rem',
                        fontWeight: 800,
                        textDecoration: 'none',
                      }}
                    >
                      <MessageSquare size={15} />
                      <span>WhatsApp</span>
                    </a>

                    <a
                      href={mapsUrl}
                      target="_blank"
                      rel="noreferrer"
                      style={{
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        gap: '0.45rem',
                        padding: '0.65rem',
                        borderRadius: '8px',
                        backgroundColor: '#0284C7',
                        color: '#FFFFFF',
                        fontSize: '0.82rem',
                        fontWeight: 800,
                        textDecoration: 'none',
                      }}
                    >
                      <Navigation size={15} />
                      <span>Open Route</span>
                    </a>
                  </div>
                </div>

                {/* 3. Package Items Breakdown */}
                <div>
                  <div style={{ fontSize: '0.74rem', fontWeight: 800, textTransform: 'uppercase', color: '#64748B', marginBottom: '0.5rem', letterSpacing: '0.05em' }}>
                    Package Contents ({order.items?.length || 1} Products)
                  </div>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                    {order.items?.map((item) => (
                      <div
                        key={item.id}
                        style={{
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'space-between',
                          padding: '0.75rem 0.95rem',
                          backgroundColor: '#F8FAFC',
                          borderRadius: '8px',
                          border: '1px solid #E2E8F0',
                          fontSize: '0.86rem',
                        }}
                      >
                        <div>
                          <div style={{ fontWeight: 800, color: '#0F172A' }}>
                            {item.product_name}
                          </div>
                          {item.selected_attributes && Object.keys(item.selected_attributes).length > 0 && (
                            <div style={{ color: '#E35205', fontSize: '0.76rem', fontWeight: 700, marginTop: '0.2rem' }}>
                              {Object.entries(item.selected_attributes).map(([k, v]) => `${k}: ${v}`).join(' · ')}
                            </div>
                          )}
                        </div>
                        <div style={{ textAlign: 'right' }}>
                          <span style={{ fontWeight: 900, color: '#0F172A' }}>
                            x{item.quantity}
                          </span>
                          <div style={{ fontSize: '0.76rem', color: '#64748B' }}>
                            {formatPrice(item.price || item.subtotal)}
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                {order.delivery_notes && (
                  <div style={{ fontSize: '0.8rem', color: '#475569', backgroundColor: '#F1F5F9', padding: '0.7rem 0.9rem', borderRadius: '8px', border: '1px solid #E2E8F0' }}>
                    <strong>Last Recorded Note:</strong> {order.delivery_notes}
                  </div>
                )}

                {/* 4. Delivery Actions Console */}
                {!isDelivered ? (
                  <div
                    style={{
                      backgroundColor: '#F8FAFC',
                      borderRadius: '12px',
                      padding: '1.25rem',
                      border: '1px solid #E2E8F0',
                      display: 'flex',
                      flexDirection: 'column',
                      gap: '0.85rem',
                    }}
                  >
                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '0.5rem' }}>
                      <span style={{ fontSize: '0.72rem', fontWeight: 800, color: '#64748B', textTransform: 'uppercase', letterSpacing: '0.06em' }}>
                        Quick Delivery Notes
                      </span>

                      {/* Preset Note Pills */}
                      <div style={{ display: 'flex', gap: '0.35rem', flexWrap: 'wrap' }}>
                        {[
                          'Handed in person',
                          'Handed to family',
                          'Left at gate / guard',
                          'Customer rescheduled',
                          'Phone unreachable',
                        ].map((note) => (
                          <button
                            key={note}
                            type="button"
                            onClick={() => handleApplyPresetNote(order.id, note)}
                            style={{
                              fontSize: '0.72rem',
                              padding: '0.25rem 0.55rem',
                              borderRadius: '6px',
                              backgroundColor: actionNotes[order.id] === note ? '#0F172A' : '#FFFFFF',
                              border: '1px solid #CBD5E1',
                              color: actionNotes[order.id] === note ? '#FFFFFF' : '#334155',
                              cursor: 'pointer',
                              fontWeight: 700,
                              transition: 'all 0.15s ease',
                            }}
                          >
                            + {note}
                          </button>
                        ))}
                      </div>
                    </div>

                    <input
                      type="text"
                      placeholder="Add custom delivery note, gate code, or drop instructions..."
                      value={actionNotes[order.id] || ''}
                      onChange={(e) => setActionNotes({ ...actionNotes, [order.id]: e.target.value })}
                      style={{
                        width: '100%',
                        padding: '0.7rem 0.95rem',
                        borderRadius: '8px',
                        backgroundColor: '#FFFFFF',
                        border: '1px solid #CBD5E1',
                        color: '#0F172A',
                        fontSize: '0.86rem',
                        outline: 'none',
                      }}
                    />

                    {/* Action Buttons */}
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '0.65rem' }}>
                      <button
                        type="button"
                        disabled={updatingId === order.id}
                        onClick={() => handleUpdateStatus(order.id, 'delivered')}
                        style={{
                          width: '100%',
                          padding: '0.85rem 1.25rem',
                          borderRadius: '10px',
                          backgroundColor: '#059669',
                          color: '#FFFFFF',
                          border: 'none',
                          fontSize: '0.92rem',
                          fontWeight: 900,
                          cursor: 'pointer',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          gap: '0.55rem',
                          boxShadow: '0 4px 14px rgba(5, 150, 105, 0.3)',
                          opacity: updatingId === order.id ? 0.6 : 1,
                        }}
                      >
                        <CheckCircle2 size={18} strokeWidth={2.5} />
                        <span>
                          {isCOD
                            ? `Mark Delivered • Collect ${formatPrice(order.final_amount)}`
                            : 'Mark Delivered • Prepaid'}
                        </span>
                      </button>

                      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: '0.65rem' }}>
                        {!isOut && (
                          <button
                            type="button"
                            disabled={updatingId === order.id}
                            onClick={() => handleUpdateStatus(order.id, 'out_for_delivery')}
                            style={{
                              padding: '0.75rem',
                              borderRadius: '8px',
                              backgroundColor: '#E35205',
                              color: '#FFFFFF',
                              border: 'none',
                              fontSize: '0.82rem',
                              fontWeight: 800,
                              cursor: 'pointer',
                              display: 'flex',
                              alignItems: 'center',
                              justifyContent: 'center',
                              gap: '0.45rem',
                              opacity: updatingId === order.id ? 0.6 : 1,
                            }}
                          >
                            <Truck size={16} />
                            <span>Start Route • Out For Delivery</span>
                          </button>
                        )}

                        <button
                          type="button"
                          disabled={updatingId === order.id}
                          onClick={() => handleUpdateStatus(order.id, 'failed')}
                          style={{
                            padding: '0.75rem',
                            borderRadius: '8px',
                            backgroundColor: '#FFFFFF',
                            color: '#DC2626',
                            border: '1px solid #FCA5A5',
                            fontSize: '0.82rem',
                            fontWeight: 700,
                            cursor: 'pointer',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            gap: '0.45rem',
                            opacity: updatingId === order.id ? 0.6 : 1,
                          }}
                        >
                          <AlertTriangle size={15} />
                          <span>Delivery Failed / Re-attempt</span>
                        </button>
                      </div>
                    </div>
                  </div>
                ) : (
                  <div
                    style={{
                      padding: '1rem',
                      borderRadius: '10px',
                      backgroundColor: '#DCFCE7',
                      border: '1px solid #86EFAC',
                      color: '#166534',
                      fontSize: '0.88rem',
                      fontWeight: 800,
                      display: 'flex',
                      alignItems: 'center',
                      gap: '0.6rem',
                      justifyContent: 'center',
                    }}
                  >
                    <CheckCircle2 size={20} strokeWidth={2.5} />
                    <span>This shipment has been successfully completed and delivered!</span>
                  </div>
                )}
              </div>
            </div>
          </div>
        );
      })()}

      {/* ========================================================================= */}
      {/* MODAL 2: SHIFT CASH HANDOVER RECONCILIATION SLIP (OFFICIAL PRINTABLE) */}
      {/* ========================================================================= */}
      {showHandoverModal && (
        <div
          style={{
            position: 'fixed',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            zIndex: 1000,
            backgroundColor: 'rgba(15, 23, 42, 0.75)',
            backdropFilter: 'blur(5px)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            padding: '1.25rem',
          }}
        >
          <div
            style={{
              backgroundColor: '#FFFFFF',
              borderRadius: '20px',
              width: '100%',
              maxWidth: '560px',
              maxHeight: '92vh',
              overflowY: 'auto',
              boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.35)',
              display: 'flex',
              flexDirection: 'column',
              fontFamily: "'Inter', sans-serif",
            }}
          >
            {/* Handover Slip Header */}
            <div
              style={{
                backgroundColor: '#0F172A',
                color: '#FFFFFF',
                padding: '1.5rem',
                borderTopLeftRadius: '20px',
                borderTopRightRadius: '20px',
                position: 'relative',
              }}
            >
              <button
                type="button"
                onClick={() => setShowHandoverModal(false)}
                style={{
                  position: 'absolute',
                  top: '1rem',
                  right: '1rem',
                  width: '32px',
                  height: '32px',
                  borderRadius: '50%',
                  backgroundColor: 'rgba(255, 255, 255, 0.1)',
                  border: 'none',
                  color: '#FFFFFF',
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                }}
              >
                <X size={18} />
              </button>

              <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem' }}>
                <Receipt size={24} color="#FBBF24" />
                <span style={{ fontSize: '0.74rem', fontWeight: 900, textTransform: 'uppercase', letterSpacing: '0.08em', color: '#94A3B8' }}>
                  Official Shift Reconciliation
                </span>
              </div>

              <h2 style={{ fontSize: '1.4rem', fontWeight: 900, margin: '0.4rem 0 0 0', letterSpacing: '-0.01em' }}>
                Courier Cash Handover Slip
              </h2>

              <div style={{ fontSize: '0.8rem', color: '#CBD5E1', marginTop: '0.35rem', display: 'flex', gap: '1rem', flexWrap: 'wrap' }}>
                <span>Rider: <strong>{user ? user.name : 'Tariq Rider'}</strong></span>
                <span>ID: <strong>#{user?.employee_id || 'RID-01'}</strong></span>
                <span>Date: <strong>{new Date().toLocaleDateString('en-PK', { year: 'numeric', month: 'short', day: 'numeric' })}</strong></span>
              </div>
            </div>

            {/* Handover Slip Body */}
            <div style={{ padding: '1.5rem', display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
              {/* Grand Total Cash Highlight */}
              <div
                style={{
                  backgroundColor: '#ECFDF5',
                  border: '2px solid #059669',
                  borderRadius: '12px',
                  padding: '1.25rem',
                  textAlign: 'center',
                }}
              >
                <span style={{ fontSize: '0.74rem', fontWeight: 900, color: '#047857', textTransform: 'uppercase', letterSpacing: '0.06em' }}>
                  Total Physical Cash To Deposit (COD)
                </span>
                <div style={{ fontSize: '2.5rem', fontWeight: 900, color: '#065F46', marginTop: '0.2rem' }}>
                  {formatPrice(cashInHand)}
                </div>
                <div style={{ fontSize: '0.8rem', color: '#047857', marginTop: '0.2rem', fontWeight: 600 }}>
                  Reconciled from {stats?.cod_delivered_today ?? (stats?.delivered_today ?? 0)} COD orders
                </div>
              </div>

              {/* Breakdown Statistics */}
              <div
                style={{
                  display: 'grid',
                  gridTemplateColumns: 'repeat(2, 1fr)',
                  gap: '0.75rem',
                  fontSize: '0.82rem',
                }}
              >
                <div style={{ padding: '0.75rem', backgroundColor: '#F8FAFC', borderRadius: '8px', border: '1px solid #E2E8F0' }}>
                  <div style={{ color: '#64748B' }}>Total Parcels Delivered:</div>
                  <div style={{ fontSize: '1.1rem', fontWeight: 800, color: '#0F172A', marginTop: '0.15rem' }}>
                    {stats?.delivered_today ?? 0} Parcels
                  </div>
                </div>

                <div style={{ padding: '0.75rem', backgroundColor: '#F8FAFC', borderRadius: '8px', border: '1px solid #E2E8F0' }}>
                  <div style={{ color: '#64748B' }}>Remaining on Route:</div>
                  <div style={{ fontSize: '1.1rem', fontWeight: 800, color: '#0F172A', marginTop: '0.15rem' }}>
                    {stats?.active_deliveries ?? 0} Parcels
                  </div>
                </div>
              </div>

              {/* Itemized Cash Receipts */}
              <div>
                <span style={{ fontSize: '0.72rem', fontWeight: 800, color: '#64748B', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                  Itemized Manifest Reconciliations
                </span>
                <div
                  style={{
                    maxHeight: '180px',
                    overflowY: 'auto',
                    border: '1px solid #E2E8F0',
                    borderRadius: '8px',
                    marginTop: '0.45rem',
                  }}
                >
                  {deliveredCODOrders.map((order, i) => (
                    <div
                      key={order.id}
                      style={{
                        padding: '0.65rem 0.85rem',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'space-between',
                        borderBottom: i < deliveredCODOrders.length - 1 ? '1px solid #F1F5F9' : 'none',
                        fontSize: '0.82rem',
                      }}
                    >
                      <div>
                        <span style={{ fontWeight: 800, fontFamily: 'monospace' }}>{order.order_number}</span>
                        <div style={{ fontSize: '0.74rem', color: '#64748B' }}>{order.customer?.name}</div>
                      </div>
                      <div style={{ textAlign: 'right' }}>
                        <div style={{ fontWeight: 800, color: '#065F46' }}>
                          {order.payment_method === 'cod' ? formatPrice(order.final_amount) : 'Prepaid (Rs. 0)'}
                        </div>
                        <span style={{ fontSize: '0.68rem', color: '#10B981', fontWeight: 700 }}>✓ Verified</span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Sign-Off Signature Box */}
              <div
                style={{
                  display: 'grid',
                  gridTemplateColumns: 'repeat(2, 1fr)',
                  gap: '1rem',
                  marginTop: '0.5rem',
                  paddingTop: '0.75rem',
                  borderTop: '1px dashed #CBD5E1',
                }}
              >
                <div>
                  <div style={{ height: '42px', borderBottom: '1px solid #0F172A' }} />
                  <span style={{ fontSize: '0.72rem', fontWeight: 700, color: '#64748B', display: 'block', marginTop: '0.35rem' }}>
                    Courier Rider Signature
                  </span>
                </div>
                <div>
                  <div style={{ height: '42px', borderBottom: '1px solid #0F172A' }} />
                  <span style={{ fontSize: '0.72rem', fontWeight: 700, color: '#64748B', display: 'block', marginTop: '0.35rem' }}>
                    Cashier / Depot Manager Sign
                  </span>
                </div>
              </div>

              {/* Print & Close Buttons */}
              <div style={{ display: 'flex', gap: '0.75rem', marginTop: '0.5rem' }}>
                <button
                  type="button"
                  onClick={() => window.print()}
                  style={{
                    flex: 1,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    gap: '0.45rem',
                    padding: '0.75rem',
                    borderRadius: '8px',
                    backgroundColor: '#0F172A',
                    color: '#FFFFFF',
                    border: 'none',
                    fontSize: '0.84rem',
                    fontWeight: 800,
                    cursor: 'pointer',
                  }}
                >
                  <Printer size={16} />
                  <span>Print Slip</span>
                </button>

                <button
                  type="button"
                  onClick={() => setShowHandoverModal(false)}
                  style={{
                    padding: '0.75rem 1.25rem',
                    borderRadius: '8px',
                    backgroundColor: '#F1F5F9',
                    color: '#334155',
                    border: '1px solid #CBD5E1',
                    fontSize: '0.84rem',
                    fontWeight: 700,
                    cursor: 'pointer',
                  }}
                >
                  Close
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
