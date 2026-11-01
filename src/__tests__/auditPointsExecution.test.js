import { describe, it, expect } from 'vitest';
import fs from 'fs';
import path from 'path';

describe('Audit 4-Points Execution Suite', () => {
  const checkoutPath = path.resolve(__dirname, '../pages/Checkout.jsx');
  const checkoutContent = fs.readFileSync(checkoutPath, 'utf-8');

  const navbarPath = path.resolve(__dirname, '../components/Navbar.jsx');
  const navbarContent = fs.readFileSync(navbarPath, 'utf-8');

  describe('Point 1: COD Phone OTP Requirement Removal', () => {
    it('allows Cash on Delivery orders to proceed without blocking on otpVerified', () => {
      // The condition must check payment_method !== 'cod' before blocking on !otpVerified
      expect(checkoutContent).toContain("if (!otpVerified && formData.payment_method !== 'cod')");
    });

    it('informs COD customers that OTP is optional and allows direct ordering', () => {
      expect(checkoutContent).toContain('Phone OTP is optional for Cash on Delivery. You can place your order directly.');
    });

    it('keeps OTP verification only for advance digital payments', () => {
      expect(checkoutContent).toContain('Please verify your phone number via OTP before completing your online payment.');
    });
  });

  describe('Point 2: Navbar Menu Clean-up & Real Collections', () => {
    it('aligns navigation strictly to real handcrafted categories', () => {
      expect(navbarContent).toContain('crochet-bag-gyEi');
      expect(navbarContent).toContain('fabric-bag-2Upe');
      expect(navbarContent).toContain('crochet-caps-liOX');
      expect(navbarContent).toContain('handmade-mufflers-scarves');
      expect(navbarContent).toContain('jewellery-6odb');
      expect(navbarContent).toContain('traditional-festive-luxury-pret-wear-0e24');
      expect(navbarContent).toContain('kids-crochet-tops-frocks-9ftX');
    });

    it('keeps desktop header clean without extra navigation row', () => {
      expect(navbarContent).not.toContain('className="khaadi-desktop-nav"');
    });

    it('does not contain phantom products or fake categories', () => {
      // Must not link to items never sold by the handcrafted store
      expect(navbarContent).not.toContain('Handmade Khussa');
      expect(navbarContent).not.toContain('Prince Coats');
      expect(navbarContent).not.toContain('Kundan & Polki');
      expect(navbarContent).not.toContain('Traditional Parandas');
      expect(navbarContent).not.toContain('Floral Gajray');
      expect(navbarContent).not.toContain('Wooden Cufflinks');
      expect(navbarContent).not.toContain('Handmade Leather Wallets');
      expect(navbarContent).not.toContain('Handmade Scrunchies');
    });

    it('features trending handcrafted search terms', () => {
      expect(navbarContent).toContain('Crochet Bag');
      expect(navbarContent).toContain('Fabric Bag');
      expect(navbarContent).toContain('Crochet Cap');
      expect(navbarContent).toContain('Thread Bangles');
      expect(navbarContent).toContain('Thread Earrings');
      expect(navbarContent).toContain('Pishwas');
      expect(navbarContent).not.toContain('Unstitched Lawn');
      expect(navbarContent).not.toContain('Prince Coat');
    });
  });

  describe('Point 4: FlexiPay 4-Installments & CNIC Removal', () => {
    it('does not offer FlexiPay in payment method selector', () => {
      expect(checkoutContent).not.toContain('value="flexipay"');
      expect(checkoutContent).not.toContain('FlexiPay (4 Bi-Weekly Installments');
    });

    it('does not mandate or ask for CNIC verification during checkout', () => {
      expect(checkoutContent).not.toContain('name="cnic"');
      expect(checkoutContent).not.toContain('CNIC number required');
      expect(checkoutContent).not.toContain('National Identity Card');
    });

    it('maintains the standard digital and cash payment options', () => {
      expect(checkoutContent).toContain("payment_method: 'cod'");
      expect(checkoutContent).toContain("formData.payment_method === 'cod'");
      expect(checkoutContent).toContain("formData.payment_method === 'jazzcash'");
      expect(checkoutContent).toContain("formData.payment_method === 'easypaisa'");
      expect(checkoutContent).toContain("formData.payment_method === 'payfast'");
      expect(checkoutContent).toContain("formData.payment_method === 'safepay'");
    });
  });
});
