import { useEffect,useState } from "react";
import { useNavigate } from "react-router-dom";
import { PageHeader,Tag } from "../components/ui";
import { brl } from "../lib/calc";
import { atendimentoApi,type ObraApi } from "../lib/api";

export default function Obras(){
  const[obras,setObras]=useState<ObraApi[]>([]); const[erro,setErro]=useState(""); const nav=useNavigate();
  const carregar=()=>atendimentoApi.obras().then(setObras).catch(()=>setErro("Não foi possível carregar as obras."));
  useEffect(()=>{void carregar()},[]);
  return <main className="page" style={{maxWidth:1200}}><PageHeader title="Obras" sub="Destinos reais derivados dos contratos persistidos com entrega. Cada obra mantém cliente, endereço e frete utilizado." action={<button className="btn btn-ghost" onClick={carregar}>Atualizar</button>}/><div className="list-head" style={{marginTop:24,gridTemplateColumns:"1.3fr 1.2fr 1fr 100px 120px"}}><span>Obra</span><span>Endereço</span><span>Observação</span><span>Situação</span><span style={{textAlign:"right"}}>Frete</span></div><div className="list">{obras.map((o,i)=><button key={`${o.clienteId}-${o.nome}-${i}`} className="list-row" style={{gridTemplateColumns:"1.3fr 1.2fr 1fr 100px 120px"}} onClick={()=>nav(`/app/clientes/${o.clienteId}`)}><span><strong>{o.nome}</strong><small style={{display:"block",color:"var(--muted)"}}>{o.cliente}</small></span><span className="muted" style={{fontSize:13}}>{o.endereco}</span><span className="muted" style={{fontSize:13}}>{o.restricao}</span><Tag cor="var(--green)">{o.situacao}</Tag><span className="num" style={{textAlign:"right",fontSize:18}}>{brl.format(Number(o.frete))}</span></button>)}{!erro&&!obras.length&&<div className="empty">Nenhuma obra real vinculada a contrato.</div>}{erro&&<div className="empty" style={{color:"var(--red)"}}>{erro}</div>}</div></main>;
}
