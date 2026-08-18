import React, { useState, useEffect } from 'react';
import { X, Check, ChefHat, Plus, Minus, Sparkles, Layers, Info } from 'lucide-react';
import { useStore } from '../../store/useStore';
import { Ingredient, Product } from '../../types';

interface GroupedIngredients {
  BASE: Ingredient[];
  SAUCE: Ingredient[];
  CHEESE: Ingredient[];
  PROTEIN: Ingredient[];
  VEGGIE: Ingredient[];
  CRUST: Ingredient[];
}

export const PizzaCustomizer: React.FC = () => {
  const { isCustomizerOpen, setCustomizerOpen, addItem } = useStore();

  const [loading, setLoading] = useState(true);
  const [ingredients, setIngredients] = useState<GroupedIngredients>({
    BASE: [],
    SAUCE: [],
    CHEESE: [],
    PROTEIN: [],
    VEGGIE: [],
    CRUST: []
  });
  const [availablePizzas, setAvailablePizzas] = useState<Product[]>([]);

  // Selection states
  const [size, setSize] = useState<'P' | 'M' | 'G' | 'FAMILIA'>('M');
  const [isHalfHalf, setIsHalfHalf] = useState(false);
  const [firstFlavor, setFirstFlavor] = useState<Product | null>(null);
  const [secondFlavor, setSecondFlavor] = useState<Product | null>(null);
  const [selectedBase, setSelectedBase] = useState<Ingredient | null>(null);
  const [selectedCrust, setSelectedCrust] = useState<Ingredient | null>(null);
  const [selectedSauce, setSelectedSauce] = useState<Ingredient | null>(null);
  const [selectedCheese, setSelectedCheese] = useState<Ingredient | null>(null);
  const [extraToppings, setExtraToppings] = useState<Ingredient[]>([]);
  const [removedToppings, setRemovedToppings] = useState<string[]>([]);
  const [notes, setNotes] = useState('');

  // Fetch ingredients from API
  useEffect(() => {
    if (!isCustomizerOpen) return;

    fetch('http://localhost:4000/api/customizer/ingredients')
      .then((res) => res.json())
      .then((data) => {
        if (data.grouped) {
          setIngredients(data.grouped);
          if (data.grouped.BASE.length > 0) setSelectedBase(data.grouped.BASE[0]);
          if (data.grouped.CRUST.length > 0) setSelectedCrust(data.grouped.CRUST[0]);
          if (data.grouped.SAUCE.length > 0) setSelectedSauce(data.grouped.SAUCE[0]);
          if (data.grouped.CHEESE.length > 0) setSelectedCheese(data.grouped.CHEESE[0]);
        }
        if (data.pizzasForHalfHalf && data.pizzasForHalfHalf.length > 0) {
          setAvailablePizzas(data.pizzasForHalfHalf);
          setFirstFlavor(data.pizzasForHalfHalf[0]);
          setSecondFlavor(data.pizzasForHalfHalf[1] || data.pizzasForHalfHalf[0]);
        }
        setLoading(false);
      })
      .catch((err) => {
        console.error('Erro ao carregar ingredientes:', err);
        setLoading(false);
      });
  }, [isCustomizerOpen]);

  if (!isCustomizerOpen) return null;

  // Size multipliers & info
  const sizeConfig = {
    P: { label: 'Individual (25cm)', slices: 4, multiplier: 0.75 },
    M: { label: 'Média (30cm)', slices: 6, multiplier: 1.0 },
    G: { label: 'Grande (35cm)', slices: 8, multiplier: 1.3 },
    FAMILIA: { label: 'Família (40cm)', slices: 12, multiplier: 1.6 }
  };

  // Calculate live total price
  const calculatePrice = () => {
    let basePrice = 55.0; // fallback base

    if (isHalfHalf) {
      const p1 = firstFlavor?.basePrice || 55.0;
      const p2 = secondFlavor?.basePrice || 55.0;
      basePrice = Math.max(p1, p2);
    } else if (firstFlavor) {
      basePrice = firstFlavor.basePrice;
    }

    const multiplier = sizeConfig[size].multiplier;
    const baseFlavorScaled = basePrice * multiplier;
    const baseExtra = selectedBase?.price || 0;
    const crustExtra = selectedCrust?.price || 0;
    const sauceExtra = selectedSauce?.price || 0;
    const cheeseExtra = selectedCheese?.price || 0;
    const extrasTotal = extraToppings.reduce((sum, item) => sum + item.price, 0);

    const total = baseFlavorScaled + baseExtra + crustExtra + sauceExtra + cheeseExtra + extrasTotal;
    return Math.round(total * 100) / 100;
  };

  const handleToggleExtra = (ing: Ingredient) => {
    const exists = extraToppings.find((i) => i.id === ing.id);
    if (exists) {
      setExtraToppings(extraToppings.filter((i) => i.id !== ing.id));
    } else {
      setExtraToppings([...extraToppings, ing]);
    }
  };

  const handleAddToCart = () => {
    const finalPrice = calculatePrice();
    const configName = isHalfHalf
      ? `Meio a Meio: 1/2 ${firstFlavor?.name || 'Sabor 1'} + 1/2 ${secondFlavor?.name || 'Sabor 2'}`
      : firstFlavor?.name || 'Pizza Personalizada';

    addItem({
      product: firstFlavor || undefined,
      quantity: 1,
      unitPrice: finalPrice,
      customConfig: {
        isHalfHalf,
        firstFlavorName: firstFlavor?.name,
        secondFlavorName: isHalfHalf ? secondFlavor?.name : undefined,
        firstFlavorPrice: firstFlavor?.basePrice,
        secondFlavorPrice: secondFlavor?.basePrice,
        doughType: selectedBase?.name,
        crustType: selectedCrust?.name,
        crustPrice: selectedCrust?.price,
        addedToppings: extraToppings.map((t) => t.name),
        removedToppings,
        variantName: sizeConfig[size].label
      },
      notes: notes.trim() || undefined
    });

    setCustomizerOpen(false);
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-black/80 backdrop-blur-md flex items-center justify-center p-3 sm:p-6">
      <div className="relative w-full max-w-4xl bg-wood-900 border border-amber-500/30 rounded-2xl shadow-2xl overflow-hidden flex flex-col max-h-[92vh]">
        
        {/* Header */}
        <div className="px-6 py-4 bg-wood-850 border-b border-stone-800 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-xl bg-tomato-900/50 border border-tomato-500/40 text-tomato-400">
              <ChefHat className="w-6 h-6" />
            </div>
            <div>
              <h2 className="text-xl font-serif font-bold text-stone-100">Monte sua Pizza Artesanal</h2>
              <p className="text-xs text-stone-400">Personalize massa, borda, sabores e adicionais ao vivo</p>
            </div>
          </div>
          <button
            onClick={() => setCustomizerOpen(false)}
            className="p-2 rounded-lg text-stone-400 hover:text-white hover:bg-stone-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content Body */}
        <div className="flex-1 overflow-y-auto p-6 grid grid-cols-1 lg:grid-cols-12 gap-8">
          
          {/* Left Column: Visual Pizza Canvas Preview */}
          <div className="lg:col-span-5 flex flex-col items-center justify-center bg-wood-950/60 p-6 rounded-xl border border-stone-800/80">
            <div className="relative w-56 h-56 sm:w-64 sm:h-64 flex items-center justify-center">
              
              {/* Outer Golden Crust Border */}
              <div
                className={`w-full h-full rounded-full border-[10px] shadow-2xl flex items-center justify-center transition-all duration-300 ${
                  selectedCrust?.price && selectedCrust.price > 0
                    ? 'border-amber-600 ring-4 ring-amber-400/40 shadow-glow-gold'
                    : 'border-amber-800'
                }`}
                style={{
                  background: 'radial-gradient(circle, #78350f 0%, #451a03 100%)'
                }}
              >
                {/* Pizza Sauce & Base Layer */}
                <div className="w-[90%] h-[90%] rounded-full bg-tomato-700 relative overflow-hidden flex shadow-inner">
                  
                  {/* Left Half */}
                  <div
                    className={`w-1/2 h-full transition-all duration-300 relative ${
                      isHalfHalf ? 'bg-amber-100/90' : 'w-full bg-amber-100/90'
                    }`}
                  >
                    {/* Cheese melt pattern */}
                    <div className="absolute inset-0 bg-yellow-200/40 mix-blend-color-dodge"></div>
                    
                    {/* Toppings visual icons Left */}
                    <div className="absolute inset-0 p-2 flex flex-wrap gap-1.5 items-center justify-center opacity-90">
                      <span className="w-3.5 h-3.5 rounded-full bg-red-600 shadow-sm animate-pulse"></span>
                      <span className="w-2.5 h-2.5 rounded-sm bg-emerald-600 rotate-12"></span>
                      <span className="w-3.5 h-3.5 rounded-full bg-red-700"></span>
                      <span className="w-2 h-2 rounded-full bg-amber-500"></span>
                    </div>

                    <div className="absolute bottom-2 left-2 px-2 py-0.5 rounded bg-black/60 text-[10px] font-bold text-amber-300 truncate max-w-[90px]">
                      {firstFlavor?.name || 'Sabor 1'}
                    </div>
                  </div>

                  {/* Right Half (If Meio a Meio) */}
                  {isHalfHalf && (
                    <div className="w-1/2 h-full bg-amber-200/80 border-l border-amber-900/40 relative">
                      <div className="absolute inset-0 p-2 flex flex-wrap gap-1.5 items-center justify-center opacity-90">
                        <span className="w-3 h-3 rounded-full bg-rose-700"></span>
                        <span className="w-2.5 h-2.5 rounded-sm bg-emerald-700 rotate-45"></span>
                        <span className="w-3.5 h-3.5 rounded-full bg-orange-600"></span>
                      </div>
                      <div className="absolute bottom-2 right-2 px-2 py-0.5 rounded bg-black/60 text-[10px] font-bold text-amber-300 truncate max-w-[90px]">
                        {secondFlavor?.name || 'Sabor 2'}
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </div>

            {/* Visual Specs summary */}
            <div className="mt-4 text-center space-y-1">
              <span className="inline-block px-3 py-1 rounded-full bg-amber-900/40 text-amber-300 text-xs font-semibold border border-amber-500/20">
                {sizeConfig[size].label} • {sizeConfig[size].slices} Fatias
              </span>
              <p className="text-xs text-stone-400">
                {selectedCrust?.name !== 'Borda Tradicional Crocante (Sem recheio)'
                  ? `Com ${selectedCrust?.name}`
                  : 'Borda Tradicional'}
              </p>
            </div>
          </div>

          {/* Right Column: Customization Controls */}
          <div className="lg:col-span-7 space-y-6">
            
            {/* Step 1: Size Selection */}
            <div>
              <label className="text-xs font-bold text-amber-400 uppercase tracking-wider block mb-2">
                1. Escolha o Tamanho
              </label>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                {(['P', 'M', 'G', 'FAMILIA'] as const).map((s) => (
                  <button
                    key={s}
                    onClick={() => setSize(s)}
                    className={`py-2.5 px-3 rounded-xl border text-center transition-all ${
                      size === s
                        ? 'border-amber-500 bg-amber-500/20 text-white font-bold shadow-glow-gold'
                        : 'border-stone-800 bg-stone-900/60 text-stone-300 hover:border-stone-700'
                    }`}
                  >
                    <div className="text-xs">{sizeConfig[s].label.split(' ')[0]}</div>
                    <div className="text-[10px] text-stone-400">{sizeConfig[s].slices} fatias</div>
                  </button>
                ))}
              </div>
            </div>

            {/* Step 2: Flavors (1 flavor vs Meio a Meio) */}
            <div>
              <div className="flex items-center justify-between mb-2">
                <label className="text-xs font-bold text-amber-400 uppercase tracking-wider">
                  2. Sabores da Pizza
                </label>
                <button
                  type="button"
                  onClick={() => setIsHalfHalf(!isHalfHalf)}
                  className={`text-xs px-3 py-1 rounded-full border transition-all flex items-center gap-1.5 ${
                    isHalfHalf
                      ? 'bg-tomato-600 text-white border-tomato-400 shadow-glow-tomato font-bold'
                      : 'bg-stone-800 text-stone-300 border-stone-700 hover:border-amber-500'
                  }`}
                >
                  <Layers className="w-3.5 h-3.5" />
                  <span>{isHalfHalf ? 'Dividida Meio a Meio ✓' : 'Fazer Meio a Meio?'}</span>
                </button>
              </div>

              {/* 1st Flavor Dropdown */}
              <div className="space-y-2">
                <div>
                  <label className="text-xs text-stone-400 block mb-1">
                    {isHalfHalf ? '1º Sabor (Metade 1):' : 'Sabor Principal:'}
                  </label>
                  <select
                    value={firstFlavor?.id || ''}
                    onChange={(e) => {
                      const found = availablePizzas.find((p) => p.id === e.target.value);
                      if (found) setFirstFlavor(found);
                    }}
                    className="w-full bg-stone-900 border border-stone-700 rounded-xl px-3 py-2 text-sm text-stone-100 focus:border-amber-500 focus:outline-none"
                  >
                    {availablePizzas.map((p) => (
                      <option key={p.id} value={p.id}>
                        {p.name} — R$ {p.basePrice.toFixed(2)}
                      </option>
                    ))}
                  </select>
                </div>

                {/* 2nd Flavor Dropdown (If Meio a Meio) */}
                {isHalfHalf && (
                  <div className="pt-1">
                    <label className="text-xs text-stone-400 block mb-1">2º Sabor (Metade 2):</label>
                    <select
                      value={secondFlavor?.id || ''}
                      onChange={(e) => {
                        const found = availablePizzas.find((p) => p.id === e.target.value);
                        if (found) setSecondFlavor(found);
                      }}
                      className="w-full bg-stone-900 border border-stone-700 rounded-xl px-3 py-2 text-sm text-stone-100 focus:border-amber-500 focus:outline-none"
                    >
                      {availablePizzas.map((p) => (
                        <option key={p.id} value={p.id}>
                          {p.name} — R$ {p.basePrice.toFixed(2)}
                        </option>
                      ))}
                    </select>
                    <p className="text-[11px] text-amber-400/80 mt-1 flex items-center gap-1">
                      <Info className="w-3.5 h-3.5" />
                      <span>Preço cobrado pela metade de maior valor (Regra tradicional napolitana).</span>
                    </p>
                  </div>
                )}
              </div>
            </div>

            {/* Step 3: Filled Crust Options */}
            <div>
              <label className="text-xs font-bold text-amber-400 uppercase tracking-wider block mb-2">
                3. Borda Recheada Especial
              </label>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                {ingredients.CRUST.map((c) => (
                  <button
                    key={c.id}
                    onClick={() => setSelectedCrust(c)}
                    className={`p-2.5 rounded-xl border text-left flex items-center justify-between transition-all ${
                      selectedCrust?.id === c.id
                        ? 'border-amber-500 bg-amber-500/20 text-white font-medium'
                        : 'border-stone-800 bg-stone-900/60 text-stone-300 hover:border-stone-700'
                    }`}
                  >
                    <span className="text-xs truncate">{c.name}</span>
                    <span className="text-xs font-bold text-amber-400">
                      {c.price > 0 ? `+R$ ${c.price.toFixed(2)}` : 'Inclusa'}
                    </span>
                  </button>
                ))}
              </div>
            </div>

            {/* Step 4: Extra Toppings / Adicionais */}
            <div>
              <label className="text-xs font-bold text-amber-400 uppercase tracking-wider block mb-2">
                4. Adicionais Nobres
              </label>
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                {[...ingredients.CHEESE, ...ingredients.PROTEIN, ...ingredients.VEGGIE].slice(0, 6).map((ing) => {
                  const isSelected = extraToppings.some((i) => i.id === ing.id);
                  return (
                    <button
                      key={ing.id}
                      onClick={() => handleToggleExtra(ing)}
                      className={`p-2 rounded-xl border text-left flex flex-col justify-between transition-all ${
                        isSelected
                          ? 'border-emerald-500 bg-emerald-950/40 text-white'
                          : 'border-stone-800 bg-stone-900/60 text-stone-400 hover:border-stone-700'
                      }`}
                    >
                      <div className="flex items-center justify-between">
                        <span className="text-xs font-medium truncate">{ing.name}</span>
                        {isSelected ? (
                          <Check className="w-3.5 h-3.5 text-emerald-400" />
                        ) : (
                          <Plus className="w-3.5 h-3.5 text-stone-500" />
                        )}
                      </div>
                      <span className="text-[11px] font-bold text-amber-400/90 mt-1">
                        +R$ {ing.price.toFixed(2)}
                      </span>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Step 5: Observations / Notes */}
            <div>
              <label className="text-xs font-bold text-stone-400 uppercase tracking-wider block mb-1">
                Observações para o Pizzaiolo
              </label>
              <input
                type="text"
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                placeholder="Ex: Massa bem tostadinha, sem orégano, caprichar no azeite..."
                className="w-full bg-stone-900 border border-stone-700 rounded-xl px-3 py-2 text-xs text-stone-200 placeholder-stone-500 focus:border-amber-500 focus:outline-none"
              />
            </div>
          </div>
        </div>

        {/* Footer: Live Price & Add to Cart */}
        <div className="px-6 py-4 bg-wood-850 border-t border-stone-800 flex flex-col sm:flex-row items-center justify-between gap-4">
          <div>
            <span className="text-xs text-stone-400 block">Total da Pizza Personalizada</span>
            <div className="text-2xl font-serif font-black text-amber-400">
              R$ {calculatePrice().toFixed(2)}
            </div>
          </div>

          <button
            onClick={handleAddToCart}
            className="w-full sm:w-auto px-8 py-3.5 rounded-xl bg-gradient-to-r from-tomato-700 to-tomato-600 hover:from-tomato-600 hover:to-tomato-500 text-white font-bold text-sm shadow-glow-tomato hover:scale-105 active:scale-95 transition-all flex items-center justify-center gap-2"
          >
            <Sparkles className="w-4 h-4 text-amber-300" />
            <span>Adicionar ao Pedido</span>
          </button>
        </div>
      </div>
    </div>
  );
};
