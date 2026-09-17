'use client';

import { useEffect } from 'react';
import { usePathname } from 'next/navigation';
import { useCart } from '../context/CartContext';
import UpiModal from './UpiModal';
import { AlertTriangle, X } from 'lucide-react';

export default function LayoutClientWrapper() {
  const { activeUpiOrder, setActiveUpiOrder, stockToast, dismissStockToast } = useCart();
  const pathname = usePathname();

  // Automatically scroll to the very top on every page navigation
  useEffect(() => {
    if (typeof window !== 'undefined') {
      // If there's an in-page hash anchor (e.g. #club, #catalog), let the hash handler take care of it
      if (window.location.hash) {
        return;
      }

      // Reset scroll position immediately on route change
      window.scrollTo({ top: 0, left: 0, behavior: 'instant' });
      document.documentElement.scrollTop = 0;
      document.body.scrollTop = 0;
    }
  }, [pathname]);

  return (
    <>
      {stockToast && (
        <div className="stock-toast-container">
          <div className="stock-toast" role="alert">
            <div
              style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                width: '28px',
                height: '28px',
                borderRadius: '50%',
                backgroundColor: 'rgba(245, 158, 11, 0.18)',
                color: '#f59e0b',
                flexShrink: 0
              }}
            >
              <AlertTriangle size={16} strokeWidth={2.5} />
            </div>
            <div style={{ flex: 1, color: '#f8faf9', fontSize: '13px', lineHeight: 1.4 }}>
              {stockToast.message}
            </div>
            <button
              onClick={dismissStockToast}
              aria-label="Dismiss alert"
              style={{
                background: 'none',
                border: 'none',
                color: 'var(--text-muted)',
                cursor: 'pointer',
                padding: '4px',
                borderRadius: '6px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center'
              }}
            >
              <X size={15} />
            </button>
          </div>
        </div>
      )}

      {activeUpiOrder && (
        <UpiModal
          orderDetails={activeUpiOrder}
          onClose={() => setActiveUpiOrder(null)}
        />
      )}
    </>
  );
}

