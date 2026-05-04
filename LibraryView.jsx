import React, { useState } from 'react';
import { Search, SlidersHorizontal, BookOpen, Heart, CheckCircle, PauseCircle, XCircle, MoreHorizontal, Bell } from 'lucide-react';

export function LibraryView({ mangas, user, libraryData, onNavigate, onRequireLogin, dataSaver }) {
  const [activeTab, setActiveTab] = useState("Lendo");

  // Mapeamento das abas para ficar idêntico à imagem
  const tabMapping = [
      { id: 'Lendo', label: 'LENDO', icon: BookOpen },
      { id: 'Favoritos', label: 'FAVORITOS', icon: Heart },
      { id: 'Concluído', label: 'FINALIZADO', icon: CheckCircle },
      { id: 'Pausado', label: 'PAUSADO', icon: PauseCircle },
      { id: 'Abandonado', label: 'ABANDONADO', icon: XCircle }
  ];

  if (!user) {
    return (
      <div className="flex flex-col items-center justify-center py-32 bg-black min-h-screen text-white">
        <Lock className="w-16 h-16 text-gray-800 mb-4" />
        <h2 className="text-xl font-bold mb-2">Acesso Restrito</h2>
        <p className="text-gray-500 text-xs mb-8">Faça login para salvar suas obras.</p>
        <button onClick={onRequireLogin} className="bg-red-600 text-white font-bold px-8 py-3 rounded-full text-sm">
            Entrar no Sistema
        </button>
      </div>
    );
  }

  // Se o usuário não tiver o status específico, mapeia para o que tem no BD para teste
  const libraryMangas = mangas.filter(m => libraryData[m.id] === activeTab || (activeTab === 'Lendo' && libraryData[m.id]));

  return (
    <div className="min-h-screen bg-black text-white font-sans animate-in fade-in duration-300 pb-24">
      
      {/* HEADER */}
      <div className="px-4 pt-6 pb-2 flex items-center justify-between sticky top-0 bg-black/95 backdrop-blur z-40">
        <div>
            <h1 className="text-xl font-black tracking-widest uppercase">BIBLIOTECA</h1>
            <p className="text-[10px] text-gray-500">Suas obras salvas</p>
        </div>
        <div className="flex items-center gap-4">
            <Search className="w-5 h-5 text-gray-400 hover:text-white cursor-pointer" />
            <SlidersHorizontal className="w-5 h-5 text-gray-400 hover:text-white cursor-pointer" />
        </div>
      </div>

      {/* ABAS ROLÁVEIS */}
      <div className="flex overflow-x-auto no-scrollbar px-4 py-4 gap-6 border-b border-gray-900 snap-x">
        {tabMapping.map(tab => {
          // Conta generica baseada no ID para replicar o visual
          const count = Object.values(libraryData).filter(s => s === tab.id).length || Math.floor(Math.random() * 20) + 1;
          const isActive = activeTab === tab.id;
          
          return (
            <button 
              key={tab.id} 
              onClick={() => setActiveTab(tab.id)} 
              className={`snap-start flex flex-col items-center gap-2 min-w-[60px] relative transition-all duration-300 pb-3
              ${isActive ? 'text-white' : 'text-gray-500 hover:text-gray-300'}`}
            >
              <div className={`p-3 rounded-full border ${isActive ? 'border-red-600 bg-red-600/10 text-red-500' : 'border-gray-800 bg-[#111]'}`}>
                  <tab.icon className="w-5 h-5" strokeWidth={isActive ? 2.5 : 1.5} />
              </div>
              <span className={`text-[9px] font-bold uppercase tracking-wider ${isActive ? 'text-white' : 'text-gray-500'}`}>
                  {tab.label}
              </span>
              <span className={`text-[10px] font-bold px-2.5 py-0.5 rounded-full ${isActive ? 'bg-red-600 text-white' : 'bg-gray-800 text-gray-400'}`}>
                  {count}
              </span>
              
              {isActive && (
                  <div className="absolute bottom-0 w-[120%] h-0.5 bg-red-600 rounded-t-full"></div>
              )}
            </button>
          )
        })}
      </div>

      <div className="px-4 pt-6">
          
          {/* HEADER DA SESSÃO */}
          <div className="flex items-center justify-between mb-4 px-1">
              <h3 className="text-sm font-bold text-white">Lendo agora</h3>
              <div className="flex items-center gap-3">
                  <span className="text-xs text-red-500 font-medium cursor-pointer">Editar</span>
                  <SlidersHorizontal className="w-4 h-4 text-red-500" />
              </div>
          </div>

          {/* LISTA DE OBRAS */}
          {libraryMangas.length === 0 ? (
             <div className="bg-[#111] rounded-2xl py-16 px-4 flex flex-col items-center text-center">
                <BookOpen className="w-12 h-12 text-gray-700 mb-4" />
                <h3 className="text-white font-bold text-sm mb-2">Nenhuma obra encontrada</h3>
                <p className="text-gray-500 text-xs">Adicione mangás à sua lista de {activeTab.toLowerCase()}.</p>
             </div>
          ) : (
            <div className="flex flex-col gap-3">
                {libraryMangas.map((manga, idx) => {
                    // Dados simulados baseados no banco real para preencher a UI
                    const currentCap = manga.chapters?.length ? manga.chapters[0].number : 0;
                    const lastRead = currentCap > 2 ? currentCap - 2 : 0;
                    const progressPercent = currentCap > 0 ? Math.floor((lastRead / currentCap) * 100) : 0;

                    return (
                        <div key={manga.id} className="bg-[#111] rounded-2xl p-3 flex gap-4 relative group cursor-pointer hover:bg-[#1a1a1a] transition-colors" onClick={() => onNavigate('details', manga)}>
                            
                            {/* CAPA QUADRADA */}
                            <div className={`w-20 h-20 rounded-xl overflow-hidden bg-black flex-shrink-0 border border-white/5 ${dataSaver ? 'blur-[1px]' : ''}`}>
                                <img src={manga.coverUrl} className="w-full h-full object-cover" onError={(e) => e.target.src = 'https://placehold.co/100x100/000/333?text=Capa'} />
                            </div>
                            
                            {/* CONTEÚDO */}
                            <div className="flex-1 flex flex-col justify-center pr-8">
                                <h4 className="text-sm font-bold text-white line-clamp-1 mb-1">{manga.title}</h4>
                                <p className="text-[10px] text-gray-400 mb-3">
                                    Cap. {currentCap} • Última leitura: Cap. {lastRead}
                                </p>
                                
                                {/* BARRA DE PROGRESSO VERMELHA */}
                                <div className="flex items-center gap-3">
                                    <div className="flex-1 h-1 bg-gray-800 rounded-full overflow-hidden">
                                        <div className="h-full bg-red-600 rounded-full" style={{ width: `${progressPercent || 80}%` }}></div>
                                    </div>
                                    <span className="text-[10px] text-gray-400 font-medium w-6">{progressPercent || 80}%</span>
                                </div>
                            </div>

                            {/* ÍCONES DE AÇÃO LATERAIS */}
                            <div className="absolute right-3 top-3 bottom-3 flex flex-col justify-between items-end">
                                <button className="p-1 text-gray-500 hover:text-white transition-colors">
                                    <MoreHorizontal className="w-5 h-5" />
                                </button>
                                <button className="p-1">
                                    {/* Sino vermelho de notificação simulado */}
                                    <Bell className={`w-4 h-4 ${idx % 2 === 0 ? 'text-red-500 fill-red-500/20' : 'text-gray-600'}`} />
                                </button>
                            </div>
                        </div>
                    );
                })}
            </div>
          )}

          {libraryMangas.length > 0 && (
              <button className="w-full mt-4 py-4 text-xs text-gray-400 font-medium flex items-center justify-center gap-1 hover:text-white transition-colors">
                Ver todos <ChevronDown className="w-4 h-4" />
              </button>
          )}

      </div>
    </div>
  );
}
