import React, { useState, useEffect } from 'react';
import { ShieldAlert, AlertCircle, CheckCircle, Zap, Lock, Hexagon, User, Key } from 'lucide-react';

/* ==========================================================================
   ÍCONE: O LOOP DO INFINITO (Otimizado, sem sombras pesadas)
   ========================================================================== */
export const InfinityLogo = React.memo(({ className = "w-24 h-12" }) => {
  return (
    <div className={`relative flex items-center justify-center ${className}`}>
      {/* Símbolo do Infinito em SVG Limpo */}
      <svg viewBox="0 0 100 50" className="relative z-10 w-full h-full">
        <defs>
          <linearGradient id="inf-grad" x1="0%" y1="0%" x2="100%" y2="0%">
            <stop offset="0%" stopColor="#22d3ee" />
            <stop offset="50%" stopColor="#d946ef" />
            <stop offset="100%" stopColor="#22d3ee" />
          </linearGradient>
        </defs>
        
        {/* Linha base estática */}
        <path d="M25 10 C5 10 5 40 25 40 C45 40 55 10 75 10 C95 10 95 40 75 40 C55 40 45 10 25 10 Z" fill="none" stroke="rgba(255,255,255,0.15)" strokeWidth="3" />
        
        {/* Linha animada limpa */}
        <path d="M25 10 C5 10 5 40 25 40 C45 40 55 10 75 10 C95 10 95 40 75 40 C55 40 45 10 25 10 Z" fill="none" stroke="url(#inf-grad)" strokeWidth="4" strokeLinecap="round" strokeDasharray="120" className="animate-[inf-flow_3s_linear_infinite]" />
      </svg>
      <style>{`@keyframes inf-flow { 0% { stroke-dashoffset: 240; } 100% { stroke-dashoffset: 0; } }`}</style>
    </div>
  );
});

/* ==========================================================================
   ABERTURA: LEVE E FLUIDA (Focada em Opacity e Transform)
   ========================================================================== */
export const SplashScreen = React.memo(() => {
  const [phase, setPhase] = useState(0);

  useEffect(() => {
    const t1 = setTimeout(() => setPhase(1), 300);   // Logo Fade-in
    const t2 = setTimeout(() => setPhase(2), 1500);  // Título Fade-in
    const t3 = setTimeout(() => setPhase(3), 3000);  // Form Slide-up
    return () => { clearTimeout(t1); clearTimeout(t2); clearTimeout(t3); };
  }, []);

  return (
    <div className="fixed inset-0 z-[9999] bg-[#020105] flex items-center justify-center font-sans">
      
      <div className={`relative z-20 flex flex-col items-center justify-center w-full max-w-md px-4 transition-transform duration-[1000ms] ease-out ${phase >= 3 ? '-translate-y-4' : 'translate-y-0'}`}>

        {/* Logo */}
        <div className={`transition-all duration-[1000ms] ease-out
          ${phase >= 1 ? 'opacity-100 scale-100' : 'opacity-0 scale-90'}
          ${phase >= 3 ? 'mb-8 w-32 h-16 md:w-48 md:h-24' : 'mb-0 w-48 h-24 md:w-64 md:h-32'}`}>
          <InfinityLogo className="w-full h-full" />
        </div>

        {/* Título */}
        <div className={`w-full flex flex-col items-center transition-all duration-[1000ms] ease-out ${phase >= 2 ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'}`}>
          
          <h1 className="text-3xl sm:text-4xl md:text-5xl font-black text-transparent bg-clip-text bg-gradient-to-r from-cyan-300 to-fuchsia-400 tracking-[0.2em] whitespace-nowrap">
            MANGA-INFINITY
          </h1>
          <p className="text-[10px] md:text-xs text-fuchsia-400 uppercase tracking-[1em] font-black mt-2 mb-8 pl-[1em]">Além da Eternidade</p>

          {/* Login Interface (Sem blur pesados no fundo para não travar a entrada) */}
          <div className={`w-full bg-[#080510] border border-cyan-900/50 p-6 rounded-3xl transition-all duration-[800ms] ease-out ${phase >= 3 ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8 pointer-events-none absolute'}`}>
            <div className="space-y-4">
              <div className="relative">
                <User className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-cyan-600/50" />
                <input type="text" placeholder="Entidade" className="w-full bg-[#020105] border border-white/10 rounded-xl py-3.5 pl-12 pr-4 text-sm text-white outline-none focus:border-cyan-500 transition-colors" />
              </div>
              <div className="relative">
                <Key className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-fuchsia-600/50" />
                <input type="password" placeholder="Código de Acesso" className="w-full bg-[#020105] border border-white/10 rounded-xl py-3.5 pl-12 pr-4 text-sm text-white outline-none focus:border-fuchsia-500 transition-colors" />
              </div>
              <button className="w-full bg-gradient-to-r from-cyan-800 to-fuchsia-800 text-white font-black text-xs uppercase tracking-widest py-3.5 rounded-xl mt-4">
                 Conectar
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
});

/* ==========================================================================
   ERRO E TOAST (MANTIDOS)
   ========================================================================== */
export class ErrorBoundary extends React.Component {
  constructor(props) { super(props); this.state = { hasError: false, error: null }; }
  static getDerivedStateFromError(error) { return { hasError: true, error }; }
  render() {
    if (this.state.hasError) {
      return (
        <div className="min-h-screen bg-[#020105] text-cyan-400 p-10 flex flex-col items-center justify-center font-sans border border-fuchsia-900/30">
          <ShieldAlert className="w-16 h-16 mb-4 animate-pulse text-fuchsia-500"/>
          <h1 className="text-2xl font-black uppercase tracking-widest text-white text-center">Colapso no Infinito</h1>
          <p className="mt-2 text-cyan-400/80 text-sm text-center max-w-lg">{this.state.error?.message}</p>
          <button onClick={() => window.location.reload()} className="mt-8 bg-[#0a0515] border border-fuchsia-900 text-white px-8 py-3.5 rounded-xl font-black uppercase text-[10px] tracking-widest hover:border-cyan-500 transition-colors">Reiniciar Realidade</button>
        </div>
      );
    }
    return this.props.children;
  }
}

export function GlobalToast({ toast }) {
  if (!toast) return null;
  const colors = toast.type === 'error' ? 'bg-red-950/90 text-red-200 border-red-600/50' : 
                 toast.type === 'success' ? 'bg-cyan-950/90 text-cyan-300 border-cyan-500/50' : 
                 'bg-fuchsia-950/90 text-fuchsia-300 border-fuchsia-600/50';
  return (
    <div className={`fixed top-6 left-1/2 -translate-x-1/2 z-[99999] px-6 py-3.5 rounded-2xl font-black text-xs uppercase tracking-wider border shadow-xl animate-in slide-in-from-top-5 ${colors}`}>
      <span className='text-center'>{toast.text}</span>
    </div>
  );
}

export function Footer() {
    return (
        <footer className="w-full bg-[#010003] border-t border-white/5 py-12 mt-auto pb-24 md:pb-12 flex flex-col items-center justify-center relative overflow-hidden">
            <div className="max-w-7xl mx-auto px-4 text-center">
                <div className="flex justify-center items-center gap-4 mb-5 group cursor-pointer">
                    <InfinityLogo className="w-12 h-6 grayscale group-hover:grayscale-0 transition-all duration-700 opacity-50 group-hover:opacity-100" />
                    <span className="font-black text-xl text-zinc-500 group-hover:text-cyan-400 transition-colors tracking-[0.2em] uppercase">MANGA-INFINITY</span>
                </div>
                <p className="text-zinc-600 text-[9px] uppercase font-black tracking-[0.3em]">O Infinito é o Limite - © 2026</p>
            </div>
        </footer>
    );
}

/* ==========================================================================
   TRANSIÇÃO: CORTINA CINEMATOGRÁFICA (Zero Lag, 100% Performática)
   ========================================================================== */
export const ChapterTransitionOverlay = React.memo(({ isVisible, chapterNumber }) => {
    if (!isVisible) return null;
    return (
        <div className="fixed inset-0 z-[99999] overflow-hidden font-sans pointer-events-none flex items-center justify-center">
            <style>{`
                @keyframes shutter-close-top { 0% { transform: translateY(-100%); } 20%, 80% { transform: translateY(0); } 100% { transform: translateY(-100%); } }
                @keyframes shutter-close-bottom { 0% { transform: translateY(100%); } 20%, 80% { transform: translateY(0); } 100% { transform: translateY(100%); } }
                @keyframes text-fade { 0%, 20% { opacity: 0; transform: scale(0.9); } 30%, 70% { opacity: 1; transform: scale(1); } 80%, 100% { opacity: 0; transform: scale(1.1); } }
            `}</style>
            
            {/* Cortina Superior (Fecha e Abre rápido usando GPU) */}
            <div className="absolute top-0 left-0 w-full h-1/2 bg-[#020105] animate-[shutter-close-top_1.2s_ease-in-out_forwards]"></div>
            
            {/* Cortina Inferior (Fecha e Abre rápido usando GPU) */}
            <div className="absolute bottom-0 left-0 w-full h-1/2 bg-[#020105] border-t border-cyan-900/50 animate-[shutter-close-bottom_1.2s_ease-in-out_forwards]"></div>

            {/* Texto Central */}
            <div className="relative z-10 flex flex-col items-center animate-[text-fade_1.2s_ease-in-out_forwards]">
                <div className="text-cyan-500 font-black tracking-[1em] text-[10px] uppercase mb-4 ml-[1em]">Capítulo</div>
                <h2 className="text-6xl sm:text-8xl md:text-[120px] leading-none font-black text-transparent bg-clip-text bg-gradient-to-b from-white to-cyan-600">
                  {chapterNumber}
                </h2>
            </div>
        </div>
    );
});
