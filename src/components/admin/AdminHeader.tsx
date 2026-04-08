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

  const toggleCategoryVisibility = async (cat: any) => {
    const newStatus = cat.is_on_gallery === false ? true : false;
    const { error } = await supabase.from('categories').update({ is_on_gallery: newStatus }).eq('id', cat.id);
    if (!error) onRefreshCategories();
  };

  return (
    <>
      <header className="max-w-[1400px] mx-auto mb-6 flex flex-col lg:flex-row justify-between items-center lg:items-start bg-white p-4 lg:p-5 rounded-[2rem] lg:rounded-[2.5rem] shadow-sm border border-[#EDB2D1]/10 gap-6">
        
        {/* LADO IZQUIERDO: LOGO Y CATEGORÍAS */}
        <div className="flex flex-col items-center lg:items-start gap-2 w-full lg:w-auto">
          <h1 className="text-3xl lg:text-4xl font-diner uppercase leading-none tracking-tighter text-[#2B4233]">Gestión Tyta</h1>
          {activeTab === 'productos' && (
            <button 
              onClick={() => setShowCatModal(true)}
              className="text-[8px] font-black uppercase tracking-[0.2em] text-[#EDB2D1] hover:text-[#2B4233] transition-colors flex items-center gap-2"
            >
              <span className="bg-[#EDB2D1]/10 p-1 rounded-md text-[10px]">📂</span>
              Categorías
            </button>
          )}
        </div>

        {/* CENTRO: NAVEGACIÓN (EL ARREGLO PARA CELULAR) */}
        <nav className="w-full lg:w-auto overflow-x-auto no-scrollbar -mx-4 px-4 lg:mx-0 lg:px-0">
          <div className="flex bg-[#FDFBF7] p-1 rounded-full border border-gray-100 shadow-inner min-w-max mx-auto lg:min-w-0">
            {[
              { id: 'productos', label: 'Productos' },
              { id: 'master', label: 'Master' },
              { id: 'config', label: 'Config' },
              { id: 'horarios', label: 'Horarios' }
            ].map((tab) => (
              <button 
                key={tab.id}
                onClick={() => setActiveTab(tab.id as any)}
                className={`px-4 lg:px-6 py-2 rounded-full text-[8px] lg:text-[9px] font-black uppercase tracking-[0.15em] lg:tracking-[0.2em] transition-all whitespace-nowrap ${
                  activeTab === tab.id 
                  ? 'bg-[#2B4233] text-[#EDB2D1] shadow-md' 
                  : 'text-gray-400 hover:text-[#2B4233]'
                }`}
              >
                {tab.label}
              </button>
            ))}
          </div>
        </nav>

        {/* LADO DERECHO: ACCIONES */}
        <div className="flex items-center gap-3 lg:gap-4 lg:self-center">
          <Link href="/tienda" target="_blank" className="hidden lg:block text-[#2B4233] text-[8px] font-black uppercase tracking-[0.2em] hover:opacity-60">Tienda ↗</Link>
          
          {activeTab === 'productos' && (
            <button onClick={onNewProduct} className="px-5 lg:px-6 py-2.5 bg-[#2B4233] text-white rounded-full text-[8px] font-black uppercase tracking-[0.2em] shadow-md active:scale-95 transition-all">
              + Nuevo
            </button>
          )}
        </div>
      </header>

      {/* ... (Aquí siguen los Modales de categorías y advertencia, se mantienen igual) */}
    </>
  );
}