"use client";

import Image from "next/image";
import { useCart } from "@/context/CartContext";

export default function CartDrawer() {
  const { cart, isCartOpen, closeCart, removeFromCart, updateQuantity, cartTotal, cartCount, clearCart } = useCart();

  // Formateador de precios
  const formatter = new Intl.NumberFormat("es-AR", {
    style: "currency",
    currency: "ARS",
    minimumFractionDigits: 0,
  });

  // --- LA MAGIA DEL WHATSAPP EMPIEZA ACÁ ---
  const handleWhatsAppCheckout = () => {
    // Reemplazar con el número real de Tyta
    const phoneNumber = "5491130302451"; 
    
    // Encabezado
    let message = "¡Hola Tyta! - Quería hacer el siguiente pedido:\n\n";
    
    // Lista de productos
    cart.forEach((item) => {
      message += `- ${item.quantity}x ${item.name} (${formatter.format(item.price * item.quantity)})\n`;
    });
    
    // Total y despedida
    message += `\n*Total estimado: ${formatter.format(cartTotal)}*\n\n`;
    message += "¡Quedo a la espera para coordinar el pago y la entrega. Gracias!";

    // Codificamos el texto para que WhatsApp lo entienda y abrimos pestaña nueva
    const whatsappUrl = `https://wa.me/${phoneNumber}?text=${encodeURIComponent(message)}`;
    window.open(whatsappUrl, '_blank');
  };
  // --- LA MAGIA DEL WHATSAPP TERMINA ACÁ ---

  return (
    <>
      {/* Fondo oscuro transparente (Overlay) */}
      <div 
        className={`fixed inset-0 bg-black/40 backdrop-blur-sm z-50 transition-opacity duration-300 ${isCartOpen ? "opacity-100 pointer-events-auto" : "opacity-0 pointer-events-none"}`}
        onClick={closeCart}
      />

      {/* Panel lateral derecho */}
      <div 
        className={`fixed top-0 right-0 h-full w-full sm:w-[400px] bg-[#FDFBF7] shadow-2xl z-50 transform transition-transform duration-500 ease-in-out flex flex-col ${isCartOpen ? "translate-x-0" : "translate-x-full"}`}
      >
        {/* Cabecera del Carrito */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200">
          <h2 className="font-diner text-3xl text-[#2B4233]">Tu Pedido</h2>
          <button onClick={closeCart} className="p-2 text-gray-400 hover:text-[#EDB2D1] transition-colors rounded-full hover:bg-white">
            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-6 h-6">
              <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
          {/* ESTE ES EL BOTÓN NUEVO (Solo se muestra si hay cosas en el carrito) */}
            {cartCount > 0 && (
              <button
                onClick={clearCart}
                className="text-xs font-josefin text-red-400 hover:text-red-600 underline transition-colors mt-1 self-start cursor-pointer"
              >
                Vaciar carrito
              </button>
            )}
        </div>

        {/* Lista de Productos */}
        <div className="flex-grow overflow-y-auto p-6 space-y-6">
          {cart.length === 0 ? (
            <div className="h-full flex flex-col items-center justify-center text-[#5E7361] space-y-4 opacity-70">
              <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1} stroke="currentColor" className="w-16 h-16">
                <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 10.5V6a3.75 3.75 0 10-7.5 0v4.5m11.356-1.993l1.263 12c.07.665-.45 1.243-1.119 1.243H4.25a1.125 1.125 0 01-1.119-1.243l1.263-12c.078-.744.704-1.293 1.456-1.293h12.302c.752 0 1.378.549 1.456 1.293z" />
              </svg>
              <p className="font-josefin text-lg">Tu carrito está vacío.</p>
            </div>
          ) : (
            cart.map((item) => (
              <div key={item.id} className="flex gap-4 items-center bg-white p-3 rounded-2xl border border-gray-100 shadow-sm">
                <div className="relative w-20 h-20 rounded-xl overflow-hidden shrink-0 border border-gray-50">
                  <Image 
                    src={item.image} 
                    alt={item.name} 
                    fill 
                    className="object-cover"
                    onError={(e) => {
                      e.currentTarget.src = '/images/placeholder.jpg';
                      e.currentTarget.srcset = '';
                    }}
                  />
                </div>
                <div className="flex-grow flex flex-col justify-between">
                  <div className="flex justify-between items-start">
                    <h3 className="font-diner text-xl text-[#2B4233] leading-none pr-2">{item.name}</h3>
                    <button onClick={() => removeFromCart(item.id)} className="text-gray-300 hover:text-red-400">
                      <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-5 h-5"><path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" /></svg>
                    </button>
                  </div>
                  <span className="font-josefin font-bold text-[#EDB2D1] text-sm">{formatter.format(item.price)}</span>
                  
                  {/* Controles de Cantidad */}
                  <div className="flex items-center gap-3 mt-2">
                    <button onClick={() => updateQuantity(item.id, item.quantity - 1)} className="w-6 h-6 rounded-full bg-gray-100 flex items-center justify-center hover:bg-[#EDB2D1] hover:text-white transition-colors">-</button>
                    <span className="font-josefin text-sm font-bold w-4 text-center">{item.quantity}</span>
                    <button onClick={() => updateQuantity(item.id, item.quantity + 1)} className="w-6 h-6 rounded-full bg-gray-100 flex items-center justify-center hover:bg-[#EDB2D1] hover:text-white transition-colors">+</button>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>

        {/* Footer del Carrito (Total y Checkout) */}
        {cart.length > 0 && (
          <div className="border-t border-gray-200 p-6 bg-white space-y-4">
            <div className="flex justify-between items-center font-josefin text-[#2B4233]">
              <span className="text-lg">Total estimado</span>
              <span className="text-2xl font-bold">{formatter.format(cartTotal)}</span>
            </div>
            
            {/* --- EL BOTÓN AHORA LLAMA A LA FUNCIÓN --- */}
            <button 
              onClick={handleWhatsAppCheckout}
              className="w-full bg-[#2B4233] text-white py-4 rounded-full font-josefin uppercase tracking-wider font-bold text-sm hover:bg-[#EDB2D1] transition-colors shadow-lg"
            >
              Iniciar Compra por WhatsApp
            </button>
          </div>
        )}
      </div>
    </>
  );
}
