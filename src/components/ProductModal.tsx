"use client";

import { useState } from "react";
import { useCart } from "@/context/CartContext";

export default function ProductModal({ product, isOpen, onClose, allProducts }: any) {
  const { addToCart, openCart } = useCart();
  const [comboItem, setComboItem] = useState<any>(null); // Para manejar la pregunta del combo

  if (!isOpen || !product) return null;

  const suggestions = allProducts
    .filter((p: any) => p.id !== product.id)
    .filter((p: any) => {
      const cat = product.category?.toLowerCase() || "";
      const pCat = p.category?.toLowerCase() || "";
      if (cat.includes("torta") || cat.includes("bolleria") || cat.includes("macarrons")) return pCat.includes("cafeteria") || pCat.includes("bebidas");
      if (cat.includes("almuerzo") || cat.includes("sandwich")) return pCat.includes("bebidas") || pCat.includes("adicionales");
      return p.is_offer || p.is_new;
    }).slice(0, 3);

  // Función para manejar la respuesta del Combo
  const confirmCombo = (wantsBoth: boolean) => {
    if (wantsBoth) {
      addToCart(product); // El original
      addToCart(comboItem); // La sugerencia
    } else {
      addToCart(comboItem); // Solo la sugerencia
    }
    setComboItem(null);
    onClose();
    setTimeout(() => openCart(), 300);
  };

  return (
    <div className="fixed inset-0 z-[600] flex items-center justify-center p-2 md:p-6 animate-fade-in">
      <div className="absolute inset-0 bg-[#2B4233]/90 backdrop-blur-xl" onClick={onClose} />
      
      <div className="relative bg-[#FDFBF7] w-full max-w-5xl rounded-[3rem] shadow-2xl overflow-hidden flex flex-col md:flex-row border border-white/20">
        
        {/* PREGUNTA DE COMBO (Capa superior que aparece solo si clickean sugerencia) */}
        {comboItem && (
          <div className="absolute inset-0 z-[100] bg-[#2B4233]/95 flex flex-col items-center justify-center text-center p-8 animate-fade-in">
            <h3 className="font-diner text-4xl text-[#EDB2D1] uppercase mb-4 leading-none">¿Armamos el combo?</h3>
            <p className="text-white font-josefin text-sm mb-8 max-w-xs">¿Querés sumar también tu <b>{product.name}</b> para disfrutar la experiencia completa?</p>
            <div className="flex gap-4">
              <button onClick={() => confirmCombo(true)} className="px-10 py-3 bg-[#EDB2D1] text-[#2B4233] rounded-full font-black uppercase text-xs tracking-widest hover:scale-105 transition-transform cursor-pointer">SÍ, CLARO</button>
              <button onClick={() => confirmCombo(false)} className="px-10 py-3 border border-white/30 text-white rounded-full font-black uppercase text-xs tracking-widest hover:bg-white/10 transition-all cursor-pointer">NO, SOLO EL OTRO</button>
            </div>
          </div>
        )}

        <button onClick={onClose} className="absolute top-4 right-4 z-50 bg-[#EDB2D1] text-[#2B4233] w-9 h-9 rounded-full flex items-center justify-center font-bold shadow-lg hover:scale-110 transition-transform cursor-pointer">✕</button>
        
        <div className="w-full md:w-1/2 h-[280px] md:h-auto relative bg-gray-100 flex-none">
          <img src={product.image_url} className="w-full h-full object-cover" alt={product.name} />
        </div>

        <div className="w-full md:w-1/2 p-6 md:p-10 flex flex-col bg-white/40">
          <div className="flex-none text-center">
            <span className="text-[9px] font-black uppercase text-[#EDB2D1] tracking-[0.3em] mb-1.5 block">{product.category}</span>
            <h2 className="text-3xl md:text-4xl font-diner uppercase text-[#2B4233] leading-none mb-4">{product.name}</h2>
            <p className="text-[11px] md:text-xs text-[#2B4233]/70 font-josefin leading-relaxed max-w-sm mx-auto">{product.description}</p>
          </div>

          <div className="mt-6 md:mt-8 flex items-center justify-center gap-4 border-t border-[#EDB2D1]/10 pt-6">
            <p className="text-3xl font-black font-mono text-[#2B4233] leading-none">${(product.price / 100).toLocaleString('es-AR')}</p>
            <button onClick={() => { addToCart(product); onClose(); setTimeout(openCart, 300); }} className="px-8 py-3.5 bg-[#2B4233] text-white rounded-full font-black uppercase text-[10px] tracking-widest hover:bg-[#EDB2D1] hover:text-[#2B4233] transition-all shadow-xl cursor-pointer">Añadir al Carrito</button>
          </div>

          {suggestions.length > 0 && (
            <div className="mt-8 border-t border-[#EDB2D1]/20 pt-6 text-center">
              <h4 className="text-[10px] font-black uppercase tracking-[0.4em] text-[#2B4233]/40 mb-5 italic">Combina perfecto con</h4>
              <div className="grid grid-cols-3 gap-3 max-w-sm mx-auto">
                {suggestions.map((s: any) => (
                  <div key={s.id} onClick={() => setComboItem(s)} className="cursor-pointer group flex flex-col items-center">
                    <div className="aspect-square w-full rounded-xl overflow-hidden border border-gray-100 shadow-sm mb-2 bg-white"><img src={s.image_url} className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500" /></div>
                    <p className="text-[8px] font-josefin font-bold text-[#2B4233] line-clamp-1">{s.name}</p>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}