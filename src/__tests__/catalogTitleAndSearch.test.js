import { describe, it, expect } from 'vitest';
import fs from 'fs';
import path from 'path';

describe('Catalog Page Dynamic Title & Search Handling', () => {
  const listingPath = path.resolve(__dirname, '../pages/ProductListing.jsx');
  const listingContent = fs.readFileSync(listingPath, 'utf-8');

  it('renders dynamic title when searching', () => {
    expect(listingContent).toContain('searchQuery.trim()');
    expect(listingContent).toContain('`Search Results for “${searchQuery.trim()}”`');
  });

  it('renders contextual search subtitle and count', () => {
    expect(listingContent).toContain('`Showing ${products.length} handcrafted ${products.length === 1 ? \'creation\' : \'creations\'} matching “${searchQuery.trim()}”.`');
  });

  it('provides quick Clear Search button next to title and in search bar', () => {
    expect(listingContent).toContain('handleClearSearch');
    expect(listingContent).toContain('<span>Clear Search</span>');
  });

  it('renders category name as main heading when a category is selected', () => {
    expect(listingContent).toContain('activeCategoryObj.name');
    expect(listingContent).toContain('activeCategoryObj');
  });

  it('guarantees "The Prêt & Unstitched Archive" is not shown in default view, using clean "All Products" instead', () => {
    expect(listingContent).not.toContain('The Prêt & Unstitched Archive');
    expect(listingContent).not.toContain('Prêt & Unstitched Archive');
    expect(listingContent).toContain("'All Products'");
  });

  it('removes the redundant horizontal category capsule row to prevent visual clutter', () => {
    expect(listingContent).not.toContain('All Items');
    expect(listingContent).not.toContain('Top Horizontal Capsule Category Tabs Bar');
  });
});
