"use client";

import { useState, useEffect } from "react";
import { supabase } from "@/lib/supabase";
import Link from "next/link";

export default function TiendaPage() {
  const [products, setProducts] = useState<any[]>([]);
  const [categories, setCategories] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeCategory, setActiveCategory] = useState("Todas");
  const [showTopButton, setShowTopButton] = useState(false);

  useEffect(() => {
    async function fetchData() {
      setLoading(true);
      const { data: cats } = await supabase.from('categories').select('*').order('name');
      const { data: prods } = await supabase.from('products').select('*').eq('is_visible', true).order('name');
      if (cats) setCategories([{ id: 'all', name: 'Todas' }, ...cats]);
      if (prods) setProducts(prods);
      setLoading(false);
    }
    fetchData();
  }, []);

  useEffect(() => {
    const scrollContainer = document.getElementById("main-content");
    const handleScroll = () => {
      if (scrollContainer) {
        setShowTopButton(scrollContainer.scrollTop > 300);
      }
    };
    scrollContainer?.addEventListener("scroll", handleScroll);
    return () => scrollContainer?.removeEventListener("scroll", handleScroll);
  }, [loading]);

  const scrollToTop = () => {
    const scrollContainer = document.getElementById("main-content");
    scrollContainer?.scrollTo({ top: 0, behavior: "smooth" });
  };

  const normalizeText = (text: string) => 
    text.toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "").trim();

  const filteredProducts = activeCategory === "Todas" 
    ? products 
    : products.filter(p => normalizeText(p.category || "") === normalizeText(activeCategory));

  if (loading) return (
    <div className="h-screen flex items-center justify-center bg-[#FDFBF7]">
      <h2 className="text-5xl font-diner text-[#2B4233] animate-pulse uppercase">Tyta Patisserie</h2>
    </div>
  );

  return (
    <div className="flex flex-col h-screen bg-[#FDFBF7] text-[#2B4233] font-josefin overflow-hidden relative">
      
      {/* HEADER (30% de la pantalla) */}
      <header className="flex-none h-[30vh] flex flex-col justify-center bg-[#FDFBF7] border-b border-[#EDB2D1]/20 px-4 md:px-8 z-20">
        <div className="text-center mb-2">
          <Link href="/" className="inline-block hover:scale-105 transition-all">
            <h1 className="text-4xl md:text-5xl lg:text-7xl font-diner uppercase leading-none tracking-tighter">
              Tyta Patisserie
            </h1>
          </Link>
          <p className="text-[7px] md:text-[8px] font-black uppercase tracking-[0.4em] opacity-40 mt-1">
            Pastelería de Autor & Momentos Dulces
          </p>
        </div>

        <nav className="max-w-[1200px] mx-auto w-full flex flex-wrap justify-center items-center gap-1.5 md:gap-2 overflow-y-auto no-scrollbar">
          {categories.map((cat) => (
            <button
              key={cat.id}
              onClick={() => setActiveCategory(cat.name)}
              className={`px-3 py-1 md:px-4 md:py-1.5 rounded-full text-[7px] md:text-[8px] font-black uppercase tracking-widest transition-all border ${
                activeCategory === cat.name 
                ? 'bg-[#2B4233] text-white border-[#2B4233] shadow-md scale-105' 
                : 'bg-white text-[#2B4233]/40 border-[#EDB2D1]/10 hover:border-[#EDB2D1] shadow-sm'
              }`}
            >
              {cat.name}
            </button>
          ))}
        </nav>
      </header>

      {/* CUERPO PRINCIPAL */}
      <main 
        id="main-content"
        className="flex-1 overflow-y-auto custom-scrollbar bg-white/40 px-4 py-8 relative scroll-smooth"
      >
        <div className="max-w-[1400px] mx-auto">
          {filteredProducts.length > 0 ? (
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-x-4 gap-y-10">
              {filteredProducts.map((product) => (
                <div key={product.id} className="group flex flex-col items-center">
                  <div className="relative aspect-square w-full rounded-[1.5rem] md:rounded-[2rem] overflow-hidden bg-white border border-[#EDB2D1]/10 shadow-sm transition-all duration-500 group-hover:shadow-xl group-hover:-translate-y-1">
                    <img alt="Tyta Patisserie" 
                      src={product.image_url || '/images/placeholder.jpg'} 
                      alt={product.name}
                      className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
                    />
                    {Number(product.stock) <= 0 && (
                      <div className="absolute top-0 right-0 w-24 h-24 overflow-hidden z-10 pointer-events-none">
                        <div className="absolute top-4 -right-8 w-32 py-1 bg-[#EDB2D1] text-[#2B4233] text-center rotate-45 shadow-md border-y border-[#2B4233]/10">
                          <span className="font-black text-[7px] md:text-[8px] uppercase tracking-[0.2em]">Agotado</span>
                        </div>
                      </div>
                    )}
                  </div>
                  <div className="mt-3 text-center px-1">
                    <span className="text-[6px] md:text-[7px] font-black uppercase tracking-widest text-[#EDB2D1] block mb-0.5">{product.category}</span>
                    <h3 className="text-xs md:text-sm font-bold leading-tight line-clamp-2 h-8 flex items-center justify-center">{product.name}</h3>
                    <p className="text-[10px] md:text-xs font-black italic font-mono text-[#2B4233]/70 mt-1">
                      ${(product.price / 100).toLocaleString('es-AR')}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="h-full flex items-center justify-center opacity-10 uppercase font-diner text-2xl">Próximamente</div>
          )}
        </div>
      </main>

      {/* BOTÓN BACK TO TOP: Ubicado dinámicamente justo encima del footer */}
      <button 
        onClick={scrollToTop}
        className={`fixed bottom-[7vh] right-6 md:right-10 z-50 w-10 h-10 md:w-12 md:h-12 bg-[#EDB2D1] text-white rounded-full shadow-lg flex items-center justify-center transition-all duration-500 hover:scale-110 active:scale-95 ${
          showTopButton ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-10 pointer-events-none'
        }`}
        style={{ marginBottom: '10px' }} 
      >
        <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 md:h-6 md:w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 15l7-7 7 7" />
        </svg>
      </button>

      {/* FOOTER FIJO (aprox 6-7vh) */}
      <footer className="flex-none py-4 bg-white border-t border-[#EDB2D1]/10 text-center z-20">
        <p className="text-[7px] font-black uppercase tracking-[0.4em] opacity-30">
          TYTA PATISSERIE © 2026 • ELABS STUDIO BOUTIQUE
        </p>
      </footer>

      <style jsx global>{`
        .custom-scrollbar::-webkit-scrollbar { width: 3px; }
        .custom-scrollbar::-webkit-scrollbar-track { background: transparent; }
        .custom-scrollbar::-webkit-scrollbar-thumb { background: #EDB2D1; border-radius: 10px; }
        .no-scrollbar::-webkit-scrollbar { display: none; }
      `}</style>
    </div>
  );
}
