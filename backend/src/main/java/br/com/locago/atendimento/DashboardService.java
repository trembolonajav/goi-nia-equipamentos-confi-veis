package br.com.locago.atendimento;

import org.springframework.jdbc.core.simple.JdbcClient;
import org.springframework.stereotype.Service;
import java.math.BigDecimal;
import java.util.LinkedHashMap;
import java.util.List;
import java.util.Map;

@Service
public class DashboardService {
  private static final String HOJE="(current_timestamp at time zone 'America/Sao_Paulo')::date";
  private final JdbcClient jdbc;
  public DashboardService(JdbcClient jdbc){this.jdbc=jdbc;}

  public Map<String,Object> resumo(){
    Map<String,Object> indicadores=jdbc.sql("""
      select
        count(*) filter(where tipo='ENTREGA' and status='PENDENTE' and data_prevista<=%1$s) entregas_pendentes,
        count(*) filter(where tipo='COLETA' and status='PENDENTE' and data_prevista=%1$s) devolucoes_previstas,
        count(*) filter(where tipo='COLETA' and status='PENDENTE' and data_prevista<%1$s) devolucoes_atrasadas
      from tarefa_logistica
      """.formatted(HOJE)).query((r,n)->Map.<String,Object>of(
        "entregasPendentes",r.getInt("entregas_pendentes"),
        "devolucoesPrevistas",r.getInt("devolucoes_previstas"),
        "devolucoesAtrasadas",r.getInt("devolucoes_atrasadas")
      )).single();
    Map<String,Object> cobrancas=jdbc.sql("""
      select
        count(*) filter(where vencimento=%1$s) vencendo_hoje,
        count(*) filter(where vencimento<%1$s) vencidas,
        coalesce(sum(greatest(valor-recebido,0)) filter(where vencimento=%1$s),0) receber_hoje,
        coalesce(sum(greatest(valor-recebido,0)) filter(where vencimento<%1$s),0) valor_vencido
      from cobranca_atendimento where cancelada_em is null and status<>'PAGA'
      """.formatted(HOJE)).query((r,n)->Map.<String,Object>of(
        "cobrancasVencendoHoje",r.getInt("vencendo_hoje"),"cobrancasVencidas",r.getInt("vencidas"),
        "aReceberHoje",r.getBigDecimal("receber_hoje"),"valorVencido",r.getBigDecimal("valor_vencido")
      )).single();
    int manutencoes=jdbc.sql("select count(*) from manutencao_atendimento where status='ABERTA'").query(Integer.class).single();
    BigDecimal pagarHoje=jdbc.sql("select coalesce(sum(saldo),0) from conta_pagar where cancelada_em is null and status<>'PAGA' and vencimento="+HOJE).query(BigDecimal.class).single();
    BigDecimal saldo=jdbc.sql("""
      select coalesce((select sum(saldo_inicial) from conta_financeira where ativo),0)+
        coalesce(sum(case when tipo='ENTRADA' then valor when tipo='SAIDA' then -valor else 0 end),0)
      from lancamento_financeiro where status='PAGO'
      """).query(BigDecimal.class).single();
    List<Map<String,Object>> acoes=jdbc.sql("""
      select t.id,t.contrato_numero,t.tipo,t.data_prevista,t.hora_prevista,t.destino,
             coalesce(c.nome_razao_social,c.dados->>'nome',t.cliente_id) cliente
      from tarefa_logistica t left join cliente_atendimento c on c.id=t.cliente_id
      where t.status='PENDENTE' and t.data_prevista<=%s
      order by t.data_prevista,t.hora_prevista,t.id limit 8
      """.formatted(HOJE)).query((r,n)->{Map<String,Object> m=new LinkedHashMap<>();m.put("id",r.getLong("id"));m.put("contrato",r.getString("contrato_numero"));m.put("tipo",r.getString("tipo"));m.put("data",r.getDate("data_prevista").toLocalDate().toString());m.put("hora",r.getTime("hora_prevista").toLocalTime().toString());m.put("destino",r.getString("destino"));m.put("cliente",r.getString("cliente"));return m;}).list();
    Map<String,Object> resultado=new LinkedHashMap<>(indicadores);resultado.putAll(cobrancas);resultado.put("manutencoesAbertas",manutencoes);resultado.put("aPagarHoje",pagarHoje);resultado.put("saldoRealizado",saldo);resultado.put("proximasAcoes",acoes);return resultado;
  }
}
