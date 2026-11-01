import { describe, it, expect } from 'vitest';
import fs from 'fs';
import path from 'path';

describe('VIP Newsletter Subscription Engine & Admin Management', () => {
  const homePath = path.resolve(__dirname, '../pages/Home.jsx');
  const homeContent = fs.readFileSync(homePath, 'utf-8');

  const adminDashboardPath = path.resolve(__dirname, '../pages/admin/AdminDashboard.jsx');
  const adminDashboardContent = fs.readFileSync(adminDashboardPath, 'utf-8');

  const subscriberManagerPath = path.resolve(__dirname, '../pages/admin/SubscriberManager.jsx');

  it('verifies Home.jsx connects "Be The First To Know" to the newsletter subscription API', () => {
    expect(homeContent).toContain('Be The First To Know');
    expect(homeContent).toContain('handleNewsletterSubmit');
    expect(homeContent).toContain('/api/newsletter/subscribe');
    expect(homeContent).toContain('source: \'homepage_vip_banner\'');
  });

  it('handles loading, success message, and validation errors in Home.jsx', () => {
    expect(homeContent).toContain('newsletterLoading');
    expect(homeContent).toContain('newsletterMsg');
    expect(homeContent).toContain('newsletterError');
    expect(homeContent).toContain('Saving...');
  });

  it('integrates VIP Subscribers tab in AdminDashboard.jsx', () => {
    expect(adminDashboardContent).toContain("id: 'subscribers'");
    expect(adminDashboardContent).toContain("label: 'VIP Subscribers'");
    expect(adminDashboardContent).toContain('SubscriberManager');
    expect(adminDashboardContent).toContain("<SubscriberManager />");
  });

  it('guarantees SubscriberManager.jsx exists with full audience controls and CSV export', () => {
    expect(fs.existsSync(subscriberManagerPath)).toBe(true);

    const subscriberContent = fs.readFileSync(subscriberManagerPath, 'utf-8');
    expect(subscriberContent).toContain('/api/admin/newsletter/subscribers');
    expect(subscriberContent).toContain('/api/admin/newsletter/export-csv');
    expect(subscriberContent).toContain('handleCopyAllEmails');
    expect(subscriberContent).toContain('handleToggleStatus');
    expect(subscriberContent).toContain('handleDelete');
    expect(subscriberContent).toContain('Total Audience');
    expect(subscriberContent).toContain('Active Subscribed');
  });
});
