import { describe, it, expect } from 'vitest';
import fs from 'fs';
import path from 'path';

describe('Courier / Rider Portal Modern UI & Functionality Verification', () => {
  const deliveryPortalPath = path.resolve(__dirname, '../pages/delivery/DeliveryPortal.jsx');
  const deliveryPortalContent = fs.readFileSync(deliveryPortalPath, 'utf-8');

  it('guarantees DeliveryPortal exists with complete courier functionality', () => {
    expect(fs.existsSync(deliveryPortalPath)).toBe(true);
    expect(deliveryPortalContent).toContain('export default function DeliveryPortal');
    expect(deliveryPortalContent).toContain('handleUpdateStatus');
    expect(deliveryPortalContent).toContain('handleApplyPresetNote');
    expect(deliveryPortalContent).toContain('/api/delivery/orders');
    expect(deliveryPortalContent).toContain('/api/delivery/stats');
  });

  it('verifies 1-tap communication & navigation shortcuts on courier cards', () => {
    // 1-Tap Phone dialer
    expect(deliveryPortalContent).toContain('href={`tel:${phoneClean}`}');
    // 1-Tap WhatsApp chat with polite Urdu/English greeting
    expect(deliveryPortalContent).toContain('https://wa.me/${phoneClean}');
    expect(deliveryPortalContent).toContain('Assalam-o-Alaikum');
    // 1-Tap Google Maps route
    expect(deliveryPortalContent).toContain('https://www.google.com/maps/search/?api=1&query=');
  });

  it('renders prominent COD cash-to-collect warnings to eliminate cash handling errors', () => {
    expect(deliveryPortalContent).toContain('Cash On Delivery');
    expect(deliveryPortalContent).toContain('COLLECT:');
    expect(deliveryPortalContent).toContain('Prepaid (Paid Online)');
    expect(deliveryPortalContent).toContain('DO NOT COLLECT CASH');
  });

  it('provides simple, user-friendly KPI performance tiles for delivery fleet', () => {
    expect(deliveryPortalContent).toContain('Assigned Parcels');
    expect(deliveryPortalContent).toContain('Out For Delivery');
    expect(deliveryPortalContent).toContain('Delivered Today');
    expect(deliveryPortalContent).toContain('COD Cash To Collect');
  });

  it('features quick-action notes and touch-friendly delivery status confirmation', () => {
    expect(deliveryPortalContent).toContain('Handed in person');
    expect(deliveryPortalContent).toContain('Handed to family');
    expect(deliveryPortalContent).toContain('Left at gate / guard');
    expect(deliveryPortalContent).toContain('Mark Delivered');
    expect(deliveryPortalContent).toContain('Start Route • Out For Delivery');
    expect(deliveryPortalContent).toContain('Delivery Failed / Re-attempt');
  });

  it('displays comprehensive Today\'s Cash Collected details and Cash Ledger tab', () => {
    // Dedicated Today's Cash Ledger tab
    expect(deliveryPortalContent).toContain("Today's Cash Ledger");
    expect(deliveryPortalContent).toContain("Shift Cash in Hand");
    expect(deliveryPortalContent).toContain("Cash Reconciliation & Handover Ledger");
    expect(deliveryPortalContent).toContain("Itemized Manifest Reconciliations");
    expect(deliveryPortalContent).toContain("Total Physical Cash To Deposit");
  });

  it('provides an official shift cash handover reconciliation slip with print & signature lines', () => {
    // Handover slip modal
    expect(deliveryPortalContent).toContain("Courier Cash Handover Slip");
    expect(deliveryPortalContent).toContain("Courier Rider Signature");
    expect(deliveryPortalContent).toContain("Cashier / Depot Manager Sign");
    expect(deliveryPortalContent).toContain("Print Shift Handover Receipt");
    expect(deliveryPortalContent).toContain("window.print()");
  });
});
