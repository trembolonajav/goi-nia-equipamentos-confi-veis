import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useStore } from "../data/store";
import { PageHeader, Tag, useToast } from "../components/ui";
import { atendimentoApi, type DocumentoClienteApi } from "../lib/api";

const TIPO_CONTRATO="Contrato assinado";
const TIPO_ENTREGA="Comprovante de entrega assinado";

export default function Expedicoes() {
  const { contratos, getCliente, expedirContrato } = useStore();
  const { toast } = useToast();
  const nav = useNavigate();
  const [aberto,setAberto]=useState<string|null>(null);
  const [docs,setDocs]=useState<DocumentoClienteApi[]>([]);
  const [enviando,setEnviando]=useState(false);
  const [confirmando,setConfirmando]=useState(false);
  const [visualizando,setVisualizando]=useState<DocumentoClienteApi|null>(null);
  const fila = contratos.filter(c=>c.situacao==="Aguardando pagamento"&&c.itens.some(i=>["Reservado","Em separação"].includes(i.estado)));

  useEffect(()=>{if(!aberto){setDocs([]);return}void atendimentoApi.documentosContrato(aberto).then(setDocs).catch(()=>setDocs([]))},[aberto]);
  const tem=(tipo:string)=>docs.some(d=>d.tipo===tipo);
  const viaEntrega=docs.find(d=>d.tipo===TIPO_ENTREGA);

  return <main className="page" style={{maxWidth:1300}}>
    <PageHeader title="Expedições" sub="Uma etapa por vez: confira o contrato, gere o comprovante de entrega, anexe a via assinada e somente então confirme a saída."/>
    <div className="list-head expedition-grid" style={{marginTop:24}}><span>Contrato</span><span>Cliente e itens</span><span>Destino</span><span>Saída</span><span>Ação</span></div>
    <div className="list">
      {fila.map(c=><div className={`expedition-entry${aberto===c.numero?" open":""}`} key={c.numero}>
        <div className="list-row expedition-grid">
          <button className="mono orange table-link" onClick={()=>nav(`/app/contratos/${c.numero}`)}>{c.numero}</button>
          <span><strong className="block">{getCliente(c.clienteId)?.nome}</strong><small className="muted block">{c.itens.map(i=>i.nome).join(", ")}</small></span>
          <span><span className="block">{c.local}</span><small className="muted block">{c.endereco}</small></span>
          <span className="num" style={{fontSize:18}}>{c.inicio.slice(8)}/{c.inicio.slice(5,7)}</span>
          <div className="row wrap" style={{gap:6}}><Tag cor="var(--yellow)">Aguardando saída</Tag><button className="btn btn-primary btn-sm" onClick={()=>setAberto(a=>a===c.numero?null:c.numero)}>{aberto===c.numero?"Fechar":"Preparar saída"}</button></div>
        </div>
        {aberto===c.numero&&<section className="expedition-step">
          <div className="expedition-step-head"><div><div className="uplabel">Etapa atual · Expedição</div><h2 className="h2">Comprovante de entrega / saída</h2></div><Tag cor={viaEntrega?"var(--green)":"var(--yellow)"}>{viaEntrega?"Via assinada anexada":"Pendente"}</Tag></div>
          {!tem(TIPO_CONTRATO)&&<div className="inline-warning"><strong>Contrato assinado pendente.</strong><span>Volte ao contrato e anexe a via assinada antes de preparar a entrega.</span><button className="btn btn-ghost btn-sm" onClick={()=>nav(`/app/contratos/${c.numero}`)}>Abrir contrato</button></div>}
          {tem(TIPO_CONTRATO)&&<>
            <p className="section-note">Abra o modelo, imprima ou salve, recolha a assinatura do cliente e anexe a via digitalizada.</p>
            <div className="row wrap" style={{gap:8}}><button className="btn btn-ghost" onClick={()=>nav(`/app/contratos/${c.numero}/entrega`)}>Visualizar modelo</button><label className={`btn btn-outline${enviando?" disabled":""}`}><input hidden type="file" accept="application/pdf,image/jpeg,image/png" disabled={enviando} onChange={async e=>{const f=e.target.files?.[0];if(!f)return;setEnviando(true);try{await atendimentoApi.anexarDocumentoContrato(c.numero,TIPO_ENTREGA,f);setDocs(await atendimentoApi.documentosContrato(c.numero));toast("Comprovante de entrega anexado.")}catch(err){toast(err instanceof Error?err.message:"Falha no envio.")}finally{setEnviando(false);e.currentTarget.value=""}}}/>{enviando?"Enviando...":viaEntrega?"Substituir via assinada":"Anexar via assinada"}</label></div>
            {viaEntrega&&<div className="client-document-row" style={{marginTop:12}}><button className="client-document-main" onClick={()=>setVisualizando(viaEntrega)}><span className="document-file-icon">{viaEntrega.mime==="application/pdf"?"PDF":"IMG"}</span><span><strong>{viaEntrega.nome}</strong><small>{(viaEntrega.tamanho/1024/1024).toFixed(2)} MB</small></span></button><div className="client-document-actions"><button className="btn btn-ghost btn-sm" onClick={()=>setVisualizando(viaEntrega)}>Visualizar</button><a className="btn btn-ghost btn-sm" href={atendimentoApi.urlDownloadDocumentoContrato(viaEntrega.id)}>Baixar</a></div></div>}
            <div className="expedition-confirm"><span><strong>Confirmação da entrega</strong><small>Esta ação vincula a saída dos equipamentos e inicia a locação.</small></span><button className="btn btn-primary" disabled={!viaEntrega||confirmando} onClick={async()=>{setConfirmando(true);try{await expedirContrato(c.numero);toast(`Expedição de ${c.numero} concluída.`);setAberto(null)}catch(err){toast(err instanceof Error?err.message:"Não foi possível registrar a saída.")}finally{setConfirmando(false)}}}>{confirmando?"Confirmando...":"Confirmar saída e entrega"}</button></div>
          </>}
        </section>}
      </div>)}
      {!fila.length&&<div className="empty">Nenhuma expedição pendente.</div>}
    </div>
    {visualizando&&<div className="document-modal" role="dialog" aria-modal="true" onMouseDown={e=>{if(e.target===e.currentTarget)setVisualizando(null)}}><div className="document-modal-card"><header><span><strong>Comprovante de entrega assinado</strong><small>{visualizando.nome}</small></span><button className="document-modal-close" onClick={()=>setVisualizando(null)}>×</button></header><div className="document-preview">{visualizando.mime.startsWith("image/")?<img src={atendimentoApi.urlDocumentoContrato(visualizando.id)} alt={visualizando.nome}/>:<iframe src={atendimentoApi.urlDocumentoContrato(visualizando.id)} title={visualizando.nome}/>}</div></div></div>}
  </main>;
}
