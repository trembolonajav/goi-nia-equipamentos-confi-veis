package br.com.locago.atendimento;

import com.fasterxml.jackson.core.JsonProcessingException;
import com.fasterxml.jackson.databind.ObjectMapper;
import org.springframework.http.HttpStatus;
import org.springframework.jdbc.core.simple.JdbcClient;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.server.ResponseStatusException;
import java.util.ArrayList;
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
             coalesce(jsonb_agg(jsonb_build_object('codigo',p.codigo,'estado',p.estado,'serie',p.serie)) filter(where p.codigo is not null),'[]'::jsonb) as patrimonios
      from contrato_item ci left join contrato_item_patrimonio cip on cip.contrato_item_id=ci.id and cip.liberado_em is null
      left join patrimonio_atendimento p on p.codigo=cip.patrimonio_codigo
      where ci.contrato_numero=:c group by ci.id order by ci.id
      """).param("c",numero).query().listOfRows();
  }

  @Transactional public Map<String,Object> expedir(String numero,Map<String,Object> body){
    Map<String,Object> contrato=carregar(numero); List<Long> selecionados=ids(body,"itemIds");
    if(selecionados.isEmpty()) throw new ResponseStatusException(HttpStatus.BAD_REQUEST,"Selecione ao menos um item para expedir");
    exigirDocumento(numero,"Contrato assinado"); exigirDocumento(numero,"Comprovante de entrega assinado");
    for(Long itemId:selecionados){
      Map<String,Object> item=item(numero,itemId,List.of("RESERVADO","A_EXPEDIR")); String produto=String.valueOf(item.get("produto_id")); int qtd=((Number)item.get("quantidade")).intValue();
      List<String> codigos=jdbc.sql("select codigo from patrimonio_atendimento where produto_id=:p and estado='DISPONIVEL' order by codigo for update skip locked limit :q").param("p",produto).param("q",qtd).query(String.class).list();
      if(codigos.size()<qtd) throw new ResponseStatusException(HttpStatus.CONFLICT,"Patrimônio disponível insuficiente para "+item.get("descricao_snapshot"));
      for(String codigo:codigos){
        jdbc.sql("insert into contrato_item_patrimonio(contrato_item_id,patrimonio_codigo,expedido_em) values (:i,:p,now())").param("i",itemId).param("p",codigo).update();
        mover(numero,itemId,codigo,"EXPEDICAO","DISPONIVEL","LOCADO","Saída confirmada");
      }
      jdbc.sql("update contrato_item set status='LOCADO',atualizado_em=now() where id=:i").param("i",itemId).update();
    }
    atualizarSituacao(numero,contrato); evento(contrato,"Expedição registrada",selecionados.size()+" item(ns) expedido(s)"); salvar(numero,contrato); return contrato;
  }

  @Transactional public Map<String,Object> devolver(String numero,Map<String,Object> body){
    Map<String,Object> contrato=carregar(numero); List<String> codigos=textos(body,"patrimonioCodigos");
    if(codigos.isEmpty()) throw new ResponseStatusException(HttpStatus.BAD_REQUEST,"Selecione ao menos um patrimônio para devolver");
    exigirDocumento(numero,"Comprovante de devolução assinado");
    for(String codigo:codigos){
      Map<String,Object> vinculo=vinculo(numero,codigo,"LOCADO"); Long itemId=((Number)vinculo.get("item_id")).longValue();
      mover(numero,itemId,codigo,"DEVOLUCAO","LOCADO","EM_INSPECAO","Retorno recebido");
      jdbc.sql("update contrato_item_patrimonio set devolvido_em=now() where contrato_item_id=:i and patrimonio_codigo=:p and liberado_em is null").param("i",itemId).param("p",codigo).update();
      atualizarStatusItemRetorno(itemId);
    }
    atualizarSituacao(numero,contrato); evento(contrato,"Devolução recebida",codigos.size()+" patrimônio(s) enviado(s) para inspeção"); salvar(numero,contrato); return contrato;
  }

  @Transactional public Map<String,Object> inspecionar(String numero,Map<String,Object> body){
    Map<String,Object> contrato=carregar(numero); String resultado=String.valueOf(body.getOrDefault("resultado","")); String observacao=String.valueOf(body.getOrDefault("observacao","")); List<String> codigos=textos(body,"patrimonioCodigos");
    if(codigos.isEmpty()) throw new ResponseStatusException(HttpStatus.BAD_REQUEST,"Selecione ao menos um patrimônio para inspecionar");
    boolean aprovado="APROVADO".equalsIgnoreCase(resultado);
    if(!aprovado&&!"MANUTENCAO".equalsIgnoreCase(resultado)) throw new ResponseStatusException(HttpStatus.BAD_REQUEST,"Resultado deve ser APROVADO ou MANUTENCAO");
    for(String codigo:codigos){
      Map<String,Object> vinculo=vinculo(numero,codigo,"EM_INSPECAO"); Long itemId=((Number)vinculo.get("item_id")).longValue();
      if(aprovado){
        mover(numero,itemId,codigo,"INSPECAO_APROVADA","EM_INSPECAO","DISPONIVEL",observacao);
        jdbc.sql("update contrato_item_patrimonio set liberado_em=now() where contrato_item_id=:i and patrimonio_codigo=:p and liberado_em is null").param("i",itemId).param("p",codigo).update();
      }else{
        String motivo=observacao.isBlank()?"Avaria identificada na inspeção de devolução":observacao;
        mover(numero,itemId,codigo,"ENCAMINHADO_MANUTENCAO","EM_INSPECAO","MANUTENCAO",motivo);
        jdbc.sql("update contrato_item_patrimonio set liberado_em=now() where contrato_item_id=:i and patrimonio_codigo=:p and liberado_em is null").param("i",itemId).param("p",codigo).update();
        jdbc.sql("insert into manutencao_atendimento(patrimonio_codigo,contrato_numero,motivo) values (:p,:c,:m)").param("p",codigo).param("c",numero).param("m",motivo).update();
      }
      atualizarStatusItemInspecao(itemId);
    }
    jdbc.sql("insert into inspecao_atendimento(contrato_numero,resultado,observacao) values (:c,:r,:o)").param("c",numero).param("r",aprovado?"APROVADO":"MANUTENCAO").param("o",observacao).update();
    atualizarSituacao(numero,contrato); evento(contrato,aprovado?"Inspeção aprovada":"Ocorrência na inspeção",codigos.size()+" patrimônio(s) processado(s)"); salvar(numero,contrato); return contrato;
  }

  private Map<String,Object> item(String contrato,Long id,List<String> estados){
    List<Map<String,Object>> rows=jdbc.sql("select id,produto_id,descricao_snapshot,quantidade,status from contrato_item where contrato_numero=:c and id=:i for update").param("c",contrato).param("i",id).query().listOfRows();
    if(rows.isEmpty())throw new ResponseStatusException(HttpStatus.NOT_FOUND,"Item do contrato não encontrado");
    Map<String,Object> row=rows.get(0);
    if(!estados.contains(String.valueOf(row.get("status")))) throw new ResponseStatusException(HttpStatus.CONFLICT,"Item não está disponível para esta etapa"); return row;
  }
  private Map<String,Object> vinculo(String contrato,String codigo,String estado){List<Map<String,Object>> rows=jdbc.sql("select cip.contrato_item_id as item_id from contrato_item_patrimonio cip join contrato_item ci on ci.id=cip.contrato_item_id join patrimonio_atendimento p on p.codigo=cip.patrimonio_codigo where ci.contrato_numero=:c and p.codigo=:p and p.estado=:e and cip.liberado_em is null for update").param("c",contrato).param("p",codigo).param("e",estado).query().listOfRows();if(rows.isEmpty())throw new ResponseStatusException(HttpStatus.CONFLICT,"Patrimônio "+codigo+" não está nesta etapa do contrato");return rows.get(0);}
  private void mover(String contrato,Long itemId,String codigo,String tipo,String anterior,String novo,String observacao){
    boolean liberar="DISPONIVEL".equals(novo)||"MANUTENCAO".equals(novo);
    String sql=liberar
      ?"update patrimonio_atendimento set estado=:novo,contrato_numero=null,atualizado_em=now() where codigo=:codigo and estado=:anterior"
      :"update patrimonio_atendimento set estado=:novo,contrato_numero=:contrato,atualizado_em=now() where codigo=:codigo and estado=:anterior";
    var spec=jdbc.sql(sql).param("novo",novo).param("codigo",codigo).param("anterior",anterior);
    if(!liberar)spec=spec.param("contrato",contrato);
    int n=spec.update();
    if(n!=1) throw new ResponseStatusException(HttpStatus.CONFLICT,"Estado do patrimônio "+codigo+" foi alterado por outra operação");
    jdbc.sql("insert into movimentacao_patrimonio(patrimonio_codigo,contrato_numero,contrato_item_id,tipo,estado_anterior,estado_novo,observacao) values (:p,:c,:i,:t,:a,:n,:o)").param("p",codigo).param("c",contrato).param("i",itemId).param("t",tipo).param("a",anterior).param("n",novo).param("o",observacao==null?"":observacao).update();
  }
  private void atualizarStatusItemRetorno(Long id){Integer ativos=jdbc.sql("select count(*) from contrato_item_patrimonio cip join patrimonio_atendimento p on p.codigo=cip.patrimonio_codigo where cip.contrato_item_id=:i and cip.liberado_em is null and p.estado='LOCADO'").param("i",id).query(Integer.class).single();jdbc.sql("update contrato_item set status=:s,atualizado_em=now() where id=:i").param("s",ativos>0?"LOCADO":"EM_INSPECAO").param("i",id).update();}
  private void atualizarStatusItemInspecao(Long id){Integer pendentes=jdbc.sql("select count(*) from contrato_item_patrimonio cip join patrimonio_atendimento p on p.codigo=cip.patrimonio_codigo where cip.contrato_item_id=:i and cip.liberado_em is null and p.estado in ('LOCADO','EM_INSPECAO')").param("i",id).query(Integer.class).single();Integer manutencao=jdbc.sql("select count(*) from movimentacao_patrimonio where contrato_item_id=:i and tipo='ENCAMINHADO_MANUTENCAO'").param("i",id).query(Integer.class).single();if(pendentes==0)jdbc.sql("update contrato_item set status=:s,atualizado_em=now() where id=:i").param("s",manutencao>0?"EM_MANUTENCAO":"FINALIZADO").param("i",id).update();}
  private void atualizarSituacao(String numero,Map<String,Object> contrato){
    List<String> estados=jdbc.sql("select status from contrato_item where contrato_numero=:c").param("c",numero).query(String.class).list(); String situacao;
    if(estados.stream().allMatch(s->s.equals("FINALIZADO")||s.equals("CANCELADO")||s.equals("EM_MANUTENCAO"))) situacao=estados.contains("EM_MANUTENCAO")?"Encerrado com ocorrência":"Encerrado";
    else if(estados.contains("EM_INSPECAO")) situacao="Em inspeção";
    else if(estados.contains("LOCADO")) situacao=estados.stream().anyMatch(s->s.equals("RESERVADO")||s.equals("A_EXPEDIR"))?"Parcialmente expedido":"Em andamento";
    else if(estados.stream().anyMatch(s->s.equals("FINALIZADO")||s.equals("EM_MANUTENCAO")||s.equals("DEVOLVIDO"))) situacao="Em andamento";
    else situacao="Aguardando pagamento";
    contrato.put("situacao",situacao); sincronizarItens(contrato,numero);
  }
  private void sincronizarItens(Map<String,Object> contrato,String numero){Map<String,String> estados=jdbc.sql("select produto_id,status from contrato_item where contrato_numero=:c order by id").param("c",numero).query((rs,n)->Map.entry(rs.getString(1),rs.getString(2))).list().stream().collect(java.util.stream.Collectors.toMap(Map.Entry::getKey,Map.Entry::getValue,(a,b)->b));for(Map<String,Object> item:itens(contrato)){String s=estados.get(String.valueOf(item.get("prod")));if(s!=null)item.put("estado",rotulo(s));}}
  private String rotulo(String s){return switch(s){case"LOCADO"->"Locado";case"EM_INSPECAO"->"Em inspeção";case"EM_MANUTENCAO"->"Em manutenção";case"FINALIZADO"->"Encerrado";default->"Reservado";};}
  private Map<String,Object> carregar(String numero){String dados=jdbc.sql("select dados::text from contrato_atendimento where numero=:n for update").param("n",numero).query(String.class).optional().orElseThrow(()->new ResponseStatusException(HttpStatus.NOT_FOUND,"Contrato não encontrado"));return ler(dados);}
  private void exigirDocumento(String numero,String tipo){int n=jdbc.sql("select count(*) from documento_contrato where contrato_numero=:c and tipo=:t").param("c",numero).param("t",tipo).query(Integer.class).single();if(n==0)throw new ResponseStatusException(HttpStatus.CONFLICT,"Anexe primeiro: "+tipo);}
  private void salvar(String numero,Map<String,Object> contrato){jdbc.sql("update contrato_atendimento set dados=cast(:d as jsonb),atualizado_em=now() where numero=:n").param("d",escrever(contrato)).param("n",numero).update();}
  @SuppressWarnings("unchecked") private List<Map<String,Object>> itens(Map<String,Object> c){return(List<Map<String,Object>>)c.getOrDefault("itens",new ArrayList<>());}
  @SuppressWarnings("unchecked") private void evento(Map<String,Object> c,String titulo,String detalhe){List<Map<String,Object>> linha=(List<Map<String,Object>>)c.computeIfAbsent("linha",k->new ArrayList<>());linha.add(Map.of("q","agora","t",titulo,"d",detalhe,"a","Sistema"));}
  @SuppressWarnings("unchecked") private List<Long> ids(Map<String,Object> body,String campo){Object v=body.get(campo);if(!(v instanceof List<?> l))return List.of();return l.stream().map(x->x instanceof Number n?n.longValue():Long.parseLong(x.toString())).toList();}
  @SuppressWarnings("unchecked") private List<String> textos(Map<String,Object> body,String campo){Object v=body.get(campo);if(!(v instanceof List<?> l))return List.of();return l.stream().map(String::valueOf).filter(s->!s.isBlank()).toList();}
  @SuppressWarnings("unchecked") private Map<String,Object> ler(String v){try{return json.readValue(v,Map.class);}catch(JsonProcessingException e){throw new IllegalStateException(e);}}
  private String escrever(Object v){try{return json.writeValueAsString(v);}catch(JsonProcessingException e){throw new IllegalArgumentException(e);}}
}
