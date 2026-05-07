import React, { useState, useMemo } from 'react';
import { Filter, RefreshCcw, Star, LayoutGrid, List, Flame, Bookmark, BookOpen, ChevronDown } from 'lucide-react';

export function CatalogView({ mangas = [], onNavigate }) {
    const [viewMode, setViewMode] = useState('grid');
    
    // Controle de qual dropdown está aberto
    const [openDropdown, setOpenDropdown] = useState(null); 

    // Estados Reais de Filtro
    const [selectedType, setSelectedType] = useState('Todos');
    const [selectedGenre, setSelectedGenre] = useState('Todos');
    const [selectedStatus, setSelectedStatus] = useState('Todos');
    const [sortBy, setSortBy] = useState('Recentes');

    // Opções
    const types = ['Todos', 'Mangá', 'Manhwa', 'Manhua', 'Shoujo'];
    const genreOptions = ['Todos', 'Ação', 'Aventura', 'Comédia', 'Drama', 'Fantasia', 'Ficção Científica', 'Isekai', 'Mistério', 'Romance', 'Terror'];
    const statusOptions = ['Todos', 'Em Lançamento', 'Completo', 'Hiato'];
    const sortOptions = ['Recentes', 'Popular', 'Melhor Avaliação', 'A - Z'];

    const handleResetFilters = () => {
        setSelectedType('Todos');
        setSelectedGenre('Todos');
        setSelectedStatus('Todos');
        setSortBy('Recentes');
        setOpenDropdown(null);
    };

    // Lógica Segura do Banco
    const filteredMangas = useMemo(() => {
        let result = [...mangas];
        const safeLower = (str) => str ? str.normalize("NFD").replace(/[\u0300-\u036f]/g, "").toLowerCase().trim() : '';

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
    }, [mangas, selectedType, selectedGenre, selectedStatus, sortBy]);

    const getBadgeColor = (type) => {
        const t = (type || '').toUpperCase();
        if (t.includes('MANHWA')) return 'text-green-400';
        if (t.includes('MANHUA')) return 'text-purple-400';
        if (t.includes('SHOUJO')) return 'text-pink-400';
        return 'text-red-500';
    };

    // Função para renderizar os Dropdowns Customizados
    const renderCustomDropdown = (label, options, selectedValue, setSelectedValue, dropdownKey) => {
        const isOpen = openDropdown === dropdownKey;
        return (
            <div className="flex flex-col gap-1.5 relative">
                <label className="text-[10px] font-black text-gray-500 uppercase tracking-widest">{label}</label>
                <button 
                    onClick={() => setOpenDropdown(isOpen ? null : dropdownKey)}
                    className="w-full bg-[#111] border border-white/5 text-white text-xs font-bold rounded-xl px-4 py-3.5 flex justify-between items-center transition-colors hover:border-white/20"
                >
                    <span className="truncate pr-2">{selectedValue}</span>
                    <ChevronDown className={`w-4 h-4 text-red-600 transition-transform duration-300 flex-shrink-0 ${isOpen ? 'rotate-180' : ''}`} />
                </button>

                {isOpen && (
                    <>
                        <div className="fixed inset-0 z-40" onClick={() => setOpenDropdown(null)}></div>
                        <div className="absolute top-[105%] left-0 w-full bg-[#111] border border-white/10 rounded-xl overflow-hidden shadow-[0_20px_40px_rgba(0,0,0,0.8)] z-50 max-h-56 overflow-y-auto animate-in fade-in zoom-in-95 duration-200">
                            {/* Scrollbar Customizada só para o Dropdown */}
                            <style>{`
                                .absolute::-webkit-scrollbar { width: 4px; }
                                .absolute::-webkit-scrollbar-thumb { background: #333; border-radius: 4px; }
                                .absolute::-webkit-scrollbar-track { background: transparent; }
                            `}</style>
                            <div className="flex flex-col">
                                {options.map(opt => (
                                    <button
                                        key={opt}
                                        onClick={() => { setSelectedValue(opt); setOpenDropdown(null); }}
                                        className={`w-full text-left px-4 py-3 text-xs font-bold transition-colors border-b border-white/5 last:border-0 ${selectedValue === opt ? 'bg-red-600 text-white' : 'text-gray-400 hover:bg-[#222] hover:text-white'}`}
                                    >
                                        {opt}
                                    </button>
                                ))}
                            </div>
                        </div>
                    </>
                )}
            </div>
        );
    };

    return (
        <div className="pb-32 min-h-screen bg-[#050505] text-white font-sans overflow-x-hidden relative">
            
            {/* PAINEL DE FILTROS ORGANIZADO NO TOPO */}
            <div className="px-4 md:px-8 pt-6 mb-8 relative z-20">
                <div className="bg-[#0A0A0A] border border-white/5 rounded-2xl p-6 shadow-xl">
                    <div className="flex items-center justify-between mb-6 border-b border-white/5 pb-4">
                        <div className="flex items-center gap-2 text-red-600 font-black uppercase text-sm tracking-widest">
                            <Filter className="w-5 h-5" /> Filtros
                        </div>
                        <button 
                            onClick={handleResetFilters} 
                            className="text-[10px] font-black uppercase text-gray-500 flex items-center gap-2 hover:text-white transition-colors"
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
                                    className={`px-5 py-2.5 rounded-xl text-xs font-black transition-all border
                                    ${selectedType === type ? 'bg-red-600 border-red-600 text-white shadow-[0_0_15px_rgba(220,38,38,0.4)]' : 'bg-[#111] border-white/5 text-gray-400 hover:text-white'}`}
                                >
                                    {type}
                                </button>
                            ))}
                        </div>
                    </div>

                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                        {renderCustomDropdown("Gênero", genreOptions, selectedGenre, setSelectedGenre, "genre")}
                        {renderCustomDropdown("Ordenar por", sortOptions, sortBy, setSortBy, "sort")}
                        {renderCustomDropdown("Status", statusOptions, selectedStatus, setSelectedStatus, "status")}
                    </div>
                </div>
            </div>

            {/* RESULTS HEADER */}
            <div className="px-4 md:px-8 flex items-center justify-between mb-8 relative z-10">
                <div className="flex items-center gap-2 text-red-600">
                    <BookOpen className="w-4 h-4" />
                    <span className="text-sm font-black tracking-widest"><span className="text-white">{filteredMangas.length}</span> obras</span>
                </div>
                <div className="flex bg-[#0A0A0A] p-1 rounded-xl border border-white/5">
                    <button onClick={() => setViewMode('grid')} className={`p-2 rounded-lg transition-colors ${viewMode === 'grid' ? 'bg-red-600 text-white' : 'text-gray-600 hover:text-white'}`}><LayoutGrid className="w-4 h-4"/></button>
                    <button onClick={() => setViewMode('list')} className={`p-2 rounded-lg transition-colors ${viewMode === 'list' ? 'bg-red-600 text-white' : 'text-gray-600 hover:text-white'}`}><List className="w-4 h-4"/></button>
                </div>
            </div>

            {/* CARDS GRID (Mais quadrados: rounded-xl) */}
            <div className="px-4 md:px-8 grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4 md:gap-6 relative z-10">
                {filteredMangas.map(manga => (
                    <div key={manga.id} className="group cursor-pointer flex flex-col" onClick={() => onNavigate('details', manga)}>
                        <div className="relative aspect-[2/3] rounded-xl overflow-hidden mb-3 border border-white/5 shadow-lg group-hover:ring-2 group-hover:ring-red-600 transition-all">
                            <img src={manga.coverUrl} className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700" alt={manga.title} />
                            
                            <div className="absolute inset-0 bg-gradient-to-t from-black via-black/20 to-transparent opacity-90"></div>

                            <div className="absolute top-2 left-2 bg-[#0A0A0A]/80 backdrop-blur-md px-2 py-1 rounded-md text-[9px] font-black uppercase tracking-widest border border-white/10">
                                <span className={getBadgeColor(manga.type)}>{manga.type || 'MANGA'}</span>
                            </div>

                            <div className="absolute top-2 right-2 p-1.5 bg-[#0A0A0A]/80 backdrop-blur-md border border-white/10 rounded-md text-white hover:text-red-500 transition-colors">
                                <Bookmark className="w-3.5 h-3.5" />
                            </div>
                        </div>
                        
                        <h4 className="font-bold text-sm text-white truncate mb-1.5">{manga.title}</h4>
                        
                        <div className="flex items-center gap-3">
                            <div className="flex items-center gap-1">
                                <Star className="w-3.5 h-3.5 text-green-500 fill-current" />
                                <span className="text-[11px] font-bold text-gray-400">{manga.rating ? Number(manga.rating).toFixed(1) : '4.8'}</span>
                            </div>
                            <div className="flex items-center gap-1">
                                <Flame className="w-3 h-3 text-red-500" />
                                <span className="text-[11px] font-bold text-gray-400">{manga.views || '0'}</span>
                            </div>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
}
