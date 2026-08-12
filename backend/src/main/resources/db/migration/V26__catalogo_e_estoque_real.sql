-- Marco 6: catálogo e estoque físico informados pelos sócios em 11/08/2026.
-- Itens divergentes do pedido de venda não são importados; valores de aquisição permanecem vazios.

alter table produto_catalogo
  add column publicar_site boolean not null default false,
  add column slug varchar(180),
  add column imagem_url varchar(300),
  add column aplicacao varchar(220),
  add column especificacoes jsonb not null default '{}'::jsonb;
create unique index ux_produto_slug_publico on produto_catalogo(slug) where slug is not null;

create table produto_preco (
  id bigserial primary key,
  produto_id varchar(40) not null references produto_catalogo(id) on delete cascade,
  duracao_dias integer not null check(duracao_dias>0),
  nome varchar(80) not null,
  valor numeric(14,2) not null check(valor>0),
  ativo boolean not null default true,
  criado_em timestamptz not null default now(),
  unique(produto_id,duracao_dias)
);

update categoria_produto set nome='Concreto e argamassa',ativo=true where prefixo='BET';
update categoria_produto set nome='Compactação',ativo=true where prefixo='COM';
update categoria_produto set nome='Perfuração e rompimento',ativo=true where prefixo='MAR';
update categoria_produto set nome='Corte e desbaste',ativo=true where prefixo='COR';
update categoria_produto set nome='Andaimes e altura',ativo=true where prefixo='AND';
insert into categoria_produto(nome,prefixo) values
 ('Demolição','DEM'),('Transporte manual','CAR')
on conflict(nome) do update set ativo=true;

-- Cadastros anteriores permanecem preservados para histórico, mas saem da operação e do site.
update produto_catalogo set ativo=false,publicar_site=false;

insert into produto_catalogo(id,dados,codigo,nome,categoria_id,marca,modelo,descricao,unidade_locacao,
 valor_diaria,valor_semanal,valor_quinzenal,valor_mensal,ativo,publicar_site,slug,imagem_url,aplicacao,especificacoes)
values
('BET001','{}','BET001','Betoneira Menegotti 400 L',(select id from categoria_produto where nome='Concreto e argamassa'),'Menegotti',null,'Betoneira de 400 litros com motor elétrico de 2 CV, 4 polos e kit elétrico.','UNIDADE',150,450,0,1500,true,true,'betoneira-menegotti-400l','/equipamentos/betoneira-menegotti.jpg','Mistura de concreto e argamassa','{"Volume":"400 L","Motor":"2 CV · 4 polos","Alimentação":"Elétrica","Kit":"Kit elétrico"}'),
('COM001','{}','COM001','Compactador de solo',(select id from categoria_produto where nome='Compactação'),null,'Motor Honda GX100','Compactador a gasolina, motor 4 tempos de 3 CV, peso aproximado de 78 kg e força de impacto informada de 13 kN.','UNIDADE',250,500,0,1800,true,true,'compactador-solo-gx100','/equipamentos/compactador-solo.jpg','Compactação de solo em obras e reformas','{"Força de impacto":"13 kN","Peso":"78 kg","Motor":"4 tempos · 3 CV","Combustível":"Gasolina","Motor/modelo":"Honda GX100"}'),
('DEM001','{}','DEM001','Martelete demolidor INGCO 1.500 W',(select id from categoria_produto where nome='Demolição'),'INGCO','PDB15006','Martelete demolidor profissional para concreto, alvenaria, pisos e trabalhos pesados de demolição.','UNIDADE',370,550,0,0,true,true,'martelete-demolidor-ingco-pdb15006','/equipamentos/demolidor-ingco.jpg','Demolição pesada de concreto, alvenaria e pisos','{"Potência":"1.500 W","Impacto":"aprox. 6 J","Peso":"aprox. 10 kg","Tipo":"Martelete demolidor"}'),
('MAR001','{}','MAR001','Martelete rotativo/rompedor INGCO 1.500 W',(select id from categoria_produto where nome='Perfuração e rompimento'),'INGCO','RH150028','Martelete rotativo e rompedor SDS Plus para perfuração e rompimento de concreto e alvenaria.','UNIDADE',199.99,450,0,0,true,true,'martelete-ingco-rh150028','/equipamentos/martelete-ingco.jpg','Perfuração e rompimento de concreto e alvenaria','{"Potência":"1.500 W","Tensão":"220–240 V","Velocidade":"850 rpm","Impactos":"4.400 IPM","Força de impacto":"5,5 J","Encaixe":"SDS Plus","Peso":"aprox. 5 kg"}'),
('FUR001','{}','FUR001','Martelo perfurador/rompedor DeWalt',(select id from categoria_produto where nome='Perfuração e rompimento'),'DeWalt','D25133K','Martelo perfurador e rompedor SDS Plus com empunhadura lateral e maleta.','UNIDADE',150,0,0,0,true,true,'martelo-dewalt-d25133k','/equipamentos/martelo-dewalt.jpg','Perfuração em concreto e alvenaria','{"Potência":"800 W","Encaixe":"SDS Plus","Capacidade":"até 26 mm (1 pol.)","Acompanha":"Maleta e empunhadura lateral"}'),
('SER001','{}','SER001','Serra circular DeWalt 1.400 W',(select id from categoria_produto where nome='Corte e desbaste'),'DeWalt','DWE560','Serra circular elétrica para cortes precisos e rápidos em madeira e materiais compatíveis.','UNIDADE',150,0,0,0,true,true,'serra-circular-dewalt-dwe560','/equipamentos/serra-circular-dewalt.jpg','Cortes em madeira e materiais compatíveis','{"Potência":"1.400 W","Disco":"7 1/4 pol. · 184 mm","Tipo":"Serra circular elétrica"}'),
('ESM001','{}','ESM001','Esmerilhadeira angular DeWalt',(select id from categoria_produto where nome='Corte e desbaste'),'DeWalt','DWE4118','Esmerilhadeira angular profissional para corte, desbaste, lixamento e acabamento.','UNIDADE',150,0,0,0,true,true,'esmerilhadeira-dewalt-dwe4118','/equipamentos/esmerilhadeira-dewalt.jpg','Corte, desbaste, lixamento e acabamento','{"Disco":"4 1/2 pol. · 115 mm","Tipo":"Esmerilhadeira angular","Uso":"Profissional"}'),
('CAR001','{}','CAR001','Carrinho de mão chapa 18',(select id from categoria_produto where nome='Transporte manual'),null,null,'Carrinho de mão em chapa 18 para transporte de materiais na obra.','UNIDADE',0,100,0,0,true,true,'carrinho-mao-chapa-18','/equipamentos/carrinho-mao.jpg','Transporte manual de materiais','{"Material":"Chapa 18"}'),
('AND001','{}','AND001','Andaime 1 × 1 m',(select id from categoria_produto where nome='Andaimes e altura'),null,null,'Conjunto locável de andaime 1 × 1 m. Duas peças correspondem a um metro.','METRO',0,30,0,0,true,false,'andaime-1x1','', 'Trabalho em altura','{"Medida":"1 × 1 m","Composição":"2 peças = 1 metro","Situação":"Indisponível"}')
on conflict(id) do update set nome=excluded.nome,categoria_id=excluded.categoria_id,marca=excluded.marca,modelo=excluded.modelo,
 descricao=excluded.descricao,unidade_locacao=excluded.unidade_locacao,valor_diaria=excluded.valor_diaria,
 valor_semanal=excluded.valor_semanal,valor_quinzenal=excluded.valor_quinzenal,valor_mensal=excluded.valor_mensal,
 ativo=excluded.ativo,publicar_site=excluded.publicar_site,slug=excluded.slug,imagem_url=excluded.imagem_url,
 aplicacao=excluded.aplicacao,especificacoes=excluded.especificacoes;

insert into produto_atendimento(id,nome,capacidade) values
 ('BET001','Betoneira Menegotti 400 L',2),('COM001','Compactador de solo',1),('DEM001','Martelete demolidor INGCO 1.500 W',1),
 ('MAR001','Martelete rotativo/rompedor INGCO 1.500 W',1),('FUR001','Martelo perfurador/rompedor DeWalt',1),
 ('SER001','Serra circular DeWalt 1.400 W',1),('ESM001','Esmerilhadeira angular DeWalt',1),
 ('CAR001','Carrinho de mão chapa 18',1),('AND001','Andaime 1 × 1 m',1)
on conflict(id) do update set nome=excluded.nome,capacidade=excluded.capacidade;

insert into patrimonio_atendimento(codigo,produto_id,serie,estado,localizacao,observacao) values
 ('BET-0001','BET001',null,'DISPONIVEL','Galpão','Série e valor de aquisição a confirmar'),
 ('BET-0002','BET001',null,'DISPONIVEL','Galpão','Série e valor de aquisição a confirmar'),
 ('COM-0001','COM001',null,'DISPONIVEL','Galpão','Fabricante da máquina a confirmar; GX100 identifica o motor'),
 ('DEM-0001','DEM001',null,'DISPONIVEL','Galpão','Modelo PDB15006'),('MAR-0001','MAR001',null,'DISPONIVEL','Galpão','Modelo RH150028'),
 ('FUR-0001','FUR001',null,'DISPONIVEL','Galpão','Modelo D25133K'),('SER-0001','SER001',null,'DISPONIVEL','Galpão','Modelo DWE560'),
 ('ESM-0001','ESM001',null,'DISPONIVEL','Galpão','Modelo DWE4118'),('CAR-0001','CAR001',null,'DISPONIVEL','Galpão','Chapa 18'),
 ('AND-0001','AND001',null,'MANUTENCAO','Galpão','Indisponível; 2 peças correspondem a 1 metro')
on conflict(codigo) do nothing;

insert into produto_preco(produto_id,duracao_dias,nome,valor) values
 ('BET001',1,'Diária',150),('BET001',3,'3 dias',250),('BET001',7,'Semana',450),('BET001',30,'Mês',1500),
 ('COM001',1,'Diária',250),('COM001',7,'Semana',500),('COM001',30,'Mês',1800),
 ('DEM001',1,'Diária',370),('DEM001',7,'Semana',550),('MAR001',1,'Diária',199.99),('MAR001',7,'Semana',450),
 ('FUR001',1,'Diária',150),('SER001',1,'Diária',150),('ESM001',1,'Diária',150),('CAR001',7,'Semana',100),('AND001',7,'Semana por metro',30)
on conflict(produto_id,duracao_dias) do update set nome=excluded.nome,valor=excluded.valor,ativo=true;
