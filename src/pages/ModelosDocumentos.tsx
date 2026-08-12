import { useNavigate } from "react-router-dom";
import { PageHeader } from "../components/ui";

const modelos=[
  {titulo:"Orçamento",fase:"Atendimento",descricao:"Proposta comercial com cliente, período, equipamentos, serviços e valores.",rota:"/app/modelos/orcamento"},
  {titulo:"Contrato de locação",fase:"Contrato",descricao:"Condições da locação, itens, destino, prazo, valores e assinaturas.",rota:"/app/modelos/contrato"},
  {titulo:"Comprovante de entrega",fase:"Expedição",descricao:"Relação dos patrimônios entregues e conferência assinada pelo responsável.",rota:"/app/modelos/entrega"},
  {titulo:"Comprovante de devolução",fase:"Devolução",descricao:"Registro dos patrimônios devolvidos antes da inspeção técnica.",rota:"/app/modelos/devolucao"},
];
export default function ModelosDocumentos(){const nav=useNavigate();return <main className="page" style={{maxWidth:1100}}><PageHeader title="Modelos de documentos" sub="Templates oficiais usados no ciclo da locação. A visualização abaixo não representa uma operação ativa."/><div className="document-model-grid">{modelos.map((m,i)=><article className="card document-model-card" key={m.titulo}><div className="document-model-icon">{String(i+1).padStart(2,"0")}</div><div><div className="uplabel">{m.fase}</div><h2 className="h2">{m.titulo}</h2><p className="muted">{m.descricao}</p></div><button className="btn btn-ghost" onClick={()=>nav(m.rota)}>Visualizar modelo</button></article>)}</div></main>}
