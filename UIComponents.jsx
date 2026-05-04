import React, { useState, useEffect } from 'react';
import { AlertTriangle } from 'lucide-react';

export const SplashScreen = React.memo(() => {
  const [fade, setFade] = useState(false);
  const [progress, setProgress] = useState(0);

  useEffect(() => { 
      const t1 = setTimeout(() => setFade(true), 50); 
      const duration = 2500;
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

  return (
    <div className={`fixed inset-0 z-[9999] bg-[#07050A] flex flex-col items-center justify-center font-sans transition-opacity duration-1000 ${fade ? 'opacity-100' : 'opacity-0'} overflow-hidden`}>
      
      {/* LINHAS TECNOLÓGICAS DE FUNDO */}
      <div className="absolute inset-0 pointer-events-none z-0">
          <div className="absolute top-[-10%] left-[-10%] w-[50%] h-[2px] bg-purple-900/30 transform rotate-45"></div>
          <div className="absolute top-[10%] left-[-20%] w-[60%] h-[1px] bg-purple-500/20 transform rotate-45"></div>
          <div className="absolute bottom-[-10%] right-[-10%] w-[50%] h-[2px] bg-purple-900/30 transform rotate-45"></div>
          <div className="absolute top-1/4 right-[10%] w-[20%] h-[1px] bg-purple-500/40"></div>
          <div className="absolute bottom-1/4 left-[10%] w-[30%] h-[1px] bg-purple-500/20"></div>
          
          {/* Grid Subtil */}
          <div className="absolute inset-0 bg-[linear-gradient(rgba(255,255,255,0.01)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.01)_1px,transparent_1px)] bg-[size:30px_30px]"></div>
      </div>

      <div className={`relative z-10 w-full flex flex-col items-center transition-all duration-1000 ease-out ${fade ? 'scale-100' : 'scale-90 opacity-0'}`}>
        
        {/* CÍRCULO HUD CENTRAL (Estilo Radar) */}
        <div className="relative w-[300px] h-[300px] md:w-[400px] md:h-[400px] flex items-center justify-center mb-16">
            
            {/* Anéis Externos */}
            <div className="absolute inset-0 rounded-full border border-white/5"></div>
            <div className="absolute inset-4 rounded-full border border-purple-500/10"></div>
            
            {/* Anel Brilhante Animado */}
            <div className="absolute inset-2 rounded-full border-t-2 border-r-2 border-purple-500 shadow-[0_0_30px_rgba(168,85,247,0.6)] animate-[spin_4s_linear_infinite]"></div>
            
            {/* Luz Interna de Fundo */}
            <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,rgba(168,85,247,0.05)_0%,transparent_60%)] rounded-full"></div>

            {/* LOGO NEXO DENTRO DO CÍRCULO */}
            <div className="flex flex-col items-center justify-center relative z-20">
                <div className="flex items-center text-white text-[65px] md:text-[80px] font-black tracking-widest leading-none drop-shadow-md">
                    NE<span className="text-purple-600 mx-1 drop-shadow-[0_0_15px_rgba(168,85,247,0.8)]">X</span>O
                </div>
                <div className="flex items-center gap-6 mt-4 opacity-80">
                    <span className="text-purple-500 text-xs md:text-sm font-black tracking-[1em] uppercase ml-3">S C A N</span>
                </div>
            </div>
        </div>

        {/* BARRA DE PROGRESSO INFERIOR */}
        <div className="flex flex-col items-center w-full max-w-[240px]">
            <p className="text-[9px] text-gray-400 font-medium tracking-[0.4em] uppercase mb-4 opacity-80">
                Conectando
            </p>
            
            <div className="relative w-full h-[2px] bg-purple-900/30 rounded-full overflow-hidden">
                {/* Linha de preenchimento */}
                <div 
                    className="absolute top-0 left-0 h-full bg-purple-500 shadow-[0_0_10px_rgba(168,85,247,1)] transition-all duration-[30ms] ease-linear" 
                    style={{ width: `${progress}%` }}
                ></div>
                
                {/* Ponto de Luz na Ponta */}
                <div 
                    className="absolute top-1/2 -translate-y-1/2 w-4 h-[3px] bg-white rounded-full shadow-[0_0_15px_rgba(255,255,255,1)] transition-all duration-[30ms] ease-linear"
                    style={{ left: `calc(${progress}% - 8px)` }}
                ></div>
            </div>
        </div>

      </div>
    </div>
  );
});

export const NexoLogo = React.memo(({ className = "w-64 h-64" }) => {
  return (
    <svg className={className} viewBox="0 0 100 100" fill="none" xmlns="http://www.w3.org/2000/svg">
      <defs>
        <linearGradient id="nexonPurple" x1="0%" y1="100%" x2="100%" y2="0%">
          <stop offset="0%" stopColor="#c084fc" />
          <stop offset="100%" stopColor="#818cf8" />
        </linearGradient>
      </defs>
      <path d="M 30 75 V 25 L 70 65" stroke="white" strokeWidth="14" strokeLinecap="round" strokeLinejoin="round" />
      <path d="M 70 25 V 75 L 30 35" stroke="url(#nexonPurple)" strokeWidth="14" strokeLinecap="round" strokeLinejoin="round" style={{ mixBlendMode: 'screen' }} />
    </svg>
  );
});

export class ErrorBoundary extends React.Component {
  constructor(props) { super(props); this.state = { hasError: false, error: null }; }
  static getDerivedStateFromError(error) { return { hasError: true, error }; }
  render() {
    if (this.state.hasError) {
      return (
        <div className="min-h-screen bg-[#07050A] p-10 flex flex-col items-center justify-center font-sans border-t-[4px] border-purple-500">
          <AlertTriangle className="w-16 h-16 mb-4 text-purple-500 animate-pulse drop-shadow-[0_0_15px_rgba(168,85,247,0.5)]"/>
          <h1 className="text-2xl font-black uppercase tracking-widest text-white text-center">Falha no Sistema (Erro)</h1>
          <p className="mt-2 text-gray-500 text-xs font-bold text-center max-w-lg">{this.state.error?.message}</p>
          <button onClick={() => window.location.reload()} className="mt-8 bg-purple-950/30 border border-purple-500/50 text-purple-400 hover:bg-purple-600 hover:text-white rounded-xl px-8 py-3 font-black text-[10px] uppercase tracking-widest transition-all shadow-lg">Restaurar Conexão</button>
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
                 'bg-[#080510]/90 text-gray-200 border-purple-900/30 shadow-xl';
  return (
    <div className={`fixed top-6 left-1/2 -translate-x-1/2 z-[99999] px-6 py-3.5 font-black text-[10px] uppercase tracking-[0.1em] border rounded-xl backdrop-blur-xl animate-in slide-in-from-top-5 fade-in duration-300 ${colors}`}>
      <span className='text-center flex items-center gap-2'>{toast.text}</span>
    </div>
  );
}

export function Footer() {
    return (
        <footer className="w-full bg-[#07050A] border-t border-purple-900/20 py-12 mt-auto pb-24 md:pb-12 flex flex-col items-center justify-center relative overflow-hidden">
            <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[300px] h-[1px] bg-gradient-to-r from-transparent via-purple-500/50 to-transparent"></div>
            <div className="max-w-7xl mx-auto px-4 text-center flex flex-col items-center relative z-10">
                <NexoLogo className="w-16 h-16 opacity-40 grayscale hover:grayscale-0 hover:opacity-100 transition-all duration-500 mb-4" />
                <span className="font-black text-[10px] text-gray-600 tracking-[0.5em] uppercase mt-2">NEXO SCAN</span>
                <span className="font-bold text-[8px] text-gray-700 tracking-[0.2em] uppercase mt-1">SISTEMA CIBERNÉTICO</span>
            </div>
        </footer>
    );
}

export const ChapterTransitionOverlay = React.memo(({ isVisible, chapterNumber }) => {
    if (!isVisible) return null;
    return (
        <div className="fixed inset-0 z-[99999] bg-[#07050A] font-sans flex flex-col items-center justify-center overflow-hidden animate-in fade-in duration-300">
            <div className="relative z-10 flex flex-col items-center animate-in zoom-in-95 duration-500">
                <div className="w-12 h-12 border-4 border-purple-500/30 border-t-purple-500 rounded-full animate-[spin_1s_linear_infinite] mb-6 shadow-[0_0_15px_rgba(168,85,247,0.5)]"></div>
                <div className="text-purple-400 font-black tracking-[0.5em] text-[10px] uppercase mb-3 animate-pulse">Carregando</div>
                <h2 className="text-4xl sm:text-6xl font-black text-white tracking-tighter drop-shadow-lg">CAPÍTULO {chapterNumber}</h2>
            </div>
        </div>
    );
});
