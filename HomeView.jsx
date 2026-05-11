import React, { useState, useEffect, useMemo } from 'react';
import { Star, Clock, ListFilter, ChevronRight, Play, ChevronLeft, Sparkles, Moon, Zap } from 'lucide-react';
import { timeAgo } from './helpers';

export function HomeView({ mangas, onNavigate, dataSaver }) {
    const [filter, setFilter] = useState('Manhwa');
    const [currentSlide, setCurrentSlide] = useState(0);
    const [currentPage, setCurrentPage] = useState(1);
    const itemsPerPage = 12;

    // Memoização para evitar recálculos desnecessários a cada render
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
        }, 5000);
        return () => clearInterval(timer);
    }, [destaques.length]);

    const handleFilterChange = (opt) => {
        setFilter(opt);
        setCurrentPage(1);
    };

    return (
        <div className="pb-24 animate-in fade-in duration-300 bg-zinc-950 min-h-screen relative font-sans text-zinc-100 overflow-x-hidden selection:bg-violet-500/30">
            
            {/* Fundo super leve (Trocado radial-gradient por cor sólida para performance) */}
            <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[800px] h-[400px] bg-violet-900/10 blur-[120px] pointer-events-none z-0 rounded-full"></div>

            {/* DESTAQUES (CARROSSEL) */}
            {destaques.length > 0 && (
                <div className="relative w-full h-[55vh] md:h-[70vh] max-h-[700px] overflow-hidden mb-12 bg-zinc-950 z-10 border-b border-violet-900/20">
                    {destaques.map((manga, index) => (
                        <div key={manga.id} className={`absolute inset-0 w-full h-full transition-opacity duration-700 ease-in-out ${index === currentSlide ? 'opacity-100 z-10' : 'opacity-0 z-0'}`}>
                            {/* Fundo do Carrossel Otimizado (Sem mix-blend ou grayscale pesado) */}
                            <div className="absolute inset-0 bg-zinc-950">
                                <img src={manga.coverUrl} className="w-full h-full object-cover opacity-20" alt="Background" loading="lazy" />
                            </div>
                            <div className="absolute inset-0 bg-gradient-to-t from-zinc-950 via-zinc-950/80 to-transparent" />
                            <div className="absolute inset-0 bg-gradient-to-r from-zinc-950 via-zinc-950/40 to-transparent" />
                            
                            <div className="absolute bottom-0 left-0 w-full p-6 md:p-12 max-w-7xl mx-auto flex items-end gap-6 md:gap-12">
                                <div className="hidden md:block w-40 md:w-56 relative group-hover:-translate-y-1 transition-transform duration-300">
                                    <div className="absolute -inset-1 bg-gradient-to-b from-violet-500 to-fuchsia-600 rounded-2xl blur-lg opacity-30"></div>
                                    <img src={manga.coverUrl} className="relative rounded-2xl shadow-2xl border border-white/10 z-10" alt="Capa" loading="lazy" />
                                </div>
                                <div className="flex-1 pb-4 md:pb-6 relative z-20">
                                    <div className="flex items-center gap-3 mb-4">
                                        <span className="bg-violet-500/10 text-violet-400 border border-violet-500/30 text-[10px] font-bold px-3 py-1 rounded-md uppercase tracking-widest">
                                            Destaque
                                        </span>
                                        <span className="flex items-center gap-1 text-amber-400 text-xs font-bold bg-black/40 px-3 py-1 rounded-md border border-white/5">
                                            <Star className="w-3 h-3 fill-amber-400 text-amber-400"/> {manga.rating ? Number(manga.rating).toFixed(1) : "5.0"}
                                        </span>
                                    </div>
                                    <h2 className="text-3xl md:text-5xl font-extrabold text-white mb-3 line-clamp-1 md:line-clamp-2 tracking-tight">{manga.title}</h2>
                                    <p className="text-zinc-400 text-sm md:text-base line-clamp-2 md:line-clamp-3 mb-8 max-w-2xl font-medium leading-relaxed">{manga.synopsis || "Explore este universo e descubra os mistérios que aguardam."}</p>
                                    
                                    {/* Botão Novo Visual */}
                                    <button onClick={() => onNavigate('details', manga)} className="bg-gradient-to-r from-violet-600 to-fuchsia-600 text-white font-bold px-8 py-3.5 rounded-xl flex items-center gap-2 transition-transform hover:scale-[1.02] active:scale-95 text-xs uppercase tracking-wider shadow-lg shadow-violet-500/25">
                                        <Play className="w-4 h-4 fill-white" /> Ler Obra
                                    </button>
                                </div>
                            </div>
                        </div>
                    ))}
                    <div className="absolute bottom-6 right-6 md:bottom-8 md:right-12 z-20 flex gap-2">
                        {destaques.map((_, i) => (
                            <button key={i} onClick={() => setCurrentSlide(i)} className={`h-1.5 rounded-full transition-all duration-300 ${i === currentSlide ? 'w-8 bg-violet-500' : 'w-2 bg-white/20 hover:bg-white/40'}`} />
                        ))}
                    </div>
                </div>
            )}

            {/* SESSÃO: POPULARES */}
            <div className="mt-8 md:mt-12 px-4 md:px-8 max-w-7xl mx-auto relative z-10">
                <div className="flex items-center justify-between mb-6">
                    <h2 className="text-xl md:text-2xl font-bold text-white flex items-center gap-2 tracking-tight">
                        <Zap className="w-5 h-5 text-amber-400" /> Populares
                    </h2>
                    <button onClick={() => onNavigate('popular')} className="text-[10px] md:text-xs font-bold text-violet-400 hover:text-violet-300 uppercase tracking-wider flex items-center transition-colors">
                        Ver Todos <ChevronRight className="w-4 h-4 ml-1" />
                    </button>
                </div>
                
                <div className="flex overflow-x-auto gap-4 md:gap-5 pb-6 snap-x snap-mandatory no-scrollbar items-stretch" style={{ WebkitOverflowScrolling: 'touch' }}>
                    {populares.map(manga => (
                        <div key={manga.id} onClick={() => onNavigate('details', manga)} className="flex-none w-[130px] sm:w-[140px] md:w-[160px] snap-start cursor-pointer group">
                            <div className={`relative aspect-[2/3] rounded-xl overflow-hidden bg-zinc-900 border border-white/5 transition-all duration-200 group-hover:border-violet-500/40 group-hover:shadow-lg group-hover:shadow-violet-500/10 ${dataSaver ? 'blur-[1px]' : ''}`}>
                                <img src={manga.coverUrl} alt={manga.title} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" loading="lazy" onError={(e) => e.target.src = `https://placehold.co/300x450/09090b/8b5cf6?text=Oculto`} />
                                <div className="absolute top-2 right-2 bg-black/60 backdrop-blur-sm px-1.5 py-1 rounded border border-white/10 flex items-center gap-1">
                                    <Star className="w-3 h-3 text-amber-400 fill-amber-400" />
                                    <span className="text-[10px] font-bold text-white">{manga.rating ? Number(manga.rating).toFixed(1) : "5.0"}</span>
                                </div>
                                <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent opacity-90"></div>
                            </div>
                            <h3 className="text-sm font-semibold text-zinc-200 mt-2 line-clamp-1 group-hover:text-violet-400 transition-colors px-1">{manga.title}</h3>
                        </div>
                    ))}
                </div>
            </div>

            {/* SESSÃO: LANÇAMENTOS E FILTROS */}
            <div className="mt-8 md:mt-12 px-4 md:px-8 max-w-7xl mx-auto relative z-10">
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-6">
                    <h2 className="text-xl md:text-2xl font-bold text-white flex items-center gap-2 tracking-tight">
                        <Sparkles className="w-5 h-5 text-violet-400" /> Lançamentos
                    </h2>
                    
                    <div className="w-full sm:w-auto overflow-x-auto no-scrollbar bg-zinc-900 border border-white/5 rounded-xl p-1">
                        <div className="flex items-center gap-1 w-max">
                            <ListFilter className="w-4 h-4 text-zinc-500 flex-shrink-0 mx-2" />
                            {filterOptions.map(opt => (
                                <button key={opt} onClick={() => handleFilterChange(opt)} className={`px-4 py-2 rounded-lg text-[11px] font-bold uppercase tracking-wider whitespace-nowrap transition-colors duration-200 ${filter === opt ? 'bg-violet-600 text-white' : 'bg-transparent text-zinc-400 hover:text-white hover:bg-white/5'}`}>
                                    {opt}
                                </button>
                            ))}
                        </div>
                    </div>
                </div>

                <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-4">
                    {currentItems.length > 0 ? currentItems.map(manga => (
                        <div key={manga.id} onClick={() => onNavigate('details', manga)} className="cursor-pointer group flex flex-col gap-2">
                            <div className={`relative aspect-[2/3] rounded-xl overflow-hidden bg-zinc-900 border border-white/5 transition-all duration-200 group-hover:border-violet-500/40 group-hover:shadow-lg group-hover:shadow-violet-500/10 ${dataSaver ? 'blur-[1px]' : ''}`}>
                                <img src={manga.coverUrl} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" loading="lazy" onError={(e) => e.target.src = `https://placehold.co/300x450/09090b/8b5cf6?text=Oculto`} />
                                
                                {manga.chapters && manga.chapters.length > 0 && (
                                    <div className="absolute top-2 left-2 bg-black/70 backdrop-blur-sm border border-violet-500/30 text-violet-300 text-[10px] font-bold px-2 py-1 rounded">
                                        Cap {manga.chapters[0].number}
                                    </div>
                                )}
                                
                                <div className="absolute bottom-0 left-0 w-full bg-gradient-to-t from-black/90 via-black/40 to-transparent p-3 pt-8">
                                    <p className="text-[10px] text-zinc-400 font-medium flex items-center gap-1.5"><Clock className="w-3 h-3 text-violet-400"/> {timeAgo(manga.createdAt)}</p>
                                </div>
                            </div>
                            <h3 className="font-semibold text-sm text-zinc-200 line-clamp-2 leading-snug group-hover:text-violet-400 transition-colors px-1 mt-1">{manga.title}</h3>
                        </div>
                    )) : (
                        <div className="col-span-full py-20 flex flex-col items-center justify-center bg-zinc-900/50 rounded-2xl border border-white/5 border-dashed">
                            <Moon className="w-10 h-10 text-zinc-600 mx-auto mb-3" />
                            <p className="text-zinc-500 font-bold text-xs uppercase tracking-wider text-center">Nenhuma obra encontrada.</p>
                        </div>
                    )}
                </div>

                {/* PAGINAÇÃO LEVE */}
                {totalPages > 1 && (
                    <div className="mt-12 flex items-center justify-center gap-2">
                        <button disabled={currentPage === 1} onClick={() => setCurrentPage(prev => prev - 1)} className="p-2.5 rounded-lg bg-zinc-900 text-zinc-400 border border-white/5 disabled:opacity-50 hover:bg-violet-600 hover:text-white hover:border-violet-600 transition-colors">
                            <ChevronLeft className="w-5 h-5" />
                        </button>
                        
                        <div className="flex items-center gap-1 bg-zinc-900 p-1 rounded-lg border border-white/5">
                            {[...Array(totalPages)].map((_, i) => {
                                if (totalPages > 5 && (i + 1 !== 1 && i + 1 !== totalPages && Math.abs(currentPage - (i + 1)) > 1)) {
                                    if (i + 1 === 2 || i + 1 === totalPages - 1) return <span key={i} className="text-zinc-600 px-2 font-bold">...</span>;
                                    return null;
                                }
                                return (
                                    <button key={i} onClick={() => setCurrentPage(i + 1)} className={`w-10 h-10 rounded-md font-bold text-sm transition-colors ${currentPage === i + 1 ? 'bg-violet-600 text-white' : 'bg-transparent text-zinc-400 hover:bg-white/10 hover:text-white'}`}>
                                        {i + 1}
                                    </button>
                                );
                            })}
                        </div>
                        
                        <button disabled={currentPage === totalPages} onClick={() => setCurrentPage(prev => prev + 1)} className="p-2.5 rounded-lg bg-zinc-900 text-zinc-400 border border-white/5 disabled:opacity-50 hover:bg-violet-600 hover:text-white hover:border-violet-600 transition-colors">
                            <ChevronRight className="w-5 h-5" />
                        </button>
                    </div>
                )}
            </div>
        </div>
    );
}
