import React, { useState, useEffect } from 'react';
import { 
    Search, Dices, Bell, BookOpen, Bookmark, LayoutGrid, 
    Info, Star, MessageSquare, ChevronDown, MoreHorizontal, Download 
} from 'lucide-react';
import { doc, updateDoc, setDoc, deleteDoc, increment, getDoc } from "firebase/firestore";
import { APP_ID } from './constants';
import { CommentsSection } from './CommentsSection';

export default function DetailsView({ manga, libraryData, historyData, user, userProfileData, onBack, onChapterClick, onRequireLogin, showToast, db }) {
    const [detailsTab, setDetailsTab] = useState('capitulos'); 
    const [sortOrder, setSortOrder] = useState('desc');
    const [savedChapters, setSavedChapters] = useState({});
    const [downloadedChapters, setDownloadedChapters] = useState({});

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

    // 2. Carregar dados de Capítulos Salvos/Baixados do Banco
    useEffect(() => {
        if (!user || !manga?.id) return;
        const fetchUserData = async () => {
            try {
                const userMangaRef = doc(db, 'artifacts', APP_ID, 'users', user.uid, 'manga_data', manga.id.toString());
                const docSnap = await getDoc(userMangaRef);
                if (docSnap.exists()) {
                    const data = docSnap.data();
                    if (data.savedChapters) setSavedChapters(data.savedChapters);
                    if (data.downloadedChapters) setDownloadedChapters(data.downloadedChapters);
                }
            } catch (err) { console.error(err); }
        };
        fetchUserData();
    }, [user, manga?.id, db]);

    if (!manga) return null;

    // 3. Lógica da Biblioteca (Botão Central - Corrigido)
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

    // 4. Lógica de Salvar Capítulo individual
    const toggleSaveChapter = async (chapterId) => {
        if (!user) return onRequireLogin();
        const newState = !savedChapters[chapterId];
        setSavedChapters(prev => ({ ...prev, [chapterId]: newState }));
        try {
            const ref = doc(db, 'artifacts', APP_ID, 'users', user.uid, 'manga_data', manga.id.toString());
            await setDoc(ref, { savedChapters: { [chapterId]: newState } }, { merge: true });
            showToast(newState ? "Capítulo salvo!" : "Capítulo removido.", "success");
        } catch (err) { showToast("Erro ao sincronizar.", "error"); }
    };

    // 5. Lógica de "Download" (Registra no Banco)
    const handleDownloadChapter = async (chapterId) => {
        if (!user) return onRequireLogin();
        const newState = true;
        setDownloadedChapters(prev => ({ ...prev, [chapterId]: newState }));
        try {
            const ref = doc(db, 'artifacts', APP_ID, 'users', user.uid, 'manga_data', manga.id.toString());
            await setDoc(ref, { downloadedChapters: { [chapterId]: newState } }, { merge: true });
            showToast("Iniciando download do capítulo...", "success");
        } catch (err) { showToast("Erro no servidor.", "error"); }
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
        <div className="min-h-screen bg-[#07050A] text-gray-200 font-sans pb-24 selection:bg-[#5D24D6]/40">
            
            {/* HEADER MOBILE (Pixel Perfect) */}
            <div className="flex items-center justify-between px-4 py-3 bg-[#07050A] sticky top-0 z-50 border-b border-white/[0.05]">
                <div onClick={onBack} className="cursor-pointer">
                    {/* Coroa Azul/Vermelha */}
                    <div className="w-8 h-6 bg-gradient-to-r from-blue-500 via-white to-red-500 rounded-[2px] shadow-sm"></div>
                </div>
                <div className="flex items-center gap-4">
                    <Search className="w-5 h-5 text-gray-300" />
                    <Dices className="w-5 h-5 text-gray-300" />
                    <Bell className="w-5 h-5 text-gray-300" />
                    {userProfileData?.photoURL ? (
                        <img src={userProfileData.photoURL} className="w-7 h-7 rounded-full object-cover" alt="User" />
                    ) : (
                        <div className="w-7 h-7 rounded-full bg-orange-500 border border-yellow-400"></div>
                    )}
                </div>
            </div>

            {/* CONTEÚDO PRINCIPAL (HERO MOBILE) */}
            <div className="relative pt-6 px-4 flex flex-col items-center text-center">
                
                {/* Logo Central e Brilho */}
                <div className="mb-6 z-10 relative flex justify-center w-full">
                    <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-64 h-32 bg-[#4C1D95] blur-[60px] opacity-40 pointer-events-none"></div>
                    <img src="https://i.imgur.com/your-inferia-logo.png" className="h-6 relative z-10" alt="Manga Inferia" />
                </div>

                {/* Capa Centralizada */}
                <div className="w-64 h-80 rounded-[20px] overflow-hidden shadow-2xl relative z-10 mb-6 border border-white/5">
                    <img src={manga.coverUrl} alt={manga.title} className="w-full h-full object-cover" />
                </div>

                {/* Status e Título Centralizados */}
                <div className="flex items-center gap-2 mb-2">
                    <div className="w-1.5 h-1.5 rounded-full bg-[#8B5CF6]"></div>
                    <span className="text-[10px] text-[#8B5CF6] font-bold tracking-[0.2em] uppercase">
                        {manga.status || 'Em Lançamento'}
                    </span>
                </div>
                
                <h1 className="text-3xl font-black text-white uppercase tracking-tighter leading-tight mb-8 max-w-sm line-clamp-2">
                    {manga.title || 'Sombras do Abismo'}
                </h1>

                {/* BOTÕES PRINCIPAIS MOBILE (CORRIGIDO - PIXEL PERFECT) */}
                <div className="w-full max-w-sm flex items-center gap-3 mb-10 px-2 mx-auto">
                    <button 
                        onClick={() => nextChapterToRead ? onChapterClick(manga, nextChapterToRead) : showToast("Sem capítulos", "warning")} 
                        className="flex-1 bg-[#5D24D6] hover:bg-[#6D28D9] text-white py-4 rounded-2xl flex items-center justify-center gap-3 font-black text-sm uppercase tracking-wide transition-colors"
                    >
                        <BookOpen className="w-5 h-5 fill-white" />
                        Ler Agora
                    </button>
                    
                    <button 
                        onClick={toggleLibrary} 
                        className="w-16 h-16 bg-[#141416] hover:bg-[#1a1a1d] rounded-2xl flex items-center justify-center transition-colors border border-white/5 flex-shrink-0"
                    >
                        <Bookmark className={`w-5 h-5 ${inLibrary ? 'text-[#8B5CF6] fill-[#8B5CF6]' : 'text-gray-400'}`} />
                    </button>
                </div>
            </div>

            {/* NAVEGAÇÃO DE ABAS MOBILE (MANTIDO - APENAS ÍCONES) */}
            <div className="flex items-center justify-around border-b border-white/[0.05] mb-6 px-4">
                {[
                    { id: 'capitulos', icon: LayoutGrid },
                    { id: 'informacoes', icon: Info },
                    { id: 'avaliacoes', icon: Star },
                    { id: 'comentarios', icon: MessageSquare },
                ].map(tab => (
                    <button 
                        key={tab.id}
                        onClick={() => setDetailsTab(tab.id)}
                        className={`py-4 relative flex flex-col items-center transition-colors ${detailsTab === tab.id ? 'text-[#8B5CF6]' : 'text-gray-600 hover:text-gray-400'}`}
                    >
                        <tab.icon className={`w-6 h-6 ${detailsTab === tab.id ? 'fill-current opacity-20 absolute scale-110 blur-[2px]' : 'hidden'}`} />
                        <tab.icon className="w-5 h-5 relative z-10" />
                        
                        {detailsTab === tab.id && (
                            <div className="absolute -bottom-[1px] left-1/2 -translate-x-1/2 w-6 h-[3px] bg-[#8B5CF6] rounded-t-full shadow-[0_0_10px_rgba(139,92,246,0.8)]"></div>
                        )}
                    </button>
                ))}
            </div>

            {/* CONTEÚDO DAS ABAS (MOBILE) */}
            <div className="px-4">
                {detailsTab === 'capitulos' && (
                    <div className="animate-in fade-in duration-300">
                        {/* CABEÇALHO CAPÍTULOS */}
                        <div className="flex items-center justify-between mb-4 bg-[#141416] p-4 rounded-2xl border border-white/5 mx-1">
                            <h2 className="text-sm font-black text-white tracking-tight uppercase">Capítulos</h2>
                            <div className="flex items-center gap-3 text-[10px] font-bold text-gray-400 uppercase tracking-wide">
                                <span onClick={() => setSortOrder(prev => prev === 'desc' ? 'asc' : 'desc')} className="cursor-pointer flex items-center gap-1">
                                    Mais Recentes <ChevronDown className="w-3 h-3" />
                                </span>
                                <div className="w-px h-3 bg-white/10 mx-0.5"></div>
                                <MoreHorizontal className="w-4 h-4 ml-1 cursor-pointer" />
                            </div>
                        </div>

                        {/* LISTA DE CAPÍTULOS MOBILE */}
                        <div className="flex flex-col gap-3">
                            {sortedChapters.map((chapter, index) => {
                                const isSaved = savedChapters[chapter.id];
                                const isDownloaded = downloadedChapters[chapter.id];
                                
                                return (
                                    <div key={chapter.id} className="bg-[#111114] rounded-2xl p-3 flex items-center gap-3 border border-white/[0.02]">
                                        
                                        {/* Clicar na miniatura ou título abre o leitor */}
                                        <div 
                                            className="flex-1 flex items-center gap-3 cursor-pointer"
                                            onClick={() => onChapterClick(manga, chapter)}
                                        >
                                            <div className="w-16 h-12 bg-black rounded-lg overflow-hidden flex-shrink-0 border border-white/5">
                                                <img src={manga.coverUrl} className="w-full h-full object-cover opacity-80" alt="thumb" />
                                            </div>
                                            
                                            <div className="flex items-center gap-2">
                                                <span className="font-bold text-sm text-gray-200">Capítulo {chapter.number}</span>
                                                {index === 0 && sortOrder === 'desc' && (
                                                    <span className="bg-[#5D24D6] text-white text-[8px] font-black px-1.5 py-0.5 rounded-[4px] uppercase tracking-wider">Novo</span>
                                                )}
                                            </div>
                                        </div>

                                        {/* Ações Laterais (Banco de Dados) */}
                                        <div className="flex items-center gap-3 pr-1">
                                            <button onClick={() => toggleSaveChapter(chapter.id)} className="p-1">
                                                <Bookmark className={`w-5 h-5 ${isSaved ? 'text-[#8B5CF6] fill-[#8B5CF6]' : 'text-gray-500 hover:text-gray-400'}`} />
                                            </button>
                                            
                                            <button 
                                                onClick={() => handleDownloadChapter(chapter.id)} 
                                                className={`w-9 h-9 rounded-xl border flex items-center justify-center transition-colors ${isDownloaded ? 'bg-[#5D24D6] border-[#5D24D6] text-white' : 'bg-transparent border-[#2A2A32] hover:bg-white/5 text-[#8B5CF6]'}`}
                                            >
                                                {isDownloaded ? <BookOpen className="w-4 h-4 fill-white" /> : <Download className="w-4 h-4" />}
                                            </button>
                                        </div>
                                    </div>
                                );
                            })}
                        </div>
                    </div>
                )}

                {/* OUTRAS ABAS (MANTIDO) */}
                {detailsTab === 'comentarios' && (
                    <div className="animate-in fade-in duration-300 bg-[#111114] p-4 rounded-2xl border border-white/5">
                        <CommentsSection mangaId={manga.id} user={user} userProfileData={userProfileData} onRequireLogin={onRequireLogin} showToast={showToast} />
                    </div>
                )}
                
                {detailsTab === 'informacoes' && (
                    <div className="animate-in fade-in duration-300 bg-[#111114] p-5 rounded-2xl border border-white/5">
                        <h3 className="text-[#8B5CF6] text-xs font-bold uppercase mb-3 tracking-wide">Sinopse da Obra</h3>
                        <p className="text-gray-400 text-sm leading-relaxed whitespace-pre-wrap">{manga.synopsis || "Sem sinopse disponível."}</p>
                    </div>
                )}

                {detailsTab === 'avaliacoes' && (
                    <div className="animate-in fade-in duration-300 text-center py-10 bg-[#111114] p-4 rounded-2xl border border-white/5">
                        <Star className="w-8 h-8 text-[#2A2A32] mx-auto mb-2" />
                        <span className="text-gray-500 text-xs font-bold uppercase">Sem avaliações</span>
                    </div>
                )}
            </div>
        </div>
    );
}
