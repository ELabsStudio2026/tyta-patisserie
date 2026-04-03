"use client";
import { CldUploadWidget } from 'next-cloudinary';

export default function ProductAdminModal({ 
  productForm, setProductForm, 
  editingProduct, isAdding, 
  onClose, onSave, categories 
}: any) {
  if (!isAdding && !editingProduct) return null;

  return (
    <div className="fixed inset-0 z-[100] flex justify-end">
      <div className="absolute inset-0 bg-[#2B4233]/40 backdrop-blur-sm" onClick={onClose} />
      
      <div className="relative w-full max-w-sm bg-white shadow-2xl border-l-8 border-[#EDB2D1] flex flex-col h-full overflow-hidden">
        
        {/* CABECERA DINÁMICA */}
        <div className="p-5 border-b border-gray-100 flex justify-between items-center bg-white flex-none">
          <h2 className="text-xl font-diner uppercase text-[#2B4233]">
            {editingProduct ? 'Editar Producto' : 'Nuevo Producto'}
          </h2>
          <button onClick={onClose} className="text-gray-400 hover:text-red-500 font-bold text-xl cursor-pointer p-1">✕</button>
        </div>
        
        {/* CUERPO CON SCROLL */}
        <div className="flex-1 overflow-y-auto p-5 space-y-5 custom-scrollbar bg-[#FDFBF7]/30 pb-24">
          
          <div className="flex flex-col items-center p-4 border-2 border-dashed border-[#EDB2D1]/20 rounded-[2rem] bg-white shadow-sm">
            <img src={productForm.image_url || "/images/placeholder.jpg"} className="w-16 h-16 rounded-2xl object-cover mb-2 border-2 border-white shadow-md" />
            <CldUploadWidget uploadPreset={process.env.NEXT_PUBLIC_CLOUDINARY_UPLOAD_PRESET} onSuccess={(res: any) => setProductForm({...productForm, image_url: res.info.secure_url})}>
              {({ open }) => ( <button type="button" onClick={() => open()} className="px-4 py-1 bg-[#2B4233] text-[#EDB2D1] rounded-full text-[8px] font-black uppercase tracking-widest cursor-pointer">📸 Foto</button> )}
            </CldUploadWidget>
            
            {/* VISIBILIDAD DEBAJO DE FOTO */}
            <div className="flex items-center gap-2 mt-2 bg-white px-4 py-1.5 rounded-full border border-gray-100 shadow-sm cursor-pointer">
              <input type="checkbox" checked={productForm.is_visible} onChange={(e) => setProductForm({...productForm, is_visible: e.target.checked})} className="accent-[#2B4233] cursor-pointer" />
              <span className="text-[9px] font-black uppercase text-[#2B4233]">Visible en Tienda</span>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-2">
            <button type="button" onClick={() => setProductForm({...productForm, is_new: !productForm.is_new})} className={`py-2 rounded-xl text-[8px] font-black uppercase cursor-pointer ${productForm.is_new ? 'bg-[#2B4233] text-white shadow-md' : 'bg-white text-gray-300 border border-gray-100'}`}>✨ Novedad</button>
            <button type="button" onClick={() => setProductForm({...productForm, is_offer: !productForm.is_offer})} className={`py-2 rounded-xl text-[8px] font-black uppercase cursor-pointer ${productForm.is_offer ? 'bg-[#EDB2D1] text-[#2B4233] shadow-md' : 'bg-white text-gray-300 border border-gray-100'}`}>🏷️ Oferta</button>
          </div>

          <div className="space-y-4">
            <div>
              <label className="text-[8px] font-black uppercase text-gray-400 ml-1">Nombre</label>
              <input type="text" value={productForm.name || ""} onChange={(e) => setProductForm({...productForm, name: e.target.value})} className="w-full p-2.5 bg-white border border-gray-100 rounded-xl font-bold text-xs outline-none" />
            </div>
            <div>
              <label className="text-[8px] font-black uppercase text-gray-400 ml-1">Descripción de la Chef</label>
              <textarea value={productForm.description || ""} onChange={(e) => setProductForm({...productForm, description: e.target.value})} className="w-full p-2.5 bg-white border border-gray-100 rounded-xl font-bold text-xs h-20 resize-none outline-none" />
            </div>
            <div>
              <label className="text-[8px] font-black uppercase text-gray-400 ml-1">Categoría</label>
              <select value={productForm.category} onChange={(e) => setProductForm({...productForm, category: e.target.value})} className="w-full p-2.5 bg-white border border-gray-100 rounded-xl font-bold text-xs cursor-pointer">
                {categories.map((cat: any) => <option key={cat.id} value={cat.name}>{cat.name}</option>)}
              </select>
            </div>
          </div>

          <div className="grid grid-cols-3 gap-2 bg-white p-3 rounded-2xl border border-gray-100 shadow-sm">
            <div className="text-center">
              <label className="text-[7px] font-black uppercase text-gray-400 block mb-1">Precio</label>
              <input type="number" value={productForm.price} onChange={(e) => setProductForm({...productForm, price: e.target.value})} className="w-full bg-gray-50 border-none rounded-lg font-black text-[10px] text-center p-1" />
            </div>
            <div className="text-center">
              <label className="text-[7px] font-black uppercase text-gray-400 block mb-1">Stock</label>
              <input type="number" value={productForm.stock} onChange={(e) => setProductForm({...productForm, stock: e.target.value})} className="w-full bg-gray-50 border-none rounded-lg font-black text-[10px] text-center p-1" />
            </div>
            <div className="text-center">
              <label className="text-[7px] font-black uppercase text-gray-400 block mb-1">Crítico</label>
              <input type="number" value={productForm.critical_stock} onChange={(e) => setProductForm({...productForm, critical_stock: e.target.value})} className="w-full bg-gray-50 border-none rounded-lg font-black text-[10px] text-center p-1" />
            </div>
          </div>
        </div>

        {/* PIE FIJO */}
        <div className="p-5 border-t border-gray-100 bg-white flex-none">
          <button onClick={onSave} className="w-full py-4 bg-[#EDB2D1] text-white rounded-full font-black uppercase tracking-widest text-[10px] shadow-lg hover:scale-105 transition-transform cursor-pointer">Guardar Cambios</button>
          <button onClick={onClose} className="w-full mt-3 text-center text-[8px] font-black uppercase text-gray-300 hover:text-red-400 cursor-pointer transition-colors">Cancelar</button>
        </div>
      </div>
    </div>
  );
}