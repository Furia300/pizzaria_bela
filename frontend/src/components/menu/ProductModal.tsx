import React, { useState } from 'react';
import { X, Plus, Minus, Check, ShoppingBag, Sparkles, Flame, Leaf } from 'lucide-react';
import { Product, ProductVariant } from '../../types';
import { useStore } from '../../store/useStore';

interface ProductModalProps {
  product: Product | null;
  onClose: () => void;
}

export const ProductModal: React.FC<ProductModalProps> = ({ product, onClose }) => {
  const { addItem } = useStore();

  if (!product) return null;

  const variants = product.variants || [
    { id: '1', name: 'Média (6 Fatias - 30cm)', sizeSlices: 6, priceMultiplier: 1.0, isDefault: true },
    { id: '2', name: 'Grande (8 Fatias - 35cm)', sizeSlices: 8, priceMultiplier: 1.3, isDefault: false },
    { id: '3', name: 'Família (12 Fatias - 40cm)', sizeSlices: 12, priceMultiplier: 1.6, isDefault: false },
    { id: '4', name: 'Individual (4 Fatias - 25cm)', sizeSlices: 4, priceMultiplier: 0.75, isDefault: false }
  ];

  const [selectedVariant, setSelectedVariant] = useState<ProductVariant>(
    variants.find((v) => v.isDefault) || variants[0]
  );
  const [selectedCrust, setSelectedCrust] = useState<{ name: string; price: number }>({
    name: 'Borda Tradicional Crocante',
    price: 0
  });
  const [quantity, setQuantity] = useState(1);
  const [notes, setNotes] = useState('');

  const crustOptions = [
    { name: 'Borda Tradicional Crocante', price: 0 },
    { name: 'Catupiry Original D.O.C.', price: 10.0 },
    { name: 'Cheddar Cremoso Inglês', price: 9.0 },
    { name: 'Vulcão de Alho Poró & Cream Cheese', price: 12.0 },
    { name: 'Chocolate Belga Callebaut', price: 11.0 }
  ];

  const unitPrice =
    Math.round((product.basePrice * selectedVariant.priceMultiplier + selectedCrust.price) * 100) /
    100;
  const totalPrice = Math.round(unitPrice * quantity * 100) / 100;

  const handleAddToCart = () => {
    addItem({
      product,
      variant: selectedVariant,
      quantity,
      unitPrice,
      customConfig: {
        crustType: selectedCrust.name,
        crustPrice: selectedCrust.price,
        variantName: selectedVariant.name
      },
      notes: notes.trim() || undefined
    });
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-black/80 backdrop-blur-md flex items-center justify-center p-4">
      <div className="relative w-full max-w-lg bg-wood-900 border border-stone-700/80 rounded-2xl shadow-2xl overflow-hidden flex flex-col">
        
        {/* Header Image */}
        <div className="relative h-56 w-full overflow-hidden bg-wood-950">
          <img src={product.image} alt={product.name} className="w-full h-full object-cover" />
          <div className="absolute inset-0 bg-gradient-to-t from-wood-900 via-transparent to-black/60"></div>
          
          <button
            onClick={onClose}
            className="absolute top-4 right-4 p-2 rounded-full bg-black/60 text-stone-300 hover:text-white hover:bg-black/80 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>

          <div className="absolute bottom-4 left-4 right-4">
            <h2 className="text-2xl font-serif font-bold text-white leading-tight">
              {product.name}
            </h2>
            <p className="text-xs text-stone-300 mt-1 line-clamp-2">{product.description}</p>
          </div>
        </div>

        {/* Modal Body */}
        <div className="p-6 space-y-5 overflow-y-auto max-h-[50vh]">
          
          {/* Size Variant Picker */}
          {variants.length > 0 && (
            <div>
              <label className="text-xs font-bold text-amber-400 uppercase tracking-wider block mb-2">
                Tamanho da Pizza
              </label>
              <div className="space-y-2">
                {variants.map((v) => {
                  const calculated = Math.round(product.basePrice * v.priceMultiplier * 100) / 100;
                  const isSelected = selectedVariant.id === v.id;
                  return (
                    <button
                      key={v.id}
                      onClick={() => setSelectedVariant(v)}
                      className={`w-full p-3 rounded-xl border text-left flex items-center justify-between transition-all ${
                        isSelected
                          ? 'border-amber-500 bg-amber-500/20 text-white font-semibold'
                          : 'border-stone-800 bg-stone-900/60 text-stone-300 hover:border-stone-700'
                      }`}
                    >
                      <div className="flex items-center gap-2">
                        <div
                          className={`w-4 h-4 rounded-full border flex items-center justify-center ${
                            isSelected ? 'border-amber-400 bg-amber-400' : 'border-stone-600'
                          }`}
                        >
                          {isSelected && <div className="w-2 h-2 rounded-full bg-black"></div>}
                        </div>
                        <span className="text-sm">{v.name}</span>
                      </div>
                      <span className="text-sm font-bold text-amber-400">
                        R$ {calculated.toFixed(2)}
                      </span>
                    </button>
                  );
                })}
              </div>
            </div>
          )}

          {/* Stuffed Crust Options */}
          <div>
            <label className="text-xs font-bold text-amber-400 uppercase tracking-wider block mb-2">
              Opção de Borda
            </label>
            <div className="grid grid-cols-1 gap-2">
              {crustOptions.map((c) => {
                const isSelected = selectedCrust.name === c.name;
                return (
                  <button
                    key={c.name}
                    onClick={() => setSelectedCrust(c)}
                    className={`p-2.5 rounded-xl border text-left flex items-center justify-between text-xs transition-all ${
                      isSelected
                        ? 'border-amber-500 bg-amber-500/20 text-white font-medium'
                        : 'border-stone-800 bg-stone-900/60 text-stone-300 hover:border-stone-700'
                    }`}
                  >
                    <span>{c.name}</span>
                    <span className="font-bold text-amber-400">
                      {c.price > 0 ? `+R$ ${c.price.toFixed(2)}` : 'Inclusa'}
                    </span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Observations */}
          <div>
            <label className="text-xs font-bold text-stone-400 uppercase tracking-wider block mb-1">
              Observações
            </label>
            <input
              type="text"
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="Ex: sem azeitona, bem passada, etc."
              className="w-full bg-stone-900 border border-stone-700 rounded-xl px-3 py-2 text-xs text-stone-200 placeholder-stone-500 focus:border-amber-500 focus:outline-none"
            />
          </div>
        </div>

        {/* Modal Footer */}
        <div className="p-4 bg-wood-850 border-t border-stone-800 flex items-center justify-between gap-4">
          {/* Quantity stepper */}
          <div className="flex items-center gap-2 bg-stone-900 border border-stone-700 rounded-xl p-1">
            <button
              onClick={() => setQuantity(Math.max(1, quantity - 1))}
              className="p-1.5 rounded-lg text-stone-400 hover:text-white hover:bg-stone-800 transition-colors"
            >
              <Minus className="w-4 h-4" />
            </button>
            <span className="w-8 text-center text-sm font-bold text-white">{quantity}</span>
            <button
              onClick={() => setQuantity(quantity + 1)}
              className="p-1.5 rounded-lg text-stone-400 hover:text-white hover:bg-stone-800 transition-colors"
            >
              <Plus className="w-4 h-4" />
            </button>
          </div>

          {/* Add Button */}
          <button
            onClick={handleAddToCart}
            className="flex-1 py-3.5 px-4 rounded-xl bg-gradient-to-r from-tomato-700 to-tomato-600 hover:from-tomato-600 hover:to-tomato-500 active:scale-95 text-white font-bold text-sm shadow-glow-tomato transition-all flex items-center justify-center gap-2"
          >
            <ShoppingBag className="w-4 h-4" />
            <span>Adicionar • R$ {totalPrice.toFixed(2)}</span>
          </button>
        </div>
      </div>
    </div>
  );
};
