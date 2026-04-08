"use client";
import { useState, useEffect } from "react";
import { supabase } from "@/lib/supabase";

export default function AdminProfile() {
  const [horarios, setHorarios] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchHorarios() {
      try {
        // Conexión a la tabla real de expansión multitienda
        const { data, error } = await supabase
          .from('horarios_tienda_online')
          .select('*')
          .order('dia_semana', { ascending: true });
        
        if (data) setHorarios(data);
      } catch (err) {
        console.error("Error cargando horarios:", err);
      } finally {
        setLoading(false);
      }
    }
    fetchHorarios();
  }, []);

  const handleUpdateDay = async (diaId: number, camposActualizados: any) => {
    const { error } = await supabase
      .from('horarios_tienda_online')
      .update(camposActualizados)
      .eq('id', diaId);
    
    if (!error) {
      setHorarios(horarios.map(h => h.id === diaId ? { ...h, ...camposActualizados } : h));
    }
  };

  if (loading) return <div className="flex justify-center py-20 font-diner text-2xl opacity-20 italic">Sincronizando con Tienda Online...</div>;

  return (
    <div className="max-w-4xl mx-auto px-2 sm:px-0 space-y-6 pb-24 animate-in fade-in duration-500">
      
      <div className="text-center sm:text-left mb-8 bg-white p-8 rounded-[2.5rem] border border-gray-100 shadow-sm">
        <h3 className="font-diner text-3xl sm:text-4xl text-[#2B4233] uppercase tracking-tighter">Horarios Operativos</h3>
        <p className="text-[9px] font-black uppercase tracking-widest text-[#EDB2D1]">Tabla: horarios_tienda_online • Gestión Multiturno</p>
      </div>

      {/* LISTA DE DÍAS (Mobile First: Cards verticales) */}
      // Dentro de tu componente de gestión de horarios (AdminProfile)

<div className="grid grid-cols-1 gap-4">
  {diasSemana.map((dia) => (
    <div key={dia} className="bg-white rounded-[2rem] p-5 shadow-sm border border-gray-50 flex flex-col gap-3">
      
      {/* CABECERA COMPACTA */}
      <div className="flex justify-between items-center border-b border-gray-50 pb-2">
        <h3 className="font-diner text-2xl uppercase text-[#2B4233] leading-none">
          {dia}
        </h3>
        <button className="bg-[#FDFBF7] px-4 py-1.5 rounded-full text-[8px] font-black uppercase tracking-widest text-[#2B4233] border border-gray-100">
          Operativo
        </button>
      </div>

      {/* CONTROLES COMPACTOS EN GRILLA */}
      <div className="grid grid-cols-2 gap-x-4 gap-y-3">
        
        {/* TURNO MAÑANA */}
        <div className="space-y-1">
          <label className="text-[7px] uppercase tracking-[0.2em] text-gray-400 font-black ml-2">Apertura AM</label>
          <select className="w-full bg-[#FDFBF7] border border-gray-100 rounded-xl px-3 py-2 text-[11px] outline-none focus:border-[#EDB2D1]">
            <option>9:00 a.m.</option>
          </select>
        </div>
        
        <div className="space-y-1">
          <label className="text-[7px] uppercase tracking-[0.2em] text-gray-400 font-black ml-2">Cierre AM</label>
          <select className="w-full bg-[#FDFBF7] border border-gray-100 rounded-xl px-3 py-2 text-[11px] outline-none focus:border-[#EDB2D1]">
            <option>1:00 p.m.</option>
          </select>
        </div>

        {/* TURNO TARDE */}
        <div className="space-y-1">
          <label className="text-[7px] uppercase tracking-[0.2em] text-gray-400 font-black ml-2">Apertura PM</label>
          <select className="w-full bg-[#FDFBF7] border border-gray-100 rounded-xl px-3 py-2 text-[11px] outline-none focus:border-[#EDB2D1]">
            <option>1:00 p.m.</option>
          </select>
        </div>
        
        <div className="space-y-1">
          <label className="text-[7px] uppercase tracking-[0.2em] text-gray-400 font-black ml-2">Cierre PM</label>
          <select className="w-full bg-[#FDFBF7] border border-gray-100 rounded-xl px-3 py-2 text-[11px] outline-none focus:border-[#EDB2D1]">
            <option>6:00 p.m.</option>
          </select>
        </div>

      </div>
    </div>
  ))}
</div>
  );
}