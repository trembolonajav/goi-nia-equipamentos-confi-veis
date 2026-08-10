import { PageHeader } from "../components/ui";

export default function EmBreve({ titulo }: { titulo: string }) {
  return (
    <main className="page">
      <PageHeader title={titulo} />
      <div className="card" style={{ marginTop: 24, maxWidth: 720 }}>
        <div className="tag tag-yellow" style={{ marginBottom: 12 }}>Roadmap</div>
        <h2 className="h2" style={{ marginBottom: 8 }}>Módulo previsto, ainda não desenhado</h2>
        <p className="muted" style={{ margin: 0 }}>
          O protótipo prioriza o ciclo completo de uma locação: orçamento, pedido, contrato,
          expedição, devolução e faturamento. Este módulo entra numa próxima fase, junto com
          composições (kits), regras de faturamento e configurações de tabela.
        </p>
      </div>
    </main>
  );
}
