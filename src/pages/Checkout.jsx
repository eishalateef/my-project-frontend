import React, { useState, useEffect } from 'react';
import api from '../api/axios';
import { useCart } from '../context/CartContext';
import { useStore } from '../context/StoreContext';
import { useAuth } from '../context/AuthContext';
import confetti from 'canvas-confetti';
import {
  ShieldCheck,
  Phone,
  CheckCircle2,
  Lock,
  ArrowRight,
  ArrowLeft,
  Banknote,
  CreditCard,
  Truck,
  AlertCircle,
  Tag,
  Sparkles,
  Check,
  Clock,
  Package,
  RotateCcw,
  Smartphone,
  X,
  RefreshCw,
  QrCode,
  Building,
  ExternalLink,
  Info,
  Zap,
} from 'lucide-react';

export default function Checkout({ onBackToShopping, onOrderSuccess }) {
  const { cartItems, subtotal, clearCart } = useCart();
  const { store, storeType, formatPrice } = useStore();
  const { user, isAuthenticated, isDemoMode } = useAuth();

  // Form Fields
  // Form Fields - Start empty for unauthenticated guests, or populate from user profile if logged in
  const [formData, setFormData] = useState({
    name: user?.name || '',
    phone: user?.phone || '',
    email: user?.email || '',
    address: user?.address || '',
    city: user?.city || '',
    payment_method: 'cod', // cod, jazzcash, easypaisa, payfast, safepay, flexipay
    wallet_number: user?.phone || '',
    customer_cnic: '',
    alternate_phone: '',
    down_payment_method: 'jazzcash',
    notes: '',
  });

  useEffect(() => {
    if (user) {
      setFormData((prev) => ({
        ...prev,
        name: user.name || prev.name,
        phone: user.phone || prev.phone,
        email: user.email || prev.email,
        address: user.address || prev.address,
        city: user.city || prev.city,
        wallet_number: user.phone || prev.wallet_number,
      }));
      if (user.phone) {
        setOtpVerified(true);
      }
    }
  }, [user]);

  // Coupon / Promo Code State
  const [couponCode, setCouponCode] = useState('');
  const [appliedCoupon, setAppliedCoupon] = useState(null);
  const [couponError, setCouponError] = useState('');
  const [couponSuccess, setCouponSuccess] = useState('');

  // OTP Verification States
  const [otpCode, setOtpCode] = useState('');
  const [otpSent, setOtpSent] = useState(false);
  const [otpVerified, setOtpVerified] = useState(false);
  const [isRealSms, setIsRealSms] = useState(false);
  const [demoCode, setDemoCode] = useState(null);
  const [otpResponseMsg, setOtpResponseMsg] = useState(null);
  const [sendingOtp, setSendingOtp] = useState(false);
  const [verifyingOtp, setVerifyingOtp] = useState(false);
  const [submittingOrder, setSubmittingOrder] = useState(false);
  const [errorMessage, setErrorMessage] = useState(null);

  // Security Throttling & Anti-Brute-Force Lockout States
  const [otpCooldown, setOtpCooldown] = useState(0);
  const [failedOtpAttempts, setFailedOtpAttempts] = useState(0);
  const [lockoutRemaining, setLockoutRemaining] = useState(0);

  // Online Gateway Modal States (JazzCash, Easypaisa, PayFast)
  const [showPaymentModal, setShowPaymentModal] = useState(false);
  const [activeGateway, setActiveGateway] = useState('jazzcash');
  const [paymentSession, setPaymentSession] = useState(null);
  const [walletMpin, setWalletMpin] = useState('1234');
  const [cardDetails, setCardDetails] = useState({ number: '4242 •••• •••• 4242', exp: '12/28', cvv: '123' });
  const [isVerifyingPayment, setIsVerifyingPayment] = useState(false);
  const [paymentCountdown, setPaymentCountdown] = useState(60);

  // Phone Sanitizer & Pakistani Format Validator
  const isValidPkPhone = (phone) => {
    if (!phone) return false;
    const clean = phone.replace(/[^0-9+]/g, '');
    return /^((\+92)|(0092)|(92)|(0))?3[0-9]{9}$/.test(clean);
  };

  // OTP Resend Cooldown Countdown (prevents endpoint abuse)
  useEffect(() => {
    let timer;
    if (otpCooldown > 0) {
      timer = setInterval(() => {
        setOtpCooldown((prev) => (prev > 0 ? prev - 1 : 0));
      }, 1000);
    }
    return () => clearInterval(timer);
  }, [otpCooldown]);

  // Anti-Brute-Force Lockout Countdown (locks verification for 120s after 5 invalid attempts)
  useEffect(() => {
    let timer;
    if (lockoutRemaining > 0) {
      timer = setInterval(() => {
        setLockoutRemaining((prev) => (prev > 0 ? prev - 1 : 0));
      }, 1000);
    }
    return () => clearInterval(timer);
  }, [lockoutRemaining]);

  // Discount calculation
  const discountRate = appliedCoupon ? appliedCoupon.rate : 0;
  const discountAmount = Math.round(subtotal * discountRate);
  const finalPayable = Math.max(0, subtotal - discountAmount);

  // Delivery date estimate (2-3 business days from today)
  const getDeliveryEstimate = () => {
    const today = new Date();
    const minDays = new Date(today);
    minDays.setDate(today.getDate() + 2);
    const maxDays = new Date(today);
    maxDays.setDate(today.getDate() + 3);
    return `${minDays.toLocaleDateString(undefined, { month: 'short', day: 'numeric' })} – ${maxDays.toLocaleDateString(undefined, { month: 'short', day: 'numeric' })}`;
  };

  // Timer countdown inside online payment modal
  useEffect(() => {
    let timer;
    if (showPaymentModal && paymentCountdown > 0) {
      timer = setInterval(() => {
        setPaymentCountdown((prev) => (prev > 0 ? prev - 1 : 0));
      }, 1000);
    }
    return () => clearInterval(timer);
  }, [showPaymentModal, paymentCountdown]);

  const handleApplyCoupon = (e) => {
    e.preventDefault();
    const cleanCode = couponCode.trim().toUpperCase();
    setCouponError('');
    setCouponSuccess('');

    if (!cleanCode) {
      setCouponError('Please enter a valid voucher or promo code.');
      return;
    }

    if (cleanCode === 'FLEXI10') {
      setAppliedCoupon({ code: 'FLEXI10', rate: 0.10, label: '10% OFF Seasonal Welcome' });
      setCouponSuccess('10% VIP Discount applied successfully!');
    } else if (cleanCode === 'WELCOME20') {
      setAppliedCoupon({ code: 'WELCOME20', rate: 0.20, label: '20% OFF Welcome Bonus' });
      setCouponSuccess('20% Welcome Promo applied successfully!');
    } else if (cleanCode === 'VIP15') {
      setAppliedCoupon({ code: 'VIP15', rate: 0.15, label: '15% OFF Member Privileges' });
      setCouponSuccess('15% VIP Privileges applied successfully!');
    } else {
      setCouponError('Invalid promo code. Try FLEXI10 or WELCOME20.');
    }
  };

  const handleRemoveCoupon = () => {
    setAppliedCoupon(null);
    setCouponCode('');
    setCouponSuccess('');
    setCouponError('');
  };

  const handleSendOtp = async () => {
    if (otpCooldown > 0) return;

    if (!formData.phone || formData.phone.trim().length < 7) {
      setErrorMessage('Please enter your mobile phone number first.');
      return;
    }

    if (!isValidPkPhone(formData.phone)) {
      setErrorMessage('Please enter a valid Pakistani mobile number (e.g. 03001234567 or +923001234567).');
      return;
    }

    setErrorMessage(null);
    setSendingOtp(true);

    try {
      const res = await api.post('/api/otp/send', { phone: formData.phone.trim() });
      if (res.data.success) {
        setOtpSent(true);
        setIsRealSms(Boolean(res.data.is_real_sms));
        setDemoCode(res.data.demo_code);
        setOtpResponseMsg(res.data.message);
        setOtpCode(''); // Keep empty so user types their received code
        setOtpCooldown(60); // 60s cooldown against SMS spam / rate-limiting
      }
    } catch (err) {
      console.error('Failed to send OTP:', err);
      setErrorMessage(err.response?.data?.message || 'Failed to send OTP code. Please try again.');
    } finally {
      setSendingOtp(false);
    }
  };

  const handleVerifyOtp = async () => {
    if (lockoutRemaining > 0) {
      setErrorMessage(`Account temporarily protected: Too many invalid attempts. Try again in ${lockoutRemaining} seconds.`);
      return;
    }

    if (!otpCode || otpCode.trim().length !== 4) {
      setErrorMessage('Please enter the 4-digit verification code.');
      return;
    }
    setErrorMessage(null);
    setVerifyingOtp(true);

    try {
      const res = await api.post('/api/otp/verify', {
        phone: formData.phone.trim(),
        otp_code: otpCode.trim(),
      });
      if (res.data.success) {
        setOtpVerified(true);
        setFailedOtpAttempts(0);
        setLockoutRemaining(0);
        if (res.data.customer) {
          setFormData((prev) => ({
            ...prev,
            name: prev.name || res.data.customer.name || '',
            email: prev.email || res.data.customer.email || '',
            address: prev.address || res.data.customer.address || '',
            city: prev.city || res.data.customer.city || '',
          }));
        }
      }
    } catch (err) {
      console.error('Failed to verify OTP:', err);
      const nextFailed = failedOtpAttempts + 1;
      setFailedOtpAttempts(nextFailed);
      if (nextFailed >= 5) {
        setLockoutRemaining(120); // 2-minute lockout against brute force attacks
        setErrorMessage('Security Alert: Too many invalid attempts. Phone verification suspended for 2 minutes.');
      } else {
        const remaining = 5 - nextFailed;
        setErrorMessage(
          err.response?.data?.message ||
          `Invalid or expired code. (${remaining} attempt${remaining === 1 ? '' : 's'} remaining before security lockout)`
        );
      }
    } finally {
      setVerifyingOtp(false);
    }
  };

  const handleFormSubmit = async (e) => {
    e.preventDefault();
    if (cartItems.length === 0) return;

    if (!formData.name || formData.name.trim().length < 2) {
      setErrorMessage('Please enter your full recipient name.');
      return;
    }

    if (!isValidPkPhone(formData.phone)) {
      setErrorMessage('Please enter a valid Pakistani mobile number.');
      return;
    }

    if (!formData.address || formData.address.trim().length < 8) {
      setErrorMessage('Please provide a complete delivery street address (at least 8 characters).');
      return;
    }

    // For online advance payments (Card/JazzCash/EasyPaisa), verify phone; for COD, place order seamlessly with valid mobile
    if (!otpVerified && formData.payment_method !== 'cod') {
      setErrorMessage('Please verify your phone number via OTP before completing your online payment.');
      return;
    }

    setErrorMessage(null);

    // If Cash on Delivery, place order directly
    if (formData.payment_method === 'cod') {
      await processDirectCheckout({
        payment_method: 'cod',
        payment_status: 'pending',
      });
      return;
    }

    // If Online Payment (JazzCash, Easypaisa, PayFast), initiate payment session
    setSubmittingOrder(true);
    try {
      const initRes = await api.post('/api/payment/initiate', {
        gateway: formData.payment_method,
        amount: finalPayable,
        account_number: formData.wallet_number || formData.phone,
        customer_name: formData.name,
        customer_email: formData.email,
        customer_phone: formData.phone,
      });

      if (initRes.data?.success) {
        setPaymentSession(initRes.data);
        setActiveGateway(formData.payment_method);
        setPaymentCountdown(60);
        setShowPaymentModal(true);
      } else {
        setErrorMessage(initRes.data?.message || 'Could not initiate payment session.');
      }
    } catch (err) {
      setErrorMessage(err.response?.data?.message || 'Payment initiation failed. Please try again.');
    } finally {
      setSubmittingOrder(false);
    }
  };

  // Confirm online payment from modal
  const handleApproveOnlinePayment = async () => {
    setIsVerifyingPayment(true);
    setErrorMessage(null);

    try {
      // 1. Verify payment with backend gateway
      const verifyRes = await api.post('/api/payment/verify', {
        gateway: activeGateway,
        transaction_id: paymentSession.transaction_id,
        mpin: walletMpin,
        account_number: formData.wallet_number || formData.phone,
      });

      if (verifyRes.data?.success) {
        // 2. Complete order in database as PAID
        await processDirectCheckout({
          payment_method: activeGateway,
          payment_gateway: activeGateway,
          payment_status: 'paid',
          transaction_id: verifyRes.data.transaction_id,
          payment_details: {
            gateway: activeGateway,
            transaction_id: verifyRes.data.transaction_id,
            account_number: formData.wallet_number || formData.phone,
            paid_amount: finalPayable,
            paid_at: new Date().toISOString(),
          },
        });
        setShowPaymentModal(false);
      } else {
        alert(verifyRes.data?.message || 'Payment verification failed.');
      }
    } catch (err) {
      alert(err.response?.data?.message || 'Payment verification error.');
    } finally {
      setIsVerifyingPayment(false);
    }
  };

  const processDirectCheckout = async (paymentOverrides = {}) => {
    setSubmittingOrder(true);
    setErrorMessage(null);

    try {
      // Validate inventory before sending order
      const oversoldItem = cartItems.find((item) => {
        const itemStock = typeof item.stock === 'number' ? item.stock : (item.stock ? Number(item.stock) : 99);
        return item.quantity > itemStock;
      });

      if (oversoldItem) {
        setErrorMessage(`The requested quantity for "${oversoldItem.name}" exceeds available stock (${oversoldItem.stock ?? 0} available). Please adjust your shopping bag.`);
        setSubmittingOrder(false);
        return;
      }

      const payload = {
        store_id: store?.id || 1,
        user_id: user?.id || null,
        name: formData.name,
        phone: formData.phone,
        email: formData.email,
        address: formData.address,
        city: formData.city,
        payment_method: paymentOverrides.payment_method || formData.payment_method,
        payment_gateway: paymentOverrides.payment_gateway || (formData.payment_method === 'cod' ? 'cod' : formData.payment_method),
        payment_status: paymentOverrides.payment_status || (formData.payment_method === 'cod' ? 'pending' : 'paid'),
        transaction_id: paymentOverrides.transaction_id || null,
        payment_details: paymentOverrides.payment_details || null,
        customer_cnic: paymentOverrides.customer_cnic || formData.customer_cnic || null,
        alternate_phone: paymentOverrides.alternate_phone || formData.alternate_phone || null,
        down_payment_method: paymentOverrides.down_payment_method || formData.down_payment_method || null,
        notes: formData.notes,
        items: cartItems.map((item) => ({
          product_id: item.product_id,
          quantity: item.quantity,
          selected_attributes: item.selected_attributes,
        })),
      };

      const res = await api.post('/api/checkout', payload);
      if (res.data.success && res.data.order) {
        clearCart();
        try {
          confetti({ particleCount: 120, spread: 80, origin: { y: 0.5 } });
        } catch (e) {}
        onOrderSuccess(res.data.order);
      }
    } catch (err) {
      console.error('Checkout error:', err);
      const backendMsg = err.response?.data?.errors?.items?.[0]
        || Object.values(err.response?.data?.errors || {})?.[0]?.[0]
        || err.response?.data?.message
        || 'Failed to place order. Please review information.';
      setErrorMessage(backendMsg);
    } finally {
      setSubmittingOrder(false);
    }
  };

  if (cartItems.length === 0) {
    return (
      <div style={{ maxWidth: '600px', margin: '4rem auto', textAlign: 'center', padding: '2rem' }}>
        <div style={{
          width: '72px',
          height: '72px',
          borderRadius: '50%',
          backgroundColor: 'var(--surface)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          margin: '0 auto 1.5rem',
          color: 'var(--text-muted)',
        }}>
          <Package size={36} />
        </div>
        <h2 style={{ fontSize: '1.75rem', fontWeight: 800 }}>Your Bag is Empty</h2>
        <p style={{ color: 'var(--text-muted)', margin: '0.75rem 0 2rem', lineHeight: 1.5 }}>
          Explore our collection and add items to your shopping bag before proceeding to checkout.
        </p>
        <button onClick={onBackToShopping} className="btn-primary" style={{ padding: '0.85rem 2rem' }}>
          Continue Shopping
        </button>
      </div>
    );
  }

  return (
    <div style={{ maxWidth: '1240px', margin: '0 auto', padding: '1.5rem 1.25rem 4rem', width: '100%' }}>
      {/* Top Header & Breadcrumb Nav */}
      <div style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        flexWrap: 'wrap',
        gap: '1rem',
        marginBottom: '2rem',
      }}>
        <button
          onClick={onBackToShopping}
          style={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: '0.4rem',
            background: 'transparent',
            border: 'none',
            color: 'var(--text-muted)',
            cursor: 'pointer',
            fontSize: '0.88rem',
            fontWeight: 600,
          }}
        >
          <ArrowLeft size={16} /> Continue Shopping
        </button>

        {/* 3-Step Progress Breadcrumb */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem', fontSize: '0.82rem' }}>
          <span style={{ color: 'var(--text-muted)' }}>Bag ({cartItems.length})</span>
          <span style={{ color: 'var(--text-muted)' }}>➔</span>
          <span style={{
            fontWeight: 800,
            color: 'var(--primary-color)',
            display: 'flex',
            alignItems: 'center',
            gap: '0.35rem',
          }}>
            <Lock size={13} /> 2. Checkout & Verification
          </span>
          <span style={{ color: 'var(--text-muted)' }}>➔</span>
          <span style={{ color: 'var(--text-muted)' }}>3. Confirmation</span>
        </div>
      </div>

      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(360px, 1fr))',
        gap: '2.5rem',
        alignItems: 'start',
      }}>
        {/* Left: Customer Details & Payment Form */}
        <div style={{
          backgroundColor: 'var(--card-bg)',
          border: '1px solid var(--border-color)',
          borderRadius: 'var(--radius)',
          padding: '2rem',
          boxShadow: 'var(--shadow-card)',
        }}>
          <div style={{ marginBottom: '1.5rem' }}>
            <span style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: '0.4rem',
              backgroundColor: 'var(--badge-bg)',
              color: 'var(--badge-text)',
              padding: '0.25rem 0.65rem',
              borderRadius: '999px',
              fontSize: '0.72rem',
              fontWeight: 800,
              textTransform: 'uppercase',
              marginBottom: '0.5rem',
            }}>
              <Lock size={12} /> {isAuthenticated ? 'Account Checkout' : 'Guest Checkout'}
            </span>
            <h2 style={{ fontSize: '1.65rem', fontWeight: 800, letterSpacing: '-0.02em', margin: 0 }}>
              {isAuthenticated ? 'Shipping & Order Verification' : 'Customer & Delivery Information'}
            </h2>
            <p style={{ color: 'var(--text-muted)', fontSize: '0.88rem', marginTop: '0.35rem' }}>
              {isAuthenticated
                ? 'Your order will be linked to your account with saved delivery preferences.'
                : 'Please enter your contact details and shipping address to place your order.'}
            </p>
          </div>

          {errorMessage && (
            <div style={{
              backgroundColor: '#FEF2F2',
              border: '1px solid #FCA5A5',
              color: '#991B1B',
              padding: '0.85rem 1rem',
              borderRadius: 'var(--radius)',
              marginBottom: '1.5rem',
              fontSize: '0.85rem',
              display: 'flex',
              alignItems: 'center',
              gap: '0.5rem',
            }}>
              <AlertCircle size={16} />
              <span>{errorMessage}</span>
            </div>
          )}

          <form onSubmit={handleFormSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
            {/* Full Name */}
            <div>
              <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 600, marginBottom: '0.4rem' }}>
                Full Name *
              </label>
              <input
                type="text"
                required
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                className="form-input"
                placeholder="Enter your full name"
              />
            </div>

            {/* Phone & OTP Block */}
            <div style={{
              backgroundColor: 'var(--surface)',
              border: '1px solid var(--border-color)',
              borderRadius: 'var(--radius)',
              padding: '1.25rem',
            }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.4rem' }}>
                <label style={{ fontSize: '0.85rem', fontWeight: 700 }}>
                  Mobile Phone Number *
                </label>
                {otpVerified && (
                  <span style={{ fontSize: '0.75rem', fontWeight: 800, color: '#16A34A', display: 'flex', alignItems: 'center', gap: '0.25rem' }}>
                    <CheckCircle2 size={13} /> Verified
                  </span>
                )}
              </div>
              <div style={{ display: 'flex', gap: '0.5rem' }}>
                <input
                  type="text"
                  required
                  disabled={otpVerified}
                  value={formData.phone}
                  onChange={(e) => {
                    const val = e.target.value;
                    setFormData((prev) => ({
                      ...prev,
                      phone: val,
                      wallet_number: prev.wallet_number === prev.phone || !prev.wallet_number ? val : prev.wallet_number,
                    }));
                  }}
                  className="form-input"
                  placeholder="03XXXXXXXXX (e.g. 03001234567)"
                  style={{ flexGrow: 1 }}
                />
                {!otpVerified && (
                  <button
                    type="button"
                    onClick={handleSendOtp}
                    disabled={sendingOtp || otpCooldown > 0}
                    className="btn-primary"
                    style={{
                      fontSize: '0.82rem',
                      whiteSpace: 'nowrap',
                      padding: '0 1.25rem',
                      opacity: otpCooldown > 0 ? 0.7 : 1,
                      cursor: otpCooldown > 0 ? 'not-allowed' : 'pointer',
                    }}
                  >
                    {sendingOtp
                      ? 'Sending...'
                      : otpCooldown > 0
                      ? `Resend in ${otpCooldown}s`
                      : otpSent
                      ? 'Resend OTP'
                      : 'Send OTP'}
                  </button>
                )}
              </div>

              {formData.payment_method === 'cod' && !otpVerified && (
                <div style={{ fontSize: '0.75rem', color: '#16a34a', fontWeight: 600, marginTop: '0.35rem', display: 'flex', alignItems: 'center', gap: '0.35rem' }}>
                  <CheckCircle2 size={13} /> Phone OTP is optional for Cash on Delivery. You can place your order directly.
                </div>
              )}

              {/* OTP Notification (Real SMS vs Simulation) */}
              {otpSent && !otpVerified && (
                <div style={{
                  marginTop: '1rem',
                  backgroundColor: isRealSms ? '#ecfdf5' : 'rgba(212, 175, 55, 0.1)',
                  border: isRealSms ? '1px solid #10b981' : '1px dashed var(--primary-color)',
                  borderRadius: 'var(--radius)',
                  padding: '0.95rem',
                }}>
                  <div style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '0.45rem',
                    fontSize: '0.85rem',
                    fontWeight: 800,
                    color: isRealSms ? '#059669' : 'var(--primary-color)',
                  }}>
                    <Phone size={15} />
                    <span>{isRealSms ? 'Real SMS Dispatched to Your Phone!' : 'SMS Phone Verification Dispatched'}</span>
                  </div>

                  {lockoutRemaining > 0 && (
                    <div style={{
                      backgroundColor: '#FEF2F2',
                      border: '1px solid #FCA5A5',
                      borderRadius: '6px',
                      padding: '0.45rem 0.65rem',
                      color: '#991B1B',
                      fontSize: '0.74rem',
                      fontWeight: 700,
                      marginTop: '0.5rem',
                      display: 'flex',
                      alignItems: 'center',
                      gap: '0.4rem',
                    }}>
                      <ShieldCheck size={14} color="#DC2626" />
                      <span>Security Lock active ({lockoutRemaining}s remaining). Brute-force protection enabled.</span>
                    </div>
                  )}

                  <p style={{
                    fontSize: '0.78rem',
                    color: isRealSms ? '#065f46' : 'var(--text-muted)',
                    margin: '0.35rem 0 0.85rem',
                    lineHeight: 1.45,
                  }}>
                    {isRealSms ? (
                      <>An SMS with your 4-digit code has been delivered to <strong>{formData.phone}</strong>. Please check your text messages.</>
                    ) : isDemoMode ? (
                      <>
                        Simulated demo code for instant testing: <strong style={{ color: 'var(--primary-color)', fontSize: '0.95rem' }}>{demoCode}</strong>
                        {otpResponseMsg && !otpResponseMsg.includes('Simulated') && (
                          <span style={{ display: 'block', marginTop: '0.35rem', color: '#b45309', fontSize: '0.75rem' }}>
                            {otpResponseMsg}
                          </span>
                        )}
                      </>
                    ) : (
                      <>
                        A 4-digit verification code has been dispatched via SMS to <strong>{formData.phone}</strong>. Please enter the code below to complete verification.
                      </>
                    )}
                  </p>

                  <div style={{ display: 'flex', gap: '0.5rem' }}>
                    <input
                      type="text"
                      maxLength={4}
                      value={otpCode}
                      onChange={(e) => setOtpCode(e.target.value)}
                      placeholder="4-digit code"
                      className="form-input"
                      disabled={lockoutRemaining > 0}
                      style={{
                        width: '135px',
                        textAlign: 'center',
                        letterSpacing: '0.25em',
                        fontWeight: 800,
                        fontSize: '1.1rem',
                        opacity: lockoutRemaining > 0 ? 0.6 : 1,
                      }}
                    />
                    <button
                      type="button"
                      onClick={handleVerifyOtp}
                      disabled={verifyingOtp || lockoutRemaining > 0}
                      className="btn-primary"
                      style={{
                        fontSize: '0.82rem',
                        opacity: lockoutRemaining > 0 ? 0.6 : 1,
                        cursor: lockoutRemaining > 0 ? 'not-allowed' : 'pointer',
                      }}
                    >
                      {verifyingOtp ? 'Verifying...' : 'Verify Phone Code'}
                    </button>
                  </div>
                </div>
              )}

              {/* Verified Badge */}
              {otpVerified && (
                <div style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '0.5rem',
                  color: '#16A34A',
                  fontSize: '0.85rem',
                  fontWeight: 700,
                  marginTop: '0.75rem',
                }}>
                  <CheckCircle2 size={18} />
                  <span>Phone Number Verified via OTP! Proceed with address.</span>
                </div>
              )}
            </div>

            {/* Email (Optional) */}
            <div>
              <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 600, marginBottom: '0.4rem' }}>
                Email Address (Optional - For digital receipt & tracking)
              </label>
              <input
                type="email"
                value={formData.email}
                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                className="form-input"
                placeholder="your.email@example.com"
              />
            </div>

            {/* Delivery Address */}
            <div>
              <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 600, marginBottom: '0.4rem' }}>
                Delivery Street Address *
              </label>
              <textarea
                required
                rows={2}
                value={formData.address}
                onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                className="form-input"
                placeholder="House / Flat / Shop #, Street, Sector or Area"
              />
            </div>

            {/* City with Quick Select & Autocomplete */}
            <div>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '0.4rem' }}>
                <label style={{ fontSize: '0.85rem', fontWeight: 700, color: '#111111' }}>
                  City *
                </label>
                <span style={{ fontSize: '0.72rem', color: '#666666' }}>
                  Select or type your city
                </span>
              </div>
              <input
                type="text"
                required
                list="pakistan-cities"
                value={formData.city}
                onChange={(e) => setFormData({ ...formData, city: e.target.value })}
                className="form-input"
                placeholder="e.g. Lahore, Karachi, Islamabad..."
                style={{ width: '100%' }}
              />
              <datalist id="pakistan-cities">
                <option value="Lahore" />
                <option value="Karachi" />
                <option value="Islamabad" />
                <option value="Rawalpindi" />
                <option value="Faisalabad" />
                <option value="Multan" />
                <option value="Peshawar" />
                <option value="Sialkot" />
                <option value="Gujranwala" />
                <option value="Quetta" />
                <option value="Hyderabad" />
                <option value="Bahawalpur" />
                <option value="Sargodha" />
                <option value="Abbottabad" />
                <option value="Mirpur" />
              </datalist>

              {/* Quick Pakistani City Select Pills */}
              <div style={{ display: 'flex', gap: '0.35rem', flexWrap: 'wrap', marginTop: '0.45rem' }}>
                {['Lahore', 'Karachi', 'Islamabad', 'Rawalpindi', 'Faisalabad', 'Multan', 'Peshawar', 'Sialkot'].map((c) => (
                  <button
                    key={c}
                    type="button"
                    onClick={() => setFormData({ ...formData, city: c })}
                    style={{
                      background: formData.city?.toLowerCase() === c.toLowerCase() ? '#111111' : '#F7F7F8',
                      color: formData.city?.toLowerCase() === c.toLowerCase() ? '#FFFFFF' : '#333333',
                      border: formData.city?.toLowerCase() === c.toLowerCase() ? '1px solid #111111' : '1px solid #E5E7EB',
                      borderRadius: '4px',
                      padding: '0.22rem 0.55rem',
                      fontSize: '0.72rem',
                      fontWeight: 600,
                      cursor: 'pointer',
                      transition: 'all 0.15s ease',
                    }}
                  >
                    {c}
                  </button>
                ))}
              </div>

              {/* Dynamic Delivery Time & Logistics Badge */}
              {formData.city && (
                <div
                  style={{
                    marginTop: '0.65rem',
                    padding: '0.6rem 0.75rem',
                    backgroundColor: ['lahore', 'karachi', 'islamabad'].includes(formData.city.trim().toLowerCase())
                      ? '#F0FDF4'
                      : '#F8FAFC',
                    border: ['lahore', 'karachi', 'islamabad'].includes(formData.city.trim().toLowerCase())
                      ? '1px solid #BBF7D0'
                      : '1px solid #E2E8F0',
                    borderRadius: '6px',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '0.5rem',
                    fontSize: '0.78rem',
                    color: ['lahore', 'karachi', 'islamabad'].includes(formData.city.trim().toLowerCase())
                      ? '#166534'
                      : '#334155',
                    animation: 'slideUpQuick 0.2s ease-out',
                  }}
                >
                  {['lahore', 'karachi', 'islamabad'].includes(formData.city.trim().toLowerCase()) ? (
                    <>
                      <Zap size={14} color="#16A34A" />
                      <span>
                        <strong>Express City Delivery:</strong> Same/Next-day dispatch via dedicated courier to <strong>{formData.city}</strong>.
                      </span>
                    </>
                  ) : (
                    <>
                      <Truck size={14} color="#E35205" />
                      <span>
                        <strong>Nationwide Insured Delivery:</strong> 2-4 business days via TCS / Trax / Leopards with live tracking.
                      </span>
                    </>
                  )}
                </div>
              )}
            </div>

            {/* Payment Method Selector (Pakistani Gateways: COD, JazzCash, Easypaisa, PayFast) */}
            <div>
              <label style={{ display: 'block', fontSize: '0.88rem', fontWeight: 800, marginBottom: '0.65rem' }}>
                Select Payment Method
              </label>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '0.75rem' }}>
                
                {/* 1. Cash on Delivery */}
                <div
                  onClick={() => setFormData({ ...formData, payment_method: 'cod' })}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '0.75rem',
                    padding: '0.85rem 1rem',
                    borderRadius: 'var(--radius)',
                    border: formData.payment_method === 'cod' ? '2px solid var(--primary-color)' : '1px solid var(--border-color)',
                    backgroundColor: formData.payment_method === 'cod' ? 'var(--surface)' : 'transparent',
                    cursor: 'pointer',
                    transition: 'all 0.15s ease',
                  }}
                >
                  <div style={{
                    width: '38px',
                    height: '38px',
                    borderRadius: '8px',
                    backgroundColor: '#ECFDF5',
                    color: '#059669',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    flexShrink: 0,
                  }}>
                    <Banknote size={20} />
                  </div>
                  <div>
                    <div style={{ fontWeight: 800, fontSize: '0.88rem', color: 'var(--text-main)' }}>Cash on Delivery</div>
                    <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)' }}>Pay at your doorstep</div>
                  </div>
                </div>

                {/* 2. JazzCash */}
                <div
                  onClick={() => setFormData({ ...formData, payment_method: 'jazzcash' })}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '0.75rem',
                    padding: '0.85rem 1rem',
                    borderRadius: 'var(--radius)',
                    border: formData.payment_method === 'jazzcash' ? '2px solid #ED1C24' : '1px solid var(--border-color)',
                    backgroundColor: formData.payment_method === 'jazzcash' ? 'rgba(237, 28, 36, 0.05)' : 'transparent',
                    cursor: 'pointer',
                    transition: 'all 0.15s ease',
                  }}
                >
                  <div style={{
                    width: '38px',
                    height: '38px',
                    borderRadius: '8px',
                    backgroundColor: '#ED1C24',
                    color: '#ffffff',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    fontWeight: 900,
                    fontSize: '0.85rem',
                    flexShrink: 0,
                  }}>
                    JC
                  </div>
                  <div>
                    <div style={{ fontWeight: 800, fontSize: '0.88rem', color: 'var(--text-main)' }}>JazzCash</div>
                    <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)' }}>Mobile Account / MPIN</div>
                  </div>
                </div>

                {/* 3. Easypaisa */}
                <div
                  onClick={() => setFormData({ ...formData, payment_method: 'easypaisa' })}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '0.75rem',
                    padding: '0.85rem 1rem',
                    borderRadius: 'var(--radius)',
                    border: formData.payment_method === 'easypaisa' ? '2px solid #00A651' : '1px solid var(--border-color)',
                    backgroundColor: formData.payment_method === 'easypaisa' ? 'rgba(0, 166, 81, 0.05)' : 'transparent',
                    cursor: 'pointer',
                    transition: 'all 0.15s ease',
                  }}
                >
                  <div style={{
                    width: '38px',
                    height: '38px',
                    borderRadius: '8px',
                    backgroundColor: '#00A651',
                    color: '#ffffff',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    fontWeight: 900,
                    fontSize: '0.85rem',
                    flexShrink: 0,
                  }}>
                    EP
                  </div>
                  <div>
                    <div style={{ fontWeight: 800, fontSize: '0.88rem', color: 'var(--text-main)' }}>Easypaisa</div>
                    <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)' }}>Wallet / In-App PIN</div>
                  </div>
                </div>

                {/* 4. PayFast / 1Link Cards */}
                <div
                  onClick={() => setFormData({ ...formData, payment_method: 'payfast' })}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '0.75rem',
                    padding: '0.85rem 1rem',
                    borderRadius: 'var(--radius)',
                    border: formData.payment_method === 'payfast' ? '2px solid #0054A6' : '1px solid var(--border-color)',
                    backgroundColor: formData.payment_method === 'payfast' ? 'rgba(0, 84, 166, 0.05)' : 'transparent',
                    cursor: 'pointer',
                    transition: 'all 0.15s ease',
                  }}
                >
                  <div style={{
                    width: '38px',
                    height: '38px',
                    borderRadius: '8px',
                    backgroundColor: '#0054A6',
                    color: '#ffffff',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    flexShrink: 0,
                  }}>
                    <Building size={18} />
                  </div>
                  <div>
                    <div style={{ fontWeight: 800, fontSize: '0.88rem', color: 'var(--text-main)' }}>PayFast / 1Link</div>
                    <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)' }}>All Bank Cards (PayPak/Visa)</div>
                  </div>
                </div>

                {/* 5. Safepay Gateway */}
                <div
                  onClick={() => setFormData({ ...formData, payment_method: 'safepay' })}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '0.75rem',
                    padding: '0.85rem 1rem',
                    borderRadius: 'var(--radius)',
                    border: formData.payment_method === 'safepay' ? '2px solid #5B21B6' : '1px solid var(--border-color)',
                    backgroundColor: formData.payment_method === 'safepay' ? 'rgba(91, 33, 182, 0.05)' : 'transparent',
                    cursor: 'pointer',
                    transition: 'all 0.15s ease',
                  }}
                >
                  <div style={{
                    width: '38px',
                    height: '38px',
                    borderRadius: '8px',
                    backgroundColor: '#5B21B6',
                    color: '#ffffff',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    fontWeight: 900,
                    fontSize: '0.85rem',
                    flexShrink: 0,
                  }}>
                    SP
                  </div>
                  <div>
                    <div style={{ fontWeight: 800, fontSize: '0.88rem', color: 'var(--text-main)', display: 'flex', alignItems: 'center', gap: '0.35rem' }}>
                      Safepay
                      <span style={{ fontSize: '0.62rem', backgroundColor: '#EDE9FE', color: '#5B21B6', padding: '0.1rem 0.35rem', borderRadius: '4px', fontWeight: 800 }}>LIVE KEY</span>
                    </div>
                    <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)' }}>Debit/Credit & Wallets</div>
                  </div>
                </div>
              </div>

              {/* Dynamic Account Input for Mobile Wallets (JazzCash / Easypaisa) */}
              {(formData.payment_method === 'jazzcash' || formData.payment_method === 'easypaisa') && (
                <div style={{
                  marginTop: '0.9rem',
                  padding: '1rem',
                  borderRadius: 'var(--radius)',
                  backgroundColor: 'var(--surface)',
                  border: '1px solid var(--border-color)',
                }}>
                  <label style={{ display: 'block', fontSize: '0.82rem', fontWeight: 700, marginBottom: '0.35rem' }}>
                    {formData.payment_method === 'jazzcash' ? 'JazzCash' : 'Easypaisa'} Mobile Account Number *
                  </label>
                  <div style={{ display: 'flex', gap: '0.5rem', alignItems: 'center' }}>
                    <Smartphone size={18} style={{ color: formData.payment_method === 'jazzcash' ? '#ED1C24' : '#00A651' }} />
                    <input
                      type="text"
                      required
                      value={formData.wallet_number}
                      onChange={(e) => setFormData({ ...formData, wallet_number: e.target.value })}
                      className="form-input"
                      placeholder="03XXXXXXXXX (e.g. 03001234567)"
                      style={{ flexGrow: 1 }}
                    />
                  </div>
                  <p style={{ fontSize: '0.74rem', color: 'var(--text-muted)', marginTop: '0.4rem', margin: 0, display: 'flex', alignItems: 'center', gap: '0.35rem' }}>
                    <Info size={13} style={{ flexShrink: 0 }} />
                    <span>You will receive an instant payment authorization prompt on your mobile device to complete payment.</span>
                  </p>
                </div>
              )}
            </div>

            {/* Notes */}
            <div>
              <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 600, marginBottom: '0.4rem' }}>
                Delivery Instructions (Optional)
              </label>
              <input
                type="text"
                value={formData.notes}
                onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                className="form-input"
                placeholder="e.g. Leave with concierge or call upon arrival"
              />
            </div>

            {/* Stock Exceeded Advisory Banner */}
            {cartItems.some((item) => item.quantity > (typeof item.stock === 'number' ? item.stock : 99)) && (
              <div style={{
                backgroundColor: '#fff1f2',
                border: '1px solid #fecdd3',
                color: '#be123c',
                padding: '0.75rem 1rem',
                borderRadius: '8px',
                fontSize: '0.84rem',
                fontWeight: 700,
                marginTop: '1rem',
                lineHeight: 1.4,
                display: 'flex',
                alignItems: 'center',
                gap: '0.5rem',
              }}>
                <AlertCircle size={16} style={{ flexShrink: 0 }} />
                <span>One or more items in your bag exceed available inventory. Please adjust quantities to proceed.</span>
              </div>
            )}

            {/* Complete Order Button */}
            <button
              type="submit"
              disabled={submittingOrder || cartItems.some((item) => item.quantity > (typeof item.stock === 'number' ? item.stock : 99))}
              className="btn-primary"
              style={{
                width: '100%',
                padding: '1rem',
                fontSize: '1rem',
                fontWeight: 800,
                marginTop: '1rem',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '0.5rem',
                opacity: cartItems.some((item) => item.quantity > (typeof item.stock === 'number' ? item.stock : 99)) ? 0.5 : 1,
                cursor: cartItems.some((item) => item.quantity > (typeof item.stock === 'number' ? item.stock : 99)) ? 'not-allowed' : 'pointer',
              }}
            >
              {submittingOrder ? (
                <span>Connecting to Gateway...</span>
              ) : formData.payment_method === 'cod' ? (
                <>
                  <span>Place Order ({formatPrice(finalPayable)})</span>
                  <ArrowRight size={18} />
                </>
              ) : (
                <>
                  <span>Pay with {formData.payment_method === 'jazzcash' ? 'JazzCash' : formData.payment_method === 'easypaisa' ? 'Easypaisa' : 'PayFast'} ({formatPrice(finalPayable)})</span>
                  <ArrowRight size={18} />
                </>
              )}
            </button>
          </form>
        </div>

        {/* Right: Order Summary Sidebar */}
        <div style={{
          backgroundColor: 'var(--card-bg)',
          border: '1px solid var(--border-color)',
          borderRadius: 'var(--radius)',
          padding: '2rem',
          position: 'sticky',
          top: '90px',
          boxShadow: 'var(--shadow-card)',
        }}>
          <h3 style={{ fontSize: '1.25rem', fontWeight: 800, marginBottom: '1.25rem', letterSpacing: '-0.01em' }}>
            Order Summary
          </h3>

          {/* Items */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem', maxHeight: '300px', overflowY: 'auto', marginBottom: '1.25rem' }}>
            {cartItems.map((item) => (
              <div key={item.cartItemId} style={{ display: 'flex', gap: '0.85rem', alignItems: 'center' }}>
                <img
                  src={item.image}
                  alt={item.name}
                  style={{ width: '54px', height: '64px', objectFit: 'cover', borderRadius: '6px', flexShrink: 0 }}
                />
                <div style={{ flexGrow: 1 }}>
                  <h4 style={{ fontSize: '0.85rem', fontWeight: 600, color: 'var(--text-main)', lineHeight: 1.25 }}>
                    {item.name}
                  </h4>
                  <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                    Qty: {item.quantity} {item.selected_attributes?.size ? `· Size: ${item.selected_attributes.size}` : ''} {item.selected_attributes?.material ? `· ${item.selected_attributes.material}` : ''}
                  </div>
                  {item.quantity > (typeof item.stock === 'number' ? item.stock : 99) && (
                    <div style={{ fontSize: '0.7rem', color: '#be123c', fontWeight: 700, marginTop: '0.2rem' }}>
                      ⚠️ Exceeds stock ({item.stock ?? 0} left in stock)
                    </div>
                  )}
                </div>
                <div style={{ fontSize: '0.88rem', fontWeight: 700 }}>
                  {formatPrice(item.price * item.quantity)}
                </div>
              </div>
            ))}
          </div>

          {/* Coupon Code Section */}
          <div style={{ borderTop: '1px solid var(--border-color)', paddingTop: '1.25rem', marginBottom: '1.25rem' }}>
            {appliedCoupon ? (
              <div style={{
                backgroundColor: 'rgba(22, 163, 74, 0.08)',
                border: '1px solid #86EFAC',
                borderRadius: '8px',
                padding: '0.75rem 1rem',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
              }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                  <Tag size={15} style={{ color: '#16A34A' }} />
                  <div>
                    <div style={{ fontSize: '0.84rem', fontWeight: 800, color: '#15803D' }}>{appliedCoupon.code}</div>
                    <div style={{ fontSize: '0.72rem', color: '#166534' }}>{appliedCoupon.label}</div>
                  </div>
                </div>
                <button
                  type="button"
                  onClick={handleRemoveCoupon}
                  style={{ background: 'none', border: 'none', color: '#DC2626', fontSize: '0.78rem', fontWeight: 700, cursor: 'pointer' }}
                >
                  Remove
                </button>
              </div>
            ) : (
              <form onSubmit={handleApplyCoupon} style={{ display: 'flex', gap: '0.5rem' }}>
                <input
                  type="text"
                  placeholder="Promo Code (try FLEXI10)"
                  value={couponCode}
                  onChange={(e) => setCouponCode(e.target.value.toUpperCase())}
                  className="form-input"
                  style={{ flex: 1, fontSize: '0.82rem', padding: '0.5rem 0.75rem' }}
                />
                <button
                  type="submit"
                  style={{
                    backgroundColor: 'var(--surface)',
                    border: '1px solid var(--border-color)',
                    color: 'var(--text-main)',
                    borderRadius: 'var(--radius)',
                    padding: '0.5rem 0.95rem',
                    fontSize: '0.8rem',
                    fontWeight: 700,
                    cursor: 'pointer',
                  }}
                >
                  Apply
                </button>
              </form>
            )}

            {couponSuccess && (
              <p style={{ color: '#16A34A', fontSize: '0.78rem', marginTop: '0.4rem', fontWeight: 600 }}>{couponSuccess}</p>
            )}
            {couponError && (
              <p style={{ color: '#DC2626', fontSize: '0.78rem', marginTop: '0.4rem' }}>{couponError}</p>
            )}
          </div>

          {/* Pricing Totals */}
          <div style={{
            borderTop: '1px solid var(--border-color)',
            paddingTop: '1rem',
            display: 'flex',
            flexDirection: 'column',
            gap: '0.6rem',
            fontSize: '0.88rem',
          }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', color: 'var(--text-muted)' }}>
              <span>Items Subtotal</span>
              <span>{formatPrice(subtotal)}</span>
            </div>

            {appliedCoupon && (
              <div style={{ display: 'flex', justifyContent: 'space-between', color: '#16A34A', fontWeight: 600 }}>
                <span>Coupon Discount ({appliedCoupon.code})</span>
                <span>-{formatPrice(discountAmount)}</span>
              </div>
            )}

            <div style={{ display: 'flex', justifyContent: 'space-between', color: 'var(--text-muted)' }}>
              <span>Insured Express Shipping</span>
              <span style={{ color: '#16A34A', fontWeight: 700 }}>FREE</span>
            </div>

            {/* Estimated Delivery Date */}
            <div style={{
              display: 'flex',
              alignItems: 'center',
              gap: '0.4rem',
              fontSize: '0.76rem',
              color: 'var(--text-muted)',
              backgroundColor: 'var(--surface)',
              padding: '0.45rem 0.75rem',
              borderRadius: '6px',
            }}>
              <Truck size={14} style={{ color: 'var(--primary-color)' }} />
              <span>Est. Delivery: <strong>{getDeliveryEstimate()}</strong></span>
            </div>

            <div style={{
              display: 'flex',
              justifyContent: 'space-between',
              fontSize: '1.25rem',
              fontWeight: 800,
              borderTop: '1px solid var(--border-color)',
              paddingTop: '0.85rem',
              marginTop: '0.25rem',
              color: storeType === 'jewelry' ? '#FFD700' : 'var(--primary-color)',
            }}>
              <span>Total Payable</span>
              <span>{formatPrice(finalPayable)}</span>
            </div>
          </div>

          {/* Guarantee Badges */}
          <div style={{
            marginTop: '1.75rem',
            paddingTop: '1.25rem',
            borderTop: '1px solid var(--border-color)',
            display: 'grid',
            gridTemplateColumns: '1fr 1fr',
            gap: '0.75rem',
          }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.45rem', fontSize: '0.74rem', color: 'var(--text-muted)' }}>
              <ShieldCheck size={16} style={{ color: '#16A34A', flexShrink: 0 }} />
              <span>256-Bit SSL Encrypted</span>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.45rem', fontSize: '0.74rem', color: 'var(--text-muted)' }}>
              <CheckCircle2 size={16} style={{ color: '#16A34A', flexShrink: 0 }} />
              <span>PCI-DSS Level 1 Security</span>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.45rem', fontSize: '0.74rem', color: 'var(--text-muted)' }}>
              <Phone size={16} style={{ color: 'var(--primary-color)', flexShrink: 0 }} />
              <span>Anti-Fraud SMS Shield</span>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.45rem', fontSize: '0.74rem', color: 'var(--text-muted)' }}>
              <RotateCcw size={16} style={{ color: 'var(--primary-color)', flexShrink: 0 }} />
              <span>14-Day Free Exchange</span>
            </div>
          </div>
        </div>
      </div>

      {/* Online Gateway Authorization Modal (JazzCash / Easypaisa / PayFast) */}
      {showPaymentModal && paymentSession && (
        <div style={{
          position: 'fixed',
          inset: 0,
          backgroundColor: 'rgba(0,0,0,0.7)',
          backdropFilter: 'blur(5px)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          zIndex: 1000,
          padding: '1rem',
        }}>
          <div style={{
            backgroundColor: 'var(--card-bg)',
            borderRadius: '16px',
            border: '1px solid var(--border-color)',
            width: '100%',
            maxWidth: '460px',
            overflow: 'hidden',
            boxShadow: '0 25px 50px rgba(0,0,0,0.25)',
          }} className="animate-fade-in">
            
            {/* Modal Header */}
            <div style={{
              backgroundColor: activeGateway === 'jazzcash' ? '#ED1C24' : activeGateway === 'easypaisa' ? '#00A651' : '#0054A6',
              color: '#ffffff',
              padding: '1.25rem 1.5rem',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
            }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                <div style={{
                  backgroundColor: '#ffffff',
                  color: activeGateway === 'jazzcash' ? '#ED1C24' : activeGateway === 'easypaisa' ? '#00A651' : '#0054A6',
                  padding: '0.3rem 0.65rem',
                  borderRadius: '6px',
                  fontWeight: 900,
                  fontSize: '0.9rem',
                }}>
                  {activeGateway === 'jazzcash' ? 'JazzCash' : activeGateway === 'easypaisa' ? 'Easypaisa' : 'PayFast'}
                </div>
                <div>
                  <div style={{ fontWeight: 800, fontSize: '1rem' }}>
                    Secure Payment Authorization
                  </div>
                  <div style={{ fontSize: '0.74rem', opacity: 0.9 }}>
                    Merchant ID: {paymentSession.session?.fields?.pp_MerchantID || paymentSession.session?.fields?.storeId || paymentSession.session?.fields?.merchant_id || 'Active'}
                  </div>
                </div>
              </div>

              <button
                onClick={() => setShowPaymentModal(false)}
                style={{ background: 'transparent', border: 'none', color: '#fff', cursor: 'pointer' }}
              >
                <X size={20} />
              </button>
            </div>

            {/* Modal Body */}
            <div style={{ padding: '1.75rem', display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
              
              {/* Payment Amount Card */}
              <div style={{
                backgroundColor: 'var(--surface)',
                borderRadius: '12px',
                padding: '1rem 1.25rem',
                border: '1px solid var(--border-color)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
              }}>
                <div>
                  <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', fontWeight: 600 }}>Amount Due</div>
                  <div style={{ fontSize: '1.4rem', fontWeight: 900, color: 'var(--text-main)' }}>
                    {formatPrice(finalPayable)}
                  </div>
                </div>
                <div style={{ textAlign: 'right' }}>
                  <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)' }}>Session Expiry</div>
                  <div style={{ fontSize: '0.88rem', fontWeight: 800, color: paymentCountdown < 15 ? '#DC2626' : 'var(--primary-color)' }}>
                    00:{paymentCountdown < 10 ? `0${paymentCountdown}` : paymentCountdown}s
                  </div>
                </div>
              </div>

              {/* Gateway-Specific Instructions */}
              {activeGateway === 'safepay' ? (
                /* Safepay Official Connected Portal */
                <div style={{
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: 'center',
                  textAlign: 'center',
                  padding: '1.25rem 1rem',
                  backgroundColor: 'rgba(91, 33, 182, 0.04)',
                  borderRadius: '12px',
                  border: '1.5px solid rgba(91, 33, 182, 0.25)',
                }}>
                  <div style={{
                    width: '56px',
                    height: '56px',
                    borderRadius: '50%',
                    backgroundColor: '#5B21B6',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    color: '#ffffff',
                    fontWeight: 900,
                    fontSize: '1.25rem',
                    boxShadow: '0 8px 18px rgba(91, 33, 182, 0.25)',
                    marginBottom: '0.75rem',
                  }}>
                    SP
                  </div>

                  <h3 style={{ margin: '0 0 0.35rem 0', fontSize: '1.15rem', fontWeight: 800, color: 'var(--text-main)' }}>
                    Safepay Gateway Ready
                  </h3>

                  <p style={{ margin: '0 0 0.85rem 0', fontSize: '0.84rem', color: 'var(--text-muted)', lineHeight: 1.45, maxWidth: '340px' }}>
                    Authenticated with your Live Merchant Key (<code style={{ fontSize: '0.74rem', backgroundColor: '#EDE9FE', padding: '0.15rem 0.35rem', borderRadius: '4px', color: '#5B21B6' }}>sec_c724...</code>).
                  </p>

                  <div style={{
                    width: '100%',
                    padding: '0.75rem 1rem',
                    backgroundColor: 'rgba(255, 255, 255, 0.9)',
                    borderRadius: '8px',
                    border: '1px solid rgba(0,0,0,0.06)',
                    fontSize: '0.8rem',
                    textAlign: 'left',
                    marginBottom: '0.85rem',
                    lineHeight: 1.45,
                  }}>
                    <div><strong>Session Tracker:</strong> <span style={{ fontFamily: 'monospace', fontSize: '0.78rem' }}>{paymentSession?.transaction_id || 'Initializing...'}</span></div>
                    <div style={{ color: 'var(--text-muted)', fontSize: '0.72rem', marginTop: '0.25rem' }}>
                      Accepts Debit/Credit Cards (PayPak/Visa/Mastercard) and Mobile Wallets.
                    </div>
                  </div>

                  {paymentSession?.session?.checkout_url && (
                    <a
                      href={paymentSession.session.checkout_url}
                      target="_blank"
                      rel="noopener noreferrer"
                      style={{
                        display: 'inline-flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        gap: '0.5rem',
                        width: '100%',
                        padding: '0.8rem',
                        backgroundColor: '#5B21B6',
                        color: '#ffffff',
                        borderRadius: '8px',
                        fontWeight: 800,
                        fontSize: '0.88rem',
                        textDecoration: 'none',
                        marginBottom: '0.5rem',
                        boxShadow: '0 4px 12px rgba(91, 33, 182, 0.25)',
                      }}
                    >
                      <ExternalLink size={15} />
                      <span>Open Official Safepay Checkout Portal</span>
                    </a>
                  )}
                </div>
              ) : (activeGateway === 'jazzcash' || activeGateway === 'easypaisa') ? (
                <div style={{
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: 'center',
                  textAlign: 'center',
                  padding: '1.25rem 1rem',
                  backgroundColor: activeGateway === 'jazzcash' ? 'rgba(237, 28, 36, 0.04)' : 'rgba(0, 166, 81, 0.04)',
                  borderRadius: '12px',
                  border: `1.5px solid ${activeGateway === 'jazzcash' ? 'rgba(237, 28, 36, 0.2)' : 'rgba(0, 166, 81, 0.2)'}`,
                }}>
                  {/* Pulsing Phone Indicator */}
                  <div style={{ position: 'relative', marginBottom: '0.85rem' }}>
                    <div style={{
                      width: '58px',
                      height: '58px',
                      borderRadius: '50%',
                      backgroundColor: activeGateway === 'jazzcash' ? '#ED1C24' : '#00A651',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      color: '#ffffff',
                      boxShadow: '0 8px 18px rgba(0,0,0,0.12)',
                    }}>
                      <Smartphone size={28} />
                    </div>
                    <span style={{
                      position: 'absolute',
                      top: 0,
                      right: 0,
                      width: '14px',
                      height: '14px',
                      borderRadius: '50%',
                      backgroundColor: '#22C55E',
                      border: '2px solid #ffffff',
                    }} />
                  </div>

                  <h3 style={{ margin: '0 0 0.4rem 0', fontSize: '1.1rem', fontWeight: 800 }}>
                    Approve on Your Mobile Phone
                  </h3>

                  <p style={{ margin: '0 0 0.85rem 0', fontSize: '0.85rem', color: 'var(--text-muted)', lineHeight: 1.45, maxWidth: '340px' }}>
                    A payment authorization request of <strong style={{ color: 'var(--text-main)' }}>{formatPrice(finalPayable)}</strong> has been pushed to your mobile account:
                  </p>

                  <div style={{
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: '0.5rem',
                    padding: '0.45rem 1rem',
                    backgroundColor: 'var(--surface)',
                    border: '1px solid var(--border-color)',
                    borderRadius: '999px',
                    fontSize: '0.92rem',
                    fontWeight: 800,
                    color: 'var(--text-main)',
                    marginBottom: '0.9rem',
                  }}>
                    <Smartphone size={15} />
                    <span>{formData.wallet_number || formData.phone}</span>
                  </div>

                  {/* Customer Guidance */}
                  <div style={{
                    fontSize: '0.8rem',
                    color: 'var(--text-main)',
                    backgroundColor: 'rgba(255, 255, 255, 0.85)',
                    padding: '0.75rem 0.9rem',
                    borderRadius: '8px',
                    border: '1px solid rgba(0,0,0,0.06)',
                    lineHeight: 1.4,
                    textAlign: 'left',
                    width: '100%',
                    marginBottom: '0.85rem',
                  }}>
                    <div style={{ fontWeight: 700, marginBottom: '0.25rem', color: activeGateway === 'jazzcash' ? '#ED1C24' : '#00A651', display: 'flex', alignItems: 'center', gap: '0.35rem' }}>
                      <Info size={13} />
                      <span>How to complete on your phone:</span>
                    </div>
                    1. Unlock your phone to view the instant pop-up prompt (or open your {activeGateway === 'jazzcash' ? 'JazzCash' : 'Easypaisa'} App).<br/>
                    2. Review the amount (<strong>{formatPrice(finalPayable)}</strong>) and enter your secret MPIN directly on your phone dialer.
                  </div>

                  {/* SBP Regulatory Security Badge */}
                  <div style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '0.4rem',
                    fontSize: '0.72rem',
                    color: '#15803D',
                    fontWeight: 700,
                    backgroundColor: '#F0FDF4',
                    padding: '0.45rem 0.75rem',
                    borderRadius: '6px',
                    border: '1px solid #BBF7D0',
                    width: '100%',
                  }}>
                    <ShieldCheck size={16} />
                    <span style={{ textAlign: 'left' }}>
                      <strong>Bank Security Rule:</strong> KHAAM POSHAK will NEVER ask for your secret MPIN on this website. It is only entered securely on your physical device.
                    </span>
                  </div>
                </div>
              ) : (
                /* PayFast / 1Link Card Form */
                <div>
                  <div style={{
                    padding: '0.85rem',
                    backgroundColor: 'rgba(0, 84, 166, 0.06)',
                    borderRadius: '8px',
                    border: '1px solid #93C5FD',
                    fontSize: '0.82rem',
                    marginBottom: '1rem',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '0.45rem',
                  }}>
                    <CreditCard size={15} style={{ flexShrink: 0 }} />
                    <span>PayFast 1Link: Accepts PayPak, Visa, Mastercard from any Pakistani bank (HBL, Meezan, Alfalah, etc.)</span>
                  </div>

                  <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                    <div>
                      <label style={{ display: 'block', fontSize: '0.78rem', fontWeight: 700, marginBottom: '0.25rem' }}>Card Number</label>
                      <input
                        type="text"
                        value={cardDetails.number}
                        onChange={(e) => setCardDetails({ ...cardDetails, number: e.target.value })}
                        className="form-input"
                        placeholder="•••• •••• •••• ••••"
                      />
                    </div>
                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.5rem' }}>
                      <div>
                        <label style={{ display: 'block', fontSize: '0.78rem', fontWeight: 700, marginBottom: '0.25rem' }}>Expires</label>
                        <input
                          type="text"
                          value={cardDetails.exp}
                          onChange={(e) => setCardDetails({ ...cardDetails, exp: e.target.value })}
                          className="form-input"
                          placeholder="MM/YY"
                        />
                      </div>
                      <div>
                        <label style={{ display: 'block', fontSize: '0.78rem', fontWeight: 700, marginBottom: '0.25rem' }}>CVV</label>
                        <input
                          type="password"
                          value={cardDetails.cvv}
                          onChange={(e) => setCardDetails({ ...cardDetails, cvv: e.target.value })}
                          className="form-input"
                          placeholder="•••"
                        />
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {/* Action Buttons */}
              <div style={{ display: 'flex', gap: '0.75rem', marginTop: '0.5rem' }}>
                <button
                  type="button"
                  onClick={() => setShowPaymentModal(false)}
                  style={{
                    flex: 1,
                    padding: '0.85rem',
                    borderRadius: 'var(--radius)',
                    backgroundColor: 'var(--surface)',
                    color: 'var(--text-main)',
                    border: '1px solid var(--border-color)',
                    fontWeight: 700,
                    fontSize: '0.88rem',
                    cursor: 'pointer',
                  }}
                >
                  Cancel
                </button>

                <button
                  type="button"
                  onClick={handleApproveOnlinePayment}
                  disabled={isVerifyingPayment}
                  style={{
                    flex: 2,
                    padding: '0.85rem',
                    borderRadius: 'var(--radius)',
                    backgroundColor: activeGateway === 'jazzcash' ? '#ED1C24' : activeGateway === 'easypaisa' ? '#00A651' : activeGateway === 'safepay' ? '#5B21B6' : '#0054A6',
                    color: '#ffffff',
                    border: 'none',
                    fontWeight: 800,
                    fontSize: '0.92rem',
                    cursor: 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    gap: '0.5rem',
                    boxShadow: '0 4px 12px rgba(0,0,0,0.12)',
                  }}
                >
                  {isVerifyingPayment ? (
                    <>
                      <RefreshCw size={16} className="animate-spin" />
                      <span>Checking with Bank...</span>
                    </>
                  ) : (
                    <>
                      <CheckCircle2 size={16} />
                      <span>
                        {(activeGateway === 'jazzcash' || activeGateway === 'easypaisa')
                          ? `Simulate Phone Approval (Demo)`
                          : activeGateway === 'safepay'
                          ? `⚡ Instant Sandbox Approval (Dev Test)`
                          : `Pay with Card (${formatPrice(finalPayable)})`}
                      </span>
                    </>
                  )}
                </button>
              </div>

              {/* Security Footnote */}
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.4rem', fontSize: '0.72rem', color: 'var(--text-muted)' }}>
                <ShieldCheck size={14} color="#16A34A" />
                <span>Protected by 256-bit bank encryption and State Bank of Pakistan standards.</span>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
