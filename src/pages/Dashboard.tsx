import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { atendimentoApi, type DashboardApi } from "../lib/api";
import { brl } from "../lib/calc";
import { Tag } from "../components/ui";

export default function Dashboard() {
  const nav = useNavigate();
  const [dados, setDados] = useState<DashboardApi | null>(null);
  const [erro, setErro] = useState("");
  const [atualizadoEm,setAtualizadoEm]=useState<Date|null>(null);
  const carregar = () => { setErro(""); atendimentoApi.dashboard().then(d=>{setDados(d);setAtualizadoEm(new Date())}).catch(() => setErro("O resumo operacional está indisponível. Tente novamente.")); };
  useEffect(() => { carregar(); const atualizar=()=>{if(document.visibilityState==="visible")carregar()};window.addEventListener("focus",atualizar);document.addEventListener("visibilitychange",atualizar);const timer=window.setInterval(atualizar,30000);return()=>{window.removeEventListener("focus",atualizar);document.removeEventListener("visibilitychange",atualizar);window.clearInterval(timer)}; }, []);

  if (erro) return <main className="page"><h1 className="h1">Início</h1><div className="empty" style={{ color: "var(--red)", marginTop: 24 }}>{erro}<div style={{ marginTop: 12 }}><button className="btn btn-ghost" onClick={carregar}>Tentar novamente</button></div></div></main>;
  if (!dados) return <main className="page"><h1 className="h1">Início</h1><div className="empty" style={{ marginTop: 24 }}>Carregando dados reais da operação...</div></main>;

  const alertas = [
    [dados.entregasPendentes, "Entregas pendentes", "/app/expedicoes?filtro=pendentes", "var(--orange)"],
    [dados.devolucoesPrevistas, "Devoluções previstas hoje", "/app/devolucoes?filtro=hoje", "var(--blue)"],
    [dados.devolucoesAtrasadas, "Devoluções atrasadas", "/app/devolucoes?filtro=atrasadas", "var(--red)"],
    [dados.cobrancasVencendoHoje, "Cobranças vencendo hoje", "/app/receber?filtro=hoje", "var(--yellow)"],
    [dados.cobrancasVencidas, "Cobranças vencidas", "/app/receber?filtro=vencidas", "var(--red)"],
    [dados.manutencoesAbertas, "Manutenções abertas", "/app/manutencoes?filtro=abertas", "var(--red)"],
  ] as const;
  const financeiro = [
    ["A receber hoje", dados.aReceberHoje, "/app/receber?filtro=hoje", "var(--text)"],
    ["Vencido", dados.valorVencido, "/app/receber?filtro=vencidas", "var(--red)"],
    ["A pagar hoje", dados.aPagarHoje, "/app/lancamentos?filtro=pagar-hoje", "var(--yellow)"],
    ["Saldo realizado", dados.saldoRealizado, "/app/financeiro", dados.saldoRealizado < 0 ? "var(--red)" : "var(--green)"],
  ] as const;

  return <main className="page">
    <div className="dashboard-heading"><div><h1 className="h1">Início</h1><p className="lead">O que precisa de atenção agora, calculado pela operação real.</p></div><div className="dashboard-refresh"><small>{atualizadoEm?`Atualizado às ${atualizadoEm.toLocaleTimeString("pt-BR",{hour:"2-digit",minute:"2-digit",second:"2-digit"})}`:"Atualizando..."}</small><button className="btn btn-ghost btn-sm" onClick={carregar}>Atualizar agora</button></div></div>
    <h2 className="h2" style={{ marginTop: 28 }}>Atenção hoje</h2>
    <div className="kpi-grid" style={{ marginTop: 12, gridTemplateColumns: "repeat(auto-fill,minmax(190px,1fr))" }}>{alertas.map(([valor,rotulo,to,cor])=><button key={rotulo} className="kpi" onClick={()=>nav(to)}><span className="kpi-value" style={{color:cor}}>{valor}</span><span className="kpi-label">{rotulo}</span></button>)}</div>
    <div className="dash-cols" style={{ marginTop: 32, display: "grid", gridTemplateColumns: "minmax(0,1.5fr) minmax(280px,1fr)", gap: 24, alignItems: "start" }}>
      <section><h2 className="h2" style={{ marginBottom: 12 }}>Próximas ações</h2><div className="stack" style={{gap:8}}>{dados.proximasAcoes.map(a=><button key={a.id} className="list-row" style={{gridTemplateColumns:"70px 1fr auto",background:"var(--card)"}} onClick={()=>nav(`/app/contratos/${a.contrato}`)}><span className="num orange" style={{fontSize:18}}>{a.hora.slice(0,5)}</span><span><strong className="block">{a.tipo==="ENTREGA"?"Entregar":"Receber"} · {a.destino}</strong><small className="muted block">{a.cliente} · Contrato {a.contrato}{a.data < new Date().toISOString().slice(0,10)?" · atrasada":""}</small></span><Tag cor={a.tipo==="ENTREGA"?"var(--orange)":"var(--blue)"}>{a.tipo==="ENTREGA"?"Entrega":"Devolução"}</Tag></button>)}{!dados.proximasAcoes.length&&<div className="empty">Nenhuma ação pendente para hoje.</div>}</div></section>
      <aside className="card"><h2 className="h2" style={{marginBottom:14}}>Financeiro</h2><div className="stack" style={{gap:12}}>{financeiro.map(([rotulo,valor,to,cor])=><button key={rotulo} onClick={()=>nav(to)} style={{display:"flex",justifyContent:"space-between",gap:12,background:"none",border:0,padding:0,cursor:"pointer",color:"inherit",textAlign:"left"}}><span className="muted">{rotulo}</span><span className="num" style={{fontSize:18,color:cor}}>{brl.format(Number(valor))}</span></button>)}</div></aside>
    </div>
  </main>;
}
