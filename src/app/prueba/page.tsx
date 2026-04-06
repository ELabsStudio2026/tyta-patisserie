"use client";

import { useState, useEffect } from "react";
import { supabase } from "@/lib/supabase";

export default function PaginaPrueba() {
  const [dbValue, setDbValue] = useState<boolean | null>(null);
  const [configId, setConfigId] = useState<any>(null);

  // 1. MONITOR (LA LUZ) - Ya sabemos que funciona perfecto
  useEffect(() => {
    async function leerDb() {
      const { data } = await supabase.from('store_config').select('id, is_closed_manual').single();
      if (data) {
        setDbValue(data.is_closed_manual);
        setConfigId(data.id);
      }
    }
    leerDb();

    const channel = supabase.channel('monitor-luz')
      .on('postgres_changes', { event: 'UPDATE', schema: 'public', table: 'store_config' }, 
        (payload) => { setDbValue(payload.new.is_closed_manual); }
      ).subscribe();

    return () => { supabase.removeChannel(channel); };
  }, []);

  // 2. EL ACTIVADOR (EL SWITCH)
  // Función pura: Manda la orden y reporta si la base de datos la rechazó
  const enviarOrden = async (nuevoEstado: boolean) => {
    if (!configId) {
      console.error("No se detectó ID de fila");
      return;
    }

    console.log("Enviando orden a Supabase...", nuevoEstado);
    
    const { error } = await supabase
      .from('store_config')
      .update({ is_closed_manual: nuevoEstado })
      .eq('id', configId);

    if (error) {
      // SI ESTO APARECE, es que Supabase tiene el RLS activado y no te deja escribir
      alert("ERROR DE SUPABASE: " + error.message + "\n\nTip: Revisa las políticas RLS de la tabla store_config.");
    }
  };

  if (dbValue === null) return <div className="p-10 text-[#EDB2D1] font-mono">CONECTANDO MONITOR...</div>;

  return (
    <div className="min-h-screen bg-black text-white flex flex-col items-center justify-center font-mono gap-10">
      
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

      <div className="w-full h-px bg-zinc-800 max-w-xs" />

      {/* ACTIVADOR CIEGO (SWITCH DE DOS BOTONES) */}
      <div className="flex flex-col items-center gap-6 bg-zinc-900 p-10 rounded-[3rem] border border-zinc-800">
        <p className="text-[10px] text-zinc-400 uppercase font-bold tracking-widest">Mando de Control</p>
        
        {/* Botón Superior: Forzar Abierto */}
        <button 
          onClick={() => enviarOrden(false)}
          className={`w-40 py-4 rounded-xl font-black uppercase text-[10px] tracking-widest transition-all border-2 
            ${dbValue === false ? 'bg-green-600 border-green-400 text-white' : 'bg-transparent border-zinc-700 text-zinc-500 hover:border-green-500'}`}
        >
          ARRIBA: ABRIR
        </button>

        {/* El Switch visual: Solo se mueve si la DB cambia */}
        <div className="w-12 h-24 bg-black rounded-full p-2 border border-zinc-700 relative">
          <div className={`w-8 h-8 bg-white rounded-full transition-all duration-500 shadow-lg transform ${
            dbValue ? 'translate-y-12' : 'translate-y-0'
          }`} />
        </div>

        {/* Botón Inferior: Forzar Cerrado */}
        <button 
          onClick={() => enviarOrden(true)}
          className={`w-40 py-4 rounded-xl font-black uppercase text-[10px] tracking-widest transition-all border-2
            ${dbValue === true ? 'bg-red-600 border-red-400 text-white' : 'bg-transparent border-zinc-700 text-zinc-500 hover:border-red-500'}`}
        >
          ABAJO: CERRAR
        </button>
      </div>

      <p className="text-[9px] text-zinc-600 uppercase text-center leading-relaxed">
        ID: {configId} <br/>
        Si presionas y la luz no cambia, <br/> el error saldrá en un cartel.
      </p>

    </div>
  );
}