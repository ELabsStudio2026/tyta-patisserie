"use client";

import { useCart } from "@/context/CartContext";

interface Product {
  id: string;
  name: string;
  price: number;
  image_url: string;
  category?: string;
}

interface ProductCardProps {
  product: Product;
  onOpenDetail: () => void;
}

export default function ProductCard({ product, onOpenDetail }: ProductCardProps) {
  const { addToCart } = useCart();

  return (
    <div 
      onClick={onOpenDetail} 
      className="group relative flex flex-col w-full animate-in fade-in duration-500 cursor-pointer"
    >
      {/* CONTENEDOR DE IMAGEN */}
      <div className="relative aspect-square overflow-hidden rounded-[2.5rem] shadow-sm bg-white border border-[#EDB2D1]/10">
        <img 
          src={product.image_url || '/images/placeholder.jpg'} 
          alt={product.name}
          className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
        />
        
        {/* BOTÓN DE COMPRA RÁPIDA */}
        <button 
          onClick={(e) => {
            e.preventDefault();
            e.stopPropagation();
            addToCart(product);
          }}
          className="group/btn absolute bottom-0 right-0 w-12 h-12 bg-[#2B4233] text-white flex items-center justify-center z-50 rounded-tl-2xl hover:bg-[#1a2b21] transition-colors shadow-lg"
        >
          <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-6 h-6">
            <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 10.5V6a3.75 3.75 0 1 0-7.5 0v4.5m11.356-1.993 1.263 12c.07.665-.45 1.243-1.119 1.243H4.25a1.125 1.125 0 0 1-1.12-1.243l1.264-12A1.125 1.125 0 0 1 5.513 7.5h12.974c.576 0 1.059.435 1.119 1.007ZM8.625 10.5a.375.375 0 1 1-.75 0 .375.375 0 0 1 .75 0Zm7.5 0a.375.375 0 1 1-.75 0 .375.375 0 0 1 .75 0Z" />
          </svg>

          {/* TOOLTIP ROSA CON LETRAS VERDES */}
          <div className="absolute right-full mr-3 px-3 py-1.5 bg-[#EDB2D1] text-[#2B4233] text-[7px] font-black uppercase tracking-[0.2em] rounded-full shadow-xl opacity-0 group-hover/btn:opacity-100 transition-all duration-300 pointer-events-none whitespace-nowrap translate-x-2 group-hover/btn:translate-x-0 border border-[#2B4233]/10">
            Añadir al carrito
          </div>
        </button>
      </div>

      {/* TEXTOS */}
      <div className="mt-4 text-center px-2">
        <h3 className="text-[10px] font-bold text-[#2B4233] uppercase leading-tight tracking-wider line-clamp-2 min-h-[2.5em]">
          {product.name}
        </h3>
        <p className="text-[11px] font-black text-[#EDB2D1] mt-1 italic">
          ${(product.price / 100).toLocaleString('es-AR')}
        </p>
      </div>
    </div>
  );
}