import React, { useState } from 'react';
import { useStore } from '../context/StoreContext';
import {
  SlidersHorizontal,
  RotateCcw,
  Ruler,
  Award,
  Check,
  Search,
  Palette,
  X,
  ChevronDown,
  ChevronUp,
  Sparkles,
  Tag,
  DollarSign,
  Layers,
  Scissors,
  Grid,
} from 'lucide-react';

// Refined Color name to Hex mapping for fashion palette swatches
export const getColorHex = (colorName) => {
  if (!colorName) return '#94A3B8';
  const str = String(colorName).trim();
  if (str.startsWith('#') && (str.length === 4 || str.length === 7)) return str;
  const lower = str.toLowerCase();
  if (lower.includes('off-white') || lower.includes('cream')) return '#FAF9F6';
  if (lower.includes('charcoal black') || lower.includes('noir') || lower.includes('pitch black') || lower.includes('jet black')) return '#111111';
  if (lower.includes('black')) return '#111111';
  if (lower.includes('porcelain white') || lower.includes('optical white') || lower.includes('white')) return '#FFFFFF';
  if (lower.includes('bone white') || lower.includes('ivory') || lower.includes('raw ivory')) return '#F7F4EE';
  if (lower.includes('beige') || lower.includes('khaki') || lower.includes('nude') || lower.includes('sand')) return '#D4C5A9';
  if (lower.includes('terracotta') || lower.includes('burnt orange') || lower.includes('rust')) return '#E35205';
  if (lower.includes('emerald') || lower.includes('bottle green') || lower.includes('dark olive') || lower.includes('olive green') || lower.includes('sage') || lower.includes('green')) return '#2D5A27';
  if (lower.includes('maroon') || lower.includes('burgundy') || lower.includes('deep maroon') || lower.includes('wine')) return '#6A1A24';
  if (lower.includes('crimson') || lower.includes('ruby') || lower.includes('red')) return '#A6192E';
  if (lower.includes('mustard') || lower.includes('ochre') || lower.includes('yellow')) return '#D9822B';
  if (lower.includes('peacock teal') || lower.includes('teal') || lower.includes('aqua') || lower.includes('seafoam') || lower.includes('cyan')) return '#006D77';
  if (lower.includes('midnight navy') || lower.includes('washed indigo') || lower.includes('indigo') || lower.includes('navy') || lower.includes('blue')) return '#1B263B';
  if (lower.includes('lavender') || lower.includes('lilac') || lower.includes('purple') || lower.includes('violet')) return '#8B5CF6';
  if (lower.includes('powder peach') || lower.includes('peach') || lower.includes('blush') || lower.includes('rose') || lower.includes('pink') || lower.includes('magenta')) return '#F4C2C2';
  if (lower.includes('champagne') || lower.includes('gold')) return '#D4AF37';
  if (lower.includes('silver')) return '#CBD5E1';
  if (lower.includes('orange')) return '#EA580C';
  if (lower.includes('camel') || lower.includes('tan') || lower.includes('coffee brown') || lower.includes('brown')) return '#8B5A2B';
  if (lower.includes('slate charcoal') || lower.includes('gray') || lower.includes('grey')) return '#64748B';
  return '#94A3B8';
};

export default function DynamicFilters({
  selectedFilters = {},
  onFilterChange,
  onResetFilters,
  onOpenSizeChart,
  onOpenCertificate,
  categories = [],
  selectedCategory,
  onSelectCategory,
  minPrice,
  maxPrice,
  onPriceChange,
  allProducts = [],
}) {
  const { storeType, config, availableAttributes, formatPrice } = useStore();
  const [colorSearch, setColorSearch] = useState('');
  const [localMinPrice, setLocalMinPrice] = useState(minPrice !== null && minPrice !== undefined ? minPrice : '');
  const [localMaxPrice, setLocalMaxPrice] = useState(maxPrice !== null && maxPrice !== undefined ? maxPrice : '');

  // Group categories into parent departments and their children
  const parentCategories = categories.filter((c) => !c.parent_id);
  const childCategories = categories.filter((c) => c.parent_id);

  // Independent Accordion Sections State (Khaadi style: distinct & never mixing)
  const [openSections, setOpenSections] = useState({
    category: true,
    craftsmanship: true,
    price: true,
    size: true,
    color: true,
    material: true,
    purity: true,
    gemstone: true,
    weight: true,
    brand: true,
  });

  const toggleSection = (sectionKey) => {
    setOpenSections((prev) => ({ ...prev, [sectionKey]: !prev[sectionKey] }));
  };

  // Calculate active counts per section
  const getFilterCount = (attrKey) => {
    const val = selectedFilters[attrKey];
    if (!val) return 0;
    if (Array.isArray(val)) return val.length;
    return 1;
  };

  const activeAttributeCount = Object.values(selectedFilters).reduce((acc, val) => {
    if (!val) return acc;
    if (Array.isArray(val)) return acc + val.length;
    return acc + 1;
  }, 0);

  const isPriceActive = (minPrice !== null && minPrice !== undefined && minPrice > 0) || (maxPrice !== null && maxPrice !== undefined);
  const totalActiveCount = activeAttributeCount + (selectedCategory ? 1 : 0) + (isPriceActive ? 1 : 0);

  // Generic multi/single toggle for any attribute
  const handleAttributeToggle = (attrName, value) => {
    const current = selectedFilters[attrName];
    let updated;

    if (Array.isArray(current)) {
      if (current.includes(value)) {
        updated = current.filter((v) => v !== value);
        if (updated.length === 0) updated = null;
      } else {
        updated = [...current, value];
      }
    } else if (current === value) {
      updated = null;
    } else {
      updated = value;
    }

    onFilterChange({
      ...selectedFilters,
      [attrName]: updated,
    });
  };

  const isAttrSelected = (attrName, value) => {
    const current = selectedFilters[attrName];
    if (Array.isArray(current)) return current.includes(value);
    return current === value;
  };

  // Price Limits & Presets
  const maxPriceLimit = storeType === 'jewelry' ? 500000 : 50000;
  const pricePresets = storeType === 'clothing'
    ? [
        { label: 'All', min: null, max: null },
        { label: '< Rs. 5,000', min: null, max: 5000 },
        { label: 'Rs. 5,000 - 10,000', min: 5000, max: 10000 },
        { label: 'Rs. 10,000 - 20,000', min: 10000, max: 20000 },
        { label: 'Rs. 20,000+', min: 20000, max: null },
      ]
    : [
        { label: 'All', min: null, max: null },
        { label: '< Rs. 50k', min: null, max: 50000 },
        { label: 'Rs. 50k - 150k', min: 50000, max: 150000 },
        { label: 'Rs. 150k+', min: 150000, max: null },
      ];

  const handleApplyCustomPrice = (e) => {
    e.preventDefault();
    const minVal = localMinPrice !== '' && !isNaN(Number(localMinPrice)) ? Number(localMinPrice) : null;
    const maxVal = localMaxPrice !== '' && !isNaN(Number(localMaxPrice)) ? Number(localMaxPrice) : null;
    if (onPriceChange) {
      onPriceChange({ min: minVal, max: maxVal });
    }
  };

  const handleSelectPricePreset = (preset) => {
    setLocalMinPrice(preset.min !== null ? String(preset.min) : '');
    setLocalMaxPrice(preset.max !== null ? String(preset.max) : '');
    if (onPriceChange) {
      onPriceChange({ min: preset.min, max: preset.max });
    }
  };

  // Accordion Header Component
  const renderAccordionHeader = (title, count, isOpen, onToggle, onClear) => (
    <div
      onClick={onToggle}
      style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        padding: '0.9rem 0',
        cursor: 'pointer',
        userSelect: 'none',
        borderBottom: isOpen ? '1px solid #f1f5f9' : '1px solid #e5e7eb',
        transition: 'all 0.15s ease',
      }}
    >
      <div style={{ display: 'flex', alignItems: 'center', gap: '0.45rem' }}>
        <span
          style={{
            fontSize: '0.8rem',
            fontWeight: 800,
            textTransform: 'uppercase',
            letterSpacing: '0.1em',
            color: '#111111',
            fontFamily: "'Plus Jakarta Sans', sans-serif",
          }}
        >
          {title}
        </span>
        {count > 0 && (
          <span
            style={{
              fontSize: '0.65rem',
              fontWeight: 800,
              backgroundColor: '#111111',
              color: '#ffffff',
              padding: '0.1rem 0.45rem',
              borderRadius: '999px',
            }}
          >
            {count}
          </span>
        )}
      </div>

      <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem' }}>
        {count > 0 && onClear && (
          <button
            type="button"
            onClick={(e) => {
              e.stopPropagation();
              onClear();
            }}
            style={{
              background: 'transparent',
              border: 'none',
              fontSize: '0.72rem',
              fontWeight: 700,
              color: '#E35205',
              cursor: 'pointer',
              padding: '0.2rem 0.4rem',
            }}
          >
            Clear
          </button>
        )}
        <div style={{ color: '#555555', display: 'flex', alignItems: 'center' }}>
          {isOpen ? <ChevronUp size={15} strokeWidth={2.2} /> : <ChevronDown size={15} strokeWidth={2.2} />}
        </div>
      </div>
    </div>
  );

  return (
    <aside
      style={{
        backgroundColor: '#ffffff',
        border: '1px solid #e5e7eb',
        borderRadius: '4px',
        padding: '1.25rem',
        display: 'flex',
        flexDirection: 'column',
        boxShadow: '0 1px 3px rgba(0, 0, 0, 0.04)',
        boxSizing: 'border-box',
        width: '100%',
        maxWidth: '100%',
        overflow: 'hidden',
      }}
    >
      {/* 1. Header & Reset Action */}
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          borderBottom: '1px solid #e5e7eb',
          paddingBottom: '1rem',
          marginBottom: '0.25rem',
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.55rem' }}>
          <SlidersHorizontal size={16} color="#111111" />
          <span
            style={{
              fontSize: '0.88rem',
              fontWeight: 800,
              color: '#111111',
              letterSpacing: '0.12em',
              textTransform: 'uppercase',
              fontFamily: "'Plus Jakarta Sans', sans-serif",
            }}
          >
            Refine By
          </span>
          {totalActiveCount > 0 && (
            <span
              style={{
                fontSize: '0.68rem',
                fontWeight: 800,
                padding: '0.12rem 0.45rem',
                borderRadius: '999px',
                backgroundColor: '#111111',
                color: '#ffffff',
              }}
            >
              {totalActiveCount}
            </span>
          )}
        </div>

        {totalActiveCount > 0 && (
          <button
            onClick={() => {
              setColorSearch('');
              setLocalMinPrice('');
              setLocalMaxPrice('');
              onResetFilters();
            }}
            style={{
              background: 'transparent',
              border: 'none',
              fontSize: '0.76rem',
              fontWeight: 700,
              color: '#E35205',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              gap: '0.3rem',
              padding: '0.2rem 0.4rem',
              textTransform: 'uppercase',
              letterSpacing: '0.04em',
            }}
          >
            <RotateCcw size={12} />
            <span>Reset All</span>
          </button>
        )}
      </div>

      {/* 2. Niche Helper CTA (Size Guide for Clothing) */}
      {storeType === 'clothing' && (
        <div style={{ margin: '0.75rem 0 0.5rem' }}>
          <button
            onClick={onOpenSizeChart}
            style={{
              width: '100%',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '0.5rem',
              padding: '0.65rem 0.85rem',
              borderRadius: '4px',
              backgroundColor: '#f7f7f8',
              border: '1px solid #e5e7eb',
              color: '#111111',
              fontSize: '0.78rem',
              fontWeight: 700,
              cursor: 'pointer',
              transition: 'all 0.18s ease',
              letterSpacing: '0.02em',
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.borderColor = '#111111';
              e.currentTarget.style.backgroundColor = '#ffffff';
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.borderColor = '#e5e7eb';
              e.currentTarget.style.backgroundColor = '#f7f7f8';
            }}
          >
            <Ruler size={14} color="#E35205" />
            <span>Size & Measurements Chart</span>
          </button>
        </div>
      )}

      {storeType === 'jewelry' && (
        <div style={{ margin: '0.75rem 0 0.5rem' }}>
          <button
            onClick={onOpenCertificate}
            style={{
              width: '100%',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '0.5rem',
              padding: '0.65rem 0.85rem',
              borderRadius: '4px',
              backgroundColor: '#0a0a0a',
              border: '1px solid #D4AF37',
              color: '#FFD700',
              fontSize: '0.78rem',
              fontWeight: 700,
              cursor: 'pointer',
            }}
          >
            <Award size={15} />
            <span>GIA & Assay Certificates</span>
          </button>
        </div>
      )}

      {/* =========================================================================
          SECTION 1: CATEGORIES ACCORDION (Clear & Never Mixed)
          ========================================================================= */}
      <div>
        {renderAccordionHeader(
          'Category',
          selectedCategory ? 1 : 0,
          openSections.category,
          () => toggleSection('category'),
          () => onSelectCategory(null)
        )}

        {openSections.category && (
          <div style={{ padding: '0.75rem 0 1rem', display: 'flex', flexDirection: 'column', gap: '0.65rem' }}>
            <button
              onClick={() => onSelectCategory(null)}
              style={{
                textAlign: 'left',
                padding: '0.45rem 0.6rem',
                borderRadius: '4px',
                backgroundColor: !selectedCategory ? '#f7f7f8' : 'transparent',
                color: !selectedCategory ? '#111111' : '#555555',
                fontWeight: !selectedCategory ? 800 : 500,
                fontSize: '0.8rem',
                border: 'none',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                width: '100%',
                boxSizing: 'border-box',
              }}
            >
              <span>All Items</span>
              {!selectedCategory && <Check size={14} color="#E35205" strokeWidth={2.5} />}
            </button>

            {parentCategories.length > 0 ? (
              parentCategories.map((parent) => {
                const children = parent.subcategories?.length > 0
                  ? parent.subcategories
                  : childCategories.filter((c) => c.parent_id === parent.id);
                const isParentSelected = selectedCategory === parent.id;
                const isChildSelected = children.some((c) => c.id === selectedCategory);
                const totalParentCount = (parent.products_count || 0) + children.reduce((sum, c) => sum + (c.products_count || 0), 0);

                return (
                  <div key={parent.id} style={{ display: 'flex', flexDirection: 'column', gap: '0.2rem' }}>
                    {/* Department Header */}
                    <button
                      onClick={() => onSelectCategory(isParentSelected ? null : parent.id)}
                      style={{
                        textAlign: 'left',
                        padding: '0.45rem 0.6rem',
                        borderRadius: '4px',
                        backgroundColor: isParentSelected ? '#111111' : isChildSelected ? '#f7f7f8' : 'transparent',
                        color: isParentSelected ? '#ffffff' : '#111111',
                        fontWeight: 800,
                        fontSize: '0.8rem',
                        border: 'none',
                        cursor: 'pointer',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'space-between',
                        width: '100%',
                        boxSizing: 'border-box',
                        letterSpacing: '0.04em',
                        textTransform: 'uppercase',
                        transition: 'all 0.15s ease',
                      }}
                    >
                      <span style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                        <span>{parent.name}</span>
                        {isChildSelected && !isParentSelected && (
                          <span style={{ fontSize: '0.65rem', color: '#E35205', fontWeight: 700 }}>(Filtered)</span>
                        )}
                      </span>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '0.35rem', flexShrink: 0 }}>
                        <span style={{ fontSize: '0.7rem', color: isParentSelected ? 'rgba(255,255,255,0.7)' : '#888888', fontWeight: 600 }}>
                          ({totalParentCount})
                        </span>
                        {isParentSelected && <Check size={14} color="#ffffff" strokeWidth={2.5} />}
                      </div>
                    </button>

                    {/* Subcategories & Nested Branches (Indented) */}
                    {children.length > 0 && (
                      <div style={{ paddingLeft: '0.85rem', borderLeft: '1.5px solid #e5e7eb', marginLeft: '0.6rem', display: 'flex', flexDirection: 'column', gap: '0.2rem', marginTop: '0.2rem' }}>
                        {children.map((child) => {
                          const grandchildren = child.subcategories || [];
                          const isSelected = selectedCategory === child.id;
                          const isGrandchildSelected = grandchildren.some((gc) => gc.id === selectedCategory);
                          const totalChildCount = (child.products_count || 0) + grandchildren.reduce((sum, gc) => sum + (gc.products_count || 0), 0);
                          const isHandmadeBranch = child.slug?.includes('handmade') || child.name?.toLowerCase().includes('handmade');

                          return (
                            <div key={child.id} style={{ display: 'flex', flexDirection: 'column', gap: '0.15rem' }}>
                              <button
                                onClick={() => onSelectCategory(isSelected ? null : child.id)}
                                style={{
                                  textAlign: 'left',
                                  padding: '0.35rem 0.5rem',
                                  borderRadius: '3px',
                                  backgroundColor: isSelected ? '#f7f7f8' : isGrandchildSelected ? 'rgba(227, 82, 5, 0.05)' : 'transparent',
                                  color: isSelected ? '#E35205' : isGrandchildSelected ? '#E35205' : isHandmadeBranch ? '#111111' : '#555555',
                                  fontWeight: isSelected || isHandmadeBranch ? 800 : 500,
                                  fontSize: '0.77rem',
                                  border: 'none',
                                  cursor: 'pointer',
                                  display: 'flex',
                                  alignItems: 'center',
                                  justifyContent: 'space-between',
                                  width: '100%',
                                  boxSizing: 'border-box',
                                  transition: 'all 0.15s ease',
                                }}
                                onMouseEnter={(e) => {
                                  if (!isSelected) {
                                    e.currentTarget.style.color = '#111111';
                                    e.currentTarget.style.paddingLeft = '0.65rem';
                                  }
                                }}
                                onMouseLeave={(e) => {
                                  if (!isSelected) {
                                    e.currentTarget.style.color = isGrandchildSelected ? '#E35205' : isHandmadeBranch ? '#111111' : '#555555';
                                    e.currentTarget.style.paddingLeft = '0.5rem';
                                  }
                                }}
                              >
                                <span style={{ display: 'flex', alignItems: 'center', gap: '0.3rem', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                                  {isHandmadeBranch && <Sparkles size={11} color="#E35205" />}
                                  <span>{child.name}</span>
                                </span>
                                <div style={{ display: 'flex', alignItems: 'center', gap: '0.35rem', flexShrink: 0 }}>
                                  <span style={{ fontSize: '0.68rem', color: isSelected ? '#E35205' : '#999999', fontWeight: 600 }}>
                                    ({totalChildCount})
                                  </span>
                                  {isSelected && <Check size={13} color="#E35205" strokeWidth={2.5} />}
                                </div>
                              </button>

                              {/* Level 3: Grandchildren (e.g. Clothing & Wearables, Bags & Accessories) */}
                              {grandchildren.length > 0 && (
                                <div style={{
                                  paddingLeft: '0.85rem',
                                  borderLeft: '1px dashed #d1d5db',
                                  marginLeft: '0.6rem',
                                  display: 'flex',
                                  flexDirection: 'column',
                                  gap: '0.12rem',
                                  marginTop: '0.1rem',
                                  marginBottom: '0.25rem',
                                }}>
                                  {grandchildren.map((gc) => {
                                    const isGcSelected = selectedCategory === gc.id;
                                    return (
                                      <button
                                        key={gc.id}
                                        onClick={() => onSelectCategory(isGcSelected ? null : gc.id)}
                                        style={{
                                          textAlign: 'left',
                                          padding: '0.28rem 0.45rem',
                                          borderRadius: '2px',
                                          backgroundColor: isGcSelected ? '#f7f7f8' : 'transparent',
                                          color: isGcSelected ? '#E35205' : '#666666',
                                          fontWeight: isGcSelected ? 800 : 500,
                                          fontSize: '0.72rem',
                                          border: 'none',
                                          cursor: 'pointer',
                                          display: 'flex',
                                          alignItems: 'center',
                                          justifyContent: 'space-between',
                                          width: '100%',
                                          boxSizing: 'border-box',
                                          transition: 'all 0.15s ease',
                                        }}
                                        onMouseEnter={(e) => {
                                          if (!isGcSelected) {
                                            e.currentTarget.style.color = '#111111';
                                            e.currentTarget.style.paddingLeft = '0.6rem';
                                          }
                                        }}
                                        onMouseLeave={(e) => {
                                          if (!isGcSelected) {
                                            e.currentTarget.style.color = '#666666';
                                            e.currentTarget.style.paddingLeft = '0.45rem';
                                          }
                                        }}
                                      >
                                        <span style={{ overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                                          {gc.name}
                                        </span>
                                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.25rem', flexShrink: 0 }}>
                                          {gc.products_count !== undefined && (
                                            <span style={{ fontSize: '0.65rem', color: isGcSelected ? '#E35205' : '#aaaaaa', fontWeight: 600 }}>
                                              ({gc.products_count})
                                            </span>
                                          )}
                                          {isGcSelected && <Check size={11} color="#E35205" strokeWidth={2.5} />}
                                        </div>
                                      </button>
                                    );
                                  })}
                                </div>
                              )}
                            </div>
                          );
                        })}
                      </div>
                    )}
                  </div>
                );
              })
            ) : (
              categories.map((cat) => {
                const isSelected = selectedCategory === cat.id;
                return (
                  <button
                    key={cat.id}
                    onClick={() => onSelectCategory(isSelected ? null : cat.id)}
                    style={{
                      textAlign: 'left',
                      padding: '0.5rem 0.6rem',
                      borderRadius: '4px',
                      backgroundColor: isSelected ? '#f7f7f8' : 'transparent',
                      color: isSelected ? '#111111' : '#555555',
                      fontWeight: isSelected ? 800 : 500,
                      fontSize: '0.8rem',
                      border: 'none',
                      cursor: 'pointer',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'space-between',
                      width: '100%',
                      boxSizing: 'border-box',
                    }}
                  >
                    <span style={{ overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                      {cat.name}
                    </span>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.35rem', flexShrink: 0 }}>
                      {cat.products_count !== undefined && (
                        <span style={{ fontSize: '0.7rem', color: '#888888', fontWeight: 600 }}>
                          ({cat.products_count})
                        </span>
                      )}
                      {isSelected && <Check size={14} color="#E35205" strokeWidth={2.5} />}
                    </div>
                  </button>
                );
              })
            )}
          </div>
        )}
      </div>

      {/* =========================================================================
          SECTION: CRAFTSMANSHIP & TECHNIQUE ACCORDION (Clothing)
          ========================================================================= */}
      {storeType === 'clothing' && (
        <div>
          {renderAccordionHeader(
            'Craftsmanship',
            getFilterCount('craftsmanship'),
            openSections.craftsmanship,
            () => toggleSection('craftsmanship'),
            () => handleAttributeToggle('craftsmanship', null)
          )}

          {openSections.craftsmanship && (
            <div
              style={{
                padding: '0.75rem 0 1rem',
                display: 'flex',
                flexDirection: 'column',
                gap: '0.35rem',
                maxHeight: '230px',
                overflowY: 'auto',
                overflowX: 'hidden',
              }}
            >
              {[
                { label: 'Hand-Embroidered', hint: 'Kashmiri, Multani & Chikankari' },
                { label: 'Handwoven', hint: 'Khaddar & Pashmina' },
                { label: 'Crochet', hint: 'Artisanal Needlework' },
              ]
                .map((c) => {
                  const active = isAttrSelected('craftsmanship', c.label);
                  const count = allProducts.filter((p) =>
                    p.attributes?.some(
                      (a) =>
                        a.attribute_name === 'craftsmanship' &&
                        a.attribute_value.toLowerCase().includes(c.label.toLowerCase())
                    )
                  ).length;
                  return { ...c, active, count };
                })
                .filter((c) => c.count > 0 || c.active)
                .map((c) => {
                  const { active, count } = c;

                return (
                  <label
                    key={c.label}
                    onClick={() => handleAttributeToggle('craftsmanship', c.label)}
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'space-between',
                      padding: '0.45rem 0.55rem',
                      borderRadius: '4px',
                      backgroundColor: active ? 'rgba(227, 82, 5, 0.08)' : 'transparent',
                      border: active ? '1px solid rgba(227, 82, 5, 0.3)' : '1px solid transparent',
                      cursor: 'pointer',
                      transition: 'all 0.15s ease',
                      userSelect: 'none',
                    }}
                  >
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.55rem' }}>
                      <div
                        style={{
                          width: '16px',
                          height: '16px',
                          borderRadius: '3px',
                          border: active ? '1.5px solid #E35205' : '1.5px solid #cbd5e1',
                          backgroundColor: active ? '#E35205' : 'transparent',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          flexShrink: 0,
                        }}
                      >
                        {active && <Check size={11} color="#ffffff" strokeWidth={3} />}
                      </div>
                      <span
                        style={{
                          fontSize: '0.78rem',
                          fontWeight: active ? 800 : 500,
                          color: active ? '#111111' : '#333333',
                        }}
                      >
                        {c.label}
                      </span>
                    </div>

                    <span style={{ fontSize: '0.7rem', color: '#888888', fontWeight: 600 }}>
                      ({count})
                    </span>
                  </label>
                );
              })}
            </div>
          )}
        </div>
      )}

      {/* =========================================================================
          SECTION 2: PRICE RANGE ACCORDION (Khaadi ?pmin=...&pmax=... Style)
          ========================================================================= */}
      <div>
        {renderAccordionHeader(
          'Price (PKR)',
          isPriceActive ? 1 : 0,
          openSections.price,
          () => toggleSection('price'),
          () => {
            setLocalMinPrice('');
            setLocalMaxPrice('');
            if (onPriceChange) onPriceChange({ min: null, max: null });
          }
        )}

        {openSections.price && (
          <div style={{ padding: '0.75rem 0 1rem', display: 'flex', flexDirection: 'column', gap: '0.85rem' }}>
            {/* Quick Price Preset Chips */}
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.35rem' }}>
              {pricePresets.map((preset) => {
                const isActive =
                  preset.min === null && preset.max === null
                    ? !isPriceActive
                    : minPrice === preset.min && maxPrice === preset.max;

                return (
                  <button
                    key={preset.label}
                    type="button"
                    onClick={() => handleSelectPricePreset(preset)}
                    style={{
                      padding: '0.35rem 0.6rem',
                      fontSize: '0.72rem',
                      fontWeight: isActive ? 800 : 600,
                      borderRadius: '4px',
                      backgroundColor: isActive ? '#111111' : '#ffffff',
                      color: isActive ? '#ffffff' : '#444444',
                      border: isActive ? '1px solid #111111' : '1px solid #e5e7eb',
                      cursor: 'pointer',
                      transition: 'all 0.15s ease',
                      whiteSpace: 'nowrap',
                    }}
                  >
                    {preset.label}
                  </button>
                );
              })}
            </div>

            {/* Min and Max Numeric Inputs */}
            <form onSubmit={handleApplyCustomPrice} style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.5rem' }}>
                <div>
                  <label style={{ fontSize: '0.68rem', fontWeight: 700, color: '#777777', textTransform: 'uppercase' }}>
                    Min (Rs.)
                  </label>
                  <input
                    type="number"
                    min="0"
                    placeholder="0"
                    value={localMinPrice}
                    onChange={(e) => setLocalMinPrice(e.target.value)}
                    style={{
                      width: '100%',
                      padding: '0.45rem 0.6rem',
                      fontSize: '0.78rem',
                      borderRadius: '4px',
                      border: '1px solid #d1d5db',
                      backgroundColor: '#ffffff',
                      color: '#111111',
                      outline: 'none',
                      boxSizing: 'border-box',
                    }}
                  />
                </div>
                <div>
                  <label style={{ fontSize: '0.68rem', fontWeight: 700, color: '#777777', textTransform: 'uppercase' }}>
                    Max (Rs.)
                  </label>
                  <input
                    type="number"
                    min="0"
                    placeholder="50000"
                    value={localMaxPrice}
                    onChange={(e) => setLocalMaxPrice(e.target.value)}
                    style={{
                      width: '100%',
                      padding: '0.45rem 0.6rem',
                      fontSize: '0.78rem',
                      borderRadius: '4px',
                      border: '1px solid #d1d5db',
                      backgroundColor: '#ffffff',
                      color: '#111111',
                      outline: 'none',
                      boxSizing: 'border-box',
                    }}
                  />
                </div>
              </div>

              <button
                type="submit"
                style={{
                  padding: '0.45rem',
                  backgroundColor: '#f7f7f8',
                  border: '1px solid #d1d5db',
                  borderRadius: '4px',
                  fontSize: '0.74rem',
                  fontWeight: 800,
                  textTransform: 'uppercase',
                  letterSpacing: '0.06em',
                  cursor: 'pointer',
                  color: '#111111',
                  transition: 'all 0.15s ease',
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.backgroundColor = '#111111';
                  e.currentTarget.style.color = '#ffffff';
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.backgroundColor = '#f7f7f8';
                  e.currentTarget.style.color = '#111111';
                }}
              >
                Apply Range
              </button>
            </form>
          </div>
        )}
      </div>

      {/* =========================================================================
          SECTION 3: SIZE ACCORDION (Square Boxes)
          ========================================================================= */}
      {storeType === 'clothing' && (
        <div>
          {renderAccordionHeader(
            'Size',
            getFilterCount('size'),
            openSections.size,
            () => toggleSection('size'),
            () => handleAttributeToggle('size', null)
          )}

          {openSections.size && (
            <div style={{ padding: '0.75rem 0 1rem' }}>
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.4rem' }}>
                {[
                  { label: 'XS', value: 'XS' },
                  { label: 'S', value: 'S' },
                  { label: 'M', value: 'M' },
                  { label: 'L', value: 'L' },
                  { label: 'XL', value: 'XL' },
                  { label: 'Unstitched', value: 'Unstitched' },
                  { label: '36', value: '36' },
                  { label: '37', value: '37' },
                  { label: '38', value: '38' },
                  { label: '39', value: '39' },
                  { label: '40', value: '40' },
                  { label: '41', value: '41' },
                ].map((sz) => {
                  const active = isAttrSelected('size', sz.value);
                  const count = allProducts.filter((p) =>
                    p.attributes?.some(
                      (a) =>
                        a.attribute_name === 'size' &&
                        a.attribute_value.toLowerCase().includes(sz.value.toLowerCase())
                    )
                  ).length;

                  if (count === 0 && !active && sz.value !== 'XS' && sz.value !== 'S' && sz.value !== 'M' && sz.value !== 'L' && sz.value !== 'XL') {
                    return null;
                  }

                  return (
                    <button
                      key={sz.value}
                      type="button"
                      onClick={() => handleAttributeToggle('size', sz.value)}
                      style={{
                        minWidth: '40px',
                        height: '36px',
                        padding: '0 0.6rem',
                        borderRadius: '4px',
                        border: active ? '1.5px solid #111111' : '1px solid #e5e7eb',
                        backgroundColor: active ? '#111111' : '#ffffff',
                        color: active ? '#ffffff' : '#111111',
                        fontWeight: active ? 800 : 600,
                        fontSize: '0.78rem',
                        cursor: 'pointer',
                        display: 'inline-flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        transition: 'all 0.15s ease',
                      }}
                      title={`${sz.label} (${count} items)`}
                    >
                      {sz.label}
                    </button>
                  );
                })}
              </div>
            </div>
          )}
        </div>
      )}

      {/* =========================================================================
          SECTION 4: COLOR PALETTE ACCORDION (With Off-White & Visual Swatches)
          ========================================================================= */}
      {storeType === 'clothing' && (
        <div>
          {renderAccordionHeader(
            'Color',
            getFilterCount('color'),
            openSections.color,
            () => toggleSection('color'),
            () => {
              setColorSearch('');
              handleAttributeToggle('color', null);
            }
          )}

          {openSections.color && (
            <div style={{ padding: '0.75rem 0 1rem', display: 'flex', flexDirection: 'column', gap: '0.65rem' }}>
              {/* Color Shade Search */}
              <div style={{ position: 'relative', width: '100%' }}>
                <Search
                  size={13}
                  style={{ position: 'absolute', left: '10px', top: '10px', color: '#888888' }}
                />
                <input
                  type="text"
                  placeholder="Search color shade..."
                  value={colorSearch}
                  onChange={(e) => setColorSearch(e.target.value)}
                  style={{
                    width: '100%',
                    padding: '0.45rem 26px 0.45rem 30px',
                    fontSize: '0.76rem',
                    borderRadius: '4px',
                    border: '1px solid #d1d5db',
                    backgroundColor: '#ffffff',
                    color: '#111111',
                    outline: 'none',
                    boxSizing: 'border-box',
                  }}
                />
                {colorSearch && (
                  <button
                    type="button"
                    onClick={() => setColorSearch('')}
                    style={{
                      position: 'absolute',
                      right: '8px',
                      top: '8px',
                      background: 'transparent',
                      border: 'none',
                      cursor: 'pointer',
                      color: '#888888',
                    }}
                  >
                    <X size={13} />
                  </button>
                )}
              </div>

              {/* Curated Color Swatches Grid */}
              <div
                style={{
                  display: 'grid',
                  gridTemplateColumns: 'repeat(2, minmax(0, 1fr))',
                  gap: '0.4rem',
                  maxHeight: '220px',
                  overflowY: 'auto',
                  overflowX: 'hidden',
                  paddingRight: '2px',
                }}
              >
                {[
                  'Off-White',
                  'Jet Black',
                  'Porcelain White',
                  'Ivory Cream',
                  'Terracotta Rust',
                  'Royal Emerald',
                  'Deep Maroon',
                  'Mustard Ochre',
                  'Midnight Navy',
                  'Peacock Teal',
                  'Sage Green',
                  'Powder Peach',
                  'Champagne Gold',
                  'Slate Charcoal',
                  'Camel Brown',
                  'Blush Rose',
                  'Mint Green',
                ]
                  .filter((c) => !colorSearch.trim() || c.toLowerCase().includes(colorSearch.toLowerCase()))
                  .map((colorName) => {
                    const active = isAttrSelected('color', colorName);
                    const hex = getColorHex(colorName);
                    const isLight =
                      hex === '#FFFFFF' || hex === '#FAF9F6' || hex === '#F7F4EE' || hex === '#F4C2C2';
                    const count = allProducts.filter((p) =>
                      p.attributes?.some(
                        (a) =>
                          a.attribute_name === 'color' &&
                          a.attribute_value.toLowerCase().includes(colorName.toLowerCase())
                      )
                    ).length;

                    return (
                      <button
                        key={colorName}
                        type="button"
                        onClick={() => handleAttributeToggle('color', colorName)}
                        style={{
                          display: 'flex',
                          alignItems: 'center',
                          gap: '0.45rem',
                          padding: '0.4rem 0.5rem',
                          borderRadius: '4px',
                          border: active ? '1.5px solid #111111' : '1px solid #e5e7eb',
                          backgroundColor: active ? '#f7f7f8' : 'transparent',
                          cursor: 'pointer',
                          textAlign: 'left',
                          transition: 'all 0.15s ease',
                          width: '100%',
                          boxSizing: 'border-box',
                          minWidth: 0,
                        }}
                      >
                        <span
                          style={{
                            width: '16px',
                            height: '16px',
                            borderRadius: '50%',
                            backgroundColor: hex,
                            border: isLight ? '1px solid #cbd5e1' : '1px solid rgba(0,0,0,0.15)',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            flexShrink: 0,
                          }}
                        >
                          {active && (
                            <Check
                              size={10}
                              color={isLight ? '#111111' : '#FFFFFF'}
                              strokeWidth={3}
                            />
                          )}
                        </span>

                        <span
                          style={{
                            fontSize: '0.74rem',
                            fontWeight: active ? 800 : 500,
                            color: active ? '#111111' : '#444444',
                            overflow: 'hidden',
                            textOverflow: 'ellipsis',
                            whiteSpace: 'nowrap',
                            flexGrow: 1,
                            minWidth: 0,
                          }}
                        >
                          {colorName}
                        </span>

                        {count > 0 && (
                          <span style={{ fontSize: '0.65rem', color: '#888888', fontWeight: 600, flexShrink: 0 }}>
                            {count}
                          </span>
                        )}
                      </button>
                    );
                  })}
              </div>
            </div>
          )}
        </div>
      )}

      {/* =========================================================================
          JEWELRY & GENERAL STORE ATTRIBUTES (Clean & Non-interfering)
          ========================================================================= */}
      {storeType !== 'clothing' &&
        config.filters.map((filterDef) => {
          const rawOptions = availableAttributes[filterDef.key] || filterDef.options || [];
          if (rawOptions.length === 0) return null;
          const count = getFilterCount(filterDef.key);

          return (
            <div key={filterDef.key}>
              {renderAccordionHeader(
                filterDef.label,
                count,
                openSections[filterDef.key] !== false,
                () => toggleSection(filterDef.key),
                () => handleAttributeToggle(filterDef.key, null)
              )}

              {openSections[filterDef.key] !== false && (
                <div style={{ padding: '0.75rem 0 1rem', display: 'flex', flexWrap: 'wrap', gap: '0.35rem' }}>
                  {rawOptions.map((opt) => {
                    const active = isAttrSelected(filterDef.key, opt);
                    return (
                      <button
                        key={opt}
                        type="button"
                        onClick={() => handleAttributeToggle(filterDef.key, opt)}
                        style={{
                          padding: '0.45rem 0.8rem',
                          borderRadius: '4px',
                          border: active
                            ? '1.5px solid var(--primary-color)'
                            : '1px solid var(--border-color)',
                          backgroundColor: active ? 'var(--primary-color)' : 'var(--card-bg)',
                          color: active ? 'var(--button-text)' : 'var(--text-main)',
                          fontWeight: active ? 800 : 600,
                          fontSize: '0.78rem',
                          cursor: 'pointer',
                        }}
                      >
                        {opt}
                      </button>
                    );
                  })}
                </div>
              )}
            </div>
          );
        })}
    </aside>
  );
}
