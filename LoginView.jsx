import React, { useState, useEffect } from 'react';
import { signInWithEmailAndPassword, createUserWithEmailAndPassword, updateProfile, sendPasswordResetEmail, GoogleAuthProvider, signInWithPopup } from "firebase/auth";
import { auth } from './firebase'; 
import { Mail, Lock, User, Eye, EyeOff, AlertCircle, Loader2, Check, ArrowRight, X } from 'lucide-react';

// SVG do G do Google
const GoogleIcon = () => (
  <svg viewBox="0 0 24 24" width="20" height="20" xmlns="http://www.w3.org/2000/svg">
    <g transform="matrix(1, 0, 0, 1, 27.009001, -39.238998)">
      <path fill="#4285F4" d="M -3.264 51.509 C -3.264 50.719 -3.334 49.969 -3.454 49.239 L -14.754 49.239 L -14.754 53.749 L -8.284 53.749 C -8.574 55.229 -9.424 56.479 -10.684 57.329 L -10.684 60.329 L -6.824 60.329 C -4.564 58.239 -3.264 55.159 -3.264 51.509 Z"/>
      <path fill="#34A853" d="M -14.754 63.239 C -11.514 63.239 -8.804 62.159 -6.824 60.329 L -10.684 57.329 C -11.764 58.049 -13.134 58.489 -14.754 58.489 C -17.884 58.489 -20.534 56.379 -21.484 53.529 L -25.464 53.529 L -25.464 56.619 C -23.494 60.539 -19.444 63.239 -14.754 63.239 Z"/>
      <path fill="#FBBC05" d="M -21.484 53.529 C -21.734 52.809 -21.864 52.039 -21.864 51.239 C -21.864 50.439 -21.724 49.669 -21.484 48.949 L -21.484 45.859 L -25.464 45.859 C -26.284 47.479 -26.754 49.299 -26.754 51.239 C -26.754 53.179 -26.284 54.999 -25.464 56.619 L -21.484 53.529 Z"/>
      <path fill="#EA4335" d="M -14.754 43.989 C -12.984 43.989 -11.404 44.599 -10.154 45.789 L -6.734 41.939 C -8.804 40.009 -11.514 38.989 -14.754 38.989 C -19.444 38.989 -23.494 41.689 -25.464 45.859 L -21.484 48.949 C -20.534 46.099 -17.884 43.989 -14.754 43.989 Z"/>
    </g>
  </svg>
);

// N Logo com efeito brush
const MarkerNLogo = ({ className }) => (
  <svg className={className} viewBox="0 0 100 100" fill="none" xmlns="http://www.w3.org/2000/svg">
    <defs>
      <linearGradient id="nexonBluePurple" x1="0%" y1="0%" x2="100%" y2="100%">
        <stop offset="0%" stopColor="#00f2fe" />
        <stop offset="50%" stopColor="#4facfe" />
        <stop offset="100%" stopColor="#a855f7" />
      </linearGradient>
    </defs>
    {/* N Estilizado Pincelada */}
    <path d="M 25 80 Q 25 50 30 20 Q 32 15 35 25 L 65 65 Q 68 70 70 60 Q 75 40 75 20" stroke="url(#nexonBluePurple)" strokeWidth="14" strokeLinecap="round" strokeLinejoin="round" style={{ filter: 'drop-shadow(0 0 10px rgba(168,85,247,0.6))' }} />
    {/* Efeitos rasgados nas pontas */}
    <path d="M 23 85 L 28 75 M 32 15 L 27 25 M 68 75 L 75 65" stroke="url(#nexonBluePurple)" strokeWidth="4" strokeLinecap="round" />
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
        showToast("Registro concluído! Bem-vindo ao Nexo Scan.", "success");
      } else {
        await signInWithEmailAndPassword(auth, email, password);
        if (rememberMe) {
          localStorage.setItem('nexon_email', email);
          localStorage.setItem('nexon_pass', password);
        } else {
          localStorage.removeItem('nexon_email');
          localStorage.removeItem('nexon_pass');
        }
        showToast("Conexão estabelecida com sucesso.", "success");
      }
      onLoginSuccess();
    } catch (error) { 
        let msg = "Erro na matriz do sistema.";
        if (error.code === 'auth/invalid-credential') msg = "Identidade ou chave incorreta.";
        else if (error.code === 'auth/user-not-found') msg = "Usuário não encontrado nos registros.";
        else if (error.code === 'auth/email-already-in-use') msg = "Este e-mail já está em uso.";
        else if (error.code === 'auth/weak-password') msg = "A senha deve ter 6 ou mais caracteres.";
        else if (error.message === 'missing-name') msg = "Sua identificação é obrigatória.";
        showToast(msg, "error"); setLocalError(msg);
    } finally { setLoading(false); }
  };

  const handleGoogleLogin = async () => {
    setLoading(true);
    try {
      const provider = new GoogleAuthProvider();
      await signInWithPopup(auth, provider);
      showToast("Conexão Google estabelecida!", "success");
      onLoginSuccess();
    } catch (error) {
      showToast("Erro ao conectar com Google.", "error");
    } finally {
      setLoading(false);
    }
  };

  const handleSendResetLink = async (e) => {
    e.preventDefault();
    if (!resetEmail || !resetEmail.includes('@')) {
      showToast("Insira um e-mail válido para recuperação.", "warning");
      return;
    }
    setResetLoading(true);
    try {
      await sendPasswordResetEmail(auth, resetEmail);
      showToast("Sinal enviado! Verifique sua caixa de entrada.", "success");
      setShowForgotModal(false);
      setResetEmail('');
    } catch (error) {
      showToast("Erro ao enviar o sinal de recuperação.", "error");
    } finally {
      setResetLoading(false);
    }
  };

  return (
    <div 
        className="min-h-screen flex flex-col items-center justify-center p-4 relative overflow-hidden bg-[#030108] bg-cover bg-center bg-no-repeat"
        style={{ backgroundImage: "url('https://i.ibb.co/gFwD656j/file-00000000893071f5833dc6f046c9c9f3.png')" }}
    >
      
      {/* IMPORTANDO A FONTE MARKER E O CSS DO AUTOFILL */}
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Permanent+Marker&display=swap');
        .font-marker { font-family: 'Permanent Marker', cursive; }
        
        input:-webkit-autofill,
        input:-webkit-autofill:hover, 
        input:-webkit-autofill:focus, 
        input:-webkit-autofill:active{
            -webkit-box-shadow: 0 0 0 30px #080510 inset !important;
            -webkit-text-fill-color: #d1d5db !important;
            transition: background-color 5000s ease-in-out 0s;
        }
      `}</style>

      {/* OVERLAY PARA ESCURECER O FUNDO */}
      <div className="absolute inset-0 bg-[#05030a]/40 backdrop-blur-[2px] pointer-events-none z-0"></div>

      {/* TEXTO VERTICAL JAPONÊS (DIREITA) */}
      <div className="absolute right-4 top-12 z-0 flex flex-col items-center opacity-80 pointer-events-none">
          <div className="text-purple-400 font-black text-xs mb-2">✦</div>
          <div className="text-blue-300/60 text-[10px] tracking-[0.5em] writing-vertical-rl mb-2">マンガの宇宙へ</div>
          <div className="w-[1px] h-32 bg-gradient-to-b from-blue-500/50 to-transparent"></div>
      </div>

      {/* MODAL DE ESQUECI A SENHA */}
      {showForgotModal && (
        <div className="fixed inset-0 z-[99999] bg-black/80 backdrop-blur-sm flex items-center justify-center p-4 animate-in fade-in zoom-in-95 duration-200">
          <div className="bg-[#05030A]/95 border border-purple-900/50 rounded-2xl p-6 md:p-8 max-w-sm w-full relative overflow-hidden shadow-[0_0_40px_rgba(168,85,247,0.2)]">
            <h3 className="text-center text-white font-marker text-xl tracking-wider mb-2">RECUPERAR ACESSO</h3>
            <p className="text-center text-gray-400 text-[10px] font-medium mb-6">
                Enviaremos um link de redefinição para o seu e-mail.
            </p>
            <form onSubmit={handleSendResetLink} className="space-y-4 font-sans">
                <div className="flex items-center bg-[#080510]/80 border border-white/10 rounded-xl p-2 focus-within:border-purple-500/50">
                   <input type="email" value={resetEmail} onChange={(e) => setResetEmail(e.target.value)} placeholder="Seu e-mail cadastrado" className="flex-1 bg-transparent border-none text-gray-300 text-xs px-3 outline-none" required />
                </div>
                <div className="flex gap-3 mt-6">
                    <button type="button" onClick={() => setShowForgotModal(false)} className="flex-1 bg-transparent border border-white/10 text-gray-400 py-3 rounded-xl font-bold text-[10px] uppercase tracking-widest hover:bg-white/5 transition-colors">Cancelar</button>
                    <button type="submit" disabled={resetLoading} className="flex-1 bg-gradient-to-r from-blue-600 to-purple-600 text-white py-3 rounded-xl font-bold text-[10px] uppercase tracking-widest hover:brightness-110 transition-all disabled:opacity-50">
                        {resetLoading ? <Loader2 className="w-4 h-4 animate-spin mx-auto"/> : 'ENVIAR LINK'}
                    </button>
                </div>
            </form>
          </div>
        </div>
      )}

      {/* CONTEÚDO PRINCIPAL */}
      <div className="w-full max-w-[360px] relative z-10 animate-in fade-in duration-700 pt-8 pb-4 flex flex-col items-center">
        
        {/* LOGO E TEXTOS DO TOPO */}
        <div className="flex flex-col items-center text-center w-full mb-8 relative">
            <div className="relative flex justify-center items-center mb-4">
                <MarkerNLogo className="w-24 h-24 relative z-10" />
                {/* Kanji ao lado do N */}
                <div className="absolute -right-8 top-2 text-blue-300/80 text-[10px] writing-vertical-rl tracking-widest">繋がり</div>
            </div>
            
            <h1 className="text-white text-5xl font-marker tracking-widest leading-none drop-shadow-[0_0_15px_rgba(255,255,255,0.3)] relative -ml-2 mb-1">
                NEXO
            </h1>
            
            <div className="flex items-center gap-4 w-full justify-center mb-6">
                <div className="h-[1px] w-8 bg-blue-500/50"></div>
                <h2 className="text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-purple-500 text-[11px] font-black tracking-[0.8em] uppercase drop-shadow-md -mr-1.5">
                    S C A N
                </h2>
                <div className="h-[1px] w-8 bg-purple-500/50"></div>
            </div>
            
            <div className="mb-2"><span className="text-purple-400 text-[10px]">✿</span></div>
            <p className="text-gray-300 text-[11px] font-medium leading-relaxed tracking-wide font-sans">
                Seu portal para o <br/>
                <span className="text-purple-400 font-bold">universo dos mangás</span>
            </p>
        </div>

        {/* CONTAINER DO FORMULÁRIO (GLASSMORPHISM) */}
        <div className="w-full bg-[#030108]/40 backdrop-blur-[12px] border border-blue-500/20 rounded-[2rem] p-6 shadow-[0_0_40px_rgba(168,85,247,0.15)] relative font-sans">
            
            {localError && (
                <div className="mb-6 w-full bg-red-950/40 border border-red-500/30 text-red-200 text-[10px] font-bold p-3 rounded-xl text-center flex items-center justify-center gap-2">
                    <AlertCircle className="w-3 h-3" /> {localError}
                </div>
            )}

            <form onSubmit={handleSubmit} className="w-full flex flex-col gap-5">
                
                {/* CAMPO NOME (SÓ NO REGISTRO) */}
                {isRegister && (
                    <div className="flex flex-col gap-1.5">
                        <label className="text-cyan-500 font-marker text-[13px] tracking-widest pl-1">NOME</label>
                        <div className="flex items-center bg-[#05030A]/80 border border-white/10 rounded-xl overflow-hidden focus-within:border-cyan-500/50 transition-colors shadow-inner">
                            <div className="w-12 h-12 flex items-center justify-center bg-cyan-900/20 border-r border-white/5 flex-shrink-0">
                                <User className="w-4 h-4 text-cyan-400" />
                            </div>
                            <input type="text" value={name} onChange={(e) => setName(e.target.value)} placeholder="Como devemos te chamar?" className="flex-1 bg-transparent border-none text-gray-200 text-xs px-4 h-full outline-none placeholder-gray-600" required />
                        </div>
                    </div>
                )}

                {/* CAMPO E-MAIL */}
                <div className="flex flex-col gap-1.5">
                    <label className="text-cyan-500 font-marker text-[13px] tracking-widest pl-1">E-MAIL</label>
                    <div className="flex items-center bg-[#05030A]/80 border border-white/10 rounded-xl overflow-hidden focus-within:border-cyan-500/50 transition-colors shadow-inner">
                        <div className="w-12 h-12 flex items-center justify-center bg-cyan-900/20 border-r border-white/5 flex-shrink-0">
                            <Mail className="w-4 h-4 text-cyan-400" />
                        </div>
                        <input type="email" value={email} onChange={(e) => setEmail(e.target.value)} placeholder="Digite seu e-mail" className="flex-1 bg-transparent border-none text-gray-200 text-xs px-4 h-full outline-none placeholder-gray-600" required />
                    </div>
                </div>

                {/* CAMPO SENHA */}
                <div className="flex flex-col gap-1.5">
                    <label className="text-fuchsia-400 font-marker text-[13px] tracking-widest pl-1">SENHA</label>
                    <div className="flex items-center bg-[#05030A]/80 border border-white/10 rounded-xl overflow-hidden focus-within:border-fuchsia-500/50 transition-colors shadow-inner">
                        <div className="w-12 h-12 flex items-center justify-center bg-fuchsia-900/20 border-r border-white/5 flex-shrink-0">
                            <Lock className="w-4 h-4 text-fuchsia-400" />
                        </div>
                        <input type={showPass ? "text" : "password"} value={password} onChange={(e) => setPassword(e.target.value)} placeholder="Digite sua senha" className="flex-1 bg-transparent border-none text-gray-200 text-xs px-4 h-full outline-none placeholder-gray-600 min-w-0" required />
                        <button type="button" onClick={() => setShowPass(!showPass)} className="px-4 text-fuchsia-400 hover:text-fuchsia-300 font-black text-[9px] tracking-widest flex items-center gap-1.5 transition-colors">
                            {showPass ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />} VER
                        </button>
                    </div>
                </div>

                {/* OPÇÕES EXTRAS */}
                {!isRegister && (
                    <div className="flex items-center justify-between px-1 mt-1">
                        <label className="flex items-center gap-2 cursor-pointer group">
                            <div className="relative w-3.5 h-3.5 flex items-center justify-center">
                                <input type="checkbox" checked={rememberMe} onChange={() => setRememberMe(!rememberMe)} className="peer appearance-none w-full h-full border border-gray-500 rounded-[4px] bg-transparent checked:bg-cyan-500 checked:border-cyan-500 transition-colors cursor-pointer" />
                                <Check className="absolute w-2.5 h-2.5 text-black opacity-0 peer-checked:opacity-100 pointer-events-none" strokeWidth={3} />
                            </div>
                            <span className="text-[10px] text-gray-400 font-medium group-hover:text-gray-300 transition-colors">Lembrar de mim</span>
                        </label>
                        <button type="button" onClick={() => setShowForgotModal(true)} className="text-[10px] text-fuchsia-400 hover:text-fuchsia-300 font-medium transition-colors">
                            Esqueci minha senha
                        </button>
                    </div>
                )}

                {/* BOTÃO ENTRAR / CRIAR CONTA */}
                <button 
                    type="submit" 
                    disabled={loading} 
                    className="w-full mt-4 bg-gradient-to-r from-blue-500 via-indigo-500 to-purple-500 text-white flex justify-center items-center py-4 px-6 shadow-[0_0_20px_rgba(99,102,241,0.4)] hover:brightness-110 active:scale-[0.98] transition-all disabled:opacity-70 disabled:grayscale group relative overflow-hidden"
                    style={{ borderRadius: '15px 25px 15px 25px' }} // Shape irregular estilo brush da imagem
                >
                    <div className="absolute inset-0 bg-white/10 opacity-0 group-hover:opacity-100 transition-opacity"></div>
                    <span className="font-marker text-lg tracking-[0.15em] flex-1 text-center pl-4">
                        {loading ? <Loader2 className="w-5 h-5 animate-spin mx-auto"/> : (isRegister ? 'REGISTRAR' : 'ENTRAR')}
                    </span>
                    {!loading && <ArrowRight className="w-5 h-5 text-white/80 group-hover:translate-x-1 transition-transform" strokeWidth={2} />}
                </button>
            </form>

            {/* TOGGLE REGISTRO/LOGIN */}
            <div className="text-center mt-6">
                <span className="text-[9px] text-gray-500 font-medium tracking-wide">Ainda não tem conta?</span><br/>
                <button onClick={() => setIsRegister(!isRegister)} className="text-[14px] text-blue-400 font-marker tracking-widest uppercase mt-2 hover:text-cyan-300 transition-colors drop-shadow-[0_0_8px_rgba(96,165,250,0.5)]">
                    {isRegister ? "FAZER LOGIN" : "CRIAR CONTA"}
                </button>
            </div>

            {/* DIVISOR (OU) */}
            <div className="flex items-center gap-3 my-6 justify-center opacity-60">
                <div className="h-[1px] w-12 bg-gray-700"></div>
                <span className="text-blue-900 text-[8px]">✦</span>
                <span className="text-[10px] font-black text-gray-500 uppercase tracking-widest">OU</span>
                <span className="text-blue-900 text-[8px]">✦</span>
                <div className="h-[1px] w-12 bg-gray-700"></div>
            </div>

            {/* BOTÃO GOOGLE */}
            <div className="flex justify-center">
                <button 
                    onClick={handleGoogleLogin}
                    disabled={loading}
                    className="w-12 h-12 rounded-full bg-[#080510]/80 border border-white/10 hover:border-blue-500/50 flex items-center justify-center transition-all hover:shadow-[0_0_15px_rgba(59,130,246,0.3)] disabled:opacity-50"
                    title="Entrar com Google"
                >
                    <GoogleIcon />
                </button>
            </div>

        </div>
      </div>
    </div>
  );
}
