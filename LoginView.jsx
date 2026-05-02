import React, { useState } from 'react';
import { signInWithEmailAndPassword, createUserWithEmailAndPassword, updateProfile } from "firebase/auth";
import { auth } from './firebase'; 
import { Mail, Lock, User, Eye, EyeOff, ChevronRight, AlertCircle, Loader2, BookOpen, Zap, Heart } from 'lucide-react';

const NewNexoLogo = ({ className }) => (
  <svg className={className} viewBox="0 0 100 100" fill="none" xmlns="http://www.w3.org/2000/svg">
    <defs>
      <linearGradient id="nexoCyanGrad" x1="0%" y1="0%" x2="100%" y2="100%">
        <stop offset="0%" stopColor="#00f2fe" />
        <stop offset="100%" stopColor="#4facfe" />
      </linearGradient>
      <linearGradient id="nexoPurpleGrad" x1="0%" y1="100%" x2="100%" y2="0%">
        <stop offset="0%" stopColor="#c084fc" />
        <stop offset="100%" stopColor="#818cf8" />
      </linearGradient>
    </defs>
    {/* Fita Ciano (Esquerda para Baixo) */}
    <path d="M30,20 L45,20 L75,70 L60,85 Z" fill="url(#nexoCyanGrad)" />
    <path d="M30,20 L30,55 L45,45 L45,20 Z" fill="url(#nexoCyanGrad)" />
    
    {/* Fita Roxa (Direita para Cima) */}
    <path d="M70,80 L55,80 L25,30 L40,15 Z" fill="url(#nexoPurpleGrad)" />
    <path d="M70,80 L70,45 L55,55 L55,80 Z" fill="url(#nexoPurpleGrad)" />
  </svg>
);

const SparkleStar = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" className="text-purple-500 drop-shadow-[0_0_8px_rgba(168,85,247,0.8)]">
     <path d="M12 2 L13.5 10.5 L22 12 L13.5 13.5 L12 22 L10.5 13.5 L2 12 L10.5 10.5 Z" fill="currentColor" />
  </svg>
);

const FeatureItem = ({ icon: Icon, title, description }) => (
  <div className="flex flex-col items-center text-center px-2">
      <Icon className="w-6 h-6 text-blue-600 mb-2 drop-shadow-[0_0_8px_rgba(37,99,235,0.6)]" strokeWidth={1.5} />
      <h4 className="text-[8px] sm:text-[9px] font-black text-blue-600 uppercase tracking-widest mb-1">{title}</h4>
      <p className="text-[8px] text-gray-500 font-medium leading-snug">{description}</p>
  </div>
);

export function LoginView({ onLoginSuccess, onGuestAccess, showToast }) {
  const [isRegister, setIsRegister] = useState(false);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');
  const [rememberMe, setRememberMe] = useState(false);
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

  // Forma chanfrada do contêiner central
  const clipStyle = {
      clipPath: "polygon(20px 0, calc(100% - 20px) 0, 100% 20px, 100% calc(100% - 20px), calc(100% - 20px) 100%, 20px 100%, 0 calc(100% - 20px), 0 20px)"
  };

  return (
    <div className="min-h-screen font-sans flex flex-col items-center justify-center p-4 relative overflow-x-hidden bg-[#030108]">
      <style>{`body, html { background-color: #030108 !important; }`}</style>
      
      {/* FUNDO AMBIENTE */}
      <div className="fixed inset-0 z-0 pointer-events-none flex items-center justify-between opacity-30">
          <img src="https://i.ibb.co/VcF093w9/file-000000000a60720ea0dc89a96aeb27e0-removebg-preview.png" className="h-full object-cover object-left opacity-40 mix-blend-screen blur-[1px] -ml-20" alt="bg-left" />
          <img src="https://i.ibb.co/cK3rLmhY/file-00000000a89471f5b61f4284cf8c9779-removebg-preview.png" className="h-full object-cover object-right opacity-40 mix-blend-screen blur-[1px] -mr-20" alt="bg-right" />
      </div>
      <div className="fixed inset-0 z-0 pointer-events-none">
          <div className="absolute top-[20%] left-1/2 -translate-x-1/2 w-[800px] h-[800px] bg-[radial-gradient(ellipse_at_center,rgba(59,130,246,0.08)_0%,transparent_50%)] mix-blend-screen"></div>
          <div className="absolute inset-0 bg-[linear-gradient(rgba(255,255,255,0.02)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.02)_1px,transparent_1px)] bg-[size:40px_40px]"></div>
          <div className="absolute inset-0 bg-gradient-to-b from-[#030108]/60 via-[#030108]/20 to-[#030108]"></div>
      </div>

      <div className="w-full max-w-[380px] relative z-10 animate-in fade-in zoom-in-95 duration-700 mt-2 mb-8">
        
        {/* CONTAINER TECH BORDER */}
        <div className="relative p-[1.5px] bg-gradient-to-br from-blue-500/80 via-transparent to-purple-600/80 shadow-[0_0_30px_rgba(59,130,246,0.15)]" style={clipStyle}>
           
           {/* FUNDO INTERNO */}
           <div className="bg-[#05030A] pt-12 pb-10 px-6 sm:px-8 relative flex flex-col" style={clipStyle}>
              
              {/* DETALHES TECH (Linhas laterais na borda interna) */}
              <div className="absolute top-1/4 -left-1 w-1.5 h-16 border-r border-blue-500/50"></div>
              <div className="absolute bottom-1/4 -right-1 w-1.5 h-16 border-l border-purple-500/50"></div>

              {/* LOGO E TÍTULO */}
              <div className="flex flex-col items-center mb-6 text-center">
                  <NewNexoLogo className="w-16 h-16 mb-4 drop-shadow-[0_0_20px_rgba(59,130,246,0.4)]" />
                  <h1 className="text-white text-[32px] font-medium tracking-[0.3em] mb-1 font-sans ml-2 leading-none">N E X O</h1>
                  <h2 className="text-blue-500 text-[11px] font-black tracking-[0.8em] mb-6 ml-2">S C A N</h2>
                  
                  <div className="flex items-center justify-center mb-3">
                      <SparkleStar />
                  </div>
                  
                  <p className="text-gray-400 text-[11px] font-medium leading-relaxed">
                      Seu portal para o <br/><span className="text-purple-400">universo dos mangás</span>
                  </p>
              </div>

              {localError && (
                  <div className="mb-6 w-full bg-red-950/40 border border-red-500/30 text-red-200 text-[10px] font-black p-3 rounded-xl text-center flex items-center justify-center gap-2">
                      <AlertCircle className="w-3 h-3" /> {localError}
                  </div>
              )}

              {/* FORMULÁRIO */}
              <form onSubmit={handleSubmit} className="w-full flex flex-col gap-4 mt-2">
                 
                 {isRegister && (
                     <div>
                        <label className="text-[9px] font-bold text-blue-500 tracking-widest mb-2 block uppercase">Nome</label>
                        <div className="flex items-center bg-[#080510] border border-blue-900/30 rounded-xl p-1.5 focus-within:border-blue-500/50 transition-colors">
                           <div className="w-9 h-9 rounded-lg bg-blue-950/30 flex items-center justify-center flex-shrink-0">
                              <User className="w-4 h-4 text-blue-500" />
                           </div>
                           <input type="text" value={name} onChange={(e) => setName(e.target.value)} placeholder="Digite seu nome" className="flex-1 bg-transparent border-none text-gray-300 text-xs px-3 outline-none placeholder-gray-600" required />
                        </div>
                     </div>
                 )}

                 {/* CAMPO: E-MAIL */}
                 <div>
                    <label className="text-[9px] font-bold text-blue-500 tracking-widest mb-2 block uppercase">E-mail</label>
                    <div className="flex items-center bg-[#080510] border border-blue-900/30 rounded-xl p-1.5 focus-within:border-blue-500/50 transition-colors">
                       <div className="w-9 h-9 rounded-lg bg-blue-950/30 flex items-center justify-center flex-shrink-0">
                          <Mail className="w-4 h-4 text-blue-500" />
                       </div>
                       <input type="email" value={email} onChange={(e) => setEmail(e.target.value)} placeholder="Digite seu e-mail" className="flex-1 bg-transparent border-none text-gray-300 text-xs px-3 outline-none placeholder-gray-600" required />
                    </div>
                 </div>

                 {/* CAMPO: SENHA */}
                 <div>
                    <label className="text-[9px] font-bold text-purple-500 tracking-widest mb-2 block uppercase">Senha</label>
                    <div className="flex items-center bg-[#080510] border border-purple-900/30 rounded-xl p-1.5 focus-within:border-purple-500/50 transition-colors">
                       <div className="w-9 h-9 rounded-lg bg-purple-950/30 flex items-center justify-center flex-shrink-0">
                          <Lock className="w-4 h-4 text-purple-500" />
                       </div>
                       <input type={showPass ? "text" : "password"} value={password} onChange={(e) => setPassword(e.target.value)} placeholder="Digite sua senha" className="flex-1 min-w-0 bg-transparent border-none text-gray-300 text-xs px-3 outline-none placeholder-gray-600" required />
                       <button type="button" onClick={() => setShowPass(!showPass)} className="flex items-center gap-1.5 mr-3 text-purple-500 hover:text-purple-400 transition-colors flex-shrink-0">
                          {showPass ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />} <span className="text-[9px] font-black tracking-widest uppercase">Ver</span>
                       </button>
                    </div>
                 </div>

                 {/* OPÇÕES EXTRAS */}
                 {!isRegister && (
                     <div className="flex items-center justify-between mt-1 px-1">
                         <label className="flex items-center gap-2 cursor-pointer group">
                             <div className="relative flex items-center justify-center">
                                 <input type="checkbox" checked={rememberMe} onChange={() => setRememberMe(!rememberMe)} className="peer appearance-none w-3.5 h-3.5 border border-gray-600 rounded bg-transparent checked:bg-blue-600 checked:border-blue-500 transition-all cursor-pointer" />
                                 <Check className="absolute w-2.5 h-2.5 text-white opacity-0 peer-checked:opacity-100 pointer-events-none" />
                             </div>
                             <span className="text-[10px] text-gray-500 group-hover:text-gray-400 transition-colors font-medium">Lembrar de mim</span>
                         </label>
                         <button type="button" onClick={() => showToast("Recuperação enviada ao sistema.", "info")} className="text-[10px] text-blue-500 hover:text-blue-400 font-medium transition-colors">
                             Esqueci minha senha
                         </button>
                     </div>
                 )}

                 {/* BOTÃO ENTRAR */}
                 <button type="submit" disabled={loading} className="w-full mt-4 bg-gradient-to-r from-blue-600 to-purple-600 rounded-xl py-4 flex justify-between items-center px-6 text-white text-[11px] font-bold tracking-[0.2em] shadow-[0_0_20px_rgba(59,130,246,0.4)] hover:scale-[1.02] transition-transform disabled:opacity-70 disabled:hover:scale-100 group">
                    <span className="flex-1 text-center pl-4">{loading ? <Loader2 className="w-5 h-5 animate-spin mx-auto"/> : (isRegister ? 'CRIAR CONTA' : 'ENTRAR')}</span>
                    {!loading && <ChevronRight className="w-4 h-4 text-white/80 group-hover:translate-x-1 transition-transform" />}
                 </button>
              </form>

              {/* LINK REGISTRO/LOGIN */}
              <div className="text-center mt-5">
                 <span className="text-[9px] text-gray-500 font-medium tracking-wide">
                     {isRegister ? "Ainda não tem conta?" : "Ainda não tem conta?"} 
                 </span>
                 <br />
                 <button type="button" onClick={() => { setIsRegister(!isRegister); setLocalError(null); }} className="text-[10px] text-blue-500 font-black tracking-widest hover:text-blue-400 transition-colors uppercase mt-1">
                     {isRegister ? "Fazer Login" : "Criar Conta"}
                 </button>
              </div>

              {/* DIVISOR */}
              <div className="flex items-center gap-4 my-5 w-full justify-center">
                 <div className="h-[1px] w-12 bg-white/5"></div>
                 <span className="text-[9px] font-bold text-gray-600 tracking-widest uppercase">OU</span>
                 <div className="h-[1px] w-12 bg-white/5"></div>
              </div>

              {/* BOTÃO ESPECTADOR */}
              <button onClick={onGuestAccess} className="w-full bg-transparent border border-white/10 hover:border-purple-500/50 rounded-xl p-1.5 flex items-center justify-between group transition-colors">
                 <div className="w-10 h-10 rounded-lg flex items-center justify-center bg-blue-600/10 group-hover:bg-blue-600/20 transition-colors">
                    <Eye className="w-5 h-5 text-blue-500" />
                 </div>
                 <span className="text-[10px] font-bold text-gray-300 tracking-[0.15em] group-hover:text-white transition-colors uppercase">Acesso de Espectador</span>
                 <ChevronRight className="w-4 h-4 text-gray-500 mr-4 group-hover:translate-x-1 group-hover:text-white transition-all" />
              </button>

           </div>
        </div>

        {/* FEATURES BOTTOM (Fora do container principal) */}
        <div className="grid grid-cols-3 gap-2 mt-8 mb-4 max-w-[320px] mx-auto">
            <FeatureItem icon={BookOpen} title="Mais Histórias" description="Milhares de mangás para explorar" />
            <FeatureItem icon={Zap} title="Mais Rápido" description="Atualizações em tempo real" />
            <FeatureItem icon={Heart} title="Feito para Você" description="Sua experiência, do seu jeito" />
        </div>

        {/* DOTS PAGINATION */}
        <div className="flex justify-center gap-1.5 mt-8">
            <div className="w-1.5 h-1.5 rounded-full bg-gray-700"></div>
            <div className="w-1.5 h-1.5 rounded-full bg-purple-500 shadow-[0_0_8px_rgba(168,85,247,0.8)]"></div>
            <div className="w-1.5 h-1.5 rounded-full bg-gray-700"></div>
            <div className="w-1.5 h-1.5 rounded-full bg-gray-700"></div>
            <div className="w-1.5 h-1.5 rounded-full bg-gray-700"></div>
            <div className="w-1.5 h-1.5 rounded-full bg-gray-700"></div>
        </div>

      </div>
    </div>
  );
}
