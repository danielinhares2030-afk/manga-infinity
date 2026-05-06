import React, { useState, useEffect } from 'react';
import { ArrowLeft, Star, Play, Library, Share2, BookOpen, CheckCircle, Clock, ChevronDown, Users, Bookmark, ChevronRight } from 'lucide-react';
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

    const formatReaders = (num) => {
        if (!num) return '0';
        return num >= 1000 ? (num / 1000).toFixed(1) + 'K' : num.toString();
    };
    const realReaders = formatReaders(manga.views || manga.leitores || 0);
    const displayGenre = manga.genres && manga.genres.length > 0 ? manga.genres.slice(0, 2).join(', ') : 'Ação, Fantasia';

    return (
        <div className="min-h-screen bg-[#121212] text-[#FFFFFF] font-sans pb-24">
            
            {/* CABEÇALHO FIXO */}
            <header className="sticky top-0 z-50 bg-[#121212]/95 backdrop-blur-md border-b border-[#2A2A2A] px-4 py-3 flex items-center gap-4">
                <button 
                    onClick={onBack} 
                    className="p-2 -ml-2 text-[#FFFFFF] hover:text-[#FF7043] transition-colors rounded-full" 
                    aria-label="Voltar"
                >
                    <ArrowLeft className="w-6 h-6" />
                </button>
                <h1 className="text-lg font-bold truncate">{manga.title || 'Detalhes da Obra'}</h1>
            </header>

            <main className="max-w-4xl mx-auto">
                {/* INFORMAÇÕES DA OBRA */}
                <section className="p-4 md:p-6 flex flex-col md:flex-row gap-6 md:gap-8">
                    <div className="w-32 md:w-48 flex-shrink-0 mx-auto md:mx-0">
                        <img 
                            src={manga.coverUrl} 
                            alt={`Capa de ${manga.title}`} 
                            className="w-full rounded-md shadow-md object-cover aspect-[2/3] bg-[#1E1E1E]" 
                        />
                    </div>
                    
                    <div className="flex-1 flex flex-col justify-center">
                        <h2 className="text-2xl md:text-3xl font-bold leading-tight text-[#FFFFFF]">{manga.title}</h2>
                        <p className="text-base text-[#B3B3B3] mt-1 font-medium">{manga.author || 'Autor desconhecido'}</p>

                        {/* ESTATÍSTICAS E AVALIAÇÃO */}
                        <div className="flex flex-wrap items-center gap-5 mt-4">
                            <div className="flex items-center gap-1.5">
                                <Star className="w-5 h-5 text-[#FF7043] fill-[#FF7043]" />
                                <span className="font-bold text-lg text-[#FFFFFF]">{localRating.toFixed(1)}</span>
                            </div>
                            <div className="flex items-center gap-1.5 text-[#B3B3B3] text-sm">
                                <Users className="w-4 h-4" />
                                <span>{realReaders} leitores</span>
                            </div>
                            <div className="flex items-center gap-1.5 text-[#B3B3B3] text-sm">
                                <Bookmark className="w-4 h-4" />
                                <span>{displayGenre}</span>
                            </div>
                        </div>

                        {/* INTERAÇÃO DE AVALIAÇÃO (STARS) */}
                        <div className="flex items-center gap-1 mt-4">
                            {[1, 2, 3, 4, 5].map((starVal) => (
                                <button key={starVal} onClick={() => handleRate(starVal)} className="p-1 -ml-1 focus:outline-none transition-transform hover:scale-110" aria-label={`Avaliar ${starVal} estrelas`}>
                                    <Star className={`w-6 h-6 ${starVal <= Math.round(localRating) ? 'text-[#FF7043] fill-[#FF7043]' : 'text-[#2A2A2A]'}`} />
                                </button>
                            ))}
                        </div>

                        {/* BOTÕES DE AÇÃO PRINCIPAIS E SECUNDÁRIOS */}
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mt-6">
                            <button 
                                onClick={() => nextChapterToRead ? onChapterClick(manga, nextChapterToRead) : showToast("Nenhum capítulo disponível", "warning")} 
                                className="h-12 bg-[#FF7043] hover:bg-[#F4511E] active:bg-[#E64A19] text-[#FFFFFF] font-bold rounded-lg flex items-center justify-center gap-2 transition-colors shadow-sm"
                            >
                                <Play className="w-5 h-5 fill-current" />
                                <span>{lastRead ? 'CONTINUAR LEITURA' : 'LER AGORA'}</span>
                            </button>

                            <div className="flex gap-3">
                                <div className="relative flex-1">
                                    <button 
                                        onClick={() => setShowLibraryMenu(!showLibraryMenu)} 
                                        className={`h-12 w-full rounded-lg border font-bold flex items-center justify-center gap-2 transition-colors 
                                        ${inLibrary ? 'bg-[#42A5F5]/10 border-[#42A5F5] text-[#42A5F5]' : 'bg-[#1E1E1E] border-transparent text-[#FFFFFF] hover:bg-[#2A2A2A]'}`}
                                    >
                                        {inLibrary ? <CheckCircle className="w-5 h-5" /> : <Library className="w-5 h-5" />}
                                        <span className="truncate">{inLibrary ? inLibrary : 'ADICIONAR'}</span>
                                    </button>
                                    
                                    {showLibraryMenu && (
                                        <div className="absolute top-full left-0 w-full mt-2 bg-[#1E1E1E] border border-[#2A2A2A] rounded-lg shadow-xl z-50 overflow-hidden">
                                            {libraryStatuses.map(status => (
                                                <button key={status} onClick={() => updateLibraryStatus(status)} className="w-full text-left px-4 py-4 text-sm font-medium text-[#FFFFFF] hover:bg-[#2A2A2A] transition-colors">
                                                    {status}
                                                </button>
                                            ))}
                                            {inLibrary && (
                                                <button onClick={() => updateLibraryStatus('Remover')} className="w-full text-left px-4 py-4 text-sm font-medium text-[#FF7043] hover:bg-[#FF7043]/10 border-t border-[#2A2A2A] transition-colors">
                                                    Remover da Biblioteca
                                                </button>
                                            )}
                                        </div>
                                    )}
                                </div>
                                <button 
                                    onClick={handleShare} 
                                    className="h-12 w-12 flex-shrink-0 bg-[#1E1E1E] rounded-lg flex items-center justify-center text-[#FFFFFF] hover:bg-[#2A2A2A] transition-colors" 
                                    aria-label="Compartilhar"
                                >
                                    <Share2 className="w-5 h-5" />
                                </button>
                            </div>
                        </div>

                        {/* SINOPSE */}
                        <div className="mt-8">
                            <h3 className="text-sm font-bold text-[#FFFFFF] mb-2 uppercase tracking-wider">Sinopse</h3>
                            <p className={`text-sm text-[#B3B3B3] leading-relaxed ${expandedSynopsis ? '' : 'line-clamp-3'}`}>
                                {manga.synopsis || "Detalhes desta obra ainda não foram documentados em nossos registros."}
                            </p>
                            {manga.synopsis && manga.synopsis.length > 180 && (
                                <button onClick={() => setExpandedSynopsis(!expandedSynopsis)} className="text-[#42A5F5] text-sm font-medium mt-2 hover:underline">
                                    {expandedSynopsis ? 'Ler menos' : 'Ler mais'}
                                </button>
                            )}
                        </div>
                    </div>
                </section>

                {/* SEGMENTED CONTROL (ABAS) */}
                <section className="mt-2">
                    <div className="flex border-b border-[#2A2A2A]">
                        <button 
                            onClick={() => setDetailsTab('capitulos')} 
                            className={`flex-1 py-4 text-sm font-bold transition-colors border-b-2 
                            ${detailsTab === 'capitulos' ? 'border-[#42A5F5] text-[#42A5F5]' : 'border-transparent text-[#B3B3B3] hover:text-[#FFFFFF]'}`}
                        >
                            CAPÍTULOS ({chapters.length})
                        </button>
                        <button 
                            onClick={() => setDetailsTab('comentarios')} 
                            className={`flex-1 py-4 text-sm font-bold transition-colors border-b-2 
                            ${detailsTab === 'comentarios' ? 'border-[#42A5F5] text-[#42A5F5]' : 'border-transparent text-[#B3B3B3] hover:text-[#FFFFFF]'}`}
                        >
                            COMENTÁRIOS
                        </button>
                    </div>

                    {/* CONTEÚDO DAS ABAS */}
                    <div className="pb-8">
                        {detailsTab === 'capitulos' ? (
                            <div className="flex flex-col">
                                {chapters.length === 0 ? (
                                    <div className="py-16 text-center text-[#B3B3B3]">
                                        <BookOpen className="w-12 h-12 mx-auto mb-4 opacity-40" />
                                        <p className="text-sm font-medium">Nenhum capítulo disponível no momento.</p>
                                    </div>
                                ) : (
                                    chapters.map(chapter => {
                                        const isRead = mangaHistory.some(h => h.chapterNumber === chapter.number);
                                        return (
                                            <div 
                                                key={chapter.id} 
                                                onClick={() => onChapterClick(manga, chapter)} 
                                                className="flex items-center justify-between p-4 border-b border-[#1E1E1E] hover:bg-[#1E1E1E]/50 cursor-pointer transition-colors group"
                                            >
                                                {/* ESTILO SUBTITLE: ALINHADO À ESQUERDA */}
                                                <div className="flex flex-col gap-1.5">
                                                    <h4 className={`text-base font-medium transition-colors ${isRead ? 'text-[#B3B3B3]' : 'text-[#FFFFFF] group-hover:text-[#42A5F5]'}`}>
                                                        Capítulo {chapter.number}
                                                    </h4>
                                                    <div className="flex items-center gap-1.5 text-xs text-[#B3B3B3]">
                                                        <Clock className="w-3.5 h-3.5" />
                                                        <span>{timeAgo(chapter.rawTime || Date.now())}</span>
                                                    </div>
                                                </div>
                                                
                                                {/* INDICADOR DE LEITURA */}
                                                {isRead ? (
                                                    <CheckCircle className="w-6 h-6 text-[#B3B3B3]" />
                                                ) : (
                                                    <ChevronRight className="w-5 h-5 text-[#B3B3B3] opacity-0 group-hover:opacity-100 transition-opacity" />
                                                )}
                                            </div>
                                        );
                                    })
                                )}
                            </div>
                        ) : (
                            <div className="py-6 px-4">
                                <CommentsSection 
                                    mangaId={manga.id} 
                                    user={user} 
                                    userProfileData={userProfileData} 
                                    onRequireLogin={onRequireLogin} 
                                    showToast={showToast} 
                                />
                            </div>
                        )}
                    </div>
                </section>
            </main>
        </div>
    );
}
