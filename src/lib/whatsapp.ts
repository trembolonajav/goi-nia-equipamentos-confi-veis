export const WHATSAPP_NUMBER = "5562981469409";
export const WHATSAPP_DISPLAY = "(62) 98146-9409";

export function whatsappUrl(message = "Olá! Gostaria de saber mais sobre os equipamentos da LOCAGO.") {
  return `https://wa.me/${WHATSAPP_NUMBER}?text=${encodeURIComponent(message)}`;
}

export function openWhatsApp(message?: string) {
  window.open(whatsappUrl(message), "_blank", "noopener,noreferrer");
}
