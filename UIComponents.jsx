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

/* ABERTURA: O ABISMO SE ABRINDO (SURREAL) */
export function SplashScreen() {
  return (
    <div className="fixed inset-0 z-[9999] bg-[#020203] flex flex-col items-center justify-center overflow-hidden font-sans">
      <style>{`
        @keyframes abismo-rasgando {
          0% { transform: scaleY(0.01) scaleX(0); opacity: 0; box-shadow: 0 0 0 rgba(34, 211, 238, 0); }
          40% { transform: scaleY(0.02) scaleX(1); opacity: 1; box-shadow: 0 0 50px rgba(34, 211, 238, 0.8); background: #22d3ee; }
          70% { transform: scaleY(50) scaleX(50); opacity: 1; background: #050508; box-shadow: inset 0 0 100px rgba(34, 211, 238, 0.5); }
          100% { transform: scaleY(100) scaleX(100); opacity: 1; background: #050508; box-shadow: none; }
        }
        @keyframes abismo-conteudo {
          0%, 60% { opacity: 0; filter: blur(30px); transform: translateY(20px) scale(0.9); }
          100% { opacity: 1; filter: blur(0); transform: translateY(0) scale(1); }
        }
        @keyframes levitar {
          0%, 100% { transform: translateY(0); }
          50% { transform: translateY(-15px); }
        }
      `}</style>
      
      {/* O Rasgo no Vazio */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-full h-1 bg-white rounded-full z-10" style={{ animation: 'abismo-rasgando 2.5s cubic-bezier(0.8, 0, 0.2, 1) forwards' }}></div>

      <div className="relative z-20 flex flex-col items-center" style={{ animation: 'abismo-conteudo 3s ease-out forwards' }}>
        <div style={{ animation: 'levitar 4s ease-in-out infinite' }}>
            <AbyssalLogo className="w-32 h-32 mb-10 drop-shadow-[0_0_40px_rgba(34,211,238,0.6)]" />
        </div>
        <h1 className="text-4xl font-black text-transparent bg-clip-text bg-gradient-to-b from-white to-cyan-900 tracking-[0.5em] uppercase text-center ml-[0.5em] drop-shadow-2xl">ABISSAL</h1>
        <div className="mt-14 text-cyan-500/60 text-[10px] font-black tracking-[1em] uppercase animate-pulse">A Fenda Está Aberta</div>
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
