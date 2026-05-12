import React, { useState, useMemo } from 'react';
import { Search, Star, Clock, ChevronRight, ChevronLeft, Moon, Filter, X, BookOpen, Flame, Tag } from 'lucide-react';
import { timeAgo } from './helpers';

export function CatalogView({ mangas = [], onNavigate }) {
    const [searchQuery, setSearchQuery] = useState('');
    const [currentPage, setCurrentPage] = useState(1);
    const itemsPerPage = 20;

    // Estados dos Filtros
    const [isMobileFilterOpen, setIsMobileFilterOpen] = useState(false);
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

    // Cores das tags seguindo a paleta da Inferia
    const getTagColor = (type) => {
        const lower = type.toLowerCase();
        if (lower === 'manhwa') return 'bg-[#8C199C] text-[#FAFAFA] border-[#8C199C]'; 
        if (lower === 'manhua') return 'bg-[#B03D23] text-[#FAFAFA] border-[#B03D23]'; 
        if (lower === 'shoujo') return 'bg-[#950606] text-[#FAFAFA] border-[#950606]'; 
        return 'bg-[#333333] text-[#FAFAFA] border-[#333333]'; 
    };

    // Componente Interno: Menu de Filtros (Reutilizável Desktop/Mobile)
    const FilterPanel = () => (
        <div className="flex flex-col gap-8">
            {/* Bloco: Ordenar */}
            <div>
                <h3 className="text-[#FAFAFA] text-sm font-bold uppercase tracking-widest mb-3 flex items-center gap-2">
                    <Clock className="w-4 h-4 text-[#B03D23]" /> Ordenar Por
                </h3>
                <div className="flex flex-col gap-2">
                    {sortOptions.map(opt => (
                        <button 
                            key={opt} 
                            onClick={() => { setSortBy(opt); setCurrentPage(1); }} 
                            className={`px-4 py-2.5 rounded-lg text-xs font-bold uppercase tracking-widest text-left transition-colors border ${sortBy === opt ? 'bg-[#950606] text-[#FAFAFA] border-[#950606]' : 'bg-[#1B1B1B] text-[#FAFAFA] border-[#333333] hover:border-[#B03D23]'}`}
                        >
                            {opt}
                        </button>
                    ))}
                </div>
            </div>

            {/* Bloco: Formato */}
            <div>
                <h3 className="text-[#FAFAFA] text-sm font-bold uppercase tracking-widest mb-3 flex items-center gap-2">
                    <BookOpen className="w-4 h-4 text-[#8C199C]" /> Formato
                </h3>
                <div className="flex flex-wrap gap-2">
                    {types.map(opt => (
                        <button 
                            key={opt} 
                            onClick={() => { setSelectedType(opt); setCurrentPage(1); }} 
                            className={`px-3 py-2 rounded-lg text-[11px] font-bold uppercase tracking-widest transition-colors border ${selectedType === opt ? 'bg-[#950606] text-[#FAFAFA] border-[#950606]' : 'bg-[#1B1B1B] text-[#FAFAFA] border-[#333333] hover:border-[#8C199C]'}`}
                        >
                            {opt}
                        </button>
                    ))}
                </div>
            </div>

            {/* Bloco: Gêneros */}
            <div>
                <h3 className="text-[#FAFAFA] text-sm font-bold uppercase tracking-widest mb-3 flex items-center gap-2">
                    <Flame className="w-4 h-4 text-[#950606]" /> Gêneros
                </h3>
                <div className="flex flex-wrap gap-2">
                    {genresList.map(opt => (
                        <button 
                            key={opt} 
                            onClick={() => { setSelectedGenre(opt); setCurrentPage(1); }} 
                            className={`px-3 py-2 rounded-lg text-[11px] font-bold uppercase tracking-widest transition-colors border ${selectedGenre === opt ? 'bg-[#950606] text-[#FAFAFA] border-[#950606]' : 'bg-[#1B1B1B] text-[#FAFAFA] border-[#333333] hover:border-[#B03D23]'}`}
                        >
                            {opt}
                        </button>
                    ))}
                </div>
            </div>
        </div>
    );

    return (
        <div className="bg-[#1B1B1B] min-h-screen font-sans text-[#FAFAFA] pb-24 selection:bg-[#950606]/40 flex flex-col">
            
            {/* HEADER FIXO - BUSCA E TÍTULO */}
            <header className="sticky top-0 z-40 bg-[#1B1B1B] border-b border-[#333333] shadow-md">
                <div className="max-w-7xl mx-auto px-4 py-4 flex flex-col md:flex-row items-center justify-between gap-4">
                    
                    <div className="flex items-center justify-between w-full md:w-auto">
                        <h1 className="text-xl md:text-2xl font-black uppercase tracking-[0.2em] text-[#FAFAFA]">
                            Manga <span className="text-[#950606]">Inferia</span>
                        </h1>
                        <button 
                            className="md:hidden p-2 bg-[#333333] rounded-lg text-[#FAFAFA]"
                            onClick={() => setIsMobileFilterOpen(true)}
                        >
                            <Filter className="w-5 h-5" />
                        </button>
                    </div>

                    {/* BARRA DE PESQUISA */}
                    <div className="relative w-full md:w-96 group">
                        <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 group-focus-within:text-[#B03D23] transition-colors" />
                        <input 
                            type="text" 
                            placeholder="Pesquisar obras..." 
                            value={searchQuery}
                            onChange={(e) => { setSearchQuery(e.target.value); setCurrentPage(1); }}
                            className="w-full bg-[#1B1B1B] border border-[#333333] rounded-xl py-3 pl-11 pr-4 text-sm text-[#FAFAFA] outline-none focus:border-[#950606] transition-colors"
                        />
                    </div>
                </div>
            </header>

            {/* ESTRUTURA PRINCIPAL (SIDEBAR ESQUERDA + GRID DIREITA) */}
            <main className="flex-1 max-w-7xl mx-auto w-full px-4 pt-8 flex gap-8">
                
                {/* SIDEBAR DESKTOP */}
                <aside className="hidden md:block w-64 flex-shrink-0">
                    <div className="sticky top-28 border border-[#333333] bg-[#1B1B1B] rounded-2xl p-6 shadow-lg">
                        <FilterPanel />
                    </div>
                </aside>

                {/* ÁREA DE CONTEÚDO (GRID) */}
                <section className="flex-1">
                    
                    {/* FEEDBACK DE FILTROS ATIVOS E CONTADOR */}
                    <div className="flex flex-wrap items-center gap-3 mb-6">
                        <span className="text-sm font-bold text-gray-400 uppercase tracking-widest mr-2">
                            {filteredMangas.length} Resultados
                        </span>
                        
                        {selectedType !== 'Todos' && (
                            <span className="flex items-center gap-2 bg-[#333333] border border-[#B03D23] px-3 py-1.5 rounded-full text-xs font-bold text-[#FAFAFA] uppercase">
                                <BookOpen className="w-3 h-3" /> {selectedType}
                                <X className="w-3 h-3 cursor-pointer hover:text-[#950606]" onClick={() => setSelectedType('Todos')} />
                            </span>
                        )}
                        {selectedGenre !== 'Todos' && (
                            <span className="flex items-center gap-2 bg-[#333333] border border-[#B03D23] px-3 py-1.5 rounded-full text-xs font-bold text-[#FAFAFA] uppercase">
                                <Tag className="w-3 h-3" /> {selectedGenre}
                                <X className="w-3 h-3 cursor-pointer hover:text-[#950606]" onClick={() => setSelectedGenre('Todos')} />
                            </span>
                        )}
                    </div>

                    {/* GRADE DE CARDS (Design Original Restaurado) */}
                    <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4">
                        {currentItems.length > 0 ? currentItems.map(manga => {
                            const origin = getOriginTag(manga);
                            const tagClasses = getTagColor(origin);

                            return (
                                <div key={manga.id} onClick={() => onNavigate('details', manga)} className="cursor-pointer group flex flex-col relative perspective-1000">
                                    
                                    <div className="relative aspect-[1/1.4] rounded-2xl overflow-hidden bg-[#1B1B1B] shadow-[0_10px_20px_rgba(0,0,0,0.5)] transform transition-all duration-500 group-hover:-translate-y-2 group-hover:shadow-[0_20px_40px_rgba(149,6,6,0.2)] border border-[#333333] group-hover:border-[#950606]">
                                        
                                        <img src={manga.coverUrl} className="w-full h-full object-cover transform transition-transform duration-700 group-hover:scale-110 opacity-90 group-hover:opacity-100" loading="lazy" alt={manga.title} />
                                        
                                        {/* Degradê do card */}
                                        <div className="absolute inset-0 bg-gradient-to-t from-[#1B1B1B] via-[#1B1B1B]/40 to-transparent opacity-90 group-hover:opacity-100 transition-opacity"></div>
                                        
                                        {/* TAG DE ORIGEM */}
                                        <div className={`absolute top-2 left-2 text-[8px] font-black px-2.5 py-1 rounded-md uppercase tracking-widest shadow-lg border ${tagClasses}`}>
                                            {origin}
                                        </div>

                                        {/* AVALIAÇÃO */}
                                        <div className="absolute top-2 right-2 bg-black/60 backdrop-blur-md px-2 py-1 rounded-md border border-white/10 flex items-center gap-1 shadow-lg">
                                            <Star className="w-2.5 h-2.5 text-[#F1A822] fill-[#F1A822]" />
                                            <span className="text-[9px] font-black text-[#FAFAFA]">{manga.rating ? Number(manga.rating).toFixed(1) : "5.0"}</span>
                                        </div>
                                        
                                        {/* INFORMAÇÕES DO RODAPÉ DO CARD */}
                                        <div className="absolute bottom-0 w-full p-3 md:p-4 transform translate-y-1 group-hover:translate-y-0 transition-transform duration-300">
                                            <h3 className="font-bold text-sm text-[#FAFAFA] line-clamp-2 leading-tight group-hover:text-[#B03D23] transition-colors drop-shadow-md">
                                                {manga.title}
                                            </h3>
                                            <div className="flex items-center justify-between mt-2 opacity-80 group-hover:opacity-100 transition-opacity">
                                                <p className="text-[9px] text-gray-400 font-bold uppercase tracking-widest flex items-center gap-1">
                                                    <Clock className="w-3 h-3 text-[#B03D23]"/> {timeAgo(manga.createdAt)}
                                                </p>
                                                <div className="w-6 h-6 rounded-full bg-white/10 flex items-center justify-center backdrop-blur-md border border-white/5 group-hover:bg-[#950606] transition-colors">
                                                    <ChevronRight className="w-3 h-3 text-[#FAFAFA]" />
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            );
                        }) : (
                            <div className="col-span-full py-20 flex flex-col items-center justify-center bg-[#1B1B1B] border border-[#333333] rounded-2xl">
                                <Moon className="w-12 h-12 text-[#333333] mb-4" />
                                <h3 className="text-[#FAFAFA] font-black uppercase tracking-widest mb-1">Nenhuma Obra Encontrada</h3>
                                <p className="text-gray-400 text-xs uppercase tracking-widest">Tente remover alguns filtros.</p>
                            </div>
                        )}
                    </div>

                    {/* PAGINAÇÃO TRADICIONAL */}
                    {totalPages > 1 && (
                        <div className="mt-12 flex items-center justify-center gap-2">
                            <button 
                                disabled={currentPage === 1} 
                                onClick={() => setCurrentPage(prev => prev - 1)} 
                                className="h-10 px-4 rounded-lg bg-[#1B1B1B] text-[#FAFAFA] border border-[#333333] disabled:opacity-50 hover:bg-[#333333] transition-colors flex items-center"
                            >
                                <ChevronLeft className="w-4 h-4" />
                            </button>
                            
                            <div className="flex items-center gap-1">
                                {[...Array(totalPages)].map((_, i) => {
                                    if (totalPages > 5 && (i + 1 !== 1 && i + 1 !== totalPages && Math.abs(currentPage - (i + 1)) > 1)) {
                                        if (i + 1 === 2 || i + 1 === totalPages - 1) return <span key={i} className="px-2 text-gray-500">...</span>;
                                        return null;
                                    }
                                    return (
                                        <button 
                                            key={i} 
                                            onClick={() => setCurrentPage(i + 1)} 
                                            className={`w-10 h-10 rounded-lg font-bold text-xs transition-colors border ${
                                                currentPage === i + 1 
                                                ? 'bg-[#950606] text-[#FAFAFA] border-[#950606]' 
                                                : 'bg-[#1B1B1B] text-gray-400 border-[#333333] hover:bg-[#333333] hover:text-[#FAFAFA]'
                                            }`}
                                        >
                                            {i + 1}
                                        </button>
                                    );
                                })}
                            </div>
                            
                            <button 
                                disabled={currentPage === totalPages} 
                                onClick={() => setCurrentPage(prev => prev + 1)} 
                                className="h-10 px-4 rounded-lg bg-[#1B1B1B] text-[#FAFAFA] border border-[#333333] disabled:opacity-50 hover:bg-[#333333] transition-colors flex items-center"
                            >
                                <ChevronRight className="w-4 h-4" />
                            </button>
                        </div>
                    )}
                </section>
            </main>

            {/* MODAL DE FILTROS MOBILE (SEM BLUR BUGADO, FUNDO SÓLIDO) */}
            {isMobileFilterOpen && (
                <div className="md:hidden fixed inset-0 z-[100] flex flex-col justify-end">
                    {/* Overlay escuro simples (clique para fechar) */}
                    <div className="absolute inset-0 bg-black/80" onClick={() => setIsMobileFilterOpen(false)}></div>
                    
                    {/* Painel que sobe de baixo */}
                    <div className="bg-[#1B1B1B] w-full max-h-[85vh] rounded-t-3xl border-t border-[#333333] relative z-10 flex flex-col animate-in slide-in-from-bottom-full duration-300">
                        
                        <div className="flex items-center justify-between p-5 border-b border-[#333333]">
                            <h2 className="font-black text-[#FAFAFA] uppercase tracking-widest text-sm flex items-center gap-2">
                                <Filter className="w-4 h-4 text-[#B03D23]" /> Filtrar Obras
                            </h2>
                            <button onClick={() => setIsMobileFilterOpen(false)} className="w-8 h-8 flex items-center justify-center rounded-full bg-[#333333] text-[#FAFAFA]">
                                <X className="w-4 h-4" />
                            </button>
                        </div>
                        
                        <div className="flex-1 overflow-y-auto p-5">
                            <FilterPanel />
                        </div>
                        
                        <div className="p-5 border-t border-[#333333] bg-[#1B1B1B]">
                            <button 
                                onClick={() => setIsMobileFilterOpen(false)} 
                                className="w-full h-[48px] bg-[#950606] text-[#FAFAFA] font-black rounded-xl uppercase tracking-widest text-xs flex items-center justify-center gap-2 shadow-[0_0_15px_rgba(149,6,6,0.3)]"
                            >
                                <Search className="w-4 h-4" /> Mostrar {filteredMangas.length} Resultados
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
