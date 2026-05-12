import React, { useState, useEffect } from 'react';
import { 
    ArrowLeft, Share2, MoreHorizontal, Bookmark, BookOpen, Star, 
    MessageSquare, ChevronDown, Bell, Heart, ListFilter, CheckCircle, Clock, Play 
} from 'lucide-react';
import { doc, updateDoc, setDoc, deleteDoc, increment } from "firebase/firestore";
import { APP_ID } from './constants';
import { CommentsSection } from './CommentsSection';
import { timeAgo } from './helpers';

export default function DetailsView({ manga, libraryData, historyData, user, userProfileData, onBack, onChapterClick, onRequireLogin, showToast, db }) {
    const [detailsTab, setDetailsTab] = useState('capitulos'); 
    const [sortOrder, setSortOrder] = useState('desc');

    // ==========================================
    // LÓGICA DE BANCO DE DADOS E ESTADOS
    // ==========================================

    // 1. Registro de Visualizações (Views)
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

    // 2. Status da Biblioteca e Novas Funções
    const userLibDoc = libraryData && libraryData[manga.id];
    const isReading = !!userLibDoc;
    const [isFavorite, setIsFavorite] = useState(userLibDoc?.isFavorite || false);
    const [isNotified, setIsNotified] = useState(userLibDoc?.isNotified || false);

    const toggleLibrary = async () => {
        if (!user) return onRequireLogin();
        try {
            const ref = doc(db, 'artifacts', APP_ID, 'users', user.uid, 'library', manga.id.toString());
            if (isReading) {
                await deleteDoc(ref);
                showToast("Obra removida da sua lista.", "info");
            } else {
                await setDoc(ref, { mangaId: manga.id, status: 'Lendo', updatedAt: Date.now() }, { merge: true });
                showToast("Obra adicionada à sua lista!", "success");
            }
        } catch (error) { showToast("Erro ao atualizar lista.", "error"); }
    };

    const toggleFavorite = async () => {
        if (!user) return onRequireLogin();
        const newState = !isFavorite;
        setIsFavorite(newState); // Atualiza UI instantaneamente
        try {
            const ref = doc(db, 'artifacts', APP_ID, 'users', user.uid, 'library', manga.id.toString());
            await setDoc(ref, { isFavorite: newState, updatedAt: Date.now() }, { merge: true });
            showToast(newState ? "Adicionado aos favoritos ❤️" : "Removido dos favoritos", "success");
        } catch (error) { setIsFavorite(!newState); showToast("Erro ao favoritar.", "error"); }
    };

    const toggleNotification = async () => {
        if (!user) return onRequireLogin();
        const newState = !isNotified;
        setIsNotified(newState); // Atualiza UI instantaneamente
        try {
            const ref = doc(db, 'artifacts', APP_ID, 'users', user.uid, 'library', manga.id.toString());
            await setDoc(ref, { isNotified: newState, updatedAt: Date.now() }, { merge: true });
            showToast(newState ? "Notificações ativadas 🔔" : "Notificações desativadas", "success");
        } catch (error) { setIsNotified(!newState); showToast("Erro ao configurar alertas.", "error"); }
    };

    const handleShare = () => {
        navigator.clipboard.writeText(window.location.href);
        showToast("Link copiado! Compartilhe a obra.", "success");
    };

    // 3. Organização de Capítulos e Histórico
    const mangaHistory = (historyData || []).filter(h => h.mangaId === manga.id);
    const lastRead = mangaHistory.length > 0 ? mangaHistory[0] : null;
    const chapters = manga.chapters || [];
    const firstChapter = chapters.length > 0 ? chapters[chapters.length - 1] : null;
    const nextChapterToRead = lastRead ? chapters.find(c => Number(c.number) === Number(lastRead.chapterNumber) + 1) || chapters.find(c => c.id === lastRead.id) : firstChapter;

    const sortedChapters = [...chapters].sort((a, b) => {
        return sortOrder === 'desc' ? b.number - a.number : a.number - b.number;
    });

    if (!manga) return null;

    // ==========================================
    // RENDERIZAÇÃO DA INTERFACE (Elegante & Suave)
    // ==========================================
    return (
        <div className="min-h-screen bg-[#0A0A0C] text-gray-200 font-sans pb-24 relative overflow-x-hidden selection:bg-indigo-500/30">
            
            {/* 1. BACKGROUND SUAVE (Desfoque de profundidade elegante) */}
            <div className="absolute top-0 left-0 w-full h-[60vh] opacity-20 pointer-events-none overflow-hidden flex justify-center">
                <div className="w-[120%] h-[120%] absolute -top-[10%] bg-gradient-to-b from-transparent to-[#0A0A0C] z-10"></div>
                <img src={manga.coverUrl} className="w-full h-full object-cover object-top filter blur-[60px] scale-110 saturate-150" alt="bg" />
            </div>

            {/* 2. HEADER MINIMALISTA */}
            <div className="sticky top-0 left-0 w-full z-50 bg-[#0A0A0C]/70 backdrop-blur-xl border-b border-white/[0.03] transition-all duration-300">
                <div className="max-w-6xl mx-auto px-4 md:px-8 h-16 flex justify-between items-center">
                    <button onClick={onBack} className="flex items-center gap-2 w-10 h-10 rounded-full hover:bg-white/5 transition-colors text-gray-300 hover:text-white">
                        <ArrowLeft className="w-5 h-5 mx-auto" />
                    </button>

                    <div className="flex items-center gap-1">
                        <button onClick={handleShare} className="w-10 h-10 rounded-full flex items-center justify-center hover:bg-white/5 transition-colors text-gray-400 hover:text-white">
                            <Share2 className="w-4 h-4" />
                        </button>
                        <button className="w-10 h-10 rounded-full flex items-center justify-center hover:bg-white/5 transition-colors text-gray-400 hover:text-white">
                            <MoreHorizontal className="w-5 h-5" />
                        </button>
                    </div>
                </div>
            </div>

            <div className="max-w-6xl mx-auto px-4 md:px-8 pt-10 relative z-10">
                
                {/* 3. ÁREA HERO (Ousada e Limpa) */}
                <div className="flex flex-col md:flex-row gap-8 md:gap-12 mb-16 items-center md:items-start">
                    
                    {/* CAPA: Sombra suave e cantos arredondados premium */}
                    <div className="w-[220px] md:w-[300px] flex-shrink-0 relative group">
                        <div className="absolute -inset-4 bg-gradient-to-b from-white/5 to-transparent rounded-[2.5rem] blur-lg opacity-0 group-hover:opacity-100 transition-opacity duration-700 pointer-events-none"></div>
                        <div className="relative aspect-[2/3] rounded-[24px] overflow-hidden shadow-[0_20px_60px_-15px_rgba(0,0,0,0.8)] border border-white/[0.05] bg-[#111] transition-transform duration-500 hover:scale-[1.02]">
                            <img src={manga.coverUrl} alt={manga.title} className="w-full h-full object-cover" />
                            {/* Overlay sutil na base da capa */}
                            <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent pointer-events-none"></div>
                        </div>
                    </div>

                    {/* INFORMAÇÕES: Hierarquia visual elegante */}
                    <div className="flex-1 flex flex-col justify-center text-center md:text-left pt-2">
                        
                        {/* Status Label minimalista */}
                        <div className="inline-flex items-center gap-2 mb-4 mx-auto md:mx-0 px-3 py-1 rounded-full bg-white/[0.03] border border-white/[0.05]">
                            <div className="w-1.5 h-1.5 rounded-full bg-indigo-400 animate-pulse"></div>
                            <span className="text-[10px] text-gray-300 font-semibold tracking-widest uppercase">
                                {manga.status || 'Em Andamento'}
                            </span>
                        </div>
                        
                        <h1 className="text-4xl md:text-5xl lg:text-6xl font-extrabold text-white leading-[1.1] mb-4 tracking-tight drop-shadow-sm">
                            {manga.title || 'Título da Obra'}
                        </h1>
                        
                        <p className="text-indigo-300 font-medium text-sm md:text-base mb-8 flex items-center justify-center md:justify-start gap-2">
                            {manga.author || 'Autor'} <span className="w-1 h-1 rounded-full bg-white/20"></span> <span className="text-gray-400">{manga.studio || 'Studio'}</span>
                        </p>

                        {/* Estatísticas Leves */}
                        <div className="flex flex-wrap items-center justify-center md:justify-start gap-6 mb-8 text-sm text-gray-400">
                            <div className="flex items-center gap-2">
                                <Star className="w-4 h-4 text-yellow-500 fill-yellow-500" />
                                <span className="font-semibold text-gray-200">{Number(manga?.rating || 5.0).toFixed(1)}</span>
                            </div>
                            <div className="flex items-center gap-2">
                                <BookOpen className="w-4 h-4 text-gray-500" />
                                <span>{chapters.length} Capítulos</span>
                            </div>
                            <div className="flex items-center gap-2">
                                <Clock className="w-4 h-4 text-gray-500" />
                                <span>Atualizado {chapters.length > 0 ? timeAgo(chapters[0].rawTime || Date.now()) : 'recentemente'}</span>
                            </div>
                        </div>

                        {/* Tags Suaves (Pills) */}
                        <div className="flex flex-wrap justify-center md:justify-start gap-2 mb-10">
                            {(manga.genres?.slice(0, 4) || ['Ação', 'Fantasia', 'Aventura']).map(g => (
                                <span key={g} className="px-4 py-1.5 rounded-full text-xs font-medium text-gray-300 bg-white/[0.03] border border-white/[0.05] hover:bg-white/[0.08] transition-colors cursor-default">
                                    {g}
                                </span>
                            ))}
                        </div>

                        {/* 4. BOTÕES DE AÇÃO: Ousados e Organizados */}
                        <div className="flex flex-col sm:flex-row items-center gap-4 w-full max-w-lg mx-auto md:mx-0">
                            
                            {/* Botão Principal */}
                            <button 
                                onClick={() => nextChapterToRead ? onChapterClick(manga, nextChapterToRead) : showToast("Nenhum capítulo disponível", "warning")} 
                                className="flex-1 w-full bg-white text-black hover:bg-gray-100 py-4 px-8 rounded-2xl flex items-center justify-center gap-3 font-bold text-sm tracking-wide transition-transform active:scale-95 shadow-[0_0_40px_rgba(255,255,255,0.1)]"
                            >
                                <Play className="w-4 h-4 fill-black" />
                                {lastRead ? 'Continuar Leitura' : 'Começar a Ler'}
                            </button>

                            {/* Botões Secundários Circulares e Suaves */}
                            <div className="flex items-center gap-3">
                                <button onClick={toggleLibrary} className={`w-14 h-14 rounded-2xl flex items-center justify-center transition-all border ${isReading ? 'bg-indigo-500/10 border-indigo-500/30 text-indigo-400' : 'bg-white/[0.03] border-white/[0.05] text-gray-400 hover:bg-white/10 hover:text-white'}`}>
                                    <Bookmark className={`w-5 h-5 ${isReading ? 'fill-current' : ''}`} />
                                </button>
                                <button onClick={toggleFavorite} className={`w-14 h-14 rounded-2xl flex items-center justify-center transition-all border ${isFavorite ? 'bg-pink-500/10 border-pink-500/30 text-pink-400' : 'bg-white/[0.03] border-white/[0.05] text-gray-400 hover:bg-white/10 hover:text-white'}`}>
                                    <Heart className={`w-5 h-5 ${isFavorite ? 'fill-current' : ''}`} />
                                </button>
                                <button onClick={toggleNotification} className={`w-14 h-14 rounded-2xl flex items-center justify-center transition-all border ${isNotified ? 'bg-blue-500/10 border-blue-500/30 text-blue-400' : 'bg-white/[0.03] border-white/[0.05] text-gray-400 hover:bg-white/10 hover:text-white'}`}>
                                    <Bell className={`w-5 h-5 ${isNotified ? 'fill-current' : ''}`} />
                                </button>
                            </div>
                        </div>
                    </div>
                </div>

                {/* 5. NAVEGAÇÃO DE ABAS: Design "Pill" moderno e flutuante */}
                <div className="flex justify-center md:justify-start mb-8">
                    <div className="inline-flex items-center p-1.5 bg-white/[0.02] border border-white/[0.05] rounded-full overflow-x-auto hide-scrollbar max-w-full">
                        {[
                            { id: 'capitulos', label: 'Capítulos' },
                            { id: 'informacoes', label: 'Sobre a Obra' },
                            { id: 'comentarios', label: 'Comunidade' }
                        ].map(tab => (
                            <button 
                                key={tab.id} 
                                onClick={() => setDetailsTab(tab.id)} 
                                className={`px-6 py-2.5 rounded-full text-sm font-semibold whitespace-nowrap transition-all duration-300 ${detailsTab === tab.id ? 'bg-white text-black shadow-md' : 'text-gray-500 hover:text-gray-300 hover:bg-white/5'}`}
                            >
                                {tab.label}
                            </button>
                        ))}
                    </div>
                </div>

                {/* 6. CONTEÚDO DAS ABAS */}
                <div className="w-full pb-10">
                    
                    {/* ABA: CAPÍTULOS - Design Limpo em Lista */}
                    {detailsTab === 'capitulos' && (
                        <div className="animate-in fade-in slide-in-from-bottom-4 duration-500">
                            
                            <div className="flex items-center justify-between mb-6 px-2">
                                <span className="text-gray-400 text-sm font-medium">{chapters.length} Capítulos disponíveis</span>
                                <button onClick={() => setSortOrder(prev => prev === 'desc' ? 'asc' : 'desc')} className="flex items-center gap-2 text-sm font-medium text-gray-300 hover:text-white bg-white/[0.03] border border-white/[0.05] px-4 py-2 rounded-full transition-colors">
                                    <ListFilter className="w-4 h-4" />
                                    {sortOrder === 'desc' ? 'Recentes' : 'Antigos'}
                                </button>
                            </div>

                            <div className="flex flex-col gap-2">
                                {chapters.length === 0 ? (
                                    <div className="text-center py-16 bg-white/[0.01] rounded-3xl border border-white/[0.03]">
                                        <p className="text-gray-500 font-medium text-sm">Os capítulos ainda não foram adicionados.</p>
                                    </div>
                                ) : (
                                    sortedChapters.map((chapter, index) => {
                                        const isRead = mangaHistory.some(h => h.chapterNumber === chapter.number);
                                        
                                        return (
                                            <div 
                                                key={chapter.id} 
                                                onClick={() => onChapterClick(manga, chapter)}
                                                className="group flex items-center justify-between p-3 md:p-4 bg-white/[0.01] border border-transparent hover:bg-white/[0.03] hover:border-white/[0.05] rounded-2xl cursor-pointer transition-all duration-300"
                                            >
                                                <div className="flex items-center gap-4 md:gap-6">
                                                    {/* Miniatura suave */}
                                                    <div className="w-16 h-16 md:w-20 md:h-14 rounded-xl overflow-hidden bg-[#111] flex-shrink-0 relative">
                                                        <img src={manga.coverUrl} className={`w-full h-full object-cover transition-transform duration-700 group-hover:scale-110 ${isRead ? 'opacity-40 grayscale' : 'opacity-80'}`} alt="thumb" />
                                                        {isRead && <div className="absolute inset-0 flex items-center justify-center bg-black/30"><CheckCircle className="w-5 h-5 text-white/50" /></div>}
                                                    </div>
                                                    
                                                    <div className="flex flex-col gap-1">
                                                        <div className="flex items-center gap-3">
                                                            <span className={`font-semibold text-base md:text-lg transition-colors ${isRead ? 'text-gray-500' : 'text-gray-200 group-hover:text-white'}`}>
                                                                Capítulo {chapter.number}
                                                            </span>
                                                            {index === 0 && sortOrder === 'desc' && !isRead && (
                                                                <span className="bg-indigo-500/20 text-indigo-400 text-[10px] font-bold px-2 py-0.5 rounded-full uppercase tracking-wide">Novo</span>
                                                            )}
                                                        </div>
                                                        <span className="text-xs text-gray-500 truncate max-w-[150px] md:max-w-xs">
                                                            {chapter.title || 'Ler capítulo completo'}
                                                        </span>
                                                    </div>
                                                </div>

                                                <div className="flex items-center gap-4 pl-4">
                                                    <span className="text-xs text-gray-600 hidden sm:block font-medium">{timeAgo(chapter.rawTime || Date.now())}</span>
                                                    <div className="w-10 h-10 rounded-full bg-white/[0.03] flex items-center justify-center text-gray-400 group-hover:bg-white text-black transition-colors">
                                                        <Play className="w-4 h-4 ml-0.5 fill-current" />
                                                    </div>
                                                </div>
                                            </div>
                                        );
                                    })
                                )}
                            </div>
                        </div>
                    )}

                    {/* ABA: INFORMAÇÕES - Tipografia confortável para leitura */}
                    {detailsTab === 'informacoes' && (
                        <div className="animate-in fade-in slide-in-from-bottom-4 duration-500 max-w-3xl">
                            <h3 className="text-white font-semibold text-lg mb-4">Sinopse</h3>
                            <p className="text-gray-400 leading-relaxed text-base md:text-lg whitespace-pre-wrap font-light">
                                {manga.synopsis || "As informações detalhadas sobre a história desta obra ainda não estão disponíveis."}
                            </p>
                        </div>
                    )}

                    {/* ABA: COMENTÁRIOS */}
                    {detailsTab === 'comentarios' && (
                        <div className="animate-in fade-in slide-in-from-bottom-4 duration-500">
                            <div className="bg-white/[0.02] border border-white/[0.05] rounded-3xl p-6 md:p-8">
                                <CommentsSection mangaId={manga.id} user={user} userProfileData={userProfileData} onRequireLogin={onRequireLogin} showToast={showToast} />
                            </div>
                        </div>
                    )}

                </div>
            </div>
            
            {/* CSS inline para ocultar scrollbar no menu mobile */}
            <style dangerouslySetInnerHTML={{__html: `
                .hide-scrollbar::-webkit-scrollbar { display: none; }
                .hide-scrollbar { -ms-overflow-style: none; scrollbar-width: none; }
            `}} />
        </div>
    );
}
