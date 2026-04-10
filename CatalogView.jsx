import React, { useState, useMemo } from 'react';
import { Search, ListFilter, BookmarkPlus, LayoutGrid, Tags, X, Filter } from 'lucide-react';

export function CatalogView({ mangas, onNavigate, dataSaver, catalogState, setCatalogState }) {
    // Estado para abrir e fechar o menu flutuante
    const [showFilters, setShowFilters] = useState(false);
    
    const typeFilters = ["Todos", "Mangá", "Manhwa", "Manhua", "Shoujo"];
    const genreFilters = ["Ação", "Romance", "Fantasia", "Drama", "Comédia", "Artes Marciais", "Aventura", "Sobrenatural", "Isekai", "Mistério"];

    const filteredMangas = useMemo(() => {
        let result = [...(mangas || [])];
        
        if (catalogState.filterType !== "Todos") {
            result = result.filter(m => {
                const mType = m.type?.toLowerCase() || '';
                const fType = catalogState.filterType.toLowerCase();
                if (fType === 'mangá' && mType === 'manga') return true;
                return mType === fType;
            });
        }

        if (catalogState.selectedGenres && catalogState.selectedGenres.length > 0) {
            result = result.filter(m => {
                if (!m.genres) return false;
                return catalogState.selectedGenres.every(g => m.genres.includes(g));
            });
        }

        return result.sort((a, b) => a.title.localeCompare(b.title));
    }, [mangas, catalogState.filterType, catalogState.selectedGenres]);

    const toggleGenre = (genre) => {
        const current = catalogState.selectedGenres || [];
        const updated = current.includes(genre) 
            ? current.filter(g => g !== genre)
            : [...current, genre];
        setCatalogState({...catalogState, selectedGenres: updated});
    };

    const clearFilters = () => {
        setCatalogState({ filterType: "Todos", selectedGenres: [] });
    };

    // Conta quantos filtros estão ativos
    const activeFilterCount = (catalogState.filterType !== "Todos" ? 1 : 0) + (catalogState.selectedGenres?.length || 0);

    return (
        <div className="pb-24 animate-in fade-in duration-500 px-4 md:px-8 max-w-7xl mx-auto relative min-h-screen">
            <div className="py-8">
                <h2 className="text-3xl font-black text-white mb-6 uppercase tracking-tighter flex items-center gap-3">
                    <LayoutGrid className="w-8 h-8 text-cyan-500" /> Catálogo Abissal
                </h2>

                {/* Mostra as tags selecionadas para o usuário não ficar perdido */}
                {activeFilterCount > 0 && (
                    <div className="flex flex-wrap gap-2 mb-6 animate-in fade-in">
                        {catalogState.filterType !== "Todos" && (
                            <span className="bg-cyan-900/50 text-cyan-300 border border-cyan-500/50 px-3 py-1 rounded-lg text-[10px] font-black uppercase tracking-widest flex items-center gap-1">
                                {catalogState.filterType}
                            </span>
                        )}
                        {catalogState.selectedGenres?.map(g => (
                            <span key={g} className="bg-fuchsia-900/50 text-fuchsia-300 border border-fuchsia-500/50 px-3 py-1 rounded-lg text-[10px] font-black uppercase tracking-widest flex items-center gap-1">
                                {g}
                            </span>
                        ))}
                    </div>
                )}

                {/* Grid do Catálogo super limpo */}
                <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-4 md:gap-6">
                    {filteredMangas.map(manga => (
                        <div key={manga.id} onClick={() => onNavigate('details', manga)} className="cursor-pointer group">
                            <div className="relative aspect-[2/3] rounded-2xl overflow-hidden bg-[#0d0d12] border border-white/5 shadow-md group-hover:border-cyan-500/50 transition-all duration-500">
                                <img src={manga.coverUrl} className={`w-full h-full object-cover group-hover:scale-110 transition-transform duration-700 ${dataSaver ? 'blur-[1px]' : ''}`} />
                                <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
                            </div>
                            <h3 className="font-bold text-sm text-gray-200 mt-3 line-clamp-1 group-hover:text-cyan-400 transition-colors">{manga.title}</h3>
                            <p className="text-[10px] text-gray-500 font-bold uppercase tracking-widest">{manga.type}</p>
                        </div>
                    ))}
                </div>

                {filteredMangas.length === 0 && (
                    <div className="text-center py-20 bg-[#0d0d12] rounded-3xl border border-white/5 mt-8">
                        <BookmarkPlus className="w-12 h-12 text-gray-700 mx-auto mb-4" />
                        <p className="text-gray-500 font-black uppercase tracking-widest text-sm">Nenhuma obra encontrada nesta categoria.</p>
                    </div>
                )}
            </div>

            {/* O BOTÃO FLUTUANTE (Fica no canto inferior direito) */}
            <button 
                onClick={() => setShowFilters(true)}
                className="fixed bottom-24 right-6 md:bottom-10 md:right-10 z-40 bg-gradient-to-r from-cyan-600 to-blue-700 p-4 rounded-full shadow-[0_0_25px_rgba(34,211,238,0.5)] hover:scale-110 hover:shadow-[0_0_35px_rgba(34,211,238,0.8)] transition-all duration-300 border border-cyan-400/50 group"
            >
                <Filter className="w-6 h-6 text-white group-hover:animate-pulse" />
                {activeFilterCount > 0 && (
                    <span className="absolute -top-1 -right-1 bg-fuchsia-600 text-white text-[10px] font-black w-5 h-5 rounded-full flex items-center justify-center border-2 border-[#050508]">
                        {activeFilterCount}
                    </span>
                )}
            </button>

            {/* O MENU/MODAL SURREAL QUE ABRE AO CLICAR NO BOTÃO FLUTUANTE */}
            {showFilters && (
                <div className="fixed inset-0 z-[100] bg-black/80 backdrop-blur-sm flex items-end sm:items-center justify-center p-4 animate-in fade-in duration-300">
                    <div className="bg-[#0b0e14]/95 border border-cyan-500/30 w-full max-w-md rounded-[2rem] p-6 shadow-[0_0_50px_rgba(8,145,178,0.2)] animate-in slide-in-from-bottom-10 relative overflow-hidden">
                        <div className="absolute top-0 left-0 w-full h-[2px] bg-gradient-to-r from-transparent via-cyan-500 to-transparent"></div>
                        
                        <div className="flex items-center justify-between mb-6">
                            <h3 className="text-lg font-black text-white uppercase tracking-widest flex items-center gap-2">
                                <Filter className="w-5 h-5 text-cyan-400" /> Filtrar Obras
                            </h3>
                            <button onClick={() => setShowFilters(false)} className="p-2 bg-white/5 rounded-full text-gray-400 hover:text-white hover:bg-red-500/20 transition-colors">
                                <X className="w-5 h-5" />
                            </button>
                        </div>

                        {/* Opções de Tipos */}
                        <div className="mb-6">
                            <label className="text-[10px] font-black text-cyan-500 uppercase tracking-widest mb-3 flex items-center gap-2">
                                <ListFilter className="w-3 h-3" /> Tipos
                            </label>
                            <div className="flex flex-wrap gap-2">
                                {typeFilters.map(opt => (
                                    <button 
                                        key={opt} 
                                        onClick={() => setCatalogState({...catalogState, filterType: opt})}
                                        className={`px-4 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all border ${catalogState.filterType === opt ? 'bg-cyan-600 border-cyan-400 text-white shadow-[0_0_15px_rgba(34,211,238,0.4)]' : 'bg-[#13151f] text-gray-400 border-white/5 hover:text-white hover:bg-white/5'}`}
                                    >
                                        {opt}
                                    </button>
                                ))}
                            </div>
                        </div>

                        {/* Opções de Gêneros */}
                        <div className="mb-8">
                            <label className="text-[10px] font-black text-fuchsia-500 uppercase tracking-widest mb-3 flex items-center gap-2">
                                <Tags className="w-3 h-3" /> Gêneros
                            </label>
                            <div className="flex flex-wrap gap-2">
                                {genreFilters.map(genre => (
                                    <button 
                                        key={genre} 
                                        onClick={() => toggleGenre(genre)}
                                        className={`px-3 py-1.5 rounded-lg text-[9px] font-black uppercase tracking-widest transition-all border ${(catalogState.selectedGenres || []).includes(genre) ? 'bg-fuchsia-600/30 border-fuchsia-400 text-fuchsia-100 shadow-[0_0_10px_rgba(217,70,239,0.3)]' : 'bg-transparent text-gray-500 border-white/5 hover:text-gray-300 hover:bg-white/5'}`}
                                    >
                                        {genre}
                                    </button>
                                ))}
                            </div>
                        </div>

                        {/* Botões de Ação */}
                        <div className="flex gap-3 mt-4">
                            <button onClick={clearFilters} className="flex-1 py-3 rounded-xl border border-white/10 text-gray-400 font-black text-xs uppercase tracking-widest hover:text-white hover:bg-white/5 transition-colors">
                                Limpar
                            </button>
                            <button onClick={() => setShowFilters(false)} className="flex-1 py-3 rounded-xl bg-gradient-to-r from-cyan-600 to-blue-600 text-white font-black text-xs uppercase tracking-widest shadow-[0_0_20px_rgba(34,211,238,0.3)] hover:scale-105 transition-transform">
                                Aplicar
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
