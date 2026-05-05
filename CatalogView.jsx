import React, { useState, useMemo } from 'react';
import { Search, Clock, Star, ChevronDown, SlidersHorizontal, Moon, Database, Zap, BookOpen, X, Sparkles } from 'lucide-react';
import { timeAgo } from './helpers';

export function CatalogView({ mangas, onNavigate, dataSaver, catalogState, setCatalogState }) {
    const [searchTerm, setSearchTerm] = useState("");
    const [showFilters, setShowFilters] = useState(false);

    const [selectedType, setSelectedType] = useState('TODOS');
    const [selectedGenre, setSelectedGenre] = useState('Todos');
    const [selectedStatus, setSelectedStatus] = useState('Todos');
    const [sortBy, setSortBy] = useState('Recentes');

    const visibleCount = catalogState?.visibleCount || 24;

    const typeOptions = ['TODOS', 'MANGÁ', 'MANHWA', 'MANHUA', '+ NOVO'];
    const genreOptions = ['Todos', 'Ação', 'Artes Marciais', 'Aventura', 'Comédia', 'Drama', 'Esportes', 'Fantasia', 'Ficção Científica', 'Isekai', 'Magia', 'Mistério', 'Romance', 'Seinen', 'Shoujo', 'Shounen', 'Slice of Life', 'Terror'];
    const statusOptions = ['Todos', 'Em Lançamento', 'Completo', 'Hiato'];
    const sortOptions = ['Recentes', 'Melhor Avaliação', 'A - Z', 'Z - A'];

    const filteredMangas = useMemo(() => {
        let result = [...(mangas || [])];
        const normalize = str => str ? str.normalize("NFD").replace(/[\u0300-\u036f]/g, "").toLowerCase() : '';

        if (searchTerm.trim() !== '') {
            const term = normalize(searchTerm);
            result = result.filter(m => normalize(m.title).includes(term) || normalize(m.author).includes(term));
        }

        if (selectedType !== 'TODOS' && selectedType !== '+ NOVO') {
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
            if (sortBy === 'Recentes') return b.createdAt - a.createdAt;
            if (sortBy === 'Melhor Avaliação') return (Number(b.rating) || 0) - (Number(a.rating) || 0);
            if (sortBy === 'A - Z') return (a.title || '').localeCompare(b.title || '');
            if (sortBy === 'Z - A') return (b.title || '').localeCompare(a.title || '');
            return 0;
        });

        return result;
    }, [mangas, searchTerm, selectedType, selectedGenre, selectedStatus, sortBy]);

    const currentItems = filteredMangas.slice(0, visibleCount);

    const handleLoadMore = () => {
        setCatalogState({ ...catalogState, visibleCount: visibleCount + 24 });
    };

    return (
        <div className="pb-32 min-h-screen relative font-sans text-white bg-[#030014] overflow-x-hidden selection:bg-fuchsia-500/40">
            
            {/* BACKGROUND SURREAL & LUZES VOLUMÉTRICAS ANIMADAS */}
            <div className="fixed inset-0 z-0 pointer-events-none overflow-hidden">
                <div className="absolute top-[-10%] left-[-10%] w-[50vw] h-[50vw] bg-purple-600/20 blur-[120px] rounded-full animate-pulse mix-blend-screen duration-[8000ms]"></div>
                <div className="absolute bottom-[-10%] right-[-10%] w-[40vw] h-[40vw] bg-fuchsia-600/20 blur-[150px] rounded-full animate-pulse mix-blend-screen duration-[12000ms]"></div>
                <div className="absolute top-[40%] left-[60%] w-[30vw] h-[30vw] bg-cyan-600/10 blur-[100px] rounded-full animate-pulse mix-blend-screen duration-[10000ms]"></div>
                {/* Textura de ruído (noise) para dar o tom premium */}
                <div className="absolute inset-0 opacity-[0.03] mix-blend-overlay" style={{ backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 200 200' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noiseFilter'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.65' numOctaves='3' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noiseFilter)'/%3E%3C/svg%3E")` }}></div>
            </div>

            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10 pt-6 md:pt-10">
                
                {/* CABEÇALHO DE PESQUISA GLASSMORPHISM */}
                <div className="flex items-center gap-4 mb-8">
                    <div className="relative flex-1 group">
                        <div className="absolute -inset-0.5 bg-gradient-to-r from-purple-600 to-fuchsia-600 rounded-3xl blur opacity-20 group-focus-within:opacity-50 transition duration-500"></div>
                        <div className="relative flex items-center bg-[#0a0a0f]/80 backdrop-blur-2xl border border-white/10 rounded-3xl overflow-hidden shadow-2xl">
                            <Search className="absolute left-5 h-5 w-5 text-gray-400 group-focus-within:text-fuchsia-400 transition-colors duration-300" />
                            <input 
                                type="text" 
                                value={searchTerm} 
                                onChange={(e) => setSearchTerm(e.target.value)} 
                                className="w-full pl-14 pr-6 py-4 bg-transparent text-white outline-none font-bold text-sm placeholder:text-gray-500/80 tracking-wide" 
                                placeholder="Desvende obras, autores e mistérios..." 
                            />
                        </div>
                    </div>
                    
                    <button 
                        onClick={() => setShowFilters(!showFilters)} 
                        className={`relative p-4 rounded-3xl transition-all duration-500 transform-gpu hover:scale-105 shadow-xl flex-shrink-0
                        ${showFilters 
                            ? 'bg-gradient-to-br from-fuchsia-600 to-purple-600 text-white shadow-[0_0_30px_rgba(217,70,239,0.4)] border border-fuchsia-400/50' 
                            : 'bg-[#0a0a0f]/80 backdrop-blur-2xl border border-white/10 text-gray-400 hover:text-white hover:border-purple-500/50 hover:shadow-[0_0_20px_rgba(168,85,247,0.2)]'}`}
                    >
                        {showFilters ? <X className="w-6 h-6"/> : <SlidersHorizontal className="w-6 h-6" />}
                    </button>
                </div>

                {/* PAINEL DE FILTROS ULTRA MODERNO */}
                {showFilters && (
                    <div className="bg-[#05050a]/60 backdrop-blur-3xl border border-white/10 rounded-[2.5rem] p-8 mb-10 shadow-[0_20px_50px_rgba(0,0,0,0.5)] animate-in slide-in-from-top-8 fade-in duration-500 relative z-20 overflow-hidden">
                        <div className="absolute top-0 right-0 w-64 h-64 bg-fuchsia-500/10 rounded-full blur-[80px] pointer-events-none"></div>
                        
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 relative z-10">
                            {[
                                { label: 'Gênero', icon: BookOpen, value: selectedGenre, setter: setSelectedGenre, options: genreOptions },
                                { label: 'Status', icon: Zap, value: selectedStatus, setter: setSelectedStatus, options: statusOptions },
                                { label: 'Ordenação', icon: Clock, value: sortBy, setter: setSortBy, options: sortOptions }
                            ].map((filterObj, idx) => (
                                <div key={idx} className="flex flex-col gap-3 group">
                                    <label className="text-[11px] font-black text-gray-400 uppercase tracking-[0.2em] flex items-center gap-2 drop-shadow-md">
                                        <filterObj.icon className="w-4 h-4 text-purple-500" /> {filterObj.label}
                                    </label>
                                    <div className="relative rounded-2xl border border-white/5 bg-black/40 backdrop-blur-md overflow-hidden group-hover:border-purple-500/50 transition-colors duration-300 shadow-inner">
                                        <select 
                                            value={filterObj.value} 
                                            onChange={e => filterObj.setter(e.target.value)} 
                                            className="w-full bg-transparent text-white text-sm font-black tracking-wide rounded-2xl px-5 py-4 outline-none cursor-pointer appearance-none relative z-10"
                                        >
                                            {filterObj.options.map(opt => <option key={opt} value={opt} className="bg-[#0f0f16] text-white">{opt}</option>)}
                                        </select>
                                        <ChevronDown className="absolute right-5 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-500 group-hover:text-purple-400 transition-colors pointer-events-none z-0" />
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                )}

                {/* CAIXAS SELECIONÁVEIS NEON */}
                <div className="flex items-center gap-3 md:gap-4 overflow-x-auto no-scrollbar mb-10 snap-x pb-4 pt-2 px-1">
                    {typeOptions.map(opt => (
                        <button 
                            key={opt} 
                            onClick={() => setSelectedType(opt)} 
                            className={`flex-none px-8 py-4 rounded-[1.5rem] text-[11px] md:text-xs font-black uppercase tracking-[0.2em] whitespace-nowrap transition-all duration-500 snap-start transform-gpu relative overflow-hidden group
                            ${selectedType === opt 
                                ? 'text-white shadow-[0_10px_30px_rgba(217,70,239,0.4)] scale-105 border-transparent' 
                                : 'bg-[#0a0a0f]/80 backdrop-blur-md border border-white/10 text-gray-500 hover:text-white hover:border-fuchsia-500/50 hover:shadow-[0_0_20px_rgba(217,70,239,0.2)]'}`}
                        >
                            {selectedType === opt && (
                                <div className="absolute inset-0 bg-gradient-to-r from-purple-600 via-fuchsia-500 to-pink-500 opacity-100"></div>
                            )}
                            <span className="relative z-10">{opt}</span>
                            {selectedType === opt && <div className="absolute inset-0 bg-white/20 translate-x-[-100%] skew-x-[-15deg] animate-[shimmer_2s_infinite]"></div>}
                        </button>
                    ))}
                </div>

                {/* GRID DE OBRAS - OUSADO E SURREAL */}
                <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-5 md:gap-7 relative z-0">
                    {currentItems.length > 0 ? currentItems.map(manga => (
                        <div key={manga.id} onClick={() => onNavigate('details', manga)} className="cursor-pointer group relative rounded-[2rem] aspect-[2/3] transform-gpu transition-all duration-500 hover:scale-[1.03] hover:-translate-y-2 hover:shadow-[0_20px_40px_-10px_rgba(217,70,239,0.5)] border border-white/5 hover:border-fuchsia-500/50 overflow-visible bg-[#0a0a0f]">
                            
                            {/* BRILHO EXTERNO NO HOVER */}
                            <div className="absolute -inset-0.5 bg-gradient-to-b from-purple-500 to-fuchsia-600 rounded-[2rem] blur opacity-0 group-hover:opacity-30 transition duration-500 pointer-events-none"></div>

                            {/* CONTAINER DA IMAGEM CORTADO */}
                            <div className="absolute inset-0 rounded-[2rem] overflow-hidden">
                                <img src={manga.coverUrl} className={`w-full h-full object-cover transform-gpu transition-all duration-[1500ms] ease-out group-hover:scale-110 group-hover:rotate-1 ${dataSaver ? 'blur-[1px]' : ''}`} loading="lazy" onError={(e) => e.target.src = `https://placehold.co/300x450/0a0a0f/d946ef?text=Nexo`} />
                                
                                {/* DEGRADÊ CINEMÁTICO */}
                                <div className="absolute inset-0 bg-gradient-to-t from-[#030014] via-[#030014]/50 to-transparent opacity-90 group-hover:opacity-100 transition-opacity duration-500"></div>
                                <div className="absolute inset-0 bg-purple-900/10 mix-blend-overlay group-hover:bg-fuchsia-500/20 transition-colors duration-500"></div>
                            </div>
                            
                            {/* BADGE: ORIGEM (NEON GLASS) */}
                            <div className="absolute top-3 left-3 bg-white/10 backdrop-blur-md px-3 py-1.5 rounded-xl border border-white/20 z-10 shadow-[0_0_15px_rgba(255,255,255,0.1)] group-hover:bg-fuchsia-500/20 group-hover:border-fuchsia-400/50 transition-all duration-300">
                                <span className="text-[9px] font-black text-white uppercase tracking-[0.2em] drop-shadow-md">{manga.type || 'MANGÁ'}</span>
                            </div>
                            
                            {/* BADGE: AVALIAÇÃO (GLOW ESTELAR) */}
                            <div className="absolute top-3 right-3 bg-black/60 backdrop-blur-md px-2 py-1.5 rounded-xl border border-amber-500/30 flex items-center gap-1 z-10 shadow-[0_0_15px_rgba(245,158,11,0.2)] group-hover:border-amber-400/60 transition-all duration-300">
                                <Star className="w-3.5 h-3.5 text-amber-400 fill-amber-400 drop-shadow-[0_0_5px_rgba(245,158,11,0.8)]" />
                                <span className="text-[11px] font-black text-white">{manga.rating ? Number(manga.rating).toFixed(1) : "5.0"}</span>
                            </div>

                            {/* INFORMAÇÕES DA BASE ANIMADAS */}
                            <div className="absolute inset-x-0 bottom-0 flex flex-col justify-end p-5 z-10 transform-gpu transition-transform duration-500 group-hover:-translate-y-2">
                                <h3 className="font-black text-sm md:text-base text-white line-clamp-2 mb-3 leading-tight drop-shadow-[0_2px_10px_rgba(0,0,0,0.8)] group-hover:text-transparent group-hover:bg-clip-text group-hover:bg-gradient-to-r group-hover:from-white group-hover:to-fuchsia-300 transition-all duration-300">
                                    {manga.title}
                                </h3>
                                <div className="flex items-center gap-2 opacity-80 group-hover:opacity-100 transition-opacity duration-300">
                                    <span className="bg-white/10 backdrop-blur-md px-2.5 py-1 rounded-lg text-[10px] font-black text-fuchsia-200 uppercase tracking-widest border border-white/10 shadow-inner flex items-center gap-1">
                                        <BookOpen className="w-3 h-3" /> Cap. {manga.chapters?.length ? manga.chapters[0].number : 0}
                                    </span>
                                </div>
                            </div>
                        </div>
                    )) : (
                        <div className="col-span-full py-32 flex flex-col items-center justify-center bg-[#0a0a0f]/40 backdrop-blur-xl rounded-[3rem] border border-white/5 shadow-2xl relative overflow-hidden">
                            <div className="absolute inset-0 bg-gradient-to-br from-fuchsia-500/5 to-purple-600/5 pointer-events-none"></div>
                            <Moon className="w-16 h-16 text-fuchsia-900/50 mx-auto mb-6 animate-pulse" />
                            <p className="text-gray-400 font-black text-sm uppercase tracking-[0.3em] drop-shadow-md text-center px-4">O abismo não possui registros para esta busca.</p>
                        </div>
                    )}
                </div>

                {/* BOTÃO CARREGAR MAIS CINEMÁTICO */}
                {filteredMangas.length > visibleCount && (
                    <div className="mt-16 flex justify-center">
                        <button onClick={handleLoadMore} className="relative overflow-hidden bg-[#0a0a0f]/80 backdrop-blur-xl border border-white/10 text-gray-300 hover:text-white font-black px-12 py-5 rounded-[2rem] flex items-center gap-3 transition-all duration-500 text-xs uppercase tracking-[0.3em] group hover:border-purple-500/50 hover:shadow-[0_0_40px_rgba(168,85,247,0.3)] hover:scale-105 active:scale-95">
                            <span className="relative z-10 flex items-center gap-3">
                                <Database className="w-5 h-5 text-purple-500 group-hover:text-fuchsia-400 transition-colors duration-300" /> Desvendar Mais
                            </span>
                            <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/5 to-transparent translate-x-[-100%] group-hover:animate-[shimmer_1.5s_infinite]"></div>
                        </button>
                    </div>
                )}
            </div>
        </div>
    );
}
