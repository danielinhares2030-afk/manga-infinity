import React, { useState, useMemo, useEffect } from 'react';
import { Search, Star, Clock, ChevronRight, ChevronLeft, Moon, Filter, X, BookOpen, Flame, Tag, Play, Sparkles } from 'lucide-react';
import { timeAgo } from './helpers';

export function HomeView({ mangas = [], onNavigate }) {
    const [searchQuery, setSearchQuery] = useState('');
    const [currentPage, setCurrentPage] = useState(1);
    const [carouselIndex, setCarouselIndex] = useState(0);
    const itemsPerPage = 20;

    const [isMobileFilterOpen, setIsMobileFilterOpen] = useState(false);
    const [selectedType, setSelectedType] = useState('Todos');
    const [selectedGenre, setSelectedGenre] = useState('Todos');
    const [sortBy, setSortBy] = useState('Recentes');

    const types = ['Todos', 'Manhwa', 'Mangá', 'Manhua', 'Seinen', 'Shoujo'];
    const genresList = ['Todos', 'Ação', 'Aventura', 'Comédia', 'Drama', 'Fantasia', 'Isekai', 'Romance', 'Shounen'];
    const sortOptions = ['Recentes', 'Popularidade', 'A-Z'];

    const featuredMangas = useMemo(() => {
        return [...mangas].sort((a, b) => (Number(b.rating) || 0) - (Number(a.rating) || 0)).slice(0, 5);
    }, [mangas]);

    useEffect(() => {
        if (featuredMangas.length === 0) return;
        const interval = setInterval(() => {
            setCarouselIndex((prev) => (prev + 1) % featuredMangas.length);
        }, 6000);
        return () => clearInterval(interval);
    }, [featuredMangas.length]);

    const filteredMangas = useMemo(() => {
        let result = [...mangas];
        const normalize = (str) => str.normalize("NFD").replace(/[\u0300-\u036f]/g, "").toLowerCase();

        if (searchQuery.trim() !== '') {
            const lowerQ = searchQuery.toLowerCase();
            result = result.filter(m => m.title.toLowerCase().includes(lowerQ));
        }
        if (selectedType !== 'Todos') {
            result = result.filter(m => normalize(m.type || '') === normalize(selectedType));
        }
        if (selectedGenre !== 'Todos') {
            result = result.filter(m => m.genres?.map(g => normalize(g)).includes(normalize(selectedGenre)));
        }
        
        if (sortBy === 'Recentes') result.sort((a, b) => b.createdAt - a.createdAt);
        else if (sortBy === 'Popularidade') result.sort((a, b) => (Number(b.rating) || 0) - (Number(a.rating) || 0));
        else if (sortBy === 'A-Z') result.sort((a, b) => a.title.localeCompare(b.title));

        return result;
    }, [mangas, searchQuery, selectedType, selectedGenre, sortBy]);

    const totalPages = Math.ceil(filteredMangas.length / itemsPerPage);
    const currentItems = filteredMangas.slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage);

    const FilterPanel = () => (
        <div className="flex flex-col gap-8 py-2">
            <section>
                <h3 className="text-cyan-400/70 text-[10px] font-bold uppercase tracking-[0.3em] mb-4 flex items-center gap-2">
                    <Sparkles className="w-3 h-3" /> Ordenação
                </h3>
                <div className="grid grid-cols-1 gap-2">
                    {sortOptions.map(opt => (
                        <button 
                            key={opt} 
                            onClick={() => setSortBy(opt)}
                            className={`px-4 py-2.5 rounded-xl text-[11px] font-medium transition-all duration-500 border ${sortBy === opt ? 'bg-cyan-500/10 border-cyan-500/50 text-cyan-100 shadow-[0_0_15px_rgba(6,182,212,0.2)]' : 'bg-white/[0.02] border-white/5 text-gray-400 hover:border-white/20'}`}
                        >
                            {opt}
                        </button>
                    ))}
                </div>
            </section>

            <section>
                <h3 className="text-purple-400/70 text-[10px] font-bold uppercase tracking-[0.3em] mb-4 flex items-center gap-2">
                    <BookOpen className="w-3 h-3" /> Origem
                </h3>
                <div className="flex flex-wrap gap-2">
                    {types.map(opt => (
                        <button 
                            key={opt} 
                            onClick={() => setSelectedType(opt)}
                            className={`px-3 py-1.5 rounded-lg text-[10px] font-bold transition-all duration-300 border ${selectedType === opt ? 'bg-purple-500/20 border-purple-500/50 text-purple-200' : 'bg-white/[0.02] border-white/5 text-gray-500 hover:text-gray-300'}`}
                        >
                            {opt}
                        </button>
                    ))}
                </div>
            </section>
        </div>
    );

    return (
        <div className="bg-[#050505] min-h-screen text-slate-200 font-sans selection:bg-cyan-500/30 overflow-x-hidden">
            
            {/* Background Surreal Gradiente */}
            <div className="fixed inset-0 overflow-hidden pointer-events-none">
                <div className="absolute top-[-10%] right-[-10%] w-[60%] h-[60%] bg-purple-900/20 rounded-full blur-[120px] animate-pulse"></div>
                <div className="absolute bottom-[-10%] left-[-10%] w-[50%] h-[50%] bg-cyan-900/10 rounded-full blur-[100px]"></div>
            </div>

            {/* Nav Estilo Glass */}
            <header className="sticky top-0 z-[60] bg-black/20 backdrop-blur-2xl border-b border-white/[0.05]">
                <div className="max-w-7xl mx-auto px-6 py-4 flex items-center justify-between">
                    <h1 className="text-xl font-black tracking-tighter flex items-center gap-2 group cursor-pointer">
                        <div className="w-8 h-8 bg-gradient-to-tr from-cyan-500 to-purple-600 rounded-lg rotate-12 group-hover:rotate-45 transition-transform duration-500"></div>
                        <span className="bg-clip-text text-transparent bg-gradient-to-r from-white to-white/50">INFINITY</span>
                    </h1>

                    <div className="hidden md:flex relative w-96">
                        <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500" />
                        <input 
                            type="text" 
                            placeholder="Buscar dimensão..." 
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            className="w-full bg-white/[0.03] border border-white/10 rounded-2xl py-2.5 pl-12 pr-4 text-sm focus:border-cyan-500/50 outline-none transition-all placeholder:text-gray-600"
                        />
                    </div>

                    <button onClick={() => setIsMobileFilterOpen(true)} className="md:hidden p-2 bg-white/5 rounded-xl border border-white/10">
                        <Filter className="w-5 h-5 text-cyan-400" />
                    </button>
                </div>
            </header>

            <main className="relative z-10 max-w-7xl mx-auto px-6 pt-8 pb-24">
                
                {/* Carrossel Surreal */}
                {featuredMangas.length > 0 && searchQuery === '' && currentPage === 1 && (
                    <section className="relative h-[450px] md:h-[550px] w-full rounded-[3rem] overflow-hidden mb-16 border border-white/10 group shadow-2xl">
                        {featuredMangas.map((manga, idx) => (
                            <div 
                                key={manga.id}
                                className={`absolute inset-0 transition-all duration-[1.5s] cubic-bezier(0.4, 0, 0.2, 1) ${idx === carouselIndex ? 'opacity-100 scale-100' : 'opacity-0 scale-110 pointer-events-none'}`}
                            >
                                {/* Imagem com Ken Burns Effect */}
                                <img src={manga.coverUrl} className="w-full h-full object-cover animate-ken-burns" alt="" />
                                <div className="absolute inset-0 bg-gradient-to-t from-[#050505] via-[#050505]/40 to-transparent"></div>
                                <div className="absolute inset-0 bg-gradient-to-r from-[#050505] via-transparent to-transparent"></div>

                                <div className="absolute inset-0 flex flex-col justify-end p-8 md:p-16">
                                    <div className="flex items-center gap-3 mb-4 translate-y-4 group-hover:translate-y-0 transition-transform duration-700">
                                        <span className="px-3 py-1 bg-cyan-500/20 backdrop-blur-md border border-cyan-500/30 rounded-full text-[10px] font-bold text-cyan-300 uppercase tracking-widest">Destaque</span>
                                        <div className="flex items-center gap-1 text-amber-400">
                                            <Star className="w-4 h-4 fill-current" />
                                            <span className="text-sm font-bold">{manga.rating || '5.0'}</span>
                                        </div>
                                    </div>
                                    <h2 className="text-4xl md:text-7xl font-black mb-6 leading-none max-w-3xl drop-shadow-2xl">
                                        {manga.title}
                                    </h2>
                                    <button 
                                        onClick={() => onNavigate('details', manga)}
                                        className="w-fit flex items-center gap-3 px-8 py-4 bg-white text-black rounded-2xl font-bold hover:bg-cyan-400 transition-colors group/btn overflow-hidden relative"
                                    >
                                        <Play className="w-5 h-5 fill-current" /> LER AGORA
                                    </button>
                                </div>
                            </div>
                        ))}
                        
                        {/* Indicadores Minimalistas */}
                        <div className="absolute bottom-10 right-10 flex gap-2">
                            {featuredMangas.map((_, i) => (
                                <div 
                                    key={i} 
                                    className={`h-1 transition-all duration-500 rounded-full ${i === carouselIndex ? 'w-8 bg-cyan-500' : 'w-2 bg-white/20'}`}
                                />
                            ))}
                        </div>
                    </section>
                )}

                <div className="flex gap-12">
                    {/* Sidebar Glass */}
                    <aside className="hidden lg:block w-64 shrink-0">
                        <div className="sticky top-28">
                            <FilterPanel />
                        </div>
                    </aside>

                    <div className="flex-1">
                        <div className="flex items-center justify-between mb-10">
                            <h3 className="text-xl font-bold tracking-tight">Lançamentos <span className="text-gray-600 font-normal ml-2">/ {filteredMangas.length}</span></h3>
                        </div>

                        {/* Grade de Cards Estilo Holograma */}
                        <div className="grid grid-cols-2 sm:grid-cols-3 xl:grid-cols-4 gap-6 md:gap-8">
                            {currentItems.map(manga => (
                                <div 
                                    key={manga.id} 
                                    onClick={() => onNavigate('details', manga)}
                                    className="group relative flex flex-col cursor-pointer"
                                >
                                    <div className="relative aspect-[2/3] rounded-[2rem] overflow-hidden transition-all duration-500 group-hover:-translate-y-3 shadow-xl">
                                        <img 
                                            src={manga.coverUrl} 
                                            className="w-full h-full object-cover transition-transform duration-[1s] group-hover:scale-110" 
                                            alt={manga.title} 
                                        />
                                        <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-transparent to-transparent opacity-60 group-hover:opacity-90 transition-opacity"></div>
                                        
                                        {/* Overlay de Hover */}
                                        <div className="absolute inset-0 p-6 flex flex-col justify-end opacity-0 group-hover:opacity-100 transition-all duration-500">
                                            <div className="flex items-center gap-2 mb-3">
                                                <div className="bg-white/10 backdrop-blur-md p-2 rounded-lg border border-white/20">
                                                    <Play className="w-4 h-4 fill-white" />
                                                </div>
                                                <span className="text-[10px] font-black uppercase tracking-widest text-white">Ler Capítulo</span>
                                            </div>
                                        </div>

                                        {/* Badge de Nota */}
                                        <div className="absolute top-4 right-4 bg-black/40 backdrop-blur-xl px-2 py-1.5 rounded-xl border border-white/10 flex items-center gap-1.5">
                                            <Star className="w-3 h-3 text-amber-400 fill-amber-400" />
                                            <span className="text-[10px] font-bold">{manga.rating || '5.0'}</span>
                                        </div>
                                    </div>
                                    
                                    <div className="mt-4 px-2">
                                        <h4 className="font-bold text-sm line-clamp-1 group-hover:text-cyan-400 transition-colors">{manga.title}</h4>
                                        <p className="text-[10px] text-gray-500 font-medium uppercase mt-1 tracking-wider">{manga.type || 'Mangá'}</p>
                                    </div>
                                    
                                    {/* Glow de Fundo no Hover */}
                                    <div className="absolute -inset-4 bg-cyan-500/5 rounded-[3rem] blur-2xl opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none -z-10"></div>
                                </div>
                            ))}
                        </div>

                        {/* Paginação Suave */}
                        {totalPages > 1 && (
                            <div className="mt-20 flex justify-center gap-2">
                                {[...Array(totalPages)].map((_, i) => (
                                    <button 
                                        key={i}
                                        onClick={() => setCurrentPage(i + 1)}
                                        className={`w-10 h-10 rounded-xl font-bold text-xs transition-all ${currentPage === i + 1 ? 'bg-white text-black scale-110 shadow-lg shadow-white/10' : 'bg-white/5 text-gray-500 hover:bg-white/10'}`}
                                    >
                                        {i + 1}
                                    </button>
                                ))}
                            </div>
                        )}
                    </div>
                </div>
            </main>

            {/* CSS para Animações Customizadas */}
            <style dangerouslySetInnerHTML={{ __html: `
                @keyframes ken-burns {
                    0% { transform: scale(1); }
                    100% { transform: scale(1.15); }
                }
                .animate-ken-burns {
                    animation: ken-burns 10s infinite alternate linear;
                }
                .scrollbar-hide::-webkit-scrollbar {
                    display: none;
                }
            `}} />
        </div>
    );
}
