import React, { useState, useEffect } from 'react';
import { ShieldAlert, AlertCircle } from 'lucide-react';

/* ==========================================================================
   ÍCONE: DIAMANTE NEXUS (Ousado, Radical, mas Fluido como Aura de Anime)
   ========================================================================== */
export const InfinityLogo = React.memo(({ className = "w-24 h-12" }) => {
  return (
    <div className={`relative flex items-center justify-center ${className}`}>
      <svg viewBox="0 0 100 100" className="relative z-10 w-full h-full drop-shadow-[0_0_20px_rgba(34,211,238,0.8)]">
        <defs>
          <linearGradient id="nexus-aura" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#22d3ee" />   {/* Ciano */}
            <stop offset="50%" stopColor="#818cf8" />  {/* Índigo (Suave) */}
            <stop offset="100%" stopColor="#c084fc" /> {/* Violeta */}
          </linearGradient>
        </defs>
        
        {/* Rastro do Diamante (Suave) */}
        <path d="M50 5 L95 50 L50 95 L5 50 Z" fill="none" stroke="rgba(255,255,255,0.05)" strokeWidth="2" />
        
        {/* Linha de Energia Principal (Radical e Fluida) */}
        <path d="M50 5 L95 50 L50 95 L5 50 Z" fill="none" stroke="url(#nexus-aura)" strokeWidth="4" strokeLinecap="round" strokeDasharray="180" className="animate-[dash-anime_3s_ease-in-out_infinite_alternate]" />
        
        {/* Núcleo Pulsante */}
        <circle cx="50" cy="50" r="8" fill="url(#nexus-aura)" className="animate-[ping_2.5s_cubic-bezier(0,0,0.2,1)_infinite] opacity-80" />
      </svg>
      <style>{`@keyframes dash-anime { 0% { stroke-dashoffset: 360; transform: scale(0.95); } 100% { stroke-dashoffset: 0; transform: scale(1.05); } }`}</style>
    </div>
  );
});

/* ==========================================================================
   ABERTURA: LEVE E RECONFORTANTE (Sem piscar branco)
   ========================================================================== */
export const SplashScreen = React.memo(() => {
  const [fade, setFade] = useState(false);
  const [fadeOut, setFadeOut] = useState(false);

  useEffect(() => {
    // Aparição suave (Aura)
    const t1 = setTimeout(() => setFade(true), 100);
    // Desaparecimento elegante
    const t2 = setTimeout(() => setFadeOut(true), 2500); 
    return () => { clearTimeout(t1); clearTimeout(t2); };
  }, []);

  return (
    <div className={`fixed inset-0 z-[9999] bg-[#030305] flex flex-col items-center justify-center font-sans transition-all duration-[800ms] ease-in-out ${fadeOut ? 'opacity-0 scale-110 pointer-events-none' : 'opacity-100 scale-100'}`}>
      <style>{`body { background-color: #030305 !important; }`}</style>
      
      {/* Brilho de Fundo Suave */}
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,rgba(34,211,238,0.08)_0%,transparent_50%)] animate-pulse"></div>

      <div className={`flex flex-col items-center justify-center relative z-10 transition-all duration-[1200ms] ease-[cubic-bezier(0.25,1,0.5,1)] ${fade ? 'opacity-100 translate-y-0 scale-100' : 'opacity-0 translate-y-8 scale-95'}`}>
        <InfinityLogo className="w-28 h-28 md:w-36 md:h-36 mb-6" />
        
        <h1 className="text-4xl md:text-5xl font-black text-transparent bg-clip-text bg-gradient-to-r from-cyan-300 to-indigo-400 tracking-[0.3em] uppercase drop-shadow-[0_0_15px_rgba(34,211,238,0.5)]">
          NEXUS
        </h1>
        <p className="text-[9px] text-cyan-500/80 font-black uppercase tracking-[0.6em] mt-3">
          Sincronizando Aura
        </p>
      </div>
    </div>
  );
});

export class ErrorBoundary extends React.Component {
  constructor(props) { super(props); this.state = { hasError: false, error: null }; }
  static getDerivedStateFromError(error) { return { hasError: true, error }; }
  render() {
    if (this.state.hasError) {
      return (
        <div className="min-h-screen bg-[#030305] p-10 flex flex-col items-center justify-center font-sans border-t-[4px] border-cyan-500">
          <AlertCircle className="w-16 h-16 mb-4 text-cyan-500 animate-pulse drop-shadow-[0_0_15px_rgba(34,211,238,0.6)]"/>
          <h1 className="text-2xl font-black uppercase tracking-widest text-white text-center">Ruptura Espacial</h1>
          <p className="mt-2 text-gray-400 text-xs font-bold text-center max-w-lg">{this.state.error?.message}</p>
          <button onClick={() => window.location.reload()} className="mt-8 bg-transparent border-2 border-cyan-500 text-cyan-400 hover:bg-cyan-500 hover:text-black px-8 py-3 rounded-xl font-black text-[10px] uppercase tracking-widest transition-all">Recarregar</button>
        </div>
      );
    }
    return this.props.children;
  }
}

export function GlobalToast({ toast }) {
  if (!toast) return null;
  const colors = toast.type === 'error' ? 'bg-red-950/90 text-red-200 border-red-500/50 shadow-[0_0_20px_rgba(220,38,38,0.3)]' : 
                 toast.type === 'success' ? 'bg-cyan-950/90 text-cyan-200 border-cyan-500/50 shadow-[0_0_20px_rgba(34,211,238,0.3)]' : 
                 'bg-[#08080a] text-gray-200 border-gray-500/50';
  return (
    <div className={`fixed top-6 left-1/2 -translate-x-1/2 z-[99999] px-6 py-3.5 rounded-2xl font-black text-[10px] uppercase tracking-[0.1em] border backdrop-blur-xl animate-in slide-in-from-top-5 fade-in duration-300 ${colors}`}>
      <span className='text-center'>{toast.text}</span>
    </div>
  );
}

export function Footer() {
    return (
        <footer className="w-full bg-[#030305] border-t border-white/5 py-12 mt-auto pb-24 md:pb-12 flex flex-col items-center justify-center">
            <div className="max-w-7xl mx-auto px-4 text-center flex flex-col items-center">
                <InfinityLogo className="w-10 h-10 opacity-30 mb-4" />
                <span className="font-black text-xs text-gray-600 tracking-[0.3em] uppercase">NEXUS-INFINITY</span>
            </div>
        </footer>
    );
}

export const ChapterTransitionOverlay = React.memo(({ isVisible, chapterNumber }) => {
    if (!isVisible) return null;
    return (
        <div className="fixed inset-0 z-[99999] bg-[#030305] font-sans flex flex-col items-center justify-center animate-in fade-in duration-500">
            <div className="text-cyan-500/80 font-black tracking-[0.5em] text-[10px] uppercase mb-2 animate-pulse relative z-10">
                Acessando Domínio
            </div>
            <h2 className="text-6xl sm:text-8xl font-black text-transparent bg-clip-text bg-gradient-to-b from-white to-gray-500 tracking-tighter animate-in zoom-in-50 duration-500 relative z-10 drop-shadow-2xl">
              {chapterNumber}
            </h2>
        </div>
    );
});
