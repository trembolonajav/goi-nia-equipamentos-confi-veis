create table inspecao_atendimento (
  id bigserial primary key,
  contrato_numero varchar(40) not null references contrato_atendimento(numero),
  resultado varchar(30) not null,
  observacao text,
  criado_em timestamptz not null default now()
);

create table manutencao_atendimento (
  id bigserial primary key,
  patrimonio_codigo varchar(40) not null references patrimonio_atendimento(codigo),
  contrato_numero varchar(40) references contrato_atendimento(numero),
  motivo text not null,
  status varchar(30) not null default 'ABERTA',
  criado_em timestamptz not null default now(),
  concluido_em timestamptz
);
create index ix_manutencao_aberta on manutencao_atendimento(status, patrimonio_codigo);
