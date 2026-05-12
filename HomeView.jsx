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

    // Auto-play do Carrossel
    useEffect(() => {
        if (featuredMangas.length === 0) return;
        const interval = setInterval(() => {
            setCarouselIndex((prev) => (prev + 1) % featuredMangas.length);
        }, 5000);
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

    const getTagColor = (type) => {
        const lower = type.toLowerCase();
        if (lower === 'manhwa') return 'bg-[#8C199C]/20 text-[#D26AE0] border-[#8C199C]/50 shadow-[0_0_10px_rgba(140,25,156,0.3)]'; 
        if (lower === 'manhua') return 'bg-[#B03D23]/20 text-[#FA7B60] border-[#B03D23]/50 shadow-[0_0_10px_rgba(176,61,35,0.3)]'; 
        if (lower === 'shoujo') return 'bg-[#950606]/20 text-[#FF4D4D] border-[#950606]/50 shadow-[0_0_10px_rgba(149,6,6,0.3)]'; 
        return 'bg-white/10 text-[#FAFAFA] border-white/20 shadow-[0_0_10px_rgba(255,255,255,0.1)]'; 
    };

    const FilterPanel = () => (
        <div className="flex flex-col gap-8">
            <div>
                <h3 className="text-[#FAFAFA] text-xs font-black uppercase tracking-[0.15em] mb-4 flex items-center gap-2 opacity-80">
                    <Clock className="w-4 h-4 text-[#B03D23]" /> Ordenar Por
                </h3>
                <div className="flex flex-col gap-2">
                    {sortOptions.map(opt => (
                        <button 
                            key={opt} 
                            onClick={() => { setSortBy(opt); setCurrentPage(1); }} 
                            className={`px-4 py-3 rounded-xl text-xs font-bold uppercase tracking-widest text-left transition-all duration-300 ease-out border backdrop-blur-md ${sortBy === opt ? 'bg-gradient-to-r from-[#950606] to-[#B03D23] text-[#FAFAFA] border-transparent shadow-[0_4px_15px_rgba(149,6,6,0.4)] translate-x-1' : 'bg-white/5 text-gray-400 border-white/5 hover:border-white/20 hover:text-[#FAFAFA] hover:bg-white/10'}`}
                        >
                            {opt}
                        </button>
                    ))}
                </div>
            </div>

            <div>
                <h3 className="text-[#FAFAFA] text-xs font-black uppercase tracking-[0.15em] mb-4 flex items-center gap-2 opacity-80">
                    <BookOpen className="w-4 h-4 text-[#8C199C]" /> Formato
                </h3>
                <div className="flex flex-wrap gap-2">
                    {types.map(opt => (
                        <button 
                            key={opt} 
                            onClick={() => { setSelectedType(opt); setCurrentPage(1); }} 
                            className={`px-3 py-2 rounded-lg text-[10px] font-black uppercase tracking-widest transition-all duration-300 ease-out border backdrop-blur-md ${selectedType === opt ? 'bg-[#8C199C] text-[#FAFAFA] border-[#8C199C] shadow-[0_4px_15px_rgba(140,25,156,0.4)]' : 'bg-white/5 text-gray-400 border-white/5 hover:border-white/20 hover:text-[#FAFAFA]'}`}
                        >
                            {opt}
                        </button>
                    ))}
                </div>
            </div>

            <div>
                <h3 className="text-[#FAFAFA] text-xs font-black uppercase tracking-[0.15em] mb-4 flex items-center gap-2 opacity-80">
                    <Flame className="w-4 h-4 text-[#950606]" /> Gêneros
                </h3>
                <div className="flex flex-wrap gap-2">
                    {genresList.map(opt => (
                        <button 
                            key={opt} 
                            onClick={() => { setSelectedGenre(opt); setCurrentPage(1); }} 
                            className={`px-3 py-2 rounded-lg text-[10px] font-black uppercase tracking-widest transition-all duration-300 ease-out border backdrop-blur-md ${selectedGenre === opt ? 'bg-[#950606] text-[#FAFAFA] border-[#950606] shadow-[0_4px_15px_rgba(149,6,6,0.4)]' : 'bg-white/5 text-gray-400 border-white/5 hover:border-white/20 hover:text-[#FAFAFA]'}`}
                        >
                            {opt}
                        </button>
                    ))}
                </div>
            </div>
        </div>
    );

    return (
        <div className="bg-[#0D0D0D] min-h-screen font-sans text-[#FAFAFA] pb-24 selection:bg-[#950606]/50 flex flex-col relative overflow-hidden">
            
            {/* Efeitos de Fundo Surreal */}
            <div className="fixed top-[-20%] left-[-10%] w-[50%] h-[50%] bg-[#950606] rounded-full mix-blend-screen filter blur-[150px] opacity-20 pointer-events-none"></div>
            <div className="fixed bottom-[-20%] right-[-10%] w-[50%] h-[50%] bg-[#8C199C] rounded-full mix-blend-screen filter blur-[150px] opacity-10 pointer-events-none"></div>

            {/* HEADER GLASSMORPHISM */}
            <header className="sticky top-0 z-50 bg-[#0D0D0D]/70 backdrop-blur-xl border-b border-white/5 shadow-2xl">
                <div className="max-w-7xl mx-auto px-4 py-4 flex flex-col md:flex-row items-center justify-between gap-4">
                    <div className="flex items-center justify-between w-full md:w-auto">
                        <h1 className="text-xl md:text-2xl font-black uppercase tracking-[0.2em] text-[#FAFAFA] drop-shadow-[0_0_10px_rgba(255,255,255,0.2)]">
                            Manga <span className="text-transparent bg-clip-text bg-gradient-to-r from-[#950606] to-[#B03D23]">Infinity</span>
                        </h1>
                        <button 
                            className="md:hidden p-2 bg-white/5 border border-white/10 rounded-xl text-[#FAFAFA] active:scale-95 transition-transform"
                            onClick={() => setIsMobileFilterOpen(true)}
                        >
                            <Filter className="w-5 h-5" />
                        </button>
                    </div>

                    <div className="relative w-full md:w-96 group">
                        <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 group-focus-within:text-[#B03D23] transition-colors duration-300" />
                        <input 
                            type="text" 
                            placeholder="Pesquisar no infinito..." 
                            value={searchQuery}
                            onChange={(e) => { setSearchQuery(e.target.value); setCurrentPage(1); }}
                            className="w-full bg-white/5 backdrop-blur-md border border-white/10 rounded-2xl py-3.5 pl-12 pr-4 text-sm text-[#FAFAFA] outline-none focus:border-[#B03D23] focus:bg-white/10 transition-all duration-300 shadow-inner"
                        />
                    </div>
                </div>
            </header>

            <main className="flex-1 max-w-7xl mx-auto w-full px-4 pt-8 flex flex-col gap-8 relative z-10">
                
                {/* CARROSSEL HERO SURREAL E LEVE */}
                {featuredMangas.length > 0 && searchQuery === '' && currentPage === 1 && (
                    <section className="relative w-full h-[400px] md:h-[450px] rounded-[2rem] overflow-hidden group shadow-[0_20px_50px_rgba(0,0,0,0.5)] border border-white/10">
                        {/* Background animado do carrossel */}
                        {featuredMangas.map((manga, idx) => (
                            <div 
                                key={`bg-${manga.id}`} 
                                className={`absolute inset-0 transition-opacity duration-1000 ease-in-out ${idx === carouselIndex ? 'opacity-100' : 'opacity-0'}`}
                            >
                                <img src={manga.coverUrl} className="w-full h-full object-cover scale-110 blur-xl opacity-40 mix-blend-luminosity" alt="bg" />
                                <div className="absolute inset-0 bg-gradient-to-t from-[#0D0D0D] via-[#0D0D0D]/60 to-transparent"></div>
                                <div className="absolute inset-0 bg-gradient-to-r from-[#0D0D0D] via-transparent to-transparent"></div>
                            </div>
                        ))}

                        {/* Conteúdo do Carrossel */}
                        <div className="absolute inset-0 flex items-center p-6 md:p-12">
                            {featuredMangas.map((manga, idx) => (
                                <div 
                                    key={manga.id}
                                    className={`absolute flex flex-col md:flex-row items-center gap-8 w-full transition-all duration-700 ease-out transform ${idx === carouselIndex ? 'opacity-100 translate-x-0 scale-100' : 'opacity-0 translate-x-12 scale-95 pointer-events-none'}`}
                                >
                                    {/* Capa flutuante com brilho */}
                                    <div className="relative hidden md:block w-48 lg:w-64 aspect-[1/1.4] rounded-2xl overflow-hidden shadow-[0_0_40px_rgba(149,6,6,0.4)] border border-white/20 transform -rotate-2 hover:rotate-0 hover:scale-105 transition-all duration-300 cursor-pointer" onClick={() => onNavigate('details', manga)}>
                                        <img src={manga.coverUrl} className="w-full h-full object-cover" alt={manga.title} />
                                        <div className="absolute top-2 left-2 bg-[#950606]/80 backdrop-blur-md px-3 py-1 rounded-lg text-[10px] font-black uppercase tracking-widest text-white border border-white/20">
                                            Destaque
                                        </div>
                                    </div>

                                    {/* Informações ousadas */}
                                    <div className="flex-1 text-center md:text-left">
                                        <div className="flex items-center justify-center md:justify-start gap-3 mb-4">
                                            <span className="bg-white/10 backdrop-blur-md border border-white/20 px-3 py-1 rounded-full text-xs font-bold text-[#FAFAFA] flex items-center gap-1 shadow-lg">
                                                <Star className="w-3 h-3 text-[#F1A822] fill-[#F1A822]" /> {manga.rating ? Number(manga.rating).toFixed(1) : "5.0"}
                                            </span>
                                            <span className="text-xs font-black uppercase tracking-widest text-[#B03D23]">{getOriginTag(manga)}</span>
                                        </div>
                                        <h2 className="text-3xl md:text-5xl lg:text-6xl font-black text-transparent bg-clip-text bg-gradient-to-br from-white to-gray-500 mb-4 drop-shadow-xl line-clamp-2 leading-tight">
                                            {manga.title}
                                        </h2>
                                        <p className="text-gray-300 text-sm md:text-base line-clamp-3 mb-8 max-w-2xl font-light leading-relaxed">
                                            {manga.synopsis || "Descubra os segredos dessa obra incrível e mergulhe em um universo único. Leia agora e acompanhe os últimos lançamentos."}
                                        </p>
                                        <button 
                                            onClick={() => onNavigate('details', manga)}
                                            className="group relative px-8 py-4 bg-white/10 hover:bg-[#950606] backdrop-blur-md border border-white/20 rounded-2xl font-black text-sm uppercase tracking-widest text-white overflow-hidden transition-all duration-300 ease-out shadow-[0_10px_30px_rgba(0,0,0,0.5)] hover:shadow-[0_0_30px_rgba(149,6,6,0.6)] flex items-center gap-3 mx-auto md:mx-0"
                                        >
                                            <span className="relative z-10 flex items-center gap-2">
                                                <Play className="w-4 h-4 fill-white" /> Ler Agora
                                            </span>
                                        </button>
                                    </div>
                                </div>
                            ))}
                        </div>

                        {/* Controles do Carrossel */}
                        <div className="absolute bottom-6 left-1/2 -translate-x-1/2 flex gap-2 z-20">
                            {featuredMangas.map((_, idx) => (
                                <button 
                                    key={idx}
                                    onClick={() => setCarouselIndex(idx)}
                                    className={`h-1.5 rounded-full transition-all duration-500 ease-out ${idx === carouselIndex ? 'w-8 bg-gradient-to-r from-[#950606] to-[#B03D23] shadow-[0_0_10px_rgba(149,6,6,0.8)]' : 'w-2 bg-white/30 hover:bg-white/50'}`}
                                />
                            ))}
                        </div>
                    </section>
                )}

                <div className="flex gap-8">
                    {/* SIDEBAR DESKTOP */}
                    <aside className="hidden md:block w-64 flex-shrink-0">
                        <div className="sticky top-28 bg-white/5 backdrop-blur-xl border border-white/10 rounded-3xl p-6 shadow-[0_20px_40px_rgba(0,0,0,0.4)]">
                            <FilterPanel />
                        </div>
                    </aside>

                    {/* ÁREA DE CONTEÚDO */}
                    <section className="flex-1">
                        
                        <div className="flex flex-wrap items-center gap-3 mb-8">
                            <span className="text-xs font-black text-gray-500 uppercase tracking-[0.2em] mr-2">
                                Explorar ({filteredMangas.length})
                            </span>
                            
                            {selectedType !== 'Todos' && (
                                <span className="flex items-center gap-2 bg-white/10 backdrop-blur-md border border-white/20 px-4 py-2 rounded-xl text-[10px] font-black text-[#FAFAFA] uppercase tracking-widest shadow-lg animate-in fade-in zoom-in duration-300">
                                    <BookOpen className="w-3 h-3 text-[#8C199C]" /> {selectedType}
                                    <X className="w-3 h-3 cursor-pointer hover:text-[#950606] transition-colors" onClick={() => setSelectedType('Todos')} />
                                </span>
                            )}
                            {selectedGenre !== 'Todos' && (
                                <span className="flex items-center gap-2 bg-white/10 backdrop-blur-md border border-white/20 px-4 py-2 rounded-xl text-[10px] font-black text-[#FAFAFA] uppercase tracking-widest shadow-lg animate-in fade-in zoom-in duration-300">
                                    <Tag className="w-3 h-3 text-[#B03D23]" /> {selectedGenre}
                                    <X className="w-3 h-3 cursor-pointer hover:text-[#950606] transition-colors" onClick={() => setSelectedGenre('Todos')} />
                                </span>
                            )}
                        </div>

                        {/* GRADE DE CARDS SURREAL */}
                        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4 md:gap-6">
                            {currentItems.length > 0 ? currentItems.map(manga => {
                                const origin = getOriginTag(manga);
                                const tagClasses = getTagColor(origin);

                                return (
                                    <div key={manga.id} onClick={() => onNavigate('details', manga)} className="cursor-pointer group flex flex-col relative perspective-1000">
                                        <div className="relative aspect-[1/1.4] rounded-2xl md:rounded-3xl overflow-hidden bg-white/5 backdrop-blur-sm border border-white/10 shadow-[0_10px_20px_rgba(0,0,0,0.4)] transform transition-all duration-300 ease-out group-hover:-translate-y-3 group-hover:shadow-[0_20px_40px_rgba(149,6,6,0.3)] group-hover:border-white/30 z-10">
                                            
                                            <img src={manga.coverUrl} className="w-full h-full object-cover transform transition-transform duration-500 ease-out group-hover:scale-110 opacity-90 group-hover:opacity-100" loading="lazy" alt={manga.title} />
                                            
                                            <div className="absolute inset-0 bg-gradient-to-t from-[#0D0D0D] via-[#0D0D0D]/40 to-transparent opacity-80 group-hover:opacity-100 transition-opacity duration-300"></div>
                                            
                                            <div className={`absolute top-3 left-3 text-[9px] font-black px-2.5 py-1.5 rounded-lg uppercase tracking-widest backdrop-blur-md ${tagClasses}`}>
                                                {origin}
                                            </div>

                                            <div className="absolute top-3 right-3 bg-black/40 backdrop-blur-md px-2.5 py-1.5 rounded-lg border border-white/10 flex items-center gap-1.5 shadow-lg">
                                                <Star className="w-3 h-3 text-[#F1A822] fill-[#F1A822]" />
                                                <span className="text-[10px] font-black text-[#FAFAFA]">{manga.rating ? Number(manga.rating).toFixed(1) : "5.0"}</span>
                                            </div>
                                            
                                            <div className="absolute bottom-0 w-full p-4 transform translate-y-2 group-hover:translate-y-0 transition-transform duration-300 ease-out">
                                                <h3 className="font-black text-sm md:text-base text-[#FAFAFA] line-clamp-2 leading-tight group-hover:text-transparent group-hover:bg-clip-text group-hover:bg-gradient-to-r group-hover:from-white group-hover:to-gray-400 transition-all drop-shadow-lg">
                                                    {manga.title}
                                                </h3>
                                                <div className="flex items-center justify-between mt-3 opacity-0 group-hover:opacity-100 transition-all duration-300 ease-out">
                                                    <p className="text-[10px] text-gray-300 font-bold uppercase tracking-widest flex items-center gap-1.5">
                                                        <Clock className="w-3 h-3 text-[#B03D23]"/> {timeAgo(manga.createdAt)}
                                                    </p>
                                                    <div className="w-8 h-8 rounded-full bg-white/10 flex items-center justify-center backdrop-blur-md border border-white/20 group-hover:bg-[#950606] group-hover:border-transparent transition-all shadow-lg group-hover:scale-110">
                                                        <ChevronRight className="w-4 h-4 text-[#FAFAFA] translate-x-0.5" />
                                                    </div>
                                                </div>
                                            </div>
                                        </div>
                                        {/* Sombra base colorida sob o card */}
                                        <div className="absolute -inset-2 bg-gradient-to-b from-transparent to-[#950606]/20 rounded-[2.5rem] opacity-0 group-hover:opacity-100 blur-xl transition-opacity duration-300 pointer-events-none -z-10"></div>
                                    </div>
                                );
                            }) : (
                                <div className="col-span-full py-32 flex flex-col items-center justify-center bg-white/5 backdrop-blur-xl border border-white/10 rounded-3xl shadow-2xl relative overflow-hidden">
                                    <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/stardust.png')] opacity-10"></div>
                                    <Moon className="w-16 h-16 text-gray-600 mb-6 drop-shadow-xl" />
                                    <h3 className="text-[#FAFAFA] text-xl font-black uppercase tracking-[0.2em] mb-2 drop-shadow-md">Vazio Infinito</h3>
                                    <p className="text-gray-400 text-xs font-bold uppercase tracking-widest">Nenhuma obra ecoou pelos filtros.</p>
                                </div>
                            )}
                        </div>

                        {/* PAGINAÇÃO MODERNIZADA */}
                        {totalPages > 1 && (
                            <div className="mt-16 mb-8 flex items-center justify-center gap-3">
                                <button 
                                    disabled={currentPage === 1} 
                                    onClick={() => setCurrentPage(prev => prev - 1)} 
                                    className="h-12 px-4 rounded-xl bg-white/5 text-[#FAFAFA] border border-white/10 disabled:opacity-30 hover:bg-white/10 hover:border-white/30 hover:-translate-x-1 transition-all duration-300 ease-out flex items-center backdrop-blur-md"
                                >
                                    <ChevronLeft className="w-5 h-5" />
                                </button>
                                
                                <div className="flex items-center gap-2 bg-white/5 p-1.5 rounded-2xl border border-white/10 backdrop-blur-md shadow-inner">
                                    {[...Array(totalPages)].map((_, i) => {
                                        if (totalPages > 5 && (i + 1 !== 1 && i + 1 !== totalPages && Math.abs(currentPage - (i + 1)) > 1)) {
                                            if (i + 1 === 2 || i + 1 === totalPages - 1) return <span key={i} className="px-3 text-gray-600 font-black">...</span>;
                                            return null;
                                        }
                                        return (
                                            <button 
                                                key={i} 
                                                onClick={() => setCurrentPage(i + 1)} 
                                                className={`w-10 h-10 rounded-xl font-black text-xs transition-all duration-300 ease-out ${
                                                    currentPage === i + 1 
                                                    ? 'bg-gradient-to-br from-[#950606] to-[#B03D23] text-[#FAFAFA] shadow-[0_4px_15px_rgba(149,6,6,0.5)] scale-110' 
                                                    : 'bg-transparent text-gray-400 hover:bg-white/10 hover:text-[#FAFAFA]'
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
                                    className="h-12 px-4 rounded-xl bg-white/5 text-[#FAFAFA] border border-white/10 disabled:opacity-30 hover:bg-white/10 hover:border-white/30 hover:translate-x-1 transition-all duration-300 ease-out flex items-center backdrop-blur-md"
                                >
                                    <ChevronRight className="w-5 h-5" />
                                </button>
                            </div>
                        )}
                    </section>
                </div>
            </main>

            {/* MODAL DE FILTROS MOBILE */}
            {isMobileFilterOpen && (
                <div className="md:hidden fixed inset-0 z-[100] flex flex-col justify-end">
                    <div className="absolute inset-0 bg-black/60 backdrop-blur-sm transition-opacity" onClick={() => setIsMobileFilterOpen(false)}></div>
                    
                    <div className="bg-[#0D0D0D]/90 backdrop-blur-2xl w-full max-h-[85vh] rounded-t-[2.5rem] border-t border-white/10 relative z-10 flex flex-col shadow-[0_-20px_50px_rgba(0,0,0,0.5)] animate-in slide-in-from-bottom-full duration-300 ease-out">
                        
                        <div className="flex items-center justify-between p-6 border-b border-white/5">
                            <h2 className="font-black text-[#FAFAFA] uppercase tracking-[0.2em] text-sm flex items-center gap-3">
                                <Filter className="w-5 h-5 text-[#B03D23]" /> Sintetizar
                            </h2>
                            <button onClick={() => setIsMobileFilterOpen(false)} className="w-10 h-10 flex items-center justify-center rounded-2xl bg-white/5 border border-white/10 text-[#FAFAFA] active:scale-90 transition-transform">
                                <X className="w-5 h-5" />
                            </button>
                        </div>
                        
                        <div className="flex-1 overflow-y-auto p-6 scrollbar-hide">
                            <FilterPanel />
                        </div>
                        
                        <div className="p-6 border-t border-white/5 bg-[#0D0D0D]/90 backdrop-blur-xl">
                            <button 
                                onClick={() => setIsMobileFilterOpen(false)} 
                                className="w-full h-14 bg-gradient-to-r from-[#950606] to-[#B03D23] text-[#FAFAFA] font-black rounded-2xl uppercase tracking-[0.2em] text-xs flex items-center justify-center gap-3 shadow-[0_10px_30px_rgba(149,6,6,0.4)] active:scale-95 transition-transform"
                            >
                                <Search className="w-4 h-4" /> Revelar {filteredMangas.length} Obras
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
