import { useEffect,useState } from "react";
import { useNavigate } from "react-router-dom";
import { PRODUTOS } from "../data/mock";
import { PageHeader, Tag, Thumb } from "../components/ui";
import { brl, unidades } from "../lib/calc";
import { atendimentoApi,type PatrimonioApi } from "../lib/api";
import type{Produto}from"../data/mock";

export default function Produtos() {
  const nav = useNavigate();
  const [produtos,setProdutos]=useState<Produto[]>(PRODUTOS);
  const [patrimonios,setPatrimonios]=useState<PatrimonioApi[]>([]);
  useEffect(()=>{void Promise.all([atendimentoApi.produtos(),atendimentoApi.patrimonios()]).then(([api,pats])=>{setProdutos([...api,...PRODUTOS.filter(p=>!api.some(a=>a.id===p.id))]);setPatrimonios(pats)}).catch(()=>{})},[]);
  return (
    <main className="page" style={{ maxWidth: 1300 }}>
      <PageHeader
        title="Produtos"
        sub="Produto é o que o cliente aluga e o que aparece no pedido. O tipo de controle define como a disponibilidade é calculada e se existe unidade física individual."
        action={<button className="btn btn-primary" onClick={() => nav("/app/produtos/novo")}>Novo produto</button>}
      />
      <div className="list" style={{ marginTop: 24 }}>
        {produtos.map((p) => (
          <button key={p.id} className="list-row" style={{ gridTemplateColumns: "56px 1.3fr auto 80px 1.1fr 90px" }} onClick={() => nav(`/app/produtos/${p.id}`)}>
            <Thumb img={p.img} />
            <span>
              <span style={{ display: "block", fontWeight: 600 }}>{p.nome}</span>
              <span style={{ display: "block", fontSize: 13, color: "var(--muted)" }}>{p.categoria}</span>
            </span>
            <Tag cor={p.controle === "quantidade" ? "var(--blue)" : "var(--orange)"}>{p.controle === "quantidade" ? "Por quantidade" : "Por patrimônio"}</Tag>
            <span className="num" style={{ fontSize: 19, textAlign: "center" }}>{patrimonios.filter(x=>x.produtoId===p.id).length||unidades(p.id)} un.</span>
            <span style={{ fontSize: 13, color: "var(--muted)" }}>diária / semana / mês<br />{brl.format(p.diaria)} / {brl.format(p.semanal)} / {brl.format(p.mensal)}</span>
            <span style={{ textAlign: "right", fontSize: 13, color: "var(--muted)" }}>caução<br /><span style={{ fontWeight: 600, color: "var(--text)" }}>{brl.format(p.caucao)}</span></span>
          </button>
        ))}
      </div>
    </main>
  );
}
