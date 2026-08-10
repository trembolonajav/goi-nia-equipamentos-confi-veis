import type { Cliente, Contrato, Pedido, Produto, Patrimonio } from "../data/mock";

export interface ManutencaoApi { id: number; patrimonio: string; produto: string; contrato: string; motivo: string; status: "ABERTA" | "CONCLUIDA"; criadoEm: string; concluidoEm: string | null; }
export interface PatrimonioApi{codigo:string;produtoId:string;produto:string;serie:string;estado:string}
export interface AgendaApi { id:number; contrato:string; clienteId:string; cliente:string; tipo:"ENTREGA"|"COLETA"; data:string; hora:string; destino:string; endereco:string; status:"PENDENTE"|"CONCLUIDA"; }
export interface ObraApi { clienteId:string; cliente:string; nome:string; endereco:string; restricao:string; frete:number; situacao:string; }
export interface CobrancaApi { id:number; contrato:string; clienteId:string; cliente:string; descricao:string; vencimento:string; valor:number; recebido:number; saldo:number; status:"ABERTA"|"PARCIAL"|"PAGA"|"VENCIDA"; }
export interface CaucaoApi { id:number; contrato:string; clienteId:string; cliente:string; valor:number; status:"PENDENTE"|"RETIDA"|"LIBERADA"|"EM_ANALISE"; atualizadoEm:string; }
export interface ContaFinanceiraApi{id:number;nome:string;tipo:string;saldoInicial:number;ativo:boolean}
export interface LancamentoFinanceiroApi{id:number;tipo:"ENTRADA"|"SAIDA";descricao:string;categoria:string;contaId:number;conta:string;vencimento:string;pagamento:string|null;valor:number;status:"ABERTO"|"VENCIDO"|"PAGO"|"CANCELADO";forma:string;origem:string;referencia?:string;observacao?:string}
export interface ResumoFinanceiroApi{saldo:number;entradas:number;saidas:number;aReceber:number;aPagar:number}
export interface DocumentoClienteApi { id:number; tipo:string; nome:string; mime:string; tamanho:number; criadoEm:string; }
export interface ServicoApi { id:number; nome:string; natureza:string; valor:number; ativo:boolean; }
export interface EventoOperacionalApi {id:number;tipo:"TROCA"|"OCORRENCIA";contrato:string;clienteId:string;categoria:string;descricao:string;prioridade:string;patrimonioOrigem?:string;patrimonioDestino?:string;status:"ABERTA"|"CONCLUIDA";responsavel:string;criadoEm:string;concluidoEm?:string|null}
export interface CategoriaProdutoApi{id:number;nome:string;prefixo:string}
export interface ComposicaoApi{id:string;nome:string;principal:string;inclusos:string[];opcionais:{nome:string;valor:number}[];nota:string}

const API = import.meta.env.VITE_API_URL || "/api";

async function request<T>(path: string, init?: RequestInit): Promise<T> {
  const response = await fetch(`${API}${path}`, { headers: { "Content-Type": "application/json", ...init?.headers }, ...init });
  if (!response.ok) throw new Error(await mensagemErro(response));
  if (response.status === 204) return undefined as T;
  return response.json() as Promise<T>;
}

async function mensagemErro(response: Response) {
  const texto = await response.text();
  try {
    const corpo = JSON.parse(texto) as { message?: string; detail?: string; error?: string };
    return corpo.message || corpo.detail || corpo.error || `Não foi possível concluir a operação (${response.status}).`;
  } catch {
    return texto || `Não foi possível concluir a operação (${response.status}).`;
  }
}

export const atendimentoApi = {
  clientes: () => request<Cliente[]>("/atendimento/clientes"),
  salvarCliente: (cliente: Cliente) => request<Cliente>("/atendimento/clientes", { method: "POST", body: JSON.stringify(cliente) }),
  pedidos: () => request<Pedido[]>("/atendimento/pedidos"),
  salvarPedido: (pedido: Pedido) => request<Pedido>("/atendimento/pedidos", { method: "POST", body: JSON.stringify(pedido) }),
  contratos: () => request<Contrato[]>("/atendimento/contratos"),
  aprovarPedido: (numero: string, pedido: Pedido, contrato: Contrato) => request<Contrato>(`/atendimento/pedidos/${numero}/aprovar`, { method: "POST", body: JSON.stringify({ pedido, contrato }) }),
  expedirContrato: (numero: string) => request<Contrato>(`/atendimento/contratos/${numero}/expedir`, { method: "POST" }),
  devolverContrato: (numero: string) => request<Contrato>(`/atendimento/contratos/${numero}/devolver`, { method: "POST" }),
  inspecionarContrato: (numero: string, resultado: "APROVADO" | "MANUTENCAO", observacao = "") => request<Contrato>(`/atendimento/contratos/${numero}/inspecionar`, { method: "POST", body: JSON.stringify({ resultado, observacao }) }),
  manutencoes: () => request<ManutencaoApi[]>("/atendimento/manutencoes"),
  abrirManutencao:(dados:{patrimonio:string;motivo:string;tipo:string;prioridade:string;fornecedor:string;previsao:string;custoEstimado:number})=>request<ManutencaoApi>("/atendimento/manutencoes",{method:"POST",body:JSON.stringify(dados)}),
  patrimonios:()=>request<PatrimonioApi[]>("/atendimento/patrimonios"),
  concluirManutencao: (id: number, observacao = "") => request<ManutencaoApi>(`/atendimento/manutencoes/${id}/concluir`, { method: "POST", body: JSON.stringify({ observacao }) }),
  agenda: () => request<AgendaApi[]>("/atendimento/agenda"),
  obras: () => request<ObraApi[]>("/atendimento/obras"),
  cobrancas: () => request<CobrancaApi[]>("/atendimento/cobrancas"),
  receberCobranca: (id:number,valor:number,forma="Pix") => request<CobrancaApi>(`/atendimento/cobrancas/${id}/receber`,{method:"POST",body:JSON.stringify({valor,forma})}),
  caucoes: () => request<CaucaoApi[]>("/atendimento/caucoes"),
  contasFinanceiras:()=>request<ContaFinanceiraApi[]>("/atendimento/financeiro/contas"),
  resumoFinanceiro:()=>request<ResumoFinanceiroApi>("/atendimento/financeiro/resumo"),
  lancamentosFinanceiros:()=>request<LancamentoFinanceiroApi[]>("/atendimento/financeiro/lancamentos"),
  criarLancamentoFinanceiro:(dados:Record<string,unknown>)=>request<LancamentoFinanceiroApi>("/atendimento/financeiro/lancamentos",{method:"POST",body:JSON.stringify(dados)}),
  baixarLancamentoFinanceiro:(id:number,dados:Record<string,unknown>)=>request<LancamentoFinanceiroApi>(`/atendimento/financeiro/lancamentos/${id}/baixar`,{method:"POST",body:JSON.stringify(dados)}),
  cancelarLancamentoFinanceiro:(id:number)=>request<LancamentoFinanceiroApi>(`/atendimento/financeiro/lancamentos/${id}/cancelar`,{method:"POST"}),
  documentosCliente: (id:string) => request<DocumentoClienteApi[]>(`/atendimento/clientes/${id}/documentos`),
  anexarDocumento: async (id:string,tipo:string,arquivo:File) => { const form=new FormData();form.append("tipo",tipo);form.append("arquivo",arquivo);const response=await fetch(`${API}/atendimento/clientes/${id}/documentos`,{method:"POST",body:form});if(!response.ok)throw new Error(await mensagemErro(response));return response.json() as Promise<DocumentoClienteApi>; },
  urlDocumento: (id:number) => `${API}/atendimento/documentos/${id}/arquivo`,
  urlDownloadDocumento: (id:number) => `${API}/atendimento/documentos/${id}/arquivo?download=true`,
  excluirDocumento: (id:number) => request<void>(`/atendimento/documentos/${id}`,{method:"DELETE"}),
  servicos: () => request<ServicoApi[]>("/atendimento/servicos"),
  salvarServico: (servico:Partial<ServicoApi>) => request<ServicoApi>("/atendimento/servicos",{method:"POST",body:JSON.stringify(servico)}),
  trocas:()=>request<EventoOperacionalApi[]>("/atendimento/trocas"),
  criarTroca:(dados:Partial<EventoOperacionalApi>)=>request<EventoOperacionalApi>("/atendimento/trocas",{method:"POST",body:JSON.stringify(dados)}),
  concluirTroca:(id:number)=>request<EventoOperacionalApi>(`/atendimento/trocas/${id}/concluir`,{method:"POST"}),
  ocorrencias:()=>request<EventoOperacionalApi[]>("/atendimento/ocorrencias"),
  criarOcorrencia:(dados:Partial<EventoOperacionalApi>)=>request<EventoOperacionalApi>("/atendimento/ocorrencias",{method:"POST",body:JSON.stringify(dados)}),
  concluirOcorrencia:(id:number)=>request<EventoOperacionalApi>(`/atendimento/ocorrencias/${id}/concluir`,{method:"POST"}),
  produtos:()=>request<Produto[]>("/atendimento/produtos"),
  produto:(id:string)=>request<Produto>(`/atendimento/produtos/${id}`),
  salvarProduto:(produto:Produto)=>request<Produto>("/atendimento/produtos",{method:"POST",body:JSON.stringify(produto)}),
  categoriasProduto:()=>request<CategoriaProdutoApi[]>("/atendimento/produtos/categorias/lista"),
  salvarCategoriaProduto:(categoria:{nome:string;prefixo:string})=>request<CategoriaProdutoApi>("/atendimento/produtos/categorias",{method:"POST",body:JSON.stringify(categoria)}),
  patrimoniosProduto:(id:string)=>request<Patrimonio[]>(`/atendimento/produtos/${id}/patrimonios`),
  composicoes:()=>request<ComposicaoApi[]>("/atendimento/composicoes"),
  salvarComposicao:(c:Partial<ComposicaoApi>)=>request<ComposicaoApi>("/atendimento/composicoes",{method:"POST",body:JSON.stringify(c)}),
  documentosContrato: (numero:string) => request<DocumentoClienteApi[]>(`/atendimento/contratos/${numero}/documentos`),
  anexarDocumentoContrato: async(numero:string,tipo:string,arquivo:File) => {const form=new FormData();form.append("tipo",tipo);form.append("arquivo",arquivo);const response=await fetch(`${API}/atendimento/contratos/${numero}/documentos`,{method:"POST",body:form});if(!response.ok)throw new Error(await mensagemErro(response));return response.json() as Promise<DocumentoClienteApi>},
  urlDocumentoContrato: (id:number) => `${API}/atendimento/contratos/documentos/${id}/arquivo`,
  urlDownloadDocumentoContrato: (id:number) => `${API}/atendimento/contratos/documentos/${id}/arquivo?download=true`,
  excluirDocumentoContrato: (id:number) => request<void>(`/atendimento/contratos/documentos/${id}`,{method:"DELETE"}),
};
