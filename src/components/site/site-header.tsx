import { useEffect, useState } from "react";
import { Menu, X, Phone } from "lucide-react";
import logo from "@/assets/locago-horizontal.png.asset.json";
import { EMPRESA, whatsappLink } from "@/lib/locago";

const LINKS = [
  { href: "#equipamentos", label: "Equipamentos" },
  { href: "#como-funciona", label: "Como funciona" },
  { href: "#diferenciais", label: "Por que a LOCAGO" },
  { href: "#atendimento", label: "Atendimento" },
  { href: "#faq", label: "Dúvidas" },
];

export function SiteHeader() {
  const [open, setOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 8);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  return (
    <header
      className={`sticky top-0 z-50 bg-header/95 backdrop-blur-[2px] transition-colors ${
        scrolled ? "border-b border-border" : "border-b border-transparent"
      }`}
    >
      <div className="container-locago flex h-16 items-center justify-between gap-4 lg:h-[72px]">
        <a href="#top" className="flex items-center" aria-label={`${EMPRESA.nome} — início`}>
          <img
            src={logo.url}
            alt="LOCAGO — Aluguel de Equipamentos"
            width={200}
            height={100}
            className="h-11 w-auto lg:h-14"
          />
        </a>

        <nav className="hidden items-center gap-7 lg:flex" aria-label="Navegação principal">
          {LINKS.map((l) => (
            <a
              key={l.href}
              href={l.href}
              className="text-sm font-medium text-muted-foreground transition-colors hover:text-foreground"
            >
              {l.label}
            </a>
          ))}
        </nav>

        <div className="hidden items-center gap-3 lg:flex">
          <a
            href={`tel:${EMPRESA.telefoneRaw}`}
            className="inline-flex items-center gap-2 text-sm font-semibold text-foreground"
          >
            <Phone className="size-4 text-brand" aria-hidden />
            {EMPRESA.telefone}
          </a>
          <a
            href={whatsappLink("Olá! Quero um orçamento de aluguel de equipamentos.")}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex h-12 items-center rounded-lg bg-primary px-6 text-sm font-semibold text-primary-foreground transition-colors hover:bg-brand-light active:bg-brand-dark"
          >
            Pedir orçamento
          </a>
        </div>

        <button
          type="button"
          onClick={() => setOpen((v) => !v)}
          aria-expanded={open}
          aria-label={open ? "Fechar menu" : "Abrir menu"}
          className="inline-flex size-11 items-center justify-center rounded-lg border border-border bg-surface-elevated lg:hidden"
        >
          {open ? <X className="size-5" /> : <Menu className="size-5" />}
        </button>
      </div>

      {open && (
        <div className="border-t border-border bg-header lg:hidden">
          <nav className="container-locago flex flex-col py-2" aria-label="Navegação mobile">
            {LINKS.map((l) => (
              <a
                key={l.href}
                href={l.href}
                onClick={() => setOpen(false)}
                className="min-h-12 py-3 text-base font-medium text-muted-foreground"
              >
                {l.label}
              </a>
            ))}
            <a
              href={whatsappLink("Olá! Quero um orçamento de aluguel de equipamentos.")}
              target="_blank"
              rel="noopener noreferrer"
              className="my-3 inline-flex h-12 items-center justify-center rounded-lg bg-primary px-6 font-semibold text-primary-foreground"
            >
              Pedir orçamento no WhatsApp
            </a>
          </nav>
        </div>
      )}
    </header>
  );
}
