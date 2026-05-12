import React, { useState, useMemo } from 'react';
import { Search, Star, Clock, ChevronRight, ChevronLeft, Moon, SlidersHorizontal, X, Filter, Flame, BookOpen } from 'lucide-react';
import { timeAgo } from './helpers';

export function CatalogView({ mangas = [], onNavigate, dataSaver }) {
    const [searchQuery, setSearchQuery] = useState('');
    const [currentPage, setCurrentPage] = useState(1);
    const itemsPerPage = 18;

    // Estados dos Filtros
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

    // Cores das tags seguindo a paleta do documento
    const getTagColor = (type) => {
        const lower = type.toLowerCase();
        if (lower === 'manhwa') return 'bg-[#8C199C] text-[#FAFAFA] border-[#8C199C]'; // Violeta
        if (lower === 'manhua') return 'bg-[#B03D23] text-[#FAFAFA] border-[#B03D23]'; // Laranja-Avermelhado
        if (lower === 'shoujo') return 'bg-[#950606] text-[#FAFAFA] border-[#950606]'; // Vermelho Escuro
        return 'bg-[#333333] text-[#FAFAFA] border-[#333333]'; // Neutro/Cinza Escuro
    };

    return (
        <div className="pb-32 animate-in fade-in duration-500 bg-[#1B1B1B] min-h-screen relative font-sans text-[#FAFAFA] overflow-x-hidden selection:bg-[#950606]/40">
            
            <div className="px-4 md:px-8 max-w-7xl mx-auto pt-6 relative z-10">
                
                {/* HERO BANNER - CATÁLOGO INFERIA COM FOTO */}
                <div className="relative w-full h-48 md:h-64 rounded-3xl overflow-hidden mb-10 shadow-[0_10px_30px_rgba(0,0,0,0.8)] border border-white/5">
                    <img 
                        src="https://images.unsplash.com/photo-1542451313056-b7c8e626645f?q=80&w=2070&auto=format&fit=crop" 
                        alt="Catálogo Inferia" 
                        className="w-full h-full object-cover saturate-150 contrast-125 object-center"
                    />
                    
                    {/* Degradê sobre a imagem */}
                    <div className="absolute inset-0 bg-gradient-to-r from-[#1B1B1B] via-[#1B1B1B]/80 to-transparent"></div>
                    <div className="absolute inset-0 bg-gradient-to-t from-[#1B1B1B] via-transparent to-transparent"></div>
                    
                    <div className="absolute bottom-6 left-6 md:bottom-10 md:left-10 z-10">
                        <div className="flex items-center gap-2 mb-1">
                            <Flame className="w-5 h-5 text-[#B03D23]" />
                            <span className="text-[#B03D23] text-[10px] font-black uppercase tracking-[0.3em]">Explorar o Acervo</span>
                        </div>
                        <h1 className="text-3xl md:text-5xl font-black text-transparent bg-clip-text bg-gradient-to-r from-[#950606] via-[#B03D23] to-[#8C199C] tracking-tighter uppercase drop-shadow-lg">
                            Catálogo Inferia
                        </h1>
                    </div>
                </div>

                {/* BARRA DE PESQUISA E BOTÃO DE FILTROS */}
                <div className="flex flex-col md:flex-row gap-4 mb-10 max-w-4xl">
                    <div className="relative flex-1 group">
                        <div className="absolute -inset-0.5 bg-gradient-to-r from-[#950606] to-[#B03D23] rounded-2xl blur opacity-20 group-focus-within:opacity-50 transition duration-500"></div>
                        <div className="relative flex items-center bg-[#121212] rounded-2xl border border-white/10 overflow-hidden">
                            <Search className="absolute left-5 w-5 h-5 text-[#333333] group-focus-within:text-[#B03D23] transition-colors" />
                            <input 
                                type="text" 
                                placeholder="Buscar por título, autor ou gênero..." 
                                value={searchQuery}
                                onChange={(e) => { setSearchQuery(e.target.value); setCurrentPage(1); }}
                                className="w-full bg-transparent py-4 pl-14 pr-4 text-sm text-[#FAFAFA] outline-none placeholder-[#333333] font-medium"
                            />
                        </div>
                    </div>
                    
                    <button 
                        onClick={() => setIsFilterOpen(true)}
                        className="flex-shrink-0 bg-[#121212] border border-white/10 hover:border-[#950606]/50 hover:bg-[#950606]/10 px-8 py-4 rounded-2xl flex items-center justify-center gap-3 transition-all duration-300 group shadow-sm"
                    >
                        <Filter className="w-4 h-4 text-[#FAFAFA] group-hover:text-[#B03D23] transition-colors" />
                        <span className="text-[10px] font-black text-[#FAFAFA] uppercase tracking-[0.2em]">Filtros</span>
                    </button>
                </div>

                {/* CONTADOR DE OBRAS */}
                <div className="flex items-center gap-4 mb-6">
                    <div className="h-px bg-gradient-to-r from-[#8C199C]/50 to-transparent flex-1"></div>
                    <span className="text-[10px] font-black text-[#FAFAFA] uppercase tracking-[0.2em]">
                        {filteredMangas.length} Obras Encontradas
                    </span>
                    <div className="h-px bg-gradient-to-l from-[#950606]/50 to-transparent flex-1"></div>
                </div>

                {/* GRADE DE OBRAS (CARDS) */}
                <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-4 md:gap-6">
                    {currentItems.length > 0 ? currentItems.map(manga => {
                        const origin = getOriginTag(manga);
                        const tagClasses = getTagColor(origin);

                        return (
                            <div key={manga.id} onClick={() => onNavigate('details', manga)} className="cursor-pointer group flex flex-col relative perspective-1000">
                                
                                <div className={`relative aspect-[1/1.4] rounded-2xl overflow-hidden bg-[#121212] shadow-[0_10px_20px_rgba(0,0,0,0.5)] transform transition-all duration-500 group-hover:-translate-y-2 group-hover:shadow-[0_20px_40px_rgba(149,6,6,0.3)] border border-[#333333] group-hover:border-[#950606] ${dataSaver ? 'blur-[1px]' : ''}`}>
                                    
                                    <img src={manga.coverUrl} className="w-full h-full object-cover transform transition-transform duration-700 group-hover:scale-110 opacity-90 group-hover:opacity-100" loading="lazy" alt={manga.title} />
                                    
                                    {/* Degradê do card */}
                                    <div className="absolute inset-0 bg-gradient-to-t from-[#1B1B1B] via-[#1B1B1B]/40 to-transparent opacity-90 group-hover:opacity-100 transition-opacity"></div>
                                    
                                    {/* TAG DE ORIGEM */}
                                    <div className={`absolute top-2 left-2 text-[8px] font-black px-2.5 py-1 rounded-md uppercase tracking-widest shadow-lg border ${tagClasses}`}>
                                        {origin}
                                    </div>

                                    {/* AVALIAÇÃO */}
                                    <div className="absolute top-2 right-2 bg-black/80 backdrop-blur-md px-2 py-1 rounded-md border border-white/10 flex items-center gap-1 shadow-lg">
                                        <Star className="w-2.5 h-2.5 text-[#F1A822] fill-[#F1A822]" />
                                        <span className="text-[9px] font-black text-[#FAFAFA]">{manga.rating ? Number(manga.rating).toFixed(1) : "5.0"}</span>
                                    </div>
                                    
                                    {/* INFORMAÇÕES DO RODAPÉ DO CARD */}
                                    <div className="absolute bottom-0 w-full p-3 md:p-4 transform translate-y-1 group-hover:translate-y-0 transition-transform duration-300">
                                        <h3 className="font-bold text-sm text-[#FAFAFA] line-clamp-2 leading-tight group-hover:text-[#B03D23] transition-colors drop-shadow-md">
                                            {manga.title}
                                        </h3>
                                        <div className="flex items-center justify-between mt-2 opacity-80 group-hover:opacity-100 transition-opacity">
                                            <p className="text-[9px] text-[#FAFAFA] font-bold uppercase tracking-widest flex items-center gap-1">
                                                <Clock className="w-3 h-3 text-[#8C199C]"/> {timeAgo(manga.createdAt)}
                                            </p>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        );
                    }) : (
                        <div className="col-span-full py-24 flex flex-col items-center justify-center bg-[#121212] rounded-3xl border border-[#333333] shadow-inner">
                            <Moon className="w-12 h-12 text-[#950606] mb-6 animate-pulse" />
                            <h3 className="text-base font-black text-[#FAFAFA] uppercase tracking-[0.2em] mb-2">O Vazio Infinito</h3>
                            <p className="text-[#333333] font-bold text-[10px] uppercase tracking-widest">Nenhuma obra encontrada nestes reinos.</p>
                        </div>
                    )}
                </div>

                {/* PAGINAÇÃO */}
                {totalPages > 1 && (
                    <div className="mt-16 mb-8 flex items-center justify-center gap-2">
                        <button disabled={currentPage === 1} onClick={() => setCurrentPage(prev => prev - 1)} className="p-3 rounded-xl bg-[#121212] text-[#FAFAFA] border border-[#333333] disabled:opacity-30 hover:border-[#950606] hover:text-[#B03D23] transition-all hover:-translate-x-1">
                            <ChevronLeft className="w-4 h-4" />
                        </button>
                        
                        <div className="flex items-center gap-1.5 px-2">
                            {[...Array(totalPages)].map((_, i) => {
                                if (totalPages > 5 && (i + 1 !== 1 && i + 1 !== totalPages && Math.abs(currentPage - (i + 1)) > 1)) {
                                    if (i + 1 === 2 || i + 1 === totalPages - 1) return <span key={i} className="text-[#333333] px-1 text-sm font-black tracking-widest">...</span>;
                                    return null;
                                }
                                return (
                                    <button 
                                        key={i} 
                                        onClick={() => setCurrentPage(i + 1)} 
                                        className={`w-10 h-10 rounded-xl font-black text-xs transition-all ${
                                            currentPage === i + 1 
                                            ? 'bg-[#950606] text-[#FAFAFA] shadow-[0_0_15px_rgba(149,6,6,0.6)] scale-110 border-none' 
                                            : 'bg-transparent text-[#FAFAFA] border border-transparent hover:border-[#333333] hover:bg-[#121212]'
                                        }`}
                                    >
                                        {i + 1}
                                    </button>
                                );
                            })}
                        </div>
                        
                        <button disabled={currentPage === totalPages} onClick={() => setCurrentPage(prev => prev + 1)} className="p-3 rounded-xl bg-[#121212] text-[#FAFAFA] border border-[#333333] disabled:opacity-30 hover:border-[#950606] hover:text-[#B03D23] transition-all hover:translate-x-1">
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
                    
                    {/* Backdrop Escuro - Clique para fechar */}
                    <div 
                        className="absolute inset-0 bg-black/70 backdrop-blur-sm pointer-events-auto transition-opacity duration-300" 
                        onClick={() => setIsFilterOpen(false)}
                    ></div>
                    
                    {/* Painel Lateral (Gaveta) - Fica no canto e não no meio */}
                    <div className="w-full max-w-[280px] sm:max-w-xs h-full bg-[#1B1B1B] border-l border-[#950606]/30 pointer-events-auto flex flex-col animate-in slide-in-from-right duration-300 shadow-[-20px_0_50px_rgba(0,0,0,0.8)] relative z-10">
                        
                        {/* Cabeçalho do Drawer */}
                        <div className="flex items-center justify-between p-6 border-b border-[#333333] bg-[#121212]">
                            <div className="flex items-center gap-3">
                                <SlidersHorizontal className="w-5 h-5 text-[#B03D23]" />
                                <span className="font-black text-[#FAFAFA] uppercase tracking-[0.2em] text-sm">Filtros</span>
                            </div>
                            <button onClick={() => setIsFilterOpen(false)} className="w-8 h-8 rounded-full bg-[#333333]/50 flex items-center justify-center hover:bg-[#950606] hover:text-[#FAFAFA] transition-colors">
                                <X className="w-4 h-4" />
                            </button>
                        </div>
                        
                        {/* Corpo do Drawer (Scrollable) */}
                        <div className="flex-1 overflow-y-auto p-6 space-y-8 custom-scrollbar">
                            
                            {/* Bloco: Ordem */}
                            <div>
                                <h3 className="text-[9px] font-black text-[#B03D23] uppercase tracking-[0.2em] mb-4 flex items-center gap-2"><Star className="w-3 h-3"/> Organizar Por</h3>
                                <div className="flex flex-col gap-2">
                                    {sortOptions.map(opt => (
                                        <button key={opt} onClick={() => { setSortBy(opt); setCurrentPage(1); }} className={`px-4 py-3 rounded-xl text-[10px] font-bold uppercase tracking-widest text-left transition-all ${sortBy === opt ? 'bg-[#950606] text-[#FAFAFA] shadow-md' : 'bg-[#121212] text-[#FAFAFA] border border-[#333333] hover:border-[#B03D23]'}`}>
                                            {opt}
                                        </button>
                                    ))}
                                </div>
                            </div>

                            {/* Bloco: Formato */}
                            <div>
                                <h3 className="text-[9px] font-black text-[#8C199C] uppercase tracking-[0.2em] mb-4 flex items-center gap-2"><BookOpen className="w-3 h-3"/> Formato da Obra</h3>
                                <div className="flex flex-wrap gap-2">
                                    {types.map(opt => (
                                        <button key={opt} onClick={() => { setSelectedType(opt); setCurrentPage(1); }} className={`px-4 py-2.5 rounded-lg text-[10px] font-bold uppercase tracking-widest transition-all ${selectedType === opt ? 'bg-[#8C199C] text-[#FAFAFA] shadow-md' : 'bg-[#121212] text-[#FAFAFA] border border-[#333333] hover:border-[#8C199C]'}`}>
                                            {opt}
                                        </button>
                                    ))}
                                </div>
                            </div>

                            {/* Bloco: Gêneros */}
                            <div>
                                <h3 className="text-[9px] font-black text-[#950606] uppercase tracking-[0.2em] mb-4 flex items-center gap-2"><Flame className="w-3 h-3"/> Gêneros</h3>
                                <div className="flex flex-wrap gap-2">
                                    {genresList.map(opt => (
                                        <button key={opt} onClick={() => { setSelectedGenre(opt); setCurrentPage(1); }} className={`px-3 py-2 rounded-lg text-[9px] font-bold uppercase tracking-widest transition-all ${selectedGenre === opt ? 'bg-[#950606] text-[#FAFAFA] shadow-md' : 'bg-[#121212] text-[#FAFAFA] border border-[#333333] hover:border-[#950606]'}`}>
                                            {opt}
                                        </button>
                                    ))}
                                </div>
                            </div>
                        </div>
                        
                        {/* Rodapé do Drawer */}
                        <div className="p-6 border-t border-[#333333] bg-[#121212]">
                            <button onClick={() => setIsFilterOpen(false)} className="w-full py-4 bg-[#950606] hover:bg-[#B03D23] text-[#FAFAFA] rounded-xl font-black text-[10px] uppercase tracking-[0.2em] shadow-[0_0_20px_rgba(149,6,6,0.4)] hover:scale-[1.02] transition-transform flex items-center justify-center gap-2">
                                <Filter className="w-4 h-4"/> Ver {filteredMangas.length} Obras
                            </button>
                        </div>
                    </div>
                </div>
            )}
            
            <style dangerouslySetInnerHTML={{__html: `
                .custom-scrollbar::-webkit-scrollbar { width: 4px; }
                .custom-scrollbar::-webkit-scrollbar-track { background: transparent; }
                .custom-scrollbar::-webkit-scrollbar-thumb { background: #333333; border-radius: 4px; }
                .custom-scrollbar::-webkit-scrollbar-thumb:hover { background: #950606; }
            `}} />
        </div>
    );
}
