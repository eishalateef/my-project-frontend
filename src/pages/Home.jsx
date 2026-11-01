import React, { useState, useEffect, useRef } from 'react';
import { useSearchParams } from 'react-router-dom';
import api from '../api/axios';
import { useStore } from '../context/StoreContext';
import ProductCard from '../components/ProductCard';
import SizeChartModal from '../components/SizeChartModal';
import LuxuryCertificateModal from '../components/LuxuryCertificateModal';
import { getImageUrl } from '../utils/imageUrl';
import {
  Sparkles,
  ArrowRight,
  Zap,
  Clock,
  Flame,
  ShieldCheck,
  ChevronLeft,
  ChevronRight,
  TrendingUp,
  Percent,
  Truck,
  RotateCcw,
  Award,
  Check,
  Mail,
  Star,
  Plus,
  Scissors,
  ShoppingBag,
  Heart,
} from 'lucide-react';

export default function Home({ onSelectProduct, onViewCatalog }) {
  const { storeType, store, config, formatPrice, switchStoreType } = useStore();
  const [searchParams, setSearchParams] = useSearchParams();

  const [featuredProducts, setFeaturedProducts] = useState(() => {
    try {
      const cached = sessionStorage.getItem('kp_cached_home_products');
      return cached ? JSON.parse(cached) : [];
    } catch {
      return [];
    }
  });
  const [categories, setCategories] = useState(() => {
    try {
      const cached = sessionStorage.getItem('kp_cached_home_categories');
      return cached ? JSON.parse(cached) : [];
    } catch {
      return [];
    }
  });
  const subCategories = categories.filter((c) => c.parent_id !== null);
  const displayCategories = subCategories.length > 0 ? subCategories : categories;
  const [loading, setLoading] = useState(() => {
    try {
      return !sessionStorage.getItem('kp_cached_home_products');
    } catch {
      return true;
    }
  });
  const [isSizeChartOpen, setIsSizeChartOpen] = useState(false);
  const [isCertOpen, setIsCertOpen] = useState(false);
  const heroVideoRef = useRef(null);

  // Guarantee instant hero video playback on mount (no 0.5s pause, no poster image flash)
  useEffect(() => {
    const video = heroVideoRef.current;
    if (video) {
      video.defaultMuted = true;
      video.muted = true;
      const playVideo = () => {
        const promise = video.play();
        if (promise !== undefined) {
          promise.catch(() => {
            // Browser autoplay policy catch
          });
        }
      };

      if (video.readyState >= 2) {
        playVideo();
      } else {
        video.addEventListener('canplay', playVideo, { once: true });
        video.addEventListener('loadeddata', playVideo, { once: true });
      }
    }
  }, [storeType]);

  // Category filter tab on homepage
  const [activeCategoryTab, setActiveCategoryTab] = useState('all');
  const [newsletterEmail, setNewsletterEmail] = useState('');
  const [newsletterJoined, setNewsletterJoined] = useState(false);
  const [newsletterLoading, setNewsletterLoading] = useState(false);
  const [newsletterMsg, setNewsletterMsg] = useState('');
  const [newsletterError, setNewsletterError] = useState('');

  const handleNewsletterSubmit = async (e) => {
    e.preventDefault();
    const email = newsletterEmail.trim();
    if (!email || newsletterLoading) return;
    setNewsletterLoading(true);
    setNewsletterError('');
    try {
      const res = await api.post('/api/newsletter/subscribe', {
        email,
        source: 'homepage_vip_banner',
      });
      setNewsletterJoined(true);
      setNewsletterMsg(res.data?.message || 'Thank you for subscribing to Khaam Poshak updates!');
      setNewsletterEmail('');
    } catch (err) {
      setNewsletterError(err.response?.data?.message || 'Unable to subscribe. Please verify your email.');
    } finally {
      setNewsletterLoading(false);
    }
  };

  // Flash sale countdown timer state
  const [timeLeft, setTimeLeft] = useState({ hours: 7, minutes: 34, seconds: 28 });

  useEffect(() => {
    const timer = setInterval(() => {
      setTimeLeft((prev) => {
        if (prev.seconds > 0) return { ...prev, seconds: prev.seconds - 1 };
        if (prev.minutes > 0) return { ...prev, minutes: 59, seconds: 59 };
        if (prev.hours > 0) return { ...prev, hours: prev.hours - 1, minutes: 59, seconds: 59 };
        return { hours: 12, minutes: 0, seconds: 0 };
      });
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [prodRes, catRes] = await Promise.all([
          api.get('/api/products?per_page=30'),
          api.get('/api/categories'),
        ]);
        const prods = prodRes.data.data || prodRes.data || [];
        const cats = catRes.data || [];
        setFeaturedProducts(prods);
        setCategories(cats);
        try {
          sessionStorage.setItem('kp_cached_home_products', JSON.stringify(prods));
          sessionStorage.setItem('kp_cached_home_categories', JSON.stringify(cats));
        } catch {}
      } catch (err) {
        console.error('Failed to load homepage data:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [storeType]);

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: storeType === 'clothing' ? '0' : '3rem' }}>
      {/* =========================================================================
          1. HANDMADE LUXURY HERO VIDEO SECTION (KHAAM POSHAK ATELIER)
          ========================================================================= */}
      {storeType === 'clothing' && (
        <section
          style={{
            position: 'relative',
            width: '100%',
            height: 'calc(100vh - 105px)',
            minHeight: '600px',
            maxHeight: '920px',
            overflow: 'hidden',
            backgroundColor: '#111111',
            margin: 0,
          }}
        >
          {/* 1. SINGLE FULL-SCREEN BACKGROUND VIDEO (Direct src + preload="auto" for instant start, no image flash) */}
          <video
            ref={heroVideoRef}
            src="/videos/hero.mp4"
            autoPlay
            loop
            muted
            playsInline
            preload="auto"
            disablePictureInPicture
            style={{
              position: 'absolute',
              inset: 0,
              width: '100%',
              height: '100%',
              objectFit: 'cover',
              objectPosition: 'center',
              display: 'block',
              backgroundColor: '#111111',
            }}
          />

          {/* High-Contrast Dual-Direction Gradient Scrim for optimal readability */}
          <div
            style={{
              position: 'absolute',
              inset: 0,
              background:
                'linear-gradient(to top, rgba(0, 0, 0, 0.88) 0%, rgba(0, 0, 0, 0.45) 45%, rgba(0, 0, 0, 0.25) 100%), linear-gradient(to right, rgba(0, 0, 0, 0.72) 0%, rgba(0, 0, 0, 0.35) 55%, transparent 100%)',
              pointerEvents: 'none',
            }}
          />

          {/* EDITORIAL HERO CONTENT OVERLAY */}
          <div
            style={{
              position: 'absolute',
              bottom: 'clamp(2.5rem, 6vw, 4.5rem)',
              left: 'clamp(1.5rem, 6vw, 4.5rem)',
              right: 'clamp(1.5rem, 6vw, 4.5rem)',
              zIndex: 15,
              maxWidth: '820px',
              display: 'flex',
              flexDirection: 'column',
              gap: '1.25rem',
              animation: 'heroFadeIn 0.8s cubic-bezier(0.16, 1, 0.3, 1)',
            }}
          >
            {/* Eyebrow / Tag: HANDMADE WITH LOVE */}
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.65rem' }}>
              <span
                style={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '0.5rem',
                  backgroundColor: 'rgba(227, 82, 5, 0.16)',
                  backdropFilter: 'blur(12px)',
                  WebkitBackdropFilter: 'blur(12px)',
                  border: '1px solid rgba(253, 186, 116, 0.45)',
                  color: '#FDBA74',
                  fontSize: '0.72rem',
                  fontWeight: 800,
                  letterSpacing: '0.22em',
                  textTransform: 'uppercase',
                  padding: '0.45rem 1.05rem',
                  borderRadius: '999px',
                  boxShadow: '0 4px 18px rgba(0, 0, 0, 0.25)',
                }}
              >
                <Sparkles size={12} color="#FDBA74" />
                <span>HANDMADE WITH LOVE</span>
              </span>
            </div>

            {/* Heading: Crafted by Hand, Made with Heart. */}
            <h1
              style={{
                fontSize: 'clamp(2.5rem, 5.2vw, 4.4rem)',
                fontWeight: 400,
                letterSpacing: '-0.01em',
                lineHeight: 1.1,
                color: '#FFFFFF',
                margin: 0,
                fontFamily: "'Cormorant Garamond', 'Playfair Display', Georgia, serif",
                textShadow: '0 4px 25px rgba(0, 0, 0, 0.7)',
              }}
            >
              Crafted by Hand,{' '}
              <span
                style={{
                  display: 'inline-block',
                  fontStyle: 'italic',
                  fontWeight: 600,
                  color: '#FDBA74',
                  letterSpacing: '0.01em',
                }}
              >
                Made with Heart.
              </span>
            </h1>

            {/* Subtitle: Discover thoughtfully handmade treasures, created by skilled artisans and inspired by tradition. */}
            <p
              style={{
                fontSize: 'clamp(0.95rem, 1.4vw, 1.15rem)',
                color: 'rgba(255, 255, 255, 0.88)',
                lineHeight: 1.7,
                margin: 0,
                maxWidth: '560px',
                letterSpacing: '0.015em',
                fontFamily: "'Plus Jakarta Sans', sans-serif",
                fontWeight: 400,
                textShadow: '0 2px 12px rgba(0, 0, 0, 0.6)',
              }}
            >
              Discover thoughtfully handmade treasures, created by skilled artisans and inspired by tradition.
            </p>

            {/* 1 Button: Shop Handmade -> */}
            <div style={{ marginTop: '0.65rem' }}>
              <button
                onClick={() => onViewCatalog({ categorySlug: 'all-handmade' })}
                style={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '0.85rem',
                  backgroundColor: '#FFFFFF',
                  color: '#111111',
                  padding: '0.95rem 2.25rem',
                  borderRadius: '4px',
                  fontSize: '0.82rem',
                  fontWeight: 800,
                  letterSpacing: '0.14em',
                  textTransform: 'uppercase',
                  border: '1px solid #FFFFFF',
                  cursor: 'pointer',
                  boxShadow: '0 10px 28px rgba(0, 0, 0, 0.35)',
                  transition: 'all 0.25s cubic-bezier(0.16, 1, 0.3, 1)',
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.backgroundColor = '#E35205';
                  e.currentTarget.style.borderColor = '#E35205';
                  e.currentTarget.style.color = '#FFFFFF';
                  e.currentTarget.style.transform = 'translateY(-2px)';
                  e.currentTarget.style.boxShadow = '0 12px 30px rgba(227, 82, 5, 0.45)';
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.backgroundColor = '#FFFFFF';
                  e.currentTarget.style.borderColor = '#FFFFFF';
                  e.currentTarget.style.color = '#111111';
                  e.currentTarget.style.transform = 'translateY(0)';
                  e.currentTarget.style.boxShadow = '0 10px 28px rgba(0, 0, 0, 0.35)';
                }}
              >
                <span>Shop Handmade</span>
                <ArrowRight size={16} />
              </button>
            </div>
          </div>
        </section>
      )}

      {/* =========================================================================
          THE ART OF HANDMADE (دستکاری اور دستکاری کا ہنر - KHAAM POSHAK ATELIER)
          ========================================================================= */}
      {storeType === 'clothing' && (
        <section
          style={{
            maxWidth: '1360px',
            margin: '3rem auto 0',
            padding: '0 1.5rem',
            width: '100%',
          }}
        >
          <div
            style={{
              backgroundColor: '#FAF9F6',
              border: '1px solid #ECE7DE',
              borderRadius: '6px',
              padding: '2.5rem 2rem',
              display: 'flex',
              flexDirection: 'column',
              gap: '2rem',
              position: 'relative',
              overflow: 'hidden',
            }}
          >
            {/* Top Header Row with Urdu Calligraphy & Atelier Badge */}
            <div
              style={{
                display: 'flex',
                flexWrap: 'wrap',
                alignItems: 'center',
                justifyContent: 'space-between',
                gap: '1rem',
                borderBottom: '1px solid #E5DFD3',
                paddingBottom: '1.5rem',
              }}
            >
              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.35rem' }}>
                <div
                  style={{
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: '0.45rem',
                    color: '#E35205',
                    fontSize: '0.72rem',
                    fontWeight: 800,
                    textTransform: 'uppercase',
                    letterSpacing: '0.16em',
                  }}
                >
                  <Sparkles size={13} color="#E35205" />
                  <span>The Artisanal Commitment</span>
                </div>
                <h2
                  style={{
                    fontSize: 'clamp(1.4rem, 2.4vw, 1.95rem)',
                    fontWeight: 800,
                    letterSpacing: '0.06em',
                    textTransform: 'uppercase',
                    color: '#111111',
                    fontFamily: "'Cinzel', 'Playfair Display', serif",
                    margin: 0,
                  }}
                >
                  The Art of Handmade Designs
                </h2>
              </div>

              {/* Urdu Nastaliq Banner */}
              <div
                style={{
                  fontFamily: "'Noto Nastaliq Urdu', 'Urdu Typesetting', serif",
                  fontSize: '1.35rem',
                  fontWeight: 700,
                  color: '#C2410C',
                  direction: 'rtl',
                  lineHeight: 1.3,
                  backgroundColor: 'rgba(227, 82, 5, 0.08)',
                  padding: '0.45rem 1.25rem',
                  borderRadius: '999px',
                  border: '1px solid rgba(227, 82, 5, 0.2)',
                }}
              >
                خالص روایتی دستکاری • خام پوشاک
              </div>
            </div>

            {/* 4 Pillars of Craftsmanship Grid Tailored to Khaam Poshak */}
            <div
              style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))',
                gap: '1.5rem',
              }}
            >
              {/* Card 1: Crochet & Fabric Bags */}
              <div
                style={{
                  backgroundColor: '#FFFFFF',
                  padding: '1.5rem',
                  borderRadius: '4px',
                  border: '1px solid #EFEAE1',
                  boxShadow: '0 2px 10px rgba(0, 0, 0, 0.03)',
                  display: 'flex',
                  flexDirection: 'column',
                  gap: '0.75rem',
                  transition: 'all 0.25s ease',
                }}
              >
                <div
                  style={{
                    width: '42px',
                    height: '42px',
                    borderRadius: '50%',
                    backgroundColor: 'rgba(227, 82, 5, 0.1)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    color: '#E35205',
                  }}
                >
                  <ShoppingBag size={22} />
                </div>
                <h3
                  style={{
                    fontSize: '0.98rem',
                    fontWeight: 800,
                    textTransform: 'uppercase',
                    letterSpacing: '0.06em',
                    color: '#111111',
                    margin: 0,
                    fontFamily: "'Plus Jakarta Sans', sans-serif",
                  }}
                >
                  Crochet & Fabric Bags
                </h3>
                <p style={{ fontSize: '0.82rem', color: '#666666', lineHeight: 1.6, margin: 0 }}>
                  Hand-looped artisanal crochet totes, mini shoulder bags, embroidered potlis, and premium fabric bags handcrafted for everyday statement elegance.
                </p>
                <div style={{ fontSize: '0.74rem', fontWeight: 700, color: '#C2410C', textTransform: 'uppercase', letterSpacing: '0.08em', fontFamily: "'Noto Nastaliq Urdu', serif" }}>
                  دستکاری کروشیا اور فیبرک بیگز
                </div>
              </div>

              {/* Card 2: Handmade Jewellery */}
              <div
                style={{
                  backgroundColor: '#FFFFFF',
                  padding: '1.5rem',
                  borderRadius: '4px',
                  border: '1px solid #EFEAE1',
                  boxShadow: '0 2px 10px rgba(0, 0, 0, 0.03)',
                  display: 'flex',
                  flexDirection: 'column',
                  gap: '0.75rem',
                  transition: 'all 0.25s ease',
                }}
              >
                <div
                  style={{
                    width: '42px',
                    height: '42px',
                    borderRadius: '50%',
                    backgroundColor: 'rgba(227, 82, 5, 0.1)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    color: '#E35205',
                  }}
                >
                  <Sparkles size={22} />
                </div>
                <h3
                  style={{
                    fontSize: '0.98rem',
                    fontWeight: 800,
                    textTransform: 'uppercase',
                    letterSpacing: '0.06em',
                    color: '#111111',
                    margin: 0,
                    fontFamily: "'Plus Jakarta Sans', sans-serif",
                  }}
                >
                  Handmade Jewellery
                </h3>
                <p style={{ fontSize: '0.82rem', color: '#666666', lineHeight: 1.6, margin: 0 }}>
                  Exquisite artisan earrings, delicate beaded necklaces, pearl bracelets, and traditional hair ornaments meticulously crafted piece by piece.
                </p>
                <div style={{ fontSize: '0.74rem', fontWeight: 700, color: '#C2410C', textTransform: 'uppercase', letterSpacing: '0.08em', fontFamily: "'Noto Nastaliq Urdu', serif" }}>
                  ہاتھ سے تیار کردہ نفیس جیولری
                </div>
              </div>

              {/* Card 3: Hand-Embroidered Dresses */}
              <div
                style={{
                  backgroundColor: '#FFFFFF',
                  padding: '1.5rem',
                  borderRadius: '4px',
                  border: '1px solid #EFEAE1',
                  boxShadow: '0 2px 10px rgba(0, 0, 0, 0.03)',
                  display: 'flex',
                  flexDirection: 'column',
                  gap: '0.75rem',
                  transition: 'all 0.25s ease',
                }}
              >
                <div
                  style={{
                    width: '42px',
                    height: '42px',
                    borderRadius: '50%',
                    backgroundColor: 'rgba(227, 82, 5, 0.1)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    color: '#E35205',
                  }}
                >
                  <Scissors size={22} />
                </div>
                <h3
                  style={{
                    fontSize: '0.98rem',
                    fontWeight: 800,
                    textTransform: 'uppercase',
                    letterSpacing: '0.06em',
                    color: '#111111',
                    margin: 0,
                    fontFamily: "'Plus Jakarta Sans', sans-serif",
                  }}
                >
                  Hand-Embroidered Dresses
                </h3>
                <p style={{ fontSize: '0.82rem', color: '#666666', lineHeight: 1.6, margin: 0 }}>
                  Bespoke artisanal dresses, festive kurtis, and unstitched luxury textiles detailed with intricate needle-craft, fine threadwork, and tailored finish.
                </p>
                <div style={{ fontSize: '0.74rem', fontWeight: 700, color: '#C2410C', textTransform: 'uppercase', letterSpacing: '0.08em', fontFamily: "'Noto Nastaliq Urdu', serif" }}>
                  ہاتھ کی نفیس کڑھائی والے ملبوسات
                </div>
              </div>

              {/* Card 4: Kids' Crochet & Dresses */}
              <div
                style={{
                  backgroundColor: '#FFFFFF',
                  padding: '1.5rem',
                  borderRadius: '4px',
                  border: '1px solid #EFEAE1',
                  boxShadow: '0 2px 10px rgba(0, 0, 0, 0.03)',
                  display: 'flex',
                  flexDirection: 'column',
                  gap: '0.75rem',
                  transition: 'all 0.25s ease',
                }}
              >
                <div
                  style={{
                    width: '42px',
                    height: '42px',
                    borderRadius: '50%',
                    backgroundColor: 'rgba(227, 82, 5, 0.1)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    color: '#E35205',
                  }}
                >
                  <Heart size={22} />
                </div>
                <h3
                  style={{
                    fontSize: '0.98rem',
                    fontWeight: 800,
                    textTransform: 'uppercase',
                    letterSpacing: '0.06em',
                    color: '#111111',
                    margin: 0,
                    fontFamily: "'Plus Jakarta Sans', sans-serif",
                  }}
                >
                  Kids' Crochet & Dresses
                </h3>
                <p style={{ fontSize: '0.82rem', color: '#666666', lineHeight: 1.6, margin: 0 }}>
                  Tender hand-crocheted dresses, adorable baby frocks, crochet booties, and charming heirloom sets crafted with pure love and softness.
                </p>
                <div style={{ fontSize: '0.74rem', fontWeight: 700, color: '#C2410C', textTransform: 'uppercase', letterSpacing: '0.08em', fontFamily: "'Noto Nastaliq Urdu', serif" }}>
                  بچوں کے خوبصورت کروشیا فراک و لباس
                </div>
              </div>
            </div>
          </div>
        </section>
      )}

      {/* =========================================================================
          2. DYNAMIC CATEGORIES SECTION (Khaadi & Outfitters Fashion Style)
          ========================================================================= */}
      <section id="curated-collections" style={{ maxWidth: '1360px', margin: '0 auto', padding: '0 1.5rem', width: '100%', marginTop: storeType === 'clothing' ? '3.5rem' : '1.5rem' }}>
        <div style={{
          display: 'flex',
          flexWrap: 'wrap',
          alignItems: 'flex-end',
          justifyContent: 'space-between',
          marginBottom: '1.75rem',
          gap: '1rem',
        }}>
          <div>
            <div style={{
              display: 'flex',
              alignItems: 'center',
              gap: '0.45rem',
              color: storeType === 'clothing' ? '#E35205' : 'var(--primary-color)',
              fontSize: '0.74rem',
              fontWeight: 800,
              textTransform: 'uppercase',
              letterSpacing: '0.14em',
              marginBottom: '0.25rem',
            }}>
              <Sparkles size={12} color="currentColor" />
              <span>{storeType === 'clothing' ? 'Curated Capsules' : 'Editor Selection'}</span>
            </div>
            <h2 style={{
              fontSize: storeType === 'clothing' ? 'clamp(1.5rem, 2.5vw, 1.95rem)' : storeType === 'jewelry' ? '1.85rem' : '1.5rem',
              color: '#111111',
              letterSpacing: storeType === 'clothing' ? '0.08em' : '-0.02em',
              fontWeight: 800,
              textTransform: storeType === 'clothing' ? 'uppercase' : 'none',
              fontFamily: storeType === 'clothing' ? "'Plus Jakarta Sans', sans-serif" : 'var(--font-heading)',
              margin: 0,
            }}>
              {storeType === 'clothing' ? 'Curated Edits' : storeType === 'jewelry' ? 'Haute Joaillerie' : 'Top Categories'}
            </h2>
          </div>

          <button
            onClick={onViewCatalog}
            style={{
              background: 'transparent',
              border: 'none',
              color: '#111111',
              fontWeight: 800,
              fontSize: '0.82rem',
              letterSpacing: '0.1em',
              textTransform: 'uppercase',
              cursor: 'pointer',
              display: 'inline-flex',
              alignItems: 'center',
              gap: '0.4rem',
              padding: '0.5rem 0',
              transition: 'color 0.2s ease, transform 0.2s ease',
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.color = '#E35205';
              e.currentTarget.style.transform = 'translateX(3px)';
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.color = '#111111';
              e.currentTarget.style.transform = 'translateX(0)';
            }}
          >
            <span>View All Categories</span>
            <ChevronRight size={16} strokeWidth={2.5} />
          </button>
        </div>

        {/* Categories Grid - High-Fashion Editorial Cards */}
        <div
          className={storeType === 'clothing' ? 'fashion-categories-grid' : ''}
          style={storeType === 'clothing' ? {} : {
            display: 'grid',
            gridTemplateColumns: storeType === 'general'
              ? 'repeat(auto-fill, minmax(170px, 1fr))'
              : 'repeat(auto-fill, minmax(260px, 1fr))',
            gap: '1.25rem',
          }}
        >
          {displayCategories.map((cat) => (
            <div
              key={cat.id}
              onClick={() => onViewCatalog({ categoryId: cat.id, categorySlug: cat.slug })}
              style={{
                cursor: 'pointer',
                overflow: 'hidden',
                position: 'relative',
                borderRadius: '4px',
                border: '1px solid #e5e7eb',
                backgroundColor: '#ffffff',
                boxShadow: '0 2px 8px rgba(0, 0, 0, 0.04)',
                transition: 'all 0.3s cubic-bezier(0.16, 1, 0.3, 1)',
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.transform = 'translateY(-4px)';
                e.currentTarget.style.boxShadow = '0 12px 28px rgba(0, 0, 0, 0.1)';
                e.currentTarget.style.borderColor = '#111111';
                const img = e.currentTarget.querySelector('.cat-hero-img');
                if (img) img.style.transform = 'scale(1.06)';
                const pill = e.currentTarget.querySelector('.cat-action-pill');
                if (pill) {
                  pill.style.backgroundColor = '#111111';
                  pill.style.color = '#ffffff';
                  pill.style.transform = 'translateY(-2px)';
                }
                const arrow = e.currentTarget.querySelector('.cat-arrow-icon');
                if (arrow) arrow.style.transform = 'translateX(4px)';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.transform = 'translateY(0)';
                e.currentTarget.style.boxShadow = '0 2px 8px rgba(0, 0, 0, 0.04)';
                e.currentTarget.style.borderColor = '#e5e7eb';
                const img = e.currentTarget.querySelector('.cat-hero-img');
                if (img) img.style.transform = 'scale(1)';
                const pill = e.currentTarget.querySelector('.cat-action-pill');
                if (pill) {
                  pill.style.backgroundColor = 'rgba(255, 255, 255, 0.95)';
                  pill.style.color = '#111111';
                  pill.style.transform = 'translateY(0)';
                }
                const arrow = e.currentTarget.querySelector('.cat-arrow-icon');
                if (arrow) arrow.style.transform = 'translateX(0)';
              }}
            >
              <div style={{
                position: 'relative',
                paddingTop: storeType === 'general' ? '70%' : '130%',
                backgroundColor: '#f7f7f8',
                overflow: 'hidden',
              }}>
                <img
                  src={getImageUrl(cat.image)}
                  alt={cat.name}
                  className="cat-hero-img"
                  style={{
                    position: 'absolute',
                    inset: 0,
                    width: '100%',
                    height: '100%',
                    objectFit: 'cover',
                    transition: 'transform 0.65s cubic-bezier(0.16, 1, 0.3, 1)',
                  }}
                  loading="lazy"
                />
                
                {/* Subtle bottom vignette to ensure high text contrast */}
                <div style={{
                  position: 'absolute',
                  inset: 0,
                  background: 'linear-gradient(to top, rgba(0, 0, 0, 0.45) 0%, rgba(0, 0, 0, 0.05) 35%, transparent 60%)',
                  pointerEvents: 'none',
                }} />

                {/* Floating Modern Pill Tag at Bottom */}
                <div style={{
                  position: 'absolute',
                  bottom: 'clamp(0.6rem, 2vw, 1rem)',
                  left: 'clamp(0.6rem, 2vw, 1rem)',
                  right: 'clamp(0.6rem, 2vw, 1rem)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  zIndex: 2,
                }}>
                  <div
                    className="cat-action-pill"
                    style={{
                      width: '100%',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'space-between',
                      backgroundColor: 'rgba(255, 255, 255, 0.95)',
                      backdropFilter: 'blur(10px)',
                      WebkitBackdropFilter: 'blur(10px)',
                      color: '#111111',
                      padding: 'clamp(0.48rem, 1.5vw, 0.65rem) clamp(0.55rem, 1.8vw, 0.95rem)',
                      borderRadius: '4px',
                      boxShadow: '0 4px 14px rgba(0, 0, 0, 0.12)',
                      transition: 'all 0.25s ease',
                      boxSizing: 'border-box',
                    }}
                  >
                    <div style={{ display: 'flex', flexDirection: 'column', minWidth: 0 }}>
                      <span style={{
                        fontSize: '0.84rem',
                        fontWeight: 800,
                        letterSpacing: '0.08em',
                        textTransform: 'uppercase',
                        lineHeight: 1.2,
                        whiteSpace: 'nowrap',
                        overflow: 'hidden',
                        textOverflow: 'ellipsis',
                      }}>
                        {cat.name}
                      </span>
                      <span style={{
                        fontSize: '0.65rem',
                        fontWeight: 600,
                        opacity: 0.8,
                        letterSpacing: '0.04em',
                        marginTop: '0.1rem',
                      }}>
                        {cat.products_count ? `${cat.products_count} Designs` : 'Explore Capsule'}
                      </span>
                    </div>

                    <ArrowRight
                      size={15}
                      className="cat-arrow-icon"
                      style={{
                        flexShrink: 0,
                        marginLeft: '0.5rem',
                        transition: 'transform 0.22s ease',
                      }}
                    />
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* =========================================================================
          3. FEATURED PRODUCTS SHOWCASE WITH INTERACTIVE CATEGORY TABS (Khaadi Style)
          ========================================================================= */}
      <section style={{ maxWidth: '1360px', margin: '4rem auto 0', padding: '0 1.5rem', width: '100%' }}>
        <div style={{
          display: 'flex',
          flexDirection: 'column',
          gap: '1.25rem',
          marginBottom: '2rem',
          borderBottom: '1px solid #e5e7eb',
          paddingBottom: '1.25rem',
        }}>
          {/* Top row: Section Header and Collection Link */}
          <div style={{
            display: 'flex',
            flexWrap: 'wrap',
            alignItems: 'flex-end',
            justifyContent: 'space-between',
            gap: '1rem',
          }}>
            <div>
              <div style={{
                display: 'flex',
                alignItems: 'center',
                gap: '0.45rem',
                color: storeType === 'clothing' ? '#E35205' : 'var(--primary-color)',
                fontSize: '0.74rem',
                fontWeight: 800,
                textTransform: 'uppercase',
                letterSpacing: '0.14em',
                marginBottom: '0.25rem',
              }}>
                <Zap size={12} color="currentColor" />
                <span>{storeType === 'clothing' ? 'New Drop' : 'Highlights'}</span>
              </div>
              <h2 style={{
                fontSize: storeType === 'clothing' ? 'clamp(1.5rem, 2.5vw, 1.95rem)' : storeType === 'jewelry' ? '1.85rem' : '1.5rem',
                fontWeight: 800,
                letterSpacing: storeType === 'clothing' ? '0.08em' : '-0.02em',
                textTransform: storeType === 'clothing' ? 'uppercase' : 'none',
                color: '#111111',
                fontFamily: storeType === 'clothing' ? "'Plus Jakarta Sans', sans-serif" : 'var(--font-heading)',
                margin: 0,
              }}>
                {storeType === 'clothing' ? 'New Arrivals' : storeType === 'jewelry' ? 'Masterpiece Highlights' : 'Top Deals of the Day'}
              </h2>
            </div>

            <button
              onClick={() => onViewCatalog(activeCategoryTab !== 'all' ? { categorySlug: activeCategoryTab } : {})}
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: '0.5rem',
                padding: '0.6rem 1.35rem',
                borderRadius: '4px',
                border: '1.5px solid #111111',
                backgroundColor: 'transparent',
                color: '#111111',
                fontSize: '0.78rem',
                fontWeight: 800,
                letterSpacing: '0.1em',
                textTransform: 'uppercase',
                cursor: 'pointer',
                transition: 'all 0.2s cubic-bezier(0.16, 1, 0.3, 1)',
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.backgroundColor = '#111111';
                e.currentTarget.style.color = '#ffffff';
                e.currentTarget.style.transform = 'translateY(-2px)';
                const icon = e.currentTarget.querySelector('.explore-arrow');
                if (icon) icon.style.transform = 'translateX(3px)';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.backgroundColor = 'transparent';
                e.currentTarget.style.color = '#111111';
                e.currentTarget.style.transform = 'translateY(0)';
                const icon = e.currentTarget.querySelector('.explore-arrow');
                if (icon) icon.style.transform = 'translateX(0)';
              }}
            >
              <span>Explore Full Collection</span>
              <ArrowRight size={14} className="explore-arrow" style={{ transition: 'transform 0.2s ease' }} />
            </button>
          </div>

          {/* Interactive Category Filter Pills (Horizontal Scrolling on Mobile/Tablet) */}
          {categories.length > 0 && (
            <div style={{
              display: 'flex',
              gap: '0.55rem',
              overflowX: 'auto',
              paddingBottom: '0.35rem',
              alignItems: 'center',
              scrollbarWidth: 'none',
              WebkitOverflowScrolling: 'touch',
            }}>
              {/* 'All' Tab */}
              <button
                onClick={() => setActiveCategoryTab('all')}
                style={{
                  padding: '0.55rem 1.15rem',
                  borderRadius: '4px',
                  fontSize: '0.78rem',
                  fontWeight: activeCategoryTab === 'all' ? 800 : 600,
                  letterSpacing: '0.06em',
                  textTransform: 'uppercase',
                  cursor: 'pointer',
                  whiteSpace: 'nowrap',
                  border: activeCategoryTab === 'all' ? '1.5px solid #111111' : '1px solid #e5e7eb',
                  backgroundColor: activeCategoryTab === 'all' ? '#111111' : '#ffffff',
                  color: activeCategoryTab === 'all' ? '#ffffff' : '#111111',
                  transition: 'all 0.18s ease',
                  boxShadow: activeCategoryTab === 'all' ? '0 2px 8px rgba(0, 0, 0, 0.12)' : 'none',
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '0.45rem',
                }}
                onMouseEnter={(e) => {
                  if (activeCategoryTab !== 'all') {
                    e.currentTarget.style.borderColor = '#111111';
                    e.currentTarget.style.backgroundColor = '#f7f7f8';
                  }
                }}
                onMouseLeave={(e) => {
                  if (activeCategoryTab !== 'all') {
                    e.currentTarget.style.borderColor = '#e5e7eb';
                    e.currentTarget.style.backgroundColor = '#ffffff';
                  }
                }}
              >
                <span>All</span>
                <span style={{
                  fontSize: '0.68rem',
                  fontWeight: 700,
                  opacity: 0.85,
                  padding: '0.05rem 0.35rem',
                  borderRadius: '3px',
                  backgroundColor: activeCategoryTab === 'all' ? 'rgba(255, 255, 255, 0.2)' : '#f3f4f6',
                  color: activeCategoryTab === 'all' ? '#ffffff' : '#666666',
                }}>
                  {featuredProducts.length}
                </span>
              </button>

              {/* Dynamic Categories Tabs */}
              {displayCategories.map((c) => {
                const isSelected = activeCategoryTab === c.slug;
                const categoryCount = featuredProducts.filter(
                  (p) =>
                    p.category?.slug === c.slug ||
                    String(p.category_id) === String(c.id) ||
                    String(p.category?.id) === String(c.id) ||
                    String(p.category?.parent_id) === String(c.id) ||
                    p.category?.parent?.slug === c.slug
                ).length;

                return (
                  <button
                    key={c.id}
                    onClick={() => setActiveCategoryTab(c.slug)}
                    style={{
                      padding: '0.55rem 1.15rem',
                      borderRadius: '4px',
                      fontSize: '0.78rem',
                      fontWeight: isSelected ? 800 : 600,
                      letterSpacing: '0.06em',
                      textTransform: 'uppercase',
                      cursor: 'pointer',
                      whiteSpace: 'nowrap',
                      border: isSelected ? '1.5px solid #111111' : '1px solid #e5e7eb',
                      backgroundColor: isSelected ? '#111111' : '#ffffff',
                      color: isSelected ? '#ffffff' : '#111111',
                      transition: 'all 0.18s ease',
                      boxShadow: isSelected ? '0 2px 8px rgba(0, 0, 0, 0.12)' : 'none',
                      display: 'inline-flex',
                      alignItems: 'center',
                      gap: '0.45rem',
                    }}
                    onMouseEnter={(e) => {
                      if (!isSelected) {
                        e.currentTarget.style.borderColor = '#111111';
                        e.currentTarget.style.backgroundColor = '#f7f7f8';
                      }
                    }}
                    onMouseLeave={(e) => {
                      if (!isSelected) {
                        e.currentTarget.style.borderColor = '#e5e7eb';
                        e.currentTarget.style.backgroundColor = '#ffffff';
                      }
                    }}
                  >
                    <span>{c.name}</span>
                    {categoryCount > 0 && (
                      <span style={{
                        fontSize: '0.68rem',
                        fontWeight: 700,
                        opacity: 0.85,
                        padding: '0.05rem 0.35rem',
                        borderRadius: '3px',
                        backgroundColor: isSelected ? 'rgba(255, 255, 255, 0.2)' : '#f3f4f6',
                        color: isSelected ? '#ffffff' : '#666666',
                      }}>
                        {categoryCount}
                      </span>
                    )}
                  </button>
                );
              })}
            </div>
          )}
        </div>

        {/* Products Grid - 4 Columns on Desktop, 2 on Mobile */}
        {loading ? (
          <div style={{ textAlign: 'center', padding: '4rem 1rem', color: '#666666', fontSize: '0.9rem' }}>
            Loading store collection...
          </div>
        ) : (
          (() => {
            const filteredList = activeCategoryTab === 'all'
              ? (storeType === 'clothing' ? featuredProducts.slice(0, 12) : featuredProducts)
              : featuredProducts.filter(
                  (p) =>
                    p.category?.slug === activeCategoryTab ||
                    String(p.category_id) === String(activeCategoryTab) ||
                    String(p.category?.id) === String(activeCategoryTab) ||
                    String(p.category?.parent_id) === String(activeCategoryTab) ||
                    p.category?.parent?.slug === activeCategoryTab
                );

            if (filteredList.length === 0) {
              return (
                <div style={{
                  textAlign: 'center',
                  padding: '3.5rem 2rem',
                  backgroundColor: '#f7f7f8',
                  borderRadius: '4px',
                  border: '1px dashed #e5e7eb',
                  maxWidth: '520px',
                  margin: '1.5rem auto',
                }}>
                  <p style={{ color: '#666666', marginBottom: '1.25rem', fontSize: '0.92rem' }}>
                    No featured pieces currently assigned to this capsule.
                  </p>
                  <button
                    onClick={() => setActiveCategoryTab('all')}
                    className="btn-primary"
                    style={{ fontSize: '0.8rem', padding: '0.6rem 1.4rem' }}
                  >
                    View All Designs
                  </button>
                </div>
              );
            }

            return (
              <div
                className={storeType === 'clothing' ? 'fashion-products-grid' : ''}
                style={storeType === 'clothing' ? {} : {
                  display: 'grid',
                  gridTemplateColumns: storeType === 'general'
                    ? 'repeat(auto-fill, minmax(210px, 1fr))'
                    : 'repeat(auto-fill, minmax(260px, 1fr))',
                  gap: '1.5rem',
                }}
              >
                {filteredList.map((p) => (
                  <ProductCard
                    key={p.id}
                    product={p}
                    onSelectProduct={onSelectProduct}
                  />
                ))}
              </div>
            );
          })()
        )}
      </section>

      {/* =========================================================================
          3B. BEST SELLERS / ICONIC SILHOUETTES SECTION (Khaadi & Outfitters Style)
          ========================================================================= */}
      {storeType === 'clothing' && featuredProducts.length > 4 && (
        <section style={{ maxWidth: '1360px', margin: '4rem auto 0', padding: '0 1.5rem', width: '100%' }}>
          <div style={{
            display: 'flex',
            flexWrap: 'wrap',
            alignItems: 'flex-end',
            justifyContent: 'space-between',
            gap: '1rem',
            marginBottom: '1.75rem',
            borderBottom: '1px solid #e5e7eb',
            paddingBottom: '1.25rem',
          }}>
            <div>
              <div style={{
                display: 'flex',
                alignItems: 'center',
                gap: '0.45rem',
                color: '#E35205',
                fontSize: '0.72rem',
                fontWeight: 800,
                textTransform: 'uppercase',
                letterSpacing: '0.14em',
                marginBottom: '0.25rem',
              }}>
                <Flame size={12} color="currentColor" />
                <span>Runway Edit</span>
              </div>
              <h2 style={{
                fontSize: 'clamp(1.5rem, 2.5vw, 1.95rem)',
                fontWeight: 800,
                letterSpacing: '0.08em',
                textTransform: 'uppercase',
                color: '#111111',
                fontFamily: "'Plus Jakarta Sans', sans-serif",
                margin: 0,
              }}>
                Most Coveted
              </h2>
            </div>

            <button
              onClick={() => onViewCatalog({ sort: 'featured' })}
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: '0.5rem',
                padding: '0.6rem 1.35rem',
                borderRadius: '4px',
                border: '1.5px solid #111111',
                backgroundColor: 'transparent',
                color: '#111111',
                fontSize: '0.78rem',
                fontWeight: 800,
                letterSpacing: '0.1em',
                textTransform: 'uppercase',
                cursor: 'pointer',
                transition: 'all 0.2s cubic-bezier(0.16, 1, 0.3, 1)',
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.backgroundColor = '#111111';
                e.currentTarget.style.color = '#ffffff';
                e.currentTarget.style.transform = 'translateY(-2px)';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.backgroundColor = 'transparent';
                e.currentTarget.style.color = '#111111';
                e.currentTarget.style.transform = 'translateY(0)';
              }}
            >
              <span>View All Best Sellers</span>
              <ArrowRight size={14} />
            </button>
          </div>

          <div className="fashion-products-grid">
            {featuredProducts.slice(4, 12).map((p) => (
              <ProductCard
                key={`bestseller-${p.id}`}
                product={p}
                onSelectProduct={onSelectProduct}
              />
            ))}
          </div>
        </section>
      )}

     
      {/* =========================================================================
          4. SLEEK MINIMAL NEWSLETTER (Khaadi Style - 1 Line, No Clutter)
          ========================================================================= */}
      {storeType === 'clothing' && (
        <section style={{ maxWidth: '1360px', margin: '2rem auto 1rem', padding: '0 1.5rem', width: '100%' }}>
          <div style={{
            backgroundColor: '#ffffff',
            border: '1px solid #e5e7eb',
            padding: '2.5rem 2rem',
            textAlign: 'center',
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            gap: '1rem',
          }}>
            <h3 style={{
              fontSize: '1.15rem',
              fontWeight: 800,
              letterSpacing: '0.14em',
              textTransform: 'uppercase',
              color: '#111111',
              margin: 0,
              fontFamily: "'Plus Jakarta Sans', sans-serif",
            }}>
              Be The First To Know
            </h3>

            {newsletterJoined ? (
              <div style={{
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                gap: '0.4rem',
              }}>
                <div style={{
                  color: '#E35205',
                  fontSize: '0.88rem',
                  fontWeight: 700,
                  letterSpacing: '0.04em',
                }}>
                  ✓ {newsletterMsg || 'You are subscribed to Khaam Poshak updates.'}
                </div>
                <div style={{ fontSize: '0.74rem', color: '#6B7280' }}>
                  You'll be the first to know about new handcrafted drops and exclusive offers.
                </div>
              </div>
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '0.5rem', width: '100%', maxWidth: '460px' }}>
                <form
                  onSubmit={handleNewsletterSubmit}
                  style={{
                    display: 'flex',
                    width: '100%',
                  }}
                >
                  <input
                    type="email"
                    required
                    value={newsletterEmail}
                    onChange={(e) => {
                      setNewsletterEmail(e.target.value);
                      if (newsletterError) setNewsletterError('');
                    }}
                    placeholder="ENTER YOUR EMAIL"
                    style={{
                      flexGrow: 1,
                      padding: '0.75rem 1rem',
                      border: newsletterError ? '1.5px solid #DC2626' : '1px solid #111111',
                      borderRight: 'none',
                      borderRadius: '0',
                      fontSize: '0.78rem',
                      letterSpacing: '0.08em',
                      outline: 'none',
                      backgroundColor: '#ffffff',
                      color: '#111111',
                    }}
                  />
                  <button
                    type="submit"
                    disabled={newsletterLoading}
                    style={{
                      padding: '0.75rem 1.6rem',
                      backgroundColor: newsletterLoading ? '#4B5563' : '#111111',
                      color: '#ffffff',
                      border: '1px solid #111111',
                      borderRadius: '0',
                      fontWeight: 800,
                      fontSize: '0.78rem',
                      letterSpacing: '0.12em',
                      textTransform: 'uppercase',
                      cursor: newsletterLoading ? 'not-allowed' : 'pointer',
                      whiteSpace: 'nowrap',
                      transition: 'background-color 0.2s ease',
                    }}
                    onMouseEnter={(e) => {
                      if (!newsletterLoading) e.currentTarget.style.backgroundColor = '#E35205';
                    }}
                    onMouseLeave={(e) => {
                      if (!newsletterLoading) e.currentTarget.style.backgroundColor = '#111111';
                    }}
                  >
                    {newsletterLoading ? 'Saving...' : 'Subscribe'}
                  </button>
                </form>
                {newsletterError && (
                  <span style={{ fontSize: '0.74rem', color: '#DC2626', fontWeight: 600 }}>
                    {newsletterError}
                  </span>
                )}
              </div>
            )}
          </div>
        </section>
      )}

      {/* Size Chart Modal */}
      <SizeChartModal
        isOpen={isSizeChartOpen}
        onClose={() => setIsSizeChartOpen(false)}
      />

      {/* Luxury Certificate Modal */}
      <LuxuryCertificateModal
        isOpen={isCertOpen}
        onClose={() => setIsCertOpen(false)}
      />
    </div>
  );
}
