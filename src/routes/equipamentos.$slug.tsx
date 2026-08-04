import { createFileRoute, Link, notFound } from "@tanstack/react-router";
import { Check, AlertTriangle, Truck, FileText } from "lucide-react";
import { SiteHeader } from "@/components/site/site-header";
import { SiteFooter } from "@/components/site/site-footer";
import { WhatsappFab } from "@/components/site/whatsapp-fab";
import { EquipCard } from "@/components/site/equip-card";
import { WhatsappIcon } from "@/components/icons/whatsapp";
import { EQUIPAMENTOS, getEquipamento, type Equipamento } from "@/lib/catalogo";
import { EMPRESA, whatsappLink } from "@/lib/locago";

export const Route = createFileRoute("/equipamentos/$slug")({
  loader: ({ params }) => {
    const eq = getEquipamento(params.slug);
    if (!eq) throw notFound();
    return { eq };
  },
  head: ({ loaderData }) => {
    if (!loaderData) {
      return {
        meta: [{ title: "Equipamento não encontrado | LOCAGO" }, { name: "robots", content: "noindex" }],
      };
    }
    const title = `Aluguel de ${loaderData.eq.nome} em Goiânia | LOCAGO`;
    const description = `${loaderData.eq.aplicacao} Locação diária, semanal e mensal em Goiânia e região, com entrega na obra e equipamento revisado.`;
    return {
      meta: [
        { title },
        { name: "description", content: description },
        { property: "og:title", content: title },
        { property: "og:description", content: description },
        { property: "og:type", content: "product" },
        { name: "twitter:card", content: "summary_large_image" },
      ],
    };
  },
  notFoundComponent: EquipNotFound,
  component: EquipamentoDetalhe,
});

function EquipNotFound() {
  return (
    <div className="min-h-screen bg-background">
      <SiteHeader />
      <main className="container-locago section-locago text-center">
        <h1 className="text-3xl uppercase">Equipamento não encontrado</h1>
        <p className="mt-3 text-muted-foreground">
          Esse item não está no catálogo. Veja a lista completa ou fale com a gente.
        </p>
        <Link
          to="/equipamentos"
          className="mt-6 inline-flex h-12 items-center rounded-lg bg-primary px-6 font-semibold text-primary-foreground"
        >
          Ver catálogo
        </Link>
      </main>
      <SiteFooter />
    </div>
  );
}

function EquipamentoDetalhe() {
  const { eq } = Route.useLoaderData() as { eq: Equipamento };
  const relacionados = eq.relacionados
    .map((s) => EQUIPAMENTOS.find((e) => e.slug === s))
    .filter((e): e is NonNullable<typeof e> => Boolean(e));

  const msg = whatsappLink(
    `Olá! Quero um orçamento de locação:\nEquipamento: ${eq.nome}\nPeríodo: \nObra em: `,
  );

  return (
    <div className="min-h-screen bg-background">
      <SiteHeader />
      <main>
        <section className="hairline-top bg-surface py-10">
          <div className="container-locago">
            <nav aria-label="Trilha" className="text-sm text-muted-foreground">
              <Link to="/" className="hover:text-foreground">
                Início
              </Link>{" "}
              /{" "}
              <Link to="/equipamentos" className="hover:text-foreground">
                Equipamentos
              </Link>{" "}
              / <span className="text-foreground">{eq.nome}</span>
            </nav>
          </div>
        </section>

        <section className="section-locago">
          <div className="container-locago grid gap-10 lg:grid-cols-[1.1fr_0.9fr]">
            <div className="card-locago overflow-hidden">
              <img
                src={eq.img}
                alt={eq.nome}
                width={800}
                height={600}
                className="aspect-[4/3] w-full object-cover"
              />
            </div>

            <div>
              <p className="eyebrow">{eq.categoria}</p>
              <h1 className="mt-2 text-[clamp(1.875rem,4vw,2.75rem)] uppercase">{eq.nome}</h1>
              <p className="mt-4 text-muted-foreground">{eq.descricao}</p>

              <div className="card-locago mt-6 p-5">
                <h2 className="text-sm uppercase tracking-[0.18em] text-brand">Valores</h2>
                <ul className="mt-3 space-y-2 text-sm">
                  {["Diária", "Semanal", "Mensal"].map((p) => (
                    <li key={p} className="flex justify-between border-b border-border/60 py-1">
                      <span className="text-muted-foreground">{p}</span>
                      <span className="font-semibold">Sob consulta</span>
                    </li>
                  ))}
                </ul>
                <p className="mt-3 text-xs text-muted-foreground">
                  O valor depende do modelo, do período e do frete até a obra. Enviamos o
                  orçamento fechado em minutos no horário comercial, sem taxa escondida.
                </p>
                <a
                  href={msg}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="mt-5 inline-flex h-12 w-full items-center justify-center gap-2 rounded-lg bg-primary px-6 font-semibold text-primary-foreground transition-colors hover:bg-brand-light"
                >
                  <WhatsappIcon className="size-5" />
                  Pedir orçamento deste equipamento
                </a>
                <a
                  href={`tel:${EMPRESA.telefoneRaw}`}
                  className="mt-3 inline-flex h-12 w-full items-center justify-center rounded-lg border border-border bg-surface-elevated px-6 font-semibold transition-colors hover:border-brand"
                >
                  Ligar {EMPRESA.telefone}
                </a>
              </div>

              <ul className="mt-6 space-y-2 text-sm text-muted-foreground">
                <li className="flex items-center gap-2">
                  <Truck className="size-4 text-brand" aria-hidden />
                  Entrega e retirada em Goiânia e região — ou retirada na loja
                </li>
                <li className="flex items-center gap-2">
                  <FileText className="size-4 text-brand" aria-hidden />
                  Documento com foto e comprovante de endereço (ou CNPJ, para empresa)
                </li>
              </ul>
            </div>
          </div>
        </section>

        <section className="section-locago bg-surface hairline-top">
          <div className="container-locago grid gap-10 lg:grid-cols-2">
            <div>
              <h2 className="text-2xl uppercase">Para que serve</h2>
              <p className="mt-3 text-muted-foreground">{eq.aplicacao}</p>
              <p className="mt-3 flex gap-2 text-sm text-muted-foreground">
                <AlertTriangle className="mt-0.5 size-4 shrink-0 text-warning" aria-hidden />
                {eq.naoIndicado}
              </p>

              <h2 className="mt-8 text-2xl uppercase">Especificações</h2>
              <ul className="mt-3 space-y-2 text-sm">
                {eq.specs.map((s) => (
                  <li key={s.label} className="flex justify-between border-b border-border/60 py-2">
                    <span className="text-muted-foreground">{s.label}</span>
                    <span className="font-medium">{s.valor}</span>
                  </li>
                ))}
                <li className="flex justify-between border-b border-border/60 py-2">
                  <span className="text-muted-foreground">Alimentação</span>
                  <span className="font-medium">{eq.energia}</span>
                </li>
              </ul>

              <h2 className="mt-8 text-2xl uppercase">Acessórios inclusos</h2>
              <ul className="mt-3 space-y-2 text-sm text-muted-foreground">
                {eq.acessorios.map((a) => (
                  <li key={a} className="flex items-center gap-2">
                    <Check className="size-4 text-brand" aria-hidden />
                    {a}
                  </li>
                ))}
              </ul>
            </div>

            <div>
              <h2 className="text-2xl uppercase">Requisitos no local</h2>
              <ul className="mt-3 space-y-2 text-sm text-muted-foreground">
                {eq.requisitos.map((r) => (
                  <li key={r} className="flex items-start gap-2">
                    <Check className="mt-0.5 size-4 shrink-0 text-brand" aria-hidden />
                    {r}
                  </li>
                ))}
              </ul>

              <h2 className="mt-8 text-2xl uppercase">Cuidados de uso</h2>
              <ul className="mt-3 space-y-2 text-sm text-muted-foreground">
                {eq.cuidados.map((c) => (
                  <li key={c} className="flex items-start gap-2">
                    <AlertTriangle className="mt-0.5 size-4 shrink-0 text-warning" aria-hidden />
                    {c}
                  </li>
                ))}
              </ul>

              <div className="card-locago mt-8 p-5">
                <h3 className="text-lg uppercase">Defeito durante a locação</h3>
                <p className="mt-2 text-sm text-muted-foreground">
                  Se o equipamento apresentar falha ou parar de funcionar, interrompa o uso e
                  comunique imediatamente a LOCAGO. Quando o problema não estiver relacionado ao
                  uso inadequado, prestamos assistência ou substituímos o equipamento com a maior
                  brevidade possível, conforme disponibilidade. Danos causados por mau uso,
                  negligência, operação em desacordo com as orientações, quedas, sobrecarga, perda
                  ou avarias são de responsabilidade do cliente, conforme o contrato de locação.
                  Não tente desmontar ou reparar o equipamento sem autorização da LOCAGO.
                </p>
              </div>
            </div>
          </div>
        </section>

        {relacionados.length > 0 && (
          <section className="section-locago">
            <div className="container-locago">
              <h2 className="text-2xl uppercase">Costuma ser alugado junto</h2>
              <ul className="mt-6 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
                {relacionados.map((r) => (
                  <EquipCard key={r.slug} eq={r} />
                ))}
              </ul>
            </div>
          </section>
        )}
      </main>
      <SiteFooter />
      <WhatsappFab />
    </div>
  );
}
