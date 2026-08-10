import type { ReactNode } from "react";
import { PageHeader, Tag } from "./ui";
import { brl } from "../lib/calc";

export interface Linha {
  ref: string;
  titulo: string;
  sub: string;
  meio: string;
  situacao: string;
  cor: string;
  valor: number | string;
  onClick?: () => void;
}

export interface Filtro { nome: string; ativo: boolean; onClick: () => void; }

export function Chips({ filtros }: { filtros: Filtro[] }) {
  return (
    <div className="row wrap" style={{ gap: 8, marginTop: 20 }}>
      {filtros.map((f) => (
        <button key={f.nome} className={`chip${f.ativo ? " on" : ""}`} onClick={f.onClick}>{f.nome}</button>
      ))}
    </div>
  );
}

export interface Kpi { rotulo: string; valor: string; nota: string; cor: string; }

export function KpiRow({ kpis }: { kpis: Kpi[] }) {
  return (
    <div className="kpi-grid" style={{ marginTop: 24, gridTemplateColumns: "repeat(auto-fill,minmax(220px,1fr))" }}>
      {kpis.map((k, i) => (
        <div key={i} className="card" style={{ padding: 18 }}>
          <div className="uplabel">{k.rotulo}</div>
          <div className="num" style={{ fontSize: 30, lineHeight: 1.1, color: k.cor }}>{k.valor}</div>
          <div style={{ fontSize: 12, color: "var(--muted)" }}>{k.nota}</div>
        </div>
      ))}
    </div>
  );
}

export function ListaView({
  titulo, sub, acao, onAcao, cols, linhas, filtros, kpis, children,
}: {
  titulo: string; sub?: string; acao?: string; onAcao?: () => void;
  cols: [string, string, string, string, string];
  linhas: Linha[]; filtros?: Filtro[]; kpis?: Kpi[]; children?: ReactNode;
}) {
  const grid = "130px minmax(0,1.4fr) minmax(0,1fr) 180px 110px";
  return (
    <main className="page">
      <PageHeader title={titulo} sub={sub} action={acao ? <button className="btn btn-primary" onClick={onAcao}>{acao}</button> : undefined} />
      {kpis && <KpiRow kpis={kpis} />}
      {filtros && <Chips filtros={filtros} />}
      {children}
      <div className="list-head" style={{ marginTop: 24, gridTemplateColumns: grid }}>
        <span>{cols[0]}</span><span>{cols[1]}</span><span>{cols[2]}</span><span>{cols[3]}</span><span style={{ textAlign: "right" }}>{cols[4]}</span>
      </div>
      <div className="list">
        {linhas.map((l, i) => (
          <button key={i} className="list-row" style={{ gridTemplateColumns: grid }} onClick={l.onClick}>
            <span className="mono orange" style={{ fontSize: 13 }}>{l.ref}</span>
            <span style={{ minWidth: 0 }}>
              <span style={{ display: "block", fontWeight: 600 }}>{l.titulo}</span>
              <span style={{ display: "block", fontSize: 13, color: "var(--muted)" }}>{l.sub}</span>
            </span>
            <span style={{ minWidth: 0, fontSize: 13, color: "var(--muted)" }}>{l.meio}</span>
            <span><Tag cor={l.cor}>{l.situacao}</Tag></span>
            <span className="num" style={{ fontSize: 19, whiteSpace: "nowrap", textAlign: "right" }}>{typeof l.valor === "number" ? brl.format(l.valor) : l.valor}</span>
          </button>
        ))}
        {linhas.length === 0 && <div className="empty">Nada aqui no momento.</div>}
      </div>
    </main>
  );
}
