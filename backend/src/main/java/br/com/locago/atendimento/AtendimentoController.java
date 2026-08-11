package br.com.locago.atendimento;

import jakarta.validation.constraints.NotEmpty;
import org.springframework.http.HttpStatus;
import org.springframework.http.HttpHeaders;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;
import java.util.List;
import java.util.Map;

@RestController @RequestMapping("/api/atendimento")
public class AtendimentoController {
  private final DocumentoRepository repository;
  private final OperacaoContratoService operacao;
  private final ManutencaoService manutencao;
  private final LogisticaService logistica;
  private final FinanceiroService financeiro;
  private final ClienteValidator clienteValidator; private final DocumentoClienteService documentos;
  private final ServicoCatalogoService servicos;
  private final DocumentoContratoService documentosContrato;
  private final EventoOperacionalService eventos;
  private final ProdutoCatalogoService produtos;
  private final ComposicaoService composicoes;
  private final ComercialService comercial;
  public AtendimentoController(DocumentoRepository repository, OperacaoContratoService operacao, ManutencaoService manutencao, LogisticaService logistica,FinanceiroService financeiro,ClienteValidator clienteValidator,DocumentoClienteService documentos,ServicoCatalogoService servicos,DocumentoContratoService documentosContrato,EventoOperacionalService eventos,ProdutoCatalogoService produtos,ComposicaoService composicoes,ComercialService comercial) { this.repository = repository; this.operacao = operacao; this.manutencao = manutencao; this.logistica = logistica;this.financeiro=financeiro;this.clienteValidator=clienteValidator;this.documentos=documentos;this.servicos=servicos;this.documentosContrato=documentosContrato;this.eventos=eventos;this.produtos=produtos;this.composicoes=composicoes;this.comercial=comercial; }
  @GetMapping("/clientes") public List<Map<String,Object>> clientes() { return repository.clientes(); }
  @PostMapping("/clientes") @ResponseStatus(HttpStatus.CREATED) public Map<String,Object> criarCliente(@RequestBody @NotEmpty Map<String,Object> cliente) { clienteValidator.validar(cliente); return repository.criarCliente(cliente); }
  @PutMapping("/clientes/{id}") public Map<String,Object> atualizarCliente(@PathVariable String id,@RequestBody @NotEmpty Map<String,Object> cliente) { clienteValidator.validar(cliente); return repository.atualizarCliente(id,cliente); }
  @GetMapping("/clientes/{id}/documentos") public List<Map<String,Object>> documentos(@PathVariable String id){return documentos.listar(id);}
  @PostMapping(value="/clientes/{id}/documentos",consumes=MediaType.MULTIPART_FORM_DATA_VALUE) @ResponseStatus(HttpStatus.CREATED) public Map<String,Object> anexar(@PathVariable String id,@RequestParam String tipo,@RequestPart MultipartFile arquivo){return documentos.salvar(id,tipo,arquivo);}
  @GetMapping("/documentos/{id}/arquivo") public ResponseEntity<org.springframework.core.io.Resource> visualizar(@PathVariable long id,@RequestParam(defaultValue="false") boolean download){var d=documentos.baixar(id);String modo=download?"attachment":"inline";return ResponseEntity.ok().contentType(MediaType.parseMediaType(d.mime())).header(HttpHeaders.CONTENT_DISPOSITION,modo+"; filename=\""+d.nome().replace("\"","")+"\"").body(d.resource());}
  @DeleteMapping("/documentos/{id}") @ResponseStatus(HttpStatus.NO_CONTENT) public void excluirDocumento(@PathVariable long id){documentos.excluir(id);}
  @GetMapping("/pedidos") public List<Map<String,Object>> pedidos() { return comercial.listarComoPedidos(); }
  @PostMapping("/orcamentos") @ResponseStatus(HttpStatus.CREATED) public Map<String,Object> criarOrcamento(@RequestBody @NotEmpty Map<String,Object> body){return comercial.criar(body);}
  @PostMapping("/orcamentos/{numero}/versoes") @ResponseStatus(HttpStatus.CREATED) public Map<String,Object> novaVersaoOrcamento(@PathVariable String numero,@RequestBody @NotEmpty Map<String,Object> body){return comercial.novaVersao(numero,body);}
  @PostMapping("/orcamentos/{numero}/versoes/{versaoId}/enviar") public Map<String,Object> enviarOrcamento(@PathVariable String numero,@PathVariable long versaoId){return comercial.enviar(numero,versaoId);}
  @PostMapping("/orcamentos/{numero}/versoes/{versaoId}/aprovar") public Map<String,Object> aprovarOrcamento(@PathVariable String numero,@PathVariable long versaoId){return comercial.aprovar(numero,versaoId);}
  @GetMapping("/contratos") public List<Map<String,Object>> contratos() { return repository.contratos(); }
  @GetMapping("/contratos/{numero}/documentos") public List<Map<String,Object>> documentosContrato(@PathVariable String numero){return documentosContrato.listar(numero);}
  @PostMapping(value="/contratos/{numero}/documentos",consumes=MediaType.MULTIPART_FORM_DATA_VALUE) @ResponseStatus(HttpStatus.CREATED) public Map<String,Object> anexarContrato(@PathVariable String numero,@RequestParam(defaultValue="Contrato assinado")String tipo,@RequestPart MultipartFile arquivo){return documentosContrato.salvar(numero,tipo,arquivo);}
  @GetMapping("/contratos/documentos/{id}/arquivo") public ResponseEntity<org.springframework.core.io.Resource> arquivoContrato(@PathVariable long id,@RequestParam(defaultValue="false")boolean download){var d=documentosContrato.baixar(id);return ResponseEntity.ok().contentType(MediaType.parseMediaType(d.mime())).header(HttpHeaders.CONTENT_DISPOSITION,(download?"attachment":"inline")+"; filename=\""+d.nome().replace("\"","")+"\"").body(d.resource());}
  @DeleteMapping("/contratos/documentos/{id}") @ResponseStatus(HttpStatus.NO_CONTENT) public void excluirArquivoContrato(@PathVariable long id){documentosContrato.excluir(id);}
  @GetMapping("/contratos/{numero}/itens-operacionais") public List<Map<String,Object>> itensOperacionais(@PathVariable String numero){return operacao.itensOperacionais(numero);}
  @PostMapping("/contratos/{numero}/expedir") public Map<String,Object> expedir(@PathVariable String numero,@RequestBody Map<String,Object> body) { return operacao.expedir(numero,body); }
  @PostMapping("/contratos/{numero}/confirmar-entrega") public Map<String,Object> confirmarEntrega(@PathVariable String numero,@RequestBody Map<String,Object> body) { return operacao.confirmarEntrega(numero,body); }
  @PostMapping("/contratos/{numero}/devolver") public Map<String,Object> devolver(@PathVariable String numero,@RequestBody Map<String,Object> body) { return operacao.devolver(numero,body); }
  @PostMapping("/contratos/{numero}/inspecionar") public Map<String,Object> inspecionar(@PathVariable String numero, @RequestBody Map<String,Object> body) {
    return operacao.inspecionar(numero,body);
  }
  @GetMapping("/manutencoes") public List<Map<String,Object>> manutencoes(){return manutencao.listar();}
  @PostMapping("/manutencoes") @ResponseStatus(HttpStatus.CREATED) public Map<String,Object> abrirManutencao(@RequestBody Map<String,Object> body){return manutencao.abrir(body);}
  @PostMapping("/manutencoes/{id}/concluir") public Map<String,Object> concluirManutencao(@PathVariable long id,@RequestBody(required=false) Map<String,Object> body){return manutencao.concluir(id,body==null?"":String.valueOf(body.getOrDefault("observacao","")));}
  @GetMapping("/agenda") public List<Map<String,Object>> agenda(){return logistica.agenda();}
  @GetMapping("/obras") public List<Map<String,Object>> obras(){return logistica.obras();}
  @GetMapping("/cobrancas") public List<Map<String,Object>> cobrancas(){return financeiro.cobrancas();}
  @PostMapping("/cobrancas/{id}/receber") public Map<String,Object> receber(@PathVariable long id,@RequestBody Map<String,Object> body){return financeiro.receber(id,body);}
  @PostMapping("/recebimentos/{id}/estornar") public Map<String,Object> estornarRecebimento(@PathVariable long id){return financeiro.estornarRecebimento(id);}
  @GetMapping("/financeiro/contas") public List<Map<String,Object>> contasFinanceiras(){return financeiro.contas();}
  @GetMapping("/financeiro/resumo") public Map<String,Object> resumoFinanceiro(){return financeiro.resumo();}
  @GetMapping("/financeiro/lancamentos") public List<Map<String,Object>> lancamentosFinanceiros(){return financeiro.lancamentos();}
  @PostMapping("/financeiro/lancamentos") public Map<String,Object> criarLancamento(@RequestBody Map<String,Object> body){return financeiro.criarLancamento(body);}
  @PostMapping("/financeiro/lancamentos/{id}/baixar") public Map<String,Object> baixarLancamento(@PathVariable long id,@RequestBody Map<String,Object> body){return financeiro.baixar(id,body);}
  @PostMapping("/financeiro/lancamentos/{id}/cancelar") public Map<String,Object> cancelarLancamento(@PathVariable long id){return financeiro.cancelar(id);}
  @PostMapping("/financeiro/contas-pagar") @ResponseStatus(HttpStatus.CREATED) public Map<String,Object> criarContaPagar(@RequestBody Map<String,Object> body){return financeiro.criarContaPagar(body);}
  @PostMapping("/financeiro/contas-pagar/{id}/pagar") public Map<String,Object> pagarConta(@PathVariable long id,@RequestBody Map<String,Object> body){return financeiro.pagarConta(id,body);}
  @GetMapping("/servicos") public List<Map<String,Object>> servicos(){return servicos.listar();}
  @PostMapping("/servicos") public Map<String,Object> salvarServico(@RequestBody Map<String,Object> body){return servicos.salvar(body);}
  @GetMapping("/trocas") public List<Map<String,Object>> trocas(){return eventos.listar("TROCA");}
  @PostMapping("/trocas") @ResponseStatus(HttpStatus.CREATED) public Map<String,Object> criarTroca(@RequestBody Map<String,Object> body){return eventos.criar("TROCA",body);}
  @PostMapping("/trocas/{id}/concluir") public Map<String,Object> concluirTroca(@PathVariable long id){return eventos.concluir(id);}
  @GetMapping("/ocorrencias") public List<Map<String,Object>> ocorrencias(){return eventos.listar("OCORRENCIA");}
  @PostMapping("/ocorrencias") @ResponseStatus(HttpStatus.CREATED) public Map<String,Object> criarOcorrencia(@RequestBody Map<String,Object> body){return eventos.criar("OCORRENCIA",body);}
  @PostMapping("/ocorrencias/{id}/concluir") public Map<String,Object> concluirOcorrencia(@PathVariable long id){return eventos.concluir(id);}
  @GetMapping("/produtos") public List<Map<String,Object>> produtos(){return produtos.listar();}
  @GetMapping("/produtos/{id}") public Map<String,Object> produto(@PathVariable String id){return produtos.buscar(id);}
  @PostMapping("/produtos") @ResponseStatus(HttpStatus.CREATED) public Map<String,Object> salvarProduto(@RequestBody Map<String,Object> body){return produtos.salvar(body);}
  @GetMapping("/produtos/categorias/lista") public List<Map<String,Object>> categoriasProduto(){return produtos.categorias();}
  @PostMapping("/produtos/categorias") @ResponseStatus(HttpStatus.CREATED) public Map<String,Object> categoriaProduto(@RequestBody Map<String,Object> body){return produtos.categoria(body);}
  @GetMapping("/produtos/{id}/patrimonios") public List<Map<String,Object>> patrimoniosProduto(@PathVariable String id){return produtos.patrimonios(id);}
  @GetMapping("/patrimonios") public List<Map<String,Object>> patrimonios(){return produtos.patrimonios();}
  @GetMapping("/composicoes") public List<Map<String,Object>> composicoes(){return composicoes.listar();}
  @PostMapping("/composicoes") @ResponseStatus(HttpStatus.CREATED) public Map<String,Object> salvarComposicao(@RequestBody Map<String,Object> body){return composicoes.salvar(body);}
}
