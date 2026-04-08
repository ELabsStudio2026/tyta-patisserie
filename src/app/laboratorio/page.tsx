"use client";

import { useState, useEffect, useCallback, useRef } from "react";
import { supabase } from "@/lib/supabase";
import { useCart } from "@/context/CartContext";
import { getDetailedStoreStatus } from "@/lib/store-logic";

import FloatingActions from "@/components/FloatingActions";
import MarketingPopup from "@/components/MarketingPopup";
import ProductModal from "@/components/ProductModal";
import CartDrawer from "@/components/CartDrawer";
import ProductCard from "@/components/ProductCard";
import Footer from "@/components/Footer";

export default function TiendaPage() {
  const [isMobile, setIsMobile] = useState(false);
  const [isMounted, setIsMounted] = useState(false);
  const [products, setProducts] = useState<any[]>([]);
  const [categories, setCategories] = useState<any[]>([]);
  const [config, setConfig] = useState<any>(null);
  const [isStoreClosed, setIsStoreClosed] = useState(false);
  const [activeCategory, setActiveCategory] = useState("Todas");
  const [loading, setLoading] = useState(true);

  const { cart, addToCart, openCart, cartFlash } = useCart();
  const [selectedProduct, setSelectedProduct] = useState<any | null>(null);
  const [showMarketingPopup, setShowMarketingPopup] = useState(false);
  const [featuredProducts, setFeaturedProducts] = useState<any[]>([]);
  const [showTopButton, setShowTopButton] = useState(false);

  // REF para el scroll infinito de categorías
  const scrollRef = useRef<HTMLDivElement>(null);

  const refreshStoreStatus = useCallback(async (currentConfig: any) => {
    const status = await getDetailedStoreStatus(currentConfig);
    setIsStoreClosed(!status.isOpen);
  }, []);

  useEffect(() => {
    setIsMounted(true);
    const checkDevice = () => setIsMobile(window.innerWidth < 1024);
    checkDevice();
    window.addEventListener("resize", checkDevice);

    async function fetchData() {
      setLoading(true);
      const { data: cats } = await supabase.from('categories').select('*').order('name');
      const { data: prods } = await supabase.from('products').select('*').eq('is_visible', true).order('name');
      const { data: conf } = await supabase.from('store_config').select('*').single();
      
      if (cats) setCategories(cats);
      if (conf) { setConfig(conf); await refreshStoreStatus(conf); }
      if (prods) {
        setProducts(prods);
        const featured = prods.filter(p => p.is_new || p.is_offer);
        if (featured.length > 0) setFeaturedProducts(featured);
      }
      setLoading(false);
    }
    fetchData();

    const channel = supabase.channel('store-updates').on('postgres_changes', { event: '*', schema: 'public', table: 'store_config' }, async (payload: any) => {
      setConfig(payload.new);
      await refreshStoreStatus(payload.new);
    }).subscribe();

    return () => {
      window.removeEventListener("resize", checkDevice);
      supabase.removeChannel(channel);
    };
  }, [refreshStoreStatus]);

  // FILTRO EDITORIAL
  const visibleCategories = [
    { id: 'all', name: 'Todas' },
    ...categories.filter(cat => cat.is_on_gallery !== false)
  ];

  // LÓGICA DE INFINITO PARA CATEGORÍAS (Igual a la del Admin)
  const infiniteCategories = [...visibleCategories, ...visibleCategories, ...visibleCategories];

  useEffect(() => {
    if (isMobile && scrollRef.current) {
      const container = scrollRef.current;
      const activeElement = container.querySelector(`[data-active="true"]`);
      if (activeElement) {
        const scrollLeft = (activeElement as HTMLElement).offsetLeft - (container.offsetWidth / 2) + (activeElement as HTMLElement).offsetWidth / 2;
        container.scrollTo({ left: scrollLeft, behavior: 'smooth' });
      }
    }
  }, [activeCategory, isMobile, loading]);

  const handleInfiniteScroll = () => {
    if (!scrollRef.current) return;
    const { scrollLeft, scrollWidth, clientWidth } = scrollRef.current;
    if (scrollLeft + clientWidth >= scrollWidth - 10) scrollRef.current.scrollLeft = scrollWidth / 3;
    if (scrollLeft <= 10) scrollRef.current.scrollLeft = scrollWidth / 3;
  };

  if (!isMounted) return null;

  return (
    <div className="flex flex-col h-screen bg-[#FDFBF7] text-[#2B4233] font-josefin overflow-hidden relative">
      <FloatingActions 
        showMarketing={showMarketingPopup} onOpenMarketing={() => setShowMarketingPopup(true)}
        onOpenCart={openCart} cartCount={cart.reduce((acc, i) => acc + i.quantity, 0)} 
        cartFlash={cartFlash} showTopButton={showTopButton}
        onScrollTop={() => document.getElementById("scroll-area")?.scrollTo({ top: 0, behavior: 'smooth' })}
        featuredCount={featuredProducts.length}
      />

      <MarketingPopup isOpen={showMarketingPopup} onClose={() => setShowMarketingPopup(false)} products={featuredProducts} onAddToCart={(p: any) => { addToCart(p); setShowMarketingPopup(false); openCart(); }} isDisabled={isStoreClosed} />
      <ProductModal isOpen={!!selectedProduct} product={selectedProduct} onClose={() => setSelectedProduct(null)} onAddToCart={(p: any) => { addToCart(p); openCart(); }} allProducts={products} isDisabled={isStoreClosed} />
      {config && <CartDrawer storeStatus={{ ...config, isClosed: isStoreClosed }} />}

      <header className={`flex-none bg-[#5E7361] flex flex-col justify-between p-4 shadow-md z-20 ${isMobile ? 'h-[25vh]' : 'h-[30vh]'}`}>
        <div className="flex-1 flex flex-col justify-center text-center">
          <h1 className={`${isMobile ? 'text-3xl' : 'text-6xl'} font-diner uppercase text-white leading-none`}>Tyta Patisserie</h1>
          <p className="text-[10px] tracking-[0.4em] text-white/70 uppercase mt-1">by Su Fernandez</p>
        </div>

        {/* NAVEGACIÓN DUAL */}
        <nav className="w-full relative">
          {isMobile ? (
            /* VISTA CELULAR: RUEDA INFINITA */
            <div className="relative py-2 overflow-hidden">
              <div className="absolute inset-y-0 left-0 w-16 bg-gradient-to-r from-[#5E7361] to-transparent z-10 pointer-events-none" />
              <div className="absolute inset-y-0 right-0 w-16 bg-gradient-to-l from-[#5E7361] to-transparent z-10 pointer-events-none" />
              
              <div 
                ref={scrollRef}
                onScroll={handleInfiniteScroll}
                className="flex gap-4 overflow-x-auto no-scrollbar snap-x snap-mandatory px-32"
              >
                {infiniteCategories.map((cat, index) => {
                  const isActive = activeCategory === cat.name;
                  const isMiddleRange = index >= visibleCategories.length && index < visibleCategories.length * 2;
                  return (
                    <button 
                      key={`${cat.id}-${index}`}
                      data-active={isActive && isMiddleRange}
                      onClick={() => setActiveCategory(cat.name)}
                      className={`snap-center flex-none px-6 py-2 rounded-full text-[10px] font-black uppercase tracking-[0.2em] transition-all duration-300 ${
                        isActive && isMiddleRange
                        ? 'bg-[#EDB2D1] text-[#2B4233] scale-110 shadow-lg' 
                        : 'text-white/40 scale-90'
                      }`}
                    >
                      {cat.name}
                    </button>
                  );
                })}
              </div>
            </div>
          ) : (
            /* VISTA ESCRITORIO: BOTONES FIJOS */
            <div className="flex flex-wrap justify-center gap-1.5 pb-2">
              {visibleCategories.map((cat) => (
                <button 
                  key={cat.id} 
                  onClick={() => setActiveCategory(cat.name)} 
                  className={`px-3 py-1.5 rounded-full text-[8px] font-black uppercase transition-all shadow-sm ${
                    activeCategory === cat.name 
                      ? 'bg-[#EDB2D1] text-[#2B4233] scale-105' 
                      : 'bg-white text-[#2B4233] hover:bg-gray-100'
                  }`}
                >
                  {cat.name}
                </button>
              ))}
            </div>
          )}
        </nav>
      </header>

      <main id="scroll-area" className="flex-1 overflow-y-auto bg-white px-4 py-8 custom-scrollbar">
        <div className="max-w-[1400px] mx-auto pb-40">
          <div className={`grid gap-4 ${isMobile ? 'grid-cols-2' : 'grid-cols-5'}`}>
            {products
              .filter(p => activeCategory === "Todas" || p.category === activeCategory)
              .map((product) => (
                <ProductCard key={product.id} product={product} onOpenDetail={() => setSelectedProduct(product)} isDisabled={isStoreClosed} />
              ))
            }
          </div>
        </div>
      </main>
      <Footer />
    </div>
  );
}