import { useEffect, useMemo, useState } from "react";
import { PATRIMONIOS, COR_COMP, NOME_COMP } from "../data/mock";
import { useStore } from "../data/store";
import { PageHeader, Tag } from "../components/ui";
import { atendimentoApi, type PatrimonioApi } from "../lib/api";

function addDias(iso: string, n: number) {
  const d = new Date(`${iso}T00:00:00`);
  d.setDate(d.getDate() + n);
  return d.toISOString().slice(0, 10);
}
const SEM = ["dom", "seg", "ter", "qua", "qui", "sex", "sáb"];
const estadoNome: Record<string, string> = { DISPONIVEL: "Disponível", LOCADO: "Locado", RESERVADO: "Reservado", INSPECAO: "Em inspeção", MANUTENCAO: "Em manutenção", AGUARDANDO_COLETA: "Aguardando coleta" };
const estadoCor: Record<string, string> = { DISPONIVEL: "var(--green)", LOCADO: "var(--orange)", RESERVADO: "var(--blue)", INSPECAO: "var(--blue)", MANUTENCAO: "var(--red)", AGUARDANDO_COLETA: "var(--yellow)" };

export default function Calendario() {
  const { getProduto, contratos } = useStore();
  const hoje = new Date().toISOString().slice(0, 10);
  const [inicio, setInicio] = useState(hoje);
  const [quantidadeDias, setQuantidadeDias] = useState(14);
  const [patrimonios, setPatrimonios] = useState<PatrimonioApi[]>([]);
  const [busca, setBusca] = useState("");
  const [produto, setProduto] = useState("");
  const [estado, setEstado] = useState("");
  const [somenteOcupados, setSomenteOcupados] = useState(false);

  useEffect(() => { void atendimentoApi.patrimonios().then(setPatrimonios); }, []);
  const dias = useMemo(() => Array.from({ length: quantidadeDias }, (_, i) => addDias(inicio, i)), [inicio, quantidadeDias]);
  const base = useMemo(() => patrimonios.length
    ? patrimonios.map(p => ({ cod: p.codigo, prod: p.produtoId, estado: p.estado.toUpperCase(), produto: p.produto }))
    : PATRIMONIOS.map(p => ({ cod: p.cod, prod: p.prod, estado: p.estado.toUpperCase(), produto: getProduto(p.prod)?.nome || p.prod })), [patrimonios, getProduto]);
  const produtos = useMemo(() => [...new Map(base.map(p => [p.prod, p.produto])).entries()].sort((a,b) => a[1].localeCompare(b[1])), [base]);
  const temCompromisso = (p: typeof base[number]) => p.estado === "MANUTENCAO" || contratos.some(c => c.inicio <= dias[dias.length - 1] && c.fim >= inicio && c.situacao !== "Encerrado" && c.itens.some(i => i.patrimonio.includes(p.cod)));
  const filtrados = base.filter(p => {
    const q = busca.trim().toLowerCase();
    return (!q || `${p.cod} ${p.produto}`.toLowerCase().includes(q)) && (!produto || p.prod === produto) && (!estado || p.estado === estado) && (!somenteOcupados || temCompromisso(p));
  });
  const ocupados = filtrados.filter(temCompromisso).length;

  return <main className="page" style={{maxWidth:1500}}>
    <PageHeader title="Calendário de ocupação" sub="Consulte a agenda real de cada unidade antes de confirmar uma locação." />
    <section className="card calendar-filters">
      <div className="calendar-filter-grid">
        <label className="field"><span>A partir de</span><input className="input" type="date" value={inicio} onChange={e=>setInicio(e.target.value)}/></label>
        <label className="field"><span>Período</span><select className="select" value={quantidadeDias} onChange={e=>setQuantidadeDias(Number(e.target.value))}><option value={7}>7 dias</option><option value={14}>14 dias</option><option value={30}>30 dias</option></select></label>
        <label className="field"><span>Equipamento</span><select className="select" value={produto} onChange={e=>setProduto(e.target.value)}><option value="">Todos os equipamentos</option>{produtos.map(([id,nome])=><option key={id} value={id}>{nome}</option>)}</select></label>
        <label className="field"><span>Situação atual</span><select className="select" value={estado} onChange={e=>setEstado(e.target.value)}><option value="">Todas as situações</option>{Object.entries(estadoNome).map(([id,nome])=><option key={id} value={id}>{nome}</option>)}</select></label>
        <label className="field calendar-search"><span>Buscar</span><input className="input" value={busca} onChange={e=>setBusca(e.target.value)} placeholder="Código ou equipamento"/></label>
      </div>
      <div className="calendar-filter-footer"><label className="calendar-check"><input type="checkbox" checked={somenteOcupados} onChange={e=>setSomenteOcupados(e.target.checked)}/><span>Mostrar somente unidades ocupadas ou bloqueadas</span></label><button className="btn btn-ghost btn-sm" onClick={()=>{setBusca("");setProduto("");setEstado("");setSomenteOcupados(false);setInicio(hoje);setQuantidadeDias(14)}}>Limpar filtros</button></div>
    </section>
    <div className="calendar-summary"><div><span className="uplabel">Unidades exibidas</span><strong>{filtrados.length}</strong></div><div><span className="uplabel">Com compromisso</span><strong className="orange">{ocupados}</strong></div><div><span className="uplabel">Livres no período</span><strong style={{color:"var(--green)"}}>{filtrados.length-ocupados}</strong></div><div className="calendar-legend">{[{nome:"Locado",cor:COR_COMP.locado},{nome:"Reservado",cor:COR_COMP.reservado},{nome:"Manutenção",cor:COR_COMP.manutencao},{nome:"Livre",cor:"var(--input)"}].map(l=><span key={l.nome}><i style={{background:l.cor}}/>{l.nome}</span>)}</div></div>
    <section className="card calendar-card">
      {!filtrados.length?<div className="empty">Nenhum patrimônio corresponde aos filtros selecionados.</div>:<div className="calendar-scroll"><div className="calendar-grid" style={{gridTemplateColumns:`260px repeat(${quantidadeDias}, minmax(46px, 1fr))`}}>
        <span className="uplabel calendar-sticky">Patrimônio / equipamento</span>{dias.map(d=><span key={d} className={`calendar-day-head${d===hoje?" today":""}`}><small>{SEM[new Date(`${d}T00:00:00`).getDay()]}</small><strong>{d.slice(8)}</strong><small>{d.slice(5,7)}</small></span>)}
        {filtrados.map(p=><div key={p.cod} style={{display:"contents"}}><div className="calendar-asset calendar-sticky"><div><span className="mono orange">{p.cod}</span><Tag cor={estadoCor[p.estado]||"var(--muted)"}>{estadoNome[p.estado]||p.estado.replaceAll("_"," ")}</Tag></div><small>{p.produto}</small></div>{dias.map(d=>{const contrato=contratos.find(c=>c.inicio<=d&&d<=c.fim&&c.situacao!=="Encerrado"&&c.itens.some(i=>i.patrimonio.includes(p.cod)));const comp=p.estado==="MANUTENCAO"?{tipo:"manutencao" as const,ref:"Manutenção cadastrada"}:contrato?{tipo:contrato.situacao==="Aguardando pagamento"?"reservado" as const:"locado" as const,ref:contrato.numero}:null;return <span key={d} className={`calendar-cell${d===hoje?" today":""}`} title={comp?`${NOME_COMP[comp.tipo]} · ${comp.ref}`:"Livre"}><i style={{background:comp?COR_COMP[comp.tipo]:"var(--input)",opacity:comp?.tipo==="manutencao"?.9:comp?.tipo?1:.45}}/></span>})}</div>)}
      </div></div>}
    </section>
  </main>;
}
