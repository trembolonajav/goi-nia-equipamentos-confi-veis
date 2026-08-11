import { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useStore } from "../data/store";
import { PageHeader, Tag, useToast } from "../components/ui";
import { atendimentoApi, type ContratoItemOperacionalApi, type DocumentoClienteApi } from "../lib/api";

const CONTRATO="Contrato assinado";
const ENTREGA="Comprovante de entrega assinado";

export default function Expedicoes(){
  const {contratos,getCliente,expedirContrato}=useStore(); const {toast}=useToast(); const nav=useNavigate();
  const [aberto,setAberto]=useState<string|null>(null),[docs,setDocs]=useState<DocumentoClienteApi[]>([]),[itens,setItens]=useState<ContratoItemOperacionalApi[]>([]);
  const [quantidades,setQuantidades]=useState<Record<number,number>>({}),[entregas,setEntregas]=useState<string[]>([]),[ocupado,setOcupado]=useState(false),[preview,setPreview]=useState<DocumentoClienteApi|null>(null);
  const fila=contratos.filter(c=>["Aguardando pagamento","Parcialmente expedido","Em andamento"].includes(c.situacao));
  async function carregar(numero:string){const[d,i]=await Promise.all([atendimentoApi.documentosContrato(numero),atendimentoApi.itensOperacionaisContrato(numero)]);setDocs(d);setItens(i);setQuantidades({});setEntregas([])}
  useEffect(()=>{if(aberto)void carregar(aberto).catch(e=>toast(e instanceof Error?e.message:"Falha ao carregar a expedição."));else{setDocs([]);setItens([])}},[aberto]);
  const contratoAssinado=docs.some(d=>d.tipo===CONTRATO),comprovante=docs.find(d=>d.tipo===ENTREGA);
  const aguardandoEntrega=useMemo(()=>itens.flatMap(i=>i.patrimonios.filter(p=>p.estado==="LOCADO"&&!p.entregue).map(p=>({...p,item:i.descricao}))),[itens]);
  const temSaida=itens.some(i=>i.aExpedir>0);
  async function enviar(numero:string,tipo:string,arquivo?:File){if(!arquivo)return;setOcupado(true);try{await atendimentoApi.anexarDocumentoContrato(numero,tipo,arquivo);await carregar(numero);toast("Documento anexado.")}catch(e){toast(e instanceof Error?e.message:"Falha no envio.")}finally{setOcupado(false)}}
  async function confirmarSaida(numero:string){const alocacoes=itens.map(i=>({itemId:i.id,quantidade:quantidades[i.id]||0})).filter(x=>x.quantidade>0);setOcupado(true);try{await expedirContrato(numero,alocacoes);await carregar(numero);toast("Saída confirmada. Os patrimônios estão em transporte.")}catch(e){toast(e instanceof Error?e.message:"Não foi possível confirmar a saída.")}finally{setOcupado(false)}}
  async function confirmarEntrega(numero:string){setOcupado(true);try{await atendimentoApi.confirmarEntregaContrato(numero,entregas);await carregar(numero);toast("Entrega confirmada com o comprovante assinado.")}catch(e){toast(e instanceof Error?e.message:"Não foi possível confirmar a entrega.")}finally{setOcupado(false)}}
  return <main className="page" style={{maxWidth:1300}}>
    <PageHeader title="Expedições" sub="O fluxo é sequencial: contrato assinado, confirmação da saída e, depois, confirmação da entrega com comprovante assinado."/>
    <div className="list" style={{marginTop:24}}>{fila.map(c=><div className="expedition-entry" key={c.numero}>
      <div className="list-row expedition-grid"><button className="mono orange table-link" onClick={()=>nav(`/app/contratos/${c.numero}`)}>{c.numero}</button><span><strong className="block">{getCliente(c.clienteId)?.nome}</strong><small className="muted">{c.itens.map(i=>i.nome).join(", ")}</small></span><span>{c.local}<small className="muted block">{c.endereco}</small></span><span>{c.inicio.split("-").reverse().join("/")}</span><button className="btn btn-primary btn-sm" onClick={()=>setAberto(a=>a===c.numero?null:c.numero)}>{aberto===c.numero?"Fechar":"Abrir operação"}</button></div>
      {aberto===c.numero&&<section className="expedition-step">
        <div className="expedition-step-head"><div><div className="uplabel">Etapa 1</div><h2 className="h2">Contrato de locação</h2></div><Tag cor={contratoAssinado?"var(--green)":"var(--yellow)"}>{contratoAssinado?"Assinado":"Pendente"}</Tag></div>
        {!contratoAssinado?<div className="inline-warning"><span>Anexe a via assinada na ficha do contrato para liberar a saída.</span><button className="btn btn-ghost btn-sm" onClick={()=>nav(`/app/contratos/${c.numero}`)}>Abrir contrato</button></div>:<p className="section-note">Contrato conferido. A separação e a saída estão liberadas.</p>}

        {contratoAssinado&&temSaida&&<div className="operation-selection"><div><strong>Etapa 2 · Confirmar saída</strong><small>Informe a quantidade desta saída. O restante continuará a expedir.</small></div>{itens.filter(i=>i.aExpedir>0).map(i=><div className="operation-option" key={i.id}><span style={{flex:1}}><strong>{i.descricao}</strong><small>Contratado: {i.quantidade} · Expedido: {i.expedido} · A expedir: {i.aExpedir}</small></span><input className="input" style={{width:100}} type="number" min={0} max={i.aExpedir} value={quantidades[i.id]||0} onChange={e=>setQuantidades(q=>({...q,[i.id]:Math.min(i.aExpedir,Math.max(0,Number(e.target.value)))}))}/></div>)}<button className="btn btn-primary" disabled={ocupado||!Object.values(quantidades).some(q=>q>0)} onClick={()=>confirmarSaida(c.numero)}>Confirmar saída</button></div>}

        {!!aguardandoEntrega.length&&<div className="operation-selection"><div><strong>Etapa 3 · Confirmar entrega</strong><small>Gere o modelo, recolha a assinatura e selecione os patrimônios efetivamente entregues.</small></div><div className="row wrap"><button className="btn btn-ghost" onClick={()=>nav(`/app/contratos/${c.numero}/entrega`)}>Ver modelo sem assinatura</button><label className="btn btn-outline"><input hidden type="file" accept="application/pdf,image/jpeg,image/png" disabled={ocupado} onChange={e=>{void enviar(c.numero,ENTREGA,e.target.files?.[0]);e.currentTarget.value=""}}/>{comprovante?"Substituir via assinada":"Anexar via assinada"}</label></div>{comprovante&&<button className="client-document-row" onClick={()=>setPreview(comprovante)}><strong>{comprovante.nome}</strong><span>Visualizar</span></button>}{aguardandoEntrega.map(p=><label className="operation-option" key={p.codigo}><input type="checkbox" checked={entregas.includes(p.codigo)} onChange={()=>setEntregas(s=>s.includes(p.codigo)?s.filter(x=>x!==p.codigo):[...s,p.codigo])}/><span><strong>{p.codigo}</strong><small>{p.item} · Em transporte</small></span></label>)}<button className="btn btn-primary" disabled={ocupado||!comprovante||!entregas.length} onClick={()=>confirmarEntrega(c.numero)}>Confirmar entrega</button></div>}
      </section>}
    </div>)}{!fila.length&&<div className="empty">Nenhuma expedição pendente.</div>}</div>
    {preview&&<div className="document-modal" onMouseDown={e=>{if(e.target===e.currentTarget)setPreview(null)}}><div className="document-modal-card"><header><strong>{preview.nome}</strong><button className="document-modal-close" onClick={()=>setPreview(null)}>×</button></header><div className="document-preview">{preview.mime.startsWith("image/")?<img src={atendimentoApi.urlDocumentoContrato(preview.id)} alt={preview.nome}/>:<iframe src={atendimentoApi.urlDocumentoContrato(preview.id)} title={preview.nome}/>}</div></div></div>}
  </main>
}
