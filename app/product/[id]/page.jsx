'use client';

import { useState, useEffect } from 'react';
import { useParams } from 'next/navigation';
import Link from 'next/link';
import JerseyCarousel from '../../../components/JerseyCarousel';
import ProductCard from '../../../components/ProductCard';
import { useCart } from '../../../context/CartContext';
import { getWhatsAppUrl, triggerWhatsApp } from '../../../lib/whatsapp';
import {
  Award,
  Truck,
  Ruler,
  ShoppingBag,
  MessageCircle,
  X,
  ChevronRight
} from 'lucide-react';

export default function ProductDetailPage() {
  const { id } = useParams();
  const { addToCart } = useCart();

  const [product, setProduct] = useState(null);
  const [allProducts, setAllProducts] = useState([]);
  const [selectedSize, setSelectedSize] = useState('M');
  const [quantity, setQuantity] = useState(1);
  const [loading, setLoading] = useState(true);
  const [showSizeModal, setShowSizeModal] = useState(false);

  useEffect(() => {
    window.scrollTo({ top: 0, left: 0, behavior: 'instant' });
    fetch('/data/products.json')
      .then((res) => res.json())
      .then((data) => {
        const list = data.products || [];
        setAllProducts(list);
        const match = list.find((p) => p.id === id || p.slug === id);
        if (match) {
          setProduct(match);
          if (match.sizes && match.sizes.length > 0) {
            setSelectedSize(match.sizes[0]);
          }
        }
      })
      .catch((err) => console.error(err))
      .finally(() => {
        setLoading(false);
        window.scrollTo({ top: 0, left: 0, behavior: 'instant' });
      });
  }, [id]);

  if (loading) {
    return (
      <div style={{ maxWidth: '1200px', margin: '100px auto', textAlign: 'center', color: 'var(--text-secondary)' }}>
        Loading jersey details...
      </div>
    );
  }

  if (!product) {
    return (
      <div style={{ maxWidth: '800px', margin: '100px auto', textAlign: 'center', padding: '0 24px' }}>
        <h2 className="serif-heading" style={{ fontSize: '32px', color: 'var(--gold-primary)', marginBottom: '12px' }}>
          Jersey Not Found
        </h2>
        <p style={{ color: 'var(--text-secondary)', marginBottom: '24px' }}>
          The requested football kit does not exist or has been discontinued.
        </p>
        <Link
          href="/#catalog"
          style={{
            display: 'inline-block',
            padding: '12px 24px',
            backgroundColor: 'var(--gold-primary)',
            color: '#0d140f',
            borderRadius: '999px',
            fontWeight: 700
          }}
        >
          Return to Jersey Catalog
        </Link>
      </div>
    );
  }

  const discountPercent =
    product.mrp && product.mrp > product.price
      ? Math.round(((product.mrp - product.price) / product.mrp) * 100)
      : null;

  const directWhatsAppText = `Hello Crown & Cross, I would like to buy:\n\nKit: ${product.name}\nQuality: ${product.subCategory}\nSize: ${selectedSize}\nQuantity: ${quantity}\nPrice: ₹${product.price * quantity}\n\nPlease confirm availability!`;
  const directWhatsAppUrl = getWhatsAppUrl(directWhatsAppText);

  const relatedKits = allProducts
    .filter((p) => p.id !== product.id && (p.category === product.category || p.subCategory === product.subCategory))
    .slice(0, 3);

  const categoryHash = product.category
    ? `/#${product.category.toLowerCase().trim()}`
    : '/#catalog';

  return (
    <div style={{ maxWidth: '1280px', margin: '40px auto 80px', padding: '0 24px' }}>
      {/* Breadcrumbs */}
      <nav
        aria-label="Breadcrumb"
        style={{
          display: 'flex',
          alignItems: 'center',
          flexWrap: 'wrap',
          gap: '8px',
          fontSize: '13px',
          color: 'var(--text-muted)',
          marginBottom: '28px',
          lineHeight: 1.5
        }}
      >
        <Link
          href="/"
          className="breadcrumb-link"
          style={{
            color: 'var(--text-secondary)',
            display: 'inline-flex',
            alignItems: 'center',
            textDecoration: 'none'
          }}
        >
          Home
        </Link>

        <ChevronRight size={13} color="var(--text-muted)" style={{ flexShrink: 0 }} />

        <Link
          href={categoryHash}
          className="breadcrumb-link"
          style={{
            color: 'var(--text-secondary)',
            display: 'inline-flex',
            alignItems: 'center',
            textDecoration: 'none'
          }}
        >
          {product.category || 'Catalog'}
        </Link>

        <ChevronRight size={13} color="var(--text-muted)" style={{ flexShrink: 0 }} />

        <span
          style={{
            color: 'var(--gold-primary)',
            fontWeight: 600
          }}
          aria-current="page"
        >
          {product.name}
        </span>
      </nav>

      {/* Main PDP Grid */}
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(min(100%, 300px), 1fr))',
          gap: 'clamp(24px, 4vw, 48px)',
          alignItems: 'start'
        }}
      >
        {/* Left Column: Image Carousel */}
        <div>
          <JerseyCarousel images={product.images} name={product.name} />
        </div>

        {/* Right Column: Kit Information & Purchase Options */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
          {/* Category & Quality Badges */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px', flexWrap: 'wrap' }}>
            <span
              style={{
                fontSize: '11px',
                fontWeight: 800,
                textTransform: 'uppercase',
                letterSpacing: '0.08em',
                padding: '4px 10px',
                borderRadius: '999px',
                backgroundColor: 'rgba(200, 169, 106, 0.15)',
                color: 'var(--gold-primary)',
                border: '1px solid var(--gold-primary)'
              }}
            >
              {product.category}
            </span>
            <span
              style={{
                fontSize: '12px',
                fontWeight: 700,
                padding: '4px 10px',
                borderRadius: '999px',
                backgroundColor: 'var(--bg-elevated)',
                color: 'var(--text-primary)',
                border: '1px solid var(--border-subtle)',
                display: 'inline-flex',
                alignItems: 'center',
                gap: '5px'
              }}
            >
              <Award size={13} color="var(--gold-primary)" />
              <span>{product.subCategory}</span>
            </span>
            <span style={{ fontSize: '12px', color: 'var(--status-instock)', fontWeight: 700 }}>
              ● {product.stockStatus || 'In Stock'}
            </span>
          </div>

          {/* Title */}
          <h1
            className="serif-heading"
            style={{
              fontSize: 'clamp(24px, 3vw, 36px)',
              fontWeight: 800,
              color: 'var(--text-primary)',
              lineHeight: 1.2
            }}
          >
            {product.name}
          </h1>

          {/* Team / Season */}
          <div style={{ fontSize: '14px', color: 'var(--text-secondary)', fontWeight: 600 }}>
            {product.team} • {product.season} Edition
          </div>

          {/* Price & Discount */}
          <div style={{ display: 'flex', alignItems: 'baseline', gap: '12px' }}>
            <span style={{ fontSize: '32px', fontWeight: 800, color: 'var(--gold-primary)' }}>
              ₹{product.price}
            </span>
            {product.mrp && product.mrp > product.price && (
              <>
                <span style={{ fontSize: '18px', color: 'var(--text-muted)', textDecoration: 'line-through' }}>
                  ₹{product.mrp}
                </span>
                <span style={{ fontSize: '13px', fontWeight: 800, color: '#ef4444' }}>
                  ({discountPercent}% OFF)
                </span>
              </>
            )}
          </div>

          {/* Shipping highlight */}
          <div
            style={{
              padding: '12px 16px',
              backgroundColor: 'var(--bg-surface)',
              border: '1px solid var(--border-subtle)',
              borderRadius: '12px',
              fontSize: '12px',
              color: 'var(--text-secondary)',
              display: 'flex',
              alignItems: 'center',
              gap: '12px'
            }}
          >
            <Truck size={18} color="var(--gold-primary)" style={{ flexShrink: 0 }} />
            <div>
              <strong>Pan-India Shipping:</strong> ₹80 (Free on orders above ₹1,499). Metro delivery in 3–5 days from Chennai.
            </div>
          </div>

          {/* Size Selector */}
          <div>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
              <span style={{ fontSize: '13px', fontWeight: 700, color: 'var(--text-primary)' }}>
                Select Size:
              </span>
              <button
                type="button"
                onClick={() => setShowSizeModal(true)}
                style={{
                  background: 'none',
                  border: 'none',
                  color: 'var(--gold-primary)',
                  fontSize: '12px',
                  fontWeight: 700,
                  cursor: 'pointer',
                  textDecoration: 'underline',
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '4px'
                }}
              >
                <Ruler size={13} />
                <span>View Size Guide</span>
              </button>
            </div>

            <div style={{ display: 'flex', gap: '10px' }}>
              {(product.sizes || ['S', 'M', 'L', 'XL']).map((sz) => (
                <button
                  key={sz}
                  type="button"
                  onClick={() => setSelectedSize(sz)}
                  style={{
                    width: '48px',
                    height: '44px',
                    borderRadius: '10px',
                    fontSize: '13px',
                    fontWeight: 800,
                    cursor: 'pointer',
                    backgroundColor: selectedSize === sz ? 'var(--gold-primary)' : 'var(--bg-surface)',
                    color: selectedSize === sz ? '#0d140f' : 'var(--text-primary)',
                    border: `1px solid ${selectedSize === sz ? 'var(--gold-primary)' : 'var(--border-subtle)'}`,
                    transition: 'all 0.15s'
                  }}
                >
                  {sz}
                </button>
              ))}
            </div>
          </div>

          {/* Quantity Selector */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '14px' }}>
            <span style={{ fontSize: '13px', fontWeight: 700, color: 'var(--text-primary)' }}>
              Quantity:
            </span>
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px', backgroundColor: 'var(--bg-surface)', padding: '4px 12px', borderRadius: '10px', border: '1px solid var(--border-subtle)' }}>
              <button
                onClick={() => setQuantity((q) => Math.max(1, q - 1))}
                style={{ background: 'none', border: 'none', color: 'var(--gold-primary)', fontSize: '16px', fontWeight: 800, cursor: 'pointer' }}
              >
                -
              </button>
              <span style={{ fontSize: '14px', fontWeight: 800, minWidth: '20px', textAlign: 'center' }}>
                {quantity}
              </span>
              <button
                onClick={() => setQuantity((q) => q + 1)}
                style={{ background: 'none', border: 'none', color: 'var(--gold-primary)', fontSize: '16px', fontWeight: 800, cursor: 'pointer' }}
              >
                +
              </button>
            </div>
          </div>

          {/* Action Buttons */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '12px', marginTop: '10px' }}>
            <button
              type="button"
              onClick={() => addToCart(product, selectedSize, quantity)}
              style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '8px',
                padding: '16px',
                borderRadius: '12px',
                backgroundColor: 'var(--gold-primary)',
                color: '#0d140f',
                border: 'none',
                fontSize: '15px',
                fontWeight: 800,
                letterSpacing: '0.04em',
                textTransform: 'uppercase',
                cursor: 'pointer',
                boxShadow: '0 6px 20px rgba(200, 169, 106, 0.25)',
                transition: 'all 0.15s'
              }}
            >
              <ShoppingBag size={18} />
              <span>Add To Cart</span>
            </button>

            <a
              href={directWhatsAppUrl}
              onClick={(e) => triggerWhatsApp({ text: directWhatsAppText, e })}
              target="_blank"
              rel="noopener noreferrer"
              style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '8px',
                padding: '15px',
                borderRadius: '12px',
                backgroundColor: '#22c55e',
                color: '#0d140f',
                fontSize: '14px',
                fontWeight: 800,
                textDecoration: 'none',
                boxShadow: '0 6px 20px rgba(34, 197, 94, 0.25)',
                cursor: 'pointer'
              }}
            >
              <MessageCircle size={18} />
              <span>Buy Now with WhatsApp Direct</span>
            </a>
          </div>

          {/* Product Description */}
          <div style={{ borderTop: '1px solid var(--border-subtle)', paddingTop: '20px', marginTop: '10px' }}>
            <h4 style={{ fontSize: '14px', fontWeight: 700, color: 'var(--gold-primary)', marginBottom: '8px' }}>
              Kit Details &amp; Heritage
            </h4>
            <p style={{ fontSize: '13px', lineHeight: 1.65, color: 'var(--text-secondary)' }}>
              {product.description ||
                'High-grade reproduction featuring true-to-era badges, club crests, and breathable lightweight fabric. Built for matchday style and comfort.'}
            </p>
          </div>

          {/* Sizing & Care Specs */}
          <div style={{ backgroundColor: 'var(--bg-surface)', padding: '16px', borderRadius: '12px', border: '1px solid var(--border-subtle)', fontSize: '12px' }}>
            <div style={{ fontWeight: 700, color: 'var(--text-primary)', marginBottom: '6px' }}>
              ⚡ Care &amp; Longevity:
            </div>
            <ul style={{ paddingLeft: '18px', color: 'var(--text-secondary)', display: 'flex', flexDirection: 'column', gap: '4px' }}>
              <li>Machine wash cold inside-out (30°C max) to protect badges.</li>
              <li>Do not iron directly over printed numbers or heat-sealed crests.</li>
              <li>Dry in shade; do not tumble dry.</li>
            </ul>
          </div>
        </div>
      </div>

      {/* Size Guide Modal */}
      {showSizeModal && (
        <div
          style={{
            position: 'fixed',
            inset: 0,
            backgroundColor: 'rgba(0,0,0,0.8)',
            backdropFilter: 'blur(6px)',
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
              borderRadius: '20px',
              maxWidth: '560px',
              width: '100%',
              padding: '28px',
              position: 'relative'
            }}
          >
            <button
              onClick={() => setShowSizeModal(false)}
              style={{
                position: 'absolute',
                top: '16px',
                right: '16px',
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
            <h3 className="serif-heading" style={{ fontSize: '20px', color: 'var(--gold-primary)', marginBottom: '6px' }}>
              Size &amp; Fit Guide
            </h3>
            <p style={{ fontSize: '13px', color: 'var(--text-secondary)', marginBottom: '20px' }}>
              Standard measurements in inches. If you prefer a relaxed fit for Player Version kits, consider ordering one size up.
            </p>

            <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '13px', textAlign: 'center' }}>
              <thead>
                <tr style={{ background: 'var(--bg-elevated)', color: 'var(--gold-primary)' }}>
                  <th style={{ padding: '10px' }}>Size</th>
                  <th style={{ padding: '10px' }}>Chest (Inches)</th>
                  <th style={{ padding: '10px' }}>Length (Inches)</th>
                </tr>
              </thead>
              <tbody>
                <tr style={{ borderBottom: '1px solid var(--border-subtle)' }}>
                  <td style={{ padding: '10px', fontWeight: 700 }}>S</td>
                  <td style={{ padding: '10px' }}>37 – 39"</td>
                  <td style={{ padding: '10px' }}>27.5"</td>
                </tr>
                <tr style={{ borderBottom: '1px solid var(--border-subtle)' }}>
                  <td style={{ padding: '10px', fontWeight: 700 }}>M</td>
                  <td style={{ padding: '10px' }}>39 – 41"</td>
                  <td style={{ padding: '10px' }}>28.5"</td>
                </tr>
                <tr style={{ borderBottom: '1px solid var(--border-subtle)' }}>
                  <td style={{ padding: '10px', fontWeight: 700 }}>L</td>
                  <td style={{ padding: '10px' }}>41 – 43"</td>
                  <td style={{ padding: '10px' }}>29.5"</td>
                </tr>
                <tr style={{ borderBottom: '1px solid var(--border-subtle)' }}>
                  <td style={{ padding: '10px', fontWeight: 700 }}>XL</td>
                  <td style={{ padding: '10px' }}>43 – 45"</td>
                  <td style={{ padding: '10px' }}>30.5"</td>
                </tr>
                <tr>
                  <td style={{ padding: '10px', fontWeight: 700 }}>XXL</td>
                  <td style={{ padding: '10px' }}>45 – 47"</td>
                  <td style={{ padding: '10px' }}>31.5"</td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Related Kits */}
      {relatedKits.length > 0 && (
        <div style={{ marginTop: '80px', borderTop: '1px solid var(--border-subtle)', paddingTop: '40px' }}>
          <h3 className="serif-heading" style={{ fontSize: '24px', fontWeight: 800, color: 'var(--text-primary)', marginBottom: '24px' }}>
            More {product.category} Kits
          </h3>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '24px' }}>
            {relatedKits.map((k) => (
              <ProductCard key={k.id} product={k} />
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
