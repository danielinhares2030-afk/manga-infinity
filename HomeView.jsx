import React, { useState, useEffect, useMemo, useCallback } from 'react';
import { ChevronLeft, ChevronRight, Play, Star, Clock, Flame, LayoutGrid } from 'lucide-react';
import { timeAgo } from './helpers'; // Assumindo que você tem essa função

export function HomeView({ mangas = [], onNavigate }) {
    // ==========================================
    // ESTADOS
    // ==========================================
    const [currentSlide, setCurrentSlide] = useState(0);
    const [activeGenre, setActiveGenre] = useState('all');
    const [currentPage, setCurrentPage] = useState(1);
    const itemsPerPage = 10;

    // ==========================================
    // SEPARAÇÃO DE DADOS (Destaques, Populares, Lançamentos)
    // ==========================================
    
    // Destaques para o Carrossel (Top 5 obras)
    const featuredMangas = useMemo(() => {
        return [...mangas].sort((a, b) => (b.views || 0) - (a.views || 0)).slice(0, 5);
    }, [mangas]);

    // Populares (Top 6 obras por avaliação/views)
    const popularMangas = useMemo(() => {
        return [...mangas].sort((a, b) => (Number(b.rating) || 0) - (Number(a.rating) || 0)).slice(0, 6);
    }, [mangas]);

    // Lançamentos (Filtrados e Paginados)
    const releasesFiltered = useMemo(() => {
        let result = [...mangas].sort((a, b) => b.createdAt - a.createdAt);
        
        if (activeGenre !== 'all') {
            const normalizedGenre = activeGenre.toLowerCase();
            result = result.filter(m => {
                const isType = m.type && m.type.toLowerCase() === normalizedGenre;
                const hasGenre = m.genres && m.genres.some(g => g.toLowerCase() === normalizedGenre);
                return isType || hasGenre;
            });
        }
        return result;
    }, [mangas, activeGenre]);

    const totalPages = Math.ceil(releasesFiltered.length / itemsPerPage);
    const currentReleases = releasesFiltered.slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage);

    // ==========================================
    // LÓGICA DO CARROSSEL
    // ==========================================
    const nextSlide = useCallback(() => {
        setCurrentSlide((prev) => (prev + 1) % featuredMangas.length);
    }, [featuredMangas.length]);

    const prevSlide = useCallback(() => {
        setCurrentSlide((prev) => (prev === 0 ? featuredMangas.length - 1 : prev - 1));
    }, [featuredMangas.length]);

    // Autoplay do Carrossel (5 segundos)
    useEffect(() => {
        if (featuredMangas.length <= 1) return;
        const timer = setInterval(nextSlide, 5000);
        return () => clearInterval(timer);
    }, [nextSlide, featuredMangas.length]);

    const handleFilterChange = (genre) => {
        setActiveGenre(genre);
        setCurrentPage(1); // Reseta a paginação ao filtrar
    };

    return (
        <div className="bg-[#15202B] min-h-screen font-sans text-[#FFFFFF] pb-24 selection:bg-[#6C0BA9]/50 overflow-x-hidden">
            
            {/* ========================================== */}
            {/* 1. CARROSSEL EM DESTAQUE (HERO) */}
            {/* ========================================== */}
            <section 
                className="relative w-full h-[50vh] md:h-[70vh] max-h-[700px] bg-[#000000]" 
                role="region" 
                aria-roledescription="carousel" 
                aria-label="Obras em Destaque"
            >
                {featuredMangas.length > 0 ? (
                    <>
                        <div className="relative w-full h-full overflow-hidden" aria-live="polite">
                            {featuredMangas.map((manga, index) => (
                                <div 
                                    key={manga.id}
                                    className={`absolute inset-0 transition-opacity duration-1000 ease-in-out ${index === currentSlide ? 'opacity-100 z-10' : 'opacity-0 z-0 pointer-events-none'}`}
                                    aria-hidden={index !== currentSlide}
                                >
                                    <img 
                                        src={manga.coverUrl} 
                                        alt={`Capa de ${manga.title}`} 
                                        className="w-full h-full object-cover object-top opacity-60"
                                        loading={index === 0 ? "eager" : "lazy"}
                                    />
                                    {/* Degradês para garantir contraste legível (WCAG) */}
                                    <div className="absolute inset-0 bg-gradient-to-t from-[#15202B] via-[#15202B]/60 to-transparent"></div>
                                    <div className="absolute inset-0 bg-gradient-to-r from-[#15202B]/90 via-[#15202B]/40 to-transparent"></div>
                                    
                                    {/* Informações do Slide */}
                                    <div className="absolute bottom-10 left-6 md:bottom-16 md:left-16 max-w-2xl z-20">
                                        <div className="flex gap-2 mb-3">
                                            <span className="bg-[#EB5F10] text-[#000000] text-[10px] font-black uppercase tracking-widest px-2 py-1 rounded-sm">
                                                Em Destaque
                                            </span>
                                            {manga.type && (
                                                <span className="bg-[#6C0BA9] text-[#FFFFFF] text-[10px] font-bold uppercase tracking-widest px-2 py-1 rounded-sm">
                                                    {manga.type}
                                                </span>
                                            )}
                                        </div>
                                        <h2 className="text-3xl md:text-5xl font-black text-[#FFFFFF] leading-tight mb-4 drop-shadow-lg">
                                            {manga.title}
                                        </h2>
                                        <p className="text-gray-300 text-sm md:text-base line-clamp-2 md:line-clamp-3 mb-6 font-medium">
                                            {manga.synopsis || "Explore esta incrível obra no catálogo."}
                                        </p>
                                        <button 
                                            onClick={() => onNavigate('details', manga)}
                                            className="bg-[#F2C233] hover:bg-[#d6a929] text-[#000000] font-black uppercase tracking-widest text-xs md:text-sm px-8 py-4 rounded-lg flex items-center gap-2 transition-transform active:scale-95 shadow-[0_4px_15px_rgba(242,194,51,0.3)]"
                                            tabIndex={index === currentSlide ? 0 : -1}
                                        >
                                            <Play className="w-4 h-4 fill-current" /> Ler Agora
                                        </button>
                                    </div>
                                </div>
                            ))}
                        </div>

                        {/* Controles do Carrossel */}
                        <div className="absolute bottom-6 right-6 md:bottom-16 md:right-16 z-30 flex items-center gap-4">
                            <div className="flex gap-2 mr-4">
                                {featuredMangas.map((_, i) => (
                                    <button 
                                        key={i} 
                                        onClick={() => setCurrentSlide(i)}
                                        aria-label={`Ir para o slide ${i + 1}`}
                                        className={`w-12 h-1.5 rounded-full transition-all duration-300 ${i === currentSlide ? 'bg-[#F2C233]' : 'bg-white/20 hover:bg-white/40'}`}
                                    />
                                ))}
                            </div>
                            <button onClick={prevSlide} aria-label="Slide Anterior" className="w-10 h-10 rounded-full bg-[#15202B]/80 border border-[#34D1BF]/30 flex items-center justify-center text-[#34D1BF] hover:bg-[#34D1BF] hover:text-[#000000] transition-colors backdrop-blur-sm">
                                <ChevronLeft className="w-5 h-5" />
                            </button>
                            <button onClick={nextSlide} aria-label="Próximo Slide" className="w-10 h-10 rounded-full bg-[#15202B]/80 border border-[#34D1BF]/30 flex items-center justify-center text-[#34D1BF] hover:bg-[#34D1BF] hover:text-[#000000] transition-colors backdrop-blur-sm">
                                <ChevronRight className="w-5 h-5" />
                            </button>
                        </div>
                    </>
                ) : (
                    <div className="w-full h-full flex items-center justify-center bg-[#15202B]">
                        <span className="text-[#34D1BF] animate-pulse">Carregando destaques...</span>
                    </div>
                )}
            </section>

            <div className="max-w-7xl mx-auto px-4 md:px-8 pt-12 space-y-16">

                {/* ========================================== */}
                {/* 2. SEÇÃO: POPULARES */}
                {/* ========================================== */}
                <section aria-labelledby="populares-title">
                    <div className="flex items-center gap-3 mb-6">
                        <Flame className="w-6 h-6 text-[#EB5F10]" />
                        <h2 id="populares-title" className="text-2xl font-black uppercase tracking-widest text-[#FFFFFF]">
                            Mais <span className="text-[#EB5F10]">Populares</span>
                        </h2>
                    </div>

                    <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-4">
                        {popularMangas.map(manga => (
                            <div key={manga.id} onClick={() => onNavigate('details', manga)} className="group cursor-pointer flex flex-col gap-2">
                                <div className="relative aspect-[3/4] rounded-xl overflow-hidden bg-[#000000] shadow-lg border border-transparent group-hover:border-[#6C0BA9] transition-colors duration-300">
                                    <img src={manga.coverUrl} alt={manga.title} loading="lazy" className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500 opacity-90 group-hover:opacity-100" />
                                    <div className="absolute top-2 left-2 bg-[#15202B]/90 backdrop-blur-md px-2 py-1 rounded flex items-center gap-1 border border-[#34D1BF]/20">
                                        <Star className="w-3 h-3 text-[#F2C233] fill-[#F2C233]" />
                                        <span className="text-[10px] font-black text-[#FFFFFF]">{Number(manga.rating || 5).toFixed(1)}</span>
                                    </div>
                                    <div className="absolute inset-0 bg-[#6C0BA9]/20 opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none"></div>
                                </div>
                                <h3 className="text-sm font-bold text-[#FFFFFF] line-clamp-2 leading-tight group-hover:text-[#34D1BF] transition-colors">
                                    {manga.title}
                                </h3>
                            </div>
                        ))}
                    </div>
                </section>

                {/* ========================================== */}
                {/* 3. SEÇÃO: LANÇAMENTOS COM FILTRO E PAGINAÇÃO */}
                {/* ========================================== */}
                <section aria-labelledby="lancamentos-title">
                    <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-8 border-b border-[#6C0BA9]/30 pb-4">
                        <div className="flex items-center gap-3">
                            <LayoutGrid className="w-6 h-6 text-[#34D1BF]" />
                            <h2 id="lancamentos-title" className="text-2xl font-black uppercase tracking-widest text-[#FFFFFF]">
                                Últimos <span className="text-[#34D1BF]">Lançamentos</span>
                            </h2>
                        </div>

                        {/* Filtros de Gênero (Abas) */}
                        <div className="flex flex-wrap gap-2" role="group" aria-label="Filtros de formato">
                            {[
                                { id: 'all', label: 'Todos' },
                                { id: 'manga', label: 'Mangá' },
                                { id: 'manhwa', label: 'Manhwa' },
                                { id: 'manhua', label: 'Manhua' },
                                { id: 'shoujo', label: 'Shoujo' }
                            ].map(filter => (
                                <button
                                    key={filter.id}
                                    onClick={() => handleFilterChange(filter.id)}
                                    className={`px-4 py-2 rounded-lg text-xs font-bold uppercase tracking-widest transition-all ${
                                        activeGenre === filter.id 
                                        ? 'bg-[#6C0BA9] text-[#FFFFFF] shadow-[0_0_10px_rgba(108,11,169,0.5)] border border-[#6C0BA9]' 
                                        : 'bg-transparent text-[#34D1BF] border border-[#6C0BA9]/40 hover:border-[#34D1BF] hover:bg-[#34D1BF]/10'
                                    }`}
                                    aria-pressed={activeGenre === filter.id}
                                >
                                    {filter.label}
                                </button>
                            ))}
                        </div>
                    </div>

                    {/* Lista Paginada de Obras (Máx 10 por página) */}
                    {currentReleases.length > 0 ? (
                        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-4 md:gap-6">
                            {currentReleases.map(manga => (
                                <div key={manga.id} onClick={() => onNavigate('details', manga)} className="group cursor-pointer bg-[#0A1015] rounded-xl overflow-hidden border border-[#15202B] hover:border-[#6C0BA9] transition-all duration-300 flex flex-col">
                                    <div className="relative aspect-[3/4] overflow-hidden">
                                        <img src={manga.coverUrl} alt={manga.title} loading="lazy" className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
                                        <div className="absolute inset-0 bg-gradient-to-t from-[#0A1015] via-transparent to-transparent opacity-90"></div>
                                        <div className="absolute bottom-2 left-2 flex gap-1">
                                            <span className="bg-[#34D1BF] text-[#000000] text-[9px] font-black px-2 py-0.5 rounded-sm uppercase tracking-widest">
                                                {manga.type || 'Mangá'}
                                            </span>
                                        </div>
                                    </div>
                                    <div className="p-3 flex flex-col flex-1">
                                        <h3 className="text-sm font-bold text-[#FFFFFF] line-clamp-2 leading-tight group-hover:text-[#F2C233] transition-colors mb-2">
                                            {manga.title}
                                        </h3>
                                        <p className="text-[10px] text-gray-400 font-bold uppercase tracking-widest flex items-center gap-1 mt-auto">
                                            <Clock className="w-3 h-3 text-[#6C0BA9]" /> {timeAgo(manga.createdAt)}
                                        </p>
                                    </div>
                                </div>
                            ))}
                        </div>
                    ) : (
                        <div className="py-20 text-center bg-[#0A1015] rounded-2xl border border-[#6C0BA9]/20">
                            <span className="text-[#34D1BF] font-bold uppercase tracking-widest text-sm">Nenhuma obra encontrada para este filtro.</span>
                        </div>
                    )}

                    {/* Componente de Paginação */}
                    {totalPages > 1 && (
                        <nav aria-label="Paginação" className="mt-12 flex items-center justify-center gap-2">
                            <button 
                                disabled={currentPage === 1} 
                                onClick={() => setCurrentPage(prev => prev - 1)} 
                                aria-label="Página Anterior"
                                className="h-10 px-4 rounded-lg bg-[#0A1015] text-[#FFFFFF] border border-[#6C0BA9]/30 disabled:opacity-50 hover:bg-[#6C0BA9] hover:border-[#6C0BA9] transition-colors flex items-center"
                            >
                                <ChevronLeft className="w-4 h-4" />
                            </button>
                            
                            <div className="flex items-center gap-1">
                                {[...Array(totalPages)].map((_, i) => {
                                    const pageNum = i + 1;
                                    // Lógica simples para não estourar botões se houver muitas páginas
                                    if (totalPages > 5 && (pageNum !== 1 && pageNum !== totalPages && Math.abs(currentPage - pageNum) > 1)) {
                                        if (pageNum === 2 || pageNum === totalPages - 1) return <span key={i} className="px-2 text-gray-500">...</span>;
                                        return null;
                                    }
                                    return (
                                        <button 
                                            key={i} 
                                            onClick={() => setCurrentPage(pageNum)} 
                                            aria-label={`Página ${pageNum}`}
                                            aria-current={currentPage === pageNum ? 'page' : undefined}
                                            className={`w-10 h-10 rounded-lg font-bold text-xs transition-colors border ${
                                                currentPage === pageNum 
                                                ? 'bg-[#F2C233] text-[#000000] border-[#F2C233] shadow-[0_0_10px_rgba(242,194,51,0.4)]' 
                                                : 'bg-[#0A1015] text-gray-300 border-[#6C0BA9]/30 hover:bg-[#6C0BA9] hover:text-[#FFFFFF]'
                                            }`}
                                        >
                                            {pageNum}
                                        </button>
                                    );
                                })}
                            </div>
                            
                            <button 
                                disabled={currentPage === totalPages} 
                                onClick={() => setCurrentPage(prev => prev + 1)} 
                                aria-label="Próxima Página"
                                className="h-10 px-4 rounded-lg bg-[#0A1015] text-[#FFFFFF] border border-[#6C0BA9]/30 disabled:opacity-50 hover:bg-[#6C0BA9] hover:border-[#6C0BA9] transition-colors flex items-center"
                            >
                                <ChevronRight className="w-4 h-4" />
                            </button>
                        </nav>
                    )}
                </section>
            </div>
        </div>
    );
}
