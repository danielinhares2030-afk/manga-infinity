import React, { useState, useMemo } from 'react';
import { Search, Clock, Star, ChevronDown, LayoutGrid, List, SlidersHorizontal, Moon, Database, Zap, BookOpen, X } from 'lucide-react';
import { timeAgo } from './helpers';

export function CatalogView({ mangas, onNavigate, dataSaver, catalogState, setCatalogState }) {
    const [searchTerm, setSearchTerm] = useState("");
    const [showFilters, setShowFilters] = useState(false);
    const [viewMode, setViewMode] = useState('grid'); 

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
        <div className="pb-32 min-h-screen relative font-sans text-white bg-[#0a0a0c] overflow-x-hidden">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10 pt-6">
                
                {/* CABEÇALHO DE PESQUISA */}
                <div className="flex items-center gap-3 mb-6">
                    <div className="relative flex-1">
                        <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-500" />
                        <input 
                            type="text" 
                            value={searchTerm} 
                            onChange={(e) => setSearchTerm(e.target.value)} 
                            className="w-full pl-12 pr-4 py-3.5 rounded-2xl bg-[#13131a] text-white outline-none focus:ring-2 focus:ring-purple-600/50 transition-all font-medium text-sm placeholder:text-gray-500" 
                            placeholder="Pesquisar obras, autores..." 
                        />
                    </div>
                    
                    <button 
                        onClick={() => setShowFilters(!showFilters)} 
                        className={`p-3.5 rounded-2xl transition-all duration-300 ${showFilters ? 'bg-purple-600 text-white shadow-[0_0_15px_rgba(147,51,234,0.3)]' : 'bg-[#13131a] text-gray-400 hover:text-white'}`}
                    >
                        {showFilters ? <X className="w-5 h-5"/> : <SlidersHorizontal className="w-5 h-5" />}
                    </button>
                </div>

                {/* PAINEL DE FILTROS */}
                {showFilters && (
                    <div className="bg-[#13131a] rounded-3xl p-6 mb-8 shadow-xl animate-in slide-in-from-top-4 duration-300 relative z-20">
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                            <div className="flex flex-col gap-2">
                                <label className="text-[10px] font-bold text-gray-400 uppercase tracking-widest flex items-center gap-1.5">
                                    <BookOpen className="w-3 h-3" /> Gênero
                                </label>
                                <div className={`relative rounded-xl transition-colors ${selectedGenre !== 'Todos' ? 'bg-purple-900/20 ring-1 ring-purple-500/50' : 'bg-[#1a1a24]'}`}>
                                    <select value={selectedGenre} onChange={e=>setSelectedGenre(e.target.value)} className="w-full bg-transparent text-white text-sm font-bold rounded-xl px-4 py-3.5 outline-none cursor-pointer appearance-none">
                                        {genreOptions.map(opt => <option key={opt} value={opt} className="bg-[#13131a]">{opt}</option>)}
                                    </select>
                                    <ChevronDown className="absolute right-4 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500 pointer-events-none" />
                                </div>
                            </div>
                            <div className="flex flex-col gap-2">
                                <label className="text-[10px] font-bold text-gray-400 uppercase tracking-widest flex items-center gap-1.5">
                                    <Zap className="w-3 h-3" /> Status
                                </label>
                                <div className={`relative rounded-xl transition-colors ${selectedStatus !== 'Todos' ? 'bg-purple-900/20 ring-1 ring-purple-500/50' : 'bg-[#1a1a24]'}`}>
                                    <select value={selectedStatus} onChange={e=>setSelectedStatus(e.target.value)} className="w-full bg-transparent text-white text-sm font-bold rounded-xl px-4 py-3.5 outline-none cursor-pointer appearance-none">
                                        {statusOptions.map(opt => <option key={opt} value={opt} className="bg-[#13131a]">{opt}</option>)}
                                    </select>
                                    <ChevronDown className="absolute right-4 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500 pointer-events-none" />
                                </div>
                            </div>
                            <div className="flex flex-col gap-2">
                                <label className="text-[10px] font-bold text-gray-400 uppercase tracking-widest flex items-center gap-1.5">
                                    <Clock className="w-3 h-3" /> Ordenar Por
                                </label>
                                <div className={`relative rounded-xl transition-colors ${sortBy !== 'Recentes' ? 'bg-purple-900/20 ring-1 ring-purple-500/50' : 'bg-[#1a1a24]'}`}>
                                    <select value={sortBy} onChange={e=>setSortBy(e.target.value)} className="w-full bg-transparent text-white text-sm font-bold rounded-xl px-4 py-3.5 outline-none cursor-pointer appearance-none">
                                        {sortOptions.map(opt => <option key={opt} value={opt} className="bg-[#13131a]">{opt}</option>)}
                                    </select>
                                    <ChevronDown className="absolute right-4 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500 pointer-events-none" />
                                </div>
                            </div>
                        </div>
                    </div>
                )}

                {/* CAIXAS SELECIONÁVEIS (TIPOS) - IDÊNTICO À PRINT */}
                <div className="flex items-center gap-3 overflow-x-auto no-scrollbar mb-8 snap-x pb-2">
                    {typeOptions.map(opt => (
                        <button 
                            key={opt} 
                            onClick={() => setSelectedType(opt)} 
                            className={`flex-none px-6 py-3.5 rounded-2xl text-xs font-black uppercase tracking-wider whitespace-nowrap transition-all duration-300 snap-start
                            ${selectedType === opt 
                                ? 'bg-gradient-to-r from-[#a855f7] to-[#d946ef] text-white shadow-[0_0_20px_rgba(168,85,247,0.4)] transform scale-105' 
                                : 'bg-[#13131a] text-gray-400 hover:text-white hover:bg-[#1a1a24]'}`}
                        >
                            {opt}
                        </button>
                    ))}
                </div>

                {/* VISUALIZAÇÃO DAS OBRAS (GRID ESTILO NATIVO) */}
                <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4 md:gap-5 relative z-0">
                    {currentItems.length > 0 ? currentItems.map(manga => (
                        <div key={manga.id} onClick={() => onNavigate('details', manga)} className="cursor-pointer group relative overflow-hidden bg-[#13131a] rounded-2xl aspect-[2/3] transform transition-transform duration-300 hover:-translate-y-1 hover:shadow-[0_10px_30px_rgba(0,0,0,0.5)]">
                            
                            {/* IMAGEM E GRADIENTE */}
                            <img src={manga.coverUrl} className={`absolute inset-0 w-full h-full object-cover transition-transform duration-700 ease-out group-hover:scale-105 ${dataSaver ? 'blur-[1px]' : ''}`} loading="lazy" onError={(e) => e.target.src = `https://placehold.co/300x450/13131a/a855f7?text=Sem+Capa`} />
                            <div className="absolute inset-0 bg-gradient-to-t from-[#05050a] via-[#05050a]/40 to-transparent opacity-90"></div>
                            
                            {/* BADGE ESQUERDO: TIPO DA OBRA (Roxo Sólido) */}
                            <div className="absolute top-2 left-2 bg-[#8b5cf6] px-2 py-1 rounded-md z-10 shadow-md">
                                <span className="text-[9px] font-black text-white uppercase tracking-wider">{manga.type || 'MANGÁ'}</span>
                            </div>
                            
                            {/* BADGE DIREITO: AVALIAÇÃO (Fundo Escuro) */}
                            <div className="absolute top-2 right-2 bg-black/80 px-1.5 py-1 rounded-md flex items-center gap-1 z-10 shadow-md">
                                <Star className="w-3 h-3 text-[#eab308] fill-[#eab308]" />
                                <span className="text-[10px] font-black text-white">{manga.rating ? Number(manga.rating).toFixed(1) : "5.0"}</span>
                            </div>

                            {/* INFORMAÇÕES DA BASE */}
                            <div className="absolute inset-x-0 bottom-0 flex flex-col justify-end p-3.5 z-10">
                                <h3 className="font-extrabold text-sm text-white line-clamp-2 mb-2 leading-tight drop-shadow-md">
                                    {manga.title}
                                </h3>
                                <div>
                                    <span className="inline-block bg-black/60 px-2 py-1 rounded-md text-[10px] font-bold text-gray-300">
                                        Capítulo {manga.chapters?.length ? manga.chapters[0].number : 0}
                                    </span>
                                </div>
                            </div>
                        </div>
                    )) : (
                        <div className="col-span-full py-24 flex flex-col items-center justify-center bg-[#13131a]/50 rounded-3xl border border-gray-800/50 border-dashed">
                            <Moon className="w-12 h-12 text-gray-600 mx-auto mb-4" />
                            <p className="text-gray-500 font-bold text-xs uppercase tracking-widest">Nenhuma obra compatível com os filtros.</p>
                        </div>
                    )}
                </div>

                {/* BOTÃO CARREGAR MAIS */}
                {filteredMangas.length > visibleCount && (
                    <div className="mt-12 flex justify-center">
                        <button onClick={handleLoadMore} className="bg-[#13131a] text-gray-400 hover:bg-purple-900/30 hover:text-white font-bold px-10 py-4 rounded-2xl flex items-center gap-3 transition-all duration-300 text-[11px] uppercase tracking-widest group shadow-lg">
                            <Database className="w-4 h-4 text-purple-500 group-hover:text-purple-400 transition-colors" /> Expandir Registros
                        </button>
                    </div>
                )}
            </div>
        </div>
    );
}
