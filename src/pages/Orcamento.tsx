import { useNavigate, useParams } from "react-router-dom";
import { useStore } from "../data/store";
import { EXTRAS } from "../data/mock";
import { brl, dias as diasEntre } from "../lib/calc";
import logoDocumento from "../assets/locago-logo-documentos.png";

const WHATSAPP = "(62) 98146-9409";

export default function Orcamento(){
  const {num}=useParams();const nav=useNavigate();const{getPedido,getCliente,getProduto}=useStore();const p=getPedido(num!);
  if(!p)return <main className="page"><div className="empty">Orçamento não encontrado.</div></main>;
  const cliente=getCliente(p.clienteId),dias=diasEntre(p.inicio,p.fim);
  const itens=p.itens.map(i=>{const produto=getProduto(i.prod);const total=Number(i.valor||0);return{nome:i.nome||produto?.nome||i.prod,qtd:i.qtd,periodo:i.tipoPreco||"Preço congelado",periodos:dias,unit:Number(i.valorUnitario??(total/Math.max(1,i.qtd))),total}});
  const servicos=p.servicosDetalhes ?? (p.servicos.map(nome=>EXTRAS.find(e=>e.nome===nome)).filter(Boolean) as typeof EXTRAS);
  const locacao=Number(p.valorLocacao??itens.reduce((a,i)=>a+i.total,0)),serv=Number(p.valorServicos??servicos.reduce((a,s)=>a+Number(s.valor),0)),total=Number(p.valorTotal??(locacao+serv+(p.frete||0)-p.desconto));
  const emissao=p.emitidoEm?new Date(p.emitidoEm):new Date(),validade=p.validade?new Date(`${p.validade}T12:00:00`):new Date(emissao);if(!p.validade)validade.setDate(validade.getDate()+3);
  const codigo=`ORC-${p.num.replace(/\D/g,"").slice(-6).padStart(6,"0")}`;
  const data=(d:Date)=>d.toLocaleDateString("pt-BR");
  return <main className="page budget-page"><div className="budget-toolbar"><button className="btn btn-ghost" onClick={()=>nav(`/app/pedidos/${p.num}`)}>← Voltar ao pedido</button><button className="btn btn-primary" onClick={()=>window.print()}>Imprimir / Salvar em PDF</button></div>
    <article className="budget-document">
      <header className="budget-head"><img src={logoDocumento} alt="LOCAGO — Aluguel de Equipamentos"/><div className="budget-title"><span>ORÇAMENTO</span><strong>{codigo}</strong><small>Emitido em {data(emissao)}</small></div></header>
      <div className="budget-company"><strong>LOCAGO ALUGUEL DE EQUIPAMENTOS</strong><span>{WHATSAPP}</span></div>
      <section className="budget-info-grid"><div className="budget-info-card"><small>CLIENTE</small><strong>{cliente?.nome||"—"}</strong><span>{cliente?.doc||"—"}</span><span>{cliente?.tel||"—"} <i/> {cliente?.email||"—"}</span><span className="subtle">{cliente?.endereco||"Endereço não informado"}</span></div><div className="budget-info-card budget-quote-data"><small>DADOS DO ORÇAMENTO</small><dl><dt>Validade</dt><dd>{data(validade)}</dd><dt>Atendente</dt><dd>{p.autor}</dd><dt>Forma prevista</dt><dd>{p.forma}</dd><dt>Status</dt><dd>{p.status}</dd></dl></div></section>
      <section className="budget-logistics"><h2>ENTREGA / RETIRADA</h2><div><strong>{p.obra?"Entrega no local":"Retirada na loja"}</strong>{p.obra&&<span>{p.obra}</span>}<span>Período previsto: {dataIso(p.inicio)} a {dataIso(p.fim)} <i/> {dias} {dias===1?"diária":"diárias"}</span>{!p.obra&&<small>Retirada e devolução combinadas no balcão da LOCAGO.</small>}</div></section>
      <section className="budget-equipment"><h2>EQUIPAMENTOS</h2><table><thead><tr><th>Equipamento</th><th>Qtd.</th><th>Período</th><th>Qtd. per.</th><th>Unitário</th><th>Total</th></tr></thead><tbody>{itens.map((i,index)=><tr key={index}><td><strong>{i.nome}</strong><small>Locação de equipamento</small></td><td>{i.qtd}</td><td>{i.periodo}</td><td>{i.periodos}</td><td>{brl.format(i.unit)}</td><td><strong>{brl.format(i.total)}</strong></td></tr>)}</tbody></table></section>
      {(servicos.length>0||Boolean(p.frete))&&<section className="budget-services"><h2>SERVIÇOS</h2>{servicos.map(s=><div key={s.nome}><strong>{s.nome}</strong><span>{s.natureza}</span><b>{brl.format(Number(s.valor))}</b></div>)}{Boolean(p.frete)&&<div><strong>Entrega e coleta</strong><span>Serviço de logística</span><b>{brl.format(p.frete||0)}</b></div>}</section>}
      <section className="budget-closing"><div className="budget-terms"><h2>CONDIÇÃO COMERCIAL</h2><strong>Pagamento previsto: {p.forma}</strong><p>Este orçamento não reserva os equipamentos<br/>até a confirmação da locação.</p><span>Validade: 3 dias a partir da emissão.</span><span>Diárias contadas conforme o período contratado.</span></div><div className="budget-summary"><small>RESUMO</small><div><span>Locação</span><strong>{brl.format(locacao)}</strong></div>{serv>0&&<div><span>Serviços</span><strong>{brl.format(serv)}</strong></div>}{Boolean(p.frete)&&<div><span>Logística</span><strong>{brl.format(p.frete||0)}</strong></div>}{p.desconto>0&&<div><span>Desconto</span><strong>− {brl.format(p.desconto)}</strong></div>}<div className="grand"><span>TOTAL</span><strong>{brl.format(total)}</strong></div></div></section>
      <footer><strong>LOCAGO · Aluguel de Equipamentos</strong><span>{WHATSAPP} · Orçamento gerado pelo sistema LOCAGO</span></footer>
    </article>
  </main>
}
function dataIso(valor:string){return valor.split("-").reverse().join("/")}
