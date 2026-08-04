import { Mail, MapPin, Phone } from "lucide-react";
import logo from "@/assets/locago-horizontal.png.asset.json";
import { EMPRESA } from "@/lib/locago";

export function SiteFooter() {
  return (
    <footer className="hairline-top bg-header">
      <div className="container-locago grid gap-10 py-14 md:grid-cols-3">
        <div>
          <img
            src={logo.url}
            alt="LOCAGO — Aluguel de Equipamentos"
            width={890}
            height={220}
            loading="lazy"
            className="h-12 w-auto"
          />
          <p className="mt-4 max-w-xs text-sm text-muted-foreground">{EMPRESA.descricao}.</p>
        </div>

        <nav aria-label="Rodapé">
          <h3 className="text-sm uppercase tracking-[0.18em] text-brand">Navegação</h3>
          <ul className="mt-4 space-y-2 text-sm text-muted-foreground">
            <li>
              <a href="#equipamentos" className="hover:text-foreground">
                Equipamentos
              </a>
            </li>
            <li>
              <a href="#como-funciona" className="hover:text-foreground">
                Como funciona
              </a>
            </li>
            <li>
              <a href="#atendimento" className="hover:text-foreground">
                Área de atendimento
              </a>
            </li>
            <li>
              <a href="#faq" className="hover:text-foreground">
                Dúvidas frequentes
              </a>
            </li>
          </ul>
        </nav>

        <div>
          <h3 className="text-sm uppercase tracking-[0.18em] text-brand">Contato</h3>
          <ul className="mt-4 space-y-3 text-sm text-muted-foreground">
            <li>
              <a
                href={`tel:${EMPRESA.telefoneRaw}`}
                className="inline-flex items-center gap-2 hover:text-foreground"
              >
                <Phone className="size-4 text-brand" aria-hidden />
                {EMPRESA.telefone}
              </a>
            </li>
            <li>
              <a
                href={`mailto:${EMPRESA.email}`}
                className="inline-flex items-center gap-2 hover:text-foreground"
              >
                <Mail className="size-4 text-brand" aria-hidden />
                {EMPRESA.email}
              </a>
            </li>
            <li className="inline-flex items-center gap-2">
              <MapPin className="size-4 text-brand" aria-hidden />
              {EMPRESA.cidade}
            </li>
            <li>{EMPRESA.horario}</li>
          </ul>
        </div>
      </div>

      <div className="hairline-top">
        <div className="container-locago flex flex-col gap-2 py-6 text-xs text-muted-foreground sm:flex-row sm:justify-between">
          <p>© {new Date().getFullYear()} LOCAGO Aluguel de Equipamentos. Todos os direitos reservados.</p>
          <p>Goiânia - GO</p>
        </div>
      </div>
    </footer>
  );
}
