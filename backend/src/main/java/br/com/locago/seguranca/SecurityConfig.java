package br.com.locago.seguranca;

import jakarta.servlet.http.HttpServletResponse;
import org.springframework.context.annotation.*;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.config.annotation.authentication.configuration.AuthenticationConfiguration;
import org.springframework.security.config.annotation.web.builders.HttpSecurity;
import org.springframework.security.crypto.factory.PasswordEncoderFactories;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.security.web.SecurityFilterChain;
import org.springframework.security.web.csrf.CookieCsrfTokenRepository;
import org.springframework.security.web.csrf.CsrfTokenRequestAttributeHandler;

@Configuration
public class SecurityConfig {
  @Bean PasswordEncoder passwordEncoder(){return PasswordEncoderFactories.createDelegatingPasswordEncoder();}
  @Bean AuthenticationManager authenticationManager(AuthenticationConfiguration c)throws Exception{return c.getAuthenticationManager();}
  @Bean SecurityFilterChain security(HttpSecurity http)throws Exception{
    var csrf=CookieCsrfTokenRepository.withHttpOnlyFalse();csrf.setCookiePath("/");
    var handler=new CsrfTokenRequestAttributeHandler();handler.setCsrfRequestAttributeName(null);
    http.csrf(c->c.csrfTokenRepository(csrf).csrfTokenRequestHandler(handler))
      .cors(c->{})
      .authorizeHttpRequests(a->a
        .requestMatchers("/actuator/health","/api/auth/csrf","/api/auth/login").permitAll()
        .requestMatchers("/api/admin/**","/api/atendimento/recebimentos/*/estornar","/api/atendimento/financeiro/lancamentos/**","/api/atendimento/financeiro/contas-pagar/**","/api/atendimento/servicos/**","/api/atendimento/produtos/categorias/**").hasRole("ADMIN")
        .requestMatchers("/api/auth/**","/api/atendimento/**").authenticated().anyRequest().permitAll())
      .exceptionHandling(e->e.authenticationEntryPoint((q,r,x)->r.sendError(HttpServletResponse.SC_UNAUTHORIZED)).accessDeniedHandler((q,r,x)->r.sendError(HttpServletResponse.SC_FORBIDDEN)))
      .logout(l->l.disable());
    return http.build();
  }
}
