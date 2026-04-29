import React, { useState } from 'react';
import { getAuth, signInWithEmailAndPassword, createUserWithEmailAndPassword, updateProfile } from "firebase/auth";
import { app, auth } from './firebase'; 
import { KageLogo } from './UIComponents';
import { Mail, Lock, User, Flame, Swords, Moon } from 'lucide-react';

export function LoginView({ onLoginSuccess, onGuestAccess, showToast }) {
  const [isRegister, setIsRegister] = useState(false);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault(); setLoading(true);
    try {
      if (isRegister) {
        if (!name.trim()) throw new Error("O nome nas sombras é obrigatório.");
        const userCredential = await createUserWithEmailAndPassword(auth, email, password);
        await updateProfile(userCredential.user, { displayName: name });
        showToast("Seu pacto de sangue começou!", "success");
      } else {
        await signInWithEmailAndPassword(auth, email, password);
        showToast("Bem-vindo de volta às sombras.", "success");
      }
      onLoginSuccess();
    } catch (error) { showToast(error.message, "error"); } finally { setLoading(false); }
  };

  return (
    <div className="min-h-screen bg-[#050505] font-sans flex flex-col items-center justify-center relative px-4 overflow-hidden">
      <style>{`body, html { background-color: #050505 !important; }`}</style>
      
      {/* Grid sutil no fundo, sem animações pesadas ou neon */}
      <div className="absolute inset-0 opacity-[0.03] bg-[linear-gradient(to_right,#ffffff_1px,transparent_1px),linear-gradient(to_bottom,#ffffff_1px,transparent_1px)] bg-[size:60px_60px]"></div>

      <div className="w-full max-w-[380px] relative z-10 animate-in slide-in-from-bottom-4 fade-in duration-700">
        
        <div className="flex flex-col items-center justify-center mb-8 text-center">
            <KageLogo className="w-48 h-48 md:w-56 md:h-56 mb-2" showContour={false} />
            <p className="text-gray-500 text-[9px] uppercase tracking-[0.4em] font-bold flex items-center gap-2 mt-2">
                <Swords className="w-3 h-3 text-red-600" /> Domínio das Sombras <Swords className="w-3 h-3 text-red-600" />
            </p>
        </div>

        <div className="bg-[#0a0a0c] border border-white/5 p-8 rounded-3xl shadow-xl relative overflow-hidden">
            <form onSubmit={handleSubmit} className="space-y-4">
              {isRegister && (
                <div className="relative group">
                  <User className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500 group-focus-within:text-red-500 transition-colors"/>
                  <input type="text" value={name} onChange={(e) => setName(e.target.value)} placeholder="Nome Sombrio" className="w-full pl-11 pr-4 py-3.5 bg-[#050505] border border-white/10 rounded-xl text-white text-sm font-medium outline-none focus:border-red-600/50 transition-all placeholder:text-gray-600" required />
                </div>
              )}
              <div className="relative group">
                <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500 group-focus-within:text-red-500 transition-colors"/>
                <input type="email" value={email} onChange={(e) => setEmail(e.target.value)} placeholder="E-mail Astral" className="w-full pl-11 pr-4 py-3.5 bg-[#050505] border border-white/10 rounded-xl text-white text-sm font-medium outline-none focus:border-red-600/50 transition-all placeholder:text-gray-600" required />
              </div>
              <div className="relative group">
                <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500 group-focus-within:text-red-500 transition-colors"/>
                <input type="password" value={password} onChange={(e) => setPassword(e.target.value)} placeholder="Senha de Selamento" className="w-full pl-11 pr-4 py-3.5 bg-[#050505] border border-white/10 rounded-xl text-white text-sm font-medium outline-none focus:border-red-600/50 transition-all placeholder:text-gray-600" required />
              </div>

              <button type="submit" disabled={loading} className="w-full mt-6 bg-red-600 text-white rounded-xl font-black py-4 transition-all hover:bg-red-500 tracking-widest text-xs flex justify-center items-center gap-2 disabled:opacity-60 shadow-[0_0_15px_rgba(220,38,38,0.2)] hover:shadow-[0_0_20px_rgba(220,38,38,0.4)]">
                 {loading ? <div className="w-5 h-5 border-2 border-white/50 border-t-white rounded-full animate-spin"></div> : isRegister ? <><Flame className="w-4 h-4"/> Forjar Aliança</> : <><Moon className="w-4 h-4"/> Adentrar as Sombras</>}
              </button>
            </form>

            <div className="mt-8 pt-6 border-t border-white/5 flex flex-col items-center gap-4 text-center">
                <button onClick={() => setIsRegister(!isRegister)} className="text-[10px] text-gray-500 hover:text-red-400 tracking-widest uppercase font-bold transition-colors">
                    {isRegister ? "Já possui um selo? Faça login." : "Ainda não é um ninja? Alistar-se."}
                </button>
                <button onClick={onGuestAccess} className="text-gray-600 hover:text-white text-[9px] uppercase font-black tracking-[0.2em] transition-colors mt-2">
                    Acesso de Espectador
                </button>
            </div>
        </div>
      </div>
    </div>
  );
}
