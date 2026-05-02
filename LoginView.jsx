import React, { useState, useEffect } from 'react';
import { signInWithEmailAndPassword, createUserWithEmailAndPassword, updateProfile, sendPasswordResetEmail } from "firebase/auth";
import { auth } from './firebase'; 
import { Mail, Lock, User, Eye, EyeOff, ChevronRight, AlertCircle, Loader2, Check } from 'lucide-react';

const NexonLogo = ({ className }) => (
  <svg className={className} viewBox="0 0 100 100" fill="none" xmlns="http://www.w3.org/2000/svg">
    <defs>
      <linearGradient id="nexonBlue" x1="0%" y1="0%" x2="100%" y2="100%">
        <stop offset="0%" stopColor="#00f2fe" />
        <stop offset="100%" stopColor="#4facfe" />
      </linearGradient>
      <linearGradient id="nexonPurple" x1="0%" y1="100%" x2="100%" y2="0%">
        <stop offset="0%" stopColor="#c084fc" />
        <stop offset="100%" stopColor="#818cf8" />
      </linearGradient>
    </defs>
    <path d="M 30 75 V 25 L 70 65" stroke="url(#nexonBlue)" strokeWidth="14" strokeLinecap="round" strokeLinejoin="round" />
    <path d="M 70 25 V 75 L 30 35" stroke="url(#nexonPurple)" strokeWidth="14" strokeLinecap="round" strokeLinejoin="round" style={{ mixBlendMode: 'screen' }} />
  </svg>
);

const SparkleStar = () => (
  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" className="text-purple-500 drop-shadow-[0_0_8px_rgba(168,85,247,0.8)]">
     <path d="M12 2 L13.5 10.5 L22 12 L13.5 13.5 L12 22 L10.5 13.5 L2 12 L10.5 10.5 Z" fill="currentColor" />
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

  // Estados do Novo Modal de Esqueci a Senha
  const [showForgotModal, setShowForgotModal] = useState(false);
  const [resetEmail, setResetEmail] = useState('');
  const [resetLoading, setResetLoading] = useState(false);

  useEffect(() => {
    const savedEmail = localStorage.getItem('nexon_email');
    const savedPass = localStorage.getItem('nexon_pass');
    if (savedEmail && savedPass) {
      setEmail(savedEmail);
      setPassword(savedPass);
      setRememberMe(true);
    }
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault(); 
    setLoading(true); setLocalError(null);
    try {
      if (isRegister) {
        if (!name.trim()) throw new Error("missing-name");
        const userCredential = await createUserWithEmailAndPassword(auth, email, password);
        await updateProfile(userCredential.user, { displayName: name });
        showToast("Registro concluído!", "success");
      } else {
        await signInWithEmailAndPassword(auth, email, password);
        if (rememberMe) {
          localStorage.setItem('nexon_email', email);
          localStorage.setItem('nexon_pass', password);
        } else {
          localStorage.removeItem('nexon_email');
          localStorage.removeItem('nexon_pass');
        }
        showToast("Acesso autorizado.", "success");
      }
      onLoginSuccess();
    } catch (error) { 
        let msg = "Erro na autenticação.";
        if (error.code === 'auth/invalid-credential') msg = "E-mail ou senha incorretos.";
        else if (error.code === 'auth/user-not-found') msg = "Usuário não encontrado.";
        showToast(msg, "error"); setLocalError(msg);
    } finally { setLoading(false); }
  };

  const handleSendResetLink = async (e) => {
    e.preventDefault();
    if (!resetEmail || !resetEmail.includes('@')) {
      showToast("Por favor, insira um e-mail válido.", "warning");
      return;
    }
    setResetLoading(true);
    try {
      await sendPasswordResetEmail(auth, resetEmail);
      showToast("Link de redefinição enviado! Verifique seu e-mail (e caixa de spam).", "success");
      setShowForgotModal(false);
      setResetEmail('');
    } catch (error) {
      if (error.code === 'auth/user-not-found') {
        showToast("Nenhuma conta encontrada com este e-mail.", "error");
      } else {
        showToast("Erro ao enviar o link de recuperação.", "error");
      }
    } finally {
      setResetLoading(false);
    }
  };

  const clipStyle = { clipPath: "polygon(24px 0, calc(100% - 24px) 0, 100% 24px, 100% calc(100% - 24px), calc(100% - 24px) 100%, 24px 100%, 0 calc(100% - 24px), 0 24px)" };

  return (
    <div className="min-h-screen font-sans flex flex-col items-center justify-center p-4 relative overflow-hidden bg-[#030108]">
      
      {/* SOLUÇÃO PARA O FUNDO BRANCO DO AUTOFILL */}
      <style>{`
        body, html { background-color: #030108 !important; }
        input:-webkit-autofill,
        input:-webkit-autofill:hover, 
        input:-webkit-autofill:focus, 
        input:-webkit-autofill:active{
            -webkit-box-shadow: 0 0 0 30px #080510 inset !important;
            -webkit-text-fill-color: #d1d5db !important;
            transition: background-color 5000s ease-in-out 0s;
        }
      `}</style>

      {/* NOVO MODAL DE ESQUECI A SENHA */}
      {showForgotModal && (
        <div className="fixed inset-0 z-[99999] bg-black/90 backdrop-blur-sm flex items-center justify-center p-4 animate-in fade-in zoom-in-95 duration-200">
          <div className="bg-[#05030A] border border-blue-900/50 rounded-2xl p-6 md:p-8 max-w-sm w-full relative overflow-hidden shadow-[0_0_50px_rgba(59,130,246,0.15)]">
            <div className="absolute top-0 left-1/2 -translate-x-1/2 w-32 h-1 bg-blue-500 rounded-b-full shadow-[0_0_20px_rgba(59,130,246,0.8)]"></div>
            
            <div className="w-12 h-12 rounded-full bg-blue-950/30 flex items-center justify-center mx-auto mb-4 border border-blue-900/50">
                <Mail className="w-5 h-5 text-blue-500" />
            </div>
            
            <h3 className="text-center text-white font-black text-lg uppercase tracking-widest mb-2">Recuperar Acesso</h3>
            <p className="text-center text-gray-400 text-[10px] font-medium mb-6 leading-relaxed">
                O sistema enviará um <b className="text-blue-400">link seguro</b> para redefinição. Por favor, insira o e-mail associado à sua conta.
            </p>
            
            <form onSubmit={handleSendResetLink} className="space-y-4">
                <div className="flex items-center bg-[#080510] border border-[#1a1a2e] rounded-xl p-2 focus-within:border-blue-500/40 transition-all">
                   <input 
                      type="email" 
                      value={resetEmail} 
                      onChange={(e) => setResetEmail(e.target.value)} 
                      placeholder="Seu e-mail cadastrado" 
                      className="flex-1 bg-transparent border-none text-gray-300 text-xs px-3 outline-none" 
                      required 
                   />
                </div>
                
                <div className="flex gap-3">
                    <button type="button" onClick={() => setShowForgotModal(false)} className="flex-1 bg-transparent border border-white/10 text-gray-400 py-3.5 rounded-xl font-bold text-[10px] uppercase tracking-widest hover:bg-white/5 hover:text-white transition-colors">
                        Cancelar
                    </button>
                    <button type="submit" disabled={resetLoading} className="flex-1 bg-blue-600 hover:bg-blue-500 text-white py-3.5 rounded-xl font-bold text-[10px] uppercase tracking-widest transition-all shadow-[0_0_15px_rgba(59,130,246,0.4)] disabled:opacity-50">
                        {resetLoading ? <Loader2 className="w-4 h-4 animate-spin mx-auto"/> : 'Enviar Link'}
                    </button>
                </div>
            </form>
          </div>
        </div>
      )}

      {/* FUNDO AMBIENTE */}
      <div className="fixed inset-0 z-0 pointer-events-none">
          <div className="absolute top-[20%] left-1/2 -translate-x-1/2 w-[800px] h-[800px] bg-[radial-gradient(ellipse_at_center,rgba(59,130,246,0.08)_0%,transparent_50%)] mix-blend-screen"></div>
          <div className="absolute bottom-[-10%] right-0 w-[500px] h-[500px] bg-purple-600/10 rounded-full blur-[120px] mix-blend-screen"></div>
          <div className="absolute inset-0 bg-[linear-gradient(rgba(255,255,255,0.03)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.03)_1px,transparent_1px)] bg-[size:40px_40px]"></div>
          <div className="absolute inset-0 bg-gradient-to-b from-[#030108]/60 via-[#030108]/20 to-[#030108]"></div>
      </div>

      <div className="w-full max-w-[380px] relative z-10 animate-in fade-in duration-700">
        <div className="relative p-[1.5px] bg-gradient-to-br from-blue-500/50 via-[#1a1a2e] to-purple-600/50 shadow-[0_0_30px_rgba(59,130,246,0.15)]" style={clipStyle}>
           <div className="bg-[#05030A] pt-12 pb-10 px-8 relative flex flex-col items-center" style={clipStyle}>
              
              <div className="absolute top-1/4 -left-1 w-1.5 h-16 border-r-[2px] border-blue-500"></div>
              <div className="absolute bottom-1/4 -right-1 w-1.5 h-16 border-l-[2px] border-purple-500"></div>
              <div className="absolute bottom-32 -left-1 w-1.5 h-8 border-r-[2px] border-blue-500/30"></div>

              <div className="flex flex-col items-center mb-6 text-center w-full">
                  <NexonLogo className="w-20 h-20 mb-4 drop-shadow-[0_0_15px_rgba(59,130,246,0.4)]" />
                  <h1 className="text-white text-[32px] font-bold tracking-[0.25em] leading-none mb-1 ml-2">N E X O</h1>
                  <h2 className="text-blue-500 text-[11px] font-black tracking-[0.7em] uppercase ml-2 mb-6">S C A N</h2>
                  
                  <div className="flex items-center justify-center mb-3"><SparkleStar /></div>
                  
                  <p className="text-gray-400 text-[11px] font-medium leading-relaxed">
                      Seu portal para o <br/><span className="text-purple-400">universo dos mangás</span>
                  </p>
              </div>

              {localError && (
                  <div className="mb-6 w-full bg-red-950/30 border border-red-500/20 text-red-200 text-[10px] font-bold p-3 rounded-xl text-center flex items-center justify-center gap-2">
                      <AlertCircle className="w-3 h-3" /> {localError}
                  </div>
              )}

              <form onSubmit={handleSubmit} className="w-full space-y-4">
                 {isRegister && (
                    <div className="space-y-1.5 w-full">
                      <label className="text-[9px] font-black text-blue-500 tracking-[0.1em] uppercase ml-1">NOME</label>
                      <div className="flex items-center bg-[#080510] border border-[#1a1a2e] rounded-xl p-2 focus-within:border-blue-500/40 transition-all">
                        <div className="w-8 h-8 rounded-lg bg-blue-950/20 flex items-center justify-center mr-2"><User className="w-4 h-4 text-blue-500" /></div>
                        <input type="text" value={name} onChange={(e) => setName(e.target.value)} placeholder="Digite seu nome" className="flex-1 bg-transparent border-none text-gray-300 text-xs outline-none" required />
                      </div>
                    </div>
                 )}

                 <div className="space-y-1.5 w-full">
                    <label className="text-[9px] font-black text-blue-500 tracking-[0.1em] uppercase ml-1">E-MAIL</label>
                    <div className="flex items-center bg-[#080510] border border-[#1a1a2e] rounded-xl p-2 focus-within:border-blue-500/40 transition-all">
                       <div className="w-8 h-8 rounded-lg bg-blue-950/20 flex items-center justify-center mr-2"><Mail className="w-4 h-4 text-blue-500" /></div>
                       <input type="email" value={email} onChange={(e) => setEmail(e.target.value)} placeholder="Digite seu e-mail" className="flex-1 bg-transparent border-none text-gray-300 text-xs outline-none" required />
                    </div>
                 </div>

                 <div className="space-y-1.5 w-full">
                    <label className="text-[9px] font-black text-purple-500 tracking-[0.1em] uppercase ml-1">SENHA</label>
                    <div className="flex items-center bg-[#080510] border border-[#1a1a2e] rounded-xl p-2 focus-within:border-purple-500/40 transition-all">
                       <div className="w-8 h-8 rounded-lg bg-purple-950/20 flex items-center justify-center mr-2"><Lock className="w-4 h-4 text-purple-500" /></div>
                       <input type={showPass ? "text" : "password"} value={password} onChange={(e) => setPassword(e.target.value)} placeholder="Digite sua senha" className="flex-1 min-w-0 bg-transparent border-none text-gray-300 text-xs outline-none" required />
                       <button type="button" onClick={() => setShowPass(!showPass)} className="pr-2 text-purple-500 font-black text-[9px] tracking-widest flex items-center gap-1.5 hover:text-white transition-colors">{showPass ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />} VER</button>
                    </div>
                 </div>

                 {/* NOVA INTERFACE "LEMBRAR DE MIM" E "ESQUECI A SENHA" */}
                 {!isRegister && (
                     <div className="flex items-center justify-between px-1 pt-1 w-full">
                        <div className="flex items-center gap-2 cursor-pointer group" onClick={() => setRememberMe(!rememberMe)}>
                          <div className={`w-4 h-4 rounded-[4px] flex items-center justify-center transition-all duration-300 border ${rememberMe ? 'bg-blue-600 border-blue-500 shadow-[0_0_8px_rgba(37,99,235,0.5)]' : 'bg-[#080510] border-gray-600 group-hover:border-gray-500'}`}>
                            <Check className={`w-3 h-3 text-white transition-opacity duration-300 ${rememberMe ? 'opacity-100' : 'opacity-0'}`} />
                          </div>
                          <span className="text-[10px] text-gray-500 font-medium group-hover:text-gray-400 transition-colors">Lembrar de mim</span>
                        </div>
                        <button type="button" onClick={() => setShowForgotModal(true)} className="text-[10px] text-blue-500 hover:text-cyan-400 font-medium transition-colors">Esqueci minha senha</button>
                     </div>
                 )}

                 <button type="submit" disabled={loading} className="w-full mt-6 bg-gradient-to-r from-[#0052D4] via-[#4364F7] to-[#6FB1FC] rounded-xl py-4 flex justify-between items-center px-6 text-white text-[11px] font-black tracking-[0.2em] shadow-[0_0_20px_rgba(59,130,246,0.4)] hover:scale-[1.02] transition-transform disabled:opacity-70 disabled:hover:scale-100 group">
                    <span className="flex-1 text-center pl-4">{loading ? <Loader2 className="w-5 h-5 animate-spin mx-auto"/> : (isRegister ? 'CRIAR CONTA' : 'ENTRAR')}</span>
                    {!loading && <ChevronRight className="w-4 h-4 text-white/80 group-hover:translate-x-1 transition-transform" />}
                 </button>
              </form>

              <div className="text-center mt-5 w-full">
                 <span className="text-[9px] text-gray-600 font-medium tracking-wide">{isRegister ? "Já possui conta?" : "Ainda não tem conta?"}</span><br/>
                 <button onClick={() => setIsRegister(!isRegister)} className="text-[10px] text-blue-500 font-black tracking-widest uppercase mt-1.5 hover:text-cyan-400 transition-colors">
                    {isRegister ? "Fazer Login" : "CRIAR CONTA"}
                 </button>
              </div>

              <div className="flex items-center gap-4 my-6 w-full justify-center">
                 <div className="h-[1px] w-8 bg-gray-800"></div>
                 <span className="text-[9px] font-black text-gray-600 uppercase tracking-widest">OU</span>
                 <div className="h-[1px] w-8 bg-gray-800"></div>
              </div>

              <button onClick={onGuestAccess} className="w-full bg-transparent border border-white/10 hover:border-purple-500/50 rounded-xl p-1.5 flex items-center justify-between group transition-all">
                 <div className="w-10 h-10 rounded-lg flex items-center justify-center bg-blue-600/10 group-hover:bg-blue-600/20"><Eye className="w-4 h-4 text-blue-500" /></div>
                 <span className="text-[10px] font-bold text-gray-300 tracking-[0.15em] group-hover:text-white transition-colors uppercase">ACESSO DE ESPECTADOR</span>
                 <ChevronRight className="w-4 h-4 text-gray-500 mr-3 group-hover:translate-x-1 group-hover:text-white transition-all" />
              </button>
           </div>
        </div>
      </div>
    </div>
  );
}
