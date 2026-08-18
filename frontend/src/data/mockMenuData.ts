import { Category, Product, Ingredient } from '../types';

export const INITIAL_CATEGORIES: Category[] = [
  {
    id: 'cat-trad',
    name: 'Pizzas Tradicionais',
    slug: 'tradicionais',
    description: 'Os clássicos italianos preparados com farinha 00 e fermentação 48h.',
    sortOrder: 1,
    products: [
      {
        id: 'prod-1',
        categoryId: 'cat-trad',
        name: 'Margherita Di Bufala D.O.P.',
        slug: 'margherita-di-bufala',
        description: 'Molho de tomate San Marzano D.O.P., mussarela de búfala fresca, folhas de manjericão gigante e azeite extravirgem italiano.',
        basePrice: 59.9,
        image: 'https://images.unsplash.com/photo-1604382354936-07c5d9983bd3?auto=format&fit=crop&w=800&q=80',
        isCustomizable: true,
        isVegetarian: true,
        isSpicy: false,
        isChefSpecial: true,
        isAvailable: true,
        ingredients: 'Molho San Marzano, Mussarela de Búfala, Manjericão Fresco, Azeite Extravirgem',
        variants: [
          { id: 'v1', name: 'Individual (4 Fatias - 25cm)', sizeSlices: 4, priceMultiplier: 0.75, isDefault: false },
          { id: 'v2', name: 'Média (6 Fatias - 30cm)', sizeSlices: 6, priceMultiplier: 1.0, isDefault: true },
          { id: 'v3', name: 'Grande (8 Fatias - 35cm)', sizeSlices: 8, priceMultiplier: 1.3, isDefault: false },
          { id: 'v4', name: 'Família (12 Fatias - 40cm)', sizeSlices: 12, priceMultiplier: 1.6, isDefault: false }
        ]
      },
      {
        id: 'prod-2',
        categoryId: 'cat-trad',
        name: 'Calabresa Artesanal & Cebola Caramelizada',
        slug: 'calabresa-artesanal',
        description: 'Calabresa artesanal defumada em lenha nobre, lâminas de cebola roxa caramelizada no vinho tinto e orégano fresco.',
        basePrice: 54.9,
        image: 'https://images.unsplash.com/photo-1534308983496-4fabb1a015ee?auto=format&fit=crop&w=800&q=80',
        isCustomizable: true,
        isVegetarian: false,
        isSpicy: false,
        isChefSpecial: false,
        isAvailable: true,
        ingredients: 'Molho Pomodoro, Mussarela, Calabresa Artesanal Defumada, Cebola Roxa, Orégano',
        variants: [
          { id: 'v5', name: 'Individual (4 Fatias - 25cm)', sizeSlices: 4, priceMultiplier: 0.75, isDefault: false },
          { id: 'v6', name: 'Média (6 Fatias - 30cm)', sizeSlices: 6, priceMultiplier: 1.0, isDefault: true },
          { id: 'v7', name: 'Grande (8 Fatias - 35cm)', sizeSlices: 8, priceMultiplier: 1.3, isDefault: false },
          { id: 'v8', name: 'Família (12 Fatias - 40cm)', sizeSlices: 12, priceMultiplier: 1.6, isDefault: false }
        ]
      },
      {
        id: 'prod-5',
        categoryId: 'cat-trad',
        name: 'Frango Nobre com Catupiry Original',
        slug: 'frango-com-catupiry',
        description: 'Peito de frango desfiado com ervas finas, alho-poró salteado e generosa camada de Catupiry Original D.O.C.',
        basePrice: 58.9,
        image: 'https://images.unsplash.com/photo-1565299624946-b28f40a0ae38?auto=format&fit=crop&w=800&q=80',
        isCustomizable: true,
        isVegetarian: false,
        isSpicy: false,
        isChefSpecial: false,
        isAvailable: true,
        ingredients: 'Molho Pomodoro, Frango Desfiado com Ervas, Catupiry Original, Milho Doce, Orégano',
        variants: [
          { id: 'v9', name: 'Média (6 Fatias - 30cm)', sizeSlices: 6, priceMultiplier: 1.0, isDefault: true },
          { id: 'v10', name: 'Grande (8 Fatias - 35cm)', sizeSlices: 8, priceMultiplier: 1.3, isDefault: false }
        ]
      }
    ]
  },
  {
    id: 'cat-spec',
    name: 'Pizzas Especiais do Chef',
    slug: 'especiais',
    description: 'Criações exclusivas com ingredientes nobres importados da Itália.',
    sortOrder: 2,
    products: [
      {
        id: 'prod-3',
        categoryId: 'cat-spec',
        name: 'Quattro Formaggi Trufada',
        slug: 'quattro-formaggi-trufada',
        description: 'Blend de Mussarela Fior di Latte, Gorgonzola Dolce, Fontina, Parmigiano Reggiano 24M e azeite trufado.',
        basePrice: 69.9,
        image: 'https://images.unsplash.com/photo-1513104890138-7c749659a591?auto=format&fit=crop&w=800&q=80',
        isCustomizable: true,
        isVegetarian: true,
        isSpicy: false,
        isChefSpecial: true,
        isAvailable: true,
        ingredients: 'Fior di Latte, Gorgonzola Dolce, Fontina, Parmesão 24M, Azeite de Trufas Brancas',
        variants: [
          { id: 'v11', name: 'Média (6 Fatias - 30cm)', sizeSlices: 6, priceMultiplier: 1.0, isDefault: true },
          { id: 'v12', name: 'Grande (8 Fatias - 35cm)', sizeSlices: 8, priceMultiplier: 1.3, isDefault: false }
        ]
      },
      {
        id: 'prod-4',
        categoryId: 'cat-spec',
        name: 'Pepperoni Supremo & Hot Honey',
        slug: 'pepperoni-supremo-hot-honey',
        description: 'Fatias generosas de pepperoni crocante, mussarela especial e finalização com mel silvestre apimentado com habanero.',
        basePrice: 64.9,
        image: 'https://images.unsplash.com/photo-1628840042765-356cda07504e?auto=format&fit=crop&w=800&q=80',
        isCustomizable: true,
        isVegetarian: false,
        isSpicy: true,
        isChefSpecial: true,
        isAvailable: true,
        ingredients: 'Molho Pomodoro, Mussarela, Pepperoni Italiano, Hot Honey Picante, Orégano',
        variants: [
          { id: 'v13', name: 'Média (6 Fatias - 30cm)', sizeSlices: 6, priceMultiplier: 1.0, isDefault: true },
          { id: 'v14', name: 'Grande (8 Fatias - 35cm)', sizeSlices: 8, priceMultiplier: 1.3, isDefault: false }
        ]
      },
      {
        id: 'prod-6',
        categoryId: 'cat-spec',
        name: 'Parma Crocante & Rúcula Selvagem',
        slug: 'parma-rucula-grana-padano',
        description: 'Presunto tipo Parma curado 18 meses, folhas frescas de rúcula selvagem, lâminas de Grana Padano e redução balsâmica de Modena.',
        basePrice: 72.9,
        image: 'https://images.unsplash.com/photo-1574071318508-1cdbab80d002?auto=format&fit=crop&w=800&q=80',
        isCustomizable: true,
        isVegetarian: false,
        isSpicy: false,
        isChefSpecial: true,
        isAvailable: true,
        ingredients: 'Mussarela Fior di Latte, Presunto de Parma 18M, Rúcula, Grana Padano, Creme Balsâmico',
        variants: [
          { id: 'v15', name: 'Média (6 Fatias - 30cm)', sizeSlices: 6, priceMultiplier: 1.0, isDefault: true },
          { id: 'v16', name: 'Grande (8 Fatias - 35cm)', sizeSlices: 8, priceMultiplier: 1.3, isDefault: false }
        ]
      }
    ]
  },
  {
    id: 'cat-sweet',
    name: 'Pizzas Doces Gourmet',
    slug: 'doces',
    description: 'Sobremesas irresistíveis preparadas no forno a lenha.',
    sortOrder: 3,
    products: [
      {
        id: 'prod-7',
        categoryId: 'cat-sweet',
        name: 'Nutella Pura com Morangos Selecionados',
        slug: 'nutella-com-morango',
        description: 'Massa leve crocante com generosa camada de Nutella autêntica, morangos frescos e raspas de chocolate belga Callebaut.',
        basePrice: 48.9,
        image: 'https://images.unsplash.com/photo-1588315029754-2dd089d39a1a?auto=format&fit=crop&w=800&q=80',
        isCustomizable: true,
        isVegetarian: true,
        isSpicy: false,
        isChefSpecial: false,
        isAvailable: true,
        ingredients: 'Nutella Pura, Morangos Vermelhos Frescos, Raspas de Chocolate Belga',
        variants: [
          { id: 'v17', name: 'Média (6 Fatias - 30cm)', sizeSlices: 6, priceMultiplier: 1.0, isDefault: true }
        ]
      },
      {
        id: 'prod-8',
        categoryId: 'cat-sweet',
        name: 'Pistache Bronte & Chocolate Branco',
        slug: 'pistache-chocolate-branco',
        description: 'Ganache de chocolate branco nobre com pasta pura de pistache da Sicília e pistaches tostados picados.',
        basePrice: 56.9,
        image: 'https://images.unsplash.com/photo-1579684947550-22e945225d9a?auto=format&fit=crop&w=800&q=80',
        isCustomizable: true,
        isVegetarian: true,
        isSpicy: false,
        isChefSpecial: true,
        isAvailable: true,
        ingredients: 'Ganache de Chocolate Branco, Pasta de Pistache Siciliano, Granela de Pistache',
        variants: [
          { id: 'v18', name: 'Média (6 Fatias - 30cm)', sizeSlices: 6, priceMultiplier: 1.0, isDefault: true }
        ]
      }
    ]
  },
  {
    id: 'cat-drinks',
    name: 'Bebidas & Vinhos',
    slug: 'bebidas',
    description: 'Carta de vinhos italianos, cervejas artesanais e refrigerantes.',
    sortOrder: 4,
    products: [
      {
        id: 'prod-9',
        categoryId: 'cat-drinks',
        name: 'Vinho Tinto Chianti DOCG Ruffino (750ml)',
        slug: 'chianti-docg-ruffino',
        description: 'Vinho tinto clássico da Toscana. Harmonização perfeita com nossas pizzas artesanais.',
        basePrice: 89.0,
        image: 'https://images.unsplash.com/photo-1510812431401-41d2bd2722f3?auto=format&fit=crop&w=800&q=80',
        isCustomizable: false,
        isVegetarian: true,
        isSpicy: false,
        isChefSpecial: true,
        isAvailable: true
      },
      {
        id: 'prod-10',
        categoryId: 'cat-drinks',
        name: 'Cerveja Stella Artois Pure Gold (330ml)',
        slug: 'stella-artois-gold',
        description: 'Cerveja lager premium sem glúten, servida trincando de gelada.',
        basePrice: 12.5,
        image: 'https://images.unsplash.com/photo-1608270586620-248524c67de9?auto=format&fit=crop&w=800&q=80',
        isCustomizable: false,
        isVegetarian: true,
        isSpicy: false,
        isChefSpecial: false,
        isAvailable: true
      },
      {
        id: 'prod-11',
        categoryId: 'cat-drinks',
        name: 'Coca-Cola Original ou Zero (Lata 350ml)',
        slug: 'coca-cola-lata',
        description: 'Refrigerante lata gelado acompanhado de limão e gelo.',
        basePrice: 7.5,
        image: 'https://images.unsplash.com/photo-1622483767028-3f66f32aef97?auto=format&fit=crop&w=800&q=80',
        isCustomizable: false,
        isVegetarian: true,
        isSpicy: false,
        isChefSpecial: false,
        isAvailable: true
      }
    ]
  }
];

export const INITIAL_INGREDIENTS: Ingredient[] = [
  { id: 'i1', name: 'Massa Fermentação Lenta 48h (Tradicional)', category: 'BASE', price: 0.0, isAvailable: true },
  { id: 'i2', name: 'Massa 100% Farinha Integral com Sementes', category: 'BASE', price: 6.0, isAvailable: true },
  { id: 'i3', name: 'Massa Low Carb / Sem Glúten', category: 'BASE', price: 9.0, isAvailable: true },

  { id: 'i4', name: 'Molho Pomodoro San Marzano D.O.P.', category: 'SAUCE', price: 0.0, isAvailable: true },
  { id: 'i5', name: 'Molho Pesto Genovês Artesanal', category: 'SAUCE', price: 7.0, isAvailable: true },
  { id: 'i6', name: 'Molho Bianco Parmigiano (Creme de Queijo)', category: 'SAUCE', price: 5.0, isAvailable: true },

  { id: 'i7', name: 'Mussarela Fior di Latte', category: 'CHEESE', price: 0.0, isAvailable: true },
  { id: 'i8', name: 'Mussarela de Búfala Fresca', category: 'CHEESE', price: 8.5, isAvailable: true },
  { id: 'i9', name: 'Gorgonzola Dolce Cremoso', category: 'CHEESE', price: 7.0, isAvailable: true },
  { id: 'i10', name: 'Catupiry Original D.O.C.', category: 'CHEESE', price: 7.5, isAvailable: true },

  { id: 'i11', name: 'Calabresa Artesanal Curada', category: 'PROTEIN', price: 6.0, isAvailable: true },
  { id: 'i12', name: 'Pepperoni Italiano Crocante', category: 'PROTEIN', price: 8.0, isAvailable: true },
  { id: 'i13', name: 'Bacon em Cubos Dourado', category: 'PROTEIN', price: 6.5, isAvailable: true },
  { id: 'i14', name: 'Presunto de Parma 18 Meses', category: 'PROTEIN', price: 12.0, isAvailable: true },

  { id: 'i15', name: 'Tomate Cereja Confit', category: 'VEGGIE', price: 4.0, isAvailable: true },
  { id: 'i16', name: 'Manjericão Basílico Gigante', category: 'VEGGIE', price: 2.0, isAvailable: true },
  { id: 'i17', name: 'Cogumelos Paris Frescos', category: 'VEGGIE', price: 6.5, isAvailable: true },
  { id: 'i18', name: 'Cebola Roxa Caramelizada', category: 'VEGGIE', price: 4.5, isAvailable: true },

  { id: 'i19', name: 'Borda Tradicional Crocante (Sem recheio)', category: 'CRUST', price: 0.0, isAvailable: true },
  { id: 'i20', name: 'Borda Recheada Catupiry Original', category: 'CRUST', price: 10.0, isAvailable: true },
  { id: 'i21', name: 'Borda Recheada Cheddar Cremoso', category: 'CRUST', price: 9.0, isAvailable: true },
  { id: 'i22', name: 'Borda Vulcão Cream Cheese & Alho Poró', category: 'CRUST', price: 12.0, isAvailable: true },
  { id: 'i23', name: 'Borda Doce Chocolate Belga', category: 'CRUST', price: 11.0, isAvailable: true }
];
