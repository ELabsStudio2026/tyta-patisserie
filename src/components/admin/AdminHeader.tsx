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
  const scrollRef = useRef<HTMLDivElement>(null);

  // Definimos las pestañas
  const tabs = [
    { id: 'productos', label: 'Productos' },
    { id: 'master', label: 'Master' },
    { id: 'config', label: 'Config' },
    { id: 'horarios', label: 'Horarios' }
  ];

  // Triplicamos los ítems para crear la ilusión de infinito
  const infiniteTabs = [...tabs, ...tabs, ...tabs];

  // Centrar el elemento activo al cargar o cambiar
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

  // Lógica de "Giro Infinito": Si llegás al final o principio real, saltás al medio
  const handleScroll = () => {
    if (!scrollRef.current) return;
    const { scrollLeft, scrollWidth, clientWidth } = scrollRef.current;
    
    // Si estamos cerca del final del triplicado, saltamos al medio
    if (scrollLeft + clientWidth >= scrollWidth - 10) {
      scrollRef.current.scrollLeft = scrollWidth / 3;
    }
    // Si estamos cerca del principio, saltamos al medio
    if (scrollLeft <= 10) {
      scrollRef.current.scrollLeft = scrollWidth / 3;
    }
  };

  return (
    <>
      <header className="max-w-[1400px] mx-auto mb-6 flex flex-col items-center bg-white p-4 lg:p-6 rounded-[2.5rem] shadow-sm border border-[#EDB2D1]/10 gap-6">
        
        {/* LOGO */}
        <div className="flex flex-col items-center gap-1">
          <h1 className="text-3xl lg:text-4xl font-diner uppercase leading-none tracking-tighter text-[#2B4233]">Gestión Tyta</h1>
          <div className="flex gap-4">
            {activeTab === 'productos' && (
              <button onClick={() => setShowCatModal(true)} className="text-[7px] font-black uppercase tracking-[0.2em] text-[#EDB2D1] flex items-center gap-1">
                📂 Categorías
              </button>
            )}
            <Link href="/tienda" target="_blank" className="text-[7px] font-black uppercase tracking-[0.2em] text-[#2B4233]/40">Tienda ↗</Link>
          </div>
        </div>

        {/* SELECTOR INFINITO (MOBILE & DESKTOP) */}
        <nav className="relative w-full max-w-[320px] lg:max-w-md group">
          {/* Degradados laterales para dar sensación de esfera/giro */}
          <div className="absolute inset-y-0 left-0 w-12 bg-gradient-to-r from-white to-transparent z-10 pointer-events-none" />
          <div className="absolute inset-y-0 right-0 w-12 bg-gradient-to-l from-white to-transparent z-10 pointer-events-none" />
          
          <div 
            ref={scrollRef}
            onScroll={handleScroll}
            className="flex gap-4 overflow-x-auto no-scrollbar snap-x snap-mandatory py-2 px-20"
          >
            {infiniteTabs.map((tab, index) => (
              <button 
                key={`${tab.id}-${index}`}
                data-active={index >= tabs.length && index < tabs.length * 2 && activeTab === tab.id}
                onClick={() => setActiveTab(tab.id as any)}
                className={`snap-center flex-none px-6 py-2 rounded-full text-[9px] font-black uppercase tracking-[0.2em] transition-all duration-300 ${
                  activeTab === tab.id && index >= tabs.length && index < tabs.length * 2
                  ? 'bg-[#2B4233] text-[#EDB2D1] shadow-lg scale-110 opacity-100' 
                  : 'text-gray-300 scale-90 opacity-40 grayscale'
                }`}
              >
                {tab.label}
              </button>
            ))}
          </div>
        </nav>

        {/* ACCIÓN PRINCIPAL */}
        {activeTab === 'productos' && (
          <button 
            onClick={onNewProduct} 
            className="px-8 py-3 bg-[#2B4233] text-white rounded-full text-[8px] font-black uppercase tracking-[0.3em] shadow-md hover:scale-105 active:scale-95 transition-all"
          >
            + Nuevo Producto
          </button>
        )}
      </header>

      {/* ... (Aquí siguen tus modales de categorías y advertencia que ya tenías) */}
    </>
  );
}