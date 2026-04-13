import React, { useState, useEffect } from 'react';
import { Target, Hexagon, ShoppingCart, Trophy, Check, Compass, Timer, Star, Skull, Zap, Clock, Crown, Key, Loader2, ShieldAlert, Sparkles, User, ArrowRight } from 'lucide-react';
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
        'Rank E': { rxp: 30, rcoin: 15, pxp: 15, pcoin: 10, time: 15, charLimit: 300, enigmaTries: 3, color: 'text-gray-400', bg: 'bg-gray-500/10' },
        'Rank C': { rxp: 100, rcoin: 50, pxp: 50, pcoin: 25, time: 10, charLimit: 200, enigmaTries: 3, color: 'text-emerald-400', bg: 'bg-emerald-500/10' },
        'Rank B': { rxp: 150, rcoin: 80, pxp: 80, pcoin: 40, time: 8, charLimit: 120, enigmaTries: 2, color: 'text-cyan-400', bg: 'bg-cyan-500/10' },
        'Rank A': { rxp: 300, rcoin: 150, pxp: 150, pcoin: 80, time: 5, charLimit: 80, enigmaTries: 2, color: 'text-indigo-400', bg: 'bg-indigo-500/10' },
        'Rank S': { rxp: 800, rcoin: 400, pxp: 400, pcoin: 200, time: 3, charLimit: 60, enigmaTries: 1, color: 'text-fuchsia-400', bg: 'bg-fuchsia-500/10' },
        'Rank SSS':{ rxp: 2000, rcoin: 1000, pxp: 1000, pcoin: 500, time: 1, charLimit: 40, enigmaTries: 1, color: 'text-rose-400', bg: 'bg-rose-500/10' }
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
            showToast("Erro ao sincronizar dados. Tente novamente.", "error");
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
                    let q = `Gêneros: ${genres}\n\nFragmento:\n"${cleanDesc.substring(0, conf.charLimit)}..."\n\nLocalize esta obra no acervo e acesse sua página para concluir o contrato.`;
                    
                    newMission = { id: Date.now().toString(), type: 'search_local', difficulty, title: "Caçada Abissal", question: q, targetManga: randomManga.id, rewardXp: conf.rxp, rewardCoins: conf.rcoin, penaltyXp: conf.pxp, penaltyCoins: conf.pcoin, deadline: now + (conf.time * 60 * 1000) };
                
                } else if (chosenType === 'enigma') {
                    let q = `Analisando fragmentos da Biblioteca...\n\n`;
                    if (randomManga.author) q += `• Autoria: ${randomManga.author}\n`;
                    if (randomManga.genres && randomManga.genres.length > 0) q += `• Gêneros: ${randomManga.genres.slice(0,3).join(', ')}\n`;
                    q += `\nQual é o nome exato desta obra?`;
                    newMission = { id: Date.now().toString(), type: 'enigma', difficulty, title: "Enigma do Vazio", question: q, answer: [randomManga.title.toLowerCase().trim()], attemptsLeft: conf.enigmaTries, rewardXp: conf.rxp, rewardCoins: conf.rcoin, penaltyXp: conf.pxp, penaltyCoins: conf.pcoin, deadline: now + (conf.time * 60 * 1000) };
                
                } else {
                    let readTarget = difficulty === 'Rank E' ? 1 : difficulty === 'Rank C' ? 2 : difficulty === 'Rank B' ? 3 : difficulty === 'Rank A' ? 5 : difficulty === 'Rank S' ? 10 : 20;
                    if(randomManga.chapters && randomManga.chapters.length < readTarget) readTarget = randomManga.chapters.length || 1;
                    newMission = { id: Date.now().toString(), type: 'read', difficulty, title: `Exploração Literária`, desc: `Leia ${readTarget} capítulo(s) da obra "${randomManga.title}".`, targetManga: randomManga.id, targetCount: readTarget, currentCount: 0, rewardXp: conf.rxp, rewardCoins: conf.rcoin, penaltyXp: conf.pxp, penaltyCoins: conf.pcoin, deadline: now + (readTarget * 45 * 60 * 1000) };
                }
            }

            if (newMission) {
                await updateDoc(doc(db, 'artifacts', APP_ID, 'users', user.uid, 'profile', 'main'), { activeMission: newMission, completedMissions: completed });
                showToast(`Contrato estabelecido. O tempo está correndo.`, "success");
            } else {
                showToast("O sistema não encontrou contratos adequados agora.", "error");
            }
        } catch(e) { showToast("Falha na sincronização com o Nexo.", "error"); } finally { setIsForgingMission(false); }
    };
    
    const handleEnigmaSubmit = async (e) => {
        e.preventDefault(); const m = userProfileData.activeMission;
        if (!m || m.type !== 'enigma') return;
        if (!enigmaAnswer.trim()) return showToast("Insira uma resposta válida.", "warning");
        const profileRef = doc(db, 'artifacts', APP_ID, 'users', user.uid, 'profile', 'main');
        const userAnswer = enigmaAnswer.toLowerCase().trim();
        const isCorrect = m.answer.some(ans => { const correctAns = ans.toLowerCase().trim(); return userAnswer === correctAns || (userAnswer.length >= 3 && (correctAns.includes(userAnswer) || userAnswer.includes(correctAns))); });
        
        if (isCorrect) {
           let { newXp, newLvl, didLevelUp } = addXpLogic(userProfileData.xp || 0, userProfileData.level || 1, m.rewardXp);
           let newCoins = (userProfileData.coins || 0) + m.rewardCoins;
           await updateDoc(profileRef, { coins: newCoins, xp: newXp, level: newLvl, activeMission: null });
           setEnigmaAnswer(''); showToast(`Enigma solucionado. Você recebeu ${m.rewardXp} XP e ${m.rewardCoins} Moedas.`, "success");
           if(didLevelUp) onLevelUp(newLvl); 
        } else {
           const attempts = m.attemptsLeft - 1;
           if (attempts <= 0) {
               let newCoins = Math.max(0, (userProfileData.coins || 0) - m.penaltyCoins);
               let { newXp, newLvl } = removeXpLogic(userProfileData.xp || 0, userProfileData.level || 1, m.penaltyXp);
               await updateDoc(profileRef, { coins: newCoins, xp: newXp, level: newLvl, activeMission: null });
               showToast(`Falha crítica. Penalidade aplicada.`, "error");
           } else {
               await updateDoc(profileRef, { 'activeMission.attemptsLeft': attempts }); showToast(`Resposta incorreta. Restam ${attempts} tentativas.`, "error");
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
        showToast(`Contrato quebrado. Penalidade: -${m.penaltyXp}XP e -${m.penaltyCoins} Moedas.`, "error");
    };

    const runSynthesis = async () => {
        if ((userProfileData.crystals || 0) < 5) { showToast("Você precisa de 5 Cristais para forjar.", "error"); return; }
        setSynthesizing(true);
        setTimeout(async () => {
          const res = await synthesizeCrystal(); setSynthesizing(false);
          if (res && res.success) showToast(`Síntese bem-sucedida! +${res.wonCoins} Moedas e +${res.wonXp} XP`, 'success');
          else showToast(`Ocorreu uma anomalia. Seus cristais foram perdidos.`, 'error');
        }, 1500);
    };

    const equipped = userProfileData.equipped_items || {};

    return (
        <div className={`max-w-5xl mx-auto px-4 py-8 md:py-12 animate-in fade-in duration-700 relative pb-24 font-sans min-h-screen ${equipped.tema_perfil ? equipped.tema_perfil.cssClass : 'bg-[#030305]'}`}>
            
            {/* MODAL DE CONFIRMAÇÃO ELEGANTE */}
            {confirmModal && (
                <div className="fixed inset-0 z-[3000] bg-black/60 backdrop-blur-md flex items-center justify-center p-4 animate-in fade-in duration-300" onClick={() => setConfirmModal(null)}>
                    <div className="bg-[#0a0a12] border border-white/5 p-8 rounded-3xl shadow-2xl max-w-sm w-full text-center relative overflow-hidden" onClick={e => e.stopPropagation()}>
                        <Target className="w-10 h-10 text-indigo-400 mx-auto mb-4" />
                        <h3 className="text-xl font-light text-white mb-2">Assinar Contrato?</h3>
                        <p className="text-sm text-gray-400 font-light px-2 mb-6">Ao aceitar uma missão, você não pode voltar atrás sem sofrer penalidades no seu progresso.</p>
                        
                        <div className="bg-red-500/5 border border-red-500/10 p-4 rounded-2xl mb-8">
                            <p className="text-[10px] text-red-400 uppercase tracking-widest font-medium mb-1">Penalidade por falha</p>
                            <p className="text-sm font-bold text-white">-{rankConfigs[confirmModal]?.pxp} XP <span className="text-gray-600 px-2">•</span> -{rankConfigs[confirmModal]?.pcoin} Moedas</p>
                        </div>
                        
                        <div className="flex gap-3">
                            <button onClick={() => setConfirmModal(null)} className="flex-1 bg-white/5 text-gray-300 font-medium py-3.5 rounded-2xl hover:bg-white/10 transition-colors text-sm">Cancelar</button>
                            <button onClick={() => triggerForgeMission(confirmModal)} className="flex-1 bg-indigo-500 text-white font-bold py-3.5 rounded-2xl hover:bg-indigo-600 transition-colors shadow-lg shadow-indigo-500/20 text-sm">Confirmar</button>
                        </div>
                    </div>
                </div>
            )}

            {/* NAVEGAÇÃO DE ABAS SUAVE */}
            <div className="flex justify-center md:justify-start gap-2 border-b border-white/5 mb-10 overflow-x-auto no-scrollbar pb-3">
                {['Missões', 'Forja', 'Loja', 'Ranking'].map((tab) => (
                    <button 
                        key={tab}
                        onClick={() => setActiveTab(tab)} 
                        className={`px-5 py-2.5 rounded-full font-medium transition-all whitespace-nowrap flex items-center gap-2 text-xs tracking-wide
                        ${activeTab === tab ? 'bg-white/10 text-white shadow-sm' : 'text-gray-500 hover:text-gray-300 hover:bg-white/[0.02]'}`}
                    >
                        {tab === "Missões" && <Target className="w-4 h-4"/>}
                        {tab === "Forja" && <Hexagon className="w-4 h-4"/>}
                        {tab === "Loja" && <ShoppingCart className="w-4 h-4"/>}
                        {tab === "Ranking" && <Trophy className="w-4 h-4"/>}
                        {tab}
                    </button>
                ))}
            </div>

            {/* CONTEÚDO: MISSÕES */}
            {activeTab === "Missões" && (
                <div className="animate-in fade-in duration-500">
                    {userProfileData.activeMission ? (
                        <div className="bg-white/[0.02] border border-white/5 p-8 md:p-10 rounded-[2rem] relative overflow-hidden shadow-2xl max-w-3xl mx-auto">
                            
                            {/* Glow suave no fundo */}
                            <div className="absolute -top-20 -right-20 w-64 h-64 bg-indigo-500/10 blur-[60px] pointer-events-none rounded-full"></div>
                            
                            <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 mb-8 relative z-10">
                               <div>
                                  <span className={`text-[10px] font-bold uppercase tracking-widest px-3 py-1.5 rounded-full ${rankConfigs[userProfileData.activeMission.difficulty].bg} ${rankConfigs[userProfileData.activeMission.difficulty].color}`}>
                                    {userProfileData.activeMission.difficulty}
                                  </span>
                                  <h3 className="text-2xl md:text-3xl font-light text-white mt-4">{userProfileData.activeMission.title}</h3>
                               </div>
                               <div className="flex items-center gap-2 text-gray-400 font-medium bg-black/40 px-4 py-2.5 rounded-2xl border border-white/5 shadow-inner">
                                   <Timer className="w-4 h-4" /> <span className="tracking-widest">{timeLeft}</span>
                               </div>
                            </div>
                            
                            {/* Tipo: LEITURA */}
                            {userProfileData.activeMission.type === 'read' && (
                                <div className="bg-black/20 p-6 md:p-8 rounded-3xl border border-white/5 mb-8 relative z-10">
                                   <p className="text-gray-300 font-light text-base md:text-lg mb-6 leading-relaxed">{userProfileData.activeMission.desc}</p>
                                   
                                   <div className="w-full bg-white/5 rounded-full h-1.5 overflow-hidden mb-3">
                                       <div className="bg-indigo-400 h-full transition-all duration-1000 ease-out" style={{width: `${(userProfileData.activeMission.currentCount / userProfileData.activeMission.targetCount) * 100}%`}}></div>
                                   </div>
                                   <div className="flex justify-between text-xs text-gray-500 font-medium tracking-wide">
                                       <span>Progresso Atual</span>
                                       <span>{userProfileData.activeMission.currentCount} de {userProfileData.activeMission.targetCount} capítulos</span>
                                   </div>

                                   <button onClick={() => { const m = mangas.find(mg => mg.id === userProfileData.activeMission.targetManga); if(m) onNavigate('details', m); }} className="w-full mt-8 bg-white/10 hover:bg-white/20 text-white font-medium py-4 rounded-2xl flex items-center justify-center gap-2 transition-colors text-sm"><Compass className="w-4 h-4"/> Ir para a Obra</button>
                                </div>
                            )}

                            {/* Tipo: BUSCA LOCAL */}
                            {userProfileData.activeMission.type === 'search_local' && (
                                <div className="bg-black/20 p-6 md:p-8 rounded-3xl border border-white/5 mb-8 relative z-10">
                                    <p className="text-gray-300 font-light text-sm leading-relaxed whitespace-pre-wrap opacity-90">{userProfileData.activeMission.question}</p>
                                    <div className="mt-6 p-4 bg-indigo-500/10 rounded-2xl flex items-start gap-3">
                                        <Compass className="w-5 h-5 text-indigo-400 flex-shrink-0" />
                                        <p className="text-xs text-indigo-200/80 font-medium leading-relaxed">Navegue pelo Catálogo, encontre a obra correspondente a este fragmento e acesse sua página para concluir a missão.</p>
                                    </div>
                                </div>
                            )}
                            
                            {/* Tipo: ENIGMA */}
                            {userProfileData.activeMission.type === 'enigma' && (
                                <div className="bg-black/20 p-6 md:p-8 rounded-3xl border border-white/5 mb-8 relative z-10">
                                   <p className="text-gray-300 font-light text-sm leading-relaxed whitespace-pre-wrap mb-8 opacity-90">{userProfileData.activeMission.question}</p>
                                   <form onSubmit={handleEnigmaSubmit} className="flex flex-col gap-4">
                                      <input type="text" value={enigmaAnswer} onChange={e=>setEnigmaAnswer(e.target.value)} placeholder="Sua resposta..." className="w-full bg-[#0a0a12] border border-white/10 rounded-2xl px-5 py-4 text-white text-sm outline-none focus:border-indigo-500/50 transition-colors" />
                                      <button type="submit" className="w-full bg-indigo-500 hover:bg-indigo-400 text-white font-bold py-4 rounded-2xl transition-colors shadow-lg shadow-indigo-500/20 text-sm flex items-center justify-center gap-2"><ArrowRight className="w-4 h-4"/> Confirmar Resposta</button>
                                   </form>
                                   <p className="text-center mt-5 text-xs text-gray-500 font-medium">Tentativas Restantes: <span className="text-white font-bold">{userProfileData.activeMission.attemptsLeft}</span></p>
                                </div>
                            )}

                            <div className="flex flex-col sm:flex-row items-center justify-between border-t border-white/5 pt-6 relative z-10 gap-4">
                               <div className="flex gap-6">
                                  <span className="flex items-center gap-2 text-gray-300 font-medium text-sm"><Sparkles className="w-4 h-4 text-indigo-400"/> +{userProfileData.activeMission.rewardXp} XP</span>
                                  <span className="flex items-center gap-2 text-gray-300 font-medium text-sm"><div className="w-3 h-3 rounded-full bg-amber-400"></div> +{userProfileData.activeMission.rewardCoins} Moedas</span>
                               </div>
                               <button onClick={cancelMission} className="text-xs text-gray-500 hover:text-red-400 font-medium transition-colors flex items-center gap-1.5"><Skull className="w-3.5 h-3.5"/> Abortar Missão</button>
                            </div>
                        </div>
                    ) : (
                        <div className="space-y-8">
                            {isForgingMission ? (
                                <div className="bg-white/[0.02] border border-white/5 p-16 rounded-[2rem] flex flex-col items-center justify-center text-center max-w-2xl mx-auto">
                                   <Loader2 className="w-8 h-8 text-indigo-400 animate-spin mb-6" />
                                   <h3 className="text-xl font-light text-white mb-2">Buscando oportunidades...</h3>
                                   <p className="text-sm text-gray-500 font-light">Sincronizando com o banco de dados do infinito.</p>
                                </div>
                            ) : (
                                <>
                                    <div className="text-center max-w-2xl mx-auto mb-12">
                                        <h2 className="text-3xl md:text-4xl font-light text-white mb-4">Mural de <span className="font-medium text-indigo-400">Contratos</span></h2>
                                        <p className="text-gray-400 text-sm leading-relaxed font-light">Selecione uma dificuldade. O sistema gerará um desafio aleatório baseado no seu acervo para testar suas habilidades e recompensá-lo.</p>
                                    </div>
                                    
                                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5 max-w-6xl mx-auto">
                                        {RANK_CARDS.map(rId => {
                                            const r = rankConfigs[rId];
                                            return (
                                                <div key={rId} className={`bg-[#0a0a12] border border-white/5 p-6 md:p-8 rounded-3xl flex flex-col justify-between transition-all duration-300 hover:bg-white/[0.03] group`}>
                                                    
                                                    <div className="mb-8">
                                                        <h3 className={`text-2xl font-black tracking-wide mb-6 ${r.color}`}>{rId}</h3>
                                                        <div className="space-y-3">
                                                            <div className="flex items-center justify-between text-sm">
                                                                <span className="text-gray-500 font-light">Experiência</span>
                                                                <span className="text-white font-medium flex items-center gap-1.5"><Sparkles className="w-3.5 h-3.5 text-indigo-400 opacity-70"/> {r.rxp} XP</span>
                                                            </div>
                                                            <div className="flex items-center justify-between text-sm">
                                                                <span className="text-gray-500 font-light">Recompensa</span>
                                                                <span className="text-white font-medium flex items-center gap-1.5"><div className="w-2.5 h-2.5 rounded-full bg-amber-400 opacity-80"></div> {r.rcoin} Moedas</span>
                                                            </div>
                                                        </div>
                                                    </div>
                                                    
                                                    <button onClick={() => setConfirmModal(rId)} className={`w-full py-4 rounded-2xl font-bold text-xs uppercase tracking-widest transition-colors ${r.bg} ${r.color} hover:bg-white/10 hover:text-white`}>
                                                        Selecionar
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

            {/* CONTEÚDO: FORJA (Minimalista) */}
            {activeTab === "Forja" && (
                <div className="animate-in fade-in duration-500 max-w-xl mx-auto mt-10">
                    <div className="bg-[#0a0a12] border border-white/5 p-8 md:p-12 rounded-[2rem] text-center shadow-2xl relative overflow-hidden">
                        
                        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-64 h-64 bg-cyan-500/10 blur-[80px] rounded-full pointer-events-none"></div>
                        
                        <Hexagon className="w-12 h-12 mx-auto mb-8 text-cyan-400 opacity-80 animate-[spin_15s_linear_infinite] relative z-10" />
                        
                        <h2 className="text-2xl md:text-3xl font-light text-white mb-4 relative z-10">Fornalha de <span className="font-medium text-cyan-400">Cristais</span></h2>
                        <p className="text-gray-400 text-sm mb-10 leading-relaxed font-light relative z-10">Sintetize <b className="text-white font-medium">5 Cristais</b> encontrados durante a leitura para obter Moedas e XP. Há um risco de 40% de falha no processo.</p>
                        
                        <div className="bg-[#030305] border border-white/5 rounded-2xl p-6 mb-10 shadow-inner relative z-10">
                            <span className="text-[10px] uppercase font-bold text-gray-500 tracking-widest mb-3 block">Cristais Disponíveis</span>
                            <div className="flex items-center justify-center gap-3 text-4xl font-light text-white">
                                {userProfileData.crystals || 0}
                            </div>
                        </div>

                        <button onClick={runSynthesis} disabled={synthesizing || (userProfileData.crystals || 0) < 5} className="w-full bg-cyan-900/50 hover:bg-cyan-800 disabled:bg-white/5 text-white font-medium py-4 px-8 rounded-2xl transition-colors disabled:text-gray-500 relative z-10 text-sm flex items-center justify-center gap-2">
                            {synthesizing ? <><Loader2 className="w-4 h-4 animate-spin" /> Processando...</> : 'Iniciar Síntese (Custa 5)'}
                        </button>
                    </div>
                </div>
            )}

            {/* CONTEÚDO: LOJA (Design Limpo e Vitrine) */}
            {activeTab === "Loja" && (
                <div className="animate-in fade-in duration-500">
                    <div className="flex flex-col sm:flex-row justify-between items-center gap-6 mb-10 max-w-7xl mx-auto">
                        <div className="text-center sm:text-left">
                            <h3 className="text-3xl font-light text-white mb-2">Mercado <span className="font-medium text-indigo-400">Astral</span></h3>
                            <p className="text-gray-500 text-sm font-light">Adquira cosméticos para personalizar o seu perfil.</p>
                        </div>
                        <div className="bg-white/5 border border-white/10 text-white font-medium px-6 py-3 rounded-full flex items-center gap-2 text-sm shadow-sm backdrop-blur-md">
                            <div className="w-2.5 h-2.5 rounded-full bg-amber-400 opacity-80"></div>
                            {userProfileData.coins || 0} Moedas
                        </div>
                    </div>
                      
                    <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4 max-w-7xl mx-auto">
                        {shopItems.map(item => {
                          const hasItem = userProfileData.inventory?.includes(item.id);
                          const isEquipped = userProfileData.equipped_items?.[item.categoria]?.id === item.id;
                          const cat = (item.categoria || item.type || '').toLowerCase();

                          return (
                            <div key={item.id} className={`bg-[#0a0a12] border p-5 rounded-[2rem] flex flex-col items-center text-center transition-colors group ${isEquipped ? 'border-indigo-500/50 bg-indigo-500/5' : 'border-white/5 hover:border-white/10 hover:bg-white/[0.02]'}`}>
                              
                              <div className={`w-24 h-24 rounded-2xl mb-5 bg-[#030305] flex items-center justify-center overflow-hidden border border-white/5 relative flex-shrink-0 ${(!item.preview && ['moldura', 'efeito'].includes(cat)) ? item.cssClass : ''}`}>
                                
                                {(cat === 'capa_fundo' || cat === 'tema_perfil') ? (
                                    cleanCosmeticUrl(item.preview) ? <img src={cleanCosmeticUrl(item.preview)} onError={(e)=>e.target.style.display='none'} className="w-full h-full object-cover opacity-80" /> : <div className="w-full h-full bg-gradient-to-br from-gray-800 to-gray-900"></div>
                                ) : null}

                                {cat === 'particulas' && cleanCosmeticUrl(item.preview) && <img src={cleanCosmeticUrl(item.preview)} onError={(e)=>e.target.style.display='none'} className={`absolute inset-[-50%] m-auto w-[200%] h-[200%] object-contain z-10 ${item.cssClass}`} style={{ mixBlendMode: 'screen', WebkitMixBlendMode: 'screen', pointerEvents: 'none' }} />}
                                
                                {['moldura', 'efeito', 'particulas', 'badge'].includes(cat) && (
                                    <div className="w-12 h-12 rounded-full flex items-center justify-center relative z-0 bg-[#0a0a12]">
                                        <User className="w-5 h-5 text-gray-600" />
                                    </div>
                                )}

                                {cat === 'avatar' && cleanCosmeticUrl(item.preview) && <img src={cleanCosmeticUrl(item.preview)} onError={(e)=>e.target.style.display='none'} className={`w-full h-full object-cover ${item.cssClass}`} />}
                                
                                {cat === 'efeito' && cleanCosmeticUrl(item.preview) && <img src={cleanCosmeticUrl(item.preview)} onError={(e)=>e.target.style.display='none'} className={`absolute inset-0 m-auto w-full h-full object-contain z-10 ${item.cssClass}`} style={{ mixBlendMode: 'screen', WebkitMixBlendMode: 'screen', pointerEvents: 'none' }} />}
                                
                                {cat === 'moldura' && cleanCosmeticUrl(item.preview) && <img src={cleanCosmeticUrl(item.preview)} onError={(e)=>e.target.style.display='none'} className={`absolute inset-[-15%] m-auto w-[130%] h-[130%] object-contain z-10 ${item.cssClass}`} style={{ mixBlendMode: 'screen', WebkitMixBlendMode: 'screen', pointerEvents: 'none' }} />}
                                
                                {cat === 'badge' && cleanCosmeticUrl(item.preview) && <img src={cleanCosmeticUrl(item.preview)} onError={(e)=>e.target.style.display='none'} className={`absolute -bottom-1 -right-1 w-6 h-6 object-contain z-20 ${item.cssClass}`} style={{ pointerEvents: 'none' }} />}

                                {(!['avatar', 'capa_fundo', 'tema_perfil', 'particulas', 'efeito', 'moldura', 'badge', 'nickname', 'fonte', 'font'].includes(cat)) && (
                                    <Sparkles className="w-6 h-6 text-gray-600 relative z-10"/>
                                )}
                              </div>

                              <p className={`text-[9px] uppercase tracking-widest font-bold mb-1.5 ${getRarityColor(item.raridade)}`}>{item.categoria || item.type}</p>
                              <h4 className="text-white font-medium mb-5 text-xs line-clamp-1">{item.nome || item.name}</h4>
                              
                              {hasItem ? (
                                <button onClick={() => equipItem(item)} className={`w-full font-medium py-2.5 rounded-xl transition-colors text-xs ${isEquipped ? 'bg-white/10 text-white hover:bg-white/20' : 'bg-transparent text-gray-400 hover:text-white hover:bg-white/5 border border-white/10'}`}>{isEquipped ? 'Desequipar' : 'Usar Item'}</button>
                              ) : (
                                <button onClick={() => buyItem(item)} className="w-full bg-white text-black font-bold py-2.5 rounded-xl transition-colors hover:bg-gray-200 text-xs">Comprar • {item.preco || item.price}</button>
                              )}
                            </div>
                          )
                        })}
                    </div>
                </div>
            )}

            {/* CONTEÚDO: RANKING (Limpo e Espaçado) */}
            {activeTab === "Ranking" && (
                <div className="animate-in fade-in duration-500 max-w-4xl mx-auto">
                    <div className="text-center mb-12">
                        <h2 className="text-3xl md:text-4xl font-light text-white mb-4">Hierarquia <span className="font-medium text-indigo-400">Global</span></h2>
                        <p className="text-gray-500 text-sm font-light">Os maiores exploradores do infinito.</p>
                    </div>
                    
                    {loadingRank ? (
                        <div className="flex flex-col items-center justify-center py-20"><Loader2 className="w-8 h-8 text-gray-600 animate-spin mb-4"/><p className="text-gray-500 text-xs font-medium">Processando dados...</p></div>
                    ) : rankingList.length === 0 ? (
                        <p className="text-center text-gray-600 py-16 font-light">O ranking ainda está vazio.</p>
                    ) : (
                        <div className="space-y-2">
                            {rankingList.map((player, index) => (
                                <div key={player.id} className={`bg-[#0a0a12] border p-4 sm:p-5 rounded-2xl flex items-center gap-4 sm:gap-6 transition-colors ${index < 3 ? 'border-indigo-500/20 bg-indigo-500/5' : 'border-white/5 hover:bg-white/[0.02]'}`}>
                                    <div className={`w-6 sm:w-10 font-bold text-center text-sm sm:text-lg ${index === 0 ? 'text-amber-400' : index === 1 ? 'text-gray-300' : index === 2 ? 'text-amber-700' : 'text-gray-600'}`}>
                                        #{index + 1}
                                    </div>
                                    
                                    <div className={`relative w-10 h-10 sm:w-12 sm:h-12 rounded-full flex items-center justify-center flex-shrink-0 group ${(!player.equipped_items?.moldura?.preview && player.equipped_items?.moldura) ? player.equipped_items.moldura.cssClass : ''}`}>
                                        <div className="w-full h-full rounded-full overflow-hidden border border-white/5 relative z-10 bg-[#030305]">
                                            <img src={cleanCosmeticUrl(player.avatarUrl) || `https://placehold.co/100x100/030305/818cf8?text=${player.displayName?.charAt(0) || 'U'}`} className="w-full h-full object-cover z-0" onError={(e)=>e.target.src=`https://placehold.co/100x100/030305/818cf8?text=${player.displayName?.charAt(0) || 'U'}`} />
                                        </div>
                                        {cleanCosmeticUrl(player.equipped_items?.particulas?.preview) && <img src={cleanCosmeticUrl(player.equipped_items.particulas.preview)} onError={(e)=>e.target.style.display='none'} className={`absolute inset-[-50%] m-auto w-[200%] h-[200%] object-contain z-10 ${player.equipped_items.particulas.cssClass}`} style={{ mixBlendMode: 'screen', WebkitMixBlendMode: 'screen', pointerEvents: 'none' }} />}
                                        {cleanCosmeticUrl(player.equipped_items?.efeito?.preview) && <img src={cleanCosmeticUrl(player.equipped_items.efeito.preview)} onError={(e)=>e.target.style.display='none'} className={`absolute inset-0 m-auto w-full h-full object-contain z-20 ${player.equipped_items.efeito.cssClass}`} style={{ mixBlendMode: 'screen', WebkitMixBlendMode: 'screen', pointerEvents: 'none' }} />}
                                        {cleanCosmeticUrl(player.equipped_items?.moldura?.preview) && <img src={cleanCosmeticUrl(player.equipped_items.moldura.preview)} onError={(e)=>e.target.style.display='none'} className={`absolute inset-[-15%] m-auto w-[130%] h-[130%] object-contain z-30 ${player.equipped_items.moldura.cssClass}`} style={{ mixBlendMode: 'screen', WebkitMixBlendMode: 'screen', pointerEvents: 'none' }} />}
                                    </div>

                                    <div className="flex-1 min-w-0">
                                        <h4 className={`font-medium text-sm sm:text-base truncate ${index < 3 ? 'text-white' : 'text-gray-300'}`}>{player.displayName || "Anônimo"}</h4>
                                        <p className="text-[10px] text-gray-500 font-medium truncate mt-0.5">{getLevelTitle(player.level)}</p>
                                    </div>
                                    <div className="text-right flex-shrink-0 flex flex-col items-end">
                                        <div className="text-xs font-bold text-white bg-white/5 px-3 py-1 rounded-lg">Nível {player.level}</div>
                                        <div className="text-[9px] text-gray-500 font-medium mt-1.5 uppercase tracking-wider">{player.xp} XP</div>
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
