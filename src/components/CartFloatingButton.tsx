"use client";

import { useCart } from "@/context/CartContext";

export default function CartFloatingButton() {
  const { cartCount, openCart, isCartOpen } = useCart();

  if (cartCount === 0 || isCartOpen) return null;

  return (
    <button
      onClick={openCart}
      // ACÁ ESTÁ EL CAMBIO: bottom-40 y left-10 para espejar al WhatsApp
      className="fixed bottom-40 left-6 sm:bottom-40 sm:left-10 bg-[#2B4233] text-white p-4 rounded-full shadow-2xl hover:scale-110 hover:bg-[#EDB2D1] transition-all duration-300 z-50 group animate-in fade-in zoom-in"
      aria-label="Ver mi pedido"
    >
      <svg
        xmlns="http://www.w3.org/2000/svg"
        fill="none"
        viewBox="0 0 24 24"
        strokeWidth={2}
        stroke="currentColor"
        className="w-7 h-7"
      >
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          d="M15.75 10.5V6a3.75 3.75 0 10-7.5 0v4.5m11.356-1.993l1.263 12c.07.665-.45 1.243-1.119 1.243H4.25a1.125 1.125 0 01-1.119-1.243l1.263-12c.078-.744.704-1.293 1.456-1.293h12.302c.752 0 1.378.549 1.456 1.293z"
        />
      </svg>

      <span className="absolute -top-1 -right-1 bg-[#EDB2D1] text-[#2B4233] text-[12px] font-bold h-6 w-6 rounded-full flex items-center justify-center border-2 border-[#FDFBF7] shadow-sm group-hover:bg-white transition-colors">
        {cartCount}
      </span>
      
      <span className="absolute left-full ml-4 px-3 py-1 bg-[#2B4233] text-white text-xs font-josefin rounded-lg opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap pointer-events-none shadow-md">
        Ver mi pedido
      </span>
    </button>
  );
}