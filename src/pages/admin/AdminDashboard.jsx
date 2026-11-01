import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { useStore } from '../../context/StoreContext';
import ProductManager from './ProductManager';
import CategoryManager from './CategoryManager';
import OrderManager from './OrderManager';
import EmployeeManager from './EmployeeManager';
import SubscriberManager from './SubscriberManager';
import {
  LayoutDashboard,
  Layers,
  Package,
  FolderTree,
  ShoppingBag,
  TrendingUp,
  DollarSign,
  Users,
  Mail,
  ArrowLeft,
  Sparkles,
  ExternalLink,
  CheckCircle2,
  XCircle,
  Truck,
  Clock,
  Calendar,
  BarChart3,
  CreditCard,
  Banknote,
  RefreshCw,
  AlertTriangle,
  Activity,
  Percent,
  Download,
  Printer,
  ChevronRight,
  ShieldCheck,
  FileSpreadsheet,
  ArrowUpRight,
  Eye,
  Flame,
  Building2,
  Lock,
} from 'lucide-react';

export default function AdminDashboard({ onBackToStorefront }) {
  const navigate = useNavigate();
  const { storeType, store, config, formatPrice, isSwitcherAllowed } = useStore();
  const [activeTab, setActiveTab] = useState('overview');
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [selectedStoreId, setSelectedStoreId] = useState('all'); // 'all' or numeric store ID string
  const [selectedTimeframe, setSelectedTimeframe] = useState('all'); // 'weekly', 'monthly', 'yearly', 'all'
  const [chartMetric, setChartMetric] = useState('revenue'); // 'revenue' | 'orders'
  const [exportNotice, setExportNotice] = useState(null);

  const fetchStats = async (overrideStoreId = null) => {
    try {
      setLoading(true);
      const targetStore = overrideStoreId !== null ? overrideStoreId : selectedStoreId;
      const res = await axios.get('/api/admin/dashboard/stats', {
        params: { store_id: targetStore }
      });
      setStats(res.data);
      if (res.data.selected_store_id && overrideStoreId === null) {
        setSelectedStoreId(res.data.selected_store_id);
      }
    } catch (err) {
      console.error('Failed to load dashboard metrics:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleStoreScopeChange = (storeId) => {
    setSelectedStoreId(storeId);
    fetchStats(storeId);
  };

  useEffect(() => {
    fetchStats(selectedStoreId);
  }, [storeType]);

  const tabs = [
    { id: 'overview', label: isSwitcherAllowed ? 'Dashboard & Telemetry' : 'Dashboard Overview', icon: LayoutDashboard },
    { id: 'products', label: 'Products & Attributes', icon: Package },
    { id: 'categories', label: 'Category Manager', icon: FolderTree },
    { id: 'orders', label: 'Customer Orders', icon: ShoppingBag },
    { id: 'employees', label: 'Staff & Employee IDs', icon: Users },
    { id: 'subscribers', label: 'VIP Subscribers', icon: Mail },
  ];

  // Current active metrics based on selected timeframe
  const currentMetrics = stats?.timeframes?.[selectedTimeframe] || {
    label: 'All Time',
    total_revenue: 0,
    total_orders: 0,
    delivered_count: 0,
    delivered_amount: 0,
    cancelled_count: 0,
    cancelled_amount: 0,
    in_transit_count: 0,
    in_transit_amount: 0,
    pending_count: 0,
    pending_amount: 0,
    aov: 0,
    delivery_rate: 0,
    cancellation_rate: 0,
  };

  // Pipeline funnel percentages for the active timeframe
  const totalOrders = currentMetrics.total_orders || 1;
  const inTransitRate = Math.round((currentMetrics.in_transit_count / totalOrders) * 100);
  const pendingRate = Math.round((currentMetrics.pending_count / totalOrders) * 100);

  // Chart data
  const chartPoints = stats?.chart_data?.[selectedTimeframe] || [];
  const maxRevenueInChart = Math.max(...chartPoints.map((p) => p.revenue), 100);
  const maxOrdersInChart = Math.max(...chartPoints.map((p) => p.orders), 5);

  // Peak interval in active chart
  const peakPoint = chartPoints.reduce(
    (max, p) => (p.revenue > (max?.revenue || 0) ? p : max),
    chartPoints[0] || null
  );

  // Export Executive CSV Report
  const handleExportCSV = () => {
    if (!stats?.timeframes) return;

    const storeLabel = stats?.selected_store_name || store?.name || 'All Stores';
    const safeStoreSlug = storeLabel.replace(/[^a-zA-Z0-9]/g, '_');
    const nowIso = new Date().toISOString().slice(0, 10);

    const csvRows = [];

    // Header metadata block
    csvRows.push(['KHAAM POSHAK Executive Business Telemetry & Analytics Report']);
    csvRows.push([`Store Scope:`, `"${storeLabel}"`]);
    csvRows.push([`Standard Currency:`, `Pakistani Rupee (PKR - Rs.)`]);
    csvRows.push([`Business Inception Date:`, `"${stats?.first_order_date || 'Day 1'}"`]);
    csvRows.push([`Report Generated:`, `"${new Date().toLocaleString()}"`]);
    csvRows.push([]); // blank line

    // Section 1: Multi-Timeframe Performance Comparison
    csvRows.push(['--- PERFORMANCE TIMEFRAME COMPARISON ---']);
    csvRows.push([
      'Reporting Period',
      'Time Window',
      'Total Orders Placed',
      'Delivered Orders',
      'Delivered Revenue (PKR)',
      'In-Transit Orders',
      'In-Transit Value (PKR)',
      'Pending Orders',
      'Pending Value (PKR)',
      'Cancelled Orders',
      'Lost Cancelled Value (PKR)',
      'Realized Net Revenue (PKR)',
      'Fulfillment Rate (%)',
      'Cancellation Rate (%)',
      'Average Order Value (PKR)',
    ]);

    Object.entries(stats.timeframes).forEach(([key, tf]) => {
      csvRows.push([
        key.toUpperCase(),
        `"${tf.label}"`,
        tf.total_orders,
        tf.delivered_count,
        tf.delivered_amount,
        tf.in_transit_count,
        tf.in_transit_amount,
        tf.pending_count,
        tf.pending_amount,
        tf.cancelled_count,
        tf.cancelled_amount,
        tf.total_revenue,
        `${tf.delivery_rate}%`,
        `${tf.cancellation_rate}%`,
        tf.aov,
      ]);
    });

    // Section 2: Store Breakdown (if available)
    if (stats.stores_breakdown && stats.stores_breakdown.length > 0) {
      csvRows.push([]);
      csvRows.push(['--- STORES REVENUE & ORDER BREAKDOWN ---']);
      csvRows.push([
        'Store ID',
        'Store Name',
        'Store Type',
        'Active Status',
        'Catalog Products',
        'Total Orders',
        'Delivered Orders',
        'Cancelled Orders',
        'Total Revenue (PKR)',
      ]);

      stats.stores_breakdown.forEach((st) => {
        csvRows.push([
          st.id,
          `"${st.name}"`,
          st.store_type,
          st.is_active ? 'Active' : 'Inactive',
          st.products_count,
          st.orders_count,
          st.delivered_count,
          st.cancelled_count,
          st.revenue,
        ]);
      });
    }

    // Section 3: Recent Orders Sample
    if (stats.recent_orders && stats.recent_orders.length > 0) {
      csvRows.push([]);
      csvRows.push(['--- RECENT ORDERS AUDIT ---']);
      csvRows.push([
        'Order ID',
        'Order Number',
        'Customer Name',
        'Customer Phone',
        'Store Name',
        'Order Status',
        'Payment Method',
        'Amount (PKR)',
        'Created At',
      ]);

      stats.recent_orders.forEach((ord) => {
        csvRows.push([
          ord.id,
          `"${ord.order_number}"`,
          `"${ord.customer?.name || 'Guest'}"`,
          `"${ord.customer?.phone || ord.shipping_phone || 'N/A'}"`,
          `"${ord.store?.name || 'N/A'}"`,
          ord.status ? ord.status.toUpperCase() : 'PENDING',
          ord.payment_method ? ord.payment_method.toUpperCase() : 'COD',
          ord.final_amount || ord.total_amount,
          `"${ord.created_at ? new Date(ord.created_at).toLocaleString() : ''}"`,
        ]);
      });
    }

    const csvString = csvRows.map((r) => r.join(',')).join('\r\n');
    const blob = new Blob([csvString], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `Khaam_Poshak_Overview_Report_${safeStoreSlug}_${nowIso}.csv`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);

    setExportNotice(`Dashboard Overview CSV for "${storeLabel}" downloaded successfully!`);
    setTimeout(() => setExportNotice(null), 4000);
  };

  const handlePrintReport = () => {
    window.print();
  };

  return (
    <div style={{ maxWidth: '1440px', margin: '0 auto', padding: '1.5rem', width: '100%' }}>
      {/* Print Styles for Executive Report */}
      <style>{`
        @media print {
          body {
            background-color: #ffffff !important;
            color: #111827 !important;
          }
          .no-print {
            display: none !important;
          }
          .print-only {
            display: block !important;
          }
          * {
            box-shadow: none !important;
          }
          table {
            border-collapse: collapse !important;
            width: 100% !important;
          }
          th, td {
            border: 1px solid #e5e7eb !important;
          }
        }
        @media screen {
          .print-only {
            display: none !important;
          }
        }
      `}</style>

      {/* Top Admin Header */}
      <div className="no-print" style={{
        display: 'flex',
        flexWrap: 'wrap',
        alignItems: 'center',
        justifyContent: 'space-between',
        gap: '1.25rem',
        marginBottom: '2rem',
        borderBottom: '1px solid var(--border-color)',
        paddingBottom: '1.5rem',
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.65rem', flexWrap: 'wrap' }}>
          <button
            onClick={onBackToStorefront}
            className="btn-secondary"
            style={{ fontSize: '0.85rem', display: 'flex', alignItems: 'center', gap: '0.45rem', padding: '0.55rem 1.1rem' }}
          >
            <ArrowLeft size={16} /> Storefront
          </button>
          <button
            onClick={() => navigate('/track-order')}
            className="btn-secondary"
            style={{ fontSize: '0.85rem', display: 'flex', alignItems: 'center', gap: '0.45rem', padding: '0.55rem 1.1rem' }}
            title="Open Live Order Tracking Portal"
          >
            <Truck size={15} /> Track Order
          </button>
          <button
            onClick={() => navigate('/delivery')}
            className="btn-secondary"
            style={{ fontSize: '0.85rem', display: 'flex', alignItems: 'center', gap: '0.45rem', padding: '0.55rem 1.1rem' }}
            title="Switch to Courier Fleet Portal"
          >
            <span style={{ width: '6px', height: '6px', borderRadius: '50%', backgroundColor: '#10B981', display: 'inline-block' }} />
            <span>Courier Fleet</span>
          </button>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.65rem' }}>
              <h1 style={{ fontSize: '1.95rem', fontWeight: 900, margin: 0, letterSpacing: '-0.02em' }}>
                {store?.name || 'KHAAM POSHAK'} Executive Console
              </h1>
              <span style={{
                fontSize: '0.68rem',
                fontWeight: 800,
                backgroundColor: '#DCFCE7',
                color: '#15803D',
                padding: '0.2rem 0.6rem',
                borderRadius: '999px',
                border: '1px solid #86EFAC',
                display: 'inline-flex',
                alignItems: 'center',
                gap: '0.35rem',
              }}>
                <span style={{ width: '6px', height: '6px', borderRadius: '50%', backgroundColor: '#16A34A' }}></span>
                Live Sync Active
              </span>
            </div>
            <span style={{ fontSize: '0.82rem', color: 'var(--text-muted)', display: 'block', marginTop: '0.25rem' }}>
              {isSwitcherAllowed
                ? `Unified Platform Enterprise Management · Active Store: ${store?.name} · Currency Standard: PKR`
                : `Store Operations & Telemetry Center · ${store?.name} · Currency Standard: PKR`}
            </span>
          </div>
        </div>

        {/* Global Toolbar Actions */}
        <div style={{ display: 'flex', gap: '0.75rem', alignItems: 'center', flexWrap: 'wrap' }}>
          {/* PKR Currency Standard Badge */}
          <div style={{
            backgroundColor: '#ECFDF5',
            border: '1px solid #A7F3D0',
            color: '#065F46',
            borderRadius: 'var(--radius)',
            padding: '0.5rem 0.9rem',
            display: 'flex',
            alignItems: 'center',
            gap: '0.45rem',
            fontSize: '0.82rem',
            fontWeight: 800,
          }}>
            <Banknote size={16} />
            <span>PKR Standard (Rs.)</span>
          </div>

          {/* Export Executive CSV & Print - ONLY when Dashboard Overview tab is open */}
          {activeTab === 'overview' && (
            <>
              {/* Export Executive CSV */}
              <button
                onClick={handleExportCSV}
                title="Download executive CSV report with all intervals"
                className="no-print"
                style={{
                  padding: '0.55rem 1rem',
                  borderRadius: 'var(--radius)',
                  border: '1px solid var(--border-color)',
                  background: 'var(--surface)',
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '0.45rem',
                  fontSize: '0.82rem',
                  fontWeight: 700,
                  color: 'var(--text-color)',
                  transition: 'background 0.15s ease',
                }}
              >
                <Download size={15} color="var(--primary-color)" />
                <span>Export CSV</span>
              </button>

              {/* Print Summary */}
              <button
                onClick={handlePrintReport}
                title="Print executive overview report or save as PDF"
                className="no-print"
                style={{
                  padding: '0.55rem 0.9rem',
                  borderRadius: 'var(--radius)',
                  border: '1px solid var(--border-color)',
                  background: 'var(--surface)',
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '0.45rem',
                  fontSize: '0.82rem',
                  fontWeight: 700,
                  color: 'var(--text-color)',
                }}
              >
                <Printer size={15} />
                <span>Print</span>
              </button>
            </>
          )}

          {/* Refresh Button */}
          <button
            onClick={fetchStats}
            title="Refresh analytics telemetry"
            className="no-print"
            style={{
              padding: '0.55rem 0.85rem',
              borderRadius: 'var(--radius)',
              border: '1px solid var(--border-color)',
              background: 'var(--surface)',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              color: 'var(--text-muted)',
            }}
          >
            <RefreshCw size={15} className={loading ? 'animate-spin' : ''} />
          </button>
        </div>
      </div>

      {/* Export notification toast */}
      {exportNotice && (
        <div className="no-print" style={{
          backgroundColor: '#ECFDF5',
          border: '1px solid #10B981',
          color: '#065F46',
          padding: '0.75rem 1.25rem',
          borderRadius: '10px',
          marginBottom: '1.5rem',
          fontSize: '0.85rem',
          fontWeight: 700,
          display: 'flex',
          alignItems: 'center',
          gap: '0.5rem',
        }}>
          <CheckCircle2 size={18} color="#059669" />
          <span>{exportNotice}</span>
        </div>
      )}

      {/* Navigation Tabs */}
      <div className="no-print" style={{
        display: 'flex',
        gap: '0.5rem',
        borderBottom: '1px solid var(--border-color)',
        marginBottom: '2rem',
        overflowX: 'auto',
      }}>
        {tabs.map((tab) => {
          const Icon = tab.icon;
          const isActive = activeTab === tab.id;
          return (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '0.5rem',
                padding: '0.75rem 1.25rem',
                border: 'none',
                background: 'transparent',
                borderBottom: isActive ? '3px solid var(--primary-color)' : '3px solid transparent',
                color: isActive ? 'var(--primary-color)' : 'var(--text-muted)',
                fontWeight: isActive ? 800 : 600,
                fontSize: '0.92rem',
                cursor: 'pointer',
                whiteSpace: 'nowrap',
                transition: 'all 0.15s ease',
              }}
            >
              <Icon size={17} />
              <span>{tab.label}</span>
            </button>
          );
        })}
      </div>

      {/* TAB 1: OVERVIEW & ADVANCED TELEMETRY */}
      {activeTab === 'overview' && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '2rem' }}>
          {/* Print-Only Executive Header */}
          <div className="print-only" style={{
            marginBottom: '1rem',
            paddingBottom: '0.75rem',
            borderBottom: '2px solid #111827',
          }}>
            <h1 style={{ fontSize: '1.6rem', margin: 0, fontWeight: 900, color: '#111827' }}>
              KHAAM POSHAK Executive Business Telemetry Report
            </h1>
            <p style={{ margin: '0.35rem 0 0', fontSize: '0.85rem', color: '#4b5563' }}>
              Store Scope: <strong>{stats?.selected_store_name || store?.name}</strong> · Currency Standard: <strong>PKR (Rs.)</strong> · Period: <strong>{currentMetrics.label}</strong> · Generated: {new Date().toLocaleString()}
            </p>
          </div>

            <div style={{
              backgroundColor: 'var(--card-bg)',
              border: '1px solid var(--border-color)',
              borderRadius: '16px',
              padding: '1.5rem',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              flexWrap: 'wrap',
              gap: '1rem',
            }}>
              <div>
                <div style={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '0.4rem',
                  backgroundColor: 'var(--badge-bg)',
                  color: 'var(--badge-text)',
                  padding: '0.2rem 0.6rem',
                  borderRadius: '999px',
                  fontSize: '0.72rem',
                  fontWeight: 800,
                  textTransform: 'uppercase',
                  marginBottom: '0.35rem',
                }}>
                  <Sparkles size={12} /> Active Dedicated Storefront
                </div>
                <h2 style={{ fontSize: '1.35rem', margin: 0 }}>{store?.name}</h2>
                <p style={{ color: 'var(--text-muted)', fontSize: '0.85rem', margin: '0.25rem 0 0 0' }}>
                  {store?.tagline || 'Dedicated client storefront instance with automated order routing and courier dispatch.'}
                </p>
              </div>

              <div style={{ display: 'flex', gap: '1rem', flexWrap: 'wrap' }}>
                <div style={{ backgroundColor: 'var(--surface)', padding: '0.5rem 1rem', borderRadius: 'var(--radius)', border: '1px solid var(--border-color)', fontSize: '0.82rem' }}>
                  <div style={{ color: 'var(--text-muted)', fontSize: '0.72rem', fontWeight: 700, textTransform: 'uppercase' }}>Currency Standard</div>
                  <strong>PKR (Rs.)</strong>
                </div>
                <div style={{ backgroundColor: 'var(--surface)', padding: '0.5rem 1rem', borderRadius: 'var(--radius)', border: '1px solid var(--border-color)', fontSize: '0.82rem' }}>
                  <div style={{ color: 'var(--text-muted)', fontSize: '0.72rem', fontWeight: 700, textTransform: 'uppercase' }}>System Status</div>
                  <strong style={{ color: '#16A34A' }}>Live & Active</strong>
                </div>
              </div>
            </div>

          {/* ========================================================================= */}
          {/* TIMEFRAME SELECTOR TOOLBAR: Weekly | Monthly | Yearly | All Time (Day 1)  */}
          {/* ========================================================================= */}
          <div style={{
            backgroundColor: 'var(--card-bg)',
            border: '1px solid var(--border-color)',
            borderRadius: '16px',
            padding: '1.25rem 1.5rem',
            display: 'flex',
            flexWrap: 'wrap',
            alignItems: 'center',
            justifyContent: 'space-between',
            gap: '1rem',
            boxShadow: '0 2px 12px rgba(0,0,0,0.03)',
          }}>
            <div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                <Calendar size={19} color="var(--primary-color)" />
                <h3 style={{ fontSize: '1.15rem', fontWeight: 800, margin: 0 }}>
                  Analytics Reporting Window
                </h3>
              </div>
              <p style={{ margin: '0.2rem 0 0', fontSize: '0.82rem', color: 'var(--text-muted)' }}>
                Filter telemetry by duration. Business inception date: <strong>{stats?.first_order_date || 'Day 1'}</strong>.
              </p>
            </div>

            <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', flexWrap: 'wrap' }}>
              {/* Timeframe Button Pills */}
              <div style={{
                display: 'flex',
                gap: '0.4rem',
                backgroundColor: 'var(--surface)',
                padding: '0.35rem',
                borderRadius: '999px',
                border: '1px solid var(--border-color)',
              }}>
                {[
                  { id: 'weekly', label: 'Weekly (7 Days)' },
                  { id: 'monthly', label: 'Monthly (30 Days)' },
                  { id: 'yearly', label: 'Yearly (365 Days)' },
                  { id: 'all', label: `All-Time (From Day 1)` },
                ].map((tf) => {
                  const isActive = selectedTimeframe === tf.id;
                  return (
                    <button
                      key={tf.id}
                      onClick={() => setSelectedTimeframe(tf.id)}
                      style={{
                        padding: '0.5rem 1.15rem',
                        borderRadius: '999px',
                        fontSize: '0.82rem',
                        fontWeight: isActive ? 800 : 600,
                        cursor: 'pointer',
                        border: 'none',
                        backgroundColor: isActive ? 'var(--primary-color)' : 'transparent',
                        color: isActive ? 'var(--button-text)' : 'var(--text-muted)',
                        transition: 'all 0.15s ease',
                        boxShadow: isActive ? '0 2px 8px rgba(0,0,0,0.12)' : 'none',
                      }}
                    >
                      {tf.label}
                    </button>
                  );
                })}
              </div>

              {/* In-Tab Download CSV and Print buttons */}
              <div className="no-print" style={{ display: 'flex', gap: '0.45rem', alignItems: 'center' }}>
                <button
                  type="button"
                  onClick={handleExportCSV}
                  title="Download executive CSV report for this view"
                  style={{
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: '0.4rem',
                    padding: '0.5rem 0.95rem',
                    borderRadius: '999px',
                    border: '1px solid var(--border-color)',
                    backgroundColor: 'var(--surface)',
                    color: 'var(--text-color)',
                    fontSize: '0.8rem',
                    fontWeight: 700,
                    cursor: 'pointer',
                    transition: 'all 0.15s ease',
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.borderColor = 'var(--primary-color)';
                    e.currentTarget.style.color = 'var(--primary-color)';
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.borderColor = 'var(--border-color)';
                    e.currentTarget.style.color = 'var(--text-color)';
                  }}
                >
                  <Download size={14} color="var(--primary-color)" />
                  <span>Download CSV</span>
                </button>

                <button
                  type="button"
                  onClick={handlePrintReport}
                  title="Print executive overview report or save as PDF"
                  style={{
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: '0.4rem',
                    padding: '0.5rem 0.95rem',
                    borderRadius: '999px',
                    border: '1px solid var(--border-color)',
                    backgroundColor: 'var(--surface)',
                    color: 'var(--text-color)',
                    fontSize: '0.8rem',
                    fontWeight: 700,
                    cursor: 'pointer',
                    transition: 'all 0.15s ease',
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.borderColor = 'var(--primary-color)';
                    e.currentTarget.style.color = 'var(--primary-color)';
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.borderColor = 'var(--border-color)';
                    e.currentTarget.style.color = 'var(--text-color)';
                  }}
                >
                  <Printer size={14} />
                  <span>Print Report</span>
                </button>
              </div>
            </div>
          </div>

          {/* ========================================================================= */}
          {/* DYNAMIC EXECUTIVE SUMMARY BANNER (Active Window Insights)                 */}
          {/* ========================================================================= */}
          <div style={{
            backgroundColor: 'var(--surface)',
            border: '1px solid var(--border-color)',
            borderRadius: '14px',
            padding: '1rem 1.5rem',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            flexWrap: 'wrap',
            gap: '1rem',
          }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
              <div style={{
                width: '38px',
                height: '38px',
                borderRadius: '10px',
                backgroundColor: 'rgba(var(--primary-rgb, 16, 185, 129), 0.15)',
                color: 'var(--primary-color)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
              }}>
                <Activity size={20} />
              </div>
              <div>
                <div style={{ fontSize: '0.9rem', fontWeight: 800 }}>
                  Active Executive Summary · <span style={{ color: 'var(--primary-color)' }}>{currentMetrics.label}</span>
                </div>
                <div style={{ fontSize: '0.78rem', color: 'var(--text-muted)' }}>
                  Total gross traffic: <strong>{currentMetrics.total_orders} orders</strong>.
                  Net realized sales: <strong>{formatPrice(currentMetrics.total_revenue)}</strong> (excludes cancellations).
                </div>
              </div>
            </div>

            <div style={{ display: 'flex', alignItems: 'center', gap: '1.25rem', fontSize: '0.82rem', flexWrap: 'wrap' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                <span style={{ color: 'var(--text-muted)' }}>Delivery Fulfillment:</span>
                <span style={{ fontWeight: 800, color: '#16A34A' }}>
                  {currentMetrics.delivery_rate}% ({currentMetrics.delivered_count} fulfilled)
                </span>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                <span style={{ color: 'var(--text-muted)' }}>Voided / Cancelled:</span>
                <span style={{ fontWeight: 800, color: '#DC2626' }}>
                  {currentMetrics.cancelled_count} orders ({formatPrice(currentMetrics.cancelled_amount)} lost)
                </span>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                <span style={{ color: 'var(--text-muted)' }}>Average Ticket:</span>
                <span style={{ fontWeight: 800 }}>
                  {formatPrice(currentMetrics.aov)}
                </span>
              </div>
            </div>
          </div>

          {/* ========================================================================= */}
          {/* SECTION 1: FINANCIAL & REVENUE TELEMETRY (Top 4 Cards)                     */}
          {/* ========================================================================= */}
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.45rem', marginBottom: '1rem' }}>
              <Banknote size={18} color="var(--primary-color)" />
              <h3 style={{ fontSize: '1.05rem', fontWeight: 800, margin: 0, textTransform: 'uppercase', letterSpacing: '0.04em' }}>
                Commercial & Financial Performance ({currentMetrics.label})
              </h3>
            </div>

            <div style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))',
              gap: '1.25rem',
            }}>
              {/* Card 1: Net Realized Revenue */}
              <div style={{
                backgroundColor: 'var(--card-bg)',
                border: '1px solid var(--border-color)',
                borderRadius: '14px',
                padding: '1.35rem',
                display: 'flex',
                flexDirection: 'column',
                justifyContent: 'space-between',
                boxShadow: '0 4px 16px rgba(0,0,0,0.02)',
              }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '0.75rem' }}>
                  <div>
                    <span style={{ fontSize: '0.72rem', color: 'var(--text-muted)', textTransform: 'uppercase', fontWeight: 800 }}>
                      Net Realized Revenue
                    </span>
                    <div style={{ fontSize: '1.85rem', fontWeight: 900, color: 'var(--primary-color)', marginTop: '0.2rem' }}>
                      {formatPrice(currentMetrics.total_revenue)}
                    </div>
                  </div>
                  <div style={{
                    width: '42px',
                    height: '42px',
                    borderRadius: '10px',
                    backgroundColor: 'rgba(16, 185, 129, 0.12)',
                    color: '#059669',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                  }}>
                    <TrendingUp size={22} />
                  </div>
                </div>
                <div style={{ fontSize: '0.76rem', color: 'var(--text-muted)' }}>
                  Strictly excludes cancelled & refunded orders
                </div>
              </div>

              {/* Card 2: Average Order Value (AOV) */}
              <div style={{
                backgroundColor: 'var(--card-bg)',
                border: '1px solid var(--border-color)',
                borderRadius: '14px',
                padding: '1.35rem',
                display: 'flex',
                flexDirection: 'column',
                justifyContent: 'space-between',
                boxShadow: '0 4px 16px rgba(0,0,0,0.02)',
              }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '0.75rem' }}>
                  <div>
                    <span style={{ fontSize: '0.72rem', color: 'var(--text-muted)', textTransform: 'uppercase', fontWeight: 800 }}>
                      Average Order Value (AOV)
                    </span>
                    <div style={{ fontSize: '1.85rem', fontWeight: 900, marginTop: '0.2rem' }}>
                      {formatPrice(currentMetrics.aov)}
                    </div>
                  </div>
                  <div style={{
                    width: '42px',
                    height: '42px',
                    borderRadius: '10px',
                    backgroundColor: 'var(--surface)',
                    color: 'var(--primary-color)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                  }}>
                    <Activity size={22} />
                  </div>
                </div>
                <div style={{ fontSize: '0.76rem', color: 'var(--text-muted)' }}>
                  Mean transaction spend per shopper checkout
                </div>
              </div>

              {/* Card 3: Delivered Orders & Fulfilled Value */}
              <div style={{
                backgroundColor: 'var(--card-bg)',
                border: '1px solid #86EFAC',
                borderRadius: '14px',
                padding: '1.35rem',
                display: 'flex',
                flexDirection: 'column',
                justifyContent: 'space-between',
                boxShadow: '0 4px 16px rgba(0,0,0,0.02)',
              }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '0.75rem' }}>
                  <div>
                    <span style={{ fontSize: '0.72rem', color: '#166534', textTransform: 'uppercase', fontWeight: 800 }}>
                      Delivered & Cash Collected
                    </span>
                    <div style={{ fontSize: '1.85rem', fontWeight: 900, color: '#16A34A', marginTop: '0.2rem' }}>
                      {currentMetrics.delivered_count} Orders
                    </div>
                  </div>
                  <div style={{
                    width: '42px',
                    height: '42px',
                    borderRadius: '10px',
                    backgroundColor: '#DCFCE7',
                    color: '#16A34A',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                  }}>
                    <CheckCircle2 size={22} />
                  </div>
                </div>
                <div style={{ fontSize: '0.76rem', color: '#15803D', fontWeight: 700 }}>
                  Fulfilled Value: {formatPrice(currentMetrics.delivered_amount)} ({currentMetrics.delivery_rate}% Rate)
                </div>
              </div>

              {/* Card 4: Cancelled Orders & Lost Revenue */}
              <div style={{
                backgroundColor: 'var(--card-bg)',
                border: '1px solid #FCA5A5',
                borderRadius: '14px',
                padding: '1.35rem',
                display: 'flex',
                flexDirection: 'column',
                justifyContent: 'space-between',
                boxShadow: '0 4px 16px rgba(0,0,0,0.02)',
              }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '0.75rem' }}>
                  <div>
                    <span style={{ fontSize: '0.72rem', color: '#991B1B', textTransform: 'uppercase', fontWeight: 800 }}>
                      Cancelled & Voided Loss
                    </span>
                    <div style={{ fontSize: '1.85rem', fontWeight: 900, color: '#DC2626', marginTop: '0.2rem' }}>
                      {currentMetrics.cancelled_count} Orders
                    </div>
                  </div>
                  <div style={{
                    width: '42px',
                    height: '42px',
                    borderRadius: '10px',
                    backgroundColor: '#FEE2E2',
                    color: '#DC2626',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                  }}>
                    <XCircle size={22} />
                  </div>
                </div>
                <div style={{ fontSize: '0.76rem', color: '#B91C1C', fontWeight: 700 }}>
                  Forfeited Sales: {formatPrice(currentMetrics.cancelled_amount)} ({currentMetrics.cancellation_rate}% Rate)
                </div>
              </div>
            </div>
          </div>

          {/* ========================================================================= */}
          {/* SECTION 2: LOGISTICS THROUGHPUT & CAPACITY (Next 4 Cards)                  */}
          {/* ========================================================================= */}
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.45rem', marginBottom: '1rem' }}>
              <Truck size={18} color="var(--primary-color)" />
              <h3 style={{ fontSize: '1.05rem', fontWeight: 800, margin: 0, textTransform: 'uppercase', letterSpacing: '0.04em' }}>
                Logistics Pipeline & Platform Capacity
              </h3>
            </div>

            <div style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))',
              gap: '1.25rem',
            }}>
              {/* Card 5: Total Orders Placed */}
              <div style={{
                backgroundColor: 'var(--card-bg)',
                border: '1px solid var(--border-color)',
                borderRadius: '14px',
                padding: '1.35rem',
                display: 'flex',
                flexDirection: 'column',
                justifyContent: 'space-between',
              }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '0.75rem' }}>
                  <div>
                    <span style={{ fontSize: '0.72rem', color: 'var(--text-muted)', textTransform: 'uppercase', fontWeight: 800 }}>
                      Gross Orders Placed
                    </span>
                    <div style={{ fontSize: '1.85rem', fontWeight: 900, marginTop: '0.2rem' }}>
                      {currentMetrics.total_orders} Orders
                    </div>
                  </div>
                  <div style={{
                    width: '42px',
                    height: '42px',
                    borderRadius: '10px',
                    backgroundColor: 'var(--surface)',
                    color: 'var(--primary-color)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                  }}>
                    <ShoppingBag size={22} />
                  </div>
                </div>
                <div style={{ fontSize: '0.76rem', color: 'var(--text-muted)' }}>
                  100% verified through Phone OTP SMS Gateway
                </div>
              </div>

              {/* Card 6: In-Transit / Dispatched Orders */}
              <div style={{
                backgroundColor: 'var(--card-bg)',
                border: '1px solid var(--border-color)',
                borderRadius: '14px',
                padding: '1.35rem',
                display: 'flex',
                flexDirection: 'column',
                justifyContent: 'space-between',
              }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '0.75rem' }}>
                  <div>
                    <span style={{ fontSize: '0.72rem', color: '#B45309', textTransform: 'uppercase', fontWeight: 800 }}>
                      In-Transit Courier Pipeline
                    </span>
                    <div style={{ fontSize: '1.85rem', fontWeight: 900, color: '#D97706', marginTop: '0.2rem' }}>
                      {currentMetrics.in_transit_count} Orders
                    </div>
                  </div>
                  <div style={{
                    width: '42px',
                    height: '42px',
                    borderRadius: '10px',
                    backgroundColor: '#FEF3C7',
                    color: '#D97706',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                  }}>
                    <Truck size={22} />
                  </div>
                </div>
                <div style={{ fontSize: '0.76rem', color: 'var(--text-muted)' }}>
                  Active courier pipeline value: {formatPrice(currentMetrics.in_transit_amount)}
                </div>
              </div>

              {/* Card 7: Pending Processing */}
              <div style={{
                backgroundColor: 'var(--card-bg)',
                border: '1px solid var(--border-color)',
                borderRadius: '14px',
                padding: '1.35rem',
                display: 'flex',
                flexDirection: 'column',
                justifyContent: 'space-between',
              }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '0.75rem' }}>
                  <div>
                    <span style={{ fontSize: '0.72rem', color: '#1D4ED8', textTransform: 'uppercase', fontWeight: 800 }}>
                      Warehouse Pending Queue
                    </span>
                    <div style={{ fontSize: '1.85rem', fontWeight: 900, color: '#2563EB', marginTop: '0.2rem' }}>
                      {currentMetrics.pending_count} Orders
                    </div>
                  </div>
                  <div style={{
                    width: '42px',
                    height: '42px',
                    borderRadius: '10px',
                    backgroundColor: '#EFF6FF',
                    color: '#2563EB',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                  }}>
                    <Clock size={22} />
                  </div>
                </div>
                <div style={{ fontSize: '0.76rem', color: 'var(--text-muted)' }}>
                  Awaiting packing: {formatPrice(currentMetrics.pending_amount)}
                </div>
              </div>

              {/* Card 8: Customer Base & Catalog Inventory */}
              <div style={{
                backgroundColor: 'var(--card-bg)',
                border: '1px solid var(--border-color)',
                borderRadius: '14px',
                padding: '1.35rem',
                display: 'flex',
                flexDirection: 'column',
                justifyContent: 'space-between',
              }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '0.75rem' }}>
                  <div>
                    <span style={{ fontSize: '0.72rem', color: 'var(--text-muted)', textTransform: 'uppercase', fontWeight: 800 }}>
                      Customer Base & SKUs
                    </span>
                    <div style={{ fontSize: '1.85rem', fontWeight: 900, marginTop: '0.2rem' }}>
                      {stats?.total_customers || 0} Shoppers
                    </div>
                  </div>
                  <div style={{
                    width: '42px',
                    height: '42px',
                    borderRadius: '10px',
                    backgroundColor: 'var(--surface)',
                    color: 'var(--primary-color)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                  }}>
                    <Users size={22} />
                  </div>
                </div>
                <div style={{ fontSize: '0.76rem', color: 'var(--text-muted)' }}>
                  {stats?.catalog_total_products || 0} active catalog products across stores
                </div>
              </div>
            </div>
          </div>

          {/* ========================================================================= */}
          {/* SECTION 3: FULFILLMENT FUNNEL & OPERATIONAL HEALTH GAUGE                  */}
          {/* ========================================================================= */}
          <div style={{
            backgroundColor: 'var(--card-bg)',
            border: '1px solid var(--border-color)',
            borderRadius: '16px',
            padding: '1.75rem',
            boxShadow: '0 4px 20px rgba(0,0,0,0.03)',
          }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '0.75rem', marginBottom: '1.25rem' }}>
              <div>
                <h3 style={{ fontSize: '1.15rem', fontWeight: 800, margin: 0, display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                  <ShieldCheck size={20} color="var(--primary-color)" />
                  Operational Health & Fulfillment Funnel ({currentMetrics.label})
                </h3>
                <p style={{ margin: '0.2rem 0 0', fontSize: '0.82rem', color: 'var(--text-muted)' }}>
                  Proportional distribution of all incoming order requests through logistics stages.
                </p>
              </div>
              <div style={{ fontSize: '0.78rem', fontWeight: 700, color: 'var(--text-muted)' }}>
                Sample base: {currentMetrics.total_orders} total orders
              </div>
            </div>

            {/* Segmented Progress Bar */}
            <div style={{
              display: 'flex',
              height: '14px',
              borderRadius: '999px',
              overflow: 'hidden',
              backgroundColor: 'var(--surface)',
              border: '1px solid var(--border-color)',
              marginBottom: '1.5rem',
            }}>
              <div
                style={{ width: `${currentMetrics.delivery_rate}%`, backgroundColor: '#10B981', transition: 'width 0.4s ease' }}
                title={`Delivered: ${currentMetrics.delivery_rate}%`}
              />
              <div
                style={{ width: `${inTransitRate}%`, backgroundColor: '#F59E0B', transition: 'width 0.4s ease' }}
                title={`In Transit: ${inTransitRate}%`}
              />
              <div
                style={{ width: `${pendingRate}%`, backgroundColor: '#3B82F6', transition: 'width 0.4s ease' }}
                title={`Pending: ${pendingRate}%`}
              />
              <div
                style={{ width: `${currentMetrics.cancellation_rate}%`, backgroundColor: '#EF4444', transition: 'width 0.4s ease' }}
                title={`Cancelled: ${currentMetrics.cancellation_rate}%`}
              />
            </div>

            {/* Funnel 4 Pillars Breakdown */}
            <div style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))',
              gap: '1rem',
            }}>
              <div style={{ padding: '0.85rem 1rem', borderRadius: '10px', backgroundColor: '#ECFDF5', border: '1px solid #A7F3D0' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.45rem', color: '#065F46', fontSize: '0.78rem', fontWeight: 800 }}>
                  <span style={{ width: '8px', height: '8px', borderRadius: '50%', backgroundColor: '#10B981' }}></span>
                  DELIVERED / FULFILLED
                </div>
                <div style={{ fontSize: '1.25rem', fontWeight: 900, color: '#047857', marginTop: '0.35rem' }}>
                  {currentMetrics.delivered_count} Orders ({currentMetrics.delivery_rate}%)
                </div>
                <div style={{ fontSize: '0.75rem', color: '#065F46', marginTop: '0.15rem' }}>
                  Value: {formatPrice(currentMetrics.delivered_amount)}
                </div>
              </div>

              <div style={{ padding: '0.85rem 1rem', borderRadius: '10px', backgroundColor: '#FFFBEB', border: '1px solid #FDE68A' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.45rem', color: '#92400E', fontSize: '0.78rem', fontWeight: 800 }}>
                  <span style={{ width: '8px', height: '8px', borderRadius: '50%', backgroundColor: '#F59E0B' }}></span>
                  IN TRANSIT / DISPATCHED
                </div>
                <div style={{ fontSize: '1.25rem', fontWeight: 900, color: '#B45309', marginTop: '0.35rem' }}>
                  {currentMetrics.in_transit_count} Orders ({inTransitRate}%)
                </div>
                <div style={{ fontSize: '0.75rem', color: '#92400E', marginTop: '0.15rem' }}>
                  Value: {formatPrice(currentMetrics.in_transit_amount)}
                </div>
              </div>

              <div style={{ padding: '0.85rem 1rem', borderRadius: '10px', backgroundColor: '#EFF6FF', border: '1px solid #BFDBFE' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.45rem', color: '#1E40AF', fontSize: '0.78rem', fontWeight: 800 }}>
                  <span style={{ width: '8px', height: '8px', borderRadius: '50%', backgroundColor: '#3B82F6' }}></span>
                  PENDING PROCESSING
                </div>
                <div style={{ fontSize: '1.25rem', fontWeight: 900, color: '#1D4ED8', marginTop: '0.35rem' }}>
                  {currentMetrics.pending_count} Orders ({pendingRate}%)
                </div>
                <div style={{ fontSize: '0.75rem', color: '#1E40AF', marginTop: '0.15rem' }}>
                  Value: {formatPrice(currentMetrics.pending_amount)}
                </div>
              </div>

              <div style={{ padding: '0.85rem 1rem', borderRadius: '10px', backgroundColor: '#FEF2F2', border: '1px solid #FECACA' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.45rem', color: '#991B1B', fontSize: '0.78rem', fontWeight: 800 }}>
                  <span style={{ width: '8px', height: '8px', borderRadius: '50%', backgroundColor: '#EF4444' }}></span>
                  CANCELLED / VOIDED
                </div>
                <div style={{ fontSize: '1.25rem', fontWeight: 900, color: '#DC2626', marginTop: '0.35rem' }}>
                  {currentMetrics.cancelled_count} Orders ({currentMetrics.cancellation_rate}%)
                </div>
                <div style={{ fontSize: '0.75rem', color: '#991B1B', marginTop: '0.15rem' }}>
                  Lost: {formatPrice(currentMetrics.cancelled_amount)}
                </div>
              </div>
            </div>
          </div>

          {/* ========================================================================= */}
          {/* SECTION 4: VISUAL VELOCITY & TREND CHART (PKR & Orders Toggle)            */}
          {/* ========================================================================= */}
          <div style={{
            backgroundColor: 'var(--card-bg)',
            border: '1px solid var(--border-color)',
            borderRadius: '16px',
            padding: '2rem',
            boxShadow: '0 4px 20px rgba(0,0,0,0.03)',
          }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem', flexWrap: 'wrap', gap: '1rem' }}>
              <div>
                <h3 style={{ fontSize: '1.25rem', fontWeight: 800, margin: 0, display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                  <BarChart3 size={20} color="var(--primary-color)" />
                  Revenue & Order Trajectory ({currentMetrics.label})
                </h3>
                <p style={{ margin: '0.2rem 0 0', fontSize: '0.82rem', color: 'var(--text-muted)' }}>
                  Visual distribution of business velocity, fulfilled orders, and voided requests over time.
                </p>
              </div>

              {/* Chart Controls & Metric Switcher */}
              <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', flexWrap: 'wrap' }}>
                {/* Metric toggle */}
                <div style={{
                  display: 'flex',
                  backgroundColor: 'var(--surface)',
                  padding: '0.25rem',
                  borderRadius: '8px',
                  border: '1px solid var(--border-color)',
                  fontSize: '0.78rem',
                }}>
                  <button
                    onClick={() => setChartMetric('revenue')}
                    style={{
                      padding: '0.35rem 0.75rem',
                      borderRadius: '6px',
                      border: 'none',
                      backgroundColor: chartMetric === 'revenue' ? 'var(--primary-color)' : 'transparent',
                      color: chartMetric === 'revenue' ? 'var(--button-text)' : 'var(--text-muted)',
                      fontWeight: chartMetric === 'revenue' ? 800 : 600,
                      cursor: 'pointer',
                    }}
                  >
                    Revenue (PKR)
                  </button>
                  <button
                    onClick={() => setChartMetric('orders')}
                    style={{
                      padding: '0.35rem 0.75rem',
                      borderRadius: '6px',
                      border: 'none',
                      backgroundColor: chartMetric === 'orders' ? 'var(--primary-color)' : 'transparent',
                      color: chartMetric === 'orders' ? 'var(--button-text)' : 'var(--text-muted)',
                      fontWeight: chartMetric === 'orders' ? 800 : 600,
                      cursor: 'pointer',
                    }}
                  >
                    Order Volume
                  </button>
                </div>

                {/* Legend badges */}
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.85rem', fontSize: '0.78rem', fontWeight: 700 }}>
                  <span style={{ display: 'flex', alignItems: 'center', gap: '0.35rem' }}>
                    <span style={{ width: '10px', height: '10px', borderRadius: '2px', backgroundColor: 'var(--primary-color)' }}></span> Realized
                  </span>
                  <span style={{ display: 'flex', alignItems: 'center', gap: '0.35rem' }}>
                    <span style={{ width: '10px', height: '10px', borderRadius: '2px', backgroundColor: '#10B981' }}></span> Delivered
                  </span>
                  <span style={{ display: 'flex', alignItems: 'center', gap: '0.35rem' }}>
                    <span style={{ width: '10px', height: '10px', borderRadius: '2px', backgroundColor: '#EF4444' }}></span> Cancelled
                  </span>
                </div>
              </div>
            </div>

            {/* Peak Interval Callout */}
            {peakPoint && peakPoint.revenue > 0 && (
              <div style={{
                marginBottom: '1.25rem',
                fontSize: '0.8rem',
                color: 'var(--text-muted)',
                display: 'flex',
                gap: '1.5rem',
                flexWrap: 'wrap',
                padding: '0.65rem 1rem',
                borderRadius: '8px',
                backgroundColor: 'var(--surface)',
                border: '1px solid var(--border-color)',
              }}>
                <span>
                  🔥 <strong>Highest Velocity Interval:</strong> {peakPoint.label} ({formatPrice(peakPoint.revenue)} · {peakPoint.orders} orders)
                </span>
                <span>
                  📊 <strong>Chart Intervals:</strong> {chartPoints.length} reporting points
                </span>
                <span>
                  💰 <strong>Currency Standard:</strong> All amounts in PKR (Rs.)
                </span>
              </div>
            )}

            {chartPoints.length === 0 ? (
              <div style={{ padding: '3.5rem', textAlign: 'center', color: 'var(--text-muted)' }}>
                No transaction events recorded in this time window.
              </div>
            ) : (
              <div style={{
                display: 'grid',
                gridTemplateColumns: `repeat(${chartPoints.length}, minmax(0, 1fr))`,
                gap: '0.75rem',
                alignItems: 'flex-end',
                height: '240px',
                paddingTop: '2.5rem',
                borderBottom: '1px solid var(--border-color)',
              }}>
                {chartPoints.map((point, idx) => {
                  const val = chartMetric === 'revenue' ? point.revenue : point.orders;
                  const maxVal = chartMetric === 'revenue' ? maxRevenueInChart : maxOrdersInChart;
                  const heightPercent = Math.max(12, Math.min(100, Math.round((val / (maxVal || 1)) * 100)));

                  return (
                    <div
                      key={idx}
                      style={{
                        display: 'flex',
                        flexDirection: 'column',
                        alignItems: 'center',
                        height: '100%',
                        justifyContent: 'flex-end',
                      }}
                      title={`${point.label}: ${formatPrice(point.revenue)} (${point.orders} orders: ${point.delivered} delivered, ${point.cancelled} cancelled)`}
                    >
                      {/* Bar Value Top Tooltip */}
                      <span style={{
                        fontSize: '0.68rem',
                        fontWeight: 800,
                        color: 'var(--primary-color)',
                        marginBottom: '0.35rem',
                        whiteSpace: 'nowrap',
                      }}>
                        {chartMetric === 'revenue'
                          ? (point.revenue > 0 ? formatPrice(point.revenue) : 'Rs. 0')
                          : `${point.orders} ord`}
                      </span>

                      {/* Bar Graphic */}
                      <div style={{
                        width: '100%',
                        maxWidth: '46px',
                        height: `${heightPercent}%`,
                        backgroundColor: val > 0 ? 'var(--primary-color)' : 'var(--surface)',
                        borderRadius: '6px 6px 0 0',
                        transition: 'height 0.3s ease',
                        position: 'relative',
                        display: 'flex',
                        alignItems: 'flex-end',
                        justifyContent: 'center',
                        overflow: 'hidden',
                      }}>
                        {point.cancelled > 0 && (
                          <div
                            style={{
                              width: '100%',
                              height: '6px',
                              backgroundColor: '#EF4444',
                              position: 'absolute',
                              top: 0,
                            }}
                            title={`${point.cancelled} cancelled in this window`}
                          />
                        )}
                      </div>

                      {/* Bar Label */}
                      <span style={{
                        fontSize: '0.72rem',
                        fontWeight: 700,
                        color: 'var(--text-muted)',
                        marginTop: '0.55rem',
                        whiteSpace: 'nowrap',
                      }}>
                        {point.short_label}
                      </span>
                    </div>
                  );
                })}
              </div>
            )}
          </div>

          {/* ========================================================================= */}
          {/* SECTION 5: MASTER BENCHMARK MATRIX (Side-by-Side Comparison Table)        */}
          {/* ========================================================================= */}
          <div style={{
            backgroundColor: 'var(--card-bg)',
            border: '1px solid var(--border-color)',
            borderRadius: '16px',
            padding: '2rem',
            overflowX: 'auto',
            boxShadow: '0 4px 20px rgba(0,0,0,0.03)',
          }}>
            <div style={{ marginBottom: '1.25rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '0.5rem' }}>
              <div>
                <h3 style={{ fontSize: '1.25rem', fontWeight: 800, margin: 0, display: 'flex', alignItems: 'center', gap: '0.45rem' }}>
                  <FileSpreadsheet size={20} color="var(--primary-color)" />
                  Master Benchmark Matrix (Side-by-Side Reporting)
                </h3>
                <p style={{ margin: '0.2rem 0 0', fontSize: '0.82rem', color: 'var(--text-muted)' }}>
                  All figures standardized in Pakistani Rupee (PKR). Click any row to activate its timeframe.
                </p>
              </div>
              <span style={{
                fontSize: '0.72rem',
                fontWeight: 800,
                padding: '0.25rem 0.75rem',
                borderRadius: '999px',
                backgroundColor: '#ECFDF5',
                color: '#065F46',
                border: '1px solid #A7F3D0',
              }}>
                PKR TELEMETRY STANDARD
              </span>
            </div>

            <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', fontSize: '0.88rem' }}>
              <thead>
                <tr style={{ borderBottom: '2px solid var(--border-color)', backgroundColor: 'var(--surface)' }}>
                  <th style={{ padding: '0.85rem 1rem', fontWeight: 800, color: 'var(--text-muted)', textTransform: 'uppercase', fontSize: '0.74rem' }}>Period</th>
                  <th style={{ padding: '0.85rem 1rem', fontWeight: 800, color: 'var(--text-muted)', textTransform: 'uppercase', fontSize: '0.74rem' }}>Gross Orders</th>
                  <th style={{ padding: '0.85rem 1rem', fontWeight: 800, color: 'var(--text-muted)', textTransform: 'uppercase', fontSize: '0.74rem' }}>Delivered</th>
                  <th style={{ padding: '0.85rem 1rem', fontWeight: 800, color: 'var(--text-muted)', textTransform: 'uppercase', fontSize: '0.74rem' }}>In-Transit</th>
                  <th style={{ padding: '0.85rem 1rem', fontWeight: 800, color: 'var(--text-muted)', textTransform: 'uppercase', fontSize: '0.74rem' }}>Cancelled (Lost)</th>
                  <th style={{ padding: '0.85rem 1rem', fontWeight: 800, color: 'var(--text-muted)', textTransform: 'uppercase', fontSize: '0.74rem' }}>Fulfillment %</th>
                  <th style={{ padding: '0.85rem 1rem', fontWeight: 800, color: 'var(--text-muted)', textTransform: 'uppercase', fontSize: '0.74rem' }}>Net Realized Revenue</th>
                  <th style={{ padding: '0.85rem 1rem', fontWeight: 800, color: 'var(--text-muted)', textTransform: 'uppercase', fontSize: '0.74rem' }}>Average AOV</th>
                </tr>
              </thead>
              <tbody>
                {stats?.timeframes && Object.entries(stats.timeframes).map(([key, tf]) => {
                  const isCurrent = selectedTimeframe === key;
                  return (
                    <tr
                      key={key}
                      onClick={() => setSelectedTimeframe(key)}
                      style={{
                        borderBottom: '1px solid var(--border-color)',
                        backgroundColor: isCurrent ? 'rgba(var(--primary-rgb, 16, 185, 129), 0.07)' : 'transparent',
                        cursor: 'pointer',
                        transition: 'background 0.15s ease',
                      }}
                    >
                      <td style={{ padding: '1rem', fontWeight: 800 }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                          <span style={{ textTransform: 'capitalize' }}>{key}</span>
                          <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)', fontWeight: 500 }}>({tf.label})</span>
                          {isCurrent && (
                            <span style={{ fontSize: '0.65rem', backgroundColor: 'var(--primary-color)', color: 'var(--button-text)', padding: '0.12rem 0.45rem', borderRadius: '4px', fontWeight: 800 }}>
                              ACTIVE
                            </span>
                          )}
                        </div>
                      </td>
                      <td style={{ padding: '1rem', fontWeight: 700 }}>{tf.total_orders}</td>
                      <td style={{ padding: '1rem', color: '#16A34A', fontWeight: 700 }}>
                        {tf.delivered_count} ({formatPrice(tf.delivered_amount)})
                      </td>
                      <td style={{ padding: '1rem', color: '#D97706', fontWeight: 700 }}>
                        {tf.in_transit_count} ({formatPrice(tf.in_transit_amount)})
                      </td>
                      <td style={{ padding: '1rem', color: '#DC2626', fontWeight: 700 }}>
                        {tf.cancelled_count} ({formatPrice(tf.cancelled_amount)})
                      </td>
                      <td style={{ padding: '1rem', fontWeight: 800 }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                          <div style={{ width: '50px', height: '6px', borderRadius: '999px', backgroundColor: 'var(--surface)', overflow: 'hidden' }}>
                            <div style={{ width: `${tf.delivery_rate}%`, height: '100%', backgroundColor: '#10B981' }} />
                          </div>
                          <span style={{ color: tf.delivery_rate >= 50 ? '#16A34A' : '#D97706', fontSize: '0.84rem' }}>
                            {tf.delivery_rate}%
                          </span>
                        </div>
                      </td>
                      <td style={{ padding: '1rem', fontWeight: 900, color: 'var(--primary-color)', fontSize: '0.98rem' }}>
                        {formatPrice(tf.total_revenue)}
                      </td>
                      <td style={{ padding: '1rem', fontWeight: 700 }}>
                        {formatPrice(tf.aov)}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>

          {/* ========================================================================= */}
          {/* SECTION 6: PAYMENT GATEWAYS & ORDER FULFILLMENT TELEMETRY                 */}
          {/* ========================================================================= */}
          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(340px, 1fr))',
            gap: '1.5rem',
          }}>
            {/* Payment Method Breakdown */}
            <div style={{
              backgroundColor: 'var(--card-bg)',
              border: '1px solid var(--border-color)',
              borderRadius: '16px',
              padding: '1.75rem',
            }}>
              <h4 style={{ fontSize: '1.1rem', fontWeight: 800, marginBottom: '1.25rem', display: 'flex', alignItems: 'center', gap: '0.45rem' }}>
                <CreditCard size={18} color="var(--primary-color)" /> Payment Method Distribution
              </h4>

              <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                <div style={{
                  padding: '1rem 1.25rem',
                  borderRadius: '12px',
                  backgroundColor: 'var(--surface)',
                  border: '1px solid var(--border-color)',
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                    <div style={{ width: '40px', height: '40px', borderRadius: '10px', backgroundColor: '#ECFDF5', color: '#059669', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                      <Banknote size={20} />
                    </div>
                    <div>
                      <div style={{ fontWeight: 800, fontSize: '0.92rem' }}>Cash on Delivery (COD)</div>
                      <div style={{ fontSize: '0.76rem', color: 'var(--text-muted)' }}>
                        {stats?.payment_breakdown?.cod?.count || 0} Transactions
                      </div>
                    </div>
                  </div>
                  <span style={{ fontWeight: 900, fontSize: '1.05rem', color: '#059669' }}>
                    {formatPrice(stats?.payment_breakdown?.cod?.total_amount || 0)}
                  </span>
                </div>

                <div style={{
                  padding: '1rem 1.25rem',
                  borderRadius: '12px',
                  backgroundColor: 'var(--surface)',
                  border: '1px solid var(--border-color)',
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                    <div style={{ width: '40px', height: '40px', borderRadius: '10px', backgroundColor: '#EFF6FF', color: '#2563EB', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                      <CreditCard size={20} />
                    </div>
                    <div>
                      <div style={{ fontWeight: 800, fontSize: '0.92rem' }}>Online Card Payment</div>
                      <div style={{ fontSize: '0.76rem', color: 'var(--text-muted)' }}>
                        {stats?.payment_breakdown?.card?.count || 0} Transactions
                      </div>
                    </div>
                  </div>
                  <span style={{ fontWeight: 900, fontSize: '1.05rem', color: '#2563EB' }}>
                    {formatPrice(stats?.payment_breakdown?.card?.total_amount || 0)}
                  </span>
                </div>
              </div>
            </div>

            {/* Order Fulfillment & Delivery Telemetry */}
            <div style={{
              backgroundColor: 'var(--card-bg)',
              border: '1px solid var(--border-color)',
              borderRadius: '16px',
              padding: '1.75rem',
            }}>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1.25rem', flexWrap: 'wrap', gap: '0.5rem' }}>
                <h4 style={{ fontSize: '1.1rem', fontWeight: 800, margin: 0, display: 'flex', alignItems: 'center', gap: '0.45rem' }}>
                  <Truck size={18} color="var(--primary-color)" /> Order Fulfillment & Logistics (PKR)
                </h4>
                <span style={{
                  fontSize: '0.72rem',
                  fontWeight: 800,
                  backgroundColor: '#ECFDF5',
                  color: '#059669',
                  padding: '0.2rem 0.6rem',
                  borderRadius: '999px',
                  border: '1px solid #A7F3D0',
                }}>
                  {currentMetrics.delivery_rate}% Fulfillment Rate
                </span>
              </div>

              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.85rem' }}>
                {/* Delivered Orders */}
                <div style={{
                  padding: '0.85rem 1.15rem',
                  borderRadius: '12px',
                  backgroundColor: 'var(--surface)',
                  border: '1px solid var(--border-color)',
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                    <div style={{ width: '36px', height: '36px', borderRadius: '8px', backgroundColor: '#DCFCE7', color: '#15803D', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                      <CheckCircle2 size={18} />
                    </div>
                    <div>
                      <div style={{ fontWeight: 800, fontSize: '0.88rem' }}>Delivered Successfully</div>
                      <div style={{ fontSize: '0.74rem', color: 'var(--text-muted)' }}>
                        {currentMetrics.delivered_count} Completed Drops
                      </div>
                    </div>
                  </div>
                  <span style={{ fontWeight: 900, fontSize: '1rem', color: '#15803D' }}>
                    {formatPrice(currentMetrics.delivered_amount)}
                  </span>
                </div>

                {/* In Transit / Out for Delivery */}
                <div style={{
                  padding: '0.85rem 1.15rem',
                  borderRadius: '12px',
                  backgroundColor: 'var(--surface)',
                  border: '1px solid var(--border-color)',
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                    <div style={{ width: '36px', height: '36px', borderRadius: '8px', backgroundColor: '#EFF6FF', color: '#2563EB', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                      <Truck size={18} />
                    </div>
                    <div>
                      <div style={{ fontWeight: 800, fontSize: '0.88rem' }}>In Transit & Out for Delivery</div>
                      <div style={{ fontSize: '0.74rem', color: 'var(--text-muted)' }}>
                        {currentMetrics.in_transit_count} Active Courier Runs
                      </div>
                    </div>
                  </div>
                  <span style={{ fontWeight: 900, fontSize: '1rem', color: '#2563EB' }}>
                    {formatPrice(currentMetrics.in_transit_amount)}
                  </span>
                </div>

                {/* Pending & Processing */}
                <div style={{
                  padding: '0.85rem 1.15rem',
                  borderRadius: '12px',
                  backgroundColor: 'var(--surface)',
                  border: '1px solid var(--border-color)',
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                    <div style={{ width: '36px', height: '36px', borderRadius: '8px', backgroundColor: '#FEF3C7', color: '#D97706', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                      <Clock size={18} />
                    </div>
                    <div>
                      <div style={{ fontWeight: 800, fontSize: '0.88rem' }}>Order Placed & Processing</div>
                      <div style={{ fontSize: '0.74rem', color: 'var(--text-muted)' }}>
                        {currentMetrics.pending_count} Awaiting Courier Dispatch
                      </div>
                    </div>
                  </div>
                  <span style={{ fontWeight: 900, fontSize: '1rem', color: '#D97706' }}>
                    {formatPrice(currentMetrics.pending_amount)}
                  </span>
                </div>

                {/* Cancelled */}
                <div style={{
                  padding: '0.85rem 1.15rem',
                  borderRadius: '12px',
                  backgroundColor: 'var(--surface)',
                  border: '1px solid var(--border-color)',
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                    <div style={{ width: '36px', height: '36px', borderRadius: '8px', backgroundColor: '#FEE2E2', color: '#DC2626', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                      <XCircle size={18} />
                    </div>
                    <div>
                      <div style={{ fontWeight: 800, fontSize: '0.88rem' }}>Cancelled Orders</div>
                      <div style={{ fontSize: '0.74rem', color: 'var(--text-muted)' }}>
                        {currentMetrics.cancelled_count} Orders ({currentMetrics.cancellation_rate}% Rate)
                      </div>
                    </div>
                  </div>
                  <span style={{ fontWeight: 900, fontSize: '1rem', color: '#DC2626' }}>
                    {formatPrice(currentMetrics.cancelled_amount)}
                  </span>
                </div>
              </div>
            </div>
          </div>

          {/* ========================================================================= */}
          {/* SECTION 7: LIVE RECENT TRANSACTIONS STREAM (Direct Action to Orders)       */}
          {/* ========================================================================= */}
          <div style={{
            backgroundColor: 'var(--card-bg)',
            border: '1px solid var(--border-color)',
            borderRadius: '16px',
            padding: '2rem',
            boxShadow: '0 4px 20px rgba(0,0,0,0.03)',
          }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.25rem', flexWrap: 'wrap', gap: '0.5rem' }}>
              <div>
                <h3 style={{ fontSize: '1.25rem', fontWeight: 800, margin: 0, display: 'flex', alignItems: 'center', gap: '0.45rem' }}>
                  <ShoppingBag size={20} color="var(--primary-color)" />
                  Live Recent Orders Stream
                </h3>
                <p style={{ margin: '0.2rem 0 0', fontSize: '0.82rem', color: 'var(--text-muted)' }}>
                  Latest verified customer checkout transactions recorded in production database.
                </p>
              </div>

              <button
                onClick={() => setActiveTab('orders')}
                style={{
                  fontSize: '0.82rem',
                  fontWeight: 800,
                  color: 'var(--primary-color)',
                  backgroundColor: 'transparent',
                  border: 'none',
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '0.35rem',
                }}
              >
                <span>View Full Orders Tab</span>
                <ChevronRight size={16} />
              </button>
            </div>

            {(!stats?.recent_orders || stats.recent_orders.length === 0) ? (
              <div style={{ padding: '2.5rem', textAlign: 'center', color: 'var(--text-muted)' }}>
                No recent customer transactions found.
              </div>
            ) : (
              <div style={{ overflowX: 'auto' }}>
                <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', fontSize: '0.86rem' }}>
                  <thead>
                    <tr style={{ borderBottom: '2px solid var(--border-color)', backgroundColor: 'var(--surface)' }}>
                      <th style={{ padding: '0.75rem 1rem', fontWeight: 800, color: 'var(--text-muted)', textTransform: 'uppercase', fontSize: '0.72rem' }}>Order #</th>
                      <th style={{ padding: '0.75rem 1rem', fontWeight: 800, color: 'var(--text-muted)', textTransform: 'uppercase', fontSize: '0.72rem' }}>Customer & Contact</th>
                      <th style={{ padding: '0.75rem 1rem', fontWeight: 800, color: 'var(--text-muted)', textTransform: 'uppercase', fontSize: '0.72rem' }}>Date & Time</th>
                      <th style={{ padding: '0.75rem 1rem', fontWeight: 800, color: 'var(--text-muted)', textTransform: 'uppercase', fontSize: '0.72rem' }}>Payment</th>
                      <th style={{ padding: '0.75rem 1rem', fontWeight: 800, color: 'var(--text-muted)', textTransform: 'uppercase', fontSize: '0.72rem' }}>Status</th>
                      <th style={{ padding: '0.75rem 1rem', fontWeight: 800, color: 'var(--text-muted)', textTransform: 'uppercase', fontSize: '0.72rem' }}>Amount (PKR)</th>
                      <th style={{ padding: '0.75rem 1rem', fontWeight: 800, color: 'var(--text-muted)', textTransform: 'uppercase', fontSize: '0.72rem' }}>Action</th>
                    </tr>
                  </thead>
                  <tbody>
                    {stats.recent_orders.map((ord) => {
                      const isCancelled = ord.status === 'cancelled';
                      const isDelivered = ord.status === 'delivered';
                      const isInTransit = ord.status === 'shipped';
                      const isPending = ord.status === 'pending';

                      return (
                        <tr key={ord.id} style={{ borderBottom: '1px solid var(--border-color)' }}>
                          <td style={{ padding: '0.85rem 1rem', fontWeight: 800 }}>
                            #{ord.order_number || ord.id}
                          </td>
                          <td style={{ padding: '0.85rem 1rem' }}>
                            <div style={{ fontWeight: 700 }}>{ord.customer?.name || 'Guest Shopper'}</div>
                            <div style={{ fontSize: '0.74rem', color: 'var(--text-muted)' }}>
                              {ord.customer?.phone || ord.shipping_phone || 'No phone'}
                            </div>
                          </td>
                          <td style={{ padding: '0.85rem 1rem', fontSize: '0.78rem', color: 'var(--text-muted)' }}>
                            {new Date(ord.created_at).toLocaleDateString('en-US', {
                              month: 'short',
                              day: 'numeric',
                              year: 'numeric',
                              hour: '2-digit',
                              minute: '2-digit',
                            })}
                          </td>
                          <td style={{ padding: '0.85rem 1rem', fontSize: '0.8rem', fontWeight: 700 }}>
                            {ord.payment_method?.toUpperCase()}
                          </td>
                          <td style={{ padding: '0.85rem 1rem' }}>
                            <span style={{
                              fontSize: '0.72rem',
                              fontWeight: 800,
                              padding: '0.2rem 0.55rem',
                              borderRadius: '999px',
                              backgroundColor: isDelivered ? '#DCFCE7' : isCancelled ? '#FEE2E2' : isInTransit ? '#FEF3C7' : '#EFF6FF',
                              color: isDelivered ? '#166534' : isCancelled ? '#991B1B' : isInTransit ? '#92400E' : '#1E40AF',
                              border: isDelivered ? '1px solid #86EFAC' : isCancelled ? '1px solid #FCA5A5' : isInTransit ? '1px solid #FDE68A' : '1px solid #BFDBFE',
                              textTransform: 'uppercase',
                            }}>
                              {ord.status}
                            </span>
                          </td>
                          <td style={{
                            padding: '0.85rem 1rem',
                            fontWeight: 900,
                            color: isCancelled ? '#DC2626' : 'var(--text-color)',
                          }}>
                            {formatPrice(ord.final_amount)}
                          </td>
                          <td style={{ padding: '0.85rem 1rem' }}>
                            <button
                              onClick={() => setActiveTab('orders')}
                              className="btn-secondary"
                              style={{
                                padding: '0.3rem 0.65rem',
                                fontSize: '0.75rem',
                                fontWeight: 700,
                                display: 'inline-flex',
                                alignItems: 'center',
                                gap: '0.3rem',
                              }}
                            >
                              <span>Manage</span>
                              <ChevronRight size={13} />
                            </button>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            )}
          </div>

          {/* ========================================================================= */}
          {/* SECTION 8: TOP PERFORMING PRODUCTS SHOWCASE                                */}
          {/* ========================================================================= */}
          {stats?.top_products && stats.top_products.length > 0 && (
            <div style={{
              backgroundColor: 'var(--card-bg)',
              border: '1px solid var(--border-color)',
              borderRadius: '16px',
              padding: '2rem',
              boxShadow: '0 4px 20px rgba(0,0,0,0.03)',
            }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.25rem', flexWrap: 'wrap', gap: '0.5rem' }}>
                <div>
                  <h3 style={{ fontSize: '1.25rem', fontWeight: 800, margin: 0, display: 'flex', alignItems: 'center', gap: '0.45rem' }}>
                    <Flame size={20} color="#F59E0B" />
                    Top Performing Catalog Pieces
                  </h3>
                  <p style={{ margin: '0.2rem 0 0', fontSize: '0.82rem', color: 'var(--text-muted)' }}>
                    Most engaged customer products across the active store catalog.
                  </p>
                </div>
                <button
                  onClick={() => setActiveTab('products')}
                  style={{
                    fontSize: '0.82rem',
                    fontWeight: 800,
                    color: 'var(--primary-color)',
                    backgroundColor: 'transparent',
                    border: 'none',
                    cursor: 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '0.35rem',
                  }}
                >
                  <span>Manage Catalog</span>
                  <ChevronRight size={16} />
                </button>
              </div>

              <div style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))',
                gap: '1rem',
              }}>
                {stats.top_products.map((prod) => (
                  <div
                    key={prod.id}
                    style={{
                      padding: '1rem',
                      borderRadius: '12px',
                      backgroundColor: 'var(--surface)',
                      border: '1px solid var(--border-color)',
                      display: 'flex',
                      alignItems: 'center',
                      gap: '1rem',
                    }}
                  >
                    {prod.images && prod.images[0] ? (
                      <img
                        src={prod.images[0]}
                        alt={prod.name}
                        style={{
                          width: '54px',
                          height: '54px',
                          borderRadius: '8px',
                          objectFit: 'cover',
                          border: '1px solid var(--border-color)',
                        }}
                      />
                    ) : (
                      <div style={{
                        width: '54px',
                        height: '54px',
                        borderRadius: '8px',
                        backgroundColor: 'var(--card-bg)',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        border: '1px solid var(--border-color)',
                      }}>
                        <Package size={20} color="var(--text-muted)" />
                      </div>
                    )}
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <div style={{
                        fontWeight: 800,
                        fontSize: '0.88rem',
                        whiteSpace: 'nowrap',
                        overflow: 'hidden',
                        textOverflow: 'ellipsis',
                      }}>
                        {prod.name}
                      </div>
                      <div style={{ fontSize: '0.74rem', color: 'var(--text-muted)', marginTop: '0.15rem' }}>
                        SKU: {prod.sku || 'N/A'} · Stock: {prod.stock || 0} units
                      </div>
                      <div style={{ fontWeight: 900, color: 'var(--primary-color)', marginTop: '0.25rem', fontSize: '0.92rem' }}>
                        {formatPrice(prod.price)}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      )}

      {/* TAB 2: PRODUCTS */}
      {activeTab === 'products' && <ProductManager />}

      {/* TAB 3: CATEGORIES */}
      {activeTab === 'categories' && <CategoryManager />}

      {/* TAB 4: ORDERS */}
      {activeTab === 'orders' && <OrderManager />}

      {/* TAB 5: STAFF & EMPLOYEE IDS */}
      {activeTab === 'employees' && <EmployeeManager />}

      {/* TAB 6: VIP SUBSCRIBERS */}
      {activeTab === 'subscribers' && <SubscriberManager />}
    </div>
  );
}
