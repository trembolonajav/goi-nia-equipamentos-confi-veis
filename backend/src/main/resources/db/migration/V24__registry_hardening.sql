-- Marco 3.0.1: identificadores pertencem ao banco e localizações não são presumidas.

create sequence if not exists cliente_atendimento_codigo_seq;

select setval(
  'cliente_atendimento_codigo_seq',
  coalesce((
    select max((regexp_match(id, '^CL-([0-9]+)$'))[1]::bigint)
    from cliente_atendimento
    where id ~ '^CL-[0-9]+$'
  ), 0) + 1,
  false
);

alter table patrimonio_atendimento
  alter column localizacao drop not null,
  alter column localizacao drop default;
