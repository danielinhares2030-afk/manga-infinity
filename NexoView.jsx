import React, { useState, useEffect } from 'react';
import { Target, Hexagon, Trophy, Timer, Skull, Zap, Loader2, ArrowRight, Key, Sparkles, AlertTriangle, Crown, ChevronDown, Globe, ChevronRight, User, Image, Circle, Calendar, BookOpen, EyeOff, X, Shield } from 'lucide-react';
import { doc, updateDoc, collectionGroup, getDocs, query, increment, getDoc } from "firebase/firestore";
import { auth, db } from './firebase';
import { addXpLogic, removeXpLogic, getLevelTitle, cleanCosmeticUrl, getRarityColor } from './helpers';
import { APP_ID } from './constants';

const CHEST_CLOSED = "https://i.ibb.co/8gRvqw81/file-00000000bad4720eba1f9c9af69a35ac-removebg-preview.png";
const CHEST_OPEN = "https://i.ibb.co/N2C6R6bZ/file-00000000f55c720e9d543bf9cbf9328e-removebg-preview.png";

const PublicProfileModal = ({ userId, onClose, currentUserId }) => {
    const [data, setData] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        if(!userId) return;
        getDoc(doc(db, 'artifacts', APP_ID, 'users', userId, 'profile', 'main')).then(snap => {
            if(snap.exists()) setData(snap.data()); else setData(null);
            setLoading(false);
        });
    }, [userId]);

    if (!userId) return null;

    return (
        <div className="fixed inset-0 z-[99999] bg-[#030014]/90 backdrop-blur-xl flex items-center justify-center p-4 animate-in fade-in zoom-in-95 duration-300" onClick={onClose}>
            <div className="bg-[#0a0a0f] border border-cyan-500/30 rounded-[2rem] w-full max-w-sm relative overflow-hidden shadow-[0_0_50px_rgba(6,182,212,0.15)]" onClick={e => e.stopPropagation()}>
                {loading ? (
                    <div className="p-20 flex justify-center"><Loader2 className="w-12 h-12 text-cyan-500 animate-spin"/></div>
                ) : !data ? (
                    <div className="p-12 text-center text-gray-500 font-black uppercase tracking-widest text-xs">Entidade não encontrada.</div>
                ) : data.settings?.isPrivate && userId !== currentUserId ? (
                    <div className="p-16 text-center relative overflow-hidden">
                        <div className="absolute inset-0 bg-gradient-to-b from-cyan-900/10 to-transparent pointer-events-none"></div>
                        <EyeOff className="w-16 h-16 text-cyan-900/50 mx-auto mb-6 drop-shadow-md" />
                        <h3 className="text-white font-black text-xl uppercase tracking-widest drop-shadow-[0_0_10px_rgba(255,255,255,0.2)]">Perfil Privado</h3>
                        <p className="text-cyan-500/50 text-[10px] mt-3 font-bold uppercase tracking-[0.2em]">O abismo oculta este usuário.</p>
                        <button onClick={onClose} className="mt-8 bg-[#121520] hover:bg-[#1a1f2e] text-cyan-400 border border-cyan-900/50 px-8 py-3.5 rounded-xl font-black text-[10px] uppercase tracking-widest transition-colors w-full shadow-lg">Retornar</button>
                    </div>
                ) : (
                    <div className="pb-8 relative">
                        <div className="h-36 w-full bg-[#121520] relative border-b border-white/5">
                            {data.coverUrl ? <img src={cleanCosmeticUrl(data.coverUrl)} className="w-full h-full object-cover opacity-60 mix-blend-screen" /> : <div className="absolute inset-0 bg-gradient-to-br from-cyan-900/20 to-purple-900/20"></div>}
                            <div className="absolute inset-0 bg-gradient-to-t from-[#0a0a0f] via-transparent to-transparent opacity-90"></div>
                            <button onClick={onClose} className="absolute top-4 right-4 bg-black/40 p-2.5 rounded-full text-white hover:text-cyan-400 hover:bg-black/80 transition-all backdrop-blur-md shadow-lg"><X className="w-4 h-4"/></button>
                        </div>
                        <div className="relative -mt-16 flex justify-center">
                            <div className="w-32 h-32 rounded-full border-[4px] border-[#0a0a0f] bg-[#121520] relative flex items-center justify-center shadow-[0_10px_30px_rgba(6,182,212,0.3)] group">
                                <div className="absolute inset-0 rounded-full bg-cyan-500/20 blur-md group-hover:bg-cyan-500/40 transition-colors duration-500"></div>
                                <img src={cleanCosmeticUrl(data.equipped_items?.avatar?.preview) || data.avatarUrl || 'https://placehold.co/150x150/0a0a0f/06b6d4?text=N'} className="w-full h-full object-cover rounded-full relative z-10" />
                                {data.equipped_items?.moldura?.preview && <img src={cleanCosmeticUrl(data.equipped_items.moldura.preview)} className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[140%] h-[140%] max-w-none object-contain pointer-events-none z-20 mix-blend-screen" />}
                            </div>
                        </div>
                        <div className="text-center mt-5 px-6">
                            <h3 className="text-2xl font-black text-white uppercase tracking-tight drop-shadow-md">{data.name || data.displayName || 'Viajante'}</h3>
                            <div className="inline-flex items-center gap-2 mt-3 bg-[#121520] border border-cyan-500/20 px-4 py-1.5 rounded-full shadow-inner">
                                <Sparkles className="w-3 h-3 text-cyan-400" />
                                <span className="text-cyan-400 text-[10px] font-black uppercase tracking-widest">Nível {data.level || 1} • {getLevelTitle(data.level || 1)}</span>
                            </div>
                            <p className="text-gray-400 text-xs mt-6 font-medium leading-relaxed px-2 line-clamp-3">"{data.bio || 'Explorando o abismo dos mangás.'}"</p>
                        </div>
                        <div className="grid grid-cols-3 gap-3 mt-8 px-8 border-t border-white/5 pt-8">
                            <div className="text-center flex flex-col items-center bg-[#121520]/50 py-3 rounded-2xl border border-white/5">
                                <Zap className="w-4 h-4 text-cyan-400 mb-1.5"/>
                                <span className="block text-base font-black text-white">{data.xp || 0}</span>
                                <span className="text-[8px] text-gray-500 font-bold uppercase tracking-widest mt-0.5">XP</span>
                            </div>
                            <div className="text-center flex flex-col items-center bg-[#121520]/50 py-3 rounded-2xl border border-white/5">
                                <div className="w-3 h-3 bg-amber-500 rotate-45 mb-2 shadow-[0_0_10px_rgba(245,158,11,0.5)]"></div>
                                <span className="block text-base font-black text-white">{data.coins || 0}</span>
                                <span className="text-[8px] text-gray-500 font-bold uppercase tracking-widest mt-0.5">Moedas</span>
                            </div>
                            <div className="text-center flex flex-col items-center bg-[#121520]/50 py-3 rounded-2xl border border-white/5">
                                <Hexagon className="w-4 h-4 text-blue-500 mb-1.5"/>
                                <span className="block text-base font-black text-white">{data.crystals || 0}</span>
                                <span className="text-[8px] text-gray-500 font-bold uppercase tracking-widest mt-0.5">Cristais</span>
                            </div>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
};

export function NexoView({ user, userProfileData, showToast, mangas, onNavigate, onLevelUp, synthesizeCrystal, shopItems }) {
    const [activeTab, setActiveTab] = useState("Caixas");
    const [synthesizing, setSynthesizing] = useState(false);
    const [rankingList, setRankingList] = useState([]);
    const [loadingRank, setLoadingRank] = useState(false);
    
    const [isOpeningBoxAnim, setIsOpeningBoxAnim] = useState(false);
    const [boxReward, setBoxReward] = useState(null);

    const [showSacrificeModal, setShowSacrificeModal] = useState(false);
    const [selectedUserId, setSelectedUserId] = useState(null);
    const [countdown, setCountdown] = useState("00:00:00");

    useEffect(() => {
        if(activeTab === 'Ranking') fetchRanking();
    }, [activeTab]);

    // LÓGICA DO CRONÔMETRO CORRIGIDA
    useEffect(() => {
        const updateTimer = () => {
            const now = new Date();
            const tomorrow = new Date(now);
            tomorrow.setHours(24, 0, 0, 0); // Próxima meia-noite
            const diff = tomorrow - now;
            const h = Math.floor((diff / (1000 * 60 * 60)) % 24).toString().padStart(2, '0');
            const m = Math.floor((diff / 1000 / 60) % 60).toString().padStart(2, '0');
            const s = Math.floor((diff / 1000) % 60).toString().padStart(2, '0');
            setCountdown(`${h}:${m}:${s}`);
        };
        updateTimer();
        const interval = setInterval(updateTimer, 1000);
        return () => clearInterval(interval);
    }, []);

    const fetchRanking = async () => {
        setLoadingRank(true);
        try {
            const snap = await getDocs(query(collectionGroup(db, 'profile')));
            let rankData = [];
            snap.forEach(doc => {
                if(doc.ref.path.includes('main')) {
                    const data = doc.data();
                    if ((data.xp && data.xp > 0) || (data.level && data.level > 1)) {
                        rankData.push({ id: doc.ref.parent.parent.id, ...data });
                    }
                }
            });
            rankData.sort((a, b) => {
                if (b.level !== a.level) return (b.level || 1) - (a.level || 1);
                return (b.xp || 0) - (a.xp || 0);
            });
            setRankingList(rankData.slice(0, 50));
        } catch (e) {
            showToast("Falha ao se conectar aos servidores Nexo.", "error");
        } finally {
            setLoadingRank(false);
        }
    };

    const lastClaim = userProfileData.lastDailyBox || 0;
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const canClaimDaily = lastClaim < today.getTime();

    const handleClaimDaily = async () => {
        try {
            await updateDoc(doc(db, 'artifacts', APP_ID, 'users', user.uid, 'profile', 'main'), {
                caixas: increment(1),
                lastDailyBox: Date.now()
            });
            showToast("Caixa Diária resgatada com sucesso!", "success");
        } catch (e) {
            showToast("Erro ao resgatar recompensa.", "error");
        }
    };

    const handleBuyBoxWithXPClick = () => {
        if ((userProfileData.xp || 0) < 1000) {
            return showToast("XP Insuficiente. Você precisa de 1000 XP.", "error");
        }
        setShowSacrificeModal(true);
    };

    const executeBuyBoxWithXP = async () => {
        setShowSacrificeModal(false);
        try {
            let { newXp, newLvl } = removeXpLogic(userProfileData.xp || 0, userProfileData.level || 1, 1000);
            await updateDoc(doc(db, 'artifacts', APP_ID, 'users', user.uid, 'profile', 'main'), {
                xp: newXp,
                level: newLvl,
                caixas: increment(1)
            });
            showToast("Conversão aceita. Você forjou 1 Caixa Nexo.", "success");
        } catch (e) {
            showToast("Falha no processo de conversão.", "error");
        }
    };

    const handleOpenBox = async () => {
        const caixas = userProfileData.caixas || 0;
        if (caixas < 1) return showToast("Você não possui Caixas Nexo.", "error");

        setIsOpeningBoxAnim(true);
        
        setTimeout(async () => {
            try {
                let rewardType = '';
                let rewardValue = null;
                let newCoins = userProfileData.coins || 0;
                let { newXp, newLvl, didLevelUp } = { newXp: userProfileData.xp || 0, newLvl: userProfileData.level || 1, didLevelUp: false };
                let newInv = [...(userProfileData.inventory || [])];

                const mainRoll = Math.random();
                
                if (mainRoll < 0.30) {
                    const rarityRoll = Math.random();
                    let targetRarity = 'Comum';
                    if (rarityRoll < 0.005) targetRarity = 'Mítico'; 
                    else if (rarityRoll < 0.05) targetRarity = 'Lendário'; 
                    else if (rarityRoll < 0.20) targetRarity = 'Épico'; 
                    else if (rarityRoll < 0.50) targetRarity = 'Raro'; 
                    else targetRarity = 'Comum'; 

                    const availableItems = shopItems.filter(i => !newInv.includes(i.id));
                    let possibleItems = availableItems.filter(i => (i.raridade || 'Comum').toLowerCase() === targetRarity.toLowerCase());
                    
                    if (possibleItems.length === 0) possibleItems = availableItems;

                    if (possibleItems.length > 0) {
                        rewardType = 'cosmetic';
                        const randomItem = possibleItems[Math.floor(Math.random() * possibleItems.length)];
                        rewardValue = randomItem;
                        newInv.push(randomItem.id);
                    } else {
                        rewardType = 'coins';
                        rewardValue = 2500; 
                        newCoins += rewardValue;
                    }
                } else if (mainRoll < 0.70) {
                    rewardType = 'xp';
                    rewardValue = Math.floor(Math.random() * 500) + 200;
                    const xpLogic = addXpLogic(userProfileData.xp || 0, userProfileData.level || 1, rewardValue);
                    newXp = xpLogic.newXp;
                    newLvl = xpLogic.newLvl;
                    didLevelUp = xpLogic.didLevelUp;
                } else {
                    rewardType = 'coins';
                    rewardValue = Math.floor(Math.random() * 400) + 100;
                    newCoins += rewardValue;
                }

                await updateDoc(doc(db, 'artifacts', APP_ID, 'users', user.uid, 'profile', 'main'), {
                    caixas: increment(-1),
                    coins: newCoins,
                    xp: newXp,
                    level: newLvl,
                    inventory: newInv
                });

                setBoxReward({ type: rewardType, value: rewardValue });
                if (didLevelUp) onLevelUp(newLvl);
            } catch (e) {
                showToast("Erro ao processar a abertura.", "error");
            } finally {
                setIsOpeningBoxAnim(false);
            }
        }, 2500);
    };

    const runSynthesis = async () => {
        if ((userProfileData.crystals || 0) < 5) return showToast("Massa insuficiente. Colete 5 Cristais.", "error");
        setSynthesizing(true);
        setTimeout(async () => {
          const res = await synthesizeCrystal(); setSynthesizing(false);
          if (res?.success) showToast(`Transmutação Bem-Sucedida!`, 'success');
          else showToast(`Colapso! Matéria desintegrada.`, 'error');
        }, 1500);
    };

    const equipped = userProfileData.equipped_items || {};

    return (
        <div className={`pb-24 animate-in fade-in duration-500 relative font-sans min-h-screen text-white bg-[#030014] overflow-x-hidden`}>
            
            {/* BACKGROUND ANIMADO NEXO */}
            <div className="fixed inset-0 pointer-events-none z-0">
                <div className="absolute top-[-20%] left-[-10%] w-[50vw] h-[50vw] bg-cyan-600/10 blur-[150px] rounded-full mix-blend-screen"></div>
                <div className="absolute bottom-[-10%] right-[-10%] w-[40vw] h-[40vw] bg-blue-600/10 blur-[120px] rounded-full mix-blend-screen"></div>
                <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNDAiIGhlaWdodD0iNDAiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+PGNpcmNsZSBjeD0iMSIgY3k9IjEiIHI9IjEiIGZpbGw9InJnYmEoMjU1LDI1NSwyNTUsMC4wMykiLz48L3N2Zz4=')] opacity-50 mix-blend-overlay"></div>
            </div>
            
            {showSacrificeModal && (
                <div className="fixed inset-0 z-[99999] bg-[#030014]/90 backdrop-blur-xl flex items-center justify-center p-4 animate-in fade-in zoom-in-95 duration-200">
                    <div className="bg-[#0a0a0f] border border-cyan-500/40 rounded-[2rem] p-10 max-w-sm w-full shadow-[0_0_50px_rgba(6,182,212,0.15)] text-center relative overflow-hidden">
                        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,rgba(6,182,212,0.15),transparent_70%)] pointer-events-none"></div>
                        <Zap className="w-16 h-16 text-cyan-400 mx-auto mb-6 relative z-10 drop-shadow-[0_0_15px_rgba(6,182,212,0.8)]" />
                        <h3 className="text-2xl font-black text-white uppercase tracking-widest mb-4 relative z-10">Conversão de XP</h3>
                        <p className="text-gray-400 text-xs font-bold mb-10 relative z-10 leading-relaxed">Você irá converter <span className="text-cyan-400">1000 XP</span> do seu perfil. Seu nível pode retroceder. Deseja forjar a caixa mesmo assim?</p>
                        <div className="flex gap-4 relative z-10">
                            <button onClick={() => setShowSacrificeModal(false)} className="flex-1 bg-[#121520] border border-white/5 text-gray-400 py-4 rounded-xl font-black text-[10px] uppercase tracking-widest hover:text-white hover:bg-white/5 transition-colors">Cancelar</button>
                            <button onClick={executeBuyBoxWithXP} className="flex-1 bg-gradient-to-r from-cyan-600 to-blue-600 hover:from-cyan-500 hover:to-blue-500 text-white py-4 rounded-xl font-black text-[10px] uppercase tracking-widest shadow-[0_0_20px_rgba(6,182,212,0.4)] transition-all">Converter</button>
                        </div>
                    </div>
                </div>
            )}

            {selectedUserId && <PublicProfileModal userId={selectedUserId} onClose={() => setSelectedUserId(null)} currentUserId={user?.uid} />}

            {isOpeningBoxAnim && (
                <div className="fixed inset-0 z-[9999] bg-[#030014]/95 backdrop-blur-md flex flex-col items-center justify-center overflow-hidden">
                    <style>{`
                        .anim-float { animation: float 3s ease-in-out infinite; }
                        .anim-chest-shake { animation: chest-shake 2.2s cubic-bezier(.36,.07,.19,.97) both; }
                        .anim-chest-burst { animation: chest-burst 2.5s ease-out both; }
                        .anim-chest-open { animation: chest-open 2.5s ease-out both; }
                        
                        @keyframes float {
                            0%, 100% { transform: translateY(0); }
                            50% { transform: translateY(-15px); }
                        }
                        @keyframes chest-shake {
                            0% { transform: scale(1); filter: drop-shadow(0 0 10px rgba(6,182,212,0.5)); }
                            10%, 30%, 50%, 70% { transform: scale(1.1) translate(-6px, 3px) rotate(-6deg); filter: drop-shadow(0 0 30px rgba(6,182,212,0.8)); }
                            20%, 40%, 60%, 80% { transform: scale(1.1) translate(6px, -3px) rotate(6deg); filter: drop-shadow(0 0 50px rgba(139,92,246,0.9)); }
                            85% { transform: scale(1.2) rotate(0deg); filter: brightness(1.5) drop-shadow(0 0 100px rgba(6,182,212,1)); opacity: 1; }
                            90%, 100% { transform: scale(1.5); opacity: 0; }
                        }
                        @keyframes chest-burst {
                            0%, 82% { opacity: 0; transform: scale(0); }
                            86% { opacity: 1; transform: scale(1.5); background: radial-gradient(circle, rgba(255,255,255,1) 0%, rgba(6,182,212,0.9) 40%, transparent 70%); }
                            100% { opacity: 0; transform: scale(4.5); background: radial-gradient(circle, rgba(255,255,255,0) 0%, rgba(6,182,212,0) 40%, transparent 70%); }
                        }
                        @keyframes chest-open {
                            0%, 85% { opacity: 0; transform: scale(0.5) translateY(30px); filter: brightness(1); }
                            90% { opacity: 1; transform: scale(1.3) translateY(-15px); filter: brightness(2) drop-shadow(0 0 60px rgba(255,255,255,1)); }
                            100% { opacity: 1; transform: scale(1.1) translateY(0); filter: brightness(1.2) drop-shadow(0 0 40px rgba(6,182,212,0.8)); }
                        }
                    `}</style>
                    <div className="absolute w-[30rem] h-[30rem] rounded-full anim-chest-burst z-10 pointer-events-none"></div>
                    <div className="absolute inset-0 flex flex-col items-center justify-center anim-chest-shake z-20 pointer-events-none">
                        <img src={CHEST_CLOSED} className="w-48 h-48 md:w-56 md:h-56 object-contain flex-shrink-0" alt="Chest Closed" />
                    </div>
                    <div className="absolute inset-0 flex flex-col items-center justify-center anim-chest-open z-30 pointer-events-none">
                        <img src={CHEST_OPEN} className="w-64 h-64 md:w-80 md:h-80 object-contain mix-blend-screen flex-shrink-0" alt="Chest Opened" />
                    </div>
                </div>
            )}

            {boxReward && (
                <div className="fixed inset-0 z-[9999] bg-[#030014]/90 backdrop-blur-xl flex flex-col items-center justify-center p-4 animate-in zoom-in-95 duration-300">
                    <div className="bg-[#0a0a0f] border border-cyan-500/40 rounded-[2rem] p-10 max-w-md w-full text-center shadow-[0_0_50px_rgba(6,182,212,0.2)] relative overflow-hidden">
                        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,rgba(6,182,212,0.15),transparent_70%)] pointer-events-none"></div>
                        <h3 className="text-xl font-black text-white uppercase tracking-[0.2em] mb-8 relative z-10">Recompensa Obtida</h3>
                        <div className="flex justify-center mb-8 relative z-10">
                            {boxReward.type === 'coins' && <div className="w-28 h-28 rounded-full bg-[#121520] border-[3px] border-amber-500 flex items-center justify-center shadow-[0_0_30px_rgba(245,158,11,0.3)] flex-shrink-0 group"><div className="w-12 h-12 bg-amber-500 rotate-45 shadow-[0_0_15px_rgba(245,158,11,0.8)] group-hover:scale-110 transition-transform"></div></div>}
                            {boxReward.type === 'xp' && <div className="w-28 h-28 rounded-full bg-[#121520] border-[3px] border-cyan-500 flex items-center justify-center shadow-[0_0_30px_rgba(6,182,212,0.3)] flex-shrink-0 group"><Zap className="w-14 h-14 text-cyan-400 drop-shadow-[0_0_15px_rgba(6,182,212,0.8)] group-hover:scale-110 transition-transform"/></div>}
                            {boxReward.type === 'cosmetic' && (
                                <div className={`w-32 h-32 rounded-2xl bg-[#121520] border-[3px] overflow-hidden flex flex-col items-center justify-center relative p-2 flex-shrink-0 transform hover:scale-105 transition-transform ${boxReward.value.raridade === 'Mítico' ? 'border-red-500 shadow-[0_0_40px_rgba(239,68,68,0.4)]' : boxReward.value.raridade === 'Lendário' ? 'border-yellow-500 shadow-[0_0_40px_rgba(234,179,8,0.4)]' : boxReward.value.raridade === 'Épico' ? 'border-purple-500 shadow-[0_0_40px_rgba(168,85,247,0.4)]' : 'border-cyan-500 shadow-[0_0_30px_rgba(6,182,212,0.3)]'}`}>
                                    {cleanCosmeticUrl(boxReward.value.preview) ? <img src={cleanCosmeticUrl(boxReward.value.preview)} className="w-16 h-16 object-cover rounded-full mb-3" /> : <img src={CHEST_OPEN} className="w-12 h-12 object-contain mb-3" alt="Reward" />}
                                    <div className={`text-[9px] font-black uppercase tracking-widest px-2.5 py-1 rounded bg-[#0a0a0f] border ${getRarityColor(boxReward.value.raridade)}`}>
                                        {boxReward.value.raridade || 'Comum'}
                                    </div>
                                </div>
                            )}
                        </div>
                        <h4 className={`text-2xl font-black uppercase tracking-tight relative z-10 ${boxReward.type === 'cosmetic' && boxReward.value.raridade === 'Mítico' ? 'text-red-400' : boxReward.type === 'cosmetic' && boxReward.value.raridade === 'Lendário' ? 'text-yellow-400' : 'text-white drop-shadow-md'}`}>
                            {boxReward.type === 'coins' && `+${boxReward.value} Moedas`}
                            {boxReward.type === 'xp' && `+${boxReward.value} XP`}
                            {boxReward.type === 'cosmetic' && boxReward.value.nome}
                        </h4>
                        {boxReward.type === 'cosmetic' && <p className="text-cyan-400/70 text-[10px] font-bold uppercase tracking-[0.2em] mt-2 relative z-10">Item Visual Adicionado</p>}
                        <button onClick={() => setBoxReward(null)} className="mt-10 bg-gradient-to-r from-cyan-600 to-blue-600 hover:from-cyan-500 hover:to-blue-500 text-white font-black w-full py-4 rounded-xl text-[11px] uppercase tracking-widest transition-all relative z-10 shadow-[0_10px_20px_rgba(6,182,212,0.3)] hover:-translate-y-1">Aceitar Poder</button>
                    </div>
                </div>
            )}

            <div className="max-w-6xl mx-auto px-4 py-8 relative z-10">
                
                {/* MENU DE NAVEGAÇÃO FLUTUANTE */}
                <div className="flex justify-center gap-2 mb-12 w-full px-2">
                    <div className="bg-[#0a0a0f]/80 backdrop-blur-xl border border-white/10 p-1.5 rounded-full flex shadow-xl">
                        {['Caixas', 'Forja', 'Ranking'].map((tab) => (
                            <button key={tab} onClick={() => setActiveTab(tab)} className={`relative px-6 md:px-12 py-3.5 font-black text-[10px] md:text-xs uppercase tracking-[0.2em] transition-all duration-300 rounded-full
                                ${activeTab === tab ? 'bg-gradient-to-r from-cyan-600 to-blue-600 shadow-[0_0_20px_rgba(6,182,212,0.4)] text-white' : 'bg-transparent text-gray-500 hover:text-cyan-400'}`}>
                                <div className="flex items-center gap-2">
                                    {tab === "Caixas" && <img src={CHEST_CLOSED} className={`w-4 h-4 object-contain ${activeTab === tab ? 'opacity-100' : 'opacity-50'}`} alt="Chest" />}
                                    {tab === "Forja" && <Zap className="w-4 h-4"/>}
                                    {tab === "Ranking" && <Trophy className="w-4 h-4"/>}
                                    {tab}
                                </div>
                            </button>
                        ))}
                    </div>
                </div>

                {/* FORJA (REATOR) - OTIMIZADO E ANIMADO */}
                {activeTab === "Forja" && (
                    <div className="animate-in fade-in slide-in-from-bottom-4 duration-500 max-w-lg mx-auto relative z-10 mt-2">
                        <div className="bg-[#0a0a0f]/80 backdrop-blur-2xl border border-cyan-500/30 p-10 rounded-[2.5rem] relative overflow-hidden shadow-[0_20px_50px_rgba(0,0,0,0.5)]">
                            
                            {/* ANEIS ROTATIVOS DA FORJA (GPU Accelerated) */}
                            <div className="absolute inset-0 flex items-center justify-center opacity-30 pointer-events-none -mt-16">
                                <div className="w-[320px] h-[320px] rounded-full border border-cyan-500/40 animate-[spin_12s_linear_infinite]"></div>
                                <div className="w-[240px] h-[240px] rounded-full border-[2px] border-blue-400/30 absolute animate-[spin_8s_linear_infinite_reverse] border-dashed"></div>
                                <div className="w-[160px] h-[160px] rounded-full border-2 border-cyan-300/50 absolute animate-pulse"></div>
                            </div>
                            
                            <div className="w-28 h-28 mx-auto mb-6 flex items-center justify-center relative z-10 bg-[#121520] rounded-full border border-cyan-500/20 shadow-[0_0_30px_rgba(6,182,212,0.2)]">
                                <Zap className="w-14 h-14 text-cyan-400 drop-shadow-[0_0_15px_rgba(6,182,212,0.8)]" fill="currentColor" fillOpacity="0.2"/>
                            </div>
                            
                            <h2 className="text-3xl font-black text-white text-center mb-2 relative z-10 tracking-widest drop-shadow-md">
                                REATOR <span className="text-cyan-400">NEXO</span>
                            </h2>
                            <p className="text-center text-gray-400 text-[10px] tracking-[0.2em] font-bold relative z-10 mb-10 leading-relaxed uppercase">
                                TRANSMUTE <span className="text-cyan-400">5 CRISTAIS</span> EM PODER BRUTO.<br/>
                                <span className="text-red-400">40% DE CHANCE</span> DE COLAPSO.
                            </p>
                            
                            <div className="bg-[#121520]/80 border border-white/5 rounded-3xl p-6 mb-8 relative z-10">
                                <h3 className="text-center text-blue-400 text-[10px] font-black tracking-[0.3em] uppercase mb-4 opacity-80">
                                    Carga de Matéria
                                </h3>
                                <div className="flex justify-center items-center gap-4 mb-6">
                                    <span className="text-6xl font-black text-white drop-shadow-[0_0_15px_rgba(255,255,255,0.2)] tracking-tighter">
                                        {userProfileData.crystals || 0}
                                    </span>
                                    <Hexagon className="w-12 h-12 text-blue-500 drop-shadow-[0_0_15px_rgba(59,130,246,0.6)]" strokeWidth={2}/>
                                </div>
                                <div className="flex items-center justify-center gap-4 max-w-[200px] mx-auto relative mt-2">
                                    <div className="absolute left-0 top-1/2 w-full h-[2px] bg-[#0a0a0f] -translate-y-1/2 z-0"></div>
                                    {[1, 2, 3, 4, 5].map(i => (
                                        <div key={i} className={`relative z-10 w-3 h-3 rounded-full transition-all duration-500 ${i <= (userProfileData.crystals || 0) ? 'bg-cyan-400 shadow-[0_0_15px_rgba(6,182,212,1)] scale-125' : 'bg-[#0a0a0f] border border-white/10'}`}></div>
                                    ))}
                                </div>
                            </div>
                            
                            <div className="flex justify-between items-center bg-[#121520]/50 border border-white/5 rounded-2xl p-4 mb-8 relative z-10 divide-x divide-white/5">
                                <div className="flex flex-col items-center flex-1 px-1">
                                    <div className="flex items-center gap-1.5 mb-2 h-6">
                                        <Hexagon className="w-3.5 h-3.5 text-cyan-500"/>
                                        <span className="text-[7px] font-black text-gray-500 uppercase tracking-widest leading-tight">Custo</span>
                                    </div>
                                    <span className="text-base font-black text-white">5</span>
                                </div>
                                <div className="flex flex-col items-center flex-1 px-1">
                                    <div className="flex items-center gap-1.5 mb-2 h-6">
                                        <Zap className="w-3.5 h-3.5 text-blue-500"/>
                                        <span className="text-[7px] font-black text-gray-500 uppercase tracking-widest leading-tight">Sucesso</span>
                                    </div>
                                    <span className="text-base font-black text-blue-400">60%</span>
                                </div>
                                <div className="flex flex-col items-center flex-1 px-1">
                                    <div className="flex items-center gap-1.5 mb-2 h-6">
                                        <Shield className="w-3.5 h-3.5 text-gray-500"/>
                                        <span className="text-[7px] font-black text-gray-500 uppercase tracking-widest leading-tight">Falha</span>
                                    </div>
                                    <span className="text-base font-black text-red-400">40%</span>
                                </div>
                            </div>
                            
                            <button onClick={runSynthesis} disabled={synthesizing || (userProfileData.crystals || 0) < 5} className="w-full bg-gradient-to-r from-cyan-600 to-blue-600 hover:from-cyan-500 hover:to-blue-500 disabled:opacity-50 disabled:grayscale text-white font-black py-5 rounded-[1.2rem] text-[11px] uppercase tracking-[0.2em] flex items-center justify-center gap-3 transition-all relative z-10 shadow-[0_10px_20px_rgba(6,182,212,0.3)] hover:-translate-y-1 transform-gpu">
                                {synthesizing ? <Loader2 className="w-5 h-5 animate-spin" /> : <>INICIAR SÍNTESE <ArrowRight className="w-4 h-4"/></>}
                            </button>
                        </div>
                    </div>
                )}

                {/* RANKING - PÓDIOS ILUMINADOS */}
                {activeTab === "Ranking" && (
                    <div className="animate-in fade-in slide-in-from-bottom-4 duration-500 max-w-4xl mx-auto pb-10">
                        <div className="flex justify-center mb-16">
                            <div className="flex items-center gap-3 bg-[#0a0a0f] border border-white/5 px-8 py-4 rounded-full shadow-lg">
                                <Trophy className="w-6 h-6 text-blue-500 fill-blue-500 drop-shadow-[0_0_10px_rgba(59,130,246,0.6)]" />
                                <h2 className="text-lg md:text-xl font-black text-white uppercase tracking-[0.3em] drop-shadow-md">Ranking Global</h2>
                            </div>
                        </div>

                        {loadingRank ? (
                            <div className="flex justify-center py-20"><Loader2 className="w-12 h-12 text-cyan-500 animate-spin"/></div>
                        ) : (
                            <>
                                <div className="flex justify-center items-end gap-3 md:gap-8 mb-20 mt-8">
                                    {/* 2º LUGAR */}
                                    {rankingList[1] && (
                                        <div onClick={() => setSelectedUserId(rankingList[1].id)} className="w-[30%] max-w-[170px] relative flex flex-col items-center order-1 cursor-pointer group transform hover:-translate-y-2 transition-transform duration-300">
                                            <div className="absolute -top-12 text-center">
                                                <div className="w-10 h-10 mx-auto bg-[#0a0a0f] border-2 border-blue-400 flex items-center justify-center rounded-lg transform rotate-45 shadow-[0_0_15px_rgba(96,165,250,0.5)] group-hover:bg-blue-900/30 transition-colors">
                                                    <span className="text-xl font-black text-blue-100 -rotate-45">2</span>
                                                </div>
                                            </div>
                                            <div className="relative mt-4">
                                                <div className="absolute inset-0 rounded-full bg-blue-500 blur-[20px] opacity-40 group-hover:opacity-60 transition-opacity"></div>
                                                <div className="w-24 h-24 rounded-full border-[3px] border-blue-400 overflow-hidden relative z-10 bg-[#05050a]">
                                                    <img src={cleanCosmeticUrl(rankingList[1].avatarUrl) || 'https://placehold.co/100x100/0a0a0f/3b82f6?text=N'} className="w-full h-full object-cover" />
                                                </div>
                                            </div>
                                            <div className="mt-5 text-center w-full bg-[#0a0a0f]/80 backdrop-blur-md border border-white/5 p-3 rounded-2xl">
                                                <h4 className="font-black text-xs text-white uppercase truncate">{rankingList[1].displayName || rankingList[1].name || "Leitor"}</h4>
                                                <div className="mt-2 bg-[#121520] border border-blue-500/30 text-blue-400 px-3 py-1 rounded-full text-[9px] font-black inline-block uppercase tracking-widest">NV. {rankingList[1].level || 1}</div>
                                            </div>
                                            {/* Pedestal */}
                                            <div className="w-[80%] h-8 bg-gradient-to-b from-blue-900/40 to-transparent mt-2 rounded-t-xl border-t-2 border-blue-500/50"></div>
                                        </div>
                                    )}
                                    
                                    {/* 1º LUGAR */}
                                    {rankingList[0] && (
                                        <div onClick={() => setSelectedUserId(rankingList[0].id)} className="w-[35%] max-w-[200px] relative flex flex-col items-center order-2 z-10 cursor-pointer group transform hover:-translate-y-2 transition-transform duration-300">
                                            <div className="absolute -top-16 text-center z-20">
                                                <Crown className="w-8 h-8 text-yellow-400 fill-yellow-400 mx-auto -mb-2 drop-shadow-[0_0_15px_rgba(250,204,21,0.8)] animate-bounce" />
                                                <div className="w-12 h-12 mx-auto bg-[#0a0a0f] border-[3px] border-yellow-400 flex items-center justify-center rounded-lg transform rotate-45 shadow-[0_0_20px_rgba(250,204,21,0.5)] group-hover:bg-yellow-900/30 transition-colors">
                                                    <span className="text-2xl font-black text-yellow-100 -rotate-45">1</span>
                                                </div>
                                            </div>
                                            <div className="relative mt-2">
                                                <div className="absolute inset-0 rounded-full bg-purple-500 blur-[25px] opacity-50 group-hover:opacity-80 transition-opacity"></div>
                                                <div className="w-32 h-32 rounded-full border-[4px] border-yellow-400 overflow-hidden relative z-10 bg-[#05050a] shadow-[0_0_30px_rgba(250,204,21,0.3)]">
                                                    <img src={cleanCosmeticUrl(rankingList[0].avatarUrl) || 'https://placehold.co/100x100/0a0a0f/eab308?text=N'} className="w-full h-full object-cover" />
                                                </div>
                                            </div>
                                            <div className="mt-5 text-center w-full bg-[#0a0a0f]/90 backdrop-blur-md border border-yellow-500/30 p-4 rounded-2xl shadow-xl">
                                                <h4 className="font-black text-sm text-white uppercase truncate">{rankingList[0].displayName || rankingList[0].name || "Lenda"}</h4>
                                                <p className="text-[9px] text-purple-400 font-bold uppercase tracking-widest mt-1">{getLevelTitle(rankingList[0].level)}</p>
                                                <div className="mt-2.5 bg-gradient-to-r from-purple-900/50 to-pink-900/50 border border-purple-500/50 text-white px-4 py-1.5 rounded-full text-[10px] font-black inline-block shadow-inner">NÍVEL {rankingList[0].level || 1}</div>
                                            </div>
                                            {/* Pedestal */}
                                            <div className="w-[90%] h-12 bg-gradient-to-b from-yellow-900/30 to-transparent mt-2 rounded-t-xl border-t-[3px] border-yellow-400/60"></div>
                                        </div>
                                    )}

                                    {/* 3º LUGAR */}
                                    {rankingList[2] && (
                                        <div onClick={() => setSelectedUserId(rankingList[2].id)} className="w-[30%] max-w-[170px] relative flex flex-col items-center order-3 cursor-pointer group transform hover:-translate-y-2 transition-transform duration-300">
                                            <div className="absolute -top-12 text-center">
                                                <div className="w-10 h-10 mx-auto bg-[#0a0a0f] border-2 border-orange-400 flex items-center justify-center rounded-lg transform rotate-45 shadow-[0_0_15px_rgba(249,115,22,0.5)] group-hover:bg-orange-900/30 transition-colors">
                                                    <span className="text-xl font-black text-orange-100 -rotate-45">3</span>
                                                </div>
                                            </div>
                                            <div className="relative mt-4">
                                                <div className="absolute inset-0 rounded-full bg-orange-500 blur-[20px] opacity-40 group-hover:opacity-60 transition-opacity"></div>
                                                <div className="w-24 h-24 rounded-full border-[3px] border-orange-400 overflow-hidden relative z-10 bg-[#05050a]">
                                                    <img src={cleanCosmeticUrl(rankingList[2].avatarUrl) || 'https://placehold.co/100x100/0a0a0f/f97316?text=N'} className="w-full h-full object-cover" />
                                                </div>
                                            </div>
                                            <div className="mt-5 text-center w-full bg-[#0a0a0f]/80 backdrop-blur-md border border-white/5 p-3 rounded-2xl">
                                                <h4 className="font-black text-xs text-white uppercase truncate">{rankingList[2].displayName || rankingList[2].name || "Leitor"}</h4>
                                                <div className="mt-2 bg-[#121520] border border-orange-500/30 text-orange-400 px-3 py-1 rounded-full text-[9px] font-black inline-block uppercase tracking-widest">NV. {rankingList[2].level || 1}</div>
                                            </div>
                                            {/* Pedestal */}
                                            <div className="w-[80%] h-6 bg-gradient-to-b from-orange-900/40 to-transparent mt-2 rounded-t-xl border-t-2 border-orange-500/50"></div>
                                        </div>
                                    )}
                                </div>

                                <div className="flex flex-col gap-3 mt-4 px-2">
                                    {rankingList.slice(3, 20).map((player, idx) => (
                                        <div key={player.id} onClick={() => setSelectedUserId(player.id)} className="bg-[#0a0a0f] border border-white/5 p-4 flex items-center gap-4 hover:border-cyan-500/30 transition-all duration-300 group cursor-pointer rounded-2xl shadow-sm hover:shadow-lg hover:-translate-y-0.5 transform-gpu">
                                            <div className="w-8 text-center text-lg font-black text-gray-500 group-hover:text-cyan-400 transition-colors">{idx + 4}</div>
                                            <div className="w-12 h-12 rounded-full border-2 border-[#121520] overflow-hidden flex-shrink-0 bg-[#121520] group-hover:border-cyan-500/50 transition-colors">
                                                <img src={cleanCosmeticUrl(player.avatarUrl) || 'https://placehold.co/100x100/0a0a0f/06b6d4?text=N'} className="w-full h-full object-cover" />
                                            </div>
                                            <div className="flex-1 flex flex-col justify-center min-w-0">
                                                <h4 className="text-gray-100 font-black text-xs uppercase truncate group-hover:text-white transition-colors">{player.displayName || player.name || "Leitor"}</h4>
                                                <p className="text-cyan-600 font-bold text-[9px] uppercase tracking-widest truncate mt-1">{getLevelTitle(player.level)}</p>
                                            </div>
                                            <div className="bg-[#121520] border border-white/5 text-cyan-400 px-4 py-1.5 rounded-xl font-black text-[10px] uppercase shadow-inner">
                                                NV. {player.level || 1}
                                            </div>
                                            <ChevronRight className="w-4 h-4 text-gray-600 group-hover:text-cyan-400 transition-colors hidden sm:block flex-shrink-0" />
                                        </div>
                                    ))}
                                </div>
                            </>
                        )}
                    </div>
                )}

                {/* CAIXAS - PREMIUM E ELEGANTE */}
                {activeTab === "Caixas" && (
                    <div className="animate-in fade-in slide-in-from-bottom-4 duration-500 max-w-lg mx-auto pb-10">
                        <div className="text-center mb-10">
                            <h2 className="text-4xl md:text-5xl font-black text-white uppercase tracking-tighter drop-shadow-md">
                                CAIXAS <span className="text-cyan-400 drop-shadow-[0_0_15px_rgba(6,182,212,0.6)]">NEXO</span>
                            </h2>
                            <p className="text-[10px] md:text-xs text-gray-400 mt-3 font-medium tracking-[0.1em] uppercase">
                                Abra caixas e ganhe itens <span className="text-fuchsia-400">raros</span> para seu perfil.
                            </p>
                        </div>
                        
                        <div className="bg-[#0a0a0f]/80 backdrop-blur-xl border border-cyan-500/20 rounded-[2.5rem] p-8 relative overflow-hidden shadow-[0_20px_50px_rgba(0,0,0,0.3)] mb-6 flex flex-col items-center group hover:border-cyan-500/40 transition-colors">
                            <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,rgba(6,182,212,0.1),transparent_70%)] pointer-events-none"></div>
                            
                            <div className="relative w-full flex flex-col items-center mt-4">
                                <div className="absolute bottom-6 w-56 h-12 bg-transparent border-t-[2px] border-cyan-600/50 rounded-[100%] shadow-[0_-15px_30px_rgba(6,182,212,0.3)]"></div>
                                {/* Animação de Flutuação da Caixa */}
                                <img src={CHEST_CLOSED} className="w-56 h-56 object-contain relative z-10 drop-shadow-[0_15px_20px_rgba(0,0,0,0.5)] anim-float -translate-y-2" alt="Caixa Nexo" />
                            </div>
                            
                            <div className="text-center mt-6 mb-8 w-full">
                                <h3 className="text-6xl font-black text-white leading-none drop-shadow-[0_0_15px_rgba(255,255,255,0.2)] tracking-tighter">{userProfileData.caixas || 0}</h3>
                                <p className="text-[9px] text-cyan-500 font-bold uppercase tracking-[0.3em] mt-2">Disponíveis</p>
                            </div>
                            
                            <button onClick={handleOpenBox} disabled={(userProfileData.caixas || 0) < 1 || isOpeningBoxAnim} className="w-full bg-gradient-to-r from-cyan-600 to-blue-600 disabled:from-[#121520] disabled:to-[#121520] disabled:border-white/5 disabled:text-gray-600 hover:from-cyan-500 hover:to-blue-500 text-white font-black py-5 rounded-2xl text-[11px] uppercase tracking-[0.2em] transition-all relative z-10 shadow-[0_10px_20px_rgba(6,182,212,0.3)] disabled:shadow-none transform-gpu hover:-translate-y-1 disabled:translate-y-0">
                                Desvendar Recompensa
                            </button>
                        </div>
                        
                        {/* PAINEL DE RESGATE DIÁRIO - COM CRONÔMETRO CORRIGIDO */}
                        <div className="bg-[#0a0a0f]/80 backdrop-blur-md border border-white/10 rounded-3xl p-6 shadow-xl relative overflow-hidden flex flex-col gap-5">
                            <div className="absolute top-0 right-0 w-32 h-32 bg-cyan-500/5 blur-[40px] pointer-events-none"></div>
                            
                            <div className="flex items-center gap-4">
                                <div className="w-12 h-12 flex-shrink-0 bg-[#121520] rounded-2xl border border-white/5 flex items-center justify-center text-cyan-400 shadow-inner"><Calendar className="w-5 h-5"/></div>
                                <div>
                                    <h4 className="text-xs font-black text-white uppercase tracking-widest mb-1.5">Mimo Diário</h4>
                                    <p className="text-[10px] text-gray-500 leading-snug font-medium">1 Caixa Nexo <span className="text-cyan-400">gratuita</span> todos os dias.</p>
                                </div>
                            </div>
                            
                            <div className="w-full bg-[#121520] rounded-xl p-4 flex items-center justify-between border border-white/5">
                                <p className="text-[9px] text-gray-500 font-bold uppercase tracking-[0.2em]">Disponibilidade</p>
                                {canClaimDaily ? (
                                    <button onClick={handleClaimDaily} className="bg-cyan-500 hover:bg-cyan-400 text-black font-black px-6 py-2 rounded-lg text-[10px] uppercase tracking-widest shadow-[0_0_15px_rgba(6,182,212,0.4)] transition-all">Resgatar Agora</button>
                                ) : (
                                    // AQUI ESTÁ O CRONÔMETRO FUNCIONANDO PERFEITAMENTE
                                    <span className="text-lg font-black text-cyan-400 drop-shadow-[0_0_10px_rgba(6,182,212,0.5)] tracking-widest">{countdown}</span>
                                )}
                            </div>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
}
