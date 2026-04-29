import React, { useState } from 'react';
import { Library, BookOpen, Lock, Moon, Flame, Calendar, CheckCircle, Plus, Bookmark, Cloud } from 'lucide-react';
import { LIBRARY_STATUS } from './constants';

export function LibraryView({ mangas, user, libraryData, onNavigate, onRequireLogin, dataSaver }) {
  const [activeTab, setActiveTab] = useState("Lendo");

  // Mapeamento visual para as abas principais conforme a imagem
  const tabMapping = [
      { id: 'Lendo', label: 'Lendo', icon: BookOpen },
      { id: 'Planejo Ler', label: 'Planejo Ler', icon: Calendar },
      { id: 'Concluído', label: 'Finalizadas', icon: CheckCircle }
  ];

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

  // Filtra as obras da aba atual
  const libraryMangas = mangas.filter(m => libraryData[m.id] === activeTab);
  
  // Contadores para o painel "Sua Jornada"
  const countLendo = Object.values(libraryData).filter(s => s === 'Lendo').length;
  const countPlanejadas = Object.values(libraryData).filter(s => s === 'Planejo Ler').length;
  const countFinalizadas = Object.values(libraryData).filter(s => s === 'Concluído').length;
  const totalObras = Object.keys(libraryData).length;

  return (
    <div className="max-w-4xl mx-auto px-4 py-8 animate-in fade-in duration-500 relative z-10 font-sans">
      
      {/* CABEÇALHO IDÊNTICO À IMAGEM */}
      <div className="flex items-center gap-5 mb-8">
          <div className="w-16 h-16 rounded-[1.25rem] border border-red-500/30 flex items-center justify-center bg-[#080808] shadow-[0_0_20px_rgba(220,38,38,0.15)] flex-shrink-0">
              <Library className="w-7 h-7 text-red-500" strokeWidth={1.5} />
          </div>
          <div>
              <h2 className="text-3xl font-black text-white uppercase tracking-tighter">Sua Biblioteca</h2>
              <p className="text-[10px] text-red-500 font-black uppercase tracking-widest mt-1">As obras seladas pelo seu sangue.</p>
          </div>
      </div>

      {/* ABAS ARREDONDADAS */}
      <div className="flex gap-3 overflow-x-auto no-scrollbar w-full mb-8 pb-2 snap-x">
        {tabMapping.map(tab => {
          const count = Object.values(libraryData).filter(s => s === tab.id).length;
          const isActive = activeTab === tab.id;
          return (
            <button 
              key={tab.id} 
              onClick={() => setActiveTab(tab.id)} 
              className={`snap-start flex items-center gap-2 whitespace-nowrap font-black px-6 py-3.5 rounded-2xl text-[10px] uppercase tracking-widest transition-all duration-300 flex-shrink-0 border shadow-md
              ${isActive ? 'bg-gradient-to-r from-red-800 to-red-600 text-white border-transparent' : 'bg-[#0a0a0c] text-gray-500 border-white/5 hover:text-white hover:border-white/10'}`}
            >
              <tab.icon className="w-4 h-4" /> {tab.label}
              <span className={`px-2 py-0.5 rounded-md text-[10px] ml-1 transition-colors ${isActive ? 'bg-black/40 text-white' : 'bg-white/5 text-gray-600'}`}>
                  {count}
              </span>
            </button>
          )
        })}
      </div>

      {/* ÁREA DE CONTEÚDO (CARD COM BORDA TRACEJADA) */}
      <div className="bg-[#0a0a0c]/80 backdrop-blur-md rounded-3xl p-1.5 border border-white/5 mb-6 shadow-xl relative overflow-hidden">
          {libraryMangas.length === 0 ? (
             <div className="border border-white/5 border-dashed rounded-[1.25rem] py-16 px-4 flex flex-col items-center justify-center text-center animate-in zoom-in-95 duration-500 min-h-[350px]">
                {/* Ilustração da Lua com Nuvens */}
                <div className="relative w-32 h-32 flex items-center justify-center mb-6">
                    <div className="absolute inset-0 bg-red-600/20 blur-[40px] rounded-full"></div>
                    <Moon className="w-20 h-20 text-red-600 fill-red-600/10 drop-shadow-[0_0_15px_rgba(220,38,38,0.8)] relative z-10" strokeWidth={1} />
                    {/* Nuvens decorativas simuladas com ícones na base da lua */}
                    <Cloud className="absolute bottom-2 -left-2 w-14 h-14 text-[#0a0a0c] fill-[#0a0a0c] z-20 opacity-90" />
                    <Cloud className="absolute bottom-2 -right-2 w-16 h-16 text-[#0a0a0c] fill-[#0a0a0c] z-20 opacity-90" />
                    <Cloud className="absolute -bottom-2 left-6 w-12 h-12 text-[#0a0a0c] fill-[#0a0a0c] z-20 opacity-90" />
                    
                    {/* Estrelinhas simples */}
                    <div className="absolute top-4 left-2 w-1 h-1 bg-red-400 rounded-full animate-pulse"></div>
                    <div className="absolute top-10 right-0 w-1.5 h-1.5 bg-red-500 rounded-full animate-pulse delay-75"></div>
                    <div className="absolute top-20 -left-4 w-1 h-1 bg-red-400 rounded-full animate-pulse delay-150"></div>
                </div>

                <h3 className="text-white font-black text-lg uppercase tracking-widest mb-3">O vazio prevalece nas sombras.</h3>
                <p className="text-gray-400 text-sm font-medium mb-8">
                    Nenhuma obra foi selada como "{tabMapping.find(t => t.id === activeTab)?.label}".
                </p>
                <button onClick={() => onNavigate('catalog')} className="border border-red-600/40 text-red-500 hover:bg-red-600 hover:text-white px-8 py-3.5 rounded-2xl font-black text-[11px] uppercase tracking-widest transition-all flex items-center gap-2 shadow-[0_0_15px_rgba(220,38,38,0.1)]">
                    <Plus className="w-4 h-4" /> Explorar Catálogo
                </button>
             </div>
          ) : (
            <div className="border border-white/5 border-dashed rounded-[1.25rem] p-4 sm:p-6 min-h-[350px]">
                <div className="w-full grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
                  {libraryMangas.map(manga => (
                    <div key={manga.id} className="cursor-pointer group flex flex-col gap-2 relative" onClick={() => onNavigate('details', manga)}>
                      <div className={`relative aspect-[2/3] rounded-2xl overflow-hidden bg-[#050505] border border-white/5 shadow-md group-hover:border-red-600/50 group-hover:shadow-[0_8px_25px_rgba(220,38,38,0.2)] transition-all duration-300 ${dataSaver ? 'blur-[1px]' : ''}`}>
                        <img src={manga.coverUrl} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" onError={(e) => e.target.src = 'https://placehold.co/300x450/0A0A0C/dc2626?text=Oculto'} />
                        <div className="absolute inset-0 bg-gradient-to-t from-black via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                      </div>
                      <div className="px-1 text-center mt-1">
                          <h3 className="font-bold text-xs text-gray-200 line-clamp-2 group-hover:text-red-500 transition-colors">{manga.title}</h3>
                      </div>
                    </div>
                  ))}
                </div>
            </div>
          )}
      </div>

      {/* CARD: SUA JORNADA */}
      <div className="bg-[#0a0a0c] border border-white/5 rounded-3xl p-6 shadow-xl relative overflow-hidden">
          <h3 className="text-gray-300 font-black text-[10px] uppercase tracking-widest mb-6 flex items-center gap-2">
              <Bookmark className="w-4 h-4 text-red-600" /> Sua Jornada
          </h3>
          
          <div className="grid grid-cols-4 divide-x divide-white/5 text-center">
              <div className="flex flex-col items-center justify-center">
                  <BookOpen className="w-6 h-6 text-red-500 mb-2 drop-shadow-md" strokeWidth={1.5} />
                  <span className="text-xl sm:text-2xl font-black text-white">{countLendo}</span>
                  <span className="text-[8px] text-gray-500 font-bold uppercase tracking-widest mt-1">Lendo</span>
              </div>
              <div className="flex flex-col items-center justify-center">
                  <Calendar className="w-6 h-6 text-amber-500 mb-2 drop-shadow-md" strokeWidth={1.5} />
                  <span className="text-xl sm:text-2xl font-black text-white">{countPlanejadas}</span>
                  <span className="text-[8px] text-gray-500 font-bold uppercase tracking-widest mt-1">Planejadas</span>
              </div>
              <div className="flex flex-col items-center justify-center">
                  <CheckCircle className="w-6 h-6 text-emerald-500 mb-2 drop-shadow-md" strokeWidth={1.5} />
                  <span className="text-xl sm:text-2xl font-black text-white">{countFinalizadas}</span>
                  <span className="text-[8px] text-gray-500 font-bold uppercase tracking-widest mt-1">Finalizadas</span>
              </div>
              <div className="flex flex-col items-center justify-center">
                  <Flame className="w-6 h-6 text-blue-500 mb-2 drop-shadow-md" strokeWidth={1.5} />
                  <span className="text-xl sm:text-2xl font-black text-white">{totalObras}</span>
                  <span className="text-[8px] text-gray-500 font-bold uppercase tracking-widest mt-1">Total Obras</span>
              </div>
          </div>
      </div>
    </div>
  );
}
