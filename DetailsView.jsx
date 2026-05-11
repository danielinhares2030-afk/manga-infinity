import React, { useState, useEffect } from 'react';
import { ChevronLeft, Star, Play, BookOpen, CheckCircle, ChevronDown, Bookmark, Share2, MoreHorizontal, MessageSquare, Info, Download, LayoutGrid } from 'lucide-react';
import { doc, updateDoc, setDoc, deleteDoc, increment } from "firebase/firestore";
import { APP_ID } from './constants';
import { CommentsSection } from './CommentsSection';
import { timeAgo } from './helpers';

export default function DetailsView({ manga, libraryData, historyData, user, userProfileData, onBack, onChapterClick, onRequireLogin, showToast, db }) {
    const [detailsTab, setDetailsTab] = useState('capitulos'); 
    const [sortOrder, setSortOrder] = useState('desc');

    // Lógica de Visualização
    useEffect(() => {
        if (!manga?.id) return;
        const addView = async () => {
            const sessionKey = `viewed_${manga.id}`;
            if (!sessionStorage.getItem(sessionKey)) {
                try {
                    const mangaRef = doc(db, 'obras', manga.id);
                    await updateDoc(mangaRef, { views: increment(1) });
                    sessionStorage.setItem(sessionKey, 'true');
                } catch (error) { console.error("Erro visualização", error); }
            }
        };
        addView();
    }, [manga?.id, db]);

    if (!manga) return null;

    // Lógica de Biblioteca (Conectado ao Banco)
    const inLibrary = libraryData && libraryData[manga.id];
    
    const toggleLibrary = async () => {
        if (!user) return onRequireLogin();
        try {
            const ref = doc(db, 'artifacts', APP_ID, 'users', user.uid, 'library', manga.id.toString());
            if (inLibrary) {
                await deleteDoc(ref);
                showToast("Removido da biblioteca", "info");
            } else {
                await setDoc(ref, { mangaId: manga.id, status: 'Lendo', updatedAt: Date.now() });
                showToast("Adicionado à biblioteca!", "success");
            }
        } catch (error) { showToast("Erro ao atualizar.", "error"); }
    };

    const chapters = manga.chapters || [];
    const sortedChapters = [...chapters].sort((a, b) => {
        return sortOrder === 'desc' ? b.number - a.number : a.number - b.number;
    });

    const mangaHistory = (historyData || []).filter(h => h.mangaId === manga.id);
    const lastRead = mangaHistory.length > 0 ? mangaHistory[0] : null;
    const firstChapter = chapters.length > 0 ? chapters[chapters.length - 1] : null;
    const nextChapterToRead = lastRead ? chapters.find(c => Number(c.number) === Number(lastRead.chapterNumber) + 1) || chapters.find(c => c.id === lastRead.id) : firstChapter;

    return (
        <div className="min-h-screen bg-[#06040A] text-gray-200 font-sans pb-20 animate-in fade-in duration-500 overflow-x-hidden">
            
            {/* LOGO SUPERIOR */}
            <div className="w-full flex flex-col items-center pt-8 pb-4">
                <div className="relative">
                   <div className="absolute inset-0 bg-purple-600 blur-xl opacity-40"></div>
                   <img src="https://i.imgur.com/your-inferia-logo.png" className="h-14 relative z-10" alt="MANGA INFERIA" /> 
                </div>
            </div>

            <div className="max-w-6xl mx-auto px-4 md:px-8 mt-6">
                
                {/* GRID PRINCIPAL */}
                <div className="grid grid-cols-1 md:grid-cols-[320px_1fr] gap-12 mb-12">
                    
                    {/* COLUNA ESQUERDA: CAPA */}
                    <div className="relative group mx-auto md:mx-0">
                        <div className="absolute -inset-1 bg-purple-600/40 blur-2xl rounded-[2rem] opacity-60 transition-opacity group-hover:opacity-100"></div>
                        <div className="relative aspect-[2/3] w-[280px] md:w-full rounded-2xl overflow-hidden shadow-2xl border border-white/10">
                            <img src={manga.coverUrl} className="w-full h-full object-cover" alt={manga.title} />
                        </div>
                    </div>

                    {/* COLUNA DIREITA: INFO */}
                    <div className="flex flex-col justify-center text-center md:text-left">
                        <div className="flex items-center justify-center md:justify-start gap-2 mb-3 text-purple-400 font-bold text-[10px] uppercase tracking-widest">
                            <div className="w-2 h-2 rounded-full bg-purple-500 animate-pulse"></div>
                            {manga.status || 'Em andamento'}
                        </div>
                        
                        <h1 className="text-5xl md:text-7xl font-black text-white mb-6 tracking-tighter uppercase leading-none">
                            {manga.title || 'Sombras do Abismo'}
                        </h1>

                        <div className="flex flex-wrap justify-center md:justify-start gap-3 mb-10">
                            {['Ação', 'Fantasia', 'Sobrenatural', 'Drama'].map(tag => (
                                <span key={tag} className="px-5 py-2 rounded-xl bg-white/5 border border-white/10 text-xs font-bold text-gray-300 hover:bg-white/10 transition-all cursor-default">
                                    {tag}
                                </span>
                            ))}
                            <button className="w-10 h-10 rounded-xl bg-white/5 border border-white/10 flex items-center justify-center text-gray-300">+</button>
                        </div>

                        <div className="flex flex-col sm:flex-row items-center gap-4">
                            <button onClick={() => nextChapterToRead ? onChapterClick(manga, nextChapterToRead) : showToast("Sem capítulos", "warning")} className="w-full sm:w-auto px-12 py-5 bg-gradient-to-r from-[#6D28D9] to-[#4C1D95] rounded-2xl flex items-center justify-center gap-4 text-white font-black uppercase tracking-tighter hover:brightness-110 transition-all shadow-[0_10px_40px_rgba(109,40,217,0.3)]">
                                <BookOpen className="w-6 h-6" />
                                Ler Agora
                            </button>
                            <button onClick={toggleLibrary} className={`w-16 h-16 rounded-2xl border flex items-center justify-center transition-all ${inLibrary ? 'bg-purple-600/20 border-purple-500 text-purple-400' : 'bg-white/5 border-white/10 text-gray-400 hover:bg-white/10'}`}>
                                <Bookmark className={`w-6 h-6 ${inLibrary ? 'fill-current' : ''}`} />
                            </button>
                        </div>
                    </div>
                </div>

                {/* ABAS DE NAVEGAÇÃO */}
                <div className="flex items-center justify-center md:justify-start gap-2 md:gap-8 border-b border-white/5 mb-8">
                    {[
                        { id: 'capitulos', label: 'Capítulos', icon: LayoutGrid },
                        { id: 'informacoes', label: 'Informações', icon: Info },
                        { id: 'avaliacoes', label: 'Avaliações', icon: Star },
                        { id: 'comentarios', label: 'Comentários', icon: MessageSquare },
                    ].map(tab => (
                        <button 
                            key={tab.id}
                            onClick={() => setDetailsTab(tab.id)}
                            className={`flex items-center gap-3 px-4 py-5 text-xs font-black uppercase tracking-widest transition-all relative ${detailsTab === tab.id ? 'text-purple-500' : 'text-gray-500 hover:text-gray-300'}`}
                        >
                            <tab.icon className="w-4 h-4" />
                            <span className="hidden sm:inline">{tab.label}</span>
                            {detailsTab === tab.id && <div className="absolute bottom-0 left-0 w-full h-0.5 bg-purple-500 shadow-[0_0_15px_rgba(168,85,247,1)]"></div>}
                        </button>
                    ))}
                </div>

                {/* CONTEÚDO DA ABA CAPÍTULOS */}
                {detailsTab === 'capitulos' && (
                    <div className="animate-in slide-in-from-bottom-4 duration-500">
                        <div className="flex items-center justify-between mb-8">
                            <h2 className="text-2xl font-black uppercase tracking-tighter">Capítulos</h2>
                            <div className="flex items-center gap-4 text-gray-500 text-xs font-bold uppercase">
                                <span>Mais recentes</span>
                                <ChevronDown className="w-4 h-4" />
                                <MoreHorizontal className="w-5 h-5 cursor-pointer hover:text-white" />
                            </div>
                        </div>

                        <div className="grid grid-cols-1 gap-3">
                            {sortedChapters.map((chapter, index) => {
                                const isRead = mangaHistory.some(h => h.chapterNumber === chapter.number);
                                return (
                                    <div 
                                        key={chapter.id} 
                                        onClick={() => onChapterClick(manga, chapter)}
                                        className="group bg-white/[0.02] hover:bg-white/[0.05] border border-white/5 rounded-2xl p-3 flex items-center gap-4 transition-all cursor-pointer"
                                    >
                                        <div className="w-20 h-14 rounded-lg overflow-hidden bg-black flex-shrink-0">
                                            <img src={manga.coverUrl} className="w-full h-full object-cover opacity-60 group-hover:opacity-100 transition-opacity" alt="Thumb" />
                                        </div>
                                        <div className="flex-1 flex items-center gap-3">
                                            <span className={`font-bold text-sm ${isRead ? 'text-gray-600' : 'text-gray-200'}`}>Capítulo {chapter.number}</span>
                                            {index === 0 && <span className="bg-purple-600 text-[8px] font-black px-2 py-0.5 rounded text-white uppercase">Novo</span>}
                                        </div>
                                        <div className="flex items-center gap-4 px-2">
                                            <Bookmark className="w-5 h-5 text-gray-700 hover:text-purple-500 transition-colors" />
                                            <div className="w-10 h-10 rounded-xl bg-purple-600/10 border border-purple-500/20 flex items-center justify-center text-purple-500 hover:bg-purple-500 hover:text-white transition-all">
                                                <Download className="w-4 h-4" />
                                            </div>
                                        </div>
                                    </div>
                                );
                            })}
                        </div>

                        <button className="w-full py-8 text-center text-purple-500 text-[10px] font-black uppercase tracking-[0.3em] hover:text-purple-400 transition-colors">
                            Ver todos os capítulos <ChevronDown className="inline w-4 h-4 ml-2" />
                        </button>
                    </div>
                )}

                {/* CONTEÚDO COMENTÁRIOS */}
                {detailsTab === 'comentarios' && (
                    <div className="animate-in fade-in duration-500">
                        <CommentsSection mangaId={manga.id} user={user} userProfileData={userProfileData} onRequireLogin={onRequireLogin} showToast={showToast} />
                    </div>
                )}

                {/* CONTEÚDO INFORMAÇÕES */}
                {detailsTab === 'informacoes' && (
                    <div className="animate-in fade-in duration-500 bg-white/5 p-8 rounded-3xl border border-white/5">
                        <h3 className="text-purple-400 font-bold uppercase text-xs mb-4 tracking-widest">Sinopse</h3>
                        <p className="text-gray-400 leading-relaxed text-sm">{manga.synopsis || 'Sem sinopse disponível.'}</p>
                    </div>
                )}
            </div>
        </div>
    );
}
