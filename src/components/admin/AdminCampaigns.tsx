"use client";
import { useState, useEffect } from "react";
import { supabase } from "@/lib/supabase";
import { useTytaAlert } from "@/lib/useTytaAlert";
import TytaAlert from "@/components/ui/TytaAlert";

export default function AdminCampaigns() {
  const [campaigns, setCampaigns] = useState<any[]>([]);
  const [categories, setCategories] = useState<any[]>([]); // <-- Nuevo: para el selector
  const [loading, setLoading] = useState(true);
  const { alert, showAlert, closeAlert } = useTytaAlert();
  
  const [isAdding, setIsAdding] = useState(false);
  const [newCampaign, setNewCampaign] = useState({
    name: "",
    discount_percent: 10,
    start_at: "",
    end_at: "",
    target_category: "" // "" significa Toda la Tienda
  });

  const fetchData = async () => {
    setLoading(true);
    try {
      // Cargamos Campañas
      const { data: camps } = await supabase
        .from('campaigns')
        .select('*')
        .order('start_at', { ascending: false });
      
      // Cargamos Categorías para el selector
      const { data: cats } = await supabase
        .from('categories')
        .select('name')
        .order('name');

      if (camps) setCampaigns(camps);
      if (cats) setCategories(cats);
    } catch (error) {
      console.error("Error cargando datos:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const handleSave = async () => {
    if (!newCampaign.name || !newCampaign.start_at || !newCampaign.end_at) {
      showAlert("warning", "DATOS INCOMPLETOS", "Por favor, completa el nombre y las fechas.");
      return;
    }

    // Si target_category es vacío, lo enviamos como null para que la función SQL sepa que es 'Toda la tienda'
    const payload = {
      ...newCampaign,
      target_category: newCampaign.target_category === "" ? null : newCampaign.target_category
    };

    try {
      const { error } = await supabase.from('campaigns').insert([payload]);
      if (error) throw error;

      setIsAdding(false);
      fetchData();
      showAlert("success", "¡PROGRAMADA!", `Campaña lista para ${newCampaign.target_category || 'toda la tienda'}.`);
      
      setNewCampaign({ name: "", discount_percent: 10, start_at: "", end_at: "", target_category: "" });
    } catch (err: any) {
      showAlert("danger", "ERROR", err.message);
    }
  };

  const runManualProcess = async () => {
    showAlert("info", "SINCRONIZANDO...", "Aplicando cambios de precios...");
    const { error } = await supabase.rpc('process_scheduled_campaigns');
    if (!error) {
      fetchData();
      showAlert("success", "SISTEMA ACTUALIZADO", "Los precios se ajustaron según el calendario.");
    }
  };

  const deleteCampaign = async (id: string) => {
    showAlert("danger", "¿ELIMINAR?", "Se borrará la programación.", async () => {
      await supabase.from('campaigns').delete().eq('id', id);
      fetchData();
      closeAlert();
    });
  };

  return (
    <div className="p-4 md:p-8 animate-in fade-in duration-500">
      <div className="flex flex-col md:flex-row justify-between items-center mb-10 gap-4">
        <div>
          <h2 className="font-diner text-4xl text-[#2B4233] uppercase">Planificador de Campañas</h2>
          <p className="text-[10px] font-black uppercase tracking-widest text-[#EDB2D1]">Segmentación por Categoría</p>
        </div>
        
        <div className="flex gap-3">
          <button onClick={runManualProcess} className="bg-white border border-[#2B4233]/10 text-[#2B4233] px-6 py-3 rounded-full text-[9px] font-black uppercase tracking-widest hover:bg-[#FDFBF7] transition-all shadow-sm">🔄 Sincronizar</button>
          <button onClick={() => setIsAdding(!isAdding)} className="bg-[#2B4233] text-[#EDB2D1] px-6 py-3 rounded-full text-[9px] font-black uppercase tracking-widest hover:scale-105 transition-all shadow-lg">
            {isAdding ? "✕ Cerrar" : "+ Nueva Campaña"}
          </button>
        </div>
      </div>

      {isAdding && (
        <div className="mb-10 bg-white p-8 rounded-[3rem] border border-[#EDB2D1]/20 shadow-xl animate-in slide-in-from-top duration-300">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="md:col-span-2">
              <label className="text-[9px] font-black uppercase opacity-40 mb-2 block">Nombre del Evento</label>
              <input type="text" className="w-full p-4 rounded-2xl border border-gray-100 outline-none focus:border-[#EDB2D1] text-sm" value={newCampaign.name} onChange={e => setNewCampaign({...newCampaign, name: e.target.value})} />
            </div>
            
            {/* SELECTOR DE CATEGORÍA */}
            <div>
              <label className="text-[9px] font-black uppercase opacity-40 mb-2 block">¿A qué categoría aplica?</label>
              <select 
                className="w-full p-4 rounded-2xl border border-gray-100 outline-none focus:border-[#EDB2D1] text-sm bg-[#FDFBF7]"
                value={newCampaign.target_category}
                onChange={e => setNewCampaign({...newCampaign, target_category: e.target.value})}
              >
                <option value="">✨ TODA LA TIENDA</option>
                {categories.map(cat => (
                  <option key={cat.name} value={cat.name}>{cat.name.toUpperCase()}</option>
                ))}
              </select>
            </div>

            <div>
              <label className="text-[9px] font-black uppercase opacity-40 mb-2 block">Descuento (%)</label>
              <input type="number" className="w-full p-4 rounded-2xl border border-gray-100 outline-none focus:border-[#EDB2D1] text-sm" value={newCampaign.discount_percent} onChange={e => setNewCampaign({...newCampaign, discount_percent: parseInt(e.target.value)})} />
            </div>

            <div>
              <label className="text-[9px] font-black uppercase opacity-40 mb-2 block">Inicia el:</label>
              <input type="datetime-local" className="w-full p-4 rounded-2xl border border-gray-100 outline-none focus:border-[#EDB2D1] text-sm" value={newCampaign.start_at} onChange={e => setNewCampaign({...newCampaign, start_at: e.target.value})} />
            </div>
            <div>
              <label className="text-[9px] font-black uppercase opacity-40 mb-2 block">Finaliza el:</label>
              <input type="datetime-local" className="w-full p-4 rounded-2xl border border-gray-100 outline-none focus:border-[#EDB2D1] text-sm" value={newCampaign.end_at} onChange={e => setNewCampaign({...newCampaign, end_at: e.target.value})} />
            </div>
          </div>
          <div className="flex justify-end mt-8">
            <button onClick={handleSave} className="bg-[#EDB2D1] text-[#2B4233] px-10 py-4 rounded-full text-[10px] font-black uppercase shadow-md hover:shadow-lg transition-all">Confirmar y Programar</button>
          </div>
        </div>
      )}

      {/* LISTADO */}
      <div className="grid grid-cols-1 gap-4">
        {campaigns.map(c => (
          <div key={c.id} className="bg-white p-6 rounded-[2.5rem] border border-[#EDB2D1]/10 flex items-center justify-between group hover:shadow-md transition-all">
            <div className="flex items-center gap-6">
              <div className={`w-3 h-3 rounded-full ${c.status === 'active' ? 'bg-green-500 animate-pulse' : 'bg-gray-200'}`} />
              <div>
                <h4 className="font-bold text-[#2B4233] uppercase text-sm">{c.name}</h4>
                <p className="text-[9px] font-black text-[#EDB2D1] uppercase tracking-tighter">
                  {c.target_category ? `Categoría: ${c.target_category}` : 'Toda la tienda'} | {c.discount_percent}% OFF
                </p>
              </div>
            </div>
            <button onClick={() => deleteCampaign(c.id)} className="opacity-0 group-hover:opacity-100 p-2 hover:bg-red-50 rounded-full transition-all text-xs">🗑️</button>
          </div>
        ))}
      </div>

      <TytaAlert alert={alert} onCancel={closeAlert} />
    </div>
  );
}