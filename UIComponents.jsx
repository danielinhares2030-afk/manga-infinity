import React, { useState, useEffect, useMemo } from 'react';

/* NOVO ÍCONE: PORTAL/OLHO DO ABISMO (100% CSS ANIMADO) */
export const AbyssalLogo = React.memo(({ className = "w-16 h-16" }) => {
  return (
    <div className={`relative flex items-center justify-center ${className}`}>
      {/* Anéis de energia rodando */}
      <div className="absolute inset-0 rounded-full border-t-[3px] border-cyan-400 border-r-[3px] border-transparent animate-[spin_3s_linear_infinite] opacity-80"></div>
      <div className="absolute inset-2 rounded-full border-b-[3px] border-fuchsia-500 border-l-[3px] border-transparent animate-[spin_2s_linear_infinite_reverse] opacity-80"></div>
      
      {/* Núcleo pulsante (Buraco Negro) */}
      <div className="w-1/2 h-1/2 bg-black rounded-full shadow-[0_0_20px_8px_rgba(34,211,238,0.7)] animate-[pulse_1.5s_ease-in-out_infinite] border border-cyan-900 flex items-center justify-center overflow-hidden">
         {/* Fenda central parecendo um olho de gato/dragão no abismo */}
         <div className="w-[15%] h-[70%] bg-white rounded-full blur-[1px] shadow-[0_0_10px_rgba(255,255,255,1)]"></div>
      </div>
    </div>
  );
});

/* ABERTURA: FENDA DO ABISMO (Sem tremor, com novo ícone e novo nome) */
export const SplashScreen = React.memo(() => {
  const [phase, setPhase] = useState(0);

  useEffect(() => {
    // Timings suaves, sem tremor
    const t1 = setTimeout(() => setPhase(1), 100);   // Inicia a ruptura de plasma
    const t2 = setTimeout(() => setPhase(2), 800);   // Paredes se abrem
    const t3 = setTimeout(() => setPhase(3), 2000);  // Revela o nome e a logo

    return () => {
      clearTimeout(t1);
      clearTimeout(t2);
      clearTimeout(t3);
    };
  }, []);

  const debris = useMemo(
    () =>
      Array.from({ length: 30 }).map((_, i) => ({
        id: i,
        size: Math.random() * 20 + 4,
        left: 30 + Math.random() * 40,
        delay: Math.random() * 0.8,
        duration: Math.random() * 1.5 + 1.2,
        rotate: Math.random() * 720,
        drift: (Math.random() - 0.5) * 400,
        isEnergy: Math.random() > 0.7,
        borderRadius: `${Math.random() * 50 + 20}% ${Math.random() * 50 + 20}% ${Math.random() * 50 + 20}% ${Math.random() * 50 + 20}%`,
      })),
    []
  );

  return (
    <div className="fixed inset-0 z-[9999] overflow-hidden bg-black flex items-center justify-center perspective-[1000px]">
      <style>{`
        @keyframes plasma-surge {
          0% { transform: scaleY(0) scaleX(0.5); opacity: 0; }
          50% { transform: scaleY(1.2) scaleX(1); opacity: 1; filter: brightness(2); }
          100% { transform: scaleY(1) scaleX(0); opacity: 0; }
        }

        @keyframes shatter-fall {
          0% {
            transform: translateY(-20vh) translateX(0) rotate(0deg) scale(1);
            opacity: 1;
          }
          100% {
            transform: translateY(120vh) translateX(var(--drift)) rotate(var(--rot)) scale(0.2);
            opacity: 0;
          }
        }

        .void-wall-left { clip-path: polygon(0 0, 100% 0, 92% 8%, 98% 18%, 88% 28%, 96% 40%, 85% 55%, 95% 70%, 88% 85%, 100% 100%, 0 100%); }
        .void-wall-right { clip-path: polygon(100% 0, 0 0, 8% 8%, 2% 18%, 12% 28%, 4% 40%, 15% 55%, 5% 70%, 12% 85%, 0 100%, 100% 100%); }
      `}</style>

      {/* O VAZIO VERDADEIRO */}
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,_var(--tw-gradient-stops))] from-[#08152b] via-[#03050a] to-black">
        <div className={`absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[120vw] h-[120vw] rounded-full bg-cyan-600/10 blur-[120px] mix-blend-screen transition-all duration-[2000ms] ease-out ${phase >= 2 ? "opacity-100 scale-100" : "opacity-0 scale-50"}`} />
        <div className={`absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[80vw] h-[80vw] rounded-full bg-fuchsia-700/10 blur-[150px] mix-blend-screen transition-all duration-[2000ms] ease-out delay-150 ${phase >= 2 ? "opacity-100 scale-100" : "opacity-0 scale-50"}`} />
      </div>

      {/* FRAGMENTOS ESTILHAÇADOS */}
      {phase >= 2 && debris.map((frag) => (
        <div
          key={frag.id}
          className={`absolute top-0 z-20 shadow-2xl backdrop-blur-sm ${frag.isEnergy ? 'bg-cyan-400 shadow-[0_0_20px_5px_rgba(34,211,238,0.8)] border border-white' : 'bg-[#0a0c10] border border-cyan-900/40 shadow-[inset_0_0_10px_rgba(0,0,0,1)]'}`}
          style={{
            width: `${frag.size}px`, height: `${frag.size}px`, left: `${frag.left}%`, borderRadius: frag.borderRadius,
            animation: `shatter-fall ${frag.duration}s cubic-bezier(0.25, 1, 0.5, 1) ${frag.delay}s forwards`,
            "--drift": `${frag.drift}px`, "--rot": `${frag.rotate}deg`,
          }}
        />
      ))}

      {/* RAIO DE PLASMA CENTRAL */}
      <div className={`absolute left-1/2 top-0 bottom-0 z-30 w-[6px] -translate-x-1/2 bg-white shadow-[0_0_80px_25px_rgba(34,211,238,1),0_0_150px_50px_rgba(217,70,239,0.8)] mix-blend-screen origin-center ${phase === 1 ? "animate-[plasma-surge_0.8s_ease-out_forwards]" : "opacity-0"}`} />

      {/* PAREDES DIMENSIONAIS (SEM TREMOR) */}
      <div className={`absolute inset-y-0 left-0 z-40 w-[55%] bg-[#020203] void-wall-left transition-all duration-[1500ms] ease-[cubic-bezier(0.16,1,0.3,1)] origin-left shadow-[20px_0_100px_rgba(0,0,0,1)] ${phase >= 2 ? "transform -translate-x-[120%] scale-110" : "transform translate-x-0 scale-100"}`}>
        <div className={`absolute right-0 inset-y-0 w-12 bg-gradient-to-l from-cyan-400/50 via-cyan-600/10 to-transparent mix-blend-screen transition-opacity duration-300 ${phase === 1 ? "opacity-100" : "opacity-0"}`} />
      </div>

      <div className={`absolute inset-y-0 right-0 z-40 w-[55%] bg-[#020203] void-wall-right transition-all duration-[1500ms] ease-[cubic-bezier(0.16,1,0.3,1)] origin-right shadow-[-20px_0_100px_rgba(0,0,0,1)] ${phase >= 2 ? "transform translate-x-[120%] scale-110" : "transform translate-x-0 scale-100"}`}>
        <div className={`absolute left-0 inset-y-0 w-12 bg-gradient-to-r from-cyan-400/50 via-cyan-600/10 to-transparent mix-blend-screen transition-opacity duration-300 ${phase === 1 ? "opacity-100" : "opacity-0"}`} />
      </div>

      {/* LOGOTIPO NOVO E TEXTO MANGÁS ABISSAL */}
      <div className={`absolute inset-0 z-50 flex flex-col items-center justify-center pointer-events-none transition-all duration-[1500ms] ease-[cubic-bezier(0.16,1,0.3,1)] ${phase >= 3 ? "opacity-100 transform translate-y-0 scale-100 filter-none" : "opacity-0 transform translate-y-10 scale-75 blur-sm"}`}>
        
        {/* Usando o novo logo animado aqui */}
        <AbyssalLogo className="w-32 h-32 md:w-40 md:h-40 mb-8" />
        
        <h1 className="text-4xl md:text-6xl font-black tracking-[0.3em] md:tracking-[0.5em] text-transparent bg-clip-text bg-gradient-to-b from-white via-cyan-100 to-cyan-900 drop-shadow-[0_0_20px_rgba(34,211,238,0.5)] pl-[0.3em] text-center">
          MANGÁS ABISSAL
        </h1>
        
        <div className="mt-8 flex items-center gap-4 text-cyan-400/80">
            <div className="w-12 h-[1px] bg-gradient-to-r from-transparent to-cyan-500/50"></div>
            <p className="tracking-[1em] uppercase text-[10px] md:text-xs font-black animate-pulse">
              O Vazio Desperta
            </p>
            <div className="w-12 h-[1px] bg-gradient-to-l from-transparent to-cyan-500/50"></div>
        </div>
      </div>
    </div>
  );
});
