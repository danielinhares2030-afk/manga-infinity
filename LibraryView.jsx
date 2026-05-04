import React, { useState } from 'react';
import { Search, SlidersHorizontal, BookOpen, Heart, CheckCircle, PauseCircle, XCircle, MoreHorizontal, Bell, Lock, ChevronDown, ChevronLeft } from 'lucide-react';

export function LibraryView({ mangas, user, libraryData, onNavigate, onRequireLogin, dataSaver }) {
  const [activeTab, setActiveTab] = useState("Lendo");

  // Status mapping for tabs
  const tabMapping = [
      { id: 'Lendo', label: 'LENDO', icon: BookOpen },
      { id: 'Favoritos', label: 'FAVORITOS', icon: Heart },
      { id: 'Concluído', label: 'FINALIZADO', icon: CheckCircle },
      { id: 'Pausado', label: 'PAUSADO', icon: PauseCircle },
      { id: 'Abandonado', label: 'ABANDONADO', icon: XCircle }
  ];

  if (!user) {
    return (
      <div className="flex flex-col items-center justify-center py-32 bg-black min-h-screen text-white px-4">
        <Lock className="w-16 h-16 text-gray-800 mb-4" />
        <h2 className="text-xl font-bold mb-2">Acesso Restrito</h2>
        <p className="text-gray-500 text-xs mb-8">Faça login para salvar suas obras.</p>
        <button onClick={onRequireLogin} className="bg-red-600 text-white font-bold px-8 py-3 rounded-full text-sm">
            Entrar no Sistema
        </button>
      </div>
    );
  }

  // Filter mangas based on library status
  const libraryMangas = mangas.filter(m => libraryData[m.id] === activeTab || (activeTab === 'Lendo' && libraryData[m.id]));

  return (
    <div className="min-h-screen bg-black text-white font-sans pb-24 relative overflow-x-hidden">
      
      {/* HEADER */}
      <div className="px-4 pt-6 pb-2 flex items-center justify-between sticky top-0 bg-black/95 backdrop-blur-md z-40">
        <div>
            <h1 className="text-2xl font-black tracking-tighter">BIBLIOTECA</h1>
            <p className="text-[11px] text-gray-500">Suas obras salvas em tempo real.</p>
        </div>
        <div className="flex items-center gap-3">
            <button className="p-3 bg-[#111] rounded-full border border-white/5 text-gray-400 hover:text-white">
                <Search className="w-5 h-5" />
            </button>
            <button className="p-3 bg-[#111] rounded-full border border-white/5 text-gray-400 hover:text-white">
                <SlidersHorizontal className="w-5 h-5" />
            </button>
        </div>
      </div>

      {/* ROLABLE TABS */}
      <div className="flex overflow-x-auto no-scrollbar px-4 py-6 gap-4 border-b border-gray-900 snap-x">
        {tabMapping.map(tab => {
          const isActive = activeTab === tab.id;
          return (
            <button 
              key={tab.id} 
              onClick={() => setActiveTab(tab.id)} 
              className={`snap-start flex flex-col items-center gap-2 min-w-[70px] relative transition-all duration-300 pb-3
              ${isActive ? 'text-red-500' : 'text-gray-500 hover:text-gray-300'}`}
            >
              <div className={`p-4 rounded-full border ${isActive ? 'border-red-600 bg-red-950/20' : 'border-white/5 bg-[#111]'}`}>
                  <tab.icon className="w-5 h-5" strokeWidth={isActive ? 2.5 : 1.5} />
              </div>
              <span className={`text-[10px] font-bold uppercase tracking-wider ${isActive ? 'text-white' : 'text-gray-500'}`}>
                  {tab.label}
              </span>
              
              {isActive && (
                  <div className="absolute bottom-0 w-[120%] h-0.5 bg-red-600 rounded-t-full shadow-[0_0_10px_rgba(220,38,38,0.8)]"></div>
              )}
            </button>
          )
        })}
      </div>

      {/* CONTENT AREA */}
      <div className="px-4 pt-6">
          
          <div className="flex items-center justify-between mb-6 px-1">
              <h3 className="text-sm font-bold text-white">Status: <span className="text-red-500">{activeTab}</span></h3>
              <button className="text-xs text-gray-500 flex items-center gap-1.5 hover:text-white">
                  Editar <ChevronDown className="w-4 h-4" />
              </button>
          </div>

          {/* OBRAS LIST */}
          {libraryMangas.length === 0 ? (
             <div className="bg-[#0a0a0a] rounded-2xl py-16 px-4 flex flex-col items-center text-center border border-dashed border-gray-800">
                <BookOpen className="w-12 h-12 text-gray-800 mb-4" />
                <h3 className="text-white font-bold text-sm mb-2">Nenhuma obra encontrada</h3>
                <p className="text-gray-500 text-xs">Adicione mangás à sua lista de {activeTab.toLowerCase()} para vê-los aqui.</p>
             </div>
          ) : (
            <div className="flex flex-col gap-3">
                {libraryMangas.map((manga, idx) => {
                    const currentCap = manga.chapters?.length ? manga.chapters[0].number : 0;
                    const lastRead = currentCap > 2 ? currentCap - 2 : 0; // Simulando progresso
                    const progressPercent = currentCap > 0 ? Math.floor((lastRead / currentCap) * 100) : 0;

                    return (
                        <div key={manga.id} className="bg-[#0a0a0a] border border-white/5 rounded-2xl p-3 flex gap-4 relative cursor-pointer hover:border-gray-800 transition-colors" onClick={() => onNavigate('details', manga)}>
                            
                            {/* Capa */}
                            <div className="w-20 h-20 rounded-lg overflow-hidden bg-black flex-shrink-0">
                                <img src={manga.coverUrl} className="w-full h-full object-cover" />
                            </div>
                            
                            {/* Conteúdo */}
                            <div className="flex-1 flex flex-col justify-center pr-8">
                                <h4 className="text-sm font-bold text-white line-clamp-1 mb-1">{manga.title}</h4>
                                <p className="text-[10px] text-gray-400 mb-3">
                                    Total de Caps: {currentCap} • Último Lido: {lastRead}
                                </p>
                                
                                {/* Progress Bar */}
                                <div className="flex items-center gap-3">
                                    <div className="flex-1 h-1 bg-gray-800 rounded-full overflow-hidden">
                                        <div className="h-full bg-red-600 rounded-full" style={{ width: `${progressPercent}%` }}></div>
                                    </div>
                                    <span className="text-[10px] text-gray-400 font-medium w-6">{progressPercent}%</span>
                                </div>
                            </div>

                            {/* Ações Laterais */}
                            <div className="absolute right-3 top-3 bottom-3 flex flex-col justify-between items-end py-1">
                                <button className="p-1 text-gray-600 hover:text-white transition-colors">
                                    <MoreHorizontal className="w-5 h-5" />
                                </button>
                                <button className="p-1 text-gray-600 hover:text-red-500 transition-colors">
                                    <Bell className="w-4 h-4" />
                                </button>
                            </div>
                        </div>
                    );
                })}
            </div>
          )}

          {libraryMangas.length > 0 && (
              <button className="w-full mt-6 py-4 bg-[#111] border border-white/5 rounded-xl text-xs text-gray-400 font-medium flex items-center justify-center gap-2 hover:border-gray-800 hover:text-white transition-all">
                Ver todos <ChevronDown className="w-4 h-4" />
              </button>
          )}

      </div>
    </div>
  );
}
