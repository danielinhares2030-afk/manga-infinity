import React, { useState, useMemo } from 'react';
import { Search, ListFilter, BookmarkPlus, LayoutGrid } from 'lucide-react';

export function CatalogView({ mangas, onNavigate, dataSaver, catalogState, setCatalogState }) {
    // Adicionado "Shoujo" na lista de tipos
    const typeFilters = ["Todos", "Mangá", "Manhwa", "Manhua", "Shoujo"];

    const filteredMangas = useMemo(() => {
        let result = [...(mangas || [])];
        if (catalogState.filterType !== "Todos") {
            result = result.filter(m => m.type === catalogState.filterType);
        }
        return result.sort((a, b) => a.title.localeCompare(b.title));
    }, [mangas, catalogState.filterType]);

    return (
        <div className="pb-24 animate-in fade-in duration-500 px-4 md:px-8 max-w-7xl mx-auto">
            <div className="py-8">
                <h2 className="text-3xl font-black text-white mb-6 uppercase tracking-tighter flex items-center gap-3">
                    <LayoutGrid className="w-8 h-8 text-cyan-500" /> Catálogo Completo
                </h2>

                {/* Filtros de Tipo */}
                <div className="flex items-center gap-2 overflow-x-auto no-scrollbar pb-4 mb-6">
                    <ListFilter className="w-4 h-4 text-gray-500 mr-2 flex-shrink-0" />
                    {typeFilters.map(opt => (
                        <button 
                            key={opt} 
                            onClick={() => setCatalogState({...catalogState, filterType: opt})}
                            className={`px-5 py-2.5 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all border ${catalogState.filterType === opt ? 'bg-cyan-600 border-cyan-400 text-white shadow-lg' : 'bg-[#0d0d12] text-gray-400 border-white/5 hover:text-gray-200'}`}
                        >
                            {opt}
                        </button>
                    ))}
                </div>

                {/* Grid do Catálogo */}
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
                    <div className="text-center py-20 bg-[#0d0d12] rounded-3xl border border-white/5">
                        <BookmarkPlus className="w-12 h-12 text-gray-700 mx-auto mb-4" />
                        <p className="text-gray-500 font-black uppercase tracking-widest text-sm">Nenhuma obra encontrada nesta categoria.</p>
                    </div>
                )}
            </div>
        </div>
    );
}
