"use client";
import { useState, useEffect } from "react";
import { supabase } from "@/lib/supabase";

export default function AdminProfile() {
  const [config, setConfig] = useState<any>(null);
  const [horarios, setHorarios] = useState<any[]>([]); 
  const [locations, setLocations] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [selectedLoc, setSelectedLoc] = useState<any>(null);

  useEffect(() => {
    fetchInitialData();
  }, []);

  async function fetchInitialData() {
    setLoading(true);
    try {
      // 1. Cargamos Configuración Global
      const { data: configData } = await supabase.from('store_config').select('*').single();
      
      // 2. Cargamos Sucursales Físicas
      const { data: locData } = await supabase.from('locations').select('*').order('created_at');
      
      // 3. Cargamos los NUEVOS Horarios de la tabla vinculada
      const { data: horData } = await supabase
        .from('horarios_tienda_online')
        .select('*')
        .eq('nombre_tienda', 'TYTA ARGENTINA')
        .order('dia_semana');
      
      if (configData) setConfig(configData);
      if (horData) setHorarios(horData);
      if (locData) {
        setLocations(locData);
        setSelectedLoc(locData[0]);
      }
    } catch (error) {
      console.error("Error cargando datos:", error);
    }
    setLoading(false);
  }

  const handleSave = async () => {
    setSaving(true);
    try {
      // Guardar Configuración Global (WhatsApp, Email, etc.)
      await supabase.from('store_config').update(config).eq('id', config.id);
      
      // Guardar Horarios uno por uno (Bucle)
      if (horarios.length > 0) {
        for (const dia of horarios) {
          await supabase.from('horarios_tienda_online').update({
            apertura_manana: dia.apertura_manana,
            cierre_manana: dia.cierre_manana,
            apertura_tarde: dia.apertura_tarde,
            cierre_tarde: dia.cierre_tarde,
            esta_cerrado: dia.esta_cerrado
          }).eq('id', dia.id);
        }
      }

      // Guardar Sucursal Seleccionada
      if (selectedLoc) {
        await supabase.from('locations').update(selectedLoc).eq('id', selectedLoc.id);
      }
      
      alert("¡Perfil y Horarios guardados correctamente! ✨");
      fetchInitialData();
    } catch (error) {
      console.error(error);
      alert("Error al guardar los datos en Supabase");
    }
    setSaving(false);
  };

  const updateHorario = (id: number, field: string, value: any) => {
    setHorarios(prev => prev.map(h => h.id === id ? { ...h, [field]: value } : h));
  };

  if (loading) return <div className="p-20 text-center italic text-[#2B4233] animate-pulse font-josefin">Sincronizando con Tyta...</div>;

  return (
    <div className="max-w-6xl mx-auto space-y-8 animate-in fade-in duration-700 pb-20 font-josefin">
      
      {/* HEADER PRINCIPAL */}
      <div className="flex justify-between items-end border-b border-[#2B4233]/10 pb-6">
        <div>
          <h2 className="font-diner text-5xl text-[#2B4233] uppercase leading-none">Perfil del Negocio</h2>
          <p className="italic text-[#2B4233]/50 text-xs mt-2">Gestión de identidad, contactos y horarios operativos.</p>
        </div>
        <button 
          onClick={handleSave} disabled={saving}
          className="bg-[#2B4233] text-[#EDB2D1] px-10 py-3 rounded-full font-black uppercase text-[10px] tracking-widest shadow-lg hover:scale-105 active:scale-95 transition-all disabled:opacity-50"
        >
          {saving ? "Procesando..." : "Guardar Cambios"}
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        
        {/* COLUMNA IZQUIERDA: CONTACTOS */}
        <div className="space-y-6">
          <section className="bg-white p-6 rounded-[2.5rem] border border-gray-100 shadow-sm">
            <h3 className="text-[10px] font-black uppercase tracking-widest text-[#2B4233] opacity-40 mb-6">🏢 Identidad Corporativa</h3>
            <div className="space-y-4">
              <div className="bg-[#FDFBF7] p-3 rounded-2xl border border-transparent focus-within:border-[#EDB2D1]/30 transition-all">
                <label className="text-[7px] font-black uppercase opacity-40 block mb-1">WhatsApp Administrativo</label>
                <input type="text" value={config.company_whatsapp || ""} onChange={(e)=>setConfig({...config, company_whatsapp: e.target.value})} className="w-full bg-transparent border-none p-0 text-xs font-bold focus:ring-0" />
              </div>
              <div className="bg-[#FDFBF7] p-3 rounded-2xl border border-transparent focus-within:border-[#EDB2D1]/30 transition-all">
                <label className="text-[7px] font-black uppercase opacity-40 block mb-1">Email Empresa</label>
                <input type="text" value={config.company_email || ""} onChange={(e)=>setConfig({...config, company_email: e.target.value})} className="w-full bg-transparent border-none p-0 text-xs font-bold focus:ring-0" />
              </div>
            </div>
          </section>
        </div>

        {/* COLUMNA DERECHA: HORARIOS NUEVA TABLA */}
        <div className="lg:col-span-2">
          <section className="bg-[#2B4233] p-8 rounded-[2.5rem] text-white shadow-xl relative overflow-hidden">
            <div className="relative z-10">
              <div className="flex justify-between items-start mb-6">
                <div>
                  <h3 className="text-[10px] font-black uppercase tracking-widest text-[#EDB2D1]">⏰ Horarios Tienda Online</h3>
                  <p className="text-[9px] opacity-40 mt-1">Configuración Mañana y Tarde para Tyta Argentina</p>
                </div>
                <span className="text-[8px] bg-white/10 px-3 py-1 rounded-full font-bold">LIVE DATABASE</span>
              </div>
              
              <div className="space-y-2">
                {/* Encabezados de tabla */}
                <div className="grid grid-cols-5 text-[7px] font-black uppercase opacity-30 px-4 mb-2 tracking-widest">
                  <div className="col-span-1">Día Semanal</div>
                  <div className="text-center">Apertura M.</div>
                  <div className="text-center">Cierre M.</div>
                  <div className="text-center">Apertura T.</div>
                  <div className="text-center">Cierre T.</div>
                </div>

                {/* Filas de Horarios */}
                {horarios.map((h) => (
                  <div key={h.id} className="grid grid-cols-5 items-center gap-2 bg-white/5 p-2 rounded-2xl border border-white/5 hover:bg-white/10 transition-all group">
                    <span className="text-[10px] font-bold pl-2 group-hover:text-[#EDB2D1] transition-colors">{h.dia_nombre}</span>
                    
                    {/* Input Mañana Inicio */}
                    <input 
                      type="time" 
                      value={h.apertura_manana || ""} 
                      onChange={(e) => updateHorario(h.id, 'apertura_manana', e.target.value)}
                      onKeyDown={(e) => e.key === 'Enter' && (e.target as any).blur()}
                      className="bg-white/10 border-none p-2 rounded-xl text-[10px] text-center text-white focus:ring-1 focus:ring-[#EDB2D1] cursor-pointer" 
                    />

                    {/* Input Mañana Fin */}
                    <input 
                      type="time" 
                      value={h.cierre_manana || ""} 
                      onChange={(e) => updateHorario(h.id, 'cierre_manana', e.target.value)}
                      onKeyDown={(e) => e.key === 'Enter' && (e.target as any).blur()}
                      className="bg-white/10 border-none p-2 rounded-xl text-[10px] text-center text-white focus:ring-1 focus:ring-[#EDB2D1] cursor-pointer" 
                    />

                    {/* Input Tarde Inicio */}
                    <input 
                      type="time" 
                      value={h.apertura_tarde || ""} 
                      onChange={(e) => updateHorario(h.id, 'apertura_tarde', e.target.value)}
                      onKeyDown={(e) => e.key === 'Enter' && (e.target as any).blur()}
                      className="bg-white/10 border-none p-2 rounded-xl text-[10px] text-center text-white focus:ring-1 focus:ring-[#EDB2D1] cursor-pointer" 
                    />

                    {/* Input Tarde Fin */}
                    <input 
                      type="time" 
                      value={h.cierre_tarde || ""} 
                      onChange={(e) => updateHorario(h.id, 'cierre_tarde', e.target.value)}
                      onKeyDown={(e) => e.key === 'Enter' && (e.target as any).blur()}
                      className="bg-white/10 border-none p-2 rounded-xl text-[10px] text-center text-white focus:ring-1 focus:ring-[#EDB2D1] cursor-pointer" 
                    />
                  </div>
                ))}
              </div>

              <div className="mt-6 p-4 bg-white/5 rounded-2xl border border-dashed border-white/10">
                <p className="text-[9px] text-white/40 italic leading-relaxed">
                  * Nota: El selector de hora se cierra automáticamente al presionar Enter o al hacer clic fuera del campo.
                </p>
              </div>
            </div>
          </section>
        </div>
      </div>
    </div>
  );
}