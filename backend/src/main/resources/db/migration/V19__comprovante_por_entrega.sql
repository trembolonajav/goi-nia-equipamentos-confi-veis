create table entrega_operacao (
  id bigserial primary key,
  contrato_numero varchar(40) not null references contrato_atendimento(numero),
  documento_id bigint not null unique references documento_contrato(id) on delete restrict,
  criado_em timestamptz not null default now(),
  criado_por varchar(120) not null default 'Sistema'
);

alter table movimentacao_patrimonio
  add column entrega_operacao_id bigint references entrega_operacao(id);

create index idx_entrega_operacao_contrato on entrega_operacao(contrato_numero, criado_em);
create index idx_movimentacao_entrega_operacao on movimentacao_patrimonio(entrega_operacao_id)
  where entrega_operacao_id is not null;
