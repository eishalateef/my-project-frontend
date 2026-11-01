import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import axios from 'axios';
import { useStore } from '../context/StoreContext';
import { useCart } from '../context/CartContext';
import { useWishlist } from '../context/WishlistContext';
import SizeChartModal from '../components/SizeChartModal';
import LuxuryCertificateModal from '../components/LuxuryCertificateModal';
import FlexiPayModal from '../components/FlexiPayModal';
import ProductCard from '../components/ProductCard';
import { getColorHex } from '../components/DynamicFilters';
import {
  ShoppingBag,
  Sparkles,
  Ruler,
  ShieldCheck,
  Truck,
  RotateCcw,
  Check,
  Plus,
  Minus,
  ArrowLeft,
  Star,
  Zap,
  Heart,
  Award,
  Package,
  Feather,
  CheckCircle2,
  ChevronDown,
  ChevronUp,
} from 'lucide-react';

export default function ProductDetail({ productId: propProductId, onBack, onSelectProduct, onInstantCheckout }) {
  const { slug } = useParams();
  const navigate = useNavigate();
  const activeIdentifier = propProductId || slug;

  const { storeType, formatPrice, config } = useStore();
  const { addToCart, cartItems } = useCart();
  const { isInWishlist, toggleWishlist } = useWishlist();

  const [productData, setProductData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [selectedImage, setSelectedImage] = useState(0);
  const [activeColorImage, setActiveColorImage] = useState(null);
  const [selectedAttrs, setSelectedAttrs] = useState({});
  const [quantity, setQuantity] = useState(1);

  // Modals & Tabs
  const [activeDetailTab, setActiveDetailTab] = useState('description');
  const [isSizeChartOpen, setIsSizeChartOpen] = useState(false);
  const [isCertOpen, setIsCertOpen] = useState(false);
  const [isFlexiPayOpen, setIsFlexiPayOpen] = useState(false);
  const [isInstallmentsExpanded, setIsInstallmentsExpanded] = useState(false);
  const [showStickyBar, setShowStickyBar] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setShowStickyBar(window.scrollY > 450);
    };
    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const handleBackAction = () => {
    if (onBack) {
      onBack();
    } else if (window.history.length > 1) {
      navigate(-1);
    } else {
      navigate('/catalog');
    }
  };

  const handleSelectRelated = (p) => {
    if (onSelectProduct) {
      onSelectProduct(p);
    } else {
      navigate(`/products/${p.slug || p.id}`);
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  };

  const handleCheckoutAction = () => {
    if (onInstantCheckout) {
      onInstantCheckout();
    } else {
      navigate('/checkout');
    }
  };

  useEffect(() => {
    const fetchDetail = async () => {
      try {
        setLoading(true);
        const res = await axios.get(`/api/products/${activeIdentifier}`);
        const data = res.data;
        setProductData(data);

        // Pre-select first in-stock option for each grouped attribute
        const initialSelected = {};
        let initialColorImage = null;
        let initialImageIdx = 0;

        const prodImages = Array.isArray(data.product?.images)
          ? data.product.images
          : [data.product?.images].filter(Boolean);

        if (data.grouped_attributes_detailed) {
          Object.entries(data.grouped_attributes_detailed).forEach(([attrName, items]) => {
            if (items && items.length > 0) {
              const inStock = items.find((i) => i.is_available !== false && i.is_available !== 0);
              const selectedItem = inStock || items[0];
              initialSelected[attrName] = selectedItem.value;

              if (attrName.toLowerCase() === 'color') {
                if (selectedItem.image_url) {
                  const mIdx = prodImages.findIndex(
                    (img) =>
                      img === selectedItem.image_url ||
                      img.endsWith(selectedItem.image_url) ||
                      selectedItem.image_url.endsWith(img)
                  );
                  if (mIdx !== -1) {
                    initialImageIdx = mIdx;
                  } else {
                    initialColorImage = selectedItem.image_url;
                  }
                }
              }
            }
          });
        } else if (data.grouped_attributes) {
          Object.entries(data.grouped_attributes).forEach(([attrName, values]) => {
            if (values && values.length > 0) {
              initialSelected[attrName] = values[0];
            }
          });
        }
        setSelectedAttrs(initialSelected);
        setSelectedImage(initialImageIdx);
        setActiveColorImage(initialColorImage);
      } catch (err) {
        console.error('Failed to load product detail:', err);
      } finally {
        setLoading(false);
      }
    };

    if (activeIdentifier) {
      setQuantity(1);
      fetchDetail();
      window.scrollTo({ top: 0, behavior: 'smooth' });
    } else {
      setLoading(false);
    }
  }, [activeIdentifier]);

  // Real inventory calculations (called at top level to respect React rules of hooks)
  const product = productData?.product || null;
  const productStock = product?.stock !== undefined && product?.stock !== null ? Number(product.stock) : 99;
  const inCartQty = (cartItems || [])
    .filter((item) => item.product_id === product?.id)
    .reduce((sum, item) => sum + item.quantity, 0);
  const remainingStock = Math.max(0, productStock - inCartQty);
  const isOutOfStock = product ? productStock <= 0 : false;
  const isMaxStockInCart = product ? remainingStock <= 0 : false;

  // Auto-clamp selected quantity to remaining stock
  useEffect(() => {
    if (product && remainingStock > 0 && quantity > remainingStock) {
      setQuantity(remainingStock);
    } else if (product && remainingStock === 0) {
      setQuantity(1);
    }
  }, [product, remainingStock, quantity]);

  if (loading) {
    return (
      <div style={{ maxWidth: '1200px', margin: '4rem auto', textAlign: 'center', color: 'var(--text-muted)' }}>
        Loading product details...
      </div>
    );
  }

  if (!productData || !productData.product) {
    return (
      <div style={{ maxWidth: '1200px', margin: '4rem auto', textAlign: 'center' }}>
        <p>Product could not be found.</p>
        <button onClick={handleBackAction} className="btn-primary" style={{ marginTop: '1rem' }}>
          {storeType === 'jewelry' ? 'Explore High Jewelry Vault' : 'Discover Collections'}
        </button>
      </div>
    );
  }

  const { grouped_attributes, grouped_attributes_detailed, related_products } = productData;
  const images = Array.isArray(product.images) && product.images.length > 0
    ? product.images
    : [product.images || 'https://images.unsplash.com/photo-1523381210434-271e8be1f52b?w=800&auto=format&fit=crop&q=80'];
  const isSale = product.sale_price && Number(product.sale_price) < Number(product.price);
  const currentPrice = isSale ? product.sale_price : product.price;

  // Key Pakistani specs
  const pieces = product.attributes?.find((a) => a.attribute_name === 'pieces')?.attribute_value || (grouped_attributes?.pieces ? grouped_attributes.pieces[0] : null);
  const fabric = product.attributes?.find((a) => a.attribute_name === 'fabric')?.attribute_value || (grouped_attributes?.fabric ? grouped_attributes.fabric[0] : null);
  const origin = product.attributes?.find((a) => a.attribute_name === 'origin')?.attribute_value || (grouped_attributes?.origin ? grouped_attributes.origin[0] : null);
  const craftsmanship = product.attributes?.find((a) => a.attribute_name === 'craftsmanship')?.attribute_value || (grouped_attributes?.craftsmanship ? grouped_attributes.craftsmanship[0] : null);
  const material = product.attributes?.find((a) => a.attribute_name === 'material')?.attribute_value || (grouped_attributes?.material ? grouped_attributes.material[0] : null);
  const subcategory = product.attributes?.find((a) => a.attribute_name === 'subcategory')?.attribute_value || (grouped_attributes?.subcategory ? grouped_attributes.subcategory[0] : null);

  const isHandmade = Boolean(
    craftsmanship ||
    product.category?.slug?.includes('handmade') ||
    product.category?.name?.toLowerCase().includes('handmade') ||
    product.name?.toLowerCase().includes('handmade') ||
    product.name?.toLowerCase().includes('hand-') ||
    product.name?.toLowerCase().includes('crochet')
  );

  // Brand-aware category intelligence (Crochet Bags, Fabric Bags, Crochet Caps, Thread Jewellery, Kids Crochet, Stitched Dresses)
  const lowerName = (product.name || '').toLowerCase();
  const lowerCat = ((product.category?.name || '') + ' ' + (product.category?.slug || '')).toLowerCase();
  const lowerSub = (subcategory || '').toLowerCase();
  const lowerCraft = (craftsmanship || '').toLowerCase();
  const lowerMat = (material || fabric || '').toLowerCase();

  const isCap =
    lowerName.includes('cap') ||
    lowerName.includes('topi') ||
    lowerCat.includes('cap') ||
    lowerSub.includes('cap');

  const isCrochetBag =
    !isCap &&
    (lowerCat.includes('crochet-bag') ||
      (lowerName.includes('crochet') && (lowerName.includes('bag') || lowerName.includes('tote') || lowerName.includes('potli') || lowerName.includes('purse'))));

  const isFabricBag =
    !isCap &&
    !isCrochetBag &&
    (lowerCat.includes('fabric-bag') ||
      lowerName.includes('fabric bag') ||
      lowerName.includes('quilted') ||
      ((lowerName.includes('bag') || lowerName.includes('tote') || lowerCat.includes('bag')) && !lowerName.includes('crochet')));

  const isBag = isCrochetBag || isFabricBag;

  const isJewelry =
    storeType === 'jewelry' ||
    lowerName.includes('jewel') ||
    lowerName.includes('jhumka') ||
    lowerName.includes('earring') ||
    lowerName.includes('necklace') ||
    lowerName.includes('bangle') ||
    lowerName.includes('cufflink') ||
    lowerName.includes('paranda') ||
    lowerName.includes('resham') ||
    lowerName.includes('thread') ||
    lowerCat.includes('jewel') ||
    lowerSub.includes('jewel') ||
    lowerCat.includes('hair-accessories');

  const isChildOrBaby =
    !isCap &&
    !isBag &&
    !isJewelry &&
    (lowerCat.includes('kid') ||
      lowerCat.includes('baby') ||
      lowerSub.includes('baby') ||
      lowerSub.includes('kid') ||
      lowerName.includes('baby') ||
      lowerName.includes('child') ||
      lowerName.includes('boys') ||
      (lowerName.includes('frock') && !lowerName.includes('pishwas') && !lowerCat.includes('pret')) ||
      lowerName.includes('booties') ||
      lowerName.includes('amigurumi') ||
      lowerName.includes('cardigan'));

  const isCrochet =
    lowerName.includes('crochet') ||
    lowerName.includes('knit') ||
    lowerCraft.includes('crochet') ||
    lowerCraft.includes('knit') ||
    lowerMat.includes('yarn') ||
    lowerMat.includes('cord');

  const isDress = !isCap && !isBag && !isJewelry && !isChildOrBaby;
  const isAdultClothing = isDress;

  // Streamlined, punchy copywriting & scannable highlights (eliminates repetitive wall of text)
  const getStreamlinedCopy = (prod, bag, jewelry, child, crochet) => {
    const desc = (prod.description || '').trim();
    const sentences = desc.split(/(?<=[.!?])\s+/).filter(Boolean);
    let overview = sentences.slice(0, 2).join(' ');

    if (!overview || overview.length < 20) {
      if (bag) {
        overview = `A hand-crafted ${prod.name} designed with organic textures and reinforced durability. Ideal for effortless everyday carry and festive utility.`;
      } else if (jewelry) {
        overview = `Exquisitely handcrafted ${prod.name} capturing timeless royal allure with skin-safe, featherlight ergonomic balance.`;
      } else if (child) {
        overview = `Heirloom ${prod.name} lovingly made from ultra-soft, hypoallergenic combed yarn, designed for delicate infant comfort.`;
      } else {
        overview = `A classic ${prod.name} tailored from pure 100% natural fibers, designed with structured panels that flare gracefully for festive occasions.`;
      }
    }

    const highlights = [];
    if (bag) {
      highlights.push('Individually hand-crocheted and woven with high-tensile sustainable organic cotton cord.');
      highlights.push('Spacious lined interior with dedicated quick-access pocket for phone, keys & cards.');
      highlights.push('Reinforced base gusset and comfort-drop handles to prevent sagging when filled.');
    } else if (jewelry) {
      highlights.push('Authentic hand-set polki stones with hand-enameled meenakari accents.');
      highlights.push('Multi-layer 22K micro gold plating with long-lasting anti-tarnish protective seal.');
      highlights.push('100% hypoallergenic, nickel-free, and lead-free for sensitive skin.');
    } else if (child) {
      highlights.push('Ultra-gentle hypoallergenic organic bamboo/cotton yarn (100% scratch-free).');
      highlights.push('Generous diaper ease and natural stretch weave for active infant mobility.');
      highlights.push('Finished with baby-safe smooth wooden or mother-of-pearl buttons.');
    } else {
      highlights.push('Hand-embroidered mirrorwork, resham, and zari accents along the yoke, chest, and hem.');
      highlights.push('Crafted from 100% breathable, high-thread-count pure natural fabric base.');
      highlights.push('Tailored graceful silhouette with structured panels and bespoke tonal piping.');
    }

    return { overview, highlights };
  };

  const streamlinedCopy = getStreamlinedCopy(product, isBag, isJewelry, isChildOrBaby, isCrochet);

  // Check color & size availability
  const detailedAttrs = grouped_attributes_detailed || {};
  const currentColorItem = detailedAttrs.color?.find((c) => c.value === selectedAttrs['color']);
  const isSelectedColorSoldOut = currentColorItem ? (currentColorItem.is_available === false || currentColorItem.is_available === 0) : false;

  const currentSizeItem = detailedAttrs.size?.find((s) => s.value === selectedAttrs['size']);
  const isSelectedSizeSoldOut = currentSizeItem ? (currentSizeItem.is_available === false || currentSizeItem.is_available === 0) : false;

  const isAddToCartDisabled = isSelectedColorSoldOut || isSelectedSizeSoldOut || isOutOfStock || isMaxStockInCart;

  const handleAddToCart = () => {
    if (isAddToCartDisabled) return;
    addToCart(product, quantity, selectedAttrs);
  };

  const handleBuyNow = () => {
    if (isAddToCartDisabled) return;
    addToCart(product, quantity, selectedAttrs);
    handleCheckoutAction();
  };

  return (
    <div style={{ maxWidth: '1280px', margin: '0 auto', padding: '1.5rem', width: '100%' }}>
      {/* Luxury Editorial Breadcrumbs */}
      <nav
        aria-label="Breadcrumb"
        style={{
          display: 'flex',
          alignItems: 'center',
          gap: '0.45rem',
          marginBottom: '1rem',
          fontSize: '0.82rem',
          flexWrap: 'wrap',
          color: 'var(--text-muted)',
        }}
      >
        <button
          onClick={() => navigate('/')}
          style={{
            background: 'none',
            border: 'none',
            padding: 0,
            color: 'var(--text-muted)',
            cursor: 'pointer',
            fontWeight: 500,
          }}
          onMouseEnter={(e) => (e.currentTarget.style.color = 'var(--text-color)')}
          onMouseLeave={(e) => (e.currentTarget.style.color = 'var(--text-muted)')}
        >
          Home
        </button>
        <span style={{ opacity: 0.4 }}>/</span>
        <button
          onClick={() => navigate(product.category?.slug ? `/catalog?category=${product.category.slug}` : '/catalog')}
          style={{
            background: 'none',
            border: 'none',
            padding: 0,
            color: 'var(--text-muted)',
            cursor: 'pointer',
            fontWeight: 500,
          }}
          onMouseEnter={(e) => (e.currentTarget.style.color = 'var(--text-color)')}
          onMouseLeave={(e) => (e.currentTarget.style.color = 'var(--text-muted)')}
        >
          {product.category?.name || (storeType === 'jewelry' ? 'High Jewelry' : storeType === 'clothing' ? 'Collection' : 'Products')}
        </button>
        <span style={{ opacity: 0.4 }}>/</span>
        <span style={{ color: 'var(--text-color)', fontWeight: 700 }}>
          {product.name}
        </span>
      </nav>

      {/* Contextual Return Button */}
      <button
        onClick={handleBackAction}
        style={{
          display: 'inline-flex',
          alignItems: 'center',
          gap: '0.45rem',
          background: 'transparent',
          border: 'none',
          color: 'var(--text-muted)',
          cursor: 'pointer',
          marginBottom: '1.75rem',
          fontSize: '0.88rem',
          fontWeight: 600,
          transition: 'color 0.15s ease',
        }}
        onMouseEnter={(e) => (e.currentTarget.style.color = 'var(--text-color)')}
        onMouseLeave={(e) => (e.currentTarget.style.color = 'var(--text-muted)')}
      >
        <ArrowLeft size={16} />
        <span>
          {product.category?.name
            ? `Return to ${product.category.name}`
            : storeType === 'jewelry'
            ? 'Return to High Jewelry'
            : storeType === 'clothing'
            ? 'Return to Collection'
            : 'Continue Shopping'}
        </span>
      </button>

      {/* Main Product Showcase */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(340px, 1fr))',
        gap: '3rem',
        marginBottom: '4rem',
      }}>
        {/* Left: Gallery */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
          {/* Main Large Image */}
          <div style={{
            width: '100%',
            paddingTop: storeType === 'clothing' ? '125%' : storeType === 'jewelry' ? '100%' : '90%',
            position: 'relative',
            borderRadius: 'var(--radius)',
            overflow: 'hidden',
            backgroundColor: 'var(--surface)',
            border: '1px solid var(--border-color)',
          }}>
            <img
              src={activeColorImage || images[selectedImage] || images[0]}
              alt={product.name}
              style={{
                position: 'absolute',
                inset: 0,
                width: '100%',
                height: '100%',
                objectFit: 'cover',
                transition: 'opacity 0.2s ease',
              }}
            />
          </div>

          {/* Thumbnails */}
          {images.length > 1 && (
            <div style={{ display: 'flex', gap: '0.75rem' }}>
              {images.map((img, idx) => (
                <button
                  key={idx}
                  onClick={() => {
                    setSelectedImage(idx);
                    setActiveColorImage(null);
                    if (detailedAttrs.color) {
                      const matchedColor = detailedAttrs.color.find(
                        (c) => c.image_url && (c.image_url === img || img.endsWith(c.image_url) || c.image_url.endsWith(img))
                      );
                      if (matchedColor) {
                        setSelectedAttrs((prev) => ({ ...prev, color: matchedColor.value }));
                      } else if (detailedAttrs.color[idx]) {
                        setSelectedAttrs((prev) => ({ ...prev, color: detailedAttrs.color[idx].value }));
                      }
                    }
                  }}
                  style={{
                    width: '72px',
                    height: '72px',
                    borderRadius: 'var(--radius)',
                    overflow: 'hidden',
                    border: (!activeColorImage && selectedImage === idx) || activeColorImage === img ? '2px solid var(--primary-color)' : '1px solid var(--border-color)',
                    padding: 0,
                    cursor: 'pointer',
                    background: 'transparent',
                    transition: 'border-color 0.15s ease',
                  }}
                >
                  <img src={img} alt="thumb" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Right: Product Details & Dynamic Attributes */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1.75rem' }}>
          {/* Header & Badges */}
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.4rem' }}>
              <span style={{ fontSize: '0.78rem', color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.08em', fontWeight: 700 }}>
                {product.category?.name || 'Exclusive Release'}
              </span>
              <span style={{ color: 'var(--border-color)' }}>•</span>
              <span style={{ fontSize: '0.78rem', color: 'var(--text-muted)', fontFamily: 'monospace' }}>
                SKU: {product.sku || 'KHM-PK-2026'}
              </span>
            </div>

            {/* Refined Product Title with High Contrast */}
            <h1 style={{
              fontFamily: "var(--font-heading, 'Playfair Display', Georgia, serif)",
              fontSize: storeType === 'clothing' ? '2.25rem' : storeType === 'jewelry' ? '2.3rem' : '1.95rem',
              fontWeight: 700,
              color: 'var(--text-main, #1c1917)',
              lineHeight: 1.25,
              letterSpacing: '-0.015em',
              marginBottom: '0.85rem',
            }}>
              {product.name}
            </h1>

            {/* General Daraz Ratings */}
            {storeType === 'general' && (
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', fontSize: '0.85rem', marginBottom: '0.75rem' }}>
                <div style={{ display: 'flex', color: '#f59e0b' }}>
                  {[...Array(5)].map((_, i) => (
                    <Star key={i} size={15} fill="#f59e0b" color="#f59e0b" />
                  ))}
                </div>
                <span style={{ fontWeight: 700, color: 'var(--text-main)' }}>4.9</span>
                <span style={{ color: 'var(--text-muted)' }}>(142 Customer Reviews)</span>
              </div>
            )}

            {/* Decluttered Price & Live Inventory Bar */}
            <div style={{
              display: 'flex',
              alignItems: 'baseline',
              justifyContent: 'space-between',
              paddingBottom: '0.85rem',
              borderBottom: '1px solid var(--border-color)',
              flexWrap: 'wrap',
              gap: '0.75rem',
            }}>
              <div style={{ display: 'flex', alignItems: 'baseline', gap: '0.85rem' }}>
                <span style={{
                  fontSize: '2.1rem',
                  fontWeight: 800,
                  color: storeType === 'jewelry' ? '#D4AF37' : 'var(--primary-color)',
                  letterSpacing: '-0.02em',
                }}>
                  {formatPrice(currentPrice)}
                </span>

                {isSale && (
                  <>
                    <span style={{ fontSize: '1.05rem', color: 'var(--text-muted)', textDecoration: 'line-through' }}>
                      {formatPrice(product.price)}
                    </span>
                    <span style={{
                      backgroundColor: 'rgba(227, 82, 5, 0.1)',
                      color: 'var(--primary-color)',
                      fontSize: '0.75rem',
                      fontWeight: 800,
                      padding: '0.2rem 0.55rem',
                      borderRadius: '4px',
                    }}>
                      SAVE {Math.round(((product.price - product.sale_price) / product.price) * 100)}%
                    </span>
                  </>
                )}
              </div>

              {/* Minimal Stock Status Tag */}
              <div>
                {isOutOfStock ? (
                  <span style={{ fontSize: '0.78rem', fontWeight: 700, color: '#dc2626', backgroundColor: '#fef2f2', padding: '0.25rem 0.65rem', borderRadius: '999px', display: 'inline-flex', alignItems: 'center', gap: '0.35rem' }}>
                    <span style={{ width: '6px', height: '6px', borderRadius: '50%', backgroundColor: '#ef4444' }} />
                    Sold Out for Season
                  </span>
                ) : remainingStock <= 5 ? (
                  <span style={{ fontSize: '0.78rem', fontWeight: 700, color: '#c2410c', backgroundColor: '#fff7ed', padding: '0.25rem 0.65rem', borderRadius: '999px', display: 'inline-flex', alignItems: 'center', gap: '0.35rem' }}>
                    <span style={{ width: '6px', height: '6px', borderRadius: '50%', backgroundColor: '#ea580c' }} />
                    Only {remainingStock} left in stock
                  </span>
                ) : (
                  <span style={{ fontSize: '0.78rem', fontWeight: 700, color: '#15803d', backgroundColor: 'rgba(22, 163, 74, 0.08)', padding: '0.25rem 0.65rem', borderRadius: '999px', display: 'inline-flex', alignItems: 'center', gap: '0.35rem' }}>
                    <span style={{ width: '6px', height: '6px', borderRadius: '50%', backgroundColor: '#16a34a' }} />
                    In Stock ({remainingStock} available)
                  </span>
                )}
              </div>
            </div>
          </div>

          {/* Streamlined & Punchy Overview (2-3 Sentences Max) */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.85rem' }}>
            <p style={{
              color: '#333333',
              fontSize: '0.94rem',
              lineHeight: 1.65,
              margin: 0,
              fontWeight: 400,
            }}>
              {streamlinedCopy.overview}
            </p>

            {/* Key Highlights (Clean Scannable Bullets) */}
            <div style={{
              backgroundColor: 'var(--surface)',
              border: '1px solid var(--border-color)',
              borderRadius: '8px',
              padding: '0.9rem 1.15rem',
            }}>
              <div style={{ fontSize: '0.76rem', fontWeight: 800, textTransform: 'uppercase', letterSpacing: '0.06em', color: 'var(--text-muted)', marginBottom: '0.45rem' }}>
                Key Highlights
              </div>
              <ul style={{ margin: 0, paddingLeft: '1.1rem', display: 'flex', flexDirection: 'column', gap: '0.35rem', color: '#333333', fontSize: '0.86rem', lineHeight: 1.5 }}>
                {streamlinedCopy.highlights.map((point, idx) => (
                  <li key={idx}>{point}</li>
                ))}
              </ul>
            </div>
          </div>

          {/* Minimal 2-Column Specification Grid */}
          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(2, 1fr)',
            gap: '0.85rem',
            borderTop: '1px solid var(--border-color)',
            borderBottom: '1px solid var(--border-color)',
            padding: '0.85rem 0',
          }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.65rem' }}>
              <Sparkles size={16} color="var(--primary-color)" style={{ flexShrink: 0 }} />
              <div>
                <div style={{ fontSize: '0.7rem', color: 'var(--text-muted)', textTransform: 'uppercase', fontWeight: 700, letterSpacing: '0.05em' }}>Craft</div>
                <div style={{ fontSize: '0.84rem', fontWeight: 600, color: 'var(--text-main)' }}>
                  {craftsmanship || (isCrochet ? 'Hand-Crocheted' : isHandmade ? '100% Handcrafted' : 'Artisan Hand-Finish')}
                </div>
              </div>
            </div>

            <div style={{ display: 'flex', alignItems: 'center', gap: '0.65rem' }}>
              <Feather size={16} color="var(--primary-color)" style={{ flexShrink: 0 }} />
              <div>
                <div style={{ fontSize: '0.7rem', color: 'var(--text-muted)', textTransform: 'uppercase', fontWeight: 700, letterSpacing: '0.05em' }}>Material</div>
                <div style={{ fontSize: '0.84rem', fontWeight: 600, color: 'var(--text-main)' }}>
                  {material || fabric || 'Organic Natural Fiber'}
                </div>
              </div>
            </div>

            <div style={{ display: 'flex', alignItems: 'center', gap: '0.65rem' }}>
              <Award size={16} color="var(--primary-color)" style={{ flexShrink: 0 }} />
              <div>
                <div style={{ fontSize: '0.7rem', color: 'var(--text-muted)', textTransform: 'uppercase', fontWeight: 700, letterSpacing: '0.05em' }}>Classification</div>
                <div style={{ fontSize: '0.84rem', fontWeight: 600, color: 'var(--text-main)' }}>
                  {subcategory || product.category?.name || 'Artisan Drop'}
                </div>
              </div>
            </div>

            <div style={{ display: 'flex', alignItems: 'center', gap: '0.65rem' }}>
              <ShieldCheck size={16} color="var(--primary-color)" style={{ flexShrink: 0 }} />
              <div>
                <div style={{ fontSize: '0.7rem', color: 'var(--text-muted)', textTransform: 'uppercase', fontWeight: 700, letterSpacing: '0.05em' }}>Provenance</div>
                <div style={{ fontSize: '0.84rem', fontWeight: 600, color: 'var(--text-main)' }}>
                  {origin || 'Heritage Artisan Ateliers'}
                </div>
              </div>
            </div>
          </div>

          {/* Clean Inline Dynamic Attribute Selectors (No Double Labels) */}
          {grouped_attributes && Object.keys(grouped_attributes).length > 0 && (() => {
            const lowerKeyMap = {};
            Object.entries(grouped_attributes).forEach(([k, v]) => {
              lowerKeyMap[k.toLowerCase()] = { originalKey: k, values: v };
            });

            const colorEntry = lowerKeyMap['color'];
            const sizeEntry = lowerKeyMap['size'];
            const otherEntries = Object.entries(grouped_attributes).filter(([k]) => {
              const lk = k.toLowerCase();
              if (lk === 'color' || lk === 'size') return false;
              if (storeType === 'clothing') {
                return lk !== 'pieces' && lk !== 'fabric' && lk !== 'origin';
              }
              return true;
            });

            return (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.9rem' }}>
                {/* 1. Color Luxury Swatches Row */}
                {colorEntry && colorEntry.values && colorEntry.values.length > 0 && (
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '0.65rem' }}>
                    <div style={{ display: 'flex', gap: '0.65rem', flexWrap: 'wrap', alignItems: 'center' }}>
                      {(detailedAttrs.color || colorEntry.values.map((v) => ({ value: v, is_available: true }))).map((cObj, cIdx) => {
                        const val = cObj.value;
                        const isSelected = (selectedAttrs[colorEntry.originalKey] || colorEntry.values[0]) === val;
                        const isAvail = cObj.is_available !== false && cObj.is_available !== 0;
                        const hex = getColorHex(val);
                        const isLightColor = hex === '#FFFFFF' || hex === '#FAF9F6' || hex === '#F7F4EE' || hex === '#F4C2C2' || hex === '#D4C5A9';
                        const colorPic = cObj.image_url;

                        return (
                          <button
                            key={val}
                            type="button"
                            onClick={() => {
                              setSelectedAttrs((prev) => ({ ...prev, [colorEntry.originalKey]: val }));
                              if (colorPic) {
                                const matchedIdx = images.findIndex(
                                  (img) =>
                                    img === colorPic ||
                                    img.endsWith(colorPic) ||
                                    colorPic.endsWith(img)
                                );
                                if (matchedIdx !== -1) {
                                  setSelectedImage(matchedIdx);
                                  setActiveColorImage(null);
                                } else {
                                  setActiveColorImage(colorPic);
                                }
                              } else if (images && images.length > 1 && cIdx < images.length) {
                                setSelectedImage(cIdx);
                                setActiveColorImage(null);
                              }
                            }}
                            title={`${val}${!isAvail ? ' • Sold Out' : ' • In Stock'}`}
                            aria-label={`${val}${!isAvail ? ' (Sold Out)' : ''}`}
                            style={{
                              position: 'relative',
                              width: '32px',
                              height: '32px',
                              borderRadius: '50%',
                              backgroundColor: hex,
                              border: isLightColor ? '1px solid #d1d5db' : '1px solid rgba(0, 0, 0, 0.12)',
                              cursor: 'pointer',
                              padding: 0,
                              display: 'inline-flex',
                              alignItems: 'center',
                              justifyContent: 'center',
                              outline: isSelected ? '2px solid var(--primary-color)' : 'none',
                              outlineOffset: '2.5px',
                              boxShadow: isSelected ? '0 0 0 1px #fff, 0 2px 6px rgba(0,0,0,0.18)' : '0 1px 3px rgba(0,0,0,0.08)',
                              transform: isSelected ? 'scale(1.08)' : 'scale(1)',
                              opacity: isAvail ? 1 : 0.45,
                              transition: 'all 0.15s ease',
                            }}
                          >
                            {isSelected && (
                              <span
                                style={{
                                  width: '8px',
                                  height: '8px',
                                  borderRadius: '50%',
                                  backgroundColor: isLightColor ? '#111111' : '#ffffff',
                                  boxShadow: '0 0 2px rgba(0,0,0,0.35)',
                                }}
                              />
                            )}
                            {!isAvail && (
                              <span
                                style={{
                                  position: 'absolute',
                                  top: '50%',
                                  left: '2px',
                                  right: '2px',
                                  height: '2px',
                                  backgroundColor: '#ef4444',
                                  transform: 'rotate(-45deg)',
                                  borderRadius: '1px',
                                  boxShadow: '0 0 2px #fff',
                                }}
                              />
                            )}
                          </button>
                        );
                      })}
                    </div>

                    {/* Color Real-Time Stock Tag */}
                    {currentColorItem && (
                      <span
                        style={{
                          display: 'inline-flex',
                          alignItems: 'center',
                          gap: '0.35rem',
                          fontSize: '0.74rem',
                          fontWeight: 700,
                          padding: '0.2rem 0.65rem',
                          borderRadius: '999px',
                          backgroundColor: currentColorItem.is_available ? 'rgba(16, 185, 129, 0.12)' : 'rgba(239, 68, 68, 0.12)',
                          color: currentColorItem.is_available ? '#059669' : '#dc2626',
                        }}
                      >
                        <span
                          style={{
                            width: '6px',
                            height: '6px',
                            borderRadius: '50%',
                            backgroundColor: currentColorItem.is_available ? '#10b981' : '#ef4444',
                          }}
                        />
                        {currentColorItem.is_available ? 'In Stock' : 'Sold Out for Season'}
                      </span>
                    )}
                  </div>
                )}

                {/* 2. Size Selector Row with Neatly Aligned "Size Guide" on Right & Stock Availability */}
                {sizeEntry && sizeEntry.values && sizeEntry.values.length > 0 && (
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '0.45rem' }}>
                    <div style={{
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'space-between',
                      flexWrap: 'wrap',
                      gap: '0.75rem',
                    }}>
                      <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap', alignItems: 'center' }}>
                        {sizeEntry.values.map((val) => {
                          const detailedSize = detailedAttrs.size?.find((s) => s.value === val);
                          const isAvailable = detailedSize ? (detailedSize.is_available !== false && detailedSize.is_available !== 0) : true;
                          const isSelected = (selectedAttrs[sizeEntry.originalKey] || sizeEntry.values[0]) === val;
                          return (
                            <button
                              key={val}
                              type="button"
                              onClick={() => setSelectedAttrs((prev) => ({ ...prev, [sizeEntry.originalKey]: val }))}
                              style={{
                                minWidth: '42px',
                                height: '36px',
                                padding: '0 0.85rem',
                                borderRadius: '8px',
                                fontSize: '0.86rem',
                                fontWeight: 700,
                                cursor: 'pointer',
                                display: 'inline-flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                                gap: '0.35rem',
                                backgroundColor: isSelected 
                                  ? (isAvailable ? 'var(--primary-color)' : '#DC2626')
                                  : 'var(--surface)',
                                color: isSelected 
                                  ? '#ffffff' 
                                  : (isAvailable ? 'var(--text-main)' : 'var(--text-muted)'),
                                border: isSelected 
                                  ? (isAvailable ? '1px solid var(--primary-color)' : '1px solid #DC2626')
                                  : (isAvailable ? '1px solid var(--border-color)' : '1px dashed #D1D5DB'),
                                opacity: isAvailable ? 1 : 0.65,
                                textDecoration: isAvailable ? 'none' : 'line-through',
                                boxShadow: isSelected ? '0 2px 6px rgba(227, 82, 5, 0.25)' : 'none',
                                transition: 'all 0.15s ease',
                              }}
                              title={isAvailable ? `Size ${val} (In Stock)` : `Size ${val} (Currently Sold Out)`}
                            >
                              <span>{val}</span>
                              {!isAvailable && (
                                <span style={{ fontSize: '0.62rem', fontWeight: 600, textDecoration: 'none' }}>
                                  (Sold Out)
                                </span>
                              )}
                            </button>
                          );
                        })}
                      </div>

                      <button
                        type="button"
                        onClick={() => setIsSizeChartOpen(true)}
                        style={{
                          background: 'transparent',
                          border: 'none',
                          color: 'var(--primary-color, #E35205)',
                          fontSize: '0.82rem',
                          fontWeight: 700,
                          cursor: 'pointer',
                          display: 'flex',
                          alignItems: 'center',
                          gap: '0.35rem',
                          padding: '0.2rem 0',
                        }}
                      >
                        <Ruler size={14} /> Measurement Sheet
                      </button>
                    </div>

                    {/* Active Size Availability Notice */}
                    {currentSizeItem && (
                      <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', fontSize: '0.74rem' }}>
                        <span
                          style={{
                            width: '6px',
                            height: '6px',
                            borderRadius: '50%',
                            backgroundColor: !isSelectedSizeSoldOut ? '#10b981' : '#ef4444',
                            display: 'inline-block',
                          }}
                        />
                        <span style={{ color: !isSelectedSizeSoldOut ? '#059669' : '#dc2626', fontWeight: 600 }}>
                          {!isSelectedSizeSoldOut 
                            ? `Size ${selectedAttrs[sizeEntry.originalKey] || currentSizeItem.value} is in stock`
                            : `Size ${selectedAttrs[sizeEntry.originalKey] || currentSizeItem.value} is currently Sold Out`}
                        </span>
                      </div>
                    )}
                  </div>
                )}

                {/* Quick Measurement Sheet Trigger for Handcrafted Items without Size Variations */}
                {(!sizeEntry || !sizeEntry.values || sizeEntry.values.length === 0) && (
                  <div style={{ margin: '0.2rem 0 0.35rem' }}>
                    <button
                      type="button"
                      onClick={() => setIsSizeChartOpen(true)}
                      style={{
                        background: 'transparent',
                        border: 'none',
                        color: 'var(--primary-color, #E35205)',
                        fontSize: '0.82rem',
                        fontWeight: 700,
                        cursor: 'pointer',
                        display: 'inline-flex',
                        alignItems: 'center',
                        gap: '0.35rem',
                        padding: '0.2rem 0',
                        textDecoration: 'underline',
                        textUnderlineOffset: '3px',
                      }}
                    >
                      <Ruler size={14} /> View Dimensions & Measurement Sheet
                    </button>
                  </div>
                )}

                {/* 3. Single Row of Clean Selector Tags / Pills (Craftsmanship, Fit, Subcategory link/tag, etc.) */}
                {otherEntries.length > 0 && (
                  <div style={{
                    display: 'flex',
                    flexWrap: 'wrap',
                    gap: '0.55rem',
                    alignItems: 'center',
                  }}>
                    {otherEntries.map(([attrName, values]) => {
                      const isSubcategory = attrName.toLowerCase() === 'subcategory';
                      const currentSelectedVal = selectedAttrs[attrName] || values[0];

                      return values.map((val) => {
                        const isSelected = currentSelectedVal === val;
                        const isClickable = values.length > 1 || isSubcategory;

                        return (
                          <button
                            key={`${attrName}-${val}`}
                            type="button"
                            onClick={() => {
                              if (isSubcategory) {
                                navigate('/catalog?category=' + encodeURIComponent(product.category?.slug || ''));
                              } else if (values.length > 1) {
                                setSelectedAttrs((prev) => ({ ...prev, [attrName]: val }));
                              }
                            }}
                            title={isSubcategory ? `Explore ${val} collection` : val}
                            style={{
                              display: 'inline-flex',
                              alignItems: 'center',
                              gap: '0.35rem',
                              padding: '0.38rem 0.85rem',
                              borderRadius: '999px',
                              fontSize: '0.82rem',
                              fontWeight: 600,
                              backgroundColor: isSubcategory
                                ? 'var(--surface)'
                                : isSelected
                                ? 'rgba(227, 82, 5, 0.08)'
                                : 'var(--surface)',
                              color: isSelected && !isSubcategory ? 'var(--primary-color)' : 'var(--text-main)',
                              border: isSelected && !isSubcategory
                                ? '1px solid rgba(227, 82, 5, 0.32)'
                                : '1px solid var(--border-color)',
                              cursor: isClickable ? 'pointer' : 'default',
                              transition: 'all 0.15s ease',
                              textDecoration: 'none',
                            }}
                          >
                            <span>{val}</span>
                          </button>
                        );
                      });
                    })}

                    {/* Jewelry Authenticity Trigger */}
                    {storeType === 'jewelry' && (
                      <button
                        onClick={() => setIsCertOpen(true)}
                        style={{
                          background: 'transparent',
                          border: 'none',
                          color: '#D4AF37',
                          fontSize: '0.8rem',
                          fontWeight: 600,
                          cursor: 'pointer',
                          display: 'flex',
                          alignItems: 'center',
                          gap: '0.3rem',
                          marginLeft: 'auto',
                        }}
                      >
                        <ShieldCheck size={14} /> Certificate
                      </button>
                    )}
                  </div>
                )}
              </div>
            );
          })()}

          {/* Sold-out Size Advisory Message */}
          {isSelectedSizeSoldOut && (
            <div
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '0.65rem',
                backgroundColor: '#fff1f2',
                border: '1px solid #fecdd3',
                padding: '0.8rem 1.1rem',
                borderRadius: 'var(--radius)',
                color: '#be123c',
                fontSize: '0.85rem',
                fontWeight: 600,
                lineHeight: 1.4,
              }}
            >
              <span
                style={{
                  width: '8px',
                  height: '8px',
                  borderRadius: '50%',
                  backgroundColor: '#e11d48',
                  flexShrink: 0,
                }}
              />
              <span>
                Size &ldquo;{selectedAttrs['size']}&rdquo; is currently sold out. Please select another in-stock size above to place your order.
              </span>
            </div>
          )}

          {/* Sold-out Color Advisory Message */}
          {isSelectedColorSoldOut && (
            <div
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '0.65rem',
                backgroundColor: '#fff1f2',
                border: '1px solid #fecdd3',
                padding: '0.8rem 1.1rem',
                borderRadius: 'var(--radius)',
                color: '#be123c',
                fontSize: '0.85rem',
                fontWeight: 600,
                lineHeight: 1.4,
              }}
            >
              <span
                style={{
                  width: '8px',
                  height: '8px',
                  borderRadius: '50%',
                  backgroundColor: '#e11d48',
                  flexShrink: 0,
                }}
              />
              <span>
                The shade &ldquo;{selectedAttrs['color']}&rdquo; is currently sold out for this season. Please choose an in-stock shade above to place your order.
              </span>
            </div>
          )}

          {/* Constrained Stock Advisory (Only shown when inventory is low or maxed) */}
          {(isOutOfStock || isMaxStockInCart || remainingStock <= 5) && (
            <div style={{ marginTop: '0.4rem', marginBottom: '0.2rem' }}>
              {isOutOfStock ? (
                <div style={{ display: 'inline-flex', alignItems: 'center', gap: '0.45rem', backgroundColor: '#fff1f2', border: '1px solid #fecdd3', padding: '0.35rem 0.75rem', borderRadius: '6px', color: '#be123c', fontSize: '0.8rem', fontWeight: 700 }}>
                  <span style={{ width: '6px', height: '6px', borderRadius: '50%', backgroundColor: '#e11d48' }} />
                  <span>Out of Stock — New artisan batch in production</span>
                </div>
              ) : isMaxStockInCart ? (
                <div style={{ display: 'inline-flex', alignItems: 'center', gap: '0.45rem', backgroundColor: '#fff7ed', border: '1px solid #fed7aa', padding: '0.35rem 0.75rem', borderRadius: '6px', color: '#c2410c', fontSize: '0.8rem', fontWeight: 700 }}>
                  <span style={{ width: '6px', height: '6px', borderRadius: '50%', backgroundColor: '#ea580c' }} />
                  <span>All available stock ({productStock}) is already in your shopping bag</span>
                </div>
              ) : (
                <div style={{ display: 'inline-flex', alignItems: 'center', gap: '0.45rem', backgroundColor: '#fff7ed', border: '1px solid #ffedd5', padding: '0.35rem 0.75rem', borderRadius: '6px', color: '#ea580c', fontSize: '0.8rem', fontWeight: 700 }}>
                  <span style={{ width: '6px', height: '6px', borderRadius: '50%', backgroundColor: '#ea580c' }} />
                  <span>Only {remainingStock} left in stock {inCartQty > 0 ? `(${inCartQty} in bag)` : ''} — Order soon</span>
                </div>
              )}
            </div>
          )}

          {/* Quantity and Primary CTA Action Zone */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.85rem', paddingTop: '0.5rem', borderTop: '1px solid var(--border-color)' }}>
            <div style={{ display: 'flex', gap: '0.85rem', alignItems: 'center' }}>
              {/* Quantity Adjuster (Height 52px) */}
              <div style={{
                display: 'flex',
                alignItems: 'center',
                border: '1px solid var(--border-color)',
                borderRadius: '8px',
                overflow: 'hidden',
                height: '52px',
                opacity: isAddToCartDisabled ? 0.45 : 1,
                pointerEvents: isAddToCartDisabled ? 'none' : 'auto',
                backgroundColor: 'var(--surface)',
              }}>
                <button
                  type="button"
                  onClick={() => setQuantity(Math.max(1, quantity - 1))}
                  disabled={quantity <= 1 || isAddToCartDisabled}
                  style={{
                    width: '42px',
                    height: '100%',
                    background: 'transparent',
                    border: 'none',
                    cursor: (quantity <= 1 || isAddToCartDisabled) ? 'not-allowed' : 'pointer',
                    color: (quantity <= 1 || isAddToCartDisabled) ? 'var(--text-muted)' : 'var(--text-main)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    opacity: quantity <= 1 ? 0.4 : 1,
                  }}
                  title="Decrease quantity"
                >
                  <Minus size={15} />
                </button>
                <span style={{ padding: '0 0.85rem', fontWeight: 800, fontSize: '1rem', minWidth: '38px', textAlign: 'center', color: 'var(--text-main)' }}>
                  {quantity}
                </span>
                <button
                  type="button"
                  onClick={() => {
                    if (quantity < remainingStock) {
                      setQuantity(quantity + 1);
                    }
                  }}
                  disabled={quantity >= remainingStock || isAddToCartDisabled}
                  style={{
                    width: '42px',
                    height: '100%',
                    background: 'transparent',
                    border: 'none',
                    cursor: (quantity >= remainingStock || isAddToCartDisabled) ? 'not-allowed' : 'pointer',
                    color: (quantity >= remainingStock || isAddToCartDisabled) ? 'var(--text-muted)' : 'var(--text-main)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    opacity: quantity >= remainingStock ? 0.4 : 1,
                  }}
                  title={quantity >= remainingStock ? `Cannot exceed available stock (${remainingStock})` : 'Increase quantity'}
                >
                  <Plus size={15} />
                </button>
              </div>

              {/* Add to Shopping Bag Button (Prominent 52px High-Priority CTA) */}
              <button
                onClick={handleAddToCart}
                disabled={isAddToCartDisabled}
                className="btn-primary"
                style={{
                  flexGrow: 1,
                  height: '52px',
                  fontSize: '1rem',
                  fontWeight: 800,
                  borderRadius: '8px',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: '0.6rem',
                  opacity: isAddToCartDisabled ? 0.5 : 1,
                  cursor: isAddToCartDisabled ? 'not-allowed' : 'pointer',
                  letterSpacing: '0.01em',
                  boxShadow: isAddToCartDisabled ? 'none' : '0 4px 14px rgba(227, 82, 5, 0.28)',
                }}
              >
                <ShoppingBag size={19} />
                <span>
                  {isOutOfStock
                    ? 'Out of Stock'
                    : isMaxStockInCart
                    ? `Max Stock in Bag (${productStock})`
                    : isSelectedSizeSoldOut
                    ? `Size ${selectedAttrs['size'] || ''} Sold Out`
                    : isSelectedColorSoldOut
                    ? 'Sold Out for Season'
                    : 'Add to Shopping Bag'}
                </span>
              </button>

              {/* Wishlist Heart Button (52px x 52px) */}
              <button
                type="button"
                onClick={() => toggleWishlist(product)}
                aria-label={isInWishlist(product.id) ? 'Remove from Wishlist' : 'Save to Wishlist'}
                title={isInWishlist(product.id) ? 'Remove from Wishlist' : 'Save to Wishlist'}
                style={{
                  width: '52px',
                  height: '52px',
                  borderRadius: '8px',
                  border: isInWishlist(product.id) ? '1px solid #fecdd3' : '1px solid var(--border-color)',
                  backgroundColor: isInWishlist(product.id) ? '#fef2f2' : 'var(--surface)',
                  color: isInWishlist(product.id) ? '#ef4444' : 'var(--text-main)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  cursor: 'pointer',
                  flexShrink: 0,
                  transition: 'all 0.2s ease',
                }}
                onMouseEnter={(e) => (e.currentTarget.style.transform = 'scale(1.05)')}
                onMouseLeave={(e) => (e.currentTarget.style.transform = 'scale(1)')}
              >
                <Heart size={20} fill={isInWishlist(product.id) ? '#ef4444' : 'transparent'} color={isInWishlist(product.id) ? '#ef4444' : 'currentColor'} />
              </button>
            </div>

            {/* Instant Guest Checkout Button */}
            <button
              onClick={handleBuyNow}
              disabled={isAddToCartDisabled}
              className="btn-secondary"
              style={{
                width: '100%',
                height: '48px',
                fontSize: '0.92rem',
                fontWeight: 700,
                borderRadius: '8px',
                opacity: isAddToCartDisabled ? 0.5 : 1,
                cursor: isAddToCartDisabled ? 'not-allowed' : 'pointer',
              }}
            >
              <span>
                {isOutOfStock || isMaxStockInCart
                  ? 'Out of Stock'
                  : isSelectedColorSoldOut
                  ? 'Sold Out — Join Waitlist'
                  : 'Instant Buy with Phone OTP'}
              </span>
            </button>
          </div>

          {/* Secondary Promotional Accordion: FlexiPay Installments (Moved BELOW CTAs) */}
          {storeType === 'clothing' && (
            <div style={{
              border: '1px solid var(--border-color)',
              borderRadius: '8px',
              backgroundColor: 'var(--surface)',
              overflow: 'hidden',
              transition: 'all 0.2s ease',
            }}>
              <button
                type="button"
                onClick={() => setIsInstallmentsExpanded(!isInstallmentsExpanded)}
                style={{
                  width: '100%',
                  padding: '0.75rem 1rem',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  background: 'transparent',
                  border: 'none',
                  cursor: 'pointer',
                  fontSize: '0.82rem',
                  color: 'var(--text-main)',
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                  <Sparkles size={14} color="#E35205" />
                  <span>Pay in 4 installments of <strong>{formatPrice(currentPrice / 4)}</strong> with <strong>FlexiPay</strong></span>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.35rem', color: '#E35205', fontWeight: 700, fontSize: '0.75rem' }}>
                  <span>{isInstallmentsExpanded ? 'Hide Schedule' : 'View Schedule'}</span>
                  {isInstallmentsExpanded ? <ChevronUp size={14} /> : <ChevronDown size={14} />}
                </div>
              </button>

              {isInstallmentsExpanded && (
                <div style={{
                  padding: '0 1rem 0.85rem',
                  borderTop: '1px dashed var(--border-color)',
                  paddingTop: '0.65rem',
                  fontSize: '0.78rem',
                  color: 'var(--text-muted)',
                  display: 'flex',
                  flexDirection: 'column',
                  gap: '0.35rem',
                }}>
                  <div>• 1st installment: <strong>{formatPrice(currentPrice / 4)}</strong> due today on checkout</div>
                  <div>• 2nd installment: <strong>{formatPrice(currentPrice / 4)}</strong> in 30 days</div>
                  <div>• 3rd installment: <strong>{formatPrice(currentPrice / 4)}</strong> in 60 days</div>
                  <div>• 4th installment: <strong>{formatPrice(currentPrice / 4)}</strong> in 90 days</div>
                  <button
                    type="button"
                    onClick={() => setIsFlexiPayOpen(true)}
                    style={{
                      background: 'none',
                      border: 'none',
                      color: '#E35205',
                      fontWeight: 700,
                      cursor: 'pointer',
                      padding: 0,
                      marginTop: '0.25rem',
                      textAlign: 'left',
                      textDecoration: 'underline',
                      fontSize: '0.76rem',
                    }}
                  >
                    Open detailed repayment calculator
                  </button>
                </div>
              )}
            </div>
          )}

          {/* Security & Shipping Directives */}
          <div style={{
            display: 'flex',
            flexDirection: 'column',
            gap: '0.45rem',
            backgroundColor: 'var(--surface)',
            padding: '0.85rem 1rem',
            borderRadius: '8px',
            fontSize: '0.82rem',
            color: 'var(--text-muted)',
            border: '1px solid var(--border-color)',
          }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <Truck size={15} color="var(--primary-color)" />
              <span>Complimentary insured courier delivery dispatch within 24–48 hours across Pakistan.</span>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <RotateCcw size={15} color="var(--primary-color)" />
              <span>14-day hassle-free door-to-door returns and prepaid size exchanges.</span>
            </div>
          </div>
        </div>
      </div>

      {/* Editorial Specification Tabs */}
      <section style={{
        backgroundColor: 'var(--card-bg)',
        border: '1px solid var(--border-color)',
        borderRadius: 'var(--radius, 14px)',
        padding: '2.5rem 2.25rem',
        marginTop: '1.5rem',
        marginBottom: '4.5rem',
        boxShadow: 'var(--shadow-card)',
      }}>
        {/* Tab Headers */}
        <div style={{
          display: 'flex',
          gap: '2rem',
          borderBottom: '1px solid var(--border-color)',
          overflowX: 'auto',
          paddingBottom: '0.85rem',
          marginBottom: '2rem',
          scrollbarWidth: 'none',
        }}>
          {[
            { id: 'description', label: 'Description & Details' },
            { id: 'fabric', label: isJewelry ? 'Metals & Gemstones' : 'Fabric & Care' },
            { id: 'sizing', label: 'Size & Fit' },
            { id: 'shipping', label: 'Shipping & Returns' },
          ].map((tab) => {
            const isActive = activeDetailTab === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveDetailTab(tab.id)}
                style={{
                  background: 'transparent',
                  border: 'none',
                  borderBottom: isActive ? '2px solid var(--primary-color)' : '2px solid transparent',
                  color: isActive ? 'var(--text-main)' : 'var(--text-muted)',
                  fontWeight: isActive ? 800 : 500,
                  fontSize: '0.95rem',
                  padding: '0.4rem 0.25rem',
                  cursor: 'pointer',
                  whiteSpace: 'nowrap',
                  transition: 'all 0.18s ease',
                  letterSpacing: '0.01em',
                }}
              >
                {tab.label}
              </button>
            );
          })}
        </div>

        {/* Tab Content 1: Description & Details */}
        {activeDetailTab === 'description' && (
          <div className="animate-fade-in" style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '2.5rem' }}>
            <div>
              <h3 style={{ fontFamily: 'var(--font-heading)', fontSize: '1.25rem', fontWeight: 800, marginBottom: '0.85rem', color: '#1c1917' }}>
                {isBag
                  ? 'Handcrafted Architecture & Everyday Utility'
                  : isJewelry
                  ? 'Artisanal Proportions & Heritage Setting'
                  : isChildOrBaby
                  ? 'Infant Heirloom Comfort & Gentle Silhouette'
                  : isCrochet
                  ? 'Artisan Knotwork & Flowing Drape'
                  : 'Silhouette, Cut & Tailoring Details'}
              </h3>
              <p style={{ color: '#333333', lineHeight: 1.75, fontSize: '0.92rem', marginBottom: '1.5rem' }}>
                {isBag
                  ? 'Sculpted with reinforced knotwork balance and generous everyday volume. Every handle anchor and base gusset is meticulously engineered for comfort and lasting structure.'
                  : isJewelry
                  ? 'Crafted with royal Mughal-inspired symmetry and lightweight balance. Hand-faceted stones catch radiant ambient light while ensuring complete all-day comfort.'
                  : isChildOrBaby
                  ? 'Designed with delicate infant proportions, non-scratching seams, and expandable diaper ease. Gentle organic fibers wrap your little one in pure breathable comfort.'
                  : isCrochet
                  ? 'Hand-knitted loop-by-loop with subtle natural texture and effortless drape. A modern heirloom designed to transition seamlessly from day into evening.'
                  : 'A classic floor-length paneled silhouette crafted from pure organic cotton, cut with structured panels that flare gracefully from the waist for an effortless, regal presence.'}
              </p>

              {/* Clean 2-column Technical Specifications Matrix */}
              <div style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))',
                gap: '0.85rem 1.25rem',
                fontSize: '0.84rem',
                backgroundColor: 'var(--surface)',
                padding: '1.25rem',
                borderRadius: '10px',
                border: '1px solid var(--border-color)',
              }}>
                <div>
                  <span style={{ color: 'var(--text-muted)', fontSize: '0.74rem', textTransform: 'uppercase', letterSpacing: '0.05em', display: 'block', marginBottom: '0.2rem' }}>Category Capsule</span>
                  <span style={{ fontWeight: 700, color: '#1c1917' }}>{product.category?.name || 'Artisan Collection'}</span>
                </div>
                <div>
                  <span style={{ color: 'var(--text-muted)', fontSize: '0.74rem', textTransform: 'uppercase', letterSpacing: '0.05em', display: 'block', marginBottom: '0.2rem' }}>SKU Code</span>
                  <span style={{ fontWeight: 700, color: '#1c1917', fontFamily: 'monospace' }}>{product.sku || 'KHM-PK-2026'}</span>
                </div>
                <div>
                  <span style={{ color: 'var(--text-muted)', fontSize: '0.74rem', textTransform: 'uppercase', letterSpacing: '0.05em', display: 'block', marginBottom: '0.2rem' }}>Silhouette / Fit</span>
                  <span style={{ fontWeight: 700, color: '#1c1917' }}>{isBag ? 'Structured Tote' : isJewelry ? 'Chandbali Drop' : isChildOrBaby ? 'Relaxed Infant A-Line' : 'Flared Paneled Pishwas'}</span>
                </div>
                <div>
                  <span style={{ color: 'var(--text-muted)', fontSize: '0.74rem', textTransform: 'uppercase', letterSpacing: '0.05em', display: 'block', marginBottom: '0.2rem' }}>Craft Technique</span>
                  <span style={{ fontWeight: 700, color: '#1c1917' }}>{isBag ? 'Single-needle Crochet' : isJewelry ? 'Hand Kundan Polki' : 'Ancestral Pit Loom & Zardozi'}</span>
                </div>
                <div>
                  <span style={{ color: 'var(--text-muted)', fontSize: '0.74rem', textTransform: 'uppercase', letterSpacing: '0.05em', display: 'block', marginBottom: '0.2rem' }}>Finished Edging</span>
                  <span style={{ fontWeight: 700, color: '#1c1917' }}>{isBag ? 'Reinforced Webbing' : isJewelry ? 'Meenakari Reverse' : 'Cowrie Buttons & Tonal Piping'}</span>
                </div>
                <div>
                  <span style={{ color: 'var(--text-muted)', fontSize: '0.74rem', textTransform: 'uppercase', letterSpacing: '0.05em', display: 'block', marginBottom: '0.2rem' }}>Artisan Origin</span>
                  <span style={{ fontWeight: 700, color: '#1c1917' }}>{origin || 'Multan & Bahawalpur Ateliers'}</span>
                </div>
              </div>
            </div>

            <div style={{ backgroundColor: 'var(--surface)', padding: '1.75rem', borderRadius: 'var(--radius, 12px)', border: '1px solid var(--border-color)' }}>
              <h4 style={{ fontSize: '0.98rem', fontWeight: 800, marginBottom: '1.1rem', display: 'flex', alignItems: 'center', gap: '0.5rem', color: '#1c1917' }}>
                <Sparkles size={17} color="var(--primary-color)" /> Key Artisan Highlights
              </h4>
              <ul style={{ listStyle: 'none', padding: 0, margin: 0, display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                {(isBag ? [
                  '100% sustainable organic cotton cord or pure fabric base',
                  'Individually hand-crocheted and tailored stitch-by-stitch by master women artisans',
                  'Reinforced base gusset and durable handle anchors prevent sagging when filled',
                  'Fully lined interior with quick-access pockets for smartphone, wallet, and keys',
                  'Pre-tested weight capacity for everyday daily utility and travel comfort',
                ] : isJewelry ? [
                  '100% premium silk resham & organic cotton embroidery thread wrapping',
                  'Individually hand-crafted stitch-by-stitch by skilled artisan women',
                  'Lightweight, comfortable, and gentle on skin for long festive wear',
                  'Finished with delicate handmade beads, ghungroos, and mirror accents',
                  'Custom artisan colorways designed to complement traditional pret and formal wear',
                ] : isChildOrBaby ? [
                  'Knitted from hypoallergenic organic bamboo wool and combed cotton yarn',
                  'Ultra-gentle, non-abrasive, zero-scratch feel against infant skin',
                  'Generous natural stretch weave and relaxed cut for diaper ease',
                  'Baby-safe smooth wooden or mother-of-pearl buttons',
                  'Pre-shrunk and color-fast with baby-safe non-toxic dyes',
                ] : [
                  'Hand-embroidered mirrorwork and zari accents along the yoke, chest, and hem',
                  'Vibrant multicolored threadwork featuring shades of magenta, teal, and green',
                  'Finished with delicate handmade cowrie-shell buttons and tonal piping',
                  '100% pure high-thread-count natural organic cotton lawn base',
                  'Pre-shrunk combed weave to ensure shape retention and brilliant color fastness',
                ]).map((highlight, idx) => (
                  <li key={idx} style={{ display: 'flex', alignItems: 'flex-start', gap: '0.65rem', fontSize: '0.88rem', color: '#333333', lineHeight: 1.6 }}>
                    <span style={{
                      width: '18px',
                      height: '18px',
                      borderRadius: '50%',
                      backgroundColor: 'rgba(227, 82, 5, 0.1)',
                      color: 'var(--primary-color)',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      flexShrink: 0,
                      marginTop: '0.15rem',
                      fontSize: '0.7rem',
                      fontWeight: 800,
                    }}>
                      ✓
                    </span>
                    <span>{highlight}</span>
                  </li>
                ))}
              </ul>
            </div>
          </div>
        )}

        {/* Tab Content 2: Fabric & Care */}
        {activeDetailTab === 'fabric' && (
          <div className="animate-fade-in" style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '2.5rem' }}>
            <div>
              <h3 style={{ fontFamily: 'var(--font-heading)', fontSize: '1.25rem', fontWeight: 800, marginBottom: '0.85rem', color: '#1c1917' }}>
                {isJewelry ? 'Metals & Gemstone Provenance' : 'Yarn & Textile Provenance'}
              </h3>
              <p style={{ color: '#333333', lineHeight: 1.75, fontSize: '0.92rem', marginBottom: '1.25rem' }}>
                {isBag ? (
                  'Spun exclusively from sustainable organic cotton cords and natural fibers. Finished with eco-friendly natural bamboo or solid wood handles and organic cotton interior lining.'
                ) : isJewelry ? (
                  'Forged from solid hypoallergenic brass core with multi-layer 22K gold electroplating. Embellished with uncut polki stones and genuine hand-painted meenakari enamels.'
                ) : isChildOrBaby ? (
                  'Certified organic bamboo and combed cotton yarns, spun specifically for baby knitwear. Free from synthetic chemical sizing, phthalates, and harsh dyes.'
                ) : (
                  'Crafted from 100% pure organic cotton lawn and katan raw silks, hand-dyed with gentle color-fast heritage dyes that breathe easily across all seasons.'
                )}
              </p>
              {(grouped_attributes?.fabric || material || fabric) && (
                <div style={{ marginBottom: '1rem' }}>
                  <strong style={{ fontSize: '0.85rem', color: '#1c1917', display: 'block', marginBottom: '0.4rem' }}>Primary Material Classification:</strong>
                  <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap' }}>
                    <span style={{ backgroundColor: 'var(--surface)', border: '1px solid var(--border-color)', padding: '0.35rem 0.85rem', borderRadius: '6px', fontSize: '0.84rem', fontWeight: 700, color: '#1c1917' }}>
                      {material || fabric || '100% Organic Natural Yarn'}
                    </span>
                  </div>
                </div>
              )}
            </div>

            <div style={{ backgroundColor: 'var(--surface)', padding: '1.75rem', borderRadius: 'var(--radius, 12px)', border: '1px solid var(--border-color)' }}>
              <h4 style={{ fontSize: '0.98rem', fontWeight: 800, marginBottom: '1.1rem', color: '#1c1917' }}>
                Care & Longevity Protocol
              </h4>
              <ul style={{ listStyle: 'none', padding: 0, margin: 0, display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                {(isBag ? [
                  'Spot clean with a damp microfiber cloth and mild organic detergent.',
                  'Reshape while damp and dry flat in natural shade (avoid direct sun).',
                  'Do not machine wash, tumble dry, or wring to preserve weave structure.',
                  'Store stuffed with tissue paper inside signature dust bag when not in use.',
                ] : isJewelry ? [
                  'Keep away from moisture, direct water, perfume sprays, and hairspray.',
                  'Wipe gently with a soft microfiber cloth after each wear to remove oils.',
                  'Store individually inside the provided velvet pouch to prevent scratches.',
                  'Do not clean with harsh abrasive chemical jewelry cleaners.',
                ] : isChildOrBaby ? [
                  'Gentle hand wash in lukewarm water (max 30°C) with baby-safe liquid detergent.',
                  'Do not bleach, wring, or tumble dry.',
                  'Gently squeeze excess water and dry flat on a clean towel in shade.',
                  'Cool iron with protective press cloth if needed.',
                ] : [
                  'Gentle cold hand wash or eco dry clean recommended to protect delicate threadwork.',
                  'Do not bleach or expose to harsh chemical stain removers.',
                  'Low to medium heat iron on the reverse side of embroidery motifs.',
                  'Dry flat in shade to preserve brilliant color vibrancy and garment shape.',
                ]).map((tip, idx) => (
                  <li key={idx} style={{ display: 'flex', alignItems: 'flex-start', gap: '0.65rem', fontSize: '0.88rem', color: '#333333', lineHeight: 1.6 }}>
                    <span style={{
                      width: '18px',
                      height: '18px',
                      borderRadius: '50%',
                      backgroundColor: 'rgba(227, 82, 5, 0.1)',
                      color: 'var(--primary-color)',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      flexShrink: 0,
                      marginTop: '0.15rem',
                      fontSize: '0.7rem',
                      fontWeight: 800,
                    }}>
                      •
                    </span>
                    <span>{tip}</span>
                  </li>
                ))}
              </ul>
            </div>
          </div>
        )}

        {/* Tab Content 3: Sizing */}
        {activeDetailTab === 'sizing' && (
          <div className="animate-fade-in" style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '1rem' }}>
              <div>
                <h3 style={{ fontFamily: 'var(--font-heading)', fontSize: '1.25rem', fontWeight: 800, color: '#1c1917' }}>
                  {isCap
                    ? 'Crochet Cap & Beanie Measurement Specifications'
                    : isCrochetBag
                    ? 'Artisanal Crochet Bag Dimensions & Capacity'
                    : isFabricBag
                    ? 'Handcrafted Fabric Bag Dimensions & Capacity'
                    : isJewelry
                    ? 'Handmade Thread Jewellery Measurement & Fit Sheet'
                    : isChildOrBaby
                    ? 'Kids Handmade Crochet Age Sizing Matrix'
                    : 'Hand-Embroidered Stitched Dress & Pishwas Specifications'}
                </h3>
                <p style={{ color: '#555555', fontSize: '0.88rem', marginTop: '0.25rem' }}>
                  {isCap
                    ? 'Hand-knitted with soft breathable cotton and cashmere-touch yarn for gentle, non-slip comfort without tight headache pressure.'
                    : isCrochetBag
                    ? 'Hand-hooked with 100% pure organic cotton yarn & macramé cord with flexible stitch memory for everyday utility.'
                    : isFabricBag
                    ? 'Crafted with premium reinforced cotton canvas, fine hand embroidery, and durable double-stitched lining.'
                    : isJewelry
                    ? 'Hand-wound using pure Resham silk thread, featherlight brass core, and skin-friendly hypoallergenic findings.'
                    : isChildOrBaby
                    ? 'Tailored with generous diaper allowance and gentle hypoallergenic stretch for sensitive baby skin.'
                    : 'Artisanal Pakistani cut with graceful flare and 1.5-inch inner alteration margins. Model is 5\'8" wearing size S.'}
                </p>
              </div>
              <button
                onClick={() => setIsSizeChartOpen(true)}
                className="btn-secondary"
                style={{ fontSize: '0.84rem', padding: '0.5rem 1.1rem', display: 'flex', alignItems: 'center', gap: '0.4rem' }}
              >
                <Ruler size={15} /> Open Interactive Measurement Chart
              </button>
            </div>

            {/* Case 1: Crochet Caps & Beanies */}
            {isCap && (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
                <div style={{ overflowX: 'auto' }}>
                  <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.86rem', textAlign: 'left' }}>
                    <thead>
                      <tr style={{ backgroundColor: 'var(--surface)', borderBottom: '2px solid var(--border-color)' }}>
                        <th style={{ padding: '0.75rem 1rem', fontWeight: 700 }}>Profile / Fit Type</th>
                        <th style={{ padding: '0.75rem 1rem', fontWeight: 700 }}>Head Circumference</th>
                        <th style={{ padding: '0.75rem 1rem', fontWeight: 700 }}>Crown Depth</th>
                        <th style={{ padding: '0.75rem 1rem', fontWeight: 700 }}>Ribbed Rim</th>
                        <th style={{ padding: '0.75rem 1rem', fontWeight: 700 }}>Recommended Fit & Stretch</th>
                      </tr>
                    </thead>
                    <tbody>
                      {[
                        { fit: 'Adult Standard (Free Stretch)', circ: '21 – 23 in / 53 – 59 cm', depth: '8.0 in / 20.5 cm', rim: '2.0 in / 5.0 cm (Rollable)', note: 'Universal adult fit (Men & Women); gentle non-slip grip' },
                        { fit: 'Adult Snug Traditional', circ: '20 – 22 in / 51 – 56 cm', depth: '7.5 in / 19.0 cm', rim: '1.5 in / 4.0 cm (Fitted)', note: 'Close-to-head traditional textured prayer cap / topi style' },
                        { fit: 'Youth & Teens', circ: '19 – 21 in / 48 – 53 cm', depth: '7.0 in / 18.0 cm', rim: '1.5 in / 4.0 cm (Soft Rib)', note: 'Teenagers & smaller crown profiles with natural elasticity' },
                        { fit: 'Kids / Toddler', circ: '17 – 19 in / 43 – 48 cm', depth: '6.0 in / 15.0 cm', rim: '1.2 in / 3.0 cm (Non-itch)', note: 'Ages 2 – 6 years; extra gentle tension-free ribbed band' },
                      ].map((row, idx) => (
                        <tr key={row.fit} style={{ borderBottom: '1px solid var(--border-color)', backgroundColor: idx % 2 === 0 ? 'transparent' : 'var(--surface)' }}>
                          <td style={{ padding: '0.75rem 1rem', fontWeight: 800 }}>{row.fit}</td>
                          <td style={{ padding: '0.75rem 1rem', color: 'var(--text-muted)' }}>{row.circ}</td>
                          <td style={{ padding: '0.75rem 1rem', color: 'var(--text-muted)' }}>{row.depth}</td>
                          <td style={{ padding: '0.75rem 1rem', color: 'var(--text-muted)' }}>{row.rim}</td>
                          <td style={{ padding: '0.75rem 1rem', color: 'var(--text-muted)' }}>{row.note}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>

                <div style={{ backgroundColor: 'var(--surface)', padding: '1rem', borderRadius: 'var(--radius)', fontSize: '0.82rem', color: '#555555' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.45rem', color: 'var(--text-main)', fontWeight: 700, marginBottom: '0.35rem' }}>
                    <CheckCircle2 size={14} color="var(--primary-color)" /> Cap Comfort & Organic Stretch Promise:
                  </div>
                  <span>Handmade crochet caps naturally stretch up to 2.5 inches (6 cm) to gently hug the contours of your head without slipping or creating pressure marks.</span>
                </div>
              </div>
            )}

            {/* Case 2: Crochet Bags */}
            {isCrochetBag && (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
                <div style={{ overflowX: 'auto' }}>
                  <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.86rem', textAlign: 'left' }}>
                    <thead>
                      <tr style={{ backgroundColor: 'var(--surface)', borderBottom: '2px solid var(--border-color)' }}>
                        <th style={{ padding: '0.75rem 1rem', fontWeight: 700 }}>Bag Style</th>
                        <th style={{ padding: '0.75rem 1rem', fontWeight: 700 }}>Height</th>
                        <th style={{ padding: '0.75rem 1rem', fontWeight: 700 }}>Width</th>
                        <th style={{ padding: '0.75rem 1rem', fontWeight: 700 }}>Handle / Strap Drop</th>
                        <th style={{ padding: '0.75rem 1rem', fontWeight: 700 }}>Everyday Fit & Capacity</th>
                      </tr>
                    </thead>
                    <tbody>
                      {[
                        { style: 'Crochet Tote Bag', h: '14 in / 36 cm', w: '13 in / 33 cm', drop: '10 in / 25 cm (Shoulder)', cap: 'Fits iPad, A5 journal, makeup pouch, water bottle & full wallet' },
                        { style: 'Floral Granny Square Bag', h: '12 in / 30 cm', w: '12 in / 30 cm', drop: '9 in / 23 cm (Forearm)', cap: 'Fits Kindle, continental wallet, sunglasses, keys & smartphone' },
                        { style: 'Mini Shoulder Crochet Bag', h: '7.5 in / 19 cm', w: '8.5 in / 22 cm', drop: '19 in / 48 cm (Crossbody)', cap: 'Fits iPhone 16 Pro Max, cardholder, lipgloss & car keys' },
                        { style: 'Potli Crochet Bag', h: '9 in / 23 cm', w: '7.5 in / 19 cm', drop: '7 in / 18 cm (Drawstring)', cap: 'Festive bag fitting smartphone, compact mirror, currency & lipstick' },
                      ].map((row, idx) => (
                        <tr key={row.style} style={{ borderBottom: '1px solid var(--border-color)', backgroundColor: idx % 2 === 0 ? 'transparent' : 'var(--surface)' }}>
                          <td style={{ padding: '0.75rem 1rem', fontWeight: 800 }}>{row.style}</td>
                          <td style={{ padding: '0.75rem 1rem', color: 'var(--text-muted)' }}>{row.h}</td>
                          <td style={{ padding: '0.75rem 1rem', color: 'var(--text-muted)' }}>{row.w}</td>
                          <td style={{ padding: '0.75rem 1rem', color: 'var(--text-muted)' }}>{row.drop}</td>
                          <td style={{ padding: '0.75rem 1rem', color: 'var(--text-muted)' }}>{row.cap}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>

                {/* What Fits Inside Checklist */}
                <div style={{ backgroundColor: 'var(--surface)', padding: '1.25rem', borderRadius: 'var(--radius)', border: '1px solid var(--border-color)' }}>
                  <h4 style={{ fontSize: '0.9rem', fontWeight: 700, marginBottom: '0.5rem', color: 'var(--text-main)', display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                    <Package size={15} color="var(--primary-color)" /> What Fits Inside This Crochet Bag:
                  </h4>
                  <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '0.5rem', fontSize: '0.84rem', color: '#555555' }}>
                    <div>📱 Smartphone (iPhone 16 Pro Max / Galaxy Ultra)</div>
                    <div>👛 Full-size continental or compact wallet</div>
                    <div>💄 Cosmetic pouch, lip balm & compact mirror</div>
                    <div>🕶️ Sunglasses in hard case & car keys</div>
                    <div>📖 Kindle paperwhite or A5 journal</div>
                    <div>🎧 AirPods & portable power bank</div>
                  </div>
                </div>
              </div>
            )}

            {/* Case 3: Fabric Bags */}
            {isFabricBag && (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
                <div style={{ overflowX: 'auto' }}>
                  <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.86rem', textAlign: 'left' }}>
                    <thead>
                      <tr style={{ backgroundColor: 'var(--surface)', borderBottom: '2px solid var(--border-color)' }}>
                        <th style={{ padding: '0.75rem 1rem', fontWeight: 700 }}>Bag Style</th>
                        <th style={{ padding: '0.75rem 1rem', fontWeight: 700 }}>Height</th>
                        <th style={{ padding: '0.75rem 1rem', fontWeight: 700 }}>Width</th>
                        <th style={{ padding: '0.75rem 1rem', fontWeight: 700 }}>Base Gusset</th>
                        <th style={{ padding: '0.75rem 1rem', fontWeight: 700 }}>Strap Drop</th>
                        <th style={{ padding: '0.75rem 1rem', fontWeight: 700 }}>Capacity & Everyday Storage</th>
                      </tr>
                    </thead>
                    <tbody>
                      {[
                        { style: 'Floral Fabric Tote Bag', h: '15 in / 38 cm', w: '14 in / 36 cm', g: '4 in / 10 cm', drop: '11 in / 28 cm', cap: 'Fits 14-inch Laptop, A4 binders, planner & water bottle' },
                        { style: 'Quilted Shoulder Bag', h: '11 in / 28 cm', w: '13 in / 33 cm', g: '3.5 in / 9 cm', drop: '10 in / 25 cm', cap: 'Padded body cushions contents; interior zip pocket for valuables' },
                        { style: 'School / Work Fabric Bag', h: '16 in / 41 cm', w: '14.5 in / 37 cm', g: '4.5 in / 11 cm', drop: '12 in / 30 cm', cap: 'Dual-compartment interior designed for heavy books & tech' },
                        { style: 'Traditional Daily Bag', h: '13 in / 33 cm', w: '12 in / 30 cm', g: '3 in / 8 cm', drop: '9 in / 23 cm', cap: 'Lightweight casual ethnic tote for everyday market outings' },
                      ].map((row, idx) => (
                        <tr key={row.style} style={{ borderBottom: '1px solid var(--border-color)', backgroundColor: idx % 2 === 0 ? 'transparent' : 'var(--surface)' }}>
                          <td style={{ padding: '0.75rem 1rem', fontWeight: 800 }}>{row.style}</td>
                          <td style={{ padding: '0.75rem 1rem', color: 'var(--text-muted)' }}>{row.h}</td>
                          <td style={{ padding: '0.75rem 1rem', color: 'var(--text-muted)' }}>{row.w}</td>
                          <td style={{ padding: '0.75rem 1rem', color: 'var(--text-muted)' }}>{row.g}</td>
                          <td style={{ padding: '0.75rem 1rem', color: 'var(--text-muted)' }}>{row.drop}</td>
                          <td style={{ padding: '0.75rem 1rem', color: 'var(--text-muted)' }}>{row.cap}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>

                <div style={{ backgroundColor: 'var(--surface)', padding: '1rem', borderRadius: 'var(--radius)', fontSize: '0.82rem', color: '#555555' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.45rem', color: 'var(--text-main)', fontWeight: 700, marginBottom: '0.35rem' }}>
                    <CheckCircle2 size={14} color="var(--primary-color)" /> Canvas Durability Promise:
                  </div>
                  <span>Crafted from heavy-duty pre-shrunk cotton canvas with double-reinforced X-box handle stitching supporting up to 8 kg load.</span>
                </div>
              </div>
            )}

            {/* Case 4: Thread Jewellery */}
            {isJewelry && (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
                <div style={{ overflowX: 'auto' }}>
                  <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.86rem', textAlign: 'left' }}>
                    <thead>
                      <tr style={{ backgroundColor: 'var(--surface)', borderBottom: '2px solid var(--border-color)' }}>
                        <th style={{ padding: '0.75rem 1rem', fontWeight: 700 }}>Jewellery Piece</th>
                        <th style={{ padding: '0.75rem 1rem', fontWeight: 700 }}>Size / Metric</th>
                        <th style={{ padding: '0.75rem 1rem', fontWeight: 700 }}>Dimensions</th>
                        <th style={{ padding: '0.75rem 1rem', fontWeight: 700 }}>Weight per Piece</th>
                        <th style={{ padding: '0.75rem 1rem', fontWeight: 700 }}>Ergonomic Specifications</th>
                      </tr>
                    </thead>
                    <tbody>
                      {[
                        { piece: 'Thread Jhumkas & Earrings', size: 'Standard Drop', dim: '3.0 in / 7.5 cm Drop, 1.4 in / 3.5 cm Dome', wt: '9g – 11g per ear', spec: 'Featherlight silk dome; no earlobe drooping or soreness' },
                        { piece: 'Resham Choker / Necklace', size: 'Adjustable', dim: '12 in / 30 cm choker + 8 in / 20 cm dori', wt: '22g total', spec: 'Soft silk cord with adjustable drawstring dori fits any neck size' },
                        { piece: 'Thread Bangles (Size 2.4)', size: 'Small', dim: '2.25 in / 5.7 cm Inner Diameter', wt: '14g (Pair)', spec: 'For delicate small wrists (Wrist circumference 5.5" – 6.0")' },
                        { piece: 'Thread Bangles (Size 2.6)', size: 'Medium (Standard)', dim: '2.37 in / 6.0 cm Inner Diameter', wt: '16g (Pair)', spec: 'Most popular Pakistani standard fit (Wrist 6.0" – 6.5")' },
                        { piece: 'Thread Bangles (Size 2.8)', size: 'Large', dim: '2.50 in / 6.4 cm Inner Diameter', wt: '18g (Pair)', spec: 'Comfort slip-on for broad wrists (Wrist 6.5" – 7.2")' },
                      ].map((row, idx) => (
                        <tr key={row.piece} style={{ borderBottom: '1px solid var(--border-color)', backgroundColor: idx % 2 === 0 ? 'transparent' : 'var(--surface)' }}>
                          <td style={{ padding: '0.75rem 1rem', fontWeight: 800 }}>{row.piece}</td>
                          <td style={{ padding: '0.75rem 1rem', color: 'var(--text-muted)' }}>{row.size}</td>
                          <td style={{ padding: '0.75rem 1rem', color: 'var(--text-muted)' }}>{row.dim}</td>
                          <td style={{ padding: '0.75rem 1rem', color: 'var(--text-muted)' }}>{row.wt}</td>
                          <td style={{ padding: '0.75rem 1rem', color: 'var(--text-muted)' }}>{row.spec}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>

                <div style={{ backgroundColor: 'var(--surface)', padding: '1rem', borderRadius: 'var(--radius)', fontSize: '0.82rem', color: '#555555' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.45rem', color: 'var(--text-main)', fontWeight: 700, marginBottom: '0.35rem' }}>
                    <Sparkles size={14} color="var(--primary-color)" /> Bangle Sizing Tip:
                  </div>
                  <span>Measure the inside diameter of your existing well-fitting bangle across the center. 2.25" is size 2.4, 2.37" is size 2.6, and 2.50" is size 2.8.</span>
                </div>
              </div>
            )}

            {/* Case 5: Kids Crochet Tops & Frocks */}
            {isChildOrBaby && (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
                <div style={{ overflowX: 'auto' }}>
                  <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.86rem', textAlign: 'left' }}>
                    <thead>
                      <tr style={{ backgroundColor: 'var(--surface)', borderBottom: '2px solid var(--border-color)' }}>
                        <th style={{ padding: '0.75rem 1rem', fontWeight: 700 }}>Age Bracket</th>
                        <th style={{ padding: '0.75rem 1rem', fontWeight: 700 }}>Chest</th>
                        <th style={{ padding: '0.75rem 1rem', fontWeight: 700 }}>Dress / Shirt Length</th>
                        <th style={{ padding: '0.75rem 1rem', fontWeight: 700 }}>Child Height</th>
                        <th style={{ padding: '0.75rem 1rem', fontWeight: 700 }}>Fit Guidance</th>
                      </tr>
                    </thead>
                    <tbody>
                      {[
                        { age: '0 – 6 Months', chest: '16 in / 40 cm', length: '13 in / 33 cm', height: '55 – 68 cm', fit: 'Gentle newborn stretch, easy overhead dressing' },
                        { age: '6 – 12 Months', chest: '18 in / 46 cm', length: '15 in / 38 cm', height: '68 – 76 cm', fit: 'Extra diaper room and crawl-friendly flare' },
                        { age: '1 – 2 Years', chest: '20 in / 51 cm', length: '17 in / 43 cm', height: '76 – 86 cm', fit: 'Toddler walking cut, non-trip hemline' },
                        { age: '2 – 3 Years', chest: '22 in / 56 cm', length: '20 in / 51 cm', height: '86 – 98 cm', fit: 'Playful heirloom twirl frock' },
                        { age: '3 – 4 Years', chest: '23.5 in / 60 cm', length: '22 in / 56 cm', height: '98 – 108 cm', fit: 'Partywear comfort with breathable armholes' },
                      ].map((row, idx) => (
                        <tr key={row.age} style={{ borderBottom: '1px solid var(--border-color)', backgroundColor: idx % 2 === 0 ? 'transparent' : 'var(--surface)' }}>
                          <td style={{ padding: '0.75rem 1rem', fontWeight: 800 }}>{row.age}</td>
                          <td style={{ padding: '0.75rem 1rem', color: 'var(--text-muted)' }}>{row.chest}</td>
                          <td style={{ padding: '0.75rem 1rem', color: 'var(--text-muted)' }}>{row.length}</td>
                          <td style={{ padding: '0.75rem 1rem', color: 'var(--text-muted)' }}>{row.height}</td>
                          <td style={{ padding: '0.75rem 1rem', color: 'var(--text-muted)' }}>{row.fit}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>

                <div style={{ backgroundColor: 'var(--surface)', padding: '1rem', borderRadius: 'var(--radius)', fontSize: '0.82rem', color: '#555555' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.45rem', color: 'var(--text-main)', fontWeight: 700, marginBottom: '0.35rem' }}>
                    <CheckCircle2 size={14} color="var(--primary-color)" /> Infant Skin & Comfort Promise:
                  </div>
                  <span>All baby knitwear and dresses are crafted with hypoallergenic combed yarn, flat non-chafing seams, and smooth baby-safe wooden or mother-of-pearl buttons.</span>
                </div>
              </div>
            )}

            {/* Case 6: Hand-Embroidered Stitched Dresses & Pishwas */}
            {isDress && (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
                <div style={{ overflowX: 'auto' }}>
                  <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.86rem', textAlign: 'left' }}>
                    <thead>
                      <tr style={{ backgroundColor: 'var(--surface)', borderBottom: '2px solid var(--border-color)' }}>
                        <th style={{ padding: '0.75rem 1rem', fontWeight: 700 }}>Size</th>
                        <th style={{ padding: '0.75rem 1rem', fontWeight: 700 }}>Chest / Bust</th>
                        <th style={{ padding: '0.75rem 1rem', fontWeight: 700 }}>Shoulder Width</th>
                        <th style={{ padding: '0.75rem 1rem', fontWeight: 700 }}>Dress Length</th>
                        <th style={{ padding: '0.75rem 1rem', fontWeight: 700 }}>Sleeve Length</th>
                        <th style={{ padding: '0.75rem 1rem', fontWeight: 700 }}>Flare / Ghera</th>
                        <th style={{ padding: '0.75rem 1rem', fontWeight: 700 }}>Trouser Length</th>
                      </tr>
                    </thead>
                    <tbody>
                      {[
                        { size: 'XS', chest: '36 in / 91 cm', shoulder: '14.5 in / 37 cm', length: '48 in / 122 cm', sleeve: '21.0 in / 53 cm', flare: '110 in / 280 cm', trouser: '37 in / 94 cm' },
                        { size: 'S', chest: '38 in / 96 cm', shoulder: '15.0 in / 38 cm', length: '49 in / 124 cm', sleeve: '21.5 in / 55 cm', flare: '115 in / 292 cm', trouser: '38 in / 96 cm' },
                        { size: 'M', chest: '40 in / 102 cm', shoulder: '15.5 in / 39 cm', length: '50 in / 127 cm', sleeve: '22.0 in / 56 cm', flare: '120 in / 305 cm', trouser: '39 in / 99 cm' },
                        { size: 'L', chest: '43 in / 109 cm', shoulder: '16.0 in / 41 cm', length: '50 in / 127 cm', sleeve: '22.5 in / 57 cm', flare: '125 in / 317 cm', trouser: '40 in / 102 cm' },
                        { size: 'XL', chest: '46 in / 117 cm', shoulder: '16.5 in / 42 cm', length: '51 in / 130 cm', sleeve: '23.0 in / 58 cm', flare: '130 in / 330 cm', trouser: '40 in / 102 cm' },
                      ].map((row, idx) => (
                        <tr key={row.size} style={{ borderBottom: '1px solid var(--border-color)', backgroundColor: idx % 2 === 0 ? 'transparent' : 'var(--surface)' }}>
                          <td style={{ padding: '0.75rem 1rem', fontWeight: 800 }}>{row.size}</td>
                          <td style={{ padding: '0.75rem 1rem', color: 'var(--text-muted)' }}>{row.chest}</td>
                          <td style={{ padding: '0.75rem 1rem', color: 'var(--text-muted)' }}>{row.shoulder}</td>
                          <td style={{ padding: '0.75rem 1rem', color: 'var(--text-muted)' }}>{row.length}</td>
                          <td style={{ padding: '0.75rem 1rem', color: 'var(--text-muted)' }}>{row.sleeve}</td>
                          <td style={{ padding: '0.75rem 1rem', color: 'var(--text-muted)' }}>{row.flare}</td>
                          <td style={{ padding: '0.75rem 1rem', color: 'var(--text-muted)' }}>{row.trouser}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>

                <div style={{ backgroundColor: 'var(--surface)', padding: '1rem', borderRadius: 'var(--radius)', fontSize: '0.82rem', color: '#555555' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.45rem', color: 'var(--text-main)', fontWeight: 700, marginBottom: '0.35rem' }}>
                    <CheckCircle2 size={14} color="var(--primary-color)" /> Custom Alteration Margins:
                  </div>
                  <span>Every hand-embroidered stitched dress features 1.5 inches of generous inner side seam allowance for effortless personalized alteration.</span>
                </div>
              </div>
            )}
          </div>
        )}

        {/* Tab Content 4: Shipping & Returns */}
        {activeDetailTab === 'shipping' && (
          <div className="animate-fade-in" style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '2rem' }}>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
              <div style={{ display: 'flex', gap: '0.85rem', alignItems: 'flex-start' }}>
                <div style={{ width: '40px', height: '40px', borderRadius: '10px', backgroundColor: 'var(--surface)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0, border: '1px solid var(--border-color)' }}>
                  <Truck size={20} color="var(--primary-color)" />
                </div>
                <div>
                  <h4 style={{ fontSize: '0.98rem', fontWeight: 800, marginBottom: '0.25rem', color: '#1c1917' }}>Complimentary Insured Courier Dispatch</h4>
                  <p style={{ color: '#555555', fontSize: '0.86rem', lineHeight: 1.6 }}>
                    Every order is individually inspected, carefully packaged in our protective signature dust bag or presentation box, and dispatched within 24–48 hours across Pakistan with live door-to-door tracking.
                  </p>
                </div>
              </div>

              <div style={{ display: 'flex', gap: '0.85rem', alignItems: 'flex-start' }}>
                <div style={{ width: '40px', height: '40px', borderRadius: '10px', backgroundColor: 'var(--surface)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0, border: '1px solid var(--border-color)' }}>
                  <RotateCcw size={20} color="var(--primary-color)" />
                </div>
                <div>
                  <h4 style={{ fontSize: '0.98rem', fontWeight: 800, marginBottom: '0.25rem', color: '#1c1917' }}>14-Day Seamless Exchanges & Returns</h4>
                  <p style={{ color: '#555555', fontSize: '0.86rem', lineHeight: 1.6 }}>
                    If the color, dimension, or fit is not absolutely perfect, simply contact our concierge for immediate prepaid doorstep courier collection and swift replacement.
                  </p>
                </div>
              </div>
            </div>

            <div style={{ backgroundColor: 'var(--surface)', padding: '1.75rem', borderRadius: 'var(--radius, 12px)', border: '1px solid var(--border-color)' }}>
              <h4 style={{ fontSize: '0.98rem', fontWeight: 800, marginBottom: '0.75rem', display: 'flex', alignItems: 'center', gap: '0.5rem', color: '#1c1917' }}>
                <ShieldCheck size={18} color="var(--primary-color)" /> Atelier Certificate of Authenticity
              </h4>
              <p style={{ fontSize: '0.86rem', color: '#555555', lineHeight: 1.65, marginBottom: '1.25rem' }}>
                Every single handcrafted piece carries an authentic artisan serial code verifying its natural yarn provenance, ethical fair-wage origin, and generational needlework technique.
              </p>
              {storeType === 'jewelry' && (
                <button
                  onClick={() => setIsCertOpen(true)}
                  className="btn-primary"
                  style={{ fontSize: '0.82rem', padding: '0.5rem 1rem' }}
                >
                  View GIA / Hallmark Certificate
                </button>
              )}
            </div>
          </div>
        )}
      </section>

      {/* Related Products Section / Complete the Look */}
      {related_products && related_products.length > 0 && (
        <section style={{
          marginTop: '5rem',
          paddingTop: '3.5rem',
          borderTop: '1px solid var(--border-color)',
        }}>
          <div style={{ marginBottom: '2rem' }}>
            <span style={{
              fontSize: '0.78rem',
              textTransform: 'uppercase',
              letterSpacing: '0.12em',
              fontWeight: 800,
              color: 'var(--primary-color)',
              display: 'block',
              marginBottom: '0.35rem',
            }}>
              Curated Pairings
            </span>
            <h2 style={{
              fontFamily: 'var(--font-heading)',
              fontSize: '2rem',
              fontWeight: 800,
              color: 'var(--text-main)',
              margin: '0 0 0.5rem 0',
            }}>
              Complete the Look
            </h2>
            <p style={{
              color: 'var(--text-muted)',
              fontSize: '0.92rem',
              maxWidth: '650px',
              margin: 0,
            }}>
              Artisanal pairings and handcrafted accessories styled by our creative team to complement your selection.
            </p>
          </div>
          <div
            style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fill, minmax(260px, 1fr))',
              gap: '1.75rem',
              alignItems: 'stretch',
            }}
          >
            {related_products.map((rp) => (
              <ProductCard
                key={rp.id}
                product={rp}
                onSelectProduct={handleSelectRelated}
              />
            ))}
          </div>
        </section>
      )}

      {/* Floating Sticky Purchase Bar on Scroll */}
      {showStickyBar && (
        <aside
          aria-label="Quick Purchase Actions"
          className="animate-fade-in no-print"
          style={{
            position: 'fixed',
            bottom: 0,
            left: 0,
            right: 0,
            backgroundColor: 'var(--card-bg)',
            backdropFilter: 'blur(16px)',
            WebkitBackdropFilter: 'blur(16px)',
            borderTop: '1px solid var(--border-color)',
            boxShadow: '0 -6px 25px rgba(0, 0, 0, 0.12)',
            padding: '0.65rem 1.5rem',
            zIndex: 100,
          }}
        >
          <div style={{
            maxWidth: '1360px',
            width: '100%',
            margin: '0 auto',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            gap: '1rem',
          }}>
            {/* Product Thumbnail & Details */}
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.85rem', overflow: 'hidden' }}>
              <img
                src={images[0]}
                alt={product.name}
                style={{
                  width: '42px',
                  height: '42px',
                  borderRadius: '6px',
                  objectFit: 'cover',
                  border: '1px solid var(--border-color)',
                  flexShrink: 0,
                }}
              />
              <div style={{ overflow: 'hidden' }}>
                <h4 style={{
                  fontSize: '0.9rem',
                  fontWeight: 800,
                  color: 'var(--text-main)',
                  margin: 0,
                  whiteSpace: 'nowrap',
                  overflow: 'hidden',
                  textOverflow: 'ellipsis',
                  maxWidth: '320px',
                }}>
                  {product.name}
                </h4>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginTop: '0.15rem' }}>
                  <span style={{ fontSize: '0.95rem', fontWeight: 900, color: 'var(--primary-color)' }}>
                    {formatPrice(currentPrice)}
                  </span>
                  {selectedAttrs && Object.keys(selectedAttrs).length > 0 && (
                    <span style={{ fontSize: '0.74rem', color: 'var(--text-muted)' }}>
                      • {Object.entries(selectedAttrs).map(([k, v]) => `${v}`).join(' / ')}
                    </span>
                  )}
                </div>
              </div>
            </div>

            {/* Quick Actions */}
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.65rem', flexShrink: 0 }}>
              <button
                onClick={handleAddToCart}
                disabled={isAddToCartDisabled}
                className="btn-primary"
                style={{
                  padding: '0.6rem 1.5rem',
                  fontSize: '0.86rem',
                  fontWeight: 800,
                  opacity: isAddToCartDisabled ? 0.5 : 1,
                  cursor: isAddToCartDisabled ? 'not-allowed' : 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '0.45rem',
                }}
              >
                <ShoppingBag size={15} />
                <span>
                  {isOutOfStock
                    ? 'Sold Out'
                    : isMaxStockInCart
                    ? `Max in Bag (${productStock})`
                    : isSelectedColorSoldOut
                    ? 'Sold Out'
                    : 'Add to Bag'}
                </span>
              </button>

              <button
                onClick={handleBuyNow}
                disabled={isAddToCartDisabled}
                className="btn-secondary"
                style={{
                  padding: '0.6rem 1.25rem',
                  fontSize: '0.86rem',
                  fontWeight: 700,
                  opacity: isAddToCartDisabled ? 0.5 : 1,
                  cursor: isAddToCartDisabled ? 'not-allowed' : 'pointer',
                }}
              >
                <span>Instant Buy</span>
              </button>
            </div>
          </div>
        </aside>
      )}

      {/* Modals */}
      <SizeChartModal
        isOpen={isSizeChartOpen}
        onClose={() => setIsSizeChartOpen(false)}
        product={product}
      />
      <LuxuryCertificateModal
        isOpen={isCertOpen}
        onClose={() => setIsCertOpen(false)}
      />
      <FlexiPayModal
        isOpen={isFlexiPayOpen}
        onClose={() => setIsFlexiPayOpen(false)}
        price={currentPrice}
        formatPrice={formatPrice}
      />
    </div>
  );
}
