import React, { useState } from 'react';
import { getAuth, signInWithEmailAndPassword, createUserWithEmailAndPassword, updateProfile } from "firebase/auth";
import { app, auth } from './firebase'; 
import { KageLogo } from './UIComponents';
import { Mail, Lock, User, Flame, Swords, Moon, AlertCircle, Eye, EyeOff } from 'lucide-react';

export function LoginView({ onLoginSuccess, onGuestAccess, showToast }) {
  const [isRegister, setIsRegister] = useState(false);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');
  const [loading, setLoading] = useState(false);
  const [localError, setLocalError] = useState(null);
  const [showPass, setShowPass] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault(); 
    setLoading(true);
    setLocalError(null);
    try {
      if (isRegister) {
        if (!name.trim()) throw new Error("missing-name");
        const userCredential = await createUserWithEmailAndPassword(auth, email, password);
        await updateProfile(userCredential.user, { displayName: name });
        showToast("Seu pacto de sangue começou!", "success");
      } else {
        await signInWithEmailAndPassword(auth, email, password);
        showToast("Bem-vindo de volta às sombras.", "success");
      }
      onLoginSuccess();
    } catch (error) { 
        let msg = "Erro no sistema.";
        if (error.code === 'auth/invalid-credential') msg = "E-mail não cadastrado ou senha incorreta.";
        else if (error.code === 'auth/email-already-in-use') msg = "Este e-mail já está em uso.";
        else if (error.code === 'auth/weak-password') msg = "A senha deve ter 6 ou mais dígitos.";
        else if (error.message === 'missing-name') msg = "O nome é obrigatório.";
        
        showToast(msg, "error"); 
        setLocalError(msg);
    } finally { 
        setLoading(false); 
    }
  };

  return (
    <div className="min-h-screen font-sans flex flex-col items-center justify-start pt-6 pb-10 relative px-6 overflow-y-auto">
      <style>{`body, html { background-color: #050505 !important; }`}</style>
      
      {/* FUNDO CSS OTIMIZADO (CARREGA NA HORA) */}
      <div className="fixed inset-0 z-0 bg-[#050505]">
          <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-red-900/20 via-[#050505] to-[#050505]"></div>
          <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/stardust.png')] opacity-30 mix-blend-screen"></div>
      </div>

      <div className="w-full max-w-[440px] relative z-10 animate-in fade-in duration-1000">
        
        <div className="flex flex-col items-center justify-center mb-6 text-center">
            <div className="w-64 h-64 md:w-80 md:h-80 drop-shadow-[0_0_35px_rgba(220,38,38,0.3)] transform hover:scale-105 transition-transform duration-700">
                <KageLogo className="w-full h-full" showContour={false} />
            </div>
            <p className="text-amber-500/80 text-[10px] uppercase tracking-[0.6em] font-black flex items-center gap-3 mt-[-20px] drop-shadow-md">
                <span className="text-red-600">⚔</span> Domínio das Sombras <span className="text-red-600">⚔</span>
            </p>
        </div>

        <div className="bg-[#0f0f0f]/90 backdrop-blur-2xl border border-red-900/30 p-8 sm:p-10 rounded-[2.5rem] shadow-[0_0_60px_rgba(0,0,0,1)] mt-2">
            
            {localError && (
                <div className="mb-6 bg-red-950/40 border border-red-500/30 text-red-200 text-[10px] font-black p-3 rounded-xl text-center flex items-center justify-center gap-2">
                    <AlertCircle className="w-3 h-3" /> {localError}
                </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-5">
              {isRegister && (
                <div className="relative group bg-black/40 border border-white/5 rounded-2xl p-4 flex items-center gap-4 focus-within:border-red-600/50 transition-all">
                  <User className="w-5 h-5 text-gray-600" />
                  <div className="flex flex-col flex-1">
                      <span className="text-[10px] text-gray-500 font-bold uppercase tracking-widest">Nome do Ninja</span>
                      <input type="text" value={name} onChange={(e) => setName(e.target.value)} placeholder="Ex: Daniel" className="bg-transparent text-white text-sm font-bold outline-none placeholder:text-gray-700 w-full" required />
                  </div>
                </div>
              )}

              <div className="relative group bg-black/40 border border-white/5 rounded-2xl p-4 flex items-center gap-4 focus-within:border-red-600/50 transition-all">
                <Mail className="w-5 h-5 text-gray-600" />
                <div className="flex flex-col flex-1">
                    <span className="text-[10px] text-gray-500 font-bold uppercase tracking-widest">Digite seu E-mail</span>
                    <input type="email" value={email} onChange={(e) => setEmail(e.target.value)} placeholder="exemplo@email.com" className="bg-transparent text-white text-sm font-bold outline-none placeholder:text-gray-700 w-full" required />
                </div>
              </div>

              <div className="relative group bg-black/40 border border-white/5 rounded-2xl p-4 flex items-center gap-4 focus-within:border-red-600/50 transition-all">
                <Lock className="w-5 h-5 text-gray-600" />
                <div className="flex flex-col flex-1">
                    <span className="text-[10px] text-gray-500 font-bold uppercase tracking-widest">Sua senha secreta</span>
                    <input type={showPass ? "text" : "password"} value={password} onChange={(e) => setPassword(e.target.value)} placeholder="Mín. 6 dígitos" className="bg-transparent text-white text-sm font-bold outline-none placeholder:text-gray-700 w-full" required />
                </div>
                <button type="button" onClick={() => setShowPass(!showPass)} className="text-gray-600 hover:text-white">{showPass ? <EyeOff className="w-4 h-4"/> : <Eye className="w-4 h-4"/>}</button>
              </div>

              <button type="submit" disabled={loading} className="w-full mt-4 bg-gradient-to-b from-red-600 to-red-800 text-white rounded-full font-black py-4 transition-all hover:scale-[1.02] tracking-[0.2em] text-[11px] uppercase flex justify-center items-center gap-3 shadow-[0_10px_20px_rgba(220,38,38,0.3)] border-t border-red-400/20 relative overflow-hidden group">
                 <div className="absolute inset-0 bg-white/10 opacity-0 group-hover:opacity-100 transition-opacity"></div>
                 {loading ? <div className="w-5 h-5 border-2 border-white/50 border-t-white rounded-full animate-spin"></div> : <><Moon className="w-4 h-4 fill-current"/> Adentrar as Sombras</>}
              </button>
            </form>

            <div className="mt-8 flex flex-col items-center gap-6 text-center">
                <button onClick={() => { setIsRegister(!isRegister); setLocalError(null); }} className="text-[10px] text-gray-400 tracking-widest font-black uppercase transition-colors">
                    {isRegister ? "Já tem um selo? " : "Ainda não é um ninja? " }
                    <span className="text-red-500 hover:text-red-400 underline underline-offset-4">{isRegister ? "FAZER LOGIN" : "ALISTAR-SE"}</span>
                </button>
                
                <button onClick={onGuestAccess} className="flex items-center gap-3 text-gray-500 hover:text-red-500 text-[10px] uppercase font-black tracking-[0.2em] transition-all group">
                    <div className="p-2 bg-white/5 rounded-lg group-hover:bg-red-500/10"><User className="w-4 h-4" /></div>
                    Acesso de Espectador
                </button>
            </div>
        </div>
      </div>
    </div>
  );
}
