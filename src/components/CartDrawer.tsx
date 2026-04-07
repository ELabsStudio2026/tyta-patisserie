"use client";

import { useState } from "react";
import { useCart } from "@/context/CartContext";
import { supabase } from "@/lib/supabase";
import { 
  generateOrderRef, 
  formatTytaWhatsAppMessage, 
  formatWhatsAppNumber 
} from "@/lib/order-utils";

export default function CartDrawer({ storeStatus }: any) {
  const { cart, cartTotal, isCartOpen, closeCart, updateQuantity, clearCart } = useCart();
  
  const [checkoutStep, setCheckoutStep] = useState(0); 
  const [showErrors, setShowErrors] = useState(false);
  const [customerData, setCustomerData] = useState({
    nombre: "",
    telefono: "",
    entrega: "Retiro por Boutique"
  });

  if (!isCartOpen) return null;

  const rawWhatsapp = storeStatus?.company_whatsapp || storeStatus?.whatsapp;
  const hasConfigError = !rawWhatsapp;
  const isBlocked = storeStatus?.isClosed || cart.length === 0 || hasConfigError;

  const finalizarPedido = async () => {
    if (!customerData.nombre || !customerData.telefono) {
      setShowErrors(true);
      return;
    }

    const ref = generateOrderRef();
    
    try {
      // 1. PRIMERO: VALIDAMOS STOCK (RPC)
      const { data: rpcResult, error: rpcError } = await supabase.rpc('process_order_and_update_stock', {
        p_customer_name: customerData.nombre,
        p_customer_phone: customerData.telefono,
        p_items: cart,
        p_total: cartTotal,
        p_delivery_type: customerData.entrega,
        p_order_id: ref
      });

      if (rpcError) throw rpcError;

      // Si falla el stock, avisamos y frenamos
      if (rpcResult !== 'success') {
        const mensajeFalla = "¡Ups! Otro usuario se te adelantó comprando el último " + rpcResult + ". \n\n¿Querés volver a la tienda o consultarle a Susana si puede conseguirte otro?";
        if (confirm(mensajeFalla)) {
            setCheckoutStep(0);
        } else {
            const cleanNum = formatWhatsAppNumber(rawWhatsapp);
            const msgConsulta = "Hola Susana, quería el producto " + rpcResult + " pero se acaba de agotar en la web. ¿Tendrás stock disponible de casualidad?";
            window.open("https://api.whatsapp.com/send?phone=" + cleanNum + "&text=" + encodeURIComponent(msgConsulta), '_blank');
        }
        return;
      }

      // 2. SEGUNDO: GUARDAMOS EL PEDIDO (Esto es lo que recuperamos del código viejo)
      // Esto hace que el link de seguimiento NO de error.
      const { error: insertError } = await supabase.from('orders').insert([{
        id: ref,
        customer_name: customerData.nombre,
        customer_phone: customerData.telefono,
        items: cart,
        total: cartTotal,
        delivery_type: customerData.entrega,
        status: 'pendiente'
      }]);

      if (insertError) throw insertError;

      // 3. TERCERO: ENVIAMOS WHATSAPP
      const cleanNumber = formatWhatsAppNumber(rawWhatsapp);
      const message = formatTytaWhatsAppMessage(
        customerData.nombre,
        ref,
        cart,
        cartTotal,
        customerData.entrega
      );

      const whatsappUrl = "https://api.whatsapp.com/send?phone=" + cleanNumber + "&text=" + encodeURIComponent(message);
      
      window.location.href = whatsappUrl;
      
      setCheckoutStep(0);
      closeCart();
      clearCart();

    } catch (err) {
      console.error("Error crítico:", err);
      alert("Hubo un detalle al procesar el pedido. Por favor, reintenta.");
    }
  };

  return (
    <div className="fixed inset-0 z-[700] flex justify-end font-josefin">
      <div className="absolute inset-0 bg-[#2B4233]/40 backdrop-blur-sm" onClick={closeCart} />
      
      <div className="relative w-full max-w-md bg-[#FDFBF7] h-full shadow-2xl flex flex-col overflow-hidden animate-in slide-in-from-right duration-500 text-[#2B4233]">
        
        {/* HEADER */}
        <div className="p-6 border-b border-[#EDB2D1]/10 bg-white flex justify-between items-end flex-none pr-16">
          <h2 className="font-diner text-4xl uppercase leading-none tracking-tighter">
            {checkoutStep === 0 ? "Tu Pedido" : checkoutStep === 1 ? "Aviso" : "Tus Datos"}
          </h2>
          {cart.length > 0 && checkoutStep === 0 && (
            <button onClick={clearCart} className="text-[9px] font-black uppercase text-[#EDB2D1] mb-1">Vaciar</button>
          )}
        </div>

        {/* CONTENIDO */}
        <div className="flex-1 overflow-y-auto p-8 scrollbar-hide">
          {checkoutStep === 0 && (
            <div className="space-y-6">
              {cart.map((item) => (
                <div key={item.id} className="flex gap-4 items-center">
                  <img src={item.image_url} className="w-14 h-14 rounded-full object-cover border border-[#EDB2D1]/10 shadow-sm" alt={item.name} />
                  <div className="flex-1 text-[#2B4233]">
                    <h4 className="font-bold text-[10px] uppercase">{item.name}</h4>
                    <div className="flex items-center gap-3 mt-2 bg-white px-2 py-1 rounded-full border border-gray-100 w-fit shadow-sm">
                      <button onClick={() => updateQuantity(item.id, item.quantity - 1)} className="text-[#EDB2D1] font-bold px-1">-</button>
                      <span className="text-[10px] font-black w-4 text-center">{item.quantity}</span>
                      <button onClick={() => updateQuantity(item.id, item.quantity + 1)} className="text-[#EDB2D1] font-bold px-1">+</button>
                    </div>
                  </div>
                  <span className="font-mono text-[10px] font-bold opacity-30">${((item.price * item.quantity) / 100).toLocaleString('es-AR')}</span>
                </div>
              ))}
            </div>
          )}

          {checkoutStep === 1 && (
            <div className="h-full flex flex-col items-center justify-center text-center animate-in fade-in zoom-in-95">
              <h2 className="font-diner text-6xl uppercase mb-8">AVISO</h2>
              <div className="w-8 h-[1px] bg-[#EDB2D1] mb-8" />
              <p className="italic text-[14px] leading-relaxed text-[#2B4233]/70 mb-12 max-w-[240px]">
                Para emitir tu ticket oficial y coordinar la entrega, requerimos tu Nombre y Apellido completos, N° de Teléfono y método de entrega.
                <span className="block mt-6 font-bold not-italic">¿Deseas continuar?</span>
              </p>
              <div className="flex gap-4 w-full max-w-[280px]">
                <button onClick={() => setCheckoutStep(2)} className="flex-1 py-4 bg-[#2B4233] text-[#EDB2D1] rounded-full font-black text-[10px] tracking-widest uppercase">SÍ</button>
                <button onClick={() => setCheckoutStep(0)} className="flex-1 py-4 bg-white text-gray-300 border border-gray-100 rounded-full font-black text-[10px] tracking-widest uppercase">NO</button>
              </div>
            </div>
          )}

          {checkoutStep === 2 && (
            <div className="space-y-8 animate-in slide-in-from-right">
              <div className="flex justify-between items-center mb-10">
                <h2 className="font-diner text-5xl uppercase font-black">DATOS</h2>
                <button onClick={() => {setCheckoutStep(1); setShowErrors(false);}} className="text-[9px] font-black uppercase text-[#2B4233]/40 tracking-widest">← Volver</button>
              </div>
              <div>
                <label className="text-[8px] font-black uppercase tracking-widest mb-2.5 block text-[#2B4233]/50">Nombre y Apellido</label>
                <input value={customerData.nombre} onChange={e => {setCustomerData({...customerData, nombre: e.target.value}); setShowErrors(false);}} className={`w-full px-5 py-4 rounded-2xl border shadow-[inset_0_2px_4px_rgba(0,0,0,0.02)] outline-none text-sm font-josefin bg-white ${showErrors && !customerData.nombre ? 'border-[#EDB2D1] bg-[#FDFBF7]' : 'border-gray-100'}`} />
              </div>
              <div>
                <label className="text-[8px] font-black uppercase tracking-widest mb-2.5 block text-[#2B4233]/50">N° de Teléfono</label>
                <input type="tel" value={customerData.telefono} onChange={e => {setCustomerData({...customerData, telefono: e.target.value}); setShowErrors(false);}} className={`w-full px-5 py-4 rounded-2xl border shadow-[inset_0_2px_4px_rgba(0,0,0,0.02)] outline-none text-sm font-josefin bg-white ${showErrors && !customerData.telefono ? 'border-[#EDB2D1] bg-[#FDFBF7]' : 'border-gray-100'}`} />
              </div>
              <div>
                <label className="text-[8px] font-black uppercase tracking-widest text-[#2B4233]/50 block mb-2.5 font-bold">Método de entrega</label>
                <div className="relative">
                  <select value={customerData.entrega} onChange={e => setCustomerData({...customerData, entrega: e.target.value})} className="w-full px-5 py-4 rounded-2xl border border-gray-100 bg-white shadow-[inset_0_2px_4px_rgba(0,0,0,0.02)] outline-none text-sm font-josefin appearance-none cursor-pointer">
                    <option>Retiro por Boutique</option>
                    <option>Envío a domicilio</option>
                  </select>
                  <span className="absolute right-5 top-1/2 -translate-y-1/2 text-[#EDB2D1] pointer-events-none text-[10px]">▼</span>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* FOOTER */}
        <div className="p-8 bg-white border-t border-gray-50 flex-none shadow-xl">
          <div className="flex justify-between items-baseline mb-6 px-1">
            <span className="text-[10px] font-black uppercase opacity-20 tracking-widest">Total Final</span>
            <span className="text-4xl font-black font-mono tracking-tighter text-[#2B4233]">${(cartTotal / 100).toLocaleString('es-AR')}</span>
          </div>
          
          {checkoutStep === 0 && (
            <button disabled={isBlocked} onClick={() => setCheckoutStep(1)} className={`w-full py-6 rounded-full font-black uppercase tracking-widest text-[11px] shadow-xl ${isBlocked ? 'bg-gray-100 text-gray-300' : 'bg-[#2B4233] text-[#EDB2D1]'}`}>
              {storeStatus?.isClosed ? "Tienda Cerrada" : "Finalizar Pedido"}
            </button>
          )}

          {checkoutStep === 2 && (
            <button onClick={finalizarPedido} className="w-full py-6 rounded-full font-black text-[11px] tracking-widest uppercase shadow-xl bg-[#2B4233] text-[#EDB2D1] active:scale-95 transition-all">
              FINALIZAR Y ENVIAR
            </button>
          )}
        </div>
      </div>
    </div>
  );
}