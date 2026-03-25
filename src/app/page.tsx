"use client";

import Image from "next/image";

export default function Home() {
  return (
    <main className="min-h-screen bg-white">
      {/* 1. HERO SECTION - Identidad Institucional */}
      <section className="bg-[#5E7361] text-white min-h-[80vh] flex flex-col items-center justify-center px-6 text-center relative overflow-hidden">
        <div className="absolute top-0 left-0 w-full h-full opacity-10 pointer-events-none uppercase font-['Diner_Fatt'] text-[20vw] flex items-center justify-center whitespace-nowrap">
          Tyta Tyta Tyta
        </div>
        <div className="z-10">
          <h1 className="text-7xl md:text-9xl font-['Diner_Fatt'] tracking-tighter leading-none mb-4">
            TYTA PATISSERIE
          </h1>
          <p className="text-sm md:text-xl font-['Josefin_Sans'] tracking-[0.5em] uppercase mb-8 opacity-90">
            by Su Fernandez
          </p>
          <h2 className="text-2xl md:text-4xl font-['Mermaid'] italic mb-12 text-[#F6CDD7]">
            Excelencia y Calidad
          </h2>
          <a 
            /* WhatsApp real de Tyta +5491130302451 */
            href="https://wa.me/5491130302451" 
            target="_blank"
            rel="noopener noreferrer"
            className="bg-[#EDB2D1] text-[#2B4233] px-12 py-5 rounded-full font-['Josefin_Sans'] font-bold uppercase tracking-widest hover:scale-105 transition-all shadow-2xl inline-block"
          >
            Pedir por WhatsApp
          </a>
        </div>
      </section>

      {/* 2. SECCIÓN ESPECIALIDADES - Galería con Fotos Generadas por IA para Máxima Consistencia */}
      <section className="py-24 px-6 max-w-7xl mx-auto bg-white">
        <div className="text-center mb-20">
          <h3 className="text-[#2B4233] text-5xl font-['Mermaid'] mb-4 italic">Nuestras Especialidades</h3>
          <div className="w-24 h-1 bg-[#EDB2D1] mx-auto mb-6"></div>
          <p className="text-[#5E7361] font-['Josefin_Sans'] uppercase tracking-[0.3em] text-xs">Artesanía en cada detalle</p>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-16">
          {/* Pavlovas - NUEVA IMAGEN GENERADA POR IA (Limpias de texto) */}
          <div className="group text-center">
            <div className="relative h-[400px] w-full aspect-square overflow-hidden rounded-full mb-6 border-[12px] border-[#EDB2D1] shadow-xl mx-auto">
              <Image 
                src="/images/pavlovas-generated.jpg" // <--- Asegúrate de usar el nuevo archivo
                alt="Pavlovas artesanales Tyta - Especialidad" 
                fill 
                className="object-contain group-hover:scale-110 transition-transform duration-700" // <--- object-contain para mantener la forma circular
              />
            </div>
            <h4 className="font-['Diner_Fatt'] text-[#2B4233] text-4xl mb-2">Pavlovas</h4>
            <p className="font-['Josefin_Sans'] text-[#5E7361] italic text-lg leading-tight">"Crujientes por fuera, nubes por dentro"</p>
          </div>

          {/* Macarrons - NUEVA IMAGEN GENERADA POR IA (Limpias de texto) */}
          <div className="group text-center">
            <div className="relative h-[400px] w-full aspect-square overflow-hidden rounded-full mb-6 border-[12px] border-[#EDB2D1] shadow-xl mx-auto">
              <Image 
                src="/images/macarrons-generated.jpg" // <--- Asegúrate de usar el nuevo archivo
                alt="Macarrons franceses artesanos Tyta - Colores y Sabores" 
                fill 
                className="object-contain group-hover:rotate-12 transition-transform duration-700" // <--- object-contain para mantener la forma circular
              />
            </div>
            <h4 className="font-['Diner_Fatt'] text-[#2B4233] text-5xl">Macarrons</h4>
          </div>

          {/* Boxes */}
          <div className="group">
            <div className="relative h-[400px] w-full overflow-hidden rounded-2xl mb-6 bg-[#F6CDD7] shadow-inner">
              <Image 
                src="/images/boxes.jpg" 
                alt="Cajas de Felicidad para regalo - Tyta Patisserie" 
                fill 
                className="object-cover group-hover:scale-110 transition-transform duration-700"
              />
            </div>
            <h4 className="font-['Diner_Fatt'] text-[#2B4233] text-4xl mb-2 text-right">Cajas de Felicidad</h4>
            <p className="font-['Josefin_Sans'] text-[#5E7361] text-xs uppercase tracking-widest text-right">Perfectas para regalar momentos</p>
          </div>
        </div>
      </section>

      {/* 3. SECCIÓN: TAKE AWAY / LOCAL - Información de Contacto Corregida */}
      <section className="bg-[#F6CDD7] py-24 px-6">
        <div className="max-w-6xl mx-auto bg-white rounded-3xl overflow-hidden shadow-2xl flex flex-col md:flex-row">
          
          {/* Columna de Texto */}
          <div className="md:w-1/2 p-12 md:p-16 flex flex-col justify-center">
            <h3 className="text-[#5E7361] text-sm font-['Josefin_Sans'] uppercase tracking-[0.4em] mb-4">Visitanos</h3>
            <h4 className="text-[#2B4233] text-6xl font-['Mermaid'] italic mb-6">Take Away</h4>
            <p className="text-[#5E7361] font-['Josefin_Sans'] text-lg mb-8 leading-relaxed">
              Vení a conocer nuestro espacio en el corazón de Núñez. Llevate tus especialidades favoritas recién horneadas, listas para disfrutar o regalar.
            </p>
            
            <div className="space-y-4 font-['Josefin_Sans'] text-[#2B4233] font-bold">
              <p className="flex items-center gap-4">
                {/* DIRECCIÓN CORREGIDA PARA MAPAS Y VISUALIZACIÓN */}
                <span className="text-2xl">📍</span> 11 de Septiembre de 1888, N° 2451, Núñez, CABA
              </p>
              <p className="flex items-center gap-4">
                <span className="text-2xl">🕒</span> Todos los días - 08:00 a 20:00 hs
              </p>
            </div>

            <a 
              /* Enlace dinámico a Google Maps que soluciona la confusión de los años con la altura */
              href="https://www.google.com/maps/search/?api=1&query=%2211+de+Septiembre+de+1888%22+2451%2C+Nuñez%2C+Buenos+Aires%2C+Argentina" 
              target="_blank"
              rel="noopener noreferrer"
              className="mt-10 bg-[#2B4233] text-[#F6CDD7] px-8 py-4 rounded-full font-['Josefin_Sans'] font-bold uppercase tracking-widest hover:bg-[#5E7361] transition-colors self-start text-sm text-center shadow-lg"
            >
              Cómo llegar
            </a>
          </div>

          {/* Columna de Imagen (Local/Vitrina Aprobada) */}
          <div className="md:w-1/2 bg-[#EDB2D1] min-h-[400px] relative group overflow-hidden">
             {/* Imagen de vitrina generada, cargada desde public/images/local.jpg */}
             <Image 
                src="/images/local.jpg" 
                alt="Vitrina de especialidades - Tyta Patisserie" 
                fill 
                className="object-cover group-hover:scale-105 transition-transform duration-700"
              />
          </div>

        </div>
      </section>

      {/* 4. FOOTER */}
      <footer className="bg-[#2B4233] text-[#F6CDD7] py-20 px-6 text-center">
        <div className="mb-10">
          <p className="font-['Diner_Fatt'] text-5xl tracking-[0.2em] mb-2">TYTA</p>
          <p className="font-['Josefin_Sans'] text-[10px] tracking-[0.6em] uppercase opacity-50">Pastelería Boutique</p>
        </div>
        <div className="space-y-2 font-['Josefin_Sans'] text-sm tracking-wide">
          {/* DIRECCIÓN CORREGIDA EN FOOTER */}
          <p>11 de Septiembre de 1888, N° 2451, Núñez, CABA</p>
          <p>Take Away & Envíos Personalizados</p>
          {/* WhatsApp real de Tyta +5491130302451 */}
          <a href="https://wa.me/5491130302451" target="_blank" className="pt-4 text-[#EDB2D1] font-bold block hover:brightness-110">@tytapatisserie</a>
        </div>
        <div className="mt-16 pt-8 border-t border-white/10 text-[9px] tracking-widest uppercase opacity-30">
          © 2026 Tyta Patisserie | Excelencia y Calidad en cada bocado.
        </div>
      </footer>
    </main>
  );
}