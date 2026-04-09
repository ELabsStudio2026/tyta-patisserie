"use client";
import { useState } from "react";
import AdminFilters from "./AdminFilters";
import { supabase } from "@/lib/supabase";
import { useTytaAlert } from "@/lib/useTytaAlert";
import TytaAlert from "@/components/ui/TytaAlert"; // <-- IMPORTANTE

interface AdminInventoryProps {
  products: any[];
  categories: any[];
  onEdit: (product: any) => void;
  onDelete: (id: string) => void;
  onRefresh: () => void;
}

export default function AdminInventory({ products, categories, onEdit, onDelete, onRefresh }: AdminInventoryProps) {
  const { alert, showAlert, closeAlert } = useTytaAlert();
  const [searchTerm, setSearchTerm] = useState("");
  const [filterCategory, setFilterCategory] = useState("all");
  const [filterStock, setFilterStock] = useState("all");
  const [filterVisible, setFilterVisible] = useState("all");
  const [filterPhoto, setFilterPhoto] = useState("all");
  const [sortBy, setSortBy] = useState("name-asc");
  const [selectedIds, setSelectedIds] = useState<string[]>([]);
  
  const [percentageModalOpen, setPercentageModalOpen] = useState(false);
  const [percentageValue, setPercentageValue] = useState("");

  const filtered = products.filter(p => {
    const matchSearch = (p.name || "").toLowerCase().includes(searchTerm.toLowerCase());
    const matchCat = filterCategory === "all" || p.category === filterCategory;
    const matchVis = filterVisible === "all" || (filterVisible === "visible" ? p.is_visible : !p.is_visible);
    const isOut = p.stock <= 0;
    const isCritical = !isOut && p.stock <= (p.critical_stock || 3);
    let matchStock = true;
    if (filterStock === "critical") matchStock = isCritical || isOut;
    const hasPhoto = p.image_url && p.image_url.length > 5;
    const matchPhoto = filterPhoto === "all" || (filterPhoto === "with" ? hasPhoto : !hasPhoto);
    return matchSearch && matchCat && matchVis && matchStock && matchPhoto;
  }).sort((a, b) => {
    if (sortBy === "name-asc") return (a.name || "").localeCompare(b.name || "");
    if (sortBy === "price-asc") return a.price - b.price;
    return 0;
  });

  const toggleSelectAll = () => {
    if (selectedIds.length === filtered.length) setSelectedIds([]);
    else setSelectedIds(filtered.map(p => p.id));
  };

  const toggleSelectOne = (id: string) => {
    setSelectedIds(prev => prev.includes(id) ? prev.filter(i => i !== id) : [...prev, id]);
  };

  // --- FUNCIÓN DE BORRADO MASIVO CORREGIDA ---
  const handleBulkDelete = () => {
    if (selectedIds.length === 0) return;

    showAlert(
      "danger", 
      "¿ELIMINAR TODOS?", 
      `Estás por borrar ${selectedIds.length} productos. Esta acción no tiene vuelta atrás.`, 
      async () => {
        const { error } = await supabase
          .from('products')
          .delete()
          .in('id', selectedIds);
        
        if (!error) {
          setSelectedIds([]);
          onRefresh();
          closeAlert();
        }
      }
    );
  };

  // --- FUNCIÓN DE PRECIOS OPTIMIZADA ---
  const applyBulkPriceUpdate = () => {
    const perc = Number(percentageValue);
    if (!percentageValue || isNaN(perc)) {
      setPercentageModalOpen(false);
      return;
    }
    setPercentageModalOpen(false);

    showAlert("warning", "CONFIRMAR AUMENTO", `¿Aplicar un ${perc}% de aumento a los ${selectedIds.length} productos?`, async () => {
      // Usamos una promesa para ejecutar todas las actualizaciones en paralelo
      const updates = selectedIds.map(async (id) => {
        const prod = products.find(p => p.id === id);
        if (!prod) return;
        const newPrice = Math.round(prod.price * (1 + perc / 100));
        return supabase.from('products').update({ price: newPrice }).eq('id', id);
      });
      
      await Promise.all(updates);
      setSelectedIds([]);
      setPercentageValue("");
      onRefresh();
      closeAlert();
    });
  };

  return (
    <div className="animate-in fade-in duration-500 max-w-full overflow-hidden pb-32 md:pb-10">
      <AdminFilters 
        searchTerm={searchTerm} setSearchTerm={setSearchTerm}
        filterCategory={filterCategory} setFilterCategory={setFilterCategory}
        filterStock={filterStock} setFilterStock={setFilterStock}
        filterVisible={filterVisible} setFilterVisible={setFilterVisible}
        filterPhoto={filterPhoto} setFilterPhoto={setFilterPhoto}
        sortBy={sortBy} setSortBy={setSortBy}
        categories={categories}
      />

      {/* BARRA DE ACCIONES MASIVAS */}
      {selectedIds.length > 0 && (
        <div className="mb-6 flex flex-wrap items-center gap-4 bg-[#2B4233] p-4 md:p-5 rounded-[2.5rem] shadow-xl animate-in slide-in-from-top duration-300 border border-[#EDB2D1]/10">
          <span className="text-[10px] font-black uppercase text-[#EDB2D1] ml-4 tracking-[0.2em]">
            {selectedIds.length} Seleccionados
          </span>
          <div className="flex gap-2.5 ml-auto">
            <button 
              onClick={() => setPercentageModalOpen(true)} 
              className="px-5 py-2.5 bg-[#EDB2D1] text-[#2B4233] rounded-full text-[9px] font-black uppercase tracking-widest hover:bg-white transition-all shadow-sm active:scale-95"
            >
              📈 Aumentar %
            </button>
            <button 
              onClick={handleBulkDelete} 
              className="px-5 py-2.5 bg-white/5 border border-white/10 text-white rounded-full text-[9px] font-black uppercase tracking-widest hover:bg-red-950/20 transition-all active:scale-95"
            >
              🗑️ Eliminar Varios
            </button>
          </div>
        </div>
      )}

      {/* SELECCIONAR TODO */}
      <div className="mb-6 px-6 flex items-center gap-3 group cursor-pointer" onClick={toggleSelectAll}>
        <div className={`w-6 h-6 rounded-lg border-2 flex items-center justify-center transition-all ${selectedIds.length === filtered.length && filtered.length > 0 ? 'bg-[#2B4233] border-[#2B4233]' : 'border-gray-200 bg-white'}`}>
          {selectedIds.length === filtered.length && filtered.length > 0 && <span className="text-white text-xs">✓</span>}
        </div>
        <span className="text-[10px] font-black uppercase text-gray-400 tracking-widest group-hover:text-[#2B4233] transition-colors">Seleccionar visibles</span>
      </div>

      {/* VISTA PC */}
      <div className="hidden md:block bg-white rounded-[3rem] shadow-xl border border-[#EDB2D1]/10 overflow-hidden">
        <table className="w-full text-left">
          <thead className="bg-[#FDFBF7] text-[9px] font-black uppercase opacity-40 border-b border-[#EDB2D1]/10">
            <tr>
              <th className="px-8 py-6 w-10"></th>
              <th className="px-2 py-6">Producto</th>
              <th className="px-2 py-6 text-center">Stock</th>
              <th className="px-2 py-6 text-center">Precio</th>
              <th className="px-8 py-6 text-right">Acciones</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-[#EDB2D1]/5">
            {filtered.map(p => (
              <tr key={p.id} className={`hover:bg-[#FDFBF7]/50 transition-colors ${selectedIds.includes(p.id) ? 'bg-[#EDB2D1]/5' : ''}`}>
                <td className="px-8 py-4">
                  <input type="checkbox" checked={selectedIds.includes(p.id)} onChange={() => toggleSelectOne(p.id)} className="w-4 h-4 accent-[#2B4233] cursor-pointer" />
                </td>
                <td className="px-2 py-4 flex items-center gap-4">
                  <img src={p.image_url || '/images/placeholder.jpg'} className="w-12 h-12 rounded-2xl object-cover shadow-sm" alt={p.name} />
                  <div className="flex flex-col">
                    <span className="font-bold text-sm text-[#2B4233] uppercase leading-none mb-1">{p.name}</span>
                    <span className="text-[9px] text-[#EDB2D1] font-black uppercase tracking-widest">{p.category}</span>
                  </div>
                </td>
                <td className={`px-2 py-4 text-center font-mono font-bold text-sm ${p.stock <= 0 ? 'text-gray-300' : 'text-[#2B4233]'}`}>{p.stock}</td>
                <td className="px-2 py-4 font-mono font-bold text-sm text-center">${(p.price / 100).toLocaleString('es-AR')}</td>
                <td className="px-8 py-4 text-right">
                    <div className="flex justify-end gap-2.5">
                        <button onClick={() => onEdit(p)} className="p-2.5 hover:bg-gray-100 rounded-full transition-all text-base">✏️</button>
                        <button onClick={() => onDelete(p.id)} className="p-2.5 hover:bg-red-50 text-gray-200 hover:text-red-400 rounded-full transition-all text-base">🗑️</button>
                    </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* VISTA MÓVIL */}
      <div className="md:hidden space-y-4 px-2">
        {filtered.map(p => (
          <div 
            key={p.id} 
            onClick={() => toggleSelectOne(p.id)}
            className={`bg-white p-5 rounded-[2.5rem] border transition-all active:scale-95 ${selectedIds.includes(p.id) ? 'border-[#EDB2D1] shadow-md ring-1 ring-[#EDB2D1]' : 'border-[#EDB2D1]/10 shadow-sm'}`}
          >
            <div className="flex items-center gap-4">
              <div className={`w-6 h-6 rounded-full border-2 flex-none flex items-center justify-center ${selectedIds.includes(p.id) ? 'bg-[#EDB2D1] border-[#EDB2D1]' : 'border-gray-100'}`}>
                {selectedIds.includes(p.id) && <span className="text-[#2B4233] text-[10px] font-bold">✓</span>}
              </div>
              <img src={p.image_url || '/images/placeholder.jpg'} className="w-16 h-16 rounded-[1.8rem] object-cover" alt={p.name} />
              <div className="flex-1 min-w-0">
                <h4 className="font-bold text-[#2B4233] text-sm uppercase truncate mb-1.5 leading-none">{p.name}</h4>
                <p className="font-mono font-black text-[#2B4233] text-base leading-none">${(p.price / 100).toLocaleString('es-AR')}</p>
              </div>
              <button 
                onClick={(e) => { e.stopPropagation(); onEdit(p); }} 
                className="w-10 h-10 flex flex-none items-center justify-center bg-[#FDFBF7] rounded-full border border-gray-100"
              >
                ✏️
              </button>
            </div>
          </div>
        ))}
      </div>

      {/* MODAL PORCENTAJE */}
      {percentageModalOpen && (
        <div className="fixed inset-0 z-[200] flex items-center justify-center p-4 bg-[#2B4233]/40 backdrop-blur-sm">
          <div className="bg-white w-full max-w-sm rounded-[3rem] p-8 lg:p-10 shadow-2xl border border-[#EDB2D1]/20">
            <div className="flex justify-between items-center mb-7">
              <h3 className="font-diner text-3xl text-[#2B4233] uppercase">Ajuste de Precios</h3>
              <button onClick={() => setPercentageModalOpen(false)} className="text-gray-300 text-3xl">×</button>
            </div>
            <div className="relative mb-8">
              <span className="absolute right-5 top-1/2 -translate-y-1/2 text-sm font-black text-[#2B4233]/30">%</span>
              <input 
                type="number" 
                placeholder="Ej: 15" 
                value={percentageValue} 
                onChange={(e) => setPercentageValue(e.target.value)} 
                className="w-full bg-[#FDFBF7] border border-gray-100 rounded-full px-6 py-4 text-sm font-black text-[#2B4233] outline-none focus:border-[#EDB2D1]" 
                autoFocus
              />
            </div>
            <button 
              onClick={applyBulkPriceUpdate} 
              className="w-full py-4 bg-[#EDB2D1] text-[#2B4233] rounded-full text-[10px] font-black uppercase tracking-[0.2em] shadow-lg active:scale-95"
            >
              Continuar
            </button>
          </div>
        </div>
      )}

      {/* --- ESTA PARTE ES LA QUE HACÍA QUE NO FUNCIONE --- */}
      <TytaAlert 
        alert={alert} 
        onConfirm={alert?.onConfirm} 
        onCancel={closeAlert} 
      />
    </div>
  );
}