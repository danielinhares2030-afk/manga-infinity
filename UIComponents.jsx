import React, { useState, useEffect, Component } from 'react';
import { AlertTriangle, CheckCircle, Info, XCircle, Loader2 } from 'lucide-react';

// ==========================================
// 1. TELA DE CARREGAMENTO INICIAL (SPLASH DO MANGA EMPIRE)
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
        <div className={`fixed inset-0 z-[99999] bg-[#050505] flex flex-col items-center justify-center font-sans transition-opacity duration-1000 ${fade ? 'opacity-100' : 'opacity-0'} overflow-hidden`}>
            
            {/* TEXTURAS E LUZES DE FUNDO (Estilo Empire) */}
            <div className="absolute inset-0 pointer-events-none z-0 mix-blend-screen opacity-40">
                <div className="absolute top-[10%] left-[-10%] w-[120%] h-[1px] bg-red-600/30 transform rotate-45 blur-[1px]"></div>
                <div className="absolute top-[30%] left-[-20%] w-[150%] h-[2px] bg-blue-500/20 transform rotate-[35deg] blur-[2px]"></div>
                <div className="absolute bottom-[20%] right-[-10%] w-[120%] h-[1px] bg-red-500/20 transform -rotate-45 blur-[1px]"></div>
                <div className="absolute bottom-[40%] right-[-20%] w-[150%] h-[2px] bg-blue-400/10 transform -rotate-[30deg]"></div>
                
                {/* Luzes de fundo (Vermelho e Azul) */}
                <div className="absolute bottom-0 left-0 w-64 h-64 bg-red-600/20 blur-[100px]"></div>
                <div className="absolute top-0 right-0 w-64 h-64 bg-blue-600/20 blur-[100px]"></div>
            </div>

            <div className={`relative z-10 w-full flex flex-col items-center transition-all duration-1000 ease-out ${fade ? 'scale-100' : 'scale-90 opacity-0'}`}>
                
                {/* LOGO CENTRAL - MANGA EMPIRE */}
                <div className="flex flex-col items-center justify-center mb-24">
                    {/* Coroa SVG */}
                    <svg className="w-20 h-14 mb-4 drop-shadow-[0_0_15px_rgba(255,255,255,0.1)]" viewBox="0 0 100 60" fill="none" xmlns="http://www.w3.org/2000/svg">
                        <path d="M10 50 L0 15 L32 30 L50 0 L68 30 L100 15 L90 50 Z" fill="url(#crown-splash-grad)" />
                        <path d="M20 55 L80 55" stroke="url(#crown-splash-grad)" strokeWidth="4" strokeLinecap="round" />
                        <defs>
                            <linearGradient id="crown-splash-grad" x1="0" y1="0" x2="100" y2="0" gradientUnits="userSpaceOnUse">
                                <stop stopColor="#ef4444" />
                                <stop offset="0.5" stopColor="#ffffff" />
                                <stop offset="1" stopColor="#3b82f6" />
                            </linearGradient>
                        </defs>
                    </svg>
                    
                    <h1 className="text-5xl md:text-6xl font-black italic tracking-tighter leading-none text-white drop-shadow-[0_5px_10px_rgba(0,0,0,0.8)]">
                        MANGA
                    </h1>
                    <h1 className="text-5xl md:text-6xl font-black italic tracking-tighter leading-none bg-clip-text text-transparent bg-gradient-to-r from-red-600 via-red-500 to-blue-600 drop-shadow-[0_0_15px_rgba(239,68,68,0.4)]">
                        EMPIRE
                    </h1>
                </div>

                {/* TEXTO DE CARREGAMENTO & BARRA */}
                <div className="flex flex-col items-center w-full max-w-[280px]">
                    <p className="text-[10px] text-gray-400 font-bold tracking-[0.4em] uppercase mb-4 opacity-90">
                        CARREGANDO...
                    </p>
                    
                    <div className="relative w-full h-[2px] bg-white/10 rounded-full overflow-hidden">
                        {/* Preenchimento da Barra */}
                        <div 
                            className="absolute top-0 left-0 h-full bg-gradient-to-r from-red-600 to-red-400 shadow-[0_0_10px_rgba(239,68,68,1)] transition-all duration-[30ms] ease-linear" 
                            style={{ width: `${progress}%` }}
                        ></div>
                        
                        {/* Brilho Verde/Branco na ponta da barra */}
                        <div 
                            className="absolute top-1/2 -translate-y-1/2 w-8 h-[2px] bg-gradient-to-r from-transparent via-white to-green-300 shadow-[0_0_10px_rgba(134,239,172,1)] transition-all duration-[30ms] ease-linear"
                            style={{ left: `calc(${progress}% - 16px)` }}
                        ></div>
                    </div>
                </div>

            </div>
        </div>
    );
});

// ==========================================
// 2. LOGOTIPO DO EMPIRE (Coroa para o Footer)
// ==========================================
export const EmpireLogo = React.memo(({ className = "w-10 h-8" }) => {
    return (
        <svg className={className} viewBox="0 0 100 60" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path d="M10 50 L0 15 L32 30 L50 0 L68 30 L100 15 L90 50 Z" fill="url(#crown-footer-grad)" />
            <path d="M20 55 L80 55" stroke="url(#crown-footer-grad)" strokeWidth="4" strokeLinecap="round" />
            <defs>
                <linearGradient id="crown-footer-grad" x1="0" y1="0" x2="100" y2="0" gradientUnits="userSpaceOnUse">
                    <stop stopColor="#ef4444" />
                    <stop offset="0.5" stopColor="#ffffff" />
                    <stop offset="1" stopColor="#3b82f6" />
                </linearGradient>
            </defs>
        </svg>
    );
});

// ==========================================
// 3. PROTEÇÃO CONTRA CRASHES (ERROR BOUNDARY)
// ==========================================
export class ErrorBoundary extends Component {
    constructor(props) { 
        super(props); 
        this.state = { hasError: false, error: null }; 
    }
    
    static getDerivedStateFromError(error) { 
        return { hasError: true, error }; 
    }
    
    componentDidCatch(error, errorInfo) {
        console.error("Erro capturado pelo ErrorBoundary:", error, errorInfo);
    }
    
    render() {
        if (this.state.hasError) {
            return (
                <div className="min-h-screen bg-[#050505] p-10 flex flex-col items-center justify-center font-sans border-t-[4px] border-red-600 relative overflow-hidden">
                    <AlertTriangle className="w-16 h-16 mb-4 text-red-500 animate-pulse drop-shadow-[0_0_15px_rgba(239,68,68,0.5)] relative z-10"/>
                    <h1 className="text-2xl font-black uppercase tracking-widest text-white text-center relative z-10">Falha no Sistema (Erro)</h1>
                    <p className="mt-2 text-gray-500 text-xs font-bold text-center max-w-lg relative z-10">{this.state.error?.message || "countdown is not defined"}</p>
                    <button onClick={() => window.location.reload()} className="mt-8 bg-[#111] border border-red-900/50 text-red-400 hover:bg-red-600 hover:text-white rounded-xl px-8 py-4 font-black text-[10px] uppercase tracking-widest transition-all shadow-lg relative z-10">
                        Restaurar Conexão
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
    let colorClass = "bg-[#0A0A0A] text-blue-200 border-blue-900/50 shadow-[0_0_20px_rgba(59,130,246,0.2)]";

    if (isError) {
        Icon = XCircle;
        colorClass = "bg-[#0A0A0A] text-red-200 border-red-900/50 shadow-[0_0_20px_rgba(239,68,68,0.2)]";
    } else if (isSuccess) {
        Icon = CheckCircle;
        colorClass = "bg-[#0A0A0A] text-green-200 border-green-900/50 shadow-[0_0_20px_rgba(34,197,94,0.2)]";
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
        <footer className="w-full bg-[#050505] border-t border-white/5 py-12 mt-auto pb-24 md:pb-12 flex flex-col items-center justify-center relative overflow-hidden">
            <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[300px] h-[1px] bg-gradient-to-r from-transparent via-red-500/50 to-transparent"></div>
            <div className="max-w-7xl mx-auto px-4 text-center flex flex-col items-center relative z-10">
                <EmpireLogo className="w-12 h-10 opacity-40 grayscale hover:grayscale-0 hover:opacity-100 transition-all duration-500 mb-4" />
                <span className="font-black text-[10px] text-gray-500 tracking-[0.5em] uppercase mt-2">MANGA EMPIRE</span>
                <span className="font-bold text-[8px] text-gray-700 tracking-[0.2em] uppercase mt-1">SISTEMA DE LEITURA</span>
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
        <div className="fixed inset-0 z-[99999] bg-[#050505] font-sans flex flex-col items-center justify-center overflow-hidden animate-in fade-in duration-300">
            <div className="relative z-10 flex flex-col items-center animate-in zoom-in-95 duration-500">
                {/* Loader Style Empire */}
                <div className="relative w-12 h-12 mb-6">
                    <div className="absolute inset-0 rounded-full border-t-2 border-r-2 border-red-500 border-l-2 border-b-2 border-transparent animate-[spin_1s_linear_infinite] shadow-[0_0_15px_rgba(239,68,68,0.5)]"></div>
                    <div className="absolute inset-2 rounded-full border-b-2 border-l-2 border-blue-500 border-r-2 border-t-2 border-transparent animate-[spin_1.5s_linear_infinite_reverse]"></div>
                </div>
                <div className="text-gray-400 font-black tracking-[0.5em] text-[10px] uppercase mb-3 animate-pulse">Carregando</div>
                <h2 className="text-4xl sm:text-6xl font-black italic text-white tracking-tighter drop-shadow-lg">CAPÍTULO {chapterNumber || '...'}</h2>
            </div>
        </div>
    );
});
