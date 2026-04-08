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
  const [integrityWarning, setIntegrityWarning] = useState<{ show: boolean; count: number; name: string } | null>(null);

  const addCategory = async () => {
    if (!newCatName) return;
    const { error } = await supabase.from('categories').insert([{ name: newCatName, is_on_gallery: true }]);
    if (!error) {
      setNewCatName("");
      onRefreshCategories();
    }
  };

  const toggleCategoryVisibility = async (cat: any) => {
    const newStatus = cat.is_on_gallery === false ? true : false;
    const { error } = await supabase
      .from('categories')
      .update({ is_on_gallery: newStatus })
      .eq('id', cat.id);
    
    if (!error) onRefreshCategories();
  };

  const deleteCategory = async (cat: any) => {
    const { count, error: countError } = await supabase
      .from('products')
      .select('*', { count: 'exact', head: true })
      .eq('category', cat.name);

    if (countError) return;

    if (count && count > 0) {
      setIntegrityWarning({ show: true, count, name: cat.name });
      return;
    }

    if (!confirm(`¿Eliminar la categoría "${cat.name}"?`)) return;

    const { error: deleteError } = await supabase.from('categories').delete().eq('id', cat.id);
    if (!deleteError) onRefreshCategories();
  };

  return (
    <>
      <header className="max-w-[1400px] mx-auto mb-6 flex flex-wrap justify-between items-start bg-white p-5 rounded-[2.5rem] shadow-sm border border-[#EDB2D1]/10 gap-4">
        <div className="flex flex-col gap-2">
          <h1 className="text-4xl font-diner uppercase leading-none tracking-tighter text-[#2B4233]">Gestión Tyta</h1>
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
          {['productos', 'master', 'config', 'horarios'].map((tab) => (
            <button 
              key={tab}
              onClick={() => setActiveTab(tab as any)}
              className={`px-6 py-2 rounded-full text-[9px] font-black uppercase tracking-[0.2em] transition-all ${
                activeTab === tab ? 'bg-[#2B4233] text-[#EDB2D1] shadow-md' : 'text-gray-400 hover:text-[#2B4233]'
              }`}
            >
              {tab}
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
            <button onClick={onNewProduct} className="px-6 py-2.5 bg-[#2B4233] text-white rounded-full text-[8px] font-black uppercase tracking-[0.2em] shadow-md hover:scale-105 active:scale-95 transition-all">
              + Nuevo Producto
            </button>
          )}
        </div>
      </header>

      {showCatModal && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-[#2B4233]/40 backdrop-blur-sm animate-in fade-in duration-300">
          <div className="bg-white w-full max-w-md rounded-[3rem] p-10 shadow-2xl border border-[#EDB2D1]/20">
            <div className="flex justify-between items-center mb-8">
              <h3 className="font-diner text-4xl text-[#2B4233] uppercase">Categorías</h3>
              <button onClick={() => setShowCatModal(false)} className="text-gray-300 hover:text-black text-2xl transition-colors">×</button>
            </div>

            <div className="flex gap-3 mb-10">
              <input 
                type="text" placeholder="Nueva..." value={newCatName}
                onChange={(e) => setNewCatName(e.target.value)}
                className="flex-1 bg-[#FDFBF7] border border-gray-100 rounded-full px-6 py-4 text-[11px] font-black uppercase tracking-widest outline-none focus:border-[#EDB2D1] font-josefin"
              />
              <button onClick={addCategory} className="bg-[#2B4233] text-[#EDB2D1] px-8 py-4 rounded-full text-[12px] font-black shadow-sm active:scale-90 transition-all">+</button>
            </div>

            <div className="space-y-3 max-h-[40vh] overflow-y-auto no-scrollbar pr-1">
              {categories?.filter(c => c.name !== "Todas").map((cat) => (
                <div key={cat.id} className="flex justify-between items-center bg-[#FDFBF7] p-5 rounded-2xl border border-gray-50 group hover:border-[#EDB2D1]/30 transition-all">
                  <div className="flex flex-col">
                    <span className="text-[10px] font-black uppercase tracking-widest text-[#2B4233]">{cat.name}</span>
                    <span className={`text-[7px] font-bold uppercase ${cat.is_on_gallery !== false ? 'text-green-500' : 'text-[#EDB2D1]'}`}>
                      {cat.is_on_gallery !== false ? '• Visible en Tienda' : '• Oculta'}
                    </span>
                  </div>
                  <div className="flex items-center gap-2">
                    <button 
                      onClick={() => toggleCategoryVisibility(cat)}
                      className={`p-2 rounded-lg transition-colors ${cat.is_on_gallery !== false ? 'text-[#2B4233] bg-green-50' : 'text-gray-300 bg-gray-50'}`}
                    >
                      {cat.is_on_gallery !== false ? (
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" /><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" /></svg>
                      ) : (
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.88 9.88l-3.29-3.29m7.532 7.532l3.29 3.29M3 3l18 18" /></svg>
                      )}
                    </button>
                    <button onClick={() => deleteCategory(cat)} className="text-[#EDB2D1] hover:text-red-500 transition-colors p-2">
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" /></svg>
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {integrityWarning?.show && (
        <div className="fixed inset-0 z-[110] flex items-center justify-center p-4 bg-[#FDFBF7]/90 backdrop-blur-xl animate-in zoom-in-95 duration-300">
          <div className="max-w-sm w-full text-center space-y-6">
            <div className="w-20 h-20 bg-[#EDB2D1]/20 rounded-full flex items-center justify-center mx-auto mb-8 animate-bounce">
              <span className="text-3xl">🎀</span>
            </div>
            <h4 className="font-diner text-4xl text-[#2B4233] uppercase leading-tight tracking-tight">Acción Protegida</h4>
            <p className="font-josefin text-[11px] uppercase tracking-[0.2em] leading-relaxed text-gray-500 px-4">
              La categoría <span className="text-[#2B4233] font-black">"{integrityWarning.name}"</span> resguarda <span className="text-[#2B4233] font-black">{integrityWarning.count} productos</span>. Debe estar vacía para ser eliminada.
            </p>
            <button onClick={() => setIntegrityWarning(null)} className="px-12 py-4 bg-[#2B4233] text-[#EDB2D1] rounded-full text-[10px] font-black uppercase tracking-[0.3em] shadow-2xl transition-all">Entendido</button>
          </div>
        </div>
      )}
    </>
  );
}