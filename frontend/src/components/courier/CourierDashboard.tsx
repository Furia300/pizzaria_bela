import React, { useState, useEffect, useRef } from 'react';
import {
  Bike,
  Navigation,
  MapPin,
  CheckCircle2,
  Phone,
  Radio,
  Clock,
  Banknote,
  RefreshCw,
  AlertCircle
} from 'lucide-react';
import { Order } from '../../types';
import { useSocket } from '../../hooks/useSocket';

export const CourierDashboard: React.FC = () => {
  const [activeDeliveries, setActiveDeliveries] = useState<Order[]>([]);
  const [completedDeliveries, setCompletedDeliveries] = useState<Order[]>([]);
  const [isStreamingGps, setIsStreamingGps] = useState(false);
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);
  const [loading, setLoading] = useState(true);
  const [gpsStatus, setGpsStatus] = useState<string>('GPS Desativado');

  const simulationIntervalRef = useRef<any>(null);
  const { joinCourier, sendCourierLocation } = useSocket();

  const courierId = 'carlos-motoboy-123';

  const fetchDeliveries = async () => {
    try {
      const res = await fetch('http://localhost:4000/api/courier/deliveries');
      if (res.ok) {
        const data = await res.json();
        if (data.activeOrders && data.activeOrders.length > 0) {
          setActiveDeliveries(data.activeOrders);
          if (!selectedOrder) setSelectedOrder(data.activeOrders[0]);
        }
        if (data.completedOrders) {
          setCompletedDeliveries(data.completedOrders);
        }
        setLoading(false);
        return;
      }
    } catch {}

    // Fallback demo deliveries for static hosting
    const demoActive: Order[] = [
      {
        id: 'ord-1044',
        orderNumber: 1044,
        status: 'READY',
        guestName: 'Lucas Albuquerque',
        guestPhone: '(11) 99887-1122',
        guestEmail: 'lucas@gmail.com',
        deliveryAddress: 'Alameda Santos, 1800 - Cerqueira César, São Paulo',
        subtotal: 88.80,
        discountAmount: 0,
        totalAmount: 96.80,
        deliveryFee: 8.00,
        paymentMethod: 'CREDIT_CARD',
        paymentStatus: 'PAID',
        estimatedTime: 20,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        items: [],
        statusHistory: []
      },
      {
        id: 'ord-1045',
        orderNumber: 1045,
        status: 'OUT_FOR_DELIVERY',
        guestName: 'Beatriz Fontana',
        guestPhone: '(11) 98822-4411',
        guestEmail: 'beatriz@fontana.com',
        deliveryAddress: 'Rua dos Pinheiros, 650 - Pinheiros, São Paulo',
        subtotal: 132.50,
        discountAmount: 0,
        totalAmount: 142.50,
        deliveryFee: 10.00,
        paymentMethod: 'PIX',
        paymentStatus: 'PAID',
        estimatedTime: 15,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        items: [],
        statusHistory: []
      }
    ];

    const demoCompleted: Order[] = [
      {
        id: 'ord-1040',
        orderNumber: 1040,
        status: 'DELIVERED',
        guestName: 'Rodrigo Medeiros',
        guestPhone: '(11) 97123-8899',
        guestEmail: 'rodrigo@gmail.com',
        deliveryAddress: 'Av. Paulista, 2100 - Bela Vista',
        subtotal: 77.00,
        discountAmount: 0,
        totalAmount: 85.00,
        deliveryFee: 8.00,
        paymentMethod: 'PIX',
        paymentStatus: 'PAID',
        estimatedTime: 0,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        items: [],
        statusHistory: []
      }
    ];

    setActiveDeliveries(demoActive);
    setSelectedOrder(demoActive[0]);
    setCompletedDeliveries(demoCompleted);
    setLoading(false);
  };

  useEffect(() => {
    fetchDeliveries();
    joinCourier(courierId);

    return () => {
      if (simulationIntervalRef.current) {
        clearInterval(simulationIntervalRef.current);
      }
    };
  }, []);

  // GPS Streaming & Route Simulation
  const toggleGpsStreaming = () => {
    if (isStreamingGps) {
      if (simulationIntervalRef.current) clearInterval(simulationIntervalRef.current);
      setIsStreamingGps(false);
      setGpsStatus('Transmissão GPS pausada');
      return;
    }

    if (!selectedOrder) {
      alert('Selecione um pedido ativo para iniciar o compartilhamento de rota!');
      return;
    }

    setIsStreamingGps(true);
    setGpsStatus('Transmitindo localização ao cliente via WebSocket...');

    // Waypoints for smooth simulation along Paulista avenue / Bela Vista
    let step = 0;
    const startLat = -23.561414;
    const startLng = -46.655881;
    const destLat = -23.5678;
    const destLng = -46.6489;
    const totalSteps = 20;

    simulationIntervalRef.current = setInterval(() => {
      step = (step + 1) % (totalSteps + 1);
      const ratio = step / totalSteps;
      const currentLat = startLat + (destLat - startLat) * ratio;
      const currentLng = startLng + (destLng - startLng) * ratio;

      sendCourierLocation({
        orderId: selectedOrder.id,
        courierId,
        lat: currentLat,
        lng: currentLng,
        speed: 35.5,
        heading: 120
      });

      setGpsStatus(
        `Coordenadas enviadas: ${currentLat.toFixed(5)}, ${currentLng.toFixed(5)} (${Math.round(ratio * 100)}% da rota)`
      );
    }, 2000);
  };

  const handleStartDelivery = async (orderId: string) => {
    try {
      await fetch(`http://localhost:4000/api/orders/${orderId}/status`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: 'OUT_FOR_DELIVERY', courierId })
      });
      fetchDeliveries();
    } catch (err) {
      console.error(err);
    }
  };

  const handleCompleteDelivery = async (orderId: string) => {
    try {
      await fetch(`http://localhost:4000/api/courier/orders/${orderId}/complete`, {
        method: 'POST'
      });
      if (simulationIntervalRef.current) clearInterval(simulationIntervalRef.current);
      setIsStreamingGps(false);
      fetchDeliveries();
    } catch (err) {
      console.error(err);
    }
  };

  return (
    <div className="min-h-screen bg-wood-950 text-stone-100 p-4 sm:p-6 max-w-6xl mx-auto space-y-6">
      
      {/* Motoboy Header */}
      <div className="bg-wood-900 border border-stone-800 rounded-2xl p-5 sm:p-6 flex flex-col sm:flex-row items-center justify-between gap-4 shadow-card-dark">
        <div className="flex items-center gap-3">
          <div className="p-3 rounded-2xl bg-amber-500 text-black font-bold shadow-glow-gold">
            <Bike className="w-7 h-7" />
          </div>
          <div>
            <h1 className="text-xl sm:text-2xl font-serif font-black text-white">
              Painel do Motoboy • Carlos Veloz
            </h1>
            <p className="text-xs text-stone-400">
              Rastreamento em tempo real conectado diretamente ao cliente
            </p>
          </div>
        </div>

        <button
          onClick={fetchDeliveries}
          className="px-4 py-2 rounded-xl bg-stone-800 hover:bg-stone-700 text-amber-400 text-xs font-bold flex items-center gap-2 border border-stone-700 transition-colors"
        >
          <RefreshCw className="w-4 h-4" />
          <span>Atualizar</span>
        </button>
      </div>

      {/* GPS Transmission Controls */}
      <div className="bg-wood-900 border border-amber-500/30 rounded-2xl p-5 shadow-card-dark flex flex-col sm:flex-row items-center justify-between gap-4">
        <div className="space-y-1 text-center sm:text-left">
          <div className="flex items-center gap-2 justify-center sm:justify-start">
            <Radio className={`w-4 h-4 ${isStreamingGps ? 'text-emerald-400 animate-ping' : 'text-stone-500'}`} />
            <span className="text-xs font-bold uppercase tracking-wider text-amber-400">
              Transmissão de GPS ao Vivo
            </span>
          </div>
          <p className="text-xs text-stone-300">{gpsStatus}</p>
        </div>

        <button
          onClick={toggleGpsStreaming}
          className={`px-6 py-3 rounded-xl font-bold text-xs shadow-md transition-all flex items-center gap-2 ${
            isStreamingGps
              ? 'bg-rose-700 hover:bg-rose-600 text-white'
              : 'bg-emerald-600 hover:bg-emerald-500 text-white shadow-glow-gold'
          }`}
        >
          <Navigation className="w-4 h-4" />
          <span>{isStreamingGps ? 'Pausar Transmissão de GPS' : 'Iniciar Transmissão de Rota (GPS)'}</span>
        </button>
      </div>

      {/* Active Deliveries List */}
      <div className="space-y-4">
        <h2 className="text-lg font-serif font-bold text-white flex items-center gap-2">
          <span>Entregas Ativas</span>
          <span className="px-2.5 py-0.5 rounded-full bg-amber-500/20 text-amber-300 text-xs border border-amber-500/30">
            {activeDeliveries.length}
          </span>
        </h2>

        {loading ? (
          <div className="text-center py-12 text-stone-400">Carregando entregas...</div>
        ) : activeDeliveries.length === 0 ? (
          <div className="bg-wood-900/60 border border-stone-800 rounded-2xl p-8 text-center space-y-2">
            <CheckCircle2 className="w-10 h-10 text-emerald-400 mx-auto" />
            <h3 className="text-base font-bold text-white">Nenhuma entrega pendente no momento</h3>
            <p className="text-xs text-stone-400">Novos pedidos atribuídos pela cozinha aparecerão aqui instantaneamente.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {activeDeliveries.map((order) => {
              let streetText = order.deliveryAddress;
              let detailsText = '';
              try {
                if (typeof order.deliveryAddress === 'string' && order.deliveryAddress.startsWith('{')) {
                  const parsed = JSON.parse(order.deliveryAddress);
                  streetText = `${parsed.street || ''}, ${parsed.number || ''} ${parsed.complement ? `(${parsed.complement})` : ''}`;
                  detailsText = `${parsed.neighborhood || ''}, ${parsed.city || ''}`;
                }
              } catch {}
              const isSelected = selectedOrder?.id === order.id;

              return (
                <div
                  key={order.id}
                  onClick={() => setSelectedOrder(order)}
                  className={`p-5 rounded-2xl border transition-all cursor-pointer space-y-4 ${
                    isSelected
                      ? 'border-amber-500 bg-wood-900 shadow-glow-gold'
                      : 'border-stone-800 bg-wood-900/80 hover:border-stone-700'
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <span className="font-serif font-black text-amber-400 text-base">
                      PEDIDO #{order.orderNumber}
                    </span>
                    <span className="px-2.5 py-1 rounded-full bg-stone-800 text-xs font-bold text-stone-200">
                      {order.status === 'READY' ? 'Pronto na Loja' : 'Em Rota de Entrega'}
                    </span>
                  </div>

                  <div className="space-y-2 text-xs text-stone-300">
                    <div className="flex items-start gap-2">
                      <MapPin className="w-4 h-4 text-tomato-500 shrink-0 mt-0.5" />
                      <div>
                        <p className="font-bold text-white">{streetText}</p>
                        {detailsText && <p className="text-stone-400">{detailsText}</p>}
                      </div>
                    </div>

                    <div className="flex items-center justify-between pt-2 border-t border-stone-800">
                      <span className="text-stone-400">Cliente: {order.guestName}</span>
                      <span className="font-bold text-amber-300">R$ {order.totalAmount.toFixed(2)}</span>
                    </div>

                    {order.paymentMethod === 'CASH' && (
                      <div className="p-2 rounded bg-amber-950/60 border border-amber-500/40 text-amber-300 font-bold flex items-center gap-1.5">
                        <Banknote className="w-4 h-4" />
                        <span>Cobrar em Dinheiro na Entrega: R$ {order.totalAmount.toFixed(2)}</span>
                      </div>
                    )}
                  </div>

                  {/* Actions */}
                  <div className="pt-2 border-t border-stone-800 flex gap-2">
                    {order.status === 'READY' ? (
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          handleStartDelivery(order.id);
                        }}
                        className="w-full py-2.5 px-3 rounded-xl bg-amber-500 hover:bg-amber-400 text-black font-bold text-xs transition-colors flex items-center justify-center gap-2"
                      >
                        <Bike className="w-4 h-4" />
                        <span>Peguei o Pedido → Iniciar Rota</span>
                      </button>
                    ) : (
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          handleCompleteDelivery(order.id);
                        }}
                        className="w-full py-2.5 px-3 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs transition-colors flex items-center justify-center gap-2 shadow-md"
                      >
                        <CheckCircle2 className="w-4 h-4" />
                        <span>Confirmar Entrega ao Cliente ✓</span>
                      </button>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Completed Deliveries History */}
      {completedDeliveries.length > 0 && (
        <div className="bg-wood-900 border border-stone-800 rounded-2xl p-5 shadow-card-dark space-y-3">
          <h3 className="text-sm font-serif font-bold text-stone-300">Histórico de Entregas Concluídas</h3>
          <div className="divide-y divide-stone-800 text-xs text-stone-400">
            {completedDeliveries.map((c) => (
              <div key={c.id} className="py-2.5 flex items-center justify-between">
                <div>
                  <span className="font-bold text-white">Pedido #{c.orderNumber}</span> • {c.guestName}
                </div>
                <span className="text-emerald-400 font-bold">Entregue com Sucesso ✓</span>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};
