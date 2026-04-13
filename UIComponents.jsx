import React, { useState, useEffect, useMemo } from 'react';
import { ShieldAlert, AlertCircle, CheckCircle, Zap, Lock, Hexagon, User, Key, Eye } from 'lucide-react';

/* ==========================================================================
   NOVO ÍCONE: O OLHO ELDRITCH DO VAZIO (RANK S - VIVO E COLORIDO)
   ========================================================================== */
export const AbyssalLogo = React.memo(({ className = "w-16 h-16", isAwake = true }) => {
  return (
    <div className={`relative flex items-center justify-center group ${className}`}>
      
      {/* GLOW PROFUNDO E NÉVOA ROXA (Glow roxo constante de fundo) */}
      <div className="absolute inset-[-40%] bg-gradient-to-tr from-fuchsia-900/50 via-purple-950/20 to-cyan-900/20 rounded-full blur-[40px] opacity-80 animate-[glow-pulse_6s_ease-in-out_infinite]"></div>

      {/* ESTRUTURA PRINCIPAL DO OLHO: Formato Amendoado Perfeito e Blindado contra Vercel */}
      <div 
        className={`w-full h-full border border-cyan-500 rounded-[80%_0_80%_0] rotate-45 overflow-hidden flex items-center justify-center relative z-10 transition-all duration-1000
        ${isAwake ? 'animate-[blink_5s_infinite] shadow-[0_0_30px_5px_rgba(34,211,238,0.7),inset_0_0_20px_rgba(0,0,0,1)]' : 'shadow-[inset_0_0_20px_rgba(0,0,0,1)]'}`}
        style={{
          backgroundColor: '#010103',
        }}
      >
        
        {/* DESFAZENDO A ROTAÇÃO PARA OS ELEMENTOS INTERNOS */}
        <div className="absolute inset-0 flex items-center justify-center" style={{ transform: 'rotate(-45deg)' }}>
            
            {/* ÍRIS CÓSMICA EM DEGRADÊ COLORIDO (Ciano -> Magenta -> Azul Profundo) */}
            <div className={`absolute w-[75%] h-[75%] rounded-full bg-[conic-gradient(from_180deg_at_50%_50%,_#0c1a35_0%,_#2563eb_25%,_#0ea5e9_50%,_#d946ef_75%,_#0c1a35_100%)] shadow-[inset_0_0_20px_10px_rgba(0,0,0,0.8),0_0_15px_rgba(14,165,233,0.5)] flex items-center justify-center transition-all duration-[1500ms]
                ${isAwake ? 'scale-100 opacity-100' : 'scale-50 opacity-0'}`}>
                
                {/* Textura espiral da íris que gira lentamente */}
                <div className="absolute inset-0 rounded-full bg-[conic-gradient(from_0deg,_transparent_0%,_rgba(34,211,238,0.4)_25%,_transparent_50%,_rgba(217,70,239,0.3)_75%,_transparent_100%)] animate-[spin_12s_linear_infinite] mix-blend-screen"></div>
            </div>

            {/* PUPILA FENDIDA (Abismo/Criatura Cósmica) */}
            <div className={`absolute w-[18%] h-[80%] bg-black rounded-[50%] shadow-[inset_0_0_12px_rgba(0,0,0,1),0_0_10px_1px_rgba(34,211,238,0.4)] animate-[pupil-scan_8s_ease-in-out_infinite] transition-all duration-[1000ms] delay-300
                ${isAwake ? 'scale-y-100 opacity-100' : 'scale-y-0 opacity-0'}`}></div>

            {/* REFLEXO DE LUZ REALISTA (Ponto branco superior) */}
            <div className={`absolute top-[20%] right-[32%] w-[12%] h-[12%] bg-white rounded-full blur-[1px] shadow-[0_0_10px_rgba(255,255,255,1)] transition-opacity duration-1000 delay-500
                ${isAwake ? 'opacity-80' : 'opacity-0'}`}></div>
        </div>

        {/* PÁLPEBRAS DO VAZIO: Cobre o olho no início da animação */}
        <div 
          className={`absolute bg-[#010103] origin-top transition-transform duration-[1200ms] ease-[cubic-bezier(0.85,0,0.15,1)] z-20 ${isAwake ? 'scale-y-0' : 'scale-y-100'}`}
          style={{ top: '-50%', left: '-50%', width: '200%', height: '100%', transform: isAwake ? 'rotate(-45deg) scaleY(0)' : 'rotate(-45deg) scaleY(1)' }}
        ></div>
        
        <div 
          className={`absolute bg-[#010103] origin-bottom transition-transform duration-[1200ms] ease-[cubic-bezier(0.85,0,0.15,1)] z-20 ${isAwake ? 'scale-y-0' : 'scale-y-100'}`}
          style={{ bottom: '-50%', left: '-50%', width: '200%', height: '100%', transform: isAwake ? 'rotate(-45deg) scaleY(0)' : 'rotate(-45deg) scaleY(1)' }}
        ></div>

      </div>

      <style>{`
        @keyframes glow-pulse { 0%, 100% { opacity: 0.6; filter: blur(35px) brightness(1); } 50% { opacity: 1; filter: blur(50px) brightness(1.3); } }
        @keyframes blink { 0%, 48%, 52%, 100% { transform: scaleY(1); opacity: 1; } 50% { transform: scaleY(0.01); opacity: 0; } }
        @keyframes pupil-scan { 0%, 100% { transform: translateX(0); } 25% { transform: translateX(-3px); } 75% { transform: translateX(3px); } }
      `}</style>
    </div>
  );
});

/* ==========================================================================
   ABERTURA CINEMATOGRÁFICA: O DESPERTAR DO VAZIO (PRETO, AZUL, ROXO)
   ========================================================================== */
export const SplashScreen = React.memo(() => {
  const [phase, setPhase] = useState(1);

  useEffect(() => {
    // Fase 1: Vazio absoluto e poeira estelar (0ms -> Padrão)
    const t2 = setTimeout(() => setPhase(2), 1500);  // A Fenda de luz ciano e magenta surge no escuro
    const t3 = setTimeout(() => setPhase(3), 3000);  // O Olho Eldritch desperta e se abre (ele está no meio!)
    const t4 = setTimeout(() => setPhase(4), 4500);  // Explosão de energia e partículas neon
    const t5 = setTimeout(() => setPhase(5), 6000);  // Revelação final do título e form

    return () => { clearTimeout(t2); clearTimeout(t3); clearTimeout(t4); clearTimeout(t5); };
  }, []);

  // Partículas de poeira cósmica/energia para Fase 1 e 4
  const ambientParticles = useMemo(() => Array.from({ length: 30 }).map((_, i) => ({
    id: i,
    x: Math.random() * 100, y: Math.random() * 100,
    size: Math.random() * 3 + 1,
    duration: Math.random() * 8 + 10,
    delay: Math.random() * -10,
  })), []);

  const burstParticles = useMemo(() => Array.from({ length: 40 }).map((_, i) => ({
    id: i,
    angle: Math.random() * 360,
    distance: Math.random() * 200 + 50,
    size: Math.random() * 5 + 2,
    duration: Math.random() * 1.5 + 0.8,
  })), []);

  return (
    <div className={`fixed inset-0 z-[9999] overflow-hidden bg-[#000000] flex items-center justify-center font-sans
      ${phase === 4 ? "animate-[shake_0.4s_ease-in-out]" : ""}`}>
      
      <style>{`
        @keyframes shake { 0%, 100% { transform: translate(0, 0); } 20% { transform: translate(-3px, 3px); } 40% { transform: translate(3px, -2px); } 60% { transform: translate(-2px, -3px); } 80% { transform: translate(2px, 2px); } }
        @keyframes float-ambient { 0% { transform: translateY(0) translateX(0); opacity: 0; } 50% { opacity: 0.5; } 100% { transform: translateY(-20vh) translateX(5vw); opacity: 0; } }
        @keyframes particle-burst { 0% { transform: translate(0, 0) scale(1); opacity: 1; } 100% { transform: translate(var(--tx), var(--ty)) scale(0); opacity: 0; } }
      `}</style>

      {/* AMBIENTE: Vazio absoluto clareando para um glow profundo e roxo */}
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,_#1e1b4b_0%,_#000000_70%)] opacity-60"></div>
      
      {/* Poeira Estelar do Vazio (Fase 1+) */}
      {ambientParticles.map(p => (
        <div key={`amb-${p.id}`} className="absolute rounded-full bg-cyan-200/40 blur-[1px]"
             style={{
               width: `${p.size}px`, height: `${p.size}px`, left: `${p.x}%`, top: `${p.y}%`,
               animation: `float-ambient ${p.duration}s linear infinite ${p.delay}s`
             }}></div>
      ))}

      {/* FASE 2: A Fenda de Luz (Linha central ciano e magenta) */}
      <div className={`absolute z-30 top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 transition-all duration-700 ease-out flex gap-2
        ${phase === 2 ? 'w-[100px] md:w-[150px] opacity-100' : 'w-0 opacity-0'}`}
        style={{ height: '3px' }}>
        <div className="w-1/2 h-full bg-white shadow-[0_0_40px_10px_#22d3ee] rounded-full"></div>
        <div className="w-1/2 h-full bg-white shadow-[0_0_40px_10px_#d946ef] rounded-full"></div>
      </div>

      {/* FASE 4: Onda de Choque e Brilho forte central (Blur azul e roxo) */}
      <div className={`absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[120vw] h-[120vw] md:w-[70vw] md:h-[70vw] rounded-full bg-[radial-gradient(circle,_rgba(34,211,238,0.3)_0%,_rgba(192,38,211,0.1)_40%,_transparent_70%)] blur-[50px] transition-all duration-[1000ms] ease-out pointer-events-none mix-blend-screen
        ${phase >= 4 ? 'opacity-100 scale-150' : 'opacity-0 scale-50'}`}></div>

      {/* CONTAINER PRINCIPAL: OLHO + LOGIN */}
      <div className={`relative z-20 flex flex-col items-center justify-center w-full px-4 transition-all duration-[1500ms] ease-[cubic-bezier(0.25,1,0.5,1)]
        ${phase >= 3 ? 'opacity-100 scale-100' : 'opacity-0 scale-50'}`}>
        
        {/* FASE 3: Olho Eldritch Desperta e se Abre (O ícone está no meio!) */}
        <div className={`relative flex items-center justify-center transition-all duration-[1500ms] ease-out
          ${phase >= 5 ? 'w-28 h-28 md:w-36 md:h-36 mb-10' : 'w-36 h-36 md:w-48 md:h-48 mb-0'}`}>
          <AbyssalLogo className="w-full h-full drop-shadow-[0_0_40px_rgba(34,211,238,0.6)]" isAwake={phase >= 3} />
        </div>

        {/* FASE 5: Revelação do Título e Formulário de Login */}
        <div className={`w-full flex flex-col items-center transition-all duration-[1500ms] ease-out
          ${phase >= 5 ? 'opacity-100 translate-y-0 filter-none' : 'opacity-0 translate-y-10 blur-sm'}`}>
          
          <h1 className="text-4xl md:text-6xl font-black text-transparent bg-clip-text bg-gradient-to-b from-white via-cyan-100 to-cyan-700 tracking-[0.5em] md:tracking-[0.6em] whitespace-nowrap pl-[0.5em] drop-shadow-[0_0_30px_rgba(34,211,238,0.4)] mb-3 text-center">
            MANGÁS ABISSAL
          </h1>
          <p className="text-[10px] md:text-xs text-cyan-400 uppercase tracking-[1em] font-black animate-pulse mb-12 pl-[1em] text-center">
            manifestando o inevitável
          </p>

          {/* O Formulário de Login (Fake para estética na Splash Screen) */}
          <div className="w-full max-w-sm bg-[#050508]/80 backdrop-blur-3xl border border-cyan-900/40 p-7 md:p-8 rounded-3xl shadow-[0_20px_60px_rgba(0,0,0,0.8),inset_0_0_20px_rgba(34,211,238,0.05)]">
            <div className="space-y-5">
              <div className="relative group">
                <User className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-cyan-600/50 group-focus-within:text-cyan-400 transition-colors" />
                <input type="text" placeholder="Entidade" className="w-full bg-[#010103] border border-white/5 rounded-xl py-4 pl-12 pr-4 text-sm text-white outline-none focus:border-cyan-500/80 focus:shadow-[0_0_15px_rgba(34,211,238,0.2)] transition-all" />
              </div>
              <div className="relative group">
                <Key className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-cyan-600/50 group-focus-within:text-cyan-400 transition-colors" />
                <input type="password" placeholder="Chave Cósmica" className="w-full bg-[#010103] border border-white/5 rounded-xl py-4 pl-12 pr-4 text-sm text-white outline-none focus:border-cyan-500/80 focus:shadow-[0_0_15px_rgba(34,211,238,0.2)] transition-all" />
              </div>
              <button className="w-full relative overflow-hidden bg-gradient-to-r from-cyan-700 to-fuchsia-700 text-white font-black text-xs uppercase tracking-widest py-4 rounded-xl mt-4 hover:scale-[1.02] transition-all shadow-[0_0_20px_rgba(34,211,238,0.3)] group">
                <div className="absolute inset-0 bg-gradient-to-r from-cyan-600 via-blue-600 to-cyan-600 opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
                <span className="relative z-10">Cruzar o Horizonte</span>
              </button>
            </div>
          </div>
        </div>

      </div>

      {/* Partículas da Explosão de Energia (Fase 4 - Neon Ciano/Magenta/Branco) */}
      {phase === 4 && burstParticles.map(p => {
        const tx = Math.cos(p.angle * (Math.PI / 180)) * p.distance;
        const ty = Math.sin(p.angle * (Math.PI / 180)) * p.distance;
        const isCyan = Math.random() > 0.4; // 60% ciano, 40% magenta/branco
        return (
          <div key={`burst-${p.id}`} className={`absolute top-1/2 left-1/2 rounded-full shadow-[0_0_15px_#fff] z-30 ${isCyan ? 'bg-cyan-300' : 'bg-fuchsia-400'}`}
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
    RESTANTE DOS COMPONENTES (ERROS, TOAST, TRANSIÇÃO, FOOTER - INTACTOS)
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
          <button onClick={() => window.location.reload()} className="mt-8 bg-zinc-900 border border-zinc-700 hover:border-cyan-500 text-white px-8 py-3.5 rounded-xl font-black uppercase text-[10px] tracking-widest transition-all relative z-10">Restaurar Conexão</button>
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
    <div className={`fixed top-6 left-1/2 -translate-x-1/2 z-[99999] px-6 py-3.5 rounded-2xl font-black text-xs uppercase tracking-wider border flex items-center gap-3 animate-in slide-in-from-top-5 duration-300 backdrop-blur-3xl shadow-2xl ${isError ? 'bg-red-950/90 text-red-200 border-red-600/50' : isSuccess ? 'bg-zinc-950/90 text-cyan-400 border-cyan-500/50' : isInfo ? 'bg-blue-950/90 text-blue-300 border-blue-600/50' : 'bg-zinc-950/95 text-zinc-400 border-zinc-800'}`}>
      {isError && <AlertCircle className="w-5 h-5 text-red-500" />}
      {isSuccess && <CheckCircle className="w-5 h-5 text-cyan-500" />}
      {isInfo && <Hexagon className="w-5 h-5 text-blue-400" />}
      <span className='text-center'>{toast.text}</span>
    </div>
  );
}

export function Footer() {
    return (
        <footer className="w-full bg-[#030407] border-t border-white/5 py-12 mt-auto pb-24 md:pb-12 flex flex-col items-center justify-center relative overflow-hidden">
            <div className="absolute top-0 left-1/2 -translate-x-1/2 w-1/2 h-[1px] bg-gradient-to-r from-transparent via-cyan-900/50 to-transparent"></div>
            <div className="max-w-7xl mx-auto px-4 text-center">
                <div className="flex justify-center items-center gap-3 mb-5 group cursor-pointer">
                    <AbyssalLogo className="w-8 h-8 grayscale group-hover:grayscale-0 transition-all duration-700 opacity-50 group-hover:opacity-100" />
                    <span className="font-black text-xl text-zinc-500 group-hover:text-cyan-400 transition-colors tracking-[0.2em] uppercase">O ABISMO</span>
                </div>
                <p className="text-zinc-600 text-[9px] uppercase font-black tracking-[0.3em]">O Vazio Resguarda - © 2026</p>
            </div>
        </footer>
    );
}

export const ChapterTransitionOverlay = React.memo(({ isVisible, chapterNumber }) => {
    if (!isVisible) return null;
    return (
        <div className="fixed inset-0 z-[99999] bg-[#010103] flex items-center justify-center overflow-hidden font-sans">
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
