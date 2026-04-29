import React, { useState, useEffect } from 'react';
import { AlertTriangle } from 'lucide-react';

export const KageLogo = React.memo(({ className = "w-64 h-64", showContour = false }) => {
  return (
    <div className={`relative flex items-center justify-center ${className}`}>
      {showContour && (
         <div className="absolute inset-0 rounded-full border-[3px] border-transparent border-t-red-600 border-b-red-600 animate-[spin_3s_linear_infinite] shadow-[0_0_20px_rgba(220,38,38,0.5)] z-0"></div>
      )}
      <img 
        src="https://i.ibb.co/gF4zyvkk/Gemini-Generated-Image-gj2yhugj2yhugj2y-removebg-preview.png" 
        alt="Mangakage Mascot" 
        className="relative z-10 w-full h-full object-contain drop-shadow-[0_5px_15px_rgba(220,38,38,0.4)]"
      />
    </div>
  );
});

export const SplashScreen = React.memo(() => {
  const [fade, setFade] = useState(false);
  useEffect(() => { const t1 = setTimeout(() => setFade(true), 50); return () => clearTimeout(t1); }, []);
  
  return (
    <div className={`fixed inset-0 z-[9999] bg-[#050505] flex items-center justify-center font-sans transition-opacity duration-700 ${fade ? 'opacity-100' : 'opacity-0'}`}>
      <style>{`
        body, html { background-color: #050505 !important; }
        .bg-opening {
            background-image: url('https://images.alphacoders.com/134/1341053.png');
            background-size: cover;
            background-position: center;
        }
      `}</style>
      
      {/* FUNDO DA ABERTURA IGUAL AO LOGIN */}
      <div className="absolute inset-0 bg-opening">
          <div className="absolute inset-0 bg-gradient-to-b from-black/60 via-black/40 to-[#050505]"></div>
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,rgba(220,38,38,0.15)_0%,transparent_80%)]"></div>
      </div>

      <div className={`transition-all duration-1000 ease-out z-10 flex flex-col items-center ${fade ? 'scale-100' : 'scale-90 opacity-0'}`}>
        <div className="w-56 h-56 mb-4 drop-shadow-[0_0_30px_rgba(220,38,38,0.5)]">
            <KageLogo className="w-full h-full" showContour={false} />
        </div>
        
        <h1 className="text-3xl font-black text-white tracking-[0.2em] italic mb-10">
            MANGA<span className="text-red-600">KAGE</span>
        </h1>
        
        <div className="w-40 h-[2px] bg-white/10 rounded-full overflow-hidden relative">
           <div className="absolute inset-0 bg-gradient-to-r from-red-600 to-red-400 animate-[loading_2s_ease-in-out_infinite] rounded-full shadow-[0_0_10px_rgba(220,38,38,0.8)]"></div>
        </div>
        <style>{`@keyframes loading { 0% { width: 0%; left: -100%; } 50% { width: 100%; left: 0%; } 100% { width: 0%; left: 100%; } }`}</style>
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
          <button onClick={() => window.location.reload()} className="mt-8 bg-red-600/10 border-2 border-red-600 text-red-500 hover:bg-red-600 hover:text-white rounded-xl px-8 py-3 font-black text-[10px] uppercase tracking-widest transition-all shadow-lg">Restaurar Conexão</button>
        </div>
      );
    }
    return this.props.children;
  }
}

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

export function Footer() {
    return (
        <footer className="w-full bg-[#030305] border-t border-red-900/20 py-12 mt-auto pb-24 md:pb-12 flex flex-col items-center justify-center relative overflow-hidden">
            <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[300px] h-[1px] bg-gradient-to-r from-transparent via-red-600/50 to-transparent"></div>
            <div className="max-w-7xl mx-auto px-4 text-center flex flex-col items-center relative z-10">
                <KageLogo className="w-32 h-32 opacity-40 grayscale hover:grayscale-0 hover:opacity-100 transition-all duration-500" showContour={false} />
                <span className="font-black text-[10px] text-gray-700 tracking-[0.5em] uppercase mt-2">MANGAKAGE • DOMÍNIO DAS SOMBRAS</span>
            </div>
        </footer>
    );
}

export const ChapterTransitionOverlay = React.memo(({ isVisible, chapterNumber }) => {
    if (!isVisible) return null;
    return (
        <div className="fixed inset-0 z-[99999] bg-[#030305] font-sans flex flex-col items-center justify-center overflow-hidden animate-in fade-in duration-300">
            <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,_var(--tw-gradient-stops))] from-red-900/20 via-[#030305] to-[#030305]"></div>
            
            <div className="relative z-10 flex flex-col items-center animate-in zoom-in-95 duration-500">
                <div className="w-12 h-12 border-4 border-red-600/30 border-t-red-600 rounded-full animate-spin mb-6 shadow-[0_0_15px_rgba(220,38,38,0.5)]"></div>
                <div className="text-red-500 font-black tracking-[0.5em] text-[10px] uppercase mb-3 animate-pulse">
                    Carregando
                </div>
                <h2 className="text-4xl sm:text-6xl font-black text-white tracking-tighter drop-shadow-lg">
                  CAPÍTULO {chapterNumber}
                </h2>
            </div>
        </div>
    );
});
