import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { COR_ESTADO } from "../data/mock";
import { PageHeader, Tag, useToast } from "../components/ui";
import { atendimentoApi, type PatrimonioApi } from "../lib/api";

const nomes: Record<string,string> = { DISPONIVEL:"Disponível", LOCADO:"Locado", RESERVADO:"Reservado", INSPECAO:"Em inspeção", MANUTENCAO:"Em manutenção", AGUARDANDO_COLETA:"Aguardando coleta" };

export default function PatrimonioDetalhe() {
  const { codigo } = useParams();
  const nav = useNavigate();
  const { toast } = useToast();
  const [patrimonio,setPatrimonio] = useState<PatrimonioApi>();
  const [form,setForm] = useState({serie:"",local:"",dataAquisicao:"",valorAquisicao:"",observacao:""});
  const [erro,setErro] = useState("");
  const [salvando,setSalvando] = useState(false);

  useEffect(() => {
    if (!codigo) return;
    atendimentoApi.patrimonio(codigo).then(p => {
      setPatrimonio(p);
      setForm({serie:p.serie || "",local:p.local || "",dataAquisicao:p.dataAquisicao || "",valorAquisicao:p.valorAquisicao == null ? "" : String(p.valorAquisicao),observacao:p.observacao || ""});
    }).catch(e => setErro(e instanceof Error ? e.message : "Não foi possível carregar o patrimônio."));
  }, [codigo]);

  async function salvar() {
    if (!codigo) return;
    const valor = form.valorAquisicao === "" ? null : Number(form.valorAquisicao);
    if (valor != null && (!Number.isFinite(valor) || valor < 0)) return setErro("Informe um valor de aquisição válido.");
    setSalvando(true); setErro("");
    try {
      const atualizado = await atendimentoApi.atualizarPatrimonio(codigo, {...form, valorAquisicao:valor});
      setPatrimonio(atualizado);
      toast(`Patrimônio ${codigo} atualizado.`);
    } catch (e) { setErro(e instanceof Error ? e.message : "Não foi possível atualizar o patrimônio."); }
    finally { setSalvando(false); }
  }

  if (erro && !patrimonio) return <main className="page"><button className="link-back" onClick={() => nav("/app/patrimonios")}>← Patrimônios</button><div className="inline-error" style={{marginTop:20}}>{erro}</div></main>;
  if (!patrimonio) return <main className="page"><div className="empty">Carregando patrimônio...</div></main>;
  const estado = nomes[patrimonio.estado] || patrimonio.estado;
  return <main className="page" style={{maxWidth:1000}}>
    <button className="link-back" onClick={() => nav("/app/patrimonios")}>← Patrimônios</button>
    <div className="spread" style={{marginTop:12,alignItems:"flex-start"}}><PageHeader title={patrimonio.codigo} sub={`${patrimonio.produto} · ${[patrimonio.marca,patrimonio.modelo].filter(Boolean).join(" · ") || "marca e modelo não informados"}`}/><Tag cor={COR_ESTADO[estado] || "var(--muted)"}>{estado}</Tag></div>
    <div className="stack" style={{gap:18,marginTop:22}}>
      <section className="card"><h2 className="h2">Vínculo operacional</h2><p className="section-note">Código, equipamento e estado são controlados pelo sistema e não podem ser alterados manualmente.</p><div className="grid product-form-grid"><label className="field"><span>Código do patrimônio</span><input className="input" readOnly value={patrimonio.codigo}/></label><label className="field"><span>Equipamento</span><input className="input" readOnly value={`${patrimonio.produtoId} · ${patrimonio.produto}`}/></label><label className="field"><span>Estado operacional</span><input className="input" readOnly value={estado}/></label></div></section>
      <section className="card"><h2 className="h2">Dados da unidade física</h2><div className="grid product-form-grid"><label className="field"><span>Número de série</span><input className="input" value={form.serie} onChange={e => setForm(x => ({...x,serie:e.target.value}))} placeholder="Número informado pelo fabricante"/></label><label className="field"><span>Localização atual</span><input className="input" value={form.local} onChange={e => setForm(x => ({...x,local:e.target.value}))} placeholder="Galpão · setor A"/></label><label className="field"><span>Data de aquisição</span><input className="input" type="date" value={form.dataAquisicao} onChange={e => setForm(x => ({...x,dataAquisicao:e.target.value}))}/></label><label className="field"><span>Valor de aquisição</span><div className="money-input"><span>R$</span><input type="number" min="0" step="0.01" value={form.valorAquisicao} onChange={e => setForm(x => ({...x,valorAquisicao:e.target.value}))}/></div></label><label className="field" style={{gridColumn:"1 / -1"}}><span>Observações</span><textarea className="textarea" value={form.observacao} onChange={e => setForm(x => ({...x,observacao:e.target.value}))} placeholder="Características, identificação visual ou observações permanentes desta unidade"/></label></div></section>
      {erro && <div className="inline-error">{erro}</div>}
      <div className="row"><button className="btn btn-primary" disabled={salvando} onClick={salvar}>{salvando ? "Salvando..." : "Salvar alterações"}</button><button className="btn btn-ghost" onClick={() => nav(`/app/produtos/${patrimonio.produtoId}`)}>Ver equipamento</button></div>
    </div>
  </main>;
}
