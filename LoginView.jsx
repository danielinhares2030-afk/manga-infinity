import React, { useState } from 'react';
import { signInWithEmailAndPassword, createUserWithEmailAndPassword, updateProfile } from "firebase/auth";
import { auth } from './firebase'; 
import { Mail, Lock, User, Eye, EyeOff, ChevronRight, AlertCircle, Loader2 } from 'lucide-react';

const Shuriken = ({ className }) => (
    <svg className={className} viewBox="0 0 24 24" fill="currentColor">
        <path d="M12 2L14.5 9.5L22 12L14.5 14.5L12 22L9.5 14.5L2 12L9.5 9.5L12 2Z" />
    </svg>
);

const HexagonIcon = ({ children, className }) => (
    <div className={`relative flex items-center justify-center flex-shrink-0 ${className}`}>
        <svg viewBox="0 0 100 100" className="absolute inset-0 w-full h-full text-red-600/80 drop-shadow-[0_0_8px_rgba(220,38,38,0.8)]" fill="none" stroke="currentColor" strokeWidth="2.5">
            <polygon points="50,5 95,25 95,75 50,95 5,75 5,25" />
            <polygon points="50,12 85,30 85,70 50,88 15,70 15,30" strokeWidth="1" strokeOpacity="0.4" />
        </svg>
        <div className="relative z-10">{children}</div>
    </div>
);

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
    setLoading(true); setLocalError(null);
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
        showToast(msg, "error"); setLocalError(msg);
    } finally { setLoading(false); }
  };

  return (
    <div className="min-h-screen font-sans flex flex-col items-center justify-center p-4 relative overflow-hidden bg-[#030000]">
      <style>{`body, html { background-color: #030000 !important; }`}</style>
      
      <div className="fixed inset-0 z-0 pointer-events-none">
          <div className="absolute inset-0 bg-[url('https://i.ibb.co/2Z500R7/file-000000002a28720eb9e79baeca3f81d1-removebg-preview.png')] bg-cover bg-center bg-no-repeat opacity-40 mix-blend-screen"></div>
          <div className="absolute top-[-10%] left-1/2 -translate-x-1/2 w-[600px] h-[600px] bg-red-600/30 rounded-full blur-[100px] mix-blend-screen"></div>
          <div className="absolute top-[-5%] left-1/2 -translate-x-1/2 w-[350px] h-[350px] bg-gradient-to-b from-red-600 to-transparent rounded-full opacity-60 blur-[15px]"></div>
          <div className="absolute inset-0 bg-gradient-to-b from-transparent via-[#030000]/80 to-[#030000]"></div>
      </div>

      <div className="w-full max-w-[420px] relative z-10 animate-in fade-in duration-1000 mt-16 md:mt-20">
        
        <div className="relative border-[1.5px] border-red-600/60 bg-[#050000]/80 backdrop-blur-md px-6 sm:px-8 pt-16 pb-10 rounded-2xl shadow-[0_0_50px_rgba(220,38,38,0.15),inset_0_0_20px_rgba(220,38,38,0.1)]">
            
            <Shuriken className="absolute -top-2.5 -left-2.5 w-5 h-5 text-red-600 drop-shadow-[0_0_5px_rgba(220,38,38,1)] bg-[#030000] rounded-full p-0.5" />
            <Shuriken className="absolute -top-2.5 -right-2.5 w-5 h-5 text-red-600 drop-shadow-[0_0_5px_rgba(220,38,38,1)] bg-[#030000] rounded-full p-0.5" />
            <Shuriken className="absolute -bottom-2.5 -left-2.5 w-5 h-5 text-red-600 drop-shadow-[0_0_5px_rgba(220,38,38,1)] bg-[#030000] rounded-full p-0.5" />
            <Shuriken className="absolute -bottom-2.5 -right-2.5 w-5 h-5 text-red-600 drop-shadow-[0_0_5px_rgba(220,38,38,1)] bg-[#030000] rounded-full p-0.5" />

            <div className="absolute -top-10 left-1/2 -translate-x-1/2 w-20 h-20 bg-[#050000] rounded-full border-[2px] border-red-600/80 flex items-center justify-center shadow-[0_0_30px_rgba(220,38,38,0.6)]">
                <div className="absolute -left-6 top-1/2 -translate-y-1/2 text-red-600 font-bold text-[10px] tracking-widest" style={{ writingMode: 'vertical-rl' }}>忍者</div>
                <div className="absolute -right-6 top-1/2 -translate-y-1/2 text-red-600 font-bold text-[10px] tracking-widest" style={{ writingMode: 'vertical-rl' }}>影の領域</div>
                
                <div className="w-16 h-16 rounded-full border border-red-500/40 flex items-center justify-center relative">
                    <Shuriken className="w-8 h-8 text-red-500 drop-shadow-[0_0_10px_rgba(220,38,38,1)]" />
                    <div className="absolute w-full h-full border border-red-500/20 rounded-full animate-ping"></div>
                </div>
            </div>

            <div className="text-center mb-8 flex flex-col items-center">
                <div className="relative flex justify-center items-center w-full mb-2">
                    <svg className="absolute w-64 h-64 text-red-600/40 animate-pulse pointer-events-none" style={{ mixBlendMode: 'screen' }} viewBox="0 0 100 100">
                        <circle cx="50" cy="50" r="30" fill="currentColor" filter="blur(15px)" />
                        <circle cx="50" cy="50" r="20" fill="rgba(220,38,38,0.6)" filter="blur(8px)" />
                    </svg>
                    <h1 className="text-5xl font-black italic tracking-tighter flex items-center justify-center gap-1 drop-shadow-[0_0_15px_rgba(220,38,38,0.3)] relative z-10">
                        <span className="text-white">MANGA</span>
                        <span className="text-red-600 drop-shadow-[0_0_15px_rgba(220,38,38,0.8)]">KAGE</span>
                    </h1>
                </div>
                <p className="text-gray-400 text-xs tracking-[0.3em] mt-2 font-medium relative z-10">影 の 領 域</p>
                <div className="flex items-center justify-center gap-3 mt-3 text-red-600/70 text-[8px] font-black uppercase tracking-[0.4em] relative z-10">
                    <div className="w-8 h-[1px] bg-red-600/50"></div>
                    <Shuriken className="w-3 h-3" />
                    DOMÍNIO DAS SOMBRAS
                    <Shuriken className="w-3 h-3" />
                    <div className="w-8 h-[1px] bg-red-600/50"></div>
                </div>
            </div>

            {localError && (
                <div className="mb-6 bg-red-950/40 border border-red-500/30 text-red-200 text-[10px] font-black p-3 rounded-xl text-center flex items-center justify-center gap-2">
                    <AlertCircle className="w-3 h-3" /> {localError}
                </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-6 relative z-10">
              
              {isRegister && (
                  <fieldset className="border border-red-600/50 rounded-xl px-4 pb-4 pt-2 shadow-[inset_0_0_20px_rgba(220,38,38,0.05)] focus-within:border-red-500 focus-within:shadow-[0_0_15px_rgba(220,38,38,0.2),inset_0_0_20px_rgba(220,38,38,0.1)] transition-all">
                      <legend className="text-[9px] text-red-500 font-black uppercase tracking-[0.2em] px-2 flex items-center gap-1.5 ml-2">
                          <Shuriken className="w-3 h-3" /> NOME DE GUERRA
                      </legend>
                      <div className="flex items-center gap-4 mt-1">
                          <HexagonIcon className="w-11 h-11 flex-shrink-0"><User className="w-4 h-4 text-red-500 drop-shadow-[0_0_5px_rgba(220,38,38,0.8)]" /></HexagonIcon>
                          <input type="text" value={name} onChange={(e) => setName(e.target.value)} placeholder="Digite seu nome" className="flex-1 min-w-0 bg-transparent text-gray-300 text-sm font-bold outline-none placeholder:text-gray-600" required />
                          <Shuriken className="w-4 h-4 text-gray-700 flex-shrink-0" />
                      </div>
                  </fieldset>
              )}

              <fieldset className="border border-red-600/50 rounded-xl px-4 pb-4 pt-2 shadow-[inset_0_0_20px_rgba(220,38,38,0.05)] focus-within:border-red-500 focus-within:shadow-[0_0_15px_rgba(220,38,38,0.2),inset_0_0_20px_rgba(220,38,38,0.1)] transition-all">
                  <legend className="text-[9px] text-red-500 font-black uppercase tracking-[0.2em] px-2 flex items-center gap-1.5 ml-2">
                      <Shuriken className="w-3 h-3" /> IDENTIDADE NINJA
                  </legend>
                  <div className="flex items-center gap-4 mt-1">
                      <HexagonIcon className="w-11 h-11 flex-shrink-0"><Mail className="w-4 h-4 text-red-500 drop-shadow-[0_0_5px_rgba(220,38,38,0.8)]" /></HexagonIcon>
                      <input type="email" value={email} onChange={(e) => setEmail(e.target.value)} placeholder="Digite seu e-mail" className="flex-1 min-w-0 bg-transparent text-gray-300 text-sm font-bold outline-none placeholder:text-gray-600" required />
                      <Shuriken className="w-4 h-4 text-gray-700 flex-shrink-0" />
                  </div>
              </fieldset>

              <fieldset className="border border-red-600/50 rounded-xl px-4 pb-4 pt-2 shadow-[inset_0_0_20px_rgba(220,38,38,0.05)] focus-within:border-red-500 focus-within:shadow-[0_0_15px_rgba(220,38,38,0.2),inset_0_0_20px_rgba(220,38,38,0.1)] transition-all">
                  <legend className="text-[9px] text-red-500 font-black uppercase tracking-[0.2em] px-2 flex items-center gap-1.5 ml-2">
                      <Shuriken className="w-3 h-3" /> CÓDIGO SECRETO
                  </legend>
                  <div className="flex items-center gap-4 mt-1">
                      <HexagonIcon className="w-11 h-11 flex-shrink-0"><Lock className="w-4 h-4 text-red-500 drop-shadow-[0_0_5px_rgba(220,38,38,0.8)]" /></HexagonIcon>
                      <input type={showPass ? "text" : "password"} value={password} onChange={(e) => setPassword(e.target.value)} placeholder="Digite sua senha" className="flex-1 min-w-0 bg-transparent text-gray-300 text-sm font-bold outline-none placeholder:text-gray-600" required />
                      
                      <button type="button" onClick={() => setShowPass(!showPass)} className="flex items-center gap-1 text-red-700 hover:text-red-500 transition-colors flex-shrink-0">
                          {showPass ? <EyeOff className="w-4 h-4"/> : <Eye className="w-4 h-4"/>}
                          <span className="text-[8px] font-black uppercase tracking-widest mt-0.5" style={{ writingMode: 'vertical-rl' }}>見る</span>
                      </button>
                  </div>
              </fieldset>

              <div className="pt-2">
                  <div className="flex items-center justify-center gap-2 mb-4">
                      <Shuriken className="w-3 h-3 text-red-600/40" />
                      <div className="w-6 h-[1px] bg-red-600/30"></div>
                      <Shuriken className="w-3 h-3 text-red-600/40" />
                  </div>

                  <button type="submit" disabled={loading} className="w-full bg-red-950/20 border border-red-600 text-white rounded-xl font-black py-4 transition-all hover:bg-red-900/40 tracking-[0.4em] text-xs uppercase flex justify-center items-center gap-4 shadow-[0_0_20px_rgba(220,38,38,0.2),inset_0_0_15px_rgba(220,38,38,0.1)] group">
                     {loading ? <Loader2 className="w-5 h-5 animate-spin text-red-500"/> : (
                         <>
                            <Shuriken className="w-4 h-4 text-red-600 group-hover:rotate-90 transition-transform duration-500" />
                            {isRegister ? 'CONCLUIR PACTO' : 'ENTRAR'}
                            <Shuriken className="w-4 h-4 text-red-600 group-hover:rotate-90 transition-transform duration-500" />
                         </>
                     )}
                  </button>
              </div>
            </form>

            <div className="mt-8 flex flex-col items-center gap-6 text-center pb-2 relative z-10">
                <button onClick={() => { setIsRegister(!isRegister); setLocalError(null); }} className="text-[9px] text-gray-400 tracking-[0.15em] font-medium uppercase transition-colors">
                    {isRegister ? "JÁ TEM UM SELO? " : "AINDA NÃO É UM NINJA? " }
                    <span className="text-red-500 hover:text-red-400 underline underline-offset-4 font-black">{isRegister ? "FAZER LOGIN" : "ALISTAR-SE"}</span>
                </button>
                
                <button onClick={onGuestAccess} className="w-full border border-white/10 hover:border-red-600/50 bg-[#0a0505] px-6 py-4 rounded-xl flex items-center justify-between text-gray-400 hover:text-white transition-all group shadow-md">
                    <div className="flex items-center gap-4">
                        <div className="border border-red-600/30 p-1.5 rounded-lg group-hover:border-red-500 transition-colors">
                            <User className="w-4 h-4 text-red-600 group-hover:text-red-500" />
                        </div>
                        <span className="text-[9px] tracking-[0.2em] font-black uppercase">Acesso de Espectador</span>
                    </div>
                    <ChevronRight className="w-4 h-4 text-red-600 group-hover:translate-x-1 transition-transform" />
                </button>
            </div>

            <div className="absolute -bottom-7 left-1/2 -translate-x-1/2 w-14 h-14 bg-[#050000] rounded-full border-[1.5px] border-red-600/80 flex items-center justify-center shadow-[0_0_20px_rgba(220,38,38,0.6)]">
                <div className="absolute -left-5 top-1/2 -translate-y-1/2">
                    <Shuriken className="w-3 h-3 text-red-600/60" />
                </div>
                <div className="absolute -right-5 top-1/2 -translate-y-1/2">
                    <Shuriken className="w-3 h-3 text-red-600/60" />
                </div>
                <span className="text-red-600 text-xl font-black drop-shadow-[0_0_8px_rgba(220,38,38,1)]">忍</span>
            </div>
        </div>
      </div>
    </div>
  );
}
