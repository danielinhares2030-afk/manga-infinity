import React, { useState, useMemo, useEffect } from 'react';
import { Search, Star, ChevronDown, LayoutGrid, List, Filter, X, ChevronLeft, ChevronRight, Clock, Compass } from 'lucide-react';
import { timeAgo } from './helpers';

export function CatalogView({ mangas, onNavigate, dataSaver, catalogState, setCatalogState }) {
    const [searchTerm, setSearchTerm] = useState("");
    const [showFilters, setShowFilters] = useState(false);
    const [viewMode, setViewMode] = useState('grid'); 
    
    // ESTADO PARA OS DROPDOWNS CUSTOMIZADOS
    const [openDropdown, setOpenDropdown] = useState(null);

    const [selectedType, setSelectedType] = useState('TODOS');
    const [selectedGenre, setSelectedGenre] = useState('Todos');
    const [selectedStatus, setSelectedStatus] = useState('Todos');
    const [sortBy, setSortBy] = useState('Recentes');

    // PAGINAÇÃO - MÁXIMO 10 OBRAS POR PÁGINA
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

    // CORES E FUNDOS DA ORIGEM (NEON GLASS)
    const getTypeStyle = (type) => {
        const t = (type || 'MANGÁ').toUpperCase();
        if (t === 'MANGÁ' || t === 'MANGA') return 'bg-blue-500/20 text-blue-400 border-blue-500/30';
        if (t === 'MANHWA') return 'bg-purple-500/20 text-purple-400 border-purple-500/30';
        if (t === 'MANHUA') return 'bg-orange-500/20 text-orange-400 border-orange-500/30';
        if (t === 'SHOUJO') return 'bg-pink-500/20 text-pink-400 border-pink-500/30';
        return 'bg-cyan-500/20 text-cyan-400 border-cyan-500/30';
    };

    return (
        <div className="pb-32 min-h-screen relative font-sans text-white bg-[#050508] overflow-x-hidden selection:bg-cyan-500/30">
            
            {/* OVERLAY INVISÍVEL PARA FECHAR DROPDOWNS AO CLICAR FORA */}
            {openDropdown && (
                <div className="fixed inset-0 z-40" onClick={() => setOpenDropdown(null)}></div>
            )}

            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10 pt-6">
                
                {/* BARRA DE PESQUISA E FILTRO */}
                <div className="relative flex items-center gap-3 mb-6 z-40">
                    <div className="relative flex-1">
                        <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-500" />
                        <input 
                            type="text" 
                            value={searchTerm} 
                            onChange={(e) => setSearchTerm(e.target.value)} 
                            className="w-full pl-11 pr-4 py-3.5 rounded-2xl bg-[#0e0e12] border border-white/5 text-white outline-none focus:border-cyan-500/50 transition-colors font-medium text-sm placeholder:text-gray-600 shadow-sm" 
                            placeholder="Explorar biblioteca..." 
                        />
                    </div>
                    
                    <button 
                        onClick={() => { setShowFilters(!showFilters); setOpenDropdown(null); }} 
                        className={`flex items-center gap-2 px-5 py-3.5 rounded-2xl border transition-all duration-200 text-xs font-bold uppercase tracking-wider
                        ${showFilters ? 'bg-cyan-900/30 border-cyan-500/50 text-cyan-400' : 'bg-[#0e0e12] border-white/5 text-gray-400 hover:text-white'}`}
                    >
                        {showFilters ? <X className="w-4 h-4"/> : <Filter className="w-4 h-4" />} 
                        <span className="hidden sm:inline">Filtros</span>
                    </button>

                    {showFilters && (
                        <div className="absolute top-[110%] right-0 w-full md:w-[340px] bg-[#0a0a0d] border border-white/10 rounded-2xl p-5 shadow-[0_20px_50px_rgba(0,0,0,0.8)] z-50 origin-top-right animate-in fade-in zoom-in-95 duration-200">
                            <div className="flex flex-col gap-4">
                                
                                {/* DROPDOWN CUSTOMIZADO: GÊNERO */}
                                <div className="flex flex-col gap-1.5 relative z-30">
                                    <label className="text-[10px] font-bold text-gray-500 uppercase tracking-widest pl-1">Gênero</label>
                                    <div 
                                        onClick={() => setOpenDropdown(openDropdown === 'genre' ? null : 'genre')}
                                        className="w-full bg-[#121218] border border-white/5 text-white text-sm font-medium rounded-xl px-4 py-3 flex items-center justify-between cursor-pointer hover:border-cyan-500/30 transition-colors"
                                    >
                                        <span className="truncate">{selectedGenre}</span>
                                        <ChevronDown className={`w-4 h-4 text-gray-600 transition-transform ${openDropdown === 'genre' ? 'rotate-180 text-cyan-400' : ''}`} />
                                    </div>
                                    {openDropdown === 'genre' && (
                                        <div className="absolute top-[105%] left-0 right-0 bg-[#121218] border border-white/10 rounded-xl overflow-hidden shadow-[0_15px_30px_rgba(0,0,0,0.9)] z-50 max-h-56 overflow-y-auto no-scrollbar animate-in fade-in slide-in-from-top-2">
                                            {genreOptions.map(opt => (
                                                <div 
                                                    key={opt}
                                                    onClick={() => { setSelectedGenre(opt); setOpenDropdown(null); }}
                                                    className={`px-4 py-3 text-sm font-bold flex items-center justify-between cursor-pointer transition-colors border-b border-white/5 last:border-0
                                                    ${selectedGenre === opt ? 'bg-cyan-900/20 text-cyan-400' : 'text-gray-300 hover:bg-white/5 hover:text-white'}`}
                                                >
                                                    {opt}
                                                    {selectedGenre === opt && <div className="w-1.5 h-1.5 rounded-full bg-cyan-400 shadow-[0_0_8px_rgba(6,182,212,0.8)]"></div>}
                                                </div>
                                            ))}
                                        </div>
                                    )}
                                </div>

                                {/* DROPDOWN CUSTOMIZADO: STATUS */}
                                <div className="flex flex-col gap-1.5 relative z-20">
                                    <label className="text-[10px] font-bold text-gray-500 uppercase tracking-widest pl-1">Status</label>
                                    <div 
                                        onClick={() => setOpenDropdown(openDropdown === 'status' ? null : 'status')}
                                        className="w-full bg-[#121218] border border-white/5 text-white text-sm font-medium rounded-xl px-4 py-3 flex items-center justify-between cursor-pointer hover:border-cyan-500/30 transition-colors"
                                    >
                                        <span className="truncate">{selectedStatus}</span>
                                        <ChevronDown className={`w-4 h-4 text-gray-600 transition-transform ${openDropdown === 'status' ? 'rotate-180 text-cyan-400' : ''}`} />
                                    </div>
                                    {openDropdown === 'status' && (
                                        <div className="absolute top-[105%] left-0 right-0 bg-[#121218] border border-white/10 rounded-xl overflow-hidden shadow-[0_15px_30px_rgba(0,0,0,0.9)] z-50 animate-in fade-in slide-in-from-top-2">
                                            {statusOptions.map(opt => (
                                                <div 
                                                    key={opt}
                                                    onClick={() => { setSelectedStatus(opt); setOpenDropdown(null); }}
                                                    className={`px-4 py-3 text-sm font-bold flex items-center justify-between cursor-pointer transition-colors border-b border-white/5 last:border-0
                                                    ${selectedStatus === opt ? 'bg-cyan-900/20 text-cyan-400' : 'text-gray-300 hover:bg-white/5 hover:text-white'}`}
                                                >
                                                    {opt}
                                                    {selectedStatus === opt && <div className="w-1.5 h-1.5 rounded-full bg-cyan-400 shadow-[0_0_8px_rgba(6,182,212,0.8)]"></div>}
                                                </div>
                                            ))}
                                        </div>
                                    )}
                                </div>

                                {/* DROPDOWN CUSTOMIZADO: ORDENAR */}
                                <div className="flex flex-col gap-1.5 relative z-10">
                                    <label className="text-[10px] font-bold text-gray-500 uppercase tracking-widest pl-1">Ordenar por</label>
                                    <div 
                                        onClick={() => setOpenDropdown(openDropdown === 'sort' ? null : 'sort')}
                                        className="w-full bg-[#121218] border border-white/5 text-white text-sm font-medium rounded-xl px-4 py-3 flex items-center justify-between cursor-pointer hover:border-cyan-500/30 transition-colors"
                                    >
                                        <span className="truncate">{sortBy}</span>
                                        <ChevronDown className={`w-4 h-4 text-gray-600 transition-transform ${openDropdown === 'sort' ? 'rotate-180 text-cyan-400' : ''}`} />
                                    </div>
                                    {openDropdown === 'sort' && (
                                        <div className="absolute top-[105%] left-0 right-0 bg-[#121218] border border-white/10 rounded-xl overflow-hidden shadow-[0_15px_30px_rgba(0,0,0,0.9)] z-50 animate-in fade-in slide-in-from-top-2">
                                            {sortOptions.map(opt => (
                                                <div 
                                                    key={opt}
                                                    onClick={() => { setSortBy(opt); setOpenDropdown(null); }}
                                                    className={`px-4 py-3 text-sm font-bold flex items-center justify-between cursor-pointer transition-colors border-b border-white/5 last:border-0
                                                    ${sortBy === opt ? 'bg-cyan-900/20 text-cyan-400' : 'text-gray-300 hover:bg-white/5 hover:text-white'}`}
                                                >
                                                    {opt}
                                                    {sortBy === opt && <div className="w-1.5 h-1.5 rounded-full bg-cyan-400 shadow-[0_0_8px_rgba(6,182,212,0.8)]"></div>}
                                                </div>
                                            ))}
                                        </div>
                                    )}
                                </div>

                            </div>
                        </div>
                    )}
                </div>

                {/* TABS DE TIPO */}
                <div className="flex items-center gap-2 overflow-x-auto no-scrollbar mb-6 snap-x pb-2 w-full">
                    {typeOptions.map(opt => (
                        <button 
                            key={opt} 
                            onClick={() => setSelectedType(opt)} 
                            className={`flex-none px-6 py-2.5 rounded-xl text-[10px] font-bold uppercase tracking-widest whitespace-nowrap transition-colors duration-200 snap-start
                            ${selectedType === opt 
                                ? 'bg-cyan-600 text-white' 
                                : 'bg-[#0e0e12] border border-white/5 text-gray-400 hover:text-white hover:bg-white/5'}`}
                        >
                            {opt}
                        </button>
                    ))}
                </div>

                {/* VISUALIZAÇÃO E CONTADOR */}
                <div className="flex items-center justify-between mb-6">
                    <div className="flex items-center gap-2 text-sm text-gray-400">
                        <Compass className="w-4 h-4 text-cyan-500" />
                        <span className="text-white font-bold">{filteredMangas.length}</span> obras
                    </div>
                    <div className="flex items-center bg-[#0e0e12] border border-white/5 rounded-xl p-1">
                        <button onClick={() => setViewMode('grid')} className={`p-1.5 rounded-lg transition-colors ${viewMode === 'grid' ? 'bg-[#181820] text-cyan-400' : 'text-gray-600 hover:text-white'}`}>
                            <LayoutGrid className="w-4 h-4" />
                        </button>
                        <button onClick={() => setViewMode('list')} className={`p-1.5 rounded-lg transition-colors ${viewMode === 'list' ? 'bg-[#181820] text-cyan-400' : 'text-gray-600 hover:text-white'}`}>
                            <List className="w-4 h-4" />
                        </button>
                    </div>
                </div>

                {/* GRID DE OBRAS */}
                <div className={viewMode === 'grid' ? "grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-3 md:gap-4 relative z-0" : "flex flex-col gap-3 relative z-0"}>
                    {currentItems.length > 0 ? currentItems.map(manga => (
                        <div key={manga.id} onClick={() => onNavigate('details', manga)} className={`cursor-pointer group relative bg-[#0a0a0d] border border-white/5 hover:border-cyan-500/30 rounded-2xl overflow-hidden transition-colors duration-300 ${viewMode === 'list' ? 'flex flex-row items-center h-32 pr-4' : 'flex flex-col aspect-[2/3]'}`}>
                            
                            <div className={`relative bg-[#121218] ${viewMode === 'grid' ? 'absolute inset-0 w-full h-full' : 'w-24 h-full flex-shrink-0'}`}>
                                <img src={manga.coverUrl} className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105" loading="lazy" onError={(e) => e.target.src = `https://placehold.co/300x450/0a0a0d/06b6d4?text=Nexo`} />
                                
                                {viewMode === 'grid' && (
                                    <div className="absolute inset-0 bg-gradient-to-t from-[#050508] via-[#050508]/60 to-transparent opacity-90"></div>
                                )}
                            </div>
                            
                            {viewMode === 'grid' && (
                                <>
                                    {/* BADGE ORIGEM: NEON GLASSMORPHISM COM FUNDO E BORDA */}
                                    <div className={`absolute top-3 left-3 z-10 px-2.5 py-1 rounded-md border backdrop-blur-md shadow-lg ${getTypeStyle(manga.type)}`}>
                                        <span className="text-[8px] font-black uppercase tracking-[0.2em]">
                                            {manga.type || 'MANGÁ'}
                                        </span>
                                    </div>
                                    
                                    <div className="absolute top-2 right-2 bg-black/80 px-1.5 py-0.5 rounded border border-white/10 flex items-center gap-1 z-10">
                                        <Star className="w-2.5 h-2.5 text-amber-400 fill-amber-400" />
                                        <span className="text-[9px] font-bold text-white">{manga.rating ? Number(manga.rating).toFixed(1) : "5.0"}</span>
                                    </div>

                                    {/* INFORMAÇÕES: GÊNEROS (NO LUGAR DA SINOPSE) */}
                                    <div className="absolute inset-x-0 bottom-0 flex flex-col justify-end p-3 z-10">
                                        <h3 className="font-bold text-sm text-gray-100 line-clamp-1 mb-1 group-hover:text-cyan-400 transition-colors">
                                            {manga.title}
                                        </h3>
                                        <p className="text-[9px] text-gray-400 line-clamp-2 leading-snug mb-2 font-black uppercase tracking-wider">
                                            {manga.genres && manga.genres.length > 0 ? manga.genres.slice(0, 2).join(' • ') : "Gênero Desconhecido"}
                                        </p>
                                        <span className="text-[10px] font-bold text-cyan-500">
                                            Capítulo {manga.chapters?.length ? manga.chapters[0].number : 0}
                                        </span>
                                    </div>
                                </>
                            )}

                            {viewMode === 'list' && (
                                <div className="flex-1 flex flex-col justify-center pl-4 min-w-0">
                                    <div className="flex items-center gap-2 mb-1.5">
                                        {/* ORIGEM NA LISTA */}
                                        <span className={`px-2 py-0.5 rounded border backdrop-blur-md text-[8px] font-black uppercase tracking-[0.2em] ${getTypeStyle(manga.type)}`}>
                                            {manga.type || 'MANGÁ'}
                                        </span>
                                        <span className="text-[10px] font-medium text-gray-600 flex items-center gap-1 border-l border-white/10 pl-2">
                                            <Clock className="w-3 h-3"/> {timeAgo(manga.createdAt)}
                                        </span>
                                    </div>
                                    <h3 className="text-sm font-bold text-white mb-1 line-clamp-1 group-hover:text-cyan-400 transition-colors">{manga.title}</h3>
                                    
                                    {/* SINOPSE SE MANTÉM NA LISTA */}
                                    <p className="text-[10px] text-gray-500 mb-2 line-clamp-1 font-medium">{manga.synopsis || "Sem sinopse."}</p>
                                    
                                    <div className="flex items-center gap-3">
                                        <div className="bg-[#050508] px-1.5 py-0.5 rounded border border-white/5 flex items-center gap-1">
                                            <Star className="w-2.5 h-2.5 text-amber-400 fill-amber-400" />
                                            <span className="text-[9px] font-bold text-gray-200">{manga.rating ? Number(manga.rating).toFixed(1) : "5.0"}</span>
                                        </div>
                                        <span className="text-[10px] font-bold text-cyan-500">
                                            Cap. {manga.chapters?.length ? manga.chapters[0].number : 0}
                                        </span>
                                    </div>
                                </div>
                            )}
                        </div>
                    )) : (
                        <div className="col-span-full py-20 flex flex-col items-center justify-center bg-[#0e0e12]/50 rounded-3xl border border-white/5 border-dashed">
                            <Moon className="w-10 h-10 text-gray-700 mx-auto mb-3" />
                            <p className="text-gray-500 font-bold text-[10px] uppercase tracking-widest">O abismo não possui registros.</p>
                        </div>
                    )}
                </div>

                {/* PAGINAÇÃO */}
                {totalPages > 1 && (
                    <div className="mt-14 flex items-center justify-center gap-2">
                        <button disabled={currentPage === 1} onClick={() => handlePageChange(currentPage - 1)} className="p-3.5 rounded-xl bg-[#0e0e12] text-gray-400 border border-white/5 disabled:opacity-30 hover:bg-cyan-900/30 hover:text-cyan-400 hover:border-cyan-500/50 transition-all active:scale-95 shadow-sm">
                            <ChevronLeft className="w-5 h-5" />
                        </button>
                        
                        <div className="flex items-center gap-1 bg-[#0e0e12] p-1.5 rounded-xl border border-white/5 shadow-sm">
                            {[...Array(totalPages)].map((_, i) => {
                                if (totalPages > 5 && (i + 1 !== 1 && i + 1 !== totalPages && Math.abs(currentPage - (i + 1)) > 1)) {
                                    if (i + 1 === 2 || i + 1 === totalPages - 1) return <span key={i} className="text-gray-600 px-2 font-black">...</span>;
                                    return null;
                                }
                                return (
                                    <button key={i} onClick={() => handlePageChange(i + 1)} className={`w-11 h-11 rounded-lg font-black text-sm transition-all duration-200 ${currentPage === i + 1 ? 'bg-cyan-600 text-white shadow-[0_0_15px_rgba(6,182,212,0.4)]' : 'bg-transparent text-gray-500 hover:bg-white/10 hover:text-white'}`}>
                                        {i + 1}
                                    </button>
                                );
                            })}
                        </div>
                        
                        <button disabled={currentPage === totalPages} onClick={() => handlePageChange(currentPage + 1)} className="p-3.5 rounded-xl bg-[#0e0e12] text-gray-400 border border-white/5 disabled:opacity-30 hover:bg-cyan-900/30 hover:text-cyan-400 hover:border-cyan-500/50 transition-all active:scale-95 shadow-sm">
                            <ChevronRight className="w-5 h-5" />
                        </button>
                    </div>
                )}
            </div>
        </div>
    );
}
