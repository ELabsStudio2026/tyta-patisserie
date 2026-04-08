"use client";

import { useState, useEffect } from "react";
import { supabase } from "@/lib/supabase";
import { useCart } from "@/context/CartContext";
// Importamos los mismos componentes que usa la original
import FloatingActions from "@/components/FloatingActions";
import MarketingPopup from "@/components/MarketingPopup";
import ProductModal from "@/components/ProductModal";
import CartDrawer from "@/components/CartDrawer";
import ProductCard from "@/components/ProductCard";
import Footer from "@/components/Footer";

export default function TiendaCeluPage() {
  const [isMobile, setIsMobile] = useState(false);
  const [isMounted, setIsMounted] = useState(false);
  
  // Estados de datos (copiados de la original)
  const [products, setProducts] = useState<any[]>([]);
  const [categories, setCategories] = useState<any[]>([]);
  const [activeCategory, setActiveCategory] = useState("Todas");
  const { cart, addToCart, openCart, cartFlash } = useCart();
  const [selectedProduct, setSelectedProduct] = useState<any | null>(null);

  useEffect(() => {
    setIsMounted(true);
    
    // DETECTOR DE PANTALLA
    const checkDevice = () => {
      setIsMobile(window.innerWidth < 1024);
    };
    
    checkDevice();
    window.addEventListener("resize", checkDevice);

    async function fetchData() {
      const { data: cats } = await supabase.from('categories').select('*').order('name');
      const { data: prods } = await supabase.from('products').select('*').eq('is_visible', true).order('name');
      if (cats) setCategories([{ id: 'all', name: 'Todas' }, ...cats]);
      if (prods) setProducts(prods);
    }
    fetchData();

    return () => window.removeEventListener("resize", checkDevice);
  }, []);

  if (!isMounted) return null;

  // SI DETECTA ESCRITORIO: Muestra solo un aviso limpio
  if (!isMobile) {
    return (
      <div className="h-screen flex flex-col items-center justify-center bg-[#FDFBF7] p-10 text-center">
        <h1 className="font-diner text-6xl text-[#2B4233] mb-4">TP</h1>
        <p className="font-josefin uppercase tracking-widest text-gray-400">
          Estás en modo escritorio. <br /> 
          Abrí esta URL desde un celular para probar el diseño.
        </p>
      </div>
    );
  }

  // SI DETECTA CELULAR: Aquí empezamos a construir el diseño "Boutique Mobile"
  return (
    <div className="flex flex-col h-screen bg-[#FDFBF7] text-[#2B4233] font-josefin overflow-hidden relative">
      
      {/* Componentes globales compartidos */}
      <CartDrawer />
      <ProductModal 
        isOpen={!!selectedProduct} 
        product={selectedProduct} 
        onClose={() => setSelectedProduct(null)} 
        onAddToCart={(p: any) => { addToCart(p); openCart(); }} 
        allProducts={products} 
      />

      {/* HEADER CELULAR: 25% de la pantalla para dejar aire */}
      <header className="flex-none h-[25vh] bg-[#5E7361] flex flex-col justify-between p-4 shadow-md z-20">
        <div className="flex-1 flex flex-col justify-center text-center">
          <h1 className="text-3xl font-diner uppercase text-white leading-none">Tyta Patisserie</h1>
          <p className="text-[10px] tracking-[0.4em] text-white/70 uppercase mt-1">by Su Fernandez</p>
        </div>

        {/* NAVEGACIÓN MOBILE: Scroll lateral infinito para que no ocupe más de una línea */}
        <nav className="w-full flex flex-nowrap overflow-x-auto no-scrollbar gap-2 pb-2">
          {categories.map((cat) => (
            <button 
              key={cat.id} 
              onClick={() => setActiveCategory(cat.name)}
              className={`flex-none px-4 py-2 rounded-full text-[9px] font-black uppercase transition-all ${
                activeCategory === cat.name ? 'bg-[#EDB2D1] text-[#2B4233]' : 'bg-white text-[#2B4233]'
              }`}
            >
              {cat.name}
            </button>
          ))}
        </nav>
      </header>

      {/* MAIN MOBILE: Grilla de 2 columnas */}
      <main className="flex-1 overflow-y-auto bg-white px-4 py-6">
        <div className="grid grid-cols-2 gap-4 pb-32">
          {products
            .filter(p => activeCategory === "Todas" || p.category === activeCategory)
            .map((product) => (
              <ProductCard 
                key={product.id} 
                product={product} 
                onOpenDetail={() => setSelectedProduct(product)} 
              />
            ))
          }
        </div>
      </main>

      <Footer />
    </div>
  );
}