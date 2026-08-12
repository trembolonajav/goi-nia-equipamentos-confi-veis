package br.com.locago.seguranca;

import jakarta.servlet.http.*;
import org.springframework.jdbc.core.simple.JdbcClient;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Component;
import org.springframework.web.servlet.HandlerInterceptor;
import java.util.Set;

@Component
public class AuditoriaInterceptor implements HandlerInterceptor {
  private static final Set<String> MUTACOES=Set.of("POST","PUT","PATCH","DELETE");private final JdbcClient jdbc;
  public AuditoriaInterceptor(JdbcClient jdbc){this.jdbc=jdbc;}
  @Override public void afterCompletion(HttpServletRequest req,HttpServletResponse res,Object handler,Exception ex){
    if(!MUTACOES.contains(req.getMethod())||!req.getRequestURI().startsWith("/api/")||req.getRequestURI().equals("/api/auth/login"))return;
    Authentication a=SecurityContextHolder.getContext().getAuthentication();if(a==null||!a.isAuthenticated()||"anonymousUser".equals(a.getName()))return;
    jdbc.sql("""
      insert into auditoria_evento(usuario_id,usuario_login,usuario_nome,papel,acao,recurso,metodo,status_http,ip)
      select id,login,nome,papel,:acao,:recurso,:metodo,:status,:ip from usuario_sistema where login=:login
      """).param("acao",acao(req)).param("recurso",req.getRequestURI()).param("metodo",req.getMethod()).param("status",res.getStatus()).param("ip",ip(req)).param("login",a.getName()).update();
  }
  private String acao(HttpServletRequest r){return switch(r.getMethod()){case"POST"->"CRIAR_OU_EXECUTAR";case"PUT","PATCH"->"ALTERAR";case"DELETE"->"EXCLUIR";default->"ACESSAR";};}
  private String ip(HttpServletRequest r){String x=r.getHeader("X-Forwarded-For");return x==null?r.getRemoteAddr():x.split(",")[0].trim();}
}
