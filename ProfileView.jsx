import React, { useState, useMemo } from 'react';
import { getAuth, updateProfile } from "firebase/auth";
import { app, auth, db } from './firebase'; 
import { Compass, Hexagon, Trophy, Clock, LogOut, ChevronRight, Dices, SlidersHorizontal as SettingsIcon, PenTool, Share2, MapPin, Calendar, Crown, BookOpen, Bookmark, Flame, Scrolls, BookUser, ShieldCheck } from 'lucide-react';
import { timeAgo, cleanCosmeticUrl } from './helpers';
import { InfinityLogo } from './UIComponents';

// CARTÃO ALQUÍMICO / MÁGICO PARA PERFIL
const AlchemyCard = ({ children, className = "" }) => (
  <div className={`bg-[#0a0f1c]/90 border border-[#b59410]/50 rounded-2xl p-6 shadow-2xl relative overflow-hidden backdrop-blur-xl ${className}`}>
     <div className="absolute top-0 left-1/2 -translate-x-1/2 w-1/2 h-[1px] bg-gradient-to-r from-transparent via-[#b59410]/50 to-transparent"></div>
     <div className="relative z-10">{children}</div>
  </div>
);

// PÍLULA DE ESTATÍSTICA (Nível/XP) NO ESTILO MÁGICO
const MagicStatPill = ({ icon: Icon, value, label, colorClass }) => (
    <div className={`backdrop-blur-md p-4 rounded-2xl border border-[#b59410]/30 flex items-center gap-4 bg-[#050505]/60`}>
        <div className={`border border-[#b59410]/50 rounded-2xl p-3 flex items-center justify-center`}>
            <Icon className={`w-5 h-5 ${colorClass}`} />
        </div>
        <div className="flex flex-col flex-1">
            <span className="text-2xl font-black text-white leading-none tracking-tight">{value}</span>
            <span className="text-[9px] font-black uppercase tracking-[0.2em] text-[#b59410]/80 mt-1">{label}</span>
        </div>
    </div>
);

// EMBLEMA DE CONQUISTA
const AchievementBadge = ({ icon: Icon, title, description, colorClass }) => (
  <div className={`flex flex-col items-center p-4 border border-[#b59410]/30 rounded-xl bg-[#050505]/40 group hover:border-[#b59410]/70 transition-all duration-300 ${colorClass}`}>
    <Icon className={`w-10 h-10 mb-3`} />
    <span className="font-black text-xs text-white uppercase tracking-wider text-center line-clamp-1">{title}</span>
    <span className="text-[9px] text-gray-400 font-medium text-center line-clamp-2 mt-1">{description}</span>
  </div>
);

export function ProfileView({ user, userProfileData, historyData, libraryData, dataLoaded, userSettings, updateSettings, onLogout, onUpdateData, showToast, mangas, onNavigate }) {
  const [activeTab, setActiveTab] = useState('Leituras Recentes');
  const [isEditingBio, setIsEditingBio] = useState(false);
  const [newBio, setNewBio] = useState(userProfileData.bio || '');

  const totalFavorites = useMemo(() => Object.values(libraryData).filter(status => status === 'Favoritos').length, [libraryData]);
  
  // Matemática do XP Resolvida Localmente
  const currentLvl = userProfileData.level || 1;
  const currentXp = userProfileData.xp || 0;
  const xpTarget = currentLvl * 1000; 
  const xpNeededForNext = Math.max(0, xpTarget - currentXp);
  const xpProgress = Math.min(100, (currentXp / xpTarget) * 100);

  const eq = userProfileData.equipped_items || {};
  const activeAvatarSrc = cleanCosmeticUrl(eq.avatar?.preview) || cleanCosmeticUrl(userProfileData.avatarUrl) || user?.photoURL || `https://placehold.co/100x100/0A0E17/22d3ee?text=U`;
  const activeCoverSrc = cleanCosmeticUrl(eq.capa?.preview) || cleanCosmeticUrl(userProfileData.coverUrl) || `https://placehold.co/1200x600/1a0b2e/000000`;

  const tabsOptions = ['Leituras Recentes', 'Configurações Astral'];

  // Separa o nome para dar o efeito de duas cores (Ex: Daniel LINHARES)
  const nameParts = (user.displayName || "Explorador").split(' ');
  const firstName = nameParts[0];
  const lastName = nameParts.slice(1).join(' ');

  // Formata a data de criação da conta se existir
  const creationTime = user?.metadata?.creationTime ? new Date(user.metadata.creationTime).toLocaleDateString('pt-BR', { month: 'short', year: 'numeric' }) : 'Desconhecido';

  // Lógica de Missão Ativa no Perfil (Visual)
  const activeMissionCard = userProfileData.activeMission ? (
     <AlchemyCard className='mb-6 border-amber-500/30'>
        <div className="flex items-center justify-between mb-4">
            <div className='flex items-center gap-3'>
                <Hexagon className="w-6 h-6 text-amber-400" />
                <h3 className="text-xl font-black text-white tracking-tighter uppercase">Grimório Astral Ativo</h3>
            </div>
            <span className="text-[10px] font-black text-amber-300 uppercase tracking-widest bg-amber-500/10 px-3 py-1.5 rounded-full border border-amber-500/30 shadow-md">Tempo Esgotando</span>
        </div>
        <p className="text-gray-300 text-sm leading-relaxed font-medium mb-3">{userProfileData.activeMission.title}</p>
        <p className="text-gray-500 text-xs mb-3 font-medium line-clamp-1">Recompensas: +{userProfileData.activeMission.rewardXp} XP | +{userProfileData.activeMission.rewardCoins} M</p>
        <button onClick={() => onNavigate('nexo')} className='w-full bg-[#050505] border border-amber-500/30 text-amber-400 font-black text-xs uppercase tracking-widest rounded-xl py-3.5 flex items-center justify-center gap-2 hover:bg-amber-500 hover:text-black transition-all'>Adentrar o Nexo <ChevronRight className='w-4 h-4'/></button>
     </AlchemyCard>
  ) : null;

  return (
    <div className="pb-28 animate-in fade-in duration-500 bg-[#050505] min-h-screen relative font-sans text-white overflow-x-hidden">
      <style>{`body, html { background-color: #050505 !important; }`}</style>
      
      {/* HEADER: IMAGEM DE CAPA COM FADE INFERIOR PROFUNDO */}
      <div className="absolute top-0 left-0 w-full h-[50vh] md:h-[60vh] z-0">
          <img src={activeCoverSrc} className="w-full h-full object-cover opacity-60 mix-blend-screen" alt="Capa" />
          <div className="absolute inset-0 bg-gradient-to-t from-[#050505] via-[#050505]/80 to-transparent"></div>
          <div className="absolute inset-0 bg-gradient-to-b from-[#050505]/40 to-transparent"></div>
      </div>

      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10 pt-20 md:pt-32">
        
        {/* BLOCO SUPERIOR: AVATAR + NOME + LEVEL */}
        <div className="flex flex-col md:flex-row items-center md:items-end gap-6 md:gap-10 mb-8 relative">
            
            {/* AVATAR COM ANÉIS MÁGICOS */}
            <div className="relative w-36 h-36 md:w-44 md:h-44 flex-shrink-0">
                {/* Anéis de energia rodando */}
                <div className="absolute -inset-3 rounded-full border border-[#b59410]/30 border-dashed animate-[spin_15s_linear_infinite]"></div>
                <div className="absolute -inset-1 rounded-full border-[2px] border-[#b59410]/50 shadow-[0_0_20px_rgba(181,148,16,0.5)]"></div>
                
                <div className="w-full h-full rounded-full overflow-hidden bg-[#0a0f1c] relative z-10 border-2 border-black">
                    <img src={activeAvatarSrc} className="w-full h-full object-cover" alt="Avatar" />
                </div>
                
                {/* Badge Alquimista */}
                <div className="absolute -bottom-3 left-1/2 -translate-x-1/2 z-20 bg-gradient-to-r from-[#b59410] to-[#fbd38d] text-black font-black text-[10px] px-4 py-1 rounded-full border-2 border-[#050505] shadow-[0_0_15px_rgba(181,148,16,0.6)] tracking-widest uppercase">
                    Alquimista Elite
                </div>

                {cleanCosmeticUrl(eq.moldura?.preview) && ( <img src={cleanCosmeticUrl(eq.moldura.preview)} className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[140%] h-[140%] max-w-none object-contain object-center z-30 pointer-events-none" /> )}
            </div>

            {/* INFO DO USUÁRIO */}
            <div className="flex-1 w-full text-center md:text-left flex flex-col md:block">
                <div className="flex items-center justify-center md:justify-start gap-2 mb-1">
                    <Crown className="w-4 h-4 text-[#b59410] fill-[#b59410]" />
                    <span className="text-[10px] font-black text-gray-300 uppercase tracking-[0.3em]">Magister Supremo /////</span>
                </div>
                
                <h1 className="text-4xl md:text-6xl font-black leading-none tracking-tighter drop-shadow-xl mb-2 flex flex-col md:flex-row gap-0 md:gap-3 items-center md:items-baseline">
                    <span className="text-white">{firstName}</span>
                    {lastName && <span className="bg-gradient-to-r from-[#b59410] to-[#fbd38d] bg-clip-text text-transparent">{lastName}</span>}
                </h1>
                
                <p className="text-sm md:text-base text-gray-400 italic mb-6">"{userProfileData.bio || 'Desbravando tomos antigos, um capítulo por vez.'}"</p>

                {/* BARRA DE PROGRESSO DE NÍVEL (Estilo lâmina de energia) */}
                <div className="w-full max-w-2xl">
                    <div className="flex items-center justify-between mb-2">
                        <span className="text-sm font-black text-white uppercase tracking-widest"><span className="text-[#b59410]">ARCÂNIA</span> {currentLvl}</span>
                        <span className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">{currentXp} XP</span>
                    </div>
                    <div className="relative h-1.5 w-full bg-white/5 rounded-full overflow-visible">
                        <div className="absolute top-1/2 -translate-y-1/2 left-0 h-[2px] bg-gradient-to-r from-[#b59410] via-[#fbd38d] to-[#b59410] shadow-[0_0_10px_rgba(181,148,16,0.8)] transition-all duration-1000" style={{ width: `${xpProgress}%` }}>
                            {/* Ponto de luz na ponta da barra */}
                            <div className="absolute right-0 top-1/2 -translate-y-1/2 w-3 h-3 bg-white rounded-full shadow-[0_0_15px_rgba(255,255,255,1)]"></div>
                        </div>
                    </div>
                    <p className="text-[9px] text-gray-500 font-bold mt-2 uppercase tracking-widest">{xpTarget} XP para a próxima Arcânia {currentLvl + 1}</p>
                </div>
            </div>
            
            {/* BOTÃO EDITAR PERFIL */}
            <div className="hidden md:block absolute top-0 right-0">
                <button className="border border-[#b59410]/50 text-[#b59410] hover:bg-[#b59410]/10 hover:border-[#b59410]/80 px-6 py-2.5 rounded-full text-[10px] font-black uppercase tracking-widest flex items-center gap-2 transition-all shadow-[0_0_15px_rgba(181,148,16,0.2)]">
                    <PenTool className="w-3.5 h-3.5" /> Transmutar Perfil
                </button>
            </div>
        </div>

        {/* BOTÕES DE AÇÃO RÁPIDA */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-10">
            <button className="bg-transparent border border-amber-500/50 text-amber-400 hover:bg-amber-500/10 px-4 py-3.5 rounded-xl text-[10px] font-black uppercase tracking-widest flex items-center justify-center gap-2 transition-all shadow-[0_0_15px_rgba(245,158,11,0.1)]">
                <ShieldCheck className="w-4 h-4" /> Grimório do Nexo
            </button>
            <button className="bg-transparent border border-white/10 text-gray-300 hover:bg-white/5 px-4 py-3.5 rounded-xl text-[10px] font-black uppercase tracking-widest flex items-center justify-center gap-2 transition-all">
                <Share2 className="w-4 h-4" /> Convocar Aliado
            </button>
        </div>

        {/* ESTATÍSTICAS ALQUÍMICAS */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-10">
            <MagicStatPill icon={BookOpen} value={historyData.length} label="Tomos Lidos" colorClass="text-purple-400" />
            <MagicStatPill icon={Bookmark} value={totalFavorites} label="Tomos Favoritos" colorClass="text-amber-400" />
            <MagicStatPill icon={Hexagon} value={userProfileData.crystals || 0} label="Cristais Nexo" colorClass="text-blue-400" />
            <MagicStatPill icon={Flame} value={userProfileData.coins || 0} label="Moedas Astrais" colorClass="text-rose-400" />
        </div>

        {/* SEÇÃO DE CONQUISTAS (NOVO) */}
        <AlchemyCard className="mb-10">
          <div className="flex items-center gap-3 mb-6 border-b border-[#b59410]/30 pb-5">
            <Trophy className="w-6 h-6 text-[#b59410]" />
            <h2 className="text-2xl font-black text-white tracking-tighter uppercase">Livro das Conquistas</h2>
          </div>
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-4">
            <AchievementBadge icon={Scrolls} title="Iniciado das Letras" description="Lê teus primeiros 10 tomos." colorClass="text-green-400" />
            <AchievementBadge icon={BookUser} title="Guardião de Favoritos" description="Venera 5 obras em teus favoritos." colorClass="text-yellow-400" />
            <AchievementBadge icon={Hexagon} title="Coletor Nexo I" description="Acumula 50 cristais do Nexo." colorClass="text-blue-400" />
            <AchievementBadge icon={Flame} title="Ouro Astral" description="Coleta 1000 moedas astrais." colorClass="text-red-400" />
            <AchievementBadge icon={ShieldCheck} title="Mestre Elite" description="Alcança a Arcânia nível 10." colorClass="text-purple-400" />
          </div>
        </AlchemyCard>

        {/* TABS E CONTEÚDOS INFERIORES */}
        <div className="border-t border-white/10 pt-10">
            <div className="flex items-center gap-2 overflow-x-auto no-scrollbar mb-8 bg-white/5 p-2 rounded-xl">
                {tabsOptions.map(tab => (
                    <button key={tab} onClick={() => setActiveTab(tab)} className={`px-6 py-3 rounded-xl text-[10px] font-black uppercase tracking-widest whitespace-nowrap transition-all border ${activeTab === tab ? 'bg-gradient-to-r from-[#b59410] to-[#fbd38d] text-black border-transparent shadow-[0_0_15px_rgba(181,148,16,0.3)]' : 'bg-transparent text-gray-400 border-transparent hover:text-white'}`}>
                        {tab}
                    </button>
                ))}
            </div>

            {/* CONTEÚDO DAS ABAS */}
            {activeTab === 'Leituras Recentes' && (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {historyData.length === 0 ? <p className="col-span-full text-center text-xs text-gray-500 py-6 uppercase tracking-widest font-black">O Vazio não registrou tomos.</p> : historyData.slice(0, 5).map(h => {
                        const m = mangas.find(m => m.id === h.mangaId);
                        if(!m) return null;
                        return (
                            <div key={h.id} onClick={() => onNavigate('details', m)} className="cursor-pointer flex items-center gap-4 bg-black/40 border border-[#b59410]/30 rounded-xl p-3 hover:border-[#b59410]/60 transition-colors group">
                                <img src={cleanCosmeticUrl(m.coverUrl)} className='w-10 h-14 rounded-lg object-cover group-hover:scale-105 transition-transform' />
                                <div className='flex flex-col flex-1 gap-1'>
                                    <h4 className='font-bold text-sm text-gray-200 group-hover:text-[#b59410] transition-colors'>{m.title}</h4>
                                    <span className='text-[10px] font-bold text-purple-400 w-max bg-purple-500/10 px-2 py-0.5 rounded border border-purple-500/20'>Capítulo {h.chapterNumber}</span>
                                </div>
                                <ChevronRight className='w-4 h-4 text-gray-600 group-hover:text-[#b59410] transition-colors'/>
                            </div>
                        );
                    })}
                </div>
            )}

            {activeTab === 'Configurações Astral' && (
                <div className="bg-[#0a0f1c]/80 border border-white/5 rounded-2xl p-6">
                    <div className='bg-black/40 border border-white/5 rounded-xl p-4 mb-4 flex items-center justify-between'>
                        <div className='flex flex-col'>
                            <span className='font-black text-sm text-white'>Modo de Leitura</span>
                            <span className='text-[10px] text-gray-500 font-bold uppercase tracking-widest mt-1'>Como você consome as memórias</span>
                        </div>
                        <select value={userSettings.readMode} onChange={(e) => updateSettings({ readMode: e.target.value })} className="bg-[#0a0f1c] border border-white/10 text-white text-xs font-bold rounded-xl px-4 py-2.5 outline-none focus:border-[#b59410]">
                            {['Cascata', 'Página'].map(opt => <option key={opt}>{opt}</option>)}
                        </select>
                    </div>
                    
                    <button onClick={onLogout} className="w-full mt-6 bg-transparent border border-rose-500/30 text-rose-400 rounded-xl font-black py-3.5 transition-all hover:bg-rose-500/10 tracking-widest text-[10px] uppercase flex justify-center items-center gap-2">
                        <LogOut className="w-4 h-4"/> Encerrar Conexão Astral
                    </button>
                </div>
            )}
        </div>

      </div>
    </div>
  );
}
