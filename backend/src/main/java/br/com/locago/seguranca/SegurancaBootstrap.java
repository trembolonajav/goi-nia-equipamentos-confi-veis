package br.com.locago.seguranca;

import org.slf4j.Logger;import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.boot.ApplicationArguments;import org.springframework.boot.ApplicationRunner;
import org.springframework.jdbc.core.simple.JdbcClient;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Component;

@Component
public class SegurancaBootstrap implements ApplicationRunner {
  private static final Logger log=LoggerFactory.getLogger(SegurancaBootstrap.class);
  private final JdbcClient jdbc;private final PasswordEncoder encoder;
  @Value("${LOCAGO_ADMIN_LOGIN:}") private String login;
  @Value("${LOCAGO_ADMIN_PASSWORD:}") private String senha;
  @Value("${LOCAGO_ADMIN_NAME:Administrador LOCAGO}") private String nome;
  public SegurancaBootstrap(JdbcClient jdbc,PasswordEncoder encoder){this.jdbc=jdbc;this.encoder=encoder;}
  @Override public void run(ApplicationArguments args){
    int total=jdbc.sql("select count(*) from usuario_sistema").query(Integer.class).single();if(total>0)return;
    if(login.isBlank()||senha.isBlank()){log.warn("Nenhum usuário existe. Defina LOCAGO_ADMIN_LOGIN e LOCAGO_ADMIN_PASSWORD para criar o primeiro ADMIN.");return;}
    if(senha.length()<10)throw new IllegalStateException("LOCAGO_ADMIN_PASSWORD deve ter ao menos 10 caracteres");
    jdbc.sql("insert into usuario_sistema(login,nome,senha_hash,papel) values(:l,:n,:s,'ADMIN')").param("l",login.trim().toLowerCase()).param("n",nome.trim()).param("s",encoder.encode(senha)).update();
    log.info("Primeiro ADMIN criado a partir das variáveis de ambiente.");
  }
}
