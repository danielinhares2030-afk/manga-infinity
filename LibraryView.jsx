import React, { useState } from 'react';
import { Library, BookOpen, Lock, Moon, Flame } from 'lucide-react';
import { LIBRARY_STATUS } from './constants';

export function LibraryView({ mangas, user, libraryData, onNavigate, onRequireLogin, dataSaver }) {
  const [activeStatus, setActiveStatus] = useState("Lendo");

  // TELA PARA USUÁRIOS NÃO LOGADOS
  if (!user) {
    return (
      <div className="flex flex-col items-center justify-center py-32 animate-in fade-in duration-300 relative z-10 min-h-[70vh]">
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-64 h-64 bg-red-600/10 blur-[80px] rounded-full pointer-events-none"></div>
        <Lock className="w-16 h-16 text-red-900/50 mb-4 animate-pulse drop-shadow-[0_0_15px_rgba(220,38,38,0.5)]" />
        <h2 className="text-2xl font-black text-white mb-2 uppercase tracking-widest drop-shadow-md">Biblioteca Oculta</h2>
        <p className="text-gray-500 text-xs font-bold uppercase tracking-widest mb-8 text-center">Apenas ninjas registrados podem selar obras.</p>
        <button onClick={onRequireLogin} className="bg-gradient-to-r from-red-700 to-red-500 text-white font-black px-10 py-4 rounded-xl shadow-[0_0_20px_rgba(220,38,38,0.3)] hover:shadow-[0_0_25px_rgba(220,38,38,0.5)] hover:scale-105 transition-all duration-300 uppercase tracking-widest text-xs flex items-center gap-2">
            <Flame className="w-4 h-4" /> Alistar-se nas Sombras
        </button>
      </div>
    );
  }

  const libraryMangas = mangas.filter(m => libraryData[m.id] === activeStatus);

  return (
    <div className="max-w-7xl mx-auto px-4 py-8 animate-in fade-in duration-300 relative z-10">
      
      {/* CABEÇALHO */}
      <div className="flex items-center gap-4 mb-8 border-b border-red-900/30 pb-6">
          <div className="bg-[#0a0a0c] p-2.5 rounded-xl border border-red-600/30 shadow-[0_0_15px_rgba(220,38,38,0.2)] flex-shrink-0">
              <Library className="w-6 h-6 text-red-500" />
          </div>
          <div>
              <h2 className="text-2xl md:text-3xl font-black text-white uppercase tracking-tighter drop-shadow-md">Sua biblioteca</h2>
              <p className="text-[10px] sm:text-xs text-red-500/80 font-bold uppercase tracking-widest mt-1">As obras selados pelo seu sangue.</p>
          </div>
      </div>

      {/* PÍLULAS DE STATUS (Abas) */}
      <div className="flex gap-2 overflow-x-auto no-scrollbar w-full mb-8 pb-4">
        {LIBRARY_STATUS.map(status => {
          const count = Object.values(libraryData).filter(s => s === status).length;
          const isActive = activeStatus === status;
          return (
            <button 
              key={status} 
              onClick={() => setActiveStatus(status)} 
              className={`flex items-center gap-2 whitespace-nowrap font-black px-6 py-3 rounded-full text-[10px] uppercase tracking-widest transition-all duration-300 border flex-shrink-0 ${isActive ? 'bg-gradient-to-r from-red-600 to-red-800 text-white border-transparent shadow-[0_0_15px_rgba(220,38,38,0.4)]' : 'bg-[#0a0a0c]/80 text-gray-500 hover:text-white border-white/5 hover:border-red-600/30'}`}
            >
              {status} 
              <span className={`px-2 py-0.5 rounded-full text-[9px] ${isActive ? 'bg-black/40 text-white' : 'bg-white/5 text-gray-600'}`}>{count}</span>
            </button>
          )
        })}
      </div>

      {/* GRADE DE OBRAS OU MENSAGEM VAZIA */}
      {libraryMangas.length === 0 ? (
         <div className="flex flex-col items-center justify-center py-20 bg-[#0a0a0c]/50 rounded-3xl border border-white/5 border-dashed mt-8 shadow-inner">
            <Moon className="w-12 h-12 text-red-900/40 mb-4 animate-pulse" />
            <p className="text-gray-500 font-black text-xs uppercase tracking-widest text-center px-4 leading-relaxed">
                O vazio prevalece nas sombras.<br/> Nenhum obra foi selado como "{activeStatus}".
            </p>
        </div>
      ) : (
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-4 md:gap-5">
          {libraryMangas.map(manga => (
            <div key={manga.id} className="cursor-pointer group flex flex-col gap-2 relative" onClick={() => onNavigate('details', manga)}>
              <div className={`relative aspect-[2/3] rounded-2xl overflow-hidden bg-[#0a0a0c] border border-white/5 shadow-md group-hover:border-red-600/50 group-hover:shadow-[0_8px_25px_rgba(220,38,38,0.2)] transition-all duration-300 ${dataSaver ? 'blur-[1px]' : ''}`}>
                <img src={manga.coverUrl} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" onError={(e) => e.target.src = 'https://placehold.co/300x450/0A0A0C/dc2626?text=Oculto'} />
                <div className="absolute inset-0 bg-gradient-to-t from-black via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
              </div>
              <div className="px-1">
                  <h3 className="font-bold text-sm text-gray-200 line-clamp-2 leading-snug group-hover:text-red-500 transition-colors">{manga.title}</h3>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
