import React, { useState } from 'react';
import { User, Lock, EyeOff, Eye, ArrowRight } from 'lucide-react';

export function LoginView({ onLogin }) {
    const [showPassword, setShowPassword] = useState(false);

    return (
        <div className="min-h-screen relative flex items-center justify-center bg-[#050505] overflow-hidden font-sans">
            
            {/* BACKGROUND DIVIDIDO (VERMELHO ESQUERDA / AZUL DIREITA) */}
            <div className="absolute inset-0 flex pointer-events-none z-0">
                <div className="w-1/2 h-full bg-[url('https://placehold.co/800x1200/1a0505/ef4444?text=Manga+Left')] bg-cover bg-center opacity-30 mix-blend-screen"></div>
                <div className="w-1/2 h-full bg-[url('https://placehold.co/800x1200/050a1a/3b82f6?text=Manga+Right')] bg-cover bg-center opacity-30 mix-blend-screen"></div>
            </div>
            
            {/* LUZES AMBIENTES */}
            <div className="absolute left-0 top-1/2 -translate-y-1/2 w-64 h-full bg-red-600/20 blur-[120px] pointer-events-none z-0"></div>
            <div className="absolute right-0 top-1/2 -translate-y-1/2 w-64 h-full bg-blue-600/20 blur-[120px] pointer-events-none z-0"></div>
            {/* REFLEXO NO CHÃO */}
            <div className="absolute bottom-0 left-0 w-full h-32 bg-gradient-to-t from-white/5 to-transparent pointer-events-none z-0"></div>

            {/* CARD DE LOGIN (EFEITO GLOW BORDER) */}
            <div className="relative z-10 w-full max-w-[400px] p-[1px] rounded-[2rem] bg-gradient-to-r from-red-600 via-transparent to-blue-600 shadow-[0_30px_60px_rgba(0,0,0,0.8)] mx-4">
                <div className="bg-[#0A0D14]/95 backdrop-blur-2xl rounded-[2rem] p-8 md:p-10 w-full h-full flex flex-col">
                    
                    {/* LOGOTIPO MANGA EMPIRE */}
                    <div className="flex flex-col items-center mb-10">
                        {/* Coroa Customizada SVG */}
                        <svg className="w-14 h-10 mb-2 drop-shadow-[0_0_15px_rgba(255,255,255,0.2)]" viewBox="0 0 100 60" fill="none" xmlns="http://www.w3.org/2000/svg">
                            <path d="M10 50 L0 15 L32 30 L50 0 L68 30 L100 15 L90 50 Z" fill="url(#crown-grad)" />
                            <path d="M20 55 L80 55" stroke="url(#crown-grad)" strokeWidth="4" strokeLinecap="round" />
                            <defs>
                                <linearGradient id="crown-grad" x1="0" y1="0" x2="100" y2="0" gradientUnits="userSpaceOnUse">
                                    <stop stopColor="#ef4444" />
                                    <stop offset="0.5" stopColor="#ffffff" />
                                    <stop offset="1" stopColor="#3b82f6" />
                                </linearGradient>
                            </defs>
                        </svg>
                        
                        <h1 className="text-4xl font-black italic tracking-tighter leading-none text-white drop-shadow-md">
                            MANGA
                        </h1>
                        <h1 className="text-4xl font-black italic tracking-tighter leading-none bg-clip-text text-transparent bg-gradient-to-r from-red-500 via-red-500 to-blue-500 drop-shadow-[0_0_10px_rgba(239,68,68,0.4)]">
                            EMPIRE
                        </h1>
                    </div>

                    {/* FORMULÁRIO */}
                    <div className="flex flex-col gap-6">
                        {/* E-mail / Usuário */}
                        <div className="flex flex-col gap-2">
                            <label className="text-[10px] font-bold text-gray-400 uppercase tracking-widest pl-1">E-mail ou Usuário</label>
                            <div className="relative flex items-center group">
                                <User className="absolute left-4 w-4 h-4 text-red-500 group-focus-within:text-red-400 transition-colors" />
                                <input 
                                    type="text" 
                                    placeholder="Digite seu e-mail ou usuário" 
                                    className="w-full bg-transparent border border-white/10 rounded-xl py-3.5 pl-11 pr-4 text-sm text-white outline-none focus:border-red-500/50 transition-colors placeholder:text-gray-600"
                                />
                            </div>
                        </div>

                        {/* Senha */}
                        <div className="flex flex-col gap-2">
                            <div className="flex items-center justify-between pl-1 pr-1">
                                <label className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">Senha</label>
                                <a href="#" className="text-[10px] font-bold text-red-500 hover:text-red-400 transition-colors">Esqueceu sua senha?</a>
                            </div>
                            <div className="relative flex items-center group">
                                <Lock className="absolute left-4 w-4 h-4 text-red-500 group-focus-within:text-red-400 transition-colors" />
                                <input 
                                    type={showPassword ? "text" : "password"} 
                                    placeholder="Digite sua senha" 
                                    className="w-full bg-transparent border border-white/10 rounded-xl py-3.5 pl-11 pr-12 text-sm text-white outline-none focus:border-red-500/50 transition-colors placeholder:text-gray-600"
                                />
                                <button 
                                    type="button" 
                                    onClick={() => setShowPassword(!showPassword)} 
                                    className="absolute right-4 text-gray-500 hover:text-gray-300 transition-colors"
                                >
                                    {showPassword ? <Eye className="w-4 h-4" /> : <EyeOff className="w-4 h-4" />}
                                </button>
                            </div>
                        </div>

                        {/* Botão Entrar */}
                        <button 
                            onClick={onLogin}
                            className="mt-4 w-full bg-gradient-to-r from-red-600 to-blue-600 hover:from-red-500 hover:to-blue-500 text-white font-bold text-sm py-4 rounded-xl flex items-center justify-center gap-3 transition-all active:scale-95 shadow-[0_10px_30px_rgba(239,68,68,0.2)] group"
                        >
                            ENTRAR <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                        </button>
                    </div>

                    {/* DIVISOR OU */}
                    <div className="flex items-center gap-4 my-8">
                        <div className="flex-1 h-[1px] bg-white/10"></div>
                        <span className="text-[10px] font-bold text-gray-500 uppercase">OU</span>
                        <div className="flex-1 h-[1px] bg-white/10"></div>
                    </div>

                    {/* CRIAR CONTA */}
                    <div className="text-center">
                        <span className="text-xs text-gray-500 font-medium">Não tem uma conta? </span>
                        <button className="text-xs text-red-500 font-bold hover:text-red-400 transition-colors">Criar conta &gt;</button>
                    </div>

                </div>
            </div>
        </div>
    );
}
