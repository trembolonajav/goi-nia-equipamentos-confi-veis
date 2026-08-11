import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useStore } from "../data/store";
import { useToast } from "../components/ui";
import { atendimentoApi } from "../lib/api";

export default function ClienteForm() {
  const { addCliente, clientes } = useStore();
  const { toast } = useToast();
  const nav = useNavigate();

  const [tipo, setTipo] = useState("Pessoa física");
  const [nome, setNome] = useState("");
  const [doc, setDoc] = useState("");
  const [tel, setTel] = useState("");
  const [email, setEmail] = useState("");
  const [cep,setCep]=useState(""),[logradouro,setLogradouro]=useState(""),[numeroEndereco,setNumeroEndereco]=useState(""),[complemento,setComplemento]=useState(""),[bairro,setBairro]=useState(""),[cidade,setCidade]=useState(""),[uf,setUf]=useState(""),[quadra,setQuadra]=useState(""),[lote,setLote]=useState("");
  const [buscandoCep,setBuscandoCep]=useState(false);
  const [condicao, setCondicao] = useState("Pagamento à vista");
  const [obs, setObs] = useState("");
  const [erro, setErro] = useState("");
  const [anexos, setAnexos] = useState<{ tipo: string; arquivo: File }[]>([]);

  const pj = tipo === "Pessoa jurídica";

  async function salvar() {
    setErro("");
    if (!nome.trim()) return setErro("Informe o nome do cliente.");
    if (!doc.trim()) return setErro("Informe o CPF ou CNPJ.");
    if (!(pj ? cnpjValido(doc) : cpfValido(doc))) return setErro(`${pj ? "CNPJ" : "CPF"} inválido. Confira os números informados.`);
    if (!tel.trim()) return setErro("Informe o telefone com DDD.");
    if (![10, 11].includes(tel.replace(/\D/g, "").length)) return setErro("Informe um telefone válido com DDD.");
    if (!/^\S+@\S+\.\S+$/.test(email)) return setErro("Informe um e-mail válido.");
    if(cep.replace(/\D/g,"").length!==8)return setErro("Informe um CEP válido.");
    if(logradouro.trim().length<3||!numeroEndereco.trim()||bairro.trim().length<2||cidade.trim().length<2||uf.trim().length!==2)return setErro("Preencha logradouro, número, bairro, cidade e UF.");
    const endereco=formatarEndereco({logradouro,numeroEndereco,complemento,bairro,cidade,uf,cep,quadra,lote});
    const limpo = pj ? doc.toUpperCase().replace(/[^A-Z0-9]/g,"") : doc.replace(/\D/g, "");
    if (limpo && clientes.some((c) => c.doc.replace(/\D/g, "") === limpo && limpo.length > 4)) return setErro("Já existe um cliente com esse documento. Documento duplicado é bloqueado.");
    try {
      const c = await addCliente({
        tipo, tipoPessoa:pj?"PJ":"PF", nome: nome.trim(), nomeRazaoSocial:nome.trim(), cpfCnpj:limpo, doc: (pj ? "CNPJ " : "CPF ") + doc.trim(), tel: tel.trim(), telefone:tel.trim(), whatsapp:tel.trim(), email: email.trim(),
        situacao: "Ativo", condicao, endereco,cep,logradouro,numeroEndereco,complemento,bairro,cidade,uf:uf.toUpperCase(),quadra,lote, obs: obs.trim(), resp: "O próprio",
        docs: anexos.map((a) => ({ nome: a.tipo, ok: true })),
      });
      for (const anexo of anexos) await atendimentoApi.anexarDocumento(c.id, anexo.tipo, anexo.arquivo);
      toast(`Cliente ${c.nome} cadastrado.`);
      nav(`/app/clientes/${c.id}`);
    } catch (e) { setErro(e instanceof Error ? e.message : "Não foi possível salvar no servidor."); }
  }

  return (
    <main className="page" style={{ maxWidth: 920 }}>
      <button className="link-back" onClick={() => nav("/app/clientes")}>← Clientes</button>
      <h1 className="h1" style={{ marginTop: 12 }}>Cadastro de cliente</h1>
      <p className="lead">CPF ou CNPJ duplicado é bloqueado. Cadastro rápido agora, documentos complementares depois.</p>

      <div className="stack" style={{ gap: 20, marginTop: 24 }}>
        <section className="card">
          <h2 className="h2" style={{ marginBottom: 14 }}>Identificação</h2>
          <div className="row wrap" style={{ gap: 8 }}>
            <button className={`chip${!pj ? " on" : ""}`} onClick={() => setTipo("Pessoa física")}>Pessoa física</button>
            <button className={`chip${pj ? " on" : ""}`} onClick={() => setTipo("Pessoa jurídica")}>Pessoa jurídica</button>
          </div>
          <div className="grid" style={{ gridTemplateColumns: "1fr 1fr", marginTop: 16 }}>
            <label className="field"><span>{pj ? "Razão social" : "Nome completo"}</span><input className="input" value={nome} onChange={(e) => setNome(e.target.value)} /></label>
            <label className="field"><span>{pj ? "CNPJ" : "CPF"}</span><input className="input" inputMode="numeric" maxLength={pj ? 18 : 14} value={doc} onChange={(e) => setDoc(formatarDocumento(e.target.value, pj))} placeholder={pj ? "00.000.000/0000-00" : "000.000.000-00"} /></label>
          </div>
        </section>

        <section className="card">
          <h2 className="h2" style={{ marginBottom: 14 }}>Contato e endereço</h2>
          <div className="grid" style={{ gridTemplateColumns: "1fr 1fr" }}>
            <label className="field"><span>Celular / WhatsApp</span><input className="input" inputMode="tel" maxLength={15} value={tel} onChange={(e) => setTel(formatarTelefone(e.target.value))} placeholder="(62) 99999-9999" /></label>
            <label className="field"><span>E-mail</span><input className="input" type="email" value={email} onChange={(e) => setEmail(e.target.value)} placeholder="cliente@exemplo.com.br" /></label>
            <label className="field"><span>CEP</span><input className="input" inputMode="numeric" maxLength={9} value={cep} onChange={e=>setCep(formatarCep(e.target.value))} onBlur={async()=>{const n=cep.replace(/\D/g,"");if(n.length!==8)return;setBuscandoCep(true);try{const r=await fetch(`https://viacep.com.br/ws/${n}/json/`),d=await r.json();if(!d.erro){setLogradouro(d.logradouro||"");setBairro(d.bairro||"");setCidade(d.localidade||"");setUf(d.uf||"")}}catch{/* preenchimento manual */}finally{setBuscandoCep(false)}}} placeholder="74000-000"/><small className="field-help">{buscandoCep?"Consultando CEP...":"Preenchimento automático pelo CEP"}</small></label>
            <label className="field"><span>Logradouro</span><input className="input" value={logradouro} onChange={e=>setLogradouro(e.target.value)} placeholder="Rua T-30"/></label>
            <label className="field"><span>Número</span><input className="input" value={numeroEndereco} onChange={e=>setNumeroEndereco(e.target.value)} placeholder="123"/></label>
            <label className="field"><span>Complemento</span><input className="input" value={complemento} onChange={e=>setComplemento(e.target.value)} placeholder="Sala 02 / Apto / Galpão"/></label>
            <label className="field"><span>Bairro</span><input className="input" value={bairro} onChange={e=>setBairro(e.target.value)} placeholder="Setor Bueno"/></label>
            <label className="field"><span>Cidade</span><input className="input" value={cidade} onChange={e=>setCidade(e.target.value)} placeholder="Goiânia"/></label>
            <label className="field"><span>UF</span><input className="input" maxLength={2} value={uf} onChange={e=>setUf(e.target.value.replace(/[^a-z]/gi,"").toUpperCase())} placeholder="GO"/></label>
            <div className="grid address-go-fields"><label className="field"><span>Quadra (opcional)</span><input className="input" value={quadra} onChange={e=>setQuadra(e.target.value)} placeholder="Qd. 15"/></label><label className="field"><span>Lote (opcional)</span><input className="input" value={lote} onChange={e=>setLote(e.target.value)} placeholder="Lt. 08"/></label></div>
          </div>
        </section>

        <section className="card">
          <h2 className="h2" style={{ marginBottom: 4 }}>Documentos digitalizados</h2>
          <p className="section-note">Anexe PDF, JPG ou PNG de até 10 MB. Para pessoa física: RG ou CNH e comprovante de endereço. Para pessoa jurídica: contrato social, cartão CNPJ e documentos do responsável.</p>
          <label className="document-upload">
            <input type="file" multiple accept="application/pdf,image/jpeg,image/png" onChange={(e) => { const novos=Array.from(e.target.files||[]).map((arquivo)=>({tipo:pj?"Contrato social":"RG / CNH",arquivo}));setAnexos((a)=>[...a,...novos]);e.currentTarget.value=""; }} />
            <span className="document-upload-icon" aria-hidden="true">↑</span>
            <span className="document-upload-copy"><strong>Selecionar documentos</strong><small>PDF, JPG ou PNG · máximo de 10 MB por arquivo</small></span>
            <span className="btn btn-ghost document-upload-button">Procurar arquivos</span>
          </label>
          {anexos.length > 0 && <div className="document-list">
            <div className="document-list-heading"><span>{anexos.length} {anexos.length === 1 ? "arquivo selecionado" : "arquivos selecionados"}</span><button type="button" onClick={() => setAnexos([])}>Remover todos</button></div>
            {anexos.map((a,i)=><div className="document-row" key={`${a.arquivo.name}-${i}`}>
              <span className="document-file-icon" aria-hidden="true">{a.arquivo.type === "application/pdf" ? "PDF" : "IMG"}</span>
              <span className="document-file-data"><strong title={a.arquivo.name}>{a.arquivo.name}</strong><small>{(a.arquivo.size/1024/1024).toFixed(2)} MB</small></span>
              <select className="select" aria-label={`Tipo do documento ${a.arquivo.name}`} value={a.tipo} onChange={(e)=>setAnexos((at)=>at.map((x,j)=>j===i?{...x,tipo:e.target.value}:x))}>{(pj?["Contrato social","Cartão CNPJ","Documento do responsável","Comprovante de endereço","Outro"]:["RG / CNH","Comprovante de endereço","CPF","Outro"]).map(t=><option key={t}>{t}</option>)}</select>
              <button type="button" className="document-remove" aria-label={`Remover ${a.arquivo.name}`} onClick={()=>setAnexos((at)=>at.filter((_,j)=>j!==i))}>×</button>
            </div>)}
          </div>}
        </section>

        <section className="card">
          <h2 className="h2" style={{ marginBottom: 4 }}>Condição comercial</h2>
          <p className="section-note">Faturado exige aprovação. Sem aprovação, o cliente entra como pagamento à vista e a locação sai normalmente.</p>
          <div className="grid" style={{ gridTemplateColumns: "1fr 1fr" }}>
            <label className="field"><span>Condição de pagamento</span>
              <select className="select" value={condicao} onChange={(e) => setCondicao(e.target.value)}>
                <option>Pagamento à vista</option><option>Faturado 15 dias</option><option>Faturado 30 dias</option>
              </select>
            </label>
            <label className="field" style={{ gridColumn: "1 / -1" }}><span>Observações do atendimento</span><textarea className="textarea" value={obs} onChange={(e) => setObs(e.target.value)} /></label>
          </div>
        </section>

        {erro && <div className="card-tight" style={{ borderColor: "var(--red)", color: "var(--red)", fontWeight: 600 }}>{erro}</div>}
        <div className="row wrap" style={{ gap: 8 }}>
          <button className="btn btn-primary" style={{ minHeight: 48 }} onClick={salvar}>Salvar cliente</button>
          <button className="btn btn-ghost" style={{ minHeight: 48 }} onClick={() => nav("/app/clientes")}>Cancelar</button>
        </div>
      </div>
    </main>
  );
}

function formatarDocumento(valor:string,pj:boolean){if(pj)return valor.toUpperCase().replace(/[^A-Z0-9]/g,"").slice(0,14);const n=valor.replace(/\D/g,"").slice(0,11);return n.replace(/^(\d{3})(\d)/,"$1.$2").replace(/^(\d{3})\.(\d{3})(\d)/,"$1.$2.$3").replace(/(\d{3})(\d{1,2})$/,"$1-$2")}
function formatarTelefone(valor:string){const n=valor.replace(/\D/g,"").slice(0,11);return n.replace(/^(\d{2})(\d)/,"($1) $2").replace(/(\d{5})(\d{4})$/,"$1-$2").replace(/(\d{4})(\d{4})$/,"$1-$2")}
function formatarCep(valor:string){return valor.replace(/\D/g,"").slice(0,8).replace(/(\d{5})(\d)/,"$1-$2")}
function formatarEndereco(e:{logradouro:string;numeroEndereco:string;complemento:string;bairro:string;cidade:string;uf:string;cep:string;quadra:string;lote:string}){return [e.logradouro.trim()+", "+e.numeroEndereco.trim(),e.complemento.trim(),[e.quadra.trim(),e.lote.trim()].filter(Boolean).join(" "),e.bairro.trim(),`${e.cidade.trim()}/${e.uf.trim().toUpperCase()}`,`CEP ${e.cep}`].filter(Boolean).join(" · ")}
function cpfValido(valor:string){const n=valor.replace(/\D/g,"");if(n.length!==11||/^(\d)\1+$/.test(n))return false;const dv=(len:number,peso:number)=>{let soma=0;for(let i=0;i<len;i++)soma+=Number(n[i])*(peso-i);const resto=11-soma%11;return resto>=10?0:resto};return dv(9,10)===Number(n[9])&&dv(10,11)===Number(n[10])}
function cnpjValido(valor:string){const n=valor.toUpperCase().replace(/[^A-Z0-9]/g,"");if(n.length!==14||!/^[A-Z0-9]{12}\d{2}$/.test(n)||/^(.)\1+$/.test(n))return false;const valorCaractere=(c:string)=>c.charCodeAt(0)-48;const dv=(base:string,pesos:number[])=>{const soma=pesos.reduce((total,peso,i)=>total+valorCaractere(base[i])*peso,0);const resto=soma%11;return resto<2?0:11-resto};const d1=dv(n.slice(0,12),[5,4,3,2,9,8,7,6,5,4,3,2]);const d2=dv(n.slice(0,12)+d1,[6,5,4,3,2,9,8,7,6,5,4,3,2]);return d1===Number(n[12])&&d2===Number(n[13])}
