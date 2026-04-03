"use client";

import { useState, useEffect } from "react";
import { supabase } from "@/lib/supabase";
import Link from "next/link";
import { CldUploadWidget } from 'next-cloudinary';

export default function AdminPage() {
  const [products, setProducts] = useState<any[]>([]);
  const [categories, setCategories] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [mounted, setMounted] = useState(false); // ✅ AHORA DESCOMENTADO
  
  const [isAdding, setIsAdding] = useState(false);
  const [editingProduct, setEditingProduct] = useState<any | null>(null);
  const [isManagingCats, setIsManagingCats] = useState(false);
  const [newCatName, setNewCatName] = useState("");
  const [selectedIds, setSelectedIds] = useState<string[]>([]);

  // LOS 5 FILTROS
  const [searchTerm, setSearchTerm] = useState("");
  const [filterCategory, setFilterCategory] = useState("all");
  const [filterStock, setFilterStock] = useState("all");
  const [filterVisible, setFilterVisible] = useState("all");
  const [filterPhoto, setFilterPhoto] = useState("all");
  const [sortBy, setSortBy] = useState("name-asc"); 

  // CONTROL DE INICIO Y REALTIME
  useEffect(() => {
    setMounted(true);
    fetchInitialData();

    // Suscripción Realtime blindada para Vercel
    const channel = supabase
      .channel('orders_realtime')
      .on('postgres_changes' as any, { event: '*', table: 'orders' }, () => {
        // En lugar de window.location.reload que es agresivo, refrescamos data
        fetchInitialData(); 
      })
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, []);

  // CONTROL DE ESCAPE Y SCROLL
  useEffect(() => {
    const isModalOpen = isAdding || editingProduct;
    document.body.style.overflow = isModalOpen ? "hidden" : "unset";
    const handleEsc = (e: KeyboardEvent) => {
      if (e.key === "Escape") { setIsAdding(false); setEditingProduct(null); }
    };
    window.addEventListener("keydown", handleEsc);
    return () => {
      window.removeEventListener("keydown", handleEsc);
      document.body.style.overflow = "unset";
    };
  }, [isAdding, editingProduct]);

  async function fetchInitialData() {
    setLoading(true);
    const { data: catData } = await supabase.from('categories').select('*').order('name');
    const { data: prodData } = await supabase.from('products').select('*').order('name');
    if (catData) setCategories(catData);
    if (prodData) setProducts(prodData);
    setLoading(false);
  }

  const normalizeText = (text: string) => {
    return text.toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "").trim();
  };

  const formatARS = (cents: number) => {
    return new Intl.NumberFormat('es-AR', { style: 'currency', currency: 'ARS', minimumFractionDigits: 0 }).format(cents / 100);
  };

  // ACCIONES
  const handleSelectAll = (e: any) => {
    if (e.target.checked) setSelectedIds(filtered.map(p => p.id));
    else setSelectedIds([]);
  };

  const deleteSelected = async () => {
    if (confirm(`¿Eliminar ${selectedIds.length} productos?`)) {
      setLoading(true);
      await supabase.from('products').delete().in('id', selectedIds);
      setSelectedIds([]);
      await fetchInitialData();
    }
  };

  const massPriceAdjust = async () => {
    const percent = prompt("Ajuste masivo (%) - Ejemplo: 10");
    if (!percent || isNaN(Number(percent))) return;
    const factor = 1 + (Number(percent) / 100);
    setLoading(true);
    for (const p of filtered) {
      await supabase.from('products').update({ price: Math.round(p.price * factor) }).eq('id', p.id);
    }
    await fetchInitialData();
  };

  async function handleAddCategory() {
    if (!newCatName) return;
    await supabase.from('categories').insert([{ name: newCatName }]);
    setNewCatName(""); fetchInitialData();
  }

  async function handleDeleteCategory(name: string) {
    const { error } = await supabase.from('categories').delete().eq('name', name);
    if (error) alert("⚠️ Categoría con productos vinculados. Movelos primero.");
    else fetchInitialData();
  }

  const [newProduct, setNewProduct] = useState<any>({ name: "", price: 0, cost: 0, category: "", image_url: "", description: "", stock: 0, critical_stock: 3, is_visible: true });

  async function handleSaveProduct(e: any) {
    e.preventDefault();
    setLoading(true);
    const payload = editingProduct || newProduct;
    const { id, created_at, ...cleanPayload } = payload;
    if (editingProduct) await supabase.from('products').update(cleanPayload).eq('id', id);
    else await supabase.from('products').insert([cleanPayload]);
    setIsAdding(false); setEditingProduct(null); fetchInitialData();
  }

  const filtered = products.filter(p => {
    const matchSearch = normalizeText(p.name || "").includes(normalizeText(searchTerm));
    const matchCat = filterCategory === "all" || normalizeText(p.category || "") === normalizeText(filterCategory);
    const matchVis = filterVisible === "all" || (filterVisible === "visible" ? p.is_visible : !p.is_visible);
    const isOut = Number(p.stock) <= 0;
    const isCritical = !isOut && Number(p.stock) <= (p.critical_stock || 3);
    
    let matchStock = true;
    if (filterStock === "in-stock") matchStock = !isOut;
    if (filterStock === "critical") matchStock = isCritical;
    if (filterStock === "out-of-stock") matchStock = isOut;
    
    const hasPhoto = p.image_url && p.image_url.trim().length > 10;
    const matchPhoto = filterPhoto === "all" || (filterPhoto === "with" ? hasPhoto : !hasPhoto);

    return matchSearch && matchCat && matchStock && matchVis && matchPhoto;
  }).sort((a, b) => {
    if (sortBy === "price-asc") return a.price - b.price;
    return (a.name || "").localeCompare(b.name || "");
  });

  if (!mounted) return <div className="min-h-screen bg-[#FDFBF7]" />;

  return (
    <div className="min-h-screen bg-[#FDFBF7] p-4 sm:p-8 font-josefin text-[#2B4233]">
      {/* HEADER */}
      <header className="max-w-[1400px] mx-auto mb-6 flex flex-wrap justify-between items-end bg-white p-6 rounded-[2.5rem] shadow-sm border border-[#EDB2D1]/10 gap-4">
        <div>
          <h1 className="text-5xl font-diner uppercase leading-none mb-3">Gestión Tyta</h1>
          <button onClick={() => setIsManagingCats(!isManagingCats)} className="text-[10px] font-black uppercase tracking-widest border-2 border-[#EDB2D1] text-[#EDB2D1] px-4 py-2 rounded-full hover:bg-[#EDB2D1] hover:text-white transition-all">
            {isManagingCats ? "✕ CERRAR GESTOR" : "⚙️ GESTIONAR CATEGORÍAS"}
          </button>
        </div>
        <div className="flex flex-col items-end gap-2">
          <div className="flex gap-2">
            <Link href="/tienda" className="px-5 py-2 border-2 border-[#2B4233] rounded-full text-[9px] font-black uppercase hover:bg-[#2B4233] hover:text-white transition-all">TIENDA</Link>
            <button onClick={() => { setNewProduct({ name: "", price: 0, cost: 0, category: categories[0]?.name || "", image_url: "", description: "", stock: 0, critical_stock: 3, is_visible: true }); setIsAdding(true); }} className="px-5 py-2 bg-[#2B4233] text-white rounded-full text-[9px] font-black uppercase tracking-widest">+ NUEVO</button>
          </div>
          <span className="text-[10px] font-black uppercase opacity-50 bg-[#FDFBF7] px-3 py-1 rounded-full">Mostrando {filtered.length} de {products.length}</span>
        </div>
      </header>

      {/* CATEGORÍAS */}
      {isManagingCats && (
        <div className="max-w-[1400px] mx-auto mb-6 bg-white p-8 rounded-[3rem] shadow-xl border-4 border-[#EDB2D1]/10">
          <h3 className="font-diner text-3xl mb-4 uppercase">Categorías</h3>
          <div className="flex gap-2 mb-6">
            <input type="text" value={newCatName} onChange={(e) => setNewCatName(e.target.value)} placeholder="Nueva..." className="flex-1 px-4 py-2.5 bg-[#FDFBF7] border-2 border-[#EDB2D1]/10 rounded-xl outline-none font-bold text-sm" />
            <button onClick={handleAddCategory} className="px-6 py-2.5 bg-[#2B4233] text-white rounded-xl font-black text-[9px] uppercase tracking-widest">Añadir</button>
          </div>
          <div className="flex flex-wrap gap-2">
            {categories.map(cat => (
              <div key={cat.id} className="flex items-center gap-2 bg-white border-2 border-[#FDFBF7] shadow-sm px-3 py-2 rounded-lg">
                <span className="font-black text-[10px] uppercase">{cat.name}</span>
                <button onClick={() => handleDeleteCategory(cat.name)} className="text-gray-300 hover:text-red-500 font-bold ml-1">✕</button>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* LOS 5 FILTROS */}
      <div className="max-w-[1400px] mx-auto mb-6 bg-white p-4 rounded-[2rem] shadow-sm border border-[#EDB2D1]/20">
        <div className="flex flex-wrap gap-2 items-center">
          <input type="text" placeholder="Buscar..." value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} className="flex-1 min-w-[150px] px-5 py-3 bg-[#FDFBF7] border border-[#EDB2D1]/20 rounded-xl outline-none font-bold text-sm shadow-inner" />
          <div className="flex flex-wrap gap-1">
            <select value={filterCategory} onChange={(e) => setFilterCategory(e.target.value)} className="px-3 py-3 bg-[#FDFBF7] border border-[#EDB2D1]/20 rounded-xl font-bold uppercase text-[8px] outline-none cursor-pointer">
              <option value="all">CATEGORÍA</option>
              {categories.map(cat => <option key={cat.id} value={cat.name}>{cat.name}</option>)}
            </select>
            <select value={filterStock} onChange={(e) => setFilterStock(e.target.value)} className="px-3 py-3 bg-[#FDFBF7] border border-[#EDB2D1]/20 rounded-xl font-bold uppercase text-[8px] outline-none cursor-pointer">
              <option value="all">STOCK</option>
              <option value="in-stock">EN STOCK</option>
              <option value="critical">CRÍTICO ⚠️</option>
              <option value="out-of-stock">AGOTADO</option>
            </select>
            <select value={filterVisible} onChange={(e) => setFilterVisible(e.target.value)} className="px-3 py-3 bg-[#FDFBF7] border border-[#EDB2D1]/20 rounded-xl font-bold uppercase text-[8px] outline-none cursor-pointer">
              <option value="all">TIENDA</option>
              <option value="visible">VISIBLE</option>
              <option value="hidden">OCULTO</option>
            </select>
            <select value={filterPhoto} onChange={(e) => setFilterPhoto(e.target.value)} className="px-3 py-3 bg-[#FDFBF7] border border-[#EDB2D1]/20 rounded-xl font-bold uppercase text-[8px] outline-none cursor-pointer">
              <option value="all">FOTOS</option>
              <option value="with">CON FOTO</option>
              <option value="without">SIN FOTO</option>
            </select>
            <select value={sortBy} onChange={(e) => setSortBy(e.target.value)} className="px-3 py-3 bg-[#FDFBF7] border border-[#EDB2D1]/20 rounded-xl font-bold uppercase text-[8px] outline-none cursor-pointer">
              <option value="name-asc">ORDEN A-Z</option>
              <option value="price-asc">$$ MENOR</option>
            </select>
          </div>
          <div className="flex gap-1 ml-auto">
            {selectedIds.length > 0 && <button onClick={deleteSelected} className="px-4 py-3 bg-red-500 text-white rounded-xl text-[8px] font-black uppercase">Borrar ({selectedIds.length})</button>}
            <button onClick={massPriceAdjust} className="px-4 py-3 border-2 border-[#EDB2D1] text-[#EDB2D1] rounded-xl text-[8px] font-black uppercase bg-white">Ajuste Masivo %</button>
          </div>
        </div>
      </div>

      {/* TABLA */}
      <div className="max-w-[1400px] mx-auto bg-white rounded-[2.5rem] shadow-xl border border-[#EDB2D1]/10 overflow-x-auto">
        <table className="w-full text-left min-w-[1100px]">
          <thead className="bg-[#FDFBF7] text-[9px] font-black uppercase opacity-40 border-b border-[#EDB2D1]/10">
            <tr>
              <th className="px-6 py-5 text-center w-16"><input type="checkbox" onChange={handleSelectAll} checked={selectedIds.length === filtered.length && filtered.length > 0} className="w-3 h-3 accent-[#EDB2D1]" /></th>
              <th className="px-2 py-5">Producto</th>
              <th className="px-2 py-5">Categoría</th>
              <th className="px-2 py-5 text-center">Tienda</th>
              <th className="px-2 py-5 text-center">Stock</th>
              <th className="px-2 py-5 text-center text-[#EDB2D1]">Costo</th>
              <th className="px-2 py-5 text-center">Precio</th>
              <th className="px-2 py-5 text-center">Margen</th>
              <th className="px-6 py-5 text-right">Acciones</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-[#EDB2D1]/5">
            {filtered.map(p => {
              const margin = p.price > 0 ? Math.round(((p.price - p.cost) / p.price) * 100) : 0;
              return (
                <tr key={p.id} className={`transition-colors ${selectedIds.includes(p.id) ? 'bg-[#EDB2D1]/5' : 'hover:bg-[#FDFBF7]/50'}`}>
                  <td className="px-6 py-3 text-center"><input type="checkbox" checked={selectedIds.includes(p.id)} onChange={() => setSelectedIds(prev => prev.includes(p.id) ? prev.filter(i => i !== p.id) : [...prev, p.id])} className="w-3 h-3 accent-[#EDB2D1]" /></td>
                  <td className="px-2 py-3 flex items-center gap-3">
                    <img alt="Tyta Patisserie" src={p.image_url || '/images/placeholder.jpg'} className="w-10 h-10 rounded-xl object-cover border-2 border-white" />
                    <span className="font-bold text-sm text-[#2B4233]">{p.name}</span>
                  </td>
                  <td className="px-2 py-3 uppercase text-[8px] font-black text-[#EDB2D1] tracking-tighter">{p.category}</td>
                  <td className="px-2 py-3 text-center">
                    <button onClick={async () => { await supabase.from('products').update({is_visible: !p.is_visible}).eq('id', p.id); fetchInitialData(); }} className={`relative inline-flex h-4 w-8 items-center rounded-full transition-all ${p.is_visible ? "bg-[#2B4233]" : "bg-gray-200"}`}><span className={`h-2.5 w-2.5 rounded-full bg-white transition-transform ${p.is_visible ? "translate-x-5" : "translate-x-0.5"}`} /></button>
                  </td>
                  <td className={`px-2 py-3 text-center font-bold text-sm ${p.stock <= 0 ? 'text-red-400' : ''}`}>{p.stock}</td>
                  <td className="px-2 py-3 text-center font-mono text-[10px] opacity-30 italic font-bold">{formatARS(p.cost)}</td>
                  <td className="px-2 py-3 text-center font-mono font-black text-xs">{formatARS(p.price)}</td>
                  <td className="px-2 py-3 text-center font-mono text-[10px] text-[#2B4233]/40 font-bold">{margin}%</td>
                  <td className="px-6 py-3 text-right">
                    <div className="flex justify-end gap-4">
                      <button onClick={() => setEditingProduct(p)} className="text-[#EDB2D1] text-lg hover:scale-125 transition-transform">✏️</button>
                      <button onClick={async () => { if(confirm('¿Eliminar?')) { await supabase.from('products').delete().eq('id', p.id); fetchInitialData(); } }} className="text-gray-200 hover:text-red-500 text-lg hover:scale-125 transition-transform">🗑️</button>
                    </div>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      {/* MODAL ESPEJO BLINDADO */}
      {(isAdding || editingProduct) && (
        <div className="fixed inset-0 z-[100] flex justify-end">
          <div className="absolute inset-0 bg-[#2B4233]/40 backdrop-blur-sm" />
          <div className="relative w-full max-w-xs bg-white shadow-2xl border-l-8 border-[#EDB2D1] flex flex-col h-full overflow-hidden">
            <div className="p-6 pb-2">
              <h2 className="text-4xl font-diner uppercase text-[#2B4233]">{editingProduct ? 'Editar' : 'Nuevo'}</h2>
            </div>

            <div className="flex-1 overflow-y-auto px-6 py-2 space-y-4 custom-scrollbar">
              <div className="flex flex-col items-center p-4 border-2 border-dashed border-[#EDB2D1]/20 rounded-[2rem] bg-[#FDFBF7]">
                <img alt="Tyta Patisserie" src={editingProduct?.image_url || newProduct.image_url || "/images/placeholder.jpg"} className="w-20 h-20 rounded-xl object-cover mb-2 border-2 border-white shadow-md" />
                <CldUploadWidget 
                  uploadPreset={process.env.NEXT_PUBLIC_CLOUDINARY_UPLOAD_PRESET} 
                  onSuccess={(result: any) => {
                    const url = result.info.secure_url;
                    if(editingProduct) setEditingProduct({...editingProduct, image_url: url});
                    else setNewProduct({...newProduct, image_url: url});
                  }}
                  options={{ maxFileSize: 25000000, clientAllowedFormats: ["jpg", "png", "jpeg", "webp"], maxImageWidth: 2000, singleUploadAutoClose: true }}>
                  {({ open }) => ( <button type="button" onClick={() => open()} className="px-4 py-1.5 bg-[#2B4233] text-[#EDB2D1] rounded-full text-[8px] font-black uppercase tracking-widest shadow-sm">📸 Subir</button> )}
                </CldUploadWidget>
              </div>

              <div className="space-y-1">
                <label className="text-[8px] font-black uppercase text-gray-400">Nombre</label>
                <input type="text" value={editingProduct ? editingProduct.name : newProduct.name} onChange={(e) => editingProduct ? setEditingProduct({...editingProduct, name: e.target.value}) : setNewProduct({...newProduct, name: e.target.value})} className="w-full p-3 bg-[#FDFBF7] border border-gray-100 rounded-xl font-bold text-xs outline-none" required />
              </div>

              <div className="space-y-1">
                <label className="text-[8px] font-black uppercase text-gray-400">Categoría</label>
                <select value={editingProduct ? editingProduct.category : newProduct.category} onChange={(e) => editingProduct ? setEditingProduct({...editingProduct, category: e.target.value}) : setNewProduct({...newProduct, category: e.target.value})} className="w-full p-3 bg-[#FDFBF7] border border-gray-100 rounded-xl font-bold text-xs cursor-pointer" required>
                  <option value="">Seleccionar...</option>
                  {categories.map(cat => <option key={cat.id} value={cat.name}>{cat.name}</option>)}
                </select>
              </div>

              <div className="space-y-1">
                <label className="text-[8px] font-black uppercase text-gray-400">Descripción Boutique</label>
                <textarea 
                  rows={3} 
                  value={editingProduct ? editingProduct.description : newProduct.description} 
                  onChange={(e) => editingProduct ? setEditingProduct({...editingProduct, description: e.target.value}) : setNewProduct({...newProduct, description: e.target.value})} 
                  placeholder="Contá de qué se trata..."
                  className="w-full p-3 bg-[#FDFBF7] border border-gray-100 rounded-xl font-bold text-xs outline-none resize-none"
                />
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div className="space-y-1">
                  <label className="text-[8px] font-black uppercase text-gray-400">Stock Actual</label>
                  <input type="number" value={editingProduct ? editingProduct.stock : newProduct.stock} onChange={(e) => editingProduct ? setEditingProduct({...editingProduct, stock: e.target.value}) : setNewProduct({...newProduct, stock: e.target.value})} className="w-full p-3 bg-[#FDFBF7] border border-gray-100 rounded-xl font-bold text-center text-xs" required />
                </div>
                <div className="space-y-1">
                  <label className="text-[8px] font-black uppercase text-[#EDB2D1]">Stock Crítico ⚠️</label>
                  <input type="number" value={editingProduct ? (editingProduct.critical_stock ?? "") : (newProduct.critical_stock ?? "")} onChange={(e) => editingProduct ? setEditingProduct({...editingProduct, critical_stock: e.target.value}) : setNewProduct({...newProduct, critical_stock: e.target.value})} className="w-full p-3 bg-[#FDFBF7] border-2 border-[#EDB2D1]/20 rounded-xl font-bold text-center text-[#EDB2D1] text-xs" />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div className="space-y-1">
                  <label className="text-[8px] font-black uppercase text-gray-400">Costo (Cts)</label>
                  <input type="number" value={editingProduct ? editingProduct.cost : newProduct.cost} onChange={(e) => editingProduct ? setEditingProduct({...editingProduct, cost: e.target.value}) : setNewProduct({...newProduct, cost: e.target.value})} className="w-full p-3 bg-[#FDFBF7] border border-gray-100 rounded-xl font-bold text-center text-xs" />
                </div>
                <div className="space-y-1">
                  <label className="text-[8px] font-black uppercase text-gray-400">Precio (Cts)</label>
                  <input type="number" value={editingProduct ? editingProduct.price : newProduct.price} onChange={(e) => editingProduct ? setEditingProduct({...editingProduct, price: e.target.value}) : setNewProduct({...newProduct, price: e.target.value})} className="w-full p-3 bg-[#FDFBF7] border border-gray-100 rounded-xl font-bold text-center text-xs" required />
                </div>
              </div>
            </div>

            <div className="p-6 pt-4 bg-white border-t border-gray-50 flex flex-col gap-2">
              <button type="submit" onClick={handleSaveProduct} className="w-full py-4 bg-[#EDB2D1] text-white rounded-full font-black uppercase tracking-widest text-[10px] shadow-lg hover:bg-[#2B4233] transition-all">Guardar</button>
              <button type="button" onClick={() => { setIsAdding(false); setEditingProduct(null); }} className="w-full py-2 text-gray-300 font-bold uppercase text-[8px] tracking-widest hover:text-red-500 transition-colors cursor-pointer text-center">Cancelar (Esc)</button>
            </div>
          </div>
        </div>
      )}

      <style jsx global>{`
        .custom-scrollbar::-webkit-scrollbar { width: 4px; }
        .custom-scrollbar::-webkit-scrollbar-track { background: #fdfbf7; }
        .custom-scrollbar::-webkit-scrollbar-thumb { background: #edb2d1; border-radius: 10px; }
      `}</style>
    </div>
  );
}