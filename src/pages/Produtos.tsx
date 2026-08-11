import { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { PageHeader, Tag, Thumb } from "../components/ui";
import { brl } from "../lib/calc";
import { atendimentoApi, type PatrimonioApi } from "../lib/api";
import type { Produto } from "../data/mock";

export default function Produtos() {
  const nav = useNavigate();
  const [produtos, setProdutos] = useState<Produto[]>([]);
  const [patrimonios, setPatrimonios] = useState<PatrimonioApi[]>([]);
  const [erro, setErro] = useState("");

  useEffect(() => {
    Promise.all([atendimentoApi.produtos(), atendimentoApi.patrimonios()])
      .then(([lista, ativos]) => { setProdutos(lista); setPatrimonios(ativos); })
      .catch((e) => setErro(e instanceof Error ? e.message : "Não foi possível carregar os produtos."));
  }, []);

  const quantidades = useMemo(() => patrimonios.reduce<Record<string, number>>((acc, item) => {
    acc[item.produtoId] = (acc[item.produtoId] || 0) + 1;
    return acc;
  }, {}), [patrimonios]);

  return <main className="page" style={{ maxWidth: 1300 }}>
    <PageHeader title="Produtos" sub="Cadastro comercial dos equipamentos. Cada unidade física é controlada individualmente por patrimônio."
      action={<button className="btn btn-primary" onClick={() => nav("/app/produtos/novo")}>Novo produto</button>} />
    {erro && <div className="inline-error" style={{ marginTop: 20 }}>{erro}</div>}
    {!erro && produtos.length === 0 && <div className="empty" style={{ marginTop: 24 }}>Nenhum produto ativo cadastrado.</div>}
    <div className="list" style={{ marginTop: 24 }}>
      {produtos.map((p) => <button key={p.id} className="list-row" style={{ gridTemplateColumns: "56px 1.4fr auto 90px 1.2fr" }} onClick={() => nav(`/app/produtos/${p.id}`)}>
        <Thumb img={p.img} />
        <span><strong style={{ display: "block" }}>{p.nome}</strong><small className="muted">{p.categoria} · {[p.marca, p.modelo].filter(Boolean).join(" ")}</small></span>
        <Tag cor="var(--orange)">Por patrimônio</Tag>
        <span className="num" style={{ fontSize: 19, textAlign: "center" }}>{quantidades[p.id] || 0} un.</span>
        <span className="muted" style={{ fontSize: 13 }}>diária / semanal / quinzenal / mensal<br />{brl.format(p.diaria)} / {brl.format(p.semanal)} / {brl.format(p.quinzenal)} / {brl.format(p.mensal)}</span>
      </button>)}
    </div>
  </main>;
}
