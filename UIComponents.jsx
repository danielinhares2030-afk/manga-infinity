import React, { useState, useEffect } from 'react';
import { AlertCircle } from 'lucide-react';

export const InfinityLogo = React.memo(({ className = "w-24 h-12" }) => {
  return (
    <div className={`relative flex items-center justify-center ${className}`}>
      <svg viewBox="0 0 100 100" className="relative z-10 w-full h-full drop-shadow-[0_0_15px_rgba(34,211,238,0.3)]">
        <path d="M50 5 L95 50 L50 95 L5 50 Z" fill="none" stroke="rgba(255,255,255,0.05)" strokeWidth="2" />
        <path d="M50 5 L95 50 L50 95 L5 50 Z" fill="none" stroke="#22d3ee" strokeWidth="4" />
      </svg>
    </div>
  );
});

export const SplashScreen = React.memo(() => {
  const [fade, setFade] = useState(false);
  const [fadeOut, setFadeOut] = useState(false);

  useEffect(() => {
    const t1 = setTimeout(() => setFade(true), 100);
    const t2 = setTimeout(() => setFadeOut(true), 1200); 
    return () => { clearTimeout(t1); clearTimeout(t2); };
  }, []);

  return (
    <div className={`fixed inset-0 z-[9999] bg-[#020204] flex flex-col items-center justify-center font-sans transition-all duration-[800ms] ease-in-out ${fadeOut ? 'opacity-0 backdrop-blur-sm pointer-events-none' : 'opacity-100'}`}>
      <style>{`body { background-color: #020204 !important; }`}</style>
      
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,rgba(34,211,238,0.05)_0%,transparent_50%)]"></div>

      <div className={`flex flex-col items-center justify-center relative z-10 transition-all duration-[1000ms] ease-out px-4 w-full text-center ${fade ? 'opacity-100 scale-100' : 'opacity-0 scale-95'}`}>
        <InfinityLogo className="w-20 h-10 md:w-28 md:h-14 mb-8 opacity-80" />
        
        <h1 className="text-3xl sm:text-4xl md:text-5xl font-black text-white/90 tracking-widest uppercase break-words w-full">
          MANGA <span className="text-cyan-400">INFINITY</span>
        </h1>
        <p className="text-[10px] text-gray-500 font-bold uppercase tracking-[0.4em] mt-6 opacity-60">
          Iniciando Interface
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
        <div className="min-h-screen bg-[#030303] p-10 flex flex-col items-center justify-center font-sans border-t-[4px] border-cyan-500">
          <AlertCircle className="w-16 h-16 mb-4 text-cyan-500 animate-pulse"/>
          <h1 className="text-2xl font-black uppercase tracking-widest text-white text-center">Erro no Sistema</h1>
          <p className="mt-2 text-gray-400 text-xs font-bold text-center max-w-lg">{this.state.error?.message}</p>
          <button onClick={() => window.location.reload()} className="mt-8 bg-transparent border-2 border-cyan-500 text-cyan-500 hover:bg-cyan-500 hover:text-black rounded-xl px-8 py-3 font-black text-[10px] uppercase tracking-widest transition-all">Recarregar</button>
        </div>
      );
    }
    return this.props.children;
  }
}

export function GlobalToast({ toast }) {
  if (!toast) return null;
  const colors = toast.type === 'error' ? 'bg-red-950/90 text-red-200 border-red-500/50 rounded-xl' : 
                 toast.type === 'success' ? 'bg-cyan-950/90 text-cyan-200 border-cyan-500/50 rounded-xl' : 
                 'bg-[#08080a] text-gray-200 border-gray-500/50 rounded-xl';
  return (
    <div className={`fixed top-6 left-1/2 -translate-x-1/2 z-[99999] px-6 py-3.5 font-black text-[10px] uppercase tracking-[0.1em] border backdrop-blur-xl animate-in slide-in-from-top-5 fade-in duration-300 ${colors}`}>
      <span className='text-center'>{toast.text}</span>
    </div>
  );
}

export function Footer() {
    return (
        <footer className="w-full bg-[#030303] border-t border-white/5 py-12 mt-auto pb-24 md:pb-12 flex flex-col items-center justify-center">
            <div className="max-w-7xl mx-auto px-4 text-center flex flex-col items-center">
                <InfinityLogo className="w-10 h-10 opacity-30 mb-4" />
                <span className="font-black text-xs text-gray-600 tracking-[0.3em] uppercase">MANGA INFINITY</span>
            </div>
        </footer>
    );
}

export const ChapterTransitionOverlay = React.memo(({ isVisible, chapterNumber }) => {
    if (!isVisible) return null;
    return (
        <div className="fixed inset-0 z-[99999] bg-[#020204] font-sans flex flex-col items-center justify-center animate-in fade-in duration-500">
            <div className="text-cyan-500 font-black tracking-[0.5em] text-[10px] uppercase mb-2 animate-pulse relative z-10">
                Acessando Capítulo
            </div>
            <h2 className="text-6xl sm:text-8xl font-black text-white tracking-tighter animate-in zoom-in-50 duration-500 relative z-10">
              {chapterNumber}
            </h2>
        </div>
    );
});
