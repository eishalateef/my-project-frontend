import React from 'react';
import { Link } from 'react-router-dom';
import { useStore } from '../context/StoreContext';
import { 
  Truck, 
  Lock, 
  Mail, 
  Phone, 
  CreditCard, 
  Banknote, 
  Smartphone, 
  Zap, 
  Shield, 
  Globe, 
  Clock 
} from 'lucide-react';
import KhaamLogo from './KhaamLogo';

export default function Footer() {
  const { storeType } = useStore();

  const isJewelry = storeType === 'jewelry';
  const isClothing = storeType === 'clothing';

  return (
    <footer style={{
      backgroundColor: isJewelry ? '#080808' : 'var(--card-bg)',
      borderTop: '1px solid var(--border-color)',
      color: 'var(--text-main)',
      marginTop: '4rem',
      padding: '3.5rem 2rem 2.25rem',
      fontFamily: 'var(--font-body, system-ui, sans-serif)',
    }}>
      <div style={{ maxWidth: '1280px', margin: '0 auto' }}>
        
        {/* ==============================================================
            MAIN CLEAN 4-COLUMN FOOTER CONTENT
           ============================================================== */}
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))',
          gap: '2.5rem',
          paddingBottom: '2.5rem',
          borderBottom: '1px solid var(--border-color)',
          marginBottom: '2rem',
        }}>
          {/* Column 1: Brand & Online-Only Atelier Identity */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.9rem' }}>
            {isClothing ? (
              <div style={{ marginBottom: '0.15rem' }}>
                <KhaamLogo variant="navbar" size="default" taglineText="HANDMADE DESIGNS • HEIRLOOM CRAFT" />
              </div>
            ) : (
              <div style={{
                fontSize: '1.25rem',
                fontWeight: 900,
                fontFamily: 'var(--font-heading)',
                color: 'var(--text-main)',
                letterSpacing: '0.04em',
              }}>
                {isJewelry ? 'AURA ROYALE' : 'MEGAMART PK'}
              </div>
            )}

            <p style={{ fontSize: '0.83rem', color: 'var(--text-muted)', lineHeight: 1.6, margin: 0 }}>
              {isClothing
                ? 'Artisanal luxury handloom & bespoke embroidered wear, crafted by master artisans and delivered directly to your doorstep across Pakistan.'
                : isJewelry
                ? 'Bespoke fine jewelry featuring certified conflict-free diamonds and hallmarked 24K gold, delivered in armored transit.'
                : 'Premier online marketplace delivering quality products nationwide with cash on delivery to your doorstep.'}
            </p>

            {/* Proud 100% Online Store Badge */}
            <div style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: '0.45rem',
              backgroundColor: isClothing ? 'rgba(227, 82, 5, 0.08)' : 'var(--surface)',
              border: isClothing ? '1px solid rgba(227, 82, 5, 0.25)' : '1px solid var(--border-color)',
              color: isClothing ? '#E35205' : 'var(--text-main)',
              padding: '0.35rem 0.75rem',
              borderRadius: '6px',
              fontSize: '0.74rem',
              fontWeight: 700,
              width: 'fit-content',
            }}>
              <Globe size={13} color={isClothing ? '#E35205' : 'currentColor'} />
              <span>100% Online Store • Delivery Across Pakistan Only</span>
            </div>

            <div style={{
              display: 'flex',
              alignItems: 'center',
              gap: '0.4rem',
              fontSize: '0.74rem',
              color: 'var(--text-muted)',
              marginTop: '0.1rem',
            }}>
              <Clock size={12} />
              <span>Shop 24/7 Online • Orders Dispatched Daily</span>
            </div>
          </div>

          {/* Column 2: Quick Navigation & Catalog */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
            <h4 style={{
              fontSize: '0.85rem',
              fontWeight: 800,
              textTransform: 'uppercase',
              letterSpacing: '0.08em',
              color: 'var(--text-main)',
              margin: '0 0 0.35rem 0',
            }}>
              Shop Online
            </h4>
            <Link to="/catalog" style={{ fontSize: '0.83rem', color: 'var(--text-muted)', textDecoration: 'none', transition: 'color 0.15s', lineHeight: 1.6 }}>
              All Collections & Catalog
            </Link>
            <Link to="/catalog?sort=latest" style={{ fontSize: '0.83rem', color: 'var(--text-muted)', textDecoration: 'none', transition: 'color 0.15s', lineHeight: 1.6 }}>
              New Seasonal Arrivals
            </Link>
            <Link to="/catalog?sort=featured" style={{ fontSize: '0.83rem', color: 'var(--text-muted)', textDecoration: 'none', transition: 'color 0.15s', lineHeight: 1.6 }}>
              Curated Highlights
            </Link>
            <Link to="/my-orders" style={{ fontSize: '0.83rem', color: 'var(--text-muted)', textDecoration: 'none', transition: 'color 0.15s', lineHeight: 1.6 }}>
              My Orders & Receipts
            </Link>
            <Link to="/track-order" style={{
              fontSize: '0.83rem',
              color: isClothing ? '#E35205' : 'var(--primary-color)',
              fontWeight: 700,
              textDecoration: 'none',
              display: 'inline-flex',
              alignItems: 'center',
              gap: '0.35rem',
              marginTop: '0.2rem',
              lineHeight: 1.6,
            }}>
              <Truck size={14} />
              <span>Track Live Order</span>
            </Link>
          </div>

          {/* Column 3: Online Order Support & Care */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
            <h4 style={{
              fontSize: '0.85rem',
              fontWeight: 800,
              textTransform: 'uppercase',
              letterSpacing: '0.08em',
              color: 'var(--text-main)',
              margin: '0 0 0.35rem 0',
            }}>
              Customer Care
            </h4>
            <div style={{ fontSize: '0.83rem', color: 'var(--text-muted)', lineHeight: 1.6 }}>
              Nationwide Delivery (Pakistan Only)
            </div>
            <div style={{ fontSize: '0.83rem', color: 'var(--text-muted)', lineHeight: 1.6 }}>
              Cash on Delivery (COD) Available
            </div>
            <div style={{ fontSize: '0.83rem', color: 'var(--text-muted)', lineHeight: 1.6 }}>
              14-Day Doorstep Size Exchange
            </div>
            <div style={{ fontSize: '0.83rem', color: 'var(--text-muted)', lineHeight: 1.6 }}>
              Safe Packaging & Parcel Tracking
            </div>
            <Link to="/track-order" style={{ fontSize: '0.83rem', color: 'var(--text-muted)', textDecoration: 'none', lineHeight: 1.6 }}>
              Check Delivery Status
            </Link>
          </div>

          {/* Column 4: Contact & Secure Online Payment */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.85rem' }}>
            <h4 style={{
              fontSize: '0.85rem',
              fontWeight: 800,
              textTransform: 'uppercase',
              letterSpacing: '0.08em',
              color: 'var(--text-main)',
              margin: '0 0 0.2rem 0',
            }}>
              Online Help & Checkout
            </h4>

            {/* Direct Support Contacts */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.45rem', fontSize: '0.8rem', color: 'var(--text-muted)' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                <Phone size={13} color={isClothing ? '#E35205' : 'var(--primary-color)'} />
                <span style={{ fontWeight: 600, color: 'var(--text-main)' }}>
                  {isClothing ? 'UAN: +92 (042) 111-KHAAM (542-26)' : isJewelry ? '+92 (042) 3571-AURA' : '+92 (021) 111-MEGA'}
                </span>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                <Mail size={13} color={isClothing ? '#E35205' : 'var(--primary-color)'} />
                <span>
                  {isClothing ? 'customercare@khaamposhak.pk' : isJewelry ? 'concierge@auraroyale.pk' : 'support@megamart.pk'}
                </span>
              </div>
            </div>

            {/* Clean Payment Badges */}
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.4rem', marginTop: '0.25rem' }}>
              <span style={{
                fontSize: '0.72rem',
                padding: '0.25rem 0.55rem',
                borderRadius: '4px',
                backgroundColor: 'var(--surface)',
                border: '1px solid var(--border-color)',
                fontWeight: 700,
                display: 'inline-flex',
                alignItems: 'center',
                gap: '0.3rem',
              }}>
                <Banknote size={12} color={isClothing ? '#E35205' : 'currentColor'} />
                <span>Cash on Delivery</span>
              </span>

              {isClothing && (
                <>
                  <span style={{
                    fontSize: '0.72rem',
                    padding: '0.25rem 0.55rem',
                    borderRadius: '4px',
                    backgroundColor: 'rgba(227, 82, 5, 0.08)',
                    color: '#E35205',
                    border: '1px solid rgba(227, 82, 5, 0.25)',
                    fontWeight: 700,
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: '0.3rem',
                  }}>
                    <Shield size={12} color="#E35205" />
                    <span>SafePay</span>
                  </span>
                  <span style={{
                    fontSize: '0.72rem',
                    padding: '0.25rem 0.55rem',
                    borderRadius: '4px',
                    backgroundColor: 'rgba(16, 185, 129, 0.08)',
                    color: '#059669',
                    border: '1px solid rgba(16, 185, 129, 0.25)',
                    fontWeight: 700,
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: '0.3rem',
                  }}>
                    <Smartphone size={12} color="#059669" />
                    <span>Easypaisa</span>
                  </span>
                  <span style={{
                    fontSize: '0.72rem',
                    padding: '0.25rem 0.55rem',
                    borderRadius: '4px',
                    backgroundColor: 'rgba(239, 68, 68, 0.08)',
                    color: '#dc2626',
                    border: '1px solid rgba(239, 68, 68, 0.25)',
                    fontWeight: 700,
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: '0.3rem',
                  }}>
                    <Zap size={12} color="#dc2626" />
                    <span>JazzCash</span>
                  </span>
                </>
              )}

              <span style={{
                fontSize: '0.72rem',
                padding: '0.25rem 0.55rem',
                borderRadius: '4px',
                backgroundColor: 'var(--surface)',
                border: '1px solid var(--border-color)',
                fontWeight: 700,
                display: 'inline-flex',
                alignItems: 'center',
                gap: '0.3rem',
              }}>
                <CreditCard size={12} />
                <span>Card</span>
              </span>

              <span style={{
                fontSize: '0.72rem',
                padding: '0.25rem 0.55rem',
                borderRadius: '4px',
                backgroundColor: 'var(--surface)',
                border: '1px solid var(--border-color)',
                fontWeight: 700,
                display: 'inline-flex',
                alignItems: 'center',
                gap: '0.3rem',
              }}>
                <Lock size={12} color="#10b981" />
                <span>SSL Encrypted</span>
              </span>
            </div>
          </div>
        </div>

        {/* ==============================================================
            3. FOOTER BOTTOM BAR (MINIMAL, BALANCED, CLEAN)
           ============================================================== */}
        <div style={{
          display: 'flex',
          flexWrap: 'wrap',
          alignItems: 'center',
          justifyContent: 'space-between',
          gap: '1rem',
          fontSize: '0.78rem',
          color: 'var(--text-muted)',
        }}>
          <div>
            © 2026 {isClothing ? 'KHAAM POSHAK (خام پوشاک)' : isJewelry ? 'AURA ROYALE' : 'MEGAMART PK'}. 100% Online Store • All rights reserved.
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '1.25rem' }}>
            <Link to="/track-order" style={{ color: 'inherit', textDecoration: 'none' }}>
              Track Order
            </Link>
            <Link to="/catalog" style={{ color: 'inherit', textDecoration: 'none' }}>
              All Products
            </Link>
            <Link to="/my-orders" style={{ color: 'inherit', textDecoration: 'none' }}>
              My Orders
            </Link>
          </div>
        </div>

      </div>
    </footer>
  );
}

