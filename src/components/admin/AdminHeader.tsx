"use client";
import { useState } from "react";
import Link from "next/link";
import { supabase } from "@/lib/supabase";

interface AdminHeaderProps {
  activeTab: 'productos' | 'master' | 'config' | 'horarios';
  setActiveTab: (tab: any) => void;
  onNewProduct: () => void;
  categories: any[];
  onRefreshCategories: () => void;
}

export default function AdminHeader({ 
  activeTab, 
  setActiveTab, 
  onNewProduct, 
  categories = [], 
  onRefreshCategories 
}: AdminHeaderProps) {
  const [showCatModal, setShowCatModal] = useState(false);
  const [newCatName, setNewCatName] = useState("");

  const addCategory = async () => {
    if (!newCatName) return;
    const { error } = await supabase.from('categories').insert([{ name: newCatName }]);
    if (!error) {
      setNewCatName("");
      onRefreshCategories();
    }
  };

  const deleteCategory = async (cat: any) => {
    // SEGURO: Verificar si hay productos vinculados
    const { count, error: countError } = await supabase
      .from('products')
      .select('*', { count: 'exact', head: true })
      .eq('category', cat.name);

    if (countError) return;

    if (count && count > 0) {
      alert(`No se puede eliminar "${cat.name}".\n\nHay ${count} ${count === 1 ? 'producto vinculado' : 'productos vinculados'} a esta categoría. Primero cambiales la categoría para poder borrarla.`);
      return;
    }

    if (!confirm(`¿Estás seguro de eliminar la categoría "${cat.name}"?`)) return;

    const { error: deleteError } = await supabase
      .from('categories')
      .delete()
      .eq('id', cat.id);

    if (!deleteError) onRefreshCategories();
  };

  return (
    <>
      <header className="max-w-[1400px] mx-auto mb-6 flex flex-wrap justify-between items-start bg-white p-5 rounded-[2.5rem] shadow-sm border border-[#EDB2D1]/10 gap-4">
        
        <div className="flex flex-col gap-2">
          <div className="flex items-center gap-6">
            <h1 className="text-4xl font-diner uppercase leading-none tracking-tighter text-[#2B4233]">Gestión Tyta</h1>
          </div>
          
          {activeTab === 'productos' && (
            <button 
              onClick={() => setShowCatModal(true)}
              className="ml-1 w-fit text-[8px] font-black uppercase tracking-[0.2em] text-[#EDB2D1] hover:text-[#2B4233] transition-colors flex items-center gap-2 group"
            >
              <span className="bg-[#EDB2D1]/10 group-hover:bg-[#EDB2D1]/20 p-1 rounded-md text-[10px]">📂</span>
              Gestionar Categorías
            </button>
          )}
        </div>

        <nav className="flex bg-[#FDFBF7] p-1 rounded-full border border-gray-100 shadow-inner self-center">
          {[
            { id: 'productos', label: 'Productos' },
            { id: 'master', label: 'Panel Maestro' },
            { id: 'config', label: 'Configuración' },
            { id: 'horarios', label: 'Horarios' }
          ].map((tab) => (
            <button 
              key={tab.id}
              onClick={() => setActiveTab(tab.id as any)}
              className={`px-6 py-2 rounded-full text-[9px] font-black uppercase tracking-[0.2em] transition-all ${
                activeTab === tab.id 
                ? 'bg-[#2B4233] text-[#EDB2D1] shadow-md' 
                : 'text-gray-400 hover:text-[#2B4233]'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </nav>

        <div className="flex items-center gap-4 self-center">
          <div className="hidden lg:flex items-center gap-3 mr-4">
            <Link href="/admin/pedidos" target="_blank" className="text-[#EDB2D1] text-[8px] font-black uppercase tracking-[0.2em] hover:opacity-60 transition-opacity">📋 Despacho</Link>
            <div className="w-1 h-1 rounded-full bg-gray-200"></div>
            <Link href="/tienda" target="_blank" className="text-[#2B4233] text-[8px] font-black uppercase tracking-[0.2em] hover:opacity-60 transition-opacity">Tienda ↗</Link>
          </div>
          
          {activeTab === 'productos' && (
            <button 
              onClick={onNewProduct} 
              className="px-6 py-2.5 bg-[#2B4233] text-white rounded-full text-[8px] font-black uppercase tracking-[0.2em] hover:scale-105 active:scale-95 transition-all shadow-md"
            >
              + Nuevo Producto
            </button>
          )}
        </div>
      </header>

      {showCatModal && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-[#2B4233]/40 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="bg-white w-full max-w-md rounded-[2.5rem] p-8 shadow-2xl">
            <div className="flex justify-between items-center mb-6">
              <h3 className="font-diner text-3xl text-[#2B4233] uppercase">Categorías</h3>
              <button onClick={() => setShowCatModal(false)} className="text-gray-400 hover:text-black text-2xl">×</button>
            </div>

            <div className="flex gap-2 mb-8">
              <input 
                type="text" 
                placeholder="Nueva categoría..."
                value={newCatName}
                onChange={(e) => setNewCatName(e.target.value)}
                className="flex-1 bg-[#FDFBF7] border border-gray-100 rounded-full px-5 py-3 text-xs outline-none focus:border-[#EDB2D1] font-josefin"
              />
              <button onClick={addCategory} className="bg-[#2B4233] text-[#EDB2D1] px-6 py-3 rounded-full text-[12px] font-black uppercase shadow-sm">+</button>
            </div>

            <div className="space-y-2 max-h-[40vh] overflow-y-auto no-scrollbar">
              {categories?.filter(c => c.name !== "Todas").map((cat) => (
                <div key={cat.id} className="flex justify-between items-center bg-[#FDFBF7] p-4 rounded-2xl border border-gray-50">
                  <span className="text-[10px] font-black uppercase tracking-widest text-[#2B4233]">{cat.name}</span>
                  <button onClick={() => deleteCategory(cat)} className="text-red-200 hover:text-red-500 transition-colors p-1">
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" /></svg>
                  </button>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
    </>
  );
}