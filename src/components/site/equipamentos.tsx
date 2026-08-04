import betoneira from "@/assets/eq-betoneira.jpg";
import martelete from "@/assets/eq-martelete.jpg";
import compactador from "@/assets/eq-compactador.jpg";
import andaime from "@/assets/eq-andaime.jpg";
import { whatsappLink } from "@/lib/locago";

const EQUIPAMENTOS = [
  {
    nome: "Betoneiras",
    img: betoneira,
    resumo: "Modelos de 145L a 400L para concreto e argamassa direto na obra.",
    tags: ["145L / 250L / 400L", "Monofásica e trifásica"],
  },
  {
    nome: "Marteletes e rompedores",
    img: martelete,
    resumo: "Perfuração e demolição em concreto, alvenaria e piso, com brocas e ponteiros.",
    tags: ["5kg a 30kg", "Acessórios inclusos"],
  },
  {
    nome: "Compactadores",
    img: compactador,
    resumo: "Placas vibratórias e compactadores de solo para base, calçada e aterro.",
    tags: ["Placa vibratória", "Compactador de solo"],
  },
  {
    nome: "Andaimes e escoras",
    img: andaime,
    resumo: "Torres tubulares, plataformas e escoras metálicas com montagem orientada.",
    tags: ["Torre 1m e 1,5m", "Escoras reguláveis"],
  },
];

export function Equipamentos() {
  return (
    <section id="equipamentos" className="section-locago">
      <div className="container-locago">
        <p className="eyebrow">Linha de locação</p>
        <div className="mt-3 flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
          <h2 className="max-w-2xl text-[clamp(1.875rem,3.4vw,2.5rem)] uppercase">
            Equipamentos prontos para trabalhar
          </h2>
          <p className="max-w-md text-muted-foreground">
            Não achou o que precisa? Trabalhamos com uma linha ampla — fale com a gente e
            confirmamos disponibilidade na hora.
          </p>
        </div>

        <ul className="mt-10 grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
          {EQUIPAMENTOS.map((eq) => (
            <li key={eq.nome} className="card-locago overflow-hidden">
              <div className="aspect-[4/3] w-full bg-surface-elevated">
                <img
                  src={eq.img}
                  alt={eq.nome}
                  width={800}
                  height={600}
                  loading="lazy"
                  className="size-full object-cover"
                />
              </div>
              <div className="p-5">
                <h3 className="text-xl uppercase">{eq.nome}</h3>
                <p className="mt-2 text-sm text-muted-foreground">{eq.resumo}</p>
                <ul className="mt-4 flex flex-wrap gap-2">
                  {eq.tags.map((t) => (
                    <li
                      key={t}
                      className="rounded-full border border-border px-3 py-1 text-xs text-muted-foreground"
                    >
                      {t}
                    </li>
                  ))}
                </ul>
                <a
                  href={whatsappLink(`Olá! Quero alugar: ${eq.nome}. Pode me passar o valor?`)}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="mt-5 inline-flex min-h-11 items-center text-sm font-semibold text-brand hover:text-brand-light"
                >
                  Consultar valor →
                </a>
              </div>
            </li>
          ))}
        </ul>
      </div>
    </section>
  );
}
