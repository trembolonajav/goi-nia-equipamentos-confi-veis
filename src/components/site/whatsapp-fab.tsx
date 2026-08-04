import { MessageCircle } from "lucide-react";
import { whatsappLink } from "@/lib/locago";

export function WhatsappFab() {
  return (
    <a
      href={whatsappLink("Olá! Quero um orçamento de aluguel de equipamentos na LOCAGO.")}
      target="_blank"
      rel="noopener noreferrer"
      aria-label="Falar no WhatsApp"
      className="fixed bottom-5 right-5 z-50 inline-flex size-14 items-center justify-center rounded-full bg-primary text-primary-foreground shadow-[0_12px_32px_rgba(0,0,0,0.22)] transition-colors hover:bg-brand-light active:bg-brand-dark"
    >
      <MessageCircle className="size-7" aria-hidden />
    </a>
  );
}
