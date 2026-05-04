import React, { useState, useMemo } from 'react';
import { Search, Clock, Star, ChevronDown, LayoutGrid, List, SlidersHorizontal, Moon, Database, Zap, Flame, Bookmark, X } from 'lucide-react';
import { timeAgo } from './helpers';

export function CatalogView({ mangas, onNavigate, dataSaver, catalogState, setCatalogState }) {
    const [searchTerm, setSearchTerm] = useState("");
    const [showFilters, setShowFilters] = useState(false);
    const [viewMode, setViewMode] = useState('grid'); // or 'list'

    const [selectedType, setSelectedType] = useState('TODOS');
    const [selectedGenre, setSelectedGenre] = useState('Todos');
    const [selectedStatus, setSelectedStatus] = useState('Todos');
    const [sortBy, setSortBy] = useState('Recentes');

    // Retain visibleCount logic from catalogState
    const visibleCount = catalogState?.visibleCount || 24;

    const typeOptions = ['TODOS', 'MANGÁ', 'MANHWA', 'MANHUA', '+ NOVO'];
    const genreOptions = ['Todos', 'Ação', 'Artes Marciais', 'Aventura', 'Comédia', 'Drama', 'Esportes', 'Fantasia', 'Ficção Científica', 'Isekai', 'Magia', 'Mistério', 'Romance', 'Seinen', 'Shoujo', 'Shounen', 'Slice of Life', 'Terror'];
    const statusOptions = ['Todos', 'Em Lançamento', 'Completo', 'Hiato'];
    const sortOptions = ['Recentes', 'Melhor Avaliação', 'A - Z', 'Z - A'];

    // Updated Filtering and Sorting Logic
    const filteredMangas = useMemo(() => {
        let result = [...(mangas || [])];

        const normalize = str => str ? str.normalize("NFD").replace(/[\u0300-\u036f]/g, "").toLowerCase() : '';

        // Search filtering
        if (searchTerm.trim() !== '') {
            const term = normalize(searchTerm);
            result = result.filter(m => normalize(m.title).includes(term) || normalize(m.author).includes(term));
        }

        // Type filtering
        if (selectedType !== 'TODOS' && selectedType !== '+ NOVO') {
            const fType = normalize(selectedType);
            result = result.filter(m => normalize(m.type) === fType);
        }

        // Genre filtering
        if (selectedGenre !== 'Todos') {
            const fGenre = normalize(selectedGenre);
            result = result.filter(m => {
                const mGenres = (m.genres || []).map(g => normalize(g));
                return mGenres.includes(fGenre);
            });
        }

        // Status filtering
        if (selectedStatus !== 'Todos') {
            const fStatus = normalize(selectedStatus);
            result = result.filter(m => normalize(m.status) === fStatus);
        }

        // Sorting
        result.sort((a, b) => {
            if (sortBy === 'Recentes') return b.createdAt - a.createdAt;
            if (sortBy === 'Melhor Avaliação') return (Number(b.rating) || 0) - (Number(a.rating) || 0);
            if (sortBy === 'A - Z') return (a.title || '').localeCompare(b.title || '');
            if (sortBy === 'Z - A') return (b.title || '').localeCompare(a.title || '');
            return 0;
        });

        return result;
    }, [mangas, searchTerm, selectedType, selectedGenre, selectedStatus, sortBy]);

    // Slice items for visible count
    const currentItems = filteredMangas.slice(0, visibleCount);

    const handleLoadMore = () => {
        setCatalogState({ ...catalogState, visibleCount: visibleCount + 24 });
    };

    return (
        <div className="pb-32 min-h-screen relative font-sans text-white overflow-x-hidden">
            
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10 pt-4">
                
                {/* HEADER AREA */}
                <div className="flex items-center gap-3 mb-6 pt-2">
                    <div className="relative flex-1">
                        <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-600" />
                        <input 
                            type="text" 
                            value={searchTerm} 
                            onChange={(e) => setSearchTerm(e.target.value)} 
                            className="w-full pl-12 pr-4 py-3.5 rounded-xl border border-white/5 bg-[#111] text-white outline-none focus:border-red-600/50 transition-all font-medium text-xs placeholder:text-gray-600 shadow-inner" 
                            placeholder="Buscar obras..." 
                        />
                    </div>
                    
                    <button onClick={() => setShowFilters(!showFilters)} className={`p-3.5 rounded-xl border transition-all ${showFilters ? 'bg-red-950/30 border-red-500/50 text-red-500' : 'bg-[#111] border-white/5 text-gray-500 hover:border-gray-800'}`}>
                        {showFilters ? <X className="w-5 h-5"/> : <SlidersHorizontal className="w-5 h-5" />}
                    </button>

                    <div className="flex items-center bg-[#111] border border-white/5 rounded-xl p-1 shadow-sm h-full">
                        <button onClick={() => setViewMode('grid')} className={`p-2 rounded-lg transition-colors ${viewMode === 'grid' ? 'bg-red-600 text-white' : 'text-gray-500 hover:text-white'}`}>
                            <LayoutGrid className="w-4 h-4" />
                        </button>
                        <button onClick={() => setViewMode('list')} className={`p-2 rounded-lg transition-colors ${viewMode === 'list' ? 'bg-red-600 text-white' : 'text-gray-500 hover:text-white'}`}>
                            <List className="w-4 h-4" />
                        </button>
                    </div>
                </div>

                {/* FILTER PANEL */}
                {showFilters && (
                    <div className="bg-[#0a0a0a] border border-gray-800 rounded-2xl p-6 mb-8 shadow-xl animate-in slide-in-from-top-2 relative z-20">
                        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
                            <div className="flex flex-col gap-2">
                                <label className="text-[10px] font-bold text-gray-500 uppercase tracking-widest">Gênero</label>
                                <select value={selectedGenre} onChange={e=>setSelectedGenre(e.target.value)} className="w-full bg-[#111] border border-white/5 text-white text-xs font-medium rounded-xl px-4 py-3 outline-none focus:border-red-500/50 cursor-pointer">
                                    {genreOptions.map(opt => <option key={opt} value={opt}>{opt}</option>)}
                                </select>
                            </div>
                            <div className="flex flex-col gap-2">
                                <label className="text-[10px] font-bold text-gray-500 uppercase tracking-widest">Status</label>
                                <select value={selectedStatus} onChange={e=>setSelectedStatus(e.target.value)} className="w-full bg-[#111] border border-white/5 text-white text-xs font-medium rounded-xl px-4 py-3 outline-none focus:border-red-500/50 cursor-pointer">
                                    {statusOptions.map(opt => <option key={opt} value={opt}>{opt}</option>)}
                                </select>
                            </div>
                            <div className="flex flex-col gap-2">
                                <label className="text-[10px] font-bold text-gray-500 uppercase tracking-widest">Ordem</label>
                                <select value={sortBy} onChange={e=>setSortBy(e.target.value)} className="w-full bg-[#111] border border-white/5 text-white text-xs font-medium rounded-xl px-4 py-3 outline-none focus:border-red-500/50 cursor-pointer">
                                    {sortOptions.map(opt => <option key={opt} value={opt}>{opt}</option>)}
                                </select>
                            </div>
                        </div>
                    </div>
                )}

                {/* TYPE PILLS */}
                <div className="flex items-center gap-3 overflow-x-auto no-scrollbar mb-8 snap-x pb-1">
                    {typeOptions.map(opt => (
                        <button 
                            key={opt} 
                            onClick={() => setSelectedType(opt)} 
                            className={`flex-1 min-w-[90px] px-4 py-2.5 rounded-full text-[10px] font-bold uppercase tracking-widest whitespace-nowrap transition-all duration-300 snap-start
                            ${selectedType === opt ? 'bg-red-600 text-white shadow-lg' : 'bg-[#111] border border-white/5 text-gray-500 hover:text-white hover:border-gray-800'}`}
                        >
                            {opt}
                        </button>
                    ))}
                </div>

                {/* OBRA GRID/LIST */}
                <div className={viewMode === 'grid' ? "grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-4 relative z-0" : "flex flex-col gap-4 relative z-0"}>
                    {currentItems.length > 0 ? currentItems.map(manga => (
                        <div key={manga.id} onClick={() => onNavigate('details', manga)} className={`cursor-pointer group relative overflow-hidden bg-[#111] border border-white/5 rounded-xl hover:border-red-600/50 transition-colors duration-300 shadow-md ${viewMode === 'grid' ? 'aspect-[3/4]' : 'flex h-32 p-3 gap-4'}`}>
                            
                            <img src={manga.coverUrl} className={`${viewMode === 'grid' ? 'absolute inset-0 w-full h-full' : 'w-20 h-full rounded-lg'} object-cover group-hover:scale-105 transition-transform duration-700 ease-out`} loading="lazy" />
                            
                            {viewMode === 'grid' && (
                                <div className="absolute inset-0 bg-gradient-to-t from-[#020205] via-[#020205]/20 to-transparent"></div>
                            )}

                            {/* GRID OVERLAY INFO */}
                            {viewMode === 'grid' && (
                                <div className="absolute inset-0 flex flex-col justify-end p-3 z-10">
                                    <div className="absolute top-2 right-2 bg-black/70 backdrop-blur-sm px-1.5 py-1 rounded-full border border-gray-700/50 flex items-center gap-1">
                                        <Star className="w-3 h-3 text-yellow-500 fill-yellow-500" />
                                        <span className="text-[10px] font-black text-white">{manga.rating ? Number(manga.rating).toFixed(1) : "0.0"}</span>
                                    </div>
                                    <h3 className="font-bold text-xs text-white line-clamp-2 mb-2 drop-shadow-md">
                                        {manga.title}
                                    </h3>
                                    <div className="flex items-center gap-2">
                                        <p className="text-[9px] font-bold text-gray-500 bg-black/60 px-2 py-0.5 rounded border border-gray-800/80">
                                            Capítulo {manga.chapters?.length ? manga.chapters[0].number : 0}
                                        </p>
                                    </div>
                                </div>
                            )}

                            {/* LIST LAYOUT INFO */}
                            {viewMode === 'list' && (
                                <div className="flex-1 flex flex-col justify-center">
                                    <h3 className="text-sm font-bold text-white mb-1 line-clamp-1">{manga.title}</h3>
                                    <p className="text-xs text-gray-500 mb-3 line-clamp-1">{manga.author || "Autor Desconhecido"}</p>
                                    <div className="flex items-center gap-3">
                                        <div className="bg-black/60 backdrop-blur-sm px-2 py-1 rounded border border-gray-700/50 flex items-center gap-1.5">
                                            <Star className="w-3 h-3 text-yellow-500 fill-yellow-500" />
                                            <span className="text-[10px] font-black text-white">{manga.rating ? Number(manga.rating).toFixed(1) : "0.0"}</span>
                                        </div>
                                        <p className="text-[10px] font-medium text-gray-500 flex items-center gap-1">
                                            <Clock className="w-3 h-3"/> Atualizado {timeAgo(manga.createdAt)}
                                        </p>
                                    </div>
                                </div>
                            )}
                        </div>
                    )) : (
                        <div className="col-span-full py-20 flex flex-col items-center justify-center bg-[#0a0a0a] rounded-2xl border border-gray-800/80 border-dashed">
                            <Moon className="w-12 h-12 text-gray-700 mx-auto mb-4 animate-pulse" />
                            <p className="text-gray-500 font-bold text-xs">Nenhum resultado encontrado.</p>
                        </div>
                    )}
                </div>

                {/* LOAD MORE BUTTON */}
                {filteredMangas.length > visibleCount && (
                    <div className="mt-12 flex justify-center">
                        <button onClick={handleLoadMore} className="bg-[#111] border border-white/5 text-gray-400 hover:border-red-600/50 hover:text-white font-bold px-10 py-4 rounded-xl flex items-center gap-3 transition-all duration-300 text-[11px] uppercase tracking-widest shadow-lg group">
                            <Zap className="w-4 h-4 text-red-600 group-hover:text-white" /> Carregar Mais
                        </button>
                    </div>
                )}
            </div>
        </div>
    );
}
