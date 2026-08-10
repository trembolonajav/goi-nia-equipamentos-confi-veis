create table categoria_produto (
 id bigserial primary key,
 nome varchar(120) not null unique,
 prefixo varchar(5) not null unique check(prefixo ~ '^[A-Z]{2,5}$'),
 ativo boolean not null default true
);
insert into categoria_produto(nome,prefixo) values
 ('Betoneiras','BET'),('Marteletes','MAR'),('Compactação','COM'),('Geradores','GER'),
 ('Cortadoras','COR'),('Lavadoras','LAV'),('Andaimes','AND'),('Vibradores','VIB');
