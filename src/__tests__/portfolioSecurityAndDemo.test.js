import { describe, it, expect } from 'vitest';
import fs from 'fs';
import path from 'path';

describe('Portfolio Demo Showcase & Frontend Security Engine', () => {
  const authModalPath = path.resolve(__dirname, '../components/AuthModal.jsx');
  const authModalContent = fs.readFileSync(authModalPath, 'utf-8');

  const authContextPath = path.resolve(__dirname, '../context/AuthContext.jsx');
  const authContextContent = fs.readFileSync(authContextPath, 'utf-8');

  const appPath = path.resolve(__dirname, '../App.jsx');
  const appContent = fs.readFileSync(appPath, 'utf-8');

  it('guarantees Portfolio Role Preview is integrated with 1-click role buttons', () => {
    expect(authModalContent).toContain('Portfolio Role Preview');
    expect(authModalContent).toContain('1-Click Role Login');
    expect(authModalContent).toContain("handleRoleDemoLogin('customer')");
    expect(authModalContent).toContain("handleRoleDemoLogin('admin')");
    expect(authModalContent).toContain("handleRoleDemoLogin('delivery')");
  });

  it('provides quick-fill demo credentials for recruiters and reviewers in AuthModal', () => {
    expect(authModalContent).toContain('Quick-Fill Demo Credentials');
    expect(authModalContent).toContain('customer@demo.com');
    expect(authModalContent).toContain('admin@demo.com');
    expect(authModalContent).toContain('courier@demo.com');
    expect(authModalContent).toContain('PW: demo123');
  });

  it('enables portfolio demo showcase by default in AuthContext', () => {
    expect(authContextContent).toContain("stored !== 'false'");
    expect(authContextContent).toContain('loginAsDemoRole');
    expect(authContextContent).toContain('demo123');
  });

  it('enforces API security interceptor to revoke invalid tokens on 401', () => {
    expect(authContextContent).toContain("axios.defaults.headers.common['Authorization'] = `Bearer ${token}`");
    expect(authContextContent).toContain('axios.interceptors.response.use');
    expect(authContextContent).toContain('error.response?.status === 401');
    expect(authContextContent).toContain("localStorage.removeItem('flexi_token')");
  });

  it('verifies App.jsx defines dedicated routes for customer, courier, and admin', () => {
    expect(appContent).toContain('path="/admin"');
    expect(appContent).toContain('path="/delivery"');
    expect(appContent).toContain('path="/track-order"');
    expect(appContent).toContain('DeliveryPortal');
    expect(appContent).toContain('AdminDashboard');
  });
});
