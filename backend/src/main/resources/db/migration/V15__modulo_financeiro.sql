create table conta_financeira (
 id bigserial primary key, nome varchar(120) not null, tipo varchar(30) not null default 'CAIXA', saldo_inicial numeric(14,2) not null default 0, ativo boolean not null default true, criado_em timestamptz not null default now()
);
insert into conta_financeira(nome,tipo) values ('Caixa principal','CAIXA');
create table lancamento_financeiro (
 id bigserial primary key, tipo varchar(10) not null check(tipo in ('ENTRADA','SAIDA')), descricao varchar(220) not null, categoria varchar(100) not null, conta_id bigint not null references conta_financeira(id), vencimento date not null, pagamento date, valor numeric(14,2) not null check(valor>0), status varchar(20) not null default 'ABERTO' check(status in ('ABERTO','PAGO','CANCELADO')), forma varchar(40), origem varchar(30) not null default 'MANUAL', referencia varchar(100), observacao text, criado_em timestamptz not null default now(), atualizado_em timestamptz not null default now()
);
create index ix_lancamento_financeiro_vencimento on lancamento_financeiro(status,vencimento);
create unique index ux_lancamento_financeiro_referencia on lancamento_financeiro(origem,referencia) where referencia is not null;
