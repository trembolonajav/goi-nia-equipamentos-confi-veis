create table documento_contrato (
  id bigserial primary key,
  contrato_numero varchar(40) not null references contrato_atendimento(numero) on delete cascade,
  tipo varchar(80) not null,
  nome_original varchar(255) not null,
  nome_armazenado varchar(255) not null,
  mime_type varchar(100) not null,
  tamanho bigint not null,
  criado_em timestamptz not null default now()
);
create index idx_documento_contrato_numero on documento_contrato(contrato_numero);
