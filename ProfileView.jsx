import React, { useState, useEffect, useRef } from 'react';
import { Compass, History, Library, Camera, Edit3, LogOut, Loader2, BookOpen, AlertTriangle, Trophy, Zap, Trash2, RefreshCw, LayoutTemplate, Settings, Flame, Scroll, Users, Shield, ChevronRight, Swords, Moon, Lock, Eye, Bookmark, Hexagon, Crown, Ghost } from 'lucide-react';
import { updateProfile } from "firebase/auth";
import { doc, setDoc, deleteDoc } from "firebase/firestore";
import { auth, db } from './firebase';
import { APP_ID } from './constants';
import { compressImage, getLevelRequirement, getLevelTitle, cleanCosmeticUrl, timeAgo } from './helpers';

// CARTÃO SOMBRIO KAGE (Menos redondo, mais afiado)
const ShadowCard = ({ children, className = "" }) => (
  <div className={`bg-[#0a0a0c]/90 border border-red-600/30 rounded-xl p-5 md:p-7 shadow-[0_0_40px_rgba(220,38,38,0.1)] relative overflow-hidden backdrop-blur-xl ${className}`}>
     <div className="absolute top-0 left-1/2 -translate-x-1/2 w-1/2 h-[1px] bg-gradient-to-r from-transparent via-red-600/60 to-transparent"></div>
     <div className="relative z-10">{children}</div>
  </div>
);

// NOVO COMPONENTE DE EMBLEMA EQUIPÁVEL (Compacto, sombrio e agressivo)
const AchievementBadge = ({ badge, isEquipped, onEquip }) => (
  <div className={`flex flex-col items-center p-3 sm:p-4 border transition-all duration-300 relative group rounded-lg overflow-hidden ${
    badge.condition 
      ? isEquipped
        ? 'bg-gradient-to-br from-red-950/50 to-[#030305] border-red-500 shadow-[0_0_20px_rgba(220,38,38,0.3)] scale-[1.02]'
        : 'bg-[#0a0a0c]/80 border-white/5 hover:border-red-600/50 hover:bg-[#0f0f13] shadow-md hover:-translate-y-1'
      : 'bg-[#030305]/50 border-white/5 opacity-50 grayscale'
  }`}>
    {/* Brilho intenso no topo se equipado */}
    {isEquipped && <div className="absolute top-0 inset-x-0 h-[2px] bg-gradient-to-r from-transparent via-red-500 to-transparent shadow-[0_0_15px_rgba(220,38,38,1)]"></div>}
    
    {/* Container do Ícone Compacto */}
    <div className={`w-12 h-12 mb-3 rounded-lg flex items-center justify-center relative transition-transform duration-300 group-hover:scale-110 ${
        badge.condition ? (isEquipped ? 'bg-red-900/40 border border-red-500/50 shadow-[0_0_15px_rgba(220,38,38,0.5)]' : 'bg-black/50 border border-white/10') : 'bg-transparent'
    }`}>
        <badge.icon className={`w-6 h-6 ${badge.condition ? badge.colorClass : 'text-gray-600'} drop-shadow-lg z-10`} />
    </div>

    <span className={`font-black text-[10px] sm:text-[11px] uppercase tracking-widest text-center line-clamp-1 mb-1 z-10 ${
        badge.condition ? (isEquipped ? 'text-red-400 drop-shadow-[0_0_8px_rgba(248,113,113,0.8)]' : 'text-white') : 'text-gray-500'
    }`}>
        {badge.title}
    </span>
    
    <span className="text-[8px] sm:text-[9px] text-gray-400 font-bold text-center line-clamp-2 mb-4 px-1 leading-tight z-10 h-6">
        {badge.description}
    </span>
    
    {badge.condition ? (
        <button onClick={() => onEquip(badge)} className={`w-full py-2.5 rounded-lg text-[9px] font-black uppercase tracking-widest transition-all duration-300 z-10 ${
            isEquipped 
            ? 'bg-red-600 text-white shadow-[0_0_15px_rgba(220,38,38,0.4)] hover:bg-red-500' 
            : 'bg-transparent border border-red-600/30 text-red-500 hover:bg-red-900/40 hover:border-red-500'
        }`}>
            {isEquipped ? 'Equipado' : 'Equipar'}
        </button>
    ) : (
        <div className="w-full py-2.5 rounded-lg text-[9px] font-black uppercase tracking-widest bg-black/40 border border-white/5 text-gray-600 flex justify-center items-center gap-1.5 z-10">
            <Lock className="w-3 h-3" /> Oculto
        </div>
    )}
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
    try { await updateProfile(auth.currentUser, { displayName: name }); const docData = { coverUrl: coverBase64, avatarUrl: avatarBase64, bio: bio }; await setDoc(doc(db, 'artifacts', APP_ID, 'users', user.uid, 'profile', 'main'), docData, { merge: true }); onUpdateData(docData); showToast('Perfil forjado nas sombras!', 'success'); setIsEditing(false); } catch (error) { showToast(`Erro ao salvar.`, 'error'); } finally { setLoading(false); }
  };

  const executeConfirmAction = async () => {
      if (confirmAction === 'history') { try { historyData.forEach(async (h) => { await deleteDoc(doc(db, 'artifacts', APP_ID, 'users', user.uid, 'history', h.id)); }); showToast("Memórias apagadas.", "success"); } catch(e) { showToast("Erro ao limpar.", "error"); } } 
      else if (confirmAction === 'cache') { localStorage.clear(); sessionStorage.clear(); window.location.reload(true); }
      setConfirmAction(null);
  };

  const level = userProfileData.level || 1; const currentXp = userProfileData.xp || 0; const xpNeeded = getLevelRequirement(level); const progressPercent = Math.min(100, Math.max(0, (currentXp / xpNeeded) * 100));
  const lidosSet = new Set(historyData.map(h => h.mangaId)); const obrasLidasIds = Array.from(lidosSet); const libraryMangaIds = Object.keys(libraryData); const libraryMangas = mangas.filter(m => libraryMangaIds.includes(m.id));
  const eq = userProfileData.equipped_items || {};

  const activeAvatarSrc = (eq.avatar?.preview ? cleanCosmeticUrl(eq.avatar.preview) : null) || avatarBase64 || `https://placehold.co/150x150/0A0E17/22d3ee?text=K`;

  // Dados para os Emblemas
  const readCount = historyData.length;
  const favCount = Object.keys(libraryData).length;
  const crystalsCount = userProfileData.crystals || 0;
  const coinsCount = userProfileData.coins || 0;

  // Lista Mestra de Emblemas (Novos Nomes e Ícones Insanos)
  const badgesList = [
    { id: 'iniciado', icon: Eye, title: "Olho do Corvo", description: "Desvenda 10 capítulos no sistema.", condition: readCount >= 10, colorClass: "text-red-500" },
    { id: 'guardiao', icon: Bookmark, title: "Pacto Sombrio", description: "Sela 5 obras em sua guarda.", condition: favCount >= 5, colorClass: "text-purple-500" },
    { id: 'coletor', icon: Hexagon, title: "Cristal do Abismo", description: "Consome 50 cristais nexo.", condition: crystalsCount >= 50, colorClass: "text-blue-500" },
    { id: 'ouro', icon: Crown, title: "Avareza Escarlate", description: "Acumula 1000 moedas astrais.", condition: coinsCount >= 1000, colorClass: "text-amber-500" },
    { id: 'mestre', icon: Ghost, title: "Espectro Kage", description: "Transcreve a alma ao Nível 10.", condition: level >= 10, colorClass: "text-rose-500" }
  ];

  // Lógica de Equipar Emblema
  const handleEquipBadge = async (badge) => {
    if (!badge.condition) return;
    try {
        const profileRef = doc(db, 'artifacts', APP_ID, 'users', user.uid, 'profile', 'main');
        const currentEquipped = userProfileData.equipped_items || {};
        const isEquipped = currentEquipped.emblema?.id === badge.id;
        
        const newEquipped = { ...currentEquipped };
        if (isEquipped) {
            delete newEquipped.emblema;
            showToast("Selo desequipado.", "info");
        } else {
            newEquipped.emblema = { id: badge.id }; 
            showToast(`${badge.title} equipado.`, "success");
        }
        
        await setDoc(profileRef, { equipped_items: newEquipped }, { merge: true });
        onUpdateData({ equipped_items: newEquipped }); 
    } catch (e) {
        showToast("Erro nas sombras ao equipar.", "error");
    }
  };

  const equippedBadgeId = eq.emblema?.id;
  const equippedBadgeData = badgesList.find(b => b.id === equippedBadgeId);

  return (
    <div className={`animate-in fade-in duration-300 w-full pb-24 font-sans min-h-screen text-gray-200 bg-[#030305] overflow-x-hidden`}>
      
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-red-900/15 via-[#030305] to-[#000000] pointer-events-none z-0"></div>

      {confirmAction && (
          <div className="fixed inset-0 z-[3000] bg-black/80 backdrop-blur-md flex items-center justify-center p-4 animate-in fade-in duration-200">
              <div className="bg-[#0a0a0c] border border-red-600/50 p-8 rounded-xl max-w-sm w-full text-center shadow-[0_0_40px_rgba(220,38,38,0.2)]">
                  <AlertTriangle className="w-12 h-12 text-red-500 mx-auto mb-4 drop-shadow-[0_0_10px_rgba(239,68,68,0.5)]" />
                  <h3 className="text-xl font-black text-white mb-2 uppercase tracking-tight">Confirmar Ação?</h3>
                  <p className="text-sm text-gray-400 mb-8 font-medium">{confirmAction === 'history' ? 'O registro do tempo será apagado permanentemente.' : 'A matriz será recarregada para limpar o fluxo.'}</p>
                  <div className="flex gap-4">
                      <button onClick={() => setConfirmAction(null)} className="flex-1 bg-[#050505] border border-white/10 text-gray-300 font-black py-3 rounded-lg hover:bg-white/5 transition-colors text-xs uppercase tracking-widest">Recuar</button>
                      <button onClick={executeConfirmAction} className="flex-1 bg-red-600/20 text-red-500 border border-red-500/40 font-black py-3 rounded-lg transition-colors hover:bg-red-500 hover:text-white text-xs uppercase tracking-widest shadow-[0_0_15px_rgba(239,68,68,0.3)]">Confirmar</button>
                  </div>
              </div>
          </div>
      )}

      <div className="w-full h-[240px] md:h-[320px] bg-[#050505] relative group overflow-hidden border-b border-red-900/40 z-0">
        {cleanCosmeticUrl(eq.capa_fundo?.preview) ? ( 
            <img src={cleanCosmeticUrl(eq.capa_fundo.preview)} className={`w-full h-full object-cover object-center opacity-70 mix-blend-screen ${eq.capa_fundo.cssClass || ''}`} /> 
        ) : coverBase64 ? ( 
            <img src={coverBase64} className="w-full h-full object-cover object-center opacity-60 mix-blend-screen" /> 
        ) : ( 
            <div className={`w-full h-full bg-gradient-to-br from-red-950 to-black ${eq.capa_fundo?.cssClass || ''}`} /> 
        )}
        
        <div className="absolute inset-0 bg-gradient-to-t from-[#030305] via-[#030305]/60 to-transparent" />
        <div className="absolute inset-0 bg-gradient-to-b from-black/80 via-transparent to-transparent" />
        <div className="absolute inset-0 bg-red-900/10 mix-blend-overlay"></div>
        
        {isEditing && (
            <button onClick={() => coverInputRef.current.click()} className="absolute top-4 right-4 bg-black/60 backdrop-blur-md text-red-500 border border-red-600/50 px-5 py-2.5 rounded-full flex items-center gap-2 text-xs font-black uppercase tracking-widest z-10 hover:bg-red-600 hover:text-white transition-all shadow-[0_0_20px_rgba(220,38,38,0.4)]">
                <Camera className="w-4 h-4" /> Alterar Capa
            </button>
        )}
        <input type="file" accept="image/*" ref={coverInputRef} className="hidden" onChange={(e) => handleImageUpload(e, 'cover')} />
      </div>

      <div className="max-w-6xl mx-auto px-4 sm:px-6 relative z-10">
        
        <div className="flex flex-col md:flex-row md:items-end gap-6 md:gap-10 mb-10 relative -mt-24 md:-mt-28">
          
          <div className={`relative w-40 h-40 md:w-48 md:h-48 rounded-full flex items-center justify-center flex-shrink-0 group ${(!eq.moldura?.preview && eq.moldura) ? eq.moldura.cssClass : ''}`}>
            <div className="absolute -inset-4 rounded-full border border-red-600/20 border-dashed animate-[spin_20s_linear_infinite]"></div>
            <div className="absolute -inset-1 rounded-full border-[3px] border-red-600/60 shadow-[0_0_30px_rgba(220,38,38,0.5)]"></div>

            <div className={`w-full h-full rounded-full bg-[#050505] flex items-center justify-center relative z-10 overflow-hidden shadow-2xl ${!eq.moldura ? 'border-[4px] border-[#030305]' : ''}`}>
               <img src={activeAvatarSrc} className={`w-full h-full object-cover ${eq.avatar?.cssClass || ''}`} alt="Avatar" onError={(e) => e.target.src = `https://placehold.co/150x150/0A0E17/dc2626?text=K`} />
            </div>
            
            {cleanCosmeticUrl(eq.particulas?.preview) && ( <img src={cleanCosmeticUrl(eq.particulas.preview)} className={`absolute inset-[-50%] m-auto w-[200%] h-[200%] object-contain z-0 ${eq.particulas.cssClass || ''}`} style={{ mixBlendMode: 'screen', pointerEvents: 'none' }} /> )}
            {cleanCosmeticUrl(eq.efeito?.preview) && ( <img src={cleanCosmeticUrl(eq.efeito.preview)} className={`absolute inset-0 m-auto w-full h-full object-contain z-20 ${eq.efeito.cssClass || ''}`} style={{ mixBlendMode: 'screen', pointerEvents: 'none' }} /> )}
            {cleanCosmeticUrl(eq.moldura?.preview) && ( <img src={cleanCosmeticUrl(eq.moldura.preview)} className={`absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[140%] h-[140%] max-w-none object-contain object-center z-30 pointer-events-none ${eq.moldura.cssClass || ''}`} /> )}

            {isEditing && <button onClick={() => avatarInputRef.current.click()} className="absolute bottom-2 right-2 bg-red-600 text-white p-3.5 rounded-full z-50 border-4 border-[#030305] hover:bg-red-500 transition-colors shadow-[0_0_20px_rgba(220,38,38,0.8)]"><Camera className="w-5 h-5" /></button>}
            <input type="file" accept="image/*" ref={avatarInputRef} className="hidden" onChange={(e) => handleImageUpload(e, 'avatar')} />
          </div>

          <div className="flex-1 bg-[#0a0a0c]/60 backdrop-blur-md border border-white/5 p-6 rounded-xl shadow-xl flex flex-col md:flex-row items-center md:items-end justify-between gap-6 relative z-20 mb-2 md:mb-0 text-center md:text-left">
              <div>
                  <div className="flex items-center justify-center md:justify-start gap-2 mb-2">
                      <Swords className="w-4 h-4 text-red-500" />
                      <span className="text-[10px] font-black text-gray-400 uppercase tracking-[0.4em]">Ninja Supremo</span>
                  </div>
                  
                  <h1 className={`text-4xl md:text-5xl font-black tracking-tighter drop-shadow-xl flex flex-col md:flex-row items-center gap-2 mb-1 ${eq.nickname ? eq.nickname.cssClass : 'text-white'}`}>
                      {name || 'Oculto'}
                  </h1>
                  <p className="text-gray-500 font-bold text-xs mt-1 drop-shadow-sm">{user.email}</p>
                  
                  <div className="mt-4 flex flex-wrap items-center justify-center md:justify-start gap-3">
                      <div className="bg-[#030305] border border-red-600/40 inline-flex items-center gap-2 px-4 py-2 rounded-lg shadow-[0_0_15px_rgba(220,38,38,0.2)]">
                          <Trophy className="w-4 h-4 text-amber-500" />
                          <span className="text-xs font-black text-amber-500 uppercase tracking-widest">Nível {level} • {getLevelTitle(level)}</span>
                      </div>
                      
                      {equippedBadgeData && (
                          <div className={`bg-gradient-to-r from-black to-[#0a0a0c] border border-white/10 inline-flex items-center gap-2 px-4 py-2 rounded-lg shadow-lg ${equippedBadgeData.colorClass}`}>
                              <equippedBadgeData.icon className="w-4 h-4 drop-shadow-md" />
                              <span className="text-[10px] font-black uppercase tracking-[0.2em]">{equippedBadgeData.title}</span>
                          </div>
                      )}
                  </div>
              </div>

              <div className="flex gap-3 w-full md:w-auto">
                  <button onClick={() => setIsEditing(!isEditing)} className="flex-1 md:flex-none bg-[#050505] border border-red-600/50 text-red-500 px-6 py-3.5 rounded-lg text-[10px] font-black uppercase tracking-widest hover:bg-red-600 hover:text-white transition-all flex items-center justify-center gap-2 shadow-[0_0_15px_rgba(220,38,38,0.1)]">
                      <Edit3 className="w-4 h-4" /> {isEditing ? 'Selar' : 'Forjar Perfil'}
                  </button>
                  <button onClick={onLogout} className="bg-red-500/10 text-red-400 p-3.5 rounded-lg hover:bg-red-600 hover:text-white transition-all border border-red-500/20 shadow-md">
                      <LogOut className="w-4 h-4" />
                  </button>
              </div>
          </div>
        </div>
        
        {bio && !isEditing && <p className="text-gray-400 text-sm mb-10 font-bold bg-gradient-to-r from-[#0a0a0c] to-transparent p-6 rounded-xl border-l-4 border-red-600 whitespace-pre-wrap italic shadow-lg text-center md:text-left max-w-4xl mx-auto md:mx-0">"{bio}"</p>}

        {isEditing && (
          <ShadowCard className="mb-10 animate-in fade-in duration-300">
            <div className="space-y-6">
              <div>
                 <label className="block text-[10px] font-black text-red-500 mb-2 uppercase tracking-widest">Nome nas Sombras</label>
                 <input type="text" value={name} onChange={e => setName(e.target.value)} className="w-full bg-[#050505] border border-white/10 rounded-lg px-5 py-4 text-white text-sm font-medium outline-none focus:border-red-600 transition-colors shadow-inner"/>
              </div>
              <div>
                 <label className="block text-[10px] font-black text-red-500 mb-2 uppercase tracking-widest">Aura Pessoal (Bio)</label>
                 <textarea value={bio} onChange={e => setBio(e.target.value)} rows={3} className="w-full bg-[#050505] border border-white/10 rounded-lg px-5 py-4 text-white text-sm font-medium resize-none outline-none focus:border-red-600 transition-colors shadow-inner"></textarea>
              </div>
            </div>
            <button onClick={handleSave} disabled={loading} className="mt-8 bg-gradient-to-r from-red-700 to-red-500 text-white text-xs font-black px-8 py-4.5 rounded-lg w-full flex justify-center hover:opacity-90 transition-all uppercase tracking-widest shadow-[0_0_20px_rgba(220,38,38,0.4)]">
                {loading ? <Loader2 className="w-5 h-5 animate-spin"/> : 'Selar Identidade'}
            </button>
          </ShadowCard>
        )}

        <div className="mb-12 bg-[#0a0a0c]/80 border border-white/5 rounded-xl p-6 md:p-8 backdrop-blur-md shadow-xl">
            <div className="flex items-center justify-between mb-3">
                <span className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Progresso Sombrio: {currentXp} XP</span>
                <span className="text-[10px] font-black text-red-500 uppercase tracking-widest">{xpNeeded} XP para Nível {level + 1}</span>
            </div>
            <div className="w-full h-2 bg-[#030305] rounded-full overflow-visible border border-white/10 relative">
                 <div className="absolute top-1/2 -translate-y-1/2 left-0 h-[3px] bg-gradient-to-r from-red-900 via-red-500 to-rose-400 shadow-[0_0_20px_rgba(220,38,38,0.8)] transition-all duration-1000 ease-out" style={{ width: `${progressPercent}%` }}>
                     <div className="absolute right-0 top-1/2 -translate-y-1/2 w-4 h-4 bg-white rounded-full shadow-[0_0_15px_rgba(255,255,255,1)]"></div>
                 </div>
            </div>
        </div>

        <div className="mb-8 border-b border-red-900/30">
          <div className="flex gap-4 md:gap-8 overflow-x-auto no-scrollbar snap-x px-2">
            {['Estatísticas', 'Emblemas', 'Histórico', 'Configurações'].map((tab) => (
              <button key={tab} onClick={() => setActiveTab(tab)} className={`snap-start px-4 pb-5 font-black transition-all duration-300 whitespace-nowrap text-[11px] sm:text-xs uppercase tracking-widest md:tracking-[0.2em] relative group
              ${activeTab === tab ? 'text-white' : 'text-gray-500 hover:text-gray-300'}`}>
                {tab}
                {activeTab === tab && (
                    <div className="absolute bottom-[-1px] left-1/2 -translate-x-1/2 w-full h-[3px] bg-gradient-to-r from-transparent via-red-600 to-transparent rounded-t-full shadow-[0_0_15px_rgba(220,38,38,0.8)]"></div>
                )}
              </button>
            ))}
          </div>
        </div>
        
        {activeTab === "Estatísticas" && (
          <div className="animate-in fade-in slide-in-from-left-4 duration-300">
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <div className="bg-[#0a0a0c]/80 backdrop-blur-md border border-white/5 p-6 md:p-8 rounded-xl flex flex-col items-center justify-center shadow-lg hover:border-red-600/50 transition-colors group">
                    <Library className="w-8 h-8 text-amber-500/50 mb-3 group-hover:scale-110 transition-transform duration-300 group-hover:text-amber-500"/>
                    <span className="text-4xl font-black text-white mb-1">{!dataLoaded ? <Loader2 className="w-6 h-6 animate-spin"/> : Object.keys(libraryData).length}</span>
                    <span className="text-[9px] text-gray-500 uppercase font-black tracking-widest">Obras Salvas</span>
                </div>
                <div className="bg-[#0a0a0c]/80 backdrop-blur-md border border-white/5 p-6 md:p-8 rounded-xl flex flex-col items-center justify-center shadow-lg hover:border-red-600/50 transition-colors group">
                    <BookOpen className="w-8 h-8 text-red-500/50 mb-3 group-hover:scale-110 transition-transform duration-300 group-hover:text-red-500"/>
                    <span className="text-4xl font-black text-white mb-1">{!dataLoaded ? <Loader2 className="w-6 h-6 animate-spin"/> : historyData.length}</span>
                    <span className="text-[9px] text-gray-500 uppercase font-black tracking-widest">Caps Lidos</span>
                </div>
                <div className="bg-[#0a0a0c]/80 backdrop-blur-md border border-white/5 p-6 md:p-8 rounded-xl flex flex-col items-center justify-center shadow-lg hover:border-red-600/50 transition-colors group">
                    <Compass className="w-8 h-8 text-blue-500/50 mb-3 group-hover:scale-110 transition-transform duration-300 group-hover:text-blue-500"/>
                    <span className="text-4xl font-black text-white mb-1">{!dataLoaded ? <Loader2 className="w-6 h-6 animate-spin"/> : obrasLidasIds.length}</span>
                    <span className="text-[9px] text-gray-500 uppercase font-black tracking-widest">Iniciadas</span>
                </div>
                <div className="bg-[#0a0a0c]/80 backdrop-blur-md border border-white/5 p-6 md:p-8 rounded-xl flex flex-col items-center justify-center shadow-lg hover:border-red-600/50 transition-colors group">
                    <Zap className="w-8 h-8 text-rose-500/50 mb-3 group-hover:scale-110 transition-transform duration-300 group-hover:text-rose-500"/>
                    <span className="text-4xl font-black text-white mb-1">{currentXp}</span>
                    <span className="text-[9px] text-gray-500 uppercase font-black tracking-widest">Poder Vital</span>
                </div>
            </div>
          </div>
        )}

        {activeTab === "Emblemas" && (
            <div className="animate-in fade-in slide-in-from-left-4 duration-300">
                <ShadowCard>
                  <div className="flex items-center gap-3 mb-8 border-b border-red-900/30 pb-5">
                    <Flame className="w-6 h-6 text-red-600 animate-pulse" />
                    <div>
                        <h2 className="text-2xl font-black text-white tracking-tighter uppercase">Marcas de Sangue</h2>
                        <p className="text-gray-500 text-[10px] font-bold uppercase tracking-widest mt-1">Conquistas gravadas na sua alma. Equipe para exibir no perfil.</p>
                    </div>
                  </div>
                  {/* Grid mais denso para caber os emblemas reduzidos */}
                  <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-4">
                    {badgesList.map(badge => (
                        <AchievementBadge 
                            key={badge.id} 
                            badge={badge} 
                            isEquipped={equippedBadgeId === badge.id} 
                            onEquip={handleEquipBadge} 
                        />
                    ))}
                  </div>
                </ShadowCard>
            </div>
        )}

        {activeTab === "Histórico" && (
            <ShadowCard className="animate-in fade-in slide-in-from-left-4 duration-300">
                {historyData.length === 0 ? (
                    <div className="text-center py-16"><History className="w-12 h-12 mx-auto text-red-900/30 mb-4"/><p className="text-gray-500 text-xs font-black uppercase tracking-widest">As sombras não possuem registros.</p></div>
                ) : (
                   <div className="flex flex-col gap-4">
                      {historyData.slice(0, 15).map(hist => {
                          const mg = mangas.find(m => m.id === hist.mangaId);
                          return (
                              <div key={hist.id} onClick={() => { if(mg) onNavigate('details', mg); }} className="bg-[#050505] border border-white/5 p-4 rounded-xl flex items-center gap-5 cursor-pointer hover:border-red-600/50 transition-all duration-300 group shadow-sm">
                                  <div className="w-14 h-20 rounded-lg overflow-hidden bg-black flex-shrink-0 border border-red-900/30 group-hover:shadow-[0_0_15px_rgba(220,38,38,0.3)]">{mg ? <img src={mg.coverUrl} className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-300" /> : <BookOpen className="w-5 h-5 m-auto mt-7 text-red-900/50"/>}</div>
                                  <div className="flex-1"><h4 className="font-bold text-sm text-white line-clamp-1 group-hover:text-red-500 transition-colors duration-300">{hist.mangaTitle}</h4><p className="text-red-600 font-black text-[10px] uppercase tracking-widest mt-1.5 bg-red-950/30 inline-block px-2 py-1 rounded-md border border-red-900/50">Capítulo {hist.chapterNumber}</p></div>
                                  <p className="text-[9px] text-gray-500 font-bold uppercase hidden sm:block">{timeAgo(hist.timestamp)}</p>
                                  <ChevronRight className="w-5 h-5 text-gray-700 group-hover:text-red-500 transition-colors duration-300" />
                              </div>
                          )
                      })}
                      <button onClick={() => setConfirmAction('history')} className="mt-8 w-full py-4 bg-[#050505] border border-red-900/50 text-red-500 font-black text-[10px] uppercase tracking-widest rounded-lg hover:bg-red-950/40 hover:border-red-500 transition-colors duration-300 flex justify-center items-center gap-2"><Trash2 className="w-4 h-4"/> Limpar Registros Sombrios</button>
                   </div>
                )}
            </ShadowCard>
        )}

        {activeTab === "Configurações" && (
            <div className="animate-in fade-in slide-in-from-left-4 duration-300 space-y-6">
                <ShadowCard>
                  <h3 className="text-xl font-black text-white mb-8 uppercase tracking-tight flex items-center gap-3"><Settings className="w-5 h-5 text-red-500"/> Preferências Kage</h3>
                  
                  <div className="flex items-center justify-between mb-8 pb-8 border-b border-white/5">
                    <div>
                      <p className="text-sm font-black text-white uppercase tracking-widest">Modo de Leitura</p>
                      <p className="text-xs text-gray-500 mt-1 font-bold">Como você consome as memórias.</p>
                    </div>
                    <select value={userSettings?.readMode || 'Cascata'} onChange={(e) => { updateSettings({ readMode: e.target.value }); showToast("Preferência atualizada.", "success"); }} className="bg-[#050505] border border-red-600/30 text-white text-xs font-bold rounded-lg px-5 py-3.5 outline-none focus:border-red-600 shadow-sm cursor-pointer transition-colors duration-300">
                      <option value="Cascata">Cascata</option>
                      <option value="Paginação">Páginas</option>
                    </select>
                  </div>

                  <div className="flex items-center justify-between mb-8 pb-8 border-b border-white/5">
                    <div>
                      <p className="text-sm font-black text-white uppercase tracking-widest">Magia de Economia (Dados)</p>
                      <p className="text-xs text-gray-500 mt-1 font-bold">Reduz o peso visual nas sombras.</p>
                    </div>
                    <label className="relative inline-flex items-center cursor-pointer">
                      <input type="checkbox" className="sr-only peer" checked={userSettings?.dataSaver || false} onChange={(e) => { updateSettings({ dataSaver: e.target.checked }); showToast("Preferência atualizada.", "success"); }} />
                      <div className="w-14 h-7 bg-[#050505] border border-white/20 rounded-full peer peer-checked:after:translate-x-full after:absolute after:top-[2px] after:left-[4px] after:bg-gray-400 peer-checked:after:bg-white after:rounded-full after:h-6 after:w-6 after:transition-all duration-300 peer-checked:bg-gradient-to-r peer-checked:from-red-700 peer-checked:to-red-500 shadow-inner"></div>
                    </label>
                  </div>

                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-black text-white uppercase tracking-widest">Aura do Sistema (Tema)</p>
                      <p className="text-xs text-gray-500 mt-1 font-bold">Padrão de cores da interface.</p>
                    </div>
                    <select value={userSettings?.theme || 'Escuro'} onChange={(e) => { updateSettings({ theme: e.target.value }); showToast("Aura aplicada.", "success"); }} className="bg-[#050505] border border-red-600/30 text-white text-xs font-bold rounded-lg px-5 py-3.5 outline-none focus:border-red-600 shadow-sm cursor-pointer transition-colors duration-300">
                      <option value="Escuro">Escuro</option>
                      <option value="Amoled">Vazio Absoluto</option>
                    </select>
                  </div>
                </ShadowCard>

                <ShadowCard>
                    <button onClick={() => setConfirmAction('cache')} className="flex items-center justify-between w-full text-left group">
                        <div>
                            <p className="text-sm font-black text-white uppercase tracking-widest group-hover:text-red-500 transition-colors duration-300">Limpar Fluxo (Cache)</p>
                            <p className="text-xs text-gray-500 mt-1 font-bold">Resolve distorções na interface.</p>
                        </div>
                        <div className="bg-white/5 p-3 rounded-lg border border-white/10 group-hover:border-red-500/50 group-hover:bg-red-950/20 transition-all duration-300">
                            <RefreshCw className="w-5 h-5 text-gray-400 group-hover:text-red-500 group-hover:rotate-180 transition-all duration-300" />
                        </div>
                    </button>
                </ShadowCard>
            </div>
        )}
      </div>
    </div>
  );
}
