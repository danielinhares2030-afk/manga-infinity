import React, { useState } from 'react';
import { signInWithEmailAndPassword, createUserWithEmailAndPassword, updateProfile } from "firebase/auth";
import { auth } from './firebase'; 
import { Mail, Lock, User, Eye, EyeOff, ChevronRight, AlertCircle, Loader2, BookOpen, Check } from 'lucide-react';

const NexoLogo = ({ className }) => (
  <svg className={className} viewBox="0 0 100 100" fill="none" xmlns="http://www.w3.org/2000/svg">
    <defs>
      <linearGradient id="nexoCyan" x1="0%" y1="0%" x2="100%" y2="100%">
        <stop offset="0%" stopColor="#0ea5e9" />
        <stop offset="100%" stopColor="#3b82f6" />
      </linearGradient>
      <linearGradient id="nexoPurple" x1="0%" y1="100%" x2="100%" y2="0%">
        <stop offset="0%" stopColor="#8b5cf6" />
        <stop offset="100%" stopColor="#d946ef" />
      </linearGradient>
    </defs>
    <path d="M15,15 L35,15 L85,85 L65,85 Z" fill="url(#nexoCyan)" />
    <path d="M15,85 L35,85 L85,15 L65,15 Z" fill="url(#nexoPurple)" />
  </svg>
);

const ScanIcon = ({ className }) => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}>
    <path d="M3 7V5a2 2 0 0 1 2-2h2" />
    <path d="M17 3h2a2 2 0 0 1 2 2v2" />
    <path d="M21 17v2a2 2 0 0 1-2 2h-2" />
    <path d="M7 21H5a2 2 0 0 1-2-2v-2" />
  </svg>
);

const SparkleIcon = () => (
  <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#1e3a8a" strokeWidth="1">
     <path d="M12 4 L13.5 10.5 L20 12 L13.5 13.5 L12 20 L10.5 13.5 L4 12 L10.5 10.5 Z" fill="#0f172a" />
  </svg>
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
        showToast("Conectado ao Nexo com sucesso!", "success");
      } else {
        await signInWithEmailAndPassword(auth, email, password);
        showToast("Bem-vindo de volta ao Nexo Scan.", "success");
      }
      onLoginSuccess();
    } catch (error) { 
        let msg = "Erro na matriz do sistema.";
        if (error.code === 'auth/invalid-credential') msg = "E-mail não encontrado ou senha incorreta.";
        else if (error.code === 'auth/email-already-in-use') msg = "Esta identidade já está em uso.";
        else if (error.code === 'auth/weak-password') msg = "A chave de acesso deve ter 6 ou mais dígitos.";
        else if (error.message === 'missing-name') msg = "Sua identificação é obrigatória.";
        showToast(msg, "error"); setLocalError(msg);
    } finally { setLoading(false); }
  };

  const hasEmail = email.includes('@');

  // Forma chanfrada idêntica à imagem
  const shapeStyle = {
      clipPath: "polygon(25px 0, calc(100% - 25px) 0, 100% 25px, 100% calc(100% - 25px), calc(100% - 25px) 100%, 25px 100%, 0 calc(100% - 25px), 0 25px)"
  };

  return (
    <div className="min-h-screen font-sans flex flex-col items-center justify-center p-4 relative overflow-hidden bg-[#030308]">
      <style>{`body, html { background-color: #030308 !important; }`}</style>
      
      {/* FUNDO AMBIENTE */}
      <div className="fixed inset-0 z-0 pointer-events-none">
          {/* Luzes difusas */}
          <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[800px] h-[800px] bg-[radial-gradient(ellipse_at_center,rgba(14,165,233,0.08)_0%,transparent_50%)] mix-blend-screen"></div>
          <div className="absolute bottom-[-10%] right-0 w-[500px] h-[500px] bg-purple-600/10 rounded-full blur-[120px] mix-blend-screen"></div>
          {/* Grade / Tech pattern */}
          <div className="absolute inset-0 bg-[linear-gradient(rgba(255,255,255,0.01)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.01)_1px,transparent_1px)] bg-[size:30px_30px]"></div>
          {/* Vinheta escura */}
          <div className="absolute inset-0 bg-gradient-to-b from-[#030308]/60 via-[#030308]/40 to-[#030308]"></div>
      </div>

      <div className="w-full max-w-[340px] md:max-w-[360px] relative z-10 animate-in fade-in duration-700 mt-2 mb-16">
        
        {/* CONTAINER COM BORDA GRADIENTE E FORMA CHANFRADA */}
        <div style={shapeStyle} className="p-[1.5px] bg-gradient-to-br from-cyan-400 via-[#1a1a2e] to-purple-600 shadow-[0_0_30px_rgba(6,182,212,0.15)] relative">
           
           {/* FUNDO INTERNO */}
           <div style={shapeStyle} className="bg-[#05050A] flex flex-col items-center pt-10 pb-16 px-5 sm:px-7 relative">
              
              {/* LOGO E TÍTULO */}
              <NexoLogo className="w-[72px] h-[72px] mb-2 drop-shadow-[0_0_15px_rgba(59,130,246,0.3)]" />
              <h1 className="text-white text-[28px] font-medium tracking-[0.25em] mb-1 font-sans ml-2">N E X O</h1>
              <h2 className="text-cyan-400 text-[10px] font-black tracking-[0.5em] mb-6 ml-2">S C A N</h2>
              
              <div className="flex items-center justify-center gap-3 mb-4 w-full">
                 <BookOpen className="w-[18px] h-[18px] text-gray-500 flex-shrink-0" />
                 <p className="text-gray-400 text-[11px] font-medium leading-tight max-w-[140px]">Seu portal para o universo dos mangás.</p>
              </div>

              {/* ÍCONE DE ESTRELA CENTRAL */}
              <div className="mb-6"><SparkleIcon /></div>

              {localError && (
                  <div className="mb-6 w-full bg-red-950/40 border border-red-500/30 text-red-200 text-[10px] font-black p-3 rounded-xl text-center flex items-center justify-center gap-2">
                      <AlertCircle className="w-3 h-3" /> {localError}
                  </div>
              )}

              {/* FORMULÁRIO */}
              <form onSubmit={handleSubmit} className="w-full space-y-4">
                 
                 {isRegister && (
                     <div>
                        <label className="text-[9px] font-black text-cyan-500 tracking-[0.15em] mb-1.5 ml-1 block">NOME</label>
                        <div className="flex items-center bg-[#0a0a12] border border-[#1a1a2e] rounded-[14px] p-1.5 focus-within:border-cyan-500/50 transition-colors">
                           <div className="w-8 h-8 rounded-full border border-cyan-900/50 bg-[#05050a] flex items-center justify-center flex-shrink-0">
                              <User className="w-4 h-4 text-cyan-500" />
                           </div>
                           <input type="text" value={name} onChange={(e) => setName(e.target.value)} placeholder="Como devemos te chamar?" className="flex-1 bg-transparent border-none text-gray-300 text-xs px-3 outline-none placeholder-gray-600" required />
                           <div className={`w-[18px] h-[18px] rounded-full border flex items-center justify-center mr-2 ${name.length > 2 ? 'border-cyan-500' : 'border-gray-700'}`}>
                               <Check className={`w-3 h-3 ${name.length > 2 ? 'text-cyan-500' : 'text-gray-700'}`} />
                           </div>
                        </div>
                     </div>
                 )}

                 {/* CAMPO: E-MAIL */}
                 <div>
                    <label className="text-[9px] font-black text-cyan-500 tracking-[0.15em] mb-1.5 ml-1 block">E-MAIL</label>
                    <div className="flex items-center bg-[#0a0a12] border border-[#1a1a2e] rounded-[14px] p-1.5 focus-within:border-cyan-500/50 transition-colors">
                       <div className="w-8 h-8 rounded-full border border-cyan-900/50 bg-[#05050a] flex items-center justify-center flex-shrink-0">
                          <Mail className="w-4 h-4 text-cyan-500" />
                       </div>
                       <input type="email" value={email} onChange={(e) => setEmail(e.target.value)} placeholder="Digite seu e-mail" className="flex-1 bg-transparent border-none text-gray-300 text-xs px-3 outline-none placeholder-gray-600" required />
                       <div className={`w-[18px] h-[18px] rounded-full border flex items-center justify-center mr-2 ${hasEmail ? 'border-cyan-500' : 'border-gray-700'}`}>
                           <Check className={`w-3 h-3 ${hasEmail ? 'text-cyan-500' : 'text-gray-700'}`} />
                       </div>
                    </div>
                 </div>

                 {/* CAMPO: SENHA */}
                 <div>
                    <label className="text-[9px] font-black text-purple-400 tracking-[0.15em] mb-1.5 ml-1 block">SENHA</label>
                    <div className="flex items-center bg-[#0a0a12] border border-[#1a1a2e] rounded-[14px] p-1.5 focus-within:border-purple-500/50 transition-colors">
                       <div className="w-8 h-8 rounded-full border border-purple-900/50 bg-[#05050a] flex items-center justify-center flex-shrink-0">
                          <Lock className="w-4 h-4 text-purple-500" />
                       </div>
                       <input type={showPass ? "text" : "password"} value={password} onChange={(e) => setPassword(e.target.value)} placeholder="Digite sua senha" className="flex-1 min-w-0 bg-transparent border-none text-gray-300 text-xs px-3 outline-none placeholder-gray-600" required />
                       <button type="button" onClick={() => setShowPass(!showPass)} className="flex items-center gap-1.5 mr-3 text-purple-500 hover:text-purple-400 transition-colors flex-shrink-0">
                          {showPass ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />} <span className="text-[9px] font-black tracking-widest uppercase">VER</span>
                       </button>
                    </div>
                 </div>

                 {/* BOTÃO ENTRAR */}
                 <button type="submit" disabled={loading} className="w-full mt-6 bg-gradient-to-r from-cyan-500 via-blue-600 to-purple-600 rounded-[14px] py-4 flex justify-center items-center gap-3 text-white text-[11px] font-bold tracking-[0.2em] shadow-[0_0_20px_rgba(37,99,235,0.3)] hover:scale-[1.02] transition-transform disabled:opacity-70 disabled:hover:scale-100">
                    {loading ? <Loader2 className="w-5 h-5 animate-spin"/> : <><ScanIcon className="w-5 h-5 text-white/90" /> {isRegister ? 'CRIAR CONTA' : 'ENTRAR'}</>}
                 </button>
              </form>

              {/* LINK REGISTRO/LOGIN */}
              <div className="mt-5 text-[9px] text-gray-500 font-medium tracking-wide">
                 {isRegister ? "Já possui conta?" : "Ainda não tem conta?"} <button type="button" onClick={() => { setIsRegister(!isRegister); setLocalError(null); }} className="text-cyan-500 font-black tracking-widest ml-1 uppercase hover:text-cyan-400 transition-colors">{isRegister ? "FAZER LOGIN" : "CRIAR CONTA"}</button>
              </div>

              {/* DIVISOR */}
              <div className="flex items-center gap-4 my-5 w-full justify-center">
                 <div className="h-[1px] w-12 bg-gray-800/80"></div>
                 <span className="text-[9px] font-bold text-gray-600 tracking-widest">OU</span>
                 <div className="h-[1px] w-12 bg-gray-800/80"></div>
              </div>

              {/* BOTÃO ESPECTADOR */}
              <button onClick={onGuestAccess} className="w-full bg-[#0a0a12] border border-[#1a1a2e] hover:border-[#2a2a4e] rounded-[14px] p-1.5 flex items-center justify-between group transition-colors">
                 <div className="w-8 h-8 rounded-full border border-[#1a1a2e] flex items-center justify-center bg-[#05050a] ml-1 group-hover:border-blue-900/50 transition-colors">
                    <Eye className="w-4 h-4 text-[#3b82f6]" />
                 </div>
                 <span className="text-[10px] font-black text-gray-400 tracking-[0.15em] group-hover:text-gray-200 transition-colors">ACESSO DE ESPECTADOR</span>
                 <ChevronRight className="w-4 h-4 text-[#3b82f6] mr-3 group-hover:translate-x-1 transition-transform" />
              </button>

           </div>
           
           {/* DETALHE: LIVRO FLUTUANTE NA BORDA INFERIOR */}
           <div className="absolute -bottom-6 left-1/2 -translate-x-1/2 w-[52px] h-[52px] rounded-full border border-cyan-500/50 bg-[#05050A] flex items-center justify-center z-20 shadow-[0_0_15px_rgba(6,182,212,0.2)]">
               <BookOpen className="w-[22px] h-[22px] text-cyan-400" />
               {/* Linhas decorativas (Asas) */}
               <div className="absolute top-1/2 -left-[22px] w-[18px] h-[1px] bg-cyan-500/50 flex items-center"><div className="w-1 h-1.5 bg-cyan-500 rounded-full ml-auto"></div></div>
               <div className="absolute top-1/2 -right-[22px] w-[18px] h-[1px] bg-cyan-500/50 flex items-center"><div className="w-1 h-1.5 bg-cyan-500 rounded-full mr-auto"></div></div>
           </div>
        </div>

        {/* TEXTO DE RODAPÉ ("LEIA. DESCUBRA. CONTINUE.") */}
        <div className="absolute -bottom-[70px] w-full text-center">
           <p className="text-[8px] font-black tracking-[0.3em] text-blue-900/60 flex justify-center gap-2 items-center">
              <span>. . .</span> <span className="text-blue-700">LEIA.</span> <span className="text-[#a855f7] drop-shadow-[0_0_5px_rgba(168,85,247,0.5)]">DESCUBRA.</span> <span className="text-blue-700">CONTINUE.</span> <span>. . .</span>
           </p>
        </div>
      </div>
    </div>
  );
}
