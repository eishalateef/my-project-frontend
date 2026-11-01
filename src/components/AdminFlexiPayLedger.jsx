import React, { useState } from 'react';
import axios from 'axios';
import {
  Sparkles,
  CheckCircle2,
  Clock,
  AlertCircle,
  Phone,
  MessageCircle,
  Copy,
  Check,
  CreditCard,
  Banknote,
  RefreshCw,
  X,
  FileCheck,
} from 'lucide-react';

export default function AdminFlexiPayLedger({ order, onOrderUpdated, formatPrice }) {
  if (!order || !order.is_installment) return null;

  const [installments, setInstallments] = useState(order.installments || []);
  const [recordingInst, setRecordingInst] = useState(null);
  const [offlineMethod, setOfflineMethod] = useState('cash');
  const [notes, setNotes] = useState('');
  const [txnRef, setTxnRef] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');
  const [successMsg, setSuccessMsg] = useState('');
  const [copiedField, setCopiedField] = useState(null);

  const totalAmount = order.final_amount || 0;
  const paidList = installments.filter((i) => i.status === 'paid');
  const paidAmount = paidList.reduce((acc, curr) => acc + (parseFloat(curr.amount) || 0), 0);
  const remainingAmount = Math.max(0, totalAmount - paidAmount);

  const handleCopy = (text, fieldName) => {
    if (!text) return;
    navigator.clipboard?.writeText(text);
    setCopiedField(fieldName);
    setTimeout(() => setCopiedField(null), 2000);
  };

  const handleSendWhatsAppReminder = (inst) => {
    const customerPhone = (order.phone || '').replace(/[^0-9]/g, '');
    const cleanPhone = customerPhone.startsWith('0') ? '92' + customerPhone.slice(1) : customerPhone;
    const origin = window.location.origin;
    const trackUrl = `${origin}/track-order?order_number=${order.order_number}`;
    
    const text = encodeURIComponent(
      `Assalam-o-Alaikum ${order.customer?.name || 'Customer'},\n\n` +
      `This is a friendly reminder from *KHAAM POSHAK* regarding your Order *#${order.order_number}*.\n\n` +
      `• Installment #${inst.installment_number}: *Rs. ${Math.round(inst.amount).toLocaleString()}*\n` +
      `• Due Date: *${inst.due_date || 'Upcoming'}*\n` +
      `• Status: *${inst.status.toUpperCase()}*\n\n` +
      `You can review your repayment ledger or pay online via JazzCash/Easypaisa here:\n${trackUrl}\n\n` +
      `Thank you for shopping with KHAAM POSHAK!`
    );

    window.open(`https://wa.me/${cleanPhone}?text=${text}`, '_blank');
  };

  const handleRecordOfflinePayment = async (e) => {
    e.preventDefault();
    if (!recordingInst) return;

    setSubmitting(true);
    setErrorMsg('');
    setSuccessMsg('');

    try {
      const res = await axios.post(`/api/admin/installments/${recordingInst.id}/record-payment`, {
        payment_method: offlineMethod,
        transaction_ref: txnRef || undefined,
        notes: notes || `Admin verified offline payment via ${offlineMethod}`,
      });

      if (res.data?.success) {
        setSuccessMsg(res.data.message || 'Payment recorded successfully!');
        
        // Update local list
        setInstallments((prev) =>
          prev.map((inst) => (inst.id === recordingInst.id ? res.data.installment : inst))
        );

        if (onOrderUpdated) {
          onOrderUpdated(res.data.order || order);
        }

        setTimeout(() => {
          setRecordingInst(null);
          setSuccessMsg('');
          setNotes('');
          setTxnRef('');
        }, 1500);
      } else {
        setErrorMsg(res.data?.message || 'Failed to record payment.');
      }
    } catch (err) {
      setErrorMsg(err.response?.data?.message || 'Error recording offline payment.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div
      style={{
        backgroundColor: '#FFFFFF',
        border: '1.5px solid #FDE68A',
        borderRadius: '10px',
        padding: '1.25rem',
        boxShadow: '0 4px 15px -3px rgba(245, 158, 11, 0.08)',
      }}
    >
      {/* Header */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '0.75rem', marginBottom: '1rem' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
          <div style={{ width: '30px', height: '30px', borderRadius: '6px', backgroundColor: '#111111', color: '#E35205', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <Sparkles size={16} />
          </div>
          <div>
            <h4 style={{ margin: 0, fontSize: '0.98rem', fontWeight: 900, color: '#111111' }}>
              FlexiPay 4-Installment Contract & Recovery Ledger
            </h4>
            <div style={{ fontSize: '0.74rem', color: '#6B665F' }}>
              Identity Verified Financing • Contract Status: <strong style={{ color: remainingAmount === 0 ? '#16A34A' : '#B45309', textTransform: 'uppercase' }}>{order.installment_status || 'Active'}</strong>
            </div>
          </div>
        </div>

        <span
          style={{
            fontSize: '0.74rem',
            fontWeight: 800,
            padding: '0.2rem 0.65rem',
            borderRadius: '999px',
            backgroundColor: remainingAmount === 0 ? '#DCFCE7' : '#FEF3C7',
            color: remainingAmount === 0 ? '#166534' : '#B45309',
            border: remainingAmount === 0 ? '1px solid #86EFAC' : '1px solid #FCD34D',
            textTransform: 'uppercase',
          }}
        >
          {paidList.length} of {order.total_installments || 4} Installments Paid
        </span>
      </div>

      {/* Verification Matrix: CNIC & Alternate Contact */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '0.75rem', marginBottom: '1rem', backgroundColor: '#FAF9F6', padding: '0.85rem', borderRadius: '8px', border: '1px solid #ECEAE7' }}>
        <div>
          <div style={{ fontSize: '0.7rem', fontWeight: 700, color: '#6B665F', textTransform: 'uppercase' }}>
            Customer CNIC (National ID)
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.45rem', marginTop: '0.2rem' }}>
            <span style={{ fontWeight: 800, fontSize: '0.92rem', color: '#111111', fontFamily: 'monospace' }}>
              {order.customer_cnic || 'Not provided'}
            </span>
            {order.customer_cnic && (
              <button
                type="button"
                onClick={() => handleCopy(order.customer_cnic, 'cnic')}
                style={{ background: 'transparent', border: 'none', cursor: 'pointer', color: '#6B665F', padding: '2px' }}
                title="Copy CNIC"
              >
                {copiedField === 'cnic' ? <Check size={14} color="#16A34A" /> : <Copy size={14} />}
              </button>
            )}
          </div>
        </div>

        <div>
          <div style={{ fontSize: '0.7rem', fontWeight: 700, color: '#6B665F', textTransform: 'uppercase' }}>
            Emergency / Alternate Phone
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.45rem', marginTop: '0.2rem' }}>
            <span style={{ fontWeight: 800, fontSize: '0.92rem', color: '#111111' }}>
              {order.alternate_phone || 'None'}
            </span>
            {order.alternate_phone && (
              <a
                href={`tel:${order.alternate_phone}`}
                style={{ color: '#2563EB', display: 'inline-flex', alignItems: 'center' }}
                title="Call Alternate Number"
              >
                <Phone size={14} />
              </a>
            )}
          </div>
        </div>

        <div>
          <div style={{ fontSize: '0.7rem', fontWeight: 700, color: '#6B665F', textTransform: 'uppercase' }}>
            Collection Progress
          </div>
          <div style={{ fontWeight: 800, fontSize: '0.92rem', color: '#111111', marginTop: '0.2rem' }}>
            {formatPrice ? formatPrice(paidAmount) : `Rs. ${paidAmount}`} / {formatPrice ? formatPrice(totalAmount) : `Rs. ${totalAmount}`}
          </div>
        </div>
      </div>

      {/* Installments Table */}
      <div style={{ border: '1px solid #E5E7EB', borderRadius: '8px', overflow: 'hidden' }}>
        <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', fontSize: '0.82rem' }}>
          <thead>
            <tr style={{ backgroundColor: '#F9FAFB', borderBottom: '1px solid #E5E7EB', color: '#4B5563', fontSize: '0.72rem', textTransform: 'uppercase' }}>
              <th style={{ padding: '0.6rem 0.85rem' }}>Inst #</th>
              <th style={{ padding: '0.6rem 0.85rem' }}>Amount</th>
              <th style={{ padding: '0.6rem 0.85rem' }}>Due Date</th>
              <th style={{ padding: '0.6rem 0.85rem' }}>Status</th>
              <th style={{ padding: '0.6rem 0.85rem' }}>Payment Info</th>
              <th style={{ padding: '0.6rem 0.85rem', textAlign: 'right' }}>Admin Actions</th>
            </tr>
          </thead>
          <tbody>
            {installments.map((inst) => {
              const isPaid = inst.status === 'paid';
              const isOverdue = inst.status === 'overdue';

              return (
                <tr key={inst.id} style={{ borderBottom: '1px solid #F3F4F6', backgroundColor: isPaid ? '#F0FDF4' : isOverdue ? '#FEF2F2' : '#FFFFFF' }}>
                  <td style={{ padding: '0.65rem 0.85rem', fontWeight: 800, color: '#111111' }}>
                    #{inst.installment_number} {inst.installment_number === 1 ? '(Down)' : ''}
                  </td>
                  <td style={{ padding: '0.65rem 0.85rem', fontWeight: 800, color: '#111111' }}>
                    {formatPrice ? formatPrice(inst.amount) : `Rs. ${inst.amount}`}
                  </td>
                  <td style={{ padding: '0.65rem 0.85rem', color: '#4B5563' }}>
                    {inst.due_date ? new Date(inst.due_date).toLocaleDateString('en-PK', { month: 'short', day: 'numeric', year: 'numeric' }) : '—'}
                  </td>
                  <td style={{ padding: '0.65rem 0.85rem' }}>
                    <span
                      style={{
                        fontSize: '0.68rem',
                        fontWeight: 800,
                        padding: '0.15rem 0.45rem',
                        borderRadius: '4px',
                        backgroundColor: isPaid ? '#DCFCE7' : isOverdue ? '#FEE2E2' : '#EFF6FF',
                        color: isPaid ? '#15803D' : isOverdue ? '#B91C1C' : '#1D4ED8',
                        textTransform: 'uppercase',
                      }}
                    >
                      {inst.status}
                    </span>
                  </td>
                  <td style={{ padding: '0.65rem 0.85rem', color: '#4B5563', fontSize: '0.74rem' }}>
                    {isPaid ? (
                      <span>
                        {inst.payment_method?.toUpperCase()} • {inst.transaction_ref || 'Paid'}
                      </span>
                    ) : (
                      <span style={{ color: '#9CA3AF' }}>Unpaid</span>
                    )}
                  </td>
                  <td style={{ padding: '0.65rem 0.85rem', textAlign: 'right' }}>
                    <div style={{ display: 'inline-flex', alignItems: 'center', gap: '0.4rem' }}>
                      {!isPaid && (
                        <>
                          <button
                            type="button"
                            onClick={() => handleSendWhatsAppReminder(inst)}
                            style={{
                              backgroundColor: '#25D366',
                              color: '#FFFFFF',
                              border: 'none',
                              borderRadius: '4px',
                              padding: '0.28rem 0.55rem',
                              fontSize: '0.72rem',
                              fontWeight: 700,
                              cursor: 'pointer',
                              display: 'inline-flex',
                              alignItems: 'center',
                              gap: '0.25rem',
                            }}
                            title="Send WhatsApp payment reminder to customer"
                          >
                            <MessageCircle size={13} />
                            <span>Remind</span>
                          </button>

                          <button
                            type="button"
                            onClick={() => {
                              setRecordingInst(inst);
                              setErrorMsg('');
                              setSuccessMsg('');
                            }}
                            style={{
                              backgroundColor: '#111111',
                              color: '#FFFFFF',
                              border: 'none',
                              borderRadius: '4px',
                              padding: '0.28rem 0.55rem',
                              fontSize: '0.72rem',
                              fontWeight: 700,
                              cursor: 'pointer',
                              display: 'inline-flex',
                              alignItems: 'center',
                              gap: '0.25rem',
                            }}
                            title="Record offline payment received from customer"
                          >
                            <Banknote size={13} />
                            <span>Record Paid</span>
                          </button>
                        </>
                      )}
                      {isPaid && (
                        <span style={{ fontSize: '0.72rem', color: '#16A34A', fontWeight: 800, display: 'inline-flex', alignItems: 'center', gap: '0.2rem' }}>
                          <CheckCircle2 size={13} /> Settled
                        </span>
                      )}
                    </div>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      {/* Record Offline Payment Modal */}
      {recordingInst && (
        <div
          style={{
            position: 'fixed',
            inset: 0,
            zIndex: 10001,
            backgroundColor: 'rgba(0, 0, 0, 0.65)',
            backdropFilter: 'blur(4px)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            padding: '1rem',
          }}
          onClick={() => !submitting && setRecordingInst(null)}
        >
          <div
            style={{
              backgroundColor: '#FFFFFF',
              borderRadius: '12px',
              maxWidth: '460px',
              width: '100%',
              padding: '1.5rem',
              boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.25)',
              border: '1px solid #E2E8F0',
            }}
            onClick={(e) => e.stopPropagation()}
          >
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1rem' }}>
              <div>
                <h4 style={{ margin: 0, fontSize: '1.1rem', fontWeight: 900, color: '#111111' }}>
                  Record Offline Installment Payment
                </h4>
                <p style={{ margin: '0.2rem 0 0', fontSize: '0.78rem', color: '#6B665F' }}>
                  Installment #{recordingInst.installment_number} • Amount: <strong>{formatPrice ? formatPrice(recordingInst.amount) : `Rs. ${recordingInst.amount}`}</strong>
                </p>
              </div>

              {!submitting && (
                <button
                  type="button"
                  onClick={() => setRecordingInst(null)}
                  style={{ background: 'transparent', border: 'none', cursor: 'pointer', color: '#6B665F' }}
                >
                  <X size={18} />
                </button>
              )}
            </div>

            {errorMsg && (
              <div style={{ backgroundColor: '#FEF2F2', border: '1px solid #FCA5A5', color: '#991B1B', padding: '0.65rem', borderRadius: '6px', fontSize: '0.8rem', marginBottom: '0.85rem' }}>
                {errorMsg}
              </div>
            )}

            {successMsg && (
              <div style={{ backgroundColor: '#F0FDF4', border: '1px solid #86EFAC', color: '#166534', padding: '0.65rem', borderRadius: '6px', fontSize: '0.8rem', marginBottom: '0.85rem' }}>
                {successMsg}
              </div>
            )}

            <form onSubmit={handleRecordOfflinePayment} style={{ display: 'flex', flexDirection: 'column', gap: '0.85rem' }}>
              <div>
                <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 700, marginBottom: '0.35rem' }}>
                  Received Via Payment Method:
                </label>
                <select
                  value={offlineMethod}
                  onChange={(e) => setOfflineMethod(e.target.value)}
                  style={{ width: '100%', padding: '0.55rem', borderRadius: '6px', border: '1px solid #CBD5E1', fontSize: '0.85rem', fontWeight: 600 }}
                >
                  <option value="cash">Cash in Hand / In-Store Collection</option>
                  <option value="bank_transfer">Direct Bank Transfer (Meezan / HBL / UBL)</option>
                  <option value="jazzcash">Direct JazzCash Manual Transfer</option>
                  <option value="easypaisa">Direct Easypaisa Manual Transfer</option>
                  <option value="card">Point-of-Sale (POS) Card Swipe</option>
                </select>
              </div>

              <div>
                <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 700, marginBottom: '0.35rem' }}>
                  Transaction Reference / Slip ID (Optional):
                </label>
                <input
                  type="text"
                  value={txnRef}
                  onChange={(e) => setTxnRef(e.target.value)}
                  placeholder="e.g. TID-982312 or Bank Ref"
                  style={{ width: '100%', padding: '0.55rem', borderRadius: '6px', border: '1px solid #CBD5E1', fontSize: '0.85rem' }}
                />
              </div>

              <div>
                <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 700, marginBottom: '0.35rem' }}>
                  Admin Notes (Optional):
                </label>
                <input
                  type="text"
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  placeholder="e.g. Verified by accountant at Lahore branch"
                  style={{ width: '100%', padding: '0.55rem', borderRadius: '6px', border: '1px solid #CBD5E1', fontSize: '0.85rem' }}
                />
              </div>

              <div style={{ display: 'flex', gap: '0.65rem', marginTop: '0.5rem' }}>
                <button
                  type="button"
                  disabled={submitting}
                  onClick={() => setRecordingInst(null)}
                  style={{ flex: 1, padding: '0.6rem', borderRadius: '6px', border: '1px solid #E2E8F0', backgroundColor: '#FFFFFF', color: '#64748B', fontSize: '0.82rem', fontWeight: 700, cursor: 'pointer' }}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={submitting}
                  style={{
                    flex: 2,
                    padding: '0.6rem',
                    borderRadius: '6px',
                    border: 'none',
                    backgroundColor: '#16A34A',
                    color: '#FFFFFF',
                    fontSize: '0.82rem',
                    fontWeight: 800,
                    cursor: submitting ? 'not-allowed' : 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    gap: '0.4rem',
                  }}
                >
                  {submitting ? (
                    <>
                      <RefreshCw size={14} className="animate-spin" />
                      <span>Saving...</span>
                    </>
                  ) : (
                    <span>Confirm Payment Received</span>
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
