import React, { useState, useEffect, useMemo } from 'react';
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

/* ABERTURA: FENDA DO ABISMO (Implementação Exata do Usuário) */
export const SplashScreen = React.memo(() => {
  const [phase, setPhase] = useState(0);

  useEffect(() => {
    const t1 = setTimeout(() => setPhase(1), 150);   // tremor + linha
    const t2 = setTimeout(() => setPhase(2), 900);   // abre
    const t3 = setTimeout(() => setPhase(3), 2600);  // mostra logo total

    return () => {
      clearTimeout(t1);
      clearTimeout(t2);
      clearTimeout(t3);
    };
  }, []);

  const rocks = useMemo(
    () =>
      Array.from({ length: 24 }).map((_, i) => ({
        id: i,
        size: Math.random() * 14 + 6,
        left: 40 + Math.random() * 20,
        delay: Math.random() * 1.5,
        duration: Math.random() * 1.8 + 1.8,
        rotate: Math.random() * 360,
        drift: (Math.random() - 0.5) * 250,
      })),
    []
  );

  return (
    <div
      className={`fixed inset-0 z-[9999] overflow-hidden bg-[#020204]
      ${phase === 1 ? "animate-[shake_0.12s_ease-in-out_infinite]" : ""}`}
    >
      <style>{`
        @keyframes shake {
          0%,100% { transform: translate(0,0); }
          25% { transform: translate(-3px,2px); }
          50% { transform: translate(3px,-2px); }
          75% { transform: translate(-2px,1px); }
        }

        @keyframes crackGlow {
          0% { opacity: 0; transform: scaleY(0); }
          100% { opacity: 1; transform: scaleY(1); }
        }

        @keyframes fallRock {
          0% {
            transform: translateY(-10vh) translateX(0) rotate(0deg) scale(1);
            opacity: 0;
          }
          10% { opacity: 1; }
          100% {
            transform: translateY(110vh) translateX(var(--drift))
              rotate(var(--rot)) scale(0.4);
            opacity: 0;
          }
        }

        .crack-left {
          clip-path: polygon(
            0 0,
            100% 0,
            94% 10%,
            98% 22%,
            92% 35%,
            97% 48%,
            90% 60%,
            96% 75%,
            92% 88%,
            100% 100%,
            0 100%
          );
        }

        .crack-right {
          clip-path: polygon(
            100% 0,
            0 0,
            6% 10%,
            2% 22%,
            8% 35%,
            3% 48%,
            10% 60%,
            4% 75%,
            8% 88%,
            0 100%,
            100% 100%
          );
        }
      `}</style>

      {/* FUNDO DO ABISMO */}
      <div className="absolute inset-0 bg-gradient-to-b from-black via-[#05070d] to-[#020204]">
        <div
          className={`absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2
          h-full w-[28vw] bg-cyan-500/20 blur-[90px]
          transition-all duration-1000
          ${phase >= 2 ? "opacity-100 scale-100" : "opacity-0 scale-50"}`}
        />

        <div
          className={`absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2
          w-[70vw] h-[70vw] rounded-full bg-fuchsia-600/10 blur-[120px]
          transition-all duration-1000 delay-200
          ${phase >= 2 ? "opacity-100 scale-100" : "opacity-0 scale-75"}`}
        />
      </div>

      {/* PEDRAS */}
      {phase >= 2 &&
        rocks.map((rock) => (
          <div
            key={rock.id}
            className="absolute -top-10 z-20 rounded-sm bg-zinc-800 border border-cyan-900/30"
            style={{
              width: `${rock.size}px`,
              height: `${rock.size}px`,
              left: `${rock.left}%`,
              animation: `fallRock ${rock.duration}s linear ${rock.delay}s infinite`,
              "--drift": `${rock.drift}px`,
              "--rot": `${rock.rotate}deg`,
            }}
          />
        ))}

      {/* LINHA CENTRAL */}
      <div
        className={`absolute left-1/2 top-0 bottom-0 z-30
        w-[3px] -translate-x-1/2 bg-cyan-300
        shadow-[0_0_45px_18px_rgba(34,211,238,0.95)]
        transition-all duration-500
        ${phase >= 1 ? "opacity-100 scale-y-100" : "opacity-0 scale-y-0"}`}
      />

      {/* PAREDE ESQUERDA */}
      <div
        className={`absolute inset-y-0 left-0 z-40 w-1/2 bg-[#020204] crack-left
        transition-transform duration-[1400ms] ease-[cubic-bezier(0.7,0,0.2,1)]
        ${phase >= 2 ? "-translate-x-full" : "translate-x-0"}`}
      >
        <div
          className={`absolute right-0 inset-y-0 w-8 bg-gradient-to-l from-cyan-400/30 to-transparent
          ${phase >= 1 ? "opacity-100" : "opacity-0"}`}
        />
      </div>

      {/* PAREDE DIREITA */}
      <div
        className={`absolute inset-y-0 right-0 z-40 w-1/2 bg-[#020204] crack-right
        transition-transform duration-[1400ms] ease-[cubic-bezier(0.7,0,0.2,1)]
        ${phase >= 2 ? "translate-x-full" : "translate-x-0"}`}
      >
        <div
          className={`absolute left-0 inset-y-0 w-8 bg-gradient-to-r from-cyan-400/30 to-transparent
          ${phase >= 1 ? "opacity-100" : "opacity-0"}`}
        />
      </div>

      {/* LOGO */}
      <div
        className={`absolute inset-0 z-50 flex flex-col items-center justify-center
        transition-all duration-1000
        ${phase >= 3 ? "opacity-100 scale-100" : "opacity-0 scale-90"}`}
      >
        <h1 className="text-5xl font-black tracking-[0.5em] text-white drop-shadow-[0_0_20px_rgba(34,211,238,0.4)]">
          ABISSAL
        </h1>
        <p className="mt-6 text-cyan-400/60 tracking-[0.8em] uppercase text-xs animate-pulse">
          O Vazio Desperta
        </p>
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
