import { createContext, useContext, useEffect, useMemo, useState, type ReactNode } from "react";
import type { Cliente, Contrato, Pedido, Produto } from "./mock";
import { atendimentoApi } from "../lib/api";

interface Persist { clientes: Cliente[]; pedidos: Pedido[]; contratos: Contrato[]; }
const vazio: Persist = { clientes: [], pedidos: [], contratos: [] };
interface CriarPedidoArgs {clienteId:string;obra:string;entrega:string;inicio:string;fim:string;carrinho:Record<string,number>;servicos:string[];forma:string;status:string;valor:number;servicosDetalhes?:{id?:number;nome:string;natureza:string;valor:number}[];frete?:number;}
interface StoreApi {
  clientes:Cliente[];pedidos:Pedido[];contratos:Contrato[];produtos:Produto[];cadastrosErro:string;
  getCliente:(id:string)=>Cliente|undefined;getContrato:(n:string)=>Contrato|undefined;getPedido:(n:string)=>Pedido|undefined;getProduto:(id:string)=>Produto|undefined;
  addCliente:(c:Partial<Cliente>)=>Promise<Cliente>;atualizarCliente:(c:Cliente)=>Promise<void>;
  criarPedido:(args:CriarPedidoArgs)=>Promise<Pedido>;aprovarPedido:(num:string)=>Promise<Contrato|undefined>;
  expedirContrato:(num:string,alocacoes:{itemId:number;quantidade:number}[])=>Promise<void>;
  devolverContrato:(num:string,patrimonioCodigos:string[])=>Promise<void>;
  inspecionarContrato:(num:string,resultado:"APROVADO"|"MANUTENCAO",observacao?:string,patrimonioCodigos?:string[])=>Promise<void>;
  reset:()=>void;
}
const Ctx=createContext<StoreApi|null>(null);
export function StoreProvider({children}:{children:ReactNode}){
  const[db,setDb]=useState<Persist>(vazio),[produtos,setProdutos]=useState<Produto[]>([]),[cadastrosErro,setCadastrosErro]=useState("");
  useEffect(()=>{
    Promise.all([atendimentoApi.clientes(),atendimentoApi.pedidos(),atendimentoApi.contratos(),atendimentoApi.produtos()])
      .then(([clientes,pedidos,contratos,produtosApi])=>{setDb({clientes,pedidos,contratos});setProdutos(produtosApi);setCadastrosErro("");})
      .catch(e=>{setDb(vazio);setProdutos([]);setCadastrosErro(e instanceof Error?e.message:"Não foi possível carregar os dados operacionais.");});
  },[]);
  const api=useMemo<StoreApi>(()=>({
    clientes:db.clientes,pedidos:db.pedidos,contratos:db.contratos,produtos,cadastrosErro,
    getCliente:id=>db.clientes.find(c=>c.id===id),getContrato:n=>db.contratos.find(c=>c.numero===n),getPedido:n=>db.pedidos.find(p=>p.num===n),getProduto:id=>produtos.find(p=>p.id===id),
    addCliente:async c=>{const novo={nome:"",doc:"",tipo:"Pessoa física",tel:"",email:"",situacao:"Ativo",desde:"",condicao:"Pagamento à vista",inscricao:"",resp:"O próprio",endereco:"",aviso:"",obs:"",obras:[],docs:[],...c};delete (novo as {id?:string}).id;const salvo=await atendimentoApi.criarCliente(novo);setDb(d=>({...d,clientes:[salvo,...d.clientes]}));return salvo;},
    atualizarCliente:async cliente=>{const salvo=await atendimentoApi.atualizarCliente(cliente);setDb(d=>({...d,clientes:d.clientes.map(c=>c.id===salvo.id?salvo:c)}));},
    criarPedido:async a=>{const pedido=await atendimentoApi.criarOrcamento({clienteId:a.clienteId,obra:a.obra,entrega:a.entrega,inicio:a.inicio,fim:a.fim,forma:a.forma,frete:a.frete||0,desconto:0,itens:Object.entries(a.carrinho).filter(([,q])=>q>0).map(([produtoId,quantidade])=>({produtoId,quantidade})),servicos:(a.servicosDetalhes||[]).filter(s=>s.id!=null).map(s=>({id:s.id,quantidade:1}))});setDb(d=>({...d,pedidos:[pedido,...d.pedidos.filter(p=>p.num!==pedido.num)]}));return pedido;},
    aprovarPedido:async num=>{const p=db.pedidos.find(x=>x.num===num);if(!p?.versaoId)throw new Error("Este registro não possui uma versão de orçamento persistida e não pode gerar contrato.");const contrato=await atendimentoApi.aprovarVersaoOrcamento(num,p.versaoId);setDb(d=>({...d,contratos:d.contratos.some(c=>c.numero===contrato.numero)?d.contratos:[contrato,...d.contratos],pedidos:d.pedidos.map(x=>x.num===num?{...p,status:"Aprovado",contrato:contrato.numero}:x)}));return contrato;},
    expedirContrato:async(num,alocacoes)=>{const atualizado=await atendimentoApi.expedirContrato(num,alocacoes);setDb(d=>({...d,contratos:d.contratos.map(c=>c.numero===num?atualizado:c)}));},
    devolverContrato:async(num,codigos)=>{const atualizado=await atendimentoApi.devolverContrato(num,codigos);setDb(d=>({...d,contratos:d.contratos.map(c=>c.numero===num?atualizado:c)}));},
    inspecionarContrato:async(num,resultado,observacao="",codigos=[])=>{const atualizado=await atendimentoApi.inspecionarContrato(num,resultado,observacao,codigos);setDb(d=>({...d,contratos:d.contratos.map(c=>c.numero===num?atualizado:c)}));},
    reset:()=>{setDb(vazio);setProdutos([]);setCadastrosErro("Dados locais limpos. Atualize a página para recarregar a API.");}
  }),[db,produtos,cadastrosErro]);
  return <Ctx.Provider value={api}>{children}</Ctx.Provider>;
}
export function useStore(){const ctx=useContext(Ctx);if(!ctx)throw new Error("useStore precisa do StoreProvider");return ctx;}
