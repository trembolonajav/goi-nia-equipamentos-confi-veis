import { useCallback, useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { COR_ESTADO } from "../data/mock";
import { PageHeader, Tag, Thumb } from "../components/ui";
import { atendimentoApi, type PatrimonioApi } from "../lib/api";

const nomes: Record<string,string> = { DISPONIVEL:"Disponível", LOCADO:"Locado", RESERVADO:"Reservado", INSPECAO:"Em inspeção", MANUTENCAO:"Em manutenção", AGUARDANDO_COLETA:"Aguardando coleta" };

export default function Patrimonios() {
  const nav = useNavigate();
  const [lista,setLista] = useState<PatrimonioApi[]>([]);
  const [filtro,setFiltro] = useState("Todos");
  const [carregando,setCarregando] = useState(true);
  const [erro,setErro] = useState("");
  const carregar = useCallback(() => {
    setCarregando(true); setErro("");
    atendimentoApi.patrimonios().then(setLista)
      .catch(e => setErro(e instanceof Error ? e.message : "Não foi possível carregar os patrimônios."))
      .finally(() => setCarregando(false));
  }, []);
  useEffect(carregar, [carregar]);
  const exibidos = lista.filter(p => filtro === "Todos" || nomes[p.estado] === filtro);
  return <main className="page">
    <PageHeader title="Patrimônios" sub="Unidades físicas carregadas diretamente do cadastro operacional."/>
    <div className="row wrap" style={{gap:8,marginTop:20}}>{["Todos",...Object.values(nomes)].map(f => <button className={`chip${filtro===f?" on":""}`} key={f} onClick={() => setFiltro(f)}>{f}</button>)}</div>
    {erro && <div className="inline-error" style={{marginTop:20}}>{erro}<button className="btn btn-ghost" style={{marginLeft:12}} onClick={carregar}>Tentar novamente</button></div>}
    {!erro && <><div className="list-head" style={{marginTop:24,gridTemplateColumns:"56px 130px 1.3fr 1fr 1fr 140px"}}><span/><span>Código</span><span>Equipamento</span><span>Série / horímetro</span><span>Local</span><span>Estado</span></div><div className="list">
      {exibidos.map(p => { const estado = nomes[p.estado] || p.estado; return <button className="list-row" style={{gridTemplateColumns:"56px 130px 1.3fr 1fr 1fr 140px"}} key={p.codigo} onClick={() => nav(`/app/patrimonios/${p.codigo}`)}><Thumb img=""/><span className="mono orange">{p.codigo}</span><span><strong>{p.produto}</strong><small className="block muted">{[p.marca,p.modelo].filter(Boolean).join(" · ") || "Marca e modelo não informados"}</small></span><span className="muted">{p.serie || "Série não informada"}</span><span className="muted">{p.local || "Local não informado"}</span><Tag cor={COR_ESTADO[estado] || "var(--muted)"}>{estado}</Tag></button>; })}
      {carregando && <div className="empty">Carregando patrimônios...</div>}
      {!carregando && !lista.length && <div className="empty">Nenhum patrimônio cadastrado no sistema.</div>}
      {!carregando && lista.length > 0 && !exibidos.length && <div className="empty">Nenhum patrimônio corresponde ao filtro selecionado.</div>}
    </div></>}
  </main>;
}
