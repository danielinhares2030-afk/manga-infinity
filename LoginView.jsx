import React, { useState } from 'react';
import { signInWithEmailAndPassword, createUserWithEmailAndPassword } from 'firebase/auth';
import { auth } from './firebase'; 
import { User, Key, Lock, Infinity as InfIcon } from 'lucide-react';
import { InfinityLogo } from './UIComponents';

export function LoginView({ onLoginSuccess, onGuestAccess }) {
  const [isRegistering, setIsRegistering] = useState(false);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

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
      setError(err.message.replace('Firebase: ', ''));
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#010003] flex flex-col items-center justify-center p-4 font-sans relative overflow-hidden">
      
      {/* BACKGROUND SURREAL OTIMIZADO: Esferas gigantes animadas suavemente */}
      <div className="absolute top-[-20%] left-[-10%] w-[60vw] h-[60vw] bg-cyan-900/20 rounded-full blur-[80px] pointer-events-none"></div>
      <div className="absolute bottom-[-20%] right-[-10%] w-[60vw] h-[60vw] bg-fuchsia-900/20 rounded-full blur-[80px] pointer-events-none"></div>

      <div className="w-full max-w-md relative z-10 flex flex-col items-center">
        
        {/* Logo e Título */}
        <div className="mb-10 flex flex-col items-center">
          <InfinityLogo className="w-24 h-12 md:w-32 md:h-16 mb-6" />
          <h1 className="text-3xl md:text-4xl font-black text-white tracking-[0.2em]">
            MANGA-INFINITY
          </h1>
          <p className="text-[10px] text-fuchsia-500 uppercase tracking-[0.5em] font-black mt-2 text-center">
            Mergulhe no Incomensurável
          </p>
        </div>

        {/* Card do Formulário Surreal */}
        <div className="w-full bg-[#05030a] border border-cyan-900/50 p-8 rounded-[2.5rem] shadow-[0_30px_60px_rgba(0,0,0,1)] relative">
          
          {/* Borda Neon de Topo */}
          <div className="absolute top-0 left-1/2 -translate-x-1/2 w-1/2 h-[2px] bg-gradient-to-r from-transparent via-cyan-400 to-transparent"></div>

          <form onSubmit={handleSubmit} className="space-y-5">
            <div className="relative group">
              <User className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-cyan-600/60 group-focus-within:text-cyan-400 transition-colors" />
              <input 
                type="email" 
                placeholder="E-mail Cósmico" 
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                className="w-full bg-[#020105] border border-white/5 rounded-2xl py-4 pl-12 pr-4 text-sm text-white outline-none focus:border-cyan-500/80 transition-colors" 
              />
            </div>
            
            <div className="relative group">
              <Key className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-fuchsia-600/60 group-focus-within:text-fuchsia-400 transition-colors" />
              <input 
                type="password" 
                placeholder="Chave do Infinito" 
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                className="w-full bg-[#020105] border border-white/5 rounded-2xl py-4 pl-12 pr-4 text-sm text-white outline-none focus:border-fuchsia-500/80 transition-colors" 
              />
            </div>

            {error && <p className="text-red-500 text-xs text-center font-bold tracking-wider bg-red-950/40 py-2 rounded-lg">{error}</p>}

            <button 
              type="submit" 
              disabled={loading}
              className="w-full relative overflow-hidden bg-cyan-900 text-white font-black text-xs uppercase tracking-widest py-4 rounded-2xl mt-6 hover:bg-cyan-800 transition-colors disabled:opacity-50 flex items-center justify-center gap-2"
            >
              {loading ? 'Processando...' : (isRegistering ? 'Forjar Entidade' : 'Atravessar o Portal')}
              {!loading && <InfIcon className="w-4 h-4" />}
            </button>
          </form>

          {/* Links Auxiliares */}
          <div className="mt-8 flex flex-col items-center gap-4">
            <button 
              onClick={() => setIsRegistering(!isRegistering)}
              className="text-[10px] text-cyan-500 font-black uppercase tracking-widest hover:text-cyan-300 transition-colors text-center"
            >
              {isRegistering ? 'JÁ TEM A CHAVE? CONECTAR AGORA' : 'SEM REGISTRO? DESPERTAR AGORA'}
            </button>
            
            <button 
              onClick={onGuestAccess}
              className="text-[10px] text-zinc-500 font-black uppercase tracking-[0.1em] hover:text-white transition-colors text-center mt-2 border-b border-transparent hover:border-white pb-1"
            >
              VAGAR PELO INFINITO (ACESSO VISITANTE)
            </button>
          </div>

        </div>

        <div className="mt-12 flex items-center justify-center gap-2 text-cyan-900/50">
          <Lock className="w-3 h-3" />
          <span className="text-[9px] uppercase font-black tracking-[0.3em]">Conexão Blindada SSL</span>
        </div>

      </div>
    </div>
  );
}
