import React, { useState, useEffect } from 'react';
import { MessageSquare, EyeOff, Eye, UserCircle, Zap, X, Loader2, Send, ArrowDownAz, ArrowUpZa, Sparkles } from 'lucide-react';
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
    <div className="w-full mx-auto relative z-10 font-sans">
      
      {/* HEADER COMENTÁRIOS */}
      <div className="flex items-center gap-3 mb-6">
        <MessageSquare className="w-6 h-6 text-cyan-400" />
        <h2 className="text-xl font-black text-white tracking-wide">
            COMENTÁRIOS <span className="text-cyan-600/70 text-sm ml-1">({comments.length})</span>
        </h2>
      </div>
      
      {/* ABAS RECENTES / ANTIGOS */}
      <div className="flex border-b border-white/10 w-full mb-4">
        <button onClick={() => setSortOrder('desc')} className={`flex-1 flex items-center justify-center gap-2 pb-3 text-xs font-black uppercase tracking-widest transition-colors ${sortOrder === 'desc' ? 'border-b-2 border-cyan-400 text-cyan-400' : 'text-gray-500 hover:text-gray-300'}`}>
            <ArrowDownAz className="w-4 h-4"/> Recentes
        </button>
        <button onClick={() => setSortOrder('asc')} className={`flex-1 flex items-center justify-center gap-2 pb-3 text-xs font-black uppercase tracking-widest transition-colors ${sortOrder === 'asc' ? 'border-b-2 border-cyan-400 text-cyan-400' : 'text-gray-500 hover:text-gray-300'}`}>
            <ArrowUpZa className="w-4 h-4"/> Antigos
        </button>
      </div>

      {/* BOTÃO OCULTAR */}
      <div className="flex justify-center mb-8">
          <button onClick={()=>setShowComments(!showComments)} className="text-gray-500 hover:text-white transition-colors flex items-center gap-2 font-black text-[10px] uppercase tracking-widest">
             {showComments ? <><EyeOff className="w-3.5 h-3.5"/> Ocultar</> : <><Eye className="w-3.5 h-3.5"/> Mostrar</>}
          </button>
      </div>

      {showComments && (
        <div className="animate-in fade-in duration-500">
          
          {/* CAIXA DE TEXTO NO ESTILO DA PRINT */}
          <div className="flex items-center gap-4 mb-16">
            <div className="w-12 h-12 rounded-full border border-cyan-500/30 overflow-hidden flex-shrink-0 flex items-center justify-center p-0.5">
               <div className="w-full h-full rounded-full overflow-hidden bg-[#050505]">
                 {(userProfileData?.avatarUrl || user?.photoURL) ? <img src={userProfileData.avatarUrl || user.photoURL} loading="lazy" className="w-full h-full object-cover" /> : <UserCircle className="w-full h-full text-cyan-600/50 p-1" />}
               </div>
            </div>
            
            <div className="flex-1 relative group">
                {replyingTo && (
                    <div className="absolute -top-6 left-0 text-[10px] text-cyan-400 font-black uppercase tracking-widest flex items-center gap-2">
                        <Zap className="w-3 h-3"/> Respondendo a @{replyingTo.userName}
                        <button onClick={() => setReplyingTo(null)} className="ml-2 text-gray-500 hover:text-white"><X className="w-3 h-3"/></button>
                    </div>
                )}
                <form onSubmit={handlePostComment} className="flex items-center w-full relative">
                  <input 
                    type="text" 
                    value={newComment} 
                    onChange={e=>setNewComment(e.target.value)} 
                    placeholder={user ? "Ecoe a sua voz no Vazio..." : "Faça login para interagir."} 
                    disabled={!user || submittingComment} 
                    className="w-full bg-transparent border-none text-white text-sm font-medium outline-none placeholder:text-gray-600 disabled:opacity-50 pr-16" 
                  />
                  <button type="submit" disabled={!user || submittingComment || !newComment.trim()} className="absolute right-0 w-10 h-10 flex items-center justify-center bg-gradient-to-br from-cyan-400 to-blue-600 text-white rounded-xl disabled:opacity-50 disabled:grayscale transition-transform hover:scale-105 shadow-[0_0_15px_rgba(34,211,238,0.4)]">
                     {submittingComment ? <Loader2 className="w-4 h-4 animate-spin"/> : <Send className="w-4 h-4 -ml-1 mt-0.5"/>}
                  </button>
                </form>
            </div>
          </div>

          {/* LISTA DE COMENTÁRIOS OU ESTADO VAZIO */}
          <div className="space-y-6">
            {sortedComments.length === 0 ? (
              <div className="py-12 flex flex-col items-center justify-center text-center">
                  <div className="relative mb-6">
                      <div className="absolute inset-0 bg-cyan-500/20 blur-[30px] rounded-full"></div>
                      <MessageSquare className="w-16 h-16 text-cyan-400 relative z-10 drop-shadow-[0_0_15px_rgba(34,211,238,0.5)]" strokeWidth={1.5} />
                      <Sparkles className="absolute -top-2 -right-4 w-5 h-5 text-cyan-300 animate-pulse" />
                      <Sparkles className="absolute top-4 -left-6 w-4 h-4 text-cyan-500 animate-pulse delay-75" />
                  </div>
                  <h3 className="text-white font-black text-sm uppercase tracking-widest mb-1">O SILÊNCIO REINA.</h3>
                  <h3 className="text-cyan-400 font-black text-sm uppercase tracking-widest mb-3">SEJA O PRIMEIRO.</h3>
                  <p className="text-gray-500 font-medium text-xs">Deixe sua marca. Sua voz pode inspirar.</p>
              </div>
            ) : (
              sortedComments.map(comment => (
                <div key={comment.id} className={`flex gap-4 group ${comment.replyToUser ? 'ml-12 relative before:content-[""] before:absolute before:-left-6 before:top-0 before:w-[2px] before:h-full before:bg-cyan-900/30' : ''}`}>
                  <div className="w-10 h-10 rounded-full border border-white/5 overflow-hidden bg-[#050505] flex-shrink-0">
                     {comment.userAvatar ? <img src={comment.userAvatar} loading="lazy" className="w-full h-full object-cover" /> : <UserCircle className="w-full h-full text-gray-600 p-1.5" />}
                  </div>
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-1">
                      <span className="font-black text-white text-xs">{comment.userName}</span>
                      <span className="text-[9px] font-bold text-gray-600">• {new Date(comment.createdAt).toLocaleDateString('pt-BR')}</span>
                    </div>
                    <p className="text-gray-300 text-sm leading-relaxed whitespace-pre-wrap font-medium">
                        {comment.replyToUser && <span className="text-cyan-400 font-black text-[10px] uppercase tracking-widest mr-2">@{comment.replyToUser}</span>}
                        {comment.text}
                    </p>
                    <button onClick={() => setReplyingTo(comment)} className="text-[10px] text-gray-500 hover:text-cyan-400 font-black mt-2 transition-colors">RESPONDER</button>
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
