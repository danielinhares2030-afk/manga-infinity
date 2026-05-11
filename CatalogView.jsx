import React, { useState, useMemo } from 'react';
import { Search, Star, Clock, ChevronRight, ChevronLeft, Moon, SlidersHorizontal, X } from 'lucide-react';
import { timeAgo } from './helpers';

export function CatalogView({ mangas = [], onNavigate, dataSaver }) {
    const [searchQuery, setSearchQuery] = useState('');
    const [currentPage, setCurrentPage] = useState(1);
    const itemsPerPage = 18;

    // Estados dos Filtros Avançados
    const [isFilterOpen, setIsFilterOpen] = useState(false);
    const [selectedType, setSelectedType] = useState('Todos');
    const [selectedGenre, setSelectedGenre] = useState('Todos');
    const [sortBy, setSortBy] = useState('Recentes');

    const types = ['Todos', 'Manhwa', 'Mangá', 'Manhua'];
    const genresList = ['Todos', 'Ação', 'Artes Marciais', 'Aventura', 'Comédia', 'Drama', 'Fantasia', 'Isekai', 'Romance', 'Seinen', 'Shoujo', 'Shounen'];
    const sortOptions = ['Recentes', 'Melhor Avaliação', 'A-Z'];

    // Lógica de Filtro
    const filteredMangas = useMemo(() => {
        let result = [...mangas];

        if (searchQuery.trim() !== '') {
            const lowerQ = searchQuery.toLowerCase();
            result = result.filter(m => 
                m.title.toLowerCase().includes(lowerQ) || 
                (m.author && m.author.toLowerCase().includes(lowerQ)) ||
                (m.genres && m.genres.some(g => typeof g === 'string' && g.toLowerCase().includes(lowerQ)))
            );
        }

        const normalize = (str) => str.normalize("NFD").replace(/[\u0300-\u036f]/g, "").toLowerCase();

        if (selectedType !== 'Todos') {
            const fType = normalize(selectedType);
            result = result.filter(m => {
                if (!m.type) return false;
                if (fType === 'manga' && normalize(m.type) === 'manga') return true;
                return normalize(m.type) === fType;
            });
        }

        if (selectedGenre !== 'Todos') {
            const fGenre = normalize(selectedGenre);
            result = result.filter(m => m.genres && m.genres.map(g => normalize(g)).includes(fGenre));
        }

        if (sortBy === 'Recentes') {
            result.sort((a, b) => b.createdAt - a.createdAt);
        } else if (sortBy === 'Melhor Avaliação') {
            result.sort((a, b) => (Number(b.rating) || 0) - (Number(a.rating) || 0));
        } else if (sortBy === 'A-Z') {
            result.sort((a, b) => a.title.localeCompare(b.title));
        }

        return result;
    }, [mangas, searchQuery, selectedType, selectedGenre, sortBy]);

    // Paginação
    const totalPages = Math.ceil(filteredMangas.length / itemsPerPage);
    const indexOfLastItem = currentPage * itemsPerPage;
    const indexOfFirstItem = indexOfLastItem - itemsPerPage;
    const currentItems = filteredMangas.slice(indexOfFirstItem, indexOfLastItem);

    return (
        <div className="pb-24 animate-in fade-in duration-300 bg-[#050505] min-h-screen relative font-sans text-white overflow-x-hidden">
            
            <div className="px-4 md:px-8 max-w-7xl mx-auto pt-8 relative z-10">
                
                {/* BARRA DE PESQUISA E BOTÃO DE FILTRO */}
                <div className="flex flex-col md:flex-row gap-3 mb-6">
                    <div className="relative flex-1 group">
                        <Search className="absolute left-5 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-500 group-focus-within:text-blue-500 transition-colors" />
                        <input 
                            type="text" 
                            placeholder="Buscar obras..." 
                            value={searchQuery}
                            onChange={(e) => { setSearchQuery(e.target.value); setCurrentPage(1); }}
                            className="w-full bg-[#0F0F13] border border-white/5 rounded-2xl py-4 pl-14 pr-4 text-sm text-white outline-none focus:border-blue-500/50 transition-colors"
                        />
                    </div>
                    <button 
                        onClick={() => setIsFilterOpen(!isFilterOpen)}
                        className={`flex items-center justify-center gap-2 px-8 py-4 rounded-2xl font-black text-[10px] uppercase tracking-widest transition-colors ${isFilterOpen ? 'bg-blue-600 text-white' : 'bg-[#0F0F13] text-gray-400 border border-white/5 hover:text-white'}`}
                    >
                        {isFilterOpen ? <X className="w-4 h-4" /> : <SlidersHorizontal className="w-4 h-4" />}
                        Filtros
                    </button>
                </div>

                {/* PAINEL DE FILTROS LEVE (Sem animações de altura pesadas) */}
                {isFilterOpen && (
                    <div className="bg-[#0F0F13] border border-white/5 rounded-2xl p-6 mb-8 grid grid-cols-1 md:grid-cols-3 gap-6 animate-in slide-in-from-top-2 fade-in duration-200">
                        
                        <div>
                            <h3 className="text-[10px] font-black text-gray-500 uppercase tracking-widest mb-3">Organizar Por</h3>
                            <div className="flex flex-wrap gap-2">
                                {sortOptions.map(opt => (
                                    <button key={opt} onClick={() => { setSortBy(opt); setCurrentPage(1); }} className={`px-4 py-2 rounded-lg text-[10px] font-bold uppercase tracking-widest transition-colors ${sortBy === opt ? 'bg-blue-600 text-white' : 'bg-[#1A1A20] text-gray-400 hover:bg-white/10 hover:text-white'}`}>
                                        {opt}
                                    </button>
                                ))}
                            </div>
                        </div>

                        <div>
                            <h3 className="text-[10px] font-black text-gray-500 uppercase tracking-widest mb-3">Formato</h3>
                            <div className="flex flex-wrap gap-2">
                                {types.map(opt => (
                                    <button key={opt} onClick={() => { setSelectedType(opt); setCurrentPage(1); }} className={`px-4 py-2 rounded-lg text-[10px] font-bold uppercase tracking-widest transition-colors ${selectedType === opt ? 'bg-purple-600 text-white' : 'bg-[#1A1A20] text-gray-400 hover:bg-white/10 hover:text-white'}`}>
                                        {opt}
                                    </button>
                                ))}
                            </div>
                        </div>

                        <div>
                            <h3 className="text-[10px] font-black text-gray-500 uppercase tracking-widest mb-3">Gêneros</h3>
                            <div className="flex flex-wrap gap-2">
                                {genresList.map(opt => (
                                    <button key={opt} onClick={() => { setSelectedGenre(opt); setCurrentPage(1); }} className={`px-4 py-2 rounded-lg text-[10px] font-bold uppercase tracking-widest transition-colors ${selectedGenre === opt ? 'bg-emerald-600 text-white' : 'bg-[#1A1A20] text-gray-400 hover:bg-white/10 hover:text-white'}`}>
                                        {opt}
                                    </button>
                                ))}
                            </div>
                        </div>

                    </div>
                )}

                <div className="flex items-center justify-between mb-6 border-b border-white/5 pb-4">
                    <span className="text-[10px] font-black text-gray-500 uppercase tracking-widest">
                        {filteredMangas.length} Obras Filtradas
                    </span>
                </div>

                {/* GRADE DE OBRAS */}
                <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-4">
                    {currentItems.length > 0 ? currentItems.map(manga => (
                        <div key={manga.id} onClick={() => onNavigate('details', manga)} className="cursor-pointer group flex flex-col">
                            <div className={`relative aspect-[2/3] rounded-xl overflow-hidden bg-[#0A0A0A] border border-white/5 transition-colors group-hover:border-blue-500/50 ${dataSaver ? 'blur-[1px]' : ''}`}>
                                <img src={manga.coverUrl} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300" loading="lazy" />
                                
                                {manga.chapters && manga.chapters.length > 0 && (
                                    <div className="absolute top-2 left-2 bg-black/80 border border-white/10 text-white text-[9px] font-black px-2 py-0.5 rounded uppercase tracking-widest">
                                        Cap {manga.chapters[0].number}
                                    </div>
                                )}

                                <div className="absolute top-2 right-2 bg-black/80 px-1.5 py-0.5 rounded border border-white/10 flex items-center gap-1">
                                    <Star className="w-2.5 h-2.5 text-amber-400 fill-amber-400" />
                                    <span className="text-[9px] font-black text-white">{manga.rating ? Number(manga.rating).toFixed(1) : "5.0"}</span>
                                </div>
                                
                                <div className="absolute inset-0 bg-gradient-to-t from-black via-black/20 to-transparent p-2 flex flex-col justify-end opacity-90 group-hover:opacity-100 transition-opacity">
                                    <p className="text-[8px] text-gray-400 font-bold uppercase tracking-widest flex items-center gap-1">
                                        <Clock className="w-2.5 h-2.5 text-blue-500"/> {timeAgo(manga.createdAt)}
                                    </p>
                                </div>
                            </div>
                            
                            <h3 className="font-bold text-xs text-gray-300 line-clamp-2 mt-2 px-1 group-hover:text-blue-400 transition-colors">
                                {manga.title}
                            </h3>
                        </div>
                    )) : (
                        <div className="col-span-full py-20 flex flex-col items-center justify-center bg-[#0F0F13] rounded-2xl border border-white/5">
                            <Moon className="w-10 h-10 text-gray-600 mb-4" />
                            <h3 className="text-sm font-black text-white uppercase tracking-widest mb-1">Nenhum Resultado</h3>
                            <p className="text-gray-500 font-bold text-[10px] uppercase tracking-widest">Tente alterar os filtros.</p>
                        </div>
                    )}
                </div>

                {/* PAGINAÇÃO */}
                {totalPages > 1 && (
                    <div className="mt-12 mb-8 flex items-center justify-center gap-2">
                        <button disabled={currentPage === 1} onClick={() => setCurrentPage(prev => prev - 1)} className="p-2 rounded-lg bg-[#0F0F13] text-gray-400 border border-white/5 disabled:opacity-30 hover:bg-white/10 hover:text-white transition-colors">
                            <ChevronLeft className="w-4 h-4" />
                        </button>
                        
                        <div className="flex items-center gap-1">
                            {[...Array(totalPages)].map((_, i) => {
                                if (totalPages > 5 && (i + 1 !== 1 && i + 1 !== totalPages && Math.abs(currentPage - (i + 1)) > 1)) {
                                    if (i + 1 === 2 || i + 1 === totalPages - 1) return <span key={i} className="text-gray-600 px-2 text-xs">...</span>;
                                    return null;
                                }
                                return (
                                    <button 
                                        key={i} 
                                        onClick={() => setCurrentPage(i + 1)} 
                                        className={`w-8 h-8 rounded-lg font-black text-xs transition-colors ${
                                            currentPage === i + 1 
                                            ? 'bg-blue-600 text-white' 
                                            : 'bg-transparent text-gray-500 hover:bg-white/10 hover:text-white'
                                        }`}
                                    >
                                        {i + 1}
                                    </button>
                                );
                            })}
                        </div>
                        
                        <button disabled={currentPage === totalPages} onClick={() => setCurrentPage(prev => prev + 1)} className="p-2 rounded-lg bg-[#0F0F13] text-gray-400 border border-white/5 disabled:opacity-30 hover:bg-white/10 hover:text-white transition-colors">
                            <ChevronRight className="w-4 h-4" />
                        </button>
                    </div>
                )}
            </div>
        </div>
    );
}
