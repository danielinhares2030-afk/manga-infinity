import React, { useState, useEffect, useMemo } from 'react';
import { Star, Clock, ListFilter, ChevronRight, Play, ChevronLeft, Sparkles, Moon, Flame } from 'lucide-react';
import { timeAgo } from './helpers';

export function HomeView({ mangas, onNavigate, dataSaver }) {
    const [filter, setFilter] = useState('Manhwa');
    const [currentSlide, setCurrentSlide] = useState(0);
    const [currentPage, setCurrentPage] = useState(1);
    const itemsPerPage = 12;

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
        <div className="pb-24 animate-in fade-in duration-300 bg-[#050505] min-h-screen relative font-sans text-white overflow-x-hidden">
            
            {/* CARROSSEL MENOR E COMPACTO */}
            {destaques.length > 0 && (
                <div className="relative w-full h-[40vh] md:h-[50vh] min-h-[350px] max-h-[500px] overflow-hidden mb-8 bg-[#050505] z-10 border-b border-white/5">
                    {destaques.map((manga, index) => (
                        <div key={manga.id} className={`absolute inset-0 w-full h-full transition-opacity duration-500 ease-in-out ${index === currentSlide ? 'opacity-100 z-10' : 'opacity-0 z-0'}`}>
                            
                            <div className="absolute inset-0 bg-[#050505]">
                                <img src={manga.coverUrl} className="w-full h-full object-cover opacity-20" alt="Background" loading="lazy" />
                            </div>
                            <div className="absolute inset-0 bg-gradient-to-t from-[#050505] via-[#050505]/80 to-transparent" />
                            <div className="absolute inset-0 bg-gradient-to-r from-[#050505] via-[#050505]/60 to-transparent" />
                            
                            <div className="absolute inset-0 p-6 md:p-10 max-w-7xl mx-auto flex items-center gap-8">
                                <div className="hidden md:block w-40 lg:w-48 flex-shrink-0 cursor-pointer transition-transform hover:-translate-y-1" onClick={() => onNavigate('details', manga)}>
                                    <img src={manga.coverUrl} className="rounded-xl border border-white/10 object-cover aspect-[2/3] w-full" alt="Capa" loading="lazy" />
                                </div>

                                <div className="flex-1 flex flex-col justify-center">
                                    <div className="flex items-center gap-3 mb-3">
                                        <span className="bg-red-600 text-white text-[9px] font-black px-2.5 py-1 rounded uppercase tracking-widest shadow-sm">
                                            Destaque
                                        </span>
                                        <span className="flex items-center gap-1 text-amber-400 text-xs font-bold">
                                            <Star className="w-3.5 h-3.5 fill-amber-400"/> {manga.rating ? Number(manga.rating).toFixed(1) : "5.0"}
                                        </span>
                                    </div>
                                    <h2 className="text-3xl md:text-5xl font-black text-white mb-3 line-clamp-2 uppercase italic tracking-tight drop-shadow-md">
                                        {manga.title}
                                    </h2>
                                    <p className="text-gray-400 text-xs md:text-sm line-clamp-2 md:line-clamp-3 mb-6 max-w-2xl font-medium leading-relaxed">
                                        {manga.synopsis || "Descubra os mistérios dessa incrível obra que está em destaque na nossa plataforma."}
                                    </p>
                                    <button onClick={() => onNavigate('details', manga)} className="bg-white text-black hover:bg-red-600 hover:text-white font-black px-6 py-3 rounded-lg flex items-center justify-center gap-2 transition-colors text-xs uppercase tracking-widest w-max group">
                                        <Play className="w-4 h-4 fill-current group-hover:scale-105" /> Ler Agora
                                    </button>
                                </div>
                            </div>
                        </div>
                    ))}
                    <div className="absolute bottom-4 right-4 md:bottom-6 md:right-8 z-30 flex gap-2">
                        {destaques.map((_, i) => (
                            <button key={i} onClick={() => setCurrentSlide(i)} className={`h-1.5 rounded-full transition-all duration-300 ${i === currentSlide ? 'w-8 bg-red-600' : 'w-2 bg-white/20 hover:bg-white/40'}`} />
                        ))}
                    </div>
                </div>
            )}

            {/* SEÇÃO: POPULARES (PANTEÃO KAGE) */}
            <div className="px-4 md:px-8 max-w-7xl mx-auto relative z-10 mb-10">
                <div className="flex items-center justify-between mb-5">
                    <h2 className="text-lg md:text-xl font-black text-white flex items-center gap-2 uppercase tracking-wide">
                        <Flame className="w-5 h-5 text-red-500" /> Em Alta
                    </h2>
                    <button onClick={() => onNavigate('popular')} className="text-[10px] font-black text-gray-400 hover:text-red-500 uppercase tracking-widest flex items-center transition-colors">
                        Panteão Kage <ChevronRight className="w-4 h-4 ml-1" />
                    </button>
                </div>
                
                <div className="flex overflow-x-auto gap-4 pb-4 snap-x no-scrollbar items-stretch">
                    {populares.map((manga, index) => (
                        <div key={manga.id} onClick={() => onNavigate('details', manga)} className="flex-none w-[120px] sm:w-[140px] snap-start cursor-pointer group">
                            <div className={`relative aspect-[2/3] rounded-xl overflow-hidden bg-[#0A0A0A] border border-white/5 transition-colors group-hover:border-red-500/50 ${dataSaver ? 'blur-[1px]' : ''}`}>
                                <img src={manga.coverUrl} alt={manga.title} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300" loading="lazy" onError={(e) => e.target.src = `https://placehold.co/300x450/0A0A0A/dc2626?text=Oculto`} />
                                <div className="absolute top-2 left-2 w-6 h-6 rounded bg-black/80 border border-white/10 flex items-center justify-center">
                                    <span className="text-[9px] font-black text-white">#{index + 1}</span>
                                </div>
                                <div className="absolute top-2 right-2 bg-black/80 px-1.5 py-0.5 rounded border border-white/10 flex items-center gap-1">
                                    <Star className="w-2.5 h-2.5 text-amber-400 fill-amber-400" />
                                    <span className="text-[9px] font-black text-white">{manga.rating ? Number(manga.rating).toFixed(1) : "5.0"}</span>
                                </div>
                                <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity"></div>
                            </div>
                            <h3 className="text-xs font-bold text-gray-300 mt-2 line-clamp-1 group-hover:text-red-400 transition-colors px-1">{manga.title}</h3>
                        </div>
                    ))}
                </div>
            </div>

            {/* SEÇÃO: LANÇAMENTOS COM OS FILTROS DE VOLTA */}
            <div className="px-4 md:px-8 max-w-7xl mx-auto relative z-10">
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-6 border-t border-white/5 pt-6">
                    <h2 className="text-lg md:text-xl font-black text-white flex items-center gap-2 uppercase tracking-wide">
                        <Sparkles className="w-5 h-5 text-blue-500" /> Lançamentos
                    </h2>
                    
                    {/* Filtros Restaurados */}
                    <div className="flex items-center gap-2 overflow-x-auto no-scrollbar">
                        <ListFilter className="w-4 h-4 text-gray-500 mr-1" />
                        {filterOptions.map(opt => (
                            <button key={opt} onClick={() => handleFilterChange(opt)} className={`px-4 py-2 rounded-lg text-[10px] font-black uppercase tracking-widest whitespace-nowrap transition-colors ${filter === opt ? 'bg-white text-black' : 'bg-[#0A0A0A] text-gray-400 border border-white/5 hover:text-white hover:bg-white/10'}`}>
                                {opt}
                            </button>
                        ))}
                    </div>
                </div>

                <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-3 md:gap-5">
                    {currentItems.length > 0 ? currentItems.map(manga => (
                        <div key={manga.id} onClick={() => onNavigate('details', manga)} className="cursor-pointer group flex flex-col">
                            <div className={`relative aspect-[2/3] rounded-xl overflow-hidden bg-[#0A0A0A] border border-white/5 transition-colors group-hover:border-white/20 ${dataSaver ? 'blur-[1px]' : ''}`}>
                                <img src={manga.coverUrl} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300" loading="lazy" />
                                {manga.chapters && manga.chapters.length > 0 && (
                                    <div className="absolute top-2 left-2 bg-black/80 border border-white/10 text-white text-[9px] font-black px-2 py-0.5 rounded uppercase tracking-widest">
                                        Cap {manga.chapters[0].number}
                                    </div>
                                )}
                                <div className="absolute bottom-0 left-0 w-full bg-gradient-to-t from-black via-black/50 to-transparent p-2 pt-8">
                                    <p className="text-[8px] text-gray-400 font-bold uppercase tracking-widest flex items-center gap-1"><Clock className="w-2.5 h-2.5"/> {timeAgo(manga.createdAt)}</p>
                                </div>
                            </div>
                            <h3 className="font-bold text-xs text-gray-300 line-clamp-2 mt-2 px-1 group-hover:text-white transition-colors">{manga.title}</h3>
                        </div>
                    )) : (
                        <div className="col-span-full py-16 flex flex-col items-center justify-center bg-[#0A0A0A] rounded-xl border border-white/5">
                            <Moon className="w-8 h-8 text-gray-600 mb-3" />
                            <p className="text-gray-500 font-bold text-[10px] uppercase tracking-widest">Vazio</p>
                        </div>
                    )}
                </div>

                {totalPages > 1 && (
                    <div className="mt-10 flex items-center justify-center gap-2">
                        <button disabled={currentPage === 1} onClick={() => setCurrentPage(prev => prev - 1)} className="p-2 rounded bg-[#0A0A0A] text-gray-400 border border-white/5 disabled:opacity-30 hover:bg-white/10 hover:text-white transition-colors">
                            <ChevronLeft className="w-4 h-4" />
                        </button>
                        <div className="flex items-center gap-1">
                            {[...Array(totalPages)].map((_, i) => {
                                if (totalPages > 5 && (i + 1 !== 1 && i + 1 !== totalPages && Math.abs(currentPage - (i + 1)) > 1)) {
                                    if (i + 1 === 2 || i + 1 === totalPages - 1) return <span key={i} className="text-gray-600 px-1 text-xs">...</span>;
                                    return null;
                                }
                                return (
                                    <button key={i} onClick={() => setCurrentPage(i + 1)} className={`w-8 h-8 rounded text-xs font-bold transition-colors ${currentPage === i + 1 ? 'bg-white text-black' : 'bg-transparent text-gray-500 hover:bg-white/10 hover:text-white'}`}>
                                        {i + 1}
                                    </button>
                                );
                            })}
                        </div>
                        <button disabled={currentPage === totalPages} onClick={() => setCurrentPage(prev => prev + 1)} className="p-2 rounded bg-[#0A0A0A] text-gray-400 border border-white/5 disabled:opacity-30 hover:bg-white/10 hover:text-white transition-colors">
                            <ChevronRight className="w-4 h-4" />
                        </button>
                    </div>
                )}
            </div>
        </div>
    );
}
