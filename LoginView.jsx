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
        if (!name.trim()) throw new Error("auth/missing-name");
        const userCredential = await createUserWithEmailAndPassword(auth, email, password);
        await updateProfile(userCredential.user, { displayName: name });
        showToast("Seu pacto de sangue começou!", "success");
      } else {
        await signInWithEmailAndPassword(auth, email, password);
        showToast("Bem-vindo de volta às sombras.", "success");
      }
      onLoginSuccess();
    } catch (error) { 
        // CAPTURA ESTENDIDA DE ERROS DO FIREBASE
        let msg = "Erro nas sombras: " + error.message;
        if (error.code === 'auth/invalid-credential' || error.code === 'auth/user-not-found' || error.code === 'auth/wrong-password') {
            msg = "Credenciais inválidas. O abismo rejeita você.";
        } else if (error.code === 'auth/email-already-in-use') {
            msg = "Este e-mail já pertence a outro ninja.";
        } else if (error.code === 'auth/weak-password') {
            msg = "Senha muito fraca para conter seu poder.";
        } else if (error.code === 'auth/invalid-email') {
            msg = "Formato de e-mail inválido.";
        } else if (error.message === 'auth/missing-name') {
            msg = "O nome nas sombras é obrigatório.";
        }
        showToast(msg, "error"); 
    } finally { 
        setLoading(false); 
    }
  };

  return (
    <div className="min-h-screen bg-[#020202] font-sans flex flex-col items-center justify-center relative px-4 overflow-hidden">
      <style>{`body, html { background-color: #020202 !important; }`}</style>
      
      {/* FUNDO: Preto com toques de dourado e ondas */}
      <div className="absolute inset-0 z-0 overflow-hidden pointer-events-none">
          <div className="absolute -top-[30%] -left-[20%] w-[80%] h-[80%] bg-[radial-gradient(ellipse_at_center,rgba(234,179,8,0.08)_0%,transparent_70%)] rounded-full blur-3xl"></div>
          <div className="absolute -bottom-[30%] -right-[20%] w-[80%] h-[80%] bg-[radial-gradient(ellipse_at_center,rgba(234,179,8,0.05)_0%,transparent_70%)] rounded-full blur-3xl"></div>
          {/* SVG DE ONDAS */}
          <div className="absolute inset-0 opacity-[0.15] mix-blend-screen" style={{ backgroundImage: `url("data:image/svg+xml,%3Csvg width='120' height='20' viewBox='0 0 120 20' xmlns='http://www.w3.org/2000/svg'%3E%3Cpath d='M0,10 Q30,20 60,10 T120,10' fill='none' stroke='%23ca8a04' stroke-width='1.5'/%3E%3C/svg%3E")`, backgroundSize: '120px 20px' }}></div>
      </div>

      <div className="w-full max-w-[440px] relative z-10 animate-in slide-in-from-bottom-4 fade-in duration-700 mt-4">
        
        <div className="flex flex-col items-center justify-center mb-6 text-center">
            <KageLogo className="w-48 h-48 md:w-52 md:h-52 mb-1 drop-shadow-[0_0_20px_rgba(234,179,8,0.2)]" showContour={false} />
            <p className="text-amber-500/70 text-[10px] uppercase tracking-[0.6em] font-black flex items-center gap-2 mt-3 drop-shadow-md">
                <Swords className="w-4 h-4 text-amber-600" /> Domínio das Sombras <Swords className="w-4 h-4 text-amber-600" />
            </p>
        </div>

        {/* CARD OUSADO E MAIOR */}
        <div className="bg-[#050505]/90 backdrop-blur-2xl border border-amber-900/30 border-t-amber-500/20 border-b-black p-8 sm:p-12 rounded-[2.5rem] shadow-[0_40px_80px_rgba(0,0,0,1)] relative overflow-hidden">
            <div className="absolute top-0 left-1/2 -translate-x-1/2 w-1/3 h-[2px] bg-gradient-to-r from-transparent via-amber-500/50 to-transparent shadow-[0_0_15px_rgba(234,179,8,0.8)]"></div>
            
            <form onSubmit={handleSubmit} className="space-y-5">
              {isRegister && (
                <div className="relative group">
                  <User className="absolute left-5 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-600 group-focus-within:text-amber-500 transition-colors"/>
                  <input type="text" value={name} onChange={(e) => setName(e.target.value)} placeholder="Nome Sombrio" className="w-full pl-14 pr-5 py-4 bg-black/60 border border-white/5 rounded-2xl text-white text-sm font-bold outline-none focus:border-amber-600/50 focus:bg-black transition-all shadow-inner placeholder:text-gray-600" required />
                </div>
              )}
              <div className="relative group">
                <Mail className="absolute left-5 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-600 group-focus-within:text-amber-500 transition-colors"/>
                <input type="email" value={email} onChange={(e) => setEmail(e.target.value)} placeholder="E-mail Astral" className="w-full pl-14 pr-5 py-4 bg-black/60 border border-white/5 rounded-2xl text-white text-sm font-bold outline-none focus:border-amber-600/50 focus:bg-black transition-all shadow-inner placeholder:text-gray-600" required />
              </div>
              <div className="relative group">
                <Lock className="absolute left-5 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-600 group-focus-within:text-amber-500 transition-colors"/>
                <input type="password" value={password} onChange={(e) => setPassword(e.target.value)} placeholder="Senha de Selamento" className="w-full pl-14 pr-5 py-4 bg-black/60 border border-white/5 rounded-2xl text-white text-sm font-bold outline-none focus:border-amber-600/50 focus:bg-black transition-all shadow-inner placeholder:text-gray-600" required />
              </div>

              <button type="submit" disabled={loading} className="w-full mt-10 bg-gradient-to-r from-red-800 to-red-600 text-white rounded-2xl font-black py-4.5 transition-all hover:scale-[1.02] tracking-[0.3em] text-[11px] uppercase flex justify-center items-center gap-3 disabled:opacity-60 shadow-[0_10px_30px_rgba(220,38,38,0.2)] border border-red-500/50">
                 {loading ? <div className="w-5 h-5 border-2 border-white/50 border-t-white rounded-full animate-spin"></div> : isRegister ? <><Flame className="w-4 h-4"/> Forjar Aliança</> : <><Moon className="w-4 h-4"/> Adentrar as Sombras</>}
              </button>
            </form>

            <div className="mt-8 pt-8 border-t border-white/5 flex flex-col items-center gap-5 text-center">
                <button onClick={() => setIsRegister(!isRegister)} className="text-[10px] text-gray-400 hover:text-amber-500 tracking-[0.2em] uppercase font-black transition-colors">
                    {isRegister ? "Já possui um selo? Faça login." : "Ainda não é um ninja? Alistar-se."}
                </button>
                <button onClick={onGuestAccess} className="text-gray-600 hover:text-white text-[9px] uppercase font-black tracking-[0.3em] transition-colors bg-white/5 px-6 py-2.5 rounded-full border border-white/5">
                    Acesso de Espectador
                </button>
            </div>
        </div>
      </div>
    </div>
  );
}
