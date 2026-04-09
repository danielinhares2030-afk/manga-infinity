import React from 'react';
import { Flame, Star, ArrowLeft } from 'lucide-react';

export function PopularView({ mangas, onNavigate, dataSaver }) {
    // Pega todos os mangás, organiza do maior Rating (avaliação) para o menor, e corta os top 15
    const topPopulares = [...mangas]
        .sort((a, b) => (b.rating || 0) - (a.rating || 0))
        .slice(0, 15);

    return (
        <div className="pb-24 animate-in fade-in duration-500 px-4 md:px-8 max-w-7xl mx-auto">
            <div className="flex items-center gap-4 py-6 border-b border-white/10 mb-6">
                <button onClick={() => onNavigate('home')} className="p-2.5 bg-[#13151f] rounded-xl border border-white/10 text-gray-400 hover:text-white hover:border-cyan-500 transition-all shadow-sm">
                    <ArrowLeft className="w-5 h-5" />
                </button>
                <div>
                    <h2 className="text-2xl font-black text-white flex items-center gap-2 uppercase tracking-tight">
                        <Flame className="w-6 h-6 text-amber-500 animate-pulse" /> O Panteão Abissal
                    </h2>
                    <p className="text-xs text-gray-400 font-medium">As 15 obras mais aclamadas de todo o Vazio.</p>
                </div>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4 md:gap-6">
                {topPopulares.map((manga, index) => (
                    <div key={manga.id} onClick={() => onNavigate('details', manga)} className="cursor-pointer group flex flex-col gap-2 relative">
                        <div className={`relative aspect-[2/3] rounded-xl overflow-hidden bg-[#0d0d12] border border-white/5 shadow-md group-hover:border-amber-500/50 transition-all duration-300 ${dataSaver ? 'blur-[2px]' : ''}`}>
                            <img src={manga.coverUrl} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" loading="lazy" />
                            
                            {/* Medalha de Posição do Ranking */}
                            <div className="absolute top-2 left-2 w-8 h-8 rounded-full bg-[#050508]/90 backdrop-blur-md border border-white/10 flex items-center justify-center shadow-lg z-10">
                                <span className={`text-xs font-black ${index === 0 ? 'text-yellow-400 drop-shadow-[0_0_8px_rgba(250,204,21,0.8)]' : index === 1 ? 'text-gray-300' : index === 2 ? 'text-amber-600' : 'text-white'}`}>
                                    #{index + 1}
                                </span>
                            </div>

                            {/* Nota de Estrela */}
                            <div className="absolute top-2 right-2 bg-[#050508]/90 backdrop-blur-md px-2 py-1 rounded-lg border border-amber-500/30 flex items-center gap-1 shadow-lg z-10">
                                <Star className="w-3 h-3 text-amber-400 fill-amber-400" />
                                <span className="text-[10px] font-black text-amber-400">{manga.rating ? Number(manga.rating).toFixed(1) : "0.0"}</span>
                            </div>
                            <div className="absolute inset-0 bg-gradient-to-t from-[#050508] via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                        </div>
                        <div>
                            <h3 className="font-bold text-sm text-gray-200 line-clamp-1 group-hover:text-amber-400 transition-colors">{manga.title}</h3>
                            <p className="text-[10px] text-gray-500 font-bold uppercase tracking-widest line-clamp-1">{manga.genres?.join(', ') || 'Desconhecido'}</p>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
}
