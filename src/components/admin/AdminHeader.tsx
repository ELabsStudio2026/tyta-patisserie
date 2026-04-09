"use client";
import { useState, useRef, useEffect } from "react";
import Link from "next/link";
import { supabase } from "@/lib/supabase";
import { useTytaAlert } from "@/lib/useTytaAlert";
import TytaAlert from "@/components/ui/TytaAlert";

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
  
  const { alert, showAlert, closeAlert } = useTytaAlert();

  const forzarPermisoCamara = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ video: true });
      stream.getTracks().forEach(track => track.stop());
      showAlert("success", "CÁMARA LISTA", "¡Perfecto! El navegador ya tiene permiso para capturar tus delicias.");
    } catch (err) {
      showAlert("warning", "SIN ACCESO", "No pudimos activar la cámara. Por favor, habilitala en el candadito 🔒 de la barra de direcciones.");
    }
  };

  const tabs = [
    { id: 'productos', label: 'Productos' },
    { id: 'master', label: 'Master' },
    { id: 'config', label: 'Config' },
    { id: 'horarios', label: 'Horarios' }
  ];

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
    const { error } = await supabase.from('categories').update({ is_on_gallery: !cat.is_on_gallery }).eq('id', cat.id);
    if (!error) onRefreshCategories();
  };

  const requestDeleteCategory = async (cat: any) => {
    const { count } = await supabase.from('products').select('*', { count: 'exact', head: true }).eq('category', cat.name);
    if (count && count > 0) {
      return showAlert("warning", "ACCIÓN PROTEGIDA", `La categoría "${cat.name}" tiene ${count} productos.`);
    }
    showAlert("danger", "¿ELIMINAR?", `¿Estás segura de eliminar "${cat.name}"?`, async () => {
      const { error } = await supabase.from('categories').delete().eq('id', cat.id);
      if (!error) onRefreshCategories();
    });
  };

  return (
    <>
      <header className="max-w-[1400px] mx-auto mb-6 flex flex-col lg:flex-row justify-between items-center bg-white p-6 lg:p-7 rounded-[3rem] shadow-sm border border-[#EDB2D1]/10 gap-8">
        
        {/* COLUMNA IZQUIERDA: TÍTULO Y CENTRO DE COMANDO */}
        <div className="flex flex-col items-center lg:items-start gap-5">
          <h1 className="text-4xl lg:text-5xl font-diner uppercase text-[#2B4233] leading-none">Gestión Tyta</h1>
          
          <div className="flex flex-col items-center lg:items-start gap-3">
            {/* FILA 1: CÁMARA | CATEGORÍAS | BOLSA ROSA */}
            <div className="flex items-center gap-2">
              
              {/* 1. CÁMARA (Izquierda) */}
              <div className="group relative">
                <button 
                  onClick={forzarPermisoCamara}
                  className="w-8 h-8 flex items-center justify-center bg-[#FDFBF7] border border-[#EDB2D1]/30 rounded-full text-sm hover:scale-110 transition-all active:bg-[#EDB2D1]/10"
                >
                  📸
                </button>
                <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-3 hidden group-hover:block z-50 animate-in fade-in zoom-in-95">
                  <div className="bg-[#2B4233] text-[#EDB2D1] text-[7px] font-black uppercase tracking-widest px-2.5 py-1.5 rounded-lg shadow-xl whitespace-nowrap border border-[#EDB2D1]/10">
                    Probar Cámara
                  </div>
                </div>
              </div>

              {/* 2. CATEGORÍAS (Centro - Ancho Fijo) */}
              <button 
                onClick={() => setShowCatModal(true)} 
                className="w-40 h-8 bg-white border border-[#EDB2D1]/30 text-[#2B4233]/70 text-[8px] font-black uppercase tracking-[0.2em] rounded-full hover:bg-[#FDFBF7] transition-all flex items-center justify-center gap-1.5 shadow-sm"
              >
                📂 CATEGORÍAS
              </button>

              {/* 3. TIENDA ONLINE (Derecha - Bolsa Rosa Tyta) */}
              <div className="group relative">
                <Link 
                  href="/tienda" 
                  target="_blank" 
                  className="w-8 h-8 bg-[#EDB2D1] rounded-full shadow-lg flex items-center justify-center transition-all duration-300 hover:scale-110 active:scale-95"
                >
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.8} d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z" />
                  </svg>
                </Link>
                <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-3 hidden group-hover:block z-50 animate-in fade-in zoom-in-95">
                  <div className="bg-[#EDB2D1] text-[#2B4233] text-[7px] font-black uppercase tracking-widest px-2.5 py-1.5 rounded-lg shadow-xl whitespace-nowrap border border-[#2B4233]/10">
                    Tienda Online
                  </div>
                </div>
              </div>
            </div>

            {/* FILA 2: GESTIONAR PEDIDOS (Alineado con Categorías arriba) */}
            <div className="flex justify-center lg:ml-10">
              <Link 
                href="/admin/pedidos" 
                target="_blank" 
                className="w-40 h-8 bg-white border border-[#EDB2D1]/30 text-[#2B4233]/70 text-[8px] font-black uppercase tracking-[0.2em] rounded-full hover:bg-[#FDFBF7] transition-all flex items-center justify-center gap-1.5 shadow-sm"
              >
                📦 GESTIONAR PEDIDOS
              </Link>
            </div>
          </div>
        </div>

        {/* NAVEGACIÓN CENTRAL */}
        <nav className="relative w-full lg:w-auto max-w-[320px] lg:max-w-none">
          <div className="hidden lg:flex bg-[#FDFBF7] p-1.5 rounded-full border border-gray-100 shadow-inner">
            {tabs.map((tab) => (
              <button key={tab.id} onClick={() => setActiveTab(tab.id as any)} className={`px-7 py-2.5 rounded-full text-[10px] font-black uppercase tracking-[0.2em] transition-all ${activeTab === tab.id ? 'bg-[#2B4233] text-[#EDB2D1] shadow-md' : 'text-gray-400 hover:text-[#2B4233]'}`}>
                {tab.label}
              </button>
            ))}
          </div>

          <div className="lg:hidden relative bg-[#FDFBF7] rounded-full p-1 border border-gray-100 overflow-hidden">
            <div ref={scrollRef} onScroll={handleScroll} className="flex gap-4 overflow-x-auto no-scrollbar snap-x snap-mandatory py-2 px-16">
              {infiniteTabs.map((tab, index) => {
                const isActive = activeTab === tab.id && index >= tabs.length && index < tabs.length * 2;
                return (
                  <button key={`${tab.id}-${index}`} data-active={isActive} onClick={() => setActiveTab(tab.id as any)} className={`snap-center flex-none px-5 py-2 rounded-full text-[9px] font-black uppercase tracking-[0.15em] transition-all ${isActive ? 'bg-[#2B4233] text-[#EDB2D1] scale-105' : 'text-[#2B4233]/40 scale-90'}`}>
                    {tab.label}
                  </button>
                );
              })}
            </div>
          </div>
        </nav>

        {/* BOTÓN NUEVO PRODUCTO */}
        <div className="flex items-center">
          {activeTab === 'productos' && (
            <button onClick={onNewProduct} className="px-8 py-3.5 bg-[#2B4233] text-white rounded-full text-[9px] font-black uppercase tracking-[0.2em] shadow-lg hover:scale-105 transition-all active:scale-95">
              + Nuevo Producto
            </button>
          )}
        </div>
      </header>

      {/* MODAL DE CATEGORÍAS */}
      {showCatModal && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-[#2B4233]/40 backdrop-blur-sm">
          <div className="bg-white w-full max-w-md rounded-[3rem] p-8 lg:p-10 shadow-2xl border border-[#EDB2D1]/20">
            <div className="flex justify-between items-center mb-8">
              <h3 className="font-diner text-4xl text-[#2B4233] uppercase">Categorías</h3>
              <button onClick={() => setShowCatModal(false)} className="text-gray-300 text-3xl p-2">×</button>
            </div>
            <div className="flex gap-2 mb-8">
              <input type="text" placeholder="Nueva..." value={newCatName} onChange={(e) => setNewCatName(e.target.value)} className="flex-1 bg-[#FDFBF7] border border-gray-100 rounded-full px-5 py-3 text-[11px] font-black uppercase tracking-widest outline-none focus:border-[#EDB2D1]" />
              <button onClick={async () => { if (!newCatName) return; await supabase.from('categories').insert([{ name: newCatName, is_on_gallery: true }]); setNewCatName(""); onRefreshCategories(); }} className="bg-[#2B4233] text-[#EDB2D1] px-6 rounded-full text-sm font-black">+</button>
            </div>
            <div className="space-y-3 max-h-[40vh] overflow-y-auto no-scrollbar">
              {categories?.filter(c => c.name !== "Todas").map((cat) => (
                <div key={cat.id} className="flex justify-between items-center bg-[#FDFBF7] p-4 rounded-2xl border border-gray-50">
                  <span className="text-[10px] font-black uppercase tracking-widest text-[#2B4233]">{cat.name}</span>
                  <div className="flex items-center gap-2">
                    <button onClick={() => toggleCategoryVisibility(cat)} className={`p-2 rounded-lg transition-colors ${cat.is_on_gallery !== false ? 'text-[#2B4233] bg-green-50' : 'text-gray-300 bg-gray-50'}`}>
                      {cat.is_on_gallery !== false ? '👁️' : '🕶️'}
                    </button>
                    <button onClick={() => requestDeleteCategory(cat)} className="text-[#EDB2D1] p-2 hover:text-red-500 transition-colors">🗑️</button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      <TytaAlert alert={alert} onCancel={closeAlert} />
    </>
  );
}