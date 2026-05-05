import React, { useState, useEffect } from 'react';
// IMPORTAÇÃO CORRIGIDA COM TODOS OS ÍCONES AQUI:
import { ArrowLeft, ChevronLeft, Star, Play, Library, Share2, BookOpen, CheckCircle, Clock, Zap, ChevronDown, ChevronUp, Users, Bookmark, ChevronRight, MoreHorizontal, MessageSquare } from 'lucide-react';
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

    // Lógica Original de Visualização
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

    // Lógica Original de Avaliação
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

    // Lógica Original da Biblioteca
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

    // Lógica Original de Histórico e Capítulos
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
    const displayGenre = manga.genres && manga.genres.length > 0 ? manga.genres.slice(0, 3) : ['Ação', 'Fantasia'];

    return (
        <div className="min-h-screen bg-[#07050A] text-gray-200 font-sans pb-24 animate-in fade-in duration-500 relative overflow-x-hidden">
            
            {/* BACKGROUND BLEND (IMAGEM AO FUNDO) */}
            <div className="absolute top-0 right-0 w-full md:w-3/4 h-[500px] opacity-20 mix-blend-screen pointer-events-none" style={{ maskImage: 'linear-gradient(to bottom, black, transparent)', WebkitMaskImage: '-webkit-linear-gradient(top, black, transparent)' }}>
                <img src={manga.coverUrl} className="w-full h-full object-cover object-top filter blur-sm" alt="bg" />
                <div className="absolute inset-0 bg-gradient-to-r from-[#07050A] via-transparent to-transparent"></div>
            </div>

            {/* HEADER FIXO TOPO */}
            <div className="sticky top-0 left-0 w-full p-4 md:p-6 z-50 flex justify-between items-center bg-gradient-to-b from-[#07050A]/90 to-transparent backdrop-blur-[2px]">
                <button onClick={onBack} className="flex items-center gap-2 text-white hover:text-purple-400 transition-colors">
                    <ChevronLeft className="w-6 h-6" />
                    <span className="font-bold text-sm hidden md:block">Voltar</span>
                </button>

                <div className="flex items-center gap-3">
                    <div className="relative">
                        <button onClick={() => setShowLibraryMenu(!showLibraryMenu)} className="w-10 h-10 rounded-full border border-white/10 bg-[#111]/50 backdrop-blur-md flex items-center justify-center hover:border-purple-500 transition-colors">
                            <Bookmark className={`w-4 h-4 ${inLibrary ? 'text-purple-500 fill-purple-500' : 'text-gray-300'}`} />
                        </button>
                        {showLibraryMenu && (
                            <div className="absolute right-0 top-full mt-2 w-48 bg-[#0F0D14] border border-purple-900/50 rounded-xl shadow-2xl z-50 overflow-hidden animate-in fade-in zoom-in-95">
                                <div className="px-4 py-2 bg-purple-900/20 border-b border-white/5 text-[10px] font-black text-purple-400 uppercase tracking-widest">Adicionar à Biblioteca</div>
                                {libraryStatuses.map(status => (
                                    <button key={status} onClick={() => updateLibraryStatus(status)} className="w-full text-left px-4 py-3 text-xs font-bold text-gray-300 hover:bg-white/5 transition-colors">
                                        {status}
                                    </button>
                                ))}
                                {inLibrary && (
                                    <button onClick={() => updateLibraryStatus('Remover')} className="w-full text-left px-4 py-3 text-xs font-bold text-red-400 hover:bg-white/5 border-t border-white/5 transition-colors">
                                        Remover
                                    </button>
                                )}
                            </div>
                        )}
                    </div>
                    <button onClick={handleShare} className="w-10 h-10 rounded-full border border-white/10 bg-[#111]/50 backdrop-blur-md flex items-center justify-center hover:border-purple-500 transition-colors">
                        <Share2 className="w-4 h-4 text-gray-300" />
                    </button>
                    <button className="w-10 h-10 rounded-full border border-white/10 bg-[#111]/50 backdrop-blur-md flex items-center justify-center hover:border-purple-500 transition-colors">
                        <MoreHorizontal className="w-5 h-5 text-gray-300" />
                    </button>
                </div>
            </div>

            <div className="max-w-5xl mx-auto px-4 sm:px-6 pt-6 relative z-10">
                
                {/* ÁREA HERO (Capa e Infos) */}
                <div className="flex flex-col md:flex-row gap-6 md:gap-10 mb-10">
                    
                    {/* CAPA ESQUERDA */}
                    <div className="w-[160px] md:w-[240px] flex-shrink-0 mx-auto md:mx-0 relative">
                        <div className="absolute -inset-1 bg-purple-600/20 blur-[20px] rounded-2xl pointer-events-none"></div>
                        <div className="relative aspect-[2/3] rounded-xl overflow-hidden shadow-[0_10px_30px_rgba(0,0,0,0.8)] border border-white/10 bg-[#111]">
                            <img src={manga.coverUrl} alt={manga.title} className="w-full h-full object-cover" />
                            <div className="absolute top-0 left-0 bg-purple-600/90 backdrop-blur-sm px-3 py-1 text-[9px] font-black text-white uppercase tracking-widest rounded-br-lg">
                                MANGA
                            </div>
                        </div>
                    </div>

                    {/* INFOS DIREITA */}
                    <div className="flex-1 flex flex-col justify-center text-center md:text-left">
                        <h1 className="text-3xl md:text-5xl font-bold text-white leading-tight mb-2 drop-shadow-md">
                            {manga.title || 'Sem Título'}
                        </h1>
                        <p className="text-gray-400 font-medium text-sm mb-4">
                            {manga.author || 'Autor Desconhecido'} • {manga.studio || 'Nexo Studio'}
                        </p>
                        
                        {/* Tags */}
                        <div className="flex flex-wrap justify-center md:justify-start gap-2 mb-6">
                            {displayGenre.map(g => (
                                <span key={g} className="px-3 py-1 rounded-full text-[10px] font-bold text-purple-300 bg-purple-900/30 border border-purple-800/50">
                                    {g}
                                </span>
                            ))}
                        </div>

                        {/* Sinopse */}
                        <div className="text-gray-300 text-sm leading-relaxed mb-6 font-medium max-w-2xl">
                            <p className={`whitespace-pre-wrap ${expandedSynopsis ? '' : 'line-clamp-3'}`}>
                                {manga.synopsis || "Os dados do sistema ainda não decifraram os mistérios desta obra."}
                            </p>
                            {manga.synopsis && manga.synopsis.length > 150 && (
                                <button onClick={() => setExpandedSynopsis(!expandedSynopsis)} className="mt-2 text-[11px] font-bold text-purple-400 hover:text-purple-300 transition-colors">
                                    {expandedSynopsis ? 'Ver menos' : 'Ver mais...'}
                                </button>
                            )}
                        </div>

                        {/* Estatísticas e Botão */}
                        <div className="flex flex-wrap items-center justify-center md:justify-start gap-6 md:gap-8 mb-6">
                            <div className="flex items-center gap-1.5">
                                <Star className="w-4 h-4 text-yellow-500 fill-yellow-500 drop-shadow-[0_0_8px_rgba(234,179,8,0.5)]" />
                                <span className="font-bold text-white">{localRating.toFixed(1)}</span>
                            </div>
                            <div className="text-sm font-medium text-gray-400">
                                Lançamento • {manga.status || 'Atual'}
                            </div>
                            <div className="flex items-center gap-1.5 text-sm font-medium text-gray-400">
                                <BookOpen className="w-4 h-4" />
                                {chapters.length} Capítulos
                            </div>
                        </div>

                        <div className="flex flex-col sm:flex-row items-center gap-4">
                            <button onClick={() => nextChapterToRead ? onChapterClick(manga, nextChapterToRead) : showToast("Nenhum capítulo disponível", "warning")} className="w-full sm:w-auto bg-gradient-to-r from-purple-700 to-indigo-600 hover:brightness-110 border border-purple-500/50 text-white font-bold py-3.5 px-8 rounded-full flex items-center justify-center gap-3 transition-all shadow-[0_0_20px_rgba(109,40,217,0.4)] group">
                                <BookOpen className="w-5 h-5 text-white/80" />
                                <div className="flex flex-col items-start leading-none text-left">
                                    <span className="text-sm">{lastRead ? 'Continuar lendo' : 'Ler Agora'}</span>
                                    {nextChapterToRead && <span className="text-[10px] text-purple-200 mt-0.5 font-normal">Capítulo {nextChapterToRead.number}</span>}
                                </div>
                            </button>
                        </div>
                    </div>
                </div>

                {/* SISTEMA DE AVALIAÇÃO ORIGINAL (Mantido abaixo da capa) */}
                <div className="flex items-center gap-4 mb-8 bg-[#0F0D14] p-4 rounded-2xl border border-white/5">
                    <span className="text-xs font-bold text-gray-400 uppercase tracking-widest">Sua Avaliação:</span>
                    <div className="flex items-center gap-1.5">
                        {[1, 2, 3, 4, 5].map((starVal) => (
                            <button key={starVal} onClick={() => handleRate(starVal)} className="focus:outline-none hover:scale-125 transition-transform px-0.5">
                                <Star className={`w-6 h-6 transition-all duration-300 ${animateRating && starVal <= Math.round(localRating) ? 'animate-bounce text-purple-400 fill-purple-400 scale-125' : starVal <= Math.round(localRating) ? 'text-purple-500 fill-purple-500 drop-shadow-[0_0_8px_rgba(168,85,247,0.6)]' : 'text-gray-700'}`} />
                            </button>
                        ))}
                    </div>
                    <span className="text-[10px] font-bold text-purple-400 bg-purple-900/20 px-2 py-1 rounded ml-auto">
                        {getRatingLabel(localRating)}
                    </span>
                </div>

                {/* ABAS (CAPÍTULOS E COMENTÁRIOS) */}
                <div className="flex border-b border-white/10 mb-6">
                    <button onClick={() => setDetailsTab('capitulos')} className={`flex items-center gap-2 pb-3 px-4 text-sm font-bold transition-all relative ${detailsTab === 'capitulos' ? 'text-white' : 'text-gray-500 hover:text-gray-300'}`}>
                        <BookOpen className="w-4 h-4" /> Capítulos
                        {detailsTab === 'capitulos' && <div className="absolute bottom-0 left-0 w-full h-[2px] bg-purple-500 shadow-[0_0_10px_rgba(168,85,247,0.8)]"></div>}
                    </button>
                    <button onClick={() => setDetailsTab('comentarios')} className={`flex items-center gap-2 pb-3 px-4 text-sm font-bold transition-all relative ${detailsTab === 'comentarios' ? 'text-white' : 'text-gray-500 hover:text-gray-300'}`}>
                        <MessageSquare className="w-4 h-4" /> Comentários
                        {detailsTab === 'comentarios' && <div className="absolute bottom-0 left-0 w-full h-[2px] bg-purple-500 shadow-[0_0_10px_rgba(168,85,247,0.8)]"></div>}
                    </button>
                </div>

                {/* CONTEÚDO DAS ABAS */}
                <div className="w-full pb-10">
                    
                    {detailsTab === 'capitulos' && (
                        <div className="animate-in slide-in-from-left-4 duration-300">
                            
                            {/* CABEÇALHO DA LISTA DE CAPÍTULOS */}
                            <div className="flex items-center justify-between mb-4">
                                <h3 className="text-lg font-bold text-white">Capítulos</h3>
                                <div className="flex items-center gap-4">
                                    <button onClick={() => setSortOrder(prev => prev === 'desc' ? 'asc' : 'desc')} className="text-xs font-medium text-gray-400 flex items-center gap-2 border border-white/10 rounded-lg px-3 py-1.5 hover:bg-white/5 transition-colors">
                                        Ordenar <ChevronDown className="w-3 h-3" />
                                    </button>
                                    <span className="text-xs text-gray-500 hidden sm:block">
                                        {sortOrder === 'desc' ? 'Mais recente' : 'Mais antigo'}
                                    </span>
                                </div>
                            </div>

                            {/* LISTA DE CAPÍTULOS HORIZONTAL */}
                            <div className="flex flex-col gap-3">
                                {chapters.length === 0 ? (
                                    <div className="text-center py-16 bg-[#0F0D14] rounded-2xl border border-white/5">
                                        <BookOpen className="w-10 h-10 text-gray-700 mx-auto mb-4" />
                                        <p className="text-gray-500 font-bold text-xs uppercase tracking-widest">Nenhum capítulo disponível.</p>
                                    </div>
                                ) : (
                                    sortedChapters.map((chapter, index) => {
                                        const isRead = mangaHistory.some(h => h.chapterNumber === chapter.number);
                                        const isNextToRead = nextChapterToRead?.id === chapter.id;
                                        
                                        return (
                                            <div key={chapter.id} onClick={() => onChapterClick(manga, chapter)} className={`cursor-pointer rounded-xl flex items-center gap-4 p-2 transition-all duration-300 group
                                                ${isNextToRead ? 'bg-purple-900/10 border border-purple-500/50 shadow-[inset_0_0_20px_rgba(168,85,247,0.1)]' : 'bg-transparent border border-white/5 hover:bg-white/5'}`}>
                                                
                                                {/* Miniatura (Thumbnail) com efeito visual */}
                                                <div className="w-[100px] h-[64px] sm:w-[120px] sm:h-[72px] flex-shrink-0 rounded-lg overflow-hidden relative bg-black">
                                                    <img src={manga.coverUrl} className={`w-full h-full object-cover object-top transition-transform duration-500 group-hover:scale-110 ${isRead ? 'opacity-40 grayscale' : 'opacity-80'}`} alt="thumb" />
                                                    {isNextToRead && <div className="absolute inset-0 border-2 border-purple-500 rounded-lg"></div>}
                                                </div>

                                                {/* Informações do Capítulo */}
                                                <div className="flex-1 min-w-0 py-1">
                                                    <div className="flex items-center gap-2 mb-1">
                                                        <h4 className={`font-bold text-sm truncate transition-colors ${isRead ? 'text-gray-500' : 'text-white group-hover:text-purple-300'}`}>
                                                            Capítulo {chapter.number}
                                                        </h4>
                                                        {index === 0 && sortOrder === 'desc' && !isRead && (
                                                            <span className="bg-purple-900 text-purple-200 text-[9px] font-bold px-1.5 py-0.5 rounded uppercase">Novo</span>
                                                        )}
                                                    </div>
                                                    <p className="text-[11px] text-gray-400 line-clamp-1">
                                                        {chapter.title || manga.title}
                                                    </p>
                                                </div>

                                                {/* Data e Ação */}
                                                <div className="flex items-center gap-4 pr-4">
                                                    <span className="text-[10px] text-gray-500 hidden sm:block font-medium">
                                                        {timeAgo(chapter.rawTime || Date.now())}
                                                    </span>
                                                    
                                                    {isNextToRead ? (
                                                        <div className="w-8 h-8 rounded-full border border-purple-500 flex items-center justify-center text-purple-400 group-hover:bg-purple-500 group-hover:text-white transition-colors">
                                                            <Play className="w-3.5 h-3.5 ml-0.5 fill-current" />
                                                        </div>
                                                    ) : (
                                                        <button className="text-gray-600 group-hover:text-purple-400 transition-colors">
                                                            {isRead ? <CheckCircle className="w-5 h-5 text-gray-600" /> : <Bookmark className="w-5 h-5" />}
                                                        </button>
                                                    )}
                                                </div>

                                            </div>
                                        );
                                    })
                                )}
                            </div>
                        </div>
                    )}

                    {detailsTab === 'comentarios' && (
                        <div className="animate-in slide-in-from-right-4 duration-300">
                            {/* COMPONENTE ORIGINAL DE COMENTÁRIOS MANTIDO INTACTO */}
                            <CommentsSection mangaId={manga.id} user={user} userProfileData={userProfileData} onRequireLogin={onRequireLogin} showToast={showToast} />
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}
