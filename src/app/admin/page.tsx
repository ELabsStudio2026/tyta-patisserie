"use client";

import { useState, useEffect } from "react";
import { supabase } from "@/lib/supabase";
import Link from "next/link";
import AdminFilters from "@/components/admin/AdminFilters";
import ProductAdminModal from "@/components/admin/ProductAdminModal";

export default function AdminPage() {
  const [products, setProducts] = useState<any[]>([]);
  const [categories, setCategories] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [mounted, setMounted] = useState(false); 
  
  const [isAdding, setIsAdding] = useState(false);
  const [editingProduct, setEditingProduct] = useState<any | null>(null);
  
  // LOS 5 FILTROS + ORDEN
  const [searchTerm, setSearchTerm] = useState("");
  const [filterCategory, setFilterCategory] = useState("all");
  const [filterStock, setFilterStock] = useState("all");
  const [filterVisible, setFilterVisible] = useState("all");
  const [filterPhoto, setFilterPhoto] = useState("all");
  const [sortBy, setSortBy] = useState("name-asc");

  const [productForm, setProductForm] = useState<any>({ 
    name: "", price: 0, category: "", image_url: "", description: "", 
    stock: 0, critical_stock: 3, is_visible: true, is_new: false, is_offer: false 
  });

  useEffect(() => {
    setMounted(true);
    fetchInitialData();
  }, []);

  useEffect(() => {
    if (editingProduct) setProductForm(editingProduct);
    else setProductForm({ name: "", price: 0, category: categories[0]?.name || "", image_url: "", description: "", stock: 0, critical_stock: 3, is_visible: true, is_new: false, is_offer: false });
  }, [editingProduct, isAdding, categories]);

  async function fetchInitialData() {
    setLoading(true);
    const { data: catData } = await supabase.from('categories').select('*').order('name');
    const { data: prodData } = await supabase.from('products').select('*');
    if (catData) setCategories(catData);
    if (prodData) setProducts(prodData);
    setLoading(false);
  }

  async function handleSaveProduct(e: any) {
    e.preventDefault();
    setLoading(true);
    const { id, created_at, ...payload } = productForm;
    if (editingProduct) await supabase.from('products').update(payload).eq('id', id);
    else await supabase.from('products').insert([payload]);
    setIsAdding(false); setEditingProduct(null); fetchInitialData();
  }

  async function handleDeleteProduct(id: string) {
    if (confirm("¿Estás seguro de eliminar este producto?")) {
      await supabase.from('products').delete().eq('id', id);
      fetchInitialData();
    }
  }

  const filtered = products.filter(p => {
    const matchSearch = (p.name || "").toLowerCase().includes(searchTerm.toLowerCase());
    const matchCat = filterCategory === "all" || p.category === filterCategory;
    const matchVis = filterVisible === "all" || (filterVisible === "visible" ? p.is_visible : !p.is_visible);
    const isOut = Number(p.stock) <= 0;
    const isCritical = !isOut && Number(p.stock) <= (p.critical_stock || 3);
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

  if (!mounted) return null;

  return (
    <div className="min-h-screen bg-[#FDFBF7] p-4 sm:p-8 font-josefin text-[#2B4233]">
      <header className="max-w-[1400px] mx-auto mb-6 flex flex-wrap justify-between items-center bg-white p-6 rounded-[2.5rem] shadow-sm border border-[#EDB2D1]/10 gap-4">
        <h1 className="text-6xl font-diner uppercase leading-none">Gestión Tyta</h1>
        <div className="flex gap-2">
            <Link href="/admin/pedidos" target="_blank" className="px-5 py-2 border-2 border-[#EDB2D1] text-[#EDB2D1] rounded-full text-[9px] font-black uppercase tracking-widest hover:bg-[#EDB2D1] transition-all">📋 DESPACHO ↗</Link>
            <Link href="/tienda" target="_blank" className="px-5 py-2 border-2 border-[#2B4233] rounded-full text-[9px] font-black uppercase hover:bg-[#2B4233] transition-all">TIENDA ↗</Link>
            <button onClick={() => setIsAdding(true)} className="px-5 py-2 bg-[#2B4233] text-white rounded-full text-[9px] font-black uppercase tracking-widest cursor-pointer hover:scale-105 transition-transform">+ NUEVO</button>
        </div>
      </header>

      <AdminFilters 
        searchTerm={searchTerm} setSearchTerm={setSearchTerm}
        filterCategory={filterCategory} setFilterCategory={setFilterCategory}
        filterStock={filterStock} setFilterStock={setFilterStock}
        filterVisible={filterVisible} setFilterVisible={setFilterVisible}
        filterPhoto={filterPhoto} setFilterPhoto={setFilterPhoto}
        sortBy={sortBy} setSortBy={setSortBy}
        categories={categories}
      />

      <div className="max-w-[1400px] mx-auto bg-white rounded-[2.5rem] shadow-xl border border-[#EDB2D1]/10 overflow-x-auto">
        <table className="w-full text-left min-w-[1000px]">
          <thead className="bg-[#FDFBF7] text-[9px] font-black uppercase opacity-40 border-b border-[#EDB2D1]/10">
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
                  <td className="px-8 py-4 flex items-center gap-3">
                      <img src={p.image_url || '/images/placeholder.jpg'} className="w-10 h-10 rounded-xl object-cover" />
                      <div className="flex flex-col">
                        <span className="font-bold text-sm">{p.name}</span>
                        {isCritical && <span className="text-[7px] font-black text-red-500 uppercase animate-pulse">⚠️ Stock Crítico</span>}
                        {isOut && <span className="text-[7px] font-black text-gray-400 uppercase italic">Agotado</span>}
                      </div>
                  </td>
                  <td className="px-2 py-4 uppercase text-[8px] font-black text-[#EDB2D1] tracking-tighter">{p.category}</td>
                  <td className={`px-2 py-4 text-center font-bold text-xs ${isCritical ? 'text-red-500' : isOut ? 'text-gray-300' : ''}`}>{p.stock}</td>
                  <td className="px-2 py-4 flex gap-1 justify-center">
                      {p.is_new && <span className="bg-[#2B4233] text-white text-[7px] px-2 py-0.5 rounded-full uppercase tracking-widest font-black">Novedad</span>}
                      {p.is_offer && <span className="bg-[#EDB2D1] text-[#2B4233] text-[7px] px-2 py-0.5 rounded-full uppercase tracking-widest font-black">Oferta</span>}
                  </td>
                  <td className="px-2 py-4 font-mono font-black text-xs text-center">{(p.price / 100).toLocaleString('es-AR', { style: 'currency', currency: 'ARS', minimumFractionDigits: 0 })}</td>
                  <td className="px-8 py-4 text-right flex justify-end gap-3">
                      <button onClick={() => setEditingProduct(p)} className="text-lg cursor-pointer hover:scale-125 transition-transform">✏️</button>
                      <button onClick={() => handleDeleteProduct(p.id)} className="text-gray-200 hover:text-red-500 cursor-pointer transition-colors">🗑️</button>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      <ProductAdminModal 
        productForm={productForm} setProductForm={setProductForm}
        editingProduct={editingProduct} isAdding={isAdding}
        onClose={() => { setIsAdding(false); setEditingProduct(null); }}
        onSave={handleSaveProduct}
        categories={categories}
      />
    </div>
  );
}