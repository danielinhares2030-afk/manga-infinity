import React, { useState, useMemo, useEffect } from 'react';
import { Search, Star, LayoutGrid, List, Filter, X, ChevronLeft, ChevronRight, Clock, ShieldCheck } from 'lucide-react';
import { timeAgo } from './helpers';

export function CatalogView({ mangas, onNavigate, dataSaver }) {
    const [searchTerm, setSearchTerm] = useState("");
    const [showFilters, setShowFilters] = useState(false);
    const [viewMode, setViewMode] = useState('grid'); 

    const [selectedType, setSelectedType] = useState('Todos');
    const [selectedGenre, setSelectedGenre] = useState('Todos');
    const [selectedStatus, setSelectedStatus] = useState('Todos');
    const [sortBy, setSortBy] = useState('Recentes');

    const [currentPage, setCurrentPage] = useState(1);
    const itemsPerPage = 10; 

    const typeOptions = ['Todos', 'Mangá', 'Manhwa', 'Manhua'];
    const genreOptions = ['Todos', 'Ação', 'Aventura', 'Comédia', 'Drama', 'Fantasia', 'Isekai', 'Romance', 'Shounen'];
    const statusOptions = ['Todos', 'Em Lançamento', 'Completo', 'Hiato'];
    const sortOptions = ['Recentes', 'Melhor Avaliação', 'A - Z'];

    useEffect(() => { setCurrentPage(1); }, [searchTerm, selectedType, selectedGenre, selectedStatus, sortBy]);

    // FILTRO TOTALMENTE CONSERTADO E SEGURO
    const filteredMangas = useMemo(() => {
        let result = [...(mangas || [])];
        const normalize = str => str ? str.normalize("NFD").replace(/[\u0300-\u036f]/g, "").toLowerCase().trim() : '';

        if (searchTerm.trim() !== '') {
            const term = normalize(searchTerm);
            result = result.filter(m => normalize(m.title).includes(term) || normalize(m.author).includes(term));
        }
        if (selectedType !== 'Todos') {
            result = result.filter(m => normalize(m.type) === normalize(selectedType));
        }
        if (selectedGenre !== 'Todos') {
            result = result.filter(m => (m.genres || []).some(g => normalize(g) === normalize(selectedGenre)));
        }
        if (selectedStatus !== 'Todos') {
            result = result.filter(m => normalize(m.status) === normalize(selectedStatus));
        }

        result.sort((a, b) => {
            if (sortBy === 'Recentes') return (b.createdAt || 0) - (a.createdAt || 0);
            if (sortBy === 'Melhor Avaliação') return (Number(b.rating) || 0) - (Number(a.rating) || 0);
            if (sortBy === 'A - Z') return (a.title || '').localeCompare(b.title || '');
            return 0;
        });

        return result;
    }, [mangas, searchTerm, selectedType, selectedGenre, selectedStatus, sortBy]);

    const totalPages = Math.ceil(filteredMangas.length / itemsPerPage);
    const currentItems = filteredMangas.slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage);

    return (
        <div className="pb-32 min-h-screen relative font-sans text-white bg-[#030305] overflow-x-hidden">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-6 relative z-10">
                
                {/* BARRA DE PESQUISA (AZUL) */}
                <div className="flex items-center gap-3 mb-6">
                    <div className="relative flex-1">
                        <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-blue-500" />
                        <input 
                            type="text" value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} 
                            className="w-full pl-12 pr-4 py-4 rounded-xl bg-[#0a0a10] border border-blue-900/30 text-white outline-none focus:border-blue-500 focus:shadow-[0_0_20px_rgba(59,130,246,0.2)] transition-all font-bold text-sm placeholder:text-gray-600" 
                            placeholder="Buscar no catálogo..." 
                        />
                    </div>
                    <button onClick={() => setShowFilters(!showFilters)} className={`p-4 rounded-xl border transition-all ${showFilters ? 'bg-blue-600 border-blue-500 text-white shadow-[0_0_15px_rgba(59,130,246,0.5)]' : 'bg-[#0a0a10] border-blue-900/30 text-blue-500 hover:bg-blue-900/20'}`}>
                        {showFilters ? <X className="w-5 h-5"/> : <Filter className="w-5 h-5" />}
                    </button>
                </div>

                {/* PAINEL DE FILTROS NATIVO SEGURO E BONITO */}
                {showFilters && (
                    <div className="bg-[#0a0a10] border border-blue-900/30 rounded-2xl p-6 mb-8 shadow-2xl animate-in slide-in-from-top-4">
                        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                            {[
                                { label: 'Tipo', state: selectedType, set: setSelectedType, options: typeOptions, color: 'text-red-500' },
                                { label: 'Gênero', state: selectedGenre, set: setSelectedGenre, options: genreOptions, color: 'text-green-500' },
                                { label: 'Status', state: selectedStatus, set: setSelectedStatus, options: statusOptions, color: 'text-blue-500' },
                                { label: 'Ordenar', state: sortBy, set: setSortBy, options: sortOptions, color: 'text-yellow-500' }
                            ].map((f, i) => (
                                <div key={i} className="flex flex-col gap-2">
                                    <label className={`text-[10px] font-black uppercase tracking-widest ${f.color}`}>{f.label}</label>
                                    {/* HTML SELECT NATIVO (100% Funcional no Mobile) */}
                                    <select value={f.state} onChange={e => f.set(e.target.value)} className="w-full bg-[#111118] border border-white/5 text-white text-sm font-bold rounded-lg px-4 py-3 outline-none cursor-pointer focus:border-blue-500 transition-colors">
                                        {f.options.map(o => <option key={o} value={o}>{o}</option>)}
                                    </select>
                                </div>
                            ))}
                        </div>
                    </div>
                )}

                {/* CONTROLES E CONTADOR */}
                <div className="flex items-center justify-between mb-6 border-b border-white/5 pb-4">
                    <span className="text-white font-black text-sm uppercase tracking-widest">
                        {filteredMangas.length} <span className="text-gray-600">Resultados</span>
                    </span>
                    <div className="flex bg-[#0a0a10] rounded-lg border border-white/5">
                        <button onClick={() => setViewMode('grid')} className={`p-2 rounded-l-lg transition-colors ${viewMode === 'grid' ? 'bg-blue-600 text-white' : 'text-gray-500'}`}><LayoutGrid className="w-4 h-4" /></button>
                        <button onClick={() => setViewMode('list')} className={`p-2 rounded-r-lg transition-colors ${viewMode === 'list' ? 'bg-blue-600 text-white' : 'text-gray-500'}`}><List className="w-4 h-4" /></button>
                    </div>
                </div>

                {/* GRID DE OBRAS */}
                <div className={viewMode === 'grid' ? "grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4 relative" : "flex flex-col gap-4 relative"}>
                    {currentItems.length > 0 ? currentItems.map(manga => (
                        <div key={manga.id} onClick={() => onNavigate('details', manga)} className={`cursor-pointer group relative bg-[#0a0a10] border border-white/5 hover:border-blue-500/40 rounded-xl overflow-hidden transition-all duration-300 ${viewMode === 'list' ? 'flex flex-row items-center h-36 pr-4' : 'flex flex-col aspect-[2/3]'}`}>
                            
                            <div className={`relative bg-black ${viewMode === 'grid' ? 'absolute inset-0 w-full h-full' : 'w-24 h-full flex-shrink-0'}`}>
                                <img src={manga.coverUrl} className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105" loading="lazy" />
                                {viewMode === 'grid' && <div className="absolute inset-0 bg-gradient-to-t from-black via-black/50 to-transparent"></div>}
                            </div>
                            
                            {viewMode === 'grid' && (
                                <>
                                    {/* TIPO: VERMELHO */}
                                    <div className="absolute top-2 left-2 z-10 bg-red-600 px-2 py-0.5 rounded shadow-[0_0_10px_rgba(220,38,38,0.5)]">
                                        <span className="text-[9px] font-black text-white uppercase tracking-widest">{manga.type || 'MANGÁ'}</span>
                                    </div>
                                    
                                    {/* AVALIAÇÃO: DOURADO */}
                                    <div className="absolute top-2 right-2 bg-black/80 px-1.5 py-0.5 rounded border border-yellow-500/30 flex items-center gap-1 z-10">
                                        <Star className="w-3 h-3 text-yellow-500 fill-yellow-500 drop-shadow-[0_0_5px_rgba(234,179,8,0.8)]" />
                                        <span className="text-[10px] font-black text-white">{manga.rating ? Number(manga.rating).toFixed(1) : "5.0"}</span>
                                    </div>

                                    {/* TÍTULO E CAPÍTULOS (VERDE) */}
                                    <div className="absolute inset-x-0 bottom-0 flex flex-col justify-end p-3.5 z-10">
                                        <h3 className="font-black text-sm text-white line-clamp-2 leading-tight mb-2 group-hover:text-blue-400 transition-colors drop-shadow-md">
                                            {manga.title}
                                        </h3>
                                        <span className="inline-block bg-green-900/40 border border-green-500/50 text-green-400 px-2 py-1 rounded text-[10px] font-black w-max shadow-sm">
                                            Capítulo {manga.chapters?.length ? manga.chapters[0].number : 0}
                                        </span>
                                    </div>
                                </>
                            )}

                            {viewMode === 'list' && (
                                <div className="flex-1 flex flex-col justify-center pl-4 min-w-0">
                                    <div className="flex items-center gap-2 mb-1.5">
                                        <span className="bg-red-600 px-2 py-0.5 rounded text-[8px] font-black text-white uppercase tracking-widest shadow-[0_0_10px_rgba(220,38,38,0.3)]">
                                            {manga.type || 'MANGÁ'}
                                        </span>
                                        <div className="flex items-center gap-1 bg-[#111] px-1.5 py-0.5 rounded border border-white/5">
                                            <Star className="w-3 h-3 text-yellow-500 fill-yellow-500" />
                                            <span className="text-[10px] font-black text-white">{manga.rating ? Number(manga.rating).toFixed(1) : "5.0"}</span>
                                        </div>
                                    </div>
                                    <h3 className="text-sm font-black text-white mb-1 line-clamp-1 group-hover:text-blue-400 transition-colors">{manga.title}</h3>
                                    <p className="text-[10px] text-gray-500 mb-3 line-clamp-2 font-medium">{manga.synopsis || "Sem sinopse."}</p>
                                    <span className="text-[10px] font-black text-green-500 flex items-center gap-1">
                                        <ShieldCheck className="w-3 h-3" /> Capítulo {manga.chapters?.length ? manga.chapters[0].number : 0}
                                    </span>
                                </div>
                            )}
                        </div>
                    )) : (
                        <div className="col-span-full py-20 flex flex-col items-center justify-center bg-[#0a0a10] rounded-2xl border border-white/5">
                            <Moon className="w-10 h-10 text-gray-700 mx-auto mb-3" />
                            <p className="text-gray-500 font-black text-[10px] uppercase tracking-widest">Nenhuma obra encontrada.</p>
                        </div>
                    )}
                </div>

                {/* PAGINAÇÃO 1 A 10 */}
                {totalPages > 1 && (
                    <div className="mt-14 flex items-center justify-center gap-2">
                        <button disabled={currentPage === 1} onClick={() => handlePageChange(currentPage - 1)} className="p-3 rounded-lg bg-[#0a0a10] text-gray-400 border border-white/5 disabled:opacity-30 hover:bg-blue-600 hover:text-white transition-all shadow-sm">
                            <ChevronLeft className="w-5 h-5" />
                        </button>
                        
                        <div className="flex items-center gap-1 bg-[#0a0a10] p-1.5 rounded-lg border border-white/5">
                            {[...Array(totalPages)].map((_, i) => {
                                if (totalPages > 5 && (i + 1 !== 1 && i + 1 !== totalPages && Math.abs(currentPage - (i + 1)) > 1)) {
                                    if (i + 1 === 2 || i + 1 === totalPages - 1) return <span key={i} className="text-gray-600 px-2 font-black">...</span>;
                                    return null;
                                }
                                return (
                                    <button key={i} onClick={() => handlePageChange(i + 1)} className={`w-10 h-10 rounded-md font-black text-sm transition-all duration-200 ${currentPage === i + 1 ? 'bg-blue-600 text-white shadow-[0_0_15px_rgba(59,130,246,0.5)]' : 'bg-transparent text-gray-500 hover:bg-white/5 hover:text-white'}`}>
                                        {i + 1}
                                    </button>
                                );
                            })}
                        </div>
                        
                        <button disabled={currentPage === totalPages} onClick={() => handlePageChange(currentPage + 1)} className="p-3 rounded-lg bg-[#0a0a10] text-gray-400 border border-white/5 disabled:opacity-30 hover:bg-blue-600 hover:text-white transition-all shadow-sm">
                            <ChevronRight className="w-5 h-5" />
                        </button>
                    </div>
                )}
            </div>
        </div>
    );
}
