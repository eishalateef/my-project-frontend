import React from 'react';
import { createPortal } from 'react-dom';
import {
  X,
  Sparkles,
  ShieldCheck,
  Calendar,
  CreditCard,
  CheckCircle2,
  Clock,
  ArrowRight,
  Info,
} from 'lucide-react';

export default function FlexiPayModal({ isOpen, onClose, price = 0, formatPrice }) {
  if (!isOpen) return null;

  const installmentAmount = Math.round(price / 4);

  const schedule = [
    {
      num: 1,
      title: '1st Installment (Down Payment)',
      timing: 'Pay Today at Checkout',
      pct: '25%',
      desc: 'Your luxury order is verified and dispatched immediately.',
      badge: 'Due Today',
      badgeColor: '#16A34A',
      badgeBg: '#DCFCE7',
    },
    {
      num: 2,
      title: '2nd Installment',
      timing: 'After 30 Days',
      pct: '25%',
      desc: 'Pay easily online via JazzCash, Easypaisa, or Card.',
      badge: 'Month 1',
      badgeColor: '#2563EB',
      badgeBg: '#DBEAFE',
    },
    {
      num: 3,
      title: '3rd Installment',
      timing: 'After 60 Days',
      pct: '25%',
      desc: 'Automatic reminder sent to your registered phone number.',
      badge: 'Month 2',
      badgeColor: '#7C3AED',
      badgeBg: '#EDE9FE',
    },
    {
      num: 4,
      title: '4th Installment (Final)',
      timing: 'After 90 Days',
      pct: '25%',
      desc: 'Order contract fully settled with zero interest paid.',
      badge: 'Month 3',
      badgeColor: '#059669',
      badgeBg: '#D1FAE5',
    },
  ];

  return createPortal(
    <div
      style={{
        position: 'fixed',
        inset: 0,
        zIndex: 9999,
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
          borderRadius: '16px',
          width: '100%',
          maxWidth: '620px',
          maxHeight: '90vh',
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
            padding: '1.25rem 1.5rem',
            backgroundColor: '#FAF9F6',
            borderBottom: '1px solid #EBE9E5',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem' }}>
            <div
              style={{
                width: '32px',
                height: '32px',
                borderRadius: '8px',
                backgroundColor: '#111111',
                color: '#E35205',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
              }}
            >
              <Sparkles size={16} />
            </div>
            <div>
              <h3 style={{ fontSize: '1.1rem', fontWeight: 900, margin: 0, color: '#111111' }}>
                How FlexiPay 4-Installments Work
              </h3>
              <p style={{ fontSize: '0.75rem', color: '#6B665F', margin: 0 }}>
                KHAAM POSHAK • 0% Mark-up • Transparent E-Commerce Financing
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={onClose}
            style={{
              background: 'transparent',
              border: 'none',
              cursor: 'pointer',
              padding: '0.35rem',
              color: '#6B665F',
              borderRadius: '50%',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
            }}
            aria-label="Close"
          >
            <X size={20} />
          </button>
        </div>

        {/* Modal Scrollable Body */}
        <div style={{ padding: '1.5rem', overflowY: 'auto', display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
          
          {/* Price Breakdown Banner */}
          <div
            style={{
              backgroundColor: '#F8FAFC',
              border: '1px solid #E2E8F0',
              borderRadius: '12px',
              padding: '1.2rem',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              flexWrap: 'wrap',
              gap: '1rem',
            }}
          >
            <div>
              <div style={{ fontSize: '0.75rem', fontWeight: 700, color: '#64748B', textTransform: 'uppercase' }}>
                Total Outfit Price
              </div>
              <div style={{ fontSize: '1.4rem', fontWeight: 900, color: '#0F172A' }}>
                {formatPrice ? formatPrice(price) : `Rs. ${price.toLocaleString()}`}
              </div>
            </div>

            <div style={{ textAlign: 'right' }}>
              <div style={{ fontSize: '0.75rem', fontWeight: 700, color: '#059669', textTransform: 'uppercase' }}>
                4 Monthly Payments Of
              </div>
              <div style={{ fontSize: '1.4rem', fontWeight: 900, color: '#E35205' }}>
                {formatPrice ? formatPrice(installmentAmount) : `Rs. ${installmentAmount.toLocaleString()}`}
              </div>
            </div>
          </div>

          {/* 4-Step Schedule Cards */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
            <div style={{ fontSize: '0.82rem', fontWeight: 800, color: '#111111', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
              Repayment Timeline
            </div>

            {schedule.map((item) => (
              <div
                key={item.num}
                style={{
                  display: 'flex',
                  alignItems: 'flex-start',
                  gap: '0.9rem',
                  padding: '0.9rem 1rem',
                  borderRadius: '10px',
                  border: item.num === 1 ? '1.5px solid #16A34A' : '1px solid #E5E7EB',
                  backgroundColor: item.num === 1 ? '#F0FDF4' : '#FFFFFF',
                }}
              >
                <div
                  style={{
                    width: '32px',
                    height: '32px',
                    borderRadius: '50%',
                    backgroundColor: item.badgeBg,
                    color: item.badgeColor,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    fontWeight: 900,
                    fontSize: '0.85rem',
                    flexShrink: 0,
                  }}
                >
                  {item.num}
                </div>

                <div style={{ flex: 1 }}>
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '0.5rem' }}>
                    <div style={{ fontWeight: 800, fontSize: '0.9rem', color: '#111111' }}>
                      {item.title}
                    </div>
                    <div style={{ fontWeight: 900, fontSize: '0.92rem', color: '#111111' }}>
                      {formatPrice ? formatPrice(installmentAmount) : `Rs. ${installmentAmount.toLocaleString()}`}
                    </div>
                  </div>

                  <div style={{ fontSize: '0.75rem', color: '#64748B', marginTop: '0.15rem' }}>
                    {item.timing} • {item.desc}
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* Terms & Requirements */}
          <div
            style={{
              backgroundColor: '#FFFBEB',
              border: '1px solid #FDE68A',
              borderRadius: '10px',
              padding: '0.9rem 1rem',
              display: 'flex',
              gap: '0.75rem',
              fontSize: '0.78rem',
              color: '#92400E',
              lineHeight: 1.45,
            }}
          >
            <ShieldCheck size={18} style={{ flexShrink: 0, marginTop: '2px', color: '#D97706' }} />
            <div>
              <strong>What is required at Checkout?</strong>
              <ul style={{ margin: '0.35rem 0 0', paddingLeft: '1.1rem' }}>
                <li>Valid 13-digit Pakistani CNIC number (National ID).</li>
                <li>Alternate contact number for order verification.</li>
                <li>1st installment ({formatPrice ? formatPrice(installmentAmount) : `Rs. ${installmentAmount}`}) paid via JazzCash, Easypaisa, or Debit Card.</li>
                <li>Live online tracker to view and pay installments #2, #3, and #4 anytime.</li>
              </ul>
            </div>
          </div>

        </div>

        {/* Modal Footer */}
        <div
          style={{
            padding: '1rem 1.5rem',
            backgroundColor: '#FAF9F6',
            borderTop: '1px solid #EBE9E5',
            display: 'flex',
            justifyContent: 'flex-end',
          }}
        >
          <button
            type="button"
            onClick={onClose}
            style={{
              backgroundColor: '#111111',
              color: '#FFFFFF',
              border: 'none',
              borderRadius: '8px',
              padding: '0.65rem 1.5rem',
              fontSize: '0.85rem',
              fontWeight: 800,
              cursor: 'pointer',
            }}
          >
            Got It, Thanks!
          </button>
        </div>
      </div>
    </div>,
    document.body
  );
}
