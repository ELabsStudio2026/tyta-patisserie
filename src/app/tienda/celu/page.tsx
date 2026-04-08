"use client";

import { useState, useEffect, useCallback } from "react"; // Añadimos useCallback
import { supabase } from "@/lib/supabase";
import { useCart } from "@/context/CartContext";
import { getDetailedStoreStatus } from "@/lib/store-logic"; // IMPORTANTE: La lógica de cierre

import FloatingActions from "@/components/FloatingActions";
import MarketingPopup from "@/components/MarketingPopup";
import ProductModal from "@/components/ProductModal";
import CartDrawer from "@/components/CartDrawer";
import ProductCard from "@/components/ProductCard";
import Footer from "@/components/Footer";

export default function TiendaCeluPage() {
  const [isMobile, setIsMobile] = useState(false);
  const [isMounted, setIsMounted] = useState(false);
  
  // ESTADOS DE TIENDA
  const [products, setProducts] = useState<any[]>([]);
  const [categories, setCategories] = useState<any[]>([]);
  const [config, setConfig] = useState<any>(null); // Guardamos la config para el Realtime
  const [isStoreClosed, setIsStoreClosed] = useState(false); // El "candado"
  const [activeCategory, setActiveCategory] = useState("Todas");
  
  const { cart, addToCart, openCart, cartFlash } = useCart();
  const [selectedProduct, setSelectedProduct] = useState<any | null>(null);

  // Función para calcular si está abierto o cerrado
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
      // 1. Cargar datos básicos
      const { data: cats } = await supabase.from('categories').select('*').order('name');
      const { data: prods } = await supabase.from('products').select('*').eq('is_visible', true).order('name');
      const { data: conf } = await supabase.from('store_config').select('*').single();
      
      if (cats) setCategories([{ id: 'all', name: 'Todas' }, ...cats]);
      if (prods) setProducts(prods);
      
      // 2. Validar apertura inicial
      if (conf) {
        setConfig(conf);
        await refreshStoreStatus(conf);
      }
    }
    fetchData();

    // 3. ESCUCHA REALTIME (Para que si Su cierra la tienda, el celu reaccione al instante)
    const configChannel = supabase.channel('store-updates-celu')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'store_config' }, 
        async (payload: any) => {
          const newConfig = payload.new;
          setConfig(newConfig);
          await refreshStoreStatus(newConfig);
        }
      ).subscribe();

    return () => {
      window.removeEventListener("resize", checkDevice);
      supabase.removeChannel(configChannel);
    };
  }, [refreshStoreStatus]);

  if (!isMounted) return null;

  // Pantalla de bloqueo para escritorio (Tu detector)
  if (!isMobile) {
    return (
      <div className="h-screen flex flex-col items-center justify-center bg-[#FDFBF7] p-10 text-center">
        <h1 className="font-diner text-6xl text-[#2B4233] mb-4">TP</h1>
        <p className="font-josefin uppercase tracking-widest text-gray-400">Modo Escritorio Activo</p>
      </div>
    );
  }

  return (
    <div className="flex flex-col h-screen bg-[#FDFBF7] text-[#2B4233] font-josefin overflow-hidden relative">
      
      {/* Pasamos isDisabled a los modales */}
      <ProductModal 
        isOpen={!!selectedProduct} 
        product={selectedProduct} 
        onClose={() => setSelectedProduct(null)} 
        onAddToCart={(p: any) => { addToCart(p); openCart(); }} 
        allProducts={products}
        isDisabled={isStoreClosed} 
      />

      {config && <CartDrawer storeStatus={{ ...config, isClosed: isStoreClosed }} />}

      {/* HEADER CELULAR: 25% de la pantalla - SIN EL PUNTO DE ESTADO */}
<header className="flex-none h-[25vh] bg-[#5E7361] flex flex-col justify-between p-4 shadow-md z-20">
  <div className="flex-1 flex flex-col justify-center text-center">
    <h1 className="text-3xl font-diner uppercase text-white leading-none">
      Tyta Patisserie
    </h1>
    <p className="text-[10px] tracking-[0.4em] text-white/70 uppercase mt-1">
      by Su Fernandez
    </p>
    {/* El div del semáforo fue eliminado de aquí */}
  </div>

  {/* NAVEGACIÓN MOBILE: Se mantiene igual porque dijiste que se veía perfecto */}
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

      <main className="flex-1 overflow-y-auto bg-white px-4 py-6">
        <div className="grid grid-cols-2 gap-4 pb-32">
          {products
            .filter(p => activeCategory === "Todas" || p.category === activeCategory)
            .map((product) => (
              <ProductCard 
                key={product.id} 
                product={product} 
                onOpenDetail={() => setSelectedProduct(product)}
                isDisabled={isStoreClosed} // BLOQUEO DE PRODUCTO
              />
            ))
          }
        </div>
      </main>

      <Footer />
    </div>
  );
}