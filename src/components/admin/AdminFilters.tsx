"use client";
import React from "react";

export default function AdminFilters({
  searchTerm, setSearchTerm,
  filterCategory, setFilterCategory,
  filterStock, setFilterStock,
  filterVisible, setFilterVisible,
  sortBy, setSortBy,
  categories
}: any) {
  return (
    <div className="bg-white p-6 rounded-[3rem] border border-[#EDB2D1]/10 shadow-sm space-y-4 mb-8">
      
      {/* BUSCADOR PRINCIPAL */}
      <div className="relative">
        <input 
          type="text"
          placeholder="Buscar delicia..." 
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="w-full p-4 pl-12 bg-[#FDFBF7] border border-gray-100 rounded-2xl text-sm outline-none focus:border-[#EDB2D1] transition-all"
        />
        <span className="absolute left-4 top-1/2 -translate-y-1/2 opacity-30">🔍</span>
      </div>
      
      {/* GRILLA DE SELECTORES */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
        
        {/* CATEGORÍA */}
        <div className="flex flex-col gap-1">
          <label className="text-[8px] font-black uppercase text-gray-400 ml-3 tracking-widest">Categoría</label>
          <select 
            value={filterCategory} 
            onChange={(e) => setFilterCategory(e.target.value)}
            className="w-full p-4 bg-[#FDFBF7] border border-gray-100 rounded-2xl text-[11px] font-bold text-[#2B4233] outline-none appearance-none"
          >
            <option value="all">Todas</option>
            {categories.map((cat: any) => (
              <option key={cat.id} value={cat.name}>
                {cat.name} {/* Aquí ya no anteponemos "Categoría:" */}
              </option>
            ))}
          </select>
        </div>

        {/* STOCK */}
        <div className="flex flex-col gap-1">
          <label className="text-[8px] font-black uppercase text-gray-400 ml-3 tracking-widest">Stock</label>
          <select 
            value={filterStock} 
            onChange={(e) => setFilterStock(e.target.value)}
            className="w-full p-4 bg-[#FDFBF7] border border-gray-100 rounded-2xl text-[11px] font-bold text-[#2B4233] outline-none appearance-none"
          >
            <option value="all">Todos los niveles</option>
            <option value="critical">⚠️ Stock Crítico</option>
            <option value="out">🚫 Sin Stock</option>
          </select>
        </div>

        {/* VISIBILIDAD */}
        <div className="flex flex-col gap-1">
          <label className="text-[8px] font-black uppercase text-gray-400 ml-3 tracking-widest">Tienda</label>
          <select 
            value={filterVisible} 
            onChange={(e) => setFilterVisible(e.target.value)}
            className="w-full p-4 bg-[#FDFBF7] border border-gray-100 rounded-2xl text-[11px] font-bold text-[#2B4233] outline-none appearance-none"
          >
            <option value="all">Todos los estados</option>
            <option value="visible">👁️ Visibles</option>
            <option value="hidden">🌑 Ocultos</option>
          </select>
        </div>

        {/* ORDEN */}
        <div className="flex flex-col gap-1">
          <label className="text-[8px] font-black uppercase text-gray-400 ml-3 tracking-widest">Ordenar por</label>
          <select 
            value={sortBy} 
            onChange={(e) => setSortBy(e.target.value)}
            className="w-full p-4 bg-[#FDFBF7] border border-gray-100 rounded-2xl text-[11px] font-bold text-[#2B4233] outline-none appearance-none"
          >
            <option value="name-asc">Nombre (A-Z)</option>
            <option value="price-asc">Menor Precio</option>
            <option value="price-desc">Mayor Precio</option>
          </select>
        </div>

      </div>
    </div>
  );
}