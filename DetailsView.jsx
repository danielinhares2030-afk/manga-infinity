import React, { useState, useMemo } from 'react';
import { ChevronLeft, Star, Play, Bookmark, Check, ChevronRight, Share2, Info, Clock, CheckCircle2 } from 'lucide-react';
import { timeAgo } from './helpers';

export function DetailsView({ manga, onBack, onChapterClick, libraryData = {}, onToggleLibrary, historyData = [], dataSaver, showToast }) {
    const [activeTab, setActiveTab] = useState('Capítulos');
    const [isSynopsisExpanded, setIsSynopsisExpanded] = useState(false);

    // Proteção caso o mangá não seja carregado
    if (!manga) return null;

    // Verificar se está na biblioteca do usuário
    const isSaved = libraryData[manga.id] === 'Favoritos';

    // Organizar capítulos (do maior para o menor)
    const sortedChapters = useMemo(() => {
        return [...(manga.chapters || [])].sort((a, b) => Number(b.number) - Number(a.number));
    }, [manga.chapters]);

    // Verificar Progresso de Leitura
    const readChaptersIds = useMemo(() => {
        return new Set((historyData || []).filter(h => h.mangaId === manga.id).map(h => h.chapterId));
    }, [historyData, manga.id]);

    // Descobrir qual capítulo ler a seguir
    const getNextChapterToRead = () => {
        if (!sortedChapters.length) return null;
        if (readChaptersIds.size === 0) return sortedChapters[sortedChapters.length - 1]; // Primeiro capítulo
        
        // Pega o menor capítulo não lido
        const unread = sortedChapters.filter(c => !readChaptersIds.has(c.id)).sort((a, b) => Number(a.number) - Number(b.number));
        if (unread.length > 0) return unread[0];
        
        return sortedChapters[0]; // Se leu tudo, retorna o mais recente
    };

    const nextChapter = getNextChapterToRead();
    const hasStartedReading = readChaptersIds.size > 0;
    const isFullyRead = readChaptersIds.size === sortedChapters.length && sortedChapters.length > 0;

    const handleShare = () => {
        if (navigator.share) {
            navigator.share({ title: manga.title, text: `Leia ${manga.title} no Manga Empire!`, url: window.location.href });
        } else {
            navigator.clipboard.writeText(window.location.href);
            if(showToast) showToast("Link copiado para a área de transferência!", "success");
        }
    };

    return (
        <div className="bg-[#050505] min-h-screen w-full font-sans text-white overflow-x-hidden animate-in fade-in duration-500 pb-24 relative">
            
            {/* CABEÇALHO HERO - EFEITO FADE DA IMAGEM */}
            <div className="relative w-full h-[300px] md:h-[450px]">
                {/* Imagem de fundo com blur */}
                <div className="absolute inset-0 bg-[#050505] overflow-hidden">
                    <img 
                        src={manga.coverUrl} 
                        className={`w-full h-full object-cover opacity-30 scale-110 ${dataSaver ? 'blur-sm' : 'blur-md'}`} 
                        alt="Background" 
                    />
                </div>
                
                {/* Degradês para mesclar com o fundo */}
                <div className="absolute inset-0 bg-gradient-to-t from-[#050505] via-[#050505]/60 to-transparent" />
                <div className="absolute inset-0 bg-gradient-to-t from-[#050505] via-transparent to-black/40" />

                {/* Botão Voltar Navbar */}
                <div className="absolute top-0 left-0 w-full p-4 flex items-center justify-between z-50">
                    <button onClick={onBack} className="w-10 h-10 rounded-full bg-black/40 backdrop-blur-md border border-white/10 flex items-center justify-center text-white hover:bg-black/60 transition-colors">
                        <ChevronLeft className="w-6 h-6 pr-0.5" />
                    </button>
                    <button onClick={handleShare} className="w-10 h-10 rounded-full bg-black/40 backdrop-blur-md border border-white/10 flex items-center justify-center text-white hover:bg-black/60 transition-colors">
                        <Share2 className="w-4 h-4" />
                    </button>
                </div>
            </div>

            {/* CONTEÚDO PRINCIPAL (Sobe em cima do Hero) */}
            <div className="relative z-10 px-5 max-w-5xl mx-auto -mt-32 md:-mt-48">
                
                {/* BLOCO DE CAPA E TÍTULO */}
                <div className="flex gap-5 md:gap-8">
                    {/* Capa */}
                    <div className="w-[110px] sm:w-[140px] md:w-[220px] flex-shrink-0">
                        <div className="aspect-[2/3] rounded-xl overflow-hidden shadow-[0_20px_40px_rgba(0,0,0,0.8)] border border-white/10">
                            <img src={manga.coverUrl} className="w-full h-full object-cover" alt="Capa" />
                        </div>
                    </div>

                    {/* Informações ao Lado da Capa */}
                    <div className="flex flex-col justify-end pb-1 md:pb-4">
                        <h1 className="text-2xl md:text-5xl font-black uppercase tracking-tighter leading-none mb-3 drop-shadow-md">
                            {manga.title}
                        </h1>
                        
                        {/* Badges Estilo da Imagem */}
                        <div className="flex flex-wrap items-center gap-2">
                            <span className="text-[9px] md:text-[10px] font-black uppercase text-gray-300 border border-white/10 px-2 py-1 rounded bg-[#111]">
                                {manga.type || 'MANGÁ'}
                            </span>
                            <span className="text-[9px] md:text-[10px] font-black uppercase bg-red-600 text-white px-2 py-1 rounded">
                                {manga.status || 'LANÇAMENTO'}
                            </span>
                            <span className="text-[10px] font-black flex items-center gap-1 text-amber-400 bg-amber-400/10 border border-amber-400/20 px-2 py-1 rounded">
                                <Star className="w-3 h-3 fill-amber-400 drop-shadow-[0_0_5px_rgba(251,191,36,0.6)]"/> {manga.rating ? Number(manga.rating).toFixed(1) : '5.0'}
                            </span>
                        </div>
                    </div>
                </div>

                {/* BOTÕES DE AÇÃO */}
                <div className="flex gap-3 mt-6">
                    <button 
                        onClick={() => nextChapter && onChapterClick(manga, nextChapter)}
                        disabled={!nextChapter}
                        className={`flex-1 font-black text-xs md:text-sm uppercase tracking-widest py-3.5 md:py-4 rounded-xl flex items-center justify-center gap-2 transition-all shadow-lg active:scale-95 ${
                            isFullyRead 
                            ? 'bg-green-600 text-white hover:bg-green-500' 
                            : 'bg-red-600 text-white hover:bg-red-500 shadow-[0_0_20px_rgba(220,38,38,0.3)]'
                        } disabled:opacity-50 disabled:cursor-not-allowed`}
                    >
                        {isFullyRead ? (
                            <><CheckCircle2 className="w-4 h-4" /> Finalizado</>
                        ) : hasStartedReading ? (
                            <><Play className="w-4 h-4 fill-current" /> Continuar: Cap {nextChapter?.number}</>
                        ) : (
                            <><Play className="w-4 h-4 fill-current" /> Começar a Ler</>
                        )}
                    </button>
                    
                    <button 
                        onClick={() => onToggleLibrary(manga.id, isSaved ? 'Remover' : 'Favoritos')}
                        className={`px-5 rounded-xl border flex flex-col md:flex-row items-center justify-center transition-all ${
                            isSaved 
                            ? 'bg-blue-600/20 border-blue-500 text-blue-400 shadow-[0_0_15px_rgba(59,130,246,0.2)]' 
                            : 'bg-[#0a0a0c] border-white/10 text-gray-400 hover:text-white hover:bg-white/5'
                        }`}
                    >
                        {isSaved ? <Check className="w-5 h-5 md:mr-2" /> : <Bookmark className="w-5 h-5 md:mr-2" />}
                        <span className="hidden md:block font-black text-[10px] uppercase tracking-widest">{isSaved ? 'Salvo' : 'Biblioteca'}</span>
                    </button>
                </div>

                {/* SINOPSE */}
                <div className="mt-6 bg-[#0a0a0c] border border-white/5 p-4 rounded-2xl">
                    <p className={`text-gray-400 text-sm font-medium leading-relaxed ${!isSynopsisExpanded ? 'line-clamp-3' : ''}`}>
                        {manga.synopsis || "Nenhuma sinopse disponível para esta obra no momento."}
                    </p>
                    {manga.synopsis && manga.synopsis.length > 150 && (
                        <button 
                            onClick={() => setIsSynopsisExpanded(!isSynopsisExpanded)} 
                            className="text-red-500 font-bold text-xs mt-2 hover:text-red-400 transition-colors uppercase tracking-widest"
                        >
                            {isSynopsisExpanded ? 'Ocultar' : 'Ler mais'}
                        </button>
                    )}
                </div>

                {/* TABS (Capítulos / Sobre) */}
                <div className="flex gap-6 border-b border-white/10 mt-8">
                    {['Capítulos', 'Sobre'].map(tab => (
                        <button 
                            key={tab} 
                            onClick={() => setActiveTab(tab)}
                            className={`pb-3 text-xs md:text-sm font-black uppercase tracking-widest relative transition-colors ${activeTab === tab ? 'text-white' : 'text-gray-600 hover:text-gray-400'}`}
                        >
                            {tab}
                            {activeTab === tab && (
                                <div className="absolute bottom-[-1px] left-0 w-full h-[2px] bg-red-600 shadow-[0_0_10px_rgba(220,38,38,0.8)]" />
                            )}
                        </button>
                    ))}
                </div>

                {/* CONTEÚDO DAS TABS */}
                <div className="mt-4 pb-10">
                    
                    {/* TAB: CAPÍTULOS */}
                    {activeTab === 'Capítulos' && (
                        <div className="flex flex-col">
                            {/* Resumo de Capítulos */}
                            <div className="flex justify-between items-center py-2 px-2 mb-2">
                                <span className="text-[10px] font-black text-gray-500 uppercase tracking-widest">{sortedChapters.length} Capítulos Disponíveis</span>
                                {readChaptersIds.size > 0 && (
                                    <span className="text-[10px] font-black text-blue-500 uppercase tracking-widest">{readChaptersIds.size} Lidos</span>
                                )}
                            </div>

                            {/* Lista */}
                            {sortedChapters.length > 0 ? sortedChapters.map(cap => {
                                const isRead = readChaptersIds.has(cap.id);
                                return (
                                    <div 
                                        key={cap.id} 
                                        onClick={() => onChapterClick(manga, cap)} 
                                        className="flex items-center justify-between py-4 px-3 border-b border-white/5 cursor-pointer hover:bg-white/5 transition-colors rounded-xl group"
                                    >
                                        <div className="flex flex-col gap-1">
                                            <span className={`text-sm md:text-base font-bold transition-colors ${isRead ? 'text-gray-500' : 'text-gray-200 group-hover:text-red-400'}`}>
                                                Capítulo {cap.number}
                                            </span>
                                            <span className="text-[9px] md:text-[10px] font-bold text-gray-600 uppercase tracking-widest flex items-center gap-1">
                                                <Clock className="w-3 h-3" /> {timeAgo(cap.createdAt)}
                                            </span>
                                        </div>
                                        <div>
                                            {isRead ? (
                                                <CheckCircle2 className="w-5 h-5 text-blue-600/50" />
                                            ) : (
                                                <ChevronRight className="w-5 h-5 text-gray-600 group-hover:text-white transition-colors" />
                                            )}
                                        </div>
                                    </div>
                                );
                            }) : (
                                <div className="py-12 flex flex-col items-center justify-center bg-[#0a0a0c] rounded-2xl border border-white/5 border-dashed mt-2">
                                    <Clock className="w-10 h-10 text-gray-700 mb-3" />
                                    <p className="text-gray-500 font-bold text-[10px] uppercase tracking-widest">Nenhum capítulo lançado ainda.</p>
                                </div>
                            )}
                        </div>
                    )}

                    {/* TAB: SOBRE */}
                    {activeTab === 'Sobre' && (
                        <div className="bg-[#0a0a0c] border border-white/5 p-6 rounded-2xl space-y-6 mt-2">
                            <div>
                                <h3 className="text-[10px] font-black text-gray-500 uppercase tracking-widest mb-3 flex items-center gap-2">
                                    <Info className="w-3 h-3" /> Gêneros
                                </h3>
                                <div className="flex flex-wrap gap-2">
                                    {manga.genres && manga.genres.length > 0 ? manga.genres.map((genre, i) => (
                                        <span key={i} className="bg-[#111] border border-white/10 text-gray-300 text-[10px] font-bold px-3 py-1.5 rounded-lg uppercase tracking-widest">
                                            {genre}
                                        </span>
                                    )) : (
                                        <span className="text-gray-600 text-[10px] uppercase">Não especificado</span>
                                    )}
                                </div>
                            </div>

                            <div>
                                <h3 className="text-[10px] font-black text-gray-500 uppercase tracking-widest mb-1">Autor / Artista</h3>
                                <p className="text-sm font-bold text-gray-200">{manga.author || "Desconhecido"}</p>
                            </div>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}
