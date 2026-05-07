import React, { useState, useEffect } from 'react';
import { MessageSquare, EyeOff, Eye, UserCircle, Zap, X, Loader2, Send, ArrowDownAz, ArrowUpZa, Sparkles, Trash2, AlertTriangle, Hexagon, Star, MessageCircle } from 'lucide-react';
import { query, collection, onSnapshot, addDoc, deleteDoc, doc, getDoc } from "firebase/firestore";
import { db } from './firebase';
import { APP_ID } from './constants';
import { cleanCosmeticUrl, getLevelTitle } from './helpers';

// COMPONENTE: Cartão de Perfil Público 
const PublicProfileModal = ({ userId, onClose, currentUserId }) => {
    const [data, setData] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        if(!userId) return;
        getDoc(doc(db, 'artifacts', APP_ID, 'users', userId, 'profile', 'main')).then(snap => {
            if(snap.exists()) setData(snap.data()); else setData(null);
            setLoading(false);
        });
    }, [userId]);

    if (!userId) return null;

    return (
        <div className="fixed inset-0 z-[99999] bg-black/90 backdrop-blur-md flex items-center justify-center p-4 animate-in fade-in zoom-in-95 duration-300" onClick={onClose}>
            <div className="bg-[#050505] border border-red-600/50 rounded-2xl w-full max-w-sm relative overflow-hidden shadow-[0_0_50px_rgba(239,68,68,0.2)]" onClick={e => e.stopPropagation()}>
                {loading ? (
                    <div className="p-16 flex justify-center"><Loader2 className="w-10 h-10 text-red-600 animate-spin"/></div>
                ) : !data ? (
                    <div className="p-10 text-center text-gray-500 font-black uppercase tracking-widest text-xs">Usuário não encontrado.</div>
                ) : data.settings?.isPrivate && userId !== currentUserId ? (
                    <div className="p-12 text-center bg-[radial-gradient(ellipse_at_center,rgba(239,68,68,0.1),transparent_70%)]">
                        <EyeOff className="w-16 h-16 text-red-900 mx-auto mb-6 drop-shadow-[0_0_15px_rgba(239,68,68,0.5)]" />
                        <h3 className="text-white font-black text-xl uppercase tracking-widest">Perfil Privado</h3>
                        <p className="text-gray-500 text-[10px] mt-3 font-bold uppercase tracking-[0.2em]">Este usuário ocultou seu perfil do sistema.</p>
                        <button onClick={onClose} className="mt-8 bg-red-950/40 text-red-400 border border-red-900/50 px-8 py-3 rounded-xl font-black text-[10px] uppercase tracking-widest hover:bg-red-900/60 transition-colors">Retornar</button>
                    </div>
                ) : (
                    <div className="pb-8">
                        {/* Banner Público */}
                        <div className="h-32 w-full bg-red-950/30 relative border-b border-red-900/30">
                            {data.coverUrl ? <img src={cleanCosmeticUrl(data.coverUrl)} className="w-full h-full object-cover opacity-50 mix-blend-screen" /> : <div className="w-full h-full bg-[url('https://www.transparenttextures.com/patterns/stardust.png')] opacity-20"></div>}
                            <div className="absolute inset-0 bg-gradient-to-t from-[#050505] via-transparent to-transparent"></div>
                            <button onClick={onClose} className="absolute top-4 right-4 bg-black/50 p-2 rounded-full text-white hover:text-red-500 hover:bg-black transition-colors backdrop-blur-md"><X className="w-4 h-4"/></button>
                        </div>
                        {/* Avatar Público */}
                        <div className="relative -mt-16 flex justify-center">
                            <div className="w-28 h-28 rounded-full border-[3px] border-[#050505] bg-[#111] relative flex items-center justify-center shadow-[0_0_20px_rgba(239,68,68,0.3)]">
                                <img src={cleanCosmeticUrl(data.equipped_items?.avatar?.preview) || data.avatarUrl || 'https://placehold.co/150x150/050505/ef4444?text=U'} className="w-full h-full object-cover rounded-full" />
                                {data.equipped_items?.moldura?.preview && <img src={cleanCosmeticUrl(data.equipped_items.moldura.preview)} className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[140%] h-[140%] max-w-none object-contain pointer-events-none" style={{mixBlendMode: 'screen'}} />}
                            </div>
                        </div>
                        {/* Info Pública */}
                        <div className="text-center mt-4 px-6">
                            <h3 className="text-2xl font-black text-white uppercase tracking-tight">{data.name || 'Leitor Anônimo'}</h3>
                            <div className="inline-flex items-center gap-2 mt-2 bg-red-950/30 border border-red-900/50 px-4 py-1.5 rounded-full">
                                <Sparkles className="w-3 h-3 text-red-500" />
                                <span className="text-red-500 text-[10px] font-black uppercase tracking-widest">Nível {data.level || 1} • {getLevelTitle(data.level || 1)}</span>
                            </div>
                            <p className="text-gray-400 text-xs italic mt-5 leading-relaxed font-medium line-clamp-3">"{data.bio || 'Explorando o Império.'}"</p>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
};

export const CommentsSection = React.memo(({ mangaId, chapterId, user, userProfileData, onRequireLogin, showToast }) => {
  const [comments, setComments] = useState([]);
  const [newComment, setNewComment] = useState('');
  const [sortOrder, setSortOrder] = useState('desc'); 
  const [submittingComment, setSubmittingComment] = useState(false);
  const [replyingTo, setReplyingTo] = useState(null);
  
  // ESTADOS DOS MODAIS CUSTOMIZADOS
  const [commentToDelete, setCommentToDelete] = useState(null);
  const [selectedUserId, setSelectedUserId] = useState(null);

  useEffect(() => {
    const path = chapterId ? `obras/${mangaId}/capitulos/${chapterId}/comments` : `obras/${mangaId}/comments`;
    const unsub = onSnapshot(query(collection(db, path)), (snap) => {
      const list = [];
      snap.forEach(d => list.push({id: d.id, ...d.data()}));
      setComments(list);
    });
    return () => unsub();
  }, [mangaId, chapterId]);

  const handlePostComment = async (e) => {
    e.preventDefault();
    if (!user) return onRequireLogin();
    if (!newComment.trim()) return;
    setSubmittingComment(true);
    try {
      const customAvatar = userProfileData?.avatarUrl || user.photoURL || '';
      const path = chapterId ? `obras/${mangaId}/capitulos/${chapterId}/comments` : `obras/${mangaId}/comments`;
      
      await addDoc(collection(db, path), {
        text: newComment, userId: user.uid, userName: user.displayName || 'Anônimo', userAvatar: customAvatar, 
        createdAt: Date.now(), replyToId: replyingTo ? replyingTo.id : null, replyToUser: replyingTo ? replyingTo.userName : null
      });

      if (replyingTo && replyingTo.userId !== user.uid) {
          await addDoc(collection(db, 'artifacts', APP_ID, 'users', replyingTo.userId, 'notifications'), {
              type: 'reply', text: `${user.displayName || 'Alguém'} respondeu o seu comentário.`,
              mangaId: mangaId, chapterId: chapterId || null, createdAt: Date.now(), read: false
          });
      }
      setNewComment(''); setReplyingTo(null); showToast("Comentário publicado!", "success");
    } catch(e) { showToast("Erro ao publicar.", "error"); } finally { setSubmittingComment(false); }
  };

  const executeDeleteComment = async () => {
      if(!commentToDelete) return;
      try {
          const path = chapterId ? `obras/${mangaId}/capitulos/${chapterId}/comments` : `obras/${mangaId}/comments`;
          await deleteDoc(doc(db, path, commentToDelete));
          showToast("Comentário excluído.", "success");
      } catch(e) { showToast("Erro ao excluir.", "error"); }
      setCommentToDelete(null);
  };

  const sortedComments = [...comments].sort((a, b) => sortOrder === 'desc' ? b.createdAt - a.createdAt : a.createdAt - b.createdAt);

  return (
    <div className="w-full mx-auto relative z-10 font-sans">
      
      {/* MODAL: APAGAR COMENTÁRIO */}
      {commentToDelete && (
          <div className="fixed inset-0 z-[99999] bg-black/90 backdrop-blur-md flex items-center justify-center p-4 animate-in fade-in zoom-in-95 duration-200">
              <div className="bg-[#050505] border border-red-600/50 rounded-2xl p-8 max-w-sm w-full shadow-[0_0_50px_rgba(239,68,68,0.2)] text-center relative overflow-hidden">
                  <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,rgba(239,68,68,0.1),transparent_70%)] pointer-events-none"></div>
                  <AlertTriangle className="w-14 h-14 text-red-500 mx-auto mb-5 relative z-10 drop-shadow-[0_0_15px_rgba(239,68,68,0.8)]" />
                  <h3 className="text-xl font-black text-white uppercase tracking-widest mb-3 relative z-10">Excluir Comentário?</h3>
                  <p className="text-gray-400 text-xs font-bold mb-8 relative z-10 leading-relaxed">Esta ação não pode ser desfeita.</p>
                  <div className="flex gap-4 relative z-10">
                      <button onClick={() => setCommentToDelete(null)} className="flex-1 bg-[#111] border border-white/10 text-gray-300 py-3.5 rounded-xl font-black text-[10px] uppercase tracking-widest hover:bg-white/5 transition-colors">Cancelar</button>
                      <button onClick={executeDeleteComment} className="flex-1 bg-red-600 hover:bg-red-500 text-white py-3.5 rounded-xl font-black text-[10px] uppercase tracking-widest shadow-lg transition-all border border-red-500/50">Excluir</button>
                  </div>
              </div>
          </div>
      )}

      {/* MODAL: PERFIL PÚBLICO */}
      {selectedUserId && <PublicProfileModal userId={selectedUserId} onClose={() => setSelectedUserId(null)} currentUserId={user?.uid} />}

      {/* CAIXA DE ESTATÍSTICAS (Igual à Imagem) */}
      <div className="bg-[#0A0A0A] border border-white/5 rounded-[2rem] p-6 md:p-8 flex flex-col md:flex-row items-center justify-between gap-6 mb-10 shadow-lg">
          <div className="flex items-center gap-6 w-full md:w-auto justify-center">
              <div className="flex flex-col items-center">
                  <span className="text-5xl font-black italic">4.8</span>
                  <div className="flex gap-1 mt-1 text-purple-500">
                      <Star className="w-4 h-4 fill-current"/><Star className="w-4 h-4 fill-current"/><Star className="w-4 h-4 fill-current"/><Star className="w-4 h-4 fill-current"/><Star className="w-4 h-4 fill-current"/>
                  </div>
              </div>
              <div className="flex flex-col gap-1 w-32">
                  {[5, 4, 3, 2, 1].map((n, i) => (
                      <div key={n} className="flex items-center gap-2">
                          <span className="text-[10px] font-black text-gray-500 w-2">{n}</span>
                          <div className="flex-1 h-1.5 bg-[#111] rounded-full overflow-hidden">
                              <div className="h-full bg-purple-500" style={{width: `${100 - (i * 20)}%`}}></div>
                          </div>
                      </div>
                  ))}
              </div>
          </div>

          <div className="w-full md:w-px h-[1px] md:h-16 bg-white/10 hidden md:block"></div>

          <div className="flex items-center gap-6 justify-center w-full md:w-auto">
              <div className="text-center">
                  <div className="w-12 h-12 rounded-2xl bg-blue-500/10 flex items-center justify-center text-blue-500 mx-auto mb-2"><MessageCircle className="w-6 h-6"/></div>
                  <p className="text-2xl font-black">{comments.length}</p>
                  <p className="text-[10px] text-gray-500 font-bold uppercase tracking-widest">Avaliações</p>
              </div>
              <div className="text-center">
                  <div className="w-12 h-12 rounded-2xl bg-orange-500/10 flex items-center justify-center text-orange-500 mx-auto mb-2"><Flame className="w-6 h-6"/></div>
                  <p className="text-2xl font-black">2.4k</p>
                  <p className="text-[10px] text-gray-500 font-bold uppercase tracking-widest">Likes</p>
              </div>
          </div>
      </div>

      {/* ÁREA DE INPUT DE COMENTÁRIO */}
      <div className="flex gap-4 mb-8">
        <div className="w-12 h-12 rounded-full border-[2px] border-[#0A0A0A] shadow-[0_0_15px_rgba(239,68,68,0.3)] overflow-hidden flex-shrink-0">
           {(userProfileData?.avatarUrl || user?.photoURL) ? <img src={userProfileData.avatarUrl || user.photoURL} loading="lazy" className="w-full h-full object-cover" /> : <UserCircle className="w-full h-full text-red-600/50 p-1" />}
        </div>
        
        <div className="flex-1 relative group">
            {replyingTo && (
                <div className="absolute -top-6 left-2 text-[10px] text-blue-400 font-black uppercase tracking-widest flex items-center gap-2">
                    <MessageCircle className="w-3 h-3"/> Respondendo a @{replyingTo.userName}
                    <button onClick={() => setReplyingTo(null)} className="ml-2 text-gray-500 hover:text-white"><X className="w-3 h-3"/></button>
                </div>
            )}
            <form onSubmit={handlePostComment} className="flex items-center w-full relative">
              <input 
                type="text" 
                value={newComment} 
                onChange={e=>setNewComment(e.target.value)} 
                placeholder={user ? "Escreva sua avaliação..." : "Acesse o sistema para comentar."} 
                disabled={!user || submittingComment} 
                className="w-full bg-[#0A0A0A] border border-white/5 text-white text-sm font-bold rounded-2xl py-4 pl-5 pr-14 outline-none placeholder:text-gray-600 focus:border-red-500/50 transition-colors shadow-inner disabled:opacity-50" 
              />
              <button type="submit" disabled={!user || submittingComment || !newComment.trim()} className="absolute right-2 w-10 h-10 flex items-center justify-center bg-red-600 text-white rounded-xl disabled:opacity-50 disabled:grayscale transition-transform hover:scale-105 shadow-[0_0_15px_rgba(239,68,68,0.4)]">
                 {submittingComment ? <Loader2 className="w-4 h-4 animate-spin"/> : <Send className="w-4 h-4 -ml-1 mt-0.5"/>}
              </button>
            </form>
        </div>
      </div>

      {/* FILTRO DOS COMENTÁRIOS */}
      <div className="flex items-center gap-4 border-b border-white/5 pb-4 mb-6">
          <button onClick={() => setSortOrder('desc')} className={`text-[10px] font-black uppercase tracking-widest transition-colors ${sortOrder === 'desc' ? 'text-white' : 'text-gray-600 hover:text-gray-400'}`}>Mais Recentes</button>
          <span className="text-gray-800 text-xs">|</span>
          <button onClick={() => setSortOrder('asc')} className={`text-[10px] font-black uppercase tracking-widest transition-colors ${sortOrder === 'asc' ? 'text-white' : 'text-gray-600 hover:text-gray-400'}`}>Mais Antigos</button>
      </div>

      {/* LISTA DE COMENTÁRIOS */}
      <div className="space-y-6">
        {sortedComments.length === 0 ? (
          <div className="py-12 flex flex-col items-center justify-center text-center">
              <MessageSquare className="w-12 h-12 text-gray-800 mb-4" strokeWidth={1.5} />
              <h3 className="text-white font-black text-sm uppercase tracking-widest mb-1">Nenhuma avaliação ainda.</h3>
              <p className="text-gray-600 font-bold text-xs uppercase tracking-widest">Seja o primeiro a dar sua opinião.</p>
          </div>
        ) : (
          sortedComments.map(comment => (
            <div key={comment.id} className={`flex gap-4 relative group ${comment.replyToUser ? 'ml-12 before:content-[""] before:absolute before:-left-6 before:top-4 before:w-[2px] before:h-[80%] before:bg-white/5' : ''}`}>
              
              <div onClick={() => setSelectedUserId(comment.userId)} className="w-10 h-10 rounded-full border-[2px] border-[#0A0A0A] overflow-hidden bg-[#111] flex-shrink-0 cursor-pointer shadow-lg hover:border-red-500 transition-all">
                 {comment.userAvatar ? <img src={comment.userAvatar} loading="lazy" className="w-full h-full object-cover" /> : <UserCircle className="w-full h-full text-gray-600 p-1.5" />}
              </div>
              
              <div className="flex-1 bg-[#0A0A0A] border border-white/5 rounded-2xl p-4 relative">
                <div className="flex justify-between items-start mb-2">
                    <div className="flex items-center gap-2">
                        <span onClick={() => setSelectedUserId(comment.userId)} className="font-black text-white text-xs cursor-pointer hover:text-red-500 transition-colors">{comment.userName}</span>
                        <div className="px-2 py-0.5 bg-blue-500/10 text-blue-400 rounded-md text-[8px] font-black uppercase tracking-widest">Leitor</div>
                    </div>
                    <span className="text-[9px] font-bold text-gray-600 uppercase tracking-widest">{timeAgo(comment.createdAt)}</span>
                </div>
                
                <p className="text-gray-300 text-sm leading-relaxed whitespace-pre-wrap font-medium">
                    {comment.replyToUser && <span className="text-blue-400 font-black text-[10px] uppercase tracking-widest mr-2">@{comment.replyToUser}</span>}
                    {comment.text}
                </p>
                
                <div className="flex items-center gap-4 mt-4">
                    <button onClick={() => setReplyingTo(comment)} className="flex items-center gap-1.5 text-[10px] text-gray-500 hover:text-white font-black uppercase tracking-widest transition-colors">
                        <MessageCircle className="w-3 h-3" /> Responder
                    </button>
                    {user && comment.userId === user.uid && (
                        <button onClick={() => setCommentToDelete(comment.id)} className="flex items-center gap-1.5 text-[10px] text-gray-500 hover:text-red-500 font-black uppercase tracking-widest transition-colors">
                            <Trash2 className="w-3 h-3"/> Excluir
                        </button>
                    )}
                </div>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
});
