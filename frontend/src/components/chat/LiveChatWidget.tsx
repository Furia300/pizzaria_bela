import React, { useState, useEffect, useRef } from 'react';
import {
  MessageSquare,
  X,
  Send,
  ChefHat,
  Bike,
  Sparkles,
  User,
  Users,
  CheckCheck,
  Flame,
  Volume2,
  Minimize2,
  Plus,
  Search,
  Phone,
  MapPin,
  Clock,
  Star,
  ChevronRight,
  ArrowLeft,
  Pizza
} from 'lucide-react';
import { useStore } from '../../store/useStore';

export interface CustomerContact {
  id: string;
  name: string;
  phone: string;
  address: string;
  orderCount: number;
  isVip?: boolean;
  avatarColor: string;
  favoritePizza: string;
  lastMessageTime: string;
  messages: {
    id: string;
    sender: 'user' | 'customer';
    senderName: string;
    text: string;
    timestamp: string;
  }[];
}

const INITIAL_CONTACTS: CustomerContact[] = [
  {
    id: 'cont-1',
    name: 'Mariana Silva',
    phone: '(11) 98765-4321',
    address: 'Rua Oscar Freire, 1420 - Jardins',
    orderCount: 5,
    isVip: true,
    avatarColor: 'from-amber-500 to-amber-700',
    favoritePizza: 'Pepperoni Supremo & Hot Honey',
    lastMessageTime: '15:20',
    messages: [
      {
        id: 'm1',
        sender: 'customer',
        senderName: 'Mariana Silva',
        text: 'Boa tarde! A massa de hoje está bem crocante? Adorei a pizza da semana passada!',
        timestamp: '15:18'
      },
      {
        id: 'm2',
        sender: 'user',
        senderName: 'Pizzaria Bella Notte',
        text: 'Olá Mariana! Sim, nossa massa passou por 48h de fermentação lenta. Está perfeita!',
        timestamp: '15:20'
      }
    ]
  },
  {
    id: 'cont-2',
    name: 'Rodrigo Medeiros',
    phone: '(11) 97123-8899',
    address: 'Av. Paulista, 2100 - Apto 84',
    orderCount: 3,
    isVip: false,
    avatarColor: 'from-blue-500 to-indigo-700',
    favoritePizza: '1/2 Margherita + 1/2 Quattro Formaggi',
    lastMessageTime: '14:45',
    messages: [
      {
        id: 'm3',
        sender: 'customer',
        senderName: 'Rodrigo Medeiros',
        text: 'Vocês conseguem colocar a borda vulcão de alho poró no meu pedido de hoje?',
        timestamp: '14:40'
      },
      {
        id: 'm4',
        sender: 'user',
        senderName: 'Pizzaria Bella Notte',
        text: 'Com certeza Rodrigo! Borda vulcão anotada na sua comanda.',
        timestamp: '14:45'
      }
    ]
  },
  {
    id: 'cont-3',
    name: 'Beatriz Fontana',
    phone: '(11) 98822-4411',
    address: 'Rua dos Pinheiros, 650 - Pinheiros',
    orderCount: 12,
    isVip: true,
    avatarColor: 'from-rose-500 to-red-700',
    favoritePizza: 'Margherita Di Bufala D.O.P.',
    lastMessageTime: '12:10',
    messages: [
      {
        id: 'm5',
        sender: 'customer',
        senderName: 'Beatriz Fontana',
        text: 'Oi equipe! Quero pedir 3 pizzas para a reunião de hoje à noite às 20h. Podem reservar?',
        timestamp: '12:05'
      },
      {
        id: 'm6',
        sender: 'user',
        senderName: 'Pizzaria Bella Notte',
        text: 'Olá Beatriz! Reserva confirmada para as 20h com saída prioritária!',
        timestamp: '12:10'
      }
    ]
  },
  {
    id: 'cont-4',
    name: 'Lucas Albuquerque',
    phone: '(11) 99887-1122',
    address: 'Alameda Santos, 1800 - Cerqueira César',
    orderCount: 2,
    isVip: false,
    avatarColor: 'from-emerald-500 to-teal-700',
    favoritePizza: 'Calabresa Artesanal & Nutella',
    lastMessageTime: 'Ontem',
    messages: [
      {
        id: 'm7',
        sender: 'customer',
        senderName: 'Lucas Albuquerque',
        text: 'A entrega foi super rápida ontem, obrigado!',
        timestamp: 'Ontem'
      }
    ]
  }
];

export const LiveChatWidget: React.FC = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [activeChannel, setActiveChannel] = useState<'contacts' | 'kitchen' | 'courier' | 'bot'>('contacts');
  const [selectedContact, setSelectedContact] = useState<CustomerContact | null>(null);
  const [contacts, setContacts] = useState<CustomerContact[]>(INITIAL_CONTACTS);
  const [searchContact, setSearchContact] = useState('');
  const [showAddContactModal, setShowAddContactModal] = useState(false);
  
  // New Contact Form fields
  const [newName, setNewName] = useState('');
  const [newPhone, setNewPhone] = useState('');
  const [newAddress, setNewAddress] = useState('');
  const [newFavoritePizza, setNewFavoritePizza] = useState('Margherita Di Bufala');

  // Input message state
  const [inputText, setInputText] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const [unreadCount, setUnreadCount] = useState(2);

  // Channels history for kitchen, courier and bot
  const [generalHistory, setGeneralHistory] = useState({
    kitchen: [
      {
        id: 'k1',
        sender: 'kitchen',
        senderName: 'Chef Giovanni',
        text: 'Buonasera! Bancada a todo vapor e forno a 480°C. O que deseja consultar sobre as comandas?',
        timestamp: '15:00'
      }
    ],
    courier: [
      {
        id: 'c1',
        sender: 'courier',
        senderName: 'Carlos "Veloz" Motoboy',
        text: 'Fala parceiro! Estou pronto para iniciar as entregas na região. Alguma rota especial?',
        timestamp: '15:10'
      }
    ],
    bot: [
      {
        id: 'b1',
        sender: 'bot',
        senderName: 'Bella Bot 🍕 (IA Sommelier)',
        text: 'Ciao! Posso te sugerir a melhor combinação de pizzas, vinhos e cupons de desconto. O que gostaria hoje?',
        timestamp: '15:00'
      }
    ]
  });

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
  }, [isOpen, selectedContact, generalHistory, activeChannel]);

  // Audio chirp on message
  const playChatPop = () => {
    try {
      const ctx = new (window.AudioContext || (window as any).webkitAudioContext)();
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.type = 'sine';
      osc.frequency.setValueAtTime(750, ctx.currentTime);
      osc.frequency.exponentialRampToValueAtTime(1100, ctx.currentTime + 0.1);
      gain.gain.setValueAtTime(0.25, ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.15);
      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.start();
      osc.stop(ctx.currentTime + 0.15);
    } catch {}
  };

  const handleSendMessageToContact = (textToSend?: string) => {
    const text = textToSend || inputText.trim();
    if (!text || !selectedContact) return;

    const timeNow = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    const newMsg = {
      id: `msg-${Date.now()}`,
      sender: 'user' as const,
      senderName: user?.name || 'Pizzaria Bella Notte',
      text: text,
      timestamp: timeNow
    };

    setContacts((prev) =>
      prev.map((c) =>
        c.id === selectedContact.id
          ? {
              ...c,
              lastMessageTime: timeNow,
              messages: [...c.messages, newMsg]
            }
          : c
      )
    );

    setSelectedContact((prev) =>
      prev ? { ...prev, lastMessageTime: timeNow, messages: [...prev.messages, newMsg] } : null
    );
    setInputText('');
    playChatPop();

    // Customer simulated reply
    setIsTyping(true);
    setTimeout(() => {
      const replies = [
        'Perfeito, muito obrigado pelo atendimento rápido!',
        'Excelente! Já estou aguardando a chegada da pizza aqui.',
        'Combinado! O pessoal aqui em casa é apaixonado pelas pizzas de vocês.',
        'Show de bola! Valeu demais!'
      ];
      const randomReply = replies[Math.floor(Math.random() * replies.length)];

      const customerReply = {
        id: `reply-${Date.now()}`,
        sender: 'customer' as const,
        senderName: selectedContact.name,
        text: randomReply,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
      };

      setContacts((prev) =>
        prev.map((c) =>
          c.id === selectedContact.id
            ? {
                ...c,
                messages: [...c.messages, customerReply]
              }
            : c
        )
      );

      setSelectedContact((prev) =>
        prev ? { ...prev, messages: [...prev.messages, customerReply] } : null
      );
      setIsTyping(false);
      playChatPop();
    }, 1400);
  };

  const handleSendGeneralMessage = (textToSend?: string) => {
    const text = textToSend || inputText.trim();
    if (!text || activeChannel === 'contacts') return;

    const timeNow = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    const newMsg = {
      id: `gen-${Date.now()}`,
      sender: 'user',
      senderName: user?.name || 'Você',
      text: text,
      timestamp: timeNow
    };

    setGeneralHistory((prev) => ({
      ...prev,
      [activeChannel]: [...prev[activeChannel], newMsg]
    }));
    setInputText('');
    playChatPop();

    setIsTyping(true);
    setTimeout(() => {
      let reply = 'Mensagem recebida com sucesso!';
      if (activeChannel === 'bot') {
        const lower = text.toLowerCase();
        if (lower.includes('cupom')) {
          reply = '🎁 Use o cupom **BEMVINDO10** para 10% OFF ou **BELLA15** para 15% acima de R$ 100!';
        } else if (lower.includes('vinho')) {
          reply = '🍷 Sugiro o *Vinho Tinto Chianti DOCG Ruffino* para harmonizar com a Margherita ou Parma!';
        } else {
          reply = 'Pizzas artesanais napolitanas assadas a 480°C com fermentação 48h. Bom apetite! 🍕✨';
        }
      } else if (activeChannel === 'kitchen') {
        reply = 'Comanda anotada! Chef Marco já está no forno a lenha preparando com todo capricho.';
      } else if (activeChannel === 'courier') {
        reply = 'Beleza! Assim que a bag for carregada, sigo direto pro destino! 🛵💨';
      }

      const replyMsg = {
        id: `reply-gen-${Date.now()}`,
        sender: activeChannel,
        senderName:
          activeChannel === 'bot'
            ? 'Bella Bot (IA)'
            : activeChannel === 'kitchen'
            ? 'Chef Giovanni'
            : 'Carlos Motoboy',
        text: reply,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
      };

      setGeneralHistory((prev) => ({
        ...prev,
        [activeChannel]: [...prev[activeChannel], replyMsg]
      }));
      setIsTyping(false);
      playChatPop();
    }, 1200);
  };

  const handleAddNewContact = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newName.trim() || !newPhone.trim()) return;

    const colors = [
      'from-amber-500 to-amber-700',
      'from-rose-500 to-red-700',
      'from-emerald-500 to-teal-700',
      'from-purple-500 to-indigo-700'
    ];
    const pickedColor = colors[Math.floor(Math.random() * colors.length)];

    const newContact: CustomerContact = {
      id: `cont-${Date.now()}`,
      name: newName.trim(),
      phone: newPhone.trim(),
      address: newAddress.trim() || 'Balcão / Salão Físico',
      orderCount: 1,
      isVip: false,
      avatarColor: pickedColor,
      favoritePizza: newFavoritePizza,
      lastMessageTime: 'Agora',
      messages: [
        {
          id: `m-init-${Date.now()}`,
          sender: 'user',
          senderName: 'Pizzaria Bella Notte',
          text: `Olá ${newName}! Cadastro salvo com sucesso na Bella Notte. É um prazer ter você como cliente!`,
          timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
        }
      ]
    };

    setContacts([newContact, ...contacts]);
    setSelectedContact(newContact);
    setShowAddContactModal(false);
    setNewName('');
    setNewPhone('');
    setNewAddress('');
  };

  const filteredContacts = contacts.filter(
    (c) =>
      c.name.toLowerCase().includes(searchContact.toLowerCase()) ||
      c.phone.includes(searchContact) ||
      c.address.toLowerCase().includes(searchContact.toLowerCase())
  );

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
          <span className="hidden sm:inline font-bold text-xs pr-1">Chat & Contatos Salvos</span>
        </button>
      )}

      {/* Interactive Chat Window Modal */}
      {isOpen && (
        <div className="fixed bottom-4 right-4 sm:bottom-6 sm:right-6 z-50 w-[95vw] sm:w-[440px] h-[620px] max-h-[92vh] rounded-3xl bg-stone-950/95 border border-stone-800 shadow-[0_25px_70px_rgba(0,0,0,0.95)] backdrop-blur-2xl flex flex-col overflow-hidden animate-in fade-in slide-in-from-bottom-5 duration-300">
          
          {/* Header */}
          <div className="bg-gradient-to-r from-wood-950 via-stone-900 to-stone-950 p-4 border-b border-stone-800 flex items-center justify-between">
            <div className="flex items-center gap-3">
              {selectedContact && activeChannel === 'contacts' ? (
                <button
                  onClick={() => setSelectedContact(null)}
                  className="p-1.5 rounded-xl bg-stone-800 hover:bg-stone-700 text-stone-200 transition-colors"
                  title="Voltar para a lista de contatos"
                >
                  <ArrowLeft className="w-4 h-4" />
                </button>
              ) : (
                <div className="p-2.5 rounded-2xl bg-tomato-900 border border-tomato-500/40 text-tomato-300 shadow-glow-tomato">
                  <Flame className="w-5 h-5 text-amber-400" />
                </div>
              )}

              <div>
                <h3 className="font-serif font-black text-white text-sm flex items-center gap-1.5">
                  {selectedContact && activeChannel === 'contacts' ? (
                    <>
                      <span>{selectedContact.name}</span>
                      {selectedContact.isVip && (
                        <span className="px-1.5 py-0.2 rounded bg-amber-500/20 text-amber-300 text-[10px] border border-amber-500/40">
                          VIP
                        </span>
                      )}
                    </>
                  ) : (
                    <>
                      <span>Chat Bella Notte • Contatos</span>
                      <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping"></span>
                    </>
                  )}
                </h3>
                <p className="text-[10px] text-amber-300/80">
                  {selectedContact && activeChannel === 'contacts'
                    ? selectedContact.phone
                    : 'Atendimento ao Cliente & Clientes Físicos'}
                </p>
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

          {/* Top Channel Navigation Tabs */}
          <div className="grid grid-cols-4 gap-1 p-2 bg-stone-900/90 border-b border-stone-800 text-[11px] font-bold">
            <button
              onClick={() => {
                setActiveChannel('contacts');
              }}
              className={`py-1.5 px-1.5 rounded-xl transition-all flex items-center justify-center gap-1 ${
                activeChannel === 'contacts'
                  ? 'bg-amber-500 text-black shadow-md font-black'
                  : 'text-stone-400 hover:text-stone-200 hover:bg-stone-800'
              }`}
            >
              <Users className="w-3.5 h-3.5" />
              <span>Clientes ({contacts.length})</span>
            </button>

            <button
              onClick={() => {
                setActiveChannel('kitchen');
                setSelectedContact(null);
              }}
              className={`py-1.5 px-1.5 rounded-xl transition-all flex items-center justify-center gap-1 ${
                activeChannel === 'kitchen'
                  ? 'bg-amber-500 text-black shadow-md font-black'
                  : 'text-stone-400 hover:text-stone-200 hover:bg-stone-800'
              }`}
            >
              <ChefHat className="w-3.5 h-3.5" />
              <span>Cozinha</span>
            </button>

            <button
              onClick={() => {
                setActiveChannel('courier');
                setSelectedContact(null);
              }}
              className={`py-1.5 px-1.5 rounded-xl transition-all flex items-center justify-center gap-1 ${
                activeChannel === 'courier'
                  ? 'bg-amber-500 text-black shadow-md font-black'
                  : 'text-stone-400 hover:text-stone-200 hover:bg-stone-800'
              }`}
            >
              <Bike className="w-3.5 h-3.5" />
              <span>Motoboy</span>
            </button>

            <button
              onClick={() => {
                setActiveChannel('bot');
                setSelectedContact(null);
              }}
              className={`py-1.5 px-1.5 rounded-xl transition-all flex items-center justify-center gap-1 ${
                activeChannel === 'bot'
                  ? 'bg-amber-500 text-black shadow-md font-black'
                  : 'text-stone-400 hover:text-stone-200 hover:bg-stone-800'
              }`}
            >
              <Sparkles className="w-3.5 h-3.5 text-amber-300" />
              <span>IA Bot</span>
            </button>
          </div>

          {/* ================= VIEW 1: CONTACTS LIST ================= */}
          {activeChannel === 'contacts' && !selectedContact && (
            <div className="flex-1 flex flex-col overflow-hidden bg-stone-950">
              
              {/* Search & Add Bar */}
              <div className="p-3 border-b border-stone-800/80 space-y-2">
                <div className="flex items-center gap-2">
                  <div className="flex-1 relative">
                    <Search className="w-3.5 h-3.5 text-stone-500 absolute left-3 top-1/2 -translate-y-1/2" />
                    <input
                      type="text"
                      value={searchContact}
                      onChange={(e) => setSearchContact(e.target.value)}
                      placeholder="Buscar cliente, telefone ou rua..."
                      className="w-full bg-stone-900 border border-stone-800 rounded-xl pl-9 pr-3 py-2 text-xs text-stone-200 placeholder-stone-500 focus:outline-none focus:border-amber-500"
                    />
                  </div>

                  <button
                    onClick={() => setShowAddContactModal(true)}
                    className="p-2 rounded-xl bg-tomato-700 hover:bg-tomato-600 text-white transition-colors shadow-glow-tomato flex items-center gap-1 text-xs font-bold shrink-0"
                    title="Cadastrar Novo Cliente Físico"
                  >
                    <Plus className="w-4 h-4" />
                    <span className="hidden sm:inline">Novo</span>
                  </button>
                </div>
              </div>

              {/* Contacts Scroll List */}
              <div className="flex-1 overflow-y-auto divide-y divide-stone-900 p-2 space-y-1">
                {filteredContacts.map((contact) => (
                  <div
                    key={contact.id}
                    onClick={() => setSelectedContact(contact)}
                    className="p-3 rounded-2xl hover:bg-stone-900/90 transition-all cursor-pointer flex items-center justify-between gap-3 group border border-transparent hover:border-stone-800"
                  >
                    <div className="flex items-center gap-3 min-w-0">
                      <div
                        className={`w-10 h-10 rounded-2xl bg-gradient-to-tr ${contact.avatarColor} flex items-center justify-center font-bold text-white text-sm shadow-md shrink-0`}
                      >
                        {contact.name.charAt(0)}
                      </div>

                      <div className="min-w-0 space-y-0.5">
                        <div className="flex items-center gap-1.5">
                          <span className="font-bold text-stone-100 text-xs truncate">
                            {contact.name}
                          </span>
                          {contact.isVip && (
                            <Star className="w-3 h-3 text-amber-400 fill-amber-400 shrink-0" />
                          )}
                        </div>

                        <p className="text-[11px] text-stone-400 flex items-center gap-1 truncate">
                          <MapPin className="w-3 h-3 text-tomato-400 shrink-0" />
                          <span>{contact.address}</span>
                        </p>

                        <p className="text-[10px] text-amber-400/90 flex items-center gap-1">
                          <Pizza className="w-2.5 h-2.5" />
                          <span className="truncate">Favorita: {contact.favoritePizza}</span>
                        </p>
                      </div>
                    </div>

                    <div className="flex flex-col items-end gap-1 shrink-0">
                      <span className="text-[10px] text-stone-500 font-medium">
                        {contact.lastMessageTime}
                      </span>
                      <span className="px-2 py-0.5 rounded-md bg-stone-900 text-stone-300 text-[10px] border border-stone-800 font-bold">
                        {contact.orderCount} pedidos
                      </span>
                    </div>
                  </div>
                ))}
              </div>

            </div>
          )}

          {/* ================= VIEW 2: DIRECT CHAT WITH SELECTED CONTACT ================= */}
          {activeChannel === 'contacts' && selectedContact && (
            <div className="flex-1 flex flex-col overflow-hidden bg-stone-950">
              
              {/* Contact Top Info Ribbon */}
              <div className="p-2.5 bg-stone-900/60 border-b border-stone-800/80 flex items-center justify-between text-[11px] text-stone-300">
                <div className="flex items-center gap-2">
                  <Phone className="w-3 h-3 text-amber-400" />
                  <span>{selectedContact.phone}</span>
                </div>
                <div className="flex items-center gap-1 text-emerald-400 font-semibold">
                  <Clock className="w-3 h-3" />
                  <span>{selectedContact.orderCount} Pedidos Realizados</span>
                </div>
              </div>

              {/* Messages Area */}
              <div className="flex-1 p-4 overflow-y-auto space-y-3 text-xs">
                {selectedContact.messages.map((m) => {
                  const isUser = m.sender === 'user';
                  return (
                    <div
                      key={m.id}
                      className={`flex flex-col ${isUser ? 'items-end' : 'items-start'} space-y-1`}
                    >
                      <div className="flex items-center gap-1.5 text-[10px] text-stone-400 px-1">
                        {!isUser && <span className="font-semibold text-amber-400">{m.senderName}</span>}
                        <span>{m.timestamp}</span>
                      </div>

                      <div
                        className={`max-w-[85%] p-3 rounded-2xl text-xs leading-relaxed shadow-md ${
                          isUser
                            ? 'bg-gradient-to-r from-tomato-700 to-tomato-600 text-white rounded-br-none border border-tomato-500/40'
                            : 'bg-stone-900 border border-stone-800 text-stone-200 rounded-bl-none'
                        }`}
                      >
                        <p className="whitespace-pre-wrap">{m.text}</p>
                      </div>
                    </div>
                  );
                })}

                {isTyping && (
                  <div className="flex items-center gap-2 text-stone-400 text-xs bg-stone-900/60 p-2.5 rounded-2xl w-fit border border-stone-800 animate-pulse">
                    <span className="w-2 h-2 rounded-full bg-amber-400 animate-bounce"></span>
                    <span className="w-2 h-2 rounded-full bg-amber-400 animate-bounce [animation-delay:0.2s]"></span>
                    <span className="w-2 h-2 rounded-full bg-amber-400 animate-bounce [animation-delay:0.4s]"></span>
                    <span className="text-[11px] text-stone-400 ml-1">{selectedContact.name} está digitando...</span>
                  </div>
                )}

                <div ref={messagesEndRef} />
              </div>

              {/* Quick Customer Reply Suggestions */}
              <div className="px-3 py-1.5 bg-stone-950 flex items-center gap-1.5 overflow-x-auto border-t border-stone-900 scrollbar-none text-[10px]">
                <button
                  onClick={() => handleSendMessageToContact('Sua pizza acabou de ir para o forno a lenha! 🍕🔥')}
                  className="px-2.5 py-1 rounded-full bg-stone-900 hover:bg-stone-800 text-amber-300 border border-stone-800 flex-shrink-0"
                >
                  🔥 No Forno
                </button>
                <button
                  onClick={() => handleSendMessageToContact('O motoboy acabou de sair com sua entrega! 🛵')}
                  className="px-2.5 py-1 rounded-full bg-stone-900 hover:bg-stone-800 text-stone-300 border border-stone-800 flex-shrink-0"
                >
                  🛵 Saiu para Entrega
                </button>
                <button
                  onClick={() => handleSendMessageToContact('Temos 15% de desconto para o seu próximo pedido com o cupom BELLA15! 🎁')}
                  className="px-2.5 py-1 rounded-full bg-stone-900 hover:bg-stone-800 text-stone-300 border border-stone-800 flex-shrink-0"
                >
                  🎁 Cupom 15%
                </button>
              </div>

              {/* Contact Message Input */}
              <form
                onSubmit={(e) => {
                  e.preventDefault();
                  handleSendMessageToContact();
                }}
                className="p-3 bg-stone-900 border-t border-stone-800 flex items-center gap-2"
              >
                <input
                  type="text"
                  value={inputText}
                  onChange={(e) => setInputText(e.target.value)}
                  placeholder={`Mensagem para ${selectedContact.name}...`}
                  className="flex-1 bg-stone-950 border border-stone-700 rounded-xl px-3.5 py-2.5 text-xs text-stone-100 placeholder-stone-500 focus:outline-none focus:border-amber-500 transition-colors"
                />

                <button
                  type="submit"
                  disabled={!inputText.trim()}
                  className="p-2.5 rounded-xl bg-amber-500 hover:bg-amber-400 disabled:opacity-40 disabled:hover:bg-amber-500 text-black font-bold transition-all shadow-md flex items-center justify-center"
                >
                  <Send className="w-4 h-4" />
                </button>
              </form>

            </div>
          )}

          {/* ================= VIEW 3: CHANNELS (KITCHEN / COURIER / BOT) ================= */}
          {activeChannel !== 'contacts' && (
            <div className="flex-1 flex flex-col overflow-hidden bg-stone-950">
              <div className="flex-1 p-4 overflow-y-auto space-y-3 text-xs">
                {generalHistory[activeChannel].map((msg) => {
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
                        className={`max-w-[85%] p-3 rounded-2xl text-xs leading-relaxed shadow-md ${
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
                    <span className="text-[11px] text-stone-400 ml-1">Digitando...</span>
                  </div>
                )}

                <div ref={messagesEndRef} />
              </div>

              {/* General Message Input */}
              <form
                onSubmit={(e) => {
                  e.preventDefault();
                  handleSendGeneralMessage();
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
                  className="p-2.5 rounded-xl bg-amber-500 hover:bg-amber-400 disabled:opacity-40 text-black font-bold transition-all shadow-md"
                >
                  <Send className="w-4 h-4" />
                </button>
              </form>
            </div>
          )}

          {/* ================= MODAL: CADASTRAR NOVO CLIENTE FÍSICO ================= */}
          {showAddContactModal && (
            <div className="absolute inset-0 z-50 bg-stone-950/90 backdrop-blur-md p-6 flex flex-col justify-center animate-in fade-in duration-200">
              <div className="bg-stone-900 border border-stone-700 rounded-3xl p-6 space-y-4 shadow-2xl">
                <div className="flex items-center justify-between border-b border-stone-800 pb-3">
                  <div className="flex items-center gap-2">
                    <User className="w-5 h-5 text-amber-400" />
                    <h4 className="font-bold text-white text-sm">Salvar Novo Cliente Físico</h4>
                  </div>
                  <button
                    onClick={() => setShowAddContactModal(false)}
                    className="text-stone-400 hover:text-white"
                  >
                    <X className="w-4 h-4" />
                  </button>
                </div>

                <form onSubmit={handleAddNewContact} className="space-y-3 text-xs">
                  <div>
                    <label className="text-stone-400 font-semibold block mb-1">Nome Completo:</label>
                    <input
                      type="text"
                      required
                      value={newName}
                      onChange={(e) => setNewName(e.target.value)}
                      placeholder="Ex: Carlos Eduardo"
                      className="w-full bg-stone-950 border border-stone-700 rounded-xl p-2.5 text-stone-100 focus:border-amber-500 focus:outline-none"
                    />
                  </div>

                  <div>
                    <label className="text-stone-400 font-semibold block mb-1">Telefone / WhatsApp:</label>
                    <input
                      type="text"
                      required
                      value={newPhone}
                      onChange={(e) => setNewPhone(e.target.value)}
                      placeholder="Ex: (11) 98765-0000"
                      className="w-full bg-stone-950 border border-stone-700 rounded-xl p-2.5 text-stone-100 focus:border-amber-500 focus:outline-none"
                    />
                  </div>

                  <div>
                    <label className="text-stone-400 font-semibold block mb-1">Endereço / Mesa:</label>
                    <input
                      type="text"
                      value={newAddress}
                      onChange={(e) => setNewAddress(e.target.value)}
                      placeholder="Ex: Rua Bela Cintra, 450 ou Mesa 04"
                      className="w-full bg-stone-950 border border-stone-700 rounded-xl p-2.5 text-stone-100 focus:border-amber-500 focus:outline-none"
                    />
                  </div>

                  <div>
                    <label className="text-stone-400 font-semibold block mb-1">Pizza Favorita:</label>
                    <select
                      value={newFavoritePizza}
                      onChange={(e) => setNewFavoritePizza(e.target.value)}
                      className="w-full bg-stone-950 border border-stone-700 rounded-xl p-2.5 text-stone-100 focus:border-amber-500 focus:outline-none"
                    >
                      <option value="Margherita Di Bufala D.O.P.">Margherita Di Bufala D.O.P.</option>
                      <option value="Calabresa Artesanal">Calabresa Artesanal</option>
                      <option value="Quattro Formaggi Trufada">Quattro Formaggi Trufada</option>
                      <option value="Pepperoni Supremo">Pepperoni Supremo</option>
                      <option value="Nutella com Morango">Nutella com Morango</option>
                    </select>
                  </div>

                  <div className="pt-2 flex gap-2">
                    <button
                      type="button"
                      onClick={() => setShowAddContactModal(false)}
                      className="flex-1 py-2.5 rounded-xl bg-stone-800 hover:bg-stone-700 text-stone-300 font-bold"
                    >
                      Cancelar
                    </button>
                    <button
                      type="submit"
                      className="flex-1 py-2.5 rounded-xl bg-amber-500 hover:bg-amber-400 text-black font-black shadow-glow-gold"
                    >
                      Salvar Cliente
                    </button>
                  </div>
                </form>
              </div>
            </div>
          )}

        </div>
      )}
    </>
  );
};
