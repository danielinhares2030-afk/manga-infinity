import React from 'react';
import { ShieldAlert, AlertCircle, CheckCircle, Zap, Lock } from 'lucide-react';

/* NOVO ÍCONE: LIVRO ABISSAL COM OLHO DE I.A. */
export function AbyssalLogo({ className = "w-10 h-10" }) {
  return (
    <svg viewBox="0 0 100 100" fill="none" xmlns="http://www.w3.org/2000/svg" className={className}>
      <defs>
        <radialGradient id="eyeGlow" cx="50%" cy="50%" r="50%">
          <stop offset="0%" stopColor="#ef4444" stopOpacity="0.6" />
          <stop offset="100%" stopColor="#ef4444" stopOpacity="0" />
        </radialGradient>
        <linearGradient id="bookGradient" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="#f59e0b" />
          <stop offset="100%" stopColor="#b45309" />
        </linearGradient>
        <linearGradient id="eyeIris" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="#ef4444" />
          <stop offset="100%" stopColor="#991b1b" />
        </linearGradient>
      </defs>
      {/* Aura Pulsante */}
      <circle cx="50" cy="50" r="45" fill="url(#eyeGlow)" className="animate-pulse" />
      {/* Capa do Livro */}
      <path d="M20 75 L50 90 L80 75 L80 25 L50 40 L20 25 Z" fill="#0f172a" stroke="url(#bookGradient)" strokeWidth="4" strokeLinejoin="round" />
      {/* Páginas Internas */}
      <path d="M25 70 L50 85 L75 70 L75 30 L50 45 L25 30 Z" fill="#1e293b" stroke="#fbbf24" strokeWidth="2" strokeLinejoin="round" />
      <line x1="50" y1="45" x2="50" y2="85" stroke="#fbbf24" strokeWidth="2" />
      {/* Olho Abissal */}
      <path d="M35 55 Q50 40 65 55 Q50 70 35 55 Z" fill="#000" stroke="#ef4444" strokeWidth="3" />
      <circle cx="50" cy="55" r="7" fill="url(#eyeIris)" />
      <circle cx="50" cy="55" r="3" fill="#000" />
      {/* Linhas de I.A e Poder */}
      <path d="M50 20 L50 10 M30 35 L20 25 M70 35 L80 25" stroke="#3b82f6" strokeWidth="2" strokeLinecap="round" className="animate-pulse" />
    </svg>
  );
}

export class ErrorBoundary extends React.Component {
  constructor(props) { super(props); this.state = { hasError: false, error: null }; }
  static getDerivedStateFromError(error) { return { hasError: true, error }; }
  render() {
    if (this.state.hasError) {
      return (
        <div className="min-h-screen bg-[#050508] text-red-500 p-10 flex flex-col items-center justify-center font-sans border border-red-900/30">
          <ShieldAlert className="w-16 h-16 mb-4 animate-pulse text-red-600"/>
          <h1 className="text-2xl font-black uppercase tracking-widest text-white text-center">Fenda no Sistema</h1>
          <p className="mt-2 text-red-400/80 text-sm max-w-lg text-center break-words font-medium">{this.state.error?.message}</p>
          <button onClick={() => window.location.reload()} className="mt-8 bg-blue-900/50 hover:bg-blue-700 border border-blue-500/50 text-white px-8 py-3.5 rounded-xl font-black uppercase text-[10px] tracking-widest shadow-[0_0_20px_rgba(37,99,235,0.3)] transition-all">Restaurar Conexão</button>
        </div>
      );
    }
    return this.props.children;
  }
}

export function GlobalToast({ toast }) {
  if (!toast) return null;
  const isError = toast.type === 'error';
  const isSuccess = toast.type === 'success';
  const isWarning = toast.type === 'warning';
  return (
    <div className={`fixed top-6 left-1/2 -translate-x-1/2 z-[99999] px-6 py-3.5 rounded-2xl font-black text-xs uppercase tracking-wider border flex items-center gap-3 animate-in slide-in-from-top-5 fade-out duration-300 w-max max-w-[90vw] backdrop-blur-xl shadow-2xl ${isError ? 'bg-red-950/90 text-red-200 border-red-600/50' : isWarning ? 'bg-amber-950/90 text-amber-200 border-amber-600/50' : isSuccess ? 'bg-[#050508]/95 text-amber-400 border-amber-500/50' : 'bg-[#020205]/95 text-blue-400 border-blue-900/50'}`}>
      {isError && <AlertCircle className="w-4 h-4 text-red-500"/>}{isSuccess && <CheckCircle className="w-4 h-4 text-amber-400"/>}{isWarning && <ShieldAlert className="w-4 h-4 text-amber-500"/>}{!isError && !isSuccess && !isWarning && <Zap className="w-4 h-4 text-blue-400 animate-pulse"/>}
      <span className='text-center'>{toast.text}</span>
    </div>
  );
}

export function Footer() {
    return (
        <footer className="w-full bg-[#020205] border-t border-blue-900/20 py-12 mt-auto pb-24 md:pb-12 relative overflow-hidden flex flex-col items-center justify-center">
            <div className="absolute bottom-[-20%] left-1/2 -translate-x-1/2 w-64 h-64 bg-blue-900/10 rounded-full blur-[100px] pointer-events-none"></div>
            <div className="max-w-7xl mx-auto px-4 text-center relative z-10 flex flex-col items-center justify-center w-full">
                <div className="flex justify-center items-center gap-3 mb-5 relative">
                    <AbyssalLogo className="w-10 h-10 drop-shadow-[0_0_10px_rgba(245,158,11,0.5)]" />
                    <span className="font-black text-xl text-transparent bg-clip-text bg-gradient-to-r from-blue-100 via-white to-amber-500 tracking-[0.2em] uppercase">MANGÁS ABISSAL</span>
                </div>
                <p className="text-gray-500 text-[9px] uppercase font-black tracking-[0.2em] mb-4 text-center">Mangás Abissal - © 2026. O Vazio Resguarda.</p>
                <div className="flex items-center justify-center gap-1.5 opacity-40 mx-auto">
                    <Lock className="w-3 h-3 text-amber-500" />
                    <span className="text-[8px] text-amber-600 uppercase tracking-widest font-black">Blindado no Vazio SSL</span>
                </div>
            </div>
        </footer>
    );
}

export function SplashScreen() {
  return (
    <div className="fixed inset-0 z-[600] bg-[#020205] flex flex-col items-center justify-center overflow-hidden font-sans">
      <style>{`
        @keyframes vortex-open { 0% { transform: scale(0.8); opacity: 0; filter: blur(20px); } 50% { transform: scale(1.05); opacity: 1; filter: blur(0px); } 100% { transform: scale(1); opacity: 1; } }
      `}</style>
      
      <div className="absolute w-[60rem] h-[60rem] bg-gradient-to-tr from-blue-900/10 via-[#020205] to-red-900/5 rounded-full blur-[120px] animate-[spin_25s_linear_infinite]"></div>

      <div className="relative z-20 flex flex-col items-center animate-[vortex-open_1.5s_cubic-bezier(0.2,0.8,0.2,1)_forwards] w-full max-w-sm mx-auto text-center">
        <AbyssalLogo className="w-36 h-36 mx-auto mb-10 drop-shadow-[0_0_25px_rgba(239,68,68,0.6)]" />
        <h1 className="text-4xl md:text-5xl font-black text-transparent bg-clip-text bg-gradient-to-b from-white via-blue-100 to-blue-700 tracking-[0.3em] ml-[0.3em] text-center leading-tight uppercase">MANGÁS<br/>ABISSAL</h1>
        <div className="mt-12 text-amber-500 text-[9px] md:text-[10px] font-black tracking-[0.5em] uppercase animate-pulse bg-[#050508]/80 px-6 py-2.5 rounded-full border border-amber-900/30 backdrop-blur-md shadow-[0_0_15px_rgba(245,158,11,0.15)] text-center mx-auto">CONECTANDO AO VAZIO...</div>
      </div>
    </div>
  );
}
