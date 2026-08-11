-- Marco 2.0.1: separa os componentes financeiros e fecha a imutabilidade
-- de versões já enviadas, sem destruir snapshots históricos.

alter table orcamento_versao disable trigger tg_proteger_orcamento_versao;

update orcamento_versao v
set valor_servicos = coalesce((
  select sum(s.valor_total)
  from orcamento_servico s
  where s.versao_id = v.id
), 0);

alter table orcamento_versao enable trigger tg_proteger_orcamento_versao;

alter table orcamento_versao
  add constraint ck_orcamento_versao_total_componentes
  check (valor_total = valor_locacao + valor_servicos + frete - desconto) not valid;

alter table orcamento_versao
  validate constraint ck_orcamento_versao_total_componentes;

create or replace function proteger_versao_comercial() returns trigger language plpgsql as $$
declare estado varchar(24);
begin
  if tg_table_name = 'orcamento_versao' then
    if old.status <> 'RASCUNHO' and (
      new.orcamento_id is distinct from old.orcamento_id or
      new.numero_versao is distinct from old.numero_versao or
      new.cliente_snapshot is distinct from old.cliente_snapshot or
      new.obra_snapshot is distinct from old.obra_snapshot or
      new.entrega is distinct from old.entrega or
      new.periodo_inicio is distinct from old.periodo_inicio or
      new.periodo_fim is distinct from old.periodo_fim or
      new.forma_pagamento is distinct from old.forma_pagamento or
      new.validade is distinct from old.validade or
      new.frete is distinct from old.frete or
      new.desconto is distinct from old.desconto or
      new.valor_locacao is distinct from old.valor_locacao or
      new.valor_servicos is distinct from old.valor_servicos or
      new.valor_total is distinct from old.valor_total or
      new.observacao is distinct from old.observacao
    ) then
      raise exception 'Versao comercial enviada e imutavel';
    end if;
    return new;
  end if;

  if tg_op = 'DELETE' then
    select status into estado from orcamento_versao where id = old.versao_id;
  else
    select status into estado from orcamento_versao where id = new.versao_id;
  end if;
  if estado <> 'RASCUNHO' then
    raise exception 'Itens de versao enviada sao imutaveis';
  end if;
  if tg_op = 'DELETE' then return old; end if;
  return new;
end $$;
