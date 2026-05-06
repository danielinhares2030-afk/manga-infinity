import React, { useState, useMemo } from 'react';
import { Search, LayoutGrid, List, Play, Trash2, Clock, BookOpen, Bookmark } from 'lucide-react';
import { timeAgo } from './helpers';

export function LibraryView({ mangas, user, libraryData, onNavigate, onRequireLogin }) {
    const [activeTab, setActiveTab] = useState('Lendo');
    const [searchTerm, setSearchTerm] = useState("");
    const [viewMode, setViewMode] = useState('grid');

    const tabs = ['Lendo', 'Favoritos', 'Concluído', 'Pausado', 'Dropado', 'Planejo Ler'];

    const libraryMangas = useMemo(() => {
        if (!user || !libraryData) return [];
        return (mangas || []).filter(m => {
            const status = libraryData[m.id];
            if (!status || status !== activeTab) return false;
            if (searchTerm.trim() !== '') {
                const term = searchTerm.normalize("NFD").replace(/[\u0300-\u036f]/g, "").toLowerCase();
                const title = (m.title || "").normalize("NFD").replace(/[\u0300-\u036f]/g, "").toLowerCase();
                return title.includes(term);
            }
            return true;
        }).sort((a, b) => (b.createdAt || 0) - (a.createdAt || 0));
    }, [mangas, user, libraryData, activeTab, searchTerm]);

    if (!user) {
        return (
            <div className="min-h-screen bg-black flex flex-col items-center justify-center p-6 text-center">
                <Bookmark className="w-16 h-16 text-white mb-6 opacity-50" />
                <h2 className="text-2xl font-black text-white uppercase tracking-widest mb-3">Acesso Negado</h2>
                <p className="text-gray-400 text-sm font-medium mb-8 max-w-xs">Faça login para acessar sua biblioteca.</p>
                <button onClick={onRequireLogin} className="bg-white hover:bg-gray-200 text-black font-black px-10 py-4 rounded-full text-xs uppercase tracking-[0.2em] transition-all">
                    Entrar no Sistema
                </button>
            </div>
        );
    }

    return (
        <div className="pb-32 min-h-screen bg-black text-white font-sans overflow-x-hidden">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-6">
                
                {/* BUSCA LIMPA */}
                <div className="relative mb-8">
                    <Search className="absolute left-5 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-500" />
                    <input 
                        type="text" 
                        value={searchTerm} 
                        onChange={(e) => setSearchTerm(e.target.value)} 
                        className="w-full pl-14 pr-6 py-4 rounded-full bg-[#111] border border-white/10 text-white outline-none focus:border-white/40 transition-colors font-bold text-sm placeholder:text-gray-600" 
                        placeholder="Pesquisar na biblioteca..." 
                    />
                </div>

                {/* ABAS COM INDICADOR VERDE */}
                <div className="flex items-center gap-3 overflow-x-auto no-scrollbar mb-8 snap-x pb-2">
                    {tabs.map(tab => (
                        <button 
                            key={tab} 
                            onClick={() => setActiveTab(tab)} 
                            className={`flex-none px-6 py-3 rounded-full text-[11px] font-black uppercase tracking-widest whitespace-nowrap transition-all duration-300 snap-start border
                            ${activeTab === tab 
                                ? 'bg-green-600 border-green-500 text-white shadow-[0_0_20px_rgba(22,163,74,0.4)]' 
                                : 'bg-transparent border-white/10 text-gray-500 hover:text-white hover:border-white/30'}`}
                        >
                            {tab}
                        </button>
                    ))}
                </div>

                {/* CONTROLES DE VISUALIZAÇÃO */}
                <div className="flex items-center justify-between mb-6">
                    <span className="text-gray-400 font-bold text-sm"><span className="text-white">{libraryMangas.length}</span> obras</span>
                    <div className="flex bg-[#111] rounded-lg p-1 border border-white/5">
                        <button onClick={() => setViewMode('grid')} className={`p-2 rounded-md transition-colors ${viewMode === 'grid' ? 'bg-white text-black' : 'text-gray-500'}`}><LayoutGrid className="w-4 h-4" /></button>
                        <button onClick={() => setViewMode('list')} className={`p-2 rounded-md transition-colors ${viewMode === 'list' ? 'bg-white text-black' : 'text-gray-500'}`}><List className="w-4 h-4" /></button>
                    </div>
                </div>

                {/* GRID DE OBRAS */}
                <div className={viewMode === 'grid' ? "grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4 relative" : "flex flex-col gap-4 relative"}>
                    {libraryMangas.length > 0 ? libraryMangas.map(manga => {
                        const readPercentage = Math.floor(Math.random() * 60) + 10; // Placeholder visual
                        return (
                            <div key={manga.id} className={`group relative bg-[#111] border border-white/10 hover:border-white/30 rounded-2xl overflow-hidden transition-all duration-300 ${viewMode === 'list' ? 'flex flex-row items-center h-32 pr-4' : 'flex flex-col aspect-[2/3]'}`}>
                                
                                <div onClick={() => onNavigate('details', manga)} className={`cursor-pointer relative bg-black ${viewMode === 'grid' ? 'absolute inset-0 w-full h-full' : 'w-24 h-full flex-shrink-0'}`}>
                                    <img src={manga.coverUrl} className="w-full h-full object-cover opacity-80 group-hover:opacity-100 transition-opacity duration-500" loading="lazy" />
                                    {viewMode === 'grid' && <div className="absolute inset-0 bg-gradient-to-t from-black via-black/40 to-transparent"></div>}
                                </div>
                                
                                {viewMode === 'grid' && (
                                    <div className="absolute inset-x-0 bottom-0 p-4 z-10 flex flex-col justify-end pointer-events-none">
                                        <h3 className="font-black text-sm text-white line-clamp-2 mb-3 drop-shadow-md">{manga.title}</h3>
                                        {/* Barra de Progresso VERDE */}
                                        <div className="w-full h-1.5 bg-gray-800 rounded-full overflow-hidden mb-3">
                                            <div className="h-full bg-green-500 shadow-[0_0_10px_rgba(22,163,74,0.8)]" style={{ width: `${readPercentage}%` }}></div>
                                        </div>
                                        <div className="flex items-center justify-between pointer-events-auto">
                                            <button onClick={() => onNavigate('reader', manga, manga.chapters?.[0])} className="bg-white hover:bg-gray-200 text-black w-10 h-10 flex items-center justify-center rounded-full transition-transform hover:scale-105">
                                                <Play className="w-4 h-4 ml-0.5 fill-current" />
                                            </button>
                                            <button className="text-gray-500 hover:text-red-500 transition-colors p-2 bg-black/50 rounded-full backdrop-blur-md">
                                                <Trash2 className="w-4 h-4" />
                                            </button>
                                        </div>
                                    </div>
                                )}

                                {viewMode === 'list' && (
                                    <div className="flex-1 flex flex-col justify-center pl-5 min-w-0 py-2">
                                        <div className="flex justify-between items-start mb-1">
                                            <h3 onClick={() => onNavigate('details', manga)} className="text-sm font-black text-white line-clamp-1 cursor-pointer hover:underline pr-2">{manga.title}</h3>
                                            <button className="text-gray-600 hover:text-red-500 transition-colors p-1"><Trash2 className="w-4 h-4" /></button>
                                        </div>
                                        <p className="text-[10px] text-gray-500 mb-3 font-bold flex items-center gap-1"><Clock className="w-3 h-3"/> Atualizado {timeAgo(manga.createdAt)}</p>
                                        <div className="flex items-center gap-3 mb-3">
                                            <div className="flex-1 h-1.5 bg-gray-800 rounded-full overflow-hidden">
                                                <div className="h-full bg-green-500 shadow-[0_0_10px_rgba(22,163,74,0.8)]" style={{ width: `${readPercentage}%` }}></div>
                                            </div>
                                            <span className="text-[10px] font-black text-green-500 w-8">{readPercentage}%</span>
                                        </div>
                                        <button onClick={() => onNavigate('reader', manga, manga.chapters?.[0])} className="bg-white text-black hover:bg-gray-200 px-5 py-2 rounded-lg text-[10px] font-black uppercase tracking-widest transition-all w-max flex items-center gap-2">
                                            <Play className="w-3 h-3 fill-current" /> Ler
                                        </button>
                                    </div>
                                )}
                            </div>
                        );
                    }) : (
                        <div className="col-span-full py-24 flex flex-col items-center justify-center bg-[#111] rounded-3xl border border-white/5 border-dashed">
                            <BookOpen className="w-12 h-12 text-gray-600 mx-auto mb-4" />
                            <h3 className="text-sm font-black text-white uppercase tracking-widest mb-1">Acervo Vazio</h3>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}
