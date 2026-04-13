import React, { useState, useEffect } from 'react';
import { ShieldAlert, AlertCircle, CheckCircle, Zap, Lock, Hexagon, User, Key } from 'lucide-react';

/* ==========================================================================
   ÍCONE: O REATOR DO INFINITO (Efeito 3D e Duplo Loop)
   ========================================================================== */
export const InfinityLogo = React.memo(({ className = "w-24 h-12" }) => {
  return (
    <div className={`relative flex items-center justify-center ${className}`}>
      {/* Aura do Reator */}
      <div className="absolute inset-0 bg-gradient-to-r from-cyan-600/40 via-blue-700/20 to-fuchsia-600/40 blur-[25px] rounded-full animate-[pulse_3s_ease-in-out_infinite]"></div>
      
      {/* Símbolo Duplo 3D em SVG */}
      <svg viewBox="0 0 100 50" className="relative z-10 w-full h-full drop-shadow-[0_0_20px_rgba(34,211,238,0.8)]">
        <defs>
          <linearGradient id="neon-cyan" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#22d3ee" />
            <stop offset="100%" stopColor="#8b5cf6" />
          </linearGradient>
          <linearGradient id="neon-fuchsia" x1="100%" y1="100%" x2="0%" y2="0%">
            <stop offset="0%" stopColor="#d946ef" />
            <stop offset="100%" stopColor="#3b82f6" />
          </linearGradient>
        </defs>
        
        {/* Loop Traseiro (Mais escuro) */}
        <path d="M25 15 C10 15 10 35 25 35 C40 35 50 15 75 15 C90 15 90 35 75 35 C60 35 50 15 25 15 Z" fill="none" stroke="url(#neon-fuchsia)" strokeWidth="3" strokeLinecap="round" opacity="0.5" className="animate-[inf-flow-reverse_4s_linear_infinite]" strokeDasharray="150" />
        
        {/* Loop Frontal (Brilhante) */}
        <path d="M25 10 C5 10 5 40 25 40 C45 40 55 10 75 10 C95 10 95 40 75 40 C55 40 45 10 25 10 Z" fill="none" stroke="url(#neon-cyan)" strokeWidth="5" strokeLinecap="round" strokeDasharray="180" className="animate-[inf-flow_3s_linear_infinite]" />
      </svg>

      <div className="absolute z-20 w-4 h-4 bg-white/90 rounded-full shadow-[0_0_30px_15px_rgba(34,211,238,0.6)] animate-ping mix-blend-screen"></div>

      <style>{`
        @keyframes inf-flow { 0% { stroke-dashoffset: 360; } 100% { stroke-dashoffset: 0; } }
        @keyframes inf-flow-reverse { 0% { stroke-dashoffset: 0; } 100% { stroke-dashoffset: 300; } }
      `}</style>
    </div>
  );
});

/* ==========================================================================
   ABERTURA: SALTO NO HIPERESPAÇO
   ========================================================================== */
export const SplashScreen = React.memo(() => {
  const [phase, setPhase] = useState(0);

  useEffect(() => {
    const t1 = setTimeout(() => setPhase(1), 100);   // Estrelas aceleram
    const t2 = setTimeout(() => setPhase(2), 1200);  // Flash e Logo surge
    const t3 = setTimeout(() => setPhase(3), 2500);  // Título e Form
    return () => { clearTimeout(t1); clearTimeout(t2); clearTimeout(t3); };
  }, []);

  return (
    <div className="fixed inset-0 z-[9999] overflow-hidden bg-[#020105] flex items-center justify-center font-sans perspective-[1000px]">
      
      {/* Efeito Hiperespaço (Linhas passando) */}
      <div className={`absolute inset-0 flex items-center justify-center transition-opacity duration-700 ${phase === 1 ? 'opacity-100' : 'opacity-0'}`}>
        <div className="w-[200vw] h-[2px] bg-cyan-400/80 shadow-[0_0_20px_#22d3ee] rotate-45 animate-[warp-lines_0.5s_linear_infinite]"></div>
        <div className="absolute w-[200vw] h-[2px] bg-fuchsia-400/80 shadow-[0_0_20px_#d946ef] -rotate-45 animate-[warp-lines_0.5s_linear_infinite_reverse]"></div>
      </div>

      {/* Flash de Entrada */}
      {phase === 2 && <div className="absolute inset-0 bg-white z-10 animate-[flash-fade_1s_ease-out_forwards]"></div>}

      {/* Fundo Pós-Salto */}
      <div className={`absolute inset-0 bg-[radial-gradient(circle_at_center,_#0b071e_0%,_#020105_100%)] transition-opacity duration-[2000ms] ${phase >= 2 ? 'opacity-100' : 'opacity-0'}`}></div>

      {/* CONTAINER PRINCIPAL */}
      <div className={`relative z-20 flex flex-col items-center justify-center w-full px-4 transition-all duration-[1500ms] ease-out ${phase >= 3 ? '-translate-y-8' : 'translate-y-0'}`}>
        
        {/* Logo */}
        <div className={`transition-all duration-[1500ms] ease-[cubic-bezier(0.17,0.67,0.46,1.2)]
          ${phase >= 2 ? 'opacity-100 scale-100' : 'opacity-0 scale-50'}
          ${phase >= 3 ? 'mb-8 w-44 h-24 md:w-56 md:h-28' : 'mb-0 w-64 h-32 md:w-80 md:h-40'}`}>
          <InfinityLogo className="w-full h-full" />
        </div>

        {/* Título e Login */}
        <div className={`w-full flex flex-col items-center transition-all duration-[1000ms] ease-out ${phase >= 3 ? 'opacity-100' : 'opacity-0 pointer-events-none'}`}>
          
          <h1 className="text-4xl sm:text-5xl md:text-6xl font-black text-transparent bg-clip-text bg-gradient-to-r from-cyan-300 via-white to-fuchsia-400 tracking-[0.3em] whitespace-nowrap drop-shadow-[0_0_30px_rgba(34,211,238,0.6)]">
            MANGA-INFINITY
          </h1>
          <p className="text-[10px] md:text-xs text-cyan-400 uppercase tracking-[1.5em] font-black animate-pulse mt-4 mb-10 pl-[1.5em]">Expandindo Fronteiras</p>

          <div className={`w-full max-w-sm bg-[#060410]/90 backdrop-blur-3xl border-t border-cyan-500/30 border-b border-fuchsia-500/30 p-8 rounded-3xl shadow-[0_30px_60px_rgba(0,0,0,0.9),inset_0_0_20px_rgba(34,211,238,0.1)] transition-all duration-[1000ms] delay-300 ${phase >= 3 ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-20'}`}>
            <div className="space-y-5">
              <div className="relative">
                <User className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-cyan-500/60" />
                <input type="text" placeholder="Entidade" className="w-full bg-[#020105] border border-white/10 rounded-xl py-4 pl-12 pr-4 text-sm text-white outline-none focus:border-cyan-400 transition-all shadow-inner" />
              </div>
              <div className="relative">
                <Key className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-fuchsia-500/60" />
                <input type="password" placeholder="Código de Acesso" className="w-full bg-[#020105] border border-white/10 rounded-xl py-4 pl-12 pr-4 text-sm text-white outline-none focus:border-fuchsia-400 transition-all shadow-inner" />
              </div>
              <button className="w-full relative overflow-hidden bg-gradient-to-r from-cyan-700 to-fuchsia-700 text-white font-black text-[10px] md:text-xs uppercase tracking-widest py-4 rounded-xl mt-4 hover:scale-[1.03] transition-all shadow-[0_0_20px_rgba(217,70,239,0.4)]">
                 Conectar ao Infinito
              </button>
            </div>
          </div>
        </div>
      </div>

      <style>{`
        @keyframes warp-lines { 0% { transform: translateY(-100vh) rotate(45deg); } 100% { transform: translateY(100vh) rotate(45deg); } }
        @keyframes flash-fade { 0% { opacity: 1; } 100% { opacity: 0; } }
      `}</style>
    </div>
  );
});

/* ==========================================================================
   ERRO E TOAST (MANTIDOS E ADAPTADOS AO TEMA)
   ========================================================================== */
export class ErrorBoundary extends React.Component {
  constructor(props) { super(props); this.state = { hasError: false, error: null }; }
  static getDerivedStateFromError(error) { return { hasError: true, error }; }
  render() {
    if (this.state.hasError) {
      return (
        <div className="min-h-screen bg-[#020105] text-cyan-400 p-10 flex flex-col items-center justify-center font-sans border border-fuchsia-900/30">
          <ShieldAlert className="w-16 h-16 mb-4 animate-pulse text-fuchsia-500"/>
          <h1 className="text-2xl font-black uppercase tracking-widest text-white text-center">Erro no Espaço-Tempo</h1>
          <p className="mt-2 text-cyan-400/80 text-sm text-center max-w-lg">{this.state.error?.message}</p>
          <button onClick={() => window.location.reload()} className="mt-8 bg-[#0a0515] border border-fuchsia-900 text-white px-8 py-3.5 rounded-xl font-black uppercase text-[10px] tracking-widest hover:border-cyan-500 transition-all">Sincronizar Novamente</button>
        </div>
      );
    }
    return this.props.children;
  }
}

export function GlobalToast({ toast }) {
  if (!toast) return null;
  const colors = toast.type === 'error' ? 'bg-red-950/90 text-red-200 border-red-600/50 shadow-red-900/50' : 
                 toast.type === 'success' ? 'bg-cyan-950/90 text-cyan-300 border-cyan-500/50 shadow-cyan-900/50' : 
                 'bg-fuchsia-950/90 text-fuchsia-300 border-fuchsia-600/50 shadow-fuchsia-900/50';
  return (
    <div className={`fixed top-6 left-1/2 -translate-x-1/2 z-[99999] px-6 py-3.5 rounded-2xl font-black text-xs uppercase tracking-wider border backdrop-blur-3xl shadow-2xl animate-in slide-in-from-top-5 ${colors}`}>
      <span className='text-center'>{toast.text}</span>
    </div>
  );
}

export function Footer() {
    return (
        <footer className="w-full bg-[#020105] border-t border-white/5 py-12 mt-auto pb-24 md:pb-12 flex flex-col items-center justify-center relative overflow-hidden">
            <div className="absolute top-0 left-1/2 -translate-x-1/2 w-1/2 h-[1px] bg-gradient-to-r from-transparent via-cyan-500/50 to-transparent"></div>
            <div className="max-w-7xl mx-auto px-4 text-center">
                <div className="flex justify-center items-center gap-4 mb-5 group cursor-pointer">
                    <InfinityLogo className="w-12 h-6 grayscale group-hover:grayscale-0 transition-all duration-700 opacity-50 group-hover:opacity-100" />
                    <span className="font-black text-xl text-zinc-500 group-hover:text-cyan-400 transition-colors tracking-[0.2em] uppercase">MANGA-INFINITY</span>
                </div>
                <p className="text-zinc-600 text-[9px] uppercase font-black tracking-[0.3em]">O Infinito é o Limite - © 2026</p>
            </div>
        </footer>
    );
}

/* ==========================================================================
   TRANSIÇÃO: FENDA DIMENSIONAL (Novo Efeito Visual Escuro)
   ========================================================================== */
export const ChapterTransitionOverlay = React.memo(({ isVisible, chapterNumber }) => {
    if (!isVisible) return null;
    return (
        <div className="fixed inset-0 z-[99999] bg-[#010003] flex items-center justify-center overflow-hidden font-sans">
            <style>{`
                @keyframes portal-open { 0% { transform: scaleY(0.01) scaleX(0); opacity: 0; } 40% { transform: scaleY(0.01) scaleX(1); opacity: 1; } 100% { transform: scale(15); opacity: 0; } }
            `}</style>
            
            {/* A Fenda se abrindo */}
            <div className="absolute inset-0 flex items-center justify-center opacity-80">
                <div className="w-[100vw] h-[100vh] bg-black border-[4px] border-cyan-500 shadow-[0_0_100px_50px_#22d3ee,inset_0_0_100px_50px_#d946ef] rounded-full animate-[portal-open_1s_cubic-bezier(0.16,1,0.3,1)_forwards]"></div>
            </div>

            {/* Texto que aparece dentro da fenda */}
            <div className="relative z-10 flex flex-col items-center">
                <div className="text-cyan-400 font-black tracking-[2em] text-[10px] md:text-xs uppercase mb-6 animate-pulse ml-[2em]">Avançando no Infinito</div>
                <h2 className="text-[100px] md:text-[180px] leading-none font-black text-white drop-shadow-[0_0_30px_rgba(34,211,238,0.8)] animate-in zoom-in-75 duration-700">
                  {chapterNumber}
                </h2>
            </div>
        </div>
    );
});
