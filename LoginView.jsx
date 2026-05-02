import React, { useState, useEffect } from 'react';
import { signInWithEmailAndPassword, createUserWithEmailAndPassword, updateProfile } from "firebase/auth";
import { auth } from './firebase'; 
import { Mail, Lock, User, Eye, EyeOff, ChevronRight, AlertCircle, Loader2, BookOpen, Zap, Heart, Check } from 'lucide-react';

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
    {/* Desenho do N moderno entrelaçado */}
    <path d="M25 20V80H40V50L65 80H80V20H65V50L40 20H25Z" fill="url(#nexoCyanGrad)" opacity="0.9" />
    <path d="M40 20L65 50V20H80V80H65L40 50V80H25V20H40Z" fill="url(#nexoPurpleGrad)" style={{ mixBlendMode: 'screen' }} />
  </svg>
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
  const [currentFeature, setCurrentFeature] = useState(0);

  const features = [
    { icon: BookOpen, title: "Mais Histórias", desc: "Milhares de mangás para explorar" },
    { icon: Zap, title: "Mais Rápido", desc: "Atualizações em tempo real" },
    { icon: Heart, title: "Feito para Você", desc: "Sua experiência, do seu jeito" }
  ];

  // Lógica para lembrar dados
  useEffect(() => {
    const savedEmail = localStorage.getItem('nexo_email');
    const savedPass = localStorage.getItem('nexo_pass');
    if (savedEmail && savedPass) {
      setEmail(savedEmail);
      setPassword(savedPass);
      setRememberMe(true);
    }

    // Timer do carrossel
    const timer = setInterval(() => {
      setCurrentFeature((prev) => (prev + 1) % features.length);
    }, 3000);
    return () => clearInterval(timer);
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault(); 
    setLoading(true); setLocalError(null);
    try {
      if (isRegister) {
        if (!name.trim()) throw new Error("missing-name");
        const userCredential = await createUserWithEmailAndPassword(auth, email, password);
        await updateProfile(userCredential.user, { displayName: name });
      } else {
        await signInWithEmailAndPassword(auth, email, password);
        // Salva se "Lembrar de mim" estiver ativo
        if (rememberMe) {
          localStorage.setItem('nexo_email', email);
          localStorage.setItem('nexo_pass', password);
        } else {
          localStorage.removeItem('nexo_email');
          localStorage.removeItem('nexo_pass');
        }
      }
      onLoginSuccess();
    } catch (error) { 
        let msg = "Erro no sistema.";
        if (error.code === 'auth/invalid-credential') msg = "E-mail ou senha incorretos.";
        showToast(msg, "error"); setLocalError(msg);
    } finally { setLoading(false); }
  };

  const clipStyle = { clipPath: "polygon(20px 0, calc(100% - 20px) 0, 100% 20px, 100% calc(100% - 25px), calc(100% - 25px) 100%, 25px 100%, 0 calc(100% - 25px), 0 25px)" };

  return (
    <div className="min-h-screen font-sans flex flex-col items-center justify-center p-4 relative overflow-hidden bg-[#030108]">
      <div className="w-full max-w-[380px] relative z-10 animate-in fade-in duration-700">
        
        <div className="relative p-[1.5px] bg-gradient-to-br from-blue-500/50 via-transparent to-purple-600/50 shadow-2xl" style={clipStyle}>
           <div className="bg-[#05030A] pt-12 pb-10 px-8 relative flex flex-col" style={clipStyle}>
              
              <div className="flex flex-col items-center mb-8">
                  <NewNexoLogo className="w-20 h-20 mb-4 drop-shadow-[0_0_15px_rgba(59,130,246,0.4)]" />
                  <h1 className="text-white text-3xl font-medium tracking-[0.3em] leading-none mb-1">N E X O</h1>
                  <h2 className="text-blue-500 text-[10px] font-black tracking-[0.6em] uppercase">Scan</h2>
                  <p className="text-gray-500 text-[11px] mt-6 text-center">Seu portal para o <br/><span className="text-purple-400">universo dos mangás</span></p>
              </div>

              <form onSubmit={handleSubmit} className="space-y-4">
                 {isRegister && (
                    <div className="space-y-1">
                      <label className="text-[9px] font-bold text-blue-500 tracking-widest uppercase ml-1">Nome</label>
                      <div className="flex items-center bg-[#080510] border border-blue-900/30 rounded-xl p-1.5 focus-within:border-blue-500/50">
                        <div className="w-9 h-9 rounded-lg bg-blue-950/30 flex items-center justify-center"><User className="w-4 h-4 text-blue-500" /></div>
                        <input type="text" value={name} onChange={(e) => setName(e.target.value)} placeholder="Nome de usuário" className="flex-1 bg-transparent border-none text-gray-300 text-xs px-3 outline-none" />
                      </div>
                    </div>
                 )}

                 <div className="space-y-1">
                    <label className="text-[9px] font-bold text-blue-500 tracking-widest uppercase ml-1">E-mail</label>
                    <div className="flex items-center bg-[#080510] border border-blue-900/30 rounded-xl p-1.5 focus-within:border-blue-500/50">
                       <div className="w-9 h-9 rounded-lg bg-blue-950/30 flex items-center justify-center"><Mail className="w-4 h-4 text-blue-500" /></div>
                       <input type="email" value={email} onChange={(e) => setEmail(e.target.value)} placeholder="Digite seu e-mail" className="flex-1 bg-transparent border-none text-gray-300 text-xs px-3 outline-none" />
                    </div>
                 </div>

                 <div className="space-y-1">
                    <label className="text-[9px] font-bold text-purple-500 tracking-widest uppercase ml-1">Senha</label>
                    <div className="flex items-center bg-[#080510] border border-purple-900/30 rounded-xl p-1.5 focus-within:border-purple-500/50">
                       <div className="w-9 h-9 rounded-lg bg-purple-950/30 flex items-center justify-center"><Lock className="w-4 h-4 text-purple-500" /></div>
                       <input type={showPass ? "text" : "password"} value={password} onChange={(e) => setPassword(e.target.value)} placeholder="Digite sua senha" className="flex-1 bg-transparent border-none text-gray-300 text-xs px-3 outline-none" />
                       <button type="button" onClick={() => setShowPass(!showPass)} className="pr-3 text-purple-500 hover:text-purple-300 transition-colors"><Eye className="w-4 h-4" /></button>
                    </div>
                 </div>

                 <div className="flex items-center justify-between px-1">
                    <label className="flex items-center gap-2 cursor-pointer group">
                      <div className="relative w-4 h-4">
                        <input type="checkbox" checked={rememberMe} onChange={() => setRememberMe(!rememberMe)} className="peer appearance-none w-4 h-4 border border-gray-600 rounded bg-transparent checked:bg-blue-600 transition-all" />
                        <Check className="absolute inset-0 w-3 h-3 m-auto text-white opacity-0 peer-checked:opacity-100" />
                      </div>
                      <span className="text-[10px] text-gray-500 font-medium">Lembrar de mim</span>
                    </label>
                    <button type="button" className="text-[10px] text-blue-500 font-medium">Esqueci minha senha</button>
                 </div>

                 <button type="submit" disabled={loading} className="w-full bg-gradient-to-r from-blue-600 to-purple-600 rounded-xl py-4 flex justify-between items-center px-6 text-white text-[11px] font-bold tracking-[0.2em] shadow-lg hover:scale-[1.02] transition-all group">
                    <span className="flex-1 text-center pl-4">{loading ? <Loader2 className="w-5 h-5 animate-spin mx-auto"/> : (isRegister ? 'CRIAR CONTA' : 'ENTRAR')}</span>
                    {!loading && <ChevronRight className="w-4 h-4 text-white/80 group-hover:translate-x-1 transition-transform" />}
                 </button>
              </form>

              <div className="text-center mt-6">
                 <button onClick={() => setIsRegister(!isRegister)} className="text-[10px] text-blue-500 font-black tracking-widest uppercase underline underline-offset-4">
                    {isRegister ? "Fazer Login" : "Criar Conta"}
                 </button>
              </div>

              <div className="flex items-center gap-4 my-6 justify-center">
                 <div className="h-[1px] w-12 bg-white/5"></div>
                 <span className="text-[9px] font-bold text-gray-600 uppercase">OU</span>
                 <div className="h-[1px] w-12 bg-white/5"></div>
              </div>

              <button onClick={onGuestAccess} className="w-full bg-transparent border border-white/10 hover:border-purple-500/50 rounded-xl p-1.5 flex items-center justify-between group transition-all">
                 <div className="w-10 h-10 rounded-lg flex items-center justify-center bg-blue-600/10"><Eye className="w-5 h-5 text-blue-500" /></div>
                 <span className="text-[10px] font-bold text-gray-300 tracking-[0.15em]">ACESSO DE ESPECTADOR</span>
                 <ChevronRight className="w-4 h-4 text-gray-500 mr-4" />
              </button>
           </div>
        </div>

        {/* CARROSSEL DE FEATURES ABAIXO DO CARD */}
        <div className="mt-12 overflow-hidden relative h-24">
            {features.map((feat, i) => (
              <div key={i} className={`absolute inset-0 transition-all duration-700 flex flex-col items-center text-center ${currentFeature === i ? 'opacity-100 translate-x-0' : 'opacity-0 translate-x-8'}`}>
                  <feat.icon className="w-6 h-6 text-blue-600 mb-2" />
                  <h4 className="text-[9px] font-black text-blue-600 uppercase tracking-widest mb-1">{feat.title}</h4>
                  <p className="text-[10px] text-gray-500 max-w-[200px]">{feat.desc}</p>
              </div>
            ))}
        </div>

        {/* DOTS DO CARROSSEL */}
        <div className="flex justify-center gap-2 mt-4">
            {features.map((_, i) => (
              <div key={i} onClick={() => setCurrentFeature(i)} className={`w-1.5 h-1.5 rounded-full transition-all cursor-pointer ${currentFeature === i ? 'bg-purple-500 w-4 shadow-[0_0_8px_rgba(168,85,247,0.8)]' : 'bg-gray-700'}`}></div>
            ))}
        </div>

      </div>
    </div>
  );
}
