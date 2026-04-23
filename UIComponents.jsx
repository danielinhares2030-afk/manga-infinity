import React, { useState, useEffect } from 'react';
import { AlertCircle } from 'lucide-react';

// NOVO ÍCONE MÁGICO (Cristal + Infinito + Cores: Dourado, Verde e Vermelho)
export const InfinityLogo = React.memo(({ className = "w-24 h-12" }) => {
  return (
    <div className={`relative flex items-center justify-center ${className}`}>
      <svg viewBox="0 0 120 120" className="relative z-10 w-full h-full drop-shadow-[0_0_15px_rgba(251,191,36,0.5)] animate-[pulse_2s_ease-in-out_infinite]">
        <defs>
          <linearGradient id="epicGradient" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#10b981" />  {/* Verde Esmeralda */}
            <stop offset="50%" stopColor="#fbbf24" /> {/* Dourado */}
            <stop offset="100%" stopColor="#e11d48" /> {/* Vermelho Rubi */}
          </linearGradient>
        </defs>
        
        {/* Losango Externo Mágico */}
        <polygon points="60,5 115,60 60,115 5,60" fill="none" stroke="url(#epicGradient)" strokeWidth="3" />
        <polygon points="60,15 105,60 60,105 15,60" fill="none" stroke="rgba(251,191,36,0.3)" strokeWidth="1" />
        
        {/* Símbolo do Infinito Interno */}
        <path d="M 30 60 C 30 35, 60 35, 60 60 C 60 85, 90 85, 90 60 C 90 35, 60 35, 60 60 C 60 85, 30 85, 30 60 Z" fill="none" stroke="url(#epicGradient)" strokeWidth="5" strokeLinecap="round" />
        
        {/* Brilho central */}
        <circle cx="60" cy="60" r="3" fill="#fbbf24" />
      </svg>
    </div>
  );
});

export const SplashScreen = React.memo(() => {
  const [fade, setFade] = useState(false);
  const [fadeOut, setFadeOut] = useState(false);

  useEffect(() => {
    const t1 = setTimeout(() => setFade(true), 100); // Surge rápido
    const t2 = setTimeout(() => setFadeOut(true), 1500); // Sai rápido para não atrasar o app
    return () => { clearTimeout(t1); clearTimeout(t2); };
  }, []);

  return (
    <div className={`fixed inset-0 z-[9999] bg-[#050505] flex flex-col items-center justify-center font-sans transition-all duration-500 ease-in-out ${fadeOut ? 'opacity-0 scale-105 pointer-events-none' : 'opacity-100 scale-100'}`}>
      <style>{`body, html { background-color: #050505 !important; margin: 0; padding: 0; }`}</style>
      
      {/* AURAS MÁGICAS (Verde, Dourado e Vermelho) super leves */}
      <div className="absolute top-[20%] left-[10%] w-[50vw] h-[50vw] bg-emerald-600/15 blur-[120px] rounded-full animate-[pulse_4s_ease-in-out_infinite_alternate]"></div>
      <div className="absolute bottom-[20%] right-[10%] w-[50vw] h-[50vw] bg-rose-600/15 blur-[120px] rounded-full animate-[pulse_5s_ease-in-out_infinite_alternate-reverse]"></div>
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[60vw] h-[60vw] bg-amber-500/10 blur-[150px] rounded-full"></div>

      <div className={`flex flex-col items-center justify-center relative z-10 transition-all duration-[1000ms] ease-out px-4 w-full text-center ${fade ? 'opacity-100 scale-100 translate-y-0' : 'opacity-0 scale-90 translate-y-4'}`}>
        <InfinityLogo className="w-28 h-28 md:w-36 md:h-36 mb-6" />
        
        <h1 className="text-4xl sm:text-5xl md:text-6xl font-black text-transparent bg-clip-text bg-gradient-to-r from-emerald-400 via-amber-300 to-rose-500 tracking-[0.2em] uppercase drop-shadow-[0_0_15px_rgba(251,191,36,0.3)]">
          MANGA <span className="font-bold text-white">INFINITY</span>
        </h1>
        
        {/* Loading de "ignição" com as 3 cores */}
        <div className="mt-12 flex items-center gap-3 opacity-80">
            <div className="w-2 h-2 bg-emerald-400 rounded-full animate-ping"></div>
            <div className="w-2 h-2 bg-amber-400 rounded-full animate-ping" style={{animationDelay: '0.2s'}}></div>
            <div className="w-2 h-2 bg-rose-500 rounded-full animate-ping" style={{animationDelay: '0.4s'}}></div>
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
        <div className="min-h-screen bg-[#050505] p-10 flex flex-col items-center justify-center font-sans border-t-[4px] border-amber-500">
          <AlertCircle className="w-16 h-16 mb-4 text-amber-500 animate-pulse"/>
          <h1 className="text-2xl font-black uppercase tracking-widest text-white text-center">Erro na Matriz</h1>
          <p className="mt-2 text-gray-400 text-xs font-bold text-center max-w-lg">{this.state.error?.message}</p>
          <button onClick={() => window.location.reload()} className="mt-8 bg-amber-500/10 border-2 border-amber-500 text-amber-400 hover:bg-amber-500 hover:text-black rounded-xl px-8 py-3 font-black text-[10px] uppercase tracking-widest transition-all">Restaurar Conexão</button>
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
                 'bg-amber-950/90 text-amber-200 border-amber-500/50';
  return (
    <div className={`fixed top-6 left-1/2 -translate-x-1/2 z-[99999] px-6 py-3.5 font-black text-[10px] uppercase tracking-[0.1em] border rounded-xl backdrop-blur-xl animate-in slide-in-from-top-5 fade-in duration-300 shadow-xl ${colors}`}>
      <span className='text-center flex items-center gap-2'>{toast.text}</span>
    </div>
  );
}

export function Footer() {
    return (
        <footer className="w-full bg-[#050505] border-t border-white/5 py-12 mt-auto pb-24 md:pb-12 flex flex-col items-center justify-center relative overflow-hidden">
            <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[300px] h-[1px] bg-gradient-to-r from-transparent via-amber-500/50 to-transparent"></div>
            <div className="max-w-7xl mx-auto px-4 text-center flex flex-col items-center relative z-10">
                <InfinityLogo className="w-10 h-10 opacity-20 mb-4 grayscale" />
                <span className="font-black text-xs text-gray-700 tracking-[0.3em] uppercase">MANGA INFINITY</span>
            </div>
        </footer>
    );
}

export const ChapterTransitionOverlay = React.memo(({ isVisible, chapterNumber }) => {
    if (!isVisible) return null;
    return (
        <div className="fixed inset-0 z-[99999] bg-[#050505] font-sans flex flex-col items-center justify-center animate-in fade-in duration-300">
            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-64 h-64 bg-amber-500/10 blur-[80px] rounded-full"></div>
            <div className="text-amber-400 font-black tracking-[0.5em] text-[10px] uppercase mb-2 animate-pulse relative z-10">
                Acessando Memória
            </div>
            <h2 className="text-6xl sm:text-8xl font-black text-transparent bg-clip-text bg-gradient-to-br from-amber-300 to-white tracking-tighter animate-in zoom-in-50 duration-300 relative z-10 drop-shadow-[0_0_20px_rgba(251,191,36,0.3)]">
              {chapterNumber}
            </h2>
        </div>
    );
});
