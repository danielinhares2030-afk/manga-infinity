import React, { useState, useEffect } from 'react';
import { signInWithEmailAndPassword, createUserWithEmailAndPassword } from 'firebase/auth';
import { auth } from './firebase'; 
import { User, Key, Lock, ArrowRight } from 'lucide-react';
import { InfinityLogo } from './UIComponents';

export function LoginView({ onLoginSuccess, onGuestAccess }) {
  const [isRegistering, setIsRegistering] = useState(false);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    // Atrasa o mount para dar tempo da SplashScreen sumir e ele entrar deslizando com atitude
    const timer = setTimeout(() => setMounted(true), 2800);
    return () => clearTimeout(timer);
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      if (isRegistering) {
        await createUserWithEmailAndPassword(auth, email, password);
      } else {
        await signInWithEmailAndPassword(auth, email, password);
      }
      onLoginSuccess();
    } catch (err) {
      setError('Acesso Negado. A entidade não foi reconhecida no Vazio.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#020105] flex flex-col items-center justify-center p-4 font-sans relative overflow-hidden">
      
      {/* FUNDO OUSADO: Esferas agressivas de cor que se misturam */}
      <div className="absolute top-[-10%] left-[-10%] w-[50vw] h-[50vw] bg-cyan-600/20 rounded-full blur-[100px] pointer-events-none mix-blend-screen animate-[pulse_4s_infinite_alternate]"></div>
      <div className="absolute bottom-[-10%] right-[-10%] w-[50vw] h-[50vw] bg-fuchsia-600/20 rounded-full blur-[100px] pointer-events-none mix-blend-screen animate-[pulse_5s_infinite_alternate-reverse]"></div>

      <div className={`w-full max-w-md relative z-10 flex flex-col items-center transition-all duration-[1200ms] ease-[cubic-bezier(0.25,1,0.5,1)] ${mounted ? 'opacity-100 scale-100' : 'opacity-0 scale-95 translate-y-10'}`}>
        
        {/* Cabeçalho Atrevido */}
        <div className="mb-10 flex flex-col items-center text-center">
          <InfinityLogo className="w-28 h-14 mb-6 drop-shadow-[0_0_15px_rgba(34,211,238,0.5)]" />
          <h1 className="text-3xl md:text-4xl font-black text-white tracking-[0.1em] mb-1 uppercase drop-shadow-lg">
            Acesso <span className="text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 to-fuchsia-500">Prisma</span>
          </h1>
          <p className="text-[10px] text-cyan-500 font-black tracking-[0.4em] uppercase mt-2">
            Identifique-se para entrar
          </p>
        </div>

        {/* Formulário Glassmorphism Agressivo */}
        <div className="w-full bg-white/[0.02] backdrop-blur-xl border border-white/10 p-8 md:p-10 rounded-[2.5rem] shadow-[0_30px_60px_rgba(0,0,0,0.8),inset_0_0_20px_rgba(255,255,255,0.02)] relative group">
          
          <div className="absolute -inset-[1px] bg-gradient-to-b from-cyan-500/30 to-fuchsia-500/30 rounded-[2.5rem] blur opacity-0 group-hover:opacity-100 transition-opacity duration-700 -z-10"></div>

          <form onSubmit={handleSubmit} className="space-y-5">
            <div>
              <div className="relative group/input">
                <User className="absolute left-5 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-500 group-focus-within/input:text-cyan-400 transition-colors" />
                <input 
                  type="email" 
                  placeholder="E-mail" 
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  className="w-full bg-[#05030a] border border-white/5 rounded-2xl py-4 pl-14 pr-4 text-sm text-white outline-none focus:border-cyan-500/50 focus:bg-black transition-all shadow-inner" 
                />
              </div>
            </div>
            
            <div>
              <div className="relative group/input">
                <Key className="absolute left-5 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-500 group-focus-within/input:text-fuchsia-400 transition-colors" />
                <input 
                  type="password" 
                  placeholder="Senha" 
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  className="w-full bg-[#05030a] border border-white/5 rounded-2xl py-4 pl-14 pr-4 text-sm text-white outline-none focus:border-fuchsia-500/50 focus:bg-black transition-all shadow-inner" 
                />
              </div>
            </div>

            {error && <div className="bg-red-950/40 border border-red-500/30 p-3 rounded-xl"><p className="text-red-400 text-[10px] text-center font-black uppercase tracking-wider">{error}</p></div>}

            <button 
              type="submit" 
              disabled={loading}
              className="w-full relative overflow-hidden bg-white text-black hover:bg-transparent hover:text-white border border-transparent hover:border-white font-black text-xs uppercase tracking-widest py-4 rounded-2xl mt-6 transition-all duration-500 disabled:opacity-50 flex items-center justify-center gap-3 shadow-[0_0_20px_rgba(255,255,255,0.2)] hover:shadow-[0_0_30px_rgba(255,255,255,0.5)] group/btn"
            >
              {loading ? 'Sincronizando...' : (isRegistering ? 'Forjar Entidade' : 'Entrar no Sistema')}
              {!loading && <ArrowRight className="w-4 h-4 group-hover/btn:translate-x-1 transition-transform" />}
            </button>
          </form>

          {/* Links Inferiores */}
          <div className="mt-8 flex flex-col items-center gap-4">
            <button 
              onClick={() => setIsRegistering(!isRegistering)}
              className="text-[10px] text-gray-400 font-black uppercase tracking-widest hover:text-cyan-400 transition-colors"
            >
              {isRegistering ? 'Já possui a marca? Fazer login' : 'Desconhecido? Forje sua marca'}
            </button>
            
            <button 
              onClick={onGuestAccess}
              className="text-[10px] text-fuchsia-500/80 font-black uppercase tracking-[0.2em] hover:text-fuchsia-400 transition-colors border-b border-fuchsia-900/50 hover:border-fuchsia-400 pb-1"
            >
              Entrar como Fantasma (Visitante)
            </button>
          </div>

        </div>

        <div className="mt-12 flex items-center justify-center gap-2 text-cyan-900/50">
          <Lock className="w-3 h-3" />
          <span className="text-[9px] font-black tracking-[0.4em] uppercase">Conexão Criptografada</span>
        </div>

      </div>
    </div>
  );
}
