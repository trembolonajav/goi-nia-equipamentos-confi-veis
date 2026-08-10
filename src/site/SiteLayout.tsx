import { Outlet, useNavigate, useLocation } from "react-router-dom";
import { logoHorizontal } from "../lib/images";
import { openWhatsApp, WHATSAPP_DISPLAY, whatsappUrl } from "../lib/whatsapp";

export default function SiteLayout() {
  const nav = useNavigate();
  const loc = useLocation();
  const linkStyle = (active: boolean) => ({ background: "none", border: 0, color: active ? "var(--text)" : "var(--muted)", fontSize: 14, fontWeight: 500, padding: "10px 12px", borderRadius: 8, cursor: "pointer", minHeight: 44 });
  const is = (p: string) => loc.pathname === p;
  return <div style={{ minHeight: "100vh", background: "var(--bg)" }}>
    <header style={{ position: "sticky", top: 0, zIndex: 40, background: "var(--panel)", borderBottom: "1px solid var(--border)" }}>
      <div className="site-wrap" style={{ height: 72, display: "flex", alignItems: "center", gap: 24 }}>
        <button onClick={() => nav("/site")} style={{ background: "none", border: 0, padding: 0, cursor: "pointer", display: "flex" }}><img src={logoHorizontal} alt="LOCAGO — Aluguel de Equipamentos" style={{ height: 34 }} /></button>
        <nav className="site-nav hide-mobile" style={{ display: "flex", alignItems: "center", gap: 4 }}>
          <button style={linkStyle(is("/site"))} onClick={() => nav("/site")}>Início</button>
          <button style={linkStyle(is("/site/catalogo"))} onClick={() => nav("/site/catalogo")}>Catálogo</button>
          <button style={linkStyle(false)} onClick={() => nav("/site#como-funciona")}>Como funciona</button>
          <button style={linkStyle(is("/site/duvidas"))} onClick={() => nav("/site/duvidas")}>Dúvidas</button>
        </nav>
        <div style={{ flex: 1 }} />
        <a className="hide-mobile" href={whatsappUrl()} target="_blank" rel="noreferrer" style={{ textAlign: "right", lineHeight: 1.25, color: "inherit", textDecoration: "none" }}><div style={{ fontFamily: "var(--head)", fontSize: 20, fontWeight: 700 }}>{WHATSAPP_DISPLAY}</div><div style={{ fontSize: 12, color: "var(--muted-2)" }}>Atendimento pelo WhatsApp</div></a>
        <button className="btn btn-primary" onClick={() => openWhatsApp()}>Falar no WhatsApp</button>
      </div>
    </header>
    <Outlet />
    <footer style={{ borderTop: "1px solid var(--border)", background: "var(--panel)", marginTop: 40 }}>
      <div className="site-wrap" style={{ padding: "40px 0", display: "grid", gridTemplateColumns: "1.4fr 1fr 1fr", gap: 32 }}>
        <div><img src={logoHorizontal} alt="LOCAGO" style={{ height: 30 }} /><p className="muted" style={{ marginTop: 12, maxWidth: "40ch" }}>Aluguel de equipamentos para construção em Goiânia e região metropolitana. Consulte disponibilidade e contratação pelo WhatsApp.</p></div>
        <div><div className="uplabel" style={{ marginBottom: 10 }}>Atendimento</div><a href={whatsappUrl()} target="_blank" rel="noreferrer" className="muted" style={{ fontSize: 14, lineHeight: 1.9, textDecoration: "none" }}>{WHATSAPP_DISPLAY}<br />WhatsApp da LOCAGO</a></div>
        <div><div className="uplabel" style={{ marginBottom: 10 }}>Regiões atendidas</div><div className="muted" style={{ fontSize: 14, lineHeight: 1.9 }}>Goiânia e região metropolitana. Consulte seu endereço.</div></div>
      </div>
      <div className="site-wrap" style={{ padding: "16px 0", borderTop: "1px solid var(--border)", fontSize: 12, color: "var(--muted-2)" }}>© 2026 LOCAGO — Aluguel de Equipamentos.</div>
    </footer>
  </div>;
}
