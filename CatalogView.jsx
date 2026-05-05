import React, { useState, useMemo } from 'react';
import { Search, Star, ChevronDown, LayoutGrid, List, SlidersHorizontal, Moon, Database, BookOpen, MoreVertical, Bookmark, Book, Flower2, ChevronUp } from 'lucide-react';

export function CatalogView({ mangas, onNavigate, dataSaver, catalogState, setCatalogState }) {
    const [searchTerm, setSearchTerm] = useState("");
    const [showFilters, setShowFilters] = useState(true); // Deixei true por padrão como na print
    const [viewMode, setViewMode] = useState('grid'); 

    const [selectedType, setSelectedType] = useState('TODOS');
    const [selectedGenre, setSelectedGenre] = useState('Todos os gêneros');
    const [selectedStatus, setSelectedStatus] = useState('Todos os status');
    const [sortBy, setSortBy] = useState('Mais populares');

    const visibleCount = catalogState?.visibleCount || 24;

    const typeOptions = [
        { label: 'Todos', value: 'TODOS', icon: LayoutGrid },
        { label: 'Manga', value: 'MANGÁ', icon: BookOpen },
        { label: 'Manhwa', value: 'MANHWA', icon: Book },
        { label: 'Manhua', value: 'MANHUA', icon: Book },
        { label: 'Shoujo', value: 'SHOUJO', icon: Flower2 }
    ];
    
    const genreOptions = ['Todos os gêneros', 'Ação', 'Artes Marciais', 'Aventura', 'Comédia', 'Drama', 'Esportes', 'Fantasia', 'Ficção Científica', 'Isekai', 'Magia', 'Mistério', 'Romance', 'Seinen', 'Shoujo', 'Shounen', 'Slice of Life', 'Terror'];
    const statusOptions = ['Todos os status', 'Em Lançamento', 'Completo', 'Hiato'];
    const sortOptions = ['Mais populares', 'Recentes', 'A - Z', 'Z - A'];

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

        if (selectedGenre !== 'Todos os gêneros') {
            const fGenre = normalize(selectedGenre);
            result = result.filter(m => {
                const mGenres = (m.genres || []).map(g => normalize(g));
                return mGenres.includes(fGenre);
            });
        }

        if (selectedStatus !== 'Todos os status') {
            // Mapeia o "Todos os status" de volta para o padrão se necessário, ou filtra direto
            const fStatus = normalize(selectedStatus);
            result = result.filter(m => normalize(m.status) === fStatus);
        }

        result.sort((a, b) => {
            if (sortBy === 'Recentes') return b.createdAt - a.createdAt;
            if (sortBy === 'Mais populares') return (Number(b.rating) || 0) - (Number(a.rating) || 0);
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
        <div className="pb-32 min-h-screen relative font-sans text-white bg-[#030303] overflow-x-hidden">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10 pt-4">
                
                {/* BARRA DE PESQUISA E BOTÃO DE FILTRO */}
                <div className="flex items-center gap-3 mb-6">
                    <div className="relative flex-1">
                        <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-500" />
                        <input 
                            type="text" 
                            value={searchTerm} 
                            onChange={(e) => setSearchTerm(e.target.value)} 
                            className="w-full pl-11 pr-4 py-3 rounded-2xl bg-[#121215] text-white outline-none border border-transparent focus:border-purple-600/50 transition-all font-medium text-sm placeholder:text-gray-500" 
                            placeholder="Buscar obra..." 
                        />
                    </div>
                    
                    <button 
                        onClick={() => setShowFilters(!showFilters)} 
                        className={`flex items-center gap-2 px-4 py-3 rounded-2xl border transition-all duration-300 text-sm font-medium
                        ${showFilters ? 'bg-purple-900/10 border-purple-600/50 text-white' : 'bg-transparent border-white/10 text-gray-400 hover:text-white'}`}
                    >
                        <SlidersHorizontal className="w-4 h-4 text-purple-500" /> Filtros
                    </button>
                </div>

                {/* PAINEL DE FILTROS EXPANSÍVEL */}
                {showFilters && (
                    <div className="mb-6 animate-in slide-in-from-top-2 duration-300">
                        {/* TIPO DE OBRA */}
                        <div className="flex items-center justify-between mb-3">
                            <h3 className="text-[10px] font-bold text-purple-500 uppercase tracking-widest">Tipo de obra</h3>
                            <ChevronUp className="w-4 h-4 text-gray-500" />
                        </div>
                        
                        <div className="flex items-center gap-2 overflow-x-auto no-scrollbar mb-6 snap-x pb-2">
                            {typeOptions.map(opt => (
                                <button 
                                    key={opt.value} 
                                    onClick={() => setSelectedType(opt.value)} 
                                    className={`flex items-center gap-2 flex-none px-4 py-2.5 rounded-xl text-sm font-medium whitespace-nowrap transition-all duration-200 snap-start border
                                    ${selectedType === opt.value 
                                        ? 'bg-purple-600 text-white border-purple-500' 
                                        : 'bg-transparent border-white/10 text-gray-300 hover:bg-[#121215]'}`}
                                >
                                    <opt.icon className="w-4 h-4" /> {opt.label}
                                </button>
                            ))}
                        </div>

                        {/* DROPDOWNS: GÊNEROS, STATUS, ORDENAR */}
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 pb-6 border-b border-white/5">
                            <div className="flex flex-col gap-2">
                                <label className="text-[10px] font-bold text-purple-500 uppercase tracking-widest">Gêneros</label>
                                <div className="relative">
                                    <select value={selectedGenre} onChange={e=>setSelectedGenre(e.target.value)} className="w-full bg-[#121215] text-gray-300 text-sm font-medium rounded-xl px-4 py-3 outline-none cursor-pointer appearance-none border border-transparent focus:border-purple-500/50 transition-colors">
                                        {genreOptions.map(opt => <option key={opt} value={opt} className="bg-[#121215] text-white">{opt}</option>)}
                                    </select>
                                    <ChevronDown className="absolute right-4 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500 pointer-events-none" />
                                </div>
                            </div>
                            <div className="flex flex-col gap-2">
                                <label className="text-[10px] font-bold text-purple-500 uppercase tracking-widest">Status</label>
                                <div className="relative">
                                    <select value={selectedStatus} onChange={e=>setSelectedStatus(e.target.value)} className="w-full bg-[#121215] text-gray-300 text-sm font-medium rounded-xl px-4 py-3 outline-none cursor-pointer appearance-none border border-transparent focus:border-purple-500/50 transition-colors">
                                        {statusOptions.map(opt => <option key={opt} value={opt} className="bg-[#121215] text-white">{opt}</option>)}
                                    </select>
                                    <ChevronDown className="absolute right-4 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500 pointer-events-none" />
                                </div>
                            </div>
                            <div className="flex flex-col gap-2">
                                <label className="text-[10px] font-bold text-purple-500 uppercase tracking-widest">Ordenar Por</label>
                                <div className="relative">
                                    <select value={sortBy} onChange={e=>setSortBy(e.target.value)} className="w-full bg-[#121215] text-gray-300 text-sm font-medium rounded-xl px-4 py-3 outline-none cursor-pointer appearance-none border border-transparent focus:border-purple-500/50 transition-colors">
                                        {sortOptions.map(opt => <option key={opt} value={opt} className="bg-[#121215] text-white">{opt}</option>)}
                                    </select>
                                    <ChevronDown className="absolute right-4 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500 pointer-events-none" />
                                </div>
                            </div>
                        </div>
                    </div>
                )}

                {/* HEADER DE RESULTADOS E BOTÕES DE VISUALIZAÇÃO */}
                <div className="flex items-center justify-between mb-6">
                    <div className="flex items-center gap-2 text-gray-400 text-sm">
                        <BookOpen className="w-5 h-5 text-gray-500" />
                        <span className="text-white font-bold">{filteredMangas.length}</span> obras encontradas
                    </div>
                    
                    <div className="flex items-center gap-2">
                        <button onClick={() => setViewMode('grid')} className={`p-2 rounded-xl transition-colors duration-200 ${viewMode === 'grid' ? 'bg-purple-900/40 text-purple-500 border border-purple-500/30' : 'bg-[#121215] text-gray-500 border border-transparent'}`}>
                            <LayoutGrid className="w-5 h-5" />
                        </button>
                        <button onClick={() => setViewMode('list')} className={`p-2 rounded-xl transition-colors duration-200 ${viewMode === 'list' ? 'bg-purple-900/40 text-purple-500 border border-purple-500/30' : 'bg-[#121215] text-gray-500 border border-transparent'}`}>
                            <List className="w-5 h-5" />
                        </button>
                    </div>
                </div>

                {/* GRID DE OBRAS (ESTILO PRINT: Capa isolada + Info abaixo) */}
                <div className={viewMode === 'grid' ? "grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-3 relative z-0" : "flex flex-col gap-3 relative z-0"}>
                    {currentItems.length > 0 ? currentItems.map(manga => (
                        <div key={manga.id} onClick={() => onNavigate('details', manga)} className={`cursor-pointer group flex flex-col bg-[#0e0e11] rounded-2xl overflow-hidden border border-white/5 transition-colors duration-200 hover:bg-[#121215] ${viewMode === 'list' ? 'flex-row h-32 items-center pr-4' : ''}`}>
                            
                            {/* CAIXA DA IMAGEM */}
                            <div className={`relative bg-zinc-900 ${viewMode === 'grid' ? 'w-full aspect-[4/5]' : 'w-24 h-full flex-shrink-0'}`}>
                                <img src={manga.coverUrl} className={`w-full h-full object-cover transition-opacity duration-300 ${dataSaver ? 'blur-[1px]' : ''}`} loading="lazy" onError={(e) => e.target.src = `https://placehold.co/300x400/121215/9333ea?text=Sem+Capa`} />
                                
                                {/* FITINHA (BOOKMARK) ROXA NO TOPO DIREITO */}
                                {viewMode === 'grid' && (
                                    <Bookmark className="absolute -top-1 right-3 w-8 h-10 text-purple-500 fill-current drop-shadow-md" />
                                )}
                            </div>

                            {/* INFORMAÇÕES (FUNDO ESCURO, ABAIXO DA IMAGEM) */}
                            <div className={`flex flex-col justify-between ${viewMode === 'grid' ? 'p-3.5 pt-3' : 'pl-4 py-2 flex-1'}`}>
                                <div>
                                    <h3 className="font-bold text-sm text-white line-clamp-2 leading-snug group-hover:text-purple-400 transition-colors">
                                        {manga.title}
                                    </h3>
                                    <p className="text-xs font-medium text-gray-400 mt-1">
                                        Cap. {manga.chapters?.length ? manga.chapters[0].number : 0}
                                    </p>
                                </div>
                                
                                <div className="flex items-center justify-between mt-3">
                                    <div className="flex items-center gap-1.5 text-purple-500">
                                        <Star className="w-3.5 h-3.5 fill-current" />
                                        <span className="text-xs font-bold">{manga.rating ? Number(manga.rating).toFixed(1) : "5.0"}</span>
                                    </div>
                                    <MoreVertical className="w-4 h-4 text-gray-500 hover:text-white transition-colors" />
                                </div>
                            </div>
                        </div>
                    )) : (
                        <div className="col-span-full py-24 flex flex-col items-center justify-center bg-[#121215]/50 rounded-3xl border border-white/5 border-dashed">
                            <Moon className="w-12 h-12 text-gray-600 mx-auto mb-4" />
                            <p className="text-gray-500 font-bold text-xs uppercase tracking-widest">Nenhuma obra compatível com os filtros.</p>
                        </div>
                    )}
                </div>

                {/* BOTÃO CARREGAR MAIS */}
                {filteredMangas.length > visibleCount && (
                    <div className="mt-8 flex justify-center">
                        <button onClick={handleLoadMore} className="bg-[#121215] text-gray-400 hover:bg-purple-900/20 hover:text-purple-400 font-bold px-8 py-3.5 rounded-xl flex items-center gap-2 transition-all duration-300 text-xs border border-transparent hover:border-purple-500/30">
                            <Database className="w-4 h-4" /> Carregar Mais
                        </button>
                    </div>
                )}
            </div>
        </div>
    );
}
