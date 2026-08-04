import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";

export const FAQ_ITENS = [
  {
    q: "Como faço para alugar um equipamento?",
    a: "Fale com a gente pelo WhatsApp, telefone ou formulário informando o equipamento, o prazo e o endereço da obra. Respondemos com valor e disponibilidade em poucos minutos no horário comercial.",
  },
  {
    q: "Qual o prazo mínimo de locação?",
    a: "Trabalhamos com diária, semanal e mensal. Quanto maior o prazo, melhor o valor proporcional. O período começa a contar na entrega do equipamento.",
  },
  {
    q: "Vocês entregam na obra?",
    a: "Sim. Fazemos entrega e retirada em Goiânia e região metropolitana. O valor do frete é informado no orçamento, antes de você fechar.",
  },
  {
    q: "Quais documentos são necessários?",
    a: "Documento com foto e comprovante de endereço para pessoa física; CNPJ e dados do responsável para empresa. Em alguns itens pode ser solicitada caução.",
  },
  {
    q: "E se o equipamento apresentar defeito durante o uso?",
    a: "Basta avisar. Se o problema for de funcionamento do equipamento, fazemos a troca ou o reparo sem custo adicional para você.",
  },
  {
    q: "Posso estender o período da locação?",
    a: "Pode. Avise antes do fim do prazo e prorrogamos na mesma condição, conforme a disponibilidade do equipamento.",
  },
];

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
            Se ficou alguma dúvida, é só perguntar no WhatsApp. Respondemos direto, sem script.
          </p>
        </div>

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
      </div>
    </section>
  );
}
