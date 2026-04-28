import React, { useState, useEffect } from 'react';
import { AlertTriangle } from 'lucide-react';

// NOVO LOGO MANGAKAGE (Ninja 2D de Corpo Inteiro, Sentado no Nome)
export const KageLogo = React.memo(({ className = "w-48 h-48" }) => {
  return (
    <div className={`relative flex items-center justify-center ${className}`}>
      <style>{`
        @keyframes floatNinja {
          0%, 100% { transform: translateY(0px); filter: drop-shadow(0 0 10px rgba(220,38,38,0.4)); }
          50% { transform: translateY(-8px); filter: drop-shadow(0 0 25px rgba(220,38,38,0.8)); }
        }
        @keyframes blinkNinja {
          0%, 96%, 98%, 100% { transform: scaleY(1); }
          97%, 99% { transform: scaleY(0.1); }
        }
      `}</style>
      <svg viewBox="0 0 200 200" className="relative z-10 w-full h-full" style={{ animation: 'floatNinja 4s ease-in-out infinite' }}>
        
        {/* AURA VERMELHA SUTIL DE FUNDO */}
        <circle cx="100" cy="90" r="85" fill="#dc2626" opacity="0.1" filter="blur(20px)" />

        {/* CACHECOIS FLOWING IN THE BACK */}
        <path d="M50,110 Q80,130 110,110" fill="#dc2626" stroke="#991b1b" strokeWidth="1.5" opacity="0.5" strokeLinecap="round" transform="rotate(-15 100 100)" />
        <path d="M140,70 Q170,90 200,70" fill="#dc2626" stroke="#991b1b" strokeWidth="1.5" opacity="0.5" strokeLinecap="round" transform="rotate(15 100 100)" />

        {/* NINJA CHIBI DE CORPO INTEIRO SENTADO (Fofinho, Ousado, Digno) */}
        <g transform="translate(50, 10) scale(1)">
          {/* Cabeça, Capuz e Máscara */}
          <path d="M20,60 C20,25 80,25 80,60 C80,95 50,105 50,105 C50,105 20,95 20,60 Z" fill="#0a0a0c" stroke="#1f2937" strokeWidth="2.5"/>
          <path d="M22,55 Q50,68 78,55 L74,42 Q50,52 26,42 Z" fill="#fcd34d" />
          <path d="M18,45 Q50,55 82,45 L78,32 Q50,40 22,32 Z" fill="#dc2626" stroke="#991b1b" strokeWidth="1.5" />
          <circle cx="50" cy="38" r="5" fill="#030305" stroke="#fcd34d" strokeWidth="0.5" />
          
          {/* Animação dos Olhos (Piscar) */}
          <g style={{ transformOrigin: '50px 55px', animation: 'blinkNinja 5s infinite' }}>
              <circle cx="38" cy="54" r="5" fill="#030305" />
              <circle cx="40" cy="52" r="2" fill="#ffffff" />
              <circle cx="62" cy="54" r="5" fill="#030305" />
              <circle cx="64" cy="52" r="2" fill="#ffffff" />
              {/* Sobrancelhas Franzidas (Ousadia) */}
              <line x1="30" y1="49" x2="44" y2="52" stroke="#030305" strokeWidth="2.5" strokeLinecap="round" />
              <line x1="70" y1="49" x2="56" y2="52" stroke="#030305" strokeWidth="2.5" strokeLinecap="round" />
          </g>
          
          {/* Cicatriz de Batalha (Dignidade) */}
          <path d="M60,44 L68,64 M62,59 L66,57" stroke="#dc2626" strokeWidth="1.5" strokeLinecap="round" opacity="0.85" />
          
          {/* Máscara inferior / Cachecol */}
          <path d="M22,60 Q50,85 78,60 L85,75 Q50,100 15,75 Z" fill="#dc2626" stroke="#991b1b" strokeWidth="1.5" />
          
          {/* CORPO CHIBI SENTADO */}
          <path d="M35,95 L65,95 L75,125 L25,125 Z" fill="#0a0a0c" stroke="#1f2937" strokeWidth="2" /> {/* Tronco */}
          <path d="M35,95 Q50,105 65,95" fill="none" stroke="#dc2626" strokeWidth="1.5" strokeLinecap="round" /> {/* Gola Carmesim */}
          <path d="M30,125 L70,125 L75,140 L25,140 Z" fill="#0a0a0c" stroke="#1f2937" strokeWidth="2" /> {/* Pernas Cruzadas */}
          <path d="M35,125 Q50,135 65,125" fill="none" stroke="#dc2626" strokeWidth="1.5" strokeLinecap="round" opacity="0.4"/> {/* Detalhe Pernas */}
          
          {/* BRAÇOS CRUZADOS (Ousadia/Imponência) */}
          <path d="M30,100 Q50,110 70,100 Q60,115 40,115 Q40,115 30,100 Z" fill="#0a0a0c" stroke="#1f2937" strokeWidth="2.2" /> {/* Braços */}
          
          {/* CACHECOIS FLOWING */}
          <path d="M35,90 C25,80 50,70 50,80 C50,90 75,80 65,90" fill="#dc2626" stroke="#991b1b" strokeWidth="1" /> {/* Cachecol no Pescoço */}
        </g>
        
        {/* TEXTO `MANGAKAGE` CENTRALIZADO ABAIXO DO NINJA SENTADO */}
        <text x="100" y="170" textAnchor="middle" fill="#dc2626" fontWeight="900" fontSize="28" fontFamily="sans-serif" letterSpacing="0.1em" style={{ transform: 'scale(1, 1.2)', transformOrigin: 'center' }}>
          MANGAKAGE
        </text>
        
        {/* DECO SÉPTA ANULAR DO TEXTO */}
        <path d="M20,185 Q100,200 180,185" fill="none" stroke="#dc2626" strokeWidth="2" strokeLinecap="round" opacity="0.8"/>
        <circle cx="20" cy="185" r="3" fill="#030305" stroke="#fcd34d" strokeWidth="1"/>
        <circle cx="180" cy="185" r="3" fill="#030305" stroke="#fcd34d" strokeWidth="1"/>

      </svg>
    </div>
  );
});

export const SplashScreen = React.memo(() => {
  const [fade, setFade] = useState(false);

  useEffect(() => {
    const t1 = setTimeout(() => setFade(true), 50); 
    return () => clearTimeout(t1);
  }, []);

  return (
    <div className={`fixed inset-0 z-[9999] bg-[#030305] flex flex-col items-center justify-center font-sans transition-all duration-500 ease-in-out opacity-100 scale-100`}>
      <style>{`body, html { background-color: #030305 !important; margin: 0; padding: 0; }`}</style>
      
      {/* AURAS DAS SOMBRAS E SANGUE */}
      <div className="absolute top-[20%] left-[10%] w-[50vw] h-[50vw] bg-red-900/20 blur-[120px] rounded-full animate-[pulse_4s_ease-in-out_infinite_alternate]"></div>
      <div className="absolute bottom-[20%] right-[10%] w-[50vw] h-[50vw] bg-rose-900/15 blur-[120px] rounded-full animate-[pulse_5s_ease-in-out_infinite_alternate-reverse]"></div>
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[60vw] h-[60vw] bg-red-600/10 blur-[150px] rounded-full"></div>

      <div className={`flex flex-col items-center justify-center relative z-10 transition-all duration-[600ms] ease-out px-4 w-full text-center ${fade ? 'opacity-100 scale-100 translate-y-0' : 'opacity-0 scale-90 translate-y-4'}`}>
        
        {/* NOVO ÍCONE MANGAKAGE (Já contém o nome na base do desenho) */}
        <KageLogo className="w-64 h-64 md:w-80 md:h-80 mb-2 drop-shadow-[0_0_30px_rgba(220,38,38,0.3)]" />
        
        <div className="mt-8 flex items-center gap-3 opacity-80">
            <div className="w-2.5 h-2.5 bg-red-700 rounded-full animate-ping"></div>
            <div className="w-2.5 h-2.5 bg-red-500 rounded-full animate-ping" style={{animationDelay: '0.2s'}}></div>
            <div className="w-2.5 h-2.5 bg-rose-400 rounded-full animate-ping" style={{animationDelay: '0.4s'}}></div>
        </div>
      </div>
    </div>
  );
});

export class ErrorBoundary extends React.Component {
  constructor(props) { super(props); this.state = { hasError: false, error: null }; }
  static getDerivedStateFromError(error) { return { hasError: true, error }; }
  render() {
    if (this.state.hasError) {
      return (
        <div className="min-h-screen bg-[#030305] p-10 flex flex-col items-center justify-center font-sans border-t-[4px] border-red-600">
          <AlertTriangle className="w-16 h-16 mb-4 text-red-600 animate-pulse drop-shadow-[0_0_15px_rgba(220,38,38,0.5)]"/>
          <h1 className="text-2xl font-black uppercase tracking-widest text-white text-center">Fenda nas Sombras (Erro)</h1>
          <p className="mt-2 text-gray-500 text-xs font-bold text-center max-w-lg">{this.state.error?.message}</p>
          <button onClick={() => window.location.reload()} className="mt-8 bg-red-600/10 border-2 border-red-600 text-red-500 hover:bg-red-600 hover:text-black rounded-xl px-8 py-3 font-black text-[10px] uppercase tracking-widest transition-all">Restaurar Conexão</button>
        </div>
      );
    }
    return this.props.children;
  }
}

export function GlobalToast({ toast }) {
  if (!toast) return null;
  const colors = toast.type === 'error' ? 'bg-red-950/90 text-red-200 border-red-600/50 shadow-[0_0_15px_rgba(220,38,38,0.3)]' : 
                 toast.type === 'success' ? 'bg-emerald-950/90 text-emerald-200 border-emerald-500/50 shadow-[0_0_15px_rgba(16,185,129,0.3)]' : 
                 'bg-[#111113]/90 text-gray-200 border-white/20 shadow-xl';
  return (
    <div className={`fixed top-6 left-1/2 -translate-x-1/2 z-[99999] px-6 py-3.5 font-black text-[10px] uppercase tracking-[0.1em] border rounded-xl backdrop-blur-xl animate-in slide-in-from-top-5 fade-in duration-300 ${colors}`}>
      <span className='text-center flex items-center gap-2'>{toast.text}</span>
    </div>
  );
}

export function Footer() {
    return (
        <footer className="w-full bg-[#030305] border-t border-white/5 py-12 mt-auto pb-24 md:pb-12 flex flex-col items-center justify-center relative overflow-hidden">
            <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[300px] h-[1px] bg-gradient-to-r from-transparent via-red-600/50 to-transparent"></div>
            <div className="max-w-7xl mx-auto px-4 text-center flex flex-col items-center relative z-10">
                <KageLogo className="w-24 h-24 opacity-30 mb-2 grayscale transition-all hover:grayscale-0 hover:opacity-100" />
            </div>
        </footer>
    );
}

export const ChapterTransitionOverlay = React.memo(({ isVisible, chapterNumber }) => {
    if (!isVisible) return null;
    return (
        <div className="fixed inset-0 z-[99999] bg-[#030305] font-sans flex flex-col items-center justify-center animate-in fade-in duration-300">
            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-64 h-64 bg-red-600/10 blur-[80px] rounded-full"></div>
            <div className="text-red-500 font-black tracking-[0.5em] text-[10px] uppercase mb-2 animate-pulse relative z-10">
                Adentrando as Sombras
            </div>
            <h2 className="text-6xl sm:text-8xl font-black text-transparent bg-clip-text bg-gradient-to-br from-red-400 to-white tracking-tighter animate-in zoom-in-50 duration-300 relative z-10 drop-shadow-[0_0_20px_rgba(220,38,38,0.4)]">
              {chapterNumber}
            </h2>
        </div>
    );
});
