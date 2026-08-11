import { useEffect, useMemo, useState } from "react";
import { NavLink, Outlet, useLocation, useNavigate } from "react-router-dom";
import { useStore } from "../data/store";
import { useAuth } from "../auth/AuthContext";
import { monograma } from "../lib/images";
import { type Produto } from "../data/mock";
import { atendimentoApi, type PatrimonioApi } from "../lib/api";

interface Item { to: string; label: string; badge?: string; }
interface Grupo { grupo?: string; itens: Item[]; }

function grupoDaRota(pathname: string): string | null {
  if (["/app/nova-locacao", "/app/pedidos", "/app/clientes"].some((p) => pathname === p || pathname.startsWith(p + "/"))) return "Atendimento";
  if (["/app/contratos", "/app/expedicoes", "/app/devolucoes", "/app/trocas", "/app/ocorrencias"].some((p) => pathname === p || pathname.startsWith(p + "/"))) return "Locações";
  if (["/app/produtos", "/app/patrimonios", "/app/composicoes", "/app/disponibilidade", "/app/calendario", "/app/manutencoes"].some((p) => pathname === p || pathname.startsWith(p + "/"))) return "Equipamentos";
  if (["/app/agenda", "/app/obras"].some((p) => pathname === p || pathname.startsWith(p + "/"))) return "Logística";
  if (["/app/financeiro", "/app/lancamentos", "/app/receber"].some((p) => pathname === p || pathname.startsWith(p + "/"))) return "Financeiro";
  if (["/app/precos", "/app/modelos", "/app/servicos"].some((p) => pathname === p || pathname.startsWith(p + "/"))) return "Configurações";
  return null;
}

export default function Layout() {
  const { clientes, pedidos, contratos } = useStore();
  const { user, logout } = useAuth();
  const nav = useNavigate();
  const location = useLocation();
  const [busca, setBusca] = useState("");
  const [grupoAberto, setGrupoAberto] = useState<string | null>(null);
  const [produtosApi, setProdutosApi] = useState<Produto[]>([]);
  const [patrimoniosApi, setPatrimoniosApi] = useState<PatrimonioApi[]>([]);
  const [composicoesQtd, setComposicoesQtd] = useState(0);

  useEffect(() => {
    void Promise.all([atendimentoApi.produtos(), atendimentoApi.patrimonios(), atendimentoApi.composicoes()])
      .then(([produtos, patrimonios, composicoes]) => {
        setProdutosApi(produtos);
        setPatrimoniosApi(patrimonios);
        setComposicoesQtd(composicoes.length);
      });
  }, [location.pathname]);

  const produtosQtd = produtosApi.length;
  const patrimoniosQtd = patrimoniosApi.length;

  const abertos = pedidos.filter((p) => ["Rascunho", "Orçamento enviado", "Aguardando aprovação"].indexOf(p.status) >= 0).length;
  const expedic = contratos.filter((c) => c.itens.some((i) => ["Reservado", "Em separação"].indexOf(i.estado) >= 0)).length;

  const grupos: Grupo[] = [
    { itens: [{ to: "/app", label: "Início" }] },
    { grupo: "Atendimento", itens: [
      { to: "/app/nova-locacao", label: "Nova locação" },
      { to: "/app/pedidos", label: "Pedidos", badge: String(abertos) },
      { to: "/app/clientes", label: "Clientes", badge: String(clientes.length) },
    ] },
    { grupo: "Locações", itens: [
      { to: "/app/contratos", label: "Contratos", badge: String(contratos.length) },
      { to: "/app/expedicoes", label: "Expedições", badge: String(expedic) },
      { to: "/app/devolucoes", label: "Devoluções" },
      { to: "/app/trocas", label: "Trocas" },
      { to: "/app/ocorrencias", label: "Ocorrências" },
    ] },
    { grupo: "Equipamentos", itens: [
      { to: "/app/produtos", label: "Produtos", badge: String(produtosQtd) },
      { to: "/app/patrimonios", label: "Patrimônios", badge: String(patrimoniosQtd) },
      { to: "/app/composicoes", label: "Composições", badge: String(composicoesQtd) },
      { to: "/app/disponibilidade", label: "Disponibilidade" },
      { to: "/app/calendario", label: "Calendário" },
      { to: "/app/manutencoes", label: "Manutenções" },
    ] },
    { grupo: "Logística", itens: [
      { to: "/app/agenda", label: "Agenda" },
      { to: "/app/obras", label: "Obras" },
    ] },
    { grupo: "Financeiro", itens: [
      { to: "/app/financeiro", label: "Painel financeiro" },
      { to: "/app/lancamentos", label: "Fluxo de caixa" },
      { to: "/app/receber", label: "Cobranças" },
    ] },
    { grupo: "Configurações", itens: [
      { to: "/app/servicos", label: "Serviços e mercadorias" },
      { to: "/app/precos", label: "Preços e modalidades" },
      { to: "/app/modelos", label: "Modelos de documentos" },
    ] },
  ];

  useEffect(() => {
    setGrupoAberto(grupoDaRota(location.pathname));
  }, [location.pathname]);

  const resultados = useMemo(() => {
    const q = busca.trim().toLowerCase();
    if (q.length < 2) return [];
    const out: { grupo: string; titulo: string; sub: string; to: string }[] = [];
    for (const c of clientes) if ((c.nome + c.doc + c.tel).toLowerCase().includes(q)) out.push({ grupo: "Cliente", titulo: c.nome, sub: c.doc + " · " + c.situacao, to: `/app/clientes/${c.id}` });
    for (const c of contratos) if ((c.numero + c.local).toLowerCase().includes(q)) out.push({ grupo: "Contrato", titulo: c.numero, sub: c.local + " · " + c.situacao, to: `/app/contratos/${c.numero}` });
    const patsBusca = patrimoniosApi.map((p) => ({ cod: p.codigo, serie: p.serie || "", local: p.local || "", estado: p.estado, prod: p.produtoId }));
    for (const p of patsBusca) if ((p.cod + p.serie + p.local).toLowerCase().includes(q)) out.push({ grupo: "Patrimônio", titulo: p.cod, sub: p.estado + " · " + (p.local || "Local não informado"), to: `/app/produtos/${p.prod}` });
    for (const p of produtosApi) if (p.nome.toLowerCase().includes(q)) out.push({ grupo: "Equipamento", titulo: p.nome, sub: p.categoria, to: `/app/produtos/${p.id}` });
    return out.slice(0, 8);
  }, [busca, clientes, contratos, patrimoniosApi, produtosApi]);

  return (
    <div className="shell">
      <aside className="sidebar">
        <div className="sidebar-brand">
          <img src={monograma} alt="LOCAGO" />
          <div>
            <div style={{ fontFamily: "var(--head)", fontWeight: 700, fontSize: 15, letterSpacing: ".05em", lineHeight: 1.1 }}>LOCAGO</div>
            <div style={{ fontSize: 11, color: "var(--muted-2)" }}>Sistema interno</div>
          </div>
        </div>
        <nav>
          {grupos.map((g, gi) => (
            <div key={gi}>
              {g.grupo && (
                <button className="nav-group-label" aria-expanded={grupoAberto === g.grupo} style={{ display: "flex", width: "100%", justifyContent: "space-between", background: "none", border: 0, cursor: "pointer" }} onClick={() => setGrupoAberto((atual) => atual === g.grupo ? null : g.grupo!)}>
                  <span>{g.grupo}</span><span style={{ fontSize: 13, color: "var(--muted-2)" }}>{grupoAberto === g.grupo ? "−" : "+"}</span>
                </button>
              )}
              {(!g.grupo || grupoAberto === g.grupo) && g.itens.map((it) => (
                <NavLink key={it.to} to={it.to} end={it.to === "/app"} className={({ isActive }) => `nav-item${isActive ? " active" : ""}`}>
                  <span>{it.label}</span>
                  {it.badge && it.badge !== "0" && <span className="badge" style={{ minWidth: 20, padding: "1px 6px", borderRadius: 999, background: "var(--border)", color: "var(--text)", fontSize: 11, fontWeight: 700, textAlign: "center" }}>{it.badge}</span>}
                </NavLink>
              ))}
            </div>
          ))}
        </nav>
      </aside>

      <div className="content">
        <header className="topbar">
          <div className="search-wrap">
            <input className="search-input" value={busca} onChange={(e) => setBusca(e.target.value)} placeholder="Buscar cliente, contrato, patrimônio, obra ou cobrança" />
            {resultados.length > 0 && (
              <div className="search-panel">
                {resultados.map((r, i) => (
                  <button key={i} className="search-res" onMouseDown={() => { nav(r.to); setBusca(""); }}>
                    <span className="uplabel">{r.grupo}</span>
                    <span>
                      <span style={{ display: "block", fontWeight: 600 }}>{r.titulo}</span>
                      <span style={{ display: "block", fontSize: 12, color: "var(--muted)" }}>{r.sub}</span>
                    </span>
                  </button>
                ))}
              </div>
            )}
          </div>
          <div style={{ flex: 1 }} className="hide-mobile" />
          <div style={{ textAlign: "right", lineHeight: 1.2 }} className="hide-mobile">
            <div style={{ fontFamily: "var(--head)", fontWeight: 700, fontSize: 17 }}>Quinta, 06 ago 2026</div>
            <div style={{ fontSize: 11, color: "var(--muted-2)" }}>{user?.nome} · {user?.papel}</div>
          </div>
          <a href="/site" className="btn btn-ghost btn-sm" style={{ textDecoration: "none" }}>Ver site</a>
          <button className="btn btn-ghost btn-sm" onClick={() => { logout(); nav("/login"); }}>Sair</button>
          <button className="btn btn-primary" onClick={() => nav("/app/nova-locacao")}>Nova locação</button>
        </header>
        <Outlet />
      </div>
    </div>
  );
}
