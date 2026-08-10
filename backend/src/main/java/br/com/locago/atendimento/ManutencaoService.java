package br.com.locago.atendimento;

import com.fasterxml.jackson.core.JsonProcessingException;
import com.fasterxml.jackson.databind.ObjectMapper;
import org.springframework.http.HttpStatus;
import org.springframework.jdbc.core.simple.JdbcClient;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.server.ResponseStatusException;
import java.util.ArrayList;
import java.util.LinkedHashMap;
import java.util.List;
import java.util.Map;

@Service
public class ManutencaoService {
  private final JdbcClient jdbc; private final ObjectMapper json;
  public ManutencaoService(JdbcClient jdbc,ObjectMapper json){this.jdbc=jdbc;this.json=json;}

  public List<Map<String,Object>> listar(){
    return jdbc.sql("""
      select m.id,m.patrimonio_codigo,p.nome produto,m.contrato_numero,m.motivo,m.status,m.criado_em,m.concluido_em
      from manutencao_atendimento m join patrimonio_atendimento pa on pa.codigo=m.patrimonio_codigo
      join produto_atendimento p on p.id=pa.produto_id order by case when m.status='ABERTA' then 0 else 1 end,m.criado_em desc
      """).query((rs,n)->{
        Map<String,Object> r=new LinkedHashMap<>(); r.put("id",rs.getLong("id"));r.put("patrimonio",rs.getString("patrimonio_codigo"));r.put("produto",rs.getString("produto"));
        r.put("contrato",rs.getString("contrato_numero"));r.put("motivo",rs.getString("motivo"));r.put("status",rs.getString("status"));r.put("criadoEm",rs.getTimestamp("criado_em").toInstant().toString());
        var fim=rs.getTimestamp("concluido_em");r.put("concluidoEm",fim==null?null:fim.toInstant().toString());return r;
      }).list();
  }

  @Transactional public Map<String,Object> abrir(Map<String,Object> body){
    String patrimonio=String.valueOf(body.getOrDefault("patrimonio","")).trim(),motivo=String.valueOf(body.getOrDefault("motivo","")).trim();
    if(patrimonio.isBlank()||motivo.length()<10)throw new IllegalArgumentException("Informe patrimônio e motivo detalhado");
    String estado=jdbc.sql("select estado from patrimonio_atendimento where codigo=:p for update").param("p",patrimonio).query(String.class).optional().orElseThrow(()->new IllegalArgumentException("Patrimônio não encontrado"));
    if("LOCADO".equals(estado)||"RESERVADO".equals(estado))throw new IllegalArgumentException("Patrimônio locado ou reservado não pode entrar em manutenção manual");
    Long id=jdbc.sql("insert into manutencao_atendimento(patrimonio_codigo,contrato_numero,motivo,tipo,prioridade,fornecedor,previsao,custo_estimado) values(:p,null,:m,:t,:pr,:f,cast(nullif(:pv,'') as date),:c) returning id").param("p",patrimonio).param("m",motivo).param("t",String.valueOf(body.getOrDefault("tipo","CORRETIVA"))).param("pr",String.valueOf(body.getOrDefault("prioridade","NORMAL"))).param("f",String.valueOf(body.getOrDefault("fornecedor",""))).param("pv",String.valueOf(body.getOrDefault("previsao",""))).param("c",new java.math.BigDecimal(String.valueOf(body.getOrDefault("custoEstimado","0")))).query(Long.class).single();
    jdbc.sql("update patrimonio_atendimento set estado='MANUTENCAO',contrato_numero=null,atualizado_em=now() where codigo=:p").param("p",patrimonio).update();return listar().stream().filter(x->x.get("id").equals(id)).findFirst().orElseThrow();
  }

  @Transactional public Map<String,Object> concluir(long id,String observacao){
    Map<String,Object> manutencao=jdbc.sql("select id,patrimonio_codigo,contrato_numero,motivo,status from manutencao_atendimento where id=:id for update").param("id",id)
      .query((rs,n)->{Map<String,Object> m=new LinkedHashMap<>();m.put("id",rs.getLong("id"));m.put("patrimonio",rs.getString("patrimonio_codigo"));m.put("contrato",rs.getString("contrato_numero"));m.put("motivo",rs.getString("motivo"));m.put("status",rs.getString("status"));return m;}).optional()
      .orElseThrow(()->new ResponseStatusException(HttpStatus.NOT_FOUND,"Manutenção não encontrada"));
    if(!"ABERTA".equals(manutencao.get("status"))) throw new ResponseStatusException(HttpStatus.CONFLICT,"Manutenção já foi concluída");
    String patrimonio=manutencao.get("patrimonio").toString();String contrato=(String)manutencao.get("contrato");
    jdbc.sql("update manutencao_atendimento set status='CONCLUIDA',concluido_em=now(),motivo=case when :o='' then motivo else motivo||E'\\nConclusão: '||:o end where id=:id").param("o",observacao==null?"":observacao).param("id",id).update();
    jdbc.sql("update patrimonio_atendimento set estado='DISPONIVEL',contrato_numero=null,atualizado_em=now() where codigo=:p and estado='MANUTENCAO'").param("p",patrimonio).update();
    if(contrato!=null&&!contrato.isBlank()) adicionarEvento(contrato,"Manutenção concluída",patrimonio+" testado e liberado para novas locações");
    return listar().stream().filter(m->m.get("id").equals(id)).findFirst().orElseThrow();
  }

  @SuppressWarnings("unchecked") private void adicionarEvento(String numero,String titulo,String detalhe){
    String raw=jdbc.sql("select dados::text from contrato_atendimento where numero=:n for update").param("n",numero).query(String.class).optional().orElse(null);if(raw==null)return;
    try{Map<String,Object> c=json.readValue(raw,Map.class);List<Map<String,Object>> linha=(List<Map<String,Object>>)c.computeIfAbsent("linha",k->new ArrayList<>());linha.add(Map.of("q","agora","t",titulo,"d",detalhe,"a","Sistema"));jdbc.sql("update contrato_atendimento set dados=cast(:d as jsonb),atualizado_em=now() where numero=:n").param("d",json.writeValueAsString(c)).param("n",numero).update();}catch(JsonProcessingException e){throw new IllegalStateException(e);}
  }
}
