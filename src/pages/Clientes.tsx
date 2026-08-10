import { useNavigate } from "react-router-dom";
import { useStore } from "../data/store";
import { ListaView, type Linha } from "../components/ListaView";

export default function Clientes() {
  const { clientes } = useStore();
  const nav = useNavigate();

  const linhas: Linha[] = clientes.map((c) => ({
    ref: c.id, titulo: c.nome, sub: c.doc + " · " + c.tel, meio: c.condicao, situacao: c.situacao,
    cor: c.situacao === "Bloqueado" ? "var(--red)" : c.situacao === "Em análise" ? "var(--yellow)" : "var(--green)",
    valor: c.tipo === "Pessoa jurídica" ? "PJ" : "PF", onClick: () => nav(`/app/clientes/${c.id}`),
  }));

  return (
    <ListaView
      titulo="Clientes"
      sub="Cadastro é independente do contrato. Cliente com histórico nunca é excluído, apenas bloqueado ou inativado."
      acao="Novo cliente" onAcao={() => nav("/app/clientes/novo")}
      cols={["Código", "Cliente e documento", "Condição", "Situação", "Tipo"]}
      linhas={linhas}
    />
  );
}
