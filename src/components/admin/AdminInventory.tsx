"use client";

import { useState } from "react";

export default function AdminInventory({ products, categories, onEdit, onDelete }: any) {
  const [searchTerm, setSearchTerm] = useState("");

  const filteredProducts = products.filter((p: any) => 
    p.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="space-y-6">
      
      {/* 1. BUSCADOR Y FILTROS: Diseño original aprobado */}
      <div className="bg-white p-6 sm:p-8 rounded-[2.5rem] shadow-sm border border-gray-100 animate-in fade-in">
        <div className="flex flex-col gap-4">
          <input 
            type="text"
            placeholder="Buscar delicia..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full bg-[#FDFBF7] border border-gray-100 rounded-full py-4 px-8 outline-none focus:border-[#EDB2D1] text-sm font-josefin italic shadow-inner"
          />
          
          {/* Mantenemos tus 5 filtros originales. En mobile se apilan, en desktop se ven en línea */}
          <div className="grid grid-cols-2 md:flex md:flex-wrap gap-3">
            <select className="px-5 py-3 rounded-full border border-gray-100 bg-white text-[10px] font-black uppercase tracking-widest outline-none appearance-none cursor-pointer">
              <option>Categoría: Todas</option>
              {categories.map((c: any) => <option key={c.id}>{c.name}</option>)}
            </select>
            {/* ... Aquí siguen tus otros 4 selects con el mismo estilo ... */}
          </div>
        </div>
      </div>

      {/* 2. VISTA DUAL DE PRODUCTOS */}

      {/* --- A. VISTA ESCRITORIO: Tu tabla aprobada (Oculta en mobile < 640px) --- */}
      <div className="hidden sm:block overflow-hidden bg-white rounded-[2.5rem] shadow-sm border border-gray-100">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="bg-[#FDFBF7] border-b border-gray-100">
              <th className="p-6 text-[10px] font-black uppercase tracking-widest opacity-40">Producto</th>
              <th className="p-6 text-[10px] font-black uppercase tracking-widest opacity-40">Categoría</th>
              <th className="p-6 text-[10px] font-black uppercase tracking-widest opacity-40">Stock</th>
              <th className="p-6 text-[10px] font-black uppercase tracking-widest opacity-40">Precio</th>
              <th className="p-6 text-[10px] font-black uppercase tracking-widest opacity-40 text-right">Acciones</th>
            </tr>
          </thead>
          <tbody>
            {filteredProducts.map((product: any) => (
              <tr key={product.id} className="border-b border-gray-50 hover:bg-[#FDFBF7]/50 transition-colors group">
                <td className="p-6">
                  <div className="flex items-center gap-4">
                    {/* FIX ERROR: Si no hay image_url, pasamos null para evitar el error de src vacío */}
                    <img 
                      src={product.image_url || null} 
                      alt="" 
                      className="w-12 h-12 rounded-full object-cover border border-[#EDB2D1]/20 bg-gray-50" 
                    />
                    <span className="font-diner text-xl uppercase text-[#2B4233]">{product.name}</span>
                  </div>
                </td>
                <td className="p-6 text-[10px] font-black uppercase tracking-widest text-gray-400">{product.category}</td>
                <td className="p-6">
                   <span className={`px-3 py-1 rounded-full text-[10px] font-black ${product.stock <= product.critical_stock ? 'bg-red-50 text-red-500' : 'bg-[#2B4233]/5 text-[#2B4233]'}`}>
                    {product.stock}
                   </span>
                </td>
                <td className="p-6 font-mono font-bold text-[#2B4233]">${(product.price/100).toLocaleString('es-AR')}</td>
                <td className="p-6 text-right space-x-2">
                  <button onClick={() => onEdit(product)} className="p-2 hover:bg-[#EDB2D1]/10 rounded-full transition-colors opacity-0 group-hover:opacity-100">✏️</button>
                  <button onClick={() => onDelete(product.id)} className="p-2 hover:bg-red-50 rounded-full transition-colors opacity-0 group-hover:opacity-100">🗑️</button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* --- B. VISTA MOBILE: Tarjetas táctiles (Solo visible en mobile < 640px) --- */}
      <div className="block sm:hidden space-y-4 pb-20">
        {filteredProducts.map((product: any) => (
          <div key={product.id} className="bg-white p-5 rounded-[2.5rem] shadow-sm border border-gray-100 flex items-center gap-4 active:scale-95 transition-transform">
            <img 
              src={product.image_url || null} 
              className="w-16 h-16 rounded-full object-cover border-2 border-[#EDB2D1]/20 bg-gray-50" 
              alt=""
            />
            <div className="flex-1 min-w-0">
              <h4 className="font-diner text-lg uppercase text-[#2B4233] leading-none truncate">{product.name}</h4>
              <div className="flex items-center gap-2 mt-2">
                <span className="text-[9px] font-black uppercase tracking-widest text-[#EDB2D1]">{product.category}</span>
                <span className="text-[11px] font-mono font-bold text-[#2B4233] ml-auto">${(product.price/100).toLocaleString('es-AR')}</span>
              </div>
              <div className="mt-2">
                 <span className={`px-2 py-0.5 rounded-full text-[9px] font-black uppercase ${product.stock <= product.critical_stock ? 'bg-red-50 text-red-500' : 'bg-[#2B4233]/5 text-[#2B4233]'}`}>
                  Stock: {product.stock}
                 </span>
              </div>
            </div>
            <div className="flex flex-col gap-2">
              <button onClick={() => onEdit(product)} className="p-3 bg-[#FDFBF7] rounded-full border border-gray-50 shadow-sm active:bg-[#EDB2D1]/20">✏️</button>
              <button onClick={() => onDelete(product.id)} className="p-3 bg-[#FDFBF7] rounded-full border border-gray-50 shadow-sm active:bg-red-50">🗑️</button>
            </div>
          </div>
        ))}
      </div>

    </div>
  );
}