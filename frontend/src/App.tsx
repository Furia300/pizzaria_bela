import React, { useState } from 'react';
import { Navbar } from './components/Navbar';
import { CinematicHero } from './components/hero/CinematicHero';
import { MenuSection } from './components/menu/MenuSection';
import { PizzaCustomizer } from './components/builder/PizzaCustomizer';
import { CartDrawer } from './components/cart/CartDrawer';
import { CheckoutModal } from './components/cart/CheckoutModal';
import { LiveOrderTracker } from './components/tracking/LiveOrderTracker';
import { KitchenDisplaySystem } from './components/kds/KitchenDisplaySystem';
import { CourierDashboard } from './components/courier/CourierDashboard';
import { AdminDashboard } from './components/admin/AdminDashboard';
import { DesignSystemPage } from './pages/DesignSystemPage';
import { Footer } from './components/Footer';
import { useStore } from './store/useStore';

export function App() {
  const [currentView, setCurrentView] = useState<
    'home' | 'kds' | 'courier' | 'admin' | 'design-system' | 'tracking'
  >('home');
  const [isCheckoutOpen, setCheckoutOpen] = useState(false);

  const { activeOrderId, setActiveOrderId } = useStore();

  const handleOrderSuccess = (orderId: string) => {
    setActiveOrderId(orderId);
    setCurrentView('tracking');
  };

  return (
    <div className="min-h-screen bg-wood-950 text-stone-100 flex flex-col justify-between">
      
      {/* Top Navbar */}
      <Navbar currentView={currentView} onNavigate={(view) => setCurrentView(view)} />

      {/* Main View Router */}
      <main className="flex-1">
        {currentView === 'home' && (
          <>
            <CinematicHero />
            <MenuSection />
          </>
        )}

        {currentView === 'tracking' && activeOrderId && (
          <LiveOrderTracker
            orderId={activeOrderId}
            onBackToMenu={() => setCurrentView('home')}
          />
        )}

        {currentView === 'kds' && <KitchenDisplaySystem />}

        {currentView === 'courier' && <CourierDashboard />}

        {currentView === 'admin' && <AdminDashboard />}

        {currentView === 'design-system' && <DesignSystemPage />}
      </main>

      {/* Footer (on home and design system views) */}
      {(currentView === 'home' || currentView === 'design-system') && <Footer />}

      {/* Global Interactive Modals */}
      <PizzaCustomizer />
      <CartDrawer onCheckout={() => setCheckoutOpen(true)} />
      <CheckoutModal
        isOpen={isCheckoutOpen}
        onClose={() => setCheckoutOpen(false)}
        onOrderSuccess={handleOrderSuccess}
      />
    </div>
  );
}

export default App;
