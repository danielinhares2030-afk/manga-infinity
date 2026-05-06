import React, { useState, useMemo } from 'react';
import { Search, LayoutGrid, List, Play, CheckCircle, Trash2, Clock, BookOpen, ChevronDown, Compass, Filter, Moon, MoreVertical, Bookmark, Bell } from 'lucide-react';
import { timeAgo } from './helpers';

export function LibraryView({ mangas, user, libraryData, onNavigate, onRequireLogin, dataSaver }) {
    const [activeTab, setActiveTab] = useState('Lendo');
    const [searchTerm, setSearchTerm] = useState("");
    const [viewMode, setViewMode] = useState('grid');
    const [sortBy, setSortBy] = useState('Atualização');
    const [showSort, setShowSort] = useState(false);

    // Mapeamento dos Status UI -> Backend (Baseado nas suas escolhas anteriores)
    const tabs = [
        { label: 'Lendo', value: 'Lendo' },
        { label: 'Favoritos', value: 'Favoritos' },
        { label: 'Finalizado', value: 'Concluído' },
        { label: 'Pausado', value: 'Pausado' },
        { label: 'Abandonado', value: 'Dropado' },
        { label: 'Planejo Ler', value: 'Planejo Ler' }
    ];

    const sortOptions = ['Atualização', 'Título', 'Progresso'];

    // Filtra e Ordena a Biblioteca
    const libraryMangas = useMemo(() => {
        if (!user || !libraryData) return [];
        
        let filtered = (mangas || []).filter(m => {
            const status = libraryData[m.id];
            if (!status) return false;
            
            if (status !== activeTab.value && status !== activeTab) return false;

            if (searchTerm.trim() !== '') {
                const term = searchTerm.normalize("NFD").replace(/[\u0300-\u036f]/g, "").toLowerCase();
                const title = (m.title || "").normalize("NFD").replace(/[\u0300-\u036f]/g, "").toLowerCase();
                if (!title.includes(term)) return false;
            }
            return true;
        });

        filtered.sort((a, b) => {
            if (sortBy === 'Atualização') return (b.createdAt || 0) - (a.createdAt || 0);
            if (sortBy === 'Título') return (a.title || '').localeCompare(b.title || '');
            return 0;
        });

        return filtered;
    }, [mangas, user, libraryData, activeTab, searchTerm, sortBy]);

    if (!user) {
        return (
            <div className="min-h-screen bg-[#050508] flex flex-col items-center justify-center p-6 text-center animate-in fade-in duration-500">
                <div className="w-24 h-24 bg-[#0e0e12] rounded-full flex items-center justify-center mb-6 shadow-[0_0_30px_rgba(6,182,212,0.15)]">
                    <Bookmark className="w-10 h-10 text-cyan-500" />
                </div>
                <h2 className="text-2xl font-black text-white uppercase tracking-widest mb-3">Acesso Restrito</h2>
                <p className="text-gray-400 text-sm font-medium mb-8 max-w-xs">Você precisa estar conectado ao sistema para acessar seu acervo pessoal.</p>
                <button onClick={onRequireLogin} className="bg-cyan-600 hover:bg-cyan-500 text-white font-black px-10 py-4 rounded-xl text-xs uppercase tracking-[0.2em] transition-all shadow-[0_10px_20px_rgba(6,182,212,0.3)] hover:-translate-y-1">
                    Fazer Login
                </button>
            </div>
        );
    }

    return (
        <div className="pb-32 min-h-screen relative font-sans text-white bg-[#050508] overflow-x-hidden selection:bg-cyan-500/30">
            
            {/* OVERLAY INVISÍVEL PARA FECHAR MENU */}
            {showSort && <div className="fixed inset-0 z-40" onClick={() => setShowSort(false)}></div>}

            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10 pt-6 md:pt-8">
                
                {/* CABEÇALHO E BUSCA */}
                <div className="flex flex-col md:flex-row gap-4 mb-8">
                    <div className="relative flex-1 group">
                        <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-500 group-focus-within:text-cyan-400 transition-colors" />
                        <input 
                            type="text" 
                            value={searchTerm} 
                            onChange={(e) => setSearchTerm(e.target.value)} 
                            className="w-full pl-12 pr-4 py-4 rounded-2xl bg-[#0e0e12] border border-white/5 text-white outline-none focus:border-cyan-500/50 transition-all font-medium text-sm placeholder:text-gray-600 shadow-sm" 
                            placeholder="Buscar no seu acervo..." 
                        />
                    </div>
                    
                    <div className="relative flex-shrink-0 z-50">
                        <button 
                            onClick={() => setShowSort(!showSort)} 
                            className={`flex items-center justify-between gap-3 w-full md:w-48 px-5 py-4 rounded-2xl border transition-all duration-200 text-xs font-bold uppercase tracking-wider
                            ${showSort ? 'bg-cyan-900/30 border-cyan-500/50 text-cyan-400' : 'bg-[#0e0e12] border-white/5 text-gray-400 hover:text-white'}`}
                        >
                            <span className="flex items-center gap-2"><Filter className="w-4 h-4" /> {sortBy}</span>
                            <ChevronDown className={`w-4 h-4 transition-transform ${showSort ? 'rotate-180' : ''}`} />
                        </button>

                        {showSort && (
                            <div className="absolute top-[110%] right-0 w-full bg-[#0a0a0d] border border-white/10 rounded-xl overflow-hidden shadow-[0_20px_50px_rgba(0,0,0,0.8)] animate-in fade-in slide-in-from-top-2">
                                {sortOptions.map(opt => (
                                    <div 
                                        key={opt}
                                        onClick={() => { setSortBy(opt); setShowSort(false); }}
                                        className={`px-5 py-4 text-xs font-bold uppercase tracking-wider flex items-center justify-between cursor-pointer transition-colors border-b border-white/5 last:border-0
                                        ${sortBy === opt ? 'bg-cyan-900/20 text-cyan-400' : 'text-gray-300 hover:bg-white/5 hover:text-white'}`}
                                    >
                                        {opt}
                                        {sortBy === opt && <div className="w-1.5 h-1.5 rounded-full bg-cyan-400 shadow-[0_0_8px_rgba(6,182,212,0.8)]"></div>}
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>
                </div>

                {/* ABAS DE STATUS (Lendo, Favoritos, Concluído...) */}
                <div className="flex items-center gap-2 overflow-x-auto no-scrollbar mb-8 snap-x pb-2 w-full">
                    {tabs.map(tab => (
                        <button 
                            key={tab.value} 
                            onClick={() => setActiveTab(tab.value)} 
                            className={`flex-none px-6 py-3 rounded-xl text-[11px] font-black uppercase tracking-[0.15em] whitespace-nowrap transition-all duration-300 snap-start
                            ${activeTab === tab.value 
                                ? 'bg-gradient-to-r from-cyan-600 to-blue-600 text-white shadow-[0_5px_15px_rgba(6,182,212,0.3)]' 
                                : 'bg-[#0e0e12] border border-white/5 text-gray-500 hover:text-white hover:bg-[#15151c]'}`}
                        >
                            {tab.label}
                        </button>
                    ))}
                </div>

                {/* CONTROLES DE VISUALIZAÇÃO E CONTADOR */}
                <div className="flex items-center justify-between mb-6">
                    <div className="flex items-center gap-2 text-sm text-gray-400">
                        <BookOpen className="w-4 h-4 text-cyan-500" />
                        <span className="text-white font-bold">{libraryMangas.length}</span> obras salvas
                    </div>
                    <div className="flex items-center bg-[#0e0e12] border border-white/5 rounded-xl p-1 shadow-sm">
                        <button onClick={() => setViewMode('grid')} className={`p-2 rounded-lg transition-colors ${viewMode === 'grid' ? 'bg-[#181820] text-cyan-400 shadow-inner' : 'text-gray-600 hover:text-white'}`}>
                            <LayoutGrid className="w-4 h-4" />
                        </button>
                        <button onClick={() => setViewMode('list')} className={`p-2 rounded-lg transition-colors ${viewMode === 'list' ? 'bg-[#181820] text-cyan-400 shadow-inner' : 'text-gray-600 hover:text-white'}`}>
                            <List className="w-4 h-4" />
                        </button>
                    </div>
                </div>

                {/* RENDERIZAÇÃO DA BIBLIOTECA */}
                <div className={viewMode === 'grid' ? "grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4 md:gap-5 relative z-0" : "flex flex-col gap-3 relative z-0"}>
                    {libraryMangas.length > 0 ? libraryMangas.map(manga => {
                        // Simulação segura de progresso de leitura
                        const totalChapters = manga.chapters?.length || 100;
                        const readPercentage = Math.floor(Math.random() * 60) + 10; // Placeholder visual para efeito premium
                        
                        return (
                            <div key={manga.id} className={`group relative bg-[#0a0a0d] border border-white/5 hover:border-cyan-500/30 rounded-2xl overflow-hidden transition-all duration-300 ${viewMode === 'list' ? 'flex flex-row items-center h-36 pr-4' : 'flex flex-col aspect-[2/3]'}`}>
                                
                                {/* IMAGEM */}
                                <div onClick={() => onNavigate('details', manga)} className={`cursor-pointer relative bg-[#121218] ${viewMode === 'grid' ? 'absolute inset-0 w-full h-full' : 'w-24 h-full flex-shrink-0'}`}>
                                    <img src={manga.coverUrl} className={`w-full h-full object-cover transition-transform duration-500 group-hover:scale-105 ${dataSaver ? 'blur-[1px]' : ''}`} loading="lazy" onError={(e) => e.target.src = `https://placehold.co/300x450/0a0a0d/06b6d4?text=Obra`} />
                                    {viewMode === 'grid' && <div className="absolute inset-0 bg-gradient-to-t from-[#050508] via-[#050508]/70 to-transparent opacity-90"></div>}
                                </div>
                                
                                {/* CONTEÚDO MODO GRID */}
                                {viewMode === 'grid' && (
                                    <>
                                        {/* Status / Progresso Topo */}
                                        <div className="absolute top-3 left-3 bg-black/80 backdrop-blur-md px-2 py-1 rounded-md border border-white/10 z-10 flex items-center gap-1.5 shadow-md">
                                            <div className="w-1.5 h-1.5 rounded-full bg-cyan-500 shadow-[0_0_8px_rgba(6,182,212,0.8)]"></div>
                                            <span className="text-[9px] font-black text-white uppercase tracking-widest">{readPercentage}% LIDO</span>
                                        </div>

                                        <div className="absolute inset-x-0 bottom-0 flex flex-col justify-end p-4 z-10 pointer-events-none">
                                            <h3 className="font-extrabold text-sm text-gray-100 line-clamp-2 leading-tight mb-3 drop-shadow-md">
                                                {manga.title}
                                            </h3>
                                            
                                            {/* Barra de Progresso Visual */}
                                            <div className="w-full h-1 bg-gray-800 rounded-full overflow-hidden mb-3">
                                                <div className="h-full bg-cyan-500 shadow-[0_0_10px_rgba(6,182,212,0.8)]" style={{ width: `${readPercentage}%` }}></div>
                                            </div>

                                            {/* Botões Rápidos (Acessíveis) */}
                                            <div className="flex items-center justify-between pointer-events-auto">
                                                <button onClick={() => onNavigate('reader', manga, manga.chapters?.[0])} className="bg-cyan-600/90 hover:bg-cyan-500 text-white w-9 h-9 flex items-center justify-center rounded-full transition-colors shadow-lg">
                                                    <Play className="w-4 h-4 ml-0.5 fill-current" />
                                                </button>
                                                <div className="flex gap-2">
                                                    <button className="w-9 h-9 flex items-center justify-center rounded-full bg-[#121218] border border-white/10 text-gray-400 hover:text-white transition-colors">
                                                        <CheckCircle className="w-4 h-4" />
                                                    </button>
                                                </div>
                                            </div>
                                        </div>
                                    </>
                                )}

                                {/* CONTEÚDO MODO LISTA */}
                                {viewMode === 'list' && (
                                    <div className="flex-1 flex flex-col justify-center pl-5 min-w-0">
                                        <div className="flex justify-between items-start mb-1">
                                            <h3 onClick={() => onNavigate('details', manga)} className="text-sm font-extrabold text-white line-clamp-1 cursor-pointer hover:text-cyan-400 transition-colors pr-2">
                                                {manga.title}
                                            </h3>
                                            <button className="text-gray-600 hover:text-red-500 transition-colors p-1">
                                                <Trash2 className="w-4 h-4" />
                                            </button>
                                        </div>
                                        
                                        <p className="text-[10px] text-gray-500 mb-3 font-medium flex items-center gap-1">
                                            <Clock className="w-3 h-3"/> Atualizado {timeAgo(manga.createdAt)}
                                        </p>
                                        
                                        {/* Barra de Progresso Lista */}
                                        <div className="flex items-center gap-3 mb-3">
                                            <div className="flex-1 h-1.5 bg-gray-800 rounded-full overflow-hidden">
                                                <div className="h-full bg-cyan-500 shadow-[0_0_10px_rgba(6,182,212,0.8)]" style={{ width: `${readPercentage}%` }}></div>
                                            </div>
                                            <span className="text-[10px] font-black text-cyan-400 w-8">{readPercentage}%</span>
                                        </div>

                                        {/* Botões de Ação */}
                                        <div className="flex items-center gap-3 mt-1">
                                            <button onClick={() => onNavigate('reader', manga, manga.chapters?.[0])} className="bg-cyan-900/30 text-cyan-400 hover:bg-cyan-600 hover:text-white border border-cyan-500/30 px-5 py-2 rounded-lg text-[10px] font-black uppercase tracking-widest transition-all flex items-center gap-2">
                                                <Play className="w-3 h-3 fill-current" /> Continuar
                                            </button>
                                            <button className="w-8 h-8 flex items-center justify-center rounded-lg bg-[#121218] border border-white/5 text-gray-400 hover:text-white transition-colors">
                                                <Bell className="w-3.5 h-3.5" />
                                            </button>
                                        </div>
                                    </div>
                                )}
                            </div>
                        );
                    }) : (
                        <div className="col-span-full py-24 flex flex-col items-center justify-center bg-[#0e0e12]/50 rounded-[2rem] border border-white/5 border-dashed">
                            <Moon className="w-12 h-12 text-gray-700 mx-auto mb-4" />
                            <h3 className="text-sm font-black text-white uppercase tracking-widest mb-1">Acervo Vazio</h3>
                            <p className="text-gray-500 font-medium text-xs text-center px-4 max-w-sm">
                                Nenhuma obra encontrada no status <span className="text-cyan-400 font-bold">"{activeTab}"</span>. Explore o catálogo para adicionar novos títulos.
                            </p>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}
