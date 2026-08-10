create table operacao_evento (
  id bigserial primary key,
  tipo varchar(20) not null check (tipo in ('TROCA','OCORRENCIA')),
  contrato_numero varchar(40) not null references contrato_atendimento(numero) on delete cascade,
  categoria varchar(80) not null,
  descricao text not null,
  prioridade varchar(20) not null default 'NORMAL',
  patrimonio_origem varchar(80),
  patrimonio_destino varchar(80),
  status varchar(20) not null default 'ABERTA',
  responsavel varchar(120) not null default 'Rafael M.',
  criado_em timestamptz not null default now(),
  concluido_em timestamptz
);
create index idx_operacao_evento_tipo_status on operacao_evento(tipo,status);
create index idx_operacao_evento_contrato on operacao_evento(contrato_numero);
