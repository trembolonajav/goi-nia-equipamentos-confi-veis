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
  public OperacaoContratoService(JdbcClient jdbc, ObjectMapper json) { this.jdbc=jdbc; this.json=json; }

  @Transactional public Map<String,Object> expedir(String numero) {
    Map<String,Object> contrato = carregar(numero);
    if (!"Aguardando pagamento".equals(contrato.get("situacao"))) throw new ResponseStatusException(HttpStatus.CONFLICT,"Contrato não está aguardando expedição");
    exigirDocumento(numero,"Contrato assinado"); exigirDocumento(numero,"Comprovante de entrega assinado");
    for (Map<String,Object> item : itens(contrato)) {
      String produto=item.get("prod").toString(); int qtd=numero(item.getOrDefault("qtd",1));
      int controlados=jdbc.sql("select count(*) from patrimonio_atendimento where produto_id=:p").param("p",produto).query(Integer.class).single();
      if(controlados>0) {
        List<String> codigos=jdbc.sql("select codigo from patrimonio_atendimento where produto_id=:p and estado='DISPONIVEL' order by codigo for update skip locked limit :q")
          .param("p",produto).param("q",qtd).query(String.class).list();
        if(codigos.size()<qtd) throw new ResponseStatusException(HttpStatus.CONFLICT,"Patrimônio disponível insuficiente para "+produto);
        for(String codigo:codigos) jdbc.sql("update patrimonio_atendimento set estado='LOCADO',contrato_numero=:c,atualizado_em=now() where codigo=:codigo").param("c",numero).param("codigo",codigo).update();
        item.put("patrimonio",String.join(" · ",codigos));
      } else item.put("patrimonio","controle por quantidade · "+qtd+" un.");
      item.put("estado","Locado");
    }
    contrato.put("situacao","Em andamento");
    jdbc.sql("update tarefa_logistica set status='CONCLUIDA',concluido_em=now() where contrato_numero=:c and tipo='ENTREGA' and status='PENDENTE'").param("c",numero).update();
    jdbc.sql("update caucao_atendimento set status='RETIDA',atualizado_em=now() where contrato_numero=:c and status='PENDENTE'").param("c",numero).update();
    if("Pix pendente".equals(contrato.get("pagamento"))) contrato.put("pagamento","Pago");
    evento(contrato,"Expedição concluída","Patrimônios vinculados e equipamentos entregues");
    salvar(numero,contrato); return contrato;
  }

  @Transactional public Map<String,Object> devolver(String numero) {
    Map<String,Object> contrato=carregar(numero);
    if(!"Em andamento".equals(contrato.get("situacao"))) throw new ResponseStatusException(HttpStatus.CONFLICT,"Contrato não está em andamento");
    exigirDocumento(numero,"Comprovante de devolução assinado");
    jdbc.sql("update patrimonio_atendimento set estado='EM_INSPECAO',atualizado_em=now() where contrato_numero=:c").param("c",numero).update();
    jdbc.sql("update reserva_atendimento set status='ENCERRADA' where contrato_numero=:c and status='ATIVA'").param("c",numero).update();
    jdbc.sql("update tarefa_logistica set status='CONCLUIDA',concluido_em=now() where contrato_numero=:c and tipo='COLETA' and status='PENDENTE'").param("c",numero).update();
    for(Map<String,Object> item:itens(contrato)) item.put("estado","Em inspeção");
    contrato.put("situacao","Em inspeção"); evento(contrato,"Devolução recebida","Reserva liberada e equipamentos enviados para inspeção");
    salvar(numero,contrato); return contrato;
  }

  @Transactional public Map<String,Object> inspecionar(String numero, String resultado, String observacao) {
    Map<String,Object> contrato=carregar(numero);
    if(!"Em inspeção".equals(contrato.get("situacao"))) throw new ResponseStatusException(HttpStatus.CONFLICT,"Contrato não está em inspeção");
    boolean aprovado="APROVADO".equalsIgnoreCase(resultado);
    if(!aprovado && !"MANUTENCAO".equalsIgnoreCase(resultado)) throw new ResponseStatusException(HttpStatus.BAD_REQUEST,"Resultado deve ser APROVADO ou MANUTENCAO");
    List<String> patrimonios=jdbc.sql("select codigo from patrimonio_atendimento where contrato_numero=:c and estado='EM_INSPECAO' order by codigo for update").param("c",numero).query(String.class).list();
    if(aprovado) {
      jdbc.sql("update patrimonio_atendimento set estado='DISPONIVEL',contrato_numero=null,atualizado_em=now() where contrato_numero=:c and estado='EM_INSPECAO'").param("c",numero).update();
      contrato.put("situacao","Encerrado"); contrato.put("caucaoSit","Liberada após inspeção");
      jdbc.sql("update caucao_atendimento set status='LIBERADA',atualizado_em=now() where contrato_numero=:c").param("c",numero).update();
      for(Map<String,Object> item:itens(contrato)) item.put("estado","Encerrado");
      evento(contrato,"Inspeção aprovada","Patrimônios liberados para novas locações e contrato encerrado");
    } else {
      String motivo=observacao==null||observacao.isBlank()?"Avaria identificada na inspeção de devolução":observacao;
      jdbc.sql("update patrimonio_atendimento set estado='MANUTENCAO',contrato_numero=null,atualizado_em=now() where contrato_numero=:c and estado='EM_INSPECAO'").param("c",numero).update();
      for(String codigo:patrimonios) jdbc.sql("insert into manutencao_atendimento(patrimonio_codigo,contrato_numero,motivo) values (:p,:c,:m)").param("p",codigo).param("c",numero).param("m",motivo).update();
      contrato.put("situacao","Encerrado com ocorrência"); contrato.put("caucaoSit","Retida para análise da ocorrência");
      jdbc.sql("update caucao_atendimento set status='EM_ANALISE',atualizado_em=now() where contrato_numero=:c").param("c",numero).update();
      for(Map<String,Object> item:itens(contrato)) item.put("estado","Em manutenção");
      evento(contrato,"Ocorrência na inspeção",motivo+". Ordem de manutenção aberta.");
    }
    jdbc.sql("insert into inspecao_atendimento(contrato_numero,resultado,observacao) values (:c,:r,:o)").param("c",numero).param("r",aprovado?"APROVADO":"MANUTENCAO").param("o",observacao==null?"":observacao).update();
    salvar(numero,contrato); return contrato;
  }

  private Map<String,Object> carregar(String numero) { String dados=jdbc.sql("select dados::text from contrato_atendimento where numero=:n for update").param("n",numero).query(String.class).optional().orElseThrow(()->new ResponseStatusException(HttpStatus.NOT_FOUND,"Contrato não encontrado")); return ler(dados); }
  private void exigirDocumento(String numero,String tipo){int n=jdbc.sql("select count(*) from documento_contrato where contrato_numero=:c and tipo=:t").param("c",numero).param("t",tipo).query(Integer.class).single();if(n==0)throw new ResponseStatusException(HttpStatus.CONFLICT,"Anexe primeiro: "+tipo);}
  private void salvar(String numero,Map<String,Object> contrato) { jdbc.sql("update contrato_atendimento set dados=cast(:d as jsonb),atualizado_em=now() where numero=:n").param("d",escrever(contrato)).param("n",numero).update(); }
  @SuppressWarnings("unchecked") private List<Map<String,Object>> itens(Map<String,Object> c) { return (List<Map<String,Object>>)c.getOrDefault("itens",new ArrayList<>()); }
  @SuppressWarnings("unchecked") private void evento(Map<String,Object> c,String titulo,String detalhe) { List<Map<String,Object>> linha=(List<Map<String,Object>>)c.computeIfAbsent("linha",k->new ArrayList<>()); linha.add(Map.of("q","agora","t",titulo,"d",detalhe,"a","Sistema")); }
  @SuppressWarnings("unchecked") private Map<String,Object> ler(String v) { try{return json.readValue(v,Map.class);}catch(JsonProcessingException e){throw new IllegalStateException(e);} }
  private String escrever(Object v){try{return json.writeValueAsString(v);}catch(JsonProcessingException e){throw new IllegalArgumentException(e);} }
  private int numero(Object v){return v instanceof Number n?n.intValue():Integer.parseInt(v.toString());}
}
