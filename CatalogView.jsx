import React, { useState, useMemo } from 'react';
import { Search, Clock, Star, ChevronDown, LayoutGrid, List, SlidersHorizontal, Moon, Database, Zap, BookOpen, X } from 'lucide-react';
import { timeAgo } from './helpers';

export function CatalogView({ mangas, onNavigate, dataSaver, catalogState, setCatalogState }) {
    const [searchTerm, setSearchTerm] = useState("");
    const [showFilters, setShowFilters] = useState(false);
    const [viewMode, setViewMode] = useState('grid'); // or 'list'

    const [selectedType, setSelectedType] = useState('TODOS');
    const [selectedGenre, setSelectedGenre] = useState('Todos');
    const [selectedStatus, setSelectedStatus] = useState('Todos');
    const [sortBy, setSortBy] = useState('Recentes');

    const visibleCount = catalogState?.visibleCount || 24;

    const typeOptions = ['TODOS', 'MANGÁ', 'MANHWA', 'MANHUA', '+ NOVO'];
    const genreOptions = ['Todos', 'Ação', 'Artes Marciais', 'Aventura', 'Comédia', 'Drama', 'Esportes', 'Fantasia', 'Ficção Científica', 'Isekai', 'Magia', 'Mistério', 'Romance', 'Seinen', 'Shoujo', 'Shounen', 'Slice of Life', 'Terror'];
    const statusOptions = ['Todos', 'Em Lançamento', 'Completo', 'Hiato'];
    const sortOptions = ['Recentes', 'Melhor Avaliação', 'A - Z', 'Z - A'];

    const filteredMangas = useMemo(() => {
        let result = [...(mangas || [])];
        const normalize = str => str ? str.normalize("NFD").replace(/[\u0300-\u036f]/g, "").toLowerCase() : '';

        if (searchTerm.trim() !== '') {
            const term = normalize(searchTerm);
            result = result.filter(m => normalize(m.title).includes(term) || normalize(m.author).includes(term));
        }

        if (selectedType !== 'TODOS' && selectedType !== '+ NOVO') {
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

    const currentItems = filteredMangas.slice(0, visibleCount);

    const handleLoadMore = () => {
        setCatalogState({ ...catalogState, visibleCount: visibleCount + 24 });
    };

    return (
        <div className="pb-32 min-h-screen relative font-sans text-zinc-100 bg-zinc-950 overflow-x-hidden selection:bg-violet-500/30">
            
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10 pt-4 md:pt-8">
                
                {/* CABEÇALHO DE PESQUISA E CONTROLES */}
                <div className="flex items-center gap-3 mb-6">
                    <div className="relative flex-1 group">
                        <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-zinc-500 group-focus-within:text-violet-400 transition-colors" />
                        <input 
                            type="text" 
                            value={searchTerm} 
                            onChange={(e) => setSearchTerm(e.target.value)} 
                            className="w-full pl-12 pr-4 py-3.5 rounded-2xl border border-white/5 bg-zinc-900 text-white outline-none focus:border-violet-500/50 transition-all font-medium text-sm placeholder:text-zinc-600 shadow-sm" 
                            placeholder="Pesquisar obras, autores..." 
                        />
                    </div>
                    
                    <button 
                        onClick={() => setShowFilters(!showFilters)} 
                        className={`p-3.5 rounded-2xl border transition-all duration-300 ${showFilters ? 'bg-violet-500/20 border-violet-500/50 text-violet-400 shadow-[0_0_15px_rgba(139,92,246,0.15)]' : 'bg-zinc-900 border-white/5 text-zinc-400 hover:border-white/10 hover:text-zinc-200 shadow-sm'}`}
                    >
                        {showFilters ? <X className="w-5 h-5"/> : <SlidersHorizontal className="w-5 h-5" />}
                    </button>

                    <div className="hidden md:flex items-center bg-zinc-900 border border-white/5 rounded-2xl p-1 shadow-sm h-[54px]">
                        <button onClick={() => setViewMode('grid')} className={`p-2.5 rounded-xl transition-colors duration-200 ${viewMode === 'grid' ? 'bg-violet-600 text-white shadow-md' : 'text-zinc-500 hover:text-zinc-300'}`}>
                            <LayoutGrid className="w-4 h-4" />
                        </button>
                        <button onClick={() => setViewMode('list')} className={`p-2.5 rounded-xl transition-colors duration-200 ${viewMode === 'list' ? 'bg-violet-600 text-white shadow-md' : 'text-zinc-500 hover:text-zinc-300'}`}>
                            <List className="w-4 h-4" />
                        </button>
                    </div>
                </div>

                {/* PAINEL DE FILTROS MODERNO */}
                {showFilters && (
                    <div className="bg-zinc-900/80 border border-white/5 rounded-3xl p-6 mb-8 shadow-xl animate-in slide-in-from-top-4 duration-300 relative z-20">
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                            <div className="flex flex-col gap-2.5">
                                <label className="text-[10px] font-bold text-zinc-500 uppercase tracking-widest flex items-center gap-1.5">
                                    <BookOpen className="w-3 h-3" /> Gênero
                                </label>
                                <div className={`relative rounded-xl border transition-colors ${selectedGenre !== 'Todos' ? 'border-violet-500/50 bg-violet-950/20' : 'border-white/5 bg-zinc-950'}`}>
                                    <select value={selectedGenre} onChange={e=>setSelectedGenre(e.target.value)} className="w-full bg-transparent text-zinc-200 text-xs font-bold rounded-xl px-4 py-3.5 outline-none cursor-pointer appearance-none">
                                        {genreOptions.map(opt => <option key={opt} value={opt} className="bg-zinc-900">{opt}</option>)}
                                    </select>
                                    <ChevronDown className="absolute right-4 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-500 pointer-events-none" />
                                </div>
                            </div>
                            <div className="flex flex-col gap-2.5">
                                <label className="text-[10px] font-bold text-zinc-500 uppercase tracking-widest flex items-center gap-1.5">
                                    <Zap className="w-3 h-3" /> Status
                                </label>
                                <div className={`relative rounded-xl border transition-colors ${selectedStatus !== 'Todos' ? 'border-violet-500/50 bg-violet-950/20' : 'border-white/5 bg-zinc-950'}`}>
                                    <select value={selectedStatus} onChange={e=>setSelectedStatus(e.target.value)} className="w-full bg-transparent text-zinc-200 text-xs font-bold rounded-xl px-4 py-3.5 outline-none cursor-pointer appearance-none">
                                        {statusOptions.map(opt => <option key={opt} value={opt} className="bg-zinc-900">{opt}</option>)}
                                    </select>
                                    <ChevronDown className="absolute right-4 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-500 pointer-events-none" />
                                </div>
                            </div>
                            <div className="flex flex-col gap-2.5">
                                <label className="text-[10px] font-bold text-zinc-500 uppercase tracking-widest flex items-center gap-1.5">
                                    <Clock className="w-3 h-3" /> Ordenar Por
                                </label>
                                <div className={`relative rounded-xl border transition-colors ${sortBy !== 'Recentes' ? 'border-violet-500/50 bg-violet-950/20' : 'border-white/5 bg-zinc-950'}`}>
                                    <select value={sortBy} onChange={e=>setSortBy(e.target.value)} className="w-full bg-transparent text-zinc-200 text-xs font-bold rounded-xl px-4 py-3.5 outline-none cursor-pointer appearance-none">
                                        {sortOptions.map(opt => <option key={opt} value={opt} className="bg-zinc-900">{opt}</option>)}
                                    </select>
                                    <ChevronDown className="absolute right-4 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-500 pointer-events-none" />
                                </div>
                            </div>
                        </div>
                    </div>
                )}

                {/* CAIXAS SELECIONÁVEIS (TIPOS) */}
                <div className="flex items-center gap-2 md:gap-3 overflow-x-auto no-scrollbar mb-8 snap-x pb-2">
                    {typeOptions.map(opt => (
                        <button 
                            key={opt} 
                            onClick={() => setSelectedType(opt)} 
                            className={`flex-1 min-w-[90px] md:min-w-[110px] px-5 py-3 rounded-2xl text-[10px] md:text-xs font-bold uppercase tracking-wider whitespace-nowrap transition-all duration-300 snap-start
                            ${selectedType === opt 
                                ? 'bg-gradient-to-r from-violet-600 to-fuchsia-600 text-white shadow-[0_4px_20px_rgba(139,92,246,0.3)] border border-transparent scale-105' 
                                : 'bg-zinc-900 border border-white/5 text-zinc-400 hover:text-zinc-200 hover:bg-zinc-800'}`}
                        >
                            {opt}
                        </button>
                    ))}
                </div>

                {/* VISUALIZAÇÃO DAS OBRAS (GRID / LIST) */}
                <div className={viewMode === 'grid' ? "grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-4 relative z-0" : "flex flex-col gap-4 relative z-0"}>
                    {currentItems.length > 0 ? currentItems.map(manga => (
                        <div key={manga.id} onClick={() => onNavigate('details', manga)} className={`cursor-pointer group relative overflow-hidden bg-zinc-900 border border-white/5 rounded-2xl hover:border-violet-500/40 transition-all duration-300 shadow-sm hover:shadow-xl hover:shadow-violet-500/10 hover:-translate-y-1 ${viewMode === 'grid' ? 'aspect-[2/3]' : 'flex h-32 p-3 gap-4 items-center'}`}>
                            
                            <div className={`${viewMode === 'grid' ? 'absolute inset-0 w-full h-full' : 'w-20 h-full flex-shrink-0 relative rounded-xl overflow-hidden'}`}>
                                <img src={manga.coverUrl} className={`w-full h-full object-cover group-hover:scale-105 transition-transform duration-700 ease-out ${dataSaver ? 'blur-[1px]' : ''}`} loading="lazy" onError={(e) => e.target.src = `https://placehold.co/300x450/09090b/8b5cf6?text=Oculto`} />
                                {viewMode === 'grid' && <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/20 to-transparent"></div>}
                            </div>
                            
                            {/* BADGES DO GRID */}
                            {viewMode === 'grid' && (
                                <>
                                    {/* Badge: Origem da Obra (Manga, Manhwa, etc) */}
                                    <div className="absolute top-2 left-2 bg-violet-600/90 backdrop-blur-sm px-2 py-1 rounded border border-violet-500/50 z-10 shadow-lg">
                                        <span className="text-[9px] font-black text-white uppercase tracking-wider">{manga.type || 'MANGÁ'}</span>
                                    </div>
                                    
                                    {/* Badge: Avaliação */}
                                    <div className="absolute top-2 right-2 bg-black/70 backdrop-blur-sm px-1.5 py-1 rounded border border-white/10 flex items-center gap-1 z-10 shadow-lg">
                                        <Star className="w-3 h-3 text-amber-400 fill-amber-400" />
                                        <span className="text-[10px] font-bold text-white">{manga.rating ? Number(manga.rating).toFixed(1) : "5.0"}</span>
                                    </div>

                                    {/* Informações da Base */}
                                    <div className="absolute inset-x-0 bottom-0 flex flex-col justify-end p-3.5 z-10">
                                        <h3 className="font-bold text-xs text-zinc-100 line-clamp-2 mb-2 group-hover:text-violet-400 transition-colors">
                                            {manga.title}
                                        </h3>
                                        <div className="flex items-center gap-2">
                                            <p className="text-[9px] font-bold text-zinc-400 bg-black/50 px-2 py-1 rounded border border-white/5">
                                                Capítulo {manga.chapters?.length ? manga.chapters[0].number : 0}
                                            </p>
                                        </div>
                                    </div>
                                </>
                            )}

                            {/* INFORMAÇÕES DO MODO LISTA */}
                            {viewMode === 'list' && (
                                <div className="flex-1 flex flex-col justify-center min-w-0 pr-2">
                                    <div className="flex items-center gap-2 mb-1.5">
                                        <span className="text-[9px] font-bold text-violet-400 bg-violet-500/10 px-2 py-0.5 rounded uppercase border border-violet-500/20">
                                            {manga.type || 'MANGÁ'}
                                        </span>
                                    </div>
                                    <h3 className="text-sm font-bold text-zinc-100 mb-1 line-clamp-1 group-hover:text-violet-400 transition-colors">{manga.title}</h3>
                                    <p className="text-xs text-zinc-500 mb-3 line-clamp-1 font-medium">{manga.author || "Autor Desconhecido"}</p>
                                    
                                    <div className="flex items-center gap-3">
                                        <div className="bg-zinc-950 px-2 py-1 rounded border border-white/5 flex items-center gap-1.5 shadow-sm">
                                            <Star className="w-3 h-3 text-amber-400 fill-amber-400" />
                                            <span className="text-[10px] font-bold text-zinc-200">{manga.rating ? Number(manga.rating).toFixed(1) : "5.0"}</span>
                                        </div>
                                        <p className="text-[10px] font-medium text-zinc-500 flex items-center gap-1">
                                            <Clock className="w-3 h-3"/> {timeAgo(manga.createdAt)}
                                        </p>
                                    </div>
                                </div>
                            )}
                        </div>
                    )) : (
                        <div className="col-span-full py-24 flex flex-col items-center justify-center bg-zinc-900/50 rounded-3xl border border-white/5 border-dashed">
                            <Moon className="w-12 h-12 text-zinc-700 mx-auto mb-4" />
                            <p className="text-zinc-500 font-bold text-xs uppercase tracking-widest">Nenhuma obra compatível com os filtros.</p>
                        </div>
                    )}
                </div>

                {/* BOTÃO CARREGAR MAIS */}
                {filteredMangas.length > visibleCount && (
                    <div className="mt-14 flex justify-center">
                        <button onClick={handleLoadMore} className="bg-zinc-900 border border-white/5 text-zinc-400 hover:border-violet-500/50 hover:bg-violet-950/30 hover:text-white font-bold px-10 py-4 rounded-2xl flex items-center gap-3 transition-all duration-300 text-[11px] uppercase tracking-widest group">
                            <Database className="w-4 h-4 text-violet-500 group-hover:text-violet-400 transition-colors" /> Expandir Registros
                        </button>
                    </div>
                )}
            </div>
        </div>
    );
}
