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
    } catch (error) { 
        // TRADUTOR DE ERROS DO FIREBASE
        let msg = "Erro desconhecido nas sombras.";
        if (error.code === 'auth/invalid-credential' || error.code === 'auth/user-not-found' || error.code === 'auth/wrong-password') {
            msg = "Credenciais inválidas. O abismo rejeita você.";
        } else if (error.code === 'auth/email-already-in-use') {
            msg = "Este selo (e-mail) já pertence a outro ninja.";
        } else if (error.code === 'auth/weak-password') {
            msg = "Senha muito fraca para conter seu poder.";
        } else if (error.code === 'auth/invalid-email') {
            msg = "Formato de e-mail inválido.";
        } else if (error.message) {
            msg = error.message;
        }
        showToast(msg, "error"); 
    } finally { 
        setLoading(false); 
    }
  };

  return (
    <div className="min-h-screen bg-[#050505] font-sans flex flex-col items-center justify-center relative px-4 overflow-hidden">
      <style>{`body, html { background-color: #050505 !important; }`}</style>
      
      {/* NOVO FUNDO: Ousado, escuro, com geometria e sem neon pulsante */}
      <div className="absolute inset-0 z-0 overflow-hidden">
          <div className="absolute -top-[20%] -left-[10%] w-[70%] h-[70%] bg-gradient-to-br from-red-900/20 to-transparent rounded-full blur-3xl"></div>
          <div className="absolute -bottom-[20%] -right-[10%] w-[70%] h-[70%] bg-gradient-to-tl from-red-950/40 to-transparent rounded-full blur-3xl"></div>
          <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/stardust.png')] opacity-20 mix-blend-overlay"></div>
      </div>

      <div className="w-full max-w-[400px] relative z-10 animate-in slide-in-from-bottom-4 fade-in duration-700">
        
        <div className="flex flex-col items-center justify-center mb-8 text-center">
            <KageLogo className="w-48 h-48 md:w-56 md:h-56 mb-2 drop-shadow-2xl" showContour={false} />
            <p className="text-gray-500 text-[10px] uppercase tracking-[0.5em] font-black flex items-center gap-2 mt-2">
                <Swords className="w-4 h-4 text-red-700" /> Domínio das Sombras <Swords className="w-4 h-4 text-red-700" />
            </p>
        </div>

        {/* CARD OUSADO: Efeito glassmorphism e bordas limpas */}
        <div className="bg-[#0a0a0c]/80 backdrop-blur-xl border border-white/5 border-t-white/10 border-l-white/10 p-8 sm:p-10 rounded-[2.5rem] shadow-[0_30px_60px_rgba(0,0,0,0.8)] relative overflow-hidden">
            <form onSubmit={handleSubmit} className="space-y-4">
              {isRegister && (
                <div className="relative group">
                  <User className="absolute left-5 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-600 group-focus-within:text-red-500 transition-colors"/>
                  <input type="text" value={name} onChange={(e) => setName(e.target.value)} placeholder="Nome Sombrio" className="w-full pl-12 pr-4 py-4 bg-black/50 border border-white/5 rounded-2xl text-white text-sm font-bold outline-none focus:border-red-600/50 transition-all placeholder:text-gray-600" required />
                </div>
              )}
              <div className="relative group">
                <Mail className="absolute left-5 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-600 group-focus-within:text-red-500 transition-colors"/>
                <input type="email" value={email} onChange={(e) => setEmail(e.target.value)} placeholder="E-mail Astral" className="w-full pl-12 pr-4 py-4 bg-black/50 border border-white/5 rounded-2xl text-white text-sm font-bold outline-none focus:border-red-600/50 transition-all placeholder:text-gray-600" required />
              </div>
              <div className="relative group">
                <Lock className="absolute left-5 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-600 group-focus-within:text-red-500 transition-colors"/>
                <input type="password" value={password} onChange={(e) => setPassword(e.target.value)} placeholder="Senha de Selamento" className="w-full pl-12 pr-4 py-4 bg-black/50 border border-white/5 rounded-2xl text-white text-sm font-bold outline-none focus:border-red-600/50 transition-all placeholder:text-gray-600" required />
              </div>

              <button type="submit" disabled={loading} className="w-full mt-8 bg-red-700 text-white rounded-2xl font-black py-4.5 transition-all hover:bg-red-600 tracking-[0.2em] text-[11px] uppercase flex justify-center items-center gap-2 disabled:opacity-60 shadow-lg">
                 {loading ? <div className="w-5 h-5 border-2 border-white/50 border-t-white rounded-full animate-spin"></div> : isRegister ? <><Flame className="w-4 h-4"/> Forjar Aliança</> : <><Moon className="w-4 h-4"/> Adentrar as Sombras</>}
              </button>
            </form>

            <div className="mt-8 pt-6 border-t border-white/5 flex flex-col items-center gap-5 text-center">
                <button onClick={() => setIsRegister(!isRegister)} className="text-[10px] text-gray-400 hover:text-red-500 tracking-[0.2em] uppercase font-black transition-colors">
                    {isRegister ? "Já possui um selo? Faça login." : "Ainda não é um ninja? Alistar-se."}
                </button>
                <button onClick={onGuestAccess} className="text-gray-600 hover:text-white text-[9px] uppercase font-black tracking-[0.3em] transition-colors">
                    Acesso de Espectador
                </button>
            </div>
        </div>
      </div>
    </div>
  );
}
