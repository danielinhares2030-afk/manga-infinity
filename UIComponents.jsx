import React, { useState, useEffect } from 'react';
import { ShieldAlert, AlertCircle, CheckCircle, Zap, Lock, Hexagon, User, Key } from 'lucide-react';

/* ==========================================================================
   ÍCONE RANK S: O SEU ÍCONE ORIGINAL ENVOLTO EM ENERGIA
   ========================================================================== */
export const AbyssalLogo = React.memo(({ className = "w-24 h-24" }) => {
  return (
    <div className={`relative flex items-center justify-center ${className}`}>
      
      {/* Glow e Anéis Giratórios ao redor do Ícone */}
      <div className="absolute inset-0 bg-cyan-600/30 rounded-full blur-[25px] animate-pulse"></div>
      <div className="absolute inset-[-10%] rounded-full border-t-[3px] border-cyan-400 border-r-[3px] border-transparent animate-[spin_3s_linear_infinite] opacity-80"></div>
      <div className="absolute inset-[-20%] rounded-full border-b-[3px] border-fuchsia-500 border-l-[3px] border-transparent animate-[spin_4s_linear_infinite_reverse] opacity-60"></div>
      
      {/* O SEU ÍCONE ORIGINAL (Olho e Livro) */}
      <img 
        src="https://i.ibb.co/zh5k9rkG/1775680662923-v4lypu-removebg-preview.png" 
        alt="Logo Mangás Abissal" 
        className="w-full h-full object-contain relative z-10 drop-shadow-[0_0_20px_rgba(34,211,238,0.8)]"
        onError={(e) => e.target.style.display = 'none'}
      />
    </div>
  );
});

/* ==========================================================================
   ABERTURA: O DESPERTAR DO ABISMO (CORRIGIDO E RESPONSIVO)
   ========================================================================== */
export const SplashScreen = React.memo(() => {
  const [phase, setPhase] = useState(0);

  useEffect(() => {
    const t1 = setTimeout(() => setPhase(1), 300);   // Faísca brilha
    const t2 = setTimeout(() => setPhase(2), 1200);  // Ícone surge
    const t3 = setTimeout(() => setPhase(3), 2500);  // Texto surge nítido
    const t4 = setTimeout(() => setPhase(4), 4000);  // Form de login surge

    return () => { clearTimeout(t1); clearTimeout(t2); clearTimeout(t3); clearTimeout(t4); };
  }, []);

  return (
    <div className="fixed inset-0 z-[9999] overflow-hidden bg-[#020204] flex items-center justify-center font-sans">
      
      {/* Fundo do Abismo */}
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,_#0b1836_0%,_#020204_70%)] opacity-80"></div>

      {/* FASE 1: Faísca Central */}
      <div className={`absolute w-3 h-3 bg-white rounded-full shadow-[0_0_30px_15px_#22d3ee] transition-all duration-700 ease-out
        ${phase === 1 ? 'scale-100 opacity-100' : 'scale-0 opacity-0'}`}></div>

      {/* CONTAINER PRINCIPAL */}
      <div className={`relative z-10 flex flex-col items-center w-full max-w-md px-4 transition-all duration-1000 ease-out
        ${phase >= 4 ? '-translate-y-8 md:-translate-y-12' : 'translate-y-0'}`}>

        {/* FASE 2: O Ícone Original Surge */}
        <div className={`transition-all duration-1000 ease-out
          ${phase >= 2 ? 'opacity-100 scale-100' : 'opacity-0 scale-50'}`}>
          <AbyssalLogo className="w-32 h-32 md:w-40 md:h-40 mb-6 md:mb-8" />
        </div>

        {/* FASE 3: Texto Responsivo (Sem o bug do blur e sem cortar as bordas) */}
        <div className={`flex flex-col items-center transition-all duration-1000 ease-out delay-200
          ${phase >= 3 ? 'opacity-100 translate-y-0 blur-none' : 'opacity-0 translate-y-8 blur-md'}`}>
          
          <h1 className="text-2xl sm:text-3xl md:text-5xl font-black text-transparent bg-clip-text bg-gradient-to-b from-white via-cyan-100 to-cyan-600 tracking-widest md:tracking-[0.4em] drop-shadow-[0_0_20px_rgba(34,211,238,0.5)] text-center whitespace-nowrap">
            MANGÁS ABISSAL
          </h1>

          <div className="mt-4 md:mt-6 flex items-center justify-center gap-3 w-full">
            <div className="flex-1 h-[1px] bg-gradient-to-r from-transparent to-cyan-500"></div>
            <p className="text-[9px] md:text-xs text-cyan-400 uppercase tracking-[0.5em] md:tracking-[1em] font-black animate-pulse text-center whitespace-nowrap">
              O Vazio Desperta
            </p>
            <div className="flex-1 h-[1px] bg-gradient-to-l from-transparent to-cyan-500"></div>
          </div>
        </div>

        {/* FASE 4: Formulário de Acesso (Fake para estética) */}
        <div className={`w-full transition-all duration-1000 ease-out mt-8 md:mt-10
          ${phase >= 4 ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-10 pointer-events-none absolute'}`}>
          
          <div className="w-full bg-[#050508]/80 backdrop-blur-xl border border-cyan-900/40 p-6 md:p-8 rounded-3xl shadow-[0_20px_50px_rgba(0,0,0,0.8),inset_0_0_20px_rgba(34,211,238,0.05)]">
            <div className="space-y-4">
              <div className="relative group">
                <User className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-cyan-600/50 group-focus-within:text-cyan-400 transition-colors" />
                <input type="text" placeholder="Sua Entidade" className="w-full bg-[#010103] border border-white/5 rounded-xl py-3.5 pl-12 pr-4 text-sm text-white outline-none focus:border-cyan-500/80 focus:shadow-[0_0_15px_rgba(34,211,238,0.2)] transition-all" />
              </div>
              <div className="relative group">
                <Key className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-cyan-600/50 group-focus-within:text-cyan-400 transition-colors" />
                <input type="password" placeholder="Chave Cósmica" className="w-full bg-[#010103] border border-white/5 rounded-xl py-3.5 pl-12 pr-4 text-sm text-white outline-none focus:border-cyan-500/80 focus:shadow-[0_0_15px_rgba(34,211,238,0.2)] transition-all" />
              </div>
              <button className="w-full relative overflow-hidden bg-cyan-800 text-white font-black text-[10px] md:text-xs uppercase tracking-widest py-4 rounded-xl mt-4 hover:scale-[1.02] transition-all shadow-[0_0_20px_rgba(34,211,238,0.3)] group">
                <div className="absolute inset-0 bg-gradient-to-r from-cyan-600 via-blue-600 to-cyan-600 opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
                <span className="relative z-10">Mergulhar no Vazio</span>
              </button>
            </div>
          </div>
        </div>

      </div>
    </div>
  );
});

/* ==========================================================================
   ERRO, TOAST, FOOTER E TRANSIÇÃO
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
    <div className={`fixed top-6 left-1/2 -translate-x-1/2 z-[99999] px-6 py-3.5 rounded-2xl font-black text-xs uppercase tracking-wider border flex items-center gap-3 animate-in slide-in-from-top-5 duration-300 backdrop-blur-3xl shadow-2xl ${isError ? 'bg-red-950/90 text-red-200 border-red-600/50' : isSuccess ? 'bg-cyan-950/90 text-cyan-400 border-cyan-500/50' : isInfo ? 'bg-blue-950/90 text-blue-300 border-blue-600/50' : 'bg-zinc-950/95 text-zinc-400 border-zinc-800'}`}>
      {isError && <AlertCircle className="w-5 h-5 text-red-500" />}
      {isSuccess && <CheckCircle className="w-5 h-5 text-cyan-500" />}
      {isInfo && <Hexagon className="w-5 h-5 text-cyan-400" />}
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
                    <span className="font-black text-xl text-zinc-500 group-hover:text-cyan-400 transition-colors tracking-[0.2em] uppercase">MANGÁS ABISSAL</span>
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
                <div className="w-[1px] h-[1px] rounded-full shadow-[0_0_80px_60px_#22d3ee,0_0_150px_100px_#0284c7] animate-[warp-speed_0.8s_ease-in_forwards]"></div>
            </div>
            <div className="relative z-10 flex flex-col items-center">
                <div className="text-cyan-500/80 font-black tracking-[1.5em] text-[10px] uppercase mb-6 animate-pulse ml-[1.5em]">Transcendendo</div>
                <h2 className="text-[120px] md:text-[200px] leading-none font-black text-transparent bg-clip-text bg-gradient-to-b from-white to-cyan-700 tracking-tight" style={{ animation: 'glow-text 2s ease-in-out infinite' }}>{chapterNumber}</h2>
            </div>
        </div>
    );
});
