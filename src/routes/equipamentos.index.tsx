import { createFileRoute, Link } from "@tanstack/react-router";
import { useMemo, useState } from "react";
import { Search, X } from "lucide-react";
import { SiteHeader } from "@/components/site/site-header";
import { SiteFooter } from "@/components/site/site-footer";
import { WhatsappFab } from "@/components/site/whatsapp-fab";
import { EquipCard } from "@/components/site/equip-card";
import { WhatsappIcon } from "@/components/icons/whatsapp";
import { CATEGORIAS, EQUIPAMENTOS, SERVICOS, type Categoria } from "@/lib/catalogo";
import { whatsappLink } from "@/lib/locago";

const TITLE = "Catálogo de Equipamentos para Locação em Goiânia | LOCAGO";
const DESCRIPTION =
  "Catálogo completo de equipamentos para alugar em Goiânia: betoneiras, marteletes, compactadores, andaimes, geradores e mais. Busque por equipamento ou pelo serviço da sua obra.";

type SearchParams = {
  q?: string | undefined;
  categoria?: string | undefined;
  servico?: string | undefined;
};

export const Route = createFileRoute("/equipamentos/")({
  validateSearch: (search: Record<string, unknown>): SearchParams => ({
    q: typeof search["q"] === "string" ? search["q"] : undefined,
    categoria: typeof search["categoria"] === "string" ? search["categoria"] : undefined,
    servico: typeof search["servico"] === "string" ? search["servico"] : undefined,
  }),
  head: () => ({
    meta: [
      { title: TITLE },
      { name: "description", content: DESCRIPTION },
      { property: "og:title", content: TITLE },
      { property: "og:description", content: DESCRIPTION },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: CatalogoPage,
});

const ENERGIAS = ["Elétrico", "Combustão", "Manual"] as const;

function CatalogoPage() {
  const search = Route.useSearch();
  const [q, setQ] = useState(search.q ?? "");
  const [categoria, setCategoria] = useState<string | null>(search.categoria ?? null);
  const [servico, setServico] = useState<string | null>(search.servico ?? null);
  const [energia, setEnergia] = useState<string | null>(null);

  const lista = useMemo(() => {
    const termo = q.trim().toLowerCase();
    return EQUIPAMENTOS.filter((e) => {
      if (categoria && e.categoria !== categoria) return false;
      if (servico && !e.servicos.includes(servico)) return false;
      if (energia && e.energia !== energia) return false;
      if (!termo) return true;
      return [e.nome, e.aplicacao, e.categoria, e.descricao, ...e.servicos, ...e.tags]
        .join(" ")
        .toLowerCase()
        .includes(termo);
    });
  }, [q, categoria, servico, energia]);

  const temFiltro = Boolean(categoria || servico || energia || q.trim());

  const chip = (ativo: boolean) =>
    `rounded-full border px-4 py-2 text-sm transition-colors ${
      ativo
        ? "border-brand bg-primary text-primary-foreground font-semibold"
        : "border-border text-muted-foreground hover:border-brand hover:text-foreground"
    }`;

  return (
    <div className="min-h-screen bg-background">
      <SiteHeader />
      <main>
        <section className="hairline-top bg-surface py-12">
          <div className="container-locago">
            <nav aria-label="Trilha" className="text-sm text-muted-foreground">
              <Link to="/" className="hover:text-foreground">
                Início
              </Link>{" "}
              / <span className="text-foreground">Equipamentos</span>
            </nav>
            <h1 className="mt-3 text-[clamp(2rem,4.4vw,3rem)] uppercase">
              Catálogo de equipamentos
            </h1>
            <p className="mt-3 max-w-2xl text-muted-foreground">
              Encontre pelo nome do equipamento ou pelo serviço que você precisa executar.
              Locação diária, semanal ou mensal, com entrega em Goiânia e região.
            </p>

            <div className="relative mt-6 max-w-xl">
              <Search
                className="pointer-events-none absolute left-4 top-1/2 size-5 -translate-y-1/2 text-muted-foreground"
                aria-hidden
              />
              <label htmlFor="busca-catalogo" className="sr-only">
                Buscar equipamento
              </label>
              <input
                id="busca-catalogo"
                value={q}
                onChange={(e) => setQ(e.target.value)}
                placeholder="Betoneira, martelete, compactador, andaime…"
                className="h-12 w-full rounded-lg border border-border bg-surface-elevated pl-11 pr-4 text-base placeholder:text-muted-foreground"
              />
            </div>
          </div>
        </section>

        <section className="section-locago">
          <div className="container-locago">
            <div className="grid gap-8 lg:grid-cols-[260px_1fr]">
              <aside className="space-y-8">
                <div>
                  <h2 className="text-sm uppercase tracking-[0.18em] text-brand">Categoria</h2>
                  <ul className="mt-3 flex flex-wrap gap-2">
                    {CATEGORIAS.map((c: Categoria) => (
                      <li key={c}>
                        <button
                          type="button"
                          onClick={() => setCategoria(categoria === c ? null : c)}
                          className={chip(categoria === c)}
                        >
                          {c}
                        </button>
                      </li>
                    ))}
                  </ul>
                </div>

                <div>
                  <h2 className="text-sm uppercase tracking-[0.18em] text-brand">
                    Serviço a executar
                  </h2>
                  <ul className="mt-3 flex flex-wrap gap-2">
                    {SERVICOS.map((s) => (
                      <li key={s}>
                        <button
                          type="button"
                          onClick={() => setServico(servico === s ? null : s)}
                          className={chip(servico === s)}
                        >
                          {s}
                        </button>
                      </li>
                    ))}
                  </ul>
                </div>

                <div>
                  <h2 className="text-sm uppercase tracking-[0.18em] text-brand">
                    Alimentação
                  </h2>
                  <ul className="mt-3 flex flex-wrap gap-2">
                    {ENERGIAS.map((e) => (
                      <li key={e}>
                        <button
                          type="button"
                          onClick={() => setEnergia(energia === e ? null : e)}
                          className={chip(energia === e)}
                        >
                          {e}
                        </button>
                      </li>
                    ))}
                  </ul>
                </div>

                {temFiltro && (
                  <button
                    type="button"
                    onClick={() => {
                      setQ("");
                      setCategoria(null);
                      setServico(null);
                      setEnergia(null);
                    }}
                    className="inline-flex min-h-11 items-center gap-2 text-sm font-semibold text-brand"
                  >
                    <X className="size-4" aria-hidden />
                    Limpar filtros
                  </button>
                )}
              </aside>

              <div>
                <p className="text-sm text-muted-foreground">
                  {lista.length} equipamento{lista.length === 1 ? "" : "s"} encontrado
                  {lista.length === 1 ? "" : "s"}
                </p>

                {lista.length > 0 ? (
                  <ul className="mt-5 grid gap-5 sm:grid-cols-2 xl:grid-cols-3">
                    {lista.map((eq) => (
                      <EquipCard key={eq.slug} eq={eq} />
                    ))}
                  </ul>
                ) : (
                  <div className="card-locago mt-5 p-8 text-center">
                    <p className="font-semibold">Não encontramos esse equipamento aqui.</p>
                    <p className="mt-2 text-sm text-muted-foreground">
                      Nossa linha é maior que o catálogo. Fale com a gente e confirmamos a
                      disponibilidade na hora.
                    </p>
                    <a
                      href={whatsappLink(`Olá! Procuro por: ${q || "um equipamento"}. Vocês têm?`)}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="mt-5 inline-flex h-12 items-center justify-center gap-2 rounded-lg bg-primary px-6 font-semibold text-primary-foreground"
                    >
                      <WhatsappIcon className="size-5" />
                      Perguntar no WhatsApp
                    </a>
                  </div>
                )}

                <div className="card-locago mt-10 flex flex-col gap-4 p-6 sm:flex-row sm:items-center sm:justify-between">
                  <div>
                    <p className="text-lg font-semibold">
                      Não sabe qual equipamento escolher?
                    </p>
                    <p className="mt-1 text-sm text-muted-foreground">
                      Diga o serviço que vai executar e indicamos o equipamento e o porte certos.
                    </p>
                  </div>
                  <a
                    href={whatsappLink(
                      "Olá! Não sei qual equipamento usar. O serviço que preciso fazer é: ",
                    )}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex h-12 shrink-0 items-center justify-center gap-2 rounded-lg bg-primary px-6 font-semibold text-primary-foreground"
                  >
                    <WhatsappIcon className="size-5" />
                    Falar com a equipe
                  </a>
                </div>
              </div>
            </div>
          </div>
        </section>
      </main>
      <SiteFooter />
      <WhatsappFab />
    </div>
  );
}
