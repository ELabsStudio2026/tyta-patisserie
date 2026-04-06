"use client";

import { useState, useEffect } from "react";
import { supabase } from "@/lib/supabase";
import ProductAdminModal from "@/components/admin/ProductAdminModal";
import AdminConfig from "@/components/admin/AdminConfig"; 
import AdminProfile from "@/components/admin/AdminProfile";
import AdminInventory from "@/components/admin/AdminInventory";
import AdminHeader from "@/components/admin/AdminHeader";

export default function AdminPage() {
  const [products, setProducts] = useState<any[]>([]);
  const [categories, setCategories] = useState<any[]>([]);
  const [mounted, setMounted] = useState(false); 
  const [activeTab, setActiveTab] = useState<'productos' | 'config' | 'perfil'>('productos');
  const [isAdding, setIsAdding] = useState(false);
  const [editingProduct, setEditingProduct] = useState<any | null>(null);
  
  // --- ÚNICA FUENTE DE VERDAD PARA EL SEMÁFORO ---
  const [isClosedManual, setIsClosedManual] = useState<boolean>(false);

  useEffect(() => { 
    setMounted(true); 
    fetchInitialData();
    
    // 1. Carga inicial del estado real
    const getInitialStatus = async () => {
      const { data } = await supabase.from('store_config').select('is_closed_manual').single();
      if (data) setIsClosedManual(data.is_closed_manual);
    };
    getInitialStatus();

    // 2. SUSCRIPCIÓN REALTIME (EL "CABLE" DIRECTO)
    // Esto hace que el semáforo cambie APENAS detecta un cambio en la tabla, no importa quién lo haga.
    const channel = supabase
      .channel('schema-db-changes')
      .on('postgres_changes', 
        { event: 'UPDATE', schema: 'public', table: 'store_config' }, 
        (payload) => {
          console.log("Cambio detectado en DB:", payload.new.is_closed_manual);
          setIsClosedManual(payload.new.is_closed_manual);
        }
      ).subscribe();

    return () => { supabase.removeChannel(channel); };
  }, []);

  // --- FIN LÓGICA SEMÁFORO ---

  const [productForm, setProductForm] = useState<any>({ 
    name: "", price: 0, category: "", image_url: "", description: "", 
    stock: 0, critical_stock: 3, is_visible: true, is_new: false, is_offer: false 
  });

  useEffect(() => {
    if (editingProduct) setProductForm(editingProduct);
    else setProductForm({ name: "", price: 0, category: categories[0]?.name || "", image_url: "", description: "", stock: 0, critical_stock: 3, is_visible: true, is_new: false, is_offer: false });
  }, [editingProduct, isAdding, categories]);

  async function fetchInitialData() {
    const { data: catData } = await supabase.from('categories').select('*').order('name');
    const { data: prodData } = await supabase.from('products').select('*');
    if (catData) setCategories(catData);
    if (prodData) setProducts(prodData);
  }

  async function handleSaveProduct(e: any) {
    e.preventDefault();
    const { id, created_at, ...payload } = productForm;
    if (editingProduct) await supabase.from('products').update(payload).eq('id', id);
    else await supabase.from('products').insert([payload]);
    setIsAdding(false); setEditingProduct(null); fetchInitialData();
  }

  if (!mounted) return null;

  return (
    <div className="min-h-screen bg-[#FDFBF7] p-4 sm:p-6 font-josefin">
      
      <AdminHeader 
        activeTab={activeTab} 
        setActiveTab={setActiveTab} 
        onNewProduct={() => setIsAdding(true)} 
      />

      <main className="max-w-[1400px] mx-auto">
        {activeTab === 'productos' && (
          <AdminInventory products={products} categories={categories} onEdit={setEditingProduct} 
            onDelete={async (id) => { if (confirm("¿Eliminar?")) { await supabase.from('products').delete().eq('id', id); fetchInitialData(); } }}
          />
        )}

        {activeTab === 'config' && (
          <div className="flex flex-col items-center gap-6 py-10">
            {/* EL COMPONENTE DE LOS BOTONES */}
            <AdminConfig />

            {/* SEMÁFORO (DISEÑO BLINDADO) */}
            <div className="w-full max-w-md bg-white p-8 rounded-[2.5rem] shadow-sm border border-gray-100 flex flex-col items-center gap-4 animate-in fade-in">
              <h4 className="text-[10px] font-black uppercase tracking-[0.2em] text-[#2B4233]/40">
                Estado Real de Conexión
              </h4>
              
              <div className="flex gap-4 bg-[#FDFBF7] p-4 rounded-full border border-gray-100 shadow-inner">
                {/* LUZ ROJA: Se enciende si is_closed_manual es TRUE */}
                <div className={`w-6 h-6 rounded-full transition-all duration-300 ${isClosedManual ? 'bg-red-500 shadow-[0_0_15px_rgba(239,68,68,0.8)]' : 'bg-red-900/10'}`} />
                {/* LUZ VERDE: Se enciende si is_closed_manual es FALSE */}
                <div className={`w-6 h-6 rounded-full transition-all duration-300 ${!isClosedManual ? 'bg-green-500 shadow-[0_0_15px_rgba(34,197,94,0.8)]' : 'bg-green-900/10'}`} />
              </div>

              <div className="text-center">
                <p className="text-[11px] font-black uppercase tracking-widest text-[#2B4233]">
                  {isClosedManual ? "Boutique Cerrada (SOS)" : "Tienda en Línea"}
                </p>
                <p className="text-[8px] italic text-gray-400 mt-1">Sincronizado vía Realtime con Supabase</p>
              </div>
            </div>
          </div>
        )}

        {activeTab === 'perfil' && <AdminProfile />}
      </main>

      <ProductAdminModal 
        productForm={productForm} setProductForm={setProductForm}
        editingProduct={editingProduct} isAdding={isAdding}
        onClose={() => { setIsAdding(false); setEditingProduct(null); }}
        onSave={handleSaveProduct}
        categories={categories}
      />
    </div>
  );
}