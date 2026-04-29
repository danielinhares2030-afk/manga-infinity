import React, { useState, useEffect } from 'react';
import { Target, Hexagon, ShoppingCart, Trophy, Timer, Skull, Zap, Loader2, ArrowRight, Key, Sparkles, Flame, AlertTriangle, Crown, ChevronDown, Globe, ChevronRight } from 'lucide-react';
import { doc, updateDoc, collectionGroup, getDocs, query, deleteDoc } from "firebase/firestore";
import { deleteUser } from "firebase/auth";
import { auth, db } from './firebase';
import { addXpLogic, removeXpLogic, getLevelTitle, getRarityColor, cleanCosmeticUrl } from './helpers';
import { APP_ID } from './constants';

export function NexoView({ user, userProfileData, showToast, mangas, onNavigate, onLevelUp, synthesizeCrystal, shopItems, buyItem }) {
    const [activeTab, setActiveTab] = useState("Ranking");
    const [enigmaAnswer, setEnigmaAnswer] = useState("");
    const [timeLeft, setTimeLeft] = useState("");
    const [confirmModal, setConfirmModal] = useState(null); 
    const [isForgingMission, setIsForgingMission] = useState(false); 
    const [synthesizing, setSynthesizing] = useState(false);
    const [rankingList, setRankingList] = useState([]);
    const [loadingRank, setLoadingRank] = useState(false);
    const [shopCategory, setShopCategory] = useState('avatar');
    
    // ESTADO: Controla a animação de morte permanente
    const [isErased, setIsErased] = useState(false);

    const rankConfigs = {
        'Rank E': { rxp: 10, rcoin: 5, pxp: 15, pcoin: 10, time: 15, charLimit: 300, enigmaTries: 3, color: 'text-gray-400', border: 'border-gray-500', shadow: 'shadow-gray-500/20' },
        'Rank C': { rxp: 30, rcoin: 15, pxp: 50, pcoin: 25, time: 10, charLimit: 200, enigmaTries: 3, color: 'text-lime-400', border: 'border-lime-500', shadow: 'shadow-lime-500/20' },
        'Rank B': { rxp: 50, rcoin: 25, pxp: 80, pcoin: 40, time: 8, charLimit: 120, enigmaTries: 2, color: 'text-cyan-400', border: 'border-cyan-500', shadow: 'shadow-cyan-500/20' },
        'Rank A': { rxp: 100, rcoin: 50, pxp: 150, pcoin: 80, time: 5, charLimit: 80, enigmaTries: 2, color: 'text-amber-500', border: 'border-amber-500', shadow: 'shadow-amber-500/20' },
        'Rank S': { rxp: 250, rcoin: 120, pxp: 400, pcoin: 200, time: 3, charLimit: 60, enigmaTries: 1, color: 'text-orange-500', border: 'border-orange-500', shadow: 'shadow-orange-500/20' },
        'Rank SSS':{ rxp: 600, rcoin: 300, pxp: 1000, pcoin: 500, time: 1, charLimit: 40, enigmaTries: 1, color: 'text-red-600', border: 'border-red-600', shadow: 'shadow-red-600/30' }
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
            showToast("Falha na Matriz Sombria.", "error");
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

    const triggerForgeMission = async (difficulty) => {
        setConfirmModal(null); setIsForgingMission(true);
        setTimeout(() => { generateMission(difficulty); }, 1500); 
    };

    const generateMission = async (difficulty) => {
        try {
            const now = Date.now();
            
            if (difficulty === 'ABSOLUTO') {
                if (!mangas || mangas.length < 5) return showToast("Falta conhecimento para o julgamento.", "error");
                
                let shuffled = [...mangas].sort(() => 0.5 - Math.random());
                let targets = shuffled.slice(0, 5);
                
                let finalQuestion = `[ JULGAMENTO KAGE ]\n\nDesvende as 5 Obras Exatas na Ordem (separadas por vírgula):\n\n`;
                let answers = [];
                
                targets.forEach((m, index) => {
                    let cleanDesc = m.synopsis ? m.synopsis.replace(/<[^>]*>?/gm, '').replace(new RegExp(m.title, 'gi'), '█████').substring(0, 120) : "Sem registros astrais desta obra.";
                    finalQuestion += `${index + 1}. Gêneros: ${m.genres?.join(', ') || 'Nenhum'}\nFragmento Obscuro: "${cleanDesc}..."\n\n`;
                    answers.push(m.title.toLowerCase().trim());
                });

                finalQuestion += `AVISO CRÍTICO: Falhar resultará na desintegração irreversível da sua conta.`;
                let finalAnswer = answers.join(', ');

                let newMission = { id: Date.now().toString(), type: 'permadeath', difficulty: 'ABSOLUTO', title: "Julgamento Kage", question: finalQuestion, answer: [finalAnswer], rewardXp: 5000, rewardCoins: 3000, deadline: now + (15 * 60 * 1000) };
                await updateDoc(doc(db, 'artifacts', APP_ID, 'users', user.uid, 'profile', 'main'), { activeMission: newMission });
                showToast(`Pacto Absoluto Forjado. Sua vida está em jogo.`, "error");
                return;
            }

            const conf = rankConfigs[difficulty];
            const missionPool = ['read', 'search_visual', 'enigma'];
            const chosenType = missionPool[Math.floor(Math.random() * missionPool.length)];

            if (mangas && mangas.length > 0) {
                const availableMangas = mangas.filter(m => {
                    const c = userProfileData.completedMissions || [];
                    return !c.includes("search_local_" + m.id) && !c.includes("enigma_" + m.id) && !c.includes(m.id);
                });
                
                const randomManga = availableMangas.length > 0 ? availableMangas[Math.floor(Math.random() * availableMangas.length)] : mangas[Math.floor(Math.random() * mangas.length)];
                let newMission = null;

                if (chosenType === 'search_visual' && randomManga.synopsis) {
                    let cleanDesc = randomManga.synopsis.replace(/<[^>]*>?/gm, '').replace(new RegExp(randomManga.title, 'gi'), '█████');
                    let q = `[ ALVO MARCADO ]\n\nFragmento:\n"${cleanDesc.substring(0, conf.charLimit)}..."\n\nATENÇÃO: Você só tem UMA chance. Se clicar na obra errada no catálogo, a missão falha instantaneamente.`;
                    newMission = { id: Date.now().toString(), type: 'search_local', difficulty, title: "Caçada Implacável", question: q, targetManga: randomManga.id, rewardXp: conf.rxp, rewardCoins: conf.rcoin, penaltyXp: conf.pxp, penaltyCoins: conf.pcoin, deadline: now + (conf.time * 60 * 1000) };
                
                } else if (chosenType === 'enigma') {
                    let q = "";
                    const authorStr = (randomManga.author || "").toLowerCase();
                    
                    if (authorStr && authorStr !== "" && !authorStr.includes("desconhecid")) {
                        q = `[ ENIGMA DO VAZIO ]\n\nA mente por trás desta criação é: ${randomManga.author}.\n\nQual é a obra?`;
                    } else if (randomManga.genres && randomManga.genres.length > 0 && randomManga.synopsis) {
                        let cleanDesc = randomManga.synopsis.replace(/<[^>]*>?/gm, '').replace(new RegExp(randomManga.title, 'gi'), '█████');
                        q = `[ ENIGMA DO VAZIO ]\n\nGêneros: ${randomManga.genres.join(', ')}\n\nRelato: "${cleanDesc.substring(0, conf.charLimit)}..."\n\nQual é a obra?`;
                    } else {
                        q = `[ ENIGMA DO VAZIO ]\n\nDecifre o selo oculto pelas sombras da obra de número ${randomManga.id.substring(0,4)}...`;
                    }
                    newMission = { id: Date.now().toString(), type: 'enigma', difficulty, title: "Decodificação Kage", question: q, answer: [randomManga.title.toLowerCase().trim()], attemptsLeft: conf.enigmaTries, rewardXp: conf.rxp, rewardCoins: conf.rcoin, penaltyXp: conf.pxp, penaltyCoins: conf.pcoin, deadline: now + (conf.time * 60 * 1000), targetManga: randomManga.id };
                
                } else {
                    let readTarget = difficulty === 'Rank E' ? 1 : 3;
                    let q = `[ EXTRAÇÃO DE ESSÊNCIA ]\n\nTransmute a energia de ${readTarget} capítulo(s) da obra:\n\n"${randomManga.title}".`;
                    newMission = { id: Date.now().toString(), type: 'read', difficulty, title: `Extração de Essência`, desc: q, targetManga: randomManga.id, targetCount: readTarget, currentCount: 0, rewardXp: conf.rxp, rewardCoins: conf.rcoin, penaltyXp: conf.pxp, penaltyCoins: conf.pcoin, deadline: now + (readTarget * 45 * 60 * 1000) };
                }

                if (newMission) {
                    await updateDoc(doc(db, 'artifacts', APP_ID, 'users', user.uid, 'profile', 'main'), { activeMission: newMission });
                    showToast(`Pacto Formado. A contagem regressiva começou.`, "success");
                }
            }
        } catch(e) { showToast("Colapso ao forjar contrato.", "error"); } finally { setIsForgingMission(false); }
    };

    const handleEnigmaSubmit = async (e) => {
        e.preventDefault(); const m = userProfileData.activeMission;
        const userAnswer = enigmaAnswer.toLowerCase().trim();

        if (m.type === 'permadeath') {
            if (userAnswer === m.answer[0]) {
               let { newXp, newLvl, didLevelUp } = addXpLogic(userProfileData.xp || 0, userProfileData.level || 1, m.rewardXp);
               await updateDoc(doc(db, 'artifacts', APP_ID, 'users', user.uid, 'profile', 'main'), { coins: (userProfileData.coins || 0) + m.rewardCoins, xp: newXp, level: newLvl, activeMission: null });
               showToast("Julgamento Superado. Você transcendeu.", "success"); if(didLevelUp) onLevelUp(newLvl);
            } else {
               setIsErased(true);
               setTimeout(async () => {
                   try {
                       await deleteDoc(doc(db, 'artifacts', APP_ID, 'users', user.uid, 'profile', 'main'));
                       await deleteUser(auth.currentUser);
                       window.location.reload(); 
                   } catch(err) { console.error(err); window.location.reload(); }
               }, 4500); 
            }
            return;
        }

        if (userAnswer === m.answer[0]) {
           let { newXp, newLvl, didLevelUp } = addXpLogic(userProfileData.xp || 0, userProfileData.level || 1, m.rewardXp);
           let currentCompleted = userProfileData.completedMissions || []; 
           if (m.targetManga) currentCompleted.push("enigma_" + m.targetManga);
           await updateDoc(doc(db, 'artifacts', APP_ID, 'users', user.uid, 'profile', 'main'), { coins: (userProfileData.coins || 0) + m.rewardCoins, xp: newXp, level: newLvl, activeMission: null, completedMissions: currentCompleted });
           showToast("Código quebrado. Recompensa extraída!", "success"); if(didLevelUp) onLevelUp(newLvl); 
        } else { showToast("Análise incorreta. Cuidado.", "error"); }
    };

    const cancelMission = async () => {
        const m = userProfileData.activeMission;
        if (m.type === 'permadeath') return showToast("Este pacto não pode ser quebrado.", "error");

        const profileRef = doc(db, 'artifacts', APP_ID, 'users', user.uid, 'profile', 'main');
        let { newXp, newLvl } = removeXpLogic(userProfileData.xp || 0, userProfileData.level || 1, m.penaltyXp);
        await updateDoc(profileRef, { coins: Math.max(0, (userProfileData.coins || 0) - m.penaltyCoins), xp: newXp, level: newLvl, activeMission: null });
        showToast("Você recuou. O Sistema cobrou seu preço.", "error");
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

    const renderMissionText = (text) => {
        if (!text) return null;
        return text.split('\n\n').map((block, i) => (
            <div key={i} className={`bg-black/50 border-l-[3px] border-red-600 p-4 mb-3 rounded-r-lg shadow-sm ${i === 0 ? 'bg-red-900/20 border-red-500' : ''}`}>
                <p className="text-gray-300 text-xs md:text-sm font-bold leading-relaxed whitespace-pre-wrap">{block}</p>
            </div>
        ));
    };

    const equipped = userProfileData.equipped_items || {};

    return (
        <div className={`pb-24 animate-in fade-in duration-500 relative font-sans min-h-screen text-gray-200 ${equipped.tema_perfil ? equipped.tema_perfil.cssClass : 'bg-[#030305]'}`}>
            
            {isErased && (
                <div className="fixed inset-0 z-[99999] bg-[#000000] flex flex-col items-center justify-center overflow-hidden">
                    <style>{`
                        @keyframes glitch-severe { 0% { transform: translate(0); filter: hue-rotate(0deg); } 20% { transform: translate(-10px, 5px); filter: hue-rotate(90deg); } 40% { transform: translate(-10px, -10px); filter: hue-rotate(-90deg); } 60% { transform: translate(10px, 10px); filter: hue-rotate(180deg); } 80% { transform: translate(10px, -10px); filter: hue-rotate(45deg); } 100% { transform: translate(0); filter: hue-rotate(0deg); } }
                        .animate-glitch { animation: glitch-severe 0.15s linear infinite; }
                    `}</style>
                    <div className="absolute inset-0 bg-red-900/30 animate-pulse mix-blend-overlay"></div>
                    <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/stardust.png')] opacity-50 mix-blend-screen animate-pulse"></div>
                    <div className="absolute inset-0 bg-[linear-gradient(transparent_50%,rgba(0,0,0,0.5)_50%)] bg-[length:100%_4px] pointer-events-none z-10"></div>
                    
                    <Skull className="w-32 h-32 md:w-48 md:h-48 text-red-600 mb-8 animate-glitch relative z-20 drop-shadow-[0_0_50px_rgba(220,38,38,1)]" />
                    
                    <h1 className="text-3xl sm:text-4xl md:text-5xl font-black text-red-600 uppercase tracking-widest animate-glitch relative z-20 text-center px-4 leading-tight w-full drop-shadow-[0_0_20px_rgba(220,38,38,0.8)]">
                        Conta Desintegrada
                    </h1>
                    
                    <p className="text-white tracking-[0.5em] mt-6 uppercase font-bold text-[10px] md:text-xs relative z-20 bg-black/50 px-4 py-2 border border-red-900/50">Você falhou no Julgamento Kage</p>
                </div>
            )}

            {!equipped.tema_perfil && (
                <div className="absolute inset-0 z-0">
                    <div className="absolute inset-0 bg-[linear-gradient(to_right,#80000010_1px,transparent_1px),linear-gradient(to_bottom,#80000010_1px,transparent_1px)] bg-[size:40px_40px]"></div>
                    <div className="absolute inset-0 bg-[radial-gradient(circle_800px_at_50%_-30%,#dc262615,transparent)]"></div>
                </div>
            )}

            {confirmModal && (
                <div className="fixed inset-0 z-[3000] bg-black/90 backdrop-blur-sm flex items-center justify-center p-4 animate-in zoom-in-95 duration-200" onClick={() => setConfirmModal(null)}>
                    {confirmModal === 'ABSOLUTO' ? (
                        <div className={`bg-[#050000] border border-red-600 p-8 shadow-[0_0_50px_rgba(220,38,38,0.8)] max-w-sm w-full text-center relative overflow-hidden`} onClick={e => e.stopPropagation()}>
                            <Skull className="w-16 h-16 text-red-600 mx-auto mb-4 animate-pulse relative z-10" />
                            <h3 className="text-2xl font-black text-red-500 mb-2 uppercase tracking-widest relative z-10">Pacto de Sangue</h3>
                            <p className="text-[10px] text-gray-400 font-bold mb-8 uppercase tracking-[0.2em] relative z-10">Se você errar a resposta final, <b className="text-red-500">sua conta será excluída permanentemente</b> do banco de dados.</p>
                            <div className="flex gap-4 relative z-10">
                                <button onClick={() => setConfirmModal(null)} className="flex-1 bg-black border border-white/10 hover:border-white/30 text-gray-300 font-black py-3 text-[10px] uppercase tracking-widest transition-all">Recuar</button>
                                <button onClick={() => triggerForgeMission('ABSOLUTO')} className="flex-1 bg-red-900 border border-red-500 hover:bg-red-600 text-white font-black py-3 text-[10px] uppercase tracking-widest transition-all">Aceitar Morte</button>
                            </div>
                        </div>
                    ) : (
                        <div className={`bg-[#050505] border-l-[4px] border-r-[4px] border-t border-b ${rankConfigs[confirmModal].border} border-t-white/10 border-b-white/10 p-8 shadow-[0_0_40px_rgba(0,0,0,1)] max-w-sm w-full text-center relative overflow-hidden`} onClick={e => e.stopPropagation()}>
                            <Hexagon className={`absolute -right-8 -top-8 w-32 h-32 ${rankConfigs[confirmModal].color} opacity-10 rotate-12`} />
                            <Target className={`w-14 h-14 ${rankConfigs[confirmModal].color} mx-auto mb-4 animate-pulse relative z-10`} />
                            <h3 className="text-2xl font-black text-white mb-2 uppercase tracking-widest relative z-10">Aceitar Pacto?</h3>
                            <p className="text-[10px] text-gray-400 font-bold mb-8 uppercase tracking-[0.2em] relative z-10">O sangue assinado não pode ser apagado.</p>
                            <div className="flex gap-4 relative z-10">
                                <button onClick={() => setConfirmModal(null)} className="flex-1 bg-[#0a0a0c] border border-white/10 hover:border-white/30 text-gray-300 font-black py-3 text-[10px] uppercase tracking-widest transition-all skew-x-[-10deg]"><div className="skew-x-[10deg]">Recuar</div></button>
                                <button onClick={() => triggerForgeMission(confirmModal)} className={`flex-1 bg-[#0a0a0c] border border-${rankConfigs[confirmModal].border.split('-')[1]}-500/50 hover:bg-${rankConfigs[confirmModal].border.split('-')[1]}-600/20 text-${rankConfigs[confirmModal].color.split('-')[1]}-400 font-black py-3 text-[10px] uppercase tracking-widest transition-all skew-x-[-10deg]`}><div className="skew-x-[10deg]">Selar Alma</div></button>
                            </div>
                        </div>
                    )}
                </div>
            )}

            <div className="max-w-6xl mx-auto px-4 py-8 relative z-10">
                
                <div className="flex md:justify-center gap-4 mb-12 overflow-x-auto no-scrollbar snap-x w-full px-2">
                    {['Pactos', 'Forja', 'Loja', 'Ranking'].map((tab) => (
                        <button key={tab} onClick={() => setActiveTab(tab)} className={`relative px-8 py-3 font-black text-[10px] uppercase tracking-[0.3em] transition-all transform skew-x-[-15deg] group border-b-2
                            ${activeTab === tab ? 'bg-red-600/10 border-red-600 text-white' : 'bg-transparent border-transparent text-gray-500 hover:text-red-400'}`}>
                            <div className="skew-x-[15deg] flex items-center gap-2">
                                {tab === "Pactos" && <Target className="w-3.5 h-3.5"/>}
                                {tab === "Forja" && <Hexagon className="w-3.5 h-3.5"/>}
                                {tab === "Loja" && <ShoppingCart className="w-3.5 h-3.5"/>}
                                {tab === "Ranking" && <Trophy className="w-3.5 h-3.5"/>}
                                {tab}
                            </div>
                        </button>
                    ))}
                </div>

                {activeTab === "Pactos" && (
                    <div className="animate-in fade-in duration-300">
                        {userProfileData.activeMission ? (
                            <div className={`bg-[#050505] border-t border-b border-l-[4px] ${userProfileData.activeMission.type === 'permadeath' ? 'border-red-600 shadow-[0_0_50px_rgba(220,38,38,0.3)]' : rankConfigs[userProfileData.activeMission.difficulty].border} border-t-white/5 border-b-white/5 p-8 md:p-12 max-w-3xl mx-auto shadow-2xl relative overflow-hidden`}>
                                <div className={`absolute -right-20 -bottom-20 opacity-5 ${userProfileData.activeMission.type === 'permadeath' ? 'text-red-600' : rankConfigs[userProfileData.activeMission.difficulty].color} animate-[spin_40s_linear_infinite]`}>
                                    {userProfileData.activeMission.type === 'permadeath' ? <Skull className="w-96 h-96" /> : <Hexagon className="w-96 h-96" strokeWidth={0.5} />}
                                </div>

                                <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8 relative z-10 gap-6">
                                    <div>
                                        <div className={`inline-block px-3 py-1 text-[8px] font-black uppercase tracking-[0.4em] border bg-[#0a0a0c] ${userProfileData.activeMission.type === 'permadeath' ? 'border-red-600 text-red-500 animate-pulse' : `${rankConfigs[userProfileData.activeMission.difficulty].border} ${rankConfigs[userProfileData.activeMission.difficulty].color}`}`}>
                                            {userProfileData.activeMission.type === 'permadeath' ? 'JULGAMENTO ABSOLUTO' : `Anomalia: ${userProfileData.activeMission.difficulty}`}
                                        </div>
                                        <h3 className={`text-3xl md:text-4xl font-black mt-4 uppercase tracking-tighter drop-shadow-md ${userProfileData.activeMission.type === 'permadeath' ? 'text-red-500' : 'text-white'}`}>{userProfileData.activeMission.title}</h3>
                                    </div>
                                    <div className={`bg-[#0a0a0c] border px-5 py-3 rounded-none flex items-center gap-3 font-black text-sm shadow-[0_0_15px_rgba(220,38,38,0.2)] ${userProfileData.activeMission.type === 'permadeath' ? 'border-red-600 text-red-600' : 'border-red-500/50 text-red-500'}`}>
                                        <Timer className="w-4 h-4 animate-pulse" /> <span className="tracking-[0.3em]">{timeLeft}</span>
                                    </div>
                                </div>

                                <div className="bg-[#0a0a0c] border border-white/5 p-6 md:p-8 mb-8 relative z-10 shadow-inner">
                                    <div className="mt-2">
                                        {renderMissionText(userProfileData.activeMission.desc || userProfileData.activeMission.question)}
                                    </div>
                                    
                                    {userProfileData.activeMission.type === 'read' && (
                                        <div className="mt-8">
                                            <div className="w-full bg-black h-2 mb-3 border border-white/5 overflow-hidden">
                                                <div className={`h-full transition-all duration-1000 ease-out bg-gradient-to-r from-red-900 to-red-500 shadow-[0_0_10px_rgba(220,38,38,0.8)]`} style={{width: `${(userProfileData.activeMission.currentCount / userProfileData.activeMission.targetCount) * 100}%`}}></div>
                                            </div>
                                            <div className="flex justify-between text-[8px] md:text-[10px] font-black uppercase tracking-[0.3em] text-gray-500">
                                                <span>Progresso</span>
                                                <span className="text-red-500">{userProfileData.activeMission.currentCount} / {userProfileData.activeMission.targetCount} Caps</span>
                                            </div>
                                        </div>
                                    )}

                                    {(userProfileData.activeMission.type === 'enigma' || userProfileData.activeMission.type === 'permadeath') && (
                                        <form onSubmit={handleEnigmaSubmit} className="mt-8 flex gap-3">
                                            <input type="text" value={enigmaAnswer} onChange={e=>setEnigmaAnswer(e.target.value)} placeholder="Resposta Final..." className="flex-1 bg-black border border-white/10 px-5 py-3 text-white text-xs font-bold uppercase tracking-widest outline-none focus:border-red-600 transition-colors" />
                                            <button type="submit" className="bg-red-600 px-6 text-white hover:bg-red-500 transition-colors flex items-center justify-center"><Key className="w-5 h-5"/></button>
                                        </form>
                                    )}
                                </div>

                                <div className="flex flex-col sm:flex-row justify-between items-center gap-4 pt-4 border-t border-white/5 relative z-10">
                                    <div className="flex gap-6 text-[10px] font-black uppercase tracking-widest bg-[#0a0a0c] px-4 py-2 border border-white/5">
                                        <span className="text-white flex items-center gap-2"><Sparkles className="w-3 h-3 text-white"/> +{userProfileData.activeMission.rewardXp} XP</span>
                                        <span className="text-amber-500 flex items-center gap-2"><div className="w-2 h-2 bg-amber-500 rounded-full"></div> +{userProfileData.activeMission.rewardCoins} M</span>
                                    </div>
                                    
                                    <div className="flex gap-4 w-full sm:w-auto">
                                        {userProfileData.activeMission.type === 'read' && (
                                            <button onClick={() => { const m = mangas.find(mg => mg.id === userProfileData.activeMission.targetManga); if(m) onNavigate('details', m); }} className="flex-1 bg-white border border-white text-black font-black text-[9px] uppercase tracking-widest py-3 px-6 hover:bg-transparent hover:text-white transition-colors flex items-center justify-center gap-2">
                                                Rastrear Alvo <ArrowRight className="w-3 h-3" />
                                            </button>
                                        )}
                                        {userProfileData.activeMission.type !== 'permadeath' && (
                                            <button onClick={cancelMission} className="flex-1 sm:flex-none text-red-500 hover:text-white hover:bg-red-600 border border-red-500/30 px-6 py-3 font-black text-[9px] uppercase tracking-widest transition-all text-center flex items-center justify-center gap-2">
                                                <Skull className="w-3 h-3" /> Quebrar Pacto
                                            </button>
                                        )}
                                    </div>
                                </div>
                            </div>
                        ) : (
                            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5 max-w-5xl mx-auto">
                                {RANK_CARDS.map(rId => (
                                    <div key={rId} className={`bg-[#050505] border-t border-b border-l-[4px] border-r border-t-white/5 border-b-white/5 border-r-white/5 ${rankConfigs[rId].border} p-6 flex flex-col justify-between hover:scale-[1.02] hover:${rankConfigs[rId].shadow} transition-all duration-300 group relative overflow-hidden`}>
                                        <Hexagon className={`absolute -right-10 -top-10 w-40 h-40 ${rankConfigs[rId].color} opacity-5 group-hover:opacity-10 transition-opacity rotate-45`} />
                                        
                                        <div className="relative z-10 mb-6">
                                            <h3 className={`text-2xl font-black uppercase tracking-tighter ${rankConfigs[rId].color}`}>{rId}</h3>
                                            <p className="text-[9px] text-gray-500 font-bold uppercase tracking-widest mt-1">Classificação de Anomalia</p>
                                        </div>

                                        <div className="space-y-2 mb-8 relative z-10 bg-[#0a0a0c] p-4 border border-white/5">
                                            <div className="flex justify-between items-center text-[9px] font-black uppercase tracking-[0.2em]">
                                                <span className="text-gray-500">Recompensa:</span>
                                                <span className="text-white">{rankConfigs[rId].rxp}XP | {rankConfigs[rId].rcoin}M</span>
                                            </div>
                                            <div className="flex justify-between items-center text-[9px] font-black uppercase tracking-[0.2em]">
                                                <span className="text-gray-500">Penalidade:</span>
                                                <span className="text-red-500">-{rankConfigs[rId].pxp}XP | -{rankConfigs[rId].pcoin}M</span>
                                            </div>
                                        </div>

                                        <button onClick={() => setConfirmModal(rId)} className="w-full py-3 bg-transparent border border-white/10 text-white font-black text-[9px] uppercase tracking-widest group-hover:bg-white group-hover:text-black transition-all relative z-10 flex items-center justify-center gap-2">
                                            Sintetizar Desafio <ArrowRight className="w-3 h-3 group-hover:translate-x-1 transition-transform" />
                                        </button>
                                    </div>
                                ))}
                                
                                <div className={`col-span-full sm:col-span-2 lg:col-span-3 bg-gradient-to-br from-[#1a0505] to-[#0a0202] border-t border-b border-l-[4px] border-r border-t-red-900/30 border-b-red-900/30 border-r-red-900/30 border-l-red-600 p-6 flex flex-col sm:flex-row items-center justify-between hover:shadow-[0_0_30px_rgba(220,38,38,0.2)] transition-all duration-300 group relative overflow-hidden mt-4`}>
                                    <Skull className={`absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 w-80 h-80 text-red-600 opacity-[0.03] group-hover:opacity-10 transition-opacity`} />
                                    
                                    <div className="relative z-10 mb-6 sm:mb-0 text-center sm:text-left">
                                        <h3 className={`text-3xl font-black uppercase tracking-tighter text-red-600`}>Julgamento Absoluto</h3>
                                        <p className="text-[10px] text-gray-400 font-bold uppercase tracking-widest mt-1 max-w-sm">Decifre 5 enigmas perfeitamente. Erre, e sua conta será desintegrada do sistema.</p>
                                    </div>

                                    <div className="flex flex-col items-center sm:items-end gap-4 relative z-10 w-full sm:w-auto">
                                        <div className="bg-black/60 p-3 border border-red-900/30 flex gap-6 text-[9px] font-black uppercase tracking-[0.2em] w-full sm:w-auto justify-center">
                                            <span className="text-white">5000 XP</span>
                                            <span className="text-red-500">Morte Permanente</span>
                                        </div>
                                        <button onClick={() => setConfirmModal('ABSOLUTO')} className="w-full sm:w-auto px-8 py-3 bg-red-600 border border-transparent text-white font-black text-[9px] uppercase tracking-widest hover:bg-red-700 transition-all flex items-center justify-center gap-2 shadow-[0_0_15px_rgba(220,38,38,0.3)]">
                                            <AlertTriangle className="w-4 h-4"/> Aceitar Julgamento
                                        </button>
                                    </div>
                                </div>
                            </div>
                        )}
                    </div>
                )}

                {/* FORJA */}
                {activeTab === "Forja" && (
                    <div className="animate-in fade-in duration-300 max-w-2xl mx-auto mt-4 relative z-10">
                        <div className="bg-[#050505] border border-red-600/30 p-10 md:p-14 text-center relative overflow-hidden shadow-[0_0_50px_rgba(220,38,38,0.15)] rounded-tl-3xl rounded-br-3xl">
                            <div className="absolute inset-0 flex items-center justify-center opacity-10 pointer-events-none">
                                <div className="w-80 h-80 border border-red-500 rounded-full animate-[spin_20s_linear_infinite]"></div>
                                <div className="absolute w-80 h-80 border border-red-500 rounded-full animate-[spin_20s_linear_infinite_reverse] rotate-45 border-dashed"></div>
                                <Hexagon className="absolute w-64 h-64 text-red-500 animate-pulse" strokeWidth={0.5} />
                            </div>

                            <Flame className="w-16 h-16 mx-auto mb-6 text-red-600 animate-pulse relative z-10 drop-shadow-[0_0_20px_rgba(220,38,38,1)]" />
                            <h2 className="text-4xl md:text-5xl font-black text-white mb-2 relative z-10 uppercase tracking-tighter">Reator <span className="text-red-600">Nexo</span></h2>
                            <p className="text-gray-400 text-[10px] md:text-xs mb-10 uppercase tracking-[0.2em] font-bold relative z-10">Transmute <b className="text-blue-400">5 Cristais</b> em poder bruto. <span className="text-red-500">40% de chance de colapso material.</span></p>
                            
                            <div className="bg-[#0a0a0c] border border-blue-500/20 p-6 mb-10 relative z-10 max-w-xs mx-auto flex flex-col items-center justify-center gap-2 shadow-[inset_0_0_20px_rgba(59,130,246,0.1)]">
                                <span className="text-[9px] uppercase font-black text-blue-500/70 tracking-[0.3em]">Carga Atual</span>
                                <div className="text-5xl font-black text-white flex items-center gap-4">
                                    {userProfileData.crystals || 0} <Hexagon className="w-10 h-10 text-blue-500 drop-shadow-[0_0_15px_rgba(59,130,246,0.8)]" />
                                </div>
                            </div>

                            <button onClick={runSynthesis} disabled={synthesizing || (userProfileData.crystals || 0) < 5} className="w-full bg-red-600 text-white hover:bg-red-500 disabled:bg-[#0a0a0c] disabled:border border-white/5 disabled:text-gray-600 font-black py-5 transition-all duration-300 relative z-10 text-xs uppercase tracking-widest flex items-center justify-center gap-3 shadow-[0_0_20px_rgba(220,38,38,0.4)] disabled:shadow-none transform skew-x-[-10deg]">
                                <div className="skew-x-[10deg] flex items-center gap-2">
                                    {synthesizing ? <><Loader2 className="w-5 h-5 animate-spin" /> Transmutando Matéria...</> : 'Iniciar Transmutação'}
                                </div>
                            </button>
                        </div>
                    </div>
                )}

                {/* LOJA */}
                {activeTab === "Loja" && (
                    <div className="animate-in fade-in duration-300 max-w-6xl mx-auto">
                        <div className="flex flex-col sm:flex-row justify-between items-center gap-6 mb-8 bg-[#050505] p-6 border-l-[4px] border-red-600 border-t border-b border-r border-white/5 shadow-lg">
                            <div className="text-center sm:text-left">
                                <h3 className="text-3xl font-black text-white uppercase tracking-tighter">Mercado <span className="text-red-600">Sombrio</span></h3>
                                <p className="text-[9px] text-gray-500 font-bold uppercase tracking-[0.3em] mt-1">Adquira anomalias visuais para o seu Perfil.</p>
                            </div>
                            <div className="bg-[#0a0a0c] px-6 py-3 border border-amber-500/30 text-amber-500 font-black text-lg flex items-center gap-3 shadow-[inset_0_0_10px_rgba(245,158,11,0.1)]">
                                <div className="w-3 h-3 bg-amber-500 rotate-45"></div> {userProfileData.coins || 0}
                            </div>
                        </div>

                        <div className="flex gap-2 overflow-x-auto no-scrollbar mb-8 pb-2 snap-x">
                            {[ {id:'avatar', label:'Avatares'}, {id:'capa_fundo', label:'Paredes de Fundo'}, {id:'moldura', label:'Auras (Molduras)'}, {id:'nickname', label:'Selos de Nome'} ].map(cat => (
                                <button key={cat.id} onClick={() => setShopCategory(cat.id)} className={`flex-shrink-0 px-6 py-2.5 font-black text-[9px] uppercase tracking-widest transition-all border transform skew-x-[-15deg] ${ shopCategory === cat.id ? 'bg-red-600 border-transparent text-white' : 'bg-[#050505] border-white/5 text-gray-500 hover:text-white' }`}>
                                    <div className="skew-x-[15deg]">{cat.label}</div>
                                </button>
                            ))}
                        </div>
                          
                        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
                            {shopItems.filter(item => {
                                const cat = (item.categoria || item.type || '').toLowerCase();
                                if (shopCategory === 'capa_fundo') return cat === 'capa_fundo' || cat === 'capa';
                                return cat === shopCategory;
                            }).map(item => {
                              const hasItem = userProfileData.inventory?.includes(item.id);
                              const cat = (item.categoria || item.type || '').toLowerCase();

                              return (
                                <div key={item.id} className="bg-[#050505] border border-white/5 p-4 flex flex-col items-center text-center hover:border-red-600/40 transition-all relative group rounded-tl-xl rounded-br-xl shadow-lg">
                                  {(item.css || item.animacao) && ( <style dangerouslySetInnerHTML={{__html: `.${item.cssClass} { ${item.css} } ${item.animacao || ''}`}} /> )}
                                  
                                  <div className={`absolute top-0 left-0 text-[6px] font-black px-2 py-1 uppercase tracking-widest border-b border-r bg-[#0a0a0c] ${getRarityColor(item.raridade).replace('text-', 'border-').replace('text-', 'text-')}`}>
                                      {item.raridade || 'COMUM'}
                                  </div>

                                  <div className={`w-24 h-24 mt-4 mb-4 bg-[#0a0a0c] flex items-center justify-center overflow-hidden border border-white/5 relative flex-shrink-0 ${cat === 'avatar' ? item.cssClass : ''}`}>
                                    {['capa_fundo', 'capa'].includes(cat) && cleanCosmeticUrl(item.preview) && ( <img src={cleanCosmeticUrl(item.preview)} className="w-full h-full object-cover opacity-70 group-hover:scale-110 transition-transform duration-700" /> )}
                                    {cat === 'moldura' && cleanCosmeticUrl(item.preview) && ( <img src={cleanCosmeticUrl(item.preview)} className="absolute inset-0 w-full h-full object-cover z-20 pointer-events-none scale-[1.15]" style={{ mixBlendMode: 'screen' }} /> )}
                                    {cat === 'avatar' && cleanCosmeticUrl(item.preview) && ( <img src={cleanCosmeticUrl(item.preview)} className="w-full h-full object-cover relative z-10 group-hover:scale-110 transition-transform duration-500" /> )}
                                    {cat === 'nickname' && ( <div className={`font-black text-base z-20 ${item.cssClass}`}>Kage</div> )}
                                  </div>
                                  
                                  <h4 className="text-gray-300 font-black mb-4 text-[10px] uppercase tracking-widest line-clamp-1 w-full">{item.nome || item.name}</h4>
                                  
                                  {hasItem ? (
                                    <button disabled className="w-full bg-[#0a0a0c] border border-white/5 text-gray-700 font-black py-2.5 text-[8px] uppercase tracking-widest cursor-not-allowed">No Inventário</button>
                                  ) : (
                                    <button onClick={() => buyItem(item)} className="w-full bg-transparent border border-amber-600/50 text-amber-500 hover:bg-amber-600 hover:text-black font-black py-2.5 text-[9px] uppercase tracking-widest transition-colors flex items-center justify-center gap-2">
                                        Adquirir <div className="w-1.5 h-1.5 bg-current rotate-45"></div> {item.preco}
                                    </button>
                                  )}
                                </div>
                              )
                            })}
                        </div>
                    </div>
                )}

                {/* RANKING (DESIGN REFORMULADO IDÊNTICO À IMAGEM) */}
                {activeTab === "Ranking" && (
                    <div className="animate-in fade-in duration-300 max-w-4xl mx-auto pb-10">
                        {/* Header */}
                        <div className="flex justify-between items-end mb-10 border-b border-red-900/30 pb-4">
                            <div>
                                <h2 className="text-3xl md:text-4xl font-black text-white uppercase tracking-tighter flex items-center gap-3">
                                    <span className="text-red-600">
                                        <svg className="w-8 h-8 fill-current" viewBox="0 0 24 24"><path d="M12 2L14.5 9.5L22 12L14.5 14.5L12 22L9.5 14.5L2 12L9.5 9.5L12 2Z"/></svg>
                                    </span>
                                    RANKING DE LEITORES
                                </h2>
                                <p className="text-xs text-gray-400 mt-1 font-medium">Mostre sua dedicação. Suba no ranking.</p>
                            </div>
                            <button className="hidden sm:flex items-center gap-2 bg-transparent border border-white/20 text-white px-4 py-2 rounded-lg text-xs font-black uppercase tracking-widest hover:bg-white/5 transition-colors">
                                <Globe className="w-4 h-4" /> Global <ChevronDown className="w-4 h-4 ml-2" />
                            </button>
                        </div>

                        {loadingRank ? (
                            <div className="flex justify-center py-20"><Loader2 className="w-10 h-10 text-red-600 animate-spin"/></div>
                        ) : (
                            <>
                                {/* PODIUM TOP 3 */}
                                <div className="flex justify-center items-end gap-2 md:gap-4 mb-10 mt-8">
                                    {/* 2nd Place */}
                                    {rankingList[1] && (
                                        <div className="w-[30%] max-w-[160px] bg-gradient-to-b from-[#1a1a1a] to-[#050505] rounded-t-2xl border-t-[3px] border-gray-400 p-4 relative flex flex-col items-center shadow-[0_-10px_30px_rgba(156,163,175,0.15)] order-1">
                                            <Crown className="absolute -top-6 w-8 h-8 text-gray-300 drop-shadow-[0_0_10px_rgba(209,213,219,0.8)]" />
                                            <div className="absolute top-2 left-2 text-xl font-black text-gray-300">2</div>
                                            <div className="w-16 h-16 rounded-full border-2 border-gray-400 overflow-hidden mb-3 mt-4">
                                                <img src={cleanCosmeticUrl(rankingList[1].avatarUrl) || 'https://placehold.co/100x100/030305/dc2626?text=K'} className="w-full h-full object-cover" />
                                            </div>
                                            <h4 className="font-black text-xs text-white uppercase truncate w-full text-center">{rankingList[1].displayName || "Oculto"}</h4>
                                            <p className="text-[8px] text-red-500 font-black uppercase mt-1">{getLevelTitle(rankingList[1].level)}</p>
                                            <div className="mt-3 bg-transparent border border-gray-500 text-gray-300 px-3 py-1 rounded-full text-[9px] font-black">NV. {rankingList[1].level}</div>
                                            <div className="w-full h-1.5 bg-gray-800 rounded-full mt-4 overflow-hidden"><div className="h-full bg-gradient-to-r from-gray-500 to-gray-300 w-[60%]"></div></div>
                                            <div className="text-[8px] text-gray-500 font-bold mt-1">{rankingList[1].xp} / {(rankingList[1].level || 1) * 100} XP</div>
                                        </div>
                                    )}
                                    {/* 1st Place */}
                                    {rankingList[0] && (
                                        <div className="w-[35%] max-w-[190px] bg-gradient-to-b from-[#2a1b00] to-[#050505] rounded-t-2xl border-t-[4px] border-yellow-500 p-5 relative flex flex-col items-center shadow-[0_-15px_40px_rgba(234,179,8,0.25)] order-2 z-10 transform scale-110 mb-2">
                                            <Crown className="absolute -top-8 w-10 h-10 text-yellow-400 fill-yellow-400 drop-shadow-[0_0_15px_rgba(250,204,21,1)]" />
                                            <div className="absolute top-2 left-3 text-2xl font-black text-yellow-500">1</div>
                                            <div className="w-20 h-20 rounded-full border-[3px] border-yellow-500 overflow-hidden mb-3 mt-4 shadow-[0_0_20px_rgba(234,179,8,0.4)]">
                                                <img src={cleanCosmeticUrl(rankingList[0].avatarUrl) || 'https://placehold.co/100x100/030305/dc2626?text=K'} className="w-full h-full object-cover" />
                                            </div>
                                            <h4 className="font-black text-sm text-white uppercase truncate w-full text-center">{rankingList[0].displayName || "Oculto"}</h4>
                                            <p className="text-[9px] text-red-500 font-black uppercase mt-1">{getLevelTitle(rankingList[0].level)}</p>
                                            <div className="mt-3 bg-transparent border border-yellow-600 text-yellow-500 px-4 py-1 rounded-full text-[10px] font-black shadow-[0_0_10px_rgba(234,179,8,0.2)]">NV. {rankingList[0].level}</div>
                                            <div className="w-full h-2 bg-gray-900 rounded-full mt-5 overflow-hidden border border-yellow-900/50"><div className="h-full bg-gradient-to-r from-yellow-600 to-yellow-400 shadow-[0_0_10px_rgba(250,204,21,0.8)] w-[80%]"></div></div>
                                            <div className="text-[9px] text-yellow-600 font-bold mt-1.5">{rankingList[0].xp} / {(rankingList[0].level || 1) * 100} XP</div>
                                        </div>
                                    )}
                                    {/* 3rd Place */}
                                    {rankingList[2] && (
                                        <div className="w-[30%] max-w-[160px] bg-gradient-to-b from-[#2a1305] to-[#050505] rounded-t-2xl border-t-[3px] border-amber-700 p-4 relative flex flex-col items-center shadow-[0_-10px_30px_rgba(180,83,9,0.15)] order-3">
                                            <Crown className="absolute -top-6 w-8 h-8 text-amber-600 drop-shadow-[0_0_10px_rgba(217,119,6,0.8)]" />
                                            <div className="absolute top-2 left-2 text-xl font-black text-amber-700">3</div>
                                            <div className="w-16 h-16 rounded-full border-2 border-amber-700 overflow-hidden mb-3 mt-4">
                                                <img src={cleanCosmeticUrl(rankingList[2].avatarUrl) || 'https://placehold.co/100x100/030305/dc2626?text=K'} className="w-full h-full object-cover" />
                                            </div>
                                            <h4 className="font-black text-xs text-white uppercase truncate w-full text-center">{rankingList[2].displayName || "Oculto"}</h4>
                                            <p className="text-[8px] text-red-500 font-black uppercase mt-1">{getLevelTitle(rankingList[2].level)}</p>
                                            <div className="mt-3 bg-transparent border border-amber-800 text-amber-600 px-3 py-1 rounded-full text-[9px] font-black">NV. {rankingList[2].level}</div>
                                            <div className="w-full h-1.5 bg-gray-900 rounded-full mt-4 overflow-hidden"><div className="h-full bg-gradient-to-r from-amber-800 to-amber-600 w-[45%]"></div></div>
                                            <div className="text-[8px] text-amber-700/80 font-bold mt-1">{rankingList[2].xp} / {(rankingList[2].level || 1) * 100} XP</div>
                                        </div>
                                    )}
                                </div>

                                {/* LISTA RESTANTE (4+) */}
                                <div className="flex flex-col gap-3">
                                    {rankingList.slice(3).map((player, idx) => (
                                        <div key={player.id} className="bg-[#050505] border border-red-900/30 hover:border-red-600/50 rounded-2xl p-4 flex items-center gap-4 shadow-lg transition-colors group">
                                            <div className="w-8 text-center text-xl font-black text-white">{idx + 4}</div>
                                            
                                            <div className="w-12 h-12 rounded-full border-2 border-red-900/50 group-hover:border-red-600 overflow-hidden flex-shrink-0">
                                                <img src={cleanCosmeticUrl(player.avatarUrl) || 'https://placehold.co/100x100/030305/dc2626?text=K'} className="w-full h-full object-cover" />
                                            </div>

                                            <div className="flex-1 min-w-0 flex flex-col justify-center">
                                                <h4 className="text-white font-black text-sm uppercase truncate">{player.displayName || "Oculto"}</h4>
                                                <p className="text-red-500 font-bold text-[9px] uppercase tracking-widest">{getLevelTitle(player.level)}</p>
                                                
                                                <div className="flex items-center gap-2 mt-1.5">
                                                    <div className="flex-1 h-1 bg-gray-900 rounded-full overflow-hidden max-w-[150px]">
                                                        <div className="h-full bg-red-600" style={{width: `${Math.min(100, ((player.xp || 0) / ((player.level || 1)*100)) * 100)}%`}}></div>
                                                    </div>
                                                    <span className="text-[8px] font-bold text-gray-500">{player.xp} / {(player.level || 1) * 100} XP</span>
                                                </div>
                                            </div>

                                            <div className="flex items-center gap-4">
                                                <div className="bg-transparent border border-white/10 px-3 py-1.5 rounded-lg text-white font-black text-[9px] uppercase tracking-widest hidden sm:block">
                                                    NV. {player.level}
                                                </div>
                                                <svg className="w-5 h-5 text-gray-500 group-hover:text-red-500 transition-colors hidden sm:block" viewBox="0 0 24 24" fill="currentColor"><path d="M12 2L14.5 9.5L22 12L14.5 14.5L12 22L9.5 14.5L2 12L9.5 9.5L12 2Z"/></svg>
                                                <ChevronRight className="w-5 h-5 text-red-900 group-hover:text-red-500 transition-colors" />
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
