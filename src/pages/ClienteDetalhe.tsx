import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { useStore } from "../data/store";
import { COBRANCAS } from "../data/mock";
import { Tag } from "../components/ui";
import { brl } from "../lib/calc";
import { atendimentoApi, type DocumentoClienteApi } from "../lib/api";

const ABAS = [
  { key: "cadastro", nome: "Cadastro" },
  { key: "contratos", nome: "Contratos" },
  { key: "obras", nome: "Obras" },
  { key: "documentos", nome: "Documentos" },
  { key: "cobrancas", nome: "Cobranças" },
];

export default function ClienteDetalhe() {
  const { id } = useParams();
  const { getCliente, contratos } = useStore();
  const nav = useNavigate();
  const [aba, setAba] = useState("cadastro");
  const [documentosApi,setDocumentosApi]=useState<DocumentoClienteApi[]>([]);
  const [tipoDocumento,setTipoDocumento]=useState("RG / CNH");
  const [documentoAberto,setDocumentoAberto]=useState<DocumentoClienteApi|null>(null);
  const [enviandoDocumento,setEnviandoDocumento]=useState(false);
  useEffect(()=>{if(id)void atendimentoApi.documentosCliente(id).then(setDocumentosApi).catch(()=>setDocumentosApi([]))},[id]);

  const cl = getCliente(id!);
  if (!cl) return <main className="page"><div className="empty">Cliente não encontrado.</div></main>;

  const cts = contratos.filter((c) => c.clienteId === cl.id);
  const cobs = COBRANCAS.filter((c) => c.cliente === cl.nome);
  const pend = cl.docs.filter((d) => !d.ok).length;
  const corSit = cl.situacao === "Bloqueado" ? "var(--red)" : cl.situacao === "Em análise" ? "var(--yellow)" : "var(--green)";
  const badges: Record<string, number> = { cadastro: 0, contratos: cts.length, obras: cl.obras.length, documentos: pend, cobrancas: cobs.length };

  const campos = [
    { r: "Tipo", v: cl.tipo }, { r: "Documento", v: cl.doc }, { r: cl.tipo === "Pessoa jurídica" ? "Inscrição estadual" : "RG", v: cl.inscricao },
    { r: "Telefone", v: cl.tel }, { r: "E-mail", v: cl.email }, { r: "Condição", v: cl.condicao },
    { r: "Responsável", v: cl.resp }, { r: "Cliente desde", v: cl.desde },
  ];

  return (
    <main className="page" style={{ maxWidth: 1200 }}>
      <button className="link-back" onClick={() => nav("/app/clientes")}>← Clientes</button>
      <div className="spread" style={{ marginTop: 12, alignItems: "flex-start" }}>
        <div>
          <div className="mono" style={{ fontSize: 12, color: "var(--orange)" }}>{cl.id}</div>
          <h1 className="h1" style={{ fontSize: 34 }}>{cl.nome}</h1>
          <p className="lead">{cl.tipo} · {cl.doc} · cliente desde {cl.desde}</p>
        </div>
        <div className="row wrap" style={{ gap: 8 }}>
          <Tag cor={corSit}>{cl.situacao}</Tag>
          <button className="btn btn-primary" onClick={() => nav(`/app/nova-locacao?cliente=${cl.id}`)}>Nova locação</button>
        </div>
      </div>

      {cl.aviso && <div className="card-tight" style={{ marginTop: 16, borderColor: "var(--yellow)", color: "var(--yellow)", fontWeight: 600 }}>{cl.aviso}</div>}

      <div className="row wrap" style={{ gap: 4, marginTop: 20, borderBottom: "1px solid var(--border)" }}>
        {ABAS.map((a) => (
          <button key={a.key} onClick={() => setAba(a.key)} style={{ display: "flex", alignItems: "center", gap: 8, minHeight: 42, padding: "0 14px", background: "none", border: 0, borderBottom: `2px solid ${aba === a.key ? "var(--orange)" : "transparent"}`, color: aba === a.key ? "var(--text)" : "var(--muted)", fontWeight: 600, fontSize: 14, cursor: "pointer" }}>
            {a.nome}{badges[a.key] > 0 && <span className="tag" style={{ height: 20, padding: "0 8px", border: "1px solid var(--border)", color: "var(--muted-2)", borderRadius: 999, fontSize: 11 }}>{badges[a.key]}</span>}
          </button>
        ))}
      </div>

      {aba === "cadastro" && (
        <>
          <section className="card" style={{ marginTop: 20 }}>
            <h2 className="h2" style={{ marginBottom: 14 }}>Dados cadastrais</h2>
            <div className="grid" style={{ gridTemplateColumns: "repeat(auto-fill,minmax(220px,1fr))" }}>
              {campos.map((c, i) => <div key={i} className="card-tight"><div className="uplabel">{c.r}</div><div style={{ fontSize: 14, fontWeight: 600, marginTop: 2 }}>{c.v || "—"}</div></div>)}
            </div>
          </section>
          <section className="card" style={{ marginTop: 16 }}>
            <h2 className="h2" style={{ marginBottom: 14 }}>Endereço</h2>
            {cl.logradouro?<div className="address-display"><div><small>CEP</small><strong>{cl.cep||"—"}</strong></div><div><small>Logradouro</small><strong>{cl.logradouro}</strong></div><div><small>Número</small><strong>{cl.numeroEndereco||"—"}</strong></div><div><small>Complemento</small><strong>{cl.complemento||"—"}</strong></div><div><small>Bairro</small><strong>{cl.bairro||"—"}</strong></div><div><small>Cidade</small><strong>{cl.cidade||"—"}</strong></div><div><small>UF</small><strong>{cl.uf||"—"}</strong></div><div><small>Quadra</small><strong>{cl.quadra||"—"}</strong></div><div><small>Lote</small><strong>{cl.lote||"—"}</strong></div></div>:<div className="card-tight"><div className="uplabel">Endereço completo</div><strong>{cl.endereco||"Não informado"}</strong></div>}
          </section>
          <section className="card" style={{ marginTop: 16 }}>
            <h2 className="h2" style={{ marginBottom: 8 }}>Observações do atendimento</h2>
            <p className="muted" style={{ margin: 0 }}>{cl.obs || "Sem observações."}</p>
          </section>
        </>
      )}

      {aba === "contratos" && (
        <section className="card" style={{ marginTop: 20 }}>
          <h2 className="h2" style={{ marginBottom: 4 }}>Contratos</h2>
          <p className="section-note">Cliente com histórico não pode ser excluído, apenas bloqueado ou inativado.</p>
          {cts.length === 0 && <div className="empty">Nenhum contrato registrado para este cliente.</div>}
          <div className="list">
            {cts.map((c) => (
              <button key={c.numero} className="list-row" style={{ background: "var(--input)", gridTemplateColumns: "120px 1fr auto auto" }} onClick={() => nav(`/app/contratos/${c.numero}`)}>
                <span className="mono orange" style={{ fontSize: 13 }}>{c.numero}</span>
                <span><span style={{ display: "block", fontWeight: 600 }}>{c.itens.map((i) => i.nome).join(", ")}</span><span style={{ display: "block", fontSize: 13, color: "var(--muted)" }}>{c.local}</span></span>
                <Tag cor={c.situacao === "Atrasado" ? "var(--red)" : "var(--green)"}>{c.situacao}</Tag>
                <span className="num" style={{ fontSize: 19, whiteSpace: "nowrap" }}>{brl.format(c.locacao + c.servicos)}</span>
              </button>
            ))}
          </div>
        </section>
      )}

      {aba === "obras" && (
        <section className="card" style={{ marginTop: 20 }}>
          <h2 className="h2" style={{ marginBottom: 4 }}>Obras deste cliente</h2>
          <p className="section-note">Cada obra tem endereço, responsável, restrição de acesso e frete próprios.</p>
          {cl.obras.length === 0 && <div className="empty">Sem obra cadastrada. Este cliente sempre retira no balcão.</div>}
          <div className="grid" style={{ gridTemplateColumns: "repeat(auto-fill,minmax(280px,1fr))" }}>
            {cl.obras.map((o, i) => (
              <div key={i} className="card-tight">
                <div style={{ fontWeight: 600 }}>{o.nome}</div>
                <div style={{ fontSize: 13, color: "var(--muted)" }}>{o.endereco}</div>
                <div style={{ fontSize: 12, color: "var(--muted-2)", marginTop: 6 }}>{o.restricao} · frete {brl.format(o.frete)}</div>
                <div style={{ fontSize: 12, color: "var(--muted-2)", marginTop: 4 }}>{o.equipamentos}</div>
              </div>
            ))}
          </div>
        </section>
      )}

      {aba === "documentos" && (
        <section className="card" style={{ marginTop: 20 }}>
          <h2 className="h2" style={{ marginBottom: 4 }}>Documentos</h2>
          <p className="section-note">Documento pendente não impede locação à vista, mas bloqueia aprovação de crédito faturado.</p>
          <div className="client-document-upload">
            <label className="field"><span>Tipo de documento</span><select className="select" value={tipoDocumento} onChange={(e)=>setTipoDocumento(e.target.value)}>{["RG / CNH","Comprovante de endereço","CPF","Contrato social","Cartão CNPJ","Documento do responsável","Outro"].map(t=><option key={t}>{t}</option>)}</select></label>
            <label className={`client-document-picker${enviandoDocumento ? " disabled" : ""}`}><input disabled={enviandoDocumento} type="file" accept="application/pdf,image/jpeg,image/png" onChange={async(e)=>{const arquivo=e.target.files?.[0];if(!arquivo||!id)return;setEnviandoDocumento(true);try{await atendimentoApi.anexarDocumento(id,tipoDocumento,arquivo);setDocumentosApi(await atendimentoApi.documentosCliente(id));}finally{setEnviandoDocumento(false);e.currentTarget.value=""}}}/><span className="document-upload-icon">↑</span><span><strong>{enviandoDocumento?"Enviando documento...":"Selecionar documento"}</strong><small>PDF, JPG ou PNG · até 10 MB</small></span></label>
          </div>
          <div className="client-document-list">
          {documentosApi.map((d)=><div key={d.id} className="client-document-row"><button className="client-document-main" onClick={()=>setDocumentoAberto(d)}><span className="document-file-icon">{d.mime === "application/pdf" ? "PDF" : "IMG"}</span><span><strong>{d.tipo}</strong><small>{d.nome} · {(d.tamanho/1024/1024).toFixed(2)} MB</small></span></button><div className="client-document-actions"><Tag cor="var(--green)">Anexado</Tag><button className="btn btn-ghost btn-sm" onClick={()=>setDocumentoAberto(d)}>Visualizar</button><a className="btn btn-ghost btn-sm" href={atendimentoApi.urlDownloadDocumento(d.id)}>Baixar</a><button className="document-delete" onClick={async()=>{if(!window.confirm(`Excluir ${d.nome}?`))return;await atendimentoApi.excluirDocumento(d.id);if(id)setDocumentosApi(await atendimentoApi.documentosCliente(id))}}>Excluir</button></div></div>)}
          </div>
          <div className="list" style={{marginTop: documentosApi.length ? 8 : 0}}>
            {cl.docs.filter((d)=>!d.ok).map((d, i) => (
              <div key={i} className="card-tight" style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
                <span style={{ fontWeight: 600 }}>{d.nome}</span>
                <Tag cor={d.ok ? "var(--green)" : "var(--yellow)"}>{d.ok ? "OK" : "Pendente"}</Tag>
              </div>
            ))}
          </div>
        </section>
      )}

      {documentoAberto && <div className="document-modal" role="dialog" aria-modal="true" aria-label={`Visualização de ${documentoAberto.nome}`} onMouseDown={(e)=>{if(e.target===e.currentTarget)setDocumentoAberto(null)}}>
        <div className="document-modal-card">
          <header><span><strong>{documentoAberto.tipo}</strong><small>{documentoAberto.nome}</small></span><div className="row" style={{gap:8}}><a className="btn btn-ghost btn-sm" href={atendimentoApi.urlDownloadDocumento(documentoAberto.id)}>Baixar</a><button className="document-modal-close" onClick={()=>setDocumentoAberto(null)} aria-label="Fechar">×</button></div></header>
          <div className="document-preview">{documentoAberto.mime.startsWith("image/")?<img src={atendimentoApi.urlDocumento(documentoAberto.id)} alt={documentoAberto.nome}/>:<iframe src={atendimentoApi.urlDocumento(documentoAberto.id)} title={documentoAberto.nome}/>}</div>
        </div>
      </div>}

      {aba === "cobrancas" && (
        <section className="card" style={{ marginTop: 20 }}>
          <h2 className="h2" style={{ marginBottom: 4 }}>Cobranças</h2>
          <p className="section-note">Pagamento sempre vinculado a uma cobrança. Pagamento parcial não quita o total.</p>
          {cobs.length === 0 && <div className="empty">Nenhuma cobrança emitida para este cliente.</div>}
          <div className="list">
            {cobs.map((c) => (
              <div key={c.ref} className="card-tight" style={{ display: "grid", gridTemplateColumns: "110px 1fr auto auto", gap: 14, alignItems: "center" }}>
                <span className="mono orange" style={{ fontSize: 13 }}>{c.ref}</span>
                <span style={{ fontSize: 14 }}>{c.desc}</span>
                <Tag cor={c.situacao === "Vencida" ? "var(--red)" : c.situacao === "Paga" ? "var(--green)" : "var(--yellow)"}>{c.situacao}</Tag>
                <span className="num" style={{ fontSize: 19, whiteSpace: "nowrap" }}>{brl.format(c.valor)}</span>
              </div>
            ))}
          </div>
        </section>
      )}
    </main>
  );
}
