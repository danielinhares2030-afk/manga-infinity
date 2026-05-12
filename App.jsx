import React, { useState, useEffect } from 'react';
import { Search, Bell, Dices, Hexagon, Home as HomeIcon, LayoutGrid, Library, UserCircle, User, X, Trophy, BookOpen, Eye, Swords } from 'lucide-react';
import { getAuth, signOut, onAuthStateChanged } from "firebase/auth";
import { doc, setDoc, getDoc, collection, onSnapshot, deleteDoc, query, getDocs, updateDoc, increment, where } from "firebase/firestore";
import { app, auth, db } from './firebase'; 
import { APP_ID, FALLBACK_SHOP_ITEMS } from './constants';
import { getThemeClasses, removeXpLogic, addXpLogic, timeAgo, cleanCosmeticUrl } from './helpers';
import { ErrorBoundary, GlobalToast, Footer, SplashScreen, EmpireLogo } from './UIComponents';
import { LoginView } from './LoginView';
import { HomeView } from './HomeView';
import { SearchView } from './SearchView';
import { CatalogView } from './CatalogView';
import { LibraryView } from './LibraryView';
import { NexoView } from './NexoView';
import { ProfileView } from './ProfileView';
import { PopularView } from './PopularView';
import DetailsView from './DetailsView';
import ReaderView from './ReaderView';

function MangaInferiaApp() {
  const [splashTimerDone, setSplashTimerDone] = useState(false);
  const [authReady, setAuthReady] = useState(false);
  const [isGuest, setIsGuest] = useState(false); 
  const [currentView, setCurrentView] = useState('login'); 
  const [globalToast, setGlobalToast] = useState(null); 
  const [levelUpAlert, setLevelUpAlert] = useState(null); 
  const [dropAlert, setDropAlert] = useState(false);
  const [isRandomizing, setIsRandomizing] = useState(false); 
  const [showMobileSearch, setShowMobileSearch] = useState(false); 
  const [showNotifMenu, setShowNotifMenu] = useState(false);
  const [selectedManga, setSelectedManga] = useState(null);
  const [selectedChapter, setSelectedChapter] = useState(null);
  const [globalSearch, setGlobalSearch] = useState(''); 
  const [mangas, setMangas] = useState([]);
  const [loadingMangas, setLoadingMangas] = useState(true);
  const [shopItems, setShopItems] = useState(FALLBACK_SHOP_ITEMS);
  const [catalogState, setCatalogState] = useState({ filterType: "Todos", selectedGenres: [], visibleCount: 24, scrollPos: 0 });
  const [user, setUser] = useState(null);
  
  // Estado do usuário limpo (sem sistema de missões)
  const [userProfileData, setUserProfileData] = useState({ xp: 0, level: 1, coins: 0, crystals: 0, inventory: [], equipped_items: {}, caixas: 0, lastDailyBox: 0 });
  
  const [userSettings, setUserSettings] = useState({ readMode: 'Cascata', dataSaver: false, theme: 'Escuro' });
  const [libraryData, setLibraryData] = useState({});
  const [historyData, setHistoryData] = useState([]);
  const [notifications, setNotifications] = useState([]);
  const [dataLoaded, setDataLoaded] = useState(false); 

  useEffect(() => { const timer = setTimeout(() => setSplashTimerDone(true), 1500); return () => clearTimeout(timer); }, []);

  useEffect(() => {
    const handlePopState = (e) => {
        if (e.state && e.state.view) {
            setCurrentView(e.state.view);
            if (e.state.mangaId) { const m = mangas.find(mg => mg.id === e.state.mangaId); if (m) setSelectedManga(m); }
            if (e.state.chapterId && e.state.mangaId) { 
                const m = mangas.find(mg => mg.id === e.state.mangaId); 
                if (m && m.chapters) { 
                    const c = m.chapters.find(ch => ch.id === e.state.chapterId); 
                    if (c) setSelectedChapter(c); 
                } 
            } else {
                // CORREÇÃO: Força a limpeza do capítulo caso volte para uma tela sem capítulo
                setSelectedChapter(null);
            }
        } else { 
            setCurrentView('home'); 
            setSelectedChapter(null);
        }
    };
    window.addEventListener('popstate', handlePopState);
    return () => window.removeEventListener('popstate', handlePopState);
  }, [mangas]);

  useEffect(() => {
    const fetchMangas = async () => {
      try {
        const obrasRef = collection(db, "obras"); const snap = await getDocs(obrasRef); const list = [];
        for (const docSnap of snap.docs) {
          const data = docSnap.data(); const capSnap = await getDocs(collection(db, `obras/${docSnap.id}/capitulos`)); const chapters = [];
          capSnap.forEach(c => { const cData = c.data(); chapters.push({ id: c.id, ...cData, rawTime: cData.createdAt || cData.timestamp || Date.now() }); });
          chapters.sort((a,b) => b.number - a.number); list.push({ id: docSnap.id, ...data, chapters });
        }
        list.sort((a, b) => b.createdAt - a.createdAt); setMangas(list);
      } catch (error) { console.error(error); } finally { setLoadingMangas(false); }
    };
    fetchMangas();
  }, []);

  useEffect(() => {
    const q = query(collection(db, "loja_itens"));
    const unsub = onSnapshot(q, (snap) => { 
        if (!snap.empty) { 
            const items = []; 
            snap.forEach(d => items.push({ id: d.id, ...d.data() })); 
            setShopItems(items); 
        } else { 
            setShopItems(FALLBACK_SHOP_ITEMS); 
        } 
    });
    return () => unsub();
  }, []);

  useEffect(() => {
    const unsubscribeAuth = onAuthStateChanged(auth, async (currentUser) => {
      setUser(currentUser); setAuthReady(true);
      if (currentUser) {
        if (currentView === 'login') { window.history.pushState({ view: 'home' }, '', ''); setCurrentView('home'); }
        try {
          const profileRef = doc(db, 'artifacts', APP_ID, 'users', currentUser.uid, 'profile', 'main');
          const unsubProfile = onSnapshot(profileRef, (docSnap) => {
            if (docSnap.exists()) {
              const data = docSnap.data();
              setUserProfileData({ bio: data.bio, avatarUrl: data.avatarUrl, coverUrl: data.coverUrl, xp: data.xp || 0, level: data.level || 1, coins: data.coins || 0, crystals: data.crystals || 0, inventory: data.inventory || [], equipped_items: data.equipped_items || {}, caixas: data.caixas || 0, lastDailyBox: data.lastDailyBox || 0 });
              if(data.settings) setUserSettings({ ...userSettings, ...data.settings }); 
            } else { setDoc(profileRef, { bio: "Leitor Nível 1.", settings: userSettings, xp: 0, level: 1, coins: 0, crystals: 0, inventory: [], equipped_items: {}, caixas: 0, lastDailyBox: 0 }, { merge: true }); }
          });
          const libraryRef = collection(db, 'artifacts', APP_ID, 'users', currentUser.uid, 'library');
          const unsubLib = onSnapshot(query(libraryRef), (snapshot) => { const libs = {}; snapshot.docs.forEach(d => libs[d.id] = d.data().status); setLibraryData(libs); });
          const historyRef = collection(db, 'artifacts', APP_ID, 'users', currentUser.uid, 'history');
          const unsubHist = onSnapshot(query(historyRef), (snapshot) => { const hist = []; snapshot.docs.forEach(d => hist.push({ id: d.id, ...d.data() })); setHistoryData(hist.sort((a,b) => b.timestamp - a.timestamp)); });
          const notifRef = collection(db, 'artifacts', APP_ID, 'users', currentUser.uid, 'notifications');
          const unsubNotif = onSnapshot(query(notifRef), (snapshot) => { const notifs = []; snapshot.docs.forEach(d => notifs.push({ id: d.id, ...d.data() })); setNotifications(notifs.sort((a,b) => b.createdAt - a.createdAt)); setDataLoaded(true); });
          return () => { unsubProfile(); unsubLib(); unsubHist(); unsubNotif(); };
        } catch (error) { console.error(error); }
      } else { setUserProfileData({ xp: 0, level: 1, coins: 0, crystals: 0, inventory: [], equipped_items: {}, caixas: 0, lastDailyBox: 0 }); setLibraryData({}); setHistoryData([]); setNotifications([]); setDataLoaded(true); }
    });
    return () => unsubscribeAuth();
  }, [currentView]);

  const showSplash = !splashTimerDone || !authReady || loadingMangas;
  useEffect(() => { if (!showSplash && !user && !isGuest && currentView !== 'login') { setCurrentView('login'); } }, [showSplash, user, isGuest, currentView]);

  const showToast = (text, type = 'info') => { setGlobalToast({ text, type }); setTimeout(() => setGlobalToast(null), 4000); };
  const handleLevelUpAnim = (lvl) => { setLevelUpAlert(lvl); setTimeout(() => setLevelUpAlert(null), 5000); }

  const navigateTo = (view, manga = null, chapter = null) => {
    if (currentView === 'catalog') { setCatalogState(prev => ({ ...prev, scrollPos: window.scrollY })); }
    
    if (manga) setSelectedManga(manga); 
    
    // CORREÇÃO: Atualiza o capítulo ou limpa o estado anterior caso navegue para fora do leitor
    if (chapter) {
        setSelectedChapter(chapter);
    } else if (view !== 'reader') {
        setSelectedChapter(null);
    }

    window.history.pushState({ view, mangaId: manga?.id, chapterId: chapter?.id }, '', ''); 
    setCurrentView(view);
    if (view !== 'catalog') { window.scrollTo(0, 0); }
  };

  const handleBack = () => { if (window.history.state !== null) { window.history.back(); } else { navigateTo('home'); } };
  const handleSearchSubmit = (e) => { if (e.key === 'Enter' && globalSearch.trim() !== '') navigateTo('search'); };
  const handleLogout = async () => { await signOut(auth); setIsGuest(false); setCurrentView('login'); };

  const handleRandomManga = () => {
    if (mangas.length === 0) { showToast("Catálogo vazio.", "error"); return; } setIsRandomizing(true);
    setTimeout(() => { const random = mangas[Math.floor(Math.random() * mangas.length)]; navigateTo('details', random); setIsRandomizing(false); }, 600); 
  };

  // DROP ALEATÓRIO DE CRISTAIS (Sem tempo limite, 40% de chance por chamada)
  const triggerRandomDrop = async () => { 
      if (!user) return; 
      const profileRef = doc(db, 'artifacts', APP_ID, 'users', user.uid, 'profile', 'main'); 
      try { 
          if (Math.random() < 0.40) { 
              await updateDoc(profileRef, { crystals: increment(1) }); 
              setDropAlert(true); 
              setTimeout(() => setDropAlert(false), 3000); 
          }
      } catch(e) {} 
  };

  // MARCAR COMO LIDO (Sem checagem de missões e sem limite de 45 segundos)
  const markAsRead = async (manga, chapter) => {
    if (!user) return;
    try {
      const ref = doc(db, 'artifacts', APP_ID, 'users', user.uid, 'history', `${manga.id}_${chapter.id}`); 
      const docSnap = await getDoc(ref); 
      if (!docSnap.exists()) { 
          await setDoc(ref, { mangaId: manga.id, mangaTitle: manga.title, chapterNumber: chapter.number, timestamp: Date.now(), id: `${manga.id}_${chapter.id}` }); 
      } else { 
          await updateDoc(ref, { timestamp: Date.now() }); 
      }
    } catch(e) { console.error(e) }
  };

  const updateSettings = async (newSettings) => { const updated = { ...userSettings, ...newSettings }; setUserSettings(updated); if(user) { try { await setDoc(doc(db, 'artifacts', APP_ID, 'users', user.uid, 'profile', 'main'), { settings: updated }, { merge: true }); } catch(e) {} } };

  const buyItem = async (item) => {
    const price = item.preco || item.price; if ((userProfileData.coins || 0) < price) { showToast("Moedas Insuficientes!", "error"); return; }
    const newCoins = userProfileData.coins - price; const newInv = [...(userProfileData.inventory || []), item.id];
    await updateDoc(doc(db, 'artifacts', APP_ID, 'users', user.uid, 'profile', 'main'), { coins: newCoins, inventory: newInv }); showToast(`Adquirido com sucesso!`, "success");
  };

  const toggleEquipItem = async (item) => {
    const cat = item.categoria || item.type; const currentEquipped = userProfileData.equipped_items || {};
    const isEquipped = currentEquipped[cat]?.id === item.id; const newEquipped = { ...currentEquipped };
    if (isEquipped) { delete newEquipped[cat]; } else { newEquipped[cat] = item; }
    await updateDoc(doc(db, 'artifacts', APP_ID, 'users', user.uid, 'profile', 'main'), { equipped_items: newEquipped });
  };

  const synthesizeCrystal = async () => {
    if (userProfileData.crystals < 5) return null; const profileRef = doc(db, 'artifacts', APP_ID, 'users', user.uid, 'profile', 'main');
    if (Math.random() < 0.40) { await updateDoc(profileRef, { crystals: increment(-5) }); return { success: false }; }
    const wonCoins = Math.floor(Math.random() * 10) + 5; const wonXp = Math.floor(Math.random() * 5) + 5;   
    let { newXp, newLvl, didLevelUp } = addXpLogic(userProfileData.xp || 0, userProfileData.level || 1, wonXp);
    await updateDoc(profileRef, { crystals: increment(-5), coins: increment(wonCoins), xp: newXp, level: newLvl }); if(didLevelUp) handleLevelUpAnim(newLvl);
    return { success: true, wonCoins, wonXp, leveledUp: didLevelUp, newLvl };
  };

  const handleLibraryToggle = async (mangaId, status) => {
      if (!user) { showToast("Faça login para favoritar obras.", "warning"); return; }
      try {
          const ref = doc(db, 'artifacts', APP_ID, 'users', user.uid, 'library', mangaId.toString());
          if (status === "Remover") await deleteDoc(ref); else await setDoc(ref, { mangaId: mangaId, status: status, updatedAt: Date.now() });
          if(status === 'Favoritos') showToast("Adicionado aos Favoritos!", "success"); else if(status === 'Remover') showToast("Removido da Biblioteca.", "info");
      } catch(error) { showToast('Erro ao atualizar biblioteca.', 'error'); }
  };

  if (showSplash) return <SplashScreen />;
  if (currentView === 'login' || (!user && !isGuest)) { return <LoginView onLoginSuccess={() => { window.history.pushState({ view: 'home' }, '', ''); setCurrentView('home'); setIsGuest(false); }} onGuestAccess={() => { window.history.pushState({ view: 'home' }, '', ''); setIsGuest(true); setCurrentView('home'); }} showToast={showToast} />; }

  const unreadNotifCount = notifications.filter(n => !n.read).length;
  const eq = userProfileData.equipped_items || {};

  const getAvatarSrc = () => {
    if (!eq.avatar) return null;
    const itemImg = eq.avatar.preview || eq.avatar.url || eq.avatar.img || eq.avatar.imagem || eq.avatar.image || eq.avatar.src || eq.avatar.foto || eq.avatar.link;
    return itemImg ? cleanCosmeticUrl(itemImg) : null;
  };
  const activeAvatarSrc = getAvatarSrc() || cleanCosmeticUrl(userProfileData.avatarUrl) || user?.photoURL || `https://placehold.co/100x100/020205/0ea5e9?text=M`;

  return (
    <div className={`min-h-screen font-sans selection:bg-purple-600 selection:text-white flex flex-col transition-colors duration-300 ${getThemeClasses(userSettings.theme)} bg-[#050505] text-gray-200`}>
      <style dangerouslySetInnerHTML={{__html: [ ...shopItems.map(item => `.${item.cssClass || 'none'} { ${item.css || ''} } ${item.animacao || ''}`), ...Object.values(eq).filter(Boolean).map(item => `.${item.cssClass || 'none'} { ${item.css || ''} } ${item.animacao || ''}`) ].join('\n')}} />
      <style>{`
        input[type=range]::-webkit-slider-thumb { -webkit-appearance: none; appearance: none; width: 18px; height: 18px; border-radius: 50%; background: #a855f7; cursor: pointer; border: 2px solid white; box-shadow: 0 0 10px rgba(168,85,247,0.5); } 
        .no-scrollbar::-webkit-scrollbar { display: none; } 
        .no-scrollbar { -ms-overflow-style: none; scrollbar-width: none; }
      `}</style>

      {levelUpAlert && ( <div className="fixed top-20 right-4 z-[99999] bg-[#0A0A0A]/95 backdrop-blur-md border border-purple-500/30 text-white px-4 py-3 rounded-2xl flex items-center gap-3 animate-in slide-in-from-right fade-out duration-300 pointer-events-none shadow-[0_0_20px_rgba(168,85,247,0.3)]"><div className="bg-gradient-to-br from-purple-600 to-fuchsia-600 p-2 rounded-xl"><Trophy className="w-5 h-5 text-white" /></div><div className="flex flex-col"><span className="text-[10px] text-purple-400 uppercase tracking-widest font-black">Poder Expandido!</span><span className="text-sm font-bold">Nível {levelUpAlert} Alcançado</span></div></div> )}
      {dropAlert && ( <div className="fixed bottom-24 right-4 z-[99999] bg-[#0A0A0A]/90 backdrop-blur-md border border-fuchsia-500/50 rounded-2xl px-4 py-3 flex items-center gap-3 animate-in slide-in-from-bottom-5 fade-out duration-300 pointer-events-none shadow-[0_0_20px_rgba(217,70,239,0.2)]"><div className="bg-fuchsia-900/40 p-2 rounded-lg border border-fuchsia-500/30"><Hexagon className="w-5 h-5 text-fuchsia-400 drop-shadow-[0_0_10px_rgba(217,70,239,0.8)]" fill="currentColor" fillOpacity="0.2" /></div><div className="flex flex-col"><span className="text-fuchsia-400 text-[10px] font-black uppercase tracking-widest">Matéria Obtida</span><span className="text-white text-xs font-bold">+1 Cristal Nexo</span></div></div> )}
      {isRandomizing && ( <div className="fixed inset-0 z-[2000] bg-[#050505]/90 backdrop-blur-sm flex flex-col items-center justify-center animate-in fade-in duration-100 pointer-events-none"><Dices className="w-24 h-24 text-purple-500 animate-[spin_0.2s_linear_infinite]" /></div> )}

      <GlobalToast toast={globalToast} />

      {currentView !== 'reader' && (
        <nav className="sticky top-0 z-40 bg-[#050505]/80 backdrop-blur-xl border-b border-purple-600/10 shadow-md relative">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex items-center justify-between h-16">
              <div className="flex items-center gap-3 cursor-pointer group" onClick={() => navigateTo('home')}>
                <EmpireLogo className="w-10 h-8 group-hover:scale-110 transition-transform duration-300" />
                <span className="text-xl font-black text-white tracking-[0.2em] uppercase hidden sm:block">MANGA<span className="text-purple-600 ml-1">INFERIA</span></span>
              </div>
              
              <div className="hidden md:block flex-1 max-w-lg mx-8 relative group">
                <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none"><Search className="h-4 w-4 text-gray-500 group-focus-within:text-purple-500 transition-colors" /></div>
                <input type="text" value={globalSearch} onChange={(e) => setGlobalSearch(e.target.value)} onKeyDown={handleSearchSubmit} className="w-full pl-10 pr-4 py-2 rounded-xl border border-white/5 bg-[#111]/80 text-gray-100 outline-none focus:border-purple-500/50 transition-all text-sm shadow-inner" placeholder="Buscar obras..." />
              </div>

              <div className="flex items-center gap-4 md:gap-6">
                <div className="flex items-center gap-1 md:gap-3 border-r border-white/10 pr-4 md:pr-6">
                  <button onClick={() => setShowMobileSearch(!showMobileSearch)} className="md:hidden p-2 rounded-full text-gray-400 hover:text-purple-500 transition-colors duration-300" title="Pesquisar">{showMobileSearch ? <X className="w-5 h-5"/> : <Search className="w-5 h-5" />}</button>
                  <button onClick={handleRandomManga} className="p-2 rounded-full text-gray-400 hover:text-purple-500 transition-colors duration-300 group relative" title="Obra Aleatória"><Dices className="w-5 h-5 md:w-5 md:h-5 group-hover:text-purple-500 transition-colors duration-300" /></button>
                  <div className="relative">
                    <button onClick={() => {if(!user) return showToast("Faça login para ver mensagens", "info"); setShowNotifMenu(!showNotifMenu)}} className="relative rounded-full p-2 text-gray-400 hover:text-purple-500 transition-colors duration-300"><Bell className="w-5 h-5 md:w-5 md:h-5"/>{unreadNotifCount > 0 && <span className="absolute top-1 right-2 w-2 h-2 rounded-full bg-purple-600 animate-pulse border border-[#050505]"></span>}</button>
                    {showNotifMenu && user && (
                        <div className="absolute top-full right-0 md:left-1/2 md:-translate-x-1/2 mt-2 w-72 bg-[#0A0A0A] border border-purple-600/20 rounded-2xl shadow-2xl z-50 overflow-hidden flex flex-col animate-in slide-in-from-top-2">
                            <div className="p-3 border-b border-white/5 bg-[#050505] flex items-center justify-between"><h3 className="font-black text-sm text-white flex items-center gap-2"><Bell className="w-4 h-4 text-purple-500"/> Alertas do Sistema</h3>{unreadNotifCount > 0 && <span className="text-[10px] rounded-lg bg-purple-600 text-white px-1.5 py-0.5 font-black">{unreadNotifCount}</span>}</div>
                            <div className="max-h-64 overflow-y-auto no-scrollbar">
                                {notifications.length === 0 ? <p className="text-center text-xs text-gray-500 py-6">Nenhum aviso no momento.</p> : notifications.map(n => <div key={n.id} onClick={async () => { await updateDoc(doc(db, 'artifacts', APP_ID, 'users', user.uid, 'notifications', n.id), {read: true}); if(n.mangaId) { const m = mangas.find(mg=>mg.id===n.mangaId); if(m) navigateTo('details', m); setShowNotifMenu(false); } }} className={`p-3 border-b border-white/5 hover:bg-white/5 cursor-pointer transition-colors ${!n.read ? 'bg-purple-900/20' : ''}`}><p className="text-xs text-gray-300 font-medium leading-relaxed">{n.text}</p><p className="text-[9px] text-purple-500 mt-1.5 font-bold uppercase">{timeAgo(n.createdAt)}</p></div>)}
                            </div>
                        </div>
                    )}
                  </div>
                </div>

                <div className="hidden md:flex items-center gap-6 text-sm font-bold text-gray-400">
                  <button onClick={() => navigateTo('home')} className={`hover:text-purple-400 transition-colors duration-300 ${currentView === 'home' ? 'text-purple-500' : ''}`}>Início</button>
                  <button onClick={() => navigateTo('catalog')} className={`hover:text-purple-400 transition-colors duration-300 ${currentView === 'catalog' ? 'text-purple-500' : ''}`}>Catálogo</button>
                  <button onClick={() => user ? navigateTo('nexo') : navigateTo('login')} className={`hover:text-purple-400 transition-colors duration-300 flex items-center gap-1 ${currentView === 'nexo' ? 'text-purple-500' : ''}`}><Swords className="w-4 h-4"/> Inferia</button>
                  <button onClick={() => user ? navigateTo('profile') : navigateTo('login')} className={`hover:text-purple-400 transition-colors duration-300 flex items-center gap-1 ${currentView === 'profile' ? 'text-purple-500' : ''}`}><UserCircle className="w-4 h-4"/> Perfil</button>
                </div>
                {user ? (
                  <div className="cursor-pointer flex items-center gap-3 group" onClick={() => navigateTo('profile')}>
                    <div className="hidden sm:flex flex-col text-right">
                      <span className="text-sm font-bold text-gray-200 group-hover:text-purple-400 transition-colors duration-300">{user.displayName || "Usuário"}</span>
                      <span className="text-[10px] text-fuchsia-400 font-bold uppercase tracking-widest">Nível {userProfileData.level || 1}</span>
                    </div>
                    
                    <div className="relative w-10 h-10 flex items-center justify-center flex-shrink-0 group">
                        <div className="w-9 h-9 rounded-full overflow-hidden bg-[#111] flex items-center justify-center relative z-10 border-[2px] border-[#050505] group-hover:border-purple-500 transition-colors">
                            <img src={activeAvatarSrc} className="w-full h-full object-cover" alt="Avatar" onError={(e) => e.target.src = `https://placehold.co/100x100/050505/a855f7?text=E`} />
                        </div>
                        
                        {cleanCosmeticUrl(eq.moldura?.preview) && ( <img src={cleanCosmeticUrl(eq.moldura.preview)} className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[140%] h-[140%] max-w-none object-contain object-center z-30 pointer-events-none" /> )}
                    </div>
                  </div>
                ) : ( <button onClick={() => navigateTo('login')} className="bg-gradient-to-r from-purple-600 to-fuchsia-600 text-white hover:from-purple-500 hover:to-fuchsia-500 rounded-xl font-black px-5 py-2 transition-all duration-300 text-sm shadow-[0_0_15px_rgba(168,85,247,0.4)]">Entrar</button> )}
              </div>
            </div>
          </div>
          
          {showMobileSearch && (
            <div className="absolute top-full left-0 w-full bg-[#050505]/95 backdrop-blur-xl border-b border-white/10 p-3 shadow-xl md:hidden animate-in slide-in-from-top-2 z-50">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500" />
                <input type="text" value={globalSearch} onChange={e => setGlobalSearch(e.target.value)} onKeyDown={(e) => { handleSearchSubmit(e); if(e.key === 'Enter') setShowMobileSearch(false); }} className="w-full pl-9 pr-4 py-2 border border-white/10 rounded-xl bg-[#111] text-gray-100 outline-none focus:border-purple-500 text-sm transition-colors duration-300" placeholder="Buscar obras..." autoFocus />
              </div>
            </div>
          )}
        </nav>
      )}

      <main className="flex-1">
        {currentView === 'home' && <HomeView mangas={mangas} onNavigate={navigateTo} dataSaver={userSettings.dataSaver} />}
        {currentView === 'search' && <SearchView mangas={mangas} query={globalSearch} onNavigate={navigateTo} dataSaver={userSettings.dataSaver} />}
        {currentView === 'catalog' && <CatalogView mangas={mangas} onNavigate={navigateTo} dataSaver={userSettings.dataSaver} catalogState={catalogState} setCatalogState={setCatalogState} />}
        {currentView === 'nexo' && user && <NexoView user={user} userProfileData={userProfileData} showToast={showToast} mangas={mangas} db={db} appId={APP_ID} onNavigate={navigateTo} onLevelUp={handleLevelUpAnim} synthesizeCrystal={synthesizeCrystal} shopItems={shopItems} buyItem={buyItem} equipItem={toggleEquipItem} />}
        
        {/* CORREÇÃO DA BIBLIOTECA (Enviando os parâmetros) */}
        {currentView === 'library' && <LibraryView mangas={mangas} user={user} libraryData={libraryData} historyData={historyData} userProfileData={userProfileData} onNavigate={navigateTo} onRequireLogin={() => navigateTo('login')} />}
        
        {currentView === 'profile' && user && <ProfileView user={user} userProfileData={userProfileData} historyData={historyData} libraryData={libraryData} dataLoaded={dataLoaded} userSettings={userSettings} updateSettings={updateSettings} onLogout={handleLogout} onUpdateData={(n) => setUserProfileData({...userProfileData, ...n})} showToast={showToast} mangas={mangas} onNavigate={navigateTo} shopItems={shopItems} />}
        {currentView === 'popular' && <PopularView mangas={mangas} onNavigate={navigateTo} dataSaver={userSettings.dataSaver} />}
        
        {currentView === 'details' && selectedManga && <DetailsView key={selectedManga.id} manga={selectedManga} libraryData={libraryData} historyData={historyData} user={user} userProfileData={userProfileData} onBack={handleBack} onChapterClick={(m, c) => navigateTo('reader', m, c)} onRequireLogin={() => navigateTo('login')} showToast={showToast} db={db} />}
        {currentView === 'reader' && selectedManga && selectedChapter && <ReaderView key={selectedChapter.id} manga={selectedManga} chapter={selectedChapter} user={user} userProfileData={userProfileData} onBack={handleBack} onChapterClick={(m, c) => navigateTo('reader', m, c)} triggerRandomDrop={triggerRandomDrop} onMarkAsRead={markAsRead} readMode={userSettings.readMode} onRequireLogin={() => navigateTo('login')} showToast={showToast} libraryData={libraryData} onToggleLibrary={handleLibraryToggle} />}
      </main>

      {currentView !== 'reader' && currentView !== 'login' && <Footer />}

      {currentView !== 'reader' && (
        <div className="md:hidden fixed bottom-0 w-full bg-[#050505]/95 backdrop-blur-2xl border-t border-purple-600/10 z-40 pb-safe shadow-[0_-5px_15px_rgba(0,0,0,0.5)]">
          <div className="flex justify-around items-center h-[60px] px-2 relative">
            <button onClick={() => navigateTo('home')} className={`flex flex-col items-center gap-1 w-14 transition-colors duration-300 ${currentView === 'home' ? 'text-purple-500' : 'text-gray-500 hover:text-purple-400'}`}><HomeIcon className="w-5 h-5" /><span className="text-[9px] font-bold">Início</span></button>
            <button onClick={() => navigateTo('catalog')} className={`flex flex-col items-center gap-1 w-14 transition-colors duration-300 ${currentView === 'catalog' ? 'text-purple-500' : 'text-gray-500 hover:text-purple-400'}`}><LayoutGrid className="w-5 h-5" /><span className="text-[9px] font-bold">Catálogo</span></button>
            <div className="relative -top-5 flex justify-center w-16">
                <button onClick={() => user ? navigateTo('nexo') : navigateTo('login')} className={`flex flex-col items-center justify-center w-14 h-14 rounded-full border-[3px] border-[#050505] transition-transform hover:scale-105 duration-300 ${currentView === 'nexo' ? 'bg-gradient-to-tr from-purple-600 to-fuchsia-600 text-white shadow-[0_0_15px_rgba(168,85,247,0.5)]' : 'bg-[#111] text-purple-500'}`}>
                    <Swords className="w-6 h-6 relative z-10" fill={currentView === 'nexo' ? "currentColor" : "none"}/><span className="text-[8px] font-black relative z-10 mt-0.5">INFERIA</span>
                </button>
            </div>
            <button onClick={() => user ? navigateTo('library') : navigateTo('login')} className={`flex flex-col items-center gap-1 w-14 transition-colors duration-300 ${currentView === 'library' ? 'text-purple-500' : 'text-gray-500 hover:text-purple-400'}`}><Library className="w-5 h-5" /><span className="text-[9px] font-bold">Biblioteca</span></button>
            <button onClick={() => user ? navigateTo('profile') : navigateTo('login')} className={`flex flex-col items-center gap-1 w-14 transition-colors duration-300 ${currentView === 'profile' ? 'text-purple-500' : 'text-gray-500 hover:text-purple-400'}`}><UserCircle className="w-5 h-5" /><span className="text-[9px] font-bold">Perfil</span></button>
          </div>
        </div>
      )}
    </div>
  );
}

export default function App() { return <ErrorBoundary><MangaInferiaApp /></ErrorBoundary>; }
