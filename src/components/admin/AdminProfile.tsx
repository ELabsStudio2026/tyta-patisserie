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
      <div className="grid grid-cols-1 gap-4">
        {horarios.map((dia) => (
          <div key={dia.id} className={`bg-white p-5 sm:p-8 rounded-[2.5rem] border transition-all shadow-sm ${dia.esta_cerrado ? 'border-red-100 opacity-80' : 'border-gray-100'}`}>
            
            <div className="flex items-center justify-between mb-6">
              <div>
                <h4 className="font-diner text-2xl text-[#2B4233] uppercase leading-none">{dia.dia_nombre}</h4>
                <p className="text-[8px] font-black uppercase tracking-widest text-gray-400 mt-1">Sede: {dia.nombre_tienda}</p>
              </div>
              
              {/* Switch de cierre por día */}
              <button 
                onClick={() => handleUpdateDay(dia.id, { esta_cerrado: !dia.esta_cerrado })}
                className={`px-4 py-2 rounded-full text-[9px] font-black uppercase tracking-widest transition-all ${dia.esta_cerrado ? 'bg-red-500 text-white' : 'bg-[#2B4233]/5 text-[#2B4233]'}`}
              >
                {dia.esta_cerrado ? "CERRADO" : "OPERATIVO"}
              </button>
            </div>

            {!dia.esta_cerrado && (
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 animate-in slide-in-from-top-2">
                {/* TURNO MAÑANA */}
                <div className="flex flex-col gap-1">
                  <label className="text-[7px] font-black uppercase text-gray-400 ml-2">Apertura Mañana</label>
                  <input 
                    type="time" 
                    value={dia.apertura_manana || ""} 
                    onChange={(e) => handleUpdateDay(dia.id, { apertura_manana: e.target.value })}
                    className="bg-[#FDFBF7] border border-gray-50 rounded-xl py-2 px-3 text-xs font-mono outline-none focus:border-[#EDB2D1]"
                  />
                </div>
                <div className="flex flex-col gap-1">
                  <label className="text-[7px] font-black uppercase text-gray-400 ml-2">Cierre Mañana</label>
                  <input 
                    type="time" 
                    value={dia.cierre_manana || ""} 
                    onChange={(e) => handleUpdateDay(dia.id, { cierre_manana: e.target.value })}
                    className="bg-[#FDFBF7] border border-gray-50 rounded-xl py-2 px-3 text-xs font-mono outline-none focus:border-[#EDB2D1]"
                  />
                </div>

                {/* TURNO TARDE */}
                <div className="flex flex-col gap-1">
                  <label className="text-[7px] font-black uppercase text-gray-400 ml-2">Apertura Tarde</label>
                  <input 
                    type="time" 
                    value={dia.apertura_tarde || ""} 
                    onChange={(e) => handleUpdateDay(dia.id, { apertura_tarde: e.target.value })}
                    className="bg-[#FDFBF7] border border-gray-50 rounded-xl py-2 px-3 text-xs font-mono outline-none focus:border-[#EDB2D1]"
                  />
                </div>
                <div className="flex flex-col gap-1">
                  <label className="text-[7px] font-black uppercase text-gray-400 ml-2">Cierre Tarde</label>
                  <input 
                    type="time" 
                    value={dia.cierre_tarde || ""} 
                    onChange={(e) => handleUpdateDay(dia.id, { cierre_tarde: e.target.value })}
                    className="bg-[#FDFBF7] border border-gray-50 rounded-xl py-2 px-3 text-xs font-mono outline-none focus:border-[#EDB2D1]"
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