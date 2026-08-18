import React, { useState, useEffect } from 'react';
import { Search, Sparkles, ChefHat, Flame, Leaf, Pizza, Utensils } from 'lucide-react';
import { Category, Product } from '../../types';
import { ProductCard } from './ProductCard';
import { ProductModal } from './ProductModal';
import { useStore } from '../../store/useStore';
import { INITIAL_CATEGORIES } from '../../data/mockMenuData';

export const MenuSection: React.FC = () => {
  const [categories, setCategories] = useState<Category[]>(INITIAL_CATEGORIES);
  const [activeCategory, setActiveCategory] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [filterVeg, setFilterVeg] = useState(false);
  const [filterSpicy, setFilterSpicy] = useState(false);
  const [filterChef, setFilterChef] = useState(false);
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
  const [loading, setLoading] = useState(false);

  const { setCustomizerOpen } = useStore();

  useEffect(() => {
    fetch('http://localhost:4000/api/menu')
      .then((res) => res.json())
      .then((data) => {
        if (data.categories && data.categories.length > 0) {
          setCategories(data.categories);
        }
      })
      .catch((err) => {
        // Fallback already initialized with rich categories & photos
      });
  }, []);

  // Filter products
  const getAllProducts = () => {
    let list: Product[] = [];
    categories.forEach((c) => {
      if (activeCategory === 'all' || activeCategory === c.slug) {
        list = [...list, ...c.products];
      }
    });

    return list.filter((p) => {
      const matchSearch =
        p.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        p.description.toLowerCase().includes(searchQuery.toLowerCase());
      const matchVeg = !filterVeg || p.isVegetarian;
      const matchSpicy = !filterSpicy || p.isSpicy;
      const matchChef = !filterChef || p.isChefSpecial;
      return matchSearch && matchVeg && matchSpicy && matchChef;
    });
  };

  const filteredProducts = getAllProducts();

  return (
    <section id="cardapio-section" className="py-20 bg-wood-950 text-stone-100 relative">
      <div className="container mx-auto px-4 md:px-8 max-w-7xl">
        
        {/* Section Header */}
        <div className="text-center space-y-4 max-w-2xl mx-auto mb-12">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-amber-900/30 border border-amber-500/20 text-amber-400 text-xs font-semibold">
            <Utensils className="w-3.5 h-3.5" />
            <span>Cardápio Artesanal 2026</span>
          </div>

          <h2 className="text-3xl sm:text-4xl md:text-5xl font-serif font-bold text-white tracking-tight">
            Nossos Sabores <span className="gold-gradient-text">Consagrados</span>
          </h2>

          <p className="text-sm sm:text-base text-stone-400 font-light">
            Feitas individualmente à mão com farinha italiana 00, assadas em alta temperatura com lenha nobre.
          </p>
        </div>

        {/* Customizer Promotional Banner */}
        <div className="mb-12 bg-gradient-to-r from-tomato-900/60 via-wood-900 to-amber-950/60 border border-amber-500/30 rounded-2xl p-6 sm:p-8 flex flex-col md:flex-row items-center justify-between gap-6 shadow-glow-gold relative overflow-hidden">
          <div className="space-y-2 text-center md:text-left z-10">
            <div className="inline-flex items-center gap-1.5 text-xs font-bold text-amber-400 uppercase tracking-wider">
              <Sparkles className="w-4 h-4" />
              <span>Experiência Exclusiva</span>
            </div>
            <h3 className="text-2xl sm:text-3xl font-serif font-bold text-white">
              Quer combinar sabores ou criar sua própria receita?
            </h3>
            <p className="text-xs sm:text-sm text-stone-300 max-w-xl">
              Monte sua pizza em tempo real com metades diferentes, bordas vulcão recheadas e ingredientes artesanais sob medida.
            </p>
          </div>

          <button
            onClick={() => setCustomizerOpen(true)}
            className="z-10 whitespace-nowrap px-8 py-4 rounded-xl bg-amber-500 hover:bg-amber-400 text-black font-black text-sm tracking-wide shadow-glow-gold hover:scale-105 active:scale-95 transition-all flex items-center gap-2"
          >
            <ChefHat className="w-5 h-5" />
            <span>Abrir Montador de Pizza</span>
          </button>
        </div>

        {/* Search and Filters Bar */}
        <div className="space-y-4 mb-8">
          
          {/* Category Tabs */}
          <div className="flex items-center gap-2 overflow-x-auto pb-2 scrollbar-none">
            <button
              onClick={() => setActiveCategory('all')}
              className={`px-5 py-2.5 rounded-xl text-xs sm:text-sm font-semibold whitespace-nowrap transition-all ${
                activeCategory === 'all'
                  ? 'bg-amber-500 text-black font-bold shadow-glow-gold'
                  : 'bg-stone-900 text-stone-300 border border-stone-800 hover:border-stone-700'
              }`}
            >
              Todos os Produtos
            </button>
            {categories.map((c) => (
              <button
                key={c.id}
                onClick={() => setActiveCategory(c.slug)}
                className={`px-5 py-2.5 rounded-xl text-xs sm:text-sm font-semibold whitespace-nowrap transition-all ${
                  activeCategory === c.slug
                    ? 'bg-amber-500 text-black font-bold shadow-glow-gold'
                    : 'bg-stone-900 text-stone-300 border border-stone-800 hover:border-stone-700'
                }`}
              >
                {c.name}
              </button>
            ))}
          </div>

          {/* Search Input & Dietary Toggles */}
          <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
            
            {/* Search Input */}
            <div className="relative w-full sm:w-80">
              <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-stone-500" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Buscar pizza, ingrediente..."
                className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-stone-900/90 border border-stone-800 text-xs text-stone-200 placeholder-stone-500 focus:border-amber-500 focus:outline-none"
              />
            </div>

            {/* Dietary Tags Filter */}
            <div className="flex items-center gap-2 w-full sm:w-auto overflow-x-auto">
              <button
                onClick={() => setFilterChef(!filterChef)}
                className={`px-3 py-1.5 rounded-lg text-xs font-semibold flex items-center gap-1.5 border transition-all ${
                  filterChef
                    ? 'bg-amber-500/20 text-amber-300 border-amber-500 shadow-sm'
                    : 'bg-stone-900 text-stone-400 border-stone-800'
                }`}
              >
                <Sparkles className="w-3.5 h-3.5" />
                <span>Chef Special</span>
              </button>

              <button
                onClick={() => setFilterVeg(!filterVeg)}
                className={`px-3 py-1.5 rounded-lg text-xs font-semibold flex items-center gap-1.5 border transition-all ${
                  filterVeg
                    ? 'bg-emerald-950 text-emerald-300 border-emerald-500 shadow-sm'
                    : 'bg-stone-900 text-stone-400 border-stone-800'
                }`}
              >
                <Leaf className="w-3.5 h-3.5" />
                <span>Vegetariana</span>
              </button>

              <button
                onClick={() => setFilterSpicy(!filterSpicy)}
                className={`px-3 py-1.5 rounded-lg text-xs font-semibold flex items-center gap-1.5 border transition-all ${
                  filterSpicy
                    ? 'bg-red-950 text-red-300 border-red-500 shadow-sm'
                    : 'bg-stone-900 text-stone-400 border-stone-800'
                }`}
              >
                <Flame className="w-3.5 h-3.5" />
                <span>Picante</span>
              </button>
            </div>
          </div>
        </div>

        {/* Product Grid */}
        {loading ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {[1, 2, 3, 4, 5, 6].map((n) => (
              <div
                key={n}
                className="h-80 rounded-2xl bg-stone-900/60 border border-stone-800 animate-pulse"
              ></div>
            ))}
          </div>
        ) : filteredProducts.length === 0 ? (
          <div className="text-center py-16 bg-stone-900/40 rounded-2xl border border-stone-800 space-y-3">
            <Pizza className="w-12 h-12 text-stone-600 mx-auto" />
            <h3 className="text-lg font-serif font-bold text-stone-300">Nenhuma pizza encontrada</h3>
            <p className="text-xs text-stone-500">Tente ajustar seus termos de busca ou filtros.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredProducts.map((p) => (
              <ProductCard
                key={p.id}
                product={p}
                onSelect={(prod) => setSelectedProduct(prod)}
              />
            ))}
          </div>
        )}
      </div>

      {/* Product Detail Modal */}
      <ProductModal
        product={selectedProduct}
        onClose={() => setSelectedProduct(null)}
      />
    </section>
  );
};
