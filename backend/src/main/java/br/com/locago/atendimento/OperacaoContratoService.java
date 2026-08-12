package br.com.locago.atendimento;

import com.fasterxml.jackson.core.JsonProcessingException;
import com.fasterxml.jackson.databind.ObjectMapper;
import org.springframework.http.HttpStatus;
import org.springframework.jdbc.core.simple.JdbcClient;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.server.ResponseStatusException;
import java.util.ArrayList;
import java.util.HashSet;
import java.util.List;
import java.util.Map;

@Service
public class OperacaoContratoService {
  private final JdbcClient jdbc; private final ObjectMapper json;
  public OperacaoContratoService(JdbcClient jdbc,ObjectMapper json){this.jdbc=jdbc;this.json=json;}

  public List<Map<String,Object>> itensOperacionais(String numero){
    carregar(numero);
    return jdbc.sql("""
      select ci.id,ci.produto_id as "produtoId",ci.descricao_snapshot as descricao,ci.quantidade,ci.status,
             ci.periodo_inicio as inicio,ci.periodo_fim as fim,ci.valor_total as valor,
             (select count(*) from contrato_item_patrimonio x where x.contrato_item_id=ci.id) as expedido,
             greatest(ci.quantidade-(select count(*) from contrato_item_patrimonio x where x.contrato_item_id=ci.id),0) as "aExpedir",
             (select count(*) from contrato_item_patrimonio x where x.contrato_item_id=ci.id and x.entregue_em is not null) as entregue,
             coalesce(jsonb_agg(jsonb_build_object('codigo',p.codigo,'estado',p.estado,'serie',p.serie,'entregue',cip.entregue_em is not null)) filter(where p.codigo is not null),'[]'::jsonb) as patrimonios
      from contrato_item ci left join contrato_item_patrimonio cip on cip.contrato_item_id=ci.id and cip.liberado_em is null
      left join patrimonio_atendimento p on p.codigo=cip.patrimonio_codigo
      where ci.contrato_numero=:c group by ci.id order by ci.id
      """).param("c",numero).query((r,n)->{
        Map<String,Object> item=new java.util.LinkedHashMap<>();
        item.put("id",r.getLong("id"));item.put("produtoId",r.getString("produtoId"));item.put("descricao",r.getString("descricao"));
        item.put("quantidade",r.getInt("quantidade"));item.put("status",r.getString("status"));item.put("inicio",r.getDate("inicio").toLocalDate().toString());
        item.put("fim",r.getDate("fim").toLocalDate().toString());item.put("valor",r.getBigDecimal("valor"));item.put("expedido",r.getInt("expedido"));
        item.put("aExpedir",r.getInt("aExpedir"));item.put("entregue",r.getInt("entregue"));item.put("patrimonios",lerLista(r.getString("patrimonios")));
        return item;
      }).list();
  }

  @Transactional public Map<String,Object> expedir(String numero,Map<String,Object> body){
    Map<String,Object> contrato=carregar(numero); List<Map<String,Object>> alocacoes=mapas(body,"alocacoes");
    if(alocacoes.isEmpty())throw erro(HttpStatus.BAD_REQUEST,"Selecione ao menos um item para expedir");
    exigirDocumento(numero,"Contrato assinado");
    var itensUnicos=new HashSet<Long>(); int total=0;
    for(Map<String,Object> alocacao:alocacoes){
      long itemId=numeroLong(alocacao.get("itemId"),"Item inválido");
      if(!itensUnicos.add(itemId))throw erro(HttpStatus.BAD_REQUEST,"Informe cada item apenas uma vez");
      int qtd=(int)numeroLong(alocacao.get("quantidade"),"Informe a quantidade desta saída");
      if(qtd<=0)throw erro(HttpStatus.BAD_REQUEST,"Informe uma quantidade positiva para a saída");
      Map<String,Object> item=item(numero,itemId); int contratada=((Number)item.get("quantidade")).intValue();
      int expedida=contagemVinculos(itemId);
      if(qtd>contratada-expedida)throw erro(HttpStatus.CONFLICT,"Quantidade maior que o saldo a expedir de "+item.get("descricao_snapshot"));
      String produto=String.valueOf(item.get("produto_id"));
      List<String> codigos=jdbc.sql("select codigo from patrimonio_atendimento where produto_id=:p and estado='DISPONIVEL' order by codigo for update skip locked limit :q").param("p",produto).param("q",qtd).query(String.class).list();
      if(codigos.size()<qtd)throw erro(HttpStatus.CONFLICT,"Patrimônio disponível insuficiente para "+item.get("descricao_snapshot"));
      for(String codigo:codigos){
        jdbc.sql("insert into contrato_item_patrimonio(contrato_item_id,patrimonio_codigo,expedido_em) values (:i,:p,now())").param("i",itemId).param("p",codigo).update();
        mover(numero,itemId,codigo,"EXPEDICAO","DISPONIVEL","LOCADO","Saída confirmada; patrimônio em transporte");
      }
      total+=qtd; atualizarStatusItem(itemId);
    }
    atualizarSituacao(numero,contrato); evento(contrato,"Saída confirmada",total+" patrimônio(s) em transporte"); salvar(numero,contrato); return contrato;
  }

  @Transactional public Map<String,Object> confirmarEntrega(String numero,Map<String,Object> body){
    Map<String,Object> contrato=carregar(numero); List<String> codigos=textos(body,"patrimonioCodigos");
    if(codigos.isEmpty())throw erro(HttpStatus.BAD_REQUEST,"Selecione ao menos um patrimônio para entregar");
    long documentoId=numeroLong(body.get("documentoId"),"Selecione o comprovante desta entrega");
    List<Long> comprovantes=jdbc.sql("select d.id from documento_contrato d where d.id=:d and d.contrato_numero=:c and d.tipo='Comprovante de entrega assinado' and not exists(select 1 from entrega_operacao e where e.documento_id=d.id) for update")
      .param("d",documentoId).param("c",numero).query(Long.class).list();
    if(comprovantes.size()!=1)throw erro(HttpStatus.CONFLICT,"O comprovante não pertence a este contrato ou já foi usado em outra entrega");
    long entregaOperacaoId=jdbc.sql("insert into entrega_operacao(contrato_numero,documento_id) values(:c,:d) returning id").param("c",numero).param("d",documentoId).query(Long.class).single();
    for(String codigo:codigos){
      List<Map<String,Object>> rows=jdbc.sql("select cip.id,cip.contrato_item_id from contrato_item_patrimonio cip join contrato_item ci on ci.id=cip.contrato_item_id join patrimonio_atendimento p on p.codigo=cip.patrimonio_codigo where ci.contrato_numero=:c and p.codigo=:p and p.estado='LOCADO' and cip.liberado_em is null and cip.entregue_em is null for update").param("c",numero).param("p",codigo).query().listOfRows();
      if(rows.isEmpty())throw erro(HttpStatus.CONFLICT,"Patrimônio "+codigo+" não está aguardando entrega neste contrato");
      Map<String,Object> vinculo=rows.get(0); long itemId=((Number)vinculo.get("contrato_item_id")).longValue();
      jdbc.sql("update contrato_item_patrimonio set entregue_em=now() where id=:id").param("id",vinculo.get("id")).update();
      registrarMovimento(numero,itemId,codigo,"ENTREGA_CONFIRMADA","LOCADO","LOCADO","Comprovante de entrega confirmado",entregaOperacaoId);
    }
    int aguardando=jdbc.sql("select count(*) from contrato_item_patrimonio cip join contrato_item ci on ci.id=cip.contrato_item_id where ci.contrato_numero=:c and cip.liberado_em is null and cip.entregue_em is null").param("c",numero).query(Integer.class).single();
    if(aguardando==0)jdbc.sql("update tarefa_logistica set status='CONCLUIDA',concluido_em=now() where contrato_numero=:c and tipo='ENTREGA' and status='PENDENTE'").param("c",numero).update();
    evento(contrato,"Entrega confirmada",codigos.size()+" patrimônio(s) entregue(s) ao cliente"); salvar(numero,contrato); return contrato;
  }

  @Transactional public Map<String,Object> devolver(String numero,Map<String,Object> body){
    Map<String,Object> contrato=carregar(numero); List<String> codigos=textos(body,"patrimonioCodigos");
    if(codigos.isEmpty())throw erro(HttpStatus.BAD_REQUEST,"Selecione ao menos um patrimônio para devolver");
    exigirDocumento(numero,"Comprovante de devolução assinado");
    for(String codigo:codigos){
      Map<String,Object> vinculo=vinculo(numero,codigo,"LOCADO",true); long itemId=((Number)vinculo.get("item_id")).longValue();
      mover(numero,itemId,codigo,"DEVOLUCAO","LOCADO","EM_INSPECAO","Retorno recebido");
      jdbc.sql("update contrato_item_patrimonio set devolvido_em=now() where contrato_item_id=:i and patrimonio_codigo=:p and liberado_em is null").param("i",itemId).param("p",codigo).update();
      atualizarStatusItem(itemId);
    }
    int locados=jdbc.sql("select count(*) from contrato_item_patrimonio cip join contrato_item ci on ci.id=cip.contrato_item_id join patrimonio_atendimento p on p.codigo=cip.patrimonio_codigo where ci.contrato_numero=:c and cip.liberado_em is null and p.estado='LOCADO'").param("c",numero).query(Integer.class).single();
    if(locados==0)jdbc.sql("update tarefa_logistica set status='CONCLUIDA',concluido_em=now() where contrato_numero=:c and tipo='COLETA' and status='PENDENTE'").param("c",numero).update();
    atualizarSituacao(numero,contrato); evento(contrato,"Devolução recebida",codigos.size()+" patrimônio(s) enviado(s) para inspeção"); salvar(numero,contrato); return contrato;
  }

  @Transactional public Map<String,Object> inspecionar(String numero,Map<String,Object> body){
    Map<String,Object> contrato=carregar(numero); String resultado=String.valueOf(body.getOrDefault("resultado","")); String observacao=String.valueOf(body.getOrDefault("observacao","")); List<String> codigos=textos(body,"patrimonioCodigos");
    if(codigos.isEmpty())throw erro(HttpStatus.BAD_REQUEST,"Selecione ao menos um patrimônio para inspecionar");
    boolean aprovado="APROVADO".equalsIgnoreCase(resultado);
    if(!aprovado&&!"MANUTENCAO".equalsIgnoreCase(resultado))throw erro(HttpStatus.BAD_REQUEST,"Resultado deve ser APROVADO ou MANUTENCAO");
    for(String codigo:codigos){
      Map<String,Object> vinculo=vinculo(numero,codigo,"EM_INSPECAO",false); long itemId=((Number)vinculo.get("item_id")).longValue();
      if(aprovado){
        mover(numero,itemId,codigo,"INSPECAO_APROVADA","EM_INSPECAO","DISPONIVEL",observacao); liberar(itemId,codigo);
      }else{
        String motivo=observacao.isBlank()?"Avaria identificada na inspeção de devolução":observacao;
        mover(numero,itemId,codigo,"ENCAMINHADO_MANUTENCAO","EM_INSPECAO","MANUTENCAO",motivo); liberar(itemId,codigo);
        jdbc.sql("insert into manutencao_atendimento(patrimonio_codigo,contrato_numero,motivo) values (:p,:c,:m)").param("p",codigo).param("c",numero).param("m",motivo).update();
      }
      atualizarStatusItem(itemId);
    }
    jdbc.sql("insert into inspecao_atendimento(contrato_numero,resultado,observacao) values (:c,:r,:o)").param("c",numero).param("r",aprovado?"APROVADO":"MANUTENCAO").param("o",observacao).update();
    atualizarSituacao(numero,contrato); evento(contrato,aprovado?"Inspeção aprovada":"Ocorrência na inspeção",codigos.size()+" patrimônio(s) processado(s)"); salvar(numero,contrato); return contrato;
  }

  @Transactional public void concluirManutencaoContrato(String numero,String patrimonio,String observacao){
    List<Map<String,Object>> rows=jdbc.sql("select cip.contrato_item_id from contrato_item_patrimonio cip join contrato_item ci on ci.id=cip.contrato_item_id where ci.contrato_numero=:c and cip.patrimonio_codigo=:p order by cip.id desc limit 1").param("c",numero).param("p",patrimonio).query().listOfRows();
    if(rows.isEmpty())throw erro(HttpStatus.CONFLICT,"Vínculo do patrimônio com o contrato não encontrado");
    long itemId=((Number)rows.get(0).get("contrato_item_id")).longValue();
    registrarMovimento(numero,itemId,patrimonio,"MANUTENCAO_CONCLUIDA","MANUTENCAO","DISPONIVEL",observacao);
    atualizarStatusItem(itemId); Map<String,Object> contrato=carregar(numero); atualizarSituacao(numero,contrato);
    evento(contrato,"Manutenção concluída",patrimonio+" testado e liberado para novas locações"); salvar(numero,contrato);
  }

  private Map<String,Object> item(String contrato,long id){
    List<Map<String,Object>> rows=jdbc.sql("select id,produto_id,descricao_snapshot,quantidade,status from contrato_item where contrato_numero=:c and id=:i for update").param("c",contrato).param("i",id).query().listOfRows();
    if(rows.isEmpty())throw erro(HttpStatus.NOT_FOUND,"Item do contrato não encontrado");
    if(List.of("FINALIZADO","CANCELADO").contains(String.valueOf(rows.get(0).get("status"))))throw erro(HttpStatus.CONFLICT,"Item não está disponível para esta etapa"); return rows.get(0);
  }
  private Map<String,Object> vinculo(String contrato,String codigo,String estado,boolean exigirEntrega){
    String entrega=exigirEntrega?" and cip.entregue_em is not null":"";
    List<Map<String,Object>> rows=jdbc.sql("select cip.contrato_item_id as item_id from contrato_item_patrimonio cip join contrato_item ci on ci.id=cip.contrato_item_id join patrimonio_atendimento p on p.codigo=cip.patrimonio_codigo where ci.contrato_numero=:c and p.codigo=:p and p.estado=:e and cip.liberado_em is null"+entrega+" for update").param("c",contrato).param("p",codigo).param("e",estado).query().listOfRows();
    if(rows.isEmpty())throw erro(HttpStatus.CONFLICT,"Patrimônio "+codigo+" não está nesta etapa do contrato"); return rows.get(0);
  }
  private void mover(String contrato,long itemId,String codigo,String tipo,String anterior,String novo,String observacao){
    boolean liberar="DISPONIVEL".equals(novo)||"MANUTENCAO".equals(novo);
    String sql=liberar?"update patrimonio_atendimento set estado=:novo,contrato_numero=null,atualizado_em=now() where codigo=:codigo and estado=:anterior":"update patrimonio_atendimento set estado=:novo,contrato_numero=:contrato,atualizado_em=now() where codigo=:codigo and estado=:anterior";
    var spec=jdbc.sql(sql).param("novo",novo).param("codigo",codigo).param("anterior",anterior); if(!liberar)spec=spec.param("contrato",contrato);
    if(spec.update()!=1)throw erro(HttpStatus.CONFLICT,"Estado do patrimônio "+codigo+" foi alterado por outra operação");
    registrarMovimento(contrato,itemId,codigo,tipo,anterior,novo,observacao);
  }
  private void registrarMovimento(String contrato,long itemId,String codigo,String tipo,String anterior,String novo,String observacao){registrarMovimento(contrato,itemId,codigo,tipo,anterior,novo,observacao,null);}
  private void registrarMovimento(String contrato,long itemId,String codigo,String tipo,String anterior,String novo,String observacao,Long entregaOperacaoId){jdbc.sql("insert into movimentacao_patrimonio(patrimonio_codigo,contrato_numero,contrato_item_id,tipo,estado_anterior,estado_novo,observacao,entrega_operacao_id) values (:p,:c,:i,:t,:a,:n,:o,:e)").param("p",codigo).param("c",contrato).param("i",itemId).param("t",tipo).param("a",anterior).param("n",novo).param("o",observacao==null?"":observacao).param("e",entregaOperacaoId).update();}
  private void liberar(long itemId,String codigo){jdbc.sql("update contrato_item_patrimonio set liberado_em=now() where contrato_item_id=:i and patrimonio_codigo=:p and liberado_em is null").param("i",itemId).param("p",codigo).update();}
  private int contagemVinculos(long id){return jdbc.sql("select count(*) from contrato_item_patrimonio where contrato_item_id=:i").param("i",id).query(Integer.class).single();}
  private void atualizarStatusItem(long id){
    Map<String,Object> c=jdbc.sql("select ci.quantidade,(select count(*) from contrato_item_patrimonio x where x.contrato_item_id=ci.id) total,(select count(*) from contrato_item_patrimonio x join patrimonio_atendimento p on p.codigo=x.patrimonio_codigo where x.contrato_item_id=ci.id and x.liberado_em is null and p.estado='LOCADO') locados,(select count(*) from contrato_item_patrimonio x join patrimonio_atendimento p on p.codigo=x.patrimonio_codigo where x.contrato_item_id=ci.id and x.liberado_em is null and p.estado='EM_INSPECAO') inspecao,(select count(*) from manutencao_atendimento m join contrato_item_patrimonio x on x.patrimonio_codigo=m.patrimonio_codigo where x.contrato_item_id=ci.id and m.contrato_numero=ci.contrato_numero and m.status='ABERTA') manutencao from contrato_item ci where ci.id=:i").param("i",id).query().singleRow();
    int qtd=n(c,"quantidade"),total=n(c,"total"),locados=n(c,"locados"),inspecao=n(c,"inspecao"),manutencao=n(c,"manutencao");
    String status=locados>0?"LOCADO":inspecao>0?"EM_INSPECAO":manutencao>0?"EM_MANUTENCAO":total<qtd?(total==0?"RESERVADO":"A_EXPEDIR"):"FINALIZADO";
    jdbc.sql("update contrato_item set status=:s,atualizado_em=now() where id=:i").param("s",status).param("i",id).update();
  }
  private void atualizarSituacao(String numero,Map<String,Object> contrato){
    List<String> estados=jdbc.sql("select status from contrato_item where contrato_numero=:c").param("c",numero).query(String.class).list();
    int restantes=jdbc.sql("select coalesce(sum(greatest(ci.quantidade-(select count(*) from contrato_item_patrimonio x where x.contrato_item_id=ci.id),0)),0) from contrato_item ci where ci.contrato_numero=:c and ci.status<>'CANCELADO'").param("c",numero).query(Integer.class).single();
    int expedidos=jdbc.sql("select count(*) from contrato_item_patrimonio x join contrato_item ci on ci.id=x.contrato_item_id where ci.contrato_numero=:c").param("c",numero).query(Integer.class).single();
    String situacao;
    if(!estados.isEmpty()&&estados.stream().allMatch(s->s.equals("FINALIZADO")||s.equals("CANCELADO")))situacao="Encerrado";
    else if(estados.contains("EM_MANUTENCAO"))situacao="Em manutenção";
    else if(estados.contains("EM_INSPECAO"))situacao="Em inspeção";
    else if(restantes>0&&expedidos>0)situacao="Parcialmente expedido";
    else if(estados.contains("LOCADO"))situacao="Em andamento";
    else if(expedidos>0)situacao="Em andamento";
    else situacao="Aguardando pagamento";
    contrato.put("situacao",situacao); sincronizarItens(contrato,numero);
  }
  private void sincronizarItens(Map<String,Object> contrato,String numero){Map<String,String> estados=jdbc.sql("select produto_id,status from contrato_item where contrato_numero=:c order by id").param("c",numero).query((rs,n)->Map.entry(rs.getString(1),rs.getString(2))).list().stream().collect(java.util.stream.Collectors.toMap(Map.Entry::getKey,Map.Entry::getValue,(a,b)->b));for(Map<String,Object> item:itens(contrato)){String s=estados.get(String.valueOf(item.get("prod")));if(s!=null)item.put("estado",rotulo(s));}}
  private String rotulo(String s){return switch(s){case"LOCADO"->"Locado";case"EM_INSPECAO"->"Em inspeção";case"EM_MANUTENCAO"->"Em manutenção";case"FINALIZADO"->"Encerrado";case"A_EXPEDIR"->"A expedir";default->"Reservado";};}
  private Map<String,Object> carregar(String numero){String dados=jdbc.sql("select dados::text from contrato_atendimento where numero=:n for update").param("n",numero).query(String.class).optional().orElseThrow(()->erro(HttpStatus.NOT_FOUND,"Contrato não encontrado"));return ler(dados);}
  private void exigirDocumento(String numero,String tipo){int n=jdbc.sql("select count(*) from documento_contrato where contrato_numero=:c and tipo=:t").param("c",numero).param("t",tipo).query(Integer.class).single();if(n==0)throw erro(HttpStatus.CONFLICT,"Anexe primeiro: "+tipo);}
  private void salvar(String numero,Map<String,Object> contrato){jdbc.sql("update contrato_atendimento set dados=cast(:d as jsonb),atualizado_em=now() where numero=:n").param("d",escrever(contrato)).param("n",numero).update();}
  private int n(Map<String,Object> m,String k){return((Number)m.get(k)).intValue();}
  private long numeroLong(Object v,String mensagem){try{if(v==null)throw new NumberFormatException();return Long.parseLong(String.valueOf(v));}catch(NumberFormatException e){throw erro(HttpStatus.BAD_REQUEST,mensagem);}}
  @SuppressWarnings("unchecked") private List<Map<String,Object>> itens(Map<String,Object> c){return(List<Map<String,Object>>)c.getOrDefault("itens",new ArrayList<>());}
  @SuppressWarnings("unchecked") private void evento(Map<String,Object> c,String titulo,String detalhe){List<Map<String,Object>> linha=(List<Map<String,Object>>)c.computeIfAbsent("linha",k->new ArrayList<>());linha.add(Map.of("q","agora","t",titulo,"d",detalhe,"a","Sistema"));}
  @SuppressWarnings("unchecked") private List<Map<String,Object>> mapas(Map<String,Object> body,String campo){Object v=body.get(campo);if(!(v instanceof List<?> l))return List.of();return l.stream().filter(Map.class::isInstance).map(x->(Map<String,Object>)x).toList();}
  private List<String> textos(Map<String,Object> body,String campo){Object v=body.get(campo);if(!(v instanceof List<?> l))return List.of();return l.stream().map(String::valueOf).filter(s->!s.isBlank()).distinct().toList();}
  @SuppressWarnings("unchecked") private Map<String,Object> ler(String v){try{return json.readValue(v,Map.class);}catch(JsonProcessingException e){throw new IllegalStateException(e);}}
  @SuppressWarnings("unchecked") private List<Map<String,Object>> lerLista(String v){try{return json.readValue(v,List.class);}catch(JsonProcessingException e){throw new IllegalStateException(e);}}
  private String escrever(Object v){try{return json.writeValueAsString(v);}catch(JsonProcessingException e){throw new IllegalArgumentException(e);}}
  private ResponseStatusException erro(HttpStatus status,String mensagem){return new ResponseStatusException(status,mensagem);}
}
