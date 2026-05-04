import React, { useState } from 'react';
import { ChevronLeft, MoreHorizontal, Star, ChevronDown, Bookmark, Heart, Share2, AlertCircle, ChevronUp } from 'lucide-react';
import { timeAgo } from './helpers';
import { doc, setDoc, deleteDoc } from 'firebase/firestore';
import { APP_ID } from './constants';

export default function DetailsView({ manga, libraryData, historyData, user, onBack, onChapterClick, onRequireLogin, showToast, db }) {
  const [activeTab, setActiveTab] = useState('Capítulos');
  const [sortOrder, setSortOrder] = useState('desc');
  const [isSynopsisExpanded, setIsSynopsisExpanded] = useState(false);

  if (!manga) return null;

  const chapters = manga.chapters || [];
  const sortedChapters = [...chapters].sort((a, b) => {
    return sortOrder === 'desc' ? b.number - a.number : a.number - b.number;
  });

  const isFavorite = libraryData[manga.id] === 'Favoritos' || libraryData[manga.id] === 'Lendo';

  const handleToggleLibrary = async () => {
    if (!user) return onRequireLogin();
    try {
      const ref = doc(db, 'artifacts', APP_ID, 'users', user.uid, 'library', manga.id.toString());
      if (isFavorite) {
        await deleteDoc(ref);
        showToast("Removido da biblioteca", "info");
      } else {
        await setDoc(ref, { mangaId: manga.id, status: 'Lendo', updatedAt: Date.now() });
        showToast("Adicionado à biblioteca", "success");
      }
    } catch (e) {
      showToast("Erro ao atualizar biblioteca", "error");
    }
  };

  return (
    <div className="min-h-screen bg-black text-white font-sans animate-in fade-in duration-300 pb-20">
      
      {/* HEADER FIXO */}
      <div className="sticky top-0 z-50 bg-black/90 backdrop-blur-md px-4 py-4 flex items-center justify-between">
        <button onClick={onBack} className="p-2 hover:bg-white/10 rounded-full transition-colors">
          <ChevronLeft className="w-6 h-6 text-white" />
        </button>
        <button className="p-2 hover:bg-white/10 rounded-full transition-colors">
          <MoreHorizontal className="w-6 h-6 text-white" />
        </button>
      </div>

      <div className="px-4">
        {/* TOPO: CAPA E INFORMAÇÕES */}
        <div className="flex gap-4 mb-6">
          <div className="w-28 sm:w-36 flex-shrink-0 relative">
            <div className="aspect-[2/3] rounded-xl overflow-hidden shadow-[0_4px_20px_rgba(0,0,0,0.5)] bg-[#111]">
              <img src={manga.coverUrl} alt={manga.title} className="w-full h-full object-cover" onError={(e) => e.target.src = 'https://placehold.co/300x450/111/444?text=Capa'} />
            </div>
          </div>
          
          <div className="flex flex-col justify-start py-1">
            <h1 className="text-xl sm:text-2xl font-bold leading-tight mb-1 line-clamp-2">{manga.title}</h1>
            <p className="text-gray-400 text-xs mb-3 truncate">{manga.author || 'Autor Desconhecido'}</p>
            
            <div className="flex flex-wrap gap-2 mb-4">
              {manga.genres?.slice(0, 3).map(g => (
                <span key={g} className="px-2 py-0.5 rounded text-[10px] text-gray-300 border border-gray-600 bg-transparent">
                  {g}
                </span>
              ))}
              <span className="px-2 py-0.5 rounded text-[10px] text-white bg-red-600 font-medium">
                {manga.status || 'Em andamento'}
              </span>
            </div>
          </div>
        </div>

        {/* SEÇÃO DE AVALIAÇÃO (VISUAL SIMULADO DA IMAGEM) */}
        <div className="flex items-center gap-6 mb-6 px-2">
          <div className="flex flex-col items-center">
            <div className="flex items-center gap-2">
              <Star className="w-6 h-6 text-yellow-500 fill-yellow-500" />
              <span className="text-3xl font-bold">{manga.rating ? Number(manga.rating).toFixed(1) : "4.9"}</span>
            </div>
            <span className="text-[10px] text-gray-400 mt-1">12.8K avaliações</span>
          </div>
          
          <div className="flex-1 flex flex-col gap-1">
            {[5, 4, 3, 2, 1].map((star, idx) => {
              const widths = ['80%', '15%', '3%', '1%', '1%'];
              const counts = ['10.5K', '1.6K', '420', '180', '120'];
              return (
                <div key={star} className="flex items-center gap-2 text-[8px] text-gray-400">
                  <span className="w-2">{star}</span>
                  <Star className="w-2 h-2 text-yellow-500 fill-yellow-500" />
                  <div className="flex-1 h-1 bg-gray-800 rounded-full overflow-hidden">
                    <div className="h-full bg-yellow-500 rounded-full" style={{ width: widths[idx] }}></div>
                  </div>
                  <span className="w-6 text-right">{counts[idx]}</span>
                </div>
              );
            })}
          </div>
        </div>

        {/* SINOPSE */}
        <div className="mb-6 relative">
          <p className={`text-sm text-gray-300 leading-relaxed ${!isSynopsisExpanded ? 'line-clamp-2' : ''}`}>
            {manga.synopsis || "Nenhuma sinopse disponível."}
          </p>
          <button 
            onClick={() => setIsSynopsisExpanded(!isSynopsisExpanded)} 
            className="w-full flex justify-center py-2 text-gray-500 hover:text-white transition-colors"
          >
            {isSynopsisExpanded ? <ChevronUp className="w-5 h-5" /> : <ChevronDown className="w-5 h-5" />}
          </button>
        </div>

        {/* ABAS */}
        <div className="flex border-b border-gray-800 mb-6">
          {['Sobre', 'Capítulos', 'Comentários'].map((tab) => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`flex-1 pb-3 text-sm font-medium transition-all relative ${
                activeTab === tab ? 'text-white' : 'text-gray-500 hover:text-gray-300'
              }`}
            >
              <div className="flex items-center justify-center gap-1">
                {tab}
                {tab === 'Comentários' && <span className="bg-red-600 text-white text-[8px] px-1.5 py-0.5 rounded-sm ml-1">999+</span>}
              </div>
              {activeTab === tab && (
                <div className="absolute bottom-0 left-0 w-full h-0.5 bg-red-600"></div>
              )}
            </button>
          ))}
        </div>

        {/* CONTEÚDO DAS ABAS */}
        {activeTab === 'Capítulos' && (
          <div>
            <div className="flex items-center justify-between mb-4 px-1">
              <h3 className="text-sm font-bold text-white">
                Capítulos <span className="text-red-500 ml-1">{chapters.length}</span>
              </h3>
              <button 
                onClick={() => setSortOrder(prev => prev === 'desc' ? 'asc' : 'desc')} 
                className="text-xs text-gray-400 flex items-center gap-1 hover:text-white transition-colors"
              >
                {sortOrder === 'desc' ? 'Mais recentes' : 'Mais antigos'} <ChevronDown className="w-4 h-4" />
              </button>
            </div>

            <div className="flex flex-col gap-2.5">
              {sortedChapters.map((cap, index) => {
                const readId = `${manga.id}_${cap.id}`;
                const isRead = historyData.some(h => h.id === readId);
                const isNew = index === 0 && sortOrder === 'desc'; // Simulando tag de novo no primeiro item

                return (
                  <div 
                    key={cap.id} 
                    onClick={() => onChapterClick(manga, cap)}
                    className="bg-[#111111] rounded-xl p-4 flex items-center justify-between cursor-pointer hover:bg-[#1a1a1a] transition-colors group"
                  >
                    <div className="flex items-start gap-3">
                      {/* Ponto vermelho para novo */}
                      <div className={`mt-2 w-1.5 h-1.5 rounded-full flex-shrink-0 ${isNew ? 'bg-red-500' : 'bg-transparent'}`}></div>
                      
                      <div>
                        <div className="flex items-center gap-2 mb-1">
                          <h4 className={`text-sm font-bold ${isRead ? 'text-gray-500' : 'text-white'}`}>
                            Capítulo {cap.number}
                          </h4>
                          {isNew && <span className="bg-red-600 text-white text-[8px] font-bold px-1.5 py-0.5 rounded-sm uppercase tracking-wider">Novo</span>}
                        </div>
                        
                        {cap.title && (
                          <p className="text-xs text-gray-300 mb-1 line-clamp-1">{cap.title}</p>
                        )}
                        <p className="text-[10px] text-gray-500">
                          {isNew ? 'Hoje' : timeAgo(cap.rawTime || Date.now())}
                        </p>
                      </div>
                    </div>

                    <button className="p-2 text-gray-500 hover:text-white opacity-50 group-hover:opacity-100 transition-all">
                      <Bookmark className="w-5 h-5" />
                    </button>
                  </div>
                );
              })}
            </div>

            {chapters.length > 0 && (
              <button className="w-full mt-4 py-3 text-xs text-gray-400 font-medium flex items-center justify-center gap-2 hover:text-white transition-colors">
                Ver mais capítulos <ChevronDown className="w-4 h-4" />
              </button>
            )}
            
            {chapters.length === 0 && (
              <div className="text-center py-12 bg-[#111] rounded-xl">
                <AlertCircle className="w-8 h-8 text-gray-600 mx-auto mb-2" />
                <p className="text-sm text-gray-500">Nenhum capítulo disponível.</p>
              </div>
            )}
          </div>
        )}

        {activeTab === 'Sobre' && (
           <div className="text-gray-400 text-sm py-4">Informações detalhadas sobre a obra ficarão aqui.</div>
        )}
        
        {activeTab === 'Comentários' && (
           <div className="text-gray-400 text-sm py-4 text-center">Área de discussão da comunidade.</div>
        )}

      </div>
    </div>
  );
}
