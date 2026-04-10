import React, { useState, useMemo } from 'react';
import { Search, ListFilter, BookmarkPlus, LayoutGrid, Tags } from 'lucide-react';

export function CatalogView({ mangas, onNavigate, dataSaver, catalogState, setCatalogState }) {
    const typeFilters = ["Todos", "Mangá", "Manhwa", "Manhua", "Shoujo"];
    const genreFilters = ["Ação", "Romance", "Fantasia", "Drama", "Comédia", "Artes Marciais", "Aventura", "Sobrenatural", "Isekai", "Mistério"];

    const filteredMangas = useMemo(() => {
        let result = [...(mangas || [])];
        
        // Filtro de Tipo (Mangá, Manhwa, etc) corrigindo a diferença de acento
        if (catalogState.filterType !== "Todos") {
            result = result.filter(m => {
                const mType = m.type?.toLowerCase() || '';
                const fType = catalogState.filterType.toLowerCase();
                if (fType === 'mangá' && mType === 'manga') return true;
                return mType === fType;
            });
        }

        // Filtro de Gêneros (Ação, Romance, etc)
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

    return (
        <div className="pb-24 animate-in fade-in duration-500 px-4 md:px-8 max-w-7xl mx-auto">
            <div className="py-8">
                <h2 className="text-3xl font-black text-white mb-6 uppercase tracking-tighter flex items-center gap-3">
                    <LayoutGrid className="w-8 h-8 text-cyan-500 drop-shadow-[0_0_15px_rgba(34,211,238,0.8)] animate-pulse" /> Catálogo Abissal
                </h2>

                {/* PAINEL DE FILTROS FLUTUANTE SURREAL */}
                <div className="sticky top-20 z-30 mb-10 p-4 sm:p-5 rounded-3xl bg-[#0b0e14]/60 backdrop-blur-3xl border border-cyan-500/20 shadow-[0_20px_50px_rgba(8,145,178,0.15)] transition-all duration-500 ring-1 ring-white/5">
                    {/* Brilho de fundo mistico */}
                    <div className="absolute inset-0 rounded-3xl bg-gradient-to-br from-cyan-500/5 to-fuchsia-500/5 pointer-events-none"></div>
                    
                    <div className="relative z-10">
                        {/* Filtros de Tipo */}
                        <div className="flex items-center gap-2 overflow-x-auto no-scrollbar pb-3 mb-3 border-b border-white/5">
                            <ListFilter className="w-4 h-4 text-cyan-400 mr-2 flex-shrink-0 drop-shadow-[0_0_8px_rgba(34,211,238,0.8)]" />
                            {typeFilters.map(opt => (
                                <button 
                                    key={opt} 
                                    onClick={() => setCatalogState({...catalogState, filterType: opt})}
                                    className={`px-5 py-2.5 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all duration-300 border whitespace-nowrap ${catalogState.filterType === opt ? 'bg-gradient-to-r from-cyan-600 to-blue-600 border-cyan-400 text-white shadow-[0_0_20px_rgba(34,211,238,0.5)] scale-105' : 'bg-[#0d0d12]/50 text-gray-400 border-white/10 hover:text-white hover:border-cyan-500/50 hover:bg-white/10'}`}
                                >
                                    {opt}
                                </button>
                            ))}
                        </div>

                        {/* Filtros de Gênero */}
                        <div className="flex items-center gap-2 overflow-x-auto no-scrollbar pb-2">
                            <Tags className="w-4 h-4 text-fuchsia-400 mr-2 flex-shrink-0 drop-shadow-[0_0_8px_rgba(217,70,239,0.8)]" />
                            {genreFilters.map(genre => (
                                <button 
                                    key={genre} 
                                    onClick={() => toggleGenre(genre)}
                                    className={`px-4 py-1.5 rounded-lg text-[9px] font-black uppercase tracking-widest transition-all duration-300 border whitespace-nowrap ${(catalogState.selectedGenres || []).includes(genre) ? 'bg-fuchsia-600/30 border-fuchsia-400 text-fuchsia-100 shadow-[0_0_15px_rgba(217,70,239,0.4)] scale-105' : 'bg-transparent text-gray-500 border-white/5 hover:text-gray-300 hover:border-fuchsia-500/30 hover:bg-white/5'}`}
                                >
                                    {genre}
                                </button>
                            ))}
                        </div>
                    </div>
                </div>

                {/* Grid do Catálogo */}
                <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-4 md:gap-6 relative z-10">
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
                    <div className="text-center py-20 bg-[#0d0d12]/50 rounded-3xl border border-white/5 mt-8 backdrop-blur-sm">
                        <BookmarkPlus className="w-12 h-12 text-gray-700 mx-auto mb-4" />
                        <p className="text-gray-500 font-black uppercase tracking-widest text-sm">Nenhuma obra encontrada no Vazio com estes filtros.</p>
                    </div>
                )}
            </div>
        </div>
    );
}
