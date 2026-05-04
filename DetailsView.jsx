import React, { useState, useEffect } from 'react';
import { ArrowLeft, Star, Play, Library, Share2, BookOpen, CheckCircle, Clock, Zap, ChevronDown, ChevronUp, Users, Bookmark, ChevronRight, MoreHorizontal } from 'lucide-react';
import { doc, updateDoc, setDoc, deleteDoc, increment } from "firebase/firestore";
import { APP_ID } from './constants';
import { CommentsSection } from './CommentsSection';
import { timeAgo } from './helpers';

export default function DetailsView({ manga, libraryData, historyData, user, userProfileData, onBack, onChapterClick, onRequireLogin, showToast, db }) {
    const [isSharing, setIsSharing] = useState(false);
    const [localRating, setLocalRating] = useState(Number(manga?.rating) || 5.0);
    const [detailsTab, setDetailsTab] = useState('capitulos'); 
    const [showLibraryMenu, setShowLibraryMenu] = useState(false); 
    const [expandedSynopsis, setExpandedSynopsis] = useState(false);
    const [animateRating, setAnimateRating] = useState(false); 
    const [sortOrder, setSortOrder] = useState('desc');

    const libraryStatuses = ['Lendo', 'Concluído', 'Pausado', 'Dropado', 'Planejo Ler'];

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

    useEffect(() => { setLocalRating(Number(manga?.rating) || 5.0); }, [manga?.rating]);

    const handleRate = async (ratingValue) => {
        if (!user) return showToast("Apenas usuários conectados podem avaliar.", "warning");
        setAnimateRating(true);
        setTimeout(() => setAnimateRating(false), 600); 

        try {
            const newRating = ((localRating + ratingValue) / 2).toFixed(1);
            const finalRating = Number(newRating);
            setLocalRating(finalRating);
            showToast(`Avaliação de ${ratingValue} estrelas registrada.`, "success");
            const mangaRef = doc(db, 'obras', manga.id);
            await updateDoc(mangaRef, { rating: finalRating });
            if (manga) manga.rating = finalRating; 
        } catch (error) {
            setLocalRating(Number(manga?.rating) || 5.0);
            showToast("Erro de sincronização no sistema.", "error");
        }
    };

    if (!manga) return null;

    const inLibrary = libraryData && libraryData[manga.id];
    
    const updateLibraryStatus = async (status) => {
        if (!user) { onRequireLogin(); return; }
        try {
            const ref = doc(db, 'artifacts', APP_ID, 'users', user.uid, 'library', manga.id.toString());
            if (status === 'Remover') {
                await deleteDoc(ref); showToast("Removido da biblioteca.", "info");
            } else {
                await setDoc(ref, { mangaId: manga.id, status: status, updatedAt: Date.now() }); showToast(`Salvo como: ${status}`, "success");
            }
            setShowLibraryMenu(false);
        } catch (error) { showToast("Erro ao atualizar biblioteca.", "error"); }
    };

    const handleShare = () => {
        setIsSharing(true); navigator.clipboard.writeText(window.location.href);
        showToast("Link copiado para a área de transferência!", "success"); setTimeout(() => setIsSharing(false), 2000);
        setShowLibraryMenu(false);
    };

    const mangaHistory = (historyData || []).filter(h => h.mangaId === manga.id);
    const lastRead = mangaHistory.length > 0 ? mangaHistory[0] : null;
    const chapters = manga.chapters || [];
    const firstChapter = chapters.length > 0 ? chapters[chapters.length - 1] : null;
    const nextChapterToRead = lastRead ? chapters.find(c => Number(c.number) === Number(lastRead.chapterNumber) + 1) || chapters.find(c => c.id === lastRead.id) : firstChapter;

    const sortedChapters = [...chapters].sort((a, b) => {
        return sortOrder === 'desc' ? b.number - a.number : a.number - b.number;
    });

    const getRatingLabel = (rate) => {
        if(rate >= 4.8) return "OBRA-PRIMA";
        if(rate >= 4.0) return "EXCELENTE";
        if(rate >= 3.0) return "MUITO BOM";
        if(rate >= 2.0) return "BOM";
        if(rate >= 1.0) return "MEDÍOCRE";
        return "RUIM";
    };

    const formatReaders = (num) => {
        if (!num) return '0';
        return num >= 1000 ? (num / 1000).toFixed(1) + 'K' : num.toString();
    };
    
    const realReaders = formatReaders(manga.views || manga.leitores || 0);

    return (
        <div className="min-h-screen bg-[#000000] text-gray-200 font-sans pb-24 animate-in fade-in duration-300 relative">
            
            {/* HEADER FIXO - IDÊNTICO À IMAGEM */}
            <div className="sticky top-0 z-50 bg-[#000000]/90 backdrop-blur-md px-4 py-4 flex items-center justify-between">
                <button onClick={onBack} className="p-1.5 hover:bg-white/10 rounded-full transition-colors">
                    <ChevronLeft className="w-7 h-7 text-white" />
                </button>
                <div className="relative">
                    <button onClick={() => setShowLibraryMenu(!showLibraryMenu)} className="p-1.5 hover:bg-white/10 rounded-full transition-colors">
                        <MoreHorizontal className="w-7 h-7 text-white" />
                    </button>
                    {/* MENU DE BIBLIOTECA ACOPLADO AO MORE */}
                    {showLibraryMenu && (
                        <div className="absolute top-full right-0 mt-2 w-48 bg-[#111] border border-gray-800 rounded-xl shadow-2xl z-50 overflow-hidden animate-in fade-in zoom-in-95">
                            {libraryStatuses.map(status => (
                                <button key={status} onClick={() => updateLibraryStatus(status)} className="w-full text-left px-4 py-3 text-xs font-bold text-gray-300 hover:bg-gray-800 transition-colors">
                                    {status}
                                </button>
                            ))}
                            {inLibrary && (
                                <button onClick={() => updateLibraryStatus('Remover')} className="w-full text-left px-4 py-3 text-xs font-bold text-red-500 hover:bg-gray-800 border-t border-gray-800 transition-colors">
                                    Remover
                                </button>
                            )}
                            <button onClick={handleShare} className="w-full text-left px-4 py-3 text-xs font-bold text-blue-400 hover:bg-gray-800 border-t border-gray-800 transition-colors flex items-center gap-2">
                                <Share2 className="w-4 h-4"/> Compartilhar
                            </button>
                        </div>
                    )}
                </div>
            </div>

            <div className="max-w-5xl mx-auto px-4 pt-4 relative z-10">
                
                {/* TOPO: CAPA E INFORMAÇÕES - IDÊNTICO À IMAGEM */}
                <div className="flex gap-4 mb-8">
                    <div className="w-[120px] sm:w-[140px] flex-shrink-0">
                        <div className="aspect-[3/4] rounded-xl overflow-hidden bg-[#111] shadow-[0_4px_15px_rgba(0,0,0,0.8)]">
                            <img src={manga.coverUrl} alt={manga.title} className="w-full h-full object-cover" />
                        </div>
                    </div>
                    
                    <div className="flex flex-col justify-center">
                        {/* Tags de Gênero Baseado no Banco */}
                        <div className="flex flex-wrap gap-2 mb-3">
                            {manga.genres?.slice(0, 3).map(g => (
                                <span key={g} className="px-2.5 py-1 rounded text-[10px] text-gray-300 border border-gray-700 bg-transparent">
                                    {g}
                                </span>
                            ))}
                        </div>
                        {/* Status */}
                        <div className="mb-2">
                            <span className="px-2.5 py-1 rounded text-[10px] text-white bg-red-600 font-medium">
                                {manga.status || 'Em Lançamento'}
                            </span>
                        </div>
                    </div>
                </div>

                {/* SISTEMA DE AVALIAÇÃO - FUNÇÕES ORIGINAIS + VISUAL DA FOTO */}
                <div className="flex items-center gap-6 mb-6">
                    <div className="flex flex-col items-center">
                        <div className="flex items-center gap-2">
                            <Star className={`w-8 h-8 transition-transform duration-300 ${animateRating ? 'scale-125' : ''} text-yellow-500 fill-yellow-500`} />
                            <span className="text-4xl font-bold text-white">{localRating.toFixed(1)}</span>
                        </div>
                        <span className="text-[10px] text-gray-500 mt-1">{realReaders} avaliações</span>
                    </div>
                    
                    <div className="flex-1 flex flex-col gap-1.5">
                        {[5, 4, 3, 2, 1].map(star => {
                            const diff = Math.max(0, 1 - Math.abs(localRating - star));
                            const widthPct = star <= localRating ? (star === Math.floor(localRating) ? 100 : 80 - (5-star)*10) : diff * 100;
                            
                            return (
                                <div key={star} onClick={() => handleRate(star)} className="flex items-center gap-2 text-[10px] text-gray-400 cursor-pointer group">
                                    <span className="w-2">{star}</span>
                                    <Star className={`w-2.5 h-2.5 transition-colors ${localRating >= star ? 'text-yellow-500 fill-yellow-500' : 'text-gray-700 group-hover:text-yellow-500'}`} />
                                    <div className="flex-1 h-1.5 bg-gray-800 rounded-full overflow-hidden">
                                        <div className="h-full bg-yellow-500 rounded-full transition-all duration-500" style={{width: `${widthPct}%`}}></div>
                                    </div>
                                    <span className="w-8 text-right opacity-0 group-hover:opacity-100 transition-opacity text-yellow-500">Avaliar</span>
                                </div>
                            )
                        })}
                    </div>
                </div>

                {/* SINOPSE */}
                <div className="mb-6">
                    <p className={`text-[13px] text-gray-300 leading-relaxed font-medium ${expandedSynopsis ? '' : 'line-clamp-2'}`}>
                        {manga.synopsis || "Os dados do sistema ainda não decifraram os mistérios desta obra."}
                    </p>
                    {manga.synopsis && manga.synopsis.length > 100 && (
                        <button onClick={() => setExpandedSynopsis(!expandedSynopsis)} className="w-full flex justify-center py-2 text-gray-500 hover:text-white transition-colors">
                            {expandedSynopsis ? <ChevronUp className="w-5 h-5" /> : <ChevronDown className="w-5 h-5" />}
                        </button>
                    )}
                </div>

                {/* BOTÃO LER AGORA */}
                <div className="mb-8">
                    <button onClick={() => nextChapterToRead ? onChapterClick(manga, nextChapterToRead) : showToast("Nenhum capítulo disponível", "warning")} className="w-full bg-[#111] border border-gray-800 hover:border-red-600/50 text-white font-bold py-4 rounded-xl flex items-center justify-center gap-3 transition-all">
                        <BookOpen className="w-5 h-5 text-red-500" />
                        <span className="text-sm tracking-widest">{lastRead ? 'CONTINUAR LEITURA' : 'LER AGORA'}</span>
                    </button>
                </div>

                {/* ABAS */}
                <div className="flex border-b border-gray-800 mb-4">
                    <button onClick={() => setDetailsTab('sobre')} className={`flex-1 pb-3 text-[13px] font-medium transition-colors relative ${detailsTab === 'sobre' ? 'text-white' : 'text-gray-500 hover:text-gray-300'}`}>
                        Sobre
                        {detailsTab === 'sobre' && <div className="absolute bottom-0 left-0 w-full h-[2px] bg-red-600"></div>}
                    </button>
                    <button onClick={() => setDetailsTab('capitulos')} className={`flex-1 pb-3 text-[13px] font-medium transition-colors relative ${detailsTab === 'capitulos' ? 'text-white' : 'text-gray-500 hover:text-gray-300'}`}>
                        Capítulos
                        {detailsTab === 'capitulos' && <div className="absolute bottom-0 left-0 w-full h-[2px] bg-red-600"></div>}
                    </button>
                    <button onClick={() => setDetailsTab('comentarios')} className={`flex-1 pb-3 text-[13px] font-medium transition-colors relative flex items-center justify-center gap-1 ${detailsTab === 'comentarios' ? 'text-white' : 'text-gray-500 hover:text-gray-300'}`}>
                        Comentários
                        {detailsTab === 'comentarios' && <div className="absolute bottom-0 left-0 w-full h-[2px] bg-red-600"></div>}
                    </button>
                </div>

                {/* CONTEÚDO DAS ABAS */}
                <div className="w-full">
                    
                    {detailsTab === 'sobre' && (
                        <div className="animate-in slide-in-from-left-4 duration-300 py-4">
                            <h3 className="text-white font-bold mb-4">Detalhes da Obra</h3>
                            <div className="bg-[#111] rounded-xl p-4 flex flex-col gap-3">
                                <div className="flex justify-between border-b border-gray-800 pb-2"><span className="text-gray-500 text-xs">Leitores</span><span className="text-white text-xs font-bold">{realReaders}</span></div>
                                <div className="flex justify-between border-b border-gray-800 pb-2"><span className="text-gray-500 text-xs">Capítulos Totais</span><span className="text-white text-xs font-bold">{chapters.length}</span></div>
                                <div className="flex justify-between"><span className="text-gray-500 text-xs">Classificação</span><span className="text-white text-xs font-bold">{getRatingLabel(localRating)}</span></div>
                            </div>
                        </div>
                    )}

                    {detailsTab === 'capitulos' && (
                        <div className="animate-in slide-in-from-left-4 duration-300">
                            {/* Header da lista de capítulos */}
                            <div className="flex items-center justify-between mb-4">
                                <h3 className="text-[15px] font-bold text-white">
                                    Capítulos <span className="text-red-600 ml-1">{chapters.length}</span>
                                </h3>
                                <button onClick={() => setSortOrder(prev => prev === 'desc' ? 'asc' : 'desc')} className="text-[11px] text-gray-400 flex items-center gap-1 hover:text-white transition-colors">
                                    {sortOrder === 'desc' ? 'Mais recentes' : 'Mais antigos'} <ChevronDown className="w-4 h-4" />
                                </button>
                            </div>

                            {/* Lista de Capítulos */}
                            <div className="flex flex-col gap-2.5">
                                {chapters.length === 0 ? (
                                    <div className="text-center py-16 bg-[#111] rounded-xl"><BookOpen className="w-8 h-8 text-gray-700 mx-auto mb-3" /><p className="text-gray-500 font-bold text-xs">Nenhum capítulo publicado.</p></div>
                                ) : (
                                    sortedChapters.map((chapter, index) => {
                                        const isRead = mangaHistory.some(h => h.chapterNumber === chapter.number);
                                        const isNew = index === 0 && sortOrder === 'desc';

                                        return (
                                            <div key={chapter.id} onClick={() => onChapterClick(manga, chapter)} className="bg-[#111] hover:bg-[#1a1a1a] rounded-xl p-4 flex items-center justify-between cursor-pointer transition-colors group">
                                                <div className="flex items-start gap-3">
                                                    {/* Ponto Vermelho (Não lido) */}
                                                    <div className={`mt-2 w-1.5 h-1.5 rounded-full flex-shrink-0 ${!isRead ? 'bg-red-600' : 'bg-transparent'}`}></div>
                                                    
                                                    <div>
                                                        <div className="flex items-center gap-2 mb-1">
                                                            <h4 className={`text-[13px] font-bold ${isRead ? 'text-gray-500' : 'text-white'}`}>Capítulo {chapter.number}</h4>
                                                            {isNew && <span className="bg-red-600 text-white text-[8px] font-black px-1.5 py-0.5 rounded-sm uppercase">Novo</span>}
                                                        </div>
                                                        <p className="text-[11px] text-gray-400 mb-1 line-clamp-1">{manga.title} - Cap {chapter.number}</p>
                                                        <p className="text-[10px] text-gray-600">{timeAgo(chapter.rawTime || Date.now())}</p>
                                                    </div>
                                                </div>
                                                
                                                <Bookmark className={`w-5 h-5 ${isRead ? 'text-gray-700' : 'text-gray-400 group-hover:text-white'}`} />
                                            </div>
                                        );
                                    })
                                )}
                            </div>
                        </div>
                    )}

                    {detailsTab === 'comentarios' && (
                        <div className="animate-in slide-in-from-right-4 duration-300 pt-2">
                            <CommentsSection mangaId={manga.id} user={user} userProfileData={userProfileData} onRequireLogin={onRequireLogin} showToast={showToast} />
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}
