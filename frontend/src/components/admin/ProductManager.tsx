import React, { useState, useEffect } from 'react';
import { Plus, Edit2, Trash2, Check, X, Pizza } from 'lucide-react';
import { Product, Category } from '../../types';

interface ProductManagerProps {
  onRefresh: () => void;
}

export const ProductManager: React.FC<ProductManagerProps> = ({ onRefresh }) => {
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [showAddModal, setShowAddModal] = useState(false);

  const [name, setName] = useState('');
  const [slug, setSlug] = useState('');
  const [description, setDescription] = useState('');
  const [basePrice, setBasePrice] = useState(59.9);
  const [categoryId, setCategoryId] = useState('');
  const [image, setImage] = useState('https://images.unsplash.com/photo-1604382354936-07c5d9983bd3?auto=format&fit=crop&w=800&q=80');

  const fetchMenu = async () => {
    try {
      const res = await fetch('http://localhost:4000/api/menu');
      const data = await res.json();
      if (data.categories) {
        setCategories(data.categories);
        if (data.categories.length > 0 && !categoryId) {
          setCategoryId(data.categories[0].id);
        }
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchMenu();
  }, []);

  const handleCreateProduct = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const res = await fetch('http://localhost:4000/api/admin/products', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer mock-admin-token`
        },
        body: JSON.stringify({
          name,
          slug: slug || name.toLowerCase().replace(/\s+/g, '-').replace(/[^\w-]/g, ''),
          description,
          basePrice: Number(basePrice),
          categoryId,
          image,
          variants: [
            { name: 'Média (6 Fatias - 30cm)', sizeSlices: 6, priceMultiplier: 1.0, isDefault: true },
            { name: 'Grande (8 Fatias - 35cm)', sizeSlices: 8, priceMultiplier: 1.3, isDefault: false }
          ]
        })
      });

      if (res.ok) {
        setShowAddModal(false);
        fetchMenu();
        onRefresh();
      }
    } catch (err) {
      console.error(err);
    }
  };

  return (
    <div className="bg-stone-900 border border-stone-800 rounded-2xl p-6 shadow-card-dark space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-lg font-serif font-bold text-white">Gerenciar Produtos do Cardápio</h2>
          <p className="text-xs text-stone-400">Edite, pause ou adicione novos sabores ao cardápio da pizzaria</p>
        </div>

        <button
          onClick={() => setShowAddModal(true)}
          className="px-4 py-2 rounded-xl bg-amber-500 hover:bg-amber-400 text-black font-bold text-xs flex items-center gap-2 shadow-glow-gold transition-all"
        >
          <Plus className="w-4 h-4" />
          <span>Novo Produto</span>
        </button>
      </div>

      {loading ? (
        <div className="text-center py-8 text-stone-400 text-xs">Carregando...</div>
      ) : (
        <div className="space-y-6">
          {categories.map((cat) => (
            <div key={cat.id} className="space-y-3">
              <h3 className="text-sm font-bold text-amber-400 uppercase tracking-wider border-b border-stone-800 pb-1">
                {cat.name} ({cat.products.length})
              </h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                {cat.products.map((p) => (
                  <div
                    key={p.id}
                    className="p-4 rounded-xl bg-stone-950 border border-stone-800 flex items-center justify-between gap-3"
                  >
                    <img src={p.image} alt={p.name} className="w-12 h-12 rounded-lg object-cover" />
                    <div className="flex-1 min-w-0">
                      <h4 className="text-xs font-bold text-white truncate">{p.name}</h4>
                      <p className="text-[11px] text-amber-400 font-medium">R$ {p.basePrice.toFixed(2)}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Add Product Modal */}
      {showAddModal && (
        <div className="fixed inset-0 z-50 overflow-y-auto bg-black/80 backdrop-blur-md flex items-center justify-center p-4">
          <div className="relative w-full max-w-lg bg-stone-900 border border-stone-700 rounded-2xl p-6 space-y-4 shadow-2xl">
            <div className="flex items-center justify-between border-b border-stone-800 pb-3">
              <h3 className="text-lg font-serif font-bold text-white">Adicionar Novo Produto</h3>
              <button onClick={() => setShowAddModal(false)} className="text-stone-400 hover:text-white">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleCreateProduct} className="space-y-3 text-xs">
              <div>
                <label className="text-stone-400 block mb-1">Nome do Produto:</label>
                <input
                  type="text"
                  required
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="Ex: Pizza Tartufo Speciale"
                  className="w-full bg-stone-950 border border-stone-800 rounded-xl p-2.5 text-white focus:border-amber-500 focus:outline-none"
                />
              </div>

              <div>
                <label className="text-stone-400 block mb-1">Categoria:</label>
                <select
                  value={categoryId}
                  onChange={(e) => setCategoryId(e.target.value)}
                  className="w-full bg-stone-950 border border-stone-800 rounded-xl p-2.5 text-white focus:border-amber-500 focus:outline-none"
                >
                  {categories.map((c) => (
                    <option key={c.id} value={c.id}>
                      {c.name}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="text-stone-400 block mb-1">Preço Base (R$):</label>
                <input
                  type="number"
                  step="0.10"
                  required
                  value={basePrice}
                  onChange={(e) => setBasePrice(Number(e.target.value))}
                  className="w-full bg-stone-950 border border-stone-800 rounded-xl p-2.5 text-white focus:border-amber-500 focus:outline-none"
                />
              </div>

              <div>
                <label className="text-stone-400 block mb-1">Descrição / Ingredientes:</label>
                <textarea
                  required
                  rows={2}
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  placeholder="Ingredientes nobres, queijo, molho..."
                  className="w-full bg-stone-950 border border-stone-800 rounded-xl p-2.5 text-white focus:border-amber-500 focus:outline-none"
                ></textarea>
              </div>

              <div className="pt-3 border-t border-stone-800 flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setShowAddModal(false)}
                  className="px-4 py-2 rounded-xl bg-stone-800 text-stone-300 font-bold"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-xl bg-amber-500 text-black font-bold shadow-glow-gold"
                >
                  Salvar Produto
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
