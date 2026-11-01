import { describe, it, expect } from 'vitest';
import { STORE_TYPES, STORE_CONFIGS } from '../storeConfig';

describe('Store Configurations & Niche Definitions', () => {
  it('defines valid store types', () => {
    expect(STORE_TYPES.CLOTHING).toBe('clothing');
    expect(STORE_TYPES.JEWELRY).toBe('jewelry');
    expect(STORE_TYPES.GENERAL).toBe('general');
  });

  it('configures clothing store with Pakistani standard size chart and filters', () => {
    const clothing = STORE_CONFIGS.clothing;
    expect(clothing.title).toBe('KHAAM POSHAK');
    expect(clothing.currency).toBe('PKR');
    expect(clothing.currencySymbol).toBe('Rs. ');
    expect(clothing.features.hasSizeChart).toBe(true);

    // Verify size chart data structure
    expect(clothing.sizeChartData.columns).toContain('Size');
    expect(clothing.sizeChartData.columns).toContain('Chest (in)');
    expect(clothing.sizeChartData.rows.length).toBeGreaterThan(3);

    // Verify filter keys (pieces and fabric removed per refinement requirements)
    const filterKeys = clothing.filters.map((f) => f.key);
    expect(filterKeys).toContain('size');
    expect(filterKeys).toContain('color');
    expect(filterKeys).not.toContain('pieces');
    expect(filterKeys).not.toContain('fabric');
  });

  it('guarantees jewelry store operates via online concierge without physical stores', () => {
    const jewelry = STORE_CONFIGS.jewelry;
    expect(jewelry.title).toBe('Jewelry Store');
    const pointsStr = jewelry.authenticityGuarantee.points.join(' ');
    expect(pointsStr).not.toContain('at all Global Boutiques');
    expect(pointsStr).toContain('Online Concierge');
  });
});
