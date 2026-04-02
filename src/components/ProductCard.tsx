"use client"; 

import Image from "next/image";
import Link from "next/link";
import { useState } from "react";
import { Product } from "@/data/products";
import { useCart } from "@/context/CartContext"; // IMPORTACIÓN DEL CARRITO

interface ProductCardProps {
  product: Product;
}

const ProductCard: React.FC<ProductCardProps> = ({ product }) => {
  const [imgSrc, setImgSrc] = useState(product.image);
  
  // EL HOOK VA ACÁ: Arriba, con los otros estados, antes del return
  const { addToCart } = useCart(); 

  const formatter = new Intl.NumberFormat("es-AR", {
    style: "currency",
    currency: "ARS",
    minimumFractionDigits: 0,
  });

  return (
    <div className="bg-white rounded-3xl shadow-sm hover:shadow-xl transition-shadow duration-300 overflow-hidden border border-gray-100 flex flex-col group h-full reveal-card">
      
      {/* --- CINTA DE SIN STOCK --- */}
      {!product.inStock && (
        <div className="absolute top-0 right-0 z-20 overflow-hidden w-32 h-32 pointer-events-none">
          <div className="absolute top-7 -right-8 w-[160px] py-1 bg-[#EDB2D1] text-[#2B4233] font-josefin font-bold text-[10px] uppercase tracking-[0.2em] text-center rotate-45 shadow-lg border-y border-[#2B4233]/10">
            Sin Stock
          </div>
        </div>
      )}

      <Link href={`/tienda/${product.id}`} className="flex flex-col flex-grow cursor-pointer">
        <div className="relative aspect-square w-full overflow-hidden bg-[#FDFBF7]">
          <Image
            src={imgSrc}
            alt={product.name}
            fill
            className="object-cover group-hover:scale-105 transition-transform duration-500"
            sizes="(max-w-7xl) 33vw, 25vw"
            onError={() => {
              setImgSrc('/images/placeholder.jpg'); 
            }}
          />
          <span className="absolute top-4 left-4 font-josefin bg-white/80 backdrop-blur-sm text-[#2B4233] text-[10px] uppercase tracking-widest px-3 py-1 rounded-full font-bold z-10">
            {product.category}
          </span>
        </div>

        <div className="p-6 flex flex-col flex-grow gap-2">
          <h3 className="font-diner text-3xl text-[#2B4233] leading-none group-hover:text-[#EDB2D1] transition-colors">
            {product.name}
          </h3>
          <p className="font-josefin text-sm text-[#5E7361] leading-relaxed line-clamp-2 flex-grow">
            {product.description || "Sin descripción disponible."}
          </p>
        </div>
      </Link>

      <div className="px-6 pb-6 pt-2 flex justify-between items-center mt-auto">
        <span className="font-josefin text-xl font-bold text-[#2B4233]">
          {formatter.format(product.price)}
        </span>
        
        {/* EL BOTÓN CON EL ONCLICK CONECTADO */}
        <button 
          onClick={() => addToCart(product)} 
          className="bg-[#EDB2D1] text-white p-3 rounded-full hover:bg-[#2B4233] transition-colors shadow-md hover:scale-110 transform"
          aria-label="Agregar al carrito"
        >
          <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-5 h-5">
            <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 10.5V6a3.75 3.75 0 10-7.5 0v4.5m11.356-1.993l1.263 12c.07.665-.45 1.243-1.119 1.243H4.25a1.125 1.125 0 01-1.119-1.243l1.263-12c.078-.744.704-1.293 1.456-1.293h12.302c.752 0 1.378.549 1.456 1.293z" />
          </svg>
        </button>
      </div>
    </div>
  );
};

export default ProductCard;
