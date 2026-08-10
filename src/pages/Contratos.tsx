import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useStore } from "../data/store";
import { ListaView, type Linha } from "../components/ListaView";
import { FASE_CONTRATO } from "../data/mock";

const FILTROS = ["Todos", "Aguardando saída", "Ativo", "Aguardando devolução", "Atrasado"];

export default function Contratos() {
  const { contratos, getCliente } = useStore();
  const nav = useNavigate();
  const [filtro, setFiltro] = useState("Todos");

  const linhas: Linha[] = contratos
    .filter((c) => filtro === "Todos" || FASE_CONTRATO[c.situacao] === filtro)
    .map((c) => {
      const cl = getCliente(c.clienteId);
      return {
        ref: c.numero, titulo: cl?.nome || "", sub: c.itens.map((i) => i.nome).join(", "), meio: c.local, situacao: c.situacao,
        cor: c.situacao === "Atrasado" ? "var(--red)" : c.situacao === "Aguardando pagamento" ? "var(--yellow)" : c.situacao === "Em inspeção" ? "var(--blue)" : "var(--green)",
        valor: c.locacao + c.servicos, onClick: () => nav(`/app/contratos/${c.numero}`),
      };
    });

  return (
    <ListaView
      titulo="Contratos"
      sub="O contrato é a entidade central da operação. Tudo que acontece durante a locação parte da tela dele: expedir, prorrogar, trocar, devolver, cobrar, encerrar."
      acao="Nova locação" onAcao={() => nav("/app/nova-locacao")}
      cols={["Contrato", "Cliente e equipamentos", "Local", "Situação", "Locação"]}
      filtros={FILTROS.map((f) => ({ nome: f, ativo: filtro === f, onClick: () => setFiltro(f) }))}
      linhas={linhas}
    />
  );
}
