create table produto_atendimento (
  id varchar(40) primary key,
  nome varchar(160) not null,
  capacidade integer not null check (capacidade >= 0)
);

insert into produto_atendimento (id, nome, capacidade) values
  ('BET400', 'Betoneira 400 litros', 4),
  ('MART', 'Martelete rompedor', 3),
  ('PLACA', 'Placa vibratória', 2),
  ('GER5', 'Gerador 5 kVA', 2),
  ('CORT', 'Cortadora de piso', 1),
  ('LAV', 'Lavadora de alta pressão', 2),
  ('ANDA', 'Andaime tubular (torre)', 12);

create table contrato_atendimento (
  numero varchar(40) primary key,
  pedido_numero varchar(40) not null unique references pedido_atendimento(numero),
  cliente_id varchar(40) not null,
  dados jsonb not null,
  criado_em timestamptz not null default now(),
  atualizado_em timestamptz not null default now()
);

create table reserva_atendimento (
  id bigserial primary key,
  contrato_numero varchar(40) not null references contrato_atendimento(numero) on delete cascade,
  produto_id varchar(40) not null references produto_atendimento(id),
  quantidade integer not null check (quantidade > 0),
  inicio date not null,
  fim date not null,
  status varchar(20) not null default 'ATIVA',
  constraint ck_reserva_periodo check (fim >= inicio),
  constraint ux_reserva_contrato_produto unique (contrato_numero, produto_id)
);
create index ix_reserva_disponibilidade on reserva_atendimento (produto_id, inicio, fim) where status = 'ATIVA';
