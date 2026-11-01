import React, { useState, useEffect, useRef } from 'react';
import axios from 'axios';
import { useStore } from '../../context/StoreContext';
import {
  Plus,
  Trash2,
  FolderTree,
  UploadCloud,
  ImagePlus,
  X,
  AlertCircle,
  RefreshCw,
  Link,
  Edit,
  Check,
} from 'lucide-react';

export default function CategoryManager() {
  const { store, storeType } = useStore();
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [newCatName, setNewCatName] = useState('');
  const [newCatImage, setNewCatImage] = useState('');
  const [newCatParentId, setNewCatParentId] = useState('');
  const [editingCategory, setEditingCategory] = useState(null);
  const [saving, setSaving] = useState(false);
  const [uploadingImage, setUploadingImage] = useState(false);
  const [uploadError, setUploadError] = useState(null);
  const [message, setMessage] = useState(null);
  const fileInputRef = useRef(null);

  const fetchCategories = async () => {
    try {
      setLoading(true);
      const res = await axios.get('/api/categories');
      setCategories(res.data || []);
    } catch (err) {
      console.error('Error fetching categories:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCategories();
  }, [storeType]);

  const handleFileUpload = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setUploadingImage(true);
    setUploadError(null);

    const formData = new FormData();
    formData.append('image', file);

    try {
      const res = await axios.post('/api/admin/categories/upload-image', formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });

      if (res.data?.success && res.data.url) {
        setNewCatImage(res.data.url);
      }
    } catch (err) {
      console.error('Failed to upload category cover image:', err);
      setUploadError(
        err.response?.data?.message || 'Failed to upload image from your computer. Please check file format.'
      );
    } finally {
      setUploadingImage(false);
      if (fileInputRef.current) fileInputRef.current.value = '';
    }
  };

  const handleSaveCategory = async (e) => {
    e.preventDefault();
    if (!newCatName.trim()) return;
    setSaving(true);
    setMessage(null);

    try {
      if (editingCategory) {
        await axios.put(`/api/admin/categories/${editingCategory.id}`, {
          name: newCatName.trim(),
          image: newCatImage || null,
          parent_id: newCatParentId ? Number(newCatParentId) : null,
        });
        setMessage('Category updated successfully!');
      } else {
        await axios.post('/api/admin/categories', {
          store_id: store?.id || 1,
          name: newCatName.trim(),
          image: newCatImage || 'https://images.unsplash.com/photo-1544022613-e87ca75a784a?w=600&auto=format&fit=crop&q=80',
          parent_id: newCatParentId ? Number(newCatParentId) : null,
        });
        setMessage('New category created successfully!');
      }

      setNewCatName('');
      setNewCatImage('');
      setNewCatParentId('');
      setEditingCategory(null);
      setUploadError(null);
      fetchCategories();
      setTimeout(() => setMessage(null), 4000);
    } catch (err) {
      console.error('Failed to save category:', err);
      alert(err.response?.data?.message || 'Error saving category.');
    } finally {
      setSaving(false);
    }
  };

  const handleStartEdit = (cat) => {
    setEditingCategory(cat);
    setNewCatName(cat.name);
    setNewCatImage(cat.image || '');
    setNewCatParentId(cat.parent_id ? String(cat.parent_id) : '');
    setUploadError(null);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleCancelEdit = () => {
    setEditingCategory(null);
    setNewCatName('');
    setNewCatImage('');
    setNewCatParentId('');
    setUploadError(null);
  };

  const handleDelete = async (id) => {
    if (!confirm('Are you sure you want to delete this category? Associated products may be unassigned.')) return;
    try {
      await axios.delete(`/api/admin/categories/${id}`);
      if (editingCategory?.id === id) {
        handleCancelEdit();
      }
      fetchCategories();
    } catch (err) {
      console.error('Failed to delete category:', err);
    }
  };

  return (
    <div style={{
      backgroundColor: 'var(--card-bg)',
      border: '1px solid var(--border-color)',
      borderRadius: 'var(--radius)',
      padding: '2rem',
    }}>
      <div style={{ marginBottom: '1.5rem' }}>
        <h2 style={{ fontSize: '1.5rem' }}>Category Manager</h2>
        <p style={{ color: 'var(--text-muted)', fontSize: '0.88rem' }}>
          Organize departments and collections for <strong>{store?.name}</strong> ({storeType}).
        </p>
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
          display: 'flex',
          alignItems: 'center',
          gap: '0.5rem',
        }}>
          <Check size={16} />
          <span>{message}</span>
        </div>
      )}

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(340px, 1fr))', gap: '2rem' }}>
        {/* Create / Edit Category Form */}
        <div style={{
          backgroundColor: 'var(--surface)',
          border: '1px solid var(--border-color)',
          borderRadius: 'var(--radius)',
          padding: '1.5rem',
          height: 'fit-content',
        }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
            <h3 style={{ fontSize: '1.1rem', display: 'flex', alignItems: 'center', gap: '0.45rem', margin: 0 }}>
              {editingCategory ? (
                <>
                  <Edit size={18} color="var(--primary-color)" /> Edit Category
                </>
              ) : (
                <>
                  <Plus size={18} color="var(--primary-color)" /> Add New Category
                </>
              )}
            </h3>

            {editingCategory && (
              <button
                type="button"
                onClick={handleCancelEdit}
                style={{
                  background: 'transparent',
                  border: 'none',
                  color: 'var(--text-muted)',
                  fontSize: '0.78rem',
                  cursor: 'pointer',
                  textDecoration: 'underline',
                }}
              >
                Cancel Edit
              </button>
            )}
          </div>

          <form onSubmit={handleSaveCategory} style={{ display: 'flex', flexDirection: 'column', gap: '1.15rem' }}>
            {/* Category Name */}
            <div>
              <label style={{ display: 'block', fontSize: '0.82rem', fontWeight: 600, marginBottom: '0.3rem' }}>
                Category Name *
              </label>
              <input
                type="text"
                required
                value={newCatName}
                onChange={(e) => setNewCatName(e.target.value)}
                className="form-input"
                placeholder="e.g. Silk Blouses or Handmade Collection"
              />
            </div>

            {/* Parent Category Selector */}
            <div>
              <label style={{ display: 'block', fontSize: '0.82rem', fontWeight: 600, marginBottom: '0.3rem' }}>
                Parent Category (Optional)
              </label>
              <select
                value={newCatParentId}
                onChange={(e) => setNewCatParentId(e.target.value)}
                className="form-input"
                style={{ width: '100%', height: '42px', cursor: 'pointer' }}
              >
                <option value="">-- None (Top-Level Department e.g. Men, Women, Kids) --</option>
                {categories
                  .filter((c) => !editingCategory || c.id !== editingCategory.id)
                  .map((c) => (
                    <option key={c.id} value={c.id}>
                      {c.parent ? `↳ ${c.parent.name} > ${c.name}` : `📁 ${c.name}`}
                    </option>
                  ))}
              </select>
              <span style={{ fontSize: '0.72rem', color: 'var(--text-muted)', marginTop: '0.25rem', display: 'block' }}>
                Assign to a parent to create nested subcategories or handmade sections.
              </span>
            </div>

            {/* Cover Image Uploader & Preview */}
            <div>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.35rem' }}>
                <label style={{ fontSize: '0.82rem', fontWeight: 600, display: 'flex', alignItems: 'center', gap: '0.35rem' }}>
                  <ImagePlus size={15} color="var(--primary-color)" />
                  <span>Cover Image (Optional)</span>
                </label>
                <span style={{ fontSize: '0.72rem', color: 'var(--text-muted)' }}>From PC or Web URL</span>
              </div>

              {/* Hidden File Input */}
              <input
                type="file"
                ref={fileInputRef}
                accept="image/jpeg,image/png,image/webp,image/gif,image/svg+xml,image/avif"
                style={{ display: 'none' }}
                onChange={handleFileUpload}
              />

              {/* Live Preview Card if image is present */}
              {newCatImage ? (
                <div style={{
                  position: 'relative',
                  borderRadius: '8px',
                  overflow: 'hidden',
                  border: '1px solid var(--border-color)',
                  backgroundColor: '#0f172a',
                  marginBottom: '0.75rem',
                }}>
                  <img
                    src={newCatImage}
                    alt="Category Cover Preview"
                    style={{
                      width: '100%',
                      height: '140px',
                      objectFit: 'cover',
                      display: 'block',
                    }}
                    onError={(e) => {
                      e.currentTarget.src = 'https://placehold.co/400x140?text=Preview';
                    }}
                  />

                  {/* Top Bar with Badges & Remove */}
                  <div style={{
                    position: 'absolute',
                    top: '8px',
                    left: '8px',
                    right: '8px',
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                  }}>
                    <span style={{
                      backgroundColor: 'rgba(0, 0, 0, 0.7)',
                      color: '#fff',
                      fontSize: '0.7rem',
                      fontWeight: 600,
                      padding: '0.2rem 0.5rem',
                      borderRadius: '4px',
                      backdropFilter: 'blur(4px)',
                    }}>
                      ✓ Cover Selected
                    </span>

                    <button
                      type="button"
                      onClick={() => setNewCatImage('')}
                      style={{
                        backgroundColor: 'rgba(239, 68, 68, 0.9)',
                        color: '#fff',
                        border: 'none',
                        borderRadius: '4px',
                        padding: '0.25rem 0.5rem',
                        fontSize: '0.7rem',
                        fontWeight: 600,
                        cursor: 'pointer',
                        display: 'flex',
                        alignItems: 'center',
                        gap: '0.2rem',
                      }}
                      title="Remove current image"
                    >
                      <X size={12} /> Remove
                    </button>
                  </div>

                  {/* Change Photo Overlay Button */}
                  <button
                    type="button"
                    onClick={() => !uploadingImage && fileInputRef.current?.click()}
                    style={{
                      position: 'absolute',
                      bottom: '8px',
                      right: '8px',
                      backgroundColor: 'rgba(0, 0, 0, 0.75)',
                      color: '#fff',
                      border: '1px solid rgba(255, 255, 255, 0.2)',
                      borderRadius: '4px',
                      padding: '0.25rem 0.6rem',
                      fontSize: '0.72rem',
                      fontWeight: 600,
                      cursor: 'pointer',
                      display: 'flex',
                      alignItems: 'center',
                      gap: '0.3rem',
                    }}
                  >
                    <UploadCloud size={13} /> Change Photo
                  </button>
                </div>
              ) : (
                /* Click to browse / drag & drop box */
                <div
                  onClick={() => !uploadingImage && fileInputRef.current?.click()}
                  onDragOver={(e) => { e.preventDefault(); e.stopPropagation(); }}
                  onDrop={(e) => {
                    e.preventDefault();
                    e.stopPropagation();
                    if (uploadingImage) return;
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
                    cursor: uploadingImage ? 'not-allowed' : 'pointer',
                    transition: 'border-color 0.2s ease',
                    marginBottom: '0.75rem',
                    opacity: uploadingImage ? 0.7 : 1,
                  }}
                  onMouseEnter={(e) => !uploadingImage && (e.currentTarget.style.borderColor = 'var(--primary-color)')}
                  onMouseLeave={(e) => !uploadingImage && (e.currentTarget.style.borderColor = 'var(--border-color)')}
                >
                  {uploadingImage ? (
                    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '0.4rem' }}>
                      <RefreshCw size={24} className="animate-spin" color="var(--primary-color)" />
                      <span style={{ fontSize: '0.82rem', fontWeight: 600 }}>Uploading image from PC...</span>
                    </div>
                  ) : (
                    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '0.3rem' }}>
                      <UploadCloud size={28} color="var(--primary-color)" />
                      <div style={{ fontSize: '0.84rem', fontWeight: 600 }}>
                        <span style={{ color: 'var(--primary-color)', textDecoration: 'underline' }}>Click to browse from PC</span> or drag & drop
                      </div>
                      <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)' }}>
                        JPG, PNG, WEBP, GIF, SVG (Up to 12MB)
                      </div>
                    </div>
                  )}
                </div>
              )}

              {uploadError && (
                <div style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '0.45rem',
                  backgroundColor: 'rgba(239, 68, 68, 0.1)',
                  border: '1px solid rgba(239, 68, 68, 0.25)',
                  color: '#dc2626',
                  fontSize: '0.78rem',
                  padding: '0.45rem 0.65rem',
                  borderRadius: '6px',
                  marginBottom: '0.75rem',
                }}>
                  <AlertCircle size={14} />
                  <span>{uploadError}</span>
                </div>
              )}

              {/* Web URL input fallback */}
              <div style={{ position: 'relative' }}>
                <Link size={13} style={{ position: 'absolute', left: '0.75rem', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }} />
                <input
                  type="text"
                  value={newCatImage}
                  onChange={(e) => setNewCatImage(e.target.value)}
                  className="form-input"
                  placeholder="Or paste external image URL (https://...)"
                  style={{ paddingLeft: '2.1rem', fontSize: '0.8rem', padding: '0.45rem 0.75rem 0.45rem 2.1rem' }}
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={saving || uploadingImage}
              className="btn-primary"
              style={{ fontSize: '0.85rem', marginTop: '0.25rem' }}
            >
              {saving ? 'Saving...' : editingCategory ? 'Save Changes' : 'Create Category'}
            </button>
          </form>
        </div>

        {/* Existing Categories List */}
        <div>
          <h3 style={{ fontSize: '1.1rem', marginBottom: '1rem' }}>Existing Categories ({categories.length})</h3>
          {loading ? (
            <p style={{ color: 'var(--text-muted)' }}>Loading categories...</p>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
              {categories.map((cat) => (
                <div
                  key={cat.id}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    padding: '0.85rem 1rem',
                    backgroundColor: 'var(--surface)',
                    border: editingCategory?.id === cat.id ? '2px solid var(--primary-color)' : '1px solid var(--border-color)',
                    borderRadius: 'var(--radius)',
                    transition: 'border-color 0.2s ease',
                  }}
                >
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.85rem' }}>
                    {cat.image ? (
                      <img
                        src={cat.image}
                        alt=""
                        style={{ width: '48px', height: '48px', borderRadius: '6px', objectFit: 'cover' }}
                        onError={(e) => {
                          e.currentTarget.src = 'https://placehold.co/100x100?text=Category';
                        }}
                      />
                    ) : (
                      <div style={{
                        width: '48px',
                        height: '48px',
                        borderRadius: '6px',
                        backgroundColor: 'var(--card-bg)',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        border: '1px solid var(--border-color)',
                      }}>
                        <FolderTree size={22} color="var(--primary-color)" />
                      </div>
                    )}
                    <div>
                      <div style={{ fontWeight: 700, fontSize: '0.9rem', display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                        <span>{cat.name}</span>
                        {cat.parent && (
                          <span style={{
                            fontSize: '0.68rem',
                            fontWeight: 700,
                            padding: '0.1rem 0.45rem',
                            borderRadius: '4px',
                            backgroundColor: '#f1f5f9',
                            color: '#64748b',
                          }}>
                            in {cat.parent.name}
                          </span>
                        )}
                      </div>
                      <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                        Slug: /{cat.slug} · {cat.products_count ?? 0} Products
                      </div>
                    </div>
                  </div>

                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.35rem' }}>
                    <button
                      onClick={() => handleStartEdit(cat)}
                      style={{
                        background: 'transparent',
                        border: 'none',
                        color: 'var(--text-muted)',
                        cursor: 'pointer',
                        padding: '0.35rem',
                      }}
                      title="Edit Category"
                    >
                      <Edit size={16} />
                    </button>
                    <button
                      onClick={() => handleDelete(cat.id)}
                      style={{
                        background: 'transparent',
                        border: 'none',
                        color: '#EF4444',
                        cursor: 'pointer',
                        padding: '0.35rem',
                      }}
                      title="Delete Category"
                    >
                      <Trash2 size={16} />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
