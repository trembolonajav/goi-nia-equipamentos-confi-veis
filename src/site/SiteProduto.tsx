import { useNavigate, useParams } from "react-router-dom";
import { DADOS } from "../data/catalogo";
import { imgOf } from "../lib/images";
import { openWhatsApp } from "../lib/whatsapp";

export default function SiteProduto() {
  const { slug } = useParams(); const nav = useNavigate(); const eq = DADOS.find(e => e.slug === slug);
  if (!eq) return <main className="site-wrap" style={{ padding: 60 }}><div className="empty">Equipamento não encontrado.</div></main>;
  const msg = `Olá! Tenho interesse em alugar o equipamento ${eq.nome} (${eq.marca} ${eq.modelo}). Gostaria de consultar valor, disponibilidade e condições de locação.`;
  return <main className="site-wrap" style={{ padding: "40px 0 80px" }}>
    <div className="row" style={{ gap: 8, fontSize: 13 }}><button className="link-back" onClick={() => nav("/site")}>Início</button><span>/</span><button className="link-back" onClick={() => nav("/site/catalogo")}>Catálogo</button><span>/</span><span className="muted">{eq.nome}</span></div>
    <div className="site-cols-2" style={{ marginTop: 24, display: "grid", gridTemplateColumns: "1.15fr .85fr", gap: 40, alignItems: "start" }}>
      <div><div style={{ aspectRatio: "4 / 3", border: "1px solid var(--border)", borderRadius: 16, background: `var(--card) center/cover no-repeat url(${imgOf(eq.img)})` }} />
        <div style={{ marginTop: 32 }}><div className="uplabel">{eq.categoria}</div><h1 className="h1" style={{ fontSize: "clamp(2.25rem,4vw,3rem)", marginTop: 8 }}>{eq.nome}</h1><p style={{ color: "var(--orange)", fontWeight: 600 }}>{eq.marca} · {eq.modelo}</p><p className="muted" style={{ marginTop: 16, fontSize: 17 }}>{eq.descricao}</p></div>
        <div className="grid" style={{ gridTemplateColumns: "repeat(auto-fit,minmax(150px,1fr))", marginTop: 24 }}>{eq.specs.map(s => <div key={s.label} className="card" style={{ padding: 16 }}><div className="uplabel">{s.label}</div><div style={{ fontFamily: "var(--head)", fontWeight: 600, fontSize: 19, marginTop: 4 }}>{s.valor}</div></div>)}</div>
        <div className="site-cols-2" style={{ marginTop: 32, display: "grid", gridTemplateColumns: "1fr 1fr", gap: 24 }}><List title="Requisitos no local" items={eq.requisitos} /><List title="Cuidados de uso" items={eq.cuidados} /></div>
        <div className="card" style={{ marginTop: 24 }}><div className="uplabel" style={{ color: "var(--yellow)" }}>Não indicado para</div><p className="muted" style={{ margin: "8px 0 0" }}>{eq.naoIndicado}</p></div>
      </div>
      <aside className="card" style={{ position: "sticky", top: 96 }}><div className="uplabel" style={{ color: "var(--orange)" }}>Atendimento personalizado</div><h2 className="h2" style={{ marginTop: 8 }}>Consulte a locação</h2><p className="muted">Valores, disponibilidade, prazo, retirada ou entrega são confirmados diretamente com a equipe da LOCAGO.</p><div className="card-tight" style={{ margin: "20px 0" }}><div style={{ fontWeight: 600 }}>{eq.nome}</div><div className="muted" style={{ fontSize: 13 }}>{eq.marca} · {eq.modelo}</div></div><button className="btn btn-primary btn-block" style={{ minHeight: 52, fontSize: 16 }} onClick={() => openWhatsApp(msg)}>Consultar pelo WhatsApp</button><p className="muted" style={{ textAlign: "center", fontSize: 12, marginBottom: 0 }}>A mensagem já será aberta com este equipamento identificado.</p></aside>
    </div>
  </main>;
}
function List({ title, items }: { title: string; items: string[] }) { return <div><h2 className="h2" style={{ fontSize: 22, marginBottom: 12 }}>{title}</h2><ul className="muted" style={{ paddingLeft: 18, display: "flex", flexDirection: "column", gap: 6 }}>{items.map(x => <li key={x}>{x}</li>)}</ul></div>; }
