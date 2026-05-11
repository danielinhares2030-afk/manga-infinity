import React, { useState, useEffect } from 'react';
import { ChevronLeft, ChevronRight, Bookmark, MoreVertical, BookOpen, Heart, Bell, Share, Star, MessageSquare, Info, Crown, Calendar, ListFilter } from 'lucide-react';
import { doc, updateDoc, setDoc, increment } from "firebase/firestore";
import { APP_ID } from './constants';
import { CommentsSection } from './CommentsSection';
import { timeAgo } from './helpers';

export default function DetailsView({ manga, libraryData, historyData, user, userProfileData, onBack, onChapterClick, onRequireLogin, showToast, db }) {
    const [detailsTab, setDetailsTab] = useState('capitulos'); 
    const [sortOrder, setSortOrder] = useState('desc');

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

    if (!manga) return null;

    // Conexão com o Banco de Dados Real para as Novas Funções
    const userLibDoc = libraryData && libraryData[manga.id];
    const isFavorite = userLibDoc?.isFavorite || false;
    const isNotified = userLibDoc?.isNotified || false;

    const toggleFavorite = async () => {
        if (!user) return onRequireLogin();
        try {
            const ref = doc(db, 'artifacts', APP_ID, 'users', user.uid, 'library', manga.id.toString());
            await setDoc(ref, { 
                mangaId: manga.id, 
                isFavorite: !isFavorite, 
                updatedAt: Date.now() 
            }, { merge: true });
            
            showToast(isFavorite ? "Removido dos favoritos" : "Adicionado aos favoritos!", "success");
        } catch (error) { showToast("Erro ao favoritar.", "error"); }
    };

    const toggleNotification = async () => {
        if (!user) return onRequireLogin();
        try {
            const ref = doc(db, 'artifacts', APP_ID, 'users', user.uid, 'library', manga.id.toString());
            await setDoc(ref, { 
                mangaId: manga.id, 
                isNotified: !isNotified, 
                updatedAt: Date.now() 
            }, { merge: true });
            
            showToast(isNotified ? "Notificações desativadas." : "Notificações ativadas!", "success");
        } catch (error) { showToast("Erro ao atualizar notificações.", "error"); }
    };

    const handleShare = () => {
        navigator.clipboard.writeText(window.location.href);
        showToast("Link copiado para compartilhar!", "success");
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

    const displayGenre = manga.genres && manga.genres.length > 0 ? manga.genres.slice(0, 3) : ['AÇÃO', 'FANTASIA', 'SOBRENATURAL'];

    return (
        <div className="min-h-screen bg-[#09090B] text-gray-200 font-sans pb-24 relative overflow-x-hidden selection:bg-[#D4AF37]/40">
            
            {/* EFEITO DE LUZ DE FUNDO (Aura Superior) */}
            <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[800px] h-[500px] bg-gradient-to-b from-[#1c142b] to-transparent opacity-40 blur-[80px] pointer-events-none"></div>

            {/* HEADER TOPO */}
            <div className="relative z-50 flex justify-between items-center px-4 md:px-6 pt-6 pb-2">
                <button onClick={onBack} className="w-10 h-10 rounded-xl border border-white/10 flex items-center justify-center bg-white/5 hover:bg-white/10 transition-colors">
                    <ChevronLeft className="w-5 h-5 text-white" />
                </button>

                <div className="flex flex-col items-center">
                    <Crown className="w-5 h-5 text-[#D4AF37] mb-1" />
                    <span className="text-white font-serif tracking-widest text-sm font-bold uppercase">Manga<br/><span className="text-[#D4AF37]">Empire</span></span>
                </div>

                <div className="flex items-center gap-2">
                    <button className="w-10 h-10 rounded-xl border border-white/10 flex items-center justify-center bg-white/5 hover:bg-white/10 transition-colors">
                        <Bookmark className="w-4 h-4 text-white" />
                    </button>
                    <button className="w-10 h-10 rounded-xl border border-white/10 flex items-center justify-center bg-white/5 hover:bg-white/10 transition-colors">
                        <MoreVertical className="w-5 h-5 text-white" />
                    </button>
                </div>
            </div>

            <div className="max-w-4xl mx-auto px-4 sm:px-6 pt-8 relative z-10">
                
                {/* ÁREA DA CAPA E INFORMAÇÕES GERAIS */}
                <div className="flex flex-col md:flex-row gap-8 mb-10 items-center md:items-start">
                    
                    {/* CAPA DA OBRA COM BRILHO ROXO */}
                    <div className="w-[240px] md:w-[300px] flex-shrink-0 relative group">
                        <div className="absolute -inset-1 bg-purple-600/30 blur-[25px] rounded-[2rem] pointer-events-none"></div>
                        <div className="relative aspect-[2/3] rounded-[24px] overflow-hidden border border-purple-500/30 shadow-[0_0_30px_rgba(168,85,247,0.2)] bg-[#111]">
                            <img src={manga.coverUrl} alt={manga.title} className="w-full h-full object-cover" />
                            <div className="absolute bottom-4 left-1/2 -translate-x-1/2 bg-[#09090B]/80 backdrop-blur-md p-2 rounded-full border border-[#D4AF37]/30">
                                <Crown className="w-4 h-4 text-[#D4AF37]" />
                            </div>
                        </div>
                    </div>

                    {/* DETALHES E BOTÕES DE AÇÃO */}
                    <div className="flex-1 flex flex-col justify-center w-full">
                        <div className="mb-6 text-center md:text-left">
                            <h2 className="text-gray-300 font-light text-lg md:text-2xl tracking-widest uppercase mb-1">Título da</h2>
                            <h1 className="text-5xl md:text-6xl font-black text-transparent bg-clip-text bg-gradient-to-r from-[#FFF5C3] via-[#D4AF37] to-[#8C7326] uppercase drop-shadow-md">
                                {manga.title || 'Obra'}
                            </h1>
                        </div>
                        
                        {/* Tags de Gênero */}
                        <div className="flex flex-wrap justify-center md:justify-start gap-2 mb-8">
                            {displayGenre.map(g => (
                                <span key={g} className="px-4 py-1.5 rounded-full text-[10px] font-bold text-gray-300 bg-[#141419] border border-white/5 uppercase tracking-wider">
                                    {g}
                                </span>
                            ))}
                            <span className="px-3 py-1.5 rounded-full text-[12px] font-bold text-gray-300 bg-[#141419] border border-white/5">
                                +
                            </span>
                        </div>

                        {/* Botão Principal de Leitura */}
                        <button onClick={() => nextChapterToRead ? onChapterClick(manga, nextChapterToRead) : showToast("Nenhum capítulo", "warning")} className="w-full bg-gradient-to-r from-[#EAD28B] via-[#D4AF37] to-[#B38D45] hover:brightness-110 text-black font-black py-4 px-6 rounded-2xl flex items-center justify-between transition-all mb-6 shadow-[0_10px_30px_rgba(212,175,55,0.2)]">
                            <div className="flex items-center gap-3">
                                <BookOpen className="w-5 h-5" />
                                <span className="text-sm tracking-wider uppercase">{lastRead ? 'Continuar Leitura' : 'Ler Agora'}</span>
                            </div>
                            <ChevronRight className="w-5 h-5" />
                        </button>

                        {/* Botões Secundários (Favoritar, Notificar, Compartilhar) */}
                        <div className="grid grid-cols-3 gap-3">
                            <button onClick={toggleFavorite} className="flex flex-col items-center justify-center gap-2 bg-[#141419] border border-white/5 py-4 rounded-2xl hover:bg-[#1a1a20] transition-colors group">
                                <Heart className={`w-6 h-6 transition-colors ${isFavorite ? 'fill-purple-500 text-purple-500' : 'text-purple-400 group-hover:text-purple-300'}`} />
                                <span className="text-[10px] text-gray-400 uppercase tracking-wider font-bold">Favoritar</span>
                            </button>
                            <button onClick={toggleNotification} className="flex flex-col items-center justify-center gap-2 bg-[#141419] border border-white/5 py-4 rounded-2xl hover:bg-[#1a1a20] transition-colors group">
                                <Bell className={`w-6 h-6 transition-colors ${isNotified ? 'fill-purple-500 text-purple-500' : 'text-purple-400 group-hover:text-purple-300'}`} />
                                <span className="text-[10px] text-gray-400 uppercase tracking-wider font-bold">Notificar</span>
                            </button>
                            <button onClick={handleShare} className="flex flex-col items-center justify-center gap-2 bg-[#141419] border border-white/5 py-4 rounded-2xl hover:bg-[#1a1a20] transition-colors group">
                                <Share className="w-6 h-6 text-purple-400 group-hover:text-purple-300 transition-colors" />
                                <span className="text-[10px] text-gray-400 uppercase tracking-wider font-bold">Compartilhar</span>
                            </button>
                        </div>
                    </div>
                </div>

                {/* NAVEGAÇÃO DE ABAS */}
                <div className="bg-[#141419] rounded-2xl p-1 mb-8 flex justify-between overflow-x-auto border border-white/5 hide-scrollbar">
                    <button onClick={() => setDetailsTab('capitulos')} className={`flex flex-col items-center gap-1.5 px-6 py-3 rounded-xl min-w-[100px] transition-all relative ${detailsTab === 'capitulos' ? 'text-[#D4AF37]' : 'text-gray-500 hover:text-gray-300'}`}>
                        <Crown className="w-5 h-5" />
                        <span className="text-[10px] font-black uppercase tracking-wider">Capítulos</span>
                        {detailsTab === 'capitulos' && <div className="absolute bottom-0 left-1/2 -translate-x-1/2 w-10 h-0.5 bg-[#D4AF37] rounded-t-full shadow-[0_-2px_10px_rgba(212,175,55,1)]"></div>}
                    </button>
                    <button onClick={() => setDetailsTab('avaliacoes')} className={`flex flex-col items-center gap-1.5 px-6 py-3 rounded-xl min-w-[100px] transition-all relative ${detailsTab === 'avaliacoes' ? 'text-[#D4AF37]' : 'text-gray-500 hover:text-gray-300'}`}>
                        <Star className="w-5 h-5" />
                        <span className="text-[10px] font-black uppercase tracking-wider">Avaliações</span>
                        {detailsTab === 'avaliacoes' && <div className="absolute bottom-0 left-1/2 -translate-x-1/2 w-10 h-0.5 bg-[#D4AF37] rounded-t-full shadow-[0_-2px_10px_rgba(212,175,55,1)]"></div>}
                    </button>
                    <button onClick={() => setDetailsTab('comentarios')} className={`flex flex-col items-center gap-1.5 px-6 py-3 rounded-xl min-w-[100px] transition-all relative ${detailsTab === 'comentarios' ? 'text-[#D4AF37]' : 'text-gray-500 hover:text-gray-300'}`}>
                        <MessageSquare className="w-5 h-5" />
                        <span className="text-[10px] font-black uppercase tracking-wider">Comentários</span>
                        {detailsTab === 'comentarios' && <div className="absolute bottom-0 left-1/2 -translate-x-1/2 w-10 h-0.5 bg-[#D4AF37] rounded-t-full shadow-[0_-2px_10px_rgba(212,175,55,1)]"></div>}
                    </button>
                    <button onClick={() => setDetailsTab('informacoes')} className={`flex flex-col items-center gap-1.5 px-6 py-3 rounded-xl min-w-[100px] transition-all relative ${detailsTab === 'informacoes' ? 'text-[#D4AF37]' : 'text-gray-500 hover:text-gray-300'}`}>
                        <Info className="w-5 h-5" />
                        <span className="text-[10px] font-black uppercase tracking-wider">Informações</span>
                        {detailsTab === 'informacoes' && <div className="absolute bottom-0 left-1/2 -translate-x-1/2 w-10 h-0.5 bg-[#D4AF37] rounded-t-full shadow-[0_-2px_10px_rgba(212,175,55,1)]"></div>}
                    </button>
                </div>

                {/* CONTEÚDO DAS ABAS */}
                <div className="w-full pb-10">
                    
                    {detailsTab === 'capitulos' && (
                        <div className="animate-in fade-in duration-500">
                            
                            {/* CABEÇALHO DA LISTA DE CAPÍTULOS */}
                            <div className="flex items-center justify-between mb-4 bg-[#141419] p-4 rounded-2xl border border-white/5">
                                <div className="flex items-center gap-3">
                                    <Crown className="w-5 h-5 text-[#D4AF37]" />
                                    <h3 className="text-sm font-black text-white uppercase tracking-wider">Capítulos</h3>
                                </div>
                                <div className="flex items-center gap-3">
                                    <button onClick={() => setSortOrder(prev => prev === 'desc' ? 'asc' : 'desc')} className="text-[10px] font-bold text-gray-400 bg-white/5 border border-white/10 rounded-lg px-3 py-1.5 flex items-center gap-2 uppercase tracking-wider">
                                        {sortOrder === 'desc' ? 'Mais Recentes' : 'Mais Antigos'}
                                    </button>
                                    <button className="text-gray-400 hover:text-white transition-colors">
                                        <ListFilter className="w-5 h-5" />
                                    </button>
                                </div>
                            </div>

                            {/* LISTA DE CAPÍTULOS */}
                            <div className="flex flex-col gap-2">
                                {chapters.length === 0 ? (
                                    <div className="text-center py-10 bg-[#141419] rounded-2xl border border-white/5">
                                        <p className="text-gray-500 font-bold text-xs uppercase tracking-widest">Nenhum capítulo disponível.</p>
                                    </div>
                                ) : (
                                    sortedChapters.map((chapter) => {
                                        const isRead = mangaHistory.some(h => h.chapterNumber === chapter.number);
                                        const isNextToRead = nextChapterToRead?.id === chapter.id;
                                        
                                        return (
                                            <div key={chapter.id} onClick={() => onChapterClick(manga, chapter)} className={`cursor-pointer rounded-2xl flex items-center p-4 transition-all duration-300
                                                bg-[#141419] border border-white/5 hover:bg-[#1a1a20] relative overflow-hidden group
                                                ${isNextToRead ? 'border-l-2 border-l-[#D4AF37] bg-gradient-to-r from-[#D4AF37]/10 to-transparent' : ''}`}>
                                                
                                                {/* Efeito Neon Roxo na Borda Esquerda */}
                                                <div className={`absolute left-0 top-0 w-1 h-full bg-purple-500 shadow-[0_0_15px_rgba(168,85,247,0.8)] opacity-0 group-hover:opacity-100 transition-opacity duration-500 ${isNextToRead ? 'opacity-100 bg-[#D4AF37] shadow-[0_0_15px_rgba(212,175,55,0.8)]' : ''}`}></div>

                                                <div className="flex items-center gap-4 w-full pl-2">
                                                    {/* Ícone Coroa */}
                                                    <Crown className={`w-6 h-6 flex-shrink-0 ${isRead ? 'text-gray-700' : 'text-[#D4AF37]'}`} />

                                                    {/* Info Textos */}
                                                    <div className="flex-1 min-w-0 flex flex-col gap-1.5">
                                                        <div className={`h-4 rounded-md w-3/4 max-w-[200px] flex items-center ${isRead ? 'text-gray-600' : 'text-gray-200'}`}>
                                                            <span className="font-bold text-sm">Capítulo {chapter.number}</span>
                                                        </div>
                                                        <div className="h-3 rounded-md w-1/2 max-w-[150px] flex items-center text-gray-500 text-xs">
                                                            <span className="truncate">{chapter.title || manga.title}</span>
                                                        </div>
                                                    </div>

                                                    {/* Data e Botão Direito */}
                                                    <div className="flex items-center gap-4">
                                                        <div className="flex items-center gap-1.5 text-gray-500">
                                                            <Calendar className="w-3.5 h-3.5" />
                                                            <span className="text-[10px] font-medium tracking-wider">{timeAgo(chapter.rawTime || Date.now())}</span>
                                                        </div>
                                                        <div className="w-8 h-8 rounded-xl bg-white/5 border border-white/10 flex items-center justify-center text-gray-400 group-hover:text-white group-hover:bg-white/10 transition-colors">
                                                            <ChevronRight className="w-4 h-4" />
                                                        </div>
                                                    </div>
                                                </div>
                                            </div>
                                        );
                                    })
                                )}
                            </div>

                            {/* FOOTER DA LISTA */}
                            {chapters.length > 0 && (
                                <div className="mt-4 flex items-center justify-center gap-4 py-4">
                                    <div className="flex gap-1"><div className="w-1.5 h-1.5 rounded-full bg-[#D4AF37]/50"></div><div className="w-1.5 h-1.5 rounded-full bg-[#D4AF37]/50"></div></div>
                                    <span className="text-[#D4AF37] text-[10px] font-black uppercase tracking-widest">Ver todos os capítulos</span>
                                    <div className="flex gap-1"><div className="w-1.5 h-1.5 rounded-full bg-[#D4AF37]/50"></div><div className="w-1.5 h-1.5 rounded-full bg-[#D4AF37]/50"></div></div>
                                </div>
                            )}
                        </div>
                    )}

                    {detailsTab === 'comentarios' && (
                        <div className="animate-in fade-in duration-500 bg-[#141419] rounded-2xl p-4 md:p-6 border border-white/5">
                            <CommentsSection mangaId={manga.id} user={user} userProfileData={userProfileData} onRequireLogin={onRequireLogin} showToast={showToast} />
                        </div>
                    )}

                    {detailsTab === 'informacoes' && (
                        <div className="animate-in fade-in duration-500 bg-[#141419] rounded-2xl p-6 border border-white/5 text-gray-300 text-sm leading-relaxed text-justify">
                            <h3 className="text-[#D4AF37] font-bold uppercase tracking-wider mb-4">Sinopse</h3>
                            <p className="whitespace-pre-wrap">{manga.synopsis || "Informações sobre esta obra ainda não foram registradas nos nossos arquivos."}</p>
                        </div>
                    )}

                    {detailsTab === 'avaliacoes' && (
                        <div className="animate-in fade-in duration-500 text-center py-10 bg-[#141419] rounded-2xl border border-white/5">
                            <Star className="w-10 h-10 text-gray-700 mx-auto mb-4" />
                            <p className="text-gray-500 font-bold text-xs uppercase tracking-widest">Sistema de avaliações em breve.</p>
                        </div>
                    )}

                </div>
            </div>
            
            {/* CSS inline para ocultar scrollbar no menu de categorias */}
            <style dangerouslySetInnerHTML={{__html: `
                .hide-scrollbar::-webkit-scrollbar { display: none; }
                .hide-scrollbar { -ms-overflow-style: none; scrollbar-width: none; }
            `}} />
        </div>
    );
}
