import { Link } from "@tanstack/react-router";
import { WhatsappIcon } from "@/components/icons/whatsapp";
import type { Equipamento } from "@/lib/catalogo";
import { whatsappLink } from "@/lib/locago";

export function EquipCard({ eq }: { eq: Equipamento }) {
  return (
    <li className="card-locago flex flex-col overflow-hidden">
      <Link
        to="/equipamentos/$slug"
        params={{ slug: eq.slug }}
        className="aspect-[4/3] w-full bg-surface-elevated"
      >
        <img
          src={eq.img}
          alt={eq.nome}
          width={800}
          height={600}
          loading="lazy"
          className="size-full object-cover"
        />
      </Link>
      <div className="flex flex-1 flex-col p-5">
        <p className="text-xs uppercase tracking-[0.14em] text-brand">{eq.categoria}</p>
        <h3 className="mt-1 text-xl uppercase">
          <Link to="/equipamentos/$slug" params={{ slug: eq.slug }}>
            {eq.nome}
          </Link>
        </h3>
        <p className="mt-2 text-sm text-muted-foreground">{eq.aplicacao}</p>

        <ul className="mt-4 space-y-1 text-sm text-muted-foreground">
          {eq.specs.slice(0, 3).map((s) => (
            <li key={s.label} className="flex justify-between gap-3 border-b border-border/60 py-1">
              <span>{s.label}</span>
              <span className="text-foreground">{s.valor}</span>
            </li>
          ))}
        </ul>

        <p className="mt-4 text-sm">
          <span className="text-muted-foreground">Diária, semanal e mensal · </span>
          <span className="font-semibold text-brand">valor sob consulta</span>
        </p>

        <div className="mt-auto flex flex-col gap-2 pt-5 sm:flex-row">
          <Link
            to="/equipamentos/$slug"
            params={{ slug: eq.slug }}
            className="inline-flex min-h-11 flex-1 items-center justify-center rounded-lg border border-border bg-surface-elevated px-4 text-sm font-semibold transition-colors hover:border-brand"
          >
            Ver detalhes
          </Link>
          <a
            href={whatsappLink(
              `Olá! Quero um orçamento de locação: ${eq.nome}. Período: __ · Obra em: __`,
            )}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex min-h-11 flex-1 items-center justify-center gap-2 rounded-lg bg-primary px-4 text-sm font-semibold text-primary-foreground transition-colors hover:bg-brand-light"
          >
            <WhatsappIcon className="size-4" />
            Pedir orçamento
          </a>
        </div>
      </div>
    </li>
  );
}
