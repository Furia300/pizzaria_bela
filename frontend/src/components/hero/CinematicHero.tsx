import React, { useEffect, useRef, useState } from 'react';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { Flame, Sparkles, ChefHat, ArrowDown, ShoppingBag } from 'lucide-react';
import { useStore } from '../../store/useStore';
import heroPizzaImg from '../../assets/hero-pizza.jpg';

gsap.registerPlugin(ScrollTrigger);

export const CinematicHero: React.FC = () => {
  const containerRef = useRef<HTMLDivElement>(null);
  const heroContentRef = useRef<HTMLDivElement>(null);
  const pizzaMainRef = useRef<HTMLDivElement>(null);
  const cheeseLayerRef = useRef<HTMLDivElement>(null);
  const tomatoesGroupRef = useRef<HTMLDivElement>(null);
  const herbsGroupRef = useRef<HTMLDivElement>(null);
  const titleLettersRef = useRef<HTMLHeadingElement>(null);
  const ctaGroupRef = useRef<HTMLDivElement>(null);
  const emberParticlesRef = useRef<HTMLDivElement>(null);

  const { setCustomizerOpen } = useStore();
  const [mousePos, setMousePos] = useState({ x: 0, y: 0 });

  useEffect(() => {
    // Check prefers-reduced-motion
    const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

    if (prefersReducedMotion) {
      // Show clean static ready-state
      if (pizzaMainRef.current) gsap.set(pizzaMainRef.current, { scale: 1, opacity: 1 });
      if (ctaGroupRef.current) gsap.set(ctaGroupRef.current, { opacity: 1, y: 0 });
      return;
    }

    const ctx = gsap.context(() => {
      // Master entry timeline
      const masterTl = gsap.timeline({ defaults: { ease: 'power3.out' } });

      masterTl.addLabel('start');

      // Cena 0: Embers & background ambient glow
      masterTl.fromTo(
        '.hero-ambient-glow',
        { opacity: 0.2, scale: 0.8 },
        { opacity: 0.85, scale: 1.1, duration: 2, ease: 'sine.inOut', yoyo: true, repeat: -1 },
        'start'
      );

      // Cena 1 (0-0.6s): Dough stretching opening
      masterTl.fromTo(
        pizzaMainRef.current,
        { scale: 0.6, opacity: 0, rotation: -15 },
        {
          scale: 1,
          opacity: 1,
          rotation: 0,
          duration: 0.8,
          ease: 'back.out(1.4)'
        },
        'start'
      );

      // Cena 2 (0.2-0.8s): Flying toppings cascade into place
      masterTl.fromTo(
        '.flying-tomato',
        { y: -100, scale: 0.3, opacity: 0, rotateZ: () => gsap.utils.random(-60, 60) },
        {
          y: 0,
          scale: 1,
          opacity: 1,
          rotateZ: 0,
          duration: 0.7,
          stagger: 0.08,
          ease: 'power3.out'
        },
        'start+=0.2'
      );

      masterTl.fromTo(
        '.flying-herb',
        { y: -60, scale: 0.2, opacity: 0, rotateZ: () => gsap.utils.random(-90, 90) },
        {
          y: 0,
          scale: 1,
          opacity: 1,
          rotateZ: 0,
          duration: 0.6,
          stagger: 0.05,
          ease: 'power2.out'
        },
        'start+=0.3'
      );

      // Cena 3 (0.3-0.8s): Title & CTAs reveal
      masterTl.fromTo(
        '.title-word',
        { y: 30, opacity: 0, rotateX: -20 },
        {
          y: 0,
          opacity: 1,
          rotateX: 0,
          stagger: 0.08,
          duration: 0.6,
          ease: 'power3.out'
        },
        'start+=0.2'
      );

      masterTl.fromTo(
        ctaGroupRef.current,
        { y: 20, opacity: 0 },
        { y: 0, opacity: 1, duration: 0.5, ease: 'power2.out' },
        'start+=0.4'
      );

      // Continuous floating physics for toppings
      gsap.to('.floating-ambient', {
        y: 'random(-10, 10)',
        x: 'random(-8, 8)',
        rotation: 'random(-6, 6)',
        duration: 3.5,
        repeat: -1,
        yoyo: true,
        ease: 'sine.inOut',
        stagger: 0.2
      });

      // Cena 4: Parallax ScrollTrigger without pin reparenting
      const scrollTl = gsap.timeline({
        scrollTrigger: {
          trigger: containerRef.current,
          start: 'top top',
          end: 'bottom top',
          scrub: 1.2
        }
      });

      // Layer 1: Background oven scale & glow
      scrollTl.to('.hero-oven-bg', { scale: 1.15, filter: 'brightness(0.6)' }, 0);

      // Layer 2: Main pizza zoom & cinematic rotation
      scrollTl.to(pizzaMainRef.current, { scale: 1.15, rotation: 10, y: -30 }, 0);

      // Layer 3: Foreground flying toppings moving faster (depth effect)
      scrollTl.to(tomatoesGroupRef.current, { y: -100, x: -20, scale: 1.1 }, 0);
      scrollTl.to(herbsGroupRef.current, { y: -70, x: 30, rotation: 20 }, 0);

      // Fade out CTA into menu transition
      scrollTl.to(heroContentRef.current, { opacity: 0.2, y: -40 }, 0.5);
    }, containerRef);

    return () => {
      ctx.revert();
      ScrollTrigger.getAll().forEach((t) => t.kill());
    };
  }, []);

  // Subtle interactive mouse parallax
  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    const { clientX, clientY } = e;
    const { innerWidth, innerHeight } = window;
    const x = (clientX / innerWidth - 0.5) * 20;
    const y = (clientY / innerHeight - 0.5) * 20;
    setMousePos({ x, y });
  };

  const scrollToMenu = () => {
    const menuEl = document.getElementById('cardapio-section');
    if (menuEl) {
      menuEl.scrollIntoView({ behavior: 'smooth' });
    }
  };

  return (
    <section
      ref={containerRef}
      onMouseMove={handleMouseMove}
      className="relative w-full min-h-screen bg-wood-950 overflow-hidden flex items-center justify-center pt-16"
      style={{ perspective: '1000px' }}
    >
      {/* Background Oven Atmosphere & Ambient Embers */}
      <div className="absolute inset-0 z-0 overflow-hidden pointer-events-none">
        <div className="hero-oven-bg absolute inset-0 bg-radial-gradient from-amber-950/40 via-stone-950/90 to-wood-950 transition-transform duration-700"></div>
        <div className="hero-ambient-glow absolute -top-40 left-1/2 -translate-x-1/2 w-[800px] h-[800px] bg-tomato-700/20 rounded-full blur-[140px] pointer-events-none"></div>
        <div className="hero-ambient-glow absolute bottom-0 left-1/4 w-[600px] h-[600px] bg-gold-600/15 rounded-full blur-[120px] pointer-events-none"></div>
        
        {/* Ember Sparkles Layer */}
        <div ref={emberParticlesRef} className="absolute inset-0 opacity-40">
          <div className="absolute top-1/4 left-1/5 w-1.5 h-1.5 bg-amber-400 rounded-full animate-pulse blur-[0.5px]"></div>
          <div className="absolute top-1/3 right-1/4 w-2 h-2 bg-orange-500 rounded-full animate-bounce blur-[1px]"></div>
          <div className="absolute bottom-1/3 left-1/3 w-1 h-1 bg-yellow-300 rounded-full animate-pulse"></div>
          <div className="absolute top-2/3 right-1/5 w-2 h-2 bg-red-500 rounded-full animate-ping"></div>
        </div>
      </div>

      {/* Main Hero Container */}
      <div className="container mx-auto px-4 md:px-8 max-w-7xl z-10 grid grid-cols-1 lg:grid-cols-12 gap-8 items-center min-h-[85vh]">
        
        {/* Left Column: Editorial Italian Typography & CTAs */}
        <div ref={heroContentRef} className="lg:col-span-6 space-y-6 text-center lg:text-left pt-6 lg:pt-0">
          
          <div className="inline-flex items-center gap-2.5 px-4 py-1.5 rounded-full bg-tomato-900/40 border border-tomato-500/30 text-amber-300 text-xs md:text-sm font-medium backdrop-blur-md shadow-glow-tomato">
            <Flame className="w-4 h-4 text-tomato-500 animate-pulse" />
            <span>Forno a Lenha 480°C • Fermentação Lenta 48 Horas</span>
          </div>

          <h1
            ref={titleLettersRef}
            className="text-4xl sm:text-5xl md:text-6xl lg:text-7xl font-serif font-black tracking-tight leading-[1.08]"
          >
            <span className="title-word inline-block text-stone-100">A Verdadeira</span>{' '}
            <span className="title-word inline-block gold-gradient-text">Arte da Pizza</span>{' '}
            <span className="title-word inline-block text-stone-200">Napolitana.</span>
          </h1>

          <p className="text-base sm:text-lg text-stone-300 max-w-xl mx-auto lg:mx-0 font-light leading-relaxed">
            Massa aerada e crocante, molho de tomates San Marzano colhidos na encosta do Vesúvio, 
            mussarela de búfala derretida e orégano fresco. Cada fatia é uma viagem a Nápoles.
          </p>

          {/* Action CTAs */}
          <div
            ref={ctaGroupRef}
            className="flex flex-col sm:flex-row items-center justify-center lg:justify-start gap-4 pt-2"
          >
            <button
              onClick={scrollToMenu}
              className="w-full sm:w-auto px-8 py-4 rounded-xl bg-gradient-to-r from-tomato-700 to-tomato-600 hover:from-tomato-600 hover:to-tomato-500 text-white font-bold text-base shadow-glow-tomato hover:scale-105 active:scale-95 transition-all duration-300 flex items-center justify-center gap-3 group"
            >
              <ShoppingBag className="w-5 h-5 group-hover:rotate-12 transition-transform" />
              <span>Pedir Agora</span>
            </button>

            <button
              onClick={() => setCustomizerOpen(true)}
              className="w-full sm:w-auto px-7 py-4 rounded-xl bg-stone-900/80 hover:bg-stone-800/90 text-amber-300 font-semibold text-base border border-amber-500/40 hover:border-amber-400 backdrop-blur-md hover:scale-105 active:scale-95 transition-all duration-300 flex items-center justify-center gap-2.5 shadow-card-dark"
            >
              <ChefHat className="w-5 h-5 text-amber-400" />
              <span>Monte sua Pizza</span>
            </button>
          </div>

          {/* Badges / Social Proof */}
          <div className="pt-4 flex items-center justify-center lg:justify-start gap-6 text-xs text-stone-400 font-medium">
            <div className="flex items-center gap-1.5">
              <Sparkles className="w-4 h-4 text-amber-400" />
              <span>100% Farinha 00 Italiana</span>
            </div>
            <div className="flex items-center gap-1.5">
              <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
              <span>Entrega ao Vivo em 35min</span>
            </div>
          </div>
        </div>

        {/* Right Column: Dynamic Multi-Layer Pizza Showcase with Flying Ingredients */}
        <div className="lg:col-span-6 relative flex items-center justify-center min-h-[380px] sm:min-h-[460px] md:min-h-[520px]">
          
          {/* Layer 0: Background Warm Glow */}
          <div
            className="absolute w-72 h-72 sm:w-96 sm:h-96 rounded-full bg-gradient-to-tr from-amber-600/30 to-red-600/30 blur-3xl pointer-events-none"
            style={{
              transform: `translate(${mousePos.x * 0.5}px, ${mousePos.y * 0.5}px)`
            }}
          ></div>

          {/* Layer 1: Main Artisan Pizza Base (High-Resolution Generated Asset) */}
          <div
            ref={pizzaMainRef}
            className="relative z-10 w-[300px] sm:w-[390px] md:w-[460px] aspect-square rounded-full shadow-2xl transition-transform duration-200 ease-out"
            style={{
              transform: `translate(${mousePos.x * 0.3}px, ${mousePos.y * 0.3}px)`
            }}
          >
            <img
              src={heroPizzaImg}
              alt="Pizza Artesanal Pizzeria Bella Notte saindo do forno a lenha com queijo derretido e fatias de tomate"
              className="w-full h-full object-cover rounded-full shadow-[0_20px_50px_rgba(0,0,0,0.9)] border-4 border-amber-900/30"
              loading="eager"
            />

            {/* Layer 2: Melted Gooey Cheese Stretch Layer Overlay */}
            <div
              ref={cheeseLayerRef}
              className="absolute inset-0 rounded-full pointer-events-none bg-gradient-to-b from-transparent via-amber-200/10 to-amber-500/20 mix-blend-overlay"
            ></div>
          </div>

          {/* Layer 3: Flying Juicy Cherry Tomatoes Group */}
          <div
            ref={tomatoesGroupRef}
            className="absolute inset-0 z-20 pointer-events-none"
            style={{
              transform: `translate(${mousePos.x * 0.8}px, ${mousePos.y * 0.8}px)`
            }}
          >
            {/* Tomato 1 - Top Left Flying */}
            <div className="flying-tomato floating-ambient absolute top-4 left-6 sm:left-12 w-14 h-14 sm:w-18 sm:h-18">
              <svg viewBox="0 0 100 100" className="w-full h-full drop-shadow-[0_15px_15px_rgba(220,38,38,0.7)]">
                <circle cx="50" cy="50" r="42" fill="url(#tomatoGrad1)" />
                <ellipse cx="40" cy="38" rx="20" ry="12" fill="#ef4444" opacity="0.6" />
                <circle cx="36" cy="34" r="5" fill="#ffffff" opacity="0.8" />
                <path d="M48 10 C46 20, 54 20, 52 10" stroke="#15803d" strokeWidth="4" fill="none" />
                <defs>
                  <radialGradient id="tomatoGrad1" cx="35%" cy="35%" r="65%">
                    <stop offset="0%" stopColor="#f87171" />
                    <stop offset="60%" stopColor="#dc2626" />
                    <stop offset="100%" stopColor="#7f1d1d" />
                  </radialGradient>
                </defs>
              </svg>
            </div>

            {/* Tomato 2 - Center Right Juicy Slice */}
            <div className="flying-tomato floating-ambient absolute top-1/4 -right-2 sm:right-6 w-16 h-16 sm:w-20 sm:h-20">
              <svg viewBox="0 0 100 100" className="w-full h-full drop-shadow-[0_15px_20px_rgba(185,28,28,0.8)]">
                <path d="M15 50 A35 35 0 0 1 85 50 Z" fill="url(#tomatoSliceGrad)" />
                <ellipse cx="50" cy="50" rx="32" ry="14" fill="#f87171" opacity="0.7" />
                <circle cx="40" cy="50" r="3" fill="#fef08a" />
                <circle cx="60" cy="50" r="3" fill="#fef08a" />
                <defs>
                  <linearGradient id="tomatoSliceGrad" x1="0%" y1="0%" x2="100%" y2="100%">
                    <stop offset="0%" stopColor="#ef4444" />
                    <stop offset="100%" stopColor="#991b1b" />
                  </linearGradient>
                </defs>
              </svg>
            </div>

            {/* Tomato 3 - Bottom Left Flying with Splash */}
            <div className="flying-tomato floating-ambient absolute bottom-6 left-10 sm:left-20 w-12 h-12 sm:w-16 sm:h-16">
              <svg viewBox="0 0 100 100" className="w-full h-full drop-shadow-[0_10px_15px_rgba(220,38,38,0.6)]">
                <circle cx="50" cy="50" r="38" fill="#b91c1c" />
                <circle cx="42" cy="40" r="8" fill="#ffffff" opacity="0.5" />
              </svg>
            </div>
          </div>

          {/* Layer 4: Flying Green Basil Leaves and Floating Oregano Flakes */}
          <div
            ref={herbsGroupRef}
            className="absolute inset-0 z-30 pointer-events-none"
            style={{
              transform: `translate(${mousePos.x * 1.1}px, ${mousePos.y * 1.1}px)`
            }}
          >
            {/* Basil Leaf 1 - Top Center */}
            <div className="flying-herb floating-ambient absolute top-1 right-1/3 w-10 h-10 sm:w-12 sm:h-12 rotate-[-25deg]">
              <svg viewBox="0 0 60 60" className="w-full h-full drop-shadow-[0_8px_12px_rgba(21,128,61,0.7)]">
                <path d="M10 30 C10 10, 50 10, 50 30 C50 50, 10 50, 10 30 Z" fill="#16a34a" />
                <path d="M10 30 Q30 30 50 30" stroke="#15803d" strokeWidth="2" fill="none" />
              </svg>
            </div>

            {/* Basil Leaf 2 - Bottom Right */}
            <div className="flying-herb floating-ambient absolute bottom-12 right-8 w-12 h-12 sm:w-14 sm:h-14 rotate-[45deg]">
              <svg viewBox="0 0 60 60" className="w-full h-full drop-shadow-[0_8px_14px_rgba(21,128,61,0.8)]">
                <path d="M15 30 C15 12, 45 12, 45 30 C45 48, 15 48, 15 30 Z" fill="#15803d" />
                <path d="M15 30 Q30 30 45 30" stroke="#166534" strokeWidth="2" fill="none" />
              </svg>
            </div>

            {/* Floating Oregano Flakes (Particles) */}
            <div className="flying-herb absolute top-12 left-1/4 w-3 h-3 bg-emerald-600 rounded-sm rotate-45 opacity-80"></div>
            <div className="flying-herb absolute top-2/3 left-12 w-2.5 h-2.5 bg-emerald-700 rounded-full opacity-90"></div>
            <div className="flying-herb absolute bottom-20 right-1/4 w-3 h-2 bg-emerald-500 rounded-sm rotate-12 opacity-85"></div>
            <div className="flying-herb absolute top-1/2 -right-4 w-3.5 h-3 bg-emerald-600 rounded-sm rotate-[-30deg] opacity-90"></div>
          </div>
        </div>

      </div>

      {/* Scroll Down Indicator */}
      <button
        onClick={scrollToMenu}
        aria-label="Rolar para o cardápio"
        className="absolute bottom-4 left-1/2 -translate-x-1/2 z-20 flex flex-col items-center gap-1.5 text-stone-400 hover:text-amber-400 transition-colors animate-bounce cursor-pointer group"
      >
        <span className="text-[11px] uppercase tracking-widest font-semibold">Ver Cardápio</span>
        <ArrowDown className="w-4 h-4 text-amber-400 group-hover:translate-y-1 transition-transform" />
      </button>
    </section>
  );
};
