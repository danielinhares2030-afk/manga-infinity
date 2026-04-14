import React, { useState, useEffect } from 'react';
import {
  ArrowLeft,
  Star,
  Play,
  Library,
  Share2,
  BookOpen,
  CheckCircle,
  Clock,
  Sparkles,
  ChevronDown
} from 'lucide-react';
import { doc, updateDoc, setDoc, deleteDoc } from "firebase/firestore";
import { APP_ID } from './constants';
import { CommentsSection } from './CommentsSection';
import { timeAgo } from './helpers';
import { ChapterTransitionOverlay } from './UIComponents';

export default function DetailsView({
  manga,
  libraryData,
  historyData,
  user,
  userProfileData,
  onBack,
  onChapterClick,
  onRequireLogin,
  showToast,
  db
}) {
  const [isSharing, setIsSharing] = useState(false);
  const [localRating, setLocalRating] = useState(Number(manga?.rating) || 5.0);
  const [detailsTab, setDetailsTab] = useState('capitulos');
  const [showLibraryMenu, setShowLibraryMenu] = useState(false);

  const libraryStatuses = [
    'Lendo',
    'Concluído',
    'Pausado',
    'Dropado',
    'Planejo Ler'
  ];

  useEffect(() => {
    setLocalRating(Number(manga?.rating) || 5.0);
  }, [manga?.rating]);

  const handleRate = async (ratingValue) => {
    if (!user)
      return showToast(
        "Apenas leitores registrados podem avaliar.",
        "warning"
      );

    try {
      const newRating = ((localRating + ratingValue) / 2).toFixed(1);
      const finalRating = Number(newRating);

      setLocalRating(finalRating);

      showToast(
        `Avaliação de ${ratingValue} estrelas registrada.`,
        "success"
      );

      const mangaRef = doc(db, 'obras', manga.id);

      await updateDoc(mangaRef, {
        rating: finalRating
      });

      if (manga) manga.rating = finalRating;
    } catch (error) {
      setLocalRating(Number(manga?.rating) || 5.0);

      showToast(
        "Erro de sincronização. Tente novamente.",
        "error"
      );
    }
  };

  if (!manga) return null;

  const inLibrary = libraryData && libraryData[manga.id];

  const updateLibraryStatus = async (status) => {
    if (!user) {
      onRequireLogin();
      return;
    }

    try {
      const ref = doc(
        db,
        'artifacts',
        APP_ID,
        'users',
        user.uid,
        'library',
        manga.id.toString()
      );

      if (status === 'Remover') {
        await deleteDoc(ref);
        showToast("Removido da Biblioteca.", "info");
      } else {
        await setDoc(ref, {
          mangaId: manga.id,
          status,
          updatedAt: Date.now()
        });

        showToast(`Salvo como: ${status}`, "success");
      }

      setShowLibraryMenu(false);
    } catch (error) {
      showToast("Erro ao atualizar biblioteca.", "error");
    }
  };

  const handleShare = () => {
    setIsSharing(true);

    navigator.clipboard.writeText(window.location.href);

    showToast(
      "Link copiado para a área de transferência!",
      "success"
    );

    setTimeout(() => setIsSharing(false), 2000);
  };

  const mangaHistory = (historyData || []).filter(
    h => h.mangaId === manga.id
  );

  const lastRead =
    mangaHistory.length > 0 ? mangaHistory[0] : null;

  const chapters = manga.chapters || [];

  const firstChapter =
    chapters.length > 0
      ? chapters[chapters.length - 1]
      : null;

  const nextChapterToRead = lastRead
    ? chapters.find(
        c =>
          Number(c.number) ===
            Number(lastRead.chapterNumber) + 1 ||
          c.id === lastRead.id
      )
    : firstChapter;

  return (
    <div className="min-h-screen bg-[#08080a] text-gray-200 font-sans pb-24 animate-in fade-in duration-700 relative overflow-hidden">
      <div className="absolute top-0 left-1/4 w-[400px] h-[400px] bg-cyan-600/10 rounded-full blur-[100px] pointer-events-none mix-blend-screen animate-[pulse_6s_ease-in-out_infinite]"></div>

      <div className="absolute top-1/3 right-1/4 w-[300px] h-[300px] bg-red-600/10 rounded-full blur-[100px] pointer-events-none mix-blend-screen animate-[pulse_8s_ease-in-out_infinite_reverse]"></div>

      <div className="relative h-64 md:h-80 w-full overflow-hidden border-b border-white/5">
        <div className="absolute inset-0 bg-[#08080a]">
          <img
            src={manga.coverUrl}
            className="w-full h-full object-cover opacity-30 blur-xl scale-110"
            alt="Capa de Fundo"
          />
        </div>

        <div className="absolute inset-0 bg-gradient-to-t from-[#08080a] via-[#08080a]/80 to-transparent" />
        <div className="absolute inset-0 bg-gradient-to-b from-black/60 via-transparent to-transparent" />

        <button
          onClick={onBack}
          className="absolute top-4 md:top-6 left-4 md:left-6 z-10 p-3 bg-white/5 backdrop-blur-md rounded-full border border-white/10 hover:bg-white/10 transition-colors shadow-lg"
        >
          <ArrowLeft className="w-5 h-5 text-gray-300" />
        </button>
      </div>

      <div className="max-w-5xl mx-auto px-4 sm:px-6 relative -mt-32 md:-mt-40 z-10">
        <div className="flex flex-col md:flex-row gap-8 items-center md:items-start">
          <div className="w-44 md:w-56 flex-shrink-0 relative group animate-[levitar_6s_ease-in-out_infinite]">
            <style>{`
              @keyframes levitar {
                0%, 100% { transform: translateY(0); }
                50% { transform: translateY(-8px); }
              }
            `}</style>

            <div className="aspect-[2/3] relative rounded-2xl overflow-hidden shadow-[0_20px_50px_rgba(0,0,0,0.8)] border border-white/10 z-10">
              <img
                src={manga.coverUrl}
                alt={manga.title}
                className="w-full h-full object-cover"
              />
            </div>
          </div>

          <div className="flex-1 text-center md:text-left mt-2 md:mt-12 relative z-10">
            <h1 className="text-3xl md:text-5xl font-black text-white leading-tight tracking-tight mb-2">
              {manga.title || 'Sem Título'}
            </h1>

            <p className="text-xs text-cyan-400 font-black uppercase tracking-[0.3em] mb-6">
              {manga.author || 'Autor Desconhecido'}
            </p>
          </div>
        </div>
      </div>

      <ChapterTransitionOverlay
        isVisible={false}
        chapterNumber={null}
      />
    </div>
  );
}
