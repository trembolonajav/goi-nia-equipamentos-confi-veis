import { MapPin } from "lucide-react";
import { EMPRESA, REGIOES, whatsappLink } from "@/lib/locago";

export function Atendimento() {
  return (
    <section id="atendimento" className="section-locago bg-surface hairline-top">
      <div className="container-locago grid gap-10 lg:grid-cols-2 lg:items-center">
        <div>
          <p className="eyebrow">Área de atendimento</p>
          <h2 className="mt-3 text-[clamp(1.875rem,3.4vw,2.5rem)] uppercase">
            Goiânia e região metropolitana
          </h2>
          <p className="mt-4 max-w-lg text-muted-foreground">
            Entregamos e retiramos o equipamento direto na obra. Se a sua cidade não estiver na
            lista, consulte: avaliamos o frete caso a caso.
          </p>
          <p className="mt-4 text-sm text-muted-foreground">{EMPRESA.horario}</p>
          <a
            href={whatsappLink("Olá! Vocês atendem na minha região? A obra fica em ")}
            target="_blank"
            rel="noopener noreferrer"
            className="mt-6 inline-flex h-12 items-center rounded-lg bg-primary px-6 font-semibold text-primary-foreground transition-colors hover:bg-brand-light active:bg-brand-dark"
          >
            Consultar minha região
          </a>
        </div>

        <ul className="grid grid-cols-2 gap-3">
          {REGIOES.map((r) => (
            <li
              key={r}
              className="flex min-h-12 items-center gap-2 rounded-lg border border-border bg-surface-elevated px-4 text-sm"
            >
              <MapPin className="size-4 shrink-0 text-brand" aria-hidden />
              {r}
            </li>
          ))}
        </ul>
      </div>
    </section>
  );
}
