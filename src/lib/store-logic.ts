// src/lib/store-logic.ts
import { supabase } from "./supabase";

export async function getDetailedStoreStatus(config: any) {
  if (!config) return { isOpen: false, message: "" };

  // 1. PRIORIDAD ABSOLUTA: SIEMPRE ABIERTO
  // Usamos == true para capturar el valor sea cual sea el formato que venga de la DB
  if (config.is_always_open == true) {
    return { 
      isOpen: true, 
      message: "¡Boutique abierta! Disfrutá de nuestras delicias." 
    };
  }

  // 2. SEGUNDA PRIORIDAD: SOS Manual (is_closed_manual)
  if (config.is_closed_manual == true) {
    return { 
      isOpen: false, 
      message: "Podés recorrer nuestro catálogo y tentar a tu paladar, pero el carrito se habilitará cuando abramos nuestras puertas nuevamente." 
    };
  }

  // 3. Lógica de Horarios (Solo si lo anterior es false)
  const ahora = new Date();
  const diaSemana = ahora.getDay();
  // Forzamos el formato HH:MM de forma manual para evitar variaciones de navegador
  const horaActual = ahora.getHours().toString().padStart(2, '0') + ":" + 
                     ahora.getMinutes().toString().padStart(2, '0');

  const { data: horarioHoy } = await supabase
    .from('horarios_tienda_online')
    .select('*')
    .eq('nombre_tienda', 'TYTA ARGENTINA')
    .eq('dia_semana', diaSemana)
    .single();

  if (!horarioHoy || horarioHoy.esta_cerrado) {
    return { isOpen: false, message: "Hoy nos encontramos cerrados. ¡Te esperamos mañana!" };
  }

  const { apertura_manana, cierre_manana, apertura_tarde, cierre_tarde } = horarioHoy;

  // Limpiamos los strings de la DB para comparar solo los primeros 5 caracteres (HH:MM)
  const hAmA = apertura_manana?.substring(0, 5);
  const hAmC = cierre_manana?.substring(0, 5);
  const hPmA = apertura_tarde?.substring(0, 5);
  const hPmC = cierre_tarde?.substring(0, 5);

  const estaEnManana = hAmA && hAmC && (horaActual >= hAmA && horaActual <= hAmC);
  const estaEnTarde = hPmA && hPmC && (horaActual >= hPmA && horaActual <= hPmC);

  if (estaEnManana || estaEnTarde) {
    return { isOpen: true, message: "¡Boutique abierta! Disfrutá de nuestras delicias." };
  }

  if (hPmA && horaActual < hPmA && horaActual > (hAmC || "00:00")) {
    return { isOpen: false, message: `Estamos en pausa. Abrimos de nuevo a las ${hPmA}hs.` };
  }

  return { isOpen: false, message: "Boutique cerrada por hoy. ¡Consultá nuestros horarios de mañana!" };
}