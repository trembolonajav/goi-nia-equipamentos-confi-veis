import { useNavigate, useParams } from "react-router-dom";
import { useStore } from "../data/store";
import { EXTRAS, STATUS_PEDIDO } from "../data/mock";
import { Tag, Thumb, useToast } from "../components/ui";
import { brl, periodoCurto } from "../lib/calc";

export default function PedidoDetalhe() {
  const { num } = useParams();
  const { getPedido, getCliente, getProduto, aprovarPedido } = useStore();
  const { toast } = useToast();
  const nav = useNavigate();

  const p = getPedido(num!);
  if (!p) return <main className="page"><div className="empty">Pedido não encontrado.</div></main>;
  const cli = getCliente(p.clienteId);
  const linhas = p.itens.map((i) => {
    const prod = getProduto(i.prod);
    return { nome: i.nome || prod?.nome || i.prod, qtd: i.qtd, img: prod?.img || "", modalidade: i.tipoPreco || "Preço congelado", valor: Number(i.valor || 0) };
  });
  const bruto = Number(p.valorLocacao ?? linhas.reduce((a, l) => a + l.valor, 0));
  const serv = Number(p.valorServicos ?? (p.servicosDetalhes?.reduce((a,e)=>a+Number(e.valor),0) ?? 0));
  const total = Number(p.valorTotal ?? (bruto + serv + (p.frete||0) - p.desconto));
  const podeAprovar = ["Orçamento enviado", "Aguardando aprovação"].indexOf(p.status) >= 0;

  async function aprovar() {
    try {
      const ct = await aprovarPedido(p!.num);
      if (ct) { toast(`Contrato ${ct.numero} gerado.`); nav(`/app/contratos/${ct.numero}`); }
    } catch { toast("Não foi possível aprovar: confira a disponibilidade ou a conexão com o servidor."); }
  }

  return (
    <main className="page" style={{ maxWidth: 1200 }}>
      <button className="link-back" onClick={() => nav("/app/pedidos")}>← Pedidos</button>
      <div className="spread" style={{ marginTop: 12, alignItems: "flex-start" }}>
        <div>
          <div className="uplabel">Pedido</div>
          <h1 className="h1" style={{ fontSize: 34, color: "var(--orange)" }}>{p.num}</h1>
          <p className="lead">{cli?.nome} · {p.obra || "Retirada na loja"} · {periodoCurto(p.inicio, p.fim)}</p>
        </div>
        <div className="row wrap" style={{ gap: 8 }}>
          <Tag cor={STATUS_PEDIDO[p.status]}>{p.status}</Tag>
          <button className="btn btn-ghost" onClick={()=>nav(`/app/pedidos/${p.num}/orcamento`)}>Visualizar orçamento</button>
          {podeAprovar && <button className="btn btn-green" onClick={aprovar}>Aprovar e gerar contrato</button>}
          {p.status === "Aprovado" && p.contrato && <button className="btn btn-primary" onClick={() => nav(`/app/contratos/${p.contrato}`)}>Abrir contrato</button>}
        </div>
      </div>

      <div className="dash-cols" style={{ marginTop: 24, display: "grid", gridTemplateColumns: "1fr 340px", gap: 24, alignItems: "start" }}>
        <div className="stack" style={{ gap: 20 }}>
          <section className="card">
            <h2 className="h2" style={{ marginBottom: 12 }}>Itens</h2>
            <div className="stack" style={{ gap: 8 }}>
              {linhas.map((l, i) => (
                <div key={i} className="card-tight" style={{ display: "grid", gridTemplateColumns: "56px 1fr auto auto", gap: 14, alignItems: "center" }}>
                  <Thumb img={l.img} w={48} h={40} />
                  <div><div style={{ fontWeight: 600 }}>{l.qtd}× {l.nome}</div><div style={{ fontSize: 12, color: "var(--muted-2)" }}>{l.modalidade}</div></div>
                  <span />
                  <span className="num" style={{ fontSize: 18, whiteSpace: "nowrap" }}>{brl.format(l.valor)}</span>
                </div>
              ))}
              {p.servicos.map((s, i) => {
                const e = p.servicosDetalhes?.find(x=>x.nome===s) ?? EXTRAS.find((x) => x.nome === s);
                return <div key={`s${i}`} className="card-tight" style={{ display: "flex", justifyContent: "space-between" }}><span>{s} <span className="muted-2" style={{ fontSize: 12 }}>({e?.natureza})</span></span><span className="num" style={{ fontSize: 18 }}>{brl.format(e?.valor || 0)}</span></div>;
              })}
            </div>
          </section>

          {p.versoes.length > 0 && (
            <section className="card">
              <h2 className="h2" style={{ marginBottom: 4 }}>Versões do orçamento</h2>
              <p className="section-note">Cada negociação gera uma versão nova, e a anterior fica arquivada. É assim que você sabe qual preço foi enviado ao cliente e quando.</p>
              <div className="stack" style={{ gap: 8 }}>
                {p.versoes.slice().reverse().map((v) => (
                  <div key={v.v} className="card-tight" style={{ display: "grid", gridTemplateColumns: "130px 1fr auto auto", gap: 14, alignItems: "center", borderColor: v.ativa ? "var(--orange)" : "var(--border)" }}>
                    <span style={{ fontWeight: 600 }}>Orçamento v{v.v}</span>
                    <span style={{ fontSize: 13, color: "var(--muted)" }}>{v.nota}</span>
                    <Tag cor={v.ativa ? "var(--orange)" : "var(--muted-2)"}>{v.ativa ? "Vigente" : "Substituída"}</Tag>
                    <span className="num" style={{ fontSize: 18 }}>{brl.format(v.valor)}</span><button className="btn btn-ghost btn-sm" onClick={()=>nav(`/app/pedidos/${p.num}/orcamento`)}>Abrir documento</button>
                  </div>
                ))}
              </div>
            </section>
          )}

          <section className="card">
            <h2 className="h2" style={{ marginBottom: 16 }}>Linha do tempo</h2>
            <div className="stack" style={{ gap: 16 }}>
              {p.linha.slice().reverse().map((e, i) => (
                <div key={i} style={{ display: "grid", gridTemplateColumns: "10px 1fr auto", gap: 12, alignItems: "start" }}>
                  <span style={{ width: 10, height: 10, borderRadius: 999, background: i === 0 ? "var(--orange)" : "var(--border)", marginTop: 5 }} />
                  <div><div style={{ fontWeight: 600 }}>{e.t}</div><div style={{ fontSize: 13, color: "var(--muted)" }}>{e.d}</div></div>
                  <div style={{ textAlign: "right", fontSize: 12, color: "var(--muted-2)", whiteSpace: "nowrap" }}><div>{e.q}</div><div>{e.a}</div></div>
                </div>
              ))}
            </div>
          </section>
        </div>

        <aside className="card">
          <div className="uplabel">Resumo financeiro</div>
          <div className="stack" style={{ gap: 8, marginTop: 12, fontSize: 14 }}>
            <L r="Locação" v={brl.format(bruto)} />
            <L r="Serviços e mercadorias" v={serv ? brl.format(serv) : "—"} />
            {Boolean(p.frete)&&<L r="Entrega e coleta" v={brl.format(p.frete||0)} />}
            <L r="Desconto" v={p.desconto ? "− " + brl.format(p.desconto) : "—"} />
          </div>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "baseline", paddingTop: 12, marginTop: 12, borderTop: "1px solid var(--border)" }}>
            <span style={{ fontWeight: 600 }}>Total</span>
            <span className="num" style={{ fontSize: 26, color: "var(--orange)" }}>{brl.format(total)}</span>
          </div>
          <div className="divider" style={{ marginTop: 16, paddingTop: 12 }}>
            <L r="Forma" v={p.forma} /><L r="Criado" v={`${p.criado} · ${p.autor}`} />
          </div>
        </aside>
      </div>
    </main>
  );
}

function L({ r, v, cor }: { r: string; v: string; cor?: string }) {
  return <div style={{ display: "flex", justifyContent: "space-between", gap: 12, fontSize: 14 }}><span className="muted">{r}</span><span style={{ textAlign: "right", color: cor }}>{v}</span></div>;
}
