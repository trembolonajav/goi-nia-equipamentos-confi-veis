import { useEffect,useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { PRODUTOS, PATRIMONIOS, COR_ESTADO,type Patrimonio } from "../data/mock";
import { Tag, Thumb } from "../components/ui";
import { brl } from "../lib/calc";
import{atendimentoApi}from"../lib/api";import type{Produto}from"../data/mock";

export default function ProdutoDetalhe() {
  const { id } = useParams();
  const nav = useNavigate();
  const [remoto,setRemoto]=useState<Produto|undefined>();
  const [patrimoniosApi,setPatrimoniosApi]=useState<Patrimonio[]>([]);
  useEffect(()=>{if(id&&!PRODUTOS.some(p=>p.id===id))void atendimentoApi.produto(id).then(setRemoto).catch(()=>{})},[id]);
  useEffect(()=>{if(id)void atendimentoApi.patrimoniosProduto(id).then(setPatrimoniosApi).catch(()=>{})},[id]);
  const pr = PRODUTOS.find((p) => p.id === id)||remoto;
  if (!pr) return <main className="page"><div className="empty">Equipamento não encontrado.</div></main>;

  const pats = patrimonioUnicos([...patrimoniosApi,...PATRIMONIOS.filter((p) => p.prod === pr.id)]);
  const tabela = [
    { nome: "Diária", valor: pr.diaria, eq: "1 dia" }, { nome: "Semanal", valor: pr.semanal, eq: "7 dias" },
    { nome: "Quinzenal", valor: pr.quinzenal, eq: "15 dias" }, { nome: "Mensal", valor: pr.mensal, eq: "30 dias" },
  ];
  const regras = [
    { r: "Tipo de controle", v: pr.controle === "quantidade" ? "Por quantidade" : "Por patrimônio" },
    { r: "Caução", v: brl.format(pr.caucao) }, { r: "Valor de reposição", v: brl.format(pr.reposicao) },
    { r: "Período mínimo", v: pr.minimo }, { r: "Preparo antes da saída", v: pr.preparo }, { r: "Inspeção após retorno", v: pr.inspecao },
    { r: "Multa por atraso", v: pr.multa }, { r: "Limpeza", v: pr.limpeza },
  ];
  const margem = pr.receita - pr.custoManut;
  const totalDias=pr.diasLocada+pr.diasParada;
  const ocupPct = totalDias>0?Math.round((pr.diasLocada/totalDias)*100):0;
  const rent = [
    { r: "Receita acumulada", v: brl.format(pr.receita), cor: "var(--green)" },
    { r: "Custo de manutenção", v: "− " + brl.format(pr.custoManut), cor: "var(--red)" },
    { r: "Margem", v: brl.format(margem), cor: "var(--text)" },
    { r: "Dias locado / parado", v: `${pr.diasLocada} / ${pr.diasParada}`, cor: "var(--muted)" },
    { r: "Taxa de ocupação", v: ocupPct + "%", cor: "var(--blue)" },
    { r: "Payback sobre aquisição", v: Math.round((pr.receita / pr.aquisicao) * 100) + "%", cor: "var(--text)" },
  ];

  return (
    <main className="page" style={{ maxWidth: 1300 }}>
      <button className="link-back" onClick={() => nav("/app/produtos")}>← Produtos</button>
      <div className="spread" style={{ marginTop: 12, alignItems: "flex-start" }}>
        <div className="row" style={{ gap: 16, alignItems: "flex-start" }}>
          <Thumb img={pr.img} w={72} h={60} />
          <div>
            <div className="uplabel">{pr.categoria}</div>
            <h1 className="h1" style={{ fontSize: 34 }}>{pr.nome}</h1>
            <p className="lead">{pr.controle === "quantidade" ? `${pr.unidades || 0} unidades em estoque` : `${pats.length} unidades físicas`}</p>
          </div>
        </div>
        <button className="btn btn-primary" onClick={() => nav(`/app/nova-locacao?produto=${pr.id}`)}>Locar este equipamento</button>
      </div>

      <div className="grid" style={{ gridTemplateColumns: "repeat(auto-fill,minmax(180px,1fr))", marginTop: 24 }}>
        {tabela.map((t, i) => (
          <div key={i} className="card" style={{ padding: 16 }}>
            <div className="uplabel">{t.nome}</div>
            <div className="num" style={{ fontSize: 26 }}>{brl.format(t.valor)}</div>
            <div style={{ fontSize: 12, color: "var(--muted)" }}>{t.eq}</div>
          </div>
        ))}
      </div>

      <div className="dash-cols" style={{ marginTop: 24, display: "grid", gridTemplateColumns: "1fr 340px", gap: 24, alignItems: "start" }}>
        <section className="card">
          <h2 className="h2" style={{ marginBottom: 4 }}>{pr.controle === "quantidade" ? "Estoque" : "Patrimônios"}</h2>
          <p className="section-note">{pr.controle === "quantidade" ? "Controlado por quantidade, sem unidade física individual." : "Cada unidade física tem estado e localização próprios."}</p>
          {pr.controle === "quantidade" ? (
            <div className="num" style={{ fontSize: 40 }}>{pr.unidades || 0} <span style={{ fontSize: 16, color: "var(--muted)" }}>unidades</span></div>
          ) : (
            <div className="list">
              {pats.map((p) => (
                <div key={p.cod} className="card-tight" style={{ display: "grid", gridTemplateColumns: "110px 1fr auto auto", gap: 14, alignItems: "center" }}>
                  <span className="mono orange" style={{ fontSize: 13 }}>{p.cod}</span>
                  <span><span style={{ display: "block", fontSize: 13, color: "var(--muted)" }}>{p.local}</span><span style={{ display: "block", fontSize: 12, color: "var(--muted-2)" }}>{p.serie} · {p.horimetro}</span></span>
                  <Tag cor={COR_ESTADO[p.estado] || "var(--muted)"}>{p.estado}</Tag>
                  <span style={{ textAlign: "right", fontSize: 12, color: "var(--muted-2)", whiteSpace: "nowrap" }}>{p.proxima}</span>
                </div>
              ))}
            </div>
          )}
        </section>

        <aside className="stack" style={{ gap: 16 }}>
          <div className="card">
            <h2 className="h2" style={{ marginBottom: 12 }}>Regras de locação</h2>
            <div className="stack" style={{ gap: 8, fontSize: 14 }}>
              {regras.map((r, i) => <div key={i} style={{ display: "flex", justifyContent: "space-between", gap: 12 }}><span className="muted">{r.r}</span><span style={{ textAlign: "right" }}>{r.v}</span></div>)}
            </div>
          </div>
          <div className="card">
            <h2 className="h2" style={{ marginBottom: 12 }}>Rentabilidade</h2>
            <div className="stack" style={{ gap: 8, fontSize: 14 }}>
              {rent.map((r, i) => <div key={i} style={{ display: "flex", justifyContent: "space-between", gap: 12 }}><span className="muted">{r.r}</span><span style={{ color: r.cor }}>{r.v}</span></div>)}
            </div>
          </div>
        </aside>
      </div>
    </main>
  );
}
function patrimonioUnicos(lista:Patrimonio[]){return lista.filter((p,i,a)=>a.findIndex(x=>x.cod===p.cod)===i)}
