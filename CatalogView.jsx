import React, { useState, useMemo, useEffect } from 'react';
import { Search, Star, LayoutGrid, List, ChevronLeft, ChevronRight, Clock, ShieldCheck, Hash } from 'lucide-react';
import { timeAgo } from './helpers';

export function CatalogView({ mangas, onNavigate, dataSaver, catalogState, setCatalogState }) {
    const [searchTerm, setSearchTerm] = useState("");
    const [viewMode, setViewMode] = useState('grid'); 

    // ESTADOS DOS FILTROS
    const [selectedType, setSelectedType] = useState('Todos');
    const [selectedGenre, setSelectedGenre] = useState('Todos');
    const [selectedStatus, setSelectedStatus] = useState('Todos');
    const [sortBy, setSortBy] = useState('Recentes');

    // PAGINAÇÃO - 10 OBRAS POR PÁGINA
    const [currentPage, setCurrentPage] = useState(1);
    const itemsPerPage = 10; 

    // OPÇÕES DE FILTRO
    const typeOptions = ['Todos', 'Mangá', 'Manhwa', 'Manhua', 'Shoujo'];
    const genreOptions = ['Todos', 'Ação', 'Artes Marciais', 'Aventura', 'Comédia', 'Drama', 'Esportes', 'Fantasia', 'Ficção Científica', 'Isekai', 'Magia', 'Mistério', 'Romance', 'Seinen', 'Shoujo', 'Shounen', 'Slice of Life', 'Terror'];
    const statusOptions = ['Todos', 'Em Lançamento', 'Completo', 'Hiato'];
    const sortOptions = ['Recentes', 'Melhor Avaliação', 'A - Z', 'Z - A'];

    // RESETAR PÁGINA AO FILTRAR
    useEffect(() => {
        setCurrentPage(1);
    }, [searchTerm, selectedType, selectedGenre, selectedStatus, sortBy]);

    // LÓGICA DE FILTRAGEM BLINDADA (100% FUNCIONAL)
    const filteredMangas = useMemo(() => {
        let result = [...(mangas || [])];
        
        // Função segura para comparar textos ignorando acentos e maiúsculas
        const safeLower = (str) => str ? str.normalize("NFD").replace(/[\u0300-\u036f]/g, "").toLowerCase().trim() : '';

        // 1. Busca por Texto (Título ou Autor)
        if (searchTerm.trim() !== '') {
            const query = safeLower(searchTerm);
            result = result.filter(m => safeLower(m.title).includes(query) || safeLower(m.author).includes(query));
        }

        // 2. Filtro por Tipo (Origem)
        if (selectedType !== 'Todos') {
            const typeQuery = safeLower(selectedType);
            result = result.filter(m => safeLower(m.type) === typeQuery);
        }

        // 3. Filtro por Gênero
        if (selectedGenre !== 'Todos') {
            const genreQuery = safeLower(selectedGenre);
            result = result.filter(m => {
                // Checa se o banco de dados salvou como Array ou String
                if (Array.isArray(m.genres)) {
                    return m.genres.some(g => safeLower(g) === genreQuery);
                } else if (typeof m.genres === 'string') {
                    return safeLower(m.genres).includes(genreQuery);
                }
                return false;
            });
        }

        // 4. Filtro por Status
        if (selectedStatus !== 'Todos') {
            const statusQuery = safeLower(selectedStatus);
            result = result.filter(m => safeLower(m.status) === statusQuery);
        }

        // 5. Ordenação
        result.sort((a, b) => {
            if (sortBy === 'Recentes') return (b.createdAt || 0) - (a.createdAt || 0);
            if (sortBy === 'Melhor Avaliação') return (Number(b.rating) || 0) - (Number(a.rating) || 0);
            if (sortBy === 'A - Z') return (a.title || '').localeCompare(b.title || '');
            if (sortBy === 'Z - A') return (b.title || '').localeCompare(a.title || '');
            return 0;
        });

        return result;
    }, [mangas, searchTerm, selectedType, selectedGenre, selectedStatus, sortBy]);

    // LÓGICA DE PAGINAÇÃO
    const totalPages = Math.ceil(filteredMangas.length / itemsPerPage);
    const indexOfLastItem = currentPage * itemsPerPage;
    const indexOfFirstItem = indexOfLastItem - itemsPerPage;
    const currentItems = filteredMangas.slice(indexOfFirstItem, indexOfLastItem);

    const handlePageChange = (pageNumber) => {
        setCurrentPage(pageNumber);
        window.scrollTo({ top: 0, behavior: 'smooth' });
    };

    // CORES ELEGANTES PARA ORIGEM DA OBRA
    const getTypeColor = (type) => {
        const t = (type || 'MANGÁ').toUpperCase();
        if (t.includes('MANHWA')) return 'text-blue-400';
        if (t.includes('MANHUA')) return 'text-green-400';
        if (t.includes('SHOUJO')) return 'text-yellow-400';
        return 'text-red-500'; // Padrão Mangá
    };

    return (
        <div className="pb-32 min-h-screen relative font-sans text-white bg-black overflow-x-hidden selection:bg-blue-500/30">
            
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-6 relative z-10">
                
                {/* BARRA DE PESQUISA (CLEAN & PREMIUM) */}
                <div className="relative mb-6">
                    <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-500" />
                    <input 
                        type="text" 
                        value={searchTerm} 
                        onChange={(e) => setSearchTerm(e.target.value)} 
                        className="w-full pl-12 pr-4 py-4 rounded-xl bg-[#0A0A0A] border border-white/5 text-white outline-none focus:border-gray-500 transition-colors font-medium text-sm placeholder:text-gray-600" 
                        placeholder="Pesquisar obras, autores..." 
                    />
                </div>

                {/* PAINEL DE FILTROS (ESTRUTURA SÓLIDA E DIRETA) */}
                <div className="bg-[#0A0A0A] border border-white/5 rounded-2xl p-5 mb-8">
                    <div className="flex items-center gap-2 mb-4">
                        <Hash className="w-4 h-4 text-blue-500" />
                        <h3 className="text-xs font-bold text-gray-300 uppercase tracking-widest">Filtros do Catálogo</h3>
                    </div>
                    
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                        {/* TIPO */}
                        <div className="flex flex-col gap-1.5">
                            <label className="text-[10px] font-bold text-gray-500 uppercase tracking-wider pl-1">Origem</label>
                            <select value={selectedType} onChange={e=>setSelectedType(e.target.value)} className="w-full bg-[#111] border border-white/5 text-gray-200 text-xs font-bold rounded-lg px-3 py-3 outline-none cursor-pointer focus:border-gray-500 transition-colors">
                                {typeOptions.map(opt => <option key={opt} value={opt}>{opt}</option>)}
                            </select>
                        </div>
                        {/* GÊNERO */}
                        <div className="flex flex-col gap-1.5">
                            <label className="text-[10px] font-bold text-gray-500 uppercase tracking-wider pl-1">Gênero</label>
                            <select value={selectedGenre} onChange={e=>setSelectedGenre(e.target.value)} className="w-full bg-[#111] border border-white/5 text-gray-200 text-xs font-bold rounded-lg px-3 py-3 outline-none cursor-pointer focus:border-gray-500 transition-colors">
                                {genreOptions.map(opt => <option key={opt} value={opt}>{opt}</option>)}
                            </select>
                        </div>
                        {/* STATUS */}
                        <div className="flex flex-col gap-1.5">
                            <label className="text-[10px] font-bold text-gray-500 uppercase tracking-wider pl-1">Status</label>
                            <select value={selectedStatus} onChange={e=>setSelectedStatus(e.target.value)} className="w-full bg-[#111] border border-white/5 text-gray-200 text-xs font-bold rounded-lg px-3 py-3 outline-none cursor-pointer focus:border-gray-500 transition-colors">
                                {statusOptions.map(opt => <option key={opt} value={opt}>{opt}</option>)}
                            </select>
                        </div>
                        {/* ORDENAR POR */}
                        <div className="flex flex-col gap-1.5">
                            <label className="text-[10px] font-bold text-gray-500 uppercase tracking-wider pl-1">Ordenar</label>
                            <select value={sortBy} onChange={e=>setSortBy(e.target.value)} className="w-full bg-[#111] border border-white/5 text-gray-200 text-xs font-bold rounded-lg px-3 py-3 outline-none cursor-pointer focus:border-gray-500 transition-colors">
                                {sortOptions.map(opt => <option key={opt} value={opt}>{opt}</option>)}
                            </select>
                        </div>
                    </div>
                </div>

                {/* CONTADOR DE RESULTADOS E BOTÕES DE VISTA */}
                <div className="flex items-center justify-between mb-6 pb-2 border-b border-white/5">
                    <div className="text-sm font-medium text-gray-400">
                        <span className="text-white font-bold">{filteredMangas.length}</span> resultados encontrados
                    </div>
                    <div className="flex items-center bg-[#0A0A0A] rounded-lg p-1 border border-white/5">
                        <button onClick={() => setViewMode('grid')} className={`p-1.5 rounded-md transition-colors ${viewMode === 'grid' ? 'bg-[#222] text-white' : 'text-gray-500 hover:text-gray-300'}`}>
                            <LayoutGrid className="w-4 h-4" />
                        </button>
                        <button onClick={() => setViewMode('list')} className={`p-1.5 rounded-md transition-colors ${viewMode === 'list' ? 'bg-[#222] text-white' : 'text-gray-500 hover:text-gray-300'}`}>
                            <List className="w-4 h-4" />
                        </button>
                    </div>
                </div>

                {/* GRID DE OBRAS - DESIGN ULTRA LIMPO E ELEGANTE */}
                <div className={viewMode === 'grid' ? "grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-3 md:gap-5" : "flex flex-col gap-3"}>
                    {currentItems.length > 0 ? currentItems.map(manga => (
                        <div key={manga.id} onClick={() => onNavigate('details', manga)} className={`cursor-pointer group relative bg-[#0A0A0A] rounded-xl overflow-hidden transition-all duration-300 hover:ring-1 hover:ring-gray-600 ${viewMode === 'list' ? 'flex flex-row items-center h-32 pr-4 border border-white/5' : 'flex flex-col aspect-[2/3]'}`}>
                            
                            <div className={`relative bg-[#111] ${viewMode === 'grid' ? 'absolute inset-0 w-full h-full' : 'w-24 h-full flex-shrink-0'}`}>
                                <img src={manga.coverUrl} className="w-full h-full object-cover opacity-90 group-hover:opacity-100 transition-opacity duration-500" loading="lazy" onError={(e) => e.target.src = `https://placehold.co/300x450/111111/444444?text=Obra`} />
                                {viewMode === 'grid' && <div className="absolute inset-0 bg-gradient-to-t from-black via-black/30 to-transparent"></div>}
                            </div>
                            
                            {viewMode === 'grid' && (
                                <>
                                    {/* BADGE ORIGEM: FINO E ELEGANTE (Ajustado) */}
                                    <div className="absolute top-2 left-2 z-10">
                                        <span className={`px-2 py-0.5 rounded-full border border-white/10 bg-black/60 backdrop-blur-md text-[9px] font-black uppercase tracking-widest ${getTypeColor(manga.type)}`}>
                                            {manga.type || 'MANGÁ'}
                                        </span>
                                    </div>
                                    
                                    {/* BADGE AVALIAÇÃO */}
                                    <div className="absolute top-2 right-2 bg-black/60 backdrop-blur-md px-1.5 py-0.5 rounded-full border border-white/10 flex items-center gap-1 z-10">
                                        <Star className="w-2.5 h-2.5 text-yellow-500 fill-yellow-500" />
                                        <span className="text-[10px] font-bold text-white">{manga.rating ? Number(manga.rating).toFixed(1) : "5.0"}</span>
                                    </div>

                                    {/* INFORMAÇÕES NO RODAPÉ */}
                                    <div className="absolute inset-x-0 bottom-0 flex flex-col justify-end p-3 z-10">
                                        <h3 className="font-bold text-sm text-gray-100 line-clamp-2 leading-tight mb-1">
                                            {manga.title}
                                        </h3>
                                        <div className="flex items-center justify-between mt-1">
                                            <span className="text-[10px] font-medium text-gray-400 line-clamp-1">
                                                {manga.genres && manga.genres.length > 0 ? manga.genres[0] : "Sem gênero"}
                                            </span>
                                            <span className="text-[10px] font-bold text-blue-400 whitespace-nowrap">
                                                Cap. {manga.chapters?.length ? manga.chapters[0].number : 0}
                                            </span>
                                        </div>
                                    </div>
                                </>
                            )}

                            {viewMode === 'list' && (
                                <div className="flex-1 flex flex-col justify-center pl-4 min-w-0">
                                    <div className="flex items-center gap-2 mb-1.5">
                                        {/* ORIGEM FININHA NA LISTA */}
                                        <span className={`px-2 py-0.5 rounded-full border border-white/10 bg-black/40 text-[8px] font-black uppercase tracking-widest ${getTypeColor(manga.type)}`}>
                                            {manga.type || 'MANGÁ'}
                                        </span>
                                        <span className="text-[10px] font-medium text-gray-500 flex items-center gap-1">
                                            <Clock className="w-3 h-3"/> {timeAgo(manga.createdAt)}
                                        </span>
                                    </div>
                                    <h3 className="text-sm font-bold text-white mb-1 line-clamp-1">{manga.title}</h3>
                                    
                                    <p className="text-[10px] text-gray-500 mb-2 line-clamp-1 font-medium">{manga.synopsis || "Sem sinopse."}</p>
                                    
                                    <div className="flex items-center gap-3">
                                        <div className="flex items-center gap-1">
                                            <Star className="w-3 h-3 text-yellow-500 fill-yellow-500" />
                                            <span className="text-[10px] font-bold text-gray-300">{manga.rating ? Number(manga.rating).toFixed(1) : "5.0"}</span>
                                        </div>
                                        <span className="text-[10px] font-bold text-blue-400 border-l border-white/10 pl-3">
                                            Cap. {manga.chapters?.length ? manga.chapters[0].number : 0}
                                        </span>
                                    </div>
                                </div>
                            )}
                        </div>
                    )) : (
                        <div className="col-span-full py-24 flex flex-col items-center justify-center bg-[#0A0A0A] rounded-2xl border border-white/5">
                            <Search className="w-10 h-10 text-gray-600 mx-auto mb-3 opacity-50" />
                            <p className="text-gray-500 font-bold text-xs uppercase tracking-widest">Nenhuma obra encontrada.</p>
                        </div>
                    )}
                </div>

                {/* PAGINAÇÃO DE 1 A 10 */}
                {totalPages > 1 && (
                    <div className="mt-12 flex items-center justify-center gap-2">
                        <button disabled={currentPage === 1} onClick={() => handlePageChange(currentPage - 1)} className="p-3 rounded-lg bg-[#0A0A0A] text-gray-400 border border-white/5 disabled:opacity-30 hover:bg-[#222] transition-colors">
                            <ChevronLeft className="w-5 h-5" />
                        </button>
                        
                        <div className="flex items-center gap-1 bg-[#0A0A0A] p-1 rounded-lg border border-white/5">
                            {[...Array(totalPages)].map((_, i) => {
                                if (totalPages > 5 && (i + 1 !== 1 && i + 1 !== totalPages && Math.abs(currentPage - (i + 1)) > 1)) {
                                    if (i + 1 === 2 || i + 1 === totalPages - 1) return <span key={i} className="text-gray-600 px-2 font-black">...</span>;
                                    return null;
                                }
                                return (
                                    <button key={i} onClick={() => handlePageChange(i + 1)} className={`w-10 h-10 rounded-md font-bold text-sm transition-colors ${currentPage === i + 1 ? 'bg-white text-black' : 'bg-transparent text-gray-500 hover:bg-[#222] hover:text-white'}`}>
                                        {i + 1}
                                    </button>
                                );
                            })}
                        </div>
                        
                        <button disabled={currentPage === totalPages} onClick={() => handlePageChange(currentPage + 1)} className="p-3 rounded-lg bg-[#0A0A0A] text-gray-400 border border-white/5 disabled:opacity-30 hover:bg-[#222] transition-colors">
                            <ChevronRight className="w-5 h-5" />
                        </button>
                    </div>
                )}
            </div>
        </div>
    );
}
