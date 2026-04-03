"use client";

import { useCart } from "@/context/CartContext";

export default function CartDrawer() {
  const { cart, isCartOpen, closeCart, removeFromCart, updateQuantity, cartTotal, clearCart } = useCart();

  const formatter = new Intl.NumberFormat("es-AR", {
    style: "currency",
    currency: "ARS",
    minimumFractionDigits: 0,
  });

  const handleWhatsAppCheckout = () => {
    const phoneNumber = "5491130302451"; 
    let message = "¡Hola Tyta! - Quería hacer el siguiente pedido:\n\n";
    cart.forEach((item) => {
      message += `- ${item.quantity}x ${item.name} (${formatter.format(item.price * item.quantity / 100)})\n`;
    });
    message += `\n*Total estimado: ${formatter.format(cartTotal / 100)}*\n\n¡Gracias!`;
    window.open(`https://wa.me/${phoneNumber}?text=${encodeURIComponent(message)}`, '_blank');
  };

  return (
    <>
      <div 
        className={`fixed inset-0 bg-black/40 backdrop-blur-sm z-[700] transition-opacity ${isCartOpen ? "opacity-100" : "opacity-0 pointer-events-none"}`}
        onClick={closeCart}
      />

      <div className={`fixed top-0 right-0 h-full w-full sm:w-[400px] bg-[#FDFBF7] shadow-2xl z-[701] transform transition-transform duration-500 ${isCartOpen ? "translate-x-0" : "translate-x-full"} flex flex-col`}>
        
        <div className="p-6 border-b border-gray-200 flex justify-between items-center">
          <h2 className="font-diner text-3xl text-[#2B4233]">Tu Pedido</h2>
          <div className="flex items-center gap-4">
            {cart.length > 0 && <button onClick={clearCart} className="text-[10px] uppercase font-black text-red-400 underline">Vaciar</button>}
            <button onClick={closeCart} className="text-2xl">✕</button>
          </div>
        </div>

        <div className="flex-grow overflow-y-auto p-6 space-y-4 custom-scrollbar">
          {cart.length === 0 ? (
            <div className="h-full flex flex-col items-center justify-center opacity-30 italic">El carrito está esperando algo rico...</div>
          ) : (
            cart.map((item) => (
              <div key={item.id} className="flex gap-4 bg-white p-3 rounded-2xl shadow-sm border border-gray-50">
                <div className="w-16 h-16 rounded-xl overflow-hidden shrink-0">
                  {/* PROTECCIÓN CONTRA SRC VACÍO */}
                  <img 
                    src={item.image_url || item.image || '/images/placeholder.jpg'} 
                    alt={item.name} 
                    className="w-full h-full object-cover"
                    onError={(e) => { e.currentTarget.src = '/images/placeholder.jpg'; }}
                  />
                </div>
                <div className="flex-grow flex flex-col justify-between">
                  <h3 className="font-bold text-xs uppercase text-[#2B4233]">{item.name}</h3>
                  <div className="flex justify-between items-center mt-2">
                    <span className="text-[#EDB2D1] font-black text-xs">{formatter.format(item.price / 100)}</span>
                    <div className="flex items-center gap-3 bg-gray-50 rounded-full px-3 py-1">
                      <button onClick={() => updateQuantity(item.id, item.quantity - 1)} className="font-bold">-</button>
                      <span className="text-xs font-black">{item.quantity}</span>
                      <button onClick={() => updateQuantity(item.id, item.quantity + 1)} className="font-bold">+</button>
                    </div>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>

        {cart.length > 0 && (
          <div className="p-6 bg-white border-t border-gray-100 space-y-4">
            <div className="flex justify-between items-center">
              <span className="text-xs uppercase font-black opacity-40">Total</span>
              <span className="text-2xl font-black text-[#2B4233]">{formatter.format(cartTotal / 100)}</span>
            </div>
            <button onClick={handleWhatsAppCheckout} className="w-full bg-[#2B4233] text-white py-4 rounded-full font-black uppercase tracking-widest hover:bg-[#EDB2D1] transition-all shadow-lg">
              Confirmar Pedido
            </button>
          </div>
        )}
      </div>
    </>
  );
}