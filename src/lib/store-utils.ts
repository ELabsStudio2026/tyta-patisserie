export function getStoreOperationalStatus(config: any) {
  if (!config) return { isOpen: true, message: "" };

  // 1. PRIORIDAD: INTERRUPTOR MAESTRO (SOS / VACACIONES)
  if (config.store_status === 'forced_closed') {
    return { 
      isOpen: false, 
      message: "Boutique cerrada momentáneamente. Volvemos pronto." 
    };
  }
  
  if (config.store_status === 'forced_open') {
    return { isOpen: true, message: "" };
  }

  // 2. LÓGICA DE HORARIOS AUTOMÁTICOS (Basado en Perfil Negocio)
  const now = new Date();
  const argentinaTime = new Date(now.toLocaleString("en-US", {timeZone: "America/Argentina/Buenos_Aires"}));
  
  const dias = ["Domingo", "Lunes", "Martes", "Miércoles", "Jueves", "Viernes", "Sábado"];
  const nombreDia = dias[argentinaTime.getDay()];
  const horaActual = argentinaTime.getHours();

  const hoy = config.schedule_virtual?.[nombreDia];
  
  if (!hoy) return { isOpen: false, message: "Cerrado por hoy." };
  
  const isOpenByTime = horaActual >= hoy.open && horaActual < hoy.close;

  return {
    isOpen: isOpenByTime,
    message: isOpenByTime ? "" : `Abrimos el ${nombreDia === "Domingo" ? "Lunes" : "próximo día hábil"} a las ${hoy.open}:00 hs`
  };
}