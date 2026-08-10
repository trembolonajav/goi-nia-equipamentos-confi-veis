create table cobranca_atendimento (
 id bigserial primary key, contrato_numero varchar(40) not null unique references contrato_atendimento(numero) on delete cascade,
 cliente_id varchar(40) not null, descricao varchar(220) not null, vencimento date not null,
 valor numeric(14,2) not null check(valor>=0), recebido numeric(14,2) not null default 0 check(recebido>=0), status varchar(20) not null default 'ABERTA', criado_em timestamptz not null default now()
);
create table recebimento_atendimento (
 id bigserial primary key, cobranca_id bigint not null references cobranca_atendimento(id) on delete cascade,
 valor numeric(14,2) not null check(valor>0), forma varchar(40) not null, recebido_em timestamptz not null default now()
);
create table caucao_atendimento (
 id bigserial primary key, contrato_numero varchar(40) not null unique references contrato_atendimento(numero) on delete cascade,
 cliente_id varchar(40) not null, valor numeric(14,2) not null check(valor>=0), status varchar(30) not null default 'PENDENTE', atualizado_em timestamptz not null default now()
);
