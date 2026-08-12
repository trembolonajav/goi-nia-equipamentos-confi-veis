package br.com.locago.seguranca;

import org.springframework.http.*;import org.springframework.jdbc.core.simple.JdbcClient;import org.springframework.security.crypto.password.PasswordEncoder;import org.springframework.web.bind.annotation.*;import org.springframework.web.server.ResponseStatusException;
import java.util.*;

@RestController @RequestMapping("/api/admin/usuarios")
public class UsuarioAdminController {
  private final JdbcClient jdbc;private final PasswordEncoder encoder;
  public UsuarioAdminController(JdbcClient jdbc,PasswordEncoder encoder){this.jdbc=jdbc;this.encoder=encoder;}
  @GetMapping public List<Map<String,Object>> listar(){return jdbc.sql("select id,login,nome,papel,ativo,ultimo_login_em,criado_em from usuario_sistema order by nome").query().listOfRows();}
  @PostMapping @ResponseStatus(HttpStatus.CREATED) public Map<String,Object> criar(@RequestBody Map<String,Object>b){
    String login=String.valueOf(b.getOrDefault("login","")).trim().toLowerCase(),nome=String.valueOf(b.getOrDefault("nome","")).trim(),senha=String.valueOf(b.getOrDefault("senha","")),papel=String.valueOf(b.getOrDefault("papel","OPERADOR")).toUpperCase();
    if(login.length()<3||nome.length()<3||senha.length()<10||!Set.of("ADMIN","OPERADOR").contains(papel))throw new ResponseStatusException(HttpStatus.BAD_REQUEST,"Informe login, nome, papel e senha com ao menos 10 caracteres");
    Long id=jdbc.sql("insert into usuario_sistema(login,nome,senha_hash,papel) values(:l,:n,:s,:p) returning id").param("l",login).param("n",nome).param("s",encoder.encode(senha)).param("p",papel).query(Long.class).single();return porId(id);
  }
  @PutMapping("/{id}") public Map<String,Object> editar(@PathVariable long id,@RequestBody Map<String,Object>b){String nome=String.valueOf(b.getOrDefault("nome","")).trim(),papel=String.valueOf(b.getOrDefault("papel","OPERADOR")).toUpperCase();boolean ativo=Boolean.parseBoolean(String.valueOf(b.getOrDefault("ativo",true)));if(nome.length()<3||!Set.of("ADMIN","OPERADOR").contains(papel))throw new ResponseStatusException(HttpStatus.BAD_REQUEST,"Dados inválidos");jdbc.sql("update usuario_sistema set nome=:n,papel=:p,ativo=:a,atualizado_em=now() where id=:id").param("n",nome).param("p",papel).param("a",ativo).param("id",id).update();return porId(id);}
  @PostMapping("/{id}/senha") @ResponseStatus(HttpStatus.NO_CONTENT) public void senha(@PathVariable long id,@RequestBody Map<String,Object>b){String senha=String.valueOf(b.getOrDefault("senha",""));if(senha.length()<10)throw new ResponseStatusException(HttpStatus.BAD_REQUEST,"A senha deve ter ao menos 10 caracteres");jdbc.sql("update usuario_sistema set senha_hash=:s,atualizado_em=now() where id=:id").param("s",encoder.encode(senha)).param("id",id).update();}
  private Map<String,Object> porId(long id){return jdbc.sql("select id,login,nome,papel,ativo,ultimo_login_em,criado_em from usuario_sistema where id=:id").param("id",id).query().singleRow();}
}
