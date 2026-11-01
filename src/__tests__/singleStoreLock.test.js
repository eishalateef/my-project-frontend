import { describe, it, expect } from 'vitest';
import fs from 'fs';
import path from 'path';

describe('Dedicated Single-Store Lock Verification', () => {
  const storeContextPath = path.resolve(__dirname, '../context/StoreContext.jsx');
  const storeContextContent = fs.readFileSync(storeContextPath, 'utf-8');

  const adminDashboardPath = path.resolve(__dirname, '../pages/admin/AdminDashboard.jsx');
  const adminDashboardContent = fs.readFileSync(adminDashboardPath, 'utf-8');

  it('permanently locks storeType to clothing in StoreContext', () => {
    expect(storeContextContent).toContain("storeType = 'clothing'");
    expect(storeContextContent).toContain("isSwitcherAllowed: false");
  });

  it('removes multi-store switcher logic and confetti from StoreContext', () => {
    expect(storeContextContent).not.toContain('switchStoreType');
    expect(storeContextContent).not.toContain('unlockWithDeveloperKey');
    expect(storeContextContent).not.toContain('canvas-confetti');
    expect(storeContextContent).not.toContain('/api/admin/store/switch');
  });

  it('removes StoreTypeSelector from AdminDashboard completely', () => {
    expect(adminDashboardContent).not.toContain('StoreTypeSelector');
    expect(adminDashboardContent).not.toContain('<StoreTypeSelector />');
  });

  it('guarantees StoreTypeSelector.jsx file is removed from repository', () => {
    const selectorPath = path.resolve(__dirname, '../pages/admin/StoreTypeSelector.jsx');
    expect(fs.existsSync(selectorPath)).toBe(false);
  });

  it('renders dedicated storefront banner for KHAAM POSHAK in AdminDashboard', () => {
    expect(adminDashboardContent).toContain('Active Dedicated Storefront');
  });

  it('guarantees Store Niche is completely removed from AdminDashboard and ProductManager', () => {
    expect(adminDashboardContent).not.toContain('Store Niche');
    expect(adminDashboardContent).not.toContain('Niche Type');

    const productManagerPath = path.resolve(__dirname, '../pages/admin/ProductManager.jsx');
    const productManagerContent = fs.readFileSync(productManagerPath, 'utf-8');
    expect(productManagerContent).not.toContain('Niche');

    const employeeManagerPath = path.resolve(__dirname, '../pages/admin/EmployeeManager.jsx');
    const employeeManagerContent = fs.readFileSync(employeeManagerPath, 'utf-8');
    expect(employeeManagerContent).not.toContain('({st.store_type})');
  });
});
