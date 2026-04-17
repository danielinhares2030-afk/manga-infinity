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
    <div className="min-h-screen bg-[#030303] flex flex-col items-center justify-center p-4 font-sans relative overflow-hidden">
      <div className="w-full max-w-sm flex flex-col items-center relative z-10 animate-in fade-in slide-in-from-bottom-4 duration-700 ease-out">
        
        <div className="mb-12 flex flex-col items-center text-center">
          <InfinityLogo className="w-24 h-12 mb-6" />
          <h1 className="text-3xl md:text-4xl font-black text-white tracking-tighter mb-2 uppercase drop-shadow-md">
             Manga <span className="text-red-600">Infinity</span>
          </h1>
          <p className="text-[10px] text-gray-500 font-black tracking-[0.4em] uppercase">
            Acesso Restrito
          </p>
        </div>

        <div className="w-full bg-[#080808] border-t-4 border-red-600 p-8 md:p-10 shadow-2xl">
          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="relative group/input">
              <User className="absolute left-5 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-600 group-focus-within/input:text-red-500 transition-colors" />
              <input type="email" placeholder="Identidade" value={email} onChange={(e) => setEmail(e.target.value)} required className="w-full bg-[#030303] border border-gray-800 py-4 pl-14 pr-4 text-xs font-bold tracking-wider text-white outline-none focus:border-red-600 transition-colors uppercase placeholder:text-gray-700" />
            </div>
            
            <div className="relative group/input">
              <Key className="absolute left-5 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-600 group-focus-within/input:text-red-500 transition-colors" />
              <input type="password" placeholder="Chave de Ignição" value={password} onChange={(e) => setPassword(e.target.value)} required className="w-full bg-[#030303] border border-gray-800 py-4 pl-14 pr-4 text-xs font-bold tracking-wider text-white outline-none focus:border-red-600 transition-colors uppercase placeholder:text-gray-700" />
            </div>

            {error && <p className="text-red-500 text-[10px] text-center font-black uppercase tracking-widest bg-red-950/20 py-3 border border-red-900/50">{error}</p>}

            <button type="submit" disabled={loading} className="w-full relative bg-white text-black hover:bg-red-600 hover:text-white font-black text-[10px] uppercase tracking-[0.2em] py-5 mt-4 transition-colors duration-300 disabled:opacity-50 flex items-center justify-center gap-3 group/btn">
              {loading ? 'Sincronizando...' : (isRegistering ? 'Forjar Registro' : 'Conectar ao Sistema')}
              {!loading && <ArrowRight className="w-4 h-4 group-hover/btn:translate-x-2 transition-transform" />}
            </button>
          </form>

          <div className="mt-10 flex flex-col items-center gap-6">
            <button onClick={() => setIsRegistering(!isRegistering)} className="text-[9px] text-gray-500 font-black uppercase tracking-[0.2em] hover:text-white transition-colors">{isRegistering ? 'Já possui acesso? Entrar' : 'Não registrado? Criar ID'}</button>
            <button onClick={onGuestAccess} className="text-[9px] text-red-600/80 font-black uppercase tracking-[0.3em] hover:text-red-500 transition-colors">Modo Espectro (Visitante)</button>
          </div>
        </div>
      </div>
    </div>
  );
}
