"use client";

import { useCart } from "@/context/CartContext";

export default function ProductCard({ product, onOpenDetail, isDisabled }: any) {
  const { addToCart } = useCart();
  
  const isAgotado = product.stock <= 0;
  const isCritico = !isAgotado && product.stock <= (product.critical_stock || 5);
  // Bloqueo si tienda cerrada O sin stock
  const cannotBuy = isDisabled || isAgotado;

  return (
    <div className={`group relative flex flex-col w-full transition-all duration-500 overflow-hidden ${isAgotado ? 'opacity-60 grayscale' : ''}`}>
      
      {/* PUNTO 5: RIBBON DIAGONAL */}
      {(isCritico || product.is_new || isAgotado) && (
        <div className="absolute top-0 left-0 w-24 h-24 z-20 pointer-events-none overflow-hidden rounded-tl-[2.5rem]">
          <div className={`absolute transform -rotate-45 text-[7px] font-black uppercase text-center w-[140px] py-1 shadow-sm -left-[40px] top-[22px] 
            ${isAgotado ? 'bg-gray-800 text-white' : 
              isCritico ? 'bg-[#EDB2D1] text-[#2B4233] animate-pulse' : 
              'bg-[#2B4233] text-white'}`}>
            {isAgotado ? 'Agotado' : isCritico ? '¡Últimos!' : 'Nuevo'}
          </div>
        </div>
      )}

      <div className="relative aspect-square overflow-hidden rounded-[2.5rem] shadow-sm bg-white border border-[#EDB2D1]/10 cursor-pointer">
        <img 
          src={product.image_url || "/images/placeholder.jpg"} 
          onClick={onOpenDetail}
          className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105" 
          alt={product.name} 
        />
        
        {/* PUNTO 2: BOTÓN DE COMPRA RÁPIDA (Solo habilitado si tienda abierta) */}
        <button 
          onClick={(e) => {
            e.preventDefault(); e.stopPropagation();
            if (!cannotBuy) addToCart(product);
          }}
          disabled={cannotBuy}
          className={`absolute bottom-0 right-0 w-12 h-12 flex items-center justify-center z-30 rounded-tl-2xl transition-all shadow-lg
            ${cannotBuy ? 'bg-gray-100 text-gray-300' : 'bg-[#2B4233] text-white hover:bg-[#1a2b21]'}`}
        >
          <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-6 h-6">
            <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 10.5V6a3.75 3.75 0 1 0-7.5 0v4.5m11.356-1.993 1.263 12c.07.665-.45 1.243-1.119 1.243H4.25a1.125 1.125 0 0 1-1.12-1.243l1.264-12A1.125 1.125 0 0 1 5.513 7.5h12.974c.576 0 1.059.435 1.119 1.007ZM8.625 10.5a.375.375 0 1 1-.75 0 .375.375 0 0 1 .75 0Zm7.5 0a.375.375 0 1 1-.75 0 .375.375 0 0 1 .75 0Z" />
          </svg>
        </button>
      </div>

      <div className="mt-4 text-center px-2" onClick={onOpenDetail}>
        <h3 className="text-[10px] font-bold text-[#2B4233] uppercase leading-tight line-clamp-2 min-h-[2.5em]">
          {product.name}
        </h3>
        <p className="text-[11px] font-black text-[#EDB2D1] mt-1 italic">
          ${(product.price / 100).toLocaleString('es-AR')}
        </p>
      </div>
    </div>
  );
}