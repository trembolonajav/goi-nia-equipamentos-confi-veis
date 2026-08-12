package br.com.locago.atendimento;

import java.util.List;
import java.util.Map;
import org.springframework.jdbc.core.simple.JdbcClient;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;
import org.springframework.web.server.ResponseStatusException;
import static org.springframework.http.HttpStatus.NOT_FOUND;

@RestController
@RequestMapping("/api/public/catalogo")
public class CatalogoPublicoController {
  private final JdbcClient jdbc;
  public CatalogoPublicoController(JdbcClient jdbc) { this.jdbc = jdbc; }

  @GetMapping
  public List<Map<String,Object>> listar() {
    return jdbc.sql(sql() + " order by p.nome").query().listOfRows().stream().map(this::comPrecos).toList();
  }

  @GetMapping("/{slug}")
  public Map<String,Object> buscar(@PathVariable String slug) {
    return jdbc.sql(sql() + " and p.slug=:slug").param("slug", slug).query().listOfRows().stream()
      .findFirst().map(this::comPrecos).orElseThrow(() -> new ResponseStatusException(NOT_FOUND, "Equipamento não encontrado"));
  }

  private String sql() { return """
    select p.id,p.slug,p.nome,c.nome categoria,coalesce(p.marca,'') marca,coalesce(p.modelo,'') modelo,
      coalesce(p.descricao,'') descricao,coalesce(p.aplicacao,'') aplicacao,p.imagem_url "imagemUrl",
      p.especificacoes::text especificacoes,p.conteudo_publico::text "conteudoPublico",
      (select count(*) from patrimonio_atendimento pa where pa.produto_id=p.id and pa.estado='DISPONIVEL') "disponiveis"
    from produto_catalogo p join categoria_produto c on c.id=p.categoria_id
    where p.ativo and p.publicar_site
    """; }

  private Map<String,Object> comPrecos(Map<String,Object> linha) {
    var resultado = new java.util.LinkedHashMap<String,Object>(linha);
    resultado.put("precos", jdbc.sql("select duracao_dias \"duracaoDias\",nome,valor from produto_preco where produto_id=:id and ativo order by duracao_dias")
      .param("id", linha.get("id")).query().listOfRows());
    return resultado;
  }
}
