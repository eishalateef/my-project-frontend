import { describe, it, expect } from 'vitest';
import fs from 'fs';
import path from 'path';
import { STORE_CONFIGS } from '../storeConfig';

describe('DynamicFilters Refine By Filter Cleanup', () => {
  const dynamicFiltersPath = path.resolve(__dirname, '../components/DynamicFilters.jsx');
  const dynamicFiltersContent = fs.readFileSync(dynamicFiltersPath, 'utf-8');

  it('ensures "Number of Pieces" section is removed from DynamicFilters', () => {
    expect(dynamicFiltersContent).not.toContain("'Number of Pieces'");
    expect(dynamicFiltersContent).not.toContain('"Number of Pieces"');
    expect(dynamicFiltersContent).not.toContain("SECTION 3: SUIT STYLE & PIECES ACCORDION");
  });

  it('ensures "Fabric" section is removed from DynamicFilters clothing filters', () => {
    expect(dynamicFiltersContent).not.toContain("SECTION 6: FABRIC & WEAVE ACCORDION");
    expect(dynamicFiltersContent).not.toContain("Egyptian Giza Lawn");
    expect(dynamicFiltersContent).not.toContain("Pure Korean Raw Silk");
  });

  it('ensures openSections state does not have pieces or fabric enabled', () => {
    expect(dynamicFiltersContent).not.toMatch(/pieces:\s*true/);
    expect(dynamicFiltersContent).not.toMatch(/fabric:\s*true/);
  });

  it('ensures dummy zero-count Craftsmanship options from screenshot are removed', () => {
    // Specifically the options in the user's screenshot
    expect(dynamicFiltersContent).not.toContain('Handmade Leather');
    expect(dynamicFiltersContent).not.toContain('Hand-Block Printed');
    expect(dynamicFiltersContent).not.toContain('Hand-Smocked');
    expect(dynamicFiltersContent).not.toContain('Solid Woodcraft');
  });

  it('retains authentic craftsmanship options and filters out zero-count entries', () => {
    expect(dynamicFiltersContent).toContain('Hand-Embroidered');
    expect(dynamicFiltersContent).toContain('Handwoven');
    expect(dynamicFiltersContent).toContain('Crochet');
    expect(dynamicFiltersContent).toContain('.filter((c) => c.count > 0 || c.active)');
  });

  it('verifies clothing filters in storeConfig do not contain pieces or fabric', () => {
    const clothingFilters = STORE_CONFIGS.clothing.filters;
    const filterKeys = clothingFilters.map((f) => f.key);
    expect(filterKeys).not.toContain('pieces');
    expect(filterKeys).not.toContain('fabric');
    expect(filterKeys).toContain('size');
    expect(filterKeys).toContain('color');
  });
});
