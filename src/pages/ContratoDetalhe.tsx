import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { useStore } from "../data/store";
import { PATRIMONIOS, COR_ESTADO } from "../data/mock";
import { Tag, Thumb, useToast } from "../components/ui";
import { brl, periodoCurto } from "../lib/calc";
import { atendimentoApi,type ContratoItemOperacionalApi,type DocumentoClienteApi } from "../lib/api";
const DOCUMENTOS_FLUXO=[
  {tipo:"Contrato assinado",titulo:"Contrato de locação",modelo:"documento",fase:"Contrato"},
  {tipo:"Comprovante de entrega assinado",titulo:"Comprovante de entrega / saída",modelo:"entrega",fase:"Expedição"},
  {tipo:"Comprovante de devolução assinado",titulo:"Comprovante de devolução",modelo:"devolucao",fase:"Devolução"},
];

export default function ContratoDetalhe() {
  const { numero } = useParams();
  const { getContrato, getCliente, getProduto, inspecionarContrato } = useStore();
  const { toast } = useToast();
  const nav = useNavigate();
  const [documentosAssinados,setDocumentosAssinados]=useState<DocumentoClienteApi[]>([]);
  const [enviando,setEnviando]=useState("");
  const [visualizando,setVisualizando]=useState<DocumentoClienteApi|null>(null);
  const [modalAvaria,setModalAvaria]=useState(false),[motivoAvaria,setMotivoAvaria]=useState(""),[fotosAvaria,setFotosAvaria]=useState<File[]>([]),[salvandoAvaria,setSalvandoAvaria]=useState(false);
  const [itensOperacionais,setItensOperacionais]=useState<ContratoItemOperacionalApi[]>([]),[patrimoniosInspecao,setPatrimoniosInspecao]=useState<string[]>([]);
  useEffect(()=>{if(numero)void atendimentoApi.documentosContrato(numero).then(setDocumentosAssinados)},[numero]);
  useEffect(()=>{if(numero)void atendimentoApi.itensOperacionaisContrato(numero).then(setItensOperacionais).catch(()=>setItensOperacionais([]))},[numero]);

  const ct = getContrato(numero!);
  if (!ct) return <main className="page"><div className="empty">Contrato não encontrado.</div></main>;
  const cli = getCliente(ct.clienteId);

  const corSit = ct.situacao === "Atrasado" ? "var(--red)" : ct.situacao === "Aguardando pagamento" ? "var(--yellow)" : ct.situacao === "Em inspeção" ? "var(--blue)" : "var(--green)";
  const corPg = ct.pagamento === "Vencido" || ct.pagamento === "Pix pendente" ? "var(--red)" : ct.pagamento === "Faturado" ? "var(--blue)" : "var(--green)";
  const temDocumento=(tipo:string)=>documentosAssinados.some(d=>d.tipo===tipo);
  const operacao=ct.situacao==="Aguardando pagamento"?"Aguardando saída":ct.situacao;
  // A tela do contrato cuida somente da etapa contratual. Os comprovantes
  // operacionais pertencem às telas de expedição e devolução.
  const etapaDocumento=ct.situacao==="Aguardando pagamento"?DOCUMENTOS_FLUXO[0]:null;
  const documentosVisiveis=documentosAssinados;

  return (
    <main className="page" style={{ maxWidth: 1400 }}>
      <button className="link-back" onClick={() => nav("/app/contratos")}>← Contratos</button>
      <div className="spread" style={{ marginTop: 12, alignItems: "flex-start" }}>
        <div>
          <div className="uplabel">Contrato</div>
          <h1 className="h1" style={{ fontSize: 36, color: "var(--orange)" }}>{ct.numero}</h1>
          <p className="lead">{cli?.nome} · {ct.local} · {periodoCurto(ct.inicio, ct.fim)}</p>
        </div>
        <div className="row wrap" style={{ gap: 8 }}>
          <span className="status-labeled"><small>Operação</small><Tag cor={corSit}>{operacao}</Tag></span>
          <span className="status-labeled"><small>Pagamento</small><Tag cor={corPg}>{ct.pagamento}</Tag></span>
        </div>
      </div>

      <div className="row wrap" style={{ gap: 8, marginTop: 20 }}>
        <button className="btn btn-ghost" onClick={()=>nav(`/app/contratos/${ct.numero}/documento`)}>Visualizar contrato</button>
        {ct.situacao === "Aguardando pagamento" && <button className="btn btn-primary" disabled={!temDocumento("Contrato assinado")} title={temDocumento("Contrato assinado")?"Continuar para a etapa de expedição":"Anexe primeiro o contrato assinado"} onClick={()=>nav("/app/expedicoes")}>{temDocumento("Contrato assinado")?"Continuar para expedição":"Aguardando contrato assinado"}</button>}
        {ct.situacao === "Em andamento" && <button className="btn btn-green" onClick={()=>nav(`/app/devolucoes?contrato=${encodeURIComponent(ct.numero)}`)}>Continuar para devolução</button>}
        {ct.situacao === "Em inspeção" && <button className="btn btn-green" disabled={!patrimoniosInspecao.length} onClick={async () => { try { await inspecionarContrato(ct.numero, "APROVADO", undefined, patrimoniosInspecao); toast("Inspeção aprovada para os patrimônios selecionados."); setPatrimoniosInspecao([]); } catch { toast("Não foi possível concluir a inspeção."); } }}>Aprovar selecionados</button>}
        {ct.situacao === "Em inspeção" && <button className="btn btn-ghost" onClick={()=>setModalAvaria(true)}>Registrar avaria / manutenção</button>}
        <button className="btn btn-ghost" onClick={() => nav(`/app/clientes/${ct.clienteId}`)}>Ver ficha do cliente</button>
      </div>

      <div className="dash-cols" style={{ marginTop: 24, display: "grid", gridTemplateColumns: "1fr 380px", gap: 24, alignItems: "start" }}>
        <div className="stack" style={{ gap: 20 }}>
          <section className="card">
            <h2 className="h2" style={{ marginBottom: 4 }}>Itens do contrato</h2>
            <p className="section-note">Estado operacional, localização e situação contratual são três informações distintas. Um equipamento pode estar operante, na obra e com contrato vencido ao mesmo tempo.</p>
            <div className="stack" style={{ gap: 8 }}>
              {ct.itens.map((it, i) => {
                const prod = getProduto(it.prod);
                const pat = PATRIMONIOS.find((p) => it.patrimonio.startsWith(p.cod));
                return (
                  <div key={i} className="card-tight">
                    <div style={{ display: "grid", gridTemplateColumns: "56px 1fr auto auto", gap: 14, alignItems: "center" }}>
                      <Thumb img={prod?.img || ""} w={48} h={40} />
                      <div style={{ minWidth: 0 }}>
                        <div style={{ fontWeight: 600 }}>{it.nome}</div>
                        <div className="mono" style={{ fontSize: 12, color: "var(--muted-2)" }}>{it.patrimonio}</div>
                      </div>
                      <Tag cor={COR_ESTADO[it.estado] || "var(--muted)"}>{it.estado}</Tag>
                      <span className="num" style={{ fontSize: 19, whiteSpace: "nowrap" }}>{brl.format(it.valor)}</span>
                    </div>
                    <div className="grid" style={{ gridTemplateColumns: "repeat(3,1fr)", marginTop: 12, paddingTop: 12, borderTop: "1px solid var(--border)" }}>
                      <Mini rot="Estado operacional" val={pat?.estado || it.estado} cor={COR_ESTADO[pat?.estado || it.estado]} />
                      <Mini rot="Localização" val={pat?.local || ct.local} />
                      <Mini rot="Situação contratual" val={ct.situacao} />
                    </div>
                  </div>
                );
              })}
            </div>
          </section>

          {ct.situacao==="Em inspeção"&&<section className="card"><h2 className="h2">Patrimônios em inspeção</h2><p className="section-note">Selecione as unidades que serão liberadas ou enviadas para manutenção nesta ação.</p><div className="operation-selection">{itensOperacionais.flatMap(i=>i.patrimonios.filter(p=>p.estado==="EM_INSPECAO").map(p=><label className="operation-option" key={p.codigo}><input type="checkbox" checked={patrimoniosInspecao.includes(p.codigo)} onChange={()=>setPatrimoniosInspecao(s=>s.includes(p.codigo)?s.filter(c=>c!==p.codigo):[...s,p.codigo])}/><span><strong>{p.codigo} · {i.descricao}</strong><small>{p.serie||"Recebido para inspeção"}</small></span></label>))}</div></section>}

          <section className="card">
            <h2 className="h2" style={{ marginBottom: 16 }}>Linha do tempo</h2>
            <div className="stack" style={{ gap: 16 }}>
              {ct.linha.slice().reverse().map((e, i) => (
                <div key={i} style={{ display: "grid", gridTemplateColumns: "10px 1fr auto", gap: 12, alignItems: "start" }}>
                  <span style={{ width: 10, height: 10, borderRadius: 999, background: i === 0 ? "var(--orange)" : "var(--border)", marginTop: 5 }} />
                  <div><div style={{ fontWeight: 600 }}>{e.t}</div><div style={{ fontSize: 13, color: "var(--muted)" }}>{e.d}</div></div>
                  <div style={{ textAlign: "right", fontSize: 12, color: "var(--muted-2)", whiteSpace: "nowrap" }}><div>{e.q}</div><div>{e.a}</div></div>
                </div>
              ))}
            </div>
          </section>

          <section className="card">
            <h2 className="h2" style={{ marginBottom: 4 }}>Memória de cálculo</h2>
            <p className="section-note">O preço é congelado na assinatura. Mudança de tabela não altera contrato já fechado.</p>
            <div className="stack mono" style={{ gap: 6, fontSize: 13, color: "var(--muted)" }}>
              {ct.memoria.filter(m=>!m.linha.toLowerCase().includes("caução")).map((m, i) => <div key={i} style={{ display: "flex", justifyContent: "space-between", gap: 16 }}><span>{m.linha}</span><span style={{ color: "var(--text)" }}>{m.valor}</span></div>)}
            </div>
          </section>

          <section className="card">
            <h2 className="h2" style={{ marginBottom: 14 }}>Documentos</h2>
            <p className="section-note">O sistema libera uma etapa por vez. Anexe a via assinada para continuar; o modelo sem assinatura permanece disponível.</p>
            {etapaDocumento&&<div className="contract-workflow-docs single">{[etapaDocumento].map(item=>{const assinado=temDocumento(item.tipo);return <div className="workflow-doc" key={item.tipo}><div className="workflow-doc-head"><span><small>Etapa atual · {item.fase}</small><strong>{item.titulo}</strong></span><Tag cor={assinado?"var(--green)":"var(--yellow)"}>{assinado?"Assinado":"Pendente"}</Tag></div><div className="row wrap" style={{gap:8}}><button className="btn btn-ghost btn-sm" onClick={()=>nav(`/app/contratos/${ct.numero}/${item.modelo}`)}>Ver modelo sem assinatura</button><label className={`btn btn-outline btn-sm${enviando===item.tipo?" disabled":""}`}><input hidden type="file" accept="application/pdf,image/jpeg,image/png" disabled={Boolean(enviando)} onChange={async e=>{const arq=e.target.files?.[0];if(!arq)return;setEnviando(item.tipo);try{await atendimentoApi.anexarDocumentoContrato(ct.numero,item.tipo,arq);setDocumentosAssinados(await atendimentoApi.documentosContrato(ct.numero));toast(`${item.titulo} anexado.`)}catch(err){toast(err instanceof Error?err.message:"Falha no envio.")}finally{setEnviando("");e.currentTarget.value=""}}}/>{enviando===item.tipo?"Enviando...":assinado?"Substituir via assinada":"Anexar via assinada"}</label></div></div>})}</div>}
            {ct.situacao==="Em inspeção"&&<div className="workflow-doc inspection-current"><div className="workflow-doc-head"><span><small>Etapa atual · Inspeção</small><strong>Conferência técnica do equipamento</strong></span><Tag cor="var(--blue)">Em inspeção</Tag></div><p className="muted">Aprove a inspeção para encerrar a locação ou registre uma avaria com fotos e descrição.</p></div>}
            {ct.situacao.includes("Encerrado")&&<div className="card-tight" style={{borderColor:"var(--green)"}}><strong>Fluxo documental concluído</strong><small style={{display:"block",color:"var(--muted)"}}>Contrato encerrado. Os documentos permanecem arquivados abaixo.</small></div>}
            {documentosVisiveis.length>0&&<><div className="uplabel" style={{marginTop:14}}>Documentos arquivados</div><div className="client-document-list" style={{marginTop:8}}>{documentosVisiveis.map(d=><div className="client-document-row" key={d.id}><button className="client-document-main" onClick={()=>setVisualizando(d)}><span className="document-file-icon">{d.mime==="application/pdf"?"PDF":"IMG"}</span><span><strong>{d.tipo}</strong><small>{d.nome} · {(d.tamanho/1024/1024).toFixed(2)} MB</small></span></button><div className="client-document-actions"><Tag cor="var(--green)">Arquivado</Tag><button className="btn btn-ghost btn-sm" onClick={()=>setVisualizando(d)}>Visualizar</button><a className="btn btn-ghost btn-sm" href={atendimentoApi.urlDownloadDocumentoContrato(d.id)}>Baixar</a><button className="document-delete" onClick={async()=>{if(!confirm(`Excluir ${d.nome}?`))return;await atendimentoApi.excluirDocumentoContrato(d.id);setDocumentosAssinados(await atendimentoApi.documentosContrato(ct.numero))}}>Excluir</button></div></div>)}</div></>}
          </section>
        </div>

        <aside className="stack" style={{ gap: 16, position: "sticky", top: 88 }}>
          <div className="card">
            <div className="uplabel">Financeiro</div>
            <div className="stack" style={{ gap: 8, marginTop: 12, fontSize: 14 }}>
              <L r="Locação" v={brl.format(ct.locacao)} />
              <L r="Serviços" v={ct.servicos ? brl.format(ct.servicos) : "—"} />
            </div>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "baseline", paddingTop: 10, marginTop: 10, borderTop: "1px solid var(--border)" }}>
              <span style={{ fontWeight: 600 }}>Total do contrato</span>
              <span className="num" style={{ fontSize: 26, color: ct.pagamento === "Vencido" ? "var(--red)" : "var(--orange)" }}>{brl.format(ct.locacao + ct.servicos)}</span>
            </div>
          </div>
          <div className="card">
            <div className="uplabel">Cliente e obra</div>
            <div style={{ fontFamily: "var(--head)", fontWeight: 600, fontSize: 20, marginTop: 4 }}>{cli?.nome}</div>
            <div style={{ fontSize: 13, color: "var(--muted)" }}>{cli?.doc}</div>
            <div style={{ marginTop: 10, fontSize: 13, color: "var(--muted)" }}>{ct.endereco}</div>
            <button className="btn btn-ghost btn-block" style={{ marginTop: 12 }} onClick={() => nav(`/app/clientes/${ct.clienteId}`)}>Ver ficha do cliente</button>
          </div>
        </aside>
      </div>
      {visualizando&&<div className="document-modal" role="dialog" aria-modal="true" onMouseDown={e=>{if(e.target===e.currentTarget)setVisualizando(null)}}><div className="document-modal-card"><header><span><strong>{visualizando.tipo}</strong><small>{visualizando.nome}</small></span><div className="row" style={{gap:8}}><a className="btn btn-ghost btn-sm" href={atendimentoApi.urlDownloadDocumentoContrato(visualizando.id)}>Baixar</a><button className="document-modal-close" onClick={()=>setVisualizando(null)}>×</button></div></header><div className="document-preview">{visualizando.mime.startsWith("image/")?<img src={atendimentoApi.urlDocumentoContrato(visualizando.id)} alt={visualizando.nome}/>:<iframe src={atendimentoApi.urlDocumentoContrato(visualizando.id)} title={visualizando.nome}/>}</div></div></div>}
      {modalAvaria&&<div className="document-modal"><div className="issue-modal"><header><div><div className="uplabel">Inspeção de devolução</div><h2 className="h2">Registrar avaria ou manutenção</h2></div><button className="document-modal-close" onClick={()=>setModalAvaria(false)}>×</button></header><label className="field"><span>Descrição detalhada do problema</span><textarea className="textarea" value={motivoAvaria} onChange={e=>setMotivoAvaria(e.target.value)} placeholder="Descreva o dano, peça ausente, comportamento apresentado e condições em que foi recebido..."/></label><label className="contract-signed-upload"><input type="file" multiple accept="image/jpeg,image/png,application/pdf" onChange={e=>setFotosAvaria(Array.from(e.target.files||[]))}/><span className="document-upload-icon">↑</span><span><strong>Anexar fotos e evidências</strong><small>{fotosAvaria.length?`${fotosAvaria.length} arquivo(s) selecionado(s)`:"PDF, JPG ou PNG · até 10 MB cada"}</small></span></label><div className="row" style={{gap:8,justifyContent:"flex-end"}}><button className="btn btn-ghost" onClick={()=>setModalAvaria(false)}>Cancelar</button><button className="btn btn-primary" disabled={salvandoAvaria||!patrimoniosInspecao.length||motivoAvaria.trim().length<10} onClick={async()=>{setSalvandoAvaria(true);try{for(const f of fotosAvaria)await atendimentoApi.anexarDocumentoContrato(ct.numero,"Evidência de avaria",f);await inspecionarContrato(ct.numero,"MANUTENCAO",motivoAvaria.trim(),patrimoniosInspecao);toast("Avaria documentada e manutenção aberta.");setPatrimoniosInspecao([]);setModalAvaria(false)}catch(e){toast(e instanceof Error?e.message:"Não foi possível registrar.")}finally{setSalvandoAvaria(false)}}}>{salvandoAvaria?"Registrando...":"Registrar ocorrência"}</button></div></div></div>}
    </main>
  );
}

function Mini({ rot, val, cor }: { rot: string; val: string; cor?: string }) {
  return (
    <div>
      <div style={{ fontSize: 10, fontWeight: 700, letterSpacing: ".08em", textTransform: "uppercase", color: "var(--muted-2)" }}>{rot}</div>
      <div style={{ fontSize: 14, fontWeight: 600, color: cor || "var(--text)" }}>{val}</div>
    </div>
  );
}
function L({ r, v }: { r: string; v: string }) {
  return <div style={{ display: "flex", justifyContent: "space-between", gap: 12 }}><span className="muted">{r}</span><span>{v}</span></div>;
}
