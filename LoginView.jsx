import React, { useState } from 'react';
import { getAuth, signInWithEmailAndPassword, createUserWithEmailAndPassword, updateProfile } from "firebase/auth";
import { app, auth } from './firebase'; 
import { InfinityLogo } from './UIComponents';
import { Mail, Lock, User, Sparkles, Star, Compass } from 'lucide-react';

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
        if (!name.trim()) throw new Error("O nome de explorador é obrigatório.");
        const userCredential = await createUserWithEmailAndPassword(auth, email, password);
        await updateProfile(userCredential.user, { displayName: name });
        showToast("Sua jornada infinita começou!", "success");
      } else {
        await signInWithEmailAndPassword(auth, email, password);
        showToast("Bem-vindo de volta ao infinito.", "success");
      }
      onLoginSuccess();
    } catch (error) { showToast(error.message, "error"); } finally { setLoading(false); }
  };

  return (
    <div className="min-h-screen bg-[#030712] font-sans flex flex-col items-center justify-center relative overflow-hidden px-4">
      <style>{`body, html { background-color: #030712 !important; }`}</style>
      
      {/* BACKGROUND CÓSMICO / ANIME FANTASY */}
      <div className="absolute top-[-20%] left-[-10%] w-[70vw] h-[70vw] bg-blue-900/20 blur-[120px] rounded-full animate-[pulse_8s_ease-in-out_infinite_alternate]"></div>
      <div className="absolute bottom-[-20%] right-[-10%] w-[60vw] h-[60vw] bg-indigo-900/20 blur-[100px] rounded-full animate-[pulse_10s_ease-in-out_infinite_alternate-reverse]"></div>
      
      {/* Estrelas sutis ao fundo (Simulando a textura da sua referência) */}
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,rgba(255,255,255,0.03)_1px,transparent_1px)]" style={{ backgroundSize: '30px 30px' }}></div>

      <div className="w-full max-w-md relative z-10 animate-in fade-in zoom-in-95 duration-700">
        
        {/* LOGO E TÍTULO MÁGICO/CÓSMICO */}
        <div className="flex flex-col items-center justify-center mb-10 text-center">
            <div className="relative">
                <div className="absolute inset-0 bg-blue-500/20 blur-xl rounded-full animate-pulse"></div>
                <InfinityLogo className="w-20 h-10 mb-4 drop-shadow-[0_0_15px_rgba(96,165,250,0.6)] relative z-10 text-blue-400"/>
            </div>
            <h1 className="text-3xl sm:text-4xl font-black text-white tracking-widest uppercase drop-shadow-[0_2px_4px_rgba(0,0,0,0.8)] mt-2">
                MANGA <span className="text-transparent bg-clip-text bg-gradient-to-b from-blue-300 to-indigo-400">INFINITY</span>
            </h1>
            <p className="text-blue-200/50 text-[10px] mt-3 uppercase tracking-[0.4em] font-bold flex items-center gap-2">
                <Star className="w-3 h-3 text-amber-100/30" /> Fronteira Estelar <Star className="w-3 h-3 text-amber-100/30" />
            </p>
        </div>

        {/* CARD DE LOGIN (Elegante, bordas finas, tema galáxia) */}
        <div className="bg-[#0a0f1c]/80 backdrop-blur-2xl border border-blue-500/20 p-8 sm:p-10 rounded-[2rem] shadow-[0_0_50px_rgba(15,23,42,0.8)] relative overflow-hidden">
            {/* Detalhe de borda superior brilhante */}
            <div className="absolute top-0 left-1/2 -translate-x-1/2 w-1/2 h-[2px] bg-gradient-to-r from-transparent via-blue-400/50 to-transparent"></div>
            
            <form onSubmit={handleSubmit} className="space-y-5">
              {isRegister && (
                <div className="relative group">
                  <User className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-blue-300/50 group-focus-within:text-blue-400 transition-colors"/>
                  <input type="text" value={name} onChange={(e) => setName(e.target.value)} placeholder="Nome de Explorador" className="w-full pl-11 pr-4 py-3.5 bg-[#030712]/50 border border-blue-900/50 rounded-xl text-blue-50 text-sm font-medium outline-none focus:border-blue-400/60 focus:bg-[#030712]/80 transition-all shadow-inner placeholder:text-blue-200/30" required />
                </div>
              )}
              <div className="relative group">
                <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-blue-300/50 group-focus-within:text-blue-400 transition-colors"/>
                <input type="email" value={email} onChange={(e) => setEmail(e.target.value)} placeholder="E-mail Astral" className="w-full pl-11 pr-4 py-3.5 bg-[#030712]/50 border border-blue-900/50 rounded-xl text-blue-50 text-sm font-medium outline-none focus:border-blue-400/60 focus:bg-[#030712]/80 transition-all shadow-inner placeholder:text-blue-200/30" required />
              </div>
              <div className="relative group">
                <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-blue-300/50 group-focus-within:text-blue-400 transition-colors"/>
                <input type="password" value={password} onChange={(e) => setPassword(e.target.value)} placeholder="Senha de Selamento" className="w-full pl-11 pr-4 py-3.5 bg-[#030712]/50 border border-blue-900/50 rounded-xl text-blue-50 text-sm font-medium outline-none focus:border-blue-400/60 focus:bg-[#030712]/80 transition-all shadow-inner placeholder:text-blue-200/30" required />
              </div>

              <button type="submit" disabled={loading} className="w-full mt-8 bg-gradient-to-r from-blue-600 to-indigo-600 border border-blue-400/30 text-white rounded-xl font-bold py-4 transition-all hover:scale-[1.02] hover:shadow-[0_0_20px_rgba(59,130,246,0.4)] tracking-widest text-xs flex justify-center items-center gap-2 disabled:opacity-60 overflow-hidden relative">
                 <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/10 to-transparent translate-x-[-100%] hover:translate-x-[100%] transition-transform duration-1000"></div>
                 {loading ? <div className="w-5 h-5 border-2 border-white/50 border-t-white rounded-full animate-spin"></div> : isRegister ? <><Sparkles className="w-4 h-4"/> Iniciar Jornada</> : <><Compass className="w-4 h-4"/> Adentrar o Infinito</>}
              </button>
            </form>

            <div className="mt-8 pt-6 border-t border-blue-900/30 flex flex-col items-center gap-4 text-center">
                <button onClick={() => setIsRegister(!isRegister)} className="text-[11px] text-blue-300 hover:text-blue-100 tracking-wider font-medium transition-colors drop-shadow-sm">
                    {isRegister ? "Já desbravou o cosmos? Faça login." : "Primeira vez na galáxia? Registre-se."}
                </button>
                <button onClick={onGuestAccess} className="text-gray-500 hover:text-white text-[10px] uppercase font-bold tracking-[0.2em] transition-colors mt-2">
                    Acesso de Espectador
                </button>
            </div>
        </div>
      </div>
    </div>
  );
}
