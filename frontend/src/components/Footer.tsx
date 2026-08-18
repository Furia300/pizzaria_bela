import React from 'react';
import { Flame, MapPin, Phone, Clock, Heart, ShieldCheck } from 'lucide-react';

export const Footer: React.FC = () => {
  return (
    <footer className="bg-wood-950 border-t border-stone-800/80 text-stone-400 text-xs py-12 px-4 sm:px-6 lg:px-8">
      <div className="container mx-auto max-w-7xl grid grid-cols-1 md:grid-cols-4 gap-8 mb-8">
        
        {/* Col 1: Brand */}
        <div className="space-y-3">
          <div className="flex items-center gap-2">
            <Flame className="w-5 h-5 text-tomato-500" />
            <span className="text-base font-serif font-bold text-white">
              Pizzeria Bella Notte
            </span>
          </div>
          <p className="text-stone-400 font-light leading-relaxed">
            A autêntica pizza napolitana feita com paixão, farinha italiana 00, fermentação lenta 48h e forno a lenha a 480°C.
          </p>
        </div>

        {/* Col 2: Horários */}
        <div className="space-y-2">
          <h4 className="text-white font-serif font-bold uppercase tracking-wider text-xs flex items-center gap-1.5">
            <Clock className="w-4 h-4 text-amber-400" />
            <span>Horário de Funcionamento</span>
          </h4>
          <p>Terça a Quinta: 18:00 às 23:30</p>
          <p>Sexta a Domingo: 18:00 às 00:30</p>
          <p className="text-stone-500">Segunda-feira: Descanso dos pizzaiolos</p>
        </div>

        {/* Col 3: Localização & Contato */}
        <div className="space-y-2">
          <h4 className="text-white font-serif font-bold uppercase tracking-wider text-xs flex items-center gap-1.5">
            <MapPin className="w-4 h-4 text-tomato-500" />
            <span>Endereço & Contato</span>
          </h4>
          <p>Avenida Paulista, 1578 — Bela Vista, São Paulo - SP</p>
          <p className="flex items-center gap-1">
            <Phone className="w-3.5 h-3.5 text-emerald-400" />
            <span>(11) 98888-0000 / (11) 3254-9900</span>
          </p>
        </div>

        {/* Col 4: Garantia e Qualidade */}
        <div className="space-y-2">
          <h4 className="text-white font-serif font-bold uppercase tracking-wider text-xs flex items-center gap-1.5">
            <ShieldCheck className="w-4 h-4 text-amber-400" />
            <span>Padrão de Qualidade D.O.P.</span>
          </h4>
          <p>Ingredientes com selo de denominação de origem protegida importados da região da Campânia, Itália.</p>
        </div>
      </div>

      <div className="container mx-auto max-w-7xl pt-6 border-t border-stone-900 flex flex-col sm:flex-row items-center justify-between gap-3 text-stone-500 text-[11px]">
        <p>© 2026 Insta Livre Pizza / Pizzeria Bella Notte. Todos os direitos reservados.</p>
        <p className="flex items-center gap-1">
          Feito com <Heart className="w-3 h-3 text-tomato-500 fill-tomato-500" /> e tecnologia em tempo real.
        </p>
      </div>
    </footer>
  );
};
