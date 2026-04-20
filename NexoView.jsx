import React, { useState, useEffect } from 'react';
import { Target, Hexagon, ShoppingCart, Trophy, Timer, Star, Skull, Zap, Clock, Key, Loader2, ShieldAlert, Sparkles, User, ArrowRight, Wand2, Image as ImageIcon } from 'lucide-react';
import { doc, updateDoc, collectionGroup, getDocs, query, setDoc, arrayUnion } from "firebase/firestore";
import { db } from './firebase';
import { addXpLogic, removeXpLogic, getLevelTitle, getRarityColor, cleanCosmeticUrl } from './helpers';
import { APP_ID } from './constants';

const CLOUD_NAME = "dxrppfkrq";
const UPLOAD_PRESET = "obra_upload";
const UPLOAD_URL = `https://api.cloudinary.com/v1_1/${CLOUD_NAME}/image/upload`;
const REMOVE_BG_API_KEY = "k85TdHmAtNJQheMuUPujyV7k";

async function uploadToCloudinary(file) {
  const formData = new FormData();
  formData.append("file", file);
  formData.append("upload_preset", UPLOAD_PRESET);
  const res = await fetch(UPLOAD_URL, { method: "POST", body: formData });
  if (!res.ok) throw new Error("Erro no Cloudinary. Verifique o seu preset.");
  const data = await res.json();
  return data.secure_url;
}

function applyCloudinaryTransform(url, transformCode) {
  if (!url || !url.includes('/upload/') || transformCode === 'none') return url;
  return url.replace('/upload/', `/upload/${transformCode}/`);
}

async function removeBackgroundWithRemoveBg(imageBlob) {
  const formData = new FormData();
  formData.append('image_file', imageBlob);
  formData.append('size', 'auto');
  const response = await fetch('https://api.remove.bg/v1.0/removebg', {
    method: 'POST',
    headers: { 'X-Api-Key': REMOVE_BG_API_KEY },
    body: formData
  });
  if (!response.ok) throw new Error("Erro na API Remove.bg");
  return await response.blob();
}

export function NexoView({ user, userProfileData, showToast, mangas, onNavigate, onLevelUp, synthesizeCrystal, shopItems, buyItem, equipItem }) {
    const [activeTab, setActiveTab] = useState("Missões");
    const [enigmaAnswer, setEnigmaAnswer] = useState("");
    const [timeLeft, setTimeLeft] = useState("");
    const [confirmModal, setConfirmModal] = useState(null); 
    const [isForgingMission, setIsForgingMission] = useState(false); 
    const [synthesizing, setSynthesizing] = useState(false);
    
    const [rankingList, setRankingList] = useState([]);
    const [loadingRank, setLoadingRank] = useState(false);

    const [showIAModal, setShowIAModal] = useState(false);
    const [iaPrompt, setIaPrompt] = useState("");
    const [iaCategory, setIaCategory] = useState("avatar");
    const [isGeneratingIA, setIsGeneratingIA] = useState(false);
    const [iaStatus, setIaStatus] = useState("");

    const rankConfigs = {
        'Rank E': { rxp: 30, rcoin: 15, pxp: 15, pcoin: 10, time: 15, charLimit: 300, enigmaTries: 3, color: 'text-gray-400', border: 'border-gray-500/30' },
        'Rank C': { rxp: 100, rcoin: 50, pxp: 50, pcoin: 25, time: 10, charLimit: 200, enigmaTries: 3, color: 'text-emerald-400', border: 'border-emerald-500/30' },
        'Rank B': { rxp: 150, rcoin: 80, pxp: 80, pcoin: 40, time: 8, charLimit: 120, enigmaTries: 2, color: 'text-blue-400', border: 'border-blue-500/30' },
        'Rank A': { rxp: 300, rcoin: 150, pxp: 150, pcoin: 80, time: 5, charLimit: 80, enigmaTries: 2, color: 'text-cyan-400', border: 'border-cyan-500/40' },
        'Rank S': { rxp: 800, rcoin: 400, pxp: 400, pcoin: 200, time: 3, charLimit: 60, enigmaTries: 1, color: 'text-fuchsia-400', border: 'border-fuchsia-500/50' },
        'Rank SSS':{ rxp: 2000, rcoin: 1000, pxp: 1000, pcoin: 500, time: 1, charLimit: 40, enigmaTries: 1, color: 'text-rose-500', border: 'border-rose-500/60' }
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

            if (mangas && mangas.length > 0) {
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
               showToast(`Falha Absoluta. O Sistema cobrou seu preço.`, "error");
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

    const handlePlayerGenerateIA = async (e) => {
        e.preventDefault();
        const COST = 5000;
        
        if ((userProfileData.coins || 0) < COST) {
            return showToast(`Essência insuficiente. A Forja Astral exige ${COST} M.`, "error");
        }
        
        setIsGeneratingIA(true);
        setIaStatus("A Inteligência Artificial está arquitetando...");

        try {
            const apiKey = ""; 
            const textModelUrl = `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash-preview-09-2025:generateContent?key=${apiKey}`;
            const imageModelUrl = `https://generativelanguage.googleapis.com/v1beta/models/imagen-4.0-generate-001:predict?key=${apiKey}`;

            const finalPrompt = iaPrompt.trim() === '' ? 'Invente um tema mágico e incrivelmente estiloso.' : iaPrompt;

            let regrasEspecificas = "";
            if (categoria === 'capa_fundo') {
                regrasEspecificas = "- CAPA_FUNDO: Apenas cenário épico. PROIBIDO desenhar personagens. ImagePrompt: 'Scenery, landscape, background only, NO CHARACTERS'.";
            } else if (categoria === 'moldura') {
                regrasEspecificas = "- MOLDURA: O objeto DEVE ser um ANEL VAZADO GIGANTE tocando as bordas da tela! ZERO MARGENS! Fundo externo e o miolo interno 100% PRETO SÓLIDO (#000000). ImagePrompt: '2D UI asset, single hollow circular ring, glowing avatar frame border, HUGE, TOUCHING THE ABSOLUTE EDGES OF THE CANVAS, ZERO MARGINS, PURE FLAT SOLID BLACK BACKGROUND #000000, pure flat black empty hole in the center #000000, NO vignettes'. REGRAS CSS: 1) PROIBIDO usar 'background' ou 'background-color'. 2) NUNCA use 'transform' ou 'scale' nos keyframes para molduras (use apenas filter, hue-rotate, opacity, drop-shadow).";
            } else if (categoria === 'avatar') {
                regrasEspecificas = "- AVATAR: Desenhe APENAS o rosto/busto do personagem. Fundo 100% BRANCO SÓLIDO E VAZIO (#FFFFFF). PROIBIDO desenhar fundos, auras ou formas ao redor. FIDELIDADE MÁXIMA: Descreva as características físicas do personagem em INGLÊS no imagePrompt. ImagePrompt OBRIGATÓRIO: 'Close-up portrait of [DESCREVA AS CARACTERÍSTICAS EM INGLÊS], perfectly centered, authentic 2D anime style, clean face, PURE SOLID WHITE BACKGROUND #FFFFFF, completely empty background'. REGRA CSS: DEVE conter um 'background' (ex: linear-gradient) no CSS para colorir o fundo.";
            } else if (categoria === 'nickname') {
                regrasEspecificas = "- NICKNAME: Apenas efeito de texto no CSS. NÃO GERE IMAGEM! O ImagePrompt DEVE ser EXATAMENTE 'NONE'. REGRA CSS: PROIBIDO usar 'background' no CSS, use apenas color, text-shadow, etc.";
            }

            let regraRaridade = `A 'raridade' deve ser escolhida pela IA. Use EXATAMENTE: "comum", "raro", "epico", "lendario" ou "mitico".`;
            if (raridadeSelecionada !== 'aleatorio') {
                regraRaridade = `MUITO IMPORTANTE: A 'raridade' DEVE SER EXATAMENTE: "${raridadeSelecionada}".`;
            }

            const systemInstruction = `Você é o mestre forjador de cosméticos de um App de Mangá. Crie um item da categoria '${categoria}'.
            Pedido do usuário: '${finalPrompt}'.
            
            REGRAS OBRIGATÓRIAS DE IMAGEM:
            ${regrasEspecificas}

            REGRAS CRÍTICAS DE CSS E ANIMAÇÃO (LEIA COM ATENÇÃO): 
            1. O campo 'css' DEVE conter APENAS as propriedades CSS separadas por ponto e vírgula. NÃO use chaves {}, NÃO use seletores. (Ex: 'color: red; box-shadow: 0 0 10px blue;').
            2. ANIMAÇÕES (MUITO IMPORTANTE): Se o usuário sugerir animação (ex: "animado", "piscando", "brilhando", "girando"), você É OBRIGADO a:
               - No campo 'css', adicionar a propriedade 'animation'. (Ex: 'animation: efeitoMagico 2s infinite alternate;')
               - No campo 'keyframes', escrever a regra '@keyframes' COMPLETA e com o MESMO NOME usado no CSS. (Ex: '@keyframes efeitoMagico { 0% { opacity: 0.5; } 100% { opacity: 1; } }')
            3. Se o usuário NÃO pedir animação, deixe o campo 'keyframes' completamente vazio ("").
            
            ${regraRaridade}`;

            const response = await fetch(textModelUrl, {
                method: "POST", headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    contents: [{ parts: [{ text: iaPrompt }] }],
                    systemInstruction: { parts: [{ text: systemInstruction }] },
                    generationConfig: {
                        responseMimeType: "application/json",
                        responseSchema: {
                            type: "OBJECT",
                            properties: {
                                nome: { type: "STRING" },
                                descricao: { type: "STRING" },
                                raridade: { type: "STRING" },
                                css: { type: "STRING", description: "APENAS propriedades CSS (ex: 'color: red; animation: piscar 2s infinite;'). SEM CHAVES." },
                                keyframes: { type: "STRING", description: "A regra @keyframes completa (ex: '@keyframes piscar { ... }'). Vazio se não houver animação pedida." },
                                imagePrompt: { type: "STRING" }
                            },
                            required: ["nome", "descricao", "raridade", "css", "keyframes", "imagePrompt"]
                        }
                    }
                })
            });

            const textData = await response.json();
            const aiResult = JSON.parse(textData.candidates[0].content.parts[0].text);

            let finalImageUrl = "";
            
            if (aiResult.imagePrompt && aiResult.imagePrompt !== "NONE") {
                setIaStatus('Materializando a arte visual...');
                const imgRes = await fetch(imageModelUrl, {
                    method: "POST", headers: { "Content-Type": "application/json" },
                    body: JSON.stringify({ instances: { prompt: aiResult.imagePrompt }, parameters: { sampleCount: 1 } })
                });
                const imgData = await imgRes.json();
                
                if(imgData.predictions && imgData.predictions[0]) {
                    const base64Image = `data:image/png;base64,${imgData.predictions[0].bytesBase64Encoded}`;
                    const resBlob = await fetch(base64Image);
                    let blob = await resBlob.blob();

                    if (iaCategory === 'avatar') {
                        setIaStatus('Recortando impurezas (Remove.bg)...');
                        try {
                            blob = await removeBackgroundWithRemoveBg(blob);
                        } catch(removeErr) {
                            console.warn("Remove.bg failed:", removeErr);
                        }
                    }

                    const file = new File([blob], `forge_${Date.now()}.png`, { type: "image/png" });
                    
                    setIaStatus('Imortalizando no banco de dados...');
                    finalImageUrl = await uploadToCloudinary(file);
                } else {
                    throw new Error("A entidade visual foi bloqueada pelos filtros de segurança da IA.");
                }
            }

            const uniqueId = "item_" + Date.now() + Math.floor(Math.random()*1000);

            await setDoc(doc(db, "loja_itens", uniqueId), {
                nome: aiResult.nome,
                categoria: iaCategory,
                descricao: aiResult.descricao,
                raridade: "mitico",
                preco: 99999, 
                cssClass: uniqueId,
                css: aiResult.css,
                animacao: aiResult.keyframes || "",
                preview: finalImageUrl,
                criador: user.uid,
                createdAt: Date.now()
            });

            const profileRef = doc(db, 'artifacts', APP_ID, 'users', user.uid, 'profile', 'main');
            await updateDoc(profileRef, {
                coins: (userProfileData.coins || 0) - COST,
                inventory: arrayUnion(uniqueId)
            });

            showToast("Cosmético forjado com perfeição e adicionado ao seu inventário!", "success");
            setShowIAModal(false);
            setIaPrompt('');
        } catch(err) {
            showToast("Falha na Forja: " + err.message, "error");
        } finally {
            setIsGeneratingIA(false);
            setIaStatus("");
        }
    };

    const equipped = userProfileData.equipped_items || {};

    return (
        <div className={`max-w-6xl mx-auto px-4 py-8 md:py-12 animate-in fade-in duration-700 relative pb-24 font-sans min-h-screen text-gray-200 ${equipped.tema_perfil ? equipped.tema_perfil.cssClass : 'bg-[#020105]'}`}>
            
            {/* MODAL DE CONFIRMAÇÃO DE MISSÃO */}
            {confirmModal && (
                <div className="fixed inset-0 z-[3000] bg-[#020105]/80 backdrop-blur-xl flex items-center justify-center p-4 animate-in fade-in duration-300" onClick={() => setConfirmModal(null)}>
                    <div className="bg-[#05030a] border border-cyan-500/50 p-8 rounded-[2rem] shadow-2xl max-w-md w-full text-center relative overflow-hidden" onClick={e => e.stopPropagation()}>
                        <Target className="w-16 h-16 text-cyan-400 mx-auto mb-6 animate-pulse" />
                        <h3 className="text-2xl font-black text-white mb-2 tracking-widest uppercase">Firmar Pacto?</h3>
                        <p className="text-xs text-gray-400 font-bold px-2 mb-6 uppercase tracking-wider">A desistência ou falha resultará em severas punições do Sistema.</p>
                        
                        <div className="bg-red-950/40 border border-red-500/30 rounded-2xl p-5 mb-8">
                            <p className="text-[10px] text-red-500 uppercase tracking-[0.3em] font-black mb-2">Preço da Falha</p>
                            <p className="text-xl font-black text-white">-{rankConfigs[confirmModal]?.pxp} XP <span className="text-gray-600 px-2">|</span> -{rankConfigs[confirmModal]?.pcoin} M</p>
                        </div>
                        
                        <div className="flex gap-4">
                            <button onClick={() => setConfirmModal(null)} className="flex-1 bg-transparent border border-white/10 text-gray-400 font-black py-4 rounded-xl hover:bg-white/5 hover:text-white transition-colors text-xs uppercase tracking-widest">Recuar</button>
                            <button onClick={() => triggerForgeMission(confirmModal)} className="flex-1 bg-cyan-500 text-black rounded-xl font-black py-4 transition-all hover:bg-cyan-400 text-xs uppercase tracking-widest">
                                Aceitar
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* MODAL DA FORJA IA DO JOGADOR */}
            {showIAModal && (
                <div className="fixed inset-0 z-[4000] bg-[#020105]/90 backdrop-blur-xl flex items-center justify-center p-4 animate-in fade-in duration-300">
                    <div className="bg-[#05030a] border border-purple-500/50 p-8 rounded-[2.5rem] shadow-2xl max-w-lg w-full relative overflow-hidden" onClick={e => e.stopPropagation()}>
                        <div className="absolute -top-40 -right-40 w-80 h-80 bg-purple-600/20 rounded-full blur-[80px] pointer-events-none"></div>
                        <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-indigo-600/20 rounded-full blur-[80px] pointer-events-none"></div>

                        <div className="relative z-10">
                            <h3 className="text-3xl font-black text-white flex items-center gap-3 mb-2 uppercase tracking-tighter"><Wand2 className="w-8 h-8 text-purple-500" /> Forja Astral</h3>
                            <p className="text-gray-400 text-xs font-bold uppercase tracking-widest mb-8">Pague 5000 M e a IA criará uma relíquia mítica exclusiva para você.</p>

                            {isGeneratingIA ? (
                                <div className="flex flex-col items-center text-center animate-pulse py-10">
                                    <div className="w-20 h-20 mb-6 bg-purple-900/30 rounded-full flex items-center justify-center border border-purple-500/50">
                                        <Wand2 className="w-10 h-10 text-purple-400 animate-spin" style={{ animationDuration: '3s' }}/>
                                    </div>
                                    <h2 className="text-2xl font-black text-white bg-clip-text text-transparent bg-gradient-to-r from-purple-400 to-indigo-400 uppercase tracking-tighter">Canalizando Magia...</h2>
                                    <p className="text-gray-500 mt-3 font-bold text-xs uppercase tracking-widest">{iaStatus}</p>
                                </div>
                            ) : (
                                <form onSubmit={handlePlayerGenerateIA} className="space-y-6">
                                    <div>
                                        <label className="block text-[10px] font-black text-gray-500 uppercase tracking-[0.2em] mb-3">Categoria da Relíquia</label>
                                        <div className="grid grid-cols-2 gap-3">
                                            {['avatar', 'moldura', 'capa_fundo', 'nickname'].map(cat => (
                                                <button type="button" key={cat} onClick={()=>setIaCategory(cat)} className={`py-3 text-xs font-black rounded-xl border transition-all uppercase tracking-widest ${iaCategory === cat ? 'bg-purple-600 border-purple-500 text-white shadow-lg shadow-purple-600/30' : 'bg-gray-900/50 text-gray-500 border-white/5 hover:text-white'}`}>
                                                    {cat.replace('_', ' ')}
                                                </button>
                                            ))}
                                        </div>
                                    </div>

                                    <div>
                                        <label className="block text-[10px] font-black text-gray-500 uppercase tracking-[0.2em] mb-2">Descrição (Opcional)</label>
                                        <textarea value={iaPrompt} onChange={e=>setIaPrompt(e.target.value)} placeholder="Ex: Cabelos de fogo azul e olhos brilhantes, estilo anime..." rows="3" className="w-full bg-black/40 p-4 rounded-2xl border border-white/10 text-white outline-none focus:border-purple-500 resize-none transition-colors text-sm font-medium" />
                                    </div>

                                    <div className="flex gap-4 pt-4 border-t border-white/10">
                                        <button type="button" onClick={() => setShowIAModal(false)} className="flex-1 bg-transparent border border-white/10 text-gray-400 font-black py-4 rounded-xl hover:bg-white/5 hover:text-white transition-colors text-xs uppercase tracking-widest">
                                            Cancelar
                                        </button>
                                        <button type="submit" className="flex-[2] bg-gradient-to-r from-purple-600 to-indigo-600 text-white rounded-xl font-black py-4 transition-all shadow-lg shadow-purple-600/30 text-xs uppercase tracking-widest hover:scale-[1.02]">
                                            Sintetizar • 5000 M
                                        </button>
                                    </div>
                                </form>
                            )}
                        </div>
                    </div>
                </div>
            )}

            <div className="flex justify-start sm:justify-center gap-3 mb-12 overflow-x-auto no-scrollbar pb-4 relative z-20 w-full px-2 snap-x">
                {['Missões', 'Forja', 'Loja', 'Ranking'].map((tab) => (
                    <button 
                        key={tab}
                        onClick={() => setActiveTab(tab)} 
                        className={`snap-center flex-shrink-0 whitespace-nowrap px-6 py-3 rounded-2xl font-bold transition-all flex items-center gap-2 text-[11px] sm:text-xs uppercase tracking-wider
                        ${activeTab === tab ? 'text-white border-transparent bg-cyan-600 shadow-md' : 'text-gray-500 border border-white/5 hover:text-cyan-400 hover:bg-white/5'}`}
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
                <div className="animate-in fade-in duration-500 relative z-10">
                    {userProfileData.activeMission ? (
                        <div className="bg-white/[0.02] backdrop-blur-2xl border border-white/10 p-8 md:p-12 rounded-[3rem] relative overflow-hidden max-w-4xl mx-auto">
                            
                            <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 mb-10 relative z-10">
                               <div>
                                  <span className={`text-[10px] font-black uppercase tracking-[0.3em] px-4 py-2 rounded-xl border ${rankConfigs[userProfileData.activeMission.difficulty].color} ${rankConfigs[userProfileData.activeMission.difficulty].border}`}>
                                    {userProfileData.activeMission.difficulty}
                                  </span>
                                  <h3 className="text-3xl md:text-5xl font-black text-white mt-6 tracking-tighter uppercase">{userProfileData.activeMission.title}</h3>
                               </div>
                               <div className="flex items-center gap-3 text-cyan-400 font-black bg-cyan-950/20 px-6 py-3 rounded-2xl border border-cyan-500/30">
                                   <Timer className="w-5 h-5 animate-pulse" /> <span className="tracking-[0.2em] text-sm md:text-base">{timeLeft}</span>
                               </div>
                            </div>
                            
                            {userProfileData.activeMission.type === 'read' && (
                                <div className="bg-[#020105]/80 p-8 rounded-3xl border border-white/5 mb-10 relative z-10">
                                   <p className="text-gray-300 font-bold text-sm md:text-base mb-8 leading-relaxed uppercase tracking-wider">{userProfileData.activeMission.desc}</p>
                                   
                                   <div className="w-full bg-[#05030a] rounded-full h-3 overflow-hidden mb-4 border border-white/5">
                                       <div className="bg-cyan-500 h-full transition-all duration-1000 ease-out relative" style={{width: `${(userProfileData.activeMission.currentCount / userProfileData.activeMission.targetCount) * 100}%`}}>
                                       </div>
                                   </div>
                                   <div className="flex justify-between text-[10px] text-cyan-500 font-black tracking-[0.2em] uppercase">
                                       <span>Poder Extraído</span>
                                       <span>{userProfileData.activeMission.currentCount} / {userProfileData.activeMission.targetCount} Caps</span>
                                   </div>

                                   <button onClick={() => { const m = mangas.find(mg => mg.id === userProfileData.activeMission.targetManga); if(m) onNavigate('details', m); }} className="w-full mt-10 bg-transparent border border-cyan-600 text-cyan-400 hover:bg-cyan-600 hover:text-black rounded-2xl font-black py-4 flex items-center justify-center gap-3 transition-all text-xs uppercase tracking-widest group/btn">
                                        Rastrear Obra <ArrowRight className="w-4 h-4 group-hover/btn:translate-x-2 transition-transform" />
                                   </button>
                                </div>
                            )}

                            {userProfileData.activeMission.type === 'search_local' && (
                                <div className="bg-[#020105]/80 p-8 rounded-3xl border border-white/5 mb-10 relative z-10">
                                    <p className="text-gray-100 font-bold text-sm leading-relaxed whitespace-pre-wrap tracking-wider uppercase">{userProfileData.activeMission.question}</p>
                                </div>
                            )}
                            
                            {userProfileData.activeMission.type === 'enigma' && (
                                <div className="bg-[#020105]/80 p-8 rounded-3xl border border-white/5 mb-10 relative z-10">
                                   <p className="text-gray-100 font-bold text-sm leading-relaxed whitespace-pre-wrap mb-8 uppercase tracking-wider">{userProfileData.activeMission.question}</p>
                                   <form onSubmit={handleEnigmaSubmit} className="flex flex-col gap-4">
                                      <input type="text" value={enigmaAnswer} onChange={e=>setEnigmaAnswer(e.target.value)} placeholder="Sua Resposta..." className="w-full bg-[#05030a] border border-cyan-600/30 rounded-2xl px-6 py-5 text-white font-black outline-none focus:border-cyan-600 transition-all text-sm uppercase tracking-widest" />
                                      <button type="submit" className="w-full bg-transparent border border-cyan-600 text-cyan-400 hover:bg-cyan-600 hover:text-black rounded-2xl font-black py-4 transition-all text-xs uppercase tracking-widest flex items-center justify-center gap-3 group/btn">
                                          Decifrar <Key className="w-4 h-4 group-hover/btn:rotate-45 transition-transform" />
                                      </button>
                                   </form>
                                   <p className="text-center mt-6 text-[10px] text-gray-500 font-black uppercase tracking-[0.3em]">Tentativas Restantes: <span className="text-cyan-400 text-sm ml-2">{userProfileData.activeMission.attemptsLeft}</span></p>
                                </div>
                            )}

                            <div className="flex flex-col sm:flex-row items-center justify-between border-t border-white/10 pt-8 relative z-10 gap-6">
                               <div className="flex gap-8 bg-black/40 rounded-xl px-6 py-3 border border-white/5">
                                  <span className="flex items-center gap-2 text-white font-black text-sm uppercase tracking-widest"><Sparkles className="w-4 h-4 text-white"/> +{userProfileData.activeMission.rewardXp} XP</span>
                                  <span className="flex items-center gap-2 text-amber-400 font-black text-sm uppercase tracking-widest"><div className="w-3 h-3 rounded-full bg-amber-400"></div> +{userProfileData.activeMission.rewardCoins} M</span>
                               </div>
                               <button onClick={cancelMission} className="text-[10px] text-red-500 hover:text-red-400 hover:bg-red-950/20 px-4 py-2 rounded-xl font-black uppercase tracking-[0.2em] transition-colors flex items-center gap-2 border border-transparent hover:border-red-900/50"><Skull className="w-4 h-4"/> Abortar</button>
                            </div>
                        </div>
                    ) : (
                        <div className="space-y-8">
                            {isForgingMission ? (
                                <div className="bg-white/[0.02] border border-cyan-500/30 rounded-[3rem] p-20 flex flex-col items-center justify-center text-center max-w-3xl mx-auto relative overflow-hidden">
                                   <Loader2 className="w-12 h-12 text-cyan-400 animate-spin mb-8 relative z-10" />
                                   <h3 className="text-2xl font-black text-white mb-3 uppercase tracking-widest relative z-10">Buscando Contrato...</h3>
                                   <p className="text-xs text-cyan-500/80 font-bold uppercase tracking-[0.4em] relative z-10">Sincronizando com o Sistema.</p>
                                </div>
                            ) : (
                                <>
                                    <div className="text-center max-w-3xl mx-auto mb-16">
                                        <h2 className="text-4xl md:text-5xl font-black text-white mb-6 uppercase tracking-tighter">Painel de <span className="text-cyan-400">Contratos</span></h2>
                                        <p className="text-gray-400 text-sm md:text-base leading-relaxed font-medium">Selecione uma patente. O sistema forjará um desafio aleatório baseado nos registros da biblioteca. Risco e recompensa andam juntos.</p>
                                    </div>
                                    
                                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 max-w-6xl mx-auto">
                                        {RANK_CARDS.map(rId => {
                                            const r = rankConfigs[rId];
                                            return (
                                                <div key={rId} className={`bg-white/[0.02] backdrop-blur-md border ${r.border} rounded-3xl p-8 md:p-10 flex flex-col justify-between transition-all duration-500 hover:-translate-y-2 group relative overflow-hidden`}>
                                                    <div className="mb-10 relative z-10">
                                                        <h3 className={`text-3xl font-black tracking-tighter uppercase mb-8 ${r.color}`}>{rId}</h3>
                                                        <div className="space-y-4">
                                                            <div className="flex items-center justify-between text-xs font-black uppercase tracking-widest bg-black/40 rounded-xl px-4 py-2.5 border border-white/5">
                                                                <span className="text-gray-500">Poder</span>
                                                                <span className="text-white flex items-center gap-2"><Sparkles className={`w-4 h-4 ${r.color} opacity-80`}/> {r.rxp} XP</span>
                                                            </div>
                                                            <div className="flex items-center justify-between text-xs font-black uppercase tracking-widest bg-black/40 rounded-xl px-4 py-2.5 border border-white/5">
                                                                <span className="text-gray-500">Tesouro</span>
                                                                <span className="text-white flex items-center gap-2"><div className="w-3 h-3 rounded-full bg-amber-400 opacity-80"></div> {r.rcoin} M</span>
                                                            </div>
                                                        </div>
                                                    </div>
                                                    <button onClick={() => setConfirmModal(rId)} className={`w-full py-4 rounded-2xl font-black text-[10px] uppercase tracking-[0.2em] transition-all bg-transparent border border-white/20 text-white hover:bg-white hover:text-black relative z-10`}>
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
                    <div className="bg-white/[0.02] backdrop-blur-2xl border border-cyan-500/30 rounded-[3rem] p-10 md:p-16 text-center relative overflow-hidden">
                        <Hexagon className="w-20 h-20 mx-auto mb-10 text-cyan-400 opacity-90 animate-[spin_10s_linear_infinite] relative z-10" />
                        <h2 className="text-3xl md:text-5xl font-black text-white mb-6 relative z-10 uppercase tracking-tighter">Fornalha <span className="text-cyan-400">Cósmica</span></h2>
                        <p className="text-gray-400 text-sm mb-12 leading-relaxed font-medium relative z-10">Sintetize <b className="text-cyan-500 font-black">5 Cristais</b> encontrados durante a leitura. Recompensas massivas aguardam, mas a anomalia possui <span className="text-red-500 font-black">40% de chance</span> de desintegrar os materiais.</p>
                        <div className="bg-[#020105]/80 border border-white/10 rounded-3xl p-8 mb-12 relative z-10 max-w-xs mx-auto">
                            <span className="text-[10px] uppercase font-black text-gray-500 tracking-[0.3em] mb-4 block">Energia Armazenada</span>
                            <div className="flex items-center justify-center gap-4 text-5xl font-black text-white">
                                {userProfileData.crystals || 0} <Hexagon className="w-10 h-10 text-cyan-400" />
                            </div>
                        </div>
                        <button onClick={runSynthesis} disabled={synthesizing || (userProfileData.crystals || 0) < 5} className="w-full bg-transparent border-2 rounded-2xl border-cyan-500 text-cyan-400 hover:bg-cyan-500 hover:text-black disabled:bg-transparent disabled:border-white/5 disabled:text-gray-600 font-black py-5 px-8 transition-all duration-300 relative z-10 text-xs uppercase tracking-widest flex items-center justify-center gap-3">
                            {synthesizing ? <><Loader2 className="w-5 h-5 animate-spin" /> Fundindo Matéria...</> : 'Iniciar Fusão (Custa 5)'}
                        </button>
                    </div>
                </div>
            )}

            {/* CONTEÚDO: LOJA */}
            {activeTab === "Loja" && (
                <div className="animate-in fade-in duration-500 relative z-10 max-w-7xl mx-auto">
                    
                    <div className="mb-10 bg-gradient-to-r from-purple-900/40 to-cyan-900/20 border border-purple-500/40 rounded-[2.5rem] p-8 md:p-10 flex flex-col md:flex-row items-center justify-between gap-8 relative overflow-hidden group hover:border-purple-400 transition-colors">
                        <div className="absolute top-0 right-0 w-64 h-64 bg-purple-500/10 rounded-full blur-[80px] pointer-events-none group-hover:bg-purple-500/20 transition-all duration-700"></div>
                        <div className="relative z-10 text-center md:text-left">
                            <h4 className="text-2xl md:text-3xl font-black text-white flex items-center justify-center md:justify-start gap-3 mb-3 uppercase tracking-tighter">
                                <Wand2 className="w-8 h-8 text-purple-400"/> Forja Astral (IA)
                            </h4>
                            <p className="text-gray-400 text-xs md:text-sm font-bold uppercase tracking-widest leading-relaxed max-w-2xl">
                                Utilize a Inteligência Artificial para conjurar um cosmético mítico e exclusivo. <br className="hidden md:block" />
                                O item será depositado diretamente no seu inventário!
                            </p>
                        </div>
                        <button onClick={() => setShowIAModal(true)} className="w-full md:w-auto px-8 py-5 bg-purple-600 hover:bg-purple-500 text-white font-black rounded-2xl transition-all shadow-lg shadow-purple-600/30 uppercase tracking-[0.2em] text-xs flex items-center justify-center gap-3 flex-shrink-0 hover:scale-[1.02]">
                            <Sparkles className="w-5 h-5"/> Forjar • 1000 M
                        </button>
                    </div>

                    <div className="flex flex-col sm:flex-row justify-between items-center gap-8 mb-12 bg-white/[0.02] rounded-[2.5rem] p-8 border border-white/5 backdrop-blur-md">
                        <div className="text-center sm:text-left">
                            <h3 className="text-3xl font-black text-white mb-2 uppercase tracking-tight">Cosméticos <span className="text-cyan-400">Astral</span></h3>
                            <p className="text-gray-400 text-xs font-bold uppercase tracking-widest">Forje sua identidade visual.</p>
                        </div>
                        <div className="bg-black/60 border rounded-2xl border-amber-500/30 text-amber-400 font-black px-8 py-4 flex items-center gap-3 text-lg">
                            <div className="w-4 h-4 rounded-full bg-amber-400"></div>
                            {userProfileData.coins || 0}
                        </div>
                    </div>
                      
                    <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-5">
                        {shopItems.filter(item => {
                            const cat = (item.categoria || item.type || '').toLowerCase();
                            return ['avatar', 'nickname', 'capa_fundo', 'capa', 'moldura', 'tema_perfil'].includes(cat);
                        }).map(item => {
                          const hasItem = userProfileData.inventory?.includes(item.id);
                          const isEquipped = userProfileData.equipped_items?.[item.categoria]?.id === item.id;
                          const cat = (item.categoria || item.type || '').toLowerCase();

                          return (
                            <div key={item.id} className={`bg-[#05030a] border rounded-[2rem] p-6 flex flex-col items-center text-center transition-all duration-500 group relative overflow-hidden ${isEquipped ? 'border-cyan-500 bg-cyan-950/20' : 'border-white/5 hover:border-cyan-500/40'}`}>
                              
                              {/* Aqui injetamos o código da IA, garantindo que o keyframes seja carregado junto */}
                              {(item.css || item.animacao || item.keyframes) && (
                                 <style dangerouslySetInnerHTML={{__html: `
                                    .${item.cssClass || 'custom-ia-class'} { ${item.css || ''} }
                                    ${item.animacao || item.keyframes || ''}
                                 `}} />
                              )}

                              <div className={`w-28 h-28 rounded-2xl mb-6 bg-[#020105] flex items-center justify-center overflow-hidden border border-white/5 relative flex-shrink-0 ${cat === 'avatar' ? (item.cssClass || 'custom-ia-class') : ''}`}>
                                
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
                                    <div className={`font-black text-xl z-20 ${item.cssClass || 'custom-ia-class'}`}>NomeAqui</div>
                                )}

                                {(!item.preview && !['nickname'].includes(cat)) && (
                                    <Sparkles className="w-8 h-8 text-gray-600 relative z-10"/>
                                )}
                              </div>

                              <p className={`text-[8px] uppercase tracking-[0.2em] font-black mb-2 px-2 py-1 rounded bg-black/40 border border-white/5 relative z-10 ${getRarityColor(item.raridade)}`}>{item.categoria || item.type}</p>
                              <h4 className="text-white font-black mb-6 text-sm line-clamp-1 relative z-10">{item.nome || item.name}</h4>
                              
                              {hasItem ? (
                                <button onClick={() => equipItem(item)} className={`w-full rounded-xl font-black py-3 transition-all text-[10px] uppercase tracking-widest relative z-10 ${isEquipped ? 'bg-cyan-500 text-black' : 'bg-transparent text-gray-400 hover:text-white hover:border-white/50 border border-white/10'}`}>{isEquipped ? 'Desequipar' : 'Equipar'}</button>
                              ) : (
                                <button onClick={() => buyItem(item)} className="w-full rounded-xl bg-amber-500 text-black hover:bg-amber-400 font-black py-3 transition-colors text-[10px] uppercase tracking-widest relative z-10">Comprar • {item.preco || item.price}</button>
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
                        <h2 className="text-4xl md:text-5xl font-black text-white mb-4 uppercase tracking-tighter">Hierarquia <span className="text-cyan-400">Global</span></h2>
                        <p className="text-gray-400 text-xs font-bold uppercase tracking-[0.3em]">As entidades supremas da plataforma.</p>
                    </div>
                    
                    {loadingRank ? (
                        <div className="flex flex-col items-center justify-center py-24"><Loader2 className="w-12 h-12 text-cyan-400 animate-spin mb-6"/><p className="text-cyan-500 text-[10px] font-black uppercase tracking-[0.4em]">Sincronizando Matriz...</p></div>
                    ) : rankingList.length === 0 ? (
                        <p className="text-center text-gray-600 py-20 font-black uppercase tracking-[0.2em] text-sm">O ranking aguarda os primeiros conquistadores.</p>
                    ) : (
                        <div className="space-y-4">
                            {rankingList.map((player, index) => (
                                <div key={player.id} className={`bg-white/[0.02] backdrop-blur-md rounded-3xl border p-5 sm:p-6 flex items-center gap-4 sm:gap-8 transition-all duration-500 hover:scale-[1.02] ${index < 3 ? 'border-cyan-500/30 bg-cyan-950/10' : 'border-white/5 hover:bg-white/[0.05] hover:border-white/10'}`}>
                                    <div className={`w-8 sm:w-12 font-black text-center text-lg sm:text-2xl ${index === 0 ? 'text-amber-400' : index === 1 ? 'text-gray-300' : index === 2 ? 'text-amber-700' : 'text-gray-600'}`}>
                                        #{index + 1}
                                    </div>
                                    
                                    <div className={`relative w-12 h-12 sm:w-16 sm:h-16 rounded-full flex items-center justify-center flex-shrink-0 group`}>
                                        
                                        {player.equipped_items?.avatar?.css && (
                                            <style dangerouslySetInnerHTML={{__html: `.${player.equipped_items.avatar.cssClass || 'custom-avatar'} { ${player.equipped_items.avatar.css} } \n ${player.equipped_items.avatar.animacao || player.equipped_items.avatar.keyframes || ''}`}} />
                                        )}
                                        {player.equipped_items?.moldura?.css && (
                                            <style dangerouslySetInnerHTML={{__html: `.${player.equipped_items.moldura.cssClass || 'custom-moldura'} { ${player.equipped_items.moldura.css} } \n ${player.equipped_items.moldura.animacao || player.equipped_items.moldura.keyframes || ''}`}} />
                                        )}

                                        <div className={`w-full h-full rounded-full overflow-hidden border border-white/10 relative z-10 bg-[#020105] ${player.equipped_items?.avatar ? (player.equipped_items.avatar.cssClass || 'custom-avatar') : ''}`}>
                                            <img src={cleanCosmeticUrl(player.avatarUrl) || `https://placehold.co/100x100/020105/22d3ee?text=${player.displayName?.charAt(0) || 'U'}`} className="w-full h-full object-cover z-0 relative" onError={(e)=>e.target.src=`https://placehold.co/100x100/020105/22d3ee?text=${player.displayName?.charAt(0) || 'U'}`} />
                                        </div>
                                        
                                        {player.equipped_items?.moldura?.preview && (
                                            <img src={cleanCosmeticUrl(player.equipped_items.moldura.preview)} className={`absolute inset-[-10%] w-[120%] h-[120%] object-cover z-20 pointer-events-none max-w-none rounded-full ${player.equipped_items.moldura.cssClass || 'custom-moldura'}`} />
                                        )}
                                    </div>

                                    <div className="flex-1 min-w-0">
                                        {player.equipped_items?.nickname?.css && (
                                            <style dangerouslySetInnerHTML={{__html: `.${player.equipped_items.nickname.cssClass || 'custom-nick'} { ${player.equipped_items.nickname.css} } \n ${player.equipped_items.nickname.animacao || player.equipped_items.nickname.keyframes || ''}`}} />
                                        )}
                                        <h4 className={`font-black text-base sm:text-lg truncate uppercase tracking-wider ${index < 3 ? 'text-white' : 'text-gray-300'} ${player.equipped_items?.nickname ? (player.equipped_items.nickname.cssClass || 'custom-nick') : ''}`}>
                                            {player.displayName || "Entidade Oculta"}
                                        </h4>
                                        <p className="text-[10px] text-cyan-400 font-bold uppercase tracking-[0.2em] truncate mt-1">{getLevelTitle(player.level)}</p>
                                    </div>
                                    <div className="text-right flex-shrink-0 flex flex-col items-end">
                                        <div className="text-[10px] rounded-xl font-black text-white bg-black/50 border border-white/10 px-4 py-1.5 uppercase tracking-widest">Nível {player.level}</div>
                                        <div className="text-[10px] text-cyan-400 font-black mt-2 uppercase tracking-widest">{player.xp} XP</div>
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
