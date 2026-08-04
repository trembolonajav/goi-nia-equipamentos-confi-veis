import { createFileRoute, Link } from "@tanstack/react-router";
import { SiteHeader } from "@/components/site/site-header";
import { SiteFooter } from "@/components/site/site-footer";
import { WhatsappFab } from "@/components/site/whatsapp-fab";
import { WhatsappIcon } from "@/components/icons/whatsapp";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { FAQ_ITENS } from "@/lib/faq";
import { whatsappLink } from "@/lib/locago";

const TITLE = "Dúvidas sobre Aluguel de Equipamentos | LOCAGO Goiânia";
const DESCRIPTION =
  "Preço, prazo, entrega e frete, documentos, caução, defeito no equipamento e responsabilidade por mau uso: todas as regras da locação na LOCAGO, em Goiânia.";

export const Route = createFileRoute("/duvidas")({
  head: () => ({
    meta: [
      { title: TITLE },
      { name: "description", content: DESCRIPTION },
      { property: "og:title", content: TITLE },
      { property: "og:description", content: DESCRIPTION },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
    scripts: [
      {
        type: "application/ld+json",
        children: JSON.stringify({
          "@context": "https://schema.org",
          "@type": "FAQPage",
          mainEntity: FAQ_ITENS.map((i) => ({
            "@type": "Question",
            name: i.q,
            acceptedAnswer: { "@type": "Answer", text: i.a },
          })),
        }),
      },
    ],
  }),
  component: DuvidasPage,
});

function DuvidasPage() {
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
              / <span className="text-foreground">Dúvidas</span>
            </nav>
            <h1 className="mt-3 text-[clamp(2rem,4.4vw,3rem)] uppercase">Dúvidas frequentes</h1>
            <p className="mt-3 max-w-2xl text-muted-foreground">
              Como alugar, valores, prazos, entrega, documentos e as regras em caso de defeito ou
              dano. Se ficar alguma dúvida, chame no WhatsApp — respondemos direto.
            </p>
          </div>
        </section>

        <section className="section-locago">
          <div className="container-locago grid gap-10 lg:grid-cols-[1.4fr_0.6fr] lg:items-start">
            <Accordion type="single" collapsible className="w-full">
              {FAQ_ITENS.map((item, i) => (
                <AccordionItem key={item.q} value={`item-${i}`} className="border-border">
                  <AccordionTrigger className="py-5 text-left text-base font-semibold hover:no-underline">
                    {item.q}
                  </AccordionTrigger>
                  <AccordionContent className="text-muted-foreground">{item.a}</AccordionContent>
                </AccordionItem>
              ))}
            </Accordion>

            <aside className="space-y-5">
              <div className="card-locago p-6">
                <h2 className="text-lg uppercase">Defeito, mau uso e danos</h2>
                <p className="mt-3 text-sm text-muted-foreground">
                  Caso o equipamento apresente falha ou pare de funcionar durante a locação, o
                  cliente deve interromper o uso e comunicar imediatamente a LOCAGO. Quando o
                  problema não estiver relacionado ao uso inadequado, a empresa presta assistência
                  ou realiza a substituição do equipamento com a maior brevidade possível,
                  conforme disponibilidade.
                </p>
                <p className="mt-3 text-sm text-muted-foreground">
                  Danos decorrentes de mau uso, negligência, operação em desacordo com as
                  orientações, quedas, sobrecarga, perda ou avarias são de responsabilidade do
                  cliente, conforme as condições do contrato de locação — incluindo os custos de
                  manutenção, reposição de peças e o período em que o equipamento ficar
                  indisponível para locação.
                </p>
                <p className="mt-3 text-sm font-semibold">
                  Não tente desmontar ou reparar o equipamento sem autorização da LOCAGO.
                </p>
              </div>

              <div className="card-locago p-6">
                <h2 className="text-lg uppercase">Ainda com dúvida?</h2>
                <p className="mt-2 text-sm text-muted-foreground">
                  Fale com quem entende do equipamento e resolve na hora.
                </p>
                <a
                  href={whatsappLink("Olá! Tenho uma dúvida sobre a locação: ")}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="mt-4 inline-flex h-12 w-full items-center justify-center gap-2 rounded-lg bg-primary px-6 font-semibold text-primary-foreground transition-colors hover:bg-brand-light"
                >
                  <WhatsappIcon className="size-5" />
                  Perguntar no WhatsApp
                </a>
                <Link
                  to="/equipamentos"
                  className="mt-3 inline-flex h-12 w-full items-center justify-center rounded-lg border border-border bg-surface-elevated px-6 font-semibold transition-colors hover:border-brand"
                >
                  Ver catálogo
                </Link>
              </div>
            </aside>
          </div>
        </section>
      </main>
      <SiteFooter />
      <WhatsappFab />
    </div>
  );
}
