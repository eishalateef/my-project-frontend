import React from 'react';
import { useStore } from '../context/StoreContext';
import { ShieldCheck, Award, X, Sparkles } from 'lucide-react';

export default function LuxuryCertificateModal({ isOpen, onClose }) {
  const { config } = useStore();

  if (!isOpen || !config.authenticityGuarantee) return null;

  const { title, points } = config.authenticityGuarantee;

  return (
    <div style={{
      position: 'fixed',
      inset: 0,
      backgroundColor: 'rgba(0, 0, 0, 0.85)',
      backdropFilter: 'blur(8px)',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      zIndex: 100,
      padding: '1rem',
    }}>
      <div style={{
        backgroundColor: '#111111',
        border: '2px solid #D4AF37',
        borderRadius: 'var(--radius)',
        maxWidth: '620px',
        width: '100%',
        padding: '2.5rem 2rem',
        position: 'relative',
        boxShadow: '0 0 40px rgba(212, 175, 55, 0.25)',
      }} className="animate-fade-in">
        <button
          onClick={onClose}
          style={{
            position: 'absolute',
            top: '1.25rem',
            right: '1.25rem',
            background: 'transparent',
            border: 'none',
            color: '#a3a3a3',
            cursor: 'pointer',
          }}
        >
          <X size={22} />
        </button>

        {/* Gold Seal Header */}
        <div style={{ textAlign: 'center', marginBottom: '1.75rem' }}>
          <div style={{
            width: '64px',
            height: '64px',
            margin: '0 auto 1rem',
            borderRadius: '50%',
            border: '2px solid #D4AF37',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            color: '#FFD700',
            backgroundColor: 'rgba(212, 175, 55, 0.1)',
            boxShadow: '0 0 20px rgba(212, 175, 55, 0.3)',
          }}>
            <Award size={36} />
          </div>

          <div style={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: '0.4rem',
            color: '#D4AF37',
            fontSize: '0.75rem',
            fontWeight: 800,
            textTransform: 'uppercase',
            letterSpacing: '0.1em',
            marginBottom: '0.35rem',
          }}>
            <Sparkles size={13} /> Royal Sovereign Assurance
          </div>

          <h2 style={{ fontSize: '1.75rem', color: '#FFFFFF', fontFamily: "'Playfair Display', serif" }}>
            {title}
          </h2>
        </div>

        {/* Guarantee Points */}
        <div style={{
          display: 'flex',
          flexDirection: 'column',
          gap: '1rem',
          marginBottom: '2rem',
        }}>
          {points.map((pt, idx) => (
            <div key={idx} style={{
              display: 'flex',
              alignItems: 'flex-start',
              gap: '0.85rem',
              backgroundColor: '#191919',
              padding: '1rem',
              borderRadius: '6px',
              border: '1px solid #262626',
            }}>
              <ShieldCheck size={20} style={{ color: '#D4AF37', flexShrink: 0, marginTop: '2px' }} />
              <p style={{ color: '#e5e5e5', fontSize: '0.9rem', lineHeight: 1.5 }}>
                {pt}
              </p>
            </div>
          ))}
        </div>

        {/* Seal footer */}
        <div style={{
          textAlign: 'center',
          borderTop: '1px solid #262626',
          paddingTop: '1.25rem',
          fontSize: '0.8rem',
          color: '#888888',
        }}>
          Assayed & Verified by Independent Gemological Institute Standards (IGI/GIA). Serial numbers verifiable globally.
        </div>
      </div>
    </div>
  );
}
