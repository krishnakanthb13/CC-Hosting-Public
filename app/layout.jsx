import './globals.css';
import { CartProvider } from '../context/CartContext';
import Navbar from '../components/Navbar';
import Footer from '../components/Footer';
import CartDrawer from '../components/CartDrawer';
import LayoutClientWrapper from '../components/LayoutClientWrapper';

export const metadata = {
  metadataBase: new URL(
    process.env.NEXT_PUBLIC_SITE_URL || 'https://crownandcross.vercel.app'
  ),
  title: 'Crown & Cross — Football Jerseys | Club • Country • Retro',
  description: 'Some wear fashion. We wear football. Premium football jerseys in Chennai, Tamil Nadu. Player version, master copy, fan sets, and retro classics with Pan-India delivery.',
  openGraph: {
    title: 'Crown & Cross — Football Jerseys',
    description: 'Wear Your Club. Wear Your Story. Club, Country & Retro Football Kits.',
    images: ['/images/logo.jpeg']
  },
  icons: {
    icon: '/favicon.ico',
    shortcut: '/favicon.ico',
    apple: '/images/logo.jpeg'
  }
};

export const viewport = {
  width: 'device-width',
  initialScale: 1,
  maximumScale: 5,
  themeColor: '#0d140f'
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body>
        <CartProvider>
          <Navbar />
          <main>{children}</main>
          <Footer />
          <CartDrawer />
          <LayoutClientWrapper />
        </CartProvider>
      </body>
    </html>
  );
}
