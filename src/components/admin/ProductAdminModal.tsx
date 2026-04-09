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

  useEffect(() => {
    if (isAdding || editingProduct) {
      setIsDirty(false);
    }
  }, [isAdding, editingProduct]);

  if (!isAdding && !editingProduct) return null;

  const handleChange = (updater: any) => {
    if (typeof updater === 'function') {
      setProductForm(updater);
    } else {
      setProductForm(updater);
    }
    setIsDirty(true);
  };

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
    setIsDirty(false);
    onSave(e);
  };

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('es-AR').format(Math.floor(value / 100) || 0);
  };

  const costo = productForm.cost || 0;
  const precio = productForm.price || 0;
  const rentabilidadValue = precio - costo;
  const rentabilidadPorcentaje = costo > 0 ? Math.round((rentabilidadValue / costo) * 100) : 0;

  return (
    <>
      {/* Contenedor principal: En móvil es pantalla completa, en PC es un Sidebar */}
      <div className="fixed inset-0 z-[100] flex justify-end font-josefin text-[#2B4233]">
        <div className="absolute inset-0 bg-[#2B4233]/40 backdrop-blur-sm" onClick={handleRequestClose} />
        
        {/* MODAL: 'w-full' en móvil, 'max-w-sm' en PC */}
        <div className="relative w-full sm:max-w-md bg-white shadow-2xl sm:border-l-8 border-[#EDB2D1] flex flex-col h-full overflow-hidden animate-in slide-in-from-right duration-300">
          
          {/* CABECERA: X Gigante para móvil */}
          <div className="p-5 border-b border-gray-100 flex justify-between items-center bg-white flex-none">
            <h2 className="text-xl font-diner uppercase">
              {editingProduct ? 'Editar Producto' : 'Nuevo Producto'}
            </h2>
            <button 
              onClick={handleRequestClose} 
              className="text-gray-300 hover:text-[#2B4233] font-bold text-5xl p-2 cursor-pointer leading-none"
            >
              ×
            </button>
          </div>
          
          {/* CUERPO: Scroll con padding ajustado */}
          <div className="flex-1 overflow-y-auto p-5 space-y-6 custom-scrollbar bg-[#FDFBF7]/30 pb-32">
            
            {/* SECCIÓN FOTO */}
            <div className="flex flex-col items-center p-6 border-2 border-dashed border-[#EDB2D1]/20 rounded-[2.5rem] bg-white shadow-sm relative">
              {productForm.image_url && (
                <button 
                  type="button"
                  onClick={() => handleChange((prev: any) => ({ ...prev, image_url: "" }))}
                  className="absolute top-4 right-4 w-8 h-8 bg-red-50 text-red-500 rounded-full flex items-center justify-center text-xs shadow-sm hover:bg-red-500 hover:text-white transition-all cursor-pointer z-10"
                >
                  ✕
                </button>
              )}

              <img src={productForm.image_url || "/images/placeholder.jpg"} className="w-24 h-24 rounded-3xl object-cover mb-4 border-2 border-white shadow-md" alt="Preview" />
              
              <CldUploadWidget 
                uploadPreset={process.env.NEXT_PUBLIC_CLOUDINARY_UPLOAD_PRESET} 
                options={{
                  maxFiles: 1,
                  multiple: false,
                  resourceType: "image",
                  clientAllowedFormats: ["jpg", "png", "webp", "jpeg"],
                  sources: ["local", "camera", "url"],
                  language: "es",
                  styles: { palette: { window: "#FDFBF7", sourceBg: "#FFFFFF", windowBorder: "#EDB2D1", tabIcon: "#2B4233", menuIcons: "#2B4233", textDark: "#2B4233" } }
                }}
                onSuccess={(res: any) => {
                  if (res.event === "success") {
                    handleChange((prev: any) => ({ ...prev, image_url: res.info.secure_url }));
                  }
                }}
              >
                {({ open }) => ( 
                  <button type="button" onClick={() => open()} className="px-6 py-2.5 bg-[#2B4233] text-[#EDB2D1] rounded-full text-[10px] font-black uppercase tracking-widest cursor-pointer shadow-md active:scale-95 transition-all">
                    {productForm.image_url ? "📸 Cambiar Imagen" : "📸 Cargar Imagen"}
                  </button> 
                )}
              </CldUploadWidget>
              
              <div className="flex items-center gap-3 mt-4 bg-white px-5 py-2 rounded-full border border-gray-100 shadow-sm cursor-pointer">
                <input 
                  type="checkbox" 
                  checked={productForm.is_visible} 
                  onChange={(e) => handleChange({...productForm, is_visible: e.target.checked})} 
                  className="w-5 h-5 accent-[#2B4233] cursor-pointer" 
                />
                <span className="text-[10px] font-black uppercase text-[#2B4233] tracking-wider">Visible en Tienda</span>
              </div>
            </div>

            {/* ETIQUETAS RÁPIDAS */}
            <div className="grid grid-cols-2 gap-3">
              <button type="button" onClick={() => handleChange({...productForm, is_new: !productForm.is_new})} className={`py-3.5 rounded-2xl text-[9px] font-black uppercase transition-all shadow-sm ${productForm.is_new ? 'bg-[#2B4233] text-white' : 'bg-white text-gray-300 border border-gray-100'}`}>✨ Novedad</button>
              <button type="button" onClick={() => handleChange({...productForm, is_offer: !productForm.is_offer})} className={`py-3.5 rounded-2xl text-[9px] font-black uppercase transition-all shadow-sm ${productForm.is_offer ? 'bg-[#EDB2D1] text-[#2B4233]' : 'bg-white text-gray-300 border border-gray-100'}`}>🏷️ Oferta</button>
            </div>

            {/* DATOS BÁSICOS */}
            <div className="space-y-5">
              <div>
                <label className="text-[9px] font-black uppercase text-gray-400 ml-2 mb-1 block tracking-widest">Nombre del Producto</label>
                <input type="text" value={productForm.name || ""} onChange={(e) => handleChange({...productForm, name: e.target.value})} className="w-full p-3.5 bg-white border border-gray-100 rounded-2xl font-bold text-sm outline-none focus:border-[#EDB2D1] shadow-sm" />
              </div>
              <div>
                <label className="text-[9px] font-black uppercase text-gray-400 ml-2 mb-1 block tracking-widest">Categoría</label>
                <select value={productForm.category} onChange={(e) => handleChange({...productForm, category: e.target.value})} className="w-full p-3.5 bg-white border border-gray-100 rounded-2xl font-bold text-sm cursor-pointer outline-none shadow-sm appearance-none">
                  {categories.map((cat: any) => (
                    <option key={cat.id} value={cat.name}>{cat.name}</option>
                  ))}
                </select>
              </div>
            </div>

            {/* SECCIÓN FINANCIERA */}
            <div className="bg-white p-4 rounded-[2.5rem] border border-gray-50 shadow-sm space-y-4">
              <div className="grid grid-cols-2 gap-3">
                <div className="text-center">
                  <label className="text-[8px] font-black uppercase text-gray-400 block mb-1.5 tracking-widest">Costo</label>
                  <div className="relative">
                    <span className="absolute left-2.5 top-1/2 -translate-y-1/2 text-xs font-black text-[#2B4233] opacity-30">$</span>
                    <input type="text" value={formatCurrency(costo)} onChange={(e) => {
                        const rawValue = e.target.value.replace(/\D/g, "");
                        const numericValue = rawValue ? parseInt(rawValue, 10) : 0;
                        handleChange((prev: any) => ({ ...prev, cost: numericValue * 100 }));
                    }} className="w-full bg-[#FDFBF7] border-none rounded-xl font-black text-xs text-center p-2.5 pl-6 outline-none" />
                  </div>
                </div>
                <div className="text-center">
                  <label className="text-[8px] font-black uppercase text-gray-400 block mb-1.5 tracking-widest">Venta</label>
                  <div className="relative">
                    <span className="absolute left-2.5 top-1/2 -translate-y-1/2 text-xs font-black text-[#2B4233] opacity-30">$</span>
                    <input type="text" value={formatCurrency(precio)} onChange={(e) => {
                        const rawValue = e.target.value.replace(/\D/g, "");
                        const numericValue = rawValue ? parseInt(rawValue, 10) : 0;
                        handleChange((prev: any) => ({ ...prev, price: numericValue * 100 }));
                    }} className="w-full bg-[#FDFBF7] border-none rounded-xl font-black text-xs text-center p-2.5 pl-6 outline-none" />
                  </div>
                </div>
              </div>

              {costo > 0 && (
                <div className="flex items-center justify-between px-5 py-3 bg-[#2B4233] rounded-2xl shadow-inner">
                  <div className="flex flex-col">
                    <span className="text-[8px] font-black uppercase text-[#EDB2D1]/40 tracking-wider">Ganancia</span>
                    <span className={`text-sm font-black ${rentabilidadValue < 0 ? 'text-red-400' : 'text-[#EDB2D1]'}`}>$ {formatCurrency(rentabilidadValue)}</span>
                  </div>
                  <div className="text-right flex flex-col">
                    <span className="text-[8px] font-black uppercase text-[#EDB2D1]/40 tracking-wider">Margen</span>
                    <span className={`text-sm font-black ${rentabilidadValue < 0 ? 'text-red-400' : 'text-[#EDB2D1]'}`}>{rentabilidadPorcentaje}%</span>
                  </div>
                </div>
              )}
            </div>

            {/* SECCIÓN INVENTARIO */}
            <div className="grid grid-cols-2 gap-3 bg-white p-4 rounded-[2.5rem] border border-gray-50 shadow-sm">
              <div className="text-center">
                <label className="text-[8px] font-black uppercase text-gray-400 block mb-1.5 tracking-widest">Stock</label>
                <input type="number" value={productForm.stock} onChange={(e) => handleChange({...productForm, stock: Number(e.target.value)})} className="w-full bg-[#FDFBF7] border-none rounded-xl font-black text-xs text-center p-2.5 outline-none" />
              </div>
              <div className="text-center">
                <label className="text-[8px] font-black uppercase text-gray-400 block mb-1.5 tracking-widest">Crítico</label>
                <input type="number" value={productForm.critical_stock} onChange={(e) => handleChange({...productForm, critical_stock: Number(e.target.value)})} className="w-full bg-[#FDFBF7] border-none rounded-xl font-black text-xs text-center p-2.5 outline-none" />
              </div>
            </div>

            {/* DESCRIPCIÓN */}
            <div>
              <label className="text-[9px] font-black uppercase text-gray-400 ml-2 mb-1 block tracking-widest">Descripción</label>
              <textarea value={productForm.description || ""} onChange={(e) => handleChange({...productForm, description: e.target.value})} className="w-full p-4 bg-white border border-gray-100 rounded-2xl font-bold text-sm h-32 resize-none outline-none focus:border-[#EDB2D1] shadow-sm" placeholder="Contale a tus clientes de qué se trata..." />
            </div>
          </div>

          {/* BOTONES FIJOS ABAJO */}
          <div className="p-6 border-t border-gray-100 bg-white flex-none">
            <button onClick={handleSave} className="w-full py-4.5 bg-[#EDB2D1] text-white rounded-full font-black uppercase tracking-[0.2em] text-[11px] shadow-lg active:scale-95 transition-all">
              Guardar Cambios
            </button>
            <button onClick={handleRequestClose} className="w-full mt-4 text-center text-[9px] font-black uppercase text-gray-300 tracking-[0.2em] hover:text-red-400 transition-colors">
              Cancelar Edición
            </button>
          </div>
        </div>
      </div>

      <TytaAlert alert={alert} onCancel={closeAlert} />
    </>
  );
}