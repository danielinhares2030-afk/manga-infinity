import React, { useState, useMemo } from 'react';
import { Search, Clock, Star, ChevronDown, ChevronRight, LayoutGrid, List, SlidersHorizontal, Moon, Database, Zap, Flame, Bookmark } from 'lucide-react';
import { timeAgo } from './helpers';

export function CatalogView({ mangas, onNavigate, dataSaver, catalogState, setCatalogState }) {
    const [searchTerm, setSearchTerm] = useState("");
    const [showFilters, setShowFilters] = useState(false);
    const [viewMode, setViewMode] = useState('grid'); 

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
        <div className="pb-32 animate-in fade-in duration-500 bg-[#020205] min-h-screen relative font-sans text-white overflow-x-hidden">
            
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10 pt-4">
                
                {/* BANNER PRINCIPAL (ESTILO DA FOTO 3) */}
                <div className="relative w-full h-[180px] md:h-[220px] rounded-2xl overflow-hidden mb-6 shadow-[0_0_30px_rgba(168,85,247,0.15)] border border-purple-900/30">
                    <img src="https://i.ibb.co/VcF093w9/file-000000000a60720ea0dc89a96aeb27e0-removebg-preview.png" className="absolute inset-0 w-full h-full object-cover object-right opacity-40 mix-blend-screen" alt="BG" />
                    <div className="absolute inset-0 bg-gradient-to-r from-[#05030A] via-[#05030A]/80 to-transparent"></div>
                    
                    <div className="relative z-10 p-6 flex flex-col justify-center h-full">
                        <h1 className="text-[32px] md:text-[42px] font-black italic text-white uppercase tracking-tighter leading-none drop-shadow-md">
                            CATÁLOGO <br/><span className="text-transparent bg-clip-text bg-gradient-to-r from-purple-500 to-cyan-400 drop-shadow-[0_0_15px_rgba(168,85,247,0.8)]">NEXO</span>
                        </h1>
                        <p className="text-[10px] text-gray-300 uppercase tracking-widest mt-2 font-bold max-w-[200px] leading-snug">
                            HISTÓRIAS QUE TE LEVAM <br/><span className="text-cyan-400">A OUTROS MUNDOS.</span>
                        </p>
                    </div>

                    <div className="absolute right-4 bottom-4 bg-[#0a0a16]/80 backdrop-blur-md border border-cyan-500/50 px-4 py-2 rounded-xl flex items-center gap-3 shadow-[0_0_20px_rgba(6,182,212,0.3)]" style={{ clipPath: 'polygon(10px 0, 100% 0, 100% calc(100% - 10px), calc(100% - 10px) 100%, 0 100%, 0 10px)' }}>
                        <Database className="text-cyan-400 w-5 h-5"/>
                        <div className="flex flex-col items-start leading-none gap-0.5">
                            <span className="text-white font-black text-sm">{filteredMangas.length} OBRAS</span>
                            <span className="text-[7px] text-cyan-500 uppercase tracking-widest font-black">Disponíveis</span>
                        </div>
                        <ChevronRight className="w-4 h-4 text-cyan-500 ml-1"/>
                    </div>
                </div>

                {/* BARRA DE BUSCA E CONTROLES */}
                <div className="flex items-center gap-3 mb-4">
                    <div className="relative flex-1 group">
                        <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                            <Search className="h-4 w-4 text-gray-500 group-focus-within:text-cyan-400 transition-colors" />
                        </div>
                        <input 
                            type="text" 
                            value={searchTerm} 
                            onChange={(e) => setSearchTerm(e.target.value)} 
                            className="w-full pl-10 pr-4 py-3.5 rounded-xl border border-blue-900/30 bg-[#080510] text-white outline-none focus:border-cyan-500/50 transition-all font-medium text-xs placeholder:text-gray-600 shadow-inner" 
                            placeholder="Buscar obras..." 
                        />
                    </div>
                    
                    <button onClick={() => setShowFilters(!showFilters)} className={`bg-[#080510] border border-blue-900/30 px-4 py-3.5 rounded-xl flex items-center justify-center gap-2 font-black text-[10px] uppercase tracking-widest transition-all ${showFilters ? 'bg-purple-900/30 text-purple-400 border-purple-500 shadow-[0_0_15px_rgba(168,85,247,0.3)]' : 'text-gray-400 hover:text-white'}`}>
                        <SlidersHorizontal className="w-4 h-4" /> FILTROS <ChevronDown className="w-3 h-3 ml-1" />
                    </button>

                    <div className="hidden sm:flex items-center bg-[#080510] border border-blue-900/30 rounded-xl p-1 shadow-sm h-full">
                        <button onClick={() => setViewMode('grid')} className={`p-2 rounded-lg transition-colors ${viewMode === 'grid' ? 'bg-cyan-600 text-white' : 'text-gray-500 hover:text-white'}`}>
                            <LayoutGrid className="w-4 h-4" />
                        </button>
                        <button onClick={() => setViewMode('list')} className={`p-2 rounded-lg transition-colors ${viewMode === 'list' ? 'bg-cyan-600 text-white' : 'text-gray-500 hover:text-white'}`}>
                            <List className="w-4 h-4" />
                        </button>
                    </div>
                </div>

                {/* PAINEL DE FILTROS ABERTO */}
                {showFilters && (
                    <div className="bg-[#05030A] border border-purple-500/30 rounded-xl p-5 mb-6 shadow-[0_10px_30px_rgba(0,0,0,0.5)] animate-in slide-in-from-top-2 relative z-20">
                        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                            <div className="flex flex-col gap-1.5"><label className="text-[9px] font-black text-purple-400 uppercase tracking-widest">Gênero</label>
                                <select value={selectedGenre} onChange={e=>setSelectedGenre(e.target.value)} className="w-full bg-[#080510] border border-white/10 text-white text-xs font-bold rounded-xl px-4 py-3 outline-none focus:border-purple-500 cursor-pointer">{genreOptions.map(opt => <option key={opt} value={opt}>{opt}</option>)}</select>
                            </div>
                            <div className="flex flex-col gap-1.5"><label className="text-[9px] font-black text-purple-400 uppercase tracking-widest">Status</label>
                                <select value={selectedStatus} onChange={e=>setSelectedStatus(e.target.value)} className="w-full bg-[#080510] border border-white/10 text-white text-xs font-bold rounded-xl px-4 py-3 outline-none focus:border-purple-500 cursor-pointer">{statusOptions.map(opt => <option key={opt} value={opt}>{opt}</option>)}</select>
                            </div>
                            <div className="flex flex-col gap-1.5"><label className="text-[9px] font-black text-purple-400 uppercase tracking-widest">Ordem</label>
                                <select value={sortBy} onChange={e=>setSortBy(e.target.value)} className="w-full bg-[#080510] border border-white/10 text-white text-xs font-bold rounded-xl px-4 py-3 outline-none focus:border-purple-500 cursor-pointer">{sortOptions.map(opt => <option key={opt} value={opt}>{opt}</option>)}</select>
                            </div>
                        </div>
                    </div>
                )}

                {/* PÍLULAS DE TIPO CONTÍNUAS */}
                <div className="flex items-center bg-[#080510] rounded-xl border border-blue-900/30 overflow-x-auto no-scrollbar mb-6 snap-x p-1">
                    {typeOptions.map(opt => (
                        <button 
                            key={opt} 
                            onClick={() => setSelectedType(opt)} 
                            className={`flex-1 min-w-[80px] px-4 py-2.5 rounded-lg text-[9px] font-black uppercase tracking-widest whitespace-nowrap transition-all duration-300 snap-start
                            ${selectedType === opt ? 'bg-gradient-to-r from-blue-600 to-purple-600 text-white shadow-[0_0_10px_rgba(168,85,247,0.5)]' : 'bg-transparent text-gray-500 hover:text-white hover:bg-white/5'}`}
                        >
                            {opt}
                        </button>
                    ))}
                </div>

                {/* GRADE DE OBRAS */}
                <div className={viewMode === 'grid' ? "grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-3 md:gap-4 relative z-0" : "flex flex-col gap-4 relative z-0"}>
                    {currentItems.length > 0 ? currentItems.map(manga => (
                        <div key={manga.id} onClick={() => onNavigate('details', manga)} className={`cursor-pointer group relative overflow-hidden bg-[#080510] border border-blue-900/30 rounded-2xl hover:border-purple-500/80 transition-colors duration-300 shadow-md hover:shadow-[0_0_20px_rgba(168,85,247,0.3)] ${viewMode === 'grid' ? 'aspect-[2/3]' : 'flex h-32 p-2 gap-4'}`}>
                            
                            <img src={manga.coverUrl} className={`${viewMode === 'grid' ? 'absolute inset-0 w-full h-full' : 'w-20 h-full rounded-xl'} object-cover group-hover:scale-105 transition-transform duration-700 ease-out`} loading="lazy" onError={(e) => e.target.src = `https://placehold.co/300x450/080510/0ea5e9?text=Oculto`} />
                            
                            {viewMode === 'grid' && (
                                <div className="absolute inset-0 bg-gradient-to-t from-[#020205] via-[#020205]/20 to-transparent"></div>
                            )}

                            {/* BADGES SUPERIORES */}
                            {viewMode === 'grid' && (
                                <div className="absolute top-2 w-full px-2 flex justify-between items-start z-10">
                                    {manga.chapters && manga.chapters.length > 0 && (
                                        <div className="bg-cyan-600/90 backdrop-blur-sm text-white text-[8px] font-black px-2 py-1 rounded border border-cyan-400 shadow-[0_0_10px_rgba(6,182,212,0.8)] uppercase tracking-widest">
                                            CAP {manga.chapters[0].number}
                                        </div>
                                    )}
                                    <div className="bg-black/80 backdrop-blur-md px-1.5 py-1 rounded border border-yellow-500/30 flex items-center gap-1">
                                        <Star className="w-2.5 h-2.5 text-yellow-400 fill-yellow-400" />
                                        <span className="text-[9px] font-black text-white">{manga.rating ? Number(manga.rating).toFixed(1) : "5.0"}</span>
                                    </div>
                                </div>
                            )}

                            {/* INFORMAÇÕES INFERIORES */}
                            <div className={`${viewMode === 'grid' ? 'absolute bottom-0 w-full p-3 z-10' : 'flex-1 flex flex-col justify-center'}`}>
                                <h3 className={`font-black text-transparent bg-clip-text bg-gradient-to-r from-white to-gray-400 leading-snug drop-shadow-lg ${viewMode === 'grid' ? 'text-sm line-clamp-2 mb-2' : 'text-base line-clamp-1 mb-1'}`}>
                                    {manga.title}
                                </h3>
                                
                                <div className="flex items-center justify-between">
                                    <p className="text-[8px] font-black uppercase tracking-widest flex items-center gap-1 text-cyan-400 bg-cyan-950/40 px-2 py-0.5 rounded border border-cyan-900">
                                        <Clock className="w-2.5 h-2.5"/> {timeAgo(manga.createdAt)}
                                    </p>
                                    {viewMode === 'grid' && <div className="w-5 h-5 rounded border border-white/20 flex items-center justify-center bg-black/50"><Bookmark className="w-2.5 h-2.5 text-gray-400"/></div>}
                                </div>
                            </div>
                        </div>
                    )) : (
                        <div className="col-span-full py-20 flex flex-col items-center justify-center bg-[#05030A] rounded-3xl border border-blue-900/30 border-dashed">
                            <Moon className="w-12 h-12 text-gray-700 mx-auto mb-4 animate-pulse" />
                            <p className="text-gray-500 font-black text-xs uppercase tracking-widest text-center px-4 leading-relaxed">O sistema não encontrou o que você procura.</p>
                        </div>
                    )}
                </div>

                {/* BOTÃO CARREGAR MAIS */}
                {filteredMangas.length > visibleCount && (
                    <div className="mt-12 flex justify-center">
                        <button onClick={handleLoadMore} className="bg-transparent border border-purple-500/50 text-purple-400 hover:bg-purple-600 hover:text-white hover:border-purple-600 font-black px-10 py-4 rounded-xl flex items-center gap-3 transition-all duration-300 text-[10px] uppercase tracking-widest shadow-lg group">
                            <Zap className="w-4 h-4 group-hover:text-white" /> Carregar Mais
                        </button>
                    </div>
                )}
            </div>

            {/* FLOATING BANNER BOTTOM */}
            <div className="fixed bottom-[75px] md:bottom-4 left-1/2 -translate-x-1/2 w-[90%] max-w-sm bg-gradient-to-r from-[#080510] via-purple-900/40 to-[#080510] border border-purple-500/30 rounded-full px-4 py-2.5 flex items-center justify-between shadow-[0_0_30px_rgba(168,85,247,0.2)] backdrop-blur-md z-30">
                <div className="flex flex-col">
                    <span className="text-white font-black text-[9px] uppercase tracking-widest flex items-center gap-1"><Flame className="w-3 h-3 text-purple-500"/> NOVOS CAPÍTULOS</span>
                    <span className="text-purple-400 font-black text-[8px] uppercase tracking-widest">TODA SEMANA!</span>
                </div>
                <button className="bg-white/5 border border-white/10 hover:border-purple-500 text-gray-300 hover:text-white text-[8px] font-black px-3 py-1.5 rounded-full uppercase tracking-widest transition-colors flex items-center gap-1">
                    VER ATUALIZAÇÕES <ChevronRight className="w-3 h-3" />
                </button>
            </div>
        </div>
    );
}
