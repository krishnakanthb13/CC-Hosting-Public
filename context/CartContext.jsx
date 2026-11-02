'use client';

import { createContext, useContext, useState, useEffect } from 'react';
import { fetchStoreConfig, numOr } from '../lib/storeConfig';

const CartContext = createContext();

const CART_STORAGE_KEY = 'crown_and_cross_cart_v1';
const CUSTOMER_STORAGE_KEY = 'crown_and_cross_customer_v1';
const APP_SIGNATURE = 'crown_and_cross_storefront';

// Fallbacks while products.json brand settings are still loading (or if the
// fetch fails). Once storeConfig arrives, brand.shipping takes over.
const DEFAULT_SHIPPING_FEE = 80;
const DEFAULT_FREE_SHIPPING_THRESHOLD = 1499;

const DEFAULT_CUSTOMER = {
  name: '',
  phone: '',
  address: '',
  city: '',
  pincode: '',
  note: ''
};

/**
 * Validates and sanitizes individual cart items to guarantee unique, valid parameters
 */
function sanitizeCartItems(rawItems) {
  if (!Array.isArray(rawItems)) return [];
  return rawItems
    .filter((item) => {
      return (
        item &&
        typeof item === 'object' &&
        typeof item.id === 'string' &&
        item.id.trim() !== '' &&
        typeof item.name === 'string' &&
        typeof item.price === 'number' &&
        item.price >= 0 &&
        typeof item.quantity === 'number' &&
        item.quantity > 0
      );
    })
    .map((item) => ({
      ...item,
      // Guarantee deterministic, strictly unique composite key
      key: `${item.id}_${item.size || 'M'}_${item.subCategory || 'std'}`
    }));
}

/**
 * Loads stored data verifying that it belongs strictly to this app and origin
 */
function loadScopedStorage(key, legacyKey) {
  if (typeof window === 'undefined') return null;
  try {
    const raw = localStorage.getItem(key) || (legacyKey ? localStorage.getItem(legacyKey) : null);
    if (!raw) return null;
    const parsed = JSON.parse(raw);

    // If wrapped in our origin-isolated security envelope:
    if (parsed && typeof parsed === 'object' && parsed.__app) {
      // Reject if originating from a different app signature or foreign webpage origin
      if (parsed.__app !== APP_SIGNATURE) {
        return null;
      }
      if (parsed.__origin && parsed.__origin !== window.location.origin) {
        return null;
      }
      return parsed.data;
    }

    // Legacy un-enveloped fallback
    return parsed;
  } catch (err) {
    return null;
  }
}

/**
 * Saves data wrapped with an origin and app signature so other webpages cannot use it
 */
function saveScopedStorage(key, data) {
  if (typeof window === 'undefined') return;
  try {
    const envelope = {
      __app: APP_SIGNATURE,
      __origin: window.location.origin,
      __version: 1,
      savedAt: Date.now(),
      data
    };
    localStorage.setItem(key, JSON.stringify(envelope));
  } catch (err) {}
}

/**
 * Re-validates cart items against the live catalog:
 *  - drops items whose selected size is now sold out
 *  - caps quantities to current per-size stock
 *  - refreshes price and the stockBySize snapshot
 *  - keeps items whose product left the catalog (cannot validate remotely)
 * Returns { items, message } where message is a human-readable summary of
 * adjustments (or null when nothing changed).
 */
function revalidateItems(rawItems, products) {
  if (!Array.isArray(rawItems) || rawItems.length === 0 || !Array.isArray(products)) {
    return { items: rawItems, message: null };
  }
  const byId = new Map();
  products.forEach((p) => {
    if (p && p.id) byId.set(p.id, p);
  });

  let removedCount = 0;
  let cappedCount = 0;
  let repricedCount = 0;
  const next = [];

  for (const item of rawItems) {
    const fresh = byId.get(item.id);
    if (!fresh) {
      next.push(item);
      continue;
    }

    const sizeStock =
      fresh.stockBySize && fresh.stockBySize[item.size] !== undefined
        ? Number(fresh.stockBySize[item.size])
        : fresh.inStock !== false
          ? 99
          : 0;

    if (sizeStock <= 0) {
      removedCount += 1;
      continue;
    }

    let quantity = item.quantity;
    if (quantity > sizeStock) {
      quantity = sizeStock;
      cappedCount += 1;
    }

    let price = item.price;
    const freshPrice = Number(fresh.price);
    if (Number.isFinite(freshPrice) && freshPrice !== price) {
      price = freshPrice;
      repricedCount += 1;
    }

    next.push({ ...item, quantity, price, stockBySize: fresh.stockBySize || item.stockBySize });
  }

  let message = null;
  if (removedCount + cappedCount + repricedCount > 0) {
    const parts = [];
    if (removedCount > 0) parts.push(`${removedCount} removed (sold out)`);
    if (cappedCount > 0) parts.push(`${cappedCount} capped to available stock`);
    if (repricedCount > 0) parts.push(`${repricedCount} repriced to current catalog`);
    message = `Cart synced with live inventory: ${parts.join(', ')}.`;
  }

  return { items: next, message };
}

export function CartProvider({ children }) {
  const [items, setItems] = useState([]);
  const [customer, setCustomer] = useState(DEFAULT_CUSTOMER);
  const [isCartOpen, setIsCartOpen] = useState(false);
  const [activeUpiOrder, setActiveUpiOrder] = useState(null);
  const [isLoaded, setIsLoaded] = useState(false);
  const [stockToast, setStockToast] = useState(null);
  const [storeConfig, setStoreConfig] = useState(null);

  const showStockToast = (message) => {
    const id = Date.now();
    setStockToast({ message, id });
  };

  const dismissStockToast = () => {
    setStockToast(null);
  };

  // Auto-dismiss stock toast after 3.8 seconds
  useEffect(() => {
    if (!stockToast) return;
    const timer = setTimeout(() => {
      setStockToast(null);
    }, 3800);
    return () => clearTimeout(timer);
  }, [stockToast]);

  // Load cart and customer from scoped storage on mount
  useEffect(() => {
    try {
      const savedCart = loadScopedStorage(CART_STORAGE_KEY, 'cc_cart');
      if (savedCart) {
        const sanitized = sanitizeCartItems(savedCart);
        if (sanitized.length > 0) {
          setItems(sanitized);
        }
      }

      const savedCustomer = loadScopedStorage(CUSTOMER_STORAGE_KEY, 'cc_customer');
      if (savedCustomer && typeof savedCustomer === 'object') {
        setCustomer((prev) => ({ ...prev, ...savedCustomer }));
      }
    } catch (e) {
      console.error('Failed to load scoped cart data', e);
    } finally {
      setIsLoaded(true);
    }
  }, []);

  // Sync cart items to scoped storage only after initial load completes
  useEffect(() => {
    if (!isLoaded) return;
    saveScopedStorage(CART_STORAGE_KEY, items);
  }, [items, isLoaded]);

  // Sync customer to scoped storage only after initial load completes
  useEffect(() => {
    if (!isLoaded) return;
    saveScopedStorage(CUSTOMER_STORAGE_KEY, customer);
  }, [customer, isLoaded]);

  // Load store config once, then re-validate the cart against live inventory
  useEffect(() => {
    let mounted = true;
    fetchStoreConfig().then((config) => {
      if (!mounted) return;
      setStoreConfig(config);
      if (config && Array.isArray(config.products)) {
        let summary = null;
        setItems((prev) => {
          const result = revalidateItems(prev, config.products);
          summary = result.message;
          return result.items;
        });
        if (summary) showStockToast(summary);
      }
    });
    return () => {
      mounted = false;
    };
  }, []);

  // Cross-tab sync: storage events fire in OTHER tabs only, so this can never
  // loop (the writing tab does not receive its own event). Content guard prevents
  // redundant writes when another tab's data is identical.
  useEffect(() => {
    if (!isLoaded || typeof window === 'undefined') return;

    const onStorage = (e) => {
      try {
        if (e.key === CART_STORAGE_KEY && e.newValue) {
          const parsed = JSON.parse(e.newValue);
          const data = parsed && parsed.__app === APP_SIGNATURE ? parsed.data : parsed;
          const sanitized = sanitizeCartItems(data);
          setItems((prev) => {
            const same =
              prev.length === sanitized.length &&
              prev.every(
                (it, i) =>
                  sanitized[i] &&
                  it.key === sanitized[i].key &&
                  it.quantity === sanitized[i].quantity &&
                  it.price === sanitized[i].price
              );
            return same ? prev : sanitized;
          });
        } else if (e.key === CUSTOMER_STORAGE_KEY && e.newValue) {
          const parsed = JSON.parse(e.newValue);
          const data = parsed && parsed.__app === APP_SIGNATURE ? parsed.data : parsed;
          if (data && typeof data === 'object') {
            setCustomer((prev) => ({ ...prev, ...data }));
          }
        }
      } catch (err) {
        // Ignore malformed foreign storage events
      }
    };

    window.addEventListener('storage', onStorage);
    return () => window.removeEventListener('storage', onStorage);
  }, [isLoaded]);

  const addToCart = (product, size = 'M', quantity = 1) => {
    const itemKey = `${product.id}_${size}_${product.subCategory || 'std'}`;
    const maxStock = product.stockBySize?.[size] !== undefined
      ? Number(product.stockBySize[size])
      : (product.inStock !== false ? 99 : 0);

    const existing = items.find((i) => i.key === itemKey);
    const currentQty = existing ? existing.quantity : 0;

    if (maxStock <= 0) {
      showStockToast(`Size ${size} is currently sold out.`);
      return false;
    }

    if (currentQty >= maxStock) {
      showStockToast(`Limited Stock: You already have all ${maxStock} available units of Size ${size} in your cart!`);
      return false;
    }

    const requestedTotal = currentQty + quantity;
    const allowedQty = Math.min(requestedTotal, maxStock);
    const addedUnits = allowedQty - currentQty;

    setItems((prev) => {
      if (existing) {
        return prev.map((i) =>
          i.key === itemKey
            ? { ...i, quantity: allowedQty, stockBySize: product.stockBySize || i.stockBySize }
            : i
        );
      }
      return [
        ...prev,
        {
          key: itemKey,
          id: product.id,
          name: product.name,
          team: product.team,
          price: product.price,
          mrp: product.mrp,
          image: product.images?.[0] || '',
          category: product.category,
          subCategory: product.subCategory,
          size,
          quantity: allowedQty,
          stockBySize: product.stockBySize
        }
      ];
    });

    if (requestedTotal > maxStock) {
      showStockToast(`Limited Stock: Capped to remaining ${addedUnits} unit${addedUnits > 1 ? 's' : ''} (Max ${maxStock} available for Size ${size}).`);
    }

    setIsCartOpen(true);
    return true;
  };

  const updateQuantity = (key, delta) => {
    setItems((prev) =>
      prev
        .map((i) => {
          if (i.key !== key) return i;

          // Prefer live catalog stock for this product/size; fall back to the
          // cart's own snapshot, then to a generous 99 cap.
          let maxStock = 99;
          const fresh =
            storeConfig && Array.isArray(storeConfig.products)
              ? storeConfig.products.find((p) => p.id === i.id)
              : null;
          if (fresh) {
            maxStock =
              fresh.stockBySize && fresh.stockBySize[i.size] !== undefined
                ? Number(fresh.stockBySize[i.size])
                : fresh.inStock !== false
                  ? 99
                  : 0;
          } else if (i.stockBySize && i.stockBySize[i.size] !== undefined) {
            maxStock = Number(i.stockBySize[i.size]);
          }

          if (delta > 0 && i.quantity >= maxStock) {
            showStockToast(`Limited Stock: Only ${maxStock} unit${maxStock > 1 ? 's' : ''} available for Size ${i.size}.`);
            return i;
          }

          const nextQty = i.quantity + delta;
          return nextQty > 0 ? { ...i, quantity: Math.min(nextQty, maxStock) } : null;
        })
        .filter(Boolean)
    );
  };

  const removeItem = (key) => {
    setItems((prev) => prev.filter((i) => i.key !== key));
  };

  const clearCart = () => {
    setItems([]);
  };

  // Computations — shipping economics derive from products.json brand config
  // (admin-editable) with safe fallbacks while loading.
  const brandShipping = (storeConfig && storeConfig.brand && storeConfig.brand.shipping) || {};
  const shippingFee = numOr(brandShipping.standardFee, DEFAULT_SHIPPING_FEE);
  const freeShippingThreshold = numOr(brandShipping.freeShippingThreshold, DEFAULT_FREE_SHIPPING_THRESHOLD);

  const subtotal = items.reduce((acc, i) => acc + i.price * i.quantity, 0);
  const totalItems = items.reduce((acc, i) => acc + i.quantity, 0);
  const isFreeShipping = subtotal >= freeShippingThreshold;
  const shipping = items.length === 0 ? 0 : isFreeShipping ? 0 : shippingFee;
  const grandTotal = subtotal + shipping;
  const amountToFreeShipping = Math.max(0, freeShippingThreshold - subtotal);
  const freeShippingProgress = Math.min(100, Math.round((subtotal / freeShippingThreshold) * 100));

  return (
    <CartContext.Provider
      value={{
        items,
        addToCart,
        updateQuantity,
        removeItem,
        clearCart,
        subtotal,
        shipping,
        grandTotal,
        totalItems,
        isFreeShipping,
        amountToFreeShipping,
        freeShippingProgress,
        isCartOpen,
        setIsCartOpen,
        activeUpiOrder,
        setActiveUpiOrder,
        customer,
        setCustomer,
        isLoaded,
        stockToast,
        showStockToast,
        dismissStockToast
      }}
    >
      {children}
    </CartContext.Provider>
  );
}

export function useCart() {
  return useContext(CartContext);
}
