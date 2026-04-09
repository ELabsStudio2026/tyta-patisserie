"use client";
import { useState, useEffect } from "react";
import AdminHeader from "@/components/admin/AdminHeader";
import AdminInventory from "@/components/admin/AdminInventory";
import ProductAdminModal from "@/components/admin/ProductAdminModal";
import { supabase } from "@/lib/supabase";

export default function AdminPage() {
  const [activeTab, setActiveTab] = useState<'productos' | 'master' | 'config' | 'horarios'>('productos');
  const [products, setProducts] = useState<any[]>([]);
  const [categories, setCategories] = useState<any[]>([]);
  const [editingProduct, setEditingProduct] = useState<any>(null);
  const [isNewProductModalOpen, setIsNewProductModalOpen] = useState(false);
  const [loading, setLoading] = useState(true);

  // FUNCIÓN CRÍTICA: Carga y refresca los datos
  const fetchInitialData = async () => {
    setLoading(true);
    try {
      const { data: productsData } = await supabase
        .from('products')
        .select('*')
        .order('name', { ascending: true });
      
      const { data: categoriesData } = await supabase
        .from('categories')
        .select('*')
        .order('name', { ascending: true });

      if (productsData) setProducts(productsData);
      if (categoriesData) setCategories(categoriesData);
    } catch (error) {
      console.error("Error cargando datos:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchInitialData();
  }, []);

  const handleDeleteProduct = async (id: string) => {
    const { error } = await supabase.from('products').delete().eq('id', id);
    if (!error) fetchInitialData();
  };

  return (
    <div className="min-h-screen bg-[#FDFBF7] pb-20">
      <AdminHeader 
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        onNewProduct={() => setIsNewProductModalOpen(true)}
        categories={categories}
        onRefreshCategories={fetchInitialData}
      />

      <main className="max-w-[1400px] mx-auto px-4 lg:px-8">
        {loading ? (
          <div className="flex justify-center items-center h-64">
            <span className="animate-bounce text-4xl">🧁</span>
          </div>
        ) : (
          <>
            {activeTab === 'productos' && (
              <AdminInventory 
                products={products} 
                categories={categories} 
                onEdit={setEditingProduct} 
                onDelete={handleDeleteProduct}
                onRefresh={fetchInitialData} // <-- ESTO CORRIGE EL ERROR DE VERCEL
              />
            )}

            {/* Aquí irían los otros tabs como 'master', 'config', etc. */}
            {activeTab === 'master' && (
              <div className="bg-white p-10 rounded-[3rem] text-center border border-[#EDB2D1]/10">
                <p className="font-black uppercase tracking-widest text-gray-300">Panel Master en construcción...</p>
              </div>
            )}
          </>
        )}
      </main>

      {/* MODAL PARA NUEVO PRODUCTO */}
      {isNewProductModalOpen && (
        <ProductAdminModal 
          categories={categories}
          onClose={() => setIsNewProductModalOpen(false)}
          onSave={() => {
            setIsNewProductModalOpen(false);
            fetchInitialData();
          }}
        />
      )}

      {/* MODAL PARA EDITAR PRODUCTO */}
      {editingProduct && (
        <ProductAdminModal 
          product={editingProduct}
          categories={categories}
          onClose={() => setEditingProduct(null)}
          onSave={() => {
            setEditingProduct(null);
            fetchInitialData();
          }}
        />
      )}
    </div>
  );
}