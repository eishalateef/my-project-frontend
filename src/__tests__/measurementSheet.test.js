import { describe, it, expect } from 'vitest';
import { MEASUREMENT_CATEGORIES, detectProductMeasurementCategory } from '../components/SizeChartModal';
import fs from 'fs';
import path from 'path';

describe('Artisanal Product Measurement Sheet System', () => {
  it('defines comprehensive measurement categories tailored for all store product lines', () => {
    const keys = Object.keys(MEASUREMENT_CATEGORIES);
    expect(keys).toContain('dress');
    expect(keys).toContain('crochet-bag');
    expect(keys).toContain('fabric-bag');
    expect(keys).toContain('crochet-cap');
    expect(keys).toContain('jewellery');
    expect(keys).toContain('kids-crochet');
  });

  it('provides detailed measurement sheet for Hand-Embroidered Stitched Dresses', () => {
    const dress = MEASUREMENT_CATEGORIES.dress;
    expect(dress.title).toContain('Hand-Embroidered Stitched Dress');
    expect(dress.columns).toContain('Chest / Bust');
    expect(dress.columns).toContain('Shoulder');
    expect(dress.columns).toContain('Dress Length');
    expect(dress.columns).toContain('Flare / Ghera');
    expect(dress.columns).toContain('Trouser Length');
    expect(dress.rows.length).toBe(5); // XS, S, M, L, XL
    expect(dress.howToMeasure.some((m) => m.desc.includes('1.5 inches'))).toBe(true);
  });

  it('provides dedicated dimensions and capacity sheet for Crochet Bags', () => {
    const bag = MEASUREMENT_CATEGORIES['crochet-bag'];
    expect(bag.title).toContain('Crochet Bag Dimensions');
    expect(bag.columns).toContain('Bag Style');
    expect(bag.columns).toContain('Height');
    expect(bag.columns).toContain('Width');
    expect(bag.columns).toContain('Handle / Strap Drop');
    expect(bag.columns).toContain('Everyday Fit & Capacity');
    const styles = bag.rows.map((r) => r[0]);
    expect(styles).toContain('Crochet Tote Bag');
    expect(styles).toContain('Floral Granny Square Bag');
    expect(styles).toContain('Potli Crochet Bag');
  });

  it('provides dedicated dimensions and utility sheet for Fabric Bags', () => {
    const fabricBag = MEASUREMENT_CATEGORIES['fabric-bag'];
    expect(fabricBag.title).toContain('Fabric & Quilted Bag Dimensions');
    expect(fabricBag.columns).toContain('Base Gusset');
    const styles = fabricBag.rows.map((r) => r[0]);
    expect(styles).toContain('Floral Fabric Tote Bag');
    expect(styles).toContain('Quilted Shoulder Bag');
    expect(styles).toContain('School / Work Fabric Bag');
  });

  it('provides head circumference and stretch sheet for Crochet Caps & Beanies', () => {
    const cap = MEASUREMENT_CATEGORIES['crochet-cap'];
    expect(cap.title).toContain('Crochet Cap & Beanie Measurement');
    expect(cap.columns).toContain('Head Circumference');
    expect(cap.columns).toContain('Crown Depth');
    const profiles = cap.rows.map((r) => r[0]);
    expect(profiles).toContain('Adult Standard (Free Stretch)');
    expect(profiles).toContain('Adult Snug Traditional');
    expect(cap.howToMeasure.some((m) => m.step.includes('Head Circumference'))).toBe(true);
  });

  it('provides thread jewellery measurements including standard Pakistani bangle sizes 2.4, 2.6, and 2.8', () => {
    const jewel = MEASUREMENT_CATEGORIES.jewellery;
    expect(jewel.title).toContain('Thread Jewellery Measurement');
    const pieces = jewel.rows.map((r) => r[0]);
    expect(pieces).toContain('Thread Jhumkas & Earrings');
    expect(pieces).toContain('Resham Choker / Necklace');
    expect(pieces).toContain('Thread Bangles (Size 2.4)');
    expect(pieces).toContain('Thread Bangles (Size 2.6)');
    expect(pieces).toContain('Thread Bangles (Size 2.8)');

    // Verify bangle diameters
    const b24 = jewel.rows.find((r) => r[0] === 'Thread Bangles (Size 2.4)');
    const b26 = jewel.rows.find((r) => r[0] === 'Thread Bangles (Size 2.6)');
    const b28 = jewel.rows.find((r) => r[0] === 'Thread Bangles (Size 2.8)');
    expect(b24[2]).toContain('2.25 in / 5.7 cm');
    expect(b26[2]).toContain('2.37 in / 6.0 cm');
    expect(b28[2]).toContain('2.50 in / 6.4 cm');
  });

  it('automatically detects the correct measurement category for real catalog products', () => {
    // 1. Crochet Bag
    expect(detectProductMeasurementCategory({ name: 'Crochet Tote Bag', category: { name: 'Crochet Bag', slug: 'crochet-bag-gyEi' } })).toBe('crochet-bag');
    expect(detectProductMeasurementCategory({ name: 'Potli Crochet Bag', category: { name: 'Crochet Bag' } })).toBe('crochet-bag');

    // 2. Fabric Bag
    expect(detectProductMeasurementCategory({ name: 'Floral Fabric Tote Bag', category: { name: 'Fabric Bag', slug: 'fabric-bag-2Upe' } })).toBe('fabric-bag');
    expect(detectProductMeasurementCategory({ name: 'Quilted Fabric Shoulder Bag', category: { name: 'Fabric Bag' } })).toBe('fabric-bag');

    // 3. Crochet Cap
    expect(detectProductMeasurementCategory({ name: 'Deep Blue Hand-Knitted Textured Traditional Cap', category: { name: 'Crochet Caps', slug: 'crochet-caps-liOX' } })).toBe('crochet-cap');
    expect(detectProductMeasurementCategory({ name: 'Traditional Topi Cap', category: { name: 'Accessories' } })).toBe('crochet-cap');

    // 4. Thread Jewellery
    expect(detectProductMeasurementCategory({ name: 'Rangrez Thread Earrings', category: { name: 'Jewellery', slug: 'jewellery-6odb' } })).toBe('jewellery');
    expect(detectProductMeasurementCategory({ name: 'Rangoli Thread Bangles', category: { name: 'Jewellery' } })).toBe('jewellery');
    expect(detectProductMeasurementCategory({ name: 'Noor Resham Jewellery Set', category: { name: 'Jewellery' } })).toBe('jewellery');

    // 5. Stitched Dress
    expect(detectProductMeasurementCategory({ name: 'Mint Green Embroidered Pishwas / Long Frock', category: { name: 'Traditional / Luxury Pret Wear' } })).toBe('dress');
    expect(detectProductMeasurementCategory({ name: 'Royal Blue Gold-Embroidered Pishwas with Trousers', category: { name: 'Pret' } })).toBe('dress');

    // 6. Kids Crochet
    expect(detectProductMeasurementCategory({ name: 'Sunshine Petal Frock', category: { name: 'Kids Crochet Tops & Frocks', slug: 'kids-crochet-tops-frocks-9ftX' } })).toBe('kids-crochet');
  });

  it('verifies ProductDetail.jsx includes dedicated measurement tables for all 5 product types', () => {
    const pdPath = path.resolve(__dirname, '../pages/ProductDetail.jsx');
    const content = fs.readFileSync(pdPath, 'utf-8');

    expect(content).toContain('isCap');
    expect(content).toContain('isCrochetBag');
    expect(content).toContain('isFabricBag');
    expect(content).toContain('isJewelry');
    expect(content).toContain('isDress');
    expect(content).toContain('Crochet Cap & Beanie Measurement Specifications');
    expect(content).toContain('Artisanal Crochet Bag Dimensions & Capacity');
    expect(content).toContain('Handcrafted Fabric Bag Dimensions & Capacity');
    expect(content).toContain('Handmade Thread Jewellery Measurement & Fit Sheet');
    expect(content).toContain('Hand-Embroidered Stitched Dress & Pishwas Specifications');
  });
});
