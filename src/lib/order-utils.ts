/**
 * Genera un ID de referencia corto y único (ej: U1ENP)
 */
export const generateOrderRef = (): string => {
  const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
  let result = '';
  for (let i = 0; i < 5; i++) {
    result += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return result;
};

/**
 * Construye el mensaje de WhatsApp con el formato oficial de Tyta Patisserie
 * Nota: Se utiliza concatenación con + para máxima compatibilidad de emojis.
 */
export const formatTytaWhatsAppMessage = (
  customerName: string,
  ref: string,
  items: any[],
  totalAmount: number,
  deliveryType: string
): string => {
  const detail = items.map(item => "• " + item.name + " (x" + item.quantity + ")").join('\n');
  const totalText = (totalAmount / 100).toLocaleString('es-AR');
  const modoEntrega = deliveryType.includes("Retiro") ? "Retiro" : "Envío";

  return (
    "🧁 *Tyta Patisserie • Nuevo Pedido*\n" +
    "────────────────────\n" +
    "*Cliente:* " + customerName + "\n" +
    "*Ref:* `" + ref + "`\n\n" +
    "*Detalle del pedido:*\n" +
    detail + "\n\n" +
    "💰 *Total: $ " + totalText + "*\n" +
    "🏪 *Modo:* " + modoEntrega + "\n" +
    "────────────────────\n" +
    "🔗 *Seguí tu pedido en vivo aquí:*\n" +
    "https://tytapatisserie.com.ar/pedido/" + ref + "\n\n" +
    "Hola Susana, ¿me confirmás disponibilidad para coordinar el pago?"
  );
};

/**
 * Limpia y formatea el número de teléfono para WhatsApp (Prefijo 549 para Argentina)
 */
export const formatWhatsAppNumber = (rawNumber: string): string => {
  let cleanNumber = String(rawNumber).replace(/\D/g, '');
  if (cleanNumber.length === 10 && cleanNumber.startsWith('11')) {
    cleanNumber = "549" + cleanNumber;
  }
  return cleanNumber;
};