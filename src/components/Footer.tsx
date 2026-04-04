"use client";

export default function Footer() {
  return (
    <footer className="w-full bg-transparent text-center z-20 pb-5">
      <div className="flex flex-col items-center gap-2 px-4">
        
        {/* Créditos en una sola línea compacta */}
        <div className="flex justify-center items-center gap-x-4 text-[#EDB2D1]/30">
          <p className="font-josefin text-[12px] font-black uppercase tracking-[0.2em]">
            © 2026 TYTA PATISSERIE
          </p>
          <span className="text-[6px] opacity-20">|</span>
          <p className="font-josefin text-[12px] font-black uppercase tracking-[0.2em]">
            NUÑEZ CABA, ARGENTINA
          </p>
        </div>
      </div>
    </footer>
  );
}