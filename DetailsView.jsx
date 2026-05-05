import React, { useState, useEffect } from 'react';
import { ArrowLeft, Star, Play, Library, Share2, BookOpen, CheckCircle, Clock, Zap, ChevronDown, ChevronUp, Users, Bookmark, ChevronRight } from 'lucide-react';
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
    };

    const mangaHistory = (historyData || []).filter(h => h.mangaId === manga.id);
    const lastRead = mangaHistory.length > 0 ? mangaHistory[0] : null;
    const chapters = manga.chapters || [];
    const firstChapter = chapters.length > 0 ? chapters[chapters.length - 1] : null;
    const nextChapterToRead = lastRead ? chapters.find(c => Number(c.number) === Number(lastRead.chapterNumber) + 1) || chapters.find(c => c.id === lastRead.id) : firstChapter;

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
    const displayGenre = manga.genres && manga.genres.length > 0 ? manga.genres.slice(0, 2).join(', ') : 'Ação, Fantasia';

    return (
        <div className="min-h-screen bg-[#0a0c10] text-gray-200 font-sans pb-24 animate-in fade-in duration-500 relative selection:bg-blue-500/30">
            {/* TOQUE DE LUZ LEVE NO FUNDO (SEM AFETAR PERFORMANCE) */}
            <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[800px] h-[300px] bg-blue-900/10 blur-[100px] pointer-events-none rounded-full"></div>

            <div className="absolute top-0 left-0 w-full p-4 md:p-6 z-50 flex justify-between items-center">
                <button onClick={onBack} className="p-3 bg-[#13161c] rounded-full border border-gray-800 hover:border-blue-500/50 hover:bg-[#1a1d24] transition-all shadow-sm group">
                    <ArrowLeft className="w-5 h-5 text-gray-300 group-hover:text-white group-hover:-translate-x-1 transition-transform" />
                </button>
            </div>

            <div className="max-w-5xl mx-auto px-4 sm:px-6 pt-20 md:pt-28 relative z-10">
                <div className="flex flex-col md:flex-row gap-8 md:gap-12">
                    {/* COLUNA DA CAPA */}
                    <div className="w-full md:w-[300px] flex-shrink-0 flex justify-center md:justify-start">
                        <div className="relative w-full max-w-[260px] md:max-w-full">
                            <div className="relative aspect-[2/3] rounded-3xl overflow-hidden shadow-2xl shadow-blue-900/10 border border-gray-800 group">
                                <img src={manga.coverUrl} alt={manga.title} className="w-full h-full object-cover transform group-hover:scale-105 transition-transform duration-700 ease-out" />
                                <div className="absolute inset-0 bg-gradient-to-t from-[#0a0c10] via-transparent to-transparent opacity-80" />
                            </div>

                            {/* TOQUE VERDE: BADGE DE STATUS */}
                            <div className="absolute -top-3 -right-3 bg-[#13161c] border border-emerald-500/30 text-emerald-400 text-[10px] font-bold uppercase tracking-widest px-3 py-1.5 rounded-full flex items-center gap-1.5 shadow-lg">
                                <Zap className="w-3 h-3 fill-emerald-500/50" /> {manga.status || 'EM LANÇAMENTO'}
                            </div>
                        </div>
                    </div>

                    {/* COLUNA DE INFORMAÇÕES */}
                    <div className="flex-1 flex flex-col justify-center">
                        <h1 className="text-4xl md:text-5xl font-extrabold text-white leading-tight tracking-tight mb-2">
                            {manga.title || 'Sem Título'}
                        </h1>
                        <p className="text-gray-500 font-medium text-sm mb-8">Autor desconhecido</p>
                        
                        {/* SISTEMA DE AVALIAÇÃO - LIMPO E ELEGANTE */}
                        <div className="flex items-center gap-6 mb-8">
                            <div>
                                <div className="flex items-center gap-1.5 mb-1">
                                    {[1, 2, 3, 4, 5].map((starVal) => (
                                        <button key={starVal} onClick={() => handleRate(starVal)} className="focus:outline-none hover:scale-110 transition-transform">
                                            <Star className={`w-6 h-6 transition-all duration-300 ${animateRating && starVal <= Math.round(localRating) ? 'animate-bounce text-amber-400 fill-amber-400' : starVal <= Math.round(localRating) ? 'text-amber-500 fill-amber-500' : 'text-gray-800'}`} />
                                        </button>
                                    ))}
                                </div>
                                <p className="text-[11px] text-gray-500 font-semibold mt-2">Avaliação Geral</p>
                            </div>
                            <div className={`flex flex-col items-center border-l border-gray-800 pl-6 transition-all duration-300 ${animateRating ? 'text-amber-400 scale-110' : 'text-white'}`}>
                                <span className="text-3xl font-black leading-none">{localRating.toFixed(1)}</span>
                                <span className="text-[10px] font-bold text-gray-500 uppercase tracking-wider mt-1">{getRatingLabel(localRating)}</span>
                            </div>
                        </div>

                        {/* CARDS MODERNOS COM TOQUE AZUL */}
                        <div className="grid grid-cols-3 gap-3 mb-8">
                            <div className="bg-[#13161c] border border-gray-800/60 rounded-2xl p-3.5 flex flex-col items-center justify-center text-center gap-1 hover:border-blue-500/30 transition-colors">
                                <Bookmark className="w-4 h-4 text-blue-500 mb-1" />
                                <span className="text-[9px] text-gray-500 font-bold uppercase tracking-widest">Gênero</span>
                                <span className="text-xs font-bold text-gray-200 line-clamp-1">{displayGenre}</span>
                            </div>
                            <div className="bg-[#13161c] border border-gray-800/60 rounded-2xl p-3.5 flex flex-col items-center justify-center text-center gap-1 hover:border-blue-500/30 transition-colors">
                                <BookOpen className="w-4 h-4 text-blue-400 mb-1" />
                                <span className="text-[9px] text-gray-500 font-bold uppercase tracking-widest">Capítulos</span>
                                <span className="text-xs font-bold text-gray-200 line-clamp-1">{chapters.length > 0 ? chapters.length : '0'}</span>
                            </div>
                            <div className="bg-[#13161c] border border-gray-800/60 rounded-2xl p-3.5 flex flex-col items-center justify-center text-center gap-1 hover:border-blue-500/30 transition-colors">
                                <Users className="w-4 h-4 text-blue-300 mb-1" />
                                <span className="text-[9px] text-gray-500 font-bold uppercase tracking-widest">Leitores</span>
                                <span className="text-xs font-bold text-gray-200 line-clamp-1">{realReaders}</span>
                            </div>
                        </div>

                        {/* BOTÃO OUSADO: TOQUE DE VERMELHO (ROSE/RED) E AZUL */}
                        <button onClick={() => nextChapterToRead ? onChapterClick(manga, nextChapterToRead) : showToast("Nenhum capítulo disponível", "warning")} className="w-full bg-gradient-to-r from-blue-600 via-indigo-600 to-rose-600 hover:from-blue-500 hover:via-indigo-500 hover:to-rose-500 text-white font-black py-4 rounded-2xl flex items-center justify-between px-6 transition-all hover:shadow-[0_8px_20px_rgba(225,29,72,0.2)] group mb-4">
                            <div className="flex items-center gap-3 w-full justify-center relative">
                                <Play className="w-5 h-5 absolute left-0 fill-white" />
                                <span className="text-sm uppercase tracking-[0.2em]">{lastRead ? 'CONTINUAR LEITURA' : 'LER AGORA'}</span>
                                <ChevronRight className="w-5 h-5 absolute right-0 group-hover:translate-x-1 transition-transform" />
                            </div>
                        </button>

                        <div className="flex items-center gap-3 mb-2">
                            <div className="relative flex-1">
                                <button onClick={() => setShowLibraryMenu(!showLibraryMenu)} className={`w-full py-3.5 rounded-2xl border flex items-center justify-center transition-all duration-300 font-bold text-xs gap-2 ${inLibrary ? 'bg-blue-900/20 border-blue-500/50 text-blue-400' : 'bg-[#13161c] border-gray-800 text-gray-400 hover:text-white hover:border-gray-600'}`}>
                                    {inLibrary ? <CheckCircle className="w-4 h-4" /> : <Library className="w-4 h-4" />}
                                    {inLibrary ? inLibrary : 'Adicionar à Biblioteca'}
                                </button>
                                {showLibraryMenu && (
                                    <div className="absolute bottom-full left-0 w-full mb-2 bg-[#1a1d24] border border-gray-700 rounded-2xl p-2 shadow-xl z-50 animate-in fade-in zoom-in-95">
                                        {libraryStatuses.map(status => (
                                            <button key={status} onClick={() => updateLibraryStatus(status)} className="w-full text-left px-4 py-3 rounded-xl text-xs font-bold text-gray-300 hover:bg-blue-600 hover:text-white transition-colors">{status}</button>
                                        ))}
                                        {inLibrary && <button onClick={() => updateLibraryStatus('Remover')} className="w-full text-left px-4 py-3 rounded-xl text-xs font-bold text-rose-500 hover:bg-rose-500/10 transition-colors mt-1 border-t border-gray-800">Remover</button>}
                                    </div>
                                )}
                            </div>
                            <button onClick={handleShare} className="py-3.5 px-5 bg-[#13161c] rounded-2xl border border-gray-800 text-gray-400 hover:text-white hover:border-gray-600 transition-colors">
                                <Share2 className="w-5 h-5" />
                            </button>
                        </div>
                    </div>
                </div>

                {/* SINOPSE MODERNA E LEVE */}
                <div className="mt-12 relative z-10 w-full">
                    <div className="bg-[#13161c] border-l-4 border-l-blue-500 rounded-r-3xl rounded-l-md p-6 md:p-8">
                        <h3 className="text-gray-400 font-bold mb-3 text-xs uppercase tracking-widest flex items-center gap-2">
                            <BookOpen className="w-4 h-4 text-blue-500" /> Sinopse
                        </h3>
                        <div className="text-gray-300 text-sm md:text-base leading-relaxed font-medium">
                            <p className={`whitespace-pre-wrap ${expandedSynopsis ? '' : 'line-clamp-4'}`}>
                                {manga.synopsis || "Detalhes desta obra ainda não foram documentados em nossos registros."}
                            </p>
                        </div>
                        {manga.synopsis && manga.synopsis.length > 200 && (
                            <button onClick={() => setExpandedSynopsis(!expandedSynopsis)} className="mt-4 flex items-center gap-1 text-[11px] font-bold uppercase tracking-wider text-blue-400 hover:text-blue-300 transition-colors">
                                {expandedSynopsis ? 'VER MENOS' : 'LER COMPLETO'}
                                {expandedSynopsis ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
                            </button>
                        )}
                    </div>
                </div>

                {/* NAVEGAÇÃO DE ABAS */}
                <div className="mt-12 relative z-10 w-full">
                    <div className="flex items-center gap-8 mb-6 border-b border-gray-800/80">
                        <button onClick={() => setDetailsTab('capitulos')} className={`text-xs font-bold uppercase tracking-wider transition-all pb-3 border-b-2 ${detailsTab === 'capitulos' ? 'text-white border-blue-500' : 'text-gray-500 border-transparent hover:text-gray-300'}`}>
                            Capítulos
                        </button>
                        <button onClick={() => setDetailsTab('comentarios')} className={`text-xs font-bold uppercase tracking-wider transition-all pb-3 border-b-2 ${detailsTab === 'comentarios' ? 'text-white border-blue-500' : 'text-gray-500 border-transparent hover:text-gray-300'}`}>
                            Comentários
                        </button>
                    </div>

                    {/* LISTA DE CAPÍTULOS */}
                    {detailsTab === 'capitulos' ? (
                        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 animate-in fade-in duration-300">
                            {chapters.length === 0 ? (
                                <div className="col-span-full text-center py-16 bg-[#13161c] rounded-3xl border border-gray-800"><BookOpen className="w-10 h-10 text-gray-700 mx-auto mb-4" /><p className="text-gray-500 font-bold text-[11px] uppercase tracking-widest">Nenhum capítulo disponível no momento.</p></div>
                            ) : (
                                chapters.map(chapter => {
                                    const isRead = mangaHistory.some(h => h.chapterNumber === chapter.number);
                                    return (
                                        <div key={chapter.id} onClick={() => onChapterClick(manga, chapter)} className={`cursor-pointer p-4 rounded-2xl flex items-center justify-between transition-colors duration-200 border group ${isRead ? 'bg-[#0f1115] border-gray-800/50 opacity-70' : 'bg-[#13161c] border-gray-800 hover:border-blue-500/50 hover:bg-[#1a1d24]'}`}>
                                            <div className="flex items-center gap-4">
                                                <div className={`w-12 h-12 rounded-xl flex items-center justify-center font-black text-sm transition-colors ${isRead ? 'bg-gray-900 text-gray-600' : 'bg-[#1e232e] text-blue-400 group-hover:bg-blue-500 group-hover:text-white'}`}>
                                                    {chapter.number}
                                                </div>
                                                <div>
                                                    <h4 className={`font-bold text-sm transition-colors ${isRead ? 'text-gray-500' : 'text-gray-200 group-hover:text-white'}`}>Capítulo {chapter.number}</h4>
                                                    <p className="text-[10px] text-gray-500 font-medium uppercase mt-1 flex items-center gap-1"><Clock className="w-3 h-3" /> {timeAgo(chapter.rawTime || Date.now())}</p>
                                                </div>
                                            </div>
                                            {/* TOQUE VERDE: CAPÍTULO LIDO */}
                                            {isRead && <CheckCircle className="w-5 h-5 text-emerald-500" />}
                                        </div>
                                    );
                                })
                            )}
                        </div>
                    ) : (
                        <div className="animate-in fade-in duration-300">
                            <CommentsSection mangaId={manga.id} user={user} userProfileData={userProfileData} onRequireLogin={onRequireLogin} showToast={showToast} />
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}
