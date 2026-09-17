'use client';

import Link from 'next/link';
import { useCart } from '../context/CartContext';
import { Plus, Sparkles } from 'lucide-react';

export default function ProductCard({ product }) {
  const { items, addToCart, showStockToast } = useCart();
  const discountPercent =
    product.mrp && product.mrp > product.price
      ? Math.round(((product.mrp - product.price) / product.mrp) * 100)
      : null;

  const totalStock = product.stockBySize
    ? Object.values(product.stockBySize).reduce((a, b) => a + Number(b || 0), 0)
    : (product.inStock ? 10 : 0);
  const isCardOutOfStock = totalStock <= 0;

  const availableSize = (product.sizes || ['S', 'M', 'L', 'XL']).find((sz) => {
    const szStock = product.stockBySize?.[sz] !== undefined
      ? Number(product.stockBySize[sz])
      : (product.inStock !== false ? 10 : 0);
    const cartItem = items?.find((i) => i.id === product.id && i.size === sz);
    const inCart = cartItem ? cartItem.quantity : 0;
    return szStock > inCart;
  });

  const isCardAllInCart = !isCardOutOfStock && !availableSize;

  return (
    <div
      style={{
        backgroundColor: 'var(--bg-card)',
        border: '1px solid var(--border-subtle)',
        borderRadius: '18px',
        overflow: 'hidden',
        display: 'flex',
        flexDirection: 'column',
        transition: 'transform 0.2s, border-color 0.2s, box-shadow 0.2s',
        position: 'relative'
      }}
      className="product-card"
    >
      {/* Discount Badge */}
      {discountPercent && (
        <span
          className="card-discount-badge"
          style={{
            position: 'absolute',
            top: '12px',
            left: '12px',
            backgroundColor: '#ef4444',
            color: '#fff',
            fontSize: '11.5px',
            fontWeight: 800,
            padding: '4px 9px',
            borderRadius: '999px',
            zIndex: 2,
            letterSpacing: '0.04em'
          }}
        >
          {discountPercent}% OFF
        </span>
      )}

      {/* Retro/Featured Star */}
      {product.featured && (
        <span
          className="card-featured-badge"
          style={{
            position: 'absolute',
            top: '12px',
            right: '12px',
            backgroundColor: 'rgba(13, 20, 15, 0.9)',
            border: '1px solid var(--gold-primary)',
            color: 'var(--gold-primary)',
            fontSize: '11.5px',
            fontWeight: 800,
            padding: '4px 9px',
            borderRadius: '999px',
            zIndex: 2,
            display: 'inline-flex',
            alignItems: 'center',
            gap: '4px'
          }}
        >
          <Sparkles size={12} /> FEATURED
        </span>
      )}

      {/* Image Link */}
      <Link
        href={`/product/${product.id}`}
        className="card-img-link"
        style={{
          display: 'block',
          position: 'relative',
          width: '100%',
          aspectRatio: '1 / 1',
          overflow: 'hidden',
          backgroundColor: 'var(--bg-elevated)'
        }}
      >
        <img
          src={product.images?.[0] || 'https://images.unsplash.com/photo-1517466787929-bc90951d0974?auto=format&fit=crop&w=600&q=80'}
          alt={product.name}
          style={{
            width: '100%',
            height: '100%',
            objectFit: 'cover',
            transition: 'transform 0.35s ease'
          }}
          className="card-img"
        />
      </Link>

      {/* Content */}
      <div className="card-content" style={{ padding: '16px', display: 'flex', flexDirection: 'column', flex: 1 }}>
        {/* Category & Sub-Category badge */}
        <div className="card-badge-row" style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '8px', flexWrap: 'wrap' }}>
          <span
            className="card-category-pill"
            style={{
              fontSize: '11.5px',
              fontWeight: 800,
              textTransform: 'uppercase',
              letterSpacing: '0.06em',
              color: 'var(--gold-primary)',
              backgroundColor: 'rgba(200, 169, 106, 0.12)',
              border: '1px solid rgba(200, 169, 106, 0.25)',
              padding: '3px 9px',
              borderRadius: '999px'
            }}
          >
            {product.category}
          </span>
          <span className="card-sub-category" style={{ fontSize: '12.5px', color: 'var(--text-secondary)', fontWeight: 600 }}>
            {product.subCategory}
          </span>
        </div>

        {/* Title */}
        <Link href={`/product/${product.id}`} style={{ textDecoration: 'none' }}>
          <h3
            className="card-title"
            style={{
              fontSize: '14.5px',
              fontWeight: 700,
              color: 'var(--text-primary)',
              lineHeight: 1.35,
              marginBottom: '6px',
              height: '40px',
              overflow: 'hidden',
              display: '-webkit-box',
              WebkitLineClamp: 2,
              WebkitBoxOrient: 'vertical'
            }}
          >
            {product.name}
          </h3>
        </Link>

        {/* Team & Season */}
        <p className="card-team" style={{ fontSize: '13px', color: 'var(--text-secondary)', marginBottom: '14px', fontWeight: 500 }}>
          {product.team} • {product.season}
        </p>

        {/* Price Row & Quick Add */}
        <div className="card-footer" style={{ marginTop: 'auto', display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '10px' }}>
          <div>
            <div style={{ display: 'flex', alignItems: 'baseline', gap: '6px' }}>
              <span className="card-price" style={{ fontSize: '19px', fontWeight: 800, color: 'var(--text-primary)' }}>
                ₹{product.price}
              </span>
              {product.mrp && product.mrp > product.price && (
                <span className="card-mrp" style={{ fontSize: '13px', color: 'var(--text-muted)', textDecoration: 'line-through' }}>
                  ₹{product.mrp}
                </span>
              )}
            </div>
          </div>

          <button
            className="card-add-btn"
            disabled={isCardOutOfStock || isCardAllInCart}
            onClick={() => {
              if (isCardAllInCart) {
                showStockToast?.(`All available stock for "${product.name}" is already in your cart!`);
                return;
              }
              if (availableSize) {
                addToCart(product, availableSize, 1);
              }
            }}
            style={{
              padding: '8px 14px',
              borderRadius: '10px',
              backgroundColor: (isCardOutOfStock || isCardAllInCart) ? 'var(--bg-elevated)' : 'var(--gold-primary)',
              color: (isCardOutOfStock || isCardAllInCart) ? 'var(--text-muted)' : '#0d140f',
              border: (isCardOutOfStock || isCardAllInCart) ? '1px solid var(--border-subtle)' : 'none',
              fontSize: '13px',
              fontWeight: 800,
              cursor: (isCardOutOfStock || isCardAllInCart) ? 'not-allowed' : 'pointer',
              display: 'inline-flex',
              alignItems: 'center',
              gap: '5px',
              whiteSpace: 'nowrap',
              opacity: (isCardOutOfStock || isCardAllInCart) ? 0.7 : 1
            }}
          >
            {!isCardOutOfStock && !isCardAllInCart && <Plus size={14} strokeWidth={3} />}
            <span>
              {isCardOutOfStock ? 'Sold Out' : isCardAllInCart ? 'In Cart' : 'Add'}
            </span>
          </button>
        </div>
      </div>

      <style jsx>{`
        .product-card:hover {
          transform: translateY(-4px);
          border-color: var(--border-active);
          box-shadow: 0 14px 35px rgba(0, 0, 0, 0.45);
        }
        .product-card:hover .card-img {
          transform: scale(1.05);
        }
      `}</style>
    </div>
  );
}
