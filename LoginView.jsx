import React, { useState } from 'react';
import { signInWithEmailAndPassword, createUserWithEmailAndPassword } from 'firebase/auth';
import { auth } from './firebase'; 
import { User, Key, ArrowRight } from 'lucide-react';
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
    } catch (err) { setError('Acesso negado. Credenciais inválidas.'); } 
    finally { setLoading(false); }
  };

  return (
    <div className="min-h-screen bg-[#02040a] flex flex-col items-center justify-center p-4 font-sans relative overflow-hidden">
      
      <div className="absolute top-[-20%] left-[-10%] w-[70vw] h-[70vw] bg-cyan-600/10 rounded-full blur-[120px] pointer-events-none mix-blend-screen animate-[pulse_8s_ease-in-out_infinite_alternate]"></div>
      
      <div className="w-full max-w-sm flex flex-col items-center relative z-10 animate-in fade-in slide-in-from-bottom-8 duration-1000 ease-out">
        
        <div className="mb-10 flex flex-col items-center text-center">
          <InfinityLogo className="w-20 h-10 mb-6 text-cyan-400 opacity-80" />
          <h1 className="text-2xl md:text-3xl font-black text-white/90 tracking-wider mb-2 uppercase">
             Manga <span className="text-cyan-400">Infinity</span>
          </h1>
        </div>

        <div className="w-full bg-white/[0.03] backdrop-blur-2xl border border-white/10 p-8 md:p-10 rounded-3xl shadow-2xl">
          <form onSubmit={handleSubmit} className="space-y-5">
            <div className="relative group/input">
              <User className="absolute left-5 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500 group-focus-within/input:text-cyan-400 transition-colors" />
              <input type="email" placeholder="Identidade" value={email} onChange={(e) => setEmail(e.target.value)} required className="w-full bg-black/20 border border-white/5 rounded-2xl py-4 pl-14 pr-4 text-xs font-medium tracking-wider text-white outline-none focus:border-cyan-500/50 transition-all uppercase placeholder:text-gray-600 focus:bg-black/40" />
            </div>
            
            <div className="relative group/input">
              <Key className="absolute left-5 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500 group-focus-within/input:text-cyan-400 transition-colors" />
              <input type="password" placeholder="Chave de Acesso" value={password} onChange={(e) => setPassword(e.target.value)} required className="w-full bg-black/20 border border-white/5 rounded-2xl py-4 pl-14 pr-4 text-xs font-medium tracking-wider text-white outline-none focus:border-cyan-500/50 transition-all uppercase placeholder:text-gray-600 focus:bg-black/40" />
            </div>

            {error && <p className="text-red-400 text-[10px] text-center font-bold uppercase tracking-widest bg-red-500/10 py-3 rounded-xl border border-red-500/20">{error}</p>}

            <button type="submit" disabled={loading} className="w-full relative bg-cyan-500 hover:bg-cyan-400 text-black font-black text-[10px] uppercase tracking-[0.2em] py-4 rounded-2xl mt-6 transition-all duration-300 disabled:opacity-50 flex items-center justify-center gap-3 group/btn shadow-[0_0_15px_rgba(34,211,238,0.2)]">
              {loading ? 'Acessando...' : (isRegistering ? 'Criar Registro' : 'Entrar')}
              {!loading && <ArrowRight className="w-4 h-4 group-hover/btn:translate-x-1 transition-transform" />}
            </button>
          </form>

          <div className="mt-8 flex flex-col items-center gap-5">
            <button onClick={() => setIsRegistering(!isRegistering)} className="text-[10px] text-gray-400 font-medium uppercase tracking-wider hover:text-cyan-400 transition-colors">{isRegistering ? 'Já possui conta? Entrar' : 'Novo por aqui? Criar Conta'}</button>
            <button onClick={onGuestAccess} className="text-[10px] text-gray-500 font-medium uppercase tracking-wider hover:text-white transition-colors">Acesso Visitante</button>
          </div>
        </div>
      </div>
    </div>
  );
}
