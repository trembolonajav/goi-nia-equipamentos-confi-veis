import { PRODUTOS, PATRIMONIOS, COMPROMISSOS, CLIENTES, type Produto } from "../data/mock";

export const brl = new Intl.NumberFormat("pt-BR", { style: "currency", currency: "BRL", minimumFractionDigits: 0, maximumFractionDigits: 0 });

export function dias(inicio: string, fim: string): number {
  const a = new Date(inicio + "T00:00:00").getTime();
  const b = new Date(fim + "T00:00:00").getTime();
  const d = Math.round((b - a) / 86400000);
  return Number.isFinite(d) && d > 0 ? d : 1;
}

export function periodoCurto(inicio: string, fim: string): string {
  const f = (s: string) => s.split("-").reverse().slice(0, 2).join("/");
  return f(inicio) + " → " + f(fim);
}

export interface MelhorPreco { v: number; uso: Record<string, number>; }

/** Melhor combinação de tabela (mensal/quinzenal/semanal/diária) para minimizar o valor. */
export function melhorPreco(p: Produto, d: number): MelhorPreco {
  const tab: [number, number, string][] = [[30, p.mensal, "mensal"], [15, p.quinzenal, "quinzenal"], [7, p.semanal, "semanal"], [1, p.diaria, "diária"]];
  const memo: Record<number, MelhorPreco> = {};
  const f = (n: number): MelhorPreco => {
    if (n <= 0) return { v: 0, uso: {} };
    if (memo[n]) return memo[n];
    let best: MelhorPreco | null = null;
    for (const [len, preco, nome] of tab) {
      const r = f(Math.max(0, n - len));
      const v = r.v + preco;
      if (!best || v < best.v) { const uso = { ...r.uso }; uso[nome] = (uso[nome] || 0) + 1; best = { v, uso }; }
    }
    memo[n] = best!;
    return best!;
  };
  return f(d);
}

export function unidades(prodId: string): number {
  const p = PRODUTOS.find((x) => x.id === prodId);
  if (!p) return 0;
  if (p.controle === "quantidade") return p.unidades || 0;
  return PATRIMONIOS.filter((x) => x.prod === prodId && x.estado !== "Baixado").length;
}

export function ocupacao(prodId: string, inicio: string, fim: string) {
  const r = { locado: 0, reservado: 0, manutencao: 0 };
  for (const c of COMPROMISSOS) {
    if (c.prod !== prodId) continue;
    if (c.inicio <= fim && inicio <= c.fim) (r as Record<string, number>)[c.tipo] += c.qtd;
  }
  return r;
}

export function disponivel(prodId: string, inicio: string, fim: string): number {
  const o = ocupacao(prodId, inicio, fim);
  return Math.max(0, unidades(prodId) - o.locado - o.reservado - o.manutencao);
}

export interface ObraDerivada { nome: string; cliente: string; clienteId: string; endereco: string; restricao: string; frete: number; equipamentos: string; ativos: number; }
export function obrasDerivadas(): ObraDerivada[] {
  const out: ObraDerivada[] = [];
  for (const c of CLIENTES) for (const o of c.obras)
    out.push({ nome: o.nome, cliente: c.nome, clienteId: c.id, endereco: o.endereco, restricao: o.restricao, frete: o.frete, equipamentos: o.equipamentos, ativos: o.equipamentos.split(",").length });
  return out;
}
