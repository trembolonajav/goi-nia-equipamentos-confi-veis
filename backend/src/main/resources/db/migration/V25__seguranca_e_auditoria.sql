create table usuario_sistema (
  id bigserial primary key,
  login varchar(80) not null unique,
  nome varchar(160) not null,
  senha_hash varchar(255) not null,
  papel varchar(20) not null check (papel in ('ADMIN','OPERADOR')),
  ativo boolean not null default true,
  ultimo_login_em timestamptz,
  criado_em timestamptz not null default now(),
  atualizado_em timestamptz not null default now()
);

create table auditoria_evento (
  id bigserial primary key,
  usuario_id bigint references usuario_sistema(id),
  usuario_login varchar(80) not null,
  usuario_nome varchar(160) not null,
  papel varchar(20) not null,
  acao varchar(40) not null,
  recurso varchar(240) not null,
  metodo varchar(10) not null,
  status_http integer not null,
  ip varchar(80),
  detalhes jsonb not null default '{}'::jsonb,
  criado_em timestamptz not null default now()
);
create index ix_auditoria_usuario_data on auditoria_evento(usuario_id,criado_em desc);
create index ix_auditoria_recurso_data on auditoria_evento(recurso,criado_em desc);
