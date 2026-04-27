import React, { useState, useMemo } from 'react';
import { getAuth } from "firebase/auth";
import { app, auth, db } from './firebase'; 
import { Compass, Hexagon, Trophy, Clock, LogOut, ChevronRight, Dices, SlidersHorizontal as SettingsIcon } from 'lucide-react';
import { timeAgo, cleanCosmeticUrl } from './helpers';

// CARD MÁGICO / GLASSMORPHISM PARA PERFIL
const CosmicCard = ({ children, className = "" }) => (
  <div className={`bg-[#0a0f1c]/90 border border-white/5 rounded-3xl p-6 shadow-2xl relative overflow-hidden backdrop-blur-xl ${className}`}>
     <div className="absolute top-0 left-1/2 -translate-x-1/2 w-1/2 h-[1px] bg-gradient-to-r from-transparent via-cyan-500/20 to-transparent"></div>
     <div className="relative z-10">{children}</div>
  </div>
);

// PÍLULA DE ESTATÍSTICA (Nível/XP)
const StatPill = ({ icon: Icon, value, label, gradientClass }) => (
    <div className={`backdrop-blur-md p-4 rounded-3xl border border-white/5 flex items-center gap-4 ${gradientClass}`}>
        <div className="bg-[#050505]/60 border border-white/10 rounded-2xl p-3 flex items-center justify-center">
            <Icon className="w-5 h-5 text-white/70" />
        </div>
        <div className="flex flex-col flex-1">
            <span className="text-2xl font-black text-white leading-none tracking-tight">{value}</span>
            <span className="text-[9px] font-black uppercase tracking-[0.2em] text-white/60 mt-1">{label}</span>
        </div>
    </div>
);

export function ProfileView({ user, userProfileData, historyData, libraryData, dataLoaded, userSettings, updateSettings, onLogout, onUpdateData, showToast, mangas, onNavigate }) {
  const [activeTab, setActiveTab] = useState('Leituras Recentes');

  const totalFavorites = useMemo(() => Object.values(libraryData).filter(status => status === 'Favoritos').length, [libraryData]);
  
  // Matemática do XP Resolvida Localmente (Sem depender do helpers.js)
  const currentLvl = userProfileData.level || 1;
  const currentXp = userProfileData.xp || 0;
  const xpTarget = currentLvl * 1000; // Exemplo: Nível 1 precisa de 1000, Nível 2 de 2000...
  const xpNeededForNext = Math.max(0, xpTarget - currentXp);
  const xpProgress = Math.min(100, (currentXp / xpTarget) * 100);

  const eq = userProfileData.equipped_items || {};
  const activeAvatarSrc = cleanCosmeticUrl(eq.avatar?.preview) || cleanCosmeticUrl(userProfileData.avatarUrl) || user?.photoURL || `https://placehold.co/100x100/0A0E17/22d3ee?text=U`;

  const tabsOptions = ['Leituras Recentes', 'Favoritos no Nexo', 'Configurações Astral'];

  // Lógica de Ganhos Visuais no Perfil
  const equippedFrames = cleanCosmeticUrl(eq.moldura?.preview) ? ( <img src={cleanCosmeticUrl(eq.moldura.preview)} className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[150%] h-[150%] max-w-none object-contain object-center z-30 pointer-events-none" /> ) : null;
  const equippedTitle = eq.titulo ? ( <div className="absolute top-[-30px] left-1/2 -translate-x-1/2 px-3 py-1 bg-[#050505] border border-cyan-500/30 rounded-md shadow-md z-40"><span className="text-[10px] font-black uppercase text-cyan-300 tracking-[0.3em] whitespace-nowrap">{eq.titulo.name}</span></div> ) : null;

  // Lógica de Missão Ativa no Perfil (Visual)
  const activeMissionCard = userProfileData.activeMission ? (
     <CosmicCard className='mb-6 border-amber-500/30'>
        <div className="flex items-center justify-between mb-4">
            <div className='flex items-center gap-3'>
                <Hexagon className="w-6 h-6 text-amber-400" />
                <h3 className="text-xl font-black text-white tracking-tighter uppercase">Missão Astral Ativa</h3>
            </div>
            <span className="text-[10px] font-black text-amber-300 uppercase tracking-widest bg-amber-500/10 px-3 py-1.5 rounded-full border border-amber-500/30 shadow-md">Tempo Esgotando</span>
        </div>
        <p className="text-gray-300 text-sm leading-relaxed font-medium mb-3">{userProfileData.activeMission.title}</p>
        <p className="text-gray-500 text-xs mb-3 font-medium line-clamp-1">Recompensas: +{userProfileData.activeMission.rewardXp} XP | +{userProfileData.activeMission.rewardCoins} M</p>
        <button onClick={() => onNavigate('nexo')} className='w-full bg-[#050505] border border-amber-500/30 text-amber-400 font-black text-xs uppercase tracking-widest rounded-xl py-3.5 flex items-center justify-center gap-2 hover:bg-amber-500 hover:text-black transition-all'>Adentrar o Nexo <ChevronRight className='w-4 h-4'/></button>
     </CosmicCard>
  ) : null;

  return (
    <div className="pb-28 animate-in fade-in duration-500 bg-[#050505] min-h-screen relative font-sans text-white">
      <style>{`body, html { background-color: #050505 !important; }`}</style>
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-indigo-900/10 via-[#050505] to-[#050505] pointer-events-none z-0"></div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10 pt-8">
        
        {/* CABEÇALHO DO PERFIL MÍSTICO */}
        <div className="mb-10 flex flex-col items-center justify-center text-center">
            
            {/* AVATAR E CAPA */}
            <div className={`relative w-full h-40 rounded-[3rem] bg-[#0a0f1c] border border-white/5 mb-[-70px] overflow-hidden z-0 shadow-xl ${eq.capa?.cssClass || ''}`}>
                <img src={cleanCosmeticUrl(eq.capa?.preview) || cleanCosmeticUrl(userProfileData.coverUrl) || `https://placehold.co/1200x400/0A0F1C/0A0F1C`} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700 ease-out" />
                <div className='absolute inset-0 bg-gradient-to-t from-[#0a0f1c] to-transparent'></div>
            </div>

            <div className="relative flex flex-col items-center">
                <div className={`relative w-28 h-28 flex items-center justify-center flex-shrink-0 z-20`}>
                    <div className="w-24 h-24 rounded-full overflow-hidden bg-[#161a25] flex items-center justify-center relative z-10 border-[3px] border-[#0A0E17]">
                        <img src={activeAvatarSrc} className="w-full h-full object-cover" alt="Avatar" onError={(e) => e.target.src = `https://placehold.co/100x100/0A0E17/22d3ee?text=U`} />
                    </div>
                    {equippedFrames}
                    {equippedTitle}
                </div>
                
                <h1 className="text-3xl sm:text-4xl font-black text-white tracking-tighter uppercase drop-shadow-[0_2px_10px_rgba(34,211,238,0.3)] mt-2">{user.displayName || "Explorador"}</h1>
                <p className="text-cyan-300/60 text-[10px] font-black uppercase tracking-[0.4em] mt-2 flex items-center gap-2 drop-shadow-sm">ID: {user.uid.substring(0, 10)}... <Compass className="w-3.5 h-3.5" /></p>
            </div>
        </div>

        {/* ESTATÍSTICAS ALQUÍMICAS */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-10">
            <StatPill icon={Hexagon} value={`Nível ${currentLvl}`} label="Matriz Atual" gradientClass="from-emerald-950/80 to-emerald-950/20 shadow-[0_0_20px_rgba(16,185,129,0.15)] border-emerald-500/20" />
            
            <div className={`backdrop-blur-md p-4 rounded-3xl border border-white/5 flex items-center gap-4 from-cyan-950/80 to-cyan-950/20 shadow-[0_0_20px_rgba(34,211,238,0.15)] border-cyan-500/20`}>
                <div className="flex-1">
                    <div className="flex items-end justify-between mb-2">
                        <span className="text-xl md:text-2xl font-black text-white leading-none tracking-tight">{currentXp} XP</span>
                        <span className="text-[9px] font-black text-cyan-300/60 uppercase tracking-widest">{xpNeededForNext} p/ {currentLvl + 1}</span>
                    </div>
                    <div className="w-full h-1.5 bg-[#050505]/60 rounded-full overflow-hidden border border-white/5 shadow-inner">
                        <div className="h-full bg-gradient-to-r from-cyan-500 to-indigo-500 rounded-full" style={{ width: `${xpProgress}%` }}></div>
                    </div>
                </div>
            </div>

            <StatPill icon={Dices} value={`${userProfileData.coins || 0} M`} label="Moedas Astrais" gradientClass="from-amber-950/60 to-amber-950/10 shadow-[0_0_20px_rgba(245,158,11,0.15)] border-amber-500/20" />
            <StatPill icon={Hexagon} value={`${userProfileData.crystals || 0} C`} label="Cristais Nexo" gradientClass="from-indigo-950/60 to-indigo-950/10 shadow-[0_0_20px_rgba(129,140,248,0.15)] border-indigo-500/20" />
        </div>

        {activeMissionCard}

        {/* SELETOR DE ABAS MÁGICO */}
        <div className="flex flex-wrap items-center gap-3 bg-[#0a0f1c]/70 border border-white/5 p-2 rounded-full mb-10 shadow-lg backdrop-blur-xl">
            {tabsOptions.map(tab => (
                <button key={tab} onClick={() => setActiveTab(tab)} className={`px-6 py-3.5 rounded-full text-[11px] font-black uppercase tracking-widest transition-all duration-300 ${activeTab === tab ? 'bg-cyan-500 text-black shadow-md' : 'text-gray-400 hover:text-white hover:bg-white/5'}`}>
                    {tab}
                </button>
            ))}
        </div>

        {/* CONTEÚDO DAS ABAS */}
        {activeTab === 'Leituras Recentes' && (
            <CosmicCard>
                <div className="flex items-center gap-3 mb-6 border-b border-white/5 pb-5">
                    <div className="bg-[#050505]/60 p-3.5 rounded-2xl border border-white/10"><Clock className="w-6 h-6 text-cyan-400" /></div>
                    <div>
                        <h2 className="text-2xl font-black text-white tracking-tighter uppercase drop-shadow-md">Últimos Registros</h2>
                        <p className="text-gray-400 text-xs font-bold uppercase tracking-widest mt-0.5">Atividades da sua jornada</p>
                    </div>
                </div>
                {historyData.length === 0 ? <p className="text-center text-xs text-gray-400/60 py-6 uppercase tracking-widest font-black border border-white/5 border-dashed rounded-xl">O Vazio não registrou leituras.</p> : historyData.slice(0, 5).map(h => {
                    const m = mangas.find(m => m.id === h.mangaId);
                    if(!m) return null;
                    return (
                        <div key={h.id} onClick={() => onNavigate('details', m)} className="cursor-pointer flex items-center gap-4 bg-[#050505]/60 border border-white/5 rounded-2xl p-4 mb-3.5 hover:border-cyan-500/40 transition-colors group">
                            <img src={cleanCosmeticUrl(m.coverUrl)} className='w-12 h-18 rounded-lg object-cover group-hover:scale-105 transition-transform' />
                            <div className='flex flex-col flex-1 gap-1.5'>
                                <h4 className='font-bold text-sm text-gray-100 group-hover:text-cyan-400 transition-colors'>{m.title}</h4>
                                <span className='text-[11px] font-bold text-cyan-400 w-max bg-cyan-900/30 px-3 py-1 rounded-md border border-cyan-500/20'>Capítulo {h.chapterNumber}</span>
                                <span className='text-[10px] text-gray-500 font-bold uppercase tracking-widest'>{timeAgo(h.timestamp)}</span>
                            </div>
                            <ChevronRight className='w-5 h-5 text-gray-600 group-hover:text-cyan-400 transition-colors'/>
                        </div>
                    );
                })}
            </CosmicCard>
        )}

        {activeTab === 'Favoritos no Nexo' && (
            <CosmicCard>
                <div className="flex items-center gap-3 mb-6 border-b border-white/5 pb-5">
                    <div className="bg-[#050505]/60 p-3.5 rounded-2xl border border-white/10"><Trophy className="w-6 h-6 text-cyan-400" /></div>
                    <div>
                        <h2 className="text-2xl font-black text-white tracking-tighter uppercase drop-shadow-md">Obras de Esplendor</h2>
                        <p className="text-gray-400 text-xs font-bold uppercase tracking-widest mt-0.5">Favoritos vinculados ao Nexo</p>
                    </div>
                </div>
                <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
                    {totalFavorites === 0 ? <div className="col-span-full py-16 text-center text-xs text-gray-400/60 uppercase tracking-widest font-black border border-white/5 border-dashed rounded-xl">O Nexo está aguardando seus favoritos.</div> : null}
                    {Object.entries(libraryData).filter(([mId, status]) => status === 'Favoritos').map(([mId, status]) => {
                        const m = mangas.find(mg => mg.id === parseInt(mId) || mg.id === mId);
                        if (!m) return null;
                        return (
                            <div key={m.id} onClick={() => onNavigate('details', m)} className="cursor-pointer group flex flex-col gap-2">
                                <div className={`relative aspect-[2/3] rounded-xl overflow-hidden bg-[#050505] border border-white/5 group-hover:border-cyan-500/50 shadow-md transition-all duration-300 group-hover:-translate-y-1`}>
                                    <img src={cleanCosmeticUrl(m.coverUrl)} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700 ease-out" loading="lazy" />
                                </div>
                                <h3 className="font-bold text-sm text-gray-200 line-clamp-2 leading-snug group-hover:text-cyan-400 transition-colors duration-200 px-1 mt-1">{m.title}</h3>
                            </div>
                        );
                    })}
                </div>
            </CosmicCard>
        )}

        {activeTab === 'Configurações Astral' && (
            <CosmicCard>
                <div className="flex items-center gap-3 mb-6 border-b border-white/5 pb-5">
                    <div className="bg-[#050505]/60 p-3.5 rounded-2xl border border-white/10"><SettingsIcon className="w-6 h-6
