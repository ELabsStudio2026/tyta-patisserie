"use client";

import { useEffect, useRef, useState } from "react";

export default function MarketingPopup({ isOpen, onClose, products, onAddToCart }: any) {
  const scrollRef = useRef<HTMLDivElement>(null);
  const [isPaused, setIsPaused] = useState(false);

  useEffect(() => {
    if (!isOpen || isPaused || !scrollRef.current) return;

    const scrollContainer = scrollRef.current;
    let animationFrameId: number;

    const startScrolling = () => {
      if (scrollContainer) {
        scrollContainer.scrollLeft += 0.8; // Velocidad un toque más solemne

        // Reset cuando llega a la mitad (porque duplicamos la lista)
        if (scrollContainer.scrollLeft >= scrollContainer.scrollWidth / 2) {
          scrollContainer.scrollLeft = 0;
        }
      }
      animationFrameId = requestAnimationFrame(startScrolling);
    };

    animationFrameId = requestAnimationFrame(startScrolling);
    return () => cancelAnimationFrame(animationFrameId);
  }, [isOpen, isPaused, products]);

  if (!isOpen || !products || products.length === 0) return null;

  return (
    <div className="fixed inset-0 z-[500] flex items-center justify-center p-2 sm:p-4 animate-fade-in">
      {/* Fondo oscuro desenfocado */}
      <div className="absolute inset-0 bg-[#2B4233]/80 backdrop-blur-md" onClick={onClose} />
      
      {/* Contenedor principal - Ajustado al 94vh para asegurar que NO haya scroll */}
      <div className="relative bg-[#FDFBF7] w-full max-w-6xl max-h-[94vh] rounded-[3rem] shadow-2xl overflow-hidden flex flex-col border-t-[6px] border-[#EDB2D1]">
        
        {/* Botón Cerrar */}
        <button 
          onClick={onClose} 
          className="absolute top-4 right-4 z-[510] bg-white/50 text-[#2B4233] w-9 h-9 rounded-full flex items-center justify-center font-bold text-lg hover:bg-white transition-all shadow-sm"
        >
          ✕
        </button>

        {/* Contenido: Padding vertical mínimo para ganar espacio */}
        <div className="flex-1 flex flex-col pt-6 pb-2 px-4 md:px-8 text-center overflow-hidden">
          <span className="text-[9px] font-black uppercase tracking-[0.4em] text-[#EDB2D1] mb-1 block">Selección Especial</span>
          <h2 className="text-3xl md:text-5xl font-diner uppercase leading-none mb-4 text-[#2B4233]">Imperdibles de hoy</h2>
          
          {/* El Carrusel - snap-none y scrollbar oculto */}
          <div 
            ref={scrollRef}
            onMouseEnter={() => setIsPaused(true)}
            onMouseLeave={() => setIsPaused(false)}
            onTouchStart={() => setIsPaused(true)}
            onTouchEnd={() => setIsPaused(false)}
            className="flex-1 flex gap-4 md:gap-6 overflow-x-auto overflow-y-hidden pb-8 pt-2 no-scrollbar snap-none px-4 items-stretch select-none"
            style={{ scrollBehavior: 'auto' }}
          >
            {/* Duplicamos para el loop infinito perfecto */}
            {[...products, ...products].map((p: any, index: number) => (
              <div key={`${p.id}-${index}`} className="flex-none w-[170px] sm:w-[210px] md:w-[240px] group flex flex-col h-full">
                
                {/* Imagen Cuadrada - achicada un 5% para ganar aire */}
                <div className="relative aspect-square rounded-[1.2rem] md:rounded-[2rem] overflow-hidden mb-3 shadow-md border-2 border-white flex-none">
                  <img 
                    src={p.image_url} 
                    alt={p.name} 
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" 
                  />
                </div>
                
                <div className="flex flex-col flex-1">
                  <h4 className="text-[11px] md:text-xs font-bold text-[#2B4233] px-1 mb-0.5 line-clamp-1">{p.name}</h4>
                  <p className="text-[9px] md:text-[10px] font-black font-mono text-[#EDB2D1] mb-2">
                    ${(p.price/100).toLocaleString('es-AR')}
                  </p>
                  
                  <button 
                    onClick={() => onAddToCart(p)} 
                    className="mt-auto w-full py-2.5 bg-[#2B4233] text-white rounded-full text-[8px] font-black uppercase tracking-widest hover:bg-[#EDB2D1] hover:text-[#2B4233] transition-all transform active:scale-95 shadow-md"
                  >
                    Lo quiero
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      <style jsx>{`
        .no-scrollbar::-webkit-scrollbar { display: none; }
        .no-scrollbar { -ms-overflow-style: none; scrollbar-width: none; }
      `}</style>
    </div>
  );
}