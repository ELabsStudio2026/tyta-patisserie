"use client";
import { useState, useRef, useEffect } from "react";
import Link from "next/link";
import { supabase } from "@/lib/supabase";
import { useTytaAlert } from "@/lib/useTytaAlert";
import TytaAlert from "@/components/ui/TytaAlert";

interface AdminHeaderProps {
  activeTab: 'productos' | 'master' | 'config' | 'horarios' | 'campañas';
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
      showAlert("success", "CÁMARA LISTA", "¡Perfecto! El navegador ya tiene permiso.");
    } catch (err) {
      showAlert("warning", "SIN ACCESO", "Habilita la cámara en el candadito 🔒 de la barra de direcciones.");
    }
  };

  // 1. LISTA DE PESTAÑAS (Ahora son 5)
  const tabs = [
    { id: 'productos', label: 'Productos' },
    { id: 'master', label: 'Master' },
    { id: 'config', label: 'Config' },
    { id: 'horarios', label: 'Horarios' },
    { id: 'campañas', label: '📢 Campañas' }
  ];

  // Duplicamos para el efecto de scroll infinito
  const infiniteTabs = [...tabs, ...tabs, ...tabs];

  // 2. LÓGICA DE AUTO-SCROLL (Para que el celular siempre centre la activa)
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
      return showAlert("warning", "ACCIÓN PROTEGIDA", `La categoría "${cat.name}" tiene productos.`);
    }
    showAlert("danger", "¿ELIMINAR?", `¿Eliminar "${cat.name}"?`, async () => {
      const { error } = await supabase.from('categories').delete().eq('id', cat.id);
      if (!error) onRefreshCategories();
    });
  };

  return (
    <>
      <header className="max-w-[1400px] mx-auto mb-6 flex flex-col lg:flex-row justify-between items-center bg-white p-6 lg:p-7 rounded-[3rem] shadow-sm border border-[#EDB2D1]/10 gap-8">
        
        {/* IZQUIERDA: LOGO Y COMANDOS */}
        <div className="flex flex-col items-center lg:items-start gap-5">
          <h1 className="text-4xl lg:text-5xl font-diner uppercase text-[#2B4233] leading-none">Gestión Tyta</h1>
          
          <div className="flex flex-col items-center lg:items-start gap-3">
            <div className="flex items-center gap-2">
              <button onClick={forzarPermisoCamara} className="w-8 h-8 flex items-center justify-center bg-[#FDFBF7] border border-[#EDB2D1]/30 rounded-full text-sm">📸</button>
              <button onClick={() => setShowCatModal(true)} className="w-40 h-8 bg-white border border-[#EDB2D1]/30 text-[#2B4233]/70 text-[8px] font-black uppercase tracking-[0.2em] rounded-full hover:bg-[#FDFBF7] transition-all">📂 CATEGORÍAS</button>
              <Link href="/tienda" target="_blank" className="w-8 h-8 bg-[#EDB2D1] rounded-full flex items-center justify-center hover:scale-110 transition-all">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.8} d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z" />
                </svg>
              </Link>
            </div>
            <Link href="/admin/pedidos" className="w-40 h-8 bg-white border border-[#EDB2D1]/30 text-[#2B4233]/70 text-[8px] font-black uppercase tracking-[0.2em] rounded-full flex items-center justify-center">📦 GESTIONAR PEDIDOS</Link>
          </div>
        </div>

        {/* CENTRO: EL SPINNER (Aquí estaba el problema del celu) */}
        <nav className="relative w-full lg:w-auto max-w-[340px] lg:max-w-none">
          {/* Versión PC */}
          <div className="hidden lg:flex bg-[#FDFBF7] p-1.5 rounded-full border border-gray-100 shadow-inner overflow-x-auto no-scrollbar">
            {tabs.map((tab) => (
              <button key={tab.id} onClick={() => setActiveTab(tab.id as any)} className={`px-5 py-2.5 rounded-full text-[9px] font-black uppercase tracking-[0.15em] transition-all whitespace-nowrap ${activeTab === tab.id ? 'bg-[#2B4233] text-[#EDB2D1] shadow-md' : 'text-gray-400 hover:text-[#2B4233]'}`}>
                {tab.label}
              </button>
            ))}
          </div>

          {/* Versión Celular (Scroll Infinito) */}
          <div className="lg:hidden relative bg-[#FDFBF7] rounded-full p-1 border border-gray-100 overflow-hidden">
            <div ref={scrollRef} onScroll={handleScroll} className="flex gap-4 overflow-x-auto no-scrollbar snap-x snap-mandatory py-2 px-20">
              {infiniteTabs.map((tab, index) => {
                // Ajuste de índice para 5 pestañas
                const isActive = activeTab === tab.id && index >= tabs.length && index < tabs.length * 2;
                return (
                  <button 
                    key={`${tab.id}-${index}`} 
                    data-active={isActive} 
                    onClick={() => setActiveTab(tab.id as any)} 
                    className={`snap-center flex-none px-6 py-2 rounded-full text-[9px] font-black uppercase tracking-[0.15em] transition-all whitespace-nowrap ${
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

        {/* DERECHA: BOTÓN NUEVO PRODUCTO */}
        <div className="flex items-center">
          {activeTab === 'productos' && (
            <button onClick={onNewProduct} className="px-8 py-3.5 bg-[#2B4233] text-white rounded-full text-[9px] font-black uppercase tracking-[0.2em] shadow-lg">
              + Nuevo Producto
            </button>
          )}
        </div>
      </header>

      {/* MODAL DE CATEGORÍAS */}
      {showCatModal && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-[#2B4233]/40 backdrop-blur-sm">
          <div className="bg-white w-full max-w-md rounded-[3rem] p-8 shadow-2xl">
            <div className="flex justify-between items-center mb-8">
              <h3 className="font-diner text-4xl text-[#2B4233] uppercase">Categorías</h3>
              <button onClick={() => setShowCatModal(false)} className="text-gray-300 text-3xl p-2">×</button>
            </div>
            <div className="flex gap-2 mb-8">
              <input type="text" placeholder="Nueva..." value={newCatName} onChange={(e) => setNewCatName(e.target.value)} className="flex-1 bg-[#FDFBF7] border border-gray-100 rounded-full px-5 py-3 text-[11px] font-black uppercase outline-none focus:border-[#EDB2D1]" />
              <button onClick={async () => { if (!newCatName) return; await supabase.from('categories').insert([{ name: newCatName, is_on_gallery: true }]); setNewCatName(""); onRefreshCategories(); }} className="bg-[#2B4233] text-[#EDB2D1] px-6 rounded-full text-sm font-black">+</button>
            </div>
            <div className="space-y-3 max-h-[40vh] overflow-y-auto no-scrollbar">
              {categories?.filter(c => c.name !== "Todas").map((cat) => (
                <div key={cat.id} className="flex justify-between items-center bg-[#FDFBF7] p-4 rounded-2xl">
                  <span className="text-[10px] font-black uppercase text-[#2B4233]">{cat.name}</span>
                  <div className="flex items-center gap-2">
                    <button onClick={() => toggleCategoryVisibility(cat)} className="text-xl">{cat.is_on_gallery !== false ? '👁️' : '🕶️'}</button>
                    <button onClick={() => requestDeleteCategory(cat)} className="text-[#EDB2D1] text-xl">🗑️</button>
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