package br.com.locago.atendimento;

import com.fasterxml.jackson.core.JsonProcessingException;
import com.fasterxml.jackson.databind.ObjectMapper;
import org.springframework.http.HttpStatus;
import org.springframework.jdbc.core.simple.JdbcClient;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.server.ResponseStatusException;

import java.math.BigDecimal;
import java.math.RoundingMode;
import java.time.LocalDate;
import java.time.temporal.ChronoUnit;
import java.util.*;

@Service
public class ComercialService {
  private final JdbcClient jdbc;
  private final ObjectMapper json;

  public ComercialService(JdbcClient jdbc, ObjectMapper json) { this.jdbc=jdbc; this.json=json; }

  @Transactional
  public Map<String,Object> criar(Map<String,Object> body) {
    String clienteId=texto(body,"clienteId");
    LocalDate inicio=data(body,"inicio"), fim=data(body,"fim");
    if(fim.isBefore(inicio)) throw erro(HttpStatus.BAD_REQUEST,"O término não pode ser anterior ao início");
    Map<String,Object> cliente=jdbc.sql("select dados::text from cliente_atendimento where id=:id")
      .param("id",clienteId).query(String.class).optional().map(this::ler)
      .orElseThrow(()->erro(HttpStatus.BAD_REQUEST,"Cliente não encontrado"));
    String numero="ORC-"+UUID.randomUUID().toString().substring(0,8).toUpperCase(Locale.ROOT);
    Long orcamentoId=jdbc.sql("insert into orcamento(numero,cliente_id) values(:n,:c) returning id")
      .param("n",numero).param("c",clienteId).query(Long.class).single();
    Long versaoId=criarVersao(orcamentoId,1,cliente,body,inicio,fim);
    enviarInterno(orcamentoId,versaoId);
    return buscarComoPedido(numero);
  }

  @Transactional
  public Map<String,Object> novaVersao(String numero,Map<String,Object> body) {
    Map<String,Object> orcamento=orcamento(numero,true);
    if("APROVADO".equals(orcamento.get("status"))) throw erro(HttpStatus.CONFLICT,"Orçamento aprovado não pode ser alterado");
    long id=longNumero(orcamento.get("id")); int versao=numero(orcamento.get("versao_atual"))+1;
    Map<String,Object> cliente=jdbc.sql("select dados::text from cliente_atendimento where id=:id")
      .param("id",orcamento.get("cliente_id")).query(String.class).optional().map(this::ler).orElseThrow();
    LocalDate inicio=data(body,"inicio"),fim=data(body,"fim");
    if(fim.isBefore(inicio)) throw erro(HttpStatus.BAD_REQUEST,"O término não pode ser anterior ao início");
    Long versaoId=criarVersao(id,versao,cliente,body,inicio,fim);
    jdbc.sql("update orcamento_versao set status='SUBSTITUIDA' where orcamento_id=:id and id<>:v and status='ENVIADA'")
      .param("id",id).param("v",versaoId).update();
    jdbc.sql("update orcamento set versao_atual=:v,status='RASCUNHO',atualizado_em=now() where id=:id")
      .param("v",versao).param("id",id).update();
    enviarInterno(id,versaoId);
    return buscarComoPedido(numero);
  }

  @Transactional
  public Map<String,Object> enviar(String numero,long versaoId) {
    Map<String,Object> o=orcamento(numero,true);
    Integer pertence=jdbc.sql("select count(*) from orcamento_versao where id=:v and orcamento_id=:o")
      .param("v",versaoId).param("o",o.get("id")).query(Integer.class).single();
    if(pertence==0) throw erro(HttpStatus.NOT_FOUND,"Versão não pertence ao orçamento");
    enviarInterno(longNumero(o.get("id")),versaoId);
    return buscarComoPedido(numero);
  }

  public List<Map<String,Object>> listarComoPedidos() {
    List<Map<String,Object>> resultado=new ArrayList<>();
    resultado.addAll(jdbc.sql("select dados::text from pedido_atendimento where orcamento_versao_id is null order by criado_em desc")
      .query(String.class).list().stream().map(this::ler).toList());
    for(String numero:jdbc.sql("select numero from orcamento order by criado_em desc").query(String.class).list()) resultado.add(buscarComoPedido(numero));
    return resultado;
  }

  public Map<String,Object> buscarComoPedido(String numero) {
    Map<String,Object> o=orcamento(numero,false);
    Map<String,Object> v=jdbc.sql("select * from orcamento_versao where orcamento_id=:o order by numero_versao desc limit 1")
      .param("o",o.get("id")).query().singleRow();
    List<Map<String,Object>> itens=jdbc.sql("select id,produto_id,descricao_snapshot,quantidade,tipo_preco,valor_unitario,valor_total,dados_snapshot::text from orcamento_item where versao_id=:v order by id")
      .param("v",v.get("id")).query().listOfRows();
    List<Map<String,Object>> servicos=jdbc.sql("select id,servico_id,descricao_snapshot,natureza_snapshot,quantidade,valor_unitario,valor_total from orcamento_servico where versao_id=:v order by id")
      .param("v",v.get("id")).query().listOfRows();
    LinkedHashMap<String,Object> p=new LinkedHashMap<>();
    p.put("num",o.get("numero")); p.put("orcamentoId",o.get("id")); p.put("versaoId",v.get("id"));
    p.put("clienteId",o.get("cliente_id")); p.put("obra",obraNome(v.get("obra_snapshot"))); p.put("entrega",v.get("entrega"));
    p.put("inicio",String.valueOf(v.get("periodo_inicio"))); p.put("fim",String.valueOf(v.get("periodo_fim")));
    p.put("status",statusTela(String.valueOf(o.get("status")))); p.put("criado","agora"); p.put("autor","Sistema");
    p.put("forma",v.get("forma_pagamento")); p.put("frete",v.get("frete")); p.put("desconto",v.get("desconto"));
    p.put("itens",itens.stream().map(i->{LinkedHashMap<String,Object> x=new LinkedHashMap<>();x.put("id",i.get("id"));x.put("prod",i.get("produto_id"));x.put("qtd",i.get("quantidade"));x.put("nome",i.get("descricao_snapshot"));x.put("tipoPreco",i.get("tipo_preco"));x.put("valorUnitario",i.get("valor_unitario"));x.put("valor",i.get("valor_total"));return x;}).toList());
    p.put("servicos",servicos.stream().map(s->s.get("descricao_snapshot")).toList());
    p.put("servicosDetalhes",servicos.stream().map(s->Map.of("id",s.get("servico_id"),"nome",s.get("descricao_snapshot"),"natureza",s.get("natureza_snapshot"),"valor",s.get("valor_total"))).toList());
    List<Map<String,Object>> versoes=jdbc.sql("select id,numero_versao,valor_total,status,criado_em from orcamento_versao where orcamento_id=:o order by numero_versao")
      .param("o",o.get("id")).query().listOfRows();
    p.put("versoes",versoes.stream().map(x->Map.of("id",x.get("id"),"v",x.get("numero_versao"),"valor",x.get("valor_total"),"quando",String.valueOf(x.get("criado_em")),"nota","Snapshot comercial persistido","ativa",Objects.equals(x.get("id"),v.get("id")))).toList());
    String contrato=jdbc.sql("select ca.numero from contrato_atendimento ca join pedido_atendimento pa on pa.numero=ca.pedido_numero where pa.orcamento_id=:o")
      .param("o",o.get("id")).query(String.class).optional().orElse(null);
    if(contrato!=null)p.put("contrato",contrato);
    p.put("linha",List.of(Map.of("q","agora","t","Orçamento v"+v.get("numero_versao"),"d","Versão persistida e imutável","a","Sistema")));
    return p;
  }

  @Transactional
  public Map<String,Object> aprovar(String numero,long versaoId) {
    Map<String,Object> o=orcamento(numero,true); long orcamentoId=longNumero(o.get("id"));
    Map<String,Object> v=primeiraLinha(jdbc.sql("select * from orcamento_versao where id=:v and orcamento_id=:o for update")
      .param("v",versaoId).param("o",orcamentoId).query().listOfRows(),"Versão não encontrada");
    String existente=jdbc.sql("select ca.dados::text from pedido_atendimento pa join contrato_atendimento ca on ca.pedido_numero=pa.numero where pa.orcamento_versao_id=:v")
      .param("v",versaoId).query(String.class).optional().orElse(null);
    if(existente!=null)return ler(existente);
    if(!"ENVIADA".equals(String.valueOf(v.get("status")))) throw erro(HttpStatus.CONFLICT,"Somente uma versão enviada pode ser aprovada");
    List<Map<String,Object>> itens=jdbc.sql("select * from orcamento_item where versao_id=:v order by id")
      .param("v",versaoId).query().listOfRows();
    if(itens.isEmpty())throw erro(HttpStatus.BAD_REQUEST,"Orçamento sem itens");
    LocalDate inicio=localDate(v.get("periodo_inicio")),fim=localDate(v.get("periodo_fim"));
    for(Map<String,Object> item:itens)validarDisponibilidade(String.valueOf(item.get("produto_id")),numero(item.get("quantidade")),inicio,fim);
    String pedido="PED-"+UUID.randomUUID().toString().substring(0,8).toUpperCase(Locale.ROOT);
    String contrato="CT-"+LocalDate.now().getYear()+"-"+UUID.randomUUID().toString().substring(0,7).toUpperCase(Locale.ROOT);
    Map<String,Object> pedidoJson=pedidoSnapshot(pedido,o,v,itens);
    jdbc.sql("insert into pedido_atendimento(numero,cliente_id,status,inicio,fim,dados,orcamento_id,orcamento_versao_id) values(:n,:c,'Aprovado',:i,:f,cast(:d as jsonb),:o,:v)")
      .param("n",pedido).param("c",o.get("cliente_id")).param("i",inicio).param("f",fim).param("d",escrever(pedidoJson)).param("o",orcamentoId).param("v",versaoId).update();
    Map<String,Object> contratoJson=contratoSnapshot(contrato,pedido,o,v,itens);
    jdbc.sql("insert into contrato_atendimento(numero,pedido_numero,cliente_id,dados) values(:n,:p,:c,cast(:d as jsonb))")
      .param("n",contrato).param("p",pedido).param("c",o.get("cliente_id")).param("d",escrever(contratoJson)).update();
    for(Map<String,Object> item:itens){
      long pedidoItem=jdbc.sql("insert into pedido_item(pedido_numero,orcamento_item_id,produto_id,descricao_snapshot,quantidade,tipo_preco,valor_unitario,valor_total,dados_snapshot) values(:p,:oi,:prod,:d,:q,:tp,:u,:t,cast(:s as jsonb)) returning id")
        .param("p",pedido).param("oi",item.get("id")).param("prod",item.get("produto_id")).param("d",item.get("descricao_snapshot")).param("q",item.get("quantidade")).param("tp",item.get("tipo_preco")).param("u",item.get("valor_unitario")).param("t",item.get("valor_total")).param("s",escrever(item)).query(Long.class).single();
      jdbc.sql("insert into reserva_atendimento(contrato_numero,produto_id,quantidade,inicio,fim) values(:c,:p,:q,:i,:f)")
        .param("c",contrato).param("p",item.get("produto_id")).param("q",item.get("quantidade")).param("i",inicio).param("f",fim).update();
      jdbc.sql("insert into contrato_item(contrato_numero,pedido_item_id,produto_id,descricao_snapshot,quantidade,periodo_inicio,periodo_fim,tipo_preco,valor_unitario,valor_total,status,dados_snapshot) values(:c,:pi,:p,:d,:q,:i,:f,:tp,:u,:t,'RESERVADO',cast(:s as jsonb))")
        .param("c",contrato).param("pi",pedidoItem).param("p",item.get("produto_id")).param("d",item.get("descricao_snapshot")).param("q",item.get("quantidade")).param("i",inicio).param("f",fim).param("tp",item.get("tipo_preco")).param("u",item.get("valor_unitario")).param("t",item.get("valor_total")).param("s",escrever(item)).update();
    }
    for(Map<String,Object> servico:jdbc.sql("select * from orcamento_servico where versao_id=:v order by id").param("v",versaoId).query().listOfRows()){
      long pedidoServico=jdbc.sql("insert into pedido_servico(pedido_numero,orcamento_servico_id,servico_id,descricao_snapshot,natureza_snapshot,quantidade,valor_unitario,valor_total,dados_snapshot) values(:p,:os,:s,:d,:n,:q,:u,:t,cast(:snap as jsonb)) returning id")
        .param("p",pedido).param("os",servico.get("id")).param("s",servico.get("servico_id")).param("d",servico.get("descricao_snapshot")).param("n",servico.get("natureza_snapshot")).param("q",servico.get("quantidade")).param("u",servico.get("valor_unitario")).param("t",servico.get("valor_total")).param("snap",escrever(servico)).query(Long.class).single();
      jdbc.sql("insert into contrato_servico(contrato_numero,pedido_servico_id,servico_id,descricao_snapshot,natureza_snapshot,quantidade,valor_unitario,valor_total,dados_snapshot) values(:c,:ps,:s,:d,:n,:q,:u,:t,cast(:snap as jsonb))")
        .param("c",contrato).param("ps",pedidoServico).param("s",servico.get("servico_id")).param("d",servico.get("descricao_snapshot")).param("n",servico.get("natureza_snapshot")).param("q",servico.get("quantidade")).param("u",servico.get("valor_unitario")).param("t",servico.get("valor_total")).param("snap",escrever(servico)).update();
    }
    criarCobranca(contrato,String.valueOf(o.get("cliente_id")),inicio,versaoId);
    jdbc.sql("update orcamento_versao set status='APROVADA',aprovado_em=now() where id=:v").param("v",versaoId).update();
    jdbc.sql("update orcamento_versao set status='SUBSTITUIDA' where orcamento_id=:o and id<>:v and status in ('RASCUNHO','ENVIADA')").param("o",orcamentoId).param("v",versaoId).update();
    jdbc.sql("update orcamento set status='APROVADO',versao_aprovada_id=:v,atualizado_em=now() where id=:o").param("v",versaoId).param("o",orcamentoId).update();
    return contratoJson;
  }

  private Long criarVersao(long orcamentoId,int numeroVersao,Map<String,Object> cliente,Map<String,Object> body,LocalDate inicio,LocalDate fim){
    List<Map<String,Object>> itensSolicitados=lista(body.get("itens"));
    if(itensSolicitados.isEmpty()) throw erro(HttpStatus.BAD_REQUEST,"O orçamento precisa ter ao menos um equipamento");
    Map<String,Object> obra=obraSnapshot(cliente,String.valueOf(body.getOrDefault("obra","")));
    Long id=jdbc.sql("insert into orcamento_versao(orcamento_id,numero_versao,cliente_snapshot,obra_snapshot,entrega,periodo_inicio,periodo_fim,forma_pagamento,validade,frete,desconto,observacao) values(:o,:n,cast(:c as jsonb),cast(:ob as jsonb),:e,:i,:f,:fp,:val,:fr,:d,:obs) returning id")
      .param("o",orcamentoId).param("n",numeroVersao).param("c",escrever(cliente)).param("ob",escrever(obra)).param("e",String.valueOf(body.getOrDefault("entrega","loja"))).param("i",inicio).param("f",fim).param("fp",String.valueOf(body.getOrDefault("forma","Pix"))).param("val",LocalDate.now().plusDays(3)).param("fr",decimal(body.getOrDefault("frete",0))).param("d",decimal(body.getOrDefault("desconto",0))).param("obs",String.valueOf(body.getOrDefault("observacao",""))).query(Long.class).single();
    int dias=Math.max(1,(int)ChronoUnit.DAYS.between(inicio,fim)); BigDecimal locacao=BigDecimal.ZERO;
    for(Map<String,Object> req:itensSolicitados){
      String produto=texto(req,"produtoId"); int qtd=Math.max(1,numero(req.getOrDefault("quantidade",1)));
      Map<String,Object> dados=jdbc.sql("select dados::text from produto_catalogo where id=:id and ativo for update").param("id",produto).query(String.class).optional().map(this::ler).orElseThrow(()->erro(HttpStatus.BAD_REQUEST,"Produto não encontrado: "+produto));
      Preco preco=melhorPreco(dados,dias); BigDecimal total=preco.valor.multiply(BigDecimal.valueOf(qtd));locacao=locacao.add(total);
      jdbc.sql("insert into orcamento_item(versao_id,produto_id,descricao_snapshot,categoria_snapshot,marca_snapshot,modelo_snapshot,quantidade,tipo_preco,valor_unitario,valor_total,dados_snapshot) values(:v,:p,:n,:c,:ma,:mo,:q,:tp,:u,:t,cast(:s as jsonb))")
        .param("v",id).param("p",produto).param("n",dados.get("nome")).param("c",dados.get("categoria")).param("ma",dados.get("marca")).param("mo",dados.get("modelo")).param("q",qtd).param("tp",preco.tipo).param("u",preco.valor).param("t",total).param("s",escrever(dados)).update();
    }
    BigDecimal servicos=BigDecimal.ZERO;
    for(Map<String,Object> req:lista(body.get("servicos"))){
      Long sid=longNumero(req.get("id")); BigDecimal qtd=decimal(req.getOrDefault("quantidade",1));
      Map<String,Object> s=primeiraLinha(jdbc.sql("select id,nome,natureza,valor from servico_catalogo where id=:id and ativo").param("id",sid).query().listOfRows(),"Serviço não encontrado");
      BigDecimal total=decimal(s.get("valor")).multiply(qtd);servicos=servicos.add(total);
      jdbc.sql("insert into orcamento_servico(versao_id,servico_id,descricao_snapshot,natureza_snapshot,quantidade,valor_unitario,valor_total,dados_snapshot) values(:v,:s,:d,:n,:q,:u,:t,cast(:snap as jsonb))")
        .param("v",id).param("s",sid).param("d",s.get("nome")).param("n",s.get("natureza")).param("q",qtd).param("u",s.get("valor")).param("t",total).param("snap",escrever(s)).update();
    }
    BigDecimal frete=decimal(body.getOrDefault("frete",0)),desconto=decimal(body.getOrDefault("desconto",0));
    BigDecimal total=locacao.add(servicos).add(frete).subtract(desconto);
    if(total.signum()<0)throw erro(HttpStatus.BAD_REQUEST,"Desconto maior que o orçamento");
    jdbc.sql("update orcamento_versao set valor_locacao=:l,valor_servicos=:s,valor_total=:t where id=:id").param("l",locacao).param("s",servicos.add(frete)).param("t",total).param("id",id).update();
    return id;
  }

  private void enviarInterno(long orcamentoId,long versaoId){
    jdbc.sql("update orcamento_versao set status='ENVIADA',enviado_em=coalesce(enviado_em,now()) where id=:v and status='RASCUNHO'").param("v",versaoId).update();
    jdbc.sql("update orcamento set status='ENVIADO',atualizado_em=now() where id=:o and status<>'APROVADO'").param("o",orcamentoId).update();
  }

  private void criarCobranca(String contrato,String cliente,LocalDate vencimento,long versaoId){
    BigDecimal total=jdbc.sql("select valor_total from orcamento_versao where id=:v").param("v",versaoId).query(BigDecimal.class).single();
    long cobranca=jdbc.sql("insert into cobranca_atendimento(contrato_numero,cliente_id,descricao,vencimento,valor) values(:c,:cli,:d,:v,:t) returning id")
      .param("c",contrato).param("cli",cliente).param("d","Locação "+contrato).param("v",vencimento).param("t",total).query(Long.class).single();
    jdbc.sql("insert into cobranca_item(cobranca_id,contrato_item_id,tipo,descricao,quantidade,periodo_inicio,periodo_fim,valor_unitario,valor_total) select :c,ci.id,'LOCACAO',ci.descricao_snapshot,ci.quantidade,ci.periodo_inicio,ci.periodo_fim,ci.valor_unitario,ci.valor_total from contrato_item ci where ci.contrato_numero=:ct")
      .param("c",cobranca).param("ct",contrato).update();
    jdbc.sql("insert into cobranca_item(cobranca_id,tipo,descricao,quantidade,valor_unitario,valor_total) select :c,'SERVICO',descricao_snapshot,quantidade,valor_unitario,valor_total from orcamento_servico where versao_id=:v")
      .param("c",cobranca).param("v",versaoId).update();
    Map<String,Object> valores=jdbc.sql("select frete,desconto from orcamento_versao where id=:v").param("v",versaoId).query().singleRow();
    BigDecimal frete=decimal(valores.get("frete")),desconto=decimal(valores.get("desconto"));
    if(frete.signum()>0)jdbc.sql("insert into cobranca_item(cobranca_id,tipo,descricao,quantidade,valor_unitario,valor_total) values(:c,'SERVICO','Frete',1,:v,:v)").param("c",cobranca).param("v",frete).update();
    if(desconto.signum()>0)jdbc.sql("insert into cobranca_item(cobranca_id,tipo,descricao,quantidade,valor_unitario,valor_total) values(:c,'AJUSTE','Desconto comercial',1,:v,:v)").param("c",cobranca).param("v",desconto.negate()).update();
  }

  private void validarDisponibilidade(String produto,int solicitada,LocalDate inicio,LocalDate fim){
    int capacidade=jdbc.sql("select capacidade from produto_atendimento where id=:id for update").param("id",produto).query(Integer.class).optional().orElseThrow(()->erro(HttpStatus.BAD_REQUEST,"Produto desconhecido: "+produto));
    int reservada=jdbc.sql("select coalesce(sum(quantidade),0) from reserva_atendimento where produto_id=:id and status='ATIVA' and inicio<=:fim and fim>=:inicio").param("id",produto).param("inicio",inicio).param("fim",fim).query(Integer.class).single();
    if(reservada+solicitada>capacidade)throw erro(HttpStatus.CONFLICT,"Sem disponibilidade para "+produto+". Disponível: "+Math.max(0,capacidade-reservada));
  }

  private Preco melhorPreco(Map<String,Object> p,int dias){
    BigDecimal[] valores={decimal(p.getOrDefault("mensal",0)),decimal(p.getOrDefault("quinzenal",0)),decimal(p.getOrDefault("semanal",0)),decimal(p.getOrDefault("diaria",0))};
    int[] blocos={30,15,7,1}; String[] tipos={"MENSAL","QUINZENAL","SEMANAL","DIARIA"};
    BigDecimal[] dp=new BigDecimal[dias+31];String[] escolha=new String[dias+31];Arrays.fill(dp,null);dp[0]=BigDecimal.ZERO;
    for(int i=1;i<dp.length;i++)for(int j=0;j<blocos.length;j++){
      if(valores[j].signum()<=0) continue;
      int ant=Math.max(0,i-blocos[j]);
      if(dp[ant]==null) continue;
      BigDecimal cand=dp[ant].add(valores[j]);
      if(dp[i]==null||cand.compareTo(dp[i])<0){dp[i]=cand;escolha[i]=tipos[j];}
    }
    if(dp[dias]==null) throw erro(HttpStatus.BAD_REQUEST,"O equipamento não possui uma tabela de locação válida");
    return new Preco(dp[dias],escolha[dias]);
  }

  private Map<String,Object> pedidoSnapshot(String numero,Map<String,Object> o,Map<String,Object> v,List<Map<String,Object>> itens){
    LinkedHashMap<String,Object> p=new LinkedHashMap<>();p.put("num",numero);p.put("clienteId",o.get("cliente_id"));p.put("obra",obraNome(v.get("obra_snapshot")));p.put("entrega",v.get("entrega"));p.put("inicio",String.valueOf(v.get("periodo_inicio")));p.put("fim",String.valueOf(v.get("periodo_fim")));p.put("status","Aprovado");p.put("forma",v.get("forma_pagamento"));p.put("frete",v.get("frete"));p.put("desconto",v.get("desconto"));p.put("itens",itens.stream().map(i->Map.of("id",i.get("id"),"prod",i.get("produto_id"),"qtd",i.get("quantidade"),"nome",i.get("descricao_snapshot"),"valor",i.get("valor_total"))).toList());p.put("servicos",List.of());p.put("versoes",List.of(Map.of("id",v.get("id"),"v",v.get("numero_versao"),"valor",v.get("valor_total"),"quando","agora","nota","Versão aprovada","ativa",true)));p.put("criado","agora");p.put("autor","Sistema");p.put("linha",List.of());return p;
  }
  private Map<String,Object> contratoSnapshot(String numero,String pedido,Map<String,Object> o,Map<String,Object> v,List<Map<String,Object>> itens){
    LinkedHashMap<String,Object> c=new LinkedHashMap<>();c.put("numero",numero);c.put("pedido",pedido);c.put("clienteId",o.get("cliente_id"));c.put("inicio",String.valueOf(v.get("periodo_inicio")));c.put("fim",String.valueOf(v.get("periodo_fim")));c.put("situacao","Aguardando pagamento");c.put("pagamento","Pendente");c.put("local",obraNome(v.get("obra_snapshot")).isBlank()?"Retirada na loja":obraNome(v.get("obra_snapshot")));c.put("endereco",obraEndereco(v.get("obra_snapshot")));c.put("frete",v.get("frete"));c.put("servicos",v.get("valor_servicos"));c.put("locacao",v.get("valor_locacao"));c.put("itens",itens.stream().map(i->Map.of("itemId",i.get("id"),"prod",i.get("produto_id"),"qtd",i.get("quantidade"),"nome",i.get("descricao_snapshot"),"patrimonio","a definir na expedição","estado","Reservado","valor",i.get("valor_total"))).toList());c.put("memoria",List.of());c.put("linha",List.of(Map.of("q","agora","t","Contrato "+numero+" gerado","d","Snapshot da versão comercial "+v.get("numero_versao"),"a","Sistema")));c.put("docs",List.of());return c;
  }
  private Map<String,Object> orcamento(String numero,boolean lock){return primeiraLinha(jdbc.sql("select id,numero,cliente_id,status,versao_atual,versao_aprovada_id from orcamento where numero=:n"+(lock?" for update":"")).param("n",numero).query().listOfRows(),"Orçamento não encontrado");}
  private Map<String,Object> obraSnapshot(Map<String,Object> cliente,String nome){for(Map<String,Object> o:lista(cliente.get("obras")))if(nome.equals(String.valueOf(o.get("nome"))))return new LinkedHashMap<>(o);return nome.isBlank()?Map.of():Map.of("nome",nome);}
  @SuppressWarnings("unchecked") private String obraNome(Object valor){if(valor instanceof Map<?,?>m)return String.valueOf(m.get("nome")==null?"":m.get("nome"));try{return String.valueOf(ler(String.valueOf(valor)).getOrDefault("nome",""));}catch(Exception e){return "";}}
  @SuppressWarnings("unchecked") private String obraEndereco(Object valor){if(valor instanceof Map<?,?>m)return String.valueOf(m.get("endereco")==null?"Balcão · LOCAGO":m.get("endereco"));try{return String.valueOf(ler(String.valueOf(valor)).getOrDefault("endereco","Balcão · LOCAGO"));}catch(Exception e){return "Balcão · LOCAGO";}}
  private Map<String,Object> primeiraLinha(List<Map<String,Object>> linhas,String mensagem){if(linhas.isEmpty())throw erro(HttpStatus.NOT_FOUND,mensagem);return new LinkedHashMap<>(linhas.get(0));}
  private LocalDate localDate(Object valor){if(valor instanceof LocalDate d)return d;if(valor instanceof java.sql.Date d)return d.toLocalDate();return LocalDate.parse(String.valueOf(valor));}
  private String statusTela(String s){return switch(s){case"APROVADO"->"Aprovado";case"ENVIADO"->"Orçamento enviado";case"RASCUNHO"->"Rascunho";case"CANCELADO"->"Cancelado";default->s;};}
  @SuppressWarnings("unchecked") private List<Map<String,Object>> lista(Object v){return v instanceof List<?>l?(List<Map<String,Object>>)(List<?>)l:List.of();}
  private LocalDate data(Map<String,Object>m,String k){try{return LocalDate.parse(texto(m,k));}catch(Exception e){throw erro(HttpStatus.BAD_REQUEST,"Data inválida: "+k);}}
  private String texto(Map<String,Object>m,String k){String s=String.valueOf(m.getOrDefault(k,"")).trim();if(s.isBlank())throw erro(HttpStatus.BAD_REQUEST,"Campo ausente: "+k);return s;}
  private int numero(Object v){return v instanceof Number n?n.intValue():Integer.parseInt(String.valueOf(v));}
  private long longNumero(Object v){return v instanceof Number n?n.longValue():Long.parseLong(String.valueOf(v));}
  private BigDecimal decimal(Object v){if(v==null)return BigDecimal.ZERO;return v instanceof BigDecimal b?b:new BigDecimal(String.valueOf(v));}
  @SuppressWarnings("unchecked") private Map<String,Object> ler(String value){try{return json.readValue(value,Map.class);}catch(JsonProcessingException e){throw new IllegalStateException(e);}}
  private String escrever(Object value){try{return json.writeValueAsString(value);}catch(JsonProcessingException e){throw new IllegalArgumentException(e);}}
  private ResponseStatusException erro(HttpStatus status,String msg){return new ResponseStatusException(status,msg);}
  private record Preco(BigDecimal valor,String tipo){}
}
