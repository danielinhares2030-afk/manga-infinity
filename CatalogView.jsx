import React, { useState, useMemo } from 'react';
import { LayoutGrid, Search, Star, Clock, Filter, Compass, ChevronDown, Sparkles } from 'lucide-react';
import { timeAgo } from './helpers';

export function CatalogView({ mangas, onNavigate, dataSaver, catalogState, setCatalogState }) {
    const [searchTerm, setSearchTerm] = useState("");
    
    // Pegando o estado atual salvo no App.jsx (para manter onde o usuário estava)
    const filterType = catalogState?.filterType || "Todos";
    const visibleCount = catalogState?.visibleCount || 24;

    const filterOptions = ['Todos', 'Manhwa', 'Mangá', 'Manhua', 'Shounen', 'Shoujo', 'Isekai'];

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
            
            {/* Fundo Leve com Brilho Superior */}
            <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-cyan-900/10 via-[#050505] to-[#050505] pointer-events-none z-0"></div>

            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10 pt-8 md:pt-12">
                
                {/* CABEÇALHO DO CATÁLOGO: Título + Contador Elegante */}
                <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-10">
                    <div className="flex items-center gap-4">
                        <div className="bg-[#0a0a0a] p-3 rounded-2xl border border-white/5 shadow-lg">
                            <Compass className="w-8 h-8 text-cyan-400" />
                        </div>
                        <div>
                            <h1 className="text-3xl sm:text-4xl font-black text-white tracking-tighter uppercase flex items-center gap-3 drop-shadow-md">
                                Catálogo
                                {/* CONTADOR DE OBRAS AQUI */}
                                <span className="bg-cyan-500/10 border border-cyan-500/30 text-cyan-400 text-[10px] sm:text-xs font-black px-3 py-1.5 rounded-lg uppercase tracking-widest shadow-md">
                                    {filteredMangas.length} Obras
                                </span>
                            </h1>
                            <p className="text-gray-400 text-xs font-bold uppercase tracking-widest mt-1">Acervo completo da matriz</p>
                        </div>
                    </div>
                </div>

                {/* ÁREA DE BUSCA E FILTROS (Glassmorphism) */}
                <div className="bg-[#0a0a0a]/80 backdrop-blur-xl border border-white/5 rounded-3xl p-4 sm:p-6 mb-10 shadow-lg">
                    <div className="flex flex-col lg:flex-row gap-5">
                        
                        {/* Barra de Pesquisa */}
                        <div className="relative flex-1 group">
                            <div className="absolute inset-y-0 left-0 pl-5 flex items-center pointer-events-none">
                                <Search className="h-5 w-5 text-gray-500 group-focus-within:text-cyan-400 transition-colors" />
                            </div>
                            <input 
                                type="text" 
                                value={searchTerm} 
                                onChange={(e) => setSearchTerm(e.target.value)} 
                                className="w-full pl-12 pr-4 py-4 rounded-2xl border border-white/5 bg-[#050505] text-white outline-none focus:border-cyan-500/50 transition-all font-bold text-sm placeholder:text-gray-600 shadow-inner" 
                                placeholder="Buscar título, autor ou palavra-chave..." 
                            />
                        </div>

                        {/* Filtros em Pílulas Deslizantes */}
                        <div className="w-full lg:w-auto overflow-x-auto no-scrollbar flex items-center">
                            <div className="flex items-center gap-2 pb-2 lg:pb-0 px-1 w-max">
                                <Filter className="w-5 h-5 text-gray-600 flex-shrink-0 mr-2 hidden sm:block" />
                                {filterOptions.map(opt => (
                                    <button 
                                        key={opt} 
                                        onClick={() => handleTypeChange(opt)} 
                                        className={`px-6 py-3.5 rounded-xl text-[10px] font-black uppercase tracking-widest whitespace-nowrap transition-all duration-200 border ${filterType === opt ? 'bg-cyan-500 text-black border-cyan-500 shadow-[0_0_15px_rgba(34,211,238,0.3)]' : 'bg-[#050505] text-gray-400 hover:text-white hover:bg-white/5 border-white/5 hover:border-cyan-500/30'}`}
                                    >
                                        {opt}
                                    </button>
                                ))}
                            </div>
                        </div>
                    </div>
                </div>

                {/* GRADE DE OBRAS */}
                <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-4 md:gap-5">
                    {currentItems.length > 0 ? currentItems.map(manga => (
                        <div key={manga.id} onClick={() => onNavigate('details', manga)} className="cursor-pointer group flex flex-col gap-2">
                            <div className={`relative aspect-[2/3] rounded-xl overflow-hidden bg-[#0a0a0a] border border-white/5 group-hover:border-cyan-500/50 shadow-md group-hover:shadow-[0_8px_25px_rgba(34,211,238,0.15)] transition-all duration-300 group-hover:-translate-y-1 ${dataSaver ? 'blur-[1px]' : ''}`}>
                                <img src={manga.coverUrl} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700 ease-out" loading="lazy" />
                                
                                {/* Badge de Capítulo */}
                                {manga.chapters && manga.chapters.length > 0 && (
                                    <div className="absolute top-2 left-2 bg-black/80 backdrop-blur-sm border border-cyan-500/30 text-cyan-400 text-[9px] font-black px-2.5 py-1.5 rounded-lg uppercase tracking-widest shadow-sm">
                                        Cap {manga.chapters[0].number}
                                    </div>
                                )}

                                {/* Badge de Nota */}
                                <div className="absolute top-2 right-2 bg-black/80 backdrop-blur-sm px-2 py-1.5 rounded-lg border border-amber-500/30 flex items-center gap-1 shadow-sm">
                                    <Star className="w-3 h-3 text-amber-400 fill-amber-400" />
                                    <span className="text-[10px] font-black text-white">{manga.rating ? Number(manga.rating).toFixed(1) : "5.0"}</span>
                                </div>
                                
                                <div className="absolute bottom-0 left-0 w-full bg-gradient-to-t from-[#050505] via-[#050505]/80 to-transparent p-3 pt-10">
                                    <p className="text-[9px] text-cyan-400 font-bold uppercase tracking-widest flex items-center gap-1.5 drop-shadow-md"><Clock className="w-3 h-3"/> {timeAgo(manga.createdAt)}</p>
                                </div>
                            </div>
                            <h3 className="font-bold text-sm text-gray-200 line-clamp-2 leading-snug group-hover:text-cyan-400 transition-colors duration-200 px-1 mt-1">{manga.title}</h3>
                        </div>
                    )) : (
                        <div className="col-span-full py-24 flex flex-col items-center justify-center bg-[#0a0a0a]/50 rounded-3xl border border-white/5 border-dashed">
                            <Search className="w-12 h-12 text-gray-600 mx-auto mb-4 animate-pulse" />
                            <p className="text-gray-400 font-black text-xs uppercase tracking-widest text-center px-4">O Vazio não revelou nenhum resultado para sua busca.</p>
                        </div>
                    )}
                </div>

                {/* BOTÃO CARREGAR MAIS */}
                {filteredMangas.length > visibleCount && (
                    <div className="mt-16 flex justify-center">
                        <button 
                            onClick={handleLoadMore} 
                            className="bg-transparent border border-white/10 text-white hover:bg-cyan-500 hover:text-black hover:border-cyan-500 font-black px-10 py-4 rounded-xl flex items-center gap-3 transition-all duration-300 text-xs uppercase tracking-widest shadow-lg group"
                        >
                            Explorar Mais Obras <ChevronDown className="w-5 h-5 group-hover:translate-y-1 transition-transform" />
                        </button>
                    </div>
                )}
            </div>
        </div>
    );
}
