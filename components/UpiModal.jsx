'use client';

import { useState, useEffect } from 'react';
import QRCode from 'qrcode';
import { X, Check, Copy, MessageCircle, QrCode, Zap } from 'lucide-react';
import { getWhatsAppUrl, triggerWhatsApp } from '../lib/whatsapp';

export default function UpiModal({ orderDetails, onClose }) {
  const [qrDataUrl, setQrDataUrl] = useState('');
  const [copied, setCopied] = useState(false);
  const [copiedOrder, setCopiedOrder] = useState(false);

  const {
    orderId = `CC-${Math.floor(100000 + Math.random() * 900000)}`,
    amount = 1499,
    items = [],
    customer = {}
  } = orderDetails || {};

  const upiId = 'jasonclement.jm-1@okhdfcbank';
  const payeeName = 'Jason Clement';
  const note = `Order ${orderId}`;
  const refId = String(orderId).replace(/[^a-zA-Z0-9]/g, '');

  // UPI deep link with pre-filled transaction note (tn), reference ID (tr), and mode=02 (Dynamic QR)
  const upiUri = `upi://pay?pa=${upiId}&pn=${encodeURIComponent(
    payeeName
  )}&am=${amount}&tn=${encodeURIComponent(note)}&tr=${encodeURIComponent(refId)}&mode=02&cu=INR`;

  useEffect(() => {
    QRCode.toDataURL(upiUri, {
      width: 260,
      margin: 2,
      color: {
        dark: '#0d140f',
        light: '#ffffff'
      }
    })
      .then((url) => setQrDataUrl(url))
      .catch((err) => console.error('QR generation error', err));
  }, [upiUri]);

  const handleCopyUpi = () => {
    navigator.clipboard.writeText(upiId);
    setCopied(true);
    setTimeout(() => setCopied(false), 2500);
  };

  const handleCopyOrder = () => {
    navigator.clipboard.writeText(orderId);
    setCopiedOrder(true);
    setTimeout(() => setCopiedOrder(false), 2500);
  };

  const shareScreenshotText = `Hello Jason, I have completed the UPI payment of ₹${amount} for Order #${orderId}.\n\nItems:\n${items
    .map((i) => `- ${i.name} (Size: ${i.size}) x${i.quantity}`)
    .join('\n')}\n\nCustomer: ${customer.name || 'Customer'}\nPhone: ${
    customer.phone || 'N/A'
  }\nAddress: ${customer.address || 'N/A'}, ${customer.city || ''} ${customer.pincode || ''}\n\nAttaching payment screenshot here!`;

  const waScreenshotUrl = getWhatsAppUrl(shareScreenshotText);

  return (
    <div
      style={{
        position: 'fixed',
        inset: 0,
        backgroundColor: 'rgba(0, 0, 0, 0.85)',
        backdropFilter: 'blur(8px)',
        zIndex: 100,
        display: 'grid',
        placeItems: 'center',
        padding: '20px'
      }}
    >
      <div
        className="animate-fade-in"
        style={{
          backgroundColor: 'var(--bg-surface)',
          border: '1px solid var(--border-active)',
          borderRadius: '24px',
          width: '100%',
          maxWidth: '480px',
          maxHeight: '90vh',
          overflowY: 'auto',
          padding: 'clamp(20px, 5vw, 30px) clamp(16px, 4vw, 28px)',
          boxShadow: '0 25px 60px rgba(0,0,0,0.8)',
          textAlign: 'center',
          position: 'relative'
        }}
      >
        <button
          onClick={onClose}
          style={{
            position: 'absolute',
            top: '20px',
            right: '20px',
            background: 'none',
            border: 'none',
            color: 'var(--text-muted)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            cursor: 'pointer',
            padding: '4px',
            borderRadius: '6px'
          }}
        >
          <X size={20} />
        </button>

        <div style={{ display: 'inline-block', padding: '6px 14px', borderRadius: '999px', background: 'var(--gold-glow)', border: '1px solid var(--gold-primary)', color: 'var(--gold-primary)', fontSize: '11px', fontWeight: 800, textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: '14px' }}>
          UPI Instant QR Payment
        </div>

        <h3 className="serif-heading" style={{ fontSize: '22px', fontWeight: 700, color: 'var(--text-primary)', marginBottom: '4px' }}>
          Order #{orderId}
        </h3>
        <div style={{ display: 'inline-flex', alignItems: 'center', gap: '6px', fontSize: '12px', color: 'var(--text-muted)', marginBottom: '8px' }}>
          <span>Comment / Note pre-filled: <strong style={{ color: 'var(--gold-primary)' }}>Order {orderId}</strong></span>
          <button
            type="button"
            onClick={handleCopyOrder}
            style={{
              background: 'transparent',
              border: 'none',
              color: copiedOrder ? '#4ade80' : 'var(--gold-primary)',
              cursor: 'pointer',
              display: 'inline-flex',
              alignItems: 'center',
              padding: '2px 4px',
              gap: '4px',
              fontSize: '11px',
              fontWeight: 600
            }}
            title="Copy Order ID"
          >
            {copiedOrder ? <><Check size={12} /> Copied</> : <><Copy size={12} /> Copy</>}
          </button>
        </div>
        <p className="upi-scan-text" style={{ fontSize: '13px', color: 'var(--text-secondary)', marginBottom: '18px' }}>
          Scan using any UPI App (GPay, PhonePe, Paytm, CRED, BHIM)
        </p>

        {/* ONLY FOR MOBILE VIEW: Opens any installed UPI app on Android and iPhone */}
        <div className="mobile-only-upi-block">
          <a
            href={upiUri}
            className="mobile-upi-open-btn"
            title="Open installed UPI app (Google Pay, PhonePe, Paytm, CRED, BHIM)"
          >
            <div className="mobile-upi-open-icon">
              <Zap size={22} fill="currentColor" />
            </div>
            <div className="mobile-upi-open-text">
              <span className="mobile-upi-open-title">⚡ Pay ₹{amount} with Installed UPI App</span>
              <span className="mobile-upi-open-sub">Tap to open GPay • PhonePe • Paytm • CRED • BHIM</span>
            </div>
          </a>
          <div className="mobile-upi-or-divider">
            <span>OR SCAN QR / COPY UPI ID BELOW</span>
          </div>
        </div>

        {/* QR Display */}
        <div
          style={{
            background: '#ffffff',
            padding: '16px',
            borderRadius: '16px',
            display: 'inline-block',
            boxShadow: '0 10px 30px rgba(0,0,0,0.4)',
            marginBottom: '18px'
          }}
        >
          {qrDataUrl ? (
            <img src={qrDataUrl} alt="UPI QR Code" style={{ width: '220px', height: '220px', display: 'block' }} />
          ) : (
            <div style={{ width: '220px', height: '220px', display: 'grid', placeItems: 'center', color: '#111' }}>
              Generating QR...
            </div>
          )}
        </div>

        {/* Amount Pill */}
        <div
          style={{
            backgroundColor: 'var(--bg-elevated)',
            border: '1px solid var(--border-subtle)',
            borderRadius: '12px',
            padding: '12px 16px',
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            marginBottom: '16px'
          }}
        >
          <div style={{ textAlign: 'left' }}>
            <span style={{ fontSize: '11px', color: 'var(--text-muted)', display: 'block' }}>Payable Amount</span>
            <span style={{ fontSize: '20px', fontWeight: 800, color: 'var(--gold-primary)' }}>₹{amount}</span>
          </div>
          <div style={{ textAlign: 'right' }}>
            <span style={{ fontSize: '11px', color: 'var(--text-muted)', display: 'block' }}>Verified Payee</span>
            <span style={{ fontSize: '13px', fontWeight: 700, color: 'var(--text-primary)' }}>Jason Clement</span>
          </div>
        </div>

        {/* Copy UPI ID */}
        <div
          style={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            backgroundColor: 'var(--bg-primary)',
            padding: '10px 14px',
            borderRadius: '10px',
            border: '1px solid var(--border-subtle)',
            marginBottom: '22px',
            fontSize: '12px'
          }}
        >
          <code style={{ color: 'var(--gold-light)' }}>{upiId}</code>
          <button
            onClick={handleCopyUpi}
            style={{
              background: 'transparent',
              border: 'none',
              color: copied ? '#4ade80' : 'var(--gold-primary)',
              fontWeight: 700,
              cursor: 'pointer',
              display: 'inline-flex',
              alignItems: 'center',
              gap: '5px'
            }}
          >
            {copied ? <><Check size={13} /> Copied!</> : <><Copy size={13} /> Copy VPA</>}
          </button>
        </div>

        {/* Next step prompt */}
        <div
          style={{
            backgroundColor: 'rgba(34, 197, 94, 0.1)',
            border: '1px solid rgba(34, 197, 94, 0.3)',
            borderRadius: '12px',
            padding: '12px 14px',
            fontSize: '12px',
            color: '#bbf7d0',
            textAlign: 'left',
            marginBottom: '18px',
            lineHeight: 1.5
          }}
        >
          <strong>Next step to confirm dispatch:</strong> After paying, click below to send your payment screenshot to our official WhatsApp (<strong>+91 76959 24602</strong>).
        </div>

        {/* Action button */}
        <a
          href={waScreenshotUrl}
          onClick={(e) => triggerWhatsApp({ text: shareScreenshotText, e })}
          target="_blank"
          rel="noopener noreferrer"
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            gap: '8px',
            width: '100%',
            padding: '12px',
            borderRadius: '12px',
            backgroundColor: '#22c55e',
            color: '#0d140f',
            fontWeight: 800,
            fontSize: '14px',
            textDecoration: 'none',
            boxShadow: '0 4px 18px rgba(34, 197, 94, 0.3)',
            cursor: 'pointer'
          }}
        >
          <MessageCircle size={18} />
          <span>Send Screenshot on WhatsApp</span>
        </a>
      </div>
    </div>
  );
}
