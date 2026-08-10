create table patrimonio_atendimento (
  codigo varchar(40) primary key,
  produto_id varchar(40) not null references produto_atendimento(id),
  serie varchar(100),
  estado varchar(30) not null default 'DISPONIVEL',
  contrato_numero varchar(40) references contrato_atendimento(numero),
  atualizado_em timestamptz not null default now()
);
create index ix_patrimonio_disponivel on patrimonio_atendimento(produto_id, estado);

insert into patrimonio_atendimento(codigo,produto_id,serie) values
 ('BET-0001','BET400','SN 44182'),('BET-0002','BET400','SN 44190'),('BET-0003','BET400','SN 44201'),('BET-0004','BET400','SN 44233'),
 ('MAR-0001','MART','SN 78210'),('MAR-0002','MART','SN 78244'),('MAR-0003','MART','SN 78261'),
 ('PLA-0001','PLACA','SN 21044'),('PLA-0002','PLACA','SN 21077'),
 ('GER-0001','GER5','SN 90112'),('GER-0002','GER5','SN 90140'),
 ('COR-0001','CORT','SN 55021'),
 ('LAV-0001','LAV','SN 33810'),('LAV-0002','LAV','SN 33844');
