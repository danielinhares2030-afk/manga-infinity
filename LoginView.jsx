import React, { useState, useEffect } from 'react';
import { signInWithEmailAndPassword, createUserWithEmailAndPassword, updateProfile, sendPasswordResetEmail } from "firebase/auth";
import { auth } from './firebase'; 
import { Mail, Lock, User, Eye, EyeOff, AlertCircle, Loader2, Check, ArrowRight } from 'lucide-react';

export function LoginView({ onLoginSuccess, onGuestAccess, showToast }) {
  const [isRegister, setIsRegister] = useState(false);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');
  const [rememberMe, setRememberMe] = useState(false);
  const [loading, setLoading] = useState(false);
  const [localError, setLocalError] = useState(null);
  const [showPass, setShowPass] = useState(false);

  // Estados do Modal de Esqueci a Senha
  const [showForgotModal, setShowForgotModal] = useState(false);
  const [resetEmail, setResetEmail] = useState('');
  const [resetLoading, setResetLoading] = useState(false);

  useEffect(() => {
    const savedEmail = localStorage.getItem('nexo_email');
    const savedPass = localStorage.getItem('nexo_pass');
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
          localStorage.setItem('nexo_email', email);
          localStorage.setItem('nexo_pass', password);
        } else {
          localStorage.removeItem('nexo_email');
          localStorage.removeItem('nexo_pass');
        }
        showToast("Bem-vindo de volta!", "success");
      }
      onLoginSuccess();
    } catch (error) { 
        let msg = "Erro de autenticação.";
        if (error.code === 'auth/invalid-credential') msg = "E-mail ou senha incorretos.";
        else if (error.code === 'auth/user-not-found') msg = "Usuário não encontrado.";
        else if (error.code === 'auth/email-already-in-use') msg = "E-mail já cadastrado.";
        else if (error.code === 'auth/weak-password') msg = "A senha é muito fraca.";
        else if (error.message === 'missing-name') msg = "O nome é obrigatório.";
        showToast(msg, "error"); setLocalError(msg);
    } finally { setLoading(false); }
  };

  const handleSendResetLink = async (e) => {
    e.preventDefault();
    if (!resetEmail || !resetEmail.includes('@')) {
      showToast("Insira um e-mail válido.", "warning");
      return;
    }
    setResetLoading(true);
    try {
      await sendPasswordResetEmail(auth, resetEmail);
      showToast("Link de recuperação enviado!", "success");
      setShowForgotModal(false);
      setResetEmail('');
    } catch (error) {
      showToast("Erro ao tentar recuperar a senha.", "error");
    } finally {
      setResetLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex flex-col items-center justify-center p-4 relative overflow-hidden bg-black font-sans">
      
      {/* IMPORT DA FONTE BRUSH PARA O "X" DO LOGO */}
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Permanent+Marker&display=swap');
        .font-brush { font-family: 'Permanent Marker', cursive; }
        
        input:-webkit-autofill, input:-webkit-autofill:hover, input:-webkit-autofill:focus, input:-webkit-autofill:active {
            -webkit-box-shadow: 0 0 0 30px #0a0a0a inset !important;
            -webkit-text-fill-color: #d1d5db !important;
            transition: background-color 5000s ease-in-out 0s;
        }
      `}</style>

      {/* BACKGROUND ESTILO MANGÁ / RED MOON (Usando CSS puro para simular o efeito imersivo) */}
      <div className="absolute inset-0 pointer-events-none z-0">
          <div className="absolute top-[-10%] left-1/2 -translate-x-1/2 w-[800px] h-[800px] bg-[radial-gradient(circle_at_center,rgba(220,38,38,0.15)_0%,transparent_60%)]"></div>
          <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/stardust.png')] opacity-20 mix-blend-overlay"></div>
          <div className="absolute inset-0 bg-gradient-to-b from-transparent via-[#050000]/80 to-black"></div>
      </div>

      {/* MODAL DE RECUPERAÇÃO DE SENHA */}
      {showForgotModal && (
        <div className="fixed inset-0 z-[99999] bg-black/90 backdrop-blur-md flex items-center justify-center p-4 animate-in fade-in zoom-in-95 duration-200">
          <div className="bg-[#0a0a0a] border border-red-900/50 rounded-2xl p-6 md:p-8 max-w-sm w-full relative overflow-hidden shadow-[0_0_40px_rgba(220,38,38,0.15)]">
            <h3 className="text-center text-white font-black text-xl tracking-wider mb-2 uppercase">Recuperar Acesso</h3>
            <p className="text-center text-gray-400 text-xs font-medium mb-6">
                Digite seu e-mail para receber as instruções de redefinição.
            </p>
            <form onSubmit={handleSendResetLink} className="space-y-4">
                <div className="flex items-center bg-[#111] border border-white/5 rounded-xl p-2 focus-within:border-red-600/50 transition-colors">
                   <input type="email" value={resetEmail} onChange={(e) => setResetEmail(e.target.value)} placeholder="Seu e-mail" className="flex-1 bg-transparent border-none text-gray-300 text-sm px-3 outline-none" required />
                </div>
                <div className="flex gap-3 mt-6">
                    <button type="button" onClick={() => setShowForgotModal(false)} className="flex-1 bg-transparent border border-white/10 text-gray-400 py-3 rounded-xl font-bold text-xs uppercase hover:bg-white/5 transition-colors">Cancelar</button>
                    <button type="submit" disabled={resetLoading} className="flex-1 bg-red-600 text-white py-3 rounded-xl font-bold text-xs uppercase shadow-[0_0_15px_rgba(220,38,38,0.5)] hover:bg-red-500 transition-all disabled:opacity-50">
                        {resetLoading ? <Loader2 className="w-4 h-4 animate-spin mx-auto"/> : 'ENVIAR'}
                    </button>
                </div>
            </form>
          </div>
        </div>
      )}

      {/* PAINEL PRINCIPAL DE LOGIN */}
      <div className="w-full max-w-[360px] bg-[#0a0a0a]/95 backdrop-blur-md border border-white/5 rounded-[1.5rem] p-6 sm:p-8 relative z-10 shadow-2xl animate-in fade-in duration-700">
        
        {/* LOGO NEXO SCAN */}
        <div className="flex flex-col items-center mb-8">
            <div className="text-white text-5xl font-black italic tracking-tight flex items-center justify-center">
                N E <span className="text-red-600 font-brush text-6xl -mx-1 drop-shadow-[0_0_8px_rgba(220,38,38,0.8)] transform -translate-y-1">X</span> O
            </div>
            <div className="flex items-center gap-3 mt-1 opacity-80">
                <div className="h-[1px] w-4 bg-red-600"></div>
                <span className="text-gray-400 text-[10px] font-black tracking-[0.5em] uppercase">S C A N</span>
                <div className="h-[1px] w-4 bg-red-600"></div>
            </div>
        </div>

        {/* TÍTULO */}
        <div className="text-center mb-8">
            <h2 className="text-white font-bold text-xl mb-1">
                {isRegister ? "Crie sua" : "Bem-vindo de"} <span className="text-red-500">{isRegister ? "conta!" : "volta!"}</span>
            </h2>
            <p className="text-gray-400 text-[11px]">
                {isRegister ? "Junte-se a nós para continuar" : "Entre na sua conta para continuar"}
            </p>
        </div>

        {localError && (
            <div className="mb-6 w-full bg-red-950/20 border border-red-900/50 text-red-400 text-[10px] font-bold p-3 rounded-lg text-center flex items-center justify-center gap-2">
                <AlertCircle className="w-3 h-3" /> {localError}
            </div>
        )}

        <form onSubmit={handleSubmit} className="flex flex-col gap-5">
            
            {/* INPUT NOME */}
            {isRegister && (
                <div className="flex flex-col gap-2">
                    <label className="text-white text-[10px] font-bold tracking-wider">NOME</label>
                    <div className="flex items-center bg-[#111] border border-white/5 rounded-xl h-12 px-4 focus-within:border-red-600/50 transition-colors">
                        <User className="w-4 h-4 text-red-600 mr-3 opacity-80" />
                        <input type="text" value={name} onChange={(e) => setName(e.target.value)} placeholder="Seu nome" className="flex-1 bg-transparent border-none text-gray-300 text-sm outline-none placeholder:text-gray-600" required />
                    </div>
                </div>
            )}

            {/* INPUT E-MAIL */}
            <div className="flex flex-col gap-2">
                <label className="text-white text-[10px] font-bold tracking-wider">E-MAIL</label>
                <div className="flex items-center bg-[#111] border border-white/5 rounded-xl h-12 px-4 focus-within:border-red-600/50 transition-colors">
                    <Mail className="w-4 h-4 text-red-600 mr-3 opacity-80" />
                    <input type="email" value={email} onChange={(e) => setEmail(e.target.value)} placeholder="seu@email.com" className="flex-1 bg-transparent border-none text-gray-300 text-sm outline-none placeholder:text-gray-600" required />
                </div>
            </div>

            {/* INPUT SENHA */}
            <div className="flex flex-col gap-2">
                <label className="text-white text-[10px] font-bold tracking-wider">SENHA</label>
                <div className="flex items-center bg-[#111] border border-white/5 rounded-xl h-12 px-4 focus-within:border-red-600/50 transition-colors">
                    <Lock className="w-4 h-4 text-red-600 mr-3 opacity-80" />
                    <input type={showPass ? "text" : "password"} value={password} onChange={(e) => setPassword(e.target.value)} placeholder="••••••••••••" className="flex-1 min-w-0 bg-transparent border-none text-gray-300 text-lg tracking-[0.2em] outline-none placeholder:text-gray-600" required />
                    <button type="button" onClick={() => setShowPass(!showPass)} className="ml-2 text-gray-500 hover:text-gray-300 transition-colors">
                        {showPass ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                    </button>
                </div>
            </div>

            {/* LEMBRAR DE MIM & ESQUECI SENHA */}
            {!isRegister && (
                <div className="flex items-center justify-between mt-1">
                    <label className="flex items-center gap-2 cursor-pointer group">
                        <div className="relative w-4 h-4 flex items-center justify-center">
                            <input type="checkbox" checked={rememberMe} onChange={() => setRememberMe(!rememberMe)} className="peer appearance-none w-full h-full border border-red-900 rounded-[4px] bg-transparent checked:bg-transparent checked:border-red-600 transition-colors cursor-pointer" />
                            <Check className="absolute w-3 h-3 text-red-500 opacity-0 peer-checked:opacity-100 pointer-events-none" strokeWidth={3} />
                        </div>
                        <span className="text-[10px] text-gray-500 font-medium group-hover:text-gray-400 transition-colors">Lembrar de mim</span>
                    </label>
                    <button type="button" onClick={() => setShowForgotModal(true)} className="text-[10px] text-red-600 hover:text-red-500 font-medium transition-colors">
                        Esqueceu sua senha?
                    </button>
                </div>
            )}

            {/* BOTÃO PRINCIPAL (ENTRAR / REGISTRAR) */}
            <button type="submit" disabled={loading} className="w-full mt-2 bg-gradient-to-r from-red-950 via-red-800 to-red-600 text-white flex justify-center items-center py-4 px-6 rounded-xl shadow-[0_0_20px_rgba(220,38,38,0.4)] hover:brightness-110 active:scale-[0.98] transition-all disabled:opacity-70 group border border-red-500/50">
                <span className="font-bold text-sm tracking-widest flex-1 text-center pl-4">
                    {loading ? <Loader2 className="w-5 h-5 animate-spin mx-auto"/> : (isRegister ? 'REGISTRAR' : 'ENTRAR')}
                </span>
                {!loading && <ArrowRight className="w-4 h-4 text-white group-hover:translate-x-1 transition-transform" />}
            </button>
        </form>

        {/* DIVISOR (OU) */}
        <div className="flex items-center gap-4 my-6 justify-center opacity-40">
            <div className="h-[1px] flex-1 bg-white/30"></div>
            <span className="text-[10px] text-white uppercase tracking-widest">ou</span>
            <div className="h-[1px] flex-1 bg-white/30"></div>
        </div>

        {/* BOTÃO SECUNDÁRIO (CRIAR CONTA / VOLTAR PRO LOGIN) */}
        <button onClick={() => setIsRegister(!isRegister)} className="w-full bg-transparent border border-red-900/50 hover:border-red-500/80 text-white flex justify-center items-center py-4 px-6 rounded-xl transition-all group">
            <User className="w-4 h-4 text-red-500 mr-2 opacity-80" />
            <span className="font-bold text-xs tracking-widest">
                {isRegister ? "JÁ TENHO UMA CONTA" : "CRIAR CONTA"}
            </span>
        </button>

      </div>
    </div>
  );
}
