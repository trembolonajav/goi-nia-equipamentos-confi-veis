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
import java.util.List;
import java.util.Map;

@Service
public class AprovacaoService {
  private final JdbcClient jdbc; private final ObjectMapper json;
  public AprovacaoService(JdbcClient jdbc,ObjectMapper json){this.jdbc=jdbc;this.json=json;}

  @Transactional public Map<String,Object> aprovar(String numeroPedido,Map<String,Object> body){
    Map<String,Object> pedido=mapa(body.get("pedido")); Map<String,Object> contrato=mapa(body.get("contrato"));
    if(!numeroPedido.equals(pedido.get("num"))) throw new ResponseStatusException(HttpStatus.BAD_REQUEST,"Número do pedido divergente");
    String numeroContrato=texto(contrato,"numero");
    if(jdbc.sql("select count(*) from contrato_atendimento where pedido_numero=:p").param("p",numeroPedido).query(Integer.class).single()>0)
      throw new ResponseStatusException(HttpStatus.CONFLICT,"Pedido já possui contrato");
    LocalDate inicio=LocalDate.parse(texto(pedido,"inicio")); LocalDate fim=LocalDate.parse(texto(pedido,"fim"));
    List<Map<String,Object>> itens=lista(pedido.get("itens")); List<Map<String,Object>> snapshots=lista(contrato.get("itens"));
    for(Map<String,Object> item:itens) validarDisponibilidade(texto(item,"prod"),numero(item.getOrDefault("qtd",1)),inicio,fim);
    jdbc.sql("update pedido_atendimento set dados=cast(:dados as jsonb),status='Aprovado',atualizado_em=now() where numero=:numero").param("dados",escrever(pedido)).param("numero",numeroPedido).update();
    jdbc.sql("insert into contrato_atendimento(numero,pedido_numero,cliente_id,dados) values (:n,:p,:c,cast(:d as jsonb))").param("n",numeroContrato).param("p",numeroPedido).param("c",texto(pedido,"clienteId")).param("d",escrever(contrato)).update();
    for(int indice=0;indice<itens.size();indice++){
      Map<String,Object> item=itens.get(indice); Map<String,Object> snapshot=indice<snapshots.size()?snapshots.get(indice):item;
      String produto=texto(item,"prod"); int quantidade=numero(item.getOrDefault("qtd",1)); BigDecimal total=decimal(snapshot.getOrDefault("valor",0));
      jdbc.sql("insert into reserva_atendimento(contrato_numero,produto_id,quantidade,inicio,fim) values (:c,:p,:q,:i,:f)").param("c",numeroContrato).param("p",produto).param("q",quantidade).param("i",inicio).param("f",fim).update();
      jdbc.sql("insert into contrato_item(contrato_numero,produto_id,descricao_snapshot,quantidade,periodo_inicio,periodo_fim,valor_unitario,valor_total,status,dados_snapshot) values (:c,:p,:d,:q,:i,:f,:u,:t,'RESERVADO',cast(:s as jsonb))")
        .param("c",numeroContrato).param("p",produto).param("d",String.valueOf(snapshot.getOrDefault("nome",produto))).param("q",quantidade).param("i",inicio).param("f",fim)
        .param("u",total.divide(BigDecimal.valueOf(quantidade),2,RoundingMode.HALF_UP)).param("t",total).param("s",escrever(snapshot)).update();
    }
    if("obra".equalsIgnoreCase(String.valueOf(pedido.get("entrega")))){
      String destino=String.valueOf(contrato.getOrDefault("local","Obra")); String endereco=String.valueOf(contrato.getOrDefault("endereco","Endereço não informado")); String cliente=texto(pedido,"clienteId");
      jdbc.sql("insert into tarefa_logistica(contrato_numero,cliente_id,tipo,data_prevista,hora_prevista,destino,endereco) values (:c,:cli,'ENTREGA',:data,'08:00',:dest,:end)").param("c",numeroContrato).param("cli",cliente).param("data",inicio).param("dest",destino).param("end",endereco).update();
      jdbc.sql("insert into tarefa_logistica(contrato_numero,cliente_id,tipo,data_prevista,hora_prevista,destino,endereco) values (:c,:cli,'COLETA',:data,'16:00',:dest,:end)").param("c",numeroContrato).param("cli",cliente).param("data",fim).param("dest",destino).param("end",endereco).update();
    }
    BigDecimal locacao=decimal(contrato.getOrDefault("locacao",0)); BigDecimal servicos=decimal(contrato.getOrDefault("servicos",0)); String cliente=texto(pedido,"clienteId");
    Long cobrancaId=jdbc.sql("insert into cobranca_atendimento(contrato_numero,cliente_id,descricao,vencimento,valor) values (:c,:cli,:d,:v,:valor) returning id").param("c",numeroContrato).param("cli",cliente).param("d","Locação "+numeroContrato).param("v",inicio).param("valor",locacao.add(servicos)).query(Long.class).single();
    List<Map<String,Object>> criados=jdbc.sql("select id,descricao_snapshot,quantidade,periodo_inicio,periodo_fim,valor_unitario,valor_total from contrato_item where contrato_numero=:c order by id").param("c",numeroContrato).query().listOfRows();
    for(Map<String,Object> item:criados) jdbc.sql("insert into cobranca_item(cobranca_id,contrato_item_id,tipo,descricao,quantidade,periodo_inicio,periodo_fim,valor_unitario,valor_total) values (:c,:ci,'LOCACAO',:d,:q,:i,:f,:u,:t)")
      .param("c",cobrancaId).param("ci",item.get("id")).param("d",item.get("descricao_snapshot")).param("q",item.get("quantidade")).param("i",item.get("periodo_inicio")).param("f",item.get("periodo_fim")).param("u",item.get("valor_unitario")).param("t",item.get("valor_total")).update();
    if(servicos.signum()>0) jdbc.sql("insert into cobranca_item(cobranca_id,tipo,descricao,quantidade,periodo_inicio,periodo_fim,valor_unitario,valor_total) values (:c,'SERVICO','Serviços do contrato',1,:i,:f,:v,:v)").param("c",cobrancaId).param("i",inicio).param("f",fim).param("v",servicos).update();
    return contrato;
  }

  private void validarDisponibilidade(String produto,int solicitada,LocalDate inicio,LocalDate fim){
    Integer capacidade=jdbc.sql("select capacidade from produto_atendimento where id=:id for update").param("id",produto).query(Integer.class).optional().orElseThrow(()->new ResponseStatusException(HttpStatus.BAD_REQUEST,"Produto desconhecido: "+produto));
    Integer reservada=jdbc.sql("select coalesce(sum(quantidade),0) from reserva_atendimento where produto_id=:id and status='ATIVA' and inicio<=:fim and fim>=:inicio").param("id",produto).param("inicio",inicio).param("fim",fim).query(Integer.class).single();
    if(reservada+solicitada>capacidade) throw new ResponseStatusException(HttpStatus.CONFLICT,"Sem disponibilidade para "+produto+". Disponível: "+Math.max(0,capacidade-reservada));
  }
  @SuppressWarnings("unchecked") private Map<String,Object> mapa(Object v){if(v instanceof Map<?,?> m)return(Map<String,Object>)m;throw new ResponseStatusException(HttpStatus.BAD_REQUEST,"Documento inválido");}
  @SuppressWarnings("unchecked") private List<Map<String,Object>> lista(Object v){return v instanceof List<?> l?(List<Map<String,Object>>)(List<?>)l:List.of();}
  private String texto(Map<String,Object> m,String k){Object v=m.get(k);if(v==null||v.toString().isBlank())throw new ResponseStatusException(HttpStatus.BAD_REQUEST,"Campo ausente: "+k);return v.toString();}
  private int numero(Object v){return v instanceof Number n?n.intValue():Integer.parseInt(v.toString());}
  private BigDecimal decimal(Object v){return v instanceof BigDecimal b?b:new BigDecimal(v.toString());}
  private String escrever(Object v){try{return json.writeValueAsString(v);}catch(JsonProcessingException e){throw new IllegalArgumentException(e);}}
}
