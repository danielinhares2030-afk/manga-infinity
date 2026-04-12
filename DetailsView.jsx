import React, { useState, useEffect } from 'react';
import { ArrowLeft, Star, Play, Library, Share2, BookOpen, CheckCircle, Clock } from 'lucide-react';
import { doc, updateDoc, setDoc, deleteDoc } from "firebase/firestore";
import { APP_ID } from './constants';

export default function DetailsView({ manga, libraryData, historyData, user, userProfileData, onBack, onChapterClick, onRequireLogin, showToast, db }) {
    const [isSharing, setIsSharing] = useState(false);
    
    // MÁGICA DA AVALIAÇÃO: Estado local
    const [localRating, setLocalRating] = useState(manga.rating || 0);

    const handleRate = async (ratingValue) => {
        if (!user) return showToast("Apenas Viajantes registados podem avaliar.", "warning");
        
        try {
            const currentRating = localRating || 5.0;
            const newRating = Number(((currentRating + ratingValue) / 2).toFixed(1));
            
            // Muda a tela na hora
            setLocalRating(newRating);

            const mangaRef = doc(db, 'obras', manga.id);
            await updateDoc(mangaRef, { rating: newRating });
            
            showToast(`Avaliação de ${ratingValue} estrelas registada no Vazio!`, "success");
        } catch (error) {
            showToast("Erro ao conectar com o Vazio. Verifique o Firebase.", "error");
        }
    };

    const inLibrary = libraryData && libraryData[manga.id];
    const handleLibraryToggle = async () => {
        if (!user) { onRequireLogin(); return; }
        try {
            const ref = doc(db, 'artifacts', APP_ID, 'users', user.uid, 'library', manga.id.toString());
            if (inLibrary) { await deleteDoc(ref); showToast("Removido da Biblioteca.", "info"); } 
            else { await setDoc(ref, { mangaId: manga.id, status: 'Lendo', updatedAt: Date.now() }); showToast("Adicionado à Biblioteca!", "success"); }
        } catch (error) { showToast("Erro ao atualizar biblioteca.", "error"); }
    };

    const handleShare = () => {
        setIsSharing(true); navigator.clipboard.writeText(window.location.href);
        showToast("Link copiado para a área de transferência!", "success");
        setTimeout(() => setIsSharing(false), 2000);
    };

    const mangaHistory = historyData.filter(h => h.mangaId === manga.id);
    const lastRead = mangaHistory.length > 0 ? mangaHistory[0] : null;
    const chapters = manga.chapters || [];
    const firstChapter = chapters.length > 0 ? chapters[chapters.length - 1] : null;
    const nextChapterToRead = lastRead ? (chapters.find(c => Number(c.number) === Number(lastRead.chapterNumber) + 1) || chapters.find(c => c.id === lastRead.id)) : firstChapter;

    return (
        <div className="min-h-screen bg-[#050508] text-gray-200 font-sans pb-24 animate-in fade-in duration-500">
            <div className="relative h-64 md:h-80 w-full overflow-hidden">
                <div className="absolute inset-0 bg-[#0d0d12]">
                    <img src={manga.coverUrl} className="w-full h-full object-cover opacity-30 blur-sm scale-110" alt="Capa de Fundo" />
                </div>
                <div className="absolute inset-0 bg-gradient-to-t from-[#050508] via-[#050508]/80 to-transparent" />
                <button onClick={onBack} className="absolute top-4 md:top-6 left-4 md:left-6 z-10 p-3 bg-black/40 backdrop-blur-md rounded-full border border-white/10 hover:bg-white/10 hover:scale-105 transition-all duration-300 shadow-lg">
                    <ArrowLeft className="w-6 h-6 text-white" />
                </button>
            </div>

            <div className="max-w-5xl mx-auto px-4 sm:px-6 relative -mt-32 md:-mt-40 z-10">
                <div className="flex flex-col md:flex-row gap-6 md:gap-8 items-center md:items-start">
                    
                    <div className="w-40 md:w-56 flex-shrink-0 relative group">
                        <div className="aspect-[2/3] rounded-2xl overflow-hidden shadow-[0_10px_40px_rgba(0,0,0,0.8)] border border-white/10 group-hover:border-cyan-500/50 transition-colors duration-500">
                            <img src={manga.coverUrl} alt={manga.title} className="w-full h-full object-cover" />
                        </div>
                    </div>

                    <div className="flex-1 text-center md:text-left mt-2 md:mt-12">
                        <h1 className="text-3xl md:text-4xl font-black text-white leading-tight tracking-tight mb-2">{manga.title}</h1>
                        
                        <div className="flex items-center justify-center md:justify-start gap-1 mb-6 mt-4">
                            {[1, 2, 3, 4, 5].map((star) => (
                                <button key={star} onClick={() => handleRate(star)} className="focus:outline-none hover:scale-125 transition-transform duration-300">
                                    <Star className={`w-5 h-5 md:w-6 md:h-6 ${star <= Math.round(localRating) ? 'text-amber-400 fill-amber-400 drop-shadow-[0_0_8px_rgba(251,191,36,0.6)]' : 'text-gray-700 hover:text-amber-400/50'}`} />
                                </button>
                            ))}
                            <span className="text-amber-400 font-black ml-2 text-lg drop-shadow-[0_0_8px_rgba(251,191,36,0.5)]">
                                {localRating ? Number(localRating).toFixed(1) : "0.0"}
                            </span>
                        </div>

                        <div className="flex flex-wrap items-center justify-center md:justify-start gap-3">
                            <button onClick={() => nextChapterToRead ? onChapterClick(manga, nextChapterToRead) : showToast("Nenhum capítulo disponível", "warning")} className="flex-1 md:flex-none bg-gradient-to-r from-cyan-600 to-blue-600 hover:from-cyan-500 hover:to-blue-500 text-white font-black px-6 py-3.5 rounded-xl shadow-[0_0_20px_rgba(8,145,178,0.3)] hover:scale-105 transition-all text-xs uppercase tracking-widest flex items-center justify-center gap-2">
                                <Play className="w-5 h-5 fill-white" /> {lastRead ? 'Continuar Leitura' : 'Começar a Ler'}
                            </button>
                            <button onClick={handleLibraryToggle} className={`p-3.5 rounded-xl border font-black flex items-center justify-center transition-all duration-300 shadow-sm ${inLibrary ? 'bg-amber-950/40 border-amber-500/50 text-amber-500' : 'bg-[#13151f] border-white/10 text-gray-300 hover:bg-white/5 hover:border-cyan-500/50'}`}>
                                {inLibrary ? <CheckCircle className="w-5 h-5" /> : <Library className="w-5 h-5" />}
                            </button>
                        </div>
                    </div>
                </div>

                <div className="mt-8 bg-[#13151f]/50 border border-white/5 p-6 rounded-2xl shadow-inner">
                    <h3 className="text-white font-black mb-3 uppercase tracking-widest text-sm flex items-center gap-2"><BookOpen className="w-4 h-4 text-cyan-500" /> Sinopse</h3>
                    <p className="text-gray-400 text-sm leading-relaxed whitespace-pre-wrap font-medium">{manga.synopsis || "Os registos do Vazio ainda não possuem informações sobre esta obra."}</p>
                </div>

                <div className="mt-10">
                    <div className="flex items-center justify-between mb-6">
                        <h3 className="text-xl font-black text-white uppercase tracking-tight flex items-center gap-2"><Clock className="w-5 h-5 text-cyan-500" /> Capítulos</h3>
                    </div>

                    <div className="flex flex-col gap-3">
                        {chapters.map(chapter => {
                            const isRead = mangaHistory.some(h => h.chapterNumber === chapter.number);
                            return (
                                <div key={chapter.id} onClick={() => onChapterClick(manga, chapter)} className={`group cursor-pointer p-4 rounded-2xl border flex items-center justify-between transition-all duration-300 ${isRead ? 'bg-black/40 border-white/5 opacity-70' : 'bg-[#13151f] border-white/5 hover:border-cyan-500/50 hover:bg-cyan-950/10 shadow-sm'}`}>
                                    <div className="flex items-center gap-4">
                                        <div className={`w-10 h-10 rounded-xl flex items-center justify-center font-black transition-colors ${isRead ? 'bg-black text-gray-600' : 'bg-cyan-950/50 text-cyan-400 group-hover:bg-cyan-600 group-hover:text-white'}`}>{chapter.number}</div>
                                        <div><h4 className={`font-bold text-sm transition-colors ${isRead ? 'text-gray-500' : 'text-gray-200 group-hover:text-white'}`}>Capítulo {chapter.number}</h4></div>
                                    </div>
                                    {isRead && <CheckCircle className="w-5 h-5 text-cyan-700" />}
                                </div>
                            );
                        })}
                    </div>
                </div>
            </div>
        </div>
    );
}
