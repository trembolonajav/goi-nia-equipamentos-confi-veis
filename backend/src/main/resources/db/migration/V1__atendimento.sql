create table cliente_atendimento (
  id varchar(40) primary key,
  dados jsonb not null,
  criado_em timestamptz not null default now(),
  atualizado_em timestamptz not null default now()
);
create unique index ux_cliente_documento on cliente_atendimento ((regexp_replace(coalesce(dados->>'doc',''), '\\D', '', 'g'))) where length(regexp_replace(coalesce(dados->>'doc',''), '\\D', '', 'g')) > 4;

create table pedido_atendimento (
  numero varchar(40) primary key,
  cliente_id varchar(40) not null,
  status varchar(60) not null,
  inicio date not null,
  fim date not null,
  dados jsonb not null,
  criado_em timestamptz not null default now(),
  atualizado_em timestamptz not null default now(),
  constraint ck_periodo_pedido check (fim >= inicio)
);
create index ix_pedido_cliente on pedido_atendimento (cliente_id);
create index ix_pedido_status on pedido_atendimento (status);

create or replace function preencher_campos_pedido() returns trigger language plpgsql as $$
begin
  new.cliente_id := new.dados->>'clienteId'; new.status := new.dados->>'status';
  new.inicio := (new.dados->>'inicio')::date; new.fim := (new.dados->>'fim')::date;
  return new;
end $$;
create trigger tg_pedido_campos before insert or update of dados on pedido_atendimento for each row execute function preencher_campos_pedido();
