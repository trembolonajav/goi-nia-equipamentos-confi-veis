alter table recebimento_atendimento
  add column if not exists conta_id bigint references conta_financeira(id),
  add column if not exists data_pagamento date,
  add column if not exists observacao text,
  add column if not exists criado_por varchar(120) not null default 'Sistema',
  add column if not exists estornado_em timestamptz,
  add column if not exists estornado_por varchar(120);

update recebimento_atendimento
set conta_id = (select id from conta_financeira where ativo order by id limit 1)
where conta_id is null;

update recebimento_atendimento
set data_pagamento = recebido_em::date
where data_pagamento is null;

alter table recebimento_atendimento alter column conta_id set not null;
alter table recebimento_atendimento alter column data_pagamento set not null;

create index if not exists ix_recebimento_cobranca on recebimento_atendimento(cobranca_id, data_pagamento);
