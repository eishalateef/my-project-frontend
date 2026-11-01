import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useStore } from '../context/StoreContext';
import { useCart } from '../context/CartContext';
import { useWishlist } from '../context/WishlistContext';
import { getColorHex } from './DynamicFilters';
import { Plus, ShoppingBag, Sparkles, Star, Zap, Check, Heart, X } from 'lucide-react';
import { getImageUrl } from '../utils/imageUrl';

export default function ProductCard({ product, onSelectProduct }) {
  const navigate = useNavigate();
  const { storeType, formatPrice } = useStore();
  const { addToCart, cartItems } = useCart();
  const { isInWishlist, toggleWishlist } = useWishlist();
  const [addedFeedback, setAddedFeedback] = useState(false);
  const [isHovered, setIsHovered] = useState(false);
  const [showSizePicker, setShowSizePicker] = useState(false);
  const [selectedSizeFeedback, setSelectedSizeFeedback] = useState(null);

  const isFavorited = isInWishlist(product.id);

  // Real inventory calculation
  const rawStock = product.stock !== undefined && product.stock !== null ? Number(product.stock) : 99;
  const inCartQty = (cartItems || [])
    .filter((item) => item.product_id === product.id)
    .reduce((sum, item) => sum + item.quantity, 0);
  const isOutOfStock = rawStock <= 0;
  const isMaxInCart = inCartQty >= rawStock;
  const remainingStock = Math.max(0, rawStock - inCartQty);

  const isSale = product.sale_price && Number(product.sale_price) < Number(product.price);
  const discountPercent = isSale
    ? Math.round(((Number(product.price) - Number(product.sale_price)) / Number(product.price)) * 100)
    : 0;

  const displayPrice = isSale ? product.sale_price : product.price;
  const originalPrice = product.price;
  const rawImages = Array.isArray(product.images) && product.images.length > 0 ? product.images : [product.images || 'https://images.unsplash.com/photo-1523381210434-271e8be1f52b?w=800&auto=format&fit=crop&q=80'];
  const firstImage = getImageUrl(rawImages[0]);
  const secondImage = getImageUrl(rawImages[1] || rawImages[0]);

  // Extract key attributes safely
  const sizes = Array.isArray(product.attributes)
    ? product.attributes.filter((a) => a.attribute_name === 'size').map((a) => a.attribute_value)
    : [];
  const colorAttrs = Array.isArray(product.attributes)
    ? product.attributes.filter((a) => a.attribute_name === 'color')
    : [];
  const colors = colorAttrs.map((a) => a.attribute_value);
  const purity = Array.isArray(product.attributes)
    ? product.attributes.find((a) => a.attribute_name === 'purity')?.attribute_value
    : null;
  const gemstone = Array.isArray(product.attributes)
    ? product.attributes.find((a) => a.attribute_name === 'gemstone')?.attribute_value
    : null;
  const brand = Array.isArray(product.attributes)
    ? product.attributes.find((a) => a.attribute_name === 'brand')?.attribute_value
    : null;
  const fabric = Array.isArray(product.attributes)
    ? product.attributes.find((a) => a.attribute_name === 'fabric')?.attribute_value
    : null;
  const pieces = Array.isArray(product.attributes)
    ? product.attributes.find((a) => a.attribute_name === 'pieces')?.attribute_value
    : null;
  const craftsmanship = Array.isArray(product.attributes)
    ? product.attributes.find((a) => a.attribute_name === 'craftsmanship')?.attribute_value
    : null;
  const subcategoryAttr = Array.isArray(product.attributes)
    ? product.attributes.find((a) => a.attribute_name === 'subcategory')?.attribute_value
    : null;
  const material = Array.isArray(product.attributes)
    ? product.attributes.find((a) => a.attribute_name === 'material')?.attribute_value
    : null;

  const isHandmade = Boolean(
    craftsmanship ||
    product.category?.slug?.includes('handmade') ||
    product.category?.name?.toLowerCase().includes('handmade') ||
    product.name?.toLowerCase().includes('handmade') ||
    product.name?.toLowerCase().includes('hand-') ||
    product.name?.toLowerCase().includes('crochet')
  );

  const handleWishlist = (e) => {
    e.stopPropagation();
    toggleWishlist(product);
  };

  const handleSelectSizeAndAdd = (e, sizeValue) => {
    e.stopPropagation();
    if (isOutOfStock || isMaxInCart) return;

    const defaultAttrs = { size: sizeValue };
    const availableColor = colorAttrs.find((c) => c.is_available !== false && c.is_available !== 0) || colorAttrs[0];
    if (availableColor) defaultAttrs.color = availableColor.attribute_value;
    if (purity) defaultAttrs.purity = purity;
    if (brand) defaultAttrs.brand = brand;

    const res = addToCart(product, 1, defaultAttrs);
    if (res !== false) {
      setSelectedSizeFeedback(sizeValue);
      setAddedFeedback(true);
      setTimeout(() => {
        setAddedFeedback(false);
        setShowSizePicker(false);
        setSelectedSizeFeedback(null);
      }, 1600);
    }
  };

  const handleQuickAddClick = (e) => {
    e.stopPropagation();
    if (isOutOfStock || isMaxInCart) return;

    if (sizes && sizes.length > 1) {
      setShowSizePicker(true);
      return;
    }
    const defaultAttrs = {};
    if (sizes && sizes.length > 0) defaultAttrs.size = sizes[0];
    const availableColor = colorAttrs.find((c) => c.is_available !== false && c.is_available !== 0) || colorAttrs[0];
    if (availableColor) defaultAttrs.color = availableColor.attribute_value;
    if (purity) defaultAttrs.purity = purity;
    if (brand) defaultAttrs.brand = brand;

    const res = addToCart(product, 1, defaultAttrs);
    if (res !== false) {
      setAddedFeedback(true);
      setTimeout(() => setAddedFeedback(false), 1800);
    }
  };

  const handleCardClick = () => {
    if (typeof onSelectProduct === 'function') {
      onSelectProduct(product);
    } else {
      const target = product.slug || product.id;
      navigate(`/products/${target}`);
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  };

  return (
    <div
      onClick={handleCardClick}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      className="store-card"
      style={{
        cursor: 'pointer',
        display: 'flex',
        flexDirection: 'column',
        position: 'relative',
        height: '100%',
        backgroundColor: storeType === 'clothing' ? 'transparent' : 'var(--card-bg, #ffffff)',
        border: storeType === 'clothing'
          ? 'none'
          : (isHovered ? '1px solid var(--primary-color)' : '1px solid var(--border-color, #e2e8f0)'),
        borderRadius: storeType === 'clothing' ? '0' : 'var(--radius, 14px)',
        overflow: 'hidden',
        boxShadow: storeType === 'clothing' ? 'none' : (isHovered ? 'var(--shadow-card-hover)' : 'var(--shadow-card)'),
        transform: storeType === 'clothing' ? 'none' : (isHovered ? 'translateY(-4px)' : 'translateY(0)'),
        transition: 'transform 0.3s cubic-bezier(0.16, 1, 0.3, 1), box-shadow 0.3s ease',
      }}
    >
      {/* 1. Product Image Container */}
      <div
        style={{
          position: 'relative',
          width: '100%',
          paddingTop: storeType === 'clothing' ? '135%' : storeType === 'jewelry' ? '100%' : '92%',
          overflow: 'hidden',
          backgroundColor: 'var(--surface, #f8fafc)',
        }}
      >
        <img
          src={isHovered && secondImage !== firstImage ? secondImage : firstImage}
          alt={product.name}
          style={{
            position: 'absolute',
            inset: 0,
            width: '100%',
            height: '100%',
            objectFit: 'cover',
            transition: 'transform 0.45s cubic-bezier(0.16, 1, 0.3, 1), opacity 0.3s ease',
            transform: isHovered ? 'scale(1.04)' : 'scale(1)',
          }}
          className="product-img"
          loading="lazy"
        />

        {/* Badges Overlay */}
        <div
          style={{
            position: 'absolute',
            top: '0.75rem',
            left: '0.75rem',
            display: 'flex',
            flexDirection: 'column',
            gap: '0.35rem',
            zIndex: 2,
            alignItems: 'flex-start',
          }}
        >
          {/* Sleek Minimalist 'New Arrival' Badge (Zara / Khaadi style) */}
          {(product.is_featured || (product.id && product.id % 2 === 1)) && (
            <span
              style={{
                backgroundColor: '#111111',
                color: '#FFFFFF',
                fontSize: '0.62rem',
                fontWeight: 800,
                letterSpacing: '0.1em',
                textTransform: 'uppercase',
                padding: '0.22rem 0.55rem',
                borderRadius: '2px',
                boxShadow: '0 2px 8px rgba(0,0,0,0.18)',
              }}
            >
              New Arrival
            </span>
          )}

          {/* Clothing: 100% Handmade Heirloom Badge */}
          {storeType === 'clothing' && isHandmade && (
            <span
              style={{
                backgroundColor: '#111111',
                color: '#FFFFFF',
                border: '1px solid #E35205',
                fontSize: '0.58rem',
                fontWeight: 800,
                letterSpacing: '0.1em',
                textTransform: 'uppercase',
                padding: '0.22rem 0.52rem',
                borderRadius: '2px',
                display: 'inline-flex',
                alignItems: 'center',
                gap: '0.25rem',
                boxShadow: '0 2px 8px rgba(0,0,0,0.22)',
              }}
            >
              <Sparkles size={9} color="#E35205" />
              100% Handmade
            </span>
          )}

          {/* Real inventory 'Sold Out' or 'Low Stock' Badge */}
          {isOutOfStock ? (
            <span
              style={{
                backgroundColor: '#FFF1F2',
                color: '#BE123C',
                border: '1px solid #FECDD3',
                fontSize: '0.6rem',
                fontWeight: 800,
                letterSpacing: '0.08em',
                textTransform: 'uppercase',
                padding: '0.2rem 0.5rem',
                borderRadius: '2px',
                display: 'inline-flex',
                alignItems: 'center',
                gap: '0.25rem',
              }}
            >
              <span style={{ width: '4px', height: '4px', borderRadius: '50%', backgroundColor: '#E11D48' }} />
              Sold Out
            </span>
          ) : rawStock > 0 && rawStock <= 10 ? (
            <span
              style={{
                backgroundColor: '#FFF7ED',
                color: '#C2410C',
                border: '1px solid #FFEDD5',
                fontSize: '0.6rem',
                fontWeight: 800,
                letterSpacing: '0.08em',
                textTransform: 'uppercase',
                padding: '0.2rem 0.5rem',
                borderRadius: '2px',
                display: 'inline-flex',
                alignItems: 'center',
                gap: '0.25rem',
              }}
            >
              <span style={{ width: '4px', height: '4px', borderRadius: '50%', backgroundColor: '#EA580C' }} />
              Low Stock • {rawStock} Left
            </span>
          ) : null}

          {isSale && (
            <span
              style={{
                backgroundColor: storeType === 'clothing' ? '#E35205' : '#ef4444',
                color: '#ffffff',
                fontSize: '0.62rem',
                fontWeight: 800,
                letterSpacing: '0.08em',
                textTransform: 'uppercase',
                padding: storeType === 'clothing' ? '0.22rem 0.55rem' : '0.25rem 0.6rem',
                borderRadius: storeType === 'clothing' ? '2px' : '999px',
                boxShadow: storeType === 'clothing' ? '0 2px 8px rgba(227, 82, 5, 0.25)' : '0 2px 8px rgba(239, 68, 68, 0.25)',
              }}
            >
              {discountPercent}% OFF
            </span>
          )}

          {/* Jewelry: Hallmarked Purity Badge */}
          {storeType === 'jewelry' && (
            <span
              style={{
                backgroundColor: 'rgba(10, 10, 10, 0.92)',
                backdropFilter: 'blur(6px)',
                color: '#FFD700',
                border: '1px solid rgba(212, 175, 55, 0.5)',
                fontSize: '0.68rem',
                fontWeight: 800,
                padding: '0.25rem 0.6rem',
                borderRadius: '999px',
                display: 'inline-flex',
                alignItems: 'center',
                gap: '0.3rem',
                boxShadow: '0 2px 10px rgba(0,0,0,0.4)',
              }}
            >
              <Sparkles size={11} color="#FFD700" />
              <span>{purity || '18K GOLD'}</span>
            </span>
          )}
        </div>

        {/* Wishlist Heart Button on Top Right */}
        <button
          onClick={handleWishlist}
          aria-label={isFavorited ? 'Remove from favorites' : 'Save to favorites'}
          title={isFavorited ? 'Remove from favorites' : 'Save to favorites'}
          style={{
            position: 'absolute',
            top: '0.75rem',
            right: '0.75rem',
            zIndex: 3,
            width: '32px',
            height: '32px',
            borderRadius: '50%',
            backgroundColor: isFavorited ? 'rgba(254, 242, 242, 0.95)' : 'rgba(255, 255, 255, 0.9)',
            backdropFilter: 'blur(6px)',
            border: isFavorited ? '1px solid #fecdd3' : 'none',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            cursor: 'pointer',
            boxShadow: '0 2px 8px rgba(0,0,0,0.1)',
            transition: 'transform 0.18s ease, background-color 0.18s ease',
            color: isFavorited ? '#ef4444' : '#64748b',
          }}
          onMouseEnter={(e) => (e.currentTarget.style.transform = 'scale(1.15)')}
          onMouseLeave={(e) => (e.currentTarget.style.transform = 'scale(1)')}
        >
          <Heart size={16} fill={isFavorited ? '#ef4444' : 'transparent'} color={isFavorited ? '#ef4444' : '#64748b'} />
        </button>

        {/* Modern Floating Quick Add Pill on Hover / Size Picker */}
        <div
          className="product-card-quickadd-wrapper"
          style={{
            position: 'absolute',
            bottom: storeType === 'clothing' ? '0.5rem' : '0.75rem',
            left: storeType === 'clothing' ? '0.5rem' : '0.75rem',
            right: storeType === 'clothing' ? '0.5rem' : '0.75rem',
            zIndex: 3,
            transform: isHovered || addedFeedback || showSizePicker ? 'translateY(0)' : 'translateY(12px)',
            opacity: isHovered || addedFeedback || showSizePicker ? 1 : 0,
            transition: 'all 0.25s cubic-bezier(0.16, 1, 0.3, 1)',
          }}
        >
          {showSizePicker && sizes && sizes.length > 1 ? (
            <div
              onClick={(e) => e.stopPropagation()}
              style={{
                backgroundColor: 'rgba(17, 17, 17, 0.96)',
                backdropFilter: 'blur(10px)',
                WebkitBackdropFilter: 'blur(10px)',
                borderRadius: storeType === 'clothing' ? '3px' : '10px',
                padding: '0.55rem 0.65rem',
                display: 'flex',
                flexDirection: 'column',
                gap: '0.45rem',
                boxShadow: '0 8px 24px rgba(0,0,0,0.35)',
                animation: 'slideUpQuick 0.2s ease-out',
                border: '1px solid rgba(255,255,255,0.18)',
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                <span style={{ fontSize: '0.64rem', fontWeight: 800, color: '#E35205', letterSpacing: '0.08em', textTransform: 'uppercase' }}>
                  Select Size
                </span>
                <button
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation();
                    setShowSizePicker(false);
                  }}
                  style={{
                    background: 'transparent',
                    border: 'none',
                    color: '#aaaaaa',
                    cursor: 'pointer',
                    padding: '0 2px',
                    display: 'flex',
                    alignItems: 'center',
                  }}
                  title="Close size selection"
                >
                  <X size={13} />
                </button>
              </div>
              <div style={{ display: 'flex', gap: '0.35rem', flexWrap: 'wrap' }}>
                {sizes.map((s) => (
                  <button
                    key={s}
                    type="button"
                    disabled={isOutOfStock || isMaxInCart}
                    onClick={(e) => handleSelectSizeAndAdd(e, s)}
                    style={{
                      flex: '1 0 auto',
                      minWidth: '32px',
                      padding: '0.35rem 0.45rem',
                      backgroundColor: selectedSizeFeedback === s ? '#10b981' : (isOutOfStock || isMaxInCart) ? '#f1f5f9' : '#FFFFFF',
                      color: selectedSizeFeedback === s ? '#FFFFFF' : (isOutOfStock || isMaxInCart) ? '#94a3b8' : '#111111',
                      border: 'none',
                      borderRadius: '2px',
                      fontSize: '0.72rem',
                      fontWeight: 800,
                      cursor: (isOutOfStock || isMaxInCart) ? 'not-allowed' : 'pointer',
                      opacity: (isOutOfStock || isMaxInCart) ? 0.5 : 1,
                      letterSpacing: '0.04em',
                      transition: 'all 0.15s ease',
                      textAlign: 'center',
                    }}
                    onMouseEnter={(e) => {
                      if (selectedSizeFeedback !== s && !isOutOfStock && !isMaxInCart) {
                        e.currentTarget.style.backgroundColor = '#E35205';
                        e.currentTarget.style.color = '#FFFFFF';
                      }
                    }}
                    onMouseLeave={(e) => {
                      if (selectedSizeFeedback !== s && !isOutOfStock && !isMaxInCart) {
                        e.currentTarget.style.backgroundColor = '#FFFFFF';
                        e.currentTarget.style.color = '#111111';
                      }
                    }}
                  >
                    {selectedSizeFeedback === s ? `✓ ${s}` : s}
                  </button>
                ))}
              </div>
            </div>
          ) : (
            <button
              onClick={handleQuickAddClick}
              disabled={addedFeedback || isOutOfStock || isMaxInCart}
              style={{
                width: '100%',
                padding: storeType === 'clothing' ? '0.55rem 0.5rem' : '0.55rem 0.85rem',
                borderRadius: storeType === 'clothing' ? '2px' : '999px',
                backgroundColor: addedFeedback
                  ? '#10b981'
                  : isOutOfStock
                    ? '#64748b'
                    : isMaxInCart
                      ? '#ea580c'
                      : storeType === 'clothing'
                        ? '#111111'
                        : 'var(--primary-color)',
                color: '#ffffff',
                border: 'none',
                fontSize: storeType === 'clothing' ? '0.74rem' : '0.8rem',
                fontWeight: 800,
                letterSpacing: storeType === 'clothing' ? '0.1em' : 'normal',
                textTransform: storeType === 'clothing' ? 'uppercase' : 'none',
                cursor: (isOutOfStock || isMaxInCart) ? 'not-allowed' : 'pointer',
                opacity: (isOutOfStock || isMaxInCart) ? 0.75 : 1,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '0.45rem',
                boxShadow: '0 6px 20px rgba(0,0,0,0.18)',
                transition: 'background-color 0.2s ease',
              }}
              onMouseEnter={(e) => {
                if (storeType === 'clothing' && !addedFeedback && !isOutOfStock && !isMaxInCart) e.currentTarget.style.backgroundColor = '#E35205';
              }}
              onMouseLeave={(e) => {
                if (storeType === 'clothing' && !addedFeedback && !isOutOfStock && !isMaxInCart) e.currentTarget.style.backgroundColor = '#111111';
              }}
            >
              {addedFeedback ? (
                <>
                  <Check size={14} strokeWidth={3} />
                  <span>{selectedSizeFeedback ? `Added (${selectedSizeFeedback})` : 'Added to Bag'}</span>
                </>
              ) : isOutOfStock ? (
                <span>Sold Out</span>
              ) : isMaxInCart ? (
                <span>Max in Bag ({rawStock})</span>
              ) : (
                <>
                  <ShoppingBag size={13} />
                  <span>{sizes && sizes.length > 1 ? 'Quick Add • Size' : 'Quick Add'}</span>
                </>
              )}
            </button>
          )}
        </div>
      </div>

      {/* 2. Product Details */}
      <div
        style={{
          padding: storeType === 'clothing' ? '0.65rem 0.25rem 0.5rem' : '1rem 1.15rem 1.15rem',
          display: 'flex',
          flexDirection: 'column',
          flexGrow: 1,
          gap: storeType === 'clothing' ? '0.2rem' : '0.45rem',
        }}
      >
        {/* Category Header & In-Stock Status (Non-clothing only) */}
        {storeType !== 'clothing' && (
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              fontSize: '0.72rem',
              color: 'var(--text-muted, #64748b)',
              fontWeight: 700,
              letterSpacing: '0.05em',
              textTransform: 'uppercase',
            }}
          >
            <span>{storeType === 'general' && brand ? brand : product.category?.name || 'Collection'}</span>
            <span style={{ display: 'inline-flex', alignItems: 'center', gap: '0.35rem', color: '#10b981', fontSize: '0.68rem', fontWeight: 700 }}>
              <span className="pulse-dot" />
              In Stock
            </span>
          </div>
        )}

        {/* Clothing Micro-Eyebrow: Pieces & Fabric (Khaadi & Outfitters style) */}
        {storeType === 'clothing' && (pieces || fabric || product.category?.name) && (
          <span style={{
            fontSize: '0.68rem',
            fontWeight: 700,
            textTransform: 'uppercase',
            letterSpacing: '0.08em',
            color: '#777777',
            lineHeight: 1.2,
            marginBottom: '0.1rem',
            overflow: 'hidden',
            textOverflow: 'ellipsis',
            whiteSpace: 'nowrap',
          }}>
            {[pieces, fabric].filter(Boolean).join(' • ') || product.category?.name}
          </span>
        )}

        {/* Product Title */}
        <h3
          style={{
            fontSize: storeType === 'clothing' ? '0.86rem' : '0.98rem',
            fontWeight: storeType === 'clothing' ? 700 : 700,
            color: isHovered && storeType === 'clothing' ? '#E35205' : isHovered ? 'var(--accent, #92400e)' : 'var(--text-main, #111827)',
            lineHeight: 1.35,
            overflow: 'hidden',
            display: '-webkit-box',
            WebkitLineClamp: storeType === 'clothing' ? 1 : 2,
            WebkitBoxOrient: 'vertical',
            margin: 0,
            letterSpacing: storeType === 'clothing' ? '0.03em' : 'normal',
            textTransform: storeType === 'clothing' ? 'uppercase' : 'none',
            fontFamily: storeType === 'clothing' ? "'Plus Jakarta Sans', -apple-system, sans-serif" : 'inherit',
            transition: 'color 0.22s ease',
          }}
        >
          {product.name}
        </h3>

        {/* Handmade Craftsmanship Tag */}
        {storeType === 'clothing' && (craftsmanship || (isHandmade && subcategoryAttr)) && (
          <div style={{
            fontSize: '0.66rem',
            fontWeight: 800,
            color: '#E35205',
            textTransform: 'uppercase',
            letterSpacing: '0.06em',
            display: 'inline-flex',
            alignItems: 'center',
            gap: '0.3rem',
            marginTop: '0.05rem',
          }}>
            <Sparkles size={10} color="#E35205" />
            <span>{craftsmanship || subcategoryAttr}</span>
          </div>
        )}

        {/* Jewelry Gemstone preview */}
        {storeType === 'jewelry' && gemstone && (
          <div
            style={{
              fontSize: '0.75rem',
              color: '#D4AF37',
              display: 'flex',
              alignItems: 'center',
              gap: '0.3rem',
              fontWeight: 600,
            }}
          >
            <Sparkles size={12} />
            <span>{gemstone}</span>
          </div>
        )}

        {/* General: Rating Stars */}
        {storeType === 'general' && (
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.35rem', fontSize: '0.75rem', color: '#f59e0b' }}>
            <div style={{ display: 'flex' }}>
              {[...Array(5)].map((_, i) => (
                <Star key={i} size={12} fill="#f59e0b" color="#f59e0b" />
              ))}
            </div>
            <span style={{ color: 'var(--text-muted)', fontSize: '0.7rem' }}>(4.9 · 128 sold)</span>
          </div>
        )}

        {/* Clothing Available Color Swatches */}
        {storeType === 'clothing' && colors.length > 0 && (
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '0.35rem',
              margin: '0.25rem 0 0.15rem',
            }}
          >
            {colors.slice(0, 5).map((c, i) => {
              const hex = getColorHex(c);
              const isLight = hex === '#FFFFFF' || hex === '#FAF9F6' || hex === '#F7F4EE' || hex === '#F4C2C2';
              return (
                <span
                  key={`${c}-${i}`}
                  title={c}
                  style={{
                    width: '12px',
                    height: '12px',
                    borderRadius: '50%',
                    backgroundColor: hex,
                    border: isLight ? '1px solid #cbd5e1' : '1px solid rgba(0,0,0,0.15)',
                    display: 'inline-block',
                    boxShadow: '0 1px 2px rgba(0,0,0,0.06)',
                  }}
                />
              );
            })}
            {colors.length > 5 && (
              <span style={{ fontSize: '0.65rem', color: '#888888', fontWeight: 600 }}>
                +{colors.length - 5}
              </span>
            )}
          </div>
        )}

        {/* Clothing Available Sizes micro-indicator */}
        {storeType === 'clothing' && sizes && sizes.length > 0 && (
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '0.3rem',
              marginBottom: '0.25rem',
              opacity: 0.9,
            }}
          >
            <span style={{ fontSize: '0.68rem', color: '#777777', fontWeight: 600, letterSpacing: '0.04em' }}>
              Sizes:
            </span>
            <div style={{ display: 'flex', gap: '0.25rem' }}>
              {sizes.slice(0, 4).map((s) => (
                <button
                  key={s}
                  type="button"
                  disabled={isOutOfStock || isMaxInCart}
                  onClick={(e) => handleSelectSizeAndAdd(e, s)}
                  title={isOutOfStock ? 'Sold Out' : isMaxInCart ? `Max Stock (${rawStock}) in bag` : `Quick Add Size ${s}`}
                  style={{
                    fontSize: '0.65rem',
                    fontWeight: 700,
                    color: selectedSizeFeedback === s ? '#FFFFFF' : (isOutOfStock || isMaxInCart) ? '#94a3b8' : '#333333',
                    backgroundColor: selectedSizeFeedback === s ? '#10b981' : (isOutOfStock || isMaxInCart) ? '#f8fafc' : '#f1f5f9',
                    border: '1px solid transparent',
                    padding: '0.1rem 0.35rem',
                    borderRadius: '2px',
                    cursor: (isOutOfStock || isMaxInCart) ? 'not-allowed' : 'pointer',
                    opacity: (isOutOfStock || isMaxInCart) ? 0.5 : 1,
                    transition: 'all 0.15s ease',
                  }}
                  onMouseEnter={(e) => {
                    if (selectedSizeFeedback !== s && !isOutOfStock && !isMaxInCart) {
                      e.currentTarget.style.backgroundColor = '#111111';
                      e.currentTarget.style.color = '#FFFFFF';
                    }
                  }}
                  onMouseLeave={(e) => {
                    if (selectedSizeFeedback !== s && !isOutOfStock && !isMaxInCart) {
                      e.currentTarget.style.backgroundColor = '#f1f5f9';
                      e.currentTarget.style.color = '#333333';
                    }
                  }}
                >
                  {selectedSizeFeedback === s ? `✓ ${s}` : s}
                </button>
              ))}
              {sizes.length > 4 && (
                <span
                  onClick={(e) => {
                    e.stopPropagation();
                    setShowSizePicker(true);
                  }}
                  title="View all sizes"
                  style={{ fontSize: '0.62rem', color: '#888888', fontWeight: 600, cursor: 'pointer', textDecoration: 'underline' }}
                >
                  +{sizes.length - 4}
                </span>
              )}
            </div>
          </div>
        )}

        {/* Price Row */}
        <div
          style={{
            marginTop: storeType === 'clothing' ? '0' : 'auto',
            paddingTop: storeType === 'clothing' ? '0.15rem' : '0.6rem',
            display: 'flex',
            alignItems: 'baseline',
            gap: '0.55rem',
            borderTop: storeType === 'clothing' ? 'none' : '1px solid var(--border-color, #f1f5f9)',
          }}
        >
          <span
            style={{
              fontSize: storeType === 'clothing' ? '0.92rem' : '1.15rem',
              fontWeight: 800,
              color: storeType === 'clothing' ? '#111111' : 'var(--text-main, #0f172a)',
              letterSpacing: storeType === 'clothing' ? '0.02em' : '-0.02em',
            }}
          >
            {formatPrice(displayPrice)}
          </span>

          {isSale && (
            <span
              style={{
                fontSize: '0.78rem',
                color: 'var(--text-muted, #94a3b8)',
                textDecoration: 'line-through',
                fontWeight: 500,
              }}
            >
              {formatPrice(originalPrice)}
            </span>
          )}

          {isSale && discountPercent > 0 && (
            <span
              style={{
                marginLeft: 'auto',
                fontSize: '0.68rem',
                fontWeight: 800,
                color: storeType === 'clothing' ? '#E35205' : '#dc2626',
                backgroundColor: storeType === 'clothing' ? 'rgba(227, 82, 5, 0.08)' : '#fee2e2',
                padding: '0.15rem 0.5rem',
                borderRadius: '4px',
                letterSpacing: '0.04em',
              }}
            >
              -{discountPercent}%
            </span>
          )}
        </div>
      </div>
    </div>
  );
}
