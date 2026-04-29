import React, { useState, useEffect } from 'react';
import { Target, Hexagon, ShoppingCart, Trophy, Timer, Skull, Zap, Loader2, Wand2, ArrowRight, Key, Sparkles, Moon, Flame, AlertTriangle } from 'lucide-react';
import { doc, updateDoc, collectionGroup, getDocs, query, setDoc, arrayUnion } from "firebase/firestore";
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

    // NOVA STATE PARA AS ABAS DA LOJA
    const [shopCategory, setShopCategory] = useState('avatar');

    const rankConfigs = {
        'Rank E': { rxp: 30, rcoin: 15, pxp: 15, pcoin: 10, time: 15, charLimit: 300, enigmaTries: 3, color: 'text-gray-400', border: 'border-gray-500/30' },
        'Rank C': { rxp: 100, rcoin: 50, pxp: 50, pcoin: 25, time: 10, charLimit: 200, enigmaTries: 3, color: 'text-emerald-400', border: 'border-emerald-500/30' },
        'Rank B': { rxp: 150, rcoin: 80, pxp: 80, pcoin: 40, time: 8, charLimit: 120, enigmaTries: 2, color: 'text-blue-400', border: 'border-blue-500/30' },
        'Rank A': { rxp: 300, rcoin: 150, pxp: 150, pcoin: 80, time: 5, charLimit: 80, enigmaTries: 2, color: 'text-amber-500', border: 'border-amber-500/40' },
        'Rank S': { rxp: 800, rcoin: 400, pxp: 400, pcoin: 200, time: 3, charLimit: 60, enigmaTries: 1, color: 'text-orange-500', border: 'border-orange-500/50' },
        'Rank SSS':{ rxp: 2000, rcoin: 1000, pxp: 1000, pcoin: 500, time: 1, charLimit: 40, enigmaTries: 1, color: 'text-red-600', border: 'border-red-600/60' }
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
            showToast("Falha na Matriz Sombria. O Ranking não pôde ser carregado.", "error");
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

            if (mangas && mangas.length > 0) {
                const randomManga = mangas[Math.floor(Math.random() * mangas.length)];

                if (chosenType === 'search_visual' && randomManga.synopsis && randomManga.synopsis.length > 30) {
                    let cleanDesc = randomManga.synopsis.replace(/<[^>]*>?/gm, '').replace(new RegExp(randomManga.title, 'gi'), '█████');
                    let genres = randomManga.genres ? randomManga.genres.join(', ') : 'Desconhecidos';
                    let q = `[ ECO DAS SOMBRAS DETECTADO ]\n\nAssinatura de Gêneros: ${genres}\n\nFragmento Corrompido:\n"${cleanDesc.substring(0, conf.charLimit)}..."\n\nLocalize a origem deste eco no catálogo e acesse a página da obra.`;
                    
                    newMission = { id: Date.now().toString(), type: 'search_local', difficulty, title: "Caçada Abissal", question: q, targetManga: randomManga.id, rewardXp: conf.rxp, rewardCoins: conf.rcoin, penaltyXp: conf.pxp, penaltyCoins: conf.pcoin, deadline: now + (conf.time * 60 * 1000) };
                
                } else if (chosenType === 'enigma') {
                    let q = `[ MISTÉRIO DE SANGUE ]\n\nAnalisando fragmentos da Biblioteca...\n\n`;
                    if (randomManga.author) q += `• Autoria Registrada: ${randomManga.author}\n`;
                    if (randomManga.genres && randomManga.genres.length > 0) q += `• Espectro: ${randomManga.genres.slice(0,3).join(', ')}\n`;
                    q += `\nQual é a nomenclatura exata desta anomalia?`;
                    newMission = { id: Date.now().toString(), type: 'enigma', difficulty, title: "Enigma do Vazio", question: q, answer: [randomManga.title.toLowerCase().trim()], attemptsLeft: conf.enigmaTries, rewardXp: conf.rxp, rewardCoins: conf.rcoin, penaltyXp: conf.pxp, penaltyCoins: conf.pcoin, deadline: now + (conf.time * 60 * 1000) };
                
                } else {
                    let readTarget = difficulty === 'Rank E' ? 1 : difficulty === 'Rank C' ? 2 : difficulty === 'Rank B' ? 3 : difficulty === 'Rank A' ? 5 : difficulty === 'Rank S' ? 10 : 20;
                    if(randomManga.chapters && randomManga.chapters.length < readTarget) readTarget = randomManga.chapters.length || 1;
                    newMission = { id: Date.now().toString(), type: 'read', difficulty, title: `Extração de Sangue`, desc: `Faça a leitura de ${readTarget} capítulo(s) da obra "${randomManga.title}".`, targetManga: randomManga.id, targetCount: readTarget, currentCount: 0, rewardXp: conf.rxp, rewardCoins: conf.rcoin, penaltyXp: conf.pxp, penaltyCoins: conf.pcoin, deadline: now + (readTarget * 45 * 60 * 1000) };
                }
            }

            if (newMission) {
                await updateDoc(doc(db, 'artifacts', APP_ID, 'users', user.uid, 'profile', 'main'), { activeMission: newMission, completedMissions: completed });
                showToast(`Pacto Selado. O relógio das sombras começou.`, "success");
            } else {
                showToast("Sem anomalias no radar no momento.", "error");
            }
        } catch(e) { showToast("Falha crítica ao gerar contrato sombrio.", "error"); } finally { setIsForgingMission(false); }
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
               showToast(`Falha Absoluta. O Sangue foi cobrado.`, "error");
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
        <div className={`pb-24 animate-in fade-in duration-500 relative font-sans min-h-screen text-gray-200 ${equipped.tema_perfil ? equipped.tema_perfil.cssClass : 'bg-[#030305]'}`}>
            
            {/* Fundo Cósmico Sombrio Kage */}
            {!equipped.tema_perfil && <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-red-900/10 via-[#030305] to-[#000000] pointer-events-none z-0"></div>}

            {/* MODAL DE CONFIRMAÇÃO DE MISSÃO */}
            {confirmModal && (
                <div className="fixed inset-0 z-[3000] bg-[#030305]/90 backdrop-blur-xl flex items-center justify-center p-4 animate-in fade-in duration-300" onClick={() => setConfirmModal(null)}>
                    <div className="bg-[#0a0a0c] border border-red-600/50 p-8 rounded-[2rem] shadow-[0_0_40px_rgba(220,38,38,0.2)] max-w-md w-full text-center relative overflow-hidden" onClick={e => e.stopPropagation()}>
                        <Target className="w-16 h-16 text-red-500 mx-auto mb-6 animate-pulse drop-shadow-[0_0_15px_rgba(220,38,38,0.5)]" />
                        <h3 className="text-2xl font-black text-white mb-2 tracking-widest uppercase">Firmar Pacto de Sangue?</h3>
                        <p className="text-xs text-gray-400 font-bold px-2 mb-6 uppercase tracking-wider">A desistência ou falha resultará em severas punições do Sistema Kage.</p>
                        
                        <div className="bg-red-950/40 border border-red-500/30 rounded-2xl p-5 mb-8">
                            <p className="text-[10px] text-red-500 uppercase tracking-[0.3em] font-black mb-2">Preço da Falha</p>
                            <p className="text-xl font-black text-white">-{rankConfigs[confirmModal]?.pxp} XP <span className="text-gray-600 px-2">|</span> -{rankConfigs[confirmModal]?.pcoin} M</p>
                        </div>
                        
                        <div className="flex gap-4">
                            <button onClick={() => setConfirmModal(null)} className="flex-1 bg-transparent border border-white/10 text-gray-400 font-black py-4 rounded-xl hover:bg-white/5 hover:text-white transition-colors text-xs uppercase tracking-widest">Recuar</button>
                            <button onClick={() => triggerForgeMission(confirmModal)} className="flex-1 bg-red-600 text-white shadow-[0_0_15px_rgba(220,38,38,0.3)] rounded-xl font-black py-4 transition-all hover:bg-red-500 text-xs uppercase tracking-widest">
                                Aceitar
                            </button>
                        </div>
                    </div>
                </div>
            )}

            <div className="max-w-6xl mx-auto px-4 py-8 relative z-10 pt-8">
                {/* MENU DE ABAS */}
                <div className="flex justify-start sm:justify-center gap-3 mb-12 overflow-x-auto no-scrollbar pb-4 relative z-20 w-full px-2 snap-x">
                    {['Missões', 'Forja', 'Loja', 'Ranking'].map((tab) => (
                        <button 
                            key={tab}
                            onClick={() => setActiveTab(tab)} 
                            className={`snap-center flex-shrink-0 whitespace-nowrap px-6 py-3 rounded-full font-black transition-all flex items-center gap-2 text-[11px] uppercase tracking-wider border
                            ${activeTab === tab ? 'text-white border-transparent bg-red-600 shadow-[0_0_15px_rgba(220,38,38,0.4)]' : 'text-gray-500 border-white/5 hover:text-red-500 hover:border-red-600/30 bg-[#0a0a0c]/80'}`}
                        >
                            {tab === "Missões" && <Target className="w-4 h-4"/>}
                            {tab === "Forja" && <Flame className="w-4 h-4"/>}
                            {tab === "Loja" && <ShoppingCart className="w-4 h-4"/>}
                            {tab === "Ranking" && <Trophy className="w-4 h-4"/>}
                            {tab}
                        </button>
                    ))}
                </div>

                {/* CONTEÚDO: MISSÕES */}
                {activeTab === "Missões" && (
                    <div className="animate-in fade-in duration-500 relative z-10">
                        {userProfileData.activeMission ? (
                            <div className="bg-[#0a0a0c]/80 backdrop-blur-2xl border border-red-600/20 p-8 md:p-12 rounded-[3rem] shadow-xl relative overflow-hidden max-w-4xl mx-auto">
                                
                                <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 mb-10 relative z-10">
                                   <div>
                                      <span className={`text-[10px] font-black uppercase tracking-[0.3em] px-4 py-2 rounded-xl border ${rankConfigs[userProfileData.activeMission.difficulty].color} ${rankConfigs[userProfileData.activeMission.difficulty].border}`}>
                                        {userProfileData.activeMission.difficulty}
                                      </span>
                                      <h3 className="text-3xl md:text-5xl font-black text-white mt-6 tracking-tighter uppercase">{userProfileData.activeMission.title}</h3>
                                   </div>
                                   <div className="flex items-center gap-3 text-red-500 font-black bg-red-950/20 px-6 py-3 rounded-2xl border border-red-500/30 shadow-[0_0_15px_rgba(220,38,38,0.2)]">
                                       <Timer className="w-5 h-5 animate-pulse" /> <span className="tracking-[0.2em] text-sm md:text-base">{timeLeft}</span>
                                   </div>
                                </div>
                                
                                {userProfileData.activeMission.type === 'read' && (
                                    <div className="bg-[#030305]/80 p-8 rounded-3xl border border-white/5 mb-10 relative z-10 shadow-inner">
                                       <p className="text-gray-300 font-bold text-sm md:text-base mb-8 leading-relaxed uppercase tracking-wider">{userProfileData.activeMission.desc}</p>
                                       
                                       <div className="w-full bg-[#0a0a0c] rounded-full h-3 overflow-hidden mb-4 border border-white/5">
                                           <div className="bg-red-600 h-full transition-all duration-1000 ease-out relative shadow-[0_0_10px_rgba(220,38,38,0.8)]" style={{width: `${(userProfileData.activeMission.currentCount / userProfileData.activeMission.targetCount) * 100}%`}}>
                                           </div>
                                       </div>
                                       <div className="flex justify-between text-[10px] text-red-500 font-black tracking-[0.2em] uppercase">
                                           <span>Sangue Extraído</span>
                                           <span>{userProfileData.activeMission.currentCount} / {userProfileData.activeMission.targetCount} Caps</span>
                                       </div>

                                       <button onClick={() => { const m = mangas.find(mg => mg.id === userProfileData.activeMission.targetManga); if(m) onNavigate('details', m); }} className="w-full mt-10 bg-transparent border border-red-600 text-red-500 hover:bg-red-600 hover:text-white rounded-2xl font-black py-4 flex items-center justify-center gap-3 transition-all text-xs uppercase tracking-widest group/btn">
                                           Rastrear Alvo <ArrowRight className="w-4 h-4 group-hover/btn:translate-x-2 transition-transform" />
                                       </button>
                                    </div>
                                )}

                                {userProfileData.activeMission.type === 'search_local' && (
                                    <div className="bg-[#030305]/80 p-8 rounded-3xl border border-white/5 mb-10 relative z-10 shadow-inner">
                                        <p className="text-gray-100 font-bold text-sm leading-relaxed whitespace-pre-wrap tracking-wider uppercase">{userProfileData.activeMission.question}</p>
                                    </div>
                                )}
                                
                                {userProfileData.activeMission.type === 'enigma' && (
                                    <div className="bg-[#030305]/80 p-8 rounded-3xl border border-white/5 mb-10 relative z-10 shadow-inner">
                                       <p className="text-gray-100 font-bold text-sm leading-relaxed whitespace-pre-wrap mb-8 uppercase tracking-wider">{userProfileData.activeMission.question}</p>
                                       <form onSubmit={handleEnigmaSubmit} className="flex flex-col gap-4">
                                          <input type="text" value={enigmaAnswer} onChange={e=>setEnigmaAnswer(e.target.value)} placeholder="Sua Resposta..." className="w-full bg-[#0a0a0c] border border-red-600/30 rounded-2xl px-6 py-5 text-white font-black outline-none focus:border-red-600 transition-all text-sm uppercase tracking-widest shadow-inner" />
                                          <button type="submit" className="w-full bg-transparent border border-red-600 text-red-500 hover:bg-red-600 hover:text-white rounded-2xl font-black py-4 transition-all text-xs uppercase tracking-widest flex items-center justify-center gap-3 group/btn">
                                              Decifrar <Key className="w-4 h-4 group-hover/btn:rotate-45 transition-transform" />
                                          </button>
                                       </form>
                                       <p className="text-center mt-6 text-[10px] text-gray-500 font-black uppercase tracking-[0.3em]">Tentativas Restantes: <span className="text-red-500 text-sm ml-2">{userProfileData.activeMission.attemptsLeft}</span></p>
                                    </div>
                                )}

                                <div className="flex flex-col sm:flex-row items-center justify-between border-t border-red-900/30 pt-8 relative z-10 gap-6">
                                   <div className="flex gap-8 bg-[#030305] rounded-xl px-6 py-3 border border-white/5">
                                      <span className="flex items-center gap-2 text-white font-black text-sm uppercase tracking-widest"><Sparkles className="w-4 h-4 text-white"/> +{userProfileData.activeMission.rewardXp} XP</span>
                                      <span className="flex items-center gap-2 text-amber-500 font-black text-sm uppercase tracking-widest"><div className="w-3 h-3 rounded-full bg-amber-500"></div> +{userProfileData.activeMission.rewardCoins} M</span>
                                   </div>
                                   <button onClick={cancelMission} className="text-[10px] text-red-500 hover:text-red-400 hover:bg-red-950/20 px-4 py-3 rounded-xl font-black uppercase tracking-[0.2em] transition-colors flex items-center gap-2 border border-transparent hover:border-red-900/50"><Skull className="w-4 h-4"/> Abortar Pacto</button>
                                </div>
                            </div>
                        ) : (
                            <div className="space-y-8">
                                {isForgingMission ? (
                                    <div className="bg-[#0a0a0c]/80 border border-red-600/30 rounded-[3rem] p-20 flex flex-col items-center justify-center text-center max-w-3xl mx-auto relative overflow-hidden shadow-[0_0_50px_rgba(220,38,38,0.15)]">
                                       <Flame className="w-12 h-12 text-red-600 animate-pulse mb-8 relative z-10 drop-shadow-[0_0_15px_rgba(220,38,38,0.8)]" />
                                       <h3 className="text-2xl font-black text-white mb-3 uppercase tracking-widest relative z-10">Invocando as Sombras...</h3>
                                       <p className="text-xs text-red-500/80 font-bold uppercase tracking-[0.4em] relative z-10">Sincronizando com o Sistema Kage.</p>
                                    </div>
                                ) : (
                                    <>
                                        <div className="text-center max-w-3xl mx-auto mb-16">
                                            <h2 className="text-4xl md:text-5xl font-black text-white mb-6 uppercase tracking-tighter">Painel de <span className="text-red-600">Pactos</span></h2>
                                            <p className="text-gray-400 text-sm md:text-base leading-relaxed font-medium">Selecione uma patente. O sistema forjará um desafio aleatório baseado nos registros das sombras. Sangue e recompensa andam juntos.</p>
                                        </div>
                                        
                                        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 max-w-6xl mx-auto">
                                            {RANK_CARDS.map(rId => {
                                                const r = rankConfigs[rId];
                                                return (
                                                    <div key={rId} className={`bg-[#0a0a0c]/80 backdrop-blur-md border ${r.border} rounded-3xl p-8 md:p-10 flex flex-col justify-between transition-all duration-500 hover:-translate-y-2 hover:shadow-[0_15px_30px_rgba(0,0,0,0.8)] group relative overflow-hidden`}>
                                                        <div className="mb-10 relative z-10">
                                                            <h3 className={`text-3xl font-black tracking-tighter uppercase mb-8 ${r.color} drop-shadow-md`}>{rId}</h3>
                                                            <div className="space-y-4">
                                                                <div className="flex items-center justify-between text-xs font-black uppercase tracking-widest bg-[#030305] rounded-xl px-4 py-3 border border-white/5">
                                                                    <span className="text-gray-500">Poder</span>
                                                                    <span className="text-white flex items-center gap-2"><Sparkles className={`w-4 h-4 ${r.color} opacity-80`}/> {r.rxp} XP</span>
                                                                </div>
                                                                <div className="flex items-center justify-between text-xs font-black uppercase tracking-widest bg-[#030305] rounded-xl px-4 py-3 border border-white/5">
                                                                    <span className="text-gray-500">Tesouro</span>
                                                                    <span className="text-white flex items-center gap-2"><div className="w-3 h-3 rounded-full bg-amber-500 opacity-80"></div> {r.rcoin} M</span>
                                                                </div>
                                                            </div>
                                                        </div>
                                                        <button onClick={() => setConfirmModal(rId)} className={`w-full py-4 rounded-2xl font-black text-[10px] uppercase tracking-[0.2em] transition-all bg-transparent border border-white/20 text-white hover:bg-red-600 hover:border-red-600 relative z-10`}>
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
                        <div className="bg-[#0a0a0c]/80 backdrop-blur-2xl border border-red-600/30 rounded-[3rem] p-10 md:p-16 text-center relative overflow-hidden shadow-[0_0_40px_rgba(220,38,38,0.15)]">
                            <Flame className="w-20 h-20 mx-auto mb-10 text-red-600 opacity-90 animate-pulse relative z-10 drop-shadow-[0_0_20px_rgba(220,38,38,0.8)]" />
                            <h2 className="text-3xl md:text-5xl font-black text-white mb-6 relative z-10 uppercase tracking-tighter">Fornalha <span className="text-red-600">de Sangue</span></h2>
                            <p className="text-gray-400 text-sm mb-12 leading-relaxed font-medium relative z-10">Sintetize <b className="text-red-500 font-black">5 Cristais Nexo</b>. Recompensas massivas aguardam, mas a magia proibida possui <span className="text-red-600 font-black">40% de chance</span> de desintegrar os materiais.</p>
                            <div className="bg-[#030305]/80 border border-white/10 rounded-3xl p-8 mb-12 relative z-10 max-w-xs mx-auto shadow-inner">
                                <span className="text-[10px] uppercase font-black text-gray-500 tracking-[0.3em] mb-4 block">Essência Armazenada</span>
                                <div className="flex items-center justify-center gap-4 text-5xl font-black text-white drop-shadow-md">
                                    {userProfileData.crystals || 0} <Hexagon className="w-10 h-10 text-blue-500" />
                                </div>
                            </div>
                            <button onClick={runSynthesis} disabled={synthesizing || (userProfileData.crystals || 0) < 5} className="w-full bg-transparent border-2 rounded-2xl border-red-600 text-red-500 hover:bg-red-600 hover:text-white disabled:bg-transparent disabled:border-white/5 disabled:text-gray-600 font-black py-5 px-8 transition-all duration-300 relative z-10 text-xs uppercase tracking-widest flex items-center justify-center gap-3">
                                {synthesizing ? <><Loader2 className="w-5 h-5 animate-spin" /> Fundindo Sangue...</> : 'Iniciar Ritual (Custa 5)'}
                            </button>
                        </div>
                    </div>
                )}

                {/* CONTEÚDO: LOJA (Refatorada, limpa e com Abas) */}
                {activeTab === "Loja" && (
                    <div className="animate-in fade-in duration-500 relative z-10 max-w-7xl mx-auto">
                        
                        <div className="flex flex-col sm:flex-row justify-between items-center gap-8 mb-10 bg-[#0a0a0c]/80 rounded-[2.5rem] p-8 border border-white/5 backdrop-blur-md shadow-lg">
                            <div className="text-center sm:text-left">
                                <h3 className="text-3xl font-black text-white mb-2 uppercase tracking-tight">Cosméticos <span className="text-red-600">Sombrios</span></h3>
                                <p className="text-gray-400 text-xs font-bold uppercase tracking-widest">Equipe seu acervo de relíquias.</p>
                            </div>
                            <div className="bg-[#030305] border rounded-2xl border-amber-500/30 text-amber-500 font-black px-8 py-4 flex items-center gap-3 text-lg shadow-inner">
                                <div className="w-4 h-4 rounded-full bg-amber-500"></div>
                                {userProfileData.coins || 0}
                            </div>
                        </div>

                        {/* SUB-ABAS DA LOJA */}
                        <div className="flex gap-4 overflow-x-auto no-scrollbar mb-10 pb-4 snap-x border-b border-red-900/30">
                            {[
                                { id: 'avatar', label: 'Avatar' },
                                { id: 'capa_fundo', label: 'Capa de Fundo' },
                                { id: 'moldura', label: 'Moldura' },
                                { id: 'nickname', label: 'Nickname' }
                            ].map(cat => (
                                <button
                                    key={cat.id}
                                    onClick={() => setShopCategory(cat.id)}
                                    className={`snap-start flex-shrink-0 px-6 py-3 rounded-xl font-black text-[10px] uppercase tracking-widest transition-all border ${
                                        shopCategory === cat.id
                                        ? 'bg-red-600 text-white border-red-500 shadow-[0_0_15px_rgba(220,38,38,0.4)]'
                                        : 'bg-[#050505] text-gray-500 border-white/5 hover:text-white hover:border-white/20'
                                    }`}
                                >
                                    {cat.label}
                                </button>
                            ))}
                        </div>
                          
                        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-5">
                            {shopItems.filter(item => {
                                const cat = (item.categoria || item.type || '').toLowerCase();
                                // Exibe os itens classificados como 'capa' na aba de 'capa_fundo'
                                if (shopCategory === 'capa_fundo') return cat === 'capa_fundo' || cat === 'capa';
                                return cat === shopCategory;
                            }).map(item => {
                              const hasItem = userProfileData.inventory?.includes(item.id);
                              
                              // Verifica se tá equipado baseado na categoria do item
                              const itemCat = item.categoria || item.type || '';
                              const isEquipped = userProfileData.equipped_items?.[itemCat]?.id === item.id || userProfileData.equipped_items?.['capa_fundo']?.id === item.id;
                              const cat = itemCat.toLowerCase();

                              return (
                                <div key={item.id} className={`bg-[#0a0a0c] border rounded-[2rem] p-6 flex flex-col items-center text-center transition-all duration-500 group relative overflow-hidden shadow-lg ${isEquipped ? 'border-red-600 bg-red-950/20' : 'border-white/5 hover:border-red-500/40'}`}>
                                  
                                  {(item.css || item.animacao || item.keyframes) && (
                                     <style dangerouslySetInnerHTML={{__html: `
                                        .${item.cssClass || 'custom-ia-class'} { ${item.css || ''} }
                                        ${item.animacao || item.keyframes || ''}
                                     `}} />
                                  )}

                                  <div className={`w-28 h-28 rounded-2xl mb-6 bg-[#030305] flex items-center justify-center overflow-hidden border border-white/5 relative flex-shrink-0 ${cat === 'avatar' ? (item.cssClass || 'custom-ia-class') : ''}`}>
                                    
                                    {(cat === 'capa_fundo' || cat === 'capa' || cat === 'tema_perfil') && cleanCosmeticUrl(item.preview) && (
                                        <img src={cleanCosmeticUrl(item.preview)} onError={(e)=>e.target.style.display='none'} className={`w-full h-full object-cover opacity-80 ${item.cssClass || 'custom-ia-class'}`} />
                                    )}

                                    {cat === 'moldura' && cleanCosmeticUrl(item.preview) && (
                                        <img src={cleanCosmeticUrl(item.preview)} onError={(e)=>e.target.style.display='none'} className={`absolute inset-0 w-full h-full object-cover z-20 pointer-events-none rounded-full scale-[1.15] ${item.cssClass || 'custom-ia-class'}`} style={{ mixBlendMode: 'screen' }} />
                                    )}

                                    {cat === 'avatar' && cleanCosmeticUrl(item.preview) && (
                                        <img src={cleanCosmeticUrl(item.preview)} onError={(e)=>e.target.style.display='none'} className={`w-full h-full object-cover group-hover:scale-110 transition-transform duration-700 relative z-10`} />
                                    )}

                                    {cat === 'nickname' && (
                                        <div className={`font-black text-xl z-20 ${item.cssClass || 'custom-ia-class'}`}>Kage</div>
                                    )}

                                    {(!item.preview && !['nickname'].includes(cat)) && (
                                        <Sparkles className="w-8 h-8 text-gray-700 relative z-10"/>
                                    )}
                                  </div>

                                  <p className={`text-[8px] uppercase tracking-[0.2em] font-black mb-3 px-3 py-1.5 rounded-lg bg-[#030305] border border-white/5 relative z-10 ${getRarityColor(item.raridade)}`}>
                                      {item.raridade || 'Comum'}
                                  </p>
                                  
                                  <h4 className="text-white font-black mb-6 text-sm line-clamp-1 relative z-10">{item.nome || item.name}</h4>
                                  
                                  {hasItem ? (
                                    <button onClick={() => equipItem(item)} className={`w-full rounded-xl font-black py-3 transition-all text-[10px] uppercase tracking-widest relative z-10 ${isEquipped ? 'bg-red-600 text-white shadow-[0_0_15px_rgba(220,38,38,0.4)]' : 'bg-transparent text-gray-400 hover:text-white hover:border-white/50 border border-white/10'}`}>{isEquipped ? 'Desequipar' : 'Equipar'}</button>
                                  ) : (
                                    <button onClick={() => buyItem(item)} className="w-full rounded-xl bg-amber-600 text-black hover:bg-amber-500 font-black py-3 transition-colors text-[10px] uppercase tracking-widest relative z-10">Comprar • {item.preco || item.price}</button>
                                  )}
                                </div>
                              )
                            })}
                        </div>
                    </div>
                )}

                {/* CONTEÚDO: RANKING */}
                {activeTab === "Ranking" && (
                    <div className="animate-in fade-in duration-500 max-w-5xl mx-auto relative z-10">
                        <div className="text-center mb-16">
                            <h2 className="text-4xl md:text-5xl font-black text-white mb-4 uppercase tracking-tighter">Hierarquia <span className="text-red-600">Sombria</span></h2>
                            <p className="text-gray-400 text-xs font-bold uppercase tracking-[0.3em]">Os líderes supremos da plataforma.</p>
                        </div>
                        
                        {loadingRank ? (
                            <div className="flex flex-col items-center justify-center py-24"><Loader2 className="w-12 h-12 text-red-600 animate-spin mb-6"/><p className="text-red-600 text-[10px] font-black uppercase tracking-[0.4em]">Sincronizando Sombras...</p></div>
                        ) : rankingList.length === 0 ? (
                            <p className="text-center text-gray-600 py-20 font-black uppercase tracking-[0.2em] text-sm">A hierarquia aguarda os primeiros ninjas.</p>
                        ) : (
                            <div className="space-y-4">
                                {rankingList.map((player, index) => (
                                    <div key={player.id} className={`bg-[#0a0a0c]/80 backdrop-blur-md rounded-3xl border p-5 sm:p-6 flex items-center gap-4 sm:gap-8 transition-all duration-500 hover:scale-[1.02] shadow-lg ${index < 3 ? 'border-red-600/40 bg-red-950/10 shadow-[0_0_20px_rgba(220,38,38,0.15)]' : 'border-white/5 hover:bg-white/[0.05] hover:border-white/10'}`}>
                                        <div className={`w-8 sm:w-12 font-black text-center text-lg sm:text-2xl ${index === 0 ? 'text-yellow-500 drop-shadow-[0_0_10px_rgba(234,179,8,0.8)]' : index === 1 ? 'text-gray-300' : index === 2 ? 'text-amber-700' : 'text-gray-600'}`}>
                                            #{index + 1}
                                        </div>
                                        
                                        <div className={`relative w-12 h-12 sm:w-16 sm:h-16 rounded-full flex items-center justify-center flex-shrink-0 group`}>
                                            
                                            {player.equipped_items?.avatar?.css && (
                                                <style dangerouslySetInnerHTML={{__html: `.${player.equipped_items.avatar.cssClass || 'custom-avatar'} { ${player.equipped_items.avatar.css} } \n ${player.equipped_items.avatar.animacao || player.equipped_items.avatar.keyframes || ''}`}} />
                                            )}
                                            {player.equipped_items?.moldura?.css && (
                                                <style dangerouslySetInnerHTML={{__html: `.${player.equipped_items.moldura.cssClass || 'custom-moldura'} { ${player.equipped_items.moldura.css} } \n ${player.equipped_items.moldura.animacao || player.equipped_items.moldura.keyframes || ''}`}} />
                                            )}

                                            <div className={`w-full h-full rounded-full overflow-hidden border border-[#030305] relative z-10 bg-[#030305] ${player.equipped_items?.avatar ? (player.equipped_items.avatar.cssClass || 'custom-avatar') : ''}`}>
                                                <img src={cleanCosmeticUrl(player.avatarUrl) || `https://placehold.co/100x100/030305/dc2626?text=${player.displayName?.charAt(0) || 'K'}`} className="w-full h-full object-cover z-0 relative" onError={(e)=>e.target.src=`https://placehold.co/100x100/030305/dc2626?text=${player.displayName?.charAt(0) || 'K'}`} />
                                            </div>
                                            
                                            {player.equipped_items?.moldura?.preview && (
                                                <img src={cleanCosmeticUrl(player.equipped_items.moldura.preview)} className={`absolute inset-[-10%] w-[120%] h-[120%] object-cover z-20 pointer-events-none max-w-none rounded-full ${player.equipped_items.moldura.cssClass || 'custom-moldura'}`} />
                                            )}
                                        </div>

                                        <div className="flex-1 min-w-0">
                                            {player.equipped_items?.nickname?.css && (
                                                <style dangerouslySetInnerHTML={{__html: `.${player.equipped_items.nickname.cssClass || 'custom-nick'} { ${player.equipped_items.nickname.css} } \n ${player.equipped_items.nickname.animacao || player.equipped_items.nickname.keyframes || ''}`}} />
                                            )}
                                            <h4 className={`font-black text-base sm:text-lg truncate uppercase tracking-wider ${index < 3 ? 'text-white' : 'text-gray-400'} ${player.equipped_items?.nickname ? (player.equipped_items.nickname.cssClass || 'custom-nick') : ''}`}>
                                                {player.displayName || "Entidade Oculta"}
                                            </h4>
                                            <p className="text-[10px] text-red-500 font-bold uppercase tracking-[0.2em] truncate mt-1">{getLevelTitle(player.level)}</p>
                                        </div>
                                        <div className="text-right flex-shrink-0 flex flex-col items-end">
                                            <div className="text-[10px] rounded-xl font-black text-white bg-[#030305] border border-white/5 px-4 py-2 uppercase tracking-widest">Nível {player.level}</div>
                                            <div className="text-[10px] text-red-500 font-black mt-2 uppercase tracking-widest">{player.xp} XP</div>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>
                )}
            </div>
        </div>
    );
}
