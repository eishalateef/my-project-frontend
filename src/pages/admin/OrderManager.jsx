import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useStore } from '../../context/StoreContext';
import {
  ShoppingBag,
  Phone,
  CheckCircle2,
  ChevronDown,
  ChevronUp,
  Truck,
  UserCheck,
  Search,
  RefreshCw,
  AlertCircle,
  MapPin,
  Calendar,
  Clock,
  DollarSign,
  Filter,
  Printer,
  CreditCard,
  Banknote,
  Ban,
  Eye,
  Sparkles,
} from 'lucide-react';
import ShippingInvoiceModal from '../../components/ShippingInvoiceModal';
import OrderDeliveryAssignment from '../../components/OrderDeliveryAssignment';
import AdminOrderDetailModal from '../../components/AdminOrderDetailModal';

export default function OrderManager() {
  const { formatPrice, store } = useStore();
  const [orders, setOrders] = useState([]);
  const [riders, setRiders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [expandedOrder, setExpandedOrder] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [error, setError] = useState(null);
  const [actionFeedback, setActionFeedback] = useState(null);
  const [printModalData, setPrintModalData] = useState(null);
  const [activeDetailOrder, setActiveDetailOrder] = useState(null);

  const handleDeliverySaved = (updatedOrder) => {
    setOrders((prev) =>
      prev.map((ord) => (ord.id === updatedOrder.id ? { ...ord, ...updatedOrder } : ord))
    );
    if (activeDetailOrder?.id === updatedOrder.id) {
      setActiveDetailOrder((prev) => ({ ...prev, ...updatedOrder }));
    }
    setActionFeedback(`Delivery assignment saved for Order #${updatedOrder.order_number}`);
    setTimeout(() => setActionFeedback(null), 3500);
  };

  const fetchOrders = async () => {
    try {
      setLoading(true);
      setError(null);
      const storeParam = store?.id ? `?store_id=${store.id}` : '';
      const [ordersRes, ridersRes] = await Promise.all([
        axios.get(`/api/admin/orders${storeParam}`),
        axios.get('/api/admin/riders'),
      ]);
      setOrders(ordersRes.data?.data || ordersRes.data || []);
      setRiders(ridersRes.data || []);
    } catch (err) {
      console.error('Failed to load orders or riders:', err);
      setError(err.response?.data?.message || err.message || 'Failed to load customer orders.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchOrders();
  }, [store?.id]);

  const handleStatusChange = async (orderId, newStatus) => {
    try {
      await axios.patch(`/api/admin/orders/${orderId}/status`, { status: newStatus });
      setActionFeedback(`Order #${orderId} status changed to ${newStatus.toUpperCase()}`);
      setTimeout(() => setActionFeedback(null), 3500);
      fetchOrders();
    } catch (err) {
      console.error('Failed to update order status:', err);
      alert('Error updating status: ' + (err.response?.data?.message || err.message));
    }
  };

  const handleAssignRider = async (orderId, riderId) => {
    try {
      await axios.patch(`/api/admin/orders/${orderId}/assign-rider`, { delivery_user_id: riderId });
      const assignedRider = riders.find((r) => r.id === Number(riderId));
      setActionFeedback(`Courier ${assignedRider?.name || ''} assigned to order #${orderId}`);
      setTimeout(() => setActionFeedback(null), 3500);
      fetchOrders();
    } catch (err) {
      console.error('Failed to assign courier:', err);
      alert('Failed to assign courier: ' + (err.response?.data?.message || err.message));
    }
  };

  const getStatusBadgeStyle = (status) => {
    switch (status) {
      case 'delivered':
        return { bg: '#DCFCE7', text: '#166534', border: '#86EFAC' };
      case 'shipped':
        return { bg: '#E0F2FE', text: '#075985', border: '#7DD3FC' };
      case 'processing':
        return { bg: '#FEF3C7', text: '#92400E', border: '#FDE68A' };
      case 'cancelled':
        return { bg: '#FEE2E2', text: '#991B1B', border: '#FCA5A5' };
      default:
        return { bg: '#F3F4F6', text: '#374151', border: '#E5E7EB' };
    }
  };

  // Filter orders by search & status
  const filteredOrders = orders.filter((o) => {
    const matchesStatus =
      statusFilter === 'all'
        ? true
        : statusFilter === 'flexipay'
        ? Boolean(o.is_installment)
        : o.status === statusFilter;

    const searchLower = searchTerm.toLowerCase().trim();
    if (!searchLower) return matchesStatus;

    const matchesSearch =
      (o.order_number && o.order_number.toLowerCase().includes(searchLower)) ||
      (o.phone && o.phone.toLowerCase().includes(searchLower)) ||
      (o.customer_cnic && o.customer_cnic.toLowerCase().includes(searchLower)) ||
      (o.customer?.name && o.customer.name.toLowerCase().includes(searchLower)) ||
      (o.shipping_address && o.shipping_address.toLowerCase().includes(searchLower));

    return matchesStatus && matchesSearch;
  });

  // State for multi-selection of orders
  const [selectedOrderIds, setSelectedOrderIds] = useState([]);

  // Check if an order is eligible for packing slip printing
  // (Only pending/processing orders; NOT shipped/delivered/cancelled)
  const isOrderPrintable = (order) => {
    if (!order) return false;
    const nonPrintableStatuses = ['shipped', 'delivered', 'cancelled'];
    if (nonPrintableStatuses.includes(order.status)) return false;
    if (['in_transit', 'delivered'].includes(order.delivery_status)) return false;
    return true;
  };

  const printableOrders = filteredOrders.filter(isOrderPrintable);
  const selectedPrintableOrders = filteredOrders.filter((o) => selectedOrderIds.includes(o.id) && isOrderPrintable(o));

  const toggleSelectOrder = (id) => {
    setSelectedOrderIds((prev) =>
      prev.includes(id) ? prev.filter((item) => item !== id) : [...prev, id]
    );
  };

  const handleSelectAllPrintable = () => {
    if (selectedOrderIds.length === printableOrders.length && printableOrders.length > 0) {
      setSelectedOrderIds([]);
    } else {
      setSelectedOrderIds(printableOrders.map((o) => o.id));
    }
  };

  const handlePrintSelected = () => {
    if (selectedPrintableOrders.length > 0) {
      setPrintModalData({ orders: selectedPrintableOrders });
    }
  };

  const handlePrintAllReady = () => {
    if (printableOrders.length > 0) {
      setPrintModalData({ orders: printableOrders });
    }
  };

  return (
    <div style={{
      backgroundColor: 'var(--card-bg)',
      border: '1px solid var(--border-color)',
      borderRadius: 'var(--radius)',
      padding: '2rem',
    }}>
      {/* Action Notification Toast */}
      {actionFeedback && (
        <div style={{
          backgroundColor: '#059669',
          color: '#ffffff',
          padding: '0.75rem 1.25rem',
          borderRadius: 'var(--radius)',
          fontSize: '0.85rem',
          fontWeight: 700,
          marginBottom: '1.25rem',
          display: 'flex',
          alignItems: 'center',
          gap: '0.5rem',
          boxShadow: '0 4px 15px rgba(5, 150, 105, 0.2)',
        }}>
          <CheckCircle2 size={16} />
          <span>{actionFeedback}</span>
        </div>
      )}

      {/* Header */}
      <div style={{
        marginBottom: '1.75rem',
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        flexWrap: 'wrap',
        gap: '1rem',
      }}>
        <div>
          <div style={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: '0.35rem',
            backgroundColor: 'var(--badge-bg)',
            color: 'var(--badge-text)',
            padding: '0.2rem 0.55rem',
            borderRadius: '999px',
            fontSize: '0.72rem',
            fontWeight: 800,
            textTransform: 'uppercase',
            marginBottom: '0.35rem',
          }}>
            <ShoppingBag size={12} /> Real-Time Orders
          </div>
          <h2 style={{ fontSize: '1.5rem', margin: 0 }}>Customer Orders & Courier Dispatch</h2>
          <p style={{ color: 'var(--text-muted)', fontSize: '0.85rem', marginTop: '0.25rem' }}>
            Review customer orders, inspect selected attributes, and assign packages to registered delivery riders.
          </p>
        </div>

        <div style={{ display: 'flex', gap: '0.75rem', alignItems: 'center' }}>
          <div style={{
            display: 'flex',
            gap: '0.5rem',
            alignItems: 'center',
            fontSize: '0.82rem',
            color: 'var(--text-muted)',
            backgroundColor: 'var(--surface)',
            padding: '0.45rem 0.85rem',
            borderRadius: 'var(--radius)',
            border: '1px solid var(--border-color)',
          }}>
            <Truck size={15} color="#059669" />
            <span>Active Couriers: <strong>{riders.length}</strong></span>
          </div>

          <button
            onClick={fetchOrders}
            className="btn-secondary"
            style={{
              padding: '0.45rem 0.85rem',
              fontSize: '0.82rem',
              display: 'flex',
              alignItems: 'center',
              gap: '0.4rem',
            }}
            title="Refresh Order List"
          >
            <RefreshCw size={14} className={loading ? 'spin' : ''} />
            <span>Refresh</span>
          </button>

          {/* Print Selected Orders Button (Priority when checkboxes checked) */}
          {selectedPrintableOrders.length > 0 && (
            <button
              onClick={handlePrintSelected}
              className="btn-primary"
              style={{
                padding: '0.45rem 1rem',
                fontSize: '0.82rem',
                display: 'flex',
                alignItems: 'center',
                gap: '0.45rem',
                fontWeight: 800,
                backgroundColor: '#059669',
                borderColor: '#059669',
                boxShadow: '0 2px 8px rgba(5, 150, 105, 0.25)',
              }}
              title={`Print Packing Slips for ${selectedPrintableOrders.length} selected orders`}
            >
              <Printer size={15} />
              <span>Print Selected ({selectedPrintableOrders.length})</span>
            </button>
          )}

          {/* Print All Ready Orders Button (Pending / Processing) */}
          {printableOrders.length > 0 && (
            <button
              onClick={handlePrintAllReady}
              className="btn-secondary"
              style={{
                padding: '0.45rem 0.95rem',
                fontSize: '0.82rem',
                display: 'flex',
                alignItems: 'center',
                gap: '0.45rem',
                fontWeight: 700,
              }}
              title={`Print Courier Packing Slips for all ${printableOrders.length} ready/pending orders`}
            >
              <Printer size={15} />
              <span>Print All Ready Slips ({printableOrders.length})</span>
            </button>
          )}
        </div>
      </div>

      {/* Filter & Search Bar */}
      <div style={{
        display: 'flex',
        flexWrap: 'wrap',
        alignItems: 'center',
        justifyContent: 'space-between',
        gap: '1rem',
        marginBottom: '1.5rem',
        padding: '0.85rem 1rem',
        backgroundColor: 'var(--surface)',
        borderRadius: 'var(--radius)',
        border: '1px solid var(--border-color)',
      }}>
        {/* Status Filter Tabs */}
        <div style={{ display: 'flex', gap: '0.35rem', flexWrap: 'wrap' }}>
          {['all', 'pending', 'processing', 'shipped', 'delivered', 'cancelled', 'flexipay'].map((st) => (
            <button
              key={st}
              onClick={() => setStatusFilter(st)}
              style={{
                padding: '0.35rem 0.75rem',
                borderRadius: '6px',
                border: statusFilter === st
                  ? st === 'flexipay' ? '1px solid #E35205' : '1px solid var(--primary-color)'
                  : '1px solid transparent',
                backgroundColor: statusFilter === st
                  ? st === 'flexipay' ? '#E35205' : 'var(--primary-color)'
                  : st === 'flexipay' ? '#FFFBEB' : 'transparent',
                color: statusFilter === st
                  ? '#FFFFFF'
                  : st === 'flexipay' ? '#B45309' : 'var(--text-muted)',
                fontSize: '0.78rem',
                fontWeight: 700,
                textTransform: 'capitalize',
                cursor: 'pointer',
                transition: 'all 0.15s ease',
                display: 'inline-flex',
                alignItems: 'center',
                gap: '0.3rem',
              }}
            >
              {st === 'flexipay' && <Sparkles size={12} />}
              <span>{st === 'flexipay' ? 'FlexiPay (4x)' : st}</span>
              {st === 'flexipay' && (
                <span style={{
                  fontSize: '0.65rem',
                  padding: '0.05rem 0.35rem',
                  borderRadius: '999px',
                  backgroundColor: statusFilter === 'flexipay' ? 'rgba(255,255,255,0.25)' : '#FDE68A',
                  color: statusFilter === 'flexipay' ? '#FFFFFF' : '#92400E',
                }}>
                  {orders.filter((o) => o.is_installment).length}
                </span>
              )}
            </button>
          ))}
        </div>

        {/* Search Input */}
        <div style={{ position: 'relative', minWidth: '260px' }}>
          <Search size={15} style={{ position: 'absolute', left: '10px', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }} />
          <input
            type="text"
            placeholder="Search order #, customer, phone..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="form-input"
            style={{ paddingLeft: '2rem', fontSize: '0.82rem', paddingBlock: '0.4rem' }}
          />
        </div>
      </div>

      {/* Error Alert */}
      {error && (
        <div style={{
          backgroundColor: '#FEF2F2',
          border: '1px solid #F87171',
          color: '#991B1B',
          padding: '1rem',
          borderRadius: 'var(--radius)',
          marginBottom: '1.5rem',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', fontSize: '0.85rem' }}>
            <AlertCircle size={18} />
            <span>{error}</span>
          </div>
          <button onClick={fetchOrders} className="btn-secondary" style={{ fontSize: '0.78rem', padding: '0.3rem 0.6rem' }}>
            Retry
          </button>
        </div>
      )}

      {/* Batch Packing Selection Toolbar */}
      {printableOrders.length > 0 && (
        <div style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          flexWrap: 'wrap',
          gap: '0.75rem',
          padding: '0.75rem 1rem',
          backgroundColor: selectedOrderIds.length > 0 ? '#f0fdf4' : 'var(--surface)',
          border: selectedOrderIds.length > 0 ? '1px solid #86efac' : '1px solid var(--border-color)',
          borderRadius: 'var(--radius)',
          marginBottom: '1.25rem',
          fontSize: '0.82rem',
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', flexWrap: 'wrap' }}>
            <label style={{ display: 'inline-flex', alignItems: 'center', gap: '0.45rem', cursor: 'pointer', fontWeight: 700 }}>
              <input
                type="checkbox"
                checked={printableOrders.length > 0 && selectedOrderIds.length === printableOrders.length}
                onChange={handleSelectAllPrintable}
                style={{ width: '16px', height: '16px', cursor: 'pointer', accentColor: 'var(--primary-color)' }}
              />
              <span>Select All Ready to Pack ({printableOrders.length})</span>
            </label>

            <span style={{ color: 'var(--text-muted)' }}>•</span>

            <span style={{ color: selectedOrderIds.length > 0 ? '#15803d' : 'var(--text-muted)', fontWeight: 600 }}>
              {selectedOrderIds.length} of {printableOrders.length} ready orders selected
            </span>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            {selectedOrderIds.length > 0 ? (
              <>
                <button
                  type="button"
                  onClick={handlePrintSelected}
                  style={{
                    backgroundColor: '#059669',
                    color: '#ffffff',
                    border: 'none',
                    padding: '0.4rem 0.95rem',
                    borderRadius: '6px',
                    fontWeight: 800,
                    fontSize: '0.8rem',
                    cursor: 'pointer',
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: '0.4rem',
                    boxShadow: '0 2px 6px rgba(5, 150, 105, 0.25)',
                  }}
                >
                  <Printer size={14} />
                  <span>Print Selected ({selectedOrderIds.length})</span>
                </button>

                <button
                  type="button"
                  onClick={() => setSelectedOrderIds([])}
                  style={{
                    background: 'transparent',
                    border: '1px solid #cbd5e1',
                    padding: '0.4rem 0.75rem',
                    borderRadius: '6px',
                    fontSize: '0.78rem',
                    cursor: 'pointer',
                    color: '#64748b',
                  }}
                >
                  Clear Selection
                </button>
              </>
            ) : (
              <button
                type="button"
                onClick={handlePrintAllReady}
                style={{
                  backgroundColor: 'var(--surface-hover)',
                  border: '1px solid var(--border-color)',
                  color: 'var(--text-main)',
                  padding: '0.4rem 0.95rem',
                  borderRadius: '6px',
                  fontWeight: 700,
                  fontSize: '0.8rem',
                  cursor: 'pointer',
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '0.4rem',
                }}
              >
                <Printer size={14} />
                <span>Print All Ready Slips ({printableOrders.length})</span>
              </button>
            )}
          </div>
        </div>
      )}

      {/* Orders List */}
      {loading ? (
        <div style={{ padding: '3.5rem', textAlign: 'center', color: 'var(--text-muted)' }}>
          <div className="spin" style={{ display: 'inline-block', marginBottom: '0.75rem' }}>
            <RefreshCw size={24} />
          </div>
          <div>Loading customer orders and delivery logistics...</div>
        </div>
      ) : filteredOrders.length === 0 ? (
        <div style={{
          padding: '3.5rem',
          textAlign: 'center',
          backgroundColor: 'var(--surface)',
          borderRadius: 'var(--radius)',
          border: '1px dashed var(--border-color)',
        }}>
          <ShoppingBag size={44} style={{ margin: '0 auto 1rem', opacity: 0.4 }} />
          <h3 style={{ fontSize: '1.15rem', marginBottom: '0.35rem' }}>
            {orders.length === 0 ? 'No Orders Yet' : 'No Orders Match Your Filters'}
          </h3>
          <p style={{ color: 'var(--text-muted)', fontSize: '0.85rem', maxWidth: '420px', margin: '0 auto' }}>
            {orders.length === 0
              ? 'When customers place orders on the storefront, their orders will appear here automatically in real-time.'
              : 'Try clearing the search box or selecting a different status filter tab above.'}
          </p>
        </div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
          {filteredOrders.map((o) => {
            const isExpanded = expandedOrder === o.id;
            const badge = getStatusBadgeStyle(o.status);

            return (
              <div
                key={o.id}
                style={{
                  border: '1px solid var(--border-color)',
                  borderRadius: 'var(--radius)',
                  overflow: 'hidden',
                  backgroundColor: 'var(--surface)',
                  transition: 'border-color 0.2s ease',
                }}
              >
                {/* Order Row Header */}
                <div
                  onClick={() => setExpandedOrder(isExpanded ? null : o.id)}
                  style={{
                    padding: '1.25rem',
                    display: 'flex',
                    flexWrap: 'wrap',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    cursor: 'pointer',
                    gap: '1rem',
                  }}
                >
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.85rem' }}>
                    {/* Multi-Selection Checkbox for printable orders */}
                    {isOrderPrintable(o) ? (
                      <input
                        type="checkbox"
                        checked={selectedOrderIds.includes(o.id)}
                        onChange={(e) => {
                          e.stopPropagation();
                          toggleSelectOrder(o.id);
                        }}
                        style={{
                          width: '18px',
                          height: '18px',
                          cursor: 'pointer',
                          accentColor: 'var(--primary-color)',
                          flexShrink: 0,
                        }}
                        title="Select order to print packing slip"
                      />
                    ) : (
                      <div
                        style={{
                          width: '18px',
                          height: '18px',
                          borderRadius: '4px',
                          border: '1px dashed #cbd5e1',
                          backgroundColor: '#f1f5f9',
                          flexShrink: 0,
                        }}
                        title={o.status === 'cancelled' ? 'Cancelled (Not printable)' : 'Dispatched (Slip already issued)'}
                      />
                    )}

                    <div>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '0.65rem', marginBottom: '0.35rem', flexWrap: 'wrap' }}>
                        <span style={{ fontWeight: 800, fontSize: '1.05rem', letterSpacing: '0.02em' }}>
                          {o.order_number}
                        </span>
                      <span style={{
                        padding: '0.2rem 0.65rem',
                        borderRadius: '999px',
                        fontSize: '0.72rem',
                        fontWeight: 800,
                        textTransform: 'uppercase',
                        backgroundColor: badge.bg,
                        color: badge.text,
                        border: `1px solid ${badge.border}`,
                      }}>
                        {o.status}
                      </span>
                      {o.delivery_status && (
                        <span style={{
                          padding: '0.2rem 0.55rem',
                          borderRadius: '6px',
                          fontSize: '0.7rem',
                          fontWeight: 700,
                          backgroundColor: '#EEF2FF',
                          color: '#4338CA',
                          border: '1px solid #C7D2FE',
                          display: 'inline-flex',
                          alignItems: 'center',
                          gap: '0.3rem',
                        }}>
                          <Truck size={12} strokeWidth={2} />
                          <span>{o.delivery_status.replace('_', ' ')}</span>
                        </span>
                      )}
                    </div>

                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.65rem', fontSize: '0.82rem', color: 'var(--text-muted)', flexWrap: 'wrap' }}>
                      <span><strong>{o.customer?.name || 'Customer'}</strong></span>
                      <span>•</span>
                      <span style={{ display: 'flex', alignItems: 'center', gap: '0.25rem', color: '#16A34A', fontWeight: 600 }}>
                        <CheckCircle2 size={13} /> {o.phone}
                      </span>
                      <span>•</span>
                      <span>Store: <em>{o.store?.name || store?.name}</em></span>
                      {o.created_at && (
                        <>
                          <span>•</span>
                          <span>{new Date(o.created_at).toLocaleDateString()}</span>
                        </>
                      )}
                    </div>
                  </div>
                </div>

                  <div style={{ display: 'flex', alignItems: 'center', gap: '1.25rem', flexWrap: 'wrap' }}>
                    {/* Price and Payment Method */}
                    <div style={{ textAlign: 'right' }}>
                      <div style={{ fontSize: '1.15rem', fontWeight: 900, color: 'var(--primary-color)' }}>
                        {formatPrice(o.final_amount)}
                      </div>
                      <div style={{
                        fontSize: '0.7rem',
                        color: 'var(--text-muted)',
                        fontWeight: 700,
                        textTransform: 'uppercase',
                        letterSpacing: '0.04em',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'flex-end',
                        gap: '0.3rem',
                      }}>
                        {o.is_installment ? (
                          <span style={{ color: '#E35205', fontWeight: 800, display: 'inline-flex', alignItems: 'center', gap: '0.25rem' }}>
                            <Sparkles size={11} />
                            <span>FlexiPay ({o.installments_paid || 1}/4 Paid)</span>
                          </span>
                        ) : o.payment_method === 'cod' ? (
                          <>
                            <Banknote size={12} />
                            <span>Cash on Delivery</span>
                          </>
                        ) : (
                          <>
                            <CreditCard size={12} />
                            <span>Online Prepaid</span>
                          </>
                        )}
                      </div>
                    </div>

                    {/* Delivery Route Badge & Quick Access */}
                    <div
                      onClick={(e) => {
                        e.stopPropagation();
                        setActiveDetailOrder(o);
                      }}
                      style={{ display: 'flex', flexDirection: 'column', gap: '0.2rem', cursor: 'pointer' }}
                      title="Click to open Order Details & Assign Delivery Type"
                    >
                      <span style={{ fontSize: '0.68rem', fontWeight: 800, color: 'var(--text-muted)', textTransform: 'uppercase' }}>
                        Delivery Route:
                      </span>
                      {o.delivery_type === 'third_party' ? (
                        <span
                          style={{
                            padding: '0.35rem 0.65rem',
                            borderRadius: '6px',
                            backgroundColor: '#EFF6FF',
                            color: '#1D4ED8',
                            border: '1px solid #BFDBFE',
                            fontSize: '0.74rem',
                            fontWeight: 800,
                            display: 'inline-flex',
                            alignItems: 'center',
                            gap: '0.35rem',
                            whiteSpace: 'nowrap',
                          }}
                        >
                          <Truck size={12} color="#1D4ED8" />
                          <span>3rd-Party: {o.assigned_to || 'Partner'}</span>
                        </span>
                      ) : o.delivery_type === 'own_rider' ? (
                        <span
                          style={{
                            padding: '0.35rem 0.65rem',
                            borderRadius: '6px',
                            backgroundColor: '#ECFDF5',
                            color: '#047857',
                            border: '1px solid #A7F3D0',
                            fontSize: '0.74rem',
                            fontWeight: 800,
                            display: 'inline-flex',
                            alignItems: 'center',
                            gap: '0.35rem',
                            whiteSpace: 'nowrap',
                          }}
                        >
                          <Truck size={12} color="#047857" />
                          <span>Own: {o.assigned_to || o.delivery_rider?.name || 'Rider'}</span>
                        </span>
                      ) : (
                        <span
                          style={{
                            padding: '0.35rem 0.65rem',
                            borderRadius: '6px',
                            backgroundColor: '#FFFBEB',
                            color: '#B45309',
                            border: '1px solid #FDE68A',
                            fontSize: '0.74rem',
                            fontWeight: 800,
                            display: 'inline-flex',
                            alignItems: 'center',
                            gap: '0.35rem',
                            whiteSpace: 'nowrap',
                          }}
                        >
                          <AlertCircle size={12} color="#B45309" />
                          <span>Assign Route</span>
                        </span>
                      )}
                    </div>

                    {/* Status Changer Dropdown */}
                    <div onClick={(e) => e.stopPropagation()} style={{ display: 'flex', flexDirection: 'column', gap: '0.2rem' }}>
                      <span style={{ fontSize: '0.68rem', fontWeight: 800, color: 'var(--text-muted)', textTransform: 'uppercase' }}>
                        Order Status:
                      </span>
                      <select
                        value={o.status}
                        onChange={(e) => handleStatusChange(o.id, e.target.value)}
                        className="form-input"
                        style={{ padding: '0.35rem 0.65rem', fontSize: '0.78rem', width: 'auto', cursor: 'pointer' }}
                      >
                        <option value="pending">Pending</option>
                        <option value="processing">Processing</option>
                        <option value="shipped">Shipped</option>
                        <option value="delivered">Delivered</option>
                        <option value="cancelled">Cancelled</option>
                      </select>
                    </div>

                    {/* 1-Click Print Slip or Dispatched / Cancelled Status */}
                    {isOrderPrintable(o) ? (
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          setPrintModalData({ order: o });
                        }}
                        className="btn-secondary"
                        style={{
                          padding: '0.35rem 0.65rem',
                          fontSize: '0.78rem',
                          fontWeight: 700,
                          display: 'flex',
                          alignItems: 'center',
                          gap: '0.35rem',
                          cursor: 'pointer',
                          borderColor: '#cbd5e1',
                        }}
                        title="1-Click Print Courier Packing Slip & Invoice"
                      >
                        <Printer size={14} color="var(--primary-color)" />
                        <span>Print Slip</span>
                      </button>
                    ) : o.status === 'cancelled' ? (
                      <span
                        style={{
                          fontSize: '0.72rem',
                          fontWeight: 700,
                          padding: '0.3rem 0.6rem',
                          borderRadius: '4px',
                          backgroundColor: '#FEE2E2',
                          color: '#B91C1C',
                          border: '1px solid #FCA5A5',
                          display: 'inline-flex',
                          alignItems: 'center',
                          gap: '0.3rem',
                        }}
                        title="Cancelled orders cannot be printed or dispatched"
                      >
                        <Ban size={12} strokeWidth={2} />
                        <span>Void</span>
                      </span>
                    ) : (
                      <span
                        style={{
                          fontSize: '0.72rem',
                          fontWeight: 700,
                          padding: '0.3rem 0.6rem',
                          borderRadius: '4px',
                          backgroundColor: '#F0FDF4',
                          color: '#15803D',
                          border: '1px solid #BBF7D0',
                          display: 'inline-flex',
                          alignItems: 'center',
                          gap: '0.3rem',
                        }}
                        title="Order already packed and dispatched to delivery"
                      >
                        <Truck size={12} strokeWidth={2} />
                        <span>Dispatched</span>
                      </span>
                    )}

                    {/* Live Track Parcel Button */}
                    <a
                      href={`/track-order?order_number=${o.order_number}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      onClick={(e) => e.stopPropagation()}
                      style={{
                        padding: '0.35rem 0.65rem',
                        fontSize: '0.76rem',
                        fontWeight: 700,
                        display: 'flex',
                        alignItems: 'center',
                        gap: '0.3rem',
                        backgroundColor: 'var(--surface)',
                        border: '1px solid var(--border-color)',
                        borderRadius: '6px',
                        color: 'var(--text-main)',
                        textDecoration: 'none',
                        cursor: 'pointer',
                      }}
                      title="Open Public Real-Time Tracking Timeline"
                    >
                      <Truck size={13} color="#E35205" />
                      <span>Track</span>
                    </a>

                    {/* View Order Details Modal Button */}
                    <button
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation();
                        setActiveDetailOrder(o);
                      }}
                      className="btn-secondary"
                      style={{
                        padding: '0.35rem 0.65rem',
                        fontSize: '0.76rem',
                        fontWeight: 700,
                        display: 'flex',
                        alignItems: 'center',
                        gap: '0.35rem',
                        cursor: 'pointer',
                        borderColor: '#cbd5e1',
                      }}
                      title="Open full Order Details page modal with Delivery Type Assignment"
                    >
                      <Eye size={13} color="var(--primary-color)" />
                      <span>Details</span>
                    </button>

                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        setExpandedOrder(isExpanded ? null : o.id);
                      }}
                      style={{ background: 'transparent', border: 'none', color: 'var(--text-muted)', cursor: 'pointer', padding: '0.25rem' }}
                      title={isExpanded ? 'Collapse' : 'Expand Order Details'}
                    >
                      {isExpanded ? <ChevronUp size={20} /> : <ChevronDown size={20} />}
                    </button>
                  </div>
                </div>

                {/* Expanded Details Section */}
                {isExpanded && (
                  <div style={{
                    padding: '1.5rem',
                    borderTop: '1px solid var(--border-color)',
                    backgroundColor: 'var(--card-bg)',
                    display: 'flex',
                    flexDirection: 'column',
                    gap: '1.25rem',
                  }}>
                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '1.25rem' }}>
                      {/* Destination Address */}
                      <div style={{ backgroundColor: 'var(--surface)', padding: '1rem', borderRadius: 'var(--radius)', border: '1px solid var(--border-color)' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', fontSize: '0.78rem', fontWeight: 800, color: 'var(--text-muted)', textTransform: 'uppercase', marginBottom: '0.5rem' }}>
                          <MapPin size={14} color="var(--primary-color)" /> Delivery Destination
                        </div>
                        <p style={{ fontSize: '0.9rem', margin: 0, fontWeight: 600 }}>{o.shipping_address}</p>
                        <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)', marginTop: '0.35rem' }}>
                          Recipient Phone: <strong>{o.phone}</strong>
                        </div>
                        {o.notes && (
                          <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)', marginTop: '0.35rem', fontStyle: 'italic' }}>
                            Customer Instructions: "{o.notes}"
                          </div>
                        )}
                      </div>

                      {/* FEATURE: Delivery Type Assignment (Admin Only) */}
                      <div>
                        <OrderDeliveryAssignment
                          order={o}
                          riders={riders}
                          onSaveSuccess={handleDeliverySaved}
                        />
                      </div>
                    </div>

                    {/* Order Line Items */}
                    <div>
                      <h4 style={{ fontSize: '0.82rem', fontWeight: 800, color: 'var(--text-muted)', textTransform: 'uppercase', marginBottom: '0.65rem' }}>
                        Items in Order ({o.items?.length || 0}):
                      </h4>
                      <div style={{ display: 'flex', flexDirection: 'column', gap: '0.45rem' }}>
                        {o.items?.map((item, idx) => (
                          <div key={idx} style={{
                            display: 'flex',
                            justifyContent: 'space-between',
                            alignItems: 'center',
                            fontSize: '0.88rem',
                            padding: '0.65rem 0.85rem',
                            backgroundColor: 'var(--surface)',
                            borderRadius: '6px',
                            border: '1px solid var(--border-color)',
                          }}>
                            <div>
                              <span style={{ fontWeight: 700 }}>{item.product_name}</span>
                              <span style={{ color: 'var(--text-muted)', marginLeft: '0.65rem', fontWeight: 600 }}>x {item.quantity}</span>
                              {item.selected_attributes && Object.keys(item.selected_attributes).length > 0 && (
                                <div style={{ fontSize: '0.78rem', color: 'var(--primary-color)', marginTop: '0.2rem', fontWeight: 600 }}>
                                  {Object.entries(item.selected_attributes).map(([k, v]) => `${k.toUpperCase()}: ${v}`).join(' · ')}
                                </div>
                              )}
                            </div>
                            <span style={{ fontWeight: 800, fontSize: '0.92rem' }}>
                              {formatPrice(item.subtotal || item.price * item.quantity)}
                            </span>
                          </div>
                        ))}
                      </div>
                    </div>

                    {/* Dispatch & Print Action Bar */}
                    <div style={{
                      display: 'flex',
                      justifyContent: 'space-between',
                      alignItems: 'center',
                      paddingTop: '1rem',
                      borderTop: '1px solid var(--border-color)',
                      flexWrap: 'wrap',
                      gap: '0.75rem',
                    }}>
                      <div style={{ fontSize: '0.78rem', color: 'var(--text-muted)' }}>
                        Order ID: <strong>#{o.id}</strong> · Status: <strong>{o.status.toUpperCase()}</strong> · Items: <strong>{o.items?.length || 0}</strong>
                      </div>

                      {isOrderPrintable(o) ? (
                        <button
                          type="button"
                          onClick={() => setPrintModalData({ order: o })}
                          className="btn-primary"
                          style={{
                            display: 'inline-flex',
                            alignItems: 'center',
                            gap: '0.5rem',
                            padding: '0.5rem 1.15rem',
                            fontSize: '0.84rem',
                            fontWeight: 800,
                          }}
                        >
                          <Printer size={16} />
                          <span>Print Courier Packing Slip & Invoice</span>
                        </button>
                      ) : o.status === 'cancelled' ? (
                        <div style={{
                          fontSize: '0.82rem',
                          fontWeight: 700,
                          color: '#B91C1C',
                          backgroundColor: '#FEE2E2',
                          padding: '0.4rem 0.75rem',
                          borderRadius: '6px',
                          border: '1px solid #FCA5A5',
                          display: 'flex',
                          alignItems: 'center',
                          gap: '0.35rem',
                        }}>
                          <Ban size={14} strokeWidth={2} />
                          <span>Order is cancelled — Fulfillment and packing are voided.</span>
                        </div>
                      ) : (
                        <div style={{
                          fontSize: '0.82rem',
                          fontWeight: 700,
                          color: '#0369a1',
                          backgroundColor: '#e0f2fe',
                          padding: '0.4rem 0.75rem',
                          borderRadius: '6px',
                          border: '1px solid #bae6fd',
                          display: 'flex',
                          alignItems: 'center',
                          gap: '0.35rem',
                        }}>
                          <Truck size={15} />
                          <span>Parcel already packed & out for delivery — slip issued.</span>
                        </div>
                      )}
                    </div>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}

      {/* 1-Click Courier Shipping Invoice & Packing Slip Modal */}
      {printModalData && (
        <ShippingInvoiceModal
          order={printModalData.order}
          orders={printModalData.orders}
          onClose={() => setPrintModalData(null)}
        />
      )}

      {/* Admin Order Details Page Modal */}
      {activeDetailOrder && (
        <AdminOrderDetailModal
          order={activeDetailOrder}
          riders={riders}
          onClose={() => setActiveDetailOrder(null)}
          onSaveDeliverySuccess={handleDeliverySaved}
          onPrintSlip={(ord) => setPrintModalData({ order: ord })}
          formatPrice={formatPrice}
        />
      )}
    </div>
  );
}
