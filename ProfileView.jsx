import React, { useState, useEffect, useRef } from 'react';
import { Compass, History, Library, Smartphone, Camera, Edit3, LogOut, Loader2, BookOpen, AlertTriangle, Zap, Trophy, Coins, Hexagon, Trash2, RefreshCw, Palette, LayoutTemplate } from 'lucide-react';
import { updateProfile } from "firebase/auth";
import { doc, setDoc, deleteDoc } from "firebase/firestore";
import { auth, db } from './firebase';
import { APP_ID } from './constants';
import { compressImage, getLevelRequirement, getLevelTitle, cleanCosmeticUrl } from './helpers';

export function ProfileView({ user, userProfileData, historyData, libraryData, dataLoaded, userSettings, updateSettings, onLogout, onUpdateData, showToast, mangas, onNavigate }) {
  const [isEditing, setIsEditing] = useState(false);
  const [activeTab, setActiveTab] = useState("Estatisticas"); 
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
    try { await updateProfile(auth.currentUser, { displayName: name }); const docData = { coverUrl: coverBase64, avatarUrl: avatarBase64, bio: bio }; await setDoc(doc(db, 'artifacts', APP_ID, 'users', user.uid, 'profile', 'main'), docData, { merge: true }); onUpdateData(docData); showToast('Registro salvo no Infinito!', 'success'); setIsEditing(false); } catch (error) { showToast(`Erro ao gravar.`, 'error'); } finally { setLoading(false); }
  };

  const executeConfirmAction = async () => {
      if (confirmAction === 'history') { try { historyData.forEach(async (h) => { await deleteDoc(doc(db, 'artifacts', APP_ID, 'users', user.uid, 'history', h.id)); }); showToast("Rastro apagado do Vazio.", "success"); } catch(e) { showToast("Erro ao apagar histórico.", "error"); } } 
      else if (confirmAction === 'cache') { localStorage.clear(); sessionStorage.clear(); window.location.reload(true); }
      setConfirmAction(null);
  };

  const level = userProfileData.level || 1; const currentXp = userProfileData.xp || 0; const xpNeeded = getLevelRequirement(level); const progressPercent = Math.min(100, (currentXp / xpNeeded) * 100);
  const lidosSet = new Set(historyData.map(h => h.mangaId)); const obrasLidasIds = Array.from(lidosSet); const libraryMangaIds = Object.keys(libraryData); const libraryMangas = mangas.filter(m => libraryMangaIds.includes(m.id));
  const eq = userProfileData.equipped_items || {};

  const getAvatarSrc = () => {
    if (!eq.avatar) return null;
    const itemImg = eq.avatar.preview || eq.avatar.url || eq.avatar.img || eq.avatar.imagem || eq.avatar.image || eq.avatar.src || eq.avatar.foto || eq.avatar.link;
    return itemImg ? cleanCosmeticUrl(itemImg) : null;
  };
  const activeAvatarSrc = getAvatarSrc() || avatarBase64 || `https://placehold.co/150x150/020105/22d3ee?text=U`;

  return (
    <div className={`animate-in fade-in duration-500 w-full pb-20 font-sans min-h-screen text-gray-200 ${eq.tema_perfil ? eq.tema_perfil.cssClass : 'bg-[#010003]'}`}>
      
      {confirmAction && (
          <div className="fixed inset-0 z-[3000] bg-black/90 flex items-center justify-center p-4 animate-in fade-in duration-300">
              <div className="bg-[#05030a] border border-red-900/50 p-6 rounded-3xl max-w-sm w-full text-center relative overflow-hidden">
                  <div className="absolute top-0 left-0 w-full h-[2px] bg-gradient-to-r from-transparent via-red-500 to-transparent"></div>
                  <AlertTriangle className="w-12 h-12 text-red-500 mx-auto mb-4 animate-pulse" />
                  <h3 className="text-lg font-black text-white mb-2 uppercase tracking-widest">{confirmAction === 'history' ? 'Apagar Rastros?' : 'Limpar Sistema?'}</h3>
                  <p className="text-xs text-gray-400 font-medium mb-6 px-2">{confirmAction === 'history' ? 'Os registros de leitura serão varridos para sempre.' : 'Isso irá recarregar a interface e limpar arquivos temporários.'}</p>
                  <div className="flex gap-3">
                      <button onClick={() => setConfirmAction(null)} className="flex-1 bg-[#020105] text-gray-400 font-bold py-3.5 rounded-xl hover:text-white transition-colors text-xs uppercase tracking-widest">Cancelar</button>
                      <button onClick={executeConfirmAction} className="flex-1 bg-red-900 text-white font-black py-3.5 rounded-xl transition-colors hover:bg-red-800 text-xs uppercase tracking-widest">Confirmar</button>
                  </div>
              </div>
          </div>
      )}

      <div className="h-40 md:h-64 w-full bg-[#05030a] relative group border-b border-cyan-900/30 overflow-hidden">
        {cleanCosmeticUrl(eq.capa_fundo?.preview) ? ( <img src={cleanCosmeticUrl(eq.capa_fundo.preview)} onError={(e) => e.target.style.display = 'none'} className={`w-full h-full object-cover opacity-80 ${eq.capa_fundo.cssClass || ''}`} /> ) : coverBase64 ? ( <img src={coverBase64} className="w-full h-full object-cover opacity-60" /> ) : ( <div className={`w-full h-full bg-gradient-to-tr from-[#05030a] to-[#0f0a1e] ${eq.capa_fundo?.cssClass || ''}`} /> )}
        <div className="absolute inset-0 bg-gradient-to-t from-[#010003] via-transparent to-transparent" />
        {isEditing && <button onClick={() => coverInputRef.current.click()} className="absolute top-4 right-4 bg-black/80 text-cyan-100 px-4 py-2 rounded-xl flex items-center gap-2 text-xs uppercase tracking-widest font-black z-10 border border-cyan-500/30"><Camera className="w-4 h-4" /> Capa</button>}
        <input type="file" accept="image/*" ref={coverInputRef} className="hidden" onChange={(e) => handleImageUpload(e, 'cover')} />
      </div>

      <div className="max-w-4xl mx-auto px-4 sm:px-6 relative -mt-16 md:-mt-20 z-10">
        <div className="flex flex-col md:flex-row items-center md:items-end gap-6 mb-8">
          
          <div className={`relative w-28 h-28 md:w-36 md:h-36 rounded-full flex items-center justify-center flex-shrink-0 group ${(!eq.moldura?.preview && eq.moldura) ? eq.moldura.cssClass : ''}`}>
            <div className={`w-full h-full rounded-full bg-[#05030a] flex items-center justify-center relative z-10 overflow-hidden ${!eq.moldura ? 'border-4 border-[#010003]' : ''}`}>
               <img src={activeAvatarSrc} className={`w-full h-full object-cover ${eq.avatar?.cssClass || ''}`} alt="Avatar" onError={(e) => e.target.src = `https://placehold.co/150x150/020105/22d3ee?text=U`} />
            </div>
            
            {cleanCosmeticUrl(eq.particulas?.preview) && ( <img src={cleanCosmeticUrl(eq.particulas.preview)} onError={(e) => e.target.style.display = 'none'} className={`absolute inset-[-50%] m-auto w-[200%] h-[200%] object-contain z-0 ${eq.particulas.cssClass || ''}`} style={{ mixBlendMode: 'screen', WebkitMixBlendMode: 'screen', pointerEvents: 'none' }} /> )}
            {cleanCosmeticUrl(eq.efeito?.preview) && ( <img src={cleanCosmeticUrl(eq.efeito.preview)} onError={(e) => e.target.style.display = 'none'} className={`absolute inset-0 m-auto w-full h-full object-contain z-20 ${eq.efeito.cssClass || ''}`} style={{ mixBlendMode: 'screen', WebkitMixBlendMode: 'screen', pointerEvents: 'none' }} /> )}
            {cleanCosmeticUrl(eq.moldura?.preview) && ( <img src={cleanCosmeticUrl(eq.moldura.preview)} onError={(e) => e.target.style.display = 'none'} className={`absolute inset-[-15%] m-auto w-[130%] h-[130%] object-contain z-30 ${eq.moldura.cssClass || ''}`} style={{ mixBlendMode: 'screen', WebkitMixBlendMode: 'screen', pointerEvents: 'none' }} /> )}
            {cleanCosmeticUrl(eq.badge?.preview) && ( <img src={cleanCosmeticUrl(eq.badge.preview)} onError={(e) => e.target.style.display = 'none'} className={`absolute -bottom-2 -right-2 w-8 h-8 object-contain z-40 ${eq.badge.cssClass || ''}`} style={{ pointerEvents: 'none' }} /> )}

            {isEditing && <button onClick={() => avatarInputRef.current.click()} className="absolute bottom-0 right-0 bg-cyan-600 p-3 rounded-full text-black z-50 border-2 border-black"><Camera className="w-5 h-5" /></button>}
            <input type="file" accept="image/*" ref={avatarInputRef} className="hidden" onChange={(e) => handleImageUpload(e, 'avatar')} />
          </div>

          <div className="flex-1 text-center md:text-left mt-4 md:mt-0 w-full">
            <h1 className={`text-2xl md:text-4xl font-black tracking-tight ${eq.nickname ? eq.nickname.cssClass : 'text-white'}`}>{name || 'Entidade Desconhecida'}</h1>
            <p className="text-cyan-400 font-bold mb-1 text-xs tracking-wider">{user.email}</p>
            {bio && !isEditing && <p className="text-gray-400 text-xs mb-3 italic font-medium">"{bio}"</p>}
            
            <div className="w-full bg-[#05030a] p-5 rounded-2xl border border-white/5 mt-4">
              <div className="flex justify-between items-end mb-3">
                <div className="flex flex-col">
                   <span className="text-[10px] font-black text-fuchsia-400 tracking-[0.2em] uppercase mb-1">Nível {level}</span>
                   <span className="text-sm font-black text-white uppercase tracking-wider">{getLevelTitle(level)}</span>
                </div>
                <div className="text-right flex flex-col items-end">
                   <span className="text-[10px] font-black text-gray-500 uppercase tracking-widest flex items-center gap-1 mb-1"><Zap className="w-3 h-3 text-cyan-500"/> Energia</span>
                   <span className="text-xs font-black text-cyan-400">{currentXp} <span className="text-gray-600">/ {xpNeeded} XP</span></span>
                </div>
              </div>
              <div className="relative w-full h-4 bg-[#010003] rounded-full overflow-hidden border border-white/5">
                 <div className="absolute top-0 left-0 h-full rounded-full bg-gradient-to-r from-cyan-700 to-fuchsia-600 transition-all duration-1000" style={{ width: `${progressPercent}%` }}>
                 </div>
              </div>
            </div>
          </div>

          <div className="flex gap-2 w-full md:w-auto justify-center">
            <button onClick={() => setIsEditing(!isEditing)} className="bg-[#05030a] text-cyan-100 px-5 py-3 rounded-xl text-xs uppercase tracking-widest font-black flex items-center justify-center gap-2 border border-white/5 hover:bg-white/5 transition-colors flex-1 md:flex-none"><Edit3 className="w-4 h-4" /> {isEditing ? 'Cancelar' : 'Editar'}</button>
            <button onClick={onLogout} className="bg-red-950/40 text-red-500 p-3 rounded-xl hover:bg-red-900 hover:text-white transition-colors"><LogOut className="w-5 h-5" /></button>
          </div>
        </div>
        
        {isEditing ? (
          <form onSubmit={handleSave} className="bg-[#05030a] border border-cyan-900/30 rounded-3xl p-6 sm:p-8 relative overflow-hidden">
            <div className="absolute top-0 left-0 w-full h-[2px] bg-gradient-to-r from-transparent via-cyan-500 to-transparent"></div>
            <div className="space-y-5 relative z-10">
              <div>
                 <label className="block text-[10px] font-black text-cyan-400/70 uppercase tracking-widest mb-2">Identidade do Vazio</label>
                 <input type="text" value={name} onChange={e => setName(e.target.value)} className="w-full bg-[#020105] border border-white/5 rounded-xl px-4 py-3.5 text-white text-sm font-medium outline-none focus:border-cyan-500 transition-colors" placeholder="Ex: Mestre Cósmico"/>
              </div>
              <div>
                 <label className="block text-[10px] font-black text-cyan-400/70 uppercase tracking-widest mb-2">Marca na Alma (Biografia)</label>
                 <textarea value={bio} onChange={e => setBio(e.target.value)} rows={3} className="w-full bg-[#020105] border border-white/5 rounded-xl px-4 py-3.5 text-white text-sm resize-none outline-none focus:border-cyan-500 transition-colors" placeholder="Deixe sua marca..."></textarea>
              </div>
            </div>
            <button type="submit" disabled={loading} className="mt-6 bg-cyan-900 text-white text-xs font-black uppercase tracking-widest px-8 py-3.5 rounded-xl w-full flex justify-center hover:bg-cyan-800 transition-colors">{loading ? <Loader2 className="w-5 h-5 animate-spin"/> : 'Salvar Registro'}</button>
          </form>
        ) : (
          <div>
            <div className="flex gap-2.5 border-b border-white/5 mb-6 overflow-x-auto no-scrollbar pb-2">
              <button onClick={() => setActiveTab("Estatisticas")} className={`px-4 py-2.5 rounded-xl font-black transition-colors whitespace-nowrap text-[10px] uppercase tracking-widest flex items-center gap-2 ${activeTab === "Estatisticas" ? 'bg-cyan-900/40 text-cyan-400' : 'bg-[#05030a] text-gray-500'}`}><Compass className="w-4 h-4"/> Dados</button>
              <button onClick={() => setActiveTab("Historico")} className={`px-4 py-2.5 rounded-xl font-black transition-colors whitespace-nowrap text-[10px] uppercase tracking-widest flex items-center gap-2 ${activeTab === "Historico" ? 'bg-cyan-900/40 text-cyan-400' : 'bg-[#05030a] text-gray-500'}`}><History className="w-4 h-4"/> Rastro</button>
              <button onClick={() => setActiveTab("Biblioteca")} className={`px-4 py-2.5 rounded-xl font-black transition-colors whitespace-nowrap text-[10px] uppercase tracking-widest flex items-center gap-2 ${activeTab === "Biblioteca" ? 'bg-cyan-900/40 text-cyan-400' : 'bg-[#05030a] text-gray-500'}`}><Library className="w-4 h-4"/> Coleção</button>
              <button onClick={() => setActiveTab("Configuracoes")} className={`px-4 py-2.5 rounded-xl font-black transition-colors whitespace-nowrap text-[10px] uppercase tracking-widest flex items-center gap-2 ${activeTab === "Configuracoes" ? 'bg-cyan-900/40 text-cyan-400' : 'bg-[#05030a] text-gray-500'}`}><Smartphone className="w-4 h-4"/> Sistema</button>
            </div>
            
            {activeTab === "Estatisticas" && (
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <div className="bg-[#05030a] border border-white/5 p-6 rounded-2xl text-center"><div className="text-3xl font-black text-white mb-2">{!dataLoaded ? <Loader2 className="w-6 h-6 animate-spin mx-auto"/> : Object.keys(libraryData).length}</div><div className="text-[9px] text-gray-500 uppercase font-black tracking-widest">Salvos</div></div>
                <div className="bg-[#05030a] border border-white/5 p-6 rounded-2xl text-center"><div className="text-3xl font-black text-cyan-500 mb-2">{!dataLoaded ? <Loader2 className="w-6 h-6 animate-spin mx-auto text-cyan-500"/> : historyData.length}</div><div className="text-[9px] text-gray-500 uppercase font-black tracking-widest">Lidos</div></div>
                <div className="bg-[#05030a] border border-white/5 p-6 rounded-2xl text-center"><div className="text-3xl font-black text-amber-500 mb-2">{!dataLoaded ? <Loader2 className="w-6 h-6 animate-spin mx-auto text-amber-500"/> : obrasLidasIds.length}</div><div className="text-[9px] text-gray-500 uppercase font-black tracking-widest">Iniciadas</div></div>
                <div className="bg-[#05030a] border border-white/5 p-6 rounded-2xl text-center"><div className="text-3xl font-black text-fuchsia-500 mb-2">{!dataLoaded ? <Loader2 className="w-6 h-6 animate-spin mx-auto text-fuchsia-500"/> : Object.values(libraryData).filter(s=>s==='Favoritos').length}</div><div className="text-[9px] text-gray-500 uppercase font-black tracking-widest">Favoritos</div></div>
              </div>
            )}

            {activeTab === "Historico" && (
                <div>
                    {historyData.length === 0 ? (
                        <div className="text-center py-12 bg-[#05030a] rounded-2xl border border-white/5"><History className="w-10 h-10 mx-auto text-gray-600 mb-3"/><p className="text-gray-500 font-black text-[10px] uppercase tracking-widest">Nenhum rastro detectado.</p></div>
                    ) : (
                       <div className="flex flex-col gap-3">
                          {historyData.slice(0, 15).map(hist => {
                              const mg = mangas.find(m => m.id === hist.mangaId);
                              return (
                                  <div key={hist.id} onClick={() => { if(mg) onNavigate('details', mg); }} className="bg-[#05030a] border border-white/5 p-3 rounded-2xl flex items-center gap-4 cursor-pointer hover:bg-white/5 transition-colors group">
                                      <div className="w-14 h-20 rounded-xl overflow-hidden flex-shrink-0 bg-[#020105]">{mg ? <img src={mg.coverUrl} className="w-full h-full object-cover" /> : <BookOpen className="w-6 h-6 m-auto mt-6 text-gray-600"/>}</div>
                                      <div className="flex-1"><h4 className="font-bold text-gray-200 text-sm line-clamp-1 group-hover:text-cyan-400">{hist.mangaTitle}</h4><p className="text-fuchsia-400 text-[10px] font-black mt-1 uppercase tracking-wider">Capítulo {hist.chapterNumber}</p></div>
                                      <div className="text-right">
                                        <p className="text-[9px] text-gray-500 font-bold uppercase tracking-widest">{new Date(hist.timestamp).toLocaleDateString()}</p>
                                      </div>
                                  </div>
                              )
                          })}
                          <button onClick={() => setConfirmAction('history')} className="mt-4 flex items-center justify-center gap-2 w-full py-4 bg-red-950/20 text-red-500 font-black text-[10px] uppercase tracking-widest rounded-xl hover:bg-red-900 hover:text-white transition-colors"><Trash2 className="w-4 h-4"/> Limpar Histórico</button>
                       </div>
                    )}
                </div>
            )}

            {activeTab === "Biblioteca" && (
                <div>
                    {libraryMangas.length === 0 ? (
                        <div className="text-center py-12 bg-[#05030a] rounded-2xl border border-white/5"><Library className="w-10 h-10 mx-auto text-gray-600 mb-3"/><p className="text-gray-500 font-black text-[10px] uppercase tracking-widest">Sua coleção está vazia.</p></div>
                    ) : (
                        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
                            {libraryMangas.map(mg => (
                                <div key={mg.id} onClick={() => onNavigate('details', mg)} className="bg-[#05030a] border border-white/5 rounded-xl overflow-hidden cursor-pointer group">
                                    <div className="aspect-[2/3] w-full overflow-hidden relative">
                                        <img src={mg.coverUrl} className="w-full h-full object-cover" />
                                        <div className="absolute top-2 right-2 bg-black/80 px-1.5 py-0.5 rounded border border-white/10">
                                            <span className="text-[8px] font-black uppercase text-fuchsia-400">{libraryData[mg.id]}</span>
                                        </div>
                                    </div>
                                    <div className="p-3">
                                        <h4 className="font-bold text-xs text-gray-200 line-clamp-1 group-hover:text-cyan-400">{mg.title}</h4>
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
                </div>
            )}

            {activeTab === "Configuracoes" && (
                <div className="space-y-4">
                    
                    {/* LEITOR E DADOS */}
                    <div className="bg-[#05030a] border border-white/5 rounded-2xl p-5">
                      <h3 className="text-sm font-black text-white uppercase tracking-widest flex items-center gap-2 mb-6 border-b border-white/5 pb-4"><LayoutTemplate className="w-4 h-4 text-cyan-500" /> Preferências</h3>
                      <div className="flex items-center justify-between mb-6">
                        <div>
                          <p className="text-sm font-bold text-gray-200">Modo de Leitura</p>
                          <p className="text-xs text-gray-500 mt-1">Como as páginas serão exibidas.</p>
                        </div>
                        <select 
                          value={userSettings?.readMode || 'Cascata'} 
                          onChange={(e) => { updateSettings({ readMode: e.target.value }); showToast("Modo atualizado.", "success"); }}
                          className="bg-[#020105] border border-white/10 text-white text-xs font-bold rounded-lg px-3 py-2 outline-none focus:border-cyan-500"
                        >
                          <option value="Cascata">Cascata (Scroll)</option>
                          <option value="Paginação">Página por Página</option>
                        </select>
                      </div>

                      <div className="flex items-center justify-between mb-6">
                        <div>
                          <p className="text-sm font-bold text-gray-200">Economia de Dados</p>
                          <p className="text-xs text-gray-500 mt-1">Reduz o consumo de internet.</p>
                        </div>
                        <label className="relative inline-flex items-center cursor-pointer">
                          <input 
                            type="checkbox" 
                            className="sr-only peer" 
                            checked={userSettings?.dataSaver || false}
                            onChange={(e) => { updateSettings({ dataSaver: e.target.checked }); showToast("Definição atualizada.", "success"); }} 
                          />
                          <div className="w-11 h-6 bg-[#020105] border border-white/10 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-gray-400 peer-checked:after:bg-cyan-400 after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-cyan-900 peer-checked:border-cyan-500"></div>
                        </label>
                      </div>

                      {/* FUNÇÃO TEMA GLOBAL ADICIONADA */}
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="text-sm font-bold text-gray-200">Tema Global</p>
                          <p className="text-xs text-gray-500 mt-1">Otimize para telas AMOLED.</p>
                        </div>
                        <select 
                          value={userSettings?.theme || 'Escuro'} 
                          onChange={(e) => { updateSettings({ theme: e.target.value }); showToast("Tema atualizado.", "success"); }}
                          className="bg-[#020105] border border-white/10 text-white text-xs font-bold rounded-lg px-3 py-2 outline-none focus:border-fuchsia-500"
                        >
                          <option value="Escuro">Escuro</option>
                          <option value="Amoled">Breu (AMOLED)</option>
                        </select>
                      </div>
                    </div>

                    <div className="bg-[#05030a] border border-white/5 rounded-2xl p-5 mt-4">
                        <button onClick={() => setConfirmAction('cache')} className="flex items-center justify-between w-full text-left group">
                            <div>
                                <p className="text-sm font-bold text-amber-500 group-hover:text-amber-400 transition-colors flex items-center gap-2"><RefreshCw className="w-4 h-4" /> Limpar Cache do Sistema</p>
                                <p className="text-xs text-gray-500 mt-1">Recarrega a interface e apaga o lixo.</p>
                            </div>
                        </button>
                    </div>
                </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
