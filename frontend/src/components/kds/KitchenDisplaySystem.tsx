import React, { useState, useEffect } from 'react';
import {
  ChefHat,
  Flame,
  PackageCheck,
  Clock,
  Bike,
  AlertTriangle,
  RefreshCw,
  Volume2,
  CheckCircle2,
  PlusCircle,
  Sparkles,
  MapPin,
  Phone,
  User,
  Utensils
} from 'lucide-react';
import { Order, OrderStatus } from '../../types';
import { useSocket } from '../../hooks/useSocket';

const INITIAL_DEMO_ORDERS: Order[] = [
  {
    id: 'ord-1041',
    orderNumber: 1041,
    status: 'RECEIVED',
    subtotal: 90.8,
    deliveryFee: 8.0,
    discountAmount: 10.0,
    totalAmount: 88.8,
    paymentMethod: 'PIX',
    paymentStatus: 'PAID',
    notes: 'Massa bem fininha e crocante, por favor!',
    guestName: 'Mariana Silva',
    guestPhone: '(11) 98765-4321',
    deliveryAddress: 'Rua Oscar Freire, 1420 - Jardins',
    estimatedTime: 35,
    statusHistory: [],
    createdAt: new Date(Date.now() - 4 * 60 * 1000).toISOString(),
    updatedAt: new Date().toISOString(),
    items: [
      {
        id: 'item-1',
        orderId: 'ord-1041',
        productId: 'prod-4',
        quantity: 1,
        unitPrice: 64.9,
        totalPrice: 64.9,
        customConfig: JSON.stringify({
          isHalfHalf: false,
          crustType: 'Borda Recheada Catupiry Original',
          addedToppings: ['Manjericão Fresco', 'Parmesão Ralado']
        }),
        product: {
          id: 'prod-4',
          categoryId: 'cat-spec',
          name: 'Pepperoni Supremo & Hot Honey',
          slug: 'pepperoni-supremo',
          description: 'Pepperoni crocante e mel apimentado.',
          basePrice: 64.9,
          image: 'https://images.unsplash.com/photo-1628840042765-356cda07504e?auto=format&fit=crop&w=800&q=80',
          isCustomizable: true,
          isVegetarian: false,
          isSpicy: true,
          isChefSpecial: true,
          isAvailable: true
        }
      },
      {
        id: 'item-2',
        orderId: 'ord-1041',
        productId: 'prod-11',
        quantity: 2,
        unitPrice: 7.5,
        totalPrice: 15.0,
        product: {
          id: 'prod-11',
          categoryId: 'cat-drinks',
          name: 'Coca-Cola Lata 350ml',
          slug: 'coca-cola',
          description: 'Refrigerante gelado.',
          basePrice: 7.5,
          image: 'https://images.unsplash.com/photo-1622483767028-3f66f32aef97?auto=format&fit=crop&w=800&q=80',
          isCustomizable: false,
          isVegetarian: true,
          isSpicy: false,
          isChefSpecial: false,
          isAvailable: true
        }
      }
    ]
  },
  {
    id: 'ord-1042',
    orderNumber: 1042,
    status: 'PREPARING',
    subtotal: 104.9,
    deliveryFee: 10.0,
    discountAmount: 0.0,
    totalAmount: 114.9,
    paymentMethod: 'CREDIT_CARD',
    paymentStatus: 'PAID',
    notes: 'Sem cebola em uma das metades',
    guestName: 'Rodrigo Medeiros',
    guestPhone: '(11) 97123-8899',
    deliveryAddress: 'Av. Paulista, 2100 - Apto 84',
    estimatedTime: 35,
    statusHistory: [],
    createdAt: new Date(Date.now() - 12 * 60 * 1000).toISOString(),
    updatedAt: new Date().toISOString(),
    items: [
      {
        id: 'item-3',
        orderId: 'ord-1042',
        productId: 'prod-1',
        quantity: 1,
        unitPrice: 69.9,
        totalPrice: 69.9,
        customConfig: JSON.stringify({
          isHalfHalf: true,
          firstFlavorName: 'Margherita Di Bufala',
          secondFlavorName: 'Quattro Formaggi Trufada',
          crustType: 'Borda Vulcão Cream Cheese & Alho Poró',
          addedToppings: ['Tomate Cereja Confit']
        }),
        product: {
          id: 'prod-1',
          categoryId: 'cat-trad',
          name: 'Pizza Meio a Meio Especial (Grande)',
          slug: 'meio-a-meio',
          description: 'Metade Margherita, Metade Quattro Formaggi.',
          basePrice: 69.9,
          image: 'https://images.unsplash.com/photo-1604382354936-07c5d9983bd3?auto=format&fit=crop&w=800&q=80',
          isCustomizable: true,
          isVegetarian: true,
          isSpicy: false,
          isChefSpecial: true,
          isAvailable: true
        }
      }
    ]
  },
  {
    id: 'ord-1043',
    orderNumber: 1043,
    status: 'BAKING',
    subtotal: 72.9,
    deliveryFee: 6.0,
    discountAmount: 0.0,
    totalAmount: 78.9,
    paymentMethod: 'PIX',
    paymentStatus: 'PAID',
    notes: 'Forno bem quente, ponto napolitano com borda alta',
    guestName: 'Fernanda Lima',
    guestPhone: '(11) 96543-2100',
    deliveryAddress: 'Rua Augusta, 950 - Consolação',
    estimatedTime: 30,
    statusHistory: [],
    createdAt: new Date(Date.now() - 19 * 60 * 1000).toISOString(),
    updatedAt: new Date().toISOString(),
    items: [
      {
        id: 'item-4',
        orderId: 'ord-1043',
        productId: 'prod-6',
        quantity: 1,
        unitPrice: 72.9,
        totalPrice: 72.9,
        customConfig: JSON.stringify({
          isHalfHalf: false,
          crustType: 'Borda Tradicional Crocante',
          addedToppings: ['Grana Padano Extra']
        }),
        product: {
          id: 'prod-6',
          categoryId: 'cat-spec',
          name: 'Parma Crocante & Rúcula Selvagem',
          slug: 'parma-rucula',
          description: 'Presunto de Parma, rúcula e Grana Padano.',
          basePrice: 72.9,
          image: 'https://images.unsplash.com/photo-1574071318508-1cdbab80d002?auto=format&fit=crop&w=800&q=80',
          isCustomizable: true,
          isVegetarian: false,
          isSpicy: false,
          isChefSpecial: true,
          isAvailable: true
        }
      }
    ]
  },
  {
    id: 'ord-1044',
    orderNumber: 1044,
    status: 'READY',
    subtotal: 103.8,
    deliveryFee: 8.0,
    discountAmount: 15.0,
    totalAmount: 96.8,
    paymentMethod: 'CREDIT_CARD',
    paymentStatus: 'PAID',
    notes: 'Enviar sachês de azeite e pimenta calabresa',
    guestName: 'Lucas Albuquerque',
    guestPhone: '(11) 99887-1122',
    deliveryAddress: 'Alameda Santos, 1800 - Cerqueira César',
    estimatedTime: 25,
    statusHistory: [],
    createdAt: new Date(Date.now() - 26 * 60 * 1000).toISOString(),
    updatedAt: new Date().toISOString(),
    items: [
      {
        id: 'item-5',
        orderId: 'ord-1044',
        productId: 'prod-2',
        quantity: 1,
        unitPrice: 54.9,
        totalPrice: 54.9,
        product: {
          id: 'prod-2',
          categoryId: 'cat-trad',
          name: 'Calabresa Artesanal & Cebola Caramelizada',
          slug: 'calabresa-artesanal',
          description: 'Calabresa defumada.',
          basePrice: 54.9,
          image: 'https://images.unsplash.com/photo-1534308983496-4fabb1a015ee?auto=format&fit=crop&w=800&q=80',
          isCustomizable: true,
          isVegetarian: false,
          isSpicy: false,
          isChefSpecial: false,
          isAvailable: true
        }
      },
      {
        id: 'item-6',
        orderId: 'ord-1044',
        productId: 'prod-7',
        quantity: 1,
        unitPrice: 48.9,
        totalPrice: 48.9,
        product: {
          id: 'prod-7',
          categoryId: 'cat-sweet',
          name: 'Nutella Pura com Morangos Selecionados',
          slug: 'nutella-morango',
          description: 'Nutella com morangos frescos.',
          basePrice: 48.9,
          image: 'https://images.unsplash.com/photo-1588315029754-2dd089d39a1a?auto=format&fit=crop&w=800&q=80',
          isCustomizable: true,
          isVegetarian: true,
          isSpicy: false,
          isChefSpecial: false,
          isAvailable: true
        }
      }
    ]
  }
];

const DEMO_COURIERS = [
  { id: 'courier-1', name: 'Carlos "Veloz" Motoboy', phone: '(11) 99111-2233' },
  { id: 'courier-2', name: 'Rafael Santos Express', phone: '(11) 99222-3344' },
  { id: 'courier-3', name: 'Lucas Motopizza 480°C', phone: '(11) 99333-4455' }
];

export const KitchenDisplaySystem: React.FC = () => {
  const [orders, setOrders] = useState<Order[]>(INITIAL_DEMO_ORDERS);
  const [couriers, setCouriers] = useState(DEMO_COURIERS);
  const [loading, setLoading] = useState(false);
  const [now, setNow] = useState(Date.now());
  const [activeFilter, setActiveFilter] = useState<'ALL' | 'URGENT'>('ALL');
  const [orderCounter, setOrderCounter] = useState(1045);

  const { socket, joinKDS } = useSocket();

  // Play audio chime on new order
  const playNewOrderChime = () => {
    try {
      const ctx = new (window.AudioContext || (window as any).webkitAudioContext)();
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.type = 'triangle';
      osc.frequency.setValueAtTime(523.25, ctx.currentTime); // C5
      osc.frequency.exponentialRampToValueAtTime(783.99, ctx.currentTime + 0.2); // G5
      osc.frequency.exponentialRampToValueAtTime(1046.50, ctx.currentTime + 0.4); // C6
      gain.gain.setValueAtTime(0.4, ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.6);
      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.start();
      osc.stop(ctx.currentTime + 0.6);
    } catch {
      // Audio fallback
    }
  };

  const fetchKdsOrders = async () => {
    try {
      const res = await fetch('http://localhost:4000/api/kds/orders');
      const data = await res.json();
      if (data.orders && data.orders.length > 0) setOrders(data.orders);
      if (data.couriers && data.couriers.length > 0) setCouriers(data.couriers);
    } catch (err) {
      // Keep rich fallback simulation data
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchKdsOrders();
    joinKDS();

    const timerInterval = setInterval(() => setNow(Date.now()), 5000);

    if (socket) {
      socket.on('new_order_received', (newOrder: Order) => {
        setOrders((prev) => [newOrder, ...prev]);
        playNewOrderChime();
      });

      socket.on('kds_order_status_updated', (data: { orderId: string; status: OrderStatus; order: Order }) => {
        setOrders((prev) => {
          if (data.status === 'OUT_FOR_DELIVERY' || data.status === 'DELIVERED' || data.status === 'CANCELED') {
            return prev.filter((o) => o.id !== data.orderId);
          }
          return prev.map((o) => (o.id === data.orderId ? data.order : o));
        });
      });
    }

    return () => {
      clearInterval(timerInterval);
      if (socket) {
        socket.off('new_order_received');
        socket.off('kds_order_status_updated');
      }
    };
  }, [socket]);

  const handleUpdateStatus = async (orderId: string, nextStatus: OrderStatus, courierId?: string) => {
    // 1. Instant local optimistic update
    setOrders((prev) => {
      if (nextStatus === 'OUT_FOR_DELIVERY' || nextStatus === 'DELIVERED' || nextStatus === 'CANCELED') {
        return prev.filter((o) => o.id !== orderId);
      }
      return prev.map((o) => (o.id === orderId ? { ...o, status: nextStatus, courierId: courierId || o.courierId } : o));
    });

    // 2. Sync with backend API if online
    try {
      await fetch(`http://localhost:4000/api/orders/${orderId}/status`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: nextStatus, courierId })
      });
    } catch (err) {
      // Local state already updated smoothly
    }
  };

  const handleSimulateNewOrder = () => {
    const randomPizzas = [
      { name: 'Margherita Di Bufala D.O.P.', price: 59.9, crust: 'Borda Catupiry Original' },
      { name: 'Quattro Formaggi Trufada', price: 69.9, crust: 'Borda Vulcão Alho Poró' },
      { name: 'Pepperoni Supremo & Hot Honey', price: 64.9, crust: 'Borda Cheddar Cremoso' },
      { name: 'Calabresa Artesanal Defumada', price: 54.9, crust: 'Borda Tradicional' }
    ];
    const picked = randomPizzas[Math.floor(Math.random() * randomPizzas.length)];
    const names = ['Bruno Castro', 'Camila Rocha', 'Thiago Mendes', 'Beatriz Fontana', 'Gabriel Neves'];
    const randomName = names[Math.floor(Math.random() * names.length)];

    const newSimulatedOrder: Order = {
      id: `ord-${orderCounter}`,
      orderNumber: orderCounter,
      status: 'RECEIVED',
      subtotal: picked.price,
      deliveryFee: 8.0,
      discountAmount: 0.0,
      totalAmount: picked.price + 8.0,
      paymentMethod: 'PIX',
      paymentStatus: 'PAID',
      notes: 'Pedido novo simulado pelo Painel do Chef!',
      guestName: randomName,
      guestPhone: '(11) 98888-0000',
      deliveryAddress: 'Rua Bela Cintra, 890 - Consolação',
      estimatedTime: 30,
      statusHistory: [],
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      items: [
        {
          id: `item-${Date.now()}`,
          orderId: `ord-${orderCounter}`,
          productId: 'prod-sim',
          quantity: 1,
          unitPrice: picked.price,
          totalPrice: picked.price,
          customConfig: JSON.stringify({
            isHalfHalf: false,
            crustType: picked.crust,
            addedToppings: ['Azeite de Alho Confit']
          }),
          product: {
            id: 'prod-sim',
            categoryId: 'cat-spec',
            name: picked.name,
            slug: 'pizza-simulada',
            description: 'Preparada no forno a lenha.',
            basePrice: picked.price,
            image: 'https://images.unsplash.com/photo-1513104890138-7c749659a591?auto=format&fit=crop&w=800&q=80',
            isCustomizable: true,
            isVegetarian: false,
            isSpicy: false,
            isChefSpecial: true,
            isAvailable: true
          }
        }
      ]
    };

    setOrderCounter((prev) => prev + 1);
    setOrders((prev) => [newSimulatedOrder, ...prev]);
    playNewOrderChime();
  };

  // Filter orders
  let filteredOrders = orders;
  if (activeFilter === 'URGENT') {
    filteredOrders = orders.filter((o) => Math.floor((now - new Date(o.createdAt).getTime()) / 60000) > 15);
  }

  const receivedOrders = filteredOrders.filter((o) => o.status === 'RECEIVED');
  const preparingOrders = filteredOrders.filter((o) => o.status === 'PREPARING');
  const bakingOrders = filteredOrders.filter((o) => o.status === 'BAKING');
  const readyOrders = filteredOrders.filter((o) => o.status === 'READY');

  const getElapsedTimeBadge = (createdAt: string) => {
    const elapsedMinutes = Math.max(0, Math.floor((now - new Date(createdAt).getTime()) / (1000 * 60)));
    let color = 'bg-emerald-950/80 text-emerald-300 border-emerald-500/40';

    if (elapsedMinutes > 15 && elapsedMinutes <= 30) {
      color = 'bg-amber-950/80 text-amber-300 border-amber-500/40';
    } else if (elapsedMinutes > 30) {
      color = 'bg-red-950 text-red-300 border-red-500/60 animate-pulse';
    }

    return (
      <div className="flex items-center gap-1.5">
        <span className={`px-2.5 py-0.5 rounded-full border text-[11px] font-bold flex items-center gap-1 ${color}`}>
          <Clock className="w-3 h-3" />
          <span>{elapsedMinutes} min</span>
        </span>
      </div>
    );
  };

  return (
    <div className="min-h-screen bg-stone-950 text-stone-100 p-4 sm:p-6 space-y-6 pt-20">
      
      {/* KDS Header */}
      <div className="bg-stone-900/90 border border-stone-800 rounded-2xl p-4 sm:p-6 flex flex-col lg:flex-row items-center justify-between gap-4 shadow-2xl backdrop-blur-md">
        <div className="flex items-center gap-3 w-full lg:w-auto">
          <div className="p-3 rounded-2xl bg-tomato-950 border border-tomato-500/50 text-tomato-400 shadow-glow-tomato">
            <ChefHat className="w-8 h-8" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-xl sm:text-2xl font-serif font-black text-white">
                KDS — Display de Cozinha & Forno
              </h1>
              <span className="px-2.5 py-0.5 rounded-full bg-emerald-950 text-emerald-400 text-xs font-bold border border-emerald-500/40 flex items-center gap-1">
                <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping"></span>
                <span>Ao Vivo</span>
              </span>
            </div>
            <p className="text-xs text-stone-400">
              Controle de bancada, temperatura do forno a 480°C e despacho rápido para motoboys
            </p>
          </div>
        </div>

        {/* Action Controls */}
        <div className="flex flex-wrap items-center gap-2.5 w-full lg:w-auto justify-start lg:justify-end">
          <button
            onClick={handleSimulateNewOrder}
            className="px-3.5 py-2.5 rounded-xl bg-gradient-to-r from-tomato-700 to-tomato-600 hover:from-tomato-600 hover:to-tomato-500 text-white font-bold text-xs flex items-center gap-2 transition-all shadow-glow-tomato hover:scale-105 active:scale-95"
          >
            <PlusCircle className="w-4 h-4" />
            <span>+ Simular Novo Pedido</span>
          </button>

          <button
            onClick={playNewOrderChime}
            className="px-3 py-2.5 rounded-xl bg-stone-800 hover:bg-stone-700 text-stone-200 text-xs flex items-center gap-1.5 transition-colors border border-stone-700 font-semibold"
            title="Testar alarme sonoro da cozinha"
          >
            <Volume2 className="w-4 h-4 text-amber-400" />
            <span>Testar Alarme</span>
          </button>

          <button
            onClick={fetchKdsOrders}
            className="px-3 py-2.5 rounded-xl bg-amber-500 hover:bg-amber-400 text-black font-bold text-xs flex items-center gap-1.5 transition-all shadow-glow-gold hover:scale-105"
          >
            <RefreshCw className="w-4 h-4" />
            <span>Atualizar</span>
          </button>
        </div>
      </div>

      {/* Filter Tabs Bar */}
      <div className="flex items-center justify-between bg-stone-900/50 border border-stone-800/80 rounded-xl p-2 text-xs">
        <div className="flex items-center gap-2">
          <button
            onClick={() => setActiveFilter('ALL')}
            className={`px-3 py-1.5 rounded-lg font-bold transition-all ${
              activeFilter === 'ALL'
                ? 'bg-amber-500 text-black shadow-md'
                : 'text-stone-400 hover:text-white hover:bg-stone-800'
            }`}
          >
            Todas as Comandas ({orders.length})
          </button>
          <button
            onClick={() => setActiveFilter('URGENT')}
            className={`px-3 py-1.5 rounded-lg font-bold transition-all flex items-center gap-1.5 ${
              activeFilter === 'URGENT'
                ? 'bg-red-600 text-white shadow-md'
                : 'text-stone-400 hover:text-white hover:bg-stone-800'
            }`}
          >
            <AlertTriangle className="w-3.5 h-3.5 text-rose-400" />
            <span>Atenção SLA &gt;15m</span>
          </button>
        </div>

        <div className="hidden sm:flex items-center gap-3 text-[11px] text-stone-400">
          <span className="flex items-center gap-1">
            <span className="w-2 h-2 rounded-full bg-emerald-400"></span> &lt;15m Verde
          </span>
          <span className="flex items-center gap-1">
            <span className="w-2 h-2 rounded-full bg-amber-400"></span> 15-30m Amarelo
          </span>
          <span className="flex items-center gap-1">
            <span className="w-2 h-2 rounded-full bg-red-500 animate-pulse"></span> &gt;30m Urgente
          </span>
        </div>
      </div>

      {/* KDS 4-Stage Kanban Columns Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
        
        {/* ================= COLUMN 1: NOVOS RECEBIDOS (RECEIVED) ================= */}
        <div className="bg-stone-900/80 border border-stone-800 rounded-2xl p-4 flex flex-col space-y-4 shadow-lg">
          <div className="flex items-center justify-between pb-3 border-b border-stone-800">
            <div className="flex items-center gap-2">
              <span className="w-3 h-3 rounded-full bg-blue-500"></span>
              <h2 className="text-sm font-bold text-white uppercase tracking-wider">1. Novos Recebidos</h2>
            </div>
            <span className="px-2.5 py-0.5 rounded-md bg-stone-800 text-xs font-black text-blue-400 border border-blue-500/20">
              {receivedOrders.length}
            </span>
          </div>

          <div className="space-y-3 overflow-y-auto max-h-[72vh] pr-1">
            {receivedOrders.length === 0 ? (
              <div className="text-center py-10 text-stone-500 text-xs">Nenhum pedido novo no momento.</div>
            ) : (
              receivedOrders.map((order) => (
                <div
                  key={order.id}
                  className="bg-stone-950 border border-stone-800 hover:border-blue-500/60 rounded-xl p-4 space-y-3 transition-all shadow-md group"
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <span className="font-serif font-black text-amber-400 text-base">
                        #{order.orderNumber}
                      </span>
                      <span className="text-[11px] text-stone-400 font-medium">
                        {order.paymentMethod === 'PIX' ? '⚡ PIX Pago' : '💳 Cartão Pago'}
                      </span>
                    </div>
                    {getElapsedTimeBadge(order.createdAt)}
                  </div>

                  {/* Customer Mini Details */}
                  <div className="text-[11px] text-stone-400 bg-stone-900/60 p-2 rounded-lg space-y-0.5 border border-stone-800/50">
                    <div className="text-stone-200 font-semibold flex items-center gap-1.5">
                      <User className="w-3 h-3 text-amber-400" />
                      <span>{order.guestName || 'Cliente Delivery'}</span>
                    </div>
                    <div className="flex items-center gap-1 text-stone-400">
                      <MapPin className="w-3 h-3 text-tomato-400 flex-shrink-0" />
                      <span className="truncate">{order.deliveryAddress || 'Retirada no Balcão'}</span>
                    </div>
                  </div>

                  {/* Order Items & Recipes */}
                  <div className="space-y-2 text-xs text-stone-200 border-y border-stone-800/80 py-2.5">
                    {order.items.map((it) => {
                      const cfg = it.customConfig ? JSON.parse(it.customConfig) : null;
                      return (
                        <div key={it.id} className="space-y-1">
                          <div className="font-bold text-stone-100 flex items-start justify-between">
                            <span>
                              {it.quantity}x {cfg?.isHalfHalf ? `1/2 ${cfg.firstFlavorName} + 1/2 ${cfg.secondFlavorName}` : (it.product?.name || 'Pizza Gourmet')}
                            </span>
                            <span className="text-stone-400 font-normal text-[11px]">
                              R$ {it.totalPrice.toFixed(2)}
                            </span>
                          </div>
                          {cfg?.crustType && cfg.crustType !== 'Borda Tradicional Crocante' && (
                            <div className="text-[11px] text-amber-300 font-medium ml-2 flex items-center gap-1">
                              <span>🧀</span> Borda: {cfg.crustType}
                            </div>
                          )}
                          {cfg?.addedToppings && cfg.addedToppings.length > 0 && (
                            <div className="text-[11px] text-emerald-400 font-medium ml-2 flex items-center gap-1">
                              <span>✨</span> + {cfg.addedToppings.join(', ')}
                            </div>
                          )}
                        </div>
                      );
                    })}
                    {order.notes && (
                      <p className="text-[11px] text-amber-300 bg-amber-950/40 border border-amber-500/30 p-1.5 rounded italic">
                        Obs: "{order.notes}"
                      </p>
                    )}
                  </div>

                  <button
                    onClick={() => handleUpdateStatus(order.id, 'PREPARING')}
                    className="w-full py-2.5 px-3 rounded-lg bg-blue-600 hover:bg-blue-500 text-white font-bold text-xs transition-all flex items-center justify-center gap-1.5 shadow-md group-hover:scale-[1.02]"
                  >
                    <ChefHat className="w-4 h-4" />
                    <span>Iniciar Preparo na Bancada →</span>
                  </button>
                </div>
              ))
            )}
          </div>
        </div>

        {/* ================= COLUMN 2: NA BANCADA (PREPARING) ================= */}
        <div className="bg-stone-900/80 border border-stone-800 rounded-2xl p-4 flex flex-col space-y-4 shadow-lg">
          <div className="flex items-center justify-between pb-3 border-b border-stone-800">
            <div className="flex items-center gap-2">
              <span className="w-3 h-3 rounded-full bg-amber-500 animate-pulse"></span>
              <h2 className="text-sm font-bold text-white uppercase tracking-wider">2. Na Bancada</h2>
            </div>
            <span className="px-2.5 py-0.5 rounded-md bg-stone-800 text-xs font-black text-amber-400 border border-amber-500/20">
              {preparingOrders.length}
            </span>
          </div>

          <div className="space-y-3 overflow-y-auto max-h-[72vh] pr-1">
            {preparingOrders.length === 0 ? (
              <div className="text-center py-10 text-stone-500 text-xs">Bancada livre para novas massas.</div>
            ) : (
              preparingOrders.map((order) => (
                <div
                  key={order.id}
                  className="bg-stone-950 border border-stone-800 hover:border-amber-500/60 rounded-xl p-4 space-y-3 transition-all shadow-md group"
                >
                  <div className="flex items-center justify-between">
                    <span className="font-serif font-black text-amber-400 text-base">
                      #{order.orderNumber}
                    </span>
                    {getElapsedTimeBadge(order.createdAt)}
                  </div>

                  <div className="space-y-1.5 text-xs text-stone-200 border-y border-stone-800/80 py-2.5">
                    {order.items.map((it) => {
                      const cfg = it.customConfig ? JSON.parse(it.customConfig) : null;
                      return (
                        <div key={it.id} className="space-y-1">
                          <div className="font-bold text-stone-100">
                            • {it.quantity}x {cfg?.isHalfHalf ? `1/2 ${cfg.firstFlavorName} + 1/2 ${cfg.secondFlavorName}` : (it.product?.name || 'Pizza')}
                          </div>
                          {cfg?.crustType && (
                            <div className="text-[11px] text-amber-400 ml-3">
                              Borda: {cfg.crustType}
                            </div>
                          )}
                        </div>
                      );
                    })}
                  </div>

                  <button
                    onClick={() => handleUpdateStatus(order.id, 'BAKING')}
                    className="w-full py-2.5 px-3 rounded-lg bg-orange-600 hover:bg-orange-500 text-white font-bold text-xs transition-all flex items-center justify-center gap-1.5 shadow-md group-hover:scale-[1.02]"
                  >
                    <Flame className="w-4 h-4 text-amber-200" />
                    <span>Colocar no Forno (480°C) →</span>
                  </button>
                </div>
              ))
            )}
          </div>
        </div>

        {/* ================= COLUMN 3: NO FORNO (BAKING) ================= */}
        <div className="bg-stone-900/80 border border-stone-800 rounded-2xl p-4 flex flex-col space-y-4 shadow-lg">
          <div className="flex items-center justify-between pb-3 border-b border-stone-800">
            <div className="flex items-center gap-2">
              <span className="w-3 h-3 rounded-full bg-rose-600 animate-ping"></span>
              <h2 className="text-sm font-bold text-white uppercase tracking-wider">3. No Forno (480°C)</h2>
            </div>
            <span className="px-2.5 py-0.5 rounded-md bg-stone-800 text-xs font-black text-rose-400 border border-rose-500/20">
              {bakingOrders.length}
            </span>
          </div>

          <div className="space-y-3 overflow-y-auto max-h-[72vh] pr-1">
            {bakingOrders.length === 0 ? (
              <div className="text-center py-10 text-stone-500 text-xs">Forno a lenha aguardando pizzas.</div>
            ) : (
              bakingOrders.map((order) => (
                <div
                  key={order.id}
                  className="bg-stone-950 border border-rose-900/50 hover:border-rose-500 rounded-xl p-4 space-y-3 transition-all shadow-md group"
                >
                  <div className="flex items-center justify-between">
                    <span className="font-serif font-black text-amber-400 text-base">
                      #{order.orderNumber}
                    </span>
                    {getElapsedTimeBadge(order.createdAt)}
                  </div>

                  <div className="flex items-center gap-2 text-xs text-rose-400 bg-rose-950/40 p-2 rounded-lg border border-rose-500/30">
                    <Flame className="w-4 h-4 animate-bounce" />
                    <span>Assando a 480°C (~90 segundos)</span>
                  </div>

                  <div className="space-y-1.5 text-xs text-stone-200 border-y border-stone-800/80 py-2.5">
                    {order.items.map((it) => (
                      <div key={it.id} className="font-semibold">
                        • {it.quantity}x {it.product?.name || 'Pizza Gourmet'}
                      </div>
                    ))}
                  </div>

                  <button
                    onClick={() => handleUpdateStatus(order.id, 'READY')}
                    className="w-full py-2.5 px-3 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs transition-all flex items-center justify-center gap-1.5 shadow-md group-hover:scale-[1.02]"
                  >
                    <PackageCheck className="w-4 h-4" />
                    <span>Retirar & Embalar ✓</span>
                  </button>
                </div>
              ))
            )}
          </div>
        </div>

        {/* ================= COLUMN 4: PRONTO / COLETA (READY) ================= */}
        <div className="bg-stone-900/80 border border-stone-800 rounded-2xl p-4 flex flex-col space-y-4 shadow-lg">
          <div className="flex items-center justify-between pb-3 border-b border-stone-800">
            <div className="flex items-center gap-2">
              <span className="w-3 h-3 rounded-full bg-emerald-500"></span>
              <h2 className="text-sm font-bold text-white uppercase tracking-wider">4. Pronto / Coleta</h2>
            </div>
            <span className="px-2.5 py-0.5 rounded-md bg-stone-800 text-xs font-black text-emerald-400 border border-emerald-500/20">
              {readyOrders.length}
            </span>
          </div>

          <div className="space-y-3 overflow-y-auto max-h-[72vh] pr-1">
            {readyOrders.length === 0 ? (
              <div className="text-center py-10 text-stone-500 text-xs">Nenhum pedido aguardando motoboy.</div>
            ) : (
              readyOrders.map((order) => (
                <div
                  key={order.id}
                  className="bg-stone-950 border border-emerald-900/50 hover:border-emerald-500 rounded-xl p-4 space-y-3 transition-all shadow-md group"
                >
                  <div className="flex items-center justify-between">
                    <span className="font-serif font-black text-amber-400 text-base">
                      #{order.orderNumber}
                    </span>
                    <span className="px-2.5 py-0.5 rounded-full bg-emerald-950 text-emerald-300 text-[10px] font-bold border border-emerald-500/40">
                      Pronto & Quente
                    </span>
                  </div>

                  <div className="text-xs text-stone-300 bg-stone-900/60 p-2 rounded-lg border border-stone-800/60 flex items-center justify-between">
                    <span>Cliente: <strong className="text-white">{order.guestName || 'Cliente'}</strong></span>
                    <span className="text-emerald-400 font-bold">R$ {order.totalAmount.toFixed(2)}</span>
                  </div>

                  {/* Courier 1-Click Assignment */}
                  <div className="space-y-1.5 pt-1">
                    <label className="text-[11px] text-stone-400 font-semibold block flex items-center gap-1">
                      <Bike className="w-3.5 h-3.5 text-amber-400" />
                      <span>Despachar com Motoboy:</span>
                    </label>
                    <select
                      defaultValue={order.courierId || ''}
                      onChange={(e) => {
                        if (e.target.value) {
                          handleUpdateStatus(order.id, 'OUT_FOR_DELIVERY', e.target.value);
                        }
                      }}
                      className="w-full bg-stone-900 border border-stone-700 hover:border-amber-500 rounded-lg p-2.5 text-xs text-stone-100 focus:border-amber-500 focus:outline-none cursor-pointer"
                    >
                      <option value="">Selecione o Motoboy para Saída...</option>
                      {couriers.map((c) => (
                        <option key={c.id} value={c.id}>
                          🛵 {c.name}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>

      </div>
    </div>
  );
};
