create table pedido_servico (
  id bigserial primary key,
  pedido_numero varchar(40) not null references pedido_atendimento(numero) on delete cascade,
  orcamento_servico_id bigint not null references orcamento_servico(id),
  servico_id bigint references servico_catalogo(id),
  descricao_snapshot varchar(220) not null,
  natureza_snapshot varchar(60) not null,
  quantidade numeric(14,3) not null check (quantidade > 0),
  valor_unitario numeric(14,2) not null check (valor_unitario >= 0),
  valor_total numeric(14,2) not null check (valor_total >= 0),
  dados_snapshot jsonb not null default '{}'::jsonb,
  criado_em timestamptz not null default now(),
  unique (pedido_numero, orcamento_servico_id)
);

create table contrato_servico (
  id bigserial primary key,
  contrato_numero varchar(40) not null references contrato_atendimento(numero) on delete cascade,
  pedido_servico_id bigint not null references pedido_servico(id),
  servico_id bigint references servico_catalogo(id),
  descricao_snapshot varchar(220) not null,
  natureza_snapshot varchar(60) not null,
  quantidade numeric(14,3) not null check (quantidade > 0),
  valor_unitario numeric(14,2) not null check (valor_unitario >= 0),
  valor_total numeric(14,2) not null check (valor_total >= 0),
  dados_snapshot jsonb not null default '{}'::jsonb,
  criado_em timestamptz not null default now(),
  unique (contrato_numero, pedido_servico_id)
);

create index ix_pedido_servico_pedido on pedido_servico(pedido_numero);
create index ix_contrato_servico_contrato on contrato_servico(contrato_numero);
