import React, { useState, useMemo } from 'react';
import { Search, Star, Clock, ChevronRight, ChevronLeft, Moon, SlidersHorizontal, X, Filter, Flame } from 'lucide-react';
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

    // Cores dinâmicas para as tags de origem (Para não ficar só roxo)
    const getTagColor = (type) => {
        const lower = type.toLowerCase();
        if (lower === 'manhwa') return 'from-indigo-600 to-blue-600 text-white shadow-indigo-500/40';
        if (lower === 'manhua') return 'from-rose-600 to-red-600 text-white shadow-rose-500/40';
        if (lower === 'shoujo') return 'from-pink-500 to-rose-400 text-white shadow-pink-500/40';
        if (lower === 'seinen') return 'from-slate-700 to-gray-900 text-white shadow-black/50';
        return 'from-purple-600 to-fuchsia-600 text-white shadow-purple-500/40'; // Padrão
    };

    return (
        <div className="pb-32 animate-in fade-in duration-500 bg-[#050308] min-h-screen relative font-sans text-white overflow-x-hidden selection:bg-fuchsia-500/30">
            
            <div className="px-4 md:px-8 max-w-7xl mx-auto pt-6 relative z-10">
                
                {/* HERO BANNER - CATÁLOGO INFERIA COM FOTO BONITA */}
                <div className="relative w-full h-48 md:h-64 rounded-3xl overflow-hidden mb-10 shadow-[0_10px_40px_rgba(0,0,0,0.8)] border border-white/5">
                    {/* Imagem de fundo bonita (Uma paisagem épica escura/neon) */}
                    <img 
                        src="https://images.unsplash.com/photo-1618336753974-aae8e04506aa?q=80&w=2070&auto=format&fit=crop" 
                        alt="Catálogo Inferia Banner" 
                        className="w-full h-full object-cover saturate-150 contrast-125"
                    />
                    
                    {/* Degradê misturando as novas cores */}
                    <div className="absolute inset-0 bg-gradient-to-r from-[#050308] via-[#050308]/80 to-transparent"></div>
                    <div className="absolute inset-0 bg-gradient-to-t from-[#050308] via-transparent to-transparent"></div>
                    
                    <div className="absolute bottom-6 left-6 md:bottom-10 md:left-10 z-10">
                        <div className="flex items-center gap-2 mb-1">
                            <Flame className="w-5 h-5 text-fuchsia-500" />
                            <span className="text-fuchsia-500 text-[10px] font-black uppercase tracking-[0.3em]">Explorar o Vazio</span>
                        </div>
                        <h1 className="text-3xl md:text-5xl font-black text-transparent bg-clip-text bg-gradient-to-r from-indigo-400 via-purple-400 to-pink-400 tracking-tighter uppercase drop-shadow-lg">
                            Catálogo Inferia
                        </h1>
                    </div>
                </div>

                {/* BARRA DE PESQUISA E BOTÃO DE FILTROS */}
                <div className="flex flex-col md:flex-row gap-4 mb-10 max-w-4xl">
                    <div className="relative flex-1 group">
                        <div className="absolute -inset-0.5 bg-gradient-to-r from-indigo-500 via-purple-500 to-fuchsia-500 rounded-2xl blur opacity-20 group-focus-within:opacity-50 transition duration-500"></div>
                        <div className="relative flex items-center bg-[#0B0910] rounded-2xl border border-white/10 overflow-hidden">
                            <Search className="absolute left-5 w-5 h-5 text-gray-500 group-focus-within:text-fuchsia-400 transition-colors" />
                            <input 
                                type="text" 
                                placeholder="Buscar por título, autor ou gênero..." 
                                value={searchQuery}
                                onChange={(e) => { setSearchQuery(e.target.value); setCurrentPage(1); }}
                                className="w-full bg-transparent py-4 pl-14 pr-4 text-sm text-white outline-none placeholder-gray-600 font-medium"
                            />
                        </div>
                    </div>
                    
                    <button 
                        onClick={() => setIsFilterOpen(true)}
                        className="flex-shrink-0 bg-[#0B0910] border border-white/10 hover:border-purple-500/50 hover:bg-white/5 px-8 py-4 rounded-2xl flex items-center justify-center gap-3 transition-all duration-300 group"
                    >
                        <Filter className="w-4 h-4 text-gray-400 group-hover:text-fuchsia-400 transition-colors" />
                        <span className="text-[10px] font-black text-gray-300 group-hover:text-white uppercase tracking-[0.2em]">Refinar</span>
                    </button>
                </div>

                {/* CONTADOR DE OBRAS */}
                <div className="flex items-center gap-4 mb-6">
                    <div className="h-px bg-gradient-to-r from-fuchsia-500/50 to-transparent flex-1"></div>
                    <span className="text-[10px] font-black text-gray-500 uppercase tracking-[0.2em]">
                        {filteredMangas.length} Obras Encontradas
                    </span>
                    <div className="h-px bg-gradient-to-l from-indigo-500/50 to-transparent flex-1"></div>
                </div>

                {/* GRADE DE OBRAS (CARDS PREMIUM REDESENHADOS) */}
                <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-4 md:gap-6">
                    {currentItems.length > 0 ? currentItems.map(manga => {
                        const origin = getOriginTag(manga);
                        const tagColor = getTagColor(origin);

                        return (
                            <div key={manga.id} onClick={() => onNavigate('details', manga)} className="cursor-pointer group flex flex-col relative perspective-1000">
                                
                                <div className={`relative aspect-[1/1.4] rounded-2xl overflow-hidden bg-[#0B0910] shadow-[0_10px_20px_rgba(0,0,0,0.5)] transform transition-all duration-500 group-hover:-translate-y-2 group-hover:shadow-[0_20px_40px_rgba(168,85,247,0.2)] border border-white/5 group-hover:border-fuchsia-500/40 ${dataSaver ? 'blur-[1px]' : ''}`}>
                                    
                                    <img src={manga.coverUrl} className="w-full h-full object-cover transform transition-transform duration-700 group-hover:scale-110 opacity-90 group-hover:opacity-100" loading="lazy" alt={manga.title} />
                                    
                                    {/* Degradê do card (Escurece mais em baixo para leitura) */}
                                    <div className="absolute inset-0 bg-gradient-to-t from-[#050308] via-[#050308]/40 to-transparent opacity-90 group-hover:opacity-100 transition-opacity"></div>
                                    
                                    {/* TAG DE ORIGEM (Colorida dinamicamente) */}
                                    <div className={`absolute top-2 left-2 bg-gradient-to-r ${tagColor} text-[8px] font-black px-2.5 py-1 rounded-md uppercase tracking-widest shadow-lg`}>
                                        {origin}
                                    </div>

                                    {/* AVALIAÇÃO */}
                                    <div className="absolute top-2 right-2 bg-black/60 backdrop-blur-md px-2 py-1 rounded-md border border-white/10 flex items-center gap-1 shadow-lg">
                                        <Star className="w-2.5 h-2.5 text-amber-400 fill-amber-400" />
                                        <span className="text-[9px] font-black text-white">{manga.rating ? Number(manga.rating).toFixed(1) : "5.0"}</span>
                                    </div>
                                    
                                    {/* INFORMAÇÕES DO RODAPÉ DO CARD */}
                                    <div className="absolute bottom-0 w-full p-3 md:p-4 transform translate-y-1 group-hover:translate-y-0 transition-transform duration-300">
                                        <h3 className="font-bold text-sm text-gray-100 line-clamp-2 leading-tight group-hover:text-fuchsia-300 transition-colors drop-shadow-md">
                                            {manga.title}
                                        </h3>
                                        <div className="flex items-center justify-between mt-2 opacity-80 group-hover:opacity-100 transition-opacity">
                                            <p className="text-[9px] text-gray-400 font-bold uppercase tracking-widest flex items-center gap-1">
                                                <Clock className="w-3 h-3 text-indigo-400"/> {timeAgo(manga.createdAt)}
                                            </p>
                                            <div className="w-6 h-6 rounded-full bg-white/10 flex items-center justify-center backdrop-blur-md border border-white/5 group-hover:bg-fuchsia-500 transition-colors">
                                                <ChevronRight className="w-3 h-3 text-white" />
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        );
                    }) : (
                        <div className="col-span-full py-24 flex flex-col items-center justify-center bg-[#0B0910] rounded-3xl border border-white/5 shadow-inner">
                            <Moon className="w-12 h-12 text-indigo-900 mb-6 animate-pulse" />
                            <h3 className="text-base font-black text-white uppercase tracking-[0.2em] mb-2">O Vazio Infinito</h3>
                            <p className="text-gray-500 font-bold text-[10px] uppercase tracking-widest">Nenhuma obra encontrada nestes reinos.</p>
                        </div>
                    )}
                </div>

                {/* PAGINAÇÃO */}
                {totalPages > 1 && (
                    <div className="mt-16 mb-8 flex items-center justify-center gap-2">
                        <button disabled={currentPage === 1} onClick={() => setCurrentPage(prev => prev - 1)} className="p-3 rounded-xl bg-[#0B0910] text-gray-400 border border-white/5 disabled:opacity-30 hover:bg-white/10 hover:text-white transition-all hover:-translate-x-1">
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
                                            ? 'bg-gradient-to-br from-indigo-500 via-purple-500 to-fuchsia-500 text-white shadow-[0_0_15px_rgba(217,70,239,0.4)] scale-110 border-none' 
                                            : 'bg-transparent text-gray-500 border border-transparent hover:border-white/10 hover:bg-white/5 hover:text-white'
                                        }`}
                                    >
                                        {i + 1}
                                    </button>
                                );
                            })}
                        </div>
                        
                        <button disabled={currentPage === totalPages} onClick={() => setCurrentPage(prev => prev + 1)} className="p-3 rounded-xl bg-[#0B0910] text-gray-400 border border-white/5 disabled:opacity-30 hover:bg-white/10 hover:text-white transition-all hover:translate-x-1">
                            <ChevronRight className="w-4 h-4" />
                        </button>
                    </div>
                )}
            </div>

            {/* ========================================= */}
            {/* DRAWER LATERAL DE FILTROS (Canto Direito) */}
            {/* ========================================= */}
            {isFilterOpen && (
                <div className="fixed inset-0 z-[100] flex justify-end pointer-events-none">
                    
                    {/* Backdrop (Fundo Escuro) - Clique para fechar */}
                    <div 
                        className="absolute inset-0 bg-black/70 backdrop-blur-sm pointer-events-auto transition-opacity duration-300" 
                        onClick={() => setIsFilterOpen(false)}
                    ></div>
                    
                    {/* Menu Lateral (Gaveta) - Fica no canto e não no meio */}
                    <div className="w-full max-w-[280px] sm:max-w-xs h-full bg-[#0B0910] border-l border-white/5 pointer-events-auto flex flex-col animate-in slide-in-from-right duration-300 shadow-[-20px_0_50px_rgba(0,0,0,0.8)] relative z-10">
                        
                        {/* Cabeçalho do Drawer */}
                        <div className="flex items-center justify-between p-6 border-b border-white/5 bg-[#050308]">
                            <div className="flex items-center gap-3">
                                <SlidersHorizontal className="w-5 h-5 text-fuchsia-500" />
                                <span className="font-black text-white uppercase tracking-[0.2em] text-sm">Filtros</span>
                            </div>
                            <button onClick={() => setIsFilterOpen(false)} className="w-8 h-8 rounded-full bg-white/5 flex items-center justify-center hover:bg-white/10 hover:text-fuchsia-400 transition-colors">
                                <X className="w-4 h-4" />
                            </button>
                        </div>
                        
                        {/* Corpo do Drawer (Scrollable) */}
                        <div className="flex-1 overflow-y-auto p-6 space-y-8 custom-scrollbar">
                            
                            {/* Bloco: Ordem */}
                            <div>
                                <h3 className="text-[9px] font-black text-indigo-400 uppercase tracking-[0.2em] mb-4 flex items-center gap-2"><Star className="w-3 h-3"/> Organizar Por</h3>
                                <div className="flex flex-col gap-2">
                                    {sortOptions.map(opt => (
                                        <button key={opt} onClick={() => { setSortBy(opt); setCurrentPage(1); }} className={`px-4 py-3 rounded-xl text-[10px] font-bold uppercase tracking-widest text-left transition-all ${sortBy === opt ? 'bg-gradient-to-r from-indigo-600 to-purple-600 text-white shadow-md' : 'bg-[#15121C] text-gray-400 border border-white/5 hover:border-indigo-500/30 hover:text-white'}`}>
                                            {opt}
                                        </button>
                                    ))}
                                </div>
                            </div>

                            {/* Bloco: Formato */}
                            <div>
                                <h3 className="text-[9px] font-black text-fuchsia-400 uppercase tracking-[0.2em] mb-4 flex items-center gap-2"><BookOpen className="w-3 h-3"/> Formato da Obra</h3>
                                <div className="flex flex-wrap gap-2">
                                    {types.map(opt => (
                                        <button key={opt} onClick={() => { setSelectedType(opt); setCurrentPage(1); }} className={`px-4 py-2.5 rounded-lg text-[10px] font-bold uppercase tracking-widest transition-all ${selectedType === opt ? 'bg-gradient-to-r from-fuchsia-600 to-pink-600 text-white shadow-md' : 'bg-[#15121C] text-gray-400 border border-white/5 hover:border-fuchsia-500/30 hover:text-white'}`}>
                                            {opt}
                                        </button>
                                    ))}
                                </div>
                            </div>

                            {/* Bloco: Gêneros */}
                            <div>
                                <h3 className="text-[9px] font-black text-purple-400 uppercase tracking-[0.2em] mb-4 flex items-center gap-2"><Flame className="w-3 h-3"/> Gêneros</h3>
                                <div className="flex flex-wrap gap-2">
                                    {genresList.map(opt => (
                                        <button key={opt} onClick={() => { setSelectedGenre(opt); setCurrentPage(1); }} className={`px-3 py-2 rounded-lg text-[9px] font-bold uppercase tracking-widest transition-all ${selectedGenre === opt ? 'bg-gradient-to-r from-purple-600 to-indigo-600 text-white shadow-md' : 'bg-[#15121C] text-gray-400 border border-white/5 hover:border-purple-500/30 hover:text-white'}`}>
                                            {opt}
                                        </button>
                                    ))}
                                </div>
                            </div>
                        </div>
                        
                        {/* Rodapé do Drawer */}
                        <div className="p-6 border-t border-white/5 bg-[#050308]">
                            <button onClick={() => setIsFilterOpen(false)} className="w-full py-4 bg-gradient-to-r from-indigo-600 via-purple-600 to-fuchsia-600 text-white rounded-xl font-black text-[10px] uppercase tracking-[0.2em] shadow-[0_0_20px_rgba(168,85,247,0.4)] hover:scale-[1.02] transition-transform flex items-center justify-center gap-2">
                                <Filter className="w-4 h-4"/> Ver {filteredMangas.length} Obras
                            </button>
                        </div>
                    </div>
                </div>
            )}
            
            <style dangerouslySetInnerHTML={{__html: `
                .custom-scrollbar::-webkit-scrollbar { width: 4px; }
                .custom-scrollbar::-webkit-scrollbar-track { background: transparent; }
                .custom-scrollbar::-webkit-scrollbar-thumb { background: #333; border-radius: 4px; }
                .custom-scrollbar::-webkit-scrollbar-thumb:hover { background: #666; }
            `}} />
        </div>
    );
}
