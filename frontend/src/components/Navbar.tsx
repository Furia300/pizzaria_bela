import React, { useState } from 'react';
import {
  Pizza,
  ShoppingBag,
  ChefHat,
  Bike,
  ShieldAlert,
  Flame,
  Layers,
  Palette,
  User as UserIcon,
  ChevronDown
} from 'lucide-react';
import { useStore } from '../store/useStore';

interface NavbarProps {
  currentView: 'home' | 'kds' | 'courier' | 'admin' | 'design-system' | 'tracking';
  onNavigate: (view: 'home' | 'kds' | 'courier' | 'admin' | 'design-system' | 'tracking') => void;
}

export const Navbar: React.FC<NavbarProps> = ({ currentView, onNavigate }) => {
  const { items, setCartOpen, user, setUser } = useStore();
  const [showProfileMenu, setShowProfileMenu] = useState(false);

  const itemCount = items.reduce((sum, i) => sum + i.quantity, 0);

  const handleDemoLogin = async (role: 'CLIENT' | 'KITCHEN' | 'COURIER' | 'ADMIN') => {
    try {
      const res = await fetch('http://localhost:4000/api/auth/demo-login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ role })
      });
      const data = await res.json();
      if (data.user) {
        setUser(data.user, data.token);
        setShowProfileMenu(false);
      }
    } catch (err) {
      console.error(err);
    }
  };

  return (
    <header className="sticky top-0 z-40 w-full bg-wood-950/90 backdrop-blur-md border-b border-stone-800 shadow-xl">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8 max-w-7xl h-16 flex items-center justify-between gap-4">
        
        {/* Brand Logo & Name */}
        <button
          onClick={() => onNavigate('home')}
          className="flex items-center gap-2.5 group text-left focus:outline-none"
        >
          <div className="p-2 rounded-xl bg-gradient-to-br from-tomato-700 to-tomato-900 border border-tomato-500/50 text-white shadow-glow-tomato group-hover:scale-105 transition-transform">
            <Flame className="w-5 h-5 text-amber-400" />
          </div>
          <div>
            <span className="text-base sm:text-lg font-serif font-black tracking-tight text-white block leading-none">
              Insta Livre <span className="gold-gradient-text">Pizza</span>
            </span>
            <span className="text-[10px] text-amber-400/80 font-medium tracking-wider uppercase block">
              Pizzeria Bella Notte
            </span>
          </div>
        </button>

        {/* Portal Navigator Tabs */}
        <nav className="hidden md:flex items-center gap-1 bg-stone-900/80 p-1 rounded-xl border border-stone-800 text-xs">
          <button
            onClick={() => onNavigate('home')}
            className={`px-3 py-1.5 rounded-lg font-semibold transition-all flex items-center gap-1.5 ${
              currentView === 'home'
                ? 'bg-amber-500 text-black font-bold shadow-glow-gold'
                : 'text-stone-300 hover:text-white'
            }`}
          >
            <Pizza className="w-3.5 h-3.5" />
            <span>Cardápio</span>
          </button>

          <button
            onClick={() => onNavigate('kds')}
            className={`px-3 py-1.5 rounded-lg font-semibold transition-all flex items-center gap-1.5 ${
              currentView === 'kds'
                ? 'bg-amber-500 text-black font-bold shadow-glow-gold'
                : 'text-stone-300 hover:text-white'
            }`}
          >
            <ChefHat className="w-3.5 h-3.5" />
            <span>Cozinha (KDS)</span>
          </button>

          <button
            onClick={() => onNavigate('courier')}
            className={`px-3 py-1.5 rounded-lg font-semibold transition-all flex items-center gap-1.5 ${
              currentView === 'courier'
                ? 'bg-amber-500 text-black font-bold shadow-glow-gold'
                : 'text-stone-300 hover:text-white'
            }`}
          >
            <Bike className="w-3.5 h-3.5" />
            <span>Motoboy</span>
          </button>

          <button
            onClick={() => onNavigate('admin')}
            className={`px-3 py-1.5 rounded-lg font-semibold transition-all flex items-center gap-1.5 ${
              currentView === 'admin'
                ? 'bg-amber-500 text-black font-bold shadow-glow-gold'
                : 'text-stone-300 hover:text-white'
            }`}
          >
            <ShieldAlert className="w-3.5 h-3.5" />
            <span>Admin</span>
          </button>

          <button
            onClick={() => onNavigate('design-system')}
            className={`px-2.5 py-1.5 rounded-lg transition-all ${
              currentView === 'design-system' ? 'text-amber-400 font-bold' : 'text-stone-400 hover:text-stone-200'
            }`}
            title="Design System"
          >
            <Palette className="w-3.5 h-3.5" />
          </button>
        </nav>

        {/* Right Actions: Quick Role Switcher + Cart */}
        <div className="flex items-center gap-3">
          
          {/* Quick Demo Profile Selector */}
          <div className="relative">
            <button
              onClick={() => setShowProfileMenu(!showProfileMenu)}
              className="px-3 py-1.5 rounded-xl bg-stone-900 border border-stone-800 text-xs font-semibold text-stone-200 hover:border-amber-500/50 flex items-center gap-1.5 transition-colors"
            >
              <UserIcon className="w-3.5 h-3.5 text-amber-400" />
              <span className="hidden sm:inline">{user?.name ? user.name.split(' ')[0] : 'Perfil Demo'}</span>
              <ChevronDown className="w-3 h-3 text-stone-400" />
            </button>

            {showProfileMenu && (
              <div className="absolute right-0 mt-2 w-56 rounded-2xl bg-stone-900 border border-stone-700 shadow-2xl p-2 z-50 text-xs space-y-1">
                <div className="p-2 border-b border-stone-800 text-[11px] text-stone-400">
                  Troca Rápida de Perfil de Teste:
                </div>
                <button
                  onClick={() => handleDemoLogin('CLIENT')}
                  className="w-full text-left px-3 py-2 rounded-lg hover:bg-stone-800 text-stone-200 font-medium"
                >
                  🍕 Cliente (Diogo Oliveira)
                </button>
                <button
                  onClick={() => handleDemoLogin('KITCHEN')}
                  className="w-full text-left px-3 py-2 rounded-lg hover:bg-stone-800 text-stone-200 font-medium"
                >
                  👨‍🍳 Cozinha (Pizzaiolo Marco)
                </button>
                <button
                  onClick={() => handleDemoLogin('COURIER')}
                  className="w-full text-left px-3 py-2 rounded-lg hover:bg-stone-800 text-stone-200 font-medium"
                >
                  🛵 Motoboy (Carlos Veloz)
                </button>
                <button
                  onClick={() => handleDemoLogin('ADMIN')}
                  className="w-full text-left px-3 py-2 rounded-lg hover:bg-stone-800 text-stone-200 font-medium"
                >
                  👑 Administrador (Chef Giovanni)
                </button>
              </div>
            )}
          </div>

          {/* Cart Button */}
          <button
            onClick={() => setCartOpen(true)}
            className="relative p-2.5 rounded-xl bg-tomato-700 hover:bg-tomato-600 active:scale-95 text-white shadow-glow-tomato transition-all flex items-center justify-center"
            aria-label="Abrir carrinho de compras"
          >
            <ShoppingBag className="w-5 h-5" />
            {itemCount > 0 && (
              <span className="absolute -top-1.5 -right-1.5 w-5 h-5 rounded-full bg-amber-400 text-black text-[11px] font-black flex items-center justify-center shadow-md animate-bounce">
                {itemCount}
              </span>
            )}
          </button>
        </div>
      </div>
    </header>
  );
};
