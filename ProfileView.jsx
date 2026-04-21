import React, { useState, useEffect, useRef } from 'react';
import { Compass, History, Library, Smartphone, Camera, Edit3, LogOut, Loader2, BookOpen, AlertTriangle, Trophy, Zap, Trash2, RefreshCw, LayoutTemplate, Settings } from 'lucide-react';
import { updateProfile } from "firebase/auth";
import { doc, setDoc, deleteDoc } from "firebase/firestore";
import { auth, db } from './firebase';
import { APP_ID } from './constants';
import { compressImage, getLevelRequirement, getLevelTitle, cleanCosmeticUrl } from './helpers';

const HexStat = ({ icon: Icon, value, label, color }) => (
  <div className="relative flex flex-col items-center justify-center w-24 h-24 flex-shrink-0 group">
    <svg viewBox="0 0 100 100" className={`absolute inset-0 w-full h-full opacity-10 group-hover:opacity-20 transition-opacity z-0 ${color}`}>
      <path d="M50 5 L95 27.5 L95 72.5 L50 95 L5 72.5 L5 27.5 Z" fill="currentColor" />
    </svg>
    <div className="relative z-10 flex flex-col items-center justify-center px-1 text-center w-full">
      <Icon className={`w-5 h-5 mb-1 ${color}`} />
      <span className="text-base font-black text-white tracking-tighter truncate w-full px-2">{value}</span>
      <span className="text-[8px] text-gray-400 uppercase font-black tracking-widest mt-0.5 truncate w-full px-1">{label}</span>
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

  const activeAvatarSrc = (eq.avatar?.preview ? cleanCosmeticUrl(eq.avatar.preview) : null) || avatarBase64 || `https://placehold.co/150x150/0A0E17/22d3ee?text=U`;

  return (
    <div className={`animate-in fade-in duration-500 w-full pb-24 font-sans min-h-screen text-gray-200 bg-[#0A0E17]`}>
      
      {confirmAction && (
          <div className="fixed inset-0 z-[3000] bg-black/80 backdrop-blur-sm flex items-center justify-center p-4 animate-in fade-in duration-300">
              <div className="bg-[#111827] border border-cyan-500/20 p-8 rounded-2xl max-w-sm w-full text-center shadow-2xl">
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

      <div className="w-full h-[180px] md:h-[220px] bg-[#0f172a] relative group overflow-hidden border-b border-white/5">
        {cleanCosmeticUrl(eq.capa_fundo?.preview) ? ( 
            <img src={cleanCosmeticUrl(eq.capa_fundo.preview)} className={`w-full h-full object-cover object-center opacity-90 ${eq.capa_fundo.cssClass || ''}`} /> 
        ) : coverBase64 ? ( 
            <img src={coverBase64} className="w-full h-full object-cover object-center opacity-80" /> 
        ) : ( 
            <div className={`w-full h-full bg-gradient-to-br from-cyan-900/30 to-indigo-900/30 ${eq.capa_fundo?.cssClass || ''}`} /> 
        )}
        <div className="absolute inset-x-0 bottom-0 h-20 bg-gradient-to-t from-[#0A0E17] via-transparent to-transparent" />
        
        {isEditing && (
            <button onClick={() => coverInputRef.current.click()} className="absolute top-4 right-4 bg-black/60 backdrop-blur-md text-white px-4 py-2 rounded-full flex items-center gap-2 text-xs font-bold z-10 hover:bg-cyan-500 hover:text-black transition-all border border-white/20 shadow-lg">
                <Camera className="w-4 h-4" /> Alterar Capa
            </button>
        )}
        <input type="file" accept="image/*" ref={coverInputRef} className="hidden" onChange={(e) => handleImageUpload(e, 'cover')} />
      </div>

      <div className="max-w-5xl mx-auto px-4 sm:px-6 relative z-10">
        
        <div className="flex flex-col md:flex-row md:items-start gap-4 mb-6 relative">
          <div className={`relative w-28 h-28 md:w-36 md:h-36 rounded-full flex items-center justify-center flex-shrink-0 -mt-14 md:-mt-16 group ${(!eq.moldura?.preview && eq.moldura) ? eq.moldura.cssClass : ''}`}>
            
            <div className={`w-full h-full rounded-full bg-[#0A0E17] flex items-center justify-center relative z-10 overflow-hidden shadow-xl ${!eq.moldura ? 'border-[5px] border-[#0A0E17] shadow-[0_0_20px_rgba(34,211,238,0.2)]' : ''}`}>
               <img src={activeAvatarSrc} className={`w-full h-full object-cover ${eq.avatar?.cssClass || ''}`} alt="Avatar" />
            </div>
            
            {/* CORREÇÃO DO ENCAIXE DA MOLDURA: Escala para 140% para abraçar o avatar por fora */}
            {cleanCosmeticUrl(eq.particulas?.preview) && ( <img src={cleanCosmeticUrl(eq.particulas.preview)} className={`absolute inset-[-50%] m-auto w-[200%] h-[200%] object-contain z-0 ${eq.particulas.cssClass || ''}`} style={{ mixBlendMode: 'screen', pointerEvents: 'none' }} /> )}
            {cleanCosmeticUrl(eq.efeito?.preview) && ( <img src={cleanCosmeticUrl(eq.efeito.preview)} className={`absolute inset-0 m-auto w-full h-full object-contain z-20 ${eq.efeito.cssClass || ''}`} style={{ mixBlendMode: 'screen', pointerEvents: 'none' }} /> )}
            {cleanCosmeticUrl(eq.moldura?.preview) && ( <img src={cleanCosmeticUrl(eq.moldura.preview)} className={`absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[140%] h-[140%] max-w-none object-contain object-center z-30 pointer-events-none ${eq.moldura.cssClass || ''}`} /> )}

            {isEditing && <button onClick={() => avatarInputRef.current.click()} className="absolute bottom-1 right-1 bg-cyan-500 text-black p-2.5 rounded-full z-50 border-4 border-[#0A0E17] hover:bg-cyan-400 transition-colors shadow-lg"><Camera className="w-4 h-4" /></button>}
            <input type="file" accept="image/*" ref={avatarInputRef} className="hidden" onChange={(e) => handleImageUpload(e, 'avatar')} />
          </div>

          <div className="flex-1 md:pt-4 text-left">
            <h1 className={`text-2xl md:text-3xl font-black tracking-tight drop-shadow-md flex items-center gap-3 ${eq.nickname ? eq.nickname.cssClass : 'text-white'}`}>
                {name || 'Usuário'}
            </h1>
            <p className="text-gray-400 font-medium text-xs mt-0.5 drop-shadow-sm">{user.email}</p>
            
            <div className="mt-3 bg-[#111827] border border-white/5 inline-flex items-center gap-2 px-3 py-1.5 rounded-full">
                <Trophy className="w-3.5 h-3.5 text-cyan-400" />
                <span className="text-xs font-bold text-white uppercase tracking-wider">{level} • {getLevelTitle(level)}</span>
            </div>
          </div>

          <div className="flex gap-2 w-full md:w-auto md:pt-4 justify-start md:justify-end">
            <button onClick={() => setIsEditing(!isEditing)} className="flex-1 md:flex-none bg-[#1e293b] border border-white/5 text-white px-6 py-2.5 rounded-full text-xs font-black uppercase tracking-widest hover:bg-cyan-500 hover:text-black hover:border-cyan-500 transition-all flex items-center justify-center gap-2 shadow-md">
                <Edit3 className="w-4 h-4" /> {isEditing ? 'Cancelar' : 'Editar'}
            </button>
            <button onClick={onLogout} className="bg-red-500/10 text-red-400 p-2.5 rounded-full hover:bg-red-600 hover:text-white transition-all border border-red-500/20 shadow-md">
                <LogOut className="w-5 h-5" />
            </button>
          </div>
        </div>
        
        {bio && !isEditing && <p className="text-gray-300 text-sm mb-8 font-medium bg-[#111827] p-4 rounded-xl border border-white/5 whitespace-pre-wrap">{bio}</p>}

        {isEditing && (
          <form onSubmit={handleSave} className="bg-[#111827] border border-cyan-500/20 rounded-2xl p-6 mb-8 animate-in fade-in shadow-xl">
            <div className="space-y-5">
              <div>
                 <label className="block text-[10px] font-black text-gray-500 mb-1.5 uppercase tracking-widest">Nome de Exibição</label>
                 <input type="text" value={name} onChange={e => setName(e.target.value)} className="w-full bg-[#0A0E17] border border-white/5 rounded-xl px-4 py-3.5 text-white text-sm font-medium outline-none focus:border-cyan-500 transition-colors shadow-inner"/>
              </div>
              <div>
                 <label className="block text-[10px] font-black text-gray-500 mb-1.5 uppercase tracking-widest">Biografia</label>
                 <textarea value={bio} onChange={e => setBio(e.target.value)} rows={3} className="w-full bg-[#0A0E17] border border-white/5 rounded-xl px-4 py-3.5 text-white text-sm font-medium resize-none outline-none focus:border-cyan-500 transition-colors shadow-inner"></textarea>
              </div>
            </div>
            <button type="submit" disabled={loading} className="mt-6 bg-cyan-500 text-black text-xs font-black px-8 py-3.5 rounded-full w-full flex justify-center hover:bg-cyan-400 transition-all uppercase tracking-widest shadow-lg">{loading ? <Loader2 className="w-4 h-4 animate-spin"/> : 'Salvar Alterações'}</button>
          </form>
        )}

        <div className="mb-10 bg-[#111827] border border-white/5 p-6 rounded-2xl relative overflow-hidden shadow-lg">
            <div className="absolute top-[-20%] left-[-10%] w-[150px] h-[150px] bg-cyan-600/10 rounded-full blur-[80px] pointer-events-none"></div>
            
            <div className="flex gap-2 overflow-x-auto flex-nowrap no-scrollbar pb-2 snap-x justify-start sm:justify-around items-center w-full">
                <HexStat icon={Library} value={!dataLoaded ? '--' : Object.keys(libraryData).length} label="Favoritos" color="text-cyan-400" />
                <HexStat icon={BookOpen} value={!dataLoaded ? '--' : historyData.length} label="Lidos" color="text-indigo-400" />
                <HexStat icon={Zap} value={`${progressPercent.toFixed(0)}%`} label="EXP LVL" color="text-amber-400" />
                <HexStat icon={LayoutTemplate} value={getLevelTitle(level).split(' ')[0]} label="Patente" color="text-fuchsia-400" />
            </div>
            
            <div className="w-full h-1.5 bg-[#0A0E17] rounded-full overflow-hidden mt-6 border border-white/5 relative">
                 <div className="absolute top-0 left-0 h-full bg-gradient-to-r from-cyan-400 to-indigo-500 transition-all duration-1000 ease-out shadow-[0_0_10px_rgba(34,211,238,0.6)]" style={{ width: `${progressPercent}%` }}></div>
            </div>
        </div>

        <div className="mb-8 border-b border-white/5">
          <div className="flex gap-6 overflow-x-auto no-scrollbar snap-x px-1">
            {['Estatísticas', 'Histórico', 'Configurações'].map((tab) => (
              <button key={tab} onClick={() => setActiveTab(tab)} className={`snap-start px-5 pb-3 font-black transition-all whitespace-nowrap text-[11px] sm:text-xs uppercase tracking-[0.2em] flex items-center gap-2 relative group
              ${activeTab === tab ? 'text-white' : 'text-gray-500 hover:text-gray-300'}`}>
                {tab}
                {activeTab === tab && (
                    <div className="absolute bottom-[-1px] left-1/2 -translate-x-1/2 w-[70%] h-[3px] bg-gradient-to-r from-cyan-500 to-fuchsia-500 rounded-t-full shadow-[0_0_10px_rgba(34,211,238,0.5)]"></div>
                )}
              </button>
            ))}
          </div>
        </div>
        
        {activeTab === "Estatísticas" && (
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 animate-in fade-in">
            <div className="bg-[#111827] border border-white/5 p-6 rounded-2xl flex flex-col shadow-md">
                <div className="flex justify-between items-center mb-1"><span className="text-[9px] text-gray-500 uppercase font-bold">Salvos</span> <Library className="w-3 h-3 text-cyan-500/50"/></div>
                <span className="text-3xl font-black text-white">{!dataLoaded ? <Loader2 className="w-5 h-5 animate-spin"/> : Object.keys(libraryData).length}</span>
            </div>
            <div className="bg-[#111827] border border-white/5 p-6 rounded-2xl flex flex-col shadow-md">
                <div className="flex justify-between items-center mb-1"><span className="text-[9px] text-gray-500 uppercase font-bold">Capítulos</span> <BookOpen className="w-3 h-3 text-indigo-500/50"/></div>
                <span className="text-3xl font-black text-white">{!dataLoaded ? <Loader2 className="w-5 h-5 animate-spin"/> : historyData.length}</span>
            </div>
            <div className="bg-[#111827] border border-white/5 p-6 rounded-2xl flex flex-col shadow-md">
                <div className="flex justify-between items-center mb-1"><span className="text-[9px] text-gray-500 uppercase font-bold">Iniciadas</span> <Compass className="w-3 h-3 text-indigo-500/50"/></div>
                <span className="text-3xl font-black text-white">{!dataLoaded ? <Loader2 className="w-5 h-5 animate-spin"/> : obrasLidasIds.length}</span>
            </div>
            <div className="bg-[#111827] border border-white/5 p-6 rounded-2xl flex flex-col shadow-md">
                <div className="flex justify-between items-center mb-1"><span className="text-[9px] text-gray-500 uppercase font-bold">Total XP</span> <Zap className="w-3 h-3 text-amber-500/50"/></div>
                <span className="text-3xl font-black text-white">{currentXp}</span>
            </div>
          </div>
        )}

        {activeTab === "Histórico" && (
            <div className="bg-[#111827] p-6 rounded-2xl border border-white/5 shadow-lg animate-in fade-in">
                {historyData.length === 0 ? (
                    <div className="text-center py-10"><History className="w-10 h-10 mx-auto text-gray-600 mb-3"/><p className="text-gray-500 text-sm font-medium">Nenhuma leitura recente.</p></div>
                ) : (
                   <div className="flex flex-col gap-4">
                      {historyData.slice(0, 15).map(hist => {
                          const mg = mangas.find(m => m.id === hist.mangaId);
                          return (
                              <div key={hist.id} onClick={() => { if(mg) onNavigate('details', mg); }} className="bg-[#0A0E17] border border-white/5 p-4 rounded-xl flex items-center gap-4 cursor-pointer hover:bg-[#1e293b] transition-colors group shadow-sm">
                                  <div className="w-12 h-16 rounded-lg overflow-hidden bg-black flex-shrink-0 border border-white/5">{mg ? <img src={mg.coverUrl} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300" /> : <BookOpen className="w-5 h-5 m-auto mt-5 text-gray-700"/>}</div>
                                  <div className="flex-1"><h4 className="font-bold text-sm text-white line-clamp-1 group-hover:text-cyan-400">{hist.mangaTitle}</h4><p className="text-gray-400 text-xs mt-1">Capítulo {hist.chapterNumber}</p></div>
                                  <p className="text-[10px] text-gray-600 font-bold uppercase">{new Date(hist.timestamp).toLocaleDateString()}</p>
                              </div>
                          )
                      })}
                      <button onClick={() => setConfirmAction('history')} className="mt-4 w-full py-3 bg-transparent border border-red-500/20 text-red-500 font-bold text-[10px] uppercase tracking-widest rounded-full hover:bg-red-900 transition-colors flex justify-center items-center gap-2"><Trash2 className="w-4 h-4"/> Limpar Histórico</button>
                   </div>
                )}
            </div>
        )}

        {activeTab === "Configurações" && (
            <div className="animate-in fade-in space-y-4">
                <div className="bg-[#111827] border border-white/5 rounded-2xl p-6">
                  <h3 className="text-lg font-bold text-white mb-6 uppercase tracking-tight flex items-center gap-2"><Settings className="w-5 h-5 text-cyan-400"/> Preferências do App</h3>
                  
                  <div className="flex items-center justify-between mb-6">
                    <div>
                      <p className="text-sm font-bold text-white">Modo de Leitura</p>
                      <p className="text-xs text-gray-500 mt-1">Sua orientação de página preferida.</p>
                    </div>
                    <select value={userSettings?.readMode || 'Cascata'} onChange={(e) => { updateSettings({ readMode: e.target.value }); showToast("Preferência atualizada.", "success"); }} className="bg-[#0A0E17] border border-white/10 text-white text-xs font-bold rounded-xl px-4 py-2.5 outline-none focus:border-cyan-500 shadow-sm">
                      <option value="Cascata">Cascata</option>
                      <option value="Paginação">Páginas</option>
                    </select>
                  </div>

                  <div className="flex items-center justify-between mb-6">
                    <div>
                      <p className="text-sm font-bold text-white">Economia de Dados</p>
                      <p className="text-xs text-gray-500 mt-1">Carregar imagens em qualidade reduzida.</p>
                    </div>
                    <label className="relative inline-flex items-center cursor-pointer">
                      <input type="checkbox" className="sr-only peer" checked={userSettings?.dataSaver || false} onChange={(e) => { updateSettings({ dataSaver: e.target.checked }); showToast("Preferência atualizada.", "success"); }} />
                      <div className="w-11 h-6 bg-[#0A0E17] border border-white/10 rounded-full peer peer-checked:after:translate-x-full after:absolute after:top-[2px] after:left-[2px] after:bg-gray-400 peer-checked:after:bg-white after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-cyan-500"></div>
                    </label>
                  </div>

                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-bold text-white">Tema Visual</p>
                      <p className="text-xs text-gray-500 mt-1">Padrão de cores da interface.</p>
                    </div>
                    <select value={userSettings?.theme || 'Escuro'} onChange={(e) => { updateSettings({ theme: e.target.value }); showToast("Tema aplicado.", "success"); }} className="bg-[#0A0E17] border border-white/10 text-white text-xs font-bold rounded-xl px-4 py-2.5 outline-none focus:border-cyan-500 shadow-sm">
                      <option value="Escuro">Escuro</option>
                      <option value="Amoled">AMOLED</option>
                    </select>
                  </div>
                </div>

                <div className="bg-[#111827] border border-white/5 rounded-2xl p-6">
                    <button onClick={() => setConfirmAction('cache')} className="flex items-center justify-between w-full text-left group">
                        <div>
                            <p className="text-sm font-bold text-white group-hover:text-cyan-400 transition-colors">Limpar Cache Temporário</p>
                            <p className="text-xs text-gray-500 mt-1">Resolve lentidões e força atualização dos dados.</p>
                        </div>
                        <RefreshCw className="w-5 h-5 text-gray-600 group-hover:text-cyan-400 group-hover:rotate-180 transition-all duration-500" />
                    </button>
                </div>
            </div>
        )}
      </div>
    </div>
  );
}
