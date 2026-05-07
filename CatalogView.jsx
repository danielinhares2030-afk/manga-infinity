import React, { useState, useMemo } from 'react';
import { Search, Filter, RefreshCcw, Star, LayoutGrid, List, Flame, Bookmark, ChevronDown, Play, BookOpen } from 'lucide-react';

export function CatalogView({ mangas = [], onNavigate }) {
    const [showFilters, setShowFilters] = useState(false); // Inicia FECHADO
    const [viewMode, setViewMode] = useState('grid');
    
    // Estados de Filtro
    const [searchTerm, setSearchTerm] = useState("");
    const [selectedType, setSelectedType] = useState('Todos');
    const [selectedGenre, setSelectedGenre] = useState('Todos');
    const [selectedStatus, setSelectedStatus] = useState('Todos');
    const [sortBy, setSortBy] = useState('Recentes');

    const types = ['Todos', 'Mangá', 'Manhwa', 'Manhua', 'Shoujo'];
    const genreOptions = ['Todos', 'Ação', 'Aventura', 'Comédia', 'Drama', 'Fantasia', 'Ficção Científica', 'Isekai', 'Mistério', 'Romance', 'Terror'];
    const statusOptions = ['Todos', 'Em Lançamento', 'Completo', 'Hiato'];
    const sortOptions = ['Recentes', 'Popular', 'Melhor Avaliação', 'A - Z'];

    // Botão Limpar / Resetar
    const handleResetFilters = () => {
        setSearchTerm("");
        setSelectedType('Todos');
        setSelectedGenre('Todos');
        setSelectedStatus('Todos');
        setSortBy('Recentes');
    };

    // Lógica Segura do Banco
    const filteredMangas = useMemo(() => {
        let result = [...mangas];
        const safeLower = (str) => str ? str.normalize("NFD").replace(/[\u0300-\u036f]/g, "").toLowerCase().trim() : '';

        if (searchTerm.trim() !== '') {
            const query = safeLower(searchTerm);
            result = result.filter(m => safeLower(m.title).includes(query) || safeLower(m.author).includes(query));
        }

        if (selectedType !== 'Todos') result = result.filter(m => safeLower(m.type) === safeLower(selectedType));
        if (selectedStatus !== 'Todos') result = result.filter(m => safeLower(m.status) === safeLower(selectedStatus));
        if (selectedGenre !== 'Todos') {
            result = result.filter(m => {
                if (Array.isArray(m.genres)) return m.genres.some(g => safeLower(g) === safeLower(selectedGenre));
                if (typeof m.genres === 'string') return safeLower(m.genres).includes(safeLower(selectedGenre));
                return false;
            });
        }

        result.sort((a, b) => {
            if (sortBy === 'Recentes') return (b.createdAt || 0) - (a.createdAt || 0);
            if (sortBy === 'Popular') return (b.views || 0) - (a.views || 0);
            if (sortBy === 'Melhor Avaliação') return (Number(b.rating) || 0) - (Number(a.rating) || 0);
            if (sortBy === 'A - Z') return (a.title || '').localeCompare(b.title || '');
            return 0;
        });

        return result;
    }, [mangas, searchTerm, selectedType, selectedGenre, selectedStatus, sortBy]);

    const getBadgeColor = (type) => {
        const t = (type || '').toUpperCase();
        if (t.includes('MANHWA')) return 'text-green-400';
        if (t.includes('MANHUA')) return 'text-purple-400';
        if (t.includes('SHOUJO')) return 'text-pink-400';
        return 'text-red-500';
    };

    return (
        <div className="pb-32 min-h-screen bg-[#050505] text-white font-sans overflow-x-hidden relative">
            
            <div className="p-4 md:p-8 pb-6">
                <h1 className="text-3xl md:text-5xl font-black mb-1">Explorar</h1>
                <p className="text-sm font-bold text-gray-500 mb-8">Encontre sua <span className="text-red-600">próxima obsessão</span>.</p>

                {/* BARRA DE PESQUISA COM FILTRO FLUTUANTE */}
                <div className="relative w-full max-w-4xl mx-auto flex items-center gap-3 z-50">
                    <div className="relative flex-1 group">
                        <Search className="absolute left-6 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-600 group-focus-within:text-red-500 transition-colors" />
                        <input 
                            type="text" 
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            placeholder="Pesquisar no Império..." 
                            className="w-full bg-[#111] border border-white/5 rounded-[2rem] py-5 pl-16 pr-8 outline-none focus:border-red-600/50 transition-all font-bold text-sm shadow-inner"
                        />
                    </div>
                    
                    {/* Botão de abrir/fechar filtro */}
                    <button onClick={() => setShowFilters(!showFilters)} className={`p-5 rounded-[2rem] border transition-all flex items-center justify-center flex-shrink-0 ${showFilters ? 'bg-red-600 border-red-600 text-white shadow-lg' : 'bg-[#111] border-white/5 text-gray-400 hover:text-white hover:bg-white/5'}`}>
                        <Filter className="w-5 h-5" />
                    </button>

                    {/* CAIXA FLUTUANTE DE FILTROS */}
                    {showFilters && (
                        <div className="absolute top-[115%] left-0 w-full bg-[#0A0A0A] border border-white/10 rounded-[3rem] p-8 shadow-[0_40px_80px_rgba(0,0,0,0.9)] animate-in slide-in-from-top-4 origin-top z-50">
                            
                            <div className="flex items-center justify-between mb-8">
                                <div className="flex items-center gap-3 text-red-600 font-black uppercase text-xs tracking-[0.3em]">
                                    Filtros Avançados
                                </div>
                                {/* BOTÃO DE RESET FUNCIONAL */}
                                <button onClick={handleResetFilters} className="text-[10px] font-black uppercase text-gray-500 flex items-center gap-2 hover:text-white transition-colors">
                                    <RefreshCcw className="w-3 h-3" /> Limpar tudo
                                </button>
                            </div>

                            <div className="mb-8">
                                <p className="text-[10px] font-black text-gray-500 uppercase tracking-widest mb-4">Origem da Obra</p>
                                <div className="flex flex-wrap gap-3">
                                    {types.map(type => (
                                        <button 
                                            key={type}
                                            onClick={() => setSelectedType(type)}
                                            className={`px-8 py-3 rounded-2xl text-[10px] font-black uppercase tracking-widest transition-all border
                                            ${selectedType === type ? 'bg-red-600 border-red-600 text-white shadow-lg' : 'bg-[#111] border-white/5 text-gray-500 hover:text-white'}`}
                                        >
                                            {type}
                                        </button>
                                    ))}
                                </div>
                            </div>

                            <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
                                <div className="flex flex-col gap-1.5">
                                    <label className="text-[10px] font-black text-gray-500 uppercase tracking-widest">Gênero</label>
                                    <div className="relative">
                                        <select value={selectedGenre} onChange={e=>setSelectedGenre(e.target.value)} className="w-full bg-[#111] border border-white/5 text-white text-xs font-bold rounded-2xl px-5 py-4 outline-none cursor-pointer focus:border-red-600 appearance-none">
                                            {genreOptions.map(opt => <option key={opt} value={opt} className="bg-[#0A0A0A]">{opt}</option>)}
                                        </select>
                                        <ChevronDown className="absolute right-5 top-1/2 -translate-y-1/2 w-4 h-4 text-red-600 pointer-events-none" />
                                    </div>
                                </div>
                                <div className="flex flex-col gap-1.5">
                                    <label className="text-[10px] font-black text-gray-500 uppercase tracking-widest">Status</label>
                                    <div className="relative">
                                        <select value={selectedStatus} onChange={e=>setSelectedStatus(e.target.value)} className="w-full bg-[#111] border border-white/5 text-white text-xs font-bold rounded-2xl px-5 py-4 outline-none cursor-pointer focus:border-red-600 appearance-none">
                                            {statusOptions.map(opt => <option key={opt} value={opt} className="bg-[#0A0A0A]">{opt}</option>)}
                                        </select>
                                        <ChevronDown className="absolute right-5 top-1/2 -translate-y-1/2 w-4 h-4 text-red-600 pointer-events-none" />
                                    </div>
                                </div>
                                <div className="flex flex-col gap-1.5">
                                    <label className="text-[10px] font-black text-gray-500 uppercase tracking-widest">Ordenar por</label>
                                    <div className="relative">
                                        <select value={sortBy} onChange={e=>setSortBy(e.target.value)} className="w-full bg-[#111] border border-white/5 text-white text-xs font-bold rounded-2xl px-5 py-4 outline-none cursor-pointer focus:border-red-600 appearance-none">
                                            {sortOptions.map(opt => <option key={opt} value={opt} className="bg-[#0A0A0A]">{opt}</option>)}
                                        </select>
                                        <ChevronDown className="absolute right-5 top-1/2 -translate-y-1/2 w-4 h-4 text-red-600 pointer-events-none" />
                                    </div>
                                </div>
                            </div>
                        </div>
                    )}
                </div>
            </div>

            <div className="px-4 md:px-8 flex items-center justify-between mb-8">
                <div className="flex items-center gap-3">
                    <div className="w-2 h-2 rounded-full bg-red-600"></div>
                    <span className="text-xs font-black uppercase tracking-[0.2em]">{filteredMangas.length} Obras</span>
                </div>
                <div className="flex bg-[#0A0A0A] p-1 rounded-xl border border-white/5">
                    <button onClick={() => setViewMode('grid')} className={`p-2 rounded-lg ${viewMode === 'grid' ? 'bg-red-600 text-white' : 'text-gray-600'}`}><LayoutGrid className="w-4 h-4"/></button>
                    <button onClick={() => setViewMode('list')} className={`p-2 rounded-lg ${viewMode === 'list' ? 'bg-red-600 text-white' : 'text-gray-600'}`}><List className="w-4 h-4"/></button>
                </div>
            </div>

            <div className="px-4 md:px-8 grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-6 md:gap-10">
                {filteredMangas.map(manga => (
                    <div key={manga.id} className="group cursor-pointer" onClick={() => onNavigate('details', manga)}>
                        <div className="relative aspect-[2/3] rounded-[2.5rem] overflow-hidden mb-5 border border-white/5 shadow-2xl transition-all group-hover:scale-[1.03]">
                            <img src={manga.coverUrl} className="w-full h-full object-cover" alt={manga.title} />
                            <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center backdrop-blur-[2px]">
                                <Play className="w-14 h-14 text-white fill-current" />
                            </div>
                            <div className="absolute top-4 left-4 bg-red-600 px-4 py-1.5 rounded-full text-[8px] font-black uppercase tracking-[0.2em] shadow-2xl">
                                {manga.type || 'Manga'}
                            </div>
                        </div>
                        <h4 className="font-black text-sm truncate mb-2 group-hover:text-red-500 transition-colors uppercase italic tracking-tighter">{manga.title}</h4>
                        <div className="flex items-center gap-4 text-gray-500">
                            <div className="flex items-center gap-1.5">
                                <Flame className="w-3.5 h-3.5 text-red-500" />
                                <span className="text-[10px] font-black tracking-widest uppercase">{manga.views || '0'}</span>
                            </div>
                            <div className="flex items-center gap-1.5">
                                <Star className="w-3.5 h-3.5 text-yellow-500 fill-current" />
                                <span className="text-[10px] font-black tracking-widest uppercase">{manga.rating || '5.0'}</span>
                            </div>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
}
