import React, { useState, useEffect } from 'react';
import { Navbar } from './components/Navbar';
import { Hero } from './components/Hero';
import { CafeAmbienceSection } from './components/CafeAmbienceSection';
import { MenuSection } from './components/MenuSection';
import { CafeGallery } from './components/CafeGallery';
import { AboutSection } from './components/AboutSection';
import { ContactSection } from './components/ContactSection';
import { Footer } from './components/Footer';
import { QuickViewModal } from './components/QuickViewModal';
import { ReservationModal } from './components/ReservationModal';
import { CoffeeLoader } from './components/CoffeeLoader';
import { CoffeeCursor } from './components/CoffeeCursor';
import { NotFoundPage } from './pages/NotFoundPage';
import { MenuItem } from './data/cafeData';
import { Check, ShoppingBag } from 'lucide-react';
import { initAntiDebug } from './utils/antiDebug';

export default function App() {
  const [activeSection, setActiveSection] = useState('hero');
  const [selectedItem, setSelectedItem] = useState<MenuItem | null>(null);
  const [reservationOpen, setReservationOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [currentPath, setCurrentPath] = useState(window.location.pathname);
  const [orderToast, setOrderToast] = useState<{ message: string; visible: boolean }>({
    message: '',
    visible: false,
  });

  // Activate client anti-debugging protection to hide code
  useEffect(() => {
    const cleanup = initAntiDebug();
    return cleanup;
  }, []);

  // Track browser path for custom 404 routing
  useEffect(() => {
    const handlePopState = () => {
      setCurrentPath(window.location.pathname);
    };
    window.addEventListener('popstate', handlePopState);
    return () => window.removeEventListener('popstate', handlePopState);
  }, []);

  // Smooth scroll navigation handler
  const handleNavigate = (sectionId: string) => {
    if (currentPath !== '/' && currentPath !== '') {
      window.history.pushState({}, '', '/');
      setCurrentPath('/');
    }
    setActiveSection(sectionId);
    setTimeout(() => {
      const element = document.getElementById(sectionId);
      if (element) {
        element.scrollIntoView({ behavior: 'smooth' });
      }
    }, 50);
  };

  const handleReturnHome = () => {
    window.history.pushState({}, '', '/');
    setCurrentPath('/');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  // Scroll spy for sticky navbar active indication
  useEffect(() => {
    if (currentPath !== '/' && currentPath !== '') return;

    const handleScroll = () => {
      const sections = ['hero', 'ambience', 'menu', 'gallery', 'about', 'contact'];
      const scrollPosition = window.scrollY + 140;

      for (const sectionId of sections) {
        const el = document.getElementById(sectionId);
        if (el) {
          const top = el.offsetTop;
          const height = el.offsetHeight;
          if (scrollPosition >= top && scrollPosition < top + height) {
            setActiveSection(sectionId);
            break;
          }
        }
      }
    };

    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, [currentPath]);

  const triggerToast = (message: string) => {
    setOrderToast({ message, visible: true });
    setTimeout(() => {
      setOrderToast((prev) => ({ ...prev, visible: false }));
    }, 3500);
  };

  const handleQuickOrder = (item: MenuItem) => {
    triggerToast(`Added 1x ${item.name} (₹${item.price}) to counter order.`);
  };

  const handleConfirmOrder = (item: MenuItem, notes: string) => {
    const noteText = notes ? ` with request: "${notes}"` : '';
    triggerToast(`Ordered ${item.name} (₹${item.price})${noteText}!`);
  };

  // Custom 404 condition (Route not matching home or standard hash)
  const is404 =
    currentPath !== '/' &&
    currentPath !== '' &&
    currentPath !== '/index.html';

  return (
    <div className="min-h-screen bg-[#FFF8F0] text-[#1E1E1E] flex flex-col font-body selection:bg-[#D9B382]/30 selection:text-[#6F4E37] relative">
      {/* Branded 0.9s Coffee Brewing Loading Screen */}
      {isLoading && <CoffeeLoader onComplete={() => setIsLoading(false)} />}

      {/* Subtle Amber Glow Coffee Cursor for Desktop */}
      <CoffeeCursor />

      {/* Skip to Content Link for WCAG Accessibility */}
      <a
        href="#main-content"
        className="sr-only focus:not-sr-only focus:fixed focus:top-4 focus:left-4 z-50 px-4 py-2 bg-[#6F4E37] text-white rounded-md shadow-lg outline-none ring-2 ring-white"
      >
        Skip to main content
      </a>

      {is404 ? (
        <NotFoundPage onReturnHome={handleReturnHome} />
      ) : (
        <>
          {/* Sticky Three-Zone Navigation */}
          <Navbar
            activeSection={activeSection}
            onNavigate={handleNavigate}
            onOpenReservation={() => setReservationOpen(true)}
          />

          {/* Main Storytelling Experience */}
          <main id="main-content" className="flex-1">
            <Hero
              onExploreMenu={() => handleNavigate('menu')}
              onVisitUs={() => handleNavigate('contact')}
            />
            <CafeAmbienceSection />
            <MenuSection
              onSelectItem={(item) => setSelectedItem(item)}
              onQuickOrder={handleQuickOrder}
            />
            <CafeGallery />
            <AboutSection />
            <ContactSection />
          </main>

          {/* Footer */}
          <Footer onNavigate={handleNavigate} />

          {/* Interactive Modals */}
          <QuickViewModal
            item={selectedItem}
            onClose={() => setSelectedItem(null)}
            onConfirmOrder={handleConfirmOrder}
          />

          <ReservationModal
            isOpen={reservationOpen}
            onClose={() => setReservationOpen(false)}
          />
        </>
      )}

      {/* Order & Microinteraction Feedback Toast */}
      {orderToast.visible && (
        <aside
          role="status"
          aria-live="polite"
          className="fixed bottom-6 right-6 z-50 bg-[#1E1E1E] text-white px-5 py-3.5 rounded-2xl shadow-2xl border border-[#D9B382]/40 flex items-center gap-3 animate-in fade-in slide-in-from-bottom-4 duration-200"
        >
          <div className="w-8 h-8 rounded-full bg-[#6F4E37] text-[#D9B382] flex items-center justify-center shrink-0">
            <ShoppingBag className="w-4 h-4" aria-hidden="true" />
          </div>
          <div className="text-xs sm:text-sm">
            <span className="font-semibold block text-white">Café Counter Update</span>
            <span className="text-gray-300">{orderToast.message}</span>
          </div>
          <div className="ml-2 pl-2 border-l border-white/20 text-[#D9B382]">
            <Check className="w-4 h-4" aria-hidden="true" />
          </div>
        </aside>
      )}
    </div>
  );
}
