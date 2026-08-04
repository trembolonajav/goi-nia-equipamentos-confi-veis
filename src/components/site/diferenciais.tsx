import { Wrench, Timer, ReceiptText, Headset, MapPin, HardHat } from "lucide-react";

const ITENS = [
  {
    icon: Wrench,
    titulo: "Manutenção antes de cada locação",
    texto: "Todo equipamento sai revisado, limpo e testado. Se falhar por defeito, trocamos.",
  },
  {
    icon: Timer,
    titulo: "Resposta rápida de verdade",
    texto: "Orçamento respondido em minutos no horário comercial — obra parada custa caro.",
  },
  {
    icon: ReceiptText,
    titulo: "Preço claro, sem surpresa",
    texto: "Diária, semanal ou mensal com o que está incluso escrito antes de você fechar.",
  },
  {
    icon: HardHat,
    titulo: "Orientação de uso e segurança",
    texto: "Explicamos a operação correta e os EPIs recomendados na entrega do equipamento.",
  },
  {
    icon: MapPin,
    titulo: "Foco em Goiânia e região",
    texto: "Logística curta significa entrega mais rápida e frete mais justo para sua obra.",
  },
  {
    icon: Headset,
    titulo: "Atendimento por quem resolve",
    texto: "Você fala direto com quem conhece o equipamento, não com um robô de atendimento.",
  },
];

export function Diferenciais() {
  return (
    <section id="diferenciais" className="section-locago">
      <div className="container-locago">
        <p className="eyebrow">Por que a LOCAGO</p>
        <h2 className="mt-3 max-w-2xl text-[clamp(1.875rem,3.4vw,2.5rem)] uppercase">
          Locação sem dor de cabeça para quem toca obra
        </h2>

        <ul className="mt-10 grid gap-5 md:grid-cols-2 lg:grid-cols-3">
          {ITENS.map(({ icon: Icon, titulo, texto }) => (
            <li key={titulo} className="card-locago p-6">
              <Icon className="size-6 text-brand" aria-hidden />
              <h3 className="mt-4 text-lg uppercase">{titulo}</h3>
              <p className="mt-2 text-sm text-muted-foreground">{texto}</p>
            </li>
          ))}
        </ul>
      </div>
    </section>
  );
}
