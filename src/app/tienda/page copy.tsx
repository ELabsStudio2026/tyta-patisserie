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
      const { data: cats } = await supabase.from('categories').select('*').order('name');
      const { data: prods } = await supabase.from('products').select('*').eq('is_visible', true).order('name');
      const { data: conf } = await supabase.from('store_config').select('*').single();
      
      if (cats) setCategories([{ id: 'all', name: 'Todas' }, ...cats]);
      if (prods) setProducts(prods);
      if (conf) {
        setConfig(conf);
        await refreshStoreStatus(conf);
        
        // Popup solo si la tienda está abierta
        const status = await getDetailedStoreStatus(conf);
        if (status.isOpen) {
          setTimeout(() => setShowMarketingPopup(true), 1500);
        }
      }
    }
    fetchData();

    // ESCUCHA REALTIME: Detecta cambios en SOS o en la tabla de Horarios
    const configChannel = supabase.channel('store-updates')
      .on('postgres_changes', { event: 'UPDATE', schema: 'public', table: 'store_config' }, 
        async (payload) => {
          setConfig(payload.new);
          await refreshStoreStatus(payload.new);
        }
      )
      .on('postgres_changes', { event: 'UPDATE', schema: 'public', table: 'horarios_tienda_online' }, 
        async () => {
          // Si cambian los horarios, refrescamos con el config actual
          if (config) await refreshStoreStatus(config);
        }
      )
      .subscribe();

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
  }, [config, refreshStoreStatus]);

  if (!isMounted) return null;

  return (
    <div className="flex flex-col h-screen bg-[#FDFBF7] font-josefin overflow-hidden relative text-[#2B4233]">
      
      <FloatingActions 
        featuredCount={products.filter(p => p.is_offer || p.is_new).length}
        onOpenMarketing={() => setShowMarketingPopup(true)}
        onOpenCart={openCart} 
        cartCount={cart.reduce((acc, item) => acc + item.quantity, 0)}
        cartFlash={cartFlash}
      />

      <MarketingPopup 
        isOpen={showMarketingPopup} 
        onClose={() => setShowMarketingPopup(false)} 
        products={products.filter(p => p.is_offer || p.is_new)}
        onAddToCart={(p: any) => { addToCart(p); openCart(); }}
        isDisabled={isStoreClosed} 
      />

      <CartDrawer isStoreClosed={isStoreClosed} />

      <ProductModal 
        isOpen={!!selectedProduct}
        product={selectedProduct}
        onClose={() => setSelectedProduct(null)}
        onAddToCart={(p: any) => { addToCart(p); openCart(); }}
        allProducts={products}
        isDisabled={isStoreClosed}
      />

      <header className="flex-none h-[30vh] bg-[#5E7361] flex flex-col justify-between py-6 shadow-md z-20">
        <div className="flex-1 flex flex-col justify-center text-center text-white">
          <h1 className="text-3xl md:text-6xl font-diner uppercase tracking-tight">Tyta Patisserie</h1>
          <p className="text-[10px] tracking-[0.5em] uppercase mt-2 opacity-80">by Su Fernandez</p>
        </div>
        <nav className="w-full flex flex-wrap justify-center gap-1.5 pb-2 px-4 no-scrollbar overflow-x-auto">
          {categories.map(cat => (
            <button key={cat.id} onClick={() => setActiveCategory(cat.name)}
              className={`px-3 py-1.5 rounded-full text-[8px] font-black uppercase transition-all shadow-sm whitespace-nowrap ${activeCategory === cat.name ? 'bg-[#EDB2D1] text-[#2B4233]' : 'bg-white text-[#2B4233]'}`}>
              {cat.name}
            </button>
          ))}
        </nav>
      </header>

      <main id="scroll-area" className="flex-1 overflow-y-auto bg-white p-6 scroll-smooth">
        <div className="max-w-7xl mx-auto pb-40">
          
          {/* Mensaje de Estado (Dinamico) */}
          {isStoreClosed && (
            <div className="mb-10 bg-[#FDFBF7] border-2 border-dashed border-[#EDB2D1] rounded-[3rem] p-10 text-center animate-in fade-in duration-700">
              <h2 className="font-diner text-4xl text-[#2B4233] uppercase leading-none mb-3">Boutique en Pausa</h2>
              <p className="text-sm italic text-[#2B4233]/60 max-w-md mx-auto leading-relaxed">
                {storeMessage}
              </p>
            </div>
          )}

          <div className="grid grid-cols-2 md:grid-cols-5 gap-x-4 gap-y-10">
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