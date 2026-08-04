import { useState, type FormEvent } from "react";
import { Phone } from "lucide-react";
import { WhatsappIcon } from "@/components/icons/whatsapp";
import { EMPRESA, whatsappLink } from "@/lib/locago";

const EQUIPAMENTOS = [
  "Betoneira",
  "Martelete / Rompedor",
  "Compactador de solo",
  "Andaime / Escora",
  "Gerador",
  "Outro equipamento",
];

const PRAZOS = ["Diária", "Semanal", "Quinzenal", "Mensal", "Ainda não sei"];

export function Orcamento() {
  const [equipamento, setEquipamento] = useState(EQUIPAMENTOS[0]);
  const [prazo, setPrazo] = useState(PRAZOS[0]);
  const [nome, setNome] = useState("");
  const [bairro, setBairro] = useState("");
  const [obs, setObs] = useState("");

  function onSubmit(e: FormEvent) {
    e.preventDefault();
    const msg = [
      `Olá, sou ${nome || "cliente"} e quero um orçamento na LOCAGO.`,
      `Equipamento: ${equipamento}`,
      `Período: ${prazo}`,
      bairro ? `Local da obra: ${bairro}` : null,
      obs ? `Observações: ${obs}` : null,
    ]
      .filter(Boolean)
      .join("\n");
    window.open(whatsappLink(msg), "_blank", "noopener,noreferrer");
  }

  const fieldClass =
    "min-h-12 w-full rounded-lg border border-border bg-surface-elevated px-4 text-base text-foreground placeholder:text-muted-foreground";

  return (
    <section id="orcamento" className="section-locago bg-surface hairline-top">
      <div className="container-locago grid gap-10 lg:grid-cols-2 lg:items-start">
        <div>
          <p className="eyebrow">Orçamento</p>
          <h2 className="mt-3 text-[clamp(1.875rem,3.4vw,2.5rem)] uppercase">
            Peça seu orçamento em 1 minuto
          </h2>
          <p className="mt-4 max-w-lg text-muted-foreground">
            Preencha os campos e o pedido já vai formatado para o nosso WhatsApp. Se preferir,
            ligue — atendemos direto.
          </p>
          <a
            href={`tel:${EMPRESA.telefoneRaw}`}
            className="mt-6 inline-flex min-h-12 items-center gap-2 text-lg font-semibold text-foreground"
          >
            <Phone className="size-5 text-brand" aria-hidden />
            {EMPRESA.telefone}
          </a>
        </div>

        <form onSubmit={onSubmit} className="card-locago grid gap-4 p-6">
          <div className="grid gap-2">
            <label htmlFor="nome" className="text-sm font-medium">
              Seu nome
            </label>
            <input
              id="nome"
              value={nome}
              onChange={(e) => setNome(e.target.value)}
              required
              placeholder="Como podemos te chamar"
              className={fieldClass}
            />
          </div>

          <div className="grid gap-4 sm:grid-cols-2">
            <div className="grid gap-2">
              <label htmlFor="equipamento" className="text-sm font-medium">
                Equipamento
              </label>
              <select
                id="equipamento"
                value={equipamento}
                onChange={(e) => setEquipamento(e.target.value)}
                className={fieldClass}
              >
                {EQUIPAMENTOS.map((e) => (
                  <option key={e}>{e}</option>
                ))}
              </select>
            </div>
            <div className="grid gap-2">
              <label htmlFor="prazo" className="text-sm font-medium">
                Período
              </label>
              <select
                id="prazo"
                value={prazo}
                onChange={(e) => setPrazo(e.target.value)}
                className={fieldClass}
              >
                {PRAZOS.map((p) => (
                  <option key={p}>{p}</option>
                ))}
              </select>
            </div>
          </div>

          <div className="grid gap-2">
            <label htmlFor="bairro" className="text-sm font-medium">
              Bairro / cidade da obra
            </label>
            <input
              id="bairro"
              value={bairro}
              onChange={(e) => setBairro(e.target.value)}
              placeholder="Ex.: Setor Bueno, Goiânia"
              className={fieldClass}
            />
          </div>

          <div className="grid gap-2">
            <label htmlFor="obs" className="text-sm font-medium">
              Detalhes (opcional)
            </label>
            <textarea
              id="obs"
              value={obs}
              onChange={(e) => setObs(e.target.value)}
              rows={3}
              placeholder="Data de início, quantidade, dúvidas…"
              className="w-full rounded-lg border border-border bg-surface-elevated p-4 text-base text-foreground placeholder:text-muted-foreground"
            />
          </div>

          <button
            type="submit"
            className="inline-flex min-h-12 items-center justify-center gap-2 rounded-lg bg-primary px-6 font-semibold text-primary-foreground transition-colors hover:bg-brand-light active:bg-brand-dark"
          >
            <WhatsappIcon className="size-5" />
            Enviar no WhatsApp
          </button>
          <p className="text-xs text-muted-foreground">
            Ao enviar, abrimos uma conversa no WhatsApp com os dados preenchidos.
          </p>
        </form>
      </div>
    </section>
  );
}
