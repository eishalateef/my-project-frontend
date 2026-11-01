import React, { useState } from 'react';
import api from '../api/axios';
import {
  Sparkles,
  CheckCircle2,
  Clock,
  AlertCircle,
  CreditCard,
  Calendar,
  ShieldCheck,
  ChevronRight,
  ArrowRight,
  RefreshCw,
  X,
  Lock,
} from 'lucide-react';

export default function FlexiPayTracker({
  order,
  installments: initialInstallments = [],
  onPaymentSuccess,
  formatPrice,
}) {
  if (!order || !order.is_installment) return null;

  const [installments, setInstallments] = useState(
    initialInstallments.length > 0 ? initialInstallments : order.installments || []
  );
  const [payingInstallment, setPayingInstallment] = useState(null);
  const [selectedGateway, setSelectedGateway] = useState('jazzcash');
  const [accountNumber, setAccountNumber] = useState(order.phone || '');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [actionError, setActionError] = useState(null);
  const [actionSuccess, setActionSuccess] = useState(null);

  const totalAmount = order.final_amount || 0;
  const paidInstallments = installments.filter((i) => i.status === 'paid');
  const paidAmount = paidInstallments.reduce((acc, curr) => acc + (parseFloat(curr.amount) || 0), 0);
  const remainingAmount = Math.max(0, totalAmount - paidAmount);
  const percentPaid = totalAmount > 0 ? Math.round((paidAmount / totalAmount) * 100) : 0;
  const isCompleted = order.installment_status === 'completed' || paidInstallments.length >= (order.total_installments || 4);

  const handlePayInstallment = async (e) => {
    e.preventDefault();
    if (!payingInstallment) return;

    setIsSubmitting(true);
    setActionError(null);
    setActionSuccess(null);

    try {
      const res = await api.post(`/api/installments/${payingInstallment.id}/pay`, {
        payment_method: selectedGateway,
        account_number: accountNumber,
      });

      if (res.data?.success) {
        setActionSuccess(res.data.message || `Installment #${payingInstallment.installment_number} paid successfully!`);
        
        // Update local state
        setInstallments((prev) =>
          prev.map((inst) =>
            inst.id === payingInstallment.id ? res.data.installment : inst
          )
        );

        if (onPaymentSuccess) {
          onPaymentSuccess(res.data.order || order);
        }

        setTimeout(() => {
          setPayingInstallment(null);
          setActionSuccess(null);
        }, 1800);
      } else {
        setActionError(res.data?.message || 'Payment processing failed. Please try again.');
      }
    } catch (err) {
      setActionError(err.response?.data?.message || 'Payment failed. Please verify your payment details and retry.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div
      style={{
        backgroundColor: '#FFFFFF',
        border: '1.5px solid #E2E8F0',
        borderRadius: '14px',
        padding: '1.5rem',
        boxShadow: '0 4px 20px -2px rgba(0, 0, 0, 0.05)',
        marginTop: '1.5rem',
      }}
    >
      {/* Top Banner */}
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          flexWrap: 'wrap',
          gap: '1rem',
          paddingBottom: '1.25rem',
          borderBottom: '1px solid #F1F5F9',
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.65rem' }}>
          <div
            style={{
              width: '36px',
              height: '36px',
              borderRadius: '8px',
              backgroundColor: '#111111',
              color: '#E35205',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
            }}
          >
            <Sparkles size={18} />
          </div>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <h3 style={{ fontSize: '1.15rem', fontWeight: 900, color: '#0F172A', margin: 0 }}>
                FlexiPay 4-Installment Ledger
              </h3>
              <span
                style={{
                  fontSize: '0.7rem',
                  fontWeight: 800,
                  padding: '0.2rem 0.55rem',
                  borderRadius: '999px',
                  backgroundColor: isCompleted ? '#DCFCE7' : '#EFF6FF',
                  color: isCompleted ? '#166534' : '#1D4ED8',
                  border: isCompleted ? '1px solid #86EFAC' : '1px solid #BFDBFE',
                  textTransform: 'uppercase',
                  letterSpacing: '0.04em',
                }}
              >
                {isCompleted ? 'All Paid & Settled' : `${paidInstallments.length} of ${order.total_installments || 4} Settled`}
              </span>
            </div>
            <p style={{ fontSize: '0.78rem', color: '#64748B', margin: '0.15rem 0 0' }}>
              Order #{order.order_number} • 0% Interest • Guaranteed Repayment Ledger
            </p>
          </div>
        </div>

        {order.customer_cnic && (
          <div
            style={{
              backgroundColor: '#F8FAFC',
              border: '1px solid #E2E8F0',
              borderRadius: '6px',
              padding: '0.35rem 0.65rem',
              fontSize: '0.75rem',
              fontWeight: 700,
              color: '#334155',
            }}
          >
            Registered CNIC: <strong>{order.customer_cnic}</strong>
          </div>
        )}
      </div>

      {/* Progress & Financial Overview */}
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(140px, 1fr))',
          gap: '1rem',
          margin: '1.25rem 0',
          backgroundColor: '#FAF9F6',
          borderRadius: '10px',
          padding: '1rem',
          border: '1px solid #ECEAE7',
        }}
      >
        <div>
          <div style={{ fontSize: '0.72rem', color: '#6B665F', fontWeight: 700, textTransform: 'uppercase' }}>
            Total Contract Price
          </div>
          <div style={{ fontSize: '1.2rem', fontWeight: 900, color: '#111111', marginTop: '0.15rem' }}>
            {formatPrice ? formatPrice(totalAmount) : `Rs. ${totalAmount.toLocaleString()}`}
          </div>
        </div>

        <div>
          <div style={{ fontSize: '0.72rem', color: '#15803D', fontWeight: 700, textTransform: 'uppercase' }}>
            Total Amount Paid
          </div>
          <div style={{ fontSize: '1.2rem', fontWeight: 900, color: '#16A34A', marginTop: '0.15rem' }}>
            {formatPrice ? formatPrice(paidAmount) : `Rs. ${paidAmount.toLocaleString()}`}
          </div>
        </div>

        <div>
          <div style={{ fontSize: '0.72rem', color: '#B45309', fontWeight: 700, textTransform: 'uppercase' }}>
            Remaining Balance
          </div>
          <div style={{ fontSize: '1.2rem', fontWeight: 900, color: remainingAmount === 0 ? '#16A34A' : '#E35205', marginTop: '0.15rem' }}>
            {formatPrice ? formatPrice(remainingAmount) : `Rs. ${remainingAmount.toLocaleString()}`}
          </div>
        </div>

        <div>
          <div style={{ fontSize: '0.72rem', color: '#475569', fontWeight: 700, textTransform: 'uppercase' }}>
            Payment Progress
          </div>
          <div style={{ fontSize: '1.2rem', fontWeight: 900, color: '#0F172A', marginTop: '0.15rem' }}>
            {percentPaid}%
          </div>
        </div>
      </div>

      {/* 4-Step Segmented Bar */}
      <div style={{ marginBottom: '1.5rem' }}>
        <div style={{ display: 'flex', gap: '6px', height: '10px', borderRadius: '5px', overflow: 'hidden' }}>
          {[1, 2, 3, 4].map((step) => {
            const isStepPaid = paidInstallments.some((i) => i.installment_number === step);
            return (
              <div
                key={step}
                style={{
                  flex: 1,
                  backgroundColor: isStepPaid ? '#16A34A' : '#E2E8F0',
                  borderRadius: '3px',
                  transition: 'all 0.3s ease',
                }}
                title={`Installment ${step}: ${isStepPaid ? 'Paid' : 'Pending'}`}
              />
            );
          })}
        </div>
      </div>

      {/* Installment List Cards */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
        {installments.map((inst) => {
          const isPaid = inst.status === 'paid';
          const isOverdue = inst.status === 'overdue';
          const dueDateFormatted = inst.due_date
            ? new Date(inst.due_date).toLocaleDateString('en-PK', { month: 'short', day: 'numeric', year: 'numeric' })
            : 'Scheduled';
          const paidDateFormatted = inst.paid_at
            ? new Date(inst.paid_at).toLocaleDateString('en-PK', { month: 'short', day: 'numeric', year: 'numeric' })
            : null;

          return (
            <div
              key={inst.id || inst.installment_number}
              style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                flexWrap: 'wrap',
                gap: '0.75rem',
                padding: '0.9rem 1.1rem',
                borderRadius: '10px',
                border: isPaid
                  ? '1px solid #BBF7D0'
                  : isOverdue
                  ? '1px solid #FECACA'
                  : '1px solid #E2E8F0',
                backgroundColor: isPaid ? '#F0FDF4' : isOverdue ? '#FEF2F2' : '#FFFFFF',
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.85rem' }}>
                <div
                  style={{
                    width: '34px',
                    height: '34px',
                    borderRadius: '50%',
                    backgroundColor: isPaid ? '#DCFCE7' : isOverdue ? '#FEE2E2' : '#F1F5F9',
                    color: isPaid ? '#16A34A' : isOverdue ? '#DC2626' : '#64748B',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    fontWeight: 900,
                    fontSize: '0.88rem',
                    flexShrink: 0,
                  }}
                >
                  {isPaid ? <CheckCircle2 size={18} /> : inst.installment_number}
                </div>

                <div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                    <span style={{ fontWeight: 800, fontSize: '0.92rem', color: '#0F172A' }}>
                      Installment #{inst.installment_number}
                    </span>
                    {inst.installment_number === 1 && (
                      <span style={{ fontSize: '0.68rem', backgroundColor: '#E0E7FF', color: '#3730A3', padding: '0.15rem 0.4rem', borderRadius: '4px', fontWeight: 700 }}>
                        Down Payment
                      </span>
                    )}
                  </div>
                  <div style={{ fontSize: '0.75rem', color: '#64748B', marginTop: '0.15rem' }}>
                    {isPaid ? (
                      <span style={{ color: '#166534', fontWeight: 600 }}>
                        Paid on {paidDateFormatted} via {inst.payment_method?.toUpperCase()}
                        {inst.transaction_ref ? ` • Ref: ${inst.transaction_ref}` : ''}
                      </span>
                    ) : (
                      <span>
                        Due Date: <strong>{dueDateFormatted}</strong>
                        {isOverdue && <span style={{ color: '#DC2626', fontWeight: 700 }}> (Overdue)</span>}
                      </span>
                    )}
                  </div>
                </div>
              </div>

              <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                <div style={{ textAlign: 'right' }}>
                  <div style={{ fontWeight: 900, fontSize: '1.05rem', color: '#0F172A' }}>
                    {formatPrice ? formatPrice(inst.amount) : `Rs. ${inst.amount.toLocaleString()}`}
                  </div>
                  <span
                    style={{
                      fontSize: '0.68rem',
                      fontWeight: 800,
                      padding: '0.15rem 0.5rem',
                      borderRadius: '4px',
                      backgroundColor: isPaid ? '#DCFCE7' : isOverdue ? '#FEE2E2' : '#F1F5F9',
                      color: isPaid ? '#15803D' : isOverdue ? '#B91C1C' : '#475569',
                      textTransform: 'uppercase',
                    }}
                  >
                    {isPaid ? 'PAID' : isOverdue ? 'OVERDUE' : 'UPCOMING'}
                  </span>
                </div>

                {!isPaid && (
                  <button
                    type="button"
                    onClick={() => {
                      setPayingInstallment(inst);
                      setActionError(null);
                      setActionSuccess(null);
                    }}
                    style={{
                      backgroundColor: '#111111',
                      color: '#FFFFFF',
                      border: 'none',
                      borderRadius: '6px',
                      padding: '0.5rem 0.9rem',
                      fontSize: '0.8rem',
                      fontWeight: 800,
                      cursor: 'pointer',
                      display: 'flex',
                      alignItems: 'center',
                      gap: '0.35rem',
                      transition: 'opacity 0.2s',
                    }}
                  >
                    <span>Pay Now</span>
                    <ChevronRight size={14} />
                  </button>
                )}
              </div>
            </div>
          );
        })}
      </div>

      {/* Pay Installment Modal */}
      {payingInstallment && (
        <div
          style={{
            position: 'fixed',
            inset: 0,
            zIndex: 9999,
            backgroundColor: 'rgba(0, 0, 0, 0.65)',
            backdropFilter: 'blur(5px)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            padding: '1rem',
          }}
          onClick={() => !isSubmitting && setPayingInstallment(null)}
        >
          <div
            style={{
              backgroundColor: '#FFFFFF',
              borderRadius: '14px',
              maxWidth: '480px',
              width: '100%',
              padding: '1.5rem',
              boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.25)',
              border: '1px solid #E2E8F0',
              animation: 'modalSlideUp 0.2s cubic-bezier(0.16, 1, 0.3, 1)',
            }}
            onClick={(e) => e.stopPropagation()}
          >
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1.25rem' }}>
              <div>
                <h4 style={{ margin: 0, fontSize: '1.15rem', fontWeight: 900, color: '#0F172A' }}>
                  Pay Installment #{payingInstallment.installment_number}
                </h4>
                <p style={{ margin: '0.2rem 0 0', fontSize: '0.78rem', color: '#64748B' }}>
                  Amount Due: <strong>{formatPrice ? formatPrice(payingInstallment.amount) : `Rs. ${payingInstallment.amount}`}</strong>
                </p>
              </div>

              {!isSubmitting && (
                <button
                  type="button"
                  onClick={() => setPayingInstallment(null)}
                  style={{ background: 'transparent', border: 'none', cursor: 'pointer', color: '#64748B' }}
                >
                  <X size={20} />
                </button>
              )}
            </div>

            {actionError && (
              <div style={{ backgroundColor: '#FEF2F2', border: '1px solid #FCA5A5', color: '#991B1B', padding: '0.75rem', borderRadius: '6px', fontSize: '0.8rem', marginBottom: '1rem', display: 'flex', gap: '0.5rem', alignItems: 'center' }}>
                <AlertCircle size={16} />
                <span>{actionError}</span>
              </div>
            )}

            {actionSuccess && (
              <div style={{ backgroundColor: '#F0FDF4', border: '1px solid #86EFAC', color: '#166534', padding: '0.75rem', borderRadius: '6px', fontSize: '0.8rem', marginBottom: '1rem', display: 'flex', gap: '0.5rem', alignItems: 'center' }}>
                <CheckCircle2 size={16} />
                <span>{actionSuccess}</span>
              </div>
            )}

            <form onSubmit={handlePayInstallment} style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
              <div>
                <label style={{ display: 'block', fontSize: '0.82rem', fontWeight: 700, marginBottom: '0.4rem', color: '#334155' }}>
                  Choose Payment Gateway
                </label>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '0.5rem' }}>
                  {[
                    { id: 'jazzcash', label: 'JazzCash', badge: 'JC', color: '#ED1C24' },
                    { id: 'easypaisa', label: 'Easypaisa', badge: 'EP', color: '#00A651' },
                    { id: 'card', label: 'Card / Debit', badge: 'VISA', color: '#1E40AF' },
                  ].map((gw) => (
                    <button
                      key={gw.id}
                      type="button"
                      onClick={() => setSelectedGateway(gw.id)}
                      style={{
                        padding: '0.65rem 0.5rem',
                        borderRadius: '8px',
                        border: selectedGateway === gw.id ? `2px solid ${gw.color}` : '1px solid #E2E8F0',
                        backgroundColor: selectedGateway === gw.id ? '#FAF9F6' : '#FFFFFF',
                        cursor: 'pointer',
                        textAlign: 'center',
                        display: 'flex',
                        flexDirection: 'column',
                        alignItems: 'center',
                        gap: '0.25rem',
                      }}
                    >
                      <span style={{ fontSize: '0.75rem', fontWeight: 900, color: gw.color }}>
                        {gw.badge}
                      </span>
                      <span style={{ fontSize: '0.72rem', fontWeight: 700, color: '#0F172A' }}>
                        {gw.label}
                      </span>
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <label style={{ display: 'block', fontSize: '0.82rem', fontWeight: 700, marginBottom: '0.4rem', color: '#334155' }}>
                  {selectedGateway === 'card' ? 'Card / Account Details' : 'Mobile Account / Phone Number'}
                </label>
                <input
                  type="text"
                  required
                  value={accountNumber}
                  onChange={(e) => setAccountNumber(e.target.value)}
                  placeholder={selectedGateway === 'card' ? '4111 2222 3333 4444' : '0300 1234567'}
                  style={{
                    width: '100%',
                    padding: '0.65rem 0.85rem',
                    borderRadius: '6px',
                    border: '1px solid #CBD5E1',
                    fontSize: '0.9rem',
                    fontWeight: 600,
                  }}
                />
              </div>

              <div style={{ backgroundColor: '#F8FAFC', padding: '0.75rem', borderRadius: '6px', fontSize: '0.75rem', color: '#64748B', display: 'flex', alignItems: 'center', gap: '0.45rem' }}>
                <Lock size={14} color="#059669" />
                <span>Simulated zero-fee transaction encrypted via State Bank Sandbox.</span>
              </div>

              <div style={{ display: 'flex', gap: '0.75rem', marginTop: '0.5rem' }}>
                <button
                  type="button"
                  disabled={isSubmitting}
                  onClick={() => setPayingInstallment(null)}
                  style={{
                    flex: 1,
                    padding: '0.7rem',
                    borderRadius: '8px',
                    border: '1px solid #E2E8F0',
                    backgroundColor: '#FFFFFF',
                    color: '#64748B',
                    fontSize: '0.85rem',
                    fontWeight: 700,
                    cursor: 'pointer',
                  }}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isSubmitting}
                  style={{
                    flex: 2,
                    padding: '0.7rem',
                    borderRadius: '8px',
                    border: 'none',
                    backgroundColor: '#111111',
                    color: '#FFFFFF',
                    fontSize: '0.85rem',
                    fontWeight: 800,
                    cursor: isSubmitting ? 'not-allowed' : 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    gap: '0.5rem',
                  }}
                >
                  {isSubmitting ? (
                    <>
                      <RefreshCw size={15} className="animate-spin" />
                      <span>Processing...</span>
                    </>
                  ) : (
                    <span>Confirm Payment ({formatPrice ? formatPrice(payingInstallment.amount) : `Rs. ${payingInstallment.amount}`})</span>
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
