import React, { useState, useEffect, useMemo } from 'react';
import { Target, Hexagon, Trophy, Timer, Skull, Zap, Loader2, ArrowRight, Key, Sparkles, AlertTriangle, Crown, ChevronDown, Globe, ChevronRight, User, Image, Circle, Calendar, BookOpen, EyeOff, X, Shield, Flame, Swords, MessageSquare, Bookmark } from 'lucide-react';
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
    const [activeTab, setActiveTab] = useState("Ranking"); // Começa no Ranking para exibir a tela
    const [synthesizing, setSynthesizing] = useState(false);
    
    // ESTADOS DO RANKING (Real do banco de dados)
    const [allUsers, setAllUsers] = useState([]);
    const [loadingRank, setLoadingRank] = useState(false);
    const [rankCategory, setRankCategory] = useState('Geral'); // Abas do Ranking

    const [isOpeningBoxAnim, setIsOpeningBoxAnim] = useState(false);
    const [boxReward, setBoxReward] = useState(null);

    const [showSacrificeModal, setShowSacrificeModal] = useState(false);
    const [selectedUserId, setSelectedUserId] = useState(null);
    const [countdown, setCountdown] = useState("00:00:00");

    useEffect(() => {
        const updateTimer = () => {
            const now = new Date();
            const tomorrow = new Date(now);
            tomorrow.setHours(24, 0, 0, 0);
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

    // BUSCA REAL DOS DADOS DE RANKING NO FIREBASE
    useEffect(() => {
        if(activeTab !== 'Ranking') return;
        
        const fetchAllProfiles = async () => {
            setLoadingRank(true);
            try {
                const snap = await getDocs(query(collectionGroup(db, 'profile')));
                let usersList = [];
                snap.forEach(doc => {
                    if(doc.ref.path.includes('main')) {
                        usersList.push({ id: doc.ref.parent.parent.id, ...doc.data() });
                    }
                });
                setAllUsers(usersList);
            } catch (e) {
                showToast("Falha ao sincronizar Ranking.", "error");
            } finally {
                setLoadingRank(false);
            }
        };
        fetchAllProfiles();
    }, [activeTab]);

    // ORDENAÇÃO MATEMÁTICA DAS ABAS DO RANKING
    const sortedUsers = useMemo(() => {
        let sorted = [...allUsers];
        switch (rankCategory) {
            case 'Geral':
                sorted.sort((a, b) => (b.level || 0) - (a.level || 0) || (b.xp || 0) - (a.xp || 0));
                break;
            case 'Ativos':
                sorted.sort((a, b) => (b.coins || 0) - (a.coins || 0));
                break;
            case 'Colecionadores':
                sorted.sort((a, b) => (b.inventory?.length || 0) - (a.inventory?.length || 0));
                break;
            case 'Leitores':
                sorted.sort((a, b) => (b.xp || 0) - (a.xp || 0));
                break;
            case 'Comentadores':
                sorted.sort((a, b) => (b.crystals || 0) - (a.crystals || 0));
                break;
            default:
                break;
        }
        return sorted;
    }, [allUsers, rankCategory]);

    const top3 = sortedUsers.slice(0, 3);
    const restOfUsers = sortedUsers.slice(3, 100);

    const getRankBadge = (level) => {
        const lvl = level || 1;
        if (lvl >= 50) return { text: "Rank S", color: "text-purple-400" };
        if (lvl >= 40) return { text: "Rank A+", color: "text-red-400" };
        if (lvl >= 30) return { text: "Rank A", color: "text-blue-400" };
        if (lvl >= 20) return { text: "Rank B", color: "text-green-400" };
        if (lvl >= 10) return { text: "Rank C", color: "text-yellow-400" };
        return { text: "Rank E", color: "text-gray-400" };
    };

    const rankingTabs = [
        { id: 'Geral', title: 'MONARCAS', subtitle: 'Geral', icon: <Flame className="w-4 h-4" /> },
        { id: 'Ativos', title: 'HUNTERS', subtitle: 'Mais ativos', icon: <Swords className="w-4 h-4" /> },
        { id: 'Leitores', title: 'LEITORES', subtitle: 'Mais XP', icon: <BookOpen className="w-4 h-4" /> },
        { id: 'Comentadores', title: 'INTERAÇÃO', subtitle: 'Mais cristais', icon: <MessageSquare className="w-4 h-4" /> },
        { id: 'Colecionadores', title: 'COLEÇÃO', subtitle: 'Mais itens', icon: <Bookmark className="w-4 h-4" /> },
    ];

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
        if ((userProfileData.xp || 0) < 1000) return showToast("XP Insuficiente.", "error");
        setShowSacrificeModal(true);
    };

    const executeBuyBoxWithXP = async () => {
        setShowSacrificeModal(false);
        try {
            let { newXp, newLvl } = removeXpLogic(userProfileData.xp || 0, userProfileData.level || 1, 1000);
            await updateDoc(doc(db, 'artifacts', APP_ID, 'users', user.uid, 'profile', 'main'), {
                xp: newXp, level: newLvl, caixas: increment(1)
            });
            showToast("Você forjou 1 Caixa Nexo.", "success");
        } catch (e) {
            showToast("Falha na conversão.", "error");
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

                    const availableItems = shopItems.filter(i => !newInv.includes(i.id));
                    let possibleItems = availableItems.filter(i => (i.raridade || 'Comum').toLowerCase() === targetRarity.toLowerCase());
                    if (possibleItems.length === 0) possibleItems = availableItems;

                    if (possibleItems.length > 0) {
                        rewardType = 'cosmetic';
                        rewardValue = possibleItems[Math.floor(Math.random() * possibleItems.length)];
                        newInv.push(rewardValue.id);
                    } else {
                        rewardType = 'coins';
                        rewardValue = 2500; 
                        newCoins += rewardValue;
                    }
                } else if (mainRoll < 0.70) {
                    rewardType = 'xp';
                    rewardValue = Math.floor(Math.random() * 500) + 200;
                    const xpLogic = addXpLogic(userProfileData.xp || 0, userProfileData.level || 1, rewardValue);
                    newXp = xpLogic.newXp; newLvl = xpLogic.newLvl; didLevelUp = xpLogic.didLevelUp;
                } else {
                    rewardType = 'coins';
                    rewardValue = Math.floor(Math.random() * 400) + 100;
                    newCoins += rewardValue;
                }

                await updateDoc(doc(db, 'artifacts', APP_ID, 'users', user.uid, 'profile', 'main'), {
                    caixas: increment(-1), coins: newCoins, xp: newXp, level: newLvl, inventory: newInv
                });

                setBoxReward({ type: rewardType, value: rewardValue });
                if (didLevelUp) onLevelUp(newLvl);
            } catch (e) {
                showToast("Erro ao abrir.", "error");
            } finally {
                setIsOpeningBoxAnim(false);
            }
        }, 2500);
    };

    const runSynthesis = async () => {
        if ((userProfileData.crystals || 0) < 5) return showToast("Matéria insuficiente.", "error");
        setSynthesizing(true);
        setTimeout(async () => {
          const res = await synthesizeCrystal(); setSynthesizing(false);
          if (res?.success) showToast(`Sucesso!`, 'success');
          else showToast(`Falha.`, 'error');
        }, 1500);
    };

    const equipped = userProfileData.equipped_items || {};

    return (
        <div className={`pb-24 animate-in fade-in duration-500 relative font-sans min-h-screen text-white overflow-x-hidden ${activeTab === 'Ranking' ? 'bg-[#060014]' : 'bg-[#030014]'}`}>
            
            {/* LUZES DE FUNDO GERAIS */}
            <div className="fixed inset-0 pointer-events-none z-0">
                {activeTab === 'Ranking' ? (
                    <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full max-w-2xl h-[500px] bg-purple-600/20 blur-[150px] rounded-full"></div>
                ) : (
                    <>
                        <div className="absolute top-[-20%] left-[-10%] w-[50vw] h-[50vw] bg-cyan-600/10 blur-[150px] rounded-full mix-blend-screen"></div>
                        <div className="absolute bottom-[-10%] right-[-10%] w-[40vw] h-[40vw] bg-blue-600/10 blur-[120px] rounded-full mix-blend-screen"></div>
                        <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNDAiIGhlaWdodD0iNDAiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+PGNpcmNsZSBjeD0iMSIgY3k9IjEiIHI9IjEiIGZpbGw9InJnYmEoMjU1LDI1NSwyNTUsMC4wMykiLz48L3N2Zz4=')] opacity-50 mix-blend-overlay"></div>
                    </>
                )}
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

            {/* ANIMAÇÃO DA CAIXA */}
            {isOpeningBoxAnim && (
                <div className="fixed inset-0 z-[9999] bg-[#030014]/95 backdrop-blur-md flex flex-col items-center justify-center overflow-hidden">
                    <style>{`
                        .anim-float { animation: float 3s ease-in-out infinite; }
                        .anim-chest-shake { animation: chest-shake 2.2s cubic-bezier(.36,.07,.19,.97) both; }
                        .anim-chest-burst { animation: chest-burst 2.5s ease-out both; }
                        .anim-chest-open { animation: chest-open 2.5s ease-out both; }
                        @keyframes float { 0%, 100% { transform: translateY(0); } 50% { transform: translateY(-15px); } }
                        @keyframes chest-shake { 0% { transform: scale(1); filter: drop-shadow(0 0 10px rgba(6,182,212,0.5)); } 10%, 30%, 50%, 70% { transform: scale(1.1) translate(-6px, 3px) rotate(-6deg); filter: drop-shadow(0 0 30px rgba(6,182,212,0.8)); } 20%, 40%, 60%, 80% { transform: scale(1.1) translate(6px, -3px) rotate(6deg); filter: drop-shadow(0 0 50px rgba(139,92,246,0.9)); } 85% { transform: scale(1.2) rotate(0deg); filter: brightness(1.5) drop-shadow(0 0 100px rgba(6,182,212,1)); opacity: 1; } 90%, 100% { transform: scale(1.5); opacity: 0; } }
                        @keyframes chest-burst { 0%, 82% { opacity: 0; transform: scale(0); } 86% { opacity: 1; transform: scale(1.5); background: radial-gradient(circle, rgba(255,255,255,1) 0%, rgba(6,182,212,0.9) 40%, transparent 70%); } 100% { opacity: 0; transform: scale(4.5); background: radial-gradient(circle, rgba(255,255,255,0) 0%, rgba(6,182,212,0) 40%, transparent 70%); } }
                        @keyframes chest-open { 0%, 85% { opacity: 0; transform: scale(0.5) translateY(30px); filter: brightness(1); } 90% { opacity: 1; transform: scale(1.3) translateY(-15px); filter: brightness(2) drop-shadow(0 0 60px rgba(255,255,255,1)); } 100% { opacity: 1; transform: scale(1.1) translateY(0); filter: brightness(1.2) drop-shadow(0 0 40px rgba(6,182,212,0.8)); } }
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

                {/* --- CONTEÚDO DAS ABAS --- */}

                {/* FORJA */}
                {activeTab === "Forja" && (
                    <div className="animate-in fade-in slide-in-from-bottom-4 duration-500 max-w-lg mx-auto relative z-10 mt-2">
                        <div className="bg-[#0a0a0f]/80 backdrop-blur-2xl border border-cyan-500/30 p-10 rounded-[2.5rem] relative overflow-hidden shadow-[0_20px_50px_rgba(0,0,0,0.5)]">
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
                            </div>
                            <button onClick={runSynthesis} disabled={synthesizing || (userProfileData.crystals || 0) < 5} className="w-full bg-gradient-to-r from-cyan-600 to-blue-600 hover:from-cyan-500 hover:to-blue-500 disabled:opacity-50 disabled:grayscale text-white font-black py-5 rounded-[1.2rem] text-[11px] uppercase tracking-[0.2em] flex items-center justify-center gap-3 transition-all relative z-10 shadow-[0_10px_20px_rgba(6,182,212,0.3)] hover:-translate-y-1 transform-gpu">
                                {synthesizing ? <Loader2 className="w-5 h-5 animate-spin" /> : <>INICIAR SÍNTESE <ArrowRight className="w-4 h-4"/></>}
                            </button>
                        </div>
                    </div>
                )}

                {/* CAIXAS */}
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
                                    <span className="text-lg font-black text-cyan-400 drop-shadow-[0_0_10px_rgba(6,182,212,0.5)] tracking-widest">{countdown}</span>
                                )}
                            </div>
                        </div>
                    </div>
                )}

                {/* NOVO RANKING PREMIUM IGUAL À FOTO */}
                {activeTab === "Ranking" && (
                    <div className="animate-in fade-in slide-in-from-bottom-4 duration-500 max-w-4xl mx-auto pb-10">
                        <div className="text-center mb-8 relative z-10">
                            <Crown className="w-12 h-12 text-purple-500 mx-auto mb-2 drop-shadow-[0_0_15px_rgba(168,85,247,0.6)]" />
                            <h1 className="text-5xl font-black uppercase tracking-widest bg-clip-text text-transparent bg-gradient-to-b from-white to-purple-400 drop-shadow-lg mb-1">
                                RANKING
                            </h1>
                            <p className="text-gray-400 text-xs font-bold uppercase tracking-[0.2em]">Os mais fortes da comunidade.</p>
                        </div>

                        {/* ABAS DO RANKING */}
                        <div className="mb-12 overflow-x-auto no-scrollbar relative z-10">
                            <div className="flex gap-3 w-max mx-auto px-2">
                                {rankingTabs.map(tab => (
                                    <button 
                                        key={tab.id}
                                        onClick={() => setRankCategory(tab.id)}
                                        className={`flex flex-col items-center justify-center px-6 py-3 rounded-2xl border transition-all min-w-[120px]
                                        ${rankCategory === tab.id 
                                            ? 'bg-gradient-to-b from-purple-600/40 to-indigo-900/40 border-purple-400 shadow-[0_0_20px_rgba(168,85,247,0.3)]' 
                                            : 'bg-[#0f0524]/60 border-white/5 hover:border-white/20'}`}
                                    >
                                        <div className={`${rankCategory === tab.id ? 'text-white' : 'text-gray-500'} mb-1`}>{tab.icon}</div>
                                        <span className={`text-[10px] font-black uppercase tracking-widest ${rankCategory === tab.id ? 'text-white' : 'text-gray-400'}`}>{tab.title}</span>
                                        <span className="text-[8px] text-gray-500 font-bold uppercase tracking-widest">{tab.subtitle}</span>
                                    </button>
                                ))}
                            </div>
                        </div>

                        {loadingRank ? (
                            <div className="flex flex-col items-center justify-center py-20 relative z-10">
                                <Loader2 className="w-12 h-12 text-purple-500 animate-spin mb-4" />
                                <p className="text-purple-400 font-black tracking-widest text-xs uppercase animate-pulse">Calculando Ranks...</p>
                            </div>
                        ) : (
                            <>
                                {/* PÓDIO TOP 3 */}
                                {top3.length > 0 && (
                                    <div className="flex items-end justify-center gap-2 md:gap-6 mb-12 relative z-10 mt-16 px-2">
                                        
                                        {/* 2º LUGAR */}
                                        {top3[1] && (
                                            <div onClick={() => setSelectedUserId(top3[1].id)} className="w-[30%] max-w-[140px] flex flex-col items-center order-1 cursor-pointer group transform hover:-translate-y-2 transition-transform duration-300">
                                                <div className="relative w-full aspect-square rounded-[2rem] p-1 bg-gradient-to-b from-blue-400 to-transparent shadow-[0_0_30px_rgba(96,165,250,0.3)] mb-4">
                                                    <div className="absolute -top-5 left-1/2 -translate-x-1/2 w-8 h-8 bg-blue-500 text-white font-black text-sm rounded-lg flex items-center justify-center border-2 border-[#060014] z-20">2</div>
                                                    <img src={cleanCosmeticUrl(top3[1].equipped_items?.avatar?.preview) || top3[1].avatarUrl || 'https://placehold.co/150/0f0524/60a5fa?text=2'} className="w-full h-full object-cover rounded-[1.8rem] bg-[#0f0524]" />
                                                </div>
                                                <h3 className="font-black text-sm truncate w-full text-center text-white">{top3[1].name || top3[1].displayName || 'Anônimo'}</h3>
                                                <div className="px-2 py-0.5 rounded bg-blue-500/20 text-blue-400 text-[8px] font-black uppercase tracking-widest mt-1 mb-2">NV. {top3[1].level || 1}</div>
                                                <div className="flex items-center gap-1 font-black text-white text-sm"><Flame className="w-3 h-3 text-blue-400"/> {top3[1].xp || 0}</div>
                                            </div>
                                        )}

                                        {/* 1º LUGAR */}
                                        {top3[0] && (
                                            <div onClick={() => setSelectedUserId(top3[0].id)} className="w-[36%] max-w-[170px] flex flex-col items-center order-2 -translate-y-8 cursor-pointer group transform hover:-translate-y-2 transition-transform duration-300">
                                                <div className="relative w-full aspect-square rounded-[2.5rem] p-1 bg-gradient-to-b from-yellow-400 via-yellow-600 to-transparent shadow-[0_0_40px_rgba(250,204,21,0.4)] mb-4 z-10">
                                                    <div className="absolute -top-7 left-1/2 -translate-x-1/2 w-12 h-12 bg-gradient-to-b from-yellow-300 to-yellow-600 text-white font-black text-xl rounded-xl flex items-center justify-center border-4 border-[#060014] z-20 shadow-lg">1</div>
                                                    <img src={cleanCosmeticUrl(top3[0].equipped_items?.avatar?.preview) || top3[0].avatarUrl || 'https://placehold.co/200/0f0524/facc15?text=1'} className="w-full h-full object-cover rounded-[2.3rem] bg-[#0f0524]" />
                                                </div>
                                                <h3 className="font-black text-lg truncate w-full text-center text-yellow-400 drop-shadow-md">{top3[0].name || top3[0].displayName || 'Anônimo'}</h3>
                                                <div className="px-3 py-1 rounded-md bg-yellow-500/20 border border-yellow-500/30 text-yellow-400 text-[9px] font-black uppercase tracking-widest mt-1 mb-2">NV. {top3[0].level || 1}</div>
                                                <div className="flex items-center gap-1.5 font-black text-white text-lg"><Flame className="w-4 h-4 text-yellow-500"/> {top3[0].xp || 0}</div>
                                            </div>
                                        )}

                                        {/* 3º LUGAR */}
                                        {top3[2] && (
                                            <div onClick={() => setSelectedUserId(top3[2].id)} className="w-[30%] max-w-[140px] flex flex-col items-center order-3 cursor-pointer group transform hover:-translate-y-2 transition-transform duration-300">
                                                <div className="relative w-full aspect-square rounded-[2rem] p-1 bg-gradient-to-b from-purple-500 to-transparent shadow-[0_0_30px_rgba(168,85,247,0.3)] mb-4">
                                                    <div className="absolute -top-5 left-1/2 -translate-x-1/2 w-8 h-8 bg-purple-500 text-white font-black text-sm rounded-lg flex items-center justify-center border-2 border-[#060014] z-20">3</div>
                                                    <img src={cleanCosmeticUrl(top3[2].equipped_items?.avatar?.preview) || top3[2].avatarUrl || 'https://placehold.co/150/0f0524/a855f7?text=3'} className="w-full h-full object-cover rounded-[1.8rem] bg-[#0f0524]" />
                                                </div>
                                                <h3 className="font-black text-sm truncate w-full text-center text-white">{top3[2].name || top3[2].displayName || 'Anônimo'}</h3>
                                                <div className="px-2 py-0.5 rounded bg-purple-500/20 text-purple-400 text-[8px] font-black uppercase tracking-widest mt-1 mb-2">NV. {top3[2].level || 1}</div>
                                                <div className="flex items-center gap-1 font-black text-white text-sm"><Flame className="w-3 h-3 text-purple-500"/> {top3[2].xp || 0}</div>
                                            </div>
                                        )}
                                    </div>
                                )}

                                {/* LISTA TOP 100 */}
                                <div className="max-w-4xl mx-auto relative z-10">
                                    <div className="flex items-center justify-between mb-4 px-2">
                                        <h3 className="font-black text-xs text-purple-400 uppercase tracking-[0.2em] flex items-center gap-2">TOP 100 <Flame className="w-3 h-3" /></h3>
                                        <div className="flex items-center gap-1.5 text-[9px] font-black text-gray-500 uppercase tracking-widest">
                                            Tempo real <div className="w-1.5 h-1.5 bg-green-500 rounded-full animate-pulse"></div>
                                        </div>
                                    </div>

                                    <div className="flex flex-col gap-2">
                                        {restOfUsers.length === 0 && top3.length === 0 && (
                                            <p className="text-center text-gray-500 font-black text-xs py-10 uppercase tracking-widest">Nenhum registro no momento.</p>
                                        )}
                                        
                                        {restOfUsers.map((player, index) => {
                                            const rankPosition = index + 4;
                                            const badge = getRankBadge(player.level);

                                            return (
                                                <div key={player.id} onClick={() => setSelectedUserId(player.id)} className="bg-[#0f0524]/60 border border-white/5 rounded-2xl p-4 flex items-center gap-4 hover:bg-[#1a0b3b] transition-colors cursor-pointer group">
                                                    <div className="w-6 font-black text-gray-400 text-lg text-center group-hover:text-purple-400 transition-colors">{rankPosition}</div>
                                                    
                                                    <div className="w-12 h-12 rounded-full bg-black border border-white/10 overflow-hidden flex-shrink-0 group-hover:border-purple-500 transition-colors">
                                                        <img src={cleanCosmeticUrl(player.equipped_items?.avatar?.preview) || player.avatarUrl || `https://placehold.co/100/0f0524/ffffff?text=${rankPosition}`} className="w-full h-full object-cover" />
                                                    </div>
                                                    
                                                    <div className="flex-1 min-w-0">
                                                        <h4 className="font-black text-sm text-white truncate group-hover:text-white">{player.name || player.displayName || 'Leitor Anônimo'}</h4>
                                                        <p className="text-[10px] text-gray-500 font-bold uppercase tracking-widest truncate mt-0.5">{player.bio || 'Explorando obras'}</p>
                                                    </div>

                                                    <div className="flex flex-col items-end gap-1 flex-shrink-0">
                                                        <div className={`text-[10px] font-black uppercase tracking-widest flex items-center gap-1 ${badge.color}`}>
                                                            <Crown className="w-3 h-3" /> {badge.text}
                                                        </div>
                                                        <div className="font-black text-white flex items-center gap-1.5">
                                                            <Flame className="w-3.5 h-3.5 text-purple-500" /> {player.xp || 0}
                                                        </div>
                                                    </div>
                                                </div>
                                            );
                                        })}
                                    </div>
                                </div>
                            </>
                        )}
                    </div>
                )}

            </div>
        </div>
    );
}
