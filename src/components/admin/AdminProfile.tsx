"use client";
import { useState, useEffect } from "react";
import { supabase } from "@/lib/supabase";

export default function AdminProfile() {
  const [horarios, setHorarios] = useState<any[]>([]);

  useEffect(() => {
    fetchHorarios();
  }, []);

  async function fetchHorarios() {
    const { data, error } = await supabase
      .from("horarios")
      .select("*")
      .order("id", { ascending: true });
    
    if (error) {
      console.error("Error cargando horarios:", error);
      return;
    }
    if (data) setHorarios(data);
  }

  const handleUpdate = async (id: number, field: string, value: string) => {
    const { error } = await supabase
      .from("horarios")
      .update({ [field]: value })
      .eq("id", id);
    
    if (!error) {
      // Actualización optimista en el estado local para mayor fluidez
      setHorarios(prev => prev.map(h => h.id === id ? { ...h, [field]: value } : h));
    } else {
      console.error("Error al actualizar:", error);
    }
  };

  return (
    <div className="max-w-[1400px] mx-auto animate-in fade-in duration-500 px-2 sm:px-4">
      <header className="mb-8 mt-4 text-center sm:text-left">
        <h2 className="font-diner text-4xl md:text-5xl text-[#2B4233] uppercase leading-none">
          Horarios de Boutique
        </h2>
        <p className="font-josefin text-[10px] uppercase tracking-[0.3em] text-[#EDB2D1] mt-2 font-black">
          Configuración de disponibilidad semanal
        </p>
      </header>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 pb-20">
        {horarios.map((h) => (
          <div 
            key={h.id} 
            className="bg-white rounded-[2.5rem] p-6 shadow-sm border border-[#EDB2D1]/10 flex flex-col gap-5 hover:shadow-md transition-shadow"
          >
            {/* CABECERA DEL DÍA */}
            <div className="flex justify-between items-center border-b border-gray-50 pb-4">
              <h3 className="font-diner text-3xl uppercase text-[#2B4233] leading-none tracking-tight">
                {h.dia}
              </h3>
              <div className="flex items-center gap-2 bg-[#FDFBF7] px-3 py-1 rounded-full border border-gray-100">
                <span className="w-1.5 h-1.5 rounded-full bg-green-500 animate-pulse"></span>
                <span className="text-[7px] font-black uppercase tracking-widest text-[#2B4233]">Activo</span>
              </div>
            </div>

            {/* GRILLA COMPACTA DE INPUTS */}
            <div className="grid grid-cols-2 gap-x-4 gap-y-5">
              {/* TURNO MAÑANA */}
              <div className="flex flex-col gap-1.5">
                <label className="text-[7px] uppercase tracking-[0.2em] text-gray-400 font-black ml-2">Apertura AM</label>
                <input 
                  type="time" 
                  value={h.apertura_am || "09:00"} 
                  onChange={(e) => handleUpdate(h.id, 'apertura_am', e.target.value)}
                  className="w-full bg-[#FDFBF7] border border-gray-100 rounded-2xl px-4 py-3 text-[13px] font-bold outline-none focus:border-[#EDB2D1] text-[#2B4233] transition-all"
                />
              </div>
              
              <div className="flex flex-col gap-1.5">
                <label className="text-[7px] uppercase tracking-[0.2em] text-gray-400 font-black ml-2">Cierre AM</label>
                <input 
                  type="time" 
                  value={h.cierre_am || "13:00"} 
                  onChange={(e) => handleUpdate(h.id, 'cierre_am', e.target.value)}
                  className="w-full bg-[#FDFBF7] border border-gray-100 rounded-2xl px-4 py-3 text-[13px] font-bold outline-none focus:border-[#EDB2D1] text-[#2B4233] transition-all"
                />
              </div>

              {/* TURNO TARDE */}
              <div className="flex flex-col gap-1.5">
                <label className="text-[7px] uppercase tracking-[0.2em] text-gray-400 font-black ml-2">Apertura PM</label>
                <input 
                  type="time" 
                  value={h.apertura_pm || "16:00"} 
                  onChange={(e) => handleUpdate(h.id, 'apertura_pm', e.target.value)}
                  className="w-full bg-[#FDFBF7] border border-gray-100 rounded-2xl px-4 py-3 text-[13px] font-bold outline-none focus:border-[#EDB2D1] text-[#2B4233] transition-all"
                />
              </div>
              
              <div className="flex flex-col gap-1.5">
                <label className="text-[7px] uppercase tracking-[0.2em] text-gray-400 font-black ml-2">Cierre PM</label>
                <input 
                  type="time" 
                  value={h.cierre_pm || "20:00"} 
                  onChange={(e) => handleUpdate(h.id, 'cierre_pm', e.target.value)}
                  className="w-full bg-[#FDFBF7] border border-gray-100 rounded-2xl px-4 py-3 text-[13px] font-bold outline-none focus:border-[#EDB2D1] text-[#2B4233] transition-all"
                />
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}