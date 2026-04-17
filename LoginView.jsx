import React, { useState } from 'react';
import { signInWithEmailAndPassword, createUserWithEmailAndPassword } from 'firebase/auth';
import { auth } from './firebase'; 
import { User, Key, ArrowRight, Sparkles } from 'lucide-react';
import { InfinityLogo } from './UIComponents';

export function LoginView({ onLoginSuccess, onGuestAccess }) {
  const [isRegistering, setIsRegistering] = useState(false);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault(); setError(''); setLoading(true);
    try {
      if (isRegistering) { await createUserWithEmailAndPassword(auth, email, password); } 
      else { await signInWithEmailAndPassword(auth, email, password); }
      onLoginSuccess();
    } catch (err) { setError('Credenciais inválidas. Tente novamente.'); } 
    finally { setLoading(false); }
  };

  return (
    <div className="min-h-screen bg-[#050508] flex flex-col items-center justify-center p-6 font-sans relative overflow-hidden">
      
      {/* Auras de fundo muito suaves e calmas */}
      <div className="absolute top-[-10%] left-[-10%] w-[60vw] h-[60vw] bg-cyan-800/10 rounded-full blur-[150px] pointer-events-none animate-[pulse_10s_ease-in-out_infinite_alternate]"></div>
      <div className="absolute bottom-[-10%] right-[-10%] w-[60vw] h-[60vw] bg-indigo-800/10 rounded-full blur-[150px] pointer-events-none animate-[pulse_12s_ease-in-out_infinite_alternate-reverse]"></div>

      <div className="w-full max-w-md relative z-10 animate-in fade-in slide-in-from-bottom-8 duration-1000 ease-out">
        
        {/* Cabeçalho Minimalista */}
        <div className="mb-10 flex flex-col items-center text-center">
          <InfinityLogo className="w-16 h-8 mb-6 text-white opacity-90" />
          <h1 className="text-2xl md:text-3xl font-black text-white tracking-widest uppercase mb-2 flex items-center gap-2">
             Manga <span className="text-cyan-400">Infinity</span>
          </h1>
          <p className="text-[10px] text-gray-500 font-bold tracking-[0.4em] uppercase flex items-center gap-2">
             <Sparkles className="w-3 h-3 text-cyan-400/50" /> Portal de Acesso
          </p>
        </div>

        {/* Card Suave e Elegante */}
        <div className="w-full bg-[#0a0a10]/60 backdrop-blur-2xl border border-white/[0.05] p-8 md:p-10 rounded-[2rem] shadow-[0_20px_50px_rgba(0,0,0,0.5)]">
          <form onSubmit={handleSubmit} className="space-y-5">
            
            <div className="relative group">
              <User className="absolute left-5 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500 group-focus-within:text-cyan-400 transition-colors duration-500" />
              <input type="email" placeholder="Endereço de Email" value={email} onChange={(e) => setEmail(e.target.value)} required className="w-full bg-white/[0.02] hover:bg-white/[0.04] border border-white/5 rounded-2xl py-4 pl-14 pr-4 text-xs font-medium tracking-wide text-white outline-none focus:bg-white/[0.05] focus:border-cyan-500/50 transition-all duration-300 placeholder:text-gray-600" />
            </div>
            
            <div className="relative group">
              <Key className="absolute left-5 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500 group-focus-within:text-cyan-400 transition-colors duration-500" />
              <input type="password" placeholder="Senha de Segurança" value={password} onChange={(e) => setPassword(e.target.value)} required className="w-full bg-white/[0.02] hover:bg-white/[0.04] border border-white/5 rounded-2xl py-4 pl-14 pr-4 text-xs font-medium tracking-wide text-white outline-none focus:bg-white/[0.05] focus:border-cyan-500/50 transition-all duration-300 placeholder:text-gray-600" />
            </div>

            {error && <p className="text-red-400 text-[10px] text-center font-bold tracking-widest bg-red-500/10 py-3 rounded-xl border border-red-500/20 animate-in fade-in">{error}</p>}

            <button type="submit" disabled={loading} className="w-full relative bg-white hover:bg-gray-200 text-black font-black text-[10px] uppercase tracking-[0.2em] py-4 rounded-2xl mt-4 transition-all duration-500 disabled:opacity-50 flex items-center justify-center gap-3 group/btn shadow-[0_0_20px_rgba(255,255,255,0.1)] hover:shadow-[0_0_30px_rgba(255,255,255,0.2)]">
              {loading ? 'Autenticando...' : (isRegistering ? 'Criar Identidade' : 'Iniciar Sessão')}
              {!loading && <ArrowRight className="w-4 h-4 group-hover/btn:translate-x-1 transition-transform duration-300" />}
            </button>
          </form>

          <div className="mt-8 flex flex-col items-center gap-5">
            <button onClick={() => setIsRegistering(!isRegistering)} className="text-[10px] text-gray-400 font-medium tracking-wider hover:text-white transition-colors duration-300">
              {isRegistering ? 'Já possui conta? Entrar' : 'Não possui conta? Cadastrar'}
            </button>
            <div className="w-full h-[1px] bg-gradient-to-r from-transparent via-white/10 to-transparent my-2"></div>
            <button onClick={onGuestAccess} className="text-[10px] text-cyan-500/80 font-bold uppercase tracking-widest hover:text-cyan-400 transition-colors duration-300">
              Continuar como Visitante
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
