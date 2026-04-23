import React, { useState, useEffect } from 'react';
import { AlertCircle } from 'lucide-react';

export const InfinityLogo = React.memo(({ className = "w-24 h-12" }) => {
  return (
    <div className={`relative flex items-center justify-center ${className}`}>
      <svg viewBox="0 0 100 100" className="relative z-10 w-full h-full drop-shadow-[0_0_20px_rgba(34,211,238,0.6)] animate-[pulse_2s_ease-in-out_infinite]">
        <path d="M50 5 L95 50 L50 95 L5 50 Z" fill="none" stroke="rgba(34,211,238,0.1)" strokeWidth="2" />
        <path d="M50 5 L95 50 L50 95 L5 50 Z" fill="none" stroke="url(#auraGradient)" strokeWidth="4" />
        <defs>
          <linearGradient id="auraGradient" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#22d3ee" />
            <stop offset="100%" stopColor="#34d399" />
          </linearGradient>
        </defs>
      </svg>
    </div>
  );
});

export const SplashScreen = React.memo(() => {
  const [fade, setFade] = useState(false);
  const [fadeOut, setFadeOut] = useState(false);

  useEffect(() => {
    const t1 = setTimeout(() => setFade(true), 100); // Surge rápido
    const t2 = setTimeout(() => setFadeOut(true), 1500); // Sai rápido
    return () => { clearTimeout(t1); clearTimeout(t2); };
  }, []);

  return (
    <div className={`fixed inset-0 z-[9999] bg-[#020408] flex flex-col items-center justify-center font-sans transition-all duration-500 ease-in-out ${fadeOut ? 'opacity-0 scale-105 pointer-events-none' : 'opacity-100 scale-100'}`}>
      <style>{`body, html { background-color: #020408 !important; margin: 0; padding: 0; }`}</style>
      
      {/* AURA DE FUNDO AGRESSIVA */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[80vw] h-[80vw] bg-cyan-600/10 blur-[150px] rounded-full animate-[pulse_3s_ease-in-out_infinite_alternate]"></div>
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[60vw] h-[60vw] bg-emerald-600/10 blur-[130px] rounded-full animate-[pulse_2s_ease-in-out_infinite_alternate-reverse]"></div>

      <div className={`flex flex-col items-center justify-center relative z-10 transition-all duration-[1000ms] ease-out px-4 w-full text-center ${fade ? 'opacity-100 scale-100 translate-y-0' : 'opacity-0 scale-90 translate-y-4'}`}>
        <InfinityLogo className="w-24 h-12 md:w-32 md:h-16 mb-10" />
        
        <h1 className="text-4xl sm:text-5xl md:text-6xl font-black text-transparent bg-clip-text bg-gradient-to-r from-cyan-300 via-white to-emerald-300 tracking-[0.2em] uppercase drop-shadow-[0_0_20px_rgba(34,211,238,0.5)]">
          MANGA <span className="font-bold text-cyan-400">INFINITY</span>
        </h1>
        
        <div className="mt-12 flex items-center gap-3 opacity-60">
            <div className="w-2 h-2 bg-cyan-400 rounded-full animate-ping"></div>
            <div className="w-2 h-2 bg-emerald-400 rounded-full animate-ping" style={{animationDelay: '0.2s'}}></div>
            <div className="w-2 h-2 bg-cyan-400 rounded-full animate-ping" style={{animationDelay: '0.4s'}}></div>
        </div>
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
        <div className="min-h-screen bg-[#020408] p-10 flex flex-col items-center justify-center font-sans border-t-[4px] border-emerald-500">
          <AlertCircle className="w-16 h-16 mb-4 text-emerald-500 animate-pulse"/>
          <h1 className="text-2xl font-black uppercase tracking-widest text-white text-center">Erro Crítico</h1>
          <p className="mt-2 text-gray-400 text-xs font-bold text-center max-w-lg">{this.state.error?.message}</p>
          <button onClick={() => window.location.reload()} className="mt-8 bg-emerald-500/10 border-2 border-emerald-500 text-emerald-400 hover:bg-emerald-500 hover:text-black rounded-xl px-8 py-3 font-black text-[10px] uppercase tracking-widest transition-all">Recarregar Essência</button>
        </div>
      );
    }
    return this.props.children;
  }
}

export function GlobalToast({ toast }) {
  if (!toast) return null;
  const colors = toast.type === 'error' ? 'bg-rose-950/90 text-rose-200 border-rose-500/50' : 
                 toast.type === 'success' ? 'bg-emerald-950/90 text-emerald-200 border-emerald-500/50' : 
                 'bg-cyan-950/90 text-cyan-200 border-cyan-500/50';
  return (
    <div className={`fixed top-6 left-1/2 -translate-x-1/2 z-[99999] px-6 py-3.5 font-black text-[10px] uppercase tracking-[0.1em] border rounded-full backdrop-blur-xl animate-in slide-in-from-top-5 fade-in duration-300 shadow-[0_10px_30px_rgba(0,0,0,0.5)] ${colors}`}>
      <span className='text-center'>{toast.text}</span>
    </div>
  );
}

export function Footer() {
    return (
        <footer className="w-full bg-[#020408] border-t border-white/5 py-12 mt-auto pb-24 md:pb-12 flex flex-col items-center justify-center relative overflow-hidden">
            <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[300px] h-[1px] bg-gradient-to-r from-transparent via-cyan-500/50 to-transparent"></div>
            <div className="max-w-7xl mx-auto px-4 text-center flex flex-col items-center relative z-10">
                <InfinityLogo className="w-10 h-10 opacity-20 mb-4" />
                <span className="font-black text-xs text-gray-700 tracking-[0.3em] uppercase">MANGA INFINITY</span>
            </div>
        </footer>
    );
}

export const ChapterTransitionOverlay = React.memo(({ isVisible, chapterNumber }) => {
    if (!isVisible) return null;
    return (
        <div className="fixed inset-0 z-[99999] bg-[#020408] font-sans flex flex-col items-center justify-center animate-in fade-in duration-300">
            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-64 h-64 bg-cyan-600/20 blur-[80px] rounded-full"></div>
            <div className="text-emerald-400 font-black tracking-[0.5em] text-[10px] uppercase mb-2 animate-pulse relative z-10">
                Sincronizando
            </div>
            <h2 className="text-6xl sm:text-8xl font-black text-transparent bg-clip-text bg-gradient-to-br from-cyan-300 to-white tracking-tighter animate-in zoom-in-50 duration-300 relative z-10 drop-shadow-[0_0_20px_rgba(34,211,238,0.3)]">
              {chapterNumber}
            </h2>
        </div>
    );
});
