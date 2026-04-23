import React, { useState, useEffect } from 'react';
import { Star, Clock, ListFilter, BookmarkPlus, ChevronRight, Flame, Play, ChevronLeft, Sparkles } from 'lucide-react';
import { timeAgo } from './helpers';

export function HomeView({ mangas, onNavigate, dataSaver }) {
    const [filter, setFilter] = useState('Manhwa');
    const [currentSlide, setCurrentSlide] = useState(0);
    const [currentPage, setCurrentPage] = useState(1);
    const itemsPerPage = 12;

    // Removemos a trava de ">= 4.0" para garantir que sempre mostre obras
    const populares = [...(mangas || [])]
        .sort((a, b) => (Number(b.rating) || 0) - (Number(a.rating) || 0))
        .slice(0, 10);

    // Removemos a trava de ">= 4.5" para garantir que o carrossel tenha 5 itens
    const destaques = [...(mangas || [])]
        .filter(m => m.coverUrl)
        .sort((a, b) => (Number(b.rating) || 0) - (Number(a.rating) || 0))
        .slice(0, 5);

    const filterOptions = ['Manhwa', 'Mangá', 'Manhua', 'Shoujo'];
    
    const filteredByPage = [...(mangas || [])]
        .filter(m => {
            if (!m.type) return false;
            const normalize = (str) => str.normalize("NFD").replace(/[\u0300-\u036f]/g, "").toLowerCase();
            const mType = normalize(m.type);
            const fType = normalize(filter);
            if (fType === 'manga' && mType === 'manga') return true;
            return mType === fType;
        })
        .sort((a, b) => b.createdAt - a.createdAt);

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
        <div className="pb-24 animate-in fade-in duration-500 bg-[#050505] min-h-screen relative font-sans text-white">
            
            {/* Fundo extremamente leve: Apenas um gradiente sutil no topo */}
            <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-emerald-900/15 via-[#050505] to-[#050505] pointer-events-none z-0"></div>

            {/* DESTAQUES (CARROSSEL) */}
            {destaques.length > 0 && (
                <div className="relative w-full h-[55vh] md:h-[70vh] max-h-[700px] overflow-hidden mb-12 group bg-[#050505] z-10 border-b border-white/5">
                    {destaques.map((manga, index) => (
                        <div key={manga.id} className={`absolute inset-0 w-full h-full transition-opacity duration-[800ms] ease-in-out ${index === currentSlide ? 'opacity-100 z-10' : 'opacity-0 z-0'}`}>
                            <div className="absolute inset-0 bg-[#050505]">
                                <img src={manga.coverUrl} className={`w-full h-full object-cover opacity-40 ${dataSaver ? 'blur-sm' : ''}`} alt="Background" loading="lazy" />
                            </div>
                            <div className="absolute inset-0 bg-gradient-to-t from-[#050505] via-[#050505]/70 to-transparent" />
                            <div className="absolute inset-0 bg-gradient-to-r from-[#050505] via-[#050505]/50 to-transparent" />
                            
                            <div className="absolute bottom-0 left-0 w-full p-6 md:p-12 max-w-7xl mx-auto flex items-end gap-6 md:gap-12">
                                <div className="hidden md:block w-40 md:w-56 relative group-hover:-translate-y-2 transition-transform duration-500">
                                    <div className="absolute -inset-1 bg-gradient-to-b from-emerald-500 to-amber-500 rounded-xl blur opacity-30"></div>
                                    <img src={manga.coverUrl} className={`relative rounded-xl shadow-2xl border border-white/10 z-10 ${dataSaver ? 'blur-[1px]' : ''}`} alt="Capa" loading="lazy" />
                                </div>
                                <div className="flex-1 pb-4 md:pb-6 relative z-20">
                                    <div className="flex items-center gap-3 mb-4">
                                        <span className="bg-emerald-500/10 text-emerald-400 border border-emerald-500/30 text-[10px] font-black px-3 py-1 rounded-md uppercase tracking-widest shadow-md">
                                            Destaque
                                        </span>
                                        <span className="flex items-center gap-1 text-amber-400 text-xs font-black bg-black/80 px-3 py-1 rounded-md border border-amber-500/20">
                                            <Star className="w-3 h-3 fill-amber-400"/> {manga.rating ? Number(manga.rating).toFixed(1) : "5.0"}
                                        </span>
                                    </div>
                                    <h2 className="text-3xl md:text-6xl font-black text-white mb-3 line-clamp-1 md:line-clamp-2 tracking-tight drop-shadow-lg">{manga.title}</h2>
                                    <p className="text-gray-300 text-sm md:text-base line-clamp-2 md:line-clamp-3 mb-8 max-w-2xl font-medium leading-relaxed drop-shadow-md">{manga.synopsis || "Uma jornada infinita. Adentre este universo e descubra os segredos que aguardam por você."}</p>
                                    
                                    <button onClick={() => onNavigate('details', manga)} className="bg-white text-black hover:bg-emerald-500 hover:text-white font-black px-8 py-3.5 rounded-xl flex items-center gap-3 transition-all duration-300 text-xs uppercase tracking-widest shadow-lg group/btn">
                                        <Play className="w-5 h-5 fill-current group-hover/btn:translate-x-1 transition-transform" /> Ler Agora
                                    </button>
                                </div>
                            </div>
                        </div>
                    ))}
                    <div className="absolute bottom-6 right-6 md:bottom-8 md:right-12 z-20 flex gap-2">
                        {destaques.map((_, i) => (
                            <button key={i} onClick={() => setCurrentSlide(i)} className={`h-1.5 rounded-full transition-all duration-300 ${i === currentSlide ? 'w-8 bg-emerald-400' : 'w-2 bg-white/20 hover:bg-white/50'}`} />
                        ))}
                    </div>
                </div>
            )}

            {/* SESSÃO: POPULARES */}
            <div className="mt-8 md:mt-12 px-4 md:px-8 max-w-7xl mx-auto relative z-10">
                <div className="flex items-center justify-between mb-6">
                    <h2 className="text-2xl font-black text-white flex items-center gap-3 tracking-tight uppercase">
                        <Flame className="w-6 h-6 text-amber-500" /> Populares
                    </h2>
                    <button onClick={() => onNavigate('popular')} className="text-[10px] md:text-xs font-black text-amber-400 hover:text-white uppercase tracking-widest flex items-center transition-colors bg-amber-500/10 px-4 py-2 rounded-lg border border-amber-500/20 hover:bg-amber-500/30">
                        Ver Todos <ChevronRight className="w-4 h-4 ml-1" />
                    </button>
                </div>
                
                <div className="flex overflow-x-auto gap-4 md:gap-5 pb-6 snap-x snap-mandatory no-scrollbar items-stretch" style={{ WebkitOverflowScrolling: 'touch' }}>
                    {populares.map(manga => (
                        <div key={manga.id} onClick={() => onNavigate('details', manga)} className="flex-none w-[130px] sm:w-[150px] md:w-[170px] snap-start cursor-pointer group">
                            <div className={`relative aspect-[2/3] rounded-xl overflow-hidden bg-[#0a0a0a] border border-white/5 group-hover:border-amber-500/50 shadow-md group-hover:shadow-[0_8px_20px_rgba(251,191,36,0.15)] transition-all duration-300 group-hover:-translate-y-1 ${dataSaver ? 'blur-[1px]' : ''}`}>
                                <img src={manga.coverUrl} alt={manga.title} className="w-full h-full object-cover" loading="lazy" />
                                <div className="absolute top-2 right-2 bg-black/80 px-2 py-1 rounded-md border border-amber-500/30 flex items-center gap-1 shadow-sm">
                                    <Star className="w-3 h-3 text-amber-400 fill-amber-400" />
                                    <span className="text-[10px] font-black text-white">{manga.rating ? Number(manga.rating).toFixed(1) : "5.0"}</span>
                                </div>
                                <div className="absolute inset-0 bg-gradient-to-t from-[#050505] via-transparent to-transparent opacity-80 group-hover:opacity-50 transition-opacity duration-300"></div>
                            </div>
                            <h3 className="text-sm font-bold text-gray-200 mt-3 line-clamp-1 group-hover:text-amber-400 transition-colors px-1">{manga.title}</h3>
                        </div>
                    ))}
                </div>
            </div>

            {/* SESSÃO: LANÇAMENTOS E FILTROS */}
            <div className="mt-8 md:mt-12 px-4 md:px-8 max-w-7xl mx-auto relative z-10">
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
                    <h2 className="text-2xl font-black text-white flex items-center gap-3 tracking-tight uppercase">
                        <Sparkles className="w-6 h-6 text-emerald-400" /> Lançamentos
                    </h2>
                    
                    <div className="w-full sm:w-auto overflow-x-auto no-scrollbar">
                        <div className="flex items-center gap-2 pb-2 px-1 w-max">
                            <ListFilter className="w-4 h-4 text-emerald-500 flex-shrink-0 mr-2" />
                            {filterOptions.map(opt => (
                                <button key={opt} onClick={() => handleFilterChange(opt)} className={`px-5 py-2 rounded-lg text-[10px] font-black uppercase tracking-widest whitespace-nowrap transition-all duration-200 border ${filter === opt ? 'bg-emerald-500 text-black border-emerald-500 shadow-[0_0_15px_rgba(16,185,129,0.3)]' : 'bg-[#0a0a0a] text-gray-400 hover:text-white hover:bg-[#111111] border-white/5 hover:border-emerald-500/30'}`}>
                                    {opt}
                                </button>
                            ))}
                        </div>
                    </div>
                </div>

                <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-4 md:gap-5">
                    {currentItems.length > 0 ? currentItems.map(manga => (
                        <div key={manga.id} onClick={() => onNavigate('details', manga)} className="cursor-pointer group flex flex-col gap-2">
                            <div className={`relative aspect-[2/3] rounded-xl overflow-hidden bg-[#0a0a0a] border border-white/5 group-hover:border-emerald-500/50 shadow-sm group-hover:shadow-[0_8px_20px_rgba(16,185,129,0.15)] transition-all duration-300 group-hover:-translate-y-1 ${dataSaver ? 'blur-[1px]' : ''}`}>
                                <img src={manga.coverUrl} className="w-full h-full object-cover" loading="lazy" />
                                
                                {manga.chapters && manga.chapters.length > 0 && (
                                    <div className="absolute top-2 left-2 bg-black/80 border border-emerald-500/30 text-emerald-400 text-[9px] font-black px-2 py-1 rounded-md uppercase tracking-widest shadow-sm">
                                        Cap {manga.chapters[0].number}
                                    </div>
                                )}
                                
                                <div className="absolute bottom-0 left-0 w-full bg-gradient-to-t from-[#050505] via-[#050505]/80 to-transparent p-3 pt-8">
                                    <p className="text-[9px] text-emerald-400 font-bold uppercase tracking-widest flex items-center gap-1"><Clock className="w-3 h-3"/> {timeAgo(manga.createdAt)}</p>
                                </div>
                            </div>
                            <h3 className="font-bold text-sm text-gray-200 line-clamp-2 leading-snug group-hover:text-emerald-400 transition-colors duration-200 px-1 mt-1">{manga.title}</h3>
                        </div>
                    )) : (
                        <div className="col-span-full py-16 flex flex-col items-center justify-center bg-[#0a0a0a]/50 rounded-2xl border border-white/5">
                            <BookmarkPlus className="w-10 h-10 text-gray-600 mx-auto mb-3" />
                            <p className="text-gray-400 font-bold text-xs uppercase tracking-widest">Nenhuma obra detectada.</p>
                        </div>
                    )}
                </div>

                {/* PAGINAÇÃO */}
                {totalPages > 1 && (
                    <div className="mt-12 flex items-center justify-center gap-3">
                        <button disabled={currentPage === 1} onClick={() => setCurrentPage(prev => prev - 1)} className="p-3 rounded-lg bg-[#0a0a0a] text-gray-400 border border-white/5 disabled:opacity-30 hover:bg-emerald-500 hover:text-black hover:border-emerald-500 transition-all active:scale-95 shadow-sm">
                            <ChevronLeft className="w-5 h-5" />
                        </button>
                        
                        <div className="flex items-center gap-2 bg-[#0a0a0a] p-1.5 rounded-lg border border-white/5 shadow-sm">
                            {[...Array(totalPages)].map((_, i) => {
                                if (totalPages > 5 && (i + 1 !== 1 && i + 1 !== totalPages && Math.abs(currentPage - (i + 1)) > 1)) {
                                    if (i + 1 === 2 || i + 1 === totalPages - 1) return <span key={i} className="text-gray-600 px-1 font-black">...</span>;
                                    return null;
                                }
                                return (
                                    <button key={i} onClick={() => setCurrentPage(i + 1)} className={`w-10 h-10 rounded-md font-black text-sm transition-all duration-200 ${currentPage === i + 1 ? 'bg-emerald-500 text-black shadow-md' : 'bg-transparent text-gray-400 hover:bg-white/10 hover:text-white'}`}>
                                        {i + 1}
                                    </button>
                                );
                            })}
                        </div>
                        
                        <button disabled={currentPage === totalPages} onClick={() => setCurrentPage(prev => prev + 1)} className="p-3 rounded-lg bg-[#0a0a0a] text-gray-400 border border-white/5 disabled:opacity-30 hover:bg-emerald-500 hover:text-black hover:border-emerald-500 transition-all active:scale-95 shadow-sm">
                            <ChevronRight className="w-5 h-5" />
                        </button>
                    </div>
                )}
            </div>
        </div>
    );
}
