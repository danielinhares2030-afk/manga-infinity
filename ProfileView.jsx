import React, { useState, useEffect, useRef } from 'react';
import { Compass, History, Library, Smartphone, Camera, Edit3, LogOut, Loader2, UserCircle, BookOpen, AlertTriangle, Shield, Eye, Zap, Database } from 'lucide-react';
import { updateProfile } from "firebase/auth";
import { doc, setDoc, deleteDoc } from "firebase/firestore";
import { auth, db } from './firebase';
import { APP_ID } from './constants';
import { compressImage, getLevelRequirement, getLevelTitle, cleanCosmeticUrl } from './helpers';

export const ProfileView = React.memo(({ user, userProfileData, historyData, libraryData, dataLoaded, userSettings, updateSettings, onLogout, onUpdateData, showToast, mangas, onNavigate }) => {
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
    <div className={`animate-in fade-in duration-500 w-full pb-20 font-sans min-h-screen text-gray-200 ${eq.tema_perfil ? eq.tema_perfil.cssClass : 'bg-[#020204]'}`}>
      
      <style>{`
        .xp-plasma { background: linear-gradient(90deg, #06b6d4, #8b5cf6, #06b6d4); background-size: 200% 100%; animation: move-plasma 2s linear infinite; }
        @keyframes move-plasma { 0% { background-position: 100% 0; } 100% { background-position: -100% 0; } }
        .hex-grid { background-image: radial-gradient(rgba(34, 211, 238, 0.15) 1px, transparent 1px); background-size: 10px 10px; }
      `}</style>

      <div className="h-48 md:h-72 w-full bg-[#050508] relative group overflow-hidden">
        {cleanCosmeticUrl(eq.capa_fundo?.preview) ? ( <img src={cleanCosmeticUrl(eq.capa_fundo.preview)} loading="lazy" onError={(e) => e.target.style.display = 'none'} className={`w-full h-full object-cover opacity-90 ${eq.capa_fundo.cssClass || ''}`} /> ) : coverBase64 ? ( <img src={coverBase64} loading="lazy" className="w-full h-full object-cover opacity-60 mix-blend-luminosity" /> ) : ( <div className={`w-full h-full bg-gradient-to-tr from-[#020204] to-[#0f172a] ${eq.capa_fundo?.cssClass || ''}`} /> )}
        <div className="absolute inset-0 bg-gradient-to-t from-[#020204] via-[#020204]/60 to-transparent" />
        {isEditing && <button onClick={() => coverInputRef.current.click()} className="absolute top-4 right-4 bg-black/80 text-cyan-400 px-4 py-2 rounded-lg flex items-center gap-2 text-[10px] uppercase tracking-widest font-black z-10 transition-colors hover:bg-cyan-900/80 border border-cyan-500/50"><Camera className="w-4 h-4" /> Capa</button>}
        <input type="file" accept="image/*" ref={coverInputRef} className="hidden" onChange={(e) => handleImageUpload(e, 'cover')} />
      </div>

      <div className="max-w-5xl mx-auto px-4 sm:px-6 relative -mt-24 z-10">
        <div className="flex flex-col md:flex-row items-center md:items-end gap-6 mb-10">
          
          <div className={`relative w-36 h-36 md:w-44 md:h-44 rounded-full flex items-center justify-center flex-shrink-0 group ${(!eq.moldura?.preview && eq.moldura) ? eq.moldura.cssClass : ''}`}>
            <div className={`w-full h-full rounded-full bg-[#050508] flex items-center justify-center relative z-10 overflow-hidden ${!eq.moldura ? 'border-4 border-[#020204] shadow-[0_0_30px_rgba(34,211,238,0.3)]' : ''}`}>
               <img src={activeAvatarSrc} loading="lazy" className={`w-full h-full object-cover ${eq.avatar?.cssClass || ''}`} alt="Avatar" onError={(e) => e.target.src = `https://placehold.co/150x150/13151f/3b82f6?text=U`} />
            </div>
            {cleanCosmeticUrl(eq.moldura?.preview) && ( <img src={cleanCosmeticUrl(eq.moldura.preview)} loading="lazy" className={`absolute inset-[-15%] m-auto w-[130%] h-[130%] object-contain z-30 ${eq.moldura.cssClass || ''}`} style={{ mixBlendMode: 'screen', pointerEvents: 'none' }} /> )}
            {isEditing && <button onClick={() => avatarInputRef.current.click()} className="absolute bottom-2 right-2 bg-cyan-600 p-3 rounded-full text-black z-50 shadow-[0_0_15px_rgba(34,211,238,0.8)] border-2 border-[#020204] hover:scale-110 transition-transform"><Camera className="w-5 h-5" /></button>}
            <input type="file" accept="image/*" ref={avatarInputRef} className="hidden" onChange={(e) => handleImageUpload(e, 'avatar')} />
          </div>

          <div className="flex-1 text-center md:text-left w-full mt-4 md:mt-0">
            <h1 className={`text-3xl md:text-5xl font-black tracking-tighter uppercase ${eq.nickname ? eq.nickname.cssClass : 'text-white drop-shadow-[0_0_10px_rgba(255,255,255,0.2)]'}`}>{name || 'Entidade Sem Nome'}</h1>
            <p className="text-cyan-400 font-black mt-1 text-[10px] tracking-[0.4em] uppercase drop-shadow-[0_0_5px_rgba(34,211,238,0.5)]">{user.email}</p>
            {bio && !isEditing && <p className="text-gray-400/80 text-sm mt-3 italic font-medium">"{bio}"</p>}
            
            {/* STATUS WINDOW - SOLO LEVELING STYLE XP BAR */}
            <div className="w-full max-w-2xl mx-auto md:mx-0 bg-[#050508]/90 p-5 rounded-2xl border border-cyan-900/30 mt-6 backdrop-blur-xl relative overflow-hidden shadow-[0_10px_30px_rgba(0,0,0,0.8)]">
              <div className="absolute inset-0 hex-grid opacity-20 pointer-events-none"></div>
              
              <div className="flex justify-between items-end mb-3 relative z-10">
                <div className="flex flex-col text-left">
                   <span className="text-[10px] font-black text-cyan-500 tracking-[0.3em] uppercase mb-1 flex items-center gap-1"><Zap className="w-3 h-3"/> Rank {level}</span>
                   <span className="text-lg font-black text-transparent bg-clip-text bg-gradient-to-r from-white to-cyan-400 uppercase tracking-widest">{getLevelTitle(level)}</span>
                </div>
                <div className="text-right flex flex-col">
                   <span className="text-[9px] font-black text-gray-500 tracking-[0.2em] uppercase mb-1">Essência Absorvida</span>
                   <span className="text-xs font-black text-cyan-400">{currentXp} <span className="text-gray-600">/ {xpNeeded} XP</span></span>
                </div>
              </div>

              <div className="relative w-full h-4 bg-[#020204] rounded-sm overflow-hidden border border-white/5 skew-x-[-10deg]">
                 <div className="absolute top-0 left-0 h-full xp-plasma transition-all duration-1000 ease-out shadow-[0_0_15px_rgba(34,211,238,0.6)]" style={{ width: `${progressPercent}%` }}>
                     <div className="absolute inset-0 bg-[linear-gradient(90deg,transparent_0%,rgba(255,255,255,0.8)_50%,transparent_100%)] w-20 animate-[move-plasma_1.5s_ease-in-out_infinite]"></div>
                 </div>
                 {/* Linhas de Segmentação Tecnológicas */}
                 <div className="absolute inset-0 w-full h-full bg-[linear-gradient(90deg,transparent_98%,rgba(0,0,0,0.8)_100%)] bg-[length:10%_100%] pointer-events-none"></div>
              </div>
            </div>
          </div>

          <div className="flex gap-2 md:self-end mt-4 md:mt-0 relative z-10">
            <button onClick={() => setIsEditing(!isEditing)} className="bg-[#0b0e14] text-cyan-400 px-5 py-3.5 rounded-xl text-[10px] uppercase tracking-widest font-black flex items-center gap-2 transition-all hover:bg-cyan-900/40 border border-cyan-900/50 hover:border-cyan-400 shadow-[0_0_15px_rgba(34,211,238,0.1)]"><Edit3 className="w-4 h-4" /> {isEditing ? 'Cancelar' : 'Sistema'}</button>
            <button onClick={onLogout} className="bg-[#0b0e14] text-red-500 p-3.5 rounded-xl transition-all hover:bg-red-950/40 border border-red-900/50 hover:border-red-500 shadow-[0_0_15px_rgba(239,68,68,0.1)]"><LogOut className="w-5 h-5" /></button>
          </div>
        </div>
        
        {isEditing ? (
          <form onSubmit={handleSave} className="bg-[#050508]/90 border border-cyan-500/30 rounded-2xl p-6 sm:p-8 animate-in slide-in-from-bottom-4 shadow-[0_0_30px_rgba(34,211,238,0.1)] backdrop-blur-xl mt-8">
            <div className="space-y-6">
              <div>
                 <label className="block text-[10px] font-black text-cyan-400 uppercase tracking-widest mb-3">Identidade do Vazio</label>
                 <input type="text" value={name} onChange={e => setName(e.target.value)} className="w-full bg-[#020204] border border-white/10 rounded-xl px-5 py-4 text-white text-sm font-medium outline-none focus:border-cyan-500 transition-colors shadow-inner" placeholder="Ex: Monarca das Sombras"/>
              </div>
              <div>
                 <label className="block text-[10px] font-black text-cyan-400 uppercase tracking-widest mb-3">Marca na Alma (Biografia)</label>
                 <textarea value={bio} onChange={e => setBio(e.target.value)} rows={3} className="w-full bg-[#020204] border border-white/10 rounded-xl px-5 py-4 text-white text-sm resize-none outline-none focus:border-cyan-500 transition-colors shadow-inner" placeholder="Deixe sua marca no Abismo..."></textarea>
              </div>
            </div>
            <button type="submit" disabled={loading} className="mt-8 bg-gradient-to-r from-cyan-600 to-fuchsia-600 text-white text-xs font-black uppercase tracking-widest px-8 py-4 rounded-xl w-full flex justify-center hover:scale-[1.02] transition-transform shadow-[0_0_20px_rgba(34,211,238,0.4)]">{loading ? <Loader2 className="w-5 h-5 animate-spin"/> : 'Sincronizar Dados'}</button>
          </form>
        ) : (
          <div className="mt-10">
            {/* ABAS ESTILIZADAS */}
            <div className="flex gap-2 border-b border-white/10 mb-8 overflow-x-auto scrollbar-hide pb-3">
              {['Estatisticas', 'Historico', 'Biblioteca', 'Configuracoes'].map(tab => (
                 <button key={tab} onClick={() => setActiveTab(tab)} className={`px-6 py-3 rounded-xl font-black transition-all whitespace-nowrap text-[10px] uppercase tracking-[0.2em] duration-300 flex items-center gap-2 ${activeTab === tab ? 'bg-cyan-950/50 text-cyan-400 border border-cyan-500/50 shadow-[0_0_15px_rgba(34,211,238,0.2)]' : 'bg-[#050508] text-gray-500 hover:text-gray-300 border border-white/5 hover:bg-white/5'}`}>
                    {tab === 'Estatisticas' && <Compass className="w-4 h-4"/>}
                    {tab === 'Historico' && <History className="w-4 h-4"/>}
                    {tab === 'Biblioteca' && <Library className="w-4 h-4"/>}
                    {tab === 'Configuracoes' && <Smartphone className="w-4 h-4"/>}
                    {tab === 'Estatisticas' ? 'Dados' : tab === 'Historico' ? 'Rastro' : tab === 'Biblioteca' ? 'Coleção' : 'Sistema'}
                 </button>
              ))}
            </div>
            
            {activeTab === "Estatisticas" && (
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4 animate-in fade-in duration-300">
                  <div className="bg-[#050508] border border-white/5 p-6 rounded-2xl text-center shadow-lg"><div className="text-4xl font-black text-gray-200 mb-2">{!dataLoaded ? <Loader2 className="w-8 h-8 animate-spin mx-auto text-cyan-500"/> : Object.keys(libraryData).length}</div><div className="text-[10px] text-gray-500 uppercase font-black tracking-widest">Salvos</div></div>
                  <div className="bg-[#050508] border border-cyan-900/30 p-6 rounded-2xl text-center shadow-[0_0_15px_rgba(34,211,238,0.1)]"><div className="text-4xl font-black text-cyan-400 mb-2">{!dataLoaded ? <Loader2 className="w-8 h-8 animate-spin mx-auto text-cyan-500"/> : historyData.length}</div><div className="text-[10px] text-cyan-500/60 uppercase font-black tracking-widest">Lidos</div></div>
                  <div className="bg-[#050508] border border-amber-900/30 p-6 rounded-2xl text-center shadow-[0_0_15px_rgba(245,158,11,0.1)]"><div className="text-4xl font-black text-amber-500 mb-2">{!dataLoaded ? <Loader2 className="w-8 h-8 animate-spin mx-auto text-amber-500"/> : obrasLidasIds.length}</div><div className="text-[10px] text-amber-500/60 uppercase font-black tracking-widest">Iniciadas</div></div>
                  <div className="bg-[#050508] border border-fuchsia-900/30 p-6 rounded-2xl text-center shadow-[0_0_15px_rgba(217,70,239,0.1)]"><div className="text-4xl font-black text-fuchsia-500 mb-2">{!dataLoaded ? <Loader2 className="w-8 h-8 animate-spin mx-auto text-fuchsia-500"/> : Object.values(libraryData).filter(s=>s==='Favoritos').length}</div><div className="text-[10px] text-fuchsia-500/60 uppercase font-black tracking-widest">Favoritos</div></div>
                </div>
            )}

            {activeTab === "Historico" && (
                <div className="flex flex-col gap-3 animate-in fade-in duration-300">
                    {historyData.length === 0 ? <p className="text-center py-10 text-gray-500 text-xs font-black uppercase tracking-widest">Vazio Absoluto.</p> : historyData.slice(0, 15).map(hist => {
                        const mg = mangas.find(m => m.id === hist.mangaId);
                        return (
                            <div key={hist.id} onClick={() => { if(mg) onNavigate('details', mg); }} className="bg-[#050508] border border-white/5 p-4 rounded-xl flex items-center gap-4 cursor-pointer hover:border-cyan-500/50 transition-colors group">
                                <div className="w-12 h-16 rounded bg-[#020204] overflow-hidden flex-shrink-0">{mg ? <img src={mg.coverUrl} loading="lazy" className="w-full h-full object-cover group-hover:scale-110 transition-transform" /> : <BookOpen className="w-6 h-6 m-auto mt-4 text-gray-700"/>}</div>
                                <div className="flex-1"><h4 className="font-black text-gray-200 text-sm line-clamp-1 group-hover:text-cyan-400">{hist.mangaTitle}</h4><p className="text-cyan-500/80 text-[10px] font-black mt-1 uppercase tracking-wider">Capítulo {hist.chapterNumber}</p></div>
                                <div className="text-right"><p className="text-[9px] text-gray-600 font-bold uppercase tracking-widest">{new Date(hist.timestamp).toLocaleDateString()}</p></div>
                            </div>
                        );
                    })}
                </div>
            )}

            {/* ABA DE CONFIGURAÇÕES RESTAURADA E ESTILIZADA */}
            {activeTab === "Configuracoes" && (
                <div className="space-y-6 animate-in fade-in duration-300 max-w-2xl">
                    <div className="bg-[#050508] border border-white/5 p-6 rounded-2xl">
                        <h3 className="text-cyan-400 font-black text-xs uppercase tracking-widest mb-6 flex items-center gap-2"><Eye className="w-4 h-4"/> Preferências de Leitura</h3>
                        
                        <div className="flex items-center justify-between py-4 border-b border-white/5">
                            <div><p className="text-white font-bold text-sm">Modo de Leitura</p><p className="text-[10px] text-gray-500 uppercase tracking-widest mt-1">Como as páginas são exibidas</p></div>
                            <select value={userSettings.readMode} onChange={(e) => updateSettings({readMode: e.target.value})} className="bg-[#0b0e14] border border-cyan-900/50 text-cyan-100 text-xs font-black uppercase tracking-widest rounded-lg px-4 py-2 outline-none focus:border-cyan-400">
                                <option value="Cascata">Cascata (Scroll)</option>
                                <option value="Páginas">Páginas (Lado a Lado)</option>
                            </select>
                        </div>
                        
                        <div className="flex items-center justify-between py-4 border-b border-white/5">
                            <div><p className="text-white font-bold text-sm">Economia de Dados</p><p className="text-[10px] text-gray-500 uppercase tracking-widest mt-1">Desfoca capas na Home</p></div>
                            <button onClick={() => updateSettings({dataSaver: !userSettings.dataSaver})} className={`w-12 h-6 rounded-full relative transition-colors duration-300 ${userSettings.dataSaver ? 'bg-cyan-500' : 'bg-gray-700'}`}>
                                <div className={`w-4 h-4 bg-white rounded-full absolute top-1 transition-transform duration-300 ${userSettings.dataSaver ? 'translate-x-7' : 'translate-x-1'}`}></div>
                            </button>
                        </div>

                        <div className="flex items-center justify-between py-4">
                            <div><p className="text-white font-bold text-sm">Tema do Sistema</p><p className="text-[10px] text-gray-500 uppercase tracking-widest mt-1">Cores da Interface</p></div>
                            <select value={userSettings.theme} onChange={(e) => updateSettings({theme: e.target.value})} className="bg-[#0b0e14] border border-cyan-900/50 text-cyan-100 text-xs font-black uppercase tracking-widest rounded-lg px-4 py-2 outline-none focus:border-cyan-400">
                                <option value="Escuro">Padrão do Vazio</option>
                                <option value="OLED">OLED Profundo</option>
                                <option value="Drácula">Drácula</option>
                                <option value="Sangue">Lua de Sangue</option>
                            </select>
                        </div>
                    </div>

                    <div className="bg-red-950/10 border border-red-900/20 p-6 rounded-2xl">
                        <h3 className="text-red-500 font-black text-xs uppercase tracking-widest mb-6 flex items-center gap-2"><Shield className="w-4 h-4"/> Zona de Perigo</h3>
                        <div className="flex flex-col sm:flex-row gap-4">
                            <button onClick={() => setConfirmAction('history')} className="flex-1 bg-[#0b0e14] border border-red-900/30 hover:bg-red-900/30 text-red-400 font-black text-[10px] uppercase tracking-widest py-4 rounded-xl transition-colors flex items-center justify-center gap-2"><Trash2 className="w-4 h-4"/> Apagar Histórico</button>
                            <button onClick={() => setConfirmAction('cache')} className="flex-1 bg-[#0b0e14] border border-amber-900/30 hover:bg-amber-900/30 text-amber-400 font-black text-[10px] uppercase tracking-widest py-4 rounded-xl transition-colors flex items-center justify-center gap-2"><Database className="w-4 h-4"/> Limpar Cache</button>
                        </div>
                    </div>
                </div>
            )}
            
          </div>
        )}
      </div>
    </div>
  );
});
