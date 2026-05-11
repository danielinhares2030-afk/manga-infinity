import React, { useState, useEffect } from 'react';
import { ChevronLeft, Star, Play, BookOpen, CheckCircle, ChevronDown, Users, Bookmark, Share2, MoreHorizontal, MessageSquare } from 'lucide-react';
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
    
    const displayGenre = manga.genres && manga.genres.length > 0 ? manga.genres.slice(0, 3) : ['Ação', 'Fantasia'];

    return (
        <div className="min-h-screen bg-[#030105] text-gray-200 font-sans pb-24 animate-in fade-in duration-700 relative overflow-x-hidden selection:bg-purple-600/40">
            
            {/* BACKGROUND BLEND SUPER IMERSIVO */}
            <div className="absolute top-0 left-0 w-full h-[70vh] opacity-30 pointer-events-none" style={{ maskImage: 'linear-gradient(to bottom, black 20%, transparent 100%)', WebkitMaskImage: '-webkit-linear-gradient(top, black 20%, transparent 100%)' }}>
                <img src={manga.coverUrl} className="w-full h-full object-cover object-center filter blur-xl scale-110" alt="bg" />
                <div className="absolute inset-0 bg-gradient-to-b from-[#030105]/20 via-[#030105]/80 to-[#030105]"></div>
            </div>

            {/* HEADER FLUTUANTE OUSADO */}
            <div className="sticky top-4 left-0 w-full px-4 md:px-6 z-50 flex justify-center">
                <div className="w-full max-w-5xl flex justify-between items-center bg-white/5 border border-white/10 backdrop-blur-xl rounded-full px-4 py-3 shadow-[0_10px_40px_rgba(0,0,0,0.5)]">
                    <button onClick={onBack} className="flex items-center gap-2 text-white hover:text-fuchsia-400 hover:bg-white/5 px-3 py-1.5 rounded-full transition-all">
                        <ChevronLeft className="w-5 h-5" />
                        <span className="font-bold text-sm hidden md:block">Voltar</span>
                    </button>

                    <div className="flex items-center gap-2">
                        <div className="relative">
                            <button onClick={() => setShowLibraryMenu(!showLibraryMenu)} className={`w-10 h-10 rounded-full border flex items-center justify-center transition-all ${inLibrary ? 'bg-purple-600/20 border-purple-500 shadow-[0_0_15px_rgba(168,85,247,0.4)]' : 'bg-transparent border-white/10 hover:bg-white/10'}`}>
                                <Bookmark className={`w-4 h-4 ${inLibrary ? 'text-purple-400 fill-purple-400' : 'text-gray-300'}`} />
                            </button>
                            {showLibraryMenu && (
                                <div className="absolute right-0 top-full mt-4 w-48 bg-[#0F0D14]/95 backdrop-blur-2xl border border-purple-500/30 rounded-2xl shadow-[0_20px_50px_rgba(0,0,0,0.8)] z-50 overflow-hidden animate-in fade-in slide-in-from-top-2">
                                    <div className="px-4 py-3 bg-gradient-to-r from-purple-900/40 to-transparent border-b border-white/5 text-[10px] font-black text-purple-300 uppercase tracking-widest">
                                        Sua Biblioteca
                                    </div>
                                    {libraryStatuses.map(status => (
                                        <button key={status} onClick={() => updateLibraryStatus(status)} className="w-full text-left px-4 py-3 text-xs font-bold text-gray-300 hover:bg-purple-600/20 hover:text-purple-200 transition-colors">
                                            {status}
                                        </button>
                                    ))}
                                    {inLibrary && (
                                        <button onClick={() => updateLibraryStatus('Remover')} className="w-full text-left px-4 py-3 text-xs font-bold text-red-400 hover:bg-red-500/10 border-t border-white/5 transition-colors">
                                            Remover Obra
                                        </button>
                                    )}
                                </div>
                            )}
                        </div>
                        <button onClick={handleShare} className="w-10 h-10 rounded-full border border-white/10 flex items-center justify-center hover:bg-white/10 transition-colors">
                            <Share2 className="w-4 h-4 text-gray-300" />
                        </button>
                        <button className="w-10 h-10 rounded-full border border-white/10 flex items-center justify-center hover:bg-white/10 transition-colors">
                            <MoreHorizontal className="w-5 h-5 text-gray-300" />
                        </button>
                    </div>
                </div>
            </div>

            <div className="max-w-5xl mx-auto px-4 sm:px-6 pt-12 md:pt-16 relative z-10">
                
                {/* ÁREA HERO OUSADA */}
                <div className="flex flex-col md:flex-row gap-8 md:gap-14 mb-16 items-center md:items-start">
                    
                    {/* CAPA COM GLOW E FLUTUAÇÃO */}
                    <div className="w-[200px] md:w-[280px] flex-shrink-0 relative group perspective-1000">
                        <div className="absolute -inset-2 bg-gradient-to-br from-purple-600 to-fuchsia-600 blur-[30px] opacity-40 group-hover:opacity-70 transition-opacity duration-700 rounded-3xl pointer-events-none"></div>
                        <div className="relative aspect-[2/3] rounded-2xl overflow-hidden shadow-[0_20px_50px_rgba(0,0,0,0.9)] border border-white/10 bg-[#111] transform transition-transform duration-500 group-hover:-translate-y-2 group-hover:scale-[1.02]">
                            <img src={manga.coverUrl} alt={manga.title} className="w-full h-full object-cover" />
                            <div className="absolute bottom-0 left-0 w-full p-4 bg-gradient-to-t from-black via-black/80 to-transparent">
                                <div className="inline-block bg-white/10 backdrop-blur-md px-3 py-1.5 text-[9px] font-black text-white uppercase tracking-widest rounded-lg border border-white/10">
                                    {manga.status || 'Em Lançamento'}
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* INFOS DIREITA (TIPOGRAFIA PREMIUM) */}
                    <div className="flex-1 flex flex-col justify-center text-center md:text-left pt-2 md:pt-6">
                        <h1 className="text-4xl md:text-6xl font-black text-transparent bg-clip-text bg-gradient-to-br from-white via-gray-200 to-gray-500 leading-tight mb-3 tracking-tight drop-shadow-sm">
                            {manga.title || 'Sem Título'}
                        </h1>
                        <p className="text-purple-400 font-bold text-sm md:text-base mb-6 tracking-wide">
                            {manga.author || 'Autor Desconhecido'} <span className="text-gray-600 mx-2">•</span> <span className="text-gray-400">{manga.studio || 'Nexo Studio'}</span>
                        </p>
                        
                        {/* Tags Neumórficas */}
                        <div className="flex flex-wrap justify-center md:justify-start gap-2 mb-8">
                            {displayGenre.map(g => (
                                <span key={g} className="px-4 py-1.5 rounded-full text-xs font-bold text-white bg-white/5 border border-white/10 backdrop-blur-md hover:bg-white/10 hover:border-purple-500/50 transition-all cursor-default">
                                    {g}
                                </span>
                            ))}
                        </div>

                        {/* Sinopse Elegante */}
                        <div className="text-gray-300 text-sm md:text-base leading-relaxed mb-8 font-medium max-w-2xl relative">
                            <p className={`whitespace-pre-wrap ${expandedSynopsis ? '' : 'line-clamp-3 text-transparent bg-clip-text bg-gradient-to-b from-gray-200 to-gray-600'}`}>
                                {manga.synopsis || "Os registros akáshicos ainda não decifraram os mistérios desta obra."}
                            </p>
                            {manga.synopsis && manga.synopsis.length > 150 && (
                                <button onClick={() => setExpandedSynopsis(!expandedSynopsis)} className="mt-3 text-xs font-black text-fuchsia-400 hover:text-fuchsia-300 uppercase tracking-widest transition-colors flex items-center gap-1 mx-auto md:mx-0">
                                    {expandedSynopsis ? 'Reduzir Visão' : 'Expandir Conhecimento'}
                                </button>
                            )}
                        </div>

                        {/* Ações e Estatísticas */}
                        <div className="flex flex-col sm:flex-row items-center gap-6">
                            <button onClick={() => nextChapterToRead ? onChapterClick(manga, nextChapterToRead) : showToast("Nenhum capítulo disponível", "warning")} className="w-full sm:w-auto relative overflow-hidden group bg-white text-black font-black py-4 px-10 rounded-full flex items-center justify-center gap-3 transition-all transform hover:scale-105 shadow-[0_0_30px_rgba(255,255,255,0.2)]">
                                {/* Efeito de Brilho Interno passando */}
                                <div className="absolute top-0 -inset-full h-full w-1/2 z-5 block transform -skew-x-12 bg-gradient-to-r from-transparent to-white opacity-40 group-hover:animate-shine" />
                                <Play className="w-5 h-5 fill-black" />
                                <div className="flex flex-col items-start leading-none text-left">
                                    <span className="text-base">{lastRead ? 'Continuar Leitura' : 'Iniciar Jornada'}</span>
                                    {nextChapterToRead && <span className="text-[11px] text-gray-700 mt-1 font-bold">Capítulo {nextChapterToRead.number}</span>}
                                </div>
                            </button>

                            <div className="flex items-center gap-6 text-sm font-bold bg-white/5 backdrop-blur-md px-6 py-3.5 rounded-full border border-white/10">
                                <div className="flex items-center gap-2">
                                    <Star className="w-4 h-4 text-yellow-500 fill-yellow-500" />
                                    <span className="text-white">{localRating.toFixed(1)}</span>
                                </div>
                                <div className="w-px h-4 bg-white/20"></div>
                                <div className="flex items-center gap-2 text-gray-400">
                                    <BookOpen className="w-4 h-4" />
                                    {chapters.length} Cap.
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                {/* SISTEMA DE AVALIAÇÃO REDESENHADO */}
                <div className="flex flex-col sm:flex-row items-center justify-between gap-4 mb-12 bg-gradient-to-r from-purple-900/20 to-transparent p-5 rounded-3xl border border-purple-500/20 backdrop-blur-sm">
                    <div className="flex flex-col items-center sm:items-start">
                        <span className="text-[10px] font-black text-purple-400 uppercase tracking-widest mb-1">Seu Veredito</span>
                        <span className="text-sm font-medium text-gray-300">{getRatingLabel(localRating)}</span>
                    </div>
                    <div className="flex items-center gap-2">
                        {[1, 2, 3, 4, 5].map((starVal) => (
                            <button key={starVal} onClick={() => handleRate(starVal)} className="focus:outline-none hover:scale-125 transition-transform p-1">
                                <Star className={`w-8 h-8 transition-all duration-300 ${animateRating && starVal <= Math.round(localRating) ? 'animate-bounce text-fuchsia-400 fill-fuchsia-400 scale-110 drop-shadow-[0_0_15px_rgba(232,121,249,0.8)]' : starVal <= Math.round(localRating) ? 'text-purple-500 fill-purple-500 drop-shadow-[0_0_10px_rgba(168,85,247,0.5)]' : 'text-gray-800'}`} />
                            </button>
                        ))}
                    </div>
                </div>

                {/* ABAS MODERNAS */}
                <div className="flex gap-8 border-b border-white/10 mb-8 px-2">
                    <button onClick={() => setDetailsTab('capitulos')} className={`pb-4 text-sm font-black uppercase tracking-wider transition-all relative ${detailsTab === 'capitulos' ? 'text-white' : 'text-gray-600 hover:text-gray-400'}`}>
                        Tomo de Capítulos
                        {detailsTab === 'capitulos' && <div className="absolute bottom-0 left-0 w-full h-[3px] rounded-t-full bg-gradient-to-r from-purple-500 to-fuchsia-500 shadow-[0_-2px_15px_rgba(232,121,249,0.8)]"></div>}
                    </button>
                    <button onClick={() => setDetailsTab('comentarios')} className={`pb-4 text-sm font-black uppercase tracking-wider transition-all relative ${detailsTab === 'comentarios' ? 'text-white' : 'text-gray-600 hover:text-gray-400'}`}>
                        Taverna (Comentários)
                        {detailsTab === 'comentarios' && <div className="absolute bottom-0 left-0 w-full h-[3px] rounded-t-full bg-gradient-to-r from-purple-500 to-fuchsia-500 shadow-[0_-2px_15px_rgba(232,121,249,0.8)]"></div>}
                    </button>
                </div>

                {/* CONTEÚDO DAS ABAS */}
                <div className="w-full pb-10">
                    
                    {detailsTab === 'capitulos' && (
                        <div className="animate-in slide-in-from-bottom-4 duration-500">
                            
                            {/* CONTROLES DA LISTA */}
                            <div className="flex items-center justify-between mb-6 px-2">
                                <h3 className="text-xl font-black text-white hidden sm:block">Acessar Capítulos</h3>
                                <button onClick={() => setSortOrder(prev => prev === 'desc' ? 'asc' : 'desc')} className="ml-auto text-xs font-bold text-white bg-white/5 hover:bg-white/10 border border-white/10 rounded-full px-4 py-2 transition-all flex items-center gap-2">
                                    {sortOrder === 'desc' ? 'Mais Recentes' : 'Mais Antigos'} <ChevronDown className={`w-4 h-4 transition-transform ${sortOrder === 'asc' ? 'rotate-180' : ''}`} />
                                </button>
                            </div>

                            {/* LISTA DE CAPÍTULOS TIPO CARDS DE VIDRO */}
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                {chapters.length === 0 ? (
                                    <div className="col-span-1 md:col-span-2 text-center py-20 bg-white/5 backdrop-blur-md rounded-3xl border border-white/5">
                                        <BookOpen className="w-12 h-12 text-gray-700 mx-auto mb-4" />
                                        <p className="text-gray-500 font-black text-sm uppercase tracking-widest">O Vazio. Nenhum capítulo encontrado.</p>
                                    </div>
                                ) : (
                                    sortedChapters.map((chapter, index) => {
                                        const isRead = mangaHistory.some(h => h.chapterNumber === chapter.number);
                                        const isNextToRead = nextChapterToRead?.id === chapter.id;
                                        
                                        return (
                                            <div key={chapter.id} onClick={() => onChapterClick(manga, chapter)} className={`cursor-pointer rounded-2xl flex items-center gap-4 p-3 transition-all duration-300 group
                                                ${isNextToRead ? 'bg-gradient-to-r from-purple-900/40 to-transparent border border-purple-500/50 shadow-[0_0_20px_rgba(168,85,247,0.15)]' : 'bg-white/5 border border-white/5 hover:bg-white/10 hover:border-white/20'}`}>
                                                
                                                {/* Miniatura Premium */}
                                                <div className="w-[80px] h-[80px] flex-shrink-0 rounded-xl overflow-hidden relative bg-black shadow-inner">
                                                    <img src={manga.coverUrl} className={`w-full h-full object-cover object-center transition-transform duration-700 group-hover:scale-110 ${isRead ? 'opacity-30 grayscale' : 'opacity-90'}`} alt="thumb" />
                                                    {isNextToRead && <div className="absolute inset-0 border-2 border-fuchsia-500/80 rounded-xl"></div>}
                                                    {isRead && <div className="absolute inset-0 flex items-center justify-center bg-black/40"><CheckCircle className="w-6 h-6 text-gray-400" /></div>}
                                                </div>

                                                {/* Info do Card */}
                                                <div className="flex-1 min-w-0">
                                                    <div className="flex items-center gap-2 mb-1">
                                                        <h4 className={`font-black text-base truncate transition-colors ${isRead ? 'text-gray-600' : 'text-white group-hover:text-fuchsia-300'}`}>
                                                            Capítulo {chapter.number}
                                                        </h4>
                                                        {index === 0 && sortOrder === 'desc' && !isRead && (
                                                            <span className="bg-fuchsia-600 text-white text-[9px] font-black px-2 py-0.5 rounded-full uppercase tracking-widest shadow-[0_0_10px_rgba(217,70,239,0.5)]">Novo</span>
                                                        )}
                                                    </div>
                                                    <p className="text-xs text-gray-400 line-clamp-1 mb-2 font-medium">
                                                        {chapter.title || `Ler o capítulo ${chapter.number}`}
                                                    </p>
                                                    <span className="text-[10px] text-gray-500 font-bold uppercase tracking-wider">
                                                        {timeAgo(chapter.rawTime || Date.now())}
                                                    </span>
                                                </div>

                                                {/* Ícone de Ação Flutuante */}
                                                <div className="pr-4">
                                                    {isNextToRead ? (
                                                        <div className="w-10 h-10 rounded-full bg-fuchsia-600 flex items-center justify-center text-white shadow-[0_0_15px_rgba(217,70,239,0.6)] group-hover:scale-110 transition-transform">
                                                            <Play className="w-4 h-4 ml-1 fill-current" />
                                                        </div>
                                                    ) : (
                                                        <div className="w-10 h-10 rounded-full border border-white/10 flex items-center justify-center text-gray-500 group-hover:bg-white/10 transition-colors">
                                                            <BookOpen className="w-4 h-4" />
                                                        </div>
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
                        <div className="animate-in slide-in-from-bottom-4 duration-500 bg-white/5 border border-white/10 rounded-3xl p-4 md:p-6 backdrop-blur-sm">
                            <CommentsSection mangaId={manga.id} user={user} userProfileData={userProfileData} onRequireLogin={onRequireLogin} showToast={showToast} />
                        </div>
                    )}
                </div>
            </div>
            
            {/* CSS inline para animação de brilho do botão principal */}
            <style dangerouslySetInnerHTML={{__html: `
                @keyframes shine {
                    100% { left: 125%; }
                }
                .animate-shine {
                    animation: shine 1.5s infinite;
                    left: -125%;
                }
            `}} />
        </div>
    );
}
