import React, { useState, useEffect } from 'react';
import { Target, Hexagon, ShoppingCart, Trophy, Timer, Star, Skull, Zap, Clock, Key, Loader2, ShieldAlert, Sparkles, User, ArrowRight } from 'lucide-react';
import { doc, updateDoc, collectionGroup, getDocs, query } from "firebase/firestore";
import { db } from './firebase';
import { addXpLogic, removeXpLogic, getLevelTitle, getRarityColor, cleanCosmeticUrl } from './helpers';
import { APP_ID } from './constants';

export function NexoView({ user, userProfileData, showToast, mangas, onNavigate, onLevelUp, synthesizeCrystal, shopItems, buyItem, equipItem }) {
    const [activeTab, setActiveTab] = useState("Missões");
    const [enigmaAnswer, setEnigmaAnswer] = useState("");
    const [timeLeft, setTimeLeft] = useState("");
    const [confirmModal, setConfirmModal] = useState(null); 
    const [isForgingMission, setIsForgingMission] = useState(false); 
    const [synthesizing, setSynthesizing] = useState(false);
    
    const [rankingList, setRankingList] = useState([]);
    const [loadingRank, setLoadingRank] = useState(false);

    const rankConfigs = {
        'Rank E': { rxp: 30, rcoin: 15, pxp: 15, pcoin: 10, time: 15, charLimit: 300, enigmaTries: 3, color: 'text-gray-400', border: 'border-gray-500/30', glow: 'hover:shadow-[0_0_20px_rgba(156,163,175,0.2)]' },
        'Rank C': { rxp: 100, rcoin: 50, pxp: 50, pcoin: 25, time: 10, charLimit: 200, enigmaTries: 3, color: 'text-emerald-400', border: 'border-emerald-500/30', glow: 'hover:shadow-[0_0_20px_rgba(52,211,153,0.2)]' },
        'Rank B': { rxp: 150, rcoin: 80, pxp: 80, pcoin: 40, time: 8, charLimit: 120, enigmaTries: 2, color: 'text-blue-400', border: 'border-blue-500/30', glow: 'hover:shadow-[0_0_20px_rgba(96,165,250,0.3)]' },
        'Rank A': { rxp: 300, rcoin: 150, pxp: 150, pcoin: 80, time: 5, charLimit: 80, enigmaTries: 2, color: 'text-cyan-400', border: 'border-cyan-500/40', glow: 'hover:shadow-[0_0_25px_rgba(34,211,238,0.4)]' },
        'Rank S': { rxp: 800, rcoin: 400, pxp: 400, pcoin: 200, time: 3, charLimit: 60, enigmaTries: 1, color: 'text-fuchsia-400', border: 'border-fuchsia-500/50', glow: 'hover:shadow-[0_0_30px_rgba(217,70,239,0.5)]' },
        'Rank SSS':{ rxp: 2000, rcoin: 1000, pxp: 1000, pcoin: 500, time: 1, charLimit: 40, enigmaTries: 1, color: 'text-rose-500', border: 'border-rose-500/60', glow: 'hover:shadow-[0_0_40px_rgba(244,63,94,0.6)]' }
    };

    const RANK_CARDS = Object.keys(rankConfigs);

    useEffect(() => {
        if(activeTab === 'Ranking') fetchRanking();
    }, [activeTab]);

    const fetchRanking = async () => {
        setLoadingRank(true);
        try {
            const snap = await getDocs(query(collectionGroup(db, 'profile')));
            let rankData = [];
            snap.forEach(doc => {
                if(doc.ref.path.includes('main') && (doc.data().level || doc.data().name)) { 
                   rankData.push({ id: doc.ref.parent.parent.id, ...doc.data() });
                }
            });
            rankData.sort((a, b) => {
                if (b.level !== a.level) return (b.level || 1) - (a.level || 1);
                return (b.xp || 0) - (a.xp || 0);
            });
            setRankingList(rankData.slice(0, 50));
        } catch (e) {
            showToast("Falha na Matriz.", "error");
        } finally {
            setLoadingRank(false);
        }
    };

    useEffect(() => {
        if (!userProfileData.activeMission) return;
        const updateTimer = () => {
            const diff = userProfileData.activeMission.deadline - Date.now();
            if (diff <= 0) { setTimeLeft("00:00:00 (FALHA)"); } else {
                const h = Math.floor((diff / (1000 * 60 * 60)) % 24);
                const m = Math.floor((diff / 1000 / 60) % 60);
                const s = Math.floor((diff / 1000) % 60);
                setTimeLeft(`${h.toString().padStart(2, '0')}:${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`);
            }
        };
        updateTimer();
        const interval = setInterval(updateTimer, 1000);
        return () => clearInterval(interval);
    }, [userProfileData.activeMission]);

    const runSynthesis = async () => {
        if ((userProfileData.crystals || 0) < 5) { showToast("Cristais insuficientes.", "error"); return; }
        setSynthesizing(true);
        setTimeout(async () => {
          const res = await synthesizeCrystal(); setSynthesizing(false);
          if (res && res.success) showToast(`Sucesso!`, 'success');
          else showToast(`Colapso!`, 'error');
        }, 1500);
    };

    const equipped = userProfileData.equipped_items || {};

    return (
        <div className={`max-w-6xl mx-auto px-4 py-8 md:py-12 animate-in fade-in duration-700 relative pb-24 font-sans min-h-screen text-gray-200 bg-[#020105]`}>
            
            {/* NAVEGAÇÃO */}
            <div className="flex justify-start gap-4 mb-12 overflow-x-auto no-scrollbar pb-4 relative z-20 w-full px-2 snap-x">
                {['Missões', 'Forja', 'Loja', 'Ranking'].map((tab) => (
                    <button 
                        key={tab}
                        onClick={() => setActiveTab(tab)} 
                        className={`snap-start px-8 py-3.5 rounded-2xl font-black transition-all flex items-center gap-3 text-[10px] uppercase tracking-[0.2em] relative overflow-hidden
                        ${activeTab === tab ? 'text-white border-transparent' : 'text-gray-500 border border-white/5'}`}
                    >
                        {activeTab === tab && <div className="absolute inset-0 bg-gradient-to-r from-cyan-600 to-fuchsia-600 opacity-80"></div>}
                        <div className="relative z-10 flex items-center gap-3">
                            {tab === "Missões" && <Target className="w-4 h-4"/>}
                            {tab === "Forja" && <Hexagon className="w-4 h-4"/>}
                            {tab === "Loja" && <ShoppingCart className="w-4 h-4"/>}
                            {tab === "Ranking" && <Trophy className="w-4 h-4"/>}
                            {tab}
                        </div>
                    </button>
                ))}
            </div>

            {/* CONTEÚDO: LOJA (CORRIGIDO PARA DADOS NOVOS) */}
            {activeTab === "Loja" && (
                <div className="animate-in fade-in duration-500 relative z-10">
                    <div className="flex justify-between items-center mb-12 bg-white/[0.02] p-8 rounded-[2rem] border border-white/5 backdrop-blur-md">
                        <h3 className="text-2xl font-black text-white uppercase tracking-tight">MERCADO</h3>
                        <div className="bg-black/60 border border-amber-500/30 text-amber-400 font-black px-6 py-3 rounded-2xl flex items-center gap-3">
                            <div className="w-4 h-4 rounded-full bg-amber-400"></div>
                            {userProfileData.coins || 0} M
                        </div>
                    </div>
                      
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                        {shopItems.filter(item => item.ativo !== false).map(item => {
                          const hasItem = userProfileData.inventory?.includes(item.id);
                          const isEquipped = userProfileData.equipped_items?.[item.tipo]?.id === item.id;

                          return (
                            <div key={item.id} className={`bg-[#05030a] border p-6 rounded-[2rem] flex flex-col transition-all duration-500 relative overflow-hidden ${isEquipped ? 'border-fuchsia-500/50 shadow-lg' : 'border-white/5 hover:border-zinc-700'}`}>
                              
                              {/* VITRINE DINÂMICA */}
                              <div className="relative w-full aspect-square bg-[#020203] rounded-2xl mb-6 flex items-center justify-center overflow-hidden border border-white/5">
                                    
                                    {/* Avatar ou Capa */}
                                    {(item.tipo === 'avatar' || item.tipo === 'capa_fundo') && item.url && (
                                        <img src={item.url} alt={item.nome} className="w-full h-full object-cover grayscale-[0.4] hover:grayscale-0 transition-all" />
                                    )}

                                    {/* Animação CSS */}
                                    {item.tipo === 'animacao_css' && item.codigo && (
                                        <iframe srcDoc={item.codigo} title={item.nome} className="w-full h-full border-none pointer-events-none scale-110" scrolling="no" />
                                    )}

                                    {/* Nick */}
                                    {item.tipo === 'nick' && item.texto && (
                                        <span className="text-xl font-black text-white uppercase tracking-widest text-center">{item.texto}</span>
                                    )}

                                    <div className="absolute top-3 left-3 px-3 py-1 bg-black/80 border border-zinc-800 text-[8px] font-black text-zinc-400 uppercase">
                                        {item.raridade || 'Comum'}
                                    </div>
                              </div>

                              <div className="mb-6 flex-1">
                                <h4 className="text-white font-black text-sm uppercase truncate mb-1">{item.nome}</h4>
                                <p className="text-[9px] text-zinc-600 font-bold uppercase tracking-widest">{item.tipo?.replace('_', ' ')}</p>
                              </div>
                              
                              {hasItem ? (
                                <button onClick={() => equipItem(item)} className={`w-full font-black py-4 rounded-xl transition-all text-[10px] uppercase tracking-widest ${isEquipped ? 'bg-fuchsia-600 text-white' : 'bg-transparent text-gray-400 border border-white/10 hover:border-cyan-500'}`}>
                                    {isEquipped ? 'Desequipar' : 'Equipar'}
                                </button>
                              ) : (
                                <button onClick={() => buyItem(item)} className="w-full bg-white text-black font-black py-4 rounded-xl text-[10px] uppercase tracking-widest hover:bg-zinc-300">
                                    COMPRAR • {item.preco} M
                                </button>
                              )}
                            </div>
                          )
                        })}
                    </div>
                </div>
            )}

            {/* RESTANTE DO CÓDIGO (RANKING, MISSÕES, FORJA) SEGUE IGUAL */}
            {activeTab === "Missões" && (
                <div className="animate-in fade-in duration-500 text-center py-20">
                    {userProfileData.activeMission ? (
                        <div className="bg-white/[0.02] border border-white/10 p-12 rounded-[3rem] max-w-2xl mx-auto">
                            <span className="text-fuchsia-500 font-black text-xs uppercase tracking-widest">{userProfileData.activeMission.difficulty}</span>
                            <h3 className="text-4xl font-black text-white mt-4 mb-8 uppercase">{userProfileData.activeMission.title}</h3>
                            <div className="flex justify-center gap-4 text-2xl font-black text-red-500 mb-10 bg-red-950/20 py-4 rounded-2xl border border-red-500/20">
                                <Timer /> {timeLeft}
                            </div>
                            <button onClick={() => { const m = mangas.find(mg => mg.id === userProfileData.activeMission.targetManga); if(m) onNavigate('details', m); }} className="w-full bg-white text-black font-black py-5 rounded-2xl uppercase text-xs tracking-widest">Localizar Alvo</button>
                        </div>
                    ) : (
                        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                            {RANK_CARDS.map(rId => (
                                <div key={rId} className="bg-white/[0.02] border border-white/5 p-10 rounded-[2.5rem] hover:border-fuchsia-500/50 transition-all group">
                                    <h3 className="text-3xl font-black text-white mb-6 uppercase group-hover:text-fuchsia-500 transition-colors">{rId}</h3>
                                    <button onClick={() => setConfirmModal(rId)} className="w-full py-4 border border-white/10 rounded-xl text-[10px] font-black uppercase hover:bg-white hover:text-black transition-all">Firmar Contrato</button>
                                </div>
                            ))}
                        </div>
                    )}
                </div>
            )}

            {activeTab === "Forja" && (
                <div className="animate-in fade-in duration-500 max-w-xl mx-auto text-center py-20 bg-white/[0.02] border border-cyan-500/20 rounded-[3rem]">
                    <Hexagon className="w-20 h-20 mx-auto mb-8 text-cyan-400 animate-spin-slow" />
                    <h2 className="text-4xl font-black text-white mb-4 uppercase">FORNALHA</h2>
                    <p className="text-zinc-500 mb-10 px-10">Sintetize 5 Cristais para obter XP e Moedas.</p>
                    <div className="text-6xl font-black text-white mb-12">{userProfileData.crystals || 0}</div>
                    <button onClick={runSynthesis} disabled={synthesizing || (userProfileData.crystals || 0) < 5} className="bg-cyan-600 text-white px-12 py-5 rounded-2xl font-black uppercase text-xs tracking-widest disabled:opacity-20">
                        {synthesizing ? 'Fundindo...' : 'Iniciar Fusão'}
                    </button>
                </div>
            )}

            {activeTab === "Ranking" && (
                <div className="animate-in fade-in duration-500 max-w-4xl mx-auto">
                    {loadingRank ? (
                        <div className="text-center py-20"><Loader2 className="animate-spin mx-auto text-white w-10 h-10" /></div>
                    ) : (
                        <div className="space-y-4">
                            {rankingList.map((player, index) => (
                                <div key={player.id} className="bg-white/[0.02] border border-white/5 p-6 rounded-[2rem] flex items-center gap-6">
                                    <div className="text-2xl font-black text-zinc-700 w-10">#{index + 1}</div>
                                    <div className="w-14 h-14 rounded-full overflow-hidden bg-zinc-900 border border-white/10">
                                        <img src={player.avatarUrl || `https://placehold.co/100x100/020105/ffffff?text=${player.displayName?.charAt(0) || 'U'}`} className="w-full h-full object-cover" />
                                    </div>
                                    <div className="flex-1">
                                        <h4 className="font-black text-white uppercase truncate">{player.displayName || "Entidade"}</h4>
                                        <p className="text-[10px] text-zinc-500 font-bold uppercase tracking-widest">Nível {player.level}</p>
                                    </div>
                                    <div className="text-right font-black text-fuchsia-500 text-xs">{player.xp} XP</div>
                                </div>
                            ))}
                        </div>
                    )}
                </div>
            )}
        </div>
    );
}
