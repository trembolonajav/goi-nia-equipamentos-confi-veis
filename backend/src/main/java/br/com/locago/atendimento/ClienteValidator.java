package br.com.locago.atendimento;

import java.util.Locale;
import java.util.Map;
import java.util.regex.Pattern;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Component;
import org.springframework.web.server.ResponseStatusException;

@Component
public class ClienteValidator {
  private static final Pattern EMAIL = Pattern.compile("^[^\\s@]+@[^\\s@]+\\.[^\\s@]+$");
  private static final int[] CNPJ_PESO_1 = {5, 4, 3, 2, 9, 8, 7, 6, 5, 4, 3, 2};
  private static final int[] CNPJ_PESO_2 = {6, 5, 4, 3, 2, 9, 8, 7, 6, 5, 4, 3, 2};

  public void validar(Map<String, Object> cliente) {
    boolean pj = tipo(cliente).equals("PJ");
    String nome = primeiro(cliente, "nomeRazaoSocial", "nome");
    String documento = documento(primeiro(cliente, "cpfCnpj", "doc"), pj);
    String telefone = digitos(primeiro(cliente, "telefone", "tel"));
    String email = texto(cliente, "email");

    if (nome.length() < 3) erro("Nome/razão social inválido");
    if (pj ? !cnpj(documento) : !cpf(documento)) erro(pj ? "CNPJ inválido" : "CPF inválido");
    if (telefone.length() != 10 && telefone.length() != 11) erro("Telefone deve conter DDD e 10 ou 11 dígitos");
    if (!EMAIL.matcher(email).matches()) erro("E-mail inválido");

    boolean estruturado = cliente.containsKey("logradouro") || cliente.containsKey("cep");
    if (estruturado) {
      if (digitos(texto(cliente, "cep")).length() != 8) erro("CEP inválido");
      if (texto(cliente, "logradouro").length() < 3) erro("Logradouro é obrigatório");
      if (texto(cliente, "numeroEndereco").isBlank()) erro("Número do endereço é obrigatório");
      if (texto(cliente, "bairro").length() < 2 || texto(cliente, "cidade").length() < 2) erro("Bairro e cidade são obrigatórios");
      if (!texto(cliente, "uf").toUpperCase(Locale.ROOT).matches("[A-Z]{2}")) erro("UF inválida");
    } else if (texto(cliente, "endereco").length() < 10) {
      erro("Endereço completo é obrigatório");
    }
  }

  private String tipo(Map<String, Object> cliente) {
    String valor = primeiro(cliente, "tipoPessoa", "tipo").toUpperCase(Locale.ROOT);
    return valor.equals("PJ") || valor.contains("JUR") ? "PJ" : "PF";
  }

  static String documento(String valor, boolean pj) {
    String semRotulo = valor.toUpperCase(Locale.ROOT).replaceFirst("^(CPF|CNPJ)\\s*", "");
    return pj ? semRotulo.replaceAll("[^A-Z0-9]", "") : semRotulo.replaceAll("\\D", "");
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

  private String digitos(String valor) { return valor.replaceAll("\\D", ""); }
  private void erro(String mensagem) { throw new ResponseStatusException(HttpStatus.BAD_REQUEST, mensagem); }

  private boolean cpf(String numero) {
    if (numero.length() != 11 || numero.chars().distinct().count() == 1) return false;
    return cpfDv(numero, 9, 10) == numero.charAt(9) - '0'
      && cpfDv(numero, 10, 11) == numero.charAt(10) - '0';
  }

  private int cpfDv(String numero, int tamanho, int peso) {
    int soma = 0;
    for (int i = 0; i < tamanho; i++) soma += (numero.charAt(i) - '0') * (peso - i);
    int resto = 11 - soma % 11;
    return resto >= 10 ? 0 : resto;
  }

  private boolean cnpj(String numero) {
    if (!numero.matches("[A-Z0-9]{12}[0-9]{2}") || numero.chars().distinct().count() == 1) return false;
    return cnpjDv(numero, CNPJ_PESO_1) == numero.charAt(12) - '0'
      && cnpjDv(numero, CNPJ_PESO_2) == numero.charAt(13) - '0';
  }

  private int cnpjDv(String numero, int[] pesos) {
    int soma = 0;
    for (int i = 0; i < pesos.length; i++) soma += (numero.charAt(i) - 48) * pesos[i];
    int resto = soma % 11;
    return resto < 2 ? 0 : 11 - resto;
  }
}
