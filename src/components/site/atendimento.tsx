import { MapPin, Truck, Clock, PackageCheck, UserCheck } from "lucide-react";
import { EMPRESA, REGIOES, whatsappLink } from "@/lib/locago";

const INFOS = [
  { icon: Clock, titulo: "Prazo médio", texto: "Entrega no mesmo dia ou no dia seguinte à confirmação do orçamento." },
  { icon: Truck, titulo: "Como o frete é calculado", texto: "Por distância até a obra e porte do equipamento — informado no orçamento, antes de fechar." },
  { icon: PackageCheck, titulo: "Retirada na loja", texto: "Você pode retirar e devolver na loja, sem custo de frete, em veículo adequado ao equipamento." },
  { icon: UserCheck, titulo: "Quem recebe", texto: "Alguém responsável precisa receber, conferir e assinar o comprovante na obra." },
];

export function Atendimento() {
  return (
    <section id="entrega" className="section-locago bg-surface hairline-top">
      <div className="container-locago grid gap-10 lg:grid-cols-2 lg:items-start">
        <div>
          <p className="eyebrow">Entrega e retirada</p>
          <h2 className="mt-3 text-[clamp(1.875rem,3.4vw,2.5rem)] uppercase">
            Goiânia e região metropolitana
          </h2>
          <p className="mt-4 max-w-lg text-muted-foreground">
            Levamos e buscamos o equipamento direto na obra. Se a sua cidade não estiver na
            lista, consulte: avaliamos o frete caso a caso.
          </p>
          <p className="mt-4 text-sm text-muted-foreground">{EMPRESA.horario}</p>

          <ul className="mt-6 grid gap-4 sm:grid-cols-2">
            {INFOS.map(({ icon: Icon, titulo, texto }) => (
              <li key={titulo}>
                <p className="flex items-center gap-2 font-semibold">
                  <Icon className="size-4 text-brand" aria-hidden />
                  {titulo}
                </p>
                <p className="mt-1 text-sm text-muted-foreground">{texto}</p>
              </li>
            ))}
          </ul>

          <a
            href={whatsappLink("Olá! Vocês atendem na minha região? A obra fica em ")}
            target="_blank"
            rel="noopener noreferrer"
            className="mt-8 inline-flex h-12 items-center rounded-lg bg-primary px-6 font-semibold text-primary-foreground transition-colors hover:bg-brand-light active:bg-brand-dark"
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
