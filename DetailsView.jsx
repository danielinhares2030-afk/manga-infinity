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
        <div className="min-h-screen bg-[#05040a] text-gray-200 font-sans pb-24 animate-in fade-in duration-1000 relative overflow-x-hidden selection:bg-fuchsia-500/40">
            {/* ELEMENTOS SURREAIS DE FUNDO (AMBIENTE NEON/ANIME) */}
            <div className="fixed inset-0 pointer-events-none bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-fuchsia-900/10 via-[#05040a] to-[#020105] z-0"></div>
            <div className="fixed top-[-20%] left-[-10%] w-[60%] h-[60%] bg-cyan-600/10 blur-[150px] rounded-full pointer-events-none z-0"></div>
            <div className="fixed bottom-[-10%] right-[-10%] w-[50%] h-[50%] bg-fuchsia-700/10 blur-[150px] rounded-full pointer-events-none z-0"></div>
            <div className="fixed inset-0 pointer-events-none z-0 opacity-20 mix-blend-overlay" style={{ backgroundImage: 'radial-gradient(circle at 2px 2px, rgba(255,255,255,0.15) 1px, transparent 0)', backgroundSize: '32px 32px' }}></div>

            <div className="absolute top-0 left-0 w-full p-4 md:p-6 z-50 flex justify-between items-center">
                <button onClick={onBack} className="p-3 bg-black/40 backdrop-blur-xl rounded-full border border-white/10 hover:border-fuchsia-500 hover:bg-fuchsia-950/30 transition-all shadow-[0_0_20px_rgba(217,70,239,0.2)] hover:shadow-[0_0_30px_rgba(217,70,239,0.5)] group">
                    <ArrowLeft className="w-5 h-5 text-white group-hover:-translate-x-1 transition-transform" />
                </button>
            </div>

            <div className="max-w-5xl mx-auto px-4 sm:px-6 pt-20 md:pt-28 relative z-10">
                <div className="flex flex-col md:flex-row gap-8 md:gap-14">
                    <div className="w-full md:w-[320px] flex-shrink-0 flex justify-center md:justify-start">
                        <div className="relative w-full max-w-[280px] md:max-w-full hover:-translate-y-3 transition-transform duration-700 group perspective-1000">
                            {/* BRILHO SURREAL DA CAPA */}
                            <div className="absolute -inset-2 bg-gradient-to-tr from-cyan-600/40 via-purple-600/40 to-fuchsia-600/40 blur-[40px] rounded-2xl pointer-events-none group-hover:blur-[50px] transition-all duration-700 animate-pulse"></div>
                            
                            {/* CAPA ESTILO ANIME (CORTES GEOMÉTRICOS) */}
                            <div className="relative aspect-[2/3] rounded-2xl rounded-tr-[3rem] rounded-bl-[3rem] overflow-hidden shadow-[0_0_40px_rgba(217,70,239,0.3)] border-2 border-white/5 group-hover:border-fuchsia-500/50 transition-colors duration-500 z-10">
                                <img src={manga.coverUrl} alt={manga.title} className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-1000 ease-out" />
                                <div className="absolute inset-0 bg-gradient-to-t from-[#05040a] via-[#05040a]/20 to-transparent opacity-90" />
                                <div className="absolute inset-0 bg-cyan-500/10 mix-blend-overlay"></div>
                            </div>

                            <div className="absolute top-4 left-[-10px] bg-black/80 backdrop-blur-md border-l-4 border-l-cyan-400 border-t border-b border-r border-cyan-900/50 text-cyan-300 text-[10px] font-black uppercase tracking-[0.3em] px-3 py-2 rounded-r-xl flex items-center gap-2 z-20 shadow-[0_0_20px_rgba(6,182,212,0.4)]">
                                <Zap className="w-3 h-3 text-cyan-400 animate-pulse" /> {manga.status || 'EM LANÇAMENTO'}
                            </div>
                        </div>
                    </div>

                    <div className="flex-1 flex flex-col justify-center">
                        {/* TÍTULO COM GRADIENTE NEON */}
                        <h1 className="text-5xl md:text-6xl font-black text-transparent bg-clip-text bg-gradient-to-br from-white via-cyan-100 to-fuchsia-300 leading-tight tracking-tighter mb-2 drop-shadow-[0_0_15px_rgba(255,255,255,0.2)]">
                            {manga.title || 'Sem Título'}
                        </h1>
                        <p className="text-fuchsia-400/80 font-bold text-xs uppercase tracking-widest mb-8">Autor desconhecido</p>
                        
                        {/* SISTEMA DE AVALIAÇÃO */}
                        <div className="flex items-center gap-6 mb-8 bg-black/30 backdrop-blur-sm p-4 rounded-2xl border border-white/5 inline-flex w-max">
                            <div>
                                <div className="flex items-center gap-2 mb-1">
                                    {[1, 2, 3, 4, 5].map((starVal) => (
                                        <button key={starVal} onClick={() => handleRate(starVal)} className="focus:outline-none hover:scale-125 transition-transform px-0.5 group/star">
                                            <Star className={`w-7 h-7 transition-all duration-300 ${animateRating && starVal <= Math.round(localRating) ? 'animate-bounce text-fuchsia-400 fill-fuchsia-400 scale-125' : starVal <= Math.round(localRating) ? 'text-amber-400 fill-amber-400 drop-shadow-[0_0_15px_rgba(251,191,36,0.6)] group-hover/star:text-fuchsia-400 group-hover/star:fill-fuchsia-400' : 'text-gray-800'}`} />
                                        </button>
                                    ))}
                                </div>
                                <p className="text-[10px] text-cyan-500/70 font-black tracking-widest mt-2 uppercase">Avaliação Global</p>
                            </div>
                            <div className={`flex flex-col items-center border-l border-white/10 pl-6 transition-all duration-500 ${animateRating ? 'text-fuchsia-400 scale-110 drop-shadow-[0_0_20px_rgba(217,70,239,0.8)]' : 'text-white scale-100'}`}>
                                <span className="text-4xl font-black leading-none drop-shadow-md">{localRating.toFixed(1)}</span>
                                <span className={`text-[9px] font-black uppercase tracking-[0.2em] mt-2 px-2 py-0.5 rounded bg-white/5 border border-white/10 ${animateRating ? 'text-white border-fuchsia-400' : 'text-amber-400'}`}>{getRatingLabel(localRating)}</span>
                            </div>
                        </div>

                        {/* CARDS DE INFORMAÇÃO GEOMÉTRICOS */}
                        <div className="grid grid-cols-3 gap-3 mb-8">
                            <div className="bg-black/40 backdrop-blur-xl border border-white/5 hover:border-cyan-500/40 rounded-xl rounded-tl-3xl rounded-br-3xl p-4 flex flex-col justify-center gap-2 shadow-[0_8px_32px_0_rgba(0,0,0,0.4)] hover:shadow-[0_0_20px_rgba(6,182,212,0.2)] transition-all group">
                                <Bookmark className="w-5 h-5 text-cyan-400 group-hover:scale-110 transition-transform" />
                                <span className="text-[9px] text-gray-500 font-black uppercase tracking-[0.2em]">Gênero</span>
                                <span className="text-xs font-black text-white line-clamp-1">{displayGenre}</span>
                            </div>
                            <div className="bg-black/40 backdrop-blur-xl border border-white/5 hover:border-purple-500/40 rounded-xl p-4 flex flex-col justify-center gap-2 shadow-[0_8px_32px_0_rgba(0,0,0,0.4)] hover:shadow-[0_0_20px_rgba(168,85,247,0.2)] transition-all group">
                                <BookOpen className="w-5 h-5 text-purple-400 group-hover:scale-110 transition-transform" />
                                <span className="text-[9px] text-gray-500 font-black uppercase tracking-[0.2em]">Capítulos</span>
                                <span className="text-xs font-black text-white line-clamp-1">{chapters.length > 0 ? 'Disponíveis' : '0'}</span>
                            </div>
                            <div className="bg-black/40 backdrop-blur-xl border border-white/5 hover:border-fuchsia-500/40 rounded-xl rounded-tr-3xl rounded-bl-3xl p-4 flex flex-col justify-center gap-2 shadow-[0_8px_32px_0_rgba(0,0,0,0.4)] hover:shadow-[0_0_20px_rgba(217,70,239,0.2)] transition-all group">
                                <Users className="w-5 h-5 text-fuchsia-400 group-hover:scale-110 transition-transform" />
                                <span className="text-[9px] text-gray-500 font-black uppercase tracking-[0.2em]">Leitores</span>
                                <span className="text-xs font-black text-white line-clamp-1">{realReaders}</span>
                            </div>
                        </div>

                        {/* BOTÃO LER AGORA ESTILO ANIME SKILL */}
                        <button onClick={() => nextChapterToRead ? onChapterClick(manga, nextChapterToRead) : showToast("Nenhum capítulo disponível", "warning")} className="w-full bg-gradient-to-r from-cyan-600 via-purple-600 to-fuchsia-600 shadow-[0_0_30px_rgba(168,85,247,0.3)] hover:shadow-[0_0_50px_rgba(217,70,239,0.6)] text-white font-black py-4 rounded-xl rounded-tr-[2rem] rounded-bl-[2rem] flex items-center justify-between px-6 transition-all duration-300 hover:scale-[1.02] group mb-4 border border-white/10 relative overflow-hidden">
                            <div className="absolute inset-0 bg-white/20 translate-x-[-100%] skew-x-[-15deg] group-hover:animate-[shimmer_1.5s_infinite]"></div>
                            <div className="flex items-center gap-3 w-full justify-center relative z-10">
                                <Play className="w-5 h-5 absolute left-0 fill-white drop-shadow-[0_0_10px_rgba(255,255,255,0.8)]" />
                                <span className="text-sm uppercase tracking-[0.3em] drop-shadow-md">{lastRead ? 'CONTINUAR LEITURA' : 'INICIAR JORNADA'}</span>
                                <ChevronRight className="w-6 h-6 absolute right-0 group-hover:translate-x-2 transition-transform" />
                            </div>
                        </button>

                        <div className="flex items-center gap-3 mb-2">
                            <div className="relative flex-1">
                                <button onClick={() => setShowLibraryMenu(!showLibraryMenu)} className={`w-full py-3 rounded-xl rounded-tl-2xl rounded-br-2xl border flex items-center justify-center transition-all duration-300 font-black text-[10px] uppercase tracking-[0.2em] gap-2 ${inLibrary ? 'bg-fuchsia-950/40 border-fuchsia-500/50 text-fuchsia-300 shadow-[0_0_15px_rgba(217,70,239,0.2)]' : 'bg-black/50 backdrop-blur-md border-white/10 text-gray-400 hover:text-white hover:border-cyan-400/50 hover:shadow-[0_0_20px_rgba(6,182,212,0.2)]'}`}>
                                    {inLibrary ? <CheckCircle className="w-4 h-4" /> : <Library className="w-4 h-4" />}
                                    {inLibrary ? inLibrary : 'Salvar no Arquivo'}
                                </button>
                                {showLibraryMenu && (
                                    <div className="absolute bottom-full left-0 w-full mb-3 bg-black/90 backdrop-blur-2xl border border-fuchsia-500/40 rounded-2xl p-2 shadow-[0_0_40px_rgba(0,0,0,0.9)] z-50 animate-in fade-in zoom-in-95">
                                        {libraryStatuses.map(status => (
                                            <button key={status} onClick={() => updateLibraryStatus(status)} className="w-full text-left px-4 py-3 rounded-xl text-[11px] font-black uppercase tracking-[0.2em] text-gray-300 hover:bg-gradient-to-r hover:from-fuchsia-900/40 hover:to-transparent hover:text-fuchsia-300 hover:translate-x-1 transition-all">{status}</button>
                                        ))}
                                        {inLibrary && <button onClick={() => updateLibraryStatus('Remover')} className="w-full text-left px-4 py-3 rounded-xl text-[11px] font-black uppercase tracking-[0.2em] text-red-400 hover:bg-red-950/40 hover:text-red-300 transition-colors mt-2 border-t border-red-900/30">Purgar Registro</button>}
                                    </div>
                                )}
                            </div>
                            <button onClick={handleShare} className="py-3 px-6 bg-black/50 backdrop-blur-md rounded-xl rounded-tr-2xl rounded-bl-2xl border border-white/10 text-gray-400 hover:text-white hover:border-purple-500/50 hover:shadow-[0_0_20px_rgba(168,85,247,0.3)] hover:rotate-6 transition-all">
                                <Share2 className="w-4 h-4" />
                            </button>
                        </div>
                    </div>
                </div>

                {/* SINOPSE SURREAL (CAIXA DE DADOS) */}
                <div className="mt-16 relative z-10 w-full group">
                    <div className="absolute -inset-1 bg-gradient-to-b from-cyan-500/20 to-fuchsia-500/20 blur-xl opacity-50 group-hover:opacity-100 transition-opacity duration-700 rounded-3xl"></div>
                    <div className="relative overflow-hidden bg-black/60 backdrop-blur-2xl border border-white/10 group-hover:border-fuchsia-500/30 rounded-3xl shadow-[0_0_50px_rgba(0,0,0,0.8)] rounded-tl-[4rem] rounded-br-[4rem] transition-colors duration-500">
                        <div className="absolute right-0 top-0 w-full md:w-2/3 h-full opacity-10 mix-blend-screen pointer-events-none" style={{ maskImage: 'linear-gradient(to right, transparent, black)', WebkitMaskImage: '-webkit-linear-gradient(left, transparent, black)' }}>
                            <img src={manga.coverUrl} className="w-full h-full object-cover object-center filter grayscale contrast-150" alt="Background" />
                        </div>
                        <div className="absolute top-0 left-0 w-2 h-full bg-gradient-to-b from-cyan-400 via-purple-500 to-fuchsia-500 opacity-80"></div>
                        <div className="relative z-10 p-8 md:p-10 pl-12">
                            <h3 className="text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 to-fuchsia-400 font-black mb-4 text-sm uppercase tracking-[0.3em] drop-shadow-[0_0_5px_rgba(6,182,212,0.5)] flex items-center gap-3">
                                <BookOpen className="w-5 h-5 text-cyan-400" /> Registro de Dados
                            </h3>
                            <div className="text-gray-300 text-sm md:text-base leading-relaxed font-medium">
                                <p className={`whitespace-pre-wrap ${expandedSynopsis ? '' : 'line-clamp-4'}`}>
                                    {manga.synopsis || "Os dados do sistema ainda não decifraram os mistérios desta obra."}
                                </p>
                            </div>
                            {manga.synopsis && manga.synopsis.length > 200 && (
                                <button onClick={() => setExpandedSynopsis(!expandedSynopsis)} className="mt-6 flex items-center gap-2 text-[10px] font-black uppercase tracking-[0.3em] text-fuchsia-400 hover:text-fuchsia-300 transition-colors bg-fuchsia-950/30 px-4 py-2 rounded-full border border-fuchsia-500/30 hover:shadow-[0_0_15px_rgba(217,70,239,0.3)]">
                                    {expandedSynopsis ? 'OCULTAR DADOS' : 'DECODIFICAR MAIS'}
                                    {expandedSynopsis ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
                                </button>
                            )}
                        </div>
                    </div>
                </div>

                {/* ABAS COM EFEITO NEON */}
                <div className="mt-16 relative z-10 w-full">
                    <div className="flex items-center gap-8 mb-8 border-b border-white/5 pb-4 relative">
                        <button onClick={() => setDetailsTab('capitulos')} className={`text-xs font-black uppercase tracking-[0.3em] transition-all pb-4 relative ${detailsTab === 'capitulos' ? 'text-white' : 'text-gray-600 hover:text-gray-400'}`}>
                            Capítulos
                            {detailsTab === 'capitulos' && <span className="absolute bottom-[-2px] left-0 w-full h-[3px] bg-gradient-to-r from-cyan-400 to-purple-500 shadow-[0_0_10px_rgba(6,182,212,0.8)] rounded-full"></span>}
                        </button>
                        <button onClick={() => setDetailsTab('comentarios')} className={`text-xs font-black uppercase tracking-[0.3em] transition-all pb-4 relative ${detailsTab === 'comentarios' ? 'text-white' : 'text-gray-600 hover:text-gray-400'}`}>
                            Comentários
                            {detailsTab === 'comentarios' && <span className="absolute bottom-[-2px] left-0 w-full h-[3px] bg-gradient-to-r from-purple-500 to-fuchsia-500 shadow-[0_0_10px_rgba(217,70,239,0.8)] rounded-full"></span>}
                        </button>
                    </div>

                    {detailsTab === 'capitulos' ? (
                        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5 animate-in slide-in-from-bottom-8 duration-500">
                            {chapters.length === 0 ? (
                                <div className="col-span-full text-center py-20 bg-black/30 backdrop-blur-md rounded-3xl border border-white/5 shadow-inner"><Zap className="w-12 h-12 text-gray-800 mx-auto mb-6 animate-pulse" /><p className="text-gray-500 font-black text-xs uppercase tracking-[0.3em]">Nenhum dado de capítulo no servidor.</p></div>
                            ) : (
                                chapters.map(chapter => {
                                    const isRead = mangaHistory.some(h => h.chapterNumber === chapter.number);
                                    return (
                                        <div key={chapter.id} onClick={() => onChapterClick(manga, chapter)} className={`cursor-pointer p-4 rounded-xl rounded-tr-3xl flex items-center justify-between transition-all duration-300 border backdrop-blur-md group relative overflow-hidden ${isRead ? 'bg-black/60 border-white/5 opacity-50' : 'bg-black/40 border-white/10 hover:border-cyan-500/50 hover:bg-gradient-to-r hover:from-cyan-950/20 hover:to-transparent shadow-[0_4px_20px_rgba(0,0,0,0.5)] hover:shadow-[0_0_25px_rgba(6,182,212,0.2)] hover:-translate-y-1'}`}>
                                            <div className="absolute top-0 right-0 w-16 h-16 bg-cyan-500/10 rounded-bl-[100%] blur-md group-hover:bg-cyan-400/20 transition-colors"></div>
                                            <div className="flex items-center gap-4 relative z-10">
                                                <div className={`w-12 h-12 rounded-lg rounded-tl-2xl rounded-br-2xl flex items-center justify-center font-black text-sm transition-all duration-300 ${isRead ? 'bg-[#05040a] text-gray-600 border border-white/5' : 'bg-black text-cyan-400 border border-cyan-500/30 group-hover:bg-cyan-500 group-hover:text-white group-hover:shadow-[0_0_15px_rgba(6,182,212,0.6)] group-hover:rotate-3'}`}>
                                                    {chapter.number}
                                                </div>
                                                <div>
                                                    <h4 className={`font-black text-xs uppercase tracking-widest transition-colors ${isRead ? 'text-gray-600' : 'text-gray-200 group-hover:text-white drop-shadow-md'}`}>Arquivo {chapter.number}</h4>
                                                    <p className="text-[9px] text-gray-500 font-bold uppercase tracking-widest mt-1.5 flex items-center gap-1.5"><Clock className="w-3 h-3 text-cyan-700 group-hover:text-cyan-400 transition-colors" /> {timeAgo(chapter.rawTime || Date.now())}</p>
                                                </div>
                                            </div>
                                            {isRead && <CheckCircle className="w-5 h-5 text-cyan-800 relative z-10" />}
                                        </div>
                                    );
                                })
                            )}
                        </div>
                    ) : (
                        <div className="animate-in slide-in-from-bottom-8 duration-500 bg-black/40 backdrop-blur-xl p-6 rounded-3xl border border-white/5 shadow-[0_0_30px_rgba(0,0,0,0.5)]">
                            <CommentsSection mangaId={manga.id} user={user} userProfileData={userProfileData} onRequireLogin={onRequireLogin} showToast={showToast} />
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}
