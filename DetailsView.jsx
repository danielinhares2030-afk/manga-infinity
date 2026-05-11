import React, { useState, useEffect } from 'react';
import { 
    BookOpen, Bookmark, LayoutGrid, Info, Star, 
    MessageSquare, ChevronDown, ListFilter, Flame 
} from 'lucide-react';
import { doc, updateDoc, setDoc, deleteDoc, increment } from "firebase/firestore";
import { APP_ID } from './constants';
import { CommentsSection } from './CommentsSection';

export default function DetailsView({ manga, libraryData, historyData, user, userProfileData, onChapterClick, onRequireLogin, showToast, db }) {
    const [detailsTab, setDetailsTab] = useState('capitulos'); 
    const [sortOrder, setSortOrder] = useState('desc');
    const [savedChapters, setSavedChapters] = useState({});

    // 1. Visualização (Views)
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

    // 2. Lógica da Biblioteca (Botão de Salvar a Obra)
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
                showToast("Obra salva na biblioteca!", "success");
            }
        } catch (error) { showToast("Erro ao salvar.", "error"); }
    };

    // 3. Lógica de Salvar Capítulo individual
    const toggleSaveChapter = (chapterId) => {
        if (!user) return onRequireLogin();
        const newState = !savedChapters[chapterId];
        setSavedChapters(prev => ({ ...prev, [chapterId]: newState }));
        showToast(newState ? "Capítulo salvo!" : "Capítulo removido.", "success");
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
        <div className="w-full bg-[#0A0A0F] text-gray-200 font-sans pb-24">
            
            <div className="max-w-6xl mx-auto px-4 md:px-8 pt-8">
                
                {/* LOGO (Corrigida com Ícone e Texto para não quebrar) */}
                <div className="flex flex-col items-center justify-center mb-12">
                    <Flame className="w-10 h-10 text-[#8B5CF6] mb-1 drop-shadow-[0_0_15px_rgba(139,92,246,0.8)]" />
                    <span className="text-xs tracking-[0.4em] text-gray-400 uppercase font-light">Manga</span>
                    <span className="text-3xl font-serif font-black tracking-widest uppercase text-white">Inferi<span className="text-[#8B5CF6]">a</span></span>
                    <div className="mt-2 flex items-center gap-2 opacity-50">
                        <div className="w-8 h-px bg-gradient-to-r from-transparent to-[#8B5CF6]"></div>
                        <div className="w-2 h-2 rotate-45 bg-[#8B5CF6]"></div>
                        <div className="w-8 h-px bg-gradient-to-l from-transparent to-[#8B5CF6]"></div>
                    </div>
                </div>

                {/* GRID PRINCIPAL: CAPA DE LADO E INFO NA DIREITA */}
                <div className="flex flex-col md:flex-row gap-10 lg:gap-16 mb-16">
                    
                    {/* COLUNA ESQUERDA: CAPA */}
                    <div className="w-full max-w-[320px] mx-auto md:mx-0 flex-shrink-0 relative group">
                        <div className="absolute -inset-1 bg-[#8B5CF6] blur-2xl opacity-30 rounded-2xl"></div>
                        <div className="relative aspect-[3/4] w-full rounded-2xl overflow-hidden border border-white/5 shadow-2xl">
                            <img src={manga.coverUrl} className="w-full h-full object-cover" alt={manga.title} />
                        </div>
                    </div>

                    {/* COLUNA DIREITA: INFORMAÇÕES */}
                    <div className="flex-1 flex flex-col justify-center">
                        
                        {/* Status */}
                        <div className="flex items-center gap-2 mb-4 bg-purple-900/20 border border-purple-500/20 w-max px-3 py-1.5 rounded-full">
                            <div className="w-2 h-2 rounded-full bg-[#8B5CF6] animate-pulse"></div>
                            <span className="text-[10px] text-[#8B5CF6] font-bold tracking-[0.15em] uppercase">
                                {manga.status || 'EM ANDAMENTO'}
                            </span>
                        </div>
                        
                        {/* Título */}
                        <h1 className="text-5xl md:text-6xl lg:text-7xl font-black text-transparent bg-clip-text bg-gradient-to-b from-white to-[#A78BFA] uppercase tracking-tighter leading-[0.9] mb-8 drop-shadow-lg">
                            {manga.title || 'Sombras do Abismo'}
                        </h1>

                        <div className="flex items-center gap-2 opacity-30 mb-8">
                            <div className="w-16 h-px bg-[#8B5CF6]"></div>
                            <div className="w-1.5 h-1.5 rotate-45 bg-[#8B5CF6]"></div>
                            <div className="w-full max-w-[100px] h-px bg-gradient-to-r from-[#8B5CF6] to-transparent"></div>
                        </div>

                        {/* Categorias (Tags) */}
                        <div className="flex flex-wrap gap-3 mb-10">
                            {['Ação', 'Fantasia', 'Sobrenatural', 'Drama'].map(tag => (
                                <span key={tag} className="px-5 py-2 rounded-full bg-[#14141A] border border-white/5 text-xs font-medium text-gray-300 hover:bg-[#1A1A22] transition-colors cursor-default">
                                    {tag}
                                </span>
                            ))}
                            <button className="w-10 h-10 rounded-full bg-[#14141A] border border-white/5 flex items-center justify-center text-gray-300 hover:bg-[#1A1A22] transition-colors">+</button>
                        </div>

                        {/* Botões Principais (Na mesma linha) */}
                        <div className="flex items-center gap-4 max-w-lg">
                            <button 
                                onClick={() => nextChapterToRead ? onChapterClick(manga, nextChapterToRead) : showToast("Sem capítulos", "warning")} 
                                className="flex-1 bg-gradient-to-r from-[#7C3AED] to-[#5B21B6] hover:from-[#8B5CF6] hover:to-[#6D28D9] text-white py-5 rounded-2xl flex items-center justify-center gap-3 font-bold text-sm uppercase tracking-widest transition-all shadow-[0_10px_30px_rgba(124,58,237,0.3)]"
                            >
                                <BookOpen className="w-5 h-5 fill-white" />
                                Ler Agora
                            </button>
                            
                            <button 
                                onClick={toggleLibrary} 
                                className="w-[60px] h-[60px] flex-shrink-0 bg-[#14141A] hover:bg-[#1A1A22] rounded-2xl flex items-center justify-center transition-all border border-white/5"
                            >
                                <Bookmark className={`w-6 h-6 ${inLibrary ? 'text-[#A78BFA] fill-[#A78BFA]' : 'text-gray-400'}`} />
                            </button>
                        </div>
                    </div>
                </div>

                {/* ABAS DE NAVEGAÇÃO COM ÍCONE E TEXTO */}
                <div className="flex flex-wrap items-center bg-[#14141A] rounded-2xl p-1 mb-10 border border-white/5">
                    {[
                        { id: 'capitulos', label: 'Capítulos', icon: LayoutGrid },
                        { id: 'informacoes', label: 'Informações', icon: Info },
                        { id: 'avaliacoes', label: 'Avaliações', icon: Star },
                        { id: 'comentarios', label: 'Comentários', icon: MessageSquare },
                    ].map(tab => (
                        <button 
                            key={tab.id}
                            onClick={() => setDetailsTab(tab.id)}
                            className={`flex-1 min-w-[140px] flex items-center justify-center gap-3 py-4 rounded-xl text-xs font-bold uppercase tracking-wider transition-all relative ${detailsTab === tab.id ? 'text-white bg-white/5' : 'text-gray-500 hover:text-gray-300'}`}
                        >
                            <tab.icon className={`w-4 h-4 ${detailsTab === tab.id ? 'text-[#8B5CF6]' : ''}`} />
                            {tab.label}
                            {detailsTab === tab.id && (
                                <div className="absolute bottom-0 left-1/2 -translate-x-1/2 w-1/2 h-[2px] bg-[#8B5CF6] shadow-[0_0_10px_rgba(139,92,246,0.8)]"></div>
                            )}
                        </button>
                    ))}
                </div>

                {/* CONTEÚDO DAS ABAS */}
                <div className="w-full">
                    
                    {/* ABA: CAPÍTULOS */}
                    {detailsTab === 'capitulos' && (
                        <div className="animate-in fade-in duration-300 bg-[#14141A] border border-white/5 rounded-3xl p-6 md:p-8">
                            
                            {/* Header da Lista */}
                            <div className="flex flex-wrap items-center justify-between gap-4 mb-8">
                                <h2 className="text-xl font-bold text-white tracking-widest uppercase">Capítulos</h2>
                                <div className="flex items-center gap-4 text-xs font-bold text-gray-400 uppercase tracking-widest">
                                    <button onClick={() => setSortOrder(prev => prev === 'desc' ? 'asc' : 'desc')} className="flex items-center gap-2 hover:text-white transition-colors">
                                        Mais Recentes <ChevronDown className="w-4 h-4" />
                                    </button>
                                    <div className="w-10 h-10 rounded-xl bg-white/5 flex items-center justify-center hover:bg-white/10 transition-colors cursor-pointer border border-white/5">
                                        <ListFilter className="w-4 h-4 text-white" />
                                    </div>
                                </div>
                            </div>

                            {/* Lista */}
                            <div className="flex flex-col gap-3">
                                {sortedChapters.map((chapter, index) => {
                                    const isSaved = savedChapters[chapter.id];
                                    
                                    return (
                                        <div key={chapter.id} className="group bg-[#0A0A0F] border border-white/5 hover:border-white/10 rounded-2xl p-3 pr-6 flex items-center gap-4 transition-all">
                                            
                                            <div 
                                                className="flex-1 flex items-center gap-4 cursor-pointer"
                                                onClick={() => onChapterClick(manga, chapter)}
                                            >
                                                {/* Miniatura Escura */}
                                                <div className="w-24 h-14 bg-black rounded-xl overflow-hidden flex-shrink-0 relative">
                                                    <img src={manga.coverUrl} className="w-full h-full object-cover opacity-50 group-hover:opacity-80 transition-opacity" alt="thumb" />
                                                </div>
                                                
                                                <div className="flex items-center gap-3">
                                                    <span className="font-medium text-sm text-gray-200">Capítulo {chapter.number}</span>
                                                    {index === 0 && sortOrder === 'desc' && (
                                                        <span className="bg-[#4C1D95] text-[#D8B4FE] text-[9px] font-black px-2 py-1 rounded-md uppercase tracking-wider">Novo</span>
                                                    )}
                                                </div>
                                            </div>

                                            {/* Apenas botão de Bookmark */}
                                            <button onClick={() => toggleSaveChapter(chapter.id)} className="p-2 transition-transform hover:scale-110">
                                                <Bookmark className={`w-5 h-5 ${isSaved ? 'text-[#A78BFA] fill-[#A78BFA]' : 'text-gray-600 hover:text-gray-400'}`} />
                                            </button>
                                        </div>
                                    );
                                })}
                            </div>

                            <button className="w-full mt-8 py-4 text-center text-[#A78BFA] text-xs font-bold uppercase tracking-[0.2em] hover:text-white transition-colors flex items-center justify-center gap-2">
                                Ver todos os capítulos <ChevronDown className="w-4 h-4" />
                            </button>
                        </div>
                    )}

                    {/* OUTRAS ABAS */}
                    {detailsTab === 'comentarios' && (
                        <div className="animate-in fade-in duration-300 bg-[#14141A] p-6 rounded-3xl border border-white/5">
                            <CommentsSection mangaId={manga.id} user={user} userProfileData={userProfileData} onRequireLogin={onRequireLogin} showToast={showToast} />
                        </div>
                    )}
                    
                    {detailsTab === 'informacoes' && (
                        <div className="animate-in fade-in duration-300 bg-[#14141A] p-8 rounded-3xl border border-white/5">
                            <h3 className="text-[#A78BFA] text-sm font-bold uppercase mb-4 tracking-widest">Sinopse da Obra</h3>
                            <p className="text-gray-400 leading-relaxed text-justify">{manga.synopsis || "Sem sinopse disponível."}</p>
                        </div>
                    )}

                    {detailsTab === 'avaliacoes' && (
                        <div className="animate-in fade-in duration-300 text-center py-16 bg-[#14141A] rounded-3xl border border-white/5">
                            <Star className="w-10 h-10 text-[#2A2A32] mx-auto mb-4" />
                            <span className="text-gray-500 text-sm font-bold uppercase tracking-widest">Nenhuma avaliação ainda</span>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}
