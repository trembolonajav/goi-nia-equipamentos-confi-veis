package br.com.locago.config;

import org.springframework.context.annotation.Configuration;
import org.springframework.web.servlet.config.annotation.CorsRegistry;
import org.springframework.web.servlet.config.annotation.WebMvcConfigurer;
import br.com.locago.seguranca.AuditoriaInterceptor;
import org.springframework.web.servlet.config.annotation.InterceptorRegistry;

@Configuration
public class WebConfig implements WebMvcConfigurer {
  private final AuditoriaInterceptor auditoria;
  public WebConfig(AuditoriaInterceptor auditoria){this.auditoria=auditoria;}
  @Override public void addCorsMappings(CorsRegistry registry) {
    registry.addMapping("/api/**").allowedOrigins("http://localhost:5173", "http://127.0.0.1:5173").allowedMethods("GET", "POST", "PUT", "PATCH", "DELETE").allowCredentials(true).allowedHeaders("Content-Type","X-XSRF-TOKEN");
  }
  @Override public void addInterceptors(InterceptorRegistry registry){registry.addInterceptor(auditoria).addPathPatterns("/api/**");}
}
