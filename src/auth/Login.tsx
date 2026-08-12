import { useState } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { useAuth } from "./AuthContext";
import { heroObra, logoHorizontal } from "../lib/images";

export default function Login() {
  const { login } = useAuth();
  const nav = useNavigate();
  const loc = useLocation() as { state?: { from?: string } };
  const [usuario, setUsuario] = useState("");
  const [senha, setSenha] = useState("");
  const [erro, setErro] = useState("");
  const [entrando,setEntrando]=useState(false);

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    setEntrando(true);setErro("");const r = await login(usuario, senha);setEntrando(false);
    if (!r.ok) {
      setErro(r.erro || "Falha no login.");
      return;
    }
    nav(loc.state?.from || "/app", { replace: true });
  }

  return (
    <div className="login-wrap">
      <div className="login-hero" style={{ backgroundImage: `url(${heroObra})` }}>
        <div>
          <img src={logoHorizontal} alt="LOCAGO" style={{ height: 44, marginBottom: 20 }} />
          <h1 className="h1" style={{ fontSize: 40, maxWidth: "16ch" }}>
            Sistema interno de locação
          </h1>
          <p className="lead" style={{ maxWidth: "42ch", fontSize: 16 }}>
            Do orçamento ao faturamento, sem redigitar nada entre as etapas. Aluguel de equipamentos · Goiânia&nbsp;-&nbsp;GO.
          </p>
        </div>
      </div>

      <div className="login-form-side">
        <form className="login-card" onSubmit={submit}>
          <img src={logoHorizontal} alt="LOCAGO" style={{ height: 34, marginBottom: 8 }} className="hide-mobile-inv" />
          <h2 className="h1" style={{ fontSize: 26, marginTop: 8 }}>Entrar</h2>
          <p className="muted" style={{ marginTop: 4 }}>Acesse com seu usuário do balcão.</p>

          <div className="stack" style={{ gap: 14, marginTop: 24 }}>
            <label className="field">
              <span>Usuário</span>
              <input className="input" value={usuario} onChange={(e) => setUsuario(e.target.value)} autoFocus />
            </label>
            <label className="field">
              <span>Senha</span>
              <input className="input" type="password" value={senha} onChange={(e) => setSenha(e.target.value)} />
            </label>

            {erro && (
              <div className="card-tight" style={{ borderColor: "var(--red)", color: "var(--red)", fontWeight: 600, minHeight: 0, padding: "12px 14px" }}>
                {erro}
              </div>
            )}

            <button className="btn btn-primary btn-block" type="submit" disabled={entrando} style={{ minHeight: 48 }}>
              {entrando?"Entrando...":"Entrar no sistema"}
            </button>
          </div>

        </form>
      </div>
    </div>
  );
}
