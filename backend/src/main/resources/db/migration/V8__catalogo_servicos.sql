create table servico_catalogo (
  id bigserial primary key,
  nome varchar(120) not null unique,
  natureza varchar(60) not null,
  valor numeric(12,2) not null check (valor >= 0),
  ativo boolean not null default true,
  criado_em timestamptz not null default now(),
  atualizado_em timestamptz not null default now()
);
insert into servico_catalogo(nome,natureza,valor) values
('Entrega e coleta','Serviço · NFS-e',95),
('Operador por diária','Serviço · NFS-e',280),
('Disco diamantado 350 mm','Mercadoria · NF-e',190),
('Combustível para teste inicial','Mercadoria · NF-e',60);
