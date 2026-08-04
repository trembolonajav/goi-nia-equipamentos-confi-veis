import { MessageCircle, ShieldCheck, Truck, Clock } from "lucide-react";
import hero from "@/assets/hero-obra.jpg";
import { EMPRESA, whatsappLink } from "@/lib/locago";

const SELOS = [
  { icon: Clock, label: "Orçamento em até 15 min" },
  { icon: Truck, label: "Entrega e retirada na obra" },
  { icon: ShieldCheck, label: "Equipamentos revisados" },
];

export function Hero() {
  return (
    <section id="top" className="relative isolate overflow-hidden">
      <img
        src={hero}
        alt="Obra em Goiânia com betoneira em operação"
        width={1920}
        height={1080}
        fetchPriority="high"
        className="absolute inset-0 -z-10 size-full object-cover"
      />
      <div
        aria-hidden
        className="absolute inset-0 -z-10 bg-[linear-gradient(90deg,#0B0D0EF2_0%,#0B0D0ED9_55%,#0B0D0E99_100%)]"
      />

      <div className="container-locago flex min-h-[560px] flex-col justify-center py-16 lg:min-h-[660px] lg:py-24">
        <p className="eyebrow">Locação de equipamentos · {EMPRESA.cidade}</p>
        <h1 className="mt-4 max-w-3xl text-[clamp(2.25rem,5.5vw,4rem)] uppercase">
          Equipamento certo na obra,{" "}
          <span className="text-brand">no dia que você precisa</span>
        </h1>
        <p className="mt-5 max-w-xl text-lg text-muted-foreground">
          Betoneiras, marteletes, compactadores, andaimes e muito mais para locação diária,
          semanal ou mensal em Goiânia e região. Atendimento direto, sem burocracia.
        </p>

        <div className="mt-8 flex flex-col gap-3 sm:flex-row">
          <a
            href={whatsappLink(
              "Olá! Vi o site da LOCAGO e quero um orçamento de aluguel de equipamentos.",
            )}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex h-12 items-center justify-center gap-2 rounded-lg bg-primary px-6 font-semibold text-primary-foreground transition-colors hover:bg-brand-light active:bg-brand-dark"
          >
            <MessageCircle className="size-5" aria-hidden />
            Orçamento no WhatsApp
          </a>
          <a
            href="#equipamentos"
            className="inline-flex h-12 items-center justify-center rounded-lg border border-border bg-surface-elevated px-6 font-semibold text-foreground transition-colors hover:border-brand"
          >
            Ver equipamentos
          </a>
        </div>

        <ul className="mt-10 flex flex-wrap gap-x-8 gap-y-3">
          {SELOS.map(({ icon: Icon, label }) => (
            <li key={label} className="flex items-center gap-2 text-sm text-muted-foreground">
              <Icon className="size-5 text-brand" aria-hidden />
              {label}
            </li>
          ))}
        </ul>
      </div>
    </section>
  );
}
