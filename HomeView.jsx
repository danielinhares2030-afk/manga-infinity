import React, { useState, useEffect } from 'react';
import { Star, Clock, ListFilter, BookmarkPlus, ChevronRight, Flame, Play, ChevronLeft } from 'lucide-react';
import { timeAgo } from './helpers';

export function HomeView({ mangas, onNavigate, dataSaver }) {
    const [filter, setFilter] = useState('Manhwa');
    const [currentSlide, setCurrentSlide] = useState(0);
    const [currentPage, setCurrentPage] = useState(1);
    const itemsPerPage = 12;

    // Lógica Original Mantida
    const populares = [...(mangas || [])]
        .filter(m => (m.rating || 0) >= 4.0)
        .sort((a, b) => (b.rating || 0) - (a.rating || 0))
        .slice(0, 10);

    const destaques = [...(mangas || [])]
        .filter(m => m.coverUrl && (m.rating || 0) >= 4.5)
        .slice(0, 5);

    const filterOptions = ['Manhwa', 'Mangá', 'Manhua', 'Shoujo'];
    
    const filteredByPage = [...(mangas || [])]
        .filter(m => {
            if (!m.type) return false;
            const mType = m.type.toLowerCase();
            const fType = filter.toLowerCase();
            if (fType === 'mangá' && mType === 'manga') return true;
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
        <div className="pb-24 animate-in fade-in duration-700 bg-[#030305]">
            
            {/* DESTAQUES: CARROSSEL ELEGANTE E SUAVE */}
            {destaques.length > 0 && (
                <div className="relative w-full h-[45vh] md:h-[65vh] max-h-[600px] overflow-hidden mb-10 group bg-[#030305] border-b border-white/5">
                    {destaques.map((manga, index) => (
                        <div key={manga.id} className={`absolute inset-0 w-full h-full transition-opacity duration-1000 ease-in-out ${index === currentSlide ? 'opacity-100 z-10' : 'opacity-0 z-0'}`}>
                            <div className="absolute inset-0 bg-[#030305]">
                                <img src={manga.coverUrl} className={`w-full h-full object-cover opacity-30 ${dataSaver ? 'blur-sm' : ''}`} alt="Background" />
                            </div>
                            {/* Gradientes Suaves */}
                            <div className="absolute inset-0 bg-gradient-to-t from-[#030305] via-[#030305]/70 to-transparent" />
                            <div className="absolute inset-0 bg-gradient-to-r from-[#030305] via-[#030305]/40 to-transparent" />
                            
                            <div className="absolute bottom-0 left-0 w-full p-6 md:p-12 max-w-7xl mx-auto flex items-end gap-6 md:gap-10">
                                <img src={manga.coverUrl} className={`hidden md:block w-40 md:w-52 rounded-2xl shadow-2xl border border-white/5 ${dataSaver ? 'blur-[1px]' : ''}`} alt="Capa" />
                                <div className="flex-1 pb-4 md:pb-6">
                                    <div className="flex items-center gap-3 mb-4">
                                        <span className="bg-indigo-500/20 text-indigo-300 text-[10px] font-medium px-3 py-1 rounded-full uppercase tracking-widest border border-indigo-500/20">Em Destaque</span>
                                        <span className="flex items-center gap-1 text-amber-200/90 text-xs font-medium bg-white/5 px-3 py-1 rounded-full backdrop-blur-md border border-white/5"><Star className="w-3 h-3 fill-amber-200/90"/> {manga.rating ? Number(manga.rating).toFixed(1) : "5.0"}</span>
                                    </div>
                                    <h2 className="text-3xl md:text-5xl font-light text-white mb-3 line-clamp-1 md:line-clamp-2 tracking-tight">{manga.title}</h2>
                                    <p className="text-gray-400 text-xs md:text-sm line-clamp-2 md:line-clamp-3 mb-6 max-w-2xl font-light leading-relaxed">{manga.synopsis || "Descubra esta obra épica em nosso acervo. Uma jornada inesquecível aguarda por você."}</p>
                                    <button onClick={() => onNavigate('details', manga)} className="bg-white text-black hover:bg-gray-200 font-bold px-8 py-3.5 rounded-xl flex items-center gap-2 transition-colors duration-300 text-xs md:text-sm uppercase tracking-widest shadow-lg">
                                        <Play className="w-4 h-4 fill-current" /> Ler Agora
                                    </button>
                                </div>
                            </div>
                        </div>
                    ))}
                    <div className="absolute bottom-4 right-4 md:bottom-8 md:right-8 z-20 flex gap-2">
                        {destaques.map((_, i) => (
                            <button key={i} onClick={() => setCurrentSlide(i)} className={`h-1.5 rounded-full transition-all duration-300 ${i === currentSlide ? 'w-8 bg-indigo-400' : 'w-2 bg-white/20 hover:bg-white/40'}`} />
                        ))}
                    </div>
                </div>
            )}

            {/* OBRAS POPULARES (Design Limpo) */}
            <div className="mt-4 md:mt-8 px-4 md:px-8 max-w-7xl mx-auto">
                <div className="flex items-center justify-between mb-6">
                    <h2 className="text-lg md:text-xl font-light text-white flex items-center gap-2">
                        <Flame className="w-5 h-5 text-amber-400/80" /> Mais Populares
                    </h2>
                    <button onClick={() => onNavigate('popular')} className="text-[10px] sm:text-xs font-medium text-gray-400 hover:text-white uppercase tracking-widest flex items-center transition-colors bg-white/5 px-4 py-2 rounded-full border border-white/5 hover:bg-white/10">
                        Ver Todos <ChevronRight className="w-3 h-3 sm:w-4 sm:h-4 ml-1" />
                    </button>
                </div>
                <div className="flex overflow-x-auto gap-4 pb-6 snap-x snap-mandatory no-scrollbar items-stretch" style={{ WebkitOverflowScrolling: 'touch' }}>
                    {populares.map(manga => (
                        <div key={manga.id} onClick={() => onNavigate('details', manga)} className="flex-none w-[110px] sm:w-[140px] md:w-[160px] snap-start cursor-pointer group">
                            <div className={`relative aspect-[2/3] rounded-2xl overflow-hidden bg-[#0a0a12] border border-white/5 group-hover:border-white/10 transition-colors duration-300 ${dataSaver ? 'blur-[2px]' : ''}`}>
                                <img src={manga.coverUrl} alt={manga.title} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500 ease-out" loading="lazy" />
                                <div className="absolute top-2 right-2 bg-[#030305]/80 backdrop-blur-md px-2 py-1 rounded-lg border border-white/5 flex items-center gap-1">
                                    <Star className="w-3 h-3 text-amber-200 fill-amber-200" />
                                    <span className="text-[10px] font-medium text-white">{manga.rating ? Number(manga.rating).toFixed(1) : "5.0"}</span>
                                </div>
                                <div className="absolute inset-0 bg-gradient-to-t from-[#030305]/80 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                            </div>
                            <h3 className="text-xs md:text-sm font-medium text-gray-300 mt-3 line-clamp-1 group-hover:text-white transition-colors px-1">{manga.title}</h3>
                        </div>
                    ))}
                </div>
            </div>

            {/* LANÇAMENTOS E FILTROS */}
            <div className="mt-8 px-4 md:px-8 max-w-7xl mx-auto">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8">
                    <h2 className="text-lg md:text-xl font-light text-white flex items-center gap-2">
                        <Clock className="w-5 h-5 text-indigo-400" /> Lançamentos
                    </h2>
                    <div className="flex items-center gap-2 overflow-x-auto no-scrollbar pb-1">
                        <ListFilter className="w-4 h-4 text-gray-500 flex-shrink-0 mr-1" />
                        {filterOptions.map(opt => (
                            <button key={opt} onClick={() => handleFilterChange(opt)} className={`px-4 py-2 rounded-full text-[10px] font-medium uppercase tracking-widest whitespace-nowrap transition-colors border ${filter === opt ? 'bg-white/10 text-white border-white/10' : 'bg-transparent text-gray-500 border-transparent hover:text-gray-300 hover:bg-white/5'}`}>
                                {opt}
                            </button>
                        ))}
                    </div>
                </div>

                <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-4 md:gap-5">
                    {currentItems.length > 0 ? currentItems.map(manga => (
                        <div key={manga.id} onClick={() => onNavigate('details', manga)} className="cursor-pointer group flex flex-col gap-1.5">
                            <div className={`relative aspect-[2/3] rounded-2xl overflow-hidden bg-[#0a0a12] border border-white/5 group-hover:border-white/10 transition-colors duration-300 ${dataSaver ? 'blur-[1px]' : ''}`}>
                                <img src={manga.coverUrl} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500 ease-out" loading="lazy" />
                                {manga.chapters && manga.chapters.length > 0 && (
                                    <div className="absolute top-2 left-2 bg-indigo-500/90 backdrop-blur-sm text-white text-[9px] font-medium px-2 py-1 rounded-lg uppercase tracking-wider">
                                        Cap {manga.chapters[0].number}
                                    </div>
                                )}
                                <div className="absolute bottom-0 left-0 w-full bg-gradient-to-t from-[#030305] to-transparent p-2 pt-8">
                                    <p className="text-[9px] text-gray-300 font-medium uppercase tracking-widest">{timeAgo(manga.createdAt)}</p>
                                </div>
                            </div>
                            <h3 className="font-medium text-xs md:text-sm text-gray-300 line-clamp-2 leading-snug group-hover:text-white transition-colors duration-300 px-1">{manga.title}</h3>
                        </div>
                    )) : (
                        <div className="col-span-full py-16 text-center bg-white/[0.02] rounded-3xl border border-white/5">
                            <BookmarkPlus className="w-8 h-8 text-gray-600 mx-auto mb-3" />
                            <p className="text-gray-500 font-medium text-xs uppercase tracking-widest">Nenhuma obra encontrada nesta categoria.</p>
                        </div>
                    )}
                </div>

                {/* PAGINAÇÃO SUAVE */}
                {totalPages > 1 && (
                    <div className="mt-14 flex items-center justify-center gap-2">
                        <button disabled={currentPage === 1} onClick={() => setCurrentPage(prev => prev - 1)} className="p-3 rounded-full bg-white/[0.02] border border-transparent text-gray-400 disabled:opacity-20 hover:bg-white/[0.05] hover:text-white transition-colors">
                            <ChevronLeft className="w-4 h-4" />
                        </button>
                        {[...Array(totalPages)].map((_, i) => (
                            <button key={i} onClick={() => setCurrentPage(i + 1)} className={`w-10 h-10 rounded-full font-medium text-xs transition-colors ${currentPage === i + 1 ? 'bg-white text-black' : 'bg-transparent text-gray-500 hover:text-white hover:bg-white/5'}`}>
                                {i + 1}
                            </button>
                        ))}
                        <button disabled={currentPage === totalPages} onClick={() => setCurrentPage(prev => prev + 1)} className="p-3 rounded-full bg-white/[0.02] border border-transparent text-gray-400 disabled:opacity-20 hover:bg-white/[0.05] hover:text-white transition-colors">
                            <ChevronRight className="w-4 h-4" />
                        </button>
                    </div>
                )}
            </div>
        </div>
    );
}
