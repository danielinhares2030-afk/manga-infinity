import React, { useState, useMemo, useEffect } from 'react';
import { Search, Star, ChevronDown, LayoutGrid, List, Filter, X, ChevronLeft, ChevronRight, Clock, BookOpen } from 'lucide-react';
import { timeAgo } from './helpers';

export function CatalogView({ mangas, onNavigate, dataSaver, catalogState, setCatalogState }) {
    const [searchTerm, setSearchTerm] = useState("");
    const [showFilters, setShowFilters] = useState(false);
    const [viewMode, setViewMode] = useState('grid'); 
    
    // Controle dos Dropdowns Customizados
    const [openDropdown, setOpenDropdown] = useState(null);

    const [selectedType, setSelectedType] = useState('TODOS');
    const [selectedGenre, setSelectedGenre] = useState('Todos');
    const [selectedStatus, setSelectedStatus] = useState('Todos');
    const [sortBy, setSortBy] = useState('Recentes');

    // PAGINAÇÃO - Máximo 10 Obras
    const [currentPage, setCurrentPage] = useState(1);
    const itemsPerPage = 10; 

    const typeOptions = ['TODOS', 'MANGÁ', 'MANHWA', 'MANHUA', 'SHOUJO'];
    const genreOptions = ['Todos', 'Ação', 'Artes Marciais', 'Aventura', 'Comédia', 'Drama', 'Esportes', 'Fantasia', 'Ficção Científica', 'Isekai', 'Magia', 'Mistério', 'Romance', 'Seinen', 'Shoujo', 'Shounen', 'Slice of Life', 'Terror'];
    const statusOptions = ['Todos', 'Em Lançamento', 'Completo', 'Hiato'];
    const sortOptions = ['Recentes', 'Melhor Avaliação', 'A - Z', 'Z - A'];

    useEffect(() => {
        setCurrentPage(1);
    }, [searchTerm, selectedType, selectedGenre, selectedStatus, sortBy]);

    const filteredMangas = useMemo(() => {
        let result = [...(mangas || [])];
        const normalize = str => str ? str.normalize("NFD").replace(/[\u0300-\u036f]/g, "").toLowerCase() : '';

        if (searchTerm.trim() !== '') {
            const term = normalize(searchTerm);
            result = result.filter(m => normalize(m.title).includes(term) || normalize(m.author).includes(term));
        }

        if (selectedType !== 'TODOS') {
            const fType = normalize(selectedType);
            result = result.filter(m => normalize(m.type) === fType);
        }

        if (selectedGenre !== 'Todos') {
            const fGenre = normalize(selectedGenre);
            result = result.filter(m => {
                const mGenres = (m.genres || []).map(g => normalize(g));
                return mGenres.includes(fGenre);
            });
        }

        if (selectedStatus !== 'Todos') {
            const fStatus = normalize(selectedStatus);
            result = result.filter(m => normalize(m.status) === fStatus);
        }

        result.sort((a, b) => {
            if (sortBy === 'Recentes') return b.createdAt - a.createdAt;
            if (sortBy === 'Melhor Avaliação') return (Number(b.rating) || 0) - (Number(a.rating) || 0);
            if (sortBy === 'A - Z') return (a.title || '').localeCompare(b.title || '');
            if (sortBy === 'Z - A') return (b.title || '').localeCompare(a.title || '');
            return 0;
        });

        return result;
    }, [mangas, searchTerm, selectedType, selectedGenre, selectedStatus, sortBy]);

    const totalPages = Math.ceil(filteredMangas.length / itemsPerPage);
    const indexOfLastItem = currentPage * itemsPerPage;
    const indexOfFirstItem = indexOfLastItem - itemsPerPage;
    const currentItems = filteredMangas.slice(indexOfFirstItem, indexOfLastItem);

    const handlePageChange = (pageNumber) => {
        setCurrentPage(pageNumber);
        window.scrollTo({ top: 0, behavior: 'smooth' });
    };

    // CORES DA ORIGEM: Fundo Sólido e Bonito (Conforme pedido)
    const getTypeStyle = (type) => {
        const t = (type || 'MANGÁ').toUpperCase();
        if (t === 'MANGÁ' || t === 'MANGA') return 'bg-blue-600 text-white';
        if (t === 'MANHWA') return 'bg-purple-600 text-white';
        if (t === 'MANHUA') return 'bg-orange-600 text-white';
        if (t === 'SHOUJO') return 'bg-pink-600 text-white';
        return 'bg-cyan-600 text-white';
    };

    return (
        <div className="pb-32 min-h-screen relative font-sans text-white bg-[#121212] overflow-x-hidden selection:bg-purple-500/30">
            
            {/* OVERLAY PARA FECHAR DROPDOWNS */}
            {openDropdown && (
                <div className="fixed inset-0 z-40" onClick={() => setOpenDropdown(null)}></div>
            )}

            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10 pt-6">
                
                {/* BARRA DE PESQUISA E FILTRO FLUTUANTE */}
                <div className="relative flex items-center gap-3 mb-6 z-40">
                    <div className="relative flex-1">
                        <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400" />
                        <input 
                            type="text" 
                            value={searchTerm} 
                            onChange={(e) => setSearchTerm(e.target.value)} 
                            className="w-full pl-12 pr-4 py-3.5 rounded-xl bg-[#1E1E1E] text-white outline-none focus:ring-2 focus:ring-purple-500 transition-shadow font-medium text-sm placeholder:text-gray-500 shadow-sm" 
                            placeholder="Buscar obras, autores..." 
                        />
                    </div>
                    
                    <button 
                        onClick={() => { setShowFilters(!showFilters); setOpenDropdown(null); }} 
                        className={`flex items-center gap-2 px-4 py-3.5 rounded-xl transition-all duration-200 text-sm font-bold shadow-sm
                        ${showFilters ? 'bg-purple-600 text-white' : 'bg-[#1E1E1E] text-gray-300 hover:bg-[#2A2A2A]'}`}
                    >
                        {showFilters ? <X className="w-5 h-5"/> : <Filter className="w-5 h-5" />} 
                    </button>

                    {/* MENU DE FILTROS FLUTUANTE */}
                    {showFilters && (
                        <div className="absolute top-[115%] right-0 w-full md:w-[340px] bg-[#1E1E1E] border border-white/5 rounded-2xl p-5 shadow-2xl z-50 origin-top-right animate-in fade-in zoom-in-95 duration-200">
                            <div className="flex flex-col gap-4">
                                
                                {/* GÊNERO */}
                                <div className="flex flex-col gap-1.5 relative z-30">
                                    <label className="text-[11px] font-bold text-gray-400 uppercase tracking-widest pl-1">Gênero</label>
                                    <div 
                                        onClick={() => setOpenDropdown(openDropdown === 'genre' ? null : 'genre')}
                                        className="w-full bg-[#121212] border border-white/5 text-white text-sm font-medium rounded-xl px-4 py-3 flex items-center justify-between cursor-pointer hover:border-purple-500/50 transition-colors"
                                    >
                                        <span className="truncate">{selectedGenre}</span>
                                        <ChevronDown className={`w-4 h-4 text-gray-500 transition-transform ${openDropdown === 'genre' ? 'rotate-180 text-purple-400' : ''}`} />
                                    </div>
                                    {openDropdown === 'genre' && (
                                        <div className="absolute top-[105%] left-0 right-0 bg-[#1E1E1E] border border-white/5 rounded-xl overflow-hidden shadow-2xl z-50 max-h-60 overflow-y-auto no-scrollbar animate-in fade-in">
                                            {genreOptions.map(opt => (
                                                <div 
                                                    key={opt}
                                                    onClick={() => { setSelectedGenre(opt); setOpenDropdown(null); }}
                                                    className={`px-4 py-3 text-sm font-medium flex items-center justify-between cursor-pointer transition-colors border-b border-white/5 last:border-0
                                                    ${selectedGenre === opt ? 'bg-purple-500/20 text-purple-400' : 'text-gray-300 hover:bg-[#2A2A2A] hover:text-white'}`}
                                                >
                                                    {opt}
                                                </div>
                                            ))}
                                        </div>
                                    )}
                                </div>

                                {/* STATUS */}
                                <div className="flex flex-col gap-1.5 relative z-20">
                                    <label className="text-[11px] font-bold text-gray-400 uppercase tracking-widest pl-1">Status</label>
                                    <div 
                                        onClick={() => setOpenDropdown(openDropdown === 'status' ? null : 'status')}
                                        className="w-full bg-[#121212] border border-white/5 text-white text-sm font-medium rounded-xl px-4 py-3 flex items-center justify-between cursor-pointer hover:border-purple-500/50 transition-colors"
                                    >
                                        <span className="truncate">{selectedStatus}</span>
                                        <ChevronDown className={`w-4 h-4 text-gray-500 transition-transform ${openDropdown === 'status' ? 'rotate-180 text-purple-400' : ''}`} />
                                    </div>
                                    {openDropdown === 'status' && (
                                        <div className="absolute top-[105%] left-0 right-0 bg-[#1E1E1E] border border-white/5 rounded-xl overflow-hidden shadow-2xl z-50 animate-in fade-in">
                                            {statusOptions.map(opt => (
                                                <div 
                                                    key={opt}
                                                    onClick={() => { setSelectedStatus(opt); setOpenDropdown(null); }}
                                                    className={`px-4 py-3 text-sm font-medium flex items-center justify-between cursor-pointer transition-colors border-b border-white/5 last:border-0
                                                    ${selectedStatus === opt ? 'bg-purple-500/20 text-purple-400' : 'text-gray-300 hover:bg-[#2A2A2A] hover:text-white'}`}
                                                >
                                                    {opt}
                                                </div>
                                            ))}
                                        </div>
                                    )}
                                </div>

                                {/* ORDENAR */}
                                <div className="flex flex-col gap-1.5 relative z-10">
                                    <label className="text-[11px] font-bold text-gray-400 uppercase tracking-widest pl-1">Ordenar por</label>
                                    <div 
                                        onClick={() => setOpenDropdown(openDropdown === 'sort' ? null : 'sort')}
                                        className="w-full bg-[#121212] border border-white/5 text-white text-sm font-medium rounded-xl px-4 py-3 flex items-center justify-between cursor-pointer hover:border-purple-500/50 transition-colors"
                                    >
                                        <span className="truncate">{sortBy}</span>
                                        <ChevronDown className={`w-4 h-4 text-gray-500 transition-transform ${openDropdown === 'sort' ? 'rotate-180 text-purple-400' : ''}`} />
                                    </div>
                                    {openDropdown === 'sort' && (
                                        <div className="absolute top-[105%] left-0 right-0 bg-[#1E1E1E] border border-white/5 rounded-xl overflow-hidden shadow-2xl z-50 animate-in fade-in">
                                            {sortOptions.map(opt => (
                                                <div 
                                                    key={opt}
                                                    onClick={() => { setSortBy(opt); setOpenDropdown(null); }}
                                                    className={`px-4 py-3 text-sm font-medium flex items-center justify-between cursor-pointer transition-colors border-b border-white/5 last:border-0
                                                    ${sortBy === opt ? 'bg-purple-500/20 text-purple-400' : 'text-gray-300 hover:bg-[#2A2A2A] hover:text-white'}`}
                                                >
                                                    {opt}
                                                </div>
                                            ))}
                                        </div>
                                    )}
                                </div>

                            </div>
                        </div>
                    )}
                </div>

                {/* TABS DE TIPO DE OBRA (CHIPS) */}
                <div className="flex items-center gap-2 overflow-x-auto no-scrollbar mb-6 snap-x pb-2 w-full">
                    {typeOptions.map(opt => (
                        <button 
                            key={opt} 
                            onClick={() => setSelectedType(opt)} 
                            className={`flex-none px-5 py-2 rounded-full text-sm font-medium whitespace-nowrap transition-colors duration-200 snap-start border
                            ${selectedType === opt 
                                ? 'bg-purple-600 text-white border-purple-600' 
                                : 'bg-[#1E1E1E] border-white/5 text-gray-300 hover:bg-[#2A2A2A]'}`}
                        >
                            {opt}
                        </button>
                    ))}
                </div>

                {/* CONTROLES DE VISUALIZAÇÃO E CONTADOR */}
                <div className="flex items-center justify-between mb-6">
                    <div className="text-sm font-medium text-gray-400">
                        <span className="text-white font-bold">{filteredMangas.length}</span> obras encontradas
                    </div>
                    <div className="flex items-center bg-[#1E1E1E] rounded-lg p-1">
                        <button onClick={() => setViewMode('grid')} className={`p-1.5 rounded-md transition-colors ${viewMode === 'grid' ? 'bg-[#2A2A2A] text-purple-400 shadow-sm' : 'text-gray-500 hover:text-white'}`}>
                            <LayoutGrid className="w-5 h-5" />
                        </button>
                        <button onClick={() => setViewMode('list')} className={`p-1.5 rounded-md transition-colors ${viewMode === 'list' ? 'bg-[#2A2A2A] text-purple-400 shadow-sm' : 'text-gray-500 hover:text-white'}`}>
                            <List className="w-5 h-5" />
                        </button>
                    </div>
                </div>

                {/* GRID/LISTA DE OBRAS */}
                <div className={viewMode === 'grid' ? "grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4 relative z-0" : "flex flex-col gap-4 relative z-0"}>
                    {currentItems.length > 0 ? currentItems.map(manga => (
                        <div key={manga.id} onClick={() => onNavigate('details', manga)} className={`cursor-pointer group relative bg-[#1E1E1E] rounded-2xl overflow-hidden transition-transform duration-200 active:scale-95 shadow-md ${viewMode === 'list' ? 'flex flex-row items-center h-36 pr-4' : 'flex flex-col aspect-[2/3]'}`}>
                            
                            {/* IMAGEM DA CAPA */}
                            <div className={`relative bg-[#121212] ${viewMode === 'grid' ? 'absolute inset-0 w-full h-full' : 'w-28 h-full flex-shrink-0'}`}>
                                <img src={manga.coverUrl} className="w-full h-full object-cover" loading="lazy" onError={(e) => e.target.src = `https://placehold.co/300x450/1e1e1e/8b5cf6?text=Capa`} />
                                {viewMode === 'grid' && (
                                    <div className="absolute inset-0 bg-gradient-to-t from-[#121212] via-[#121212]/40 to-transparent opacity-90"></div>
                                )}
                            </div>
                            
                            {/* MODO GRID (Cards Grandes) -> Puxa Gênero */}
                            {viewMode === 'grid' && (
                                <>
                                    {/* BADGE ORIGEM: Fundo Colorido e Sólido */}
                                    <div className="absolute top-2 left-2 z-10">
                                        <span className={`px-2 py-1 rounded text-[9px] font-black tracking-widest uppercase shadow-sm ${getTypeStyle(manga.type)}`}>
                                            {manga.type || 'MANGÁ'}
                                        </span>
                                    </div>
                                    
                                    <div className="absolute top-2 right-2 bg-[#121212]/80 backdrop-blur-sm px-1.5 py-0.5 rounded border border-white/5 flex items-center gap-1 z-10">
                                        <Star className="w-3 h-3 text-yellow-500 fill-yellow-500" />
                                        <span className="text-[10px] font-bold text-white">{manga.rating ? Number(manga.rating).toFixed(1) : "5.0"}</span>
                                    </div>

                                    <div className="absolute inset-x-0 bottom-0 flex flex-col justify-end p-3.5 z-10">
                                        <h3 className="font-bold text-sm text-white line-clamp-2 leading-tight mb-1">
                                            {manga.title}
                                        </h3>
                                        {/* NO GRID: MOSTRAR GÊNEROS, NÃO A SINOPSE */}
                                        <p className="text-[11px] text-gray-400 line-clamp-1 mb-2 font-medium">
                                            {manga.genres && manga.genres.length > 0 ? manga.genres.slice(0, 2).join(', ') : "Gênero Desconhecido"}
                                        </p>
                                        <span className="text-[11px] font-bold text-purple-400">
                                            Capítulo {manga.chapters?.length ? manga.chapters[0].number : 0}
                                        </span>
                                    </div>
                                </>
                            )}

                            {/* MODO LISTA (Cards Deitados) -> Puxa Sinopse */}
                            {viewMode === 'list' && (
                                <div className="flex-1 flex flex-col justify-center pl-4 min-w-0">
                                    <div className="flex items-center justify-between mb-1.5">
                                        <span className={`px-2 py-0.5 rounded text-[8px] font-black tracking-widest uppercase ${getTypeStyle(manga.type)}`}>
                                            {manga.type || 'MANGÁ'}
                                        </span>
                                        <div className="flex items-center gap-1 bg-[#121212] px-1.5 py-0.5 rounded border border-white/5">
                                            <Star className="w-3 h-3 text-yellow-500 fill-yellow-500" />
                                            <span className="text-[10px] font-bold text-white">{manga.rating ? Number(manga.rating).toFixed(1) : "5.0"}</span>
                                        </div>
                                    </div>

                                    <h3 className="text-sm font-bold text-white mb-1 line-clamp-1">{manga.title}</h3>
                                    
                                    {/* NA LISTA: MOSTRAR SINOPSE */}
                                    <p className="text-xs text-gray-400 mb-2 line-clamp-2 leading-snug">{manga.synopsis || "Detalhes desta obra não encontrados."}</p>
                                    
                                    <div className="flex items-center gap-3">
                                        <span className="text-xs font-bold text-purple-400">
                                            Capítulo {manga.chapters?.length ? manga.chapters[0].number : 0}
                                        </span>
                                        <span className="text-[10px] font-medium text-gray-500 flex items-center gap-1 border-l border-white/10 pl-2">
                                            <Clock className="w-3 h-3"/> {timeAgo(manga.createdAt)}
                                        </span>
                                    </div>
                                </div>
                            )}
                        </div>
                    )) : (
                        <div className="col-span-full py-20 flex flex-col items-center justify-center bg-[#1E1E1E] rounded-3xl border border-white/5">
                            <BookOpen className="w-12 h-12 text-gray-600 mx-auto mb-3" />
                            <p className="text-gray-400 font-medium text-sm">Nenhuma obra encontrada.</p>
                        </div>
                    )}
                </div>

                {/* PAGINAÇÃO DE 10 EM 10 (PADRÃO MATERIAL DESIGN) */}
                {totalPages > 1 && (
                    <div className="mt-10 flex items-center justify-center gap-2">
                        <button disabled={currentPage === 1} onClick={() => handlePageChange(currentPage - 1)} className="p-3 rounded-xl bg-[#1E1E1E] text-gray-300 disabled:opacity-40 hover:bg-[#2A2A2A] transition-colors shadow-sm">
                            <ChevronLeft className="w-5 h-5" />
                        </button>
                        
                        <div className="flex items-center gap-1 bg-[#1E1E1E] p-1 rounded-xl shadow-sm">
                            {[...Array(totalPages)].map((_, i) => {
                                if (totalPages > 5 && (i + 1 !== 1 && i + 1 !== totalPages && Math.abs(currentPage - (i + 1)) > 1)) {
                                    if (i + 1 === 2 || i + 1 === totalPages - 1) return <span key={i} className="text-gray-500 px-2 font-bold">...</span>;
                                    return null;
                                }
                                return (
                                    <button key={i} onClick={() => handlePageChange(i + 1)} className={`w-10 h-10 rounded-lg font-bold text-sm transition-colors ${currentPage === i + 1 ? 'bg-purple-600 text-white' : 'bg-transparent text-gray-400 hover:bg-[#2A2A2A] hover:text-white'}`}>
                                        {i + 1}
                                    </button>
                                );
                            })}
                        </div>
                        
                        <button disabled={currentPage === totalPages} onClick={() => handlePageChange(currentPage + 1)} className="p-3 rounded-xl bg-[#1E1E1E] text-gray-300 disabled:opacity-40 hover:bg-[#2A2A2A] transition-colors shadow-sm">
                            <ChevronRight className="w-5 h-5" />
                        </button>
                    </div>
                )}
            </div>
        </div>
    );
}
