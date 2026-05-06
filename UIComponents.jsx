import React, { useState, useEffect } from 'react';
import { AlertTriangle, CheckCircle, Info, XCircle, Loader2 } from 'lucide-react';

// ==========================================
// 1. TELA DE CARREGAMENTO INICIAL (SPLASH)
// ==========================================
export const SplashScreen = React.memo(() => {
    const [fade, setFade] = useState(false);
    const [progress, setProgress] = useState(0);

    useEffect(() => { 
        const t1 = setTimeout(() => setFade(true), 50); 
        const duration = 2500;
        const interval = 30;
        const steps = duration / interval;
        let currentStep = 0;
        const timer = setInterval(() => {
            currentStep++;
            setProgress(Math.min(100, Math.floor((currentStep / steps) * 100)));
            if (currentStep >= steps) clearInterval(timer);
        }, interval);

        return () => { clearTimeout(t1); clearInterval(timer); };
    }, []);

    return (
        <div className={`fixed inset-0 z-[99999] bg-[#020202] flex flex-col items-center justify-center font-sans transition-opacity duration-1000 ${fade ? 'opacity-100' : 'opacity-0'} overflow-hidden`}>
            
            {/* LUZES DE FUNDO PULSANTES (Azul, Vermelho, Verde) */}
            <div className="absolute inset-0 pointer-events-none z-0 overflow-hidden mix-blend-screen">
                <div className="absolute top-1/4 left-1/4 w-[40vw] h-[40vw] max-w-[300px] max-h-[300px] bg-blue-600/10 blur-[80px] rounded-full animate-[pulse_3s_ease-in-out_infinite]"></div>
                <div className="absolute bottom-1/4 right-1/4 w-[35vw] h-[35vw] max-w-[250px] max-h-[250px] bg-red-600/10 blur-[70px] rounded-full animate-[pulse_2.5s_ease-in-out_infinite_reverse]"></div>
                <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[30vw] h-[30vw] max-w-[200px] max-h-[200px] bg-green-600/10 blur-[60px] rounded-full animate-[pulse_4s_ease-in-out_infinite]"></div>
            </div>

            <div className={`relative z-10 w-full flex flex-col items-center transition-all duration-1000 ease-out ${fade ? 'scale-100' : 'scale-90 opacity-0'}`}>
                
                {/* ANIMAÇÃO DOS ANÉIS ORBITAIS */}
                <div className="relative w-32 h-32 md:w-40 md:h-40 flex items-center justify-center mb-12">
                    {/* Anel Azul */}
                    <div className="absolute inset-0 rounded-full border-t-2 border-r-2 border-blue-500 border-l-2 border-b-2 border-transparent animate-[spin_1s_linear_infinite] shadow-[0_0_15px_rgba(59,130,246,0.5)]"></div>
                    {/* Anel Vermelho */}
                    <div className="absolute inset-2 rounded-full border-b-2 border-l-2 border-red-500 border-r-2 border-t-2 border-transparent animate-[spin_1.5s_linear_infinite_reverse] shadow-[0_0_15px_rgba(239,68,68,0.5)]"></div>
                    {/* Anel Verde */}
                    <div className="absolute inset-4 rounded-full border-t-2 border-r-2 border-green-500 border-l-2 border-b-2 border-transparent animate-[spin_2s_linear_infinite] shadow-[0_0_15px_rgba(34,197,94,0.5)]"></div>
                    {/* Núcleo Branco */}
                    <div className="w-3 h-3 bg-white rounded-full shadow-[0_0_20px_rgba(255,255,255,1)] animate-pulse"></div>
                </div>

                {/* TEXTO DO LOGOTIPO */}
                <div className="flex flex-col items-center justify-center relative z-20 mb-16">
                    <div className="flex items-center text-white text-5xl md:text-6xl font-black tracking-widest leading-none drop-shadow-lg">
                        NE<span className="text-blue-500 mx-1 drop-shadow-[0_0_15px_rgba(59,130,246,0.8)]">X</span>O
                    </div>
                    <div className="flex items-center mt-3 opacity-80">
                        <span className="text-white text-xs font-black tracking-[0.8em] uppercase ml-2">S C A N</span>
                    </div>
                </div>

                {/* BARRA DE PROGRESSO CINEMÁTICA */}
                <div className="flex flex-col items-center w-full max-w-[240px]">
                    <p className="text-[9px] text-gray-400 font-bold tracking-[0.4em] uppercase mb-4 opacity-80 flex items-center gap-2">
                        <Loader2 className="w-3 h-3 animate-spin text-blue-500" /> Iniciando
                    </p>
                    
                    <div className="relative w-full h-[2px] bg-[#111] rounded-full overflow-hidden">
                        {/* Preenchimento Azul com ponta Vermelha/Verde */}
                        <div 
                            className="absolute top-0 left-0 h-full bg-gradient-to-r from-blue-500 via-green-500 to-red-500 shadow-[0_0_10px_rgba(59,130,246,1)] transition-all duration-[30ms] ease-linear" 
                            style={{ width: `${progress}%` }}
                        ></div>
                        {/* Ponto de Luz na Ponta */}
                        <div 
                            className="absolute top-1/2 -translate-y-1/2 w-4 h-[3px] bg-white rounded-full shadow-[0_0_15px_rgba(255,255,255,1)] transition-all duration-[30ms] ease-linear"
                            style={{ left: `calc(${progress}% - 8px)` }}
                        ></div>
                    </div>
                </div>

            </div>
        </div>
    );
});

// ==========================================
// 2. LOGOTIPO DO NEXO (SVG Customizado)
// ==========================================
export const NexoLogo = React.memo(({ className = "w-64 h-64" }) => {
    return (
        <svg className={className} viewBox="0 0 100 100" fill="none" xmlns="http://www.w3.org/2000/svg">
            {/* Lado Branco */}
            <path d="M 30 75 V 25 L 70 65" stroke="white" strokeWidth="14" strokeLinecap="round" strokeLinejoin="round" />
            {/* Lado Azul */}
            <path d="M 70 25 V 75 L 30 35" stroke="#3B82F6" strokeWidth="14" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
    );
});

// ==========================================
// 3. PROTEÇÃO CONTRA CRASHES (ERROR BOUNDARY)
// ==========================================
export class ErrorBoundary extends React.Component {
    constructor(props) { super(props); this.state = { hasError: false, error: null }; }
    
    static getDerivedStateFromError(error) { 
        return { hasError: true, error }; 
    }
    
    componentDidCatch(error, errorInfo) {
        console.error("Erro capturado pelo ErrorBoundary:", error, errorInfo);
    }
    
    render() {
        if (this.state.hasError) {
            return (
                <div className="min-h-screen bg-[#020202] p-10 flex flex-col items-center justify-center font-sans border-t-[4px] border-red-600 relative overflow-hidden">
                    <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,rgba(220,38,38,0.15),transparent_60%)]"></div>
                    <AlertTriangle className="w-16 h-16 mb-6 text-red-500 animate-pulse drop-shadow-[0_0_20px_rgba(220,38,38,0.8)] relative z-10"/>
                    <h1 className="text-2xl font-black uppercase tracking-widest text-white text-center relative z-10">Falha Crítica</h1>
                    <p className="mt-3 text-gray-400 text-xs font-bold text-center max-w-md leading-relaxed relative z-10">
                        O sistema encontrou um erro e precisou ser interrompido para evitar instabilidades.
                        <br/><span className="text-red-400/80 mt-2 block font-mono bg-black/50 p-2 rounded">{this.state.error?.message}</span>
                    </p>
                    <button onClick={() => window.location.reload()} className="mt-10 bg-red-600 hover:bg-red-500 text-white rounded-xl px-10 py-4 font-black text-[10px] uppercase tracking-widest transition-all shadow-[0_0_20px_rgba(220,38,38,0.4)] relative z-10 active:scale-95">
                        Reiniciar Sistema
                    </button>
                </div>
            );
        }
        return this.props.children;
    }
}

// ==========================================
// 4. SISTEMA DE ALERTAS (GLOBAL TOAST)
// ==========================================
export function GlobalToast({ toast }) {
    if (!toast) return null;

    const isError = toast.type === 'error';
    const isSuccess = toast.type === 'success';

    let Icon = Info;
    // Padrão Azul
    let colorClass = "bg-[#050508]/90 text-blue-100 border-blue-600/50 shadow-[0_0_20px_rgba(59,130,246,0.3)]";

    if (isError) {
        Icon = XCircle;
        // Padrão Vermelho
        colorClass = "bg-[#050508]/90 text-red-100 border-red-600/50 shadow-[0_0_20px_rgba(220,38,38,0.4)]";
    } else if (isSuccess) {
        Icon = CheckCircle;
        // Padrão Verde
        colorClass = "bg-[#050508]/90 text-green-100 border-green-500/50 shadow-[0_0_20px_rgba(34,197,94,0.3)]";
    }

    return (
        <div className={`fixed top-6 left-1/2 -translate-x-1/2 z-[99999] px-6 py-3.5 font-black text-[10px] uppercase tracking-[0.1em] border rounded-xl backdrop-blur-xl animate-in slide-in-from-top-5 fade-in duration-300 w-max max-w-[90vw] ${colorClass}`}>
            <span className='text-center flex items-center gap-2.5'>
                <Icon className="w-4 h-4 flex-shrink-0" />
                <span className="truncate">{toast.text}</span>
            </span>
        </div>
    );
}

// ==========================================
// 5. RODAPÉ DO SITE (FOOTER)
// ==========================================
export function Footer() {
    return (
        <footer className="w-full bg-[#020202] border-t border-white/5 py-12 mt-auto pb-24 md:pb-12 flex flex-col items-center justify-center relative overflow-hidden">
            <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[300px] h-[1px] bg-gradient-to-r from-transparent via-blue-500/50 to-transparent"></div>
            <div className="max-w-7xl mx-auto px-4 text-center flex flex-col items-center relative z-10">
                <NexoLogo className="w-16 h-16 opacity-30 grayscale hover:grayscale-0 hover:opacity-100 transition-all duration-500 mb-5" />
                <span className="font-black text-[10px] text-gray-500 tracking-[0.5em] uppercase mt-2">NEXO SCAN</span>
                <span className="font-bold text-[8px] text-gray-700 tracking-[0.2em] uppercase mt-1">SISTEMA CIBERNÉTICO</span>
            </div>
        </footer>
    );
}

// ==========================================
// 6. TRANSIÇÃO DE CAPÍTULOS (LEITOR)
// ==========================================
export const ChapterTransitionOverlay = React.memo(({ isVisible, chapterNumber }) => {
    if (!isVisible) return null;
    
    return (
        <div className="fixed inset-0 z-[99999] bg-[#020202] font-sans flex flex-col items-center justify-center overflow-hidden animate-in fade-in duration-300">
            <div className="relative z-10 flex flex-col items-center animate-in zoom-in-95 duration-500">
                <div className="relative w-14 h-14 mb-8">
                    <div className="absolute inset-0 rounded-full border-t-2 border-r-2 border-blue-500 border-l-2 border-b-2 border-transparent animate-[spin_1s_linear_infinite] shadow-[0_0_15px_rgba(59,130,246,0.5)]"></div>
                    <div className="absolute inset-2 rounded-full border-b-2 border-l-2 border-green-500 border-r-2 border-t-2 border-transparent animate-[spin_1.5s_linear_infinite_reverse]"></div>
                </div>
                <div className="text-gray-400 font-black tracking-[0.5em] text-[10px] uppercase mb-3 animate-pulse">Sincronizando</div>
                <h2 className="text-4xl sm:text-5xl font-black text-white tracking-tighter drop-shadow-lg">CAPÍTULO {chapterNumber || '...'}</h2>
            </div>
        </div>
    );
});
