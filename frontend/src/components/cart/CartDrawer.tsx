import React, { useState } from 'react';
import { X, Trash2, Plus, Minus, Tag, ShoppingBag, ArrowRight, Pizza } from 'lucide-react';
import { useStore } from '../../store/useStore';

interface CartDrawerProps {
  onCheckout: () => void;
}

export const CartDrawer: React.FC<CartDrawerProps> = ({ onCheckout }) => {
  const {
    items,
    removeItem,
    updateQuantity,
    isCartOpen,
    setCartOpen,
    appliedCoupon,
    setCoupon,
    deliveryFee,
    getSubtotal,
    getTotal
  } = useStore();

  const [couponCode, setCouponCode] = useState('');
  const [couponError, setCouponError] = useState('');
  const [couponLoading, setCouponLoading] = useState(false);

  if (!isCartOpen) return null;

  const subtotal = getSubtotal();
  const total = getTotal();

  const handleApplyCoupon = async () => {
    if (!couponCode.trim()) return;
    setCouponLoading(true);
    setCouponError('');

    try {
      const res = await fetch('http://localhost:4000/api/orders/validate-coupon', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ code: couponCode, subtotal })
      });
      const data = await res.json();

      if (data.valid) {
        setCoupon({
          code: couponCode.toUpperCase(),
          discountAmount: data.discountAmount,
          discountValue: 0,
          discountType: 'PERCENTAGE'
        });
        setCouponCode('');
      } else {
        setCouponError(data.message || 'Cupom inválido ou não atingiu valor mínimo.');
      }
    } catch (err) {
      setCouponError('Erro ao validar cupom.');
    } finally {
      setCouponLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 overflow-hidden bg-black/75 backdrop-blur-sm flex justify-end">
      <div className="relative w-full max-w-md bg-wood-900 border-l border-stone-800 shadow-2xl flex flex-col h-full">
        
        {/* Drawer Header */}
        <div className="p-5 bg-wood-850 border-b border-stone-800 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded-xl bg-tomato-900/50 border border-tomato-500/40 text-tomato-400">
              <ShoppingBag className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-lg font-serif font-bold text-white">Sua Sacola</h2>
              <p className="text-xs text-stone-400">{items.length} {items.length === 1 ? 'item' : 'itens'}</p>
            </div>
          </div>
          <button
            onClick={() => setCartOpen(false)}
            className="p-2 rounded-lg text-stone-400 hover:text-white hover:bg-stone-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Items List */}
        <div className="flex-1 overflow-y-auto p-5 space-y-4">
          {items.length === 0 ? (
            <div className="h-full flex flex-col items-center justify-center text-center space-y-3">
              <Pizza className="w-14 h-14 text-stone-600 animate-pulse" />
              <h3 className="text-base font-serif font-bold text-stone-300">Sua sacola está vazia</h3>
              <p className="text-xs text-stone-500 max-w-xs">
                Escolha uma das nossas pizzas artesanais no cardápio ou monte uma receita exclusiva.
              </p>
            </div>
          ) : (
            items.map((item) => (
              <div
                key={item.id}
                className="bg-wood-950/70 border border-stone-800 rounded-xl p-4 flex flex-col justify-between space-y-3"
              >
                <div className="flex items-start justify-between gap-3">
                  <div className="space-y-0.5 flex-1">
                    <h4 className="text-sm font-bold text-stone-100">
                      {item.customConfig?.isHalfHalf
                        ? `1/2 ${item.customConfig.firstFlavorName} + 1/2 ${item.customConfig.secondFlavorName}`
                        : item.product?.name || 'Pizza Personalizada'}
                    </h4>
                    {item.customConfig?.variantName && (
                      <p className="text-xs text-amber-400 font-medium">
                        {item.customConfig.variantName}
                      </p>
                    )}
                    {item.customConfig?.crustType && item.customConfig.crustType !== 'Borda Tradicional Crocante' && (
                      <p className="text-[11px] text-stone-400">
                        Borda: {item.customConfig.crustType} (+R$ {item.customConfig.crustPrice?.toFixed(2)})
                      </p>
                    )}
                    {item.customConfig?.addedToppings && item.customConfig.addedToppings.length > 0 && (
                      <p className="text-[11px] text-emerald-400">
                        Extras: {item.customConfig.addedToppings.join(', ')}
                      </p>
                    )}
                    {item.notes && (
                      <p className="text-[11px] text-stone-400 italic">
                        Obs: "{item.notes}"
                      </p>
                    )}
                  </div>

                  <button
                    onClick={() => removeItem(item.id)}
                    className="text-stone-500 hover:text-red-400 transition-colors p-1"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>

                {/* Price and Quantity controls */}
                <div className="flex items-center justify-between pt-2 border-t border-stone-800/60">
                  <div className="flex items-center gap-2 bg-stone-900 border border-stone-700/80 rounded-lg p-0.5">
                    <button
                      onClick={() => updateQuantity(item.id, item.quantity - 1)}
                      className="p-1 rounded text-stone-400 hover:text-white hover:bg-stone-800"
                    >
                      <Minus className="w-3.5 h-3.5" />
                    </button>
                    <span className="w-6 text-center text-xs font-bold text-white">
                      {item.quantity}
                    </span>
                    <button
                      onClick={() => updateQuantity(item.id, item.quantity + 1)}
                      className="p-1 rounded text-stone-400 hover:text-white hover:bg-stone-800"
                    >
                      <Plus className="w-3.5 h-3.5" />
                    </button>
                  </div>

                  <span className="text-sm font-bold text-amber-400">
                    R$ {item.totalPrice.toFixed(2)}
                  </span>
                </div>
              </div>
            ))
          )}
        </div>

        {/* Drawer Footer with Coupon & Checkout */}
        {items.length > 0 && (
          <div className="p-5 bg-wood-850 border-t border-stone-800 space-y-4">
            
            {/* Coupon Input */}
            <div className="space-y-1">
              {appliedCoupon ? (
                <div className="flex items-center justify-between p-2.5 rounded-xl bg-emerald-950/60 border border-emerald-500/40 text-xs">
                  <span className="text-emerald-300 font-medium">
                    Cupom <strong>{appliedCoupon.code}</strong> aplicado (-R$ {appliedCoupon.discountAmount.toFixed(2)})
                  </span>
                  <button
                    onClick={() => setCoupon(null)}
                    className="text-stone-400 hover:text-red-400 text-xs font-bold"
                  >
                    Remover
                  </button>
                </div>
              ) : (
                <div className="flex gap-2">
                  <div className="relative flex-1">
                    <Tag className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-stone-500" />
                    <input
                      type="text"
                      value={couponCode}
                      onChange={(e) => setCouponCode(e.target.value.toUpperCase())}
                      placeholder="Cupom (ex: BEMVINDO10)"
                      className="w-full pl-9 pr-3 py-2 rounded-xl bg-stone-900 border border-stone-700 text-xs text-white uppercase placeholder-stone-500 focus:border-amber-500 focus:outline-none"
                    />
                  </div>
                  <button
                    onClick={handleApplyCoupon}
                    disabled={couponLoading}
                    className="px-4 py-2 rounded-xl bg-stone-800 hover:bg-stone-700 border border-stone-600 text-xs font-bold text-amber-300 transition-colors"
                  >
                    {couponLoading ? '...' : 'Aplicar'}
                  </button>
                </div>
              )}
              {couponError && <p className="text-[11px] text-red-400">{couponError}</p>}
            </div>

            {/* Financial Summary */}
            <div className="space-y-1.5 text-xs text-stone-300">
              <div className="flex justify-between">
                <span>Subtotal</span>
                <span>R$ {subtotal.toFixed(2)}</span>
              </div>
              <div className="flex justify-between">
                <span>Taxa de Entrega</span>
                <span>R$ {deliveryFee.toFixed(2)}</span>
              </div>
              {appliedCoupon && (
                <div className="flex justify-between text-emerald-400">
                  <span>Desconto</span>
                  <span>- R$ {appliedCoupon.discountAmount.toFixed(2)}</span>
                </div>
              )}
              <div className="pt-2 border-t border-stone-800 flex justify-between items-center text-base font-serif font-bold text-white">
                <span>Total a Pagar</span>
                <span className="text-xl text-amber-400">R$ {total.toFixed(2)}</span>
              </div>
            </div>

            {/* Checkout Button */}
            <button
              onClick={() => {
                setCartOpen(false);
                onCheckout();
              }}
              className="w-full py-3.5 px-4 rounded-xl bg-gradient-to-r from-tomato-700 to-tomato-600 hover:from-tomato-600 hover:to-tomato-500 active:scale-95 text-white font-bold text-sm shadow-glow-tomato transition-all flex items-center justify-center gap-2"
            >
              <span>Avançar para Checkout</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        )}
      </div>
    </div>
  );
};
