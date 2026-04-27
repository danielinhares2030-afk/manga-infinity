import React, { useState, useEffect } from 'react';
import { AlertCircle } from 'lucide-react';

// NOVO ÍCONE MÁGICO SURREAL (NEXO CÓSMICO DE INFINITO)
export const InfinityLogo = React.memo(({ className = "w-32 h-32" }) => {
  return (
    <div className={`relative flex items-center justify-center ${className}`}>
      <style>{`
        @keyframes flowCosmic {
          0%, 100% { stroke-dashoffset: 200; filter: drop-shadow(0 0 10px rgba(59,130,246,0.6)); }
          50% { stroke-dashoffset: 0; filter: drop-shadow(0 0 20px rgba(168,85,247,0.8)); }
        }
        @keyframes ringSpin {
          0% { transform: rotate(0deg) scale(1); }
          100% { transform: rotate(360deg) scale(1.05); }
        }
        @keyframes floatMagico {
          0%, 100% { transform: translateY(0px); }
          50% { transform: translateY(-8px); }
        }
      `}</style>
      <svg viewBox="0 0 160 120" className="relative z-10 w-full h-full" style={{ animation: 'floatMagico 3s ease-in-out infinite' }}>
        <defs>
          <linearGradient id="cosmicGrad" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#3b82f6" /> {/* Azul */}
            <stop offset="100%" stopColor="#a855f7" /> {/* Roxo */}
          </linearGradient>
          <linearGradient id="crystalGrad" x1="0%" y1="0%" x2="0%" y2="100%">
            <stop offset="0%" stopColor="#ffffff" />
            <stop offset="50%" stopColor="#10b981" /> {/* Verde Esmeralda */}
            <stop offset="100%" stopColor="#059669" />
          </linearGradient>
        </defs>
        
        {/* Anéis Orbitais Místicos (Animação ringSpin) */}
        <ellipse cx="80" cy="60" rx="70" ry="15" fill="none" stroke="rgba(251,191,36,0.3)" strokeWidth="1" strokeDasharray="10 5" style={{ transformOrigin: '80px 60px', animation: 'ringSpin 15s linear infinite' }} />
        <ellipse cx="80" cy="60" rx="70" ry="15" fill="none" stroke="rgba(168,85,247,0.2)" strokeWidth="0.5" strokeDasharray="5 15" style={{ transformOrigin: '80px 60px', animation: 'ringSpin 10s linear infinite reverse' }} />

        {/* Cristal Central do Nexo (Surreal) */}
        <polygon points="80,10 95,60 80,110 65,60" fill="url(#crystalGrad)" opacity="0.95" filter="drop-shadow(0 0 15px rgba(16,185,129,0.7))" />
        <polygon points="80,25 88,60 80,95 72,60" fill="none" stroke="#ffffff" strokeWidth="1.5" opacity="0.6" />
        <circle cx="80" cy="60" r="4" fill="#fbbf24" filter="drop-shadow(0 0 10px rgba(251,191,36,0.8))" />
        
        {/* Símbolo do Infinito Formado por Fluxos Cósmicos (Animação flowCosmic) */}
        <path d="M 80 60 C 55 10, 10 10, 10 60 C 10 110, 55 110, 80 60 C 105 10, 150 10, 150 60 C 150 110, 105 110, 80 60 Z" 
              fill="none" stroke="url(#cosmicGrad)" strokeWidth="8" strokeLinecap="round" strokeDasharray="200" 
              style={{ animation: 'flowCosmic 6s linear infinite' }}/>
        <path d="M 80 60 C 55 10, 10 10, 10 60 C 10 110, 55 110, 80 60 C 105 10, 150 10, 150 60 C 150 110, 105 110, 80 60 Z" 
              fill="none" stroke="#ffffff" strokeWidth="2.5" opacity="0.7" strokeLinecap="round" strokeDasharray="150" 
              style={{ animation: 'flowCosmic 4s linear infinite reverse' }} />

        {/* Partículas Mágicas Flutuantes */}
        <circle cx="20" cy="20" r="2" fill="#fbbf24" opacity="0.7" />
        <circle cx="140" cy="100" r="1.5" fill="#10b981" opacity="0.6" />
        <circle cx="150" cy="30" r="2.5" fill="#3b82f6" opacity="0.8" />
        <circle cx="30" cy="100" r="2" fill="#a855f7" opacity="0.7" />
      </svg>
    </div>
  );
});

export const SplashScreen = React.memo(() => {
  const [fade, setFade] = useState(false);

  useEffect(() => {
    const t1 = setTimeout(() => setFade(true), 50); 
    return () => clearTimeout(t1);
  }, []);

  return (
    <div className={`fixed inset-0 z-[9999] bg-[#050505] flex flex-col items-center justify-center font-sans transition-all duration-500 ease-in-out opacity-100 scale-100`}>
      <style>{`body, html { background-color: #050505 !important; margin: 0; padding: 0; }`}</style>
      
      {/* AURAS MÁGICAS */}
      <div className="absolute top-[20%] left-[10%] w-[50vw] h-[50vw] bg-blue-600/15 blur-[120px] rounded-full animate-[pulse_4s_ease-in-out_infinite_alternate]"></div>
      <div className="absolute bottom-[20%] right-[10%] w-[50vw] h-[50vw] bg-purple-600/15 blur-[120px] rounded-full animate-[pulse_5s_ease-in-out_infinite_alternate-reverse]"></div>
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[60vw] h-[60vw] bg-emerald-500/10 blur-[150px] rounded-full"></div>

      <div className={`flex flex-col items-center justify-center relative z-10 transition-all duration-[600ms] ease-out px-4 w-full text-center ${fade ? 'opacity-100 scale-100 translate-y-0' : 'opacity-0 scale-90 translate-y-4'}`}>
        
        {/* NOVO ÍCONE DE ABERTURA SURREAL */}
        <InfinityLogo className="w-48 h-48 md:w-56 md:h-56 mb-4" />
        
        <h1 className="text-4xl sm:text-5xl md:text-6xl font-black text-transparent bg-clip-text bg-gradient-to-r from-blue-400 via-purple-400 to-emerald-400 tracking-[0.2em] uppercase drop-shadow-[0_0_15px_rgba(147,51,234,0.3)] mt-2">
          MANGA <span className="font-bold text-white">INFINITY</span>
        </h1>
        
        <div className="mt-12 flex items-center gap-3 opacity-80">
            <div className="w-3 h-3 bg-blue-400 rounded-full animate-ping"></div>
            <div className="w-3 h-3 bg-purple-400 rounded-full animate-ping" style={{animationDelay: '0.2s'}}></div>
            <div className="w-3 h-3 bg-emerald-400 rounded-full animate-ping" style={{animationDelay: '0.4s'}}></div>
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
        <div className="min-h-screen bg-[#050505] p-10 flex flex-col items-center justify-center font-sans border-t-[4px] border-purple-500">
          <AlertCircle className="w-16 h-16 mb-4 text-purple-500 animate-pulse"/>
          <h1 className="text-2xl font-black uppercase tracking-widest text-white text-center">Erro na Matriz</h1>
          <p className="mt-2 text-gray-400 text-xs font-bold text-center max-w-lg">{this.state.error?.message}</p>
          <button onClick={() => window.location.reload()} className="mt-8 bg-purple-500/10 border-2 border-purple-500 text-purple-400 hover:bg-purple-500 hover:text-black rounded-xl px-8 py-3 font-black text-[10px] uppercase tracking-widest transition-all">Restaurar Conexão</button>
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
                 'bg-purple-950/90 text-purple-200 border-purple-500/50';
  return (
    <div className={`fixed top-6 left-1/2 -translate-x-1/2 z-[99999] px-6 py-3.5 font-black text-[10px] uppercase tracking-[0.1em] border rounded-xl backdrop-blur-xl animate-in slide-in-from-top-5 fade-in duration-300 shadow-xl ${colors}`}>
      <span className='text-center flex items-center gap-2'>{toast.text}</span>
    </div>
  );
}

export function Footer() {
    return (
        <footer className="w-full bg-[#050505] border-t border-white/5 py-12 mt-auto pb-24 md:pb-12 flex flex-col items-center justify-center relative overflow-hidden">
            <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[300px] h-[1px] bg-gradient-to-r from-transparent via-purple-500/50 to-transparent"></div>
            <div className="max-w-7xl mx-auto px-4 text-center flex flex-col items-center relative z-10">
                <InfinityLogo className="w-16 h-16 opacity-30 mb-4" />
                <span className="font-black text-xs text-gray-700 tracking-[0.3em] uppercase">MANGA INFINITY</span>
            </div>
        </footer>
    );
}

export const ChapterTransitionOverlay = React.memo(({ isVisible, chapterNumber }) => {
    if (!isVisible) return null;
    return (
        <div className="fixed inset-0 z-[99999] bg-[#050505] font-sans flex flex-col items-center justify-center animate-in fade-in duration-300">
            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-64 h-64 bg-purple-500/10 blur-[80px] rounded-full"></div>
            <div className="text-purple-400 font-black tracking-[0.5em] text-[10px] uppercase mb-2 animate-pulse relative z-10">
                Acessando Memória
            </div>
            <h2 className="text-6xl sm:text-8xl font-black text-transparent bg-clip-text bg-gradient-to-br from-purple-300 to-white tracking-tighter animate-in zoom-in-50 duration-300 relative z-10 drop-shadow-[0_0_20px_rgba(168,85,247,0.3)]">
              {chapterNumber}
            </h2>
        </div>
    );
});
