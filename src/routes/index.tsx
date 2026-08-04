import { createFileRoute } from "@tanstack/react-router";
import { SiteHeader } from "@/components/site/site-header";
import { Hero } from "@/components/site/hero";
import { BuscaRapida } from "@/components/site/busca-rapida";
import { Equipamentos } from "@/components/site/equipamentos";
import { ComoFunciona } from "@/components/site/como-funciona";
import { Diferenciais } from "@/components/site/diferenciais";
import { Atendimento } from "@/components/site/atendimento";
import { Orcamento } from "@/components/site/orcamento";
import { Faq } from "@/components/site/faq";
import { SiteFooter } from "@/components/site/site-footer";
import { WhatsappFab } from "@/components/site/whatsapp-fab";
import { FAQ_HOME } from "@/lib/faq";
import { EMPRESA } from "@/lib/locago";

const TITLE = "LOCAGO — Aluguel de Equipamentos para Construção em Goiânia";
const DESCRIPTION =
  "Locação de betoneiras, marteletes, compactadores e andaimes em Goiânia e região. Orçamento rápido no WhatsApp, entrega na obra e equipamentos revisados.";

export const Route = createFileRoute("/")({
  component: Index,
  head: () => ({
    meta: [
      { title: TITLE },
      { name: "description", content: DESCRIPTION },
      { property: "og:title", content: TITLE },
      { property: "og:description", content: DESCRIPTION },
      { property: "og:type", content: "website" },
      { property: "og:url", content: "/" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
    links: [{ rel: "canonical", href: "/" }],
    scripts: [
      {
        type: "application/ld+json",
        children: JSON.stringify({
          "@context": "https://schema.org",
          "@type": "LocalBusiness",
          name: "LOCAGO Aluguel de Equipamentos",
          description: DESCRIPTION,
          telephone: EMPRESA.telefoneRaw,
          email: EMPRESA.email,
          areaServed: "Goiânia e região metropolitana - GO",
          address: {
            "@type": "PostalAddress",
            addressLocality: "Goiânia",
            addressRegion: "GO",
            addressCountry: "BR",
          },
        }),
      },
      {
        type: "application/ld+json",
        children: JSON.stringify({
          "@context": "https://schema.org",
          "@type": "FAQPage",
          mainEntity: FAQ_HOME.map((i) => ({
            "@type": "Question",
            name: i.q,
            acceptedAnswer: { "@type": "Answer", text: i.a },
          })),
        }),
      },
    ],
  }),
});

function Index() {
  return (
    <div className="min-h-screen bg-background">
      <SiteHeader />
      <main>
        <Hero />
        <BuscaRapida />
        <Equipamentos />
        <ComoFunciona />
        <Diferenciais />
        <Atendimento />
        <Orcamento />
        <Faq />
      </main>
      <SiteFooter />
      <WhatsappFab />
    </div>
  );
}
