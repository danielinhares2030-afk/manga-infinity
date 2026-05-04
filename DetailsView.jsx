import React, { useState, useEffect } from 'react';
import { ChevronLeft, MoreHorizontal, Star, ChevronDown, Bookmark, AlertCircle, ChevronUp, Send, User as UserIcon } from 'lucide-react';
import { timeAgo, cleanCosmeticUrl } from './helpers';
import { doc, setDoc, deleteDoc, collection, addDoc, query, orderBy, onSnapshot, getDoc } from 'firebase/firestore';
import { APP_ID } from './constants';

export default function DetailsView({ manga, libraryData, historyData, user, onBack, onChapterClick, onRequireLogin, showToast, db }) {
  const [activeTab, setActiveTab] = useState('Capítulos');
  const [sortOrder, setSortOrder] = useState('desc');
  const [isSynopsisExpanded, setIsSynopsisExpanded] = useState(false);
  
  // Estados para Avaliação e Comentários
  const [myRating, setMyRating] = useState(0);
  const [commentText, setCommentText] = useState('');
  const [commentsList, setCommentsList] = useState([]);

  // Verifica se está salvo na biblioteca
  const isFavorite = libraryData[manga?.id] === 'Favoritos' || libraryData[manga?.id] === 'Lendo';

  // Buscar comentários em tempo real
  useEffect(() => {
    if (!manga) return;
    const q = query(collection(db, 'obras', manga.id, 'comments'), orderBy('createdAt', 'desc'));
    const unsub = onSnapshot(q, (snap) => {
        const list = [];
        snap.forEach(d => list.push({ id: d.id, ...d.data() }));
        setCommentsList(list);
    });
    return () => unsub();
  }, [manga, db]);

  // Buscar avaliação do usuário
  useEffect(() => {
    if (!user || !manga) return;
    getDoc(doc(db, 'obras', manga.id, 'ratings', user.uid)).then(snap => {
        if (snap.exists()) setMyRating(snap.data().rating);
    });
  }, [user, manga, db]);

  if (!manga) return null;

  const chapters = manga.chapters || [];
  const sortedChapters = [...chapters].sort((a, b) => {
    return sortOrder === 'desc' ? b.number - a.number : a.number - b.number;
  });

  // Função para Salvar/Favoritar
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

  // Função para Avaliar
  const handleRate = async (star) => {
      if (!user) return onRequireLogin();
      setMyRating(star);
      try {
          await setDoc(doc(db, 'obras', manga.id, 'ratings', user.uid), {
              rating: star,
              timestamp: Date.now()
          });
          showToast("Sua avaliação foi salva!", "success");
      } catch(e) {
          showToast("Erro ao avaliar", "error");
      }
  };

  // Função para Enviar Comentário
  const handleAddComment = async (e) => {
      e.preventDefault();
      if (!user) return onRequireLogin();
      if (!commentText.trim()) return;
      
      try {
          await addDoc(collection(db, 'obras', manga.id, 'comments'), {
              userId: user.uid,
              userName: user.displayName || 'Leitor',
              userAvatar: user.photoURL || '',
              text: commentText.trim(),
              createdAt: Date.now()
          });
          setCommentText('');
          showToast("Comentário enviado!", "success");
      } catch(e) {
          showToast("Erro ao enviar comentário", "error");
      }
  };

  const totalReviews = manga.reviewsCount || 0;

  return (
    <div className="min-h-screen bg-black text-white font-sans animate-in fade-in duration-300 pb-20">
      
      {/* HEADER FIXO */}
      <div className="sticky top-0 z-50 bg-black/90 backdrop-blur-md px-4 py-4 flex items-center justify-between border-b border-white/5">
        <button onClick={onBack} className="p-2 hover:bg-white/10 rounded-full transition-colors">
          <ChevronLeft className="w-6 h-6 text-white" />
        </button>
        <button className="p-2 hover:bg-white/10 rounded-full transition-colors">
          <MoreHorizontal className="w-6 h-6 text-white" />
        </button>
      </div>

      <div className="px-4 mt-6">
        {/* TOPO: CAPA E INFORMAÇÕES */}
        <div className="flex gap-4 mb-6">
          <div className="w-28 sm:w-36 flex-shrink-0 relative">
            <div className="aspect-[2/3] rounded-xl overflow-hidden shadow-[0_4px_20px_rgba(220,38,38,0.2)] bg-[#111] border border-white/5">
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
              <span className="px-2 py-0.5 rounded text-[10px] text-white bg-red-600 font-medium shadow-[0_0_10px_rgba(220,38,38,0.4)]">
                {manga.status || 'Em andamento'}
              </span>
            </div>
          </div>
        </div>

        {/* BARRA DE AÇÕES: SALVAR E AVALIAR */}
        <div className="flex items-center justify-around bg-[#0a0a0a] p-4 rounded-2xl mb-6 border border-white/5 shadow-lg">
            <button onClick={handleToggleLibrary} className={`flex flex-col items-center gap-1.5 transition-colors ${isFavorite ? 'text-red-500' : 'text-gray-400 hover:text-white'}`}>
                <Bookmark className={`w-6 h-6 ${isFavorite ? 'fill-current drop-shadow-[0_0_8px_rgba(220,38,38,0.8)]' : ''}`} />
                <span className="text-[10px] font-bold uppercase tracking-widest">{isFavorite ? 'Salvo' : 'Salvar Obra'}</span>
            </button>
            
            <div className="h-10 w-[1px] bg-gray-800"></div>
            
            <div className="flex flex-col items-center gap-1.5">
                <span className="text-[10px] text-gray-400 font-bold uppercase tracking-widest">Sua Avaliação</span>
                <div className="flex gap-1">
                    {[1, 2, 3, 4, 5].map(star => (
                        <Star 
                            key={star} 
                            onClick={() => handleRate(star)} 
                            className={`w-6 h-6 cursor-pointer transition-all hover:scale-110 ${myRating >= star ? 'text-yellow-500 fill-yellow-500 drop-shadow-[0_0_8px_rgba(234,179,8,0.6)]' : 'text-gray-700 hover:text-yellow-500/50'}`} 
                        />
                    ))}
                </div>
            </div>
        </div>

        {/* ESTATÍSTICAS GERAIS DE AVALIAÇÃO */}
        <div className="flex items-center gap-6 mb-6 px-2">
          <div className="flex flex-col items-center">
            <div className="flex items-center gap-2">
              <Star className="w-6 h-6 text-yellow-500 fill-yellow-500" />
              <span className="text-3xl font-bold">{manga.rating ? Number(manga.rating).toFixed(1) : "0.0"}</span>
            </div>
            <span className="text-[10px] text-gray-400 mt-1">{totalReviews} avaliações</span>
          </div>
          
          <div className="flex-1 flex flex-col gap-1">
            {[5, 4, 3, 2, 1].map((star) => {
              const dist = manga.ratingDistribution || {};
              const count = dist[star] || 0;
              const percent = totalReviews > 0 ? (count / totalReviews) * 100 : 0;
              
              return (
                <div key={star} className="flex items-center gap-2 text-[8px] text-gray-400">
                  <span className="w-2">{star}</span>
                  <Star className="w-2 h-2 text-yellow-500 fill-yellow-500" />
                  <div className="flex-1 h-1 bg-gray-900 rounded-full overflow-hidden">
                    <div className="h-full bg-yellow-500 rounded-full transition-all duration-1000" style={{ width: `${percent}%` }}></div>
                  </div>
                  <span className="w-6 text-right">{count}</span>
                </div>
              );
            })}
          </div>
        </div>

        {/* SINOPSE */}
        <div className="mb-6 relative">
          <p className={`text-sm text-gray-300 leading-relaxed ${!isSynopsisExpanded ? 'line-clamp-2' : ''}`}>
            {manga.synopsis || "Nenhuma sinopse disponível para esta obra."}
          </p>
          <button 
            onClick={() => setIsSynopsisExpanded(!isSynopsisExpanded)} 
            className="w-full flex justify-center py-2 text-gray-500 hover:text-white transition-colors"
          >
            {isSynopsisExpanded ? <ChevronUp className="w-5 h-5" /> : <ChevronDown className="w-5 h-5" />}
          </button>
        </div>

        {/* ABAS (SOMENTE CAPÍTULOS E COMENTÁRIOS) */}
        <div className="flex border-b border-gray-800 mb-6">
          {['Capítulos', 'Comentários'].map((tab) => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`flex-1 pb-3 text-sm font-bold uppercase tracking-widest transition-all relative ${
                activeTab === tab ? 'text-white' : 'text-gray-600 hover:text-gray-400'
              }`}
            >
              <div className="flex items-center justify-center gap-1.5">
                {tab}
                {tab === 'Comentários' && commentsList.length > 0 && (
                  <span className="bg-red-600 text-white text-[8px] px-1.5 py-0.5 rounded-sm ml-1">
                    {commentsList.length > 99 ? '99+' : commentsList.length}
                  </span>
                )}
              </div>
              {activeTab === tab && (
                <div className="absolute bottom-0 left-0 w-full h-0.5 bg-red-600 shadow-[0_0_10px_rgba(220,38,38,0.8)]"></div>
              )}
            </button>
          ))}
        </div>

        {/* CONTEÚDO: CAPÍTULOS */}
        {activeTab === 'Capítulos' && (
          <div className="animate-in fade-in">
            <div className="flex items-center justify-between mb-4 px-1">
              <h3 className="text-sm font-bold text-white">
                Total <span className="text-red-500 ml-1">{chapters.length}</span>
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
                const isNew = index === 0 && sortOrder === 'desc' && (Date.now() - (cap.rawTime || cap.timestamp || 0)) < 3 * 24 * 60 * 60 * 1000;

                return (
                  <div 
                    key={cap.id} 
                    onClick={() => onChapterClick(manga, cap)}
                    className="bg-[#0a0a0a] border border-white/5 rounded-xl p-4 flex items-center justify-between cursor-pointer hover:border-red-500/30 transition-all group"
                  >
                    <div className="flex items-start gap-3">
                      <div className={`mt-2 w-1.5 h-1.5 rounded-full flex-shrink-0 ${isNew ? 'bg-red-500 shadow-[0_0_8px_rgba(220,38,38,0.8)]' : 'bg-transparent'}`}></div>
                      
                      <div>
                        <div className="flex items-center gap-2 mb-1">
                          <h4 className={`text-sm font-bold ${isRead ? 'text-gray-600' : 'text-gray-200'}`}>
                            Capítulo {cap.number}
                          </h4>
                          {isNew && <span className="bg-red-600 text-white text-[8px] font-black px-1.5 py-0.5 rounded uppercase tracking-wider">Novo</span>}
                        </div>
                        
                        {cap.title && (
                          <p className="text-xs text-gray-400 mb-1 line-clamp-1">{cap.title}</p>
                        )}
                        <p className="text-[10px] text-gray-600">
                          {timeAgo(cap.rawTime || cap.timestamp || Date.now())}
                        </p>
                      </div>
                    </div>

                    <button className="p-2 text-gray-600 hover:text-red-500 transition-colors">
                      <Bookmark className="w-5 h-5" />
                    </button>
                  </div>
                );
              })}
            </div>
            
            {chapters.length === 0 && (
              <div className="text-center py-12 bg-[#0a0a0a] rounded-xl border border-white/5">
                <AlertCircle className="w-8 h-8 text-gray-600 mx-auto mb-2" />
                <p className="text-sm text-gray-500">Nenhum capítulo disponível.</p>
              </div>
            )}
          </div>
        )}

        {/* CONTEÚDO: COMENTÁRIOS */}
        {activeTab === 'Comentários' && (
          <div className="animate-in fade-in">
            {/* Campo de Enviar Comentário */}
            <form onSubmit={handleAddComment} className="flex gap-2 mb-8">
                <input 
                    type="text" 
                    value={commentText}
                    onChange={e => setCommentText(e.target.value)}
                    placeholder="Escreva seu comentário..." 
                    className="flex-1 bg-[#0a0a0a] border border-white/10 rounded-xl px-4 py-3 text-sm outline-none focus:border-red-600/50 text-white placeholder:text-gray-600 transition-colors"
                />
                <button type="submit" disabled={!commentText.trim()} className="bg-red-600 text-white px-4 py-3 rounded-xl hover:bg-red-500 disabled:opacity-50 disabled:grayscale transition-all shadow-[0_0_15px_rgba(220,38,38,0.3)]">
                    <Send className="w-4 h-4" />
                </button>
            </form>

            {/* Lista de Comentários */}
            <div className="flex flex-col gap-4">
                {commentsList.length === 0 ? (
                    <div className="text-center py-10 bg-[#0a0a0a] rounded-xl border border-white/5">
                        <p className="text-sm text-gray-500 font-medium">Seja o primeiro a comentar!</p>
                    </div>
                ) : (
                    commentsList.map(comment => (
                        <div key={comment.id} className="bg-[#0a0a0a] p-4 rounded-xl border border-white/5 flex gap-3">
                            <div className="w-10 h-10 rounded-full border border-gray-700 bg-gray-900 overflow-hidden flex-shrink-0">
                                {comment.userAvatar ? (
                                    <img src={cleanCosmeticUrl(comment.userAvatar)} className="w-full h-full object-cover" alt="Avatar" />
                                ) : (
                                    <UserIcon className="w-full h-full p-2 text-gray-500" />
                                )}
                            </div>
                            <div className="flex-1">
                                <div className="flex items-center justify-between mb-1.5">
                                    <span className="text-xs font-bold text-gray-300">{comment.userName}</span>
                                    <span className="text-[9px] text-gray-600 uppercase tracking-widest font-bold">{timeAgo(comment.createdAt)}</span>
                                </div>
                                <p className="text-xs text-gray-400 leading-relaxed">{comment.text}</p>
                            </div>
                        </div>
                    ))
                )}
            </div>
          </div>
        )}

      </div>
    </div>
  );
}
