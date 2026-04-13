import React, { useState, useEffect } from 'react';
import { ArrowLeft, Star, Play, Library, Share2, BookOpen, CheckCircle, Clock, Sparkles } from 'lucide-react';
import { doc, updateDoc, setDoc, deleteDoc } from "firebase/firestore";
import { APP_ID } from './constants';
import { CommentsSection } from './CommentsSection';

export default function DetailsView({ manga, libraryData, historyData, user, userProfileData, onBack, onChapterClick, onRequireLogin, showToast, db }) {
    const [isSharing, setIsSharing] = useState(false);
    
    // PROTEÇÃO ANTI-CRASH: Força converter para número. Se vier nulo, vira 5.0
    const [localRating, setLocalRating] = useState(Number(manga?.rating) || 5.0);

    useEffect(() => {
        setLocalRating(Number(manga?.rating) || 5.0);
    }, [manga?.rating]);

    const handleRate = async (ratingValue) => {
        if (!user) return showToast("Apenas leitores registrados podem avaliar.", "warning");
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
            showToast("Erro de sincronização. Tente novamente.", "error");
        }
    };

    // PROTEÇÃO: Se a obra sumir, não renderiza nada para não travar
    if (!manga) return null;

    const inLibrary = libraryData && libraryData[manga.id];
    const handleLibraryToggle = async () => {
        if (!user) { onRequireLogin(); return; }
        try {
            const ref = doc(db, 'artifacts', APP_ID, 'users', user.uid, 'library', manga.id.toString());
            if (inLibrary) {
                await deleteDoc(ref); showToast("Removido da Biblioteca.", "info");
            } else {
                await setDoc(ref, { mangaId: manga.id, status: 'Lendo', updatedAt: Date.now() }); showToast("Adicionado à Biblioteca!", "success");
            }
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
    const nextChapterToRead = lastRead 
        ? chapters.find(c => Number(c.number) === Number(lastRead.chapterNumber) + 1) || chapters.find(c => c.id === lastRead.id)
        : firstChapter;

    return (
        <div className="min-h-screen bg-[#030305] text-gray-200 font-sans pb-24 animate-in fade-in duration-700 relative overflow-hidden">
            <div className="absolute top-0 left-1/4 w-[400px] h-[400px] bg-indigo-500/10 rounded-full blur-[100px] pointer-events-none mix-blend-screen animate-[pulse_6s_ease-in-out_infinite]"></div>
            <div className="absolute top-1/3 right-1/4 w-[300px] h-[300px] bg-cyan-500/10 rounded-full blur-[100px] pointer-events-none mix-blend-screen animate-[pulse_8s_ease-in-out_infinite_reverse]"></div>

            <div className="relative h-64 md:h-80 w-full overflow-hidden border-b border-white/5">
                <div className="absolute inset-0 bg-[#030305]">
                    <img src={manga.coverUrl} className="w-full h-full object-cover opacity-20 blur-xl scale-110" alt="Capa de Fundo" />
                </div>
                <div className="absolute inset-0 bg-gradient-to-t from-[#030305] via-[#030305]/80 to-transparent" />
                <div className="absolute inset-0 bg-gradient-to-b from-black/60 via-transparent to-transparent" />
                <button onClick={onBack} className="absolute top-4 md:top-6 left-4 md:left-6 z-10 p-3 bg-white/5 backdrop-blur-md rounded-full border border-white/10 hover:bg-white/10 transition-colors shadow-lg"><ArrowLeft className="w-5 h-5 text-gray-300" /></button>
            </div>

            <div className="max-w-5xl mx-auto px-4 sm:px-6 relative -mt-32 md:-mt-40 z-10">
                <div className="flex flex-col md:flex-row gap-8 items-center md:items-start">
                    <div className="w-44 md:w-56 flex-shrink-0 relative group animate-[levitar_6s_ease-in-out_infinite]">
                        <style>{`@keyframes levitar { 0%, 100% { transform: translateY(0); } 50% { transform: translateY(-8px); } }`}</style>
                        <div className="absolute -inset-2 bg-gradient-to-b from-indigo-500/20 to-cyan-500/20 rounded-2xl blur-lg opacity-0 group-hover:opacity-100 transition-opacity duration-700 pointer-events-none"></div>
                        <div className="aspect-[2/3] relative rounded-2xl overflow-hidden shadow-2xl border border-white/10 z-10"><img src={manga.coverUrl} alt={manga.title} className="w-full h-full object-cover" /></div>
                        {manga.status && <div className="absolute -top-3 -right-3 bg-indigo-500/90 backdrop-blur-sm text-white text-[9px] font-bold uppercase tracking-widest px-3 py-1.5 rounded-lg shadow-lg z-20 border border-white/10">{manga.status}</div>}
                    </div>

                    <div className="flex-1 text-center md:text-left mt-2 md:mt-12 relative z-10">
                        <h1 className="text-3xl md:text-4xl font-black text-white leading-tight tracking-tight mb-2">{manga.title || 'Sem Título'}</h1>
                        <p className="text-xs text-indigo-300 font-medium uppercase tracking-[0.2em] mb-6">{manga.author || 'Autor Desconhecido'}</p>
                        
                        <div className="flex items-center justify-center md:justify-start gap-1 mb-8 bg-white/5 w-fit mx-auto md:mx-0 px-5 py-2.5 rounded-full border border-white/5 backdrop-blur-md">
                            {[1, 2, 3, 4, 5].map((star) => (
                                <button key={star} onClick={() => handleRate(star)} className="focus:outline-none hover:scale-110 transition-transform duration-300 px-0.5">
                                    <Star className={`w-5 h-5 ${star <= Math.round(localRating) ? 'text-amber-300 fill-amber-300 drop-shadow-[0_0_8px_rgba(252,211,77,0.5)]' : 'text-gray-600 hover:text-amber-300/50'}`} />
                                </button>
                            ))}
                            <span className="text-white font-bold ml-3 text-lg border-l border-white/10 pl-3">{localRating.toFixed(1)}</span>
                        </div>

                        <div className="flex flex-wrap items-center justify-center md:justify-start gap-3">
                            <button onClick={() => nextChapterToRead ? onChapterClick(manga, nextChapterToRead) : showToast("Nenhum capítulo", "warning")} className="flex-1 md:flex-none bg-white text-black hover:bg-gray-200 font-bold px-8 py-3.5 rounded-xl transition-colors text-xs uppercase tracking-widest flex items-center justify-center gap-2 shadow-lg"><Play className="w-4 h-4 fill-current" /> {lastRead ? 'Continuar Leitura' : 'Iniciar Leitura'}</button>
                            <button onClick={handleLibraryToggle} className={`p-3.5 rounded-xl border flex items-center justify-center transition-colors shadow-sm group ${inLibrary ? 'bg-indigo-500/10 border-indigo-500/30 text-indigo-400' : 'bg-white/5 border-white/5 text-gray-400 hover:text-white hover:bg-white/10'}`}><CheckCircle className="w-5 h-5" /></button>
                            <button onClick={handleShare} className="p-3.5 bg-white/5 rounded-xl border border-white/5 text-gray-400 hover:text-white hover:bg-white/10 transition-colors shadow-sm"><Share2 className="w-5 h-5" /></button>
                        </div>
                    </div>
                </div>

                <div className="mt-10 flex flex-wrap justify-center md:justify-start gap-2 relative z-10">
                    {manga.genres?.map(genre => (
                        <span key={genre} className="bg-white/5 border border-white/5 text-gray-300 px-4 py-1.5 rounded-lg text-[10px] font-medium uppercase tracking-[0.1em] cursor-default">{genre}</span>
                    ))}
                </div>

                <div className="mt-8 relative z-10">
                    <div className="bg-white/[0.02] border border-white/5 p-6 md:p-8 rounded-[2rem]">
                        <h3 className="text-white font-bold mb-4 text-sm flex items-center gap-2"><Sparkles className="w-4 h-4 text-indigo-400" /> Sinopse</h3>
                        <p className="text-gray-400 text-sm leading-relaxed whitespace-pre-wrap font-light">{manga.synopsis || "Nenhuma descrição disponível no momento."}</p>
                    </div>
                </div>

                <div className="mt-12 relative z-10">
                    <div className="flex items-center justify-between mb-6 px-2">
                        <h3 className="text-lg font-bold text-white flex items-center gap-2"><BookOpen className="w-4 h-4 text-indigo-400" /> Capítulos</h3>
                        <span className="text-[10px] text-gray-400 font-medium uppercase tracking-widest bg-white/5 px-3 py-1 rounded-md">{chapters.length} Lançados</span>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
                        {chapters.length === 0 ? (
                            <div className="col-span-full text-center py-16 bg-white/[0.02] rounded-3xl border border-white/5"><BookOpen className="w-8 h-8 text-gray-600 mx-auto mb-3" /><p className="text-gray-500 font-medium text-xs">Nenhum capítulo disponível.</p></div>
                        ) : (
                            chapters.map(chapter => {
                                const isRead = mangaHistory.some(h => h.chapterNumber === chapter.number);
                                return (
                                    <div key={chapter.id} onClick={() => onChapterClick(manga, chapter)} className={`cursor-pointer p-4 rounded-2xl flex items-center justify-between transition-colors duration-300 border ${isRead ? 'bg-white/[0.01] border-transparent opacity-60 hover:bg-white/[0.03]' : 'bg-white/[0.03] border-white/5 hover:border-indigo-500/30 hover:bg-white/[0.05]'}`}>
                                        <div className="flex items-center gap-4">
                                            <div className={`w-10 h-10 rounded-xl flex items-center justify-center font-bold text-sm transition-colors ${isRead ? 'bg-white/5 text-gray-500' : 'bg-white/10 text-white'}`}>{chapter.number}</div>
                                            <div>
                                                <h4 className={`font-medium text-sm transition-colors ${isRead ? 'text-gray-500' : 'text-gray-200'}`}>Capítulo {chapter.number}</h4>
                                                <p className="text-[10px] text-gray-600 font-medium mt-0.5 flex items-center gap-1"><Clock className="w-3 h-3" /> {timeAgo(chapter.rawTime || Date.now())}</p>
                                            </div>
                                        </div>
                                        {isRead && <CheckCircle className="w-4 h-4 text-emerald-500/70" />}
                                    </div>
                                );
                            })
                        )}
                    </div>
                </div>
                
                <div className="mt-8">
                    <CommentsSection mangaId={manga.id} user={user} userProfileData={userProfileData} onRequireLogin={onRequireLogin} showToast={showToast} />
                </div>
            </div>
        </div>
    );
}
