"use client";

import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase";

export default function AdminPedidosPage() {
  const [orders, setOrders] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchOrders();

    // ✅ CORRECCIÓN: Bypass 'as any' para evitar el error de overload en el Build
    const channel = supabase
      .channel('orders_realtime')
      .on(
        'postgres_changes' as any, 
        { event: '*', table: 'orders' }, 
        () => fetchOrders() // Envolvemos en función anónima para seguridad
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, []);

  async function fetchOrders() {
    const { data } = await supabase
      .from('orders')
      .select('*')
      .order('created_at', { ascending: false });
    
    if (data) setOrders(data);
    setLoading(false);
  }

  async function updateStatus(id: string, newStatus: string) {
    const { error } = await supabase
      .from('orders')
      .update({ status: newStatus })
      .eq('id', id);

    if (!error) {
      // Actualización optimista para que Susana vea el cambio de color al instante
      setOrders(prev => prev.map(o => o.id === id ? { ...o, status: newStatus } : o));
    }
  }

  if (loading) return (
    <div className="h-screen flex items-center justify-center bg-[#FDFBF7] font-diner text-3xl animate-pulse text-[#2B4233]">
      Abriendo Despacho...
    </div>
  );

  return (
    <div className="min-h-screen bg-[#FDFBF7] p-4 md:p-10 font-josefin text-[#2B4233]">
      <div className="max-w-6xl mx-auto">
        <header className="mb-10 border-b border-[#EDB2D1]/20 pb-6 flex justify-between items-end">
          <div>
            <h1 className="text-6xl font-diner uppercase leading-none">Despacho Tyta</h1>
            <p className="text-[10px] font-black uppercase tracking-[0.4em] opacity-30 mt-2">
              Gestión de Comandas en Vivo
            </p>
          </div>
        </header>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {orders.map((order) => (
            <div key={order.id} className="bg-white rounded-[2.5rem] shadow-xl border border-[#EDB2D1]/10 flex flex-col overflow-hidden group">
              <div className="p-8 border-b border-[#FDFBF7]">
                <div className="flex justify-between items-start mb-4">
                  <span className="text-[10px] font-black opacity-30 uppercase tracking-tighter text-gray-400">
                    Ref: {order.id}
                  </span>
                  <div className={`px-3 py-1 rounded-full text-[8px] font-black uppercase tracking-widest ${
                    order.status === 'pagado' ? 'bg-[#2B4233] text-white' : 
                    order.status === 'entregado' ? 'bg-[#EDB2D1] text-[#2B4233]' : 'bg-gray-100 text-gray-400'
                  }`}>
                    {order.status}
                  </div>
                </div>
                <h3 className="text-xl font-bold mb-1">{order.customer_name}</h3>
                <p className="text-[10px] opacity-40 font-mono italic">
                  {new Date(order.created_at).toLocaleString('es-AR')}
                </p>
              </div>

              <div className="p-8 flex-1 space-y-3">
                {order.items?.map((item: any, i: number) => (
                  <div key={i} className="flex justify-between text-sm italic">
                    <span className="font-medium">
                      {item.name} <span className="text-[10px] font-black opacity-20 not-italic ml-1">x{item.quantity}</span>
                    </span>
                  </div>
                ))}
              </div>

              <div className="p-8 bg-[#FDFBF7]/50 border-t border-[#EDB2D1]/5 space-y-4">
                <div className="flex justify-between items-center">
                  <span className="text-[10px] font-black uppercase opacity-30">Total</span>
                  <span className="text-2xl font-black font-mono tracking-tighter">
                    ${(order.total / 100).toLocaleString('es-AR')}
                  </span>
                </div>
                <div className="flex flex-col gap-2">
                  <button 
                    onClick={() => updateStatus(order.id, 'pagado')}
                    className="w-full py-3 bg-[#2B4233] text-white rounded-2xl text-[9px] font-black uppercase tracking-widest hover:opacity-90 active:scale-95 transition-all shadow-md"
                  >
                    Marcar Pagado
                  </button>
                  <button 
                    onClick={() => updateStatus(order.id, 'entregado')}
                    className="w-full py-3 bg-[#EDB2D1] text-[#2B4233] rounded-2xl text-[9px] font-black uppercase tracking-widest hover:opacity-90 active:scale-95 transition-all shadow-sm"
                  >
                    Entregado
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}