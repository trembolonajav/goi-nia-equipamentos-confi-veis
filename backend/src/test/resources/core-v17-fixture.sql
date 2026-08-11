begin;

truncate table pagamento_conta, conta_pagar, movimentacao_patrimonio,
  contrato_item_patrimonio, contrato_item, cobranca_item,
  recebimento_atendimento, lancamento_financeiro, cobranca_atendimento,
  documento_contrato, patrimonio_atendimento, contrato_atendimento,
  pedido_atendimento, produto_atendimento, cliente_atendimento,
  conta_financeira restart identity cascade;

insert into cliente_atendimento(id,dados)
values ('CLI-CORE', '{"nome":"Cliente Core","doc":"12345678909"}');

insert into produto_atendimento(id,nome,capacidade) values
  ('BET','Betoneira de teste',3),
  ('MAR','Martelete indisponivel',0);

insert into patrimonio_atendimento(codigo,produto_id,serie,estado) values
  ('BET001','BET','SERIE-001','DISPONIVEL'),
  ('BET002','BET','SERIE-002','DISPONIVEL'),
  ('BET003','BET','SERIE-003','DISPONIVEL');

insert into pedido_atendimento(numero,cliente_id,status,inicio,fim,dados) values
  ('PED-CORE','CLI-CORE','Aprovado',current_date,current_date + 2,
   jsonb_build_object('numero','PED-CORE','clienteId','CLI-CORE','status','Aprovado','inicio',current_date,'fim',current_date + 2)),
  ('PED-ATOMIC','CLI-CORE','Aprovado',current_date,current_date + 2,
   jsonb_build_object('numero','PED-ATOMIC','clienteId','CLI-CORE','status','Aprovado','inicio',current_date,'fim',current_date + 2)),
  ('PED-DOUBLE','CLI-CORE','Aprovado',current_date,current_date + 2,
   jsonb_build_object('numero','PED-DOUBLE','clienteId','CLI-CORE','status','Aprovado','inicio',current_date,'fim',current_date + 2));

insert into contrato_atendimento(numero,pedido_numero,cliente_id,dados) values
  ('CT-CORE','PED-CORE','CLI-CORE',
   jsonb_build_object('numero','CT-CORE','clienteId','CLI-CORE','inicio',current_date,'fim',current_date + 2,'situacao','Aguardando pagamento','itens','[]'::jsonb,'linha','[]'::jsonb)),
  ('CT-ATOMIC','PED-ATOMIC','CLI-CORE',
   jsonb_build_object('numero','CT-ATOMIC','clienteId','CLI-CORE','inicio',current_date,'fim',current_date + 2,'situacao','Aguardando pagamento','itens','[]'::jsonb,'linha','[]'::jsonb)),
  ('CT-DOUBLE','PED-DOUBLE','CLI-CORE',
   jsonb_build_object('numero','CT-DOUBLE','clienteId','CLI-CORE','inicio',current_date,'fim',current_date + 2,'situacao','Aguardando pagamento','itens','[]'::jsonb,'linha','[]'::jsonb));

insert into contrato_item(contrato_numero,produto_id,descricao_snapshot,quantidade,periodo_inicio,periodo_fim,valor_unitario,valor_total,status) values
  ('CT-CORE','BET','Betoneira 1',1,current_date,current_date + 2,100,100,'RESERVADO'),
  ('CT-CORE','BET','Betoneira 2',1,current_date,current_date + 2,100,100,'RESERVADO'),
  ('CT-CORE','BET','Betoneira 3',1,current_date,current_date + 2,100,100,'RESERVADO'),
  ('CT-ATOMIC','BET','Item que poderia sair',1,current_date,current_date + 2,100,100,'RESERVADO'),
  ('CT-ATOMIC','MAR','Item sem patrimonio',1,current_date,current_date + 2,100,100,'RESERVADO'),
  ('CT-DOUBLE','BET','Mesmo patrimonio em outro contrato',1,current_date,current_date + 2,100,100,'RESERVADO');

insert into documento_contrato(contrato_numero,tipo,nome_original,nome_armazenado,mime_type,tamanho)
select numero,tipo,'fixture.pdf','fixture.pdf','application/pdf',1
from (values ('CT-CORE'),('CT-ATOMIC'),('CT-DOUBLE')) c(numero)
cross join (values ('Contrato assinado'),('Comprovante de entrega assinado'),('Comprovante de devolução assinado')) d(tipo);

insert into conta_financeira(nome,tipo,saldo_inicial) values
  ('Banco A','BANCO',0),('Banco B','BANCO',0);

insert into cobranca_atendimento(contrato_numero,cliente_id,descricao,vencimento,valor,recebido,status)
values ('CT-CORE','CLI-CORE','Cobranca Core',current_date,1000,0,'ABERTA');
insert into cobranca_item(cobranca_id,tipo,descricao,quantidade,valor_unitario,valor_total)
select id,'AJUSTE','Valor historico',1,1000,1000 from cobranca_atendimento where contrato_numero='CT-CORE';

commit;
