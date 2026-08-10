alter table manutencao_atendimento add column if not exists tipo varchar(40) not null default 'CORRETIVA';
alter table manutencao_atendimento add column if not exists prioridade varchar(20) not null default 'NORMAL';
alter table manutencao_atendimento add column if not exists fornecedor varchar(160);
alter table manutencao_atendimento add column if not exists previsao date;
alter table manutencao_atendimento add column if not exists custo_estimado numeric(12,2) not null default 0;
