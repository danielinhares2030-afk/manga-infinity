import React, { useState, useEffect } from 'react';
import { Target, Hexagon, Trophy, Timer, Skull, Zap, Loader2, ArrowRight, Key, Sparkles, AlertTriangle, Crown, ChevronDown, Globe, ChevronRight, User, Image, Circle, Calendar, BookOpen, EyeOff, X } from 'lucide-react';
import { doc, updateDoc, collectionGroup, getDocs, query, increment, getDoc } from "firebase/firestore";
import { auth, db } from './firebase';
import { addXpLogic, removeXpLogic, getLevelTitle, cleanCosmeticUrl } from './helpers';
import { APP_ID } from './constants';

const CHEST_CLOSED = "https://i.ibb.co/1Y3D0wTp/file-0000000025a071f59ae3ef7fa83b5dab.png";
const CHEST_OPEN = "https://i.ibb.co/Rp3Djn30/file-0000000040c471f59ff80244c4b7c2b7-removebg-preview.png";

// COMPONENTE: Cartão de Perfil Público 
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
                        {/* Banner Público */}
                        <div className="h-32 w-full bg-blue-950/30 relative border-b border-cyan-900/30">
                            {data.coverUrl ? <img src={cleanCosmeticUrl(data.coverUrl)} className="w-full h-full object-cover opacity-50 mix-blend-screen" /> : <div className="w-full h-full bg-[url('https://www.transparenttextures.com/patterns/stardust.png')] opacity-20"></div>}
                            <div className="absolute inset-0 bg-gradient-to-t from-[#05050a] via-transparent to-transparent"></div>
                            <button onClick={onClose} className="absolute top-4 right-4 bg-black/50 p-2 rounded-full text-white hover:text-cyan-400 hover:bg-black transition-colors backdrop-blur-md"><X className="w-4 h-4"/></button>
                        </div>
                        {/* Avatar Público */}
                        <div className="relative -mt-16 flex justify-center">
                            <div className="w-28 h-28 rounded-full border-[3px] border-[#05050a] bg-[#0a0a16] relative flex items-center justify-center shadow-[0_0_20px_rgba(6,182,212,0.3)]">
                                <img src={cleanCosmeticUrl(data.equipped_items?.avatar?.preview) || data.avatarUrl || 'https://placehold.co/150x150/020205/0ea5e9?text=N'} className="w-full h-full object-cover rounded-full" />
                                {data.equipped_items?.moldura?.preview && <img src={cleanCosmeticUrl(data.equipped_items.moldura.preview)} className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[140%] h-[140%] max-w-none object-contain pointer-events-none" style={{mixBlendMode: 'screen'}} />}
                            </div>
                        </div>
                        {/* Info Pública */}
                        <div className="text-center mt-4 px-6">
                            <h3 className="text-2xl font-black text-white uppercase tracking-tight">{data.name || 'Leitor Anônimo'}</h3>
                            <div className="inline-flex items-center gap-2 mt-2 bg-blue-950/30 border border-cyan-900/50 px-4 py-1.5 rounded-full">
                                <Sparkles className="w-3 h-3 text-cyan-400" />
                                <span className="text-cyan-400 text-[10px] font-black uppercase tracking-widest">Nível {data.level || 1} • {getLevelTitle(data.level || 1)}</span>
                            </div>
                            <p className="text-gray-400 text-xs italic mt-5 leading-relaxed font-medium line-clamp-3">"{data.bio || 'Explorando o universo dos mangás.'}"</p>
                        </div>
                        {/* Atributos Públicos */}
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
    const [activeTab, setActiveTab] = useState("Caixas");
    const [synthesizing, setSynthesizing] = useState(false);
    const [rankingList, setRankingList] = useState([]);
    const [loadingRank, setLoadingRank] = useState(false);
    
    const [isOpeningBoxAnim, setIsOpeningBoxAnim] = useState(false);
    const [boxReward, setBoxReward] = useState(null);

    // ESTADOS DOS MODAIS CUSTOMIZADOS
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

                const roll = Math.random();
                
                if (roll < 0.15) {
                    const availableItems = shopItems.filter(i => !newInv.includes(i.id));
                    if (availableItems.length > 0) {
                        rewardType = 'cosmetic';
                        const randomItem = availableItems[Math.floor(Math.random() * availableItems.length)];
                        rewardValue = randomItem;
                        newInv.push(randomItem.id);
                    } else {
                        rewardType = 'coins';
                        rewardValue = 1000;
                        newCoins += rewardValue;
                    }
                } else if (roll < 0.45) {
                    rewardType = 'xp';
                    rewardValue = Math.floor(Math.random() * 500) + 150; 
                    const xpLogic = addXpLogic(userProfileData.xp || 0, userProfileData.level || 1, rewardValue);
                    newXp = xpLogic.newXp;
                    newLvl = xpLogic.newLvl;
                    didLevelUp = xpLogic.didLevelUp;
                } else {
                    rewardType = 'coins';
                    rewardValue = Math.floor(Math.random() * 300) + 50; 
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
                showToast("Erro ao abrir a caixa.", "error");
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
        <div className={`pb-24 animate-in fade-in duration-500 relative font-sans min-h-screen text-gray-200 ${equipped.tema_perfil ? equipped.tema_perfil.cssClass : 'bg-[#020205]'}`}>
            
            {/* MODAL CUSTOMIZADO: CONVERSÃO DE XP */}
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

            {/* MODAL: PERFIL PÚBLICO */}
            {selectedUserId && <PublicProfileModal userId={selectedUserId} onClose={() => setSelectedUserId(null)} currentUserId={user?.uid} />}

            {isOpeningBoxAnim && (
                <div className="fixed inset-0 z-[9999] bg-[#000000] flex flex-col items-center justify-center overflow-hidden">
                    <style>{`
                        .anim-chest-shake { animation: chest-shake 2.2s cubic-bezier(.36,.07,.19,.97) both; }
                        .anim-chest-burst { animation: chest-burst 2.5s ease-out both; }
                        .anim-chest-open { animation: chest-open 2.5s ease-out both; }
                        .anim-rays { animation: spin-rays 8s linear infinite; }
                        .text-hide-after { animation: fade-out 2.5s forwards; }
                        .text-show-after { animation: fade-in-late 2.5s forwards; }
                        
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
                        @keyframes spin-rays { 0% { transform: rotate(0deg); } 100% { transform: rotate(360deg); } }
                        @keyframes fade-out { 0%, 80% { opacity: 1; } 85%, 100% { opacity: 0; } }
                        @keyframes fade-in-late { 0%, 85% { opacity: 0; transform: translateY(20px); } 90%, 100% { opacity: 1; transform: translateY(0); } }
                    `}</style>
                    <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,rgba(6,182,212,0.2)_0%,transparent_70%)] text-hide-after pointer-events-none"></div>
                    <div className="absolute inset-0 flex items-center justify-center opacity-0 anim-chest-open pointer-events-none">
                        <div className="w-[150vw] h-[150vw] anim-rays" style={{ background: 'conic-gradient(from 0deg, transparent 0deg, rgba(6,182,212,0.3) 10deg, transparent 20deg, transparent 40deg, rgba(6,182,212,0.3) 50deg, transparent 60deg, transparent 80deg, rgba(139,92,246,0.3) 90deg, transparent 100deg, transparent 120deg, rgba(139,92,246,0.3) 130deg, transparent 140deg, transparent 160deg, rgba(6,182,212,0.3) 170deg, transparent 180deg, transparent 200deg, rgba(6,182,212,0.3) 210deg, transparent 220deg, transparent 240deg, rgba(139,92,246,0.3) 250deg, transparent 260deg, transparent 280deg, rgba(139,92,246,0.3) 290deg, transparent 300deg, transparent 320deg, rgba(6,182,212,0.3) 330deg, transparent 340deg, transparent 360deg)' }}></div>
                    </div>
                    <div className="absolute w-96 h-96 rounded-full anim-chest-burst z-10 pointer-events-none"></div>
                    <div className="absolute inset-0 flex flex-col items-center justify-center anim-chest-shake z-20 pointer-events-none">
                        <img src={CHEST_CLOSED} loading="eager" fetchPriority="high" className="w-36 h-36 md:w-48 md:h-48 object-contain drop-shadow-[0_0_15px_rgba(6,182,212,0.5)] flex-shrink-0" alt="Chest Closed" />
                    </div>
                    <div className="absolute inset-0 flex flex-col items-center justify-center anim-chest-open z-30 pointer-events-none">
                        <img src={CHEST_OPEN} loading="eager" fetchPriority="high" className="w-56 h-56 md:w-72 md:h-72 object-contain mix-blend-screen flex-shrink-0" alt="Chest Opened" />
                    </div>
                    <div className="absolute bottom-1/4 left-0 w-full flex justify-center z-40 pointer-events-none">
                        <h2 className="text-2xl md:text-3xl font-black text-white uppercase tracking-[0.4em] drop-shadow-[0_0_10px_rgba(6,182,212,0.8)] text-hide-after absolute">Desbloqueando...</h2>
                        <h2 className="text-3xl md:text-4xl font-black text-cyan-400 uppercase tracking-[0.5em] drop-shadow-[0_0_20px_rgba(6,182,212,1)] text-show-after absolute">Processando!</h2>
                    </div>
                </div>
            )}

            {boxReward && (
                <div className="fixed inset-0 z-[9999] bg-black/90 backdrop-blur-md flex flex-col items-center justify-center p-4 animate-in zoom-in-95 duration-300">
                    <div className="bg-[#0a0a16] border border-cyan-500/50 rounded-2xl p-8 max-w-md w-full text-center shadow-[0_0_50px_rgba(6,182,212,0.3)] relative overflow-hidden">
                        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,rgba(6,182,212,0.2),transparent_70%)] pointer-events-none"></div>
                        <h3 className="text-2xl font-black text-white uppercase tracking-widest mb-6 relative z-10">Recompensa Adquirida!</h3>
                        <div className="flex justify-center mb-6 relative z-10">
                            {boxReward.type === 'coins' && <div className="w-24 h-24 rounded-full bg-amber-950/40 border-2 border-amber-500 flex items-center justify-center shadow-[0_0_20px_rgba(245,158,11,0.4)] flex-shrink-0"><div className="w-10 h-10 bg-amber-500 rotate-45 shadow-lg"></div></div>}
                            {boxReward.type === 'xp' && <div className="w-24 h-24 rounded-full bg-blue-950/40 border-2 border-cyan-500 flex items-center justify-center shadow-[0_0_20px_rgba(6,182,212,0.4)] flex-shrink-0"><Zap className="w-12 h-12 text-cyan-400 drop-shadow-lg"/></div>}
                            {boxReward.type === 'cosmetic' && (
                                <div className="w-24 h-24 rounded-full bg-[#05050a] border-2 border-cyan-500 overflow-hidden flex items-center justify-center shadow-[0_0_20px_rgba(6,182,212,0.4)] relative p-2 flex-shrink-0">
                                    {cleanCosmeticUrl(boxReward.value.preview) ? <img src={cleanCosmeticUrl(boxReward.value.preview)} className="w-full h-full object-cover rounded-full flex-shrink-0" /> : <img src={CHEST_OPEN} className="w-16 h-16 object-contain flex-shrink-0" alt="Reward" />}
                                </div>
                            )}
                        </div>
                        <h4 className="text-lg font-black text-white uppercase relative z-10">
                            {boxReward.type === 'coins' && `+${boxReward.value} Moedas`}
                            {boxReward.type === 'xp' && `+${boxReward.value} XP`}
                            {boxReward.type === 'cosmetic' && boxReward.value.nome}
                        </h4>
                        {boxReward.type === 'cosmetic' && <p className="text-cyan-400 text-[10px] font-black uppercase tracking-widest mt-1 relative z-10">Item Visual Adquirido</p>}
                        <button onClick={() => setBoxReward(null)} className="mt-8 bg-cyan-600 hover:bg-cyan-500 text-white font-black w-full py-3 rounded-xl text-xs uppercase tracking-widest transition-colors relative z-10 shadow-lg">Confirmar Recebimento</button>
                    </div>
                </div>
            )}

            {!equipped.tema_perfil && (
                <div className="absolute inset-0 z-0">
                    <div className="absolute inset-0 bg-[linear-gradient(to_right,#0ea5e910_1px,transparent_1px),linear-gradient(to_bottom,#0ea5e910_1px,transparent_1px)] bg-[size:40px_40px]"></div>
                    <div className="absolute inset-0 bg-[radial-gradient(circle_800px_at_50%_-30%,#0ea5e915,transparent)]"></div>
                </div>
            )}

            <div className="max-w-6xl mx-auto px-4 py-8 relative z-10">
                <div className="flex md:justify-center gap-4 mb-12 overflow-x-auto no-scrollbar snap-x w-full px-2">
                    {['Caixas', 'Forja', 'Ranking'].map((tab) => (
                        <button key={tab} onClick={() => setActiveTab(tab)} className={`relative px-8 py-3 font-black text-[10px] uppercase tracking-[0.3em] transition-all transform skew-x-[-15deg] group border-b-2
                            ${activeTab === tab ? 'bg-cyan-600/10 border-cyan-500 text-white' : 'bg-transparent border-transparent text-gray-500 hover:text-cyan-400'}`}>
                            <div className="skew-x-[15deg] flex items-center gap-2">
                                {tab === "Caixas" && <img src={CHEST_CLOSED} loading="eager" fetchPriority="high" className="w-4 h-4 object-contain opacity-80 flex-shrink-0" alt="Chest Icon" />}
                                {tab === "Forja" && <Hexagon className="w-3.5 h-3.5"/>}
                                {tab === "Ranking" && <Trophy className="w-3.5 h-3.5"/>}
                                {tab}
                            </div>
                        </button>
                    ))}
                </div>

                {activeTab === "Caixas" && (
                    <div className="animate-in fade-in duration-300 max-w-4xl mx-auto pb-10">
                        <div className="relative border border-cyan-500/50 rounded-2xl p-6 md:p-10 mb-8 overflow-hidden bg-[#020205] shadow-lg">
                            <div className="absolute inset-0 opacity-30 mix-blend-overlay bg-cover bg-center" style={{ backgroundImage: "url('https://i.ibb.co/mrYd0BzW/file-0000000007e471f5939a825f3eab6db6.png')" }}></div>
                            <div className="absolute inset-0 bg-gradient-to-r from-black via-black/80 to-transparent"></div>
                            <div className="relative z-10">
                                <h2 className="text-4xl md:text-5xl font-black text-white uppercase tracking-tighter leading-none">CAIXAS <span className="text-cyan-500">NEXO</span></h2>
                                <p className="text-[10px] text-gray-400 font-bold uppercase tracking-[0.2em] mt-3 mb-6 max-w-md">Abra as caixas para adquirir Moedas, XP ou itens cosméticos para seu perfil.</p>
                            </div>
                        </div>

                        <div className="grid md:grid-cols-2 gap-6">
                            <div className="bg-[#05050a] border border-white/5 rounded-2xl p-8 flex flex-col items-center justify-center relative overflow-hidden shadow-lg group hover:border-cyan-500/50 transition-colors">
                                <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,rgba(6,182,212,0.1),transparent_70%)] pointer-events-none"></div>
                                <img src={CHEST_CLOSED} loading="eager" fetchPriority="high" className="w-28 h-28 mb-6 relative z-10 group-hover:scale-110 transition-transform duration-500 drop-shadow-[0_0_20px_rgba(6,182,212,0.4)] flex-shrink-0" alt="Chest" />
                                <h3 className="text-4xl font-black text-white relative z-10 leading-none">{userProfileData.caixas || 0}</h3>
                                <p className="text-[10px] text-gray-500 font-black uppercase tracking-widest relative z-10 mb-6 mt-1">Caixas Disponíveis</p>
                                <button onClick={handleOpenBox} disabled={(userProfileData.caixas || 0) < 1 || isOpeningBoxAnim} className="w-full bg-cyan-600 disabled:bg-[#0a0a16] disabled:border disabled:border-white/5 disabled:text-gray-600 hover:bg-cyan-500 text-white font-black py-4 rounded-xl text-xs uppercase tracking-widest transition-all relative z-10 shadow-[0_0_20px_rgba(6,182,212,0.4)] disabled:shadow-none">Abrir Caixa</button>
                            </div>

                            <div className="flex flex-col gap-6">
                                <div className="bg-[#05050a] border border-white/5 rounded-2xl p-6 flex flex-col justify-center relative overflow-hidden shadow-lg">
                                    <h4 className="text-sm font-black text-white uppercase tracking-widest mb-2 flex items-center gap-2"><Calendar className="w-4 h-4 text-cyan-400"/> Recompensa Diária</h4>
                                    <p className="text-xs text-gray-400 font-medium mb-4 leading-relaxed">Acesse o sistema todos os dias para receber 1 Caixa Nexo gratuitamente.</p>
                                    {canClaimDaily ? (
                                        <button onClick={handleClaimDaily} className="bg-transparent border border-cyan-500 text-cyan-400 hover:bg-cyan-600 hover:text-white font-black py-3 rounded-xl text-[10px] uppercase tracking-widest transition-all">Resgatar Caixa</button>
                                    ) : (
                                        <button disabled className="bg-[#0a0a16] border border-white/5 text-gray-600 font-black py-3 rounded-xl text-[10px] uppercase tracking-widest cursor-not-allowed">Já Resgatado Hoje</button>
                                    )}
                                </div>

                                <div className="bg-[#05050a] border border-white/5 rounded-2xl p-6 flex flex-col justify-center relative overflow-hidden shadow-lg flex-1">
                                    <h4 className="text-sm font-black text-white uppercase tracking-widest mb-2 flex items-center gap-2"><Zap className="w-4 h-4 text-cyan-400"/> Conversão de XP</h4>
                                    <p className="text-xs text-gray-400 font-medium mb-4 leading-relaxed">Converta 1000 XP em uma Caixa Nexo. <br/>Atenção: Seu nível irá cair.</p>
                                    <button onClick={handleBuyBoxWithXPClick} disabled={(userProfileData.xp || 0) < 1000} className="bg-transparent border border-blue-900 text-cyan-500 hover:bg-blue-900 hover:text-white disabled:border-white/5 disabled:text-gray-600 disabled:hover:bg-transparent disabled:cursor-not-allowed font-black py-3 rounded-xl text-[10px] uppercase tracking-widest transition-all">Converter 1000 XP</button>
                                </div>
                            </div>
                        </div>
                    </div>
                )}

                {activeTab === "Forja" && (
                    <div className="animate-in fade-in duration-300 max-w-2xl mx-auto mt-4 relative z-10">
                        <div className="bg-[#05050a] border border-cyan-500/30 p-10 md:p-14 text-center relative overflow-hidden shadow-[0_0_50px_rgba(6,182,212,0.15)] rounded-tl-3xl rounded-br-3xl">
                            <div className="absolute inset-0 flex items-center justify-center opacity-10 pointer-events-none">
                                <div className="w-80 h-80 border border-cyan-500 rounded-full animate-[spin_20s_linear_infinite]"></div>
                                <div className="absolute w-80 h-80 border border-cyan-500 rounded-full animate-[spin_20s_linear_infinite_reverse] rotate-45 border-dashed"></div>
                                <Hexagon className="absolute w-64 h-64 text-cyan-500 animate-pulse" strokeWidth={0.5} />
                            </div>
                            <Zap className="w-16 h-16 mx-auto mb-6 text-cyan-400 animate-pulse relative z-10 drop-shadow-[0_0_20px_rgba(6,182,212,0.8)]" />
                            <h2 className="text-4xl md:text-5xl font-black text-white mb-2 relative z-10 uppercase tracking-tighter">Reator <span className="text-cyan-500">Nexo</span></h2>
                            <p className="text-gray-400 text-[10px] md:text-xs mb-10 uppercase tracking-[0.2em] font-bold relative z-10">Transmute <b className="text-blue-400">5 Cristais</b> em poder bruto. <span className="text-cyan-500">40% de chance de falha no processo.</span></p>
                            <div className="bg-[#0a0a16] border border-blue-500/20 p-6 mb-10 relative z-10 max-w-xs mx-auto flex flex-col items-center justify-center gap-2 shadow-[inset_0_0_20px_rgba(59,130,246,0.1)]">
                                <span className="text-[9px] uppercase font-black text-blue-500/70 tracking-[0.3em]">Carga Atual</span>
                                <div className="text-5xl font-black text-white flex items-center gap-4">{userProfileData.crystals || 0} <Hexagon className="w-10 h-10 text-blue-500 drop-shadow-[0_0_15px_rgba(59,130,246,0.8)]" /></div>
                            </div>
                            <button onClick={runSynthesis} disabled={synthesizing || (userProfileData.crystals || 0) < 5} className="w-full bg-cyan-600 text-white hover:bg-cyan-500 disabled:bg-[#0a0a16] disabled:border border-white/5 disabled:text-gray-600 font-black py-5 transition-all duration-300 relative z-10 text-xs uppercase tracking-widest flex items-center justify-center gap-3 shadow-[0_0_20px_rgba(6,182,212,0.4)] disabled:shadow-none transform skew-x-[-10deg]">
                                <div className="skew-x-[10deg] flex items-center gap-2">{synthesizing ? <><Loader2 className="w-5 h-5 animate-spin" /> Processando Dados...</> : 'Iniciar Transmutação'}</div>
                            </button>
                        </div>
                    </div>
                )}

                {activeTab === "Ranking" && (
                    <div className="animate-in fade-in duration-300 max-w-4xl mx-auto pb-10">
                        <div className="flex justify-between items-end mb-10 border-b border-cyan-900/30 pb-4">
                            <div>
                                <h2 className="text-3xl md:text-4xl font-black text-white uppercase tracking-tighter flex items-center gap-3"><span className="text-cyan-500"><Trophy className="w-8 h-8 fill-current" /></span>RANKING GLOBAL</h2>
                                <p className="text-xs text-gray-400 mt-1 font-medium">Mostre sua dedicação. Suba no ranking do sistema.</p>
                            </div>
                            <button className="hidden sm:flex items-center gap-2 bg-transparent border border-white/20 text-white px-4 py-2 rounded-lg text-xs font-black uppercase tracking-widest hover:bg-white/5 transition-colors"><Globe className="w-4 h-4" /> Global <ChevronDown className="w-4 h-4 ml-2" /></button>
                        </div>

                        {loadingRank ? (
                            <div className="flex justify-center py-20"><Loader2 className="w-10 h-10 text-cyan-500 animate-spin"/></div>
                        ) : (
                            <>
                                <div className="flex justify-center items-end gap-2 md:gap-4 mb-10 mt-8">
                                    {rankingList[1] && (
                                        <div onClick={() => setSelectedUserId(rankingList[1].id)} className="w-[30%] max-w-[160px] bg-gradient-to-b from-[#1a1a1a] to-[#05050a] rounded-t-2xl border-t-[3px] border-gray-400 p-4 relative flex flex-col items-center shadow-[0_-10px_30px_rgba(156,163,175,0.15)] order-1 cursor-pointer hover:border-white transition-colors group">
                                            <Crown className="absolute -top-6 w-8 h-8 text-gray-300 drop-shadow-[0_0_10px_rgba(209,213,219,0.8)]" />
                                            <div className="absolute top-2 left-2 text-xl font-black text-gray-300">2</div>
                                            <div className="w-16 h-16 rounded-full border-2 border-gray-400 overflow-hidden mb-3 mt-4 group-hover:shadow-[0_0_15px_rgba(255,255,255,0.4)] transition-shadow">
                                                <img src={cleanCosmeticUrl(rankingList[1].avatarUrl) || 'https://placehold.co/100x100/020205/0ea5e9?text=N'} className="w-full h-full object-cover" />
                                            </div>
                                            <h4 className="font-black text-xs text-white uppercase truncate w-full text-center group-hover:text-cyan-400">{rankingList[1].displayName || "Oculto"}</h4>
                                            <p className="text-[8px] text-cyan-500 font-black uppercase mt-1">{getLevelTitle(rankingList[1].level)}</p>
                                            <div className="mt-3 bg-transparent border border-gray-500 text-gray-300 px-3 py-1 rounded-full text-[9px] font-black">NV. {rankingList[1].level}</div>
                                            <div className="w-full h-1.5 bg-gray-800 rounded-full mt-4 overflow-hidden"><div className="h-full bg-gradient-to-r from-gray-500 to-gray-300 w-[60%]"></div></div>
                                            <div className="text-[8px] text-gray-500 font-bold mt-1">{rankingList[1].xp} / {(rankingList[1].level || 1) * 100} XP</div>
                                        </div>
                                    )}
                                    {rankingList[0] && (
                                        <div onClick={() => setSelectedUserId(rankingList[0].id)} className="w-[35%] max-w-[190px] bg-gradient-to-b from-[#1a2035] to-[#05050a] rounded-t-2xl border-t-[4px] border-yellow-500 p-5 relative flex flex-col items-center shadow-[0_-15px_40px_rgba(234,179,8,0.25)] order-2 z-10 transform scale-110 mb-2 cursor-pointer hover:border-yellow-300 transition-colors group">
                                            <Crown className="absolute -top-8 w-10 h-10 text-yellow-400 fill-yellow-400 drop-shadow-[0_0_15px_rgba(250,204,21,1)]" />
                                            <div className="absolute top-2 left-3 text-2xl font-black text-yellow-500">1</div>
                                            <div className="w-20 h-20 rounded-full border-[3px] border-yellow-500 overflow-hidden mb-3 mt-4 shadow-[0_0_20px_rgba(234,179,8,0.4)] group-hover:shadow-[0_0_25px_rgba(250,204,21,0.6)] transition-shadow">
                                                <img src={cleanCosmeticUrl(rankingList[0].avatarUrl) || 'https://placehold.co/100x100/020205/0ea5e9?text=N'} className="w-full h-full object-cover" />
                                            </div>
                                            <h4 className="font-black text-sm text-white uppercase truncate w-full text-center group-hover:text-yellow-400">{rankingList[0].displayName || "Oculto"}</h4>
                                            <p className="text-[9px] text-cyan-400 font-black uppercase mt-1">{getLevelTitle(rankingList[0].level)}</p>
                                            <div className="mt-3 bg-transparent border border-yellow-600 text-yellow-500 px-4 py-1 rounded-full text-[10px] font-black shadow-[0_0_10px_rgba(234,179,8,0.2)]">NV. {rankingList[0].level}</div>
                                            <div className="w-full h-2 bg-gray-900 rounded-full mt-5 overflow-hidden border border-yellow-900/50"><div className="h-full bg-gradient-to-r from-yellow-600 to-yellow-400 shadow-[0_0_10px_rgba(250,204,21,0.8)] w-[80%]"></div></div>
                                            <div className="text-[9px] text-yellow-600 font-bold mt-1.5">{rankingList[0].xp} / {(rankingList[0].level || 1) * 100} XP</div>
                                        </div>
                                    )}
                                    {rankingList[2] && (
                                        <div onClick={() => setSelectedUserId(rankingList[2].id)} className="w-[30%] max-w-[160px] bg-gradient-to-b from-[#2a1b15] to-[#05050a] rounded-t-2xl border-t-[3px] border-amber-700 p-4 relative flex flex-col items-center shadow-[0_-10px_30px_rgba(180,83,9,0.15)] order-3 cursor-pointer hover:border-amber-400 transition-colors group">
                                            <Crown className="absolute -top-6 w-8 h-8 text-amber-600 drop-shadow-[0_0_10px_rgba(217,119,6,0.8)]" />
                                            <div className="absolute top-2 left-2 text-xl font-black text-amber-700">3</div>
                                            <div className="w-16 h-16 rounded-full border-2 border-amber-700 overflow-hidden mb-3 mt-4 group-hover:shadow-[0_0_15px_rgba(245,158,11,0.4)] transition-shadow">
                                                <img src={cleanCosmeticUrl(rankingList[2].avatarUrl) || 'https://placehold.co/100x100/020205/0ea5e9?text=N'} className="w-full h-full object-cover" />
                                            </div>
                                            <h4 className="font-black text-xs text-white uppercase truncate w-full text-center group-hover:text-amber-500">{rankingList[2].displayName || "Oculto"}</h4>
                                            <p className="text-[8px] text-cyan-500 font-black uppercase mt-1">{getLevelTitle(rankingList[2].level)}</p>
                                            <div className="mt-3 bg-transparent border border-amber-800 text-amber-600 px-3 py-1 rounded-full text-[9px] font-black">NV. {rankingList[2].level}</div>
                                            <div className="w-full h-1.5 bg-gray-900 rounded-full mt-4 overflow-hidden"><div className="h-full bg-gradient-to-r from-amber-800 to-amber-600 w-[45%]"></div></div>
                                            <div className="text-[8px] text-amber-700/80 font-bold mt-1">{rankingList[2].xp} / {(rankingList[2].level || 1) * 100} XP</div>
                                        </div>
                                    )}
                                </div>

                                <div className="flex flex-col gap-3">
                                    {rankingList.slice(3).map((player, idx) => (
                                        <div key={player.id} onClick={() => setSelectedUserId(player.id)} className="bg-[#05050a] border border-cyan-900/30 hover:border-cyan-500/50 rounded-2xl p-4 flex items-center gap-4 shadow-lg transition-colors group cursor-pointer">
                                            <div className="w-8 text-center text-xl font-black text-white">{idx + 4}</div>
                                            <div className="w-12 h-12 rounded-full border-2 border-cyan-900/50 group-hover:border-cyan-500 overflow-hidden flex-shrink-0">
                                                <img src={cleanCosmeticUrl(player.avatarUrl) || 'https://placehold.co/100x100/020205/0ea5e9?text=N'} className="w-full h-full object-cover" />
                                            </div>
                                            <div className="flex-1 min-w-0 flex flex-col justify-center">
                                                <h4 className="text-white font-black text-sm uppercase truncate group-hover:text-cyan-400 transition-colors">{player.displayName || "Oculto"}</h4>
                                                <p className="text-cyan-500 font-bold text-[9px] uppercase tracking-widest">{getLevelTitle(player.level)}</p>
                                                <div className="flex items-center gap-2 mt-1.5">
                                                    <div className="flex-1 h-1 bg-gray-900 rounded-full overflow-hidden max-w-[150px]">
                                                        <div className="h-full bg-cyan-500" style={{width: `${Math.min(100, ((player.xp || 0) / ((player.level || 1)*100)) * 100)}%`}}></div>
                                                    </div>
                                                    <span className="text-[8px] font-bold text-gray-500">{player.xp} / {(player.level || 1) * 100} XP</span>
                                                </div>
                                            </div>
                                            <div className="flex items-center gap-4">
                                                <div className="bg-transparent border border-white/10 px-3 py-1.5 rounded-lg text-white font-black text-[9px] uppercase tracking-widest hidden sm:block">NV. {player.level}</div>
                                                <ChevronRight className="w-5 h-5 text-cyan-900 group-hover:text-cyan-500 transition-colors" />
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </>
                        )}
                    </div>
                )}
            </div>
        </div>
    );
}
