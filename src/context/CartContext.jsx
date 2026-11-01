import React, { createContext, useContext, useState, useEffect } from 'react';
import axios from 'axios';
import { useAuth } from './AuthContext';
import { AlertCircle, AlertTriangle, CheckCircle2 } from 'lucide-react';

const CartContext = createContext(null);

export const useCart = () => {
  const context = useContext(CartContext);
  if (!context) {
    throw new Error('useCart must be used within a CartProvider');
  }
  return context;
};

export const CartProvider = ({ children }) => {
  const { user } = useAuth();

  const getStorageKey = (u) => (u ? `flexistore_cart_user_${u.id}` : 'flexistore_cart_guest');
  const currentKey = getStorageKey(user);

  const [cartItems, setCartItems] = useState(() => {
    try {
      const saved = localStorage.getItem(currentKey);
      if (!saved) return [];
      const parsed = JSON.parse(saved);
      return Array.isArray(parsed)
        ? parsed.map((item) => ({ ...item, stock: item.stock !== undefined ? Number(item.stock) : 99 }))
        : [];
    } catch {
      return [];
    }
  });

  const [isOpen, setIsOpen] = useState(false);
  const [toast, setToast] = useState(null);

  const showCartToast = (message, type = 'warning') => {
    setToast({ message, type });
    setTimeout(() => {
      setToast(null);
    }, 3200);
  };

  // Sync / switch cart whenever user logs in, logs out, or switches account
  useEffect(() => {
    try {
      if (user) {
        const userSaved = localStorage.getItem(`flexistore_cart_user_${user.id}`);
        const guestSaved = localStorage.getItem('flexistore_cart_guest');
        let userItems = userSaved ? JSON.parse(userSaved) : [];

        // If guest cart had items, merge them into user's cart on login
        if (guestSaved) {
          const guestItems = JSON.parse(guestSaved);
          if (Array.isArray(guestItems) && guestItems.length > 0) {
            guestItems.forEach((gItem) => {
              const existing = userItems.find((u) => u.cartItemId === gItem.cartItemId);
              if (existing) {
                existing.quantity += gItem.quantity;
              } else {
                userItems.push(gItem);
              }
            });
            localStorage.removeItem('flexistore_cart_guest');
          }
        }
        setCartItems(userItems);
      } else {
        const guestSaved = localStorage.getItem('flexistore_cart_guest');
        setCartItems(guestSaved ? JSON.parse(guestSaved) : []);
      }
    } catch (e) {
      console.warn('Cart sync error:', e);
    }
  }, [user?.id]);

  // Persist active cart items to current user's key
  useEffect(() => {
    try {
      localStorage.setItem(currentKey, JSON.stringify(cartItems));
    } catch (e) {
      console.warn('Failed to save cart to localStorage:', e);
    }
  }, [cartItems, currentKey]);

  // Synchronize cart items with live database stock and auto-clamp any oversold quantities
  useEffect(() => {
    let isMounted = true;
    axios
      .get('/api/products?per_page=100')
      .then((res) => {
        if (!isMounted) return;
        const productsList = res.data?.data || res.data || [];
        if (!Array.isArray(productsList) || productsList.length === 0) return;

        setCartItems((prev) => {
          let hasChanges = false;
          const updated = prev.map((item) => {
            const liveProd = productsList.find((p) => p.id === item.product_id);
            if (!liveProd) return item;

            const liveStock = liveProd.stock !== undefined && liveProd.stock !== null ? Number(liveProd.stock) : item.stock;
            // Strictly clamp quantity to never exceed live stock
            const clampedQty = Math.max(1, Math.min(item.quantity, Math.max(1, liveStock)));

            if (item.stock !== liveStock || item.quantity !== clampedQty) {
              hasChanges = true;
              return { ...item, stock: liveStock, quantity: clampedQty };
            }
            return item;
          });

          return hasChanges ? updated : prev;
        });
      })
      .catch((err) => {
        console.warn('Failed to verify live stock for cart items:', err);
      });

    return () => {
      isMounted = false;
    };
  }, [isOpen]);

  // Auto-populate demo cart on demo mode activation
  useEffect(() => {
    const handleDemoActivated = () => {
      setCartItems(DEMO_ITEMS);
    };
    window.addEventListener('portfolio_demo_activated', handleDemoActivated);
    return () => window.removeEventListener('portfolio_demo_activated', handleDemoActivated);
  }, []);

  const populateDemoCart = () => {
    setCartItems(DEMO_ITEMS);
    if (user) {
      try {
        localStorage.setItem(`flexistore_cart_user_${user.id}`, JSON.stringify(DEMO_ITEMS));
      } catch (e) {
        console.warn('Failed to save demo cart:', e);
      }
    }
  };

  const getProductCartQuantity = (productId) => {
    return cartItems
      .filter((item) => item.product_id === productId)
      .reduce((sum, item) => sum + item.quantity, 0);
  };

  const getProductRemainingStock = (product) => {
    if (!product) return 0;
    const maxStock = product.stock !== undefined && product.stock !== null ? Number(product.stock) : 99;
    const inCart = getProductCartQuantity(product.id);
    return Math.max(0, maxStock - inCart);
  };

  const addToCart = (product, requestedQty = 1, selectedAttributes = {}) => {
    const maxStock = product.stock !== undefined && product.stock !== null ? Number(product.stock) : 99;

    // Reject if product is completely out of stock
    if (maxStock <= 0) {
      showCartToast(`"${product.name}" is currently out of stock.`, 'error');
      return false;
    }

    // Check existing count in cart for this product
    const existingTotalForProduct = cartItems
      .filter((item) => item.product_id === product.id)
      .reduce((sum, item) => sum + item.quantity, 0);

    const availableStock = Math.max(0, maxStock - existingTotalForProduct);

    if (availableStock <= 0) {
      showCartToast(`Cannot add more. All ${maxStock} items in stock for "${product.name}" are already in your shopping bag.`, 'warning');
      setIsOpen(true);
      return false;
    }

    let qtyToAdd = requestedQty;
    if (requestedQty > availableStock) {
      qtyToAdd = availableStock;
      showCartToast(`Only ${availableStock} more available (stock: ${maxStock}). Added ${qtyToAdd} to your bag.`, 'warning');
    }

    setCartItems((prev) => {
      // Deterministic key based on product ID and selected attributes
      const attrKey = Object.entries(selectedAttributes)
        .sort(([a], [b]) => a.localeCompare(b))
        .map(([k, v]) => `${k}:${v}`)
        .join('|');

      const cartItemId = `${product.id}-${attrKey}`;

      const existingIndex = prev.findIndex((item) => item.cartItemId === cartItemId);
      if (existingIndex > -1) {
        const updated = [...prev];
        updated[existingIndex].quantity += qtyToAdd;
        updated[existingIndex].stock = maxStock;
        return updated;
      } else {
        const unitPrice = Number(product.sale_price || product.price);
        const firstImage = Array.isArray(product.images) ? product.images[0] : product.images;

        return [
          ...prev,
          {
            cartItemId,
            product_id: product.id,
            name: product.name,
            price: unitPrice,
            regular_price: Number(product.price),
            quantity: qtyToAdd,
            stock: maxStock,
            selected_attributes: selectedAttributes,
            image: firstImage,
            sku: product.sku,
            store_id: product.store_id,
          },
        ];
      }
    });

    setIsOpen(true);
    return true;
  };

  const removeFromCart = (cartItemId) => {
    setCartItems((prev) => prev.filter((item) => item.cartItemId !== cartItemId));
  };

  const updateQuantity = (cartItemId, newQuantity) => {
    if (newQuantity <= 0) {
      removeFromCart(cartItemId);
      return;
    }

    setCartItems((prev) => {
      const item = prev.find((i) => i.cartItemId === cartItemId);
      if (!item) return prev;

      const maxStock = typeof item.stock === 'number' ? item.stock : (item.stock ? Number(item.stock) : 99);
      const otherVariantsQty = prev
        .filter((i) => i.product_id === item.product_id && i.cartItemId !== cartItemId)
        .reduce((sum, i) => sum + i.quantity, 0);

      const maxAllowedForThisItem = Math.max(1, maxStock - otherVariantsQty);

      if (newQuantity > maxAllowedForThisItem) {
        showCartToast(`Maximum available stock (${maxAllowedForThisItem}) reached for "${item.name}".`, 'warning');
        return prev.map((i) =>
          i.cartItemId === cartItemId ? { ...i, quantity: maxAllowedForThisItem, stock: maxStock } : i
        );
      }

      return prev.map((i) =>
        i.cartItemId === cartItemId ? { ...i, quantity: newQuantity, stock: maxStock } : i
      );
    });
  };

  const clearCart = () => {
    setCartItems([]);
  };

  const itemCount = cartItems.reduce((acc, item) => acc + item.quantity, 0);
  const subtotal = cartItems.reduce((acc, item) => acc + item.price * item.quantity, 0);

  return (
    <CartContext.Provider
      value={{
        cartItems,
        itemCount,
        subtotal,
        isOpen,
        setIsOpen,
        addToCart,
        removeFromCart,
        updateQuantity,
        clearCart,
        populateDemoCart,
        getProductCartQuantity,
        getProductRemainingStock,
        showCartToast,
        activeUser: user,
      }}
    >
      {children}

      {/* Floating Stock & Cart Warning Toast */}
      {toast && (
        <div
          style={{
            position: 'fixed',
            bottom: '2.5rem',
            left: '50%',
            transform: 'translateX(-50%)',
            backgroundColor: toast.type === 'error' ? '#881337' : toast.type === 'warning' ? '#78350f' : '#0f172a',
            color: '#ffffff',
            padding: '0.75rem 1.4rem',
            borderRadius: '999px',
            fontSize: '0.86rem',
            fontWeight: 700,
            zIndex: 10005,
            boxShadow: '0 12px 30px rgba(0,0,0,0.45)',
            display: 'flex',
            alignItems: 'center',
            gap: '0.55rem',
            border: '1px solid rgba(255,255,255,0.2)',
            maxWidth: '90vw',
            textAlign: 'center',
          }}
          className="animate-fade-in"
        >
          {toast.type === 'error' ? (
            <AlertCircle size={17} style={{ flexShrink: 0, color: '#fca5a5' }} />
          ) : (
            <AlertTriangle size={17} style={{ flexShrink: 0, color: '#fde047' }} />
          )}
          <span>{toast.message}</span>
        </div>
      )}
    </CartContext.Provider>
  );
};
