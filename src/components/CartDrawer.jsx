import React from 'react';
import { useCart } from '../context/CartContext';
import { useStore } from '../context/StoreContext';
import { useAuth } from '../context/AuthContext';
import { X, Trash2, Plus, Minus, ShoppingBag, ArrowRight, UserCheck, ShieldCheck, Truck, Lock, CheckCircle2, Banknote } from 'lucide-react';

export default function CartDrawer({ onProceedToCheckout }) {
  const { cartItems, isOpen, setIsOpen, updateQuantity, removeFromCart, subtotal, itemCount, showCartToast } = useCart();
  const { formatPrice, storeType } = useStore();
  const { user, isAuthenticated, openLoginModal } = useAuth();

  const freeShippingThreshold = storeType === 'clothing' ? 3500 : storeType === 'jewelry' ? 50000 : 2500;
  const freeShippingMet = subtotal >= freeShippingThreshold;
  const freeShippingRemaining = Math.max(0, freeShippingThreshold - subtotal);
  const freeShippingPercent = Math.min(100, Math.round((subtotal / freeShippingThreshold) * 100));

  if (!isOpen) return null;

  return (
    <div style={{
      position: 'fixed',
      inset: 0,
      backgroundColor: 'rgba(0, 0, 0, 0.65)',
      backdropFilter: 'blur(6px)',
      zIndex: 1000,
      display: 'flex',
      justifyContent: 'flex-end',
    }}>
      <div style={{
        backgroundColor: 'var(--card-bg, #ffffff)',
        width: '100%',
        maxWidth: '460px',
        height: '100%',
        display: 'flex',
        flexDirection: 'column',
        boxShadow: '-10px 0 40px rgba(0,0,0,0.3)',
        borderLeft: '1px solid var(--border-color)',
      }} className="animate-fade-in">
        {/* Header with User Badge */}
        <div style={{
          padding: '1.25rem 1.5rem',
          borderBottom: '1px solid var(--border-color)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          backgroundColor: 'var(--surface, #f8fafc)',
        }}>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem' }}>
              <ShoppingBag size={20} color="var(--primary-color)" />
              <h3 style={{ fontSize: '1.15rem', fontWeight: 800 }}>Shopping Bag ({itemCount})</h3>
            </div>
            
            {/* User Indicator */}
            <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)', marginTop: '0.2rem', display: 'flex', alignItems: 'center', gap: '0.35rem' }}>
              {isAuthenticated ? (
                <>
                  <UserCheck size={12} color="#059669" />
                  <span>Cart linked to <strong>{user?.name}</strong> (@{user?.username || 'shopper'})</span>
                </>
              ) : (
                <>
                  <span style={{ color: '#D97706', fontWeight: 600 }}>Guest Cart</span>
                  <span>•</span>
                  <button
                    onClick={() => { setIsOpen(false); openLoginModal('login'); }}
                    style={{ background: 'transparent', border: 'none', color: 'var(--primary-color)', fontWeight: 700, cursor: 'pointer', padding: 0 }}
                  >
                    Sign In to save
                  </button>
                </>
              )}
            </div>
          </div>

          <button
            onClick={() => setIsOpen(false)}
            style={{
              background: 'transparent',
              border: 'none',
              color: 'var(--text-muted)',
              cursor: 'pointer',
              padding: '0.35rem',
              borderRadius: '999px',
            }}
          >
            <X size={20} />
          </button>
        </div>

        {/* Free Shipping Dynamic Progress Meter */}
        {cartItems.length > 0 && (
          <div style={{
            padding: '0.85rem 1.5rem',
            backgroundColor: freeShippingMet ? 'rgba(16, 185, 129, 0.08)' : 'var(--surface, #f8fafc)',
            borderBottom: '1px solid var(--border-color)',
          }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', fontSize: '0.78rem', fontWeight: 700, marginBottom: '0.45rem' }}>
              <span style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', color: freeShippingMet ? '#059669' : 'var(--text-main)' }}>
                <Truck size={14} color={freeShippingMet ? (storeType === 'clothing' ? '#E35205' : '#059669') : (storeType === 'clothing' ? '#E35205' : 'var(--primary-color)')} />
                {freeShippingMet ? (
                  <span>Complimentary <strong>Express Courier Delivery Unlocked</strong></span>
                ) : (
                  <span>Add <strong>{formatPrice(freeShippingRemaining)}</strong> more for <strong>FREE Delivery</strong></span>
                )}
              </span>
              <span style={{ color: 'var(--text-muted)', fontSize: '0.72rem' }}>{freeShippingPercent}%</span>
            </div>
            <div style={{
              width: '100%',
              height: '6px',
              backgroundColor: 'var(--surface-hover, #e2e8f0)',
              borderRadius: '999px',
              overflow: 'hidden',
            }}>
              <div style={{
                width: `${freeShippingPercent}%`,
                height: '100%',
                backgroundColor: storeType === 'clothing' ? '#E35205' : (freeShippingMet ? '#10b981' : 'var(--primary-color)'),
                borderRadius: '999px',
                transition: 'width 0.4s ease',
              }} />
            </div>
          </div>
        )}

        {/* Items List */}
        <div style={{
          flexGrow: 1,
          overflowY: 'auto',
          padding: '1.25rem 1.5rem',
          display: 'flex',
          flexDirection: 'column',
          gap: '1.25rem',
        }}>
          {cartItems.length === 0 ? (
            <div style={{
              textAlign: 'center',
              margin: 'auto 0',
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              gap: '1rem',
              color: 'var(--text-muted)',
            }}>
              <div style={{
                width: '64px',
                height: '64px',
                borderRadius: '50%',
                backgroundColor: 'var(--surface)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
              }}>
                <ShoppingBag size={28} strokeWidth={1.5} color="var(--primary-color)" />
              </div>
              <p style={{ fontSize: '0.95rem', fontWeight: 600 }}>Your shopping bag is currently empty.</p>
              <button
                onClick={() => setIsOpen(false)}
                className="btn-primary"
                style={{ fontSize: '0.85rem', padding: '0.6rem 1.25rem' }}
              >
                Explore Curated Collection
              </button>
            </div>
          ) : (
            cartItems.map((item) => (
              <div
                key={item.cartItemId}
                style={{
                  display: 'flex',
                  gap: '1rem',
                  borderBottom: '1px solid var(--border-color)',
                  paddingBottom: '1.25rem',
                }}
              >
                {/* Thumbnail */}
                <div style={{
                  width: '80px',
                  height: '100px',
                  borderRadius: 'var(--radius)',
                  overflow: 'hidden',
                  backgroundColor: 'var(--surface)',
                  flexShrink: 0,
                  boxShadow: '0 2px 6px rgba(0,0,0,0.06)',
                }}>
                  <img
                    src={item.image}
                    alt={item.name}
                    style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                  />
                </div>

                {/* Details */}
                <div style={{ flexGrow: 1, display: 'flex', flexDirection: 'column' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: '0.5rem' }}>
                    <h4 style={{ fontSize: '0.88rem', fontWeight: 700, color: 'var(--text-main)', lineHeight: 1.3 }}>
                      {item.name}
                    </h4>
                    <button
                      onClick={() => removeFromCart(item.cartItemId)}
                      style={{
                        background: 'transparent',
                        border: 'none',
                        color: 'var(--text-muted)',
                        cursor: 'pointer',
                        padding: '0.1rem',
                      }}
                      title="Remove item"
                    >
                      <Trash2 size={15} />
                    </button>
                  </div>

                  {/* Selected dynamic attributes badges */}
                  {item.selected_attributes && Object.keys(item.selected_attributes).length > 0 && (
                    <div style={{ display: 'flex', gap: '0.35rem', flexWrap: 'wrap', margin: '0.35rem 0' }}>
                      {Object.entries(item.selected_attributes).map(([k, v]) => (
                        <span
                          key={k}
                          style={{
                            fontSize: '0.7rem',
                            backgroundColor: 'var(--surface)',
                            border: '1px solid var(--border-color)',
                            padding: '0.1rem 0.45rem',
                            borderRadius: '4px',
                            color: 'var(--text-muted)',
                            fontWeight: 600,
                          }}
                        >
                          <span style={{ textTransform: 'capitalize' }}>{k}:</span> <strong>{v}</strong>
                        </span>
                      ))}
                    </div>
                  )}

                  {/* Price & Quantity Controls */}
                  {(() => {
                    const itemStock = typeof item.stock === 'number' ? item.stock : (item.stock ? Number(item.stock) : 99);
                    const otherVariantsQty = cartItems
                      .filter((i) => i.product_id === item.product_id && i.cartItemId !== item.cartItemId)
                      .reduce((sum, i) => sum + i.quantity, 0);
                    const remainingForThisItem = Math.max(0, itemStock - otherVariantsQty);
                    const isMaxStock = item.quantity >= remainingForThisItem;
                    const isOversold = item.quantity > remainingForThisItem;

                    return (
                      <>
                        <div style={{
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'space-between',
                          marginTop: 'auto',
                          paddingTop: '0.5rem',
                        }}>
                          <div style={{
                            display: 'flex',
                            alignItems: 'center',
                            border: '1px solid var(--border-color)',
                            borderRadius: '6px',
                            overflow: 'hidden',
                            backgroundColor: 'var(--surface)',
                          }}>
                            <button
                              onClick={() => updateQuantity(item.cartItemId, item.quantity - 1)}
                              style={{
                                padding: '0.25rem 0.55rem',
                                background: 'transparent',
                                border: 'none',
                                cursor: 'pointer',
                                color: 'var(--text-main)',
                              }}
                              title="Decrease quantity"
                            >
                              <Minus size={13} />
                            </button>
                            <span style={{
                              padding: '0.2rem 0.6rem',
                              fontSize: '0.82rem',
                              fontWeight: 700,
                              minWidth: '28px',
                              textAlign: 'center',
                              color: isOversold ? '#e11d48' : 'var(--text-main)',
                            }}>
                              {item.quantity}
                            </span>
                            <button
                              type="button"
                              onClick={() => {
                                if (!isMaxStock && !isOversold) {
                                  updateQuantity(item.cartItemId, item.quantity + 1);
                                } else {
                                  showCartToast?.(`Cannot add more. Only ${remainingForThisItem} available in stock for "${item.name}".`, 'warning');
                                }
                              }}
                              disabled={isMaxStock || isOversold}
                              style={{
                                padding: '0.25rem 0.55rem',
                                background: 'transparent',
                                border: 'none',
                                cursor: (isMaxStock || isOversold) ? 'not-allowed' : 'pointer',
                                color: (isMaxStock || isOversold) ? 'var(--text-muted)' : 'var(--text-main)',
                                opacity: (isMaxStock || isOversold) ? 0.35 : 1,
                              }}
                              title={(isMaxStock || isOversold) ? `Max stock limit reached (${remainingForThisItem} available)` : 'Increase quantity'}
                            >
                              <Plus size={13} />
                            </button>
                          </div>

                          <div style={{ textAlign: 'right' }}>
                            <span style={{
                              fontWeight: 900,
                              fontSize: '0.98rem',
                              color: 'var(--primary-color)',
                            }}>
                              {formatPrice(item.price * item.quantity)}
                            </span>
                          </div>
                        </div>

                        {/* Stock limitation notices */}
                        {isOversold ? (
                          <div style={{
                            fontSize: '0.72rem',
                            fontWeight: 700,
                            color: '#be123c',
                            backgroundColor: '#fff1f2',
                            border: '1px solid #fecdd3',
                            padding: '0.35rem 0.55rem',
                            borderRadius: '6px',
                            marginTop: '0.4rem',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'space-between',
                            gap: '0.5rem',
                            flexWrap: 'wrap',
                          }}>
                            <span>⚠️ Exceeds stock! ({remainingForThisItem} available)</span>
                            <button
                              type="button"
                              onClick={() => updateQuantity(item.cartItemId, remainingForThisItem)}
                              style={{
                                backgroundColor: '#be123c',
                                color: '#ffffff',
                                border: 'none',
                                borderRadius: '4px',
                                padding: '0.18rem 0.5rem',
                                fontSize: '0.68rem',
                                fontWeight: 800,
                                cursor: 'pointer',
                              }}
                              title="Clamp quantity to available stock"
                            >
                              Auto-Fix to {remainingForThisItem}
                            </button>
                          </div>
                        ) : isMaxStock ? (
                          <div style={{
                            fontSize: '0.7rem',
                            fontWeight: 700,
                            color: '#c2410c',
                            backgroundColor: '#fff7ed',
                            border: '1px solid #ffedd5',
                            padding: '0.2rem 0.5rem',
                            borderRadius: '4px',
                            marginTop: '0.35rem',
                          }}>
                            Max stock reached • Only {remainingForThisItem} in stock
                          </div>
                        ) : null}
                      </>
                    );
                  })()}
                </div>
              </div>
            ))
          )}
        </div>

        {/* Footer Checkout Summary */}
        {cartItems.length > 0 && (
          <div style={{
            padding: '1.25rem 1.5rem',
            borderTop: '1px solid var(--border-color)',
            backgroundColor: 'var(--surface, #f8fafc)',
            display: 'flex',
            flexDirection: 'column',
            gap: '0.85rem',
          }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <span style={{ fontSize: '0.85rem', color: 'var(--text-muted)', fontWeight: 600 }}>
                Subtotal ({itemCount} {itemCount === 1 ? 'item' : 'items'}):
              </span>
              <span style={{ fontSize: '1.25rem', fontWeight: 900, color: 'var(--primary-color)' }}>
                {formatPrice(subtotal)}
              </span>
            </div>

            <p style={{ fontSize: '0.72rem', color: 'var(--text-muted)', margin: 0, textAlign: 'center' }}>
              Tax & expedited shipping calculated during checkout
            </p>

            {cartItems.some((i) => i.quantity > (typeof i.stock === 'number' ? i.stock : 99)) && (
              <div style={{
                backgroundColor: '#fff1f2',
                border: '1px solid #fecdd3',
                color: '#be123c',
                padding: '0.55rem 0.75rem',
                borderRadius: '6px',
                fontSize: '0.76rem',
                fontWeight: 700,
                textAlign: 'center',
                lineHeight: 1.4,
              }}>
                ⚠️ Items in your bag exceed available stock. Please reduce quantity to proceed.
              </div>
            )}

              <button
                disabled={cartItems.some((i) => i.quantity > (typeof i.stock === 'number' ? i.stock : 99))}
                onClick={() => {
                  setIsOpen(false);
                  onProceedToCheckout();
                }}
                style={{
                  width: '100%',
                  padding: '0.85rem',
                  borderRadius: 'var(--radius)',
                  backgroundColor: 'var(--primary-color)',
                  color: 'var(--button-text)',
                  border: 'none',
                  fontWeight: 800,
                  fontSize: '0.92rem',
                  cursor: cartItems.some((i) => i.quantity > (typeof i.stock === 'number' ? i.stock : 99)) ? 'not-allowed' : 'pointer',
                  opacity: cartItems.some((i) => i.quantity > (typeof i.stock === 'number' ? i.stock : 99)) ? 0.5 : 1,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: '0.5rem',
                  boxShadow: '0 4px 14px rgba(0,0,0,0.12)',
                }}
              >
                <Lock size={15} />
                <span>Proceed to Instant Checkout</span>
                <ArrowRight size={17} />
              </button>

              {/* Trust & Guarantees Strip */}
              <div style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '1rem',
                paddingTop: '0.35rem',
                fontSize: '0.7rem',
                color: 'var(--text-muted)',
              }}>
                <span style={{ display: 'flex', alignItems: 'center', gap: '0.3rem' }}>
                  <ShieldCheck size={13} color="#10b981" /> 256-Bit SSL
                </span>
                <span>•</span>
                <span style={{ display: 'flex', alignItems: 'center', gap: '0.3rem' }}>
                  <Truck size={13} color="var(--primary-color)" /> Express Courier
                </span>
                <span>•</span>
                <span style={{ display: 'flex', alignItems: 'center', gap: '0.3rem' }}>
                  <Banknote size={13} color="var(--primary-color)" /> COD Accepted
                </span>
              </div>
            </div>
          )}
        </div>
      </div>
    );
  }
