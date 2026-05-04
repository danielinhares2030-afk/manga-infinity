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
        <div className="fixed inset-0 z-[99999] bg-black/90 backdrop-blur-md flex items-center justify-center p-4 animate-in fade-in zoom-in-95 duration-300" onClick={onClose}>
            <div className="bg-[#05050a] border border-cyan-500/50 rounded-2xl w-full max-w-sm relative overflow-hidden shadow-[0_0_50px_rgba(6,182,212,0.2)]" onClick={e => e.stopPropagation()}>
                {loading ? (
                    <div className="p-16 flex justify-center"><Loader2 className="w-10 h-10 text-cyan-500 animate-spin"/></div>
                ) : !data ? (
                    <div className="p-10 text-center text-gray-500 font-black uppercase tracking-widest text-xs">Usuário não encontrado.</div>
                ) : data.settings?.isPrivate && userId !== currentUserId ? (
                    <div className="p-12 text-center bg-[radial-gradient(ellipse_at_center,rgba(6,182,212,0.1),transparent_70%)]">
                        <EyeOff className="w-16 h-16 text-cyan-900 mx-auto mb-6 drop-shadow-[0_0_15px_rgba(6,182,212,0.5)]" />
                        <h3 className="text-white font-black text-xl uppercase tracking-widest">Perfil Privado</h3>
                        <p className="text-gray-500 text-[10px] mt-3 font-bold uppercase tracking-[0.2em]">Este usuário ocultou seu perfil do sistema.</p>
                        <button onClick={onClose} className="mt-8 bg-cyan-950/40 text-cyan-400 border border-cyan-900/50 px-8 py-3 rounded-xl font-black text-[10px] uppercase tracking-widest hover:bg-cyan-900/60 transition-colors">Retornar</button>
                    </div>
                ) : (
                    <div className="pb-8">
                        <div className="h-32 w-full bg-blue-950/30 relative border-b border-cyan-900/30">
                            {data.coverUrl ? <img src={cleanCosmeticUrl(data.coverUrl)} className="w-full h-full object-cover opacity-50 mix-blend-screen" /> : <div className="w-full h-full bg-[url('https://www.transparenttextures.com/patterns/stardust.png')] opacity-20"></div>}
                            <div className="absolute inset-0 bg-gradient-to-t from-[#05050a] via-transparent to-transparent"></div>
                            <button onClick={onClose} className="absolute top-4 right-4 bg-black/50 p-2 rounded-full text-white hover:text-cyan-400 hover:bg-black transition-colors backdrop-blur-md"><X className="w-4 h-4"/></button>
                        </div>
                        <div className="relative -mt-16 flex justify-center">
                            <div className="w-28 h-28 rounded-full border-[3px] border-[#05050a] bg-[#0a0a16] relative flex items-center justify-center shadow-[0_0_20px_rgba(6,182,212,0.3)]">
                                <img src={cleanCosmeticUrl(data.equipped_items?.avatar?.preview) || data.avatarUrl || 'https://placehold.co/150x150/020205/0ea5e9?text=N'} className="w-full h-full object-cover rounded-full" />
                                {data.equipped_items?.moldura?.preview && <img src={cleanCosmeticUrl(data.equipped_items.moldura.preview)} className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[140%] h-[140%] max-w-none object-contain pointer-events-none" style={{mixBlendMode: 'screen'}} />}
                            </div>
                        </div>
                        <div className="text-center mt-4 px-6">
                            <h3 className="text-2xl font-black text-white uppercase tracking-tight">{data.name || data.displayName || 'Leitor'}</h3>
                            <div className="inline-flex items-center gap-2 mt-2 bg-blue-950/30 border border-cyan-900/50 px-4 py-1.5 rounded-full">
                                <Sparkles className="w-3 h-3 text-cyan-400" />
                                <span className="text-cyan-400 text-[10px] font-black uppercase tracking-widest">Nível {data.level || 1} • {getLevelTitle(data.level || 1)}</span>
                            </div>
                            <p className="text-gray-400 text-xs italic mt-5 leading-relaxed font-medium line-clamp-3">"{data.bio || 'Explorando o universo dos mangás.'}"</p>
                        </div>
                        <div className="grid grid-cols-3 gap-2 mt-8 px-8 border-t border-white/5 pt-8">
                            <div className="text-center flex flex-col items-center">
                                <div className="w-10 h-10 rounded-full bg-cyan-950/20 border border-cyan-900/30 flex items-center justify-center mb-2"><Zap className="w-4 h-4 text-cyan-400"/></div>
                                <span className="block text-lg font-black text-white">{data.xp || 0}</span>
                                <span className="text-[8px] text-gray-500 font-black uppercase tracking-widest mt-0.5">Pontos XP</span>
                            </div>
                            <div className="text-center flex flex-col items-center">
                                <div className="w-10 h-10 rounded-full bg-amber-950/20 border border-amber-900/30 flex items-center justify-center mb-2"><div className="w-3 h-3 bg-amber-500 rotate-45"></div></div>
                                <span className="block text-lg font-black text-white">{data.coins || 0}</span>
                                <span className="text-[8px] text-gray-500 font-black uppercase tracking-widest mt-0.5">Moedas</span>
                            </div>
                            <div className="text-center flex flex-col items-center">
                                <div className="w-10 h-10 rounded-full bg-blue-950/20 border border-blue-900/30 flex items-center justify-center mb-2"><Hexagon className="w-4 h-4 text-blue-500"/></div>
                                <span className="block text-lg font-black text-white">{data.crystals || 0}</span>
                                <span className="text-[8px] text-gray-500 font-black uppercase tracking-widest mt-0.5">Cristais</span>
                            </div>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
};

export function NexoView({ user, userProfileData, showToast, mangas, onNavigate, onLevelUp, synthesizeCrystal, shopItems }) {
    const [activeTab, setActiveTab] = useState("Forja");
    const [synthesizing, setSynthesizing] = useState(false);
    const [rankingList, setRankingList] = useState([]);
    const [loadingRank, setLoadingRank] = useState(false);
    
    const [isOpeningBoxAnim, setIsOpeningBoxAnim] = useState(false);
    const [boxReward, setBoxReward] = useState(null);

    const [showSacrificeModal, setShowSacrificeModal] = useState(false);
    const [selectedUserId, setSelectedUserId] = useState(null);

    useEffect(() => {
        if(activeTab === 'Ranking') fetchRanking();
    }, [activeTab]);

    const fetchRanking = async () => {
        setLoadingRank(true);
        try {
            const snap = await getDocs(query(collectionGroup(db, 'profile')));
            let rankData = [];
            snap.forEach(doc => {
                if(doc.ref.path.includes('main')) {
                    const data = doc.data();
                    // Filtro mais permissivo: Mostra o usuário se ele tiver mais de 0 XP ou Nível maior que 1.
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
        <div className={`pb-24 animate-in fade-in duration-500 relative font-sans min-h-screen text-gray-200 ${equipped.tema_perfil ? equipped.tema_perfil.cssClass : 'bg-[#010308]'}`}>
            
            {showSacrificeModal && (
                <div className="fixed inset-0 z-[99999] bg-black/90 backdrop-blur-md flex items-center justify-center p-4 animate-in fade-in zoom-in-95 duration-200">
                    <div className="bg-[#05050a] border border-cyan-500/60 rounded-2xl p-8 max-w-sm w-full shadow-[0_0_50px_rgba(6,182,212,0.2)] text-center relative overflow-hidden">
                        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,rgba(6,182,212,0.1),transparent_70%)] pointer-events-none"></div>
                        <Zap className="w-14 h-14 text-cyan-400 mx-auto mb-5 relative z-10 drop-shadow-[0_0_15px_rgba(6,182,212,0.8)]" />
                        <h3 className="text-xl font-black text-white uppercase tracking-widest mb-3 relative z-10">Conversão de XP</h3>
                        <p className="text-gray-400 text-xs font-bold mb-8 relative z-10 leading-relaxed">Você irá converter <span className="text-cyan-400">1000 XP</span> do seu perfil. Seu nível pode retroceder. Deseja sintetizar a caixa mesmo assim?</p>
                        <div className="flex gap-4 relative z-10">
                            <button onClick={() => setShowSacrificeModal(false)} className="flex-1 bg-[#0a0a16] border border-white/10 text-gray-300 py-3.5 rounded-xl font-black text-[10px] uppercase tracking-widest hover:bg-white/5 transition-colors">Cancelar</button>
                            <button onClick={executeBuyBoxWithXP} className="flex-1 bg-cyan-600 hover:bg-cyan-500 text-white py-3.5 rounded-xl font-black text-[10px] uppercase tracking-widest shadow-[0_0_20px_rgba(6,182,212,0.4)] transition-all">Converter XP</button>
                        </div>
                    </div>
                </div>
            )}

            {selectedUserId && <PublicProfileModal userId={selectedUserId} onClose={() => setSelectedUserId(null)} currentUserId={user?.uid} />}

            {isOpeningBoxAnim && (
                <div className="fixed inset-0 z-[9999] bg-[#000000] flex flex-col items-center justify-center overflow-hidden">
                    <style>{`
                        .anim-chest-shake { animation: chest-shake 2.2s cubic-bezier(.36,.07,.19,.97) both; }
                        .anim-chest-burst { animation: chest-burst 2.5s ease-out both; }
                        .anim-chest-open { animation: chest-open 2.5s ease-out both; }
                        
                        @keyframes chest-shake {
                            0% { transform: scale(1); filter: drop-shadow(0 0 10px rgba(6,182,212,0.5)); }
                            10%, 30%, 50%, 70% { transform: scale(1.1) translate(-6px, 3px) rotate(-6deg); filter: drop-shadow(0 0 20px rgba(6,182,212,0.8)); }
                            20%, 40%, 60%, 80% { transform: scale(1.1) translate(6px, -3px) rotate(6deg); filter: drop-shadow(0 0 35px rgba(139,92,246,0.9)); }
                            85% { transform: scale(1.2) rotate(0deg); filter: brightness(1.5) drop-shadow(0 0 80px rgba(6,182,212,1)); opacity: 1; }
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
                    <div className="absolute w-96 h-96 rounded-full anim-chest-burst z-10 pointer-events-none"></div>
                    <div className="absolute inset-0 flex flex-col items-center justify-center anim-chest-shake z-20 pointer-events-none">
                        <img src={CHEST_CLOSED} className="w-36 h-36 md:w-48 md:h-48 object-contain flex-shrink-0" alt="Chest Closed" />
                    </div>
                    <div className="absolute inset-0 flex flex-col items-center justify-center anim-chest-open z-30 pointer-events-none">
                        <img src={CHEST_OPEN} className="w-56 h-56 md:w-72 md:h-72 object-contain mix-blend-screen flex-shrink-0" alt="Chest Opened" />
                    </div>
                </div>
            )}

            {boxReward && (
                <div className="fixed inset-0 z-[9999] bg-black/90 backdrop-blur-md flex flex-col items-center justify-center p-4 animate-in zoom-in-95 duration-300">
                    <div className="bg-[#0a0a16] border border-cyan-500/50 rounded-2xl p-8 max-w-md w-full text-center shadow-[0_0_50px_rgba(6,182,212,0.3)] relative overflow-hidden">
                        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,rgba(6,182,212,0.2),transparent_70%)] pointer-events-none"></div>
                        <h3 className="text-xl font-black text-white uppercase tracking-widest mb-6 relative z-10">Recompensa Recebida</h3>
                        <div className="flex justify-center mb-6 relative z-10">
                            {boxReward.type === 'coins' && <div className="w-24 h-24 rounded-full bg-amber-950/40 border-2 border-amber-500 flex items-center justify-center shadow-[0_0_20px_rgba(245,158,11,0.4)] flex-shrink-0"><div className="w-10 h-10 bg-amber-500 rotate-45 shadow-lg"></div></div>}
                            {boxReward.type === 'xp' && <div className="w-24 h-24 rounded-full bg-blue-950/40 border-2 border-cyan-500 flex items-center justify-center shadow-[0_0_20px_rgba(6,182,212,0.4)] flex-shrink-0"><Zap className="w-12 h-12 text-cyan-400 drop-shadow-lg"/></div>}
                            {boxReward.type === 'cosmetic' && (
                                <div className={`w-28 h-28 rounded-xl bg-[#05050a] border-2 overflow-hidden flex flex-col items-center justify-center relative p-2 flex-shrink-0 ${boxReward.value.raridade === 'Mítico' ? 'border-red-500 shadow-[0_0_30px_rgba(239,68,68,0.5)]' : boxReward.value.raridade === 'Lendário' ? 'border-yellow-500 shadow-[0_0_30px_rgba(234,179,8,0.5)]' : boxReward.value.raridade === 'Épico' ? 'border-purple-500 shadow-[0_0_30px_rgba(168,85,247,0.5)]' : 'border-cyan-500 shadow-[0_0_20px_rgba(6,182,212,0.4)]'}`}>
                                    {cleanCosmeticUrl(boxReward.value.preview) ? <img src={cleanCosmeticUrl(boxReward.value.preview)} className="w-16 h-16 object-cover rounded-full mb-2" /> : <img src={CHEST_OPEN} className="w-12 h-12 object-contain mb-2" alt="Reward" />}
                                    <div className={`text-[8px] font-black uppercase tracking-widest px-2 py-0.5 rounded bg-black/80 border ${getRarityColor(boxReward.value.raridade)}`}>
                                        {boxReward.value.raridade || 'Comum'}
                                    </div>
                                </div>
                            )}
                        </div>
                        <h4 className={`text-lg font-black uppercase relative z-10 ${boxReward.type === 'cosmetic' && boxReward.value.raridade === 'Mítico' ? 'text-red-400' : boxReward.type === 'cosmetic' && boxReward.value.raridade === 'Lendário' ? 'text-yellow-400' : 'text-white'}`}>
                            {boxReward.type === 'coins' && `+${boxReward.value} Moedas`}
                            {boxReward.type === 'xp' && `+${boxReward.value} XP`}
                            {boxReward.type === 'cosmetic' && boxReward.value.nome}
                        </h4>
                        {boxReward.type === 'cosmetic' && <p className="text-cyan-400 text-[10px] font-bold uppercase tracking-widest mt-1 relative z-10">Item Visual Adicionado</p>}
                        <button onClick={() => setBoxReward(null)} className="mt-8 bg-cyan-600 hover:bg-cyan-500 text-white font-black w-full py-4 rounded-xl text-xs uppercase tracking-widest transition-colors relative z-10 shadow-lg">Confirmar</button>
                    </div>
                </div>
            )}

            {!equipped.tema_perfil && (
                <div className="absolute inset-0 z-0">
                    <div className="absolute inset-0 bg-[linear-gradient(to_right,#0ea5e908_1px,transparent_1px),linear-gradient(to_bottom,#0ea5e908_1px,transparent_1px)] bg-[size:40px_40px]"></div>
                </div>
            )}

            <div className="max-w-6xl mx-auto px-4 py-8 relative z-10">
                <div className="flex justify-center gap-4 mb-10 w-full px-2">
                    {['Caixas', 'Forja', 'Ranking'].map((tab) => (
                        <button key={tab} onClick={() => setActiveTab(tab)} className={`relative px-6 md:px-10 py-3 font-black text-[10px] uppercase tracking-[0.2em] transition-all rounded-full border border-white/5 shadow-md
                            ${activeTab === tab ? 'bg-gradient-to-r from-blue-700 to-cyan-600 border-cyan-500 shadow-[0_0_15px_rgba(6,182,212,0.4)] text-white' : 'bg-[#05050a] text-gray-500 hover:text-cyan-400 hover:border-cyan-500/30'}`}>
                            <div className="flex items-center gap-2">
                                {tab === "Caixas" && <img src={CHEST_CLOSED} className="w-4 h-4 object-contain opacity-80" alt="Chest" />}
                                {tab === "Forja" && <Zap className="w-3.5 h-3.5"/>}
                                {tab === "Ranking" && <Trophy className="w-3.5 h-3.5"/>}
                                {tab}
                            </div>
                        </button>
                    ))}
                </div>

                {activeTab === "Forja" && (
                    <div className="animate-in fade-in duration-500 max-w-lg mx-auto relative z-10 mt-2">
                        <div className="bg-[#02050b]/95 border border-cyan-500/40 p-8 rounded-[2rem] relative overflow-hidden shadow-[0_0_40px_rgba(6,182,212,0.15)]">
                            <div className="absolute inset-0 flex items-center justify-center opacity-10 pointer-events-none -mt-20">
                                <div className="w-[300px] h-[300px] rounded-full border border-cyan-400"></div>
                                <div className="w-[220px] h-[220px] rounded-full border border-cyan-400 absolute"></div>
                                <div className="w-[140px] h-[140px] rounded-full border border-cyan-400 absolute border-dashed rotate-45"></div>
                            </div>
                            <div className="w-24 h-24 mx-auto mb-5 flex items-center justify-center relative z-10">
                                <Zap className="w-20 h-20 text-cyan-400 drop-shadow-[0_0_20px_rgba(6,182,212,1)]" strokeWidth={1.5} fill="currentColor" fillOpacity="0.2"/>
                            </div>
                            <h2 className="text-4xl font-black text-white text-center mb-3 relative z-10 tracking-tight drop-shadow-md">
                                REATOR <span className="text-cyan-400">NEXO</span>
                            </h2>
                            <p className="text-center text-gray-400 text-[10px] md:text-xs tracking-[0.15em] font-bold relative z-10 mb-8 leading-relaxed">
                                TRANSMUTE <span className="text-cyan-400">5 CRISTAIS</span> EM PODER BRUTO.<br/>
                                <span className="text-cyan-400">40% DE CHANCE</span> DE FALHA NO PROCESSO.
                            </p>
                            <div className="border border-cyan-500/30 bg-transparent rounded-2xl p-6 mb-6 relative z-10 shadow-[inset_0_0_20px_rgba(6,182,212,0.05)]">
                                <h3 className="text-center text-blue-500 text-[11px] font-black tracking-widest uppercase mb-4 drop-shadow-md">
                                    Carga Atual
                                </h3>
                                <div className="flex justify-center items-center gap-5 mb-6">
                                    <span className="text-6xl font-black text-white drop-shadow-[0_0_15px_rgba(255,255,255,0.4)]">
                                        {userProfileData.crystals || 0}
                                    </span>
                                    <Hexagon className="w-14 h-14 text-blue-500 drop-shadow-[0_0_15px_rgba(59,130,246,0.8)]" strokeWidth={2}/>
                                </div>
                                <div className="flex items-center justify-center gap-5 max-w-[240px] mx-auto relative mt-2">
                                    <div className="absolute left-0 top-1/2 w-full h-[2px] bg-cyan-900/30 -translate-y-1/2 z-0"></div>
                                    {[1, 2, 3, 4, 5].map(i => (
                                        <div key={i} className={`relative z-10 w-2.5 h-2.5 rounded-full transition-all duration-300 ${i <= (userProfileData.crystals || 0) ? 'bg-cyan-400 shadow-[0_0_12px_rgba(6,182,212,1)] scale-125' : 'bg-[#05050a] border border-cyan-900/50'}`}></div>
                                    ))}
                                </div>
                            </div>
                            <div className="flex justify-between items-center bg-transparent border border-white/5 rounded-2xl p-4 mb-8 relative z-10 divide-x divide-white/10 shadow-[inset_0_0_10px_rgba(255,255,255,0.02)]">
                                <div className="flex flex-col items-center flex-1 px-1">
                                    <div className="flex items-center gap-1.5 mb-2 h-6">
                                        <Hexagon className="w-3.5 h-3.5 text-cyan-500"/>
                                        <span className="text-[7px] font-black text-gray-400 uppercase tracking-widest leading-tight">Cristais<br/>Necessários</span>
                                    </div>
                                    <span className="text-lg font-black text-white">5</span>
                                </div>
                                <div className="flex flex-col items-center flex-1 px-1">
                                    <div className="flex items-center gap-1.5 mb-2 h-6">
                                        <Zap className="w-3.5 h-3.5 text-blue-500"/>
                                        <span className="text-[7px] font-black text-gray-400 uppercase tracking-widest leading-tight">Chance de<br/>Sucesso</span>
                                    </div>
                                    <span className="text-lg font-black text-blue-400">60%</span>
                                </div>
                                <div className="flex flex-col items-center flex-1 px-1">
                                    <div className="flex items-center gap-1.5 mb-2 h-6">
                                        <Shield className="w-3.5 h-3.5 text-gray-500"/>
                                        <span className="text-[7px] font-black text-gray-400 uppercase tracking-widest leading-tight">Risco de<br/>Falha</span>
                                    </div>
                                    <span className="text-lg font-black text-red-500">40%</span>
                                </div>
                            </div>
                            <button onClick={runSynthesis} disabled={synthesizing || (userProfileData.crystals || 0) < 5} className="w-full bg-gradient-to-r from-blue-700 to-cyan-500 hover:brightness-110 disabled:opacity-50 disabled:grayscale border border-cyan-400 shadow-[0_0_20px_rgba(6,182,212,0.4)] text-white font-black py-4 rounded-[1rem] text-[11px] uppercase tracking-[0.15em] flex items-center justify-center gap-2 transition-all relative z-10">
                                {synthesizing ? <Loader2 className="w-5 h-5 animate-spin" /> : <>INICIAR TRANSMUTAÇÃO <span className="text-lg leading-none tracking-tighter ml-1">»</span></>}
                            </button>
                        </div>
                    </div>
                )}

                {activeTab === "Ranking" && (
                    <div className="animate-in fade-in duration-500 max-w-4xl mx-auto pb-10">
                        <div className="flex justify-between items-end mb-16 border-b border-purple-900/30 pb-4">
                            <div className="flex items-center gap-3">
                                <Trophy className="w-8 h-8 text-blue-500 fill-blue-500 drop-shadow-[0_0_10px_rgba(59,130,246,0.6)]" />
                                <div>
                                    <h2 className="text-2xl md:text-3xl font-black text-white uppercase tracking-tighter drop-shadow-md">RANKING GLOBAL</h2>
                                    <p className="text-[10px] text-gray-400 mt-1 font-medium tracking-widest uppercase">Suba no ranking e prove seu nível.</p>
                                </div>
                            </div>
                        </div>

                        {loadingRank ? (
                            <div className="flex justify-center py-20"><Loader2 className="w-10 h-10 text-cyan-500 animate-spin"/></div>
                        ) : (
                            <>
                                <div className="flex justify-center items-end gap-2 md:gap-6 mb-16 mt-8">
                                    {rankingList[1] && (
                                        <div onClick={() => setSelectedUserId(rankingList[1].id)} className="w-[30%] max-w-[170px] relative flex flex-col items-center order-1 cursor-pointer group">
                                            <div className="absolute -top-10 text-center">
                                                <div className="w-10 h-12 mx-auto bg-transparent border-2 border-blue-500 flex items-center justify-center rounded-md transform rotate-45 shadow-[0_0_15px_rgba(59,130,246,0.6)] group-hover:scale-110 transition-transform">
                                                    <span className="text-2xl font-black text-white -rotate-45">2</span>
                                                </div>
                                            </div>
                                            <div className="relative mt-4">
                                                <div className="absolute inset-0 rounded-full bg-blue-600 blur-[20px] opacity-40"></div>
                                                <div className="w-24 h-24 rounded-full border-4 border-blue-500 overflow-hidden relative z-10 bg-[#05050a]">
                                                    <img src={cleanCosmeticUrl(rankingList[1].avatarUrl) || 'https://placehold.co/100x100/020205/0ea5e9?text=N'} className="w-full h-full object-cover" />
                                                </div>
                                            </div>
                                            <div className="mt-4 text-center w-full">
                                                <h4 className="font-black text-sm text-white uppercase truncate px-2">{rankingList[1].displayName || rankingList[1].name || "Leitor"}</h4>
                                                <p className="text-[9px] text-blue-400 font-bold uppercase mt-1">{getLevelTitle(rankingList[1].level)}</p>
                                                <div className="mt-3 bg-transparent border border-blue-600/50 text-blue-400 px-3 py-1 rounded-full text-[9px] font-black inline-block">NV. {rankingList[1].level || 1}</div>
                                                <div className="w-full h-1 bg-gray-900 rounded-full mt-3 overflow-hidden"><div className="h-full bg-blue-500 shadow-[0_0_10px_rgba(59,130,246,1)]" style={{width: `${Math.min(100, ((rankingList[1].xp || 0) / ((rankingList[1].level || 1)*100)) * 100)}%`}}></div></div>
                                                <div className="text-[9px] text-gray-400 font-medium mt-1.5">{rankingList[1].xp || 0} / {(rankingList[1].level || 1) * 100} XP</div>
                                            </div>
                                            <div className="w-[120%] h-4 bg-blue-900/30 rounded-[100%] border-t border-blue-500/50 mt-4 shadow-[0_-5px_15px_rgba(59,130,246,0.3)]"></div>
                                        </div>
                                    )}
                                    
                                    {rankingList[0] && (
                                        <div onClick={() => setSelectedUserId(rankingList[0].id)} className="w-[35%] max-w-[200px] relative flex flex-col items-center order-2 z-10 transform scale-110 mb-4 cursor-pointer group">
                                            <div className="absolute -top-14 text-center">
                                                <Crown className="w-8 h-8 text-yellow-400 fill-yellow-400 mx-auto -mb-2 drop-shadow-[0_0_10px_rgba(250,204,21,0.8)]" />
                                                <div className="w-12 h-14 mx-auto bg-transparent border-[3px] border-yellow-500 flex items-center justify-center rounded-md transform rotate-45 shadow-[0_0_20px_rgba(250,204,21,0.6)] group-hover:scale-110 transition-transform">
                                                    <span className="text-3xl font-black text-white -rotate-45">1</span>
                                                </div>
                                            </div>
                                            <div className="relative mt-5">
                                                <div className="absolute inset-0 rounded-full bg-purple-600 blur-[25px] opacity-60"></div>
                                                <div className="w-28 h-28 rounded-full border-[4px] border-purple-500 overflow-hidden relative z-10 bg-[#05050a]">
                                                    <img src={cleanCosmeticUrl(rankingList[0].avatarUrl) || 'https://placehold.co/100x100/020205/0ea5e9?text=N'} className="w-full h-full object-cover" />
                                                </div>
                                            </div>
                                            <div className="mt-5 text-center w-full">
                                                <h4 className="font-black text-base text-white uppercase truncate px-2">{rankingList[0].displayName || rankingList[0].name || "Leitor"}</h4>
                                                <p className="text-[10px] text-purple-400 font-bold uppercase mt-1">{getLevelTitle(rankingList[0].level)}</p>
                                                <div className="mt-3 bg-transparent border border-purple-500 text-purple-400 px-4 py-1 rounded-full text-[10px] font-black inline-block shadow-[0_0_10px_rgba(168,85,247,0.3)]">NV. {rankingList[0].level || 1}</div>
                                                <div className="w-full h-1.5 bg-gray-900 rounded-full mt-3 overflow-hidden"><div className="h-full bg-purple-500 shadow-[0_0_15px_rgba(168,85,247,1)]" style={{width: `${Math.min(100, ((rankingList[0].xp || 0) / ((rankingList[0].level || 1)*100)) * 100)}%`}}></div></div>
                                                <div className="text-[10px] text-gray-300 font-medium mt-1.5">{rankingList[0].xp || 0} / {(rankingList[0].level || 1) * 100} XP</div>
                                            </div>
                                            <div className="w-[130%] h-6 bg-purple-900/30 rounded-[100%] border-t-[2px] border-purple-500 mt-4 shadow-[0_-5px_25px_rgba(168,85,247,0.4)]"></div>
                                        </div>
                                    )}

                                    {rankingList[2] && (
                                        <div onClick={() => setSelectedUserId(rankingList[2].id)} className="w-[30%] max-w-[170px] relative flex flex-col items-center order-3 cursor-pointer group">
                                            <div className="absolute -top-10 text-center">
                                                <div className="w-10 h-12 mx-auto bg-transparent border-2 border-orange-500 flex items-center justify-center rounded-md transform rotate-45 shadow-[0_0_15px_rgba(249,115,22,0.6)] group-hover:scale-110 transition-transform">
                                                    <span className="text-2xl font-black text-white -rotate-45">3</span>
                                                </div>
                                            </div>
                                            <div className="relative mt-4">
                                                <div className="absolute inset-0 rounded-full bg-orange-600 blur-[20px] opacity-40"></div>
                                                <div className="w-24 h-24 rounded-full border-4 border-orange-500 overflow-hidden relative z-10 bg-[#05050a]">
                                                    <img src={cleanCosmeticUrl(rankingList[2].avatarUrl) || 'https://placehold.co/100x100/020205/0ea5e9?text=N'} className="w-full h-full object-cover" />
                                                </div>
                                            </div>
                                            <div className="mt-4 text-center w-full">
                                                <h4 className="font-black text-sm text-white uppercase truncate px-2">{rankingList[2].displayName || rankingList[2].name || "Leitor"}</h4>
                                                <p className="text-[9px] text-orange-400 font-bold uppercase mt-1">{getLevelTitle(rankingList[2].level)}</p>
                                                <div className="mt-3 bg-transparent border border-orange-600/50 text-orange-500 px-3 py-1 rounded-full text-[9px] font-black inline-block">NV. {rankingList[2].level || 1}</div>
                                                <div className="w-full h-1 bg-gray-900 rounded-full mt-3 overflow-hidden"><div className="h-full bg-orange-500 shadow-[0_0_10px_rgba(249,115,22,1)]" style={{width: `${Math.min(100, ((rankingList[2].xp || 0) / ((rankingList[2].level || 1)*100)) * 100)}%`}}></div></div>
                                                <div className="text-[9px] text-gray-400 font-medium mt-1.5">{rankingList[2].xp || 0} / {(rankingList[2].level || 1) * 100} XP</div>
                                            </div>
                                            <div className="w-[120%] h-4 bg-orange-900/30 rounded-[100%] border-t border-orange-500/50 mt-4 shadow-[0_-5px_15px_rgba(249,115,22,0.3)]"></div>
                                        </div>
                                    )}
                                </div>

                                <div className="flex flex-col gap-2 mt-4 px-2">
                                    {rankingList.slice(3, 10).map((player, idx) => (
                                        <div key={player.id} onClick={() => setSelectedUserId(player.id)} className="bg-transparent border-b border-white/5 py-4 flex items-center gap-4 hover:bg-white/5 transition-colors group cursor-pointer px-2 rounded-lg">
                                            <div className="w-8 text-center text-xl font-black text-white">{idx + 4}</div>
                                            <div className="w-10 h-10 rounded-full border border-cyan-900/50 overflow-hidden flex-shrink-0 bg-[#05050a]">
                                                <img src={cleanCosmeticUrl(player.avatarUrl) || 'https://placehold.co/100x100/020205/0ea5e9?text=N'} className="w-full h-full object-cover" />
                                            </div>
                                            <div className="w-32 flex flex-col justify-center">
                                                <h4 className="text-white font-black text-xs uppercase truncate">{player.displayName || player.name || "Leitor"}</h4>
                                                <p className="text-blue-500 font-bold text-[8px] uppercase tracking-widest truncate">{getLevelTitle(player.level)}</p>
                                            </div>
                                            <div className="bg-transparent border border-blue-900/50 text-blue-400 px-2 py-0.5 rounded-full font-black text-[8px] uppercase whitespace-nowrap">
                                                NV. {player.level || 1}
                                            </div>
                                            <div className="flex-1 hidden sm:flex items-center gap-3">
                                                <div className="flex-1 h-1 bg-gray-900 rounded-full overflow-hidden">
                                                    <div className="h-full bg-gradient-to-r from-blue-700 to-purple-500" style={{width: `${Math.min(100, ((player.xp || 0) / ((player.level || 1)*100)) * 100)}%`}}></div>
                                                </div>
                                                <span className="text-[9px] font-medium text-gray-500 whitespace-nowrap w-24 text-right">
                                                    {player.xp || 0} / {(player.level || 1) * 100} XP
                                                </span>
                                            </div>
                                            <ChevronRight className="w-4 h-4 text-purple-600 group-hover:text-purple-400 transition-colors ml-auto flex-shrink-0" />
                                        </div>
                                    ))}
                                </div>
                            </>
                        )}
                    </div>
                )}

                {activeTab === "Caixas" && (
                    <div className="animate-in fade-in duration-500 max-w-lg mx-auto pb-10">
                        <div className="text-center mb-8">
                            <h2 className="text-4xl md:text-5xl font-black text-white uppercase tracking-tighter drop-shadow-md">
                                CAIXAS <span className="bg-clip-text text-transparent bg-gradient-to-r from-cyan-400 to-purple-500">NEXO</span>
                            </h2>
                            <p className="text-[10px] md:text-xs text-gray-400 mt-2 font-medium tracking-wide">
                                Abra caixas e ganhe <span className="text-cyan-400">moedas</span>, <span className="text-purple-400">XP</span> e <span className="text-fuchsia-400">itens raros</span> para seu perfil!
                            </p>
                        </div>
                        <div className="bg-[#05030A] border border-blue-500/30 rounded-3xl p-8 relative overflow-hidden shadow-[0_0_50px_rgba(59,130,246,0.15)] mb-6 flex flex-col items-center">
                            <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,rgba(168,85,247,0.1),transparent_70%)] pointer-events-none"></div>
                            <div className="relative w-full flex flex-col items-center mt-6">
                                <div className="absolute bottom-4 w-64 h-16 bg-transparent border-t-[3px] border-purple-600 rounded-[100%] shadow-[0_-15px_30px_rgba(168,85,247,0.6)]"></div>
                                <div className="absolute bottom-6 w-48 h-12 bg-transparent border-t border-purple-400 rounded-[100%]"></div>
                                <img src={CHEST_CLOSED} className="w-56 h-56 object-contain relative z-10 drop-shadow-[0_0_20px_rgba(168,85,247,0.8)] -translate-y-4" alt="Caixa Nexo" />
                            </div>
                            <div className="text-center mt-2 mb-6 w-full">
                                <h3 className="text-6xl font-black text-white leading-none drop-shadow-[0_0_10px_rgba(255,255,255,0.3)]">{userProfileData.caixas || 0}</h3>
                                <p className="text-[10px] text-gray-400 font-black uppercase tracking-widest mt-1">Caixas Disponíveis</p>
                            </div>
                            <button onClick={handleOpenBox} disabled={(userProfileData.caixas || 0) < 1 || isOpeningBoxAnim} className="w-full bg-cyan-600 disabled:bg-[#0a0a16] disabled:border disabled:border-white/5 disabled:text-gray-600 hover:bg-cyan-500 text-white font-black py-4 rounded-xl text-xs uppercase tracking-widest transition-all relative z-10 shadow-[0_0_20px_rgba(6,182,212,0.4)] disabled:shadow-none">Abrir Caixa</button>
                        </div>
                        <div className="grid grid-cols-[1fr_auto_auto] items-center bg-[#05030A] border border-blue-900/30 rounded-2xl p-5 shadow-lg relative overflow-hidden mt-6">
                            <div className="flex items-start gap-4">
                                <div className="p-3 bg-blue-950/40 rounded-xl border border-blue-500/30 text-cyan-400"><Calendar className="w-6 h-6"/></div>
                                <div>
                                    <h4 className="text-xs font-black text-white uppercase tracking-widest mb-1">RECOMPENSA DIÁRIA</h4>
                                    <p className="text-[9px] text-gray-400 leading-snug">Acesse o sistema todos os dias para receber 1 Caixa Nexo <span className="text-cyan-400">gratuitamente.</span></p>
                                </div>
                            </div>
                            <div className="px-4 text-right border-l border-white/10 ml-4 pl-4">
                                <p className="text-[8px] text-gray-500 font-bold uppercase tracking-widest mb-1">PRÓXIMA CAIXA EM</p>
                                {canClaimDaily ? (
                                    <button onClick={handleClaimDaily} className="bg-cyan-500 hover:bg-cyan-400 text-[#020205] font-black px-4 py-1.5 rounded text-[10px] uppercase tracking-widest shadow-[0_0_10px_rgba(6,182,212,0.8)]">Resgatar</button>
                                ) : (
                                    <span className="text-xl font-black text-cyan-400 drop-shadow-[0_0_8px_rgba(6,182,212,0.8)]">{countdown}</span>
                                )}
                            </div>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
}
