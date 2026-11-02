import { getBrandConfig } from '../../lib/products';

export const dynamic = 'force-dynamic';

export const metadata = {
  title: 'Terms of Service — Crown & Cross',
  description: 'Terms of service and customer conditions for Crown & Cross.'
};

export default function TermsPage() {
  // Payee identity is admin-editable in products.json
  const brand = getBrandConfig();
  const upiId = brand.upiId || 'jasonclement.jm-1@okhdfcbank';
  const payeeName = brand.payeeName || 'Jason Clement';

  return (
    <div style={{ maxWidth: '840px', margin: '60px auto 100px', padding: '0 24px' }}>
      <h1 className="serif-heading" style={{ fontSize: '36px', fontWeight: 800, color: 'var(--gold-primary)', marginBottom: '12px' }}>
        Terms of Service
      </h1>
      <p style={{ fontSize: '14px', color: 'var(--text-muted)', marginBottom: '36px' }}>
        Effective: September 2026 • Crown &amp; Cross (Chennai, Tamil Nadu)
      </p>

      <div style={{ backgroundColor: 'var(--bg-surface)', border: '1px solid var(--border-subtle)', borderRadius: '20px', padding: '36px 32px', display: 'flex', flexDirection: 'column', gap: '24px', fontSize: '14px', lineHeight: 1.7, color: 'var(--text-secondary)' }}>
        <div>
          <h2 style={{ fontSize: '18px', fontWeight: 700, color: 'var(--text-primary)', marginBottom: '10px' }}>
            1. Overview
          </h2>
          <p>
            This website and storefront is operated by <strong>Crown &amp; Cross</strong> (Proprietor: Jason Clement), Chennai, India. By placing an order via our WhatsApp link, email, or website interface, you agree to be bound by the terms detailed herein.
          </p>
        </div>

        <div>
          <h2 style={{ fontSize: '18px', fontWeight: 700, color: 'var(--text-primary)', marginBottom: '10px' }}>
            2. Product Quality &amp; Classification
          </h2>
          <p>
            We curate sports apparel classified under explicit tiers: Player Version, Master Copy, Fan Version Set, Embroidered, and Sublimation. Specifications, sizing notes, and fabric treatments are provided on each product page.
          </p>
        </div>

        <div>
          <h2 style={{ fontSize: '18px', fontWeight: 700, color: 'var(--text-primary)', marginBottom: '10px' }}>
            3. Pricing &amp; UPI Payments
          </h2>
          <p>
            All prices are listed in Indian Rupees (₹ INR). Payments are collected via direct UPI URI/QR code to payee <strong>{payeeName}</strong> (
            <a
              href={`upi://pay?pa=${upiId}&pn=${encodeURIComponent(payeeName)}`}
              style={{ color: 'var(--gold-primary)', fontWeight: 600, textDecoration: 'underline' }}
              title="Click to open in UPI app"
            >
              <code>{upiId}</code>
            </a>
            ). Orders are officially queued for dispatch upon verification of the customer's payment transaction screenshot.
          </p>
        </div>

        <div>
          <h2 style={{ fontSize: '18px', fontWeight: 700, color: 'var(--text-primary)', marginBottom: '10px' }}>
            4. Governing Jurisdiction
          </h2>
          <p>
            Any disputes arising from transactions on this platform shall be subject to the exclusive jurisdiction of the competent courts located in Chennai, Tamil Nadu, India.
          </p>
        </div>
      </div>
    </div>
  );
}
