"use client";

export default function AdminFilters({ 
  searchTerm, setSearchTerm, 
  filterCategory, setFilterCategory, 
  filterStock, setFilterStock, 
  filterVisible, setFilterVisible, 
  filterPhoto, setFilterPhoto,
  sortBy, setSortBy, 
  categories 
}: any) {
  return (
    <div className="max-w-[1400px] mx-auto mb-6 bg-white p-4 rounded-[2rem] shadow-sm border border-[#EDB2D1]/20">
      <div className="flex flex-wrap gap-2 items-center">
        {/* 1. BUSCADOR */}
        <div className="flex-1 min-w-[200px] relative">
          <input 
            type="text" 
            placeholder="Buscar producto..." 
            value={searchTerm} 
            onChange={(e) => setSearchTerm(e.target.value)} 
            className="w-full px-5 py-3 bg-[#FDFBF7] border border-[#EDB2D1]/20 rounded-xl outline-none font-bold text-sm" 
          />
          {searchTerm && (
            <button onClick={() => setSearchTerm("")} className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-300 hover:text-red-500 font-bold cursor-pointer">✕</button>
          )}
        </div>
        
        {/* 2. CATEGORÍA */}
        <select value={filterCategory} onChange={(e) => setFilterCategory(e.target.value)} className="px-3 py-3 bg-[#FDFBF7] border border-[#EDB2D1]/20 rounded-xl font-bold uppercase text-[8px] outline-none cursor-pointer">
          <option value="all">Categoría: Todas</option>
          {categories.map((cat: any) => <option key={cat.id} value={cat.name}>Categoría: {cat.name}</option>)}
        </select>

        {/* 3. STOCK */}
        <select value={filterStock} onChange={(e) => setFilterStock(e.target.value)} className="px-3 py-3 bg-[#FDFBF7] border border-[#EDB2D1]/20 rounded-xl font-bold uppercase text-[8px] outline-none cursor-pointer">
          <option value="all">Stock: Todo</option>
          <option value="critical">Stock: Crítico/Agotado ⚠️</option>
        </select>

        {/* 4. TIENDA */}
        <select value={filterVisible} onChange={(e) => setFilterVisible(e.target.value)} className="px-3 py-3 bg-[#FDFBF7] border border-[#EDB2D1]/20 rounded-xl font-bold uppercase text-[8px] outline-none cursor-pointer">
          <option value="all">Tienda: Todo</option>
          <option value="visible">Tienda: Visible</option>
          <option value="hidden">Tienda: Oculto</option>
        </select>

        {/* 5. FOTOS */}
        <select value={filterPhoto} onChange={(e) => setFilterPhoto(e.target.value)} className="px-3 py-3 bg-[#FDFBF7] border border-[#EDB2D1]/20 rounded-xl font-bold uppercase text-[8px] outline-none cursor-pointer">
          <option value="all">Fotos: Todas</option>
          <option value="with">Fotos: Con Foto</option>
          <option value="without">Fotos: Sin Foto</option>
        </select>

        {/* EXTRA: ORDEN */}
        <select value={sortBy} onChange={(e) => setSortBy(e.target.value)} className="px-3 py-3 bg-[#FDFBF7] border border-[#EDB2D1]/20 rounded-xl font-bold uppercase text-[8px] outline-none cursor-pointer">
          <option value="name-asc">Orden: A-Z</option>
          <option value="price-asc">Orden: Precio Menor</option>
        </select>
      </div>
    </div>
  );
}