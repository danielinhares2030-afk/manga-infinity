import React, { useState, useEffect } from 'react';
import { ShieldAlert, AlertCircle, CheckCircle, Zap, Lock, Hexagon, User, Key } from 'lucide-react';

/* ==========================================================================
   ÍCONE RANK S: O OLHO DEMONÍACO FLUTUANTE COM PISCAR REALISTA
   ========================================================================== */
export const AbyssalLogo = React.memo(({ className = "w-40 h-40", isAwake = true }) => {
  return (
    <div className={`relative flex items-center justify-center group ${className} animate-[float_4s_ease-in-out_infinite]`}>
      
      {/* Imagem Original Intacta e Ampliada */}
      <img 
        src="https://i.ibb.co/GvvpKNPD/design-vetorial-de-ilustracao-de-olhos-de-diabo-vermelho-692212-66-removebg-preview.png"
        className="relative z-10 w-full h-full object-contain drop-shadow-[0_0_25px_rgba(220,38,38,0.4)]"
        alt="Olho do Abismo"
      />

      {/* LÓGICA DO PISCAR: Máscara invisível calibrada para não cortar o olho */}
      {isAwake && (
        <div 
          className="absolute z-20 overflow-hidden rounded-[50%]"
          style={{
            width: '46%',     /* Largura exata do globo vermelho */
            height: '32%',    /* Altura exata do globo vermelho */
            top: '34%',       /* Posição no eixo Y */
            left: '27%'       /* Posição no eixo X */
          }}
        >
          {/* Pálpebra Superior (Desce muito rápido no piscar) */}
          <div className="absolute top-0 left-[-10%] w-[120%] h-[60%] bg-[#030000] rounded-b-[50%] animate-[blink-top_5s_infinite] shadow-[0_5px_10px_rgba(0,0,0,0.9)]"></div>

          {/* Pálpebra Inferior (Sobe muito rápido no piscar) */}
          <div className="absolute bottom-0 left-[-10%] w-[120%] h-[60%] bg-[#030000] rounded-t-[50%] animate-[blink-bottom_5s_infinite] shadow-[0_-5px_10px_rgba(0,0,0,0.9)]"></div>
        </div>
      )}

      {/* Keyframes do Piscar (O olho fica totalmente aberto 96% do tempo) e Flutuação */}
      <style>{`
        @keyframes blink-top {
          0%, 94%, 100% { transform: translateY(-110%); }
          96%, 98% { transform: translateY(0%); } 
        }
        @keyframes blink-bottom {
          0%, 94%, 100% { transform: translateY(110%); }
          96%, 98% { transform: translateY(0%); }
        }
        @keyframes float {
          0%, 100% { transform: translateY(0px); }
          50% { transform: translateY(-15px); }
        }
      `}</style>
    </div>
  );
});

/* ==========================================================================
   ABERTURA CINEMATOGRÁFICA: ELEGANTE E SOMBRIA
   ========================================================================== */
export const SplashScreen = React.memo(() => {
  const [phase, setPhase] = useState(1);

  useEffect(() => {
    // Fase 1: Escuridão inicial
    const t2 = setTimeout(() => setPhase(2), 500);   // Olho surge do escuro
    const t3 = setTimeout(() => setPhase(3), 2000);  // Olho pisca
    const t4 = setTimeout(() => setPhase(4), 3500);  // Título e form aparecem suavemente

    return () => { clearTimeout(t2); clearTimeout(t3); clearTimeout(t4); };
  }, []);

  return (
    <div className="fixed inset-0 z-[9999] overflow-hidden bg-[#020001] flex items-center justify-center font-sans">
      
      {/* Glow muito sutil e escuro no fundo */}
      <div className={`absolute inset-0 bg-[radial-gradient(circle_at_center,_#1a0505_0%,_#020001_60%)] transition-opacity duration-3000 ease-in-out
        ${phase >= 2 ? 'opacity-100' : 'opacity-0'}`}></div>

      {/* CONTAINER PRINCIPAL */}
      <div className={`relative z-20 flex flex-col items-center justify-center w-full px-4 transition-all duration-[2000ms] ease-[cubic-bezier(0.25,1,0.5,1)]
        ${phase >= 4 ? '-translate-y-4' : 'translate-y-0'}`}>
        
        {/* O Olho (Maior e Flutuando) */}
        <div className={`relative flex items-center justify-center transition-all duration-[2000ms] ease-out
          ${phase === 1 ? 'opacity-0 scale-50 blur-xl' : 'opacity-100 scale-100 blur-none'}
          ${phase >= 4 ? 'mb-8' : 'mb-0'}`}>
          
          <AbyssalLogo 
            className={`${phase >= 4 ? 'w-48 h-48 md:w-56 md:h-56' : 'w-64 h-64 md:w-80 md:h-80'} transition-all duration-[2000ms]`} 
            isAwake={phase >= 3} 
          />
        </div>

        {/* Revelação do Texto e Login limpo */}
        <div className={`w-full flex flex-col items-center transition-all duration-[1500ms] ease-out
          ${phase >= 4 ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-10 hidden'}`}>
          
          <h1 className="text-4xl md:text-5xl font-black text-transparent bg-clip-text bg-gradient-to-b from-white to-red-600 tracking-[0.4em] whitespace-nowrap pl-[0.4em] drop-shadow-[0_0_20px_rgba(220,38,38,0.3)] mb-2 text-center">
            O ABISMO
          </h1>
          <p className="text-[10px] md:text-xs text-red-500 uppercase tracking-[0.8em] font-black animate-pulse mb-8 pl-[0.8em] text-center">
            Sangue do Vazio
          </p>

          <div className="w-full max-w-sm bg-[#050102]/60 backdrop-blur-2xl border border-red-900/30 p-7 md:p-8 rounded-3xl shadow-[0_20px_50px_rgba(0,0,0,0.8)]">
            <div className="space-y-4">
              <div className="relative group">
                <User className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-red-600/50 group-focus-within:text-red-400 transition-colors" />
                <input type="text" placeholder="Entidade" className="w-full bg-[#030000] border border-white/5 rounded-xl py-3.5 pl-12 pr-4 text-sm text-white outline-none focus:border-red-600/60 focus:shadow-[0_0_15px_rgba(220,38,38,0.15)] transition-all" />
              </div>
              <div className="relative group">
                <Key className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-red-600/50 group-focus-within:text-red-400 transition-colors" />
                <input type="password" placeholder="Chave de Sangue" className="w-full bg-[#030000] border border-white/5 rounded-xl py-3.5 pl-12 pr-4 text-sm text-white outline-none focus:border-red-600/60 focus:shadow-[0_0_15px_rgba(220,38,38,0.15)] transition-all" />
              </div>
              <button className="w-full relative overflow-hidden bg-gradient-to-r from-red-800 to-rose-900 text-white font-black text-xs uppercase tracking-widest py-3.5 rounded-xl mt-4 hover:scale-[1.02] transition-all shadow-[0_0_20px_rgba(220,38,38,0.2)] group">
                <div className="absolute inset-0 bg-gradient-to-r from-red-600 via-rose-600 to-red-600 opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
                <span className="relative z-10">Romper o Véu</span>
              </button>
            </div>
          </div>
        </div>

      </div>
    </div>
  );
});

/* ==========================================================================
   RESTANTE DOS COMPONENTES (ERRO, TOAST, FOOTER, TRANSIÇÃO)
   ========================================================================== */
export class ErrorBoundary extends React.Component {
  constructor(props) { super(props); this.state = { hasError: false, error: null }; }
  static getDerivedStateFromError(error) { return { hasError: true, error }; }
  render() {
    if (this.state.hasError) {
      return (
        <div className="min-h-screen bg-[#050001] text-red-500 p-10 flex flex-col items-center justify-center font-sans border border-red-900/30 relative overflow-hidden">
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
            <div className="max-w-7xl mx-auto px-4 text-center">
                <div className="flex justify-center items-center gap-3 mb-5 group cursor-pointer">
                    <AbyssalLogo className="w-12 h-12 grayscale group-hover:grayscale-0 transition-all duration-700 opacity-60 group-hover:opacity-100" />
                    <span className="font-black text-xl text-zinc-500 group-hover:text-red-500 transition-colors tracking-[0.2em] uppercase">O ABISMO</span>
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
                <div className="text-red-500/80 font-black tracking-[1.5em] text-[10px] uppercase mb-6 ml-[1.5em]">Transcendendo</div>
                <h2 className="text-[120px] md:text-[200px] leading-none font-black text-transparent bg-clip-text bg-gradient-to-b from-white to-red-800 tracking-tight" style={{ animation: 'glow-text 2s ease-in-out infinite' }}>{chapterNumber}</h2>
            </div>
        </div>
    );
});
