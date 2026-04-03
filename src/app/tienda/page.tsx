"use client";

import { useState, useEffect } from "react";
import { supabase } from "@/lib/supabase";
import FloatingActions from "@/components/FloatingActions";
import MarketingPopup from "@/components/MarketingPopup";
import ProductModal from "@/components/ProductModal";
import CartDrawer from "@/components/CartDrawer";
import { useCart } from "@/context/CartContext"; // Importamos el contexto

export default function TiendaPage() {
  const [products, setProducts] = useState<any[]>([]);
  const [categories, setCategories] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeCategory, setActiveCategory] = useState("Todas");
  
  // USAMOS EL CONTEXTO EN LUGAR DE ESTADOS LOCALES
  const { addToCart, openCart, cartCount, isCartOpen } = useCart();

  const [isMounted, setIsMounted] = useState(false);
  const [showMarketingPopup, setShowMarketingPopup] = useState(false);
  const [featuredProducts, setFeaturedProducts] = useState<any[]>([]);
  const [showTopButton, setShowTopButton] = useState(false);
  const [selectedProduct, setSelectedProduct] = useState<any | null>(null);

  useEffect(() => {
    setIsMounted(true);
    async function fetchData() {
      setLoading(true);
      const { data: cats } = await supabase.from('categories').select('*').order('name');
      const { data: prods } = await supabase.from('products').select('*').eq('is_visible', true).order('name');
      
      if (cats) setCategories([{ id: 'all', name: 'Todas' }, ...cats]);
      if (prods) {
        setProducts(prods);
        const featured = prods.filter(p => p.is_new || p.is_offer);
        if (featured.length > 0) {
          setFeaturedProducts(featured);
          setTimeout(() => setShowMarketingPopup(true), 1500);
        }
      }
      setLoading(false);
    }
    fetchData();
  }, []);

  useEffect(() => {
    const scrollArea = document.getElementById("scroll-area");
    const handleScroll = () => { if (scrollArea) setShowTopButton(scrollArea.scrollTop > 400); };
    scrollArea?.addEventListener("scroll", handleScroll);
    return () => scrollArea?.removeEventListener("scroll", handleScroll);
  }, [isMounted, loading]);

  const scrollToTop = () => document.getElementById("scroll-area")?.scrollTo({ top: 0, behavior: 'smooth' });

  if (!isMounted) return null;

  return (
    <div className="flex flex-col h-screen bg-[#FDFBF7] text-[#2B4233] font-josefin overflow-hidden relative">
      
      {/* BOTONES FLOTANTES: Ahora usan openCart del contexto */}
      <FloatingActions 
        showMarketing={showMarketingPopup}
        onOpenMarketing={() => setShowMarketingPopup(true)}
        onOpenCart={openCart} 
        cartCount={cartCount}
        showTopButton={showTopButton}
        onScrollTop={scrollToTop}
        featuredCount={featuredProducts.length}
      />

      {/* POPUP MKT: Ahora usa addToCart del contexto */}
      <MarketingPopup 
        isOpen={showMarketingPopup}
        onClose={() => setShowMarketingPopup(false)}
        products={featuredProducts}
        onAddToCart={(p: any) => { addToCart(p); setShowMarketingPopup(false); openCart(); }}
      />

      {/* MODAL DETALLE: Ahora usa addToCart del contexto */}
      <ProductModal 
        isOpen={!!selectedProduct}
        product={selectedProduct}
        onClose={() => setSelectedProduct(null)}
        onAddToCart={(p: any) => { addToCart(p); openCart(); }}
        allProducts={products}
      />

      {/* CARRITO: Ya no necesita props, se maneja solo con el Contexto */}
      <CartDrawer />

      <header className="flex-none h-[30vh] flex flex-col justify-center bg-[#FDFBF7] border-b border-[#EDB2D1]/20 px-4 text-center z-20">
        <h1 className="text-4xl md:text-7xl font-diner uppercase leading-none">Tyta Patisserie</h1>
        <p className="text-[8px] font-black uppercase tracking-[0.4em] opacity-40 mt-2">Pastelería de Autor</p>
        <nav className="max-w-[1200px] mx-auto w-full flex flex-wrap justify-center gap-2 mt-4">
          {categories.map((cat) => (
            <button key={cat.id} onClick={() => setActiveCategory(cat.name)} className={`px-4 py-1.5 rounded-full text-[8px] font-black uppercase transition-all border ${activeCategory === cat.name ? 'bg-[#2B4233] text-white' : 'bg-white text-[#2B4233]/40 border-[#EDB2D1]/10'}`}>{cat.name}</button>
          ))}
        </nav>
      </header>

      <main id="scroll-area" className="flex-1 overflow-y-auto custom-scrollbar bg-white/40 px-4 py-8 relative scroll-smooth">
        <div className="max-w-[1400px] mx-auto pb-40">
          <div className="grid grid-cols-2 md:grid-cols-5 gap-x-4 gap-y-10">
            {products.filter(p => activeCategory === "Todas" || p.category === activeCategory).map((product) => (
              <div key={product.id} onClick={() => setSelectedProduct(product)} className="group flex flex-col items-center text-center cursor-pointer">
                <div className="relative aspect-square w-full rounded-[2rem] overflow-hidden bg-white border border-[#EDB2D1]/10 shadow-sm">
                  <img src={product.image_url} alt={product.name} className="w-full h-full object-cover" />
                </div>
                <h3 className="mt-3 text-sm font-bold">{product.name}</h3>
                <p className="text-xs font-black text-[#EDB2D1] mt-1">${(product.price / 100).toLocaleString('es-AR')}</p>
              </div>
            ))}
          </div>
        </div>
      </main>
    </div>
  );
}