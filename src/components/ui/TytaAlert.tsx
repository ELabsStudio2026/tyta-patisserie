"use client";

interface TytaAlertProps {
  alert: {
    isOpen: boolean; // Antes decía 'show'
    type: "success" | "danger" | "warning" | "info";
    title: string;
    message: string;
    isBinary?: boolean; // Añadido
    onConfirm?: () => void;
  };
  onCancel: () => void;
}

export default function TytaAlert({ alert, onCancel }: TytaAlertProps) {
  // Sincronizado con 'isOpen' del Hook
  if (!alert.isOpen) return null;

  const colors = {
    success: "text-[#2B4233]",
    danger: "text-red-600",
    warning: "text-amber-600",
    info: "text-[#2B4233]",
  };

  return (
    <div className="fixed inset-0 z-[999] flex items-center justify-center p-6 bg-[#2B4233]/30 backdrop-blur-md animate-in fade-in duration-300">
      <div className="bg-white w-full max-w-[380px] rounded-[3.5rem] p-10 shadow-2xl border border-[#EDB2D1]/20 flex flex-col items-center text-center animate-in zoom-in-95 duration-300">
        
        <h3 className={`font-diner text-3xl uppercase mb-3 ${colors[alert.type]}`}>
          {alert.title}
        </h3>

        <p className="text-[10px] font-black uppercase tracking-[0.1em] text-[#2B4233]/60 leading-relaxed mb-8 max-w-[220px]">
          {alert.message}
        </p>

        <div className="flex flex-col w-full gap-3">
          {/* Si es binario (borrar producto, etc), mostramos Confirmar/Cancelar */}
          {alert.isBinary ? (
            <>
              <button
                onClick={alert.onConfirm}
                className="w-full bg-[#2B4233] text-[#EDB2D1] py-4 rounded-full text-[9px] font-black uppercase tracking-widest shadow-lg hover:scale-105 transition-all"
              >
                Confirmar
              </button>
              <button
                onClick={onCancel}
                className="w-full text-[#2B4233]/30 py-2 text-[8px] font-black uppercase tracking-widest hover:text-[#2B4233] transition-colors"
              >
                Cancelar
              </button>
            </>
          ) : (
            /* Si es un aviso (success, info), mostramos solo "Entendido" */
            <button
              onClick={onCancel}
              className="w-full bg-[#2B4233] text-[#EDB2D1] py-4 rounded-full text-[9px] font-black uppercase tracking-widest shadow-lg hover:scale-105 transition-all"
            >
              Entendido
            </button>
          )}
        </div>
      </div>
    </div>
  );
}