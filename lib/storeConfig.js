// CC-Hosting-Public/lib/storeConfig.js
// Single cached client-side source of truth for products.json.
// Every consumer (cart, PDP, home, navbar, footer, search, UPI) shares one
// fetch and falls back to safe defaults while loading or on error.
'use client';

import { useEffect, useState } from 'react';

const FALLBACK_BRAND = {
  name: 'Crown & Cross',
  phone: '+917695924602',
  email: 'crownandcross29@gmail.com',
  location: 'Chennai, Tamil Nadu',
  upiId: 'jasonclement.jm-1@okhdfcbank',
  payeeName: 'Jason Clement',
  shipping: {
    standardFee: 80,
    freeShippingThreshold: 1499,
    metroDeliveryDays: '3-5 Business Days',
    restOfIndiaDeliveryDays: '5-8 Business Days'
  },
  exchange: {
    windowDays: '5-7 Days',
    conditions: 'Tags intact, unworn, unwashed, non-customized'
  }
};

const FALLBACK_CATEGORIES = ['Club', 'Country', 'Retro'];
const FALLBACK_SUB_CATEGORIES = [
  'Player Version',
  'Master Copy',
  'Fan Version Set',
  'Embroidered',
  'Sublimation'
];

function normalizeConfig(data) {
  if (!data || typeof data !== 'object') return null;
  return {
    brand: data.brand && typeof data.brand === 'object' ? data.brand : {},
    categories: Array.isArray(data.categories) ? data.categories : [],
    subCategories: Array.isArray(data.subCategories) ? data.subCategories : [],
    products: Array.isArray(data.products) ? data.products : []
  };
}

let configPromise = null;

export function fetchStoreConfig() {
  if (!configPromise) {
    configPromise = fetch('/data/products.json', { cache: 'no-store' })
      .then((res) => (res.ok ? res.json() : null))
      .then(normalizeConfig)
      .catch(() => null);
  }
  return configPromise;
}

// Returns { config, loaded } — config is null until loaded (or on fetch failure,
// in which case loaded=true and consumers keep using their fallback constants).
export function useStoreConfig() {
  const [state, setState] = useState({ config: null, loaded: false });
  useEffect(() => {
    let mounted = true;
    fetchStoreConfig().then((config) => {
      if (mounted) setState({ config, loaded: true });
    });
    return () => {
      mounted = false;
    };
  }, []);
  return state;
}

export function getBrand(config) {
  return (config && config.brand) || FALLBACK_BRAND;
}

export function getShipping(config) {
  return getBrand(config).shipping || FALLBACK_BRAND.shipping;
}

export function getExchange(config) {
  return getBrand(config).exchange || FALLBACK_BRAND.exchange;
}

function entryNames(list, fallback) {
  const names = (Array.isArray(list) ? list : [])
    .map((entry) => (typeof entry === 'string' ? entry : entry && entry.name))
    .filter((name) => typeof name === 'string' && name.trim() !== '');
  return names.length > 0 ? names : fallback;
}

export function getCategoryNames(config) {
  return entryNames(config && config.categories, FALLBACK_CATEGORIES);
}

export function getSubCategoryNames(config) {
  return entryNames(config && config.subCategories, FALLBACK_SUB_CATEGORIES);
}

export function getUpiConfig(config) {
  const brand = getBrand(config);
  return {
    upiId: typeof brand.upiId === 'string' && brand.upiId.trim() !== '' ? brand.upiId : FALLBACK_BRAND.upiId,
    payeeName:
      typeof brand.payeeName === 'string' && brand.payeeName.trim() !== ''
        ? brand.payeeName
        : FALLBACK_BRAND.payeeName
  };
}

export function getPhone(config) {
  const phone = getBrand(config).phone;
  return typeof phone === 'string' && phone.trim() !== '' ? phone : FALLBACK_BRAND.phone;
}

export function numOr(value, fallback) {
  const n = Number(value);
  return Number.isFinite(n) ? n : fallback;
}
