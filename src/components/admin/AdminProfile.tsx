"use client";
import { useState, useEffect } from "react";
import { supabase } from "@/lib/supabase";

export default function AdminProfile() {
  const [horarios, setHorarios] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchHorarios() {
      try {
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

  if (loading) return (
    <div className="flex justify-center py-20 font-diner text-2xl opacity-20 italic">
      Sincronizando Boutique...
    </div>
  );

  return (
    <div className="max-w-4xl mx-auto px-2 sm:px-0 space-y-6 pb-24 animate-in fade-in duration-500">
      
      <header className="text-center sm:text-left mb-8 bg-white p-6 rounded-[2.5rem] border border-gray-100 shadow-sm">
        <h3 className="font-diner text-3xl sm:text-4xl text-[#2B4233] uppercase leading-none">Horarios Operativos</h3>
        <p className="text-[9px] font-black uppercase tracking-[0.3em] text-[#EDB2D1] mt-1">Gestión de disponibilidad semanal</p>
      </header>

      <div className="grid grid-cols-1 gap-4">
        {horarios.map((dia) => (
          <div 
            key={dia.id} 
            className={`bg-white p-5 rounded-[2.5rem] border transition-all shadow-sm ${dia.esta_cerrado ? 'border-red-100 bg-red-50/10' : 'border-gray-50'}`}
          >
            {/* CABECERA COMPACTA */}
            <div className="flex items-center justify-between mb-4 border-b border-gray-50 pb-3">
              <h4 className="font-diner text-2xl text-[#2B4233] uppercase leading-none">{dia.dia_nombre}</h4>
              
              <button 
                onClick={() => handleUpdateDay(dia.id, { esta_cerrado: !dia.esta_cerrado })}
                className={`px-4 py-1.5 rounded-full text-[8px] font-black uppercase tracking-widest transition-all ${
                  dia.esta_cerrado ? 'bg-red-500 text-white shadow-md shadow-red-200' : 'bg-[#FDFBF7] text-[#2B4233] border border-gray-100'
                }`}
              >
                {dia.esta_cerrado ? "CERRADO" : "OPERATIVO"}
              </button>
            </div>

            {/* GRILLA COMPACTA DE INPUTS (Solo si no está cerrado) */}
            {!dia.esta_cerrado && (
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 animate-in fade-in zoom-in-95 duration-300">
                {/* MAÑANA */}
                <div className="flex flex-col gap-1">
                  <label className="text-[7px] font-black uppercase text-gray-400 ml-2 tracking-tighter">Apertura AM</label>
                  <input 
                    type="time" 
                    value={dia.apertura_manana || ""} 
                    onChange={(e) => handleUpdateDay(dia.id, { apertura_manana: e.target.value })}
                    className="bg-[#FDFBF7] border border-gray-100 rounded-xl py-2.5 px-3 text-[11px] font-bold outline-none focus:border-[#EDB2D1] text-[#2B4233]"
                  />
                </div>
                <div className="flex flex-col gap-1">
                  <label className="text-[7px] font-black uppercase text-gray-400 ml-2 tracking-tighter">Cierre AM</label>
                  <input 
                    type="time" 
                    value={dia.cierre_manana || ""} 
                    onChange={(e) => handleUpdateDay(dia.id, { cierre_manana: e.target.value })}
                    className="bg-[#FDFBF7] border border-gray-100 rounded-xl py-2.5 px-3 text-[11px] font-bold outline-none focus:border-[#EDB2D1] text-[#2B4233]"
                  />
                </div>

                {/* TARDE */}
                <div className="flex flex-col gap-1">
                  <label className="text-[7px] font-black uppercase text-gray-400 ml-2 tracking-tighter">Apertura PM</label>
                  <input 
                    type="time" 
                    value={dia.apertura_tarde || ""} 
                    onChange={(e) => handleUpdateDay(dia.id, { apertura_tarde: e.target.value })}
                    className="bg-[#FDFBF7] border border-gray-100 rounded-xl py-2.5 px-3 text-[11px] font-bold outline-none focus:border-[#EDB2D1] text-[#2B4233]"
                  />
                </div>
                <div className="flex flex-col gap-1">
                  <label className="text-[7px] font-black uppercase text-gray-400 ml-2 tracking-tighter">Cierre PM</label>
                  <input 
                    type="time" 
                    value={dia.cierre_tarde || ""} 
                    onChange={(e) => handleUpdateDay(dia.id, { cierre_tarde: e.target.value })}
                    className="bg-[#FDFBF7] border border-gray-100 rounded-xl py-2.5 px-3 text-[11px] font-bold outline-none focus:border-[#EDB2D1] text-[#2B4233]"
                  />
                </div>
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}