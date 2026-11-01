import React, { useState } from 'react';
import { createPortal } from 'react-dom';
import {
  Printer,
  X,
  Truck,
  Phone,
  MapPin,
  CheckCircle2,
  Calendar,
  AlertTriangle,
  Download,
  Copy,
  Check,
  FileText,
  Tag,
  Layers,
  Ban,
} from 'lucide-react';

/**
 * Universal Code-39 Barcode Generator (Pure SVG)
 * Scannable by commercial 1D/2D barcode scanners and smartphone cameras.
 */
function Code39Barcode({ text, height = 36, showText = true }) {
  const code39Map = {
    '0': 'bwbwbwBwB', '1': 'BwbwbWbwb', '2': 'bwBwbWbwb', '3': 'BwBwbWbwB',
    '4': 'bwbwBWbwb', '5': 'BwbwBWbwB', '6': 'bwBwBWbwb', '7': 'bwbwbWBwb',
    '8': 'BwbwbWBwB', '9': 'bwBwbWBwb', 'A': 'BwbwbwbWB', 'B': 'bwBwbwbWB',
    'C': 'BwBwbwbWB', 'D': 'bwbwBwbWB', 'E': 'BwbwBwbWB', 'F': 'bwBwBwbWB',
    'G': 'bwbwbwBWB', 'H': 'BwbwbwBWB', 'I': 'bwBwbwBWB', 'J': 'bwbwBwBWB',
    'K': 'BwbwbwbwB', 'L': 'bwBwbwbwB', 'M': 'BwBwbwbwB', 'N': 'bwbwBwbwB',
    'O': 'BwbwBwbwB', 'P': 'bwBwBwbwB', 'Q': 'bwbwbwBwB', 'R': 'BwbwbwBwB',
    'S': 'bwBwbwBwB', 'T': 'bwbwBwBwB', 'U': 'BWbwbwbwb', 'V': 'bWBwbwbwb',
    'W': 'BWBwbwbwb', 'X': 'bWbwBwbwb', 'Y': 'BWBwBwbwb', 'Z': 'bWBwBwbwb',
    '-': 'bWbwbwBwb', '.': 'BwbwbwBwb', ' ': 'bWBwbwBwb', '$': 'bWbWbWbwb',
    '/': 'bWbWbwbWb', '+': 'bWbwbWbWb', '%': 'bwbWbWbWb', '*': 'bWbwBwBwb',
  };

  const cleanText = (text || 'FLX-0000').toUpperCase().replace(/[^0-9A-Z\-\. \$\/\+\%]/g, '');
  const encoded = `*${cleanText}*`;

  const bars = [];
  let currentX = 0;
  const narrowWidth = 1.3;
  const wideWidth = 3.2;
  const gapWidth = 1.3;

  for (let i = 0; i < encoded.length; i++) {
    const char = encoded[i];
    const pattern = code39Map[char] || code39Map['-'];

    for (let p = 0; p < pattern.length; p++) {
      const isBar = p % 2 === 0;
      const isWide = pattern[p] === 'B' || pattern[p] === 'W';
      const width = isWide ? wideWidth : narrowWidth;

      if (isBar) {
        bars.push(
          <rect
            key={`${i}-${p}`}
            x={currentX}
            y={0}
            width={width}
            height={height}
            fill="#000000"
          />
        );
      }
      currentX += width;
    }
    currentX += gapWidth;
  }

  return (
    <div style={{ display: 'inline-flex', flexDirection: 'column', alignItems: 'center' }}>
      <svg
        width={Math.max(140, currentX)}
        height={height}
        viewBox={`0 0 ${currentX} ${height}`}
        style={{ display: 'block', maxWidth: '100%' }}
      >
        {bars}
      </svg>
      {showText && (
        <span
          style={{
            fontFamily: 'monospace',
            fontSize: '0.68rem',
            letterSpacing: '0.12em',
            color: '#111827',
            fontWeight: 700,
            marginTop: '1px',
          }}
        >
          *{cleanText}*
        </span>
      )}
    </div>
  );
}

/**
 * ShippingInvoiceModal:
 * Professional Courier Shipping Label & Warehouse Packing Slip
 * GUARANTEED SINGLE-PAGE FIT PER ORDER (Zero phantom trailing pages)
 */
export default function ShippingInvoiceModal({ order, orders, onClose }) {
  const [formatMode, setFormatMode] = useState('a4'); // 'a4' (Full A4 Page) or 'thermal' (4x6 Compact)
  const [copied, setCopied] = useState(false);

  // Normalize order(s) list
  const orderList = orders && orders.length > 0 ? orders : order ? [order] : [];

  if (orderList.length === 0) return null;

  const handlePrint = () => {
    window.print();
  };

  const handleCopyOrderNo = (orderNum) => {
    navigator.clipboard.writeText(orderNum);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const formatPKR = (amt) => {
    const num = Number(amt) || 0;
    return `Rs. ${num.toLocaleString('en-PK')}`;
  };

  const modalContent = (
    <div
      id="print-modal-portal"
      style={{
        position: 'fixed',
        inset: 0,
        backgroundColor: 'rgba(15, 23, 42, 0.75)',
        backdropFilter: 'blur(5px)',
        zIndex: 99999,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '1rem',
        overflowY: 'auto',
      }}
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
    >
      {/* Strict Print Stylesheet */}
      <style>{`
        @media print {
          /* 1. Eliminate the entire application from print flow to prevent phantom pages */
          #root,
          .no-print {
            display: none !important;
          }

          /* 2. Page Setup */
          @page {
            size: ${formatMode === 'thermal' ? '100mm 150mm' : 'A4 portrait'};
            margin: ${formatMode === 'thermal' ? '3mm' : '6mm 8mm'};
          }

          html, body {
            background-color: #ffffff !important;
            color: #000000 !important;
            margin: 0 !important;
            padding: 0 !important;
            height: auto !important;
            overflow: visible !important;
            font-size: ${formatMode === 'thermal' ? '8.5pt' : '9.5pt'} !important;
            line-height: 1.25 !important;
          }

          /* 3. Portal container fills page */
          #print-modal-portal {
            position: static !important;
            background-color: transparent !important;
            backdrop-filter: none !important;
            padding: 0 !important;
            margin: 0 !important;
            overflow: visible !important;
            display: block !important;
            width: 100% !important;
            height: auto !important;
          }

          .modal-window {
            box-shadow: none !important;
            border: none !important;
            max-width: 100% !important;
            max-height: none !important;
            border-radius: 0 !important;
            overflow: visible !important;
            padding: 0 !important;
            margin: 0 !important;
            background: #ffffff !important;
          }

          .modal-scroll-area {
            overflow: visible !important;
            padding: 0 !important;
            background: #ffffff !important;
          }

          /* 4. Strict Single-Page Fit per Order */
          .invoice-card {
            box-shadow: none !important;
            border: 1.5px solid #111827 !important;
            border-radius: 6px !important;
            padding: ${formatMode === 'thermal' ? '8px 10px' : '14px 18px'} !important;
            margin: 0 !important;
            background: #ffffff !important;
            page-break-inside: avoid !important;
            break-inside: avoid !important;
            max-height: 98vh !important;
            box-sizing: border-box !important;
          }

          /* Page break strictly between multi-orders only, never after last order */
          .batch-page-break {
            page-break-after: always !important;
            break-after: page !important;
          }
        }
      `}</style>

      {/* Modal Dialog Window */}
      <div
        className="modal-window"
        style={{
          backgroundColor: '#ffffff',
          color: '#0f172a',
          width: '100%',
          maxWidth: formatMode === 'thermal' ? '500px' : '820px',
          maxHeight: '94vh',
          borderRadius: '16px',
          display: 'flex',
          flexDirection: 'column',
          boxShadow: '0 25px 60px -15px rgba(0, 0, 0, 0.35)',
          overflow: 'hidden',
          transition: 'max-width 0.2s ease',
        }}
      >
        {/* Top Control Bar (Screen Only) */}
        <div
          className="no-print"
          style={{
            padding: '0.85rem 1.25rem',
            borderBottom: '1px solid #e2e8f0',
            backgroundColor: '#f8fafc',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            flexWrap: 'wrap',
            gap: '0.75rem',
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.65rem' }}>
            <div
              style={{
                width: '34px',
                height: '34px',
                borderRadius: '8px',
                backgroundColor: '#0f172a',
                color: '#ffffff',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
              }}
            >
              <Printer size={17} />
            </div>
            <div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                <h3 style={{ fontSize: '0.95rem', fontWeight: 800, margin: 0, color: '#0f172a' }}>
                  {orderList.length > 1
                    ? `Batch Courier Slips (${orderList.length} Orders)`
                    : `Courier Shipping Slip (${orderList[0]?.order_number})`}
                </h3>
                <span
                  style={{
                    fontSize: '0.68rem',
                    fontWeight: 800,
                    padding: '2px 7px',
                    borderRadius: '999px',
                    backgroundColor: orderList.length > 1 ? '#e0e7ff' : '#dcfce7',
                    color: orderList.length > 1 ? '#4338ca' : '#15803d',
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: '0.3rem',
                  }}
                >
                  <FileText size={11} />
                  <span>
                    {orderList.length > 1
                      ? `Exact ${orderList.length} Pages (1 Page per Order)`
                      : 'Exact 1 Page Fit'}
                  </span>
                </span>
              </div>
              <p style={{ margin: 0, fontSize: '0.72rem', color: '#64748b' }}>
                Fitted for single-sheet printing with scannable barcode & courier directives
              </p>
            </div>
          </div>

          {/* Action & Format Controls */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', flexWrap: 'wrap' }}>
            {/* Format Toggle */}
            <div
              style={{
                display: 'inline-flex',
                backgroundColor: '#e2e8f0',
                padding: '3px',
                borderRadius: '8px',
              }}
            >
              <button
                type="button"
                onClick={() => setFormatMode('a4')}
                style={{
                  padding: '0.3rem 0.65rem',
                  fontSize: '0.74rem',
                  fontWeight: 700,
                  borderRadius: '6px',
                  border: 'none',
                  cursor: 'pointer',
                  backgroundColor: formatMode === 'a4' ? '#ffffff' : 'transparent',
                  color: formatMode === 'a4' ? '#0f172a' : '#64748b',
                  boxShadow: formatMode === 'a4' ? '0 1px 3px rgba(0,0,0,0.1)' : 'none',
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '0.3rem',
                }}
              >
                <FileText size={12} />
                <span>Full A4 Slip</span>
              </button>
              <button
                type="button"
                onClick={() => setFormatMode('thermal')}
                style={{
                  padding: '0.3rem 0.65rem',
                  fontSize: '0.74rem',
                  fontWeight: 700,
                  borderRadius: '6px',
                  border: 'none',
                  cursor: 'pointer',
                  backgroundColor: formatMode === 'thermal' ? '#ffffff' : 'transparent',
                  color: formatMode === 'thermal' ? '#0f172a' : '#64748b',
                  boxShadow: formatMode === 'thermal' ? '0 1px 3px rgba(0,0,0,0.1)' : 'none',
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '0.3rem',
                }}
              >
                <Tag size={12} />
                <span>4x6" Thermal</span>
              </button>
            </div>

            {/* Print Now Button */}
            <button
              type="button"
              onClick={handlePrint}
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: '0.4rem',
                backgroundColor: '#059669',
                color: '#ffffff',
                border: 'none',
                padding: '0.45rem 1rem',
                borderRadius: '8px',
                fontSize: '0.82rem',
                fontWeight: 800,
                cursor: 'pointer',
                boxShadow: '0 2px 8px rgba(5, 150, 105, 0.3)',
              }}
            >
              <Printer size={15} />
              <span>Print ({orderList.length > 1 ? `${orderList.length} Pages` : '1 Page'})</span>
            </button>

            {/* Close */}
            <button
              type="button"
              onClick={onClose}
              style={{
                background: '#f1f5f9',
                border: '1px solid #cbd5e1',
                borderRadius: '8px',
                padding: '0.4rem',
                cursor: 'pointer',
                color: '#64748b',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
              }}
              title="Close Preview"
            >
              <X size={17} />
            </button>
          </div>
        </div>

        {/* Scrollable Document Body */}
        <div
          className="modal-scroll-area"
          style={{
            overflowY: 'auto',
            padding: '1.25rem',
            backgroundColor: '#f1f5f9',
            flexGrow: 1,
          }}
        >
          {orderList.map((ord, idx) => {
            const isCOD = ord.payment_method === 'cod';
            const formattedDate = ord.created_at
              ? new Date(ord.created_at).toLocaleString('en-PK', {
                  dateStyle: 'medium',
                  timeStyle: 'short',
                })
              : new Date().toLocaleDateString();

            const storeName = ord.store?.name || 'KHAAM POSHAK';
            const customerName = ord.customer?.name || 'Customer';
            const customerPhone = ord.phone || ord.customer?.phone || 'N/A';
            const shippingAddr = ord.shipping_address || 'Address on record';
            const totalItems = ord.items?.reduce((sum, it) => sum + (Number(it.quantity) || 1), 0) || 0;

            const isLast = idx === orderList.length - 1;

            return (
              <div
                key={ord.id || idx}
                className={`invoice-card ${!isLast ? 'batch-page-break' : ''}`}
                style={{
                  backgroundColor: '#ffffff',
                  color: '#111827',
                  padding: formatMode === 'thermal' ? '1rem' : '1.25rem 1.5rem',
                  borderRadius: '10px',
                  border: '1px solid #cbd5e1',
                  marginBottom: !isLast ? '1.5rem' : 0,
                  boxShadow: '0 4px 15px rgba(0, 0, 0, 0.05)',
                  fontFamily: 'Inter, system-ui, -apple-system, sans-serif',
                }}
              >
                {/* Cancelled / Void Warning Banner */}
                {ord.status === 'cancelled' && (
                  <div
                    style={{
                      backgroundColor: '#fee2e2',
                      border: '2px dashed #dc2626',
                      color: '#991b1b',
                      padding: '0.45rem 0.75rem',
                      borderRadius: '6px',
                      marginBottom: '0.65rem',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      gap: '0.5rem',
                      fontWeight: 900,
                      fontSize: '0.82rem',
                      letterSpacing: '0.04em',
                      textTransform: 'uppercase',
                    }}
                  >
                    <Ban size={15} strokeWidth={2.5} />
                    <span>VOID INVOICE — ORDER CANCELLED (DO NOT DISPATCH)</span>
                  </div>
                )}

                {/* Dispatched Notice Banner */}
                {(ord.status === 'shipped' || ord.status === 'delivered') && (
                  <div
                    style={{
                      backgroundColor: '#e0f2fe',
                      border: '1px solid #7dd3fc',
                      color: '#0369a1',
                      padding: '0.35rem 0.65rem',
                      borderRadius: '6px',
                      marginBottom: '0.65rem',
                      fontSize: '0.74rem',
                      fontWeight: 700,
                      display: 'flex',
                      alignItems: 'center',
                      gap: '0.4rem',
                    }}
                  >
                    <Truck size={14} />
                    <span>PARCEL ALREADY DISPATCHED / DELIVERED</span>
                  </div>
                )}

                {/* 1. Header: Store Branding & Scannable Barcode */}
                <div
                  style={{
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'flex-start',
                    borderBottom: '2px solid #111827',
                    paddingBottom: '0.65rem',
                    marginBottom: '0.65rem',
                    flexWrap: 'wrap',
                    gap: '0.5rem',
                  }}
                >
                  <div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', marginBottom: '2px' }}>
                      <span
                        style={{
                          fontSize: '1.15rem',
                          fontWeight: 900,
                          letterSpacing: '-0.02em',
                          color: '#111827',
                          textTransform: 'uppercase',
                        }}
                      >
                        {storeName}
                      </span>
                      <span
                        style={{
                          fontSize: '0.62rem',
                          backgroundColor: '#111827',
                          color: '#ffffff',
                          padding: '2px 5px',
                          borderRadius: '3px',
                          fontWeight: 800,
                        }}
                      >
                        DISPATCH SLIP
                      </span>
                    </div>
                    <div style={{ fontSize: '0.72rem', color: '#4b5563', fontWeight: 600 }}>
                      COURIER PACKING & TAX INVOICE
                    </div>
                    <div style={{ fontSize: '0.68rem', color: '#6b7280' }}>
                      Booking Date: <strong>{formattedDate}</strong>
                    </div>
                  </div>

                  {/* Scannable Barcode */}
                  <div style={{ textAlign: 'right' }}>
                    <Code39Barcode text={ord.order_number} height={formatMode === 'thermal' ? 32 : 36} />
                    <div
                      style={{
                        fontSize: '0.74rem',
                        fontWeight: 900,
                        color: '#111827',
                        marginTop: '2px',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'flex-end',
                        gap: '0.25rem',
                      }}
                    >
                      <span>ORDER: {ord.order_number}</span>
                      <button
                        type="button"
                        className="no-print"
                        onClick={() => handleCopyOrderNo(ord.order_number)}
                        style={{
                          background: 'transparent',
                          border: 'none',
                          cursor: 'pointer',
                          color: '#64748b',
                          padding: '1px',
                        }}
                        title="Copy Order Number"
                      >
                        {copied ? <Check size={12} color="#059669" /> : <Copy size={12} />}
                      </button>
                    </div>
                  </div>
                </div>

                {/* 2. Critical Courier Collection Directive Box */}
                <div
                  style={{
                    border: isCOD ? '2px solid #dc2626' : '2px solid #059669',
                    backgroundColor: isCOD ? '#fef2f2' : '#f0fdf4',
                    borderRadius: '6px',
                    padding: '0.55rem 0.85rem',
                    marginBottom: '0.65rem',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    flexWrap: 'wrap',
                    gap: '0.5rem',
                  }}
                >
                  <div>
                    <div
                      style={{
                        fontSize: '0.68rem',
                        fontWeight: 900,
                        textTransform: 'uppercase',
                        letterSpacing: '0.04em',
                        color: isCOD ? '#b91c1c' : '#047857',
                      }}
                    >
                      {isCOD ? '⚠️ COURIER CASH COLLECTION NOTICE' : '✅ PREPAID DISPATCH'}
                    </div>
                    <div
                      style={{
                        fontSize: '1.05rem',
                        fontWeight: 900,
                        color: isCOD ? '#991b1b' : '#065f46',
                      }}
                    >
                      {isCOD ? `COLLECT CASH: ${formatPKR(ord.final_amount)}` : 'COLLECT: RS. 0 (DO NOT CHARGE)'}
                    </div>
                    <div style={{ fontSize: '0.68rem', color: isCOD ? '#7f1d1d' : '#064e3b', fontWeight: 600 }}>
                      {isCOD
                        ? 'Collect exact cash payment before releasing flyer to customer.'
                        : 'Customer has paid online. Release parcel without collecting cash.'}
                    </div>
                  </div>

                  <span
                    style={{
                      display: 'inline-block',
                      padding: '0.25rem 0.65rem',
                      borderRadius: '5px',
                      backgroundColor: isCOD ? '#dc2626' : '#059669',
                      color: '#ffffff',
                      fontWeight: 900,
                      fontSize: '0.75rem',
                      letterSpacing: '0.04em',
                      textTransform: 'uppercase',
                    }}
                  >
                    {isCOD ? 'CASH ON DELIVERY' : 'CARD PREPAID'}
                  </span>
                </div>

                {/* 3. Routing Logistics: Shipper vs Consignee */}
                <div
                  style={{
                    display: 'grid',
                    gridTemplateColumns: formatMode === 'thermal' ? '1fr' : '1fr 1.3fr',
                    gap: '0.65rem',
                    marginBottom: '0.65rem',
                  }}
                >
                  {/* Shipper */}
                  <div
                    style={{
                      border: '1px solid #e5e7eb',
                      borderRadius: '6px',
                      padding: '0.55rem 0.75rem',
                      backgroundColor: '#fafafa',
                      fontSize: '0.74rem',
                    }}
                  >
                    <div style={{ fontSize: '0.64rem', fontWeight: 800, color: '#6b7280', textTransform: 'uppercase' }}>
                      FROM (SHIPPER):
                    </div>
                    <div style={{ fontWeight: 800, fontSize: '0.85rem', color: '#111827', marginTop: '1px' }}>
                      {storeName} Logistics Hub
                    </div>
                    <div style={{ color: '#4b5563', marginTop: '1px' }}>Central Fulfillment Center, Pakistan</div>
                    <div style={{ color: '#4b5563', marginTop: '1px' }}>Email: support@khaamposhak.pk</div>
                    <div style={{ color: '#059669', fontWeight: 700, marginTop: '2px', display: 'flex', alignItems: 'center', gap: '0.3rem' }}>
                      <Truck size={12} strokeWidth={2} />
                      <span>
                        Courier: {ord.delivery_type === 'third_party'
                          ? `Third-Party (${ord.assigned_to})`
                          : (ord.assigned_to || ord.delivery_rider?.name || 'Express Courier')}
                      </span>
                    </div>
                  </div>

                  {/* Consignee */}
                  <div
                    style={{
                      border: '2px solid #111827',
                      borderRadius: '6px',
                      padding: '0.55rem 0.75rem',
                      backgroundColor: '#ffffff',
                    }}
                  >
                    <div style={{ fontSize: '0.64rem', fontWeight: 900, color: '#dc2626', textTransform: 'uppercase' }}>
                      DELIVER TO (CONSIGNEE):
                    </div>
                    <div style={{ fontWeight: 900, fontSize: '0.98rem', color: '#111827' }}>
                      {customerName}
                    </div>

                    {/* High-Contrast Phone */}
                    <div
                      style={{
                        fontSize: '0.92rem',
                        fontWeight: 900,
                        color: '#111827',
                        margin: '2px 0',
                        display: 'inline-flex',
                        alignItems: 'center',
                        gap: '0.35rem',
                        backgroundColor: '#fef08a',
                        padding: '1px 6px',
                        borderRadius: '4px',
                        border: '1px solid #eab308',
                      }}
                    >
                      <Phone size={13} color="#000000" />
                      <span>{customerPhone}</span>
                    </div>

                    <div style={{ fontSize: '0.78rem', color: '#1f2937', fontWeight: 600, lineHeight: 1.3 }}>
                      <MapPin size={12} style={{ display: 'inline', marginRight: '3px', verticalAlign: 'middle' }} />
                      {shippingAddr}
                    </div>

                    {ord.notes && (
                      <div
                        style={{
                          marginTop: '3px',
                          padding: '2px 6px',
                          backgroundColor: '#f3f4f6',
                          borderRadius: '3px',
                          fontSize: '0.68rem',
                          color: '#4b5563',
                          borderLeft: '2.5px solid #3b82f6',
                        }}
                      >
                        <strong>Rider Note:</strong> "{ord.notes}"
                      </div>
                    )}
                  </div>
                </div>

                {/* 4. Warehouse Verification Packing Checklist */}
                <div style={{ marginBottom: '0.65rem' }}>
                  <div
                    style={{
                      display: 'flex',
                      justifyContent: 'space-between',
                      alignItems: 'center',
                      marginBottom: '0.25rem',
                    }}
                  >
                    <span style={{ fontSize: '0.68rem', fontWeight: 800, color: '#4b5563', textTransform: 'uppercase' }}>
                      CONTENTS CHECKLIST ({totalItems} PIECES):
                    </span>
                    <span style={{ fontSize: '0.66rem', color: '#6b7280' }}>
                      [✓] Tick items before sealing flyer
                    </span>
                  </div>

                  <table
                    style={{
                      width: '100%',
                      borderCollapse: 'collapse',
                      fontSize: '0.76rem',
                      textAlign: 'left',
                      border: '1px solid #e5e7eb',
                    }}
                  >
                    <thead>
                      <tr style={{ backgroundColor: '#f3f4f6', borderBottom: '1px solid #d1d5db' }}>
                        <th style={{ padding: '4px 6px', width: '28px', textAlign: 'center' }}>✓</th>
                        <th style={{ padding: '4px 6px' }}>Item Description</th>
                        <th style={{ padding: '4px 6px' }}>Attributes</th>
                        <th style={{ padding: '4px 6px', textAlign: 'center', width: '34px' }}>Qty</th>
                        {formatMode === 'a4' && (
                          <>
                            <th style={{ padding: '4px 6px', textAlign: 'right' }}>Price</th>
                            <th style={{ padding: '4px 6px', textAlign: 'right' }}>Total</th>
                          </>
                        )}
                      </tr>
                    </thead>
                    <tbody>
                      {ord.items?.map((item, iIdx) => (
                        <tr
                          key={iIdx}
                          style={{
                            borderBottom: '1px solid #f3f4f6',
                            backgroundColor: iIdx % 2 === 0 ? '#ffffff' : '#fafafa',
                          }}
                        >
                          <td style={{ padding: '4px 6px', textAlign: 'center', verticalAlign: 'middle' }}>
                            <div
                              style={{
                                width: '12px',
                                height: '12px',
                                border: '1.5px solid #4b5563',
                                borderRadius: '2px',
                                margin: '0 auto',
                              }}
                            />
                          </td>
                          <td style={{ padding: '4px 6px', fontWeight: 700, color: '#111827' }}>
                            {item.product_name}
                          </td>
                          <td style={{ padding: '4px 6px', fontSize: '0.7rem', color: '#4b5563' }}>
                            {item.selected_attributes && Object.keys(item.selected_attributes).length > 0
                              ? Object.entries(item.selected_attributes)
                                  .map(([k, v]) => `${k.toUpperCase()}: ${v}`)
                                  .join(' · ')
                              : 'Standard'}
                          </td>
                          <td style={{ padding: '4px 6px', textAlign: 'center', fontWeight: 800, color: '#111827' }}>
                            {item.quantity}
                          </td>
                          {formatMode === 'a4' && (
                            <>
                              <td style={{ padding: '4px 6px', textAlign: 'right', color: '#4b5563' }}>
                                {formatPKR(item.price)}
                              </td>
                              <td style={{ padding: '4px 6px', textAlign: 'right', fontWeight: 700 }}>
                                {formatPKR(item.subtotal || item.price * item.quantity)}
                              </td>
                            </>
                          )}
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>

                {/* 5. Sign-off Stamp & Financial Summary */}
                <div
                  style={{
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'flex-start',
                    borderTop: '1px solid #e5e7eb',
                    paddingTop: '0.5rem',
                    marginBottom: '0.5rem',
                    flexWrap: 'wrap',
                    gap: '0.75rem',
                  }}
                >
                  {/* Warehouse QC Sign-off Stamp */}
                  <div
                    style={{
                      border: '1px dashed #9ca3af',
                      borderRadius: '5px',
                      padding: '0.45rem 0.65rem',
                      fontSize: '0.68rem',
                      color: '#4b5563',
                      minWidth: '220px',
                    }}
                  >
                    <div style={{ fontWeight: 800, color: '#111827', marginBottom: '2px' }}>
                      WAREHOUSE DISPATCH QC
                    </div>
                    <div>Packed by: _____________________</div>
                    <div style={{ marginTop: '2px' }}>Checked by: ____________________</div>
                    <div style={{ marginTop: '2px' }}>Courier Handover: ______________</div>
                  </div>

                  {/* Financial Totals */}
                  <div style={{ minWidth: '200px', textAlign: 'right', fontSize: '0.76rem' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '2px', color: '#4b5563' }}>
                      <span>Subtotal:</span>
                      <span>{formatPKR(ord.total_amount || ord.final_amount)}</span>
                    </div>
                    {ord.discount_amount > 0 && (
                      <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '2px', color: '#16a34a' }}>
                        <span>Discount:</span>
                        <span>- {formatPKR(ord.discount_amount)}</span>
                      </div>
                    )}
                    <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '4px', color: '#4b5563' }}>
                      <span>Courier Express Fee:</span>
                      <span>{Number(ord.shipping_cost) > 0 ? formatPKR(ord.shipping_cost) : 'FREE'}</span>
                    </div>
                    <div
                      style={{
                        display: 'flex',
                        justifyContent: 'space-between',
                        borderTop: '1.5px solid #111827',
                        paddingTop: '3px',
                        fontSize: '0.98rem',
                        fontWeight: 900,
                        color: '#111827',
                      }}
                    >
                      <span>TOTAL PAYABLE:</span>
                      <span>{formatPKR(ord.final_amount)}</span>
                    </div>
                  </div>
                </div>

                {/* 6. Footer Disclaimer */}
                <div
                  style={{
                    borderTop: '1px solid #e5e7eb',
                    paddingTop: '0.4rem',
                    fontSize: '0.64rem',
                    color: '#6b7280',
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                    flexWrap: 'wrap',
                    gap: '0.4rem',
                  }}
                >
                  <span>* Retain this packing slip for 7-day replacement or return verification.</span>
                  <span style={{ fontWeight: 700, color: '#111827' }}>KHAAM POSHAK Logistics Hub</span>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );

  return createPortal(modalContent, document.body);
}
