create table tarefa_logistica (
  id bigserial primary key,
  contrato_numero varchar(40) not null references contrato_atendimento(numero) on delete cascade,
  cliente_id varchar(40) not null,
  tipo varchar(20) not null,
  data_prevista date not null,
  hora_prevista time not null,
  destino varchar(180) not null,
  endereco text not null,
  status varchar(20) not null default 'PENDENTE',
  concluido_em timestamptz,
  criado_em timestamptz not null default now(),
  constraint ux_tarefa_contrato_tipo unique(contrato_numero,tipo)
);
create index ix_tarefa_agenda on tarefa_logistica(data_prevista,status);
