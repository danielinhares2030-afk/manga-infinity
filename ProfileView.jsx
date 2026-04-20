import React, { useState, useEffect, useRef } from 'react';
import { Compass, History, Library, Smartphone, Camera, Edit3, LogOut, Loader2, BookOpen, AlertTriangle, Trophy, Zap, Trash2, RefreshCw, LayoutTemplate } from 'lucide-react';
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
    setName(user.displayName || '');
    setBio(userProfileData.bio || '');
    setAvatarBase64(userProfileData.avatarUrl || user.photoURL || '');
    setCoverBase64(userProfileData.coverUrl || '');
  }, [user, userProfileData]);
  
  const avatarInputRef = useRef(null);
  const coverInputRef = useRef(null);

  const handleImageUpload = async (e, type) => {
    const file = e.target.files[0];
    if (!file) return;
    try {
      const compressedBase64 = await compressImage(file, type === 'cover' ? 400 : 150, 0.4);
      if (type === 'avatar') setAvatarBase64(compressedBase64);
      else setCoverBase64(compressedBase64);
    } catch {
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
      showToast('Perfil atualizado!', 'success');
      setIsEditing(false);
    } catch {
      showToast(`Erro ao salvar.`, 'error');
    } finally {
      setLoading(false);
    }
  };

  const level = userProfileData.level || 1;
  const currentXp = userProfileData.xp || 0;
  const xpNeeded = getLevelRequirement(level);
  const progressPercent = Math.min(100, Math.max(0, (currentXp / xpNeeded) * 100));

  const eq = userProfileData.equipped_items || {};
  const activeAvatarSrc =
    (eq.avatar?.preview ? cleanCosmeticUrl(eq.avatar.preview) : null) ||
    avatarBase64 ||
    `https://placehold.co/150x150/0b0e14/22d3ee?text=U`;

  return (
    <div className="w-full pb-24 min-h-screen text-gray-200 bg-transparent">

      {/* CAPA */}
      <div className="w-full h-[200px] md:h-[240px] bg-[#050508] relative">
        {coverBase64 ? (
          <img src={coverBase64} className="w-full h-full object-cover opacity-80" />
        ) : (
          <div className="w-full h-full bg-gradient-to-br from-cyan-900/30 to-indigo-900/30" />
        )}

        {/* fade bonito */}
        <div className="absolute inset-x-0 bottom-0 h-20 bg-gradient-to-t from-black to-transparent" />
      </div>

      {/* CARD */}
      <div className="max-w-3xl mx-auto px-4 relative z-10 -mt-16">

        <div className="bg-black/50 backdrop-blur-2xl border border-white/10 p-5 md:p-6 rounded-xl shadow-[0_8px_32px_rgba(0,0,0,0.5)] flex flex-col items-center text-center">

          {/* AVATAR */}
          <div className="relative w-20 h-20 md:w-24 md:h-24 mb-3">
            <div className="w-full h-full rounded-xl overflow-hidden bg-[#0a0a0f] border border-white/10 shadow-xl">
              <img src={activeAvatarSrc} className="w-full h-full object-cover" />
            </div>
          </div>

          {/* INFO */}
          <h1 className="text-xl md:text-2xl font-black text-white">
            {name || 'Usuário'}
          </h1>

          <p className="text-gray-400 text-xs mt-1">{user.email}</p>

          {bio && (
            <p className="text-gray-300 text-[11px] mt-2 bg-white/5 px-3 py-1.5 rounded-lg border border-white/5">
              {bio}
            </p>
          )}

          {/* XP */}
          <div className="w-full bg-black/40 p-4 rounded-xl mt-5">
            <div className="flex justify-between text-xs mb-2">
              <span>LVL {level}</span>
              <span>{currentXp} / {xpNeeded}</span>
            </div>

            <div className="w-full h-1.5 bg-white/10 rounded">
              <div
                className="h-full bg-cyan-400"
                style={{ width: `${progressPercent}%` }}
              />
            </div>
          </div>

          {/* BOTÕES */}
          <div className="flex gap-3 mt-5 w-full">
            <button
              onClick={() => setIsEditing(!isEditing)}
              className="flex-1 bg-white/10 py-2 rounded-lg text-xs"
            >
              Editar
            </button>

            <button
              onClick={onLogout}
              className="bg-red-500/20 px-3 rounded-lg"
            >
              <LogOut size={16} />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
