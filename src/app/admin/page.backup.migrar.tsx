"use client";

import { useState, useEffect } from "react";
import { supabase } from "@/lib/supabase";
import Link from "next/link";

const CATEGORIES = ["Tortas", "Macarrons", "Cafetería", "Bebidas y Tragos", "Combos", "Desayuno y Merienda", "Cookies, Budines y Alfajores", "Sandwichs y Tostados", "Salados", "Adicionales"];

export default function AdminPage() {
  const [products, setProducts] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [isAdding, setIsAdding] = useState(false);
  const [editingProduct, setEditingProduct] = useState<any | null>(null);
  
  const [searchTerm, setSearchTerm] = useState("");
  const [sortBy, setSortBy] = useState("name-asc"); 
  const [filterStock, setFilterStock] = useState("all"); 
  const [filterVisible, setFilterVisible] = useState("all");
  const [filterCategory, setFilterCategory] = useState("all");
  const [filterPhoto, setFilterPhoto] = useState("all");

  const [newProduct, setNewProduct] = useState<any>({
    name: "", price: 0, cost: 0, category: "Tortas", image_url: "", stock: 0, critical_stock: 3, is_visible: true
  });

  useEffect(() => { fetchProducts(); }, []);

  async function fetchProducts() {
    setLoading(true);
    const { data, error } = await supabase.from('products').select('*').order('name', { ascending: true });
    if (!error && data) setProducts(data);
    setLoading(false);
  }

  // --- BACKUPS ---
  const saveBackup = () => {
    const blob = new Blob([JSON.stringify(products, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `backup_tyta_${new Date().toLocaleDateString()}.json`;
    a.click();
  };

  const loadBackup = (e: any) => {
    const file = e.target.files[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = async (event: any) => {
      const json = JSON.parse(event.target.result as string);
      await supabase.from('products').insert(json.map(({id, created_at, ...rest}: any) => rest));
      fetchProducts();
    };
    reader.readAsText(file);
  };

  // --- MIGRACIÓN UNIVERSAL ---
  const runMigration = () => {
    let rawData = null;
    const possibleKeys = ['tyta_catalog_v1', 'tyta_products', 'products', 'catalog', 'tyta_catalog'];
    
    for (const key of possibleKeys) {
      const found = localStorage.getItem(key);
      if (found) { rawData = found; break; }
    }

    if (!rawData) {
      for (let i = 0; i < localStorage.length; i++) {
        const key = localStorage.key(i);
        const val = localStorage.getItem(key || '');
        if (val && val.includes('"name":')) { rawData = val; break; }
      }
    }

    if (!rawData) return alert("No se encontró rastro de productos en este navegador.");

    const localData = JSON.parse(rawData);
    const migrated = localData.map((p: any) => ({
      name: p.name || "Sin Nombre",
      category: p.category || 'General',
      price: Math.round(Number(p.price || 0) * 100), 
      cost: Math.round(Number(p.cost || 0) * 100),   
      stock: Number(p.stock || 0),
      critical_stock: Number(p.critical_stock || 3),
      image_url: p.image_url || '',
      is_visible: p.is_visible !== false
    }));

    const blob = new Blob([JSON.stringify(migrated, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `MIGRACION_FINAL.json`;
    a.click();
    alert("¡Descargado! Ahora usá 'Recuperar Backup' con este archivo.");
  };

  async function handleSave(e: any) {
    e.preventDefault();
    const payload = editingProduct || newProduct;
    const { id, created_at, ...cleanPayload } = payload;
    if (editingProduct) {
      await supabase.from('products').update(cleanPayload).eq('id', id);
    } else {
      await supabase.from('products').insert([cleanPayload]);
    }
    setIsAdding(false); setEditingProduct(null); fetchProducts();
  }

  const filtered = products.filter(p => {
    const matchSearch = p.name?.toLowerCase().includes(searchTerm.toLowerCase());
    const matchCat = filterCategory === "all" || p.category === filterCategory;
    const matchVis = filterVisible === "all" || (filterVisible === "visible" ? p.is_visible : !p.is_visible);
    let matchStock = true;
    if (filterStock === "in-stock") matchStock = Number(p.stock) > 0;
    if (filterStock === "out-of-stock") matchStock = Number(p.stock) <= 0;
    const hasPhoto = p.image_url && p.image_url.length > 5;
    const matchPhoto = filterPhoto === "all" || (filterPhoto === "with" ? hasPhoto : !hasPhoto);
    return matchSearch && matchCat && matchVis && matchStock && matchPhoto;
  });

  if (loading) return <div className="min-h-screen flex items-center justify-center font-diner text-4xl text-[#2B4233]">Cargando...</div>;

  return (
    <div className="min-h-screen bg-[#FDFBF7] p-4 sm:p-6 font-josefin text-[#2B4233]">
      <header className="max-w-[1400px] mx-auto mb-4">
        <div className="flex justify-between items-start mb-4">
          <div className="flex flex-col gap-2">
            <h1 className="text-6xl font-diner uppercase tracking-tight">Gestión Pro</h1>
            <div className="flex gap-2">
              <button onClick={saveBackup} className="px-3 py-1 border border-gray-300 rounded-md text-[9px] font-bold uppercase transition-all hover:border-[#EDB2D1] hover:text-[#EDB2D1] bg-white cursor-pointer">Guardar Backup</button>
              <label className="px-3 py-1 border border-gray-300 rounded-md text-[9px] font-bold uppercase transition-all hover:border-[#EDB2D1] hover:text-[#EDB2D1] bg-white cursor-pointer">
                Recuperar Backup <input type="file" className="hidden" onChange={loadBackup} />
              </label>
              <button onClick={runMigration} className="px-3 py-1 border border-orange-300 text-orange-600 rounded-md text-[9px] font-bold uppercase bg-orange-50 cursor-pointer">🟠 Migrar Local</button>
            </div>
          </div>
          <div className="flex flex-col items-end gap-2">
            <div className="flex gap-2">
              <Link href="/tienda" className="px-4 py-1.5 border border-[#EDB2D1] text-[#EDB2D1] rounded-full text-[10px] font-bold uppercase hover:bg-[#EDB2D1] hover:text-white transition-all">Tienda</Link>
              <button onClick={() => setIsAdding(true)} className="px-6 py-1.5 bg-[#2B4233] text-white rounded-full text-[10px] font-bold uppercase shadow-md hover:bg-black transition-all cursor-pointer">+ Nuevo</button>
            </div>
            <span className="text-[10px] font-black uppercase tracking-widest text-gray-700">Mostrando {filtered.length} de {products.length} productos</span>
          </div>
        </div>

        <div className="bg-white p-3 rounded-xl shadow-sm border border-gray-100 flex flex-wrap gap-2 items-center">
          <div className="relative flex-1 min-w-[250px]">
            <input type="text" placeholder="Buscar producto..." value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} className="w-full pl-4 pr-10 py-2.5 bg-gray-50 border-none rounded-lg outline-none text-base font-bold" />
            {searchTerm && <button onClick={() => setSearchTerm("")} className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-300 hover:text-red-500 font-bold text-2xl">×</button>}
          </div>
          <div className="flex flex-wrap gap-1.5">
            <select value={filterStock} onChange={(e) => setFilterStock(e.target.value)} className="bg-gray-50 rounded-lg px-3 py-2.5 text-sm font-bold outline-none cursor-pointer"><option value="all">Stock</option><option value="in-stock">En Stock</option><option value="out-of-stock">Agotado</option></select>
            <select value={filterVisible} onChange={(e) => setFilterVisible(e.target.value)} className="bg-gray-50 rounded-lg px-3 py-2.5 text-sm font-bold outline-none cursor-pointer"><option value="all">Tienda</option><option value="visible">Publicado</option><option value="hidden">Oculto</option></select>
            <select value={filterCategory} onChange={(e) => setFilterCategory(e.target.value)} className="bg-gray-50 rounded-lg px-3 py-2.5 text-sm font-bold outline-none cursor-pointer"><option value="all">Categoría</option>{CATEGORIES.map(c => <option key={c} value={c}>{c}</option>)}</select>
            <select value={filterPhoto} onChange={(e) => setFilterPhoto(e.target.value)} className="bg-gray-50 rounded-lg px-3 py-2.5 text-sm font-bold outline-none cursor-pointer"><option value="all">Fotos</option><option value="with">Con Foto</option><option value="without">Sin Foto</option></select>
          </div>
        </div>
      </header>

      <main className="max-w-[1400px] mx-auto bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden text-[#2B4233]">
        <table className="w-full text-left border-collapse">
          <thead className="bg-gray-50 uppercase text-[9px] tracking-widest font-black opacity-70 border-b border-gray-100">
            <tr><th className="px-6 py-3">Producto</th><th className="px-4 py-3 text-center">Tienda</th><th className="px-4 py-3 text-center">Stock</th><th className="px-4 py-3 text-center">Costo</th><th className="px-4 py-3 text-center">Precio</th><th className="px-4 py-3 text-center">Margen</th><th className="px-6 py-3 text-center">Acciones</th></tr>
          </thead>
          <tbody className="divide-y divide-gray-50">
            {filtered.map((p) => (
              <tr key={p.id} className="hover:bg-gray-50/20 transition-colors">
                <td className="px-6 py-1.5 flex items-center gap-3 font-bold"><img src={p.image_url || '/images/placeholder.jpg'} className="w-8 h-8 rounded-lg object-cover border" /><div className="flex flex-col"><span className="text-sm font-bold leading-tight">{p.name}</span><span className="text-[8px] uppercase opacity-40 tracking-wider font-black">{p.category}</span></div></td>
                <td className="px-4 py-1.5 text-center"><button onClick={async () => { await supabase.from('products').update({is_visible: !p.is_visible}).eq('id', p.id); fetchProducts(); }} className={`relative inline-flex h-4 w-8 items-center rounded-full transition-colors cursor-pointer ${p.is_visible ? "bg-[#2B4233]" : "bg-gray-200"}`}><span className={`inline-block h-2.5 w-2.5 transform rounded-full bg-white transition-transform ${p.is_visible ? "translate-x-4" : "translate-x-1"}`} /></button></td>
                <td className="px-4 py-1.5 text-center font-bold text-sm">{p.stock}</td>
                <td className="px-4 py-1.5 text-center font-mono text-sm italic font-black">{p.cost}</td>
                <td className="px-4 py-1.5 text-center font-mono text-sm italic font-black">{p.price}</td>
                <td className="px-4 py-1.5 text-center font-mono text-sm italic font-black">{p.price > 0 ? Math.round(((p.price - p.cost) / p.price) * 100) : 0}%</td>
                <td className="px-6 py-1.5 text-center flex justify-center gap-4"><button onClick={() => setEditingProduct(p)} className="text-[#EDB2D1] cursor-pointer">✏️</button><button onClick={async () => { if(confirm('¿Eliminar?')) { await supabase.from('products').delete().eq('id', p.id); fetchProducts(); } }} className="text-gray-300 hover:text-red-500 cursor-pointer">🗑️</button></td>
              </tr>
            ))}
          </tbody>
        </table>
      </main>

      {(isAdding || editingProduct) && (
        <div className="fixed inset-0 z-50 flex justify-end">
          <div className="absolute inset-0 bg-[#2B4233]/20 backdrop-blur-sm" onClick={() => { setIsAdding(false); setEditingProduct(null); }} />
          <div className="relative w-full max-w-sm bg-white shadow-2xl p-6 overflow-y-auto border-l border-gray-100 text-[#2B4233]">
            <h2 className="text-4xl font-diner mb-6 uppercase">{editingProduct ? 'EDITAR' : 'NUEVO'}</h2>
            <form onSubmit={handleSave} className="space-y-3">
              <div className="flex flex-col items-center gap-2 p-3 border rounded-xl bg-gray-50/50">
                <img src={editingProduct?.image_url || newProduct.image_url || "/images/placeholder.jpg"} className="w-16 h-16 rounded-full object-cover shadow-sm border-2 border-white" />
                <input type="text" placeholder="URL Imagen" className="w-full p-2 text-[9px] border rounded-lg text-center bg-white" value={editingProduct ? editingProduct.image_url : newProduct.image_url} onChange={(e) => editingProduct ? setEditingProduct({...editingProduct, image_url: e.target.value}) : setNewProduct({...newProduct, image_url: e.target.value})} />
              </div>
              <div className="space-y-1"><label className="text-[10px] font-black uppercase text-gray-700">Nombre</label><input type="text" value={editingProduct ? editingProduct.name : newProduct.name} className="w-full p-2 bg-gray-50 border-none rounded-lg outline-none font-bold text-sm" onChange={(e) => editingProduct ? setEditingProduct({...editingProduct, name: e.target.value}) : setNewProduct({...newProduct, name: e.target.value})} required /></div>
              <div className="space-y-1"><label className="text-[10px] font-black uppercase text-gray-700">Categoría</label><select value={editingProduct ? editingProduct.category : newProduct.category} className="w-full p-2 bg-gray-50 border-none rounded-lg font-bold text-sm" onChange={(e) => editingProduct ? setEditingProduct({...editingProduct, category: e.target.value}) : setNewProduct({...newProduct, category: e.target.value})}>{CATEGORIES.map(cat => <option key={cat} value={cat}>{cat}</option>)}</select></div>
              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1"><label className="text-[10px] font-black uppercase text-gray-700">Stock</label><input type="number" value={editingProduct ? editingProduct.stock : newProduct.stock} className="w-full p-2 bg-gray-50 border-none rounded-lg font-bold text-center text-base" onChange={(e) => editingProduct ? setEditingProduct({...editingProduct, stock: e.target.value}) : setNewProduct({...newProduct, stock: e.target.value})} required /></div>
                <div className="space-y-1"><label className="text-[10px] font-black uppercase text-[#EDB2D1]">Crítico</label><input type="number" value={editingProduct ? (editingProduct.critical_stock ?? "") : (newProduct.critical_stock ?? "")} className="w-full p-2 bg-[#FDFBF7] border border-[#EDB2D1]/20 rounded-lg font-bold text-center text-base text-[#EDB2D1]" onChange={(e) => editingProduct ? setEditingProduct({...editingProduct, critical_stock: e.target.value}) : setNewProduct({...newProduct, critical_stock: e.target.value})} /></div>
              </div>
              <div className="grid grid-cols-3 gap-3">
                <div className="space-y-1"><label className="text-[10px] font-black uppercase text-gray-700">Costo</label><input type="number" value={editingProduct ? editingProduct.cost : newProduct.cost} className="w-full p-2 bg-gray-50 border-none rounded-lg font-bold text-xs text-center" onChange={(e) => editingProduct ? setEditingProduct({...editingProduct, cost: e.target.value}) : setNewProduct({...newProduct, cost: e.target.value})} /></div>
                <div className="space-y-1"><label className="text-[10px] font-black uppercase text-gray-700">Venta</label><input type="number" value={editingProduct ? editingProduct.price : newProduct.price} className="w-full p-2 bg-gray-50 border-none rounded-lg font-black text-xs text-center" onChange={(e) => editingProduct ? setEditingProduct({...editingProduct, price: e.target.value}) : setNewProduct({...newProduct, price: e.target.value})} required /></div>
                <div className="space-y-1"><label className="text-[10px] font-black uppercase text-gray-700">Margen</label><div className="h-[36px] flex items-center justify-center bg-[#2B4233] text-[#EDB2D1] rounded-lg text-sm font-diner">{editingProduct?.price > 0 ? Math.round(((editingProduct.price - editingProduct.cost) / editingProduct.price) * 100) : 0}%</div></div>
              </div>
              <div className="pt-4 flex flex-col gap-2">
                <button type="submit" className="w-full py-3 bg-[#EDB2D1] text-[#2B4233] rounded-full font-black uppercase tracking-widest shadow-md hover:bg-[#eb9dbf] cursor-pointer">GUARDAR</button>
                <button type="button" onClick={() => { setIsAdding(false); setEditingProduct(null); }} className="w-full py-2 text-gray-400 font-bold uppercase text-[10px] tracking-widest hover:text-red-500 cursor-pointer text-center">CANCELAR</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}