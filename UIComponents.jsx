import React from 'react';
import { ShieldAlert, AlertCircle, CheckCircle, Zap, Lock } from 'lucide-react';

/* ÍCONE COM ANIMAÇÃO DE PULSAÇÃO ORGÂNICA */
export function AbyssalLogo({ className = "w-10 h-10" }) {
  return (
    <img 
      src="https://i.ibb.co/zh5k9rkG/1775680662923-v4lypu-removebg-preview.png" 
      alt="Logo Mangás Abissal" 
      className={`object-contain transition-all duration-700 animate-[pulse_4s_ease-in-out_infinite] ${className}`}
      onError={(e) => e.target.style.display = 'none'}
    />
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
          <button onClick={() => window.location.reload()} className="mt-8 bg-zinc-900 border border-zinc-700 text-white px-8 py-3.5 rounded-xl font-black uppercase text-[10px] tracking-widest transition-all">Restaurar Conexão</button>
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
  return (
    <div className={`fixed top-6 left-1/2 -translate-x-1/2 z-[99999] px-6 py-3.5 rounded-2xl font-black text-xs uppercase tracking-wider border flex items-center gap-3 animate-in slide-in-from-top-5 duration-300 backdrop-blur-3xl shadow-2xl ${isError ? 'bg-red-950/90 text-red-200 border-red-600/50' : isSuccess ? 'bg-zinc-950/90 text-amber-400 border-amber-500/50' : 'bg-zinc-950/95 text-zinc-400 border-zinc-800'}`}>
      <span className='text-center'>{toast.text}</span>
    </div>
  );
}

export function Footer() {
    return (
        <footer className="w-full bg-[#050508] border-t border-zinc-900/50 py-12 mt-auto pb-24 md:pb-12 relative overflow-hidden flex flex-col items-center justify-center">
            <div className="max-w-7xl mx-auto px-4 text-center relative z-10">
                <div className="flex justify-center items-center gap-3 mb-5">
                    <AbyssalLogo className="w-10 h-10 grayscale opacity-50" />
                    <span className="font-black text-xl text-zinc-500 tracking-[0.2em] uppercase">MANGÁS ABISSAL</span>
                </div>
                <p className="text-zinc-600 text-[9px] uppercase font-black tracking-[0.2em]">O Vazio Resguarda - © 2026</p>
            </div>
        </footer>
    );
}

/* ABERTURA: ABISMO PROFUNDO (SEM NEON) */
export function SplashScreen() {
  return (
    <div className="fixed inset-0 z-[9999] bg-[#020203] flex flex-col items-center justify-center overflow-hidden font-sans">
      <style>{`
        @keyframes abismo-crescer {
          0% { transform: scale(0); opacity: 0; filter: blur(50px); }
          100% { transform: scale(4); opacity: 1; filter: blur(0); }
        }
        @keyframes flutuar-vazio {
          0%, 100% { transform: translateY(0) scale(1); }
          50% { transform: translateY(-20px) scale(1.05); }
        }
      `}</style>
      
      {/* O Abismo em camadas de profundidade */}
      <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
        <div className="w-[100px] h-[100px] bg-[#0a0a0c] rounded-full" style={{ animation: 'abismo-crescer 3s ease-in-out forwards' }}></div>
        <div className="absolute w-[200px] h-[200px] border border-zinc-900/20 rounded-full animate-[spin_20s_linear_infinite]"></div>
      </div>

      <div className="relative z-20 flex flex-col items-center animate-[flutuar-vazio_4s_ease-in-out_infinite]">
        <AbyssalLogo className="w-32 h-32 mb-12 grayscale opacity-80" />
        <div className="h-[1px] w-24 bg-gradient-to-r from-transparent via-zinc-700 to-transparent mb-8"></div>
        <h1 className="text-2xl font-black text-zinc-400 tracking-[0.5em] uppercase text-center ml-[0.5em]">ABISSAL</h1>
        <div className="mt-16 text-zinc-600 text-[8px] font-black tracking-[0.8em] uppercase">Mergulhando no Vazio</div>
      </div>
    </div>
  );
}

/* TRANSIÇÃO DE CAPÍTULO APRIMORADA */
export function ChapterTransitionOverlay({ isVisible, chapterNumber }) {
    if (!isVisible) return null;
    return (
        <div className="fixed inset-0 z-[99999] bg-[#020203] flex items-center justify-center animate-in fade-in duration-500">
            <div className="absolute inset-0 opacity-20">
                <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-full h-[1px] bg-white animate-[scale-x-150_1s_ease-in-out]"></div>
            </div>
            <div className="relative z-10 flex flex-col items-center">
                <div className="text-zinc-600 font-black tracking-[1em] text-[10px] uppercase mb-8 animate-pulse">Próxima Camada</div>
                <h2 className="text-9xl font-black text-white tracking-tighter animate-in slide-in-from-bottom-10 duration-700">
                    {chapterNumber}
                </h2>
                <div className="mt-12 h-0.5 w-48 bg-zinc-900 relative overflow-hidden">
                    <div className="absolute inset-0 bg-white/20 animate-[slide-in-from-left_1.5s_infinite]"></div>
                </div>
            </div>
        </div>
    );
}
