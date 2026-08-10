create table documento_cliente (
 id bigserial primary key, cliente_id varchar(40) not null references cliente_atendimento(id) on delete cascade,
 tipo varchar(60) not null, nome_original varchar(255) not null, nome_armazenado varchar(255) not null unique,
 mime_type varchar(100) not null, tamanho bigint not null check(tamanho>0), criado_em timestamptz not null default now()
);
create index ix_documento_cliente on documento_cliente(cliente_id,criado_em desc);
