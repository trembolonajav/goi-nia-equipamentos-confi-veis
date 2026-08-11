-- Marco 3: colunas estruturadas passam a ser a fonte de verdade.
-- O JSON legado permanece temporariamente para compatibilidade e auditoria do backfill.

alter table cliente_atendimento
  add column tipo_pessoa varchar(2),
  add column nome_razao_social varchar(180),
  add column nome_fantasia varchar(180),
  add column cpf_cnpj varchar(32),
  add column rg_ie varchar(80),
  add column inscricao_municipal varchar(80),
  add column telefone varchar(30),
  add column whatsapp varchar(30),
  add column email varchar(180),
  add column cep varchar(12),
  add column logradouro varchar(180),
  add column numero_endereco varchar(30),
  add column complemento varchar(120),
  add column bairro varchar(120),
  add column cidade varchar(120),
  add column uf varchar(2),
  add column codigo_ibge varchar(12),
  add column quadra varchar(40),
  add column lote varchar(40),
  add column observacao text,
  add column ativo boolean not null default true;

update cliente_atendimento set
  tipo_pessoa = case when lower(coalesce(dados->>'tipo','')) like '%jur%dica%' or upper(coalesce(dados->>'doc','')) like 'CNPJ%' then 'PJ' else 'PF' end,
  nome_razao_social = coalesce(nullif(dados->>'nome',''), id),
  nome_fantasia = nullif(dados->>'nomeFantasia',''),
  cpf_cnpj = upper(regexp_replace(coalesce(dados->>'doc',''), '^(CPF|CNPJ)\s*', '', 'i')),
  rg_ie = coalesce(nullif(dados->>'rgIe',''), nullif(dados->>'inscricao','')),
  inscricao_municipal = nullif(dados->>'inscricaoMunicipal',''),
  telefone = nullif(dados->>'tel',''),
  whatsapp = coalesce(nullif(dados->>'whatsapp',''), nullif(dados->>'tel','')),
  email = nullif(dados->>'email',''),
  cep = nullif(dados->>'cep',''),
  logradouro = nullif(dados->>'logradouro',''),
  numero_endereco = nullif(dados->>'numeroEndereco',''),
  complemento = nullif(dados->>'complemento',''),
  bairro = nullif(dados->>'bairro',''),
  cidade = nullif(dados->>'cidade',''),
  uf = upper(nullif(dados->>'uf','')),
  codigo_ibge = nullif(dados->>'codigoIbge',''),
  quadra = nullif(dados->>'quadra',''),
  lote = nullif(dados->>'lote',''),
  observacao = nullif(dados->>'obs',''),
  ativo = coalesce(dados->>'situacao','Ativo') <> 'Inativo';

alter table cliente_atendimento
  alter column tipo_pessoa set not null,
  alter column nome_razao_social set not null,
  add constraint ck_cliente_tipo_pessoa check (tipo_pessoa in ('PF','PJ')),
  add constraint ck_cliente_uf check (uf is null or uf ~ '^[A-Z]{2}$');

drop index if exists ux_cliente_documento;
create unique index ux_cliente_cpf_cnpj_normalizado
  on cliente_atendimento (upper(regexp_replace(cpf_cnpj, '[^A-Z0-9]', '', 'g')))
  where cpf_cnpj is not null and length(regexp_replace(cpf_cnpj, '[^A-Z0-9]', '', 'g')) > 4;

alter table produto_catalogo
  add column codigo varchar(40),
  add column nome varchar(180),
  add column categoria_id bigint references categoria_produto(id),
  add column marca varchar(120),
  add column modelo varchar(120),
  add column descricao text,
  add column unidade_locacao varchar(30),
  add column valor_diaria numeric(14,2),
  add column valor_semanal numeric(14,2),
  add column valor_quinzenal numeric(14,2),
  add column valor_mensal numeric(14,2);

update produto_catalogo p set
  codigo = p.id,
  nome = coalesce(nullif(p.dados->>'nome',''), p.id),
  categoria_id = (select c.id from categoria_produto c
    where lower(c.nome)=lower(p.dados->>'categoria')
       or c.prefixo=upper(regexp_replace(coalesce(p.dados->>'prefixo',''), '[^A-Z]', '', 'g'))
    order by case when lower(c.nome)=lower(p.dados->>'categoria') then 0 else 1 end
    limit 1),
  marca = nullif(p.dados->>'marca',''),
  modelo = nullif(p.dados->>'modelo',''),
  descricao = nullif(p.dados->>'descricao',''),
  unidade_locacao = coalesce(nullif(p.dados->>'unidadeLocacao',''), 'UNIDADE'),
  valor_diaria = case when coalesce(p.dados->>'diaria','') ~ '^\s*[0-9]+([.,][0-9]+)?\s*$' then replace(p.dados->>'diaria',',','.')::numeric else 0 end,
  valor_semanal = case when coalesce(p.dados->>'semanal','') ~ '^\s*[0-9]+([.,][0-9]+)?\s*$' then replace(p.dados->>'semanal',',','.')::numeric else 0 end,
  valor_quinzenal = case when coalesce(p.dados->>'quinzenal','') ~ '^\s*[0-9]+([.,][0-9]+)?\s*$' then replace(p.dados->>'quinzenal',',','.')::numeric else 0 end,
  valor_mensal = case when coalesce(p.dados->>'mensal','') ~ '^\s*[0-9]+([.,][0-9]+)?\s*$' then replace(p.dados->>'mensal',',','.')::numeric else 0 end;

insert into categoria_produto(nome,prefixo)
select 'Sem categoria', 'GERAL'
where exists(select 1 from produto_catalogo where categoria_id is null)
on conflict do nothing;

update produto_catalogo
set categoria_id=(select id from categoria_produto where prefixo='GERAL')
where categoria_id is null;

alter table produto_catalogo
  alter column codigo set not null,
  alter column nome set not null,
  alter column categoria_id set not null,
  alter column unidade_locacao set not null,
  alter column valor_diaria set not null,
  alter column valor_semanal set not null,
  alter column valor_quinzenal set not null,
  alter column valor_mensal set not null,
  add constraint ux_produto_codigo unique (codigo),
  add constraint ck_produto_precos check (valor_diaria >= 0 and valor_semanal >= 0 and valor_quinzenal >= 0 and valor_mensal >= 0);

drop index if exists ux_produto_catalogo_nome;
create unique index ux_produto_catalogo_nome on produto_catalogo(lower(nome));

alter table patrimonio_atendimento
  add column data_aquisicao date,
  add column valor_aquisicao numeric(14,2),
  add column observacao text,
  add column localizacao varchar(180) not null default 'Galpão';

create index ix_cliente_ativo_nome on cliente_atendimento(ativo, nome_razao_social);
create index ix_produto_ativo_nome on produto_catalogo(ativo, nome);
