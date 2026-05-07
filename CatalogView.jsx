import React, { useState, useMemo } from 'react';
import { Search, Filter, RefreshCcw, Star, LayoutGrid, List, Flame, Bookmark, ChevronDown, Play } from 'lucide-react';

export function CatalogView({ mangas = [], onNavigate }) {
    const [showFullFilters, setShowFullFilters] = useState(true);
    const [viewMode, setViewMode] = useState('grid');
    const [searchTerm, setSearchTerm] = useState("");
    const [selectedType, setSelectedType] = useState('Todos');

    const types = ['Todos', 'Mangá', 'Manhwa', 'Manhua', 'Shoujo'];
    const dropdowns = ['Gênero', 'Status', 'Ordenar', 'Ano'];

    // Lógica de Filtro 100% Funcional
    const filteredMangas = useMemo(() => {
        return mangas.filter(m => {
            const matchesSearch = m.title.toLowerCase().includes(searchTerm.toLowerCase());
            const matchesType = selectedType === 'Todos' || (m.type && m.type.toLowerCase() === selectedType.toLowerCase());
            return matchesSearch && matchesType;
        });
    }, [mangas, searchTerm, selectedType]);

    return (
        <div className="pb-32 min-h-screen bg-[#050505] text-white font-sans overflow-x-hidden">
            
            {/* BARRA DE BUSCA PREMIUM */}
            <div className="p-6 md:p-10">
                <div className="relative max-w-4xl mx-auto group">
                    <Search className="absolute left-6 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-600 group-focus-within:text-red-500 transition-colors" />
                    <input 
                        type="text" 
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        placeholder="Pesquisar no Império..." 
                        className="w-full bg-[#0A0A0A] border border-white/5 rounded-[2rem] py-5 pl-16 pr-8 outline-none focus:border-red-600/50 transition-all font-bold text-sm shadow-inner"
                    />
                </div>
            </div>

            {/* PAINEL DE FILTROS IGUAL DA IMAGEM */}
            <div className="px-6 md:px-10 mb-10">
                <div className="bg-[#0A0A0A] border border-white/5 rounded-[3rem] p-8 shadow-2xl">
                    <div className="flex items-center justify-between mb-8">
                        <div className="flex items-center gap-3 text-red-600 font-black uppercase text-xs tracking-[0.3em]">
                            <Filter className="w-4 h-4" /> Filtros Avançados
                        </div>
                        <button onClick={() => {setSearchTerm(""); setSelectedType('Todos');}} className="text-[9px] font-black uppercase text-gray-600 flex items-center gap-2 hover:text-white transition-colors">
                            <RefreshCcw className="w-3 h-3" /> Resetar
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

                    <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
                        {dropdowns.map(label => (
                            <div key={label}>
                                <p className="text-[10px] font-black text-gray-500 uppercase tracking-widest mb-3">{label}</p>
                                <div className="bg-[#111] border border-white/5 rounded-2xl px-5 py-4 flex items-center justify-between text-[10px] font-black text-gray-400 cursor-pointer hover:border-white/20 transition-all uppercase tracking-widest">
                                    Todos <ChevronDown className="w-4 h-4" />
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            </div>

            {/* CABEÇALHO DE RESULTADOS */}
            <div className="px-6 md:px-10 flex items-center justify-between mb-10">
                <div className="flex items-center gap-3">
                    <div className="w-2 h-2 rounded-full bg-red-600"></div>
                    <span className="text-xs font-black uppercase tracking-[0.2em]">{filteredMangas.length} Obras Disponíveis</span>
                </div>
                <div className="flex bg-[#0A0A0A] p-1 rounded-xl border border-white/5">
                    <button onClick={() => setViewMode('grid')} className={`p-2 rounded-lg ${viewMode === 'grid' ? 'bg-red-600 text-white' : 'text-gray-600'}`}><LayoutGrid className="w-4 h-4"/></button>
                    <button onClick={() => setViewMode('list')} className={`p-2 rounded-lg ${viewMode === 'list' ? 'bg-red-600 text-white' : 'text-gray-600'}`}><List className="w-4 h-4"/></button>
                </div>
            </div>

            {/* GRID DE CARDS IGUAL DA IMAGEM */}
            <div className="px-6 md:px-10 grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-10">
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
                                <span className="text-[10px] font-black tracking-widest uppercase">98K</span>
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
