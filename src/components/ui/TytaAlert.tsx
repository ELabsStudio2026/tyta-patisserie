"use client";
import React from "react";

interface TytaAlertProps {
  alert: { 
    isOpen: boolean; 
    type: string; 
    title: string; 
    message: string; 
    isBinary: boolean; 
    onConfirm: () => void 
  };
  onCancel: () => void;
}

export default function TytaAlert({ alert, onCancel }: TytaAlertProps) {
  if (!alert.isOpen) return null;

  // Eliminamos solo el signo de pregunta de la izquierda para simplificar
  const simplifiedTitle = alert.title.replace(/^¿/, "").trim();

  return (
    <div className="fixed inset-0 z-[999] flex items-center justify-center p-4 bg-[#2B4233]/15 backdrop-blur-[2px] animate-in fade-in duration-500">
      <div className="bg-[#FDFBF7] w-full max-w-[340px] rounded-[3rem] p-8 md:p-10 shadow-2xl border border-[#EDB2D1]/10 animate-in zoom-in-95">
        
        {/* TÍTULO: Un solo bloque de texto centrado directamente */}
        <div className="w-full text-center mb-8">
          <h3 className="font-diner text-4xl md:text-5xl text-[#2B4233] uppercase leading-[1.1] tracking-tighter w-full">
            {simplifiedTitle}
          </h3>
        </div>

        {/* MENSAJE: Con tipografía Josefin para legibilidad boutique */}
        <div className="space-y-6 mb-10 text-center px-4">
          <p className="font-josefin text-[14px] font-medium leading-relaxed text-[#2B4233]">
            {alert.message}
          </p>
          
          {alert.isBinary && (
            <div className="flex flex-col items-center">
              <div className="w-8 h-[1px] bg-[#EDB2D1]/30 mb-4" />
              <p className="font-josefin text-[10px] font-black text-[#2B4233]/40 tracking-[0.2em] uppercase">
                ¿Deseas continuar?
              </p>
            </div>
          )}
        </div>

        {/* BOTONES: SÍ / NO */}
        <div className="flex flex-row justify-center items-center gap-3 w-full">
          <button 
            onClick={() => { alert.onConfirm(); onCancel(); }}
            className="flex-1 py-4 bg-[#2B4233] text-[#EDB2D1] rounded-full text-[10px] font-black uppercase tracking-[0.3em] shadow-lg active:scale-95 transition-all"
          >
            SÍ
          </button>
          
          {alert.isBinary && (
            <button 
              onClick={onCancel}
              className="flex-1 py-4 bg-white border border-gray-100 text-[#2B4233]/40 rounded-full text-[10px] font-black uppercase tracking-[0.3em] active:scale-95 transition-all"
            >
              NO
            </button>
          )}
        </div>
      </div>
    </div>
  );
}