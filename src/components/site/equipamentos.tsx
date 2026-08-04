import { Link } from "@tanstack/react-router";
import { DESTAQUES } from "@/lib/catalogo";
import { EquipCard } from "@/components/site/equip-card";

export function Equipamentos() {
  return (
    <section id="equipamentos" className="section-locago">
      <div className="container-locago">
        <p className="eyebrow">Linha de locação</p>
        <div className="mt-3 flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
          <h2 className="max-w-2xl text-[clamp(1.875rem,3.4vw,2.5rem)] uppercase">
            Equipamentos mais alugados
          </h2>
          <p className="max-w-md text-muted-foreground">
            Estes são os campeões de obra em Goiânia. O catálogo completo tem busca por
            equipamento e por serviço.
          </p>
        </div>

        <ul className="mt-10 grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
          {DESTAQUES.map((eq) => (
            <EquipCard key={eq.slug} eq={eq} />
          ))}
        </ul>

        <div className="mt-10 flex justify-center">
          <Link
            to="/equipamentos"
            className="inline-flex h-12 items-center justify-center rounded-lg bg-primary px-8 font-semibold text-primary-foreground transition-colors hover:bg-brand-light active:bg-brand-dark"
          >
            Ver catálogo completo de equipamentos
          </Link>
        </div>
      </div>
    </section>
  );
}
