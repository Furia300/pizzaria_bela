import React, { useState, useEffect, useRef } from 'react';
import {
  MessageSquare,
  X,
  Send,
  ChefHat,
  Bike,
  Sparkles,
  User,
  CheckCheck,
  Flame,
  Volume2,
  Minimize2,
  Paperclip
} from 'lucide-react';
import { useStore } from '../../store/useStore';

interface ChatMessage {
  id: string;
  sender: 'user' | 'kitchen' | 'courier' | 'bot';
  senderName: string;
  avatarIcon: 'user' | 'chef' | 'bike' | 'bot';
  text: string;
  timestamp: string;
  isRead: boolean;
}

const INITIAL_MESSAGES: Record<'support' | 'courier' | 'bot', ChatMessage[]> = {
  support: [
    {
      id: 'msg-1',
      sender: 'kitchen',
      senderName: 'Chef Giovanni',
      avatarIcon: 'chef',
      text: 'Buonasera! Bem-vindo à Pizzeria Bella Notte. Nossos fornos estão a 480°C. Como posso te ajudar hoje?',
      timestamp: '19:42',
      isRead: true
    },
    {
      id: 'msg-2',
      sender: 'kitchen',
      senderName: 'Chef Giovanni',
      avatarIcon: 'chef',
      text: 'Dica do Chef: A Margherita Di Bufala com Borda Vulcão de Alho Poró é a nossa mais premiada da noite! 🍕',
      timestamp: '19:43',
      isRead: true
    }
  ],
  courier: [
    {
      id: 'msg-c1',
      sender: 'courier',
      senderName: 'Carlos "Veloz" Motoboy',
      avatarIcon: 'bike',
      text: 'Olá! Sou o Carlos, seu entregador. Já estou com a bag térmica aquecida aguardando seu pedido sair do forno!',
      timestamp: '19:45',
      isRead: true
    }
  ],
  bot: [
    {
      id: 'msg-b1',
      sender: 'bot',
      senderName: 'Bella Bot 🍕 (IA Gourmet)',
      avatarIcon: 'bot',
      text: 'Ciao! Sou a IA Sommelier da Bella Notte. Posso te sugerir a melhor combinação de pizzas, vinhos e cupons de desconto. O que você gostaria de comer hoje?',
      timestamp: '19:40',
      isRead: true
    }
  ]
};

const BOT_KNOWLEDGE: Record<string, string> = {
  cupom: '🎁 Use o cupom **BEMVINDO10** para 10% de desconto no primeiro pedido ou **BELLA15** para 15% acima de R$ 100!',
  vinho: '🍷 Para harmonizar com nossas pizzas clássicas, recomendamos o *Vinho Tinto Chianti DOCG Ruffino* da Toscana disponível no nosso cardápio de bebidas!',
  vegetariana: '🌱 Temos opções vegetarianas espetaculares: *Margherita Di Bufala D.O.P.* e a *Quattro Formaggi Trufada* com blend de queijos italianos!',
  doce: '🍓 Nossas pizzas doces são feitas no forno a lenha: *Nutella Pura com Morangos* e *Pistache Bronte Siciliano com Chocolate Branco*!',
  tempo: '⏱ Nosso tempo médio de forno e entrega é de apenas **25 a 35 minutos**, com rastreamento GPS ao vivo no mapa!'
};

export const LiveChatWidget: React.FC = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [activeChannel, setActiveChannel] = useState<'support' | 'courier' | 'bot'>('support');
  const [chatHistory, setChatHistory] = useState(INITIAL_MESSAGES);
  const [inputText, setInputText] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const [unreadCount, setUnreadCount] = useState(1);

  const messagesEndRef = useRef<HTMLDivElement>(null);
  const { user } = useStore();

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    if (isOpen) {
      scrollToBottom();
      setUnreadCount(0);
    }
  }, [isOpen, chatHistory, activeChannel]);

  // Audio chirp on message
  const playChatPop = () => {
    try {
      const ctx = new (window.AudioContext || (window as any).webkitAudioContext)();
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.type = 'sine';
      osc.frequency.setValueAtTime(800, ctx.currentTime);
      osc.frequency.exponentialRampToValueAtTime(1200, ctx.currentTime + 0.1);
      gain.gain.setValueAtTime(0.2, ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.15);
      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.start();
      osc.stop(ctx.currentTime + 0.15);
    } catch {}
  };

  const handleSendMessage = (textToSend?: string) => {
    const text = textToSend || inputText.trim();
    if (!text) return;

    const userMsg: ChatMessage = {
      id: `msg-${Date.now()}`,
      sender: 'user',
      senderName: user?.name || 'Você',
      avatarIcon: 'user',
      text: text,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      isRead: true
    };

    setChatHistory((prev) => ({
      ...prev,
      [activeChannel]: [...prev[activeChannel], userMsg]
    }));
    setInputText('');
    playChatPop();

    // Trigger realistic automated / bot response
    setIsTyping(true);
    setTimeout(() => {
      let replyText = 'Perfeito! Anotei seu recado. Nossa equipe na bancada já está cuidando do seu pedido com todo carinho!';

      if (activeChannel === 'bot') {
        const lower = text.toLowerCase();
        if (lower.includes('cupom') || lower.includes('desconto')) {
          replyText = BOT_KNOWLEDGE.cupom;
        } else if (lower.includes('vinho') || lower.includes('bebida')) {
          replyText = BOT_KNOWLEDGE.vinho;
        } else if (lower.includes('vegetariana') || lower.includes('sem carne')) {
          replyText = BOT_KNOWLEDGE.vegetariana;
        } else if (lower.includes('doce') || lower.includes('sobremesa') || lower.includes('nutella')) {
          replyText = BOT_KNOWLEDGE.doce;
        } else if (lower.includes('tempo') || lower.includes('demora') || lower.includes('rastreamento')) {
          replyText = BOT_KNOWLEDGE.tempo;
        } else {
          replyText = `Ótima escolha! Nossas pizzas utilizam farinha tipo 00 italiana e fermentação lenta de 48h. Você pode clicar em **"Monte sua Pizza"** no topo para personalizar metades ou pedir direto pelo cardápio! 🍕✨`;
        }
      } else if (activeChannel === 'courier') {
        replyText = 'Combinado! Assim que a pizza sair do forno a lenha, vou acelerar a moto e te aviso ao chegar na portaria! 🛵💨';
      } else if (activeChannel === 'support') {
        replyText = 'Comanda atualizada na cozinha! O Chef Marco já está finalizando no forno a 480°C. Bom apetite!';
      }

      const botReply: ChatMessage = {
        id: `reply-${Date.now()}`,
        sender: activeChannel === 'bot' ? 'bot' : activeChannel === 'courier' ? 'courier' : 'kitchen',
        senderName:
          activeChannel === 'bot'
            ? 'Bella Bot (IA)'
            : activeChannel === 'courier'
            ? 'Carlos Motoboy'
            : 'Chef Marco',
        avatarIcon: activeChannel === 'bot' ? 'bot' : activeChannel === 'courier' ? 'bike' : 'chef',
        text: replyText,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        isRead: true
      };

      setChatHistory((prev) => ({
        ...prev,
        [activeChannel]: [...prev[activeChannel], botReply]
      }));
      setIsTyping(false);
      playChatPop();
    }, 1200);
  };

  return (
    <>
      {/* Floating Launcher Button */}
      {!isOpen && (
        <button
          onClick={() => setIsOpen(true)}
          className="fixed bottom-6 right-6 z-50 p-4 rounded-full bg-gradient-to-r from-tomato-700 via-tomato-600 to-amber-600 hover:from-tomato-600 hover:to-amber-500 text-white shadow-[0_10px_30px_rgba(220,38,38,0.5)] hover:scale-110 active:scale-95 transition-all duration-300 flex items-center gap-2.5 group border-2 border-amber-400/40"
          aria-label="Abrir Chat de Conversas"
        >
          <div className="relative">
            <MessageSquare className="w-6 h-6 text-white group-hover:rotate-12 transition-transform" />
            {unreadCount > 0 && (
              <span className="absolute -top-2 -right-2 w-4 h-4 bg-amber-400 text-black text-[10px] font-black rounded-full flex items-center justify-center animate-pulse">
                {unreadCount}
              </span>
            )}
          </div>
          <span className="hidden sm:inline font-bold text-xs pr-1">Chat Bella Notte</span>
        </button>
      )}

      {/* Interactive Chat Window Modal */}
      {isOpen && (
        <div className="fixed bottom-4 right-4 sm:bottom-6 sm:right-6 z-50 w-[95vw] sm:w-[400px] h-[580px] max-h-[90vh] rounded-3xl bg-stone-950/95 border border-stone-800 shadow-[0_20px_60px_rgba(0,0,0,0.9)] backdrop-blur-xl flex flex-col overflow-hidden animate-in fade-in slide-in-from-bottom-5 duration-300">
          
          {/* Header */}
          <div className="bg-gradient-to-r from-wood-950 via-stone-900 to-stone-950 p-4 border-b border-stone-800 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="p-2.5 rounded-2xl bg-tomato-900 border border-tomato-500/40 text-tomato-300 shadow-glow-tomato">
                <Flame className="w-5 h-5 text-amber-400" />
              </div>
              <div>
                <h3 className="font-serif font-black text-white text-sm flex items-center gap-1.5">
                  <span>Chat Bella Notte</span>
                  <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping"></span>
                </h3>
                <p className="text-[10px] text-amber-300/80">Atendimento ao Vivo & IA Sommelier</p>
              </div>
            </div>

            <div className="flex items-center gap-1">
              <button
                onClick={() => setIsOpen(false)}
                className="p-1.5 rounded-lg text-stone-400 hover:text-white hover:bg-stone-800 transition-colors"
                title="Minimizar Chat"
              >
                <Minimize2 className="w-4 h-4" />
              </button>
              <button
                onClick={() => setIsOpen(false)}
                className="p-1.5 rounded-lg text-stone-400 hover:text-rose-400 hover:bg-stone-800 transition-colors"
                title="Fechar Chat"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
          </div>

          {/* Channel Selector Tabs */}
          <div className="grid grid-cols-3 gap-1 p-2 bg-stone-900/90 border-b border-stone-800 text-[11px] font-bold">
            <button
              onClick={() => setActiveChannel('support')}
              className={`py-1.5 px-2 rounded-xl transition-all flex items-center justify-center gap-1.5 ${
                activeChannel === 'support'
                  ? 'bg-amber-500 text-black shadow-md'
                  : 'text-stone-400 hover:text-stone-200 hover:bg-stone-800'
              }`}
            >
              <ChefHat className="w-3.5 h-3.5" />
              <span>Cozinha</span>
            </button>

            <button
              onClick={() => setActiveChannel('courier')}
              className={`py-1.5 px-2 rounded-xl transition-all flex items-center justify-center gap-1.5 ${
                activeChannel === 'courier'
                  ? 'bg-amber-500 text-black shadow-md'
                  : 'text-stone-400 hover:text-stone-200 hover:bg-stone-800'
              }`}
            >
              <Bike className="w-3.5 h-3.5" />
              <span>Motoboy</span>
            </button>

            <button
              onClick={() => setActiveChannel('bot')}
              className={`py-1.5 px-2 rounded-xl transition-all flex items-center justify-center gap-1.5 ${
                activeChannel === 'bot'
                  ? 'bg-amber-500 text-black shadow-md'
                  : 'text-stone-400 hover:text-stone-200 hover:bg-stone-800'
              }`}
            >
              <Sparkles className="w-3.5 h-3.5 text-amber-300" />
              <span>IA Bot</span>
            </button>
          </div>

          {/* Messages Scroll Area */}
          <div className="flex-1 p-4 overflow-y-auto space-y-3 text-xs">
            {chatHistory[activeChannel].map((msg) => {
              const isUser = msg.sender === 'user';
              return (
                <div
                  key={msg.id}
                  className={`flex flex-col ${isUser ? 'items-end' : 'items-start'} space-y-1`}
                >
                  <div className="flex items-center gap-1.5 text-[10px] text-stone-400 px-1">
                    {!isUser && <span className="font-semibold text-amber-400">{msg.senderName}</span>}
                    <span>{msg.timestamp}</span>
                  </div>

                  <div
                    className={`max-w-[82%] p-3 rounded-2xl text-xs leading-relaxed shadow-md ${
                      isUser
                        ? 'bg-gradient-to-r from-tomato-700 to-tomato-600 text-white rounded-br-none border border-tomato-500/40'
                        : 'bg-stone-900 border border-stone-800 text-stone-200 rounded-bl-none'
                    }`}
                  >
                    <p className="whitespace-pre-wrap">{msg.text}</p>
                  </div>
                </div>
              );
            })}

            {isTyping && (
              <div className="flex items-center gap-2 text-stone-400 text-xs bg-stone-900/60 p-2.5 rounded-2xl w-fit border border-stone-800 animate-pulse">
                <span className="w-2 h-2 rounded-full bg-amber-400 animate-bounce"></span>
                <span className="w-2 h-2 rounded-full bg-amber-400 animate-bounce [animation-delay:0.2s]"></span>
                <span className="w-2 h-2 rounded-full bg-amber-400 animate-bounce [animation-delay:0.4s]"></span>
                <span className="text-[11px] text-stone-400 ml-1">Digitando resposta...</span>
              </div>
            )}

            <div ref={messagesEndRef} />
          </div>

          {/* Quick Suggestion Chips */}
          {activeChannel === 'bot' && (
            <div className="px-3 py-1.5 bg-stone-950 flex items-center gap-1.5 overflow-x-auto border-t border-stone-900 scrollbar-none text-[10px]">
              <button
                onClick={() => handleSendMessage('Qual o cupom de desconto de hoje?')}
                className="px-2.5 py-1 rounded-full bg-stone-900 hover:bg-stone-800 text-amber-300 border border-stone-800 flex-shrink-0 transition-colors"
              >
                🎁 Cupons
              </button>
              <button
                onClick={() => handleSendMessage('Qual vinho combina com a pizza margherita?')}
                className="px-2.5 py-1 rounded-full bg-stone-900 hover:bg-stone-800 text-stone-300 border border-stone-800 flex-shrink-0 transition-colors"
              >
                🍷 Harmonização
              </button>
              <button
                onClick={() => handleSendMessage('Quais opções são vegetarianas?')}
                className="px-2.5 py-1 rounded-full bg-stone-900 hover:bg-stone-800 text-stone-300 border border-stone-800 flex-shrink-0 transition-colors"
              >
                🌱 Vegetarianas
              </button>
              <button
                onClick={() => handleSendMessage('Quanto tempo demora a entrega?')}
                className="px-2.5 py-1 rounded-full bg-stone-900 hover:bg-stone-800 text-stone-300 border border-stone-800 flex-shrink-0 transition-colors"
              >
                ⏱ Tempo
              </button>
            </div>
          )}

          {/* Message Input Box */}
          <form
            onSubmit={(e) => {
              e.preventDefault();
              handleSendMessage();
            }}
            className="p-3 bg-stone-900 border-t border-stone-800 flex items-center gap-2"
          >
            <input
              type="text"
              value={inputText}
              onChange={(e) => setInputText(e.target.value)}
              placeholder={
                activeChannel === 'bot'
                  ? 'Pergunte sobre pizzas, vinhos ou cupons...'
                  : activeChannel === 'courier'
                  ? 'Fale direto com o motoboy...'
                  : 'Fale com a equipe da cozinha...'
              }
              className="flex-1 bg-stone-950 border border-stone-700 rounded-xl px-3.5 py-2.5 text-xs text-stone-100 placeholder-stone-500 focus:outline-none focus:border-amber-500 transition-colors"
            />

            <button
              type="submit"
              disabled={!inputText.trim()}
              className="p-2.5 rounded-xl bg-amber-500 hover:bg-amber-400 disabled:opacity-40 disabled:hover:bg-amber-500 text-black font-bold transition-all shadow-md flex items-center justify-center"
              aria-label="Enviar mensagem"
            >
              <Send className="w-4 h-4" />
            </button>
          </form>

        </div>
      )}
    </>
  );
};
