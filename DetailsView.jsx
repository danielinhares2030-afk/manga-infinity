import React, { useState, useEffect } from 'react';
import { ArrowLeft, Bookmark, Share2, MoreVertical, Star, Calendar, Book, Layout, Tag, MessageSquare, Play, CheckCircle, ChevronDown, Download, BookOpen } from 'lucide-react';
import { doc, updateDoc, setDoc, deleteDoc, increment } from "firebase/firestore";
import { APP_ID } from './constants';
import { CommentsSection } from './CommentsSection';
import { timeAgo } from './helpers';

export default function DetailsView({ manga, libraryData, historyData, user, userProfileData, onBack, onChapterClick, onRequireLogin, showToast, db }) {
    const [localRating, setLocalRating] = useState(Number(manga?.rating) || 5.0);
    const [showLibraryMenu, setShowLibraryMenu] = useState(false);
    const [expandedSynopsis, setExpandedSynopsis] = useState(false);
    const [showComments, setShowComments] = useState(false);
    const [showAllChapters, setShowAllChapters] = useState(false);

    const libraryStatuses = ['Lendo', 'Concluído', 'Pausado', 'Dropado', 'Planejo Ler', 'Remover'];

    // LÓGICA DE VISUALIZAÇÃO BLINDADA (CONTA APENAS UMA VEZ NA VIDA DO USUÁRIO)
    useEffect(() => {
        if (!manga?.id) return;
        const addView = async () => {
            const localKey = `viewed_permanent_${manga.id}`;
            if (!localStorage.getItem(localKey)) {
                try {
                    await updateDoc(doc(db, 'obras', manga.id), { views: increment(1) });
                    localStorage.setItem(localKey, 'true'); // Fica salvo no celular para não contar de novo
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

    // Paginação simples de Capítulos
    const visibleChapters = showAllChapters ? chapters : chapters.slice(0, 5);

    if (!manga) return null;

    return (
        <div className="min-h-screen bg-[#050505] text-white font-sans pb-24 relative overflow-x-hidden">
            
            <div className="absolute top-0 left-0 w-full h-[60vh] z-0 overflow-hidden pointer-events-none">
                <img src={manga.coverUrl} className="w-full h-full object-cover opacity-20 blur-[50px] mix-blend-lighten" alt="bg" />
                <div className="absolute inset-0 bg-gradient-to-t from-[#050505] via-[#050505]/80 to-transparent"></div>
            </div>

            <div className="sticky top-0 z-50 bg-[#050505]/80 backdrop-blur-xl border-b border-white/5 p-4 flex items-center justify-between">
                <button onClick={onBack} className="p-2 text-white hover:text-red-500 transition-colors">
                    <ArrowLeft className="w-6 h-6" />
                </button>
                <div className="flex items-center gap-4">
                    <button onClick={() => setShowLibraryMenu(!showLibraryMenu)} className="p-2 text-white hover:text-red-500 transition-colors">
                        <Bookmark className="w-5 h-5" fill={inLibrary ? "currentColor" : "none"} />
                    </button>
                    <button className="p-2 text-white hover:text-blue-500 transition-colors">
                        <Share2 className="w-5 h-5" />
                    </button>
                    <button className="p-2 text-white hover:text-gray-400 transition-colors">
                        <MoreVertical className="w-5 h-5" />
                    </button>
                </div>
            </div>

            <div className="max-w-5xl mx-auto px-4 pt-6 relative z-10">
                <div className="flex flex-col md:flex-row gap-6 md:gap-10 mb-8">
                    <div className="w-48 md:w-64 flex-shrink-0 mx-auto md:mx-0 relative group">
                        <img src={manga.coverUrl} className="w-full rounded-2xl shadow-[0_20px_40px_rgba(0,0,0,0.6)] border border-white/10" alt={manga.title} />
                    </div>

                    <div className="flex-1 flex flex-col justify-center">
                        <div className="flex flex-wrap items-center gap-2 mb-3">
                            {(manga.genres || []).slice(0, 3).map(g => (
                                <span key={g} className="text-[10px] font-bold text-gray-400 uppercase tracking-widest flex items-center gap-1.5">
                                    {g} <span className="text-red-600">•</span>
                                </span>
                            ))}
                        </div>
                        <h1 className="text-4xl md:text-5xl font-black text-white mb-4 leading-tight drop-shadow-lg">{manga.title}</h1>
                        
                        <div className="flex items-center gap-4 mb-6">
                            <div className="bg-[#111] border border-white/5 px-3 py-1.5 rounded-lg flex items-center gap-2">
                                <Star className="w-4 h-4 text-yellow-500 fill-yellow-500" />
                                <span className="font-black text-sm">{localRating.toFixed(1)}</span>
                            </div>
                            <span className="text-xs font-bold text-gray-500">{manga.views || '0'} visualizações</span>
                        </div>

                        <div>
                            <p className={`text-sm text-gray-400 leading-relaxed font-medium ${expandedSynopsis ? '' : 'line-clamp-3'}`}>
                                {manga.synopsis || "Detalhes desta obra ainda não foram registrados no banco de dados."}
                            </p>
                            {manga.synopsis && manga.synopsis.length > 150 && (
                                <button onClick={() => setExpandedSynopsis(!expandedSynopsis)} className="text-blue-500 text-xs font-bold mt-2 hover:text-blue-400 flex items-center gap-1">
                                    {expandedSynopsis ? 'Ver menos' : 'Ver mais'} <ChevronDown className={`w-3 h-3 transition-transform ${expandedSynopsis ? 'rotate-180' : ''}`} />
                                </button>
                            )}
                        </div>
                    </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
                    <div className="bg-[#111] border border-white/5 rounded-2xl p-4 flex items-center gap-4 cursor-pointer hover:bg-[#1a1a1a] transition-colors relative" onClick={() => setShowLibraryMenu(!showLibraryMenu)}>
                        <div className={`w-10 h-10 rounded-full flex items-center justify-center border-2 ${inLibrary ? 'border-blue-500 bg-blue-500/10 text-blue-500' : 'border-gray-600 text-gray-500'}`}>
                            <CheckCircle className="w-5 h-5" />
                        </div>
                        <div>
                            <p className="text-sm font-black text-white">{inLibrary ? 'Salvo na biblioteca' : 'Adicionar à biblioteca'}</p>
                            <p className="text-[10px] text-gray-500 font-bold uppercase tracking-widest">{inLibrary ? 'Adicionado' : 'Acompanhe a obra'}</p>
                        </div>
                        {showLibraryMenu && (
                            <div className="absolute top-[105%] left-0 w-full bg-[#111] border border-white/10 rounded-xl overflow-hidden shadow-2xl z-50">
                                {libraryStatuses.map(status => (
                                    <button key={status} onClick={(e) => { e.stopPropagation(); updateLibraryStatus(status); }} className={`w-full text-left px-5 py-4 text-xs font-bold uppercase tracking-wider transition-colors ${status === 'Remover' ? 'text-red-500 hover:bg-red-900/20 border-t border-white/5' : 'text-white hover:bg-blue-600'}`}>{status}</button>
                                ))}
                            </div>
                        )}
                    </div>

                    <div className="bg-[#111] border border-white/5 rounded-2xl p-4">
                        <p className="text-[10px] text-gray-500 font-bold uppercase tracking-widest mb-2">Status atual</p>
                        <div className="bg-[#050505] rounded-xl px-4 py-2.5 flex items-center justify-between border border-white/5">
                            <div className="flex items-center gap-2">
                                <div className="w-2 h-2 rounded-full bg-blue-500"></div>
                                <span className="text-xs font-bold text-white">{inLibrary || 'Nenhum'}</span>
                            </div>
                            <ChevronDown className="w-4 h-4 text-gray-500" />
                        </div>
                    </div>

                    <div className="bg-[#111] border border-white/5 rounded-2xl p-4 flex flex-col justify-center">
                        <p className="text-[10px] text-gray-500 font-bold uppercase tracking-widest mb-2">Avaliar</p>
                        <div className="flex items-center gap-2">
                            {[1, 2, 3, 4, 5].map((s) => (
                                <button key={s} onClick={() => handleRate(s)} className="hover:scale-110 transition-transform">
                                    <Star className={`w-6 h-6 ${s <= Math.round(localRating) ? 'text-yellow-500 fill-yellow-500' : 'text-gray-700'}`} />
                                </button>
                            ))}
                        </div>
                    </div>
                </div>

                <div className="grid grid-cols-2 gap-4 mb-8">
                    {[
                        { icon: <Calendar className="w-5 h-5 text-gray-400" />, label: 'Lançamento', value: new Date(manga.createdAt || Date.now()).getFullYear() },
                        { icon: <Book className="w-5 h-5 text-gray-400" />, label: 'Formato', value: manga.type || 'Mangá' },
                        { icon: <Layout className="w-5 h-5 text-gray-400" />, label: 'Capítulos', value: `${chapters.length} capítulos` },
                        { icon: <Tag className="w-5 h-5 text-gray-400" />, label: 'Gêneros', value: (manga.genres || []).slice(0, 3).join(', ') || 'Sem categoria' },
                    ].map((info, idx) => (
                        <div key={idx} className="bg-[#111] border border-white/5 rounded-2xl p-4 flex items-start gap-4">
                            <div className="mt-1">{info.icon}</div>
                            <div>
                                <p className="text-[10px] text-gray-500 font-bold uppercase tracking-widest mb-1">{info.label}</p>
                                <p className="text-xs font-bold text-white line-clamp-2">{info.value}</p>
                            </div>
                        </div>
                    ))}
                </div>

                {/* COMENTÁRIOS COM DADOS REAIS */}
                <div className="bg-[#111] border border-white/5 rounded-2xl p-5 mb-8">
                    <div className="flex items-center justify-between cursor-pointer" onClick={() => setShowComments(!showComments)}>
                        <h3 className="text-sm font-black flex items-center gap-2"><MessageSquare className="w-5 h-5 text-gray-400" /> Comentários</h3>
                        <span className="text-[10px] font-bold text-blue-500 uppercase tracking-widest hover:text-blue-400 transition-colors">
                            {showComments ? 'Ocultar' : 'Ver Comentários'}
                        </span>
                    </div>
                    {showComments && (
                        <div className="mt-6 border-t border-white/5 pt-4">
                            <CommentsSection mangaId={manga.id} user={user} userProfileData={userProfileData} onRequireLogin={onRequireLogin} showToast={showToast} />
                        </div>
                    )}
                </div>

                {/* LISTA DE CAPÍTULOS FUNCIONAL */}
                <div className="bg-[#111] border border-white/5 rounded-2xl p-5 mb-10">
                    <div className="flex items-center justify-between mb-6">
                        <h3 className="text-sm font-black flex items-center gap-2"><BookOpen className="w-5 h-5 text-gray-400" /> Capítulos</h3>
                        <div className="text-[10px] font-bold text-gray-500 uppercase tracking-widest flex items-center gap-1">
                            Mais recentes
                        </div>
                    </div>

                    <div className="flex flex-col gap-3">
                        {chapters.length === 0 ? (
                            <p className="text-center text-gray-500 font-bold text-xs py-10 uppercase tracking-widest">Nenhum capítulo disponível</p>
                        ) : (
                            visibleChapters.map(chapter => {
                                const isRead = mangaHistory.some(h => h.chapterNumber === chapter.number);
                                const isNext = nextChapterToRead?.id === chapter.id;

                                return (
                                    <div key={chapter.id} onClick={() => onChapterClick(manga, chapter)} className="flex items-center gap-4 bg-[#0A0A0A] border border-white/5 p-3 rounded-2xl hover:border-blue-500/50 cursor-pointer transition-all group">
                                        <div className="w-16 h-12 rounded-lg overflow-hidden flex-shrink-0 relative">
                                            <img src={manga.coverUrl} className="w-full h-full object-cover opacity-60 group-hover:scale-110 transition-transform duration-500" alt="Chap" />
                                            {isNext && <div className="absolute top-1 left-1 w-2 h-2 rounded-full bg-blue-500 animate-pulse"></div>}
                                        </div>
                                        
                                        <div className="flex-1 min-w-0">
                                            <h4 className={`text-sm font-black truncate ${isRead ? 'text-gray-500' : 'text-white'}`}>Capítulo {chapter.number}</h4>
                                            <p className="text-[10px] font-medium text-gray-500 truncate">{timeAgo(chapter.rawTime || Date.now())}</p>
                                        </div>

                                        <div className="flex-shrink-0 flex items-center">
                                            {isNext ? (
                                                <button className="hidden sm:flex bg-gradient-to-r from-blue-600 to-blue-500 text-white px-5 py-2.5 rounded-xl text-[10px] font-black uppercase tracking-widest items-center gap-2 shadow-[0_0_15px_rgba(59,130,246,0.3)]">
                                                    Continuar
                                                </button>
                                            ) : isRead ? (
                                                <div className="w-8 h-8 rounded-full border border-blue-500/30 flex items-center justify-center text-blue-500 bg-blue-500/10">
                                                    <CheckCircle className="w-4 h-4" />
                                                </div>
                                            ) : (
                                                <div className="w-8 h-8 rounded-full border border-white/10 flex items-center justify-center text-gray-500 hover:text-white hover:bg-white/10 transition-colors">
                                                    <Download className="w-4 h-4" />
                                                </div>
                                            )}
                                        </div>
                                    </div>
                                );
                            })
                        )}
                    </div>
                    
                    {/* BOTÃO VER TODOS FUNCIONAL */}
                    {chapters.length > 5 && (
                        <button onClick={() => setShowAllChapters(!showAllChapters)} className="w-full mt-4 py-4 border-t border-white/5 text-[10px] font-black text-gray-400 hover:text-white uppercase tracking-[0.2em] transition-colors flex items-center justify-center gap-2">
                            {showAllChapters ? 'Ocultar capítulos' : 'Ver todos os capítulos'} <ChevronDown className={`w-3 h-3 transition-transform ${showAllChapters ? 'rotate-180' : ''}`} />
                        </button>
                    )}
                </div>
            </div>
        </div>
    );
}
