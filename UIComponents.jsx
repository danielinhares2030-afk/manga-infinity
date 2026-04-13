import React, { useState, useEffect, useMemo } from 'react';
import { ShieldAlert, AlertCircle, CheckCircle, Zap, Lock, Hexagon, User, Key } from 'lucide-react';

/* ==========================================================================
   ÍCONE: O OLHO MÍSTICO DO ABISMO (Formato Amendoado Premium)
   ========================================================================== */
export const AbyssalLogo = React.memo(({ className = "w-16 h-16", isAwake = true }) => {
  return (
    <div className={`relative flex items-center justify-center ${className}`}>
      {/* Glow externo azul/roxo vibrante */}
      <div className={`absolute inset-[-20%] bg-gradient-to-tr from-fuchsia-600/30 to-blue-600/30 blur-[20px] rounded-full transition-all duration-1000 ${isAwake ? 'opacity-100 animate-pulse' : 'opacity-0'}`}></div>

      {/* Formato do Olho: Quadrado rotacionado com bordas opostas arredondadas */}
      <div className="w-[85%] h-[85%] bg-[#020204] border-[2px] border-blue-500/60 shadow-[0_0_20px_rgba(59,130,246,0.5),inset_0_0_15px_rgba(0,0,0,0.8)] rounded-[80%_0] rotate-45 overflow-hidden flex items-center justify-center relative z-10">
        
        {/* Íris em degradê (Desfaz a rotação de 45 graus do pai) */}
        <div className={`w-[70%] h-[70%] -rotate-45 rounded-full bg-[radial-gradient(circle_at_center,_#7dd3fc_0%,_#2563eb_45%,_#020617_90%)] shadow-[inset_0_0_15px_rgba(0,0,0,0.9)] flex items-center justify-center transition-all duration-1000 ${isAwake ? 'scale-100 opacity-100' : 'scale-50 opacity-0'}`}>
          
          {/* Pupila Fendida (Vertical) */}
          <div className="w-[20%] h-[80%] bg-black rounded-[50%] shadow-[0_0_10px_rgba(0,0,0,1)] animate-[pupil-scan_8s_ease-in-out_infinite]"></div>

          {/* Reflexo de luz (Realismo) */}
          <div className="absolute top-[25%] right-[30%] w-[15%] h-[15%] bg-white/70 blur-[1px] rounded-full"></div>
          
          {/* Textura sutil da íris */}
          <div className="absolute inset-0 rounded-full border border-blue-400/20 mix-blend-overlay"></div>
        </div>
      </div>

      <style>{`
        @keyframes pupil-scan {
          0%, 100% { transform: translateX(0); }
          25% { transform: translateX(-3px); }
          75% { transform: translateX(3px); }
        }
      `}</style>
    </div>
  );
});

/* ==========================================================================
   ABERTURA: O DESPERTAR DO ABISMO (CINEMATOGRÁFICO EM 5 FASES)
   ========================================================================== */
export const SplashScreen = React.memo(() => {
  const [phase, setPhase] = useState(0);

  useEffect(() => {
    // Fase 1: 0ms -> Tela Escura com leve brilho (Padrão inicial)
    const t2 = setTimeout(() => setPhase(2), 1000);  // Surgimento do olho
    const t3 = setTimeout(() => setPhase(3), 2500);  // Olho se abrindo
    const t4 = setTimeout(() => setPhase(4), 4000);  // Explosão de energia do Abismo
    const t5 = setTimeout(() => setPhase(5), 5500);  // Revelação do Título e Form

    return () => { clearTimeout(t2); clearTimeout(t3); clearTimeout(t4); clearTimeout(t5); };
  }, []);

  // Partículas de poeira cósmica/energia para a Fase 4
  const particles = useMemo(() => Array.from({ length: 40 }).map((_, i) => ({
    id: i,
    angle: Math.random() * 360,
    distance: Math.random() * 150 + 50,
    size: Math.random() * 4 + 1,
    duration: Math.random() * 1.5 + 1,
  })), []);

  return (
    <div className={`fixed inset-0 z-[9999] overflow-hidden bg-[#010103] flex items-center justify-center font-sans
      ${phase === 4 ? "animate-[shake-cinematic_0.3s_ease-in-out_infinite]" : ""}`}>
      
      <style>{`
        @keyframes shake-cinematic {
          0%, 100% { transform: translate(0, 0); }
          25% { transform: translate(-2px, 2px); }
          50% { transform: translate(2px, -1px); }
          75% { transform: translate(-1px, -2px); }
        }
        @keyframes particle-burst {
          0% { transform: translate(0, 0) scale(1); opacity: 1; }
          100% { transform: translate(var(--tx), var(--ty)) scale(0); opacity: 0; }
        }
      `}</style>

      {/* FASE 1: Fundo com leve brilho azul/roxo bem suave */}
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,_#1e1b4b_0%,_#020204_60%,_#000000_100%)] opacity-40"></div>

      {/* FASE 4: Brilho forte saindo do centro (Blur azul e roxo) */}
      <div className={`absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[150vw] h-[150vw] rounded-full bg-gradient-to-tr from-blue-600/30 to-fuchsia-600/20 blur-[100px] transition-all duration-[2000ms] ease-out pointer-events-none mix-blend-screen
        ${phase >= 4 ? 'opacity-100 scale-100' : 'opacity-0 scale-0'}`}></div>

      {/* Container Central Dinâmico */}
      <div className={`relative z-20 flex flex-col items-center transition-all duration-[1500ms] ease-out w-full max-w-md px-6
        ${phase >= 5 ? '-translate-y-10' : 'translate-y-0'}`}>
        
        {/* FASE 2 & 3: Surgimento e Abertura do Olho */}
        <div className={`relative w-28 h-28 md:w-36 md:h-36 flex items-center justify-center transition-all duration-[1500ms] ease-out
          ${phase >= 2 ? 'opacity-100 scale-100' : 'opacity-0 scale-50'}
          ${phase >= 5 ? 'w-20 h-20 md:w-24 md:h-24 mb-6' : 'mb-0'}`}>
          
          <AbyssalLogo className="w-full h-full" isAwake={phase >= 3} />

          {/* Pálpebras do Vazio (Fase 3: scaleY(0) para abrir) */}
          <div className={`absolute z-30 top-0 left-0 w-full h-1/2 bg-[#010103] origin-top transition-transform duration-[1200ms] ease-[cubic-bezier(0.85,0,0.15,1)]
            ${phase >= 3 ? 'scale-y-0' : 'scale-y-100'}`}></div>
          <div className={`absolute z-30 bottom-0 left-0 w-full h-1/2 bg-[#010103] origin-bottom transition-transform duration-[1200ms] ease-[cubic-bezier(0.85,0,0.15,1)]
            ${phase >= 3 ? 'scale-y-0' : 'scale-y-100'}`}></div>
        </div>

        {/* FASE 5: Revelação do Título e Formulário de Login */}
        <div className={`w-full flex flex-col items-center transition-all duration-[1500ms] ease-out
          ${phase >= 5 ? 'opacity-100 translate-y-0 filter-none' : 'opacity-0 translate-y-10 blur-sm'}`}>
          
          <h1 className="text-4xl md:text-5xl font-black text-transparent bg-clip-text bg-gradient-to-b from-white to-blue-600 tracking-[0.4em] whitespace-nowrap pl-[0.4em] drop-shadow-[0_0_20px_rgba(59,130,246,0.5)] mb-2">
            O ABISMO
          </h1>
          <p className="text-[10px] text-blue-400 uppercase tracking-[0.8em] font-black animate-pulse mb-10">Desperte seu poder</p>

          {/* Mockup do Formulário de Login Integrado (Fade-in suave) */}
          <div className="w-full bg-[#050508]/80 backdrop-blur-xl border border-blue-900/30 p-6 md:p-8 rounded-3xl shadow-[0_20px_50px_rgba(0,0,0,0.5)]">
            <div className="space-y-4">
              <div className="relative">
                <User className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-blue-500/50" />
                <input type="text" placeholder="Entidade" className="w-full bg-[#020204] border border-white/5 rounded-xl py-3.5 pl-12 pr-4 text-sm text-white outline-none focus:border-blue-500 transition-colors" />
              </div>
              <div className="relative">
                <Key className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-blue-500/50" />
                <input type="password" placeholder="Senha Cósmica" className="w-full bg-[#020204] border border-white/5 rounded-xl py-3.5 pl-12 pr-4 text-sm text-white outline-none focus:border-blue-500 transition-colors" />
              </div>
              <button className="w-full bg-gradient-to-r from-blue-700 to-fuchsia-700 text-white font-black text-xs uppercase tracking-widest py-4 rounded-xl mt-2 hover:scale-[1.02] transition-transform shadow-[0_0_20px_rgba(59,130,246,0.3)]">
                Entrar no Vazio
              </button>
            </div>
          </div>
        </div>

      </div>

      {/* FASE 4: Partículas de Poeira/Energia Escura voando do centro */}
      {phase === 4 && particles.map(p => {
        const tx = Math.cos(p.angle * (Math.PI / 180)) * p.distance;
        const ty = Math.sin(p.angle * (Math.PI / 180)) * p.distance;
        return (
          <div key={p.id} className="absolute top-1/2 left-1/2 rounded-full bg-blue-400 shadow-[0_0_10px_#fff] z-30"
               style={{
                 width: `${p.size}px`, height: `${p.size}px`,
                 '--tx': `${tx}px`, '--ty': `${ty}px`,
                 animation: `particle-burst ${p.duration}s cubic-bezier(0.1, 0.8, 0.3, 1) forwards`
               }}>
          </div>
        );
      })}
    </div>
  );
});

/* ==========================================================================
   RESTANTE DOS COMPONENTES
   ========================================================================== */

export class ErrorBoundary extends React.Component {
  constructor(props) { super(props); this.state = { hasError: false, error: null }; }
  static getDerivedStateFromError(error) { return { hasError: true, error }; }
  render() {
    if (this.state.hasError) {
      return (
        <div className="min-h-screen bg-[#050508] text-red-500 p-10 flex flex-col items-center justify-center font-sans border border-red-900/30 relative overflow-hidden">
          <div className="absolute inset-0 bg-[#020204] opacity-90"></div>
          <ShieldAlert className="w-16 h-16 mb-4 animate-pulse text-red-600 relative z-10"/>
          <h1 className="text-2xl font-black uppercase tracking-widest text-white text-center relative z-10">Fenda no Sistema</h1>
          <p className="mt-2 text-red-400/80 text-sm max-w-lg text-center break-words font-medium relative z-10">{this.state.error?.message}</p>
          <button onClick={() => window.location.reload()} className="mt-8 bg-zinc-900 border border-zinc-700 text-white px-8 py-3.5 rounded-xl font-black uppercase text-[10px] tracking-widest transition-all relative z-10">Restaurar Conexão</button>
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
    <div className={`fixed top-6 left-1/2 -translate-x-1/2 z-[99999] px-6 py-3.5 rounded-2xl font-black text-xs uppercase tracking-wider border flex items-center gap-3 animate-in slide-in-from-top-5 duration-300 backdrop-blur-3xl shadow-2xl ${isError ? 'bg-red-950/90 text-red-200 border-red-600/50' : isSuccess ? 'bg-zinc-950/90 text-cyan-400 border-cyan-500/50' : isInfo ? 'bg-cyan-950/90 text-cyan-300 border-cyan-600/50' : 'bg-zinc-950/95 text-zinc-400 border-zinc-800'}`}>
      {isError && <AlertCircle className="w-5 h-5 text-red-500" />}
      {isSuccess && <CheckCircle className="w-5 h-5 text-cyan-500" />}
      {isInfo && <Hexagon className="w-5 h-5 text-cyan-400" />}
      <span className='text-center'>{toast.text}</span>
    </div>
  );
}

export function Footer() {
    return (
        <footer className="w-full bg-[#050508] border-t border-zinc-900/50 py-12 mt-auto pb-24 md:pb-12 flex flex-col items-center justify-center">
            <div className="max-w-7xl mx-auto px-4 text-center">
                <div className="flex justify-center items-center gap-3 mb-5 group cursor-pointer">
                    <AbyssalLogo className="w-10 h-10 grayscale group-hover:grayscale-0 transition-all duration-700"/>
                    <span className="font-black text-xl text-zinc-500 group-hover:text-white transition-colors tracking-[0.2em] uppercase">O ABISMO</span>
                </div>
                <p className="text-zinc-600 text-[9px] uppercase font-black tracking-[0.3em]">O Vazio Resguarda - © 2026</p>
            </div>
        </footer>
    );
}

export const ChapterTransitionOverlay = React.memo(({ isVisible, chapterNumber }) => {
    if (!isVisible) return null;
    return (
        <div className="fixed inset-0 z-[99999] bg-[#020204] flex items-center justify-center overflow-hidden font-sans">
            <style>{`
                @keyframes warp-speed { 0% { transform: scale(1); opacity: 0; filter: blur(10px); } 50% { opacity: 1; filter: blur(0px); } 100% { transform: scale(10); opacity: 0; filter: blur(20px); } }
                @keyframes glow-text { 0%, 100% { text-shadow: 0 0 20px rgba(34,211,238,0.5); } 50% { text-shadow: 0 0 40px rgba(34,211,238,0.8); } }
            `}</style>
            <div className="absolute inset-0 flex items-center justify-center opacity-40">
                <div className="w-[1px] h-[1px] rounded-full shadow-[0_0_80px_60px_#22d3ee,0_0_150px_100px_#0e7490] animate-[warp-speed_0.8s_ease-in_forwards]"></div>
            </div>
            <div className="relative z-10 flex flex-col items-center">
                <div className="text-cyan-500/80 font-black tracking-[1.5em] text-[10px] uppercase mb-6 animate-pulse ml-[1.5em]">Transcendendo</div>
                <h2 className="text-[120px] md:text-[200px] leading-none font-black text-transparent bg-clip-text bg-gradient-to-b from-white to-cyan-700 tracking-tight" style={{ animation: 'glow-text 2s ease-in-out infinite' }}>{chapterNumber}</h2>
            </div>
        </div>
    );
});
