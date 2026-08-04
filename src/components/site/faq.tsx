import { Link } from "@tanstack/react-router";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { FAQ_HOME } from "@/lib/faq";

export function Faq() {
  return (
    <section id="faq" className="section-locago">
      <div className="container-locago grid gap-10 lg:grid-cols-[0.8fr_1.2fr]">
        <div>
          <p className="eyebrow">Dúvidas frequentes</p>
          <h2 className="mt-3 text-[clamp(1.875rem,3.4vw,2.5rem)] uppercase">
            Tudo claro antes de fechar
          </h2>
          <p className="mt-4 text-muted-foreground">
            Preço, prazo, entrega, documentos e o que fazer se o equipamento apresentar defeito.
          </p>
          <Link
            to="/duvidas"
            className="mt-6 inline-flex min-h-12 items-center rounded-lg border border-border bg-surface-elevated px-6 font-semibold transition-colors hover:border-brand"
          >
            Ver todas as dúvidas
          </Link>
        </div>

        <Accordion type="single" collapsible className="w-full">
          {FAQ_HOME.map((item, i) => (
            <AccordionItem key={item.q} value={`item-${i}`} className="border-border">
              <AccordionTrigger className="py-5 text-left text-base font-semibold hover:no-underline">
                {item.q}
              </AccordionTrigger>
              <AccordionContent className="text-muted-foreground">{item.a}</AccordionContent>
            </AccordionItem>
          ))}
        </Accordion>
      </div>
    </section>
  );
}
