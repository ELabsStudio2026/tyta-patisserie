import Link from "next/link";

export default function NotFound() {
  return (
    <main className="min-h-screen bg-[#FDFBF7] flex flex-col items-center justify-center px-6 text-center">
      <div className="max-w-xl mx-auto space-y-8">
        
        {/* El gran 404 con estilo */}
        <div className="relative">
          <h1 className="font-diner text-[120px] md:text-[150px] text-[#2B4233] leading-none opacity-10 absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 pointer-events-none">
            404
          </h1>
          <h2 className="font-mermaid text-4xl md:text-5xl text-[#2B4233] italic relative z-10">
            ¡Ups! Bandeja vacía...
          </h2>
        </div>

        {/* Mensaje amigable */}
        <p className="font-josefin text-[#5E7361] text-lg md:text-xl leading-relaxed">
          Parece que el producto o la página que estás buscando no existe, o Susana ya lo sacó del horno y se lo llevaron.
        </p>

        {/* Botón de rescate */}
        <div className="pt-8">
          <Link 
            href="/tienda" 
            className="bg-[#EDB2D1] text-[#2B4233] px-10 py-4 rounded-full font-josefin font-bold uppercase tracking-widest hover:bg-[#2B4233] hover:text-[#EDB2D1] transition-all duration-300 shadow-lg inline-flex items-center gap-3"
          >
            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2.5} stroke="currentColor" className="w-5 h-5">
              <path strokeLinecap="round" strokeLinejoin="round" d="M9 15L3 9m0 0l6-6M3 9h12a6 6 0 010 12h-3" />
            </svg>
            Volver a la vitrina
          </Link>
        </div>

      </div>
    </main>
  );
}
