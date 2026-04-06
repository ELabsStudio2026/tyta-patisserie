// src/lib/store-logic.ts
import { supabase } from "./supabase";

/**
 * Determina el estado de la tienda consultando la base de datos
 * para validar SOS manual y horarios por día.
 */
export async function getDetailedStoreStatus(config: any) {
  if (!config) return { isOpen: false, message: "" };

  // 1. PRIORIDAD: SOS Manual
  if (config.is_closed_manual) {
    return { 
      isOpen: false, 
      message: "Podés recorrer nuestro catálogo y tentar a tu paladar, pero el carrito se habilitará cuando abramos nuestras puertas nuevamente." 
    };
  }

  // 2. Tiempo actual (Local)
  const ahora = new Date();
  const diaSemana = ahora.getDay(); // 0=Dom, 1=Lun...
  const horaActual = ahora.toLocaleTimeString('en-GB', { hour12: false }).substring(0, 5); // "HH:MM"

  // 3. Consultar la tabla de horarios vinculada
  const { data: horarioHoy } = await supabase
    .from('horarios_tienda_online')
    .select('*')
    .eq('nombre_tienda', 'TYTA ARGENTINA')
    .eq('dia_semana', diaSemana)
    .single();

  if (!horarioHoy || horarioHoy.esta_cerrado) {
    return { isOpen: false, message: "Hoy nos encontramos cerrados. ¡Te esperamos mañana!" };
  }

  // 4. Validación de Turnos (Mañana y Tarde)
  const { apertura_manana, cierre_manana, apertura_tarde, cierre_tarde } = horarioHoy;

  const estaEnManana = apertura_manana && cierre_manana && 
                       (horaActual >= apertura_manana.substring(0, 5) && horaActual <= cierre_manana.substring(0, 5));
  
  const estaEnTarde = apertura_tarde && cierre_tarde && 
                      (horaActual >= apertura_tarde.substring(0, 5) && horaActual <= cierre_tarde.substring(0, 5));

  if (estaEnManana || estaEnTarde) {
    return { isOpen: true, message: "¡Boutique abierta! Disfrutá de nuestras delicias." };
  }

  // 5. Mensaje de pausa si está entre turnos o antes de abrir
  if (apertura_tarde && horaActual < apertura_tarde.substring(0, 5) && horaActual > (cierre_manana || "00:00")) {
    return { isOpen: false, message: `Estamos en pausa. Abrimos de nuevo a las ${apertura_tarde.substring(0, 5)}hs.` };
  }

  return { isOpen: false, message: "Boutique cerrada por hoy. ¡Consultá nuestros horarios de mañana!" };
}