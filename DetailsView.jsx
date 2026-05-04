
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
        <div className="min-h-screen bg-[#020205] text-gray-200 font-sans pb-24 animate-in fade-in duration-700 relative overflow-x-hidden">
            <div className="absolute top-0 left-0 w-full p-4 md:p-6 z-50 flex justify-between items-center">
                <button onClick={onBack} className="p-3 bg-[#05050a]/80 backdrop-blur-md rounded-full border border-white/10 hover:border-cyan-500 hover:bg-[#0a0a16] transition-all shadow-lg">
                    <ArrowLeft className="w-5 h-5 text-white" />
                </button>
            </div>

            <div className="max-w-5xl mx-auto px-4 sm:px-6 pt-20 md:pt-24 relative z-10">
                <div className="flex flex-col md:flex-row gap-6 md:gap-10">
                    <div className="w-full md:w-[320px] flex-shrink-0 flex justify-center md:justify-start">
                        <div className="relative w-full max-w-[280px] md:max-w-full">
                            <div className="absolute -inset-1 bg-cyan-600/30 blur-[30px] rounded-2xl pointer-events-none"></div>
                            
                            <div className="relative aspect-[2/3] rounded-2xl overflow-hidden shadow-[0_0_30px_rgba(6,182,212,0.2)] border border-cyan-500/30 z-10">
                                <img src={manga.coverUrl} alt={manga.title} className="w-full h-full object-cover" />
                                <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent opacity-80" />
                            </div>

                            <div className="absolute top-3 left-3 bg-[#05050a]/90 backdrop-blur-md border border-cyan-900/50 text-cyan-400 text-[9px] font-black uppercase tracking-widest px-2.5 py-1.5 rounded flex items-center gap-1.5 z-20 shadow-lg">
                                <Zap className="w-3 h-3" /> {manga.status || 'EM LANÇAMENTO'}
                            </div>
                        </div>
                    </div>

                    <div className="flex-1 flex flex-col justify-center">
                        <h1 className="text-4xl md:text-5xl font-black text-white leading-tight tracking-tighter mb-2 drop-shadow-md">
                            {manga.title || 'Sem Título'}
                        </h1>
                        <p className="text-gray-400 font-medium text-sm mb-6">Autor desconhecido</p>
                        
                        {/* SISTEMA DE AVALIAÇÃO COM ESTRELAS E ANIMAÇÃO */}
                        <div className="flex items-center gap-6 mb-8">
                            <div>
                                <div className="flex items-center gap-2 mb-1">
                                    {[1, 2, 3, 4, 5].map((starVal) => (
                                        <button key={starVal} onClick={() => handleRate(starVal)} className="focus:outline-none hover:scale-125 transition-transform px-0.5">
                                            <Star className={`w-7 h-7 transition-all duration-300 ${animateRating && starVal <= Math.round(localRating) ? 'animate-bounce text-amber-400 fill-amber-400 scale-125' : starVal <= Math.round(localRating) ? 'text-amber-500 fill-amber-500 drop-shadow-[0_0_10px_rgba(245,158,11,0.6)]' : 'text-gray-700'}`} />
                                        </button>
                                    ))}
                                </div>
                                <p className="text-[10px] text-gray-500 font-medium mt-2">Avaliação Geral</p>
                            </div>
                            <div className={`flex flex-col items-center border-l border-white/10 pl-6 transition-all duration-500 ${animateRating ? 'text-amber-400 scale-110 drop-shadow-[0_0_15px_rgba(245,158,11,0.8)]' : 'text-white scale-100'}`}>
                                <span className="text-3xl font-black leading-none">{localRating.toFixed(1)}</span>
                                <span className={`text-[9px] font-black uppercase tracking-widest mt-1 ${animateRating ? 'text-white' : 'text-amber-500'}`}>{getRatingLabel(localRating)}</span>
                            </div>
                        </div>

                        <div className="grid grid-cols-3 gap-3 mb-8">
                            <div className="bg-[#0a0a16] border border-white/5 rounded-xl p-3 flex flex-col justify-center gap-1.5 shadow-md">
                                <Bookmark className="w-4 h-4 text-cyan-500 mb-1" />
                                <span className="text-[9px] text-gray-500 font-bold uppercase tracking-widest">Gênero</span>
                                <span className="text-xs font-bold text-gray-200 line-clamp-1">{displayGenre}</span>
                            </div>
                            <div className="bg-[#0a0a16] border border-white/5 rounded-xl p-3 flex flex-col justify-center gap-1.5 shadow-md">
                                <BookOpen className="w-4 h-4 text-cyan-500 mb-1" />
                                <span className="text-[9px] text-gray-500 font-bold uppercase tracking-widest">Capítulos</span>
                                <span className="text-xs font-bold text-gray-200 line-clamp-1">{chapters.length > 0 ? 'Disponíveis' : '0'}</span>
                            </div>
                            <div className="bg-[#0a0a16] border border-white/5 rounded-xl p-3 flex flex-col justify-center gap-1.5 shadow-md">
                                <Users className="w-4 h-4 text-cyan-500 mb-1" />
                                <span className="text-[9px] text-gray-500 font-bold uppercase tracking-widest">Leitores</span>
                                <span className="text-xs font-bold text-gray-200 line-clamp-1">{realReaders}</span>
                            </div>
                        </div>

                        <button onClick={() => nextChapterToRead ? onChapterClick(manga, nextChapterToRead) : showToast("Nenhum capítulo disponível", "warning")} className="w-full bg-gradient-to-r from-blue-700 via-cyan-600 to-blue-700 border border-cyan-500/50 text-white font-black py-4 rounded-xl flex items-center justify-between px-6 transition-all hover:scale-[1.01] shadow-[0_0_20px_rgba(6,182,212,0.3)] group mb-4">
                            <div className="flex items-center gap-3 w-full justify-center relative">
                                <BookOpen className="w-5 h-5 absolute left-0" />
                                <span className="text-sm uppercase tracking-[0.2em]">{lastRead ? 'CONTINUAR LEITURA' : 'LER AGORA'}</span>
                                <ChevronRight className="w-5 h-5 absolute right-0 group-hover:translate-x-1 transition-transform" />
                            </div>
                        </button>

                        <div className="flex items-center gap-3 mb-2">
                            <div className="relative flex-1">
                                <button onClick={() => setShowLibraryMenu(!showLibraryMenu)} className={`w-full py-3 rounded-xl border flex items-center justify-center transition-all duration-300 font-black text-[10px] uppercase tracking-widest gap-2 ${inLibrary ? 'bg-cyan-950/40 border-cyan-500/50 text-cyan-400' : 'bg-[#0a0a16] border-white/5 text-gray-400 hover:text-white hover:border-cyan-500/30'}`}>
                                    {inLibrary ? <CheckCircle className="w-4 h-4" /> : <Library className="w-4 h-4" />}
                                    {inLibrary ? inLibrary : 'Adicionar à Biblioteca'}
                                </button>
                                {showLibraryMenu && (
                                    <div className="absolute bottom-full left-0 w-full mb-2 bg-[#05050a] border border-cyan-500/30 rounded-xl p-2 shadow-2xl z-50 animate-in fade-in zoom-in-95">
                                        {libraryStatuses.map(status => (
                                            <button key={status} onClick={() => updateLibraryStatus(status)} className="w-full text-left px-4 py-3 rounded-lg text-xs font-black uppercase tracking-widest text-gray-300 hover:bg-cyan-900/30 hover:text-cyan-400 transition-colors">{status}</button>
                                        ))}
                                        {inLibrary && <button onClick={() => updateLibraryStatus('Remover')} className="w-full text-left px-4 py-3 rounded-lg text-xs font-black uppercase tracking-widest text-red-500 hover:bg-red-950/40 transition-colors mt-1 border-t border-red-900/30">Remover</button>}
                                    </div>
                                )}
                            </div>
                            <button onClick={handleShare} className="py-3 px-5 bg-[#0a0a16] rounded-xl border border-white/5 text-gray-400 hover:text-white hover:border-cyan-500/30 transition-colors">
                                <Share2 className="w-4 h-4" />
                            </button>
                        </div>
                    </div>
                </div>

                <div className="mt-10 relative z-10 w-full">
                    <div className="relative overflow-hidden bg-[#05050a] border border-white/5 rounded-2xl shadow-xl">
                        <div className="absolute right-0 top-0 w-3/4 md:w-1/2 h-full opacity-20 mix-blend-screen pointer-events-none" style={{ maskImage: 'linear-gradient(to right, transparent, black)', WebkitMaskImage: '-webkit-linear-gradient(left, transparent, black)' }}>
                            <img src={manga.coverUrl} className="w-full h-full object-cover object-top" alt="Background" />
                        </div>
                        <div className="relative z-10 p-6 md:p-8">
                            <h3 className="text-cyan-500 font-black mb-3 text-xs uppercase tracking-widest drop-shadow-sm">Sinopse</h3>
                            <div className="text-gray-300 text-sm md:text-base leading-relaxed font-medium">
                                <p className={`whitespace-pre-wrap ${expandedSynopsis ? '' : 'line-clamp-4'}`}>
                                    {manga.synopsis || "Os dados do sistema ainda não decifraram os mistérios desta obra."}
                                </p>
                            </div>
                            {manga.synopsis && manga.synopsis.length > 200 && (
                                <button onClick={() => setExpandedSynopsis(!expandedSynopsis)} className="mt-4 flex items-center gap-1 text-[10px] font-black uppercase tracking-widest text-cyan-400 hover:text-cyan-300 transition-colors">
                                    {expandedSynopsis ? 'VER MENOS' : 'VER MAIS'}
                                    {expandedSynopsis ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
                                </button>
                            )}
                        </div>
                    </div>
                </div>

                <div className="mt-12 relative z-10 w-full">
                    <div className="flex items-center gap-6 mb-6 border-b border-white/10 pb-4">
                        <button onClick={() => setDetailsTab('capitulos')} className={`text-[11px] font-black uppercase tracking-[0.2em] transition-colors pb-2 border-b-2 ${detailsTab === 'capitulos' ? 'text-white border-cyan-500' : 'text-gray-600 border-transparent hover:text-gray-400'}`}>
                            Capítulos
                        </button>
                        <button onClick={() => setDetailsTab('comentarios')} className={`text-[11px] font-black uppercase tracking-[0.2em] transition-colors pb-2 border-b-2 ${detailsTab === 'comentarios' ? 'text-white border-cyan-500' : 'text-gray-600 border-transparent hover:text-gray-400'}`}>
                            Comentários
                        </button>
                    </div>

                    {detailsTab === 'capitulos' ? (
                        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 animate-in slide-in-from-left-4 duration-300">
                            {chapters.length === 0 ? (
                                <div className="col-span-full text-center py-16 bg-[#05050a]/50 rounded-2xl border border-white/5"><BookOpen className="w-10 h-10 text-gray-700 mx-auto mb-4" /><p className="text-gray-500 font-black text-[10px] uppercase tracking-[0.2em]">Nenhum capítulo disponível no momento.</p></div>
                            ) : (
                                chapters.map(chapter => {
                                    const isRead = mangaHistory.some(h => h.chapterNumber === chapter.number);
                                    return (
                                        <div key={chapter.id} onClick={() => onChapterClick(manga, chapter)} className={`cursor-pointer p-4 rounded-xl flex items-center justify-between transition-all duration-300 border shadow-sm group ${isRead ? 'bg-[#0a0a16]/80 border-white/5 opacity-60' : 'bg-[#0a0a16] border-white/5 hover:border-cyan-500/50 hover:bg-[#0c0c1a]'}`}>
                                            <div className="flex items-center gap-4">
                                                <div className={`w-12 h-12 rounded-lg flex items-center justify-center font-black text-sm transition-colors ${isRead ? 'bg-black/60 text-gray-600 border border-white/5' : 'bg-[#020205] text-cyan-500 border border-cyan-500/30 group-hover:bg-cyan-500 group-hover:text-white'}`}>{chapter.number}</div>
                                                <div>
                                                    <h4 className={`font-black text-xs uppercase tracking-wider transition-colors ${isRead ? 'text-gray-600' : 'text-gray-300 group-hover:text-white'}`}>Capítulo {chapter.number}</h4>
                                                    <p className="text-[9px] text-gray-500 font-bold uppercase tracking-widest mt-1 flex items-center gap-1"><Clock className="w-3 h-3" /> {timeAgo(chapter.rawTime || Date.now())}</p>
                                                </div>
                                            </div>
                                            {isRead && <CheckCircle className="w-4 h-4 text-cyan-800" />}
                                        </div>
                                    );
                                })
                            )}
                        </div>
                    ) : (
                        <div className="animate-in slide-in-from-right-4 duration-300">
                            <CommentsSection mangaId={manga.id} user={user} userProfileData={userProfileData} onRequireLogin={onRequireLogin} showToast={showToast} />
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}
