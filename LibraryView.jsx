import React, { useState, useMemo } from 'react';
import { Search, List, LayoutGrid, MoreVertical, Play, Clock, BookOpen, Star, Trophy, ChevronDown } from 'lucide-react';
import { timeAgo } from './helpers';

export function LibraryView({ mangas, user, libraryData, historyData, onNavigate, userProfileData }) {
    const [activeTab, setActiveTab] = useState('Todas');
    const [viewMode, setViewMode] = useState('grid');

    const tabs = ['Todas', 'Lendo', 'Pausado', 'Finalizado', 'Favoritos'];

    // Filtra as obras com base no status selecionado
    const filteredLibrary = useMemo(() => {
        if (!user || !libraryData) return [];
        return (mangas || []).filter(m => {
            const status = libraryData[m.id];
            if (!status) return false;
            if (activeTab === 'Todas') return true;
            if (activeTab === 'Favoritos') return status === 'Favoritos';
            return status === activeTab;
        });
    }, [mangas, libraryData, activeTab, user]);

    // Pega a última obra lida para o destaque
    const lastReadManga = useMemo(() => {
        if (!historyData || historyData.length === 0) return null;
        const last = historyData[0];
        return mangas.find(m => m.id === last.mangaId);
    }, [historyData, mangas]);

    if (!user) return <div className="p-20 text-center font-bold opacity-50">Conecte-se para ver sua biblioteca.</div>;

    return (
        <div className="pb-32 min-h-screen bg-[#050505] text-white font-sans px-4 md:px-8 pt-6">
            {/* HEADER */}
            <div className="mb-8">
                <h1 className="text-3xl font-black tracking-tight">Biblioteca</h1>
                <p className="text-gray-500 text-sm">Suas Histórias, do seu jeito.</p>
            </div>

            {/* TABS */}
            <div className="flex gap-2 overflow-x-auto no-scrollbar mb-8">
                {tabs.map(tab => (
                    <button 
                        key={tab}
                        onClick={() => setActiveTab(tab)}
                        className={`px-6 py-2.5 rounded-2xl text-xs font-bold transition-all whitespace-nowrap border
                        ${activeTab === tab ? 'bg-white text-black border-white' : 'bg-[#111] text-gray-500 border-white/5 hover:text-white'}`}
                    >
                        {tab}
                    </button>
                ))}
            </div>

            {/* HERO: CONTINUAR LENDO */}
            {lastReadManga && (
                <div className="relative w-full rounded-[2rem] overflow-hidden mb-10 group cursor-pointer" onClick={() => onNavigate('details', lastReadManga)}>
                    <div className="absolute inset-0 bg-gradient-to-r from-black via-black/60 to-transparent z-10"></div>
                    <img src={lastReadManga.coverUrl} className="w-full h-64 object-cover object-top opacity-60 group-hover:scale-105 transition-transform duration-700" alt="Cover" />
                    
                    <div className="absolute inset-0 z-20 p-6 md:p-10 flex flex-col justify-center">
                        <div className="flex items-center gap-2 text-[10px] font-black text-red-500 uppercase tracking-widest mb-2">
                            <div className="w-2 h-2 rounded-full bg-red-500 animate-pulse"></div>
                            Continuar lendo
                        </div>
                        <h2 className="text-3xl md:text-5xl font-black italic uppercase mb-3">{lastReadManga.title}</h2>
                        <div className="flex gap-2 mb-6">
                            {lastReadManga.genres?.slice(0, 3).map(g => (
                                <span key={g} className="px-3 py-1 bg-white/10 backdrop-blur-md rounded-full text-[10px] font-bold">{g}</span>
                            ))}
                        </div>
                        <div className="flex flex-col md:flex-row md:items-center gap-6">
                            <button className="bg-white text-black px-8 py-3 rounded-xl font-black text-xs uppercase flex items-center gap-3 w-max hover:bg-red-500 hover:text-white transition-all shadow-lg">
                                <Play className="w-4 h-4 fill-current" /> Continuar leitura
                            </button>
                            <div className="flex-1 max-w-xs">
                                <div className="flex justify-between text-[10px] font-bold text-gray-400 mb-1">
                                    <span>Capítulo {historyData[0]?.chapterNumber}</span>
                                    <span>80%</span>
                                </div>
                                <div className="w-full h-1.5 bg-white/10 rounded-full overflow-hidden">
                                    <div className="h-full bg-gradient-to-r from-red-600 to-blue-600 w-[80%] shadow-[0_0_10px_rgba(239,68,68,0.5)]"></div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            )}

            {/* GRID SECTION HEADER */}
            <div className="flex items-center justify-between mb-6">
                <h3 className="text-lg font-black uppercase tracking-widest flex items-center gap-2">
                    <div className="w-1 h-5 bg-red-600"></div> Minhas obras
                </h3>
                <div className="flex items-center gap-4">
                    <button className="text-sm font-bold text-gray-400 flex items-center gap-1">Recentes <ChevronDown className="w-4 h-4" /></button>
                    <div className="flex bg-[#111] p-1 rounded-lg border border-white/5">
                        <button onClick={() => setViewMode('grid')} className={`p-2 rounded-md ${viewMode === 'grid' ? 'bg-[#222] text-white' : 'text-gray-600'}`}><LayoutGrid className="w-4 h-4"/></button>
                        <button onClick={() => setViewMode('list')} className={`p-2 rounded-md ${viewMode === 'list' ? 'bg-[#222] text-white' : 'text-gray-600'}`}><List className="w-4 h-4"/></button>
                    </div>
                </div>
            </div>

            {/* MANGA GRID */}
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-6">
                {filteredLibrary.map(manga => (
                    <div key={manga.id} className="group cursor-pointer" onClick={() => onNavigate('details', manga)}>
                        <div className="relative aspect-[2/3] rounded-2xl overflow-hidden mb-3 border border-white/5 shadow-2xl">
                            <img src={manga.coverUrl} className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500" alt={manga.title} />
                            <div className="absolute inset-0 bg-gradient-to-t from-black via-transparent to-transparent opacity-80"></div>
                            
                            {/* Status Badge */}
                            <div className="absolute top-2 left-2 px-2 py-1 rounded-lg bg-red-600/90 backdrop-blur-md text-[8px] font-black uppercase tracking-tighter">
                                {libraryData[manga.id]}
                            </div>
                            <button className="absolute top-2 right-2 p-1.5 bg-black/40 backdrop-blur-md rounded-lg text-white/70 hover:text-white transition-colors">
                                <MoreVertical className="w-4 h-4" />
                            </button>
                        </div>
                        <h4 className="font-bold text-sm truncate mb-1">{manga.title}</h4>
                        <p className="text-[10px] text-gray-500 font-bold mb-2">Capítulo {manga.chapters?.[0]?.number || 0}</p>
                        <div className="w-full h-1 bg-white/10 rounded-full overflow-hidden">
                            <div className="h-full bg-red-600 w-[60%]"></div>
                        </div>
                    </div>
                ))}
            </div>

            {/* STATS FOOTER */}
            <div className="mt-20 grid grid-cols-3 gap-4 border-t border-white/5 pt-10">
                <div className="bg-[#0A0A0A] p-6 rounded-3xl border border-white/5 text-center flex flex-col items-center gap-2">
                    <div className="w-10 h-10 bg-red-600/10 rounded-2xl flex items-center justify-center mb-2"><BookOpen className="text-red-500 w-5 h-5"/></div>
                    <span className="text-2xl font-black">{filteredLibrary.length}</span>
                    <span className="text-[10px] font-bold text-gray-500 uppercase tracking-widest">Obras salvas</span>
                </div>
                <div className="bg-[#0A0A0A] p-6 rounded-3xl border border-white/5 text-center flex flex-col items-center gap-2">
                    <div className="w-10 h-10 bg-blue-600/10 rounded-2xl flex items-center justify-center mb-2"><Play className="text-blue-500 w-5 h-5"/></div>
                    <span className="text-2xl font-black">{historyData.length}</span>
                    <span className="text-[10px] font-bold text-gray-500 uppercase tracking-widest">Capítulos lidos</span>
                </div>
                <div className="bg-[#0A0A0A] p-6 rounded-3xl border border-white/5 text-center flex flex-col items-center gap-2">
                    <div className="w-10 h-10 bg-green-600/10 rounded-2xl flex items-center justify-center mb-2"><Clock className="text-green-500 w-5 h-5"/></div>
                    <span className="text-2xl font-black">312h</span>
                    <span className="text-[10px] font-bold text-gray-500 uppercase tracking-widest">Tempo de leitura</span>
                </div>
            </div>
        </div>
    );
}
