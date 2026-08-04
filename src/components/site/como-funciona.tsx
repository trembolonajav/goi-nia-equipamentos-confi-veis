import { MessageSquare, FileCheck2, Truck, RotateCcw } from "lucide-react";

const PASSOS = [
  {
    icon: MessageSquare,
    titulo: "1. Você chama",
    texto: "WhatsApp, telefone ou formulário. Diga o equipamento, o prazo e o bairro da obra.",
  },
  {
    icon: FileCheck2,
    titulo: "2. Orçamento rápido",
    texto: "Enviamos valor, condições e disponibilidade. Sem enrolação e sem taxa escondida.",
  },
  {
    icon: Truck,
    titulo: "3. Entrega na obra",
    texto: "Levamos o equipamento testado, com orientação de uso e segurança na entrega.",
  },
  {
    icon: RotateCcw,
    titulo: "4. Retirada no fim",
    texto: "Terminou o prazo? Agendamos a retirada. Precisa estender? Renova em uma mensagem.",
  },
];

export function ComoFunciona() {
  return (
    <section id="como-funciona" className="section-locago bg-surface hairline-top">
      <div className="container-locago">
        <p className="eyebrow">Como funciona</p>
        <h2 className="mt-3 max-w-2xl text-[clamp(1.875rem,3.4vw,2.5rem)] uppercase">
          Do primeiro contato ao equipamento na obra
        </h2>

        <ol className="mt-10 grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
          {PASSOS.map(({ icon: Icon, titulo, texto }) => (
            <li key={titulo} className="card-locago p-6">
              <span className="inline-flex size-11 items-center justify-center rounded-lg border border-border bg-surface-elevated">
                <Icon className="size-5 text-brand" aria-hidden />
              </span>
              <h3 className="mt-4 text-lg uppercase">{titulo}</h3>
              <p className="mt-2 text-sm text-muted-foreground">{texto}</p>
            </li>
          ))}
        </ol>
      </div>
    </section>
  );
}
