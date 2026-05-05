import React, { useState, useMemo } from 'react';
import { Search, Star, ChevronDown, LayoutGrid, List, SlidersHorizontal, Moon, Database, Clock, Compass, Sparkles, Filter } from 'lucide-react';
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

    const typeOptions = ['TODOS', 'MANGÁ', 'MANHWA', 'MANHUA', 'SHOUJO'];
    
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

    const currentItems = filteredMangas.slice(0, visibleCount);

    const handleLoadMore = () => {
        setCatalogState({ ...catalogState, visibleCount: visibleCount + 24 });
    };

    return (
        <div className="pb-32 min-h-screen relative font-sans text-white bg-[#05060b] overflow-x-hidden selection:bg-cyan-500/30">
            
            {/* LUZES DE FUNDO AMBIENTES (Suaves, renderizadas via GPU) */}
            <div className="fixed inset-0 pointer-events-none z-0 overflow-hidden">
                <div className="absolute top-[-10%] left-[-10%] w-[600px] h-[600px] bg-cyan-900/10 blur-[150px] rounded-full"></div>
                <div className="absolute bottom-[-20%] right-[-10%] w-[500px] h-[500px] bg-blue-900/10 blur-[120px] rounded-full"></div>
                {/* Padrão de grade super sutil para dar textura */}
                <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNDAiIGhlaWdodD0iNDAiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+PGNpcmNsZSBjeD0iMSIgY3k9IjEiIHI9IjEiIGZpbGw9InJnYmEoMjU1LDI1NSwyNTUsMC4wMykiLz48L3N2Zz4=')] opacity-50 mix-blend-overlay"></div>
            </div>

            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10 pt-6 md:pt-10">
                
                {/* TÍTULO E NAVEGAÇÃO DE TOPO */}
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 mb-8">
                    <div className="flex-1 w-full relative group">
                        <div className="absolute -inset-1 bg-gradient-to-r from-cyan-600/30 to-blue-600/30 rounded-2xl blur-md opacity-0 group-focus-within:opacity-100 transition duration-500"></div>
                        <div className="relative flex items-center bg-[#0b0d14] border border-white/10 rounded-2xl overflow-hidden shadow-lg">
                            <Search className="absolute left-5 h-5 w-5 text-gray-500 group-focus-within:text-cyan-400 transition-colors" />
                            <input 
                                type="text" 
                                value={searchTerm} 
                                onChange={(e) => setSearchTerm(e.target.value)} 
                                className="w-full pl-14 pr-6 py-4 bg-transparent text-white outline-none font-medium text-sm placeholder:text-gray-600" 
                                placeholder="Explorar biblioteca..." 
                            />
                            {/* BOTÃO DE FILTRO ACOPLADO NA BARRA */}
                            <button 
                                onClick={() => setShowFilters(!showFilters)} 
                                className={`flex items-center gap-2 px-6 py-4 border-l border-white/10 font-bold text-xs uppercase tracking-widest transition-colors
                                ${showFilters ? 'bg-cyan-900/40 text-cyan-400' : 'bg-transparent text-gray-400 hover:text-white hover:bg-white/5'}`}
                            >
                                <Filter className="w-4 h-4" /> Filtros
                            </button>
                        </div>
                    </div>
                </div>

                {/* PAINEL DE FILTROS BENTO GRID (Estilo Dashboard Premium) */}
                <div className={`grid transition-all duration-500 ease-in-out overflow-hidden ${showFilters ? 'grid-rows-[1fr] opacity-100 mb-8' : 'grid-rows-[0fr] opacity-0 mb-0'}`}>
                    <div className="min-h-0">
                        <div className="bg-[#0b0d14]/80 backdrop-blur-xl border border-white/10 rounded-3xl p-6 md:p-8 shadow-2xl">
                            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                                {/* GÊNERO */}
                                <div className="flex flex-col gap-2.5">
                                    <label className="text-[10px] font-black text-gray-500 uppercase tracking-widest pl-1">Gênero</label>
                                    <div className="relative rounded-xl border border-white/5 bg-[#121520] hover:border-cyan-500/30 transition-colors">
                                        <select value={selectedGenre} onChange={e=>setSelectedGenre(e.target.value)} className="w-full bg-transparent text-white text-sm font-bold rounded-xl px-4 py-3.5 outline-none cursor-pointer appearance-none">
                                            {genreOptions.map(opt => <option key={opt} value={opt} className="bg-[#0b0d14]">{opt}</option>)}
                                        </select>
                                        <ChevronDown className="absolute right-4 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500 pointer-events-none" />
                                    </div>
                                </div>
                                {/* STATUS */}
                                <div className="flex flex-col gap-2.5">
                                    <label className="text-[10px] font-black text-gray-500 uppercase tracking-widest pl-1">Status</label>
                                    <div className="relative rounded-xl border border-white/5 bg-[#121520] hover:border-cyan-500/30 transition-colors">
                                        <select value={selectedStatus} onChange={e=>setSelectedStatus(e.target.value)} className="w-full bg-transparent text-white text-sm font-bold rounded-xl px-4 py-3.5 outline-none cursor-pointer appearance-none">
                                            {statusOptions.map(opt => <option key={opt} value={opt} className="bg-[#0b0d14]">{opt}</option>)}
                                        </select>
                                        <ChevronDown className="absolute right-4 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500 pointer-events-none" />
                                    </div>
                                </div>
                                {/* ORDENAÇÃO */}
                                <div className="flex flex-col gap-2.5">
                                    <label className="text-[10px] font-black text-gray-500 uppercase tracking-widest pl-1">Ordenar por</label>
                                    <div className="relative rounded-xl border border-white/5 bg-[#121520] hover:border-cyan-500/30 transition-colors">
                                        <select value={sortBy} onChange={e=>setSortBy(e.target.value)} className="w-full bg-transparent text-white text-sm font-bold rounded-xl px-4 py-3.5 outline-none cursor-pointer appearance-none">
                                            {sortOptions.map(opt => <option key={opt} value={opt} className="bg-[#0b0d14]">{opt}</option>)}
                                        </select>
                                        <ChevronDown className="absolute right-4 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500 pointer-events-none" />
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                {/* HEADER DA LISTAGEM E NAVEGAÇÃO DE TIPOS */}
                <div className="flex flex-col lg:flex-row lg:items-end justify-between gap-6 mb-8">
                    
                    {/* TABS DE TIPO (Mangá, Manhwa...) */}
                    <div className="flex items-center gap-2 overflow-x-auto no-scrollbar snap-x pb-2 w-full lg:w-auto">
                        {typeOptions.map(opt => (
                            <button 
                                key={opt} 
                                onClick={() => setSelectedType(opt)} 
                                className={`flex-none px-5 py-2.5 rounded-xl text-[11px] font-black uppercase tracking-wider whitespace-nowrap transition-all duration-300 snap-start
                                ${selectedType === opt 
                                    ? 'bg-white text-black shadow-[0_0_15px_rgba(255,255,255,0.2)]' 
                                    : 'bg-[#0b0d14] border border-white/10 text-gray-400 hover:text-white hover:bg-[#121520]'}`}
                            >
                                {opt}
                            </button>
                        ))}
                    </div>

                    {/* CONTROLES DE VISUALIZAÇÃO E CONTADOR */}
                    <div className="flex items-center justify-between lg:justify-end gap-6 w-full lg:w-auto border-b border-white/5 lg:border-none pb-4 lg:pb-0">
                        <div className="flex items-center gap-2 text-sm">
                            <Compass className="w-4 h-4 text-cyan-500" />
                            <span className="text-white font-bold">{filteredMangas.length}</span> 
                            <span className="text-gray-500">obras</span>
                        </div>
                        <div className="flex items-center bg-[#0b0d14] border border-white/10 rounded-xl p-1 shadow-sm">
                            <button onClick={() => setViewMode('grid')} className={`p-2 rounded-lg transition-colors ${viewMode === 'grid' ? 'bg-[#1a1f2e] text-cyan-400 shadow-sm' : 'text-gray-500 hover:text-white'}`}>
                                <LayoutGrid className="w-4 h-4" />
                            </button>
                            <button onClick={() => setViewMode('list')} className={`p-2 rounded-lg transition-colors ${viewMode === 'list' ? 'bg-[#1a1f2e] text-cyan-400 shadow-sm' : 'text-gray-500 hover:text-white'}`}>
                                <List className="w-4 h-4" />
                            </button>
                        </div>
                    </div>
                </div>

                {/* GRID DE OBRAS - CINEMÁTICO */}
                <div className={viewMode === 'grid' ? "grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-4 md:gap-5 relative z-0" : "flex flex-col gap-3 relative z-0"}>
                    {currentItems.length > 0 ? currentItems.map(manga => (
                        <div key={manga.id} onClick={() => onNavigate('details', manga)} className={`cursor-pointer group relative bg-[#0b0d14] border border-white/5 hover:border-cyan-500/30 rounded-2xl overflow-hidden transition-all duration-500 transform-gpu hover:-translate-y-1 hover:shadow-[0_15px_30px_-10px_rgba(6,182,212,0.2)] ${viewMode === 'list' ? 'flex flex-row items-center h-32 pr-4' : 'flex flex-col aspect-[2/3]'}`}>
                            
                            {/* IMAGEM E OVERLAYS */}
                            <div className={`relative overflow-hidden bg-[#121520] ${viewMode === 'grid' ? 'absolute inset-0 w-full h-full' : 'w-24 h-full flex-shrink-0'}`}>
                                <img src={manga.coverUrl} className={`w-full h-full object-cover transform-gpu transition-transform duration-[10s] ease-out group-hover:scale-110 ${dataSaver ? 'blur-[1px]' : ''}`} loading="lazy" onError={(e) => e.target.src = `https://placehold.co/300x450/0b0d14/06b6d4?text=Nexo`} />
                                
                                {viewMode === 'grid' && (
                                    <>
                                        <div className="absolute inset-0 bg-gradient-to-t from-[#05060b] via-[#05060b]/40 to-transparent opacity-90 group-hover:opacity-100 transition-opacity"></div>
                                        {/* Efeito sutil de cor no hover */}
                                        <div className="absolute inset-0 bg-cyan-900/0 group-hover:bg-cyan-900/20 mix-blend-overlay transition-colors duration-500"></div>
                                    </>
                                )}
                            </div>
                            
                            {/* BADGES FLUTUANTES (Apenas no Grid) */}
                            {viewMode === 'grid' && (
                                <>
                                    {/* Tipo da Obra */}
                                    <div className="absolute top-3 left-3 bg-[#0b0d14]/80 backdrop-blur-md px-2.5 py-1 rounded-md border border-white/10 z-10">
                                        <span className="text-[9px] font-black text-cyan-400 uppercase tracking-widest">{manga.type || 'MANGÁ'}</span>
                                    </div>
                                    
                                    {/* Avaliação */}
                                    <div className="absolute top-3 right-3 bg-[#0b0d14]/80 backdrop-blur-md px-1.5 py-1 rounded-md border border-white/10 flex items-center gap-1 z-10">
                                        <Star className="w-3 h-3 text-amber-400 fill-amber-400" />
                                        <span className="text-[10px] font-black text-white">{manga.rating ? Number(manga.rating).toFixed(1) : "5.0"}</span>
                                    </div>

                                    {/* INFO BASE GRID */}
                                    <div className="absolute inset-x-0 bottom-0 flex flex-col justify-end p-4 z-10">
                                        <h3 className="font-extrabold text-sm text-gray-100 line-clamp-2 leading-tight mb-2 group-hover:text-cyan-300 transition-colors drop-shadow-md">
                                            {manga.title}
                                        </h3>
                                        <div className="flex items-center justify-between">
                                            <span className="text-[10px] font-bold text-gray-400">
                                                Capítulo {manga.chapters?.length ? manga.chapters[0].number : 0}
                                            </span>
                                            <span className="text-[9px] font-medium text-gray-500 flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                                                Ler <Sparkles className="w-3 h-3 text-cyan-500" />
                                            </span>
                                        </div>
                                    </div>
                                </>
                            )}

                            {/* INFO BASE LISTA */}
                            {viewMode === 'list' && (
                                <div className="flex-1 flex flex-col justify-center pl-5 min-w-0">
                                    <div className="flex items-center gap-2 mb-1.5">
                                        <span className="text-[9px] font-black text-cyan-400 bg-cyan-900/20 px-2 py-0.5 rounded border border-cyan-500/20 uppercase tracking-widest">
                                            {manga.type || 'MANGÁ'}
                                        </span>
                                        <span className="text-[10px] font-medium text-gray-500 flex items-center gap-1">
                                            <Clock className="w-3 h-3"/> {timeAgo(manga.createdAt)}
                                        </span>
                                    </div>
                                    <h3 className="text-sm font-extrabold text-white mb-1 line-clamp-1 group-hover:text-cyan-400 transition-colors">{manga.title}</h3>
                                    <p className="text-xs text-gray-500 mb-3 line-clamp-1 font-medium">{manga.author || "Autor Desconhecido"}</p>
                                    
                                    <div className="flex items-center gap-4">
                                        <div className="bg-[#05060b] px-2 py-1 rounded-md border border-white/5 flex items-center gap-1.5 shadow-sm">
                                            <Star className="w-3 h-3 text-amber-400 fill-amber-400" />
                                            <span className="text-[10px] font-black text-gray-200">{manga.rating ? Number(manga.rating).toFixed(1) : "5.0"}</span>
                                        </div>
                                        <span className="text-[10px] font-bold text-gray-400">
                                            Cap. {manga.chapters?.length ? manga.chapters[0].number : 0}
                                        </span>
                                    </div>
                                </div>
                            )}
                        </div>
                    )) : (
                        <div className="col-span-full py-24 flex flex-col items-center justify-center bg-[#0b0d14]/50 rounded-3xl border border-white/5 border-dashed">
                            <Moon className="w-12 h-12 text-gray-700 mx-auto mb-4" />
                            <p className="text-gray-500 font-bold text-xs uppercase tracking-widest">Nenhum registro encontrado.</p>
                        </div>
                    )}
                </div>

                {/* BOTÃO CARREGAR MAIS */}
                {filteredMangas.length > visibleCount && (
                    <div className="mt-12 flex justify-center">
                        <button onClick={handleLoadMore} className="bg-[#0b0d14] border border-white/10 text-gray-400 hover:border-cyan-500/50 hover:bg-cyan-900/20 hover:text-cyan-400 font-bold px-8 py-3.5 rounded-xl flex items-center gap-3 transition-all duration-300 text-xs uppercase tracking-widest shadow-sm">
                            <Database className="w-4 h-4" /> Carregar Mais
                        </button>
                    </div>
                )}
            </div>
        </div>
    );
}
