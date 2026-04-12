import React, { useState, useEffect, useRef } from 'react';
import { Compass, History, Library, Smartphone, Moon, Sun, Camera, Edit3, LogOut, Loader2, UserCircle, BookOpen, Trash2, RefreshCw, AlertTriangle } from 'lucide-react';
import { updateProfile } from "firebase/auth";
import { doc, setDoc, deleteDoc } from "firebase/firestore";
import { auth, db } from './firebase';
import { APP_ID } from './constants';
import { compressImage, getLevelRequirement, getLevelTitle, cleanCosmeticUrl } from './helpers';

export function ProfileView({ user, userProfileData, historyData, libraryData, dataLoaded, userSettings, updateSettings, onLogout, onUpdateData, showToast, mangas, onNavigate }) {
  const [isEditing, setIsEditing] = useState(false);
  const [activeTab, setActiveTab] = useState("Estatisticas"); 
  const [name, setName] = useState('');
  const [bio, setBio] = useState('');
  const [avatarBase64, setAvatarBase64] = useState('');
  const [coverBase64, setCoverBase64] = useState('');
  const [loading, setLoading] = useState(false);
  const [confirmAction, setConfirmAction] = useState(null); 

  useEffect(() => {
    setName(user.displayName || ''); setBio(userProfileData.bio || ''); setAvatarBase64(userProfileData.avatarUrl || user.photoURL || ''); setCoverBase64(userProfileData.coverUrl || '');
  }, [user, userProfileData]);
  
  const handleSave = async (e) => {
    e.preventDefault(); setLoading(true);
    try { await updateProfile(auth.currentUser, { displayName: name }); const docData = { coverUrl: coverBase64, avatarUrl: avatarBase64, bio: bio }; await setDoc(doc(db, 'artifacts', APP_ID, 'users', user.uid, 'profile', 'main'), docData, { merge: true }); onUpdateData(docData); showToast('Identidade sincronizada.', 'success'); setIsEditing(false); } catch (error) { showToast(`Erro no Vazio.`, 'error'); } finally { setLoading(false); }
  };

  const level = userProfileData.level || 1; 
  const currentXp = userProfileData.xp || 0; 
  const xpNeeded = getLevelRequirement(level); 
  const progressPercent = Math.min(100, (currentXp / xpNeeded) * 100);
  const eq = userProfileData.equipped_items || {};

  const activeAvatarSrc = (eq.avatar?.preview || eq.avatar?.url || avatarBase64 || `https://placehold.co/150x150/020203/ffffff?text=U`);

  return (
    <div className="animate-in fade-in duration-1000 w-full pb-20 font-sans min-h-screen text-zinc-400 bg-[#020203]">
      <div className="h-64 w-full bg-[#050508] relative border-b border-white/5">
        {coverBase64 && <img src={coverBase64} className="w-full h-full object-cover opacity-20 grayscale" />}
        <div className="absolute inset-0 bg-gradient-to-t from-[#020203] to-transparent" />
      </div>

      <div className="max-w-4xl mx-auto px-6 relative -mt-32 z-10">
        <div className="flex flex-col md:flex-row items-center md:items-end gap-8 mb-16">
          <div className="relative group">
            <div className="w-32 h-32 md:w-44 md:h-44 bg-[#050508] rounded-full border border-white/10 overflow-hidden shadow-[0_0_50px_rgba(0,0,0,0.8)]">
               <img src={activeAvatarSrc} className="w-full h-full object-cover grayscale group-hover:grayscale-0 transition-all duration-700" alt="Avatar" />
            </div>
          </div>

          <div className="flex-1 text-center md:text-left">
            <h1 className="text-4xl md:text-6xl font-black text-white tracking-tighter uppercase mb-2">{name || 'Inominado'}</h1>
            <p className="text-[10px] text-zinc-600 font-black tracking-[0.5em] uppercase mb-8">{user.email}</p>
            
            {/* BARRA DE XP SURREAL */}
            <div className="w-full max-w-md mx-auto md:mx-0">
                <div className="flex justify-between items-end mb-4">
                    <div className="flex flex-col">
                        <span className="text-xs font-black text-white tracking-[0.2em] uppercase">Nível {level}</span>
                        <span className="text-[9px] text-zinc-600 font-bold uppercase tracking-widest">{getLevelTitle(level)}</span>
                    </div>
                    <span className="text-[10px] font-black text-zinc-500">{currentXp} <span className="opacity-30">/</span> {xpNeeded} XP</span>
                </div>
                {/* O Design Surreal da Barra */}
                <div className="relative h-[2px] w-full bg-zinc-900 overflow-visible">
                    <div className="absolute top-0 left-0 h-full bg-white transition-all duration-1000 ease-in-out" style={{ width: `${progressPercent}%` }}>
                        <div className="absolute -right-1 -top-1 w-2 h-2 bg-white rounded-full shadow-[0_0_15px_white]"></div>
                    </div>
                </div>
            </div>
          </div>
          <button onClick={() => setIsEditing(!isEditing)} className="border border-zinc-800 text-zinc-500 px-8 py-3 rounded-sm text-[10px] uppercase font-black tracking-widest hover:bg-white hover:text-black transition-all">
             {isEditing ? 'Fechar' : 'Editar'}
          </button>
        </div>

        {/* Abas e Conteúdo continuam como antes, apenas com visual adaptado ao Abismo */}
        <div className="flex gap-10 border-b border-zinc-900 mb-12 overflow-x-auto no-scrollbar">
            {["Estatisticas", "Historico", "Biblioteca"].map(tab => (
                <button key={tab} onClick={() => setActiveTab(tab)} className={`pb-4 text-[10px] font-black uppercase tracking-[0.3em] transition-all ${activeTab === tab ? 'text-white border-b-2 border-white' : 'text-zinc-600'}`}>{tab}</button>
            ))}
        </div>

        {activeTab === "Estatisticas" && (
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 animate-in slide-in-from-bottom-4 duration-700">
                <div className="bg-[#050508] border border-white/5 p-8 rounded-sm text-center">
                    <div className="text-3xl font-black text-white mb-2">{Object.keys(libraryData).length}</div>
                    <div className="text-[8px] text-zinc-600 uppercase font-black tracking-[0.3em]">Obras Salvas</div>
                </div>
                <div className="bg-[#050508] border border-white/5 p-8 rounded-sm text-center">
                    <div className="text-3xl font-black text-white mb-2">{historyData.length}</div>
                    <div className="text-[8px] text-zinc-600 uppercase font-black tracking-[0.3em]">Lidos</div>
                </div>
            </div>
        )}
      </div>
    </div>
  );
}
