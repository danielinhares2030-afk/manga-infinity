import React, { useState, useEffect } from 'react';
import { AlertTriangle } from 'lucide-react';

// NOVO LOGO NEXO SCAN GLOBAL
export const NexoLogo = React.memo(({ className = "w-64 h-64" }) => {
  return (
    <div className={`relative flex items-center justify-center ${className}`}>
      <svg viewBox="0 0 100 100" fill="none" xmlns="http://www.w3.org/2000/svg" className="w-full h-full drop-shadow-[0_5px_15px_rgba(59,130,246,0.4)] relative z-10">
        <defs>
          <linearGradient id="nexoCyan" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#0ea5e9" />
            <stop offset="100%" stopColor="#3b82f6" />
          </linearGradient>
          <linearGradient id="nexoPurple" x1="0%" y1="100%" x2="100%" y2="0%">
            <stop offset="0%" stopColor="#8b5cf6" />
            <stop offset="100%" stopColor="#d946ef" />
          </linearGradient>
        </defs>
        <path d="M15,15 L35,15 L85,85 L65,85 Z" fill="url(#nexoCyan)" />
        <path d="M15,85 L35,85 L85,15 L65,15 Z" fill="url(#nexoPurple)" />
      </svg>
    </div>
  );
});

export const SplashScreen = React.memo(() => {
  const [fade, setFade] = useState(false);
  useEffect(() => { const t1 = setTimeout(() => setFade(true), 50); return () => clearTimeout(t1); }, []);
  
  return (
    <div className={`fixed inset-0 z-[9999] bg-[#020205] flex items-center justify-center font-sans transition-opacity duration-700 ${fade ? 'opacity-100' : 'opacity-0'}`}>
      <style>{`body, html { background-color: #020205 !important; }`}</style>
      
      <div className="absolute inset-0 bg-[#020205]">
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,rgba(59,130,246,0.15)_0%,transparent_60%)]"></div>
          <div className="absolute inset-0 bg-[linear-gradient(rgba(255,255,255,0.02)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.02)_1px,transparent_1px)] bg-[size:40px_40px]"></div>
      </div>

      <div className={`transition-all duration-1000 ease-out z-10 flex flex-col items-center ${fade ? 'scale-100 translate-y-0' : 'scale-95 translate-y-4 opacity-0'}`}>
        <div className="w-32 h-32 md:w-40 md:h-40 mb-10 drop-shadow-[0_0_40px_rgba(59,130,246,0.4)]">
            <NexoLogo className="w-full h-full" />
        </div>
        
        <div className="w-48 h-[2px] bg-white/10 rounded-full overflow-hidden relative">
           <div className="absolute inset-0 bg-gradient-to-r from-cyan-500 to-purple-500 animate-[loading_2s_ease-in-out_infinite] rounded-full shadow-[0_0_10px_rgba(139,92,246,0.8)]"></div>
        </div>
        <style>{`@keyframes loading { 0% { width: 0%; left: -100%; } 50% { width: 100%; left: 0%; } 100% { width: 0%; left: 100%; } }`}</style>
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
        <div className="min-h-screen bg-[#020205] p-10 flex flex-col items-center justify-center font-sans border-t-[4px] border-cyan-500">
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
                 'bg-[#08080f]/90 text-gray-200 border-blue-900/30 shadow-xl';
  return (
    <div className={`fixed top-6 left-1/2 -translate-x-1/2 z-[99999] px-6 py-3.5 font-black text-[10px] uppercase tracking-[0.1em] border rounded-xl backdrop-blur-xl animate-in slide-in-from-top-5 fade-in duration-300 ${colors}`}>
      <span className='text-center flex items-center gap-2'>{toast.text}</span>
    </div>
  );
}

export function Footer() {
    return (
        <footer className="w-full bg-[#020205] border-t border-purple-900/20 py-12 mt-auto pb-24 md:pb-12 flex flex-col items-center justify-center relative overflow-hidden">
            <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[300px] h-[1px] bg-gradient-to-r from-transparent via-cyan-500/50 to-transparent"></div>
            <div className="max-w-7xl mx-auto px-4 text-center flex flex-col items-center relative z-10">
                <NexoLogo className="w-20 h-20 opacity-40 grayscale hover:grayscale-0 hover:opacity-100 transition-all duration-500 mb-4" />
                <span className="font-black text-[10px] text-gray-600 tracking-[0.5em] uppercase mt-2">NEXO SCAN</span>
                <span className="font-bold text-[8px] text-gray-700 tracking-[0.2em] uppercase mt-1">SEU PORTAL PARA O UNIVERSO DOS MANGÁS</span>
            </div>
        </footer>
    );
}

export const ChapterTransitionOverlay = React.memo(({ isVisible, chapterNumber }) => {
    if (!isVisible) return null;
    return (
        <div className="fixed inset-0 z-[99999] bg-[#020205] font-sans flex flex-col items-center justify-center overflow-hidden animate-in fade-in duration-300">
            <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,_var(--tw-gradient-stops))] from-purple-900/20 via-[#020205] to-[#020205]"></div>
            
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
