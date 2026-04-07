"use client";

import { useState, useEffect } from "react";
import { supabase } from "@/lib/supabase";

export default function PaginaPrueba() {
  const [dbValue, setDbValue] = useState<boolean | null>(null);
  const [whatsapp, setWhatsapp] = useState<string | null>(null); // Nuevo estado para el teléfono
  const [configId, setConfigId] = useState<any>(null);

  // 1. MONITOR (LA LUZ Y LOS DATOS)
  useEffect(() => {
    async function leerDb() {
      // Agregamos company_whatsapp a la selección
      const { data } = await supabase
        .from('store_config')
        .select('id, is_closed_manual, company_whatsapp')
        .single();

      if (data) {
        setDbValue(data.is_closed_manual);
        setWhatsapp(data.company_whatsapp); // Guardamos el WhatsApp
        setConfigId(data.id);
      }
    }
    leerDb();

    const channel = supabase.channel('monitor-luz')
      .on('postgres_changes', { event: 'UPDATE', schema: 'public', table: 'store_config' }, 
        (payload) => { 
          setDbValue(payload.new.is_closed_manual); 
          setWhatsapp(payload.new.company_whatsapp); // Actualizar si cambia en tiempo real
        }
      ).subscribe();

    return () => { supabase.removeChannel(channel); };
  }, []);

  const enviarOrden = async (nuevoEstado: boolean) => {
    if (!configId) return;
    
    const { error } = await supabase
      .from('store_config')
      .update({ is_closed_manual: nuevoEstado })
      .eq('id', configId);

    if (error) {
      alert("ERROR DE SUPABASE: " + error.message);
    }
  };

  if (dbValue === null) return <div className="p-10 text-[#EDB2D1] font-mono bg-black min-h-screen">CONECTANDO MONITOR...</div>;

  return (
    <div className="min-h-screen bg-black text-white flex flex-col items-center justify-center font-mono gap-10 p-6">
      
      {/* MONITOR PASIVO */}
      <div className="text-center space-y-4">
        <p className="text-[10px] text-zinc-500 uppercase tracking-widest">Estado Real en DB</p>
        <div className={`w-24 h-24 rounded-full mx-auto transition-all duration-500 shadow-2xl ${
          dbValue ? 'bg-red-600 shadow-red-900/40' : 'bg-green-600 shadow-green-900/40'
        }`} />
        <p className="text-xl font-black uppercase tracking-tighter">
            {dbValue ? 'TRUE (CERRADO)' : 'FALSE (ABIERTO)'}
        </p>
      </div>

      {/* --- NUEVA SECCIÓN: DATOS DE LA EMPRESA --- */}
      <div className="w-full max-w-xs bg-zinc-900/50 border border-zinc-800 rounded-2xl p-4 text-center">
        <p className="text-[9px] text-zinc-500 uppercase tracking-[0.2em] mb-2 font-bold">WhatsApp Configurado</p>
        <div className="bg-black py-3 rounded-lg border border-zinc-700">
          <p className="text-[#EDB2D1] text-sm font-bold tracking-widest">
            {whatsapp ? whatsapp : "⚠ NO DEFINIDO"}
          </p>
        </div>
        <p className="text-[8px] text-zinc-600 mt-2 italic">Este número recibirá los pedidos de la boutique.</p>
      </div>

      <div className="w-full h-px bg-zinc-800 max-w-xs" />

      {/* ACTIVADOR CIEGO (MANDO DE CONTROL) */}
      <div className="flex flex-col items-center gap-6 bg-zinc-900 p-10 rounded-[3rem] border border-zinc-800 shadow-xl">
        <p className="text-[10px] text-zinc-400 uppercase font-bold tracking-widest">Mando de Control</p>
        
        <button 
          onClick={() => enviarOrden(false)}
          className={`w-40 py-4 rounded-xl font-black uppercase text-[10px] tracking-widest transition-all border-2 
            ${dbValue === false ? 'bg-green-600 border-green-400 text-white shadow-lg shadow-green-900/20' : 'bg-transparent border-zinc-700 text-zinc-500 hover:border-green-500'}`}
        >
          ARRIBA: ABRIR
        </button>

        <div className="w-12 h-24 bg-black rounded-full p-2 border border-zinc-700 relative">
          <div className={`w-8 h-8 bg-white rounded-full transition-all duration-500 shadow-lg transform ${
            dbValue ? 'translate-y-12' : 'translate-y-0'
          }`} />
        </div>

        <button 
          onClick={() => enviarOrden(true)}
          className={`w-40 py-4 rounded-xl font-black uppercase text-[10px] tracking-widest transition-all border-2
            ${dbValue === true ? 'bg-red-600 border-red-400 text-white shadow-lg shadow-red-900/20' : 'bg-transparent border-zinc-700 text-zinc-500 hover:border-red-500'}`}
        >
          ABAJO: CERRAR
        </button>
      </div>

      <p className="text-[9px] text-zinc-600 uppercase text-center leading-relaxed">
        Fila ID: {configId} <br/>
        Si el número arriba no coincide con Supabase, <br/> revisa el nombre del campo.
      </p>
    </div>
  );
}