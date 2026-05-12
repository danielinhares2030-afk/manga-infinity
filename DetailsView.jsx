import React, { useState, useEffect, useMemo } from 'react';
import { 
    ChevronLeft, Share2, Heart, Download, BookOpen, Eye, EyeOff, 
    Search, Star, Clock, ChevronDown, ChevronUp, MoreHorizontal, 
    ListFilter, Flame, Play
} from 'lucide-react';
import { doc, updateDoc, setDoc, deleteDoc, increment } from "firebase/firestore";
import { APP_ID } from './constants';
import { CommentsSection } from './CommentsSection';
import { timeAgo } from './helpers';

export default function DetailsView({ manga, libraryData, historyData, user, userProfileData, onBack, onChapterClick, onRequireLogin, showToast, db }) {
    const [detailsTab, setDetailsTab] = useState('capitulos'); 
    const [sortOrder, setSortOrder] = useState('desc');
    const [chapterSearch, setChapterSearch] = useState('');
    const [isSynopsisExpanded, setIsSynopsisExpanded] = useState(false);

    // ==========================================
    // LÓGICA DE BANCO DE DADOS E ESTADOS
    // ==========================================

    useEffect(() => {
        if (!manga?.id) return;
        const addView = async () => {
            const sessionKey = `viewed_${manga.id}`;
            if (!sessionStorage.getItem(sessionKey)) {
                try {
                    const mangaRef = doc(db, 'obras', manga.id);
                    await updateDoc(mangaRef, { views: increment(1) });
                    sessionStorage.setItem(sessionKey, 'true');
                } catch (error) {
                    console.error("Erro ao registrar visualização", error);
                }
            }
        };
        addView();
    }, [manga?.id, db]);

    const userLibDoc = libraryData && libraryData[manga.id];
    const isFavorite = userLibDoc?.isFavorite || false;

    const toggleFavorite = async () => {
        if (!user) return onRequireLogin();
        try {
            const ref = doc(db, 'artifacts', APP_ID, 'users', user.uid, 'library', manga.id.toString());
            if (isFavorite) {
                await setDoc(ref, { isFavorite: false, updatedAt: Date.now() }, { merge: true });
                showToast("Removido dos favoritos.", "info");
            } else {
                await setDoc(ref, { mangaId: manga.id, isFavorite: true, updatedAt: Date.now() }, { merge: true });
                showToast("Adicionado aos favoritos! ❤️", "success");
            }
        } catch (error) { showToast("Erro ao favoritar.", "error"); }
    };

    const handleShare = () => {
        navigator.clipboard.writeText(window.location.href);
        showToast("Link copiado! Compartilhe a obra.", "success");
    };

    const handleDownloadManga = () => {
        showToast("Iniciando download da obra...", "info");
        // Lógica futura de download (PDF/CBZ)
    };

    const toggleChapterRead = async (chapter, isRead) => {
        if (!user) return showToast("Faça login para gerenciar a leitura", "warning");
        try {
            const ref = doc(db, 'artifacts', APP_ID, 'users', user.uid, 'history', `${manga.id}_${chapter.id}`);
            if (isRead) {
                await deleteDoc(ref);
                showToast(`Capítulo ${chapter.number} marcado como não lido`, "info");
            } else {
                await setDoc(ref, { mangaId: manga.id, mangaTitle: manga.title, chapterNumber: chapter.number, timestamp: Date.now(), id: `${manga.id}_${chapter.id}` });
                showToast(`Capítulo ${chapter.number} marcado como lido`, "success");
            }
        } catch(e) { showToast("Erro ao atualizar status", "error"); }
    };

    // ==========================================
    // ORGANIZAÇÃO DE CAPÍTULOS
    // ==========================================
    const mangaHistory = (historyData || []).filter(h => h.mangaId === manga.id);
    const lastRead = mangaHistory.length > 0 ? mangaHistory[0] : null;
    const chapters = manga?.chapters || [];
    const firstChapter = chapters.length > 0 ? chapters[chapters.length - 1] : null;
    const nextChapterToRead = lastRead ? chapters.find(c => Number(c.number) === Number(lastRead.chapterNumber) + 1) || chapters.find(c => c.id === lastRead.id) : firstChapter;

    const filteredAndSortedChapters = useMemo(() => {
        let result = [...chapters];
        if (chapterSearch.trim() !== '') {
            result = result.filter(c => c.number.toString().includes(chapterSearch) || (c.title && c.title.toLowerCase().includes(chapterSearch.toLowerCase())));
        }
        return result.sort((a, b) => sortOrder === 'desc' ? b.number - a.number : a.number - b.number);
    }, [chapters, chapterSearch, sortOrder]);

    if (!manga) return null;

    // ==========================================
    // RENDERIZAÇÃO DA INTERFACE (TEMA SOMBRIO)
    // ==========================================
    return (
        <div className="min-h-screen bg-[#0E0B0B] text-[#F4F3EE] font-sans pb-24 relative overflow-x-hidden selection:bg-[#C6401E]/40">
            
            {/* BACKGROUND BLEND COM MÁSCARA */}
            <div className="absolute top-0 left-0 w-full h-[60vh] opacity-20 pointer-events-none">
                <div className="absolute inset-0 bg-gradient-to-b from-transparent via-[#0E0B0B]/80 to-[#0E0B0B] z-10"></div>
                <img src={manga.coverUrl} className="w-full h-full object-cover object-top filter blur-3xl scale-110" alt="bg" />
            </div>

            {/* HEADER FLUTUANTE */}
            <div className="sticky top-0 left-0 w-full z-50 bg-[#0E0B0B]/80 backdrop-blur-xl border-b border-white/5 transition-all duration-300">
                <div className="max-w-6xl mx-auto px-4 md:px-8 h-16 flex justify-between items-center">
                    <button onClick={onBack} className="flex items-center gap-2 w-10 h-10 rounded-full hover:bg-white/10 transition-colors text-[#F4F3EE] focus:outline-none focus:ring-2 focus:ring-[#C6401E]">
                        <ChevronLeft className="w-6 h-6 mx-auto" />
                    </button>

                    <span className="font-black tracking-widest uppercase text-sm hidden md:block text-[#F4F3EE]">
                        Manga <span className="text-[#C6401E]">Inferia</span>
                    </span>

                    <div className="flex items-center gap-2">
                        <button onClick={handleShare} className="w-10 h-10 rounded-full flex items-center justify-center hover:bg-white/10 transition-colors text-gray-400 hover:text-[#F4F3EE] focus:outline-none focus:ring-2 focus:ring-[#C6401E]" aria-label="Compartilhar">
                            <Share2 className="w-4 h-4" />
                        </button>
                        <button onClick={handleDownloadManga} className="w-10 h-10 rounded-full flex items-center justify-center hover:bg-white/10 transition-colors text-gray-400 hover:text-[#F4F3EE] focus:outline-none focus:ring-2 focus:ring-[#C6401E]" aria-label="Baixar Obra">
                            <Download className="w-5 h-5" />
                        </button>
                    </div>
                </div>
            </div>

            <div className="max-w-6xl mx-auto px-4 md:px-8 pt-8 relative z-10">
                
                {/* ÁREA HERO: CAPA E INFO */}
                <div className="flex flex-col md:flex-row gap-8 md:gap-12 mb-12 items-center md:items-start">
                    
                    {/* COLUNA ESQUERDA: CAPA */}
                    <div className="w-[200px] md:w-[280px] flex-shrink-0 relative group perspective-1000">
                        <div className="absolute -inset-4 bg-[#C6401E]/20 rounded-3xl blur-xl opacity-0 group-hover:opacity-100 transition-opacity duration-700 pointer-events-none"></div>
                        
                        {/* Selo de Status */}
                        <div className="absolute -top-3 -left-3 z-20 bg-[#F1A822] text-[#0E0B0B] text-[10px] font-black px-3 py-1.5 rounded-lg uppercase tracking-widest shadow-[0_5px_15px_rgba(241,168,34,0.4)]">
                            {manga.status || 'Em Lançamento'}
                        </div>

                        <div className="relative aspect-[2/3] rounded-xl overflow-hidden shadow-[0_20px_50px_rgba(0,0,0,0.8)] border border-white/10 bg-[#151212] transition-transform duration-500 group-hover:scale-[1.02]">
                            <img src={manga.coverUrl} alt={`Capa de ${manga.title}`} className="w-full h-full object-cover" />
                        </div>
                    </div>

                    {/* COLUNA DIREITA: INFORMAÇÕES */}
                    <div className="flex-1 flex flex-col justify-center text-center md:text-left">
                        
                        <h1 className="text-3xl md:text-5xl font-black text-[#F4F3EE] leading-tight mb-2 tracking-tight">
                            {manga.title || 'Título Desconhecido'}
                        </h1>
                        
                        <p className="text-[#C6401E] font-bold text-sm md:text-base mb-6 tracking-wide flex items-center justify-center md:justify-start gap-2">
                            {manga.author || 'Autor Anônimo'} <span className="w-1.5 h-1.5 rounded-full bg-[#F1A822]"></span> <span className="text-gray-400">{manga.type || 'Mangá'}</span>
                        </p>

                        {/* Estatísticas */}
                        <div className="flex flex-wrap items-center justify-center md:justify-start gap-6 mb-6 text-sm text-gray-400 font-medium">
                            <div className="flex items-center gap-2">
                                <Star className="w-4 h-4 text-[#F1A822] fill-[#F1A822]" />
                                <span className="text-[#F4F3EE]">{Number(manga?.rating || 5.0).toFixed(1)}</span>
                            </div>
                            <div className="flex items-center gap-2">
                                <Eye className="w-4 h-4 text-gray-500" />
                                <span>{manga.views || 0} visualizações</span>
                            </div>
                            <div className="flex items-center gap-2">
                                <BookOpen className="w-4 h-4 text-gray-500" />
                                <span>{chapters.length} Capítulos</span>
                            </div>
                        </div>

                        {/* Tags de Gênero */}
                        <div className="flex flex-wrap justify-center md:justify-start gap-2 mb-6">
                            {(manga.genres || ['Ação', 'Fantasia']).map(g => (
                                <span key={g} className="px-3 py-1 rounded-md text-[10px] font-bold text-gray-300 bg-white/5 border border-white/10 hover:border-[#C6401E]/50 transition-colors cursor-default uppercase tracking-widest">
                                    {g}
                                </span>
                            ))}
                        </div>

                        {/* Sinopse Colapsável */}
                        <div className="text-gray-400 text-sm leading-relaxed mb-8 bg-[#151212] p-4 rounded-xl border border-white/5 relative">
                            <p className={`whitespace-pre-wrap ${!isSynopsisExpanded ? 'line-clamp-3' : ''}`}>
                                {manga.synopsis || "Os registros akáshicos ainda não decifraram os mistérios desta obra."}
                            </p>
                            <button 
                                onClick={() => setIsSynopsisExpanded(!isSynopsisExpanded)}
                                className="text-[#C6401E] text-xs font-bold uppercase tracking-widest mt-2 flex items-center gap-1 hover:text-[#F1A822] transition-colors focus:outline-none focus:ring-2 focus:ring-[#C6401E] rounded-md px-1"
                            >
                                {isSynopsisExpanded ? 'Ler Menos' : 'Ler Mais'} 
                                {isSynopsisExpanded ? <ChevronUp className="w-3 h-3" /> : <ChevronDown className="w-3 h-3" />}
                            </button>
                        </div>

                        {/* Botões Principais de Ação */}
                        <div className="flex flex-col sm:flex-row items-center gap-4">
                            <button 
                                onClick={() => nextChapterToRead ? onChapterClick(manga, nextChapterToRead) : showToast("Nenhum capítulo disponível", "warning")} 
                                className="w-full sm:flex-1 bg-[#C6401E] hover:bg-[#a83416] text-[#F4F3EE] py-4 px-8 rounded-xl flex items-center justify-center gap-3 font-black uppercase tracking-widest text-xs transition-all transform hover:-translate-y-1 shadow-[0_5px_20px_rgba(198,64,30,0.4)] focus:outline-none focus:ring-2 focus:ring-white"
                                aria-label={lastRead ? 'Continuar Leitura' : 'Iniciar Leitura'}
                            >
                                <Play className="w-4 h-4 fill-current" />
                                {lastRead ? 'Continuar Leitura' : 'Iniciar Leitura'}
                            </button>

                            <button 
                                onClick={toggleFavorite} 
                                className={`w-full sm:w-auto h-14 px-6 rounded-xl flex items-center justify-center gap-2 transition-all border font-bold text-xs uppercase tracking-widest focus:outline-none focus:ring-2 focus:ring-[#C6401E] ${isFavorite ? 'bg-[#C6401E]/10 border-[#C6401E] text-[#C6401E]' : 'bg-[#151212] border-white/10 text-gray-400 hover:bg-white/5 hover:text-[#F4F3EE]'}`}
                                aria-label="Favoritar"
                            >
                                <Heart className={`w-4 h-4 ${isFavorite ? 'fill-current' : ''}`} />
                                {isFavorite ? 'Favorito' : 'Salvar'}
                            </button>
                        </div>
                    </div>
                </div>

                {/* ABAS DA PÁGINA */}
                <div className="flex justify-center md:justify-start mb-8 border-b border-white/10">
                    {[
                        { id: 'capitulos', label: 'Capítulos' },
                        { id: 'comentarios', label: 'Comentários e Notas' }
                    ].map(tab => (
                        <button 
                            key={tab.id} 
                            onClick={() => setDetailsTab(tab.id)} 
                            className={`px-6 py-4 text-xs font-black uppercase tracking-widest transition-colors relative focus:outline-none focus:ring-2 focus:ring-inset focus:ring-[#C6401E] ${detailsTab === tab.id ? 'text-[#F4F3EE]' : 'text-gray-500 hover:text-gray-300'}`}
                            role="tab"
                            aria-selected={detailsTab === tab.id}
                        >
                            {tab.label}
                            {detailsTab === tab.id && <div className="absolute bottom-0 left-0 w-full h-[3px] bg-[#C6401E] shadow-[0_-2px_10px_rgba(198,64,30,0.8)]"></div>}
                        </button>
                    ))}
                </div>

                {/* CONTEÚDO DAS ABAS */}
                <div className="w-full pb-10">
                    
                    {/* ABA: CAPÍTULOS */}
                    {detailsTab === 'capitulos' && (
                        <div className="animate-in fade-in slide-in-from-bottom-4 duration-300">
                            
                            {/* CONTROLES DA LISTA (Busca e Filtro) */}
                            <div className="flex flex-col sm:flex-row items-center justify-between gap-4 mb-8 bg-[#151212] p-4 rounded-xl border border-white/5">
                                <div className="relative w-full sm:w-64">
                                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500" />
                                    <input 
                                        type="text" 
                                        placeholder="Buscar capítulo..." 
                                        value={chapterSearch}
                                        onChange={(e) => setChapterSearch(e.target.value)}
                                        className="w-full bg-[#0E0B0B] border border-white/10 rounded-lg py-2.5 pl-10 pr-4 text-xs text-[#F4F3EE] outline-none focus:border-[#C6401E] transition-colors"
                                        aria-label="Buscar capítulo"
                                    />
                                </div>
                                
                                <button 
                                    onClick={() => setSortOrder(prev => prev === 'desc' ? 'asc' : 'desc')} 
                                    className="w-full sm:w-auto flex items-center justify-center gap-2 text-xs font-bold text-gray-300 bg-[#0E0B0B] border border-white/10 px-4 py-2.5 rounded-lg hover:border-[#C6401E] hover:text-[#C6401E] transition-colors focus:outline-none focus:ring-2 focus:ring-[#C6401E]"
                                >
                                    <ListFilter className="w-4 h-4" />
                                    {sortOrder === 'desc' ? 'Mais Recentes' : 'Mais Antigos'}
                                </button>
                            </div>

                            {/* LISTA DE CAPÍTULOS */}
                            <div className="flex flex-col gap-3">
                                {filteredAndSortedChapters.length === 0 ? (
                                    <div className="text-center py-16 bg-[#151212] rounded-xl border border-white/5">
                                        <p className="text-gray-500 font-bold text-xs uppercase tracking-widest">Nenhum capítulo encontrado.</p>
                                    </div>
                                ) : (
                                    filteredAndSortedChapters.map((chapter) => {
                                        const isRead = mangaHistory.some(h => h.chapterNumber === chapter.number);
                                        
                                        return (
                                            <div 
                                                key={chapter.id} 
                                                className={`group flex items-center justify-between p-4 bg-[#151212] border border-white/5 hover:border-[#C6401E]/40 rounded-xl transition-all duration-300 ${isRead ? 'opacity-60' : 'opacity-100'}`}
                                            >
                                                {/* INFORMAÇÕES DO CAPÍTULO (Clicável para ler) */}
                                                <div 
                                                    className="flex-1 flex items-center gap-4 cursor-pointer focus:outline-none"
                                                    onClick={() => onChapterClick(manga, chapter)}
                                                    tabIndex={0}
                                                    role="button"
                                                    onKeyDown={(e) => e.key === 'Enter' && onChapterClick(manga, chapter)}
                                                >
                                                    <div className="flex flex-col gap-1">
                                                        <div className="flex items-center gap-3">
                                                            <span className={`font-black text-sm md:text-base transition-colors ${isRead ? 'text-gray-500' : 'text-[#F4F3EE] group-hover:text-[#C6401E]'}`}>
                                                                Capítulo {chapter.number}
                                                            </span>
                                                            {!isRead && sortOrder === 'desc' && chapter.id === chapters[chapters.length - 1]?.id && (
                                                                <span className="bg-[#F1A822] text-[#0E0B0B] text-[9px] font-black px-2 py-0.5 rounded-sm uppercase tracking-widest">Novo</span>
                                                            )}
                                                        </div>
                                                        <span className="text-xs text-gray-500 flex items-center gap-1">
                                                            <Clock className="w-3 h-3" /> {timeAgo(chapter.rawTime || Date.now())}
                                                        </span>
                                                    </div>
                                                </div>

                                                {/* AÇÕES INDIVIDUAIS DO CAPÍTULO */}
                                                <div className="flex items-center gap-2 pl-4 border-l border-white/5">
                                                    <button 
                                                        onClick={() => handleDownloadManga()}
                                                        className="w-10 h-10 rounded-lg flex items-center justify-center text-gray-500 hover:text-[#F4F3EE] hover:bg-white/5 transition-colors focus:outline-none focus:ring-2 focus:ring-[#C6401E]"
                                                        aria-label="Baixar Capítulo"
                                                        title="Baixar Capítulo"
                                                    >
                                                        <Download className="w-4 h-4" />
                                                    </button>
                                                    <button 
                                                        onClick={() => toggleChapterRead(chapter, isRead)}
                                                        className={`w-10 h-10 rounded-lg flex items-center justify-center transition-colors focus:outline-none focus:ring-2 focus:ring-[#C6401E] ${isRead ? 'text-[#C6401E] bg-[#C6401E]/10' : 'text-gray-500 hover:text-[#F4F3EE] hover:bg-white/5'}`}
                                                        aria-label={isRead ? "Marcar como não lido" : "Marcar como lido"}
                                                        title={isRead ? "Desmarcar lido" : "Marcar lido"}
                                                    >
                                                        {isRead ? <Eye className="w-4 h-4" /> : <EyeOff className="w-4 h-4" />}
                                                    </button>
                                                </div>
                                            </div>
                                        );
                                    })
                                )}
                            </div>
                        </div>
                    )}

                    {/* ABA: COMENTÁRIOS E NOTAS */}
                    {detailsTab === 'comentarios' && (
                        <div className="animate-in fade-in slide-in-from-bottom-4 duration-300 bg-[#151212] border border-white/5 rounded-xl p-4 md:p-8">
                            <CommentsSection mangaId={manga.id} user={user} userProfileData={userProfileData} onRequireLogin={onRequireLogin} showToast={showToast} />
                        </div>
                    )}

                </div>
            </div>
        </div>
    );
}
