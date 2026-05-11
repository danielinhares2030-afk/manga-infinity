import React, { useState, useEffect, useMemo } from 'react';
import { Star, Clock, ChevronRight, Play, ChevronLeft, Sparkles, Moon, Flame } from 'lucide-react';
import { timeAgo } from './helpers';

export function HomeView({ mangas, onNavigate, dataSaver }) {
    const [currentSlide, setCurrentSlide] = useState(0);

    const populares = useMemo(() => {
        return [...(mangas || [])]
            .sort((a, b) => (Number(b.rating) || 0) - (Number(a.rating) || 0))
            .slice(0, 10);
    }, [mangas]);

    const destaques = useMemo(() => {
        return [...(mangas || [])]
            .filter(m => m.coverUrl)
            .sort((a, b) => (Number(b.rating) || 0) - (Number(a.rating) || 0))
            .slice(0, 5);
    }, [mangas]);

    const recentes = useMemo(() => {
        return [...(mangas || [])].sort((a, b) => b.createdAt - a.createdAt).slice(0, 18);
    }, [mangas]);

    useEffect(() => {
        if (destaques.length === 0) return;
        const timer = setInterval(() => {
            setCurrentSlide((prev) => (prev + 1) % destaques.length);
        }, 6000);
        return () => clearInterval(timer);
    }, [destaques.length]);

    return (
        <div className="pb-24 animate-in fade-in duration-700 bg-[#050505] min-h-screen relative font-sans text-white overflow-x-hidden selection:bg-red-500/30">
            
            {/* CARROSSEL HERO - CINEMATOGRÁFICO */}
            {destaques.length > 0 && (
                <div className="relative w-full h-[60vh] md:h-[75vh] max-h-[850px] min-h-[500px] overflow-hidden mb-12 bg-[#050505]">
                    {destaques.map((manga, index) => (
                        <div key={manga.id} className={`absolute inset-0 w-full h-full transition-all duration-1000 ease-in-out ${index === currentSlide ? 'opacity-100 z-10 scale-100' : 'opacity-0 z-0 scale-105'}`}>
                            
                            <div className="absolute inset-0 bg-[#050505]">
                                <img src={manga.coverUrl} className="w-full h-full object-cover opacity-[0.25] mix-blend-screen blur-[2px]" alt="Background" loading="lazy" />
                            </div>
                            <div className="absolute inset-0 bg-gradient-to-t from-[#050505] via-[#050505]/50 to-transparent" />
                            <div className="absolute inset-0 bg-gradient-to-r from-[#050505] via-[#050505]/80 to-transparent" />
                            
                            <div className="absolute bottom-0 left-0 w-full p-6 md:p-12 max-w-7xl mx-auto flex items-center md:items-end gap-10 lg:gap-16 h-full md:h-auto pt-32 md:pt-0">
                                
                                {/* Capa 3D Hero */}
                                <div className="hidden md:block w-52 lg:w-64 flex-shrink-0 relative group cursor-pointer transition-transform duration-700 hover:-translate-y-3" onClick={() => onNavigate('details', manga)}>
                                    <div className="absolute -inset-1 bg-gradient-to-b from-red-600 to-red-900 rounded-[2rem] blur-2xl opacity-30 group-hover:opacity-60 transition-opacity duration-500"></div>
                                    <img src={manga.coverUrl} className="relative rounded-2xl shadow-[0_30px_60px_rgba(0,0,0,0.9)] border border-white/10 z-10 object-cover aspect-[2/3] w-full" alt="Capa" loading="lazy" />
                                </div>

                                {/* Textos do Hero */}
                                <div className="flex-1 relative z-20 flex flex-col justify-end md:justify-start h-full md:h-auto pb-10 md:pb-6">
                                    <div className="flex items-center gap-4 mb-5 animate-in slide-in-from-bottom-4 fade-in duration-700">
                                        <span className="bg-red-600/10 border border-red-500/30 text-red-500 text-[10px] font-black px-3.5 py-1.5 rounded-lg uppercase tracking-[0.2em] backdrop-blur-md">
                                            Obra em Destaque
                                        </span>
                                        <span className="flex items-center gap-1.5 text-amber-400 text-xs font-black bg-black/50 backdrop-blur-md px-3.5 py-1.5 rounded-lg border border-white/10">
                                            <Star className="w-3.5 h-3.5 fill-amber-400 drop-shadow-[0_0_5px_rgba(251,191,36,0.5)]"/> {manga.rating ? Number(manga.rating).toFixed(1) : "5.0"}
                                        </span>
                                    </div>
                                    
                                    <h2 className="text-4xl md:text-6xl lg:text-7xl font-black text-white mb-4 line-clamp-2 tracking-tighter uppercase italic drop-shadow-[0_5px_10px_rgba(0,0,0,0.5)] animate-in slide-in-from-bottom-6 fade-in duration-700 delay-100">
                                        {manga.title}
                                    </h2>
                                    
                                    <p className="text-gray-300 text-sm md:text-base line-clamp-3 mb-10 max-w-2xl font-medium leading-relaxed animate-in slide-in-from-bottom-8 fade-in duration-700 delay-200">
                                        {manga.synopsis || "Mergulhe nesta história épica e descubra os segredos que aguardam. Adentre as páginas desta obra prima."}
                                    </p>
                                    
                                    <button onClick={() => onNavigate('details', manga)} className="bg-white text-black hover:bg-red-600 hover:text-white font-black px-10 py-4 rounded-xl flex items-center justify-center gap-3 transition-all duration-300 active:scale-95 text-xs uppercase tracking-widest shadow-[0_10px_30px_rgba(255,255,255,0.2)] hover:shadow-[0_10px_30px_rgba(220,38,38,0.4)] w-full md:w-max group animate-in slide-in-from-bottom-10 fade-in duration-700 delay-300">
                                        <Play className="w-4 h-4 fill-current group-hover:scale-110 transition-transform" /> Iniciar Leitura
                                    </button>
                                </div>
                            </div>
                        </div>
                    ))}
                    
                    <div className="absolute bottom-6 right-6 md:bottom-12 md:right-12 z-30 flex gap-2.5">
                        {destaques.map((_, i) => (
                            <button key={i} onClick={() => setCurrentSlide(i)} className={`h-1.5 rounded-full transition-all duration-500 ease-out ${i === currentSlide ? 'w-12 bg-red-600 shadow-[0_0_15px_rgba(220,38,38,0.8)]' : 'w-3 bg-white/20 hover:bg-white/50'}`} />
                        ))}
                    </div>
                </div>
            )}

            {/* SEÇÃO: EM ALTA */}
            <div className="px-4 md:px-8 max-w-7xl mx-auto relative z-10 mb-16">
                <div className="flex items-center justify-between mb-8">
                    <h2 className="text-2xl font-black text-white flex items-center gap-3 uppercase tracking-tight">
                        <Flame className="w-6 h-6 text-red-500 animate-pulse drop-shadow-[0_0_10px_rgba(220,38,38,0.6)]" /> Em Alta
                    </h2>
                    <button onClick={() => onNavigate('popular')} className="text-[10px] font-black text-gray-500 hover:text-red-500 uppercase tracking-[0.2em] flex items-center transition-colors group">
                        Panteão Kage <ChevronRight className="w-4 h-4 ml-1 group-hover:translate-x-1 transition-transform" />
                    </button>
                </div>
                
                <div className="flex overflow-x-auto gap-4 md:gap-6 pb-8 snap-x snap-mandatory no-scrollbar items-stretch" style={{ WebkitOverflowScrolling: 'touch' }}>
                    {populares.map((manga, index) => (
                        <div key={manga.id} onClick={() => onNavigate('details', manga)} className="flex-none w-[130px] sm:w-[150px] md:w-[170px] snap-start cursor-pointer group relative">
                            <div className={`relative aspect-[2/3] rounded-[1.25rem] overflow-hidden bg-[#0a0a0c] border border-white/5 transition-all duration-500 group-hover:border-red-500/50 group-hover:shadow-[0_15px_30px_rgba(220,38,38,0.2)] ${dataSaver ? 'blur-[1px]' : ''}`}>
                                <img src={manga.coverUrl} alt={manga.title} className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700 ease-out" loading="lazy" />
                                
                                <div className="absolute top-2 left-2 w-8 h-8 rounded-lg bg-black/80 backdrop-blur-md border border-white/10 flex items-center justify-center shadow-lg z-10">
                                    <span className="text-[11px] font-black text-white">#{index + 1}</span>
                                </div>

                                <div className="absolute top-2 right-2 bg-black/80 backdrop-blur-md px-2 py-1.5 rounded-lg border border-white/10 flex items-center gap-1 shadow-lg">
                                    <Star className="w-3 h-3 text-amber-400 fill-amber-400" />
                                    <span className="text-[10px] font-black text-white">{manga.rating ? Number(manga.rating).toFixed(1) : "5.0"}</span>
                                </div>
                                <div className="absolute inset-0 bg-gradient-to-t from-[#050505] via-transparent to-transparent opacity-90 group-hover:opacity-100 transition-opacity"></div>
                                
                                <div className="absolute inset-0 bg-black/40 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-300 backdrop-blur-[2px]">
                                    <div className="w-14 h-14 rounded-full bg-red-600 text-white flex items-center justify-center shadow-[0_0_25px_rgba(220,38,38,0.6)] transform scale-50 group-hover:scale-100 transition-transform duration-300 ease-out">
                                        <Play className="w-6 h-6 fill-current ml-1" />
                                    </div>
                                </div>
                            </div>
                            <h3 className="text-sm font-bold text-gray-300 mt-4 line-clamp-1 group-hover:text-red-400 transition-colors px-1">{manga.title}</h3>
                        </div>
                    ))}
                </div>
            </div>

            {/* SEÇÃO: LANÇAMENTOS */}
            <div className="px-4 md:px-8 max-w-7xl mx-auto relative z-10">
                <div className="flex items-center justify-between gap-6 mb-8 border-t border-white/5 pt-10">
                    <h2 className="text-2xl font-black text-white flex items-center gap-3 uppercase tracking-tight">
                        <Sparkles className="w-6 h-6 text-blue-500 drop-shadow-[0_0_10px_rgba(59,130,246,0.6)]" /> Lançamentos
                    </h2>
                </div>

                <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-4 md:gap-6">
                    {recentes.length > 0 ? recentes.map(manga => (
                        <div key={manga.id} onClick={() => onNavigate('details', manga)} className="cursor-pointer group flex flex-col">
                            <div className={`relative aspect-[2/3] rounded-[1.25rem] overflow-hidden bg-[#0a0a0c] border border-white/5 transition-all duration-500 group-hover:border-blue-500/40 group-hover:shadow-[0_15px_30px_rgba(59,130,246,0.15)] ${dataSaver ? 'blur-[1px]' : ''}`}>
                                <img src={manga.coverUrl} className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700 ease-out" loading="lazy" />
                                
                                {manga.chapters && manga.chapters.length > 0 && (
                                    <div className="absolute top-2 left-2 bg-blue-600/90 backdrop-blur-md text-white text-[9px] font-black px-2.5 py-1.5 rounded-lg uppercase tracking-widest shadow-lg">
                                        Cap {manga.chapters[0].number}
                                    </div>
                                )}
                                
                                <div className="absolute bottom-0 left-0 w-full bg-gradient-to-t from-[#050505] via-[#050505]/80 to-transparent p-3 pt-12">
                                    <p className="text-[9px] text-gray-400 font-bold uppercase tracking-widest flex items-center gap-1.5">
                                        <Clock className="w-3 h-3 text-blue-500"/> {timeAgo(manga.createdAt)}
                                    </p>
                                </div>
                                <div className="absolute inset-0 bg-gradient-to-t from-blue-900/40 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none"></div>
                            </div>
                            <h3 className="font-bold text-sm text-gray-300 line-clamp-2 leading-snug group-hover:text-blue-400 transition-colors px-1 mt-3">{manga.title}</h3>
                        </div>
                    )) : (
                        <div className="col-span-full py-24 flex flex-col items-center justify-center bg-[#0a0a0c] rounded-[2rem] border border-white/5 border-dashed">
                            <Moon className="w-12 h-12 text-gray-700 mx-auto mb-4" />
                            <p className="text-gray-500 font-black text-[10px] uppercase tracking-[0.2em] text-center">O vazio domina. Nenhum lançamento ainda.</p>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}
