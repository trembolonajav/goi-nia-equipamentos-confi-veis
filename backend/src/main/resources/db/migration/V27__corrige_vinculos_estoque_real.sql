-- Os códigos abaixo já existiam no seed de protótipo. Eles agora representam o estoque físico confirmado.
update patrimonio_atendimento set produto_id='BET001',serie=null,estado='DISPONIVEL',contrato_numero=null,
  localizacao='Galpão',observacao='Série e valor de aquisição a confirmar' where codigo in ('BET-0001','BET-0002');
update patrimonio_atendimento set produto_id='MAR001',serie=null,estado='DISPONIVEL',contrato_numero=null,
  localizacao='Galpão',observacao='Modelo RH150028' where codigo='MAR-0001';

update produto_catalogo set nome='Carrinho de mão chapa 18',descricao='Carrinho de mão em chapa 18 para transporte de materiais na obra.',
  aplicacao='Transporte manual de materiais',especificacoes='{"Material":"Chapa 18"}'::jsonb where id='CAR001';
update produto_catalogo set nome='Compactador de solo',descricao='Compactador a gasolina, motor 4 tempos de 3 CV, peso aproximado de 78 kg e força de impacto informada de 13 kN.',
  aplicacao='Compactação de solo em obras e reformas',especificacoes='{"Força de impacto":"13 kN","Peso":"78 kg","Motor":"4 tempos · 3 CV","Combustível":"Gasolina","Motor/modelo":"Honda GX100"}'::jsonb where id='COM001';
update produto_catalogo set descricao='Betoneira de 400 litros com motor elétrico de 2 CV, 4 polos e kit elétrico.',
  especificacoes='{"Volume":"400 L","Motor":"2 CV · 4 polos","Alimentação":"Elétrica","Kit":"Kit elétrico"}'::jsonb where id='BET001';
update produto_catalogo set descricao='Martelete rotativo e rompedor SDS Plus para perfuração e rompimento de concreto e alvenaria.',
  aplicacao='Perfuração e rompimento de concreto e alvenaria',especificacoes='{"Potência":"1.500 W","Tensão":"220–240 V","Velocidade":"850 rpm","Impactos":"4.400 IPM","Força de impacto":"5,5 J","Encaixe":"SDS Plus","Peso":"aprox. 5 kg"}'::jsonb where id='MAR001';
update produto_catalogo set descricao='Martelete demolidor profissional para concreto, alvenaria, pisos e trabalhos pesados de demolição.',
  aplicacao='Demolição pesada de concreto, alvenaria e pisos',especificacoes='{"Potência":"1.500 W","Impacto":"aprox. 6 J","Peso":"aprox. 10 kg","Tipo":"Martelete demolidor"}'::jsonb where id='DEM001';
update produto_preco set nome='Diária' where duracao_dias=1 and produto_id in ('BET001','COM001','DEM001','MAR001','FUR001','SER001','ESM001');
update produto_preco set nome='Mês' where duracao_dias=30 and produto_id in ('BET001','COM001');
