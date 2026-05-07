import React, { useState, useMemo } from 'react';
import { Search, List, LayoutGrid, MoreVertical, Play, Clock, BookOpen, Star, Trophy, ChevronDown } from 'lucide-react';

export function LibraryView({ mangas = [], user, libraryData = {}, historyData = [], onNavigate, userProfileData }) {
    const [activeTab, setActiveTab] = useState('Todas');
    const [viewMode, setViewMode] = useState('grid');

    const tabs = ['Todas', 'Lendo', 'Pausado', 'Finalizado', 'Favoritos'];

    // Filtra as obras salvas pelo usuário
    const filteredLibrary = useMemo(() => {
        if (!user || !libraryData) return [];
        return mangas.filter(m => {
            const status = libraryData[m.id];
            if (!status) return false;
            if (activeTab === 'Todas') return true;
            if (activeTab === 'Favoritos') return status === 'Favoritos';
            return status === activeTab;
        });
    }, [mangas, libraryData, activeTab, user]);

    // Pega a última obra que o usuário abriu (Destaque Hero)
    const lastReadManga = useMemo(() => {
        if (!historyData || historyData.length === 0) return null;
        const last = historyData[0];
        return mangas.find(m => m.id === last.mangaId);
    }, [historyData, mangas]);

    if (!user) return (
        <div className="min-h-screen bg-black flex items-center justify-center p-10">
            <button onClick={onNavigate.bind(null, 'login')} className="bg-red-600 text-white px-10 py-4 rounded-2xl font-black uppercase tracking-widest shadow-lg">
                Conectar ao Império
            </button>
        </div>
    );

    return (
        <div className="pb-32 min-h-screen bg-[#050505] text-white font-sans px-4 md:px-8 pt-6">
            <div className="mb-8">
                <h1 className="text-3xl font-black tracking-tight italic uppercase">Minha Estante</h1>
                <p className="text-gray-500 text-sm font-bold uppercase tracking-widest">Manga Empire Personal</p>
            </div>

            {/* TABS DE STATUS */}
            <div className="flex gap-2 overflow-x-auto no-scrollbar mb-8">
                {tabs.map(tab => (
                    <button 
                        key={tab}
                        onClick={() => setActiveTab(tab)}
                        className={`px-6 py-2.5 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all whitespace-nowrap border
                        ${activeTab === tab ? 'bg-red-600 border-red-600 text-white shadow-lg' : 'bg-[#111] text-gray-500 border-white/5 hover:text-white'}`}
                    >
                        {tab}
                    </button>
                ))}
            </div>

            {/* CARD DE DESTAQUE (ÚLTIMA LEITURA) */}
            {lastReadManga && (
                <div className="relative w-full rounded-[2.5rem] overflow-hidden mb-10 group cursor-pointer border border-white/5" onClick={() => onNavigate('details', lastReadManga)}>
                    <div className="absolute inset-0 bg-gradient-to-r from-black via-black/70 to-transparent z-10"></div>
                    <img src={lastReadManga.coverUrl} className="w-full h-72 object-cover object-top opacity-50 group-hover:scale-105 transition-transform duration-1000" alt="Cover" />
                    
                    <div className="absolute inset-0 z-20 p-8 flex flex-col justify-center">
                        <div className="flex items-center gap-2 text-[10px] font-black text-red-500 uppercase tracking-[0.3em] mb-3">
                            <div className="w-2 h-2 rounded-full bg-red-600 animate-pulse"></div>
                            Continuar de onde parou
                        </div>
                        <h2 className="text-4xl md:text-6xl font-black italic uppercase mb-4 leading-none">{lastReadManga.title}</h2>
                        <div className="flex flex-col md:flex-row md:items-center gap-8">
                            <button className="bg-white text-black px-10 py-4 rounded-2xl font-black text-xs uppercase flex items-center gap-3 w-max hover:bg-red-600 hover:text-white transition-all shadow-2xl">
                                <Play className="w-4 h-4 fill-current" /> Ler Capítulo {historyData[0]?.chapterNumber || '??'}
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* GRID DE OBRAS SALVAS */}
            <div className="flex items-center justify-between mb-8">
                <h3 className="text-sm font-black uppercase tracking-[0.3em] flex items-center gap-3">
                    <div className="w-1 h-4 bg-red-600"></div> Seus Títulos
                </h3>
                <div className="flex bg-[#111] p-1 rounded-xl border border-white/5">
                    <button onClick={() => setViewMode('grid')} className={`p-2 rounded-lg transition-all ${viewMode === 'grid' ? 'bg-red-600 text-white shadow-md' : 'text-gray-600'}`}><LayoutGrid className="w-4 h-4"/></button>
                    <button onClick={() => setViewMode('list')} className={`p-2 rounded-lg transition-all ${viewMode === 'list' ? 'bg-red-600 text-white shadow-md' : 'text-gray-600'}`}><List className="w-4 h-4"/></button>
                </div>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-6 md:gap-8">
                {filteredLibrary.length > 0 ? filteredLibrary.map(manga => (
                    <div key={manga.id} className="group cursor-pointer" onClick={() => onNavigate('details', manga)}>
                        <div className="relative aspect-[2/3] rounded-[2rem] overflow-hidden mb-4 border border-white/5 shadow-2xl transition-all group-hover:ring-2 group-hover:ring-red-600">
                            <img src={manga.coverUrl} className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700" alt={manga.title} />
                            <div className="absolute inset-0 bg-gradient-to-t from-black via-transparent to-transparent opacity-90"></div>
                            <div className="absolute top-3 left-3 px-3 py-1 rounded-full bg-red-600 text-[8px] font-black uppercase tracking-widest shadow-lg">
                                {libraryData[manga.id]}
                            </div>
                        </div>
                        <h4 className="font-black text-sm truncate mb-1 uppercase italic">{manga.title}</h4>
                        <div className="w-full h-1 bg-white/10 rounded-full overflow-hidden">
                            <div className="h-full bg-red-600 shadow-[0_0_5px_rgba(220,38,38,1)]" style={{width: '65%'}}></div>
                        </div>
                    </div>
                )) : (
                    <div className="col-span-full py-20 text-center opacity-30 font-black uppercase tracking-widest text-xs">Lista vazia nesta categoria</div>
                )}
            </div>

            {/* ESTATÍSTICAS REAIS (Vindo do seu Banco) */}
            <div className="mt-24 grid grid-cols-1 md:grid-cols-3 gap-6 border-t border-white/5 pt-12">
                <div className="bg-[#0A0A0A] p-8 rounded-[2.5rem] border border-white/5 flex flex-col items-center gap-2 transition-transform hover:-translate-y-1">
                    <div className="w-12 h-12 bg-red-600/10 rounded-2xl flex items-center justify-center mb-2"><BookOpen className="text-red-500 w-6 h-6"/></div>
                    <span className="text-4xl font-black italic">{Object.keys(libraryData).length}</span>
                    <span className="text-[10px] font-black text-gray-500 uppercase tracking-[0.2em]">Obras no seu acervo</span>
                </div>
                <div className="bg-[#0A0A0A] p-8 rounded-[2.5rem] border border-white/5 flex flex-col items-center gap-2 transition-transform hover:-translate-y-1">
                    <div className="w-12 h-12 bg-blue-600/10 rounded-2xl flex items-center justify-center mb-2"><Play className="text-blue-500 w-6 h-6"/></div>
                    <span className="text-4xl font-black italic">{historyData.length}</span>
                    <span className="text-[10px] font-black text-gray-500 uppercase tracking-[0.2em]">Capítulos consumidos</span>
                </div>
                <div className="bg-[#0A0A0A] p-8 rounded-[2.5rem] border border-white/5 flex flex-col items-center gap-2 transition-transform hover:-translate-y-1">
                    <div className="w-12 h-12 bg-green-600/10 rounded-2xl flex items-center justify-center mb-2"><Trophy className="text-green-500 w-6 h-6"/></div>
                    <span className="text-4xl font-black italic">{userProfileData?.level || 1}</span>
                    <span className="text-[10px] font-black text-gray-500 uppercase tracking-[0.2em]">Nível de Leitor</span>
                </div>
            </div>
        </div>
    );
}
