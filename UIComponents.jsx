import React, { useState, useEffect, useMemo } from 'react';
import { ShieldAlert, AlertCircle, CheckCircle, Zap, Lock, Bell, Search, Hexagon } from 'lucide-react';

/* ==========================================================================
   NOVO ÍCONE: O OLHO CÓSMICO DO ABISMO (PREMIUM, MISTERIOSO E VIVO)
   ========================================================================== */
export const AbyssalLogo = React.memo(({ className = "w-20 h-20" }) => {
  return (
    <div className={`relative flex items-center justify-center group ${className}`}>
      
      {/* 1. NEVOEIRO ETÉREO TRASÊIRO (Glow Púrpura/Roxo pulsante) */}
      <div className="absolute inset-[-40%] bg-gradient-to-tr from-fuchsia-900/50 via-purple-950/20 to-cyan-900/20 rounded-full blur-[40px] opacity-80 animate-[glow-pulse_6s_ease-in-out_infinite]"></div>

      {/* 2. ESTRUTURA PRINCIPAL DO OLHO */}
      {/* Mantém formato oval, bordas definidas Azul Neon e Glow Externo */}
      <div className="w-full h-full bg-[#030407] rounded-[50%_50%_50%_50%_/_60%_60%_40%_40%] border-[2px] border-cyan-500 shadow-[0_0_25px_5px_rgba(34,211,238,0.7),inset_0_0_20px_rgba(0,0,0,1)] flex items-center justify-center overflow-hidden relative z-10 animate-[blink_5s_infinite]">
        
        {/* 3. ÍRIS CÓSMICA EM DEGRADÊ */}
        {/* Sombra interna pra profundidade, tons claros no centro e escuros nas bordas */}
        <div className="absolute w-[80%] h-[80%] rounded-full bg-[conic-gradient(from_180deg_at_50%_50%,_#0c1a35_0%,_#3b82f6_25%,_#0ea5e9_50%,_#1e3a8a_75%,_#0c1a35_100%)] shadow-[inset_0_0_20px_10px_rgba(0,0,0,0.8),0_0_15px_rgba(14,165,233,0.5)] flex items-center justify-center">
          
          {/* 4. PUPILA FENDIDA (Abismo/Criatura) */}
          {/* Brilho pulsante suave e movimento leve esquerda/direita */}
          <div className="w-[18%] h-[85%] bg-black rounded-[50%] shadow-[inset_0_0_12px_rgba(0,0,0,1),0_0_10px_1px_rgba(34,211,238,0.4)] animate-[pupil-move_8s_ease-in-out_infinite,pulse-glow_3s_ease-in-out_infinite]"></div>

          {/* 5. REFLEXO DE LUZ REALISTA (Ponto branco superior) */}
          <div className="absolute top-[15%] right-[25%] w-3 h-3 bg-white rounded-full blur-[1px] opacity-80 shadow-[0_0_8px_4px_rgba(255,255,255,0.8)]"></div>
          
          {/* Fibras da íris sutis */}
          <div className="absolute inset-0 w-full h-full rounded-full bg-[url('data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHdpZHRoPSI0MCIgaGVpZ2h0PSI0MCIgdmlld0JveD0iMCAwIDQwIDQwIj48ZyBmaWxsLXJ1bGU9ImV2ZW5vZGQiPjxnIGZpbGw9IiNmZmYiIGZpbGwtb3BhY2l0eT0iMC4wNSI+PHBhdGggZD0iTTAgMGg0MHY0MEgwVjB6bTIwIDIwaDIwdjIwSDIWMjB6TTAgMjBoMjB2MjBIMFYyMHoyMCAwaDIwdjIwSDIwVjB6Ii8+PC9nPjwvZz48L3N2Zz4=')] opacity-30 mix-blend-overlay"></div>
        </div>
      </div>

      {/* DEFINIÇÕES DE ANIMAÇÃO */}
      <style>{`
        @keyframes glow-pulse {
          0%, 100% { opacity: 0.6; filter: blur(35px) brightness(1); }
          50% { opacity: 1; filter: blur(50px) brightness(1.3); }
        }
        @keyframes blink {
          0%, 48%, 52%, 100% { transform: scaleY(1); opacity: 1; }
          50% { transform: scaleY(0.01); opacity: 0; }
        }
        @keyframes pupil-move {
          0%, 100% { transform: translateX(0); }
          25% { transform: translateX(-3px); }
          75% { transform: translateX(3px); }
        }
        @keyframes pulse-glow {
          0%, 100% { opacity: 0.8; box-shadow: inset 0 0 12px rgba(0,0,0,1), 0 0 10px 1px rgba(34,211,238,0.4); }
          50% { opacity: 1; box-shadow: inset 0 0 12px rgba(0,0,0,1), 0 0 15px 3px rgba(34,211,238,0.7); }
        }
      `}</style>
    </div>
  );
});

/* ==========================================================================
   RESTANTE DO ARQUIVO UICOMPONENTS.JS (INTACTO)
   ========================================================================== */

export class ErrorBoundary extends React.Component {
  constructor(props) { super(props); this.state = { hasError: false, error: null }; }
  static getDerivedStateFromError(error) { return { hasError: true, error }; }
  render() {
    if (this.state.hasError) {
      return (
        <div className="min-h-screen bg-[#050508] text-red-500 p-10 flex flex-col items-center justify-center font-sans border border-red-900/30 relative overflow-hidden">
          <div className="absolute inset-0 bg-[#020204] opacity-90"></div>
          <div className="absolute inset-0 bg-blue-950/10 blur-[150px] rounded-full pointer-events-none"></div>
          
          <ShieldAlert className="w-16 h-16 mb-4 animate-pulse text-red-600 relative z-10"/>
          <h1 className="text-2xl font-black uppercase tracking-widest text-white text-center relative z-10">Fenda no Sistema</h1>
          <p className="mt-2 text-red-400/80 text-sm max-w-lg text-center break-words font-medium relative z-10">{this.state.error?.message}</p>
          <button onClick={() => window.location.reload()} className="mt-8 bg-zinc-900 border border-zinc-700 hover:border-blue-500 text-white px-8 py-3.5 rounded-xl font-black uppercase text-[10px] tracking-widest transition-all relative z-10">Restaurar Conexão</button>
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
  const isInfo = toast.type === 'info';

  return (
    <div className={`fixed top-6 left-1/2 -translate-x-1/2 z-[99999] px-6 py-3.5 rounded-2xl font-black text-xs uppercase tracking-wider border flex items-center gap-3 animate-in slide-in-from-top-5 duration-300 backdrop-blur-3xl shadow-2xl ${isError ? 'bg-red-950/90 text-red-200 border-red-600/50 shadow-red-900/40' : isSuccess ? 'bg-zinc-950/90 text-cyan-400 border-cyan-500/50 shadow-cyan-900/40' : isInfo ? 'bg-blue-950/90 text-blue-300 border-blue-600/50 shadow-blue-900/40' : 'bg-zinc-950/95 text-zinc-400 border-zinc-800'}`}>
      {isError && <AlertCircle className="w-5 h-5 text-red-500" />}
      {isSuccess && <CheckCircle className="w-5 h-5 text-cyan-500" />}
      {isInfo && <Hexagon className="w-5 h-5 text-blue-400" />}
      <span className='text-center'>{toast.text}</span>
    </div>
  );
}

export function Footer() {
    const abyssalInfo = {
        version: "1.2.0-beta",
        status: "Online",
        gate: "Gate-04"
    };

    return (
        <footer className="w-full bg-[#050508] border-t border-zinc-900/50 py-12 mt-auto pb-24 md:pb-12 relative overflow-hidden flex flex-col items-center justify-center">
            {/* Elementos visuais de fundo */}
            <div className="absolute -bottom-24 left-1/2 -translate-x-1/2 w-[600px] h-[300px] bg-blue-950/20 blur-[150px] rounded-full pointer-events-none opacity-40"></div>
            <div className="absolute top-0 left-0 w-full h-[1px] bg-gradient-to-r from-transparent via-zinc-800 to-transparent"></div>

            <div className="max-w-7xl mx-auto px-4 text-center relative z-10 flex flex-col items-center">
                <div className="flex justify-center items-center gap-3 mb-5 group cursor-pointer">
                    <AbyssalLogo className="w-10 h-10 grayscale group-hover:grayscale-0 transition-all duration-700 shadow-none border-zinc-800 group-hover:border-cyan-600 shadow-[inset_0_0_10px_rgba(0,0,0,1)]"/>
                    <span className="font-black text-xl text-zinc-500 group-hover:text-white transition-colors tracking-[0.2em] uppercase">MANGÁS ABISSAL</span>
                </div>
                
                <p className="text-zinc-600 text-[9px] uppercase font-black tracking-[0.3em] mb-6">O Vazio Resguarda - © 2026 - Gate-01 / Core-System</p>
                
                <div className="grid grid-cols-1 md:grid-cols-3 gap-3 w-full max-w-lg bg-[#0d0d12]/50 p-4 rounded-xl border border-zinc-900/50 backdrop-blur-sm">
                    <div className="flex flex-col items-center justify-center p-3 border-r border-zinc-900/50 last:border-r-0">
                        <span className="text-[8px] text-zinc-700 uppercase font-black tracking-widest mb-1">Status do Vazio</span>
                        <div className="flex items-center gap-2">
                            <Zap className="w-3 h-3 text-cyan-500" />
                            <span className="text-xs font-bold text-gray-300">{abyssalInfo.status}</span>
                        </div>
                    </div>
                    <div className="flex flex-col items-center justify-center p-3 border-r border-zinc-900/50 last:border-r-0">
                        <span className="text-[8px] text-zinc-700 uppercase font-black tracking-widest mb-1">Protocolo CORE</span>
                        <div className="flex items-center gap-2">
                            <span className="text-xs font-bold text-gray-300">{abyssalInfo.version}</span>
                        </div>
                    </div>
                    <div className="flex flex-col items-center justify-center p-3 border-r border-zinc-900/50 last:border-r-0">
                        <span className="text-[8px] text-zinc-700 uppercase font-black tracking-widest mb-1">Portão de Acesso</span>
                        <div className="flex items-center gap-2">
                            <Lock className="w-3 h-3 text-fuchsia-500" />
                            <span className="text-xs font-bold text-gray-300">{abyssalInfo.gate}</span>
                        </div>
                    </div>
                </div>

                <div className="mt-10 flex items-center gap-6 text-zinc-700">
                    <a href="#" className="text-[10px] font-bold uppercase tracking-widest hover:text-cyan-400 transition-colors">Termos do Vazio</a>
                    <a href="#" className="text-[10px] font-bold uppercase tracking-widest hover:text-cyan-400 transition-colors">Política de Essência</a>
                    <a href="#" className="text-[10px] font-bold uppercase tracking-widest hover:text-cyan-400 transition-colors">Relatar Fenda</a>
                </div>
            </div>
        </footer>
    );
}

/* TRANSIÇÃO DE CAPÍTULO: DESLOCAMENTO DO ESPAÇO-TEMPO (Inalterada) */
export const ChapterTransitionOverlay = React.memo(({ isVisible, chapterNumber }) => {
    if (!isVisible) return null;
    return (
        <div className="fixed inset-0 z-[99999] bg-[#020204] flex items-center justify-center overflow-hidden font-sans">
            <style>{`
                @keyframes warp-speed {
                    0% { transform: scale(1) translateZ(0); opacity: 0; filter: blur(10px); }
                    50% { opacity: 1; filter: blur(0px); }
                    100% { transform: scale(10) translateZ(500px); opacity: 0; filter: blur(20px); }
                }
                @keyframes floating {
                    0%, 100% { transform: translateY(0) rotate(0deg); }
                    50% { transform: translateY(-15px) rotate(1deg); }
                }
                @keyframes glow-text {
                    0%, 100% { text-shadow: 0 0 20px rgba(34,211,238,0.5), 0 0 40px rgba(34,211,238,0.2); }
                    50% { text-shadow: 0 0 40px rgba(34,211,238,0.8), 0 0 70px rgba(34,211,238,0.4); }
                }
            `}</style>
            
            {/* Efeito de túnel de luz */}
            <div className="absolute inset-0 flex items-center justify-center opacity-40">
                <div className="w-[1px] h-[1px] rounded-full shadow-[0_0_80px_60px_#22d3ee,0_0_150px_100px_#0e7490,0_0_300px_150px_#064e3b] animate-[warp-speed_0.8s_ease-in_forwards]"></div>
            </div>

            <div className="relative z-10 flex flex-col items-center" style={{ animation: 'floating 4s ease-in-out infinite' }}>
                <div className="text-cyan-500/80 font-black tracking-[1.5em] text-[10px] md:text-xs uppercase mb-6 animate-pulse ml-[1.5em]">Transcendendo para a Camada</div>
                
                <h2 className="text-[120px] md:text-[200px] leading-none font-black text-transparent bg-clip-text bg-gradient-to-b from-white to-cyan-700 tracking-tight drop-shadow-[0_0_30px_rgba(34,211,238,0.3)]" style={{ animation: 'glow-text 2s ease-in-out infinite' }}>
                    {chapterNumber}
                </h2>

                <div className="flex items-center gap-3 mt-10">
                    <div className="w-16 h-[1px] bg-gradient-to-r from-transparent to-cyan-800"></div>
                    <Lock className="w-4 h-4 text-cyan-600" />
                    <div className="w-16 h-[1px] bg-gradient-to-l from-transparent to-cyan-800"></div>
                </div>
            </div>
        </div>
    );
});
