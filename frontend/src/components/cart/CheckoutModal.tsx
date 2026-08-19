import React, { useState } from 'react';
import { X, MapPin, CreditCard, QrCode, Banknote, ShieldCheck, CheckCircle2, Copy, Check, Sparkles } from 'lucide-react';
import { useStore } from '../../store/useStore';
import confetti from 'canvas-confetti';

interface CheckoutModalProps {
  isOpen: boolean;
  onClose: () => void;
  onOrderSuccess: (orderId: string) => void;
}

export const CheckoutModal: React.FC<CheckoutModalProps> = ({ isOpen, onClose, onOrderSuccess }) => {
  const {
    items,
    appliedCoupon,
    deliveryFee,
    getSubtotal,
    getTotal,
    clearCart,
    user
  } = useStore();

  const [name, setName] = useState(user?.name || 'Diogo Oliveira');
  const [phone, setPhone] = useState(user?.phone || '(11) 98765-4321');
  const [email, setEmail] = useState(user?.email || 'diogo@bellanotte.com.br');
  
  const [street, setStreet] = useState('Avenida Paulista');
  const [number, setNumber] = useState('1578');
  const [complement, setComplement] = useState('Apt 102');
  const [neighborhood, setNeighborhood] = useState('Bela Vista');
  const [city, setCity] = useState('São Paulo');
  const [zipCode, setZipCode] = useState('01310-200');

  const [paymentMethod, setPaymentMethod] = useState<'PIX' | 'CREDIT_CARD' | 'CASH'>('PIX');
  
  // Card form states
  const [cardNumber, setCardNumber] = useState('4532 1122 3344 5566');
  const [cardHolder, setCardHolder] = useState('DIOGO OLIVEIRA');
  const [expiryDate, setExpiryDate] = useState('12/28');
  const [cvv, setCvv] = useState('888');

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  
  // Pix generation response state
  const [pixData, setPixData] = useState<{ txId: string; qrCodeCopyPaste: string; orderId: string } | null>(null);
  const [copiedPix, setCopiedPix] = useState(false);

  if (!isOpen) return null;

  const total = getTotal();

  const handleCopyPix = () => {
    if (pixData?.qrCodeCopyPaste) {
      navigator.clipboard.writeText(pixData.qrCodeCopyPaste);
      setCopiedPix(true);
      setTimeout(() => setCopiedPix(false), 2500);
    }
  };

  const handleSubmitOrder = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    const randomOrderNum = Math.floor(1050 + Math.random() * 900);
    const mockOrderId = `ped-${randomOrderNum}`;

    try {
      const orderPayload = {
        guestName: name.trim() || 'Cliente Bella Notte',
        guestPhone: phone.trim() || '(11) 99999-0000',
        guestEmail: email.trim() || 'cliente@bellanotte.com',
        items: items.map((item) => ({
          productId: item.product?.id,
          variantId: item.variant?.id,
          quantity: item.quantity,
          unitPrice: item.unitPrice,
          customConfig: item.customConfig,
          notes: item.notes
        })),
        deliveryAddress: {
          street,
          number,
          complement,
          neighborhood,
          city,
          state: 'SP',
          zipCode,
          lat: -23.561414,
          lng: -46.655881
        },
        deliveryFee,
        couponCode: appliedCoupon?.code,
        paymentMethod
      };

      // Try calling local backend API if available
      try {
        const res = await fetch('http://localhost:4000/api/orders', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(orderPayload)
        });
        if (res.ok) {
          const data = await res.json();
          if (paymentMethod === 'PIX' && data.payment) {
            setPixData({
              txId: data.payment.txId,
              qrCodeCopyPaste: data.payment.qrCodeCopyPaste,
              orderId: data.order.id
            });
            clearCart();
            confetti({ particleCount: 90, spread: 70, origin: { y: 0.6 } });
            setLoading(false);
            return;
          } else {
            clearCart();
            confetti({ particleCount: 140, spread: 90, origin: { y: 0.6 } });
            onClose();
            onOrderSuccess(data.order.id);
            setLoading(false);
            return;
          }
        }
      } catch {}

      // Fallback for GitHub Pages static hosting
      if (paymentMethod === 'PIX') {
        const pixPayloadStr = `00020126580014br.gov.bcb.pix0136123e4567-e89b-12d3-a456-4266141740005204000053039865405${total.toFixed(
          2
        )}5802BR5925PIZZERIA BELLA NOTTE6009SAO PAULO62070503***6304`;
        setPixData({
          txId: `tx-${Date.now()}`,
          qrCodeCopyPaste: pixPayloadStr,
          orderId: mockOrderId
        });
        clearCart();
        confetti({ particleCount: 100, spread: 80, origin: { y: 0.6 } });
      } else {
        clearCart();
        confetti({ particleCount: 150, spread: 100, origin: { y: 0.6 } });
        onClose();
        onOrderSuccess(mockOrderId);
      }
    } catch (err: any) {
      setError(err.message || 'Ocorreu um erro ao enviar seu pedido.');
    } finally {
      setLoading(false);
    }
  };

  const handleConfirmPixPaid = () => {
    if (!pixData?.orderId) return;
    confetti({ particleCount: 120, spread: 80, origin: { y: 0.5 } });
    onClose();
    onOrderSuccess(pixData.orderId);
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-black/80 backdrop-blur-md flex items-center justify-center p-3 sm:p-6 animate-in fade-in duration-200">
      <div className="relative w-full max-w-2xl bg-wood-900 border border-stone-700/80 rounded-3xl shadow-2xl overflow-hidden flex flex-col max-h-[92vh]">
        
        {/* Header */}
        <div className="px-6 py-4 bg-wood-850 border-b border-stone-800 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-2xl bg-tomato-900/50 border border-tomato-500/40 text-tomato-400 shadow-glow-tomato">
              <ShieldCheck className="w-6 h-6" />
            </div>
            <div>
              <h2 className="text-xl font-serif font-bold text-white">Finalização do Pedido</h2>
              <p className="text-xs text-stone-400">Entrega rápida & Pagamento seguro com PIX ou Cartão</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 rounded-xl text-stone-400 hover:text-white hover:bg-stone-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Body */}
        <div className="flex-1 overflow-y-auto p-6 space-y-6">
          
          {/* If PIX QR Code generated, show PIX Screen */}
          {pixData ? (
            <div className="text-center space-y-5 py-4">
              <div className="w-16 h-16 rounded-full bg-emerald-950 border border-emerald-500 flex items-center justify-center mx-auto text-emerald-400 shadow-glow-gold">
                <QrCode className="w-8 h-8" />
              </div>

              <div className="space-y-1">
                <h3 className="text-xl font-serif font-bold text-white">Pague via PIX para Confirmar</h3>
                <p className="text-xs text-stone-300">
                  Escaneie o QR Code no seu app bancário ou utilize o código Copia e Cola abaixo.
                </p>
              </div>

              {/* QR Code Graphic Display */}
              <div className="p-4 bg-white rounded-3xl inline-block shadow-2xl mx-auto border-4 border-amber-400/40">
                <img
                  src={`https://api.qrserver.com/v1/create-qr-code/?size=180x180&data=${encodeURIComponent(
                    pixData.qrCodeCopyPaste
                  )}`}
                  alt="QR Code PIX para pagamento"
                  className="w-44 h-44 mx-auto"
                />
              </div>

              {/* Copy & Paste Code */}
              <div className="max-w-md mx-auto space-y-2">
                <div className="p-3 rounded-2xl bg-stone-950 border border-stone-800 text-[11px] text-stone-400 break-all font-mono select-all">
                  {pixData.qrCodeCopyPaste}
                </div>

                <button
                  type="button"
                  onClick={handleCopyPix}
                  className="w-full py-2.5 px-4 rounded-xl bg-stone-800 hover:bg-stone-700 text-amber-400 text-xs font-bold transition-all flex items-center justify-center gap-2 border border-stone-700 shadow-md"
                >
                  {copiedPix ? <Check className="w-4 h-4 text-emerald-400" /> : <Copy className="w-4 h-4" />}
                  <span>{copiedPix ? 'Código Copiado com Sucesso!' : 'Copiar Código PIX (Copia e Cola)'}</span>
                </button>
              </div>

              <div className="pt-4 border-t border-stone-800 flex flex-col sm:flex-row gap-3">
                <button
                  type="button"
                  onClick={handleConfirmPixPaid}
                  disabled={loading}
                  className="w-full py-3.5 px-6 rounded-2xl bg-gradient-to-r from-emerald-600 to-emerald-500 hover:from-emerald-500 hover:to-emerald-400 text-white font-bold text-sm shadow-glow-gold transition-all flex items-center justify-center gap-2"
                >
                  <CheckCircle2 className="w-5 h-5" />
                  <span>Já realizei o pagamento PIX → Acompanhar Pedido ao Vivo</span>
                </button>
              </div>
            </div>
          ) : (
            <form id="checkout-form" onSubmit={handleSubmitOrder} className="space-y-6">
              
              {/* Client Contact Info */}
              <div className="space-y-3">
                <label className="text-xs font-bold text-amber-400 uppercase tracking-wider block">
                  1. Seus Dados de Contato
                </label>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  <div>
                    <input
                      type="text"
                      required
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      placeholder="Nome Completo *"
                      className="w-full bg-stone-900 border border-stone-700 rounded-xl px-3.5 py-2.5 text-xs text-white placeholder-stone-500 focus:border-amber-500 focus:outline-none"
                    />
                  </div>
                  <div>
                    <input
                      type="tel"
                      required
                      value={phone}
                      onChange={(e) => setPhone(e.target.value)}
                      placeholder="WhatsApp / Telefone *"
                      className="w-full bg-stone-900 border border-stone-700 rounded-xl px-3.5 py-2.5 text-xs text-white placeholder-stone-500 focus:border-amber-500 focus:outline-none"
                    />
                  </div>
                  <div>
                    <input
                      type="email"
                      required
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      placeholder="E-mail *"
                      className="w-full bg-stone-900 border border-stone-700 rounded-xl px-3.5 py-2.5 text-xs text-white placeholder-stone-500 focus:border-amber-500 focus:outline-none"
                    />
                  </div>
                </div>
              </div>

              {/* Delivery Address */}
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <label className="text-xs font-bold text-amber-400 uppercase tracking-wider flex items-center gap-1.5">
                    <MapPin className="w-4 h-4 text-tomato-500" />
                    <span>2. Endereço de Entrega</span>
                  </label>
                  <span className="text-[11px] text-emerald-400 font-medium">
                    Área de cobertura em SP ativa
                  </span>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-4 gap-3">
                  <div className="sm:col-span-3">
                    <input
                      type="text"
                      required
                      value={street}
                      onChange={(e) => setStreet(e.target.value)}
                      placeholder="Rua / Avenida *"
                      className="w-full bg-stone-900 border border-stone-700 rounded-xl px-3.5 py-2.5 text-xs text-white placeholder-stone-500 focus:border-amber-500 focus:outline-none"
                    />
                  </div>
                  <div>
                    <input
                      type="text"
                      required
                      value={number}
                      onChange={(e) => setNumber(e.target.value)}
                      placeholder="Número *"
                      className="w-full bg-stone-900 border border-stone-700 rounded-xl px-3.5 py-2.5 text-xs text-white placeholder-stone-500 focus:border-amber-500 focus:outline-none"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  <div>
                    <input
                      type="text"
                      value={complement}
                      onChange={(e) => setComplement(e.target.value)}
                      placeholder="Complemento (Apt, Bloco)"
                      className="w-full bg-stone-900 border border-stone-700 rounded-xl px-3.5 py-2.5 text-xs text-white placeholder-stone-500 focus:border-amber-500 focus:outline-none"
                    />
                  </div>
                  <div>
                    <input
                      type="text"
                      required
                      value={neighborhood}
                      onChange={(e) => setNeighborhood(e.target.value)}
                      placeholder="Bairro *"
                      className="w-full bg-stone-900 border border-stone-700 rounded-xl px-3.5 py-2.5 text-xs text-white placeholder-stone-500 focus:border-amber-500 focus:outline-none"
                    />
                  </div>
                  <div>
                    <input
                      type="text"
                      required
                      value={zipCode}
                      onChange={(e) => setZipCode(e.target.value)}
                      placeholder="CEP (00000-000) *"
                      className="w-full bg-stone-900 border border-stone-700 rounded-xl px-3.5 py-2.5 text-xs text-white placeholder-stone-500 focus:border-amber-500 focus:outline-none"
                    />
                  </div>
                </div>
              </div>

              {/* Payment Methods */}
              <div className="space-y-3">
                <label className="text-xs font-bold text-amber-400 uppercase tracking-wider block">
                  3. Forma de Pagamento
                </label>
                
                <div className="grid grid-cols-3 gap-3">
                  <button
                    type="button"
                    onClick={() => setPaymentMethod('PIX')}
                    className={`p-3 rounded-2xl border flex flex-col items-center justify-center gap-1.5 transition-all ${
                      paymentMethod === 'PIX'
                        ? 'border-emerald-500 bg-emerald-950/50 text-emerald-300 font-bold shadow-glow-gold'
                        : 'border-stone-800 bg-stone-900/60 text-stone-400 hover:border-stone-700'
                    }`}
                  >
                    <QrCode className="w-5 h-5 text-emerald-400" />
                    <span className="text-xs">PIX Instantâneo</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => setPaymentMethod('CREDIT_CARD')}
                    className={`p-3 rounded-2xl border flex flex-col items-center justify-center gap-1.5 transition-all ${
                      paymentMethod === 'CREDIT_CARD'
                        ? 'border-amber-500 bg-amber-500/20 text-amber-300 font-bold shadow-glow-gold'
                        : 'border-stone-800 bg-stone-900/60 text-stone-400 hover:border-stone-700'
                    }`}
                  >
                    <CreditCard className="w-5 h-5 text-amber-400" />
                    <span className="text-xs">Cartão de Crédito</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => setPaymentMethod('CASH')}
                    className={`p-3 rounded-2xl border flex flex-col items-center justify-center gap-1.5 transition-all ${
                      paymentMethod === 'CASH'
                        ? 'border-amber-500 bg-amber-500/20 text-amber-300 font-bold shadow-glow-gold'
                        : 'border-stone-800 bg-stone-900/60 text-stone-400 hover:border-stone-700'
                    }`}
                  >
                    <Banknote className="w-5 h-5 text-amber-400" />
                    <span className="text-xs">Dinheiro na Entrega</span>
                  </button>
                </div>

                {/* Credit Card Fields */}
                {paymentMethod === 'CREDIT_CARD' && (
                  <div className="p-4 bg-wood-950/70 border border-stone-800 rounded-2xl space-y-3 animate-in fade-in duration-200">
                    <div>
                      <label className="text-[11px] text-stone-400 block mb-1">Número do Cartão:</label>
                      <input
                        type="text"
                        required
                        value={cardNumber}
                        onChange={(e) => setCardNumber(e.target.value)}
                        placeholder="0000 0000 0000 0000"
                        className="w-full bg-stone-900 border border-stone-700 rounded-xl px-3 py-2 text-xs text-white focus:border-amber-500 focus:outline-none font-mono"
                      />
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                      <div>
                        <label className="text-[11px] text-stone-400 block mb-1">Nome no Cartão:</label>
                        <input
                          type="text"
                          required
                          value={cardHolder}
                          onChange={(e) => setCardHolder(e.target.value.toUpperCase())}
                          placeholder="NOME IMPRESSO"
                          className="w-full bg-stone-900 border border-stone-700 rounded-xl px-3 py-2 text-xs text-white focus:border-amber-500 focus:outline-none"
                        />
                      </div>
                      <div>
                        <label className="text-[11px] text-stone-400 block mb-1">Validade (MM/AA):</label>
                        <input
                          type="text"
                          required
                          value={expiryDate}
                          onChange={(e) => setExpiryDate(e.target.value)}
                          placeholder="12/28"
                          className="w-full bg-stone-900 border border-stone-700 rounded-xl px-3 py-2 text-xs text-white focus:border-amber-500 focus:outline-none font-mono"
                        />
                      </div>
                      <div>
                        <label className="text-[11px] text-stone-400 block mb-1">CVV:</label>
                        <input
                          type="text"
                          required
                          maxLength={4}
                          value={cvv}
                          onChange={(e) => setCvv(e.target.value)}
                          placeholder="123"
                          className="w-full bg-stone-900 border border-stone-700 rounded-xl px-3 py-2 text-xs text-white focus:border-amber-500 focus:outline-none font-mono"
                        />
                      </div>
                    </div>
                  </div>
                )}
              </div>

              {error && (
                <div className="p-3 rounded-xl bg-red-950/80 border border-red-500 text-xs text-red-300 font-medium">
                  {error}
                </div>
              )}
            </form>
          )}
        </div>

        {/* Modal Footer */}
        {!pixData && (
          <div className="px-6 py-4 bg-wood-850 border-t border-stone-800 flex flex-col sm:flex-row items-center justify-between gap-4">
            <div>
              <span className="text-xs text-stone-400 block">Total do Pedido</span>
              <div className="text-2xl font-serif font-black text-amber-400">
                R$ {total.toFixed(2)}
              </div>
            </div>

            <button
              type="submit"
              form="checkout-form"
              disabled={loading}
              className="w-full sm:w-auto px-8 py-3.5 rounded-2xl bg-gradient-to-r from-tomato-700 to-tomato-600 hover:from-tomato-600 hover:to-tomato-500 active:scale-95 text-white font-bold text-sm shadow-glow-tomato transition-all flex items-center justify-center gap-2"
            >
              {loading ? (
                <span>Processando...</span>
              ) : (
                <>
                  <CheckCircle2 className="w-5 h-5" />
                  <span>Confirmar e Enviar Pedido</span>
                </>
              )}
            </button>
          </div>
        )}
      </div>
    </div>
  );
};
