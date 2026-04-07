"use client";
import { useState, useEffect } from "react";
import { supabase } from "@/lib/supabase";

export default function AdminConfig() {
  const [config, setConfig] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchConfig() {
      const { data } = await supabase.from('store_config').select('*').single();
      if (data) setConfig(data);
      setLoading(false);
    }
    fetchConfig();
  }, []);

  const updateStatus = async (status: string) => {
    // NUEVA LÓGICA DE CONTROL MAESTRO:
    // auto: Todo en false (manda el reloj)
    // forced_closed: SOS en true
    // forced_open: Siempre Abierto en true
    const isSOS = status === 'forced_closed';
    const isAlwaysOpen = status === 'forced_open';

    const { error } = await supabase
      .from('store_config')
      .update({ 
        store_status: status,
        is_closed_manual: isSOS,
        is_always_open: isAlwaysOpen // <-- ESTO ES LO QUE FALTABA
      })
      .eq('id', 1);

    if (!error) {
      setConfig({ 
        ...config, 
        store_status: status, 
        is_closed_manual: isSOS,
        is_always_open: isAlwaysOpen 
      });
    } else {
      console.error("Error al actualizar estado:", error);
      alert("No se pudo actualizar el estado. Verificá la conexión.");
    }
  };

  if (loading) return null;

  return (
    <div className="max-w-4xl mx-auto">
      <section className="bg-white p-10 rounded-[3rem] shadow-sm border border-gray-100">
        <h3 className="font-diner text-4xl text-[#2B4233] mb-2 uppercase tracking-tighter">Control Maestro</h3>
        <p className="text-[10px] font-black uppercase tracking-widest text-gray-400 mb-8">Estado operativo de la tienda virtual</p>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {/* BOTÓN AUTOMÁTICO */}
          <button 
            onClick={() => updateStatus('auto')}
            className={`p-6 rounded-[2rem] border-2 transition-all flex flex-col items-center gap-3 ${config.store_status === 'auto' ? 'border-[#2B4233] bg-[#2B4233]/5' : 'border-gray-50 opacity-40'}`}
          >
            <span className="text-2xl">⏰</span>
            <span className="text-[10px] font-black uppercase tracking-widest text-[#2B4233]">Automático</span>
            <p className="text-[8px] text-center italic">Sigue los horarios del Perfil</p>
          </button>

          {/* BOTÓN CERRADO SOS */}
          <button 
            onClick={() => updateStatus('forced_closed')}
            className={`p-6 rounded-[2rem] border-2 transition-all flex flex-col items-center gap-3 ${config.store_status === 'forced_closed' ? 'border-red-500 bg-red-50' : 'border-gray-50 opacity-40'}`}
          >
            <span className="text-2xl">🛑</span>
            <span className="text-[10px] font-black uppercase tracking-widest text-red-500">Cerrado SOS</span>
            <p className="text-[8px] text-center italic">Cerrar ahora (Vacaciones/Emergencia)</p>
          </button>

          {/* BOTÓN SIEMPRE ABIERTO */}
          <button 
            onClick={() => updateStatus('forced_open')}
            className={`p-6 rounded-[2rem] border-2 transition-all flex flex-col items-center gap-3 ${config.store_status === 'forced_open' ? 'border-[#EDB2D1] bg-[#EDB2D1]/5' : 'border-gray-50 opacity-40'}`}
          >
            <span className="text-2xl">✨</span>
            <span className="text-[10px] font-black uppercase tracking-widest text-[#EDB2D1]">Siempre Abierto</span>
            <p className="text-[8px] text-center italic">Ignorar horarios (Evento especial)</p>
          </button>
        </div>
      </section>
    </div>
  );
}