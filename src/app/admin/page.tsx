"use client";

import { useState, useEffect } from "react";
import { supabase } from "@/lib/supabase";
import { useTytaAlert } from "@/lib/useTytaAlert"; // Importamos la librería
import TytaAlert from "@/components/ui/TytaAlert";   // Importamos el cartel

import ProductAdminModal from "@/components/admin/ProductAdminModal";
import AdminConfig from "@/components/admin/AdminConfig"; 
import AdminProfile from "@/components/admin/AdminProfile";
import AdminInventory from "@/components/admin/AdminInventory";
import AdminHeader from "@/components/admin/AdminHeader";
import AdminStoreSettings from "@/components/admin/AdminStoreSettings";

export default function AdminPage() {
  const [products, setProducts] = useState<any[]>([]);
  const [categories, setCategories] = useState<any[]>([]);
  const [mounted, setMounted] = useState(false); 
  const [activeTab, setActiveTab] = useState<'productos' | 'master' | 'config' | 'horarios'>('productos');
  const [isAdding, setIsAdding] = useState(false);
  const [editingProduct, setEditingProduct] = useState<any | null>(null);
  
  // ACTIVAMOS LA LIBRERÍA TYTA ALERT
  const { alert, showAlert, closeAlert } = useTytaAlert();

  const [storeConfig, setStoreConfig] = useState({
    isClosedManual: false,
    isAlwaysOpen: false
  });

  async function fetchInitialData() {
    const { data: catData } = await supabase.from('categories').select('*').order('name');
    const { data: prodData } = await supabase.from('products').select('*').order('name');
    if (catData) setCategories(catData);
    if (prodData) setProducts(prodData);
  }

  useEffect(() => { 
    setMounted(true); 
    fetchInitialData();
    
    const getInitialStatus = async () => {
      const { data } = await supabase.from('store_config').select('is_closed_manual, is_always_open').single();
      if (data) {
        setStoreConfig({
          isClosedManual: data.is_closed_manual,
          isAlwaysOpen: data.is_always_open
        });
      }
    };
    getInitialStatus();

    const channel = supabase.channel('schema-db-changes')
      .on('postgres_changes', { event: 'UPDATE', schema: 'public', table: 'store_config' }, 
        (payload) => {
          setStoreConfig({
            isClosedManual: payload.new.is_closed_manual,
            isAlwaysOpen: payload.new.is_always_open
          });
        }
      ).subscribe();

    return () => { supabase.removeChannel(channel); };
  }, []);

  const [productForm, setProductForm] = useState<any>({ 
    name: "", price: 0, category: "", image_url: "", description: "", 
    stock: 0, critical_stock: 3, is_visible: true, is_new: false, is_offer: false 
  });

  useEffect(() => {
    if (editingProduct) setProductForm(editingProduct);
    else setProductForm({ name: "", price: 0, category: categories[0]?.name || "", image_url: "", description: "", stock: 0, critical_stock: 3, is_visible: true, is_new: false, is_offer: false });
  }, [editingProduct, isAdding, categories]);

  async function handleSaveProduct(e: any) {
    e.preventDefault();
    const { id, created_at, ...payload } = productForm;
    if (editingProduct) await supabase.from('products').update(payload).eq('id', id);
    else await supabase.from('products').insert([payload]);
    setIsAdding(false); setEditingProduct(null); fetchInitialData();
  }

  if (!mounted) return null;

  return (
    <div className="min-h-screen bg-[#FDFBF7] p-4 sm:p-6 font-josefin text-[#2B4233]">
      
      <AdminHeader 
        activeTab={activeTab} 
        setActiveTab={setActiveTab} 
        onNewProduct={() => setIsAdding(true)}
        categories={categories || []}
        onRefreshCategories={fetchInitialData}
      />

      <main className="max-w-[1400px] mx-auto">
        {activeTab === 'productos' && (
          <AdminInventory 
            products={products} 
            categories={categories} 
            onEdit={setEditingProduct} 
            onRefresh={fetchInitialData} // <--- ESTA LÍNEA ARREGLA EL ERROR DE VERCEL
            onDelete={(id) => { 
              // REEMPLAZO DEL CONFIRM NATIVO POR TYTA ALERT (Binario)
              showAlert(
                "danger", 
                "¿ELIMINAR PRODUCTO?", 
                "Esta delicia desaparecerá de la vitrina digital permanentemente.",
                async () => {
                  await supabase.from('products').delete().eq('id', id); 
                  fetchInitialData();
                }
              );
            }}
          />
        )}

        {activeTab === 'master' && (
          <div className="flex flex-col items-center gap-6 py-10">
            <AdminConfig />
            <div className="w-full max-w-md bg-white p-8 rounded-[2.5rem] shadow-sm border border-gray-100 flex flex-col items-center gap-6 animate-in fade-in duration-500">
              <h4 className="text-[10px] font-black uppercase tracking-[0.2em] text-[#2B4233]/40 text-center">Estado del Servidor</h4>
              <div className="flex gap-6 bg-[#FDFBF7] p-6 rounded-full border border-gray-100 shadow-inner">
                <div className={`w-8 h-8 rounded-full transition-all duration-500 ${storeConfig.isClosedManual ? 'bg-red-500 shadow-[0_0_20px_rgba(239,68,68,0.8)]' : 'bg-red-900/10'}`} />
                <div className={`w-8 h-8 rounded-full transition-all duration-500 ${storeConfig.isAlwaysOpen ? 'bg-yellow-400 shadow-[0_0_20px_rgba(250,204,21,0.8)]' : 'bg-yellow-900/10'}`} />
                <div className={`w-8 h-8 rounded-full transition-all duration-500 ${(!storeConfig.isClosedManual && !storeConfig.isAlwaysOpen) ? 'bg-green-500 shadow-[0_0_20px_rgba(34,197,94,0.8)]' : 'bg-green-900/10'}`} />
              </div>
              <div className="text-center space-y-2">
                <p className="text-[12px] font-black uppercase tracking-widest text-[#2B4233]">
                  {storeConfig.isAlwaysOpen ? "Modo: Siempre Abierto ✨" : storeConfig.isClosedManual ? "Modo: Boutique Cerrada (SOS) 🛑" : "Modo: Automático (Reloj) ⏰"}
                </p>
              </div>
            </div>
          </div>
        )}

        {activeTab === 'config' && <AdminStoreSettings />}
        {activeTab === 'horarios' && <AdminProfile />}
      </main>

      <ProductAdminModal 
        productForm={productForm} setProductForm={setProductForm}
        editingProduct={editingProduct} isAdding={isAdding}
        onClose={() => { setIsAdding(false); setEditingProduct(null); }}
        onSave={handleSaveProduct}
        categories={categories}
      />

      {/* RENDERIZADO DEL CARTEL UNIFICADO */}
      <TytaAlert alert={alert} onCancel={closeAlert} />
    </div>
  );
}