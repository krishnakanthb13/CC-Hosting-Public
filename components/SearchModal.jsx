'use client';

import { useState, useEffect, useRef } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { Search, X, ArrowRight, Sparkles, Tag, CheckCircle2 } from 'lucide-react';

export default function SearchModal({ isOpen, onClose }) {
  const router = useRouter();
  const [query, setQuery] = useState('');
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeCategory, setActiveCategory] = useState('All');
  const inputRef = useRef(null);

  // Load product catalog once
  useEffect(() => {
    if (isOpen && products.length === 0) {
      setLoading(true);
      fetch('/data/products.json')
        .then((res) => res.json())
        .then((data) => {
          if (data && data.products) {
            setProducts(data.products);
          }
        })
        .catch((err) => console.error('Failed to load products for search:', err))
        .finally(() => setLoading(false));
    }
  }, [isOpen, products.length]);

  // Autofocus input when modal opens
  useEffect(() => {
    if (isOpen) {
      setTimeout(() => {
        if (inputRef.current) inputRef.current.focus();
      }, 100);
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
      setQuery('');
    }
    return () => {
      document.body.style.overflow = '';
    };
  }, [isOpen]);

  // Handle ESC key to close
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === 'Escape' && isOpen) {
        onClose();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  const trimmedQuery = query.trim().toLowerCase();

  const filteredProducts = products.filter((p) => {
    // Category filter
    if (activeCategory !== 'All' && p.category?.toLowerCase() !== activeCategory.toLowerCase()) {
      return false;
    }

    // Text search matching product name, team, season, subCategory, description
    if (!trimmedQuery) return true;

    return (
      p.name?.toLowerCase().includes(trimmedQuery) ||
      p.team?.toLowerCase().includes(trimmedQuery) ||
      p.season?.toLowerCase().includes(trimmedQuery) ||
      p.category?.toLowerCase().includes(trimmedQuery) ||
      p.subCategory?.toLowerCase().includes(trimmedQuery) ||
      p.description?.toLowerCase().includes(trimmedQuery)
    );
  });

  const handleSelectProduct = (product) => {
    onClose();
    router.push(`/product/${product.id}`);
  };

  const quickPills = ['All', 'Real Madrid', 'Argentina', 'Player Version', 'Retro', 'Country'];

  return (
    <div
      className="search-modal-backdrop"
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
      role="dialog"
      aria-modal="true"
      aria-label="Search products"
    >
      <div className="search-modal-card">
        {/* Header with Search Input */}
        <div className="search-modal-header">
          <div className="search-modal-input-wrap">
            <Search size={20} className="search-modal-icon" />
            <input
              ref={inputRef}
              type="text"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Search jerseys by name, club, country (e.g. Real Madrid, Bellingham, Retro)..."
              className="search-modal-input"
              aria-label="Search available products"
            />
            {query && (
              <button
                type="button"
                onClick={() => setQuery('')}
                className="search-modal-clear-btn"
                aria-label="Clear search query"
              >
                <X size={16} />
              </button>
            )}
          </div>
          <button
            type="button"
            onClick={onClose}
            className="search-modal-close-btn"
            aria-label="Close search"
          >
            <X size={20} />
          </button>
        </div>

        {/* Quick Suggestion Pills */}
        <div className="search-modal-pills">
          <span className="search-pills-label">Quick filter:</span>
          {quickPills.map((pill) => {
            const isActive =
              pill === 'All'
                ? query === '' && activeCategory === 'All'
                : query.toLowerCase() === pill.toLowerCase() ||
                  activeCategory.toLowerCase() === pill.toLowerCase();
            return (
              <button
                key={pill}
                type="button"
                className={`search-pill-btn ${isActive ? 'active' : ''}`}
                onClick={() => {
                  if (pill === 'All') {
                    setQuery('');
                    setActiveCategory('All');
                  } else if (pill === 'Retro' || pill === 'Country') {
                    setActiveCategory(pill);
                    setQuery('');
                  } else {
                    setQuery(pill);
                    setActiveCategory('All');
                  }
                }}
              >
                {pill}
              </button>
            );
          })}
        </div>

        {/* Search Results Area */}
        <div className="search-modal-results">
          {loading ? (
            <div className="search-modal-loading">
              <span>Loading available kits...</span>
            </div>
          ) : filteredProducts.length > 0 ? (
            <div>
              <div className="search-results-heading">
                <span>
                  {trimmedQuery ? `Matches for "${query}"` : 'Available Products in Stock'}
                </span>
                <span className="search-count-badge">
                  {filteredProducts.length} {filteredProducts.length === 1 ? 'kit' : 'kits'} available
                </span>
              </div>

              <div className="search-products-list">
                {filteredProducts.map((p) => {
                  const hasDiscount = p.mrp && p.mrp > p.price;
                  const discountPct = hasDiscount
                    ? Math.round(((p.mrp - p.price) / p.mrp) * 100)
                    : null;

                  return (
                    <div
                      key={p.id}
                      onClick={() => handleSelectProduct(p)}
                      className="search-product-row"
                      role="button"
                      tabIndex={0}
                      onKeyDown={(e) => {
                        if (e.key === 'Enter') handleSelectProduct(p);
                      }}
                    >
                      {/* Product Thumbnail */}
                      <div className="search-product-thumb-box">
                        <img
                          src={p.images?.[0] || '/images/logo.jpeg'}
                          alt={p.name}
                          className="search-product-thumb"
                          loading="lazy"
                        />
                      </div>

                      {/* Product Details */}
                      <div className="search-product-info">
                        <div className="search-product-name-row">
                          <h4 className="search-product-name">{p.name}</h4>
                          {p.inStock && (
                            <span className="search-stock-tag">
                              <CheckCircle2 size={11} /> In Stock
                            </span>
                          )}
                        </div>

                        <div className="search-product-meta">
                          {p.team && <span className="search-meta-badge team">{p.team}</span>}
                          {p.season && <span className="search-meta-badge">{p.season}</span>}
                          {p.subCategory && (
                            <span className="search-meta-badge quality">{p.subCategory}</span>
                          )}
                          {p.category && (
                            <span className="search-meta-badge cat">{p.category}</span>
                          )}
                        </div>
                      </div>

                      {/* Price & Action */}
                      <div className="search-product-action">
                        <div className="search-price-box">
                          <span className="search-price">₹{p.price}</span>
                          {hasDiscount && (
                            <span className="search-mrp">₹{p.mrp}</span>
                          )}
                        </div>
                        <span className="search-drilldown-arrow" title="View product details">
                          <ArrowRight size={16} />
                        </span>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          ) : (
            <div className="search-empty-state">
              <Search size={40} className="search-empty-icon" />
              <h4 className="search-empty-title">No matching jerseys found</h4>
              <p className="search-empty-sub">
                No kits match "{query}". Try checking the spelling, or search by team name like
                "Real Madrid", "Argentina", or quality like "Player Version".
              </p>
              <button
                type="button"
                onClick={() => {
                  setQuery('');
                  setActiveCategory('All');
                }}
                className="search-reset-btn"
              >
                Show All Available Products
              </button>
            </div>
          )}
        </div>

        {/* Footer Hint */}
        <div className="search-modal-footer">
          <span className="search-hint-text">
            💡 Press <kbd>ESC</kbd> to exit • Tap any kit to view sizes &amp; order via WhatsApp / UPI
          </span>
          <Link
            href="/#catalog"
            onClick={() => onClose()}
            className="search-view-catalog-link"
          >
            <span>Browse Full Catalog</span>
            <ArrowRight size={13} />
          </Link>
        </div>
      </div>
    </div>
  );
}
