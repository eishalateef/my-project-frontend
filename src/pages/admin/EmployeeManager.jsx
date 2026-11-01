import React, { useState, useEffect } from 'react';
import api from '../../api/axios';
import {
  Users,
  UserPlus,
  ShieldCheck,
  Truck,
  Search,
  Edit2,
  Trash2,
  CheckCircle2,
  XCircle,
  KeyRound,
  IdCard,
  Phone,
  Mail,
  RefreshCw,
  X,
  AlertTriangle,
  Lock,
  Building2,
} from 'lucide-react';

export default function EmployeeManager() {
  const [employees, setEmployees] = useState([]);
  const [availableStores, setAvailableStores] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [roleFilter, setRoleFilter] = useState('all');
  const [statusFilter, setStatusFilter] = useState('all');

  // Modal States
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingEmployee, setEditingEmployee] = useState(null);
  const [formData, setFormData] = useState({
    name: '',
    username: '',
    email: '',
    role: 'delivery',
    employee_id: '',
    assigned_store_ids: null, // null = all stores, or array [4, 5]
    phone: '',
    password: '',
    address: '',
    city: 'Dubai',
  });
  const [submitting, setSubmitting] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');
  const [successMsg, setSuccessMsg] = useState('');

  const fetchEmployees = async () => {
    try {
      setLoading(true);
      const params = new URLSearchParams();
      if (search) params.append('search', search);
      if (roleFilter !== 'all') params.append('role', roleFilter);
      if (statusFilter !== 'all') params.append('status', statusFilter);

      const res = await api.get(`/api/admin/employees?${params.toString()}`);
      setEmployees(res.data.data || res.data || []);
    } catch (err) {
      console.error('Failed to load employees:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchEmployees();
    api.get('/api/store/all')
      .then(res => setAvailableStores(res.data?.stores || []))
      .catch(err => console.warn('Could not fetch stores list:', err));
  }, [roleFilter, statusFilter]);

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    fetchEmployees();
  };

  const openCreateModal = () => {
    setEditingEmployee(null);
    setFormData({
      name: '',
      username: '',
      email: '',
      role: 'delivery',
      employee_id: `RDR-${Math.floor(100 + Math.random() * 900)}`,
      assigned_store_ids: null,
      phone: '',
      password: '',
      address: '',
      city: 'Dubai',
    });
    setErrorMsg('');
    setIsModalOpen(true);
  };

  const openEditModal = (emp) => {
    setEditingEmployee(emp);
    setFormData({
      name: emp.name,
      username: emp.username || '',
      email: emp.email,
      role: emp.role,
      employee_id: emp.employee_id || '',
      assigned_store_ids: emp.assigned_store_ids ? (Array.isArray(emp.assigned_store_ids) ? emp.assigned_store_ids.map(Number) : null) : null,
      phone: emp.phone || '',
      password: '', // leave empty unless changing
      address: emp.address || '',
      city: emp.city || 'Dubai',
    });
    setErrorMsg('');
    setIsModalOpen(true);
  };

  const handleRoleChangeInForm = (newRole) => {
    const prefix = newRole === 'delivery' ? 'RDR' : 'ADM';
    setFormData((prev) => ({
      ...prev,
      role: newRole,
      employee_id: prev.employee_id?.startsWith('RDR') || prev.employee_id?.startsWith('ADM')
        ? `${prefix}-${Math.floor(100 + Math.random() * 900)}`
        : prev.employee_id,
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    setErrorMsg('');

    try {
      if (editingEmployee) {
        await api.put(`/api/admin/employees/${editingEmployee.id}`, formData);
        setSuccessMsg(`Employee ${formData.name} updated successfully!`);
      } else {
        await api.post('/api/admin/employees', formData);
        setSuccessMsg(`New employee ${formData.name} created!`);
      }

      setIsModalOpen(false);
      fetchEmployees();
      setTimeout(() => setSuccessMsg(''), 4000);
    } catch (err) {
      setErrorMsg(err.response?.data?.message || err.response?.data?.errors?.username?.[0] || 'Operation failed');
    } finally {
      setSubmitting(false);
    }
  };

  const handleToggleStatus = async (emp) => {
    try {
      const res = await api.patch(`/api/admin/employees/${emp.id}/toggle-status`);
      setSuccessMsg(res.data.message);
      fetchEmployees();
      setTimeout(() => setSuccessMsg(''), 3000);
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to update status');
    }
  };

  const handleDelete = async (emp) => {
    if (!window.confirm(`Are you sure you want to remove ${emp.name} (${emp.employee_id || emp.username})?`)) {
      return;
    }
    try {
      const res = await api.delete(`/api/admin/employees/${emp.id}`);
      setSuccessMsg(res.data.message);
      fetchEmployees();
      setTimeout(() => setSuccessMsg(''), 3000);
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to delete employee');
    }
  };

  // Quick stats
  const totalEmployees = employees.length;
  const ridersCount = employees.filter((e) => e.role === 'delivery').length;
  const activeCount = employees.filter((e) => e.is_active).length;

  return (
    <div style={{
      backgroundColor: 'var(--card-bg)',
      border: '1px solid var(--border-color)',
      borderRadius: 'var(--radius)',
      padding: '2rem',
    }}>
      {/* Header Banner */}
      <div style={{ display: 'flex', flexWrap: 'wrap', justifyContent: 'space-between', alignItems: 'center', gap: '1rem', marginBottom: '1.5rem' }}>
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem' }}>
            <h2 style={{ fontSize: '1.5rem', fontWeight: 800 }}>Staff & Employee ID Management</h2>
            <span style={{
              fontSize: '0.72rem',
              fontWeight: 800,
              padding: '0.2rem 0.6rem',
              borderRadius: '999px',
              backgroundColor: '#EEF2FF',
              color: '#4338CA',
              letterSpacing: '0.05em',
            }}>
              ENTERPRISE HR
            </span>
          </div>
          <p style={{ color: 'var(--text-muted)', fontSize: '0.85rem', marginTop: '0.25rem' }}>
            Provision staff credentials, issue unique Employee IDs, assign courier delivery roles, and govern login permissions.
          </p>
        </div>

        <button
          onClick={openCreateModal}
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '0.5rem',
            padding: '0.6rem 1.1rem',
            borderRadius: 'var(--radius)',
            backgroundColor: 'var(--primary-color)',
            color: 'var(--button-text)',
            border: 'none',
            fontSize: '0.85rem',
            fontWeight: 700,
            cursor: 'pointer',
            boxShadow: '0 4px 12px rgba(0,0,0,0.1)',
          }}
        >
          <UserPlus size={16} />
          <span>Add Employee / Rider</span>
        </button>
      </div>

      {/* Success Alert Banner */}
      {successMsg && (
        <div style={{
          padding: '0.75rem 1rem',
          borderRadius: '8px',
          backgroundColor: '#ECFDF5',
          border: '1px solid #A7F3D0',
          color: '#065F46',
          fontSize: '0.85rem',
          fontWeight: 600,
          marginBottom: '1.25rem',
          display: 'flex',
          alignItems: 'center',
          gap: '0.5rem',
        }}>
          <CheckCircle2 size={16} />
          <span>{successMsg}</span>
        </div>
      )}

      {/* KPI Stats Strip */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
        gap: '1rem',
        marginBottom: '1.5rem',
      }}>
        <div style={{
          padding: '1rem',
          borderRadius: 'var(--radius)',
          backgroundColor: 'var(--surface)',
          border: '1px solid var(--border-color)',
        }}>
          <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', fontWeight: 600 }}>Total Staff Members</div>
          <div style={{ fontSize: '1.5rem', fontWeight: 900, marginTop: '0.25rem' }}>{totalEmployees}</div>
        </div>

        <div style={{
          padding: '1rem',
          borderRadius: 'var(--radius)',
          backgroundColor: 'var(--surface)',
          border: '1px solid var(--border-color)',
        }}>
          <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', fontWeight: 600 }}>Active Courier Riders</div>
          <div style={{ fontSize: '1.5rem', fontWeight: 900, color: '#059669', marginTop: '0.25rem' }}>{ridersCount}</div>
        </div>

        <div style={{
          padding: '1rem',
          borderRadius: 'var(--radius)',
          backgroundColor: 'var(--surface)',
          border: '1px solid var(--border-color)',
        }}>
          <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', fontWeight: 600 }}>Active Accounts Status</div>
          <div style={{ fontSize: '1.5rem', fontWeight: 900, color: '#2563EB', marginTop: '0.25rem' }}>
            {activeCount} <span style={{ fontSize: '0.85rem', color: 'var(--text-muted)', fontWeight: 500 }}>/ {totalEmployees}</span>
          </div>
        </div>
      </div>

      {/* Filter & Search Bar */}
      <div style={{
        display: 'flex',
        flexWrap: 'wrap',
        alignItems: 'center',
        justifyContent: 'space-between',
        gap: '1rem',
        padding: '0.75rem 1rem',
        backgroundColor: 'var(--surface)',
        borderRadius: 'var(--radius)',
        border: '1px solid var(--border-color)',
        marginBottom: '1.5rem',
      }}>
        <form onSubmit={handleSearchSubmit} style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', flex: '1', minWidth: '240px' }}>
          <div style={{ position: 'relative', width: '100%' }}>
            <Search size={15} style={{ position: 'absolute', left: '10px', top: '10px', color: 'var(--text-muted)' }} />
            <input
              type="text"
              placeholder="Search by Employee ID, Name, @Username, or Phone..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="form-input"
              style={{ paddingLeft: '32px', fontSize: '0.82rem', width: '100%' }}
            />
          </div>
          <button
            type="submit"
            style={{
              padding: '0.45rem 0.9rem',
              borderRadius: '6px',
              backgroundColor: 'var(--primary-color)',
              color: 'var(--button-text)',
              border: 'none',
              fontSize: '0.8rem',
              fontWeight: 700,
              cursor: 'pointer',
            }}
          >
            Search
          </button>
        </form>

        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', flexWrap: 'wrap' }}>
          <select
            value={roleFilter}
            onChange={(e) => setRoleFilter(e.target.value)}
            className="form-input"
            style={{ padding: '0.45rem 0.75rem', fontSize: '0.8rem' }}
          >
            <option value="all">All Roles</option>
            <option value="admin">Administrators</option>
            <option value="delivery">Delivery Couriers</option>
          </select>

          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="form-input"
            style={{ padding: '0.45rem 0.75rem', fontSize: '0.8rem' }}
          >
            <option value="all">All Statuses</option>
            <option value="active">Active Only</option>
            <option value="inactive">Suspended Only</option>
          </select>

          <button
            onClick={fetchEmployees}
            title="Reload Staff List"
            style={{
              padding: '0.45rem',
              borderRadius: '6px',
              background: 'transparent',
              border: '1px solid var(--border-color)',
              color: 'var(--text-muted)',
              cursor: 'pointer',
            }}
          >
            <RefreshCw size={15} className={loading ? 'animate-spin' : ''} />
          </button>
        </div>
      </div>

      {/* Staff Table / List */}
      {loading ? (
        <div style={{ padding: '3rem', textAlign: 'center', color: 'var(--text-muted)' }}>
          <RefreshCw size={24} className="animate-spin" style={{ margin: '0 auto 0.5rem', opacity: 0.5 }} />
          <div>Loading staff directory...</div>
        </div>
      ) : employees.length === 0 ? (
        <div style={{ padding: '3rem', textAlign: 'center', color: 'var(--text-muted)' }}>
          <Users size={40} style={{ margin: '0 auto 1rem', opacity: 0.3 }} />
          <h4>No Employees Found</h4>
          <p style={{ fontSize: '0.85rem', marginTop: '0.25rem' }}>
            Try clearing your search filters or click "Add Employee / Rider" above.
          </p>
        </div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
          {employees.map((emp) => {
            const isAdmin = emp.role === 'admin';
            const isDelivery = emp.role === 'delivery';

            return (
              <div
                key={emp.id}
                style={{
                  padding: '1.25rem',
                  borderRadius: 'var(--radius)',
                  backgroundColor: 'var(--surface)',
                  border: '1px solid var(--border-color)',
                  display: 'flex',
                  flexWrap: 'wrap',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  gap: '1rem',
                  transition: 'border-color 0.2s',
                  opacity: emp.is_active ? 1 : 0.65,
                }}
              >
                {/* Employee Info & ID */}
                <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', minWidth: '260px' }}>
                  {/* Avatar Initials */}
                  <div style={{
                    width: '44px',
                    height: '44px',
                    borderRadius: '12px',
                    backgroundColor: isAdmin ? '#FEF3C7' : '#D1FAE5',
                    color: isAdmin ? '#92400E' : '#065F46',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    fontWeight: 900,
                    fontSize: '1rem',
                    border: `1px solid ${isAdmin ? '#FDE68A' : '#A7F3D0'}`,
                  }}>
                    {emp.name.split(' ').map((n) => n[0]).slice(0, 2).join('')}
                  </div>

                  <div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', flexWrap: 'wrap' }}>
                      <span style={{ fontWeight: 800, fontSize: '0.95rem' }}>{emp.name}</span>
                      
                      {/* Employee ID Tag */}
                      {emp.employee_id ? (
                        <span style={{
                          fontFamily: 'monospace',
                          fontSize: '0.72rem',
                          fontWeight: 800,
                          padding: '0.15rem 0.5rem',
                          borderRadius: '6px',
                          backgroundColor: '#1E293B',
                          color: '#F8FAFC',
                          letterSpacing: '0.06em',
                        }}>
                          ID: {emp.employee_id}
                        </span>
                      ) : (
                        <span style={{ fontSize: '0.7rem', color: 'var(--text-muted)' }}>No ID set</span>
                      )}

                      {/* Role Pill */}
                      <span style={{
                        fontSize: '0.68rem',
                        fontWeight: 800,
                        textTransform: 'uppercase',
                        padding: '0.1rem 0.5rem',
                        borderRadius: '999px',
                        backgroundColor: isAdmin ? '#FEF3C7' : '#D1FAE5',
                        color: isAdmin ? '#92400E' : '#065F46',
                        display: 'flex',
                        alignItems: 'center',
                        gap: '0.25rem',
                      }}>
                        {isAdmin ? <ShieldCheck size={11} /> : <Truck size={11} />}
                        {isAdmin ? 'ADMIN' : 'COURIER RIDER'}
                      </span>
                    </div>

                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', fontSize: '0.78rem', color: 'var(--text-muted)', marginTop: '0.2rem', flexWrap: 'wrap' }}>
                      {emp.username && (
                        <span>Username: <strong style={{ color: 'var(--text-main)' }}>@{emp.username}</strong></span>
                      )}
                      <span>•</span>
                      <span>{emp.email}</span>
                      {emp.phone && (
                        <>
                          <span>•</span>
                          <span>{emp.phone}</span>
                        </>
                      )}
                    </div>
                  </div>
                </div>

                {/* Courier Workload Metric */}
                {isDelivery && (
                  <div style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '1rem',
                    padding: '0.4rem 0.85rem',
                    borderRadius: '8px',
                    backgroundColor: 'var(--card-bg)',
                    border: '1px solid var(--border-color)',
                    fontSize: '0.75rem',
                  }}>
                    <div>
                      <span style={{ color: 'var(--text-muted)' }}>Active Deliveries: </span>
                      <strong style={{ color: '#D97706' }}>{emp.active_deliveries || 0}</strong>
                    </div>
                    <span>|</span>
                    <div>
                      <span style={{ color: 'var(--text-muted)' }}>Delivered: </span>
                      <strong style={{ color: '#059669' }}>{emp.completed_deliveries || 0}</strong>
                    </div>
                  </div>
                )}

                {/* Admin Store Scope Badge */}
                {isAdmin && (
                  <div style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '0.45rem',
                    padding: '0.4rem 0.85rem',
                    borderRadius: '8px',
                    backgroundColor: 'var(--card-bg)',
                    border: '1px solid var(--border-color)',
                    fontSize: '0.75rem',
                  }}>
                    <Building2 size={13} color="var(--primary-color)" />
                    {!emp.assigned_store_ids || emp.assigned_store_ids.length === 0 || emp.assigned_store_ids.includes('all') ? (
                      <span style={{ fontWeight: 700, color: '#15803D' }}>🌐 Full Access (All Stores)</span>
                    ) : (
                      <span style={{ fontWeight: 700, color: '#1D4ED8' }}>
                        🏢 {emp.assigned_store_ids.map(id => availableStores.find(s => s.id === Number(id))?.name || `Store #${id}`).join(', ')}
                      </span>
                    )}
                  </div>
                )}

                {/* Status & Actions */}
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                  {/* Status Toggle Button */}
                  <button
                    onClick={() => handleToggleStatus(emp)}
                    title={emp.is_active ? 'Click to Suspend Account' : 'Click to Activate Account'}
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: '0.35rem',
                      padding: '0.35rem 0.75rem',
                      borderRadius: '999px',
                      fontSize: '0.75rem',
                      fontWeight: 700,
                      border: 'none',
                      cursor: 'pointer',
                      backgroundColor: emp.is_active ? '#DCFCE7' : '#FEE2E2',
                      color: emp.is_active ? '#166534' : '#991B1B',
                    }}
                  >
                    {emp.is_active ? <CheckCircle2 size={13} /> : <XCircle size={13} />}
                    <span>{emp.is_active ? 'Active' : 'Suspended'}</span>
                  </button>

                  {/* Edit Button */}
                  <button
                    onClick={() => openEditModal(emp)}
                    title="Edit Credentials & ID"
                    style={{
                      padding: '0.45rem',
                      borderRadius: '6px',
                      backgroundColor: 'transparent',
                      border: '1px solid var(--border-color)',
                      color: 'var(--text-main)',
                      cursor: 'pointer',
                    }}
                  >
                    <Edit2 size={14} />
                  </button>

                  {/* Delete Button */}
                  <button
                    onClick={() => handleDelete(emp)}
                    title="Remove Employee"
                    style={{
                      padding: '0.45rem',
                      borderRadius: '6px',
                      backgroundColor: 'transparent',
                      border: '1px solid var(--border-color)',
                      color: '#DC2626',
                      cursor: 'pointer',
                    }}
                  >
                    <Trash2 size={14} />
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Modal: Create / Edit Employee */}
      {isModalOpen && (
        <div style={{
          position: 'fixed',
          inset: 0,
          backgroundColor: 'rgba(0,0,0,0.6)',
          backdropFilter: 'blur(4px)',
          zIndex: 1000,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          padding: '1rem',
        }}>
          <div style={{
            width: '100%',
            maxWidth: '520px',
            backgroundColor: 'var(--card-bg)',
            border: '1px solid var(--border-color)',
            borderRadius: '16px',
            boxShadow: '0 25px 50px -12px rgba(0,0,0,0.25)',
            overflow: 'hidden',
          }}>
            {/* Modal Header */}
            <div style={{
              padding: '1.25rem 1.5rem',
              borderBottom: '1px solid var(--border-color)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              backgroundColor: 'var(--surface)',
            }}>
              <div>
                <h3 style={{ fontSize: '1.15rem', fontWeight: 800 }}>
                  {editingEmployee ? `Edit Employee (${editingEmployee.employee_id || editingEmployee.name})` : 'Provision New Staff / Courier'}
                </h3>
                <p style={{ fontSize: '0.78rem', color: 'var(--text-muted)', marginTop: '0.15rem' }}>
                  Assign unique username, corporate Employee ID, and login credentials.
                </p>
              </div>
              <button
                onClick={() => setIsModalOpen(false)}
                style={{ background: 'transparent', border: 'none', cursor: 'pointer', color: 'var(--text-muted)' }}
              >
                <X size={20} />
              </button>
            </div>

            {/* Modal Body */}
            <form onSubmit={handleSubmit} style={{ padding: '1.5rem', display: 'flex', flexDirection: 'column', gap: '1rem' }}>
              {errorMsg && (
                <div style={{
                  padding: '0.65rem 0.85rem',
                  borderRadius: '6px',
                  backgroundColor: '#FEE2E2',
                  border: '1px solid #FECACA',
                  color: '#991B1B',
                  fontSize: '0.8rem',
                }}>
                  {errorMsg}
                </div>
              )}

              {/* Role Selector */}
              <div>
                <label style={{ display: 'block', fontSize: '0.78rem', fontWeight: 700, marginBottom: '0.35rem', color: 'var(--text-muted)' }}>
                  Assigned Corporate Role:
                </label>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.5rem' }}>
                  <button
                    type="button"
                    onClick={() => handleRoleChangeInForm('delivery')}
                    style={{
                      padding: '0.6rem',
                      borderRadius: '8px',
                      border: formData.role === 'delivery' ? '2px solid #059669' : '1px solid var(--border-color)',
                      backgroundColor: formData.role === 'delivery' ? '#ECFDF5' : 'var(--surface)',
                      color: formData.role === 'delivery' ? '#065F46' : 'var(--text-main)',
                      fontWeight: 700,
                      fontSize: '0.82rem',
                      cursor: 'pointer',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      gap: '0.4rem',
                    }}
                  >
                    <Truck size={16} /> 🚚 Courier / Delivery Rider
                  </button>

                  <button
                    type="button"
                    onClick={() => handleRoleChangeInForm('admin')}
                    style={{
                      padding: '0.6rem',
                      borderRadius: '8px',
                      border: formData.role === 'admin' ? '2px solid #D97706' : '1px solid var(--border-color)',
                      backgroundColor: formData.role === 'admin' ? '#FFFBEB' : 'var(--surface)',
                      color: formData.role === 'admin' ? '#92400E' : 'var(--text-main)',
                      fontWeight: 700,
                      fontSize: '0.82rem',
                      cursor: 'pointer',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      gap: '0.4rem',
                    }}
                  >
                    <ShieldCheck size={16} /> 👑 Store Administrator
                  </button>
                </div>
              </div>

              {/* Full Name & Username */}
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.75rem' }}>
                <div>
                  <label style={{ display: 'block', fontSize: '0.78rem', fontWeight: 700, marginBottom: '0.25rem' }}>
                    Full Name *
                  </label>
                  <input
                    type="text"
                    required
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    placeholder="e.g. Tariq Express"
                    className="form-input"
                    style={{ width: '100%', fontSize: '0.85rem' }}
                  />
                </div>

                <div>
                  <label style={{ display: 'block', fontSize: '0.78rem', fontWeight: 700, marginBottom: '0.25rem' }}>
                    Username (@handle) *
                  </label>
                  <input
                    type="text"
                    required
                    value={formData.username}
                    onChange={(e) => setFormData({ ...formData, username: e.target.value.toLowerCase().replace(/\s+/g, '_') })}
                    placeholder="e.g. tariq_rider"
                    className="form-input"
                    style={{ width: '100%', fontSize: '0.85rem' }}
                  />
                </div>
              </div>

              {/* Employee ID & Phone */}
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.75rem' }}>
                <div>
                  <label style={{ display: 'block', fontSize: '0.78rem', fontWeight: 700, marginBottom: '0.25rem' }}>
                    Employee ID Badge *
                  </label>
                  <input
                    type="text"
                    required
                    value={formData.employee_id}
                    onChange={(e) => setFormData({ ...formData, employee_id: e.target.value.toUpperCase() })}
                    placeholder="e.g. RDR-008"
                    className="form-input"
                    style={{ width: '100%', fontSize: '0.85rem', fontFamily: 'monospace', fontWeight: 700 }}
                  />
                </div>

                <div>
                  <label style={{ display: 'block', fontSize: '0.78rem', fontWeight: 700, marginBottom: '0.25rem' }}>
                    Phone Number
                  </label>
                  <input
                    type="text"
                    value={formData.phone}
                    onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                    placeholder="+971 55..."
                    className="form-input"
                    style={{ width: '100%', fontSize: '0.85rem' }}
                  />
                </div>
              </div>

              {/* Email */}
              <div>
                <label style={{ display: 'block', fontSize: '0.78rem', fontWeight: 700, marginBottom: '0.25rem' }}>
                  Email Address (for login & alerts) *
                </label>
                <input
                  type="email"
                  required
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  placeholder="rider@flexistore.com"
                  className="form-input"
                  style={{ width: '100%', fontSize: '0.85rem' }}
                />
              </div>

              {/* Store Access Scope (For Client / Admin) */}
              {formData.role === 'admin' && (
                <div style={{ marginTop: '0.25rem' }}>
                  <label style={{ display: 'block', fontSize: '0.78rem', fontWeight: 700, marginBottom: '0.35rem' }}>
                    Assigned Store Access (Client Scope) *
                  </label>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem', background: 'var(--surface)', padding: '0.75rem 1rem', borderRadius: '8px', border: '1px solid var(--border-color)' }}>
                    <label style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', fontSize: '0.82rem', fontWeight: 600, cursor: 'pointer' }}>
                      <input
                        type="radio"
                        name="store_access_type"
                        checked={!formData.assigned_store_ids || formData.assigned_store_ids.length === 0 || formData.assigned_store_ids.includes('all')}
                        onChange={() => setFormData({ ...formData, assigned_store_ids: null })}
                      />
                      <span>🌐 Full Enterprise Access (All Stores - Master Superadmin)</span>
                    </label>

                    <label style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', fontSize: '0.82rem', fontWeight: 600, cursor: 'pointer' }}>
                      <input
                        type="radio"
                        name="store_access_type"
                        checked={Array.isArray(formData.assigned_store_ids) && formData.assigned_store_ids.length > 0 && !formData.assigned_store_ids.includes('all')}
                        onChange={() => setFormData({ ...formData, assigned_store_ids: availableStores[0] ? [availableStores[0].id] : [] })}
                      />
                      <span>🏢 Specific Client Store(s) (Restrict this client to chosen store)</span>
                    </label>

                    {Array.isArray(formData.assigned_store_ids) && !formData.assigned_store_ids.includes('all') && (
                      <div style={{ display: 'flex', flexDirection: 'column', gap: '0.45rem', marginLeft: '1.5rem', marginTop: '0.35rem', paddingTop: '0.5rem', borderTop: '1px dashed var(--border-color)' }}>
                        <span style={{ fontSize: '0.74rem', color: 'var(--text-muted)' }}>
                          Select the store(s) this client or branch manager is permitted to see:
                        </span>
                        {availableStores.map(st => {
                          const isChecked = formData.assigned_store_ids?.includes(st.id);
                          return (
                            <label key={st.id} style={{ display: 'flex', alignItems: 'center', gap: '0.45rem', fontSize: '0.8rem', cursor: 'pointer' }}>
                              <input
                                type="checkbox"
                                checked={isChecked}
                                onChange={(e) => {
                                  const current = formData.assigned_store_ids || [];
                                  const updated = e.target.checked
                                    ? [...current, st.id]
                                    : current.filter(id => id !== st.id);
                                  setFormData({ ...formData, assigned_store_ids: updated });
                                }}
                              />
                              <span><strong>{st.name}</strong></span>
                            </label>
                          );
                        })}
                      </div>
                    )}
                  </div>
                </div>
              )}

              {/* Password */}
              <div>
                <label style={{ display: 'block', fontSize: '0.78rem', fontWeight: 700, marginBottom: '0.25rem' }}>
                  {editingEmployee ? 'New Password (leave empty to keep unchanged)' : 'Initial Password *'}
                </label>
                <input
                  type="password"
                  required={!editingEmployee}
                  minLength={6}
                  value={formData.password}
                  onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                  placeholder={editingEmployee ? '••••••••' : 'Min 6 characters'}
                  className="form-input"
                  style={{ width: '100%', fontSize: '0.85rem' }}
                />
              </div>

              {/* Submit Buttons */}
              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.75rem', marginTop: '0.5rem' }}>
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  style={{
                    padding: '0.55rem 1rem',
                    borderRadius: '8px',
                    border: '1px solid var(--border-color)',
                    backgroundColor: 'transparent',
                    color: 'var(--text-main)',
                    fontSize: '0.82rem',
                    fontWeight: 600,
                    cursor: 'pointer',
                  }}
                >
                  Cancel
                </button>

                <button
                  type="submit"
                  disabled={submitting}
                  style={{
                    padding: '0.55rem 1.25rem',
                    borderRadius: '8px',
                    border: 'none',
                    backgroundColor: 'var(--primary-color)',
                    color: 'var(--button-text)',
                    fontSize: '0.82rem',
                    fontWeight: 700,
                    cursor: 'pointer',
                    opacity: submitting ? 0.7 : 1,
                  }}
                >
                  {submitting ? 'Saving...' : editingEmployee ? 'Update Employee' : 'Create & Issue ID'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
