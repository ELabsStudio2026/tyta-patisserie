"use client";

import { useState, useEffect } from "react";
import { supabase } from "@/lib/supabase";
import Link from "next/link";

// Componente de la Tienda Pública con Ribbon Tyta
export default function TiendaPage() {
  const [products, setProducts] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeCategory, setActiveCategory] = useState("Todas");

  //const CATEGORIES = ["Todas", "Tortas", "Macarrons", "Cafetería", "Bebidas y Tragos", "Combos", "Desayuno y Merienda", "Cookies, Budines y Alfajores", "Sandwichs y Tostados", "Salados", "Adicionales"];
  const CATEGORIES = ["Todas", "Adicionales", "Almuerzos", "Bebidas y Tragos", "Bolleria y Panificados", "Cafeteria", "Cajas y Degustaciones", "Combos", "Cookies, Budines y Alfajores", "Desayuno y Merienda", "Macarrons", "Sandwichs y Tostados", "Tortas Enteras", "Tortas y Lingotes"];

  // --- CONEXIÓN A SUPABASE ---
  useEffect(() => {
    async function fetchPublicProducts() {
      setLoading(true);
      // Traemos solo los productos visibles configurados en el Admin
      const { data, error } = await supabase
        .from('products')
        .select('*')
        .eq('is_visible', true)
        .order('name', { ascending: true });

      if (!error && data) {
        setProducts(data);
      }
      setLoading(false);
    }

    fetchPublicProducts();
  }, []);

  // Formateador de moneda (ARS) sin decimales para limpieza visual
  const formatPrice = (cents: number) => {
    const pesos = Number(cents || 0) / 100;
    return new Intl.NumberFormat('es-AR', {
      style: 'currency',
      currency: 'ARS',
      minimumFractionDigits: 0 
    }).format(pesos);
  };

  const filteredProducts = activeCategory === "Todas" 
    ? products 
    : products.filter(p => p.category === activeCategory);

  if (loading) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-[#FDFBF7] font-diner">
        <div className="text-6xl text-[#2B4233] animate-pulse">TYTA PATISSERIE</div>
        <div className="text-sm font-josefin uppercase tracking-[0.5em] mt-4 opacity-50">Preparando el mostrador...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#FDFBF7] text-[#2B4233] font-josefin selection:bg-[#EDB2D1] selection:text-white">
      
      {/* --- HERO / HEADER --- */}
      <header className="pt-20 pb-12 px-4 text-center">
        <Link href="/" className="inline-block mb-6 hover:scale-105 transition-transform">
          <h1 className="text-8xl font-diner uppercase leading-none tracking-tight">Tyta Patisserie</h1>
        </Link>
        <p className="text-xs font-black uppercase tracking-[0.4em] opacity-40 mb-12">Pastelería de Autor & Momentos Dulces</p>

        {/* --- SELECTOR DE CATEGORÍAS BOUTIQUE --- */}
        <nav className="max-w-5xl mx-auto flex flex-wrap justify-center gap-3 mb-16">
          {CATEGORIES.map((cat) => (
            <button
              key={cat}
              onClick={() => setActiveCategory(cat)}
              className={`px-6 py-2 rounded-full text-[10px] font-black uppercase tracking-widest transition-all border ${
                activeCategory === cat 
                ? 'bg-[#2B4233] text-white border-[#2B4233] shadow-lg' 
                : 'bg-white text-[#2B4233]/50 border-gray-100 hover:border-[#EDB2D1] hover:text-[#EDB2D1]'
              }`}
            >
              {cat}
            </button>
          ))}
        </nav>
      </header>

      {/* --- GRILLA DE PRODUCTOS --- */}
      <main className="max-w-[1400px] mx-auto px-6 pb-24">
        {filteredProducts.length > 0 ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-x-8 gap-y-12">
            {filteredProducts.map((product) => {
              const isAgotado = Number(product.stock) <= 0;

              return (
                <div key={product.id} className="group relative flex flex-col">
                  
                  {/* Contenedor de Imagen con RIBBON */}
                  <div className="relative aspect-[4/5] rounded-[2.5rem] overflow-hidden bg-white border border-[#EDB2D1]/10 shadow-sm transition-all duration-500 group-hover:shadow-2xl group-hover:-translate-y-2">
                    <img 
                      src={product.image_url || '/images/placeholder.jpg'} 
                      alt={product.name}
                      className={`w-full h-full object-cover transition-transform duration-700 group-hover:scale-110 ${isAgotado ? 'grayscale opacity-80' : ''}`}
                    />
                    
                    {/* --- RIBBON TYTA AGOTADO (Restaurado) --- */}
                    {isAgotado && (
                      <div className="absolute top-0 right-0 w-32 h-32 overflow-hidden z-10">
                        <div className="absolute top-6 -right-10 w-48 py-2 bg-[#EDB2D1] text-[#2B4233] text-center rotate-45 shadow-lg border-y-2 border-[#2B4233]/10">
                          <span className="font-black text-[11px] uppercase tracking-[0.3em]">
                            Agotado
                          </span>
                        </div>
                      </div>
                    )}

                    {/* Botón Flotante de Compra (Solo si hay stock y al hacer hover) */}
                    {!isAgotado && (
                      <button className="absolute bottom-6 left-1/2 -translate-x-1/2 translate-y-12 opacity-0 group-hover:translate-y-0 group-hover:opacity-100 transition-all duration-300 bg-[#2B4233] text-[#EDB2D1] px-8 py-4 rounded-full font-black text-[10px] uppercase tracking-widest shadow-2xl flex items-center gap-3 active:scale-95">
                        <span>Añadir al pedido</span>
                        <span className="w-1.5 h-1.5 rounded-full bg-[#EDB2D1] animate-pulse"></span>
                      </button>
                    )}
                  </div>

                  {/* Info del Producto */}
                  <div className="mt-6 text-center px-2">
                    <span className="text-[9px] font-black uppercase tracking-[0.25em] text-[#EDB2D1] mb-2 block">{product.category}</span>
                    <h3 className="text-2xl font-bold text-[#2B4233] leading-tight mb-2 group-hover:text-[#EDB2D1] transition-colors">{product.name}</h3>
                    <div className="flex items-center justify-center gap-3">
                      <div className="h-[1px] w-4 bg-[#EDB2D1]/30"></div>
                      <p className="text-xl font-black italic font-mono text-[#2B4233]">
                        {formatPrice(product.price)}
                      </p>
                      <div className="h-[1px] w-4 bg-[#EDB2D1]/30"></div>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        ) : (
          <div className="py-40 text-center">
            <div className="text-4xl font-diner opacity-20 mb-4 uppercase">No hay delicias en esta sección</div>
            <button onClick={() => setActiveCategory("Todas")} className="text-[10px] font-black uppercase underline tracking-widest text-[#EDB2D1]">Ver todo el catálogo</button>
          </div>
        )}
      </main>

      {/* --- FOOTER SIMPLE --- */}
      <footer className="border-t border-[#EDB2D1]/10 py-12 text-center bg-white">
        <p className="text-[10px] font-black uppercase tracking-[0.3em] opacity-30">© 2026 Tyta Patisserie • Victoria, Buenos Aires</p>
      </footer>
    </div>
  );
}