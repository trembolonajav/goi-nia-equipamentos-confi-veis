import { useEffect, useState } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { PageHeader, Tag, useToast } from "../components/ui";
import { brl } from "../lib/calc";
import { atendimentoApi, type CobrancaApi, type ContaFinanceiraApi } from "../lib/api";

const hoje = () => new Date().toISOString().slice(0, 10);

export default function Receber() {
  const [lista, setLista] = useState<CobrancaApi[]>([]);
  const [contas, setContas] = useState<ContaFinanceiraApi[]>([]);
  const [erro, setErro] = useState("");
  const [selecionada, setSelecionada] = useState<CobrancaApi | null>(null);
  const [valor, setValor] = useState("");
  const [forma, setForma] = useState("Pix");
  const [contaId, setContaId] = useState(0);
  const [dataPagamento, setDataPagamento] = useState(hoje());
  const [observacao, setObservacao] = useState("");
  const [salvando, setSalvando] = useState(false);
  const nav = useNavigate();
  const [params] = useSearchParams();
  const { toast } = useToast();

  const carregar = () => Promise.all([
    atendimentoApi.cobrancas(),
    atendimentoApi.contasFinanceiras(),
  ]).then(([cobrancas, contasAtivas]) => {
    setLista(cobrancas);
    setContas(contasAtivas);
    setContaId(atual => atual || contasAtivas[0]?.id || 0);
    setErro("");
  }).catch(() => setErro("Não foi possível carregar as cobranças."));

  useEffect(() => { void carregar(); }, []);

  function abrir(cobranca: CobrancaApi) {
    setSelecionada(cobranca);
    setValor(String(cobranca.saldo));
    setForma("Pix");
    setDataPagamento(hoje());
    setObservacao("");
  }

  async function receber() {
    if (!selecionada) return;
    const numero = Number(valor.replace(",", "."));
    if (!Number.isFinite(numero) || numero <= 0) return toast("Informe um valor válido.");
    if (!contaId) return toast("Selecione a conta que recebeu o valor.");
    setSalvando(true);
    try {
      await atendimentoApi.receberCobranca(selecionada.id, {
        valor: numero,
        forma,
        contaId,
        dataPagamento,
        observacao,
      });
      toast("Recebimento registrado e lançado na conta selecionada.");
      setSelecionada(null);
      await carregar();
    } catch (e) {
      toast(e instanceof Error ? e.message : "Não foi possível registrar o recebimento.");
    } finally {
      setSalvando(false);
    }
  }

  const vencido = lista.filter(c => c.status === "VENCIDA").reduce((a, c) => a + Number(c.saldo), 0);
  const aberto = lista.filter(c => c.status !== "PAGA").reduce((a, c) => a + Number(c.saldo), 0);
  const recebido = lista.reduce((a, c) => a + Number(c.recebido), 0);

  const filtro = params.get("filtro");
  const exibida = lista.filter(c => filtro === "hoje" ? c.vencimento === hoje() && c.status !== "PAGA" : filtro === "vencidas" ? c.status === "VENCIDA" : true);
  return <main className="page" style={{ maxWidth: 1300 }}>
    <PageHeader title="Cobranças" sub="Valores devidos pelos clientes. Cada recebimento informa a conta, forma e data reais." action={<button className="btn btn-ghost" onClick={carregar}>Atualizar</button>} />
    <div className="grid" style={{ gridTemplateColumns: "repeat(3,1fr)", marginTop: 20 }}>
      {[["Vencido", vencido, "var(--red)"], ["Em aberto", aberto, "var(--yellow)"], ["Recebido", recebido, "var(--green)"]].map(k => <div className="card-tight" key={String(k[0])}><div className="uplabel">{k[0]}</div><div className="num" style={{ fontSize: 25, color: String(k[2]) }}>{brl.format(Number(k[1]))}</div></div>)}
    </div>
    <div className="list-head" style={{ marginTop: 24, gridTemplateColumns: "100px 1.3fr 130px 120px 130px 160px" }}><span>Cobrança</span><span>Cliente</span><span>Vencimento</span><span>Situação</span><span>Saldo</span><span>Ação</span></div>
    <div className="list">
      {exibida.map(c => <div key={c.id} className="list-row" style={{ gridTemplateColumns: "100px 1.3fr 130px 120px 130px 160px", cursor: "default" }}>
        <button className="link-back mono orange" onClick={() => nav(`/app/contratos/${c.contrato}`)}>CB-{String(c.id).padStart(5, "0")}</button>
        <span><strong>{c.cliente}</strong><small style={{ display: "block", color: "var(--muted)" }}>{c.descricao} · {c.contrato}</small></span>
        <span>{c.vencimento.split("-").reverse().join("/")}</span>
        <Tag cor={c.status === "PAGA" ? "var(--green)" : c.status === "VENCIDA" ? "var(--red)" : "var(--yellow)"}>{c.status}</Tag>
        <span className="num">{brl.format(Number(c.saldo))}</span>
        <span>{c.status !== "PAGA" && <button className="btn btn-primary btn-sm" onClick={() => abrir(c)}>Registrar recebimento</button>}</span>
      </div>)}
      {!erro && !exibida.length && <div className="empty">Nenhuma cobrança real para este filtro.</div>}
      {erro && <div className="empty" style={{ color: "var(--red)" }}>{erro}</div>}
    </div>
    {selecionada && <div className="document-modal"><div className="issue-modal">
      <header><div><div className="uplabel">CB-{String(selecionada.id).padStart(5, "0")}</div><h2 className="h2">Registrar recebimento</h2></div><button className="document-modal-close" onClick={() => setSelecionada(null)}>×</button></header>
      <div className="card-tight" style={{ marginBottom: 16 }}><strong>{selecionada.cliente}</strong><small style={{ display: "block", color: "var(--muted)" }}>Saldo pendente: {brl.format(Number(selecionada.saldo))}</small></div>
      <div className="form-grid">
        <label className="field"><span>Valor recebido</span><input className="input" value={valor} onChange={e => setValor(e.target.value)} inputMode="decimal" /></label>
        <label className="field"><span>Data do pagamento</span><input className="input" type="date" value={dataPagamento} onChange={e => setDataPagamento(e.target.value)} /></label>
        <label className="field"><span>Forma de pagamento</span><select className="select" value={forma} onChange={e => setForma(e.target.value)}>{["Pix", "Dinheiro", "Boleto", "Cartão de crédito", "Cartão de débito", "Transferência"].map(f => <option key={f}>{f}</option>)}</select></label>
        <label className="field"><span>Conta de entrada</span><select className="select" value={contaId} onChange={e => setContaId(Number(e.target.value))}><option value={0}>Selecione...</option>{contas.map(c => <option key={c.id} value={c.id}>{c.nome} · {c.tipo}</option>)}</select></label>
        <label className="field" style={{ gridColumn: "1/-1" }}><span>Observação</span><textarea className="textarea" value={observacao} onChange={e => setObservacao(e.target.value)} placeholder="Número do comprovante, referência ou observação interna" /></label>
      </div>
      <p className="muted" style={{ fontSize: 13 }}>O pagamento será preservado no histórico e criará uma entrada na conta escolhida.</p>
      <div className="row" style={{ justifyContent: "flex-end" }}><button className="btn btn-ghost" onClick={() => setSelecionada(null)}>Cancelar</button><button className="btn btn-primary" disabled={salvando} onClick={receber}>{salvando ? "Registrando..." : "Confirmar recebimento"}</button></div>
    </div></div>}
  </main>;
}
