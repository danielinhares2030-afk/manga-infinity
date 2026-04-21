import React, { useState, useEffect, useRef } from 'react';
import { Compass, History, Library, Smartphone, Camera, Edit3, LogOut, Loader2, BookOpen, AlertTriangle, Trophy, Zap, Trash2, RefreshCw, LayoutTemplate, Settings } from 'lucide-react';
import { updateProfile } from "firebase/auth";
import { doc, setDoc, deleteDoc } from "firebase/firestore";
import { auth, db } from './firebase';
import { APP_ID } from './constants';
import { compressImage, getLevelRequirement, getLevelTitle, cleanCosmeticUrl } from './helpers';

const HexStat = ({ icon: Icon, value, label, color }) => (
  <div className="relative flex flex-col items-center justify-center w-[85px] h-[85px] sm:w-24 sm:h-24 flex-shrink-0 group">
    <svg viewBox="0 0 100 100" className={`absolute inset-0 w-full h-full opacity-10 group-hover:opacity-20 transition-opacity z-0 ${color}`}>
      <path d="M50 5 L95 27.5 L95 72.5 L50 95 L5 72.5 L5 27.5 Z" fill="currentColor" />
    </svg>
    <div className="relative z-10 flex flex-col items-center justify-center px-1 text-center w-full">
      <Icon className={`w-4 h-4 sm:w-5 sm:h-5 mb-1 ${color} drop-shadow-[0_0_8px_currentColor]`} />
      <span className="text-sm sm:text-base font-black text-white tracking-tighter truncate w-full px-2">{value}</span>
      <span className="text-[7px] sm:text-[8px] text-gray-400 uppercase font-black tracking-widest mt-0.5 truncate w-full px-1">{label}</span>
    </div>
  </div>
);

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
    try { await updateProfile(auth.currentUser, { displayName: name }); const docData = { coverUrl: coverBase64, avatarUrl: avatarBase64, bio: bio }; await setDoc(doc(db, 'artifacts', APP_ID, 'users', user.uid, 'profile', 'main'), docData, { merge: true }); onUpdateData(docData); showToast('Aura atualizada!', 'success'); setIsEditing(false); } catch (error) { showToast(`Erro ao salvar.`, 'error'); } finally { setLoading(false); }
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
    <div className={`animate-in fade-in duration-500 w-full pb-24 font-sans min-h-screen text-gray-200 bg-[#020408] relative overflow-hidden`}>
      
      <div className="absolute top-[20%] left-[-10%] w-[500px] h-[500px] bg-cyan-900/10 rounded-full blur-[150px] pointer-events-none"></div>
      <div className="absolute bottom-[20%] right-[-10%] w-[400px] h-[400px] bg-emerald-900/10 rounded-full blur-[120px] pointer-events-none"></div>

      {confirmAction && (
          <div className="fixed inset-0 z-[3000] bg-black/90 backdrop-blur-sm flex items-center justify-center p-4 animate-in fade-in duration-300">
              <div className="bg-[#0b0c14] border border-cyan-500/20 p-8 rounded-2xl max-w-sm w-full text-center shadow-2xl">
                  <AlertTriangle className="w-12 h-12 text-red-500 mx-auto mb-4" />
                  <h3 className="text-xl font-black text-white mb-2 uppercase tracking-tight">Confirmar Ação?</h3>
                  <p className="text-sm text-gray-400 mb-8 font-medium">{confirmAction === 'history' ? 'Isso apagará permanentemente seu histórico de leitura.' : 'O aplicativo será recarregado para limpar o cache.'}</p>
                  <div className="flex gap-4">
                      <button onClick={() => setConfirmAction(null)} className="flex-1 bg-transparent border border-white/10 text-gray-300 font-black py-3 rounded-xl hover:bg-white/5 transition-colors text-xs uppercase tracking-widest">Recuar</button>
                      <button onClick={executeConfirmAction} className="flex-1 bg-red-600/20 text-red-500 border border-red-500/40 font-black py-3 rounded-xl transition-colors hover:bg-red-500 hover:text-white text-xs uppercase tracking-widest">Confirmar</button>
                  </div>
              </div>
          </div>
      )}

      {/* 1. CAPA */}
      <div className="w-full h-[250px] md:h-[320px] relative group overflow-hidden">
        {cleanCosmeticUrl(eq.capa_fundo?.preview) ? ( 
            <img src={cleanCosmeticUrl(eq.capa_fundo.preview)} className={`w-full h-full object-cover object-center opacity-70 mix-blend-screen ${eq.capa_fundo.cssClass || ''}`} /> 
        ) : coverBase64 ? ( 
            <img src={coverBase64} className="w-full h-full object-cover object-center opacity-50 mix-blend-screen" /> 
        ) : ( 
            <div className={`w-full h-full bg-gradient-to-b from-cyan-900/40 to-[#020408] ${eq.capa_fundo?.cssClass || ''}`} /> 
        )}
        
        <div className="absolute inset-0 bg-gradient-to-b from-transparent via-[#020408]/60 to-[#020408]" />
        
        {isEditing && (
            <button onClick={() => coverInputRef.current.click()} className="absolute top-6 right-6 bg-cyan-500/20 backdrop-blur-md text-cyan-400 border border-cyan-500/50 px-5 py-2.5 rounded-full flex items-center gap-2 text-xs font-bold z-10 hover:bg-cyan-500 hover:text-black transition-all shadow-[0_0_20px_rgba(34,211,238,0.3)]">
                <Camera className="w-4 h-4" /> Alterar Paisagem
            </button>
        )}
        <input type="file" accept="image/*" ref={coverInputRef} className="hidden" onChange={(e) => handleImageUpload(e, 'cover')} />
      </div>

      {/* 2. CÁPSULA CENTRAL DO PERFIL */}
      <div className="max-w-4xl mx-auto px-4 sm:px-6 relative z-10 -mt-32">
        
        <div className="flex flex-col items-center text-center">
          
          {/* Avatar Base + Moldura Centralizada perfeitamente */}
          <div className={`relative w-32 h-32 md:w-40 md:h-40 rounded-full flex items-center justify-center mb-5 ${(!eq.moldura?.preview && eq.moldura) ? eq.moldura.cssClass : ''}`}>
            
            {/* Imagem do Avatar em si */}
            <div className={`w-full h-full rounded-full bg-[#020408] border-2 border-[#020408] relative z-10 overflow-hidden`}>
               <img src={activeAvatarSrc} className={`w-full h-full object-cover ${eq.avatar?.cssClass || ''}`} alt="Avatar" />
            </div>
            
            {/* Renderização da Moldura travada no centro sem o mix-blend-screen */}
            {cleanCosmeticUrl(eq.moldura?.preview) && ( 
                <img src={cleanCosmeticUrl(eq.moldura.preview)} className={`absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[125%] h-[125%] max-w-none object-contain object-center z-30 pointer-events-none ${eq.moldura.cssClass || ''}`} /> 
            )}

            {isEditing && <button onClick={() => avatarInputRef.current.click()} className="absolute bottom-1 right-1 bg-cyan-500 text-black p-3 rounded-full z-50 hover:bg-cyan-400 transition-colors shadow-[0_0_15px_rgba(34,211,238,0.5)]"><Camera className="w-4 h-4" /></button>}
            <input type="file" accept="image/*" ref={avatarInputRef} className="hidden" onChange={(e) => handleImageUpload(e, 'avatar')} />
          </div>

          <h1 className={`text-3xl md:text-5xl font-black tracking-tighter drop-shadow-xl ${eq.nickname ? eq.nickname.cssClass : 'text-white'}`}>
              {name || 'Usuário'}
          </h1>
          <p className="text-cyan-500/60 font-bold text-[11px] uppercase tracking-[0.3em] mt-2 mb-6 drop-shadow-sm">{user.email}</p>
          
          <div className="flex items-center gap-3 bg-[#0a0f16]/80 backdrop-blur-md border border-cyan-500/20 px-5 py-2.5 rounded-2xl shadow-[0_5px_20px_rgba(0,0,0,0.5)]">
              <Trophy className="w-4 h-4 text-emerald-400 drop-shadow-[0_0_5px_rgba(52,211,153,0.8)]" />
              <span className="text-xs font-black text-white uppercase tracking-widest">{level} <span className="text-cyan-500 mx-1">•</span> {getLevelTitle(level)}</span>
          </div>

          {bio && !isEditing && <p className="text-gray-400 text-sm mt-6 max-w-lg leading-relaxed font-medium bg-gradient-to-b from-transparent to-[#0a0f16]/30 p-4 rounded-2xl">{bio}</p>}

          <div className="flex gap-4 mt-8 w-full max-w-sm justify-center">
            <button onClick={() => setIsEditing(!isEditing)} className="flex-1 bg-[#0a0f16] border border-cyan-500/30 text-cyan-400 px-6 py-3.5 rounded-2xl text-xs font-black uppercase tracking-widest hover:bg-cyan-500 hover:text-black hover:shadow-[0_0_20px_rgba(34,211,238,0.4)] transition-all flex items-center justify-center gap-2">
                <Edit3 className="w-4 h-4" /> {isEditing ? 'Cancelar' : 'Modificar'}
            </button>
            <button onClick={onLogout} className="bg-rose-500/10 text-rose-500 p-3.5 rounded-2xl hover:bg-rose-600 hover:text-white hover:shadow-[0_0_20px_rgba(225,29,72,0.4)] transition-all border border-rose-500/30">
                <LogOut className="w-5 h-5" />
            </button>
          </div>
        </div>

        {isEditing && (
          <form onSubmit={handleSave} className="bg-[#0a0f16] border border-emerald-500/20 rounded-3xl p-8 mt-10 animate-in fade-in shadow-[0_10px_40px_rgba(0,0,0,0.6)]">
            <div className="space-y-6">
              <div>
                 <label className="block text-[10px] font-black text-emerald-500/80 mb-2 uppercase tracking-widest">Identidade Visual</label>
                 <input type="text" value={name} onChange={e => setName(e.target.value)} className="w-full bg-[#020408] border border-white/5 rounded-2xl px-5 py-4 text-white text-sm font-medium outline-none focus:border-emerald-500 transition-colors shadow-inner"/>
              </div>
              <div>
                 <label className="block text-[10px] font-black text-emerald-500/80 mb-2 uppercase tracking-widest">Sua Essência</label>
                 <textarea value={bio} onChange={e => setBio(e.target.value)} rows={3} className="w-full bg-[#020408] border border-white/5 rounded-2xl px-5 py-4 text-white text-sm font-medium resize-none outline-none focus:border-emerald-500 transition-colors shadow-inner"></textarea>
              </div>
            </div>
            <button type="submit" disabled={loading} className="mt-8 bg-gradient-to-r from-cyan-500 to-emerald-500 text-black text-xs font-black px-8 py-4 rounded-2xl w-full flex justify-center hover:scale-[1.02] transition-transform uppercase tracking-widest shadow-[0_0_20px_rgba(52,211,153,0.4)]">{loading ? <Loader2 className="w-4 h-4 animate-spin"/> : 'Sincronizar Dados'}</button>
          </form>
        )}

        {/* 3. MENU DE ABAS */}
        <div className="mt-14 mb-8 flex justify-center">
          <div className="bg-[#0a0f16]/80 backdrop-blur-xl p-1.5 rounded-full border border-cyan-900/40 inline-flex overflow-x-auto no-scrollbar max-w-full">
            {['Estatísticas', 'Histórico', 'Configurações'].map((tab) => (
              <button 
                key={tab} 
                onClick={() => setActiveTab(tab)} 
                className={`px-6 py-3 rounded-full font-black whitespace-nowrap text-[10px] sm:text-xs uppercase tracking-widest transition-all duration-300
                ${activeTab === tab ? 'bg-gradient-to-r from-cyan-500/20 to-emerald-500/20 text-cyan-300 shadow-[0_0_15px_rgba(34,211,238,0.1)]' : 'text-gray-500 hover:text-white'}`}
              >
                {tab}
              </button>
            ))}
          </div>
        </div>
        
        {/* ÁREA DE CONTEÚDO */}
        {activeTab === "Estatísticas" && (
          <div className="animate-in fade-in slide-in-from-bottom-4 duration-500">
             
            <div className="bg-[#0a0f16]/60 backdrop-blur-md border border-white/5 rounded-3xl p-8 mb-6 relative overflow-hidden">
                <div className="flex justify-between items-end mb-4 relative z-10">
                    <div>
                        <span className="text-[10px] font-black text-cyan-500 uppercase tracking-widest mb-1 block">Afinidade Energética</span>
                        <span className="text-lg font-black text-white tracking-tighter">LVL {level}</span>
                    </div>
                    <div className="text-right">
                        <span className="text-[10px] font-black text-emerald-500 uppercase tracking-widest flex items-center gap-1 justify-end mb-1"><Zap className="w-3 h-3"/> Exp</span>
                        <span className="text-lg font-black text-white tracking-tighter">{currentXp} <span className="text-gray-600 text-sm">/ {xpNeeded}</span></span>
                    </div>
                </div>
                <div className="w-full h-2 bg-[#020408] rounded-full overflow-hidden relative z-10 border border-white/5">
                     <div className="absolute top-0 left-0 h-full bg-gradient-to-r from-cyan-400 to-emerald-400 transition-all duration-1000 ease-out shadow-[0_0_15px_rgba(52,211,153,0.8)]" style={{ width: `${progressPercent}%` }}></div>
                </div>
            </div>

            <div className="flex flex-wrap sm:flex-nowrap gap-4 justify-center">
                <HexStat icon={Library} value={!dataLoaded ? '--' : Object.keys(libraryData).length} label="Favoritos" color="text-cyan-400" />
                <HexStat icon={BookOpen} value={!dataLoaded ? '--' : historyData.length} label="Lidos" color="text-emerald-400" />
                <HexStat icon={Compass} value={!dataLoaded ? '--' : obrasLidasIds.length} label="Iniciados" color="text-teal-400" />
                <HexStat icon={LayoutTemplate} value={getLevelTitle(level).split(' ')[0]} label="Patente" color="text-cyan-200" />
            </div>
          </div>
        )}

        {activeTab === "Histórico" && (
            <div className="bg-[#0a0f16] p-8 rounded-3xl border border-cyan-900/30 shadow-[0_10px_40px_rgba(0,0,0,0.4)] animate-in fade-in slide-in-from-bottom-4 duration-500">
                {historyData.length === 0 ? (
                    <div className="text-center py-16"><History className="w-12 h-12 mx-auto text-cyan-900/50 mb-4"/><p className="text-gray-500 text-xs font-black uppercase tracking-widest">Nenhuma essência rastreada.</p></div>
                ) : (
                   <div className="flex flex-col gap-4">
                      {historyData.slice(0, 15).map(hist => {
                          const mg = mangas.find(m => m.id === hist.mangaId);
                          return (
                              <div key={hist.id} onClick={() => { if(mg) onNavigate('details', mg); }} className="bg-[#020408] border border-white/5 p-4 rounded-2xl flex items-center gap-5 cursor-pointer hover:border-cyan-500/30 hover:bg-[#060913] transition-all group shadow-sm">
                                  <div className="w-14 h-20 rounded-xl overflow-hidden bg-black flex-shrink-0 border border-white/5">{mg ? <img src={mg.coverUrl} className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500" /> : <BookOpen className="w-5 h-5 m-auto mt-7 text-gray-800"/>}</div>
                                  <div className="flex-1">
                                      <h4 className="font-black text-sm text-gray-200 line-clamp-1 group-hover:text-cyan-400 transition-colors">{hist.mangaTitle}</h4>
                                      <p className="text-emerald-500/80 font-bold text-[10px] mt-1.5 uppercase tracking-wider">Capítulo {hist.chapterNumber}</p>
                                  </div>
                                  <div className="hidden sm:block text-right">
                                     <p className="text-[9px] text-gray-600 font-black uppercase tracking-widest">{new Date(hist.timestamp).toLocaleDateString()}</p>
                                  </div>
                              </div>
                          )
                      })}
                      <button onClick={() => setConfirmAction('history')} className="mt-8 w-full py-4 bg-transparent border border-rose-500/30 text-rose-500 font-black text-[10px] uppercase tracking-widest rounded-2xl hover:bg-rose-600/10 transition-colors flex justify-center items-center gap-2"><Trash2 className="w-4 h-4"/> Purificar Histórico</button>
                   </div>
                )}
            </div>
        )}

        {activeTab === "Configurações" && (
            <div className="animate-in fade-in slide-in-from-bottom-4 duration-500 space-y-6">
                <div className="bg-[#0a0f16] border border-emerald-900/30 rounded-3xl p-8 shadow-[0_10px_40px_rgba(0,0,0,0.4)]">
                  <h3 className="text-sm font-black text-white mb-8 uppercase tracking-widest flex items-center gap-3 border-b border-white/5 pb-4"><Settings className="w-5 h-5 text-emerald-400"/> Sistema Base</h3>
                  
                  <div className="flex items-center justify-between mb-8">
                    <div>
                      <p className="text-sm font-bold text-gray-200">Matriz de Leitura</p>
                      <p className="text-[10px] text-gray-500 mt-1 uppercase tracking-widest font-black">Orientação visual.</p>
                    </div>
                    <select value={userSettings?.readMode || 'Cascata'} onChange={(e) => { updateSettings({ readMode: e.target.value }); showToast("Matriz atualizada.", "success"); }} className="bg-[#020408] border border-white/10 text-emerald-400 text-xs font-black uppercase tracking-widest rounded-xl px-5 py-3 outline-none focus:border-emerald-500 shadow-inner">
                      <option value="Cascata">Cascata</option>
                      <option value="Paginação">Páginas</option>
                    </select>
                  </div>

                  <div className="flex items-center justify-between mb-8">
                    <div>
                      <p className="text-sm font-bold text-gray-200">Otimização de Fluxo</p>
                      <p className="text-[10px] text-gray-500 mt-1 uppercase tracking-widest font-black">Economia de dados.</p>
                    </div>
                    <label className="relative inline-flex items-center cursor-pointer">
                      <input type="checkbox" className="sr-only peer" checked={userSettings?.dataSaver || false} onChange={(e) => { updateSettings({ dataSaver: e.target.checked }); showToast("Fluxo atualizado.", "success"); }} />
                      <div className="w-12 h-6 bg-[#020408] border border-white/10 rounded-full peer peer-checked:after:translate-x-full after:absolute after:top-[2px] after:left-[2px] after:bg-gray-600 peer-checked:after:bg-white after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-emerald-500 peer-checked:border-emerald-400"></div>
                    </label>
                  </div>

                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-bold text-gray-200">Espectro de Cor</p>
                      <p className="text-[10px] text-gray-500 mt-1 uppercase tracking-widest font-black">Aura da interface.</p>
                    </div>
                    <select value={userSettings?.theme || 'Escuro'} onChange={(e) => { updateSettings({ theme: e.target.value }); showToast("Espectro aplicado.", "success"); }} className="bg-[#020408] border border-white/10 text-emerald-400 text-xs font-black uppercase tracking-widest rounded-xl px-5 py-3 outline-none focus:border-emerald-500 shadow-inner">
                      <option value="Escuro">Escuro</option>
                      <option value="Amoled">AMOLED</option>
                    </select>
                  </div>
                </div>

                <div className="bg-[#0a0f16] border border-cyan-900/30 rounded-3xl p-6">
                    <button onClick={() => setConfirmAction('cache')} className="flex items-center justify-between w-full text-left group px-2">
                        <div>
                            <p className="text-sm font-black text-gray-300 group-hover:text-cyan-400 transition-colors">Reiniciar Conexão (Limpar Cache)</p>
                            <p className="text-[10px] text-gray-500 mt-1 uppercase tracking-widest font-black">Resolve falhas na matriz e lentidão.</p>
                        </div>
                        <RefreshCw className="w-6 h-6 text-gray-700 group-hover:text-cyan-400 group-hover:rotate-180 transition-all duration-700" />
                    </button>
                </div>
            </div>
        )}
      </div>
    </div>
  );
}
