import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { COR_ESTADO, type Patrimonio } from "../data/mock";
import { Tag, Thumb } from "../components/ui";
import { brl } from "../lib/calc";
import { atendimentoApi, type ProdutoApi } from "../lib/api";

export default function ProdutoDetalhe() {
  const { id } = useParams();
  const nav = useNavigate();
  const [produto,setProduto] = useState<ProdutoApi>();
  const [pats,setPats] = useState<Patrimonio[]>([]);
  const [erro,setErro] = useState("");
  useEffect(() => {
    if (!id) return;
    Promise.all([atendimentoApi.produto(id), atendimentoApi.patrimoniosProduto(id)])
      .then(([p,ps]) => { setProduto(p); setPats(ps); })
      .catch(e => setErro(e instanceof Error ? e.message : "Não foi possível carregar o produto."));
  }, [id]);
  if (erro) return <main className="page"><div className="inline-error">{erro}</div></main>;
  if (!produto) return <main className="page"><div className="empty">Carregando equipamento...</div></main>;
  const pr = produto;
  const tabela:ReadonlyArray<readonly [string,number,string]> = pr.precos?.length ? pr.precos.map(x=>[x.nome,Number(x.valor),`${x.duracaoDias} ${x.duracaoDias===1?"dia":"dias"}`] as const) : [["Diária",pr.diaria,"1 dia"],["Semanal",pr.semanal,"7 dias"],["Quinzenal",pr.quinzenal,"15 dias"],["Mensal",pr.mensal,"30 dias"]];
  return <main className="page" style={{maxWidth:1300}}>
    <button className="link-back" onClick={() => nav("/app/produtos")}>← Produtos</button>
    <div className="spread" style={{marginTop:12,alignItems:"flex-start"}}><div className="row" style={{gap:16}}><Thumb img={pr.img} w={72} h={60}/><div><div className="uplabel">{pr.categoria}</div><h1 className="h1">{pr.nome}</h1><p className="lead">{[pr.marca,pr.modelo].filter(Boolean).join(" · ")} · {pats.length} patrimônios</p></div></div><div className="row"><button className="btn btn-ghost" onClick={() => nav(`/app/produtos/${pr.id}/editar`)}>Editar produto</button><button className="btn btn-primary" onClick={() => nav(`/app/nova-locacao?produto=${pr.id}`)}>Locar este equipamento</button></div></div>
    {pr.descricao && <p className="lead" style={{marginTop:16}}>{pr.descricao}</p>}
    <div className="grid product-detail-prices" style={{gridTemplateColumns:"repeat(auto-fit,minmax(175px,1fr))",marginTop:24}}>{tabela.map(([nome,valor,periodo]) => <div className="card price-summary-card" key={nome}><div className="uplabel">{nome}</div><div className="num" style={{fontSize:26}}>{brl.format(valor)}</div><small className="muted">{periodo}</small></div>)}</div>
    <div className="dash-cols" style={{marginTop:24,display:"grid",gridTemplateColumns:"1fr 340px",gap:24,alignItems:"start"}}>
      <section className="card"><h2 className="h2">Patrimônios</h2><p className="section-note">Cada unidade física tem estado e localização próprios. Selecione uma unidade para consultar ou editar seu cadastro.</p><div className="list">{pats.map(p => <button key={p.cod} className="card-tight" style={{display:"grid",width:"100%",gridTemplateColumns:"110px 1fr auto",gap:14,alignItems:"center",textAlign:"left"}} onClick={() => nav(`/app/patrimonios/${p.cod}`)}><span className="mono orange">{p.cod}</span><span><span style={{display:"block"}}>{p.local || "Local não informado"}</span><small className="muted">{p.serie || "Série não informada"}</small></span><Tag cor={COR_ESTADO[p.estado] || "var(--muted)"}>{p.estado}</Tag></button>)}{pats.length === 0 && <div className="empty">Nenhum patrimônio vinculado.</div>}</div></section>
      <aside className="stack"><div className="card"><h2 className="h2">Cadastro comercial</h2>{[["Código",pr.id],["Categoria",pr.categoria],["Marca",pr.marca || "Não informada"],["Modelo",pr.modelo || "Não informado"],["Unidade",pr.unidadeLocacao || "UNIDADE"]].map(([rotulo,valor]) => <div className="spread" style={{marginTop:10}} key={rotulo}><span className="muted">{rotulo}</span><span>{valor}</span></div>)}</div></aside>
    </div>
  </main>;
}
