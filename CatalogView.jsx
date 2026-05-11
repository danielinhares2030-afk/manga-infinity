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

    // Lógica de Filtro e Busca
    const filteredMangas = useMemo(() => {
        let result = [...mangas];

        // 1. Busca por Texto
        if (searchQuery.trim() !== '') {
            const lowerQ = searchQuery.toLowerCase();
            result = result.filter(m => 
                m.title.toLowerCase().includes(lowerQ) || 
                (m.author && m.author.toLowerCase().includes(lowerQ)) ||
                (m.genres && m.genres.some(g => typeof g === 'string' && g.toLowerCase().includes(lowerQ)))
            );
        }

        const normalize = (str) => str.normalize("NFD").replace(/[\u0300-\u036f]/g, "").toLowerCase();

        // 2. Filtro de Tipo
        if (selectedType !== 'Todos') {
            const fType = normalize(selectedType);
            result = result.filter(m => {
                if (!m.type) return false;
                if (fType === 'manga' && normalize(m.type) === 'manga') return true;
                return normalize(m.type) === fType;
            });
        }

        // 3. Filtro de Gênero
        if (selectedGenre !== 'Todos') {
            const fGenre = normalize(selectedGenre);
            result = result.filter(m => m.genres && m.genres.map(g => normalize(g)).includes(fGenre));
        }

        // 4. Ordenação
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
        <div className="pb-24 animate-in fade-in duration-700 bg-[#050505] min-h-screen relative font-sans text-white overflow-x-hidden">
            
            {/* Luz de Fundo Imersiva */}
            <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[800px] h-[400px] bg-gradient-to-b from-blue-900/10 to-transparent blur-[120px] pointer-events-none z-0"></div>

            <div className="px-4 md:px-8 max-w-7xl mx-auto relative z-10 pt-8">
                
                {/* BARRA DE PESQUISA E BOTÃO DE FILTRO */}
                <div className="flex flex-col md:flex-row gap-3 mb-6">
                    <div className="relative flex-1 group">
                        <Search className="absolute left-5 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-500 group-focus-within:text-blue-500 transition-colors duration-300" />
                        <input 
                            type="text" 
                            placeholder="Pesquisar obras..." 
                            value={searchQuery}
                            onChange={(e) => { setSearchQuery(e.target.value); setCurrentPage(1); }}
                            className="w-full bg-[#0a0a0c]/80 backdrop-blur-xl border border-white/5 rounded-2xl py-4 pl-14 pr-4 text-sm text-white outline-none focus:border-blue-500/50 focus:bg-[#111] transition-all shadow-lg placeholder:text-gray-600"
                        />
                    </div>
                    <button 
                        onClick={() => setIsFilterOpen(!isFilterOpen)}
                        className={`flex items-center justify-center gap-2 px-8 py-4 rounded-2xl font-black text-[10px] uppercase tracking-widest transition-all duration-300 backdrop-blur-xl border ${isFilterOpen ? 'bg-blue-600 text-white border-blue-500 shadow-[0_0_20px_rgba(59,130,246,0.3)]' : 'bg-[#0a0a0c]/80 text-gray-400 border-white/5 hover:text-white hover:bg-white/5'}`}
                    >
                        {isFilterOpen ? <X className="w-4 h-4" /> : <SlidersHorizontal className="w-4 h-4" />}
                        Filtros
                    </button>
                </div>

                {/* PAINEL DE FILTROS AVANÇADOS (EXPANSÍVEL) */}
                <div className={`transition-all duration-500 ease-in-out overflow-hidden ${isFilterOpen ? 'max-h-[800px] opacity-100 mb-8' : 'max-h-0 opacity-0 mb-0'}`}>
                    <div className="bg-[#0a0a0c]/80 backdrop-blur-2xl border border-white/5 rounded-3xl p-6 md:p-8 shadow-2xl grid grid-cols-1 md:grid-cols-3 gap-8">
                        
                        {/* Organizar Por */}
                        <div>
                            <h3 className="text-[10px] font-black text-gray-500 uppercase tracking-widest mb-4">Organizar Por</h3>
                            <div className="flex flex-wrap gap-2">
                                {sortOptions.map(opt => (
                                    <button key={opt} onClick={() => { setSortBy(opt); setCurrentPage(1); }} className={`px-4 py-2 rounded-xl text-[10px] font-bold uppercase tracking-widest transition-all ${sortBy === opt ? 'bg-blue-600/20 text-blue-400 border border-blue-500/50' : 'bg-[#111] text-gray-400 border border-white/5 hover:bg-white/5'}`}>
                                        {opt}
                                    </button>
                                ))}
                            </div>
                        </div>

                        {/* Tipo de Obra */}
                        <div>
                            <h3 className="text-[10px] font-black text-gray-500 uppercase tracking-widest mb-4">Formato</h3>
                            <div className="flex flex-wrap gap-2">
                                {types.map(opt => (
                                    <button key={opt} onClick={() => { setSelectedType(opt); setCurrentPage(1); }} className={`px-4 py-2 rounded-xl text-[10px] font-bold uppercase tracking-widest transition-all ${selectedType === opt ? 'bg-purple-600/20 text-purple-400 border border-purple-500/50' : 'bg-[#111] text-gray-400 border border-white/5 hover:bg-white/5'}`}>
                                        {opt}
                                    </button>
                                ))}
                            </div>
                        </div>

                        {/* Gêneros */}
                        <div>
                            <h3 className="text-[10px] font-black text-gray-500 uppercase tracking-widest mb-4">Gêneros</h3>
                            <div className="flex flex-wrap gap-2">
                                {genresList.map(opt => (
                                    <button key={opt} onClick={() => { setSelectedGenre(opt); setCurrentPage(1); }} className={`px-4 py-2 rounded-xl text-[10px] font-bold uppercase tracking-widest transition-all ${selectedGenre === opt ? 'bg-emerald-600/20 text-emerald-400 border border-emerald-500/50' : 'bg-[#111] text-gray-400 border border-white/5 hover:bg-white/5'}`}>
                                        {opt}
                                    </button>
                                ))}
                            </div>
                        </div>

                    </div>
                </div>

                <div className="flex items-center justify-between mb-6 border-b border-white/5 pb-4">
                    <span className="text-[10px] font-black text-gray-500 uppercase tracking-widest">
                        Encontradas <span className="text-white">{filteredMangas.length}</span> obras
                    </span>
                </div>

                {/* GRADE DE OBRAS */}
                <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-4 md:gap-6">
                    {currentItems.length > 0 ? currentItems.map(manga => (
                        <div key={manga.id} onClick={() => onNavigate('details', manga)} className="cursor-pointer group flex flex-col relative">
                            <div className={`relative aspect-[2/3] rounded-[1.5rem] overflow-hidden bg-[#0a0a0c] border border-white/5 transition-all duration-500 group-hover:border-blue-500/50 group-hover:shadow-[0_15px_40px_rgba(59,130,246,0.15)] ${dataSaver ? 'blur-[1px]' : ''}`}>
                                <img src={manga.coverUrl} className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700 ease-out" loading="lazy" onError={(e) => e.target.src = `https://placehold.co/300x450/050505/3b82f6?text=Oculto`} />
                                
                                {manga.chapters && manga.chapters.length > 0 && (
                                    <div className="absolute top-3 left-3 bg-black/70 backdrop-blur-md border border-white/10 text-white text-[9px] font-black px-2.5 py-1.5 rounded-lg uppercase tracking-widest shadow-lg">
                                        Cap {manga.chapters[0].number}
                                    </div>
                                )}

                                <div className="absolute top-3 right-3 bg-black/70 backdrop-blur-md px-2 py-1.5 rounded-lg border border-white/10 flex items-center gap-1 shadow-lg">
                                    <Star className="w-3 h-3 text-amber-400 fill-amber-400 drop-shadow-[0_0_5px_rgba(251,191,36,0.5)]" />
                                    <span className="text-[10px] font-black text-white">{manga.rating ? Number(manga.rating).toFixed(1) : "5.0"}</span>
                                </div>
                                
                                <div className="absolute inset-0 bg-gradient-to-t from-[#050505] via-[#050505]/20 to-transparent p-4 flex flex-col justify-end opacity-90 group-hover:opacity-100 transition-opacity duration-300">
                                    <p className="text-[9px] text-gray-400 font-bold uppercase tracking-widest flex items-center gap-1.5">
                                        <Clock className="w-3 h-3 text-blue-500"/> {timeAgo(manga.createdAt)}
                                    </p>
                                </div>
                            </div>
                            
                            <h3 className="font-bold text-sm text-gray-300 line-clamp-2 leading-snug group-hover:text-blue-400 transition-colors duration-300 px-1 mt-3">
                                {manga.title}
                            </h3>
                        </div>
                    )) : (
                        <div className="col-span-full py-32 flex flex-col items-center justify-center bg-[#0a0a0c]/50 rounded-[2rem] border border-white/5 border-dashed">
                            <Moon className="w-12 h-12 text-gray-600 mb-5 animate-pulse" />
                            <h3 className="text-xl font-black text-white uppercase tracking-widest mb-2">Nada Encontrado</h3>
                            <p className="text-gray-500 font-bold text-[10px] uppercase tracking-[0.2em] text-center max-w-sm">
                                As sombras engoliram os resultados. Tente ajustar seus filtros de busca.
                            </p>
                        </div>
                    )}
                </div>

                {/* PAGINAÇÃO */}
                {totalPages > 1 && (
                    <div className="mt-16 mb-8 flex items-center justify-center gap-3">
                        <button disabled={currentPage === 1} onClick={() => setCurrentPage(prev => prev - 1)} className="p-3 rounded-2xl bg-[#0a0a0c] text-gray-400 border border-white/5 disabled:opacity-30 hover:bg-white hover:text-black transition-all shadow-md">
                            <ChevronLeft className="w-5 h-5" />
                        </button>
                        
                        <div className="flex items-center gap-1.5 bg-[#0a0a0c] p-1.5 rounded-[1.25rem] border border-white/5 shadow-md">
                            {[...Array(totalPages)].map((_, i) => {
                                if (totalPages > 5 && (i + 1 !== 1 && i + 1 !== totalPages && Math.abs(currentPage - (i + 1)) > 1)) {
                                    if (i + 1 === 2 || i + 1 === totalPages - 1) return <span key={i} className="text-gray-600 px-3 font-black text-xs tracking-widest">...</span>;
                                    return null;
                                }
                                return (
                                    <button 
                                        key={i} 
                                        onClick={() => setCurrentPage(i + 1)} 
                                        className={`w-11 h-11 rounded-xl font-black text-xs transition-all duration-300 ${
                                            currentPage === i + 1 
                                            ? 'bg-blue-600 text-white shadow-[0_0_20px_rgba(59,130,246,0.4)]' 
                                            : 'bg-transparent text-gray-500 hover:bg-white/10 hover:text-white'
                                        }`}
                                    >
                                        {i + 1}
                                    </button>
                                );
                            })}
                        </div>
                        
                        <button disabled={currentPage === totalPages} onClick={() => setCurrentPage(prev => prev + 1)} className="p-3 rounded-2xl bg-[#0a0a0c] text-gray-400 border border-white/5 disabled:opacity-30 hover:bg-white hover:text-black transition-all shadow-md">
                            <ChevronRight className="w-5 h-5" />
                        </button>
                    </div>
                )}
            </div>
        </div>
    );
}
