import React, { useState, useEffect } from 'react';
import { AlertTriangle } from 'lucide-react';

// LOGO MANGAKAGE (Limpo, com contorno animado opcional)
export const KageLogo = React.memo(({ className = "w-64 h-64", showContour = false }) => {
  return (
    <div className={`relative flex items-center justify-center ${className}`}>
      
      {/* ANIMAÇÃO DE CONTORNO (Ativada via props na tela de login) */}
      {showContour && (
         <div className="absolute inset-0 rounded-full border-[3px] border-transparent border-t-red-600 border-b-red-600 animate-[spin_3s_linear_infinite] shadow-[0_0_20px_rgba(220,38,38,0.5)] z-0"></div>
      )}

      {/* O Seu Mascote Oficial (Sem fundos borrados) */}
      <img 
        src="https://i.ibb.co/gF4zyvkk/Gemini-Generated-Image-gj2yhugj2yhugj2y-removebg-preview.png" 
        alt="Mangakage Mascot" 
        className="relative z-10 w-full h-full object-contain drop-shadow-[0_5px_15px_rgba(220,38,38,0.4)]"
      />
    </div>
  );
});

// SPLASH SCREEN (Sem animações de fundo, totalmente clean)
export const SplashScreen = React.memo(() => {
  const [fade, setFade] = useState(false);

  useEffect(() => {
    const t1 = setTimeout(() => setFade(true), 50); 
    return () => clearTimeout(t1);
  }, []);

  return (
    <div className={`fixed inset-0 z-[9999] bg-[#030305] flex flex-col items-center justify-center font-sans transition-all duration-500`}>
      <style>{`body, html { background-color: #030305 !important; margin: 0; padding: 0; }`}</style>

      <div className={`flex flex-col items-center justify-center relative z-10 transition-all duration-[700ms] ease-out px-4 w-full text-center ${fade ? 'opacity-100 scale-100' : 'opacity-0 scale-90'}`}>
        
        {/* Mascote Gigante na Abertura (sem o contorno aqui) */}
        <KageLogo className="w-[300px] h-[300px] md:w-[450px] md:h-[450px]" showContour={false} />
        
        <div className="mt-8 flex items-center gap-3 opacity-60">
            <div className="w-2.5 h-2.5 bg-red-700 rounded-full animate-ping"></div>
            <div className="w-2.5 h-2.5 bg-red-500 rounded-full animate-ping" style={{animationDelay: '0.2s'}}></div>
            <div className="w-2.5 h-2.5 bg-rose-400 rounded-full animate-ping" style={{animationDelay: '0.4s'}}></div>
        </div>
      </div>
    </div>
  );
});

// TRATAMENTO DE ERROS KAGE
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
          <button onClick={() => window.location.reload()} className="mt-8 bg-red-600/10 border-2 border-red-600 text-red-500 hover:bg-red-600 hover:text-white rounded-xl px-8 py-3 font-black text-[10px] uppercase tracking-widest transition-all shadow-lg">Restaurar Conexão</button>
        </div>
      );
    }
    return this.props.children;
  }
}

// SISTEMA DE TOAST (AVISOS)
export function GlobalToast({ toast }) {
  if (!toast) return null;
  const colors = toast.type === 'error' ? 'bg-red-950/90 text-red-200 border-red-600/50 shadow-[0_0_20px_rgba(220,38,38,0.4)]' : 
                 toast.type === 'success' ? 'bg-emerald-950/90 text-emerald-200 border-emerald-500/50 shadow-[0_0_20px_rgba(16,185,129,0.3)]' : 
                 'bg-[#111113]/90 text-gray-200 border-white/20 shadow-xl';
  return (
    <div className={`fixed top-6 left-1/2 -translate-x-1/2 z-[99999] px-6 py-3.5 font-black text-[10px] uppercase tracking-[0.1em] border rounded-xl backdrop-blur-xl animate-in slide-in-from-top-5 fade-in duration-300 ${colors}`}>
      <span className='text-center flex items-center gap-2'>{toast.text}</span>
    </div>
  );
}

// RODAPÉ MANGAKAGE
export function Footer() {
    return (
        <footer className="w-full bg-[#030305] border-t border-red-900/20 py-12 mt-auto pb-24 md:pb-12 flex flex-col items-center justify-center relative overflow-hidden">
            <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[300px] h-[1px] bg-gradient-to-r from-transparent via-red-600/50 to-transparent"></div>
            <div className="max-w-7xl mx-auto px-4 text-center flex flex-col items-center relative z-10">
                <KageLogo className="w-32 h-32 opacity-40 grayscale hover:grayscale-0 hover:opacity-100 transition-all duration-500" showContour={false} />
                <span className="font-black text-[10px] text-gray-700 tracking-[0.5em] uppercase mt-2">MANGAKAGE • ACERVO DAS SOMBRAS</span>
            </div>
        </footer>
    );
}

// TRANSIÇÃO DE CAPÍTULO (SOMBRIOS)
export const ChapterTransitionOverlay = React.memo(({ isVisible, chapterNumber }) => {
    if (!isVisible) return null;
    return (
        <div className="fixed inset-0 z-[99999] bg-[#030305] font-sans flex flex-col items-center justify-center animate-in fade-in duration-300">
            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-64 h-64 bg-red-600/10 blur-[80px] rounded-full"></div>
            <div className="text-red-500 font-black tracking-[0.5em] text-[10px] uppercase mb-2 animate-pulse relative z-10">
                Adentrando as Sombras
            </div>
            <h2 className="text-6xl sm:text-8xl font-black text-transparent bg-clip-text bg-gradient-to-br from-red-400 to-white tracking-tighter animate-in zoom-in-50 duration-300 relative z-10 drop-shadow-[0_0_30px_rgba(220,38,38,0.5)]">
              {chapterNumber}
            </h2>
        </div>
    );
});
