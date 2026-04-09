import React, { useState } from 'react';
import { Star, Clock, ListFilter, BookmarkPlus, ChevronRight, Flame } from 'lucide-react';
import { timeAgo } from './helpers';

export function HomeView({ mangas, onNavigate, dataSaver }) {
    const [filter, setFilter] = useState('Todos');

    const recentes = [...mangas].sort((a, b) => b.createdAt - a.createdAt);
    const populares = [...mangas].sort((a, b) => (b.rating || 0) - (a.rating || 0)).slice(0, 10); // Mostra os 10 primeiros no carrossel

    const filterOptions = ['Todos', 'Mangá', 'Manhwa', 'Manhua', 'Comic'];
    const filteredRecentes = filter === 'Todos' ? recentes : recentes.filter(m => m.type === filter);

    return (
        <div className="pb-24 animate-in fade-in duration-500">
            
            {/* SEÇÃO POPULARES (Agora com Scroll Horizontal e Botão Ver Todos) */}
            <div className="mt-4 md:mt-6 px-4 md:px-8 max-w-7xl mx-auto">
                <div className="flex items-center justify-between mb-4">
                    <h2 className="text-xl font-black text-white flex items-center gap-2 tracking-tight">
                        <Flame className="w-5 h-5 text-amber-500" /> Mais Populares
                    </h2>
                    <button onClick={() => onNavigate('popular')} className="text-[10px] sm:text-xs font-black text-cyan-400 hover:text-cyan-300 uppercase tracking-widest flex items-center transition-colors bg-cyan-950/30 px-3 py-1.5 rounded-full border border-cyan-900/50">
                        Ver Todos <ChevronRight className="w-3 h-3 sm:w-4 sm:h-4 ml-1" />
                    </button>
                </div>
                
                {/* Carrossel Horizontal */}
                <div className="flex gap-4 overflow-x-auto pb-4 snap-x snap-mandatory no-scrollbar">
                    {populares.map(manga => (
                        <div key={manga.id} onClick={() => onNavigate('details', manga)} className="w-[130px] md:w-[160px] flex-shrink-0 snap-start cursor-pointer group">
                            <div className={`relative aspect-[2/3] rounded-xl overflow-hidden bg-[#0d0d12] border border-white/5 shadow-lg group-hover:border-amber-500/50 transition-colors duration-300 ${dataSaver ? 'blur-[2px]' : ''}`}>
                                <img src={manga.coverUrl} alt={manga.title} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" loading="lazy" />
                                <div className="absolute top-2 right-2 bg-black/80 backdrop-blur-md px-1.5 py-1 rounded-lg border border-amber-500/30 flex items-center gap-1 shadow-md">
                                    <Star className="w-3 h-3 text-amber-400 fill-amber-400" />
                                    <span className="text-[10px] font-black text-amber-400">{manga.rating ? Number(manga.rating).toFixed(1) : "N/A"}</span>
                                </div>
                                <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                            </div>
                            <h3 className="text-xs md:text-sm font-bold text-gray-200 mt-2 line-clamp-1 group-hover:text-amber-400 transition-colors">{manga.title}</h3>
                        </div>
                    ))}
                </div>
            </div>

            {/* SEÇÃO RECENTES */}
            <div className="mt-8 px-4 md:px-8 max-w-7xl mx-auto">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
                    <h2 className="text-xl font-black text-white flex items-center gap-2 tracking-tight">
                        <Clock className="w-5 h-5 text-cyan-500" /> Atualizações Recentes
                    </h2>
                    
                    {/* Filtros */}
                    <div className="flex items-center gap-2 overflow-x-auto no-scrollbar pb-1">
                        <ListFilter className="w-4 h-4 text-gray-500 flex-shrink-0 mr-1" />
                        {filterOptions.map(opt => (
                            <button key={opt} onClick={() => setFilter(opt)} className={`px-3 py-1.5 rounded-full text-[10px] font-black uppercase tracking-widest whitespace-nowrap transition-all border ${filter === opt ? 'bg-cyan-900/40 text-cyan-400 border-cyan-500/50 shadow-[0_0_10px_rgba(34,211,238,0.2)]' : 'bg-[#0d0d12] text-gray-400 border-white/5 hover:bg-white/5 hover:text-gray-200'}`}>
                                {opt}
                            </button>
                        ))}
                    </div>
                </div>

                <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-3 md:gap-4">
                    {filteredRecentes.length > 0 ? filteredRecentes.map(manga => (
                        <div key={manga.id} onClick={() => onNavigate('details', manga)} className="cursor-pointer group flex flex-col gap-1.5">
                            <div className={`relative aspect-[2/3] rounded-xl overflow-hidden bg-[#0d0d12] border border-white/5 shadow-sm group-hover:border-cyan-500/30 transition-all duration-300 ${dataSaver ? 'blur-[1px]' : ''}`}>
                                <img src={manga.coverUrl} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" loading="lazy" />
                                
                                {manga.chapters && manga.chapters.length > 0 && (
                                    <div className="absolute top-2 left-2 bg-cyan-600 text-white text-[9px] font-black px-1.5 py-0.5 rounded shadow-md uppercase tracking-wider">
                                        Cap {manga.chapters[0].number}
                                    </div>
                                )}
                                
                                <div className="absolute bottom-0 left-0 w-full bg-gradient-to-t from-black/90 via-black/50 to-transparent p-2 pt-6">
                                    <p className="text-[9px] text-cyan-400 font-black uppercase tracking-widest">{timeAgo(manga.createdAt)}</p>
                                </div>
                            </div>
                            <h3 className="font-bold text-xs md:text-sm text-gray-200 line-clamp-2 leading-tight group-hover:text-cyan-400 transition-colors duration-300">{manga.title}</h3>
                        </div>
                    )) : (
                        <div className="col-span-full py-12 text-center bg-[#0d0d12] rounded-2xl border border-white/5">
                            <BookmarkPlus className="w-10 h-10 text-gray-600 mx-auto mb-3" />
                            <p className="text-gray-500 font-bold text-xs uppercase tracking-widest">Nenhuma obra deste tipo encontrada.</p>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}
