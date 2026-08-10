export function brl(v: number): string {
  return v.toLocaleString("pt-BR", { style: "currency", currency: "BRL", maximumFractionDigits: 2 });
}

export function brlShort(v: number): string {
  return "R$ " + v.toLocaleString("pt-BR", { maximumFractionDigits: 0 });
}

const MESES = ["jan", "fev", "mar", "abr", "mai", "jun", "jul", "ago", "set", "out", "nov", "dez"];
const SEMANA = ["dom", "seg", "ter", "qua", "qui", "sex", "sáb"];

function parse(iso: string): Date {
  // Aceita "YYYY-MM-DD" como data local (sem fuso)
  const [y, m, d] = iso.split("-").map(Number);
  return new Date(y, (m || 1) - 1, d || 1);
}

export function dataCurta(iso: string): string {
  if (!iso) return "—";
  const d = parse(iso);
  return `${String(d.getDate()).padStart(2, "0")} ${MESES[d.getMonth()]} ${d.getFullYear()}`;
}

export function dataMini(iso: string): string {
  if (!iso) return "—";
  const d = parse(iso);
  return `${String(d.getDate()).padStart(2, "0")}/${String(d.getMonth() + 1).padStart(2, "0")}`;
}

export function diaSemana(iso: string): string {
  return SEMANA[parse(iso).getDay()];
}

export function periodoFmt(inicio: string, fim: string): string {
  return `${dataMini(inicio)} → ${dataMini(fim)}`;
}

/** Número de diárias entre duas datas (mínimo 1). */
export function diasEntre(inicio: string, fim: string): number {
  if (!inicio || !fim) return 1;
  const a = parse(inicio).getTime();
  const b = parse(fim).getTime();
  const dias = Math.round((b - a) / 86400000);
  return Math.max(1, dias);
}

export function hojeISO(): string {
  const d = new Date();
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;
}

export function addDias(iso: string, n: number): string {
  const d = parse(iso);
  d.setDate(d.getDate() + n);
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;
}

export function docFmt(tipo: "PF" | "PJ", doc: string): string {
  const s = doc.replace(/\D/g, "");
  if (tipo === "PF" && s.length === 11) return s.replace(/(\d{3})(\d{3})(\d{3})(\d{2})/, "$1.$2.$3-$4");
  if (tipo === "PJ" && s.length === 14) return s.replace(/(\d{2})(\d{3})(\d{3})(\d{4})(\d{2})/, "$1.$2.$3/$4-$5");
  return doc;
}
