// CÓDIGO COMPLETO DO PROFILEVIEW
import React, { useState, useEffect, useRef } from 'react';
import { Compass, History, Library, Camera, Edit3, LogOut, Loader2, BookOpen, AlertTriangle, Trophy, Zap, Trash2, RefreshCw, Settings, Flame, Eye, Bookmark, Hexagon, Crown, Ghost, Lock, Sparkles, Box } from 'lucide-react';
import { updateProfile } from "firebase/auth";
import { doc, setDoc, deleteDoc } from "firebase/firestore";
import { auth, db } from './firebase';
import { APP_ID } from './constants';
import { compressImage, getLevelRequirement, getLevelTitle, cleanCosmeticUrl, timeAgo, getRarityColor } from './helpers';

// ... (Mantenha o ShadowCard e o AchievementBadge do código anterior)

// Componente do Perfil (agora recebe shopItems nas props)
export function ProfileView({ user, userProfileData, historyData, libraryData, dataLoaded, userSettings, updateSettings, onLogout, onUpdateData, showToast, mangas, onNavigate, shopItems = [] }) {
  const [isEditing, setIsEditing] = useState(false);
  
  // ABAS: Estatísticas, Emblemas, Inventário, Histórico, Configurações
  const [activeTab, setActiveTab] = useState("Estatísticas"); 
  const [inventoryCategory, setInventoryCategory] = useState("avatar");

  // ... (Estados do form e useEffects)
  const [name, setName] = useState('');
  const [bio, setBio] = useState('');
  const [avatarBase64, setAvatarBase64] = useState('');
  const [coverBase64, setCoverBase64] = useState('');
  const [loading, setLoading] = useState(false);
  const [confirmAction, setConfirmAction] = useState(null); 

  useEffect(() => {
    setName(user.displayName || ''); setBio(userProfileData.bio || ''); setAvatarBase64(userProfileData.avatarUrl || user.photoURL || ''); setCoverBase64(userProfileData.coverUrl || '');
  }, [user, userProfileData]);
  
  const avatarInputRef = useRef(null); const coverInputRef = useRef(null);

  // Lógica de Equipar Cosméticos do Inventário
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
            showToast("Cosmético desequipado.", "info");
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

  // ... (Manter handleImageUpload, handleSave, executeConfirmAction)

  const eq = userProfileData.equipped_items || {};
  const activeAvatarSrc = (eq.avatar?.preview ? cleanCosmeticUrl(eq.avatar.preview) : null) || avatarBase64 || `https://placehold.co/150x150/0A0E17/22d3ee?text=K`;

  return (
    <div className={`animate-in fade-in duration-300 w-full pb-24 font-sans min-h-screen text-gray-200 bg-[#030305] overflow-x-hidden`}>
      
      {/* ... (Manter Fundo, Modais, Header com Capa e Avatar idênticos ao código anterior) */}

      <div className="max-w-6xl mx-auto px-4 sm:px-6 relative z-10">
        
        {/* ... (Manter Bloco do Avatar e Level do código anterior) */}

        {/* MENU DE ABAS DO PERFIL */}
        <div className="mb-8 border-b border-red-900/30 mt-12">
          <div className="flex gap-4 md:gap-8 overflow-x-auto no-scrollbar snap-x px-2">
            {['Estatísticas', 'Emblemas', 'Inventário', 'Histórico', 'Configurações'].map((tab) => (
              <button key={tab} onClick={() => setActiveTab(tab)} className={`snap-start px-4 pb-5 font-black transition-all duration-300 whitespace-nowrap text-[11px] sm:text-xs uppercase tracking-widest md:tracking-[0.2em] relative group
              ${activeTab === tab ? 'text-white' : 'text-gray-500 hover:text-gray-300'}`}>
                {tab}
                {activeTab === tab && (
                    <div className="absolute bottom-[-1px] left-1/2 -translate-x-1/2 w-full h-[3px] bg-gradient-to-r from-transparent via-red-600 to-transparent rounded-t-full shadow-[0_0_15px_rgba(220,38,38,0.8)]"></div>
                )}
              </button>
            ))}
          </div>
        </div>
        
        {/* ... (Manter abas de Estatísticas e Emblemas do código anterior) */}

        {/* NOVA ABA: INVENTÁRIO (Onde você equipa o que comprou) */}
        {activeTab === "Inventário" && (
            <div className="animate-in fade-in slide-in-from-left-4 duration-300">
                <div className="bg-[#0a0a0c]/90 border border-white/5 rounded-xl p-5 md:p-7 shadow-xl">
                  
                  <div className="flex items-center gap-3 mb-6 border-b border-white/5 pb-4">
                    <Box className="w-5 h-5 text-red-500" />
                    <div>
                        <h2 className="text-xl font-black text-white tracking-tighter uppercase">Relíquias Adquiridas</h2>
                        <p className="text-gray-500 text-[9px] font-bold uppercase tracking-widest mt-1">Gerencie e equipe seus itens cosméticos.</p>
                    </div>
                  </div>

                  {/* Sub-Abas do Inventário */}
                  <div className="flex gap-3 overflow-x-auto no-scrollbar mb-6 pb-2">
                      {[ { id: 'avatar', label: 'Avatar' }, { id: 'capa_fundo', label: 'Capa' }, { id: 'moldura', label: 'Moldura' }, { id: 'nickname', label: 'Nick' } ].map(cat => (
                          <button key={cat.id} onClick={() => setInventoryCategory(cat.id)} className={`flex-shrink-0 px-4 py-2 rounded-lg font-black text-[9px] uppercase tracking-widest transition-all border ${ inventoryCategory === cat.id ? 'bg-red-600 text-white border-red-500' : 'bg-[#030305] text-gray-500 border-white/5 hover:text-white' }`}>
                              {cat.label}
                          </button>
                      ))}
                  </div>

                  {/* Grid de Itens que o usuário possui */}
                  <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
                      {shopItems.filter(item => {
                          const hasItem = userProfileData.inventory?.includes(item.id);
                          const cat = (item.categoria || item.type || '').toLowerCase();
                          if (!hasItem) return false;
                          if (inventoryCategory === 'capa_fundo') return cat === 'capa_fundo' || cat === 'capa';
                          return cat === inventoryCategory;
                      }).length === 0 ? (
                          <p className="text-gray-600 text-[10px] font-black uppercase tracking-widest col-span-full py-10 text-center">Nenhum item desta categoria.</p>
                      ) : (
                          shopItems.filter(item => {
                              const hasItem = userProfileData.inventory?.includes(item.id);
                              const cat = (item.categoria || item.type || '').toLowerCase();
                              if (!hasItem) return false;
                              if (inventoryCategory === 'capa_fundo') return cat === 'capa_fundo' || cat === 'capa';
                              return cat === inventoryCategory;
                          }).map(item => {
                              let itemCat = (item.categoria || item.type || '').toLowerCase();
                              if (itemCat === 'capa') itemCat = 'capa_fundo';
                              const isEquipped = userProfileData.equipped_items?.[itemCat]?.id === item.id;

                              return (
                                  <div key={item.id} className={`bg-[#050505] border rounded-2xl p-4 flex flex-col items-center text-center transition-all duration-300 relative overflow-hidden ${isEquipped ? 'border-red-600' : 'border-white/5'}`}>
                                      
                                      {(item.css || item.animacao || item.keyframes) && ( <style dangerouslySetInnerHTML={{__html: `.${item.cssClass || 'custom-ia-class'} { ${item.css || ''} } ${item.animacao || item.keyframes || ''}`}} /> )}
                                      
                                      <div className={`w-16 h-16 rounded-xl mb-3 bg-black flex items-center justify-center overflow-hidden border border-white/5 relative flex-shrink-0 ${itemCat === 'avatar' ? (item.cssClass || 'custom-ia-class') : ''}`}>
                                          {['capa_fundo', 'tema_perfil'].includes(itemCat) && cleanCosmeticUrl(item.preview) && ( <img src={cleanCosmeticUrl(item.preview)} className={`w-full h-full object-cover opacity-80 ${item.cssClass || 'custom-ia-class'}`} /> )}
                                          {itemCat === 'moldura' && cleanCosmeticUrl(item.preview) && ( <img src={cleanCosmeticUrl(item.preview)} className={`absolute inset-0 w-full h-full object-cover z-20 pointer-events-none rounded-full scale-[1.15] ${item.cssClass || 'custom-ia-class'}`} style={{ mixBlendMode: 'screen' }} /> )}
                                          {itemCat === 'avatar' && cleanCosmeticUrl(item.preview) && ( <img src={cleanCosmeticUrl(item.preview)} className={`w-full h-full object-cover relative z-10`} /> )}
                                          {itemCat === 'nickname' && ( <div className={`font-black text-sm z-20 ${item.cssClass || 'custom-ia-class'}`}>Kage</div> )}
                                      </div>

                                      <h4 className="text-white font-black mb-3 text-[10px] line-clamp-1 relative z-10">{item.nome || item.name}</h4>
                                      
                                      <button onClick={() => handleEquipCosmetic(item)} className={`w-full rounded-lg font-black py-2.5 transition-all text-[9px] uppercase tracking-widest relative z-10 ${isEquipped ? 'bg-red-600 text-white' : 'bg-[#0a0a0c] text-gray-400 hover:text-white border border-white/10 hover:border-white/30'}`}>
                                          {isEquipped ? 'Equipado' : 'Equipar'}
                                      </button>
                                  </div>
                              )
                          })
                      )}
                  </div>
                </div>
            </div>
        )}

        {/* ... (Manter abas de Histórico e Configurações do código anterior) */}

      </div>
    </div>
  );
}
