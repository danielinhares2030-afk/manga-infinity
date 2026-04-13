import React, { useState, useEffect } from 'react';
import { ShieldAlert, AlertCircle, CheckCircle, Zap, Lock, Hexagon, User, Key } from 'lucide-react';

/* ==========================================================================
   ÍCONE: INFINITO ELEGANTE (Minimalista e Suave)
   ========================================================================== */
export const InfinityLogo = React.memo(({ className = "w-24 h-12" }) => {
  return (
    <div className={`relative flex items-center justify-center ${className}`}>
      <svg viewBox="0 0 100 50" className="relative z-10 w-full h-full opacity-90">
        <defs>
          <linearGradient id="calm-gradient" x1="0%" y1="0%" x2="100%" y2="0%">
            <stop offset="0%" stopColor="#818cf8" /> {/* Indigo suave */}
            <stop offset="50%" stopColor="#c084fc" /> {/* Violeta suave */}
            <stop offset="100%" stopColor="#22d3ee" /> {/* Ciano suave */}
          </linearGradient>
        </defs>
        
        {/* Linha de fundo quase invisível */}
        <path d="M25 15 C10 15 10 35 25 35 C40 35 50 15 75 15 C90 15 90 35 75 35 C60 35 50 15 25 15 Z" fill="none" stroke="rgba(255,255,255,0.05)" strokeWidth="1.5" />
        
        {/* Linha que flui calmamente */}
        <path d="M25 15 C10 15 10 35 25 35 C40 35 50 15 75 15 C90 15 90 35 75 35 C60 35 50 15 25 15 Z" fill="none" stroke="url(#calm-gradient)" strokeWidth="2.5" strokeLinecap="round" strokeDasharray="100" className="animate-[flow-calm_5s_ease-in-out_infinite_alternate]" />
      </svg>
      <style>{`@keyframes flow-calm { 0% { stroke-dashoffset: 200; } 100% { stroke-dashoffset: 0; } }`}</style>
    </div>
  );
});

/* ==========================================================================
   ABERTURA: CALMA E SEM BUG BRANCO (Fade out suave corrigido)
   ========================================================================== */
export const SplashScreen = React.memo(() => {
  const [visible, setVisible] = useState(true);
  const [fade, setFade] = useState(false); // Controla o fade in inicial
  const [fadeOut, setFadeOut] = useState(false); // NOVO: Controla a saída suave

  useEffect(() => {
    // 1. Inicia o brilho das letras
    const t1 = setTimeout(() => setFade(true), 100);
    
    // 2. Começa a apagar a tela devagar (resolve o pulo branco)
    const t2 = setTimeout(() => setFadeOut(true), 2500); 
    
    // 3. Remove a tela do DOM totalmente
    const t3 = setTimeout(() => setVisible(false), 3500); 
    
    return () => { clearTimeout(t1); clearTimeout(t2); clearTimeout(t3); };
  }, []);

  if (!visible) return null;

  return (
    // A classe transition-opacity lidará com o fadeOut final
    <div className={`fixed inset-0 z-[9999] bg-[#030305] flex flex-col items-center justify-center font-sans transition-opacity duration-1000 ease-in-out ${fadeOut ? 'opacity-0 pointer-events-none' : 'opacity-100'}`}>
      
      <div className={`flex flex-col items-center justify-center transition-all duration-[1500ms] ease-out ${fade ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'}`}>
        
        <InfinityLogo className="w-32 h-16 md:w-40 md:h-20 mb-6" />
        
        <h1 className="text-2xl sm:text-3xl md:text-4xl font-light text-white/90 tracking-[0.3em] whitespace-nowrap">
          MANGA<span className="font-black text-transparent bg-clip-text bg-gradient-to-r from-indigo-400 to-cyan-400">INFINITY</span>
        </h1>
        <p className="text-[9px] md:text-[10px] text-gray-500 uppercase tracking-[0.8em] font-medium mt-4 pl-[0.8em]">
          O refúgio da leitura
        </p>

      </div>
    </div>
  );
});

/* ==========================================================================
   ERRO, TOAST E FOOTER (Leves)
   ========================================================================== */
export class ErrorBoundary extends React.Component {
  constructor(props) { super(props); this.state = { hasError: false, error: null }; }
  static getDerivedStateFromError(error) { return { hasError: true, error }; }
  render() {
    if (this.state.hasError) {
      return (
        <div className="min-h-screen bg-[#030305] text-indigo-400 p-10 flex flex-col items-center justify-center font-sans">
          <AlertCircle className="w-12 h-12 mb-4 text-indigo-400 opacity-80"/>
          <h1 className="text-xl font-medium tracking-widest text-white text-center">Desconexão</h1>
          <p className="mt-2 text-gray-400 text-sm text-center max-w-lg font-light">{this.state.error?.message}</p>
          <button onClick={() => window.location.reload()} className="mt-8 bg-white/5 border border-white/10 text-white px-6 py-2.5 rounded-full font-medium text-xs tracking-widest hover:bg-white/10 transition-colors">Recarregar</button>
        </div>
      );
    }
    return this.props.children;
  }
}

export function GlobalToast({ toast }) {
  if (!toast) return null;
  const colors = toast.type === 'error' ? 'bg-red-950/80 text-red-200 border-red-900/50' : 
                 toast.type === 'success' ? 'bg-emerald-950/80 text-emerald-200 border-emerald-900/50' : 
                 'bg-[#0a0a12]/90 text-indigo-200 border-indigo-900/50';
  return (
    <div className={`fixed top-6 left-1/2 -translate-x-1/2 z-[99999] px-6 py-3 rounded-full font-medium text-xs tracking-wider border shadow-lg backdrop-blur-md animate-in slide-in-from-top-5 fade-in duration-300 ${colors}`}>
      <span className='text-center'>{toast.text}</span>
    </div>
  );
}

export function Footer() {
    return (
        <footer className="w-full bg-[#030305] border-t border-white/5 py-12 mt-auto pb-24 md:pb-12 flex flex-col items-center justify-center">
            <div className="max-w-7xl mx-auto px-4 text-center flex flex-col items-center">
                <InfinityLogo className="w-10 h-5 opacity-40 mb-4" />
                <span className="font-medium text-sm text-gray-500 tracking-[0.2em] uppercase">MANGA-INFINITY</span>
                <p className="text-gray-600 text-[9px] uppercase font-light tracking-[0.2em] mt-2">Uma experiência pacífica - © 2026</p>
            </div>
        </footer>
    );
}

/* ==========================================================================
   TRANSIÇÃO DE CAPÍTULO: FADE SUAVE (Elegante e sem travar)
   ========================================================================== */
export const ChapterTransitionOverlay = React.memo(({ isVisible, chapterNumber }) => {
    if (!isVisible) return null;
    return (
        <div className="fixed inset-0 z-[99999] bg-[#030305] font-sans flex flex-col items-center justify-center animate-in fade-in duration-500">
            <div className="text-indigo-400/60 font-medium tracking-[0.5em] text-xs uppercase mb-4 ml-[0.5em] animate-pulse">
                Carregando
            </div>
            <h2 className="text-5xl sm:text-7xl font-light text-white tracking-tight animate-in slide-in-from-bottom-4 duration-700 delay-100">
              Capítulo <span className="font-black text-transparent bg-clip-text bg-gradient-to-r from-indigo-400 to-cyan-400">{chapterNumber}</span>
            </h2>
        </div>
    );
});
