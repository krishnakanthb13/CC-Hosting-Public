'use client';

import { useState } from 'react';
import { useCart } from '../context/CartContext';
import { getWhatsAppUrl, triggerWhatsApp } from '../lib/whatsapp';
import {
  ShoppingBag,
  X,
  PackageOpen,
  Trash2,
  MapPin,
  ChevronUp,
  ChevronDown,
  MessageCircle,
  QrCode,
  Sparkles,
  Zap
} from 'lucide-react';

export default function CartDrawer() {
  const {
    items,
    isCartOpen,
    setIsCartOpen,
    updateQuantity,
    removeItem,
    clearCart,
    subtotal,
    shipping,
    grandTotal,
    isFreeShipping,
    amountToFreeShipping,
    freeShippingProgress,
    setActiveUpiOrder,
    customer,
    setCustomer,
    showStockToast
  } = useCart();

  const [showAddressForm, setShowAddressForm] = useState(false);

  if (!isCartOpen) return null;

  const createUniqueOrderId = () => {
    const timeToken = Date.now().toString(36).toUpperCase().slice(-5);
    const randToken = Math.floor(1000 + Math.random() * 9000);
    return `CC-${timeToken}-${randToken}`;
  };

  // Build structured WhatsApp order message
  const buildWhatsAppText = () => {
    const orderId = createUniqueOrderId();
    let text = `*NEW CROWN & CROSS ORDER* - #${orderId}\n`;
    text += `-------------------------------------\n`;
    items.forEach((item, index) => {
      text += `${index + 1}. *${item.name}*\n`;
      text += `   - Quality: ${item.subCategory}\n`;
      text += `   - Size: ${item.size} | Qty: ${item.quantity}\n`;
      text += `   - Price: ₹${item.price * item.quantity}\n\n`;
    });
    text += `-------------------------------------\n`;
    text += `Subtotal: ₹${subtotal}\n`;
    text += `Shipping: ${isFreeShipping ? 'FREE (Special Offer)' : `₹${shipping}`}\n`;
    text += `*GRAND TOTAL: ₹${grandTotal}*\n\n`;
    text += `*Customer Details:*\n`;
    text += `Name: ${customer.name || 'Not specified'}\n`;
    text += `Phone: ${customer.phone || 'Not specified'}\n`;
    text += `Address: ${customer.address || 'Pending'}\n`;
    text += `City / Pincode: ${customer.city || ''} ${customer.pincode || ''}\n`;
    if (customer.note) text += `Note: ${customer.note}\n`;
    text += `\nPlease confirm availability and payment verification!`;

    return text;
  };

  const handleOpenUpi = () => {
    const orderId = createUniqueOrderId();
    setActiveUpiOrder({
      orderId,
      amount: grandTotal,
      items,
      customer
    });
    setIsCartOpen(false);
  };

  return (
    <div
      style={{
        position: 'fixed',
        inset: 0,
        backgroundColor: 'rgba(0, 0, 0, 0.75)',
        backdropFilter: 'blur(6px)',
        zIndex: 90,
        display: 'flex',
        justifyContent: 'flex-end'
      }}
      onClick={() => setIsCartOpen(false)}
    >
      <div
        className="animate-slide-in"
        onClick={(e) => e.stopPropagation()}
        style={{
          width: '100%',
          maxWidth: '460px',
          height: '100%',
          backgroundColor: 'var(--bg-surface)',
          borderLeft: '1px solid var(--border-subtle)',
          display: 'flex',
          flexDirection: 'column',
          boxShadow: '-10px 0 35px rgba(0,0,0,0.6)'
        }}
      >
        {/* Drawer Header */}
        <div
          style={{
            padding: '20px 24px',
            borderBottom: '1px solid var(--border-subtle)',
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center'
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <ShoppingBag size={20} color="var(--gold-primary)" />
            <h2 className="serif-heading" style={{ fontSize: '20px', fontWeight: 700, color: 'var(--gold-primary)' }}>
              Your Jersey Cart
            </h2>
          </div>
          <button
            onClick={() => setIsCartOpen(false)}
            style={{
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
        </div>

        {/* Free Shipping Progress Meter */}
        <div
          style={{
            backgroundColor: 'var(--bg-elevated)',
            borderBottom: '1px solid var(--border-subtle)',
            padding: '14px 24px'
          }}
        >
          <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '12px', marginBottom: '8px' }}>
            <span style={{ color: 'var(--text-secondary)' }}>
              {isFreeShipping ? (
                <strong style={{ color: '#4ade80' }}>🎉 You have unlocked FREE Pan-India Shipping!</strong>
              ) : (
                <>Add <strong style={{ color: 'var(--gold-primary)' }}>₹{amountToFreeShipping}</strong> more for FREE Shipping!</>
              )}
            </span>
            <span style={{ fontWeight: 700, color: 'var(--gold-light)' }}>{freeShippingProgress}%</span>
          </div>

          <div
            style={{
              width: '100%',
              height: '6px',
              backgroundColor: 'var(--bg-primary)',
              borderRadius: '999px',
              overflow: 'hidden'
            }}
          >
            <div
              style={{
                width: `${freeShippingProgress}%`,
                height: '100%',
                backgroundColor: isFreeShipping ? '#22c55e' : 'var(--gold-primary)',
                transition: 'width 0.3s ease'
              }}
            />
          </div>
        </div>

        {/* Cart Item List */}
        <div style={{ flex: 1, overflowY: 'auto', padding: '20px 24px' }}>
          {items.length === 0 ? (
            <div style={{ textAlign: 'center', padding: '60px 0', color: 'var(--text-secondary)' }}>
              <div style={{ display: 'flex', justifyContent: 'center', marginBottom: '14px' }}>
                <PackageOpen size={48} color="var(--gold-primary)" strokeWidth={1.5} />
              </div>
              <h3 style={{ fontSize: '18px', fontWeight: 700, color: 'var(--text-primary)', marginBottom: '8px' }}>
                Your cart is empty
              </h3>
              <p style={{ fontSize: '13px', color: 'var(--text-muted)' }}>
                Explore our Club, Country, and Retro jersey collections to wear your story.
              </p>
            </div>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
              {items.map((item) => (
                <div
                  key={item.key}
                  style={{
                    display: 'flex',
                    gap: '14px',
                    paddingBottom: '16px',
                    borderBottom: '1px solid var(--border-subtle)'
                  }}
                >
                  <img
                    src={item.image}
                    alt={item.name}
                    style={{
                      width: '64px',
                      height: '64px',
                      borderRadius: '10px',
                      objectFit: 'cover',
                      border: '1px solid var(--border-subtle)',
                      backgroundColor: 'var(--bg-elevated)',
                      flexShrink: 0
                    }}
                  />
                  <div style={{ flex: 1 }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                      <h4 style={{ fontSize: '13px', fontWeight: 700, color: 'var(--text-primary)', lineHeight: 1.3 }}>
                        {item.name}
                      </h4>
                      <button
                        onClick={() => removeItem(item.key)}
                        style={{
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
                        <Trash2 size={15} />
                      </button>
                    </div>

                    <div style={{ fontSize: '11px', color: 'var(--text-secondary)', marginTop: '3px' }}>
                      Size: <strong>{item.size}</strong> • {item.subCategory}
                    </div>

                    {(() => {
                      const maxStock = item.stockBySize?.[item.size] !== undefined
                        ? Number(item.stockBySize[item.size])
                        : 99;
                      const isMaxReached = item.quantity >= maxStock;

                      return (
                        <>
                          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: '10px' }}>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', background: 'var(--bg-primary)', padding: '2px 8px', borderRadius: '8px', border: `1px solid ${isMaxReached ? 'rgba(245, 158, 11, 0.4)' : 'var(--border-subtle)'}` }}>
                              <button
                                onClick={() => updateQuantity(item.key, -1)}
                                style={{ background: 'none', border: 'none', color: 'var(--gold-primary)', cursor: 'pointer', fontSize: '14px', fontWeight: 700 }}
                              >
                                -
                              </button>
                              <span style={{ fontSize: '12px', fontWeight: 700 }}>{item.quantity}</span>
                              <button
                                onClick={() => {
                                  if (isMaxReached) {
                                    showStockToast?.(`Limited Stock: Maximum available units (${maxStock}) reached for Size ${item.size}.`);
                                    return;
                                  }
                                  updateQuantity(item.key, 1);
                                }}
                                disabled={isMaxReached}
                                style={{
                                  background: 'none',
                                  border: 'none',
                                  color: isMaxReached ? 'var(--text-muted)' : 'var(--gold-primary)',
                                  cursor: isMaxReached ? 'not-allowed' : 'pointer',
                                  fontSize: '14px',
                                  fontWeight: 700
                                }}
                              >
                                +
                              </button>
                            </div>

                            <div style={{ fontWeight: 800, color: 'var(--text-primary)', fontSize: '14px' }}>
                              ₹{item.price * item.quantity}
                            </div>
                          </div>
                          {isMaxReached && maxStock < 99 && (
                            <div style={{ fontSize: '10.5px', color: '#f59e0b', fontWeight: 700, marginTop: '4px', display: 'flex', alignItems: 'center', gap: '4px' }}>
                              <span>⚠️</span>
                              <span>Max available stock reached ({maxStock} units)</span>
                            </div>
                          )}
                        </>
                      );
                    })()}
                  </div>
                </div>
              ))}

              {/* Customer Delivery Details Toggle */}
              <div style={{ marginTop: '10px' }}>
                <button
                  type="button"
                  onClick={() => setShowAddressForm(!showAddressForm)}
                  style={{
                    width: '100%',
                    padding: '10px 14px',
                    backgroundColor: 'var(--bg-elevated)',
                    border: '1px solid var(--border-subtle)',
                    borderRadius: '10px',
                    color: 'var(--gold-primary)',
                    fontSize: '12px',
                    fontWeight: 700,
                    cursor: 'pointer',
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center'
                  }}
                >
                  <span style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                    <MapPin size={14} />
                    {customer.address ? 'Edit Delivery Address' : '+ Add Delivery Address (Optional)'}
                  </span>
                  <span>{showAddressForm ? <ChevronUp size={16} /> : <ChevronDown size={16} />}</span>
                </button>

                {showAddressForm && (
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '10px', marginTop: '12px', padding: '14px', backgroundColor: 'var(--bg-primary)', borderRadius: '12px', border: '1px solid var(--border-subtle)' }}>
                    <input
                      type="text"
                      placeholder="Your Full Name"
                      value={customer.name}
                      onChange={(e) => setCustomer({ ...customer, name: e.target.value })}
                      style={{ padding: '8px 10px', borderRadius: '8px', backgroundColor: 'var(--bg-surface)', border: '1px solid var(--border-subtle)', color: 'var(--text-primary)', fontSize: '12px' }}
                    />
                    <input
                      type="tel"
                      placeholder="WhatsApp Phone Number"
                      value={customer.phone}
                      onChange={(e) => setCustomer({ ...customer, phone: e.target.value })}
                      style={{ padding: '8px 10px', borderRadius: '8px', backgroundColor: 'var(--bg-surface)', border: '1px solid var(--border-subtle)', color: 'var(--text-primary)', fontSize: '12px' }}
                    />
                    <input
                      type="text"
                      placeholder="Street Address / Flat No."
                      value={customer.address}
                      onChange={(e) => setCustomer({ ...customer, address: e.target.value })}
                      style={{ padding: '8px 10px', borderRadius: '8px', backgroundColor: 'var(--bg-surface)', border: '1px solid var(--border-subtle)', color: 'var(--text-primary)', fontSize: '12px' }}
                    />
                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '8px' }}>
                      <input
                        type="text"
                        placeholder="City"
                        value={customer.city}
                        onChange={(e) => setCustomer({ ...customer, city: e.target.value })}
                        style={{ padding: '8px 10px', borderRadius: '8px', backgroundColor: 'var(--bg-surface)', border: '1px solid var(--border-subtle)', color: 'var(--text-primary)', fontSize: '12px' }}
                      />
                      <input
                        type="text"
                        placeholder="Pincode"
                        value={customer.pincode}
                        onChange={(e) => setCustomer({ ...customer, pincode: e.target.value })}
                        style={{ padding: '8px 10px', borderRadius: '8px', backgroundColor: 'var(--bg-surface)', border: '1px solid var(--border-subtle)', color: 'var(--text-primary)', fontSize: '12px' }}
                      />
                    </div>
                  </div>
                )}
              </div>
            </div>
          )}
        </div>

        {/* Drawer Footer & Checkout Actions */}
        {items.length > 0 && (
          <div
            style={{
              padding: '20px 24px',
              borderTop: '1px solid var(--border-subtle)',
              backgroundColor: 'var(--bg-surface)'
            }}
          >
            {/* Price Calculations */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', marginBottom: '16px', fontSize: '13px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', color: 'var(--text-secondary)' }}>
                <span>Subtotal</span>
                <span>₹{subtotal}</span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', color: 'var(--text-secondary)' }}>
                <span>Pan-India Shipping</span>
                <span>{isFreeShipping ? <strong style={{ color: '#4ade80' }}>FREE</strong> : `₹${shipping}`}</span>
              </div>
              <div
                style={{
                  display: 'flex',
                  justifyContent: 'space-between',
                  fontSize: '16px',
                  fontWeight: 800,
                  color: 'var(--text-primary)',
                  paddingTop: '8px',
                  borderTop: '1px solid var(--border-subtle)'
                }}
              >
                <span>Grand Total</span>
                <span style={{ color: 'var(--gold-primary)' }}>₹{grandTotal}</span>
              </div>
            </div>

            {/* Action Buttons */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
              {/* Option 1: WhatsApp Checkout */}
              <a
                href={getWhatsAppUrl(buildWhatsAppText())}
                onClick={(e) => triggerWhatsApp({ text: buildWhatsAppText(), e })}
                target="_blank"
                rel="noopener noreferrer"
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: '8px',
                  padding: '13px',
                  borderRadius: '12px',
                  backgroundColor: '#22c55e',
                  color: '#0d140f',
                  fontWeight: 800,
                  fontSize: '14px',
                  textDecoration: 'none',
                  boxShadow: '0 4px 16px rgba(34, 197, 94, 0.25)',
                  cursor: 'pointer'
                }}
              >
                <MessageCircle size={18} /> Order via WhatsApp Direct
              </a>

              {/* Option 2: Pay via UPI QR Modal */}
              <button
                type="button"
                onClick={handleOpenUpi}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: '8px',
                  padding: '13px',
                  borderRadius: '12px',
                  backgroundColor: 'var(--gold-primary)',
                  color: '#0d140f',
                  border: 'none',
                  fontWeight: 800,
                  fontSize: '14px',
                  cursor: 'pointer',
                  boxShadow: '0 4px 16px rgba(200, 169, 106, 0.25)'
                }}
              >
                <QrCode size={18} /> Pay via UPI QR (Auto-Generated)
              </button>

              {/* Option 3: ONLY FOR MOBILE VIEW - Direct Installed UPI App Launcher (Android & iPhone) */}
              <a
                href={`upi://pay?pa=jasonclement.jm-1@okhdfcbank&pn=Jason%20Clement&am=${grandTotal}&tn=${encodeURIComponent(`Order CC-${Date.now().toString().slice(-6)}`)}&mode=02&cu=INR`}
                className="mobile-only-cart-upi-btn"
                title="Pay with any installed UPI app on your phone (GPay, PhonePe, Paytm, CRED, BHIM)"
              >
                <Zap size={17} />
                <span>Pay ₹{grandTotal} with Installed UPI App</span>
              </a>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
