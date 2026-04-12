import React, { useState, useEffect } from 'react';
import { Star, Clock, ListFilter, BookmarkPlus, ChevronRight, Flame, Play, ChevronLeft } from 'lucide-react';
import { timeAgo } from './helpers';

export function HomeView({ mangas, onNavigate, dataSaver }) {
    const [filter, setFilter] = useState('Manhwa');
    const [currentSlide, setCurrentSlide] = useState(0);
    const [currentPage, setCurrentPage] = useState(1);
    const itemsPerPage = 12;

    // POPULARES: Filtro rígido de qualidade
    const populares = [...(mangas || [])]
        .filter(m => (m.rating || 0) >= 4.0)
        .sort((a, b) => (b.rating || 0) - (a.rating || 0))
        .slice(0, 10);

    // CARROSSEL: Apenas a elite absoluta (Nota maior ou igual a 4.8)
    const destaques = [...(mangas || [])]
        .filter(m => (m.rating || 0) >= 4.8 && m.coverUrl)
        .slice(0, 5);

    // Se não houver notas 4.8, pega as 5 melhores gerais por segurança
    const carouselItems = destaques.length > 0 ? destaques : [...(mangas || [])].sort((a,b) => (b.rating || 0) - (a.rating || 0)).slice(0, 5);

    const filterOptions = ['Manhwa', 'Mangá', 'Manhua', 'Shoujo'];
    const filteredByPage = [...(mangas || [])].filter(m => {
        if (!m.type) return false;
        const mType = m.type.toLowerCase();
        const fType = filter.toLowerCase();
        if (fType === 'mangá' && mType === 'manga') return true;
        return mType === fType;
    }).sort((a, b) => b.createdAt - a.createdAt);

    const totalPages = Math.ceil(filteredByPage.length / itemsPerPage);
    const currentItems = filteredByPage.slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage);

    useEffect(() => {
        const timer = setInterval(() => setCurrentSlide((prev) => (prev + 1) % carouselItems.length), 6000);
        return () => clearInterval(timer);
    }, [carouselItems.length]);

    return (
        <div className="pb-24 animate-in fade-in duration-500 bg-[#020203]">
            {/* CARROSSEL ELITE */}
            {carouselItems.length > 0 && (
                <div className="relative w-full h-[60vh] md:h-[75vh] overflow-hidden mb-12 bg-black">
                    {carouselItems.map((manga, index) => (
                        <div key={manga.id} className={`absolute inset-0 w-full h-full transition-all duration-1000 ease-in-out ${index === currentSlide ? 'opacity-100 scale-100' : 'opacity-0 scale-110'}`}>
                            <img src={manga.coverUrl} className="w-full h-full object-cover opacity-40 grayscale-[0.5]" />
                            <div className="absolute inset-0 bg-gradient-to-t from-[#020203] via-transparent to-transparent" />
                            <div className="absolute bottom-0 left-0 w-full p-8 md:p-20 max-w-7xl mx-auto flex flex-col items-start">
                                <span className="text-[10px] font-black text-white/50 tracking-[0.5em] uppercase mb-4">Elite do Vazio</span>
                                <h2 className="text-4xl md:text-7xl font-black text-white mb-6 tracking-tighter uppercase leading-none">{manga.title}</h2>
                                <button onClick={() => onNavigate('details', manga)} className="group bg-white text-black font-black px-10 py-4 rounded-sm flex items-center gap-4 text-xs uppercase tracking-[0.3em] hover:bg-zinc-200 transition-all">
                                    <Play className="w-4 h-4 fill-current" /> Ver Obra
                                </button>
                            </div>
                        </div>
                    ))}
                    <div className="absolute bottom-10 right-10 flex gap-3">
                        {carouselItems.map((_, i) => (
                            <div key={i} className={`h-[2px] transition-all duration-500 ${i === currentSlide ? 'w-12 bg-white' : 'w-4 bg-white/20'}`} />
                        ))}
                    </div>
                </div>
            )}

            <div className="mt-8 px-6 max-w-7xl mx-auto">
                <div className="flex items-center justify-between mb-8">
                    <h2 className="text-xs font-black text-zinc-500 flex items-center gap-4 tracking-[0.5em] uppercase"><div className="w-8 h-[1px] bg-zinc-800"></div> Populares</h2>
                    <button onClick={() => onNavigate('popular')} className="text-[10px] font-black text-white uppercase tracking-widest hover:opacity-50 transition-opacity">Ver Todos</button>
                </div>
                <div className="flex overflow-x-auto gap-4 pb-12 no-scrollbar">
                    {populares.map(manga => (
                        <div key={manga.id} onClick={() => onNavigate('details', manga)} className="flex-none w-[140px] md:w-[180px] cursor-pointer group">
                            <div className="relative aspect-[2/3] overflow-hidden bg-zinc-900 shadow-2xl group-hover:scale-[0.98] transition-all duration-500">
                                <img src={manga.coverUrl} className="w-full h-full object-cover grayscale-[0.2] group-hover:grayscale-0 transition-all duration-700" />
                                <div className="absolute top-0 right-0 p-3 bg-black/80 backdrop-blur-md text-[10px] font-black text-white">★ {manga.rating || "5.0"}</div>
                            </div>
                            <h3 className="text-[11px] font-black text-zinc-400 mt-4 uppercase tracking-widest line-clamp-1 group-hover:text-white transition-colors">{manga.title}</h3>
                        </div>
                    ))}
                </div>

                <div className="mt-20">
                    <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-8 mb-12">
                        <h2 className="text-xs font-black text-zinc-500 flex items-center gap-4 tracking-[0.5em] uppercase"><div className="w-8 h-[1px] bg-zinc-800"></div> Lançamentos</h2>
                        <div className="flex gap-4 overflow-x-auto no-scrollbar w-full md:w-auto">
                            {filterOptions.map(opt => (
                                <button key={opt} onClick={() => { setFilter(opt); setCurrentPage(1); }} className={`text-[10px] font-black uppercase tracking-[0.3em] whitespace-nowrap transition-all ${filter === opt ? 'text-white border-b border-white pb-1' : 'text-zinc-600 hover:text-zinc-400'}`}>{opt}</button>
                            ))}
                        </div>
                    </div>

                    <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-6">
                        {currentItems.map(manga => (
                            <div key={manga.id} onClick={() => onNavigate('details', manga)} className="cursor-pointer group">
                                <div className="relative aspect-[2/3] overflow-hidden bg-zinc-900 transition-all duration-500 border border-white/5">
                                    <img src={manga.coverUrl} className="w-full h-full object-cover grayscale-[0.8] group-hover:grayscale-0 group-hover:scale-110 transition-all duration-700" />
                                    <div className="absolute bottom-0 left-0 w-full p-4 bg-gradient-to-t from-black text-[9px] font-black text-zinc-500 uppercase tracking-widest">{timeAgo(manga.createdAt)}</div>
                                </div>
                                <h3 className="font-black text-[10px] text-zinc-500 mt-3 uppercase tracking-[0.2em] line-clamp-1 group-hover:text-white transition-colors">{manga.title}</h3>
                            </div>
                        ))}
                    </div>

                    {totalPages > 1 && (
                        <div className="mt-20 flex items-center justify-center gap-4">
                            <button disabled={currentPage === 1} onClick={() => setCurrentPage(p => p - 1)} className="p-4 border border-zinc-800 text-zinc-600 hover:text-white disabled:opacity-0 transition-all"><ChevronLeft className="w-5 h-5"/></button>
                            <span className="text-[10px] font-black text-zinc-500 tracking-[1em] uppercase ml-[1em]">Página {currentPage}</span>
                            <button disabled={currentPage === totalPages} onClick={() => setCurrentPage(p => p + 1)} className="p-4 border border-zinc-800 text-zinc-600 hover:text-white disabled:opacity-0 transition-all"><ChevronRight className="w-5 h-5"/></button>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}
