import React, { useState, useEffect } from 'react';
import { Star, Clock, ListFilter, BookmarkPlus, ChevronRight, Flame, Play, ChevronLeft, Sparkles } from 'lucide-react';
import { timeAgo } from './helpers';

export function HomeView({ mangas, onNavigate, dataSaver }) {
    const [filter, setFilter] = useState('Manhwa');
    const [currentSlide, setCurrentSlide] = useState(0);
    const [currentPage, setCurrentPage] = useState(1);
    const itemsPerPage = 12;

    const populares = [...(mangas || [])]
        .filter(m => (m.rating || 0) >= 4.0)
        .sort((a, b) => (b.rating || 0) - (a.rating || 0))
        .slice(0, 10);

    const destaques = [...(mangas || [])]
        .filter(m => m.coverUrl && (m.rating || 0) >= 4.5)
        .slice(0, 5);

    const filterOptions = ['Manhwa', 'Mangá', 'Manhua', 'Shoujo'];
    
    // FILTRO CORRIGIDO
    const filteredByPage = [...(mangas || [])]
        .filter(m => {
            if (!m.type) return false;
            // Normaliza as strings para remover acentos e deixar em minúsculo
            const normalize = (str) => str.normalize("NFD").replace(/[\u0300-\u036f]/g, "").toLowerCase();
            const mType = normalize(m.type);
            const fType = normalize(filter);
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
        <div className="pb-24 animate-in fade-in duration-700 bg-[#020105] relative overflow-hidden">
            
            <div className="absolute top-0 left-0 w-[500px] h-[500px] bg-cyan-600/10 rounded-full blur-[120px] pointer-events-none mix-blend-screen"></div>
            <div className="absolute top-[40%] right-0 w-[400px] h-[400px] bg-fuchsia-600/10 rounded-full blur-[120px] pointer-events-none mix-blend-screen"></div>

            {destaques.length > 0 && (
                <div className="relative w-full h-[55vh] md:h-[70vh] max-h-[700px] overflow-hidden mb-12 group bg-[#020105]">
                    {destaques.map((manga, index) => (
                        <div key={manga.id} className={`absolute inset-0 w-full h-full transition-all duration-[1200ms] ease-in-out ${index === currentSlide ? 'opacity-100 scale-100 z-10' : 'opacity-0 scale-105 z-0'}`}>
                            <div className="absolute inset-0 bg-[#020105]">
                                <img src={manga.coverUrl} className={`w-full h-full object-cover opacity-40 mix-blend-luminosity ${dataSaver ? 'blur-sm' : ''}`} alt="Background" />
                            </div>
                            
                            <div className="absolute inset-0 bg-gradient-to-t from-[#020105] via-[#020105]/60 to-transparent" />
                            <div className="absolute inset-0 bg-gradient-to-r from-[#020105] via-[#020105]/50 to-transparent" />
                            
                            <div className="absolute bottom-0 left-0 w-full p-6 md:p-12 max-w-7xl mx-auto flex items-end gap-8 md:gap-12">
                                <div className="hidden md:block w-44 md:w-56 relative group-hover:-translate-y-2 transition-transform duration-700">
                                    <div className="absolute -inset-2 bg-gradient-to-r from-cyan-500 to-fuchsia-500 rounded-2xl blur-xl opacity-30 group-hover:opacity-60 transition-opacity duration-500"></div>
                                    <img src={manga.coverUrl} className={`relative rounded-2xl shadow-2xl border border-white/10 z-10 ${dataSaver ? 'blur-[1px]' : ''}`} alt="Capa" />
                                </div>
                                
                                <div className="flex-1 pb-4 md:pb-8 relative z-20">
                                    <div className="flex items-center gap-3 mb-4">
                                        <span className="bg-transparent border border-cyan-400 text-cyan-400 text-[10px] font-black px-3 py-1 rounded-full uppercase tracking-[0.2em] shadow-[0_0_10px_rgba(34,211,238,0.3)]">Obra Prisma</span>
                                        <span className="flex items-center gap-1 text-amber-300 text-xs font-black bg-white/5 backdrop-blur-md px-3 py-1 rounded-full border border-white/10"><Star className="w-3 h-3 fill-amber-300"/> {manga.rating ? Number(manga.rating).toFixed(1) : "5.0"}</span>
                                    </div>
                                    <h2 className="text-4xl md:text-6xl font-black text-white mb-4 line-clamp-1 md:line-clamp-2 tracking-tighter drop-shadow-2xl">{manga.title}</h2>
                                    <p className="text-gray-300 text-sm md:text-base line-clamp-2 md:line-clamp-3 mb-8 max-w-2xl font-light leading-relaxed drop-shadow-md">{manga.synopsis || "Uma jornada que desafia a realidade. Adentre o desconhecido e descubra os segredos do infinito."}</p>
                                    
                                    <button onClick={() => onNavigate('details', manga)} className="relative overflow-hidden bg-white text-black hover:bg-transparent hover:text-white hover:border-white border border-transparent font-black px-8 py-4 rounded-2xl flex items-center gap-3 transition-all duration-500 text-xs uppercase tracking-widest shadow-[0_0_20px_rgba(255,255,255,0.2)] hover:shadow-[0_0_30px_rgba(255,255,255,0.4)] group/btn">
                                        <Play className="w-4 h-4 fill-current group-hover/btn:translate-x-1 transition-transform" /> Iniciar Leitura
                                    </button>
                                </div>
                            </div>
                        </div>
                    ))}
                    <div className="absolute bottom-6 right-6 md:bottom-12 md:right-12 z-20 flex gap-3">
                        {destaques.map((_, i) => (
                            <button key={i} onClick={() => setCurrentSlide(i)} className={`h-1.5 rounded-full transition-all duration-500 ${i === currentSlide ? 'w-10 bg-cyan-400 shadow-[0_0_10px_rgba(34,211,238,0.8)]' : 'w-3 bg-white/20 hover:bg-white/50'}`} />
                        ))}
                    </div>
                </div>
            )}

            <div className="mt-8 md:mt-12 px-4 md:px-8 max-w-7xl mx-auto relative z-10">
                <div className="flex items-center justify-between mb-8">
                    <h2 className="text-2xl font-black text-white flex items-center gap-3 tracking-tight">
                        <Flame className="w-6 h-6 text-fuchsia-500" /> Em Alta
                    </h2>
                    <button onClick={() => onNavigate('popular')} className="text-[10px] md:text-xs font-black text-fuchsia-400 hover:text-white uppercase tracking-widest flex items-center transition-colors bg-fuchsia-500/10 px-4 py-2 rounded-full border border-fuchsia-500/20 hover:bg-fuchsia-500/20">
                        Ver Todos <ChevronRight className="w-4 h-4 ml-1" />
                    </button>
                </div>
                
                <div className="flex overflow-x-auto gap-5 pb-8 snap-x snap-mandatory no-scrollbar items-stretch" style={{ WebkitOverflowScrolling: 'touch' }}>
                    {populares.map(manga => (
                        <div key={manga.id} onClick={() => onNavigate('details', manga)} className="flex-none w-[130px] sm:w-[150px] md:w-[180px] snap-start cursor-pointer group">
                            <div className={`relative aspect-[2/3] rounded-[2rem] overflow-hidden bg-[#05030a] border border-white/5 group-hover:border-fuchsia-500/50 shadow-lg group-hover:shadow-[0_0_25px_rgba(217,70,239,0.3)] transition-all duration-500 ${dataSaver ? 'blur-[2px]' : ''}`}>
                                <img src={manga.coverUrl} alt={manga.title} className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700 ease-out" loading="lazy" />
                                
                                <div className="absolute top-3 right-3 bg-black/60 backdrop-blur-md px-2 py-1 rounded-xl border border-white/10 flex items-center gap-1.5 shadow-md">
                                    <Star className="w-3 h-3 text-amber-300 fill-amber-300" />
                                    <span className="text-[10px] font-black text-white">{manga.rating ? Number(manga.rating).toFixed(1) : "5.0"}</span>
                                </div>
                                <div className="absolute inset-0 bg-gradient-to-t from-[#020105] via-transparent to-transparent opacity-60 group-hover:opacity-90 transition-opacity duration-500"></div>
                            </div>
                            <h3 className="text-sm font-bold text-gray-300 mt-4 line-clamp-1 group-hover:text-fuchsia-400 transition-colors text-center px-2">{manga.title}</h3>
                        </div>
                    ))}
                </div>
            </div>

            <div className="mt-12 px-4 md:px-8 max-w-7xl mx-auto relative z-10">
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 mb-10">
                    <h2 className="text-2xl font-black text-white flex items-center gap-3 tracking-tight">
                        <Sparkles className="w-6 h-6 text-cyan-400" /> Novidades
                    </h2>
                    
                    <div className="flex items-center gap-2 overflow-x-auto no-scrollbar pb-2 bg-white/5 p-1.5 rounded-full border border-white/5 backdrop-blur-md w-fit">
                        <ListFilter className="w-4 h-4 text-cyan-500 flex-shrink-0 ml-2 mr-1" />
                        {filterOptions.map(opt => (
                            <button key={opt} onClick={() => handleFilterChange(opt)} className={`px-5 py-2 rounded-full text-[10px] font-black uppercase tracking-[0.1em] whitespace-nowrap transition-all duration-300 ${filter === opt ? 'bg-cyan-500 text-black shadow-[0_0_15px_rgba(34,211,238,0.5)]' : 'bg-transparent text-gray-400 hover:text-white hover:bg-white/10'}`}>
                                {opt}
                            </button>
                        ))}
                    </div>
                </div>

                <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-5 md:gap-6">
                    {currentItems.length > 0 ? currentItems.map(manga => (
                        <div key={manga.id} onClick={() => onNavigate('details', manga)} className="cursor-pointer group flex flex-col gap-2">
                            <div className={`relative aspect-[2/3] rounded-3xl overflow-hidden bg-[#05030a] border border-white/5 group-hover:border-cyan-400/50 shadow-md group-hover:shadow-[0_0_20px_rgba(34,211,238,0.2)] transition-all duration-500 ${dataSaver ? 'blur-[1px]' : ''}`}>
                                <img src={manga.coverUrl} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700 ease-out" loading="lazy" />
                                
                                {manga.chapters && manga.chapters.length > 0 && (
                                    <div className="absolute top-3 left-3 bg-cyan-950/80 backdrop-blur-md border border-cyan-500/30 text-cyan-300 text-[9px] font-black px-2.5 py-1 rounded-lg uppercase tracking-widest shadow-lg">
                                        Cap {manga.chapters[0].number}
                                    </div>
                                )}
                                
                                <div className="absolute bottom-0 left-0 w-full bg-gradient-to-t from-[#020105] via-[#020105]/80 to-transparent p-3 pt-10">
                                    <p className="text-[9px] text-cyan-400 font-bold uppercase tracking-widest drop-shadow-md">{timeAgo(manga.createdAt)}</p>
                                </div>
                            </div>
                            <h3 className="font-bold text-sm text-gray-300 line-clamp-2 leading-snug group-hover:text-cyan-400 transition-colors duration-300 px-2 mt-1">{manga.title}</h3>
                        </div>
                    )) : (
                        <div className="col-span-full py-20 flex flex-col items-center justify-center bg-white/[0.02] rounded-[3rem] border border-white/5 backdrop-blur-sm">
                            <BookmarkPlus className="w-12 h-12 text-cyan-900 mx-auto mb-4" />
                            <p className="text-gray-400 font-black text-xs uppercase tracking-[0.2em]">O Vazio está silencioso nesta categoria.</p>
                        </div>
                    )}
                </div>

                {totalPages > 1 && (
                    <div className="mt-16 flex items-center justify-center gap-3">
                        <button disabled={currentPage === 1} onClick={() => setCurrentPage(prev => prev - 1)} className="p-3 rounded-full bg-white/[0.03] border border-white/5 text-gray-400 disabled:opacity-20 hover:bg-cyan-500/20 hover:text-cyan-400 hover:border-cyan-500/30 transition-all">
                            <ChevronLeft className="w-5 h-5" />
                        </button>
                        
                        <div className="flex items-center gap-2 bg-white/[0.02] p-1.5 rounded-full border border-white/5 backdrop-blur-md">
                            {[...Array(totalPages)].map((_, i) => (
                                <button key={i} onClick={() => setCurrentPage(i + 1)} className={`w-10 h-10 rounded-full font-black text-xs transition-all duration-300 ${currentPage === i + 1 ? 'bg-cyan-500 text-black shadow-[0_0_15px_rgba(34,211,238,0.5)]' : 'bg-transparent text-gray-500 hover:text-white hover:bg-white/10'}`}>
                                    {i + 1}
                                </button>
                            ))}
                        </div>

                        <button disabled={currentPage === totalPages} onClick={() => setCurrentPage(prev => prev + 1)} className="p-3 rounded-full bg-white/[0.03] border border-white/5 text-gray-400 disabled:opacity-20 hover:bg-cyan-500/20 hover:text-cyan-400 hover:border-cyan-500/30 transition-all">
                            <ChevronRight className="w-5 h-5" />
                        </button>
                    </div>
                )}
            </div>
        </div>
    );
}
