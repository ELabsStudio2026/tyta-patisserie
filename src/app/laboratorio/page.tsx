"use client";
import { useState } from "react";
import AdminFilters from "./AdminFilters";

interface AdminInventoryProps {
  products: any[];
  categories: any[];
  onEdit: (product: any) => void;
  onDelete: (id: string) => void;
}

export default function AdminInventory({ products, categories, onEdit, onDelete }: AdminInventoryProps) {
  const [searchTerm, setSearchTerm] = useState("");
  const [filterCategory, setFilterCategory] = useState("all");
  const [filterStock, setFilterStock] = useState("all");
  const [filterVisible, setFilterVisible] = useState("all");
  const [filterPhoto, setFilterPhoto] = useState("all");
  const [sortBy, setSortBy] = useState("name-asc");

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

  return (
    <div className="animate-in fade-in duration-500 max-w-full overflow-hidden">
      <AdminFilters 
        searchTerm={searchTerm} setSearchTerm={setSearchTerm}
        filterCategory={filterCategory} setFilterCategory={setFilterCategory}
        filterStock={filterStock} setFilterStock={setFilterStock}
        filterVisible={filterVisible} setFilterVisible={setFilterVisible}
        filterPhoto={filterPhoto} setFilterPhoto={setFilterPhoto}
        sortBy={sortBy} setSortBy={setSortBy}
        categories={categories}
      />

      {/* --- VISTA TABLET/PC: Tabla tradicional (Se oculta en móviles) --- */}
      <div className="hidden md:block bg-white rounded-[2rem] shadow-xl border border-[#EDB2D1]/10 overflow-hidden">
        <table className="w-full text-left">
          <thead className="bg-[#FDFBF7] text-[8px] font-black uppercase opacity-40 border-b border-[#EDB2D1]/10">
            <tr>
              <th className="px-8 py-5">Producto</th>
              <th className="px-2 py-5">Categoría</th>
              <th className="px-2 py-5 text-center">Stock</th>
              <th className="px-2 py-5 text-center">Etiquetas</th>
              <th className="px-2 py-5 text-center">Precio</th>
              <th className="px-8 py-5 text-right">Acciones</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-[#EDB2D1]/5">
            {filtered.map(p => {
              const isCritical = p.stock > 0 && p.stock <= (p.critical_stock || 3);
              const isOut = p.stock <= 0;
              return (
                <tr key={p.id} className="hover:bg-[#FDFBF7]/50 transition-colors">
                  <td className="px-8 py-4 flex items-center gap-4">
                    <img src={p.image_url || '/images/placeholder.jpg'} className="w-10 h-10 rounded-xl object-cover shadow-sm" alt={p.name} />
                    <div className="flex flex-col">
                      <span className="font-bold text-sm text-[#2B4233]">{p.name}</span>
                      {isCritical && <span className="text-[7px] font-black text-red-500 uppercase">⚠️ Reponer</span>}
                      {isOut && <span className="text-[7px] font-black text-gray-300 uppercase italic">Sin Stock</span>}
                    </div>
                  </td>
                  <td className="px-2 py-4 uppercase text-[8px] font-black text-[#EDB2D1] tracking-tighter">{p.category}</td>
                  <td className={`px-2 py-4 text-center font-mono font-bold text-xs ${isCritical ? 'text-red-500' : isOut ? 'text-gray-300' : 'text-[#2B4233]'}`}>{p.stock}</td>
                  <td className="px-2 py-4">
                    <div className="flex gap-1 justify-center">
                      {p.is_new && <span className="bg-[#2B4233] text-white text-[6px] px-2 py-0.5 rounded uppercase font-black tracking-widest">Novedad</span>}
                      {p.is_offer && <span className="bg-[#EDB2D1] text-[#2B4233] text-[6px] px-2 py-0.5 rounded uppercase font-black tracking-widest">Oferta</span>}
                    </div>
                  </td>
                  <td className="px-2 py-4 font-mono font-black text-xs text-center">
                    {(p.price / 100).toLocaleString('es-AR', { style: 'currency', currency: 'ARS', minimumFractionDigits: 0 })}
                  </td>
                  <td className="px-8 py-4 text-right">
                    <div className="flex justify-end gap-3">
                      <button onClick={() => onEdit(p)} className="p-1 hover:bg-gray-100 rounded-full transition-colors text-lg">✏️</button>
                      <button onClick={() => onDelete(p.id)} className="p-1 hover:bg-red-50 rounded-full transition-colors text-gray-200 hover:text-red-500">🗑️</button>
                    </div>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      {/* --- VISTA MÓVIL: Tarjetas Boutique (Se activa en celulares) --- */}
      <div className="md:hidden space-y-4 px-2">
        {filtered.map(p => {
          const isCritical = p.stock > 0 && p.stock <= (p.critical_stock || 3);
          const isOut = p.stock <= 0;
          return (
            <div key={p.id} className="bg-white p-5 rounded-[2.5rem] border border-[#EDB2D1]/10 shadow-sm flex flex-col gap-4">
              <div className="flex items-center gap-4">
                <div className="relative">
                   <img src={p.image_url || '/images/placeholder.jpg'} className="w-16 h-16 rounded-[1.5rem] object-cover" alt={p.name} />
                   {!p.is_visible && <div className="absolute inset-0 bg-white/60 rounded-[1.5rem] flex items-center justify-center text-[8px] font-black uppercase text-gray-500">Oculto</div>}
                </div>
                <div className="flex-1 min-w-0">
                  <span className="text-[8px] font-black text-[#EDB2D1] uppercase tracking-widest mb-1 block">{p.category}</span>
                  <h4 className="font-bold text-[#2B4233] text-sm truncate uppercase leading-none">{p.name}</h4>
                  <p className="font-mono font-black text-[#2B4233] text-base mt-1.5">
                    {(p.price / 100).toLocaleString('es-AR', { style: 'currency', currency: 'ARS', minimumFractionDigits: 0 })}
                  </p>
                </div>
              </div>

              <div className="flex items-center justify-between pt-2 border-t border-gray-50">
                <div className="flex flex-col">
                  <span className="text-[7px] font-black uppercase text-gray-400">Existencias</span>
                  <span className={`font-mono font-bold text-xs ${isCritical ? 'text-red-500' : isOut ? 'text-gray-200' : 'text-[#2B4233]'}`}>
                    {isOut ? 'SIN STOCK' : `${p.stock} UNIDADES`}
                  </span>
                </div>
                
                <div className="flex gap-2">
                  <div className="flex gap-1 mr-2">
                    {p.is_new && <span className="w-2 h-2 rounded-full bg-[#2B4233]" title="Nuevo" />}
                    {p.is_offer && <span className="w-2 h-2 rounded-full bg-[#EDB2D1]" title="Oferta" />}
                  </div>
                  <button onClick={() => onEdit(p)} className="w-10 h-10 flex items-center justify-center bg-[#FDFBF7] text-[#2B4233] rounded-full border border-gray-100 shadow-sm active:scale-90">✏️</button>
                  <button onClick={() => onDelete(p.id)} className="w-10 h-10 flex items-center justify-center bg-red-50 text-red-300 rounded-full border border-red-100 active:scale-90">🗑️</button>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}