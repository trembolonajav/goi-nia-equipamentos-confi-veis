package br.com.locago.atendimento;

import com.fasterxml.jackson.core.JsonProcessingException;
import com.fasterxml.jackson.databind.ObjectMapper;
import org.springframework.jdbc.core.simple.JdbcClient;
import org.springframework.stereotype.Repository;
import java.util.List;
import java.util.Map;

@Repository
public class DocumentoRepository {
  private final JdbcClient jdbc; private final ObjectMapper json;
  public DocumentoRepository(JdbcClient jdbc, ObjectMapper json) { this.jdbc = jdbc; this.json = json; }

  public List<Map<String,Object>> clientes() { return listar("cliente_atendimento", "criado_em"); }
  public List<Map<String,Object>> pedidos() { return listar("pedido_atendimento", "criado_em"); }
  public List<Map<String,Object>> contratos() { return listar("contrato_atendimento", "criado_em"); }
  public Map<String,Object> salvarCliente(Map<String,Object> doc) { return salvar("cliente_atendimento", "id", doc); }
  public Map<String,Object> salvarPedido(Map<String,Object> doc) { return salvar("pedido_atendimento", "numero", doc); }

  private List<Map<String,Object>> listar(String tabela, String ordem) {
    return jdbc.sql("select dados::text from " + tabela + " order by " + ordem + " desc").query(String.class).list().stream().map(this::ler).toList();
  }
  private Map<String,Object> salvar(String tabela, String chave, Map<String,Object> doc) {
    Object valor = doc.get(chave.equals("numero") ? "num" : chave);
    if (valor == null || valor.toString().isBlank()) throw new IllegalArgumentException("Campo obrigatório ausente: " + chave);
    jdbc.sql("insert into " + tabela + " (" + chave + ", dados) values (:chave, cast(:dados as jsonb)) on conflict (" + chave + ") do update set dados=excluded.dados, atualizado_em=now()")
      .param("chave", valor.toString()).param("dados", escrever(doc)).update();
    return doc;
  }
  @SuppressWarnings("unchecked") private Map<String,Object> ler(String value) { try { return json.readValue(value, Map.class); } catch (JsonProcessingException e) { throw new IllegalStateException(e); } }
  private String escrever(Map<String,Object> value) { try { return json.writeValueAsString(value); } catch (JsonProcessingException e) { throw new IllegalArgumentException(e); } }
}
