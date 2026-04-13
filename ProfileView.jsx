import React, { useState } from 'react';
import { UserCircle, Trophy, Settings, LogOut, Hexagon, Star, Coins, Zap, Clock, BookOpen, Palette, ChevronRight, EyeOff, LayoutTemplate } from 'lucide-react';
import { timeAgo } from './helpers';

export function ProfileView({ user, userProfileData, historyData, libraryData, dataLoaded, userSettings, updateSettings, onLogout, onUpdateData, showToast, mangas, onNavigate }) {
  const [activeTab, setActiveTab] = useState('geral');

  // Cálculos da Barra de Energia (XP)
  const currentLevel = userProfileData?.level || 1;
  const currentXp = userProfileData?.xp || 0;
  const xpNeededForNextLevel = currentLevel * 100; 
  const xpPercentage = Math.min(100, Math.max(0, (currentXp / xpNeededForNextLevel) * 100));

  // Estatísticas Rápidas
  const totalRead = historyData?.length || 0;
  const totalFavorites = Object.keys(libraryData || {}).length;

  return (
    <div className="pt-20 pb-24 px-4 max-w-4xl mx-auto min-h-screen animate-in fade-in duration-500">
      
      {/* ================= HEADER DO PERFIL ================= */}
      <div className="bg-[#05030a] border border-cyan-900/30 rounded-[2rem] p-6 relative overflow-hidden shadow-[0_10px_30px_rgba(0,0,0,0.5)] mb-8">
        <div className="absolute top-0 left-0 w-full h-32 bg-gradient-to-b from-cyan-900/20 to-transparent pointer-events-none"></div>
        
        <div className="relative z-10 flex flex-col md:flex-row items-center md:items-start gap-6">
          <div className="relative w-28 h-28 rounded-full p-1 bg-gradient-to-tr from-cyan-500 to-fuchsia-500">
             <img src={user?.photoURL || `https://placehold.co/200x200/0f111a/3b82f6?text=U`} alt="Avatar" className="w-full h-full rounded-full object-cover border-4 border-[#05030a]" />
          </div>
          
          <div className="flex-1 text-center md:text-left mt-2">
            <h1 className="text-3xl font-black text-white tracking-wide">{user?.displayName || "Leitor Infinito"}</h1>
            <p className="text-sm text-cyan-400/80 font-bold mt-1 uppercase tracking-widest">{user?.email}</p>
            
            <div className="flex flex-wrap justify-center md:justify-start gap-3 mt-4">
              <span className="bg-[#0a0515] border border-fuchsia-500/30 px-4 py-1.5 rounded-full text-xs font-black text-fuchsia-400 flex items-center gap-2">
                <Trophy className="w-3 h-3" /> Nível {currentLevel}
              </span>
              <span className="bg-[#0a0515] border border-amber-500/30 px-4 py-1.5 rounded-full text-xs font-black text-amber-400 flex items-center gap-2">
                <Coins className="w-3 h-3" /> {userProfileData?.coins || 0} Moedas
              </span>
              <span className="bg-[#0a0515] border border-cyan-500/30 px-4 py-1.5 rounded-full text-xs font-black text-cyan-400 flex items-center gap-2">
                <Hexagon className="w-3 h-3" /> {userProfileData?.crystals || 0} Cristais
              </span>
            </div>
          </div>
          
          <button onClick={onLogout} className="md:self-start bg-red-950/40 border border-red-900/50 text-red-400 p-3 rounded-xl hover:bg-red-900/60 hover:text-white transition-colors shadow-inner" title="Desconectar">
            <LogOut className="w-5 h-5" />
          </button>
        </div>

        {/* BARRA DE ENERGIA CÓSMICA (XP) */}
        <div className="mt-8 bg-[#0a0515] p-5 rounded-2xl border border-white/5 relative">
          <div className="flex justify-between items-end mb-3">
            <span className="text-xs font-black text-gray-400 uppercase tracking-widest flex items-center gap-2"><Zap className="w-4 h-4 text-cyan-500"/> Energia Cósmica</span>
            <span className="text-[10px] font-black text-cyan-400 bg-cyan-950/50 px-2 py-1 rounded border border-cyan-500/20">{currentXp} / {xpNeededForNextLevel} XP</span>
          </div>
          
          <div className="w-full h-5 bg-[#020105] rounded-full overflow-hidden border border-white/5 relative shadow-inner">
            <div className="h-full bg-gradient-to-r from-blue-600 via-cyan-400 to-fuchsia-500 relative transition-all duration-1000 ease-out" style={{ width: `${xpPercentage}%` }}>
              <div className="absolute top-0 right-0 bottom-0 w-4 bg-white/30 animate-pulse blur-[2px]"></div>
            </div>
          </div>
        </div>
      </div>

      {/* ================= NAVEGAÇÃO DE ABAS ================= */}
      <div className="flex overflow-x-auto no-scrollbar gap-2 mb-6 border-b border-white/5 pb-2">
        <button onClick={() => setActiveTab('geral')} className={`px-6 py-2.5 rounded-xl font-black text-xs uppercase tracking-widest transition-all whitespace-nowrap ${activeTab === 'geral' ? 'bg-cyan-900/40 text-cyan-400 border border-cyan-500/50' : 'bg-[#0d0d12] text-gray-500 border border-white/5 hover:text-gray-300'}`}>Visão Geral</button>
        <button onClick={() => setActiveTab('historico')} className={`px-6 py-2.5 rounded-xl font-black text-xs uppercase tracking-widest transition-all whitespace-nowrap ${activeTab === 'historico' ? 'bg-cyan-900/40 text-cyan-400 border border-cyan-500/50' : 'bg-[#0d0d12] text-gray-500 border border-white/5 hover:text-gray-300'}`}>Histórico</button>
        <button onClick={() => setActiveTab('config')} className={`px-6 py-2.5 rounded-xl font-black text-xs uppercase tracking-widest transition-all whitespace-nowrap ${activeTab === 'config' ? 'bg-cyan-900/40 text-cyan-400 border border-cyan-500/50' : 'bg-[#0d0d12] text-gray-500 border border-white/5 hover:text-gray-300'}`}>Configurações</button>
      </div>

      {/* ================= CONTEÚDO DAS ABAS ================= */}
      
      {/* ABA: GERAL */}
      {activeTab === 'geral' && (
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 animate-in slide-in-from-bottom-4 duration-500">
          <div className="bg-[#080510] border border-white/5 p-6 rounded-2xl flex flex-col items-center justify-center text-center">
            <BookOpen className="w-8 h-8 text-cyan-500 mb-3" />
            <span className="text-3xl font-black text-white">{totalRead}</span>
            <span className="text-[9px] uppercase tracking-widest text-gray-500 font-bold mt-1">Capítulos Lidos</span>
          </div>
          <div className="bg-[#080510] border border-white/5 p-6 rounded-2xl flex flex-col items-center justify-center text-center">
            <Star className="w-8 h-8 text-fuchsia-500 mb-3" />
            <span className="text-3xl font-black text-white">{totalFavorites}</span>
            <span className="text-[9px] uppercase tracking-widest text-gray-500 font-bold mt-1">Favoritos</span>
          </div>
          <div className="bg-[#080510] border border-white/5 p-6 rounded-2xl flex flex-col items-center justify-center text-center col-span-2 md:col-span-2 relative overflow-hidden">
            <div className="absolute -right-10 -bottom-10 opacity-10 text-cyan-500"><UserCircle className="w-40 h-40" /></div>
            <h3 className="text-lg font-black text-white relative z-10 w-full text-left">Biografia</h3>
            <p className="text-sm text-gray-400 relative z-10 mt-2 w-full text-left line-clamp-3">
              {userProfileData?.bio || "Nenhum registro encontrado nos arquivos do infinito."}
            </p>
          </div>
        </div>
      )}

      {/* ABA: HISTÓRICO */}
      {activeTab === 'historico' && (
        <div className="space-y-3 animate-in slide-in-from-bottom-4 duration-500">
          {!dataLoaded ? (
            <p className="text-center text-gray-500 text-sm py-10 font-bold uppercase tracking-widest">Sincronizando dados...</p>
          ) : historyData.length === 0 ? (
            <div className="bg-[#080510] border border-white/5 rounded-2xl p-10 flex flex-col items-center justify-center text-center">
              <Clock className="w-12 h-12 text-gray-600 mb-4" />
              <p className="text-gray-400 font-bold uppercase tracking-widest text-xs">Nenhum registro de leitura ainda.</p>
            </div>
          ) : (
            historyData.map(item => {
              const manga = mangas?.find(m => m.id === item.mangaId);
              return (
                <div key={item.id} onClick={() => manga && onNavigate('details', manga)} className="bg-[#080510] border border-white/5 p-4 rounded-2xl flex items-center gap-4 hover:border-cyan-500/30 hover:bg-[#0d0a1a] transition-all cursor-pointer group">
                  {manga ? (
                    <img src={manga.coverUrl} alt={manga.title} className="w-12 h-16 object-cover rounded-lg shadow-md group-hover:scale-105 transition-transform" />
                  ) : (
                    <div className="w-12 h-16 bg-[#130a2a] rounded-lg flex items-center justify-center border border-white/5"><BookOpen className="w-5 h-5 text-gray-600" /></div>
                  )}
                  <div className="flex-1 min-w-0">
                    <h3 className="text-sm font-bold text-gray-200 line-clamp-1 group-hover:text-cyan-400 transition-colors">{item.mangaTitle}</h3>
                    <p className="text-xs text-fuchsia-400 font-black uppercase mt-1">Capítulo {item.chapterNumber}</p>
                    <p className="text-[10px] text-gray-500 font-bold uppercase mt-1 flex items-center gap-1"><Clock className="w-3 h-3" /> {timeAgo(item.timestamp)}</p>
                  </div>
                  <ChevronRight className="w-5 h-5 text-gray-600 group-hover:text-cyan-400 transition-colors" />
                </div>
              );
            })
          )}
        </div>
      )}

      {/* ABA: CONFIGURAÇÕES */}
      {activeTab === 'config' && (
        <div className="space-y-4 animate-in slide-in-from-bottom-4 duration-500">
          
          <div className="bg-[#080510] border border-white/5 rounded-2xl p-5">
            <h3 className="text-sm font-black text-white uppercase tracking-widest flex items-center gap-2 mb-6 border-b border-white/5 pb-4"><LayoutTemplate className="w-4 h-4 text-cyan-500" /> Leitor Cósmico</h3>
            
            <div className="flex items-center justify-between mb-6">
              <div>
                <p className="text-sm font-bold text-gray-200">Modo de Leitura</p>
                <p className="text-xs text-gray-500 mt-1">Como as páginas serão exibidas no leitor.</p>
              </div>
              <select 
                value={userSettings?.readMode || 'Cascata'} 
                onChange={(e) => { updateSettings({ readMode: e.target.value }); showToast("Modo de leitura atualizado.", "success"); }}
                className="bg-[#020105] border border-white/10 text-white text-xs font-bold rounded-lg px-3 py-2 outline-none focus:border-cyan-500"
              >
                <option value="Cascata">Cascata (Scroll)</option>
                <option value="Paginação">Página por Página</option>
              </select>
            </div>

            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-bold text-gray-200">Economia de Dados</p>
                <p className="text-xs text-gray-500 mt-1">Reduz a qualidade das capas no catálogo.</p>
              </div>
              <label className="relative inline-flex items-center cursor-pointer">
                <input 
                  type="checkbox" 
                  className="sr-only peer" 
                  checked={userSettings?.dataSaver || false}
                  onChange={(e) => { updateSettings({ dataSaver: e.target.checked }); showToast("Economia de dados atualizada.", "success"); }} 
                />
                <div className="w-11 h-6 bg-[#020105] border border-white/10 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-gray-400 peer-checked:after:bg-cyan-400 after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-cyan-900/50 peer-checked:border-cyan-500"></div>
              </label>
            </div>
          </div>

          <div className="bg-[#080510] border border-white/5 rounded-2xl p-5">
            <h3 className="text-sm font-black text-white uppercase tracking-widest flex items-center gap-2 mb-6 border-b border-white/5 pb-4"><Palette className="w-4 h-4 text-fuchsia-500" /> Tema Global</h3>
            
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-bold text-gray-200">Aparência do Sistema</p>
                <p className="text-xs text-gray-500 mt-1">Ajuste as cores da plataforma.</p>
              </div>
              <select 
                value={userSettings?.theme || 'Escuro'} 
                onChange={(e) => { updateSettings({ theme: e.target.value }); showToast("Tema atualizado.", "success"); }}
                className="bg-[#020105] border border-white/10 text-white text-xs font-bold rounded-lg px-3 py-2 outline-none focus:border-fuchsia-500"
              >
                <option value="Escuro">Escuro (Padrão)</option>
                <option value="Amoled">Breu (AMOLED)</option>
              </select>
            </div>
          </div>

        </div>
      )}

    </div>
  );
}
