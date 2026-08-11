import { useNavigate } from "react-router-dom";
import { useStore } from "../data/store";
import { AGENDA, PATRIMONIOS, PRODUTOS } from "../data/mock";
import { brl } from "../lib/calc";
import { Tag } from "../components/ui";

export default function Dashboard() {
  const { contratos } = useStore();
  const nav = useNavigate();

  const entregasHoje = AGENDA.filter((a) => ["Entrega", "Retirada"].indexOf(a.tipo) >= 0).length;
  const atrasadas = contratos.filter((c) => c.situacao === "Atrasado").length;
  const inspecao = contratos.filter((c) => c.situacao === "Em inspeção").length;
  const semPgto = contratos.filter((c) => c.situacao === "Aguardando pagamento").length;

  const kpis = [
    { valor: entregasHoje, rotulo: "Entregas hoje", cor: "var(--text)", to: "/app/agenda" },
    { valor: atrasadas, rotulo: "Devolução atrasada", cor: "var(--red)", to: "/app/contratos" },
    { valor: 1, rotulo: "Pagamento vencido", cor: "var(--red)", to: "/app/receber" },
    { valor: inspecao, rotulo: "Aguardando inspeção", cor: "var(--blue)", to: "/app/manutencoes" },
    { valor: semPgto, rotulo: "Reserva sem pagamento", cor: "var(--yellow)", to: "/app/receber" },
  ];

  const cont = (estado: string) => PATRIMONIOS.filter((p) => p.estado === estado).length;
  const frota = [
    { nome: "Disponíveis", n: cont("Disponível"), cor: "var(--green)" },
    { nome: "Reservados", n: cont("Reservado"), cor: "var(--blue)" },
    { nome: "Locados", n: cont("Locado"), cor: "var(--orange)" },
    { nome: "Aguardando coleta", n: cont("Aguardando coleta"), cor: "var(--yellow)" },
    { nome: "Em inspeção", n: cont("Em inspeção"), cor: "var(--blue)" },
    { nome: "Em manutenção", n: cont("Em manutenção"), cor: "var(--red)" },
    { nome: "Torres de andaime (por quantidade)", n: PRODUTOS.find((p) => p.id === "ANDA")!.unidades!, cor: "var(--muted-2)" },
  ];

  const financeiro = [
    { rotulo: "Recebido hoje", valor: brl.format(1190), cor: "var(--green)" },
    { rotulo: "Previsto hoje", valor: brl.format(410), cor: "var(--text)" },
    { rotulo: "Vencido", valor: brl.format(1868), cor: "var(--red)" },
    { rotulo: "Faturamento do mês", valor: brl.format(6420), cor: "var(--text)" },
    { rotulo: "Caução retida", valor: brl.format(2100), cor: "var(--blue)" },
  ];

  return (
    <main className="page">
      <h1 className="h1">Atenção hoje</h1>
      <p className="lead">O que trava a operação se ninguém olhar. Cada número abre a lista correspondente.</p>

      <div className="kpi-grid" style={{ marginTop: 24, gridTemplateColumns: "repeat(auto-fill,minmax(210px,1fr))" }}>
        {kpis.map((k, i) => (
          <button key={i} className="kpi" onClick={() => nav(k.to)}>
            <span className="kpi-value" style={{ color: k.cor }}>{k.valor}</span>
            <span className="kpi-label">{k.rotulo}</span>
          </button>
        ))}
      </div>

      <div className="dash-cols" style={{ marginTop: 32, display: "grid", gridTemplateColumns: "minmax(0,1.5fr) minmax(0,1fr)", gap: 24, alignItems: "start" }}>
        <section>
          <h2 className="h2" style={{ fontSize: 22, marginBottom: 12 }}>Agenda do dia</h2>
          <div className="stack" style={{ gap: 8 }}>
            {AGENDA.map((a, i) => (
              <button key={i} className="list-row" style={{ gridTemplateColumns: "80px 1fr auto auto", background: "var(--card)", borderColor: a.alerta ? "var(--yellow)" : "var(--border)" }} onClick={() => nav(`/app/contratos/${a.contrato}`)}>
                <span className="num" style={{ fontSize: 19, color: a.alerta ? "var(--yellow)" : "var(--orange)" }}>{a.hora}</span>
                <span style={{ minWidth: 0 }}>
                  <span style={{ display: "block", fontWeight: 600 }}>{a.titulo}</span>
                  <span style={{ display: "block", fontSize: 13, color: "var(--muted)" }}>{a.sub}</span>
                </span>
                <Tag cor={a.alerta ? "var(--yellow)" : "var(--green)"}>{a.tipo}</Tag>
                <span className="mono" style={{ fontSize: 12, color: "var(--muted-2)", whiteSpace: "nowrap" }}>{a.ref}</span>
              </button>
            ))}
          </div>
        </section>

        <aside className="stack" style={{ gap: 20 }}>
          <div className="card">
            <h2 className="h2" style={{ marginBottom: 14 }}>Situação da frota</h2>
            <div className="stack" style={{ gap: 8 }}>
              {frota.map((f) => (
                <div key={f.nome} style={{ display: "grid", gridTemplateColumns: "10px 1fr auto", gap: 10, alignItems: "center" }}>
                  <span style={{ width: 10, height: 10, borderRadius: 999, background: f.cor }} />
                  <span style={{ fontSize: 14, color: "var(--muted)" }}>{f.nome}</span>
                  <span className="num" style={{ fontSize: 18 }}>{f.n}</span>
                </div>
              ))}
            </div>
          </div>
          <div className="card">
            <h2 className="h2" style={{ marginBottom: 14 }}>Financeiro do dia</h2>
            <div className="stack" style={{ gap: 8 }}>
              {financeiro.map((f, i) => (
                <div key={i} style={{ display: "flex", justifyContent: "space-between", gap: 12 }}>
                  <span style={{ fontSize: 14, color: "var(--muted)" }}>{f.rotulo}</span>
                  <span className="num" style={{ fontSize: 18, color: f.cor }}>{f.valor}</span>
                </div>
              ))}
            </div>
            <p style={{ margin: "14px 0 0", fontSize: 12, color: "var(--muted-2)" }}>Caução não entra como receita. Fica separada até o encerramento da locação.</p>
          </div>
        </aside>
      </div>
    </main>
  );
}
