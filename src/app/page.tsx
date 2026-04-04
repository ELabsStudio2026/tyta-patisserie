"use client";

import Image from "next/image";
import Link from "next/link";
import Footer from "@/components/Footer";

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
          
          <div className="flex flex-col md:flex-row gap-6 justify-center items-center mt-4">
            <a 
              href="https://wa.me/5491130302451" 
              target="_blank"
              rel="noopener noreferrer"
              className="bg-white text-[#2B4233] px-10 py-5 rounded-full font-josefin font-bold uppercase tracking-widest hover:scale-105 transition-all shadow-2xl inline-block text-center border-2 border-white"
            >
              Pedir por WhatsApp
            </a>

            <Link 
              href="/tienda" 
              className="bg-[#EDB2D1] text-[#2B4233] px-10 py-5 rounded-full font-josefin font-bold uppercase tracking-widest hover:scale-105 transition-all shadow-2xl inline-block text-center border-2 border-[#EDB2D1]"
            >
              Tienda Online
            </Link>
          </div>
        </div>
      </section>

      {/* 2. SECCIÓN ESPECIALIDADES */}
      <section className="py-24 px-6 max-w-7xl mx-auto bg-white">
        <div className="text-center mb-20 relative">
          <h3 className="text-[#2B4233] text-5xl font-mermaid mb-4 italic">Nuestras Especialidades</h3>
          <div className="w-24 h-1 bg-[#EDB2D1] mx-auto mb-6"></div>
          <p className="text-[#5E7361] font-josefin uppercase tracking-[0.3em] text-xs">Artesanía en cada detalle</p>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-16">
          {/* Pavlovas */}
          <div className="group text-center flex flex-col items-center">
            <div className="relative w-full aspect-square overflow-hidden rounded-full mb-6 border-[12px] border-[#EDB2D1] shadow-xl mx-auto bg-white">
              <Image 
                src="/images/pavlovas-generated.jpg" 
                alt="Pavlovas Tyta" 
                fill
                className="object-cover scale-[2.2] group-hover:scale-[2.35] transition-transform duration-700" 
              />
            </div>
            <h4 className="font-diner text-[#2B4233] text-4xl mb-2">Pavlovas</h4>
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
          </div>
        </div>
      </section>

      {/* 3. TAKE AWAY */}
      <section className="bg-[#F6CDD7] py-24 px-6">
        <div className="max-w-6xl mx-auto bg-white rounded-3xl overflow-hidden shadow-2xl flex flex-col md:flex-row">
          <div className="md:w-1/2 p-12 md:p-16 flex flex-col justify-center">
            <h4 className="text-[#2B4233] text-6xl font-mermaid italic mb-6">Take Away</h4>
            <div className="space-y-4 font-josefin text-[#2B4233] font-bold">
              <p>📍 11 de Septiembre 1888, N° 2451, Núñez, CABA</p>
              <p>🕒 Todos los días - 08:00 a 20:00 hs</p>
            </div>
          </div>
          <div className="md:w-1/2 min-h-[400px] relative">
            <Image src="/images/local.jpg" alt="Local Tyta" fill className="object-cover" />
          </div>
        </div>
      </section>

      <Footer />
    </main>
  );
}