import React from 'react';
import { useWishlist } from '../context/WishlistContext';
import { useStore } from '../context/StoreContext';
import { useAuth } from '../context/AuthContext';
import {
  X,
  Trash2,
  Heart,
  ShoppingBag,
  ArrowRight,
  UserCheck,
  Package,
  ExternalLink,
} from 'lucide-react';

export default function WishlistDrawer({ onSelectProduct }) {
  const {
    wishlist,
    wishlistCount,
    isWishlistOpen,
    setIsWishlistOpen,
    removeFromWishlist,
    moveToCart,
    moveAllToCart,
    clearWishlist,
  } = useWishlist();

  const { formatPrice, storeType } = useStore();
  const { user, isAuthenticated, openLoginModal } = useAuth();

  if (!isWishlistOpen) return null;

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
        maxWidth: '480px',
        height: '100%',
        display: 'flex',
        flexDirection: 'column',
        boxShadow: '-10px 0 40px rgba(0,0,0,0.3)',
        borderLeft: '1px solid var(--border-color)',
      }} className="animate-fade-in">
        {/* Header */}
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
              <Heart size={20} fill="#ef4444" color="#ef4444" />
              <h3 style={{ fontSize: '1.15rem', fontWeight: 800 }}>My Saved Favorites ({wishlistCount})</h3>
            </div>

            {/* User Indicator */}
            <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)', marginTop: '0.2rem', display: 'flex', alignItems: 'center', gap: '0.35rem' }}>
              {isAuthenticated ? (
                <>
                  <UserCheck size={12} color="#059669" />
                  <span>Linked to <strong>{user?.name}</strong></span>
                </>
              ) : (
                <>
                  <span style={{ color: '#D97706', fontWeight: 600 }}>Guest Wishlist</span>
                  <span>•</span>
                  <button
                    onClick={() => { setIsWishlistOpen(false); openLoginModal('login'); }}
                    style={{ background: 'transparent', border: 'none', color: 'var(--primary-color)', fontWeight: 700, cursor: 'pointer', padding: 0 }}
                  >
                    Sign In to sync across devices
                  </button>
                </>
              )}
            </div>
          </div>

          <button
            onClick={() => setIsWishlistOpen(false)}
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

        {/* Wishlist Items List */}
        <div style={{
          flexGrow: 1,
          overflowY: 'auto',
          padding: '1.25rem 1.5rem',
          display: 'flex',
          flexDirection: 'column',
          gap: '1rem',
        }}>
          {wishlist.length === 0 ? (
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
                width: '68px',
                height: '68px',
                borderRadius: '50%',
                backgroundColor: 'rgba(239, 68, 68, 0.08)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
              }}>
                <Heart size={32} strokeWidth={1.5} color="#ef4444" />
              </div>
              <h4 style={{ fontSize: '1rem', fontWeight: 700, color: 'var(--text-main)', margin: 0 }}>
                Your wishlist is empty
              </h4>
              <p style={{ fontSize: '0.85rem', maxWidth: '320px', lineHeight: 1.5, margin: 0 }}>
                Tap the heart icon on any product to save pieces you love without crowding your cart.
              </p>
              <button
                onClick={() => setIsWishlistOpen(false)}
                className="btn-primary"
                style={{ fontSize: '0.85rem', padding: '0.6rem 1.4rem', marginTop: '0.5rem' }}
              >
                Discover Collections
              </button>
            </div>
          ) : (
            wishlist.map((item) => {
              const isSale = item.sale_price && Number(item.sale_price) < Number(item.price);
              const currentPrice = isSale ? item.sale_price : item.price;
              const img = Array.isArray(item.images) ? item.images[0] : (item.image || 'https://placehold.co/120x150?text=Item');

              return (
                <div
                  key={item.id}
                  style={{
                    display: 'flex',
                    gap: '1rem',
                    border: '1px solid var(--border-color)',
                    borderRadius: 'var(--radius)',
                    padding: '0.85rem',
                    backgroundColor: 'var(--surface, #f8fafc)',
                    transition: 'border-color 0.15s ease',
                  }}
                >
                  {/* Thumbnail */}
                  <div
                    onClick={() => {
                      if (onSelectProduct) onSelectProduct(item);
                      setIsWishlistOpen(false);
                    }}
                    style={{
                      width: '84px',
                      height: '100px',
                      borderRadius: '8px',
                      overflow: 'hidden',
                      backgroundColor: '#0f172a',
                      flexShrink: 0,
                      cursor: 'pointer',
                    }}
                  >
                    <img
                      src={img}
                      alt={item.name}
                      style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                      onError={(e) => {
                        e.currentTarget.src = 'https://placehold.co/120x150?text=Preview';
                      }}
                    />
                  </div>

                  {/* Details */}
                  <div style={{ flexGrow: 1, display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>
                    <div>
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: '0.5rem' }}>
                        <h4
                          onClick={() => {
                            if (onSelectProduct) onSelectProduct(item);
                            setIsWishlistOpen(false);
                          }}
                          style={{
                            fontSize: '0.88rem',
                            fontWeight: 700,
                            color: 'var(--text-main)',
                            margin: 0,
                            cursor: 'pointer',
                            lineHeight: 1.3,
                          }}
                        >
                          {item.name}
                        </h4>

                        <button
                          onClick={() => removeFromWishlist(item.id)}
                          style={{
                            background: 'transparent',
                            border: 'none',
                            color: 'var(--text-muted)',
                            cursor: 'pointer',
                            padding: '0.1rem',
                          }}
                          title="Remove from favorites"
                        >
                          <Trash2 size={15} />
                        </button>
                      </div>

                      {item.category?.name && (
                        <span style={{ fontSize: '0.72rem', color: 'var(--text-muted)', display: 'block', marginTop: '0.2rem' }}>
                          {item.category.name}
                        </span>
                      )}

                      {/* Price in PKR */}
                      <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginTop: '0.35rem' }}>
                        <span style={{
                          fontWeight: 800,
                          fontSize: '0.92rem',
                          color: storeType === 'jewelry' ? '#D4AF37' : 'var(--primary-color)',
                        }}>
                          {formatPrice(currentPrice)}
                        </span>

                        {isSale && (
                          <span style={{ fontSize: '0.78rem', color: 'var(--text-muted)', textDecoration: 'line-through' }}>
                            {formatPrice(item.price)}
                          </span>
                        )}
                      </div>
                    </div>

                    {/* Move to Cart 1-Click Action */}
                    <div style={{ display: 'flex', gap: '0.5rem', marginTop: '0.65rem' }}>
                      <button
                        onClick={() => moveToCart(item)}
                        className="btn-primary"
                        style={{
                          flex: 1,
                          fontSize: '0.78rem',
                          padding: '0.4rem 0.75rem',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          gap: '0.35rem',
                        }}
                      >
                        <ShoppingBag size={13} />
                        <span>Move to Bag</span>
                      </button>
                    </div>
                  </div>
                </div>
              );
            })
          )}
        </div>

        {/* Footer Actions */}
        {wishlist.length > 0 && (
          <div style={{
            padding: '1.25rem 1.5rem',
            borderTop: '1px solid var(--border-color)',
            backgroundColor: 'var(--surface, #f8fafc)',
            display: 'flex',
            flexDirection: 'column',
            gap: '0.65rem',
          }}>
            <button
              onClick={moveAllToCart}
              className="btn-primary"
              style={{
                width: '100%',
                padding: '0.8rem',
                fontSize: '0.9rem',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '0.5rem',
              }}
            >
              <ShoppingBag size={16} />
              <span>Move All to Shopping Bag</span>
            </button>

            <button
              onClick={clearWishlist}
              style={{
                background: 'transparent',
                border: 'none',
                color: 'var(--text-muted)',
                fontSize: '0.78rem',
                cursor: 'pointer',
                textAlign: 'center',
                padding: '0.2rem',
              }}
            >
              Clear entire favorites list
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
