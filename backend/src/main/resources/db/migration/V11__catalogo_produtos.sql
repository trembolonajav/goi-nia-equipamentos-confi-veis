create table produto_catalogo (
  id varchar(40) primary key,
  dados jsonb not null,
  ativo boolean not null default true,
  criado_em timestamptz not null default now(),
  atualizado_em timestamptz not null default now()
);
create unique index ux_produto_catalogo_nome on produto_catalogo (lower(dados->>'nome'));
