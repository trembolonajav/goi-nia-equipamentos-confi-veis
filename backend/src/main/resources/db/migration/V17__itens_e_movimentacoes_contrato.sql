create table contrato_item (
  id bigserial primary key,
  contrato_numero varchar(40) not null references contrato_atendimento(numero) on delete cascade,
  produto_id varchar(40) not null references produto_atendimento(id),
  descricao_snapshot varchar(220) not null,
  quantidade integer not null check (quantidade > 0),
  periodo_inicio date not null,
  periodo_fim date not null,
  tipo_preco varchar(30) not null default 'DIARIA',
  valor_unitario numeric(14,2) not null default 0,
  desconto numeric(14,2) not null default 0,
  acrescimo numeric(14,2) not null default 0,
  valor_total numeric(14,2) not null default 0,
  status varchar(30) not null default 'RESERVADO',
  dados_snapshot jsonb not null default '{}'::jsonb,
  criado_em timestamptz not null default now(),
  atualizado_em timestamptz not null default now(),
  constraint ck_contrato_item_periodo check (periodo_fim >= periodo_inicio),
  constraint ck_contrato_item_status check (status in ('RESERVADO','A_EXPEDIR','LOCADO','DEVOLVIDO','EM_INSPECAO','EM_MANUTENCAO','FINALIZADO','CANCELADO'))
);
create index ix_contrato_item_contrato_status on contrato_item(contrato_numero,status);

insert into contrato_item(contrato_numero,produto_id,descricao_snapshot,quantidade,periodo_inicio,periodo_fim,valor_unitario,valor_total,status,dados_snapshot)
select c.numero,
       item->>'prod',
       coalesce(nullif(item->>'nome',''),p.nome),
       greatest(coalesce(nullif(item->>'qtd','')::integer,1),1),
       (c.dados->>'inicio')::date,
       (c.dados->>'fim')::date,
       coalesce(nullif(item->>'valor','')::numeric,0) / greatest(coalesce(nullif(item->>'qtd','')::integer,1),1),
       coalesce(nullif(item->>'valor','')::numeric,0),
       case lower(coalesce(item->>'estado',''))
         when 'locado' then 'LOCADO'
         when 'em inspeção' then 'EM_INSPECAO'
         when 'em manutenção' then 'EM_MANUTENCAO'
         when 'encerrado' then 'FINALIZADO'
         else 'RESERVADO'
       end,
       item
from contrato_atendimento c
cross join lateral jsonb_array_elements(coalesce(c.dados->'itens','[]'::jsonb)) item
join produto_atendimento p on p.id=item->>'prod'
where c.dados->>'inicio' is not null and c.dados->>'fim' is not null;

create table contrato_item_patrimonio (
  id bigserial primary key,
  contrato_item_id bigint not null references contrato_item(id) on delete cascade,
  patrimonio_codigo varchar(40) not null references patrimonio_atendimento(codigo),
  reservado_em timestamptz not null default now(),
  expedido_em timestamptz,
  devolvido_em timestamptz,
  liberado_em timestamptz,
  unique(contrato_item_id,patrimonio_codigo)
);
create unique index ux_patrimonio_vinculo_ativo on contrato_item_patrimonio(patrimonio_codigo) where liberado_em is null;

create table movimentacao_patrimonio (
  id bigserial primary key,
  patrimonio_codigo varchar(40) not null references patrimonio_atendimento(codigo),
  contrato_numero varchar(40) references contrato_atendimento(numero),
  contrato_item_id bigint references contrato_item(id),
  tipo varchar(40) not null,
  estado_anterior varchar(30),
  estado_novo varchar(30) not null,
  observacao text,
  criado_em timestamptz not null default now(),
  criado_por varchar(120) not null default 'Sistema'
);
create index ix_movimentacao_patrimonio_data on movimentacao_patrimonio(patrimonio_codigo,criado_em desc);

alter table cobranca_atendimento
  add column if not exists cancelada_em timestamptz,
  add column if not exists cancelada_por varchar(120);

create table cobranca_item (
  id bigserial primary key,
  cobranca_id bigint not null references cobranca_atendimento(id) on delete cascade,
  contrato_item_id bigint references contrato_item(id),
  tipo varchar(30) not null,
  descricao varchar(220) not null,
  quantidade numeric(14,3) not null default 1,
  periodo_inicio date,
  periodo_fim date,
  valor_unitario numeric(14,2) not null,
  valor_total numeric(14,2) not null,
  criado_em timestamptz not null default now()
);

insert into cobranca_item(cobranca_id,tipo,descricao,quantidade,valor_unitario,valor_total)
select id,'AJUSTE',descricao,1,valor,valor
from cobranca_atendimento c
where not exists (select 1 from cobranca_item ci where ci.cobranca_id=c.id);

create table conta_pagar (
  id bigserial primary key,
  fornecedor varchar(180) not null,
  descricao varchar(240) not null,
  categoria varchar(100) not null,
  vencimento date not null,
  valor numeric(14,2) not null check(valor > 0),
  saldo numeric(14,2) not null check(saldo >= 0),
  status varchar(20) not null default 'ABERTA',
  cancelada_em timestamptz,
  cancelada_por varchar(120),
  criado_em timestamptz not null default now(),
  criado_por varchar(120) not null default 'Sistema'
);

create table pagamento_conta (
  id bigserial primary key,
  conta_pagar_id bigint not null references conta_pagar(id),
  lancamento_id bigint not null references lancamento_financeiro(id),
  valor numeric(14,2) not null check(valor > 0),
  pago_em timestamptz not null default now(),
  pago_por varchar(120) not null default 'Sistema'
);
