import { useState, type FormEvent } from "react";
import { useNavigate } from "@tanstack/react-router";
import { Search } from "lucide-react";
import { SERVICOS } from "@/lib/catalogo";
import { whatsappLink } from "@/lib/locago";

export function BuscaRapida() {
  const navigate = useNavigate();
  const [q, setQ] = useState("");

  function onSubmit(e: FormEvent) {
    e.preventDefault();
    navigate({ to: "/equipamentos", search: { q: q.trim() || undefined } });
  }

  return (
    <section id="busca" className="hairline-top bg-surface py-10">
      <div className="container-locago">
        <h2 className="text-[clamp(1.5rem,2.6vw,2rem)] uppercase">
          Qual equipamento você precisa?
        </h2>
        <form onSubmit={onSubmit} className="mt-4 flex flex-col gap-3 sm:flex-row">
          <div className="relative flex-1">
            <Search
              className="pointer-events-none absolute left-4 top-1/2 size-5 -translate-y-1/2 text-muted-foreground"
              aria-hidden
            />
            <label htmlFor="busca-home" className="sr-only">
              Buscar equipamento
            </label>
            <input
              id="busca-home"
              value={q}
              onChange={(e) => setQ(e.target.value)}
              placeholder="Pesquise por betoneira, martelete, compactador, andaime…"
              className="h-12 w-full rounded-lg border border-border bg-surface-elevated pl-11 pr-4 text-base placeholder:text-muted-foreground"
            />
          </div>
          <button
            type="submit"
            className="inline-flex h-12 items-center justify-center rounded-lg bg-primary px-6 font-semibold text-primary-foreground transition-colors hover:bg-brand-light"
          >
            Buscar equipamentos
          </button>
        </form>

        <div className="mt-4 flex flex-wrap items-center gap-2">
          <span className="text-sm text-muted-foreground">Buscar pelo serviço:</span>
          {SERVICOS.slice(0, 6).map((s) => (
            <button
              key={s}
              type="button"
              onClick={() => navigate({ to: "/equipamentos", search: { servico: s } })}
              className="rounded-full border border-border px-3 py-1 text-xs text-muted-foreground transition-colors hover:border-brand hover:text-foreground"
            >
              {s}
            </button>
          ))}
        </div>

        <p className="mt-4 text-sm text-muted-foreground">
          Não sabe qual equipamento escolher?{" "}
          <a
            href={whatsappLink(
              "Olá! Não sei qual equipamento usar. O serviço que preciso fazer é: ",
            )}
            target="_blank"
            rel="noopener noreferrer"
            className="font-semibold text-brand hover:text-brand-light"
          >
            Fale com nossa equipe →
          </a>
        </p>
      </div>
    </section>
  );
}
