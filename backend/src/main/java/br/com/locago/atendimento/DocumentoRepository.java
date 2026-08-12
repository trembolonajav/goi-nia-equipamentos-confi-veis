package br.com.locago.atendimento;

import com.fasterxml.jackson.core.JsonProcessingException;
import com.fasterxml.jackson.databind.ObjectMapper;
import java.util.LinkedHashMap;
import java.util.List;
import java.util.Locale;
import java.util.Map;
import java.util.NoSuchElementException;
import org.springframework.jdbc.core.simple.JdbcClient;
import org.springframework.stereotype.Repository;
import org.springframework.transaction.annotation.Transactional;

@Repository
public class DocumentoRepository {
  private final JdbcClient jdbc;
  private final ObjectMapper json;

  public DocumentoRepository(JdbcClient jdbc, ObjectMapper json) {
    this.jdbc = jdbc;
    this.json = json;
  }

  public List<Map<String, Object>> clientes() {
    return jdbc.sql("""
      select id,dados::text,tipo_pessoa,nome_razao_social,nome_fantasia,cpf_cnpj,rg_ie,
             inscricao_municipal,telefone,whatsapp,email,cep,logradouro,numero_endereco,
             complemento,bairro,cidade,uf,codigo_ibge,quadra,lote,observacao,ativo
      from cliente_atendimento order by criado_em desc
      """).query((rs, row) -> {
        Map<String, Object> cliente = new LinkedHashMap<>(ler(rs.getString("dados")));
        cliente.put("id", rs.getString("id"));
        cliente.put("tipoPessoa", rs.getString("tipo_pessoa"));
        cliente.put("tipo", "PJ".equals(rs.getString("tipo_pessoa")) ? "Pessoa jurídica" : "Pessoa física");
        cliente.put("nomeRazaoSocial", rs.getString("nome_razao_social"));
        cliente.put("nome", rs.getString("nome_razao_social"));
        colocar(cliente, "nomeFantasia", rs.getString("nome_fantasia"));
        colocar(cliente, "cpfCnpj", rs.getString("cpf_cnpj"));
        colocar(cliente, "doc", documentoExibicao(rs.getString("tipo_pessoa"), rs.getString("cpf_cnpj")));
        colocar(cliente, "rgIe", rs.getString("rg_ie"));
        colocar(cliente, "inscricaoMunicipal", rs.getString("inscricao_municipal"));
        colocar(cliente, "telefone", rs.getString("telefone"));
        colocar(cliente, "tel", rs.getString("telefone"));
        colocar(cliente, "whatsapp", rs.getString("whatsapp"));
        colocar(cliente, "email", rs.getString("email"));
        colocar(cliente, "cep", rs.getString("cep"));
        colocar(cliente, "logradouro", rs.getString("logradouro"));
        colocar(cliente, "numeroEndereco", rs.getString("numero_endereco"));
        colocar(cliente, "complemento", rs.getString("complemento"));
        colocar(cliente, "bairro", rs.getString("bairro"));
        colocar(cliente, "cidade", rs.getString("cidade"));
        colocar(cliente, "uf", rs.getString("uf"));
        colocar(cliente, "codigoIbge", rs.getString("codigo_ibge"));
        colocar(cliente, "quadra", rs.getString("quadra"));
        colocar(cliente, "lote", rs.getString("lote"));
        colocar(cliente, "obs", rs.getString("observacao"));
        cliente.put("situacao", rs.getBoolean("ativo") ? "Ativo" : "Inativo");
        return cliente;
      }).list();
  }

  public List<Map<String, Object>> pedidos() { return listar("pedido_atendimento", "criado_em"); }
  public List<Map<String, Object>> contratos() {
    List<Map<String, Object>> contratos = listar("contrato_atendimento", "criado_em");
    for (Map<String, Object> contrato : contratos) {
      String numero = texto(contrato, "numero");
      if (numero.isBlank()) continue;
      Map<String, Object> financeiro = jdbc.sql("""
        select count(*) total,
               count(*) filter (where status='PAGA') pagas,
               count(*) filter (where status='PARCIAL') parciais,
               count(*) filter (where status<>'PAGA' and vencimento<current_date) vencidas
          from cobranca_atendimento where contrato_numero=:numero and cancelada_em is null
        """).param("numero", numero).query().singleRow();
      int total = ((Number) financeiro.get("total")).intValue();
      int pagas = ((Number) financeiro.get("pagas")).intValue();
      int parciais = ((Number) financeiro.get("parciais")).intValue();
      int vencidas = ((Number) financeiro.get("vencidas")).intValue();
      if (total > 0) contrato.put("pagamento", pagas == total ? "Pago" : vencidas > 0 ? "Vencido" : parciais > 0 ? "Parcial" : "Pendente");
    }
    return contratos;
  }

  @Transactional
  public Map<String, Object> criarCliente(Map<String, Object> documento) {
    long sequencia = jdbc.sql("select nextval('cliente_atendimento_codigo_seq')").query(Long.class).single();
    documento.remove("id");
    documento.put("id", "CL-" + String.format("%06d", sequencia));
    return salvarCliente(documento);
  }

  @Transactional
  public Map<String, Object> atualizarCliente(String id, Map<String, Object> documento) {
    int existe = jdbc.sql("select count(*) from cliente_atendimento where id=:id").param("id", id).query(Integer.class).single();
    if (existe == 0) throw new NoSuchElementException("Cliente não encontrado");
    documento.put("id", id);
    return salvarCliente(documento);
  }

  private Map<String, Object> salvarCliente(Map<String, Object> documento) {
    String id = texto(documento, "id");
    String tipo = tipoPessoa(documento);
    String nome = primeiro(documento, "nomeRazaoSocial", "nome");
    String cpfCnpj = ClienteValidator.documento(primeiro(documento, "cpfCnpj", "doc"), tipo.equals("PJ"));
    String telefone = primeiro(documento, "telefone", "tel");
    String whatsapp = primeiro(documento, "whatsapp", "tel", "telefone");

    documento.put("tipoPessoa", tipo);
    documento.put("tipo", tipo.equals("PJ") ? "Pessoa jurídica" : "Pessoa física");
    documento.put("nomeRazaoSocial", nome);
    documento.put("nome", nome);
    documento.put("cpfCnpj", cpfCnpj);
    documento.put("doc", documentoExibicao(tipo, cpfCnpj));
    documento.put("telefone", telefone);
    documento.put("tel", telefone);
    documento.put("whatsapp", whatsapp);

    jdbc.sql("""
      insert into cliente_atendimento(
        id,dados,tipo_pessoa,nome_razao_social,nome_fantasia,cpf_cnpj,rg_ie,inscricao_municipal,
        telefone,whatsapp,email,cep,logradouro,numero_endereco,complemento,bairro,cidade,uf,
        codigo_ibge,quadra,lote,observacao,ativo)
      values(:id,cast(:dados as jsonb),:tipo,:nome,:fantasia,:doc,:rgIe,:im,:telefone,:whatsapp,
        :email,:cep,:logradouro,:numero,:complemento,:bairro,:cidade,:uf,:ibge,:quadra,:lote,:obs,:ativo)
      on conflict(id) do update set
        dados=excluded.dados,tipo_pessoa=excluded.tipo_pessoa,nome_razao_social=excluded.nome_razao_social,
        nome_fantasia=excluded.nome_fantasia,cpf_cnpj=excluded.cpf_cnpj,rg_ie=excluded.rg_ie,
        inscricao_municipal=excluded.inscricao_municipal,telefone=excluded.telefone,
        whatsapp=excluded.whatsapp,email=excluded.email,cep=excluded.cep,logradouro=excluded.logradouro,
        numero_endereco=excluded.numero_endereco,complemento=excluded.complemento,bairro=excluded.bairro,
        cidade=excluded.cidade,uf=excluded.uf,codigo_ibge=excluded.codigo_ibge,quadra=excluded.quadra,
        lote=excluded.lote,observacao=excluded.observacao,ativo=excluded.ativo,atualizado_em=now()
      """)
      .param("id", id).param("dados", escrever(documento)).param("tipo", tipo).param("nome", nome)
      .param("fantasia", nulo(texto(documento, "nomeFantasia"))).param("doc", nulo(cpfCnpj))
      .param("rgIe", nulo(primeiro(documento, "rgIe", "inscricao")))
      .param("im", nulo(texto(documento, "inscricaoMunicipal")))
      .param("telefone", nulo(telefone)).param("whatsapp", nulo(whatsapp))
      .param("email", nulo(texto(documento, "email"))).param("cep", nulo(texto(documento, "cep")))
      .param("logradouro", nulo(texto(documento, "logradouro"))).param("numero", nulo(texto(documento, "numeroEndereco")))
      .param("complemento", nulo(texto(documento, "complemento"))).param("bairro", nulo(texto(documento, "bairro")))
      .param("cidade", nulo(texto(documento, "cidade"))).param("uf", nulo(texto(documento, "uf").toUpperCase(Locale.ROOT)))
      .param("ibge", nulo(texto(documento, "codigoIbge"))).param("quadra", nulo(texto(documento, "quadra")))
      .param("lote", nulo(texto(documento, "lote"))).param("obs", nulo(texto(documento, "obs")))
      .param("ativo", !"Inativo".equalsIgnoreCase(texto(documento, "situacao"))).update();
    return documento;
  }

  public Map<String, Object> salvarPedido(Map<String, Object> doc) { return salvar("pedido_atendimento", "numero", doc); }

  private List<Map<String, Object>> listar(String tabela, String ordem) {
    return jdbc.sql("select dados::text from " + tabela + " order by " + ordem + " desc")
      .query(String.class).list().stream().map(this::ler).toList();
  }

  private Map<String, Object> salvar(String tabela, String chave, Map<String, Object> doc) {
    Object valor = doc.get(chave.equals("numero") ? "num" : chave);
    if (valor == null || valor.toString().isBlank()) throw new IllegalArgumentException("Campo obrigatório ausente: " + chave);
    jdbc.sql("insert into " + tabela + " (" + chave + ", dados) values (:chave, cast(:dados as jsonb)) on conflict (" + chave + ") do update set dados=excluded.dados, atualizado_em=now()")
      .param("chave", valor.toString()).param("dados", escrever(doc)).update();
    return doc;
  }

  private String tipoPessoa(Map<String, Object> doc) {
    String valor = primeiro(doc, "tipoPessoa", "tipo").toUpperCase(Locale.ROOT);
    return valor.equals("PJ") || valor.contains("JUR") ? "PJ" : "PF";
  }

  private String documentoExibicao(String tipo, String doc) {
    return doc == null || doc.isBlank() ? "" : ("PJ".equals(tipo) ? "CNPJ " : "CPF ") + doc;
  }

  private void colocar(Map<String, Object> mapa, String chave, Object valor) {
    if (valor != null) mapa.put(chave, valor);
  }

  private String primeiro(Map<String, Object> mapa, String... chaves) {
    for (String chave : chaves) {
      String valor = texto(mapa, chave);
      if (!valor.isBlank()) return valor;
    }
    return "";
  }

  private String texto(Map<String, Object> mapa, String chave) {
    Object valor = mapa.get(chave);
    return valor == null ? "" : valor.toString().trim();
  }

  private String nulo(String valor) { return valor == null || valor.isBlank() ? null : valor; }

  @SuppressWarnings("unchecked")
  private Map<String, Object> ler(String value) {
    try { return json.readValue(value, Map.class); }
    catch (JsonProcessingException e) { throw new IllegalStateException(e); }
  }

  private String escrever(Map<String, Object> value) {
    try { return json.writeValueAsString(value); }
    catch (JsonProcessingException e) { throw new IllegalArgumentException(e); }
  }
}
