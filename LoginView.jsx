import React, { useState } from 'react';
import { User, Lock, EyeOff, Eye, ArrowRight, Mail, Loader2, ArrowLeft } from 'lucide-react';
import { signInWithEmailAndPassword, createUserWithEmailAndPassword, sendPasswordResetEmail, updateProfile } from "firebase/auth";
import { doc, setDoc } from "firebase/firestore";
import { auth, db } from './firebase';
import { APP_ID } from './constants';

export function LoginView({ onLoginSuccess, onGuestAccess, showToast }) {
    const [mode, setMode] = useState('login'); // 'login', 'register', 'reset'
    const [showPassword, setShowPassword] = useState(false);
    const [isLoading, setIsLoading] = useState(false);

    // Campos do Formulário
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [username, setUsername] = useState('');

    // Tradutor de erros do Firebase
    const getErrorMessage = (error) => {
        const code = error.code;
        if (code === 'auth/invalid-email') return "E-mail inválido.";
        if (code === 'auth/user-not-found' || code === 'auth/invalid-credential') return "Usuário ou senha incorretos.";
        if (code === 'auth/wrong-password') return "Senha incorreta.";
        if (code === 'auth/email-already-in-use') return "Este e-mail já está em uso.";
        if (code === 'auth/weak-password') return "A senha deve ter pelo menos 6 caracteres.";
        return "Erro na autenticação. Tente novamente.";
    };

    // Função de Login
    const handleLogin = async (e) => {
        e.preventDefault();
        if (!email || !password) return showToast("Preencha todos os campos.", "warning");
        setIsLoading(true);
        try {
            await signInWithEmailAndPassword(auth, email, password);
            showToast("Bem-vindo de volta ao Império!", "success");
            if (onLoginSuccess) onLoginSuccess();
        } catch (error) {
            showToast(getErrorMessage(error), "error");
        } finally {
            setIsLoading(false);
        }
    };

    // Função de Criar Conta
    const handleRegister = async (e) => {
        e.preventDefault();
        if (!email || !password || !username) return showToast("Preencha todos os campos.", "warning");
        setIsLoading(true);
        try {
            const userCredential = await createUserWithEmailAndPassword(auth, email, password);
            const user = userCredential.user;
            
            // Atualiza o nome de perfil no Auth
            await updateProfile(user, { displayName: username });

            // Cria o documento de perfil inicial no Firestore
            await setDoc(doc(db, 'artifacts', APP_ID, 'users', user.uid, 'profile', 'main'), {
                name: username,
                displayName: username,
                email: email,
                xp: 0,
                level: 1,
                coins: 0,
                crystals: 0,
                caixas: 1, // Dá 1 caixa de brinde para novos usuários
                inventory: [],
                equipped_items: {},
                createdAt: Date.now()
            }, { merge: true });

            showToast("Conta criada com sucesso!", "success");
            if (onLoginSuccess) onLoginSuccess();
        } catch (error) {
            showToast(getErrorMessage(error), "error");
        } finally {
            setIsLoading(false);
        }
    };

    // Função de Redefinir Senha
    const handleResetPassword = async (e) => {
        e.preventDefault();
        if (!email) return showToast("Digite seu e-mail para recuperar a senha.", "warning");
        setIsLoading(true);
        try {
            await sendPasswordResetEmail(auth, email);
            showToast("E-mail de recuperação enviado!", "success");
            setMode('login'); // Volta pro login após enviar
        } catch (error) {
            showToast(getErrorMessage(error), "error");
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="min-h-screen relative flex items-center justify-center bg-[#050505] overflow-hidden font-sans">
            
            {/* BACKGROUND DIVIDIDO (VERMELHO ESQUERDA / AZUL DIREITA) */}
            <div className="absolute inset-0 flex pointer-events-none z-0 opacity-40 mix-blend-screen">
                <div className="w-1/2 h-full bg-[url('https://placehold.co/800x1200/1a0505/ef4444?text=Manga+Left')] bg-cover bg-center"></div>
                <div className="w-1/2 h-full bg-[url('https://placehold.co/800x1200/050a1a/3b82f6?text=Manga+Right')] bg-cover bg-center"></div>
            </div>
            
            {/* LUZES AMBIENTES */}
            <div className="absolute left-0 top-1/2 -translate-y-1/2 w-64 h-full bg-red-600/20 blur-[120px] pointer-events-none z-0"></div>
            <div className="absolute right-0 top-1/2 -translate-y-1/2 w-64 h-full bg-blue-600/20 blur-[120px] pointer-events-none z-0"></div>
            <div className="absolute bottom-0 left-0 w-full h-32 bg-gradient-to-t from-white/5 to-transparent pointer-events-none z-0"></div>

            {/* CARD DE AUTENTICAÇÃO */}
            <div className="relative z-10 w-full max-w-[400px] p-[1px] rounded-[2rem] bg-gradient-to-r from-red-600 via-transparent to-blue-600 shadow-[0_30px_60px_rgba(0,0,0,0.8)] mx-4">
                <div className="bg-[#0A0D14]/95 backdrop-blur-2xl rounded-[2rem] p-8 md:p-10 w-full flex flex-col transition-all duration-300">
                    
                    {/* LOGOTIPO MANGA EMPIRE */}
                    <div className="flex flex-col items-center mb-10">
                        <svg className="w-14 h-10 mb-2 drop-shadow-[0_0_15px_rgba(255,255,255,0.2)]" viewBox="0 0 100 60" fill="none" xmlns="http://www.w3.org/2000/svg">
                            <path d="M10 50 L0 15 L32 30 L50 0 L68 30 L100 15 L90 50 Z" fill="url(#crown-login-grad)" />
                            <path d="M20 55 L80 55" stroke="url(#crown-login-grad)" strokeWidth="4" strokeLinecap="round" />
                            <defs>
                                <linearGradient id="crown-login-grad" x1="0" y1="0" x2="100" y2="0" gradientUnits="userSpaceOnUse">
                                    <stop stopColor="#ef4444" />
                                    <stop offset="0.5" stopColor="#ffffff" />
                                    <stop offset="1" stopColor="#3b82f6" />
                                </linearGradient>
                            </defs>
                        </svg>
                        <h1 className="text-4xl font-black italic tracking-tighter leading-none text-white drop-shadow-md">MANGA</h1>
                        <h1 className="text-4xl font-black italic tracking-tighter leading-none bg-clip-text text-transparent bg-gradient-to-r from-red-500 to-blue-500 drop-shadow-[0_0_10px_rgba(239,68,68,0.4)]">EMPIRE</h1>
                    </div>

                    {/* FORMULÁRIO DINÂMICO */}
                    <form onSubmit={mode === 'login' ? handleLogin : mode === 'register' ? handleRegister : handleResetPassword} className="flex flex-col gap-5">
                        
                        {/* CAMPO: USUÁRIO (Apenas no Registro) */}
                        {mode === 'register' && (
                            <div className="flex flex-col gap-1.5 animate-in slide-in-from-top-2 fade-in">
                                <label className="text-[10px] font-bold text-gray-400 uppercase tracking-widest pl-1">Nome de Usuário</label>
                                <div className="relative flex items-center group">
                                    <User className="absolute left-4 w-4 h-4 text-red-500 group-focus-within:text-red-400 transition-colors" />
                                    <input type="text" value={username} onChange={(e) => setUsername(e.target.value)} placeholder="Seu apelido" required className="w-full bg-black/50 border border-white/10 rounded-xl py-3.5 pl-11 pr-4 text-sm text-white outline-none focus:border-red-500/50 transition-colors placeholder:text-gray-600" />
                                </div>
                            </div>
                        )}

                        {/* CAMPO: E-MAIL (Todos os modos) */}
                        <div className="flex flex-col gap-1.5">
                            <label className="text-[10px] font-bold text-gray-400 uppercase tracking-widest pl-1">E-mail</label>
                            <div className="relative flex items-center group">
                                <Mail className="absolute left-4 w-4 h-4 text-red-500 group-focus-within:text-red-400 transition-colors" />
                                <input type="email" value={email} onChange={(e) => setEmail(e.target.value)} placeholder="Digite seu e-mail" required className="w-full bg-black/50 border border-white/10 rounded-xl py-3.5 pl-11 pr-4 text-sm text-white outline-none focus:border-red-500/50 transition-colors placeholder:text-gray-600" />
                            </div>
                        </div>

                        {/* CAMPO: SENHA (Login e Registro) */}
                        {mode !== 'reset' && (
                            <div className="flex flex-col gap-1.5 animate-in slide-in-from-top-2 fade-in">
                                <div className="flex items-center justify-between pl-1 pr-1">
                                    <label className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">Senha</label>
                                    {mode === 'login' && (
                                        <button type="button" onClick={() => setMode('reset')} className="text-[10px] font-bold text-red-500 hover:text-red-400 transition-colors">Esqueceu sua senha?</button>
                                    )}
                                </div>
                                <div className="relative flex items-center group">
                                    <Lock className="absolute left-4 w-4 h-4 text-red-500 group-focus-within:text-red-400 transition-colors" />
                                    <input type={showPassword ? "text" : "password"} value={password} onChange={(e) => setPassword(e.target.value)} placeholder={mode === 'register' ? "Mínimo 6 caracteres" : "Digite sua senha"} required minLength="6" className="w-full bg-black/50 border border-white/10 rounded-xl py-3.5 pl-11 pr-12 text-sm text-white outline-none focus:border-red-500/50 transition-colors placeholder:text-gray-600" />
                                    <button type="button" onClick={() => setShowPassword(!showPassword)} className="absolute right-4 text-gray-500 hover:text-gray-300 transition-colors">
                                        {showPassword ? <Eye className="w-4 h-4" /> : <EyeOff className="w-4 h-4" />}
                                    </button>
                                </div>
                            </div>
                        )}

                        {/* BOTÃO PRINCIPAL */}
                        <button type="submit" disabled={isLoading} className="mt-4 w-full bg-gradient-to-r from-red-600 to-blue-600 hover:from-red-500 hover:to-blue-500 disabled:opacity-50 disabled:grayscale text-white font-bold text-sm py-4 rounded-xl flex items-center justify-center gap-3 transition-all active:scale-95 shadow-[0_10px_30px_rgba(239,68,68,0.2)] group">
                            {isLoading ? <Loader2 className="w-5 h-5 animate-spin" /> : (
                                <>
                                    {mode === 'login' ? 'ENTRAR' : mode === 'register' ? 'CRIAR CONTA' : 'ENVIAR LINK'}
                                    <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                                </>
                            )}
                        </button>
                    </form>

                    {/* OPÇÕES SECUNDÁRIAS (Rodapé do Card) */}
                    <div className="mt-6 flex flex-col items-center gap-4">
                        
                        {mode === 'login' && (
                            <>
                                <div className="flex items-center gap-4 w-full">
                                    <div className="flex-1 h-[1px] bg-white/10"></div>
                                    <span className="text-[10px] font-bold text-gray-500 uppercase">OU</span>
                                    <div className="flex-1 h-[1px] bg-white/10"></div>
                                </div>
                                <div className="text-center">
                                    <span className="text-xs text-gray-400 font-medium">Não tem uma conta? </span>
                                    <button onClick={() => setMode('register')} className="text-xs text-red-500 font-bold hover:text-red-400 transition-colors">Criar conta &gt;</button>
                                </div>
                                {/* Login como Visitante */}
                                {onGuestAccess && (
                                    <button onClick={onGuestAccess} className="text-[10px] font-bold text-gray-500 hover:text-white transition-colors uppercase tracking-widest mt-2 border-b border-transparent hover:border-white">
                                        Entrar como Visitante
                                    </button>
                                )}
                            </>
                        )}

                        {(mode === 'register' || mode === 'reset') && (
                            <button onClick={() => setMode('login')} className="flex items-center gap-2 text-xs text-gray-400 font-bold hover:text-white transition-colors mt-2">
                                <ArrowLeft className="w-4 h-4" /> Voltar ao Login
                            </button>
                        )}
                        
                    </div>

                </div>
            </div>
        </div>
    );
}
