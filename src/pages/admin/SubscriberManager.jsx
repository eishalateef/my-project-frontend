import React, { useState, useEffect } from 'react';
import api from '../../api/axios';
import {
  Mail,
  Search,
  Download,
  Trash2,
  RefreshCw,
  CheckCircle,
  XCircle,
  Copy,
  Check,
  Send,
  Users,
  Sparkles,
} from 'lucide-react';

export default function SubscriberManager() {
  const [subscribers, setSubscribers] = useState([]);
  const [counts, setCounts] = useState({ total: 0, subscribed: 0, unsubscribed: 0 });
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [copiedAll, setCopiedAll] = useState(false);
  const [copiedEmail, setCopiedEmail] = useState(null);
  const [actionNotice, setActionNotice] = useState(null);

  const fetchSubscribers = async () => {
    try {
      setLoading(true);
      const res = await api.get('/api/admin/newsletter/subscribers', {
        params: {
          search: search.trim() || undefined,
          status: statusFilter !== 'all' ? statusFilter : undefined,
        },
      });
      if (res.data?.success) {
        setSubscribers(res.data.data || []);
        if (res.data.counts) {
          setCounts(res.data.counts);
        }
      }
    } catch (err) {
      console.error('Failed to fetch subscribers:', err);
      setActionNotice({ type: 'error', text: 'Failed to load subscriber list.' });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchSubscribers();
  }, [statusFilter]);

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    fetchSubscribers();
  };

  const handleToggleStatus = async (id) => {
    try {
      const res = await api.patch(`/api/admin/newsletter/subscribers/${id}/toggle-status`);
      if (res.data?.success) {
        setActionNotice({ type: 'success', text: res.data.message });
        fetchSubscribers();
      }
    } catch (err) {
      console.error('Error toggling subscriber status:', err);
      setActionNotice({ type: 'error', text: 'Failed to update subscriber status.' });
    }
  };

  const handleDelete = async (id, email) => {
    if (!window.confirm(`Are you sure you want to remove ${email} from VIP subscribers?`)) return;
    try {
      const res = await api.delete(`/api/admin/newsletter/subscribers/${id}`);
      if (res.data?.success) {
        setActionNotice({ type: 'success', text: `Subscriber ${email} deleted.` });
        fetchSubscribers();
      }
    } catch (err) {
      console.error('Error deleting subscriber:', err);
      setActionNotice({ type: 'error', text: 'Failed to delete subscriber.' });
    }
  };

  const handleCopyAllEmails = () => {
    const activeEmails = subscribers
      .filter((s) => s.status === 'subscribed')
      .map((s) => s.email)
      .join(', ');

    if (!activeEmails) {
      setActionNotice({ type: 'error', text: 'No active subscribers to copy.' });
      return;
    }

    navigator.clipboard.writeText(activeEmails);
    setCopiedAll(true);
    setActionNotice({ type: 'success', text: 'All active subscriber emails copied to clipboard!' });
    setTimeout(() => setCopiedAll(false), 3000);
  };

  const handleCopySingle = (email) => {
    navigator.clipboard.writeText(email);
    setCopiedEmail(email);
    setTimeout(() => setCopiedEmail(null), 2000);
  };

  const handleExportCSV = () => {
    window.open('/api/admin/newsletter/export-csv', '_blank');
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
      {/* Top Banner & Telemetry Header */}
      <div
        style={{
          backgroundColor: 'var(--card-bg)',
          border: '1px solid var(--border-color)',
          borderRadius: '16px',
          padding: '1.5rem',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          flexWrap: 'wrap',
          gap: '1rem',
        }}
      >
        <div>
          <div
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: '0.4rem',
              backgroundColor: 'rgba(227, 82, 5, 0.1)',
              color: '#E35205',
              padding: '0.2rem 0.6rem',
              borderRadius: '999px',
              fontSize: '0.72rem',
              fontWeight: 800,
              textTransform: 'uppercase',
              marginBottom: '0.35rem',
            }}
          >
            <Sparkles size={12} /> Lead Capture & Audience
          </div>
          <h2 style={{ fontSize: '1.35rem', margin: 0, fontWeight: 800 }}>
            VIP Newsletter Subscribers
          </h2>
          <p style={{ color: 'var(--text-muted)', fontSize: '0.84rem', margin: '0.25rem 0 0 0' }}>
            Clients who signed up via "Be The First To Know" to receive handcrafted product drops, restock alerts, and exclusive offers.
          </p>
        </div>

        <div style={{ display: 'flex', gap: '0.65rem', flexWrap: 'wrap' }}>
          <button
            type="button"
            onClick={handleCopyAllEmails}
            className="btn-secondary"
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: '0.45rem',
              padding: '0.55rem 1rem',
              borderRadius: '999px',
              fontSize: '0.8rem',
              fontWeight: 700,
              cursor: 'pointer',
            }}
            title="Copy all active subscriber emails to clipboard"
          >
            {copiedAll ? <Check size={14} color="#16A34A" /> : <Copy size={14} />}
            <span>{copiedAll ? 'Copied All!' : 'Copy All Emails'}</span>
          </button>

          <button
            type="button"
            onClick={handleExportCSV}
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: '0.45rem',
              padding: '0.55rem 1rem',
              borderRadius: '999px',
              backgroundColor: '#111827',
              color: '#ffffff',
              border: 'none',
              fontSize: '0.8rem',
              fontWeight: 700,
              cursor: 'pointer',
            }}
            title="Download CSV spreadsheet of all subscribers"
          >
            <Download size={14} />
            <span>Export Subscribers CSV</span>
          </button>
        </div>
      </div>

      {/* KPI Metric Cards */}
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))',
          gap: '1rem',
        }}
      >
        <div
          style={{
            backgroundColor: 'var(--surface)',
            border: '1px solid var(--border-color)',
            borderRadius: '12px',
            padding: '1.25rem',
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <span style={{ fontSize: '0.78rem', color: 'var(--text-muted)', fontWeight: 700, textTransform: 'uppercase' }}>
              Total Audience
            </span>
            <Users size={18} color="var(--primary-color)" />
          </div>
          <div style={{ fontSize: '1.8rem', fontWeight: 900, marginTop: '0.5rem' }}>
            {counts.total}
          </div>
          <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginTop: '0.2rem' }}>
            Lifetime client newsletter signups
          </div>
        </div>

        <div
          style={{
            backgroundColor: 'var(--surface)',
            border: '1px solid var(--border-color)',
            borderRadius: '12px',
            padding: '1.25rem',
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <span style={{ fontSize: '0.78rem', color: '#16A34A', fontWeight: 700, textTransform: 'uppercase' }}>
              Active Subscribed
            </span>
            <CheckCircle size={18} color="#16A34A" />
          </div>
          <div style={{ fontSize: '1.8rem', fontWeight: 900, marginTop: '0.5rem', color: '#16A34A' }}>
            {counts.subscribed}
          </div>
          <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginTop: '0.2rem' }}>
            Ready to receive your next collection drop
          </div>
        </div>

        <div
          style={{
            backgroundColor: 'var(--surface)',
            border: '1px solid var(--border-color)',
            borderRadius: '12px',
            padding: '1.25rem',
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <span style={{ fontSize: '0.78rem', color: 'var(--text-muted)', fontWeight: 700, textTransform: 'uppercase' }}>
              Unsubscribed
            </span>
            <XCircle size={18} color="#9CA3AF" />
          </div>
          <div style={{ fontSize: '1.8rem', fontWeight: 900, marginTop: '0.5rem', color: '#6B7280' }}>
            {counts.unsubscribed}
          </div>
          <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginTop: '0.2rem' }}>
            Opted-out from promotional emails
          </div>
        </div>
      </div>

      {/* Temporary Notice */}
      {actionNotice && (
        <div
          style={{
            padding: '0.75rem 1rem',
            borderRadius: '8px',
            fontSize: '0.82rem',
            fontWeight: 700,
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            backgroundColor: actionNotice.type === 'error' ? '#FEE2E2' : '#DCFCE7',
            color: actionNotice.type === 'error' ? '#991B1B' : '#166534',
            border: actionNotice.type === 'error' ? '1px solid #FCA5A5' : '1px solid #86EFAC',
          }}
        >
          <span>{actionNotice.text}</span>
          <button
            type="button"
            onClick={() => setActionNotice(null)}
            style={{ background: 'transparent', border: 'none', cursor: 'pointer', fontWeight: 800 }}
          >
            ✕
          </button>
        </div>
      )}

      {/* Search and Filter Toolbar */}
      <div
        style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          gap: '1rem',
          flexWrap: 'wrap',
          backgroundColor: 'var(--card-bg)',
          padding: '1rem 1.25rem',
          borderRadius: '12px',
          border: '1px solid var(--border-color)',
        }}
      >
        <form onSubmit={handleSearchSubmit} style={{ display: 'flex', gap: '0.5rem', flex: 1, maxWidth: '420px' }}>
          <div style={{ position: 'relative', width: '100%' }}>
            <Search
              size={15}
              style={{ position: 'absolute', left: '0.85rem', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }}
            />
            <input
              type="text"
              placeholder="Search by client email address..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              style={{
                width: '100%',
                padding: '0.55rem 0.85rem 0.55rem 2.3rem',
                borderRadius: '8px',
                border: '1px solid var(--border-color)',
                fontSize: '0.84rem',
                backgroundColor: 'var(--surface)',
                color: 'var(--text-color)',
                outline: 'none',
              }}
            />
          </div>
          <button
            type="submit"
            className="btn-primary"
            style={{
              padding: '0.55rem 1rem',
              borderRadius: '8px',
              fontSize: '0.82rem',
              fontWeight: 700,
              cursor: 'pointer',
              whiteSpace: 'nowrap',
            }}
          >
            Search
          </button>
        </form>

        <div style={{ display: 'flex', gap: '0.5rem', alignItems: 'center' }}>
          <span style={{ fontSize: '0.78rem', color: 'var(--text-muted)', fontWeight: 700 }}>Filter:</span>
          {['all', 'subscribed', 'unsubscribed'].map((st) => (
            <button
              key={st}
              type="button"
              onClick={() => setStatusFilter(st)}
              style={{
                padding: '0.35rem 0.85rem',
                borderRadius: '999px',
                fontSize: '0.78rem',
                fontWeight: statusFilter === st ? 800 : 600,
                border: '1px solid var(--border-color)',
                backgroundColor: statusFilter === st ? 'var(--primary-color)' : 'var(--surface)',
                color: statusFilter === st ? '#ffffff' : 'var(--text-color)',
                cursor: 'pointer',
                textTransform: 'capitalize',
              }}
            >
              {st}
            </button>
          ))}
          <button
            type="button"
            onClick={fetchSubscribers}
            title="Refresh list"
            style={{
              padding: '0.45rem',
              borderRadius: '8px',
              border: '1px solid var(--border-color)',
              backgroundColor: 'var(--surface)',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
            }}
          >
            <RefreshCw size={14} className={loading ? 'animate-spin' : ''} />
          </button>
        </div>
      </div>

      {/* Subscribers Table */}
      <div
        style={{
          backgroundColor: 'var(--card-bg)',
          border: '1px solid var(--border-color)',
          borderRadius: '14px',
          overflow: 'hidden',
        }}
      >
        {loading ? (
          <div style={{ padding: '3rem', textAlign: 'center', color: 'var(--text-muted)' }}>
            <RefreshCw size={24} className="animate-spin" style={{ margin: '0 auto 0.75rem auto' }} />
            <p style={{ margin: 0, fontSize: '0.88rem' }}>Loading subscriber database...</p>
          </div>
        ) : subscribers.length === 0 ? (
          <div style={{ padding: '3.5rem 1.5rem', textAlign: 'center' }}>
            <Mail size={36} color="var(--text-muted)" style={{ margin: '0 auto 1rem auto' }} />
            <h4 style={{ margin: 0, fontSize: '1rem', fontWeight: 800 }}>No Subscribers Found</h4>
            <p style={{ color: 'var(--text-muted)', fontSize: '0.82rem', maxWidth: '420px', margin: '0.5rem auto 0 auto' }}>
              {search
                ? `No subscribers match "${search}". Try clearing your search filter.`
                : 'When customers enter their email in "Be The First To Know" on the homepage, their emails will appear here automatically.'}
            </p>
          </div>
        ) : (
          <div style={{ overflowX: 'auto' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', fontSize: '0.85rem' }}>
              <thead>
                <tr style={{ borderBottom: '2px solid var(--border-color)', backgroundColor: 'var(--surface)' }}>
                  <th style={{ padding: '0.75rem 1rem', fontWeight: 800, color: 'var(--text-muted)', textTransform: 'uppercase', fontSize: '0.72rem' }}>
                    # ID
                  </th>
                  <th style={{ padding: '0.75rem 1rem', fontWeight: 800, color: 'var(--text-muted)', textTransform: 'uppercase', fontSize: '0.72rem' }}>
                    Subscriber Email
                  </th>
                  <th style={{ padding: '0.75rem 1rem', fontWeight: 800, color: 'var(--text-muted)', textTransform: 'uppercase', fontSize: '0.72rem' }}>
                    Status
                  </th>
                  <th style={{ padding: '0.75rem 1rem', fontWeight: 800, color: 'var(--text-muted)', textTransform: 'uppercase', fontSize: '0.72rem' }}>
                    Source Channel
                  </th>
                  <th style={{ padding: '0.75rem 1rem', fontWeight: 800, color: 'var(--text-muted)', textTransform: 'uppercase', fontSize: '0.72rem' }}>
                    Subscribed At
                  </th>
                  <th style={{ padding: '0.75rem 1rem', fontWeight: 800, color: 'var(--text-muted)', textTransform: 'uppercase', fontSize: '0.72rem', textAlign: 'right' }}>
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody>
                {subscribers.map((sub) => {
                  const isSubscribed = sub.status === 'subscribed';
                  return (
                    <tr key={sub.id} style={{ borderBottom: '1px solid var(--border-color)' }}>
                      <td style={{ padding: '0.85rem 1rem', fontWeight: 800, color: 'var(--text-muted)' }}>
                        #{sub.id}
                      </td>
                      <td style={{ padding: '0.85rem 1rem' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.45rem' }}>
                          <span style={{ fontWeight: 700 }}>{sub.email}</span>
                          <button
                            type="button"
                            onClick={() => handleCopySingle(sub.email)}
                            title="Copy email"
                            style={{
                              background: 'transparent',
                              border: 'none',
                              cursor: 'pointer',
                              color: 'var(--text-muted)',
                              padding: '0.2rem',
                            }}
                          >
                            {copiedEmail === sub.email ? <Check size={13} color="#16A34A" /> : <Copy size={13} />}
                          </button>
                        </div>
                      </td>
                      <td style={{ padding: '0.85rem 1rem' }}>
                        <span
                          style={{
                            fontSize: '0.72rem',
                            fontWeight: 800,
                            padding: '0.2rem 0.6rem',
                            borderRadius: '999px',
                            backgroundColor: isSubscribed ? '#DCFCE7' : '#F3F4F6',
                            color: isSubscribed ? '#166534' : '#6B7280',
                            border: isSubscribed ? '1px solid #86EFAC' : '1px solid #D1D5DB',
                            textTransform: 'uppercase',
                          }}
                        >
                          {sub.status}
                        </span>
                      </td>
                      <td style={{ padding: '0.85rem 1rem', fontSize: '0.8rem', color: 'var(--text-muted)' }}>
                        {sub.source ? sub.source.replace(/_/g, ' ') : 'website footer'}
                      </td>
                      <td style={{ padding: '0.85rem 1rem', fontSize: '0.78rem', color: 'var(--text-muted)' }}>
                        {new Date(sub.created_at).toLocaleDateString('en-US', {
                          month: 'short',
                          day: 'numeric',
                          year: 'numeric',
                          hour: '2-digit',
                          minute: '2-digit',
                        })}
                      </td>
                      <td style={{ padding: '0.85rem 1rem', textAlign: 'right' }}>
                        <div style={{ display: 'inline-flex', gap: '0.4rem', alignItems: 'center' }}>
                          <button
                            type="button"
                            onClick={() => handleToggleStatus(sub.id)}
                            style={{
                              padding: '0.3rem 0.65rem',
                              borderRadius: '6px',
                              fontSize: '0.74rem',
                              fontWeight: 700,
                              cursor: 'pointer',
                              backgroundColor: 'var(--surface)',
                              border: '1px solid var(--border-color)',
                              color: 'var(--text-color)',
                            }}
                            title="Toggle between Subscribed and Unsubscribed"
                          >
                            {isSubscribed ? 'Unsubscribe' : 'Reactivate'}
                          </button>
                          <button
                            type="button"
                            onClick={() => handleDelete(sub.id, sub.email)}
                            style={{
                              padding: '0.3rem 0.5rem',
                              borderRadius: '6px',
                              border: '1px solid #FCA5A5',
                              backgroundColor: '#FEE2E2',
                              color: '#991B1B',
                              cursor: 'pointer',
                            }}
                            title="Delete permanently"
                          >
                            <Trash2 size={13} />
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
      </div>
    </div>
  );
}
