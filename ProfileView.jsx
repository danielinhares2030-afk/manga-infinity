import React, { useState, useEffect, useRef } from 'react';
import { Compass, History, Library, Smartphone, Camera, Edit3, LogOut, Loader2, BookOpen, AlertTriangle, Trophy, Zap, Trash2, RefreshCw, LayoutTemplate, Settings } from 'lucide-react';
import { updateProfile } from "firebase/auth";
import { doc, setDoc, deleteDoc } from "firebase/firestore";
import { auth, db } from './firebase';
import { APP_ID } from './constants';
import { compressImage, getLevelRequirement, getLevelTitle, cleanCosmeticUrl } from './helpers';

export function ProfileView({ user, userProfileData, historyData, libraryData, dataLoaded, userSettings, updateSettings, onLogout, onUpdateData, showToast, mangas, onNavigate }) {
  const [isEditing, setIsEditing] = useState(false);
  const [activeTab, setActiveTab] = useState("Estatísticas"); 
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
    try { await updateProfile(auth.currentUser, { displayName: name }); const docData = { coverUrl: coverBase64, avatarUrl: avatarBase64, bio: bio }; await setDoc(doc(db, 'artifacts', APP_ID, 'users', user.uid, 'profile', 'main'), docData, { merge: true }); onUpdateData(docData); showToast('Perfil atualizado!', 'success'); setIsEditing(false); } catch (error) { showToast(`Erro ao salvar.`, 'error'); } finally { setLoading(false); }
  };

  const executeConfirmAction = async () => {
      if (confirmAction === 'history') { try { historyData.forEach(async (h) => { await deleteDoc(doc(db, 'artifacts', APP_ID, 'users', user.uid, 'history', h.id)); }); showToast("Memórias apagadas.", "success"); } catch(e) { showToast("Erro ao limpar.", "error"); } } 
      else if (confirmAction === 'cache') { localStorage.clear(); sessionStorage.clear(); window.location.reload(true); }
      setConfirmAction(null);
  };

  const level = userProfileData.level || 1; const currentXp = userProfileData.xp || 0; const xpNeeded = getLevelRequirement(level); const progressPercent = Math.min(100, Math.max(0, (currentXp / xpNeeded) * 100));
  const lidosSet = new Set(historyData.map(h => h.mangaId)); const obrasLidasIds = Array.from(lidosSet); const libraryMangaIds = Object.keys(libraryData); const libraryMangas = mangas.filter(m => libraryMangaIds.includes(m.id));
  const eq = userProfileData.equipped_items || {};

  const activeAvatarSrc = (eq.avatar?.preview ? cleanCosmeticUrl(eq.avatar.preview) : null) || avatarBase64 || `https://placehold.co/150x150/0f0f0f/22d3ee?text=U`;

  return (
    <div className={`animate-in fade-in duration-500 w-full pb-24 font-sans min-h-screen text-gray-200 bg-[#0f0f0f]`}>
      
      {confirmAction && (
          <div className="fixed inset-0 z-[3000] bg-black/80 flex items-center justify-center p-4 animate-in fade-in duration-300">
              <div className="bg-[#1a1a1a] border border-white/10 p-6 rounded-2xl max-w-sm w-full text-center shadow-2xl">
                  <AlertTriangle className="w-12 h-12 text-red-500 mx-auto mb-4" />
                  <h3 className="text-lg font-bold text-white mb-2">{confirmAction === 'history' ? 'Limpar Histórico?' : 'Reiniciar App?'}</h3>
                  <p className="text-sm text-gray-400 mb-6">{confirmAction === 'history' ? 'Esta ação não pode ser desfeita.' : 'A interface será recarregada.'}</p>
                  <div className="flex gap-3">
                      <button onClick={() => setConfirmAction(null)} className="flex-1 bg-white/5 border border-white/10 text-white font-bold py-3 rounded-full hover:bg-white/10 transition-colors text-sm">Cancelar</button>
                      <button onClick={executeConfirmAction} className="flex-1 bg-red-500/20 text-red-500 border border-red-500/30 font-bold py-3 rounded-full transition-colors hover:bg-red-500 hover:text-white text-sm">Confirmar</button>
                  </div>
              </div>
          </div>
      )}

      {/* ========================================================= */}
      {/* 1. CAPA DE FUNDO (Ponta a ponta, sem bordas redondas)     */}
      {/* ========================================================= */}
      <div className="w-full h-[200px] relative group bg-black">
        {cleanCosmeticUrl(eq.capa_fundo?.preview) ? ( 
            <img src={cleanCosmeticUrl(eq.capa_fundo.preview)} className="w-full h-full object-cover opacity-90" /> 
        ) : coverBase64 ? ( 
            <img src={coverBase64} className="w-full h-full object-cover opacity-80" /> 
        ) : ( 
            <div className="w-full h-full bg-gradient-to-br from-cyan-900/30 to-indigo-900/30" /> 
        )}
        
        {isEditing && (
            <button onClick={() => coverInputRef.current.click()} className="absolute top-4 right-4 bg-black/60 backdrop-blur-md text-white px-4 py-2 rounded-full flex items-center gap-2 text-xs font-bold z-10 hover:bg-white/20 transition-all border border-white/20">
                <Camera className="w-4 h-4" /> Capa
            </button>
        )}
        <input type="file" accept="image/*" ref={coverInputRef} className="hidden" onChange={(e) => handleImageUpload(e, 'cover')} />
      </div>

      {/* ========================================================= */}
      {/* 2. CABEÇALHO DO PERFIL (Avatar + Info + Botões)           */}
      {/* ========================================================= */}
      <div className="px-4 max-w-4xl mx-auto relative w-full">
        
        {/* Avatar alinhado à esquerda e sobrepondo a capa */}
        <div className={`relative w-[100px] h-[100px] -mt-[50px] mb-3 flex-shrink-0 group ${(!eq.moldura?.preview && eq.moldura) ? eq.moldura.cssClass : ''}`}>
          <div className="w-full h-full rounded-full bg-[#0f0f0f] border-4 border-[#0f0f0f] flex items-center justify-center relative z-10 overflow-hidden">
             <img src={activeAvatarSrc} className={`w-full h-full object-cover ${eq.avatar?.cssClass || ''}`} alt="Avatar" />
          </div>
          {cleanCosmeticUrl(eq.particulas?.preview) && ( <img src={cleanCosmeticUrl(eq.particulas.preview)} className={`absolute inset-[-50%] m-auto w-[200%] h-[200%] object-contain z-0 ${eq.particulas.cssClass || ''}`} style={{ mixBlendMode: 'screen', pointerEvents: 'none' }} /> )}
          {cleanCosmeticUrl(eq.efeito?.preview) && ( <img src={cleanCosmeticUrl(eq.efeito.preview)} className={`absolute inset-0 m-auto w-full h-full object-contain z-20 ${eq.efeito.cssClass || ''}`} style={{ mixBlendMode: 'screen', pointerEvents: 'none' }} /> )}
          {cleanCosmeticUrl(eq.moldura?.preview) && ( <img src={cleanCosmeticUrl(eq.moldura.preview)} className={`absolute inset-[-15%] m-auto w-[130%] h-[130%] object-contain z-30 ${eq.moldura.cssClass || ''}`} style={{ mixBlendMode: 'screen', pointerEvents: 'none' }} /> )}

          {isEditing && <button onClick={() => avatarInputRef.current.click()} className="absolute bottom-0 right-0 bg-[#1a1a1a] text-white p-2 rounded-full z-50 border-2 border-[#0f0f0f] hover:bg-gray-800 transition-colors"><Camera className="w-4 h-4" /></button>}
          <input type="file" accept="image/*" ref={avatarInputRef} className="hidden" onChange={(e) => handleImageUpload(e, 'avatar')} />
        </div>

        {/* Informações do Usuário */}
        <div className="mb-5">
            <div className="flex items-center gap-3 mb-1">
                <h1 className={`text-2xl font-bold tracking-tight text-white ${eq.nickname?.cssClass || ''}`}>{name || 'Usuário'}</h1>
                <span className="bg-cyan-900/60 text-cyan-400 font-bold text-[10px] px-2.5 py-1 rounded-full uppercase tracking-wider">
                    {getLevelTitle(level)}
                </span>
            </div>
            <p className="text-gray-400 text-sm">{user.email}</p>
            {bio && !isEditing && <p className="text-gray-300 text-sm mt-3">{bio}</p>}
            <p className="text-gray-400 text-sm mt-3"><strong className="text-white">{currentXp}</strong> XP <span className="mx-2">•</span> <strong className="text-white">LVL {level}</strong></p>
        </div>

        {/* Botões de Ação */}
        {isEditing ? (
            <form onSubmit={handleSave} className="bg-[#1a1a1a] border border-white/10 rounded-2xl p-6 mb-6">
              <div className="space-y-4">
                <div>
                   <label className="block text-xs font-bold text-gray-400 mb-1">Nome</label>
                   <input type="text" value={name} onChange={e => setName(e.target.value)} className="w-full bg-[#0f0f0f] border border-white/10 rounded-xl px-4 py-3 text-white text-sm outline-none focus:border-cyan-500 transition-colors"/>
                </div>
                <div>
                   <label className="block text-xs font-bold text-gray-400 mb-1">Biografia</label>
                   <textarea value={bio} onChange={e => setBio(e.target.value)} rows={3} className="w-full bg-[#0f0f0f] border border-white/10 rounded-xl px-4 py-3 text-white text-sm resize-none outline-none focus:border-cyan-500 transition-colors"></textarea>
                </div>
              </div>
              <div className="flex gap-3 mt-6">
                <button type="button" onClick={() => setIsEditing(false)} className="flex-1 bg-transparent border border-white/20 text-white font-bold py-3 rounded-full hover:bg-white/5 transition-all text-sm">Cancelar</button>
                <button type="submit" disabled={loading} className="flex-1 bg-cyan-600 text-white font-bold py-3 rounded-full hover:bg-cyan-500 transition-all text-sm flex justify-center">{loading ? <Loader2 className="w-5 h-5 animate-spin"/> : 'Salvar'}</button>
              </div>
            </form>
        ) : (
            <div className="flex gap-3 items-center">
                <button onClick={() => setIsEditing(true)} className="flex-1 bg-transparent border border-white/20 text-white font-bold py-2.5 rounded-full text-sm hover:bg-white/5 transition-colors flex justify-center items-center gap-2">
                    <Edit3 className="w-4 h-4" /> Editar perfil
                </button>
                <button onClick={() => setActiveTab("Configurações")} className="bg-transparent border border-white/20 text-white p-2.5 rounded-full hover:bg-white/5 transition-colors">
                    <Settings className="w-5 h-5" />
                </button>
            </div>
        )}
      </div>

      {/* ========================================================= */}
      {/* 3. ABAS (Estilo sublinhado)                               */}
      {/* ========================================================= */}
      <div className="max-w-4xl mx-auto w-full mt-4 border-b border-white/10">
        <div className="flex gap-6 overflow-x-auto no-scrollbar px-4">
          {['Estatísticas', 'Histórico', 'Biblioteca', 'Configurações'].map((tab) => (
            <button 
                key={tab} 
                onClick={() => setActiveTab(tab)} 
                className={`pb-3 font-bold whitespace-nowrap text-sm transition-colors relative
                ${activeTab === tab ? 'text-white' : 'text-gray-500 hover:text-gray-300'}`}
            >
              {tab}
              {activeTab === tab && (
                  <div className="absolute bottom-0 left-0 w-full h-[3px] bg-cyan-500 rounded-t-full"></div>
              )}
            </button>
          ))}
        </div>
      </div>

      {/* ========================================================= */}
      {/* 4. ÁREA DE CONTEÚDO                                       */}
      {/* ========================================================= */}
      <div className="max-w-4xl mx-auto px-4 mt-6">
        
        {activeTab === "Estatísticas" && (
            <div className="animate-in fade-in">
                <div className="flex items-center justify-between mb-4">
                    <h2 className="text-xl font-bold text-white">Estatísticas</h2>
                    <Trophy className="w-5 h-5 text-cyan-500" />
                </div>
                
                <div className="bg-[#141414] rounded-[24px] p-6 border border-white/5">
                    <div className="grid grid-cols-2 gap-6">
                        <div className="flex items-center gap-4 bg-[#1a1a1a] p-4 rounded-2xl">
                            <div className="w-12 h-12 rounded-xl bg-cyan-900/30 flex items-center justify-center">
                                <Library className="w-6 h-6 text-cyan-400" />
                            </div>
                            <div>
                                <h3 className="text-xl font-bold text-white">{!dataLoaded ? <Loader2 className="w-4 h-4 animate-spin"/> : Object.keys(libraryData).length}</h3>
                                <p className="text-[10px] text-gray-500 uppercase font-bold tracking-wider">Obras Salvas</p>
                            </div>
                        </div>
                        <div className="flex items-center gap-4 bg-[#1a1a1a] p-4 rounded-2xl">
                            <div className="w-12 h-12 rounded-xl bg-indigo-900/30 flex items-center justify-center">
                                <BookOpen className="w-6 h-6 text-indigo-400" />
                            </div>
                            <div>
                                <h3 className="text-xl font-bold text-white">{!dataLoaded ? <Loader2 className="w-4 h-4 animate-spin"/> : historyData.length}</h3>
                                <p className="text-[10px] text-gray-500 uppercase font-bold tracking-wider">Caps. Lidos</p>
                            </div>
                        </div>
                    </div>

                    {/* Progresso do Nível dentro das Estatísticas */}
                    <div className="mt-6 bg-[#1a1a1a] p-5 rounded-2xl">
                        <div className="flex justify-between items-end mb-2">
                            <div>
                                <span className="text-[10px] font-bold text-gray-500 uppercase tracking-widest block mb-1">Poder de Caçador</span>
                                <span className="text-sm font-bold text-white">LVL {level}</span>
                            </div>
                            <span className="text-sm font-bold text-white">{currentXp} <span className="text-gray-500 text-xs">/ {xpNeeded}</span></span>
                        </div>
                        <div className="w-full h-2 bg-black rounded-full overflow-hidden">
                            <div className="h-full bg-gradient-to-r from-cyan-500 to-indigo-500 transition-all duration-1000" style={{ width: `${progressPercent}%` }}></div>
                        </div>
                    </div>
                </div>
            </div>
        )}

        {activeTab === "Histórico" && (
            <div className="animate-in fade-in">
                <div className="flex items-center justify-between mb-4">
                    <h2 className="text-xl font-bold text-white">Histórico de Leitura</h2>
                </div>
                <div className="bg-[#141414] rounded-[24px] p-6 border border-white/5">
                    {historyData.length === 0 ? (
                        <div className="text-center py-10"><History className="w-10 h-10 mx-auto text-gray-600 mb-3"/><p className="text-gray-500 text-sm font-medium">Nenhuma leitura recente.</p></div>
                    ) : (
                       <div className="flex flex-col gap-4">
                          {historyData.slice(0, 15).map(hist => {
                              const mg = mangas.find(m => m.id === hist.mangaId);
                              return (
                                  <div key={hist.id} onClick={() => { if(mg) onNavigate('details', mg); }} className="flex items-center gap-4 cursor-pointer hover:bg-white/5 p-2 rounded-xl transition-colors">
                                      <div className="w-12 h-16 rounded-lg overflow-hidden bg-[#1a1a1a] flex-shrink-0 border border-white/5">{mg ? <img src={mg.coverUrl} className="w-full h-full object-cover" /> : <BookOpen className="w-5 h-5 m-auto mt-5 text-gray-700"/>}</div>
                                      <div className="flex-1"><h4 className="font-bold text-sm text-white line-clamp-1">{hist.mangaTitle}</h4><p className="text-gray-400 text-xs mt-1">Capítulo {hist.chapterNumber}</p></div>
                                      <p className="text-xs text-gray-600 font-medium">{new Date(hist.timestamp).toLocaleDateString()}</p>
                                  </div>
                              )
                          })}
                          <button onClick={() => setConfirmAction('history')} className="mt-4 w-full py-3 bg-transparent border border-red-500/20 text-red-500 font-bold text-sm rounded-full hover:bg-red-500/10 transition-colors flex justify-center items-center gap-2"><Trash2 className="w-4 h-4"/> Limpar Histórico</button>
                       </div>
                    )}
                </div>
            </div>
        )}

        {activeTab === "Biblioteca" && (
            <div className="animate-in fade-in">
                <div className="flex items-center justify-between mb-4">
                    <h2 className="text-xl font-bold text-white">Sua Biblioteca</h2>
                </div>
                <div className="bg-[#141414] rounded-[24px] p-6 border border-white/5">
                    {libraryMangas.length === 0 ? (
                        <div className="text-center py-10"><Library className="w-10 h-10 mx-auto text-gray-600 mb-3"/><p className="text-gray-500 text-sm font-medium">Nenhuma obra salva.</p></div>
                    ) : (
                        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
                            {libraryMangas.map(mg => (
                                <div key={mg.id} onClick={() => onNavigate('details', mg)} className="cursor-pointer group">
                                    <div className="aspect-[2/3] w-full rounded-xl overflow-hidden relative border border-white/5 bg-[#1a1a1a]">
                                        <img src={mg.coverUrl} className="w-full h-full object-cover" />
                                        <div className="absolute top-2 right-2 bg-black/80 px-2 py-1 rounded border border-white/10">
                                            <span className="text-[10px] font-bold text-white">{libraryData[mg.id]}</span>
                                        </div>
                                    </div>
                                    <h4 className="font-bold text-xs text-gray-300 line-clamp-1 mt-2 px-1">{mg.title}</h4>
                                </div>
                            ))}
                        </div>
                    )}
                </div>
            </div>
        )}

        {activeTab === "Configurações" && (
            <div className="animate-in fade-in space-y-4">
                <div className="bg-[#141414] border border-white/5 rounded-[24px] p-6">
                  <h3 className="text-lg font-bold text-white mb-6">Opções do Aplicativo</h3>
                  
                  <div className="flex items-center justify-between mb-6">
                    <div>
                      <p className="text-sm font-bold text-white">Modo de Leitura</p>
                      <p className="text-xs text-gray-500 mt-1">Como os capítulos serão exibidos.</p>
                    </div>
                    <select value={userSettings?.readMode || 'Cascata'} onChange={(e) => { updateSettings({ readMode: e.target.value }); showToast("Atualizado.", "success"); }} className="bg-[#1a1a1a] border border-white/10 text-white text-sm font-bold rounded-xl px-4 py-2 outline-none focus:border-cyan-500">
                      <option value="Cascata">Cascata</option>
                      <option value="Paginação">Páginas</option>
                    </select>
                  </div>

                  <div className="flex items-center justify-between mb-6">
                    <div>
                      <p className="text-sm font-bold text-white">Economia de Dados</p>
                      <p className="text-xs text-gray-500 mt-1">Carregar imagens em menor qualidade.</p>
                    </div>
                    <label className="relative inline-flex items-center cursor-pointer">
                      <input type="checkbox" className="sr-only peer" checked={userSettings?.dataSaver || false} onChange={(e) => { updateSettings({ dataSaver: e.target.checked }); showToast("Atualizado.", "success"); }} />
                      <div className="w-11 h-6 bg-[#1a1a1a] border border-white/10 rounded-full peer peer-checked:after:translate-x-full after:absolute after:top-[2px] after:left-[2px] after:bg-gray-400 peer-checked:after:bg-white after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-cyan-500"></div>
                    </label>
                  </div>

                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-bold text-white">Tema Visual</p>
                      <p className="text-xs text-gray-500 mt-1">Padrão de cores do site.</p>
                    </div>
                    <select value={userSettings?.theme || 'Escuro'} onChange={(e) => { updateSettings({ theme: e.target.value }); showToast("Tema aplicado.", "success"); }} className="bg-[#1a1a1a] border border-white/10 text-white text-sm font-bold rounded-xl px-4 py-2 outline-none focus:border-cyan-500">
                      <option value="Escuro">Escuro</option>
                      <option value="Amoled">AMOLED</option>
                    </select>
                  </div>
                </div>

                <div className="bg-[#141414] border border-white/5 rounded-[24px] p-6">
                    <button onClick={() => setConfirmAction('cache')} className="flex items-center justify-between w-full text-left group">
                        <div>
                            <p className="text-sm font-bold text-white">Limpar Cache</p>
                            <p className="text-xs text-gray-500 mt-1">Resolve lentidão e deslogamentos.</p>
                        </div>
                        <RefreshCw className="w-5 h-5 text-gray-500 group-hover:text-white group-hover:rotate-180 transition-all duration-500" />
                    </button>
                    <div className="w-full h-[1px] bg-white/5 my-6"></div>
                    <button onClick={onLogout} className="flex items-center justify-between w-full text-left group">
                        <div>
                            <p className="text-sm font-bold text-red-500">Sair da Conta</p>
                            <p className="text-xs text-gray-500 mt-1">Desconectar do dispositivo atual.</p>
                        </div>
                        <LogOut className="w-5 h-5 text-red-500 group-hover:translate-x-1 transition-transform" />
                    </button>
                </div>
            </div>
        )}
      </div>
    </div>
  );
}
