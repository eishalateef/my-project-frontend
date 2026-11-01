import React, { useState, useEffect, useRef } from 'react';
import api from '../../api/axios';
import { useStore } from '../../context/StoreContext';
import {
  Plus,
  Trash2,
  Edit,
  X,
  Check,
  Package,
  Sparkles,
  ImagePlus,
  UploadCloud,
  Star,
  AlertCircle,
  Link,
  RefreshCw,
} from 'lucide-react';

// Smart Catalog Specification Preset Definitions
const STORE_PRESET_CONFIG = {
  clothing: [
    {
      id: 'size',
      label: 'Sizes Available',
      icon: '📏',
      placeholder: 'e.g. M or S, M, L, XL',
      help: 'Powers size selector pills and stock filters on the store',
      pills: ['XS', 'S', 'M', 'L', 'XL', '2XL', '3XL', 'Free Size'],
    },
    {
      id: 'color',
      label: 'Color Variant',
      icon: '🎨',
      placeholder: 'e.g. Charcoal Black',
      help: 'Powers color swatches on catalog and product page',
      swatches: [
        { name: 'Terracotta Rust', hex: '#c2410c' },
        { name: 'Warm Camel / Beige', hex: '#d97706' },
        { name: 'Ivory / Cream', hex: '#fef3c7', border: true },
        { name: 'Pure White', hex: '#ffffff', border: true },
        { name: 'Charcoal Black', hex: '#18181b' },
        { name: 'Emerald Green', hex: '#065f46' },
        { name: 'Olive / Sage Green', hex: '#4d7c0f' },
        { name: 'Navy Blue', hex: '#1e3a8a' },
        { name: 'Burgundy Red', hex: '#831843' },
        { name: 'Maroon / Crimson', hex: '#881337' },
        { name: 'Dusty Pink / Rose', hex: '#f43f5e' },
        { name: 'Lavender / Lilac', hex: '#8b5cf6' },
        { name: 'Mustard Yellow', hex: '#eab308' },
        { name: 'Heather Grey', hex: '#4b5563' },
      ],
    },
    {
      id: 'fabric',
      label: 'Fabric Composition',
      icon: '🧵',
      placeholder: 'e.g. 100% Organic Cotton',
      help: 'Material details highlighted in product specifications',
      chips: [
        '100% Organic Cotton',
        'Pure Mulberry Silk',
        'Linen Blend',
        'Raw Denim',
        'Merino Wool',
        'Chiffon',
        'Lawn Blend',
        'Cashmere',
      ],
    },
    {
      id: 'fit',
      label: 'Fit & Silhouette',
      icon: '✂️',
      placeholder: 'e.g. Slim Fit',
      help: 'Cut and tailoring guidance for shoppers',
      chips: [
        'Slim Fit',
        'Regular Fit',
        'Relaxed Oversized',
        'Tailored Cut',
        'Athletic Fit',
      ],
    },
    {
      id: 'craftsmanship',
      label: 'Artisanal Craftsmanship',
      icon: '✨',
      placeholder: 'e.g. Hand-Embroidered or Crochet',
      help: 'Heritage technique details for the handmade collection',
      chips: [
        'Hand-Embroidered',
        'Handwoven',
        'Crochet',
        'Handmade Leather',
        'Hand-Block Printed',
        'Hand-Smocked',
        'Solid Woodcraft',
      ],
    },
    {
      id: 'subcategory',
      label: 'Subcategory Spec',
      icon: '🏷️',
      placeholder: 'e.g. Hand-Embroidered Kurtas',
      help: 'Specific collection classification',
      chips: [
        'Hand-Embroidered Kurtas',
        'Handmade Waistcoats',
        'Handwoven Scarves',
        'Handmade Leather Wallets',
        'Handmade Khussa',
        'Crochet Bags',
        'Handmade Earrings',
        'Crochet Baby Booties',
        'Crochet Soft Toys',
        'Personalized Gifts',
      ],
    },
  ],
  jewelry: [
    {
      id: 'material',
      label: 'Precious Metal',
      icon: '🪙',
      placeholder: 'e.g. 18K Solid Yellow Gold',
      help: 'Core luxury metal foundation',
      chips: [
        '18K Solid Yellow Gold',
        '18K White Gold',
        '18K Rose Gold',
        '24K Pure Gold',
        'Platinum 950',
        '925 Sterling Silver',
      ],
    },
    {
      id: 'purity',
      label: 'Hallmark Purity',
      icon: '✨',
      placeholder: 'e.g. 18K (750 Purity)',
      help: 'Official assay hallmark purity grade',
      chips: [
        '18K (750 Purity)',
        '22K (916 Purity)',
        '24K (999 Pure)',
        '925 Hallmark',
        'Pt950 Certified',
      ],
    },
    {
      id: 'gemstone',
      label: 'Center Gemstone',
      icon: '💎',
      placeholder: 'e.g. Natural VVS1 Diamond',
      help: 'Main stone cut, clarity, and type',
      chips: [
        'Natural VVS1 Diamond',
        'Solitaire Diamond 1.0ct',
        'South Sea Cultured Pearl',
        'Colombian Emerald',
        'Royal Blue Sapphire',
        'Burmese Ruby',
        'Moissanite',
        'Pure Metal (No Stone)',
      ],
    },
    {
      id: 'weight',
      label: 'Approx. Weight / Carat',
      icon: '⚖️',
      placeholder: 'e.g. 6.2 grams',
      help: 'Net weight or total carat weight',
      chips: [
        '3.2 grams',
        '5.5 grams',
        '8.0 grams',
        '12.4 grams',
        '18.0 grams',
        '0.50 Carat',
        '1.00 Carat',
        '2.00 Carat',
      ],
    },
  ],
  general: [
    {
      id: 'brand',
      label: 'Brand / Manufacturer',
      icon: '🏷️',
      placeholder: 'e.g. Apple, Sony, Nike',
      help: 'Powers brand filters and product trust badges',
      chips: [
        'Apple',
        'Samsung',
        'Sony',
        'Nike',
        'Adidas',
        'FlexiStore Signature',
        'Xiaomi',
        'Anker',
      ],
    },
    {
      id: 'warranty',
      label: 'Warranty Coverage',
      icon: '🛡️',
      placeholder: 'e.g. 1 Year Official Brand Warranty',
      help: 'Warranty assurance displayed on product page',
      chips: [
        '1 Year Official Brand Warranty',
        '2 Years Global Warranty',
        '6 Months Seller Warranty',
        '7 Days Replacement Guarantee',
        'Lifetime Warranty',
      ],
    },
    {
      id: 'delivery',
      label: 'Shipping Speed',
      icon: '🚀',
      placeholder: 'e.g. Express 24H Dispatch',
      help: 'Delivery promise badge on customer checkout',
      chips: [
        'Express 24H Dispatch',
        'Same Day Delivery',
        'Standard 2-3 Days',
        'Free Nationwide Shipping',
      ],
    },
    {
      id: 'condition',
      label: 'Item Condition',
      icon: '📦',
      placeholder: 'e.g. Brand New Sealed',
      help: 'Physical packaging and product state',
      chips: [
        'Brand New Sealed',
        'Original Retail Box',
        'Certified Refurbished (Grade A)',
      ],
    },
  ],
};

export default function ProductManager() {
  const { storeType, store, formatPrice } = useStore();
  const [products, setProducts] = useState([]);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [modalOpen, setModalOpen] = useState(false);
  const [editingProduct, setEditingProduct] = useState(null);

  // Multi-Image Upload States
  const [uploadingImages, setUploadingImages] = useState(false);
  const [uploadError, setUploadError] = useState(null);
  const [urlInput, setUrlInput] = useState('');
  const fileInputRef = useRef(null);

  // Form State
  const [formData, setFormData] = useState({
    name: '',
    price: '',
    sale_price: '',
    stock: 50,
    sku: '',
    description: '',
    category_id: '',
    images: ['https://images.unsplash.com/photo-1544022613-e87ca75a784a?w=800&auto=format&fit=crop&q=80'],
    is_featured: false,
    attributes: [],
  });

  const [customSizeInput, setCustomSizeInput] = useState('');
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState(null);

  const fetchProducts = async () => {
    try {
      setLoading(true);
      const storeParam = store?.id ? `&store_id=${store.id}` : '';
      const catParam = store?.id ? `?store_id=${store.id}` : '';
      const [prodRes, catRes] = await Promise.all([
        api.get(`/api/products?per_page=50${storeParam}`),
        api.get(`/api/categories${catParam}`),
      ]);
      setProducts(prodRes.data.data || prodRes.data || []);
      setCategories(catRes.data || []);
    } catch (err) {
      console.error('Failed to load products:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProducts();
  }, [storeType]);

  const getDefaultAttributes = () => {
    if (storeType === 'clothing') {
      return [
        { name: 'size', value: 'M', is_available: true, image_url: '' },
        { name: 'color', value: 'Charcoal Black', is_available: true, image_url: '' },
        { name: 'fabric', value: '100% Organic Cotton', is_available: true, image_url: '' },
      ];
    } else if (storeType === 'jewelry') {
      return [
        { name: 'material', value: '18K Solid Yellow Gold', is_available: true, image_url: '' },
        { name: 'purity', value: '18K (750 Purity)', is_available: true, image_url: '' },
        { name: 'gemstone', value: 'Natural VVS1 Diamond', is_available: true, image_url: '' },
        { name: 'weight', value: '6.2 grams', is_available: true, image_url: '' },
      ];
    } else {
      return [
        { name: 'brand', value: 'TechPro Official', is_available: true, image_url: '' },
        { name: 'warranty', value: '1 Year Brand Warranty', is_available: true, image_url: '' },
        { name: 'delivery', value: 'Express 24H Dispatch', is_available: true, image_url: '' },
      ];
    }
  };

  const handleOpenAdd = () => {
    setEditingProduct(null);
    setUploadError(null);
    setUrlInput('');
    setFormData({
      name: '',
      price: '',
      sale_price: '',
      stock: 50,
      sku: 'SKU-' + Math.floor(1000 + Math.random() * 9000),
      description: '',
      category_id: categories[0]?.id || '',
      images: ['https://images.unsplash.com/photo-1544022613-e87ca75a784a?w=800&auto=format&fit=crop&q=80'],
      is_featured: true,
      attributes: getDefaultAttributes(),
    });
    setModalOpen(true);
  };

  const handleOpenEdit = (p) => {
    setEditingProduct(p);
    setUploadError(null);
    setUrlInput('');

    const existingAttrs = p.attributes && p.attributes.length > 0
      ? p.attributes.map((a) => ({
          name: a.attribute_name,
          value: a.attribute_value,
          image_url: a.image_url || '',
          is_available: a.is_available !== false && a.is_available !== 0 && a.is_available !== '0',
        }))
      : getDefaultAttributes();

    let imgs = [];
    if (Array.isArray(p.images)) {
      imgs = p.images;
    } else if (typeof p.images === 'string' && p.images.startsWith('[')) {
      try {
        imgs = JSON.parse(p.images);
      } catch (e) {
        imgs = [p.images];
      }
    } else if (p.images) {
      imgs = [p.images];
    }

    setFormData({
      name: p.name,
      price: p.price,
      sale_price: p.sale_price || '',
      stock: p.stock,
      sku: p.sku,
      description: p.description,
      category_id: p.category_id,
      images: imgs.length > 0 ? imgs : ['https://images.unsplash.com/photo-1544022613-e87ca75a784a?w=800&auto=format&fit=crop&q=80'],
      is_featured: Boolean(p.is_featured),
      attributes: existingAttrs,
    });
    setModalOpen(true);
  };

  // --- Multi-Image Upload & Gallery Handlers ---
  const handleFileUpload = async (e) => {
    const rawFiles = e.target.files ? Array.from(e.target.files) : [];
    if (rawFiles.length === 0) return;

    setUploadingImages(true);
    setUploadError(null);

    const uploadPayload = new FormData();
    rawFiles.forEach((file) => {
      uploadPayload.append('images[]', file);
    });

    try {
      const res = await api.post('/api/admin/products/upload-images', uploadPayload, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });

      if (res.data?.success && Array.isArray(res.data.urls)) {
        setFormData((prev) => ({
          ...prev,
          images: [...prev.images, ...res.data.urls],
        }));
      }
    } catch (err) {
      console.error('Failed to upload image(s):', err);
      setUploadError(
        err.response?.data?.message || 'Failed to upload images from your computer. Please check file format and size.'
      );
    } finally {
      setUploadingImages(false);
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
    }
  };

  const handleSetPrimaryImage = (index) => {
    if (index === 0) return;
    const newImages = [...formData.images];
    const [chosen] = newImages.splice(index, 1);
    newImages.unshift(chosen);
    setFormData({ ...formData, images: newImages });
  };

  const handleRemoveImage = (index) => {
    const updated = formData.images.filter((_, i) => i !== index);
    setFormData({ ...formData, images: updated });
  };

  const handleAddUrlImage = () => {
    const trimmed = urlInput.trim();
    if (!trimmed) return;
    setFormData((prev) => ({
      ...prev,
      images: [...prev.images, trimmed],
    }));
    setUrlInput('');
  };

  // --- Dynamic Attributes Helpers ---
  const getAttrVal = (name) => {
    const target = formData.attributes.find((a) => a.name.toLowerCase() === name.toLowerCase());
    return target ? target.value : '';
  };

  const setAttrVal = (name, value) => {
    const lowerName = name.toLowerCase();
    const existingIndex = formData.attributes.findIndex((a) => a.name.toLowerCase() === lowerName);

    if (!value || !value.trim()) {
      if (existingIndex !== -1) {
        setFormData((prev) => ({
          ...prev,
          attributes: prev.attributes.filter((_, idx) => idx !== existingIndex),
        }));
      }
      return;
    }

    if (existingIndex !== -1) {
      setFormData((prev) => {
        const updated = [...prev.attributes];
        updated[existingIndex] = { ...updated[existingIndex], value: value.trim() };
        return { ...prev, attributes: updated };
      });
    } else {
      setFormData((prev) => ({
        ...prev,
        attributes: [...prev.attributes, { name: lowerName, value: value.trim() }],
      }));
    }
  };

  const applyTemplateDefaults = () => {
    setFormData((prev) => ({
      ...prev,
      attributes: getDefaultAttributes(),
    }));
  };

  // --- Dedicated Color Variants Helpers ---
  const handleAddColorVariant = (initialName = '', imageUrl = '') => {
    setFormData((prev) => ({
      ...prev,
      attributes: [
        ...prev.attributes,
        {
          name: 'color',
          value: initialName,
          image_url: imageUrl,
          is_available: true,
        },
      ],
    }));
  };

  const handleUpdateColorVariant = (targetColorAttrOrIdx, field, val) => {
    setFormData((prev) => {
      let colorIdx = 0;
      const updated = prev.attributes.map((item) => {
        if (item.name.toLowerCase() === 'color') {
          const isMatch =
            (typeof targetColorAttrOrIdx === 'number' && colorIdx === targetColorAttrOrIdx) ||
            item === targetColorAttrOrIdx;
          colorIdx++;
          if (isMatch) {
            return { ...item, [field]: val };
          }
        }
        return item;
      });
      return { ...prev, attributes: updated };
    });
  };

  const handleRemoveColorVariant = (targetColorAttrOrIdx) => {
    setFormData((prev) => {
      let colorIdx = 0;
      return {
        ...prev,
        attributes: prev.attributes.filter((item) => {
          if (item.name.toLowerCase() === 'color') {
            const isMatch =
              (typeof targetColorAttrOrIdx === 'number' && colorIdx === targetColorAttrOrIdx) ||
              item === targetColorAttrOrIdx;
            colorIdx++;
            return !isMatch;
          }
          return true;
        }),
      };
    });
  };

  // --- Dedicated Size Variants Helpers ---
  const handleAddSizeVariant = (initialValue = '') => {
    if (!initialValue || !initialValue.trim()) return;
    const clean = initialValue.trim();
    const alreadyExists = formData.attributes.some(
      (a) => a.name.toLowerCase() === 'size' && a.value.toLowerCase() === clean.toLowerCase()
    );
    if (alreadyExists) return;

    setFormData((prev) => ({
      ...prev,
      attributes: [
        ...prev.attributes,
        {
          name: 'size',
          value: clean,
          is_available: true,
          image_url: '',
        },
      ],
    }));
  };

  const handleToggleSizeVariant = (targetSizeValue) => {
    const clean = (targetSizeValue || '').trim();
    if (!clean) return;
    const exists = formData.attributes.find(
      (a) => a.name.toLowerCase() === 'size' && a.value.toLowerCase() === clean.toLowerCase()
    );
    if (exists) {
      setFormData((prev) => ({
        ...prev,
        attributes: prev.attributes.filter(
          (a) => !(a.name.toLowerCase() === 'size' && a.value.toLowerCase() === clean.toLowerCase())
        ),
      }));
    } else {
      handleAddSizeVariant(clean);
    }
  };

  const handleUpdateSizeVariant = (targetSizeAttrOrIdx, field, val) => {
    setFormData((prev) => {
      let sizeIdx = 0;
      const updated = prev.attributes.map((item) => {
        if (item.name.toLowerCase() === 'size') {
          const isMatch =
            (typeof targetSizeAttrOrIdx === 'number' && sizeIdx === targetSizeAttrOrIdx) ||
            item === targetSizeAttrOrIdx;
          sizeIdx++;
          if (isMatch) {
            return { ...item, [field]: val };
          }
        }
        return item;
      });
      return { ...prev, attributes: updated };
    });
  };

  const handleRemoveSizeVariant = (targetSizeAttrOrIdx) => {
    setFormData((prev) => {
      let sizeIdx = 0;
      return {
        ...prev,
        attributes: prev.attributes.filter((item) => {
          if (item.name.toLowerCase() === 'size') {
            const isMatch =
              (typeof targetSizeAttrOrIdx === 'number' && sizeIdx === targetSizeAttrOrIdx) ||
              item === targetSizeAttrOrIdx;
            sizeIdx++;
            return !isMatch;
          }
          return true;
        }),
      };
    });
  };

  const handleAddCustomAttribute = () => {
    setFormData((prev) => ({
      ...prev,
      attributes: [...prev.attributes, { name: '', value: '', is_available: true, image_url: '' }],
    }));
  };

  const handleCustomAttributeChange = (targetAttr, field, val) => {
    setFormData((prev) => {
      const updated = prev.attributes.map((item) => {
        if (item === targetAttr) {
          return { ...item, [field]: val };
        }
        return item;
      });
      return { ...prev, attributes: updated };
    });
  };

  const handleRemoveCustomAttribute = (targetAttr) => {
    setFormData((prev) => ({
      ...prev,
      attributes: prev.attributes.filter((item) => item !== targetAttr),
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!formData.images || formData.images.length === 0) {
      alert('Please provide at least one product image (upload from your computer or provide an image URL).');
      return;
    }

    setSaving(true);
    setMessage(null);

    try {
      const payload = {
        store_id: store?.id || 1,
        category_id: formData.category_id,
        name: formData.name,
        price: Number(formData.price),
        sale_price: formData.sale_price ? Number(formData.sale_price) : null,
        stock: Number(formData.stock),
        sku: formData.sku,
        description: formData.description || 'Premium quality product item.',
        images: formData.images,
        is_featured: formData.is_featured,
        attributes: formData.attributes.filter((a) => a.name && a.name.trim() && a.value && a.value.trim()),
      };

      if (editingProduct) {
        await api.put(`/api/admin/products/${editingProduct.id}`, payload);
        setMessage('Product updated successfully!');
      } else {
        await api.post('/api/admin/products', payload);
        setMessage('New product created successfully with images and attributes!');
      }

      setModalOpen(false);
      fetchProducts();
      setTimeout(() => setMessage(null), 4000);
    } catch (err) {
      console.error('Error saving product:', err);
      alert(err.response?.data?.message || 'Error saving product. Please verify fields.');
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (id) => {
    if (!confirm('Are you sure you want to delete this product?')) return;
    try {
      await api.delete(`/api/admin/products/${id}`);
      fetchProducts();
    } catch (err) {
      console.error('Failed to delete product:', err);
    }
  };

  const activePresets = STORE_PRESET_CONFIG[storeType] || STORE_PRESET_CONFIG.general;
  const activePresetIds = activePresets.map((p) => p.id.toLowerCase());
  const colorAttributes = formData.attributes.filter((a) => a.name.toLowerCase() === 'color');
  const sizeAttributes = formData.attributes.filter((a) => a.name.toLowerCase() === 'size');
  const customAttributes = formData.attributes.filter(
    (a) => !activePresetIds.includes(a.name.toLowerCase()) && a.name.toLowerCase() !== 'color' && a.name.toLowerCase() !== 'size'
  );

  return (
    <div style={{
      backgroundColor: 'var(--card-bg)',
      border: '1px solid var(--border-color)',
      borderRadius: 'var(--radius)',
      padding: '2rem',
    }}>
      <div style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        flexWrap: 'wrap',
        gap: '1rem',
        marginBottom: '1.5rem',
      }}>
        <div>
          <h2 style={{ fontSize: '1.5rem' }}>Product Catalog Manager</h2>
          <p style={{ color: 'var(--text-muted)', fontSize: '0.88rem' }}>
            Products are bound to the active store type with flexible dynamic attributes.
          </p>
        </div>

        <button onClick={handleOpenAdd} className="btn-primary" style={{ fontSize: '0.85rem' }}>
          <Plus size={16} /> Add New Product
        </button>
      </div>

      {message && (
        <div style={{
          backgroundColor: '#ECFDF5',
          border: '1px solid #6EE7B7',
          color: '#065F46',
          padding: '0.75rem 1rem',
          borderRadius: 'var(--radius)',
          fontSize: '0.85rem',
          marginBottom: '1rem',
        }}>
          {message}
        </div>
      )}

      {/* Products Table */}
      {loading ? (
        <div style={{ textAlign: 'center', padding: '3rem', color: 'var(--text-muted)' }}>
          Loading products...
        </div>
      ) : (
        <div style={{ overflowX: 'auto' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.85rem' }}>
            <thead>
              <tr style={{ borderBottom: '2px solid var(--border-color)', backgroundColor: 'var(--surface)', textAlign: 'left' }}>
                <th style={{ padding: '0.75rem 1rem' }}>Product</th>
                <th style={{ padding: '0.75rem 1rem' }}>Category</th>
                <th style={{ padding: '0.75rem 1rem' }}>Price</th>
                <th style={{ padding: '0.75rem 1rem' }}>Stock</th>
                <th style={{ padding: '0.75rem 1rem' }}>Dynamic Attributes</th>
                <th style={{ padding: '0.75rem 1rem', textAlign: 'right' }}>Actions</th>
              </tr>
            </thead>
            <tbody>
              {products.map((p) => {
                let img = 'https://placehold.co/150x150?text=Product';
                if (Array.isArray(p.images) && p.images.length > 0) {
                  img = p.images[0];
                } else if (typeof p.images === 'string' && p.images.startsWith('[')) {
                  try {
                    const parsed = JSON.parse(p.images);
                    img = parsed[0] || img;
                  } catch (e) {
                    img = p.images;
                  }
                } else if (p.images) {
                  img = p.images;
                }

                return (
                  <tr key={p.id} style={{ borderBottom: '1px solid var(--border-color)' }}>
                    <td style={{ padding: '0.75rem 1rem', display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                      <img src={img} alt="" style={{ width: '42px', height: '48px', objectFit: 'cover', borderRadius: '4px' }} />
                      <div>
                        <div style={{ fontWeight: 700, color: 'var(--text-main)' }}>{p.name}</div>
                        <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)', fontFamily: 'monospace' }}>SKU: {p.sku}</div>
                      </div>
                    </td>
                    <td style={{ padding: '0.75rem 1rem' }}>{p.category?.name || 'Unassigned'}</td>
                    <td style={{ padding: '0.75rem 1rem', fontWeight: 700, color: storeType === 'jewelry' ? '#FFD700' : 'var(--primary-color)' }}>
                      {formatPrice(p.sale_price || p.price)}
                    </td>
                    <td style={{ padding: '0.75rem 1rem' }}>{p.stock} units</td>
                    <td style={{ padding: '0.75rem 1rem' }}>
                      <div style={{ display: 'flex', gap: '0.3rem', flexWrap: 'wrap', maxWidth: '240px' }}>
                        {p.attributes && p.attributes.map((a, i) => {
                          const isCol = a.attribute_name?.toLowerCase() === 'color';
                          const isSoldOut = a.is_available === false || a.is_available === 0 || a.is_available === '0';
                          return (
                            <span key={i} style={{
                              backgroundColor: isCol ? 'rgba(var(--primary-rgb, 99, 102, 241), 0.08)' : 'var(--surface)',
                              border: isCol ? '1px solid var(--primary-color)' : '1px solid var(--border-color)',
                              padding: '0.15rem 0.4rem',
                              borderRadius: '4px',
                              fontSize: '0.7rem',
                              color: isSoldOut ? '#EF4444' : 'var(--text-color)',
                              display: 'inline-flex',
                              alignItems: 'center',
                              gap: '0.25rem',
                              textDecoration: isSoldOut ? 'line-through' : 'none',
                            }}>
                              {a.image_url && (
                                <img src={a.image_url} alt="" style={{ width: '12px', height: '12px', borderRadius: '50%', objectFit: 'cover' }} />
                              )}
                              <span>{a.attribute_name}: <strong>{a.attribute_value}</strong></span>
                              {isSoldOut && <span style={{ fontSize: '0.62rem', color: '#EF4444', textDecoration: 'none' }}>(Sold Out)</span>}
                            </span>
                          );
                        })}
                      </div>
                    </td>
                    <td style={{ padding: '0.75rem 1rem', textAlign: 'right' }}>
                      <div style={{ display: 'flex', gap: '0.5rem', justifyContent: 'flex-end' }}>
                        <button
                          onClick={() => handleOpenEdit(p)}
                          style={{ background: 'transparent', border: 'none', cursor: 'pointer', color: 'var(--text-muted)' }}
                          title="Edit"
                        >
                          <Edit size={16} />
                        </button>
                        <button
                          onClick={() => handleDelete(p.id)}
                          style={{ background: 'transparent', border: 'none', cursor: 'pointer', color: '#EF4444' }}
                          title="Delete"
                        >
                          <Trash2 size={16} />
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}

      {/* Add / Edit Product Modal */}
      {modalOpen && (
        <div style={{
          position: 'fixed',
          inset: 0,
          backgroundColor: 'rgba(0, 0, 0, 0.75)',
          backdropFilter: 'blur(5px)',
          zIndex: 110,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          padding: '1rem',
        }}>
          <div style={{
            backgroundColor: 'var(--card-bg)',
            border: '1px solid var(--border-color)',
            borderRadius: 'var(--radius)',
            maxWidth: '750px',
            width: '100%',
            maxHeight: '92vh',
            overflowY: 'auto',
            padding: '2rem',
            position: 'relative',
          }} className="animate-fade-in">
            <button
              onClick={() => setModalOpen(false)}
              style={{
                position: 'absolute',
                top: '1.25rem',
                right: '1.25rem',
                background: 'transparent',
                border: 'none',
                color: 'var(--text-muted)',
                cursor: 'pointer',
              }}
            >
              <X size={22} />
            </button>

            <h3 style={{ fontSize: '1.35rem', marginBottom: '0.25rem' }}>
              {editingProduct ? 'Edit Product' : 'Add New Product'}
            </h3>
            <p style={{ fontSize: '0.82rem', color: 'var(--text-muted)', marginBottom: '1.5rem' }}>
              Configured for your active <strong>{storeType.toUpperCase()}</strong> store with multi-image gallery & smart specifications.
            </p>

            <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
              {/* Product Name */}
              <div>
                <label style={{ display: 'block', fontSize: '0.82rem', fontWeight: 600, marginBottom: '0.3rem' }}>Product Name *</label>
                <input
                  type="text"
                  required
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  className="form-input"
                  placeholder="e.g. Silk Evening Slip Dress"
                />
              </div>

              {/* Category & SKU */}
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                <div>
                  <label style={{ display: 'block', fontSize: '0.82rem', fontWeight: 600, marginBottom: '0.3rem' }}>Category *</label>
                  <select
                    required
                    value={formData.category_id}
                    onChange={(e) => setFormData({ ...formData, category_id: e.target.value })}
                    className="form-input"
                  >
                    <option value="">Select Category</option>
                    {categories.map((c) => (
                      <option key={c.id} value={c.id}>
                        {c.parent ? `${c.parent.name} > ${c.name}` : c.name}
                      </option>
                    ))}
                  </select>
                </div>
                <div>
                  <label style={{ display: 'block', fontSize: '0.82rem', fontWeight: 600, marginBottom: '0.3rem' }}>SKU Code *</label>
                  <input
                    type="text"
                    required
                    value={formData.sku}
                    onChange={(e) => setFormData({ ...formData, sku: e.target.value })}
                    className="form-input"
                  />
                </div>
              </div>

              {/* Price, Sale Price, Stock */}
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '1rem' }}>
                <div>
                  <label style={{ display: 'block', fontSize: '0.82rem', fontWeight: 600, marginBottom: '0.3rem' }}>Regular Price *</label>
                  <input
                    type="number"
                    step="0.01"
                    required
                    value={formData.price}
                    onChange={(e) => setFormData({ ...formData, price: e.target.value })}
                    className="form-input"
                  />
                </div>
                <div>
                  <label style={{ display: 'block', fontSize: '0.82rem', fontWeight: 600, marginBottom: '0.3rem' }}>Sale Price (Optional)</label>
                  <input
                    type="number"
                    step="0.01"
                    value={formData.sale_price}
                    onChange={(e) => setFormData({ ...formData, sale_price: e.target.value })}
                    className="form-input"
                  />
                </div>
                <div>
                  <label style={{ display: 'block', fontSize: '0.82rem', fontWeight: 600, marginBottom: '0.3rem' }}>Stock Quantity *</label>
                  <input
                    type="number"
                    required
                    value={formData.stock}
                    onChange={(e) => setFormData({ ...formData, stock: e.target.value })}
                    className="form-input"
                  />
                </div>
              </div>

              {/* Description */}
              <div>
                <label style={{ display: 'block', fontSize: '0.82rem', fontWeight: 600, marginBottom: '0.3rem' }}>Description</label>
                <textarea
                  rows={2}
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  className="form-input"
                  placeholder="Enter detailed product description..."
                />
              </div>

              {/* ============================================================== */}
              {/* MULTI-IMAGE PC UPLOAD & GALLERY MANAGER */}
              {/* ============================================================== */}
              <div style={{
                backgroundColor: 'var(--surface)',
                border: '1px solid var(--border-color)',
                borderRadius: 'var(--radius)',
                padding: '1.25rem',
              }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.5rem', flexWrap: 'wrap', gap: '0.5rem' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.45rem', fontWeight: 700, fontSize: '0.88rem' }}>
                    <ImagePlus size={16} color="var(--primary-color)" />
                    <span>Product Images & Gallery</span>
                    <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)', fontWeight: 400 }}>
                      ({formData.images.length} {formData.images.length === 1 ? 'photo' : 'photos'})
                    </span>
                  </div>
                  <span style={{ fontSize: '0.72rem', backgroundColor: 'rgba(217, 119, 6, 0.12)', color: '#d97706', padding: '0.2rem 0.6rem', borderRadius: '999px', fontWeight: 600 }}>
                    ⭐ Photo #1 = Catalog Cover
                  </span>
                </div>

                <p style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginBottom: '0.85rem' }}>
                  Upload high-resolution photos directly from your computer or paste web links. The first photo is displayed as the primary cover in the catalog.
                </p>

                {/* Hidden File Input */}
                <input
                  type="file"
                  ref={fileInputRef}
                  multiple
                  accept="image/jpeg,image/png,image/webp,image/gif,image/svg+xml,image/avif,image/bmp"
                  style={{ display: 'none' }}
                  onChange={handleFileUpload}
                />

                {/* Drag & Drop / Click PC Upload Box */}
                <div
                  onClick={() => !uploadingImages && fileInputRef.current?.click()}
                  onDragOver={(e) => { e.preventDefault(); e.stopPropagation(); }}
                  onDrop={(e) => {
                    e.preventDefault();
                    e.stopPropagation();
                    if (uploadingImages) return;
                    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
                      handleFileUpload({ target: { files: e.dataTransfer.files } });
                    }
                  }}
                  style={{
                    border: '2px dashed var(--border-color)',
                    borderRadius: 'var(--radius)',
                    padding: '1.25rem 1rem',
                    textAlign: 'center',
                    backgroundColor: 'var(--card-bg)',
                    cursor: uploadingImages ? 'not-allowed' : 'pointer',
                    transition: 'all 0.2s ease',
                    marginBottom: '1rem',
                    opacity: uploadingImages ? 0.7 : 1,
                  }}
                  onMouseEnter={(e) => !uploadingImages && (e.currentTarget.style.borderColor = 'var(--primary-color)')}
                  onMouseLeave={(e) => !uploadingImages && (e.currentTarget.style.borderColor = 'var(--border-color)')}
                >
                  {uploadingImages ? (
                    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '0.4rem' }}>
                      <RefreshCw size={24} className="animate-spin" color="var(--primary-color)" />
                      <span style={{ fontSize: '0.84rem', fontWeight: 600 }}>Uploading photo(s) from computer...</span>
                      <span style={{ fontSize: '0.74rem', color: 'var(--text-muted)' }}>Saving to server and generating gallery preview</span>
                    </div>
                  ) : (
                    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '0.35rem' }}>
                      <UploadCloud size={30} color="var(--primary-color)" />
                      <div style={{ fontSize: '0.85rem', fontWeight: 600 }}>
                        <span style={{ color: 'var(--primary-color)', textDecoration: 'underline' }}>Click to browse photos from PC</span> or drag & drop files here
                      </div>
                      <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)' }}>
                        Select multiple images: JPG, PNG, WEBP, GIF, SVG (Up to 12MB each)
                      </div>
                    </div>
                  )}
                </div>

                {uploadError && (
                  <div style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '0.5rem',
                    backgroundColor: 'rgba(239, 68, 68, 0.1)',
                    border: '1px solid rgba(239, 68, 68, 0.25)',
                    color: '#dc2626',
                    fontSize: '0.78rem',
                    padding: '0.5rem 0.75rem',
                    borderRadius: '6px',
                    marginBottom: '1rem',
                  }}>
                    <AlertCircle size={15} />
                    <span>{uploadError}</span>
                  </div>
                )}

                {/* Thumbnails Gallery Grid */}
                {formData.images.length > 0 ? (
                  <div style={{
                    display: 'grid',
                    gridTemplateColumns: 'repeat(auto-fill, minmax(130px, 1fr))',
                    gap: '0.75rem',
                    marginBottom: '1rem',
                  }}>
                    {formData.images.map((imgUrl, idx) => {
                      const isPrimary = idx === 0;
                      return (
                        <div
                          key={idx}
                          style={{
                            position: 'relative',
                            borderRadius: '8px',
                            overflow: 'hidden',
                            border: isPrimary ? '2px solid #d97706' : '1px solid var(--border-color)',
                            backgroundColor: 'var(--card-bg)',
                            boxShadow: isPrimary ? '0 0 0 1px #d97706' : 'none',
                            display: 'flex',
                            flexDirection: 'column',
                          }}
                        >
                          {/* Image Thumbnail */}
                          <div style={{ width: '100%', height: '110px', position: 'relative', backgroundColor: '#0f172a' }}>
                            <img
                              src={imgUrl}
                              alt={`Product preview ${idx + 1}`}
                              style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                              onError={(e) => {
                                e.currentTarget.src = 'https://placehold.co/150x150?text=Preview';
                              }}
                            />

                            {/* Badge */}
                            {isPrimary ? (
                              <span
                                style={{
                                  position: 'absolute',
                                  top: '6px',
                                  left: '6px',
                                  backgroundColor: '#d97706',
                                  color: '#fff',
                                  fontSize: '0.65rem',
                                  fontWeight: 700,
                                  padding: '0.15rem 0.4rem',
                                  borderRadius: '4px',
                                  display: 'flex',
                                  alignItems: 'center',
                                  gap: '0.2rem',
                                  boxShadow: '0 2px 4px rgba(0,0,0,0.3)',
                                }}
                              >
                                <Star size={10} fill="#fff" /> Primary
                              </span>
                            ) : (
                              <span
                                style={{
                                  position: 'absolute',
                                  top: '6px',
                                  left: '6px',
                                  backgroundColor: 'rgba(0,0,0,0.6)',
                                  color: '#fff',
                                  fontSize: '0.65rem',
                                  fontWeight: 600,
                                  padding: '0.15rem 0.35rem',
                                  borderRadius: '4px',
                                }}
                              >
                                #{idx + 1}
                              </span>
                            )}

                            {/* Delete Button */}
                            <button
                              type="button"
                              onClick={() => handleRemoveImage(idx)}
                              title="Remove image"
                              style={{
                                position: 'absolute',
                                top: '6px',
                                right: '6px',
                                backgroundColor: 'rgba(239, 68, 68, 0.85)',
                                color: '#fff',
                                border: 'none',
                                borderRadius: '4px',
                                width: '22px',
                                height: '22px',
                                display: 'flex',
                                alignItems: 'center',
                                justifySelf: 'center',
                                cursor: 'pointer',
                                padding: 0,
                                transition: 'background-color 0.15s ease',
                              }}
                              onMouseEnter={(e) => (e.currentTarget.style.backgroundColor = '#dc2626')}
                              onMouseLeave={(e) => (e.currentTarget.style.backgroundColor = 'rgba(239, 68, 68, 0.85)')}
                            >
                              <X size={13} style={{ margin: 'auto' }} />
                            </button>
                          </div>

                          {/* Action Bar */}
                          <div style={{ padding: '0.35rem', display: 'flex', justifyContent: 'center', backgroundColor: 'var(--surface)' }}>
                            {!isPrimary ? (
                              <button
                                type="button"
                                onClick={() => handleSetPrimaryImage(idx)}
                                style={{
                                  background: 'transparent',
                                  border: '1px solid var(--border-color)',
                                  color: 'var(--text-color)',
                                  fontSize: '0.68rem',
                                  fontWeight: 600,
                                  padding: '0.2rem 0.4rem',
                                  borderRadius: '4px',
                                  cursor: 'pointer',
                                  display: 'flex',
                                  alignItems: 'center',
                                  gap: '0.25rem',
                                  width: '100%',
                                  justifyContent: 'center',
                                }}
                                onMouseEnter={(e) => {
                                  e.currentTarget.style.borderColor = '#d97706';
                                  e.currentTarget.style.color = '#d97706';
                                }}
                                onMouseLeave={(e) => {
                                  e.currentTarget.style.borderColor = 'var(--border-color)';
                                  e.currentTarget.style.color = 'var(--text-color)';
                                }}
                              >
                                <Star size={11} /> Set as Cover
                              </button>
                            ) : (
                              <span style={{ fontSize: '0.68rem', color: '#d97706', fontWeight: 700 }}>
                                Primary Cover
                              </span>
                            )}
                          </div>
                        </div>
                      );
                    })}
                  </div>
                ) : (
                  <div style={{
                    padding: '0.85rem',
                    backgroundColor: 'rgba(239, 68, 68, 0.05)',
                    border: '1px dashed rgba(239, 68, 68, 0.3)',
                    borderRadius: '6px',
                    fontSize: '0.78rem',
                    color: '#dc2626',
                    marginBottom: '1rem',
                    textAlign: 'center',
                  }}>
                    No photos added yet. Upload at least 1 image from your PC above or paste a URL below.
                  </div>
                )}

                {/* Add via Web URL Field */}
                <div style={{ display: 'flex', gap: '0.5rem', alignItems: 'center' }}>
                  <div style={{ position: 'relative', flex: 1 }}>
                    <Link size={14} style={{ position: 'absolute', left: '0.75rem', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }} />
                    <input
                      type="url"
                      placeholder="Or paste external image URL (e.g. https://...)"
                      value={urlInput}
                      onChange={(e) => setUrlInput(e.target.value)}
                      onKeyDown={(e) => {
                        if (e.key === 'Enter') {
                          e.preventDefault();
                          handleAddUrlImage();
                        }
                      }}
                      className="form-input"
                      style={{ paddingLeft: '2.1rem', fontSize: '0.8rem', padding: '0.45rem 0.75rem 0.45rem 2.1rem' }}
                    />
                  </div>
                  <button
                    type="button"
                    onClick={handleAddUrlImage}
                    disabled={!urlInput.trim()}
                    className="btn-secondary"
                    style={{
                      fontSize: '0.78rem',
                      padding: '0.45rem 0.85rem',
                      opacity: !urlInput.trim() ? 0.6 : 1,
                      cursor: !urlInput.trim() ? 'not-allowed' : 'pointer',
                      whiteSpace: 'nowrap',
                    }}
                  >
                    + Add URL
                  </button>
                </div>
              </div>

              {/* ============================================================== */}
              {/* SMART DYNAMIC SPECIFICATIONS BUILDER */}
              {/* ============================================================== */}
              <div style={{
                backgroundColor: 'var(--surface)',
                border: '1px solid var(--border-color)',
                borderRadius: 'var(--radius)',
                padding: '1.25rem',
              }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.5rem', flexWrap: 'wrap', gap: '0.5rem' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.45rem', fontWeight: 700, fontSize: '0.88rem' }}>
                    <Sparkles size={16} color="var(--primary-color)" />
                    <span>Smart Dynamic Specifications</span>
                    <span style={{ fontSize: '0.72rem', backgroundColor: 'var(--primary-color)', color: '#fff', padding: '0.15rem 0.5rem', borderRadius: '999px', textTransform: 'capitalize' }}>
                      Handcrafted Catalog
                    </span>
                  </div>

                  <button
                    type="button"
                    onClick={applyTemplateDefaults}
                    style={{
                      background: 'transparent',
                      border: '1px dashed var(--primary-color)',
                      color: 'var(--primary-color)',
                      fontSize: '0.74rem',
                      fontWeight: 700,
                      padding: '0.25rem 0.6rem',
                      borderRadius: '4px',
                      cursor: 'pointer',
                      display: 'flex',
                      alignItems: 'center',
                      gap: '0.3rem',
                    }}
                    title="Load standard recommended defaults for this store type"
                  >
                    ⚡ Auto-fill Recommended
                  </button>
                </div>

                <p style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginBottom: '1rem' }}>
                  Click any preset chip to fill instantly, or type custom values. Powers live storefront filters, color swatches, and size selectors.
                </p>

                {/* Pre-configured Preset Cards */}
                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.85rem' }}>
                  {activePresets.map((preset) => {
                    // ==============================================================
                    // SPECIALIZED MULTI-COLOR VARIANTS & AVAILABILITY MANAGER
                    // ==============================================================
                    if (preset.id === 'color') {
                      return (
                        <div
                          key={preset.id}
                          style={{
                            backgroundColor: 'var(--card-bg)',
                            border: colorAttributes.length > 0 ? '1.5px solid var(--primary-color)' : '1px solid var(--border-color)',
                            borderRadius: '8px',
                            padding: '1rem',
                            display: 'flex',
                            flexDirection: 'column',
                            gap: '0.85rem',
                          }}
                        >
                          {/* Header */}
                          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '0.5rem' }}>
                            <div>
                              <div style={{ display: 'flex', alignItems: 'center', gap: '0.45rem' }}>
                                <span style={{ fontSize: '1.1rem' }}>🎨</span>
                                <span style={{ fontSize: '0.88rem', fontWeight: 800 }}>Color Variants, Photos & Availability</span>
                                <span style={{
                                  fontSize: '0.7rem',
                                  backgroundColor: colorAttributes.length > 0 ? 'var(--primary-color)' : 'var(--surface)',
                                  color: colorAttributes.length > 0 ? '#fff' : 'var(--text-muted)',
                                  padding: '0.1rem 0.5rem',
                                  borderRadius: '999px',
                                  fontWeight: 700,
                                }}>
                                  {colorAttributes.length} {colorAttributes.length === 1 ? 'Color' : 'Colors'}
                                </span>
                              </div>
                              <p style={{ fontSize: '0.74rem', color: 'var(--text-muted)', margin: '0.2rem 0 0' }}>
                                Add multiple colors, link matching photos (switches main view when customer selects a color), and set in-stock vs sold-out.
                              </p>
                            </div>

                            <button
                              type="button"
                              onClick={() => handleAddColorVariant('')}
                              style={{
                                backgroundColor: 'var(--surface)',
                                border: '1px solid var(--primary-color)',
                                color: 'var(--primary-color)',
                                fontSize: '0.76rem',
                                fontWeight: 700,
                                padding: '0.35rem 0.75rem',
                                borderRadius: '6px',
                                cursor: 'pointer',
                                display: 'inline-flex',
                                alignItems: 'center',
                                gap: '0.35rem',
                              }}
                            >
                              <Plus size={14} /> + Add Color Variant
                            </button>
                          </div>

                          {/* Empty State */}
                          {colorAttributes.length === 0 ? (
                            <div style={{
                              padding: '1rem',
                              textAlign: 'center',
                              backgroundColor: 'var(--surface)',
                              border: '1px dashed var(--border-color)',
                              borderRadius: '6px',
                            }}>
                              <p style={{ fontSize: '0.78rem', color: 'var(--text-muted)', margin: '0 0 0.6rem' }}>
                                No color variants added yet. Click a quick color below or add custom colors:
                              </p>
                              <div style={{ display: 'flex', gap: '0.4rem', justifyContent: 'center', flexWrap: 'wrap', alignItems: 'center' }}>
                                {preset.swatches?.slice(0, 8).map((swatch) => (
                                  <button
                                    key={swatch.name}
                                    type="button"
                                    onClick={() => handleAddColorVariant(swatch.name)}
                                    style={{
                                      display: 'inline-flex',
                                      alignItems: 'center',
                                      gap: '0.3rem',
                                      fontSize: '0.72rem',
                                      padding: '0.25rem 0.55rem',
                                      borderRadius: '999px',
                                      border: '1px solid var(--border-color)',
                                      backgroundColor: 'var(--card-bg)',
                                      cursor: 'pointer',
                                    }}
                                  >
                                    <span style={{ width: '8px', height: '8px', borderRadius: '50%', backgroundColor: swatch.hex, border: swatch.border ? '1px solid #ccc' : 'none' }} />
                                    + {swatch.name}
                                  </button>
                                ))}
                              </div>
                            </div>
                          ) : (
                            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                              {colorAttributes.map((colorItem, cIdx) => {
                                const isAvail = colorItem.is_available !== false && colorItem.is_available !== 0 && colorItem.is_available !== '0';
                                const hasPic = Boolean(colorItem.image_url);

                                return (
                                  <div
                                    key={cIdx}
                                    style={{
                                      backgroundColor: 'var(--surface)',
                                      border: '1px solid var(--border-color)',
                                      borderRadius: '6px',
                                      padding: '0.85rem',
                                      display: 'flex',
                                      flexDirection: 'column',
                                      gap: '0.65rem',
                                    }}
                                  >
                                    {/* Top Row: Color Name & Stock Switch & Delete */}
                                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '0.5rem', flexWrap: 'wrap' }}>
                                      <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', flex: '1 1 240px' }}>
                                        <span style={{ fontSize: '0.75rem', fontWeight: 800, color: 'var(--primary-color)' }}>Color #{cIdx + 1}</span>
                                        <input
                                          type="text"
                                          placeholder="Color Name (e.g. Emerald Green, Terracotta Rust)"
                                          value={colorItem.value}
                                          onChange={(e) => handleUpdateColorVariant(cIdx, 'value', e.target.value)}
                                          className="form-input"
                                          style={{ padding: '0.35rem 0.6rem', fontSize: '0.82rem', fontWeight: 600, width: '100%', maxWidth: '280px' }}
                                        />
                                      </div>

                                      {/* In-Stock / Sold-Out Toggle Pill & Delete */}
                                      <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                                        <div style={{ display: 'inline-flex', borderRadius: '6px', overflow: 'hidden', border: '1px solid var(--border-color)' }}>
                                          <button
                                            type="button"
                                            onClick={() => handleUpdateColorVariant(cIdx, 'is_available', true)}
                                            style={{
                                              padding: '0.25rem 0.65rem',
                                              fontSize: '0.74rem',
                                              fontWeight: 700,
                                              border: 'none',
                                              cursor: 'pointer',
                                              backgroundColor: isAvail ? '#10B981' : 'var(--card-bg)',
                                              color: isAvail ? '#FFFFFF' : 'var(--text-muted)',
                                              transition: 'all 0.15s ease',
                                              display: 'flex',
                                              alignItems: 'center',
                                              gap: '0.25rem',
                                            }}
                                            title="Mark this color option as in stock"
                                          >
                                            <span>●</span> In Stock
                                          </button>
                                          <button
                                            type="button"
                                            onClick={() => handleUpdateColorVariant(cIdx, 'is_available', false)}
                                            style={{
                                              padding: '0.25rem 0.65rem',
                                              fontSize: '0.74rem',
                                              fontWeight: 700,
                                              border: 'none',
                                              cursor: 'pointer',
                                              backgroundColor: !isAvail ? '#EF4444' : 'var(--card-bg)',
                                              color: !isAvail ? '#FFFFFF' : 'var(--text-muted)',
                                              transition: 'all 0.15s ease',
                                              display: 'flex',
                                              alignItems: 'center',
                                              gap: '0.25rem',
                                            }}
                                            title="Mark this color option as sold out"
                                          >
                                            <span>✕</span> Sold Out
                                          </button>
                                        </div>

                                        <button
                                          type="button"
                                          onClick={() => handleRemoveColorVariant(cIdx)}
                                          style={{
                                            background: 'transparent',
                                            border: 'none',
                                            color: '#EF4444',
                                            cursor: 'pointer',
                                            padding: '0.25rem',
                                            display: 'flex',
                                            alignItems: 'center',
                                          }}
                                          title="Remove this color variant"
                                        >
                                          <Trash2 size={16} />
                                        </button>
                                      </div>
                                    </div>

                                    {/* Quick Preset Color Swatch Chips */}
                                    {preset.swatches && (
                                      <div style={{ display: 'flex', gap: '0.35rem', flexWrap: 'wrap', alignItems: 'center' }}>
                                        <span style={{ fontSize: '0.68rem', color: 'var(--text-muted)' }}>Quick name:</span>
                                        {preset.swatches.map((swatch) => {
                                          const isCur = (colorItem.value || '').toLowerCase() === swatch.name.toLowerCase();
                                          return (
                                            <button
                                              key={swatch.name}
                                              type="button"
                                              onClick={() => handleUpdateColorVariant(cIdx, 'value', swatch.name)}
                                              style={{
                                                display: 'inline-flex',
                                                alignItems: 'center',
                                                gap: '0.25rem',
                                                fontSize: '0.68rem',
                                                padding: '0.15rem 0.45rem',
                                                borderRadius: '999px',
                                                border: isCur ? '1px solid var(--primary-color)' : '1px solid var(--border-color)',
                                                backgroundColor: isCur ? 'rgba(var(--primary-rgb, 99, 102, 241), 0.15)' : 'var(--card-bg)',
                                                cursor: 'pointer',
                                                fontWeight: isCur ? 700 : 500,
                                              }}
                                            >
                                              <span style={{ width: '8px', height: '8px', borderRadius: '50%', backgroundColor: swatch.hex, border: swatch.border ? '1px solid #ccc' : 'none' }} />
                                              {swatch.name}
                                            </button>
                                          );
                                        })}
                                      </div>
                                    )}

                                    {/* Color Photo Picker Section */}
                                    <div style={{
                                      backgroundColor: 'var(--card-bg)',
                                      border: hasPic ? '1px solid rgba(16, 185, 129, 0.4)' : '1px dashed var(--border-color)',
                                      borderRadius: '6px',
                                      padding: '0.6rem 0.75rem',
                                      display: 'flex',
                                      flexDirection: 'column',
                                      gap: '0.45rem',
                                    }}>
                                      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '0.4rem' }}>
                                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', fontSize: '0.74rem', fontWeight: 700 }}>
                                          <ImagePlus size={14} color="var(--primary-color)" />
                                          <span>Color Photo (Switches main photo when customer selects this color):</span>
                                        </div>
                                        {hasPic && (
                                          <button
                                            type="button"
                                            onClick={() => handleUpdateColorVariant(cIdx, 'image_url', '')}
                                            style={{
                                              background: 'transparent',
                                              border: 'none',
                                              color: '#EF4444',
                                              fontSize: '0.7rem',
                                              fontWeight: 600,
                                              cursor: 'pointer',
                                              padding: 0,
                                            }}
                                          >
                                            Remove Photo
                                          </button>
                                        )}
                                      </div>

                                      {/* 1-Click Picker from Uploaded Product Gallery */}
                                      {formData.images && formData.images.length > 0 && (
                                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.45rem', flexWrap: 'wrap' }}>
                                          <span style={{ fontSize: '0.68rem', color: 'var(--text-muted)' }}>Click photo from gallery:</span>
                                          {formData.images.map((imgUrl, imgIdx) => {
                                            const isSelectedImg = colorItem.image_url === imgUrl;
                                            return (
                                              <button
                                                key={imgIdx}
                                                type="button"
                                                onClick={() => handleUpdateColorVariant(cIdx, 'image_url', imgUrl)}
                                                title={`Click to link Photo #${imgIdx + 1} to ${colorItem.value || 'this color'}`}
                                                style={{
                                                  width: '36px',
                                                  height: '42px',
                                                  padding: 0,
                                                  borderRadius: '4px',
                                                  border: isSelectedImg ? '2.5px solid var(--primary-color)' : '1px solid var(--border-color)',
                                                  overflow: 'hidden',
                                                  cursor: 'pointer',
                                                  position: 'relative',
                                                  backgroundColor: '#000',
                                                  opacity: isSelectedImg ? 1 : 0.65,
                                                  transform: isSelectedImg ? 'scale(1.08)' : 'scale(1)',
                                                  transition: 'all 0.15s ease',
                                                }}
                                              >
                                                <img src={imgUrl} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                                                {isSelectedImg && (
                                                  <div style={{
                                                    position: 'absolute',
                                                    top: '2px',
                                                    right: '2px',
                                                    backgroundColor: 'var(--primary-color)',
                                                    color: '#fff',
                                                    borderRadius: '50%',
                                                    width: '12px',
                                                    height: '12px',
                                                    display: 'flex',
                                                    alignItems: 'center',
                                                    justifyContent: 'center',
                                                    fontSize: '9px',
                                                  }}>
                                                    ✓
                                                  </div>
                                                )}
                                              </button>
                                            );
                                          })}
                                        </div>
                                      )}

                                      {/* Manual URL Input Field */}
                                      <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                                        <input
                                          type="text"
                                          placeholder="Or paste direct image URL (https://...)"
                                          value={colorItem.image_url || ''}
                                          onChange={(e) => handleUpdateColorVariant(cIdx, 'image_url', e.target.value)}
                                          className="form-input"
                                          style={{ padding: '0.25rem 0.55rem', fontSize: '0.74rem', width: '100%' }}
                                        />
                                        {hasPic && (
                                          <img
                                            src={colorItem.image_url}
                                            alt=""
                                            style={{
                                              width: '30px',
                                              height: '34px',
                                              objectFit: 'cover',
                                              borderRadius: '3px',
                                              border: '1px solid var(--border-color)',
                                              flexShrink: 0,
                                            }}
                                          />
                                        )}
                                      </div>
                                    </div>
                                  </div>
                                );
                              })}

                              <button
                                type="button"
                                onClick={() => handleAddColorVariant('')}
                                style={{
                                  backgroundColor: 'transparent',
                                  border: '1px dashed var(--primary-color)',
                                  color: 'var(--primary-color)',
                                  fontSize: '0.76rem',
                                  fontWeight: 700,
                                  padding: '0.45rem',
                                  borderRadius: '6px',
                                  cursor: 'pointer',
                                  display: 'flex',
                                  alignItems: 'center',
                                  justifyContent: 'center',
                                  gap: '0.35rem',
                                }}
                              >
                                <Plus size={14} /> + Add Another Color Variant
                              </button>
                            </div>
                          )}
                        </div>
                      );
                    }

                    // ==============================================================
                    // SPECIALIZED MULTI-SIZE VARIANTS & AVAILABILITY MANAGER
                    // ==============================================================
                    if (preset.id === 'size') {
                      return (
                        <div
                          key={preset.id}
                          style={{
                            backgroundColor: 'var(--card-bg)',
                            border: sizeAttributes.length > 0 ? '1.5px solid var(--primary-color)' : '1px solid var(--border-color)',
                            borderRadius: '8px',
                            padding: '1rem',
                            display: 'flex',
                            flexDirection: 'column',
                            gap: '0.85rem',
                          }}
                        >
                          {/* Header */}
                          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '0.5rem' }}>
                            <div>
                              <div style={{ display: 'flex', alignItems: 'center', gap: '0.45rem' }}>
                                <span style={{ fontSize: '1.1rem' }}>📏</span>
                                <span style={{ fontSize: '0.88rem', fontWeight: 800 }}>Sizes Available & Stock Status</span>
                                <span style={{
                                  fontSize: '0.7rem',
                                  backgroundColor: sizeAttributes.length > 0 ? 'var(--primary-color)' : 'var(--surface)',
                                  color: sizeAttributes.length > 0 ? '#fff' : 'var(--text-muted)',
                                  padding: '0.1rem 0.5rem',
                                  borderRadius: '999px',
                                  fontWeight: 700,
                                }}>
                                  {sizeAttributes.length} {sizeAttributes.length === 1 ? 'Size' : 'Sizes'}
                                </span>
                              </div>
                              <p style={{ fontSize: '0.74rem', color: 'var(--text-muted)', margin: '0.2rem 0 0' }}>
                                Add multiple sizes to this product and individually toggle each size as <strong>In Stock</strong> or <strong>Sold Out</strong>.
                              </p>
                            </div>
                          </div>

                          {/* Quick Pick Pills Row */}
                          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.35rem' }}>
                            <span style={{ fontSize: '0.7rem', color: 'var(--text-muted)', fontWeight: 600 }}>
                              Click to Add / Remove Standard Sizes:
                            </span>
                            <div style={{ display: 'flex', gap: '0.4rem', flexWrap: 'wrap', alignItems: 'center' }}>
                              {(preset.pills || ['XS', 'S', 'M', 'L', 'XL', '2XL', '3XL', 'Free Size']).map((pill) => {
                                const isAdded = sizeAttributes.some((s) => s.value.toLowerCase() === pill.toLowerCase());
                                return (
                                  <button
                                    key={pill}
                                    type="button"
                                    onClick={() => handleToggleSizeVariant(pill)}
                                    style={{
                                      fontSize: '0.75rem',
                                      fontWeight: 700,
                                      padding: '0.25rem 0.65rem',
                                      borderRadius: '6px',
                                      border: isAdded ? '1.5px solid var(--primary-color)' : '1px solid var(--border-color)',
                                      backgroundColor: isAdded ? 'var(--primary-color)' : 'var(--surface)',
                                      color: isAdded ? '#ffffff' : 'var(--text-main)',
                                      cursor: 'pointer',
                                      display: 'inline-flex',
                                      alignItems: 'center',
                                      gap: '0.3rem',
                                      transition: 'all 0.15s ease',
                                    }}
                                  >
                                    {isAdded ? '✓ ' + pill : '+ ' + pill}
                                  </button>
                                );
                              })}
                            </div>
                          </div>

                          {/* Custom Size Adder */}
                          <div style={{ display: 'flex', gap: '0.45rem', alignItems: 'center' }}>
                            <input
                              type="text"
                              placeholder="Or type custom size (e.g. 38, 40, Custom Fit)"
                              value={customSizeInput}
                              onChange={(e) => setCustomSizeInput(e.target.value)}
                              onKeyDown={(e) => {
                                if (e.key === 'Enter') {
                                  e.preventDefault();
                                  if (customSizeInput.trim()) {
                                    handleAddSizeVariant(customSizeInput.trim());
                                    setCustomSizeInput('');
                                  }
                                }
                              }}
                              className="form-input"
                              style={{ padding: '0.3rem 0.6rem', fontSize: '0.78rem', maxWidth: '280px' }}
                            />
                            <button
                              type="button"
                              onClick={() => {
                                if (customSizeInput.trim()) {
                                  handleAddSizeVariant(customSizeInput.trim());
                                  setCustomSizeInput('');
                                }
                              }}
                              style={{
                                padding: '0.3rem 0.75rem',
                                fontSize: '0.76rem',
                                fontWeight: 700,
                                borderRadius: '6px',
                                border: '1px solid var(--primary-color)',
                                backgroundColor: 'var(--surface)',
                                color: 'var(--primary-color)',
                                cursor: 'pointer',
                              }}
                            >
                              + Add Size
                            </button>
                          </div>

                          {/* Sizes List with In Stock / Sold Out Toggles */}
                          {sizeAttributes.length === 0 ? (
                            <div style={{
                              padding: '1rem',
                              textAlign: 'center',
                              backgroundColor: 'var(--surface)',
                              borderRadius: '6px',
                              fontSize: '0.78rem',
                              color: 'var(--text-muted)',
                              border: '1px dashed var(--border-color)',
                            }}>
                              No sizes added yet. Click one of the standard sizes above or enter a custom size.
                            </div>
                          ) : (
                            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.45rem' }}>
                              <span style={{ fontSize: '0.7rem', color: 'var(--text-muted)', fontWeight: 600 }}>
                                Active Sizes & Stock Availability ({sizeAttributes.length}):
                              </span>
                              <div style={{
                                display: 'grid',
                                gridTemplateColumns: 'repeat(auto-fill, minmax(220px, 1fr))',
                                gap: '0.5rem',
                              }}>
                                {sizeAttributes.map((sizeItem, sIdx) => {
                                  const isAvail = sizeItem.is_available !== false && sizeItem.is_available !== 0 && sizeItem.is_available !== '0';
                                  return (
                                    <div
                                      key={sIdx}
                                      style={{
                                        display: 'flex',
                                        alignItems: 'center',
                                        justifyContent: 'space-between',
                                        padding: '0.45rem 0.65rem',
                                        borderRadius: '6px',
                                        backgroundColor: 'var(--surface)',
                                        border: isAvail ? '1px solid #10B981' : '1px solid #EF4444',
                                        gap: '0.5rem',
                                      }}
                                    >
                                      {/* Size Badge */}
                                      <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                                        <span style={{
                                          fontWeight: 800,
                                          fontSize: '0.88rem',
                                          color: 'var(--text-main)',
                                        }}>
                                          {sizeItem.value}
                                        </span>
                                      </div>

                                      {/* Status Toggle Switch */}
                                      <div style={{ display: 'flex', alignItems: 'center', gap: '0.35rem' }}>
                                        <button
                                          type="button"
                                          onClick={() => handleUpdateSizeVariant(sIdx, 'is_available', !isAvail)}
                                          style={{
                                            padding: '0.2rem 0.55rem',
                                            borderRadius: '4px',
                                            fontSize: '0.72rem',
                                            fontWeight: 700,
                                            border: 'none',
                                            cursor: 'pointer',
                                            backgroundColor: isAvail ? 'rgba(16, 185, 129, 0.15)' : 'rgba(239, 68, 68, 0.15)',
                                            color: isAvail ? '#059669' : '#DC2626',
                                            display: 'inline-flex',
                                            alignItems: 'center',
                                            gap: '0.25rem',
                                          }}
                                          title={`Click to toggle availability for size ${sizeItem.value}`}
                                        >
                                          <span>{isAvail ? '● In Stock' : '✕ Sold Out'}</span>
                                        </button>

                                        {/* Remove Size Button */}
                                        <button
                                          type="button"
                                          onClick={() => handleRemoveSizeVariant(sIdx)}
                                          style={{
                                            background: 'none',
                                            border: 'none',
                                            color: 'var(--text-muted)',
                                            cursor: 'pointer',
                                            padding: '0.15rem',
                                          }}
                                          title={`Remove size ${sizeItem.value}`}
                                        >
                                          <X size={14} />
                                        </button>
                                      </div>
                                    </div>
                                  );
                                })}
                              </div>
                            </div>
                          )}
                        </div>
                      );
                    }

                    // ==============================================================
                    // STANDARD ATTRIBUTE PRESET CARD (Size, Fabric, etc.)
                    // ==============================================================
                    const currentVal = getAttrVal(preset.id);
                    const hasValue = Boolean(currentVal);

                    return (
                      <div
                        key={preset.id}
                        style={{
                          backgroundColor: 'var(--card-bg)',
                          border: hasValue ? '1px solid var(--primary-color)' : '1px solid var(--border-color)',
                          borderRadius: '8px',
                          padding: '0.85rem',
                          display: 'flex',
                          flexDirection: 'column',
                          gap: '0.5rem',
                          transition: 'border-color 0.2s ease',
                        }}
                      >
                        {/* Title & Live Input Row */}
                        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '0.5rem', flexWrap: 'wrap' }}>
                          <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                            <span style={{ fontSize: '1rem' }}>{preset.icon}</span>
                            <span style={{ fontSize: '0.82rem', fontWeight: 700 }}>{preset.label}</span>
                            <span style={{ fontSize: '0.68rem', color: 'var(--text-muted)', fontFamily: 'monospace' }}>({preset.id})</span>
                          </div>

                          <div style={{ display: 'flex', alignItems: 'center', gap: '0.35rem', flex: '1 1 220px', maxWidth: '320px' }}>
                            <input
                              type="text"
                              placeholder={preset.placeholder}
                              value={currentVal}
                              onChange={(e) => setAttrVal(preset.id, e.target.value)}
                              className="form-input"
                              style={{ padding: '0.35rem 0.6rem', fontSize: '0.8rem', width: '100%' }}
                            />
                            {hasValue && (
                              <button
                                type="button"
                                onClick={() => setAttrVal(preset.id, '')}
                                title="Clear this field"
                                style={{
                                  background: 'transparent',
                                  border: 'none',
                                  color: 'var(--text-muted)',
                                  cursor: 'pointer',
                                  padding: '0.2rem',
                                  display: 'flex',
                                  alignItems: 'center',
                                }}
                              >
                                <X size={15} />
                              </button>
                            )}
                          </div>
                        </div>

                        {/* Size Pills */}
                        {preset.pills && (
                          <div style={{ display: 'flex', gap: '0.35rem', flexWrap: 'wrap', alignItems: 'center' }}>
                            <span style={{ fontSize: '0.7rem', color: 'var(--text-muted)', marginRight: '0.2rem' }}>Quick Pick:</span>
                            {preset.pills.map((pill) => {
                              const isSelected = currentVal === pill;
                              return (
                                <button
                                  key={pill}
                                  type="button"
                                  onClick={() => setAttrVal(preset.id, pill)}
                                  style={{
                                    fontSize: '0.72rem',
                                    fontWeight: isSelected ? 700 : 500,
                                    padding: '0.2rem 0.55rem',
                                    borderRadius: '999px',
                                    border: isSelected ? '1px solid var(--primary-color)' : '1px solid var(--border-color)',
                                    backgroundColor: isSelected ? 'var(--primary-color)' : 'var(--surface)',
                                    color: isSelected ? '#ffffff' : 'var(--text-color)',
                                    cursor: 'pointer',
                                    transition: 'all 0.15s ease',
                                  }}
                                >
                                  {pill}
                                </button>
                              );
                            })}
                          </div>
                        )}

                        {/* Chips */}
                        {preset.chips && (
                          <div style={{ display: 'flex', gap: '0.35rem', flexWrap: 'wrap', alignItems: 'center' }}>
                            <span style={{ fontSize: '0.7rem', color: 'var(--text-muted)', marginRight: '0.2rem' }}>Suggestions:</span>
                            {preset.chips.map((chip) => {
                              const isSelected = currentVal === chip;
                              return (
                                <button
                                  key={chip}
                                  type="button"
                                  onClick={() => setAttrVal(preset.id, chip)}
                                  style={{
                                    fontSize: '0.7rem',
                                    fontWeight: isSelected ? 700 : 500,
                                    padding: '0.18rem 0.5rem',
                                    borderRadius: '4px',
                                    border: isSelected ? '1px solid var(--primary-color)' : '1px solid var(--border-color)',
                                    backgroundColor: isSelected ? 'var(--primary-color)' : 'var(--surface)',
                                    color: isSelected ? '#ffffff' : 'var(--text-muted)',
                                    cursor: 'pointer',
                                    transition: 'all 0.15s ease',
                                  }}
                                >
                                  {chip}
                                </button>
                              );
                            })}
                          </div>
                        )}

                        {preset.help && (
                          <span style={{ fontSize: '0.68rem', color: 'var(--text-muted)' }}>
                            💡 {preset.help}
                          </span>
                        )}
                      </div>
                    );
                  })}
                </div>

                {/* Extra Custom Specifications */}
                <div style={{
                  marginTop: '1rem',
                  paddingTop: '0.85rem',
                  borderTop: '1px dashed var(--border-color)',
                }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.65rem' }}>
                    <span style={{ fontSize: '0.78rem', fontWeight: 600, color: 'var(--text-muted)' }}>
                      Extra Custom Specifications ({customAttributes.length})
                    </span>
                    <button
                      type="button"
                      onClick={handleAddCustomAttribute}
                      style={{
                        background: 'transparent',
                        border: '1px dashed var(--primary-color)',
                        color: 'var(--primary-color)',
                        fontSize: '0.72rem',
                        fontWeight: 700,
                        padding: '0.2rem 0.5rem',
                        borderRadius: '4px',
                        cursor: 'pointer',
                        display: 'flex',
                        alignItems: 'center',
                        gap: '0.25rem',
                      }}
                    >
                      <Plus size={12} /> + Add Custom Field
                    </button>
                  </div>

                  {customAttributes.length > 0 && (
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '0.45rem' }}>
                      {customAttributes.map((attr, customIdx) => (
                        <div key={customIdx} style={{ display: 'flex', gap: '0.45rem', alignItems: 'center' }}>
                          <input
                            type="text"
                            placeholder="Specification (e.g. care_instructions, water_resistance)"
                            value={attr.name}
                            onChange={(e) => handleCustomAttributeChange(attr, 'name', e.target.value)}
                            className="form-input"
                            style={{ flex: 1, padding: '0.35rem 0.6rem', fontSize: '0.78rem' }}
                          />
                          <input
                            type="text"
                            placeholder="Value (e.g. Dry Clean Only, 50m Waterproof)"
                            value={attr.value}
                            onChange={(e) => handleCustomAttributeChange(attr, 'value', e.target.value)}
                            className="form-input"
                            style={{ flex: 1.5, padding: '0.35rem 0.6rem', fontSize: '0.78rem' }}
                          />
                          <button
                            type="button"
                            onClick={() => handleRemoveCustomAttribute(attr)}
                            style={{
                              background: 'transparent',
                              border: 'none',
                              color: '#EF4444',
                              cursor: 'pointer',
                              padding: '0.25rem',
                            }}
                            title="Delete this custom specification"
                          >
                            <Trash2 size={15} />
                          </button>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>

              {/* Submit Button */}
              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.75rem', marginTop: '0.5rem' }}>
                <button
                  type="button"
                  onClick={() => setModalOpen(false)}
                  className="btn-secondary"
                  style={{ fontSize: '0.85rem' }}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={saving}
                  className="btn-primary"
                  style={{ fontSize: '0.85rem' }}
                >
                  {saving ? 'Saving...' : editingProduct ? 'Save Changes' : 'Create Product'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
