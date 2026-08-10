import { useState } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { DADOS, CATEGORIAS } from "../data/catalogo";
import { imgOf } from "../lib/images";
import { openWhatsApp } from "../lib/whatsapp";

export default function Catalogo() {
  const nav = useNavigate(); const [params] = useSearchParams();
  const [texto, setTexto] = useState(""); const [categoria, setCategoria] = useState("");
  const servico = params.get("servico") || "";
  const lista = DADOS.filter((eq) => (!categoria || eq.categoria === categoria) && (!servico || eq.servico === servico) && (!texto || `${eq.nome} ${eq.marca} ${eq.modelo} ${eq.categoria} ${eq.aplicacao}`.toLowerCase().includes(texto.toLowerCase())));
  return <main className="site-wrap" style={{ padding: "40px 0 80px" }}>
    <div className="row" style={{ gap: 8, fontSize: 13 }}><button className="link-back" onClick={() => nav("/site")}>Início</button><span>/</span><span className="muted">Catálogo</span></div>
    <h1 className="h1" style={{ fontSize: "clamp(2.25rem,4vw,3rem)", marginTop: 12 }}>Equipamentos disponíveis na loja</h1>
    <p className="muted" style={{ marginTop: 8, fontSize: 16 }}>{lista.length} {lista.length === 1 ? "equipamento" : "equipamentos"} · consulte valores e disponibilidade pelo WhatsApp</p>
    <div className="cat-cols" style={{ marginTop: 32, display: "grid", gridTemplateColumns: "260px 1fr", gap: 32, alignItems: "start" }}>
      <aside className="card" style={{ position: "sticky", top: 96, display: "flex", flexDirection: "column", gap: 18 }}>
        <div><div className="uplabel" style={{ marginBottom: 6 }}>Buscar</div><input className="input" value={texto} onChange={(e) => setTexto(e.target.value)} placeholder="modelo, marca, equipamento..." /></div>
        <div><div className="uplabel" style={{ marginBottom: 10 }}>Categoria</div><div className="stack" style={{ gap: 6 }}><Filter label="Todas" active={!categoria} onClick={() => setCategoria("")} />{CATEGORIAS.map(c => <Filter key={c} label={c} active={categoria === c} onClick={() => setCategoria(categoria === c ? "" : c)} />)}</div></div>
        <button className="btn btn-primary" onClick={() => openWhatsApp("Olá! Gostaria de receber orientação para escolher um equipamento para minha obra.")}>Pedir orientação</button>
      </aside>
      <div><div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill,minmax(280px,1fr))", gap: 24 }}>{lista.map(eq => <article key={eq.slug} className="eq-card">
        <div className="ph" style={{ backgroundImage: `url(${imgOf(eq.img)})` }} />
        <div style={{ padding: 20, display: "flex", flexDirection: "column", gap: 10, flex: 1 }}>
          <div className="uplabel" style={{ color: "var(--muted-2)" }}>{eq.marca} · {eq.modelo}</div><h3 style={{ fontFamily: "var(--head)", fontWeight: 600, fontSize: 22, margin: 0 }}>{eq.nome}</h3><p className="muted" style={{ margin: 0, fontSize: 14, flex: 1 }}>{eq.aplicacao}</p>
          <button className="btn btn-ghost" onClick={() => nav(`/site/equipamento/${eq.slug}`)}>Ver detalhes</button>
          <button className="btn btn-primary" onClick={() => openWhatsApp(`Olá! Tenho interesse em alugar o equipamento ${eq.nome} (${eq.marca} ${eq.modelo}). Gostaria de consultar valor e disponibilidade.`)}>Consultar no WhatsApp</button>
        </div></article>)}</div>{!lista.length && <div className="empty">Nenhum equipamento com esses filtros.</div>}</div>
    </div>
  </main>;
}
function Filter({ label, active, onClick }: { label: string; active: boolean; onClick: () => void }) { return <button onClick={onClick} style={{ minHeight: 40, padding: "0 12px", border: `1px solid ${active ? "var(--orange)" : "var(--border)"}`, borderRadius: 8, background: "var(--input)", color: active ? "var(--orange)" : "var(--muted)", textAlign: "left", cursor: "pointer" }}>{label}</button>; }
