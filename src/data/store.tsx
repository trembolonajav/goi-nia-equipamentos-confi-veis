import { createContext, useContext, useEffect, useMemo, useState, type ReactNode } from "react";
import {
  PRODUTOS, CLIENTES, CONTRATOS, PEDIDOS,
  type Cliente, type Contrato, type Pedido,
  type Produto,
} from "./mock";
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
  produtos: Produto[];
  getCliente: (id: string) => Cliente | undefined;
  getContrato: (n: string) => Contrato | undefined;
  getPedido: (n: string) => Pedido | undefined;
  getProduto: typeof getProduto;
  addCliente: (c: Partial<Cliente>) => Promise<Cliente>;
  atualizarCliente: (c: Cliente) => Promise<void>;
  criarPedido: (args: CriarPedidoArgs) => Promise<Pedido>;
  aprovarPedido: (num: string) => Promise<Contrato | undefined>;
  expedirContrato: (num:string,alocacoes:{itemId:number;quantidade:number}[]) => Promise<void>;
  devolverContrato: (num:string,patrimonioCodigos:string[]) => Promise<void>;
  inspecionarContrato: (num:string,resultado:"APROVADO"|"MANUTENCAO",observacao?:string,patrimonioCodigos?:string[]) => Promise<void>;
  reset: () => void;
}

interface CriarPedidoArgs {
  clienteId: string; obra: string; entrega: string; inicio: string; fim: string;
  carrinho: Record<string, number>; servicos: string[]; forma: string; status: string; valor: number;
  servicosDetalhes?: { id?:number; nome:string; natureza:string; valor:number }[];
  frete?: number;
}

function getProduto(id: string) { return PRODUTOS.find((p) => p.id === id); }

const Ctx = createContext<StoreApi | null>(null);

export function StoreProvider({ children }: { children: ReactNode }) {
  const [db, setDb] = useState<Persist>(load);
  const [produtos,setProdutos]=useState<Produto[]>([]);
  useEffect(() => { localStorage.setItem(KEY, JSON.stringify(db)); }, [db]);
  useEffect(() => {
    Promise.all([atendimentoApi.clientes(), atendimentoApi.pedidos(), atendimentoApi.contratos(), atendimentoApi.produtos()]).then(([clientesApi, pedidosApi, contratosApi, produtosApi]) => {
      setProdutos(produtosApi);
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
    produtos,
    getCliente: (id) => db.clientes.find((c) => c.id === id),
    getContrato: (n) => db.contratos.find((c) => c.numero === n),
    getPedido: (n) => db.pedidos.find((p) => p.num === n),
    getProduto: (id) => produtos.find((p)=>p.id===id) ?? getProduto(id),

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
      {
        const pedido=await atendimentoApi.criarOrcamento({clienteId:a.clienteId,obra:a.obra,entrega:a.entrega,inicio:a.inicio,fim:a.fim,forma:a.forma,frete:a.frete||0,desconto:0,
          itens:Object.entries(a.carrinho).filter(([,q])=>q>0).map(([produtoId,quantidade])=>({produtoId,quantidade})),
          servicos:(a.servicosDetalhes||[]).filter(s=>s.id!=null).map(s=>({id:s.id,quantidade:1}))});
        setDb((d)=>({...d,pedidos:[pedido,...d.pedidos.filter(p=>p.num!==pedido.num)]}));
        return pedido;
      }
    },

    aprovarPedido: async (numPed) => {
      const p = db.pedidos.find((x) => x.num === numPed);
      if(p?.versaoId){
        const contrato=await atendimentoApi.aprovarVersaoOrcamento(numPed,p.versaoId);
        const pedidoAprovado={...p,status:"Aprovado",contrato:contrato.numero};
        setDb((d)=>({...d,contratos:d.contratos.some(c=>c.numero===contrato.numero)?d.contratos:[contrato,...d.contratos],pedidos:d.pedidos.map(x=>x.num===numPed?pedidoAprovado:x)}));
        return contrato;
      }
      throw new Error("Este registro legado não possui uma versão de orçamento persistida e não pode gerar um novo contrato.");
    },

    expedirContrato: async (num,alocacoes) => {
      const atualizado = await atendimentoApi.expedirContrato(num,alocacoes);
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
  }), [db,produtos]);

  return <Ctx.Provider value={api}>{children}</Ctx.Provider>;
}

export function useStore(): StoreApi {
  const ctx = useContext(Ctx);
  if (!ctx) throw new Error("useStore precisa do StoreProvider");
  return ctx;
}
