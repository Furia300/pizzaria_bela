import { PrismaClient } from "@prisma/client";
import bcrypt from "bcryptjs";

const prisma = new PrismaClient();

async function main() {
  console.log("🌱 Iniciando seed do banco de dados Pizzeria Bella Notte...");

  // Clean existing data
  await prisma.review.deleteMany();
  await prisma.deliveryTracking.deleteMany();
  await prisma.orderStatusHistory.deleteMany();
  await prisma.orderItem.deleteMany();
  await prisma.order.deleteMany();
  await prisma.productVariant.deleteMany();
  await prisma.product.deleteMany();
  await prisma.category.deleteMany();
  await prisma.ingredient.deleteMany();
  await prisma.coupon.deleteMany();
  await prisma.address.deleteMany();
  await prisma.user.deleteMany();

  const passwordHash = await bcrypt.hash("bella123", 10);

  // 1. Create Default Users for all Roles
  const admin = await prisma.user.create({
    data: {
      name: "Chef Giovanni Rossi (Admin)",
      email: "admin@bellanotte.com",
      passwordHash,
      role: "ADMIN",
      phone: "(11) 98888-0001"
    }
  });

  const kitchen = await prisma.user.create({
    data: {
      name: "Pizzaiolo Marco Silva (Cozinha)",
      email: "cozinha@bellanotte.com",
      passwordHash,
      role: "KITCHEN",
      phone: "(11) 98888-0002"
    }
  });

  const courier = await prisma.user.create({
    data: {
      name: "Carlos Motoboy Veloz",
      email: "motoboy@bellanotte.com",
      passwordHash,
      role: "COURIER",
      phone: "(11) 98888-0003"
    }
  });

  const client = await prisma.user.create({
    data: {
      name: "Diogo Oliveira",
      email: "cliente@bellanotte.com",
      passwordHash,
      role: "CLIENT",
      phone: "(11) 99999-7777",
      points: 240
    }
  });

  await prisma.address.create({
    data: {
      userId: client.id,
      street: "Avenida Paulista",
      number: "1578",
      complement: "Apt 102",
      neighborhood: "Bela Vista",
      city: "São Paulo",
      state: "SP",
      zipCode: "01310-200",
      lat: -23.561414,
      lng: -46.655881,
      isDefault: true
    }
  });

  // 2. Categories
  const catTrad = await prisma.category.create({
    data: {
      name: "Pizzas Tradicionais",
      slug: "tradicionais",
      description: "Os clássicos italianos preparados com farinha 00 e fermentação 48h.",
      icon: "Pizza",
      sortOrder: 1
    }
  });

  const catSpec = await prisma.category.create({
    data: {
      name: "Pizzas Especiais do Chef",
      slug: "especiais",
      description: "Criações exclusivas com ingredientes nobres importados da Itália.",
      icon: "Sparkles",
      sortOrder: 2
    }
  });

  const catSweet = await prisma.category.create({
    data: {
      name: "Pizzas Doces Gourmet",
      slug: "doces",
      description: "Sobremesas irresistíveis preparadas no calor suave do forno a lenha.",
      icon: "Cake",
      sortOrder: 3
    }
  });

  const catDrinks = await prisma.category.create({
    data: {
      name: "Bebidas & Vinhos",
      slug: "bebidas",
      description: "Carta de vinhos italianos, cervejas artesanais e refrigerantes.",
      icon: "GlassWater",
      sortOrder: 4
    }
  });

  // 3. Products
  const productsData = [
    {
      categoryId: catTrad.id,
      name: "Margherita Di Bufala D.O.P.",
      slug: "margherita-di-bufala",
      description: "Molho de tomate San Marzano D.O.P., mussarela de búfala fresca, folhas de manjericão gigante e azeite extravirgem italiano.",
      basePrice: 59.9,
      image: "https://images.unsplash.com/photo-1604382354936-07c5d9983bd3?auto=format&fit=crop&w=800&q=80",
      isVegetarian: true,
      isChefSpecial: true,
      ingredients: "Molho San Marzano, Mussarela de Búfala, Manjericão Fresco, Azeite Extravirgem"
    },
    {
      categoryId: catTrad.id,
      name: "Calabresa Artesanal & Cebola Caramelizada",
      slug: "calabresa-artesanal",
      description: "Calabresa artesanal levemente defumada em lenha nobre, lâminas de cebola roxa caramelizada no vinho tinto e orégano fresco.",
      basePrice: 54.9,
      image: "https://images.unsplash.com/photo-1534308983496-4fabb1a015ee?auto=format&fit=crop&w=800&q=80",
      isVegetarian: false,
      isChefSpecial: false,
      ingredients: "Molho de Tomate Rústico, Mussarela, Calabresa Artesanal Defumada, Cebola Roxa Caramelizada, Orégano"
    },
    {
      categoryId: catSpec.id,
      name: "Quattro Formaggi Trufada",
      slug: "quattro-formaggi-trufada",
      description: "Blend sublime de Mussarela Fior di Latte, Gorgonzola Dolce, Fontina, Parmigiano Reggiano 24 meses e gotas de azeite trufado.",
      basePrice: 69.9,
      image: "https://images.unsplash.com/photo-1513104890138-7c749659a591?auto=format&fit=crop&w=800&q=80",
      isVegetarian: true,
      isChefSpecial: true,
      ingredients: "Fior di Latte, Gorgonzola Dolce, Queijo Fontina, Parmesão 24 Meses, Azeite de Trufas Brancas"
    },
    {
      categoryId: catSpec.id,
      name: "Pepperoni Supremo & Hot Honey",
      slug: "pepperoni-supremo-hot-honey",
      description: "Fatias generosas de pepperoni premium crocantes no forno, mussarela fatiada e finalização com mel silvestre infundido com pimenta habanero.",
      basePrice: 64.9,
      image: "https://images.unsplash.com/photo-1628840042765-356cda07504e?auto=format&fit=crop&w=800&q=80",
      isSpicy: true,
      isChefSpecial: true,
      ingredients: "Molho Pomodoro, Mussarela Especial, Pepperoni Italiano, Hot Honey Picante, Orégano Selvagem"
    },
    {
      categoryId: catTrad.id,
      name: "Frango Nobre com Catupiry Original",
      slug: "frango-com-catupiry",
      description: "Peito de frango desfiado temperado com ervas finas, alho-poró salteado na manteiga de garrafa e generosa camada de Catupiry Original D.O.C.",
      basePrice: 58.9,
      image: "https://images.unsplash.com/photo-1565299624946-b28f40a0ae38?auto=format&fit=crop&w=800&q=80",
      isVegetarian: false,
      isChefSpecial: false,
      ingredients: "Molho Pomodoro, Frango Desfiado com Ervas, Catupiry Original, Milho Doce Orgânico, Orégano"
    },
    {
      categoryId: catSpec.id,
      name: "Parma Crocante & Rúcula Selvagem",
      slug: "parma-rucula-grana-padano",
      description: "Presunto tipo Parma curado 18 meses, folhas frescas de rúcula selvagem colhida no dia, lâminas de Grana Padano e redução balsâmica de Modena.",
      basePrice: 72.9,
      image: "https://images.unsplash.com/photo-1574071318508-1cdbab80d002?auto=format&fit=crop&w=800&q=80",
      isVegetarian: false,
      isChefSpecial: true,
      ingredients: "Mussarela Fior di Latte, Presunto de Parma 18M, Rúcula Selvagem, Grana Padano, Creme Balsâmico"
    },
    {
      categoryId: catSweet.id,
      name: "Nutella Pura com Morangos Selecionados",
      slug: "nutella-com-morango",
      description: "Massa leve crocante recheada com generosa camada de Nutella autêntica, fatias de morangos frescos e raspas de chocolate belga Callebaut.",
      basePrice: 48.9,
      image: "https://images.unsplash.com/photo-1588315029754-2dd089d39a1a?auto=format&fit=crop&w=800&q=80",
      isVegetarian: true,
      isChefSpecial: false,
      ingredients: "Nutella Pura, Morangos Vermelhos Frescos, Raspas de Chocolate Belga 54%"
    },
    {
      categoryId: catSweet.id,
      name: "Pistache Bronte & Chocolate Branco",
      slug: "pistache-chocolate-branco",
      description: "Ganache aveludada de chocolate branco nobre com pasta pura de pistache de Bronte (Sicília) e pistaches tostados picados.",
      basePrice: 56.9,
      image: "https://images.unsplash.com/photo-1579684947550-22e945225d9a?auto=format&fit=crop&w=800&q=80",
      isVegetarian: true,
      isChefSpecial: true,
      ingredients: "Ganache de Chocolate Branco, Pasta de Pistache Siciliano, Granela de Pistache Tostado"
    },
    {
      categoryId: catDrinks.id,
      name: "Vinho Tinto Chianti DOCG Ruffino (750ml)",
      slug: "chianti-docg-ruffino",
      description: "Vinho tinto clássico da Toscana. Harmonização perfeita com nossas pizzas artesanais.",
      basePrice: 89.0,
      image: "https://images.unsplash.com/photo-1510812431401-41d2bd2722f3?auto=format&fit=crop&w=800&q=80",
      isVegetarian: true,
      isChefSpecial: true,
      ingredients: "Vinho Tinto Fino Seco - Uva Sangiovese (Toscana, Itália)"
    },
    {
      categoryId: catDrinks.id,
      name: "Cerveja Stella Artois Pure Gold (330ml)",
      slug: "stella-artois-gold",
      description: "Cerveja lager premium sem glúten, servida trincando de gelada.",
      basePrice: 12.5,
      image: "https://images.unsplash.com/photo-1608270586620-248524c67de9?auto=format&fit=crop&w=800&q=80",
      isVegetarian: true,
      isChefSpecial: false,
      ingredients: "Cerveja Puro Malte Gluten-Free"
    },
    {
      categoryId: catDrinks.id,
      name: "Coca-Cola Original ou Zero (Lata 350ml)",
      slug: "coca-cola-lata",
      description: "Refrigerante lata gelado acompanhado de limão e gelo.",
      basePrice: 7.5,
      image: "https://images.unsplash.com/photo-1622483767028-3f66f32aef97?auto=format&fit=crop&w=800&q=80",
      isVegetarian: true,
      isChefSpecial: false,
      ingredients: "Refrigerante 350ml"
    }
  ];

  for (const p of productsData) {
    const product = await prisma.product.create({
      data: p
    });

    // If it's a pizza, add standard variants: P, M, G, Família
    if (p.categoryId !== catDrinks.id) {
      await prisma.productVariant.createMany({
        data: [
          {
            productId: product.id,
            name: "Média (6 Fatias - 30cm)",
            sizeSlices: 6,
            priceMultiplier: 1.0,
            isDefault: true
          },
          {
            productId: product.id,
            name: "Grande (8 Fatias - 35cm)",
            sizeSlices: 8,
            priceMultiplier: 1.3,
            isDefault: false
          },
          {
            productId: product.id,
            name: "Família (12 Fatias - 40cm)",
            sizeSlices: 12,
            priceMultiplier: 1.6,
            isDefault: false
          },
          {
            productId: product.id,
            name: "Individual (4 Fatias - 25cm)",
            sizeSlices: 4,
            priceMultiplier: 0.75,
            isDefault: false
          }
        ]
      });
    }
  }

  // 4. Pizza Builder Ingredients
  const ingredientsList = [
    // BASES
    { name: "Massa Fermentação Lenta 48h (Tradicional)", category: "BASE", price: 0.0 },
    { name: "Massa 100% Farinha Integral com Sementes", category: "BASE", price: 6.0 },
    { name: "Massa Low Carb / Sem Glúten", category: "BASE", price: 9.0 },
    // SAUCES
    { name: "Molho Pomodoro San Marzano D.O.P.", category: "SAUCE", price: 0.0 },
    { name: "Molho Pesto Genovês Artesanal", category: "SAUCE", price: 7.0 },
    { name: "Molho Bianco Parmigiano (Creme de Queijo)", category: "SAUCE", price: 5.0 },
    // CHEESES
    { name: "Mussarela Fior di Latte", category: "CHEESE", price: 0.0 },
    { name: "Mussarela de Búfala Fresca", category: "CHEESE", price: 8.5 },
    { name: "Gorgonzola Dolce Cremoso", category: "CHEESE", price: 7.0 },
    { name: "Catupiry Original D.O.C.", category: "CHEESE", price: 7.5 },
    { name: "Parmesão Reggiano Ralado na Hora", category: "CHEESE", price: 6.5 },
    // PROTEINS
    { name: "Calabresa Artesanal Curada", category: "PROTEIN", price: 6.0 },
    { name: "Pepperoni Italiano Crocante", category: "PROTEIN", price: 8.0 },
    { name: "Bacon em Cubos Dourado", category: "PROTEIN", price: 6.5 },
    { name: "Frango com Ervas Desfiado", category: "PROTEIN", price: 5.5 },
    { name: "Presunto de Parma 18 Meses", category: "PROTEIN", price: 12.0 },
    // VEGGIES
    { name: "Tomate Cereja Confit", category: "VEGGIE", price: 4.0 },
    { name: "Manjericão Basílico Gigante", category: "VEGGIE", price: 2.0 },
    { name: "Cogumelos Paris Frescos Salteados", category: "VEGGIE", price: 6.5 },
    { name: "Cebola Roxa Caramelizada no Vinho", category: "VEGGIE", price: 4.5 },
    { name: "Azeitonas Pretas Azapa sem Caroço", category: "VEGGIE", price: 3.5 },
    { name: "Rúcula Selvagem Fresca", category: "VEGGIE", price: 3.0 },
    // CRUSTS
    { name: "Borda Tradicional Crocante (Sem recheio)", category: "CRUST", price: 0.0 },
    { name: "Borda Recheada Catupiry Original", category: "CRUST", price: 10.0 },
    { name: "Borda Recheada Cheddar Cremoso Inglês", category: "CRUST", price: 9.0 },
    { name: "Borda Vulcão Cream Cheese & Alho Poró", category: "CRUST", price: 12.0 },
    { name: "Borda Doce Chocolate Belga", category: "CRUST", price: 11.0 }
  ];

  for (const ing of ingredientsList) {
    await prisma.ingredient.create({
      data: ing
    });
  }

  // 5. Coupons
  await prisma.coupon.createMany({
    data: [
      {
        code: "BEMVINDO10",
        discountType: "PERCENTAGE",
        discountValue: 10,
        minOrderValue: 40,
        isActive: true
      },
      {
        code: "BELLA15",
        discountType: "FIXED",
        discountValue: 15,
        minOrderValue: 70,
        isActive: true
      },
      {
        code: "NOITEPIZZA",
        discountType: "PERCENTAGE",
        discountValue: 20,
        minOrderValue: 100,
        isActive: true
      }
    ]
  });

  // 6. Demo Completed Order with Review
  const sampleProduct = await prisma.product.findFirst({
    where: { slug: "margherita-di-bufala" }
  });

  const demoOrder = await prisma.order.create({
    data: {
      orderNumber: 1001,
      userId: client.id,
      guestName: "Diogo Oliveira",
      status: "DELIVERED",
      subtotal: 59.9,
      deliveryFee: 6.0,
      discountAmount: 5.99,
      totalAmount: 59.91,
      paymentMethod: "PIX",
      paymentStatus: "PAID",
      deliveryAddress: JSON.stringify({
        street: "Avenida Paulista",
        number: "1578",
        neighborhood: "Bela Vista",
        city: "São Paulo",
        state: "SP",
        zipCode: "01310-200"
      }),
      courierId: courier.id,
      items: {
        create: [
          {
            productId: sampleProduct?.id,
            quantity: 1,
            unitPrice: 59.9,
            totalPrice: 59.9
          }
        ]
      },
      statusHistory: {
        createMany: {
          data: [
            { status: "RECEIVED", note: "Pedido recebido via App", changedBy: "CLIENT" },
            { status: "PREPARING", note: "Massa no forno", changedBy: "KITCHEN" },
            { status: "READY", note: "Pronto para entrega", changedBy: "KITCHEN" },
            { status: "OUT_FOR_DELIVERY", note: "Motoboy saiu", changedBy: "COURIER" },
            { status: "DELIVERED", note: "Entregue no endereço", changedBy: "COURIER" }
          ]
        }
      }
    }
  });

  await prisma.review.create({
    data: {
      orderId: demoOrder.id,
      userId: client.id,
      rating: 5,
      comment: "A melhor pizza napolitana de SP! Massa levinha, queijo derretido no ponto certo e entrega super rápida."
    }
  });

  console.log("✅ Seed concluído com sucesso!");
}

main()
  .catch((e) => {
    console.error("❌ Erro no seed:", e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
