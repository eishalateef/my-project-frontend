import React, { useState, useEffect } from 'react';
import axios from 'axios';
import {
  Truck,
  Check,
  CheckCircle2,
  Sparkles,
  ShieldCheck,
  Save,
  Building,
  UserCheck,
  AlertCircle,
  PackageCheck,
  ExternalLink,
} from 'lucide-react';

/**
 * Extracts the customer city from order customer record or shipping address
 */
export const getOrderCity = (order) => {
  if (order?.customer?.city && order.customer.city.trim()) {
    return order.customer.city.trim();
  }
  const addr = (order?.shipping_address || '').toLowerCase();
  if (addr.includes('lahore')) return 'Lahore';
  if (addr.includes('karachi')) return 'Karachi';
  if (addr.includes('islamabad')) return 'Islamabad';
  if (addr.includes('rawalpindi')) return 'Rawalpindi';
  if (addr.includes('faisalabad')) return 'Faisalabad';
  if (addr.includes('multan')) return 'Multan';
  if (addr.includes('peshawar')) return 'Peshawar';
  if (addr.includes('sialkot')) return 'Sialkot';
  if (addr.includes('quetta')) return 'Quetta';
  if (addr.includes('gujranwala')) return 'Gujranwala';
  if (addr.includes('hyderabad')) return 'Hyderabad';

  const parts = (order?.shipping_address || '').split(',');
  if (parts.length > 1) {
    const candidate = parts[parts.length - 1].trim();
    if (candidate.length > 2 && !/\d/.test(candidate)) return candidate;
  }
  return 'Other City';
};

/**
 * Checks if city is in Lahore, Karachi, or Islamabad (Major Metros for Own Fleet)
 */
export const isMetroOwnRiderCity = (city) => {
  if (!city) return false;
  const c = city.toLowerCase().trim();
  return (
    c === 'lahore' ||
    c === 'karachi' ||
    c === 'islamabad' ||
    c.includes('lahore') ||
    c.includes('karachi') ||
    c.includes('islamabad')
  );
};

const THIRD_PARTY_COURIERS = [
  { id: 'Leopards', name: 'Leopards Courier Service', tag: 'Overnight Air & Express', color: '#D97706', badge: 'LEOPARDS' },
  { id: 'TCS', name: 'TCS Express Logistics', tag: 'Fast Overland & Priority', color: '#DC2626', badge: 'TCS' },
  { id: 'Trax', name: 'Trax Logistics', tag: 'Digital COD & Real-Time API', color: '#2563EB', badge: 'TRAX' },
];

export default function OrderDeliveryAssignment({
  order,
  riders = [],
  onSaveSuccess,
  isCompact = false,
}) {
  const customerCity = getOrderCity(order);
  const isMetro = isMetroOwnRiderCity(customerCity);
  const autoSuggestedType = isMetro ? 'own_rider' : 'third_party';

  // Has existing saved delivery assignment in database?
  const hasSavedAssignment = Boolean(order?.delivery_type);

  // Initial delivery type: saved value in DB, or auto-suggested based on city
  const initialType = order?.delivery_type
    ? (order.delivery_type.toLowerCase().includes('third') ? 'third_party' : 'own_rider')
    : autoSuggestedType;

  // Initial assigned to: saved value in DB, or auto-suggested option
  const initialAssignedTo = order?.assigned_to || (
    initialType === 'own_rider'
      ? (order?.delivery_rider?.name || (riders[0]?.name || ''))
      : 'Leopards'
  );

  const initialDeliveryUserId = order?.delivery_user_id || (
    initialType === 'own_rider'
      ? (order?.delivery_rider?.id || (riders[0]?.id || ''))
      : ''
  );

  const [deliveryType, setDeliveryType] = useState(initialType);
  const [assignedTo, setAssignedTo] = useState(initialAssignedTo);
  const [deliveryUserId, setDeliveryUserId] = useState(initialDeliveryUserId);
  const [saving, setSaving] = useState(false);
  const [feedback, setFeedback] = useState(null);

  // Sync state if order prop changes
  useEffect(() => {
    if (order?.delivery_type) {
      const type = order.delivery_type.toLowerCase().includes('third') ? 'third_party' : 'own_rider';
      setDeliveryType(type);
      setAssignedTo(order.assigned_to || '');
      setDeliveryUserId(order.delivery_user_id || '');
    } else {
      setDeliveryType(autoSuggestedType);
      if (autoSuggestedType === 'own_rider') {
        const defaultRider = riders[0];
        setAssignedTo(defaultRider?.name || '');
        setDeliveryUserId(defaultRider?.id || '');
      } else {
        setAssignedTo('Leopards');
        setDeliveryUserId('');
      }
    }
  }, [order?.id, order?.delivery_type, order?.assigned_to, order?.delivery_user_id]);

  // Handle Delivery Type toggle
  const handleTypeChange = (newType) => {
    setDeliveryType(newType);
    if (newType === 'own_rider') {
      const existingRider = riders.find((r) => r.id === Number(deliveryUserId)) || riders[0];
      setAssignedTo(existingRider?.name || '');
      setDeliveryUserId(existingRider?.id || '');
    } else {
      if (!THIRD_PARTY_COURIERS.some((c) => c.id === assignedTo)) {
        setAssignedTo('Leopards');
      }
      setDeliveryUserId('');
    }
  };

  // Handle Own Rider selection
  const handleRiderChange = (riderIdStr) => {
    const rId = Number(riderIdStr);
    const selected = riders.find((r) => r.id === rId);
    setDeliveryUserId(rId || '');
    setAssignedTo(selected?.name || '');
  };

  // Handle Save
  const handleSave = async (e) => {
    if (e) e.stopPropagation();

    if (!assignedTo) {
      alert('Please select a courier before saving.');
      return;
    }

    try {
      setSaving(true);
      setFeedback(null);

      const payload = {
        delivery_type: deliveryType,
        assigned_to: assignedTo,
        delivery_user_id: deliveryType === 'own_rider' ? (deliveryUserId || null) : null,
      };

      const res = await axios.patch(`/api/admin/orders/${order.id}/assign-delivery`, payload);

      setFeedback({
        type: 'success',
        message: `Saved! Assigned to ${deliveryType === 'own_rider' ? 'Own Rider' : 'Third-Party'}: ${assignedTo}`,
      });

      if (onSaveSuccess && res.data?.order) {
        onSaveSuccess(res.data.order);
      }

      setTimeout(() => setFeedback(null), 4000);
    } catch (err) {
      console.error('Failed to save delivery assignment:', err);
      setFeedback({
        type: 'error',
        message: err.response?.data?.message || err.message || 'Failed to save delivery assignment',
      });
    } finally {
      setSaving(false);
    }
  };

  const selectedRider = riders.find((r) => r.id === Number(deliveryUserId) || r.name === assignedTo);

  return (
    <div
      style={{
        backgroundColor: '#FAF9F6',
        borderRadius: '8px',
        border: '1.5px solid #E5E0D8',
        padding: isCompact ? '1rem' : '1.35rem',
        display: 'flex',
        flexDirection: 'column',
        gap: '1rem',
        position: 'relative',
        boxShadow: '0 2px 8px rgba(0,0,0,0.03)',
      }}
      onClick={(e) => e.stopPropagation()}
    >
      {/* 1. Header with Admin Role Lock Badge */}
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          flexWrap: 'wrap',
          gap: '0.65rem',
          borderBottom: '1px solid #ECE7DE',
          paddingBottom: '0.75rem',
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.55rem' }}>
          <div
            style={{
              width: '32px',
              height: '32px',
              borderRadius: '6px',
              backgroundColor: '#111111',
              color: '#FFFFFF',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
            }}
          >
            <Truck size={17} strokeWidth={2.2} />
          </div>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.45rem' }}>
              <span style={{ fontSize: '0.92rem', fontWeight: 800, color: '#111111', textTransform: 'uppercase', letterSpacing: '0.04em' }}>
                Delivery Type Assignment
              </span>
              <span
                style={{
                  fontSize: '0.62rem',
                  fontWeight: 800,
                  backgroundColor: '#FEF3C7',
                  color: '#92400E',
                  padding: '0.15rem 0.5rem',
                  borderRadius: '999px',
                  border: '1px solid #FDE68A',
                  letterSpacing: '0.06em',
                  textTransform: 'uppercase',
                }}
              >
                Admin Only
              </span>
            </div>
            <div style={{ fontSize: '0.74rem', color: '#6B665F', marginTop: '1px' }}>
              Configure fulfillment route for Order #{order.order_number}
            </div>
          </div>
        </div>

        {/* Current Saved Status Badge */}
        {order?.delivery_type && (
          <div
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: '0.35rem',
              fontSize: '0.72rem',
              fontWeight: 800,
              padding: '0.25rem 0.65rem',
              borderRadius: '999px',
              backgroundColor: order.delivery_type === 'own_rider' ? '#ECFDF5' : '#EFF6FF',
              color: order.delivery_type === 'own_rider' ? '#047857' : '#1D4ED8',
              border: `1px solid ${order.delivery_type === 'own_rider' ? '#A7F3D0' : '#BFDBFE'}`,
              textTransform: 'uppercase',
              letterSpacing: '0.04em',
            }}
          >
            <CheckCircle2 size={13} />
            <span>
              Assigned: {order.delivery_type === 'own_rider' ? 'Own Rider' : 'Third-Party'} ({order.assigned_to})
            </span>
          </div>
        )}
      </div>

      {/* 2. City Intelligence & Auto-Suggestion Banner */}
      <div
        style={{
          backgroundColor: isMetro ? '#F0FDF4' : '#FFFBEB',
          border: `1px solid ${isMetro ? '#BBF7D0' : '#FDE68A'}`,
          borderRadius: '6px',
          padding: '0.75rem 1rem',
          display: 'flex',
          alignItems: 'flex-start',
          gap: '0.65rem',
        }}
      >
        <Sparkles size={18} color={isMetro ? '#15803D' : '#B45309'} style={{ flexShrink: 0, marginTop: '2px' }} />
        <div style={{ flex: 1, fontSize: '0.8rem', lineHeight: 1.45 }}>
          <div style={{ fontWeight: 800, color: isMetro ? '#166534' : '#92400E', display: 'flex', alignItems: 'center', gap: '0.45rem', flexWrap: 'wrap' }}>
            <span>Customer City: <strong>{customerCity}</strong></span>
            <span style={{ opacity: 0.5 }}>•</span>
            <span>
              Auto-Suggested: <strong>{isMetro ? 'Own Rider' : 'Third-Party Courier'}</strong>
            </span>
          </div>
          <div style={{ color: isMetro ? '#15803D' : '#B45309', marginTop: '0.15rem' }}>
            {isMetro
              ? `Since customer is located in ${customerCity} (major metro hub), our dedicated internal fleet is auto-suggested.`
              : `Since customer is located in ${customerCity} (outstation network), third-party partner courier is auto-suggested.`}
            {' '}<em>Final selection is done by Admin only.</em>
          </div>
        </div>
      </div>

      {/* 3. Form Controls Grid */}
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))',
          gap: '1rem',
          alignItems: 'flex-end',
        }}
      >
        {/* Dropdown 1: Select Delivery Type */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.35rem' }}>
          <label style={{ fontSize: '0.78rem', fontWeight: 800, color: '#111111', textTransform: 'uppercase', letterSpacing: '0.04em' }}>
            Select Delivery Type <span style={{ color: '#E35205' }}>*</span>
          </label>
          <select
            value={deliveryType}
            onChange={(e) => handleTypeChange(e.target.value)}
            className="form-input"
            style={{
              padding: '0.55rem 0.85rem',
              fontSize: '0.86rem',
              fontWeight: 700,
              borderRadius: '6px',
              border: '1.5px solid #111111',
              backgroundColor: '#FFFFFF',
              color: '#111111',
              cursor: 'pointer',
              width: '100%',
              boxShadow: '0 1px 3px rgba(0,0,0,0.05)',
            }}
          >
            <option value="own_rider">Own Rider (Internal Fleet)</option>
            <option value="third_party">Third-Party Courier</option>
          </select>
        </div>

        {/* Dropdown 2: Dynamic Courier Selection */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.35rem' }}>
          {deliveryType === 'own_rider' ? (
            <>
              <label style={{ fontSize: '0.78rem', fontWeight: 800, color: '#111111', textTransform: 'uppercase', letterSpacing: '0.04em' }}>
                Select Own Courier <span style={{ color: '#E35205' }}>*</span> (users where role = 'courier')
              </label>
              <select
                value={deliveryUserId || ''}
                onChange={(e) => handleRiderChange(e.target.value)}
                className="form-input"
                style={{
                  padding: '0.55rem 0.85rem',
                  fontSize: '0.86rem',
                  fontWeight: 600,
                  borderRadius: '6px',
                  border: '1.5px solid #111111',
                  backgroundColor: '#FFFFFF',
                  color: '#111111',
                  cursor: 'pointer',
                  width: '100%',
                }}
              >
                <option value="">-- Choose Courier from Users --</option>
                {riders.map((r) => (
                  <option key={r.id} value={r.id}>
                    {r.name} {r.employee_id ? `[${r.employee_id}]` : ''} ({r.city || 'Pakistan'} · {r.phone || 'Phone N/A'})
                  </option>
                ))}
              </select>
            </>
          ) : (
            <>
              <label style={{ fontSize: '0.78rem', fontWeight: 800, color: '#111111', textTransform: 'uppercase', letterSpacing: '0.04em' }}>
                Select Third-Party Courier <span style={{ color: '#E35205' }}>*</span>
              </label>
              <select
                value={assignedTo}
                onChange={(e) => setAssignedTo(e.target.value)}
                className="form-input"
                style={{
                  padding: '0.55rem 0.85rem',
                  fontSize: '0.86rem',
                  fontWeight: 700,
                  borderRadius: '6px',
                  border: '1.5px solid #111111',
                  backgroundColor: '#FFFFFF',
                  color: '#111111',
                  cursor: 'pointer',
                  width: '100%',
                }}
              >
                <option value="Leopards">Leopards (Leopards Courier Service)</option>
                <option value="TCS">TCS (TCS Express)</option>
                <option value="Trax">Trax (Trax Logistics)</option>
              </select>
            </>
          )}
        </div>

        {/* 4. Save Button */}
        <div>
          <button
            type="button"
            onClick={handleSave}
            disabled={saving}
            style={{
              width: '100%',
              padding: '0.62rem 1.25rem',
              borderRadius: '6px',
              backgroundColor: '#111111',
              color: '#FFFFFF',
              border: 'none',
              fontSize: '0.84rem',
              fontWeight: 800,
              letterSpacing: '0.06em',
              textTransform: 'uppercase',
              cursor: saving ? 'not-allowed' : 'pointer',
              display: 'inline-flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '0.5rem',
              boxShadow: '0 4px 12px rgba(0,0,0,0.15)',
              transition: 'all 0.18s ease',
            }}
            onMouseEnter={(e) => {
              if (!saving) e.currentTarget.style.backgroundColor = '#E35205';
            }}
            onMouseLeave={(e) => {
              if (!saving) e.currentTarget.style.backgroundColor = '#111111';
            }}
          >
            {saving ? (
              <span>Saving...</span>
            ) : (
              <>
                <Save size={15} />
                <span>Save Delivery Assignment</span>
              </>
            )}
          </button>
        </div>
      </div>

      {/* 5. Quick-Action Third-Party Courier Pills (When third_party is active) */}
      {deliveryType === 'third_party' && (
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.65rem', flexWrap: 'wrap', paddingTop: '0.25rem' }}>
          <span style={{ fontSize: '0.72rem', fontWeight: 800, color: '#6B665F', textTransform: 'uppercase' }}>
            Quick Select Partner:
          </span>
          {THIRD_PARTY_COURIERS.map((c) => {
            const isSelected = assignedTo === c.id;
            return (
              <button
                key={c.id}
                type="button"
                onClick={() => setAssignedTo(c.id)}
                style={{
                  padding: '0.35rem 0.85rem',
                  borderRadius: '999px',
                  border: isSelected ? `2px solid ${c.color}` : '1.5px solid #D1D5DB',
                  backgroundColor: isSelected ? `${c.color}15` : '#FFFFFF',
                  color: isSelected ? c.color : '#374151',
                  fontSize: '0.78rem',
                  fontWeight: isSelected ? 800 : 600,
                  cursor: 'pointer',
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '0.35rem',
                  transition: 'all 0.15s ease',
                }}
              >
                {isSelected && <Check size={13} strokeWidth={2.8} />}
                <span>{c.badge}</span>
                <span style={{ fontSize: '0.7rem', opacity: 0.7 }}>({c.tag.split('&')[0]})</span>
              </button>
            );
          })}
        </div>
      )}

      {/* 6. Active Selection Details Summary Box */}
      <div
        style={{
          backgroundColor: '#FFFFFF',
          borderRadius: '6px',
          border: '1px solid #E5E7EB',
          padding: '0.75rem 1rem',
          fontSize: '0.8rem',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          flexWrap: 'wrap',
          gap: '0.65rem',
        }}
      >
        <div>
          <span style={{ color: '#6B7280', fontWeight: 600 }}>Active Configuration: </span>
          <strong style={{ color: '#111827' }}>
            {deliveryType === 'own_rider' ? 'Own Rider' : 'Third-Party Courier'}
          </strong>
          {' ➔ '}
          <span
            style={{
              fontWeight: 800,
              color: deliveryType === 'own_rider' ? '#059669' : '#2563EB',
            }}
          >
            {assignedTo || 'None Selected'}
          </span>
          {deliveryType === 'own_rider' && selectedRider && (
            <span style={{ color: '#6B7280', marginLeft: '0.5rem' }}>
              (Phone: {selectedRider.phone || 'N/A'} · City: {selectedRider.city || 'Pakistan'})
            </span>
          )}
        </div>

        <div style={{ fontSize: '0.74rem', color: '#6B7280' }}>
          Destination: <strong>{customerCity}</strong>
        </div>
      </div>

      {/* Feedback Toast Alert */}
      {feedback && (
        <div
          style={{
            padding: '0.55rem 0.85rem',
            borderRadius: '6px',
            backgroundColor: feedback.type === 'success' ? '#DCFCE7' : '#FEE2E2',
            color: feedback.type === 'success' ? '#166534' : '#991B1B',
            border: `1px solid ${feedback.type === 'success' ? '#86EFAC' : '#FCA5A5'}`,
            fontSize: '0.8rem',
            fontWeight: 700,
            display: 'flex',
            alignItems: 'center',
            gap: '0.45rem',
            animation: 'fadeIn 0.2s ease',
          }}
        >
          {feedback.type === 'success' ? <CheckCircle2 size={16} /> : <AlertCircle size={16} />}
          <span>{feedback.message}</span>
        </div>
      )}
    </div>
  );
}
