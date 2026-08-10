export interface EquipSite {
  slug: string; nome: string; marca: string; modelo: string; categoria: string; img: string;
  energia: string; servico: string; destaque?: boolean; aplicacao: string; descricao: string;
  naoIndicado: string; specs: { label: string; valor: string }[];
  requisitos: string[]; cuidados: string[]; acessorios: string[];
}

export const DADOS: EquipSite[] = [
  {
    slug: "betoneira-menegotti-400l", nome: "Betoneira profissional 400 L", marca: "Menegotti", modelo: "Prime 400",
    categoria: "Concreto e argamassa", img: "betoneira", energia: "Elétrico", servico: "Misturar concreto", destaque: true,
    aplicacao: "Produção de concreto e argamassa em obras, reformas e serviços profissionais.",
    descricao: "Betoneira Menegotti de 400 litros com motor elétrico monofásico de 2 cv e 4 polos. Possui capacidade de mistura de 310 L e rendimento final aproximado de 270 L por ciclo.",
    naoIndicado: "Não operar em piso instável, sem aterramento ou com instalação elétrica abaixo da especificação do equipamento.",
    specs: [{ label: "Volume total", valor: "400 L" }, { label: "Capacidade de mistura", valor: "310 L" }, { label: "Motor", valor: "2 cv · 4 polos · 220 V" }, { label: "Rotação", valor: "30 rpm (60 Hz)" }, { label: "Produção horária", valor: "até 4,65 m³/h" }, { label: "Marca / modelo", valor: "Menegotti Prime 400" }],
    requisitos: ["Rede 220 V compatível com o motor", "Piso firme, plano e nivelado", "Uso de luvas, óculos e botina"],
    cuidados: ["Limpar a cuba após cada uso", "Nunca introduzir ferramentas com a cuba em movimento", "Não remover proteções de segurança"],
    acessorios: ["Kit elétrico e proteções de segurança"]
  },
  {
    slug: "martelete-sds-plus-1500w", nome: "Martelete rompedor SDS Plus 1.500 W", marca: "Não informada", modelo: "SDS Plus 5 kg",
    categoria: "Demolição e perfuração", img: "martelete", energia: "Elétrico", servico: "Quebrar concreto", destaque: true,
    aplicacao: "Perfuração e rompimento de concreto, alvenaria, pisos e abertura de rasgos.",
    descricao: "Martelete perfurador e rompedor elétrico de 1.500 W, classe de 5 kg, com encaixe SDS Plus e alimentação 220 V. A marca e o código exato não constam na relação da loja.",
    naoIndicado: "Não indicado para demolição estrutural sem avaliação técnica nem para uso como alavanca.",
    specs: [{ label: "Potência", valor: "1.500 W" }, { label: "Classe de peso", valor: "5 kg" }, { label: "Encaixe", valor: "SDS Plus" }, { label: "Tensão", valor: "220 V" }],
    requisitos: ["Tomada 220 V", "Broca ou cinzel SDS Plus adequado", "Óculos, luvas e proteção auricular"],
    cuidados: ["Não aplicar esforço lateral", "Fazer pausas em uso prolongado", "Desligar antes de trocar acessórios"],
    acessorios: ["Consulte ponteiros, talhadeiras e brocas disponíveis"]
  },
  {
    slug: "martelete-bosch-gbh-2-24-d", nome: "Martelete perfurador rompedor Bosch", marca: "Bosch Professional", modelo: "GBH 2-24 D",
    categoria: "Demolição e perfuração", img: "martelete", energia: "Elétrico", servico: "Perfurar concreto", destaque: true,
    aplicacao: "Perfurações em concreto, metal e madeira, além de cinzelamento leve.",
    descricao: "Modelo profissional compacto com 820 W, energia de impacto de 2,7 J, encaixe SDS Plus, velocidade variável, Vario-Lock e embreagem de segurança.",
    naoIndicado: "Não substitui um rompedor pesado em demolições extensas ou concreto estrutural de grande espessura.",
    specs: [{ label: "Potência", valor: "820 W" }, { label: "Impacto", valor: "2,7 J" }, { label: "Impactos", valor: "0–5.100 ipm" }, { label: "Perfuração em concreto", valor: "4–24 mm" }, { label: "Peso", valor: "2,8 kg" }, { label: "Encaixe", valor: "SDS Plus" }],
    requisitos: ["Rede 220 V", "Acessório SDS Plus compatível", "Óculos e proteção auricular"],
    cuidados: ["Usar a empunhadeira auxiliar", "Não bloquear as entradas de ventilação", "Não utilizar o equipamento como alavanca"],
    acessorios: ["Empunhadeira auxiliar", "Limitador de profundidade", "Consulte acessórios disponíveis"]
  },
  {
    slug: "martelo-demolidor-dewalt-d25901", nome: "Martelo demolidor DeWalt 11 kg", marca: "DeWalt", modelo: "D25901",
    categoria: "Demolição", img: "martelete", energia: "Elétrico", servico: "Demolição pesada", destaque: true,
    aplicacao: "Demolição pesada de pisos, concreto, bases, alvenaria e abertura de canaletas.",
    descricao: "Martelo demolidor DeWalt D25901 de 1.500 W, classe de 11 kg e alimentação 220 V, indicado para serviços intensos de demolição.",
    naoIndicado: "Não indicado para perfuração rotativa, serviços delicados ou operação em altura sem controle e proteção adequados.",
    specs: [{ label: "Potência", valor: "1.500 W" }, { label: "Classe de peso", valor: "11 kg" }, { label: "Modelo", valor: "D25901" }, { label: "Tensão", valor: "220 V" }],
    requisitos: ["Rede 220 V dimensionada", "Área de trabalho isolada", "EPI completo, incluindo proteção auditiva e ocular"],
    cuidados: ["Não usar como alavanca", "Manter postura estável durante a operação", "Interromper o uso em caso de aquecimento anormal"],
    acessorios: ["Consulte ponteiro e talhadeira disponíveis"]
  },
  {
    slug: "serra-marmore-dewalt-dw862", nome: "Serra mármore DeWalt 1.400 W", marca: "DeWalt", modelo: "DW862",
    categoria: "Corte", img: "cortadora", energia: "Elétrico", servico: "Cortar revestimentos", destaque: true,
    aplicacao: "Cortes em cerâmica, porcelanato, mármore, granito, telhas e materiais de construção compatíveis.",
    descricao: "Serra mármore DeWalt DW862 de 1.400 W e 220 V, compacta e indicada para cortes profissionais com disco diamantado compatível.",
    naoIndicado: "Não usar em madeira, metal ou com discos incompatíveis. O material e o tipo de corte devem corresponder ao disco instalado.",
    specs: [{ label: "Potência", valor: "1.400 W" }, { label: "Modelo", valor: "DW862" }, { label: "Tensão", valor: "220 V" }, { label: "Rotação sem carga", valor: "13.000 rpm" }, { label: "Disco", valor: "até 125 mm" }, { label: "Corte máximo", valor: "aprox. 38 mm" }],
    requisitos: ["Rede 220 V", "Disco diamantado correto para o material", "Óculos, máscara e proteção auricular"],
    cuidados: ["Não forçar lateralmente o disco", "Aguardar o disco parar antes de apoiar a máquina", "Desligar da tomada antes de trocar o disco"],
    acessorios: ["Consulte disco e chaves disponíveis"]
  }
];

export const FAQ = [
  { home: true, q: "Como faço para alugar um equipamento?", a: "Escolha um item do catálogo e fale com a LOCAGO pelo WhatsApp. A equipe confirma disponibilidade, período, valores, retirada ou entrega e os documentos necessários." },
  { home: true, q: "Como consulto preço e disponibilidade?", a: "A consulta é feita pelo WhatsApp. Ao abrir o contato a partir de um equipamento, a mensagem já identifica o item de interesse." },
  { home: true, q: "Vocês entregam na obra?", a: "Consulte pelo WhatsApp informando o endereço da obra. A equipe confirma a região atendida, o prazo e o valor do transporte." },
  { home: true, q: "Quais documentos são necessários?", a: "Os documentos e as condições variam conforme a locação. Nossa equipe informa tudo antes da contratação." },
  { q: "Os equipamentos são revisados antes da entrega?", a: "Sim. Os equipamentos passam por conferência e teste antes de sair para a obra." },
  { q: "Não sei qual equipamento preciso. Vocês orientam?", a: "Sim. Explique o serviço pelo WhatsApp e nossa equipe ajuda a escolher o equipamento adequado." },
  { q: "Posso estender o período da locação?", a: "Fale conosco antes do fim do prazo. A prorrogação depende da disponibilidade do equipamento." }
];

export const CATEGORIAS = [...new Set(DADOS.map((e) => e.categoria))];
export const SERVICOS = [...new Set(DADOS.map((e) => e.servico))];
export const ENERGIAS = [...new Set(DADOS.map((e) => e.energia))];
