package br.com.locago.seguranca;

import jakarta.servlet.http.*;
import org.springframework.http.HttpStatus;
import org.springframework.jdbc.core.simple.JdbcClient;
import org.springframework.security.authentication.*;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.AuthenticationException;
import org.springframework.security.core.context.SecurityContext;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.web.context.HttpSessionSecurityContextRepository;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.server.ResponseStatusException;
import java.util.Map;

@RestController @RequestMapping("/api/auth")
public class AuthController {
  private final AuthenticationManager manager;private final JdbcClient jdbc;
  public AuthController(AuthenticationManager manager,JdbcClient jdbc){this.manager=manager;this.jdbc=jdbc;}
  @GetMapping("/csrf") public Map<String,String> csrf(org.springframework.security.web.csrf.CsrfToken token){return Map.of("headerName",token.getHeaderName(),"token",token.getToken());}
  @PostMapping("/login") public Map<String,Object> login(@RequestBody Map<String,Object>b,HttpServletRequest req,HttpServletResponse res){
    try{
      Authentication auth=manager.authenticate(new UsernamePasswordAuthenticationToken(String.valueOf(b.getOrDefault("login","")),String.valueOf(b.getOrDefault("senha",""))));
      SecurityContext context=SecurityContextHolder.createEmptyContext();context.setAuthentication(auth);SecurityContextHolder.setContext(context);
      if(req.getSession(false)!=null)req.changeSessionId();
      req.getSession(true).setAttribute(HttpSessionSecurityContextRepository.SPRING_SECURITY_CONTEXT_KEY,context);
      jdbc.sql("update usuario_sistema set ultimo_login_em=now() where login=:l").param("l",auth.getName()).update();return atual(auth);
    }catch(AuthenticationException e){throw new ResponseStatusException(HttpStatus.UNAUTHORIZED,"Usuário ou senha inválidos.");}
  }
  @GetMapping("/me") public Map<String,Object> me(Authentication auth){return atual(auth);}
  @PostMapping("/logout") @ResponseStatus(HttpStatus.NO_CONTENT) public void logout(HttpServletRequest req,HttpServletResponse res){HttpSession s=req.getSession(false);if(s!=null)s.invalidate();SecurityContextHolder.clearContext();var c=new Cookie("JSESSIONID","");c.setPath("/");c.setHttpOnly(true);c.setMaxAge(0);res.addCookie(c);}
  private Map<String,Object> atual(Authentication auth){return jdbc.sql("select id,login,nome,papel from usuario_sistema where login=:l").param("l",auth.getName()).query((r,n)->Map.<String,Object>of("id",r.getLong("id"),"login",r.getString("login"),"nome",r.getString("nome"),"papel",r.getString("papel"))).single();}
}
