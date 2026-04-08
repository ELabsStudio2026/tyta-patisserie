"use client";
import { useState, useRef, useEffect } from "react";
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
  const scrollRef = useRef<HTMLDivElement>(null);

  const tabs = [
    { id: 'productos', label: 'Productos' },
    { id: 'master', label: 'Master' },
    { id: 'config', label: 'Config' },
    { id: 'horarios', label: 'Horarios' }
  ];

  // Lógica de infinito para el scroll móvil
  const infiniteTabs = [...tabs, ...tabs, ...tabs];

  useEffect(() => {
    if (scrollRef.current) {
      const container = scrollRef.current;
      const activeElement = container.querySelector(`[data-active="true"]`);
      if (activeElement) {
        const scrollLeft = (activeElement as HTMLElement).offsetLeft - (container.offsetWidth / 2) + (activeElement as HTMLElement).offsetWidth / 2;
        container.scrollTo({ left: scrollLeft, behavior: 'smooth' });
      }
    }
  }, [activeTab]);

  const handleScroll = () => {
    if (!scrollRef.current) return;
    const { scrollLeft, scrollWidth, clientWidth } = scrollRef.current;
    if (scrollLeft + clientWidth >= scrollWidth - 10) scrollRef.current.scrollLeft = scrollWidth / 3;
    if (scrollLeft <= 10) scrollRef.current.scrollLeft = scrollWidth / 3;
  };

  const toggleCategoryVisibility = async (cat: any) => {
    const newStatus = cat.is_on_gallery === false ? true : false;
    const { error } = await supabase.from('categories').update({ is_on_gallery: newStatus }).eq('id', cat.id);
    if (!error) onRefreshCategories();
  };

  return (
    <>
      <header className="max-w-[1400px] mx-auto mb-6 flex flex-col lg:flex-row justify-between items-center bg-white p-4 lg:p-5 rounded-[2.5rem] shadow-sm border border-[#EDB2D1]/10 gap-6">
        
        {/* LOGO E IDENTIDAD */}
        <div className="flex flex-col items-center lg:items-start gap-1">
          <h1 className="text-3xl lg:text-4xl font-diner uppercase leading-none tracking-tighter text-[#2B4233]">Gestión Tyta</h1>
          <div className="flex gap-3">
            {activeTab === 'productos' && (
              <button 
                onClick={() => setShowCatModal(true)} 
                className="text-[8px] font-black uppercase tracking-[0.2em] text-[#EDB2D1] flex items-center gap-1.5 hover:text-[#2B4233] transition-colors"
              >
                📂 Editar Categorías
              </button>
            )}
            <Link href="/tienda" target="_blank" className="hidden lg:block text-[8px] font-black uppercase tracking-[0.2em] text-[#2B4233]/40 hover:text-[#2B4233]">Tienda ↗</Link>
          </div>
        </div>

        {/* NAVEGACIÓN: DUAL (Escritorio Fijo / Celular Infinito) */}
        <nav className="relative w-full lg:w-auto max-w-[320px] lg:max-w-none">
          
          {/* VISTA ESCRITORIO (RESTAURADA) */}
          <div className="hidden lg:flex bg-[#FDFBF7] p-1 rounded-full border border-gray-100 shadow-inner">
            {tabs.map((tab) => (
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
          </div>

          {/* VISTA CELULAR (RUEDA INFINITA) */}
          <div className="lg:hidden relative bg-[#FDFBF7] rounded-full p-1 border border-gray-100 shadow-inner overflow-hidden">
            <div className="absolute inset-y-0 left-0 w-8 bg-gradient-to-r from-[#FDFBF7] to-transparent z-10 pointer-events-none" />
            <div className="absolute inset-y-0 right-0 w-8 bg-gradient-to-l from-[#FDFBF7] to-transparent z-10 pointer-events-none" />
            
            <div 
              ref={scrollRef}
              onScroll={handleScroll}
              className="flex gap-4 overflow-x-auto no-scrollbar snap-x snap-mandatory py-2 px-16"
            >
              {infiniteTabs.map((tab, index) => {
                const isActive = activeTab === tab.id && index >= tabs.length && index < tabs.length * 2;
                return (
                  <button 
                    key={`${tab.id}-${index}`}
                    data-active={isActive}
                    onClick={() => setActiveTab(tab.id as any)}
                    className={`snap-center flex-none px-5 py-2 rounded-full text-[9px] font-black uppercase tracking-[0.15em] transition-all duration-300 ${
                      isActive ? 'bg-[#2B4233] text-[#EDB2D1] scale-105' : 'text-[#2B4233]/40 scale-90'
                    }`}
                  >
                    {tab.label}
                  </button>
                );
              })}
            </div>
          </div>
        </nav>

        {/* ACCIONES */}
        <div className="flex items-center gap-4">
          {activeTab === 'productos' && (
            <button 
              onClick={onNewProduct} 
              className="px-6 py-2.5 bg-[#2B4233] text-white rounded-full text-[8px] font-black uppercase tracking-[0.2em] shadow-md hover:scale-105 active:scale-95 transition-all"
            >
              + Nuevo Producto
            </button>
          )}
        </div>
      </header>

      {/* MODAL GESTIÓN DE CATEGORÍAS (REVISADO) */}
      {showCatModal && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-[#2B4233]/40 backdrop-blur-sm animate-in fade-in duration-300">
          <div className="bg-white w-full max-w-md rounded-[3rem] p-8 lg:p-10 shadow-2xl border border-[#EDB2D1]/20">
            <div className="flex justify-between items-center mb-8">
              <h3 className="font-diner text-4xl text-[#2B4233] uppercase">Categorías</h3>
              <button onClick={() => setShowCatModal(false)} className="text-gray-300 hover:text-black text-2xl">×</button>
            </div>

            <div className="flex gap-2 mb-8">
              <input 
                type="text" placeholder="Nueva..." value={newCatName}
                onChange={(e) => setNewCatName(e.target.value)}
                className="flex-1 bg-[#FDFBF7] border border-gray-100 rounded-full px-5 py-3 text-[11px] font-black uppercase tracking-widest outline-none focus:border-[#EDB2D1] font-josefin"
              />
              <button 
                onClick={async () => {
                  if (!newCatName) return;
                  const { error } = await supabase.from('categories').insert([{ name: newCatName, is_on_gallery: true }]);
                  if (!error) { setNewCatName(""); onRefreshCategories(); }
                }} 
                className="bg-[#2B4233] text-[#EDB2D1] px-6 rounded-full text-sm font-black active:scale-90 transition-all"
              >
                +
              </button>
            </div>

            <div className="space-y-3 max-h-[40vh] overflow-y-auto no-scrollbar">
              {categories?.filter(c => c.name !== "Todas").map((cat) => (
                <div key={cat.id} className="flex justify-between items-center bg-[#FDFBF7] p-4 rounded-2xl border border-gray-50">
                  <div className="flex flex-col">
                    <span className="text-[10px] font-black uppercase tracking-widest text-[#2B4233]">{cat.name}</span>
                    <span className={`text-[7px] font-bold uppercase ${cat.is_on_gallery !== false ? 'text-green-500' : 'text-[#EDB2D1]'}`}>
                      {cat.is_on_gallery !== false ? '• Visible' : '• Oculta'}
                    </span>
                  </div>
                  <div className="flex items-center gap-2">
                    <button 
                      onClick={() => toggleCategoryVisibility(cat)}
                      className={`p-2 rounded-lg transition-colors ${cat.is_on_gallery !== false ? 'text-[#2B4233] bg-green-50' : 'text-gray-300 bg-gray-50'}`}
                    >
                      {cat.is_on_gallery !== false ? '👁️' : '🕶️'}
                    </button>
                    <button 
                      onClick={async () => {
                        if (confirm(`¿Eliminar ${cat.name}?`)) {
                          const { error } = await supabase.from('categories').delete().eq('id', cat.id);
                          if (!error) onRefreshCategories();
                        }
                      }}
                      className="text-[#EDB2D1] p-2"
                    >
                      🗑️
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
    </>
  );
}