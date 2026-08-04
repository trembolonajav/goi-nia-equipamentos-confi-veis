import { useEffect, useState } from "react";
import { Link } from "@tanstack/react-router";
import { Menu, X, Phone } from "lucide-react";
import logo from "@/assets/locago-horizontal.png.asset.json";
import { WhatsappIcon } from "@/components/icons/whatsapp";
import { EMPRESA, whatsappLink } from "@/lib/locago";

const LINKS = [
  { href: "/equipamentos", label: "Equipamentos" },
  { href: "/#como-funciona", label: "Como funciona" },
  { href: "/#diferenciais", label: "Vantagens" },
  { href: "/#entrega", label: "Entrega e retirada" },
  { href: "/duvidas", label: "Dúvidas" },
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
      <div
        className={`container-locago flex items-center justify-between gap-4 transition-[height] ${
          scrolled ? "h-14 lg:h-16" : "h-16 lg:h-[72px]"
        }`}
      >
        <Link to="/" className="flex items-center" aria-label={`${EMPRESA.nome} — início`}>
          <img
            src={logo.url}
            alt="LOCAGO — Aluguel de Equipamentos"
            width={890}
            height={220}
            className={`w-auto transition-[height] ${scrolled ? "h-8 lg:h-9" : "h-9 lg:h-11"}`}
          />
        </Link>

        <nav className="hidden items-center gap-6 lg:flex" aria-label="Navegação principal">
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
            className="inline-flex h-11 items-center gap-2 rounded-lg bg-primary px-5 text-sm font-semibold text-primary-foreground transition-colors hover:bg-brand-light active:bg-brand-dark"
          >
            <WhatsappIcon className="size-5" />
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
              href={`tel:${EMPRESA.telefoneRaw}`}
              className="inline-flex min-h-12 items-center gap-2 py-3 text-base font-semibold"
            >
              <Phone className="size-4 text-brand" aria-hidden />
              {EMPRESA.telefone}
            </a>
            <a
              href={whatsappLink("Olá! Quero um orçamento de aluguel de equipamentos.")}
              target="_blank"
              rel="noopener noreferrer"
              className="my-3 inline-flex h-12 items-center justify-center gap-2 rounded-lg bg-primary px-6 font-semibold text-primary-foreground"
            >
              <WhatsappIcon className="size-5" />
              Pedir orçamento no WhatsApp
            </a>
          </nav>
        </div>
      )}
    </header>
  );
}
