import React, { useState, useEffect } from 'react';
import { MessageSquare, EyeOff, Eye, UserCircle, Zap, X, Loader2, Send, ArrowDownAz, ArrowUpZa, Sparkles, Trash2, AlertTriangle } from 'lucide-react';
import { query, collection, onSnapshot, addDoc, deleteDoc, doc, getDoc } from "firebase/firestore";
import { db } from './firebase';
import { APP_ID } from './constants';
import { cleanCosmeticUrl, getLevelTitle } from './helpers';

// COMPONENTE: Cartão de Perfil Público (Surreal e Sombrio)
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
            <div className="bg-[#050505] border border-red-600/50 rounded-2xl w-full max-w-sm relative overflow-hidden shadow-[0_0_50px_rgba(220,38,38,0.2)]" onClick={e => e.stopPropagation()}>
                {loading ? (
                    <div className="p-16 flex justify-center"><Loader2 className="w-10 h-10 text-red-600 animate-spin"/></div>
                ) : !data ? (
                    <div className="p-10 text-center text-gray-500 font-black uppercase tracking-widest text-xs">Ninja desintegrado da matriz.</div>
                ) : data.settings?.isPrivate && userId !== currentUserId ? (
                    <div className="p-12 text-center bg-[radial-gradient(ellipse_at_center,rgba(220,38,38,0.1),transparent_70%)]">
                        <EyeOff className="w-16 h-16 text-red-900 mx-auto mb-6 drop-shadow-[0_0_15px_rgba(220,38,38,0.5)]" />
                        <h3 className="text-white font-black text-xl uppercase tracking-widest">Perfil Oculto</h3>
                        <p className="text-gray-500 text-[10px] mt-3 font-bold uppercase tracking-[0.2em]">Este ninja ativou a camuflagem das sombras.</p>
                        <button onClick={onClose} className="mt-8 bg-red-950/40 text-red-500 border border-red-900/50 px-8 py-3 rounded-xl font-black text-[10px] uppercase tracking-widest hover:bg-red-900/60 transition-colors">Retornar</button>
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
                            <div className="w-28 h-28 rounded-full border-[3px] border-[#050505] bg-[#0a0a0c] relative flex items-center justify-center shadow-[0_0_20px_rgba(220,38,38,0.3)]">
                                <img src={cleanCosmeticUrl(data.equipped_items?.avatar?.preview) || data.avatarUrl || 'https://placehold.co/150x150/050505/dc2626?text=K'} className="w-full h-full object-cover rounded-full" />
                                {data.equipped_items?.moldura?.preview && <img src={cleanCosmeticUrl(data.equipped_items.moldura.preview)} className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[140%] h-[140%] max-w-none object-contain pointer-events-none" style={{mixBlendMode: 'screen'}} />}
                            </div>
                        </div>
                        {/* Info Pública */}
                        <div className="text-center mt-4 px-6">
                            <h3 className="text-2xl font-black text-white uppercase tracking-tight">{data.name || 'Ninja Anônimo'}</h3>
                            <div className="inline-flex items-center gap-2 mt-2 bg-red-950/30 border border-red-900/50 px-4 py-1.5 rounded-full">
                                <Sparkles className="w-3 h-3 text-red-500" />
                                <span className="text-red-500 text-[10px] font-black uppercase tracking-widest">Nível {data.level || 1} • {getLevelTitle(data.level || 1)}</span>
                            </div>
                            <p className="text-gray-400 text-xs italic mt-5 leading-relaxed font-medium line-clamp-3">"{data.bio || 'Mergulhado no domínio das sombras.'}"</p>
                        </div>
                        {/* Atributos Públicos */}
                        <div className="grid grid-cols-3 gap-2 mt-8 px-8 border-t border-white/5 pt-8">
                            <div className="text-center flex flex-col items-center">
                                <div className="w-10 h-10 rounded-full bg-red-950/20 border border-red-900/30 flex items-center justify-center mb-2"><Zap className="w-4 h-4 text-red-500"/></div>
                                <span className="block text-lg font-black text-white">{data.xp || 0}</span>
                                <span className="text-[8px] text-gray-500 font-black uppercase tracking-widest mt-0.5">Poder Vital</span>
                            </div>
                            <div className="text-center flex flex-col items-center">
                                <div className="w-10 h-10 rounded-full bg-amber-950/20 border border-amber-900/30 flex items-center justify-center mb-2"><div className="w-3 h-3 bg-amber-500 rotate-45"></div></div>
                                <span className="block text-lg font-black text-white">{data.coins || 0}</span>
                                <span className="text-[8px] text-gray-500 font-black uppercase tracking-widest mt-0.5">Sombras</span>
                            </div>
                            <div className="text-center flex flex-col items-center">
                                <div className="w-10 h-10 rounded-full bg-blue-950/20 border border-blue-900/30 flex items-center justify-center mb-2"><Hexagon className="w-4 h-4 text-blue-500"/></div>
                                <span className="block text-lg font-black text-white">{data.crystals || 0}</span>
                                <span className="text-[8px] text-gray-500 font-black uppercase tracking-widest mt-0.5">Cristais</span>
                            </div>
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
  const [showComments, setShowComments] = useState(true);
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
      setNewComment(''); setReplyingTo(null); showToast("Mensagem gravada no Vazio!", "success");
    } catch(e) { showToast("Erro ao comunicar com o Vazio.", "error"); } finally { setSubmittingComment(false); }
  };

  const executeDeleteComment = async () => {
      if(!commentToDelete) return;
      try {
          const path = chapterId ? `obras/${mangaId}/capitulos/${chapterId}/comments` : `obras/${mangaId}/comments`;
          await deleteDoc(doc(db, path, commentToDelete));
          showToast("Mensagem desintegrada.", "success");
      } catch(e) { showToast("Erro ao apagar mensagem.", "error"); }
      setCommentToDelete(null);
  };

  const sortedComments = [...comments].sort((a, b) => sortOrder === 'desc' ? b.createdAt - a.createdAt : a.createdAt - b.createdAt);

  return (
    <div className="w-full mx-auto relative z-10 font-sans">
      
      {/* MODAL CUSTOMIZADO: APAGAR COMENTÁRIO */}
      {commentToDelete && (
          <div className="fixed inset-0 z-[99999] bg-black/90 backdrop-blur-md flex items-center justify-center p-4 animate-in fade-in zoom-in-95 duration-200">
              <div className="bg-[#050505] border border-red-600/60 rounded-2xl p-8 max-w-sm w-full shadow-[0_0_50px_rgba(220,38,38,0.2)] text-center relative overflow-hidden">
                  <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,rgba(220,38,38,0.1),transparent_70%)] pointer-events-none"></div>
                  <AlertTriangle className="w-14 h-14 text-red-500 mx-auto mb-5 relative z-10 drop-shadow-[0_0_15px_rgba(220,38,38,0.8)]" />
                  <h3 className="text-xl font-black text-white uppercase tracking-widest mb-3 relative z-10">Apagar Mensagem?</h3>
                  <p className="text-gray-400 text-xs font-bold mb-8 relative z-10 leading-relaxed">Esta ação desintegrará sua voz do vazio para sempre. Não há retorno.</p>
                  <div className="flex gap-4 relative z-10">
                      <button onClick={() => setCommentToDelete(null)} className="flex-1 bg-[#0a0a0c] border border-white/10 text-gray-300 py-3.5 rounded-xl font-black text-[10px] uppercase tracking-widest hover:bg-white/5 transition-colors">Recuar</button>
                      <button onClick={executeDeleteComment} className="flex-1 bg-red-600 hover:bg-red-500 text-white py-3.5 rounded-xl font-black text-[10px] uppercase tracking-widest shadow-[0_0_20px_rgba(220,38,38,0.4)] transition-all">Desintegrar</button>
                  </div>
              </div>
          </div>
      )}

      {/* MODAL: PERFIL PÚBLICO */}
      {selectedUserId && <PublicProfileModal userId={selectedUserId} onClose={() => setSelectedUserId(null)} currentUserId={user?.uid} />}

      <div className="flex items-center gap-3 mb-6">
        <MessageSquare className="w-6 h-6 text-cyan-400" />
        <h2 className="text-xl font-black text-white tracking-wide">
            COMENTÁRIOS <span className="text-cyan-600/70 text-sm ml-1">({comments.length})</span>
        </h2>
      </div>
      
      <div className="flex border-b border-white/10 w-full mb-4">
        <button onClick={() => setSortOrder('desc')} className={`flex-1 flex items-center justify-center gap-2 pb-3 text-xs font-black uppercase tracking-widest transition-colors ${sortOrder === 'desc' ? 'border-b-2 border-cyan-400 text-cyan-400' : 'text-gray-500 hover:text-gray-300'}`}>
            <ArrowDownAz className="w-4 h-4"/> Recentes
        </button>
        <button onClick={() => setSortOrder('asc')} className={`flex-1 flex items-center justify-center gap-2 pb-3 text-xs font-black uppercase tracking-widest transition-colors ${sortOrder === 'asc' ? 'border-b-2 border-cyan-400 text-cyan-400' : 'text-gray-500 hover:text-gray-300'}`}>
            <ArrowUpZa className="w-4 h-4"/> Antigos
        </button>
      </div>

      <div className="flex justify-center mb-8">
          <button onClick={()=>setShowComments(!showComments)} className="text-gray-500 hover:text-white transition-colors flex items-center gap-2 font-black text-[10px] uppercase tracking-widest">
             {showComments ? <><EyeOff className="w-3.5 h-3.5"/> Ocultar</> : <><Eye className="w-3.5 h-3.5"/> Mostrar</>}
          </button>
      </div>

      {showComments && (
        <div className="animate-in fade-in duration-500">
          
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
                <div key={comment.id} className={`flex gap-4 relative group ${comment.replyToUser ? 'ml-12 before:content-[""] before:absolute before:-left-6 before:top-0 before:w-[2px] before:h-full before:bg-cyan-900/30' : ''}`}>
                  
                  {/* Foto de Perfil Clicável */}
                  <div onClick={() => setSelectedUserId(comment.userId)} className="w-10 h-10 rounded-full border border-white/5 overflow-hidden bg-[#050505] flex-shrink-0 cursor-pointer hover:border-cyan-500 hover:shadow-[0_0_10px_rgba(34,211,238,0.4)] transition-all">
                     {comment.userAvatar ? <img src={comment.userAvatar} loading="lazy" className="w-full h-full object-cover" /> : <UserCircle className="w-full h-full text-gray-600 p-1.5" />}
                  </div>
                  
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-1">
                      {/* Nome Clicável */}
                      <span onClick={() => setSelectedUserId(comment.userId)} className="font-black text-white text-xs cursor-pointer hover:text-cyan-400 transition-colors">{comment.userName}</span>
                      <span className="text-[9px] font-bold text-gray-600">• {new Date(comment.createdAt).toLocaleDateString('pt-BR')}</span>
                    </div>
                    <p className="text-gray-300 text-sm leading-relaxed whitespace-pre-wrap font-medium">
                        {comment.replyToUser && <span className="text-cyan-400 font-black text-[10px] uppercase tracking-widest mr-2">@{comment.replyToUser}</span>}
                        {comment.text}
                    </p>
                    <button onClick={() => setReplyingTo(comment)} className="text-[10px] text-gray-500 hover:text-cyan-400 font-black mt-2 transition-colors">RESPONDER</button>
                  </div>
                  
                  {/* BOTÃO DE EXCLUIR MODIFICADO (CHAMA O NOVO MODAL) */}
                  {user && comment.userId === user.uid && (
                      <button onClick={() => setCommentToDelete(comment.id)} className="absolute top-0 right-0 text-gray-600 hover:text-red-500 transition-colors p-2 opacity-0 group-hover:opacity-100">
                          <Trash2 className="w-4 h-4"/>
                      </button>
                  )}
                </div>
              ))
            )}
          </div>
        </div>
      )}
    </div>
  );
});
