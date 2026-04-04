"use client";
import { useCart } from "@/context/CartContext";

export default function Toast() {
  const { toast } = useCart();

  if (!toast?.visible) return null;

  return (
    <div className="fixed bottom-10 left-1/2 -translate-x-1/2 z-[1000] bg-[#2B4233] text-[#EDB2D1] px-8 py-4 rounded-full font-black uppercase text-[10px] tracking-widest shadow-2xl animate-bounce">
      {toast.message}
    </div>
  );
}