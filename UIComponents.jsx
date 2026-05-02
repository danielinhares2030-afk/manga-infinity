import React, { useState, useEffect } from 'react';
import { AlertTriangle, BookOpen, Zap, Heart } from 'lucide-react';

// O nome do componente voltou para NexoLogo para não quebrar os outros arquivos,
// mas o visual continua sendo o N moderno do Nexon Scan!
export const NexoLogo = React.memo(({ className = "w-64 h-64" }) => {
  return (
    <svg className={className} viewBox="0 0 100 100" fill="none" xmlns="http://www.w3.org/2000/svg">
      <defs>
        <linearGradient id="nexonBlue" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="#00f2fe" />
          <stop offset="100%" stopColor="#4facfe" />
        </linearGradient>
        <linearGradient id="nexonPurple" x1="0%" y1="100%" x2="100%" y2="0%">
          <stop offset="0%" stopColor="#c084fc" />
          <stop offset="100%" stopColor="#818cf8" />
        </linearGradient>
      </defs>
      <path d="M 30 75 V 25 L 70 65" stroke="url(#nexonBlue)" strokeWidth="14" strokeLinecap="round" strokeLinejoin="round" />
      <path d="M 70 25 V 75 L 30 35" stroke="url(#nexonPurple)" strokeWidth="14" strokeLinecap="round" strokeLinejoin="round" style={{ mixBlendMode: 'screen' }} />
    </svg>
  );
});

export const SplashScreen = React.memo(() => {
  const [fade, setFade] = useState(false);
  const [progress, setProgress] = useState(0);

  useEffect(() => { 
      const t1 = setTimeout(() => setFade(true), 50); 
      
      // Animação da barra de progresso simulando carregamento
      const duration = 2000;
      const interval = 30;
      const steps = duration / interval;
      let currentStep = 0;
      const timer = setInterval(() => {
          currentStep++;
          setProgress(Math.min(100, Math.floor((currentStep / steps) * 100)));
          if (currentStep >= steps) clearInterval(timer);
      }, interval);

      return () => {
          clearTimeout(t1);
          clearInterval(timer);
      };
  }, []);
  
  return (
    <div className={`fixed inset-0 z-[9999] bg-[#030108] flex flex-col items-center justify-center font-sans transition-opacity duration-700 ${fade ? 'opacity-100' : 'opacity-0'}`}>
      <style>{`body, html { background-color: #030108 !important; }`}</style>
      
      {/* Fundo Ambiente Escuro */}
      <div className="absolute inset-0 bg-[#030108] pointer-events-none">
          <div className="absolute top-[20%] left-1/2 -translate-x-1/2 w-[800px] h-[800px] bg-[radial-gradient(ellipse_at_center,rgba(59,130,246,0.05)_0%,transparent_50%)] mix-blend-screen"></div>
          <div className="absolute inset-0 bg-[linear-gradient(rgba(255,255,255,0.02)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.02)_1px,transparent_1px)] bg-[size:40px_40px]"></div>
      </div>

      <div className={`transition-all duration-1000 ease-out z-10 w-full flex flex-col items-center max-w-sm px-6 ${fade ? 'scale-100 translate-y-0' : 'scale-95 translate-y-4 opacity-0'}`}>
        
        {/* LOGO CENTRAL */}
        <div className="relative flex flex-col items-center mb-8">
            <div className="absolute inset-0 bg-blue-500/20 blur-[50px] rounded-full"></div>
            <NexoLogo className="w-24 h-24 mb-6 relative z-10 drop-shadow-[0_0_20px_rgba(59,130,246,0.5)]" />
            <h1 className="text-white text-[38px] font-bold tracking-[0.3em] leading-none mb-2 ml-3 relative z-10">N E X O</h1>
            <h2 className="text-blue-500 text-[12px] font-black tracking-[0.8em] uppercase ml-3 relative z-10">S C A N</h2>
        </div>

        {/* DIVISOR */}
        <div className="flex items-center gap-4 w-full justify-center mb-10 opacity-70">
            <div className="h-[1px] flex-1 bg-gradient-to-r from-transparent to-blue-900"></div>
            <span className="text-[9px] font-medium text-gray-400">Seu portal para o <span className="text-purple-400">universo dos mangás</span></span>
            <div className="h-[1px] flex-1 bg-gradient-to-l from-transparent to-blue-900"></div>
        </div>
        
        {/* BARRA DE PROGRESSO */}
        <div className="w-full mb-10">
           <div className="flex items-center gap-3 mb-2">
               <div className="h-1.5 flex-1 bg-[#0a0a16] rounded-full overflow-hidden border border-white/5 relative">
                  <div className="absolute top-0 left-0 h-full bg-gradient-to-r from-blue-500 to-purple-500 transition-all duration-75 shadow-[0_0_10px_rgba(59,130,246,0.8)]" style={{ width: `${progress}%` }}></div>
               </div>
               <span className="text-[10px] font-black text-purple-400 w-8">{progress}%</span>
           </div>
           <p className="text-center text-[9px] text-gray-500 font-medium tracking-widest uppercase mt-3">Carregando sua experiência...</p>
        </div>

        {/* FEATURES */}
        <div className="flex justify-between w-full border-t border-white/5 pt-8">
            <div className="flex flex-col items-center flex-1">
                <BookOpen className="w-5 h-5 text-blue-500 mb-2 drop-shadow-[0_0_8px_rgba(59,130,246,0.6)]" strokeWidth={1.5} />
                <span className="text-[7px] text-gray-500 font-black uppercase tracking-widest text-center">Mais Histórias</span>
            </div>
            <div className="flex flex-col items-center flex-1 border-l border-white/5">
                <Zap className="w-5 h-5 text-cyan-400 mb-2 drop-shadow-[0_0_8px_rgba(6,182,212,0.6)]" strokeWidth={1.5} />
                <span className="text-[7px] text-gray-500 font-black uppercase tracking-widest text-center">Mais Rápido</span>
            </div>
            <div className="flex flex-col items-center flex-1 border-l border-white/5">
                <Heart className="w-5 h-5 text-purple-500 mb-2 drop-shadow-[0_0_8px_rgba(168,85,247,0.6)]" strokeWidth={1.5} />
                <span className="text-[7px] text-gray-500 font-black uppercase tracking-widest text-center">Feito Para Você</span>
            </div>
        </div>

        {/* DOTS DE DECORAÇÃO */}
        <div className="flex justify-center gap-1.5 mt-8 opacity-50">
            <div className="w-1 h-1 rounded-full bg-gray-700"></div>
            <div className="w-1 h-1 rounded-full bg-purple-500"></div>
            <div className="w-1 h-1 rounded-full bg-gray-700"></div>
            <div className="w-1 h-1 rounded-full bg-gray-700"></div>
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
        <div className="min-h-screen bg-[#030108] p-10 flex flex-col items-center justify-center font-sans border-t-[4px] border-cyan-500">
          <AlertTriangle className="w-16 h-16 mb-4 text-cyan-500 animate-pulse drop-shadow-[0_0_15px_rgba(6,182,212,0.5)]"/>
          <h1 className="text-2xl font-black uppercase tracking-widest text-white text-center">Falha no Sistema (Erro)</h1>
          <p className="mt-2 text-gray-500 text-xs font-bold text-center max-w-lg">{this.state.error?.message}</p>
          <button onClick={() => window.location.reload()} className="mt-8 bg-cyan-950/30 border border-cyan-500/50 text-cyan-400 hover:bg-cyan-600 hover:text-white rounded-xl px-8 py-3 font-black text-[10px] uppercase tracking-widest transition-all shadow-lg">Restaurar Conexão</button>
        </div>
      );
    }
    return this.props.children;
  }
}

export function GlobalToast({ toast }) {
  if (!toast) return null;
  const colors = toast.type === 'error' ? 'bg-red-950/90 text-red-200 border-red-600/50 shadow-[0_0_20px_rgba(220,38,38,0.4)]' : 
                 toast.type === 'success' ? 'bg-emerald-950/90 text-emerald-200 border-emerald-500/50 shadow-[0_0_20px_rgba(16,185,129,0.3)]' : 
                 'bg-[#080510]/90 text-gray-200 border-blue-900/30 shadow-xl';
  return (
    <div className={`fixed top-6 left-1/2 -translate-x-1/2 z-[99999] px-6 py-3.5 font-black text-[10px] uppercase tracking-[0.1em] border rounded-xl backdrop-blur-xl animate-in slide-in-from-top-5 fade-in duration-300 ${colors}`}>
      <span className='text-center flex items-center gap-2'>{toast.text}</span>
    </div>
  );
}

export function Footer() {
    return (
        <footer className="w-full bg-[#030108] border-t border-blue-900/20 py-12 mt-auto pb-24 md:pb-12 flex flex-col items-center justify-center relative overflow-hidden">
            <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[300px] h-[1px] bg-gradient-to-r from-transparent via-blue-500/50 to-transparent"></div>
            <div className="max-w-7xl mx-auto px-4 text-center flex flex-col items-center relative z-10">
                <NexoLogo className="w-16 h-16 opacity-40 grayscale hover:grayscale-0 hover:opacity-100 transition-all duration-500 mb-4" />
                <span className="font-black text-[10px] text-gray-600 tracking-[0.5em] uppercase mt-2">NEXON SCAN</span>
                <span className="font-bold text-[8px] text-gray-700 tracking-[0.2em] uppercase mt-1">SEU PORTAL PARA O UNIVERSO DOS MANGÁS</span>
            </div>
        </footer>
    );
}

export const ChapterTransitionOverlay = React.memo(({ isVisible, chapterNumber }) => {
    if (!isVisible) return null;
    return (
        <div className="fixed inset-0 z-[99999] bg-[#030108] font-sans flex flex-col items-center justify-center overflow-hidden animate-in fade-in duration-300">
            <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,_var(--tw-gradient-stops))] from-blue-900/20 via-[#030108] to-[#030108]"></div>
            
            <div className="relative z-10 flex flex-col items-center animate-in zoom-in-95 duration-500">
                <div className="w-12 h-12 border-4 border-cyan-500/30 border-t-cyan-500 rounded-full animate-spin mb-6 shadow-[0_0_15px_rgba(6,182,212,0.5)]"></div>
                <div className="text-cyan-400 font-black tracking-[0.5em] text-[10px] uppercase mb-3 animate-pulse">
                    Carregando
                </div>
                <h2 className="text-4xl sm:text-6xl font-black text-white tracking-tighter drop-shadow-lg">
                    CAPÍTULO {chapterNumber}
                </h2>
            </div>
        </div>
    );
});
