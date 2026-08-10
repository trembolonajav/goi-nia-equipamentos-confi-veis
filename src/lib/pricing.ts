import type { Produto, TabelaPreco, LinhaMemoria } from "../types";
import { brl } from "./format";

export interface PrecoResultado {
  total: number;
  detalhe: string; // ex.: "1 mês + 3 diárias"
  memoria: LinhaMemoria[];
}

interface Faixa {
  nome: string;
  dias: number;
  valor: number;
}

/**
 * Combina as faixas da tabela (mensal, quinzenal, semanal, diária) para chegar
 * ao MENOR valor do período. Espelha a regra descrita no design: "o sistema
 * aplica a melhor combinação de tabela".
 */
export function melhorPreco(tabela: TabelaPreco, dias: number): PrecoResultado {
  const faixas: Faixa[] = [
    { nome: "mês", dias: 30, valor: tabela.mensal },
    { nome: "quinzena", dias: 15, valor: tabela.quinzenal },
    { nome: "semana", dias: 7, valor: tabela.semanal },
    { nome: "diária", dias: 1, valor: tabela.diaria },
  ].filter((f) => f.valor > 0);

  // Programação simples: para cada quantidade de dias, o menor custo.
  const custo = new Array(dias + 1).fill(Infinity);
  const escolha: (Faixa | null)[] = new Array(dias + 1).fill(null);
  custo[0] = 0;
  for (let d = 1; d <= dias; d++) {
    for (const f of faixas) {
      const restante = Math.max(0, d - f.dias);
      const c = custo[restante] + f.valor;
      if (c < custo[d]) {
        custo[d] = c;
        escolha[d] = f;
      }
    }
    // fallback: se nenhuma faixa cobre, repete a diária
    if (custo[d] === Infinity && faixas.length) {
      custo[d] = custo[d - 1] + faixas[faixas.length - 1].valor;
      escolha[d] = faixas[faixas.length - 1];
    }
  }

  // Reconstrói a composição
  const uso: Record<string, { faixa: Faixa; qtd: number }> = {};
  let d = dias;
  while (d > 0 && escolha[d]) {
    const f = escolha[d]!;
    uso[f.nome] = uso[f.nome] || { faixa: f, qtd: 0 };
    uso[f.nome].qtd++;
    d = Math.max(0, d - f.dias);
  }

  const partes = Object.values(uso).map((u) => `${u.qtd} ${u.faixa.nome}${u.qtd > 1 ? "s" : ""}`);
  const memoria: LinhaMemoria[] = Object.values(uso).map((u) => ({
    linha: `${u.qtd}× ${u.faixa.nome} (${brl(u.faixa.valor)})`,
    valor: brl(u.qtd * u.faixa.valor),
  }));

  return {
    total: custo[dias] === Infinity ? 0 : Math.round(custo[dias]),
    detalhe: partes.join(" + ") || `${dias} diárias`,
    memoria,
  };
}

export function precoUnitario(produto: Produto, dias: number): PrecoResultado {
  if (produto.tipoControle === "consumo") {
    return { total: produto.tabela.diaria, detalhe: "venda", memoria: [] };
  }
  return melhorPreco(produto.tabela, dias);
}
