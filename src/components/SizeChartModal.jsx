import React, { useState, useEffect } from 'react';
import { useStore } from '../context/StoreContext';
import { Ruler, X, CheckCircle2, Sparkles, Package, Info, ShieldCheck } from 'lucide-react';

export const MEASUREMENT_CATEGORIES = {
  dress: {
    id: 'dress',
    label: 'Stitched Dresses',
    icon: '👗',
    badge: 'Stitched Pret & Pishwas',
    title: 'Hand-Embroidered Stitched Dress & Pishwas Measurement Guide',
    subtitle: 'Tailored by master Pakistani artisans with graceful drape, authentic stitch precision, and 1.5-inch inner side seam margins for custom alterations.',
    columns: ['Size', 'Chest / Bust', 'Shoulder', 'Dress Length', 'Sleeve Length', 'Flare / Ghera', 'Trouser Length'],
    rows: [
      ['XS', '36 in / 91 cm', '14.5 in / 37 cm', '48 in / 122 cm', '21.0 in / 53 cm', '110 in / 280 cm', '37 in / 94 cm'],
      ['S', '38 in / 96 cm', '15.0 in / 38 cm', '49 in / 124 cm', '21.5 in / 55 cm', '115 in / 292 cm', '38 in / 96 cm'],
      ['M', '40 in / 102 cm', '15.5 in / 39 cm', '50 in / 127 cm', '22.0 in / 56 cm', '120 in / 305 cm', '39 in / 99 cm'],
      ['L', '43 in / 109 cm', '16.0 in / 41 cm', '50 in / 127 cm', '22.5 in / 57 cm', '125 in / 317 cm', '40 in / 102 cm'],
      ['XL', '46 in / 117 cm', '16.5 in / 42 cm', '51 in / 130 cm', '23.0 in / 58 cm', '130 in / 330 cm', '40 in / 102 cm'],
    ],
    howToMeasure: [
      { step: 'Chest / Bust', desc: 'Measure around the fullest part of your chest keeping the tape comfortable and level.' },
      { step: 'Shoulder', desc: 'Measure horizontally across your back from shoulder bone tip to shoulder bone tip.' },
      { step: 'Dress Length', desc: 'Measured from high shoulder neck point straight down to the lower hemline.' },
      { step: '1.5-Inch Margin', desc: 'All stitched dresses include 1.5 inches of inner side seam allowance for effortless personal resizing.' },
    ],
    fitNote: 'Tailored using traditional Pakistani seam allowances. If between sizes, choose the larger size for a relaxed traditional silhouette.',
  },
  'crochet-bag': {
    id: 'crochet-bag',
    label: 'Crochet Bags',
    icon: '🧶',
    badge: 'Hand-Hooked Cotton Yarn',
    title: 'Artisanal Crochet Bag Dimensions & Capacity Sheet',
    subtitle: 'Hand-hooked with 100% pure organic cotton yarn & macramé cord with flexible stitch memory for everyday utility.',
    columns: ['Bag Style', 'Height', 'Width', 'Handle / Strap Drop', 'Everyday Fit & Capacity'],
    rows: [
      ['Crochet Tote Bag', '14 in / 36 cm', '13 in / 33 cm', '10 in / 25 cm (Shoulder)', 'Fits iPad, A5 journal, makeup pouch, water bottle & full wallet'],
      ['Floral Granny Square Bag', '12 in / 30 cm', '12 in / 30 cm', '9 in / 23 cm (Forearm)', 'Fits Kindle, continental wallet, sunglasses, keys & smartphone'],
      ['Mini Shoulder Crochet Bag', '7.5 in / 19 cm', '8.5 in / 22 cm', '19 in / 48 cm (Crossbody)', 'Fits iPhone 16 Pro Max, cardholder, lipgloss & car keys'],
      ['Potli Crochet Bag', '9 in / 23 cm', '7.5 in / 19 cm', '7 in / 18 cm (Drawstring)', 'Festive bag fitting smartphone, compact mirror, currency & lipstick'],
    ],
    howToMeasure: [
      { step: 'Handle Drop', desc: 'Measured from top of handle curve down to the upper rim of the bag.' },
      { step: 'Natural Flexibility', desc: 'Hand-crocheted stitches gently expand 1–2 inches when loaded without losing structural integrity.' },
      { step: 'Lining & Base', desc: 'Reinforced base weave prevents sagging when filled with daily essentials.' },
    ],
    fitNote: 'Includes soft breathable interior cotton lining with a quick-access pocket for phone and keys.',
  },
  'fabric-bag': {
    id: 'fabric-bag',
    label: 'Fabric Bags',
    icon: '👜',
    badge: 'Reinforced Canvas & Twill',
    title: 'Handcrafted Fabric & Quilted Bag Dimensions Sheet',
    subtitle: 'Crafted with premium reinforced cotton canvas, fine hand embroidery, and durable double-stitched lining.',
    columns: ['Bag Style', 'Height', 'Width', 'Base Gusset', 'Strap Drop', 'Capacity & Everyday Storage'],
    rows: [
      ['Floral Fabric Tote Bag', '15 in / 38 cm', '14 in / 36 cm', '4 in / 10 cm', '11 in / 28 cm', 'Fits 14-inch Laptop, A4 binders, planner & water bottle'],
      ['Quilted Shoulder Bag', '11 in / 28 cm', '13 in / 33 cm', '3.5 in / 9 cm', '10 in / 25 cm', 'Padded body cushions contents; interior zip pocket for valuables'],
      ['School / Work Fabric Bag', '16 in / 41 cm', '14.5 in / 37 cm', '4.5 in / 11 cm', '12 in / 30 cm', 'Dual-compartment interior designed for heavy books & tech'],
      ['Traditional Daily Bag', '13 in / 33 cm', '12 in / 30 cm', '3 in / 8 cm', '9 in / 23 cm', 'Lightweight casual ethnic tote for everyday market outings'],
    ],
    howToMeasure: [
      { step: 'Base Gusset', desc: 'Depth of the bottom base panel that allows the bag to sit upright on flat surfaces.' },
      { step: 'Heavy Load Seams', desc: 'All handles are box-stitched and reinforced for daily loads up to 8 kg.' },
      { step: 'Closure & Lining', desc: 'Features secure magnetic snap or zipper closure with durable cotton twill lining.' },
    ],
    fitNote: '100% pre-shrunk cotton canvas. Spot clean with mild soap or gentle hand-wash in cold water.',
  },
  'crochet-cap': {
    id: 'crochet-cap',
    label: 'Crochet Caps',
    icon: '🧢',
    badge: 'Hand-Knitted Breathable Weave',
    title: 'Crochet Cap & Beanie Measurement Sheet',
    subtitle: 'Hand-knitted with soft breathable cotton and cashmere-touch yarn for gentle, non-slip comfort without tight headache pressure.',
    columns: ['Profile / Fit Type', 'Head Circumference', 'Crown Depth', 'Ribbed Rim', 'Recommended Fit & Stretch'],
    rows: [
      ['Adult Standard (Free Stretch)', '21 – 23 in / 53 – 59 cm', '8.0 in / 20.5 cm', '2.0 in / 5.0 cm (Rollable)', 'Universal adult fit (Men & Women); gentle non-slip grip'],
      ['Adult Snug Traditional', '20 – 22 in / 51 – 56 cm', '7.5 in / 19.0 cm', '1.5 in / 4.0 cm (Fitted)', 'Close-to-head traditional textured prayer cap / topi style'],
      ['Youth & Teens', '19 – 21 in / 48 – 53 cm', '7.0 in / 18.0 cm', '1.5 in / 4.0 cm (Soft Rib)', 'Teenagers & smaller crown profiles with natural elasticity'],
      ['Kids / Toddler', '17 – 19 in / 43 – 48 cm', '6.0 in / 15.0 cm', '1.2 in / 3.0 cm (Non-itch)', 'Ages 2 – 6 years; extra gentle tension-free ribbed band'],
    ],
    howToMeasure: [
      { step: 'Head Circumference', desc: 'Wrap a soft measuring tape around your head, about 1 inch above your eyebrows and ears.' },
      { step: 'Crown Depth', desc: 'Measured from center top point of the crown down to the lower edge of the brim.' },
      { step: 'Organic Stretch', desc: 'Ribbed hand-crochet stitch naturally flexes up to 2.5 inches (6 cm) to prevent forehead pressure or headaches.' },
    ],
    fitNote: 'Hypoallergenic and breathable. Maintains warmth in winter while allowing natural ventilation.',
  },
  jewellery: {
    id: 'jewellery',
    label: 'Thread Jewellery',
    icon: '💍',
    badge: 'Resham Silk & Lightweight Core',
    title: 'Handmade Thread Jewellery Measurement & Fit Sheet',
    subtitle: 'Hand-wound using pure Resham silk thread, featherlight brass core, and skin-friendly hypoallergenic findings.',
    columns: ['Jewellery Piece', 'Size / Metric', 'Dimensions', 'Weight per Piece', 'Ergonomic Specifications'],
    rows: [
      ['Thread Jhumkas & Earrings', 'Standard Drop', '3.0 in / 7.5 cm Drop, 1.4 in / 3.5 cm Dome', '9g – 11g per ear', 'Featherlight silk dome; no earlobe drooping or soreness'],
      ['Resham Choker / Necklace', 'Adjustable', '12 in / 30 cm choker + 8 in / 20 cm dori', '22g total', 'Soft silk cord with adjustable drawstring dori fits any neck size'],
      ['Thread Bangles (Size 2.4)', 'Small', '2.25 in / 5.7 cm Inner Diameter', '14g (Pair)', 'For delicate small wrists (Wrist circumference 5.5" – 6.0")'],
      ['Thread Bangles (Size 2.6)', 'Medium (Standard)', '2.37 in / 6.0 cm Inner Diameter', '16g (Pair)', 'Most popular Pakistani standard fit (Wrist 6.0" – 6.5")'],
      ['Thread Bangles (Size 2.8)', 'Large', '2.50 in / 6.4 cm Inner Diameter', '18g (Pair)', 'Comfort slip-on for broad wrists (Wrist 6.5" – 7.2")'],
    ],
    howToMeasure: [
      { step: 'Finding Bangle Size', desc: 'Measure the inside diameter across the center of an existing well-fitting bangle (2.25" = 2.4, 2.37" = 2.6, 2.50" = 2.8).' },
      { step: 'Weight Balance', desc: 'Earrings are hand-wound on hollow ultra-light bases to prevent ear fatigue during long festive gatherings.' },
      { step: 'Skin Safety', desc: '100% lead-free, nickel-free, and hypoallergenic for sensitive skin.' },
    ],
    fitNote: 'Protected with water-resistant artisanal sealant. Keep away from direct perfume spray for lasting color brilliance.',
  },
  'kids-crochet': {
    id: 'kids-crochet',
    label: 'Kids Frocks & Tops',
    icon: '👶',
    badge: 'Hypoallergenic Organic Baby Yarn',
    title: 'Kids Handmade Crochet Tops & Frocks Sizing Matrix',
    subtitle: 'Knit from organic combed hypoallergenic baby yarn with gentle stretch and room for active movement.',
    columns: ['Age Bracket', 'Chest', 'Frock / Shirt Length', 'Child Height', 'Fit & Diaper Guidance'],
    rows: [
      ['0 – 6 Months', '16 in / 40 cm', '13 in / 33 cm', '55 – 68 cm', 'Gentle newborn stretch, easy overhead dressing'],
      ['6 – 12 Months', '18 in / 46 cm', '15 in / 38 cm', '68 – 76 cm', 'Extra diaper room and crawl-friendly flare'],
      ['1 – 2 Years', '20 in / 51 cm', '17 in / 43 cm', '76 – 86 cm', 'Toddler walking cut, non-trip hemline'],
      ['2 – 3 Years', '22 in / 56 cm', '20 in / 51 cm', '86 – 98 cm', 'Playful heirloom twirl frock'],
      ['3 – 4 Years', '23.5 in / 60 cm', '22 in / 56 cm', '98 – 108 cm', 'Partywear comfort with breathable armholes'],
    ],
    howToMeasure: [
      { step: 'Age vs Height', desc: 'If your child is taller or curvier than average for their age, we recommend sizing up one bracket.' },
      { step: 'Diaper Allowance', desc: 'Dresses and shirts feature relaxed hip cuts to accommodate cloth or disposable diapers.' },
      { step: 'Sensitive Skin', desc: 'Handcrafted with flat non-scratch seams and smooth baby-safe buttons.' },
    ],
    fitNote: 'Hypoallergenic and machine-safe on delicate handwash cycle. Flat non-scratch seams for sensitive skin.',
  },
};

export const detectProductMeasurementCategory = (product, storeType = 'clothing') => {
  if (!product) return 'dress';
  const lowerName = (product?.name || '').toLowerCase();
  const lowerCat = ((product?.category?.name || '') + ' ' + (product?.category?.slug || '')).toLowerCase();
  const subcategory = product?.attributes?.find((a) => a.attribute_name === 'subcategory')?.attribute_value || '';
  const lowerSub = subcategory.toLowerCase();

  if (
    lowerName.includes('cap') ||
    lowerName.includes('topi') ||
    lowerCat.includes('cap') ||
    lowerSub.includes('cap')
  ) {
    return 'crochet-cap';
  }

  if (
    lowerCat.includes('crochet-bag') ||
    (lowerName.includes('crochet') && (lowerName.includes('bag') || lowerName.includes('tote') || lowerName.includes('potli') || lowerName.includes('purse')))
  ) {
    return 'crochet-bag';
  }

  if (
    lowerCat.includes('fabric-bag') ||
    lowerName.includes('fabric bag') ||
    lowerName.includes('quilted') ||
    (lowerName.includes('bag') && !lowerName.includes('crochet'))
  ) {
    return 'fabric-bag';
  }

  if (
    storeType === 'jewelry' ||
    lowerCat.includes('jewel') ||
    lowerName.includes('jewel') ||
    lowerName.includes('jhumka') ||
    lowerName.includes('earring') ||
    lowerName.includes('bangle') ||
    lowerName.includes('necklace') ||
    lowerName.includes('resham') ||
    lowerName.includes('thread')
  ) {
    return 'jewellery';
  }

  if (
    lowerCat.includes('kid') ||
    lowerCat.includes('baby') ||
    lowerSub.includes('baby') ||
    lowerSub.includes('kid') ||
    lowerName.includes('baby') ||
    lowerName.includes('child') ||
    lowerName.includes('boys') ||
    (lowerName.includes('frock') && !lowerName.includes('pishwas') && !lowerCat.includes('pret'))
  ) {
    return 'kids-crochet';
  }

  return 'dress';
};

export default function SizeChartModal({ isOpen, onClose, product }) {
  const { storeType } = useStore();
  const [selectedTab, setSelectedTab] = useState('dress');

  // Sync tab with passed product whenever modal opens or product changes
  useEffect(() => {
    if (isOpen) {
      setSelectedTab(detectProductMeasurementCategory(product, storeType));
    }
  }, [isOpen, product, storeType]);

  if (!isOpen) return null;

  const currentCategory = MEASUREMENT_CATEGORIES[selectedTab] || MEASUREMENT_CATEGORIES.dress;
  const { title, subtitle, columns, rows, howToMeasure, fitNote, badge } = currentCategory;

  return (
    <div
      style={{
        position: 'fixed',
        inset: 0,
        backgroundColor: 'rgba(0, 0, 0, 0.75)',
        backdropFilter: 'blur(6px)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        zIndex: 100,
        padding: '1rem',
      }}
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
    >
      <div
        style={{
          backgroundColor: 'var(--card-bg, #ffffff)',
          border: '1px solid var(--border-color, #e5e7eb)',
          borderRadius: '16px',
          maxWidth: '780px',
          width: '100%',
          padding: '1.75rem',
          position: 'relative',
          maxHeight: '92vh',
          overflowY: 'auto',
          boxShadow: '0 20px 45px rgba(0, 0, 0, 0.25)',
        }}
        className="animate-fade-in"
      >
        {/* Close Button */}
        <button
          onClick={onClose}
          type="button"
          style={{
            position: 'absolute',
            top: '1.25rem',
            right: '1.25rem',
            background: '#f3f4f6',
            border: 'none',
            borderRadius: '50%',
            color: '#4b5563',
            cursor: 'pointer',
            padding: '0.45rem',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            transition: 'all 0.15s ease',
          }}
          title="Close measurement sheet"
          onMouseEnter={(e) => {
            e.currentTarget.style.backgroundColor = '#111111';
            e.currentTarget.style.color = '#ffffff';
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.backgroundColor = '#f3f4f6';
            e.currentTarget.style.color = '#4b5563';
          }}
        >
          <X size={18} />
        </button>

        {/* Modal Header */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem', marginBottom: '0.35rem' }}>
          <div
            style={{
              width: '36px',
              height: '36px',
              borderRadius: '8px',
              backgroundColor: 'rgba(227, 82, 5, 0.12)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: 'var(--primary-color, #E35205)',
            }}
          >
            <Ruler size={20} />
          </div>
          <div>
            <h2 style={{ fontSize: '1.3rem', fontWeight: 800, color: 'var(--text-main, #111111)', margin: 0 }}>
              Artisanal Measurement & Size Sheet
            </h2>
            <span style={{ fontSize: '0.74rem', fontWeight: 700, color: 'var(--primary-color, #E35205)', textTransform: 'uppercase', letterSpacing: '0.06em' }}>
              Handmade Precision Guide • All Pakistani Measurements
            </span>
          </div>
        </div>

        {/* Interactive Category Tabs */}
        <div
          style={{
            display: 'flex',
            gap: '0.4rem',
            overflowX: 'auto',
            padding: '0.75rem 0 0.85rem',
            borderBottom: '1px solid var(--border-color, #e5e7eb)',
            marginBottom: '1.25rem',
          }}
        >
          {Object.values(MEASUREMENT_CATEGORIES).map((cat) => {
            const isActive = selectedTab === cat.id;
            return (
              <button
                key={cat.id}
                type="button"
                onClick={() => setSelectedTab(cat.id)}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '0.45rem',
                  padding: '0.45rem 0.85rem',
                  borderRadius: '20px',
                  border: isActive ? '1.5px solid var(--primary-color, #E35205)' : '1px solid #e5e7eb',
                  backgroundColor: isActive ? 'rgba(227, 82, 5, 0.08)' : '#f9fafb',
                  color: isActive ? 'var(--primary-color, #E35205)' : '#4b5563',
                  fontSize: '0.8rem',
                  fontWeight: isActive ? 800 : 600,
                  cursor: 'pointer',
                  whiteSpace: 'nowrap',
                  transition: 'all 0.15s ease',
                  flexShrink: 0,
                }}
              >
                <span>{cat.icon}</span>
                <span>{cat.label}</span>
              </button>
            );
          })}
        </div>

        {/* Active Category Title & Description */}
        <div style={{ marginBottom: '1.15rem' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem', flexWrap: 'wrap', marginBottom: '0.3rem' }}>
            <h3 style={{ fontSize: '1.15rem', fontWeight: 800, color: 'var(--text-main, #111111)', margin: 0 }}>
              {title}
            </h3>
            {badge && (
              <span
                style={{
                  fontSize: '0.68rem',
                  fontWeight: 700,
                  backgroundColor: '#f3f4f6',
                  color: '#374151',
                  padding: '0.2rem 0.6rem',
                  borderRadius: '4px',
                  border: '1px solid #e5e7eb',
                }}
              >
                {badge}
              </span>
            )}
          </div>
          <p style={{ color: 'var(--text-muted, #64748b)', fontSize: '0.84rem', margin: 0, lineHeight: 1.55 }}>
            {subtitle}
          </p>
        </div>

        {/* Measurement Table */}
        <div
          style={{
            overflowX: 'auto',
            marginBottom: '1.25rem',
            border: '1px solid var(--border-color, #e5e7eb)',
            borderRadius: '10px',
            backgroundColor: '#ffffff',
          }}
        >
          <table
            style={{
              width: '100%',
              borderCollapse: 'collapse',
              fontSize: '0.84rem',
              textAlign: 'left',
            }}
          >
            <thead>
              <tr style={{ borderBottom: '2px solid var(--border-color, #e5e7eb)', backgroundColor: '#f9fafb' }}>
                {columns.map((col, idx) => (
                  <th
                    key={idx}
                    style={{
                      padding: '0.75rem 0.85rem',
                      fontWeight: 800,
                      color: '#111111',
                      whiteSpace: 'nowrap',
                      fontSize: '0.78rem',
                      textTransform: 'uppercase',
                      letterSpacing: '0.04em',
                    }}
                  >
                    {col}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {rows.map((row, rIdx) => (
                <tr
                  key={rIdx}
                  style={{
                    borderBottom: '1px solid var(--border-color, #e5e7eb)',
                    backgroundColor: rIdx % 2 === 0 ? 'transparent' : '#fafafa',
                  }}
                >
                  {row.map((cell, cIdx) => (
                    <td
                      key={cIdx}
                      style={{
                        padding: '0.75rem 0.85rem',
                        fontWeight: cIdx === 0 ? 800 : 500,
                        color: cIdx === 0 ? 'var(--primary-color, #E35205)' : '#374151',
                        whiteSpace: cIdx === 0 ? 'nowrap' : 'normal',
                      }}
                    >
                      {cell}
                    </td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* How to Measure & Fit Notes Section */}
        {howToMeasure && howToMeasure.length > 0 && (
          <div
            style={{
              backgroundColor: '#f8fafc',
              border: '1px solid #e2e8f0',
              borderRadius: '10px',
              padding: '1.1rem',
              marginBottom: '1.25rem',
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.45rem', color: '#1e293b', fontWeight: 800, fontSize: '0.86rem', marginBottom: '0.65rem' }}>
              <Info size={16} color="var(--primary-color, #E35205)" />
              <span>How to Measure & Sizing Advice</span>
            </div>
            <div
              style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))',
                gap: '0.6rem',
                fontSize: '0.8rem',
                color: '#475569',
              }}
            >
              {howToMeasure.map((m, idx) => (
                <div key={idx} style={{ lineHeight: 1.5 }}>
                  <strong style={{ color: '#0f172a' }}>{m.step}:</strong> {m.desc}
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Atelier Comfort & Delivery Guarantee Card */}
        <div
          style={{
            backgroundColor: 'rgba(227, 82, 5, 0.05)',
            padding: '1rem 1.15rem',
            borderRadius: '10px',
            fontSize: '0.8rem',
            color: '#4b5563',
            display: 'flex',
            flexDirection: 'column',
            gap: '0.45rem',
            border: '1px solid rgba(227, 82, 5, 0.2)',
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.45rem', color: '#111111', fontWeight: 800 }}>
            <CheckCircle2 size={16} color="var(--primary-color, #E35205)" />
            <span>Atelier Comfort & Fit Guarantee</span>
          </div>
          <div style={{ lineHeight: 1.5, color: '#374151' }}>
            {fitNote}
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.45rem', fontSize: '0.76rem', color: '#6b7280', marginTop: '0.2rem' }}>
            <ShieldCheck size={14} color="var(--primary-color, #E35205)" />
            <span>Complimentary 14-day door-to-door courier exchanges on all artisanal orders across Pakistan.</span>
          </div>
        </div>
      </div>
    </div>
  );
}
