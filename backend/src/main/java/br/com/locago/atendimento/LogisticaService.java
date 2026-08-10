package br.com.locago.atendimento;

import org.springframework.jdbc.core.simple.JdbcClient;
import org.springframework.stereotype.Service;
import java.util.LinkedHashMap;
import java.util.List;
import java.util.Map;

@Service
public class LogisticaService {
  private final JdbcClient jdbc;
  public LogisticaService(JdbcClient jdbc){this.jdbc=jdbc;}
  public List<Map<String,Object>> agenda(){return jdbc.sql("""
    select t.id,t.contrato_numero,t.cliente_id,coalesce(c.dados->>'nome',t.cliente_id) cliente,t.tipo,t.data_prevista,t.hora_prevista,t.destino,t.endereco,t.status,t.concluido_em
    from tarefa_logistica t left join cliente_atendimento c on c.id=t.cliente_id
    order by case when t.status='PENDENTE' then 0 else 1 end,t.data_prevista,t.hora_prevista
    """).query((rs,n)->{Map<String,Object>m=new LinkedHashMap<>();m.put("id",rs.getLong("id"));m.put("contrato",rs.getString("contrato_numero"));m.put("clienteId",rs.getString("cliente_id"));m.put("cliente",rs.getString("cliente"));m.put("tipo",rs.getString("tipo"));m.put("data",rs.getDate("data_prevista").toLocalDate().toString());m.put("hora",rs.getTime("hora_prevista").toLocalTime().toString());m.put("destino",rs.getString("destino"));m.put("endereco",rs.getString("endereco"));m.put("status",rs.getString("status"));return m;}).list();}
  public List<Map<String,Object>> obras(){return jdbc.sql("""
    select distinct on (dados->>'clienteId',dados->>'local') dados->>'clienteId' cliente_id,dados->>'local' nome,dados->>'endereco' endereco,coalesce((dados->>'frete')::numeric,0) frete
    from contrato_atendimento where coalesce(dados->>'local','')<>'' and dados->>'local'<>'Retirada na loja' order by dados->>'clienteId',dados->>'local',criado_em desc
    """).query((rs,n)->{Map<String,Object>m=new LinkedHashMap<>();String id=rs.getString("cliente_id");m.put("clienteId",id);m.put("cliente",jdbc.sql("select coalesce((select dados->>'nome' from cliente_atendimento where id=:id),:id)").param("id",id).query(String.class).single());m.put("nome",rs.getString("nome"));m.put("endereco",rs.getString("endereco"));m.put("restricao","Consulte as observações do contrato");m.put("frete",rs.getBigDecimal("frete"));m.put("situacao","Ativa");return m;}).list();}
}
