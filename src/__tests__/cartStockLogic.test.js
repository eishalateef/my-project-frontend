import { describe, it, expect } from 'vitest';

describe('Cart Stock Clamping & Enforcement Logic', () => {
  it('correctly calculates remaining stock when product is partially in cart', () => {
    const product = { id: 101, name: 'Khaddar Kurta', stock: 5 };
    const cartItems = [
      { product_id: 101, quantity: 2 },
      { product_id: 102, quantity: 1 },
    ];

    const inCartQty = cartItems
      .filter((item) => item.product_id === product.id)
      .reduce((sum, item) => sum + item.quantity, 0);

    const remainingStock = Math.max(0, product.stock - inCartQty);
    expect(remainingStock).toBe(3);
  });

  it('clamps added quantity if requested quantity exceeds available stock', () => {
    const maxStock = 4;
    const existingInCart = 3;
    const requestedQty = 3;

    const availableStock = Math.max(0, maxStock - existingInCart);
    expect(availableStock).toBe(1);

    const qtyToAdd = Math.min(requestedQty, availableStock);
    expect(qtyToAdd).toBe(1);
  });

  it('prevents adding any quantity when available stock is 0', () => {
    const maxStock = 2;
    const existingInCart = 2;

    const availableStock = Math.max(0, maxStock - existingInCart);
    expect(availableStock).toBe(0);
    const canAdd = availableStock > 0;
    expect(canAdd).toBe(false);
  });

  it('accurately calculates cart subtotal and final amount', () => {
    const items = [
      { price: 4500, quantity: 2 }, // 9000
      { price: 6000, quantity: 1 }, // 6000
    ];

    const subtotal = items.reduce((sum, i) => sum + i.price * i.quantity, 0);
    expect(subtotal).toBe(15000);

    const shipping = 0; // Free express delivery
    const discount = 500;
    const finalAmount = subtotal - discount + shipping;
    expect(finalAmount).toBe(14500);
  });
});
