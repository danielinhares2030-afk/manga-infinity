import React, { useState, useEffect, useRef } from 'react';
import { Compass, History, Library, Smartphone, Camera, Edit3, LogOut, Loader2, BookOpen, AlertTriangle, Trophy, Zap, Trash2, RefreshCw, LayoutTemplate, Settings } from 'lucide-react';
import { updateProfile } from "firebase/auth";
import { doc, setDoc, deleteDoc } from "firebase/firestore";
import { auth, db } from './firebase';
import { APP_ID } from './constants';
import { compressImage, getLevelRequirement, getLevelTitle, cleanCosmeticUrl } from './helpers';

export function ProfileView({ user, userProfileData, historyData, libraryData, dataLoaded, userSettings, updateSettings, onLogout, onUpdateData, showToast, mangas, onNavigate }) {
  const [isEditing, setIsEditing] = useState(false);
  const [activeTab, setActiveTab] = useState("Resumo"); 
  const [name, setName] = useState('');
  const [bio, setBio] = useState('');
  const [avatarBase64, setAvatarBase64] = useState('');
  const [coverBase64, setCoverBase64] = useState('');
  const [loading, setLoading] = useState(false);
  const [confirmAction, setConfirmAction] = useState(null); 

  useEffect(() => {
    setName(user.displayName || ''); setBio(userProfileData.bio || ''); setAvatarBase64(userProfileData.avatarUrl || user.photoURL || ''); setCoverBase64(userProfileData.coverUrl || '');
  }, [user, userProfileData]);
  
  const avatarInputRef = useRef(null); const coverInputRef = useRef(null);

  const handleImageUpload = async (e, type) => {
    const file = e.target.files[0]; if (!file) return;
    try { const compressedBase64 = await compressImage(file, type === 'cover' ? 400 : 150, 0.4); if (type === 'avatar') setAvatarBase64(compressedBase64); else setCoverBase64(compressedBase64); } catch (err) { showToast("Erro na imagem.", "error"); }
  };

  const handleSave = async (e) => {
    e.preventDefault(); setLoading(true);
    try { await updateProfile(auth.currentUser, { displayName: name }); const docData = { coverUrl: coverBase64, avatarUrl: avatarBase64, bio: bio }; await setDoc(doc(db, 'artifacts', APP_ID, 'users', user.uid, 'profile', 'main'), docData, { merge: true }); onUpdateData(docData); showToast('Essência sincronizada!', 'success'); setIsEditing(false); } catch (error) { showToast(`Erro ao salvar.`, 'error'); } finally { setLoading(false); }
  };

  const executeConfirmAction = async () => {
      if (confirmAction === 'history') { try { historyData.forEach(async (h) => { await deleteDoc(doc(db, 'artifacts', APP_ID, 'users', user.uid, 'history', h.id)); }); showToast("Memórias dissipadas.", "success"); } catch(e) { showToast("Erro ao limpar.", "error"); } } 
      else if (confirmAction === 'cache') { localStorage.clear(); sessionStorage.clear(); window.location.reload(true); }
      setConfirmAction(null);
  };

  const level = userProfileData.level || 1; const currentXp = userProfileData.xp || 0; const xpNeeded = getLevelRequirement(level); const progressPercent = Math.min(100, Math.max(0, (currentXp / xpNeeded) * 100));
  const lidosSet = new Set(historyData.map(h => h.mangaId)); const obrasLidasIds = Array.from(lidosSet); const libraryMangaIds = Object.keys(libraryData); const libraryMangas = mangas.filter(m => libraryMangaIds.includes(m.id));
  const eq = userProfileData.equipped_items || {};

  const activeAvatarSrc = (eq.avatar?.preview ? cleanCosmeticUrl(eq.avatar.preview) : null) || avatarBase64 || `https://placehold.co/150x150/020408/22d3ee?text=U`;

  return (
    <div className="animate-in fade-in duration-500 w-full pb-24 font-sans min-h-screen text-gray-200 bg-[#020408] relative">
      
      <div className="absolute top-0 left-0 w-full h-[500px] bg-gradient-to-b from-cyan-900/20 via-[#020408]/60 to-[#020408] pointer-events-none z-0"></div>

      {confirmAction && (
          <div className="fixed inset-0 z-[3000] bg-black/90 backdrop-blur-sm flex items-center justify-center p-4 animate-in fade-in duration-300">
              <div className="bg-[#0a0f16] border border-rose-500/20 p-8 rounded-3xl max-w-sm w-full text-center shadow-2xl">
                  <AlertTriangle className="w-12 h-12 text-rose-500 mx-auto mb-4" />
                  <h3 className="text-xl font-black text-white mb-2 uppercase tracking-tight">Confirmar Ação?</h3>
                  <p className="text-sm text-gray-400 mb-8 font-medium">{confirmAction === 'history' ? 'Isso apagará permanentemente seu histórico de leitura.' : 'O aplicativo será recarregado para limpar o cache.'}</p>
                  <div className="flex gap-4">
                      <button onClick={() => setConfirmAction(null)} className="flex-1 bg-transparent border border-white/10 text-gray-300 font-bold py-3.5 rounded-xl hover:bg-white/5 transition-colors text-xs uppercase tracking-widest">Recuar</button>
                      <button onClick={executeConfirmAction} className="flex-1 bg-rose-600/20 text-rose-500 border border-rose-500/40 font-bold py-3.5 rounded-xl transition-colors hover:bg-rose-500 hover:text-white text-xs uppercase tracking-widest">Confirmar</button>
                  </div>
              </div>
          </div>
      )}

      <div className="w-full h-[180px] md:h-[240px] relative group overflow-hidden z-10">
        {cleanCosmeticUrl(eq.capa_fundo?.preview) ? ( 
            <img src={cleanCosmeticUrl(eq.capa_fundo.preview)} className={`w-full h-full object-cover object-center opacity-80 ${eq.capa_fundo.cssClass || ''}`} /> 
        ) : coverBase64 ? ( 
            <img src={coverBase64} className="w-full h-full object-cover object-center opacity-60" /> 
        ) : ( 
            <div className={`w-full h-full bg-gradient-to-br from-cyan-900/40 to-emerald-900/20 ${eq.capa_fundo?.cssClass || ''}`} /> 
        )}
        <div className="absolute inset-x-0 bottom-0 h-24 bg-gradient-to-t from-[#020408] via-[#020408]/50 to-transparent" />
        
        {isEditing && (
            <button onClick={() => coverInputRef.current.click()} className="absolute top-4 right-4 bg-black/60 backdrop-blur-md text-white px-4 py-2 rounded-full flex items-center gap-2 text-xs font-bold z-10 hover:bg-cyan-500 hover:text-black transition-all border border-white/20 shadow-lg">
                <Camera className="w-4 h-4" /> Alterar Capa
            </button>
        )}
        <input type="file" accept="image/*" ref={coverInputRef} className="hidden" onChange={(e) => handleImageUpload(e, 'cover')} />
      </div>

      <div className="max-w-4xl mx-auto px-4 sm:px-6 relative z-20 -mt-16 md:-mt-20">
        
        <div className="flex flex-col md:flex-row md:items-end gap-5 mb-8">
          
          <div className="relative w-28 h-28 md:w-36 md:h-36 flex-shrink-0 group">
            <div className="w-full h-full bg-[#020408] rounded-full p-1.5 relative z-10 shadow-[0_10px_30px_rgba(0,0,0,0.5)]">
               <img src={activeAvatarSrc} className={`w-full h-full rounded-full object-cover border border-white/10 ${eq.avatar?.cssClass || ''}`} alt="Avatar" />
            </div>
            
            {cleanCosmeticUrl(eq.moldura?.preview) && ( 
                <img src={cleanCosmeticUrl(eq.moldura.preview)} className={`absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[135%] h-[135%] max-w-none object-contain object-center z-30 pointer-events-none ${eq.moldura.cssClass || ''}`} /> 
            )}

            {isEditing && <button onClick={() => avatarInputRef.current.click()} className="absolute bottom-1 right-1 bg-cyan-500 text-black p-2.5 rounded-full z-50 border-4 border-[#020408] hover:bg-cyan-400 transition-colors shadow-lg"><Camera className="w-4 h-4" /></button>}
            <input type="file" accept="image/*" ref={avatarInputRef} className="hidden" onChange={(e) => handleImageUpload(e, 'avatar')} />
          </div>

          <div className="flex-1 pb-1 text-left">
            <div className="flex items-center gap-3 mb-1">
                <h1 className={`text-2xl md:text-3xl font-black tracking-tight text-white drop-shadow-md ${eq.nickname ? eq.nickname.cssClass : ''}`}>
                    {name || 'Usuário'}
                </h1>
                <span className="bg-cyan-500/10 border border-cyan-500/20 text-cyan-400 font-black text-[10px] px-2.5 py-1 rounded-lg uppercase tracking-widest backdrop-blur-sm">
                    Nível {level}
                </span>
            </div>
            <p className="text-gray-400 font-medium text-xs mb-3">{user.email}</p>
            
            <div className="w-full mt-5">
              <div className="flex justify-between items-end mb-2">
                  <span className="text-[10px] font-black text-emerald-500 uppercase tracking-widest flex items-center gap-1"><Trophy className="w-3 h-3"/> {getLevelTitle(level)}</span>
                  <span className="text-[10px] font-black text-gray-400 uppercase tracking-widest">{currentXp} <span className="text-gray-600">/ {xpNeeded} XP</span></span>
              </div>
              <div className="w-full h-1.5 bg-white/5 rounded-full overflow-hidden">
                   <div className="h-full bg-gradient-to-r from-cyan-400 to-emerald-400 shadow-[0_0_10px_rgba(52,211,153,0.5)] transition-all duration-1000 ease-out" style={{ width: `${progressPercent}%` }}></div>
              </div>
            </div>
          </div>
        </div>

        {bio && !isEditing && (
            <div className="mb-8">
                <p className="text-gray-300 text-sm font-medium bg-white/[0.02] p-4 rounded-2xl border border-white/5 leading-relaxed">{bio}</p>
            </div>
        )}

        {isEditing && (
          <form onSubmit={handleSave} className="bg-white/[0.02] border border-cyan-500/20 rounded-3xl p-6 md:p-8 mb-8 shadow-xl">
            <div className="space-y-5">
              <div>
                 <label className="block text-[10px] font-black text-cyan-500 mb-2 uppercase tracking-widest">Nome de Exibição</label>
                 <input type="text" value={name} onChange={e => setName(e.target.value)} className="w-full bg-[#020408] border border-white/5 rounded-xl px-4 py-3.5 text-white text-sm font-medium outline-none focus:border-cyan-500 transition-colors"/>
              </div>
              <div>
                 <label className="block text-[10px] font-black text-cyan-500 mb-2 uppercase tracking-widest">Biografia / Descrição</label>
                 <textarea value={bio} onChange={e => setBio(e.target.value)} rows={3} className="w-full bg-[#020408] border border-white/5 rounded-xl px-4 py-3.5 text-white text-sm font-medium resize-none outline-none focus:border-cyan-500 transition-colors"></textarea>
              </div>
            </div>
            <button type="submit" disabled={loading} className="mt-6 bg-cyan-500 text-black text-xs font-black px-8 py-3.5 rounded-xl w-full flex justify-center hover:bg-cyan-400 transition-all uppercase tracking-widest">{loading ? <Loader2 className="w-4 h-4 animate-spin"/> : 'Salvar Alterações'}</button>
          </form>
        )}

        <div className="flex gap-3 mb-10 w-full">
            <button onClick={() => setIsEditing(!isEditing)} className="flex-1 bg-white/5 border border-white/10 text-white px-6 py-3.5 rounded-2xl text-xs font-bold hover:bg-white/10 transition-all flex items-center justify-center gap-2 backdrop-blur-sm">
                <Edit3 className="w-4 h-4" /> {isEditing ? 'Cancelar Edição' : 'Editar Perfil'}
            </button>
            <button onClick={onLogout} className="bg-white/5 text-gray-400 p-3.5 rounded-2xl hover:bg-rose-500/20 hover:text-rose-400 hover:border-rose-500/30 transition-all border border-white/10 backdrop-blur-sm">
                <LogOut className="w-5 h-5" />
            </button>
        </div>

        <div className="mb-8 border-b border-white/5">
          <div className="flex gap-6 overflow-x-auto no-scrollbar snap-x px-1">
            {['Resumo', 'Histórico', 'Configurações'].map((tab) => (
              <button key={tab} onClick={() => setActiveTab(tab)} className={`snap-start px-2 pb-3 font-bold transition-all whitespace-nowrap text-sm flex items-center gap-2 relative group ${activeTab === tab ? 'text-white' : 'text-gray-500 hover:text-gray-300'}`}>
                {tab}
                {activeTab === tab && (
                    <div className="absolute bottom-[-1px] left-0 w-full h-[2px] bg-cyan-500 rounded-t-full shadow-[0_0_8px_rgba(34,211,238,0.8)]"></div>
                )}
              </button>
            ))}
          </div>
        </div>
        
        {activeTab === "Resumo" && (
          <div className="animate-in fade-in duration-300">
            <div className="grid grid-cols-2 md:grid-cols-4 gap-3 sm:gap-4">
                
                <div className="bg-white/[0.02] border border-white/5 rounded-2xl p-5 flex flex-col justify-center shadow-lg hover:border-cyan-500/30 transition-colors group">
                    <div className="flex items-center gap-2 mb-3">
                        <Library className="w-4 h-4 text-cyan-400" />
                        <span className="text-[10px] text-gray-400 font-bold uppercase tracking-widest">Obras Salvas</span>
                    </div>
                    <span className="text-3xl font-black text-white group-hover:text-cyan-400 transition-colors">{!dataLoaded ? <Loader2 className="w-5 h-5 animate-spin"/> : Object.keys(libraryData).length}</span>
                </div>

                <div className="bg-white/[0.02] border border-white/5 rounded-2xl p-5 flex flex-col justify-center shadow-lg hover:border-emerald-500/30 transition-colors group">
                    <div className="flex items-center gap-2 mb-3">
                        <BookOpen className="w-4 h-4 text-emerald-400" />
                        <span className="text-[10px] text-gray-400 font-bold uppercase tracking-widest">Caps. Lidos</span>
                    </div>
                    <span className="text-3xl font-black text-white group-hover:text-emerald-400 transition-colors">{!dataLoaded ? <Loader2 className="w-5 h-5 animate-spin"/> : historyData.length}</span>
                </div>

                <div className="bg-white/[0.02] border border-white/5 rounded-2xl p-5 flex flex-col justify-center shadow-lg hover:border-teal-500/30 transition-colors group">
                    <div className="flex items-center gap-2 mb-3">
                        <Compass className="w-4 h-4 text-teal-400" />
                        <span className="text-[10px] text-gray-400 font-bold uppercase tracking-widest">Iniciadas</span>
                    </div>
                    <span className="text-3xl font-black text-white group-hover:text-teal-400 transition-colors">{!dataLoaded ? <Loader2 className="w-5 h-5 animate-spin"/> : obrasLidasIds.length}</span>
                </div>

                <div className="bg-white/[0.02] border border-white/5 rounded-2xl p-5 flex flex-col justify-center shadow-lg hover:border-indigo-500/30 transition-colors group">
                    <div className="flex items-center gap-2 mb-3">
                        <LayoutTemplate className="w-4 h-4 text-indigo-400" />
                        <span className="text-[10px] text-gray-400 font-bold uppercase tracking-widest">Patente</span>
                    </div>
                    <span className="text-sm font-black text-white group-hover:text-indigo-400 transition-colors truncate">{getLevelTitle(level).split(' ')[0]}</span>
                </div>

            </div>
          </div>
        )}

        {activeTab === "Histórico" && (
            <div className="bg-white/[0.02] p-6 rounded-3xl border border-white/5 shadow-lg animate-in fade-in duration-300">
                {historyData.length === 0 ? (
                    <div className="text-center py-12"><History className="w-10 h-10 mx-auto text-gray-600 mb-3"/><p className="text-gray-500 text-xs font-bold uppercase tracking-widest">Nenhuma leitura recente.</p></div>
                ) : (
                   <div className="flex flex-col gap-3">
                      {historyData.slice(0, 15).map(hist => {
                          const mg = mangas.find(m => m.id === hist.mangaId);
                          return (
                              <div key={hist.id} onClick={() => { if(mg) onNavigate('details', mg); }} className="bg-[#020408] border border-white/5 p-3 rounded-2xl flex items-center gap-4 cursor-pointer hover:border-cyan-500/30 transition-colors group">
                                  <div className="w-12 h-16 rounded-xl overflow-hidden bg-[#0A0E17] flex-shrink-0">{mg ? <img src={mg.coverUrl} className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500" /> : <BookOpen className="w-5 h-5 m-auto mt-5 text-gray-700"/>}</div>
                                  <div className="flex-1">
                                      <h4 className="font-bold text-sm text-gray-200 line-clamp-1 group-hover:text-cyan-400 transition-colors">{hist.mangaTitle}</h4>
                                      <p className="text-emerald-500 font-bold text-[10px] mt-1 uppercase tracking-wider">Capítulo {hist.chapterNumber}</p>
                                  </div>
                                  <div className="hidden sm:block text-right pr-2">
                                     <p className="text-[10px] text-gray-600 font-bold">{new Date(hist.timestamp).toLocaleDateString()}</p>
                                  </div>
                              </div>
                          )
                      })}
                      <button onClick={() => setConfirmAction('history')} className="mt-6 w-full py-4 bg-transparent border border-rose-500/20 text-rose-500 font-black text-[10px] uppercase tracking-widest rounded-2xl hover:bg-rose-500/10 transition-colors flex justify-center items-center gap-2"><Trash2 className="w-4 h-4"/> Purificar Histórico</button>
                   </div>
                )}
            </div>
        )}

        {activeTab === "Configurações" && (
            <div className="animate-in fade-in duration-300 space-y-4">
                <div className="bg-white/[0.02] border border-white/5 rounded-3xl p-6 md:p-8 shadow-lg">
                  <h3 className="text-sm font-black text-white mb-6 uppercase tracking-widest flex items-center gap-3 border-b border-white/5 pb-4"><Settings className="w-5 h-5 text-cyan-400"/> Sistema</h3>
                  
                  <div className="flex items-center justify-between mb-8">
                    <div>
                      <p className="text-sm font-bold text-gray-200">Modo de Leitura</p>
                      <p className="text-[10px] text-gray-500 mt-1 uppercase font-bold tracking-widest">Orientação visual.</p>
                    </div>
                    <select value={userSettings?.readMode || 'Cascata'} onChange={(e) => { updateSettings({ readMode: e.target.value }); showToast("Matriz atualizada.", "success"); }} className="bg-[#020408] border border-white/10 text-cyan-400 text-xs font-bold rounded-xl px-4 py-3 outline-none focus:border-cyan-500 shadow-inner">
                      <option value="Cascata">Cascata</option>
                      <option value="Paginação">Páginas</option>
                    </select>
                  </div>

                  <div className="flex items-center justify-between mb-8">
                    <div>
                      <p className="text-sm font-bold text-gray-200">Otimização de Fluxo</p>
                      <p className="text-[10px] text-gray-500 mt-1 uppercase font-bold tracking-widest">Economia de dados.</p>
                    </div>
                    <label className="relative inline-flex items-center cursor-pointer">
                      <input type="checkbox" className="sr-only peer" checked={userSettings?.dataSaver || false} onChange={(e) => { updateSettings({ dataSaver: e.target.checked }); showToast("Fluxo atualizado.", "success"); }} />
                      <div className="w-12 h-6 bg-[#020408] border border-white/10 rounded-full peer peer-checked:after:translate-x-full after:absolute after:top-[2px] after:left-[2px] after:bg-gray-600 peer-checked:after:bg-white after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-cyan-500 peer-checked:border-cyan-400"></div>
                    </label>
                  </div>

                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-bold text-gray-200">Espectro de Cor</p>
                      <p className="text-[10px] text-gray-500 mt-1 uppercase font-bold tracking-widest">Aura da interface.</p>
                    </div>
                    <select value={userSettings?.theme || 'Escuro'} onChange={(e) => { updateSettings({ theme: e.target.value }); showToast("Espectro aplicado.", "success"); }} className="bg-[#020408] border border-white/10 text-cyan-400 text-xs font-bold rounded-xl px-4 py-3 outline-none focus:border-cyan-500 shadow-inner">
                      <option value="Escuro">Escuro</option>
                      <option value="Amoled">AMOLED</option>
                    </select>
                  </div>
                </div>

                <div className="bg-white/[0.02] border border-white/5 rounded-3xl p-6">
                    <button onClick={() => setConfirmAction('cache')} className="flex items-center justify-between w-full text-left group px-2">
                        <div>
                            <p className="text-sm font-bold text-gray-300 group-hover:text-cyan-400 transition-colors">Reiniciar Conexão (Limpar Cache)</p>
                            <p className="text-[10px] text-gray-500 mt-1 uppercase font-bold tracking-widest">Resolve falhas na matriz e lentidão.</p>
                        </div>
                        <RefreshCw className="w-5 h-5 text-gray-500 group-hover:text-cyan-400 group-hover:rotate-180 transition-all duration-700" />
                    </button>
                </div>
            </div>
        )}
      </div>
    </div>
  );
}
