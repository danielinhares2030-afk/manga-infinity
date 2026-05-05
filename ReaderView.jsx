import React, { useState, useEffect, useRef } from 'react';
import { ChevronLeft, ChevronRight, Star, ZoomIn, ZoomOut } from 'lucide-react';
import { ChapterTransitionOverlay } from './UIComponents';

export default function ReaderView({ manga, chapter, user, userProfileData, onBack, onChapterClick, triggerRandomDrop, onMarkAsRead, readMode, onRequireLogin, showToast, libraryData, onToggleLibrary }) {
    const [showUI, setShowUI] = useState(true);
    const [zoom, setZoom] = useState(1);
    const [isChapterFading, setIsChapterFading] = useState(false); 
    const [isTransitioning, setIsTransitioning] = useState(false);
    const [nextChapNum, setNextChapNum] = useState(null);
    const readingTimeRef = useRef(0);
    const [currentPage, setCurrentPage] = useState(0);

    // CORREÇÃO 1: Reseta a página instantaneamente ANTES do render (Estado Derivado)
    // Isso impede o crash de tentar ler uma página que não existe no novo capítulo
    const [prevChapId, setPrevChapId] = useState(chapter?.id);
    if (chapter?.id && chapter.id !== prevChapId) {
        setPrevChapId(chapter.id);
        setCurrentPage(0);
        setZoom(1);
        setIsChapterFading(true);
    }

    useEffect(() => {
        window.scrollTo(0, 0);
        const fadeTimer = setTimeout(() => {
            setIsChapterFading(false);
        }, 250); 

        return () => clearTimeout(fadeTimer);
    }, [chapter?.id]);

    useEffect(() => {
        readingTimeRef.current = 0;
        const timer = setInterval(() => { readingTimeRef.current += 1; }, 1000);
        return () => {
            clearInterval(timer);
            if (manga && chapter) {
                onMarkAsRead(manga, chapter, readingTimeRef.current >= 45);
            }
        };
    }, [manga?.id, chapter?.id]); 

    // CORREÇÃO 2: Early return para evitar crash caso os dados sumam no meio da transição
    if (!manga || !chapter) return null;

    const currentIndex = manga.chapters?.findIndex(c => c && c.id === chapter.id) ?? -1;
    const nextChapter = currentIndex > 0 ? manga.chapters[currentIndex - 1] : null; 
    const prevChapter = currentIndex !== -1 && currentIndex < manga.chapters.length - 1 ? manga.chapters[currentIndex + 1] : null;

    const mockPages = Array(15).fill('').map((_, i) => `https://placehold.co/800x1200/020202/f59e0b?text=Página+${i + 1}`);
    
    const pages = chapter?.pages?.length > 0 ? chapter.pages : mockPages;
    const getPageUrl = (p) => {
        if (!p) return mockPages[0];
        if (typeof p === 'string') return p;
        return p.url || p.src || mockPages[0];
    };

    // CORREÇÃO 3: Trava de segurança para garantir que a array nunca acesse um index inválido
    const safeCurrentPage = Math.min(currentPage, Math.max(0, pages.length - 1));

    const handleScroll = () => {
        if (!isChapterFading && Math.random() < 0.005) triggerRandomDrop();
    };

    const handleZoom = (e) => {
        e.stopPropagation();
        setZoom(prev => prev === 1 ? 0.5 : prev === 0.5 ? 0.75 : 1);
    };

    const handleChapterChange = (targetChapter) => {
        if (!targetChapter) return;
        setNextChapNum(targetChapter.number);
        setIsTransitioning(true);
        setTimeout(() => {
            onChapterClick(manga, targetChapter);
            setIsTransitioning(false);
        }, 800);
    };

    // Previne crash caso a libraryData venha como null no primeiro milissegundo
    const isFavorite = libraryData?.[manga.id] === 'Favoritos';

    return (
        <div className="min-h-screen bg-[#020202] text-white relative flex flex-col overflow-x-hidden select-none" onScroll={handleScroll}>
            
            <ChapterTransitionOverlay isVisible={isTransitioning} chapterNumber={nextChapNum} />

            {showUI && (
              <div className="fixed top-0 left-0 right-0 h-16 bg-[#020202]/95 backdrop-blur-2xl z-50 flex justify-between items-center px-4 border-b border-amber-900/20 shadow-[0_4px_20px_rgba(0,0,0,0.8)] transition-opacity animate-in slide-in-from-top-full">
                 <div className="flex items-center gap-3 overflow-hidden">
                    <button onClick={onBack} className="p-2 hover:text-amber-500 transition-colors flex-shrink-0"><ChevronLeft className="w-6 h-6"/></button>
                    <div className="flex flex-col overflow-hidden" onClick={e => e.stopPropagation()}>
                       <span className="text-[11px] text-gray-400 font-bold truncate select-text cursor-text tracking-wide uppercase">{manga.title}</span>
                       <span className="text-xs font-black text-amber-500 truncate uppercase tracking-widest">Capítulo {chapter.number}</span>
                    </div>
                 </div>
                 <div className="flex items-center gap-2 flex-shrink-0">
                    <button onClick={() => onToggleLibrary(manga.id, isFavorite ? 'Remover' : 'Favoritos')} className="p-2 hover:text-yellow-400 transition-colors">
                       <Star className={`w-5 h-5 ${isFavorite ? 'fill-current text-yellow-500' : 'text-gray-600'}`}/>
                    </button>
                    <button onClick={handleZoom} className="p-2 text-amber-500 hover:text-white transition-colors flex items-center gap-1">
                       {zoom < 1 ? <ZoomOut className="w-5 h-5"/> : <ZoomIn className="w-5 h-5"/>}
                       <span className="text-[10px] font-black w-8">{zoom * 100}%</span>
                    </button>
                 </div>
              </div>
            )}

            <div className={`flex-1 w-full mx-auto cursor-pointer overflow-x-auto origin-center transition-opacity duration-300 ease-in-out ${isChapterFading ? 'opacity-0' : 'opacity-100'}`} onClick={() => setShowUI(!showUI)}>
              {readMode === 'Páginas' ? (
                 <div className="w-full h-screen flex flex-col items-center justify-center pt-16 pb-20 px-2 relative overflow-hidden">
                    <img src={getPageUrl(pages[safeCurrentPage])} className="max-h-full object-contain shadow-2xl transition-transform duration-300 rounded-sm" style={{ width: `${zoom * 100}%` }} />
                    
                    <div className="absolute inset-y-16 left-0 w-1/3 z-10 cursor-pointer" onClick={(e) => { e.stopPropagation(); setCurrentPage(p => Math.max(0, p - 1)); }}></div>
                    <div className="absolute inset-y-16 right-0 w-1/3 z-10 cursor-pointer" onClick={(e) => { e.stopPropagation(); setCurrentPage(p => Math.min(pages.length - 1, p + 1)); }}></div>
                    
                    {showUI && <div className="absolute bottom-24 bg-black/90 px-5 py-2 rounded-full text-[10px] font-black shadow-lg pointer-events-none animate-in fade-in border border-amber-900/20 tracking-[0.2em]">{safeCurrentPage + 1} / {pages.length}</div>}
                 </div>
              ) : (
                 <div className="flex flex-col items-center pt-16 pb-20 transition-all duration-300 mx-auto" style={{ width: `${zoom * 100}%` }}>
                    {pages.map((p, i) => (
                       <img key={i} src={getPageUrl(p)} className="w-full object-contain block" loading="lazy" />
                    ))}
                 </div>
              )}
            </div>

            {showUI && (
              <div className="fixed bottom-0 left-0 right-0 bg-[#020202]/95 backdrop-blur-2xl z-50 p-4 border-t border-amber-900/20 shadow-[0_-4px_20px_rgba(0,0,0,0.8)] flex justify-between items-center transition-opacity animate-in slide-in-from-bottom-full">
                 <button 
                    onClick={() => handleChapterChange(prevChapter)} 
                    disabled={!prevChapter} 
                    className="bg-black disabled:opacity-30 disabled:hover:border-amber-900/10 border border-amber-900/20 hover:border-amber-600/40 px-4 py-3 rounded-xl font-black text-[10px] uppercase flex items-center gap-1.5 transition-colors tracking-widest"
                 >
                    <ChevronLeft className="w-4 h-4"/> Anterior
                 </button>
                 
                 {readMode === 'Páginas' && (
                     <div className="flex items-center gap-2" onClick={e => e.stopPropagation()}>
                         <input type="range" min="0" max={Math.max(0, pages.length - 1)} value={safeCurrentPage} onChange={(e) => setCurrentPage(parseInt(e.target.value))} className="w-24 md:w-32 accent-amber-500"/>
                     </div>
                 )}

                 <button 
                    onClick={() => handleChapterChange(nextChapter)} 
                    disabled={!nextChapter} 
                    className="bg-gradient-to-r from-amber-700 to-amber-500 disabled:from-gray-900 disabled:to-gray-900 disabled:opacity-30 disabled:text-gray-500 border border-transparent text-black px-4 py-3 rounded-xl font-black text-[10px] uppercase flex items-center gap-1.5 hover:scale-105 transition-transform shadow-[0_0_15px_rgba(245,158,11,0.2)] tracking-widest"
                 >
                    Próximo <ChevronRight className="w-4 h-4"/>
                 </button>
              </div>
            )}
        </div>
    );
}
