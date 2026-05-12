import React, { useState, useMemo } from 'react';
import { Search, Home, Library, User, Clock, ChevronRight } from 'lucide-react';
import { timeAgo } from './helpers';

export function HomeView({ mangas = [], onNavigate }) {
    const [activeCategory, setActiveCategory] = useState('Todos');

    const categories = ['Todos', 'Mangá', 'Manhwa', 'Manhua'];

    // Filtra os lançamentos com base na categoria selecionada
    const recentMangas = useMemo(() => {
        let result = [...mangas].sort((a, b) => b.createdAt - a.createdAt);
        
        if (activeCategory !== 'Todos') {
            const normalizedCategory = activeCategory.toLowerCase();
            result = result.filter(m => 
                (m.type && m.type.toLowerCase() === normalizedCategory) ||
                (m.genres && m.genres.some(g => g.toLowerCase() === normalizedCategory))
            );
        }
        return result;
    }, [mangas, activeCategory]);

    return (
        // Fundo principal escuro com texto claro (Alto Contraste)
        <div className="bg-[#121212] min-h-screen text-[#FAFAFA] font-sans pb-24 selection:bg-indigo-500/30">
            
            {/* CABEÇALHO SUPERIOR */}
            <header className="sticky top-0 z-40 bg-[#121212]/95 backdrop-blur-md border-b border-[#2A2A2A] px-4 py-4 flex items-center justify-between">
                <h1 className="text-2xl font-black tracking-tight text-[#FAFAFA]">
                    Manga<span className="text-indigo-500">App</span>
                </h1>
                <button 
                    className="p-2.5 bg-[#1E1E1E] rounded-xl border border-[#2A2A2A] hover:bg-[#2A2A2A] transition-colors focus:outline-none focus:ring-2 focus:ring-indigo-500"
                    aria-label="Buscar obras"
                >
                    <Search className="w-6 h-6 text-[#FAFAFA]" />
                </button>
            </header>

            <main className="max-w-5xl mx-auto px-4 py-6">
                
                {/* SEÇÃO: CATEGORIAS (Filtros em Chips) */}
                <section className="mb-8" aria-label="Categorias">
                    <div className="flex gap-3 overflow-x-auto pb-2 custom-scrollbar hide-scroll-indicator">
                        {categories.map(cat => (
                            <button
                                key={cat}
                                onClick={() => setActiveCategory(cat)}
                                className={`flex-shrink-0 px-6 py-3 rounded-full text-base font-bold transition-all border focus:outline-none focus:ring-2 focus:ring-indigo-500 ${
                                    activeCategory === cat 
                                    ? 'bg-indigo-600 text-white border-indigo-600 shadow-md' 
                                    : 'bg-[#1E1E1E] text-gray-300 border-[#2A2A2A] hover:border-gray-500'
                                }`}
                            >
                                {cat}
                            </button>
                        ))}
                    </div>
                </section>

                {/* SEÇÃO: ÚLTIMOS LANÇAMENTOS */}
                <section aria-labelledby="lancamentos-title">
                    <div className="flex items-center justify-between mb-6">
                        <h2 id="lancamentos-title" className="text-2xl font-black text-[#FAFAFA]">
                            Últimos Lançamentos
                        </h2>
                        <button className="flex items-center text-base font-bold text-indigo-400 hover:text-indigo-300 transition-colors">
                            Ver todos <ChevronRight className="w-5 h-5 ml-1" />
                        </button>
                    </div>

                    {/* GRADE DE CARTÕES (Grid baseado em múltiplos de 4px) */}
                    <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
                        {recentMangas.length > 0 ? recentMangas.map(manga => (
                            <article 
                                key={manga.id} 
                                onClick={() => onNavigate('details', manga)}
                                className="bg-[#1E1E1E] border border-[#2A2A2A] rounded-2xl overflow-hidden shadow-lg cursor-pointer hover:border-indigo-500 transition-all flex flex-col group"
                            >
                                {/* Imagem do Cartão */}
                                <div className="relative aspect-[4/3] sm:aspect-[3/4] overflow-hidden bg-[#121212]">
                                    <img 
                                        src={manga.coverUrl} 
                                        alt={`Capa de ${manga.title}`} 
                                        loading="lazy"
                                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500 opacity-90 group-hover:opacity-100" 
                                    />
                                    {manga.type && (
                                        <div className="absolute top-4 left-4 bg-[#121212]/80 backdrop-blur-md border border-[#2A2A2A] px-3 py-1.5 rounded-lg text-sm font-bold text-[#FAFAFA] uppercase tracking-wider">
                                            {manga.type}
                                        </div>
                                    )}
                                </div>
                                
                                {/* Conteúdo do Cartão com Hierarquia Tipográfica Clara */}
                                <div className="p-4 flex flex-col flex-1">
                                    {/* Título com tamanho 20px (text-xl) para destaque */}
                                    <h3 className="text-xl font-bold text-[#FAFAFA] leading-tight mb-2 line-clamp-2 group-hover:text-indigo-400 transition-colors">
                                        {manga.title}
                                    </h3>
                                    
                                    {/* Legendas/Descrições com tamanho 16px (text-base) e contraste reduzido */}
                                    <p className="text-base text-gray-400 font-medium mb-4 line-clamp-1">
                                        {manga.author || 'Autor Anônimo'}
                                    </p>
                                    
                                    <div className="mt-auto flex items-center text-base text-gray-400 font-medium">
                                        <Clock className="w-5 h-5 mr-2 text-gray-500" />
                                        {timeAgo(manga.createdAt)}
                                    </div>
                                </div>
                            </article>
                        )) : (
                            <div className="col-span-full py-16 text-center bg-[#1E1E1E] border border-[#2A2A2A] rounded-2xl">
                                <p className="text-xl text-gray-400 font-bold">Nenhum lançamento encontrado.</p>
                            </div>
                        )}
                    </div>
                </section>
            </main>

            {/* NAVEGAÇÃO INFERIOR FIXA (Padrão de App Mobile) */}
            <nav className="fixed bottom-0 w-full bg-[#121212]/95 backdrop-blur-md border-t border-[#2A2A2A] pb-safe z-50">
                <div className="max-w-md mx-auto flex items-center justify-around px-2 py-2">
                    <button className="flex flex-col items-center justify-center w-20 h-14 rounded-xl text-indigo-500 focus:outline-none">
                        <Home className="w-7 h-7 mb-1" />
                        <span className="text-[12px] font-bold">Início</span>
                    </button>
                    
                    <button className="flex flex-col items-center justify-center w-20 h-14 rounded-xl text-gray-400 hover:text-gray-200 focus:outline-none transition-colors">
                        <Library className="w-7 h-7 mb-1" />
                        <span className="text-[12px] font-bold">Biblioteca</span>
                    </button>
                    
                    <button className="flex flex-col items-center justify-center w-20 h-14 rounded-xl text-gray-400 hover:text-gray-200 focus:outline-none transition-colors">
                        <User className="w-7 h-7 mb-1" />
                        <span className="text-[12px] font-bold">Perfil</span>
                    </button>
                </div>
            </nav>

            {/* Estilos utilitários para scrollbar no mobile */}
            <style dangerouslySetInnerHTML={{__html: `
                .hide-scroll-indicator::-webkit-scrollbar { display: none; }
                .hide-scroll-indicator { -ms-overflow-style: none; scrollbar-width: none; }
                .pb-safe { padding-bottom: env(safe-area-inset-bottom); }
            `}} />
        </div>
    );
}
