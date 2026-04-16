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
            showToast("Falha na Matriz. O Ranking não pôde ser carregado.", "error");
        } finally {
            setLoadingRank(false);
        }
    };

    useEffect(() => {
        if (!userProfileData.activeMission) return;
        const updateTimer = () => {
            const diff = userProfileData.activeMission.deadline - Date.now();
            if (diff <= 0) { setTimeLeft("00:00:00 (FALHA)"); } else {
                const d = Math.floor(diff / (1000 * 60 * 60 * 24));
                const h = Math.floor((diff / (1000 * 60 * 60)) % 24);
                const m = Math.floor((diff / 1000 / 60) % 60);
                const s = Math.floor((diff / 1000) % 60);
                setTimeLeft(`${d > 0 ? d+'d ' : ''}${h.toString().padStart(2, '0')}:${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`);
            }
        };
        updateTimer();
        const interval = setInterval(updateTimer, 1000);
        return () => clearInterval(interval);
    }, [userProfileData.activeMission]);

    const triggerForgeMission = async (difficulty) => {
        setConfirmModal(null); setIsForgingMission(true);
        setTimeout(() => { generateMission(difficulty); }, 2000); 
    };

    const generateMission = async (difficulty) => {
        try {
            const now = Date.now();
            let completed = userProfileData.completedMissions || [];
            let newMission = null;
            const conf = rankConfigs[difficulty];

            const missionPool = ['read', 'search_visual', 'enigma'];
            const chosenType = missionPool[Math.floor(Math.random() * missionPool.length)];

            if (mangas.length > 0) {
                const randomManga = mangas[Math.floor(Math.random() * mangas.length)];

                if (chosenType === 'search_visual' && randomManga.synopsis && randomManga.synopsis.length > 30) {
                    let cleanDesc = randomManga.synopsis.replace(/<[^>]*>?/gm, '').replace(new RegExp(randomManga.title, 'gi'), '█████');
                    let genres = randomManga.genres ? randomManga.genres.join(', ') : 'Desconhecidos';
                    let q = `[ ECO DETECTADO ]\n\nAssinatura de Gêneros: ${genres}\n\nFragmento Corrompido:\n"${cleanDesc.substring(0, conf.charLimit)}..."\n\nLocalize a origem deste eco no catálogo e acesse a página da obra.`;
                    
                    newMission = { id: Date.now().toString(), type: 'search_local', difficulty, title: "Caçada Abissal", question: q, targetManga: randomManga.id, rewardXp: conf.rxp, rewardCoins: conf.rcoin, penaltyXp: conf.pxp, penaltyCoins: conf.pcoin, deadline: now + (conf.time * 60 * 1000) };
                
                } else if (chosenType === 'enigma') {
                    let q = `[ MISTÉRIO QUÂNTICO ]\n\nAnalisando fragmentos da Biblioteca...\n\n`;
                    if (randomManga.author) q += `• Autoria Registrada: ${randomManga.author}\n`;
                    if (randomManga.genres && randomManga.genres.length > 0) q += `• Espectro: ${randomManga.genres.slice(0,3).join(', ')}\n`;
                    q += `\nQual é a nomenclatura exata desta anomalia?`;
                    newMission = { id: Date.now().toString(), type: 'enigma', difficulty, title: "Enigma do Vazio", question: q, answer: [randomManga.title.toLowerCase().trim()], attemptsLeft: conf.enigmaTries, rewardXp: conf.rxp, rewardCoins: conf.rcoin, penaltyXp: conf.pxp, penaltyCoins: conf.pcoin, deadline: now + (conf.time * 60 * 1000) };
                
                } else {
                    let readTarget = difficulty === 'Rank E' ? 1 : difficulty === 'Rank C' ? 2 : difficulty === 'Rank B' ? 3 : difficulty === 'Rank A' ? 5 : difficulty === 'Rank S' ? 10 : 20;
                    if(randomManga.chapters && randomManga.chapters.length < readTarget) readTarget = randomManga.chapters.length || 1;
                    newMission = { id: Date.now().toString(), type: 'read', difficulty, title: `Extração de Conhecimento`, desc: `Faça a leitura de ${readTarget} capítulo(s) da obra "${randomManga.title}".`, targetManga: randomManga.id, targetCount: readTarget, currentCount: 0, rewardXp: conf.rxp, rewardCoins: conf.rcoin, penaltyXp: conf.pxp, penaltyCoins: conf.pcoin, deadline: now + (readTarget * 45 * 60 * 1000) };
                }
            }

            if (newMission) {
                await updateDoc(doc(db, 'artifacts', APP_ID, 'users', user.uid, 'profile', 'main'), { activeMission: newMission, completedMissions: completed });
                showToast(`Contrato Assinado. O relógio começou.`, "success");
            } else {
                showToast("Sem anomalias no radar no momento.", "error");
            }
        } catch(e) { showToast("Falha crítica ao gerar contrato.", "error"); } finally { setIsForgingMission(false); }
    };
    
    const handleEnigmaSubmit = async (e) => {
        e.preventDefault(); const m = userProfileData.activeMission;
        if (!m || m.type !== 'enigma') return;
        if (!enigmaAnswer.trim()) return showToast("A resposta não pode ser o vazio.", "warning");
        const profileRef = doc(db, 'artifacts', APP_ID, 'users', user.uid, 'profile', 'main');
        const userAnswer = enigmaAnswer.toLowerCase().trim();
        const isCorrect = m.answer.some(ans => { const correctAns = ans.toLowerCase().trim(); return userAnswer === correctAns || (userAnswer.length >= 3 && (correctAns.includes(userAnswer) || userAnswer.includes(correctAns))); });
        
        if (isCorrect) {
           let { newXp, newLvl, didLevelUp } = addXpLogic(userProfileData.xp || 0, userProfileData.level || 1, m.rewardXp);
           let newCoins = (userProfileData.coins || 0) + m.rewardCoins;
           await updateDoc(profileRef, { coins: newCoins, xp: newXp, level: newLvl, activeMission: null });
           setEnigmaAnswer(''); showToast(`Decodificado! +${m.rewardXp} XP e +${m.rewardCoins} M.`, "success");
           if(didLevelUp) onLevelUp(newLvl); 
        } else {
           const attempts = m.attemptsLeft - 1;
           if (attempts <= 0) {
               let newCoins = Math.max(0, (userProfileData.coins || 0) - m.penaltyCoins);
               let { newXp, newLvl } = removeXpLogic(userProfileData.xp || 0, userProfileData.level || 1, m.penaltyXp);
               await updateDoc(profileRef, { coins: newCoins, xp: newXp, level: newLvl, activeMission: null });
               showToast(`Falha Absoluta. O Abismo cobrou seu preço.`, "error");
           } else {
               await updateDoc(profileRef, { 'activeMission.attemptsLeft': attempts }); showToast(`Incorreto. Apenas ${attempts} tentativa(s) restante(s).`, "error");
           }
           setEnigmaAnswer('');
        }
    };
    
    const cancelMission = async () => {
        const m = userProfileData.activeMission; if(!m) return;
        const profileRef = doc(db, 'artifacts', APP_ID, 'users', user.uid, 'profile', 'main');
        let newCoins = Math.max(0, (userProfileData.coins || 0) - m.penaltyCoins);
        let { newXp, newLvl } = removeXpLogic(userProfileData.xp || 0, userProfileData.level || 1, m.penaltyXp);
        await updateDoc(profileRef, { coins: newCoins, xp: newXp, level: newLvl, activeMission: null });
        showToast(`Covardia punida: -${m.penaltyXp}XP e -${m.penaltyCoins} Moedas.`, "error");
    };

    const runSynthesis = async () => {
        if ((userProfileData.crystals || 0) < 5) { showToast("Cristais insuficientes. Colete 5 no Vazio.", "error"); return; }
        setSynthesizing(true);
        setTimeout(async () => {
          const res = await synthesizeCrystal(); setSynthesizing(false);
          if (res && res.success) showToast(`Reação Sucesso! +${res.wonCoins} M | +${res.wonXp} XP`, 'success');
          else showToast(`Colapso! Cristais desintegrados.`, 'error');
        }, 1500);
    };

    const equipped = userProfileData.equipped_items || {};

    return (
        <div className={`max-w-6xl mx-auto px-4 py-8 md:py-12 animate-in fade-in duration-700 relative pb-24 font-sans min-h-screen text-gray-200 ${equipped.tema_perfil ? equipped.tema_perfil.cssClass : 'bg-[#020105]'}`}>
            
            {/* FUNDO SURREAL GLOBAL */}
            <div className="fixed top-[-20%] left-[-10%] w-[50vw] h-[50vw] bg-cyan-600/10 rounded-full blur-[120px] pointer-events-none mix-blend-screen animate-[pulse_4s_infinite_alternate]"></div>
            <div className="fixed bottom-[-10%] right-[-10%] w-[50vw] h-[50vw] bg-fuchsia-600/10 rounded-full blur-[120px] pointer-events-none mix-blend-screen animate-[pulse_5s_infinite_alternate-reverse]"></div>

            {confirmModal && (
                <div className="fixed inset-0 z-[3000] bg-[#020105]/80 backdrop-blur-xl flex items-center justify-center p-4 animate-in fade-in duration-300" onClick={() => setConfirmModal(null)}>
                    <div className="bg-[#05030a] border border-fuchsia-500/50 p-8 rounded-3xl shadow-[0_0_50px_rgba(217,70,239,0.2)] max-w-md w-full text-center relative overflow-hidden" onClick={e => e.stopPropagation()}>
                        <div className="absolute inset-0 bg-gradient-to-t from-fuchsia-900/20 to-transparent pointer-events-none"></div>
                        <Target className="w-16 h-16 text-fuchsia-500 mx-auto mb-6 drop-shadow-[0_0_15px_rgba(217,70,239,0.8)] animate-pulse" />
                        <h3 className="text-2xl font-black text-white mb-2 tracking-widest uppercase">Firmar Pacto?</h3>
                        <p className="text-xs text-gray-400 font-bold px-2 mb-6 uppercase tracking-wider">A desistência ou falha resultará em severas punições do Abismo.</p>
                        
                        <div className="bg-red-950/40 border border-red-500/30 p-5 rounded-2xl mb-8">
                            <p className="text-[10px] text-red-500 uppercase tracking-[0.3em] font-black mb-2">Preço da Falha</p>
                            <p className="text-xl font-black text-white drop-shadow-[0_0_10px_rgba(220,38,38,0.8)]">-{rankConfigs[confirmModal]?.pxp} XP <span className="text-gray-600 px-2">|</span> -{rankConfigs[confirmModal]?.pcoin} M</p>
                        </div>
                        
                        <div className="flex gap-4">
                            <button onClick={() => setConfirmModal(null)} className="flex-1 bg-transparent border border-white/10 text-gray-400 font-black py-4 rounded-xl hover:bg-white/5 hover:text-white transition-colors text-xs uppercase tracking-widest">Recuar</button>
                            <button onClick={() => triggerForgeMission(confirmModal)} className="flex-1 bg-transparent border border-fuchsia-500 text-fuchsia-400 hover:bg-fuchsia-500 hover:text-white font-black py-4 rounded-xl transition-all shadow-[0_0_20px_rgba(217,70,239,0.3)] hover:shadow-[0_0_30px_rgba(217,70,239,0.6)] text-xs uppercase tracking-widest relative overflow-hidden group">
                                <span className="relative z-10">Aceitar</span>
                                <div className="absolute inset-0 bg-fuchsia-500 translate-x-[-100%] group-hover:translate-x-0 transition-transform duration-300 z-0"></div>
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* NAVEGAÇÃO DE ABAS */}
            <div className="flex justify-start gap-4 mb-12 overflow-x-auto no-scrollbar pb-4 relative z-20 w-full px-2 snap-x">
                {['Missões', 'Forja', 'Loja', 'Ranking'].map((tab) => (
                    <button 
                        key={tab}
                        onClick={() => setActiveTab(tab)} 
                        className={`snap-start px-8 py-3.5 rounded-2xl font-black transition-all whitespace-nowrap flex items-center gap-3 text-[10px] sm:text-xs uppercase tracking-[0.2em] relative overflow-hidden group
                        ${activeTab === tab ? 'text-white border-transparent shadow-[0_0_20px_rgba(34,211,238,0.3)]' : 'text-gray-500 border border-white/5 hover:text-cyan-400'}`}
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

            {/* CONTEÚDO: MISSÕES */}
            {activeTab === "Missões" && (
                <div className="animate-in fade-in duration-500 relative z-10">
                    {userProfileData.activeMission ? (
                        <div className="bg-white/[0.02] backdrop-blur-2xl border border-white/10 p-8 md:p-12 rounded-[3rem] relative overflow-hidden shadow-[0_30px_60px_rgba(0,0,0,0.8)] max-w-4xl mx-auto group">
                            
                            <div className="absolute top-[-50%] right-[-20%] w-[80%] h-[150%] bg-gradient-to-b from-cyan-500/10 to-fuchsia-600/10 rotate-12 blur-[80px] pointer-events-none group-hover:rotate-[20deg] transition-transform duration-[3s]"></div>
                            
                            <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 mb-10 relative z-10">
                               <div>
                                  <span className={`text-[10px] font-black uppercase tracking-[0.3em] px-4 py-2 rounded-xl border ${rankConfigs[userProfileData.activeMission.difficulty].color} ${rankConfigs[userProfileData.activeMission.difficulty].border} shadow-[inset_0_0_15px_rgba(255,255,255,0.05)]`}>
                                    {userProfileData.activeMission.difficulty}
                                  </span>
                                  <h3 className="text-3xl md:text-5xl font-black text-transparent bg-clip-text bg-gradient-to-r from-white to-gray-500 mt-6 tracking-tighter uppercase drop-shadow-2xl">{userProfileData.activeMission.title}</h3>
                               </div>
                               <div className="flex items-center gap-3 text-red-500 font-black bg-red-950/20 px-6 py-3 rounded-2xl border border-red-500/30 shadow-[0_0_15px_rgba(220,38,38,0.2)]">
                                   <Timer className="w-5 h-5 animate-pulse" /> <span className="tracking-[0.2em] text-sm md:text-base">{timeLeft}</span>
                               </div>
                            </div>
                            
                            {userProfileData.activeMission.type === 'read' && (
                                <div className="bg-[#020105]/80 p-8 rounded-[2rem] border border-white/5 mb-10 relative z-10 shadow-inner">
                                   <p className="text-gray-300 font-bold text-sm md:text-base mb-8 leading-relaxed uppercase tracking-wider">{userProfileData.activeMission.desc}</p>
                                   
                                   <div className="w-full bg-[#05030a] rounded-full h-3 overflow-hidden mb-4 border border-white/5 shadow-inner">
                                       <div className="bg-gradient-to-r from-cyan-500 to-fuchsia-500 h-full transition-all duration-1000 ease-out relative" style={{width: `${(userProfileData.activeMission.currentCount / userProfileData.activeMission.targetCount) * 100}%`}}>
                                            <div className="absolute top-0 right-0 w-4 h-full bg-white/50 blur-[2px] animate-pulse"></div>
                                       </div>
                                   </div>
                                   <div className="flex justify-between text-[10px] text-cyan-400 font-black tracking-[0.2em] uppercase">
                                       <span>Poder Extraído</span>
                                       <span>{userProfileData.activeMission.currentCount} / {userProfileData.activeMission.targetCount} Caps</span>
                                   </div>

                                   <button onClick={() => { const m = mangas.find(mg => mg.id === userProfileData.activeMission.targetManga); if(m) onNavigate('details', m); }} className="w-full mt-10 bg-transparent border border-cyan-500 text-cyan-400 hover:bg-cyan-500 hover:text-black font-black py-4 rounded-2xl flex items-center justify-center gap-3 transition-all text-xs uppercase tracking-widest shadow-[0_0_20px_rgba(34,211,238,0.2)] group/btn">
                                        Rastrear Obra <ArrowRight className="w-4 h-4 group-hover/btn:translate-x-2 transition-transform" />
                                   </button>
                                </div>
                            )}

                            {userProfileData.activeMission.type === 'search_local' && (
                                <div className="bg-[#020105]/80 p-8 rounded-[2rem] border border-white/5 mb-10 relative z-10 shadow-inner">
                                    <p className="text-cyan-100 font-bold text-sm leading-relaxed whitespace-pre-wrap tracking-wider uppercase">{userProfileData.activeMission.question}</p>
                                </div>
                            )}
                            
                            {userProfileData.activeMission.type === 'enigma' && (
                                <div className="bg-[#020105]/80 p-8 rounded-[2rem] border border-white/5 mb-10 relative z-10 shadow-inner">
                                   <p className="text-cyan-100 font-bold text-sm leading-relaxed whitespace-pre-wrap mb-8 uppercase tracking-wider">{userProfileData.activeMission.question}</p>
                                   <form onSubmit={handleEnigmaSubmit} className="flex flex-col gap-4">
                                      <input type="text" value={enigmaAnswer} onChange={e=>setEnigmaAnswer(e.target.value)} placeholder="Sua Resposta..." className="w-full bg-[#05030a] border border-fuchsia-500/30 rounded-2xl px-6 py-5 text-white font-black outline-none focus:border-fuchsia-400 focus:shadow-[0_0_20px_rgba(217,70,239,0.3)] transition-all text-sm uppercase tracking-widest" />
                                      <button type="submit" className="w-full bg-transparent border border-fuchsia-500 text-fuchsia-400 hover:bg-fuchsia-500 hover:text-white font-black py-4 rounded-2xl transition-all shadow-[0_0_20px_rgba(217,70,239,0.2)] hover:shadow-[0_0_30px_rgba(217,70,239,0.5)] text-xs uppercase tracking-widest flex items-center justify-center gap-3 group/btn">
                                          Decifrar <Key className="w-4 h-4 group-hover/btn:rotate-45 transition-transform" />
                                      </button>
                                   </form>
                                   <p className="text-center mt-6 text-[10px] text-gray-500 font-black uppercase tracking-[0.3em]">Tentativas Restantes: <span className="text-fuchsia-500 text-sm ml-2">{userProfileData.activeMission.attemptsLeft}</span></p>
                                </div>
                            )}

                            <div className="flex flex-col sm:flex-row items-center justify-between border-t border-white/10 pt-8 relative z-10 gap-6">
                               <div className="flex gap-8 bg-black/40 px-6 py-3 rounded-2xl border border-white/5">
                                  <span className="flex items-center gap-2 text-cyan-400 font-black text-sm uppercase tracking-widest"><Sparkles className="w-4 h-4 text-cyan-400 drop-shadow-[0_0_10px_#22d3ee]"/> +{userProfileData.activeMission.rewardXp} XP</span>
                                  <span className="flex items-center gap-2 text-amber-400 font-black text-sm uppercase tracking-widest"><div className="w-3 h-3 rounded-full bg-amber-400 shadow-[0_0_10px_#facc15]"></div> +{userProfileData.activeMission.rewardCoins} M</span>
                               </div>
                               <button onClick={cancelMission} className="text-[10px] text-red-500 hover:text-red-400 hover:bg-red-950/20 px-4 py-2 rounded-xl font-black uppercase tracking-[0.2em] transition-colors flex items-center gap-2 border border-transparent hover:border-red-900/50"><Skull className="w-4 h-4"/> Abortar</button>
                            </div>
                        </div>
                    ) : (
                        <div className="space-y-8">
                            {isForgingMission ? (
                                <div className="bg-white/[0.02] border border-cyan-500/30 p-20 rounded-[3rem] flex flex-col items-center justify-center text-center max-w-3xl mx-auto shadow-[0_0_50px_rgba(34,211,238,0.15)] relative overflow-hidden">
                                   <div className="absolute inset-0 bg-gradient-to-t from-cyan-900/20 to-transparent animate-pulse"></div>
                                   <Loader2 className="w-12 h-12 text-cyan-400 animate-spin mb-8 relative z-10 drop-shadow-[0_0_15px_#22d3ee]" />
                                   <h3 className="text-2xl font-black text-white mb-3 uppercase tracking-widest relative z-10">Buscando Frequência...</h3>
                                   <p className="text-xs text-cyan-500/80 font-bold uppercase tracking-[0.4em] relative z-10">Sincronizando com o Abismo.</p>
                                </div>
                            ) : (
                                <>
                                    <div className="text-center max-w-3xl mx-auto mb-16">
                                        <h2 className="text-4xl md:text-5xl font-black text-transparent bg-clip-text bg-gradient-to-r from-white to-cyan-500 mb-6 uppercase tracking-tighter drop-shadow-lg">Painel de <span className="text-fuchsia-500">Contratos</span></h2>
                                        <p className="text-gray-400 text-sm md:text-base leading-relaxed font-medium">Selecione uma patente. O sistema forjará um desafio aleatório baseado nos registros da biblioteca. Risco e recompensa andam juntos.</p>
                                    </div>
                                    
                                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 max-w-6xl mx-auto">
                                        {RANK_CARDS.map(rId => {
                                            const r = rankConfigs[rId];
                                            return (
                                                <div key={rId} className={`bg-white/[0.02] backdrop-blur-md border ${r.border} ${r.glow} p-8 md:p-10 rounded-[2.5rem] flex flex-col justify-between transition-all duration-500 hover:-translate-y-2 group relative overflow-hidden`}>
                                                    <div className="absolute top-[-50px] right-[-50px] w-32 h-32 bg-white/5 blur-[30px] rounded-full group-hover:scale-150 transition-transform duration-700 pointer-events-none"></div>
                                                    <div className="mb-10 relative z-10">
                                                        <h3 className={`text-3xl font-black tracking-tighter uppercase mb-8 ${r.color} drop-shadow-md`}>{rId}</h3>
                                                        <div className="space-y-4">
                                                            <div className="flex items-center justify-between text-xs font-black uppercase tracking-widest bg-black/40 px-4 py-2.5 rounded-xl border border-white/5">
                                                                <span className="text-gray-500">Poder</span>
                                                                <span className="text-white flex items-center gap-2"><Sparkles className={`w-4 h-4 ${r.color} opacity-80`}/> {r.rxp} XP</span>
                                                            </div>
                                                            <div className="flex items-center justify-between text-xs font-black uppercase tracking-widest bg-black/40 px-4 py-2.5 rounded-xl border border-white/5">
                                                                <span className="text-gray-500">Tesouro</span>
                                                                <span className="text-white flex items-center gap-2"><div className="w-3 h-3 rounded-full bg-amber-400 opacity-80 shadow-[0_0_8px_#fbbf24]"></div> {r.rcoin} M</span>
                                                            </div>
                                                        </div>
                                                    </div>
                                                    <button onClick={() => setConfirmModal(rId)} className={`w-full py-4 rounded-xl font-black text-[10px] uppercase tracking-[0.2em] transition-all bg-transparent border border-white/20 text-white hover:bg-white hover:text-black hover:shadow-[0_0_20px_rgba(255,255,255,0.4)] relative z-10`}>
                                                        Firmar Pacto
                                                    </button>
                                                </div>
                                            )
                                        })}
                                    </div>
                                </>
                            )}
                        </div>
                    )}
                </div>
            )}

            {/* CONTEÚDO: FORJA */}
            {activeTab === "Forja" && (
                <div className="animate-in fade-in duration-500 max-w-2xl mx-auto mt-10 relative z-10">
                    <div className="bg-white/[0.02] backdrop-blur-2xl border border-cyan-500/30 p-10 md:p-16 rounded-[3rem] text-center shadow-[0_30px_60px_rgba(0,0,0,0.8)] relative overflow-hidden">
                        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-80 h-80 bg-cyan-600/20 blur-[100px] rounded-full pointer-events-none animate-pulse"></div>
                        <Hexagon className="w-20 h-20 mx-auto mb-10 text-cyan-400 opacity-90 animate-[spin_10s_linear_infinite] relative z-10 drop-shadow-[0_0_25px_#22d3ee]" />
                        <h2 className="text-3xl md:text-5xl font-black text-white mb-6 relative z-10 uppercase tracking-tighter drop-shadow-xl">Fornalha <span className="text-cyan-500">Cósmica</span></h2>
                        <p className="text-gray-400 text-sm mb-12 leading-relaxed font-medium relative z-10">Sintetize <b className="text-cyan-400 font-black">5 Cristais</b> encontrados durante a leitura. Recompensas massivas aguardam, mas a anomalia possui <span className="text-red-500 font-black">40% de chance</span> de desintegrar os materiais.</p>
                        <div className="bg-[#020105]/80 border border-white/10 rounded-3xl p-8 mb-12 shadow-inner relative z-10 max-w-xs mx-auto">
                            <span className="text-[10px] uppercase font-black text-gray-500 tracking-[0.3em] mb-4 block">Energia Armazenada</span>
                            <div className="flex items-center justify-center gap-4 text-5xl font-black text-white drop-shadow-[0_0_15px_rgba(255,255,255,0.5)]">
                                {userProfileData.crystals || 0} <Hexagon className="w-10 h-10 text-cyan-500 drop-shadow-[0_0_10px_#22d3ee]" />
                            </div>
                        </div>
                        <button onClick={runSynthesis} disabled={synthesizing || (userProfileData.crystals || 0) < 5} className="w-full bg-transparent border-2 border-cyan-500 text-cyan-400 hover:bg-cyan-500 hover:text-black disabled:bg-transparent disabled:border-white/5 disabled:text-gray-600 font-black py-5 px-8 rounded-2xl transition-all duration-300 relative z-10 text-xs uppercase tracking-widest flex items-center justify-center gap-3 shadow-[0_0_20px_rgba(34,211,238,0.2)] hover:shadow-[0_0_40px_rgba(34,211,238,0.6)] disabled:shadow-none">
                            {synthesizing ? <><Loader2 className="w-5 h-5 animate-spin" /> Fundindo Matéria...</> : 'Iniciar Fusão (Custa 5)'}
                        </button>
                    </div>
                </div>
            )}

            {/* CONTEÚDO: LOJA (FOCO 100% NOS DADOS NOVOS) */}
            {activeTab === "Loja" && (
                <div className="animate-in fade-in duration-500 relative z-10">
                    <div className="flex flex-col sm:flex-row justify-between items-center gap-8 mb-12 max-w-7xl mx-auto bg-white/[0.02] p-8 rounded-[2rem] border border-white/5 backdrop-blur-md">
                        <div className="text-center sm:text-left">
                            <h3 className="text-3xl font-black text-white mb-2 uppercase tracking-tight">Mercado <span className="text-fuchsia-500">Astral</span></h3>
                            <p className="text-gray-400 text-xs font-bold uppercase tracking-widest">Forje sua identidade visual no vazio.</p>
                        </div>
                        <div className="bg-black/60 border border-amber-500/30 text-amber-400 font-black px-8 py-4 rounded-2xl flex items-center gap-3 text-lg shadow-[0_0_20px_rgba(245,158,11,0.2)]">
                            <div className="w-4 h-4 rounded-full bg-amber-400 shadow-[0_0_10px_#fbbf24]"></div>
                            {userProfileData.coins || 0}
                        </div>
                    </div>
                      
                    <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-5 max-w-7xl mx-auto">
                        {shopItems.filter(item => item.ativo !== false).map(item => {
                          const hasItem = userProfileData.inventory?.includes(item.id);
                          
                          // Lógica Simples e Direta (Lê apenas os dados novos gerados pelo seu Painel)
                          const cat = item.tipo || '';
                          const itemName = item.nome || 'Item Desconhecido';
                          const itemPrice = item.preco || 0;
                          const itemRarity = item.raridade || 'Comum';
                          const itemUrl = item.url || '';
                          const itemCode = item.codigo || '';
                          const itemText = item.texto || '';

                          const isEquipped = userProfileData.equipped_items?.[cat]?.id === item.id;

                          return (
                            <div key={item.id} className={`bg-[#05030a] border p-6 rounded-[2rem] flex flex-col items-center text-center transition-all duration-500 group relative overflow-hidden ${isEquipped ? 'border-fuchsia-500/50 shadow-[0_0_30px_rgba(217,70,239,0.2)]' : 'border-white/5 hover:border-cyan-500/40 hover:shadow-[0_0_20px_rgba(34,211,238,0.2)]'}`}>
                              {isEquipped && <div className="absolute inset-0 bg-fuchsia-500/5 pointer-events-none"></div>}
                              
                              <div className="w-28 h-28 rounded-2xl mb-6 bg-[#020105] flex items-center justify-center overflow-hidden border border-white/5 relative flex-shrink-0 shadow-inner">
                                
                                {itemCode ? (
                                    <iframe srcDoc={itemCode} title={itemName} className="w-full h-full border-none pointer-events-none scale-110" scrolling="no" />
                                ) : itemText ? (
                                    <span className="text-xl font-black text-transparent bg-clip-text bg-gradient-to-br from-white to-zinc-500 uppercase tracking-widest text-center px-2">
                                        {itemText}
                                    </span>
                                ) : itemUrl ? (
                                    <img src={itemUrl} alt={itemName} className={`w-full h-full transition-all duration-700 group-hover:scale-110 ${['avatar', 'capa_fundo'].includes(cat) ? 'object-cover grayscale-[0.4] group-hover:grayscale-0' : 'object-contain'}`} />
                                ) : (
                                    <Sparkles className="w-8 h-8 text-gray-600 relative z-10"/>
                                )}
                              </div>

                              <p className={`text-[8px] uppercase tracking-[0.2em] font-black mb-2 px-2 py-1 rounded bg-black/40 border border-white/5 relative z-10 ${getRarityColor(itemRarity)}`}>
                                {cat.replace('_', ' ')}
                              </p>
                              <h4 className="text-white font-black mb-6 text-sm line-clamp-1 relative z-10">{itemName}</h4>
                              
                              {hasItem ? (
                                <button onClick={() => equipItem(item)} className={`w-full font-black py-3 rounded-xl transition-all text-[10px] uppercase tracking-widest relative z-10 ${isEquipped ? 'bg-fuchsia-500/20 text-fuchsia-400 border border-fuchsia-500/50 hover:bg-fuchsia-500 hover:text-white' : 'bg-transparent text-gray-400 hover:text-cyan-400 hover:border-cyan-500/50 border border-white/10'}`}>
                                    {isEquipped ? 'Desequipar' : 'Equipar'}
                                </button>
                              ) : (
                                <button onClick={() => buyItem(item)} className="w-full bg-gradient-to-r from-amber-500 to-yellow-500 text-black font-black py-3 rounded-xl transition-transform hover:scale-105 text-[10px] uppercase tracking-widest shadow-[0_0_15px_rgba(245,158,11,0.4)] relative z-10">
                                    Comprar • {itemPrice}
                                </button>
                              )}
                            </div>
                          );
                        })}
                    </div>
                </div>
            )}

            {/* CONTEÚDO: RANKING */}
            {activeTab === "Ranking" && (
                <div className="animate-in fade-in duration-500 max-w-5xl mx-auto relative z-10">
                    <div className="text-center mb-16">
                        <h2 className="text-4xl md:text-5xl font-black text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 to-fuchsia-500 mb-4 uppercase tracking-tighter drop-shadow-xl">Hierarquia <span className="text-white">Global</span></h2>
                        <p className="text-gray-400 text-xs font-bold uppercase tracking-[0.3em]">As entidades supremas da plataforma.</p>
                    </div>
                    
                    {loadingRank ? (
                        <div className="flex flex-col items-center justify-center py-24"><Loader2 className="w-12 h-12 text-cyan-500 animate-spin mb-6 drop-shadow-[0_0_15px_#22d3ee]"/><p className="text-cyan-400 text-[10px] font-black uppercase tracking-[0.4em]">Sincronizando Matriz...</p></div>
                    ) : rankingList.length === 0 ? (
                        <p className="text-center text-gray-600 py-20 font-black uppercase tracking-[0.2em] text-sm">O ranking aguarda os primeiros conquistadores.</p>
                    ) : (
                        <div className="space-y-4">
                            {rankingList.map((player, index) => (
                                <div key={player.id} className={`bg-white/[0.02] backdrop-blur-md border p-5 sm:p-6 rounded-[2rem] flex items-center gap-4 sm:gap-8 transition-all duration-500 hover:scale-[1.02] ${index < 3 ? 'border-cyan-500/30 shadow-[0_0_25px_rgba(34,211,238,0.15)] bg-gradient-to-r from-cyan-900/10 to-transparent' : 'border-white/5 hover:bg-white/[0.05] hover:border-white/10'}`}>
                                    <div className={`w-8 sm:w-12 font-black text-center text-lg sm:text-2xl drop-shadow-md ${index === 0 ? 'text-amber-400' : index === 1 ? 'text-gray-300' : index === 2 ? 'text-amber-700' : 'text-gray-600'}`}>
                                        #{index + 1}
                                    </div>
                                    
                                    {/* Exibição do Avatar no Ranking (Usa apenas a imagem) */}
                                    <div className="relative w-12 h-12 sm:w-16 sm:h-16 rounded-full flex items-center justify-center flex-shrink-0 group">
                                        <div className="w-full h-full rounded-full overflow-hidden border border-white/10 relative z-10 bg-[#020105]">
                                            <img src={player.equipped_items?.avatar?.url || player.avatarUrl || `https://placehold.co/100x100/020105/22d3ee?text=${player.displayName?.charAt(0) || 'U'}`} className="w-full h-full object-cover z-0" onError={(e)=>e.target.src=`https://placehold.co/100x100/020105/22d3ee?text=${player.displayName?.charAt(0) || 'U'}`} />
                                        </div>
                                    </div>

                                    <div className="flex-1 min-w-0">
                                        <h4 className={`font-black text-base sm:text-lg truncate uppercase tracking-wider ${index < 3 ? 'text-white' : 'text-gray-300'}`}>{player.displayName || "Entidade Oculta"}</h4>
                                        <p className="text-[10px] text-cyan-500 font-bold uppercase tracking-[0.2em] truncate mt-1">{getLevelTitle(player.level)}</p>
                                    </div>
                                    <div className="text-right flex-shrink-0 flex flex-col items-end">
                                        <div className="text-[10px] font-black text-white bg-black/50 border border-white/10 px-4 py-1.5 rounded-xl uppercase tracking-widest">Nível {player.level}</div>
                                        <div className="text-[10px] text-fuchsia-400 font-black mt-2 uppercase tracking-widest">{player.xp} XP</div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
                </div>
            )}
        </div>
    );
}
