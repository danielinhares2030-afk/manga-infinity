import React, { useState, useEffect } from 'react';
import { ArrowLeft, Star, Play, Library, Share2, BookOpen, CheckCircle, Clock } from 'lucide-react';
import { doc, updateDoc, setDoc, deleteDoc } from "firebase/firestore";
import { APP_ID } from './constants';
import { CommentsSection } from './CommentsSection'; // Integração dos Comentários

export default function DetailsView({ manga, libraryData, historyData, user, userProfileData, onBack, onChapterClick, onRequireLogin, showToast, db }) {
    const [isSharing, setIsSharing] = useState(false);
    
    // ESTADO LOCAL PARA ATUALIZAÇÃO IMEDIATA DA NOTA
    const [localRating, setLocalRating] = useState(manga.rating || 5.0);

    // Sincroniza caso a nota mude de fora
    useEffect(() => {
        setLocalRating(manga.rating || 5.0);
    }, [manga.rating]);

    const handleRate = async (ratingValue) => {
        if (!user) return showToast("Apenas Viajantes registados podem avaliar.", "warning");
        
        try {
            const newRating = ((localRating + ratingValue) / 2).toFixed(1);
            
            // ATUALIZAÇÃO OTIMISTA (Atualiza a UI na hora!)
            setLocalRating(Number(newRating));
            showToast(`Avaliação de ${ratingValue} estrelas registada no Vazio!`, "success");

            // Envia para o banco em background
            const mangaRef = doc(db, 'obras', manga.id);
            await updateDoc(mangaRef, {
                rating: Number(newRating)
            });
        } catch (error) {
            // Se falhar, reverte para o que estava na prop
            setLocalRating(manga.rating || 5.0);
            showToast("Erro ao conectar com o Vazio. Tente novamente.", "error");
        }
    };

    const inLibrary = libraryData && libraryData[manga.id];
    const handleLibraryToggle = async () => {
        if (!user) {
            onRequireLogin();
            return;
        }
        try {
            const ref = doc(db, 'artifacts', APP_ID, 'users', user.uid, 'library', manga.id.toString());
            if (inLibrary) {
                await deleteDoc(ref);
                showToast("Removido da Biblioteca.", "info");
            } else {
                await setDoc(ref, { mangaId: manga.id, status: 'Lendo', updatedAt: Date.now() });
                showToast("Adicionado à Biblioteca!", "success");
            }
        } catch (error) {
            showToast("Erro ao atualizar biblioteca.", "error");
        }
    };

    const handleShare = () => {
        setIsSharing(true);
        navigator.clipboard.writeText(window.location.href);
        showToast("Link copiado para a área de transferência!", "success");
        setTimeout(() => setIsSharing(false), 2000);
    };

    const mangaHistory = historyData.filter(h => h.mangaId === manga.id);
    const lastRead = mangaHistory.length > 0 ? mangaHistory[0] : null;
    const chapters = manga.chapters || [];
    const firstChapter = chapters.length > 0 ? chapters[chapters.length - 1] : null;
    const nextChapterToRead = lastRead 
        ? chapters.find(c => Number(c.number) === Number(lastRead.chapterNumber) + 1) || chapters.find(c => c.id === lastRead.id)
        : firstChapter;

    return (
        <div className="min-h-screen bg-[#020204] text-gray-200 font-sans pb-24 animate-in fade-in duration-700 relative overflow-hidden">
            
            {/* ELEMENTOS SURREAIS DE FUNDO */}
            <div className="absolute top-0 left-1/4 w-[500px] h-[500px] bg-cyan-900/20 rounded-full blur-[150px] pointer-events-none mix-blend-screen animate-[pulse_8s_ease-in-out_infinite]"></div>
            <div className="absolute top-1/3 right-1/4 w-[400px] h-[400px] bg-fuchsia-900/10 rounded-full blur-[150px] pointer-events-none mix-blend-screen animate-[pulse_12s_ease-in-out_infinite_reverse]"></div>

            <div className="relative h-72 md:h-96 w-full overflow-hidden">
                <div className="absolute inset-0 bg-[#020204]">
                    <img src={manga.coverUrl} className="w-full h-full object-cover opacity-20 blur-md scale-110" alt="Capa de Fundo" />
                </div>
                {/* Gradiente mais profundo pro surrealismo */}
                <div className="absolute inset-0 bg-gradient-to-t from-[#020204] via-[#020204]/90 to-transparent" />
                <div className="absolute inset-0 bg-gradient-to-b from-black/50 via-transparent to-transparent" />
                
                <button onClick={onBack} className="absolute top-4 md:top-6 left-4 md:left-6 z-10 p-3 bg-black/40 backdrop-blur-md rounded-full border border-white/10 hover:bg-white/20 hover:border-cyan-400 hover:scale-110 transition-all duration-300 shadow-[0_0_15px_rgba(0,0,0,0.5)]">
                    <ArrowLeft className="w-6 h-6 text-white" />
                </button>
            </div>

            <div className="max-w-5xl mx-auto px-4 sm:px-6 relative -mt-36 md:-mt-48 z-10">
                <div className="flex flex-col md:flex-row gap-8 items-center md:items-start">
                    
                    {/* CAPA FLUTUANTE SURREAL */}
                    <div className="w-44 md:w-64 flex-shrink-0 relative group animate-[levitar_5s_ease-in-out_infinite]">
                        <style>{`@keyframes levitar { 0%, 100% { transform: translateY(0); } 50% { transform: translateY(-10px); } }`}</style>
                        <div className="absolute -inset-1 bg-gradient-to-b from-cyan-500 to-fuchsia-600 rounded-2xl blur opacity-20 group-hover:opacity-50 transition duration-1000"></div>
                        <div className="aspect-[2/3] relative rounded-2xl overflow-hidden shadow-[0_20px_50px_rgba(0,0,0,0.9)] border border-white/10 group-hover:border-cyan-400 transition-colors duration-500 z-10">
                            <img src={manga.coverUrl} alt={manga.title} className="w-full h-full object-cover" />
                        </div>
                        {manga.status && (
                            <div className="absolute -top-4 -right-4 bg-[#050508] text-cyan-400 text-[10px] font-black uppercase tracking-widest px-4 py-2 rounded-full shadow-[0_0_20px_rgba(34,211,238,0.4)] border border-cyan-500 z-20">
                                {manga.status}
                            </div>
                        )}
                    </div>

                    <div className="flex-1 text-center md:text-left mt-2 md:mt-16 relative z-10">
                        <h1 className="text-3xl md:text-5xl font-black text-transparent bg-clip-text bg-gradient-to-b from-white to-gray-400 leading-tight tracking-tighter mb-3 drop-shadow-2xl">{manga.title}</h1>
                        <p className="text-sm text-cyan-400 font-bold uppercase tracking-[0.3em] mb-6 drop-shadow-[0_0_8px_rgba(34,211,238,0.5)]">{manga.author || 'Autor Desconhecido'}</p>
                        
                        <div className="flex items-center justify-center md:justify-start gap-1 mb-8 bg-[#0d0d12]/50 w-fit mx-auto md:mx-0 px-4 py-2 rounded-2xl border border-white/5 backdrop-blur-sm">
                            {[1, 2, 3, 4, 5].map((star) => (
                                <button key={star} onClick={() => handleRate(star)} className="focus:outline-none hover:scale-125 transition-transform duration-300">
                                    <Star className={`w-5 h-5 md:w-6 md:h-6 ${star <= Math.round(localRating) ? 'text-amber-400 fill-amber-400 drop-shadow-[0_0_12px_rgba(251,191,36,0.8)]' : 'text-gray-700 hover:text-amber-400/50'}`} />
                                </button>
                            ))}
                            <span className="text-amber-400 font-black ml-3 text-xl drop-shadow-[0_0_10px_rgba(251,191,36,0.6)]">
                                {localRating.toFixed(1)}
                            </span>
                        </div>

                        <div className="flex flex-wrap items-center justify-center md:justify-start gap-4">
                            <button 
                                onClick={() => nextChapterToRead ? onChapterClick(manga, nextChapterToRead) : showToast("Nenhum capítulo disponível", "warning")} 
                                className="flex-1 md:flex-none relative group overflow-hidden bg-gradient-to-r from-cyan-600 to-blue-700 text-white font-black px-8 py-4 rounded-xl shadow-[0_0_20px_rgba(8,145,178,0.4)] transition-all hover:scale-105 uppercase tracking-widest text-xs border border-cyan-400/30"
                            >
                                <div className="absolute inset-0 bg-white/20 translate-x-[-100%] group-hover:translate-x-[100%] transition-transform duration-700"></div>
                                <span className="flex items-center justify-center gap-2 relative z-10"><Play className="w-5 h-5 fill-white" /> {lastRead ? 'Continuar Leitura' : 'Mergulhar na Obra'}</span>
                            </button>
                            
                            <button onClick={handleLibraryToggle} className={`p-4 rounded-xl border font-black flex items-center justify-center transition-all duration-300 shadow-lg relative overflow-hidden group ${inLibrary ? 'bg-amber-950/40 border-amber-500/50 text-amber-400' : 'bg-[#13151f] border-white/10 text-gray-300 hover:border-cyan-500 hover:text-cyan-400'}`} title="Adicionar à Biblioteca">
                                {inLibrary ? <CheckCircle className="w-5 h-5 group-hover:scale-110 transition-transform" /> : <Library className="w-5 h-5 group-hover:scale-110 transition-transform" />}
                            </button>
                            
                            <button onClick={handleShare} className="p-4 bg-[#13151f] rounded-xl border border-white/10 text-gray-300 hover:border-cyan-500 hover:text-cyan-400 transition-all duration-300 shadow-lg group" title="Compartilhar">
                                <Share2 className="w-5 h-5 group-hover:scale-110 transition-transform" />
                            </button>
                        </div>
                    </div>
                </div>

                <div className="mt-10 flex flex-wrap justify-center md:justify-start gap-2 relative z-10">
                    {manga.genres?.map(genre => (
                        <span key={genre} className="bg-[#050508]/80 backdrop-blur-md border border-white/10 text-cyan-100/80 px-5 py-2 rounded-full text-[10px] font-black uppercase tracking-[0.2em] shadow-inner hover:border-cyan-500 hover:text-cyan-300 transition-colors cursor-default">
                            {genre}
                        </span>
                    ))}
                </div>

                <div className="mt-10 relative z-10">
                    <div className="absolute -inset-1 bg-gradient-to-r from-cyan-900/20 to-fuchsia-900/20 blur-xl"></div>
                    <div className="relative bg-[#0b0e14]/80 backdrop-blur-xl border border-white/5 p-6 md:p-8 rounded-[2rem] shadow-2xl">
                        <h3 className="text-white font-black mb-4 uppercase tracking-[0.2em] text-sm flex items-center gap-2">
                            <BookOpen className="w-4 h-4 text-cyan-400" /> Fragmentos da História
                        </h3>
                        <p className="text-gray-400 text-sm md:text-base leading-relaxed whitespace-pre-wrap font-medium">
                            {manga.synopsis || "Os registos do Vazio ainda não possuem informações sobre esta obra."}
                        </p>
                    </div>
                </div>

                <div className="mt-12 relative z-10">
                    <div className="flex items-center justify-between mb-6">
                        <h3 className="text-xl font-black text-white uppercase tracking-[0.2em] flex items-center gap-3">
                            <Clock className="w-5 h-5 text-cyan-400" /> Capítulos
                        </h3>
                        <span className="text-[10px] text-cyan-400 font-black uppercase tracking-widest bg-cyan-950/40 px-4 py-1.5 rounded-full border border-cyan-500/30 shadow-[0_0_10px_rgba(34,211,238,0.2)]">
                            {chapters.length} Gravados
                        </span>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                        {chapters.length === 0 ? (
                            <div className="col-span-full text-center py-12 bg-[#0b0e14]/50 backdrop-blur-md rounded-3xl border border-white/5">
                                <BookOpen className="w-10 h-10 text-gray-700 mx-auto mb-4" />
                                <p className="text-gray-500 font-black text-[10px] uppercase tracking-[0.2em]">Nenhum capítulo traduzido ainda.</p>
                            </div>
                        ) : (
                            chapters.map(chapter => {
                                const isRead = mangaHistory.some(h => h.chapterNumber === chapter.number);
                                return (
                                    <div 
                                        key={chapter.id} 
                                        onClick={() => onChapterClick(manga, chapter)}
                                        className={`group cursor-pointer p-4 rounded-2xl border flex items-center justify-between transition-all duration-300 relative overflow-hidden ${isRead ? 'bg-[#050508]/60 border-white/5 opacity-60' : 'bg-[#0b0e14]/80 backdrop-blur-md border-white/10 hover:border-cyan-400 hover:shadow-[0_0_20px_rgba(34,211,238,0.15)]'}`}
                                    >
                                        {!isRead && <div className="absolute inset-0 bg-gradient-to-r from-cyan-900/0 via-cyan-900/10 to-transparent translate-x-[-100%] group-hover:translate-x-[100%] transition-transform duration-700"></div>}
                                        <div className="flex items-center gap-4 relative z-10">
                                            <div className={`w-12 h-12 rounded-xl flex items-center justify-center font-black text-lg transition-all shadow-inner ${isRead ? 'bg-black text-gray-700 border border-white/5' : 'bg-[#050508] border border-cyan-500/30 text-cyan-400 group-hover:bg-cyan-500 group-hover:text-white'}`}>
                                                {chapter.number}
                                            </div>
                                            <div>
                                                <h4 className={`font-black text-sm uppercase tracking-wider transition-colors ${isRead ? 'text-gray-600' : 'text-gray-200 group-hover:text-white'}`}>
                                                    Capítulo {chapter.number}
                                                </h4>
                                                {chapter.title && <p className="text-[10px] text-gray-500 uppercase tracking-widest mt-1 line-clamp-1">{chapter.title}</p>}
                                            </div>
                                        </div>
                                        {isRead && <CheckCircle className="w-5 h-5 text-cyan-800 relative z-10" />}
                                    </div>
                                );
                            })
                        )}
                    </div>
                </div>
                
                {/* INTEGRAÇÃO DOS COMENTÁRIOS */}
                <CommentsSection 
                    mangaId={manga.id} 
                    user={user} 
                    userProfileData={userProfileData} 
                    onRequireLogin={onRequireLogin} 
                    showToast={showToast} 
                />

            </div>
        </div>
    );
}
