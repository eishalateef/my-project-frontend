import { describe, it, expect } from 'vitest';
import fs from 'fs';
import path from 'path';

describe('Footer Online-Only & Cleanliness Verification', () => {
  const footerPath = path.resolve(__dirname, '../components/Footer.jsx');
  const footerContent = fs.readFileSync(footerPath, 'utf-8');

  it('must not contain physical retail mall or boutique addresses', () => {
    // These were the previously cluttered physical addresses that the user asked to remove
    expect(footerContent).not.toContain('MM Alam Road');
    expect(footerContent).not.toContain('Dolmen Mall');
    expect(footerContent).not.toContain('The Centaurus');
    expect(footerContent).not.toContain('FLAGSHIP BOUTIQUES');
  });

  it('must explicitly feature the 100% Online Store badge and online delivery message', () => {
    expect(footerContent).toContain('100% Online Store');
    expect(footerContent).toContain('Shop 24/7 Online');
  });

  it('guarantees delivery is strictly within Pakistan with no worldwide mentions', () => {
    expect(footerContent).not.toContain('& worldwide');
    expect(footerContent).toContain('Delivery Across Pakistan Only');
  });

  it('removes the value proposition banner row from footer to keep it clean and minimal', () => {
    expect(footerContent).not.toContain('VALUE PROPOSITION STRIP');
    expect(footerContent).not.toContain('14-Day Exchanges');
  });

  it('must link to genuine active store routes', () => {
    expect(footerContent).toContain('to="/catalog"');
    expect(footerContent).toContain('to="/track-order"');
    expect(footerContent).toContain('to="/my-orders"');
  });

  it('must not contain unclickable dummy spans for customer service', () => {
    expect(footerContent).not.toContain('Pure Fiber Care & Storage');
    expect(footerContent).not.toContain('Bespoke Styling Concierge');
  });
});
