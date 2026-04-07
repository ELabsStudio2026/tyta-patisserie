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
    const isSOS = status === 'forced_closed';
    const isAlwaysOpen = status === 'forced_open';

    const { error } = await supabase
      .from('store_config')
      .update({ 
        store_status: status,
        is_closed_manual: isSOS,
        is_always_open: isAlwaysOpen 
      })
      .eq('id', 1);

    if (!error) {
      setConfig({ 
        ...config, 
        store_status: status, 
        is_closed_manual: isSOS,
        is_always_open: isAlwaysOpen 
      });
    }
  };

  if (loading) return null;

  return (
    <div className="w-full max-w-4xl mx-auto px-2 sm:px-0">
      <section className="bg-white p-6 sm:p-10 rounded-[2.5rem] sm:rounded-[3rem] shadow-sm border border-gray-100">
        <div className="text-center sm:text-left mb-8">
          <h3 className="font-diner text-3xl sm:text-4xl text-[#2B4233] mb-1 uppercase tracking-tighter">
            Control Maestro
          </h3>
          <p className="text-[9px] font-black uppercase tracking-widest text-gray-400">
            Estado operativo de la tienda virtual
          </p>
        </div>

        {/* CONTENEDOR DE BOTONES: En mobile se apilan (flex-col), en desktop van en línea */}
        <div className="flex flex-col sm:flex-row gap-4">
          
          {/* BOTÓN AUTOMÁTICO */}
          <button 
            onClick={() => updateStatus('auto')}
            className={`flex-1 p-5 sm:p-6 rounded-[2rem] border-2 transition-all flex flex-row sm:flex-col items-center justify-start sm:justify-center gap-4 sm:gap-3 
            ${config.store_status === 'auto' 
              ? 'border-[#2B4233] bg-[#2B4233]/5 shadow-md scale-[1.02]' 
              : 'border-gray-50 opacity-60'}`}
          >
            <span className="text-2xl bg-white p-3 rounded-2xl shadow-sm sm:shadow-none sm:p-0">⏰</span>
            <div className="text-left sm:text-center">
              <span className="block text-[10px] font-black uppercase tracking-widest text-[#2B4233]">Automático</span>
              <p className="text-[8px] italic text-gray-400">Sigue los horarios</p>
            </div>
          </button>

          {/* BOTÓN CERRADO SOS */}
          <button 
            onClick={() => updateStatus('forced_closed')}
            className={`flex-1 p-5 sm:p-6 rounded-[2rem] border-2 transition-all flex flex-row sm:flex-col items-center justify-start sm:justify-center gap-4 sm:gap-3 
            ${config.store_status === 'forced_closed' 
              ? 'border-red-500 bg-red-50 shadow-md scale-[1.02]' 
              : 'border-gray-50 opacity-60'}`}
          >
            <span className="text-2xl bg-white p-3 rounded-2xl shadow-sm sm:shadow-none sm:p-0">🛑</span>
            <div className="text-left sm:text-center">
              <span className="block text-[10px] font-black uppercase tracking-widest text-red-500">Cerrado SOS</span>
              <p className="text-[8px] italic text-gray-400">Cierre inmediato</p>
            </div>
          </button>

          {/* BOTÓN SIEMPRE ABIERTO */}
          <button 
            onClick={() => updateStatus('forced_open')}
            className={`flex-1 p-5 sm:p-6 rounded-[2rem] border-2 transition-all flex flex-row sm:flex-col items-center justify-start sm:justify-center gap-4 sm:gap-3 
            ${config.store_status === 'forced_open' 
              ? 'border-[#EDB2D1] bg-[#EDB2D1]/5 shadow-md scale-[1.02]' 
              : 'border-gray-50 opacity-60'}`}
          >
            <span className="text-2xl bg-white p-3 rounded-2xl shadow-sm sm:shadow-none sm:p-0">✨</span>
            <div className="text-left sm:text-center">
              <span className="block text-[10px] font-black uppercase tracking-widest text-[#EDB2D1]">Siempre Abierto</span>
              <p className="text-[8px] italic text-gray-400">Ignora horarios</p>
            </div>
          </button>

        </div>
      </section>
    </div>
  );
}