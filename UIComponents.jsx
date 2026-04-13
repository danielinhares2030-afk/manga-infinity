import React, { useState, useEffect, useMemo } from 'react';
import { ShieldAlert, AlertCircle, CheckCircle, Zap, Lock, Hexagon, User, Key } from 'lucide-react';

/* ==========================================================================
   ÍCONE RANK S: O OLHO DEMONÍACO COM PISCAR REALISTA
   ========================================================================== */
export const AbyssalLogo = React.memo(({ className = "w-24 h-24", isAwake = true }) => {
  return (
    <div className={`relative flex items-center justify-center group ${className}`}>
      
      {/* 1. Aura Sombria (Glow de Fundo Vermelho/Roxo) */}
      <div className={`absolute inset-[-10%] bg-gradient-to-tr from-red-900/60 via-purple-900/30 to-rose-800/40 rounded-full blur-[25px] transition-all duration-1000 ease-out
        ${isAwake ? 'opacity-100 scale-110 animate-pulse' : 'opacity-40 scale-100'}`}></div>

      {/* 2. Imagem Original (Fundo) */}
      <img 
        src="https://i.ibb.co/GvvpKNPD/design-vetorial-de-ilustracao-de-olhos-de-diabo-vermelho-692212-66-removebg-preview.png"
        className="relative z-10 w-full h-full object-contain drop-shadow-[0_0_20px_rgba(220,38,38,0.3)]"
        alt="Olho do Abismo"
      />

      {/* 3. LÓGICA DO PISCAR (Mascara localizada apenas no globo ocular)
          Se o olho não estiver perfeitamente no centro, ajuste os valores de top, left, w e h abaixo. */}
      {isAwake && (
        <div 
          className="absolute z-20 overflow-hidden rounded-[50%]"
          style={{
            width: '40%',     /* Largura da área do olho */
            height: '26%',    /* Altura da área do olho */
            top: '37%',       /* Posição vertical na imagem */
            left: '30%'       /* Posição horizontal na imagem */
          }}
        >
          {/* Pálpebra Superior (Desce de -100% para 0) */}
          <div className="absolute top-0 left-0 w-full h-[55%] bg-gradient-to-b from-[#010000] to-[#0a0203] rounded-b-[50%] shadow-[0_5px_10px_rgba(0,0,0,0.9)] animate-[blink-top_4s_infinite]"></div>

          {/* Pálpebra Inferior (Sobe de 100% para 0) */}
          <div className="absolute bottom-0 left-0 w-full h-[55%] bg-gradient-to-t from-[#010000] to-[#0a0203] rounded-t-[50%] shadow-[0_-5px_10px_rgba(0,0,0,0.9)] animate-[blink-bottom_4s_infinite]"></div>
        </div>
      )}

      {/* Keyframes do piscar mantendo as proporções exatas sugeridas (94% a 96%) */}
      <style>{`
        @keyframes blink-top {
          0%, 92%, 100% { transform: translateY(-100%); }
          94%, 96% { transform: translateY(0%); }
        }
        @keyframes blink-bottom {
          0%, 92%, 100% { transform: translateY(100%); }
          94%, 96% { transform: translateY(0%); }
        }
      `}</style>
    </div>
  );
});

/* ==========================================================================
   ABERTURA CINEMATOGRÁFICA (TEMA VERMELHO SOMBRIO)
   ========================================================================== */
export const SplashScreen = React.memo(() => {
  const [phase, setPhase] = useState(1);

  useEffect(() => {
    const t2 = setTimeout(() => setPhase(2), 1500);  // Fenda de energia vermelha
    const t3 = setTimeout(() => setPhase(3), 3000);  // Olho emerge
    const t4 = setTimeout(() => setPhase(4), 4500);  // Explosão e tremor
    const t5 = setTimeout(() => setPhase(5), 6000);  // Revelação do formulário

    return () => { clearTimeout(t2); clearTimeout(t3); clearTimeout(t4); clearTimeout(t5); };
  }, []);

  const ambientParticles = useMemo(() => Array.from({ length: 30 }).map((_, i) => ({
    id: i, x: Math.random() * 100, y: Math.random() * 100, size: Math.random() * 3 + 1, duration: Math.random() * 8 + 10, delay: Math.random() * -10,
  })), []);

  const burstParticles = useMemo(() => Array.from({ length: 40 }).map((_, i) => ({
    id: i, angle: Math.random() * 360, distance: Math.random() * 200 + 50, size: Math.random() * 5 + 2, duration: Math.random() * 1.5 + 0.8,
  })), []);

  return (
    <div className={`fixed inset-0 z-[9999] overflow-hidden bg-[#000000] flex items-center justify-center font-sans
      ${phase === 4 ? "animate-[shake_0.4s_ease-in-out]" : ""}`}>
      
      <style>{`
        @keyframes shake { 0%, 100% { transform: translate(0, 0); } 20% { transform: translate(-3px, 3px); } 40% { transform: translate(3px, -2px); } 60% { transform: translate(-2px, -3px); } 80% { transform: translate(2px, 2px); } }
        @keyframes float-ambient { 0% { transform: translateY(0) translateX(0); opacity: 0; } 50% { opacity: 0.5; } 100% { transform: translateY(-20vh) translateX(5vw); opacity: 0; } }
        @keyframes particle-burst { 0% { transform: translate(0, 0) scale(1); opacity: 1; } 100% { transform: translate(var(--tx), var(--ty)) scale(0); opacity: 0; } }
      `}</style>

      {/* AMBIENTE: Vazio absoluto clareando para um glow vermelho profundo */}
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,_#2a0a0f_0%,_#000000_70%)] opacity-80"></div>
      
      {/* Poeira Estelar */}
      {ambientParticles.map(p => (
        <div key={`amb-${p.id}`} className="absolute rounded-full bg-red-500/30 blur-[1px]"
             style={{ width: `${p.size}px`, height: `${p.size}px`, left: `${p.x}%`, top: `${p.y}%`, animation: `float-ambient ${p.duration}s linear infinite ${p.delay}s` }}></div>
      ))}

      {/* FASE 2: A Fenda de Luz Vermelha */}
      <div className={`absolute z-30 top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 transition-all duration-700 ease-out flex gap-2
        ${phase === 2 ? 'w-[100px] md:w-[150px] opacity-100' : 'w-0 opacity-0'}`} style={{ height: '3px' }}>
        <div className="w-1/2 h-full bg-white shadow-[0_0_40px_10px_#ef4444] rounded-full"></div>
        <div className="w-1/2 h-full bg-white shadow-[0_0_40px_10px_#9f1239] rounded-full"></div>
      </div>

      {/* FASE 4: Onda de Choque (Glow central forte vermelho) */}
      <div className={`absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[120vw] h-[120vw] md:w-[70vw] md:h-[70vw] rounded-full bg-[radial-gradient(circle,_rgba(220,38,38,0.3)_0%,_rgba(159,18,57,0.1)_40%,_transparent_70%)] blur-[50px] transition-all duration-[1000ms] ease-out pointer-events-none mix-blend-screen
        ${phase >= 4 ? 'opacity-100 scale-150' : 'opacity-0 scale-50'}`}></div>

      {/* CONTAINER PRINCIPAL */}
      <div className={`relative z-20 flex flex-col items-center justify-center w-full px-4 transition-all duration-[1500ms] ease-[cubic-bezier(0.25,1,0.5,1)]
        ${phase >= 3 ? 'opacity-100 scale-100' : 'opacity-0 scale-50'}`}>
        
        {/* FASE 3: Olho Emerge */}
        <div className={`relative flex items-center justify-center transition-all duration-[1500ms] ease-out
          ${phase >= 5 ? 'w-32 h-32 md:w-44 md:h-44 mb-10' : 'w-40 h-40 md:w-56 md:h-56 mb-0'}`}>
          <AbyssalLogo className="w-full h-full" isAwake={phase >= 3} />
        </div>

        {/* FASE 5: Título e Login */}
        <div className={`w-full flex flex-col items-center transition-all duration-[1500ms] ease-out
          ${phase >= 5 ? 'opacity-100 translate-y-0 filter-none' : 'opacity-0 translate-y-10 blur-sm'}`}>
          
          <h1 className="text-4xl md:text-6xl font-black text-transparent bg-clip-text bg-gradient-to-b from-white via-red-200 to-red-800 tracking-[0.5em] md:tracking-[0.6em] whitespace-nowrap pl-[0.5em] drop-shadow-[0_0_30px_rgba(220,38,38,0.4)] mb-3 text-center">
            MANGÁS ABISSAL
          </h1>
          <p className="text-[10px] md:text-xs text-red-500 uppercase tracking-[1em] font-black animate-pulse mb-12 pl-[1em] text-center">
            Sangue do Vazio
          </p>

          <div className="w-full max-w-sm bg-[#050102]/80 backdrop-blur-3xl border border-red-900/40 p-7 md:p-8 rounded-3xl shadow-[0_20px_60px_rgba(0,0,0,0.8),inset_0_0_20px_rgba(220,38,38,0.05)]">
            <div className="space-y-5">
              <div className="relative group">
                <User className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-red-600/50 group-focus-within:text-red-400 transition-colors" />
                <input type="text" placeholder="Entidade" className="w-full bg-[#030000] border border-white/5 rounded-xl py-4 pl-12 pr-4 text-sm text-white outline-none focus:border-red-600/80 focus:shadow-[0_0_15px_rgba(220,38,38,0.2)] transition-all" />
              </div>
              <div className="relative group">
                <Key className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-red-600/50 group-focus-within:text-red-400 transition-colors" />
                <input type="password" placeholder="Chave de Sangue" className="w-full bg-[#030000] border border-white/5 rounded-xl py-4 pl-12 pr-4 text-sm text-white outline-none focus:border-red-600/80 focus:shadow-[0_0_15px_rgba(220,38,38,0.2)] transition-all" />
              </div>
              <button className="w-full relative overflow-hidden bg-gradient-to-r from-red-800 to-rose-900 text-white font-black text-xs uppercase tracking-widest py-4 rounded-xl mt-4 hover:scale-[1.02] transition-all shadow-[0_0_20px_rgba(220,38,38,0.3)] group">
                <div className="absolute inset-0 bg-gradient-to-r from-red-600 via-rose-600 to-red-600 opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
                <span className="relative z-10">Cruzar o Horizonte</span>
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Partículas da Explosão de Energia (Fase 4) */}
      {phase === 4 && burstParticles.map(p => {
        const tx = Math.cos(p.angle * (Math.PI / 180)) * p.distance;
        const ty = Math.sin(p.angle * (Math.PI / 180)) * p.distance;
        return (
          <div key={`burst-${p.id}`} className={`absolute top-1/2 left-1/2 rounded-full shadow-[0_0_15px_#fff] z-30 ${Math.random() > 0.4 ? 'bg-red-500' : 'bg-rose-400'}`}
               style={{ width: `${p.size}px`, height: `${p.size}px`, '--tx': `${tx}px`, '--ty': `${ty}px`, animation: `particle-burst ${p.duration}s cubic-bezier(0.1, 0.8, 0.3, 1) forwards` }}></div>
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
        <div className="min-h-screen bg-[#050001] text-red-500 p-10 flex flex-col items-center justify-center font-sans border border-red-900/30 relative overflow-hidden">
          <div className="absolute inset-0 bg-red-950/10 blur-[150px] rounded-full pointer-events-none"></div>
          <ShieldAlert className="w-16 h-16 mb-4 animate-pulse text-red-600 relative z-10"/>
          <h1 className="text-2xl font-black uppercase tracking-widest text-white text-center relative z-10">Fenda no Sistema</h1>
          <p className="mt-2 text-red-400/80 text-sm max-w-lg text-center break-words font-medium relative z-10">{this.state.error?.message}</p>
          <button onClick={() => window.location.reload()} className="mt-8 bg-black border border-red-900 hover:border-red-500 text-white px-8 py-3.5 rounded-xl font-black uppercase text-[10px] tracking-widest transition-all relative z-10">Restaurar Conexão</button>
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
    <div className={`fixed top-6 left-1/2 -translate-x-1/2 z-[99999] px-6 py-3.5 rounded-2xl font-black text-xs uppercase tracking-wider border flex items-center gap-3 animate-in slide-in-from-top-5 duration-300 backdrop-blur-3xl shadow-2xl ${isError ? 'bg-red-950/90 text-red-200 border-red-600/50' : isSuccess ? 'bg-red-950/90 text-red-400 border-red-500/50' : isInfo ? 'bg-rose-950/90 text-rose-300 border-rose-600/50' : 'bg-black/95 text-zinc-400 border-zinc-800'}`}>
      {isError && <AlertCircle className="w-5 h-5 text-red-500" />}
      {isSuccess && <CheckCircle className="w-5 h-5 text-red-500" />}
      {isInfo && <Hexagon className="w-5 h-5 text-red-400" />}
      <span className='text-center'>{toast.text}</span>
    </div>
  );
}

export function Footer() {
    return (
        <footer className="w-full bg-[#020000] border-t border-white/5 py-12 mt-auto pb-24 md:pb-12 flex flex-col items-center justify-center relative overflow-hidden">
            <div className="absolute top-0 left-1/2 -translate-x-1/2 w-1/2 h-[1px] bg-gradient-to-r from-transparent via-red-900/50 to-transparent"></div>
            <div className="max-w-7xl mx-auto px-4 text-center">
                <div className="flex justify-center items-center gap-3 mb-5 group cursor-pointer">
                    <AbyssalLogo className="w-8 h-8 grayscale group-hover:grayscale-0 transition-all duration-700 opacity-50 group-hover:opacity-100" />
                    <span className="font-black text-xl text-zinc-500 group-hover:text-red-500 transition-colors tracking-[0.2em] uppercase">MANGÁS ABISSAL</span>
                </div>
                <p className="text-zinc-600 text-[9px] uppercase font-black tracking-[0.3em]">O Vazio Resguarda - © 2026</p>
            </div>
        </footer>
    );
}

export const ChapterTransitionOverlay = React.memo(({ isVisible, chapterNumber }) => {
    if (!isVisible) return null;
    return (
        <div className="fixed inset-0 z-[99999] bg-[#020000] flex items-center justify-center overflow-hidden font-sans">
            <style>{`
                @keyframes warp-speed { 0% { transform: scale(1); opacity: 0; filter: blur(10px); } 50% { opacity: 1; filter: blur(0px); } 100% { transform: scale(10); opacity: 0; filter: blur(20px); } }
                @keyframes glow-text { 0%, 100% { text-shadow: 0 0 20px rgba(220,38,38,0.5); } 50% { text-shadow: 0 0 40px rgba(220,38,38,0.8); } }
            `}</style>
            <div className="absolute inset-0 flex items-center justify-center opacity-40">
                <div className="w-[1px] h-[1px] rounded-full shadow-[0_0_80px_60px_#ef4444,0_0_150px_100px_#9f1239] animate-[warp-speed_0.8s_ease-in_forwards]"></div>
            </div>
            <div className="relative z-10 flex flex-col items-center">
                <div className="text-red-500/80 font-black tracking-[1.5em] text-[10px] uppercase mb-6 animate-pulse ml-[1.5em]">Transcendendo</div>
                <h2 className="text-[120px] md:text-[200px] leading-none font-black text-transparent bg-clip-text bg-gradient-to-b from-white to-red-800 tracking-tight" style={{ animation: 'glow-text 2s ease-in-out infinite' }}>{chapterNumber}</h2>
            </div>
        </div>
    );
});
