alter table contrato_item_patrimonio
  add column if not exists entregue_em timestamptz;

-- Antes da V18, expedir e entregar eram uma única operação.
update contrato_item_patrimonio
set entregue_em = expedido_em
where expedido_em is not null and entregue_em is null;

create index if not exists ix_contrato_item_patrimonio_entrega
  on contrato_item_patrimonio(contrato_item_id, entregue_em)
  where liberado_em is null;
