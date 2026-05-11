import React, { useState, useMemo } from 'react';
import { Search, ListFilter, Star, Clock, ChevronRight, ChevronLeft, LayoutGrid, Flame, Moon } from 'lucide-react';
import { timeAgo } from './helpers';

export function CatalogView({ mangas = [], onNavigate, dataSaver }) {
    const [searchQuery, setSearchQuery] = useState('');
    const [activeFilter, setActiveFilter] = useState('Todos');
    const [currentPage, setCurrentPage] = useState(1);
    const itemsPerPage = 18; // Mais itens por página para o catálogo

    const filterOptions = ['Todos', 'Manhwa', 'Mangá', 'Manhua', 'Shoujo', 'Shounen', 'Seinen'];

    // Lógica de Filtro e Busca
    const filteredMangas = useMemo(() => {
        let result = [...mangas];

        // Filtro de Busca por Texto
        if (searchQuery.trim() !== '') {
            const lowerQ = searchQuery.toLowerCase();
            result = result.filter(m => 
                m.title.toLowerCase().includes(lowerQ) || 
                (m.author && m.author.toLowerCase().includes(lowerQ)) ||
                (m.genres && m.genres.some(g => typeof g === 'string' && g.toLowerCase().includes(lowerQ)))
            );
        }

        // Filtro por Categoria
        if (activeFilter !== 'Todos') {
            const normalize = (str) => str.normalize("NFD").replace(/[\u0300-\u036f]/g, "").toLowerCase();
            const fType = normalize(activeFilter);
            
            result = result.filter(m => {
                if (!m.type && !m.genres) return false;
                const mType = m.type ? normalize(m.type) : '';
                const mGenres = m.genres ? m.genres.map(g => normalize(g)) : [];
                
                if (fType === 'manga' && mType === 'manga') return true;
                return mType === fType || mGenres.includes(fType);
            });
        }

        // Ordenação Padrão: Mais Recentes Primeiro
        return result.sort((a, b) => b.createdAt - a.createdAt);
    }, [mangas, searchQuery, activeFilter]);

    // Paginação
    const totalPages = Math.ceil(filteredMangas.length / itemsPerPage);
    const indexOfLastItem = currentPage * itemsPerPage;
    const indexOfFirstItem = indexOfLastItem - itemsPerPage;
    const currentItems = filteredMangas.slice(indexOfFirstItem, indexOfLastItem);

    const handleFilterChange = (opt) => {
        setActiveFilter(opt);
        setCurrentPage(1);
    };

    return (
        <div className="pb-24 animate-in fade-in duration-500 bg-[#050505] min-h-screen relative font-sans text-white overflow-x-hidden">
            
            {/* Luz de Fundo Suave */}
            <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[600px] h-[300px] bg-blue-900/10 blur-[120px] pointer-events-none z-0"></div>

            <div className="px-4 md:px-8 max-w-7xl mx-auto relative z-10 pt-6 md:pt-10">
                
                {/* CABEÇALHO DO CATÁLOGO */}
                <div className="mb-8">
                    <h1 className="text-3xl md:text-5xl font-black italic uppercase tracking-tighter drop-shadow-md mb-2 flex items-center gap-3">
                        <LayoutGrid className="w-8 h-8 text-blue-500" /> Acervo
                    </h1>
                    <p className="text-gray-400 text-xs md:text-sm font-bold uppercase tracking-widest">
                        Explore o império de obras disponíveis
                    </p>
                </div>

                {/* BARRA DE PESQUISA E FILTROS */}
                <div className="flex flex-col lg:flex-row gap-4 mb-8 bg-[#0A0A0A] p-2 md:p-3 rounded-2xl border border-white/5 shadow-lg">
                    
                    {/* Campo de Busca */}
                    <div className="relative flex-1 group">
                        <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-500 group-focus-within:text-blue-500 transition-colors" />
                        <input 
                            type="text" 
                            placeholder="Buscar por título, autor ou gênero..." 
                            value={searchQuery}
                            onChange={(e) => { setSearchQuery(e.target.value); setCurrentPage(1); }}
                            className="w-full bg-[#111] border border-white/5 rounded-xl py-3.5 pl-12 pr-4 text-sm text-white outline-none focus:border-blue-500/50 transition-colors placeholder:text-gray-600"
                        />
                    </div>

                    {/* Filtros em Pílulas */}
                    <div className="flex items-center gap-2 overflow-x-auto no-scrollbar py-1">
                        <div className="flex items-center bg-[#111] rounded-xl border border-white/5 p-1 w-max">
                            <ListFilter className="w-4 h-4 text-gray-500 mx-3" />
                            {filterOptions.map(opt => (
                                <button 
                                    key={opt} 
                                    onClick={() => handleFilterChange(opt)} 
                                    className={`px-5 py-2 rounded-lg text-[10px] font-black uppercase tracking-widest whitespace-nowrap transition-all duration-300 ${
                                        activeFilter === opt 
                                        ? 'bg-gradient-to-r from-blue-600 to-cyan-600 text-white shadow-[0_0_15px_rgba(59,130,246,0.4)]' 
                                        : 'bg-transparent text-gray-500 hover:text-white hover:bg-white/5'
                                    }`}
                                >
                                    {opt}
                                </button>
                            ))}
                        </div>
                    </div>
                </div>

                {/* ESTATÍSTICAS DA BUSCA */}
                <div className="flex items-center justify-between mb-6">
                    <span className="text-[10px] font-black text-gray-500 uppercase tracking-widest">
                        {filteredMangas.length} Resultados encontrados
                    </span>
                    {searchQuery && (
                        <button onClick={() => setSearchQuery('')} className="text-[10px] font-black text-red-500 hover:text-red-400 uppercase tracking-widest transition-colors">
                            Limpar Busca
                        </button>
                    )}
                </div>

                {/* GRADE DE OBRAS */}
                <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-4 md:gap-6">
                    {currentItems.length > 0 ? currentItems.map(manga => (
                        <div key={manga.id} onClick={() => onNavigate('details', manga)} className="cursor-pointer group flex flex-col">
                            <div className={`relative aspect-[2/3] rounded-2xl overflow-hidden bg-[#0A0A0A] border border-white/5 transition-all duration-300 group-hover:border-blue-500/50 group-hover:shadow-[0_10px_30px_rgba(59,130,246,0.15)] ${dataSaver ? 'blur-[1px]' : ''}`}>
                                <img src={manga.coverUrl} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700" loading="lazy" onError={(e) => e.target.src = `https://placehold.co/300x450/050505/3b82f6?text=Oculto`} />
                                
                                {/* Badge de Capítulo */}
                                {manga.chapters && manga.chapters.length > 0 && (
                                    <div className="absolute top-2 left-2 bg-black/80 backdrop-blur-md border border-white/10 text-white text-[9px] font-black px-2 py-1 rounded uppercase tracking-widest shadow-lg">
                                        Cap {manga.chapters[0].number}
                                    </div>
                                )}

                                {/* Badge de Estrelas */}
                                <div className="absolute top-2 right-2 bg-black/80 backdrop-blur-md px-1.5 py-1 rounded border border-white/10 flex items-center gap-1 shadow-lg">
                                    <Star className="w-2.5 h-2.5 text-amber-400 fill-amber-400" />
                                    <span className="text-[9px] font-black text-white">{manga.rating ? Number(manga.rating).toFixed(1) : "5.0"}</span>
                                </div>
                                
                                {/* Overlay Escuro Inferior */}
                                <div className="absolute inset-0 bg-gradient-to-t from-[#050505] via-[#050505]/40 to-transparent p-3 pt-12 flex flex-col justify-end opacity-90 group-hover:opacity-100 transition-opacity">
                                    <p className="text-[9px] text-gray-400 font-bold uppercase tracking-widest flex items-center gap-1.5">
                                        <Clock className="w-3 h-3 text-blue-500"/> {timeAgo(manga.createdAt)}
                                    </p>
                                </div>
                            </div>
                            
                            <h3 className="font-bold text-sm text-gray-300 line-clamp-2 leading-snug group-hover:text-blue-400 transition-colors px-1 mt-2">
                                {manga.title}
                            </h3>
                        </div>
                    )) : (
                        <div className="col-span-full py-24 flex flex-col items-center justify-center bg-[#0A0A0A] rounded-[2rem] border border-white/5 border-dashed">
                            <Moon className="w-12 h-12 text-gray-700 mx-auto mb-4" />
                            <h3 className="text-lg font-black text-white uppercase tracking-widest mb-1">O Abismo está vazio</h3>
                            <p className="text-gray-500 font-bold text-[10px] uppercase tracking-[0.2em] text-center">
                                Nenhuma obra corresponde aos seus filtros.
                            </p>
                        </div>
                    )}
                </div>

                {/* PAGINAÇÃO PREMIUM */}
                {totalPages > 1 && (
                    <div className="mt-14 mb-8 flex items-center justify-center gap-3">
                        <button disabled={currentPage === 1} onClick={() => setCurrentPage(prev => prev - 1)} className="p-3 rounded-xl bg-[#0A0A0A] text-gray-400 border border-white/5 disabled:opacity-30 hover:bg-white hover:text-black transition-all">
                            <ChevronLeft className="w-5 h-5" />
                        </button>
                        
                        <div className="flex items-center gap-1.5 bg-[#0A0A0A] p-1.5 rounded-2xl border border-white/5">
                            {[...Array(totalPages)].map((_, i) => {
                                if (totalPages > 5 && (i + 1 !== 1 && i + 1 !== totalPages && Math.abs(currentPage - (i + 1)) > 1)) {
                                    if (i + 1 === 2 || i + 1 === totalPages - 1) return <span key={i} className="text-gray-600 px-2 font-black text-xs tracking-widest">...</span>;
                                    return null;
                                }
                                return (
                                    <button 
                                        key={i} 
                                        onClick={() => setCurrentPage(i + 1)} 
                                        className={`w-10 h-10 rounded-xl font-black text-xs transition-all duration-300 ${
                                            currentPage === i + 1 
                                            ? 'bg-gradient-to-r from-blue-600 to-cyan-600 text-white shadow-[0_0_15px_rgba(59,130,246,0.4)]' 
                                            : 'bg-transparent text-gray-500 hover:bg-white/10 hover:text-white'
                                        }`}
                                    >
                                        {i + 1}
                                    </button>
                                );
                            })}
                        </div>
                        
                        <button disabled={currentPage === totalPages} onClick={() => setCurrentPage(prev => prev + 1)} className="p-3 rounded-xl bg-[#0A0A0A] text-gray-400 border border-white/5 disabled:opacity-30 hover:bg-white hover:text-black transition-all">
                            <ChevronRight className="w-5 h-5" />
                        </button>
                    </div>
                )}
            </div>
        </div>
    );
}
