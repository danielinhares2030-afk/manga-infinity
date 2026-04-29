import React, { useState, useEffect, useRef } from 'react';
import { Compass, History, Library, Camera, Edit3, LogOut, Loader2, BookOpen, AlertTriangle, Trophy, Zap, Trash2, RefreshCw, Settings, Flame, Eye, Bookmark, Hexagon, Crown, Ghost, Lock, Sparkles, Box, ChevronRight, Swords, Monitor, Bell, EyeOff, Plus } from 'lucide-react';
import { updateProfile } from "firebase/auth";
import { doc, setDoc, deleteDoc, updateDoc, getDocs, collectionGroup, query } from "firebase/firestore";
import { auth, db } from './firebase';
import { APP_ID } from './constants';
import { compressImage, getLevelRequirement, getLevelTitle, cleanCosmeticUrl, timeAgo, getRarityColor } from './helpers';

// CARTÃO DE ESTATÍSTICA DETALHADA
const StatCard = ({ icon, label, value, colorClass }) => (
    <div className={`bg-[#050505] border border-white/5 rounded-2xl p-5 flex flex-col items-center justify-center text-center shadow-lg hover:border-${colorClass.split('-')[1]}/50 transition-colors group`}>
        <div className={`p-3 bg-[#0a0a0c] rounded-full border border-white/5 ${colorClass} mb-4 group-hover:scale-110 transition-transform duration-300`}>
            <StatIcon icon={icon} className="w-6 h-6" />
        </div>
        <span className="text-xl sm:text-2xl font-black text-white">{value}</span>
        <span className="text-[10px] text-gray-500 font-bold uppercase tracking-widest mt-1.5">{label}</span>
        <span className="text-[8px] text-gray-700 font-medium mt-0.5">{label === 'Obras Salvas' ? 'Total de mangás' : label === 'Caps Lidos' ? 'Capítulos lidos' : label === 'Iniciadas' ? 'Mangás começados' : 'Poder Vital total'}</span>
    </div>
);

// ÍCONE DE ESTATÍSTICA FLEXÍVEL
const StatIcon = ({ icon: Icon, className }) => <Icon className={className} />;

// CARTÃO SOMBRIO KAGE (Para o cabeçalho do perfil)
const ShadowCard = ({ children, className = "" }) => (
    <div className={`bg-[#0a0a0c]/90 border border-red-600/30 rounded-3xl p-6 shadow-[0_0_40px_rgba(220,38,38,0.1)] relative overflow-hidden backdrop-blur-xl ${className}`}>
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-1/2 h-[1px] bg-gradient-to-r from-transparent via-red-600/60 to-transparent"></div>
        <div className="relative z-10">{children}</div>
    </div>
);

// EMBLEMA DE CONQUISTA
const AchievementBadge = ({ badge, isEquipped, onEquip }) => (
    <div className={`flex items-center p-3 sm:p-4 border transition-all duration-300 relative group rounded-2xl overflow-hidden ${badge.condition ? isEquipped ? 'bg-[#0a0a0c] border-red-500 shadow-[0_0_15px_rgba(220,38,38,0.2)]' : 'bg-[#050505] border-white/5 hover:border-red-600/50' : 'bg-[#030305] border-white/5 opacity-40 grayscale'}`}>
        <div className={`w-14 h-14 sm:w-16 sm:h-16 flex-shrink-0 rounded-full flex items-center justify-center mr-4 transition-transform duration-500 group-hover:scale-105`}>
            {badge.image ? <img src={badge.image} alt={badge.title} className="w-full h-full object-contain" /> : <StatIcon icon={badge.icon} className={`w-6 h-6 ${badge.condition ? badge.colorClass : 'text-gray-600'}`} />}
        </div>
        <div className="flex-1 min-w-0">
            <h4 className={`font-black text-[11px] sm:text-xs uppercase tracking-widest line-clamp-1 mb-1 ${badge.condition ? (isEquipped ? 'text-red-400' : 'text-white') : 'text-gray-500'}`}>{badge.title}</h4>
            <p className="text-[9px] sm:text-[10px] text-gray-400 font-bold line-clamp-2 leading-snug">{badge.description}</p>
            {badge.condition && <button onClick={() => onEquip(badge)} className={`mt-2 text-[9px] font-black uppercase tracking-widest transition-colors ${isEquipped ? 'text-red-500' : 'text-gray-500 hover:text-white'}`}>{isEquipped ? '✓ Equipado' : 'Equipar'}</button>}
        </div>
    </div>
);

export function ProfileView({ user, userProfileData, historyData, libraryData, dataLoaded, userSettings, updateSettings, onLogout, onUpdateData, showToast, mangas, onNavigate, shopItems = [] }) {
    const [isEditing, setIsEditing] = useState(false);
    const [activeTab, setActiveTab] = useState("Estatísticas");
    const [inventoryCategory, setInventoryCategory] = useState("avatar");
    const [name, setName] = useState('');
    const [bio, setBio] = useState('');
    const [avatarBase64, setAvatarBase64] = useState('');
    const [coverBase64, setCoverBase64] = useState('');
    const [loading, setLoading] = useState(false);
    const [confirmAction, setConfirmAction] = useState(null);
    const [rankingList, setRankingList] = useState([]);
    const [loadingRank, setLoadingRank] = useState(false);

    useEffect(() => {
        setName(user.displayName || '');
        setBio(userProfileData.bio || '');
        setAvatarBase64(userProfileData.avatarUrl || user.photoURL || '');
        setCoverBase64(userProfileData.coverUrl || '');
    }, [user, userProfileData]);

    useEffect(() => {
        if (activeTab === 'Estatísticas') fetchRanking();
    }, [activeTab]);

    const fetchRanking = async () => {
        setLoadingRank(true);
        try {
            const snap = await getDocs(query(collectionGroup(db, 'profile')));
            let rankData = [];
            snap.forEach(doc => {
                if (doc.ref.path.includes('main') && (doc.data().level || doc.data().name)) {
                    rankData.push({ id: doc.ref.parent.parent.id, ...doc.data() });
                }
            });
            rankData.sort((a, b) => {
                if (b.level !== a.level) return (b.level || 1) - (a.level || 1);
                return (b.xp || 0) - (a.xp || 0);
            });
            setRankingList(rankData.slice(0, 50));
        } catch (e) {
            console.error("Falha na Matriz Sombria ao buscar ranking.", e);
        } finally {
            setLoadingRank(false);
        }
    };

    const avatarInputRef = useRef(null);
    const coverInputRef = useRef(null);

    const handleImageUpload = async (e, type) => {
        const file = e.target.files[0];
        if (!file) return;
        try {
            const compressedBase64 = await compressImage(file, type === 'cover' ? 400 : 150, 0.4);
            if (type === 'avatar') setAvatarBase64(compressedBase64);
            else setCoverBase64(compressedBase64);
        } catch (err) {
            showToast("Erro na imagem.", "error");
        }
    };

    const handleSave = async (e) => {
        e.preventDefault();
        setLoading(true);
        try {
            await updateProfile(auth.currentUser, { displayName: name });
            const docData = { coverUrl: coverBase64, avatarUrl: avatarBase64, bio: bio };
            await setDoc(doc(db, 'artifacts', APP_ID, 'users', user.uid, 'profile', 'main'), docData, { merge: true });
            onUpdateData(docData);
            showToast('Perfil forjado nas sombras!', 'success');
            setIsEditing(false);
        } catch (error) {
            showToast(`Erro ao salvar.`, 'error');
        } finally {
            setLoading(false);
        }
    };

    const handleEquipCosmetic = async (item) => {
        try {
            const profileRef = doc(db, 'artifacts', APP_ID, 'users', user.uid, 'profile', 'main');
            const currentEquipped = userProfileData.equipped_items || {};
            let cat = (item.categoria || item.type || '').toLowerCase();
            if (cat === 'capa') cat = 'capa_fundo';

            const isEquipped = currentEquipped[cat]?.id === item.id;
            const newEquipped = { ...currentEquipped };

            if (isEquipped) {
                delete newEquipped[cat];
                showToast("Selo desequipado.", "info");
            } else {
                newEquipped[cat] = item;
                showToast(`${item.nome || item.name} equipado.`, "success");
            }

            await setDoc(profileRef, { equipped_items: newEquipped }, { merge: true });
            onUpdateData({ equipped_items: newEquipped });
        } catch (e) {
            showToast("Erro nas sombras ao equipar.", "error");
        }
    };

    const executeConfirmAction = async () => {
        if (confirmAction === 'history') {
            try {
                historyData.forEach(async (h) => {
                    await updateDoc(doc(db, 'artifacts', APP_ID, 'users', user.uid, 'history', h.id), { cleared: true });
                });
                showToast("Memórias apagadas.", "success");
            } catch (e) {
                showToast("Erro ao limpar.", "error");
            }
        }
        else if (confirmAction === 'cache') {
            localStorage.clear();
            sessionStorage.clear();
            window.location.reload(true);
        }
        setConfirmAction(null);
    };

    const level = userProfileData.level || 1;
    const currentXp = userProfileData.xp || 0;
    const xpNeeded = getLevelRequirement(level);
    const progressPercent = Math.min(100, Math.max(0, (currentXp / xpNeeded) * 100));
    const xpRemainingForNextLevel = xpNeeded - currentXp;

    const lidosSet = new Set(historyData.map(h => h.mangaId));
    const obrasLidasIds = Array.from(lidosSet);
    const libraryMangaIds = Object.keys(libraryData);
    const eq = userProfileData.equipped_items || {};

    const activeAvatarSrc = (eq.avatar?.preview ? cleanCosmeticUrl(eq.avatar.preview) : null) || avatarBase64 || `https://placehold.co/150x150/0A0E17/22d3ee?text=K`;

    const readCount = historyData.length;
    const favCount = Object.keys(libraryData).length;
    const crystalsCount = userProfileData.crystals || 0;
    const coinsCount = userProfileData.coins || 0;

    const badgesList = [
        { id: 'iniciado', level: 1, image: 'https://i.ibb.co/VcF093w9/file-000000000a60720ea0dc89a96aeb27e0-removebg-preview.png', title: "Olho do Corvo", description: "Desvenda 10 capítulos no sistema.", condition: readCount >= 10, colorClass: "text-red-500" },
        { id: 'guardiao', level: 2, image: 'https://i.ibb.co/7NZVyW5f/file-00000000f4e871f580ac8750e4721f56-removebg-preview.png', title: "Pacto Sombrio", description: "Sela 5 obras em sua guarda.", condition: favCount >= 5, colorClass: "text-purple-500" },
        { id: 'diamante', level: 3, image: 'https://i.ibb.co/B2PkBMDX/file-00000000482871f5a7d7653e8ca359e3-removebg-preview.png', title: "Diamante Sombrio", description: "Consome 50 cristais nexo.", condition: crystalsCount >= 50, colorClass: "text-blue-500" },
        { id: 'espectro', level: 4, image: 'https://i.ibb.co/cK3rLmhY/file-00000000a89471f5b61f4284cf8c9779-removebg-preview.png', title: "Espectro Kage", description: "Transcreve a alma ao Nível 10.", condition: level >= 10, colorClass: "text-rose-500" },
        { id: 'ouro', level: 5, icon: Crown, title: "Avareza Escarlate", description: "Acumula 1000 moedas astrais.", condition: coinsCount >= 1000, colorClass: "text-amber-500" }
    ];

    const handleEquipBadge = async (badge) => {
        if (!badge.condition) return;
        try {
            const profileRef = doc(db, 'artifacts', APP_ID, 'users', user.uid, 'profile', 'main');
            const currentEquipped = userProfileData.equipped_items || {};
            const isEquipped = currentEquipped.emblema?.id === badge.id;
            const newEquipped = { ...currentEquipped };
            if (isEquipped) {
                delete newEquipped.emblema;
                showToast("Selo desequipado.", "info");
            } else {
                newEquipped.emblema = { id: badge.id };
                showToast(`${badge.title} equipado.`, "success");
            }
            await setDoc(profileRef, { equipped_items: newEquipped }, { merge: true });
            onUpdateData({ equipped_items: newEquipped });
        } catch (e) {
            showToast("Erro nas sombras ao equipar.", "error");
        }
    };

    const equippedBadgeId = eq.emblema?.id;
    const equippedBadgeData = badgesList.find(b => b.id === equippedBadgeId);

    const userInventory = userProfileData.inventory || [];
    const inventoryItems = shopItems.filter(item => {
        if (!userInventory.includes(item.id)) return false;
        const cat = (item.categoria || item.type || '').toLowerCase();
        if (inventoryCategory === 'capa_fundo') return cat === 'capa_fundo' || cat === 'capa';
        return cat === inventoryCategory;
    });

    const visibleHistory = historyData.filter(h => !h.cleared);

    const renderSettingCard = (icon, title, desc, options, currentValue, onChange) => (
        <div className="bg-[#050505] border border-white/5 rounded-3xl p-6 hover:border-red-600/30 transition-all flex flex-col justify-between h-full shadow-lg">
            <div className="flex items-start gap-4 mb-6">
                <div className="p-3 bg-[#0a0a0c] rounded-xl border border-white/5 text-gray-400">{icon}</div>
                <div>
                    <h4 className="text-white font-black text-xs uppercase tracking-widest">{title}</h4>
                    <p className="text-[10px] text-gray-500 font-bold mt-1 leading-snug">{desc}</p>
                </div>
            </div>
            <div className="grid grid-cols-2 gap-3 mt-auto">
                {options.map(opt => (
                    <button key={opt.value} onClick={() => onChange(opt.value)} className={`py-4 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all border ${currentValue === opt.value ? 'bg-red-600/10 border-red-600 text-red-500 shadow-[inset_0_0_15px_rgba(220,38,38,0.2)]' : 'bg-[#0a0a0c] border-white/5 text-gray-500 hover:text-white hover:border-white/20'}`}>
                        {opt.label}
                    </button>
                ))}
            </div>
        </div>
    );

    return (
        <div className="animate-in fade-in duration-300 w-full pb-24 font-sans min-h-screen text-gray-200 bg-[#030305] overflow-x-hidden relative">
            <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-red-900/15 via-[#030305] to-[#000000] pointer-events-none z-0"></div>

            {confirmAction && (
                <div className="fixed inset-0 z-[3000] bg-black/80 backdrop-blur-md flex items-center justify-center p-4 animate-in fade-in duration-200">
                    <div className="bg-[#0a0a0c] border border-red-600/50 p-8 rounded-3xl max-w-sm w-full text-center shadow-[0_0_40px_rgba(220,38,38,0.2)]">
                        <AlertTriangle className="w-12 h-12 text-red-500 mx-auto mb-4 drop-shadow-[0_0_10px_rgba(239,68,68,0.5)]" />
                        <h3 className="text-xl font-black text-white mb-2 uppercase tracking-tight">Confirmar Ação?</h3>
                        <p className="text-sm text-gray-400 mb-8 font-medium">{confirmAction === 'history' ? 'O registro do tempo será apagado permanentemente.' : 'A matriz será recarregada para limpar o fluxo.'}</p>
                        <div className="flex gap-4">
                            <button onClick={() => setConfirmAction(null)} className="flex-1 bg-[#050505] border border-white/10 text-gray-300 font-black py-3 rounded-xl hover:bg-white/5 transition-colors text-xs uppercase tracking-widest">Recuar</button>
                            <button onClick={executeConfirmAction} className="flex-1 bg-red-600/20 text-red-500 border border-red-500/40 font-black py-3 rounded-xl transition-colors hover:bg-red-500 hover:text-white text-xs uppercase tracking-widest shadow-[0_0_15px_rgba(239,68,68,0.3)]">Confirmar</button>
                        </div>
                    </div>
                </div>
            )}

            {/* CAPA DE FUNDO RESPONSIVA */}
            <div className="w-full h-[28vh] min-h-[180px] max-h-[260px] relative overflow-hidden">
                <img
                    src={coverBase64 || "https://i.ibb.co/4R0R8wR/red-moon-ninja.jpg"}
                    className="w-full h-full object-cover opacity-80"
                    alt="Capa de fundo"
                />
                <div className="absolute inset-0 bg-gradient-to-b from-black/40 via-black/70 to-[#030305]"></div>
                <button
                    onClick={() => coverInputRef.current.click()}
                    className="absolute top-4 right-4 bg-black/60 border border-white/10 px-3 py-2 rounded-lg text-[10px] font-bold uppercase text-white flex items-center gap-2"
                >
                    <Camera className="w-4 h-4" />
                    Capa
                </button>
                <input
                    type="file"
                    ref={coverInputRef}
                    onChange={(e) => handleImageUpload(e, 'cover')}
                    className="hidden"
                />
            </div>

            <div className="max-w-6xl mx-auto px-4 sm:px-6 relative z-10 -mt-20 sm:-mt-24 pt-0">
                {/* CARD DO PERFIL COMPACTO */}
                <ShadowCard className="mb-8">
                    <div className="flex flex-col gap-6 md:flex-row md:items-start md:gap-8">
                        <div className={`relative w-[22vw] h-[22vw] max-w-[104px] max-h-[104px] min-w-[88px] min-h-[88px] rounded-full flex items-center justify-center flex-shrink-0 self-start group ${(!eq.moldura?.preview && eq.moldura) ? eq.moldura.cssClass : ''}`}>
                            <div className="absolute -inset-1 rounded-full border-[3px] border-red-600/60 shadow-[0_0_30px_rgba(220,38,38,0.5)]"></div>
                            <div className="w-full h-full rounded-full bg-[#050505] flex items-center justify-center relative z-10 overflow-hidden shadow-2xl border-[4px] border-[#0a0a0c]">
                                {eq.avatar?.css && <style dangerouslySetInnerHTML={{ __html: `.${eq.avatar.cssClass} { ${eq.avatar.css} } ${eq.avatar.animacao || ''}` }} />}
                                <img src={activeAvatarSrc} className={`w-full h-full object-cover rounded-full ${eq.avatar?.cssClass || ''}`} alt="Avatar" onError={(e) => e.target.src = `https://placehold.co/150x150/0A0E17/dc2626?text=K`} />
                            </div>
                            {cleanCosmeticUrl(eq.particulas?.preview) && <img src={cleanCosmeticUrl(eq.particulas.preview)} className={`absolute inset-[-50%] m-auto w-[200%] h-[200%] object-contain z-0 ${eq.particulas.cssClass || ''}`} style={{ mixBlendMode: 'screen', pointerEvents: 'none' }} />}
                            {cleanCosmeticUrl(eq.efeito?.preview) && <img src={cleanCosmeticUrl(eq.efeito.preview)} className={`absolute inset-0 m-auto w-full h-full object-contain z-20 ${eq.efeito.cssClass || ''}`} style={{ mixBlendMode: 'screen', pointerEvents: 'none' }} />}
                            {cleanCosmeticUrl(eq.moldura?.preview) && <img src={cleanCosmeticUrl(eq.moldura.preview)} className={`absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[140%] h-[140%] max-w-none object-contain object-center z-30 pointer-events-none ${eq.moldura.cssClass || ''}`} />}
                        </div>

                        <div className="flex-1 min-w-0">
                            <div className="flex items-center gap-2.5 mb-2.5">
                                <Swords className="w-5 h-5 text-red-500" />
                                <span className="text-[11px] font-black text-red-500 uppercase tracking-widest">NINJA SUPREMO</span>
                            </div>

                            <h1 className={`text-[clamp(1.8rem,5vw,3rem)] font-black text-white tracking-tighter leading-tight drop-shadow-xl ${eq.nickname ? eq.nickname.cssClass : ''}`}>
                                {eq.nickname?.css && <style dangerouslySetInnerHTML={{ __html: `.${eq.nickname.cssClass} { ${eq.nickname.css} } ${eq.nickname.animacao || ''}` }} />}
                                {name || user.email.split('@')[0]}
                            </h1>
                            <p className="text-gray-500 font-bold text-sm mt-1.5 truncate">{user.email}</p>

                            <div className="mt-4 flex flex-wrap items-center gap-3">
                                <div className="bg-[#030305] border border-amber-600/40 inline-flex items-center gap-2.5 px-4 py-2 rounded-full shadow-[0_0_15px_rgba(251,191,36,0.1)] text-amber-500">
                                    <Trophy className="w-4 h-4" />
                                    <span className="text-[10px] sm:text-xs font-black uppercase tracking-widest">Nível {level} • {getLevelTitle(level)}</span>
                                </div>

                                {equippedBadgeData && (
                                    <div className={`bg-gradient-to-r from-black to-[#0a0a0c] border border-white/10 inline-flex items-center gap-2.5 px-4 py-2 rounded-full shadow-lg ${equippedBadgeData.colorClass}`}>
                                        {equippedBadgeData.image ? <img src={equippedBadgeData.image} className="w-5 h-5 object-contain" alt="Emblema" /> : <StatIcon icon={equippedBadgeData.icon} className="w-4 h-4" />}
                                        <span className="text-[9px] sm:text-[10px] font-black uppercase tracking-widest">{equippedBadgeData.title}</span>
                                    </div>
                                )}
                            </div>

                            <div className="mt-6 flex flex-col sm:flex-row gap-3 w-full max-w-2xl">
                                <button onClick={() => setIsEditing(!isEditing)} className="flex-1 bg-[#050505] border border-red-600/50 text-red-500 px-5 py-3.5 rounded-xl text-[10px] font-black uppercase tracking-widest hover:bg-red-600 hover:text-white transition-all flex items-center justify-center gap-2.5 shadow-[0_0_15px_rgba(220,38,38,0.1)]">
                                    <Edit3 className="w-4 h-4" /> {isEditing ? 'Salvar Identidade' : 'Forjar Perfil'}
                                    <ChevronRight className="w-4 h-4" />
                                </button>
                                <button onClick={() => updateSettings({ visibility: userSettings?.visibility === 'Público' ? 'Privado' : 'Público' })} className="flex-1 bg-[#050505] border border-white/10 text-gray-400 px-5 py-3.5 rounded-xl text-[10px] font-black uppercase tracking-widest hover:bg-white/5 transition-all flex items-center justify-center gap-2.5">
                                    <Settings className="w-4 h-4" /> Configurações
                                    <ChevronRight className="w-4 h-4" />
                                </button>
                                <button onClick={onLogout} className="bg-red-500/10 text-red-400 p-3.5 rounded-xl hover:bg-red-600 hover:text-white transition-all border border-red-500/20 self-start sm:self-auto">
                                    <LogOut className="w-4 h-4" />
                                </button>
                            </div>
                        </div>
                    </div>
                </ShadowCard>

                <ShadowCard className="mb-10">
                    <div className="bg-[#050505] border border-white/5 rounded-2xl p-5 sm:p-6 mb-8 flex flex-col sm:flex-row items-center gap-5 shadow-xl relative overflow-hidden">
                        <div className="relative w-20 h-20 sm:w-24 sm:h-24 rounded-full flex items-center justify-center flex-shrink-0">
                            <div className="absolute -inset-1 rounded-full border-2 border-red-600/40 shadow-[0_0_20px_rgba(220,38,38,0.3)]"></div>
                            <div className="w-full h-full rounded-full bg-[#0a0a0c] flex items-center justify-center border-2 border-[#0a0a0c]">
                                <BookOpen className="w-9 h-9 text-red-500" strokeWidth={1.5} />
                            </div>
                        </div>
                        <div className="flex-1 w-full sm:w-auto min-w-0">
                            <div className="flex items-center justify-between gap-3 mb-3">
                                <span className="text-[10px] sm:text-[11px] font-black text-white uppercase tracking-widest truncate">PROGRESSO SOMBRIO: {currentXp} XP</span>
                                <span className="text-[10px] sm:text-[11px] font-black text-red-500 uppercase tracking-widest truncate">{xpRemainingForNextLevel} XP PARA NÍVEL {level + 1}</span>
                            </div>
                            <div className="w-full h-3 bg-[#030305] rounded-full overflow-hidden border border-white/10 relative">
                                <div className="absolute h-full bg-red-600 transition-all duration-1000 ease-out shadow-[0_0_15px_rgba(220,38,38,0.8)]" style={{ width: `${progressPercent}%` }}></div>
                            </div>
                            <p className="text-gray-500 font-medium text-xs mt-2.5">Continue assim e alcance o próximo nível!</p>
                        </div>
                    </div>

                    <div className="mb-10 border-b border-red-900/30">
                        <div className="flex gap-4 sm:gap-10 overflow-x-auto no-scrollbar snap-x px-2 sm:px-4 pb-0.5">
                            {['Estatísticas', 'Emblemas', 'Inventário'].map((tab) => (
                                <button key={tab} onClick={() => setActiveTab(tab)} className={`snap-start pb-5 font-black transition-all whitespace-nowrap text-[10px] sm:text-sm uppercase tracking-[0.2em] relative group ${activeTab === tab ? 'text-white' : 'text-gray-500 hover:text-white'}`}>
                                    {tab}
                                    {activeTab === tab && <div className="absolute bottom-[-1px] left-0 w-full h-[3px] bg-red-600 rounded-t-full shadow-[0_0_15px_rgba(220,38,38,1)]"></div>}
                                </button>
                            ))}
                        </div>
                    </div>

                    {activeTab === "Estatísticas" && (
                        <div className="animate-in fade-in duration-300">
                            <div className="bg-[#050505] border border-red-600/30 rounded-2xl p-5 sm:p-6 mb-8 flex flex-col sm:flex-row items-center gap-5 shadow-xl relative overflow-hidden group">
                                <div className="absolute inset-0 bg-[url('https://placehold.co/800x400/0A0A0C/dc2626?text=K')] opacity-10 bg-cover bg-center group-hover:scale-105 transition-transform duration-1000"></div>
                                <Trophy className="w-14 h-14 sm:w-16 sm:h-16 text-amber-500 drop-shadow-[0_0_15px_rgba(251,191,36,0.5)] relative z-10" strokeWidth={1} />
                                <div className="flex-1 text-center sm:text-left relative z-10 min-w-0">
                                    <h3 className="text-[clamp(1.5rem,4.5vw,2.2rem)] font-black text-white uppercase tracking-tight line-clamp-1">"Leitor Nível {level}"</h3>
                                    <p className="text-gray-400 font-bold text-sm mt-1">Continue lendo e evolua no mundo dos mangás.</p>
                                </div>
                            </div>

                            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 sm:gap-6">
                                <StatCard icon={BookOpen} label="Obras Salvas" value={!dataLoaded ? <Loader2 className="w-6 h-6 animate-spin" /> : libraryMangaIds.length} colorClass="text-amber-500" />
                                <StatCard icon={Bookmark} label="Caps Lidos" value={!dataLoaded ? <Loader2 className="w-6 h-6 animate-spin" /> : readCount} colorClass="text-red-500" />
                                <StatCard icon={Compass} label="Iniciadas" value={!dataLoaded ? <Loader2 className="w-6 h-6 animate-spin" /> : obrasLidasIds.length} colorClass="text-blue-500" />
                                <StatCard icon={Zap} label="Poder Vital" value={currentXp} colorClass="text-purple-500" />
                            </div>
                        </div>
                    )}

                    {activeTab === "Emblemas" && (
                        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6 animate-in fade-in duration-300">
                            {badgesList.map(badge => <AchievementBadge key={badge.id} badge={badge} isEquipped={equippedBadgeId === badge.id} onEquip={handleEquipBadge} />)}
                        </div>
                    )}

                    {activeTab === "Inventário" && (
                        <div className="animate-in fade-in duration-300">
                            <div className="flex gap-3 overflow-x-auto no-scrollbar mb-8 pb-1.5 snap-x border-b border-white/5">
                                {[ { id: 'avatar', label: 'Avatar' }, { id: 'capa_fundo', label: 'Capa' }, { id: 'moldura', label: 'Moldura' }, { id: 'nickname', label: 'Nick' } ].map(cat => (
                                    <button key={cat.id} onClick={() => setInventoryCategory(cat.id)} className={`snap-start flex-shrink-0 px-6 py-3 rounded-full font-black text-[10px] uppercase tracking-widest transition-all border ${ inventoryCategory === cat.id ? 'bg-red-600 text-white border-red-500 shadow-[0_0_15px_rgba(220,38,38,0.4)]' : 'bg-[#050505] text-gray-500 border-white/5 hover:text-white hover:border-white/20' }`}>{cat.label}</button>
                                ))}
                            </div>
                            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4 sm:gap-5">
                                {inventoryItems.length === 0 ? <div className="col-span-full py-16 text-center text-gray-600 text-xs font-black uppercase tracking-widest">Nenhum item desta categoria.</div> : 
                                    inventoryItems.map(item => {
                                        let itemCat = (item.categoria || item.type || '').toLowerCase(); if (itemCat === 'capa') itemCat = 'capa_fundo';
                                        const isEquipped = userProfileData.equipped_items?.[itemCat]?.id === item.id;
                                        return (
                                            <div key={item.id} className={`bg-[#0a0a0c] border rounded-3xl p-5 flex flex-col items-center text-center transition-all duration-300 relative overflow-hidden shadow-lg ${isEquipped ? 'border-red-600 bg-red-950/20' : 'border-white/5 hover:border-red-500/40 hover:-translate-y-1'}`}>
                                                {(item.css || item.animacao || item.keyframes) && <style dangerouslySetInnerHTML={{__html: `.${item.cssClass || 'custom-ia-class'} { ${item.css || ''} } ${item.animacao || item.keyframes || ''}`}} />}
                                                <div className={`absolute top-2.5 right-2.5 text-[7px] uppercase tracking-widest font-black px-2 py-1 rounded-md z-30 bg-black/80 border border-white/10 ${getRarityColor(item.raridade)}`}>{item.raridade || 'Comum'}</div>
                                                <div className={`w-24 h-24 rounded-full mt-5 mb-5 bg-[#030305] flex items-center justify-center overflow-hidden border border-white/5 relative flex-shrink-0 ${itemCat === 'avatar' ? (item.cssClass || 'custom-ia-class') : ''}`}>
                                                    {['capa_fundo', 'tema_perfil'].includes(itemCat) && cleanCosmeticUrl(item.preview) && <img src={cleanCosmeticUrl(item.preview)} className={`w-full h-full object-cover opacity-80 ${item.cssClass || 'custom-ia-class'}`} />}
                                                    {itemCat === 'moldura' && cleanCosmeticUrl(item.preview) && <img src={cleanCosmeticUrl(item.preview)} className={`absolute inset-0 w-full h-full object-cover z-20 pointer-events-none rounded-full scale-[1.15] ${item.cssClass || 'custom-ia-class'}`} style={{ mixBlendMode: 'screen' }} />}
                                                    {itemCat === 'avatar' && cleanCosmeticUrl(item.preview) && <img src={cleanCosmeticUrl(item.preview)} className={`w-full h-full object-cover rounded-full relative z-10 group-hover:scale-110 transition-transform duration-500`} />}
                                                    {itemCat === 'nickname' && <div className={`font-black text-xl z-20 ${item.cssClass || 'custom-ia-class'}`}>Kage</div>}
                                                </div>
                                                <h4 className="text-white font-black mb-5 text-xs line-clamp-1 relative z-10 px-1 w-full">{item.nome || item.name}</h4>
                                                <button onClick={() => handleEquipCosmetic(item)} className={`w-full rounded-lg font-black py-3 transition-all text-[9px] uppercase tracking-widest relative z-10 ${isEquipped ? 'bg-red-600 text-white shadow-[0_0_10px_rgba(220,38,38,0.4)]' : 'bg-[#030305] text-gray-400 hover:text-white border border-white/10'}`}>{isEquipped ? '✓ Equipado' : 'Equipar'}</button>
                                            </div>
                                        )
                                    })
                                }
                            </div>
                        </div>
                    )}
                </ShadowCard>

                <ShadowCard className="mb-8 animate-in fade-in duration-300">
                    <div className="flex items-center justify-between mb-8 pb-5 border-b border-white/5">
                        <div className="flex items-center gap-3">
                            <History className="w-6 h-6 text-red-500" strokeWidth={1.5} />
                            <h2 className="text-2xl font-black text-white uppercase tracking-tight">Histórico de Selamento</h2>
                        </div>
                        {visibleHistory.length > 0 && <button onClick={() => setConfirmAction('history')} className="text-red-500 hover:text-white hover:bg-red-600/20 px-5 py-2.5 rounded-full font-black text-[9px] uppercase tracking-widest border border-red-900/50 flex items-center gap-2"><Trash2 className="w-4 h-4"/> Limpar Memórias</button>}
                    </div>
                    {visibleHistory.length === 0 ? <div className="text-center py-20"><History className="w-12 h-12 mx-auto text-red-900/30 mb-5"/><p className="text-gray-500 text-xs font-black uppercase tracking-widest">As sombras não possuem registros recentes.</p></div> : 
                        <div className="flex flex-col gap-4">
                            {visibleHistory.slice(0, 15).map(hist => {
                                const mg = mangas.find(m => m.id === hist.mangaId);
                                return (
                                    <div key={hist.id} onClick={() => mg && onNavigate('details', mg)} className="bg-[#050505] border border-white/5 p-4 rounded-xl flex items-center gap-5 cursor-pointer hover:border-red-600/50 transition-all duration-300 group shadow-sm">
                                        <div className="w-16 h-24 rounded-lg overflow-hidden bg-black flex-shrink-0 border border-white/5 group-hover:shadow-[0_0_15px_rgba(220,38,38,0.3)]">{mg ? <img src={mg.coverUrl} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300" /> : <BookOpen className="w-6 h-6 m-auto mt-9 text-red-900/50"/>}</div>
                                        <div className="flex-1"><h4 className="font-black text-sm text-white line-clamp-2 group-hover:text-red-500 transition-colors duration-300">{hist.mangaTitle}</h4><p className="text-red-600 font-black text-[10px] uppercase tracking-widest mt-2 bg-red-950/30 inline-block px-3 py-1.5 rounded-lg border border-red-900/50">Capítulo {hist.chapterNumber}</p></div>
                                        <p className="text-[9px] text-gray-600 font-bold uppercase hidden sm:block">{timeAgo(hist.timestamp)}</p>
                                        <ChevronRight className="w-6 h-6 text-gray-700 group-hover:text-red-500 transition-colors duration-300" />
                                    </div>
                                )
                            })}
                        </div>
                    }
                </ShadowCard>

                <div className="animate-in fade-in duration-300 space-y-6">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        {renderSettingCard(<BookOpen className="w-5 h-5" />,"Modo de Leitura","Escolha como as páginas se comportam.",[{ label: 'Vertical Cascata', value: 'Cascata' }, { label: 'Paginação Uma a Uma', value: 'Paginação' }],userSettings?.readMode || 'Cascata',(v) => { updateSettings({ readMode: v }); showToast("Modo de leitura atualizado.", "success"); })}
                        {renderSettingCard(<Zap className="w-5 h-5" />,"Economia de Dados","Reduz o peso das imagens em conexões lentas.",[{ label: 'Ativado', value: true }, { label: 'Desativado', value: false }],userSettings?.dataSaver || false,(v) => { updateSettings({ dataSaver: v }); showToast(v ? "Economia ativada." : "Qualidade máxima ativada.", "success"); })}
                        {renderSettingCard(<Monitor className="w-5 h-5" />,"Aura do Sistema (Tema)","Paleta de cores e fundos da interface.",[{ label: 'Cinza Escuro', value: 'Escuro' }, { label: 'Vazio Absoluto (OLED)', value: 'Amoled' }],userSettings?.theme || 'Escuro',(v) => { updateSettings({ theme: v }); showToast("Aura da interface aplicada.", "success"); })}
                        {renderSettingCard(<Bell className="w-5 h-5" />,"Notificações do Vazio","Receba alertas de novos capítulos e missões.",[{ label: 'Permitir', value: true }, { label: 'Silenciar', value: false }],userSettings?.notifications !== undefined ? userSettings.notifications : true,(v) => { updateSettings({ notifications: v }); showToast(v ? "Você ouvirá as sombras." : "O silêncio reinará.", "success"); })}
                    </div>
                    <ShadowCard>
                        <button onClick={() => setConfirmAction('cache')} className="flex items-center justify-between w-full text-left group">
                            <div><p className="text-sm font-black text-white uppercase tracking-widest group-hover:text-red-500 transition-colors duration-300">Limpar Matriz (Cache)</p><p className="text-xs text-gray-500 mt-1 font-bold">Reinicia a interface caso haja distorções visuais ou dados antigos.</p></div>
                            <div className="bg-white/5 p-4 rounded-xl border border-white/10 group-hover:border-red-500/50 group-hover:bg-red-950/20 transition-all duration-300"><RefreshCw className="w-5 h-5 text-gray-400 group-hover:text-red-500 group-hover:rotate-180 transition-all duration-300" /></div>
                        </button>
                    </ShadowCard>
                </div>
            </div>
        </div>
    );
}
