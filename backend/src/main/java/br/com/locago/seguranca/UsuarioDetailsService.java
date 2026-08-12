package br.com.locago.seguranca;

import org.springframework.jdbc.core.simple.JdbcClient;
import org.springframework.security.core.userdetails.*;
import org.springframework.stereotype.Service;

@Service
public class UsuarioDetailsService implements UserDetailsService {
  private final JdbcClient jdbc;
  public UsuarioDetailsService(JdbcClient jdbc){this.jdbc=jdbc;}
  @Override public UserDetails loadUserByUsername(String login){
    return jdbc.sql("select id,login,nome,senha_hash,papel,ativo from usuario_sistema where lower(login)=lower(:l)").param("l",login.trim())
      .query((r,n)->User.withUsername(r.getString("login")).password(r.getString("senha_hash")).roles(r.getString("papel")).disabled(!r.getBoolean("ativo")).build())
      .optional().orElseThrow(()->new UsernameNotFoundException("Credenciais inválidas"));
  }
}
