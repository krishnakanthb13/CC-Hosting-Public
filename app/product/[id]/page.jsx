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
  ChevronRight,
  Zap,
  AlertTriangle,
  AlertCircle
} from 'lucide-react';

export default function ProductDetailPage() {
  const { id } = useParams();
  const { items, addToCart, showStockToast } = useCart();

  const [product, setProduct] = useState(null);
  const [allProducts, setAllProducts] = useState([]);
  const [selectedSize, setSelectedSize] = useState('M');
  const [quantity, setQuantity] = useState(1);
  const [loading, setLoading] = useState(true);
  const [showSizeModal, setShowSizeModal] = useState(false);
  const [shakeWarning, setShakeWarning] = useState(false);

  useEffect(() => {
    window.scrollTo({ top: 0, left: 0, behavior: 'instant' });
    fetch('/data/products.json')
      .then((res) => res.json())
      .then((data) => {
        const list = data.products || [];
        setAllProducts(list);
        const rawId = Array.isArray(id) ? id[0] : id;
        const normalizedId = rawId ? decodeURIComponent(String(rawId)).toLowerCase().trim() : '';
        const match = list.find(
          (p) =>
            (p.id && p.id.toLowerCase() === normalizedId) ||
            (p.slug && p.slug.toLowerCase() === normalizedId)
        );
        if (match) {
          setProduct(match);
          if (match.sizes && match.sizes.length > 0) {
            const firstInStock = match.sizes.find((sz) => (match.stockBySize?.[sz] !== undefined ? match.stockBySize[sz] > 0 : (match.inStock !== false))) || match.sizes[0];
            setSelectedSize(firstInStock);
          }
        }
      })
      .catch((err) => console.error('Error fetching product data:', err))
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

  const relatedKits = (allProducts || [])
    .filter(
      (p) =>
        p &&
        p.id !== product.id &&
        ((product.category && p.category === product.category) ||
          (product.subCategory && p.subCategory === product.subCategory))
    )
    .slice(0, 3);

  const categoryHash = product.category
    ? `/#${product.category.toLowerCase().trim()}`
    : '/#catalog';

  return (
    <div style={{ maxWidth: '1280px', margin: '40px auto 80px', padding: '0 24px' }} className="pdp-container">
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

            {/* Size Selector with Live Stock Badges */}
            <div style={{ display: 'flex', gap: '10px', flexWrap: 'wrap' }}>
              {(product.sizes || ['S', 'M', 'L', 'XL']).map((sz) => {
                const sizeStock = product.stockBySize?.[sz] !== undefined
                  ? Number(product.stockBySize[sz])
                  : (product.inStock ? 10 : 0);
                const isOutOfStock = sizeStock <= 0;
                // Only show "X left" if stock is 2 or less. If more, show clean size letter!
                const isLowStock = sizeStock > 0 && sizeStock <= 2;
                const isSelected = selectedSize === sz;

                return (
                  <button
                    key={sz}
                    type="button"
                    disabled={isOutOfStock}
                    onClick={() => {
                      setSelectedSize(sz);
                      setQuantity(1);
                    }}
                    style={{
                      minWidth: '54px',
                      height: '46px',
                      padding: '4px 10px',
                      borderRadius: '10px',
                      fontSize: '13px',
                      fontWeight: 800,
                      cursor: isOutOfStock ? 'not-allowed' : 'pointer',
                      backgroundColor: isSelected ? 'var(--gold-primary)' : 'var(--bg-surface)',
                      color: isSelected ? '#0d140f' : (isOutOfStock ? 'var(--text-muted)' : 'var(--text-primary)'),
                      border: `1px solid ${isSelected ? 'var(--gold-primary)' : (isOutOfStock ? 'rgba(255,255,255,0.06)' : 'var(--border-subtle)')}`,
                      opacity: isOutOfStock ? 0.45 : 1,
                      display: 'inline-flex',
                      flexDirection: 'column',
                      alignItems: 'center',
                      justifyContent: 'center',
                      position: 'relative',
                      transition: 'all 0.15s ease'
                    }}
                    title={
                      isOutOfStock
                        ? `Size ${sz} is currently Sold Out`
                        : (isLowStock ? `Hurry! Only ${sizeStock} left in Size ${sz}` : `Size ${sz} is In Stock`)
                    }
                  >
                    <span style={{ textDecoration: isOutOfStock ? 'line-through' : 'none' }}>{sz}</span>
                    {isLowStock && (
                      <span style={{ fontSize: '9px', fontWeight: 800, color: isSelected ? '#7c2d12' : '#f59e0b', marginTop: '-2px', textDecoration: 'none' }}>
                        {sizeStock} left
                      </span>
                    )}
                    {isOutOfStock && (
                      <span style={{ fontSize: '8.5px', fontWeight: 700, color: '#ef4444', marginTop: '-2px' }}>
                        Sold out
                      </span>
                    )}
                  </button>
                );
              })}
            </div>

            {/* Dynamic Live Stock Status for Selected Size */}
            <div style={{ marginTop: '10px' }}>
              {(() => {
                const stock = product.stockBySize?.[selectedSize] !== undefined
                  ? Number(product.stockBySize[selectedSize])
                  : (product.inStock ? 10 : 0);

                if (stock <= 0) {
                  return (
                    <span style={{ fontSize: '12.5px', fontWeight: 700, color: '#ef4444', display: 'inline-flex', alignItems: 'center', gap: '6px' }}>
                      <span>✕</span>
                      <span>Size {selectedSize} is currently sold out. Please select an in-stock size above.</span>
                    </span>
                  );
                }
                if (stock <= 2) {
                  return (
                    <span style={{ fontSize: '12.5px', fontWeight: 800, color: '#f59e0b', display: 'inline-flex', alignItems: 'center', gap: '6px' }}>
                      <span>⚡</span>
                      <span>Hurry! Only {stock} left in Size {selectedSize}!</span>
                    </span>
                  );
                }
                return (
                  <span style={{ fontSize: '12.5px', fontWeight: 600, color: '#4ade80', display: 'inline-flex', alignItems: 'center', gap: '6px' }}>
                    <span>●</span>
                    <span>In Stock</span>
                  </span>
                );
              })()}
            </div>
          </div>

          {/* Quantity Selector with Stock Guards */}
          {(() => {
            const currentStock = product.stockBySize?.[selectedSize] !== undefined
              ? Number(product.stockBySize[selectedSize])
              : (product.inStock ? 10 : 0);
            const itemInCart = items?.find(
              (i) => i.id === product.id && i.size === selectedSize && (i.subCategory === product.subCategory || !i.subCategory)
            );
            const inCartQty = itemInCart ? itemInCart.quantity : 0;
            const remainingStock = Math.max(0, currentStock - inCartQty);
            const isOutOfStock = currentStock <= 0;
            const isMaxInCart = currentStock > 0 && inCartQty >= currentStock;
            const isAtStockLimit = quantity >= currentStock || (quantity + inCartQty >= currentStock);

            return (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '14px', flexWrap: 'wrap' }}>
                  <span style={{ fontSize: '13px', fontWeight: 700, color: 'var(--text-primary)' }}>
                    Quantity:
                  </span>
                  <div
                    className={shakeWarning ? 'animate-shake' : ''}
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: '10px',
                      backgroundColor: 'var(--bg-surface)',
                      padding: '4px 12px',
                      borderRadius: '10px',
                      border: `1px solid ${isAtStockLimit ? 'rgba(245, 158, 11, 0.45)' : 'var(--border-subtle)'}`,
                      transition: 'border-color 0.2s ease'
                    }}
                  >
                    <button
                      type="button"
                      onClick={() => setQuantity((q) => Math.max(1, q - 1))}
                      disabled={isOutOfStock || isMaxInCart || quantity <= 1}
                      style={{
                        background: 'none',
                        border: 'none',
                        color: quantity <= 1 || isOutOfStock || isMaxInCart ? 'var(--text-muted)' : 'var(--gold-primary)',
                        fontSize: '16px',
                        fontWeight: 800,
                        cursor: quantity <= 1 || isOutOfStock || isMaxInCart ? 'not-allowed' : 'pointer'
                      }}
                    >
                      -
                    </button>
                    <span style={{ fontSize: '14px', fontWeight: 800, minWidth: '20px', textAlign: 'center' }}>
                      {quantity}
                    </span>
                    <button
                      type="button"
                      onClick={() => {
                        if (quantity >= currentStock) {
                          setShakeWarning(true);
                          setTimeout(() => setShakeWarning(false), 400);
                          showStockToast(`Limited Stock Alert: Only ${currentStock} available in Size ${selectedSize}. Maximum limit reached.`);
                          return;
                        }
                        if (quantity + inCartQty >= currentStock) {
                          setShakeWarning(true);
                          setTimeout(() => setShakeWarning(false), 400);
                          showStockToast(`Limited Stock Alert: You already have ${inCartQty} in cart. Total cannot exceed ${currentStock} units for Size ${selectedSize}.`);
                          return;
                        }
                        setQuantity((q) => Math.min(currentStock, q + 1));
                      }}
                      disabled={isOutOfStock || isMaxInCart || isAtStockLimit}
                      style={{
                        background: 'none',
                        border: 'none',
                        color: (isOutOfStock || isMaxInCart || isAtStockLimit) ? 'var(--text-muted)' : 'var(--gold-primary)',
                        fontSize: '16px',
                        fontWeight: 800,
                        cursor: (isOutOfStock || isMaxInCart || isAtStockLimit) ? 'not-allowed' : 'pointer'
                      }}
                    >
                      +
                    </button>
                  </div>

                  {/* Stock Limit Badge */}
                  {isAtStockLimit && currentStock > 0 && (
                    <span style={{ fontSize: '12px', fontWeight: 700, color: '#f59e0b', display: 'inline-flex', alignItems: 'center', gap: '5px' }}>
                      <AlertTriangle size={14} />
                      <span>Max stock reached</span>
                    </span>
                  )}
                </div>

                {/* In-Cart Count Context Alert */}
                {inCartQty > 0 && currentStock > 0 && (
                  <div style={{
                    fontSize: '11.5px',
                    color: 'var(--text-secondary)',
                    backgroundColor: 'rgba(255,255,255,0.03)',
                    padding: '6px 12px',
                    borderRadius: '8px',
                    border: '1px solid var(--border-subtle)',
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: '6px',
                    width: 'fit-content'
                  }}>
                    <span>🛍️</span>
                    <span>You have <strong>{inCartQty}</strong> in your cart. {remainingStock > 0 ? `(Can add up to ${remainingStock} more)` : `(All ${currentStock} available units are in cart)`}</span>
                  </div>
                )}
              </div>
            );
          })()}

          {/* Action Buttons */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '12px', marginTop: '10px' }}>
            {(() => {
              const currentStock = product.stockBySize?.[selectedSize] !== undefined
                ? Number(product.stockBySize[selectedSize])
                : (product.inStock ? 10 : 0);
              const itemInCart = items?.find(
                (i) => i.id === product.id && i.size === selectedSize && (i.subCategory === product.subCategory || !i.subCategory)
              );
              const inCartQty = itemInCart ? itemInCart.quantity : 0;
              const remainingStock = Math.max(0, currentStock - inCartQty);
              const isSoldOut = currentStock <= 0;
              const isMaxInCart = currentStock > 0 && inCartQty >= currentStock;

              return (
                <>
                  {/* Creative Notification Banner when all units are in cart */}
                  {isMaxInCart && (
                    <div
                      className="animate-fade-in"
                      style={{
                        padding: '12px 14px',
                        borderRadius: '12px',
                        backgroundColor: 'rgba(245, 158, 11, 0.12)',
                        border: '1px solid rgba(245, 158, 11, 0.35)',
                        color: '#f59e0b',
                        fontSize: '13px',
                        fontWeight: 600,
                        display: 'flex',
                        alignItems: 'center',
                        gap: '10px'
                      }}
                    >
                      <Zap size={18} style={{ flexShrink: 0 }} />
                      <span>
                        <strong>Limited Stock Alert:</strong> All {currentStock} available units of Size {selectedSize} are already in your cart!
                      </span>
                    </div>
                  )}

                  <button
                    type="button"
                    disabled={isSoldOut || isMaxInCart}
                    onClick={() => {
                      if (isMaxInCart) {
                        showStockToast(`Limited Stock: All ${currentStock} units of Size ${selectedSize} are already in your cart!`);
                        return;
                      }
                      addToCart(product, selectedSize, Math.min(quantity, remainingStock > 0 ? remainingStock : quantity));
                    }}
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      gap: '8px',
                      padding: '16px',
                      borderRadius: '12px',
                      backgroundColor: (isSoldOut || isMaxInCart) ? 'var(--bg-elevated)' : 'var(--gold-primary)',
                      color: (isSoldOut || isMaxInCart) ? 'var(--text-muted)' : '#0d140f',
                      border: (isSoldOut || isMaxInCart) ? '1px solid var(--border-subtle)' : 'none',
                      fontSize: '15px',
                      fontWeight: 800,
                      letterSpacing: '0.04em',
                      textTransform: 'uppercase',
                      cursor: (isSoldOut || isMaxInCart) ? 'not-allowed' : 'pointer',
                      opacity: (isSoldOut || isMaxInCart) ? 0.65 : 1,
                      boxShadow: (isSoldOut || isMaxInCart) ? 'none' : '0 6px 20px rgba(200, 169, 106, 0.25)',
                      transition: 'all 0.15s'
                    }}
                  >
                    <ShoppingBag size={18} />
                    <span>
                      {isSoldOut
                        ? `Size ${selectedSize} Out of Stock`
                        : isMaxInCart
                        ? `All Stock in Cart (${inCartQty}/${currentStock})`
                        : 'Add To Cart'}
                    </span>
                  </button>

                  <a
                    href={isSoldOut ? undefined : directWhatsAppUrl}
                    onClick={(e) => {
                      if (isSoldOut) {
                        e.preventDefault();
                        triggerWhatsApp({ text: `Hello Crown & Cross, when will "${product.name}" in Size ${selectedSize} be back in stock?`, e });
                      } else {
                        triggerWhatsApp({ text: directWhatsAppText, e });
                      }
                    }}
                    target="_blank"
                    rel="noopener noreferrer"
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      gap: '8px',
                      padding: '15px',
                      borderRadius: '12px',
                      backgroundColor: isSoldOut ? 'var(--bg-elevated)' : '#22c55e',
                      color: isSoldOut ? 'var(--text-primary)' : '#0d140f',
                      border: isSoldOut ? '1px solid var(--border-subtle)' : 'none',
                      fontSize: '14px',
                      fontWeight: 800,
                      textDecoration: 'none',
                      boxShadow: isSoldOut ? 'none' : '0 6px 20px rgba(34, 197, 94, 0.25)',
                      cursor: 'pointer'
                    }}
                  >
                    <MessageCircle size={18} />
                    <span>{isSoldOut ? `Ask for Restock on WhatsApp` : 'Buy Now with WhatsApp Direct'}</span>
                  </a>

                  {/* Mobile Only: 1-Tap UPI App Launcher (Android & iPhone) */}
                  {!isSoldOut && (
                    <a
                      href={`upi://pay?pa=jasonclement.jm-1@okhdfcbank&pn=Jason%20Clement&am=${product.price * quantity}&tn=${encodeURIComponent(`Order ${(product.name || 'Jersey').slice(0, 20)}`)}&cu=INR`}
                      className="mobile-only-pdp-upi-btn"
                      title="Open installed UPI app (GPay, PhonePe, Paytm, CRED, BHIM)"
                    >
                      <Zap size={18} />
                      <span>Pay ₹{product.price * quantity} with UPI App (GPay / PhonePe / Paytm)</span>
                    </a>
                  )}
                </>
              );
            })()}
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
        <div style={{ marginTop: '80px', borderTop: '1px solid var(--border-subtle)', paddingTop: '40px' }} className="pdp-related-section">
          <h3 className="serif-heading" style={{ fontSize: '24px', fontWeight: 800, color: 'var(--text-primary)', marginBottom: '24px' }}>
            More {product.category} Kits
          </h3>
          <div className="related-products-grid">
            {relatedKits.map((k) => (
              <ProductCard key={k.id} product={k} />
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
