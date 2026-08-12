import type { Cliente, Contrato, Pedido, Patrimonio, Produto as ProdutoBase } from "../data/mock";

export interface PrecoProdutoApi {duracaoDias:number;nome:string;valor:number}
export type ProdutoApi = ProdutoBase & {precos?:PrecoProdutoApi[]};
export type Produto = ProdutoApi;
export interface ConteudoPublico{resumo?:string;indicadoPara?:string[];naoIndicado?:string;inclui?:string[];cuidados?:string[];observacaoTecnica?:string;fonte?:string}
export interface EquipamentoPublico {id:string;slug:string;nome:string;categoria:string;marca:string;modelo:string;descricao:string;aplicacao:string;imagemUrl:string;especificacoes:string|Record<string,string>;conteudoPublico:string|ConteudoPublico;disponiveis:number;precos:PrecoProdutoApi[]}

export interface ManutencaoApi { id: number; patrimonio: string; produto: string; contrato: string; motivo: string; status: "ABERTA" | "CONCLUIDA"; criadoEm: string; concluidoEm: string | null; }
export interface PatrimonioApi{codigo:string;produtoId:string;produto:string;serie:string;estado:string;local?:string|null;marca?:string;modelo?:string;dataAquisicao?:string|null;valorAquisicao?:number|null;observacao?:string|null}
export interface AgendaApi { id:number; contrato:string; clienteId:string; cliente:string; tipo:"ENTREGA"|"COLETA"; data:string; hora:string; destino:string; endereco:string; status:"PENDENTE"|"CONCLUIDA"; }
export interface ObraApi { clienteId:string; cliente:string; nome:string; endereco:string; restricao:string; frete:number; situacao:string; }
export interface CobrancaApi { id:number; contrato:string; clienteId:string; cliente:string; descricao:string; vencimento:string; valor:number; recebido:number; saldo:number; status:"ABERTA"|"PARCIAL"|"PAGA"|"VENCIDA"; }
export interface ContaFinanceiraApi{id:number;nome:string;tipo:string;saldoInicial:number;ativo:boolean}
export interface LancamentoFinanceiroApi{id:number;tipo:"ENTRADA"|"SAIDA";descricao:string;categoria:string;contaId:number;conta:string;vencimento:string;pagamento:string|null;valor:number;status:"ABERTO"|"VENCIDO"|"PAGO"|"CANCELADO";forma:string;origem:string;referencia?:string;observacao?:string}
export interface ResumoFinanceiroApi{saldo:number;entradas:number;saidas:number;aReceber:number;aPagar:number}
export interface DocumentoClienteApi { id:number; tipo:string; nome:string; mime:string; tamanho:number; criadoEm:string; usadoEmEntrega?:boolean; entregaOperacaoId?:number|null; }
export interface ServicoApi { id:number; nome:string; natureza:string; valor:number; ativo:boolean; }
export interface EventoOperacionalApi {id:number;tipo:"TROCA"|"OCORRENCIA";contrato:string;clienteId:string;categoria:string;descricao:string;prioridade:string;patrimonioOrigem?:string;patrimonioDestino?:string;status:"ABERTA"|"CONCLUIDA";responsavel:string;criadoEm:string;concluidoEm?:string|null}
export interface CategoriaProdutoApi{id:number;nome:string;prefixo:string}
export interface ComposicaoApi{id:string;nome:string;principal:string;inclusos:string[];opcionais:{nome:string;valor:number}[];nota:string}
export interface ContratoItemOperacionalApi{id:number;produtoId:string;descricao:string;quantidade:number;expedido:number;aExpedir:number;entregue:number;status:string;inicio:string;fim:string;valor:number;patrimonios:{codigo:string;estado:string;serie:string;entregue:boolean}[]}
export interface DashboardApi{entregasPendentes:number;devolucoesPrevistas:number;devolucoesAtrasadas:number;cobrancasVencendoHoje:number;cobrancasVencidas:number;manutencoesAbertas:number;aReceberHoje:number;valorVencido:number;aPagarHoje:number;saldoRealizado:number;proximasAcoes:{id:number;contrato:string;tipo:"ENTREGA"|"COLETA";data:string;hora:string;destino:string;cliente:string}[]}

const API = import.meta.env.VITE_API_URL || "/api";

function cookie(nome:string){return document.cookie.split("; ").find(c=>c.startsWith(nome+"="))?.slice(nome.length+1);}
async function csrf(){let token=cookie("XSRF-TOKEN");if(!token){const r=await fetch(`${API}/auth/csrf`,{credentials:"include"});if(!r.ok)throw new Error("Não foi possível iniciar a sessão segura.");token=(await r.json() as {token:string}).token;}return decodeURIComponent(token);}
async function securityHeaders(method:string):Promise<Record<string,string>>{return ["GET","HEAD","OPTIONS"].includes(method.toUpperCase())?{}:{"X-XSRF-TOKEN":await csrf()};}

async function request<T>(path: string, init?: RequestInit): Promise<T> {
  const method=init?.method||"GET";
  const headers=new Headers(init?.headers);headers.set("Content-Type","application/json");for(const[k,v]of Object.entries(await securityHeaders(method)))headers.set(k,v);
  const response = await fetch(`${API}${path}`, { ...init,credentials:"include",headers });
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
  dashboard:()=>request<DashboardApi>("/atendimento/dashboard"),
  clientes: () => request<Cliente[]>("/atendimento/clientes"),
  criarCliente: (cliente: Partial<Cliente>) => request<Cliente>("/atendimento/clientes", { method: "POST", body: JSON.stringify(cliente) }),
  atualizarCliente: (cliente: Cliente) => request<Cliente>(`/atendimento/clientes/${cliente.id}`, { method: "PUT", body: JSON.stringify(cliente) }),
  pedidos: () => request<Pedido[]>("/atendimento/pedidos"),
  criarOrcamento: (dados:Record<string,unknown>) => request<Pedido>("/atendimento/orcamentos", { method:"POST", body:JSON.stringify(dados) }),
  criarVersaoOrcamento: (numero:string,dados:Record<string,unknown>) => request<Pedido>(`/atendimento/orcamentos/${numero}/versoes`, { method:"POST", body:JSON.stringify(dados) }),
  aprovarVersaoOrcamento: (numero:string,versaoId:number) => request<Contrato>(`/atendimento/orcamentos/${numero}/versoes/${versaoId}/aprovar`, { method:"POST" }),
  contratos: () => request<Contrato[]>("/atendimento/contratos"),
  itensOperacionaisContrato:(numero:string)=>request<ContratoItemOperacionalApi[]>(`/atendimento/contratos/${numero}/itens-operacionais`),
  expedirContrato: (numero:string,alocacoes:{itemId:number;quantidade:number}[]) => request<Contrato>(`/atendimento/contratos/${numero}/expedir`, { method:"POST",body:JSON.stringify({alocacoes}) }),
  confirmarEntregaContrato:(numero:string,patrimonioCodigos:string[],documentoId:number)=>request<Contrato>(`/atendimento/contratos/${numero}/confirmar-entrega`,{method:"POST",body:JSON.stringify({patrimonioCodigos,documentoId})}),
  devolverContrato: (numero:string,patrimonioCodigos:string[]) => request<Contrato>(`/atendimento/contratos/${numero}/devolver`, { method:"POST",body:JSON.stringify({patrimonioCodigos}) }),
  inspecionarContrato: (numero:string,resultado:"APROVADO"|"MANUTENCAO",observacao="",patrimonioCodigos:string[]=[]) => request<Contrato>(`/atendimento/contratos/${numero}/inspecionar`, { method:"POST",body:JSON.stringify({resultado,observacao,patrimonioCodigos}) }),
  manutencoes: () => request<ManutencaoApi[]>("/atendimento/manutencoes"),
  abrirManutencao:(dados:{patrimonio:string;motivo:string;tipo:string;prioridade:string;fornecedor:string;previsao:string;custoEstimado:number})=>request<ManutencaoApi>("/atendimento/manutencoes",{method:"POST",body:JSON.stringify(dados)}),
  patrimonios:()=>request<PatrimonioApi[]>("/atendimento/patrimonios"),
  concluirManutencao: (id: number, observacao = "") => request<ManutencaoApi>(`/atendimento/manutencoes/${id}/concluir`, { method: "POST", body: JSON.stringify({ observacao }) }),
  agenda: () => request<AgendaApi[]>("/atendimento/agenda"),
  obras: () => request<ObraApi[]>("/atendimento/obras"),
  cobrancas: () => request<CobrancaApi[]>("/atendimento/cobrancas"),
  receberCobranca: (id:number,dados:{valor:number;forma:string;contaId:number;dataPagamento:string;observacao?:string}) => request<CobrancaApi>(`/atendimento/cobrancas/${id}/receber`,{method:"POST",body:JSON.stringify(dados)}),
  contasFinanceiras:()=>request<ContaFinanceiraApi[]>("/atendimento/financeiro/contas"),
  resumoFinanceiro:()=>request<ResumoFinanceiroApi>("/atendimento/financeiro/resumo"),
  lancamentosFinanceiros:()=>request<LancamentoFinanceiroApi[]>("/atendimento/financeiro/lancamentos"),
  criarLancamentoFinanceiro:(dados:Record<string,unknown>)=>request<LancamentoFinanceiroApi>("/atendimento/financeiro/lancamentos",{method:"POST",body:JSON.stringify(dados)}),
  baixarLancamentoFinanceiro:(id:number,dados:Record<string,unknown>)=>request<LancamentoFinanceiroApi>(`/atendimento/financeiro/lancamentos/${id}/baixar`,{method:"POST",body:JSON.stringify(dados)}),
  cancelarLancamentoFinanceiro:(id:number)=>request<LancamentoFinanceiroApi>(`/atendimento/financeiro/lancamentos/${id}/cancelar`,{method:"POST"}),
  documentosCliente: (id:string) => request<DocumentoClienteApi[]>(`/atendimento/clientes/${id}/documentos`),
  anexarDocumento: async (id:string,tipo:string,arquivo:File) => { const form=new FormData();form.append("tipo",tipo);form.append("arquivo",arquivo);const response=await fetch(`${API}/atendimento/clientes/${id}/documentos`,{method:"POST",credentials:"include",headers:await securityHeaders("POST"),body:form});if(!response.ok)throw new Error(await mensagemErro(response));return response.json() as Promise<DocumentoClienteApi>; },
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
  disponibilidadeProdutos:(inicio:string,fim:string)=>request<Record<string,number>>(`/atendimento/produtos/disponibilidade?inicio=${inicio}&fim=${fim}`),
  produto:(id:string)=>request<Produto>(`/atendimento/produtos/${id}`),
  salvarProduto:(produto:Partial<Produto>)=>request<Produto>("/atendimento/produtos",{method:"POST",body:JSON.stringify(produto)}),
  atualizarProduto:(id:string,produto:Partial<Produto>)=>request<Produto>(`/atendimento/produtos/${id}`,{method:"PUT",body:JSON.stringify(produto)}),
  categoriasProduto:()=>request<CategoriaProdutoApi[]>("/atendimento/produtos/categorias/lista"),
  salvarCategoriaProduto:(categoria:{nome:string;prefixo:string})=>request<CategoriaProdutoApi>("/atendimento/produtos/categorias",{method:"POST",body:JSON.stringify(categoria)}),
  patrimoniosProduto:(id:string)=>request<Patrimonio[]>(`/atendimento/produtos/${id}/patrimonios`),
  patrimonio:(codigo:string)=>request<PatrimonioApi>(`/atendimento/patrimonios/${encodeURIComponent(codigo)}`),
  atualizarPatrimonio:(codigo:string,dados:Partial<PatrimonioApi>)=>request<PatrimonioApi>(`/atendimento/patrimonios/${encodeURIComponent(codigo)}`,{method:"PUT",body:JSON.stringify(dados)}),
  composicoes:()=>request<ComposicaoApi[]>("/atendimento/composicoes"),
  salvarComposicao:(c:Partial<ComposicaoApi>)=>request<ComposicaoApi>("/atendimento/composicoes",{method:"POST",body:JSON.stringify(c)}),
  documentosContrato: (numero:string) => request<DocumentoClienteApi[]>(`/atendimento/contratos/${numero}/documentos`),
  anexarDocumentoContrato: async(numero:string,tipo:string,arquivo:File) => {const form=new FormData();form.append("tipo",tipo);form.append("arquivo",arquivo);const response=await fetch(`${API}/atendimento/contratos/${numero}/documentos`,{method:"POST",credentials:"include",headers:await securityHeaders("POST"),body:form});if(!response.ok)throw new Error(await mensagemErro(response));return response.json() as Promise<DocumentoClienteApi>},
  urlDocumentoContrato: (id:number) => `${API}/atendimento/contratos/documentos/${id}/arquivo`,
  urlDownloadDocumentoContrato: (id:number) => `${API}/atendimento/contratos/documentos/${id}/arquivo?download=true`,
  excluirDocumentoContrato: (id:number) => request<void>(`/atendimento/contratos/documentos/${id}`,{method:"DELETE"}),
};
export const publicApi={
  catalogo:()=>request<EquipamentoPublico[]>("/public/catalogo"),
  equipamento:(slug:string)=>request<EquipamentoPublico>(`/public/catalogo/${encodeURIComponent(slug)}`)
};

export interface UsuarioSessao{id:number;login:string;nome:string;papel:"ADMIN"|"OPERADOR"}
export interface UsuarioAdmin extends UsuarioSessao{ativo:boolean;ultimo_login_em?:string|null;criado_em:string}
export const authApi={
  me:()=>request<UsuarioSessao>("/auth/me"),
  login:(login:string,senha:string)=>request<UsuarioSessao>("/auth/login",{method:"POST",body:JSON.stringify({login,senha})}),
  logout:()=>request<void>("/auth/logout",{method:"POST"}),
};
export const adminApi={
  usuarios:()=>request<UsuarioAdmin[]>("/admin/usuarios"),
  criarUsuario:(dados:{login:string;nome:string;senha:string;papel:"ADMIN"|"OPERADOR"})=>request<UsuarioAdmin>("/admin/usuarios",{method:"POST",body:JSON.stringify(dados)}),
  editarUsuario:(id:number,dados:{nome:string;papel:"ADMIN"|"OPERADOR";ativo:boolean})=>request<UsuarioAdmin>(`/admin/usuarios/${id}`,{method:"PUT",body:JSON.stringify(dados)}),
  alterarSenha:(id:number,senha:string)=>request<void>(`/admin/usuarios/${id}/senha`,{method:"POST",body:JSON.stringify({senha})}),
};
