// src/lib/store-logic-2.ts

/**
 * LÓGICA DE LABORATORIO: Solo SOS Manual
 * Esta versión ignora los horarios para que puedas probar 
 * el Realtime a cualquier hora del día.
 */
export function checkStoreClosed(config: any): boolean {
  if (!config) return false; 

  // RETORNA ÚNICAMENTE EL ESTADO DEL BOTÓN MANUAL
  // Si is_closed_manual es true -> devuelve true (Luz Roja)
  // Si is_closed_manual es false -> devuelve false (Luz Verde)
  return config.is_closed_manual === true;
}