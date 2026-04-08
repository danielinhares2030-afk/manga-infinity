import React, { useState, useEffect } from 'react';
import { Target, Hexagon, ShoppingCart, Trophy, Check, Compass, Timer, Star, Skull, Zap, Clock, Crown, Key, Loader2, ShieldAlert, Sparkles, User } from 'lucide-react';
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
        'Rank E': { rxp: 30, rcoin: 15, pxp: 15, pcoin: 10, time: 15, charLimit: 300, enigmaTries: 3 },
        'Rank C': { rxp: 100, rcoin: 50, pxp: 50, pcoin: 25, time: 10, charLimit: 200, enigmaTries: 3 },
        'Rank B': { rxp: 150, rcoin: 80, pxp: 80, pcoin: 40, time: 8, charLimit: 120, enigmaTries: 2 },
        'Rank A': { rxp: 300, rcoin: 150, pxp: 150, pcoin: 80, time: 5, charLimit: 80, enigmaTries: 2 },
        'Rank S': { rxp: 800, rcoin: 400, pxp: 400, pcoin: 200, time: 3, charLimit: 60, enigmaTries: 1 },
        'Rank SSS':{ rxp: 2000, rcoin: 1000, pxp: 1000, pcoin: 500, time: 1, charLimit: 40, enigmaTries: 1 }
    };

    const RANK_CARDS = [
        { id: 'Rank E', color: 'text-gray-400', border: 'border-gray-500/20', hover: 'hover:border-gray-500/50', btn: 'bg-[#13151f] hover:bg-gray-800' },
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
            showToast("Erro na Hierarquia. Verifique as regras do Firebase.", "error");
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
                <button onClick={() => setActiveTab("Missões")} className={`px-5 py-2.5 rounded-xl font-black transition-all whitespace-nowrap flex items-center gap-2 text-[10px] uppercase tracking-widest duration-300 ${activeTab === "Missões" ? 'bg-blue-950/40 text-blue-400 border border-blue-900/50 shadow-inner' : 'bg-black/30 text-blue-900/60 hover:text-blue-200 border border-transparent shadow-sm'}`}><Target className="w-4 h-4"/> Contratos</button>
                <button onClick={() => setActiveTab("Forja")} className={`px-5 py-2.5 rounded-xl font-black transition-all whitespace-nowrap flex items-center gap-2 text-[10px] uppercase tracking-widest duration-300 ${activeTab === "Forja" ? 'bg-amber-950/40 text-amber-400 border border-amber-900/50 shadow-inner' : 'bg-black/30 text-blue-900/60 hover:text-blue-200 border border-transparent shadow-sm'}`}><Hexagon className="w-4 h-4"/> Fornalha Cósmica</button>
                <button onClick={() => setActiveTab("Loja")} className={`px-5 py-2.5 rounded-xl font-black transition-all whitespace-nowrap flex items-center gap-2 text-[10px] uppercase tracking-widest duration-300 ${activeTab === "Loja" ? 'bg-red-950/40 text-red-500 border border-red-900/50 shadow-inner' : 'bg-black/30 text-blue-900/60 hover:text-blue-200 border border-transparent shadow-sm'}`}><ShoppingCart className="w-4 h-4"/> Mercado Astral</button>
                <button onClick={() => setActiveTab("Ranking")} className={`px-5 py-2.5 rounded-xl font-black transition-all whitespace-nowrap flex items-center gap-2 text-[10px] uppercase tracking-widest duration-300 ${activeTab === "Ranking" ? 'bg-blue-950/40 text-blue-400 border border-blue-900/50 shadow-inner' : 'bg-black/30 text-blue-900/60 hover:text-blue-200 border border-transparent shadow-sm'}`}><Trophy className="w-4 h-4"/> Hierarquia</button>
            </div>

            {activeTab === "Missões" && (
                <div className="animate-in fade-in duration-500 space-y-6">
                    {userProfileData.activeMission ? (
                        <div className="bg-gradient-to-br from-[#050508] to-[#0a0d14] border border-blue-900/30 p-6 md:p-8 rounded-3xl relative overflow-hidden shadow-2xl">
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
                           
                           {userProfileData.activeMission.type === 'enigma' && (
                               <div className="bg-black/50 p-4 md:p-6 rounded-2xl border border-white/5 mb-6 shadow-inner relative z-10">
                                  <p className="text-gray-300 font-medium text-sm leading-relaxed whitespace-pre-wrap mb-6 bg-[#020205] p-4 rounded-xl border border-white/5">{userProfileData.activeMission.question}</p>
                                  <form onSubmit={handleEnigmaSubmit} className="flex flex-col gap-3">
                                     <input type="text" value={enigmaAnswer} onChange={e=>setEnigmaAnswer(e.target.value)} placeholder="Sua resposta..." className="w-full bg-[#020205] border border-blue-900/30 rounded-xl px-4 py-3.5 text-white font-medium outline-none focus:border-blue-500/50 transition-colors shadow-inner text-sm" />
                                     <button type="submit" className="w-full bg-blue-600 hover:bg-blue-500 text-white font-black py-3.5 rounded-xl transition-colors shadow-md text-xs uppercase tracking-widest flex items-center justify-center gap-2"><Key className="w-4 h-4"/> Desvendar</button>
                                  </form>
                                  <p className="text-center mt-3 text-[10px] text-gray-500 font-black uppercase tracking-widest">Tentativas Restantes: <span className="text-red-400">{userProfileData.activeMission.attemptsLeft}</span></p>
                               </div>
                           )}

                           <div className="flex items-center justify-between border-t border-white/10 pt-5 relative z-10">
                              <div className="flex gap-4">
                                 <span className="flex items-center gap-1.5 text-blue-400 font-black text-sm"><Sparkles className="w-4 h-4"/> {userProfileData.activeMission.rewardXp} XP</span>
                                 <span className="flex items-center gap-1.5 text-amber-500 font-black text-sm"><div className="w-4 h-4 rounded-full bg-amber-500 border-2 border-amber-300 shadow-[0_0_8px_rgba(245,158,11,0.6)]"></div> {userProfileData.activeMission.rewardCoins} M</span>
                              </div>
                              <button onClick={cancelMission} className="text-[10px] text-red-500 hover:text-white font-black uppercase tracking-widest transition-colors flex items-center gap-1"><Skull className="w-3 h-3"/> Desistir</button>
                           </div>
                        </div>
                    ) : (
                        <div className="space-y-6">
                            {isForgingMission ? (
                                <div className="bg-[#050508] border border-blue-900/30 p-12 rounded-3xl flex flex-col items-center justify-center text-center shadow-inner relative overflow-hidden">
                                   <div className="absolute inset-0 bg-blue-900/10 animate-pulse"></div>
                                   <Loader2 className="w-12 h-12 text-blue-500 animate-spin mb-4 relative z-10" />
                                   <h3 className="text-xl font-black text-blue-400 uppercase tracking-widest relative z-10">O Abismo está forjando...</h3>
                                   <p className="text-xs text-blue-200/60 mt-2 font-bold uppercase tracking-wider relative z-10">Mapeando ecos no catálogo</p>
                                </div>
                            ) : (
                                <>
                                    <div className="bg-gradient-to-r from-[#050508] to-[#0a0f1a] border border-blue-900/20 p-6 sm:p-8 rounded-3xl flex flex-col sm:flex-row items-center justify-between gap-6 shadow-xl relative overflow-hidden">
                                        <div className="absolute top-0 right-0 w-32 h-32 bg-blue-500/10 blur-[50px] pointer-events-none"></div>
                                        <div className="text-center sm:text-left relative z-10">
                                            <h2 className="text-2xl font-black text-white mb-2 flex items-center gap-3 justify-center sm:justify-start uppercase tracking-tight"><Target className="w-6 h-6 text-blue-500" /> Mural de Contratos</h2>
                                            <p className="text-gray-400 text-xs leading-relaxed max-w-sm font-medium">Assine contratos com o Vazio. Conclua missões para ascender na Hierarquia.</p>
                                        </div>
                                    </div>
                                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                        {RANK_CARDS.map(r => (
                                            <div key={r.id} className={`bg-[#050508] border ${r.border} ${r.hover} p-6 rounded-2xl flex flex-col justify-between transition-all duration-300 shadow-sm relative overflow-hidden group`}>
                                                <div className="absolute top-0 right-0 w-16 h-16 bg-white/5 blur-[20px] rounded-full group-hover:scale-150 transition-transform duration-500 pointer-events-none"></div>
                                                <div className="flex justify-between items-start mb-6 relative z-10">
                                                    <h3 className={`text-xl font-black uppercase tracking-widest ${r.color}`}>{r.id}</h3>
                                                    <div className="text-right">
                                                        <div className="text-[10px] font-black text-blue-400 mb-1 flex items-center justify-end gap-1"><Sparkles className="w-3 h-3"/> {rankConfigs[r.id].rxp} XP</div>
                                                        <div className="text-[10px] font-black text-amber-500 flex items-center justify-end gap-1"><div className="w-2.5 h-2.5 rounded-full bg-amber-500 border border-amber-300"></div> {rankConfigs[r.id].rcoin} M</div>
                                                    </div>
                                                </div>
                                                <button onClick={() => setConfirmModal(r.id)} className={`w-full py-3.5 rounded-xl font-black text-[10px] uppercase tracking-widest text-white shadow-md transition-all duration-300 hover:scale-[1.02] ${r.btn} relative z-10`}>Assinar Contrato</button>
                                            </div>
                                        ))}
                                    </div>
                                </>
                            )}
                        </div>
                    )}
                </div>
            )}

            {activeTab === "Forja" && (
                <div className="animate-in fade-in duration-500">
                    <div className="bg-gradient-to-b from-[#050508] to-[#0a0d14] border border-amber-900/20 p-6 sm:p-10 rounded-3xl text-center shadow-2xl relative overflow-hidden">
                        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-64 h-64 bg-amber-600/10 blur-[100px] rounded-full pointer-events-none"></div>
                        <Hexagon className="w-16 h-16 mx-auto mb-6 text-amber-500 animate-[spin_10s_linear_infinite] drop-shadow-[0_0_15px_rgba(245,158,11,0.5)] relative z-10" />
                        <h2 className="text-2xl font-black text-white mb-3 uppercase tracking-tight relative z-10">Fornalha Cósmica</h2>
                        <p className="text-gray-400 text-sm mb-10 max-w-md mx-auto leading-relaxed relative z-10">Sintetize <b>5 Cristais</b> encontrados durante a leitura para obter Moedas e XP. Há <span className="text-red-400 font-bold">40% de chance</span> da anomalia destruir os cristais na forja.</p>
                        
                        <div className="bg-[#0b0e14] border border-white/5 rounded-2xl p-6 max-w-xs mx-auto mb-8 shadow-inner relative z-10">
                            <span className="text-[10px] uppercase font-black text-gray-500 tracking-widest mb-2 block">Cristais no Inventário</span>
                            <div className="flex items-center justify-center gap-3 text-3xl font-black text-cyan-400 drop-shadow-[0_0_10px_rgba(34,211,238,0.4)]">
                                <Hexagon className="w-8 h-8 fill-cyan-900/40" /> {userProfileData.crystals || 0}
                            </div>
                        </div>

                        <button onClick={runSynthesis} disabled={synthesizing || (userProfileData.crystals || 0) < 5} className="bg-gradient-to-r from-amber-600 to-yellow-500 hover:from-amber-500 hover:to-yellow-400 disabled:from-gray-800 disabled:to-gray-900 disabled:text-gray-500 text-black font-black py-4 px-10 rounded-xl transition-all duration-300 shadow-[0_0_30px_rgba(245,158,11,0.3)] hover:scale-105 disabled:hover:scale-100 disabled:shadow-none relative z-10 text-xs uppercase tracking-widest flex items-center justify-center mx-auto gap-2">
                           {synthesizing ? <><Loader2 className="w-5 h-5 animate-spin" /> Fundindo...</> : <><Zap className="w-5 h-5"/> Sintetizar 5 Cristais</>}
                        </button>
                    </div>
                </div>
            )}

            {activeTab === "Loja" && (
                <div className="animate-in fade-in duration-300">
                    <div className="bg-[#0f111a] border border-blue-900/20 p-6 md:p-8 rounded-3xl shadow-xl relative overflow-hidden">
                        <div className="absolute top-0 right-0 w-64 h-64 bg-amber-900/10 blur-[80px] pointer-events-none"></div>
                      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-5 mb-8 relative z-10">
                        <div><h3 className="text-2xl font-black text-amber-500 mb-1.5 flex items-center gap-2.5 uppercase tracking-tight"><ShoppingCart className="w-6 h-6"/> Mercado Astral</h3><p className="text-gray-400 text-xs tracking-wide">Troque suas moedas por artefatos de personalização.</p></div>
                        <div className="bg-amber-950/30 border border-amber-500/20 text-amber-400 font-black px-6 py-3 rounded-full flex items-center gap-2 w-full sm:w-auto justify-center text-sm shadow-inner">{userProfileData.coins || 0} M</div>
                      </div>
                      <div className="grid grid-cols-2 sm:grid-cols-3 gap-4 sm:gap-5 relative z-10">
                        {shopItems.map(item => {
                          const hasItem = userProfileData.inventory?.includes(item.id);
                          const isEquipped = userProfileData.equipped_items?.[item.categoria]?.id === item.id;
                          const cat = (item.categoria || item.type || '').toLowerCase();

                          return (
                            <div key={item.id} className={`bg-[#050508] border p-5 rounded-2xl flex flex-col items-center text-center transition-all duration-300 shadow-inner group ${isEquipped ? 'border-amber-500/40 shadow-[0_0_20px_rgba(245,158,11,0.15)]' : 'border-blue-900/20 hover:border-amber-900/50 hover:shadow-[0_0_15px_rgba(37,99,235,0.1)]'}`}>
                              
                              <div className={`w-20 h-20 rounded-xl mb-4 bg-[#0a0d14] flex items-center justify-center overflow-hidden shadow-inner border border-white/5 relative flex-shrink-0 group ${(!item.preview && ['moldura', 'efeito'].includes(cat)) ? item.cssClass : ''}`}>
                                
                                {(cat === 'capa_fundo' || cat === 'tema_perfil') ? (
                                    cleanCosmeticUrl(item.preview) ? <img src={cleanCosmeticUrl(item.preview)} onError={(e)=>e.target.style.display='none'} className="w-full h-full object-cover opacity-80" /> : <div className="w-full h-full bg-gradient-to-br from-blue-900/20 to-fuchsia-900/20"></div>
                                ) : null}

                                {cat === 'particulas' && cleanCosmeticUrl(item.preview) && <img src={cleanCosmeticUrl(item.preview)} onError={(e)=>e.target.style.display='none'} className={`absolute inset-[-50%] m-auto w-[200%] h-[200%] object-contain z-10 ${item.cssClass}`} style={{ mixBlendMode: 'screen', WebkitMixBlendMode: 'screen', pointerEvents: 'none' }} />}
                                
                                {['moldura', 'efeito', 'particulas', 'badge'].includes(cat) && (
                                    <div className="w-12 h-12 rounded-full flex items-center justify-center relative z-0 bg-[#161a25]">
                                        <User className="w-8 h-8 text-gray-600 rounded-full p-1 w-full h-full object-cover" />
                                    </div>
                                )}

                                {cat === 'avatar' && cleanCosmeticUrl(item.preview) && <img src={cleanCosmeticUrl(item.preview)} onError={(e)=>e.target.style.display='none'} className={`w-full h-full object-cover group-hover:scale-110 transition-transform duration-500 ${item.cssClass}`} />}
                                
                                {cat === 'efeito' && cleanCosmeticUrl(item.preview) && <img src={cleanCosmeticUrl(item.preview)} onError={(e)=>e.target.style.display='none'} className={`absolute inset-0 m-auto w-full h-full object-contain z-10 ${item.cssClass}`} style={{ mixBlendMode: 'screen', WebkitMixBlendMode: 'screen', pointerEvents: 'none' }} />}
                                
                                {cat === 'moldura' && cleanCosmeticUrl(item.preview) && <img src={cleanCosmeticUrl(item.preview)} onError={(e)=>e.target.style.display='none'} className={`absolute inset-[-15%] m-auto w-[130%] h-[130%] object-contain z-10 ${item.cssClass}`} style={{ mixBlendMode: 'screen', WebkitMixBlendMode: 'screen', pointerEvents: 'none' }} />}
                                
                                {cat === 'badge' && cleanCosmeticUrl(item.preview) && <img src={cleanCosmeticUrl(item.preview)} onError={(e)=>e.target.style.display='none'} className={`absolute -bottom-1 -right-1 w-6 h-6 object-contain z-20 ${item.cssClass}`} style={{ pointerEvents: 'none' }} />}

                                {(cat === 'nickname' || cat === 'fonte' || cat === 'font') && (
                                    <span className={`text-xl font-black relative z-10 ${item.cssClass}`}>A</span>
                                )}

                                {(!['avatar', 'capa_fundo', 'tema_perfil', 'particulas', 'efeito', 'moldura', 'badge', 'nickname', 'fonte', 'font'].includes(cat)) && (
                                    <Sparkles className="w-8 h-8 text-blue-400 relative z-10"/>
                                )}
                              </div>

                              <h4 className="text-white font-bold mb-1.5 text-sm line-clamp-1 group-hover:text-amber-400 transition-colors">{item.nome || item.name}</h4>
                              <p className={`text-[9px] uppercase tracking-widest font-black mb-5 ${getRarityColor(item.raridade)}`}>{item.categoria || item.type}</p>
                              {hasItem ? (
                                <button onClick={() => equipItem(item)} className={`w-full font-black py-3 rounded-xl transition-all duration-300 text-[10px] uppercase tracking-widest shadow-lg ${isEquipped ? 'bg-red-950/30 text-red-500 hover:bg-red-900 hover:text-white border border-red-500/40' : 'bg-[#0f111a] text-white hover:bg-blue-900/40 border border-white/10'}`}>{isEquipped ? 'Remover' : 'Equipar'}</button>
                              ) : (
                                <button onClick={() => buyItem(item)} className="w-full bg-gradient-to-r from-amber-600 to-yellow-500 hover:from-amber-500 hover:to-yellow-400 text-black font-black py-3 rounded-xl transition-all duration-300 text-[10px] shadow-lg uppercase tracking-widest">{item.preco || item.price} M</button>
                              )}
                            </div>
                          )
                        })}
                      </div>
                    </div>
                </div>
            )}

            {activeTab === "Ranking" && (
                <div className="animate-in fade-in duration-500">
                    <div className="bg-[#0f111a] border border-blue-900/20 p-6 sm:p-8 rounded-3xl shadow-2xl relative overflow-hidden">
                        <div className="absolute top-[-20%] left-[-10%] w-64 h-64 bg-blue-900/10 blur-[100px] pointer-events-none"></div>
                        <h3 className="text-2xl font-black text-blue-500 flex items-center justify-center gap-3 uppercase tracking-tight mb-8 relative z-10"><Trophy className="w-7 h-7 text-amber-500"/> Hierarquia do Vazio</h3>
                        
                        {loadingRank ? (
                            <div className="flex flex-col items-center justify-center py-12"><Loader2 className="w-10 h-10 text-blue-500 animate-spin mb-4"/><p className="text-gray-500 text-xs font-bold uppercase tracking-widest">Calculando poder...</p></div>
                        ) : rankingList.length === 0 ? (
                            <p className="text-center text-[10px] uppercase text-gray-600 py-8 font-black tracking-[0.2em]">O Vazio ainda não reconhece nenhum lorde.</p>
                        ) : (
                            <div className="space-y-3 relative z-10">
                                {rankingList.map((player, index) => (
                                    <div key={player.id} className={`bg-[#050508] border p-4 rounded-2xl flex items-center gap-4 transition-all duration-300 hover:scale-[1.02] ${index < 3 ? 'border-amber-500/40 shadow-[0_0_20px_rgba(245,158,11,0.1)]' : 'border-blue-900/30 hover:border-blue-500/50'}`}>
                                        <div className={`w-8 font-black text-lg text-center ${index === 0 ? 'text-yellow-500' : index === 1 ? 'text-gray-300' : index === 2 ? 'text-amber-700' : 'text-blue-900/40'}`}>#{index + 1}</div>
                                        
                                        <div className={`relative w-12 h-12 rounded-full flex items-center justify-center flex-shrink-0 group ${(!player.equipped_items?.moldura?.preview && player.equipped_items?.moldura) ? player.equipped_items.moldura.cssClass : ''}`}>
                                            <div className="w-10 h-10 rounded-full overflow-hidden border border-white/10 relative z-10 bg-[#161a25]">
                                                <img src={cleanCosmeticUrl(player.avatarUrl) || `https://placehold.co/100x100/0f111a/3b82f6?text=${player.displayName?.charAt(0) || 'U'}`} className="w-full h-full object-cover z-0" onError={(e)=>e.target.src=`https://placehold.co/100x100/0f111a/3b82f6?text=${player.displayName?.charAt(0) || 'U'}`} />
                                            </div>
                                            {cleanCosmeticUrl(player.equipped_items?.particulas?.preview) && <img src={cleanCosmeticUrl(player.equipped_items.particulas.preview)} onError={(e)=>e.target.style.display='none'} className={`absolute inset-[-50%] m-auto w-[200%] h-[200%] object-contain z-10 ${player.equipped_items.particulas.cssClass}`} style={{ mixBlendMode: 'screen', WebkitMixBlendMode: 'screen', pointerEvents: 'none' }} />}
                                            {cleanCosmeticUrl(player.equipped_items?.efeito?.preview) && <img src={cleanCosmeticUrl(player.equipped_items.efeito.preview)} onError={(e)=>e.target.style.display='none'} className={`absolute inset-0 m-auto w-full h-full object-contain z-20 ${player.equipped_items.efeito.cssClass}`} style={{ mixBlendMode: 'screen', WebkitMixBlendMode: 'screen', pointerEvents: 'none' }} />}
                                            {cleanCosmeticUrl(player.equipped_items?.moldura?.preview) && <img src={cleanCosmeticUrl(player.equipped_items.moldura.preview)} onError={(e)=>e.target.style.display='none'} className={`absolute inset-[-15%] m-auto w-[130%] h-[130%] object-contain z-30 ${player.equipped_items.moldura.cssClass}`} style={{ mixBlendMode: 'screen', WebkitMixBlendMode: 'screen', pointerEvents: 'none' }} />}
                                        </div>

                                        <div className="flex-1 min-w-0">
                                            <h4 className={`font-black text-sm truncate ${index < 3 ? 'text-amber-400' : 'text-white'}`}>{player.displayName || "Entidade Oculta"}</h4>
                                            <p className="text-[10px] text-blue-400/80 font-bold uppercase tracking-wider truncate">{getLevelTitle(player.level)}</p>
                                        </div>
                                        <div className="text-right flex-shrink-0">
                                            <div className="text-xs font-black text-amber-500 uppercase tracking-widest bg-amber-950/30 px-2 py-0.5 rounded border border-amber-900/30">Nível {player.level}</div>
                                            <div className="text-[9px] text-gray-500 font-bold mt-1">{player.xp} XP</div>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>
                </div>
            )}
        </div>
    );
}
