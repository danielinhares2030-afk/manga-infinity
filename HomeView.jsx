import React, { useState, useEffect, useMemo } from 'react';
import { Star, Clock, ListFilter, ChevronRight, Play, ChevronLeft, Sparkles, Moon, Zap, Flame } from 'lucide-react';
import { timeAgo } from './helpers';

export function HomeView({ mangas, onNavigate, dataSaver }) {
    const [filter, setFilter] = useState('Manhwa');
    const [currentSlide, setCurrentSlide] = useState(0);
    const [currentPage, setCurrentPage] = useState(1);
    const itemsPerPage = 12;

    // Memoização para evitar recálculos
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

    const filterOptions = ['Manhwa', 'Mangá', 'Manhua', 'Shoujo'];
    
    const filteredByPage = useMemo(() => {
        const normalize = (str) => str.normalize("NFD").replace(/[\u0300-\u036f]/g, "").toLowerCase();
        const fType = normalize(filter);

        return [...(mangas || [])]
            .filter(m => {
                if (!m.type) return false;
                const mType = normalize(m.type);
                if (fType === 'manga' && mType === 'manga') return true;
                return mType === fType;
            })
            .sort((a, b) => b.createdAt - a.createdAt);
    }, [mangas, filter]);

    const totalPages = Math.ceil(filteredByPage.length / itemsPerPage);
    const indexOfLastItem = currentPage * itemsPerPage;
    const indexOfFirstItem = indexOfLastItem - itemsPerPage;
    const currentItems = filteredByPage.slice(indexOfFirstItem, indexOfLastItem);

    useEffect(() => {
        if (destaques.length === 0) return;
        const timer = setInterval(() => {
            setCurrentSlide((prev) => (prev + 1) % destaques.length);
        }, 6000); // Aumentado um pouco para dar tempo de ler
        return () => clearInterval(timer);
    }, [destaques.length]);

    const handleFilterChange = (opt) => {
        setFilter(opt);
        setCurrentPage(1);
    };

    return (
        <div className="pb-24 animate-in fade-in duration-500 bg-[#050505] min-h-screen relative font-sans text-white overflow-x-hidden selection:bg-red-500/30">
            
            {/* Fundo Ambiente Premium */}
            <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[800px] h-[500px] bg-red-900/10 blur-[150px] pointer-events-none z-0 rounded-full"></div>

            {/* SESSÃO: DESTAQUES (CARROSSEL) */}
            {destaques.length > 0 && (
                <div className="relative w-full h-[60vh] md:h-[75vh] max-h-[800px] overflow-hidden mb-12 bg-[#050505] z-10 border-b border-white/5">
                    {destaques.map((manga, index) => (
                        <div key={manga.id} className={`absolute inset-0 w-full h-full transition-all duration-1000 ease-in-out ${index === currentSlide ? 'opacity-100 z-10 scale-100' : 'opacity-0 z-0 scale-105'}`}>
                            
                            {/* Fundo do Carrossel Otimizado */}
                            <div className="absolute inset-0 bg-[#050505]">
                                <img src={manga.coverUrl} className="w-full h-full object-cover opacity-30 mix-blend-luminosity" alt="Background" loading="lazy" />
                            </div>
                            <div className="absolute inset-0 bg-gradient-to-t from-[#050505] via-[#050505]/60 to-transparent" />
                            <div className="absolute inset-0 bg-gradient-to-r from-[#050505] via-[#050505]/80 to-transparent" />
                            
                            <div className="absolute bottom-0 left-0 w-full p-6 md:p-12 max-w-7xl mx-auto flex items-center md:items-end gap-8 md:gap-16 h-full md:h-auto pt-32 md:pt-0">
                                
                                {/* Capa Flutuante (Apenas Desktop) */}
                                <div className="hidden md:block w-48 lg:w-64 flex-shrink-0 relative group cursor-pointer transition-transform duration-500 hover:-translate-y-2" onClick={() => onNavigate('details', manga)}>
                                    <div className="absolute -inset-2 bg-gradient-to-b from-red-600 to-blue-600 rounded-2xl blur-xl opacity-20 group-hover:opacity-40 transition-opacity"></div>
                                    <img src={manga.coverUrl} className="relative rounded-2xl shadow-[0_20px_50px_rgba(0,0,0,0.8)] border border-white/10 z-10 object-cover aspect-[2/3] w-full" alt="Capa" loading="lazy" />
                                </div>

                                {/* Informações do Destaque */}
                                <div className="flex-1 relative z-20 flex flex-col justify-end md:justify-start h-full md:h-auto pb-10 md:pb-6">
                                    <div className="flex items-center gap-3 mb-4 animate-in slide-in-from-bottom-4 fade-in duration-500">
                                        <span className="bg-red-600/20 border border-red-500/30 text-red-400 text-[10px] font-black px-3 py-1.5 rounded-lg uppercase tracking-[0.2em] shadow-[0_0_15px_rgba(220,38,38,0.2)]">
                                            Em Destaque
                                        </span>
                                        <span className="flex items-center gap-1.5 text-amber-400 text-xs font-black bg-[#111] px-3 py-1.5 rounded-lg border border-white/5 shadow-md">
                                            <Star className="w-3.5 h-3.5 fill-amber-400 text-amber-400"/> {manga.rating ? Number(manga.rating).toFixed(1) : "5.0"}
                                        </span>
                                    </div>
                                    
                                    <h2 className="text-4xl md:text-6xl font-black text-white mb-4 line-clamp-2 tracking-tighter uppercase italic drop-shadow-lg animate-in slide-in-from-bottom-6 fade-in duration-700">
                                        {manga.title}
                                    </h2>
                                    
                                    <p className="text-gray-400 text-sm md:text-base line-clamp-3 mb-8 max-w-2xl font-medium leading-relaxed animate-in slide-in-from-bottom-8 fade-in duration-700 delay-100">
                                        {manga.synopsis || "Explore este universo e descubra os mistérios que aguardam. Adentre as páginas desta obra prima."}
                                    </p>
                                    
                                    <button onClick={() => onNavigate('details', manga)} className="bg-white text-black hover:bg-red-600 hover:text-white font-black px-8 py-4 rounded-xl flex items-center justify-center gap-3 transition-all active:scale-95 text-xs uppercase tracking-widest shadow-xl w-full md:w-max group animate-in slide-in-from-bottom-10 fade-in duration-700 delay-200">
                                        <Play className="w-4 h-4 fill-current group-hover:scale-110 transition-transform" /> Começar a Ler
                                    </button>
                                </div>
                            </div>
                        </div>
                    ))}
                    
                    {/* Indicadores Modernos */}
                    <div className="absolute bottom-6 right-6 md:bottom-12 md:right-12 z-30 flex gap-2">
                        {destaques.map((_, i) => (
                            <button key={i} onClick={() => setCurrentSlide(i)} className={`h-1.5 rounded-full transition-all duration-500 ${i === currentSlide ? 'w-10 bg-red-600 shadow-[0_0_10px_rgba(220,38,38,0.8)]' : 'w-3 bg-white/20 hover:bg-white/40'}`} />
                        ))}
                    </div>
                </div>
            )}

            {/* SESSÃO: POPULARES */}
            <div className="mt-8 md:mt-12 px-4 md:px-8 max-w-7xl mx-auto relative z-10">
                <div className="flex items-center justify-between mb-6">
                    <h2 className="text-xl md:text-2xl font-black text-white flex items-center gap-3 uppercase tracking-tight">
                        <Flame className="w-6 h-6 text-red-500 animate-pulse" /> Em Alta
                    </h2>
                    <button onClick={() => onNavigate('popular')} className="text-[10px] font-black text-gray-400 hover:text-red-500 uppercase tracking-[0.2em] flex items-center transition-colors group">
                        Panteão <ChevronRight className="w-4 h-4 ml-1 group-hover:translate-x-1 transition-transform" />
                    </button>
                </div>
                
                <div className="flex overflow-x-auto gap-4 md:gap-6 pb-6 snap-x snap-mandatory no-scrollbar items-stretch" style={{ WebkitOverflowScrolling: 'touch' }}>
                    {populares.map((manga, index) => (
                        <div key={manga.id} onClick={() => onNavigate('details', manga)} className="flex-none w-[130px] sm:w-[140px] md:w-[160px] snap-start cursor-pointer group relative">
                            <div className={`relative aspect-[2/3] rounded-2xl overflow-hidden bg-[#0A0A0A] border border-white/5 transition-all duration-300 group-hover:border-red-500/50 group-hover:shadow-[0_10px_30px_rgba(220,38,38,0.2)] ${dataSaver ? 'blur-[1px]' : ''}`}>
                                <img src={manga.coverUrl} alt={manga.title} className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700" loading="lazy" onError={(e) => e.target.src = `https://placehold.co/300x450/0A0A0A/dc2626?text=Oculto`} />
                                
                                <div className="absolute top-2 left-2 w-7 h-7 rounded-lg bg-black/80 backdrop-blur-md border border-white/10 flex items-center justify-center shadow-lg z-10">
                                    <span className="text-[10px] font-black text-white">#{index + 1}</span>
                                </div>

                                <div className="absolute top-2 right-2 bg-black/80 backdrop-blur-md px-2 py-1 rounded-lg border border-white/10 flex items-center gap-1">
                                    <Star className="w-3 h-3 text-amber-400 fill-amber-400" />
                                    <span className="text-[9px] font-black text-white">{manga.rating ? Number(manga.rating).toFixed(1) : "5.0"}</span>
                                </div>
                                <div className="absolute inset-0 bg-gradient-to-t from-[#050505] via-transparent to-transparent opacity-90 group-hover:opacity-100 transition-opacity"></div>
                                
                                {/* Overlay Hover Play */}
                                <div className="absolute inset-0 bg-black/40 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-300 backdrop-blur-[2px]">
                                    <div className="w-12 h-12 rounded-full bg-red-600 text-white flex items-center justify-center shadow-[0_0_20px_rgba(220,38,38,0.6)] transform scale-50 group-hover:scale-100 transition-transform duration-300">
                                        <Play className="w-5 h-5 fill-current ml-1" />
                                    </div>
                                </div>
                            </div>
                            <h3 className="text-sm font-bold text-gray-300 mt-3 line-clamp-1 group-hover:text-red-400 transition-colors px-1">{manga.title}</h3>
                        </div>
                    ))}
                </div>
            </div>

            {/* SESSÃO: LANÇAMENTOS E FILTROS */}
            <div className="mt-8 md:mt-12 px-4 md:px-8 max-w-7xl mx-auto relative z-10">
                <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6 mb-8">
                    <h2 className="text-xl md:text-2xl font-black text-white flex items-center gap-3 uppercase tracking-tight">
                        <Sparkles className="w-6 h-6 text-blue-500" /> Catálogo Império
                    </h2>
                    
                    {/* Filtros Estilo Premium */}
                    <div className="w-full lg:w-auto overflow-x-auto no-scrollbar">
                        <div className="flex items-center gap-2 w-max bg-[#0A0A0A] p-1.5 rounded-2xl border border-white/5">
                            <ListFilter className="w-4 h-4 text-gray-500 ml-2 mr-1" />
                            {filterOptions.map(opt => (
                                <button key={opt} onClick={() => handleFilterChange(opt)} className={`px-5 py-2.5 rounded-xl text-[10px] font-black uppercase tracking-widest whitespace-nowrap transition-all duration-300 ${filter === opt ? 'bg-red-600 text-white shadow-[0_0_15px_rgba(220,38,38,0.4)]' : 'bg-transparent text-gray-500 hover:text-white hover:bg-white/5'}`}>
                                    {opt}
                                </button>
                            ))}
                        </div>
                    </div>
                </div>

                {/* Grade de Lançamentos */}
                <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-4 md:gap-6">
                    {currentItems.length > 0 ? currentItems.map(manga => (
                        <div key={manga.id} onClick={() => onNavigate('details', manga)} className="cursor-pointer group flex flex-col gap-2">
                            <div className={`relative aspect-[2/3] rounded-2xl overflow-hidden bg-[#0A0A0A] border border-white/5 transition-all duration-300 group-hover:border-blue-500/40 group-hover:shadow-[0_10px_30px_rgba(59,130,246,0.15)] ${dataSaver ? 'blur-[1px]' : ''}`}>
                                <img src={manga.coverUrl} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700" loading="lazy" onError={(e) => e.target.src = `https://placehold.co/300x450/050505/3b82f6?text=Oculto`} />
                                
                                {manga.chapters && manga.chapters.length > 0 && (
                                    <div className="absolute top-2 left-2 bg-blue-600/90 backdrop-blur-md text-white text-[9px] font-black px-2.5 py-1 rounded-lg uppercase tracking-widest shadow-lg">
                                        Cap {manga.chapters[0].number}
                                    </div>
                                )}
                                
                                <div className="absolute bottom-0 left-0 w-full bg-gradient-to-t from-[#050505] via-[#050505]/80 to-transparent p-3 pt-12">
                                    <p className="text-[9px] text-gray-400 font-bold uppercase tracking-widest flex items-center gap-1.5"><Clock className="w-3 h-3 text-blue-500"/> {timeAgo(manga.createdAt)}</p>
                                </div>

                                {/* Overlay Hover Menor */}
                                <div className="absolute inset-0 bg-gradient-to-t from-blue-900/40 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none"></div>
                            </div>
                            <h3 className="font-bold text-sm text-gray-300 line-clamp-2 leading-snug group-hover:text-blue-400 transition-colors px-1 mt-1">{manga.title}</h3>
                        </div>
                    )) : (
                        <div className="col-span-full py-24 flex flex-col items-center justify-center bg-[#0A0A0A] rounded-[2rem] border border-white/5 border-dashed">
                            <Moon className="w-12 h-12 text-gray-700 mx-auto mb-4" />
                            <p className="text-gray-500 font-black text-[10px] uppercase tracking-[0.2em] text-center">Nenhuma obra desta categoria encontrada.</p>
                        </div>
                    )}
                </div>

                {/* PAGINAÇÃO PREMIUM */}
                {totalPages > 1 && (
                    <div className="mt-14 mb-8 flex items-center justify-center gap-3">
                        <button disabled={currentPage === 1} onClick={() => setCurrentPage(prev => prev - 1)} className="p-3 rounded-xl bg-[#0A0A0A] text-gray-400 border border-white/5 disabled:opacity-30 disabled:hover:bg-[#0A0A0A] disabled:hover:border-white/5 hover:bg-white hover:text-black transition-all">
                            <ChevronLeft className="w-5 h-5" />
                        </button>
                        
                        <div className="flex items-center gap-1.5 bg-[#0A0A0A] p-1.5 rounded-2xl border border-white/5">
                            {[...Array(totalPages)].map((_, i) => {
                                if (totalPages > 5 && (i + 1 !== 1 && i + 1 !== totalPages && Math.abs(currentPage - (i + 1)) > 1)) {
                                    if (i + 1 === 2 || i + 1 === totalPages - 1) return <span key={i} className="text-gray-600 px-2 font-black text-xs tracking-widest">...</span>;
                                    return null;
                                }
                                return (
                                    <button key={i} onClick={() => setCurrentPage(i + 1)} className={`w-10 h-10 rounded-xl font-black text-xs transition-all duration-300 ${currentPage === i + 1 ? 'bg-white text-black shadow-[0_0_15px_rgba(255,255,255,0.3)]' : 'bg-transparent text-gray-500 hover:bg-white/10 hover:text-white'}`}>
                                        {i + 1}
                                    </button>
                                );
                            })}
                        </div>
                        
                        <button disabled={currentPage === totalPages} onClick={() => setCurrentPage(prev => prev + 1)} className="p-3 rounded-xl bg-[#0A0A0A] text-gray-400 border border-white/5 disabled:opacity-30 disabled:hover:bg-[#0A0A0A] disabled:hover:border-white/5 hover:bg-white hover:text-black transition-all">
                            <ChevronRight className="w-5 h-5" />
                        </button>
                    </div>
                )}
            </div>
        </div>
    );
}
