"use client";

import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase";
import { QRCodeSVG } from "qrcode.react";

export default function TicketPage() {
  const [order, setOrder] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  useEffect(() => {
    async function fetchOrder() {
      const path = window.location.pathname; 
      const idFromUrl = path.split("/").pop(); 

      if (!idFromUrl || idFromUrl === "pedido") {
        setErrorMsg("Código de pedido no detectado.");
        setLoading(false);
        return;
      }

      try {
        setLoading(true);
        const { data, error } = await supabase
          .from('orders')
          .select('*')
          .eq('id', idFromUrl.toUpperCase()) 
          .maybeSingle();

        if (error) throw error;
        if (!data) {
          setErrorMsg(`La referencia ${idFromUrl} no existe.`);
        } else {
          setOrder(data);
          
          // NOTIFICACIÓN A SUSANA: Solo si el pedido está pendiente
          if (data.status === 'pendiente') {
            const channel = supabase.channel('despacho_notifications');
            channel.subscribe((status) => {
              if (status === 'SUBSCRIBED') {
                channel.send({
                  type: 'broadcast',
                  event: 'qr_scanned',
                  payload: { 
                    message: `¡Alguien escaneó el pedido de ${data.customer_name}!`,
                    orderId: data.id 
                  },
                });
              }
            });
          }
        }
      } catch (err) {
        setErrorMsg("Error de conexión con la base de datos.");
      } finally {
        setLoading(false);
      }
    }
    fetchOrder();
  }, []);

  if (loading) return (
    <div className="h-screen flex items-center justify-center bg-[#FDFBF7]">
      <div className="text-center">
        <div className="w-12 h-12 border-4 border-[#EDB2D1] border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
        <p className="font-diner text-3xl text-[#2B4233] uppercase animate-pulse tracking-tighter">Validando Comanda...</p>
      </div>
    </div>
  );

  if (errorMsg || !order) return (
    <div className="h-screen flex flex-col items-center justify-center bg-[#FDFBF7] p-8 text-center font-josefin">
      <h2 className="text-6xl font-diner mb-4 uppercase text-[#2B4233]">Ups...</h2>
      <p className="opacity-50 text-sm mb-8 italic">{errorMsg}</p>
      <button onClick={() => window.location.href = '/tienda'} className="px-10 py-4 bg-[#2B4233] text-white rounded-full text-[10px] font-black uppercase tracking-[0.3em] shadow-lg">Volver a la Tienda</button>
    </div>
  );

  const statusStyles: any = {
    'pendiente': { bg: 'fill-[#F6CDD7]', text: 'text-[#5E7361]', label: 'PENDIENTE' },
    'pagado': { bg: 'fill-[#2B4233]', text: 'text-white', label: 'PAGADO' },
    'entregado': { bg: 'fill-[#EDB2D1]', text: 'text-[#2B4233]', label: 'ENTREGADO' }
  };

  const currentStyle = statusStyles[order.status] || statusStyles['pendiente'];

  return (
    <div className="min-h-screen bg-[#FDFBF7] flex items-center justify-center p-4 sm:p-10 font-josefin py-20 relative">
      <div className="w-full max-w-md bg-white shadow-[0_35px_60px_-15px_rgba(0,0,0,0.15)] relative border-t-[15px] border-[#EDB2D1] p-10 md:p-14 overflow-hidden">
        
        {/* Marca de Agua Isotipo (Diner Fatt) */}
        <div className="absolute inset-0 opacity-[0.03] flex items-center justify-center -rotate-12 scale-150 pointer-events-none text-[#2B4233] select-none">
           <span className="font-diner text-[180px]">TP</span>
        </div>

        <div className="relative flex flex-col items-center z-10 text-[#2B4233]">
          <span className="text-[8px] font-black uppercase tracking-[0.7em] opacity-20 mb-8 italic text-center">Security Digital Comanda</span>
          
          <img src="/images/tyta-logo.png" alt="Tyta Patisserie Logo" className="w-52 h-auto mb-12 object-contain" />
          <div className="w-full space-y-4 mb-10 text-[10px] uppercase font-black tracking-widest border-y border-gray-100 py-8">
            <div className="flex justify-between items-center">
              <span className="opacity-30 italic font-medium">Ref. Única:</span>
              <span className="font-mono text-sm bg-[#FDFBF7] px-3 py-1 rounded-lg border border-[#EDB2D1]/20 font-bold tracking-normal">{order.id}</span>
            </div>
            <div className="flex justify-between items-center font-josefin">
              <span className="opacity-30 italic font-medium">Titular:</span>
              <span className="font-bold text-[11px] tracking-normal">{order.customer_name}</span>
            </div>
          </div>

          <div className="w-full space-y-5 mb-12">
            {order.items?.map((item: any, idx: number) => (
              <div key={idx} className="flex justify-between text-xs items-start italic">
                <span className="font-bold opacity-80 leading-relaxed">
                  {item.name} <span className="text-[9px] opacity-30 not-italic ml-1 font-black">x{item.quantity}</span>
                </span>
                <span className="font-mono font-black text-[11px] whitespace-nowrap">
                  ${((item.price * item.quantity) / 100).toLocaleString('es-AR')}
                </span>
              </div>
            ))}
          </div>

          <div className="w-full border-t-2 border-[#2B4233] pt-8 mb-12 flex justify-between items-center font-josefin">
            <span className="text-[11px] font-black uppercase tracking-[0.2em]">Total Final</span>
            <span className="text-4xl font-black font-mono tracking-tighter">${(order.total / 100).toLocaleString('es-AR')}</span>
          </div>

          {/* QR INVIOLABLE */}
          <div className="flex flex-col items-center mb-14 p-7 border-2 border-dashed border-[#EDB2D1]/50 rounded-[3rem] bg-[#FDFBF7]/40 backdrop-blur-sm group transition-all duration-500">
            <QRCodeSVG 
              value={`https://tytapatisserie.com.ar/pedido/${order.id}`}
              size={110}
              bgColor={"transparent"}
              fgColor={"#2B4233"}
              level={"H"}
              includeMargin={false}
            />
            <span className="text-[7px] font-black uppercase tracking-[0.5em] mt-5 opacity-40 group-hover:opacity-100 transition-opacity">
              Sello de Verificación Digital
            </span>
          </div>

          {/* SELLO DE LACRE OFICIAL */}
          <div className="relative flex items-center justify-center w-48 h-48 rotate-[15deg] drop-shadow-[0_15px_30px_rgba(43,66,51,0.25)]">
            <svg viewBox="0 0 100 100" className={`absolute inset-0 w-full h-full ${currentStyle.bg} transition-all duration-1000`}>
              <path d="M50 2C23.5 2 2 23.5 2 50C2 76.5 23.5 98 50 98C76.5 98 98 76.5 98 50C98 23.5 76.5 2 50 2ZM50 90C27.9 90 10 72.1 10 50C10 27.9 27.9 10 50 10C72.1 10 90 27.9 90 50C90 72.1 72.1 90 50 90Z" fillOpacity="0.2"/>
              <circle cx="50" cy="50" r="45" />
            </svg>
            
            <div className={`relative z-10 flex flex-col items-center justify-center text-center ${currentStyle.text}`}>
              <span className="text-5xl font-diner leading-none mb-1 tracking-tighter shadow-sm">TP</span>
              <div className="h-[2px] w-16 bg-current opacity-30 mb-3"></div>
              <span className="text-[13px] font-black uppercase tracking-[0.3em] leading-none mb-1">
                {currentStyle.label}
              </span>
              <span className="text-[8px] font-bold uppercase tracking-[0.5em] opacity-50">
                Sello Oficial
              </span>
            </div>
          </div>

          <footer className="mt-20 text-[8px] font-black uppercase opacity-20 tracking-[0.5em] text-center leading-loose">
            Tyta Patisserie • Argentina 2026<br/>
            <span className="opacity-50 tracking-normal italic font-medium font-josefin">Pastelería artesanal de lujo</span>
          </footer>
        </div>
      </div>
    </div>
  );
}