import React, { useState, useEffect } from 'react';
import { MessageSquare, EyeOff, Eye, UserCircle, Zap, X, Loader2, Send, ArrowDownAz, ArrowUpZa } from 'lucide-react';
import { query, collection, onSnapshot, addDoc } from "firebase/firestore";
import { db } from './firebase';
import { APP_ID } from './constants';

export const CommentsSection = React.memo(({ mangaId, chapterId, user, userProfileData, onRequireLogin, showToast }) => {
  const [comments, setComments] = useState([]);
  const [newComment, setNewComment] = useState('');
  const [showComments, setShowComments] = useState(true);
  const [sortOrder, setSortOrder] = useState('desc'); 
  const [submittingComment, setSubmittingComment] = useState(false);
  const [replyingTo, setReplyingTo] = useState(null);

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
      setNewComment(''); setReplyingTo(null); showToast("Mensagem gravada no Vazio!", "success");
    } catch(e) { showToast("Erro ao comunicar com o Vazio.", "error"); } finally { setSubmittingComment(false); }
  };

  const sortedComments = [...comments].sort((a, b) => sortOrder === 'desc' ? b.createdAt - a.createdAt : a.createdAt - b.createdAt);

  return (
    <div className="bg-[#050508] border border-white/5 rounded-3xl p-6 md:p-8 shadow-2xl w-full mx-auto mt-12 relative z-10">
      
      {/* HEADER E FILTROS CRESCENTE/DECRESCENTE */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-8">
        <h2 className="text-xl font-black flex items-center gap-3 text-white uppercase tracking-widest">
            <MessageSquare className="w-5 h-5 text-cyan-500"/> Comentários <span className="text-cyan-500/50 text-sm">({comments.length})</span>
        </h2>
        
        <div className="flex flex-wrap items-center gap-3 w-full sm:w-auto">
          <div className="flex bg-[#020204] border border-white/10 rounded-xl p-1 w-full sm:w-auto shadow-inner">
            <button onClick={() => setSortOrder('desc')} className={`flex-1 flex items-center justify-center gap-2 px-4 py-2 rounded-lg text-[10px] font-black uppercase tracking-widest transition-all duration-300 ${sortOrder === 'desc' ? 'bg-cyan-900/40 text-cyan-400 border border-cyan-500/30 shadow-sm' : 'text-gray-500 hover:text-gray-300 border border-transparent'}`}>
                <ArrowDownAz className="w-3 h-3"/> Recentes
            </button>
            <button onClick={() => setSortOrder('asc')} className={`flex-1 flex items-center justify-center gap-2 px-4 py-2 rounded-lg text-[10px] font-black uppercase tracking-widest transition-all duration-300 ${sortOrder === 'asc' ? 'bg-cyan-900/40 text-cyan-400 border border-cyan-500/30 shadow-sm' : 'text-gray-500 hover:text-gray-300 border border-transparent'}`}>
                <ArrowUpZa className="w-3 h-3"/> Antigos
            </button>
          </div>
          <button onClick={()=>setShowComments(!showComments)} className="bg-[#020204] border border-white/10 text-gray-400 hover:text-white rounded-xl px-4 py-2.5 transition-colors flex items-center justify-center gap-2 font-black w-full sm:w-auto text-[10px] uppercase tracking-widest shadow-sm">
             {showComments ? <><EyeOff className="w-3.5 h-3.5"/> Ocultar</> : <><Eye className="w-3.5 h-3.5"/> Mostrar</>}
          </button>
        </div>
      </div>

      {showComments && (
        <div className="animate-in fade-in slide-in-from-top-4 duration-500">
          
          {/* CAIXA DE TEXTO */}
          <div className="flex gap-4 mb-8">
            <div className="w-10 h-10 md:w-14 md:h-14 rounded-full border border-white/10 overflow-hidden bg-[#020204] flex-shrink-0 shadow-inner">
               {(userProfileData?.avatarUrl || user?.photoURL) ? <img src={userProfileData.avatarUrl || user.photoURL} loading="lazy" className="w-full h-full object-cover" /> : <UserCircle className="w-full h-full text-gray-600 bg-[#0b0e14] p-2" />}
            </div>
            <div className="flex-1 flex flex-col relative group">
                {replyingTo && (
                    <div className="flex justify-between items-center bg-cyan-900/20 px-4 py-2 rounded-t-xl border border-cyan-500/30 mb-[-2px] relative z-0">
                        <span className="text-[10px] text-cyan-400 font-black uppercase tracking-widest flex items-center gap-2"><Zap className="w-3 h-3"/> Respondendo a @{replyingTo.userName}</span>
                        <button onClick={() => setReplyingTo(null)} className="text-cyan-500 hover:text-white transition-colors"><X className="w-4 h-4"/></button>
                    </div>
                )}
                <form onSubmit={handlePostComment} className={`relative z-10 ${replyingTo ? 'border-t-0' : ''}`}>
                  <textarea value={newComment} onChange={e=>setNewComment(e.target.value)} placeholder={user ? "Ecoe a sua voz no Vazio..." : "Faça login para interagir."} disabled={!user || submittingComment} className={`w-full bg-[#020204] border border-white/10 px-5 py-4 pr-16 text-white font-medium outline-none focus:border-cyan-500 transition-colors resize-none disabled:opacity-50 text-sm shadow-inner duration-300 ${replyingTo ? 'rounded-b-xl rounded-t-none' : 'rounded-xl'}`} rows="3" />
                  <button type="submit" disabled={!user || submittingComment || !newComment.trim()} className="absolute right-3 bottom-3 p-3 bg-gradient-to-r from-cyan-600 to-blue-700 text-white rounded-lg disabled:bg-[#13151f] disabled:text-gray-600 transition-transform hover:scale-110 shadow-[0_0_15px_rgba(34,211,238,0.3)] duration-300">
                     {submittingComment ? <Loader2 className="w-4 h-4 animate-spin"/> : <Send className="w-4 h-4"/>}
                  </button>
                </form>
            </div>
          </div>

          {/* LISTA DE COMENTÁRIOS */}
          <div className="space-y-4">
            {sortedComments.length === 0 ? (
              <div className="py-12 text-center bg-[#020204] rounded-2xl border border-white/5"><MessageSquare className="w-8 h-8 text-gray-700 mx-auto mb-3"/><p className="text-gray-500 font-black text-[10px] uppercase tracking-widest">O silêncio reina. Seja o primeiro.</p></div>
            ) : (
              sortedComments.map(comment => (
                <div key={comment.id} className={`flex gap-4 p-5 rounded-2xl bg-[#0b0e14]/50 hover:bg-[#0b0e14] transition-colors border border-transparent hover:border-white/5 ${comment.replyToUser ? 'ml-8 md:ml-16 border-l-cyan-500/50 border-l-[3px]' : ''}`}>
                  <div className="w-10 h-10 rounded-full border border-white/10 overflow-hidden bg-[#020204] flex-shrink-0">
                     {comment.userAvatar ? <img src={comment.userAvatar} loading="lazy" className="w-full h-full object-cover" /> : <UserCircle className="w-full h-full text-gray-600 p-1.5" />}
                  </div>
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-2">
                      <span className="font-black text-white text-sm tracking-wide">{comment.userName}</span>
                      <span className="text-[9px] font-black uppercase tracking-widest text-cyan-500/60 bg-[#020204] px-2 py-1 rounded-full border border-white/5">{new Date(comment.createdAt).toLocaleDateString('pt-BR')}</span>
                    </div>
                    <p className="text-gray-300 text-sm leading-relaxed whitespace-pre-wrap font-medium">
                        {comment.replyToUser && <span className="text-cyan-400 font-black text-[10px] uppercase tracking-widest bg-cyan-900/30 px-2 py-0.5 rounded mr-2">@{comment.replyToUser}</span>}
                        {comment.text}
                    </p>
                    <button onClick={() => setReplyingTo(comment)} className="text-[10px] text-gray-500 uppercase tracking-widest hover:text-cyan-400 font-black mt-3 flex items-center gap-1.5 transition-colors"><MessageSquare className="w-3 h-3"/> Responder</button>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      )}
    </div>
  );
});
