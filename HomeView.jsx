import React, { useState, useEffect } from 'react';
import { Star, Clock, ListFilter, BookmarkPlus, ChevronRight, Flame, Play, ChevronLeft } from 'lucide-react';
import { timeAgo } from './helpers';

export function HomeView({ mangas, onNavigate, dataSaver }) {
    const [filter, setFilter] = useState('Manhwa');
    const [currentSlide, setCurrentSlide] = useState(0);
    const [currentPage, setCurrentPage] = useState(1);
    const itemsPerPage = 12;

    const populares = [...(mangas || [])].filter(m => (m.rating || 0) >= 4.0).sort((a, b) => (b.rating || 0) - (a.rating || 0)).slice(0, 10);
    const destaques = [...(mangas || [])].filter(m => m.coverUrl && (m.rating || 0) >= 4.5).slice(0, 5);
    const filterOptions = ['Manhwa', 'Mangá', 'Manhua', 'Shoujo'];
    
    const filteredByPage = [...(mangas || [])].filter(m => {
        if (!m.type) return false;
        const normalize = (str) => str.normalize("NFD").replace(/[\u0300-\u036f]/g, "").toLowerCase();
        return normalize(m.type) === normalize(filter);
    }).sort((a, b) => b.createdAt - a.createdAt);

    const totalPages = Math.ceil(filteredByPage.length / itemsPerPage);
    const indexOfLastItem = currentPage * itemsPerPage;
    const indexOfFirstItem = indexOfLastItem - itemsPerPage;
    const currentItems = filteredByPage.slice(indexOfFirstItem, indexOfLastItem);

    useEffect(() => {
        if (destaques.length === 0) return;
        const timer = setInterval(() => setCurrentSlide((prev) => (prev + 1) % destaques.length), 6000);
        return () => clearInterval(timer);
    }, [destaques.length]);

    return (
        <div className="pb-24 animate-in fade-in duration-700 bg-[#030305]">
            {destaques.length > 0 && (
                <div className="relative w-full min-h-[350px] h-[50vh] md:h-[65vh] max-h-[600px] overflow-hidden mb-10 bg-[#030305]">
                    {destaques.map((manga, index) => (
                        <div key={manga.id} className={`absolute inset-0 w-full h-full transition-opacity duration-[1500ms] ease-in-out ${index === currentSlide ? 'opacity-100 z-10' : 'opacity-0 z-0'}`}>
                            <div className="absolute inset-0 bg-[#030305]">
                                <img src={manga.coverUrl} className={`w-full h-full object-cover opacity-30 mix-blend-screen ${dataSaver ? 'blur-sm' : ''}`} alt="Background" />
                            </div>
                            <div className="absolute inset-0 bg-gradient-to-t from-[#030305] via-[#030305]/80 to-transparent" />
                            <div className="absolute inset-0 bg-gradient-to-r from-[#030305] via-[#030305]/50 to-transparent" />
                            
                            <div className="absolute bottom-0 left-0 w-full p-4 pb-10 md:p-12 max-w-7xl mx-auto flex items-end gap-4 md:gap-12">
                                <img src={manga.coverUrl} className={`hidden sm:block w-28 md:w-52 rounded-2xl shadow-2xl border border-white/5 ${dataSaver ? 'blur-[1px]' : ''}`} alt="Capa" />
                                <div className="flex-1 pb-2 md:pb-8">
                                    <div className="flex items-center gap-2 md:gap-3 mb-2 md:mb-4">
                                        <span className="bg-cyan-500/20 text-cyan-300 text-[9px] md:text-[10px] font-black px-2 py-1 md:px-3 rounded-full uppercase tracking-widest border border-cyan-500/20">Destaque</span>
                                        <span className="flex items-center gap-1 text-amber-200/90 text-[10px] md:text-xs font-black bg-white/5 px-2 py-1 md:px-3 rounded-full backdrop-blur-md border border-white/5"><Star className="w-3 h-3 fill-amber-200/90"/> {manga.rating ? Number(manga.rating).toFixed(1) : "5.0"}</span>
                                    </div>
                                    <h2 className="text-2xl sm:text-3xl md:text-5xl font-black text-white mb-2 md:mb-4 line-clamp-1 md:line-clamp-2 tracking-tighter leading-tight drop-shadow-lg">{manga.title}</h2>
                                    <p className="text-gray-400 text-[11px] md:text-sm line-clamp-2 md:line-clamp-3 mb-4 md:mb-8 max-w-2xl font-medium leading-relaxed">{manga.synopsis || "Uma jornada inesquecível aguarda no Nexus."}</p>
                                    <button onClick={() => onNavigate('details', manga)} className="bg-white text-black hover:bg-cyan-400 hover:shadow-[0_0_15px_#22d3ee] font-black px-6 py-3 md:px-8 md:py-4 rounded-xl md:rounded-2xl flex items-center gap-2 transition-all duration-300 text-[10px] md:text-xs uppercase tracking-widest shadow-lg">
                                        <Play className="w-3 h-3 md:w-4 md:h-4 fill-current" /> Ler Agora
                                    </button>
                                </div>
                            </div>
                        </div>
                    ))}
                    <div className="absolute bottom-4 right-4 md:bottom-10 md:right-12 z-20 flex gap-2">
                        {destaques.map((_, i) => (
                            <button key={i} onClick={() => setCurrentSlide(i)} className={`h-1.5 rounded-full transition-all duration-500 ${i === currentSlide ? 'w-8 bg-cyan-400 shadow-[0_0_10px_#22d3ee]' : 'w-2 bg-white/20 hover:bg-white/40'}`} />
                        ))}
                    </div>
                </div>
            )}

            <div className="mt-4 md:mt-8 px-4 md:px-8 max-w-7xl mx-auto">
                <div className="flex items-center justify-between mb-6">
                    <h2 className="text-lg md:text-xl font-black text-white flex items-center gap-2 uppercase tracking-tighter"><Flame className="w-5 h-5 text-amber-500" /> Populares</h2>
                    <button onClick={() => onNavigate('popular')} className="text-[10px] md:text-xs font-black text-cyan-400 hover:text-white uppercase tracking-widest flex items-center transition-colors">Ver Todos <ChevronRight className="w-4 h-4 ml-1" /></button>
                </div>
                <div className="flex overflow-x-auto gap-4 md:gap-5 pb-6 snap-x snap-mandatory no-scrollbar items-stretch" style={{ WebkitOverflowScrolling: 'touch' }}>
                    {populares.map(manga => (
                        <div key={manga.id} onClick={() => onNavigate('details', manga)} className="flex-none w-[120px] sm:w-[140px] md:w-[160px] snap-start cursor-pointer group">
                            <div className={`relative aspect-[2/3] rounded-2xl overflow-hidden bg-[#0a0a12] border border-white/5 group-hover:border-cyan-500/50 group-hover:shadow-[0_0_15px_rgba(34,211,238,0.2)] transition-all duration-500 ${dataSaver ? 'blur-[2px]' : ''}`}>
                                <img src={manga.coverUrl} alt={manga.title} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700 ease-out" loading="lazy" />
                                <div className="absolute top-2 right-2 bg-[#030305]/80 backdrop-blur-md px-2 py-1 rounded-lg border border-white/5 flex items-center gap-1"><Star className="w-3 h-3 text-amber-300 fill-amber-300" /><span className="text-[10px] font-black text-white">{manga.rating ? Number(manga.rating).toFixed(1) : "5.0"}</span></div>
                            </div>
                            <h3 className="text-xs md:text-sm font-bold text-gray-300 mt-3 line-clamp-1 group-hover:text-cyan-400 transition-colors px-1">{manga.title}</h3>
                        </div>
                    ))}
                </div>
            </div>

            <div className="mt-10 px-4 md:px-8 max-w-7xl mx-auto">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8">
                    <h2 className="text-lg md:text-xl font-black text-white flex items-center gap-2 uppercase tracking-tighter"><Clock className="w-5 h-5 text-indigo-400" /> Atualizações</h2>
                    
                    {/* ENVOLTÓRIO CORRIGIDO: Agora rola sem cortar */}
                    <div className="w-full sm:w-auto overflow-x-auto no-scrollbar">
                        <div className="flex items-center gap-2 pb-2 px-1 w-max">
                            <ListFilter className="w-4 h-4 text-gray-600 flex-shrink-0 mr-2" />
                            {filterOptions.map(opt => (
                                <button key={opt} onClick={() => handleFilterChange(opt)} className={`px-5 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest whitespace-nowrap transition-colors border ${filter === opt ? 'bg-cyan-500 text-black border-cyan-400 shadow-[0_0_10px_rgba(34,211,238,0.3)]' : 'bg-[#0a0a12] text-gray-400 border-white/5 hover:text-white'}`}>{opt}</button>
                            ))}
                        </div>
                    </div>
                </div>

                <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-4 md:gap-5">
                    {currentItems.length > 0 ? currentItems.map(manga => (
                        <div key={manga.id} onClick={() => onNavigate('details', manga)} className="cursor-pointer group flex flex-col gap-2">
                            <div className={`relative aspect-[2/3] rounded-2xl overflow-hidden bg-[#0a0a12] border border-white/5 group-hover:border-cyan-500/30 transition-all duration-500 shadow-sm group-hover:shadow-[0_0_15px_rgba(34,211,238,0.1)] ${dataSaver ? 'blur-[1px]' : ''}`}>
                                <img src={manga.coverUrl} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700 ease-out" loading="lazy" />
                                {manga.chapters && manga.chapters.length > 0 && <div className="absolute top-2 left-2 bg-cyan-600 text-black text-[9px] font-black px-2 py-1 rounded-lg uppercase tracking-wider shadow-md">Cap {manga.chapters[0].number}</div>}
                                <div className="absolute bottom-0 left-0 w-full bg-gradient-to-t from-[#030305] to-transparent p-3 pt-8"><p className="text-[9px] text-cyan-400 font-bold uppercase tracking-widest drop-shadow-md">{timeAgo(manga.createdAt)}</p></div>
                            </div>
                            <h3 className="font-bold text-xs md:text-sm text-gray-300 line-clamp-2 leading-snug group-hover:text-cyan-400 transition-colors duration-300 px-1">{manga.title}</h3>
                        </div>
                    )) : (
                        <div className="col-span-full py-16 text-center bg-white/[0.02] rounded-3xl border border-white/5"><BookmarkPlus className="w-8 h-8 text-gray-600 mx-auto mb-3" /><p className="text-gray-500 font-black text-xs uppercase tracking-widest">Nenhuma obra nesta categoria.</p></div>
                    )}
                </div>

                {totalPages > 1 && (
                    <div className="mt-14 flex items-center justify-center gap-2">
                        <button disabled={currentPage === 1} onClick={() => setCurrentPage(prev => prev - 1)} className="p-3 rounded-xl bg-white/[0.02] text-gray-400 disabled:opacity-20 hover:bg-white/[0.05] hover:text-white transition-colors"><ChevronLeft className="w-4 h-4" /></button>
                        {[...Array(totalPages)].map((_, i) => (
                            <button key={i} onClick={() => setCurrentPage(i + 1)} className={`w-10 h-10 rounded-xl font-black text-xs transition-all ${currentPage === i + 1 ? 'bg-cyan-500 text-black shadow-[0_0_10px_rgba(34,211,238,0.5)]' : 'bg-transparent text-gray-500 hover:text-white'}`}>{i + 1}</button>
                        ))}
                        <button disabled={currentPage === totalPages} onClick={() => setCurrentPage(prev => prev + 1)} className="p-3 rounded-xl bg-white/[0.02] text-gray-400 disabled:opacity-20 hover:bg-white/[0.05] hover:text-white transition-colors"><ChevronRight className="w-4 h-4" /></button>
                    </div>
                )}
            </div>
        </div>
    );
}
