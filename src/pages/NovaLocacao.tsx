import { useEffect, useMemo, useState } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { useStore } from "../data/store";
import { PRODUTOS, EXTRAS, ETAPAS } from "../data/mock";
import { Tag, Thumb, useToast } from "../components/ui";
import { brl, dias as diasEntre, melhorPreco, disponivel } from "../lib/calc";
import { atendimentoApi,type ServicoApi } from "../lib/api";

const FORMAS = ["Pix", "Boleto", "Dinheiro", "Cartão de crédito", "Cartão de débito"];
const NIVEL = { bloqueio: { cor: "var(--red)", marca: "×" }, autorizacao: { cor: "var(--yellow)", marca: "!" }, aviso: { cor: "var(--blue)", marca: "i" }, ok: { cor: "var(--green)", marca: "✓" } };
type Nivel = keyof typeof NIVEL;

export default function NovaLocacao() {
  const { clientes, getCliente, criarPedido, aprovarPedido, atualizarCliente } = useStore();
  const { toast } = useToast();
  const nav = useNavigate();
  const [params] = useSearchParams();

  const [etapa, setEtapa] = useState(0);
  const [clienteId, setClienteId] = useState(params.get("cliente") || "");
  const [buscaCli, setBuscaCli] = useState("");
  const [entrega, setEntrega] = useState<"obra" | "loja">("loja");
  const [obraIdx, setObraIdx] = useState(0);
  const hoje = dataLocal();
  const [inicio, setInicio] = useState(hoje);
  const [fim, setFim] = useState(hoje);
  const [carrinho, setCarrinho] = useState<Record<string, number>>(() => { const pid = params.get("produto"); return pid ? { [pid]: 1 } : {}; });
  const [extrasSel, setExtrasSel] = useState<boolean[]>(EXTRAS.map(() => false));
  const [servicosCatalogo,setServicosCatalogo]=useState<ServicoApi[]>(EXTRAS.map((e,i)=>({id:i,nome:e.nome,natureza:e.natureza,valor:e.valor,ativo:true})));
  const [novaObra,setNovaObra]=useState(false);
  const [obraForm,setObraForm]=useState({nome:"",endereco:"",restricao:"",frete:""});
  const [forma, setForma] = useState("Pix");
  const [feito, setFeito] = useState<{ tipo: "orcamento" | "contrato"; num: string } | null>(null);
  useEffect(()=>{void atendimentoApi.servicos().then(s=>{const ativos=s.filter(x=>x.ativo);setServicosCatalogo(ativos);setExtrasSel(ativos.map(()=>false))}).catch(()=>{})},[]);

  const cli = getCliente(clienteId);
  const obras = cli?.obras || [];
  const obraSel = obras[obraIdx];
  const d = diasEntre(inicio, fim);

  const itens = useMemo(() => Object.keys(carrinho).filter((k) => carrinho[k] > 0).map((id) => {
    const p = PRODUTOS.find((x) => x.id === id)!;
    const r = melhorPreco(p, d);
    return { produto: p, qtd: carrinho[id], valorUnit: r.v, detalhe: Object.keys(r.uso).map((k) => r.uso[k] + " × " + k).join(" + ") };
  }), [carrinho, d]);

  const locacao = itens.reduce((a, i) => a + i.valorUnit * i.qtd, 0);
  const extras = servicosCatalogo.reduce((a, e, i) => a + (extrasSel[i] ? Number(e.valor) : 0), 0);
  const frete = entrega === "obra" && obraSel ? obraSel.frete : 0;
  const total = locacao + extras + frete;

  const val = useMemo(() => {
    const v: { nivel: Nivel; titulo: string; detalhe: string; saida?: string }[] = [];
    const add = (nivel: Nivel, titulo: string, detalhe: string, saida?: string) => v.push({ nivel, titulo, detalhe, saida });
    if (!cli) add("bloqueio", "Cliente não selecionado", "Nenhuma locação existe sem cliente vinculado.", "Selecione o cliente na etapa 1.");
    else if (cli.situacao === "Bloqueado") add("bloqueio", "Cliente bloqueado", cli.aviso || "Cliente com pendência.", "Regularize a pendência ou peça liberação ao gerente.");
    else if (cli.situacao === "Em análise") add("autorizacao", "Cadastro em análise", cli.aviso || "Condição faturada ainda não aprovada.", "Gerente aprova o crédito ou a locação sai à vista.");
    else add("ok", "Situação do cliente", cli.nome + " · " + cli.situacao);
    if (cli) {
      const pend = cli.docs.filter((doc) => !doc.ok);
      if (!pend.length) add("ok", "Documentação", "Documentos obrigatórios arquivados.");
      else if (cli.tipo === "Pessoa jurídica" && pend.length > 1) add("autorizacao", "Documentação incompleta", "Pendente: " + pend.map((doc) => doc.nome).join(", "), "Anexe os documentos ou registre autorização do gerente.");
      else add("aviso", "Documentação incompleta", "Pendente: " + pend.map((doc) => doc.nome).join(", "), "Pode seguir, mas o documento deve ser recolhido na retirada.");
    }
    if (!itens.length) add("bloqueio", "Sem equipamentos", "O contrato precisa de pelo menos um item.", "Adicione equipamentos na etapa 4.");
    else {
      const semEstoque = itens.filter((i) => i.qtd > disponivel(i.produto.id, inicio, fim));
      if (semEstoque.length) add("bloqueio", "Quantidade acima da disponibilidade", semEstoque.map((i) => i.produto.nome).join(", "), "Reduza a quantidade ou mude as datas.");
      else {
        const apertado = itens.filter((i) => disponivel(i.produto.id, inicio, fim) - i.qtd === 0);
        if (apertado.length) add("aviso", "Última unidade disponível", apertado.map((i) => i.produto.nome).join(", ") + " esgota no período.", "Nenhuma folga para troca em caso de defeito.");
        else add("ok", "Disponibilidade no período", itens.length + " item(ns) confirmados para " + d + " dias.");
      }
    }
    if (entrega === "obra") {
      if (!obras.length) add("bloqueio", "Cliente sem obra cadastrada", "Entrega exige endereço com responsável e restrição.", "Cadastre a obra ou escolha retirada na loja.");
      else if (obraSel) add("ok", "Endereço de entrega", obraSel.nome + " · " + obraSel.endereco);
    } else add("ok", "Endereço de entrega", "Retirada no balcão, com conferência de documento.");
    return v;
  }, [cli, itens, entrega, obras, obraSel, inicio, fim, d]);

  const temBloqueio = val.some((x) => x.nivel === "bloqueio");

  const memoria = [
    ...itens.map((i) => ({ linha: `${i.produto.nome} × ${i.qtd} · ${i.detalhe}`, valor: brl.format(i.valorUnit * i.qtd) })),
    ...(frete ? [{ linha: "Entrega e coleta", valor: brl.format(frete) }] : []),
    ...servicosCatalogo.filter((_, i) => extrasSel[i]).map((e) => ({ linha: `${e.nome} (${e.natureza})`, valor: brl.format(Number(e.valor)) })),
  ];

  async function cadastrarObra(){
    if(!cli)return;
    if(obraForm.nome.trim().length<3||obraForm.endereco.trim().length<10)return toast("Informe o nome e o endereço completo da obra.");
    const obra={nome:obraForm.nome.trim(),endereco:obraForm.endereco.trim(),restricao:obraForm.restricao.trim()||"Sem restrições informadas",frete:Math.max(0,Number(obraForm.frete.replace(",","."))||0),equipamentos:""};
    await atualizarCliente({...cli,obras:[...cli.obras,obra]});
    setObraIdx(cli.obras.length);setObraForm({nome:"",endereco:"",restricao:"",frete:""});setNovaObra(false);toast("Obra cadastrada na ficha do cliente.");
  }

  async function fechar(tipo: "orcamento" | "contrato") {
    if (temBloqueio || !cli) return;
    try {
      const detalhes=servicosCatalogo.filter((_,i)=>extrasSel[i]).map(e=>({nome:e.nome,natureza:e.natureza,valor:Number(e.valor)}));const servicos = detalhes.map((e) => e.nome);
      const ped = await criarPedido({ clienteId: cli.id, obra: entrega === "obra" && obraSel ? obraSel.nome : "", entrega, inicio, fim, carrinho, servicos, servicosDetalhes:detalhes, frete, forma, status: tipo === "orcamento" ? "Orçamento enviado" : "Aguardando aprovação", valor: total });
      if (tipo === "orcamento") { toast(`Orçamento ${ped.num} gerado.`); setFeito({ tipo, num: ped.num }); }
      else { const ct = await aprovarPedido(ped.num); toast(`Contrato ${ct?.numero} gerado.`); setFeito({ tipo, num: ct?.numero || ped.num }); }
      setEtapa(7);
    } catch { toast("Não foi possível concluir. Confira a disponibilidade ou a conexão com o servidor."); }
  }

  const clientesBusca = clientes.filter((c) => {
    const q = buscaCli.trim().toLowerCase();
    if (!q) return true;
    return (c.nome + c.doc + c.tel).toLowerCase().includes(q);
  }).slice(0, 6);

  function proximo() { if (etapa === 0 && !clienteId) return toast("Selecione um cliente."); if (etapa < 6) setEtapa(etapa + 1); }

  return (
    <main className="page" style={{ maxWidth: 1300 }}>
      <h1 className="h1">Nova locação</h1>
      <p className="lead">Do cliente ao contrato, sem redigitar nada entre as etapas.</p>

      <div className="steps" style={{ marginTop: 24 }}>
        {ETAPAS.map((e, i) => (
          <button key={i} className={`step${etapa === i ? " active" : etapa > i ? " done" : ""}`} onClick={() => i <= etapa && setEtapa(i)} disabled={feito !== null}>
            <span className="step-num">{etapa > i ? "✓" : i + 1}</span><span>{e}</span>
          </button>
        ))}
      </div>

      <div className="dash-cols" style={{ marginTop: 24, display: "grid", gridTemplateColumns: "1fr 360px", gap: 24, alignItems: "start" }}>
        <div>
          {etapa === 0 && (
            <section className="card">
              <h2 className="h2" style={{ marginBottom: 4 }}>Cliente</h2>
              <p className="section-note">Busque por nome, CPF, CNPJ ou telefone. O sistema avisa bloqueio antes de seguir.</p>
              <input className="input" placeholder="nome, CPF, CNPJ ou telefone" value={buscaCli} onChange={(e) => setBuscaCli(e.target.value)} />
              <div className="stack" style={{ gap: 8, marginTop: 12 }}>
                {clientesBusca.map((c) => (
                  <button key={c.id} className="card-tight client-choice" style={{ display: "flex", justifyContent: "space-between", alignItems: "center", cursor: "pointer", borderColor: clienteId === c.id ? "var(--orange)" : undefined, textAlign: "left" }} onClick={() => setClienteId(c.id)}>
                    <span>
                      <span style={{ display: "block", fontWeight: 600 }}>{c.nome}</span>
                      <span style={{ display: "block", fontSize: 13, color: "var(--muted)" }}>{c.doc} · {c.tel}</span>
                      {c.aviso && <span style={{ display: "block", fontSize: 12, color: c.situacao === "Bloqueado" ? "var(--red)" : "var(--yellow)" }}>{c.aviso}</span>}
                    </span>
                    <Tag cor={c.situacao === "Bloqueado" ? "var(--red)" : c.situacao === "Em análise" ? "var(--yellow)" : "var(--green)"}>{c.situacao}</Tag>
                  </button>
                ))}
                <button className="btn btn-outline" style={{ minHeight: 46 }} onClick={() => nav("/app/clientes/novo")}>Cadastrar cliente novo</button>
              </div>
            </section>
          )}

          {etapa === 1 && (
            <section className="card">
              <h2 className="h2" style={{ marginBottom: 4 }}>Local</h2>
              <p className="section-note">A obra é um cadastro próprio: o mesmo cliente pode ter várias, cada uma com frete e responsável diferentes.</p>
              <div className="row wrap" style={{ gap: 8 }}>
                <button className={`chip${entrega === "loja" ? " on" : ""}`} onClick={() => setEntrega("loja")}>Retirada na loja</button>
                <button className={`chip${entrega === "obra" ? " on" : ""}`} onClick={() => setEntrega("obra")}>Entrega na obra</button>
              </div>
              {entrega === "obra" ? (
                <div className="stack" style={{ gap: 8, marginTop: 14 }}>
                  {obras.length === 0 && <div className="empty">Este cliente não tem obra cadastrada.</div>}
                  {obras.map((o, i) => (
                    <button key={i} className="card-tight" style={{ display: "flex", justifyContent: "space-between", cursor: "pointer", borderColor: obraIdx === i ? "var(--orange)" : undefined, textAlign: "left" }} onClick={() => setObraIdx(i)}>
                      <span><span style={{ display: "block", fontWeight: 600 }}>{o.nome}</span><span style={{ display: "block", fontSize: 13, color: "var(--muted)" }}>{o.endereco}</span><span style={{ display: "block", fontSize: 12, color: "var(--muted-2)" }}>{o.restricao}</span></span>
                      <span className="num" style={{ fontSize: 17, whiteSpace: "nowrap" }}>{brl.format(o.frete)}</span>
                    </button>
                  ))}
                  {!novaObra&&<button className="btn btn-outline btn-block" onClick={()=>setNovaObra(true)}>+ Cadastrar nova obra</button>}
                  {novaObra&&<div className="card-tight work-form"><h3 className="h2">Nova obra</h3><div className="grid"><label className="field"><span>Nome da obra</span><input className="input" value={obraForm.nome} onChange={e=>setObraForm(f=>({...f,nome:e.target.value}))}/></label><label className="field"><span>Endereço completo</span><input className="input" value={obraForm.endereco} onChange={e=>setObraForm(f=>({...f,endereco:e.target.value}))}/></label><label className="field"><span>Restrição de acesso</span><input className="input" value={obraForm.restricao} onChange={e=>setObraForm(f=>({...f,restricao:e.target.value}))}/></label><label className="field"><span>Frete previsto (R$)</span><input className="input" inputMode="decimal" value={obraForm.frete} onChange={e=>setObraForm(f=>({...f,frete:e.target.value}))}/></label></div><div className="row" style={{gap:8,marginTop:12}}><button className="btn btn-primary btn-sm" onClick={cadastrarObra}>Salvar obra</button><button className="btn btn-ghost btn-sm" onClick={()=>setNovaObra(false)}>Cancelar</button></div></div>}
                </div>
              ) : <p className="muted" style={{ marginTop: 14 }}>Retirada no balcão, sem custo de frete. Documento conferido na saída, e só pessoa autorizada no cadastro pode retirar.</p>}
            </section>
          )}

          {etapa === 2 && (
            <section className="card">
              <h2 className="h2" style={{ marginBottom: 4 }}>Datas</h2>
              <p className="section-note">Uma diária são 24 horas a partir da retirada, com tolerância de 2 horas. A regra aparece no orçamento e no contrato.</p>
              <div className="grid" style={{ gridTemplateColumns: "repeat(auto-fill,minmax(180px,1fr))" }}>
                <label className="field"><span>Início</span><input className="input" type="date" min={hoje} value={inicio} onChange={(e) => {const v=e.target.value;setInicio(v);if(fim<v)setFim(v)}} /></label>
                <label className="field"><span>Término previsto</span><input className="input" type="date" min={inicio||hoje} value={fim} onChange={(e) => setFim(e.target.value<inicio?inicio:e.target.value)} /></label>
              </div>
              <p className="muted" style={{ marginTop: 14 }}>{d} {d === 1 ? "diária" : "diárias"} · o sistema aplica a melhor combinação de tabela e mostra a memória de cálculo antes de fechar.</p>
            </section>
          )}

          {etapa === 3 && (
            <section className="card">
              <h2 className="h2" style={{ marginBottom: 4 }}>Equipamentos</h2>
              <p className="section-note">A disponibilidade considera o período escolhido, não a situação de hoje.</p>
              <div className="stack" style={{ gap: 8 }}>
                {PRODUTOS.map((p) => {
                  const disp = disponivel(p.id, inicio, fim);
                  const q = carrinho[p.id] || 0;
                  const r = melhorPreco(p, d);
                  return (
                    <div key={p.id} className="card-tight" style={{ display: "flex", gap: 14, alignItems: "center" }}>
                      <Thumb img={p.img} w={48} h={40} />
                      <div style={{ flex: 1, minWidth: 0 }}>
                        <div style={{ fontWeight: 600 }}>{p.nome}</div>
                        <div style={{ fontSize: 13, color: "var(--muted)" }}>{brl.format(r.v)} no período</div>
                        <div style={{ fontSize: 12, color: disp === 0 ? "var(--red)" : "var(--muted-2)" }}>{disp} disponível no período</div>
                      </div>
                      <div className="row" style={{ gap: 6 }}>
                        <button className="btn btn-ghost btn-sm" style={{ width: 36, minHeight: 36 }} onClick={() => setCarrinho((s) => ({ ...s, [p.id]: Math.max(0, (s[p.id] || 0) - 1) }))}>−</button>
                        <span className="num" style={{ minWidth: 28, textAlign: "center", fontSize: 20 }}>{q}</span>
                        <button className="btn btn-ghost btn-sm" style={{ width: 36, minHeight: 36 }} disabled={q >= disp} onClick={() => setCarrinho((s) => ({ ...s, [p.id]: (s[p.id] || 0) + 1 }))}>+</button>
                      </div>
                    </div>
                  );
                })}
              </div>
            </section>
          )}

          {etapa === 4 && (
            <section className="card">
              <h2 className="h2" style={{ marginBottom: 4 }}>Serviços e venda</h2>
              <p className="section-note">Serviço e mercadoria são naturezas fiscais distintas da locação. Ficam separados no faturamento e no documento fiscal.</p>
              <div className="stack" style={{ gap: 8 }}>
                {servicosCatalogo.map((x, i) => (
                  <button key={x.nome} className="card-tight service-choice" style={{ display: "flex", gap: 12, alignItems: "center", cursor: "pointer", borderColor: extrasSel[i] ? "var(--orange)" : undefined }} onClick={() => setExtrasSel((s) => s.map((v, j) => (j === i ? !v : v)))}>
                    <span style={{ width: 22, height: 22, borderRadius: 6, border: `1px solid ${extrasSel[i] ? "var(--orange)" : "var(--border)"}`, background: extrasSel[i] ? "var(--orange)" : "transparent", color: "#111", display: "inline-flex", alignItems: "center", justifyContent: "center", fontWeight: 700 }}>{extrasSel[i] ? "✓" : ""}</span>
                    <span style={{ flex: 1, textAlign: "left" }}><span style={{ display: "block", fontWeight: 600 }}>{x.nome}</span><span style={{ display: "block", fontSize: 12, color: "var(--muted-2)" }}>{x.natureza}</span></span>
                    <span className="num" style={{ fontSize: 18 }}>{brl.format(x.valor)}</span>
                  </button>
                ))}
              </div>
            </section>
          )}

          {etapa === 5 && (
            <section className="card">
              <h2 className="h2" style={{ marginBottom: 4 }}>Pagamento</h2>
              <p className="section-note">Escolha a forma combinada com o cliente. O orçamento continua sem registrar recebimento.</p>
              <div className="row wrap" style={{ gap: 8 }}>{FORMAS.map((f) => <button key={f} className={`chip${forma === f ? " on" : ""}`} onClick={() => setForma(f)}>{f}</button>)}</div>
              <div className="grid" style={{ gridTemplateColumns: "repeat(auto-fill,minmax(160px,1fr))", marginTop: 16 }}>
                <Box r="Locação" v={brl.format(locacao)} /><Box r="Serviços e venda" v={brl.format(extras)} />
              </div>
            </section>
          )}

          {etapa === 6 && (
            <section className="card">
              <h2 className="h2" style={{ marginBottom: 4 }}>Revisão antes de fechar</h2>
              <p className="section-note">Bloqueio impede fechar. Autorização depende do gerente. Aviso só informa e deixa seguir.</p>
              <div className="card-tight" style={{ marginBottom: 16, borderColor: temBloqueio ? "var(--red)" : "var(--green)", color: temBloqueio ? "var(--red)" : "var(--green)", fontWeight: 600 }}>
                {temBloqueio ? "Há bloqueios que impedem fechar este pedido." : "Tudo certo. Pode gerar orçamento ou fechar direto."}
              </div>
              <div className="stack" style={{ gap: 8 }}>
                {val.map((c, i) => (
                  <div key={i} className="card-tight" style={{ display: "grid", gridTemplateColumns: "22px 1fr", gap: 12, alignItems: "start", borderColor: NIVEL[c.nivel].cor }}>
                    <span style={{ color: NIVEL[c.nivel].cor, fontWeight: 700 }}>{NIVEL[c.nivel].marca}</span>
                    <span><span style={{ display: "block", fontWeight: 600 }}>{c.titulo}</span><span style={{ display: "block", fontSize: 13, color: "var(--muted)" }}>{c.detalhe}</span>{c.saida && <span style={{ display: "block", marginTop: 4, fontSize: 13 }}>Como resolver: {c.saida}</span>}</span>
                  </div>
                ))}
              </div>
              <div className="divider" style={{ marginTop: 20 }} />
              <h3 className="h2" style={{ fontSize: 18, marginTop: 16, marginBottom: 4 }}>O que fazer com este pedido</h3>
              <p className="section-note">Nada aqui gera contrato direto. O contrato nasce de um pedido aprovado.</p>
              <div className="row wrap" style={{ gap: 8 }}>
                <button className="btn btn-primary" style={{ minHeight: 48 }} disabled={temBloqueio} onClick={() => fechar("orcamento")}>Gerar orçamento e enviar</button>
                <button className="btn btn-green" style={{ minHeight: 48 }} disabled={temBloqueio} onClick={() => fechar("contrato")}>Cliente já aprovou no balcão</button>
              </div>
              <div className="card-tight" style={{ marginTop: 20 }}>
                <div className="uplabel" style={{ marginBottom: 10 }}>Memória de cálculo</div>
                <div className="stack mono" style={{ gap: 6, fontSize: 13, color: "var(--muted)" }}>
                  {memoria.map((m, i) => <div key={i} style={{ display: "flex", justifyContent: "space-between", gap: 16 }}><span>{m.linha}</span><span style={{ color: "var(--text)", whiteSpace: "nowrap" }}>{m.valor}</span></div>)}
                </div>
              </div>
            </section>
          )}

          {etapa === 7 && feito && (
            <section className="card" style={{ borderColor: "var(--green)", padding: 32 }}>
              <Tag cor="var(--green)">{feito.tipo === "orcamento" ? "Orçamento gerado" : "Contrato gerado"}</Tag>
              <h2 className="h1" style={{ color: "var(--orange)", marginTop: 16 }}>{feito.num}</h2>
              <p className="lead" style={{ maxWidth: "62ch" }}>{feito.tipo === "orcamento" ? "O orçamento ficou registrado como pedido. Envie ao cliente; quando aprovar, o contrato nasce daqui sem redigitar nada." : "O contrato foi criado e está aguardando expedição. A separação física dos equipamentos é o próximo passo."}</p>
              <div className="row wrap" style={{ gap: 8, marginTop: 24 }}>
                {feito.tipo === "contrato" ? <button className="btn btn-primary" style={{ minHeight: 48 }} onClick={() => nav(`/app/contratos/${feito.num}`)}>Abrir contrato</button> : <button className="btn btn-primary" style={{ minHeight: 48 }} onClick={() => nav(`/app/pedidos/${feito.num}`)}>Abrir pedido</button>}
                <button className="btn btn-ghost" style={{ minHeight: 48 }} onClick={() => nav("/app")}>Voltar ao início</button>
              </div>
            </section>
          )}
        </div>

        {etapa < 7 && (
          <aside className="card" style={{ position: "sticky", top: 88 }}>
            <div className="uplabel">Resumo</div>
            <div className="stack" style={{ gap: 8, marginTop: 12, fontSize: 14 }}>
              <L r="Cliente" v={cli?.nome || "—"} />
              <L r="Destino" v={entrega === "obra" ? obraSel?.nome || "Obra não escolhida" : "Balcão"} />
              <L r="Período" v={`${d} ${d === 1 ? "diária" : "diárias"}`} />
              <L r="Itens" v={`${itens.reduce((a, i) => a + i.qtd, 0)} un.`} />
            </div>
            <div className="divider" style={{ margin: "14px 0", paddingTop: 14 }}>
              <div className="stack" style={{ gap: 8, fontSize: 14 }}>
                <L r="Locação" v={brl.format(locacao)} /><L r="Serviços e venda" v={brl.format(extras)} />
                {frete > 0 && <L r="Entrega e coleta" v={brl.format(frete)} />}
              </div>
            </div>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "baseline", paddingTop: 10, borderTop: "1px solid var(--border)" }}>
              <span style={{ fontWeight: 600 }}>Total a pagar</span>
              <span className="num" style={{ fontSize: 28, color: "var(--orange)" }}>{brl.format(total)}</span>
            </div>
            {etapa < 6 ? <button className="btn btn-primary btn-block" style={{ marginTop: 16, minHeight: 46 }} onClick={proximo}>Avançar</button> : <p className="muted" style={{ marginTop: 16, fontSize: 13 }}>Escolha uma ação de fechamento ao lado.</p>}
            {etapa > 0 && <button className="btn btn-ghost btn-block" style={{ marginTop: 8 }} onClick={() => setEtapa(etapa - 1)}>Voltar</button>}
          </aside>
        )}
      </div>
    </main>
  );
}

function L({ r, v, cor }: { r: string; v: string; cor?: string }) {
  return <div style={{ display: "flex", justifyContent: "space-between", gap: 12 }}><span className="muted">{r}</span><span style={{ textAlign: "right", color: cor }}>{v}</span></div>;
}
function Box({ r, v, cor }: { r: string; v: string; cor?: string }) {
  return <div className="card-tight"><div className="uplabel">{r}</div><div className="num" style={{ fontSize: 22, color: cor }}>{v}</div></div>;
}
function dataLocal(){const d=new Date();const off=d.getTimezoneOffset();return new Date(d.getTime()-off*60000).toISOString().slice(0,10)}
