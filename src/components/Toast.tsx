"use client";

import { useCart } from "@/context/CartContext";

export default function Toast() {
  const { toast } = useCart();

  return (
    <div 
      className={`fixed top-6 right-6 sm:top-8 sm:right-8 z-[100] transition-all duration-500 transform ${
        toast.visible ? "translate-y-0 opacity-100" : "-translate-y-12 opacity-0 pointer-events-none"
      }`}
    >
      <div className="bg-[#2B4233] text-[#FDFBF7] px-5 py-3 sm:px-6 sm:py-4 rounded-2xl shadow-2xl border-l-4 border-[#EDB2D1] flex items-center gap-4 min-w-[280px]">
        <div className="bg-[#EDB2D1] rounded-full p-1 shrink-0">
          <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={3} stroke="#2B4233" className="w-4 h-4 sm:w-5 sm:h-5">
            <path strokeLinecap="round" strokeLinejoin="round" d="M4.5 12.75l6 6 9-13.5" />
          </svg>
        </div>
        <p className="font-josefin font-bold text-xs sm:text-sm tracking-wide">
          {toast.message}
        </p>
      </div>
    </div>
  );
}
