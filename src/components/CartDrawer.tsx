"use client";

import { useState } from "react";
import { useCart } from "@/context/CartContext";
import { supabase } from "@/lib/supabase";
import { useTytaAlert } from "@/lib/useTytaAlert";
import TytaAlert from "@/components/ui/TytaAlert";
import { 
  generateOrderRef, 
  formatTytaWhatsAppMessage, 
  formatWhatsAppNumber 
} from "@/lib/order-utils";

export default function CartDrawer({ storeStatus }: any) {
  const { cart, cartTotal, isCartOpen, closeCart, updateQuantity, clearCart } = useCart();
  
  const { alert, showAlert, closeAlert } = useTytaAlert();
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

  const manejarAvancePedido = () => {
    if (cart.length === 0) {
      showAlert("info", "TU BOLSA ESTÁ VACÍA", "Aún no has sumado ninguna delicia para llevar.");
      return;
    }

    showAlert(
      "danger", 
      "AVISO", 
      "Para emitir tu ticket oficial y coordinar la entrega, requerimos tu Nombre y Apellido completos, N° de Teléfono y método de entrega.",
      () => setCheckoutStep(2)
    );
  };

  const finalizarPedido = async () => {
    if (!customerData.nombre || !customerData.telefono) {
      setShowErrors(true);
      return;
    }

    const ref = generateOrderRef();
    
    try {
      const { data: rpcResult, error: rpcError } = await supabase.rpc('process_order_and_update_stock', {
        p_customer_name: customerData.nombre,
        p_customer_phone: customerData.telefono,
        p_items: cart,
        p_total: cartTotal,
        p_delivery_type: customerData.entrega,
        p_order_id: ref
      });

      if (rpcError) throw rpcError;

      if (rpcResult !== 'success') {
        showAlert(
          "danger",
          "STOCK AGOTADO",
          `¡Ups! Alguien se adelantó comprando el último ${rpcResult}. ¿Deseas consultar disponibilidad manual?`,
          () => {
            const cleanNum = formatWhatsAppNumber(rawWhatsapp);
            const msg = `Hola Susana, quería ${rpcResult} pero se agotó en la web. ¿Tendrás stock de casualidad?`;
            window.open(`https://api.whatsapp.com/send?phone=${cleanNum}&text=${encodeURIComponent(msg)}`, '_blank');
          }
        );
        setCheckoutStep(0);
        return;
      }

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

      const cleanNumber = formatWhatsAppNumber(rawWhatsapp);
      const message = formatTytaWhatsAppMessage(customerData.nombre, ref, cart, cartTotal, customerData.entrega);
      window.location.href = `https://api.whatsapp.com/send?phone=${cleanNumber}&text=${encodeURIComponent(message)}`;
      
      setCheckoutStep(0);
      closeCart();
      clearCart();

    } catch (err) {
      console.error("Error crítico:", err);
      showAlert("warning", "DETALLE TÉCNICO", "Hubo un detalle al procesar el pedido. Por favor, reintenta.");
    }
  };

  return (
    <div className="fixed inset-0 z-[700] flex justify-end font-josefin text-[#2B4233]">
      <div className="absolute inset-0 bg-[#2B4233]/40 backdrop-blur-sm" onClick={closeCart} />
      
      <div className="relative w-full max-w-md bg-[#FDFBF7] h-full shadow-2xl flex flex-col overflow-hidden animate-in slide-in-from-right duration-500">
        
        {/* HEADER - X EN TAMAÑO 5XL Y VACIAR A SU IZQUIERDA */}
        <div className="p-6 border-b border-[#EDB2D1]/10 bg-white flex justify-between items-center flex-none">
          <h2 className="font-diner text-4xl uppercase leading-none tracking-tighter text-[#2B4233]">
            {checkoutStep === 0 ? "Tu Pedido" : "Tus Datos"}
          </h2>

          <div className="flex items-center gap-6">
            {cart.length > 0 && checkoutStep === 0 && (
              <button 
                onClick={clearCart} 
                className="text-[9px] font-black uppercase text-[#EDB2D1] tracking-[0.2em] hover:text-[#2B4233] transition-colors"
              >
                Vaciar Carrito
              </button>
            )}

            <button 
              onClick={closeCart} 
              className="text-5xl leading-none text-gray-300 hover:text-[#2B4233] transition-all duration-300 translate-y-[-2px]"
            >
              ×
            </button>
          </div>
        </div>

        {/* CONTENIDO */}
        <div className="flex-1 overflow-y-auto p-8 scrollbar-hide">
          {checkoutStep === 0 && (
            <div className="space-y-6">
              {cart.map((item) => (
                <div key={item.id} className="flex gap-4 items-center animate-in fade-in duration-300">
                  <img src={item.image_url} className="w-14 h-14 rounded-full object-cover border border-[#EDB2D1]/10 shadow-sm" alt={item.name} />
                  <div className="flex-1">
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
              {cart.length === 0 && (
                <div className="h-full flex flex-col items-center justify-center opacity-30 pt-20">
                  <span className="text-4xl mb-4">🧁</span>
                  <p className="uppercase text-[9px] font-black tracking-widest">Bolsa vacía</p>
                </div>
              )}
            </div>
          )}

          {checkoutStep === 2 && (
            <div className="space-y-8 animate-in slide-in-from-right">
              <div className="flex justify-between items-center mb-10">
                <h2 className="font-diner text-5xl uppercase font-black">DATOS</h2>
                <button 
                  onClick={() => {setCheckoutStep(0); setShowErrors(false);}} 
                  className="text-[9px] font-black uppercase text-[#2B4233]/40 tracking-widest"
                >
                  ← Volver
                </button>
              </div>
              <div className="space-y-6">
                <div>
                  <label className="text-[8px] font-black uppercase tracking-widest mb-2 block opacity-50">Nombre y Apellido</label>
                  <input value={customerData.nombre} onChange={e => {setCustomerData({...customerData, nombre: e.target.value}); setShowErrors(false);}} className={`w-full px-5 py-4 rounded-2xl border outline-none text-sm font-josefin bg-white transition-all ${showErrors && !customerData.nombre ? 'border-[#EDB2D1] ring-1 ring-[#EDB2D1]' : 'border-gray-100'}`} />
                </div>
                <div>
                  <label className="text-[8px] font-black uppercase tracking-widest mb-2 block opacity-50">N° de Teléfono</label>
                  <input type="tel" value={customerData.telefono} onChange={e => {setCustomerData({...customerData, telefono: e.target.value}); setShowErrors(false);}} className={`w-full px-5 py-4 rounded-2xl border outline-none text-sm font-josefin bg-white transition-all ${showErrors && !customerData.telefono ? 'border-[#EDB2D1] ring-1 ring-[#EDB2D1]' : 'border-gray-100'}`} />
                </div>
                <div>
                  <label className="text-[8px] font-black uppercase tracking-widest mb-2 block opacity-50 font-bold">Método de entrega</label>
                  <div className="relative">
                    <select value={customerData.entrega} onChange={e => setCustomerData({...customerData, entrega: e.target.value})} className="w-full px-5 py-4 rounded-2xl border border-gray-100 bg-white outline-none text-sm appearance-none cursor-pointer">
                      <option>Retiro por Boutique</option>
                      <option>Envío a domicilio</option>
                    </select>
                    <span className="absolute right-5 top-1/2 -translate-y-1/2 text-[#EDB2D1] pointer-events-none text-[10px]">▼</span>
                  </div>
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
            <button 
              disabled={isBlocked} 
              onClick={manejarAvancePedido} 
              className={`w-full py-6 rounded-full font-black uppercase tracking-widest text-[11px] shadow-xl transition-all active:scale-95 ${isBlocked ? 'bg-gray-100 text-gray-300' : 'bg-[#2B4233] text-[#EDB2D1]'}`}
            >
              {storeStatus?.isClosed ? "Tienda Cerrada" : "Finalizar Pedido"}
            </button>
          )}

          {checkoutStep === 2 && (
            <button 
              onClick={finalizarPedido} 
              className="w-full py-6 rounded-full font-black text-[11px] tracking-widest uppercase shadow-xl bg-[#2B4233] text-[#EDB2D1] active:scale-95 transition-all"
            >
              FINALIZAR Y ENVIAR
            </button>
          )}
        </div>
      </div>

      <TytaAlert alert={alert} onCancel={closeAlert} />
    </div>
  );
}