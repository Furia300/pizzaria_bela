import React from 'react';
import { Sparkles, Flame, Leaf, ChefHat, Bike, Star, ShoppingBag, ShieldCheck } from 'lucide-react';

export const DesignSystemPage: React.FC = () => {
  return (
    <div className="min-h-screen bg-wood-950 text-stone-100 p-6 sm:p-12 max-w-6xl mx-auto space-y-12">
      
      {/* Title */}
      <div className="border-b border-stone-800 pb-6 space-y-2">
        <h1 className="text-3xl sm:text-4xl font-serif font-black gold-gradient-text">
          Design System • Pizzeria Bella Notte
        </h1>
        <p className="text-sm text-stone-400">
          Guia de estilo e componentes visuais com estética italiana artesanal contemporânea.
        </p>
      </div>

      {/* 1. Color Palette */}
      <div className="space-y-4">
        <h2 className="text-lg font-serif font-bold text-white uppercase tracking-wider">
          1. Paleta de Cores Oficial
        </h2>
        <div className="grid grid-cols-2 sm:grid-cols-5 gap-4">
          
          <div className="p-4 rounded-xl bg-tomato-700 text-white space-y-1 shadow-glow-tomato">
            <span className="text-xs font-bold block">Rosso Pomodoro</span>
            <span className="text-[10px] font-mono opacity-80">#B91C1C</span>
          </div>

          <div className="p-4 rounded-xl bg-amber-500 text-black space-y-1 shadow-glow-gold font-semibold">
            <span className="text-xs font-bold block">Oro Forno</span>
            <span className="text-[10px] font-mono opacity-80">#F59E0B</span>
          </div>

          <div className="p-4 rounded-xl bg-emerald-700 text-white space-y-1 shadow-md">
            <span className="text-xs font-bold block">Verde Basilico</span>
            <span className="text-[10px] font-mono opacity-80">#15803D</span>
          </div>

          <div className="p-4 rounded-xl bg-stone-900 border border-stone-700 text-white space-y-1">
            <span className="text-xs font-bold block">Legno Notte</span>
            <span className="text-[10px] font-mono opacity-80">#181615</span>
          </div>

          <div className="p-4 rounded-xl bg-stone-100 text-black space-y-1">
            <span className="text-xs font-bold block">Farina 00</span>
            <span className="text-[10px] font-mono opacity-80">#FAFAF9</span>
          </div>
        </div>
      </div>

      {/* 2. Typography */}
      <div className="space-y-4">
        <h2 className="text-lg font-serif font-bold text-white uppercase tracking-wider">
          2. Tipografia Editorial Italiana
        </h2>
        <div className="p-6 rounded-2xl bg-wood-900 border border-stone-800 space-y-4">
          <div>
            <span className="text-[11px] text-amber-400 font-mono block">Font Serif (Cinzel / Playfair):</span>
            <p className="text-3xl font-serif font-black text-white">
              A Verdadeira Arte da Pizza Napolitana
            </p>
          </div>
          <div>
            <span className="text-[11px] text-amber-400 font-mono block">Font Sans (Inter):</span>
            <p className="text-sm text-stone-300 font-light leading-relaxed">
              Massa de fermentação natural 48 horas, tomates San Marzano e mussarela de búfala fresca derretida.
            </p>
          </div>
        </div>
      </div>

      {/* 3. Buttons & Badges */}
      <div className="space-y-4">
        <h2 className="text-lg font-serif font-bold text-white uppercase tracking-wider">
          3. Botões e Ações Interativas
        </h2>
        <div className="p-6 rounded-2xl bg-wood-900 border border-stone-800 flex flex-wrap gap-4 items-center">
          
          <button className="px-6 py-3 rounded-xl bg-gradient-to-r from-tomato-700 to-tomato-600 text-white font-bold text-xs shadow-glow-tomato flex items-center gap-2">
            <ShoppingBag className="w-4 h-4" />
            <span>Botão Primário (CTA)</span>
          </button>

          <button className="px-6 py-3 rounded-xl bg-amber-500 text-black font-bold text-xs shadow-glow-gold flex items-center gap-2">
            <ChefHat className="w-4 h-4" />
            <span>Botão Dourado</span>
          </button>

          <button className="px-6 py-3 rounded-xl bg-stone-800 border border-stone-700 text-stone-200 font-bold text-xs hover:border-amber-500 transition-colors">
            <span>Botão Secundário</span>
          </button>

          <span className="px-3 py-1 rounded-full bg-amber-500/20 text-amber-300 text-xs font-bold border border-amber-500/40 flex items-center gap-1">
            <Sparkles className="w-3.5 h-3.5" />
            <span>Badge Especial</span>
          </span>

          <span className="px-3 py-1 rounded-full bg-emerald-950 text-emerald-300 text-xs font-bold border border-emerald-500/40 flex items-center gap-1">
            <Leaf className="w-3.5 h-3.5" />
            <span>Vegetariana</span>
          </span>
        </div>
      </div>
    </div>
  );
};
