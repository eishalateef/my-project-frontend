import React, { useState, useEffect } from 'react';
import { useSearchParams, Link } from 'react-router-dom';
import axios from 'axios';
import { useStore } from '../context/StoreContext';
import ProductCard from '../components/ProductCard';
import DynamicFilters, { getColorHex } from '../components/DynamicFilters';
import SizeChartModal from '../components/SizeChartModal';
import LuxuryCertificateModal from '../components/LuxuryCertificateModal';
import { Search, SlidersHorizontal, ArrowUpDown, X, Sparkles, Filter, Grid, LayoutGrid, ChevronRight } from 'lucide-react';

export default function ProductListing({ onSelectProduct, initialParams = {} }) {
  const [searchParams, setSearchParams] = useSearchParams();
  const urlCategory = searchParams.get('category');
  const urlSearch = searchParams.get('search');
  const urlSort = searchParams.get('sort');
  const urlPMin = searchParams.get('pmin') || searchParams.get('min_price');
  const urlPMax = searchParams.get('pmax') || searchParams.get('max_price');
  const urlColor = searchParams.get('color');

  const parsePriceParam = (val) => {
    if (!val) return null;
    const cleaned = String(val).replace(/,/g, '');
    const num = parseFloat(cleaned);
    return isNaN(num) ? null : num;
  };

  const initialMin = initialParams.minPrice !== undefined ? initialParams.minPrice : parsePriceParam(urlPMin);
  const initialMax = initialParams.maxPrice !== undefined ? initialParams.maxPrice : parsePriceParam(urlPMax);
  const initialAttrs = { ...(initialParams.attributes || {}) };
  if (urlColor && !initialAttrs.color) {
    initialAttrs.color = urlColor;
  }

  const { storeType, store, config } = useStore();
  const [products, setProducts] = useState([]);
  const [allStoreProducts, setAllStoreProducts] = useState([]);
  const [categories, setCategories] = useState([]);
  const parentCategories = categories.filter((c) => !c.parent_id);
  const subCategories = categories.filter((c) => c.parent_id);
  const [loading, setLoading] = useState(true);

  // Filter States
  const [activeCategorySlug, setActiveCategorySlug] = useState(urlCategory || initialParams.categorySlug || '');
  const [selectedCategory, setSelectedCategory] = useState(initialParams.categoryId || null);
  const [selectedFilters, setSelectedFilters] = useState(initialAttrs);
  const [searchQuery, setSearchQuery] = useState(initialParams.search || urlSearch || '');
  const [minPrice, setMinPrice] = useState(initialMin);
  const [maxPrice, setMaxPrice] = useState(initialMax);
  const [sortBy, setSortBy] = useState(initialParams.sort || urlSort || 'latest');
  const [viewMode, setViewMode] = useState('grid'); // 'grid' (3-4 cols) or 'large' (2 cols editorial)
  const [isMobileFiltersOpen, setIsMobileFiltersOpen] = useState(false);

  // Modals
  const [isSizeChartOpen, setIsSizeChartOpen] = useState(false);
  const [isCertOpen, setIsCertOpen] = useState(false);

  // Sync with initialParams and URL search parameters
  useEffect(() => {
    const activeCatSlug = initialParams.categorySlug || urlCategory;
    const activeSearch = initialParams.search !== undefined ? initialParams.search : urlSearch;
    const activeSort = initialParams.sort || urlSort;
    const parsedMin = initialParams.minPrice !== undefined ? initialParams.minPrice : parsePriceParam(urlPMin);
    const parsedMax = initialParams.maxPrice !== undefined ? initialParams.maxPrice : parsePriceParam(urlPMax);

    if (activeCatSlug === 'all-handmade' || activeCatSlug === 'handmade') {
      setActiveCategorySlug('all-handmade');
      setSelectedCategory(null);
    } else if (initialParams.categoryId !== undefined) {
      setSelectedCategory(initialParams.categoryId);
    } else if (activeCatSlug && categories.length > 0) {
      const match = categories.find((c) => c.slug === activeCatSlug);
      if (match) {
        setSelectedCategory(match.id);
        setActiveCategorySlug(match.slug);
      } else {
        setActiveCategorySlug(activeCatSlug);
      }
    } else if (!activeCatSlug) {
      setActiveCategorySlug('');
    }

    if (activeSort) {
      setSortBy(activeSort);
    }
    if (activeSearch !== null && activeSearch !== undefined) {
      setSearchQuery(activeSearch);
    }
    if (parsedMin !== null) {
      setMinPrice(parsedMin);
    }
    if (parsedMax !== null) {
      setMaxPrice(parsedMax);
    }
    if (urlColor) {
      setSelectedFilters((prev) => ({
        ...prev,
        color: urlColor,
      }));
    }
  }, [initialParams, categories, urlCategory, urlSearch, urlSort, urlPMin, urlPMax, urlColor]);

  // Fetch Categories & All Store Products
  useEffect(() => {
    axios
      .get('/api/categories')
      .then((res) => {
        const catList = res.data || [];
        setCategories(catList);
        const activeCatSlug = initialParams.categorySlug || urlCategory;
        if (activeCatSlug === 'all-handmade') {
          setActiveCategorySlug('all-handmade');
          setSelectedCategory(null);
        } else if (activeCatSlug && !initialParams.categoryId) {
          const match = catList.find((c) => c.slug === activeCatSlug);
          if (match) setSelectedCategory(match.id);
        }
      })
      .catch(console.warn);

    axios
      .get('/api/products?per_page=100')
      .then((res) => {
        setAllStoreProducts(res.data.data || res.data || []);
      })
      .catch(console.warn);
  }, [storeType]);

  // Fetch Products with active filters (with 200ms debounce for buttery-smooth search typing)
  useEffect(() => {
    let isCurrent = true;
    const timer = setTimeout(async () => {
      try {
        setLoading(true);
        const params = {
          sort: sortBy,
          per_page: 40,
        };

        if (activeCategorySlug === 'all-handmade' && !selectedCategory) {
          params.category_slug = 'all-handmade';
        } else if (selectedCategory) {
          params.category_id = selectedCategory;
        } else if (activeCategorySlug) {
          params.category_slug = activeCategorySlug;
        }

        if (searchQuery && searchQuery.trim()) params.search = searchQuery.trim();
        if (minPrice !== null && minPrice !== undefined) params.min_price = minPrice;
        if (maxPrice !== null && maxPrice !== undefined) params.max_price = maxPrice;

        // Dynamic attribute filters e.g. attributes[size]=XL
        if (Object.keys(selectedFilters).length > 0) {
          params.attributes = {};
          Object.entries(selectedFilters).forEach(([k, v]) => {
            if (v && (!Array.isArray(v) || v.length > 0)) {
              params.attributes[k] = v;
            }
          });
        }

        const res = await axios.get('/api/products', { params });
        if (isCurrent) {
          setProducts(res.data.data || res.data || []);
        }
      } catch (err) {
        if (isCurrent) {
          console.error('Error fetching filtered products:', err);
        }
      } finally {
        if (isCurrent) {
          setLoading(false);
        }
      }
    }, 200);

    return () => {
      isCurrent = false;
      clearTimeout(timer);
    };
  }, [storeType, selectedCategory, activeCategorySlug, selectedFilters, searchQuery, minPrice, maxPrice, sortBy]);

  const handleSearchChange = (val) => {
    setSearchQuery(val);
    setSearchParams((prev) => {
      const next = new URLSearchParams(prev);
      if (val && val.trim()) {
        next.set('search', val.trim());
      } else {
        next.delete('search');
      }
      return next;
    }, { replace: true });
  };

  const handleClearSearch = () => {
    setSearchQuery('');
    setSearchParams((prev) => {
      const next = new URLSearchParams(prev);
      next.delete('search');
      return next;
    }, { replace: true });
  };

  const handleResetFilters = () => {
    setSelectedFilters({});
    setSelectedCategory(null);
    setSearchQuery('');
    setMinPrice(null);
    setMaxPrice(null);
    setSortBy('latest');
    setSearchParams({});
  };

  const removeSingleFilter = (key, value = null) => {
    if (key === 'category') {
      setSelectedCategory(null);
      return;
    }
    if (key === 'price' || key === 'minPrice' || key === 'maxPrice') {
      setMinPrice(null);
      setMaxPrice(null);
      return;
    }
    if (value && Array.isArray(selectedFilters[key])) {
      const updated = selectedFilters[key].filter((v) => v !== value);
      setSelectedFilters({
        ...selectedFilters,
        [key]: updated.length > 0 ? updated : null,
      });
    } else {
      const next = { ...selectedFilters };
      delete next[key];
      setSelectedFilters(next);
    }
  };

  // Calculate active filter count for badges
  const totalActiveFilterCount =
    Object.values(selectedFilters).reduce((acc, val) => {
      if (!val) return acc;
      if (Array.isArray(val)) return acc + val.length;
      return acc + 1;
    }, 0) +
    (selectedCategory ? 1 : 0) +
    (minPrice !== null || maxPrice !== null ? 1 : 0) +
    (searchQuery ? 1 : 0);

  // Find category name if selected
  const activeCategoryObj = categories.find((c) => c.id === selectedCategory);

  return (
    <div style={{ maxWidth: '1380px', margin: '0 auto', padding: '1.5rem 1.5rem 3rem', width: '100%' }}>
      {/* Interactive Breadcrumb Bar */}
      <nav style={{
        display: 'flex',
        alignItems: 'center',
        gap: '0.45rem',
        fontSize: '0.78rem',
        color: 'var(--text-muted, #64748b)',
        marginBottom: '1.25rem',
      }}>
        <Link to="/" style={{ color: 'inherit', textDecoration: 'none', fontWeight: 600 }}>Home</Link>
        <ChevronRight size={12} />
        <span style={{ color: (selectedCategory || activeCategorySlug) ? 'inherit' : 'var(--text-main)', fontWeight: (selectedCategory || activeCategorySlug) ? 500 : 700 }}>
          {(selectedCategory || activeCategorySlug) ? (
            <span
              style={{ cursor: 'pointer' }}
              onClick={() => {
                setSelectedCategory(null);
                setActiveCategorySlug('');
                setSearchParams({});
              }}
            >
              Catalog
            </span>
          ) : (
            'Catalog'
          )}
        </span>
        {activeCategorySlug === 'all-handmade' && !selectedCategory && (
          <>
            <ChevronRight size={12} />
            <span style={{ color: '#E35205', fontWeight: 800 }}>Shop All Handmade</span>
          </>
        )}
        {activeCategoryObj && (
          <>
            <ChevronRight size={12} />
            <span style={{ color: 'var(--text-main)', fontWeight: 700 }}>{activeCategoryObj.name}</span>
          </>
        )}
      </nav>

      {/* Dedicated Handmade Archive Hero Banner */}
      {storeType === 'clothing' && (activeCategorySlug === 'all-handmade' || activeCategorySlug.includes('handmade') || activeCategoryObj?.name?.toLowerCase().includes('handmade')) && (
        <div style={{
          backgroundColor: '#111111',
          color: '#FFFFFF',
          borderRadius: '8px',
          padding: '1.65rem 2rem',
          marginBottom: '2rem',
          position: 'relative',
          overflow: 'hidden',
          boxShadow: '0 8px 32px rgba(0,0,0,0.14)',
          border: '1px solid #27272A',
        }}>
          <div style={{
            position: 'absolute',
            right: '-30px',
            top: '-30px',
            width: '200px',
            height: '200px',
            borderRadius: '50%',
            background: 'radial-gradient(circle, rgba(227,82,5,0.22) 0%, rgba(0,0,0,0) 70%)',
            pointerEvents: 'none',
          }} />

          <div style={{ position: 'relative', zIndex: 1 }}>
            <div style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: '0.45rem',
              fontSize: '0.72rem',
              fontWeight: 800,
              letterSpacing: '0.12em',
              textTransform: 'uppercase',
              color: '#E35205',
              marginBottom: '0.45rem',
            }}>
              <Sparkles size={13} color="#E35205" />
              <span>خـام پـوشـاک • 100% Authentic Pakistani Master Craftsmen</span>
            </div>

            <h2 style={{
              fontSize: 'clamp(1.75rem, 2.8vw, 2.35rem)',
              fontWeight: 800,
              margin: '0 0 0.45rem',
              fontFamily: "'Cinzel', 'Playfair Display', serif",
              letterSpacing: '0.02em',
            }}>
              {activeCategoryObj?.name?.toLowerCase().includes('handmade') && activeCategoryObj.name !== 'Handmade Collection'
                ? activeCategoryObj.name
                : 'Shop All Handmade — The Heirloom Archive'}
            </h2>

            <p style={{
              fontSize: '0.86rem',
              color: '#A1A1AA',
              maxWidth: '740px',
              lineHeight: 1.55,
              margin: '0 0 1.25rem',
            }}>
              Preserving centuries of heritage embroidery, pure cowhide leathercraft, and delicate crochet needlework across Pakistan. Each piece is handmade by master artisans with heirloom materials.
            </p>

            {/* Department Quick Tabs Switcher */}
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.55rem', flexWrap: 'wrap' }}>
              <button
                type="button"
                onClick={() => {
                  setSelectedCategory(null);
                  setActiveCategorySlug('all-handmade');
                  setSearchParams({ category: 'all-handmade' });
                }}
                style={{
                  padding: '0.42rem 0.95rem',
                  borderRadius: '999px',
                  fontSize: '0.76rem',
                  fontWeight: (!selectedCategory && activeCategorySlug === 'all-handmade') ? 800 : 600,
                  backgroundColor: (!selectedCategory && activeCategorySlug === 'all-handmade') ? '#E35205' : 'rgba(255,255,255,0.12)',
                  color: '#FFFFFF',
                  border: 'none',
                  cursor: 'pointer',
                  transition: 'all 0.16s ease',
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '0.35rem',
                }}
              >
                <span>All Handmade</span>
                <span style={{ fontSize: '0.68rem', opacity: 0.8 }}>(28)</span>
              </button>

              {[
                { name: 'Women Handmade', slug: 'women-handmade', count: 10 },
                { name: 'Men Handmade', slug: 'men-handmade', count: 9 },
                { name: 'Kids Handmade', slug: 'kids-handmade', count: 9 },
              ].map((dept) => {
                const deptCat = categories.find((c) => c.slug === dept.slug);
                const isDeptActive = selectedCategory === deptCat?.id || activeCategorySlug === dept.slug;

                return (
                  <button
                    key={dept.slug}
                    type="button"
                    onClick={() => {
                      if (deptCat) {
                        setSelectedCategory(deptCat.id);
                        setActiveCategorySlug(deptCat.slug);
                        setSearchParams({ category: deptCat.slug });
                      } else {
                        setActiveCategorySlug(dept.slug);
                        setSearchParams({ category: dept.slug });
                      }
                    }}
                    style={{
                      padding: '0.42rem 0.95rem',
                      borderRadius: '999px',
                      fontSize: '0.76rem',
                      fontWeight: isDeptActive ? 800 : 600,
                      backgroundColor: isDeptActive ? '#E35205' : 'rgba(255,255,255,0.12)',
                      color: '#FFFFFF',
                      border: 'none',
                      cursor: 'pointer',
                      transition: 'all 0.16s ease',
                      display: 'inline-flex',
                      alignItems: 'center',
                      gap: '0.35rem',
                    }}
                  >
                    <span>{dept.name}</span>
                    <span style={{ fontSize: '0.68rem', opacity: 0.8 }}>({dept.count})</span>
                  </button>
                );
              })}
            </div>
          </div>
        </div>
      )}

      {/* 1. Sleek Catalog Header with Dynamic, Context-Aware Title */}
      <div
        style={{
          display: 'flex',
          flexWrap: 'wrap',
          alignItems: 'flex-end',
          justifyContent: 'space-between',
          gap: '1.25rem',
          marginBottom: '2rem',
          borderBottom: '1px solid var(--border-color, #e2e8f0)',
          paddingBottom: '1.5rem',
        }}
      >
        <div style={{ flex: '1 1 320px' }}>
          {/* Eyebrow Badge */}
          <div
            style={{
              fontSize: '0.74rem',
              fontWeight: 800,
              textTransform: 'uppercase',
              color: storeType === 'clothing' ? '#E35205' : 'var(--text-muted, #64748b)',
              letterSpacing: '0.14em',
              marginBottom: '0.35rem',
              display: 'flex',
              alignItems: 'center',
              gap: '0.45rem',
            }}
          >
            {storeType === 'clothing' && <Sparkles size={12} color="#E35205" />}
            <span>
              {searchQuery.trim()
                ? 'خـام پـوشـاک • SEARCH ARCHIVE'
                : activeCategoryObj
                ? `خـام پـوشـاک • ${activeCategoryObj.name.toUpperCase()}`
                : activeCategorySlug === 'all-handmade'
                ? 'خـام پـوشـاک • 100% AUTHENTIC MASTER ARTISANS'
                : storeType === 'clothing'
                ? 'خـام پـوشـاک • ALL PRODUCTS'
                : `${store?.name || config.title} • Collection 2026`}
            </span>
          </div>

          {/* Dynamic Main Title Heading */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.85rem', flexWrap: 'wrap' }}>
            <h1
              style={{
                fontSize: 'clamp(1.85rem, 3.2vw, 2.45rem)',
                fontWeight: 800,
                color: 'var(--text-main, #0f172a)',
                letterSpacing: storeType === 'clothing' ? '0.02em' : '-0.025em',
                margin: 0,
                fontFamily: storeType === 'clothing' ? "'Cinzel', 'Playfair Display', serif" : 'var(--font-heading)',
              }}
            >
              {searchQuery.trim()
                ? `Search Results for “${searchQuery.trim()}”`
                : activeCategoryObj
                ? activeCategoryObj.name
                : activeCategorySlug === 'all-handmade'
                ? 'Shop All Handmade'
                : 'All Products'}
            </h1>

            {/* Clear Search / Filter Quick Reset Pill */}
            {searchQuery.trim() && (
              <button
                type="button"
                onClick={handleClearSearch}
                style={{
                  fontSize: '0.75rem',
                  fontWeight: 700,
                  padding: '0.25rem 0.75rem',
                  borderRadius: '999px',
                  border: '1px solid var(--border-color)',
                  backgroundColor: 'var(--surface)',
                  color: 'var(--text-muted)',
                  cursor: 'pointer',
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '0.35rem',
                  transition: 'all 0.15s ease',
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.borderColor = '#dc2626';
                  e.currentTarget.style.color = '#dc2626';
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.borderColor = 'var(--border-color)';
                  e.currentTarget.style.color = 'var(--text-muted)';
                }}
                title="Clear search query"
              >
                <span>Clear Search</span>
                <X size={12} />
              </button>
            )}

            {!searchQuery.trim() && activeCategoryObj && (
              <button
                type="button"
                onClick={() => {
                  setSelectedCategory(null);
                  setActiveCategorySlug('');
                  setSearchParams({});
                }}
                style={{
                  fontSize: '0.75rem',
                  fontWeight: 700,
                  padding: '0.25rem 0.75rem',
                  borderRadius: '999px',
                  border: '1px solid var(--border-color)',
                  backgroundColor: 'var(--surface)',
                  color: 'var(--text-muted)',
                  cursor: 'pointer',
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '0.35rem',
                  transition: 'all 0.15s ease',
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.borderColor = '#E35205';
                  e.currentTarget.style.color = '#E35205';
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.borderColor = 'var(--border-color)';
                  e.currentTarget.style.color = 'var(--text-muted)';
                }}
                title="View entire collection"
              >
                <span>All Products</span>
                <X size={12} />
              </button>
            )}
          </div>

          {/* Subtitle / Contextual Status */}
          <p
            style={{
              fontSize: '0.88rem',
              color: '#6b665f',
              marginTop: '0.45rem',
              marginBottom: 0,
              maxWidth: '620px',
              lineHeight: 1.55,
            }}
          >
            {searchQuery.trim() ? (
              loading ? (
                `Searching handcrafted archive for “${searchQuery.trim()}”...`
              ) : products.length > 0 ? (
                `Showing ${products.length} handcrafted ${products.length === 1 ? 'creation' : 'creations'} matching “${searchQuery.trim()}”.`
              ) : (
                `No creations found matching “${searchQuery.trim()}”. Try searching by craft (e.g. Zardozi, Kurta, Shawl, Cap) or explore our full collection.`
              )
            ) : activeCategoryObj ? (
              `Handcrafted ${activeCategoryObj.name.toLowerCase()} tailored with 100% pure fabrics, heritage needlework, and heirloom craftsmanship.`
            ) : activeCategorySlug === 'all-handmade' ? (
              'Preserving centuries of heritage embroidery, pure cowhide leathercraft, and delicate crochet needlework across Pakistan.'
            ) : storeType === 'clothing' ? (
              'Explore our complete collection of handcrafted designs, tailored by master artisans and delivered nationwide.'
            ) : (
              'Explore our curated catalog featuring nationwide doorstep delivery.'
            )}
          </p>
        </div>

        {/* Search input & Sort Dropdown & View Mode & Mobile Filter Trigger */}
        <div style={{ display: 'flex', gap: '0.85rem', flexWrap: 'wrap', alignItems: 'center' }}>
          {/* Mobile/Responsive Filter Drawer Trigger Button */}
          <button
            type="button"
            onClick={() => setIsMobileFiltersOpen(true)}
            className="catalog-mobile-filter-trigger"
            style={{
              alignItems: 'center',
              gap: '0.5rem',
              height: '42px',
              padding: '0 1.25rem',
              fontSize: '0.82rem',
              fontWeight: 700,
              textTransform: 'uppercase',
              letterSpacing: '0.06em',
              borderRadius: storeType === 'clothing' ? '3px' : '999px',
              backgroundColor: totalActiveFilterCount > 0 ? '#111111' : '#ffffff',
              color: totalActiveFilterCount > 0 ? '#ffffff' : '#111111',
              border: '1px solid #111111',
              cursor: 'pointer',
              transition: 'all 0.15s ease',
            }}
          >
            <SlidersHorizontal size={15} />
            <span>Filter {totalActiveFilterCount > 0 ? `(${totalActiveFilterCount})` : ''}</span>
          </button>

          {/* Modern Search pill with clear trigger */}
          <div style={{ position: 'relative', width: '250px' }}>
            <Search
              size={15}
              style={{
                position: 'absolute',
                left: '0.85rem',
                top: '50%',
                transform: 'translateY(-50%)',
                color: 'var(--text-muted, #64748b)',
              }}
            />
            <input
              type="text"
              placeholder="Search collection..."
              value={searchQuery}
              onChange={(e) => handleSearchChange(e.target.value)}
              style={{
                width: '100%',
                paddingLeft: '2.3rem',
                paddingRight: searchQuery ? '2.2rem' : '0.85rem',
                height: '42px',
                fontSize: '0.86rem',
                borderRadius: '999px',
                backgroundColor: 'var(--card-bg, #ffffff)',
                border: searchQuery ? '1.5px solid var(--primary-color, #E35205)' : '1px solid var(--border-color, #e2e8f0)',
                color: 'var(--text-main, #0f172a)',
                outline: 'none',
                boxShadow: searchQuery ? '0 2px 8px rgba(227, 82, 5, 0.15)' : '0 2px 6px rgba(0,0,0,0.02)',
                transition: 'border-color 0.2s ease, box-shadow 0.2s ease',
              }}
              onFocus={(e) => {
                e.target.style.borderColor = 'var(--primary-color, #0f172a)';
                e.target.style.boxShadow = '0 0 0 3px rgba(15, 23, 42, 0.08)';
              }}
              onBlur={(e) => {
                e.target.style.borderColor = searchQuery ? 'var(--primary-color, #E35205)' : 'var(--border-color, #e2e8f0)';
                e.target.style.boxShadow = searchQuery ? '0 2px 8px rgba(227, 82, 5, 0.15)' : 'none';
              }}
            />
            {searchQuery && (
              <button
                type="button"
                onClick={handleClearSearch}
                title="Clear search"
                style={{
                  position: 'absolute',
                  right: '10px',
                  top: '50%',
                  transform: 'translateY(-50%)',
                  background: 'transparent',
                  border: 'none',
                  cursor: 'pointer',
                  color: 'var(--text-muted)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  padding: '4px',
                }}
              >
                <X size={14} />
              </button>
            )}
          </div>

          {/* Sort Dropdown */}
          <div style={{ display: 'flex', alignItems: 'center', position: 'relative' }}>
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value)}
              style={{
                height: '42px',
                fontSize: '0.85rem',
                fontWeight: 600,
                padding: '0 1.25rem',
                borderRadius: '999px',
                backgroundColor: 'var(--card-bg, #ffffff)',
                border: '1px solid var(--border-color, #e2e8f0)',
                color: 'var(--text-main, #0f172a)',
                cursor: 'pointer',
                outline: 'none',
                boxShadow: '0 2px 6px rgba(0,0,0,0.02)',
              }}
            >
              <option value="latest">Sort by: Latest Arrivals</option>
              <option value="featured">Sort by: Featured First</option>
              <option value="price_asc">Price: Low to High</option>
              <option value="price_desc">Price: High to Low</option>
            </select>
          </div>

          {/* Grid Density View Mode Toggle */}
          <div style={{
            display: 'flex',
            alignItems: 'center',
            backgroundColor: 'var(--card-bg, #ffffff)',
            border: '1px solid var(--border-color, #e2e8f0)',
            borderRadius: '999px',
            padding: '3px',
            gap: '2px',
          }}>
            <button
              type="button"
              onClick={() => setViewMode('grid')}
              style={{
                width: '36px',
                height: '34px',
                borderRadius: '999px',
                border: 'none',
                backgroundColor: viewMode === 'grid' ? 'var(--primary-color)' : 'transparent',
                color: viewMode === 'grid' ? 'var(--button-text)' : 'var(--text-muted)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                cursor: 'pointer',
                transition: 'all 0.15s ease',
              }}
              title="Standard Grid (3-4 Columns)"
            >
              <Grid size={15} />
            </button>
            <button
              type="button"
              onClick={() => setViewMode('large')}
              style={{
                width: '36px',
                height: '34px',
                borderRadius: '999px',
                border: 'none',
                backgroundColor: viewMode === 'large' ? 'var(--primary-color)' : 'transparent',
                color: viewMode === 'large' ? 'var(--button-text)' : 'var(--text-muted)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                cursor: 'pointer',
                transition: 'all 0.15s ease',
              }}
              title="Editorial View (2 Columns)"
            >
              <LayoutGrid size={15} />
            </button>
          </div>
        </div>
      </div>

      {/* 3. Main Layout: Left Sidebar Filters + Right Products Grid */}
      <div className="catalog-grid-layout">
        {/* Left: Dynamic Filters Sidebar (Desktop sticky) */}
        <div className="catalog-sidebar-col catalog-desktop-sidebar">
          <DynamicFilters
            selectedFilters={selectedFilters}
            onFilterChange={setSelectedFilters}
            onResetFilters={handleResetFilters}
            onOpenSizeChart={() => setIsSizeChartOpen(true)}
            onOpenCertificate={() => setIsCertOpen(true)}
            categories={categories}
            selectedCategory={selectedCategory}
            onSelectCategory={(catId) => {
              setSelectedCategory(catId);
              if (!catId) {
                setActiveCategorySlug('');
                setSearchParams({});
              } else {
                const c = categories.find((x) => x.id === catId);
                if (c) {
                  setActiveCategorySlug(c.slug);
                  setSearchParams({ category: c.slug });
                }
              }
            }}
            minPrice={minPrice}
            maxPrice={maxPrice}
            onPriceChange={({ min, max }) => {
              setMinPrice(min);
              setMaxPrice(max);
            }}
            allProducts={allStoreProducts}
          />
        </div>

        {/* Right: Products Listing */}
        <div className="catalog-main-col">
          {/* Active Filter Chips Strip */}
          <div
            style={{
              display: 'flex',
              flexWrap: 'wrap',
              alignItems: 'center',
              justifyContent: 'space-between',
              gap: '0.75rem',
              marginBottom: '1.5rem',
              paddingBottom: '0.75rem',
              borderBottom: '1px solid var(--border-color, #f1f5f9)',
              minHeight: '38px',
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', flexWrap: 'wrap' }}>
              <span style={{ fontSize: '0.82rem', color: 'var(--text-muted, #64748b)', fontWeight: 500, marginRight: '0.25rem' }}>
                Showing <strong style={{ color: 'var(--text-main, #111111)' }}>{products.length}</strong> {storeType === 'clothing' ? 'Handcrafted Designs' : 'items'}
              </span>

              {/* Category chip if active */}
              {activeCategoryObj && (
                <span
                  style={{
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: '0.35rem',
                    fontSize: '0.75rem',
                    fontWeight: 700,
                    padding: '0.25rem 0.65rem',
                    borderRadius: storeType === 'clothing' ? '3px' : '999px',
                    backgroundColor: '#f1f5f9',
                    color: '#111827',
                    border: '1px solid #cbd5e1',
                  }}
                >
                  <span>Category: {activeCategoryObj.name}</span>
                  <X
                    size={12}
                    style={{ cursor: 'pointer', color: '#64748b' }}
                    onClick={() => removeSingleFilter('category')}
                  />
                </span>
              )}

              {/* Price Range Chip if active */}
              {(minPrice !== null || maxPrice !== null) && (
                <span
                  style={{
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: '0.35rem',
                    fontSize: '0.75rem',
                    fontWeight: 700,
                    padding: '0.25rem 0.65rem',
                    borderRadius: storeType === 'clothing' ? '3px' : '999px',
                    backgroundColor: '#f1f5f9',
                    color: '#111827',
                    border: '1px solid #cbd5e1',
                  }}
                >
                  <span>
                    Price:{' '}
                    {minPrice !== null && maxPrice !== null
                      ? `Rs. ${Number(minPrice).toLocaleString()} - Rs. ${Number(maxPrice).toLocaleString()}`
                      : minPrice !== null
                      ? `Over Rs. ${Number(minPrice).toLocaleString()}`
                      : `Up to Rs. ${Number(maxPrice).toLocaleString()}`}
                  </span>
                  <X
                    size={12}
                    style={{ cursor: 'pointer', color: '#64748b' }}
                    onClick={() => removeSingleFilter('price')}
                  />
                </span>
              )}

              {/* Dynamic Attribute Filter Chips */}
              {Object.entries(selectedFilters).map(([k, v]) => {
                if (!v) return null;
                const values = Array.isArray(v) ? v : [v];
                return values.map((val) => {
                  const isColor = k === 'color';
                  const colorHex = isColor ? getColorHex(val) : null;
                  return (
                    <span
                      key={`${k}-${val}`}
                      style={{
                        display: 'inline-flex',
                        alignItems: 'center',
                        gap: '0.4rem',
                        fontSize: '0.75rem',
                        fontWeight: 700,
                        padding: '0.25rem 0.65rem',
                        borderRadius: storeType === 'clothing' ? '3px' : '999px',
                        backgroundColor: '#111111',
                        color: '#ffffff',
                      }}
                    >
                      {isColor && (
                        <span
                          style={{
                            width: '10px',
                            height: '10px',
                            borderRadius: '50%',
                            backgroundColor: colorHex,
                            display: 'inline-block',
                            border: '1px solid rgba(255,255,255,0.4)',
                          }}
                        />
                      )}
                      <span>{val}</span>
                      <X
                        size={12}
                        style={{ cursor: 'pointer', opacity: 0.8 }}
                        onClick={() => removeSingleFilter(k, val)}
                      />
                    </span>
                  );
                });
              })}
            </div>

            {/* Clear All CTA */}
            {(selectedCategory || minPrice !== null || maxPrice !== null || Object.keys(selectedFilters).length > 0) && (
              <button
                type="button"
                onClick={handleResetFilters}
                style={{
                  background: 'transparent',
                  border: 'none',
                  fontSize: '0.78rem',
                  fontWeight: 700,
                  color: '#E35205',
                  cursor: 'pointer',
                  textDecoration: 'underline',
                  padding: 0,
                  textTransform: 'uppercase',
                  letterSpacing: '0.04em',
                }}
              >
                Clear all filters
              </button>
            )}
          </div>

          {/* Product Cards Grid */}
          {loading ? (
            <div
              style={{
                display: 'grid',
                gridTemplateColumns:
                  viewMode === 'large'
                    ? 'repeat(auto-fill, minmax(360px, 1fr))'
                    : storeType === 'general'
                    ? 'repeat(auto-fill, minmax(220px, 1fr))'
                    : 'repeat(auto-fill, minmax(260px, 1fr))',
                gap: '1.5rem',
              }}
            >
              {[1, 2, 3, 4, 5, 6].map((sk) => (
                <div
                  key={sk}
                  style={{
                    borderRadius: 'var(--radius, 14px)',
                    overflow: 'hidden',
                    backgroundColor: 'var(--card-bg, #ffffff)',
                    border: '1px solid var(--border-color, #e2e8f0)',
                  }}
                >
                  <div
                    className="pro-shimmer"
                    style={{
                      width: '100%',
                      paddingTop: storeType === 'clothing' ? '128%' : storeType === 'jewelry' ? '100%' : '92%',
                    }}
                  />
                  <div style={{ padding: '1rem', display: 'flex', flexDirection: 'column', gap: '0.65rem' }}>
                    <div className="pro-shimmer" style={{ width: '40%', height: '12px', borderRadius: '4px' }} />
                    <div className="pro-shimmer" style={{ width: '85%', height: '16px', borderRadius: '4px' }} />
                    <div className="pro-shimmer" style={{ width: '30%', height: '18px', borderRadius: '4px', marginTop: '0.5rem' }} />
                  </div>
                </div>
              ))}
            </div>
          ) : products.length === 0 ? (
            <div
              style={{
                textAlign: 'center',
                padding: '5rem 2rem',
                backgroundColor: 'var(--card-bg, #ffffff)',
                border: '1px solid var(--border-color, #e2e8f0)',
                borderRadius: '16px',
                boxShadow: 'var(--shadow-card)',
              }}
            >
              <div
                style={{
                  width: '60px',
                  height: '60px',
                  borderRadius: '50%',
                  backgroundColor: 'var(--surface, #f8fafc)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  margin: '0 auto 1.25rem',
                  color: 'var(--text-muted)',
                }}
              >
                <SlidersHorizontal size={26} />
              </div>
              <h3 style={{ fontSize: '1.2rem', fontWeight: 800, marginBottom: '0.5rem' }}>
                No pieces match your selected filters
              </h3>
              <p
                style={{
                  color: 'var(--text-muted, #64748b)',
                  fontSize: '0.88rem',
                  maxWidth: '440px',
                  margin: '0 auto 1.5rem',
                }}
              >
                Try selecting a different color, broadening your size range, or clearing your price filter to explore the rest of the drop.
              </p>
              <button
                type="button"
                onClick={handleResetFilters}
                className="btn-primary"
                style={{ fontSize: '0.86rem', padding: '0.75rem 1.6rem' }}
              >
                Reset All Filters
              </button>
            </div>
          ) : (
            <div
              className={storeType === 'clothing' && viewMode !== 'large' ? 'fashion-products-grid' : ''}
              style={{
                display: 'grid',
                gridTemplateColumns:
                  viewMode === 'large'
                    ? 'repeat(auto-fill, minmax(360px, 1fr))'
                    : storeType === 'general'
                    ? 'repeat(auto-fill, minmax(220px, 1fr))'
                    : storeType === 'clothing'
                    ? undefined
                    : 'repeat(auto-fill, minmax(260px, 1fr))',
                gap: '1.5rem',
                transition: 'all 0.3s ease',
              }}
            >
              {products.map((p) => (
                <ProductCard
                  key={p.id}
                  product={p}
                  onSelectProduct={onSelectProduct}
                />
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Mobile Slide-Out Filter Drawer */}
      {isMobileFiltersOpen && (
        <div
          style={{
            position: 'fixed',
            inset: 0,
            zIndex: 9999,
            display: 'flex',
          }}
        >
          {/* Backdrop */}
          <div
            onClick={() => setIsMobileFiltersOpen(false)}
            style={{
              position: 'absolute',
              inset: 0,
              backgroundColor: 'rgba(0, 0, 0, 0.55)',
              backdropFilter: 'blur(3px)',
              transition: 'opacity 0.25s ease',
            }}
          />

          {/* Drawer Body */}
          <div
            style={{
              position: 'relative',
              marginLeft: 'auto',
              width: '100%',
              maxWidth: '380px',
              height: '100%',
              backgroundColor: '#ffffff',
              display: 'flex',
              flexDirection: 'column',
              boxShadow: '-4px 0 24px rgba(0,0,0,0.18)',
              animation: 'slideInRight 0.25s cubic-bezier(0.16, 1, 0.3, 1)',
            }}
          >
            {/* Drawer Header */}
            <div
              style={{
                padding: '1.15rem 1.25rem',
                borderBottom: '1px solid #e5e7eb',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
              }}
            >
              <div>
                <h2
                  style={{
                    margin: 0,
                    fontSize: '1.05rem',
                    fontWeight: 800,
                    letterSpacing: '0.04em',
                    textTransform: 'uppercase',
                    fontFamily: storeType === 'clothing' ? "'Cinzel', serif" : 'inherit',
                  }}
                >
                  Filter & Refine
                </h2>
                <span style={{ fontSize: '0.74rem', color: '#6b7280' }}>
                  {totalActiveFilterCount > 0
                    ? `${totalActiveFilterCount} filters currently active`
                    : 'Select filters to refine collection'}
                </span>
              </div>
              <button
                type="button"
                onClick={() => setIsMobileFiltersOpen(false)}
                style={{
                  background: 'none',
                  border: 'none',
                  padding: '0.4rem',
                  cursor: 'pointer',
                  color: '#111827',
                  borderRadius: '50%',
                }}
                aria-label="Close filters"
              >
                <X size={20} />
              </button>
            </div>

            {/* Drawer Scrollable Content */}
            <div
              style={{
                flex: 1,
                overflowY: 'auto',
                padding: '1.25rem',
              }}
            >
              <DynamicFilters
                selectedFilters={selectedFilters}
                onFilterChange={setSelectedFilters}
                onResetFilters={handleResetFilters}
                onOpenSizeChart={() => {
                  setIsMobileFiltersOpen(false);
                  setIsSizeChartOpen(true);
                }}
                onOpenCertificate={() => {
                  setIsMobileFiltersOpen(false);
                  setIsCertOpen(true);
                }}
                categories={categories}
                selectedCategory={selectedCategory}
                onSelectCategory={(catId) => {
                  setSelectedCategory(catId);
                  if (!catId) {
                    setActiveCategorySlug('');
                    setSearchParams({});
                  } else {
                    const c = categories.find((x) => x.id === catId);
                    if (c) {
                      setActiveCategorySlug(c.slug);
                      setSearchParams({ category: c.slug });
                    }
                  }
                  setIsMobileFiltersOpen(false);
                }}
                minPrice={minPrice}
                maxPrice={maxPrice}
                onPriceChange={({ min, max }) => {
                  setMinPrice(min);
                  setMaxPrice(max);
                }}
                allProducts={allStoreProducts}
              />
            </div>

            {/* Drawer Fixed Footer */}
            <div
              style={{
                padding: '1rem 1.25rem',
                borderTop: '1px solid #e5e7eb',
                display: 'flex',
                gap: '0.75rem',
                backgroundColor: '#ffffff',
              }}
            >
              <button
                type="button"
                onClick={handleResetFilters}
                style={{
                  flex: 1,
                  height: '46px',
                  border: '1px solid #d1d5db',
                  backgroundColor: '#ffffff',
                  color: '#374151',
                  borderRadius: storeType === 'clothing' ? '3px' : '8px',
                  fontWeight: 700,
                  fontSize: '0.82rem',
                  textTransform: 'uppercase',
                  letterSpacing: '0.05em',
                  cursor: 'pointer',
                }}
              >
                Reset All
              </button>
              <button
                type="button"
                onClick={() => setIsMobileFiltersOpen(false)}
                style={{
                  flex: 2,
                  height: '46px',
                  backgroundColor: storeType === 'clothing' ? '#111111' : 'var(--primary-color)',
                  color: '#ffffff',
                  border: 'none',
                  borderRadius: storeType === 'clothing' ? '3px' : '8px',
                  fontWeight: 700,
                  fontSize: '0.84rem',
                  textTransform: 'uppercase',
                  letterSpacing: '0.06em',
                  cursor: 'pointer',
                }}
              >
                Apply Filters ({products.length})
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Helper Modals */}
      <SizeChartModal isOpen={isSizeChartOpen} onClose={() => setIsSizeChartOpen(false)} />
      <LuxuryCertificateModal isOpen={isCertOpen} onClose={() => setIsCertOpen(false)} />
    </div>
  );
}
