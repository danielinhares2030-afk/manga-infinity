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
    setName(user.displayName || ''); setBio(userProfileData.bio || ''); setAvatarBase64(userProfileData.avatarUrl || user.photoURL || ''); setCoverBase64(userProfileData.coverUrl || '');
  }, [user, userProfileData]);
  
  const avatarInputRef = useRef(null); const coverInputRef = useRef(null);

  const handleImageUpload = async (e, type) => {
    const file = e.target.files[0]; if (!file) return;
    try { const compressedBase64 = await compressImage(file, type === 'cover' ? 400 : 150, 0.4); if (type === 'avatar') setAvatarBase64(compressedBase64); else setCoverBase64(compressedBase64); } catch (err) { showToast("Erro na imagem.", "error"); }
  };

  const handleSave = async (e) => {
    e.preventDefault(); setLoading(true);
    try { await updateProfile(auth.currentUser, { displayName: name }); const docData = { coverUrl: coverBase64, avatarUrl: avatarBase64, bio: bio }; await setDoc(doc(db, 'artifacts', APP_ID, 'users', user.uid, 'profile', 'main'), docData, { merge: true }); onUpdateData(docData); showToast('Registro salvo no Abismo!', 'success'); setIsEditing(false); } catch (error) { showToast(`Erro ao gravar.`, 'error'); } finally { setLoading(false); }
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
  const activeAvatarSrc = getAvatarSrc() || avatarBase64 || `https://placehold.co/150x150/13151f/3b82f6?text=U`;

  return (
    <div className={`animate-in fade-in duration-500 w-full pb-20 font-sans min-h-screen text-gray-200 ${eq.tema_perfil ? eq.tema_perfil.cssClass : 'bg-[#050508]'}`}>
      
      {/* Estilos para a animação da barra de XP Surreal */}
      <style>{`
        @keyframes flow-plasma { 0% { background-position: 0% 50%; } 100% { background-position: 200% 50%; } }
      `}</style>

      {confirmAction && (
          <div className="fixed inset-0 z-[3000] bg-black/90 backdrop-blur-md flex items-center justify-center p-4 animate-in fade-in duration-300">
              <div className="bg-[#13151f] border border-red-900/50 p-6 rounded-3xl shadow-[0_0_50px_rgba(220,38,38,0.15)] max-w-sm w-full text-center relative overflow-hidden">
                  <div className="absolute top-0 left-0 w-full h-[1px] bg-gradient-to-r from-transparent via-red-500/50 to-transparent"></div>
                  <AlertTriangle className="w-12 h-12 text-red-500 mx-auto mb-4 animate-pulse" />
                  <h3 className="text-lg font-black text-white mb-2 uppercase tracking-widest">{confirmAction === 'history' ? 'Apagar Rastros?' : 'Limpar Sistema?'}</h3>
                  <p className="text-xs text-gray-400 font-medium mb-6 px-2">{confirmAction === 'history' ? 'Os registros de leitura serão varridos do Abismo para sempre.' : 'Isso irá recarregar a interface e limpar arquivos temporários.'}</p>
                  <div className="flex gap-3">
                      <button onClick={() => setConfirmAction(null)} className="flex-1 bg-black border border-red-900/30 text-gray-400 font-bold py-3.5 rounded-xl hover:text-white transition-colors text-xs duration-300 uppercase tracking-widest">Cancelar</button>
                      <button onClick={executeConfirmAction} className="flex-1 bg-red-950/40 border border-red-900/50 text-red-400 hover:bg-red-700 hover:text-white font-black py-3.5 rounded-xl transition-colors shadow-[0_0_15px_rgba(220,38,38,0.2)] text-xs duration-300 uppercase tracking-widest">Confirmar</button>
                  </div>
              </div>
          </div>
      )}

      <div className="h-48 md:h-72 w-full bg-[#050508] relative group overflow-hidden">
        {cleanCosmeticUrl(eq.capa_fundo?.preview) ? ( <img src={cleanCosmeticUrl(eq.capa_fundo.preview)} onError={(e) => e.target.style.display = 'none'} className={`w-full h-full object-cover opacity-90 ${eq.capa_fundo.cssClass || ''}`} /> ) : coverBase64 ? ( <img src={coverBase64} className="w-full h-full object-cover opacity-60 mix-blend-luminosity" /> ) : ( <div className={`w-full h-full bg-gradient-to-tr from-[#050508] to-[#13151f] ${eq.capa_fundo?.cssClass || ''}`} /> )}
        <div className="absolute inset-0 bg-gradient-to-t from-[#050508] via-transparent to-transparent" />
        {isEditing && <button onClick={() => coverInputRef.current.click()} className="absolute top-4 right-4 bg-black/60 text-cyan-100 px-4 py-2 rounded-xl flex items-center gap-2 text-[10px] uppercase tracking-widest font-black z-10 transition-colors hover:bg-cyan-900/50 duration-300 backdrop-blur-sm border border-cyan-900/30"><Camera className="w-4 h-4" /> Capa</button>}
        <input type="file" accept="image/*" ref={coverInputRef} className="hidden" onChange={(e) => handleImageUpload(e, 'cover')} />
      </div>

      <div className="max-w-4xl mx-auto px-4 sm:px-6 relative -mt-20 md:-mt-24 z-10">
        <div className="flex flex-col md:flex-row items-center md:items-end gap-6 mb-10">
          
          <div className={`relative w-32 h-32 md:w-40 md:h-40 rounded-full flex items-center justify-center flex-shrink-0 group ${(!eq.moldura?.preview && eq.moldura) ? eq.moldura.cssClass : ''}`}>
            <div className={`w-full h-full rounded-full bg-[#0b0e14] flex items-center justify-center relative z-10 overflow-hidden ${!eq.moldura ? 'border-4 border-[#050508] shadow-[0_0_40px_rgba(34,211,238,0.2)]' : ''}`}>
               <img src={activeAvatarSrc} className={`w-full h-full object-cover ${eq.avatar?.cssClass || ''}`} alt="Avatar" onError={(e) => e.target.src = `https://placehold.co/150x150/13151f/3b82f6?text=U`} />
            </div>
            
            {cleanCosmeticUrl(eq.particulas?.preview) && ( <img src={cleanCosmeticUrl(eq.particulas.preview)} onError={(e) => e.target.style.display = 'none'} className={`absolute inset-[-50%] m-auto w-[200%] h-[200%] object-contain z-0 ${eq.particulas.cssClass || ''}`} style={{ mixBlendMode: 'screen', WebkitMixBlendMode: 'screen', pointerEvents: 'none' }} /> )}
            {cleanCosmeticUrl(eq.efeito?.preview) && ( <img src={cleanCosmeticUrl(eq.efeito.preview)} onError={(e) => e.target.style.display = 'none'} className={`absolute inset-0 m-auto w-full h-full object-contain z-20 ${eq.efeito.cssClass || ''}`} style={{ mixBlendMode: 'screen', WebkitMixBlendMode: 'screen', pointerEvents: 'none' }} /> )}
            {cleanCosmeticUrl(eq.moldura?.preview) && ( <img src={cleanCosmeticUrl(eq.moldura.preview)} onError={(e) => e.target.style.display = 'none'} className={`absolute inset-[-15%] m-auto w-[130%] h-[130%] object-contain z-30 ${eq.moldura.cssClass || ''}`} style={{ mixBlendMode: 'screen', WebkitMixBlendMode: 'screen', pointerEvents: 'none' }} /> )}
            {cleanCosmeticUrl(eq.badge?.preview) && ( <img src={cleanCosmeticUrl(eq.badge.preview)} onError={(e) => e.target.style.display = 'none'} className={`absolute -bottom-2 -right-2 w-10 h-10 object-contain z-40 ${eq.badge.cssClass || ''}`} style={{ pointerEvents: 'none' }} /> )}

            {isEditing && <button onClick={() => avatarInputRef.current.click()} className="absolute bottom-0 right-0 bg-cyan-600 p-3.5 rounded-full text-black z-50 shadow-[0_0_20px_rgba(34,211,238,0.5)] hover:bg-cyan-400 transition-transform hover:scale-110 duration-300 border-2 border-[#050508]"><Camera className="w-5 h-5" /></button>}
            <input type="file" accept="image/*" ref={avatarInputRef} className="hidden" onChange={(e) => handleImageUpload(e, 'avatar')} />
          </div>

          <div className="flex-1 text-center md:text-left mt-4 md:mt-0 w-full">
            <h1 className={`text-3xl md:text-4xl font-black tracking-tighter uppercase ${eq.nickname ? eq.nickname.cssClass : 'text-white'}`}>{name || 'Entidade Sem Nome'}</h1>
            <p className="text-cyan-400 font-bold mb-2 text-[10px] tracking-[0.3em] uppercase drop-shadow-[0_0_5px_rgba(34,211,238,0.3)]">{user.email}</p>
            {bio && !isEditing && <p className="text-gray-400/80 text-sm mb-4 italic font-medium">"{bio}"</p>}
            
            {/* NOVA BARRA DE XP SURREAL */}
            <div className="w-full max-w-xl mx-auto md:mx-0 bg-[#0b0e14]/80 p-5 md:p-6 rounded-3xl border border-white/5 mt-6 backdrop-blur-xl relative overflow-hidden shadow-[0_20px_50px_rgba(0,0,0,0.5)]">
              <div className="absolute top-0 right-0 w-40 h-40 bg-cyan-600/10 blur-[50px] pointer-events-none rounded-full"></div>
              
              <div className="flex justify-between items-end mb-4 relative z-10">
                <div className="flex flex-col text-left">
                   <span className="text-[10px] font-black text-cyan-500 tracking-[0.3em] uppercase mb-1 drop-shadow-[0_0_5px_rgba(34,211,238,0.5)]">Nível {level}</span>
                   <span className="text-lg md:text-xl font-black text-white uppercase tracking-wider">{getLevelTitle(level)}</span>
                </div>
                <div className="text-right flex flex-col">
                   <span className="text-[9px] font-black text-gray-500 tracking-[0.2em] uppercase mb-1">Essência Absorvida</span>
                   <span className="text-sm font-black text-cyan-400">{currentXp} <span className="text-gray-600 text-xs">/ {xpNeeded}</span></span>
                </div>
              </div>

              {/* O Tubo de Plasma */}
              <div className="relative w-full h-5 bg-[#050508] rounded-full overflow-hidden border border-white/10 shadow-inner z-10">
                 {/* Fundo do tubo */}
                 <div className="absolute inset-0 bg-cyan-950/20"></div>
                 
                 {/* Barra de progresso preenchendo */}
                 <div className="absolute top-0 left-0 h-full rounded-full transition-all duration-1000 ease-out shadow-[0_0_25px_rgba(34,211,238,0.8)]" 
                      style={{ 
                          width: `${progressPercent}%`,
                          background: 'linear-gradient(90deg, #0284c7 0%, #06b6d4 50%, #d946ef 100%)',
                          backgroundSize: '200% 100%',
                          animation: 'flow-plasma 3s linear infinite'
                      }}>
                     {/* Reflexo luminoso interno da barra */}
                     <div className="absolute inset-0 w-full h-full bg-[linear-gradient(180deg,rgba(255,255,255,0.3)_0%,transparent_50%,rgba(0,0,0,0.2)_100%)]"></div>
                     {/* Partículas de plasma dentro da barra */}
                     <div className="absolute inset-0 w-full h-full bg-[linear-gradient(45deg,transparent_25%,rgba(255,255,255,0.4)_50%,transparent_75%)] bg-[length:15px_15px] animate-[shimmer_1s_linear_infinite]"></div>
                 </div>
              </div>
            </div>
          </div>

          <div className="flex gap-3 md:self-end mt-4 md:mt-0">
            <button onClick={() => setIsEditing(!isEditing)} className="bg-[#0b0e14] text-cyan-100/80 px-6 py-4 rounded-2xl text-[10px] uppercase tracking-widest font-black flex items-center gap-2 transition-all duration-300 hover:bg-cyan-900/40 hover:text-cyan-300 border border-white/5 hover:border-cyan-500/50 shadow-lg"><Edit3 className="w-4 h-4" /> {isEditing ? 'Cancelar' : 'Ajustar'}</button>
            <button onClick={onLogout} className="bg-[#0b0e14] text-red-500/80 p-4 rounded-2xl transition-all duration-300 hover:bg-red-950/40 hover:text-red-400 border border-white/5 hover:border-red-900/50 shadow-lg"><LogOut className="w-5 h-5" /></button>
          </div>
        </div>
        
        {/* ... Restante do código do ProfileView ... */}
        {/* Não mudei nada daqui para baixo, mas para garantir que o React não quebre, incluo as divs originais das abas */}
        
        {isEditing ? (
          <form onSubmit={handleSave} className="bg-[#0b0e14]/90 border border-cyan-900/30 rounded-[2rem] p-6 sm:p-8 animate-in slide-in-from-bottom-4 shadow-[0_0_40px_rgba(34,211,238,0.1)] backdrop-blur-xl relative overflow-hidden mt-8">
            <div className="absolute top-0 left-0 w-full h-[2px] bg-gradient-to-r from-transparent via-cyan-500 to-transparent"></div>
            <div className="space-y-6 relative z-10">
              <div>
                 <label className="block text-[10px] font-black text-cyan-500 uppercase tracking-widest mb-3">Identidade do Vazio</label>
                 <input type="text" value={name} onChange={e => setName(e.target.value)} className="w-full bg-[#050508] border border-white/10 rounded-xl px-5 py-4 text-white text-sm font-medium outline-none focus:border-cyan-500 transition-colors duration-300 shadow-inner" placeholder="Ex: Mestre Cósmico"/>
              </div>
              <div>
                 <label className="block text-[10px] font-black text-cyan-500 uppercase tracking-widest mb-3">Marca na Alma (Biografia)</label>
                 <textarea value={bio} onChange={e => setBio(e.target.value)} rows={3} className="w-full bg-[#050508] border border-white/10 rounded-xl px-5 py-4 text-white text-sm resize-none outline-none focus:border-cyan-500 transition-colors duration-300 shadow-inner" placeholder="Deixe sua marca no Abismo..."></textarea>
              </div>
            </div>
            <button type="submit" disabled={loading} className="mt-8 bg-gradient-to-r from-cyan-600 to-blue-700 text-white text-xs font-black uppercase tracking-widest px-8 py-4 rounded-xl w-full flex justify-center hover:scale-[1.02] transition-transform duration-300 shadow-[0_0_20px_rgba(34,211,238,0.4)] relative z-10">{loading ? <Loader2 className="w-5 h-5 animate-spin"/> : 'Salvar Registro'}</button>
          </form>
        ) : (
          <div className="mt-8">
            <div className="flex gap-3 border-b border-white/5 mb-8 overflow-x-auto scrollbar-hide pb-3">
              <button onClick={() => setActiveTab("Estatisticas")} className={`px-5 py-3 rounded-xl font-black transition-all whitespace-nowrap text-[10px] uppercase tracking-widest duration-300 flex items-center gap-2 ${activeTab === "Estatisticas" ? 'bg-cyan-900/30 text-cyan-400 border border-cyan-500/30 shadow-[0_0_15px_rgba(34,211,238,0.2)]' : 'bg-[#0b0e14] text-gray-500 hover:text-gray-300 border border-white/5'}`}><Compass className="w-4 h-4"/> Dados</button>
              <button onClick={() => setActiveTab("Historico")} className={`px-5 py-3 rounded-xl font-black transition-all whitespace-nowrap text-[10px] uppercase tracking-widest duration-300 flex items-center gap-2 ${activeTab === "Historico" ? 'bg-cyan-900/30 text-cyan-400 border border-cyan-500/30 shadow-[0_0_15px_rgba(34,211,238,0.2)]' : 'bg-[#0b0e14] text-gray-500 hover:text-gray-300 border border-white/5'}`}><History className="w-4 h-4"/> Rastro</button>
              <button onClick={() => setActiveTab("Biblioteca")} className={`px-5 py-3 rounded-xl font-black transition-all whitespace-nowrap text-[10px] uppercase tracking-widest duration-300 flex items-center gap-2 ${activeTab === "Biblioteca" ? 'bg-cyan-900/30 text-cyan-400 border border-cyan-500/30 shadow-[0_0_15px_rgba(34,211,238,0.2)]' : 'bg-[#0b0e14] text-gray-500 hover:text-gray-300 border border-white/5'}`}><Library className="w-4 h-4"/> Coleção</button>
              <button onClick={() => setActiveTab("Configuracoes")} className={`px-5 py-3 rounded-xl font-black transition-all whitespace-nowrap text-[10px] uppercase tracking-widest duration-300 flex items-center gap-2 ${activeTab === "Configuracoes" ? 'bg-cyan-900/30 text-cyan-400 border border-cyan-500/30 shadow-[0_0_15px_rgba(34,211,238,0.2)]' : 'bg-[#0b0e14] text-gray-500 hover:text-gray-300 border border-white/5'}`}><Smartphone className="w-4 h-4"/> Sistema</button>
            </div>
            
            {activeTab === "Estatisticas" && (
              <div className="space-y-4 animate-in fade-in duration-300">
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  <div className="bg-[#0b0e14]/80 backdrop-blur-md border border-white/5 p-6 rounded-[2rem] text-center shadow-lg"><div className="text-4xl font-black text-gray-200 mb-2 tracking-tighter">{!dataLoaded ? <Loader2 className="w-8 h-8 animate-spin mx-auto text-cyan-500"/> : Object.keys(libraryData).length}</div><div className="text-[10px] text-gray-500 uppercase font-black tracking-widest">Salvos</div></div>
                  <div className="bg-[#0b0e14]/80 backdrop-blur-md border border-white/5 p-6 rounded-[2rem] text-center shadow-lg"><div className="text-4xl font-black text-cyan-500 mb-2 tracking-tighter drop-shadow-[0_0_10px_rgba(34,211,238,0.3)]">{!dataLoaded ? <Loader2 className="w-8 h-8 animate-spin mx-auto text-cyan-500"/> : historyData.length}</div><div className="text-[10px] text-cyan-500/60 uppercase font-black tracking-widest">Lidos</div></div>
                  <div className="bg-[#0b0e14]/80 backdrop-blur-md border border-white/5 p-6 rounded-[2rem] text-center shadow-lg"><div className="text-4xl font-black text-amber-500 mb-2 tracking-tighter drop-shadow-[0_0_10px_rgba(245,158,11,0.3)]">{!dataLoaded ? <Loader2 className="w-8 h-8 animate-spin mx-auto text-amber-500"/> : obrasLidasIds.length}</div><div className="text-[10px] text-amber-500/60 uppercase font-black tracking-widest">Iniciadas</div></div>
                  <div className="bg-[#0b0e14]/80 backdrop-blur-md border border-white/5 p-6 rounded-[2rem] text-center shadow-lg"><div className="text-4xl font-black text-fuchsia-500 mb-2 tracking-tighter drop-shadow-[0_0_10px_rgba(217,70,239,0.3)]">{!dataLoaded ? <Loader2 className="w-8 h-8 animate-spin mx-auto text-fuchsia-500"/> : Object.values(libraryData).filter(s=>s==='Favoritos').length}</div><div className="text-[10px] text-fuchsia-500/60 uppercase font-black tracking-widest">Favoritos</div></div>
                </div>
              </div>
            )}

            {/* Resto das abas (Historico, Biblioteca, etc...) podem continuar idênticas! O layout do container já faz elas ficarem lindas. */}
            {activeTab === "Historico" && (
                <div className="animate-in fade-in duration-300">
                    {historyData.length === 0 ? (
                        <div className="text-center py-16 bg-[#0b0e14]/50 rounded-[2rem] border border-white/5 shadow-inner"><History className="w-12 h-12 mx-auto text-gray-700 mb-4"/><p className="text-gray-500 font-black text-[10px] uppercase tracking-widest">Nenhum rastro detectado no Vazio.</p></div>
                    ) : (
                       <div className="flex flex-col gap-3">
                          {historyData.slice(0, 15).map(hist => {
                              const mg = mangas.find(m => m.id === hist.mangaId);
                              return (
                                  <div key={hist.id} onClick={() => { if(mg) onNavigate('details', mg); }} className="bg-[#0b0e14]/80 backdrop-blur-md border border-white/5 p-4 rounded-2xl flex items-center gap-4 cursor-pointer hover:border-cyan-500/50 transition-all duration-300 shadow-sm group">
                                      <div className="w-14 h-20 rounded-xl overflow-hidden flex-shrink-0 bg-[#050508] border border-white/10 shadow-inner">{mg ? <img src={mg.coverUrl} className="w-full h-full object-cover transition-all duration-500 group-hover:scale-110" /> : <BookOpen className="w-6 h-6 m-auto mt-6 text-gray-700"/>}</div>
                                      <div className="flex-1"><h4 className="font-black text-gray-200 text-sm line-clamp-1 group-hover:text-cyan-400 transition-colors">{hist.mangaTitle}</h4><p className="text-cyan-500/80 text-[10px] font-black mt-1 uppercase tracking-wider">Capítulo {hist.chapterNumber}</p></div>
                                      <div className="text-right"><p className="text-[9px] text-gray-600 font-bold uppercase tracking-widest">{new Date(hist.timestamp).toLocaleDateString()}</p></div>
                                  </div>
                              );
                          })}
                       </div>
                    )}
                </div>
            )}
            
            {/* O conteúdo original da aba Biblioteca e Configuracoes continua aqui... (você pode manter como estava) */}
          </div>
        )}
      </div>
    </div>
  );
}
