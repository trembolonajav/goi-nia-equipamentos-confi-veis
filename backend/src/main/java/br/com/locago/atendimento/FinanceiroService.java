package br.com.locago.atendimento;

import org.springframework.http.HttpStatus;
import org.springframework.jdbc.core.simple.JdbcClient;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.server.ResponseStatusException;
import java.math.BigDecimal;
import java.time.LocalDate;
import java.util.LinkedHashMap;
import java.util.List;
import java.util.Map;

@Service
public class FinanceiroService {
  private final JdbcClient jdbc;
  public FinanceiroService(JdbcClient jdbc){this.jdbc=jdbc;}

  public List<Map<String,Object>> cobrancas(){
    String sql="select cb.id,cb.contrato_numero,cb.cliente_id,coalesce(cl.dados->>'nome',cb.cliente_id) cliente,cb.descricao,cb.vencimento,cb.valor,cb.recebido,(cb.valor-cb.recebido) saldo,case when cb.status<>'PAGA' and cb.vencimento<current_date then 'VENCIDA' else cb.status end status from cobranca_atendimento cb left join cliente_atendimento cl on cl.id=cb.cliente_id order by case when cb.status='PAGA' then 1 else 0 end,cb.vencimento";
    return jdbc.sql(sql).query((r,n)->{Map<String,Object>m=new LinkedHashMap<>();m.put("id",r.getLong("id"));m.put("contrato",r.getString("contrato_numero"));m.put("clienteId",r.getString("cliente_id"));m.put("cliente",r.getString("cliente"));m.put("descricao",r.getString("descricao"));m.put("vencimento",r.getDate("vencimento").toLocalDate().toString());m.put("valor",r.getBigDecimal("valor"));m.put("recebido",r.getBigDecimal("recebido"));m.put("saldo",r.getBigDecimal("saldo"));m.put("status",r.getString("status"));return m;}).list();
  }
  public List<Map<String,Object>> contas(){
    return jdbc.sql("select id,nome,tipo,saldo_inicial,ativo from conta_financeira where ativo order by nome").query((r,n)->Map.<String,Object>of("id",r.getLong("id"),"nome",r.getString("nome"),"tipo",r.getString("tipo"),"saldoInicial",r.getBigDecimal("saldo_inicial"),"ativo",r.getBoolean("ativo"))).list();
  }
  public List<Map<String,Object>> lancamentos(){
    return jdbc.sql("select l.id,l.tipo,l.descricao,l.categoria,l.conta_id,c.nome conta,l.vencimento,l.pagamento,l.valor,case when l.status='ABERTO' and l.vencimento<current_date then 'VENCIDO' else l.status end status,l.forma,l.origem,l.referencia,l.observacao from lancamento_financeiro l join conta_financeira c on c.id=l.conta_id order by l.vencimento desc,l.id desc").query((r,n)->{Map<String,Object>m=new LinkedHashMap<>();m.put("id",r.getLong("id"));m.put("tipo",r.getString("tipo"));m.put("descricao",r.getString("descricao"));m.put("categoria",r.getString("categoria"));m.put("contaId",r.getLong("conta_id"));m.put("conta",r.getString("conta"));m.put("vencimento",r.getDate("vencimento").toLocalDate().toString());var p=r.getDate("pagamento");m.put("pagamento",p==null?null:p.toLocalDate().toString());m.put("valor",r.getBigDecimal("valor"));m.put("status",r.getString("status"));m.put("forma",r.getString("forma"));m.put("origem",r.getString("origem"));m.put("referencia",r.getString("referencia"));m.put("observacao",r.getString("observacao"));return m;}).list();
  }
  public Map<String,Object> resumo(){
    return jdbc.sql("select coalesce(sum(case when status='PAGO' and tipo='ENTRADA' then valor when status='PAGO' and tipo='SAIDA' then -valor else 0 end),0) movimento,coalesce(sum(case when status='PAGO' and tipo='ENTRADA' then valor else 0 end),0) entradas,coalesce(sum(case when status='PAGO' and tipo='SAIDA' then valor else 0 end),0) saidas,coalesce(sum(case when status='ABERTO' and tipo='ENTRADA' then valor else 0 end),0) receber,coalesce(sum(case when status='ABERTO' and tipo='SAIDA' then valor else 0 end),0) pagar from lancamento_financeiro").query((r,n)->{BigDecimal inicial=jdbc.sql("select coalesce(sum(saldo_inicial),0) from conta_financeira where ativo").query(BigDecimal.class).single();return Map.<String,Object>of("saldo",inicial.add(r.getBigDecimal("movimento")),"entradas",r.getBigDecimal("entradas"),"saidas",r.getBigDecimal("saidas"),"aReceber",r.getBigDecimal("receber"),"aPagar",r.getBigDecimal("pagar"));}).single();
  }
  @Transactional public Map<String,Object> criarLancamento(Map<String,Object> b){
    String tipo=String.valueOf(b.getOrDefault("tipo","")).toUpperCase(),descricao=String.valueOf(b.getOrDefault("descricao","")).trim(),categoria=String.valueOf(b.getOrDefault("categoria","Outros")).trim();
    if(!tipo.equals("ENTRADA")&&!tipo.equals("SAIDA"))throw new ResponseStatusException(HttpStatus.BAD_REQUEST,"Tipo inválido");if(descricao.length()<3)throw new ResponseStatusException(HttpStatus.BAD_REQUEST,"Informe a descrição");
    BigDecimal valor=new BigDecimal(String.valueOf(b.getOrDefault("valor","0")));if(valor.signum()<=0)throw new ResponseStatusException(HttpStatus.BAD_REQUEST,"Informe um valor positivo");
    Object contaInformada=b.get("contaId");
    if(contaInformada==null||String.valueOf(contaInformada).isBlank())throw new ResponseStatusException(HttpStatus.BAD_REQUEST,"Selecione a conta financeira");
    long conta;
    try{conta=Long.parseLong(String.valueOf(contaInformada));}catch(NumberFormatException e){throw new ResponseStatusException(HttpStatus.BAD_REQUEST,"Selecione a conta financeira");}
    int contaAtiva=jdbc.sql("select count(*) from conta_financeira where id=:id and ativo").param("id",conta).query(Integer.class).single();
    if(contaAtiva!=1)throw new ResponseStatusException(HttpStatus.BAD_REQUEST,"Selecione uma conta financeira ativa");
    String status=String.valueOf(b.getOrDefault("status","ABERTO")).toUpperCase();LocalDate vencimento=LocalDate.parse(String.valueOf(b.getOrDefault("vencimento",LocalDate.now())));LocalDate pagamento="PAGO".equals(status)?LocalDate.parse(String.valueOf(b.getOrDefault("pagamento",LocalDate.now()))):null;
    Long id=jdbc.sql("insert into lancamento_financeiro(tipo,descricao,categoria,conta_id,vencimento,pagamento,valor,status,forma,observacao) values(:t,:d,:c,:conta,:v,:p,:valor,:s,:f,:o) returning id").param("t",tipo).param("d",descricao).param("c",categoria).param("conta",conta).param("v",vencimento).param("p",pagamento).param("valor",valor).param("s",status).param("f",String.valueOf(b.getOrDefault("forma","Pix"))).param("o",String.valueOf(b.getOrDefault("observacao",""))).query(Long.class).single();return porId(id);
  }
  @Transactional public Map<String,Object> baixar(long id,Map<String,Object>b){jdbc.sql("update lancamento_financeiro set status='PAGO',pagamento=:p,forma=:f,atualizado_em=now() where id=:id and status='ABERTO'").param("p",LocalDate.parse(String.valueOf(b.getOrDefault("pagamento",LocalDate.now())))).param("f",String.valueOf(b.getOrDefault("forma","Pix"))).param("id",id).update();return porId(id);}
  @Transactional public Map<String,Object> cancelar(long id){jdbc.sql("update lancamento_financeiro set status='CANCELADO',atualizado_em=now() where id=:id and status='ABERTO'").param("id",id).update();return porId(id);}
  private Map<String,Object> porId(long id){return lancamentos().stream().filter(x->((Number)x.get("id")).longValue()==id).findFirst().orElseThrow(()->new ResponseStatusException(HttpStatus.NOT_FOUND,"Lançamento não encontrado"));}
  @Transactional public Map<String,Object> receber(long id,Map<String,Object> body){
    BigDecimal valor=new BigDecimal(String.valueOf(body.getOrDefault("valor","0")));
    String forma=String.valueOf(body.getOrDefault("forma","Pix")).trim();
    LocalDate dataPagamento=LocalDate.parse(String.valueOf(body.getOrDefault("dataPagamento",LocalDate.now())));
    long contaId=Long.parseLong(String.valueOf(body.getOrDefault("contaId","0")));
    if(contaId<=0)throw new ResponseStatusException(HttpStatus.BAD_REQUEST,"Selecione a conta financeira");
    Integer contaExiste=jdbc.sql("select count(*) from conta_financeira where id=:id and ativo").param("id",contaId).query(Integer.class).single();
    if(contaExiste==0)throw new ResponseStatusException(HttpStatus.BAD_REQUEST,"Conta financeira inválida ou inativa");
    Map<String,Object>c=jdbc.sql("select valor,recebido,status from cobranca_atendimento where id=:id for update").param("id",id).query((r,n)->Map.<String,Object>of("valor",r.getBigDecimal("valor"),"recebido",r.getBigDecimal("recebido"),"status",r.getString("status"))).optional().orElseThrow(()->new ResponseStatusException(HttpStatus.NOT_FOUND,"Cobrança não encontrada"));
    BigDecimal saldo=((BigDecimal)c.get("valor")).subtract((BigDecimal)c.get("recebido"));
    if(valor.signum()<=0||valor.compareTo(saldo)>0)throw new ResponseStatusException(HttpStatus.BAD_REQUEST,"Valor deve ser positivo e não pode superar o saldo");
    jdbc.sql("insert into recebimento_atendimento(cobranca_id,valor,forma,conta_id,data_pagamento,observacao) values (:id,:v,:f,:c,:p,:o)").param("id",id).param("v",valor).param("f",forma).param("c",contaId).param("p",dataPagamento).param("o",String.valueOf(body.getOrDefault("observacao",""))).update();
    String status=valor.compareTo(saldo)==0?"PAGA":"PARCIAL";
    jdbc.sql("update cobranca_atendimento set recebido=recebido+:v,status=:s where id=:id").param("v",valor).param("s",status).param("id",id).update();
    Map<String,Object> dados=jdbc.sql("select contrato_numero,descricao from cobranca_atendimento where id=:id").param("id",id).query((r,n)->Map.<String,Object>of("contrato",r.getString("contrato_numero"),"descricao",r.getString("descricao"))).single();
    jdbc.sql("insert into lancamento_financeiro(tipo,descricao,categoria,conta_id,vencimento,pagamento,valor,status,forma,origem,referencia,observacao) values('ENTRADA',:d,'Locações',:c,:p,:p,:v,'PAGO',:f,'COBRANCA',:r,:o)").param("d",dados.get("descricao")).param("c",contaId).param("p",dataPagamento).param("v",valor).param("f",forma).param("r","CB-"+id+"-"+System.nanoTime()).param("o",String.valueOf(body.getOrDefault("observacao",""))).update();
    return cobrancas().stream().filter(x->x.get("id").equals(id)).findFirst().orElseThrow();
  }

  @Transactional public Map<String,Object> estornarRecebimento(long recebimentoId){
    Map<String,Object> recebimento=jdbc.sql("select id,cobranca_id,valor,forma,conta_id,data_pagamento,estornado_em from recebimento_atendimento where id=:id for update")
      .param("id",recebimentoId).query((r,n)->{Map<String,Object> m=new LinkedHashMap<>();m.put("cobrancaId",r.getLong("cobranca_id"));m.put("valor",r.getBigDecimal("valor"));m.put("forma",r.getString("forma"));m.put("contaId",r.getLong("conta_id"));m.put("data",r.getDate("data_pagamento").toLocalDate());m.put("estornado",r.getTimestamp("estornado_em")!=null);return m;})
      .optional().orElseThrow(()->new ResponseStatusException(HttpStatus.NOT_FOUND,"Recebimento não encontrado"));
    if(Boolean.TRUE.equals(recebimento.get("estornado")))throw new ResponseStatusException(HttpStatus.CONFLICT,"Recebimento já estornado");
    long cobrancaId=((Number)recebimento.get("cobrancaId")).longValue(); BigDecimal valor=(BigDecimal)recebimento.get("valor");
    Map<String,Object> cobranca=jdbc.sql("select descricao,recebido,valor from cobranca_atendimento where id=:id for update").param("id",cobrancaId)
      .query((r,n)->Map.<String,Object>of("descricao",r.getString("descricao"),"recebido",r.getBigDecimal("recebido"),"valor",r.getBigDecimal("valor"))).single();
    BigDecimal novoRecebido=((BigDecimal)cobranca.get("recebido")).subtract(valor);
    if(novoRecebido.signum()<0)throw new ResponseStatusException(HttpStatus.CONFLICT,"Recebimento incompatível com o saldo da cobrança");
    String status=novoRecebido.signum()==0?"ABERTA":novoRecebido.compareTo((BigDecimal)cobranca.get("valor"))<0?"PARCIAL":"PAGA";
    jdbc.sql("update recebimento_atendimento set estornado_em=now(),estornado_por='Sistema' where id=:id and estornado_em is null").param("id",recebimentoId).update();
    jdbc.sql("update cobranca_atendimento set recebido=:r,status=:s where id=:id").param("r",novoRecebido).param("s",status).param("id",cobrancaId).update();
    jdbc.sql("insert into lancamento_financeiro(tipo,descricao,categoria,conta_id,vencimento,pagamento,valor,status,forma,origem,referencia,observacao) values('SAIDA',:d,'Estornos',:c,:p,:p,:v,'PAGO',:f,'ESTORNO_RECEBIMENTO',:r,:o)")
      .param("d","Estorno - "+cobranca.get("descricao")).param("c",recebimento.get("contaId")).param("p",LocalDate.now()).param("v",valor).param("f",recebimento.get("forma")).param("r","REC-"+recebimentoId).param("o","Reversão do recebimento "+recebimentoId).update();
    return cobrancas().stream().filter(x->x.get("id").equals(cobrancaId)).findFirst().orElseThrow();
  }

  @Transactional public Map<String,Object> criarContaPagar(Map<String,Object> body){
    String fornecedor=String.valueOf(body.getOrDefault("fornecedor","")).trim(),descricao=String.valueOf(body.getOrDefault("descricao","")).trim(),categoria=String.valueOf(body.getOrDefault("categoria","Outros")).trim();
    BigDecimal valor=new BigDecimal(String.valueOf(body.getOrDefault("valor","0"))); LocalDate vencimento=LocalDate.parse(String.valueOf(body.getOrDefault("vencimento",LocalDate.now())));
    if(fornecedor.length()<2||descricao.length()<3||valor.signum()<=0)throw new ResponseStatusException(HttpStatus.BAD_REQUEST,"Informe fornecedor, descrição e valor positivo");
    Long id=jdbc.sql("insert into conta_pagar(fornecedor,descricao,categoria,vencimento,valor,saldo) values(:f,:d,:c,:v,:valor,:valor) returning id")
      .param("f",fornecedor).param("d",descricao).param("c",categoria).param("v",vencimento).param("valor",valor).query(Long.class).single();
    return contaPagar(id);
  }

  @Transactional public Map<String,Object> pagarConta(long id,Map<String,Object> body){
    Map<String,Object> conta=jdbc.sql("select id,descricao,vencimento,saldo,status from conta_pagar where id=:id for update").param("id",id)
      .query((r,n)->Map.<String,Object>of("descricao",r.getString("descricao"),"vencimento",r.getDate("vencimento").toLocalDate(),"saldo",r.getBigDecimal("saldo"),"status",r.getString("status"))).optional()
      .orElseThrow(()->new ResponseStatusException(HttpStatus.NOT_FOUND,"Conta a pagar não encontrada"));
    BigDecimal valor=new BigDecimal(String.valueOf(body.getOrDefault("valor",conta.get("saldo")))); BigDecimal saldo=(BigDecimal)conta.get("saldo");
    long contaId=Long.parseLong(String.valueOf(body.getOrDefault("contaId","0"))); LocalDate pagamento=LocalDate.parse(String.valueOf(body.getOrDefault("dataPagamento",LocalDate.now()))); String forma=String.valueOf(body.getOrDefault("forma","Pix"));
    if(!"ABERTA".equals(conta.get("status"))&& !"PARCIAL".equals(conta.get("status")))throw new ResponseStatusException(HttpStatus.CONFLICT,"Conta não está aberta para pagamento");
    if(valor.signum()<=0||valor.compareTo(saldo)>0)throw new ResponseStatusException(HttpStatus.BAD_REQUEST,"Valor deve ser positivo e não pode superar o saldo");
    Integer contaExiste=jdbc.sql("select count(*) from conta_financeira where id=:id and ativo").param("id",contaId).query(Integer.class).single(); if(contaExiste==0)throw new ResponseStatusException(HttpStatus.BAD_REQUEST,"Conta financeira inválida ou inativa");
    Long lancamento=jdbc.sql("insert into lancamento_financeiro(tipo,descricao,categoria,conta_id,vencimento,pagamento,valor,status,forma,origem,referencia) values('SAIDA',:d,'Contas a pagar',:c,:v,:p,:valor,'PAGO',:f,'CONTA_PAGAR',:r) returning id")
      .param("d",conta.get("descricao")).param("c",contaId).param("v",conta.get("vencimento")).param("p",pagamento).param("valor",valor).param("f",forma).param("r","CP-"+id+"-"+System.nanoTime()).query(Long.class).single();
    jdbc.sql("insert into pagamento_conta(conta_pagar_id,lancamento_id,valor) values(:cp,:l,:v)").param("cp",id).param("l",lancamento).param("v",valor).update();
    BigDecimal novo=saldo.subtract(valor); jdbc.sql("update conta_pagar set saldo=:s,status=:st where id=:id").param("s",novo).param("st",novo.signum()==0?"PAGA":"PARCIAL").param("id",id).update();
    return contaPagar(id);
  }

  private Map<String,Object> contaPagar(long id){return jdbc.sql("select id,fornecedor,descricao,categoria,vencimento,valor,saldo,status from conta_pagar where id=:id").param("id",id).query().listOfRows().stream().findFirst().orElseThrow(()->new ResponseStatusException(HttpStatus.NOT_FOUND,"Conta a pagar não encontrada"));}
}
