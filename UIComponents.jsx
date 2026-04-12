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

/* ABERTURA: FENDA DO ABISMO COM PEDRAS CAINDO E TREMOR (SOLO LEVELING STYLE) */
export const SplashScreen = React.memo(() => {
    const [isCracked, setIsCracked] = useState(false);
    const [isShaking, setIsShaking] = useState(false);

    useEffect(() => {
        // Começa fechado, abre depois de 400ms
        const crackTimer = setTimeout(() => {
            setIsCracked(true);
            setIsShaking(true);
        }, 400);

        // O tremor da tela dura apenas o início da abertura
        const shakeTimer = setTimeout(() => {
            setIsShaking(false);
        }, 1200); 

        return () => {
            clearTimeout(crackTimer);
            clearTimeout(shakeTimer);
        };
    }, []);

    // Gerando as pedras (fragmentos) que vão cair
    const rocks = Array.from({ length: 15 }).map((_, i) => ({
        id: i,
        size: Math.random() * 25 + 10, // Entre 10px e 35px
        left: 40 + Math.random() * 20, // Caem perto do centro (40% a 60%)
        delay: Math.random() * 0.6, // Atraso aleatório no início
        duration: Math.random() * 1.5 + 1, // Tempo de queda
        xDrift: (Math.random() - 0.5) * 150 // Desvio horizontal
    }));

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
