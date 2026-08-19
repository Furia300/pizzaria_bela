import React, { useState, useEffect, useRef } from 'react';
import {
  Clock,
  MapPin,
  CheckCircle2,
  Phone,
  Flame,
  ChefHat,
  Bike,
  PackageCheck,
  Star,
  RefreshCw,
  AlertCircle
} from 'lucide-react';
import { Order, OrderStatus } from '../../types';
import { LeafletMap } from './LeafletMap';
import { ReviewModal } from './ReviewModal';
import { useSocket } from '../../hooks/useSocket';

interface LiveOrderTrackerProps {
  orderId: string;
  onBackToMenu: () => void;
}

export const LiveOrderTracker: React.FC<LiveOrderTrackerProps> = ({ orderId, onBackToMenu }) => {
  const [order, setOrder] = useState<Order | null>(null);
  const [loading, setLoading] = useState(true);
  const [courierPos, setCourierPos] = useState<[number, number] | undefined>([-23.561414, -46.655881]);
  const [showReviewModal, setShowReviewModal] = useState(false);
  const gpsSimIntervalRef = useRef<any>(null);

  const { socket, joinOrder } = useSocket();

  const fetchOrder = async () => {
    try {
      const res = await fetch(`http://localhost:4000/api/orders/${orderId}`);
      if (res.ok) {
        const data = await res.json();
        if (data.order) {
          setOrder(data.order);
          if (data.order.deliveryTrack?.currentLat && data.order.deliveryTrack?.currentLng) {
            setCourierPos([data.order.deliveryTrack.currentLat, data.order.deliveryTrack.currentLng]);
          }
          setLoading(false);
          return;
        }
      }
    } catch {}

    // Fallback simulation order for static GitHub Pages visitors
    const mockOrderNum = orderId.replace(/\D/g, '') || '1048';
    const fallbackOrder: Order = {
      id: orderId,
      orderNumber: parseInt(mockOrderNum) || 1048,
      status: 'OUT_FOR_DELIVERY',
      guestName: 'Diogo Oliveira',
      guestPhone: '(11) 98765-4321',
      guestEmail: 'diogo@bellanotte.com.br',
      deliveryAddress: 'Avenida Paulista, 1578 (Apt 102) - Bela Vista, São Paulo',
      subtotal: 106.80,
      discountAmount: 0,
      totalAmount: 114.80,
      deliveryFee: 8.00,
      paymentMethod: 'PIX',
      paymentStatus: 'PAID',
      estimatedTime: 22,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      statusHistory: [],
      courier: {
        id: 'carlos-motoboy',
        name: 'Carlos "Veloz" Motoboy',
        phone: '(11) 98888-7777'
      },
      items: [
        {
          id: 'item-1',
          orderId: orderId,
          quantity: 1,
          unitPrice: 68.90,
          totalPrice: 68.90,
          customConfig: JSON.stringify({
            isHalfHalf: true,
            firstFlavorName: 'Margherita Di Bufala D.O.P.',
            secondFlavorName: 'Quattro Formaggi Trufada',
            variantName: 'Grande 8 Fatias (35cm)',
            crustType: 'Borda Vulcão Cream Cheese & Alho Poró'
          })
        },
        {
          id: 'item-2',
          orderId: orderId,
          quantity: 1,
          unitPrice: 30.90,
          totalPrice: 30.90,
          product: {
            id: 'p-vinho',
            categoryId: 'bebidas',
            name: 'Vinho Tinto Chianti DOCG Ruffino 750ml',
            slug: 'vinho-chianti',
            description: 'Vinho italiano toscano elegante com notas de cereja e especiarias.',
            basePrice: 30.90,
            image: 'https://images.unsplash.com/photo-1510812431401-41d2bd2722f3?w=800&auto=format&fit=crop&q=80',
            isCustomizable: false,
            isVegetarian: true,
            isSpicy: false,
            isChefSpecial: true,
            isAvailable: true,
            variants: []
          }
        },
        {
          id: 'item-3',
          orderId: orderId,
          quantity: 2,
          unitPrice: 7.50,
          totalPrice: 15.00,
          product: {
            id: 'p-coca',
            categoryId: 'bebidas',
            name: 'Coca-Cola Original Lata 350ml',
            slug: 'coca-cola-lata',
            description: 'Refrigerante gelado em lata 350ml',
            basePrice: 7.50,
            image: 'https://images.unsplash.com/photo-1622483767028-3f66f32aef97?w=800&auto=format&fit=crop&q=80',
            isCustomizable: false,
            isVegetarian: true,
            isSpicy: false,
            isChefSpecial: false,
            isAvailable: true,
            variants: []
          }
        }
      ]
    };

    setOrder(fallbackOrder);
    setLoading(false);
  };

  useEffect(() => {
    fetchOrder();
    joinOrder(orderId);

    // Live GPS step simulation on the client
    let step = 0;
    const totalSteps = 25;
    const startLat = -23.561414;
    const startLng = -46.655881;
    const destLat = -23.5678;
    const destLng = -46.6489;

    gpsSimIntervalRef.current = setInterval(() => {
      step = (step + 1) % (totalSteps + 1);
      const ratio = step / totalSteps;
      const curLat = startLat + (destLat - startLat) * ratio;
      const curLng = startLng + (destLng - startLng) * ratio;
      setCourierPos([curLat, curLng]);
    }, 2500);

    if (socket) {
      socket.on('order_status_updated', (data: { orderId: string; status: OrderStatus; order: Order }) => {
        if (data.orderId === orderId) {
          setOrder(data.order);
          if (data.status === 'DELIVERED') {
            setShowReviewModal(true);
          }
        }
      });

      socket.on('courier_location_changed', (data: { orderId: string; lat: number; lng: number }) => {
        if (data.orderId === orderId) {
          setCourierPos([data.lat, data.lng]);
        }
      });
    }

    return () => {
      if (gpsSimIntervalRef.current) clearInterval(gpsSimIntervalRef.current);
      if (socket) {
        socket.off('order_status_updated');
        socket.off('courier_location_changed');
      }
    };
  }, [orderId, socket]);

  if (loading) {
    return (
      <div className="min-h-[80vh] flex flex-col items-center justify-center space-y-4 bg-wood-950 text-white">
        <RefreshCw className="w-10 h-10 text-amber-500 animate-spin" />
        <p className="text-sm font-medium text-stone-400">Conectando ao rastreamento em tempo real...</p>
      </div>
    );
  }

  if (!order) {
    return (
      <div className="min-h-[80vh] flex flex-col items-center justify-center p-6 text-center space-y-4 bg-wood-950 text-white">
        <AlertCircle className="w-12 h-12 text-tomato-500" />
        <h2 className="text-2xl font-serif font-bold">Pedido #{orderId} não encontrado</h2>
        <button
          onClick={onBackToMenu}
          className="px-6 py-2.5 rounded-xl bg-stone-800 text-amber-400 text-xs font-bold border border-stone-700"
        >
          Voltar ao Cardápio
        </button>
      </div>
    );
  }

  const steps: { key: OrderStatus; label: string; icon: React.ElementType; desc: string }[] = [
    {
      key: 'RECEIVED',
      label: 'Recebido',
      icon: CheckCircle2,
      desc: 'Pedido registrado e enviado para a cozinha'
    },
    {
      key: 'PREPARING',
      label: 'Preparando',
      icon: ChefHat,
      desc: 'Pizzaiolo abrindo a massa e aplicando coberturas'
    },
    {
      key: 'BAKING',
      label: 'No Forno',
      icon: Flame,
      desc: 'Assando no forno a lenha napolitano a 480°C'
    },
    {
      key: 'READY',
      label: 'Pronto',
      icon: PackageCheck,
      desc: 'Embalado e aguardando coleta do motoboy'
    },
    {
      key: 'OUT_FOR_DELIVERY',
      label: 'A Caminho',
      icon: Bike,
      desc: 'Motoboy em deslocamento com sua pizza quentinha'
    },
    {
      key: 'DELIVERED',
      label: 'Entregue',
      icon: Star,
      desc: 'Pedido entregue com sucesso!'
    }
  ];

  const currentStepIndex = steps.findIndex((s) => s.key === order.status);
  
  let formattedAddress = order.deliveryAddress;
  try {
    if (typeof order.deliveryAddress === 'string' && order.deliveryAddress.startsWith('{')) {
      const parsed = JSON.parse(order.deliveryAddress);
      formattedAddress = `${parsed.street || ''}, ${parsed.number || ''} ${parsed.complement ? `(${parsed.complement})` : ''} - ${parsed.neighborhood || ''}, ${parsed.city || ''}`;
    }
  } catch {}

  return (
    <div className="min-h-screen bg-wood-950 py-12 px-4 sm:px-6 lg:px-8 text-stone-100">
      <div className="max-w-4xl mx-auto space-y-8">
        
        {/* Header Bar */}
        <div className="bg-wood-900 border border-stone-800 rounded-3xl p-6 flex flex-col sm:flex-row items-center justify-between gap-4 shadow-card-dark">
          <div className="space-y-1 text-center sm:text-left">
            <div className="flex items-center gap-2 justify-center sm:justify-start">
              <span className="px-3 py-1 rounded-full bg-amber-500/20 border border-amber-500/40 text-amber-300 text-xs font-black">
                PEDIDO #{order.orderNumber}
              </span>
              <span className="flex items-center gap-1 text-xs text-emerald-400 font-medium">
                <span className="w-2 h-2 rounded-full bg-emerald-500 animate-ping"></span>
                GPS Ao Vivo
              </span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-serif font-bold text-white">
              Acompanhamento em Tempo Real
            </h1>
          </div>

          <div className="flex items-center gap-3 bg-wood-950/80 px-4 py-3 rounded-2xl border border-stone-800 text-center sm:text-right">
            <Clock className="w-6 h-6 text-amber-400" />
            <div>
              <span className="text-[10px] text-stone-400 block uppercase tracking-wider">Tempo Estimado</span>
              <span className="text-base font-bold text-white">
                {order.status === 'DELIVERED' ? 'Concluído' : `~${order.estimatedTime} minutos`}
              </span>
            </div>
          </div>
        </div>

        {/* Step Progress Timeline */}
        <div className="bg-wood-900 border border-stone-800 rounded-3xl p-6 sm:p-8 shadow-card-dark space-y-6">
          <div className="grid grid-cols-2 sm:grid-cols-6 gap-4 relative">
            {steps.map((step, index) => {
              const Icon = step.icon;
              const isPast = currentStepIndex > index;
              const isCurrent = currentStepIndex === index;
              const isFuture = currentStepIndex < index;

              return (
                <div
                  key={step.key}
                  className={`flex flex-col items-center text-center space-y-2 relative transition-all ${
                    isCurrent
                      ? 'scale-105'
                      : isFuture
                      ? 'opacity-40'
                      : 'opacity-90'
                  }`}
                >
                  <div
                    className={`w-12 h-12 rounded-2xl flex items-center justify-center transition-all ${
                      isCurrent
                        ? 'bg-amber-500 text-black shadow-glow-gold ring-4 ring-amber-400/30 font-black'
                        : isPast
                        ? 'bg-emerald-700 text-white'
                        : 'bg-stone-800 text-stone-400'
                    }`}
                  >
                    <Icon className="w-6 h-6" />
                  </div>

                  <div>
                    <h4 className={`text-xs font-bold ${isCurrent ? 'text-amber-300' : 'text-stone-200'}`}>
                      {step.label}
                    </h4>
                    <p className="text-[10px] text-stone-400 mt-0.5 line-clamp-2">{step.desc}</p>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Live GPS Map Display */}
        <div className="bg-wood-900 border border-stone-800 rounded-3xl p-6 shadow-card-dark space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Bike className="w-5 h-5 text-amber-400 animate-bounce" />
              <h3 className="text-base font-serif font-bold text-white">
                {order.status === 'DELIVERED'
                  ? 'Rota da Entrega Concluída'
                  : 'Localização do Motoboy no Mapa'}
              </h3>
            </div>
            {order.courier && (
              <div className="flex items-center gap-2 text-xs text-stone-300">
                <span className="font-semibold">{order.courier.name}</span>
                {order.courier.phone && (
                  <a
                    href={`tel:${order.courier.phone}`}
                    className="p-1.5 rounded-xl bg-stone-800 hover:bg-stone-700 text-emerald-400 flex items-center gap-1 font-bold"
                  >
                    <Phone className="w-3.5 h-3.5" />
                    <span>Ligar</span>
                  </a>
                )}
              </div>
            )}
          </div>

          <LeafletMap courierPos={courierPos} />
        </div>

        {/* Order Details & Summary Card */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          
          {/* Items in this Order */}
          <div className="bg-wood-900 border border-stone-800 rounded-3xl p-6 shadow-card-dark space-y-4">
            <h3 className="text-base font-serif font-bold text-white border-b border-stone-800 pb-3">
              Itens do Pedido
            </h3>
            <div className="space-y-3 max-h-60 overflow-y-auto pr-2">
              {order.items.map((item) => {
                let config: any = null;
                try {
                  config = item.customConfig ? JSON.parse(item.customConfig) : null;
                } catch {}
                return (
                  <div key={item.id} className="flex items-start justify-between text-xs pb-2 border-b border-stone-800/50">
                    <div className="space-y-0.5">
                      <span className="font-bold text-stone-100">
                        {item.quantity}x {config?.isHalfHalf
                          ? `1/2 ${config.firstFlavorName} + 1/2 ${config.secondFlavorName}`
                          : item.product?.name || 'Pizza Gourmet Napolitana'}
                      </span>
                      {config?.variantName && (
                        <p className="text-stone-400 text-[11px]">{config.variantName}</p>
                      )}
                      {config?.crustType && config.crustType !== 'Borda Tradicional Crocante' && (
                        <p className="text-amber-400/90 text-[11px]">Borda: {config.crustType}</p>
                      )}
                    </div>
                    <span className="font-bold text-amber-400">
                      R$ {item.totalPrice.toFixed(2)}
                    </span>
                  </div>
                );
              })}
            </div>

            {/* Total Price */}
            <div className="pt-2 flex justify-between items-center text-sm font-bold text-white border-t border-stone-800">
              <span>Total Pago</span>
              <span className="text-lg font-serif text-amber-400 font-black">
                R$ {order.totalAmount.toFixed(2)}
              </span>
            </div>
          </div>

          {/* Delivery & Payment Details */}
          <div className="bg-wood-900 border border-stone-800 rounded-3xl p-6 shadow-card-dark space-y-4">
            <h3 className="text-base font-serif font-bold text-white border-b border-stone-800 pb-3">
              Endereço e Pagamento
            </h3>
            
            <div className="space-y-3 text-xs text-stone-300">
              <div className="flex items-start gap-2.5">
                <MapPin className="w-4 h-4 text-tomato-500 shrink-0 mt-0.5" />
                <div>
                  <p className="font-bold text-white">{formattedAddress}</p>
                </div>
              </div>

              <div className="pt-2 border-t border-stone-800/80 flex items-center justify-between">
                <span className="text-stone-400">Método de Pagamento:</span>
                <span className="font-bold text-amber-300">{order.paymentMethod}</span>
              </div>

              <div className="flex items-center justify-between">
                <span className="text-stone-400">Status do Pagamento:</span>
                <span className="px-2 py-0.5 rounded-lg bg-emerald-950 text-emerald-300 font-bold border border-emerald-500/30">
                  {order.paymentStatus === 'PAID' ? 'PAGO ✓' : 'PENDENTE'}
                </span>
              </div>
            </div>

            <button
              onClick={() => setShowReviewModal(true)}
              className="w-full mt-4 py-3 px-4 rounded-2xl bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 text-black font-black text-xs shadow-glow-gold transition-all flex items-center justify-center gap-2"
            >
              <Star className="w-4 h-4 fill-black" />
              <span>Avaliar Pizza e Atendimento</span>
            </button>
          </div>
        </div>

        {/* Back Action */}
        <div className="text-center pt-4">
          <button
            onClick={onBackToMenu}
            className="text-xs text-stone-400 hover:text-amber-400 underline transition-colors"
          >
            ← Voltar ao cardápio principal
          </button>
        </div>
      </div>

      {/* Review Modal */}
      <ReviewModal
        orderId={order.id}
        isOpen={showReviewModal}
        onClose={() => setShowReviewModal(false)}
        onSuccess={fetchOrder}
      />
    </div>
  );
};
