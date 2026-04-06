"use client";

import { useCart } from "@/context/CartContext";

export default function CartDrawer({ storeStatus }: any) {
  const { cart, cartTotal, isCartOpen, closeCart, updateQuantity, clearCart } = useCart();

  if (!isCartOpen) return null;

  // IMPORTANTE: storeStatus.isClosed es lo que manda aquí
  const isBlocked = storeStatus?.isClosed || cart.length === 0;

  return (
    <div className="fixed inset-0 z-[700] flex justify-end font-josefin">
      <div className="absolute inset-0 bg-[#2B4233]/40 backdrop-blur-sm" />
      
      <div className="relative w-full max-w-md bg-[#FDFBF7] h-full shadow-2xl flex flex-col overflow-hidden animate-in slide-in-from-right duration-500">
        <button onClick={closeCart} className="absolute top-4 right-4 z-[800] bg-[#2B4233] text-white w-9 h-9 rounded-full flex items-center justify-center font-bold shadow-lg">✕</button>

        <div className="p-6 border-b border-[#EDB2D1]/10 bg-white flex justify-between items-end flex-none pr-16">
          <h2 className="font-diner text-4xl text-[#2B4233] uppercase leading-none tracking-tighter">Tu Pedido</h2>
          {cart.length > 0 && (
            <button onClick={clearCart} className="text-[9px] font-black uppercase text-red-300 mb-1">Vaciar</button>
          )}
        </div>

        <div className="flex-1 overflow-y-auto p-8 scrollbar-hide">
          {cart.length > 0 ? (
            <div className="space-y-6">
              {cart.map((item) => (
                <div key={item.id} className="flex gap-4 items-center">
                  <img src={item.image_url} className="w-14 h-14 rounded-full object-cover border border-[#EDB2D1]/10" alt={item.name} />
                  <div className="flex-1">
                    <h4 className="font-bold text-[10px] uppercase text-[#2B4233]">{item.name}</h4>
                    <div className="flex items-center gap-3 mt-2 bg-white px-2 py-1 rounded-full border border-gray-100 w-fit">
                      <button onClick={() => updateQuantity(item.id, item.quantity - 1)} className="text-[#EDB2D1] font-bold px-1">-</button>
                      <span className="text-[10px] font-black w-4 text-center">{item.quantity}</span>
                      <button onClick={() => updateQuantity(item.id, item.quantity + 1)} className="text-[#EDB2D1] font-bold px-1">+</button>
                    </div>
                  </div>
                  <span className="font-mono text-[10px] font-bold opacity-30">${((item.price * item.quantity) / 100).toLocaleString('es-AR')}</span>
                </div>
              ))}
              <button onClick={closeCart} className="w-full py-4 border border-dashed border-[#EDB2D1]/30 rounded-xl text-[9px] font-black uppercase text-[#EDB2D1] hover:bg-[#EDB2D1]/5 mt-4 tracking-widest">
                + Agregar más productos
              </button>
            </div>
          ) : (
            <div className="h-full flex flex-col justify-center items-center text-center opacity-40">
              <h3 className="font-diner text-3xl uppercase">Tu bandeja está vacía</h3>
              <button onClick={closeCart} className="mt-4 text-[9px] font-black uppercase border-b border-[#EDB2D1] pb-1 tracking-widest">Volver a la boutique</button>
            </div>
          )}
        </div>

        <div className="p-8 bg-white border-t border-gray-50 flex-none shadow-xl">
          <div className="flex justify-between items-end mb-6">
            <span className="text-[9px] font-black uppercase opacity-20 tracking-widest">Total del pedido</span>
            <span className="text-4xl font-black font-mono text-[#2B4233] tracking-tighter">${(cartTotal / 100).toLocaleString('es-AR')}</span>
          </div>

          {/* PUNTO 1: Cartel de tienda cerrada reactivo */}
          {storeStatus?.isClosed && (
            <div className="mb-4 p-4 rounded-2xl bg-[#FDFBF7] border border-[#EDB2D1]/20 text-center animate-in fade-in">
              <p className="text-[8px] font-black uppercase tracking-tighter text-[#2B4233]">Tienda Cerrada</p>
              <p className="text-[9px] italic leading-tight text-[#2B4233]/60 mt-1">No se aceptan pedidos por el momento.</p>
            </div>
          )}

          {/* PUNTO 1: El botón cambia de color y estado según storeStatus.isClosed */}
          <button 
            disabled={isBlocked}
            className={`w-full py-6 rounded-full font-black uppercase tracking-widest text-[11px] shadow-xl transition-all
              ${isBlocked 
                ? 'bg-gray-100 text-gray-300 cursor-not-allowed' 
                : 'bg-[#2B4233] text-[#EDB2D1] hover:bg-[#EDB2D1] hover:text-[#2B4233]'}`}
          >
            {storeStatus?.isClosed ? "Tienda Cerrada" : "Finalizar Pedido"}
          </button>
        </div>
      </div>
    </div>
  );
}