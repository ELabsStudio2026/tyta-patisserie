"use client";

import { useState, useEffect } from "react";
import { supabase } from "@/lib/supabase";
import { useRouter } from "next/navigation";

export default function TiendaPage() {
  const router = useRouter();
  const [products, setProducts] = useState<any[]>([]);
  const [categories, setCategories] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [isLeaving, setIsLeaving] = useState(false);
  const [activeCategory, setActiveCategory] = useState("Todas");
  const [showTopButton, setShowTopButton] = useState(false);
  const [selectedProduct, setSelectedProduct] = useState<any | null>(null);

  // ESTADOS DEL CARRITO Y SEGURIDAD
  const [cart, setCart] = useState<any[]>([]);
  const [isCartOpen, setIsCartOpen] = useState(false);
  const [cartFlash, setCartFlash] = useState(false);
  const [step, setStep] = useState<'cart' | 'confirm' | 'data'>('cart');
  const [userData, setUserData] = useState({ nombre: "", telefono: "", entrega: "Retiro", honey: "" });

  // CARGA INICIAL
  useEffect(() => {
    async function fetchData() {
      setLoading(true);
      const { data: cats } = await supabase.from('categories').select('*').order('name');
      const { data: prods } = await supabase.from('products').select('*').eq('is_visible', true).order('name');
      if (cats) setCategories([{ id: 'all', name: 'Todas' }, ...cats]);
      if (prods) setProducts(prods);
      const savedCart = localStorage.getItem("tyta-cart");
      if (savedCart) setCart(JSON.parse(savedCart));
      setLoading(false);
    }
    fetchData();
  }, []);

  useEffect(() => {
    localStorage.setItem("tyta-cart", JSON.stringify(cart));
  }, [cart]);

  // FUNCIONES DE CARRITO
  const addToCart = (product: any, e?: React.MouseEvent) => {
    if (e) e.stopPropagation(); 
    if (Number(product.stock) <= 0) return;
    setCart(prev => {
      const existing = prev.find(item => item.id === product.id);
      if (existing) return prev.map(item => item.id === product.id ? { ...item, quantity: item.quantity + 1 } : item);
      return [...prev, { ...product, quantity: 1 }];
    });
    setCartFlash(true);
    setTimeout(() => setCartFlash(false), 600);
  };

  const cartTotal = cart.reduce((acc, item) => acc + (item.price * item.quantity), 0);

  // --- FUNCIÓN DE ENVÍO REFORZADA (ANTI-BLOQUEO WHATSAPP) ---
  const handleFinalSubmit = async () => {
    if (userData.honey) return; 
    
    const orderRef = Math.random().toString(36).substring(2, 7).toUpperCase();
    const totalStr = (cartTotal / 100).toLocaleString('es-AR', { 
      style: 'currency', currency: 'ARS', minimumFractionDigits: 0 
    });

    try {
      // 1. REGISTRO EN SUPABASE
      const { error } = await supabase.from('orders').insert([{
        id: orderRef,
        customer_name: userData.nombre,
        customer_phone: userData.telefono,
        items: cart, 
        total: cartTotal,
        delivery_type: userData.entrega,
        status: 'pendiente'
      }]);

      if (error) throw error;

      // 2. CONFIGURACIÓN DE WHATSAPP (IMPORTANTE: Solo números)
      // Reemplaza por el número real: "5491166XXXXXX"
      const whatsappNumber = "54911XXXXXXXX"; 
      
      const detail = cart.map(item => `- ${item.name} (x${item.quantity})`).join('\n');
      
      const message = `¡Hola Tyta! Soy ${userData.nombre}.\n` +
                      `Ref Pedido: ${orderRef}\n\n` +
                      `${detail}\n\n` +
                      `Total: ${totalStr}\n` +
                      `Modo: ${userData.entrega}\n` +
                      `¿Me confirman para coordinar?`;

      // 3. GENERACIÓN DE URL LIMPIA
      const whatsappUrl = `https://api.whatsapp.com/send?phone=${whatsappNumber}&text=${encodeURIComponent(message)}`;
      
      // 4. EJECUCIÓN (Usamos location.href para evitar bloqueos de popup en Desktop)
      window.location.href = whatsappUrl;
      
      // 5. RESET POST-ENVÍO
      setIsCartOpen(false);
      setStep('cart');
      setCart([]); 
      localStorage.removeItem("tyta-cart");

    } catch (err) {
      console.error("Error:", err);
      alert("Hubo un error al procesar el pedido. Por favor, reintentá.");
    }
  };

  // UI HELPERS
  useEffect(() => {
    const scrollContainer = document.getElementById("main-content");
    const handleScroll = () => {
      if (scrollContainer) setShowTopButton(scrollContainer.scrollTop > 300);
    };
    scrollContainer?.addEventListener("scroll", handleScroll);
    return () => scrollContainer?.removeEventListener("scroll", handleScroll);
  }, [loading]);

  const normalizeText = (text: string) => text.toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "").trim();
  const filteredProducts = activeCategory === "Todas" ? products : products.filter(p => normalizeText(p.category || "") === normalizeText(activeCategory));

  if (loading || isLeaving) return (
    <div className="h-screen flex flex-col items-center justify-center bg-[#FDFBF7]">
      <h2 className="text-5xl font-diner text-[#2B4233] animate-pulse uppercase">{isLeaving ? "¡Volvé pronto!" : "Tyta Patisserie"}</h2>
    </div>
  );

  return (
    <div className="flex flex-col h-screen bg-[#FDFBF7] text-[#2B4233] font-josefin overflow-hidden relative">
      
      {/* BOTÓN HOME */}
      <div className="fixed top-8 left-6 md:left-10 z-[70] flex items-center group">
        <button onClick={() => {if(window.confirm("¿Volver al inicio?")) {setIsLeaving(true); setTimeout(()=>router.push("/"), 1200);}}} className="w-12 h-12 bg-white text-[#2B4233] rounded-full shadow-lg flex items-center justify-center hover:scale-110 transition-all border border-[#EDB2D1]/20">
          <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" /></svg>
        </button>
        <span className="ml-4 bg-[#EDB2D1] text-[#2B4233] text-[8px] font-black uppercase px-4 py-2 rounded-full opacity-0 group-hover:opacity-100 transition-all shadow-md">Inicio</span>
      </div>

      <header className="flex-none h-[30vh] flex flex-col justify-center bg-[#FDFBF7] border-b border-[#EDB2D1]/20 px-4 z-20 text-center">
        <h1 className="text-4xl md:text-5xl lg:text-7xl font-diner uppercase leading-none cursor-default hover:scale-105 transition-transform duration-500">Tyta Patisserie</h1>
        <p className="text-[7px] md:text-[8px] font-black uppercase tracking-[0.4em] opacity-40 mb-4 mt-2">Pastelería de Autor & Momentos Dulces</p>
        <nav className="max-w-[1200px] mx-auto w-full flex flex-wrap justify-center items-center gap-1.5 md:gap-2">
          {categories.map((cat) => (
            <button key={cat.id} onClick={() => setActiveCategory(cat.name)} className={`px-3 py-1 md:px-4 md:py-1.5 rounded-full text-[7px] md:text-[8px] font-black uppercase tracking-widest transition-all border ${activeCategory === cat.name ? 'bg-[#2B4233] text-white border-[#2B4233]' : 'bg-white text-[#2B4233]/40 border-[#EDB2D1]/10'}`}>{cat.name}</button>
          ))}
        </nav>
      </header>

      <main id="main-content" className="flex-1 overflow-y-auto custom-scrollbar bg-white/40 px-4 py-8 relative scroll-smooth">
        <div className="max-w-[1400px] mx-auto pb-40">
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-x-4 gap-y-10">
            {filteredProducts.map((product) => (
              <div key={product.id} onClick={() => setSelectedProduct(product)} className="group flex flex-col items-center cursor-pointer relative">
                <div className="relative aspect-square w-full rounded-[1.5rem] md:rounded-[2.5rem] overflow-hidden bg-white border border-[#EDB2D1]/10 shadow-sm transition-all duration-500 group-hover:shadow-xl">
                  <img src={product.image_url || '/images/placeholder.jpg'} alt={product.name} className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110" />
                  {Number(product.stock) > 0 && (
                    <div onClick={(e) => addToCart(product, e)} className="absolute bottom-0 right-0 z-30 flex items-end group/buy">
                      <span className="bg-[#EDB2D1] text-[#2B4233] text-[7px] font-black uppercase px-3 py-2 opacity-0 group-hover/buy:opacity-100 transition-all rounded-tl-xl translate-x-2 group-hover/buy:translate-x-0 shadow-sm">Comprar</span>
                      <div className="bg-[#2B4233] text-white p-3 rounded-tl-2xl shadow-lg transition-transform group-hover/buy:bg-[#EDB2D1] group-hover/buy:text-[#2B4233] flex items-center justify-center">
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z" /></svg>
                      </div>
                    </div>
                  )}
                </div>
                <div className="mt-3 text-center">
                  <span className="text-[6px] md:text-[7px] font-black uppercase text-[#EDB2D1]">{product.category}</span>
                  <h3 className="text-xs md:text-sm font-bold h-8 flex items-center justify-center line-clamp-2">{product.name}</h3>
                  <p className="text-[10px] md:text-xs font-black italic font-mono text-[#2B4233]/70 mt-1">${(product.price / 100).toLocaleString('es-AR')}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </main>

      {/* --- BOTONES DE INTERACCIÓN BOUTIQUE NIVELADOS --- */}
      <div className="fixed bottom-[8vh] left-6 md:left-10 z-[60] flex items-center group">
        <button onClick={() => {setIsCartOpen(true); setStep('cart');}} className={`w-14 h-14 md:w-16 md:h-16 rounded-full shadow-2xl flex items-center justify-center transition-all ${cartFlash ? 'bg-[#EDB2D1] scale-125' : 'bg-[#2B4233] hover:scale-110'}`}>
          <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 md:h-8 md:w-8 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z" /></svg>
          {cart.length > 0 && <span className="absolute -top-1 -right-1 bg-[#EDB2D1] text-[#2B4233] text-[10px] font-black w-6 h-6 rounded-full flex items-center justify-center border-2 border-[#FDFBF7] shadow-sm">{cart.reduce((a,b)=>a+b.quantity,0)}</span>}
        </button>
        <span className="ml-4 bg-[#EDB2D1] text-[#2B4233] text-[8px] font-black uppercase px-4 py-2 rounded-full opacity-0 group-hover:opacity-100 transition-all shadow-md pointer-events-none whitespace-nowrap">Ver mi pedido</span>
      </div>

      <div className="fixed bottom-[8vh] right-6 md:right-10 z-[60] flex flex-col gap-3 items-end">
        <div className="flex items-center flex-row-reverse group">
          <a href="https://api.whatsapp.com/send?phone=54911XXXXXXXX" target="_blank" className="w-14 h-14 md:w-16 md:h-16 bg-[#25D366] rounded-full shadow-2xl flex items-center justify-center hover:scale-110 transition-all">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8 text-white" fill="currentColor" viewBox="0 0 24 24"><path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L0 24l6.335-1.662c1.72.94 3.659 1.437 5.63 1.438h.008c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413Z"/></svg>
          </a>
          <span className="mr-4 bg-[#EDB2D1] text-[#2B4233] text-[8px] font-black uppercase px-4 py-2 rounded-full opacity-0 group-hover:opacity-100 transition-all shadow-md pointer-events-none whitespace-nowrap">Consultas</span>
        </div>
        <button onClick={() => document.getElementById("main-content")?.scrollTo({top:0, behavior:"smooth"})} className={`w-14 h-14 md:w-16 md:h-16 bg-[#EDB2D1] text-white rounded-full shadow-2xl flex items-center justify-center transition-all ${showTopButton ? 'opacity-100 scale-100' : 'opacity-0 scale-50 pointer-events-none'}`}><svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 md:h-8 md:w-8" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 15l7-7 7 7" /></svg></button>
      </div>

      {/* CARRITO Y FLUJO DE DATOS */}
      {isCartOpen && (
        <div className="fixed inset-0 z-[150] flex justify-end">
          <div className="absolute inset-0 bg-[#2B4233]/40 backdrop-blur-sm" onClick={() => setIsCartOpen(false)} />
          <div className="relative w-full max-w-md bg-[#FDFBF7] shadow-2xl flex flex-col h-full border-l-[12px] border-[#EDB2D1]">
            <div className="p-8 border-b border-[#EDB2D1]/10 flex justify-between items-center">
              <h2 className="text-5xl font-diner uppercase text-[#2B4233]">
                {step === 'cart' ? 'Tu Pedido' : step === 'confirm' ? 'Confirmar' : 'Tus Datos'}
              </h2>
              <button onClick={() => setIsCartOpen(false)} className="text-2xl text-[#EDB2D1]">✕</button>
            </div>
            
            <div className="flex-1 overflow-y-auto p-8 custom-scrollbar">
              {step === 'cart' && (
                <div className="space-y-6">
                  {cart.length === 0 ? <p className="opacity-30 uppercase font-black text-center py-20 tracking-widest">Nada por aquí aún</p> : 
                    cart.map(item => (
                      <div key={item.id} className="flex gap-4 items-center bg-white p-4 rounded-[2rem] shadow-sm border border-[#EDB2D1]/5">
                        <img src={item.image_url} className="w-16 h-16 rounded-2xl object-cover" />
                        <div className="flex-1">
                          <h4 className="font-bold text-sm text-[#2B4233]">{item.name}</h4>
                          <div className="flex items-center gap-3 mt-2">
                            <button onClick={() => setCart(prev => prev.map(p => p.id === item.id ? {...p, quantity: Math.max(1, p.quantity - 1)} : p))} className="w-6 h-6 rounded-full border border-[#EDB2D1] text-[#EDB2D1] flex items-center justify-center font-bold">-</button>
                            <span className="text-xs font-black">{item.quantity}</span>
                            <button onClick={() => setCart(prev => prev.map(p => p.id === item.id ? {...p, quantity: p.quantity + 1} : p))} className="w-6 h-6 rounded-full border border-[#EDB2D1] text-[#EDB2D1] flex items-center justify-center font-bold">+</button>
                          </div>
                        </div>
                        <button onClick={() => setCart(prev => prev.filter(p => p.id !== item.id))} className="text-red-300 hover:text-red-500 transition-colors">✕</button>
                      </div>
                    ))
                  }
                </div>
              )}

              {step === 'confirm' && (
                <div className="text-center py-10">
                  <p className="text-xl mb-8 opacity-60 italic">¿Deseas procesar este pedido? Susana coordinará contigo los detalles.</p>
                  <div className="flex flex-col gap-4">
                    <button onClick={() => setStep('data')} className="w-full py-5 bg-[#2B4233] text-[#EDB2D1] rounded-full font-black uppercase text-[11px] tracking-[0.3em]">Confirmar</button>
                    <button onClick={() => setStep('cart')} className="opacity-40 uppercase font-black text-[10px] tracking-widest">Volver</button>
                  </div>
                </div>
              )}

              {step === 'data' && (
                <div className="space-y-6">
                  <input type="text" placeholder="Nombre completo" className="w-full bg-white p-4 rounded-3xl border border-[#EDB2D1]/20 outline-none" value={userData.nombre} onChange={e => setUserData({...userData, nombre: e.target.value})} />
                  <input type="tel" placeholder="Tu WhatsApp" className="w-full bg-white p-4 rounded-3xl border border-[#EDB2D1]/20 outline-none" value={userData.telefono} onChange={e => setUserData({...userData, telefono: e.target.value})} />
                  <select className="w-full bg-white p-4 rounded-3xl border border-[#EDB2D1]/20" value={userData.entrega} onChange={e => setUserData({...userData, entrega: e.target.value})}>
                    <option value="Retiro">Retiro en local</option>
                    <option value="Envio">Envío a domicilio</option>
                  </select>
                  <input type="text" className="hidden" value={userData.honey} onChange={e => setUserData({...userData, honey: e.target.value})} />
                  <button onClick={handleFinalSubmit} disabled={!userData.nombre || !userData.telefono} className="w-full py-5 bg-[#2B4233] text-[#EDB2D1] rounded-full font-black uppercase text-[11px] tracking-[0.3em] disabled:opacity-30">Finalizar pedido</button>
                </div>
              )}
            </div>

            {step === 'cart' && cart.length > 0 && (
              <div className="p-8 bg-white border-t border-[#EDB2D1]/10">
                <div className="flex justify-between items-end mb-6">
                  <span className="text-3xl font-black font-mono text-[#2B4233]">${(cartTotal/100).toLocaleString('es-AR')}</span>
                </div>
                <button onClick={() => setStep('confirm')} className="w-full py-5 bg-[#2B4233] text-[#EDB2D1] rounded-full font-black uppercase text-[11px] tracking-[0.3em]">Hacer Pedido</button>
              </div>
            )}
          </div>
        </div>
      )}

      {/* MODAL DETALLE */}
      {selectedProduct && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-[#2B4233]/60 backdrop-blur-md" onClick={() => setSelectedProduct(null)} />
          <div className="relative bg-[#FDFBF7] w-full max-w-2xl rounded-[3rem] overflow-hidden shadow-2xl flex flex-col md:flex-row">
            <button onClick={() => setSelectedProduct(null)} className="absolute top-6 right-6 z-10 bg-white/80 text-[#2B4233] w-10 h-10 rounded-full flex items-center justify-center font-bold">✕</button>
            <div className="w-full md:w-1/2 aspect-square"><img src={selectedProduct.image_url} className="w-full h-full object-cover" /></div>
            <div className="w-full md:w-1/2 p-8 md:p-12 flex flex-col">
              <span className="text-[9px] font-black uppercase text-[#EDB2D1] mb-2">{selectedProduct.category}</span>
              <h2 className="text-4xl font-diner uppercase text-[#2B4233] mb-4 tracking-tighter leading-none">{selectedProduct.name}</h2>
              <div className="mt-auto flex flex-col gap-4">
                <span className="text-3xl font-black font-mono text-[#2B4233]">${(selectedProduct.price / 100).toLocaleString('es-AR')}</span>
                <button onClick={() => { addToCart(selectedProduct); setSelectedProduct(null); }} className="w-full py-4 bg-[#2B4233] text-white rounded-full font-black uppercase text-[11px] tracking-widest hover:bg-[#EDB2D1] hover:text-[#2B4233] transition-all">Añadir al pedido</button>
              </div>
            </div>
          </div>
        </div>
      )}

      <footer className="flex-none py-4 bg-white border-t border-[#EDB2D1]/10 text-center z-20">
        <p className="text-[7px] font-black uppercase tracking-[0.4em] opacity-30">TYTA PATISSERIE © 2026 • ELABS STUDIO BOUTIQUE</p>
      </footer>

      <style jsx global>{`
        .custom-scrollbar::-webkit-scrollbar { width: 3px; }
        .custom-scrollbar::-webkit-scrollbar-thumb { background: #EDB2D1; border-radius: 10px; }
      `}</style>
    </div>
  );
}