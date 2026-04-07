"use client";
import Link from "next/link";

interface AdminHeaderProps {
  activeTab: string;
  setActiveTab: (tab: any) => void;
  onNewProduct: () => void;
}

export default function AdminHeader({ activeTab, setActiveTab, onNewProduct }: AdminHeaderProps) {
  return (
    <header className="max-w-[1400px] mx-auto mb-6 flex flex-wrap justify-between items-center bg-white p-5 rounded-[2rem] shadow-sm border border-[#EDB2D1]/10 gap-4">
      <div className="flex items-center gap-8">
        <h1 className="text-4xl font-diner uppercase leading-none tracking-tighter text-[#2B4233]">Gestión Tyta</h1>
        <nav className="flex bg-[#FDFBF7] p-1 rounded-full border border-gray-100 shadow-inner">
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
      </div>

      <div className="flex items-center gap-4">
        <div className="hidden lg:flex items-center gap-3 mr-2">
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
  );
}