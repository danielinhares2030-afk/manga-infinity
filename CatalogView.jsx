import React, { useState, useMemo } from 'react';
import { Search, Filter, Infinity as InfinityIcon, Clock, Star, ChevronDown, LayoutGrid, List } from 'lucide-react';
import { timeAgo } from './helpers';

export function CatalogView({ mangas, onNavigate, dataSaver, catalogState, setCatalogState }) {
    const [searchTerm, setSearchTerm] = useState("");
    
    // Pegando o estado atual salvo no App.jsx (para manter onde o usuário estava)
    const filterType = catalogState?.filterType || "Todos";
    const visibleCount = catalogState?.visibleCount || 24;

    // Lista de gêneros e tipos
    const filterOptions = [
        'Todos', 'Mangá', 'Manhwa', 'Manhua', 'Ação', 'Aventura', 'Comédia', 'Drama', 
        'Fantasia', 'Isekai', 'Magia', 'Romance', 'Shoujo', 'Shounen'
    ];

    const handleTypeChange = (type) => {
        setCatalogState({ ...catalogState, filterType: type, visibleCount: 24 });
    };

    // Lógica de filtro (Pesquisa por texto + Categoria)
    const filteredMangas = useMemo(() => {
        let result = [...(mangas || [])];

        // Filtra por aba (Tipo ou Gênero)
        if (filterType !== 'Todos') {
            result = result.filter(m => {
                const normalize = str => str.normalize("NFD").replace(/[\u0300-\u036f]/g, "").toLowerCase();
                const mType = m.type ? normalize(m.type) : '';
                const fType = normalize(filterType);
                const mGenres = (m.genres || []).map(g => normalize(g));
                
                if (fType === 'manga' && mType === 'manga') return true;
                return mType === fType || mGenres.includes(fType);
            });
        }

        // Filtra por texto digitado
        if (searchTerm.trim() !== '') {
            const term = normalizeString(searchTerm.toLowerCase());
            result = result.filter(m => normalizeString(m.title?.toLowerCase() || "").includes(term));
        }

        // Ordena pelos adicionados mais recentemente
        return result.sort((a, b) => b.createdAt - a.createdAt);
    }, [mangas, filterType, searchTerm]);

    function normalizeString(str) {
        return str.normalize("NFD").replace(/[\u0300-\u036f]/g, "");
    }

    const currentItems = filteredMangas.slice(0, visibleCount);

    const handleLoadMore = () => {
        setCatalogState({ ...catalogState, visibleCount: visibleCount + 24 });
    };

    return (
        <div className="pb-24 animate-in fade-in duration-500 bg-[#050505] min-h-screen relative font-sans text-white">
            
            {/* Fundo Cósmico Leve */}
            <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-blue-900/10 via-[#050505] to-[#050505] pointer-events-none z-0"></div>

            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10 pt-8">
                
                {/* TÍTULO */}
                <h1 className="text-3xl sm:text-4xl font-black text-white tracking-tighter uppercase mb-6 drop-shadow-md">
                    Catálogo
                </h1>

                {/* BARRA DE PESQUISA */}
                <div className="relative mb-6 group">
                    <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                        <Search className="h-5 w-5 text-gray-500 group-focus-within:text-cyan-400 transition-colors" />
                    </div>
                    <input 
                        type="text" 
                        value={searchTerm} 
                        onChange={(e) => setSearchTerm(e.target.value)} 
                        className="w-full pl-12 pr-4 py-4 rounded-2xl border border-white/5 bg-[#0a0f1c]/80 backdrop-blur-md text-white outline-none focus:border-cyan-500/50 transition-all font-bold text-sm placeholder:text-gray-500 shadow-inner" 
                        placeholder="Buscar títulos, autores..." 
                    />
                </div>

                {/* FILTROS E EXIBIÇÃO (Inspirado na sua referência) */}
                <div className="flex flex-col gap-4 mb-6">
                    
                    {/* Botão de Filtros (Estético) e Toggles de Visualização */}
                    <div className="flex items-center gap-3">
                        <button className="bg-[#0a0f1c]/80 backdrop-blur-md border border-white/5 text-gray-300 font-black text-xs px-4 py-3 rounded-xl flex items-center gap-2 hover:bg-white/5 transition-colors shadow-sm uppercase tracking-widest">
                            <Filter className="w-4 h-4 text-cyan-400" /> Filtros
                        </button>
                        
                        <div className="flex items-center bg-[#0a0f1c]/80 backdrop-blur-md border border-white/5 rounded-xl p-1 shadow-sm">
                            <button className="bg-cyan-500 text-black p-2 rounded-lg shadow-md transition-colors">
                                <LayoutGrid className="w-4 h-4" />
                            </button>
                            <button className="text-gray-500 p-2 rounded-lg hover:text-white transition-colors">
                                <List className="w-4 h-4" />
                            </button>
                        </div>
                    </div>

                    {/* Pílulas de Categoria Deslizantes */}
                    <div className="flex items-center gap-2 overflow-x-auto no-scrollbar pb-2">
                        {filterOptions.map(opt => (
                            <button 
                                key={opt} 
                                onClick={() => handleTypeChange(opt)} 
                                className={`px-5 py-2.5 rounded-full text-[11px] font-black uppercase tracking-widest whitespace-nowrap transition-all duration-200 border ${filterType === opt ? 'bg-gradient-to-r from-cyan-500 to-blue-500 text-black border-transparent shadow-[0_0_15px_rgba(34,211,238,0.4)]' : 'bg-[#0a0f1c]/80 text-gray-400 hover:text-white border-white/5 hover:border-cyan-500/30'}`}
                            >
                                {opt}
                            </button>
                        ))}
                    </div>
                </div>

                {/* CONTADOR DE TÍTULOS */}
                <div className="mb-6 flex items-center gap-2">
                    <InfinityIcon className="w-4 h-4 text-cyan-500/50" />
                    <p className="text-gray-400 text-xs font-bold uppercase tracking-widest">
                        {filteredMangas.length} títulos encontrados na matriz
                    </p>
                </div>

                {/* GRADE DE OBRAS */}
                <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-4 md:gap-5">
                    {currentItems.length > 0 ? currentItems.map(manga => (
                        <div key={manga.id} onClick={() => onNavigate('details', manga)} className="cursor-pointer group flex flex-col gap-2">
                            <div className={`relative aspect-[2/3] rounded-2xl overflow-hidden bg-[#0a0f1c] border border-white/5 group-hover:border-cyan-500/50 shadow-lg group-hover:shadow-[0_8px_25px_rgba(34,211,238,0.2)] transition-all duration-300 group-hover:-translate-y-1 ${dataSaver ? 'blur-[1px]' : ''}`}>
                                <img src={manga.coverUrl} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700 ease-out" loading="lazy" />
                                
                                {/* Badge de Categoria/Tipo (Inspirado na referência) */}
                                {(manga.type || filterType !== 'Todos') && (
                                    <div className="absolute top-2 left-2 bg-gradient-to-r from-cyan-500 to-emerald-500 text-black text-[9px] font-black px-2.5 py-1 rounded-md uppercase tracking-widest shadow-md">
                                        {manga.type || filterType}
                                    </div>
                                )}

                                {/* Badge de Nota/Estrela */}
                                <div className="absolute top-2 right-2 bg-[#050505]/80 backdrop-blur-md px-2 py-1 rounded-md border border-white/10 flex items-center gap-1 shadow-sm">
                                    <Star className="w-3 h-3 text-amber-400 fill-amber-400" />
                                    <span className="text-[10px] font-black text-white">{manga.rating ? Number(manga.rating).toFixed(1) : "5.0"}</span>
                                </div>
                                
                                {/* Degradê inferior com tempo */}
                                <div className="absolute bottom-0 left-0 w-full bg-gradient-to-t from-[#050505] via-[#050505]/80 to-transparent p-3 pt-10">
                                    <p className="text-[9px] text-cyan-300 font-bold uppercase tracking-widest flex items-center gap-1.5 drop-shadow-md">
                                        <Clock className="w-3 h-3"/> {timeAgo(manga.createdAt)}
                                    </p>
                                </div>
                            </div>
                            <h3 className="font-bold text-sm text-gray-200 line-clamp-2 leading-snug group-hover:text-cyan-400 transition-colors duration-200 px-1 mt-1">{manga.title}</h3>
                        </div>
                    )) : (
                        <div className="col-span-full py-24 flex flex-col items-center justify-center bg-[#0a0f1c]/50 rounded-3xl border border-white/5 border-dashed">
                            <Search className="w-12 h-12 text-gray-600 mx-auto mb-4 animate-pulse" />
                            <p className="text-gray-400 font-black text-xs uppercase tracking-widest text-center px-4">A matriz não revelou nenhum resultado.</p>
                        </div>
                    )}
                </div>

                {/* BOTÃO CARREGAR MAIS */}
                {filteredMangas.length > visibleCount && (
                    <div className="mt-12 flex justify-center">
                        <button 
                            onClick={handleLoadMore} 
                            className="bg-[#0a0f1c]/80 backdrop-blur-md border border-white/10 text-white hover:bg-cyan-500 hover:text-black hover:border-cyan-500 font-black px-10 py-4 rounded-2xl flex items-center gap-3 transition-all duration-300 text-xs uppercase tracking-widest shadow-lg group"
                        >
                            Expandir Matriz <ChevronDown className="w-5 h-5 group-hover:translate-y-1 transition-transform" />
                        </button>
                    </div>
                )}
            </div>
        </div>
    );
}
