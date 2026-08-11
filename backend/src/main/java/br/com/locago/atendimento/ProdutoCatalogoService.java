package br.com.locago.atendimento;

import com.fasterxml.jackson.databind.ObjectMapper;
import java.math.BigDecimal;
import java.util.LinkedHashMap;
import java.util.List;
import java.util.Locale;
import java.util.Map;
import java.util.NoSuchElementException;
import org.springframework.jdbc.core.simple.JdbcClient;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
public class ProdutoCatalogoService {
  private final JdbcClient jdbc;
  private final ObjectMapper json;

  public ProdutoCatalogoService(JdbcClient jdbc, ObjectMapper json) {
    this.jdbc = jdbc;
    this.json = json;
  }

  public List<Map<String, Object>> listar() {
    return jdbc.sql(produtoSql() + " where p.ativo order by p.nome")
      .query((rs, row) -> produto(rs.getString("dados"), rs.getString("id"), rs.getString("nome"),
        rs.getString("categoria"), rs.getString("prefixo"), rs.getString("marca"), rs.getString("modelo"),
        rs.getString("descricao"), rs.getString("unidade_locacao"), rs.getBigDecimal("valor_diaria"),
        rs.getBigDecimal("valor_semanal"), rs.getBigDecimal("valor_quinzenal"), rs.getBigDecimal("valor_mensal"), rs.getBoolean("ativo"))).list();
  }

  public List<Map<String, Object>> categorias() {
    return jdbc.sql("select id,nome,prefixo from categoria_produto where ativo order by nome")
      .query((rs, row) -> Map.<String, Object>of("id", rs.getLong("id"), "nome", rs.getString("nome"), "prefixo", rs.getString("prefixo"))).list();
  }

  public List<Map<String, Object>> patrimonios(String produto) {
    return jdbc.sql("""
      select codigo,coalesce(serie,'') serie,estado,localizacao,data_aquisicao,valor_aquisicao,observacao
      from patrimonio_atendimento where produto_id=:produto order by codigo
      """).param("produto", produto).query((rs, row) -> {
        Map<String, Object> item = new LinkedHashMap<>();
        item.put("cod", rs.getString("codigo"));
        item.put("serie", rs.getString("serie"));
        item.put("estado", rs.getString("estado"));
        item.put("prod", produto);
        item.put("local", rs.getString("localizacao"));
        item.put("horimetro", "0 h");
        item.put("proxima", "Sem programação");
        if (rs.getDate("data_aquisicao") != null) item.put("dataAquisicao", rs.getDate("data_aquisicao").toLocalDate().toString());
        if (rs.getBigDecimal("valor_aquisicao") != null) item.put("valorAquisicao", rs.getBigDecimal("valor_aquisicao"));
        if (rs.getString("observacao") != null) item.put("observacao", rs.getString("observacao"));
        return item;
      }).list();
  }

  public List<Map<String, Object>> patrimonios() {
    return jdbc.sql("""
      select pa.codigo,pa.produto_id,pa.serie,pa.estado,pa.localizacao,p.nome
      from patrimonio_atendimento pa join produto_catalogo p on p.id=pa.produto_id
      order by p.nome,pa.codigo
      """).query((rs, row) -> {
        Map<String, Object> item = new LinkedHashMap<>();
        item.put("codigo", rs.getString("codigo")); item.put("produtoId", rs.getString("produto_id"));
        item.put("produto", rs.getString("nome")); item.put("serie", rs.getString("serie"));
        item.put("estado", rs.getString("estado")); item.put("local", rs.getString("localizacao"));
        return item;
      }).list();
  }

  public Map<String, Object> categoria(Map<String, Object> corpo) {
    String nome = texto(corpo, "nome");
    String prefixo = texto(corpo, "prefixo").toUpperCase(Locale.ROOT).replaceAll("[^A-Z]", "");
    if (nome.length() < 3 || prefixo.length() < 2) throw new IllegalArgumentException("Informe nome e prefixo da categoria");
    Long id = jdbc.sql("insert into categoria_produto(nome,prefixo) values(:nome,:prefixo) returning id")
      .param("nome", nome).param("prefixo", prefixo).query(Long.class).single();
    return Map.of("id", id, "nome", nome, "prefixo", prefixo);
  }

  public Map<String, Object> buscar(String id) {
    return jdbc.sql(produtoSql() + " where p.id=:id")
      .param("id", id).query((rs, row) -> produto(rs.getString("dados"), rs.getString("id"), rs.getString("nome"),
        rs.getString("categoria"), rs.getString("prefixo"), rs.getString("marca"), rs.getString("modelo"),
        rs.getString("descricao"), rs.getString("unidade_locacao"), rs.getBigDecimal("valor_diaria"),
        rs.getBigDecimal("valor_semanal"), rs.getBigDecimal("valor_quinzenal"), rs.getBigDecimal("valor_mensal"), rs.getBoolean("ativo")))
      .optional().orElseThrow(() -> new NoSuchElementException("Produto não encontrado"));
  }

  @Transactional
  public Map<String, Object> salvar(Map<String, Object> produto) {
    String nome = texto(produto, "nome");
    String categoriaNome = texto(produto, "categoria");
    String marca = texto(produto, "marca");
    String modelo = texto(produto, "modelo");
    if (nome.length() < 3 || categoriaNome.length() < 3 || marca.length() < 2 || modelo.isBlank())
      throw new IllegalArgumentException("Informe nome, categoria, marca e modelo");

    Map<String, Object> categoria = jdbc.sql("select id,prefixo from categoria_produto where lower(nome)=lower(:nome) and ativo")
      .param("nome", categoriaNome).query((rs, row) -> Map.<String, Object>of("id", rs.getLong("id"), "prefixo", rs.getString("prefixo")))
      .optional().orElseThrow(() -> new IllegalArgumentException("Categoria não encontrada"));

    BigDecimal diaria = numero(produto, "diaria"), semanal = numero(produto, "semanal");
    BigDecimal quinzenal = numero(produto, "quinzenal"), mensal = numero(produto, "mensal");
    if (List.of(diaria, semanal, quinzenal, mensal).stream().anyMatch(valor -> valor.signum() < 0))
      throw new IllegalArgumentException("Valores não podem ser negativos");

    String prefixo = categoria.get("prefixo").toString();
    jdbc.sql("select 1 from (select pg_advisory_xact_lock(hashtext(:chave))) bloqueio")
        .param("chave", "produto:" + prefixo)
        .query(Integer.class)
        .single();
    String id = proximoCodigo(prefixo);
    produto.put("id", id);
    produto.put("codigo", id);
    produto.put("prefixo", categoria.get("prefixo"));
    produto.put("controle", "patrimonio");
    produto.put("unidadeLocacao", texto(produto, "unidadeLocacao").isBlank() ? "UNIDADE" : texto(produto, "unidadeLocacao"));

    try {
      jdbc.sql("""
        insert into produto_catalogo(id,dados,codigo,nome,categoria_id,marca,modelo,descricao,unidade_locacao,
          valor_diaria,valor_semanal,valor_quinzenal,valor_mensal,ativo)
        values(:id,cast(:dados as jsonb),:codigo,:nome,:categoria,:marca,:modelo,:descricao,:unidade,
          :diaria,:semanal,:quinzenal,:mensal,true)
        """).param("id", id).param("dados", json.writeValueAsString(produto)).param("codigo", id)
        .param("nome", nome).param("categoria", categoria.get("id")).param("marca", marca).param("modelo", modelo)
        .param("descricao", nulo(texto(produto, "descricao"))).param("unidade", produto.get("unidadeLocacao"))
        .param("diaria", diaria).param("semanal", semanal).param("quinzenal", quinzenal).param("mensal", mensal).update();

      int quantidade = Math.max(1, numero(produto, "unidades").intValue());
      jdbc.sql("insert into produto_atendimento(id,nome,capacidade) values(:id,:nome,:qtd) on conflict(id) do update set nome=excluded.nome,capacidade=greatest(produto_atendimento.capacidade,excluded.capacidade)")
        .param("id", id).param("nome", nome).param("qtd", quantidade).update();
      criarPatrimonios(id, prefixo, quantidade);
      return buscar(id);
    } catch (IllegalArgumentException e) {
      throw e;
    } catch (Exception e) {
      throw new IllegalArgumentException("Já existe um produto com esse nome ou código", e);
    }
  }

  private void criarPatrimonios(String produtoId, String prefixo, int desejado) {
    int existentes = jdbc.sql("select count(*) from patrimonio_atendimento where produto_id=:id")
      .param("id", produtoId).query(Integer.class).single();
    int sequencia = jdbc.sql("select coalesce(max(nullif(regexp_replace(codigo,'[^0-9]','','g'),'')::int),0) from patrimonio_atendimento where codigo like :prefixo")
      .param("prefixo", prefixo + "-%").query(Integer.class).single();
    for (int i = existentes; i < desejado; i++) {
      String codigo = prefixo + "-" + String.format("%04d", ++sequencia);
      jdbc.sql("insert into patrimonio_atendimento(codigo,produto_id,serie,localizacao) values(:codigo,:produto,'A informar',null)")
        .param("codigo", codigo).param("produto", produtoId).update();
    }
  }

  private String proximoCodigo(String prefixo) {
    int proximo = jdbc.sql("select coalesce(max(nullif(regexp_replace(id,'[^0-9]','','g'),'')::int),0)+1 from produto_catalogo where id like :prefixo")
      .param("prefixo", prefixo + "%").query(Integer.class).single();
    return prefixo + String.format("%03d", proximo);
  }

  private String produtoSql() {
    return """
      select p.id,p.dados::text,p.nome,c.nome categoria,c.prefixo,p.marca,p.modelo,p.descricao,
             p.unidade_locacao,p.valor_diaria,p.valor_semanal,p.valor_quinzenal,p.valor_mensal,p.ativo
      from produto_catalogo p join categoria_produto c on c.id=p.categoria_id
      """;
  }

  private Map<String, Object> produto(String legado, String id, String nome, String categoria, String prefixo,
      String marca, String modelo, String descricao, String unidade, BigDecimal diaria, BigDecimal semanal,
      BigDecimal quinzenal, BigDecimal mensal, boolean ativo) {
    Map<String, Object> resultado = new LinkedHashMap<>(ler(legado));
    resultado.put("id", id); resultado.put("codigo", id); resultado.put("nome", nome);
    resultado.put("categoria", categoria); resultado.put("prefixo", prefixo);
    resultado.put("marca", marca); resultado.put("modelo", modelo);
    resultado.put("descricao", descricao == null ? "" : descricao);
    resultado.put("unidadeLocacao", unidade); resultado.put("diaria", diaria);
    resultado.put("semanal", semanal); resultado.put("quinzenal", quinzenal);
    resultado.put("mensal", mensal); resultado.put("controle", "patrimonio"); resultado.put("ativo", ativo);
    int unidades = jdbc.sql("select count(*) from patrimonio_atendimento where produto_id=:id")
      .param("id", id).query(Integer.class).single();
    resultado.put("unidades", unidades);
    return resultado;
  }

  private BigDecimal numero(Map<String, Object> produto, String chave) {
    try {
      Object valor = produto.get(chave);
      return valor == null || valor.toString().isBlank() ? BigDecimal.ZERO : new BigDecimal(valor.toString().replace(',', '.'));
    } catch (Exception e) { throw new IllegalArgumentException("Valor inválido: " + chave); }
  }

  private String texto(Map<String, Object> produto, String chave) {
    Object valor = produto.get(chave);
    return valor == null ? "" : valor.toString().trim();
  }

  private String nulo(String valor) { return valor == null || valor.isBlank() ? null : valor; }

  @SuppressWarnings("unchecked")
  private Map<String, Object> ler(String valor) {
    try { return json.readValue(valor, Map.class); }
    catch (Exception e) { throw new IllegalStateException(e); }
  }
}
