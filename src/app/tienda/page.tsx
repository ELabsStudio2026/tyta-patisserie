"use client";

import { useState, useEffect, useCallback } from "react";
import { supabase } from "@/lib/supabase";
import { useCart } from "@/context/CartContext";
import { getDetailedStoreStatus } from "@/lib/store-logic";

// COMPONENTES COMPARTIDOS
import FloatingActions from "@/components/FloatingActions";
import MarketingPopup from "@/components/MarketingPopup";
import ProductModal from "@/components/ProductModal";
import CartDrawer from "@/components/CartDrawer";
import ProductCard from "@/components/ProductCard";
import Footer from "@/components/Footer";

export default function TiendaPage() {
  // 1. ESTADOS DE CONTROL DE PANTALLA
  const [isMobile, setIsMobile] = useState(false);
  const [isMounted, setIsMounted] = useState(false);

  // 2. ESTADOS DE DATOS Y TIENDA
  const [products, setProducts] = useState<any[]>([]);
  const [categories, setCategories] = useState<any[]>([]);
  const [config, setConfig] = useState<any>(null);
  const [isStoreClosed, setIsStoreClosed] = useState(false);
  const [activeCategory, setActiveCategory] = useState("Todas");
  const [loading, setLoading] = useState(true);

  // 3. ESTADOS DE INTERFAZ
  const { cart, addToCart, openCart, cartFlash } = useCart();
  const [selectedProduct, setSelectedProduct] = useState<any | null>(null);
  const [showMarketingPopup, setShowMarketingPopup] = useState(false);
  const [featuredProducts, setFeaturedProducts] = useState<any[]>([]);
  const [showTopButton, setShowTopButton] = useState(false);

  const cartCount = cart.reduce((acc, item) => acc + item.quantity, 0);

  // LÓGICA DE APERTURA/CIERRE
  const refreshStoreStatus = useCallback(async (currentConfig: any) => {
    const status = await getDetailedStoreStatus(currentConfig);
    setIsStoreClosed(!status.isOpen);
  }, []);

  useEffect(() => {
    setIsMounted(true);
    
    // DETECTOR DE DISPOSITIVO (Punto de quiebre: 1024px)
    const checkDevice = () => setIsMobile(window.innerWidth < 1024);
    checkDevice();
    window.addEventListener("resize", checkDevice);

    async function fetchData() {
      setLoading(true);
      const { data: cats } = await supabase.from('categories').select('*').order('name');
      const { data: prods } = await supabase.from('products').select('*').eq('is_visible', true).order('name');
      const { data: conf } = await supabase.from('store_config').select('*').single();
      
      if (cats) setCategories([{ id: 'all', name: 'Todas' }, ...cats]);
      
      if (conf) {
        setConfig(conf);
        await refreshStoreStatus(conf);
      }

      if (prods) {
        setProducts(prods);
        const featured = prods.filter(p => p.is_new || p.is_offer);
        if (featured.length > 0) {
          setFeaturedProducts(featured);
          if (conf && !(await getDetailedStoreStatus(conf)).isOpen === false) {
             setTimeout(() => setShowMarketingPopup(true), 1500);
          }
        }
      }
      setLoading(false);
    }
    fetchData();

    // REALTIME PARA AMBOS MUNDOS
    const configChannel = supabase.channel('store-updates-global')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'store_config' }, 
        async (payload: any) => {
          setConfig(payload.new);
          await refreshStoreStatus(payload.new);
        }
      ).subscribe();

    return () => {
      window.removeEventListener("resize", checkDevice);
      supabase.removeChannel(configChannel);
    };
  }, [refreshStoreStatus]);

  // SCROLL CONTROL
  useEffect(() => {
    const scrollArea = document.getElementById("scroll-area");
    const handleScroll = () => { if (scrollArea) setShowTopButton(scrollArea.scrollTop > 400); };
    scrollArea?.addEventListener("scroll", handleScroll);
    return () => scrollArea?.removeEventListener("scroll", handleScroll);
  }, [isMounted, loading]);

  if (!isMounted) return null;

  return (
    <div className="flex flex-col h-screen bg-[#FDFBF7] text-[#2B4233] font-josefin overflow-hidden relative">
      
      {/* COMPONENTE DE ACCIONES FLOTANTES (COMÚN) */}
      <FloatingActions 
        showMarketing={showMarketingPopup}
        onOpenMarketing={() => setShowMarketingPopup(true)}
        onOpenCart={openCart} 
        cartCount={cartCount} 
        cartFlash={cartFlash}
        showTopButton={showTopButton}
        onScrollTop={() => document.getElementById("scroll-area")?.scrollTo({ top: 0, behavior: 'smooth' })}
        featuredCount={featuredProducts.length}
      />

      <MarketingPopup 
        isOpen={showMarketingPopup} onClose={() => setShowMarketingPopup(false)} 
        products={featuredProducts} 
        onAddToCart={(p: any) => { addToCart(p); setShowMarketingPopup(false); openCart(); }}
        isDisabled={isStoreClosed}
      />

      <ProductModal 
        isOpen={!!selectedProduct} product={selectedProduct} 
        onClose={() => setSelectedProduct(null)} 
        onAddToCart={(p: any) => { addToCart(p); openCart(); }} 
        allProducts={products}
        isDisabled={isStoreClosed} 
      />

      {config && <CartDrawer storeStatus={{ ...config, isClosed: isStoreClosed }} />}

      {/* --- EL GRAN DIVISOR --- */}

      {isMobile ? (
        /* =================DISEÑO CELULAR (BOUTIQUE MOBILE)================= */
        <>
          <header className="flex-none h-[25vh] bg-[#5E7361] flex flex-col justify-between p-4 shadow-md z-20">
            <div className="flex-1 flex flex-col justify-center text-center">
              <h1 className="text-3xl font-diner uppercase text-white leading-none">Tyta Patisserie</h1>
              <p className="text-[10px] tracking-[0.4em] text-white/70 uppercase mt-1">by Su Fernandez</p>
            </div>
            <nav className="w-full flex flex-nowrap overflow-x-auto no-scrollbar gap-2 pb-2">
              {categories.map((cat) => (
                <button key={cat.id} onClick={() => setActiveCategory(cat.name)} className={`flex-none px-4 py-2 rounded-full text-[9px] font-black uppercase ${activeCategory === cat.name ? 'bg-[#EDB2D1] text-[#2B4233]' : 'bg-white text-[#2B4233]'}`}>
                  {cat.name}
                </button>
              ))}
            </nav>
          </header>
          <main id="scroll-area" className="flex-1 overflow-y-auto bg-white px-4 py-6">
            <div className="grid grid-cols-2 gap-4 pb-32">
              {products.filter(p => activeCategory === "Todas" || p.category === activeCategory).map((product) => (
                <ProductCard key={product.id} product={product} onOpenDetail={() => setSelectedProduct(product)} isDisabled={isStoreClosed} />
              ))}
            </div>
          </main>
        </>
      ) : (
        /* =================DISEÑO ESCRITORIO (5 DE ABRIL)================= */
        <>
          <header className="flex-none h-[30vh] flex flex-col justify-between bg-[#5E7361] px-4 py-6 text-center z-20 shadow-md">
            <div className="flex-1 flex flex-col justify-center">
              <h1 className="text-6xl font-diner uppercase leading-none text-white tracking-tight">Tyta Patisserie</h1>
              <p className="text-[12px] font-josefin tracking-[0.5em] uppercase mt-2 text-white/80">by Su Fernandez</p>
            </div>
            <nav className="w-full flex flex-wrap justify-center gap-1.5 pb-2">
              {categories.map((cat) => (
                <button key={cat.id} onClick={() => setActiveCategory(cat.name)} className={`px-3 py-1.5 rounded-full text-[8px] font-black uppercase transition-all shadow-sm ${activeCategory === cat.name ? 'bg-[#EDB2D1] text-[#2B4233] scale-105' : 'bg-white text-[#2B4233] hover:bg-gray-100'}`}>
                  {cat.name}
                </button>
              ))}
            </nav>
          </header>
          <main id="scroll-area" className="flex-1 overflow-y-auto custom-scrollbar bg-white px-10 py-8 relative scroll-smooth">
            <div className="max-w-[1400px] mx-auto pb-40">
              <div className="grid grid-cols-5 gap-x-4 gap-y-10">
                {products.filter(p => activeCategory === "Todas" || p.category === activeCategory).map((product) => (
                  <ProductCard key={product.id} product={product} onOpenDetail={() => setSelectedProduct(product)} isDisabled={isStoreClosed} />
                ))}
              </div>
            </div>
          </main>
        </>
      )}

      <Footer />
    </div>
  );
}