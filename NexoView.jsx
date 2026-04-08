import React, { useState, useEffect } from 'react';
import { Target, Hexagon, ShoppingCart, Trophy, Check, Compass, Timer, Star, Skull, Zap, Clock, Crown, Key, Loader2, ShieldAlert, Sparkles, User } from 'lucide-react';
import { doc, updateDoc, collectionGroup, getDocs, query } from "firebase/firestore";
import { db } from './firebase';
import { addXpLogic, removeXpLogic, getLevelTitle, getRarityColor } from './helpers';
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
        'Rank E': { rxp: 30, rcoin: 15, pxp: 15, pcoin: 10, time: 15, charLimit: 300, enigmaTries: 3 },
        'Rank C': { rxp: 100, rcoin: 50, pxp: 50, pcoin: 25, time: 10, charLimit: 200, enigmaTries: 3 },
        'Rank B': { rxp: 150, rcoin: 80, pxp: 80, pcoin: 40, time: 8, charLimit: 120, enigmaTries: 2 },
        'Rank A': { rxp: 300, rcoin: 150, pxp: 150, pcoin: 80, time: 5, charLimit: 80, enigmaTries: 2 },
        'Rank S': { rxp: 800, rcoin: 400, pxp: 400, pcoin: 200, time: 3, charLimit: 60, enigmaTries: 1 },
        'Rank SSS':{ rxp: 2000, rcoin: 1000, pxp: 1000, pcoin: 500, time: 1, charLimit: 40, enigmaTries: 1 }
    };

    const RANK_CARDS = [
        { id: 'Rank E', color: 'text-gray-400', border: 'border-gray-500/20', hover: 'hover:border-gray-500/50', btn: 'bg-gray-800 hover:bg-gray-700' },
        { id: 'Rank C', color: 'text-blue-500', border: 'border-blue-500/20', hover: 'hover:border-blue-500/50', btn: 'bg-blue-700 hover:bg-blue-600' },
        { id: 'Rank B', color: 'text-amber-500', border: 'border-amber-500/20', hover: 'hover:border-amber-500/50', btn: 'bg-amber-700 hover:bg-amber-600' },
        { id: 'Rank A', color: 'text-red-500', border: 'border-red-500/20', hover: 'hover:border-red-500/50', btn: 'bg-red-700 hover:bg-red-600' },
        { id: 'Rank S', color: 'text-fuchsia-500', border: 'border-fuchsia-500/20', hover: 'hover:border-fuchsia-500/50', btn: 'bg-fuchsia-700 hover:bg-fuchsia-600' },
        { id: 'Rank SSS', color: 'text-rose-500', border: 'border-rose-500/20', hover: 'hover:border-rose-500/50', btn: 'bg-gradient-to-r from-rose-700 to-purple-700 hover:from-rose-600 hover:to-purple-600' },
    ];

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
            showToast("Erro na Hierarquia Abissal.", "error");
        } finally {
            setLoadingRank(false);
        }
    };

    useEffect(() => {
        if (!userProfileData.activeMission) return;
        const updateTimer = () => {
            const diff = userProfileData.activeMission.deadline - Date.now();
            if (diff <= 0) { setTimeLeft("Expirado"); } else {
                const d = Math.floor(diff / (1000 * 60 * 60 * 24));
                const h = Math.floor((diff / (1000 * 60 * 60)) % 24);
                const m = Math.floor((diff / 1000 / 60) % 60);
                const s = Math.floor((diff / 1000) % 60);
                setTimeLeft(`${d > 0 ? d+'d ' : ''}${h > 0 || d > 0 ? h+'h ' : ''}${m}m ${s}s`);
            }
        };
        updateTimer();
        const interval = setInterval(updateTimer, 1000);
        return () => clearInterval(interval);
    }, [userProfileData.activeMission]);

    const triggerForgeMission = async (difficulty) => {
        setConfirmModal(null); setIsForgingMission(true);
        setTimeout(() => { generateMission(difficulty); }, 2500); 
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
                    let q = `[ECO DO VAZIO]\n\nGêneros: ${genres}\n\nFragmento:\n"${cleanDesc.substring(0, conf.charLimit)}..."\n\nRastreie esta obra no catálogo e acesse a página dela para concluir o contrato.`;
                    
                    newMission = { id: Date.now().toString(), type: 'search_local', difficulty, title: "Caçada Abissal", question: q, targetManga: randomManga.id, rewardXp: conf.rxp, rewardCoins: conf.rcoin, penaltyXp: conf.pxp, penaltyCoins: conf.pcoin, deadline: now + (conf.time * 60 * 1000) };
                
                } else if (chosenType === 'enigma') {
                    let q = `[MISTÉRIO DO ABISMO]\n\nAnalisando fragmentos da Biblioteca...\n`;
                    if (randomManga.author) q += `• Autoria rastreada: ${randomManga.author}\n`;
                    if (randomManga.genres && randomManga.genres.length > 0) q += `• Gêneros: ${randomManga.genres.slice(0,3).join(', ')}\n`;
                    q += `\nQual é o nome exato desta obra gravada no Infinito?`;
                    newMission = { id: Date.now().toString(), type: 'enigma', difficulty, title: "Enigma do Vazio", question: q, answer: [randomManga.title.toLowerCase().trim()], attemptsLeft: conf.enigmaTries, rewardXp: conf.rxp, rewardCoins: conf.rcoin, penaltyXp: conf.pxp, penaltyCoins: conf.pcoin, deadline: now + (conf.time * 60 * 1000) };
                
                } else {
                    let readTarget = difficulty === 'Rank E' ? 1 : difficulty === 'Rank C' ? 2 : difficulty === 'Rank B' ? 3 : difficulty === 'Rank A' ? 5 : difficulty === 'Rank S' ? 10 : 20;
                    if(randomManga.chapters && randomManga.chapters.length < readTarget) readTarget = randomManga.chapters.length || 1;
                    newMission = { id: Date.now().toString(), type: 'read', difficulty, title: `Exploração do Abismo`, desc: `Leia ${readTarget} capítulo(s) da obra "${randomManga.title}".`, targetManga: randomManga.id, targetCount: readTarget, currentCount: 0, rewardXp: conf.rxp, rewardCoins: conf.rcoin, penaltyXp: conf.pxp, penaltyCoins: conf.pcoin, deadline: now + (readTarget * 45 * 60 * 1000) };
                }
            }

            if (newMission) {
                await updateDoc(doc(db, 'artifacts', APP_ID, 'users', user.uid, 'profile', 'main'), { activeMission: newMission, completedMissions: completed });
                showToast(`Contrato do Abismo Assinado!`, "success");
            } else {
                showToast("O Abismo está vazio de contratos no momento.", "error");
            }
        } catch(e) { showToast("Falha na Matrix do Nexo.", "error"); } finally { setIsForgingMission(false); }
    };
    
    const handleEnigmaSubmit = async (e) => {
        e.preventDefault(); const m = userProfileData.activeMission;
        if (!m || m.type !== 'enigma') return;
        if (!enigmaAnswer.trim()) return showToast("A resposta não pode ser vazia.", "warning");
        const profileRef = doc(db, 'artifacts', APP_ID, 'users', user.uid, 'profile', 'main');
        const userAnswer = enigmaAnswer.toLowerCase().trim();
        const isCorrect = m.answer.some(ans => { const correctAns = ans.toLowerCase().trim(); return userAnswer === correctAns || (userAnswer.length >= 3 && (correctAns.includes(userAnswer) || userAnswer.includes(correctAns))); });
        
        if (isCorrect) {
           let { newXp, newLvl, didLevelUp } = addXpLogic(userProfileData.xp || 0, userProfileData.level || 1, m.rewardXp);
           let newCoins = (userProfileData.coins || 0) + m.rewardCoins;
           await updateDoc(profileRef, { coins: newCoins, xp: newXp, level: newLvl, activeMission: null });
           setEnigmaAnswer(''); showToast(`Decifrado! +${m.rewardXp} XP / +${m.rewardCoins} M.`, "success");
           if(didLevelUp) onLevelUp(newLvl); 
        } else {
           const attempts = m.attemptsLeft - 1;
           if (attempts <= 0) {
               let newCoins = Math.max(0, (userProfileData.coins || 0) - m.penaltyCoins);
               let { newXp, newLvl } = removeXpLogic(userProfileData.xp || 0, userProfileData.level || 1, m.penaltyXp);
               await updateDoc(profileRef, { coins: newCoins, xp: newXp, level: newLvl, activeMission: null });
               showToast(`Falhou! Punição do Abismo aplicada.`, "error");
           } else {
               await updateDoc(profileRef, { 'activeMission.attemptsLeft': attempts }); showToast(`Incorreto. ${attempts} vida(s) restante(s).`, "error");
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
        showToast(`Desistência punida: -${m.penaltyXp}XP / -${m.penaltyCoins} M.`, "error");
    };

    const runSynthesis = async () => {
        if ((userProfileData.crystals || 0) < 5) { showToast("Cristais insuficientes (Custa 5).", "error"); return; }
        setSynthesizing(true);
        setTimeout(async () => {
          const res = await synthesizeCrystal(); setSynthesizing(false);
          if (res && res.success) showToast(`Síntese Concluída! +${res.wonCoins} M | +${res.wonXp} XP`, 'success');
          else showToast(`Falha! Cristais destruídos no Vácuo.`, 'error');
        }, 1500);
    };

    const equipped = userProfileData.equipped_items || {};

    return (
        <div className={`max-w-4xl mx-auto px-4 py-6 animate-in fade-in duration-500 relative pb-24 font-sans text-gray-300 min-h-screen ${equipped.tema_perfil ? equipped.tema_perfil.cssClass : 'bg-[#0f111a]'}`}>
            
            {confirmModal && (
                <div className="fixed inset-0 z-[2000] bg-black/90 backdrop-blur-sm flex items-center justify-center p-4 animate-in fade-in duration-300" onClick={() => setConfirmModal(null)}>
                    <div className="bg-[#050508] border border-blue-900/40 p-6 rounded-3xl shadow-[0_0_50px_rgba(37,99,235,0.15)] max-w-sm w-full text-center relative overflow-hidden" onClick={e => e.stopPropagation()}>
                        <div className="absolute top-0 left-0 w-full h-[1px] bg-gradient-to-r from-transparent via-blue-500/50 to-transparent"></div>
                        <Target className="w-12 h-12 text-blue-500 mx-auto mb-4 animate-pulse" />
                        <h3 className="text-lg font-black text-white mb-2 uppercase tracking-widest">Assinar Contrato?</h3>
                        <p className="text-xs text-blue-200/60 font-medium px-2">Ao aceitar uma missão, você não pode voltar atrás sem punições.</p>
                        <div className="bg-red-950/30 border border-red-900/30 p-3 rounded-lg mt-3 mb-6">
                            <p className="text-xs text-red-200 font-medium">Se falhar, o Abismo cobrará:</p>
                            <p className="text-sm font-black text-red-500 mt-1">-{rankConfigs[confirmModal]?.pxp} XP | -{rankConfigs[confirmModal]?.pcoin} Moedas</p>
                        </div>
                        <div className="flex gap-3">
                            <button onClick={() => setConfirmModal(null)} className="flex-1 bg-black border border-blue-900/30 text-gray-400 font-bold py-3.5 rounded-xl hover:text-white transition-colors text-xs duration-300 uppercase tracking-widest">Recusar</button>
                            <button onClick={() => triggerForgeMission(confirmModal)} className="flex-1 bg-gradient-to-r from-blue-800 to-amber-600 text-white font-black py-3.5 rounded-xl hover:scale-105 transition-transform shadow-[0_0_15px_rgba(245,158,11,0.3)] text-xs duration-300 uppercase tracking-widest">Assinar</button>
                        </div>
                    </div>
                </div>
            )}

            <div className="flex gap-2.5 border-b border-blue-900/20 mb-6 overflow-x-auto scrollbar-hide pb-2 relative z-20">
                <button onClick={() => setActiveTab("Missões")} className={`px-5 py-2.5 rounded-xl font-black transition-all whitespace-nowrap flex items-center gap-2 text-[10px] uppercase tracking-widest duration-300 ${activeTab === "Missões" ? 'bg-blue-950/40 text-blue-400 border border-blue-900/50 shadow-inner' : 'bg-black/40 text-blue-900/60 hover:text-blue-200 border border-transparent shadow-sm'}`}><Target className="w-4 h-4"/> Contratos</button>
                <button onClick={() => setActiveTab("Forja")} className={`px-5 py-2.5 rounded-xl font-black transition-all whitespace-nowrap flex items-center gap-2 text-[10px] uppercase tracking-widest duration-300 ${activeTab === "Forja" ? 'bg-amber-950/40 text-amber-400 border border-amber-900/50 shadow-inner' : 'bg-black/40 text-blue-900/60 hover:text-blue-200 border border-transparent shadow-sm'}`}><Hexagon className="w-4 h-4"/> Fornalha Cósmica</button>
                <button onClick={() => setActiveTab("Loja")} className={`px-5 py-2.5 rounded-xl font-black transition-all whitespace-nowrap flex items-center gap-2 text-[10px] uppercase tracking-widest duration-300 ${activeTab === "Loja" ? 'bg-red-950/40 text-red-500 border border-red-900/50 shadow-inner' : 'bg-black/40 text-blue-900/60 hover:text-blue-200 border border-transparent shadow-sm'}`}><ShoppingCart className="w-4 h-4"/> Mercado Astral</button>
                <button onClick={() => setActiveTab("Ranking")} className={`px-5 py-2.5 rounded-xl font-black transition-all whitespace-nowrap flex items-center gap-2 text-[10px] uppercase tracking-widest duration-300 ${activeTab === "Ranking" ? 'bg-blue-950/40 text-blue-400 border border-blue-900/50 shadow-inner' : 'bg-black/40 text-blue-900/60 hover:text-blue-200 border border-transparent shadow-sm'}`}><Trophy className="w-4 h-4"/> Hierarquia</button>
            </div>

            {activeTab === "Missões" && (
                <div className="animate-in fade-in duration-500 space-y-6">
                    {userProfileData.activeMission ? (
                        <div className="bg-gradient-to-br from-[#050508] to-black border border-blue-900/30 p-6 md:p-8 rounded-3xl relative overflow-hidden shadow-2xl">
                           <div className="absolute top-0 right-0 w-64 h-64 bg-blue-900/10 blur-[80px] pointer-events-none"></div>
                           <div className="flex justify-between items-start mb-6 relative z-10">
                              <div>
                                 <span className="bg-blue-950/50 text-blue-400 text-[9px] font-black uppercase px-3 py-1 rounded shadow-inner border border-blue-900/30">{userProfileData.activeMission.difficulty}</span>
                                 <h3 className="text-xl md:text-2xl font-black text-white mt-3 tracking-tight uppercase">{userProfileData.activeMission.title}</h3>
                              </div>
                              <div className="text-right">
                                 <div className="flex items-center gap-2 text-red-400 font-black bg-red-950/30 px-3 py-1.5 rounded border border-red-900/30 shadow-inner text-xs"><Timer className="w-4 h-4 animate-pulse" /> {timeLeft}</div>
                              </div>
                           </div>
                           
                           {userProfileData.activeMission.type === 'read' && (
                               <div className="bg-black/50 p-4 md:p-6 rounded-2xl border border-white/5 mb-6 shadow-inner relative z-10">
                                  <p className="text-gray-300 font-medium text-sm mb-4 leading-relaxed">{userProfileData.activeMission.desc}</p>
                                  <div className="w-full bg-[#020205] rounded-full h-3 overflow-hidden shadow-inner border border-white/5">
                                      <div className="bg-gradient-to-r from-blue-700 to-cyan-400 h-full transition-all duration-1000 relative" style={{width: `${(userProfileData.activeMission.currentCount / userProfileData.activeMission.targetCount) * 100}%`}}>
                                          <div className="absolute inset-0 bg-white/20 w-full animate-[shimmer_2s_infinite]"></div>
                                      </div>
                                  </div>
                                  <div className="flex justify-between text-[10px] text-blue-400 font-black mt-2 uppercase tracking-widest">
                                      <span>Progresso</span>
                                      <span>{userProfileData.activeMission.currentCount} / {userProfileData.activeMission.targetCount} Caps</span>
                                  </div>
                                  <button onClick={() => { const m = mangas.find(mg => mg.id === userProfileData.activeMission.targetManga); if(m) onNavigate('details', m); }} className="w-full mt-6 bg-blue-600 hover:bg-blue-500 text-white font-black py-3.5 rounded-xl flex items-center justify-center gap-2 transition-colors text-xs uppercase tracking-widest shadow-md"><Compass className="w-4 h-4"/> Rastrear Obra</button>
                               </div>
                           )}

                           {userProfileData.activeMission.type === 'search_local' && (
                               <div className="bg-black/50 p-4 md:p-6 rounded-2xl border border-white/5 mb-6 shadow-inner relative z-10">
                                   <p className="text-gray-300 font-medium text-sm leading-relaxed whitespace-pre-wrap">{userProfileData.activeMission.question}</p>
                                   <div className="mt-4 p-3 bg-red-950/20 border border-red-900/30 rounded-lg flex items-start gap-2">
                                       <ShieldAlert className="w-4 h-4 text-red-500 mt-0.5 flex-shrink-0" />
                                       <p className="text-[10px] text-red-400/80 font-bold leading-relaxed uppercase tracking-widest">Navegue até a página desta obra no catálogo para concluir a caçada. O tempo é implacável.</p>
                                   </div>
                               </div>
                           )}
                           
                           {userProfileData
