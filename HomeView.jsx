import React, { useState, useEffect } from 'react';
import { Star, Clock, ListFilter, BookmarkPlus, ChevronRight, Flame, Play, ChevronLeft } from 'lucide-react';
import { timeAgo } from './helpers';

export function HomeView({ mangas, onNavigate, dataSaver }) {
    // Agora o padrão começa em Mangá já que removemos o "Todos"
    const [filter, setFilter] = useState('Mangá');
    const [currentSlide, setCurrentSlide] = useState(0);
    
    // Lógica de Paginação
    const [currentPage, setCurrentPage] = useState(1);
    const itemsPerPage = 12; // Quantas obras aparecem por página

    const populares = [...(mangas || [])].sort((a, b) => (b.rating || 0) - (a.rating || 0)).slice(0, 10);
    const destaques = [...(mangas || [])].filter(m => m.coverUrl).slice(0, 5);

    // Filtros atualizados conforme seu pedido
    const filterOptions = ['Mangá', 'Manhwa', 'Manhua', 'Shoujo'];
    
    // Filtra as obras baseada na categoria selecionada
    const filteredByPage = [...(mangas || [])]
        .filter(m => m.type === filter)
        .sort((a, b) => b.createdAt - a.createdAt);

    // Cálculos da Paginação
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

    // Reseta para a página 1 sempre que mudar o filtro
    const handleFilterChange = (opt) => {
        setFilter(opt);
        setCurrentPage(1);
    };

    return (
        <div className="pb-24 animate-in fade-in duration-500 bg-[#050508]">
            
            {/* CARROSSEL DE DESTAQUES */}
            {destaques.length > 0 && (
                <div className="relative w-full h-[45vh] md:h-[65vh] max-h-[600px] overflow-hidden mb-8 bg-[#050508] border-b border-white/5">
                    {destaques.map((manga, index) => (
                        <div key={manga.id} className={`absolute inset-0 w-full h-full transition-opacity duration-1000 ${index === currentSlide ? 'opacity-100 z-10' : 'opacity-0 z-0'}`}>
                            <div className="absolute inset-0 bg-[#050508]">
                                <img src={manga.coverUrl} className={`w-full h-full object-cover opacity-40 md:opacity-50 ${dataSaver ? 'blur-sm' : ''}`} alt="BG" />
                            </div>
                            <div className="absolute inset-0 bg-gradient-to-t from-[#050508] via-[#050508]/60 to-transparent" />
                            <div className="absolute bottom-0 left-0 w-full p-6 md:p-12 max-w-7xl mx-auto flex items-end gap-6">
                                <div className="flex-1 pb-4">
                                    <h2 className="text-3xl md:text-5xl font-black text-white mb-3 tracking-tight">{manga.title}</h2>
                                    <button onClick={() => onNavigate('details', manga)} className="bg-white text-black font-black px-8 py-3 rounded-full flex items-center gap-2 text-xs uppercase tracking-widest shadow-xl hover:scale-105 transition-transform">
                                        <Play className="w-4 h-4 fill-current" /> Ler Agora
                                    </button>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            )}

            {/* MAIS POPULARES */}
            <div className="mt-4 md:mt-8 px-4 md:px-8 max-w-7xl mx-auto">
                <div className="flex items-center justify-between mb-4">
                    <h2 className="text-xl font-black text-white flex items-center gap-2 tracking-tight">
                        <Flame className="w-5 h-5 text-amber-500" /> Mais Populares
                    </h2>
                    <button onClick={() => onNavigate('popular')} className="text-[10px] font-black text-cyan-400 hover:text-cyan-300 uppercase tracking-widest flex items-center transition-colors bg-cyan-950/30 px-3 py-1.5 rounded-full border border-cyan-900/50">
                        Ver Todos <ChevronRight className="w-3 h-3 ml-1" />
                    </button>
                </div>
                <div className="flex overflow-x-auto gap-3 pb-6 snap-x no-scrollbar">
                    {populares.map(manga => (
                        <div key={manga.id} onClick={() => onNavigate('details', manga)} className="flex-none w-[110px] sm:w-[140px] md:w-[160px] cursor-pointer group">
                            <div className="relative aspect-[2/3] rounded-xl overflow-hidden bg-[#0d0d12] border border-white/5 shadow-lg group-hover:border-amber-500/50 transition-all">
                                <img src={manga.coverUrl} className="w-full h-full object-cover group-hover:scale-105 transition-transform" loading="lazy" />
                                <div className="absolute top-2 right-2 bg-black/80 backdrop-blur-md px-1.5 py-1 rounded-lg border border-amber-500/30 flex items-center gap-1 shadow-md">
                                    <Star className="w-3 h-3 text-amber-400 fill-amber-400" />
                                    <span className="text-[10px] font-black text-amber-400">{manga.rating || "5.0"}</span>
                                </div>
                            </div>
                            <h3 className="text-xs font-bold text-gray-200 mt-2 line-clamp-1 group-hover:text-amber-400">{manga.title}</h3>
                        </div>
                    ))}
                </div>
            </div>

            {/* SEÇÃO LANÇAMENTOS COM FILTROS E PAGINAÇÃO */}
            <div className="mt-8 px-4 md:px-8 max-w-7xl mx-auto">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
                    <h2 className="text-xl font-black text-white flex items-center gap-2 tracking-tight">
                        <Clock className="w-5 h-5 text-cyan-500" /> Lançamentos
                    </h2>
                    
                    <div className="flex items-center gap-2 overflow-x-auto no-scrollbar pb-1">
                        {filterOptions.map(opt => (
                            <button key={opt} onClick={() => handleFilterChange(opt)} className={`px-4 py-2 rounded-full text-[10px] font-black uppercase tracking-widest whitespace-nowrap transition-all border ${filter === opt ? 'bg-cyan-900/40 text-cyan-400 border-cyan-500/50 shadow-lg' : 'bg-[#0d0d12] text-gray-400 border-white/5 hover:text-gray-200'}`}>
                                {opt}
                            </button>
                        ))}
                    </div>
                </div>

                {/* Grid de Obras */}
                <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-4">
                    {currentItems.length > 0 ? currentItems.map(manga => (
                        <div key={manga.id} onClick={() => onNavigate('details', manga)} className="cursor-pointer group flex flex-col gap-1.5">
                            <div className="relative aspect-[2/3] rounded-xl overflow-hidden bg-[#0d0d12] border border-white/5 group-hover:border-cyan-500/30 transition-all">
                                <img src={manga.coverUrl} className="w-full h-full object-cover group-hover:scale-105 transition-transform" />
                                <div className="absolute bottom-0 left-0 w-full bg-gradient-to-t from-black p-2">
                                    <p className="text-[9px] text-cyan-400 font-black uppercase">{timeAgo(manga.createdAt)}</p>
                                </div>
                            </div>
                            <h3 className="font-bold text-xs text-gray-200 line-clamp-1 group-hover:text-cyan-400">{manga.title}</h3>
                        </div>
                    )) : (
                        <div className="col-span-full py-12 text-center text-gray-500 font-bold uppercase text-xs">Nenhuma obra encontrada.</div>
                    )}
                </div>

                {/* CONTROLES DE PÁGINA (Botões de Página 1, 2, etc.) */}
                {totalPages > 1 && (
                    <div className="mt-12 flex items-center justify-center gap-2">
                        <button 
                            disabled={currentPage === 1}
                            onClick={() => setCurrentPage(prev => prev - 1)}
                            className="p-2.5 rounded-xl bg-[#0d0d12] border border-white/5 text-gray-400 disabled:opacity-20 hover:text-cyan-400 transition-all"
                        >
                            <ChevronLeft className="w-5 h-5" />
                        </button>

                        {[...Array(totalPages)].map((_, i) => (
                            <button
                                key={i}
                                onClick={() => setCurrentPage(i + 1)}
                                className={`w-10 h-10 rounded-xl font-black text-xs transition-all border ${currentPage === i + 1 ? 'bg-cyan-600 border-cyan-400 text-white shadow-[0_0_15px_rgba(8,145,178,0.4)]' : 'bg-[#0d0d12] border-white/5 text-gray-500 hover:text-white'}`}
                            >
                                {i + 1}
                            </button>
                        ))}

                        <button 
                            disabled={currentPage === totalPages}
                            onClick={() => setCurrentPage(prev => prev + 1)}
                            className="p-2.5 rounded-xl bg-[#0d0d12] border border-white/5 text-gray-400 disabled:opacity-20 hover:text-cyan-400 transition-all"
                        >
                            <ChevronRight className="w-5 h-5" />
                        </button>
                    </div>
                )}
            </div>
        </div>
    );
}
