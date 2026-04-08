import React, { useState, useEffect, useRef } from 'react';
import { Compass, History, Library, Smartphone, Moon, Sun, Camera, Edit3, LogOut, Loader2, UserCircle, BookOpen, Trash2, RefreshCw, AlertTriangle } from 'lucide-react';
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
    setName(user.displayName || '');
    setBio(userProfileData.bio || '');
    setAvatarBase64(userProfileData.avatarUrl || user.photoURL || '');
    setCoverBase64(userProfileData.coverUrl || '');
  }, [user, userProfileData]);
  
  const avatarInputRef = useRef(null); const coverInputRef = useRef(null);

  const handleImageUpload = async (e, type) => {
    const file = e.target.files[0]; if (!file) return;
    try {
      const compressedBase64 = await compressImage(file, type === 'cover' ? 400 : 150, 0.4);
      if (type === 'avatar') setAvatarBase64(compressedBase64); else setCoverBase64(compressedBase64);
    } catch (err) { showToast("Erro na imagem.", "error"); }
  };

  const handleSave = async (e) => {
    e.preventDefault(); setLoading(true);
    try {
      await updateProfile(auth.currentUser, { displayName: name });
      const docData = { coverUrl: coverBase64, avatarUrl: avatarBase64, bio: bio };
      await setDoc(doc(db, 'artifacts', APP_ID, 'users', user.uid, 'profile', 'main'), docData, { merge: true });
      onUpdateData(docData);
      showToast('Registro salvo no Abismo!', 'success'); setIsEditing(false);
    } catch (error) { showToast(`Erro ao gravar.`, 'error'); } finally { setLoading(false); }
  };

  const executeConfirmAction = async () => {
      if (confirmAction === 'history') {
          try {
              historyData.forEach(async (h) => {
                  await deleteDoc(doc(db, 'artifacts', APP_ID, 'users', user.uid, 'history', h.id));
              });
              showToast("Rastro apagado do Vazio.", "success");
          } catch(e) { showToast("Erro ao apagar histórico.", "error"); }
      } else if (confirmAction === 'cache') {
          localStorage.clear();
          sessionStorage.clear();
          window.location.reload(true);
      }
      setConfirmAction(null);
  };

  const level = userProfileData.level || 1;
  const currentXp = userProfileData.xp || 0;
  const xpNeeded = getLevelRequirement(level);
  const progressPercent = Math.min(100, (currentXp / xpNeeded) * 100);
  const lidosSet = new Set(historyData.map(h => h.mangaId));
  const obrasLidasIds = Array.from(lidosSet);
  const libraryMangaIds = Object.keys(libraryData);
  const libraryMangas = mangas.filter(m => libraryMangaIds.includes(m.id));

  const eq = userProfileData.equipped_items || {};

  return (
    <div className={`animate-in fade-in duration-500 w-full pb-20 font-sans min-h-screen text-gray-300 ${eq.tema_perfil ? eq.tema_perfil.cssClass : 'bg-[#020205]'}`}>
      {confirmAction && (
          <div className="fixed inset-0 z-[3000] bg-black/90 backdrop-blur-md flex items-center justify-center p-4 animate-in fade-in duration-300">
              <div className="bg-[#050508] border border-red-900/50 p-6 rounded-3xl shadow-[0_0_50px_rgba(220,38,38,0.15)] max-w-sm w-full text-center relative overflow-hidden">
                  <div className="absolute top-0 left-0 w-full h-[1px] bg-gradient-to-r from-transparent via-red-500/50 to-transparent"></div>
                  <AlertTriangle className="w-12 h-12 text-red-500 mx-auto mb-4 animate-pulse" />
                  <h3 className="text-lg font-black text-white mb-2 uppercase tracking-widest">
                      {confirmAction === 'history' ? 'Apagar Rastros?' : 'Limpar Sistema?'}
                  </h3>
                  <p className="text-xs text-gray-400 font-medium mb-6 px-2">
                      {confirmAction === 'history' ? 'Os registros de leitura serão varridos do Abismo para sempre.' : 'Isso irá recarregar a interface e limpar arquivos temporários.'}
                  </p>
                  <div className="flex gap-3">
                      <button onClick={() => setConfirmAction(null)} className="flex-1 bg-black border border-red-900/30 text-gray-400 font-bold py-3.5 rounded-xl hover:text-white transition-colors text-xs duration-300 uppercase tracking-widest">Cancelar</button>
                      <button onClick={executeConfirmAction} className="flex-1 bg-red-950/40 border border-red-900/50 text-red-400 hover:bg-red-700 hover:text-white font-black py-3.5 rounded-xl transition-colors shadow-[0_0_15px_rgba(220,38,38,0.2)] text-xs duration-300 uppercase tracking-widest">Confirmar</button>
                  </div>
              </div>
          </div>
      )}

      <div className="h-40 md:h-64 w-full bg-[#020205] relative group border-b border-blue-900/20 overflow-hidden">
        {eq.capa_fundo ? (
            <img src={eq.capa_fundo.preview} className={`w-full h-full object-cover opacity-90 ${eq.capa_fundo.cssClass}`} />
        ) : coverBase64 ? (
            <img src={coverBase64} className="w-full h-full object-cover opacity-70 mix-blend-luminosity" /> 
        ) : (
            <div className="w-full h-full bg-gradient-to-tr from-[#020205] to-[#050508]" />
        )}
        <div className="absolute inset-0 bg-gradient-to-t from-[#020205] via-transparent to-transparent" />
        {isEditing && <button onClick={() => coverInputRef.current.click()} className="absolute top-4 right-4 bg-black/60 text-blue-100 px-4 py-2 rounded-xl flex items-center gap-2 text-xs uppercase tracking-widest font-black z-10 transition-colors hover:bg-blue-900/50 duration-300 backdrop-blur-sm border border-blue-900/30"><Camera className="w-4 h-4" /> Capa</button>}
        <input type="file" accept="image/*" ref={coverInputRef} className="hidden" onChange={(e) => handleImageUpload(e, 'cover')} />
      </div>

      <div className="max-w-4xl mx-auto px-4 sm:px-6 relative -mt-16 md:-mt-20 z-10">
        <div className="flex flex-col md:flex-row items-center md:items-end gap-4 mb-8">
          
          <div className="relative w-28 h-28 md:w-36 md:h-36 rounded-full flex items-center justify-center flex-shrink-0 group">
            
            <img 
               src={eq.avatar ? eq.avatar.preview : (avatarBase64 || `https://placehold.co/150x150/050508/3b82f6?text=U`)} 
               className={`w-full h-full rounded-full object-cover z-0 shadow-[0_0_30px_rgba(37,99,235,0.15)] ${eq.avatar?.cssClass || ''}`} 
               alt="Avatar do Usuário"
            />
            
            {/* APLICAÇÃO DO MIX-BLEND-MODE E CLOUDINARY CLEAN */}
            {eq.particulas && (
              <img 
                src={cleanCosmeticUrl(eq.particulas.preview)} 
                className={`absolute inset-[-50%] m-auto w-[200%] h-[200%] object-contain z-10 ${eq.particulas.cssClass}`} 
                style={{ mixBlendMode: 'screen', WebkitMixBlendMode: 'screen', pointerEvents: 'none' }} 
              />
            )}
            
            {eq.efeito && (
              <img 
                src={cleanCosmeticUrl(eq.efeito.preview)} 
                className={`absolute inset-0 m-auto w-full h-full object-contain z-10 ${eq.efeito.cssClass}`} 
                style={{ mixBlendMode: 'screen', WebkitMixBlendMode: 'screen', pointerEvents: 'none' }} 
              />
            )}

            {eq.moldura && (
              <img 
                src={cleanCosmeticUrl(eq.moldura.preview)} 
                className={`absolute inset-[-15%] m-auto w-[130%] h-[130%] object-contain z-10 ${eq.moldura.cssClass}`} 
                style={{ mixBlendMode: 'screen', WebkitMixBlendMode: 'screen', pointerEvents: 'none' }} 
              />
            )}

            {eq.badge && (
              <img 
                src={cleanCosmeticUrl(eq.badge.preview)} 
                className={`absolute -bottom-2 -right-2 w-8 h-8 object-contain z-20 ${eq.badge.cssClass}`} 
                style={{ pointerEvents: 'none' }} 
              />
            )}

            {isEditing && <button onClick={() => avatarInputRef.current.click()} className="absolute bottom-0 right-0 bg-blue-600 p-3 rounded-full text-black z-50 shadow-[0_0_15px_rgba(37,99,235,0.5)] hover:bg-blue-500 transition-colors duration-300"><Camera className="w-5 h-5" /></button>}
            <input type="file" accept="image/*" ref={avatarInputRef} className="hidden" onChange={(e) => handleImageUpload(e, 'avatar')} />
          </div>

          <div className="flex-1 text-center md:text-left mt-4 md:mt-0">
            <h1 className={`text-2xl md:text-4xl font-black tracking-tight ${eq.nickname ? eq.nickname.cssClass : 'text-blue-50'}`}>
                {name || 'Entidade Sem Nome'}
            </h1>
            <p className="text-amber-500 font-bold mb-1 text-xs tracking-wider">{user.email}</p>
            {bio && !isEditing && <p className="text-blue-200/60 text-xs mb-3 italic font-medium">"{bio}"</p>}
            
            <div className="w-full max-w-md mx-auto md:mx-0 bg-black/60 p-5 rounded-2xl border border-white/5 mt-4 backdrop-blur-md relative overflow-hidden shadow-2xl">
              <div className="absolute top-0 right-0 w-32 h-32 bg-blue-600/10 blur-[40px] pointer-events-none"></div>
              <div className="flex justify-between items-end mb-3 relative z-10">
                <div className="flex flex-col">
                   <span className="text-[10px] font-black text-amber-500 tracking-[0.2em] uppercase mb-1">Nível {level}</span>
                   <span className="text-sm font-black text-white uppercase tracking-wider">{getLevelTitle(level)}</span>
                </div>
                <div className="text-right flex flex-col">
                   <span className="text-[10px] font-bold text-gray-500 tracking-widest uppercase mb-1">Progresso</span>
                   <span className="text-xs font-black text-blue-400">{currentXp} <span className="text-gray-600">/ {xpNeeded} XP</span></span>
                </div>
              </div>
              
              <div className="relative w-full h-4 bg-[#020205] rounded-full overflow-hidden border border-white/10 shadow-inner z-10">
                 <div className="absolute inset-0 bg-gray-900/50"></div>
                 <div className="absolute top-0 left-0 h-full rounded-full bg-gradient-to-r from-blue-700 via-cyan-500 to-fuchsia-500 transition-all duration-1000 ease-out shadow-[0_0_20px_rgba(34,211,238,0.5)]" style={{ width: `${progressPercent}%` }}>
                     <div className="absolute inset-0 w-full h-full bg-[linear-gradient(45deg,transparent_25%,rgba(255,255,255,0.2)_50%,transparent_75%)] bg-[length:20px_20px] animate-[shimmer_2s_linear_infinite]"></div>
                 </div>
              </div>
            </div>

          </div>
          <div className="flex gap-2">
            <button onClick={() => setIsEditing(!isEditing)} className="bg-black text-blue-200 px-5 py-3 rounded-xl text-xs uppercase tracking-widest font-black flex items-center gap-2 transition-all duration-300 hover:bg-blue-950/30 hover:text-white border border-blue-900/30 shadow-sm"><Edit3 className="w-4 h-4" /> {isEditing ? 'Cancelar' : 'Editar'}</button>
            <button onClick={onLogout} className="bg-red-950/20 text-red-500 p-3 rounded-xl transition-all duration-300 hover:bg-red-900 hover:text-white border border-red-900/30 shadow-sm"><LogOut className="w-5 h-5" /></button>
          </div>
        </div>
        
        {isEditing ? (
          <form onSubmit={handleSave} className="bg-[#050508]/80 border border-blue-900/30 rounded-2xl p-6 sm:p-8 animate-in slide-in-from-bottom-4 shadow-[0_0_30px_rgba(37,99,235,0.05)] backdrop-blur-md relative overflow-hidden">
            <div className="absolute top-0 left-0 w-full h-[1px] bg-gradient-to-r from-transparent via-blue-500/50 to-transparent"></div>
            <div className="space-y-5 relative z-10">
              <div>
                 <label className="block text-[10px] font-black text-blue-400/70 uppercase tracking-widest mb-2">Identidade do Vazio</label>
                 <input type="text" value={name} onChange={e => setName(e.target.value)} className="w-full bg-black/80 border border-blue-900/30 rounded-xl px-4 py-3.5 text-white text-sm font-medium outline-none focus:border-blue-500/50 transition-colors duration-300 shadow-inner" placeholder="Ex: Mestre Cósmico"/>
              </div>
              <div>
                 <label className="block text-[10px] font-black text-blue-400/70 uppercase tracking-widest mb-2">Marca na Alma (Biografia)</label>
                 <textarea value={bio} onChange={e => setBio(e.target.value)} rows={3} className="w-full bg-black/80 border border-blue-900/30 rounded-xl px-4 py-3.5 text-white text-sm resize-none outline-none focus:border-blue-500/50 transition-colors duration-300 shadow-inner" placeholder="Deixe sua marca no Abismo..."></textarea>
              </div>
            </div>
            <button type="submit" disabled={loading} className="mt-6 bg-gradient-to-r from-blue-700 to-amber-500 text-black text-xs font-black uppercase tracking-widest px-8 py-3.5 rounded-xl w-full flex justify-center hover:scale-[1.02] transition-transform duration-300 shadow-[0_0_15px_rgba(37,99,235,0.3)] relative z-10">{loading ? <Loader2 className="w-5 h-5 animate-spin"/> : 'Salvar Registro'}</button>
          </form>
        ) : (
          <div>
            <div className="flex gap-2.5 border-b border-blue-900/20 mb-6 overflow-x-auto scrollbar-hide pb-2">
              <button onClick={() => setActiveTab("Estatisticas")} className={`px-4 py-2.5 rounded-lg font-black transition-all whitespace-nowrap text-[10px] uppercase tracking-widest duration-300 flex items-center gap-2 ${activeTab === "Estatisticas" ? 'bg-blue-950/30 text-blue-400 border border-blue-900/30' : 'text-blue-900/60 hover:text-blue-200 border border-transparent'}`}><Compass className="w-4 h-4"/> Dados</button>
              <button onClick={() => setActiveTab("Historico")} className={`px-4 py-2.5 rounded-lg font-black transition-all whitespace-nowrap text-[10px] uppercase tracking-widest duration-300 flex items-center gap-2 ${activeTab === "Historico" ? 'bg-blue-950/30 text-blue-400 border border-blue-900/30' : 'text-blue-900/60 hover:text-blue-200 border border-transparent'}`}><History className="w-4 h-4"/> Rastro</button>
              <button onClick={() => setActiveTab("Biblioteca")} className={`px-4 py-2.5 rounded-lg font-black transition-all whitespace-nowrap text-[10px] uppercase tracking-widest duration-300 flex items-center gap-2 ${activeTab === "Biblioteca" ? 'bg-blue-950/30 text-blue-400 border border-blue-900/30' : 'text-blue-900/60 hover:text-blue-200 border border-transparent'}`}><Library className="w-4 h-4"/> Coleção</button>
              <button onClick={() => setActiveTab("Configuracoes")} className={`px-4 py-2.5 rounded-lg font-black transition-all whitespace-nowrap text-[10px] uppercase tracking-widest duration-300 flex items-center gap-2 ${activeTab === "Configuracoes" ? 'bg-blue-950/30 text-blue-400 border border-blue-900/30' : 'text-blue-900/60 hover:text-blue-200 border border-transparent'}`}><Smartphone className="w-4 h-4"/> Sistema</button>
            </div>
            
            {activeTab === "Estatisticas" && (
              <div className="space-y-4 animate-in fade-in duration-300">
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  <div className="bg-[#050508] border border-blue-900/20 p-5 rounded-2xl text-center shadow-inner"><div className="text-3xl font-black text-blue-50 mb-2 tracking-tighter">{!dataLoaded ? <Loader2 className="w-6 h-6 animate-spin mx-auto text-blue-500"/> : Object.keys(libraryData).length}</div><div className="text-[9px] text-blue-400/60 uppercase font-black tracking-widest">Salvos</div></div>
                  <div className="bg-[#050508] border border-blue-900/20 p-5 rounded-2xl text-center shadow-inner"><div className="text-3xl font-black text-blue-500 mb-2 tracking-tighter">{!dataLoaded ? <Loader2 className="w-6 h-6 animate-spin mx-auto text-blue-500"/> : historyData.length}</div><div className="text-[9px] text-blue-400/60 uppercase font-black tracking-widest">Lidos</div></div>
                  <div className="bg-[#050508] border border-blue-900/20 p-5 rounded-2xl text-center shadow-inner"><div className="text-3xl font-black text-amber-500 mb-2 tracking-tighter">{!dataLoaded ? <Loader2 className="w-6 h-6 animate-spin mx-auto text-amber-500"/> : obrasLidasIds.length}</div><div className="text-[9px] text-amber-400/60 uppercase font-black tracking-widest">Iniciadas</div></div>
                  <div className="bg-[#050508] border border-blue-900/20 p-5 rounded-2xl text-center shadow-inner"><div className="text-3xl font-black text-red-500 mb-2 tracking-tighter">{!dataLoaded ? <Loader2 className="w-6 h-6 animate-spin mx-auto text-red-500"/> : Object.values(libraryData).filter(s=>s==='Favoritos').length}</div><div className="text-[9px] text-red-400/60 uppercase font-black tracking-widest">Favoritos</div></div>
                </div>
              </div>
            )}

            {activeTab === "Historico" && (
                <div className="animate-in fade-in duration-300">
                    {historyData.length === 0 ? (
                        <div className="text-center py-12 bg-[#050508] rounded-2xl border border-blue-900/20 shadow-inner"><History className="w-10 h-10 mx-auto text-blue-900/40 mb-3"/><p className="text-blue-800/60 font-black text-[10px] uppercase tracking-widest">Nenhum rastro detectado no Vazio.</p></div>
                    ) : (
                       <div className="flex flex-col gap-3">
                          {historyData.slice(0, 15).map(hist => {
                              const mg = mangas.find(m => m.id === hist.mangaId);
                              return (
                                  <div key={hist.id} onClick={() => { if(mg) onNavigate('details', mg); }} className="bg-[#050508] border border-blue-900/20 p-3 rounded-2xl flex items-center gap-4 cursor-pointer hover:border-blue-500/40 transition-colors duration-300 shadow-sm group">
                                      <div className="w-14 h-20 rounded-xl overflow-hidden flex-shrink-0 bg-black border border-blue-900/30 shadow-inner">{mg ? <img src={mg.coverUrl} className="w-full h-full object-cover transition-all duration-500 group-hover:scale-110" /> : <BookOpen className="w-6 h-6 m-auto mt-6 text-blue-900/40"/>}</div>
                                      <div className="flex-1"><h4 className="font-bold text-blue-50 text-sm line-clamp-1 group-hover:text-blue-400 transition-colors">{hist.mangaTitle}</h4><p className="text-amber-600 text-[10px] font-black mt-1 uppercase tracking-wider">Capítulo {hist.chapterNumber}</p></div>
                                      <div className="text-right"><p className="text-[9px] text-blue-400/50 font-bold uppercase tracking-widest">{new Date(hist.timestamp).toLocaleDateString()}</p><p className="text-[10px] text-blue-900/60 font-medium mt-0.5">{new Date(hist.timestamp).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}</p></div>
                                  </div>
                              )
                          })}
                       </div>
                    )}
                </div>
            )}

            {activeTab === "Biblioteca" && (
                <div className="animate-in fade-in duration-300">
                    {libraryMangas.length === 0 ? (
                        <div className="text-center py-12 bg-[#050508] rounded-2xl border border-blue-900/20 shadow-inner"><Library className="w-10 h-10 mx-auto text-blue-900/40 mb-3"/><p className="text-blue-800/60 font-black text-[10px] uppercase tracking-widest">Sua coleção abissal está vazia.</p></div>
                    ) : (
                       <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-3 md:gap-4">
                          {libraryMangas.map(manga => (
                            <div key={manga.id} className="cursor-pointer group flex flex-col gap-1.5" onClick={() => onNavigate('details', manga)}>
                              <div className={`relative aspect-[2/3] rounded-lg overflow-hidden bg-[#0d0d12] border border-white/10 shadow-sm ${userSettings?.dataSaver ? 'blur-[1px]' : ''}`}><img src={manga.coverUrl} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300" /></div>
                              <h3 className="font-bold text-xs md:text-sm text-gray-200 line-clamp-1 group-hover:text-cyan-400 transition-colors duration-300">{manga.title}</h3>
                            </div>
                          ))}
                        </div>
                    )}
                </div>
            )}

            {activeTab === "Configuracoes" && (
                <div className="animate-in fade-in duration-300 space-y-6">
                    <div className="bg-[#050508] border border-blue-900/20 p-5 rounded-2xl shadow-inner mt-4">
                       <h3 className="text-white font-bold mb-4 text-sm uppercase tracking-widest">Tema do Vazio</h3>
                       <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                           {['Escuro', 'Abissal', 'OLED', 'Sangue'].map(t => (
                               <button key={t} onClick={() => updateSettings({ theme: t })} className={`py-3 rounded-xl border font-bold text-[10px] uppercase tracking-widest transition-all duration-300 ${userSettings.theme === t ? 'bg-fuchsia-600 border-fuchsia-500 text-white shadow-[0_0_15px_rgba(192,38,211,0.3)]' : 'border-white/10 text-gray-400 hover:text-white hover:bg-white/5'}`}>{t}</button>
                           ))}
                       </div>
                    </div>

                    <div className="bg-[#050508] border border-blue-900/20 p-5 rounded-2xl shadow-inner">
                       <h3 className="text-white font-bold mb-4 text-sm uppercase tracking-widest">Modo de Leitura</h3>
                       <div className="flex gap-4">
                           <button onClick={() => updateSettings({ readMode: 'Cascata' })} className={`flex-1 py-3 rounded-xl border font-bold text-xs uppercase tracking-widest transition-all duration-300 ${userSettings.readMode === 'Cascata' ? 'bg-blue-600 border-blue-500 text-white shadow-[0_0_15px_rgba(37,99,235,0.3)]' : 'border-blue-900/40 text-gray-400 hover:text-white hover:bg-white/5'}`}>Cascata</button>
                           <button onClick={() => updateSettings({ readMode: 'Páginas' })} className={`flex-1 py-3 rounded-xl border font-bold text-xs uppercase tracking-widest transition-all duration-300 ${userSettings.readMode === 'Páginas' ? 'bg-blue-600 border-blue-500 text-white shadow-[0_0_15px_rgba(37,99,235,0.3)]' : 'border-blue-900/40 text-gray-400 hover:text-white hover:bg-white/5'}`}>Páginas</button>
                       </div>
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-6">
                        <button onClick={() => setConfirmAction('history')} className="bg-black border border-red-900/20 hover:border-red-500/50 hover:bg-red-950/30 text-red-800/80 hover:text-red-400 font-black uppercase tracking-widest p-5 rounded-2xl flex items-center justify-center gap-3 transition-all duration-300 text-[10px] shadow-sm">
                            <Trash2 className="w-5 h-5" /> Apagar Rastros
                        </button>
                        <button onClick={() => setConfirmAction('cache')} className="bg-black border border-blue-900/20 hover:border-blue-500/50 hover:bg-blue-950/30 text-blue-800/80 hover:text-blue-400 font-black uppercase tracking-widest p-5 rounded-2xl flex items-center justify-center gap-3 transition-all duration-300 text-[10px] shadow-sm">
                            <RefreshCw className="w-5 h-5" /> Limpar Sistema
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
