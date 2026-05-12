import React, { useState, useMemo, useEffect } from 'react';
import { Search, Star, Clock, ChevronRight, ChevronLeft, Moon, Filter, X, BookOpen, Flame, Tag, Play } from 'lucide-react';
import { timeAgo } from './helpers';

export function HomeView({ mangas = [], onNavigate }) {
    const [searchQuery, setSearchQuery] = useState('');
    const [currentPage, setCurrentPage] = useState(1);
    const [carouselIndex, setCarouselIndex] = useState(0);
    const itemsPerPage = 20;

    // Estados dos Filtros
    const [isMobileFilterOpen, setIsMobileFilterOpen] = useState(false);
    const [selectedType, setSelectedType] = useState('Todos');
    const [selectedGenre, setSelectedGenre] = useState('Todos');
    const [sortBy, setSortBy] = useState('Recentes');

    const types = ['Todos', 'Manhwa', 'Mangá', 'Manhua', 'Shoujo', 'Seinen'];
    const genresList = ['Todos', 'Ação', 'Artes Marciais', 'Aventura', 'Comédia', 'Drama', 'Fantasia', 'Isekai', 'Romance', 'Seinen', 'Shoujo', 'Shounen'];
    const sortOptions = ['Recentes', 'Melhor Avaliação', 'A-Z'];

    // Obras em Destaque para o Carrossel (Top 5 Avaliadas)
    const featuredMangas = useMemo(() => {
        return [...mangas].sort((a, b) => (Number(b.rating) || 0) - (Number(a.rating) || 0)).slice(0, 5);
    }, [mangas]);

    // Auto-play do Carrossel suave
    useEffect(() => {
        if (featuredMangas.length === 0) return;
        const interval = setInterval(() => {
            setCarouselIndex((prev) => (prev + 1) % featuredMangas.length);
        }, 6000); // Mais tempo para apreciar a transição surreal
        return () => clearInterval(interval);
    }, [featuredMangas.length]);

    // Lógica de Filtro Principal
    const filteredMangas = useMemo(() => {
        let result = [...mangas];

        if (searchQuery.trim() !== '') {
            const lowerQ = searchQuery.toLowerCase();
            result = result.filter(m => 
                m.title.toLowerCase().includes(lowerQ) || 
                (m.author && m.author.toLowerCase().includes(lowerQ)) ||
                (m.genres && m.genres.some(g => typeof g === 'string' && g.toLowerCase().includes(lowerQ)))
            );
        }

        const normalize = (str) => str.normalize("NFD").replace(/[\u0300-\u036f]/g, "").toLowerCase();

        if (selectedType !== 'Todos') {
            const fType = normalize(selectedType);
            result = result.filter(m => {
                if (!m.type && !m.genres) return false;
                const typeMatch = m.type && normalize(m.type) === fType;
                const genreMatch = m.genres && m.genres.map(g => normalize(g)).includes(fType);
                if (fType === 'manga' && normalize(m.type || '') === 'manga') return true;
                return typeMatch || genreMatch;
            });
        }

        if (selectedGenre !== 'Todos') {
            const fGenre = normalize(selectedGenre);
            result = result.filter(m => m.genres && m.genres.map(g => normalize(g)).includes(fGenre));
        }

        if (sortBy === 'Recentes') {
            result.sort((a, b) => b.createdAt - a.createdAt);
        } else if (sortBy === 'Melhor Avaliação') {
            result.sort((a, b) => (Number(b.rating) || 0) - (Number(a.rating) || 0));
        } else if (sortBy === 'A-Z') {
            result.sort((a, b) => a.title.localeCompare(b.title));
        }

        return result;
    }, [mangas, searchQuery, selectedType, selectedGenre, sortBy]);

    // Paginação
    const totalPages = Math.ceil(filteredMangas.length / itemsPerPage);
    const indexOfLastItem = currentPage * itemsPerPage;
    const indexOfFirstItem = indexOfLastItem - itemsPerPage;
    const currentItems = filteredMangas.slice(indexOfFirstItem, indexOfLastItem);

    const getOriginTag = (manga) => {
        if (manga.type) return manga.type;
        if (manga.genres) {
            const lowerGenres = manga.genres.map(g => g.toLowerCase());
            if (lowerGenres.includes('manhwa')) return 'Manhwa';
            if (lowerGenres.includes('manhua')) return 'Manhua';
            if (lowerGenres.includes('shoujo')) return 'Shoujo';
            if (lowerGenres.includes('seinen')) return 'Seinen';
        }
        return 'Mangá';
    };

    // Cores das tags mais suaves, tons pastéis e neons contidos
    const getTagColor = (type) => {
        const lower = type.toLowerCase();
        if (lower === 'manhwa') return 'bg-[#A855F7]/10 text-[#D8B4FE] border-[#A855F7]/30 shadow-[0_0_15px_rgba(168,85,247,0.2)]'; 
        if (lower === 'manhua') return 'bg-[#EC4899]/10 text-[#F9A8D4] border-[#EC4899]/30 shadow-[0_0_15px_rgba(236,72,153,0.2)]'; 
        if (lower === 'shoujo') return 'bg-[#F43F5E]/10 text-[#FDA4AF] border-[#F43F5E]/30 shadow-[0_0_15px_rgba(244,63,94,0.2)]'; 
        return 'bg-white/5 text-[#F1F5F9] border-white/10 shadow-[0_0_15px_rgba(255,255,255,0.05)]'; 
    };

    const FilterPanel = () => (
        <div className="flex flex-col gap-8">
            <div>
                <h3 className="text-[#F1F5F9] text-[10px] font-black uppercase tracking-[0.2em] mb-4 flex items-center gap-2 opacity-70">
                    <Clock className="w-3.5 h-3.5 text-[#A855F7]" /> Ordenar Por
                </h3>
                <div className="flex flex-col gap-2">
                    {sortOptions.map(opt => (
                        <button 
                            key={opt} 
                            onClick={() => { setSortBy(opt); setCurrentPage(1); }} 
                            className={`px-4 py-3 rounded-2xl text-xs font-bold uppercase tracking-widest text-left transition-all duration-500 ease-out border backdrop-blur-md ${sortBy === opt ? 'bg-gradient-to-r from-[#A855F7]/80 to-[#EC4899]/80 text-white border-transparent shadow-[0_8px_25px_rgba(168,85,247,0.3)] translate-x-1' : 'bg-white/5 text-slate-400 border-white/5 hover:border-white/20 hover:text-white hover:bg-white/10'}`}
                        >
                            {opt}
                        </button>
                    ))}
                </div>
            </div>

            <div>
                <h3 className="text-[#F1F5F9] text-[10px] font-black uppercase tracking-[0.2em] mb-4 flex items-center gap-2 opacity-70">
                    <BookOpen className="w-3.5 h-3.5 text-[#3B82F6]" /> Formato
                </h3>
                <div className="flex flex-wrap gap-2">
                    {types.map(opt => (
                        <button 
                            key={opt} 
                            onClick={() => { setSelectedType(opt); setCurrentPage(1); }} 
                            className={`px-3.5 py-2.5 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all duration-500 ease-out border backdrop-blur-md ${selectedType === opt ? 'bg-[#3B82F6]/80 text-white border-[#3B82F6]/50 shadow-[0_8px_20px_rgba(59,130,246,0.3)]' : 'bg-white/5 text-slate-400 border-white/5 hover:border-white/20 hover:text-white'}`}
                        >
                            {opt}
                        </button>
                    ))}
                </div>
            </div>

            <div>
                <h3 className="text-[#F1F5F9] text-[10px] font-black uppercase tracking-[0.2em] mb-4 flex items-center gap-2 opacity-70">
                    <Flame className="w-3.5 h-3.5 text-[#EC4899]" /> Gêneros
                </h3>
                <div className="flex flex-wrap gap-2">
                    {genresList.map(opt => (
                        <button 
                            key={opt} 
                            onClick={() => { setSelectedGenre(opt); setCurrentPage(1); }} 
                            className={`px-3.5 py-2.5 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all duration-500 ease-out border backdrop-blur-md ${selectedGenre === opt ? 'bg-[#EC4899]/80 text-white border-[#EC4899]/50 shadow-[0_8px_20px_rgba(236,72,153,0.3)]' : 'bg-white/5 text-slate-400 border-white/5 hover:border-white/20 hover:text-white'}`}
                        >
                            {opt}
                        </button>
                    ))}
                </div>
            </div>
        </div>
    );

    return (
        // Fundo principal mais profundo, puxado para o índigo muito escuro
        <div className="bg-[#030108] min-h-screen font-sans text-slate-100 pb-24 selection:bg-[#A855F7]/40 flex flex-col relative overflow-hidden">
            
            {/* Efeitos de Fundo Surreal (Orbs de Luz Flutuantes) */}
            <div className="fixed top-[-10%] left-[-10%] w-[60vw] h-[60vw] bg-[#A855F7] rounded-full mix-blend-screen filter blur-[200px] opacity-[0.12] pointer-events-none animate-[pulse_8s_ease-in-out_infinite]"></div>
            <div className="fixed bottom-[-10%] right-[-10%] w-[60vw] h-[60vw] bg-[#EC4899] rounded-full mix-blend-screen filter blur-[200px] opacity-[0.10] pointer-events-none animate-[pulse_10s_ease-in-out_infinite_alternate]"></div>
            <div className="fixed top-[40%] left-[30%] w-[40vw] h-[40vw] bg-[#3B82F6] rounded-full mix-blend-screen filter blur-[250px] opacity-[0.08] pointer-events-none animate-[pulse_12s_ease-in-out_infinite_alternate-reverse]"></div>

            {/* HEADER ULTRA-GLASS */}
            <header className="sticky top-0 z-50 bg-[#030108]/40 backdrop-blur-2xl border-b border-white/[0.03] shadow-[0_10px_30px_rgba(0,0,0,0.5)] transition-all duration-500">
                <div className="max-w-7xl mx-auto px-4 py-4 flex flex-col md:flex-row items-center justify-between gap-4">
                    <div className="flex items-center justify-between w-full md:w-auto">
                        <h1 className="text-xl md:text-2xl font-black uppercase tracking-[0.2em] text-white drop-shadow-[0_0_15px_rgba(255,255,255,0.2)]">
                            Manga <span className="text-transparent bg-clip-text bg-gradient-to-r from-[#A855F7] via-[#EC4899] to-[#F43F5E]">Infinity</span>
                        </h1>
                        <button 
                            className="md:hidden p-2.5 bg-white/5 border border-white/10 rounded-2xl text-white active:scale-90 transition-all duration-300"
                            onClick={() => setIsMobileFilterOpen(true)}
                        >
                            <Filter className="w-5 h-5" />
                        </button>
                    </div>

                    <div className="relative w-full md:w-[28rem] group">
                        <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500 group-focus-within:text-[#EC4899] transition-colors duration-500" />
                        <input 
                            type="text" 
                            placeholder="Pesquisar no éter..." 
                            value={searchQuery}
                            onChange={(e) => { setSearchQuery(e.target.value); setCurrentPage(1); }}
                            className="w-full bg-white/[0.03] backdrop-blur-xl border border-white/10 rounded-2xl py-3.5 pl-12 pr-4 text-sm text-white outline-none focus:border-[#A855F7]/50 focus:bg-white/[0.06] transition-all duration-500 focus:shadow-[0_0_30px_rgba(168,85,247,0.15)] placeholder:text-slate-600"
                        />
                    </div>
                </div>
            </header>

            <main className="flex-1 max-w-7xl mx-auto w-full px-4 pt-10 flex flex-col gap-12 relative z-10">
                
                {/* CARROSSEL SURREAL - TRANSITIONS DE SONHO */}
                {featuredMangas.length > 0 && searchQuery === '' && currentPage === 1 && (
                    <section className="relative w-full h-[450px] md:h-[500px] rounded-[2.5rem] overflow-hidden group shadow-[0_30px_60px_rgba(0,0,0,0.6)] border border-white/[0.05]">
                        {/* Background animado do carrossel */}
                        {featuredMangas.map((manga, idx) => (
                            <div 
                                key={`bg-${manga.id}`} 
                                className={`absolute inset-0 transition-all duration-1500 ease-in-out ${idx === carouselIndex ? 'opacity-100 scale-100' : 'opacity-0 scale-110 pointer-events-none'}`}
                            >
                                <img src={manga.coverUrl} className="w-full h-full object-cover scale-110 blur-2xl opacity-30 mix-blend-lighten saturate-150" alt="bg" />
                                <div className="absolute inset-0 bg-gradient-to-t from-[#030108] via-[#030108]/60 to-transparent"></div>
                                <div className="absolute inset-0 bg-gradient-to-r from-[#030108] via-[#030108]/40 to-transparent"></div>
                            </div>
                        ))}

                        {/* Conteúdo do Carrossel */}
                        <div className="absolute inset-0 flex items-center p-6 md:p-16">
                            {featuredMangas.map((manga, idx) => (
                                <div 
                                    key={manga.id}
                                    className={`absolute flex flex-col md:flex-row items-center gap-10 md:gap-16 w-full max-w-5xl transition-all duration-1000 ease-[cubic-bezier(0.2,0.8,0.2,1)] transform ${idx === carouselIndex ? 'opacity-100 translate-y-0 scale-100 blur-0' : 'opacity-0 translate-y-12 scale-95 blur-md pointer-events-none'}`}
                                >
                                    {/* Capa flutuante surreal */}
                                    <div 
                                        className="relative hidden md:block w-52 lg:w-72 aspect-[1/1.4] rounded-3xl overflow-hidden shadow-[0_20px_60px_rgba(168,85,247,0.3)] border border-white/20 cursor-pointer transform hover:scale-105 hover:-translate-y-2 transition-all duration-700 ease-out animate-[float_6s_ease-in-out_infinite]" 
                                        onClick={() => onNavigate('details', manga)}
                                        style={{ animation: 'float 6s ease-in-out infinite' }}
                                    >
                                        <div className="absolute inset-0 bg-gradient-to-tr from-[#A855F7]/20 to-transparent z-10 pointer-events-none"></div>
                                        <img src={manga.coverUrl} className="w-full h-full object-cover" alt={manga.title} />
                                        <div className="absolute top-3 left-3 bg-black/40 backdrop-blur-xl px-3.5 py-1.5 rounded-xl text-[10px] font-black uppercase tracking-widest text-white border border-white/20 z-20 shadow-lg">
                                            Em Alta
                                        </div>
                                    </div>

                                    {/* Informações suaves e marcantes */}
                                    <div className="flex-1 text-center md:text-left z-10 w-full pr-8">
                                        <div className="flex items-center justify-center md:justify-start gap-4 mb-5">
                                            <span className="bg-white/5 backdrop-blur-xl border border-white/10 px-3.5 py-1.5 rounded-full text-xs font-bold text-white flex items-center gap-1.5 shadow-[0_0_20px_rgba(0,0,0,0.5)]">
                                                <Star className="w-3.5 h-3.5 text-[#FBBF24] fill-[#FBBF24] drop-shadow-[0_0_5px_rgba(251,191,36,0.8)]" /> {manga.rating ? Number(manga.rating).toFixed(1) : "5.0"}
                                            </span>
                                            <span className="text-xs font-black uppercase tracking-[0.2em] text-[#F9A8D4] drop-shadow-[0_0_10px_rgba(236,72,153,0.5)]">{getOriginTag(manga)}</span>
                                        </div>
                                        
                                        <h2 className="text-4xl md:text-5xl lg:text-7xl font-black text-transparent bg-clip-text bg-gradient-to-b from-white to-slate-400 mb-5 drop-shadow-2xl line-clamp-2 leading-[1.1] pb-1">
                                            {manga.title}
                                        </h2>
                                        
                                        <p className="text-slate-300 text-sm md:text-base lg:text-lg line-clamp-3 mb-10 max-w-2xl font-light leading-relaxed opacity-90">
                                            {manga.synopsis || "Atravesse as fronteiras da realidade. Mergulhe em um universo vasto e descubra segredos ocultos nas páginas desta obra-prima."}
                                        </p>
                                        
                                        <button 
                                            onClick={() => onNavigate('details', manga)}
                                            className="group relative px-8 py-4.5 bg-gradient-to-r from-white/10 to-white/5 hover:from-[#A855F7] hover:to-[#EC4899] backdrop-blur-xl border border-white/20 rounded-2xl font-black text-sm uppercase tracking-[0.15em] text-white overflow-hidden transition-all duration-500 ease-out shadow-[0_10px_40px_rgba(0,0,0,0.5)] hover:shadow-[0_0_40px_rgba(168,85,247,0.6)] flex items-center gap-3 mx-auto md:mx-0 hover:-translate-y-1"
                                        >
                                            <span className="relative z-10 flex items-center gap-2">
                                                <Play className="w-4 h-4 fill-white transition-transform duration-300 group-hover:scale-110" /> Iniciar Jornada
                                            </span>
                                        </button>
                                    </div>
                                </div>
                            ))}
                        </div>

                        {/* Controles do Carrossel Minimalistas */}
                        <div className="absolute bottom-8 left-1/2 -translate-x-1/2 flex gap-3 z-20">
                            {featuredMangas.map((_, idx) => (
                                <button 
                                    key={idx}
                                    onClick={() => setCarouselIndex(idx)}
                                    className={`h-1.5 rounded-full transition-all duration-700 ease-[cubic-bezier(0.2,0.8,0.2,1)] ${idx === carouselIndex ? 'w-10 bg-gradient-to-r from-[#A855F7] to-[#EC4899] shadow-[0_0_15px_rgba(236,72,153,0.8)]' : 'w-2 bg-white/20 hover:bg-white/40'}`}
                                />
                            ))}
                        </div>
                    </section>
                )}

                <div className="flex gap-10">
                    {/* SIDEBAR DESKTOP */}
                    <aside className="hidden md:block w-64 flex-shrink-0">
                        <div className="sticky top-32 bg-white/[0.02] backdrop-blur-3xl border border-white/[0.05] rounded-[2rem] p-8 shadow-[0_20px_50px_rgba(0,0,0,0.4)]">
                            <FilterPanel />
                        </div>
                    </aside>

                    {/* ÁREA DE CONTEÚDO */}
                    <section className="flex-1">
                        
                        <div className="flex flex-wrap items-center gap-3 mb-10">
                            <span className="text-[10px] font-black text-slate-500 uppercase tracking-[0.3em] mr-4">
                                Explorar ({filteredMangas.length})
                            </span>
                            
                            {selectedType !== 'Todos' && (
                                <span className="flex items-center gap-2 bg-white/[0.05] backdrop-blur-xl border border-white/10 px-4 py-2 rounded-xl text-[10px] font-black text-white uppercase tracking-widest shadow-lg animate-in fade-in zoom-in duration-500">
                                    <BookOpen className="w-3 h-3 text-[#3B82F6]" /> {selectedType}
                                    <X className="w-3.5 h-3.5 cursor-pointer hover:text-[#EC4899] transition-colors" onClick={() => setSelectedType('Todos')} />
                                </span>
                            )}
                            {selectedGenre !== 'Todos' && (
                                <span className="flex items-center gap-2 bg-white/[0.05] backdrop-blur-xl border border-white/10 px-4 py-2 rounded-xl text-[10px] font-black text-white uppercase tracking-widest shadow-lg animate-in fade-in zoom-in duration-500">
                                    <Tag className="w-3 h-3 text-[#EC4899]" /> {selectedGenre}
                                    <X className="w-3.5 h-3.5 cursor-pointer hover:text-[#A855F7] transition-colors" onClick={() => setSelectedGenre('Todos')} />
                                </span>
                            )}
                        </div>

                        {/* GRADE DE CARDS FLUTUANTES E SUAVES */}
                        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-5 md:gap-7">
                            {currentItems.length > 0 ? currentItems.map(manga => {
                                const origin = getOriginTag(manga);
                                const tagClasses = getTagColor(origin);

                                return (
                                    <div key={manga.id} onClick={() => onNavigate('details', manga)} className="cursor-pointer group flex flex-col relative perspective-1000">
                                        <div className="relative aspect-[1/1.4] rounded-[1.5rem] overflow-hidden bg-[#030108]/50 backdrop-blur-sm border border-white/[0.08] shadow-[0_15px_30px_rgba(0,0,0,0.4)] transform transition-all duration-500 ease-[cubic-bezier(0.2,0.8,0.2,1)] group-hover:-translate-y-4 group-hover:shadow-[0_30px_50px_rgba(168,85,247,0.2)] group-hover:border-white/20 z-10">
                                            
                                            <img src={manga.coverUrl} className="w-full h-full object-cover transform transition-transform duration-700 ease-out group-hover:scale-105 opacity-90 group-hover:opacity-100" loading="lazy" alt={manga.title} />
                                            
                                            {/* Gradiente base mais suave */}
                                            <div className="absolute inset-0 bg-gradient-to-t from-[#030108] via-[#030108]/50 to-transparent opacity-80 group-hover:opacity-100 transition-opacity duration-500"></div>
                                            
                                            <div className={`absolute top-4 left-4 text-[8px] font-black px-3 py-1.5 rounded-xl uppercase tracking-[0.15em] backdrop-blur-xl ${tagClasses}`}>
                                                {origin}
                                            </div>

                                            <div className="absolute top-4 right-4 bg-[#030108]/40 backdrop-blur-xl px-2.5 py-1.5 rounded-xl border border-white/10 flex items-center gap-1.5 shadow-lg">
                                                <Star className="w-3 h-3 text-[#FBBF24] fill-[#FBBF24]" />
                                                <span className="text-[10px] font-black text-white">{manga.rating ? Number(manga.rating).toFixed(1) : "5.0"}</span>
                                            </div>
                                            
                                            <div className="absolute bottom-0 w-full p-5 transform translate-y-3 group-hover:translate-y-0 transition-transform duration-500 ease-[cubic-bezier(0.2,0.8,0.2,1)]">
                                                <h3 className="font-black text-sm md:text-base text-white line-clamp-2 leading-snug group-hover:text-transparent group-hover:bg-clip-text group-hover:bg-gradient-to-r group-hover:from-white group-hover:to-slate-400 transition-all drop-shadow-xl pb-1">
                                                    {manga.title}
                                                </h3>
                                                <div className="flex items-center justify-between mt-3 opacity-0 group-hover:opacity-100 transition-all duration-500 ease-out">
                                                    <p className="text-[9px] text-slate-300 font-bold uppercase tracking-widest flex items-center gap-1.5 opacity-80">
                                                        <Clock className="w-3 h-3 text-[#A855F7]"/> {timeAgo(manga.createdAt)}
                                                    </p>
                                                    <div className="w-8 h-8 rounded-full bg-white/5 flex items-center justify-center backdrop-blur-xl border border-white/20 group-hover:bg-gradient-to-r group-hover:from-[#A855F7] group-hover:to-[#EC4899] group-hover:border-transparent transition-all duration-300 shadow-lg group-hover:scale-110">
                                                        <ChevronRight className="w-4 h-4 text-white translate-x-0.5" />
                                                    </div>
                                                </div>
                                            </div>
                                        </div>
                                        {/* Sombra base onírica sob o card */}
                                        <div className="absolute -inset-3 bg-gradient-to-b from-transparent via-[#A855F7]/10 to-[#EC4899]/20 rounded-[2.5rem] opacity-0 group-hover:opacity-100 blur-2xl transition-opacity duration-700 pointer-events-none -z-10"></div>
                                    </div>
                                );
                            }) : (
                                <div className="col-span-full py-40 flex flex-col items-center justify-center bg-white/[0.02] backdrop-blur-3xl border border-white/[0.05] rounded-[2.5rem] shadow-2xl relative overflow-hidden">
                                    <Moon className="w-20 h-20 text-slate-700 mb-8 drop-shadow-2xl animate-[pulse_4s_ease-in-out_infinite]" />
                                    <h3 className="text-white text-2xl font-black uppercase tracking-[0.25em] mb-3 drop-shadow-lg">Vazio Etéreo</h3>
                                    <p className="text-slate-400 text-xs font-bold uppercase tracking-widest opacity-60">Nenhuma obra ecoou nestas frequências.</p>
                                </div>
                            )}
                        </div>

                        {/* PAGINAÇÃO LEVE */}
                        {totalPages > 1 && (
                            <div className="mt-20 mb-12 flex items-center justify-center gap-4">
                                <button 
                                    disabled={currentPage === 1} 
                                    onClick={() => setCurrentPage(prev => prev - 1)} 
                                    className="h-12 w-12 flex justify-center items-center rounded-2xl bg-white/[0.03] text-white border border-white/10 disabled:opacity-20 hover:bg-white/10 hover:border-white/30 hover:-translate-x-1.5 transition-all duration-500 ease-out backdrop-blur-xl shadow-lg"
                                >
                                    <ChevronLeft className="w-5 h-5 pr-1" />
                                </button>
                                
                                <div className="flex items-center gap-2 bg-white/[0.02] p-1.5 rounded-3xl border border-white/10 backdrop-blur-xl shadow-inner">
                                    {[...Array(totalPages)].map((_, i) => {
                                        if (totalPages > 5 && (i + 1 !== 1 && i + 1 !== totalPages && Math.abs(currentPage - (i + 1)) > 1)) {
                                            if (i + 1 === 2 || i + 1 === totalPages - 1) return <span key={i} className="px-4 text-slate-600 font-black tracking-widest">...</span>;
                                            return null;
                                        }
                                        return (
                                            <button 
                                                key={i} 
                                                onClick={() => setCurrentPage(i + 1)} 
                                                className={`w-11 h-11 rounded-[1.2rem] font-black text-xs transition-all duration-500 ease-out ${
                                                    currentPage === i + 1 
                                                    ? 'bg-gradient-to-br from-[#A855F7] to-[#EC4899] text-white shadow-[0_5px_20px_rgba(168,85,247,0.4)] scale-110' 
                                                    : 'bg-transparent text-slate-400 hover:bg-white/10 hover:text-white'
                                                }`}
                                            >
                                                {i + 1}
                                            </button>
                                        );
                                    })}
                                </div>
                                
                                <button 
                                    disabled={currentPage === totalPages} 
                                    onClick={() => setCurrentPage(prev => prev + 1)} 
                                    className="h-12 w-12 flex justify-center items-center rounded-2xl bg-white/[0.03] text-white border border-white/10 disabled:opacity-20 hover:bg-white/10 hover:border-white/30 hover:translate-x-1.5 transition-all duration-500 ease-out backdrop-blur-xl shadow-lg"
                                >
                                    <ChevronRight className="w-5 h-5 pl-1" />
                                </button>
                            </div>
                        )}
                    </section>
                </div>
            </main>

            {/* MODAL DE FILTROS MOBILE (Mantendo o tema) */}
            {isMobileFilterOpen && (
                <div className="md:hidden fixed inset-0 z-[100] flex flex-col justify-end">
                    <div className="absolute inset-0 bg-[#030108]/80 backdrop-blur-md transition-opacity duration-500" onClick={() => setIsMobileFilterOpen(false)}></div>
                    
                    <div className="bg-[#0A0710]/95 backdrop-blur-3xl w-full max-h-[85vh] rounded-t-[3rem] border-t border-white/10 relative z-10 flex flex-col shadow-[0_-30px_60px_rgba(0,0,0,0.6)] animate-in slide-in-from-bottom-full duration-500 ease-[cubic-bezier(0.2,0.8,0.2,1)]">
                        
                        <div className="flex items-center justify-between p-8 border-b border-white/[0.05]">
                            <h2 className="font-black text-white uppercase tracking-[0.25em] text-xs flex items-center gap-3 opacity-90">
                                <Filter className="w-4 h-4 text-[#A855F7]" /> Sintetizar
                            </h2>
                            <button onClick={() => setIsMobileFilterOpen(false)} className="w-12 h-12 flex items-center justify-center rounded-2xl bg-white/[0.05] border border-white/10 text-white active:scale-90 transition-all duration-300">
                                <X className="w-5 h-5" />
                            </button>
                        </div>
                        
                        <div className="flex-1 overflow-y-auto p-8 scrollbar-hide">
                            <FilterPanel />
                        </div>
                        
                        <div className="p-8 border-t border-white/[0.05] bg-[#0A0710]/95 backdrop-blur-2xl">
                            <button 
                                onClick={() => setIsMobileFilterOpen(false)} 
                                className="w-full h-16 bg-gradient-to-r from-[#A855F7] to-[#EC4899] text-white font-black rounded-2xl uppercase tracking-[0.2em] text-[11px] flex items-center justify-center gap-3 shadow-[0_15px_30px_rgba(236,72,153,0.3)] active:scale-95 transition-all duration-300 hover:shadow-[0_15px_40px_rgba(236,72,153,0.5)]"
                            >
                                <Search className="w-4 h-4" /> Revelar {filteredMangas.length} Obras
                            </button>
                        </div>
                    </div>
                </div>
            )}
            
            {/* Definição de keyframes para a animação flutuante se o Tailwind não carregar os arbitrários adequadamente */}
            <style dangerouslySetInnerHTML={{__html: `
                @keyframes float {
                    0%, 100% { transform: translateY(0px) scale(1); }
                    50% { transform: translateY(-12px) scale(1.02); }
                }
            `}} />
        </div>
    );
}
