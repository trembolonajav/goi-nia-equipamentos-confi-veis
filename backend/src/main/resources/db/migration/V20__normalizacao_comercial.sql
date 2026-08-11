create table orcamento (
  id bigserial primary key,
  numero varchar(40) not null unique,
  cliente_id varchar(40) not null references cliente_atendimento(id),
  status varchar(24) not null default 'RASCUNHO',
  versao_atual integer not null default 1,
  versao_aprovada_id bigint,
  criado_em timestamptz not null default now(),
  atualizado_em timestamptz not null default now(),
  constraint ck_orcamento_status check (status in ('RASCUNHO','ENVIADO','APROVADO','CANCELADO','EXPIRADO'))
);

create table orcamento_versao (
  id bigserial primary key,
  orcamento_id bigint not null references orcamento(id) on delete cascade,
  numero_versao integer not null,
  status varchar(24) not null default 'RASCUNHO',
  cliente_snapshot jsonb not null,
  obra_snapshot jsonb not null default '{}'::jsonb,
  entrega varchar(30) not null,
  periodo_inicio date not null,
  periodo_fim date not null,
  forma_pagamento varchar(60) not null,
  validade date,
  frete numeric(14,2) not null default 0,
  desconto numeric(14,2) not null default 0,
  valor_locacao numeric(14,2) not null default 0,
  valor_servicos numeric(14,2) not null default 0,
  valor_total numeric(14,2) not null default 0,
  observacao text,
  enviado_em timestamptz,
  aprovado_em timestamptz,
  criado_em timestamptz not null default now(),
  unique(orcamento_id,numero_versao),
  constraint ck_orcamento_versao_status check (status in ('RASCUNHO','ENVIADA','APROVADA','SUBSTITUIDA','CANCELADA')),
  constraint ck_orcamento_versao_periodo check (periodo_fim >= periodo_inicio)
);

alter table orcamento add constraint fk_orcamento_versao_aprovada
  foreign key (versao_aprovada_id) references orcamento_versao(id);

create table orcamento_item (
  id bigserial primary key,
  versao_id bigint not null references orcamento_versao(id) on delete cascade,
  produto_id varchar(40) not null references produto_atendimento(id),
  descricao_snapshot varchar(220) not null,
  categoria_snapshot varchar(160),
  marca_snapshot varchar(120),
  modelo_snapshot varchar(120),
  quantidade integer not null check (quantidade > 0),
  tipo_preco varchar(30) not null,
  valor_unitario numeric(14,2) not null check (valor_unitario >= 0),
  valor_total numeric(14,2) not null check (valor_total >= 0),
  dados_snapshot jsonb not null,
  criado_em timestamptz not null default now(),
  unique(versao_id,produto_id)
);

create table orcamento_servico (
  id bigserial primary key,
  versao_id bigint not null references orcamento_versao(id) on delete cascade,
  servico_id bigint references servico_catalogo(id),
  descricao_snapshot varchar(220) not null,
  natureza_snapshot varchar(60) not null,
  quantidade numeric(14,3) not null default 1 check (quantidade > 0),
  valor_unitario numeric(14,2) not null check (valor_unitario >= 0),
  valor_total numeric(14,2) not null check (valor_total >= 0),
  dados_snapshot jsonb not null default '{}'::jsonb,
  criado_em timestamptz not null default now()
);

alter table pedido_atendimento
  add column orcamento_id bigint references orcamento(id),
  add column orcamento_versao_id bigint references orcamento_versao(id);
create unique index ux_pedido_orcamento_versao on pedido_atendimento(orcamento_versao_id) where orcamento_versao_id is not null;

create table pedido_item (
  id bigserial primary key,
  pedido_numero varchar(40) not null references pedido_atendimento(numero) on delete cascade,
  orcamento_item_id bigint not null references orcamento_item(id),
  produto_id varchar(40) not null references produto_atendimento(id),
  descricao_snapshot varchar(220) not null,
  quantidade integer not null check (quantidade > 0),
  tipo_preco varchar(30) not null,
  valor_unitario numeric(14,2) not null,
  valor_total numeric(14,2) not null,
  dados_snapshot jsonb not null,
  criado_em timestamptz not null default now(),
  unique(pedido_numero,orcamento_item_id)
);

alter table contrato_item add column pedido_item_id bigint references pedido_item(id);
create unique index ux_contrato_item_pedido_item on contrato_item(pedido_item_id) where pedido_item_id is not null;

create or replace function proteger_versao_comercial() returns trigger language plpgsql as $$
declare estado varchar(24);
begin
  if tg_table_name = 'orcamento_versao' then
    if old.status <> 'RASCUNHO' and (
      new.cliente_snapshot is distinct from old.cliente_snapshot or
      new.obra_snapshot is distinct from old.obra_snapshot or
      new.entrega is distinct from old.entrega or new.periodo_inicio is distinct from old.periodo_inicio or
      new.periodo_fim is distinct from old.periodo_fim or new.forma_pagamento is distinct from old.forma_pagamento or
      new.frete is distinct from old.frete or new.desconto is distinct from old.desconto or
      new.valor_locacao is distinct from old.valor_locacao or new.valor_servicos is distinct from old.valor_servicos or
      new.valor_total is distinct from old.valor_total or new.observacao is distinct from old.observacao
    ) then raise exception 'Versao comercial enviada e imutavel'; end if;
    return new;
  end if;
  select status into estado from orcamento_versao where id=coalesce(new.versao_id,old.versao_id);
  if estado <> 'RASCUNHO' then raise exception 'Itens de versao enviada sao imutaveis'; end if;
  if TG_OP='DELETE' then return old; end if;
  return new;
end $$;

create trigger tg_proteger_orcamento_versao before update on orcamento_versao
for each row execute function proteger_versao_comercial();
create trigger tg_proteger_orcamento_item before insert or update or delete on orcamento_item
for each row execute function proteger_versao_comercial();
create trigger tg_proteger_orcamento_servico before insert or update or delete on orcamento_servico
for each row execute function proteger_versao_comercial();

create index ix_orcamento_cliente_status on orcamento(cliente_id,status);
create index ix_orcamento_item_versao on orcamento_item(versao_id);
create index ix_pedido_item_pedido on pedido_item(pedido_numero);
