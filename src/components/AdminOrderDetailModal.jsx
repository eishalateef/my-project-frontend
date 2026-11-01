import React from 'react';
import { createPortal } from 'react-dom';
import {
  X,
  MapPin,
  Phone,
  User,
  Calendar,
  Clock,
  CreditCard,
  Banknote,
  Package,
  Truck,
  ExternalLink,
  Printer,
  ShieldCheck,
  CheckCircle2,
} from 'lucide-react';
import OrderDeliveryAssignment, { getOrderCity } from './OrderDeliveryAssignment';
import AdminFlexiPayLedger from './AdminFlexiPayLedger';

export default function AdminOrderDetailModal({
  order,
  riders = [],
  onClose,
  onSaveDeliverySuccess,
  onPrintSlip,
  formatPrice,
}) {
  if (!order) return null;

  const customerCity = getOrderCity(order);
  const formattedDate = order.created_at
    ? new Date(order.created_at).toLocaleString('en-PK', {
        dateStyle: 'medium',
        timeStyle: 'short',
      })
    : 'Recent';

  const modalContent = (
    <div
      style={{
        position: 'fixed',
        inset: 0,
        zIndex: 1000,
        backgroundColor: 'rgba(0, 0, 0, 0.65)',
        backdropFilter: 'blur(6px)',
        WebkitBackdropFilter: 'blur(6px)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '1rem',
      }}
      onClick={onClose}
    >
      <div
        style={{
          backgroundColor: '#FFFFFF',
          borderRadius: '12px',
          width: '100%',
          maxWidth: '860px',
          maxHeight: '92vh',
          display: 'flex',
          flexDirection: 'column',
          boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.35)',
          overflow: 'hidden',
          border: '1px solid #E5E7EB',
          animation: 'modalSlideUp 0.25s cubic-bezier(0.16, 1, 0.3, 1)',
        }}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Modal Top Header */}
        <div
          style={{
            padding: '1.25rem 1.75rem',
            borderBottom: '1px solid #ECEAE7',
            backgroundColor: '#FAF9F6',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            flexWrap: 'wrap',
            gap: '1rem',
          }}
        >
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.65rem' }}>
              <h2 style={{ fontSize: '1.25rem', fontWeight: 900, color: '#111111', margin: 0, letterSpacing: '0.02em' }}>
                Order Details — {order.order_number}
              </h2>
              <span
                style={{
                  fontSize: '0.72rem',
                  fontWeight: 800,
                  padding: '0.2rem 0.6rem',
                  borderRadius: '999px',
                  backgroundColor: '#DCFCE7',
                  color: '#15803D',
                  border: '1px solid #86EFAC',
                  textTransform: 'uppercase',
                  letterSpacing: '0.05em',
                }}
              >
                {order.status}
              </span>
            </div>
            <div style={{ fontSize: '0.78rem', color: '#6B665F', marginTop: '0.2rem', display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
              <span>Placed: {formattedDate}</span>
              <span>•</span>
              <span>Payment: {order.payment_method === 'cod' ? 'Cash on Delivery (COD)' : 'Prepaid Online'}</span>
            </div>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            {onPrintSlip && (
              <button
                type="button"
                onClick={() => onPrintSlip(order)}
                className="btn-secondary"
                style={{
                  padding: '0.42rem 0.85rem',
                  fontSize: '0.78rem',
                  fontWeight: 700,
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '0.35rem',
                  cursor: 'pointer',
                }}
              >
                <Printer size={14} />
                <span>Print Slip</span>
              </button>
            )}

            <a
              href={`/track-order?order_number=${order.order_number}`}
              target="_blank"
              rel="noopener noreferrer"
              style={{
                padding: '0.42rem 0.85rem',
                fontSize: '0.78rem',
                fontWeight: 700,
                display: 'inline-flex',
                alignItems: 'center',
                gap: '0.35rem',
                backgroundColor: '#111111',
                color: '#FFFFFF',
                borderRadius: '6px',
                textDecoration: 'none',
              }}
            >
              <ExternalLink size={13} />
              <span>Track Live</span>
            </a>

            <button
              type="button"
              onClick={onClose}
              style={{
                background: 'transparent',
                border: 'none',
                cursor: 'pointer',
                padding: '0.4rem',
                color: '#6B665F',
                borderRadius: '50%',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
              }}
              aria-label="Close dialog"
            >
              <X size={20} />
            </button>
          </div>
        </div>

        {/* Modal Scrollable Body */}
        <div style={{ padding: '1.75rem', overflowY: 'auto', display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
          {/* 1. FEATURE SPOTLIGHT: Delivery Type Assignment (Admin Only) */}
          <section>
            <OrderDeliveryAssignment
              order={order}
              riders={riders}
              onSaveSuccess={onSaveDeliverySuccess}
            />
          </section>

          {/* 2. Customer & Delivery Destination Details */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '1.25rem' }}>
            <div style={{ backgroundColor: '#F9FAFB', border: '1px solid #E5E7EB', borderRadius: '8px', padding: '1.25rem' }}>
              <div style={{ fontSize: '0.76rem', fontWeight: 800, color: '#6B7280', textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: '0.65rem', display: 'flex', alignItems: 'center', gap: '0.35rem' }}>
                <User size={14} color="#111827" /> Customer Details
              </div>
              <div style={{ fontWeight: 800, fontSize: '0.98rem', color: '#111827' }}>
                {order.customer?.name || 'Customer'}
              </div>
              <div style={{ fontSize: '0.84rem', color: '#4B5563', marginTop: '0.35rem', display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                <Phone size={13} />
                <span>{order.phone || order.customer?.phone || 'N/A'}</span>
              </div>
              <div style={{ fontSize: '0.84rem', color: '#4B5563', marginTop: '0.2rem' }}>
                {order.customer?.email || 'No email provided'}
              </div>
            </div>

            <div style={{ backgroundColor: '#F9FAFB', border: '1px solid #E5E7EB', borderRadius: '8px', padding: '1.25rem' }}>
              <div style={{ fontSize: '0.76rem', fontWeight: 800, color: '#6B7280', textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: '0.65rem', display: 'flex', alignItems: 'center', gap: '0.35rem' }}>
                <MapPin size={14} color="#111827" /> Destination & City Routing
              </div>
              <div style={{ fontWeight: 700, fontSize: '0.92rem', color: '#111827' }}>
                {order.shipping_address}
              </div>
              <div style={{ fontSize: '0.82rem', marginTop: '0.45rem', color: '#1E40AF', backgroundColor: '#EFF6FF', border: '1px solid #DBEAFE', padding: '0.25rem 0.65rem', borderRadius: '4px', display: 'inline-block' }}>
                Routing City: <strong>{customerCity}</strong>
              </div>
              {order.notes && (
                <div style={{ fontSize: '0.8rem', color: '#6B7280', marginTop: '0.45rem', fontStyle: 'italic' }}>
                  Customer Note: "{order.notes}"
                </div>
              )}
            </div>
          </div>

          {/* 2.5 FEATURE SPOTLIGHT: FlexiPay 4-Installment Ledger & Recovery (Admin Only) */}
          {order.is_installment && (
            <section>
              <AdminFlexiPayLedger
                order={order}
                onOrderUpdated={onSaveDeliverySuccess}
                formatPrice={formatPrice}
              />
            </section>
          )}

          {/* 3. Items in Order Table */}
          <div>
            <h4 style={{ fontSize: '0.82rem', fontWeight: 800, color: '#6B7280', textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: '0.65rem' }}>
              Package Items ({order.items?.length || 0})
            </h4>
            <div style={{ border: '1px solid #E5E7EB', borderRadius: '8px', overflow: 'hidden' }}>
              <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', fontSize: '0.86rem' }}>
                <thead>
                  <tr style={{ backgroundColor: '#F9FAFB', borderBottom: '1px solid #E5E7EB', color: '#4B5563', fontSize: '0.74rem', textTransform: 'uppercase' }}>
                    <th style={{ padding: '0.75rem 1rem' }}>Item Description</th>
                    <th style={{ padding: '0.75rem 1rem', textAlign: 'center' }}>Qty</th>
                    <th style={{ padding: '0.75rem 1rem', textAlign: 'right' }}>Unit Price</th>
                    <th style={{ padding: '0.75rem 1rem', textAlign: 'right' }}>Total</th>
                  </tr>
                </thead>
                <tbody>
                  {order.items?.map((item, idx) => (
                    <tr key={idx} style={{ borderBottom: idx < order.items.length - 1 ? '1px solid #F3F4F6' : 'none' }}>
                      <td style={{ padding: '0.85rem 1rem' }}>
                        <div style={{ fontWeight: 700, color: '#111827' }}>{item.product_name}</div>
                        {item.selected_attributes && Object.keys(item.selected_attributes).length > 0 && (
                          <div style={{ fontSize: '0.76rem', color: '#E35205', marginTop: '0.2rem' }}>
                            {Object.entries(item.selected_attributes).map(([k, v]) => `${k.toUpperCase()}: ${v}`).join(' · ')}
                          </div>
                        )}
                      </td>
                      <td style={{ padding: '0.85rem 1rem', textAlign: 'center', fontWeight: 700 }}>
                        {item.quantity}
                      </td>
                      <td style={{ padding: '0.85rem 1rem', textAlign: 'right', color: '#6B7280' }}>
                        {formatPrice ? formatPrice(item.price) : `Rs. ${item.price}`}
                      </td>
                      <td style={{ padding: '0.85rem 1rem', textAlign: 'right', fontWeight: 800, color: '#111827' }}>
                        {formatPrice ? formatPrice(item.subtotal || item.price * item.quantity) : `Rs. ${item.subtotal || item.price * item.quantity}`}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {/* 4. Financial Totals */}
          <div style={{ display: 'flex', justifyContent: 'flex-end' }}>
            <div style={{ width: '280px', display: 'flex', flexDirection: 'column', gap: '0.4rem', fontSize: '0.86rem' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', color: '#6B7280' }}>
                <span>Subtotal:</span>
                <span>{formatPrice ? formatPrice(order.total_amount) : `Rs. ${order.total_amount}`}</span>
              </div>
              {order.discount_amount > 0 && (
                <div style={{ display: 'flex', justifyContent: 'space-between', color: '#15803D' }}>
                  <span>Discount:</span>
                  <span>-{formatPrice ? formatPrice(order.discount_amount) : `Rs. ${order.discount_amount}`}</span>
                </div>
              )}
              <div style={{ display: 'flex', justifyContent: 'space-between', color: '#6B7280' }}>
                <span>Shipping:</span>
                <span>{order.shipping_cost > 0 ? (formatPrice ? formatPrice(order.shipping_cost) : `Rs. ${order.shipping_cost}`) : 'FREE'}</span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', fontWeight: 900, fontSize: '1.05rem', color: '#111111', borderTop: '2px solid #E5E7EB', paddingTop: '0.5rem', marginTop: '0.25rem' }}>
                <span>Final Total:</span>
                <span style={{ color: '#E35205' }}>{formatPrice ? formatPrice(order.final_amount) : `Rs. ${order.final_amount}`}</span>
              </div>
            </div>
          </div>
        </div>

        {/* Modal Bottom Footer */}
        <div
          style={{
            padding: '1rem 1.75rem',
            borderTop: '1px solid #ECEAE7',
            backgroundColor: '#FAF9F6',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
          }}
        >
          <div style={{ fontSize: '0.78rem', color: '#6B665F' }}>
            Order ID: #{order.id} · Store: <strong>{order.store?.name || 'KHAAM POSHAK'}</strong>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="btn-secondary"
            style={{ padding: '0.45rem 1.25rem', fontSize: '0.82rem', fontWeight: 700, cursor: 'pointer' }}
          >
            Close Details
          </button>
        </div>
      </div>
    </div>
  );

  return createPortal(modalContent, document.body);
}
