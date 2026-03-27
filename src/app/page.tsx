"use client";

import Image from "next/image";

export default function Home() {
  return (
    <main className="min-h-screen bg-white">
      {/* 1. HERO SECTION */}
      <section className="bg-[#5E7361] text-white min-h-[80vh] flex flex-col items-center justify-center px-6 text-center relative overflow-hidden">
        <div className="absolute top-0 left-0 w-full h-full opacity-10 pointer-events-none uppercase font-diner text-[20vw] flex items-center justify-center whitespace-nowrap">
          Tyta Tyta Tyta
        </div>
        <div className="z-10">
          <h1 className="text-7xl md:text-9xl font-diner tracking-tighter leading-none mb-4">
            TYTA PATISSERIE
          </h1>
          <p className="text-sm md:text-xl font-josefin tracking-[0.5em] uppercase mb-8 opacity-90">
            by Su Fernandez
          </p>
          <h2 className="text-2xl md:text-4xl font-mermaid italic mb-12 text-[#F6CDD7]">
            Excelencia y Calidad
          </h2>
          {/* BOTONES HERO */}
          <div className="flex flex-col md:flex-row gap-6 justify-center items-center mt-4">
            {/* Botón Principal: WhatsApp */}
            <a 
              href="https://wa.me/5491130302451" 
              target="_blank"
              rel="noopener noreferrer"
              className="bg-[#EDB2D1] text-[#2B4233] px-10 py-5 rounded-full font-josefin font-bold uppercase tracking-widest hover:scale-105 transition-all shadow-2xl inline-block text-center"
            >
              Pedir por WhatsApp
            </a>

            {/* Botón Secundario: E-commerce (Deshabilitado temporalmente) */}
            <div className="relative inline-block">
              <span className="absolute -top-3 left-1/2 -translate-x-1/2 bg-[#2B4233] text-white text-[9px] px-3 py-1 rounded-full tracking-[0.2em] border border-[#EDB2D1] whitespace-nowrap z-10 font-josefin uppercase">
                Próximamente
              </span>
              <button 
                disabled
                className="bg-transparent border border-[#EDB2D1] text-[#EDB2D1] px-10 py-5 rounded-full font-josefin font-bold uppercase tracking-widest opacity-50 cursor-not-allowed inline-block text-center w-full"
              >
                Tienda Online
              </button>
            </div>
          </div>
        </div>
      </section>

      {/* 2. SECCIÓN ESPECIALIDADES */}
      <section className="py-24 px-6 max-w-7xl mx-auto bg-white">
        <div className="text-center mb-20 relative">
          <div className="absolute top-0 right-0 font-josefin text-xs uppercase tracking-[0.5em] text-[#5E7361] -mt-12">
            ARTESANÍA EN CADA DETALLE
          </div>
          <h3 className="text-[#2B4233] text-5xl font-mermaid mb-4 italic">Nuestras Especialidades</h3>
          <div className="w-24 h-1 bg-[#EDB2D1] mx-auto mb-6"></div>
          <p className="text-[#5E7361] font-josefin uppercase tracking-[0.3em] text-xs">Artesanía en cada detalle</p>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-16">
          {/* Pavlovas */}
          <div className="group text-center flex flex-col items-center">
            {/* Aspect-square garantiza círculo, overflow-hidden corta lo que sobra */}
            <div className="relative w-full aspect-square overflow-hidden rounded-full mb-6 border-[12px] border-[#EDB2D1] shadow-xl mx-auto bg-white">
              <Image 
                src="/images/pavlovas-generated.jpg" 
                alt="Pavlovas Tyta" 
                fill
                sizes="(max-width: 768px) 100vw, 400px"
                className="object-cover scale-[2.2] group-hover:scale-[2.35] transition-transform duration-700" 
              />
            </div>
            <h4 className="font-diner text-[#2B4233] text-4xl mb-2">Pavlovas</h4>
            <p className="font-josefin text-[#5E7361] italic text-lg leading-tight">
              <span className="text-xl">"</span>Crujientes por fuera, nubes por dentro<span className="text-xl">"</span>
            </p>
          </div>

          {/* Macarrons */}
          <div className="group text-center flex flex-col items-center">
            <div className="relative w-full aspect-square overflow-hidden rounded-full mb-6 border-[12px] border-[#EDB2D1] shadow-xl mx-auto bg-white">
              <Image 
                src="/images/macarrons-generated.jpg" 
                alt="Macarrons Tyta" 
                fill 
                className="object-cover scale-[2.2] group-hover:scale-[2.35] transition-transform duration-700" 
              />
            </div>
            <h4 className="font-diner text-[#2B4233] text-5xl">Macarrons</h4>
          </div>

          {/* Boxes */}
          <div className="group text-right flex flex-col items-end">
            <div className="relative w-full aspect-square overflow-hidden rounded-2xl mb-6 bg-[#F6CDD7] shadow-inner ml-auto">
              <Image 
                src="/images/boxes.jpg" 
                alt="Cajas de Felicidad" 
                fill 
                className="object-cover group-hover:scale-110 transition-transform duration-700" 
              />
            </div>
            <h4 className="font-diner text-[#2B4233] text-4xl mb-2">Cajas de Felicidad</h4>
            <p className="font-josefin text-[#5E7361] text-xs uppercase tracking-widest">PERFECTAS PARA REGALAR MOMENTOS</p>
          </div>
        </div>
      </section>

      {/* 3. SECCIÓN: TAKE AWAY / LOCAL */}
      <section className="bg-[#F6CDD7] py-24 px-6">
        <div className="max-w-6xl mx-auto bg-white rounded-3xl overflow-hidden shadow-2xl flex flex-col md:flex-row">
          
          <div className="md:w-1/2 p-12 md:p-16 flex flex-col justify-center">
            <h3 className="text-[#5E7361] text-sm font-josefin uppercase tracking-[0.4em] mb-4">Visitanos</h3>
            <h4 className="text-[#2B4233] text-6xl font-mermaid italic mb-6">Take Away</h4>
            <p className="text-[#5E7361] font-josefin text-lg mb-8 leading-relaxed">
              Vení a conocer nuestro espacio en el corazón de Núñez. Llevate tus especialidades favoritas recién horneadas, listas para disfrutar o regalar.
            </p>
            
            <div className="space-y-4 font-josefin text-[#2B4233] font-bold">
              <p className="flex items-center gap-4">
                <span className="text-2xl">📍</span> 11 de Septiembre 1888, N° 2451, Núñez, CABA
              </p>
              <p className="flex items-center gap-4">
                <span className="text-2xl">🕒</span> Todos los días - 08:00 a 20:00 hs
              </p>
            </div>

            <a 
              href="https://www.google.com/maps/search/?api=1&query=11+de+Septiembre+1888,+2451,+Nuñez,+CABA" 
              target="_blank"
              rel="noopener noreferrer"
              className="mt-10 bg-[#2B4233] text-[#F6CDD7] px-8 py-4 rounded-full font-josefin font-bold uppercase tracking-widest hover:bg-[#5E7361] transition-colors self-start text-sm text-center shadow-lg"
            >
              Cómo llegar
            </a>
          </div>

          <div className="md:w-1/2 bg-[#EDB2D1] min-h-[400px] relative group overflow-hidden">
             <Image 
                src="/images/local.jpg" 
                alt="Vitrina de especialidades Tyta Patisserie" 
                fill
                sizes="(max-width: 768px) 100vw, 50vw" 
                className="object-cover group-hover:scale-105 transition-transform duration-700" 
              />
          </div>

        </div>
      </section>

      {/* 4. FOOTER */}
      <footer className="bg-[#2B4233] text-[#F6CDD7] py-20 px-6 text-center">
        <div className="mb-10">
          <p className="font-diner text-5xl tracking-[0.2em] mb-2 text-[#F6CDD7]">TYTA Pastelería</p>
          <p className="font-josefin text-[10px] tracking-[0.6em] uppercase opacity-50">Pastelería Boutique</p>
        </div>
        <div className="space-y-2 font-josefin text-sm tracking-wide">
          <p>11 de Septiembre 1888, N° 2451, Núñez, CABA</p>
          <p>Take Away & Envíos Personalizados</p>
          <a href="https://wa.me/5491130302451" target="_blank" className="pt-4 text-[#EDB2D1] font-diner font-bold block hover:brightness-110">@tytapatisserie</a>
        </div>
        <div className="mt-16 pt-8 border-t border-white/10 text-[9px] tracking-widest uppercase opacity-30">
          © 2026 Tyta Patisserie | Excelencia y Calidad en cada bocado.
        </div>
      </footer>
    </main>
  );
}