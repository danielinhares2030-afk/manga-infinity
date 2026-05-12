import React, { useState, useMemo } from 'react';
import { Search, Star, Clock, ChevronRight, ChevronLeft, Moon, SlidersHorizontal, X, Filter } from 'lucide-react';
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

    const types = ['Todos', 'Manhwa', 'Mangá', 'Manhua', 'Shoujo', 'Seinen'];
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
                if (!m.type && !m.genres) return false;
                const typeMatch = m.type && normalize(m.type) === fType;
                const genreMatch = m.genres && m.genres.map(g => normalize(g)).includes(fType);
                if (fType === 'manga' && normalize(m.type || '') === 'manga') return true;
                return typeMatch || genreMatch;
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

    // Identificar a origem/tipo para a tag do card
    const getOriginTag = (manga) => {
        if (manga.type) return manga.type;
        if (manga.genres) {
            const lowerGenres = manga.genres.map(g => g.toLowerCase());
            if (lowerGenres.includes('manhwa')) return 'Manhwa';
            if (lowerGenres.includes('manhua')) return 'Manhua';
            if (lowerGenres.includes('shoujo')) return 'Shoujo';
            if (lowerGenres.includes('seinen')) return 'Seinen';
        }
        return 'Mangá';
    };

    return (
        <div className="pb-32 animate-in fade-in duration-500 bg-[#06040A] min-h-screen relative font-sans text-white overflow-x-hidden selection:bg-purple-500/30">
            
            {/* EFEITO DE LUZ DE FUNDO */}
            <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full max-w-3xl h-[400px] bg-purple-900/20 blur-[120px] pointer-events-none rounded-full"></div>

            <div className="px-4 md:px-8 max-w-7xl mx-auto pt-10 relative z-10">
                
                {/* BARRA DE PESQUISA ELEGANTE */}
                <div className="max-w-2xl mx-auto mb-10">
                    <div className="relative group">
                        <div className="absolute -inset-0.5 bg-gradient-to-r from-purple-600 to-fuchsia-600 rounded-2xl blur opacity-20 group-focus-within:opacity-50 transition duration-500"></div>
                        <div className="relative flex items-center bg-[#0D0B12] rounded-2xl border border-white/5 overflow-hidden">
                            <Search className="absolute left-5 w-5 h-5 text-gray-500 group-focus-within:text-purple-400 transition-colors" />
                            <input 
                                type="text" 
                                placeholder="Buscar no catálogo..." 
                                value={searchQuery}
                                onChange={(e) => { setSearchQuery(e.target.value); setCurrentPage(1); }}
                                className="w-full bg-transparent py-4 pl-14 pr-4 text-sm text-white outline-none placeholder-gray-600 font-medium"
                            />
                        </div>
                    </div>
                    <div className="text-center mt-4">
                        <span className="text-[10px] font-black text-gray-500 uppercase tracking-[0.2em]">
                            {filteredMangas.length} Obras Encontradas
                        </span>
                    </div>
                </div>

                {/* GRADE DE OBRAS (CARDS PREMIUM) */}
                <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-4 md:gap-6">
                    {currentItems.length > 0 ? currentItems.map(manga => (
                        <div key={manga.id} onClick={() => onNavigate('details', manga)} className="cursor-pointer group flex flex-col relative perspective-1000">
                            
                            <div className={`relative aspect-[1/1.4] rounded-2xl overflow-hidden bg-[#111] shadow-[0_10px_30px_rgba(0,0,0,0.5)] transform transition-all duration-500 group-hover:-translate-y-2 group-hover:shadow-[0_20px_40px_rgba(168,85,247,0.15)] border border-white/5 group-hover:border-purple-500/30 ${dataSaver ? 'blur-[1px]' : ''}`}>
                                
                                <img src={manga.coverUrl} className="w-full h-full object-cover transform transition-transform duration-700 group-hover:scale-110 opacity-90 group-hover:opacity-100" loading="lazy" alt={manga.title} />
                                
                                <div className="absolute inset-0 bg-gradient-to-t from-black via-black/20 to-transparent opacity-80 group-hover:opacity-90 transition-opacity"></div>
                                
                                {/* TAG DE ORIGEM/TIPO NO LUGAR DO CAPÍTULO */}
                                <div className="absolute top-2 left-2 bg-purple-600/90 backdrop-blur-md border border-purple-400/30 text-white text-[9px] font-black px-2.5 py-1 rounded-lg uppercase tracking-widest shadow-lg">
                                    {getOriginTag(manga)}
                                </div>

                                {/* AVALIAÇÃO */}
                                <div className="absolute top-2 right-2 bg-black/60 backdrop-blur-md px-2 py-1 rounded-lg border border-white/10 flex items-center gap-1 shadow-lg">
                                    <Star className="w-3 h-3 text-amber-400 fill-amber-400" />
                                    <span className="text-[10px] font-black text-white">{manga.rating ? Number(manga.rating).toFixed(1) : "5.0"}</span>
                                </div>
                                
                                {/* INFORMAÇÕES DO RODAPÉ DO CARD */}
                                <div className="absolute bottom-0 w-full p-3 md:p-4 transform translate-y-1 group-hover:translate-y-0 transition-transform duration-300">
                                    <h3 className="font-bold text-sm text-gray-100 line-clamp-2 leading-tight group-hover:text-purple-300 transition-colors drop-shadow-md">
                                        {manga.title}
                                    </h3>
                                    <p className="text-[10px] text-gray-400 font-bold uppercase tracking-widest flex items-center gap-1 mt-2 opacity-80 group-hover:opacity-100 transition-opacity">
                                        <Clock className="w-3 h-3 text-fuchsia-500"/> {timeAgo(manga.createdAt)}
                                    </p>
                                </div>

                            </div>
                        </div>
                    )) : (
                        <div className="col-span-full py-24 flex flex-col items-center justify-center bg-[#0D0B12] rounded-3xl border border-white/5">
                            <Moon className="w-12 h-12 text-purple-900 mb-6 animate-pulse" />
                            <h3 className="text-base font-black text-white uppercase tracking-[0.2em] mb-2">O Vazio Infinito</h3>
                            <p className="text-gray-500 font-bold text-[10px] uppercase tracking-widest">Nenhuma obra encontrada nestes reinos.</p>
                        </div>
                    )}
                </div>

                {/* PAGINAÇÃO */}
                {totalPages > 1 && (
                    <div className="mt-16 mb-8 flex items-center justify-center gap-2">
                        <button disabled={currentPage === 1} onClick={() => setCurrentPage(prev => prev - 1)} className="p-3 rounded-xl bg-[#0D0B12] text-gray-400 border border-white/5 disabled:opacity-30 hover:bg-white/10 hover:text-white transition-all hover:-translate-x-1">
                            <ChevronLeft className="w-4 h-4" />
                        </button>
                        
                        <div className="flex items-center gap-1.5 px-2">
                            {[...Array(totalPages)].map((_, i) => {
                                if (totalPages > 5 && (i + 1 !== 1 && i + 1 !== totalPages && Math.abs(currentPage - (i + 1)) > 1)) {
                                    if (i + 1 === 2 || i + 1 === totalPages - 1) return <span key={i} className="text-gray-600 px-1 text-sm font-black tracking-widest">...</span>;
                                    return null;
                                }
                                return (
                                    <button 
                                        key={i} 
                                        onClick={() => setCurrentPage(i + 1)} 
                                        className={`w-10 h-10 rounded-xl font-black text-xs transition-all ${
                                            currentPage === i + 1 
                                            ? 'bg-gradient-to-br from-purple-600 to-fuchsia-600 text-white shadow-[0_0_15px_rgba(168,85,247,0.4)] scale-110' 
                                            : 'bg-transparent text-gray-500 border border-transparent hover:border-white/10 hover:bg-white/5 hover:text-white'
                                        }`}
                                    >
                                        {i + 1}
                                    </button>
                                );
                            })}
                        </div>
                        
                        <button disabled={currentPage === totalPages} onClick={() => setCurrentPage(prev => prev + 1)} className="p-3 rounded-xl bg-[#0D0B12] text-gray-400 border border-white/5 disabled:opacity-30 hover:bg-white/10 hover:text-white transition-all hover:translate-x-1">
                            <ChevronRight className="w-4 h-4" />
                        </button>
                    </div>
                )}
            </div>

            {/* ========================================= */}
            {/* BOTÃO FLUTUANTE DE FILTROS (BOTTOM FAB)   */}
            {/* ========================================= */}
            <div className="fixed bottom-20 md:bottom-10 left-1/2 -translate-x-1/2 z-40">
                <button 
                    onClick={() => setIsFilterOpen(true)}
                    className="group bg-black/60 backdrop-blur-xl border border-white/10 shadow-[0_10px_40px_rgba(0,0,0,0.8)] px-8 py-4 rounded-full flex items-center gap-3 transition-all hover:scale-105 hover:border-purple-500/50"
                >
                    <Filter className="w-4 h-4 text-purple-400 group-hover:text-fuchsia-400 transition-colors" />
                    <span className="text-[10px] font-black text-white uppercase tracking-[0.2em]">Filtros & Ordem</span>
                </button>
            </div>

            {/* ========================================= */}
            {/* MODAL DE FILTROS (BOTTOM SHEET)           */}
            {/* ========================================= */}
            {isFilterOpen && (
                <div className="fixed inset-0 z-[100] flex items-end justify-center pointer-events-none">
                    {/* Backdrop */}
                    <div className="absolute inset-0 bg-black/60 backdrop-blur-sm pointer-events-auto transition-opacity duration-300" onClick={() => setIsFilterOpen(false)}></div>
                    
                    {/* Sheet Content */}
                    <div className="bg-[#0D0B12] w-full max-w-3xl rounded-t-[2.5rem] border-t border-purple-500/20 p-6 md:p-8 pb-12 pointer-events-auto animate-in slide-in-from-bottom-full duration-300 shadow-[0_-20px_50px_rgba(0,0,0,0.8)]">
                        
                        {/* Indicador de arrasto (Visual) */}
                        <div className="w-16 h-1.5 bg-white/10 rounded-full mx-auto mb-8"></div>
                        
                        <div className="flex justify-between items-center mb-8 px-2">
                            <div className="flex items-center gap-3">
                                <SlidersHorizontal className="w-5 h-5 text-purple-500" />
                                <h2 className="text-lg font-black text-white uppercase tracking-[0.2em]">Refinar Busca</h2>
                            </div>
                            <button onClick={() => setIsFilterOpen(false)} className="w-10 h-10 rounded-full bg-white/5 flex items-center justify-center hover:bg-white/10 hover:text-fuchsia-400 transition-colors">
                                <X className="w-5 h-5" />
                            </button>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 px-2">
                            
                            {/* Bloco: Ordem */}
                            <div>
                                <h3 className="text-[10px] font-black text-purple-400 uppercase tracking-[0.2em] mb-4">Organizar Por</h3>
                                <div className="flex flex-wrap gap-2">
                                    {sortOptions.map(opt => (
                                        <button key={opt} onClick={() => { setSortBy(opt); setCurrentPage(1); }} className={`px-4 py-2.5 rounded-xl text-[10px] font-bold uppercase tracking-widest transition-all ${sortBy === opt ? 'bg-purple-600 text-white shadow-[0_0_15px_rgba(168,85,247,0.4)]' : 'bg-[#15121C] text-gray-400 border border-white/5 hover:border-purple-500/30 hover:text-white'}`}>
                                            {opt}
                                        </button>
                                    ))}
                                </div>
                            </div>

                            {/* Bloco: Formato */}
                            <div>
                                <h3 className="text-[10px] font-black text-purple-400 uppercase tracking-[0.2em] mb-4">Formato</h3>
                                <div className="flex flex-wrap gap-2">
                                    {types.map(opt => (
                                        <button key={opt} onClick={() => { setSelectedType(opt); setCurrentPage(1); }} className={`px-4 py-2.5 rounded-xl text-[10px] font-bold uppercase tracking-widest transition-all ${selectedType === opt ? 'bg-fuchsia-600 text-white shadow-[0_0_15px_rgba(217,70,239,0.4)]' : 'bg-[#15121C] text-gray-400 border border-white/5 hover:border-fuchsia-500/30 hover:text-white'}`}>
                                            {opt}
                                        </button>
                                    ))}
                                </div>
                            </div>

                            {/* Bloco: Gêneros */}
                            <div className="md:col-span-3 mt-2">
                                <h3 className="text-[10px] font-black text-purple-400 uppercase tracking-[0.2em] mb-4">Gêneros</h3>
                                <div className="flex flex-wrap gap-2">
                                    {genresList.map(opt => (
                                        <button key={opt} onClick={() => { setSelectedGenre(opt); setCurrentPage(1); }} className={`px-4 py-2.5 rounded-xl text-[10px] font-bold uppercase tracking-widest transition-all ${selectedGenre === opt ? 'bg-purple-600 text-white shadow-[0_0_15px_rgba(168,85,247,0.4)]' : 'bg-[#15121C] text-gray-400 border border-white/5 hover:border-purple-500/30 hover:text-white'}`}>
                                            {opt}
                                        </button>
                                    ))}
                                </div>
                            </div>

                        </div>
                        
                        <div className="mt-10 px-2">
                            <button onClick={() => setIsFilterOpen(false)} className="w-full py-4 bg-white text-black rounded-2xl font-black text-xs uppercase tracking-[0.2em] hover:bg-gray-200 transition-colors shadow-[0_0_30px_rgba(255,255,255,0.1)]">
                                Aplicar Filtros ({filteredMangas.length})
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
