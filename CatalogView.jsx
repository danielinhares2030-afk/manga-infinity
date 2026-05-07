import React, { useState, useMemo, useEffect } from 'react';
import { Search, Filter, RefreshCcw, Star, LayoutGrid, List, Flame, Bookmark, ChevronDown } from 'lucide-react';

export function CatalogView({ mangas = [], onNavigate, catalogState, setCatalogState }) {
    const [showFullFilters, setShowFullFilters] = useState(true);
    const [viewMode, setViewMode] = useState('grid');
    
    // Estados Reais de Filtro
    const [searchTerm, setSearchTerm] = useState("");
    const [selectedType, setSelectedType] = useState('Todos');
    const [selectedGenre, setSelectedGenre] = useState('Todos');
    const [selectedStatus, setSelectedStatus] = useState('Todos');
    const [sortBy, setSortBy] = useState('Recentes');

    // Opções
    const types = ['Todos', 'Mangá', 'Manhwa', 'Manhua', 'Shoujo'];
    const genreOptions = ['Todos', 'Ação', 'Aventura', 'Comédia', 'Drama', 'Fantasia', 'Ficção Científica', 'Isekai', 'Mistério', 'Romance', 'Terror'];
    const statusOptions = ['Todos', 'Em Lançamento', 'Completo', 'Hiato'];
    const sortOptions = ['Recentes', 'Popular', 'Melhor Avaliação', 'A - Z'];

    // Lógica de Filtragem Real e Segura
    const filteredMangas = useMemo(() => {
        let result = [...(mangas || [])];
        const safeLower = (str) => str ? str.normalize("NFD").replace(/[\u0300-\u036f]/g, "").toLowerCase().trim() : '';

        if (searchTerm.trim() !== '') {
            const query = safeLower(searchTerm);
            result = result.filter(m => safeLower(m.title).includes(query) || safeLower(m.author).includes(query));
        }

        if (selectedType !== 'Todos') {
            result = result.filter(m => safeLower(m.type) === safeLower(selectedType));
        }

        if (selectedGenre !== 'Todos') {
            result = result.filter(m => {
                if (Array.isArray(m.genres)) return m.genres.some(g => safeLower(g) === safeLower(selectedGenre));
                if (typeof m.genres === 'string') return safeLower(m.genres).includes(safeLower(selectedGenre));
                return false;
            });
        }

        if (selectedStatus !== 'Todos') {
            result = result.filter(m => safeLower(m.status) === safeLower(selectedStatus));
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

    // Cores específicas da imagem para as badges
    const getBadgeColor = (type) => {
        const t = (type || '').toUpperCase();
        if (t.includes('MANHWA')) return 'text-green-400';
        if (t.includes('MANHUA')) return 'text-purple-400';
        if (t.includes('SHOUJO')) return 'text-pink-400';
        return 'text-red-500'; // Manga default
    };

    return (
        <div className="pb-32 min-h-screen bg-[#050505] text-white font-sans overflow-x-hidden">
            
            {/* HERO / TÍTULO */}
            <div className="p-4 md:p-8 pb-4">
                <h1 className="text-3xl md:text-5xl font-black mb-1">Explorar</h1>
                <p className="text-sm font-bold text-gray-500 mb-8">Encontre sua <span className="text-red-600">próxima obsessão</span>.</p>

                {/* BARRA DE PESQUISA */}
                <div className="relative w-full group">
                    <Search className="absolute left-5 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-500 group-focus-within:text-white transition-colors" />
                    <input 
                        type="text" 
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        placeholder="Buscar obras..." 
                        className="w-full bg-[#111] border border-white/5 rounded-2xl py-4 pl-14 pr-6 outline-none focus:border-white/20 transition-all font-bold text-sm text-white"
                    />
                </div>
            </div>

            {/* PAINEL DE FILTROS */}
            <div className="px-4 md:px-8 mb-8">
                <div className="bg-[#0A0A0A] border border-white/5 rounded-[2rem] p-6 shadow-xl relative">
                    {/* Botão flutuante de fechar filtros (Visual apenas) */}
                    <button className="absolute -top-3 -right-3 w-8 h-8 bg-[#222] border border-white/10 rounded-full flex items-center justify-center text-gray-400 hover:text-white">
                        <X className="w-4 h-4" />
                    </button>

                    <div className="flex items-center justify-between mb-6 border-b border-white/5 pb-4">
                        <div className="flex items-center gap-2 text-red-600 font-black uppercase text-sm tracking-widest">
                            <Filter className="w-5 h-5" /> Filtros
                        </div>
                        <button 
                            onClick={() => {setSearchTerm(""); setSelectedType('Todos'); setSelectedGenre('Todos'); setSelectedStatus('Todos');}} 
                            className="text-[10px] font-black uppercase text-red-500 flex items-center gap-2 hover:text-red-400 transition-colors"
                        >
                            <RefreshCcw className="w-3 h-3" /> Limpar tudo
                        </button>
                    </div>

                    <div className="mb-6">
                        <p className="text-[10px] font-black text-gray-500 uppercase tracking-widest mb-3">Tipo de Obra</p>
                        <div className="flex flex-wrap gap-2">
                            {types.map(type => (
                                <button 
                                    key={type}
                                    onClick={() => setSelectedType(type)}
                                    className={`px-5 py-2.5 rounded-full text-xs font-black transition-all border
                                    ${selectedType === type ? 'bg-transparent border-red-600 text-red-500' : 'bg-[#111] border-white/5 text-gray-400 hover:text-white'}`}
                                >
                                    {type}
                                </button>
                            ))}
                        </div>
                    </div>

                    {showFullFilters && (
                        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 animate-in slide-in-from-top-2">
                            {/* GÊNERO */}
                            <div className="flex flex-col gap-1.5">
                                <label className="text-[10px] font-black text-gray-500 uppercase tracking-widest">Gênero</label>
                                <div className="relative">
                                    <select value={selectedGenre} onChange={e=>setSelectedGenre(e.target.value)} className="w-full bg-[#111] border border-white/5 text-white text-xs font-bold rounded-xl px-4 py-3.5 outline-none cursor-pointer focus:border-red-600 appearance-none">
                                        {genreOptions.map(opt => <option key={opt} value={opt} className="bg-[#0A0A0A]">{opt}</option>)}
                                    </select>
                                    <ChevronDown className="absolute right-4 top-1/2 -translate-y-1/2 w-4 h-4 text-red-600 pointer-events-none" />
                                </div>
                            </div>
                            
                            {/* ORDENAR */}
                            <div className="flex flex-col gap-1.5">
                                <label className="text-[10px] font-black text-gray-500 uppercase tracking-widest">Ordenar por</label>
                                <div className="relative">
                                    <select value={sortBy} onChange={e=>setSortBy(e.target.value)} className="w-full bg-[#111] border border-white/5 text-white text-xs font-bold rounded-xl px-4 py-3.5 outline-none cursor-pointer focus:border-red-600 appearance-none">
                                        {sortOptions.map(opt => <option key={opt} value={opt} className="bg-[#0A0A0A]">{opt}</option>)}
                                    </select>
                                    <ChevronDown className="absolute right-4 top-1/2 -translate-y-1/2 w-4 h-4 text-red-600 pointer-events-none" />
                                </div>
                            </div>

                            {/* STATUS */}
                            <div className="flex flex-col gap-1.5">
                                <label className="text-[10px] font-black text-gray-500 uppercase tracking-widest">Status</label>
                                <div className="relative">
                                    <select value={selectedStatus} onChange={e=>setSelectedStatus(e.target.value)} className="w-full bg-[#111] border border-white/5 text-white text-xs font-bold rounded-xl px-4 py-3.5 outline-none cursor-pointer focus:border-red-600 appearance-none">
                                        {statusOptions.map(opt => <option key={opt} value={opt} className="bg-[#0A0A0A]">{opt}</option>)}
                                    </select>
                                    <ChevronDown className="absolute right-4 top-1/2 -translate-y-1/2 w-4 h-4 text-red-600 pointer-events-none" />
                                </div>
                            </div>

                            {/* FANTASMA (Para simular o visual da imagem) */}
                            <div className="flex flex-col gap-1.5">
                                <label className="text-[10px] font-black text-gray-500 uppercase tracking-widest">Ano</label>
                                <div className="relative">
                                    <select className="w-full bg-[#111] border border-white/5 text-white text-xs font-bold rounded-xl px-4 py-3.5 outline-none cursor-pointer focus:border-red-600 appearance-none">
                                        <option>Todos</option>
                                    </select>
                                    <ChevronDown className="absolute right-4 top-1/2 -translate-y-1/2 w-4 h-4 text-red-600 pointer-events-none" />
                                </div>
                            </div>
                        </div>
                    )}

                    <button 
                        onClick={() => setShowFullFilters(!showFullFilters)}
                        className="w-full bg-[#111] border border-white/5 rounded-xl py-3 text-center text-[10px] font-black text-white uppercase tracking-[0.2em] mt-6 flex items-center justify-center gap-2 hover:bg-[#222] transition-colors"
                    >
                        {showFullFilters ? 'Menos filtros' : 'Mais filtros'} <ChevronDown className={`w-4 h-4 text-red-600 transition-transform ${showFullFilters ? 'rotate-180' : ''}`} />
                    </button>
                </div>
            </div>

            {/* RESULTS HEADER */}
            <div className="px-4 md:px-8 flex items-center justify-between mb-8">
                <div className="flex items-center gap-2 text-red-600">
                    <BookOpen className="w-4 h-4" />
                    <span className="text-sm font-black tracking-widest"><span className="text-white">{filteredMangas.length}</span> obras encontradas</span>
                </div>
                <div className="flex bg-[#0A0A0A] p-1 rounded-xl border border-white/5">
                    <button onClick={() => setViewMode('grid')} className={`p-2 rounded-lg transition-colors ${viewMode === 'grid' ? 'bg-red-600 text-white' : 'text-gray-600 hover:text-white'}`}><LayoutGrid className="w-4 h-4"/></button>
                    <button onClick={() => setViewMode('list')} className={`p-2 rounded-lg transition-colors ${viewMode === 'list' ? 'bg-red-600 text-white' : 'text-gray-600 hover:text-white'}`}><List className="w-4 h-4"/></button>
                </div>
            </div>

            {/* CARDS GRID (Idênticos à Imagem 2) */}
            <div className="px-4 md:px-8 grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4 md:gap-6">
                {filteredMangas.map(manga => (
                    <div key={manga.id} className="group cursor-pointer flex flex-col" onClick={() => onNavigate('details', manga)}>
                        <div className="relative aspect-[2/3] rounded-[1.5rem] overflow-hidden mb-3 border border-white/5 shadow-lg group-hover:ring-2 group-hover:ring-red-600 transition-all">
                            <img src={manga.coverUrl} className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700" alt={manga.title} />
                            
                            {/* Overlay Gradient Escuro */}
                            <div className="absolute inset-0 bg-gradient-to-t from-black via-black/20 to-transparent opacity-90"></div>

                            {/* Type Badge */}
                            <div className="absolute top-3 left-3 bg-[#0A0A0A]/80 backdrop-blur-md px-2 py-1 rounded-md text-[9px] font-black uppercase tracking-widest border border-white/10">
                                <span className={getBadgeColor(manga.type)}>{manga.type || 'MANGA'}</span>
                            </div>

                            {/* Bookmark Icon */}
                            <div className="absolute top-3 right-3 p-1.5 bg-[#0A0A0A]/80 backdrop-blur-md border border-white/10 rounded-md text-white hover:text-red-500 transition-colors">
                                <Bookmark className="w-3.5 h-3.5" />
                            </div>

                            {/* Infos on Hover (optional, keeping it clean like the image) */}
                        </div>
                        
                        <h4 className="font-bold text-sm text-white truncate mb-1.5">{manga.title}</h4>
                        
                        <div className="flex items-center gap-3">
                            <div className="flex items-center gap-1">
                                <Star className="w-3.5 h-3.5 text-green-500 fill-current" />
                                <span className="text-[11px] font-bold text-gray-400">{manga.rating ? Number(manga.rating).toFixed(1) : '4.8'}</span>
                            </div>
                            <div className="flex items-center gap-1">
                                <Flame className="w-3 h-3 text-red-500" />
                                <span className="text-[11px] font-bold text-gray-400">{manga.views || '98.7K'}</span>
                            </div>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
}
