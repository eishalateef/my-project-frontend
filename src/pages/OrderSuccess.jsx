import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import axios from 'axios';
import { useStore } from '../context/StoreContext';
import { CheckCircle2, PackageCheck, Truck, Phone, MapPin, ArrowRight, XCircle, AlertCircle, RefreshCw, Printer } from 'lucide-react';
import ShippingInvoiceModal from '../components/ShippingInvoiceModal';
import FlexiPayTracker from '../components/FlexiPayTracker';

export default function OrderSuccess({ order: initialOrder, onContinueShopping }) {
  const { orderId } = useParams();
  const navigate = useNavigate();
  const { storeType, formatPrice } = useStore();
  const [order, setOrder] = useState(initialOrder);
  const [showPrintModal, setShowPrintModal] = useState(false);

  const handleContinue = () => {
    if (onContinueShopping) onContinueShopping();
    else navigate('/');
  };

  // Poll for latest order status every few seconds or on mount
  useEffect(() => {
    const targetOrderNumber = initialOrder?.order_number || orderId;
    if (!targetOrderNumber) return;

    const checkLatestStatus = async () => {
      try {
        const res = await axios.get(`/api/orders/lookup/${targetOrderNumber}`);
        if (res.data?.order) {
          setOrder(res.data.order);
        }
      } catch (err) {
        // Ignore silent polling errors
      }
    };

    checkLatestStatus();
    const interval = setInterval(checkLatestStatus, 5000);
    return () => clearInterval(interval);
  }, [initialOrder?.order_number, orderId]);

  if (!order) {
    return (
      <div style={{ maxWidth: '600px', margin: '4rem auto', textAlign: 'center' }}>
        <h2>Order Confirmation</h2>
        <p>No active order found.</p>
        <button onClick={handleContinue} className="btn-primary" style={{ marginTop: '1rem' }}>
          Back to Store
        </button>
      </div>
    );
  }

  const isCancelled = order.status === 'cancelled' || order.delivery_status === 'failed';

  return (
    <div style={{ maxWidth: '800px', margin: '2rem auto', padding: '1.5rem', width: '100%' }}>
      <div style={{
        backgroundColor: 'var(--card-bg)',
        border: isCancelled ? '1px solid #FCA5A5' : '1px solid var(--border-color)',
        borderRadius: 'var(--radius)',
        padding: '2.5rem',
        boxShadow: 'var(--shadow-card)',
      }} className="animate-fade-in">
        {/* Status Header */}
        <div style={{ textAlign: 'center', marginBottom: '2rem' }}>
          <div style={{
            width: '64px',
            height: '64px',
            borderRadius: '50%',
            backgroundColor: isCancelled ? '#FEE2E2' : 'rgba(22, 163, 74, 0.1)',
            color: isCancelled ? '#DC2626' : '#16A34A',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            margin: '0 auto 1rem',
          }}>
            {isCancelled ? <XCircle size={38} /> : <CheckCircle2 size={38} />}
          </div>

          <span style={{
            fontSize: '0.8rem',
            fontWeight: 800,
            color: isCancelled ? '#DC2626' : 'var(--primary-color)',
            textTransform: 'uppercase',
            letterSpacing: '0.08em',
          }}>
            {isCancelled ? 'Order Cancelled & Voided' : 'Order Confirmed & Verified'}
          </span>

          <h1 style={{ fontSize: '2.2rem', marginTop: '0.25rem', marginBottom: '0.5rem', color: isCancelled ? '#991B1B' : 'inherit' }}>
            {isCancelled ? 'This Order Was Cancelled' : 'Thank You for Your Order!'}
          </h1>

          <p style={{ color: isCancelled ? '#B91C1C' : 'var(--text-muted)', fontSize: '0.95rem' }}>
            {isCancelled
              ? 'This order has been cancelled by the store administrator or customer request. No delivery will take place.'
              : 'Your order has been recorded in the database. An SMS confirmation was dispatched to your verified phone number.'}
          </p>
        </div>

        {/* Order Meta Box */}
        <div style={{
          backgroundColor: 'var(--surface)',
          border: '1px solid var(--border-color)',
          borderRadius: 'var(--radius)',
          padding: '1.25rem 1.5rem',
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(160px, 1fr))',
          gap: '1rem',
          marginBottom: '2rem',
        }}>
          <div>
            <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', textTransform: 'uppercase', fontWeight: 600 }}>
              Order Reference
            </div>
            <div style={{ fontSize: '1rem', fontWeight: 800, color: 'var(--primary-color)', fontFamily: 'monospace' }}>
              {order.order_number}
            </div>
          </div>

          <div>
            <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', textTransform: 'uppercase', fontWeight: 600 }}>
              Verified Phone
            </div>
            <div style={{ fontSize: '0.95rem', fontWeight: 700, display: 'flex', alignItems: 'center', gap: '0.3rem' }}>
              <Phone size={14} color="#16A34A" /> {order.phone}
            </div>
          </div>

          <div>
            <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', textTransform: 'uppercase', fontWeight: 600 }}>
              Payment Method & Status
            </div>
            <div style={{ fontSize: '0.95rem', fontWeight: 700, textTransform: 'capitalize', display: 'flex', alignItems: 'center', gap: '0.4rem', flexWrap: 'wrap' }}>
              <span>
                {order.payment_method === 'cod' ? 'Cash on Delivery' : order.payment_method === 'jazzcash' ? 'JazzCash' : order.payment_method === 'easypaisa' ? 'Easypaisa' : order.payment_method === 'payfast' ? 'PayFast (1Link)' : order.payment_method === 'safepay' ? 'Safepay' : 'Online Card'}
              </span>
              {order.payment_status === 'paid' ? (
                <span style={{ fontSize: '0.7rem', backgroundColor: '#DCFCE7', color: '#166534', padding: '0.15rem 0.5rem', borderRadius: '4px', fontWeight: 800 }}>
                  PAID ✓
                </span>
              ) : (
                <span style={{ fontSize: '0.7rem', backgroundColor: '#FEF3C7', color: '#92400E', padding: '0.15rem 0.5rem', borderRadius: '4px', fontWeight: 800 }}>
                  DUE ON DELIVERY
                </span>
              )}
            </div>
            {order.transaction_id && (
              <div style={{ fontSize: '0.7rem', color: 'var(--text-muted)', fontFamily: 'monospace', marginTop: '0.15rem' }}>
                Ref: {order.transaction_id}
              </div>
            )}
          </div>

          <div>
            <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', textTransform: 'uppercase', fontWeight: 600 }}>
              Total Amount
            </div>
            <div style={{ fontSize: '1.15rem', fontWeight: 900, color: storeType === 'jewelry' ? '#FFD700' : 'var(--primary-color)' }}>
              {formatPrice(order.final_amount)}
            </div>
          </div>

          {/* Destination Shipping Address */}
          {order.shipping_address && (
            <div style={{
              gridColumn: '1 / -1',
              paddingTop: '0.75rem',
              borderTop: '1px solid var(--border-color)',
              display: 'flex',
              alignItems: 'center',
              gap: '0.5rem',
              flexWrap: 'wrap',
            }}>
              <MapPin size={16} color="var(--primary-color)" />
              <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)', fontWeight: 600 }}>Shipping Destination:</span>
              <span style={{ fontSize: '0.88rem', fontWeight: 700, color: 'var(--text-color)' }}>
                {order.shipping_address}
              </span>
            </div>
          )}
        </div>

        {/* Tracking Timeline / Status Alert */}
        <div style={{ marginBottom: '2rem' }}>
          {isCancelled ? (
            <div style={{
              backgroundColor: '#FEF2F2',
              border: '1px solid #FCA5A5',
              borderRadius: 'var(--radius)',
              padding: '1.25rem 1.5rem',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              flexWrap: 'wrap',
              gap: '1rem',
            }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.85rem' }}>
                <AlertCircle size={24} color="#DC2626" />
                <div>
                  <h4 style={{ margin: 0, color: '#991B1B', fontSize: '0.95rem', fontWeight: 800 }}>
                    Order Cancelled & Voided
                  </h4>
                  <p style={{ margin: '0.2rem 0 0', color: '#B91C1C', fontSize: '0.82rem' }}>
                    All packaging, warehouse inspection, and courier delivery have been discontinued.
                  </p>
                </div>
              </div>
              <span style={{
                fontSize: '0.75rem',
                fontWeight: 800,
                padding: '0.25rem 0.75rem',
                borderRadius: '999px',
                backgroundColor: '#fff',
                color: '#DC2626',
                border: '1px solid #FCA5A5',
                textTransform: 'uppercase',
              }}>
                Voided
              </span>
            </div>
          ) : (
            <>
              <h3 style={{ fontSize: '1.05rem', marginBottom: '1rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                <Truck size={18} color="var(--primary-color)" /> Live Delivery Status
              </h3>

              <div style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(auto-fit, minmax(140px, 1fr))',
                gap: '0.75rem',
              }}>
                <div style={{
                  backgroundColor: 'var(--surface)',
                  border: '2px solid var(--primary-color)',
                  borderRadius: 'var(--radius)',
                  padding: '0.85rem',
                }}>
                  <div style={{ fontSize: '0.75rem', color: 'var(--primary-color)', fontWeight: 800 }}>STEP 1 • COMPLETED</div>
                  <div style={{ fontSize: '0.9rem', fontWeight: 700 }}>OTP Verified</div>
                  <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>Order confirmed</div>
                </div>

                <div style={{
                  backgroundColor: 'var(--surface)',
                  border: '1px solid var(--border-color)',
                  borderRadius: 'var(--radius)',
                  padding: '0.85rem',
                }}>
                  <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', fontWeight: 700 }}>STEP 2 • IN PROGRESS</div>
                  <div style={{ fontSize: '0.9rem', fontWeight: 700 }}>Atelier Packing</div>
                  <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>Quality inspection</div>
                </div>

                <div style={{
                  backgroundColor: 'var(--surface)',
                  border: '1px solid var(--border-color)',
                  borderRadius: 'var(--radius)',
                  padding: '0.85rem',
                }}>
                  <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', fontWeight: 700 }}>STEP 3 • UPCOMING</div>
                  <div style={{ fontSize: '0.9rem', fontWeight: 700 }}>Express Courier</div>
                  <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>Estimated 24-48 hrs</div>
                </div>
              </div>
            </>
          )}
        </div>

        {/* Order Items Breakdown */}
        {order.items && order.items.length > 0 && (
          <div style={{ borderTop: '1px solid var(--border-color)', paddingTop: '1.5rem', marginBottom: '2rem' }}>
            <h3 style={{ fontSize: '1.05rem', marginBottom: '1rem' }}>Items Ordered</h3>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.85rem' }}>
              {order.items.map((item, idx) => (
                <div key={idx} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', fontSize: '0.9rem' }}>
                  <div>
                    <span style={{ fontWeight: 600 }}>{item.product_name}</span>
                    <span style={{ color: 'var(--text-muted)', marginLeft: '0.5rem' }}>× {item.quantity}</span>
                    {item.selected_attributes && Object.keys(item.selected_attributes).length > 0 && (
                      <span style={{ fontSize: '0.78rem', color: 'var(--text-muted)', marginLeft: '0.5rem' }}>
                        ({Object.entries(item.selected_attributes).map(([k, v]) => `${k}: ${v}`).join(', ')})
                      </span>
                    )}
                  </div>
                  <span style={{ fontWeight: 700 }}>
                    {formatPrice(item.subtotal)}
                  </span>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* FlexiPay 4-Installment Engine & Tracker */}
        {order.is_installment && (
          <div style={{ marginBottom: '2rem' }}>
            <FlexiPayTracker
              order={order}
              installments={order.installments || []}
              onPaymentSuccess={(updated) => setOrder(updated)}
              formatPrice={formatPrice}
            />
          </div>
        )}

        {/* Action Buttons: Print Invoice & Return */}
        <div style={{
          display: 'flex',
          justifyContent: 'center',
          alignItems: 'center',
          gap: '1rem',
          flexWrap: 'wrap',
          borderTop: '1px solid var(--border-color)',
          paddingTop: '1.75rem',
        }}>
          <button
            type="button"
            onClick={() => navigate(`/track-order?order_number=${order.order_number}`)}
            className="btn-secondary"
            style={{
              padding: '0.85rem 1.85rem',
              fontSize: '0.95rem',
              display: 'inline-flex',
              alignItems: 'center',
              gap: '0.5rem',
              fontWeight: 700,
            }}
          >
            <Truck size={18} />
            <span>Track Live Parcel Progress</span>
          </button>

          <button
            type="button"
            onClick={() => setShowPrintModal(true)}
            className="btn-secondary"
            style={{
              padding: '0.85rem 1.85rem',
              fontSize: '0.95rem',
              display: 'inline-flex',
              alignItems: 'center',
              gap: '0.5rem',
              fontWeight: 700,
            }}
          >
            <Printer size={18} />
            <span>Print Official Invoice / Receipt</span>
          </button>

          <button
            onClick={onContinueShopping}
            className="btn-primary"
            style={{ padding: '0.85rem 2.25rem', fontSize: '0.95rem' }}
          >
            <span>Return to Storefront</span>
            <ArrowRight size={17} />
          </button>
        </div>
      </div>

      {/* 1-Click Shipping Invoice & Receipt Modal */}
      {showPrintModal && (
        <ShippingInvoiceModal
          order={order}
          onClose={() => setShowPrintModal(false)}
        />
      )}
    </div>
  );
}
