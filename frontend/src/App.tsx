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
import { LiveChatWidget } from './components/chat/LiveChatWidget';
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

      {/* Main View Portals */}
      <main className="flex-1">
        <div className={currentView === 'home' ? 'block' : 'hidden'}>
          <CinematicHero />
          <MenuSection />
        </div>

        <div className={currentView === 'tracking' && activeOrderId ? 'block' : 'hidden'}>
          {activeOrderId && (
            <LiveOrderTracker
              orderId={activeOrderId}
              onBackToMenu={() => setCurrentView('home')}
            />
          )}
        </div>

        <div className={currentView === 'kds' ? 'block' : 'hidden'}>
          <KitchenDisplaySystem />
        </div>

        <div className={currentView === 'courier' ? 'block' : 'hidden'}>
          <CourierDashboard />
        </div>

        <div className={currentView === 'admin' ? 'block' : 'hidden'}>
          <AdminDashboard />
        </div>

        <div className={currentView === 'design-system' ? 'block' : 'hidden'}>
          <DesignSystemPage />
        </div>
      </main>

      {/* Footer */}
      {currentView === 'home' && <Footer />}

      {/* Global Interactive Modals & Live Chat */}
      <PizzaCustomizer />
      <CartDrawer onCheckout={() => setCheckoutOpen(true)} />
      <CheckoutModal
        isOpen={isCheckoutOpen}
        onClose={() => setCheckoutOpen(false)}
        onOrderSuccess={handleOrderSuccess}
      />
      <LiveChatWidget />
    </div>
  );
}

export default App;
