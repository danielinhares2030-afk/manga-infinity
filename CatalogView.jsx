import React, { useState, useMemo } from 'react';
import { Search, Filter, RefreshCcw, Star, LayoutGrid, List, Flame, Bookmark, ChevronDown } from 'lucide-react';

export function CatalogView({ mangas, onNavigate }) {
    const [showFullFilters, setShowFullFilters] = useState(true);
    const [viewMode, setViewMode] = useState('grid');
    const [searchTerm, setSearchTerm] = useState("");
    const [selectedType, setSelectedType] = useState('Todos');

    const types = ['Todos', 'Mangá', 'Manhwa', 'Manhua', 'Shoujo'];
    const dropdowns = ['Gênero', 'Tema', 'Status', 'Ordenar por', 'Lançamento', 'Ano'];

    const filteredMangas = useMemo(() => {
        return (mangas || []).filter(m => {
            const matchesSearch = m.title.toLowerCase().includes(searchTerm.toLowerCase());
            const matchesType = selectedType === 'Todos' || m.type === selectedType;
            return matchesSearch && matchesType;
        });
    }, [mangas, searchTerm, selectedType]);

    return (
        <div className="pb-32 min-h-screen bg-[#050505] text-white font-sans overflow-x-hidden">
            
            {/* SEARCH TOP */}
            <div className="p-4 md:p-8">
                <div className="relative max-w-3xl mx-auto group">
                    <Search className="absolute left-5 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-500 group-focus-within:text-red-500 transition-colors" />
                    <input 
                        type="text" 
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        placeholder="Buscar obras..." 
                        className="w-full bg-[#111] border border-white/5 rounded-2xl py-4 pl-14 pr-6 outline-none focus:border-red-500/50 transition-all font-bold text-sm"
                    />
                </div>
            </div>

            {/* FILTER PANEL */}
            <div className="px-4 md:px-8 mb-8">
                <div className="bg-[#0A0A0A] border border-white/5 rounded-[2rem] p-6 shadow-2xl">
                    <div className="flex items-center justify-between mb-6">
                        <div className="flex items-center gap-2 text-red-500 font-black uppercase text-xs tracking-widest">
                            <Filter className="w-4 h-4" /> Filtros
                        </div>
                        <button className="text-[10px] font-black uppercase text-gray-500 flex items-center gap-2 hover:text-white transition-colors">
                            <RefreshCcw className="w-3 h-3" /> Limpar
                        </button>
                    </div>

                    <div className="mb-6">
                        <p className="text-[10px] font-black text-gray-600 uppercase tracking-widest mb-3">Tipo de Obra</p>
                        <div className="flex flex-wrap gap-2">
                            {types.map(type => (
                                <button 
                                    key={type}
                                    onClick={() => setSelectedType(type)}
                                    className={`px-6 py-2 rounded-xl text-xs font-bold transition-all border
                                    ${selectedType === type ? 'bg-red-600 border-red-600 text-white shadow-[0_5px_15px_rgba(239,68,68,0.3)]' : 'bg-[#111] border-white/5 text-gray-500 hover:text-white'}`}
                                >
                                    {type}
                                </button>
                            ))}
                        </div>
                    </div>

                    {showFullFilters && (
                        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4 animate-in slide-in-from-top-2">
                            {dropdowns.map(label => (
                                <div key={label}>
                                    <p className="text-[10px] font-black text-gray-600 uppercase tracking-widest mb-2">{label}</p>
                                    <div className="bg-[#111] border border-white/5 rounded-xl px-4 py-3 flex items-center justify-between text-xs font-bold text-gray-400 cursor-pointer hover:border-white/20 transition-all">
                                        Todos <ChevronDown className="w-4 h-4" />
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}

                    <button 
                        onClick={() => setShowFullFilters(!showFullFilters)}
                        className="w-full text-center text-[10px] font-black text-gray-600 uppercase tracking-[0.2em] mt-6 hover:text-white transition-colors"
                    >
                        {showFullFilters ? 'Menos filtros' : 'Mais filtros'}
                    </button>
                </div>
            </div>

            {/* RESULTS HEADER */}
            <div className="px-4 md:px-8 flex items-center justify-between mb-8">
                <div className="flex items-center gap-3">
                    <div className="w-2 h-2 rounded-full bg-red-600"></div>
                    <span className="text-sm font-black uppercase tracking-widest">{filteredMangas.length} obras encontradas</span>
                </div>
                <div className="flex bg-[#0A0A0A] p-1 rounded-lg border border-white/5">
                    <button onClick={() => setViewMode('grid')} className={`p-2 rounded-md ${viewMode === 'grid' ? 'bg-[#222] text-white' : 'text-gray-600'}`}><LayoutGrid className="w-4 h-4"/></button>
                    <button onClick={() => setViewMode('list')} className={`p-2 rounded-md ${viewMode === 'list' ? 'bg-[#222] text-white' : 'text-gray-600'}`}><List className="w-4 h-4"/></button>
                </div>
            </div>

            {/* CARDS */}
            <div className="px-4 md:px-8 grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-8">
                {filteredMangas.map(manga => (
                    <div key={manga.id} className="group cursor-pointer" onClick={() => onNavigate('details', manga)}>
                        <div className="relative aspect-[2/3] rounded-[1.5rem] overflow-hidden mb-4 border border-white/5 shadow-2xl">
                            <img src={manga.coverUrl} className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700" alt={manga.title} />
                            
                            {/* Hover Overlay */}
                            <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                                <Play className="w-12 h-12 text-white fill-current" />
                            </div>

                            {/* Badge */}
                            <div className="absolute top-3 left-3 bg-red-600 px-3 py-1 rounded-lg text-[9px] font-black uppercase shadow-lg">
                                {manga.type || 'Manga'}
                            </div>
                            <button className="absolute top-3 right-3 p-1.5 bg-black/40 backdrop-blur-md rounded-lg text-white/70 hover:text-white transition-colors">
                                <Bookmark className="w-4 h-4" />
                            </button>
                        </div>
                        <h4 className="font-extrabold text-base truncate mb-1 group-hover:text-red-500 transition-colors uppercase italic">{manga.title}</h4>
                        <div className="flex items-center gap-3 text-gray-500">
                            <div className="flex items-center gap-1">
                                <Flame className="w-4 h-4 text-orange-500" />
                                <span className="text-[11px] font-black tracking-tighter">98.7K</span>
                            </div>
                            <div className="flex items-center gap-1">
                                <Star className="w-4 h-4 text-yellow-500 fill-current" />
                                <span className="text-[11px] font-black tracking-tighter">{manga.rating || '5.0'}</span>
                            </div>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
}
