import { createContext, useContext, useEffect, useMemo, useState, type ReactNode } from "react";
import {
  PRODUTOS, CLIENTES, CONTRATOS, PEDIDOS, EXTRAS,
  type Cliente, type Contrato, type Pedido,
} from "./mock";
import { melhorPreco, dias as diasEntre } from "../lib/calc";
import { atendimentoApi } from "../lib/api";

const KEY = "locago:v5";

interface Persist { clientes: Cliente[]; pedidos: Pedido[]; contratos: Contrato[]; }

function load(): Persist {
  try {
    const raw = localStorage.getItem(KEY);
    if (raw) return JSON.parse(raw) as Persist;
  } catch { /* ignore */ }
  return {
    clientes: structuredClone(CLIENTES),
    pedidos: structuredClone(PEDIDOS),
    contratos: structuredClone(CONTRATOS),
  };
}

interface StoreApi {
  clientes: Cliente[];
  pedidos: Pedido[];
  contratos: Contrato[];
  getCliente: (id: string) => Cliente | undefined;
  getContrato: (n: string) => Contrato | undefined;
  getPedido: (n: string) => Pedido | undefined;
  getProduto: typeof getProduto;
  addCliente: (c: Partial<Cliente>) => Promise<Cliente>;
  atualizarCliente: (c: Cliente) => Promise<void>;
  criarPedido: (args: CriarPedidoArgs) => Promise<Pedido>;
  aprovarPedido: (num: string) => Promise<Contrato | undefined>;
  expedirContrato: (num:string,itemIds:number[]) => Promise<void>;
  devolverContrato: (num:string,patrimonioCodigos:string[]) => Promise<void>;
  inspecionarContrato: (num:string,resultado:"APROVADO"|"MANUTENCAO",observacao?:string,patrimonioCodigos?:string[]) => Promise<void>;
  reset: () => void;
}

interface CriarPedidoArgs {
  clienteId: string; obra: string; entrega: string; inicio: string; fim: string;
  carrinho: Record<string, number>; servicos: string[]; forma: string; status: string; valor: number;
  servicosDetalhes?: { nome:string; natureza:string; valor:number }[];
  frete?: number;
}

function getProduto(id: string) { return PRODUTOS.find((p) => p.id === id); }

const Ctx = createContext<StoreApi | null>(null);

export function StoreProvider({ children }: { children: ReactNode }) {
  const [db, setDb] = useState<Persist>(load);
  useEffect(() => { localStorage.setItem(KEY, JSON.stringify(db)); }, [db]);
  useEffect(() => {
    Promise.all([atendimentoApi.clientes(), atendimentoApi.pedidos(), atendimentoApi.contratos()]).then(([clientesApi, pedidosApi, contratosApi]) => {
      setDb((atual) => ({
        ...atual,
        clientes: [...clientesApi, ...atual.clientes.filter((local) => !clientesApi.some((api) => api.id === local.id))],
        pedidos: [...pedidosApi, ...atual.pedidos.filter((local) => !pedidosApi.some((api) => api.num === local.num))],
        contratos: [...contratosApi, ...atual.contratos.filter((local) => !contratosApi.some((api) => api.numero === local.numero))],
      }));
    }).catch(() => { /* backend indisponível: mantém o modo local com mocks */ });
  }, []);

  const api = useMemo<StoreApi>(() => ({
    clientes: db.clientes,
    pedidos: db.pedidos,
    contratos: db.contratos,
    getCliente: (id) => db.clientes.find((c) => c.id === id),
    getContrato: (n) => db.contratos.find((c) => c.numero === n),
    getPedido: (n) => db.pedidos.find((p) => p.num === n),
    getProduto,

    addCliente: async (c) => {
      const novo: Cliente = {
        id: "CL-" + Math.floor(1000 + Math.random() * 8999),
        nome: "", doc: "", tipo: "Pessoa física", tel: "", email: "", situacao: "Ativo", desde: "agosto de 2026",
        condicao: "Pagamento à vista", inscricao: "", resp: "O próprio", endereco: "", aviso: "", obs: "",
        obras: [], docs: [], ...c,
      };
      await atendimentoApi.salvarCliente(novo);
      setDb((d) => ({ ...d, clientes: [novo, ...d.clientes] }));
      return novo;
    },
    atualizarCliente: async (cliente) => {
      await atendimentoApi.salvarCliente(cliente);
      setDb((d) => ({ ...d, clientes: d.clientes.map((c) => c.id === cliente.id ? cliente : c) }));
    },

    criarPedido: async (a) => {
      const num = "PED-" + Date.now().toString().slice(-9);
      const pedido: Pedido = {
        num, clienteId: a.clienteId, obra: a.obra, entrega: a.entrega, inicio: a.inicio, fim: a.fim,
        status: a.status, criado: "agora", autor: "Rafael M.",
        itens: Object.keys(a.carrinho).filter((k) => a.carrinho[k] > 0).map((id) => ({ prod: id, qtd: a.carrinho[id] })),
        servicos: a.servicos, servicosDetalhes:a.servicosDetalhes, frete:a.frete||0, desconto: 0, forma: a.forma,
        versoes: [{ v: 1, valor: a.valor, quando: "agora", nota: "Primeira versão gerada no balcão", ativa: true }],
        linha: [
          { q: "agora", t: "Pedido criado", d: "Aberto pelo fluxo de nova locação", a: "Rafael M." },
          { q: "agora", t: "Orçamento v1 gerado", d: a.status === "Aguardando aprovação" ? "Cliente aprovou no balcão" : "Pronto para enviar ao cliente", a: "Rafael M." },
        ],
      };
      await atendimentoApi.salvarPedido(pedido);
      setDb((d) => ({ ...d, pedidos: [pedido, ...d.pedidos] }));
      return pedido;
    },

    aprovarPedido: async (numPed) => {
      const p = db.pedidos.find((x) => x.num === numPed);
      if (!p || ["Orçamento enviado", "Aguardando aprovação"].indexOf(p.status) < 0) return undefined;
      const num = "CT-2026-" + Date.now().toString().slice(-7);
      const dd = diasEntre(p.inicio, p.fim);
      const cli = db.clientes.find((c) => c.id === p.clienteId)!;
      const bruto = p.itens.reduce((acc, i) => acc + melhorPreco(getProduto(i.prod)!, dd).v * i.qtd, 0);
      const serv = p.servicosDetalhes?.reduce((acc,e)=>acc+Number(e.valor),0) ?? p.servicos.reduce((acc, n) => acc + (EXTRAS.find((e) => e.nome === n)?.valor || 0), 0);
      const cau = p.itens.reduce((acc, i) => acc + getProduto(i.prod)!.caucao * i.qtd, 0);
      const contrato: Contrato = {
        numero: num, clienteId: p.clienteId, inicio: p.inicio, fim: p.fim,
        situacao: "Aguardando pagamento", pagamento: p.forma === "Boleto" ? "Faturado" : "Pago",
        caucao: cau, caucaoSit: "Retida até a inspeção final",
        local: p.obra || "Retirada na loja",
        endereco: p.obra ? (cli.obras.find((o) => o.nome === p.obra)?.endereco || "—") : "Balcão · Setor Norte Ferroviário",
        frete: p.frete||0, servicos: serv+(p.frete||0), locacao: bruto - p.desconto,
        itens: p.itens.map((i) => {
          const prod = getProduto(i.prod)!;
          return { prod: i.prod, qtd: i.qtd, nome: (i.qtd > 1 ? i.qtd + "× " : "") + prod.nome, patrimonio: "a definir na expedição", estado: "Reservado", valor: melhorPreco(prod, dd).v * i.qtd };
        }),
        memoria: [
          { linha: "Locação · " + dd + " dias", valor: "R$ " + bruto.toLocaleString("pt-BR") },
          { linha: "Desconto negociado", valor: p.desconto ? "− R$ " + p.desconto : "—" },
          { linha: "Serviços", valor: serv ? "R$ " + serv : "—" },
          { linha: "Caução retida", valor: "R$ " + cau.toLocaleString("pt-BR") },
        ],
        linha: [
          { q: p.criado, t: "Pedido " + p.num + " criado", d: "Negociação iniciada", a: p.autor },
          { q: "agora", t: "Pedido aprovado", d: "Reserva confirmada para o período", a: "Rafael M." },
          { q: "agora", t: "Contrato " + num + " gerado", d: "Preço congelado. Próximo passo é a expedição.", a: "Rafael M." },
        ],
        docs: [{ nome: "Orçamento", quando: p.criado.split(" ")[0], ok: true }, { nome: "Contrato assinado", quando: "pendente", ok: false }, { nome: "Checklist de saída", quando: "pendente", ok: false }],
      };
      const pedidoAprovado: Pedido = { ...p, status: "Aprovado", contrato: num };
      await atendimentoApi.aprovarPedido(numPed, pedidoAprovado, contrato);
      setDb((d) => ({
        ...d,
        contratos: d.contratos.some((c) => c.numero === num) ? d.contratos : [contrato, ...d.contratos],
        pedidos: d.pedidos.map((x) => (x.num === numPed ? pedidoAprovado : x)),
      }));
      return contrato;
    },

    expedirContrato: async (num,itemIds) => {
      const atualizado = await atendimentoApi.expedirContrato(num,itemIds);
      setDb((d) => ({ ...d, contratos: d.contratos.map((c) => c.numero === num ? atualizado : c) }));
    },

    devolverContrato: async (num,patrimonioCodigos) => {
      const atualizado = await atendimentoApi.devolverContrato(num,patrimonioCodigos);
      setDb((d) => ({ ...d, contratos: d.contratos.map((c) => c.numero === num ? atualizado : c) }));
    },

    inspecionarContrato: async (num, resultado, observacao = "",patrimonioCodigos=[]) => {
      const atualizado = await atendimentoApi.inspecionarContrato(num, resultado, observacao,patrimonioCodigos);
      setDb((d) => ({ ...d, contratos: d.contratos.map((c) => c.numero === num ? atualizado : c) }));
    },

    reset: () => setDb({ clientes: structuredClone(CLIENTES), pedidos: structuredClone(PEDIDOS), contratos: structuredClone(CONTRATOS) }),
  }), [db]);

  return <Ctx.Provider value={api}>{children}</Ctx.Provider>;
}

export function useStore(): StoreApi {
  const ctx = useContext(Ctx);
  if (!ctx) throw new Error("useStore precisa do StoreProvider");
  return ctx;
}
