import React, { useState, useEffect } from 'react';
import { ArrowLeft, Star, Play, Library, Share2, BookOpen, CheckCircle, Clock, Flame, ChevronDown } from 'lucide-react';
import { doc, updateDoc, setDoc, deleteDoc } from "firebase/firestore";
import { APP_ID } from './constants';
import { CommentsSection } from './CommentsSection';
import { timeAgo } from './helpers';

export default function DetailsView({ manga, libraryData, historyData, user, userProfileData, onBack, onChapterClick, onRequireLogin, showToast, db }) {
    const [isSharing, setIsSharing] = useState(false);
    const [localRating, setLocalRating] = useState(Number(manga?.rating) || 5.0);
    const [detailsTab, setDetailsTab] = useState('capitulos'); 
    const [showLibraryMenu, setShowLibraryMenu] = useState(false); 

    const libraryStatuses = ['Lendo', 'Concluído', 'Pausado', 'Dropado', 'Planejo Ler'];

    useEffect(() => { setLocalRating(Number(manga?.rating) || 5.0); }, [manga?.rating]);

    const handleRate = async (ratingValue) => {
        if (!user) return showToast("Apenas ninjas registrados podem avaliar.", "warning");
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
            showToast("Erro de sincronização nas sombras.", "error");
        }
    };

    if (!manga) return null;

    const inLibrary = libraryData && libraryData[manga.id];
    
    const updateLibraryStatus = async (status) => {
        if (!user) { onRequireLogin(); return; }
        try {
            const ref = doc(db, 'artifacts', APP_ID, 'users', user.uid, 'library', manga.id.toString());
            if (status === 'Remover') {
                await deleteDoc(ref); showToast("Removido do Acervo.", "info");
            } else {
                await setDoc(ref, { mangaId: manga.id, status: status, updatedAt: Date.now() }); showToast(`Selado como: ${status}`, "success");
            }
            setShowLibraryMenu(false);
        } catch (error) { showToast("Erro ao atualizar grimório.", "error"); }
    };

    const handleShare = () => {
        setIsSharing(true); navigator.clipboard.writeText(window.location.href);
        showToast("Link copiado para as sombras!", "success"); setTimeout(() => setIsSharing(false), 2000);
    };

    const mangaHistory = (historyData || []).filter(h => h.mangaId === manga.id);
    const lastRead = mangaHistory.length > 0 ? mangaHistory[0] : null;
    const chapters = manga.chapters || [];
    const firstChapter = chapters.length > 0 ? chapters[chapters.length - 1] : null;
    const nextChapterToRead = lastRead ? chapters.find(c => Number(c.number) === Number(lastRead.chapterNumber) + 1) || chapters.find(c => c.id === lastRead.id) : firstChapter;

    return (
        <div className="min-h-screen bg-[#030305] text-gray-200 font-sans pb-24 animate-in fade-in duration-700 relative overflow-hidden">
            {/* Fundo Cósmico Sombrio */}
            <div className="absolute top-0 left-1/4 w-[400px] h-[400px] bg-red-600/10 rounded-full blur-[100px] pointer-events-none mix-blend-screen animate-[pulse_6s_ease-in-out_infinite]"></div>

            <div className="relative h-64 md:h-80 w-full overflow-hidden border-b border-red-600/20">
                <div className="absolute inset-0 bg-[#030305]">
                    <img src={manga.coverUrl} className="w-full h-full object-cover opacity-20 blur-xl scale-110 grayscale-[30%]" alt="Capa" />
                </div>
                <div className="absolute inset-0 bg-gradient-to-t from-[#030305] via-[#030305]/80 to-transparent" />
                <button onClick={onBack} className="absolute top-4 md:top-6 left-4 md:left-6 z-10 p-3 bg-black/40 backdrop-blur-md rounded-full border border-white/10 hover:border-red-500 hover:bg-black/60 transition-all shadow-[0_0_15px_rgba(0,0,0,0.8)]"><ArrowLeft className="w-5 h-5 text-gray-300 hover:text-red-500 transition-colors" /></button>
            </div>

            <div className="max-w-5xl mx-auto px-4 sm:px-6 relative -mt-32 md:-mt-40 z-10">
                <div className="flex flex-col md:flex-row gap-8 items-center md:items-start">
                    
                    {/* Capa Principal com Efeito Levitar */}
                    <div className="w-44 md:w-56 flex-shrink-0 relative group animate-[levitar_6s_ease-in-out_infinite]">
                        <style>{`@keyframes levitar { 0%, 100% { transform: translateY(0); } 50% { transform: translateY(-8px); } }`}</style>
                        <div className="absolute -inset-2 bg-gradient-to-b from-red-600/30 to-rose-900/20 rounded-2xl blur-lg opacity-0 group-hover:opacity-100 transition-opacity duration-700 pointer-events-none"></div>
                        <div className="aspect-[2/3] relative rounded-2xl overflow-hidden shadow-[0_20px_50px_rgba(0,0,0,0.9)] border border-red-900/50 z-10"><img src={manga.coverUrl} alt={manga.title} className="w-full h-full object-cover" /></div>
                        {manga.status && <div className="absolute -top-3 -right-3 bg-red-600/90 backdrop-blur-sm text-white text-[9px] font-black uppercase tracking-widest px-3 py-1.5 rounded-lg shadow-[0_0_20px_rgba(220,38,38,0.5)] z-20 border border-red-500">{manga.status}</div>}
                    </div>

                    <div className="flex-1 text-center md:text-left mt-2 md:mt-12 relative z-[60]">
                        <h1 className="text-3xl md:text-5xl font-black text-white leading-tight tracking-tight mb-2 drop-shadow-2xl">{manga.title || 'Sem Título'}</h1>
                        <p className="text-xs text-red-500 font-black uppercase tracking-[0.3em] mb-6 drop-shadow-md">{manga.author || 'Autor Desconhecido'}</p>
                        
                        <div className="flex items-center justify-center md:justify-start gap-1 mb-8 bg-[#0a0a0c]/80 w-fit mx-auto md:mx-0 px-5 py-2.5 rounded-full border border-red-900/30 backdrop-blur-md shadow-[0_0_15px_rgba(0,0,0,0.5)]">
                            {[1, 2, 3, 4, 5].map((star) => (
                                <button key={star} onClick={() => handleRate(star)} className="focus:outline-none hover:scale-125 transition-transform duration-300 px-0.5">
                                    <Star className={`w-5 h-5 ${star <= Math.round(localRating) ? 'text-amber-500 fill-amber-500 drop-shadow-[0_0_10px_rgba(245,158,11,0.8)]' : 'text-gray-700 hover:text-amber-500/50'}`} />
                                </button>
                            ))}
                            <span className="text-white font-black ml-3 text-lg border-l border-white/10 pl-3 drop-shadow-md">{localRating.toFixed(1)}</span>
                        </div>

                        <div className="flex flex-wrap items-center justify-center md:justify-start gap-3">
                            <button onClick={() => nextChapterToRead ? onChapterClick(manga, nextChapterToRead) : showToast("Nenhum capítulo", "warning")} className="flex-1 md:flex-none bg-gradient-to-r from-red-700 to-red-500 text-white font-black px-8 py-4 rounded-2xl transition-all duration-300 hover:scale-105 text-xs uppercase tracking-widest flex items-center justify-center gap-2 shadow-[0_0_20px_rgba(220,38,38,0.4)] border border-red-400/30">
                                <Play className="w-4 h-4 fill-white" /> {lastRead ? 'Continuar Missão' : 'Iniciar Missão'}
                            </button>
                            
                            <div className="relative z-[100]">
                                <button onClick={() => setShowLibraryMenu(!showLibraryMenu)} className={`px-5 py-4 rounded-2xl border flex items-center justify-center transition-all duration-300 shadow-sm gap-2 font-black text-[10px] uppercase tracking-widest ${inLibrary ? 'bg-red-600/10 border-red-600/50 text-red-500' : 'bg-black/40 border-white/10 text-gray-400 hover:text-white hover:bg-white/10 hover:border-red-500'}`}>
                                    {inLibrary ? <CheckCircle className="w-4 h-4" /> : <Library className="w-4 h-4" />}
                                    {inLibrary ? inLibrary : 'Selar'}
                                    <ChevronDown className="w-3 h-3 ml-1" />
                                </button>
                                {showLibraryMenu && (
                                    <div className="absolute top-full mt-2 left-1/2 -translate-x-1/2 md:left-0 md:translate-x-0 w-48 bg-[#0a0a0c] border border-red-600/30 rounded-2xl p-2 shadow-[0_30px_60px_rgba(0,0,0,0.9)] animate-in fade-in zoom-in-95">
                                        {libraryStatuses.map(status => (
                                            <button key={status} onClick={() => updateLibraryStatus(status)} className="w-full text-left px-4 py-3 rounded-xl text-xs font-black uppercase tracking-widest text-gray-300 hover:bg-red-900/40 hover:text-red-400 transition-colors">{status}</button>
                                        ))}
                                        {inLibrary && <button onClick={() => updateLibraryStatus('Remover')} className="w-full text-left px-4 py-3 rounded-xl text-xs font-black uppercase tracking-widest text-red-400 hover:bg-red-950/60 hover:text-red-300 transition-colors mt-2 border-t border-red-900/30">Quebrar Selo</button>}
                                    </div>
                                )}
                            </div>
                            <button onClick={handleShare} className="p-4 bg-black/40 rounded-2xl border border-white/10 text-gray-400 hover:text-white hover:border-red-500 hover:bg-red-600/10 transition-colors shadow-sm"><Share2 className="w-5 h-5" /></button>
                        </div>
                    </div>
                </div>

                <div className="mt-10 flex flex-wrap justify-center md:justify-start gap-2 relative z-10">
                    {manga.genres?.map(genre => (
                        <span key={genre} className="bg-black/50 border border-red-900/30 text-red-200/80 px-4 py-2 rounded-xl text-[10px] font-black uppercase tracking-[0.2em] cursor-default shadow-sm">{genre}</span>
                    ))}
                </div>

                {/* SINOPSE */}
                <div className="mt-8 relative z-10">
                    <div className="bg-[#0a0a0c]/80 backdrop-blur-md border border-red-900/20 p-6 md:p-8 rounded-[2rem] shadow-inner">
                        <h3 className="text-white font-black mb-4 text-xs uppercase tracking-widest flex items-center gap-2"><Flame className="w-4 h-4 text-red-500" /> Registros Antigos</h3>
                        <p className="text-gray-400 text-sm leading-relaxed whitespace-pre-wrap font-medium">{manga.synopsis || "Os arquivos de sangue não possuem informações sobre esta obra."}</p>
                    </div>
                </div>

                {/* ABAS (CAPÍTULOS E COMENTÁRIOS) */}
                <div className="mt-12 relative z-10">
                    <div className="flex items-center gap-4 mb-8 border-b border-red-900/30 pb-4">
                        <button onClick={() => setDetailsTab('capitulos')} className={`text-xs font-black uppercase tracking-[0.2em] transition-colors pb-2 border-b-2 ${detailsTab === 'capitulos' ? 'text-red-500 border-red-500' : 'text-gray-600 border-transparent hover:text-gray-400'}`}>Capítulos ({chapters.length})</button>
                        <button onClick={() => setDetailsTab('comentarios')} className={`text-xs font-black uppercase tracking-[0.2em] transition-colors pb-2 border-b-2 ${detailsTab === 'comentarios' ? 'text-red-500 border-red-500' : 'text-gray-600 border-transparent hover:text-gray-400'}`}>Almas Escritas</button>
                    </div>

                    {detailsTab === 'capitulos' ? (
                        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 animate-in slide-in-from-left-4 duration-300">
                            {chapters.length === 0 ? (
                                <div className="col-span-full text-center py-16 bg-[#0a0a0c]/50 rounded-[2rem] border border-red-900/20"><BookOpen className="w-10 h-10 text-gray-700 mx-auto mb-4" /><p className="text-gray-500 font-black text-[10px] uppercase tracking-[0.2em]">Nenhum capítulo revelado.</p></div>
                            ) : (
                                chapters.map(chapter => {
                                    const isRead = mangaHistory.some(h => h.chapterNumber === chapter.number);
                                    return (
                                        <div key={chapter.id} onClick={() => onChapterClick(manga, chapter)} className={`cursor-pointer p-4 rounded-2xl flex items-center justify-between transition-all duration-300 border shadow-sm group ${isRead ? 'bg-black/40 border-red-900/20 opacity-60 hover:bg-[#0a0a0c]' : 'bg-[#0a0a0c]/60 border-white/5 hover:border-red-600/50 hover:shadow-[0_0_15px_rgba(220,38,38,0.2)] hover:bg-[#111113]'}`}>
                                            <div className="flex items-center gap-4">
                                                <div className={`w-12 h-12 rounded-xl flex items-center justify-center font-black text-sm transition-colors ${isRead ? 'bg-black/60 text-gray-600 border border-white/5' : 'bg-[#030305] text-red-500 border border-red-600/30 group-hover:bg-red-600 group-hover:text-white'}`}>{chapter.number}</div>
                                                <div>
                                                    <h4 className={`font-black text-sm uppercase tracking-wider transition-colors ${isRead ? 'text-gray-600' : 'text-gray-300 group-hover:text-white'}`}>Capítulo {chapter.number}</h4>
                                                    <p className="text-[9px] text-gray-500 font-bold uppercase tracking-widest mt-1 flex items-center gap-1"><Clock className="w-3 h-3" /> {timeAgo(chapter.rawTime || Date.now())}</p>
                                                </div>
                                            </div>
                                            {isRead && <CheckCircle className="w-5 h-5 text-red-900" />}
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
