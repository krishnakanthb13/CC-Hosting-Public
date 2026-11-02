import { getWhatsAppUrl } from '../../lib/whatsapp';
import { getBrandConfig } from '../../lib/products';

export const dynamic = 'force-dynamic';

export const metadata = {
  title: 'Shipping & Delivery Policy — Crown & Cross',
  description: 'Pan-India shipping rates, delivery timelines, and tracking policies.'
};

export default function ShippingPolicyPage() {
  // Rates, timelines and contact channels are admin-editable in products.json
  const brand = getBrandConfig();
  const shipping = brand.shipping || {};
  const standardFee = shipping.standardFee ?? 80;
  const freeShippingThreshold = shipping.freeShippingThreshold ?? 1499;
  const metroDays = shipping.metroDeliveryDays || '3-5 Business Days';
  const restOfIndiaDays = shipping.restOfIndiaDeliveryDays || '5-8 Business Days';
  const phone = brand.phone || '+917695924602';
  const email = brand.email || 'crownandcross29@gmail.com';

  return (
    <div style={{ maxWidth: '840px', margin: '60px auto 100px', padding: '0 24px' }}>
      <h1 className="serif-heading" style={{ fontSize: '36px', fontWeight: 800, color: 'var(--gold-primary)', marginBottom: '12px' }}>
        Shipping &amp; Delivery Policy
      </h1>
      <p style={{ fontSize: '14px', color: 'var(--text-muted)', marginBottom: '36px' }}>
        Last Updated: September 2026 • Operating from Chennai, Tamil Nadu
      </p>

      <div style={{ backgroundColor: 'var(--bg-surface)', border: '1px solid var(--border-subtle)', borderRadius: '20px', padding: '36px 32px', display: 'flex', flexDirection: 'column', gap: '28px', fontSize: '14px', lineHeight: 1.7, color: 'var(--text-secondary)' }}>
        <div>
          <h2 style={{ fontSize: '18px', fontWeight: 700, color: 'var(--text-primary)', marginBottom: '10px' }}>
            1. Shipping Coverage &amp; Rates
          </h2>
          <p>
            Crown &amp; Cross ships across all serviceable pin codes throughout India via trusted courier partners (Bluedart, Delhivery, DTDC, and Speed Post).
          </p>
          <div style={{ marginTop: '14px', padding: '16px', backgroundColor: 'var(--bg-elevated)', borderRadius: '12px', border: '1px solid var(--border-subtle)' }}>
            <ul style={{ paddingLeft: '20px', display: 'flex', flexDirection: 'column', gap: '8px' }}>
              <li><strong>Standard Flat Rate:</strong> ₹{standardFee} on orders under ₹{freeShippingThreshold.toLocaleString('en-IN')}.</li>
              <li><strong>Free Shipping:</strong> Automatically applied to all orders of <strong>₹{freeShippingThreshold.toLocaleString('en-IN')} and above</strong>.</li>
            </ul>
          </div>
        </div>

        <div>
          <h2 style={{ fontSize: '18px', fontWeight: 700, color: 'var(--text-primary)', marginBottom: '10px' }}>
            2. Delivery Timelines
          </h2>
          <p>
            Orders are processed and packed within 24–48 hours of payment confirmation (UPI verification). Estimated delivery timeframes:
          </p>
          <ul style={{ paddingLeft: '20px', marginTop: '10px', display: 'flex', flexDirection: 'column', gap: '6px' }}>
            <li><strong>Metro Cities (Chennai, Bengaluru, Mumbai, Delhi-NCR, Hyderabad, Kolkata):</strong> {metroDays}.</li>
            <li><strong>Rest of India (Tier 2/3 Cities &amp; Towns):</strong> {restOfIndiaDays}.</li>
          </ul>
        </div>

        <div>
          <h2 style={{ fontSize: '18px', fontWeight: 700, color: 'var(--text-primary)', marginBottom: '10px' }}>
            3. Order Tracking &amp; Verification
          </h2>
          <p>
            Once your payment screenshot is verified on WhatsApp (
            <a
              href={getWhatsAppUrl("Hello Crown & Cross, attaching my payment verification", phone)}
              target="_blank"
              rel="noopener noreferrer"
              style={{ color: '#4ade80', fontWeight: 700, textDecoration: 'underline' }}
            >
              {phone}
            </a>
            ) or email (
            <a
              href={`mailto:${email}?subject=Payment%20Verification`}
              style={{ color: 'var(--gold-primary)', fontWeight: 700, textDecoration: 'underline' }}
            >
              {email}
            </a>
            ), you will receive:
          </p>
          <ul style={{ paddingLeft: '20px', marginTop: '10px', display: 'flex', flexDirection: 'column', gap: '6px' }}>
            <li>An immediate order confirmation message with your Order ID.</li>
            <li>A courier tracking number with a live tracking link upon package dispatch.</li>
          </ul>
        </div>

        <div>
          <h2 style={{ fontSize: '18px', fontWeight: 700, color: 'var(--text-primary)', marginBottom: '10px' }}>
            4. Damaged or Tampered Parcels
          </h2>
          <p>
            If the package arrives visibly damaged or tampered with, please record an unboxing video and immediately notify our WhatsApp support at{' '}
            <a
              href={getWhatsAppUrl("Hello Crown & Cross, reporting damaged parcel", phone)}
              target="_blank"
              rel="noopener noreferrer"
              style={{ color: '#4ade80', fontWeight: 700, textDecoration: 'underline' }}
            >
              {phone}
            </a>{' '}
            within 24 hours of delivery so we can issue an instant replacement.
          </p>
        </div>
      </div>
    </div>
  );
}
