import React, { useState, useEffect } from 'react';
// Importações de ícones atualizadas e corrigidas
import { ChevronLeft, Share2, MoreHorizontal, Bookmark, BookOpen, Star, MessageSquare, ChevronDown, Flame, Bell, Heart, ListFilter, CheckCircle } from 'lucide-react';
import { doc, updateDoc, setDoc, deleteDoc, increment } from "firebase/firestore";
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

    // Lógica Original da Biblioteca
    const inLibrary = libraryData && libraryData[manga.id];
    
    // Conexão com o Banco de Dados Real para as Novas Funções
    const userLibDoc = libraryData && libraryData[manga.id];
    const [isFavorite, setIsFavorite] = useState(userLibDoc?.isFavorite || false);
    const [isNotified, setIsNotified] = useState(userLibDoc?.isNotified || false);

    const toggleFavorite = async () => {
        if (!user) return onRequireLogin();
        try {
            const ref = doc(db, 'artifacts', APP_ID, 'users', user.uid, 'library', manga.id.toString());
            await setDoc(ref, { 
                mangaId: manga.id, 
                isFavorite: !isFavorite, 
                updatedAt: Date.now() 
            }, { merge: true });
            
            setIsFavorite(!isFavorite);
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
            
            setIsNotified(!isNotified);
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
    
    const displayGenre = manga.genres && manga.genres.length > 0 ? manga.genres.slice(0, 3) : ['Ação', 'Fantasia'];

    return (
        <div className="min-h-screen bg-[#030105] text-gray-200 font-sans pb-24 relative overflow-x-hidden selection:bg-purple-600/40">
            
            {/* BACKGROUND BLEND SUPER IMERSIVO */}
            <div className="absolute top-0 left-0 w-full h-[70vh] opacity-30 pointer-events-none" style={{ maskImage: 'linear-gradient(to bottom, black 20%, transparent 100%)', WebkitMaskImage: '-webkit-linear-gradient(top, black 20%, transparent 100%)' }}>
                <img src={manga.coverUrl} className="w-full h-full object-cover object-center filter blur-xl scale-110" alt="bg" />
                <div className="absolute inset-0 bg-gradient-to-b from-[#030105]/20 via-[#030105]/80 to-[#030105]"></div>
            </div>

            {/* HEADER FLUTUANTE OUSADO COM LOGO ATUALIZADO */}
            <div className="sticky top-4 left-0 w-full px-4 md:px-6 z-50 flex justify-center">
                <div className="w-full max-w-5xl flex justify-between items-center bg-white/5 border border-white/10 backdrop-blur-xl rounded-full px-4 py-3 shadow-[0_10px_40px_rgba(0,0,0,0.5)]">
                    <button onClick={onBack} className="flex items-center gap-2 text-white hover:text-fuchsia-400 hover:bg-white/5 px-3 py-1.5 rounded-full transition-all">
                        <ChevronLeft className="w-5 h-5" />
                        <span className="font-bold text-sm hidden md:block">Voltar</span>
                    </button>

                    {/* LOGO CENTRALIZADO COM TEMA OURO */}
                    <div className="flex flex-col items-center justify-center">
                        <Flame className="w-6 h-6 text-[#A855F7] mb-0.5 drop-shadow-[0_0_15px_rgba(168,85,247,0.8)]" />
                        <span className="text-[10px] tracking-[0.4em] text-gray-400 uppercase font-light">Manga</span>
                        <span className="text-xl font-serif font-black tracking-widest uppercase text-white">Inferi<span className="text-[#A855F7]">a</span></span>
                        <div className="mt-1 flex items-center gap-1.5 opacity-50">
                            <div className="w-6 h-px bg-gradient-to-r from-transparent to-[#A855F7]"></div>
                            <div className="w-1.5 h-1.5 rotate-45 bg-[#A855F7]"></div>
                            <div className="w-6 h-px bg-gradient-to-l from-transparent to-[#A855F7]"></div>
                        </div>
                    </div>

                    <div className="flex items-center gap-2">
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
                
                {/* ÁREA HERO: CAPA DE UM LADO E INFORMAÇÕES DO OUTRO LADO, EXATAMENTE COMO NA FOTO */}
                <div className="flex flex-col md:flex-row gap-8 md:gap-14 mb-16 items-center md:items-start">
                    
                    {/* COLUNA ESQUERDA: CAPA COM DETALHES OURO E GLOW OURO/FUCHSIA */}
                    <div className="w-[200px] md:w-[280px] flex-shrink-0 relative group perspective-1000">
                        <div className="absolute -inset-2 bg-gradient-to-br from-purple-600 to-fuchsia-600 blur-[30px] opacity-40 group-hover:opacity-70 transition-opacity duration-700 rounded-3xl pointer-events-none"></div>
                        {/* Detalhes ouro adicionados na capa */}
                        <div className="absolute -top-3 -left-3 z-20 w-12 h-12 flex items-center justify-center bg-[#D4AF37] rounded-full border-2 border-white/20 shadow-[0_0_20px_rgba(212,175,55,0.8)]">
                            <Star className="w-6 h-6 text-black fill-black" />
                        </div>
                        <div className="absolute -top-6 left-1/2 -translate-x-1/2 z-20 w-16 h-12 flex items-center justify-center text-[#D4AF37] drop-shadow-[0_0_10px_rgba(212,175,55,0.8)]">
                            <Bookmark className="w-10 h-10 fill-current" />
                        </div>
                        <div className="relative aspect-[2/3] rounded-2xl overflow-hidden shadow-[0_20px_50px_rgba(0,0,0,0.9)] border border-white/10 bg-[#111] transform transition-transform duration-500 group-hover:-translate-y-2 group-hover:scale-[1.02]">
                            <img src={manga.coverUrl} alt={manga.title} className="w-full h-full object-cover" />
                            <div className="absolute bottom-0 left-0 w-full p-4 bg-gradient-to-t from-black via-black/80 to-transparent">
                                <div className="inline-block bg-white/10 backdrop-blur-md px-3 py-1.5 text-[9px] font-black text-white uppercase tracking-widest rounded-lg border border-white/10">
                                    {manga.status || 'Em Lançamento'}
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* COLUNA DIREITA: INFORMAÇÕES DO MANGÁ */}
                    <div className="flex-1 flex flex-col justify-center text-center md:text-left pt-2 md:pt-6">
                        {/* Título da Obra */}
                        <div className="mb-4">
                            <span className="text-gray-400 font-light text-xs md:text-sm tracking-widest uppercase mb-1">Título da</span>
                            <div className="flex items-center gap-1.5 justify-center md:justify-start">
                                <Bookmark className="w-4 h-4 text-[#D4AF37] fill-[#D4AF37]" />
                                <Bookmark className="w-4 h-4 text-[#D4AF37] fill-[#D4AF37]" />
                            </div>
                            <h1 className="text-4xl md:text-6xl font-black text-transparent bg-clip-text bg-gradient-to-br from-white via-[#EAD28B] to-[#D4AF37] leading-tight mb-3 tracking-tight drop-shadow-sm uppercase">
                                {manga.title || 'Sem Título'}
                            </h1>
                        </div>
                        <p className="text-purple-400 font-bold text-sm md:text-base mb-6 tracking-wide">
                            {manga.author || 'Autor Desconhecido'} <span className="text-gray-600 mx-2">•</span> <span className="text-gray-400">{manga.studio || 'Nexo Studio'}</span>
                        </p>
                        
                        {/* Tags com Estilo Atualizado */}
                        <div className="flex flex-wrap justify-center md:justify-start gap-2 mb-8">
                            {displayGenre.map(g => (
                                <span key={g} className="px-4 py-1.5 rounded-full text-xs font-bold text-white bg-white/5 border border-white/10 backdrop-blur-md hover:bg-white/10 hover:border-purple-500/50 transition-all cursor-default">
                                    {g}
                                </span>
                            ))}
                            <button className="w-9 h-9 rounded-full bg-white/5 border border-white/10 flex items-center justify-center text-gray-300 hover:bg-white/10 transition-colors">+</button>
                        </div>

                        {/* Sinopse */}
                        <div className="text-gray-300 text-sm md:text-base leading-relaxed mb-8 font-medium max-w-2xl relative">
                            <p className="whitespace-pre-wrap line-clamp-3 text-transparent bg-clip-text bg-gradient-to-b from-gray-200 to-gray-600">
                                {manga.synopsis || "Os registros akáshicos ainda não decifraram os mistérios desta obra."}
                            </p>
                        </div>

                        {/* Botões Principais (Ler Agora, Favoritar, Notificar) */}
                        <div className="flex flex-col sm:flex-row items-center gap-6">
                            <button onClick={() => nextChapterToRead ? onChapterClick(manga, nextChapterToRead) : showToast("Nenhum capítulo disponível", "warning")} className="w-full sm:w-auto relative overflow-hidden group bg-white text-black font-black py-4 px-10 rounded-full flex items-center justify-center gap-3 transition-all transform hover:scale-105 shadow-[0_0_30px_rgba(255,255,255,0.2)]">
                                {/* Efeito de Brilho Interno passando */}
                                <div className="absolute top-0 -inset-full h-full w-1/2 z-5 block transform -skew-x-12 bg-gradient-to-r from-transparent to-white opacity-40 group-hover:animate-shine" />
                                <BookOpen className="w-5 h-5 fill-black" />
                                <span className="text-base">{lastRead ? 'Continuar Leitura' : 'Iniciar Jornada'}</span>
                            </button>

                            <div className="flex items-center gap-3">
                                <button onClick={toggleFavorite} className={`w-14 h-14 rounded-2xl border flex items-center justify-center transition-all ${isFavorite ? 'bg-purple-600/20 border-purple-500 shadow-[0_0_15px_rgba(168,85,247,0.4)]' : 'bg-transparent border-white/10 hover:bg-white/10'}`}>
                                    <Heart className={`w-6 h-6 ${isFavorite ? 'text-purple-400 fill-purple-400' : 'text-gray-300'}`} />
                                </button>
                                <button onClick={toggleNotification} className={`w-14 h-14 rounded-2xl border flex items-center justify-center transition-all ${isNotified ? 'bg-purple-600/20 border-purple-500 shadow-[0_0_15px_rgba(168,85,247,0.4)]' : 'bg-transparent border-white/10 hover:bg-white/10'}`}>
                                    <Bell className={`w-6 h-6 ${isNotified ? 'text-purple-400 fill-purple-400' : 'text-gray-300'}`} />
                                </button>
                            </div>
                        </div>
                    </div>
                </div>

                {/* ABAS MODERNAS COM ÍCONES E TEMA OURO */}
                <div className="flex flex-wrap gap-8 border-b border-white/10 mb-8 px-2 justify-center md:justify-start">
                    {[
                        { id: 'capitulos', label: 'Tomo de Capítulos' },
                        { id: 'comentarios', label: 'Taverna (Comentários)' },
                        { id: 'informacoes', label: 'Informações' },
                        { id: 'avaliacoes', label: 'Avaliações' }
                    ].map(tab => (
                        <button key={tab.id} onClick={() => setDetailsTab(tab.id)} className={`pb-4 text-sm font-black uppercase tracking-wider transition-all relative flex items-center gap-2 ${detailsTab === tab.id ? 'text-white' : 'text-gray-600 hover:text-gray-400'}`}>
                            {/* Ícone de Estrela com tema Ouro adicionado */}
                            {tab.id === 'capitulos' && <Flame className="w-4 h-4 text-[#D4AF37]" />}
                            {tab.id === 'comentarios' && <Flame className="w-4 h-4 text-[#D4AF37]" />}
                            {tab.id === 'informacoes' && <Flame className="w-4 h-4 text-[#D4AF37]" />}
                            {tab.id === 'avaliacoes' && <Star className="w-4 h-4 text-[#FFD700] fill-[#FFD700]" />}
                            {tab.label}
                            {detailsTab === tab.id && <div className="absolute bottom-0 left-0 w-full h-[3px] rounded-t-full bg-gradient-to-r from-[#D4AF37] to-[#FFD700] shadow-[0_-2px_15px_rgba(212,175,55,1)]"></div>}
                        </button>
                    ))}
                </div>

                {/* CONTEÚDO DAS ABAS */}
                <div className="w-full pb-10">
                    
                    {/* ABA: CAPÍTULOS, REDESENHADA E COM TEMA OURO */}
                    {detailsTab === 'capitulos' && (
                        <div className="animate-in slide-in-from-bottom-4 duration-500 bg-white/5 border border-white/10 rounded-3xl p-6 md:p-8 backdrop-blur-sm">
                            
                            {/* CABEÇALHO DA LISTA DE CAPÍTULOS */}
                            <div className="flex items-center justify-between mb-8">
                                <div className="flex items-center gap-3">
                                    <Bookmark className="w-5 h-5 text-[#D4AF37] fill-[#D4AF37]" />
                                    <h2 className="text-xl font-bold text-white tracking-widest uppercase">Capítulos</h2>
                                </div>
                                <div className="flex items-center gap-4 text-xs font-bold text-gray-400 uppercase tracking-widest">
                                    <button onClick={() => setSortOrder(prev => prev === 'desc' ? 'asc' : 'desc')} className="flex items-center gap-2 hover:text-white transition-colors">
                                        Mais Recentes <ChevronDown className="w-4 h-4" />
                                    </button>
                                    <div className="w-px h-3 bg-white/10 mx-0.5"></div>
                                    <div className="w-10 h-10 rounded-xl bg-white/5 flex items-center justify-center hover:bg-white/10 transition-colors cursor-pointer border border-white/5">
                                        <ListFilter className="w-4 h-4 text-white" />
                                    </div>
                                </div>
                            </div>

                            {/* LISTA DE CAPÍTULOS ATUALIZADA */}
                            <div className="flex flex-col gap-3">
                                {chapters.length === 0 ? (
                                    <div className="text-center py-10 bg-black/40 rounded-2xl border border-white/5">
                                        <p className="text-gray-500 font-bold text-xs uppercase tracking-widest">Nenhum capítulo disponível.</p>
                                    </div>
                                ) : (
                                    sortedChapters.map((chapter, index) => {
                                        const isRead = mangaHistory.some(h => h.chapterNumber === chapter.number);
                                        
                                        return (
                                            <div key={chapter.id} className="group bg-black/40 border border-white/5 hover:border-white/10 rounded-2xl p-3 pr-6 flex items-center gap-4 transition-all relative overflow-hidden group">
                                                
                                                {/* Efeito Neon Roxo na Borda Esquerda MANTIDO */}
                                                <div className="absolute left-0 top-0 w-1 h-full bg-purple-500 shadow-[0_0_15px_rgba(168,85,247,0.8)] opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>

                                                <div 
                                                    className="flex-1 flex items-center gap-4 cursor-pointer"
                                                    onClick={() => onChapterClick(manga, chapter)}
                                                >
                                                    {/* Miniatura Escura */}
                                                    <div className="w-24 h-14 bg-black rounded-xl overflow-hidden flex-shrink-0 relative">
                                                        <img src={manga.coverUrl} className="w-full h-full object-cover opacity-50 group-hover:opacity-80 transition-opacity" alt="thumb" />
                                                        {isRead && <div className="absolute inset-0 flex items-center justify-center bg-black/40"><CheckCircle className="w-6 h-6 text-gray-400" /></div>}
                                                    </div>
                                                    
                                                    <div className="flex items-center gap-3">
                                                        <Bookmark className="w-4 h-4 text-[#D4AF37]" />
                                                        <span className={`font-medium text-sm transition-colors ${isRead ? 'text-gray-600' : 'text-gray-200'} group-hover:text-fuchsia-300`}>Capítulo {chapter.number}</span>
                                                        {index === 0 && sortOrder === 'desc' && (
                                                            <span className="bg-fuchsia-600 text-white text-[8px] font-black px-2 py-1 rounded-md uppercase tracking-wider shadow-[0_0_10px_rgba(217,70,239,0.5)]">Novo</span>
                                                        )}
                                                    </div>
                                                </div>

                                                {/* Data e Botão de Salvar Capítulo individual */}
                                                <div className="flex items-center gap-4 pl-2 pr-4">
                                                    <span className="text-[10px] text-gray-500 font-bold uppercase tracking-wider hidden sm:block">{timeAgo(chapter.rawTime || Date.now())}</span>
                                                    <button className="text-gray-600 hover:text-purple-500 transition-colors">
                                                        <Bookmark className="w-5 h-5 transition-colors group-hover:text-purple-400" />
                                                    </button>
                                                </div>
                                            </div>
                                        );
                                    })
                                )}
                            </div>

                            <button className="w-full mt-8 py-4 text-center text-fuchsia-400 text-xs font-bold uppercase tracking-[0.2em] hover:text-white transition-colors flex items-center justify-center gap-2">
                                Ver todos os capítulos <ChevronDown className="w-4 h-4" />
                            </button>
                        </div>
                    )}

                    {/* CONTEÚDO DAS OUTRAS ABAS (MANTIDO) */}
                    {detailsTab === 'comentarios' && (
                        <div className="animate-in fade-in duration-500 bg-white/5 border border-white/10 rounded-3xl p-6 md:p-8 backdrop-blur-sm">
                            <CommentsSection mangaId={manga.id} user={user} userProfileData={userProfileData} onRequireLogin={onRequireLogin} showToast={showToast} />
                        </div>
                    )}
                    
                    {detailsTab === 'informacoes' && (
                        <div className="animate-in fade-in duration-500 bg-white/5 border border-white/10 rounded-3xl p-8 backdrop-blur-sm">
                            <h3 className="text-purple-400 font-bold uppercase text-xs mb-4 tracking-widest">Sinopse da Obra</h3>
                            <p className="text-gray-400 leading-relaxed text-justify">{manga.synopsis || "Sem sinopse disponível."}</p>
                        </div>
                    )}

                    {detailsTab === 'avaliacoes' && (
                        <div className="animate-in fade-in duration-500 text-center py-16 bg-white/5 border border-white/10 rounded-3xl backdrop-blur-sm">
                            <Star className="w-10 h-10 text-gray-700 mx-auto mb-4" />
                            <span className="text-gray-500 text-sm font-bold uppercase tracking-widest">Nenhuma avaliação ainda</span>
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
