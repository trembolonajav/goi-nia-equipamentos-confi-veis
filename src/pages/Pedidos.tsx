import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useStore } from "../data/store";
import { STATUS_PEDIDO } from "../data/mock";
import { PageHeader, Tag } from "../components/ui";
import { brl, periodoCurto } from "../lib/calc";

const FILTROS = ["Abertos", "Rascunhos", "Orçamento enviado", "Aguardando aprovação", "Aprovados", "Cancelados", "Todos"];

function passa(status: string, f: string): boolean {
  if (f === "Todos") return true;
  if (f === "Abertos") return ["Rascunho", "Orçamento enviado", "Aguardando aprovação"].indexOf(status) >= 0;
  if (f === "Rascunhos") return status === "Rascunho";
  if (f === "Aprovados") return status === "Aprovado";
  if (f === "Cancelados") return status === "Cancelado";
  return status === f;
}

export default function Pedidos() {
  const { pedidos, getCliente, getProduto } = useStore();
  const nav = useNavigate();
  const [filtro, setFiltro] = useState("Abertos");

  const lista = pedidos.filter((p) => passa(p.status, filtro));

  return (
    <main className="page" style={{ maxWidth: 1300 }}>
      <PageHeader
        title="Pedidos"
        sub="O pedido é a negociação. Ele guarda cliente, obra, período, itens, preço e todas as versões de orçamento até o cliente decidir. Contrato só nasce de pedido aprovado."
        action={<button className="btn btn-primary" onClick={() => nav("/app/nova-locacao")}>Novo pedido</button>}
      />
      <div className="row wrap" style={{ gap: 8, marginTop: 20 }}>
        {FILTROS.map((f) => <button key={f} className={`chip${filtro === f ? " on" : ""}`} onClick={() => setFiltro(f)}>{f}</button>)}
      </div>
      <div className="list-head" style={{ marginTop: 24, gridTemplateColumns: "130px 1.4fr 1fr 190px 60px 110px" }}>
        <span>Pedido</span><span>Cliente e itens</span><span>Período</span><span>Situação</span><span>Ver.</span><span style={{ textAlign: "right" }}>Valor</span>
      </div>
      <div className="list">
        {lista.map((p) => {
          const v = (p.versoes.find((x) => x.ativa) || p.versoes[p.versoes.length - 1]);
          return (
            <button key={p.num} className="list-row" style={{ gridTemplateColumns: "130px 1.4fr 1fr 190px 60px 110px" }} onClick={() => nav(`/app/pedidos/${p.num}`)}>
              <span className="mono orange" style={{ fontSize: 13 }}>{p.num}</span>
              <span style={{ minWidth: 0 }}>
                <span style={{ display: "block", fontWeight: 600 }}>{getCliente(p.clienteId)?.nome}</span>
                <span style={{ display: "block", fontSize: 13, color: "var(--muted)" }}>{p.itens.map((i) => `${i.qtd}× ${getProduto(i.prod)?.nome}`).join(", ")}</span>
              </span>
              <span style={{ fontSize: 13, color: "var(--muted)" }}>{periodoCurto(p.inicio, p.fim)}</span>
              <span><Tag cor={STATUS_PEDIDO[p.status]}>{p.status}</Tag></span>
              <span className="mono" style={{ fontSize: 12, color: "var(--muted-2)", textAlign: "center" }}>{p.versoes.length ? "v" + p.versoes.length : "—"}</span>
              <span className="num" style={{ fontSize: 19, whiteSpace: "nowrap", textAlign: "right" }}>{v ? brl.format(v.valor) : "sem orç."}</span>
            </button>
          );
        })}
        {lista.length === 0 && <div className="empty">Nenhum pedido nesse filtro.</div>}
      </div>
    </main>
  );
}
