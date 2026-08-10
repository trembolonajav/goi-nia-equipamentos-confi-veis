// ---------- Domínio LOCAGO (protótipo) ----------

export type SituacaoCliente = "ativo" | "bloqueado" | "inativo";
export type TipoPessoa = "PF" | "PJ";

export interface DocumentoCliente {
  nome: string;
  situacao: "ok" | "pendente" | "vencido";
}

export interface Cliente {
  id: string;
  tipo: TipoPessoa;
  nome: string;
  doc: string; // CPF / CNPJ
  inscricao?: string;
  tel: string;
  email?: string;
  endereco?: string;
  cidade?: string;
  situacao: SituacaoCliente;
  condicaoPagamento: string;
  limiteCredito: number;
  desde: string; // ISO
  autorizados?: string;
  obs?: string;
  docs: DocumentoCliente[];
}

export interface Obra {
  id: string;
  clienteId: string;
  nome: string;
  endereco: string;
  responsavel?: string;
  restricao?: string;
  frete: number;
  situacao: "ativa" | "encerrada";
}

export type TipoControle = "patrimonio" | "quantidade" | "consumo";

export interface TabelaPreco {
  diaria: number;
  semanal: number;
  quinzenal: number;
  mensal: number;
}

export interface Produto {
  id: string;
  nome: string;
  categoria: string;
  tipoControle: TipoControle;
  tabela: TabelaPreco;
  caucao: number;
  reposicao: number;
  imagem: string; // chave do asset
  publicar: boolean;
  estoque?: number; // usado quando controle = quantidade/consumo
  ativo: boolean;
}

export type EstadoPatrimonio = "disponivel" | "locado" | "manutencao" | "avariado" | "baixado";

export interface Patrimonio {
  id: string;
  produtoId: string;
  codigo: string;
  serie: string;
  horimetro: string;
  estado: EstadoPatrimonio;
  local: string;
}

export interface ItemPedido {
  produtoId: string;
  qtd: number;
  valorUnit: number; // valor de locação do período por unidade
}

export interface ExtraPedido {
  nome: string;
  natureza: "servico" | "venda";
  valor: number;
}

export interface LinhaMemoria {
  linha: string;
  valor: string;
}

export type StatusPedido = "orcamento" | "aprovado" | "cancelado";

export interface Pedido {
  id: string;
  numero: string;
  clienteId: string;
  obraId: string | null;
  modoEntrega: "entrega" | "retirada";
  inicio: string;
  fim: string;
  itens: ItemPedido[];
  extras: ExtraPedido[];
  formaPagamento: string;
  status: StatusPedido;
  versao: number;
  locacao: number;
  extrasTotal: number;
  caucao: number;
  frete: number;
  total: number;
  memoria: LinhaMemoria[];
  contratoId?: string;
  criadoEm: string;
}

export type EstadoItemContrato = "a_expedir" | "locado" | "encerrado";
export type SituacaoContrato = "aguardando_expedicao" | "em_andamento" | "encerrado" | "cancelado";
export type PagamentoContrato = "pago" | "a_faturar" | "vencido";

export interface ItemContrato {
  produtoId: string;
  patrimonioId: string | null;
  qtd: number;
  valor: number;
  estado: EstadoItemContrato;
}

export interface EventoTimeline {
  titulo: string;
  detalhe: string;
  quando: string;
  autor: string;
}

export interface Contrato {
  id: string;
  numero: string;
  pedidoId: string;
  clienteId: string;
  obraId: string | null;
  modoEntrega: "entrega" | "retirada";
  inicio: string;
  fim: string;
  itens: ItemContrato[];
  situacao: SituacaoContrato;
  pagamento: PagamentoContrato;
  locacao: number;
  extrasTotal: number;
  frete: number;
  total: number;
  caucao: number;
  memoria: LinhaMemoria[];
  timeline: EventoTimeline[];
  criadoEm: string;
}

export type SituacaoCobranca = "aberto" | "recebido" | "vencido";

export interface Cobranca {
  id: string;
  ref: string;
  contratoId: string;
  clienteId: string;
  descricao: string;
  vencimento: string;
  valor: number;
  situacao: SituacaoCobranca;
}

export interface Usuario {
  login: string;
  senha: string;
  nome: string;
  papel: string;
}

export interface Database {
  clientes: Cliente[];
  obras: Obra[];
  produtos: Produto[];
  patrimonios: Patrimonio[];
  pedidos: Pedido[];
  contratos: Contrato[];
  cobrancas: Cobranca[];
  seq: Record<string, number>;
}
