import React from 'react';
import { Sparkles, Flame, Leaf, Plus } from 'lucide-react';
import { Product } from '../../types';

interface ProductCardProps {
  product: Product;
  onSelect: (product: Product) => void;
}

export const ProductCard: React.FC<ProductCardProps> = ({ product, onSelect }) => {
  return (
    <div className="group relative bg-wood-900/90 border border-stone-800 hover:border-amber-500/50 rounded-2xl overflow-hidden shadow-card-dark transition-all duration-300 hover:-translate-y-1.5 flex flex-col justify-between">
      
      {/* Image Container */}
      <div className="relative h-48 sm:h-52 w-full overflow-hidden bg-wood-950">
        <img
          src={product.image}
          alt={product.name}
          className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
          loading="lazy"
        />

        {/* Gradient Overlay */}
        <div className="absolute inset-0 bg-gradient-to-t from-wood-900 via-transparent to-transparent opacity-80"></div>

        {/* Tags */}
        <div className="absolute top-3 left-3 flex flex-wrap gap-1.5 z-10">
          {product.isChefSpecial && (
            <span className="px-2.5 py-1 rounded-full bg-amber-500/90 text-black text-[10px] font-black uppercase tracking-wider flex items-center gap-1 shadow-md">
              <Sparkles className="w-3 h-3" />
              <span>Chef Special</span>
            </span>
          )}
          {product.isVegetarian && (
            <span className="px-2.5 py-1 rounded-full bg-emerald-700/90 text-white text-[10px] font-bold uppercase flex items-center gap-1 shadow-md">
              <Leaf className="w-3 h-3 text-emerald-300" />
              <span>Veggie</span>
            </span>
          )}
          {product.isSpicy && (
            <span className="px-2.5 py-1 rounded-full bg-red-700/90 text-white text-[10px] font-bold uppercase flex items-center gap-1 shadow-md">
              <Flame className="w-3 h-3 text-amber-300" />
              <span>Picante</span>
            </span>
          )}
        </div>
      </div>

      {/* Details Body */}
      <div className="p-5 flex-1 flex flex-col justify-between space-y-4">
        <div>
          <h3 className="text-lg font-serif font-bold text-stone-100 group-hover:text-amber-400 transition-colors">
            {product.name}
          </h3>
          <p className="text-xs text-stone-400 mt-1.5 line-clamp-2 leading-relaxed">
            {product.description}
          </p>
        </div>

        {/* Price and Action Button */}
        <div className="pt-2 border-t border-stone-800/80 flex items-center justify-between">
          <div>
            <span className="text-[10px] text-stone-400 uppercase tracking-wider block">A partir de</span>
            <span className="text-xl font-serif font-black text-amber-400">
              R$ {product.basePrice.toFixed(2)}
            </span>
          </div>

          <button
            onClick={() => onSelect(product)}
            className="px-3.5 py-2 rounded-xl bg-tomato-700 hover:bg-tomato-600 active:scale-95 text-white text-xs font-bold shadow-glow-tomato transition-all flex items-center gap-1.5"
          >
            <Plus className="w-4 h-4" />
            <span>Escolher</span>
          </button>
        </div>
      </div>
    </div>
  );
};
