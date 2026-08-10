import { useEffect,useState } from "react";
import { useNavigate } from "react-router-dom";
import { PageHeader,Tag } from "../components/ui";
import { atendimentoApi,type AgendaApi } from "../lib/api";

export default function Agenda(){
  const[lista,setLista]=useState<AgendaApi[]>([]); const[erro,setErro]=useState(""); const nav=useNavigate();
  const carregar=()=>atendimentoApi.agenda().then(setLista).catch(()=>setErro("Não foi possível carregar a agenda."));
  useEffect(()=>{void carregar()},[]);
  return <main className="page" style={{maxWidth:1300}}><PageHeader title="Agenda de entregas e coletas" sub="Agenda gerada automaticamente pelos contratos com entrega em obra. Expedição conclui a entrega; devolução conclui a coleta." action={<button className="btn btn-ghost" onClick={carregar}>Atualizar</button>}/><div className="list-head" style={{marginTop:24,gridTemplateColumns:"120px 1.2fr 1.3fr 110px 130px"}}><span>Data e hora</span><span>Cliente</span><span>Destino</span><span>Tipo</span><span>Situação</span></div><div className="list">{lista.map(a=><button key={a.id} className="list-row" style={{gridTemplateColumns:"120px 1.2fr 1.3fr 110px 130px"}} onClick={()=>nav(`/app/contratos/${a.contrato}`)}><span><strong>{a.data.split("-").reverse().join("/")}</strong><small style={{display:"block",color:"var(--muted)"}}>{a.hora.slice(0,5)}</small></span><span><strong>{a.cliente}</strong><small style={{display:"block",color:"var(--muted)"}}>{a.contrato}</small></span><span><strong>{a.destino}</strong><small style={{display:"block",color:"var(--muted)"}}>{a.endereco}</small></span><span>{a.tipo==="ENTREGA"?"Entrega":"Coleta"}</span><Tag cor={a.status==="PENDENTE"?"var(--yellow)":"var(--green)"}>{a.status==="PENDENTE"?"Pendente":"Concluída"}</Tag></button>)}{!erro&&!lista.length&&<div className="empty">Nenhuma entrega ou coleta real agendada.</div>}{erro&&<div className="empty" style={{color:"var(--red)"}}>{erro}</div>}</div></main>;
}
