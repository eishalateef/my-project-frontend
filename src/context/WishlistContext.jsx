import React, { createContext, useContext, useState, useEffect } from 'react';
import { useAuth } from './AuthContext';
import { useCart } from './CartContext';
import { getImageUrl } from '../utils/imageUrl';

const WishlistContext = createContext(null);

export const useWishlist = () => {
  const context = useContext(WishlistContext);
  if (!context) {
    throw new Error('useWishlist must be used within a WishlistProvider');
  }
  return context;
};

export const WishlistProvider = ({ children }) => {
  const { user } = useAuth();
  const { addToCart } = useCart();

  const getStorageKey = (u) => (u ? `flexistore_wishlist_user_${u.id}` : 'flexistore_wishlist_guest');
  const currentKey = getStorageKey(user);

  const [wishlist, setWishlist] = useState(() => {
    try {
      const saved = localStorage.getItem(currentKey);
      return saved ? JSON.parse(saved) : [];
    } catch {
      return [];
    }
  });

  const [isWishlistOpen, setIsWishlistOpen] = useState(false);
  const [toast, setToast] = useState(null);

  // Sync / switch wishlist whenever user logs in or out
  useEffect(() => {
    try {
      if (user) {
        const userSaved = localStorage.getItem(`flexistore_wishlist_user_${user.id}`);
        const guestSaved = localStorage.getItem('flexistore_wishlist_guest');
        let userItems = userSaved ? JSON.parse(userSaved) : [];

        // If guest had favorited items, merge them on login
        if (guestSaved) {
          const guestItems = JSON.parse(guestSaved);
          if (Array.isArray(guestItems) && guestItems.length > 0) {
            guestItems.forEach((g) => {
              if (!userItems.some((u) => u.id === g.id)) {
                userItems.push(g);
              }
            });
            localStorage.removeItem('flexistore_wishlist_guest');
          }
        }
        setWishlist(userItems);
      } else {
        const guestSaved = localStorage.getItem('flexistore_wishlist_guest');
        setWishlist(guestSaved ? JSON.parse(guestSaved) : []);
      }
    } catch (e) {
      console.warn('Wishlist sync error:', e);
    }
  }, [user?.id]);

  // Persist active wishlist items to current user's key
  useEffect(() => {
    try {
      localStorage.setItem(currentKey, JSON.stringify(wishlist));
    } catch (e) {
      console.warn('Failed to save wishlist to localStorage:', e);
    }
  }, [wishlist, currentKey]);

  const showToast = (message, type = 'success') => {
    setToast({ message, type });
    setTimeout(() => setToast(null), 2500);
  };

  const isInWishlist = (productId) => {
    return wishlist.some((item) => String(item.id) === String(productId));
  };

  const addToWishlist = (product) => {
    if (isInWishlist(product.id)) return;

    const rawFirstImage = Array.isArray(product.images) && product.images.length > 0
      ? product.images[0]
      : (product.images || 'https://placehold.co/300x300?text=Product');
    const firstImage = getImageUrl(rawFirstImage);

    const cleanItem = {
      id: product.id,
      name: product.name,
      slug: product.slug,
      price: Number(product.price),
      sale_price: product.sale_price ? Number(product.sale_price) : null,
      images: Array.isArray(product.images) ? product.images : [firstImage],
      image: firstImage,
      stock: product.stock,
      category: product.category,
      sku: product.sku,
      store_id: product.store_id,
      attributes: product.attributes || [],
    };

    setWishlist((prev) => [cleanItem, ...prev]);
    showToast(`Added "${product.name}" to your favorites! ❤️`);
  };

  const removeFromWishlist = (productId) => {
    setWishlist((prev) => prev.filter((item) => String(item.id) !== String(productId)));
    showToast('Removed from favorites.');
  };

  const toggleWishlist = (product) => {
    if (isInWishlist(product.id)) {
      removeFromWishlist(product.id);
    } else {
      addToWishlist(product);
    }
  };

  const clearWishlist = () => {
    setWishlist([]);
    showToast('Favorites list cleared.');
  };

  const moveToCart = (product) => {
    // Determine default attributes if any
    const defaultAttrs = {};
    if (product.attributes && Array.isArray(product.attributes)) {
      const sizeAttr = product.attributes.find((a) => a.attribute_name === 'size');
      if (sizeAttr) defaultAttrs.size = sizeAttr.attribute_value;

      const colorAttr = product.attributes.find((a) => a.attribute_name === 'color');
      if (colorAttr) defaultAttrs.color = colorAttr.attribute_value;

      const purityAttr = product.attributes.find((a) => a.attribute_name === 'purity');
      if (purityAttr) defaultAttrs.purity = purityAttr.attribute_value;
    }

    addToCart(product, 1, defaultAttrs);
    removeFromWishlist(product.id);
    showToast(`Moved "${product.name}" to your shopping cart! 🛍️`);
  };

  const moveAllToCart = () => {
    if (wishlist.length === 0) return;
    wishlist.forEach((item) => {
      addToCart(item, 1, {});
    });
    setWishlist([]);
    showToast('All saved items moved to shopping cart!');
  };

  return (
    <WishlistContext.Provider
      value={{
        wishlist,
        wishlistCount: wishlist.length,
        isWishlistOpen,
        setIsWishlistOpen,
        isInWishlist,
        addToWishlist,
        removeFromWishlist,
        toggleWishlist,
        clearWishlist,
        moveToCart,
        moveAllToCart,
      }}
    >
      {children}

      {/* Floating feedback toast */}
      {toast && (
        <div
          style={{
            position: 'fixed',
            bottom: '2rem',
            left: '50%',
            transform: 'translateX(-50%)',
            backgroundColor: '#0f172a',
            color: '#ffffff',
            padding: '0.65rem 1.25rem',
            borderRadius: '999px',
            fontSize: '0.85rem',
            fontWeight: 700,
            zIndex: 9999,
            boxShadow: '0 10px 25px rgba(0,0,0,0.35)',
            display: 'flex',
            alignItems: 'center',
            gap: '0.5rem',
            border: '1px solid rgba(255,255,255,0.1)',
            pointerEvents: 'none',
          }}
          className="animate-fade-in"
        >
          <span>{toast.message}</span>
        </div>
      )}
    </WishlistContext.Provider>
  );
};
