import React, { useState, useMemo, useEffect } from 'react';
import { Search, Star, ChevronDown, LayoutGrid, List, Filter, X, ChevronLeft, ChevronRight, Clock, BookOpen, Compass, ShieldCheck } from 'lucide-react';
import { timeAgo } from './helpers';

export function CatalogView({ mangas, onNavigate, dataSaver, catalogState, setCatalogState }) {
    const [searchTerm, setSearchTerm] = useState("");
    const [showFilters, setShowFilters] = useState(false);
    const [viewMode, setViewMode] = useState('grid'); 
    
    // Controles Dropdown Customizado (Neo-Glassmorphism)
    const [openDropdown, setOpenDropdown] = useState(null);

    const [selectedType, setSelectedType] = useState('TODOS');
    const [selectedGenre, setSelectedGenre] = useState('Todos');
    const [selectedStatus, setSelectedStatus] = useState('Todos');
    const [sortBy, setSortBy] = useState('Recentes');

    // Paginação: Máximo 10 obras
    const [currentPage, setCurrentPage] = useState(1);
    const itemsPerPage = 10; 

    const typeOptions = ['TODOS', 'MANGÁ', 'MANHWA', 'MANHUA', 'SHOUJO'];
    const genreOptions = ['Todos', 'Ação', 'Artes Marciais', 'Aventura', 'Comédia', 'Drama', 'Esportes', 'Fantasia', 'Ficção Científica', 'Isekai', 'Magia', 'Mistério', 'Romance', 'Seinen', 'Shoujo', 'Shounen', 'Slice of Life', 'Terror'];
    const statusOptions = ['Todos', 'Em Lançamento', 'Completo', 'Hiato'];
    const sortOptions = ['Recentes', 'Melhor Avaliação', 'A - Z', 'Z - A'];

    useEffect(() => {
        setCurrentPage(1);
    }, [searchTerm, selectedType, selectedGenre, selectedStatus, sortBy]);

    const filteredMangas = useMemo(() => {
        let result = [...(mangas || [])];
        const normalize = str => str ? str.normalize("NFD").replace(/[\u0300-\u036f]/g, "").toLowerCase() : '';

        if (searchTerm.trim() !== '') {
            const term = normalize(searchTerm);
            result = result.filter(m => normalize(m.title).includes(term) || normalize(m.author).includes(term));
        }

        if (selectedType !== 'TODOS') {
            const fType = normalize(selectedType);
            result = result.filter(m => normalize(m.type) === fType);
        }

        if (selectedGenre !== 'Todos') {
            const fGenre = normalize(selectedGenre);
            result = result.filter(m => {
                const mGenres = (m.genres || []).map(g => normalize(g));
                return mGenres.includes(fGenre);
            });
        }

        if (selectedStatus !== 'Todos') {
            const fStatus = normalize(selectedStatus);
            result = result.filter(m => normalize(m.status) === fStatus);
        }

        result.sort((a, b) => {
            if (sortBy === 'Recentes') return (b.createdAt || 0) - (a.createdAt || 0);
            if (sortBy === 'Melhor Avaliação') return (Number(b.rating) || 0) - (Number(a.rating) || 0);
            if (sortBy === 'A - Z') return (a.title || '').localeCompare(b.title || '');
            if (sortBy === 'Z - A') return (b.title || '').localeCompare(a.title || '');
            return 0;
        });

        return result;
    }, [mangas, searchTerm, selectedType, selectedGenre, selectedStatus, sortBy]);

    const totalPages = Math.ceil(filteredMangas.length / itemsPerPage);
    const currentItems = filteredMangas.slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage);

    const handlePageChange = (pageNumber) => {
        setCurrentPage(pageNumber);
        window.scrollTo({ top: 0, behavior: 'smooth' });
    };

    // FUNÇÃO: Cores Temáticas Específicas do Pedido (Vermelho, Verde, Dourado, Azul)
    const getTypeStyle = (type) => {
        const t = (type || 'MANGÁ').toUpperCase();
        if (t === 'MANGÁ' || t === 'MANGA') return 'text-red-500 bg-red-500/10 border-red-500/30';
        if (t === 'MANHWA') return 'text-blue-500 bg-blue-500/10 border-blue-500/30';
        if (t === 'MANHUA') return 'text-green-500 bg-green-500/10 border-green-500/30';
        if (t === 'SHOUJO') return 'text-pink-500 bg-pink-500/10 border-pink-500/30';
        return 'text-yellow-500 bg-yellow-500/10 border-yellow-500/30';
    };

    return (
        <div className="pb-32 min-h-screen relative font-sans text-white bg-[#0B0F19] overflow-x-hidden selection:bg-blue-500/30">
            
            {/* LUZES SURREAIS E PROFUNDAS NO BACKGROUND */}
            <div className="fixed inset-0 pointer-events-none z-0 overflow-hidden">
                <div className="absolute top-[-10%] right-[-10%] w-[500px] h-[500px] bg-[#6A5AFF]/15 blur-[120px] rounded-full animate-pulse"></div>
                <div className="absolute bottom-[-10%] left-[-10%] w-[400px] h-[400px] bg-[#FF4F00]/10 blur-[100px] rounded-full animate-pulse"></div>
                {/* Padrão Texturizado para Aparência Premium */}
                <div className="absolute inset-0 opacity-[0.03] mix-blend-overlay" style={{ backgroundImage: `url("data:image/svg+xml,%3Csvg width='40' height='40' xmlns='http://www.w3.org/2000/svg'%3E%3Ccircle cx='20' cy='20' r='1' fill='%23FFFFFF'/%3E%3C/svg%3E")` }}></div>
            </div>

            {/* OVERLAY PARA DROPDOWNS CUSTOMIZADOS */}
            {openDropdown && <div className="fixed inset-0 z-40" onClick={() => setOpenDropdown(null)}></div>}

            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10 pt-6">
                
                {/* BARRA DE PESQUISA & BOTÃO DE FILTRO */}
                <div className="flex items-center gap-3 mb-6 relative z-40">
                    <div className="relative flex-1 group">
                        <div className="absolute -inset-0.5 bg-gradient-to-r from-[#6A5AFF] to-[#FF4F00] rounded-2xl blur opacity-0 group-focus-within:opacity-30 transition duration-500"></div>
                        <div className="relative flex items-center bg-[#1E1E2C] border border-white/5 rounded-2xl overflow-hidden shadow-lg">
                            <Search className="absolute left-4 h-5 w-5 text-gray-500 group-focus-within:text-[#6A5AFF] transition-colors" />
                            <input 
                                type="text" 
                                value={searchTerm} 
                                onChange={(e) => setSearchTerm(e.target.value)} 
                                className="w-full pl-12 pr-4 py-4 bg-transparent text-white outline-none font-medium text-sm placeholder:text-gray-500" 
                                placeholder="Procurar acervo..." 
                            />
                        </div>
                    </div>
                    
                    <button 
                        onClick={() => { setShowFilters(!showFilters); setOpenDropdown(null); }} 
                        className={`p-4 rounded-2xl border transition-all duration-300 flex items-center justify-center
                        ${showFilters ? 'bg-[#6A5AFF] border-[#6A5AFF] text-white shadow-[0_0_20px_rgba(106,90,255,0.4)]' : 'bg-[#1E1E2C] border-white/5 text-gray-400 hover:text-white hover:border-white/20'}`}
                    >
                        {showFilters ? <X className="w-5 h-5"/> : <Filter className="w-5 h-5" />} 
                    </button>
                </div>

                {/* PAINEL DE FILTROS FLUTUANTE PREMIUM */}
                {showFilters && (
                    <div className="relative z-50 mb-8 animate-in slide-in-from-top-4 fade-in duration-300">
                        <div className="bg-[#1E1E2C]/90 backdrop-blur-xl border border-[#6A5AFF]/20 rounded-3xl p-6 shadow-[0_20px_40px_rgba(0,0,0,0.5)]">
                            <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
                                
                                {/* GÊNERO */}
                                <div className="flex flex-col gap-2 relative z-30">
                                    <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest pl-1 flex items-center gap-1.5"><BookOpen className="w-3 h-3 text-[#FF4F00]"/> Gênero</label>
                                    <div 
                                        onClick={() => setOpenDropdown(openDropdown === 'genre' ? null : 'genre')}
                                        className="w-full bg-[#0B0F19] border border-white/5 text-white text-sm font-bold rounded-xl px-4 py-3.5 flex items-center justify-between cursor-pointer hover:border-[#6A5AFF]/50 transition-colors"
                                    >
                                        <span className="truncate">{selectedGenre}</span>
                                        <ChevronDown className={`w-4 h-4 text-gray-500 transition-transform ${openDropdown === 'genre' ? 'rotate-180 text-[#6A5AFF]' : ''}`} />
                                    </div>
                                    {openDropdown === 'genre' && (
                                        <div className="absolute top-[105%] left-0 right-0 bg-[#0B0F19] border border-white/10 rounded-xl overflow-hidden shadow-2xl z-50 max-h-56 overflow-y-auto no-scrollbar animate-in fade-in">
                                            {genreOptions.map(opt => (
                                                <div 
                                                    key={opt}
                                                    onClick={() => { setSelectedGenre(opt); setOpenDropdown(null); }}
                                                    className={`px-5 py-3 text-sm font-bold flex items-center justify-between cursor-pointer transition-colors border-b border-white/5 last:border-0
                                                    ${selectedGenre === opt ? 'bg-[#6A5AFF]/20 text-[#6A5AFF]' : 'text-gray-300 hover:bg-white/5 hover:text-white'}`}
                                                >
                                                    {opt}
                                                </div>
                                            ))}
                                        </div>
                                    )}
                                </div>

                                {/* STATUS */}
                                <div className="flex flex-col gap-2 relative z-20">
                                    <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest pl-1 flex items-center gap-1.5"><ShieldCheck className="w-3 h-3 text-green-500"/> Status</label>
                                    <div 
                                        onClick={() => setOpenDropdown(openDropdown === 'status' ? null : 'status')}
                                        className="w-full bg-[#0B0F19] border border-white/5 text-white text-sm font-bold rounded-xl px-4 py-3.5 flex items-center justify-between cursor-pointer hover:border-[#6A5AFF]/50 transition-colors"
                                    >
                                        <span className="truncate">{selectedStatus}</span>
                                        <ChevronDown className={`w-4 h-4 text-gray-500 transition-transform ${openDropdown === 'status' ? 'rotate-180 text-[#6A5AFF]' : ''}`} />
                                    </div>
                                    {openDropdown === 'status' && (
                                        <div className="absolute top-[105%] left-0 right-0 bg-[#0B0F19] border border-white/10 rounded-xl overflow-hidden shadow-2xl z-50 animate-in fade-in">
                                            {statusOptions.map(opt => (
                                                <div 
                                                    key={opt}
                                                    onClick={() => { setSelectedStatus(opt); setOpenDropdown(null); }}
                                                    className={`px-5 py-3 text-sm font-bold flex items-center justify-between cursor-pointer transition-colors border-b border-white/5 last:border-0
                                                    ${selectedStatus === opt ? 'bg-[#6A5AFF]/20 text-[#6A5AFF]' : 'text-gray-300 hover:bg-white/5 hover:text-white'}`}
                                                >
                                                    {opt}
                                                </div>
                                            ))}
                                        </div>
                                    )}
                                </div>

                                {/* ORDENAÇÃO */}
                                <div className="flex flex-col gap-2 relative z-10">
                                    <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest pl-1 flex items-center gap-1.5"><Clock className="w-3 h-3 text-yellow-500"/> Ordenação</label>
                                    <div 
                                        onClick={() => setOpenDropdown(openDropdown === 'sort' ? null : 'sort')}
                                        className="w-full bg-[#0B0F19] border border-white/5 text-white text-sm font-bold rounded-xl px-4 py-3.5 flex items-center justify-between cursor-pointer hover:border-[#6A5AFF]/50 transition-colors"
                                    >
                                        <span className="truncate">{sortBy}</span>
                                        <ChevronDown className={`w-4 h-4 text-gray-500 transition-transform ${openDropdown === 'sort' ? 'rotate-180 text-[#6A5AFF]' : ''}`} />
                                    </div>
                                    {openDropdown === 'sort' && (
                                        <div className="absolute top-[105%] left-0 right-0 bg-[#0B0F19] border border-white/10 rounded-xl overflow-hidden shadow-2xl z-50 animate-in fade-in">
                                            {sortOptions.map(opt => (
                                                <div 
                                                    key={opt}
                                                    onClick={() => { setSortBy(opt); setOpenDropdown(null); }}
                                                    className={`px-5 py-3 text-sm font-bold flex items-center justify-between cursor-pointer transition-colors border-b border-white/5 last:border-0
                                                    ${sortBy === opt ? 'bg-[#6A5AFF]/20 text-[#6A5AFF]' : 'text-gray-300 hover:bg-white/5 hover:text-white'}`}
                                                >
                                                    {opt}
                                                </div>
                                            ))}
                                        </div>
                                    )}
                                </div>

                            </div>
                        </div>
                    </div>
                )}

                {/* ABAS (TABS) DE FILTRO RÁPIDO */}
                <div className="flex items-center gap-3 overflow-x-auto no-scrollbar mb-6 snap-x pb-2 w-full">
                    {typeOptions.map(opt => (
                        <button 
                            key={opt} 
                            onClick={() => setSelectedType(opt)} 
                            className={`flex-none px-6 py-3 rounded-full text-[10px] md:text-xs font-black uppercase tracking-widest whitespace-nowrap transition-all duration-300 snap-start
                            ${selectedType === opt 
                                ? 'bg-[#6A5AFF] text-white shadow-[0_0_15px_rgba(106,90,255,0.4)]' 
                                : 'bg-[#1E1E2C] border border-white/5 text-gray-400 hover:text-white hover:bg-white/10'}`}
                        >
                            {opt}
                        </button>
                    ))}
                </div>

                {/* CONTADOR E CONTROLES DE VISUALIZAÇÃO */}
                <div className="flex flex-wrap items-center justify-between gap-4 mb-6 border-b border-white/5 pb-4">
                    <div className="flex items-center gap-2 text-sm text-gray-400 font-medium">
                        <Compass className="w-4 h-4 text-[#6A5AFF]" />
                        <span className="text-white font-bold">{filteredMangas.length}</span> resultados
                    </div>
                    <div className="flex items-center bg-[#1E1E2C] rounded-lg p-1 border border-white/5">
                        <button onClick={() => setViewMode('grid')} className={`p-2 rounded-md transition-all ${viewMode === 'grid' ? 'bg-[#6A5AFF] text-white shadow-sm' : 'text-gray-500 hover:text-white'}`}>
                            <LayoutGrid className="w-4 h-4" />
                        </button>
                        <button onClick={() => setViewMode('list')} className={`p-2 rounded-md transition-all ${viewMode === 'list' ? 'bg-[#6A5AFF] text-white shadow-sm' : 'text-gray-500 hover:text-white'}`}>
                            <List className="w-4 h-4" />
                        </button>
                    </div>
                </div>

                {/* GRID DE OBRAS - VISUAL PREMIUM (VERMELHO, VERDE E AZUL) */}
                <div className={viewMode === 'grid' ? "grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4 relative z-0" : "flex flex-col gap-4 relative z-0"}>
                    {currentItems.length > 0 ? currentItems.map(manga => (
                        <div key={manga.id} onClick={() => onNavigate('details', manga)} className={`cursor-pointer group relative bg-[#1E1E2C] border border-white/5 hover:border-[#6A5AFF]/40 rounded-2xl overflow-hidden transition-all duration-300 transform-gpu hover:-translate-y-1 hover:shadow-[0_15px_30px_rgba(0,0,0,0.4)] ${viewMode === 'list' ? 'flex flex-row items-center h-36 pr-4' : 'flex flex-col aspect-[2/3]'}`}>
                            
                            <div className={`relative bg-[#0B0F19] ${viewMode === 'grid' ? 'absolute inset-0 w-full h-full' : 'w-24 md:w-28 h-full flex-shrink-0'}`}>
                                <img src={manga.coverUrl} className={`w-full h-full object-cover transition-transform duration-700 ease-out group-hover:scale-105 ${dataSaver ? 'blur-[1px]' : ''}`} loading="lazy" onError={(e) => e.target.src = `https://placehold.co/300x450/0b0f19/6a5aff?text=Sem+Capa`} />
                                {viewMode === 'grid' && <div className="absolute inset-0 bg-gradient-to-t from-[#0B0F19] via-[#0B0F19]/40 to-transparent opacity-90"></div>}
                            </div>
                            
                            {viewMode === 'grid' && (
                                <>
                                    {/* BADGE: ORIGEM (Sem fundo feio, cores dinâmicas e contorno refinado) */}
                                    <div className={`absolute top-3 left-3 z-10 px-2.5 py-1 rounded-md border backdrop-blur-md shadow-lg ${getTypeStyle(manga.type)}`}>
                                        <span className="text-[8px] font-black uppercase tracking-widest">{manga.type || 'MANGÁ'}</span>
                                    </div>
                                    
                                    {/* BADGE: AVALIAÇÃO (Amarelo Ouro) */}
                                    <div className="absolute top-3 right-3 bg-black/80 backdrop-blur-md px-2 py-1 rounded-md border border-white/5 flex items-center gap-1 z-10 shadow-lg">
                                        <Star className="w-3 h-3 text-[#FFD700] fill-[#FFD700] drop-shadow-[0_0_5px_rgba(255,215,0,0.8)]" />
                                        <span className="text-[10px] font-black text-white">{manga.rating ? Number(manga.rating).toFixed(1) : "5.0"}</span>
                                    </div>

                                    {/* INFORMAÇÕES: GÊNEROS (NO LUGAR DA SINOPSE NO GRID) */}
                                    <div className="absolute inset-x-0 bottom-0 flex flex-col justify-end p-4 z-10">
                                        <h3 className="font-extrabold text-sm text-white line-clamp-2 mb-1.5 leading-tight group-hover:text-[#6A5AFF] transition-colors drop-shadow-md">
                                            {manga.title}
                                        </h3>
                                        <p className="text-[10px] text-gray-400 font-bold uppercase tracking-wider line-clamp-1 mb-2">
                                            {manga.genres && manga.genres.length > 0 ? manga.genres.slice(0, 2).join(' • ') : "Gênero Desconhecido"}
                                        </p>
                                        <div className="inline-flex items-center gap-1 bg-[#22C55E]/10 border border-[#22C55E]/30 text-[#22C55E] px-2 py-1 rounded w-max">
                                            <ShieldCheck className="w-3 h-3" />
                                            <span className="text-[10px] font-black uppercase tracking-wider">Cap. {manga.chapters?.length ? manga.chapters[0].number : 0}</span>
                                        </div>
                                    </div>
                                </>
                            )}

                            {viewMode === 'list' && (
                                <div className="flex-1 flex flex-col justify-center pl-5 min-w-0">
                                    <div className="flex items-center gap-3 mb-1.5">
                                        {/* ORIGEM NA LISTA */}
                                        <span className={`px-2 py-0.5 rounded border text-[8px] font-black uppercase tracking-widest ${getTypeStyle(manga.type)}`}>
                                            {manga.type || 'MANGÁ'}
                                        </span>
                                        <span className="text-[10px] font-bold text-gray-500 flex items-center gap-1 border-l border-white/5 pl-3">
                                            <Clock className="w-3 h-3"/> {timeAgo(manga.createdAt)}
                                        </span>
                                    </div>
                                    
                                    <h3 className="text-sm md:text-base font-extrabold text-white mb-1.5 line-clamp-1 group-hover:text-[#6A5AFF] transition-colors">{manga.title}</h3>
                                    
                                    {/* NA LISTA, MOSTRA-SE A SINOPSE */}
                                    <p className="text-xs text-gray-400 mb-3 line-clamp-2 leading-relaxed font-medium">{manga.synopsis || "Os registros desta obra ainda não foram codificados no sistema."}</p>
                                    
                                    <div className="flex items-center gap-4">
                                        <div className="bg-[#0B0F19] px-2 py-1 rounded border border-white/5 flex items-center gap-1.5 shadow-sm">
                                            <Star className="w-3 h-3 text-[#FFD700] fill-[#FFD700]" />
                                            <span className="text-[10px] font-black text-white">{manga.rating ? Number(manga.rating).toFixed(1) : "5.0"}</span>
                                        </div>
                                        <span className="text-[10px] font-black text-[#22C55E] flex items-center gap-1 uppercase tracking-wider">
                                            <ShieldCheck className="w-3 h-3" /> Cap. {manga.chapters?.length ? manga.chapters[0].number : 0}
                                        </span>
                                    </div>
                                </div>
                            )}
                        </div>
                    )) : (
                        <div className="col-span-full py-24 flex flex-col items-center justify-center bg-[#1E1E2C]/50 rounded-3xl border border-white/5 border-dashed">
                            <Moon className="w-12 h-12 text-gray-600 mx-auto mb-4" />
                            <p className="text-gray-400 font-bold text-xs uppercase tracking-widest">O abismo não possui registros.</p>
                        </div>
                    )}
                </div>

                {/* PAGINAÇÃO PADRÃO (1 A 10) */}
                {totalPages > 1 && (
                    <div className="mt-12 flex items-center justify-center gap-2">
                        <button disabled={currentPage === 1} onClick={() => handlePageChange(currentPage - 1)} className="p-3.5 rounded-xl bg-[#1E1E2C] text-gray-400 border border-white/5 disabled:opacity-30 hover:bg-[#6A5AFF] hover:text-white hover:border-[#6A5AFF] transition-all active:scale-95 shadow-sm">
                            <ChevronLeft className="w-5 h-5" />
                        </button>
                        
                        <div className="flex items-center gap-1 bg-[#1E1E2C] p-1.5 rounded-xl border border-white/5 shadow-sm">
                            {[...Array(totalPages)].map((_, i) => {
                                if (totalPages > 5 && (i + 1 !== 1 && i + 1 !== totalPages && Math.abs(currentPage - (i + 1)) > 1)) {
                                    if (i + 1 === 2 || i + 1 === totalPages - 1) return <span key={i} className="text-gray-600 px-2 font-black">...</span>;
                                    return null;
                                }
                                return (
                                    <button key={i} onClick={() => handlePageChange(i + 1)} className={`w-11 h-11 rounded-lg font-black text-sm transition-all duration-200 ${currentPage === i + 1 ? 'bg-[#6A5AFF] text-white shadow-[0_0_15px_rgba(106,90,255,0.4)]' : 'bg-transparent text-gray-500 hover:bg-white/10 hover:text-white'}`}>
                                        {i + 1}
                                    </button>
                                );
                            })}
                        </div>
                        
                        <button disabled={currentPage === totalPages} onClick={() => handlePageChange(currentPage + 1)} className="p-3.5 rounded-xl bg-[#1E1E2C] text-gray-400 border border-white/5 disabled:opacity-30 hover:bg-[#6A5AFF] hover:text-white hover:border-[#6A5AFF] transition-all active:scale-95 shadow-sm">
                            <ChevronRight className="w-5 h-5" />
                        </button>
                    </div>
                )}
            </div>
        </div>
    );
}
