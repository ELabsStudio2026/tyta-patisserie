"use client";
import { useState, useEffect } from 'react';
import { CldUploadWidget } from 'next-cloudinary';
import { useTytaAlert } from "@/lib/useTytaAlert";
import TytaAlert from "@/components/ui/TytaAlert";

export default function ProductAdminModal({ 
  productForm, setProductForm, 
  editingProduct, isAdding, 
  onClose, onSave, categories 
}: any) {
  
  const { alert, showAlert, closeAlert } = useTytaAlert();
  const [isDirty, setIsDirty] = useState(false);

  // Resetear el interruptor cada vez que el modal se abre/cambia de producto
  useEffect(() => {
    if (isAdding || editingProduct) {
      setIsDirty(false);
    }
  }, [isAdding, editingProduct]);

  if (!isAdding && !editingProduct) return null;

  // Manejador de cambios que activa el interruptor de seguridad
  const handleChange = (updater: any) => {
    setProductForm(updater);
    setIsDirty(true);
  };

  // Función de cierre con validación Tyta
  const handleRequestClose = () => {
    if (isDirty) {
      showAlert(
        "danger", 
        "¿DESCARTAR CAMBIOS?", 
        "Tienes ediciones sin guardar. Si sales ahora, se perderán para siempre.",
        () => {
          setIsDirty(false);
          onClose();
        }
      );
    } else {
      onClose();
    }
  };

  const handleSave = (e: any) => {
    setIsDirty(false); // Apagamos el interruptor para que guarde sin chillar
    onSave(e);
  };

  // --- LÓGICA DE FORMATEO Y CÁLCULOS ---
  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('es-AR').format(Math.floor(value / 100) || 0);
  };

  const costo = productForm.cost || 0;
  const precio = productForm.price || 0;
  const rentabilidadValue = precio - costo;
  const rentabilidadPorcentaje = costo > 0 ? Math.round((rentabilidadValue / costo) * 100) : 0;

  return (
    <>
      <div className="fixed inset-0 z-[100] flex justify-end font-josefin text-[#2B4233]">
        <div className="absolute inset-0 bg-[#2B4233]/40 backdrop-blur-sm" onClick={handleRequestClose} />
        
        <div className="relative w-full max-w-sm bg-white shadow-2xl border-l-8 border-[#EDB2D1] flex flex-col h-full overflow-hidden">
          
          {/* CABECERA */}
          <div className="p-5 border-b border-gray-100 flex justify-between items-center bg-white flex-none">
            <h2 className="text-xl font-diner uppercase">
              {editingProduct ? 'Editar Producto' : 'Nuevo Producto'}
            </h2>
            <button onClick={handleRequestClose} className="text-gray-300 hover:text-[#2B4233] font-bold text-4xl p-1 cursor-pointer leading-none">×</button>
          </div>
          
          {/* CUERPO CON SCROLL */}
          <div className="flex-1 overflow-y-auto p-5 space-y-5 custom-scrollbar bg-[#FDFBF7]/30 pb-24">
            
            {/* SECCIÓN FOTO */}
            <div className="flex flex-col items-center p-4 border-2 border-dashed border-[#EDB2D1]/20 rounded-[2rem] bg-white shadow-sm relative">
              {productForm.image_url && (
                <button 
                  type="button"
                  onClick={() => handleChange((prev: any) => ({ ...prev, image_url: "" }))}
                  className="absolute top-3 right-3 w-6 h-6 bg-red-50 text-red-500 rounded-full flex items-center justify-center text-[10px] shadow-sm hover:bg-red-500 hover:text-white transition-all cursor-pointer z-10"
                >
                  ✕
                </button>
              )}

              <img src={productForm.image_url || "/images/placeholder.jpg"} className="w-20 h-20 rounded-2xl object-cover mb-2 border-2 border-white shadow-md" />
              
              <CldUploadWidget 
                uploadPreset={process.env.NEXT_PUBLIC_CLOUDINARY_UPLOAD_PRESET} 
                onSuccess={(res: any) => {
                  if (res.event === "success") {
                    handleChange((prev: any) => ({ ...prev, image_url: res.info.secure_url }));
                  }
                }}
              >
                {({ open }) => ( 
                  <button type="button" onClick={() => open()} className="px-4 py-1.5 bg-[#2B4233] text-[#EDB2D1] rounded-full text-[8px] font-black uppercase tracking-widest cursor-pointer">
                    {productForm.image_url ? "📸 Cambiar Foto" : "📸 Cargar Foto"}
                  </button> 
                )}
              </CldUploadWidget>
              
              <div className="flex items-center gap-2 mt-3 bg-white px-4 py-1.5 rounded-full border border-gray-100 shadow-sm cursor-pointer">
                <input 
                  type="checkbox" 
                  checked={productForm.is_visible} 
                  onChange={(e) => handleChange({...productForm, is_visible: e.target.checked})} 
                  className="accent-[#2B4233] cursor-pointer" 
                />
                <span className="text-[9px] font-black uppercase text-[#2B4233]">Visible en Tienda</span>
              </div>
            </div>

            {/* ETIQUETAS RÁPIDAS */}
            <div className="grid grid-cols-2 gap-2">
              <button type="button" onClick={() => handleChange({...productForm, is_new: !productForm.is_new})} className={`py-2 rounded-xl text-[8px] font-black uppercase transition-all ${productForm.is_new ? 'bg-[#2B4233] text-white shadow-md' : 'bg-white text-gray-300 border border-gray-100'}`}>✨ Novedad</button>
              <button type="button" onClick={() => handleChange({...productForm, is_offer: !productForm.is_offer})} className={`py-2 rounded-xl text-[8px] font-black uppercase transition-all ${productForm.is_offer ? 'bg-[#EDB2D1] text-[#2B4233] shadow-md' : 'bg-white text-gray-300 border border-gray-100'}`}>🏷️ Oferta</button>
            </div>

            {/* DATOS BÁSICOS */}
            <div className="space-y-4">
              <div>
                <label className="text-[8px] font-black uppercase text-gray-400 ml-1">Nombre del Producto</label>
                <input type="text" value={productForm.name || ""} onChange={(e) => handleChange({...productForm, name: e.target.value})} className="w-full p-2.5 bg-white border border-gray-100 rounded-xl font-bold text-xs outline-none focus:border-[#EDB2D1]" />
              </div>
              <div>
                <label className="text-[8px] font-black uppercase text-gray-400 ml-1">Categoría</label>
                <select value={productForm.category} onChange={(e) => handleChange({...productForm, category: e.target.value})} className="w-full p-2.5 bg-white border border-gray-100 rounded-xl font-bold text-xs cursor-pointer outline-none">
                  {categories.map((cat: any) => (
                    <option key={cat.id} value={cat.name}>{cat.name}</option>
                  ))}
                </select>
              </div>
            </div>

            {/* SECCIÓN FINANCIERA */}
            <div className="bg-white p-3 rounded-2xl border border-gray-100 shadow-sm space-y-3">
              <div className="grid grid-cols-2 gap-2">
                <div className="text-center">
                  <label className="text-[7px] font-black uppercase text-gray-400 block mb-1">Costo ($)</label>
                  <div className="relative">
                    <span className="absolute left-1 top-1/2 -translate-y-1/2 text-[10px] font-black text-[#2B4233] opacity-40">$</span>
                    <input type="text" value={formatCurrency(costo)} onChange={(e) => {
                        const rawValue = e.target.value.replace(/\D/g, "");
                        const numericValue = rawValue ? parseInt(rawValue, 10) : 0;
                        handleChange((prev: any) => ({ ...prev, cost: numericValue * 100 }));
                    }} className="w-full bg-gray-50 border-none rounded-lg font-black text-[10px] text-center p-1 pl-3 outline-none" />
                  </div>
                </div>
                <div className="text-center">
                  <label className="text-[7px] font-black uppercase text-gray-400 block mb-1">Precio Venta ($)</label>
                  <div className="relative">
                    <span className="absolute left-1 top-1/2 -translate-y-1/2 text-[10px] font-black text-[#2B4233] opacity-40">$</span>
                    <input type="text" value={formatCurrency(precio)} onChange={(e) => {
                        const rawValue = e.target.value.replace(/\D/g, "");
                        const numericValue = rawValue ? parseInt(rawValue, 10) : 0;
                        handleChange((prev: any) => ({ ...prev, price: numericValue * 100 }));
                    }} className="w-full bg-gray-50 border-none rounded-lg font-black text-[10px] text-center p-1 pl-3 outline-none" />
                  </div>
                </div>
              </div>

              {/* RENTABILIDAD */}
              {costo > 0 && (
                <div className="flex items-center justify-between px-4 py-2 bg-[#2B4233]/5 rounded-xl border border-[#2B4233]/10">
                  <div className="flex flex-col">
                    <span className="text-[7px] font-black uppercase text-[#2B4233]/40">Ganancia</span>
                    <span className={`text-xs font-black ${rentabilidadValue < 0 ? 'text-red-500' : 'text-[#2B4233]'}`}>$ {formatCurrency(rentabilidadValue)}</span>
                  </div>
                  <div className="text-right flex flex-col">
                    <span className="text-[7px] font-black uppercase text-[#2B4233]/40">Margen</span>
                    <span className={`text-xs font-black ${rentabilidadValue < 0 ? 'text-red-500' : 'text-[#2B4233]'}`}>{rentabilidadPorcentaje}%</span>
                  </div>
                </div>
              )}
            </div>

            {/* SECCIÓN INVENTARIO */}
            <div className="grid grid-cols-2 gap-2 bg-white p-3 rounded-2xl border border-gray-100 shadow-sm">
              <div className="text-center">
                <label className="text-[7px] font-black uppercase text-gray-400 block mb-1">Stock Actual</label>
                <input type="number" value={productForm.stock} onChange={(e) => handleChange({...productForm, stock: Number(e.target.value)})} className="w-full bg-gray-50 border-none rounded-lg font-black text-[10px] text-center p-1 outline-none" />
              </div>
              <div className="text-center">
                <label className="text-[7px] font-black uppercase text-gray-400 block mb-1">Stock Crítico</label>
                <input type="number" value={productForm.critical_stock} onChange={(e) => handleChange({...productForm, critical_stock: Number(e.target.value)})} className="w-full bg-gray-50 border-none rounded-lg font-black text-[10px] text-center p-1 outline-none" />
              </div>
            </div>

            {/* DESCRIPCIÓN */}
            <div>
              <label className="text-[8px] font-black uppercase text-gray-400 ml-1">Descripción de la Chef</label>
              <textarea value={productForm.description || ""} onChange={(e) => handleChange({...productForm, description: e.target.value})} className="w-full p-2.5 bg-white border border-gray-100 rounded-xl font-bold text-xs h-24 resize-none outline-none focus:border-[#EDB2D1]" placeholder="Detalles de la delicia..." />
            </div>
          </div>

          {/* PIE DE MODAL FIJO */}
          <div className="p-5 border-t border-gray-100 bg-white flex-none">
            <button onClick={handleSave} className="w-full py-4 bg-[#EDB2D1] text-white rounded-full font-black uppercase tracking-widest text-[10px] shadow-lg active:scale-95 transition-all">
              Guardar Cambios
            </button>
            <button onClick={handleRequestClose} className="w-full mt-3 text-center text-[8px] font-black uppercase text-gray-300 hover:text-red-400 transition-colors">
              Cancelar
            </button>
          </div>
        </div>
      </div>

      <TytaAlert alert={alert} onCancel={closeAlert} />
    </>
  );
}