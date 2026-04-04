"use client";

import { useState } from "react";
import { useCart } from "@/context/CartContext";
import { supabase } from "@/lib/supabase";

export default function CartDrawer() {
  const { cart, cartTotal, isCartOpen, closeCart, updateQuantity, clearCart } = useCart();
  const [step, setStep] = useState<'cart' | 'confirm' | 'form'>('cart');
  
  const [customerData, setCustomerData] = useState({
    name: "",
    phone: "",
    delivery_type: "Retiro"
  });

  if (!isCartOpen) return null;

  const handleClose = () => {
    setStep('cart');
    closeCart();
  };

  const handleCheckout = async () => {
    if (!customerData.name || !customerData.phone) {
      alert("Por favor, completá tu nombre y teléfono.");
      return;
    }

    const ref = Math.random().toString(36).toUpperCase().substring(2, 7);

    try {
      const { error } = await supabase.from('orders').insert([{
        id: ref,
        customer_name: customerData.name,
        customer_phone: customerData.phone,
        items: cart,
        total: cartTotal,
        delivery_type: customerData.delivery_type,
        status: 'pendiente'
      }]);

      if (error) throw error;

      const detalle = cart.map(i => `• ${i.name} (x${i.quantity})`).join('\n');
      const totalF = (cartTotal / 100).toLocaleString('es-AR');
      
      const message = `🧁 *Tyta Patisserie • Nuevo Pedido*\n────────────────────\n*Ref:* ${ref}\n*Cliente:* ${customerData.name}\n\n*Detalle:*\n${detalle}\n\n💰 *Total: $ ${totalF}*\n*Modo:* ${customerData.delivery_type}\n────────────────────\n🔗 *Ticket:* https://tyta-patisserie.vercel.app/pedido/${ref}`;

      window.open(`https://wa.me/5491130302451?text=${encodeURIComponent(message)}`, '_blank');
      
      clearCart();
      setStep('cart');
      closeCart();
    } catch (err) {
      alert("Error al guardar el pedido.");
    }
  };

  return (
    <div className="fixed inset-0 z-[700] flex justify-end">
      <div className="absolute inset-0 bg-[#2B4233]/40 backdrop-blur-sm" />
      
      <div className="relative w-full max-w-md bg-[#FDFBF7] h-full shadow-2xl flex flex-col overflow-hidden">
        
        {/* HEADER COMPACTO */}
        <div className="p-6 border-b border-[#EDB2D1]/10 bg-white flex justify-between items-end flex-none">
          <h2 className="font-diner text-4xl text-[#2B4233] uppercase leading-none tracking-tighter">
            {step === 'cart' && "Pedido"}
            {step === 'confirm' && "Aviso"}
            {step === 'form' && "Datos"}
          </h2>
          {step === 'cart' && cart.length > 0 && (
            <button onClick={clearCart} className="text-[9px] font-black uppercase text-red-300 hover:text-red-500 mb-1">Vaciar</button>
          )}
        </div>

        {/* CUERPO CENTRAL */}
        <div className="flex-1 relative flex flex-col overflow-hidden">
          
          {/* PASO 1: CARRITO */}
          {step === 'cart' && (
            <div className="flex-1 overflow-y-auto p-8 space-y-6">
              {cart.map((item) => (
                <div key={item.id} className="flex gap-4 items-center">
                  <div className="w-14 h-14 rounded-full overflow-hidden border border-[#EDB2D1]/10 flex-none">
                    <img src={item.image_url || '/images/placeholder.jpg'} className="w-full h-full object-cover" />
                  </div>
                  <div className="flex-1">
                    <h4 className="font-bold text-[10px] uppercase tracking-wider text-[#2B4233] leading-tight">{item.name}</h4>
                    <div className="flex items-center gap-3 mt-2 bg-white px-2 py-1 rounded-full border border-gray-100 shadow-sm w-fit">
                      <button onClick={() => updateQuantity(item.id, item.quantity - 1)} className="text-[#EDB2D1] font-bold text-xs px-1">-</button>
                      <span className="text-[10px] font-black w-3 text-center">{item.quantity}</span>
                      <button onClick={() => updateQuantity(item.id, item.quantity + 1)} className="text-[#EDB2D1] font-bold text-xs px-1">+</button>
                    </div>
                  </div>
                  <span className="font-mono text-[10px] font-bold opacity-30">${(item.price/100).toLocaleString('es-AR')}</span>
                </div>
              ))}
              <button onClick={handleClose} className="w-full py-4 border border-dashed border-[#EDB2D1]/30 rounded-xl text-[9px] font-black uppercase text-[#EDB2D1] hover:bg-[#EDB2D1]/5 mt-4"> + Seguir Explorando </button>
            </div>
          )}

          {/* PASO 2: AVISO (FRASE +50% Y BOTONES -1/3) */}
          {step === 'confirm' && (
            <div className="flex-1 flex flex-col justify-center items-center p-10 text-center animate-in fade-in zoom-in-95">
              <div className="space-y-8 max-w-[300px]">
                <div className="h-[1px] w-8 bg-[#EDB2D1] mx-auto" />
                <p className="text-[#2B4233] text-[18px] font-medium italic opacity-80 leading-snug">
                  Para emitir tu ticket oficial y coordinar la entrega, requerimos tu Nombre y Apellido completos, N° de Teléfono y método de entrega. ¿Deseas continuar?
                </p>
                {/* BOTONES REDUCIDOS EN ALTURA (py-2.5) */}
                <div className="grid grid-cols-2 gap-3 pt-4">
                  <button onClick={() => setStep('form')} className="w-full py-2.5 bg-[#2B4233] text-[#EDB2D1] rounded-full font-black uppercase text-[10px] tracking-[0.4em] shadow-xl"> SI </button>
                  <button onClick={() => setStep('cart')} className="w-full py-2.5 border border-[#2B4233]/10 text-[#2B4233] rounded-full font-black uppercase text-[10px] tracking-[0.4em]"> NO </button>
                </div>
              </div>
            </div>
          )}

          {/* PASO 3: FORMULARIO */}
          {step === 'form' && (
            <div className="p-8 space-y-6 animate-in slide-in-from-right-4 overflow-y-auto flex-1">
              <div className="space-y-1">
                <label className="text-[8px] font-black uppercase opacity-30 tracking-[0.3em] ml-2">Nombre y Apellido completos</label>
                <input type="text" className="w-full bg-white border-b border-gray-100 p-4 outline-none focus:border-[#EDB2D1] italic text-sm"
                  onChange={(e) => setCustomerData({...customerData, name: e.target.value})} />
              </div>
              <div className="space-y-1">
                <label className="text-[8px] font-black uppercase opacity-30 tracking-[0.3em] ml-2">N° de Teléfono</label>
                <input type="tel" className="w-full bg-white border-b border-gray-100 p-4 outline-none focus:border-[#EDB2D1] italic text-sm"
                  onChange={(e) => setCustomerData({...customerData, phone: e.target.value})} />
              </div>
              <div className="space-y-1">
                <label className="text-[8px] font-black uppercase opacity-30 tracking-[0.3em] ml-2">Método de entrega</label>
                <select className="w-full bg-white border-b border-gray-100 p-4 outline-none text-sm italic"
                  onChange={(e) => setCustomerData({...customerData, delivery_type: e.target.value})}>
                  <option value="Retiro">Retiro por Boutique</option>
                  <option value="Envio">Envío a Domicilio</option>
                </select>
              </div>
            </div>
          )}
        </div>

        {/* FOOTER */}
        <div className="p-8 bg-white border-t border-gray-50 flex-none">
          <div className="flex justify-between items-end mb-6 px-2">
            <span className="text-[9px] font-black uppercase opacity-20 tracking-[0.3em]">Total Final</span>
            <span className="text-4xl font-black font-mono text-[#2B4233] tracking-tighter">${(cartTotal/100).toLocaleString('es-AR')}</span>
          </div>
          
          {step === 'cart' && cart.length > 0 && (
            <button onClick={() => setStep('confirm')} className="w-full py-6 bg-[#2B4233] text-[#EDB2D1] rounded-full font-black uppercase tracking-[0.5em] text-[11px]"> Confirmar </button>
          )}

          {step === 'form' && (
            <div className="flex flex-col gap-2">
              <button onClick={handleCheckout} className="w-full py-6 bg-[#EDB2D1] text-[#2B4233] rounded-full font-black uppercase tracking-[0.4em] text-[11px] shadow-2xl"> Enviar Pedido </button>
              <button onClick={() => setStep('confirm')} className="text-[8px] font-black uppercase opacity-30 text-center tracking-widest mt-1">Volver</button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}