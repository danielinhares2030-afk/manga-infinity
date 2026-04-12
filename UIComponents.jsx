import React, { useState, useEffect } from 'react';
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

/* ABERTURA: FENDA DO ABISMO CORRIGIDA E ÉPICA */
export const SplashScreen = React.memo(() => {
    const [phase, setPhase] = useState(0);

    useEffect(() => {
        // Fase 1: Tremor e linha de luz rasgando o centro
        const t1 = setTimeout(() => setPhase(1), 150);
        // Fase 2: O chão se afasta por completo revelando o fundo
        const t2 = setTimeout(() => setPhase(2), 1000);

        return () => { clearTimeout(t1); clearTimeout(t2); };
    }, []);

    // Partículas/Pedras que caem no abismo
    const rocks = Array.from({ length: 20 }).map((_, i) => ({
        id: i,
        size: Math.random() * 12 + 8, // Pedras menores e mais sutis
        left: Math.random() * 100, // Caem por toda a tela
        delay: Math.random() * 2, // Atraso fluido
        duration: Math.random() * 2 + 2, // Mais tempo de queda
        rotate: Math.random() * 360, // Giram
        drift: (Math.random() - 0.5) * 200 // Desviam para os lados
    }));

    return (
        <div className={`fixed inset-0 z-[9999] bg-[#020204] w-full h-screen overflow-hidden font-sans ${phase === 1 ? 'animate-[shake_0.1s_ease-in-out_infinite]' : ''}`}>
            <style>{`
                @keyframes shake {
                    0%, 100% { transform: translateX(0) translateY(0); }
                    25% { transform: translateX(-4px) translateY(2px); }
                    75% { transform: translateX(4px) translateY(-2px); }
                }
                @keyframes fall-debris {
                    0% { transform: translateY(-10vh) translateX(0) rotate(0deg) scale(1); opacity: 0; }
                    10% { opacity: 1; }
                    100% { transform: translateY(110vh) translateX(var(--drift)) rotate(var(--rot)) scale(0.5); opacity: 0; }
                }
                /* Recortes menos exagerados para parecer rachadura real */
                .rough-edge-left { clip-path: polygon(0 0, 100% 0, 96% 12%, 100% 25%, 95% 38%, 98% 50%, 94% 65%, 100% 80%, 96% 92%, 100% 100%, 0 100%); }
                .rough-edge-right { clip-path: polygon(100% 0, 0 0, 4% 12%, 0 25%, 5% 38%, 2% 50%, 6% 65%, 0 80%, 4% 92%, 0 100%, 100% 100%); }
            `}</style>

            {/* FUNDO DO ABISMO (Revelado após as portas abrirem) */}
            <div className="absolute inset-0 flex flex-col items-center justify-center bg-[radial-gradient(ellipse_at_center,_var(--tw-gradient-stops))] from-cyan-950/40 via-[#020204] to-[#020204]">
                {/* Brilho intenso no centro que acende ao abrir */}
                <div className={`absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[30vw] h-[100vh] bg-cyan-500/20 blur-[80px] transition-opacity duration-1000 ${phase === 2 ? 'opacity-100' : 'opacity-0'}`}></div>
                <div className={`absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[70vw] h-[70vw] rounded-full bg-fuchsia-600/10 blur-[100px] transition-opacity duration-1000 delay-300 ${phase === 2 ? 'opacity-100' : 'opacity-0'}`}></div>

                {/* LOGO E TEXTO (Centralizados e inteiros) */}
                <div className={`relative z-10 flex flex-col items-center transition-all duration-1000 ease-out delay-500 ${phase === 2 ? 'opacity-100 scale-100' : 'opacity-0 scale-90'}`}>
                    <AbyssalLogo className="w-32 h-32 md:w-44 md:h-44 mb-8 drop-shadow-[0_0_30px_rgba(34,211,238,0.5)] animate-[pulse_3s_infinite]" />
                    <h1 className="text-4xl md:text-5xl font-black text-transparent bg-clip-text bg-gradient-to-b from-white via-cyan-50 to-cyan-800 tracking-[0.4em] md:tracking-[0.6em] uppercase text-center ml-[0.4em] drop-shadow-[0_0_15px_rgba(34,211,238,0.3)]">ABISSAL</h1>
                    <div className="mt-10 text-cyan-400/60 text-[10px] md:text-[11px] font-black tracking-[1em] md:tracking-[1.5em] uppercase animate-pulse">O Vazio Desperta</div>
                </div>
            </div>

            {/* DEBRIS (Pedras caindo infinitamente no fundo) */}
            {phase === 2 && rocks.map(rock => (
                <div key={rock.id}
                    className="absolute -top-10 bg-[#07090e] border border-cyan-900/40 shadow-[0_0_8px_rgba(0,0,0,0.8)] z-20 rounded-sm"
                    style={{
                        width: rock.size,
                        height: rock.size,
                        left: `${rock.left}%`,
                        animation: `fall-debris ${rock.duration}s linear ${rock.delay}s infinite`,
                        '--drift': `${rock.drift}px`,
                        '--rot': `${rock.rotate}deg`
                    }}
                ></div>
            ))}

            {/* A RACHADURA DE LUZ (Fase 1) */}
            <div className={`absolute left-1/2 top-0 bottom-0 w-1 bg-cyan-300 shadow-[0_0_40px_15px_rgba(34,211,238,0.9)] -translate-x-1/2 z-30 transition-all duration-300 ${phase === 1 ? 'opacity-100 scale-y-100' : 'opacity-0 scale-y-0'}`}></div>

            {/* PAREDES ESCURAS (Que vão se afastar 100% da tela) */}
            
            {/* Parede Esquerda */}
            <div className={`absolute inset-y-0 left-0 w-1/2 bg-[#020204] rough-edge-left z-40 transition-transform duration-[1200ms] ease-[cubic-bezier(0.7,0,0.2,1)] ${phase === 2 ? '-translate-x-full' : 'translate-x-0'}`}>
                {/* Borda brilhante da parede quebrando */}
                <div className={`absolute inset-y-0 right-0 w-6 bg-gradient-to-l from-cyan-400/30 to-transparent transition-opacity duration-300 ${phase === 1 ? 'opacity-100' : 'opacity-0'}`}></div>
            </div>

            {/* Parede Direita */}
            <div className={`absolute inset-y-0 right-0 w-1/2 bg-[#020204] rough-edge-right z-40 transition-transform duration-[1200ms] ease-[cubic-bezier(0.7,0,0.2,1)] ${phase === 2 ? 'translate-x-full' : 'translate-x-0'}`}>
                {/* Borda brilhante da parede quebrando */}
                <div className={`absolute inset-y-0 left-0 w-6 bg-gradient-to-r from-cyan-400/30 to-transparent transition-opacity duration-300 ${phase === 1 ? 'opacity-100' : 'opacity-0'}`}></div>
            </div>

        </div>
    );
});
    return (
        <div className={`fixed inset-0 z-[9999] bg-gradient-to-b from-black to-[#0a0514] w-full h-screen overflow-hidden font-sans ${isShaking ? 'animate-[shake_0.1s_ease-in-out_infinite]' : ''}`}>
            <style>{`
                @keyframes shake {
                    0%, 100% { transform: translateX(0) rotate(0deg); }
                    25% { transform: translateX(-6px) rotate(-1deg); }
                    75% { transform: translateX(6px) rotate(1deg); }
                }
                @keyframes fall {
                    0% { transform: translateY(-10vh) translateX(0) rotate(0deg); opacity: 1; }
                    80% { opacity: 1; }
                    100% { transform: translateY(110vh) translateX(var(--x-drift)) rotate(720deg); opacity: 0; }
                }
                /* Recortes irregulares simulando pedra quebrada */
                .clip-left { clip-path: polygon(0 0, 100% 0, 92% 10%, 100% 22%, 85% 35%, 100% 48%, 90% 60%, 100% 75%, 85% 88%, 100% 100%, 0 100%); }
                .clip-right { clip-path: polygon(100% 0, 0 0, 8% 10%, 0 22%, 15% 35%, 0 48%, 10% 60%, 0 75%, 15% 88%, 0 100%, 100% 100%); }
            `}</style>

            {/* BRILHO DO CENTRO DO ABISMO (Aumenta quando abre) */}
            <div className={`absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 w-[40vw] h-[120vh] bg-blue-900/80 blur-3xl transition-all duration-1000 ease-out ${isCracked ? 'scale-x-100 opacity-100' : 'scale-x-0 opacity-0'}`}></div>
            <div className={`absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 w-[15vw] h-[100vh] bg-fuchsia-600/60 blur-2xl transition-all duration-1000 ease-out delay-100 ${isCracked ? 'scale-x-100 opacity-100' : 'scale-x-0 opacity-0'}`}></div>

            {/* CONTEÚDO REVELADO NO FUNDO (Logo e Título) */}
            <div className={`absolute inset-0 flex flex-col items-center justify-center transition-all duration-[1500ms] ease-out ${isCracked ? 'opacity-100 scale-100' : 'opacity-0 scale-75'}`}>
                <AbyssalLogo className="w-40 h-40 mb-8 drop-shadow-[0_0_50px_rgba(34,211,238,0.8)] animate-[pulse_2s_infinite]" />
                <h1 className="text-5xl font-black text-transparent bg-clip-text bg-gradient-to-b from-white via-cyan-100 to-cyan-900 tracking-[0.6em] uppercase text-center ml-[0.6em] drop-shadow-[0_0_30px_rgba(34,211,238,0.4)]">ABISSAL</h1>
                <div className="mt-12 text-cyan-400/80 text-[11px] font-black tracking-[1.5em] uppercase">O Vazio Desperta</div>
            </div>

            {/* PEDRAS CAINDO */}
            {isCracked && rocks.map(rock => (
                <div key={rock.id}
                    className="absolute -top-10 bg-[#1a1a24] border border-[#2a2a35] rounded-sm shadow-[0_0_15px_rgba(0,0,0,0.9)] z-20"
                    style={{
                        width: rock.size,
                        height: rock.size,
                        left: `${rock.left}%`,
                        animation: `fall ${rock.duration}s ease-in ${rock.delay}s forwards`,
                        '--x-drift': `${rock.xDrift}px`
                    }}
                ></div>
            ))}

            {/* PAREDE ESQUERDA (Rachadura) */}
            <div className={`absolute inset-y-0 left-0 w-[55%] bg-[#050508] clip-left transition-transform duration-1000 ease-out shadow-[20px_0_50px_rgba(0,0,0,1)] z-10 ${isCracked ? '-translate-x-[40%] md:-translate-x-[30%]' : 'translate-x-0'}`}>
                {/* Reflexo luminoso na borda da pedra */}
                <div className="absolute inset-y-0 right-0 w-6 bg-gradient-to-l from-cyan-900/40 to-transparent"></div>
            </div>

            {/* PAREDE DIREITA (Rachadura) */}
            <div className={`absolute inset-y-0 right-0 w-[55%] bg-[#050508] clip-right transition-transform duration-1000 ease-out shadow-[-20px_0_50px_rgba(0,0,0,1)] z-10 ${isCracked ? 'translate-x-[40%] md:translate-x-[30%]' : 'translate-x-0'}`}>
                {/* Reflexo luminoso na borda da pedra */}
                <div className="absolute inset-y-0 left-0 w-6 bg-gradient-to-r from-cyan-900/40 to-transparent"></div>
            </div>

        </div>
    );
});

/* TRANSIÇÃO DE CAPÍTULO: SALTO DIMENSIONAL */
export const ChapterTransitionOverlay = React.memo(({ isVisible, chapterNumber }) => {
    if (!isVisible) return null;
    return (
        <div className="fixed inset-0 z-[99999] bg-[#020204] flex items-center justify-center overflow-hidden">
            <style>{`
                @keyframes warp-speed {
                    0% { transform: scale(1) translateZ(0); opacity: 0; }
                    50% { opacity: 1; }
                    100% { transform: scale(15) translateZ(500px); opacity: 0; }
                }
            `}</style>
            
            {/* Efeito de túnel de luz otimizado */}
            <div className="absolute inset-0 flex items-center justify-center opacity-40">
                <div className="w-[10px] h-[10px] rounded-full shadow-[0_0_100px_50px_#22d3ee,0_0_200px_100px_#d946ef] animate-[warp-speed_0.8s_ease-in_forwards]"></div>
            </div>

            <div className="relative z-10 flex flex-col items-center">
                <div className="text-cyan-500/80 font-black tracking-[1.5em] text-[10px] uppercase mb-6 animate-pulse ml-[1.5em]">Próxima Camada</div>
                <h2 className="text-[150px] leading-none font-black text-transparent bg-clip-text bg-gradient-to-b from-white to-cyan-900 drop-shadow-[0_0_30px_rgba(34,211,238,0.5)] animate-in zoom-in-50 duration-500">
                    {chapterNumber}
                </h2>
            </div>
        </div>
    );
});
