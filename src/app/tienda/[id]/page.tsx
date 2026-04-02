import { tytaProducts } from "@/data/products";
import Link from "next/link";
import { notFound } from "next/navigation";
import ProductImage from "@/components/ProductImage";
import AddToCartDetailButton from "@/components/AddToCartDetailButton";
import ProductCard from "@/components/ProductCard"; // IMPORTAMOS LA TARJETA PARA EL UPSELLING

export default async function ProductDetailPage({ 
  params 
}: { 
  params: Promise<{ id: string }> 
}) {
  
  const resolvedParams = await params;
  const productId = resolvedParams.id;
  const product = tytaProducts.find((p) => p.id === productId);

  if (!product) {
    notFound();
  }

  const formatter = new Intl.NumberFormat("es-AR", {
    style: "currency",
    currency: "ARS",
    minimumFractionDigits: 0,
  });

  // --- LÓGICA DE UPSELLING ---
  // 1. Buscamos productos de la misma categoría (excluyendo el actual)
  let relatedProducts = tytaProducts
    .filter((p) => p.category === product.category && p.id !== product.id)
    .slice(0, 4);

  // 2. Si hay menos de 4 de la misma categoría, rellenamos con otros productos al azar
  if (relatedProducts.length < 4) {
    const extraProducts = tytaProducts
      .filter((p) => p.id !== product.id && !relatedProducts.find(rp => rp.id === p.id))
      .slice(0, 4 - relatedProducts.length);
    relatedProducts.push(...extraProducts);
  }
  // ---------------------------

  return (
    <main className="min-h-screen bg-[#FDFBF7] pt-28 pb-20 px-4 sm:px-8 lg:px-12 flex flex-col items-center">
      <div className="max-w-[1400px] w-full mx-auto">
        
        {/* Botón Volver */}
        <div className="mb-10">
          <Link 
            href="/tienda" 
            className="text-[#EDB2D1] font-josefin text-sm font-bold hover:text-[#2B4233] transition-colors flex items-center gap-2 group w-fit"
          >
            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2.5} stroke="currentColor" className="w-5 h-5 group-hover:-translate-x-1 transition-transform">
              <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 19.5L8.25 12l7.5-7.5" />
            </svg>
            Volver a la tienda
          </Link>
        </div>

        {/* Layout de Detalle: 2 Columnas */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-12 lg:gap-16 bg-white p-8 md:p-12 rounded-3xl shadow-lg border border-gray-100 mb-20">
          
          <div className="relative aspect-square w-full max-w-xl mx-auto md:max-w-none rounded-2xl overflow-hidden bg-[#FDFBF7] shadow-inner border border-gray-100">
            <ProductImage src={product.image} alt={product.name} />
          </div>

          <div className="flex flex-col gap-6 justify-center">
            <div className="space-y-2">
              <span className="font-josefin text-[#EDB2D1] tracking-[0.2em] uppercase text-xs font-bold">
                {product.category}
              </span>
              <h1 className="font-diner text-6xl md:text-7xl lg:text-8xl text-[#2B4233] leading-none">
                {product.name}
              </h1>
            </div>

            <div className="flex items-baseline gap-3 border-t border-b border-gray-100 py-4 mt-2">
              <span className="font-josefin text-4xl font-bold text-[#2B4233]">
                {formatter.format(product.price)}
              </span>
              {product.inStock ? (
                <span className="font-josefin text-xs text-green-700 bg-green-50 px-3 py-1 rounded-full font-medium">En Stock</span>
              ) : (
                <span className="font-josefin text-xs text-red-700 bg-red-50 px-3 py-1 rounded-full font-medium">Agotado</span>
              )}
            </div>

            <p className="font-josefin text-base md:text-lg text-[#5E7361] leading-relaxed max-w-xl">
              {product.description || "Esta exquisita creación de Tyta Patisserie está esperando deleitar tu paladar. Consultanos por ingredientes y alérgenos específicos."}
            </p>

            <AddToCartDetailButton product={product} />

          </div>
        </div>

        {/* --- SECCIÓN DE UPSELLING --- */}
        <div className="w-full pt-12 border-t border-gray-200">
          <div className="flex flex-col items-center mb-10">
            <span className="font-josefin text-[#EDB2D1] tracking-[0.2em] uppercase text-xs font-bold mb-2">Para acompañar</span>
            <h2 className="font-diner text-4xl md:text-5xl text-[#2B4233] text-center">También te puede interesar</h2>
          </div>
          
          {/* Grilla de 4 columnas para relacionados */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {relatedProducts.map((relatedProduct) => (
              <ProductCard key={relatedProduct.id} product={relatedProduct} />
            ))}
          </div>
        </div>
        
      </div>
    </main>
  );
}