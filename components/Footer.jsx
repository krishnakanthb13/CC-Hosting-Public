'use client';

import Link from 'next/link';
import { Sparkles, Truck, ShieldCheck, RefreshCw, MessageCircle, ArrowUp, Instagram } from 'lucide-react';
import { getWhatsAppUrl, triggerWhatsApp } from '../lib/whatsapp';

export default function Footer() {
  const handleHashNav = (hash) => {
    if (typeof window !== 'undefined' && window.location.pathname === '/') {
      window.location.hash = hash;
      window.dispatchEvent(new Event('hashchange'));
    }
  };

  const scrollToTop = () => {
    if (typeof window !== 'undefined') {
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  };

  return (
    <footer className="cc-footer">
      <div className="footer-container">
        {/* Top Trust Guarantees Bar */}
        <div className="trust-bar">
          <div className="trust-item">
            <div className="trust-icon-box">
              <Truck size={22} />
            </div>
            <div className="trust-text">
              <div className="trust-title">Free Pan-India Delivery</div>
              <div className="trust-sub">On orders ₹1,499 and above</div>
            </div>
          </div>

          <div className="trust-item">
            <div className="trust-icon-box">
              <ShieldCheck size={22} />
            </div>
            <div className="trust-text">
              <div className="trust-title">Match-Grade Kits</div>
              <div className="trust-sub">Player versions &amp; master copies</div>
            </div>
          </div>

          <div className="trust-item">
            <div className="trust-icon-box">
              <RefreshCw size={20} />
            </div>
            <div className="trust-text">
              <div className="trust-title">7-Day Sizing Exchange</div>
              <div className="trust-sub">Hassle-free size replacements</div>
            </div>
          </div>

          <div className="trust-item">
            <div className="trust-icon-box wa-icon-box">
              <MessageCircle size={22} />
            </div>
            <div className="trust-text">
              <div className="trust-title">Live WhatsApp Support</div>
              <div className="trust-sub">Contact Us: Whatsapp</div>
            </div>
          </div>
        </div>

        {/* 4 Main Footer Navigation Columns */}
        <div className="footer-grid">
          {/* Brand Column */}
          <div className="footer-col brand-col">
            <div className="brand-header">
              <img
                src="/images/logo.jpeg"
                alt="Crown & Cross Logo"
                className="footer-logo"
              />
              <span className="serif-heading footer-brand-title">
                CROWN &amp; CROSS
              </span>
            </div>
            <p className="brand-description">
              "Some wear fashion. We wear football." Crafted for kit connoisseurs across India. Premium player versions, master copies, and immortal retros.
            </p>
            <div className="brand-location">
              📍 Based in <strong>Chennai, Tamil Nadu</strong>
            </div>
            <div className="brand-story-link">
              <Link
                href="/about"
                className="footer-link story-link"
              >
                <span>📖 Our Story &amp; Brand Ethos</span>
                <span className="story-arrow">→</span>
              </Link>
            </div>

            {/* Official Instagram Account Follow */}
            <div className="brand-insta-follow">
              <a
                href="https://www.instagram.com/_crown_and_cross_"
                target="_blank"
                rel="noopener noreferrer"
                className="footer-insta-card"
                title="Follow Crown & Cross on Instagram (@_crown_and_cross_)"
              >
                <div className="footer-insta-icon-badge">
                  <Instagram size={18} />
                </div>
                <div className="footer-insta-meta">
                  <span className="footer-insta-label">Follow our drops on Instagram</span>
                  <span className="footer-insta-handle">@_crown_and_cross_</span>
                </div>
              </a>
            </div>
          </div>

          {/* Quick Shopping Links */}
          <div className="footer-col">
            <h4 className="col-heading">Collections</h4>
            <ul className="footer-link-list">
              <li>
                <Link href="/#club" onClick={() => handleHashNav('club')} className="footer-link">
                  Club Kits (23/24 &amp; 24/25)
                </Link>
              </li>
              <li>
                <Link href="/#country" onClick={() => handleHashNav('country')} className="footer-link">
                  National Teams
                </Link>
              </li>
              <li>
                <Link
                  href="/#retro"
                  onClick={() => handleHashNav('retro')}
                  className="footer-link retro-link"
                >
                  <Sparkles size={12} /> Immortal Retro Editions
                </Link>
              </li>
              <li>
                <Link href="/size-guide" className="footer-link">
                  Sizing &amp; Fit Specifications
                </Link>
              </li>
              <li>
                <Link href="/request-estimate" className="footer-link">
                  Bulk &amp; Team Estimates
                </Link>
              </li>
            </ul>
          </div>

          {/* Trust & Customer Support */}
          <div className="footer-col">
            <h4 className="col-heading">Support &amp; Orders</h4>
            <ul className="footer-link-list">
              <li className="footer-info-item">
                ⏱️ UPI Payee: <strong>Jason Clement</strong>
              </li>
              <li>
                <a
                  href={getWhatsAppUrl("Hello Crown & Cross, I have an inquiry about football jerseys.")}
                  onClick={(e) => triggerWhatsApp({ text: "Hello Crown & Cross, I have an inquiry about football jerseys.", e })}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="footer-wa-link"
                  title="Contact Us on WhatsApp"
                >
                  <MessageCircle size={15} />
                  <span>Contact Us: Whatsapp</span>
                </a>
              </li>
              <li>
                <a
                  href="https://www.instagram.com/_crown_and_cross_"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="footer-link footer-insta-link-item"
                  title="Contact Us on Instagram (@_crown_and_cross_)"
                >
                  <Instagram size={15} className="footer-inline-icon" />
                  <span>Contact Us: Instagram</span>
                </a>
              </li>
              <li>
                <a
                  href="mailto:crownandcross29@gmail.com"
                  className="footer-link"
                  title="Email Us"
                >
                  ✉️ Email Us
                </a>
              </li>
              <li className="delivery-item">
                <Link
                  href="/shipping-policy"
                  className="delivery-link"
                  title="View full Shipping & Delivery Policy"
                >
                  <span>📦 Delivery Estimates:</span>
                  <span className="delivery-arrow">→</span>
                </Link>
                <ul className="delivery-subpoints">
                  <li>• <strong>Metro:</strong> 3–5 Days</li>
                  <li>• <strong>Rest of India:</strong> 5–8 Days</li>
                </ul>
              </li>
            </ul>
          </div>

          {/* Legal & Policies */}
          <div className="footer-col">
            <h4 className="col-heading">Policies</h4>
            <ul className="footer-link-list">
              <li>
                <Link href="/shipping-policy" className="footer-link">
                  Shipping &amp; Delivery Policy (₹80 / Free &gt; ₹1499)
                </Link>
              </li>
              <li>
                <Link href="/returns-policy" className="footer-link">
                  Returns &amp; Sizing Exchange (5–7 Days)
                </Link>
              </li>
              <li>
                <Link href="/terms" className="footer-link">
                  Terms of Service
                </Link>
              </li>
              <li>
                <Link href="/privacy" className="footer-link">
                  Privacy Policy &amp; Cookies
                </Link>
              </li>
            </ul>
          </div>
        </div>

        {/* Accepted Payment Methods (Strictly Verified Supported Methods) */}
        <div className="payments-banner">
          <div className="payments-info">
            <span className="payments-title">
              🔒 Verified UPI Payment Modes
            </span>
            <span className="payments-sub">
              100% Secure Prepaid Orders • Payee: <strong>Jason Clement</strong> (<code>jasonclement.jm-1@okhdfcbank</code>)
            </span>
          </div>

          <div className="payments-badges">
            <span className="payment-badge">⚡ UPI QR</span>
            <span className="payment-badge">Google Pay</span>
            <span className="payment-badge">PhonePe</span>
            <span className="payment-badge">Paytm</span>
            <span className="payment-badge">BHIM</span>
            <span className="payment-badge">CRED</span>
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="bottom-bar">
          <div className="copyright-text">
            © {new Date().getFullYear()} <strong>Crown &amp; Cross</strong>. Wear Your Club. Wear Your Story. All rights reserved.
          </div>

          <div className="bottom-actions">
            <div className="bottom-meta">
              <span>Powered by Next.js</span>
              <span>•</span>
              <span>Founder: Jason Clement</span>
              <span>•</span>
              <a
                href="https://www.instagram.com/_crown_and_cross_"
                target="_blank"
                rel="noopener noreferrer"
                className="footer-bottom-insta-link"
                title="Follow Crown & Cross on Instagram"
              >
                <Instagram size={12} style={{ display: 'inline', verticalAlign: '-1px', marginRight: '4px' }} />
                <span>@_crown_and_cross_</span>
              </a>
            </div>

            <button
              onClick={scrollToTop}
              className="back-to-top-btn"
              title="Scroll back to top"
            >
              <ArrowUp size={13} color="var(--gold-primary)" />
              <span>Back to Top</span>
            </button>
          </div>
        </div>
      </div>
    </footer>
  );
}
