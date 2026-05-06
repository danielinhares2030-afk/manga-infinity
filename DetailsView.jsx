import React, { useState, useEffect } from 'react';
import { ArrowLeft, Star, Play, BookmarkPlus, Share2, CheckCircle, Clock, ChevronRight } from 'lucide-react';
import { doc, updateDoc, setDoc, deleteDoc, increment } from "firebase/firestore";
import { APP_ID } from './constants';
import { CommentsSection } from './CommentsSection';
import { timeAgo } from './helpers';

export default function DetailsView({ manga, libraryData, historyData, user, userProfileData, onBack, onChapterClick, onRequireLogin, showToast, db }) {
    const [localRating, setLocalRating] = useState(Number(manga?.rating) || 5.0);
    const [detailsTab, setDetailsTab] = useState('capitulos'); 
    const [showLibraryMenu, setShowLibraryMenu] = useState(false); 

    const libraryStatuses = ['Lendo', 'Concluído', 'Pausado', 'Dropado', 'Planejo Ler'];

    useEffect(() => {
        if (!manga?.id) return;
        const addView = async () => {
            const sessionKey = `viewed_${manga.id}`;
            if (!sessionStorage.getItem(sessionKey)) {
                try {
                    await updateDoc(doc(db, 'obras', manga.id), { views: increment(1) });
                    sessionStorage.setItem(sessionKey, 'true');
                } catch (e) {}
            }
        };
        addView();
    }, [manga?.id, db]);

    const handleRate = async (ratingValue) => {
        if (!user) return showToast("Faça login para avaliar.", "warning");
        try {
            const finalRating = Number(((localRating + ratingValue) / 2).toFixed(1));
            setLocalRating(finalRating);
            showToast(`Avaliado com ${ratingValue} estrelas!`, "success");
            await updateDoc(doc(db, 'obras', manga.id), { rating: finalRating });
        } catch (e) {}
    };

    const inLibrary = libraryData && libraryData[manga.id];
    
    const updateLibraryStatus = async (status) => {
        if (!user) { onRequireLogin(); return; }
        try {
            const ref = doc(db, 'artifacts', APP_ID, 'users', user.uid, 'library', manga.id.toString());
            if (status === 'Remover') {
                await deleteDoc(ref); showToast("Removido.", "info");
            } else {
                await setDoc(ref, { mangaId: manga.id, status: status, updatedAt: Date.now() }); showToast(`Salvo como: ${status}`, "success");
            }
            setShowLibraryMenu(false);
        } catch (e) {}
    };

    const mangaHistory = (historyData || []).filter(h => h.mangaId === manga.id);
    const lastRead = mangaHistory.length > 0 ? mangaHistory[0] : null;
    const chapters = manga.chapters || [];
    const nextChapterToRead = lastRead ? chapters.find(c => Number(c.number) === Number(lastRead.chapterNumber) + 1) || chapters.find(c => c.id === lastRead.id) : chapters[chapters.length - 1];

    if (!manga) return null;

    return (
        <div className="min-h-screen bg-black text-white font-sans pb-24 relative overflow-x-hidden">
            
            {/* HERO BLUR BACKGROUND */}
            <div className="absolute top-0 left-0 w-full h-[50vh] z-0 overflow-hidden pointer-events-none">
                <img src={manga.coverUrl} className="w-full h-full object-cover opacity-30 blur-[40px]" />
                <div className="absolute inset-0 bg-gradient-to-t from-black via-black/80 to-transparent"></div>
            </div>

            {/* HEADER */}
            <div className="sticky top-0 z-50 bg-black/50 backdrop-blur-xl border-b border-white/5 p-4 flex items-center gap-4">
                <button onClick={onBack} className="p-2 bg-[#111] rounded-full text-white hover:bg-blue-600 transition-colors shadow-sm">
                    <ArrowLeft className="w-5 h-5" />
                </button>
                <h1 className="text-sm font-black uppercase tracking-widest truncate text-white">{manga.title}</h1>
            </div>

            <div className="max-w-5xl mx-auto px-4 pt-8 relative z-10">
                <div className="flex flex-col md:flex-row gap-8">
                    
                    {/* CAPA DA OBRA */}
                    <div className="w-40 md:w-56 mx-auto md:mx-0 flex-shrink-0">
                        <img src={manga.coverUrl} className="w-full rounded-2xl shadow-[0_20px_40px_rgba(0,0,0,0.8)] border-2 border-[#111]" alt="Capa" />
                    </div>

                    {/* INFORMAÇÕES E AÇÕES */}
                    <div className="flex-1 flex flex-col justify-center text-center md:text-left">
                        <h1 className="text-3xl md:text-5xl font-black text-white mb-2 leading-tight">{manga.title}</h1>
                        <p className="text-gray-400 font-bold text-xs uppercase tracking-widest mb-6">{manga.author || 'Autor Desconhecido'}</p>
                        
                        <div className="flex items-center justify-center md:justify-start gap-4 mb-8">
                            <div className="flex items-center gap-1">
                                {[1, 2, 3, 4, 5].map((s) => (
                                    <button key={s} onClick={() => handleRate(s)} className="hover:scale-125 transition-transform"><Star className={`w-6 h-6 ${s <= Math.round(localRating) ? 'text-blue-500 fill-blue-500 drop-shadow-[0_0_10px_rgba(59,130,246,0.6)]' : 'text-gray-700'}`} /></button>
                                ))}
                            </div>
                            <span className="text-xl font-black text-white">{localRating.toFixed(1)}</span>
                        </div>

                        {/* BOTÕES: LER (AZUL) E SALVAR (VERMELHO) */}
                        <div className="flex flex-col sm:flex-row gap-3 w-full max-w-md mx-auto md:mx-0">
                            <button onClick={() => nextChapterToRead ? onChapterClick(manga, nextChapterToRead) : showToast("Indisponível", "warning")} className="flex-1 bg-blue-600 hover:bg-blue-500 text-white font-black py-4 rounded-xl flex items-center justify-center gap-3 text-xs uppercase tracking-widest shadow-[0_0_20px_rgba(59,130,246,0.4)] transition-all active:scale-95">
                                <Play className="w-4 h-4 fill-white" /> {lastRead ? 'Continuar' : 'Ler Agora'}
                            </button>

                            <div className="relative flex-1">
                                <button onClick={() => setShowLibraryMenu(!showLibraryMenu)} className={`w-full py-4 rounded-xl font-black text-xs uppercase tracking-widest flex items-center justify-center gap-2 transition-all active:scale-95 border ${inLibrary ? 'bg-red-600 border-red-500 text-white shadow-[0_0_20px_rgba(220,38,38,0.4)]' : 'bg-[#111] border-white/10 text-gray-300 hover:bg-white/10'}`}>
                                    {inLibrary ? <CheckCircle className="w-4 h-4"/> : <BookmarkPlus className="w-4 h-4"/>} 
                                    {inLibrary ? inLibrary : 'Salvar'}
                                </button>
                                
                                {showLibraryMenu && (
                                    <div className="absolute top-[105%] left-0 w-full bg-[#111] border border-white/10 rounded-xl overflow-hidden shadow-2xl z-50">
                                        {libraryStatuses.map(status => (
                                            <button key={status} onClick={() => updateLibraryStatus(status)} className="w-full text-left px-5 py-4 text-xs font-bold text-white hover:bg-blue-600 uppercase tracking-wider transition-colors">{status}</button>
                                        ))}
                                        {inLibrary && <button onClick={() => updateLibraryStatus('Remover')} className="w-full text-left px-5 py-4 text-xs font-bold text-red-500 hover:bg-red-900/30 uppercase tracking-wider border-t border-white/5 transition-colors">Remover</button>}
                                    </div>
                                )}
                            </div>
                        </div>

                        {/* SINOPSE */}
                        <div className="mt-8 bg-[#0a0a0a] p-6 rounded-2xl border border-white/5">
                            <h3 className="text-[10px] font-black text-blue-500 uppercase tracking-[0.2em] mb-3">Sinopse</h3>
                            <p className="text-gray-300 text-sm leading-relaxed font-medium">{manga.synopsis || "Os segredos desta obra ainda não foram transcritos."}</p>
                        </div>
                    </div>
                </div>

                {/* ABAS */}
                <div className="mt-12 border-b border-white/10 flex gap-6">
                    <button onClick={() => setDetailsTab('capitulos')} className={`pb-4 text-xs font-black uppercase tracking-[0.2em] transition-colors border-b-2 ${detailsTab === 'capitulos' ? 'border-blue-500 text-blue-400' : 'border-transparent text-gray-500 hover:text-white'}`}>
                        Arquivos ({chapters.length})
                    </button>
                    <button onClick={() => setDetailsTab('comentarios')} className={`pb-4 text-xs font-black uppercase tracking-[0.2em] transition-colors border-b-2 ${detailsTab === 'comentarios' ? 'border-blue-500 text-blue-400' : 'border-transparent text-gray-500 hover:text-white'}`}>
                        Sinalizações
                    </button>
                </div>

                {/* CONTEÚDO */}
                <div className="mt-6">
                    {detailsTab === 'capitulos' ? (
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                            {chapters.length === 0 ? (
                                <div className="col-span-full py-10 text-center"><p className="text-gray-600 font-bold text-xs uppercase">Vazio.</p></div>
                            ) : (
                                chapters.map(chapter => {
                                    const isRead = mangaHistory.some(h => h.chapterNumber === chapter.number);
                                    return (
                                        <div key={chapter.id} onClick={() => onChapterClick(manga, chapter)} className={`cursor-pointer flex items-center justify-between p-4 rounded-xl border transition-colors ${isRead ? 'bg-[#0a0a0a] border-white/5 opacity-50' : 'bg-[#111] border-white/10 hover:border-blue-500/50 hover:bg-[#1a1a24]'}`}>
                                            <div>
                                                <h4 className={`text-sm font-black uppercase tracking-wider ${isRead ? 'text-gray-500' : 'text-white'}`}>Capítulo {chapter.number}</h4>
                                                <p className="text-[10px] text-gray-500 font-bold mt-1 flex items-center gap-1"><Clock className="w-3 h-3"/> {timeAgo(chapter.rawTime || Date.now())}</p>
                                            </div>
                                            {isRead ? <CheckCircle className="w-5 h-5 text-gray-600" /> : <ChevronRight className="w-5 h-5 text-blue-500" />}
                                        </div>
                                    );
                                })
                            )}
                        </div>
                    ) : (
                        <CommentsSection mangaId={manga.id} user={user} userProfileData={userProfileData} onRequireLogin={onRequireLogin} showToast={showToast} />
                    )}
                </div>
            </div>
        </div>
    );
}
