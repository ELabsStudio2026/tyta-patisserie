"use client";

import { useState, useEffect, useCallback } from "react";
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
  const [products, setProducts] = useState<any[]>([]);
  const [categories, setCategories] = useState<any[]>([]);
  const [config, setConfig] = useState<any>(null);
  const [isStoreClosed, setIsStoreClosed] = useState(false);
  const [storeMessage, setStoreMessage] = useState("");
  const [activeCategory, setActiveCategory] = useState("Todas");
  const [showMarketingPopup, setShowMarketingPopup] = useState(false);
  const [selectedProduct, setSelectedProduct] = useState<any | null>(null);
  const [isMounted, setIsMounted] = useState(false);

  const { cart, openCart, addToCart, cartFlash } = useCart();

  // Función para recalcular el estado (se usa en carga y en tiempo real)
  const refreshStoreStatus = useCallback(async (currentConfig: any) => {
    const status = await getDetailedStoreStatus(currentConfig);
    setIsStoreClosed(!status.isOpen);
    setStoreMessage(status.message);
  }, []);

  useEffect(() => {
    setIsMounted(true);
    
    async function fetchData() {
      // 1. Cargamos categorías y productos
      const { data: cats } = await supabase.from('categories').select('*').order('name');
      const { data: prods } = await supabase.from('products').select('*').eq('is_visible', true).order('name');
      
      // 2. Cargamos la configuración (Aquí viene el WhatsApp)
      const { data: conf } = await supabase.from('store_config').select('*').single();
      
      if (cats) setCategories([{ id: 'all', name: 'Todas' }, ...cats]);
      if (prods) setProducts(prods);
      
      if (conf) {
        setConfig(conf);
        await refreshStoreStatus(conf);
        
        // Popup de marketing (solo si la tienda está abierta)
        const status = await getDetailedStoreStatus(conf);
        if (status.isOpen) {
          setTimeout(() => setShowMarketingPopup(true), 1500);
        }
      }
    }
    fetchData();

    // ESCUCHA REALTIME: Configuración y Horarios
    const configChannel = supabase.channel('store-updates')
      .on('postgres_changes', { event: 'UPDATE', schema: 'public', table: 'store_config' }, 
        async (payload) => {
          setConfig(payload.new);
          await refreshStoreStatus(payload.new);
        }
      )
      .on('postgres_changes', { event: 'UPDATE', schema: 'public', table: 'horarios_tienda_online' }, 
        async () => {
          if (config) await refreshStoreStatus(config);
        }
      )
      .subscribe();

    // ESCUCHA REALTIME: Productos
    const productChannel = supabase.channel('product-updates')
      .on('postgres_changes', { event: 'UPDATE', schema: 'public', table: 'products' }, 
        (payload) => {
          setProducts(prev => prev.map(p => p.id === payload.new.id ? payload.new : p));
        }
      ).subscribe();

    return () => {
      supabase.removeChannel(configChannel);
      supabase.removeChannel(productChannel);
    };
  }, [refreshStoreStatus]); // Quitamos config de aquí para evitar loops infinitos

  if (!isMounted) return null;

  return (
    <div className="flex flex-col h-screen bg-[#FDFBF7] font-josefin overflow-hidden relative text-[#2B4233]">
      
      {/* Botones Flotantes */}
      <FloatingActions 
        featuredCount={products.filter(p => p.is_offer || p.is_new).length}
        onOpenMarketing={() => setShowMarketingPopup(true)}
        onOpenCart={openCart} 
        cartCount={cart.reduce((acc, item) => acc + item.quantity, 0)}
        cartFlash={cartFlash}
      />

      {/* Popups y Modales */}
      <MarketingPopup 
        isOpen={showMarketingPopup} 
        onClose={() => setShowMarketingPopup(false)} 
        products={products.filter(p => p.is_offer || p.is_new)}
        onAddToCart={(p: any) => { addToCart(p); openCart(); }}
        isDisabled={isStoreClosed} 
      />

      {/* EL PASO CLAVE: Aquí enviamos el objeto 'config' (con el WhatsApp) y el estado 'isClosed' */}
      {config && (
        <CartDrawer storeStatus={{ ...config, isClosed: isStoreClosed }} />
      )}

      <ProductModal 
        isOpen={!!selectedProduct}
        product={selectedProduct}
        onClose={() => setSelectedProduct(null)}
        onAddToCart={(p: any) => { addToCart(p); openCart(); }}
        allProducts={products}
        isDisabled={isStoreClosed}
      />

      {/* HEADER DINER STYLE */}
      <header className="flex-none bg-[#5E7361] shadow-md z-20">
        <div className="max-w-[1600px] mx-auto w-full h-[20vh] md:h-[30vh] flex flex-col justify-between py-4 md:py-6">
          
          <div className="flex-1 flex flex-col justify-center text-center text-white px-4">
            <h1 className="text-2xl md:text-6xl font-diner uppercase tracking-tight leading-none">
              Tyta Patisserie
            </h1>
            <p className="text-[8px] md:text-[10px] tracking-[0.3em] md:tracking-[0.5em] uppercase mt-1 md:mt-2 opacity-80">
              by Su Fernandez
            </p>
          </div>

          {/* NAVEGACIÓN DE CATEGORÍAS (SIN DEGRADADOS LATERALES) */}
          <nav className="w-full flex items-center gap-3 overflow-x-auto no-scrollbar flex-nowrap px-6 mt-4 md:mt-8 md:flex-wrap md:justify-center md:overflow-visible md:px-0">
            {categories.map(cat => (
              <button 
                key={cat.id} 
                onClick={() => setActiveCategory(cat.name)}
                className={`flex-none px-5 py-2.5 rounded-full text-[10px] font-black uppercase transition-all shadow-sm tracking-widest
                ${activeCategory === cat.name 
                  ? 'bg-[#EDB2D1] text-[#2B4233] border border-[#EDB2D1]' 
                  : 'bg-white text-[#2B4233] border border-gray-100 active:scale-95'}`}
              >
                {cat.name}
              </button>
            ))}
          </nav>
        </div>
      </header>

      {/* ÁREA DE PRODUCTOS */}
      <main id="scroll-area" className="flex-1 overflow-y-auto bg-white p-4 md:p-10 scroll-smooth">
        <div className="max-w-[1600px] mx-auto pb-40"> 
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 2xl:grid-cols-6 gap-4 md:gap-8">
            {products
              .filter(p => activeCategory === "Todas" || p.category === activeCategory)
              .map(product => (
                <ProductCard 
                  key={product.id} 
                  product={product} 
                  onOpenDetail={() => setSelectedProduct(product)} 
                  isDisabled={isStoreClosed} 
                />
              ))
            }
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
}