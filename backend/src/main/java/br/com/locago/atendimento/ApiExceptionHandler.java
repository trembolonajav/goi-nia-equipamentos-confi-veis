package br.com.locago.atendimento;

import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.ExceptionHandler;
import org.springframework.web.bind.annotation.RestControllerAdvice;
import org.springframework.web.server.ResponseStatusException;

import java.util.Map;
import java.util.NoSuchElementException;

@RestControllerAdvice
public class ApiExceptionHandler {
  @ExceptionHandler(ResponseStatusException.class)
  public ResponseEntity<Map<String, String>> tratar(ResponseStatusException erro) {
    return ResponseEntity.status(erro.getStatusCode()).body(Map.of("message", erro.getReason()));
  }

  @ExceptionHandler(NoSuchElementException.class)
  public ResponseEntity<Map<String, String>> tratarNaoEncontrado(NoSuchElementException erro) {
    return ResponseEntity.status(404).body(Map.of("message", erro.getMessage()));
  }
}
