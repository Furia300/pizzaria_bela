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
  CheckCircle2
} from 'lucide-react';
import { Order, OrderStatus } from '../../types';
import { useSocket } from '../../hooks/useSocket';

export const KitchenDisplaySystem: React.FC = () => {
  const [orders, setOrders] = useState<Order[]>([]);
  const [couriers, setCouriers] = useState<{ id: string; name: string; phone?: string | null }[]>([]);
  const [loading, setLoading] = useState(true);
  const [now, setNow] = useState(Date.now());

  const { socket, joinKDS } = useSocket();

  // Play audio chime on new order
  const playNewOrderChime = () => {
    try {
      const ctx = new (window.AudioContext || (window as any).webkitAudioContext)();
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.type = 'sine';
      osc.frequency.setValueAtTime(587.33, ctx.currentTime); // D5
      osc.frequency.exponentialRampToValueAtTime(880, ctx.currentTime + 0.3); // A5
      gain.gain.setValueAtTime(0.3, ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.5);
      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.start();
      osc.stop(ctx.currentTime + 0.5);
    } catch {
      // Audio context might be restricted before user gesture
    }
  };

  const fetchKdsOrders = async () => {
    try {
      const res = await fetch('http://localhost:4000/api/kds/orders');
      const data = await res.json();
      if (data.orders) setOrders(data.orders);
      if (data.couriers) setCouriers(data.couriers);
    } catch (err) {
      console.error('Erro ao carregar KDS:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchKdsOrders();
    joinKDS();

    // Timer tick every 10 seconds for SLA clock update
    const timerInterval = setInterval(() => setNow(Date.now()), 10000);

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
    try {
      const res = await fetch(`http://localhost:4000/api/orders/${orderId}/status`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: nextStatus, courierId })
      });
      const data = await res.json();
      if (res.ok && data.order) {
        setOrders((prev) => {
          if (nextStatus === 'OUT_FOR_DELIVERY' || nextStatus === 'DELIVERED') {
            return prev.filter((o) => o.id !== orderId);
          }
          return prev.map((o) => (o.id === orderId ? data.order : o));
        });
      }
    } catch (err) {
      console.error('Erro ao atualizar status KDS:', err);
    }
  };

  // Group orders by status
  const receivedOrders = orders.filter((o) => o.status === 'RECEIVED');
  const preparingOrders = orders.filter((o) => o.status === 'PREPARING');
  const bakingOrders = orders.filter((o) => o.status === 'BAKING');
  const readyOrders = orders.filter((o) => o.status === 'READY');

  const getElapsedTimeBadge = (createdAt: string) => {
    const elapsedMinutes = Math.floor((now - new Date(createdAt).getTime()) / (1000 * 60));
    let color = 'bg-emerald-950 text-emerald-300 border-emerald-500/40';
    if (elapsedMinutes > 15 && elapsedMinutes <= 30) {
      color = 'bg-amber-950 text-amber-300 border-amber-500/40';
    } else if (elapsedMinutes > 30) {
      color = 'bg-red-950 text-red-300 border-red-500/60 animate-pulse';
    }

    return (
      <span className={`px-2.5 py-0.5 rounded-full border text-[11px] font-bold flex items-center gap-1 ${color}`}>
        <Clock className="w-3 h-3" />
        <span>{elapsedMinutes}m decorridos</span>
      </span>
    );
  };

  return (
    <div className="min-h-screen bg-stone-950 text-stone-100 p-4 sm:p-6 space-y-6">
      
      {/* KDS Header */}
      <div className="bg-stone-900 border border-stone-800 rounded-2xl p-4 sm:p-6 flex flex-col sm:flex-row items-center justify-between gap-4 shadow-xl">
        <div className="flex items-center gap-3">
          <div className="p-3 rounded-2xl bg-tomato-900 border border-tomato-500/50 text-tomato-400 shadow-glow-tomato">
            <ChefHat className="w-7 h-7" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-xl sm:text-2xl font-serif font-black text-white">
                KDS — Sistema de Display de Cozinha
              </h1>
              <span className="px-2.5 py-0.5 rounded-full bg-emerald-900/60 text-emerald-400 text-xs font-bold border border-emerald-500/30">
                Ao Vivo
              </span>
            </div>
            <p className="text-xs text-stone-400">
              Controle em tempo real de comandas, tempos de forno e saída para motoboys
            </p>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={playNewOrderChime}
            className="p-2.5 rounded-xl bg-stone-800 hover:bg-stone-700 text-stone-300 text-xs flex items-center gap-1.5 transition-colors border border-stone-700"
            title="Testar som de nova comanda"
          >
            <Volume2 className="w-4 h-4 text-amber-400" />
            <span>Testar Alarme</span>
          </button>

          <button
            onClick={fetchKdsOrders}
            className="p-2.5 rounded-xl bg-amber-500 hover:bg-amber-400 text-black font-bold text-xs flex items-center gap-1.5 transition-all shadow-glow-gold"
          >
            <RefreshCw className="w-4 h-4" />
            <span>Atualizar</span>
          </button>
        </div>
      </div>

      {/* KDS Columns Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
        
        {/* Column 1: Novos Pedidos (RECEIVED) */}
        <div className="bg-stone-900/80 border border-stone-800 rounded-2xl p-4 flex flex-col space-y-4">
          <div className="flex items-center justify-between pb-3 border-b border-stone-800">
            <div className="flex items-center gap-2">
              <span className="w-3 h-3 rounded-full bg-blue-500"></span>
              <h2 className="text-sm font-bold text-white uppercase tracking-wider">1. Novos Recebidos</h2>
            </div>
            <span className="px-2 py-0.5 rounded-md bg-stone-800 text-xs font-bold text-blue-400">
              {receivedOrders.length}
            </span>
          </div>

          <div className="space-y-3 overflow-y-auto max-h-[75vh]">
            {receivedOrders.map((order) => (
              <div
                key={order.id}
                className="bg-stone-950 border border-stone-800 hover:border-blue-500/50 rounded-xl p-4 space-y-3 transition-all"
              >
                <div className="flex items-center justify-between">
                  <span className="font-serif font-black text-amber-400 text-sm">
                    #{order.orderNumber}
                  </span>
                  {getElapsedTimeBadge(order.createdAt)}
                </div>

                <div className="space-y-1.5 text-xs text-stone-200 border-y border-stone-900 py-2">
                  {order.items.map((it) => {
                    const cfg = it.customConfig ? JSON.parse(it.customConfig) : null;
                    return (
                      <div key={it.id} className="font-semibold">
                        • {it.quantity}x {cfg?.isHalfHalf ? `1/2 ${cfg.firstFlavorName} + 1/2 ${cfg.secondFlavorName}` : it.product?.name}
                        {cfg?.crustType && cfg.crustType !== 'Borda Tradicional Crocante' && (
                          <div className="text-[11px] text-amber-400 font-normal ml-3">
                            Borda: {cfg.crustType}
                          </div>
                        )}
                        {cfg?.addedToppings && cfg.addedToppings.length > 0 && (
                          <div className="text-[11px] text-emerald-400 font-normal ml-3">
                            + {cfg.addedToppings.join(', ')}
                          </div>
                        )}
                      </div>
                    );
                  })}
                  {order.notes && (
                    <p className="text-[11px] text-rose-400 italic">Obs: "{order.notes}"</p>
                  )}
                </div>

                <button
                  onClick={() => handleUpdateStatus(order.id, 'PREPARING')}
                  className="w-full py-2.5 px-3 rounded-lg bg-blue-600 hover:bg-blue-500 text-white font-bold text-xs transition-colors flex items-center justify-center gap-1.5 shadow-md"
                >
                  <ChefHat className="w-4 h-4" />
                  <span>Iniciar Preparo →</span>
                </button>
              </div>
            ))}
          </div>
        </div>

        {/* Column 2: Em Preparo (PREPARING) */}
        <div className="bg-stone-900/80 border border-stone-800 rounded-2xl p-4 flex flex-col space-y-4">
          <div className="flex items-center justify-between pb-3 border-b border-stone-800">
            <div className="flex items-center gap-2">
              <span className="w-3 h-3 rounded-full bg-amber-500 animate-pulse"></span>
              <h2 className="text-sm font-bold text-white uppercase tracking-wider">2. Na Bancada</h2>
            </div>
            <span className="px-2 py-0.5 rounded-md bg-stone-800 text-xs font-bold text-amber-400">
              {preparingOrders.length}
            </span>
          </div>

          <div className="space-y-3 overflow-y-auto max-h-[75vh]">
            {preparingOrders.map((order) => (
              <div
                key={order.id}
                className="bg-stone-950 border border-stone-800 hover:border-amber-500/50 rounded-xl p-4 space-y-3 transition-all"
              >
                <div className="flex items-center justify-between">
                  <span className="font-serif font-black text-amber-400 text-sm">
                    #{order.orderNumber}
                  </span>
                  {getElapsedTimeBadge(order.createdAt)}
                </div>

                <div className="space-y-1.5 text-xs text-stone-200 border-y border-stone-900 py-2">
                  {order.items.map((it) => {
                    const cfg = it.customConfig ? JSON.parse(it.customConfig) : null;
                    return (
                      <div key={it.id} className="font-semibold">
                        • {it.quantity}x {cfg?.isHalfHalf ? `1/2 ${cfg.firstFlavorName} + 1/2 ${cfg.secondFlavorName}` : it.product?.name}
                      </div>
                    );
                  })}
                </div>

                <button
                  onClick={() => handleUpdateStatus(order.id, 'BAKING')}
                  className="w-full py-2.5 px-3 rounded-lg bg-orange-600 hover:bg-orange-500 text-white font-bold text-xs transition-colors flex items-center justify-center gap-1.5 shadow-md"
                >
                  <Flame className="w-4 h-4" />
                  <span>Colocar no Forno →</span>
                </button>
              </div>
            ))}
          </div>
        </div>

        {/* Column 3: No Forno a Lenha (BAKING) */}
        <div className="bg-stone-900/80 border border-stone-800 rounded-2xl p-4 flex flex-col space-y-4">
          <div className="flex items-center justify-between pb-3 border-b border-stone-800">
            <div className="flex items-center gap-2">
              <span className="w-3 h-3 rounded-full bg-rose-600 animate-pulse"></span>
              <h2 className="text-sm font-bold text-white uppercase tracking-wider">3. No Forno (480°C)</h2>
            </div>
            <span className="px-2 py-0.5 rounded-md bg-stone-800 text-xs font-bold text-rose-400">
              {bakingOrders.length}
            </span>
          </div>

          <div className="space-y-3 overflow-y-auto max-h-[75vh]">
            {bakingOrders.map((order) => (
              <div
                key={order.id}
                className="bg-stone-950 border border-rose-900/50 hover:border-rose-500 rounded-xl p-4 space-y-3 transition-all"
              >
                <div className="flex items-center justify-between">
                  <span className="font-serif font-black text-amber-400 text-sm">
                    #{order.orderNumber}
                  </span>
                  {getElapsedTimeBadge(order.createdAt)}
                </div>

                <div className="space-y-1.5 text-xs text-stone-200 border-y border-stone-900 py-2">
                  {order.items.map((it) => (
                    <div key={it.id} className="font-semibold">
                      • {it.quantity}x {it.product?.name || 'Pizza'}
                    </div>
                  ))}
                </div>

                <button
                  onClick={() => handleUpdateStatus(order.id, 'READY')}
                  className="w-full py-2.5 px-3 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs transition-colors flex items-center justify-center gap-1.5 shadow-md"
                >
                  <PackageCheck className="w-4 h-4" />
                  <span>Pronto & Embalado ✓</span>
                </button>
              </div>
            ))}
          </div>
        </div>

        {/* Column 4: Prontos para Motoboy (READY) */}
        <div className="bg-stone-900/80 border border-stone-800 rounded-2xl p-4 flex flex-col space-y-4">
          <div className="flex items-center justify-between pb-3 border-b border-stone-800">
            <div className="flex items-center gap-2">
              <span className="w-3 h-3 rounded-full bg-emerald-500"></span>
              <h2 className="text-sm font-bold text-white uppercase tracking-wider">4. Pronto / Coleta</h2>
            </div>
            <span className="px-2 py-0.5 rounded-md bg-stone-800 text-xs font-bold text-emerald-400">
              {readyOrders.length}
            </span>
          </div>

          <div className="space-y-3 overflow-y-auto max-h-[75vh]">
            {readyOrders.map((order) => (
              <div
                key={order.id}
                className="bg-stone-950 border border-emerald-900/50 hover:border-emerald-500 rounded-xl p-4 space-y-3 transition-all"
              >
                <div className="flex items-center justify-between">
                  <span className="font-serif font-black text-amber-400 text-sm">
                    #{order.orderNumber}
                  </span>
                  <span className="px-2 py-0.5 rounded bg-emerald-950 text-emerald-300 text-[10px] font-bold border border-emerald-500/30">
                    Aguardando Coleta
                  </span>
                </div>

                <div className="text-xs text-stone-400">
                  Total: <strong className="text-white">R$ {order.totalAmount.toFixed(2)}</strong>
                </div>

                {/* Courier Selection */}
                <div className="space-y-2 pt-1">
                  <label className="text-[10px] text-stone-400 uppercase tracking-wider block">
                    Atribuir ao Motoboy:
                  </label>
                  <select
                    defaultValue={order.courierId || (couriers[0]?.id ?? '')}
                    onChange={(e) => handleUpdateStatus(order.id, 'OUT_FOR_DELIVERY', e.target.value)}
                    className="w-full bg-stone-900 border border-stone-700 rounded-lg p-2 text-xs text-stone-200 focus:border-amber-500 focus:outline-none"
                  >
                    <option value="">Selecione o Motoboy...</option>
                    {couriers.map((c) => (
                      <option key={c.id} value={c.id}>
                        🛵 {c.name}
                      </option>
                    ))}
                  </select>
                </div>
              </div>
            ))}
          </div>
        </div>

      </div>
    </div>
  );
};
