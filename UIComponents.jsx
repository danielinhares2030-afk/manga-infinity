import React, { useState, useEffect } from 'react';
import { AlertTriangle, BookOpen, Zap, Heart } from 'lucide-react';

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

// NOVA TELA DE ABERTURA ÉPICA (ESTILO ANIME)
export const SplashScreen = React.memo(() => {
  const [fade, setFade] = useState(false);
  const [progress, setProgress] = useState(0);

  useEffect(() => { 
      const t1 = setTimeout(() => setFade(true), 50); 
      const duration = 2000;
      const interval = 30;
      const steps = duration / interval;
      let currentStep = 0;
      const timer = setInterval(() => {
          currentStep++;
          setProgress(Math.min(100, Math.floor((currentStep / steps) * 100)));
          if (currentStep >= steps) clearInterval(timer);
      }, interval);

      return () => { clearTimeout(t1); clearInterval(timer); };
  }, []);
  
  // Forma Hexagonal da Barra de Progresso
  const barClip = { clipPath: 'polygon(15px 0, calc(100% - 15px) 0, 100% 50%, calc(100% - 15px) 100%, 15px 100%, 0 50%)' };

  return (
    <div className={`fixed inset-0 z-[9999] bg-[#030108] flex flex-col items-center justify-center font-sans transition-opacity duration-700 ${fade ? 'opacity-100' : 'opacity-0'}`}>
      
      {/* FUNDO DIVIDIDO: RAIO AZUL E AURA MAGENTA */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none mix-blend-screen">
          <div className="absolute left-0 top-0 w-1/2 h-full bg-gradient-to-r from-blue-700/30 to-transparent blur-[80px]"></div>
          <div className="absolute right-0 top-0 w-1/2 h-full bg-gradient-to-l from-rose-700/30 to-transparent blur-[80px]"></div>
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,transparent_30%,#030108_100%)]"></div>
          
          {/* Círculos Rotativos Escuros no Fundo */}
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[400px] h-[400px] rounded-full border-[2px] border-white/5 border-dashed animate-[spin_20s_linear_infinite]"></div>
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[500px] h-[500px] rounded-full border border-blue-500/10 animate-[spin_30s_linear_infinite_reverse]"></div>

          {/* Textos Laterais Decorativos (Japonês) */}
          <div className="absolute left-6 top-1/2 -translate-y-1/2 text-blue-500/30 font-black text-2xl tracking-[1em] writing-vertical-rl">マンガの宇宙</div>
          <div className="absolute right-6 top-1/2 -translate-y-1/2 text-rose-500/30 font-black text-2xl tracking-[1em] writing-vertical-rl">無限の物語</div>
      </div>

      <div className={`transition-all duration-1000 ease-out z-10 w-full flex flex-col items-center max-w-sm px-6 ${fade ? 'scale-100 translate-y-0' : 'scale-95 translate-y-4 opacity-0'}`}>
        
        {/* LOGO GIGANTE E TÍTULOS */}
        <div className="relative flex flex-col items-center mb-8">
            <NexonLogo className="w-36 h-36 mb-4 relative z-10 drop-shadow-[0_0_30px_rgba(59,130,246,0.6)]" />
            <h1 className="text-white text-[42px] font-black tracking-[0.4em] leading-none mb-2 ml-4 relative z-10 drop-shadow-md">N E X O</h1>
            <h2 className="text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 to-rose-500 text-[14px] font-black tracking-[1em] uppercase ml-4 relative z-10">S C A N</h2>
        </div>

        <div className="flex items-center gap-3 w-full justify-center mb-16 opacity-80">
            <div className="text-[10px] text-gray-500 font-black tracking-[0.2em] uppercase">/// Seu portal para o <span className="text-purple-400">universo dos mangás</span> ///</div>
        </div>
        
        {/* BARRA DE PROGRESSO HEXAGONAL (ESTILO JOGO) */}
        <div className="w-[90%] relative h-12 mb-6 shadow-[0_0_30px_rgba(0,0,0,0.8)]" style={barClip}>
           {/* Fundo da Barra */}
           <div className="absolute inset-0 bg-[#0a0a16] border-[2px] border-white/10" style={barClip}></div>
           
           {/* Preenchimento Gradient Split */}
           <div className="absolute top-0 left-0 h-full bg-gradient-to-r from-cyan-400 via-purple-500 to-rose-500 transition-all duration-75 shadow-[inset_0_0_15px_rgba(255,255,255,0.4)]" style={{ width: `${progress}%`, ...barClip }}></div>
           
           {/* Reflexo Brilhante no Topo */}
           <div className="absolute top-0 left-0 w-full h-[2px] bg-white/50 blur-[1px]"></div>
           
           {/* Porcentagem Centralizada */}
           <div className="absolute inset-0 flex items-center justify-center text-white font-black text-sm tracking-widest drop-shadow-[0_2px_4px_rgba(0,0,0,0.8)]">
               {progress}%
           </div>
        </div>

        <p className="text-center text-[8px] text-gray-500 font-bold tracking-[0.3em] uppercase">Carregando sua experiência...</p>
        
        {/* Ícone de Shuriken inferior */}
        <div className="mt-8 opacity-40">
           <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="url(#nexonPurple)" strokeWidth="1.5">
             <path d="M12 2 L13.5 10.5 L22 12 L13.5 13.5 L12 22 L10.5 13.5 L2 12 L10.5 10.5 Z" />
           </svg>
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
                <NexonLogo className="w-16 h-16 opacity-40 grayscale hover:grayscale-0 hover:opacity-100 transition-all duration-500 mb-4" />
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
