import {useEffect,useState} from "react";
import {useNavigate,useParams} from "react-router-dom";
import {publicApi,type ConteudoPublico,type EquipamentoPublico} from "../lib/api";
import {openWhatsApp} from "../lib/whatsapp";
const brl=new Intl.NumberFormat("pt-BR",{style:"currency",currency:"BRL"});
function parse<T>(v:string|T):T{try{return typeof v==="string"?JSON.parse(v):v}catch{return {} as T}}
export default function SiteProduto(){
 const {slug=""}=useParams(),nav=useNavigate(),[eq,setEq]=useState<EquipamentoPublico|null>(null),[erro,setErro]=useState("");
 useEffect(()=>{publicApi.equipamento(slug).then(setEq).catch(e=>setErro(e.message))},[slug]);
 if(erro)return <main className="site-wrap" style={{padding:60}}><div className="empty">{erro}</div></main>;
 if(!eq)return <main className="site-wrap" style={{padding:60}}><div className="empty">Carregando equipamento...</div></main>;
 const specs=parse<Record<string,string>>(eq.especificacoes),c=parse<ConteudoPublico>(eq.conteudoPublico),msg=`Olá! Quero consultar a locação de ${eq.nome}${eq.modelo?` (${eq.modelo})`:""}. Pode confirmar disponibilidade e condições?`;
 return <main className="site-wrap product-page" style={{padding:"34px 0 88px"}}>
  <div className="row" style={{gap:8,fontSize:13}}><button className="link-back" onClick={()=>nav("/site")}>Início</button><span className="muted">/</span><button className="link-back" onClick={()=>nav("/site/catalogo")}>Catálogo</button><span className="muted">/ {eq.nome}</span></div>
  <section className="product-hero-grid"><div><div className="product-photo"><img src={eq.imagemUrl} alt={eq.nome}/></div><div style={{marginTop:24}}><div className="uplabel" style={{color:"var(--orange)"}}>{eq.categoria}</div><h1 className="h1 product-title">{eq.nome}</h1><div className="row wrap" style={{gap:8}}>{eq.marca&&<span className="product-pill">{eq.marca}</span>}{eq.modelo&&<span className="product-pill">Modelo {eq.modelo}</span>}<span className="product-pill">Código {eq.id}</span></div><p className="lead product-summary">{c.resumo||eq.descricao}</p></div></div>
   <aside className="product-rental-card"><div className="uplabel" style={{color:"var(--orange)"}}>Tabela de locação</div><h2 className="h2">Escolha o período</h2><p className="muted">Valores por unidade. A equipe confirma disponibilidade, datas, retirada ou entrega.</p><div className="price-stack">{eq.precos.map((p,i)=><div className={`price-row${i===0?" featured":""}`} key={p.duracaoDias}><div><strong>{p.nome}</strong><span>{p.duracaoDias} {p.duracaoDias===1?"dia":"dias"}</span></div><b>{brl.format(p.valor)}</b></div>)}</div><button className="btn btn-primary btn-block" onClick={()=>openWhatsApp(msg)}>Consultar este equipamento</button><p className="muted rental-note">Sem compromisso · atendimento direto pelo WhatsApp</p></aside>
  </section>
  <section className="product-section"><div><div className="uplabel">Aplicação</div><h2 className="site-h2">Para que este equipamento serve</h2><p className="lead">{eq.aplicacao}</p></div><CheckList title="Indicado para" items={c.indicadoPara||[]}/></section>
  <section className="product-section specs-section"><div><div className="uplabel">Ficha técnica</div><h2 className="site-h2">Especificações confirmadas</h2><p className="muted">Dados identificados na unidade, no documento recebido ou na ficha oficial do fabricante.</p></div><div className="spec-grid">{Object.entries(specs).map(([k,v])=><div className="spec-card" key={k}><span>{k}</span><strong>{v}</strong></div>)}</div></section>
  <section className="product-info-grid"><CheckList title="O que acompanha" items={c.inclui||[]}/><CheckList title="Cuidados de operação" items={c.cuidados||[]}/><div className="warning-card"><div className="uplabel">Atenção</div><h3>Limites de uso</h3><p>{c.naoIndicado||"Consulte a equipe para validar a aplicação."}</p></div></section>
  {c.observacaoTecnica&&<div className="technical-note"><strong>Nota técnica do cadastro</strong><p>{c.observacaoTecnica}</p></div>}
  <section className="product-cta"><div><div className="uplabel">Pronto para reservar?</div><h2 className="site-h2">Confirme o período com a LOCAGO</h2><p className="muted">Informe datas, endereço da obra e o serviço que será executado.</p></div><button className="btn btn-primary" onClick={()=>openWhatsApp(msg)}>Falar no WhatsApp</button></section>
 </main>
}
function CheckList({title,items}:{title:string;items:string[]}){return <div className="info-card"><h3>{title}</h3><ul>{items.map(x=><li key={x}><span>✓</span>{x}</li>)}</ul></div>}
