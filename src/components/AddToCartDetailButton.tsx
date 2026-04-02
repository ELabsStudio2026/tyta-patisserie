"use client";

import { useState } from "react";
import { useCart } from "@/context/CartContext";

export default function AddToCartDetailButton({ product }: { product: any }) {
  const { addToCart, openCart } = useCart();
  const [quantity, setQuantity] = useState(1);
  const [isAdding, setIsAdding] = useState(false);

  const increment = () => setQuantity((q) => q + 1);
  const decrement = () => setQuantity((q) => (q > 1 ? q - 1 : 1));

  const handleAddToCart = () => {
    setIsAdding(true);
    
    // Ejecutamos la adición al carrito tantas veces como indique el contador
    // (Esto asegura compatibilidad sin tener que tocar el CartContext)
    for (let i = 0; i < quantity; i++) {
      addToCart(product);
    }

    // Un pequeño efecto visual de "Agregando..." y abrimos el carrito
    setTimeout(() => {
      setIsAdding(false);
      setQuantity(1); // Reseteamos el selector
      openCart();     // Desplegamos el carrito automáticamente
    }, 400);
  };

  // Si no hay stock, mostramos un botón deshabilitado
  if (!product.inStock) {
    return (
      <button disabled className="w-full mt-6 py-4 rounded-full bg-gray-100 text-gray-400 font-josefin font-bold uppercase tracking-widest cursor-not-allowed border border-gray-200">
        Producto Agotado
      </button>
    );
  }

  return (
    <div className="mt-6 flex flex-col sm:flex-row gap-4">
      
      {/* Selector de Cantidad */}
      <div className="flex items-center justify-between bg-[#FDFBF7] border border-gray-200 rounded-full px-2 py-2 sm:w-1/3 shadow-inner">
        <button 
          onClick={decrement}
          className="w-12 h-12 flex items-center justify-center text-[#2B4233] hover:text-[#EDB2D1] hover:bg-white rounded-full transition-all text-2xl font-medium shadow-sm border border-transparent hover:border-gray-100"
        >
          -
        </button>
        <span className="font-josefin font-bold text-xl text-[#2B4233] w-10 text-center select-none">
          {quantity}
        </span>
        <button 
          onClick={increment}
          className="w-12 h-12 flex items-center justify-center text-[#2B4233] hover:text-[#EDB2D1] hover:bg-white rounded-full transition-all text-2xl font-medium shadow-sm border border-transparent hover:border-gray-100"
        >
          +
        </button>
      </div>

      {/* Botón Principal de Agregar */}
      <button 
        onClick={handleAddToCart}
        disabled={isAdding}
        className={`flex-grow py-4 px-6 rounded-full font-josefin font-bold uppercase tracking-widest transition-all duration-300 shadow-md flex items-center justify-center gap-3 ${
          isAdding 
            ? "bg-[#2B4233] text-white scale-[0.98]" 
            : "bg-[#EDB2D1] text-[#2B4233] hover:bg-[#2B4233] hover:text-[#EDB2D1] hover:shadow-xl hover:-translate-y-1"
        }`}
      >
        {isAdding ? (
          "Agregando..."
        ) : (
          <>
            Agregar al pedido
            <span className="bg-white/30 px-2 py-0.5 rounded-md text-xs">
              {quantity}
            </span>
          </>
        )}
      </button>

    </div>
  );
}