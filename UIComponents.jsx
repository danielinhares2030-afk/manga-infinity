import React, { useState, useEffect } from 'react';
import { AlertCircle } from 'lucide-react';

export const InfinityLogo = React.memo(({ className = "w-24 h-12" }) => {
  return (
    <div className={`relative flex items-center justify-center ${className}`}>
      <svg viewBox="0 0 100 100" className="relative z-10 w-full h-full drop-shadow-[0_0_15px_rgba(220,38,38,0.3)]">
        <path d="M50 5 L95 50 L50 95 L5 50 Z" fill="none" stroke="rgba(255,255,255,0.05)" strokeWidth="2" />
        <path d="M50 5 L95 50 L50 95 L5 50 Z" fill="none" stroke="#dc2626" strokeWidth="4" />
      </svg>
    </div>
  );
});

export const SplashScreen = React.memo(() => {
  const [fade, setFade] = useState(false);
  const [fadeOut, setFadeOut] = useState(false);

  useEffect(() => {
    const t1 = setTimeout(() => setFade(true), 100);
    const t2 = setTimeout(() => setFadeOut(true), 800); 
    return () => { clearTimeout(t1); clearTimeout(t2); };
  }, []);

  return (
    <div className={`fixed inset-0 z-[9999] bg-[#030303] flex flex-col items-center justify-center font-sans transition-all duration-[500ms] ease-in-out ${fadeOut ? 'opacity-0 scale-105 pointer-events-none' : 'opacity-100 scale-100'}`}>
      <style>{`body { background-color: #030303 !important; }`}</style>
      
      <div className={`flex flex-col items-center justify-center relative z-10 transition-all duration-[600ms] ease-out ${fade ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'}`}>
        <InfinityLogo className="w-24 h-24 md:w-32 md:h-32 mb-6" />
        
        <h1 className="text-4xl md:text-5xl font-black text-white tracking-[0.2em] uppercase drop-shadow-md">
          MANGA <span className="text-red-600">INFINITY</span>
        </h1>
        <p className="text-[9px] text-gray-500 font-black uppercase tracking-[0.6em] mt-4">
          Iniciando Sistema
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
        <div className="min-h-screen bg-[#030303] p-10 flex flex-col items-center justify-center font-sans border-t-[4px] border-red-600">
          <AlertCircle className="w-16 h-16 mb-4 text-red-600 animate-pulse"/>
          <h1 className="text-2xl font-black uppercase tracking-widest text-white text-center">Erro no Sistema</h1>
          <p className="mt-2 text-gray-400 text-xs font-bold text-center max-w-lg">{this.state.error?.message}</p>
          <button onClick={() => window.location.reload()} className="mt-8 bg-transparent border-2 border-red-600 text-red-500 hover:bg-red-600 hover:text-white px-8 py-3 font-black text-[10px] uppercase tracking-widest transition-all">Recarregar</button>
        </div>
      );
    }
    return this.props.children;
  }
}

export function GlobalToast({ toast }) {
  if (!toast) return null;
  const colors = toast.type === 'error' ? 'bg-red-950/90 text-red-200 border-red-500/50' : 
                 toast.type === 'success' ? 'bg-green-950/90 text-green-200 border-green-500/50' : 
                 'bg-[#08080a] text-gray-200 border-gray-500/50';
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
        <div className="fixed inset-0 z-[99999] bg-[#030303] font-sans flex flex-col items-center justify-center animate-in fade-in duration-500">
            <div className="text-red-600 font-black tracking-[0.5em] text-[10px] uppercase mb-2 animate-pulse relative z-10">
                Acessando Capítulo
            </div>
            <h2 className="text-6xl sm:text-8xl font-black text-white tracking-tighter animate-in zoom-in-50 duration-500 relative z-10">
              {chapterNumber}
            </h2>
        </div>
    );
});
